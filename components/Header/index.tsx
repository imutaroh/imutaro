import Link from 'next/link';
import BrandIcon from '@/components/BrandIcon';
import styles from './index.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.logo}>
        imutaro<span className={styles.logoTld}>.com</span>
      </Link>
      <nav className={styles.nav}>
        <Link href="/writings" className={styles.navLink}>
          Writings
        </Link>
        {/* 自前の書き物置き場は Obsidian Publish(notes.imutaro.com)。
            LP 側のヘッダー(app/(lp)/layout.tsx)と並びを揃えること */}
        <a
          href="https://notes.imutaro.com"
          className={styles.navLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          Notes
        </a>
        <a
          href="https://zenn.dev/imu_imu"
          className={styles.navIcon}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Zenn"
          title="Zenn"
        >
          <BrandIcon name="zenn" size={16} />
        </a>
        <a
          href="https://note.com/imutaroh"
          className={styles.navIcon}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="note"
          title="note"
        >
          <BrandIcon name="note" size={16} />
        </a>
        <a
          href="https://x.com/imutaroh"
          className={styles.navIcon}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="X"
          title="X"
        >
          <BrandIcon name="x" size={16} />
        </a>
        <a
          href="https://github.com/imutaroh"
          className={styles.navIcon}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          title="GitHub"
        >
          <BrandIcon name="github" size={16} />
        </a>
      </nav>
    </header>
  );
}
