// serve は dist/ を手元で配信する。URL の解決は Cloudflare Workers の静的配信と同じにしてある。
//
//	go run ./cmd/serve            # http://localhost:8788
//	go run ./cmd/serve -addr :3000
//
// Cloudflare の既定の挙動(html_handling = "auto-trailing-slash"、not_found_handling = "404-page")を真似る:
//   - /apps      → apps.html を返す
//   - /apps.html → /apps へ転送(307)
//   - /apps/     → /apps へ転送(307)
//   - 無いパス   → 404.html を 404 で返す
package main

import (
	"flag"
	"log"
	"net/http"
	"os"
	"path"
	"path/filepath"
	"strings"
)

func main() {
	dir := flag.String("dir", "dist", "配信するディレクトリ")
	addr := flag.String("addr", ":8788", "待ち受けるアドレス")
	flag.Parse()

	log.Printf("http://localhost%s で %s を配信中", *addr, *dir)
	log.Fatal(http.ListenAndServe(*addr, handler(*dir)))
}

func handler(dir string) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		p := path.Clean("/" + r.URL.Path)
		// path.Clean は末尾のスラッシュを落とすので、元の URL で判定する
		if r.URL.Path != "/" && strings.HasSuffix(r.URL.Path, "/") {
			redirect(w, r, p)
			return
		}
		if strings.HasSuffix(p, ".html") {
			to := strings.TrimSuffix(p, ".html")
			if to == "/index" {
				to = "/"
			}
			redirect(w, r, to)
			return
		}

		candidates := []string{p, p + ".html"}
		if p == "/" {
			candidates = []string{"/index.html"}
		}
		for _, c := range candidates {
			file := filepath.Join(dir, filepath.FromSlash(c))
			if info, err := os.Stat(file); err == nil && !info.IsDir() {
				http.ServeFile(w, r, file)
				return
			}
		}

		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		w.WriteHeader(http.StatusNotFound)
		b, err := os.ReadFile(filepath.Join(dir, "404.html"))
		if err != nil {
			return
		}
		w.Write(b)
	})
}

// redirect はクエリを残したまま to へ転送する。
func redirect(w http.ResponseWriter, r *http.Request, to string) {
	if r.URL.RawQuery != "" {
		to += "?" + r.URL.RawQuery
	}
	http.Redirect(w, r, to, http.StatusTemporaryRedirect)
}
