import { formatRichText } from '@/libs/utils';
import { type Article } from '@/libs/microcms';
import { articleDateTransitionName, articleTitleTransitionName } from '@/libs/viewTransition';
import PublishedDate from '../Date';
import styles from './index.module.css';
import TagList from '../TagList';
import Profile from '../Profile';

type Props = {
  data: Article;
};

export default function Article({ data }: Props) {
  return (
    <main className={styles.main}>
      <div className={styles.head}>
        <p className={styles.eyebrow}>/ article</p>
        {/* 一覧の行タイトル(ArticleListItem)と同じ view-transition-name(記事 id 由来)で
            対応付け、遷移時に行タイトル → h1 が連続変形する */}
        <h1
          className={styles.title}
          style={{ viewTransitionName: articleTitleTransitionName(data.id) }}
        >
          {data.title}
        </h1>
        <TagList tags={data.tags} />
        <p className={styles.description}>{data.description}</p>
      </div>
      <div className={styles.meta}>
        {data.writer && (
          <div className={styles.writer}>
            {/* image 未設定の writer では src="undefined" の壊れ画像になるため、URL があるときだけ描画 */}
            {data.writer.image?.url && (
              <picture>
                <source
                  type="image/webp"
                  srcSet={`${data.writer.image.url}?fm=webp&fit=crop&w=48&h=48 1x, ${data.writer.image.url}?fm=webp&fit=crop&w=48&h=48&dpr=2 2x`}
                />
                <img
                  src={data.writer.image.url}
                  alt=""
                  className={styles.writerIcon}
                  width={data.writer.image.width}
                  height={data.writer.image.height}
                />
              </picture>
            )}
            <span className={styles.writerName}>{data.writer?.name}</span>
          </div>
        )}
        {/* 一覧の行日付と共有要素で対応付けるラッパー(.meta は flex なので子は blockified され
            断片化しない = View Transition のキャプチャ対象にできる) */}
        <span style={{ viewTransitionName: articleDateTransitionName(data.id) }}>
          <PublishedDate date={data.publishedAt || data.createdAt} />
        </span>
      </div>
      {data.thumbnail && (
        <picture>
          <source
            type="image/webp"
            media="(max-width: 640px)"
            srcSet={`${data.thumbnail.url}?fm=webp&w=414 1x, ${data.thumbnail.url}?fm=webp&w=414&dpr=2 2x`}
          />
          <source
            type="image/webp"
            srcSet={`${data.thumbnail.url}?fm=webp&fit=crop&w=960&h=504 1x, ${data.thumbnail.url}?fm=webp&fit=crop&w=960&h=504&dpr=2 2x`}
          />
          <img
            src={data.thumbnail.url}
            alt=""
            className={styles.thumbnail}
            width={data.thumbnail.width}
            height={data.thumbnail.height}
          />
        </picture>
      )}
      <div
        className={styles.content}
        dangerouslySetInnerHTML={data.content ? {
          __html: `${formatRichText(data.content)}`,
        } : undefined}
      />
      <Profile writer={data.writer} />
    </main>
  );
}
