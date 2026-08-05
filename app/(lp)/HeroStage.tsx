'use client';

import { useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import styles from './page.module.css';

gsap.registerPlugin(useGSAP);

/*
 * ヒーローの「Pour & Coil(注ぎ込みと巻き取り)」。
 *
 * ribbon-hero.png は「左から流れてきたクロームが、右側で渦に巻き取られる」構図なので、
 * その運動をそのまま時間軸に写す:
 *   ① 背景色のカーテンが右へ退く    = クロームが左から注ぎ込む
 *   ② 渦の目を軸にコイルが締まって止まる = 巻き取りが完了する
 * 動くのは初回1回(1.3秒で完全終了)と、ポインタ移動 / CTA hover のときだけ。
 * スクロールは一切トリガにしない(DESIGN.md 9章)。
 *
 * ★素材を差し替えるときは、ワイプの向き(左→右)と transform-origin(渦の目)を
 *   必ず更新すること。両方ともこの画像の構図にハードコードされている。
 *
 * 分担:
 *   - 見出し・リード・CTA のテキスト入場は **CSS keyframes のまま**(page.module.css の
 *     .heroItem1〜4)。GSAP が落ちても本文が永久に消えないための可用性設計。
 *   - GSAP が持つのは装飾レイヤー(カーテンとリボン)だけ。
 */

/** (lp)/layout.tsx のインラインスクリプトが初回描画前に付ける入場保留フラグ */
const HOLD_CLASS = 'js-hero-hold';
/** 同スクリプトが付ける「この文書で保留機構が走った」目印(data-hero-hold="1") */
const HOLD_MARKER = '1';
/** 保留の解除役(HeroReveal の fonts.ready / インライン保険 1600ms)が両方死んだ場合の最終保険 */
const SAFETY_MS = 1800;
/*
 * 保留が解けた直後なら、まだ入場を再生してよい猶予(data-hero-hold-at からの経過)。
 * リボンが出て 1〜2 フレームしか経っていない状態からのワイプは逆再生に見えない。
 * この窓が無いと、ハイドレーションがインライン保険(1600ms)にわずかに負けただけで
 * 入場が丸ごと消える = 低電力機 + コールドキャッシュ = いちばん見せたい初見の条件で落ちる。
 */
const LATE_PLAY_MS = 200;

/*
 * この文書で入場を1度でも再生したかの目印(html[data-hero-played])。
 * フルリロードでは必ず未設定から始まるので、
 *   「インラインスクリプトが走った文書で、まだ再生していないマウント」= 初回ロードのハイドレーション
 *   それ以外                                                          = クライアント遷移でのマウント
 * を見分けられる。クライアント遷移では layout.tsx の <script> が再実行されず
 * 保留クラスが一度も付かないため、これが無いと「保留クラスが無い = 手遅れ」と誤判定して
 * 入場を丸ごと捨ててしまう(記事 → ロゴ → トップ、というサイトで最も踏まれる導線)。
 *
 * ★状態を **DOM に置く**のが要点。モジュールスコープの可変フラグにすると
 *   React StrictMode(dev 既定)の二重マウントで2回目が必ず「クライアント遷移」側に落ち、
 *   いちばん検証したい「初回ロードで保険に負けたら入場を捨てる」分岐が手元で再現できない。
 *   目印は play() の時点で立てるので、二重マウントでも本番と同じ分岐を通る。
 */
const PLAYED_FLAG = 'heroPlayed';

/*
 * ワイプ(注ぎ込みのカーテン)の位置。単位は GSAP の xPercent = **カーテン自身の幅**に対する %。
 * CSS 側は left:-6% / width:136%(いずれも親 .heroVisual 基準)なので、
 * 親基準の左端 = -6 + xPercent * 1.36 になる。左端 8% は透明→不透明のランプ(=流れの先端)。
 *   START(-8): 不透明部の左端 = -6 + (-10.88) + 0.08*136 = -6.0%   → 左を 6% 余して覆う
 *              カーテン右端   = -6 + (-10.88) + 136      = 119.1%  → 右を 19% 余して覆う
 *   END(88)  : カーテン左端   = -6 + 119.68              = 113.7%  → 完全に右へ退避
 * ※ xPercent を「親幅に対する %」と誤読すると数値が合わなくなるので注意。
 * ※ ランプを 16% → 8% に締めたのは「動く先端」を画素として見せるため。
 *   16% だと先端が幅 196px のなだらかな勾配になり、差分が全域に薄く散って
 *   「ワイプしている」ことが知覚できなかった(= ただの一斉フェードに見えた)。
 */
const WIPE_START = -8;
const WIPE_END = 88;

/*
 * 渦の目(= 回転軸)。ribbon-hero.png(1672x941)を実測した値:
 *   内芯 ≒ 69% / 55%、渦全体の視覚重心 ≒ 72% / 49%。
 * 「巻き取られて止まった」と読ませたいので重心寄りの中間を採る。
 * CSS(.ribbonPar / .ribbonCoil)にも同値を書いてあり、clearProps しても失われない。
 */
const COIL_ORIGIN = '71% 50%';

/*
 * 入場: コイルは反時計回りに開いた状態から時計回り(= 素材が巻かれる向き)に締まって止まる。
 * ease は power4.out ではなく power2.out。power4.out は 450ms で 94% 進んでしまい
 * 「巻き取り」の可視時間が 250ms しか無かった(振幅を上げても速すぎて読めない)。
 * power2.out + rotation -8deg で可視時間 ≒ 600ms を確保する。
 * scale は上げない: .ribbonFade の 12% 帯を超えると縁のフェードが間に合わなくなる。
 */
const COIL_FROM = { rotation: -8, scale: 1.055 };

/** CTA hover でひと巻き締まる量。3.5deg を超えるとリード文の可読性に触るので上限とする */
const COIL_HOVER_DEG = 3.2;

/*
 * ポインタ視差。動かすのは金属レイヤーだけで、**版面(見出し・リード・CTA)は 1px も動かさない**。
 * 左揃えのセリフ組版がマウスで泳ぐと「静かな紙面」の語り口と正面衝突するため。
 * 900px 級の物体に対して 18px(=2%)では「動いた気がする」止まりだったので、
 * 縁のフェード帯(横 108px / 縦 61px)を食い潰さない範囲まで上げてある。
 */
const PAR_X = 30;
const PAR_Y = 16;
const PAR_ROT = 1.6;

/*
 * 視差の will-change を落とすまでのアイドル時間(最終ポインタ移動から)。
 * rotation の追従が 1.1s なので、それを超えた値にする。
 * pointerleave 頼みにすると「カーソルをヒーロー内に置いたまま動かさない」という
 * いちばん普通の状態で合成テクスチャが常駐し続ける(DESIGN.md 9章)。
 */
const PAR_IDLE_MS = 1300;

export default function HeroStage({ children }: { children: ReactNode }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const stage = root.current;
      if (!stage) return;

      const html = document.documentElement;
      const pick = (name: string) => stage.querySelector<HTMLElement>(`[data-hero="${name}"]`);

      const par = pick('par');
      const coil = pick('coil');
      const wipe = pick('wipe');
      const ctaPrimary = pick('cta-primary');

      /* このドキュメントで初回ロードのハイドレーションか。
         判定は「まだ再生していない」と「インラインスクリプトの目印」の合わせ技で、
         目印が無い = そもそも別レイアウト(ブログ側)で始まった文書 → クライアント遷移 */
      const isHydration = !html.dataset[PLAYED_FLAG] && html.dataset.heroHold === HOLD_MARKER;

      /* 事前状態(inline style)を全部剥がして素の静止画に戻す。
         ここを通った後は「演出は無いが内容は正しく見える」状態に必ず着地する。
         ※ 保留クラスは外さない: 解除は HeroReveal(fonts.ready)とインライン保険の
           2重機構の仕事で、ここで肩代わりするとフォント未到着のまま
           テキスト入場が始まる Issue #9 の状態に戻る */
      const bail = () => {
        const targets = [par, coil, wipe].filter((el): el is HTMLElement => !!el);
        if (targets.length > 0) gsap.set(targets, { clearProps: 'all' });
      };

      if (!par || !coil || !wipe) {
        bail();
        return;
      }

      /* CTA に触れると背面の渦がひと巻き締まる状態機械。**メディアクエリのブロックより外**に置く。
         理由は2つ:
           - 入場の onComplete(clearProps)が「今この瞬間 CTA が触られているか」を読む必要がある
           - hover はポインタ環境限定だが focus はキーボード由来なのでポインタ能力と無関係。
             登録先のブロックが違う(C と D)ので、状態だけは1箇所に持つ
         hover と focus を1つの状態に畳むのは、独立に流すと「クリックでフォーカスを得たまま
         カーソルを外すとフォーカス中なのに渦が戻る」混線が起きるため */
      let hovered = false;
      let focused = false;
      const applyCoil = () => {
        const on = hovered || focused;
        if (on) coil.style.willChange = 'transform';
        gsap.to(coil, {
          rotation: on ? COIL_HOVER_DEG : 0,
          scale: on ? 1.012 : 1,
          duration: on ? 0.55 : 0.7,
          ease: 'power2.out',
          overwrite: 'auto',
          // 中立へ戻り切ったら合成レイヤーのヒントも inline transform も落とす
          // (恒等 transform を残すとスタッキング文脈と containing block を作り続ける)
          onComplete: on
            ? undefined
            : () => {
                coil.style.willChange = '';
                gsap.set(coil, { clearProps: 'all' });
              },
        });
      };

      const mm = gsap.matchMedia();

      try {
        /* --- A) reduce: 入場もポインタ視差も「作らない」 -----------------------------
           globals.css の一括対応は CSS アニメ用で GSAP には効かないため、JS 側で切る。
           OS 設定を途中で切り替えると matchMedia が no-preference 側を revert して
           inline style も戻る(= 途中変更に追従する) */
        mm.add('(prefers-reduced-motion: reduce)', () => {
          gsap.set([par, coil, wipe], { clearProps: 'all' });
        });

        /* --- B) 入場(有限・1回) ------------------------------------------------- */
        mm.add('(prefers-reduced-motion: no-preference)', () => {
          const held = html.classList.contains(HOLD_CLASS);

          /* 初回ロードで保留が既に解けている = ハイドレーションがインライン保険(1600ms)より
             遅れた。リボンは既に最終状態で描かれているので、途中から始めると
             「一度見えたリボンを隠してからワイプする」逆再生になる(意図された劣化モード)。
             ただし解除の直後(LATE_PLAY_MS 以内)なら、リボンは 1〜2 フレームしか
             出ていないので再生してよい。入場をいちばん見せたい相手(コールドキャッシュの
             初回訪問者)が、まさにこの境界に落ちるため。
             クライアント遷移(!isHydration)はそもそもこれに当たらない: useGSAP は
             useLayoutEffect なので、この時点でリボンはまだ一度も描かれていない */
          const releasedAt = Number(html.dataset.heroHoldAt);
          const justReleased =
            Number.isFinite(releasedAt) && performance.now() - releasedAt < LATE_PLAY_MS;
          if (!held && isHydration && !justReleased) return;

          gsap.set(wipe, {
            // CSS 既定は display:none。JS が死んでいる間はカーテンが存在しないので、
            // 「白い幕が居座る」破綻経路が構造的に無い
            display: 'block',
            xPercent: WIPE_START,
            willChange: 'transform',
          });
          gsap.set(coil, { ...COIL_FROM, transformOrigin: COIL_ORIGIN, willChange: 'transform' });

          const tl = gsap
            .timeline({ paused: true, defaults: { overwrite: 'auto' } })
            // ① 注ぎ込み: カーテンが右へ退く = リボンが左から流れ込む。
            //    ease は power1.out(quad)。先端が最初のフレームから動き出し、
            //    0〜600ms に可視の移動が均等に散る。
            //    - power3.out(quart) = 旧値: 200ms で 67% 進み、先端が見える前に終わる
            //    - power2.inOut(cubic) = 逆に最初の 250ms がほぼ静止(実測 300ms で 11%)で、
            //      保留解除の直後に「何も起きない間」ができる
            .to(wipe, { xPercent: WIPE_END, duration: 0.8, ease: 'power1.out' }, 0)
            // ② 巻き取り: 渦の目を軸にコイルが締まって静止する。
            //    ★開始を 450ms まで後ろ倒しするのが要点。0.18 だと -8deg の大半が
            //    「まだカーテンに隠れている間」に消化され、訪問者が知覚できるのは
            //    『画像が左から拭き出される』1イベントだけになる(実測: 露出後の
            //    450→800ms の画素差分は平均 3.9/255 しかなく、金属は事実上静止していた)。
            //    幕が退いた後に丸ごと演じさせると、軸(渦の目 71%)から遠い尾側が
            //    約 90px(=0.71w × sin8°)掃くので、巻き取りが画素として読める
            .to(coil, { rotation: 0, scale: 1, duration: 0.85, ease: 'power2.out' }, 0.45);

          tl.eventCallback('onComplete', () => {
            // アイドル時 Paint/Raster 0ms の担保。will-change を残すとテクスチャが常駐する。
            // coil も 'all' で剥がす(恒等 transform を残すとスタッキング文脈と
            // containing block を作り続ける)。transform-origin は CSS 側にあるので失われない
            gsap.set(wipe, { clearProps: 'all' }); // inline display も消えて CSS の none に戻る
            // ただし入場中に CTA が触られていたら踏み倒さない。CTA は 680ms から
            // フェードインするが pointer-events は切っていないので、完了(1300ms)より前に
            // hover/focus が始まりうる。ここで無条件に剥がすと「触っているのに渦が中立へ戻り、
            // 一度カーソルを外して入れ直すまで復帰しない」状態になる
            // (overwrite:'auto' が守るのはトゥイーン同士の衝突だけで、この経路は別)。
            // 触られている側の後始末は applyCoil の戻り onComplete が同じ clearProps で行う
            if (!hovered && !focused) gsap.set(coil, { clearProps: 'all' });
          });

          let mo: MutationObserver | null = null;
          let safety = 0;
          const play = () => {
            mo?.disconnect();
            mo = null;
            if (safety) {
              window.clearTimeout(safety);
              safety = 0;
            }
            html.classList.remove(HOLD_CLASS);
            // 「この文書では入場が走った」= 以後のマウントはクライアント遷移として扱う
            html.dataset[PLAYED_FLAG] = '1';
            if (tl.progress() === 0 && !tl.isActive()) tl.play();
          };

          if (!held) {
            /* クライアント遷移: 保留機構(インライン script)は再実行されないので
               待つ相手がいない。事前状態は上の gsap.set で初回ペイント前に置けている */
            play();
          } else {
            // HeroReveal / layout.tsx は無改修のまま、クラス除去に相乗りする(制約: 保留機構を壊さない)
            mo = new MutationObserver(() => {
              if (!html.classList.contains(HOLD_CLASS)) play();
            });
            mo.observe(html, { attributes: true, attributeFilter: ['class'] });
            safety = window.setTimeout(play, SAFETY_MS);
          }

          return () => {
            mo?.disconnect();
            if (safety) window.clearTimeout(safety);
            tl.kill();
          };
        });

        /* --- C) ポインタ視差 + CTA hover(入力駆動) --------------------------------
           タッチ端末では listener そのものを生成しない(メディアクエリで分岐) */
        mm.add(
          '(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)',
          () => {
            /* transform-origin は CSS(.ribbonPar / .ribbonCoil)に置いてあり、GSAP は
               初回タッチ時に computed style から読む。ここで gsap.set しないのは、
               ポインタを一度も動かさない人の DOM に恒等 transform を書き込まないため */

            /* プロパティ名は GSAP の正準名で書くこと。quickTo は内部の resetTo() が
               名前の完全一致で PropTween を引くため、'rotate' のような別名だと
               **エラーも出さずに何も動かない**(実機で確認済み)。'rotation' が正 */
            const parX = gsap.quickTo(par, 'x', { duration: 0.9, ease: 'power3.out' });
            const parY = gsap.quickTo(par, 'y', { duration: 0.9, ease: 'power3.out' });
            const parR = gsap.quickTo(par, 'rotation', { duration: 1.1, ease: 'power3.out' });

            /* 座標はビューポート正規化する。ヒーローの getBoundingClientRect をキャッシュする
               方式にすると、ポインタを置いたままスクロールされたとき古い rect で正規化して
               リボンが跳ねる(= 実質スクロール連動になる)。ここを rect 方式に変えないこと */
            let vw = window.innerWidth;
            let vh = window.innerHeight;
            const onResize = () => {
              vw = window.innerWidth;
              vh = window.innerHeight;
            };

            let lastX = Number.NaN;
            let lastY = Number.NaN;

            /* will-change は「動いている間だけ」。付けっぱなしは合成テクスチャの常駐で、
               低電力機のメモリを食う(DESIGN.md 9章の禁止事項) */
            let hinted = false;
            let idle = 0;
            const dropHint = () => {
              if (idle) {
                window.clearTimeout(idle);
                idle = 0;
              }
              if (hinted) {
                hinted = false;
                par.style.willChange = '';
              }
            };
            const hint = () => {
              if (!hinted) {
                hinted = true;
                par.style.willChange = 'transform';
              }
              if (idle) window.clearTimeout(idle);
              // ポインタがヒーロー内で止まったまま離れない場合でも必ず剥がれる
              idle = window.setTimeout(dropHint, PAR_IDLE_MS);
            };

            /* ★pointerenter では hint() を呼ばない。境界イベントはスクロールでも合成発火する
               (静止したカーソルの下をコンテンツが通過する)ため、ユーザー入力ゼロで
               900px 級リボンの合成テクスチャ(DPR2 で概算 7MB)を 1.3 秒確保してしまう。
               will-change を付ける基準は「ポインタが在ること」ではなく「実際に動いたこと」 */
            const onMove = (e: PointerEvent) => {
              /* 一部ブラウザはスクロール直後に hover 状態更新のため座標同一の pointermove を
                 1発撃つ。弾かないと「スクロールで演出が発火する」経路が残る */
              if (Math.abs(e.clientX - lastX) < 1 && Math.abs(e.clientY - lastY) < 1) return;
              lastX = e.clientX;
              lastY = e.clientY;
              hint();
              const nx = (e.clientX / vw) * 2 - 1;
              const ny = (e.clientY / vh) * 2 - 1;
              parX(nx * PAR_X);
              parY(ny * PAR_Y);
              parR(nx * PAR_ROT);
            };
            const onLeave = (e: PointerEvent) => {
              /* pointerleave も onMove と同じ 1px 判定を通す。ポインタを止めたまま
                 スクロールするとコンテンツが下から抜けてブラウザが pointerleave を
                 合成発火するため、無条件にトゥイーンすると「スクロールで演出が発火する」
                 経路が leave 側に残る(実測で 42 フレームぶん動いた)。
                 ★座標が未記録(Number.NaN = このヒーロー内で一度も実移動していない)も
                 「動いていない」側に畳む。NaN との比較は常に false なので、素通しすると
                 「カーソルを乗せたまま一度も動かさずスクロール」で 42 フレームが復活する。
                 合成 leave では **何もしない**(gsap.set で中立へ戻すのも1回の再描画になり、
                 リボンがまだ見えている位置で 6〜7px の瞬間移動として画面に出る)。
                 視差の残り値はただの静止 transform で、will-change は 1.3 秒の
                 アイドルタイマが落とすので、放置しても常駐コストは増えない */
              const moved =
                Number.isFinite(lastX) &&
                (Math.abs(e.clientX - lastX) >= 1 || Math.abs(e.clientY - lastY) >= 1);
              if (!moved) return;
              lastX = Number.NaN;
              lastY = Number.NaN;
              gsap.to(par, {
                x: 0,
                y: 0,
                rotation: 0,
                duration: 0.7,
                ease: 'power2.out',
                overwrite: 'auto',
                onComplete: dropHint,
              });
            };

            stage.addEventListener('pointermove', onMove, { passive: true });
            stage.addEventListener('pointerleave', onLeave);
            window.addEventListener('resize', onResize, { passive: true });

            /* CTA hover で背面の渦がひと巻き締まる。ページ全体が1台の装置であることを
               一撃で伝える署名。状態(hovered/focused)と applyCoil は上位スコープにある */
            const onCtaEnter = () => {
              hovered = true;
              applyCoil();
            };
            const onCtaLeave = () => {
              hovered = false;
              applyCoil();
            };

            ctaPrimary?.addEventListener('pointerenter', onCtaEnter);
            ctaPrimary?.addEventListener('pointerleave', onCtaLeave);

            return () => {
              stage.removeEventListener('pointermove', onMove);
              stage.removeEventListener('pointerleave', onLeave);
              window.removeEventListener('resize', onResize);
              ctaPrimary?.removeEventListener('pointerenter', onCtaEnter);
              ctaPrimary?.removeEventListener('pointerleave', onCtaLeave);
              hovered = false;
              dropHint();
              coil.style.willChange = '';
            };
          },
        );

        /* --- D) CTA の focus 追従(キーボード駆動) ----------------------------------
           focus はキーボード由来の状態でポインタ能力とは無関係なので、
           C(hover: hover / pointer: fine)の中に置かない。外付けキーボード付きの
           タブレット等(pointer: coarse)でも Tab で渦のフィードバックが返る */
        mm.add('(prefers-reduced-motion: no-preference)', () => {
          if (!ctaPrimary) return;

          const onCtaFocus = () => {
            /* DESIGN.md 7章は focus-visible 基準なので、マウスクリックの focus では
               発火させない(:focus-visible 未対応ブラウザでは従来どおり全 focus で発火) */
            let visible = true;
            try {
              visible = ctaPrimary.matches(':focus-visible');
            } catch {
              visible = true;
            }
            focused = visible;
            applyCoil();
          };
          const onCtaBlur = () => {
            focused = false;
            applyCoil();
          };

          ctaPrimary.addEventListener('focus', onCtaFocus);
          ctaPrimary.addEventListener('blur', onCtaBlur);

          return () => {
            ctaPrimary.removeEventListener('focus', onCtaFocus);
            ctaPrimary.removeEventListener('blur', onCtaBlur);
            focused = false;
          };
        });
      } catch {
        // 構築中に落ちても「事前状態のまま固まる」ことがないようにする
        mm.revert();
        bail();
        return;
      }

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className={styles.heroOuter}>
      {children}
    </section>
  );
}
