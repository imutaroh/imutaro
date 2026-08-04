# DESIGN.md — imutaro.com デザインシステム

トップページ（LP）で確立したデザイン言語の定義。**全ページはこのドキュメントに従う。**
新しいページ・コンポーネントを作るときは、ここにない装飾を発明する前にこの語彙で解決できないか確認する。

## 1. コンセプト

**「データエンジニアのフィールドノート」** — 計器・ログ・端末の語彙で、学びの記録を淡々と美しく見せる。
LP はその上に **「白い紙の上をクロームが流れる」** を重ねる: フィールドノートの静けさ（白×青×罫線×mono）を土台に、
巨大ディスプレイタイポ（セリフ）・クロームリボン（静的な生成画像）・エディトリアルな番号と括弧、の3要素で構図を作る。

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
| Body | Zen Kaku Gothic New | `--font-body` | 本文 |
| Mono | IBM Plex Mono | `--font-mono` | **メタデータ全般**: eyebrow・日付・タグ・ハッシュ・ラベル・パンくず |

原則:
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
4. **code-tab カード**: 上部にmonoのタブ（`--color-code-bg`地・点付き）を持つ枠線カード（profile.json カード）
5. **mono ピル**: `border: 1px solid var(--color-line); border-radius: 999px; font-family: mono; font-size: .8rem`（タグ・ステータス用）
6. **液体金属（このサイトのキービジュアル語彙）**: 白×青のクロームを描いた静的な生成画像ファミリー。リボン（`public/ribbon-*.png`: ヒーロー右・ミッド帯右端・Contact 右）、雫（`metal-drops.png`: 04 articles 見出し右）、ストリーム（`metal-stream.png`: Contact 前の全幅ディバイダ）。いずれも `next/image` で配置し、ヒーロー以外は lazy。矩形の縁の馴染ませ方は背面で使い分ける: 背景が単色 `--color-bg` だけのヒーローは「背景色グラデーションの上掛け」（`.ribbonFade`。mask は禁止、PR #20 と同じ手法）、背面が単色でない箇所（銀グラデ面のミッド帯など）と単色上の小物は `mix-blend-mode: multiply` に一本化する（不透明グラデは背面を塗りつぶして矩形の継ぎ目を作るため併用しない。multiply を効かせるにはラッパーに z-index を付けずスタッキング文脈を作らないこと）。**1セクション1主役** — 同じ画面に金属素材を重ねすぎない
7. **エディトリアルの括弧**: eyebrow を `( 01 / about )` の括弧形式で書く。ミニダイヤル ◉ とセットで使う

## 5. レイアウト・余白

- コンテンツ最大幅: LP=1040px（hero=1200px）、記事本文=720px
- セクション間: `--space-section`（128px、モバイル 80px。globals.css のトークンで一元管理）、見出しとコンテンツ間: 40px
- ヘアライン行リストの行 padding: LP の記事・Contact 行のみ 28px（ゆとり優先）。Stack 行は 16px、ブログ一覧（ArticleListItem）は 24px 12px のままで、28px に統一しない
- 角丸: `--border-radius`(4px)。カードのみ 8px
- 影は原則使わない。使うのは浮いているカードだけ（`0 24px 48px -32px rgba(26,35,48,.28)`）
- 「面で塗らない」原則の**唯一の例外**はミッド帯（02 log / 03 stack）の淡い銀青メタリック面 `--bg-metal-band`（CSS グラデーション。画像は使わない）。他の場所に面を増やさない

## 6. セクション見出しの型

```
◉ ( 01 / about )    ← eyebrow: mono 0.8rem, accent色, ミニダイヤル+括弧
01. About           ← number: serif 3rem / 700 / accent（aria-hidden の装飾）
                      title: 2.2rem / 700 / ink（番号の右に baseline 揃え）
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
| `/`（LP） | 有限・入力駆動のみ（TypedTitle のタイプ入場, fadeInUp スタッガ, ShinyText[3回で停止], ClickSpark[クリック駆動]） | hero（左テキスト + 右クロームリボン）+ セクション + リボン装飾（ミッド帯・Contact） |
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
