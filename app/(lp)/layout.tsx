import Link from 'next/link';
import ClickSpark from '@/components/ClickSpark';
import BrandIcon from '@/components/BrandIcon';
import HeroReveal from './HeroReveal';
import styles from './layout.module.css';

type Props = {
  children: React.ReactNode;
};

export default function LpLayout({ children }: Props) {
  return (
    <ClickSpark sparkColor="#0087a8" sparkSize={9} sparkRadius={16} sparkCount={8}>
      {/* 入場アニメ一時停止フラグ。初回描画の前に必ず実行されるよう
          インラインで置く。解除は HeroReveal(フォント準備完了後、上限900ms)。
          setTimeout はハイドレーションが遅い場合でも確実に外れる保険 */}
      <script
        dangerouslySetInnerHTML={{
          __html:
            "document.documentElement.classList.add('js-hero-hold');setTimeout(function(){document.documentElement.classList.remove('js-hero-hold')},1600);",
        }}
      />
      <HeroReveal />
      <header className={styles.header}>
        <Link href="/" className={styles.logo}>
          imutaro<span className={styles.logoTld}>.com</span>
        </Link>
        <nav className={styles.nav}>
          <Link href="/blog" className={styles.navLink}>
            Blog
          </Link>
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
      <main>{children}</main>
    </ClickSpark>
  );
}
