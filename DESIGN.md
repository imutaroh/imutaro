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
6. **液体金属（このサイトのキービジュアル語彙）**: 白×青のクロームを描いた静的な生成画像ファミリー。使うのは3点 — リボン（`ribbon-hero.png`: ヒーロー右 / `ribbon-glyph-b.png`: ミッド帯**左端**・≤1200px 非表示[logDot リングとの接触回避、根拠は page.module.css のコメント]）、ストリーム（`metal-stream.png`: Contact 前の全幅ディバイダ・`object-position: 20% 50%` の左重心）。`metal-drops.png` と `ribbon-glyph-a.png` は**現在不使用の予備素材**。オーナーが「寂しい」と評価したときだけ**1点ずつ**復帰する — ribbon-glyph-a は Contact の右見切れ（`.sectionEnd` に `position: relative` を戻し、`.contactGlyph { position:absolute; top:8px; right:min(-110px, calc((1040px - 100vw)/2 - 80px)); }` / img `width:260px; mix-blend-mode:multiply` / ≤768px 非表示）、metal-drops は articles リスト末尾から滴る雫（`left:240px; bottom:-72px` / img `width:160px` / ≤768px 非表示。**見出し右には戻さない**）。**見切れの語彙は左右対称**（右見切れ=ヒーロー / 左見切れ=ミッド帯）。左右反転（`scaleX(-1)`）はしない（全素材の光源が左上で統一されており、反転するとハイライト方向が矛盾する）。いずれも `next/image` で配置し、ヒーロー以外は lazy。矩形の縁の馴染ませ方は背面で使い分ける: 背景が単色 `--color-bg` だけのヒーローは「背景色グラデーションの上掛け」（`.ribbonFade`。mask は禁止、PR #20 と同じ手法）、背面が単色でない箇所（銀グラデ面のミッド帯など）と単色上の小物は `mix-blend-mode: multiply` に一本化する（不透明グラデは背面を塗りつぶして矩形の継ぎ目を作るため併用しない。multiply を効かせるにはラッパーに z-index を付けずスタッキング文脈を作らないこと）。**1セクション1主役** — 同じ画面に金属素材を重ねすぎない（ヒーローに雫を足して2点構成にしない。光源とスケールの異なる金属が同居すると「同じ世界の別スケールの物体」ではなく CG のコラージュに落ちる）
   - **上掛けの動く版（ワイプ）**: 同じ「背景色グラデを上に重ねる」手法で、パネルを `translateX` させれば mask なしでワイプが作れる（`.heroWipe`）。`linear-gradient(to right, transparent 0%, var(--color-bg) 8%)` の左端8%が流れの先端になる。**ランプを広げない**（16% だと先端が幅約200pxのなだらかな勾配になり、動く先端が画素として読めず「一斉フェード」に潰れる）。CSS グラデはプリマルチプライド補間なのでグレーの死帯は出ない。**パネルの既定は `display: none`** にして、JS が起こしたときだけ存在させる（JS 失敗・reduce で白い幕が居座る破綻経路を構造的に消す）
   - **変形する素材の箱を `overflow` で刈らないこと**: 縁の馴染ませが「外周12%のフェード帯」で成立している以上、帯より内側にクリップ線が落ちると**そこがハードエッジの継ぎ目になる**。ヒーローの入場は回転4〜8deg + scale 1.055 で箱を最大100px前後はみ出すため、`.heroVisual` は overflow を持たない。刈るのは**十分に外側の親**（`.heroOuter`）だけ
   - **ヒーロー素材を差し替えるときの必須作業**: 入場のワイプ方向（左→右）と回転軸 `transform-origin`（= 渦の目 `71% 50%`）は `ribbon-hero.png` の構図に**ハードコード**されている。素材が「右→左」や「中央対称」に変わったら、`HeroStage.tsx` の `COIL_ORIGIN` / `WIPE_START` / `WIPE_END` と `page.module.css` の `.ribbonPar` / `.ribbonCoil` の `transform-origin` を必ず更新する。放置すると演出は素材の物語を語らなくなり、ただの意味不明なワイプに落ちる。合わせて `--ribbon-w` / `right` / `top` の3値を 1440 / 1024 / 820 / 390px のスクショで取り直す（`top` は「幅 × 高さ比 ÷ 2」が基準。現行 941/1672/2 = 0.2814）
   - **モバイル（≤768px）でも右見切れを捨てない**: 縦積みにすると絶対配置をやめるため、素直に組むと「本文カラム幅に収まった小さな挿絵」に落ちて、見切れ・スケール・重なりという署名が**この幅帯だけ消える**。`width: 116vw` + `margin-left`（`.hero` の左右 padding を相殺して画面左端に合わせる）で右へ 16vw はみ出させる。左端は 12% のフェード帯なので「流れが画面外から現れる入り口」として読め、切り口にはならない。**`.heroMain { width: 100% }` と必ずセット**にすること（`.hero` は `align-items: flex-start` なので、幅を明示しないと 116vw の固定幅がフレックス item の min-content を押し上げ、リード文と CTA まで画面外へ組まれて `overflow: clip` に切られる）
