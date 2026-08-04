export type FloatSprite = {
  src: string;
  left: string;
  top: string;
  size: string;
  depth: 'back' | 'front';
  rot?: number;
  /** モバイル(720px 以下)での top 上書き。下部 UI との衝突回避用 */
  topM?: string;
  /** 前ボケ用のぼかし量(px)。大きいほど手前に感じる */
  blur?: number;
};

export type Flavor = {
  id: 'blue' | 'yuzu' | 'berry';
  nameEn: string;
  nameJa: string;
  btnLabel: string;
  marqueeWords: [string, string];
  desc: string;
  /** 容量・炭酸などの短いメタ（価格は price に分離） */
  meta: string;
  price: string;
  hero: string;
  bg: string;
  tone1: string;
  tone2: string;
  accent: string;
  dot: string;
  glow: string;
  /** 液面の波（奥・暗め） */
  wave1: string;
  /** 液面の波（手前・明るめ） */
  wave2: string;
  floats: FloatSprite[];
};

const S = '/flavors/sprites';

/*
 * 浮遊オブジェクトはフレーバーごとに構図を変える:
 * - blue  : 大玉が対角に流れる「ラムネ玉の軌道」。左のタイポ帯に前ボケの大玉を重ねる
 * - yuzu  : 左下の前ボケ輪切り→右上の丸柚子へ抜ける「柑橘のアーク」
 * - berry : 小粒のベリーが散る「ベリーの雨」。右に前ボケのラズベリーを1つ
 * 各フレーバー1〜2個はタイポ帯(top 28〜54%)や瓶の輪郭に重ね、層の交差を見せる。
 */
