import { load } from 'cheerio';

export type ExternalSource = 'zenn' | 'note';

export type ExternalArticle = {
  title: string;
  url: string;
  publishedAt: string;
  source: ExternalSource;
  thumbnail: string | null;
};

const FEEDS: { source: ExternalSource; url: string }[] = [
  { source: 'zenn', url: 'https://zenn.dev/imu_imu/feed' },
  { source: 'note', url: 'https://note.com/imutaroh/rss' },
];

// 相手側の障害でページ全体を落とさないよう、失敗したフィードは空配列で返す
async function fetchFeed(source: ExternalSource, url: string): Promise<ExternalArticle[]> {
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const xml = await res.text();
    const $ = load(xml, { xmlMode: true });
    return $('item')
      .toArray()
      .map((item) => {
        const $item = $(item);
        // サムネイル: note は media:thumbnail、Zenn は enclosure(OGP画像)
        const thumbnail =
          $item.find('media\\:thumbnail').first().text().trim() ||
          $item.find('enclosure').first().attr('url') ||
          null;
        return {
          title: $item.find('title').first().text().trim(),
          url: $item.find('link').first().text().trim(),
          publishedAt: $item.find('pubDate').first().text().trim(),
          source,
          thumbnail,
        };
      })
      .filter((a) => a.title && a.url);
  } catch {
    return [];
  }
}

export async function getExternalArticles(limit = 6): Promise<ExternalArticle[]> {
  const results = await Promise.all(FEEDS.map((f) => fetchFeed(f.source, f.url)));
  return results
    .flat()
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, limit);
}

// LP の 05 セクションは Zenn / note を別ブロックで見せるため、
// 混在ソートしてから間引く getExternalArticles だと件数が偏る
// (例: 上位 limit 件が片方のソースに固まると、もう片方が 0 件になる)。
// ソースごとに独立してソート・間引く。
export async function getExternalArticlesGrouped(
  limitPerSource = 3,
): Promise<Record<ExternalSource, ExternalArticle[]>> {
  const results = await Promise.all(FEEDS.map((f) => fetchFeed(f.source, f.url)));
  const grouped = {} as Record<ExternalSource, ExternalArticle[]>;
  FEEDS.forEach((f, i) => {
    grouped[f.source] = results[i]
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, limitPerSource);
  });
  return grouped;
}
