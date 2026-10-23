// Package feeds は Zenn と note の RSS を取得し、記事一覧に変換する。
//
// サイトは静的に書き出すので、ここはビルドのたびに1回だけ動く。
// 取得に失敗したら記事0件で続けるのではなく、エラーを返してビルドを止める。
// 止まれば前回のデプロイがそのまま残るので、「記事一覧が空のページ」が公開されることはない。
package feeds

import (
	"context"
	"encoding/xml"
	"fmt"
	"io"
	"net/http"
	"slices"
	"strings"
	"sync"
	"time"
)

// Source は記事の出どころ。
type Source string

const (
	Zenn Source = "zenn"
	Note Source = "note"
)

// Label は画面に出す出どころの名前。
func (s Source) Label() string {
	if s == Zenn {
		return "Zenn"
	}
	return "note"
}

// Article は一覧に出す1記事。
type Article struct {
	Title       string
	URL         string
	PublishedAt time.Time
	Source      Source
	// Thumbnail は OGP 画像の URL。フィードに無ければ空。
	Thumbnail string
}

// Feed は取得元の定義。
type Feed struct {
	Source Source
	URL    string
}

// Feeds はこのサイトが読むフィード。並び順が画面での並び(Zenn → note)になる。
var Feeds = []Feed{
	{Source: Zenn, URL: "https://zenn.dev/imu_imu/feed"},
	{Source: Note, URL: "https://note.com/imutaroh/rss"},
}

// Grouped は出どころごとの記事一覧。各一覧は新しい順に並んでいる。
type Grouped map[Source][]Article

// All は全出どころの記事を1本にまとめ、新しい順に並べて返す。
func (g Grouped) All() []Article {
	var all []Article
	for _, f := range Feeds {
		all = append(all, g[f.Source]...)
	}
	sortNewestFirst(all)
	return all
}

// FetchAll はこのサイトのフィード(Feeds)をすべて取得する。
func FetchAll(ctx context.Context, client *http.Client) (Grouped, error) {
	return Fetch(ctx, client, Feeds)
}

// Fetch は渡されたフィードを並行に取得する。
// 1本でも失敗したらエラーを返す(どのフィードで失敗したかを含める)。
func Fetch(ctx context.Context, client *http.Client, feeds []Feed) (Grouped, error) {
	type result struct {
		articles []Article
		err      error
	}
	results := make([]result, len(feeds))

	// フィードは互いに依存しないので、同時に取りに行く。
	// WaitGroup.Go(Go 1.25〜)は「Add(1) して goroutine を起動し、終わったら Done」をまとめたもの。
	// 各 goroutine は results の自分の添字にだけ書くので、ロックは要らない
	var wg sync.WaitGroup
	for i, f := range feeds {
		wg.Go(func() {
			articles, err := fetch(ctx, client, f)
			results[i] = result{articles, err}
		})
	}
	wg.Wait()

	grouped := Grouped{}
	var errs []string
	for i, f := range feeds {
		if results[i].err != nil {
			errs = append(errs, fmt.Sprintf("%s: %v", f.Source, results[i].err))
			continue
		}
		grouped[f.Source] = results[i].articles
	}
	if len(errs) > 0 {
		return grouped, fmt.Errorf("フィードを取得できませんでした: %s", strings.Join(errs, "; "))
	}
	return grouped, nil
}

func fetch(ctx context.Context, client *http.Client, f Feed) ([]Article, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, f.URL, nil)
	if err != nil {
		return nil, err
	}
	// 既定の Go の User-Agent はボット対策で弾かれることがあるので、名乗っておく
	req.Header.Set("User-Agent", "imutaro.com site builder (+https://imutaro.com)")

	res, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("HTTP %d", res.StatusCode)
	}
	return Parse(res.Body, f.Source)
}

// rss は RSS 2.0 のうち、このサイトが使う要素だけを写した型。
// encoding/xml は、タグに書いた名前の要素だけを拾い、それ以外は読み飛ばす。
type rss struct {
	Items []struct {
		Title   string `xml:"title"`
		Link    string `xml:"link"`
		PubDate string `xml:"pubDate"`
		// Zenn は OGP 画像を enclosure の url 属性に入れている
		Enclosure struct {
			URL string `xml:"url,attr"`
		} `xml:"enclosure"`
		// note は media:thumbnail を使う。名前空間は URL で指定する
		// (接頭辞の "media" は文書ごとに変えられるので、当てにしない)
		Thumbnail string `xml:"http://search.yahoo.com/mrss/ thumbnail"`
	} `xml:"channel>item"`
}

// Parse は RSS 2.0 の本文を記事一覧に変換し、新しい順に並べて返す。
// タイトルか URL の無い項目は捨てる。
func Parse(r io.Reader, source Source) ([]Article, error) {
	var doc rss
	if err := xml.NewDecoder(r).Decode(&doc); err != nil {
		return nil, fmt.Errorf("RSS を解析できません: %w", err)
	}

	articles := make([]Article, 0, len(doc.Items))
	for _, it := range doc.Items {
		title := strings.TrimSpace(it.Title)
		url := strings.TrimSpace(it.Link)
		if title == "" || url == "" {
			continue
		}
		published, err := parsePubDate(strings.TrimSpace(it.PubDate))
		if err != nil {
			return nil, fmt.Errorf("%q の日付: %w", title, err)
		}
		thumb := strings.TrimSpace(it.Thumbnail)
		if thumb == "" {
			thumb = strings.TrimSpace(it.Enclosure.URL)
		}
		articles = append(articles, Article{
			Title:       title,
			URL:         url,
			PublishedAt: published,
			Source:      source,
			Thumbnail:   thumb,
		})
	}
	sortNewestFirst(articles)
	return articles, nil
}

// RSS の pubDate は RFC 822 系の書式。note は "+0900"、Zenn は "GMT" で時差を書く。
var pubDateLayouts = []string{
	time.RFC1123Z, // Mon, 02 Jan 2006 15:04:05 -0700
	time.RFC1123,  // Mon, 02 Jan 2006 15:04:05 MST(GMT もここで読める)
}

func parsePubDate(s string) (time.Time, error) {
	for _, layout := range pubDateLayouts {
		if t, err := time.Parse(layout, s); err == nil {
			return t, nil
		}
	}
	return time.Time{}, fmt.Errorf("読めない書式です: %q", s)
}

func sortNewestFirst(articles []Article) {
	slices.SortStableFunc(articles, func(a, b Article) int {
		return b.PublishedAt.Compare(a.PublishedAt)
	})
}
