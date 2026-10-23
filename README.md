# imutaro.com

imutaro のサイト。Go で静的な HTML を書き出し、Cloudflare Workers の静的配信で公開している。

```
go run ./cmd/build
  ├─ Zenn / note の RSS を取得(internal/feeds)
  ├─ web/templates に値を流し込んで HTML を書き出す(internal/site)
  ├─ web/css を1枚につなげ、web/js と一緒にハッシュ付きの名前で assets/ に置く
  └─ public/ をコピー
        ↓
      dist/  ──  npx wrangler deploy  ──>  Cloudflare(imutaro.com)
```

デザインの決まりごとは [DESIGN.md](DESIGN.md) にまとめてある。

## 必要なもの

- Go 1.26 以上
- Node.js 24 以上(e2e テストと wrangler だけに使う。サイトのビルドには不要)

## よく使うコマンド

```sh
go run ./cmd/build                     # dist/ に書き出す(RSS が取れないと失敗する)
go run ./cmd/build -allow-empty-feeds  # オフラインで書き出す(記事一覧は空になる)
go run ./cmd/serve                     # dist/ を http://localhost:8788 で配信する

go test ./...                          # Go のテスト(RSS の解析・年齢・書き出したページ)
npm run test:e2e                       # ブラウザのテスト(書き出し → 配信 → Playwright)

go run ./cmd/images                    # 画像の縮小版を作り直す(元画像を差し替えたとき)
```

`cmd/serve` は Cloudflare と同じ URL の解決をする。`/apps` で `apps.html` を返し、`/apps/` と `/apps.html` は `/apps` へ転送し、無いパスには `404.html` を 404 で返す。

## ディレクトリ

| 場所 | 中身 |
|---|---|
| `cmd/build` | サイトを書き出すコマンド |
| `cmd/serve` | 書き出したサイトを手元で配信するコマンド |
| `cmd/images` | 画像の縮小版を作るコマンド(出力はリポジトリに入れる) |
| `internal/feeds` | Zenn / note の RSS の取得と解析 |
| `internal/profile` | 人物と道具のデータ(年齢・Stack・Learning Log・Contact・Dock のアプリ) |
| `internal/site` | ページの組み立てと書き出し。`/uses` の中身は `uses.go` |
| `web/templates` | HTML のテンプレート(`layout.html` が外枠、`pages/` がページ、`partials/` が部品) |
| `web/css` | CSS。ファイルごとにクラス名の接頭辞を決めている(`lp-` `pc-` `dock-` など) |
| `web/js` | ブラウザで動く JS(ビルドの道具を通さず、そのまま配る) |
| `public` | そのまま配る画像・アイコン・QR・OGP 画像 |
| `e2e` | Playwright のテスト |

## 更新の仕組み

`.github/workflows/deploy.yml` が、次のときにサイトを書き出し直してデプロイする。

- `main` に push されたとき
- 毎時17分(Zenn / note の新しい記事を一覧に反映するため)
- Actions の画面から手動で実行したとき

RSS が取れないとビルドが失敗し、デプロイされない。その場合は前回のサイトがそのまま出続ける。

このリポジトリは public なので、60日間リポジトリに動きが無いと GitHub が毎時の実行を自動で止める。止まったら GitHub からメールが来るので、Actions の画面で有効に戻す。

デプロイには、GitHub の Secrets に次の2つが要る。

- `CLOUDFLARE_API_TOKEN`: Cloudflare で「Edit Cloudflare Workers」のテンプレートから作ったトークン
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare のアカウント ID

## 書くときの約束

- **CSS のクラス名**: ファイルごとに接頭辞を付ける(`lp.css` なら `lp-`)。CSS は1枚につなげて配るので、接頭辞が無いと別のファイルの同名クラスとぶつかる
- **JS がつかむ要素**: `data-*` 属性で目印を付ける(`data-card-stage` など)。見た目のクラス名を変えても JS が壊れないようにするため
- **アセットの URL**: テンプレートでは `{{asset "site.css"}}` で引く。中身のハッシュが名前に入るので、中身が変われば URL も変わる。そのため1年キャッシュさせても古いものは出ない
- **画像**: 元画像は `public/` に置き、表示する大きさに合わせた版を `go run ./cmd/images` で作る。Dock にアプリを足すときは、`internal/profile/apps.go` に行を足し、`public/apps/<id>.png`(258px、macOS アイコンの透明な余白を切り落としたもの)を置いてから実行する

## OGP 画像

`public/ogp.png` は完成品の素材として置いている。Next.js 版の時代に `scripts/gen-ogp.mjs`(`next/og` を使う)で作ったもので、そのスクリプトは移行のときに削除した。作り直すときは git の履歴から取り出し、Next.js を使わない形に書き換える。
