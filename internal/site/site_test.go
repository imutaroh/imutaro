package site

import (
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"testing"
	"time"

	"github.com/imutaroh/imutaro/internal/feeds"
	"github.com/imutaroh/imutaro/internal/profile"
)

// buildFixture は testdata の実フィードと固定した日時で、一時ディレクトリにサイトを書き出す。
func buildFixture(t *testing.T) string {
	t.Helper()
	grouped := feeds.Grouped{}
	for _, src := range []feeds.Source{feeds.Zenn, feeds.Note} {
		f, err := os.Open(filepath.Join("..", "feeds", "testdata", string(src)+".xml"))
		if err != nil {
			t.Fatal(err)
		}
		articles, err := feeds.Parse(f, src)
		f.Close()
		if err != nil {
			t.Fatal(err)
		}
		grouped[src] = articles
	}

	out := t.TempDir()
	err := Build(Options{
		Root:  filepath.Join("..", ".."),
		Out:   out,
		Now:   time.Date(2026, 10, 23, 12, 0, 0, 0, profile.Tokyo),
		Feeds: grouped,
	})
	if err != nil {
		t.Fatalf("Build: %v", err)
	}
	return out
}

func read(t *testing.T, dir, name string) string {
	t.Helper()
	b, err := os.ReadFile(filepath.Join(dir, name))
	if err != nil {
		t.Fatal(err)
	}
	return string(b)
}

func TestBuildWritesEveryPage(t *testing.T) {
	out := buildFixture(t)
	for _, name := range []string{
		"index.html", "card.html", "apps.html", "uses.html", "404.html",
		"writings.html", "writings/zenn.html", "writings/note.html",
		"_headers", "ogp.png", "favicon.ico",
	} {
		if _, err := os.Stat(filepath.Join(out, name)); err != nil {
			t.Errorf("%s がありません: %v", name, err)
		}
	}
}

func TestPagesHaveTheirContent(t *testing.T) {
	out := buildFixture(t)

	index := read(t, out, "index.html")
	for _, want := range []string{
		`aria-label="周りの価値を、最大化するエンジニアへ"`,
		"diffbase.nvim",             // Zenn の最新記事
		"( 06 / contact )",          // 記事セクションがあるので Contact は 06
		`href="/writings/zenn"`,     // 「もっと見る」は絞り込みページへ
		`class="dock lp-apps-dock"`, // 04 Apps の Dock
		"imutaakihiro3@gmail.com",   // Contact の Email(mailto: は外して表示)
	} {
		if !strings.Contains(index, want) {
			t.Errorf("index.html に %q がありません", want)
		}
	}

	// 2026-10-23 時点で 22 歳(誕生日は 12/1)
	if card := read(t, out, "card.html"); !strings.Contains(card, "<dt>age</dt><dd>22</dd>") {
		t.Error("card.html の年齢が 22 になっていません")
	}

	// Zenn の絞り込みページに note の記事が混ざっていない
	zenn := read(t, out, "writings/zenn.html")
	if strings.Contains(zenn, `data-source="note"`) {
		t.Error("writings/zenn.html に note の記事が混ざっています")
	}
	if !strings.Contains(zenn, "12 件") {
		t.Error("writings/zenn.html の件数が 12 件になっていません")
	}

	// 404 は検索エンジンに載せない
	if nf := read(t, out, "404.html"); !strings.Contains(nf, `<meta name="robots" content="noindex">`) {
		t.Error("404.html に noindex がありません")
	}
}

func TestEveryPageHasOwnMeta(t *testing.T) {
	out := buildFixture(t)
	tests := []struct{ file, title, canonical string }{
		{"index.html", "imutaro — データエンジニアの学習記録", "https://imutaro.com"},
		{"apps.html", "Apps | imutaro.com", "https://imutaro.com/apps"},
		{"writings/note.html", "note の記事 | imutaro.com", "https://imutaro.com/writings/note"},
	}
	for _, tt := range tests {
		html := read(t, out, tt.file)
		if !strings.Contains(html, "<title>"+tt.title+"</title>") {
			t.Errorf("%s の <title> が %q ではありません", tt.file, tt.title)
		}
		// og:title は <title> と同じ(Next.js 版は下層で「Apps | imutaro.com | imutaro.com」と二重になっていた)
		if !strings.Contains(html, `<meta property="og:title" content="`+tt.title+`">`) {
			t.Errorf("%s の og:title が %q ではありません", tt.file, tt.title)
		}
		if !strings.Contains(html, `<link rel="canonical" href="`+tt.canonical+`">`) {
			t.Errorf("%s の canonical が %q ではありません", tt.file, tt.canonical)
		}
		// OGP 画像は全ページに付ける(Next.js 版は下層ページで消えていた)
		if !strings.Contains(html, `<meta property="og:image" content="https://imutaro.com/ogp.png">`) {
			t.Errorf("%s に og:image がありません", tt.file)
		}
	}
}

var localRef = regexp.MustCompile(`(?:src|href)="(/[^"]*)"|srcset="([^"]*)"`)

// TestLocalReferencesResolve は、全ページの src / href / srcset が指すサイト内のパスが、
// 書き出したファイルとして実在するかを確かめる(画像の付け忘れや、リンク先のページの書き忘れを捕まえる)。
func TestLocalReferencesResolve(t *testing.T) {
	out := buildFixture(t)
	pages, err := filepath.Glob(filepath.Join(out, "*.html"))
	if err != nil {
		t.Fatal(err)
	}
	sub, _ := filepath.Glob(filepath.Join(out, "*", "*.html"))
	pages = append(pages, sub...)

	for _, page := range pages {
		html := read(t, out, strings.TrimPrefix(page, out+string(filepath.Separator)))
		for _, m := range localRef.FindAllStringSubmatch(html, -1) {
			var paths []string
			if m[1] != "" {
				paths = append(paths, m[1])
			}
			// SplitSeq(Go 1.24〜)は切り分けた結果をスライスに溜めず、1つずつ返す
			for cand := range strings.SplitSeq(m[2], ",") {
				if f := strings.Fields(cand); len(f) > 0 && strings.HasPrefix(f[0], "/") {
					paths = append(paths, f[0])
				}
			}
			for _, p := range paths {
				if !exists(out, p) {
					t.Errorf("%s: %s を指していますが、ありません", filepath.Base(page), p)
				}
			}
		}
	}
}

// exists は、Cloudflare の静的配信と同じ解決(/apps → apps.html)でファイルがあるかを返す。
func exists(out, urlPath string) bool {
	p, _, _ := strings.Cut(urlPath, "?")
	if p == "/" {
		p = "/index.html"
	}
	for _, c := range []string{p, p + ".html"} {
		if info, err := os.Stat(filepath.Join(out, filepath.FromSlash(c))); err == nil && !info.IsDir() {
			return true
		}
	}
	return false
}
