import Link from 'next/link';
import { SITE_NAME } from '@/constants';
import Dock from '@/components/Dock';
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

/** 使っているアプリの Dock を、1画面いっぱいの大きさで見せる */
export default function AppsPage() {
  return (
    <div className={styles.screen}>
      <Link href="/" className={styles.home}>
        imutaro<span className={styles.homeTld}>.com</span>
      </Link>

      <div className={styles.body}>
        <p className={styles.eyebrow}>( apps I use )</p>
        <h1 className={styles.title}>imutaro&apos;s Dock</h1>
        <Dock className={styles.dock} />
      </div>

      <p className={styles.note}>Trademarks belong to their owners.</p>
    </div>
  );
}
