import {
  Space_Grotesk,
  Zen_Kaku_Gothic_New,
  Zen_Old_Mincho,
  IBM_Plex_Mono,
} from 'next/font/google';
import { SITE_NAME, SITE_DESCRIPTION } from '@/constants';
import Footer from '@/components/Footer';
import './globals.css';

const display = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
});

const body = Zen_Kaku_Gothic_New({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-body',
});

// ヒーロータイトル・セクション番号などの「大きな飾り文字」専用セリフ。
// 使うのは 700 のみ(容量を増やさないため他ウェイトは読み込まない)。
// subset は他の日本語フォントと同じ latin のみ preload し、和文グリフは
// unicode-range 分割で必要時に取得される。到着待ちのチラつきは
// js-hero-hold + HeroReveal(document.fonts.ready、上限900ms)が吸収する
const serif = Zen_Old_Mincho({
  weight: ['700'],
  subsets: ['latin'],
  variable: '--font-serif',
});

const mono = IBM_Plex_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata = {
  metadataBase: new URL(process.env.BASE_URL || 'http://localhost:3000'),
  title: {
    template: `%s | ${SITE_NAME}`,
    default: SITE_NAME,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    title: {
      template: `%s | ${SITE_NAME}`,
      default: SITE_NAME,
    },
    description: SITE_DESCRIPTION,
    images: '/ogp.png',
  },
  alternates: {
    canonical: '/',
  },
};

type Props = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: Props) {
  return (
    <html
      lang="ja"
      className={`${display.variable} ${body.variable} ${serif.variable} ${mono.variable}`}
    >
      <body>
        {children}
        <Footer />
      </body>
    </html>
  );
}
