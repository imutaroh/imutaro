# DESIGN.md — imutaro.com デザインシステム

トップページ（LP）で確立したデザイン言語の定義。**全ページはこのドキュメントに従う。**
新しいページ・コンポーネントを作るときは、ここにない装飾を発明する前にこの語彙で解決できないか確認する。

## 1. コンセプト

**「データエンジニアのフィールドノート」** — 計器・ログ・端末の語彙で、学びの記録を淡々と美しく見せる。
LP はその上に **「白い紙の上に本人が立つ」** を重ねる: フィールドノートの静けさ（白×青×罫線×mono）を土台に、
巨大ディスプレイタイポ（セリフ）・キャラクター（ドット絵の本人像）・エディトリアルな番号と括弧、の3要素で構図を作る。

> 2026-08-14 以前は3要素目が**クロームリボン**（「白い紙の上をクロームが流れる」）だった。
> キャラクターを主役にする判断に伴い、生成画像の金属は全点撤去した（モチーフ6）。

- 語り口は静か。装飾は情報を運ぶものだけ（罫線=区切り、mono=メタデータ、点=状態）
- 演出（TypedTitle のタイプ入場・fadeInUp スタッガ・ShinyText・ClickSpark）は **LP専用**。読むページ（ブログ/記事）には持ち込まない
- 動きは「初回ロードのヒーロー入場」と「hover / click」のみ。**アイドル時とスクロール中は完全静止**
- ブログ/記事ページに持ち込むのは **トーン**（色・書体・余白・罫線・モチーフ）だけ

## 2. カラートークン（globals.css 定義済み）

| トークン | 値 | 用途 |
|---|---|---|
| `--color-bg` | `#fafbfc` | ページ背景 |
| `--color-ink` | `#1a2330` | 見出し・本文の主文字色 |
| `--color-sub` | `#5b6572` | 補助テキスト・メタ情報 |
| `--color-accent` | `#0087a8` | リンクhover・アクセント・mono見出し |
| `--color-accent-bright` | `#00add8` | アクセントのhover強調・点滅 |
| `--color-line` | `#e3e8ed` | ヘアライン罫線・カード枠 |
| `--color-code-bg` | `#f0f3f6` | コード背景・hover背景・カードタブ |

原則:
- 面で塗らない。色は**線と文字**に使う。背景色は `--color-code-bg` の淡い面だけ
- アクセントは1ページに点在させすぎない。「今注目すべきもの」にだけ

## 3. タイポグラフィ

| 役割 | フォント | 変数 | 使い所 |
|---|---|---|---|
| Heading Serif | 欧文: Playfair Display (700) / 和文: Zen Old Mincho (700) の混植 | `--font-serif-stack`（実体は `--font-playfair` + `--font-serif`） | h1〜h6（globals.cssで全ページ自動適用）・セクション番号（`01.`）・記事行の index |
| Body | IBM Plex Sans JP (400/500/700) | `--font-body` | 本文（mono と同一スーパーファミリー。「機械の声(mono)と人間の声(sans)が同一骨格」） |
| Mono | IBM Plex Mono | `--font-mono` | **メタデータ全般**: eyebrow・日付・タグ・ハッシュ・ラベル・パンくず |

