import Link from 'next/link';
import Image from 'next/image';
import { getList } from '@/libs/microcms';
import { getExternalArticles } from '@/libs/feeds';
import { STACK_ENTRIES } from '@/libs/profile';
import PublishedDate from '@/components/Date';
import TagList from '@/components/TagList';
import ShinyText from '@/components/ShinyText';
import BrandIcon from '@/components/BrandIcon';
import ExternalArticleList from '@/components/ExternalArticleList';
import LearningLog from './LearningLog';
import TypedTitle from './TypedTitle';
import styles from './page.module.css';

const LATEST_ARTICLES_LIMIT = 3;

// Zenn / note の表示件数。.externalGrid は3カラムなので3の倍数だと行が揃う。
// フィードの総数がこれに満たない場合はある数だけ並ぶ(最終行が欠ける)
const EXTERNAL_ARTICLES_LIMIT = 9;

const LOG_ENTRIES = [
  { hash: 'e7a2f19', date: '2026-07', text: 'このブログを公開' },
  { hash: 'c41b8d3', date: '2026-05', text: 'Goの学習を開始' },
  { hash: 'a09c5e2', date: '2026-04', text: '新卒データエンジニアとして入社' },
  { hash: '1f0d7b4', date: '2026-03', text: '大学卒業' },
];

const PROFILE_FIELDS = [
  { key: 'name', value: 'imutaro' },
  { key: 'role', value: 'Data Engineer' },
  { key: 'grade', value: '2026年卒' },
  { key: 'base', value: '福岡' },
  { key: 'focus', value: 'data platform / AI' },
];

const CONTACT_LINKS = [
  { label: 'GitHub', icon: 'github', href: 'https://github.com/imutaroh', external: true },
  { label: 'Zenn', icon: 'zenn', href: 'https://zenn.dev/imu_imu', external: true },
  { label: 'note', icon: 'note', href: 'https://note.com/imutaroh', external: true },
  { label: 'X', icon: 'x', href: 'https://x.com/imutaroh', external: true },
  { label: 'Email', icon: null, href: 'mailto:imutaakihiro3@gmail.com', external: false },
] as const;

