import Link from 'next/link';
import Image from 'next/image';
import { getList } from '@/libs/microcms';
import { getExternalArticles } from '@/libs/feeds';
import { articleDateTransitionName, articleTitleTransitionName } from '@/libs/viewTransition';
import PublishedDate from '@/components/Date';
import TransitionLink from '@/components/TransitionLink';
import TagList from '@/components/TagList';
import ShinyText from '@/components/ShinyText';
import BrandIcon from '@/components/BrandIcon';
import LearningLog from './LearningLog';
import TypedTitle from './TypedTitle';
import HeroStage from './HeroStage';
import styles from './page.module.css';

const LATEST_ARTICLES_LIMIT = 3;

const LOG_ENTRIES = [
  { hash: 'e7a2f19', date: '2026-07', text: 'このブログを公開' },
  { hash: 'c41b8d3', date: '2026-05', text: 'Goの学習を開始' },
  { hash: 'a09c5e2', date: '2026-04', text: '新卒データエンジニアとして入社' },
  { hash: '1f0d7b4', date: '2026-03', text: '大学卒業' },
];

const STACK_ENTRIES = [
  { name: 'SQL', status: 'daily' },
  { name: 'Go', status: 'learning' },
  { name: 'Claude Code', status: 'daily' },
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
    getExternalArticles(),
  ]);
  const contactNumber = externalArticles.length > 0 ? '06' : '05';

  return (
    <>
      <HeroStage>
        <div className={styles.hero}>
          <div className={styles.heroMain}>
            <p className={`${styles.eyebrow} ${styles.heroItem1}`}>
              {/* 銘板に光が1度だけ走る。入場の第1拍と尺を合わせる(1パス0.9s)。
                  以前は 4s × 3回 = 12秒間 background-position を animate していて、
                  background-clip:text はコンポジタに乗らず毎フレーム再ペイントするため
                  「1.2秒で完全静止」を実際には破っていた */}
              <ShinyText
                text="( imutaro — data engineer )"
                color="var(--color-sub)"
                shineColor="var(--color-accent-bright)"
                speed={0.9}
                passes={1}
                // 保留(js-hero-hold)の対象に入れ、eyebrow の到着と同じ拍まで
                // 光を遅らせるための専用クラス(page.module.css)
                className={styles.heroShine}
              />
            </p>
            <TypedTitle
              lines={['周りの価値を、', '最大化するエンジニアへ']}
              className={`${styles.heroTitle} ${styles.heroItem2}`}
            />
            {/* クロームリボン。デスクトップは右端に絶対配置してテキストの背面へ、
                モバイル(<768px)はこの位置(タイトル直下)に流し込みつつ右へ見切れさせる。
                3階建てなのは変形の担当を物理的に分けるため(HeroStage.tsx):
                  .heroVisual  = 位置と刈り取り(静的)
                  .ribbonPar   = ポインタ視差(x / y / rotate)
                  .ribbonCoil  = 入場の巻き取りと CTA hover(rotate / scale)+ 縁のフェード
                縁のフェード(.ribbonFade::after)は回転する箱の中に置く。外に出すと
                回転中に画像の矩形角がフェード帯から飛び出して白い直線が見える。
                .heroWipe は「注ぎ込み」のカーテン(CSS 既定 display:none、GSAP が起こす) */}
            <div className={styles.heroVisual} data-hero="visual" aria-hidden="true">
              <div className={styles.ribbonPar} data-hero="par">
                <div className={`${styles.ribbonCoil} ${styles.ribbonFade}`} data-hero="coil">
                  <Image
                    src="/ribbon-hero.png"
                    alt=""
                    width={1672}
                    height={941}
                    priority
                    // 表示幅は CSS の min(58vw, 900px)(769〜1024px 帯は min(56vw, 900px)、
                    // モバイルは右へ見切れさせる 116vw)。sizes を明示しないと
                    // 密度記述子(1x/2x)の srcset になり原寸級を配信してしまう
                    // (58vw=900px となる境界が 900/0.58 ≒ 1553px)
                    sizes="(max-width: 768px) 116vw, (max-width: 1024px) 56vw, (min-width: 1553px) 900px, 58vw"
                    className={styles.heroRibbon}
                  />
                </div>
              </div>
              <div className={styles.heroWipe} data-hero="wipe" />
            </div>
            <p className={`${styles.heroLead} ${styles.heroItem3}`}>
              2026年新卒のデータエンジニア。まだ道の途中だからこそ、データ基盤とAI活用に向き合いながら、日々の学びをここに記録しています。
            </p>
            <div className={`${styles.heroCta} ${styles.heroItem4}`}>
              {/* data-hero は HeroStage から掴むためのフック。CSS Modules のクラス名は
                  ハッシュ化されるので、JS 側のセレクタには使えない */}
              <Link href="/blog" className={styles.ctaPrimary} data-hero="cta-primary">
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
      </HeroStage>

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

      <div className={styles.midBand}>
        {/* 縦長S字のクロームリボン。シルバー帯の左端で見切れさせる装飾。
            左右反転はしない(全素材の光源＝左上をヒーローと揃えるため)。
            縁処理は .midGlyphImg の multiply のみ(不透明グラデを重ねると背面の
            銀グラデーションを塗りつぶして矩形の継ぎ目を作るため併用しない)。
            ファーストビュー外なので next/image デフォルトの lazy で読み込む */}
        <div className={styles.midGlyph} aria-hidden="true">
          <Image
            src="/ribbon-glyph-b.png"
            alt=""
            width={864}
            height={1821}
            // 表示は高さ460px固定 = 幅約218px。sizes で表示幅相当の変換画像を選ばせる
            sizes="220px"
            className={styles.midGlyphImg}
          />
        </div>

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
                  <span className={styles.stackName}>{item.name}</span>
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
              {/* ブログ一覧(ArticleListItem)と同じ View Transition 語彙:
                  タイトル・日付が記事詳細の h1・日付へ連続変形する(名前は記事 id 由来で一意) */}
              <TransitionLink href={`/articles/${article.id}`} className={styles.articleLink}>
                <span className={styles.articleTitleGroup}>
                  <span className={styles.articleIndex}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span
                    className={styles.articleTitle}
                    style={{ viewTransitionName: articleTitleTransitionName(article.id) }}
                  >
                    {article.title}
                  </span>
                </span>
                <span className={styles.articleMeta}>
                  <span style={{ viewTransitionName: articleDateTransitionName(article.id) }}>
                    <PublishedDate date={article.publishedAt || article.createdAt} />
                  </span>
                  <TagList tags={article.tags} hasLink={false} />
                </span>
              </TransitionLink>
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
          <ul className={styles.externalGrid}>
            {externalArticles.map((article) => (
              <li key={article.url}>
                <a
                  href={article.url}
                  className={styles.externalCard}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {article.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={article.thumbnail}
                      alt=""
                      className={styles.externalThumb}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className={styles.externalThumbFallback} aria-hidden="true">
                      {article.source === 'zenn' ? 'Zenn' : 'note'}
                    </div>
                  )}
                  <span className={styles.externalBody}>
                    <span className={styles.externalTitle}>{article.title}</span>
                    <span className={styles.externalMeta}>
                      <PublishedDate date={article.publishedAt} />
                      <span className={styles.externalBadge} data-source={article.source}>
                        {article.source === 'zenn' ? 'Zenn' : 'note'}
                      </span>
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 液体金属のストリーム。Contact 前の全幅ディバイダ装飾。
          縁処理は multiply。lazy 読み込み */}
      <div className={styles.streamDivider} aria-hidden="true">
        <Image
          src="/metal-stream.png"
          alt=""
          width={1983}
          height={793}
          sizes="100vw"
          className={styles.streamDividerImg}
        />
      </div>

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
