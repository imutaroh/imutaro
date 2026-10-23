// images は public/ の元画像から、表示する大きさに合わせた軽い WebP を作る。
//
//	go run ./cmd/images
//
// 出力はリポジトリに入れる(サイトのビルドのたびには作らない)。元画像を差し替えたら、もう一度実行する。
// 元画像(PNG)には手を付けず、「元の名前-幅.webp」で書き出す。
//
// Next.js 版では next/image がこれをリクエストのたびに自動でやっていた(縮小して WebP に変換)。
// 静的なサイトにはその仕組みが無いので、あらかじめ作っておく。
// 縮小は Go(golang.org/x/image/draw)で行い、WebP への変換は cwebp に任せる。
// Go の標準ライブラリは WebP を読めるが、書き出せないため(macOS なら brew install webp)。
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

// out は書き出し先(元の名前に幅を付け、拡張子を .webp にしたもの)。
// 例: apps/arc.png, 176 → apps/arc-176.webp
func (j job) out() string {
	return fmt.Sprintf("%s-%d.webp", strings.TrimSuffix(j.src, filepath.Ext(j.src)), j.width)
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
	cwebp, err := exec.LookPath("cwebp")
	if err != nil {
		log.Fatal("cwebp が見つかりません(macOS なら brew install webp)")
	}
	tmp, err := os.MkdirTemp("", "imutaro-images-")
	if err != nil {
		log.Fatal(err)
	}
	defer os.RemoveAll(tmp)

	for i, j := range jobs() {
		resized := filepath.Join(tmp, fmt.Sprintf("%d.png", i))
		if err := resize(filepath.Join("public", j.src), resized, j.width); err != nil {
			log.Fatalf("%s: %v", j.src, err)
		}
		dst := filepath.Join("public", j.out())
		// -q 82: 画質(0〜100)。-m 6: いちばん時間をかけて小さくする。
		// -sharp_yuv: 色の境目をにじませにくくする(アイコンの輪郭向け)。
		// -alpha_q 100: 透明度は劣化させない(アイコンの角の抜けが汚れないように)
		cmd := exec.Command(cwebp, "-quiet", "-q", "82", "-m", "6", "-sharp_yuv", "-alpha_q", "100", resized, "-o", dst)
		if out, err := cmd.CombinedOutput(); err != nil {
			log.Fatalf("%s: cwebp: %v %s", j.out(), err, strings.TrimSpace(string(out)))
		}
		info, err := os.Stat(dst)
		if err != nil {
			log.Fatal(err)
		}
		log.Printf("%-30s %6.1f KB", j.out(), float64(info.Size())/1024)
	}
}

// resize は src を幅 width に縮小して dst に PNG で書く。縦横比は保つ。
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
	if err := png.Encode(w, out); err != nil {
		w.Close()
		return err
	}
	return w.Close()
}
