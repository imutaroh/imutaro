// Package site は imutaro.com を静的なファイル(dist/)として書き出す。
//
// 流れ:
//  1. public/ をそのままコピーする(画像・アイコン・QR など)
//  2. web/css/ を1枚につなげ、web/js/ と一緒に、中身のハッシュ付きの名前で assets/ に置く
//  3. web/templates/ のテンプレートに値を流し込み、ページごとに HTML を書く
//  4. Cloudflare 用の _headers を書く
//
// ページは「名前.html」で書き出す(apps.html → /apps)。
// Cloudflare Workers の静的配信は、apps/index.html だと /apps を /apps/ へ転送してしまうが、
// apps.html なら /apps をそのまま返すため(2026-10 に wrangler dev で実測)。
package site

import (
	"bytes"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"html/template"
	"io"
	"io/fs"
	"os"
	"path"
	"path/filepath"
	"strings"
	"time"

	"github.com/imutaroh/imutaro/internal/feeds"
)

// SiteURL は本番の URL。canonical と OGP 画像の絶対 URL に使う。
const SiteURL = "https://imutaro.com"

// Options は Build に渡す入力。
type Options struct {
	// Root はリポジトリのルート(web/ と public/ がある場所)。
	Root string
	// Out は書き出し先。中身は消してから書く。
	Out string
	// Now は年齢などの計算に使う時刻。テストで固定できるよう外から渡す。
	Now time.Time
	// Feeds は Zenn / note の記事。
	Feeds feeds.Grouped
}

// cssOrder は site.css に連結する順番。後ろほど優先される(同じ詳細度なら後勝ち)。
var cssOrder = []string{
	"base.css",
	"header.css",
	"footer.css",
	"shiny.css",
	"typed.css",
	"spark.css",
	"lp.css",
	"articles.css",
	"pubdate.css",
	"pagehead.css",
	"writings.css",
	"dock.css",
	"apps.css",
	"card.css",
	"uses.css",
	"notfound.css",
}

// Build はサイト全体を書き出す。
func Build(opts Options) error {
	if err := os.RemoveAll(opts.Out); err != nil {
		return err
	}
	if err := copyDir(filepath.Join(opts.Root, "public"), opts.Out); err != nil {
		return fmt.Errorf("public/ のコピー: %w", err)
	}

	assets, err := writeAssets(opts.Root, opts.Out)
	if err != nil {
		return fmt.Errorf("アセット: %w", err)
	}

	tmpl, err := parseTemplates(filepath.Join(opts.Root, "web", "templates"), assets)
	if err != nil {
		return fmt.Errorf("テンプレート: %w", err)
	}

	for _, p := range pages(opts) {
		if err := render(tmpl, opts.Out, p); err != nil {
			return fmt.Errorf("%s: %w", p.File, err)
		}
	}

	return os.WriteFile(filepath.Join(opts.Out, "_headers"), []byte(headersFile), 0o644)
}

// headersFile は Cloudflare に渡すレスポンスヘッダーの指定。
// assets/ の中身はファイル名に中身のハッシュが入っているので、中身が変われば URL も変わる。
// だから1年キャッシュさせても古いものは出ない(immutable = 再検証もしなくてよい)。
// HTML はハッシュを持たないので、Cloudflare の既定(毎回 ETag で更新を確かめる)のままにする。
const headersFile = `/assets/*
  Cache-Control: public, max-age=31536000, immutable
`