7. **エディトリアルの括弧**: eyebrow を `( 01 / about )` の括弧形式で書く。ミニダイヤル ◉ とセットで使う

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
- `prefers-reduced-motion: reduce` を必ず尊重（globals.cssで一括対応済み）。ただし**一括対応は CSS アニメ／トランジションにしか効かない**。GSAP など JS 駆動の演出は `gsap.matchMedia('(prefers-reduced-motion: reduce)')` で「作らない」側に分岐すること（OS 設定の途中変更に追従して revert される）
- **ヒーロー入場「Pour & Coil」（LP 限定・有限・1回）**: `ribbon-hero.png` が持つ「左から流れ → 右で渦に巻き取られる」運動を、そのまま時間軸に写す。t=0 は `js-hero-hold` が外れた次フレーム（DESIGN.md 8章の保留機構に**相乗り**する。`HeroReveal.tsx` / `layout.tsx` は無改修で、`HeroStage.tsx` が `MutationObserver` でクラス除去を拾う）

  **最初の 380ms は金属の独演**にする。これが最重要の規律で、テキストを早く出すと（旧値: eyebrow 60 / h1 160 / リード 300 / CTA 420ms）ワイプ・コイル・テキスト4段が 620ms の中で全部重なり、時間差が知覚できず「一塊のフェード」に潰れる＝主役のクロームに見せ場が1フレームも無くなる。

  | 開始 | 対象 | 動き | 尺 / ease | 終了 |
  |---|---|---|---|---|
  | 0ms | ワイプ（`--color-bg` パネル） | `xPercent -8 → 88`（右へ退く＝クロームが左から注ぎ込む） | 800ms / `power1.out` | 800ms |
  | **450ms** | **リボン（コイル）** | **`rotation -8 → 0` / `scale 1.055 → 1`（渦の目 `71% 50%` を軸に巻き締まる）** | **850ms / `power2.out`** | **1300ms** |
  | 380ms | eyebrow | `flowIn`（`opacity 0→1` + `translate(-14px, 10px) → none`） | 620ms / `cubic-bezier(.16,1,.3,1)` | 1000ms |
  | 380ms | eyebrow の光沢（ShinyText） | `background-position` 1パス | 900ms | 1280ms |
  | 460ms | h1（2行） | `flowIn`（`-18px, 12px`） | 620ms | 1080ms |
  | 580ms | リード | `flowIn`（既定 `-12px, 10px`） | 620ms | 1200ms |
  | 680ms | CTA 行 | `flowIn`（`-10px, 10px`） | 620ms | **1300ms** |

  **完全静止 = 1300ms**。以後 Paint / Raster / rAF はすべて 0。担保は `onComplete` での `clearProps: 'all'`（ワイプとコイルの inline transform・`will-change` を剥がし、ワイプを `display: none` に戻す）。ただし `document.getAnimations()` は空にならない（`.heroItem1〜4` は `fill: both` なので完了後も *relevant* なアニメとして残り続ける。tick はしないので Paint/Raster は 0）。**確認は「DevTools の Performance で Paint / Raster / rAF が 0」と「Animations パネルに running が無いこと」で行う**。`getAnimations().length === 0` を検証条件にすると正常な実装を壊れていると誤判定する。
  ease の規律: 装飾レイヤーは **`power4.out` のような極端な out を使わない**。可視時間が 250ms しか無く、振幅を上げても「速すぎて読めない」だけになる。`power2` 系で 600ms 前後の可視時間を作る。**ワイプだけは `power1.out`**（`power2.inOut` は最初の 250ms がほぼ静止＝実測 300ms で 11% で、保留解除の直後に「何も起きない間」ができる。`power3.out` は逆に 200ms で 67% 進み、先端が画素として見える前に終わる）。
  **金属の拍を後半に残す規律**: コイルの開始は **ワイプが退き切る前後（450ms）まで後ろ倒しする**。回転軸が渦の目そのものなので、幕の裏で回しても主役はほとんど動かず（実測: 露出直後 450→800ms の画素差分は平均 3.9/255）、訪問者が知覚するのは「画像が左から拭き出される」1イベントだけになる＝静止画で代替できる入場に落ちる。幕が無くなった後に `-8deg` を丸ごと演じさせると、軸から遠い尾側が約 90px（`0.71w × sin8°`）掃くので巻き取りが読める。
  キャレットの規律: **静止画にもキャレットを残さない**。見出し末尾の teal のベタ矩形がクロームの渦の上に乗ると、色相がリボンのティール縁と近いため描画バグに見える。初期表示では1文字もタイプしていない（`visibleCount` は最初から全文）ので、入場でキャレットを出す意味自体が無い。**打鍵中（クリックでの打ち直し）だけ点灯**させ、それ以外は `visibility: hidden`。アニメを持たないので保留機構（`js-hero-hold`）への相乗りも reduce の特別扱いも不要。
  役割分担の規律: **テキスト4要素は CSS keyframes、GSAP が持つのは装飾レイヤー（ワイプとリボン）だけ**。GSAP 側で例外が出ても見出し・リード・CTA が永久に消えないための線引きで、逆にしない。
  **クライアント遷移（記事 → ロゴ → トップ）でも入場は走る**。`layout.tsx` のインライン `<script>` は再実行されないので `js-hero-hold` が付かないが、`HeroStage` は「この文書で保留機構が走ったか（`data-hero-hold`）」×「この文書で入場を再生済みか（`data-hero-played`、`play()` の時点で立てる）」で*初回ロードのハイドレーション*と*クライアント遷移*を見分け、後者では保留を待たずに再生する（`useGSAP` は `useLayoutEffect` なので初回ペイント前に事前状態を置ける＝逆再生にならない）。入場を丸ごと捨てるのは「初回ロードでハイドレーションがインライン保険 1600ms に**200ms 以上**負けた」ときだけ（解除直後 200ms 以内ならリボンは1〜2フレームしか出ていないので再生してよい。`data-hero-hold-at` に解除時刻が入る。**刻むのは保険と `HeroReveal` の両経路**）。この状態は**モジュールスコープの変数ではなく DOM に持つ**（React StrictMode の二重マウントで2回目が必ずクライアント遷移側に落ち、いちばん検証したい「保険に負けたら捨てる」分岐が dev で再現できなくなる）。
  コスト注記: この入場で **GSAP（gzip 約 28 kB）が初めて `/` のクライアントバンドルに載る**。事前状態を `useLayoutEffect`（初回ペイント前）で置く必要があるため、そのパース・実行は入場開始のクリティカルパスに直列で乗る＝低電力機 + コールドキャッシュという「`LATE_PLAY_MS` の窓で救おうとしている条件」で、GSAP 自体が遅延要因になりうる。ワイプとコイルは transform/opacity のみ・有限・1回なので、必要になれば `js-hero-hold` をトリガに **CSS keyframes だけでも書ける**（テキスト4段と同じ仕組みに寄り、可用性設計も1本化される）。その場合 GSAP はポインタ視差だけの動的 import に落とせる。
