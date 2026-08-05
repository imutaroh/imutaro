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
          インラインで置く。解除は HeroReveal(フォント準備完了後、上限450ms)。
          setTimeout はハイドレーションが遅い場合でも確実に外れる保険で、
          HeroReveal が先に解除したら window.__heroHoldTimer をクリアする
          (残すと解除済みの後にもう一度 data-hero-hold-at が刻まれ、
          「偽の解除時刻」から猶予窓を測る罠になる)。
          data-hero-hold は「この文書で保留機構が走った」という消えない目印で、
          HeroStage が『初回ロードのハイドレーション』と『クライアント遷移での
          マウント』を見分けるために読む(この script はクライアント遷移では
          再実行されない)。data-hero-hold-at は解除時刻で、
          「解除直後(数フレーム以内)ならまだ入場を再生してよい」の判定に使う。
          保留の挙動そのものは変えない。
          ★classic script なので **必ず IIFE で包む**。素で書くと var d が
          window.d というグローバルになる */}
      <script
        dangerouslySetInnerHTML={{
          __html:
            "!function(){var d=document.documentElement;d.classList.add('js-hero-hold');d.dataset.heroHold='1';window.__heroHoldTimer=setTimeout(function(){d.classList.remove('js-hero-hold');d.dataset.heroHoldAt=String(performance.now())},1600)}();",
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
