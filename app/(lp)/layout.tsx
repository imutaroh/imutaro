import Link from 'next/link';
import ClickSpark from '@/components/ClickSpark';
import BrandIcon from '@/components/BrandIcon';
import Footer from '@/components/Footer';
import { getProfileCardData, QR_TARGET_LABEL } from '@/libs/profile';
import HeroReveal from './HeroReveal';
import HomeGate from './HomeGate';
import styles from './layout.module.css';

type Props = {
  children: React.ReactNode;
};

export default function LpLayout({ children }: Props) {
  const { age, facts, stack } = getProfileCardData();

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
      {/* 幕(HomeGate)の目隠しを初回描画の前に敷く。
          敷かないと LP が一瞬見えてから幕が被さり、チラつく。
          幕は毎回出す(状態を保存しない)ので条件分岐は無い。
          - JS 無効/例外時はクラスが付かない = 幕も出ず素の LP が読める
          - setTimeout はハイドレーションが失敗しても画面が覆われたままにならない保険 */}
      <script
        dangerouslySetInnerHTML={{
          __html:
            "document.documentElement.classList.add('js-gate');setTimeout(function(){document.documentElement.classList.remove('js-gate')},3000);",
        }}
      />
      <HomeGate age={age} facts={facts} stack={stack} url={QR_TARGET_LABEL} />
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
      <Footer />
    </ClickSpark>
  );
}
