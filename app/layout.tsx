import {
  Playfair_Display,
  IBM_Plex_Sans_JP,
  Zen_Old_Mincho,
  IBM_Plex_Mono,
} from 'next/font/google';
import { SITE_NAME, SITE_TITLE, SITE_DESCRIPTION } from '@/constants';
import './globals.css';

// 見出し(h1-h6)の欧文用ディスプレイセリフ。和文グリフを持たないため、
// 和文は --font-serif-stack の次順 Zen Old Mincho に自動フォールバックする
// (欧文=Playfair / 和文=明朝 の混植が意図)。700 のみ読み込む
const playfair = Playfair_Display({
  weight: ['700'],
  subsets: ['latin'],
  variable: '--font-playfair',
});

// 本文。メタデータの IBM Plex Mono と同一スーパーファミリーにして
// 「機械の声(mono)と人間の声(sans)が同一骨格」に統一する。
// italic は存在しない(将来 bold italic が必要になったら要再検討)。
// 和文グリフは unicode-range 分割で必要時取得(旧 Zen Kaku と同じコスト構造)
const body = IBM_Plex_Sans_JP({
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
    // 下層は `Blog | imutaro.com`、トップだけ説明を持つタイトルにする
    template: `%s | ${SITE_NAME}`,
    default: SITE_TITLE,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    title: {
      template: `%s | ${SITE_NAME}`,
      default: SITE_TITLE,
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
      className={`${playfair.variable} ${body.variable} ${serif.variable} ${mono.variable}`}
    >
      {/* Footer は各ルートグループのレイアウト側で描く。
          /card は1画面完結のためフッターを持たない — ここで全ページ共通に
          描いてしまうと card だけスクロールが生まれる */}
      <body>{children}</body>
    </html>
  );
}