原則:
- **7段タイプスケール**（globals.css 定義: `--fs-caption` 12px / `--fs-meta` 13px / `--fs-ui` 14px / `--fs-body` 16px / `--fs-lead` 1.05rem / `--fs-h2` 2.2rem / `--fs-number` 3rem）。UI・ナビ・メタ・ラベルのフォントサイズはこの7段から選び、**これ以外を新設しない**。例外は2系統のみ: ①ブランドロゴ `.logo` 0.95rem（LP/ブログ共通ヘッダー） ②読み物系のディスプレイ/プロース文字（PageHead・記事タイトルの `clamp()`、記事本文 `.content` 内の見出し・本文・コード、ブログ一覧タイトル 1.1rem、リード 0.95rem、プロフィール文 0.85rem）— 720px 測度の可読性に最適化した既存値を維持し、7段の対象外とする
- **mono の使用規則**: mono は 13px（データ: 日付・hash・URL・ページ番号・検索入力。letter-spacing 0）と 12px（ラベル/ピル/キャプション: タブ・バッジ・ステータス・サイトフッタの©表記・図注。letter-spacing 0.05em）の**2段のみ**。profile.json カードの脚注は中身が URL なので 13px 段。eyebrow は 13px / ls 0.05em。**700 にしない**。色は sub か accent のみ。例外はブランドロゴ `.logo`（0.95rem）と記事本文 `.content` 内のコード（プロース扱い: `pre code` 0.9rem / インライン 0.88em）
- body は `letter-spacing: 0.02em`（Plex は字面がやや締まるため）。桁揃えが命の等幅には継承させず、`code, pre { letter-spacing: 0 }` で遮断する
- palt は全見出し（h1-h6、globals.css で一括適用）。`.heroTitle` はフィット式の余裕を守るため `letter-spacing: 0` で body の字間継承から保護する
- **mono = 機械が読む情報**（日付、タグ、ステータス、ID）。人間向けの文は body
- **serif = 見出しと構図を作るディスプレイ文字**。本文や小さなメタ情報には使わない。Playfair は欧文グリフのみ持ち、和文は自動的に Zen Old Mincho へフォールバックする（欧文=高コントラスト・和文=明朝の混植が意図）。どちらも 700 しか読み込んでいないため、見出しの `font-weight` を 700 未満にしない
- ヒーロータイトルは `--font-serif-stack` + `font-feature-settings: 'palt'`、`line-height: 1.12`。サイズは「最長行の文字数がどの画面幅でも1行に収まる」よう `calc()` で導出する（page.module.css のコメント参照）
- 見出しは `font-weight: 700`、本文リンクやリスト項目タイトルは `500`
- 日本語見出しは `word-break: keep-all` + `text-wrap: balance` を検討

## 4. モチーフ（このサイトの署名）

1. **ミニダイヤル**: 輪＋中心点 `◉`。セクション見出しの eyebrow に付く
   ```css
   /* .sectionEyebrow::before と同じ */
   width/height: 10px; border-radius: 50%;
   border: 1px solid var(--color-accent);
   background: radial-gradient(circle, var(--color-accent) 0 2px, transparent 2.5px);
   ```
2. **点とリング**: タイムラインのノード。`box-shadow: 0 0 0 3px var(--color-bg), 0 0 0 4px rgba(0,135,168,.35)`
3. **ヘアライン罫線リスト**: `border-bottom: 1px solid var(--color-line)` で区切った行。hoverで `background: var(--color-code-bg)` ＋タイトルが accent に
   - 変種 **リーダー罫線**: eyebrow の `::after`（`flex:1; height:1px; margin-left: 24px（≤640px は 16px）; background: var(--color-line)`）がカラム右端まで走る計測線。`◉ ( 01 / about ) ──────` の文法で、紙面に全セクション貫通の水平基準構造を与える
4. **code-tab カード**: 上部にmonoのタブ（`--color-code-bg`地・点付き）を持つ枠線カード（profile.json カード）
5. **mono ピル**: `border: 1px solid var(--color-line); border-radius: 999px; font-family: mono; font-size: var(--fs-caption); letter-spacing: 0.05em`（タグ・ステータス用）
   - 変種 **技術スタック**: 技術ロゴ（simple-icons / CC0、`BrandIcon`）＋名前＋状態ピル。ロゴは `currentColor` で描いて **ink 一色に落とす**（原色のロゴを並べると白×青の紙面から浮く）。状態は daily=塗りつぶし / learning=輪郭のみ。中身は `libs/profile.ts` の `STACK_ENTRIES` に集約し、LP の 03 Stack と `/card` が同じ配列を読む。**「SQL」は言語でロゴを持たないため、実際に使っている製品名 BigQuery を出す**
6. **液体金属（撤去済み・復活させない）**: 白×青のクロームを描いた静的な生成画像ファミリー。かつてはこのサイトのキービジュアルで、リボン（`ribbon-hero.png` / `ribbon-glyph-b.png`）とストリーム（`metal-stream.png`）、予備の `metal-drops.png` / `ribbon-glyph-a.png` があった。**キャラクター（モチーフ8）を主役にする判断に伴い、2026-08-14 に全点を削除した。**金属とキャラクターは同じ画面で主役を取り合うため、混ぜない。いま残っている「銀」は §5 のミッド帯 `--bg-metal-band`（CSS グラデーション）だけで、これは画像ではなく面の例外。生成画像としての金属は**復活させない**（戻すなら DESIGN.md のコンセプトから書き直すこと）
7. **エディトリアルの括弧**: eyebrow を `( 01 / about )` の括弧形式で書く。ミニダイヤル ◉ とセットで使う

