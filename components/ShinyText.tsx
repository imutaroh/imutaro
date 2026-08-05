import styles from './ShinyText.module.css';

// テキストの上を光沢が横切る装飾。以前は motion の useAnimationFrame で
// 毎フレーム JS からスタイルを更新していたが、起動時の負荷源になるため
// CSS keyframes(background-position)による同一見た目の実装に置き換えた。
// これによりクライアントコンポーネントと motion 依存が不要になった(Issue #11)。
interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  /** 光沢が1往復する秒数 */
  speed?: number;
  /**
   * 光沢を流す回数。既定 3。
   * background-clip: text はコンポジタに乗らず毎フレーム再ペイントするため、
   * speed × passes がそのまま「動き続ける秒数」になる。
   * ヒーロー入場のような有限の拍に混ぜるときは 1 にして尺を合わせる。
   */
  passes?: number;
  className?: string;
  color?: string;
  shineColor?: string;
  /** グラデーションの角度(deg) */
  spread?: number;
}

export default function ShinyText({
  text,
  disabled = false,
  speed = 2,
  passes = 3,
  className = '',
  color = '#b5b5b5',
  shineColor = '#ffffff',
  spread = 120,
}: ShinyTextProps) {
  return (
    <span
      className={`${styles.shiny} ${className}`}
      style={{
        backgroundImage: `linear-gradient(${spread}deg, ${color} 0%, ${color} 35%, ${shineColor} 50%, ${color} 65%, ${color} 100%)`,
        animationDuration: `${speed}s`,
        animationIterationCount: passes,
        ...(disabled ? { animation: 'none' } : {}),
      }}
    >
      {text}
    </span>
  );
}
