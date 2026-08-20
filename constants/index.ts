// 1ページの表示件数
export const LIMIT = 10;

/** ブランド名。下層ページのタイトル接尾辞(`Blog | imutaro.com`)とフッタの © 表記に使う */
export const SITE_NAME = 'imutaro.com';

/** トップページの <title>。検索結果ではドメインがタイトルの上に別途出るため、
 *  ここでドメインを繰り返さず「誰の・何のサイトか」に枠を使う */
export const SITE_TITLE = 'imutaro — データエンジニアの学習記録';
/** 「新卒」は年を書かないと翌年から嘘になるため、2026 を明示して固定する。
 *  CMS ブログは撤去済み(#35)なので「ブログ」とは名乗らない */
export const SITE_DESCRIPTION =
  '2026年新卒のデータエンジニアが、データ基盤とAI活用の学びを日々記録していくサイト';
