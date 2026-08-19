// public/ogp.png を生成する。実行: node scripts/gen-ogp.mjs
// フォントは Google Fonts の text= サブセット API から実行時に取得するため、
// 文言を変えたらこのファイルを編集して再実行するだけでよい(オフラインでは動かない)。
import { ImageResponse } from 'next/og.js';
import fs from 'fs';

// ---- 文言(カード側のタイトル・LP のヒーローと矛盾させないこと) ----
const EYEBROW = '$ whoami';
const TITLE_LINES = ['周りの価値を、', '最大化するエンジニアへ'];
const TAGLINE = 'データ基盤とAI活用を、学んで記録する。';
const FOOTER_LEFT = 'imutaro — data engineer';
const FOOTER_RIGHT = 'imutaro.com';

// ---- 配色(app/globals.css のトークンと揃える) ----
const INK = '#1A2330';
const ACCENT_BRIGHT = '#00ADD8';
const LINE = 'rgba(255,255,255,0.14)';

// Google Fonts CSS2 API は text= で渡したグリフだけのサブセットを返す。
// UA を名乗らないと truetype(satori が読める形式)の URL が返る
async function fetchSubset(family, weight, text) {
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&text=${encodeURIComponent(text)}`,
    { headers: { 'User-Agent': 'Mozilla/5.0' } },
  ).then((r) => r.text());
  const url = css.match(/url\((https:[^)]+)\)/)?.[1];
  if (!url) throw new Error(`font url not found for ${family}: ${css}`);
  return Buffer.from(await fetch(url).then((r) => r.arrayBuffer()));
}

const [display, mono] = await Promise.all([
  fetchSubset('Zen+Kaku+Gothic+New', 700, TITLE_LINES.join('') + TAGLINE),
  fetchSubset('IBM+Plex+Mono', 500, EYEBROW + FOOTER_LEFT + FOOTER_RIGHT),
]);

const el = (type, props, ...children) => ({
  type,
  props: { ...props, children: children.length ? children.flat() : props.children },
});

const tree = el(
  'div',
  {
    style: {
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      background: INK,
      backgroundImage: `linear-gradient(135deg, ${INK} 0%, #202b3a 100%)`,
      padding: '72px 80px',
      fontFamily: 'mono',
    },
  },
  el(
    'div',
    { style: { display: 'flex', alignItems: 'center', gap: 16 } },
    el('div', {
      style: { width: 12, height: 12, borderRadius: 6, background: ACCENT_BRIGHT, display: 'flex' },
    }),
    el(
      'div',
      { style: { fontSize: 26, color: ACCENT_BRIGHT, letterSpacing: 1, display: 'flex' } },
      EYEBROW,
    ),
  ),
  el(
    'div',
    { style: { display: 'flex', flexDirection: 'column', gap: 28 } },
    el(
      'div',
      {
        style: {
          display: 'flex',
          flexDirection: 'column',
          fontSize: 64,
          fontWeight: 700,
          color: '#fff',
          fontFamily: 'display',
          lineHeight: 1.35,
        },
      },
      ...TITLE_LINES.map((line) => el('div', { style: { display: 'flex' } }, line)),
    ),
    el(
      'div',
      { style: { fontSize: 30, color: 'rgba(255,255,255,0.72)', display: 'flex' } },
      TAGLINE,
    ),
  ),
  el(
    'div',
    {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTop: `1px solid ${LINE}`,
        paddingTop: 32,
      },
    },
    el(
      'div',
      { style: { fontSize: 24, color: ACCENT_BRIGHT, display: 'flex' } },
      FOOTER_LEFT,
    ),
    el(
      'div',
      { style: { fontSize: 22, color: 'rgba(255,255,255,0.5)', display: 'flex' } },
      FOOTER_RIGHT,
    ),
  ),
);

const res = new ImageResponse(tree, {
  width: 1200,
  height: 630,
  fonts: [
    { name: 'display', data: display, weight: 700, style: 'normal' },
    { name: 'mono', data: mono, weight: 500, style: 'normal' },
  ],
});

const buf = Buffer.from(await res.arrayBuffer());
fs.writeFileSync('public/ogp.png', buf);
console.log('wrote public/ogp.png', buf.length, 'bytes');