8. **キャラクター（サイトの顔）**: ドット絵の本人像。`imutaro-icon.png`（バスト・背景を抜いた透過PNG）を**全面で使い回す**（LPヒーロー右下 / About の profile.json カードの avatar フィールド / `/card` の表 / ファビコン・apple-icon は顔だけのカット）。同じ絵を複数箇所で使うことで「これがこの人」の対応を1つに束ねる。必ず `image-rendering: pixelated`（ドット絵を補間させない）。**バストは胸で水平に切れている**ため、枠に入れない場所では下端を背景色グラデーションで紙に溶かす（`.heroVisual::after`。mask は禁止）。切り抜きは `assets/` の原画に対し、外周からの連結成分フラッドフィル（色距離しきい値34）で背景クリームを抜いて作る
9. **クロームの帯（`/card` 専用）**: 立体カードの面を斜めに走る銀の帯。回転角 θ から `--sheen-pos`（`sin θ`）と `--sheen-lum`（`|sin 2θ|`）を JS が流し込み、`mix-blend-mode: multiply` で白い面に落とす。**白地では `screen` が効かない**（白 × screen = 白）ため、トレカのホログラム箔ではなく multiply の銀に翻訳している = 6 の「白い紙の上をクロームが流れる」の運動版。面色は `--color-bg` のままで新しい面を作らず、中間グレー2色は `components/ProfileCard/index.module.css` 内のローカル変数に閉じ込める（`--bg-metal-band` は流用しない）

## 5. レイアウト・余白

- コンテンツ最大幅: LP=1040px（hero=1200px）、記事本文=720px
- セクション間: `--space-section`（128px、モバイル 80px。globals.css のトークンで一元管理）、見出しとコンテンツ間: 40px
- ヘアライン行リストの行 padding: LP の記事・Contact 行のみ 32px（ゆとり優先・8pxグリッド）。Stack 行は 16px、ブログ一覧（ArticleListItem）は 24px 12px のままで、32px に統一しない
- ミッド帯の境界（hairline）は**呼吸ゾーンの中央**に置く: `--space-section` を境界の前後で折半し、帯の直前セクションに `padding-bottom: calc(var(--space-section) / 2)`（`.beforeBand`）、帯内セクションに同値の `padding-top`、帯自身に同値の `padding-bottom`、帯直後のセクションに同値の `padding-top`（`.afterBand`）を与える。境界線がコンテンツに張り付く／帯の中だけ間延びする、を防ぐ
- 角丸: `--border-radius`(4px)。カードのみ 8px
- 影は原則使わない。使うのは浮いているカードだけ（`0 24px 48px -32px rgba(26,35,48,.28)`）
- 「面で塗らない」原則の**唯一の例外**はミッド帯（02 log / 03 stack）の淡い銀青メタリック面 `--bg-metal-band`（CSS グラデーション。画像は使わない）。他の場所に面を増やさない

## 6. セクション見出しの型

```
◉ ( 01 / about ) ──────  ← eyebrow: mono 13px(--fs-meta) / ls 0.05em / accent色,
                            ミニダイヤル+括弧+リーダー罫線(::after がカラム右端まで)
01. About                ← number: serif 3rem(--fs-number) / 700 / accent（aria-hidden の装飾）
                           title: 2.2rem(--fs-h2) / 700 / ink（番号の右に baseline 揃え）
```
番号は「ページ内の順序」を表すときだけ付ける。一覧ページ等では `/ blog` のようにラベルのみ。
セリフの大きな番号は LP のセクション見出し専用（ブログ側の見出しには付けない）。

## 7. インタラクション