export const FLAVORS: Flavor[] = [
  {
    id: 'blue',
    nameEn: 'RAMUNE BLUE',
    nameJa: 'ラムネブルー',
    btnLabel: 'RAMUNE',
    marqueeWords: ['FIZZM', 'RAMUNE BLUE'],
    desc: '駄菓子屋の記憶を、澄んだ炭酸で。ラムネ玉が転がる、いちばん青い一本。',
    meta: '340ml / 微炭酸',
    price: '¥380',
    hero: '/flavors/blue-hero-cut.png',
    bg: 'radial-gradient(115% 85% at 50% 44%, #1747c2 0%, #0b2c86 38%, #071b56 68%, #040d2c 100%)',
    tone1: '#f3ead6',
    tone2: '#eef4ff',
    accent: '#86a9ff',
    dot: '#3f78ff',
    glow: 'rgba(64, 118, 240, 0.42)',
    wave1: '#123c9c',
    wave2: '#2e55b5',
    floats: [
      { src: `${S}/blue-3.png`, left: '6%', top: '16%', size: 'clamp(44px, 5.5vw, 88px)', depth: 'back', rot: 15 },
      { src: `${S}/blue-7.png`, left: '42%', top: '9%', size: 'clamp(36px, 4.5vw, 72px)', depth: 'back', rot: -6 },
      { src: `${S}/blue-4.png`, left: '77%', top: '26%', size: 'clamp(52px, 6.5vw, 104px)', depth: 'back' },
      { src: `${S}/blue-2.png`, left: '90%', top: '60%', size: 'clamp(48px, 6vw, 96px)', depth: 'back', rot: 30 },
      { src: `${S}/blue-1.png`, left: '15%', top: '40%', size: 'clamp(120px, 15vw, 250px)', depth: 'front', rot: 8, blur: 3 },
      { src: `${S}/blue-5.png`, left: '59%', top: '27%', size: 'clamp(72px, 9vw, 150px)', depth: 'front', rot: -28 },
      { src: `${S}/blue-6.png`, left: '31%', top: '72%', topM: '56%', size: 'clamp(60px, 7.5vw, 120px)', depth: 'front', rot: -10 },
      { src: `${S}/blue-7.png`, left: '85%', top: '78%', size: 'clamp(84px, 10.5vw, 175px)', depth: 'front', blur: 1.5 },
    ],
  },
  {
    id: 'yuzu',
    nameEn: 'YUZU GOLD',
    nameJa: '柚子ゴールド',
    btnLabel: 'YUZU',
    marqueeWords: ['FIZZM', 'YUZU GOLD'],
    desc: '丸ごと搾った柚子の、ほろ苦く眩しい金色。食事にも合う辛口ソーダ。',
    meta: '340ml / 辛口',
    price: '¥420',
    hero: '/flavors/yuzu-hero-cut.png',
    bg: 'radial-gradient(115% 85% at 50% 44%, #d99a10 0%, #a26a06 38%, #613d03 68%, #2e1d01 100%)',
    tone1: '#ffe9b8',
    tone2: '#fff5e6',
    accent: '#ffd166',
    dot: '#ffb62e',
    glow: 'rgba(255, 190, 70, 0.45)',
    wave1: '#7a4e04',
    wave2: '#b3790a',
    floats: [
      { src: `${S}/yuzu-5.png`, left: '5%', top: '30%', size: 'clamp(42px, 5.2vw, 84px)', depth: 'back', rot: -10 },
      { src: `${S}/yuzu-6.png`, left: '66%', top: '8%', size: 'clamp(56px, 7vw, 116px)', depth: 'back', rot: 26 },
      { src: `${S}/yuzu-7.png`, left: '91%', top: '68%', size: 'clamp(64px, 8vw, 128px)', depth: 'back', rot: 18 },
      { src: `${S}/yuzu-1.png`, left: '13%', top: '68%', size: 'clamp(130px, 16vw, 260px)', depth: 'front', rot: -12, blur: 2.5 },
      { src: `${S}/yuzu-4.png`, left: '79%', top: '33%', size: 'clamp(96px, 12vw, 200px)', depth: 'front', rot: 8 },
      { src: `${S}/yuzu-2.png`, left: '57%', top: '21%', size: 'clamp(76px, 9.5vw, 160px)', depth: 'front', rot: -24 },
      { src: `${S}/yuzu-3.png`, left: '33%', top: '76%', size: 'clamp(56px, 7vw, 112px)', depth: 'front', rot: -8 },
    ],
  },
  {
    id: 'berry',
    nameEn: 'BERRY VELVET',
    nameJa: 'ベリーベルベット',
    btnLabel: 'BERRY',
    marqueeWords: ['FIZZM', 'BERRY VELVET'],
    desc: '摘みたてベリーが沈む、ビロードのような深い紫。夜にゆっくり開けたい一本。',
    meta: '340ml / 果肉入り',
    price: '¥420',
    hero: '/flavors/berry-hero-cut.png',
    bg: 'radial-gradient(115% 85% at 50% 44%, #8d3796 0%, #611f6b 38%, #3a1145 68%, #1c0723 100%)',
    tone1: '#f7e7f0',
    /* tone1 との明度差がないと単色マーキーに見える(レビュー指摘)。
       彩度のあるライラックで「2色交互のリズム」を作る。背景紫と
       同化しないよう明度は高めを維持 */
    tone2: '#d9aef2',
    accent: '#d9a0f0',
    dot: '#b455d8',
    glow: 'rgba(200, 110, 230, 0.45)',
    wave1: '#4b1758',
    wave2: '#712384',
    floats: [
      { src: `${S}/berry-5.png`, left: '7%', top: '54%', size: 'clamp(36px, 4.5vw, 72px)', depth: 'back' },
      { src: `${S}/berry-4.png`, left: '73%', top: '13%', size: 'clamp(50px, 6.2vw, 100px)', depth: 'back', rot: 12 },
      { src: `${S}/berry-7.png`, left: '91%', top: '30%', size: 'clamp(32px, 4vw, 64px)', depth: 'back', rot: -8 },
      { src: `${S}/berry-1.png`, left: '19%', top: '32%', size: 'clamp(72px, 9vw, 150px)', depth: 'front', rot: -16 },
      { src: `${S}/berry-7.png`, left: '44%', top: '12%', size: 'clamp(40px, 5vw, 80px)', depth: 'front', rot: 6 },
      { src: `${S}/berry-6.png`, left: '30%', top: '62%', size: 'clamp(58px, 7.2vw, 118px)', depth: 'front', rot: 30 },
      { src: `${S}/berry-2.png`, left: '59%', top: '74%', size: 'clamp(54px, 6.8vw, 112px)', depth: 'front', blur: 1.2 },
      { src: `${S}/berry-3.png`, left: '83%', top: '60%', size: 'clamp(104px, 13vw, 215px)', depth: 'front', rot: 14, blur: 2.5 },
    ],
  },
];
