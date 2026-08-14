import { calcAge } from './age';

/** 年齢はここから毎回算出する。数値を直接書くと誕生日を跨いだ日から嘘になる */
const BIRTHDAY = '2003-12-01';

export const PROFILE_EMAIL = 'imutaakihiro3@gmail.com';

export const PROFILE_LINKS = [
  { label: 'GitHub', icon: 'github', href: 'https://github.com/imutaroh' },
  { label: 'Zenn', icon: 'zenn', href: 'https://zenn.dev/imu_imu' },
  { label: 'note', icon: 'note', href: 'https://note.com/imutaroh' },
  { label: 'X', icon: 'x', href: 'https://x.com/imutaroh' },
] as const;

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

  return { age, facts, links: [...PROFILE_LINKS] };
}

/**
 * カード裏面の QR(`public/qr-imutaro-com.svg`)が指す先。
 * QR は静的ファイルなので、隣に出す文字列は環境変数からではなく
 * **QR の中身と一致させる**（デコード結果は https://imutaro.com で検証済み）。
 * 環境ごとに変えると、ローカルで「localhost と書いてあるのに本番へ飛ぶ QR」になる
 */
export const QR_TARGET_LABEL = 'imutaro.com';
