package site

import (
	"fmt"
	"strings"

	"github.com/imutaroh/imutaro/internal/feeds"
	"github.com/imutaroh/imutaro/internal/profile"
)

// SiteName は下層ページのタイトル接尾辞(「Apps | imutaro.com」)とフッターの © に使う。
const SiteName = "imutaro.com"

// トップページの <title> と説明文。検索結果ではドメインがタイトルの上に別に出るため、
// ここでドメインを繰り返さず「誰の・何のサイトか」に枠を使う。
// 「新卒」は年を書かないと翌年から嘘になるため、2026 を明示して固定する。
const (
	siteTitle       = "imutaro — データエンジニアの学習記録"
	siteDescription = "2026年新卒のデータエンジニアが、データ基盤とAI活用の学びを日々記録していくサイト"
)

// lpArticlesPerSource は LP の 05 に出す件数。記事カードのグリッドは3列なので、6件で2行に揃う。
const lpArticlesPerSource = 6

// Meta は <head> に出すページの情報。
type Meta struct {
	// Title は <title> の全文。og:title / twitter:title にも同じものを使う。
	Title       string
	Description string
	// Path は canonical のパス("/" や "/apps")。
	Path string
	// NoIndex は検索エンジンに載せないページ(404)。
	NoIndex bool
}

// CanonicalURL は正規の URL を返す。トップは末尾のスラッシュを付けない(これまでの本番と同じ形)。
func (m Meta) CanonicalURL() string {
	if m.Path == "/" {
		return SiteURL
	}
	return SiteURL + m.Path
}

// Page は書き出す1ページ。
type Page struct {
	// File は dist/ の中の書き出し先("apps.html" なら /apps で配信される)。
	File string
	// Template は web/templates/pages/ のファイル名。
	Template string
	Meta     Meta
	// Header / Footer はサイト共通のヘッダー・フッターを出すか。
	// /card と /apps は1画面で完結させるので、どちらも持たない。
	Header bool
	Footer bool
	// HeroHold は LP の入場アニメをフォントの到着まで止めておく仕組みを入れるか。
	HeroHold bool
	// Scripts はページの末尾で読み込む JS(web/js/ のファイル名)。
	Scripts []string
	Data    any
}

func subTitle(name string) string {
	return fmt.Sprintf("%s | %s", name, SiteName)
}

// TitleLine はヒーロー見出しの1行。1文字ずつ span にして、JS が末尾から消して打ち直す。
type TitleLine struct {
	Chars []string
	// Last はカーソルを置く最終行か。
	Last bool
}

// AboutLine は profile.json カードの1行。最後の行だけ末尾のカンマを付けない。
type AboutLine struct {
	Key, Value string
	Last       bool
}

// LPData はトップページの中身。
type LPData struct {
	// Title は見出しの全文(読み上げ用の aria-label)。
	Title         string
	TitleLines    []TitleLine
	About         []AboutLine
	Log           []profile.LogEntry
	Stack         []profile.StackEntry
	Apps          []profile.DockApp
	Zenn          []feeds.Article
	Note          []feeds.Article
	Contacts      []profile.Link
	ContactNumber string
}

// HasArticles は 05 の記事セクションを出すかどうか。
func (d LPData) HasArticles() bool {
	return len(d.Zenn)+len(d.Note) > 0
}

// CardData は /card の中身。
type CardData struct {
	Facts   []profile.Fact
	Stack   []profile.StackEntry
	QRLabel string
}

// WritingsTab は /writings の絞り込みタブ。
type WritingsTab struct {
	Label  string
	Href   string
	Active bool
}

// WritingsData は /writings(と /writings/zenn・/writings/note)の中身。
type WritingsData struct {
	// Source は "all" / "zenn" / "note"。
	Source    string
	Tabs      []WritingsTab
	Articles  []feeds.Article
	Total     int
	ZennCount int
	NoteCount int
}