- **ポインタパララックス（LP ヒーロー限定・入力駆動）**: `(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)` のときだけリスナを生成する（タッチ端末では listener 自体を作らない）。予算は下表の1層だけ。

  | 層 | 対象 | x | y | rotation | 追従 |
  |---|---|---|---|---|---|
  | 金属 | `.ribbonPar`（`data-hero="par"`） | `nx × 30px` | `ny × 16px` | `nx × 1.6deg`（origin `71% 50%`） | `gsap.quickTo` 0.9s（rotation は 1.1s）/ `power3.out` |

  - **版面（見出し・リード・CTA）は 1px も動かさない。** 左揃えのセリフ組版がマウスで泳ぐのは「静かな紙面」の語り口と正面衝突する。動くのは金属だけ、が結果として金属を浮かせる
  - 座標は**ビューポート正規化**（`e.clientX / innerWidth`）。`getBoundingClientRect` のキャッシュで正規化すると、ポインタを置いたままスクロールされたとき古い rect で跳ねる＝実質スクロール連動になる。**rect 方式に変えない**
  - 座標同一の `pointermove`（一部ブラウザがスクロール直後に1発撃つ）は 1px 閾値で弾く。これが無いとスクロールが演出のトリガになる
  - **同じ 1px 判定を `pointerleave` にも掛け、「座標が未記録（一度も実移動していない）」も *動いていない* 側に畳む**。ポインタを止めたままスクロールするとコンテンツが下から抜けてブラウザが `pointerleave` を合成発火するため、無条件に戻りトゥイーンを流すと *leave 側にスクロール連動が残る*（実測で 42 フレームぶん動いた）。`NaN` 初期値との比較は常に false になるので、素通しすると「カーソルを乗せたまま一度も動かさずスクロール」で 42 フレームが復活する。**合成 leave では何もしない**（`gsap.set` で中立へ戻すのも1回の再描画で、リボンがまだ見えている位置の 6〜7px の瞬間移動として画面に出る）。残り値はただの静止 transform で、`will-change` はアイドルタイマが落とす
  - `will-change: transform` は **`pointermove` の最初の実移動で**付け、**最終移動から 1.3 秒のアイドルタイマで外す**。`pointerenter` では付けない（境界イベントはスクロールでも合成発火するので、ユーザー入力ゼロで 900px 級リボンの合成テクスチャ＝DPR2 で概算 7MB を確保してしまう）。`pointerleave` 頼みの解除もしない（「カーソルをヒーロー内に置いたまま動かさない」という最も普通の状態でテクスチャが常駐し続ける）。自前 rAF は書かない（`quickTo` は GSAP の ticker で1フレーム1回しか DOM に書かず、トゥイーンが尽きれば ticker が寝る）
  - CTA hover / focus で背面の渦が `rotation +3.2deg` / `scale 1.012` ひと巻き締まる（0.55s）。ページ全体が1台の装置であることを伝える署名。**3.5deg を超えるとリボンの尾がリードの測度に掛かる**ので上限とする。hover と focus は**1つの状態に畳む**（`hovered || focused`）。独立に流すと「クリックでフォーカスを得たままカーソルを外すと、フォーカス中なのに渦が戻る」混線になる。focus 判定は `:focus-visible`（キーボード由来のみ）
  - **hover はポインタ環境限定（`hover: hover and pointer: fine`）、focus は reduce 以外なら常時**登録する。focus はキーボード由来の状態でポインタ能力とは無関係なので、外付けキーボード付きタブレット（`pointer: coarse`）でも Tab でフィードバックが返る
  - 入場の `onComplete`（`clearProps: 'all'`）は **CTA が触られていたら踏み倒さない**。CTA は 680ms からフェードインするが `pointer-events` は切っていないため、完了（1300ms）より前に hover / focus が始まりうる。無条件に剥がすと「触っているのに渦が中立へ戻り、一度カーソルを外して入れ直すまで復帰しない」状態になる（`overwrite: 'auto'` が守るのはトゥイーン同士の衝突だけで、この経路は別）
