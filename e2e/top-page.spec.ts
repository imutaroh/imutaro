import { test, expect } from '@playwright/test';

test.describe('トップページ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('カードを挟まず、最初から LP が表示される', async ({ page }) => {
    await expect(page.getByRole('button', { name: /プロフィールカード/ })).toHaveCount(0);

    // 本文がそのままスクロールできる
    await page.mouse.wheel(0, 400);
    await expect.poll(() => page.evaluate(() => Math.round(window.scrollY))).toBeGreaterThan(0);
  });

  test('ヒーロー見出しが表示される', async ({ page }) => {
    // TypedTitle はタイプ演出だが aria-label に全文を持つ
    const heading = page.getByRole('heading', {
      level: 1,
      name: '周りの価値を、最大化するエンジニアへ',
    });
    await expect(heading).toBeVisible();
  });

  test('主要セクションが表示される', async ({ page }) => {
    for (const section of ['About', 'Learning Log', 'Stack', 'Contact']) {
      await expect(page.getByRole('heading', { level: 2, name: section })).toBeVisible();
    }
  });

  test('Zenn / note 一覧への導線が機能する', async ({ page }) => {
    const writingsLink = page.locator('a[href="/writings"]').first();
    await writingsLink.scrollIntoViewIfNeeded();
    await expect(writingsLink).toBeVisible();
    await writingsLink.click();
    await expect(page).toHaveURL(/\/writings/);
  });
});

test.describe('/card', () => {
  test('カードをドラッグで回して裏(QR)まで出せる', async ({ browser }) => {
    // スマホ相当。touchmove がスクロールに奪われると、カードを回せず裏の QR に辿り着けない
    const ctx = await browser.newContext({ hasTouch: true, viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    await page.goto('/card');

    const stage = page.locator('[data-card-stage]').first();
    await expect(stage).toBeVisible();
    const box = (await stage.boundingBox())!;
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;

    const cdp = await ctx.newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x: cx, y: cy }],
    });
    for (let i = 1; i <= 10; i++) {
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x: cx - i * 20, y: cy }],
      });
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });

    const spin = await page.evaluate(() => {
      const el = document.querySelector('[data-card-stage] > div') as HTMLElement | null;
      const m = el?.style.transform.match(/rotateY\((-?[\d.]+)deg\)/);
      return m ? Math.abs(parseFloat(m[1])) : 0;
    });
    expect(spin).toBeGreaterThan(90);

    await ctx.close();
  });
});