func pages(opts Options) []Page {
	all := opts.Feeds.All()
	zenn := opts.Feeds[feeds.Zenn]
	note := opts.Feeds[feeds.Note]

	// 見出しは2行に固定する(1行目「周りの価値を、」2行目「最大化するエンジニアへ」)。
	// 2行目の11文字がどの画面幅でも折り返さないよう、文字の大きさは CSS の式で決めている
	titleLines := []string{"周りの価値を、", "最大化するエンジニアへ"}
	lp := LPData{
		Title:    strings.Join(titleLines, ""),
		Log:      profile.Log,
		Stack:    profile.Stack,
		Apps:     profile.DockApps,
		Zenn:     firstN(zenn, lpArticlesPerSource),
		Note:     firstN(note, lpArticlesPerSource),
		Contacts: profile.Contacts,
	}
	for i, line := range titleLines {
		lp.TitleLines = append(lp.TitleLines, TitleLine{
			Chars: strings.Split(line, ""),
			Last:  i == len(titleLines)-1,
		})
	}
	for i, f := range profile.AboutFields {
		lp.About = append(lp.About, AboutLine{Key: f.Key, Value: f.Value, Last: i == len(profile.AboutFields)-1})
	}
	// 記事セクション(05)が無い回は、Contact の番号を1つ繰り上げる
	lp.ContactNumber = "05"
	if lp.HasArticles() {
		lp.ContactNumber = "06"
	}

	writings := func(source string, articles []feeds.Article) WritingsData {
		tabs := []WritingsTab{
			{Label: "すべて", Href: "/writings"},
			{Label: "Zenn", Href: "/writings/zenn"},
			{Label: "note", Href: "/writings/note"},
		}
		for i := range tabs {
			tabs[i].Active = tabs[i].Href == writingsPath(source)
		}
		return WritingsData{
			Source:    source,
			Tabs:      tabs,
			Articles:  articles,
			Total:     len(all),
			ZennCount: len(zenn),
			NoteCount: len(note),
		}
	}

	return []Page{
		{
			File:     "index.html",
			Template: "index.html",
			Meta:     Meta{Title: siteTitle, Description: siteDescription, Path: "/"},
			Header:   true,
			Footer:   true,
			HeroHold: true,
			Scripts:  []string{"hero.js", "spark.js"},
			Data:     lp,
		},
		{
			File:     "card.html",
			Template: "card.html",
			Meta:     Meta{Title: subTitle("Card"), Description: "imutaro のプロフィールカード。", Path: "/card"},
			Scripts:  []string{"card.js"},
			Data: CardData{
				Facts:   profile.CardFacts(opts.Now),
				Stack:   profile.Stack,
				QRLabel: profile.QRTargetLabel,
			},
		},
		{
			File:     "apps.html",
			Template: "apps.html",
			Meta:     Meta{Title: subTitle("Apps"), Description: "imutaro が普段使っているアプリ。", Path: "/apps"},
			Data:     profile.DockApps,
		},
		{
			File:     "writings.html",
			Template: "writings.html",
			Meta:     Meta{Title: subTitle("Zenn / note"), Description: "Zenn と note で公開している記事・本の一覧。", Path: "/writings"},
			Header:   true,
			Footer:   true,
			Data:     writings("all", all),
		},
		{
			File:     "writings/zenn.html",
			Template: "writings.html",
			Meta:     Meta{Title: subTitle("Zenn の記事"), Description: "Zenn で公開している記事・本の一覧。", Path: "/writings/zenn"},
			Header:   true,
			Footer:   true,
			Data:     writings("zenn", zenn),
		},
		{
			File:     "writings/note.html",
			Template: "writings.html",
			Meta:     Meta{Title: subTitle("note の記事"), Description: "note で公開している記事の一覧。", Path: "/writings/note"},
			Header:   true,
			Footer:   true,
			Data:     writings("note", note),
		},
		{
			File:     "uses.html",
			Template: "uses.html",
			Meta:     Meta{Title: subTitle("Uses"), Description: "imutaro が毎日使っている道具と、その使い方。", Path: "/uses"},
			Header:   true,
			Footer:   true,
			Data:     usesData(),
		},
		{
			File:     "404.html",
			Template: "404.html",
			Meta:     Meta{Title: subTitle("ページが見つかりません"), Description: siteDescription, Path: "/404", NoIndex: true},
			Footer:   true,
		},
	}
}

func writingsPath(source string) string {
	if source == "all" {
		return "/writings"
	}
	return "/writings/" + source
}

func firstN(articles []feeds.Article, n int) []feeds.Article {
	if len(articles) > n {
		return articles[:n]
	}
	return articles
}