- hover遷移は `0.15s ease`（色・背景）、変形は `0.2〜0.25s ease`
- 行リストのhover: 背景 `--color-code-bg`、タイトル `--color-accent`、矢印は `translateX(4px)`
- リンク矢印は `→` を span で持ち、hoverでスライド
- `prefers-reduced-motion: reduce` を必ず尊重（globals.cssで一括対応済み）
- focus-visible: `outline: 2px solid var(--color-accent)`（定義済み。塗りボタン上では ink に変える）

## 8. ページ別の適用方針

| ページ | 演出 | 構成 |
|---|---|---|
| `/`（LP） | 有限・入力駆動のみ（TypedTitle のタイプ入場, fadeInUp スタッガ, ShinyText[3回で停止], ClickSpark[クリック駆動]）＋**読み込みごとの幕**（HomeGate） | **幕**: 読み込みのたびにカード（`/card` と同じ ProfileCard）を全画面でかぶせ、ダブルタップ / スクロール / 「サイトを見る」で開く。**LP の DOM は常に描画したまま重ねるだけ**（`display:none` にすると `/` が空のページになる）。クライアントでのみ描画するので JS 無効環境では出ない。**状態は保存しない**（読み込み直すたびに毎回カードから始まる。オーナー指定）。**カードの上でのドラッグでは閉じない**（`[data-card-stage]` の内側の `touchmove` は無視する。閉じるとカードを回せず裏の QR に辿り着けない）。初回描画のチラつきは `html.js-gate::before`（globals.css）が防ぐ。幕の中では名前を `h1` にしない（LP のヒーロー見出しと h1 が二重になる）<br>本体: hero（左テキスト + 右下にキャラクターのバスト）+ セクション。**キャラクターは 1:1 なのでタイトル2行の「下」に収まり、タイトルのフィット式から横幅を奪わない**（立ち姿=縦1.9倍だとタイトルを3割削る必要があった） |
| `/card` | 有限・入力駆動のみ（ドラッグで回転、離したあとの慣性は摩擦で必ず停止。ダブルタップ / Enter で遷移演出） | 1画面完結（`100dvh` + `overflow: clip`、ヘッダー・フッターなし）。3Dカード1枚 — **情報は全部表**（アイコン＋名前(serif)＋役割＋profile行＋技術スタックのピル）。**表にリンクを置かない** — カードは幕としても使うので、面の中にサイト外へ飛ぶ導線があると触った瞬間に離脱する、**裏は QR 面**（ヘアラインの織り地＋ `public/qr-imutaro-com.svg` ＋行き先の文字列）。QR は白い板に載せ、`.backMark` を `translateZ(4px)` でクロームの帯（モチーフ9）より前に出す — 帯が重なると読み取り精度が落ちる。板の隣に出す文字列は環境変数ではなく **QR の中身と一致させる**（`QR_TARGET_LABEL`） |
| `/blog`, `/tags/*`, `/search` | 演出なし | eyebrow付きページ見出し + ヘアライン行リスト + monoピルのタグ |
| `/articles/*` | 演出なし | mono メタ → 見出し → 本文720px。読みやすさ最優先 |
| 404 | なし | mono `404` + 一言 + 帰りのリンク |

※ かつて LP にあった DotGrid・FluidCursor・SplashCursor（常駐 canvas）と SplitText（スクロール発火）は
描画コスト・スクロール体感の問題で撤去済み（Issue #7, #13, #15）。**復活させない**。

## 9. アンチパターン

- ❌ アクセント色での面塗り（ボタン以外）
- ❌ 読むページへの動く背景・カーソル演出
- ❌ 影付きカードの多用（カードは1画面に1つの主役だけ）
- ❌ mono と body の混用（1つのテキスト内で混ぜない。役割で使い分ける）
- ❌ トークンを介さない生色指定（`#0087a8` を直接書かず `var(--color-accent)`）
- ❌ 無限ループするアニメの新規追加（`infinite` / `repeat: -1`。既存の演出はすべて有限回で停止する）
- ❌ スクロール発火・スクロール連動の演出（IntersectionObserver リビール・パララックス。PR #14 で廃止）
- ❌ `mask-image` / `-webkit-mask`（タイルラスタライズが重くなる。フェードは背景色グラデ上掛けで。Issue #19）
- ❌ `overflow-x: hidden`（スクロールコンテナが増える。刈るなら `overflow: clip`。Issue #21）
