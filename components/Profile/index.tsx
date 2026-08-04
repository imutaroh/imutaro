import styles from './index.module.css';
import { Writer } from '@/libs/microcms';

type Props = {
  writer?: Writer | null;
};

export default function Profile({ writer }: Props) {
  if (!writer) {
    return null;
  }
  return (
    <div className={styles.wrapper}>
      <div className={styles.tab}>
        <span className={styles.dot} />
        writer.json
      </div>
      <div className={styles.body}>
        {/* image 未設定の writer では src="undefined" の壊れ画像になるため、URL があるときだけ描画 */}
        {writer.image?.url && (
          <picture>
            <source
              type="image/webp"
              srcSet={`${writer.image.url}?fm=webp&fit=crop&w=96&h=96 1x, ${writer.image.url}?fm=webp&fit=crop&w=96&h=96&dpr=2 2x`}
            />
            <img
              src={writer.image.url}
              alt=""
              className={styles.icon}
              width={writer.image.width}
              height={writer.image.height}
            />
          </picture>
        )}
        <div className={styles.content}>
          <p className={styles.name}>{writer?.name}</p>
          <p className={styles.profile}>{writer?.profile}</p>
        </div>
      </div>
    </div>
  );
}