export default async function Page() {
  const [data, externalArticles] = await Promise.all([
    getList({
      limit: LATEST_ARTICLES_LIMIT,
    }),
    getExternalArticles(EXTERNAL_ARTICLES_LIMIT),
  ]);
  const contactNumber = externalArticles.length > 0 ? '06' : '05';

  return (
    <>
      <section className={styles.heroOuter}>
        <div className={styles.hero}>
          <div className={styles.heroMain}>
            <p className={`${styles.eyebrow} ${styles.heroItem1}`}>
              <ShinyText
                text="( imutaro — data engineer )"
                color="var(--color-sub)"
                shineColor="var(--color-accent-bright)"
                speed={4}
              />
            </p>
            <TypedTitle
              lines={['周りの価値を、', '最大化するエンジニアへ']}
              className={`${styles.heroTitle} ${styles.heroItem2}`}
            />
            {/* キャラクターのバスト。1:1 なので、タイトル(横幅を使い切るフィット式)の
                下・リード文の右に空く帯にちょうど収まる。立ち姿(縦1.9倍)はここに
                入らずタイトルを削る必要があったが、バストなら削らずに済む。
                下端は胸で水平に切れているため、.heroVisual::after の背景色グラデで
                紙に溶かす(mask は禁止。Issue #19)。
                モバイル(<768px)はこの位置に流し込んで右寄せ */}
            <div className={`${styles.heroVisual} ${styles.heroItem5}`} aria-hidden="true">
              <Image
                src="/imutaro-icon.png"
                alt=""
                width={512}
                height={512}
                priority
                // 表示幅は CSS の --hero-figure-w = min(24vw, 280px)(モバイルは 52vw)
                sizes="(max-width: 768px) 52vw, (min-width: 1167px) 280px, 24vw"
                className={styles.heroFigure}
              />
            </div>
            <p className={`${styles.heroLead} ${styles.heroItem3}`}>
              2026年新卒のデータエンジニア。まだ道の途中だからこそ、データ基盤とAI活用に向き合いながら、日々の学びをここに記録しています。
            </p>
            <div className={`${styles.heroCta} ${styles.heroItem4}`}>
              <Link href="/blog" className={styles.ctaPrimary}>
                ブログを読む
                <span className={styles.ctaArrow} aria-hidden="true">
                  →
                </span>
              </Link>
              <div className={styles.ctaIcons}>
                <a
                  href="https://github.com/imutaroh"
                  className={styles.ctaIcon}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                >
                  <BrandIcon name="github" size={18} />
                </a>
                <a
                  href="https://zenn.dev/imu_imu"
                  className={styles.ctaIcon}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Zenn"
                >
                  <BrandIcon name="zenn" size={18} />
                </a>
                <a
                  href="https://note.com/imutaroh"
                  className={styles.ctaIcon}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="note"
                >
                  <BrandIcon name="note" size={18} />
                </a>
                <a
                  href="https://x.com/imutaroh"
                  className={styles.ctaIcon}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X"
                >
                  <BrandIcon name="x" size={18} />
                </a>
              </div>
            </div>
          </div>

        </div>
      </section>

      <section className={`${styles.section} ${styles.beforeBand}`}>
        <div className={styles.sectionHead}>
          <p className={styles.sectionEyebrow}>( 01 / about )</p>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionNumber} aria-hidden="true">
              01.
            </span>
            About
          </h2>
        </div>
        <div className={styles.aboutGrid}>
          <div className={styles.aboutBody}>
            <p>
              福岡で、D2Cのデータ基盤を作って活用しながらAIを推進していくチームで働いています。 Claude
              Codeのようなエージェント型のツールをどう日々の業務に組み込むかを試行錯誤するのが好きです。
            </p>
            <p>
              学んだことをそのままにせず記録して公開するのは、後から自分で見返せるようにするためと、
              同じところでつまずいている誰かの役に立てばという理由からです。
            </p>
          </div>
          <div className={styles.heroCard} aria-hidden="true">
            <div className={styles.cardTab}>
              <span className={styles.cardDot} />
              profile.json
            </div>
            {/* 肖像は「このレコードの1フィールド」として扱う。カードの外へはみ出させると
                JSON(機械が読むデータ)の見立てとキャラクターの語彙がぶつかるので、
                枠付きの小窓 + ファイル名(mono)で中に収める。
                カードの子にしておくことで .heroCard:hover の変形にも追従する */}
            <div className={styles.cardAvatar}>
              <span className={styles.cardAvatarThumb}>
                <Image
                  src="/imutaro-icon.png"
                  alt=""
                  width={512}
                  height={512}
                  sizes="96px"
                  className={styles.cardAvatarImg}
                />
              </span>
              <span className={styles.cardAvatarName}>imutaro.png</span>
            </div>
            <pre className={styles.cardCode}>
              <span className={styles.cardLine}>{'{'}</span>
              {PROFILE_FIELDS.map((field, i) => (
                <span className={styles.cardLine} key={field.key}>
                  {'  '}
                  <span className={styles.cardKey}>&quot;{field.key}&quot;</span>
                  {': '}
                  <span className={styles.cardValue}>&quot;{field.value}&quot;</span>
                  {i < PROFILE_FIELDS.length - 1 ? ',' : ''}
                </span>
              ))}
              <span className={styles.cardLine}>{'}'}</span>
            </pre>
            <div className={styles.cardFooter}>github.com/imutaroh</div>
          </div>
        </div>
      </section>

      {/* ヒーローをキャラクターに置き換えたため、金属は「Contact 前のストリーム1点」に絞る。
          ミッド帯の左端で見切れていたリボン(.midGlyph)はここで撤去した */}
      <div className={styles.midBand}>
        <div className={styles.midGrid}>
          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <p className={styles.sectionEyebrow}>( 02 / log )</p>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber} aria-hidden="true">
                  02.
                </span>
                Learning Log
              </h2>
            </div>
            <LearningLog entries={LOG_ENTRIES} />
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <p className={styles.sectionEyebrow}>( 03 / stack )</p>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber} aria-hidden="true">
                  03.
                </span>
                Stack
              </h2>
            </div>
            <ul className={styles.stack}>
              {STACK_ENTRIES.map((item) => (
                <li className={styles.stackRow} key={item.name}>
                  <span className={styles.stackName}>
                    {/* 技術ロゴ。currentColor で描くので ink 一色に落ちる
                        (原色のロゴを並べると白×青の紙面から浮く) */}
                    <BrandIcon name={item.icon} size={18} />
                    {item.name}
                  </span>
                  <span className={styles.stackStatus} data-status={item.status}>
                    {item.status}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <section className={`${styles.section} ${styles.afterBand}`}>
        <div className={styles.sectionHead}>
          <p className={styles.sectionEyebrow}>( 04 / articles )</p>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionNumber} aria-hidden="true">
              04.
            </span>
            最新の記事
          </h2>
        </div>
        <ul className={styles.articles}>
          {data.contents.map((article, index) => (
            <li className={styles.articleRow} key={article.id}>
              <Link href={`/articles/${article.id}`} className={styles.articleLink}>
                <span className={styles.articleTitleGroup}>
                  <span className={styles.articleIndex}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className={styles.articleTitle}>{article.title}</span>
                </span>
                <span className={styles.articleMeta}>
                  <PublishedDate date={article.publishedAt || article.createdAt} />
                  <TagList tags={article.tags} hasLink={false} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/blog" className={styles.articlesMore}>
          すべての記事
          <span className={styles.ctaArrow} aria-hidden="true">
            →
          </span>
        </Link>
      </section>

      {externalArticles.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <p className={styles.sectionEyebrow}>( 05 / zenn &amp; note )</p>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionNumber} aria-hidden="true">
                05.
              </span>
              Zenn / note の記事
            </h2>
          </div>
          <ExternalArticleList articles={externalArticles} />
          <Link href="/writings" className={styles.articlesMore}>
            詳しく見る
            <span className={styles.ctaArrow} aria-hidden="true">
              →
            </span>
          </Link>
        </section>
      )}

      <section className={`${styles.section} ${styles.sectionEnd}`}>
        <div className={styles.sectionHead}>
          <p className={styles.sectionEyebrow}>( {contactNumber} / contact )</p>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionNumber} aria-hidden="true">
              {contactNumber}.
            </span>
            Contact
          </h2>
        </div>
        <ul className={styles.contact}>
          {CONTACT_LINKS.map((link) => (
            <li className={styles.contactRow} key={link.label}>
              <a
                href={link.href}
                className={styles.contactLink}
                {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                <span className={styles.contactLabel}>
                  {link.icon && <BrandIcon name={link.icon} />}
                  {link.label}
                </span>
                <span className={styles.contactValue}>{link.href.replace(/^mailto:/, '')}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