// writeAssets は CSS を1枚にまとめ、JS と一緒にハッシュ付きの名前で書き出す。
// 戻り値は「元の名前 → 公開 URL」の対応表。
func writeAssets(root, out string) (map[string]string, error) {
	assets := map[string]string{}
	dir := filepath.Join(out, "assets")
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return nil, err
	}

	var css bytes.Buffer
	for _, name := range cssOrder {
		b, err := os.ReadFile(filepath.Join(root, "web", "css", name))
		if err != nil {
			return nil, err
		}
		css.Write(b)
		css.WriteString("\n")
	}
	url, err := writeHashed(dir, "site.css", css.Bytes())
	if err != nil {
		return nil, err
	}
	assets["site.css"] = url

	entries, err := os.ReadDir(filepath.Join(root, "web", "js"))
	if err != nil {
		return nil, err
	}
	for _, e := range entries {
		if e.IsDir() || !strings.HasSuffix(e.Name(), ".js") {
			continue
		}
		b, err := os.ReadFile(filepath.Join(root, "web", "js", e.Name()))
		if err != nil {
			return nil, err
		}
		url, err := writeHashed(dir, e.Name(), b)
		if err != nil {
			return nil, err
		}
		assets[e.Name()] = url
	}
	return assets, nil
}

// writeHashed は name を「name の拡張子の前に中身のハッシュを挟んだ名前」で書き、公開 URL を返す。
// 例: site.css → /assets/site.3f2a1c9b7e.css
func writeHashed(dir, name string, b []byte) (string, error) {
	sum := sha256.Sum256(b)
	ext := path.Ext(name)
	hashed := strings.TrimSuffix(name, ext) + "." + hex.EncodeToString(sum[:])[:10] + ext
	if err := os.WriteFile(filepath.Join(dir, hashed), b, 0o644); err != nil {
		return "", err
	}
	return "/assets/" + hashed, nil
}

// copyDir は src の中身を dst へ再帰的にコピーする。
func copyDir(src, dst string) error {
	return filepath.WalkDir(src, func(p string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		rel, err := filepath.Rel(src, p)
		if err != nil {
			return err
		}
		target := filepath.Join(dst, rel)
		if d.IsDir() {
			return os.MkdirAll(target, 0o755)
		}
		if d.Name() == ".DS_Store" {
			return nil
		}
		return copyFile(p, target)
	})
}

func copyFile(src, dst string) error {
	in, err := os.Open(src)
	if err != nil {
		return err
	}
	defer in.Close()
	out, err := os.Create(dst)
	if err != nil {
		return err
	}
	if _, err := io.Copy(out, in); err != nil {
		out.Close()
		return err
	}
	return out.Close()
}

// parseTemplates はページごとのテンプレートを用意する。
//
// 共通部分(layout.html と partials/)を1度読み、ページごとに複製してから
// そのページのファイルを足す。どのページも "content" という名前で中身を定義するので、
// 1つの集まりに全ページを入れると名前がぶつかるため。
func parseTemplates(dir string, assets map[string]string) (map[string]*template.Template, error) {
	base, err := template.New("").Funcs(funcs(assets)).ParseFiles(filepath.Join(dir, "layout.html"))
	if err != nil {
		return nil, err
	}
	if _, err := base.ParseGlob(filepath.Join(dir, "partials", "*.html")); err != nil {
		return nil, err
	}

	pageFiles, err := filepath.Glob(filepath.Join(dir, "pages", "*.html"))
	if err != nil {
		return nil, err
	}
	tmpls := map[string]*template.Template{}
	for _, f := range pageFiles {
		t, err := base.Clone()
		if err != nil {
			return nil, err
		}
		if _, err := t.ParseFiles(f); err != nil {
			return nil, err
		}
		tmpls[filepath.Base(f)] = t
	}
	return tmpls, nil
}

// render は1ページを書き出す。
func render(tmpls map[string]*template.Template, out string, p Page) error {
	t, ok := tmpls[p.Template]
	if !ok {
		return fmt.Errorf("テンプレート %q がありません", p.Template)
	}
	var buf bytes.Buffer
	if err := t.ExecuteTemplate(&buf, "layout", p); err != nil {
		return err
	}
	target := filepath.Join(out, filepath.FromSlash(p.File))
	if err := os.MkdirAll(filepath.Dir(target), 0o755); err != nil {
		return err
	}
	return os.WriteFile(target, buf.Bytes(), 0o644)
}
