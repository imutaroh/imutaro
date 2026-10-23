// build は imutaro.com を dist/ に書き出す。
//
//	go run ./cmd/build                     # Zenn / note の RSS を取りに行って書き出す
//	go run ./cmd/build -allow-empty-feeds  # RSS が取れなくても書き出す(オフラインでの開発用)
//
// 本番(GitHub Actions)では -allow-empty-feeds を付けない。RSS が取れなければビルドが止まり、
// デプロイされないので、前回の正しいページが出続ける。
package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	// タイムゾーンのデータをバイナリに埋め込む。実行環境に tzdata が無くても Asia/Tokyo を読めるようにする
	_ "time/tzdata"

	"github.com/imutaroh/imutaro/internal/feeds"
	"github.com/imutaroh/imutaro/internal/site"
)

func main() {
	out := flag.String("out", "dist", "書き出し先のディレクトリ")
	allowEmpty := flag.Bool("allow-empty-feeds", false, "RSS が取れなくても、記事0件のまま書き出す")
	flag.Parse()

	if err := run(*out, *allowEmpty); err != nil {
		log.Fatal(err)
	}
}

func run(out string, allowEmpty bool) error {
	start := time.Now()

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	client := &http.Client{Timeout: 20 * time.Second}

	grouped, err := feeds.FetchAll(ctx, client)
	if err != nil {
		if !allowEmpty {
			return fmt.Errorf("%w(-allow-empty-feeds を付ければ記事0件のまま書き出せる)", err)
		}
		log.Printf("警告: %v。取れた分だけで続ける", err)
	}

	root, err := os.Getwd()
	if err != nil {
		return err
	}
	if err := site.Build(site.Options{Root: root, Out: out, Now: time.Now(), Feeds: grouped}); err != nil {
		return err
	}

	log.Printf("%s に書き出した(Zenn %d 件 / note %d 件、%v)",
		out, len(grouped[feeds.Zenn]), len(grouped[feeds.Note]), time.Since(start).Round(time.Millisecond))
	return nil
}
