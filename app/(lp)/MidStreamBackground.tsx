import styles from './MidStreamBackground.module.css';

// ページ中盤(Learning Log〜Stack)の背面に敷く静的なデータストリーム。
// ヒーローの計器盤が「観測」なら、こちらは「日々流れていく学び」。
// preserveAspectRatio="none" で帯全体に引き伸ばすため、
// 線幅は vector-effect: non-scaling-stroke で一定に保つ。
// 以前は光条が流線上を流れるアニメを持っていたが、毎フレームの再描画が
// 低電力モード端末のひっかかりになるため廃止した(Issue #15)。
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
const LINES = Array.from({ length: LINE_COUNT }, (_, i) => {
  const baseY = 50 + i * 66;
  const phase = i * 1.35;
  const points = SAMPLE_XS.map((x) => ({ x, y: lineY(baseY, x, phase) }));
  const accent = i % 3 === 1;
  return { id: `stream-${i}`, d: smoothPath(points), accent };
});

export default function MidStreamBackground() {
  return (
    <div className={styles.wrap} aria-hidden="true">
      <svg
        className={styles.svg}
        viewBox="0 0 1000 500"
        preserveAspectRatio="none"
        role="presentation"
      >
        <g>
          {LINES.map((line) => (
            <path
              key={line.id}
              className={line.accent ? styles.lineAccent : styles.lineBase}
              d={line.d}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
