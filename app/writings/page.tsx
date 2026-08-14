import { getExternalArticles } from '@/libs/feeds';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHead from '@/components/PageHead';
import ExternalArticleList from '@/components/ExternalArticleList';
import { SITE_NAME } from '@/constants';
import styles from './page.module.css';

// RSS が返す範囲を全部拾う。Zenn / note 側の返却上限を超える件数は
// そもそも取得できないため、ここでの上限は「事実上の無制限」の意味
const ALL = 1000;

export const metadata = {
  title: 'Zenn / note',
  description: 'Zenn と note で公開している記事・本の一覧。',
  // ルートレイアウトが canonical: '/' を宣言しているので上書きする
  alternates: { canonical: '/writings' },
  openGraph: {
    title: `Zenn / note | ${SITE_NAME}`,
    description: 'Zenn と note で公開している記事・本の一覧。',
  },
};

// フィードの fetch 自体が revalidate 3600 なので、ページも同じ周期で作り直す
export const revalidate = 3600;

export default async function WritingsPage() {
  const articles = await getExternalArticles(ALL);

  const zennCount = articles.filter((a) => a.source === 'zenn').length;
  const noteCount = articles.length - zennCount;

  return (
    <>
      <Header />
      <main className={styles.main}>
        <PageHead
          eyebrow="( / zenn & note )"
          title="Zenn / note"
          lead="Zenn と note で公開しているものの一覧です。記事のほか、Zenn の本も含みます。"
        />
        {articles.length > 0 ? (
          <>
            <p className={styles.count}>
              {articles.length} 件（Zenn {zennCount} / note {noteCount}）
            </p>
            <ExternalArticleList articles={articles} priority />
          </>
        ) : (
          // 相手側の障害時は空配列で返る(libs/feeds)。落ちずに理由を出す
          <p className={styles.empty}>
            いまフィードを取得できませんでした。時間をおいて再度お試しください。
          </p>
        )}
      </main>
      <Footer />
    </>
  );
}
