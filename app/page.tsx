import { Abril_Fatface, Archivo_Black, Zen_Kaku_Gothic_New } from 'next/font/google';
import FizzmHero from './FizzmHero';

/* 小さな UI ラベル用（ボタン・メタ情報） */
const display = Archivo_Black({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

/* 巨大マーキー・ロゴ・カード見出し用の fat serif */
const marquee = Abril_Fatface({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-marquee',
  display: 'swap',
});

const jp = Zen_Kaku_Gothic_New({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-jp',
  display: 'swap',
});

export const metadata = {
  title: 'FIZZM — Fizz the Moment.',
  description: '架空クラフトソーダ FIZZM のブランドスプラッシュ（lab 実験01）',
};

export default function Page() {
  return (
    <main className={`${display.variable} ${marquee.variable} ${jp.variable}`}>
      <FizzmHero />
    </main>
  );
}
