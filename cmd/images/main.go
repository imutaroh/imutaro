// images は public/ の元画像から、表示する大きさに合わせた軽い版を作る。
//
//	go run ./cmd/images
//
// 出力はリポジトリに入れる(サイトのビルドのたびには作らない)。元画像を差し替えたら、もう一度実行する。
// 元画像には手を付けず、「元の名前-幅.png」で書き出す。
// pngquant が入っていれば減色して軽くする(macOS なら brew install pngquant)。
//
// Next.js 版では next/image がこれをリクエストのたびに自動でやっていた。
// 静的なサイトにはその仕組みが無いので、あらかじめ作っておく。
package main

import (
	"fmt"
	"image"
	"image/png"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"golang.org/x/image/draw"

	"github.com/imutaroh/imutaro/internal/profile"
)

type job struct {
	src   string
	width int
}

// out は書き出し先(元の名前に幅を付けたもの)。例: apps/arc.png, 176 → apps/arc-176.png
func (j job) out() string {
	ext := filepath.Ext(j.src)
	return fmt.Sprintf("%s-%d%s", strings.TrimSuffix(j.src, ext), j.width, ext)
}

func jobs() []job {
	js := []job{
		// キャラクター: ヒーローとカード(最大で 280px 表示 → 2倍の画面でも 512 で足りる)、About の小窓(88px 表示)
		{src: "imutaro-icon.png", width: 512},
		{src: "imutaro-icon.png", width: 176},
	}
	// Dock のアイコン: LP と /uses(56px 表示 × 拡大 1.5 → 2倍の画面で 168)と /apps(88px × 1.5 → 264)
	for _, app := range profile.DockApps {
		js = append(js,
			job{src: "apps/" + app.ID + ".png", width: 176},
			job{src: "apps/" + app.ID + ".png", width: 258},
		)
	}
	return js
}

func main() {
	pngquant, err := exec.LookPath("pngquant")
	if err != nil {
		log.Print("pngquant が無いので、減色せずに縮小だけする")
		pngquant = ""
	}
	for _, j := range jobs() {
		if err := resize(filepath.Join("public", j.src), filepath.Join("public", j.out()), j.width); err != nil {
			log.Fatalf("%s: %v", j.src, err)
		}
		if pngquant != "" {
			// --skip-if-larger: 減色しても軽くならないなら元のまま。--strip: 撮影情報などを落とす
			cmd := exec.Command(pngquant, "--quality=70-95", "--strip", "--skip-if-larger", "--force",
				"--output", filepath.Join("public", j.out()), "--", filepath.Join("public", j.out()))
			if out, err := cmd.CombinedOutput(); err != nil {
				// 終了コード 98/99 は「軽くならなかった / 品質を満たせなかった」で、縮小版はそのまま使える
				log.Printf("%s: pngquant をスキップ(%v %s)", j.out(), err, strings.TrimSpace(string(out)))
			}
		}
		info, err := os.Stat(filepath.Join("public", j.out()))
		if err != nil {
			log.Fatal(err)
		}
		log.Printf("%-28s %6.1f KB", j.out(), float64(info.Size())/1024)
	}
}

// resize は src を幅 width に縮小して dst に書く。縦横比は保つ。
func resize(src, dst string, width int) error {
	f, err := os.Open(src)
	if err != nil {
		return err
	}
	defer f.Close()
	img, err := png.Decode(f)
	if err != nil {
		return err
	}

	b := img.Bounds()
	height := b.Dy() * width / b.Dx()
	out := image.NewRGBA(image.Rect(0, 0, width, height))
	// CatmullRom は縮小で輪郭がにじみにくい補間(Photoshop の「バイキュービック」に近い)
	draw.CatmullRom.Scale(out, out.Bounds(), img, b, draw.Src, nil)

	w, err := os.Create(dst)
	if err != nil {
		return err
	}
	enc := png.Encoder{CompressionLevel: png.BestCompression}
	if err := enc.Encode(w, out); err != nil {
		w.Close()
		return err
	}
	return w.Close()
}
