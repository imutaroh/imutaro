import { calcAge } from './age';

/** 年齢はここから毎回算出する。数値を直接書くと誕生日を跨いだ日から嘘になる */
const BIRTHDAY = '2003-12-01';

/**
 * 使っている技術。LP の 03 Stack セクションとカードの両方がここを読む。
 * 2箇所に書くと、片方だけ直して「LPとカードで言っていることが違う」が起きる。
 * status は daily(日常的に使う) / learning(学習中) の2値。
 * icon は BrandIcon の名前（simple-icons 由来）。
 * 「SQL」は言語であってロゴを持たないため、実際に使っている製品名 BigQuery に置いた
 */
export const STACK_ENTRIES = [
  { name: 'BigQuery', status: 'daily', icon: 'bigquery' },
  { name: 'Go', status: 'learning', icon: 'go' },
  { name: 'Claude Code', status: 'daily', icon: 'claude' },
] as const;

export type StackEntry = {
  name: string;
  status: string;
  icon: 'bigquery' | 'go' | 'claude';
};

export type ProfileFact = { key: string; value: string };

/**
 * カードに出す値。`/card`（単独ページ）とトップの幕（HomeGate）の両方から呼ぶ。
 * 片方だけ直して内容がズレるのを防ぐため、ここに集約する。
 */
export function getProfileCardData() {
  const age = calcAge(BIRTHDAY);

  // role は名前の直下に出しているので facts には入れない(同じ情報を2回置かない)
  const facts: ProfileFact[] = [
    { key: 'age', value: `${age}` },
    { key: 'base', value: '福岡' },
    { key: 'focus', value: 'data platform / AI' },
  ];

  return { age, facts, stack: [...STACK_ENTRIES] };
}

/**
 * カード裏面の QR(`public/qr-imutaro-com.svg`)が指す先。
 * QR は静的ファイルなので、隣に出す文字列は環境変数からではなく
 * **QR の中身と一致させる**（デコード結果は https://imutaro.com で検証済み）。
 * 環境ごとに変えると、ローカルで「localhost と書いてあるのに本番へ飛ぶ QR」になる
 */
export const QR_TARGET_LABEL = 'imutaro.com';
