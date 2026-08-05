import Image from 'next/image';
import { Article } from '@/libs/microcms';
import { articleDateTransitionName, articleTitleTransitionName } from '@/libs/viewTransition';
import styles from './index.module.css';
import TagList from '../TagList';
import TransitionLink from '../TransitionLink';
import PublishedDate from '../Date';

type Props = {
  article: Article;
  index?: number;
};

export default function ArticleListItem({ article, index }: Props) {
  return (
    <li className={styles.list}>
      {/* 記事詳細へは View Transition 付きで遷移し、タイトル・日付を共有要素としてモーフさせる */}
      <TransitionLink href={`/articles/${article.id}`} className={styles.link}>
        {index !== undefined && (
          <span className={styles.index}>{String(index + 1).padStart(3, '0')}</span>
        )}
        {article.thumbnail ? (
          <picture>
            <source
              type="image/webp"
              media="(max-width: 640px)"
              srcSet={`${article.thumbnail?.url}?fm=webp&w=414 1x, ${article.thumbnail?.url}?fm=webp&w=414&dpr=2 2x`}
            />
            <source
              type="image/webp"
              srcSet={`${article.thumbnail?.url}?fm=webp&fit=crop&w=240&h=126 1x, ${article.thumbnail?.url}?fm=webp&fit=crop&w=240&h=126&dpr=2 2x`}
            />
            <img
              src={article.thumbnail?.url || `/no-image.png`}
              alt=""
              className={styles.image}
              width={article.thumbnail?.width}
              height={article.thumbnail?.height}
              loading="lazy"
              decoding="async"
            />
          </picture>
        ) : (
          <Image
            className={styles.image}
            src="/no-image.png"
            alt="No Image"
            width={1200}
            height={630}
          />
        )}
        <dl className={styles.content}>
          {/* view-transition-name は記事 id 由来で一意（同名衝突すると VT ごと失敗する）。
              詳細ページ(components/Article)の h1・日付と同じ名前で対応付ける */}
          <dt
            className={styles.title}
            style={{ viewTransitionName: articleTitleTransitionName(article.id) }}
          >
            {article.title}
          </dt>
          <dd>
            <TagList tags={article.tags} hasLink={false} />
          </dd>
          <dd
            className={styles.date}
            style={{ viewTransitionName: articleDateTransitionName(article.id) }}
          >
            <PublishedDate date={article.publishedAt || article.createdAt} />
          </dd>
        </dl>
        <span className={styles.arrow} aria-hidden="true">
          →
        </span>
      </TransitionLink>
    </li>
  );
}
