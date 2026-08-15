import Link from 'next/link';
import { getExternalArticles, type ExternalSource } from '@/libs/feeds';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHead from '@/components/PageHead';
import ExternalArticleList from '@/components/ExternalArticleList';
import { SITE_NAME } from '@/constants';
import styles from './page.module.css';

// RSS が返す範囲を全部拾う。Zenn / note 側の返却上限を超える件数は
// そもそも取得できないため、ここでの上限は「事実上の無制限」の意味
const ALL = 1000;

// LP の 05 セクションは Zenn / note を分けて見せるが、こちらは詳細先。
// クエリでの絞り込みはあっても既定は「すべて」= 両方見える状態を保つ(C案)
const TABS: { key: ExternalSource | 'all'; label: string }[] = [
  { key: 'all', label: 'すべて' },
  { key: 'zenn', label: 'Zenn' },
  { key: 'note', label: 'note' },
];

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

type Props = {
  searchParams: Promise<{ source?: string }>;
};

export default async function WritingsPage({ searchParams }: Props) {
  const { source: sourceParam } = await searchParams;
  const source: ExternalSource | 'all' =
    sourceParam === 'zenn' || sourceParam === 'note' ? sourceParam : 'all';

  const allArticles = await getExternalArticles(ALL);
  const articles = source === 'all' ? allArticles : allArticles.filter((a) => a.source === source);

  const zennCount = allArticles.filter((a) => a.source === 'zenn').length;
  const noteCount = allArticles.length - zennCount;

  return (
    <>
      <Header />
      <main className={styles.main}>
        <PageHead
          eyebrow="( / zenn & note )"
          title="Zenn / note"
          lead="Zenn と note で公開しているものの一覧です。記事のほか、Zenn の本も含みます。"
        />
        {allArticles.length > 0 ? (
          <>
            <nav className={styles.tabs} aria-label="出どころで絞り込み">
              {TABS.map((tab) => (
                <Link
                  key={tab.key}
                  href={tab.key === 'all' ? '/writings' : `/writings?source=${tab.key}`}
                  className={styles.tab}
                  data-active={source === tab.key}
                >
                  {tab.label}
                </Link>
              ))}
            </nav>
            <p className={styles.count}>
              {articles.length} 件{source === 'all' && `（Zenn ${zennCount} / note ${noteCount}）`}
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
