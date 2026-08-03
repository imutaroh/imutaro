import styles from './MidStreamBackground.module.css';

// ページ中盤(Learning Log〜Stack)の背面に敷く静的なデータストリーム。
// ヒーローの計器盤が「観測」なら、こちらは「日々流れていく学び」。
// preserveAspectRatio="none" で帯全体に引き伸ばすため、
// 線幅は vector-effect: non-scaling-stroke で一定に保つ。
//
// 描画コストの経緯:
// - 光条アニメは毎フレーム再描画になるため廃止(Issue #15)
// - CSS mask も撤去(Issue #17)。mask はタイルのラスタライズを重くし、
//   低性能・低電力モード端末では帯が画面に入るたびに引っかかりになる。
//   「中央は淡く・両端は濃く」の濃淡は stroke の linearGradient で再現し、
//   上下端のフェードは端の線の opacity 減衰で近似する
const SAMPLE_XS = [-20, 110, 240, 370, 500, 630, 760, 890, 1020];

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

// 旧・縦方向 mask(上下12%をフェード)の近似。帯の上下端に近い線ほど淡くする
function verticalFade(baseY: number): number {
  const ratio = baseY / 500;
  if (ratio < 0.12) return ratio / 0.12;
  if (ratio > 0.88) return (1 - ratio) / 0.12;
  return 1;
}

const LINES = Array.from({ length: LINE_COUNT }, (_, i) => {
  const baseY = 50 + i * 66;
  const phase = i * 1.35;
  const points = SAMPLE_XS.map((x) => ({ x, y: lineY(baseY, x, phase) }));
  const accent = i % 3 === 1;
  return {
    id: `stream-${i}`,
    d: smoothPath(points),
    accent,
    fade: Math.round(verticalFade(baseY) * 100) / 100,
  };
});

// 旧・横方向 mask と同じ濃淡: 両端 100%、中央(28%〜72%)は 30%
const FADE_STOPS = [
  { offset: '0', opacity: 1 },
  { offset: '0.28', opacity: 0.3 },
  { offset: '0.72', opacity: 0.3 },
  { offset: '1', opacity: 1 },
] as const;

export default function MidStreamBackground() {
  return (
    <div className={styles.wrap} aria-hidden="true">
      <svg
        className={styles.svg}
        viewBox="0 0 1000 500"
        preserveAspectRatio="none"
        role="presentation"
      >
        <defs>
          <linearGradient
            id="midstream-base"
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1="0"
            x2="1000"
            y2="0"
          >
            {FADE_STOPS.map((stop) => (
              <stop
                key={stop.offset}
                offset={stop.offset}
                stopColor="var(--color-border-dark)"
                stopOpacity={stop.opacity}
              />
            ))}
          </linearGradient>
          <linearGradient
            id="midstream-accent"
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1="0"
            x2="1000"
            y2="0"
          >
            {FADE_STOPS.map((stop) => (
              <stop
                key={stop.offset}
                offset={stop.offset}
                stopColor="var(--color-accent-bright)"
                stopOpacity={stop.opacity}
              />
            ))}
          </linearGradient>
        </defs>
        <g>
          {LINES.map((line) => (
            <path
              key={line.id}
              className={line.accent ? styles.lineAccent : styles.lineBase}
              stroke={line.accent ? 'url(#midstream-accent)' : 'url(#midstream-base)'}
              opacity={line.fade}
              d={line.d}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
