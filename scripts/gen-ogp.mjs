// public/ogp.png を作り直す。実行: node scripts/gen-ogp.mjs
// 原稿は scripts/ogp.html。Google Fonts を読むのでオフラインでは動かない。
// ブラウザが無ければ先に npx playwright install chromium を実行する。
import { chromium } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const source = new URL('./ogp.html', import.meta.url).href;
const out = fileURLToPath(new URL('../public/ogp.png', import.meta.url));

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.goto(source, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: out });
  console.log(`${out} に書き出した`);
} finally {
  await browser.close();
}
