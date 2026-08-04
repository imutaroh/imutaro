'use client';

import { useId, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import styles from './FizzmHero.module.css';
import { FLAVORS, type Flavor } from './flavors';

gsap.registerPlugin(useGSAP);

/** SSR 時点で active 以外のレイヤーを隠すための初期スタイル */
function hidden(isHidden: boolean): CSSProperties {
  return isHidden ? { opacity: 0, visibility: 'hidden' } : { opacity: 1, visibility: 'visible' };
}

/** hex 2色の線形ミックス（SVG グラデの色を TS 側で確定させる） */
function mix(hexA: string, hexB: string, t: number): string {
  const a = hexA.replace('#', '');
  const b = hexB.replace('#', '');
  const ch = (i: number) => {
    const va = parseInt(a.slice(i, i + 2), 16);
    const vb = parseInt(b.slice(i, i + 2), 16);
    return Math.round(va + (vb - va) * t)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${ch(0)}${ch(2)}${ch(4)}`;
}

function marqueeSeq(flavor: Flavor, prefix: string): ReactNode[] {
  const els: ReactNode[] = [];
  for (let r = 0; r < 3; r += 1) {
    flavor.marqueeWords.forEach((word, i) => {
      els.push(
        <span
          key={`${prefix}-${r}-${i}`}
          className={styles.mWord}
          style={{ color: i % 2 === 0 ? flavor.tone1 : flavor.tone2 }}
        >
          {word}
        </span>,
      );
    });
  }
  return els;
}

function MarqueeTrack({ flavor }: { flavor: Flavor }) {
  return (
    <div className={styles.mTrack}>
      <div className={styles.mSeq}>{marqueeSeq(flavor, 'a')}</div>
      <div className={styles.mSeq}>{marqueeSeq(flavor, 'b')}</div>
    </div>
  );
}

/* 液面の波。水平タイル可能なパス（開始/終端の y と傾きが一致） */
const WAVE_BACK = 'M0,84 C240,124 480,44 720,84 C960,124 1200,44 1440,84 L1440,160 L0,160 Z';
const WAVE_FRONT = 'M0,96 C240,58 480,134 720,96 C960,58 1200,134 1440,96 L1440,160 L0,160 Z';
/* 上端の稜線だけの開パス（波頭のハイライト用） */
const CREST_BACK = 'M0,84 C240,124 480,44 720,84 C960,124 1200,44 1440,84';
const CREST_FRONT = 'M0,96 C240,58 480,134 720,96 C960,58 1200,134 1440,96';

/** 単色ベタをやめ、縦グラデ＋波頭の 1.5px ハイライトで液体の照りを出す */
function Wave({ d, crest, fill }: { d: string; crest: string; fill: string }) {
  const gid = useId();
  return (
    <svg className={styles.wave} viewBox="0 0 1440 160" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={mix(fill, '#ffffff', 0.2)} />
          <stop offset="0.42" stopColor={fill} />
          <stop offset="1" stopColor={mix(fill, '#000000', 0.32)} />
        </linearGradient>
      </defs>
      <path d={d} fill={`url(#${gid})`} />
      <path
        d={crest}
        fill="none"
        stroke={mix(fill, '#ffffff', 0.5)}
        strokeWidth="1.5"
        strokeOpacity="0.55"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function FloatsLayer({
  flavor,
  depth,
  isHidden,
}: {
  flavor: Flavor;
  depth: 'back' | 'front';
  isHidden: boolean;
}) {
  return (
    <div
      data-f={flavor.id}
      data-kind="visual"
      data-scale=""
      className={styles.layer}
      style={hidden(isHidden)}
      aria-hidden="true"
    >
      {flavor.floats
        .filter((s) => s.depth === depth)
        .map((s, i) => (
          <span
            key={i}
            className={`${styles.sprite} ${depth === 'back' ? styles.spriteBack : ''}`}
            style={
              {
                left: s.left,
                width: s.size,
                transform: `translate(-50%, -50%) rotate(${s.rot ?? 0}deg)`,
                '--sp-top': s.top,
                '--sp-top-m': s.topM ?? s.top,
                '--spblur': `${s.blur ?? 0}px`,
              } as CSSProperties
            }
          >
            <img data-sprite="" src={s.src} alt="" draggable={false} />
          </span>
        ))}
    </div>
  );
}

export default function FizzmHero() {
  const rootRef = useRef<HTMLElement>(null);
  const backParRef = useRef<HTMLDivElement>(null);
  const bottleParRef = useRef<HTMLDivElement>(null);
  const frontParRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const { contextSafe } = useGSAP(
    () => {
      const q = gsap.utils.selector(rootRef);

      // 非アクティブレイヤーは「次の入場」に備えて少し拡大しておく
      gsap.set(q(`[data-scale]:not([data-f="${FLAVORS[0].id}"])`), { scale: 1.045 });

      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // 浮遊オブジェクトのゆらぎ（GSAP 側なので reduce 時はそもそも作らない）
        q('[data-sprite]').forEach((el) => {
          gsap.to(el, {
            y: `+=${gsap.utils.random(10, 22)}`,
            yoyo: true,
            repeat: -1,
            ease: 'sine.inOut',
            duration: gsap.utils.random(2.4, 4.6),
            delay: gsap.utils.random(0, 1.6),
          });
          gsap.to(el, {
            rotation: `+=${gsap.utils.random(-10, 10)}`,
            yoyo: true,
            repeat: -1,
            ease: 'sine.inOut',
            duration: gsap.utils.random(3.2, 5.6),
          });
        });

        // マウスパララックス（奥・瓶・手前で深度を変える）
        const groups = [
          { el: backParRef.current!, mx: 14, my: 9 },
          { el: bottleParRef.current!, mx: -9, my: -6 },
          { el: frontParRef.current!, mx: 28, my: 18 },
        ].map((g) => ({
          mx: g.mx,
          my: g.my,
          x: gsap.quickTo(g.el, 'x', { duration: 0.9, ease: 'power3.out' }),
          y: gsap.quickTo(g.el, 'y', { duration: 0.9, ease: 'power3.out' }),
        }));

        const onMove = (e: PointerEvent) => {
          const nx = (e.clientX / window.innerWidth) * 2 - 1;
          const ny = (e.clientY / window.innerHeight) * 2 - 1;
          groups.forEach((g) => {
            g.x(nx * g.mx);
            g.y(ny * g.my);
          });
        };
        window.addEventListener('pointermove', onMove);
        return () => window.removeEventListener('pointermove', onMove);
      });
    },
    { scope: rootRef },
  );

  const switchTo = contextSafe((idx: number) => {
    if (idx === activeRef.current) return;
    activeRef.current = idx;
    setActive(idx);

    const fl = FLAVORS[idx];
    const q = gsap.utils.selector(rootRef);
    const sel = (kind: string, isIn: boolean) =>
      isIn
        ? q(`[data-kind="${kind}"][data-f="${fl.id}"]`)
        : q(`[data-kind="${kind}"][data-f]:not([data-f="${fl.id}"])`);
    const vIn = sel('visual', true);
    const vOut = sel('visual', false);
    const mIn = sel('marquee', true);
    const mOut = sel('marquee', false);
    const cIn = sel('card', true);
    const cOut = sel('card', false);
    const inScale = q(`[data-scale][data-f="${fl.id}"]`);
    const outScale = q(`[data-scale]:not([data-f="${fl.id}"])`);
    const inSprites = q(`[data-f="${fl.id}"] [data-sprite]`);
    const rootEl = rootRef.current!;
    const veil = veilRef.current!;

    tlRef.current?.kill();

    // reduce 時は瞬時差し替え
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(q('[data-f]'), { clearProps: 'zIndex' });
      gsap.set([...vOut, ...mOut, ...cOut], { autoAlpha: 0 });
      gsap.set(q('[data-scale]'), { scale: 1 });
      gsap.set(q('[data-kind="marquee"]'), { xPercent: 0 });
      gsap.set(q('[data-kind="card"]'), { y: 0 });
      gsap.set(q('[data-sprite]'), { autoAlpha: 1, scale: 1 });
      gsap.set(veil, { autoAlpha: 0 });
      gsap.set([...vIn, ...mIn, ...cIn], { autoAlpha: 1 });
      rootEl.style.setProperty('--accent', fl.accent);
      return;
    }

    // 遷移設計:
    // - 視覚レイヤー（背景/瓶/浮遊/波）: 入場側を不透明のまま下に敷き、退場側のフェードだけで遷移。
    //   zIndex の入れ替えは各グループ（isolation: isolate）内で閉じる
    // - 補色同士（青⇔金）のクロスフェードが泥色を通らないよう、背景の上に暗トーンのビートを挟む
    // - テキスト系はクロスフェードしない: マーキーは +100% からの水平スライドで置換、
    //   カードは「先に消してから入れる」シーケンシャル（半透明グリフの二重露光を防ぐ）
    // 連打時は kill + overwrite で常に現状から遷移する。
    const tl = gsap.timeline({ defaults: { overwrite: 'auto' } });
    tl.set(vOut, { zIndex: 1 }, 0)
      .set(vIn, { zIndex: 0, autoAlpha: 1 }, 0)
      .set(inSprites, { autoAlpha: 0, scale: 0.85 }, 0)
      .to(inScale, { scale: 1, duration: 0.9, ease: 'power3.out' }, 0)
      // 補色クロスフェード(金⇔紫 等)の混色は veil の陰に完全に隠す:
      // veil を 0.78 まで上げて 0.16〜0.40 をホールドし、vOut のフェード
      // (0.12〜0.52)がホールド〜減衰の陰に収まるよう同期させる
      .to(vOut, { autoAlpha: 0, duration: 0.4, ease: 'power2.inOut' }, 0.12)
      .to(veil, { autoAlpha: 0.78, duration: 0.16, ease: 'power2.in' }, 0)
      .to(veil, { autoAlpha: 0, duration: 0.5, ease: 'power2.out' }, 0.4)
      .to(rootEl, { '--accent': fl.accent, duration: 0.6, ease: 'power2.inOut' }, 0)
      .to(
        inSprites,
        { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'back.out(1.6)', stagger: 0.055 },
        0.18,
      )
      // マーキーは「退場が完全に消えてから入場」のシーケンシャル。
      // 同時に走らせると同じ帯でグリフが二重露光する(レビュー指摘)
      .to(mOut, { xPercent: -24, autoAlpha: 0, duration: 0.2, ease: 'power2.in' }, 0)
      .fromTo(
        mIn,
        { xPercent: 100, autoAlpha: 1 },
        { xPercent: 0, duration: 0.8, ease: 'power3.out' },
        0.22,
      )
      .to(cOut, { autoAlpha: 0, y: -6, duration: 0.18, ease: 'power1.in' }, 0)
      // カードは背景ビートが明けてから入場させ、「世界が替わる→商品情報」の順を守る
      .fromTo(
        cIn,
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power2.out' },
        0.42,
      )
      .set(q('[data-kind="card"]'), { y: 0 })
      .set(mOut, { xPercent: 0 })
      .set(outScale, { scale: 1.045 })
      .set(q('[data-f]'), { clearProps: 'zIndex' });
    tlRef.current = tl;
  });

  return (
    <section
      ref={rootRef}
      className={styles.stage}
      style={{ '--accent': FLAVORS[0].accent } as CSSProperties}
      aria-label="FIZZM クラフトソーダ"
    >
      {/* フルブリード背景（フレーバー色世界）。zIndex 入れ替えを閉じ込めるためグループで包む */}
      <div className={styles.layer}>
        {FLAVORS.map((f, i) => (
          <div
            key={f.id}
            data-f={f.id}
            data-kind="visual"
            className={styles.bg}
            style={{ ...hidden(i !== 0), background: f.bg }}
          >
            <div
              className={styles.glow}
              style={{ background: `radial-gradient(closest-side, ${f.glow}, transparent 72%)` }}
            />
            {/* 切り抜き hero で失った「足元の光だまり」を再構成する */}
            <div
              className={styles.footGlow}
              style={{ background: `radial-gradient(50% 100% at 50% 100%, ${f.glow}, transparent 72%)` }}
            />
          </div>
        ))}
      </div>

      {/* フレーバー間クロスフェードの中間色（泥色）を隠す暗トーンのビート */}
      <div ref={veilRef} className={styles.veil} aria-hidden="true" />

      {/* 巨大タイポマーキー（瓶の背後）。非アクティブは CSS アニメを停止 */}
      <div className={styles.layer} aria-hidden="true">
        {FLAVORS.map((f, i) => (
          <div
            key={f.id}
            data-f={f.id}
            data-kind="marquee"
            data-live={i === active ? 'on' : 'off'}
            className={`${styles.layer} ${styles.mLayer}`}
            style={hidden(i !== 0)}
          >
            <div className={styles.marqueeLine}>
              <MarqueeTrack flavor={f} />
            </div>
          </div>
        ))}
      </div>

      {/* 奥の浮遊オブジェクト */}
      <div ref={backParRef} className={styles.layer}>
        {FLAVORS.map((f, i) => (
          <FloatsLayer key={f.id} flavor={f} depth="back" isHidden={i !== 0} />
        ))}
      </div>

      {/* 瓶（背景除去済みの切り抜き。シルエットとハロだけがタイポを隠す） */}
      <div ref={bottleParRef} className={styles.layer}>
        {FLAVORS.map((f, i) => (
          <div
            key={f.id}
            data-f={f.id}
            data-kind="visual"
            data-scale=""
            className={styles.layer}
            style={hidden(i !== 0)}
          >
            <div className={styles.heroPos}>
              <img className={styles.hero} src={f.hero} alt={`FIZZM ${f.nameEn} のボトル`} draggable={false} />
            </div>
          </div>
        ))}
      </div>

      {/* 液面（フレーバー色の波の床。瓶の足元を全幅で受け止める） */}
      <div className={styles.layer} aria-hidden="true">
        {FLAVORS.map((f, i) => (
          <div key={f.id} data-f={f.id} data-kind="visual" className={styles.floorLayer} style={hidden(i !== 0)}>
            <div className={`${styles.waveDrift} ${styles.waveBack}`}>
              <Wave d={WAVE_BACK} crest={CREST_BACK} fill={f.wave1} />
              <Wave d={WAVE_BACK} crest={CREST_BACK} fill={f.wave1} />
            </div>
            <div className={`${styles.waveDrift} ${styles.waveFront}`}>
              <Wave d={WAVE_FRONT} crest={CREST_FRONT} fill={f.wave2} />
              <Wave d={WAVE_FRONT} crest={CREST_FRONT} fill={f.wave2} />
            </div>
          </div>
        ))}
      </div>

      {/* 手前の浮遊オブジェクト */}
      <div ref={frontParRef} className={styles.layer}>
        {FLAVORS.map((f, i) => (
          <FloatsLayer key={f.id} flavor={f} depth="front" isHidden={i !== 0} />
        ))}
      </div>

      <div className={styles.vignette} aria-hidden="true" />

      <header className={styles.header}>
        <div className={styles.hLeft}>
          <h1 className={styles.logo}>FIZZM</h1>
          <nav className={styles.nav}>
            <span>FLAVORS</span>
            <span>STORY</span>
            <span>STOCKISTS</span>
            <span>JOURNAL</span>
          </nav>
        </div>
        <div className={styles.hRight}>
          <div className={styles.tagline}>
            <span>Fizz the Moment.</span>
            <small>弾ける瞬間を、瓶に詰めた。</small>
          </div>
          <button type="button" className={styles.headCta}>
            ONLINE STORE
          </button>
        </div>
      </header>

      <div className={styles.bottomBar}>
        {/* 商品カード */}
        <div className={styles.card}>
          <div className={styles.cardBrand}>FIZZM CRAFT SODA</div>
          <div className={styles.cardSwap}>
            {FLAVORS.map((f, i) => (
              <div key={f.id} data-f={f.id} data-kind="card" className={styles.cardLayer} style={hidden(i !== 0)}>
                <div className={styles.cardTitleRow}>
                  <h2 className={styles.cardName}>{f.nameEn}</h2>
                  <span className={styles.cardPrice}>{f.price}</span>
                </div>
                <p className={styles.cardJa}>{f.nameJa}</p>
                <p className={styles.cardDesc}>{f.desc}</p>
                <p className={styles.cardMeta}>{f.meta}</p>
              </div>
            ))}
          </div>
          <div className={styles.cardActions}>
            <button type="button" className={styles.cardCta}>
              ADD TO CART
            </button>
            <span className={styles.cardHint}>全国配送 / 6本セット</span>
          </div>
        </div>

        {/* フレーバー切替 */}
        <div className={styles.switcher} role="group" aria-label="フレーバー切替">
          {FLAVORS.map((f, i) => (
            <button
              key={f.id}
              type="button"
              className={`${styles.swBtn} ${i === active ? styles.swActive : ''}`}
              aria-pressed={i === active}
              onClick={() => switchTo(i)}
            >
              <span className={styles.swDot} style={{ background: f.dot }} />
              {f.btnLabel}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
