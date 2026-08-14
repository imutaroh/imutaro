import PublishedDate from '@/components/Date';
import type { ExternalArticle } from '@/libs/feeds';
import styles from './index.module.css';

type Props = {
  articles: ExternalArticle[];
  /** ファーストビューに入るか。LP の 05 は入らないので既定は lazy */
  priority?: boolean;
};

/**
 * Zenn / note のカードグリッド。LP の 05 セクションと /writings が共有する。
 * サムネイルは外部ドメイン(Zenn/note の CDN)なので next/image は使わず素の img で出す。
 */
export default function ExternalArticleList({ articles, priority = false }: Props) {
  return (
    <ul className={styles.grid}>
      {articles.map((article) => (
        <li key={article.url}>
          <a
            href={article.url}
            className={styles.card}
            target="_blank"
            rel="noopener noreferrer"
          >
            {article.thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={article.thumbnail}
                alt=""
                // 読み込み前のレイアウトシフト防止に固有比を宣言する。
                // 枠の比率(CSS の aspect-ratio)と必ず一致させること。
                // ズレたまま height だけ効くと box が別比率になり、
                // object-fit が想定外に働く(実際 600x314 でほぼ正方形になっていた)
                width={1200}
                height={630}
                className={styles.thumb}
                loading={priority ? 'eager' : 'lazy'}
                decoding="async"
              />
            ) : (
              <div className={styles.thumbFallback} aria-hidden="true">
                {article.source === 'zenn' ? 'Zenn' : 'note'}
              </div>
            )}
            <span className={styles.body}>
              <span className={styles.title}>{article.title}</span>
              <span className={styles.meta}>
                <PublishedDate date={article.publishedAt} />
                <span className={styles.badge} data-source={article.source}>
                  {article.source === 'zenn' ? 'Zenn' : 'note'}
                </span>
              </span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
