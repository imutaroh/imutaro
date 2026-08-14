import Link from 'next/link';
import Footer from '@/components/Footer';
import styles from './not-found.module.css';

export default function NotFound() {
  return (
    <>
      <div className={styles.container}>
        <p className={styles.code}>404 — not found</p>
        <p className={styles.text}>お探しのページは見つかりませんでした。</p>
        <Link href="/" className={styles.home}>
          トップへ戻る <span className={styles.arrow}>→</span>
        </Link>
      </div>
      {/* ルートレイアウトから Footer を各グループへ移したため、
          グループに属さない 404 はここで自前で持つ */}
      <Footer />
    </>
  );
}
