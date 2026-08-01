'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './MidStreamBackground.module.css';

// ページ中盤(Learning Log〜Stack)の背面を流れるデータストリーム。
// ヒーローの計器盤が「観測」なら、こちらは「日々流れていく学び」。
// preserveAspectRatio="none" で帯全体に引き伸ばすため、
// 線幅は vector-effect: non-scaling-stroke で一定に保つ。
const SAMPLE_XS = [-20, 110, 240, 370, 500, 630, 760, 890, 1020];
const VIEWBOX_HEIGHT = 500;

function lineY(baseY: number, x: number, phase: number): number {
  return baseY + 16 * Math.sin(x / 160 + phase) + 7 * Math.sin(x / 63 + phase * 2.1);
}

function smoothPath(points: { x: number; y: number }[]): string {
  const fmt = (n: number) => n.toFixed(1);
  let d = `M ${fmt(points[0].x)} ${fmt(points[0].y)}`;
  for (let i = 1; i < points.length - 1; i++) {
    const midX = (points[i].x + points[i + 1].x) / 2;
    const midY = (points[i].y + points[i + 1].y) / 2;
    d += ` Q ${fmt(points[i].x)} ${fmt(points[i].y)} ${fmt(midX)} ${fmt(midY)}`;
  }
  const last = points[points.length - 1];
  d += ` L ${fmt(last.x)} ${fmt(last.y)}`;
  return d;
}

const LINE_COUNT = 7;
const LINES = Array.from({ length: LINE_COUNT }, (_, i) => {
  const baseY = 50 + i * 66;
  const phase = i * 1.35;
  const points = SAMPLE_XS.map((x) => ({ x, y: lineY(baseY, x, phase) }));
  const accent = i % 3 === 1;
  return { id: `stream-${i}`, d: smoothPath(points), baseY, accent, delay: i * -4.5 };
});

// 光条は毎フレーム再描画されるので、専用の細長い SVG に切り出して
// 再描画面積を光条の周囲だけに絞る(帯全域を毎フレーム塗り直さない)。
// 波の振幅は 16+7=23 なので ±28 で線かぶりなく収まる。
const FLOW_STRIP_PAD = 28;
const FLOW_STRIPS = LINES.filter((line) => line.accent).map((line) => {
  const y0 = line.baseY - FLOW_STRIP_PAD;
  const height = FLOW_STRIP_PAD * 2;
  return {
    ...line,
    viewBox: `0 ${y0} 1000 ${height}`,
    top: `${(y0 / VIEWBOX_HEIGHT) * 100}%`,
    heightPct: `${(height / VIEWBOX_HEIGHT) * 100}%`,
  };
});

export default function MidStreamBackground() {
  const wrapRef = useRef<HTMLDivElement>(null);
  // 帯が画面内にある間だけ光条アニメを動かす。画面外での再ラスタライズは
  // スクロールのカクつき(先行ラスタライズの毎フレームやり直し)になるため。
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    // IntersectionObserver が使えない環境ではアニメを動かしっぱなしにする
    if (typeof IntersectionObserver === 'undefined') {
      setActive(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([observed]) => setActive(observed.isIntersecting),
      { rootMargin: '80px 0px' },
    );
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.wrap} aria-hidden="true" ref={wrapRef} data-active={active}>
      {/* 静的な流線。mask で中央を淡くする(静的なのでタイルキャッシュが効き、コストは初回のみ) */}
      <svg
        className={styles.svg}
        viewBox={`0 0 1000 ${VIEWBOX_HEIGHT}`}
        preserveAspectRatio="none"
        role="presentation"
      >
        <g>
          {LINES.map((line) => (
            <path key={line.id} className={styles.lineBase} d={line.d} />
          ))}
        </g>
      </svg>
      {/* 流線の上を走る光条。毎フレーム再描画されるため mask はかけず
          (mask 配下で動かすとマスク合成が毎フレームやり直され、ラスタライズが約3倍になる)、
          光条ごとの細長い SVG に分けて再描画面積を絞る。
          中央の淡さは stroke の linearGradient で mask と同じ濃淡を再現する */}
      {FLOW_STRIPS.map((strip) => (
        <svg
          key={`${strip.id}-flow`}
          className={styles.svgFlow}
          style={{ top: strip.top, height: strip.heightPct }}
          viewBox={strip.viewBox}
          preserveAspectRatio="none"
          role="presentation"
        >
          <defs>
            <linearGradient
              id={`${strip.id}-fade`}
              gradientUnits="userSpaceOnUse"
              x1="0"
              y1="0"
              x2="1000"
              y2="0"
            >
              <stop offset="0" stopColor="var(--color-accent-bright)" stopOpacity="1" />
              <stop offset="0.28" stopColor="var(--color-accent-bright)" stopOpacity="0.3" />
              <stop offset="0.72" stopColor="var(--color-accent-bright)" stopOpacity="0.3" />
              <stop offset="1" stopColor="var(--color-accent-bright)" stopOpacity="1" />
            </linearGradient>
          </defs>
          <path
            className={styles.lineFlow}
            stroke={`url(#${strip.id}-fade)`}
            d={strip.d}
            style={{ animationDelay: `${strip.delay}s` }}
          />
        </svg>
      ))}
    </div>
  );
}