- focus-visible: `outline: 2px solid var(--color-accent)`（定義済み。塗りボタン上では ink に変える）
- **ページ遷移（View Transitions）**: **入力駆動・有限のナビゲーション語彙として全ページ可**（8章の「演出なし」は滞在中の話であり、遷移は含まない）。記事一覧の行 → 記事詳細では、タイトルと日付を共有要素（`view-transition-name` を記事 id から一意生成。同名衝突すると VT ごと失敗する）として連続変形させる。時間・イージングは変形の規約と同じ **0.2s ease**（globals.css の `::view-transition-*` で一括指定）。実装は `document.startViewTransition` を包む自前の `TransitionLink` + `ViewTransitionManager`（Next の experimental.viewTransition は React 実験ビルドを要求するため使わない）。**feature-detect 必須**で非対応ブラウザは通常遷移に自動フォールバック、`prefers-reduced-motion: reduce` では発火しない。ブラウザ戻る/進むの逆方向モーフは Next 内部挙動（history state の `__NA`、popstate リスナー登録順）に依存するベストエフォート（順序逆転時は通常遷移に落ちる）。**Next アップグレード時は戻る/進む VT を目視確認する**。ナビゲーション完了が 800ms（`NAVIGATION_TIMEOUT_MS`）を超えた場合は VT を打ち切り、クロスフェード後にコンテンツが無遷移で差し替わる（低速回線での意図された劣化モード）

