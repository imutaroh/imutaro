package feeds

import (
	"context"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"
	"time"
)

// testdata の XML は、2026-10-23 に本物のフィードから保存したもの。

func parseFile(t *testing.T, name string, source Source) []Article {
	t.Helper()
	f, err := os.Open("testdata/" + name)
	if err != nil {
		t.Fatal(err)
	}
	defer f.Close()
	articles, err := Parse(f, source)
	if err != nil {
		t.Fatalf("Parse(%s): %v", name, err)
	}
	return articles
}

func TestParseZenn(t *testing.T) {
	articles := parseFile(t, "zenn.xml", Zenn)

	if len(articles) != 12 {
		t.Fatalf("記事数 = %d, want 12", len(articles))
	}
	first := articles[0]
	if !strings.Contains(first.Title, "diffbase.nvim") {
		t.Errorf("先頭の記事 = %q, diffbase.nvim の記事を期待", first.Title)
	}
	if first.URL != "https://zenn.dev/imu_imu/articles/diffbase-nvim-pr-diff-in-editor" {
		t.Errorf("URL = %q", first.URL)
	}
	// "Wed, 07 Oct 2026 12:03:28 GMT"
	want := time.Date(2026, 10, 7, 12, 3, 28, 0, time.UTC)
	if !first.PublishedAt.Equal(want) {
		t.Errorf("PublishedAt = %v, want %v", first.PublishedAt, want)
	}
	// Zenn のサムネイルは enclosure の url 属性から取る
	if !strings.HasPrefix(first.Thumbnail, "https://res.cloudinary.com/zenn/") {
		t.Errorf("Thumbnail = %q", first.Thumbnail)
	}
	assertNewestFirst(t, articles)
}

func TestParseNote(t *testing.T) {
	articles := parseFile(t, "note.xml", Note)

	if len(articles) != 5 {
		t.Fatalf("記事数 = %d, want 5", len(articles))
	}
	first := articles[0]
	if first.URL != "https://note.com/imutaroh/n/n44957b31414f" {
		t.Errorf("URL = %q", first.URL)
	}
	// "Mon, 12 Oct 2026 19:21:54 +0900"
	want := time.Date(2026, 10, 12, 10, 21, 54, 0, time.UTC)
	if !first.PublishedAt.Equal(want) {
		t.Errorf("PublishedAt = %v, want %v", first.PublishedAt, want)
	}
	// note のサムネイルは media:thumbnail(名前空間付きの要素)から取る
	if !strings.HasPrefix(first.Thumbnail, "https://assets.st-note.com/") {
		t.Errorf("Thumbnail = %q", first.Thumbnail)
	}
	assertNewestFirst(t, articles)
}

func TestParseSkipsItemsWithoutTitleOrLink(t *testing.T) {
	xmlBody := `<rss><channel>
		<item><title>ok</title><link>https://example.com/a</link><pubDate>Mon, 12 Oct 2026 19:21:54 +0900</pubDate></item>
		<item><title></title><link>https://example.com/b</link><pubDate>Mon, 12 Oct 2026 19:21:54 +0900</pubDate></item>
		<item><title>no link</title><pubDate>Mon, 12 Oct 2026 19:21:54 +0900</pubDate></item>
	</channel></rss>`
	articles, err := Parse(strings.NewReader(xmlBody), Note)
	if err != nil {
		t.Fatal(err)
	}
	if len(articles) != 1 || articles[0].Title != "ok" {
		t.Errorf("articles = %+v, want only \"ok\"", articles)
	}
}

func TestParseRejectsUnknownDate(t *testing.T) {
	xmlBody := `<rss><channel><item><title>a</title><link>https://example.com/a</link><pubDate>2026-10-12</pubDate></item></channel></rss>`
	if _, err := Parse(strings.NewReader(xmlBody), Note); err == nil {
		t.Error("読めない日付でもエラーにならなかった")
	}
}

func TestFetchFailsWhenAnyFeedFails(t *testing.T) {
	ok := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "testdata/zenn.xml")
	}))
	defer ok.Close()
	broken := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.Error(w, "down", http.StatusServiceUnavailable)
	}))
	defer broken.Close()

	feeds := []Feed{{Source: Zenn, URL: ok.URL}, {Source: Note, URL: broken.URL}}
	grouped, err := Fetch(context.Background(), ok.Client(), feeds)
	if err == nil {
		t.Fatal("片方が 503 でもエラーにならなかった")
	}
	if !strings.Contains(err.Error(), "note") {
		t.Errorf("エラーに失敗したフィード名が無い: %v", err)
	}
	// 成功した側の結果は返す(呼び出し側が -allow-empty-feeds のときに使う)
	if len(grouped[Zenn]) != 12 {
		t.Errorf("成功した Zenn の記事数 = %d, want 12", len(grouped[Zenn]))
	}
}

func TestGroupedAllIsNewestFirst(t *testing.T) {
	g := Grouped{
		Zenn: parseFile(t, "zenn.xml", Zenn),
		Note: parseFile(t, "note.xml", Note),
	}
	all := g.All()
	if len(all) != 17 {
		t.Fatalf("合計 = %d, want 17", len(all))
	}
	assertNewestFirst(t, all)
}

func assertNewestFirst(t *testing.T, articles []Article) {
	t.Helper()
	for i := 1; i < len(articles); i++ {
		if articles[i].PublishedAt.After(articles[i-1].PublishedAt) {
			t.Fatalf("新しい順になっていない: [%d] %v が [%d] %v より新しい",
				i, articles[i].PublishedAt, i-1, articles[i-1].PublishedAt)
		}
	}
}
