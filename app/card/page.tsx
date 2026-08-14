import { SITE_NAME } from '@/constants';
import { getProfileCardData, QR_TARGET_LABEL } from '@/libs/profile';
import CardScreen from './CardScreen';

export const metadata = {
  title: 'Card',
  description: 'imutaro のプロフィールカード。',
  // ルートレイアウトが canonical: '/' を宣言しているため、
  // 上書きしないと /card が「トップの重複」として扱われる
  alternates: { canonical: '/card' },
  openGraph: {
    title: `Card | ${SITE_NAME}`,
    description: 'imutaro のプロフィールカード。',
  },
};

// 完全静的にすると年齢がビルド時の値で凍り、誕生日を跨いでも古いまま出る。
// 1時間ごとに再生成すれば、誕生日当日には必ず切り替わる
export const revalidate = 3600;

export default function CardPage() {
  const { age, facts, stack } = getProfileCardData();

  return <CardScreen age={age} facts={facts} stack={stack} url={QR_TARGET_LABEL} />;
}
