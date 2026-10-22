import Image from 'next/image';
import Link from 'next/link';
import { SITE_NAME } from '@/constants';
import { DOCK_APPS } from '@/libs/apps';
import styles from './page.module.css';

export const metadata = {
  title: 'Apps',
  description: 'imutaro が普段使っているアプリ。',
  // ルートレイアウトが canonical: '/' を宣言しているため、
  // 上書きしないと /apps が「トップの重複」として扱われる
  alternates: { canonical: '/apps' },
  openGraph: {
    title: `Apps | ${SITE_NAME}`,
    description: 'imutaro が普段使っているアプリ。',
  },
};

/**
 * macOS の Dock 風に、使っているアプリを1列に並べる。
 * hover の拡大は CSS だけで行う(:has() で左右の隣も少し大きくする)。
 * JS を持たないので、無効な環境でもそのまま読めてリンクも動く
 */
export default function AppsPage() {
  return (
    <div className={styles.screen}>
      <Link href="/" className={styles.home}>
        imutaro<span className={styles.homeTld}>.com</span>
      </Link>

      <div className={styles.body}>
        <p className={styles.eyebrow}>( apps I use )</p>
        <h1 className={styles.title}>imutaro&apos;s Dock</h1>

        <ul className={styles.dock}>
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
                  width={256}
                  height={256}
                  // 表示は最大で --icon(56px) × 拡大率 1.5 = 84px
                  sizes="84px"
                  className={styles.icon}
                />
              </a>
              {/* 起動中を示す Dock の点。ここでは「常用している」の印 */}
              <span className={styles.dot} aria-hidden="true" />
            </li>
          ))}
        </ul>
      </div>

      <p className={styles.note}>Trademarks belong to their owners.</p>
    </div>
  );
}