## 8. ページ別の適用方針

| ページ | 演出 | 構成 |
|---|---|---|
| `/`（LP） | 有限・入力駆動のみ（ヒーロー入場「Pour & Coil」[GSAP + CSS keyframes、1.3秒で完全終了], ポインタパララックス[ヒーロー内・入力駆動], TypedTitle のクリック再打鍵, ShinyText[LP は1パス0.9s], ClickSpark[クリック駆動]） | hero（左テキスト + 右クロームリボン）+ セクション + リボン装飾（ミッド帯左端）+ ストリーム（Contact 前） |
| `/blog`, `/tags/*`, `/search` | 演出なし | eyebrow付きページ見出し + ヘアライン行リスト + monoピルのタグ |
| `/articles/*` | 演出なし | mono メタ → 見出し → 本文720px。読みやすさ最優先 |
| 404 | なし | mono `404` + 一言 + 帰りのリンク |

※ 表の「演出なし」は**ページ滞在中**（アイドル・スクロール中）の話。ページ遷移そのもの
（入力駆動・有限の View Transitions、7章参照）はナビゲーション語彙としてどのページでも使ってよい。

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
- ❌ アイドル時に `will-change` を残す（Paint が 0ms でも合成テクスチャが常駐して低電力機のメモリを食う）。入力駆動なら「開始時に付けて、**動きが止まったら**外す」＝解除の基準はポインタの在/不在ではなく**トゥイーンの動/停止**（アイドルタイマか `onComplete`）。入場なら `onComplete` で必ず剥がす
- ❌ 入場の `clearProps` を `willChange` だけで済ませること（恒等 `transform` が残るとスタッキング文脈と containing block を作り続ける。`clearProps: 'all'` にする。`transform-origin` は CSS 側に書いてあるので失われない）
- ❌ 変形する素材の箱に `overflow: clip` を足すこと（フェード帯より内側にクリップ線が落ちて矩形の継ぎ目が出る。4章参照）
- ❌ `transform` / `opacity` 以外のプロパティのアニメ（`width` / `top` / `filter` / `box-shadow` / `background-position`）。とくに `background-clip: text` 上の `background-position` はコンポジタに乗らず毎フレーム再ペイントする（ShinyText の `speed × passes` がそのまま「動き続ける秒数」になるので、有限かつ短くする）
- ❌ ポインタ演出でヒーロー矩形の `getBoundingClientRect` をキャッシュして座標正規化すること（スクロールで陳腐化し、実質スクロール連動になる。ビューポート正規化を使う）
- ❌ GSAP の `quickTo` / `resetTo` にプロパティの別名を渡すこと（`rotate` ではなく `rotation`。別名は**エラーも出さず何も動かない**）
