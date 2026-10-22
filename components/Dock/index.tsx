import Image from 'next/image';
import { DOCK_APPS } from '@/libs/apps';
import styles from './index.module.css';

type Props = {
  /** アイコンの大きさ(--icon)は呼び出し側のクラスで決める */
  className?: string;
};

/**
 * 使っているアプリを macOS の Dock 風に並べる。`/apps` と LP の 04 Apps が共有する。
 * hover の拡大は CSS だけで行う(:has() で左右の隣も少し大きくする)。
 * JS を持たないので、無効な環境でもそのまま読めてリンクも動く
 */
export default function Dock({ className }: Props) {
  return (
    <ul className={`${styles.dock} ${className ?? ''}`}>
      {DOCK_APPS.map((app) => (
        <li className={styles.item} key={app.id}>
          <a href={app.href} className={styles.link} target="_blank" rel="noopener noreferrer">
            {/* 名前の吹き出し。読み上げは画像の alt が担うので隠す */}
            <span className={styles.label} aria-hidden="true">
              {app.name}
            </span>
            <Image
              src={`/apps/${app.id}.png`}
              alt={app.name}
              width={258}
              height={258}
              // 表示は最大で --icon(88px) × 拡大率 1.5 = 132px
              sizes="132px"
              className={styles.icon}
            />
          </a>
          {/* 起動中を示す Dock の点。ここでは「常用している」の印 */}
          <span className={styles.dot} aria-hidden="true" />
        </li>
      ))}
    </ul>
  );
}
