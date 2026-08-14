import { test, expect } from '@playwright/test';

test.describe('トップページ', () => {
  // トップは読み込むたびにカードの幕(HomeGate)がかぶさる。
  // ここの3件は幕ではなく LP 本体の検証なので、先に幕を開けてから始める。
  // 幕そのものの挙動は下の describe で検証する
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /サイトを見る/ }).click();
    await expect(page.getByRole('button', { name: /プロフィールカード/ })).toBeHidden();
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

  test('ブログ一覧への導線が機能する', async ({ page }) => {
    const blogLink = page.locator('a[href="/blog"]').first();
    await blogLink.scrollIntoViewIfNeeded();
    await expect(blogLink).toBeVisible();
    await blogLink.click();
    await expect(page).toHaveURL(/\/blog/);
  });
});

test.describe('トップの幕(カード)', () => {
  const gate = (page: import('@playwright/test').Page) =>
    page.getByRole('button', { name: /プロフィールカード/ });

  test('初回訪問で出て、逃げ道のボタンで開ける', async ({ page }) => {
    await page.goto('/');
    await expect(gate(page)).toBeVisible();

    // 幕が出ている間は本文をスクロールさせない
    await expect
      .poll(() => page.evaluate(() => getComputedStyle(document.body).overflow))
      .toBe('hidden');

    await page.getByRole('button', { name: /サイトを見る/ }).click();
    await expect(gate(page)).toBeHidden();

    // 閉じたらスクロールが戻る
    await page.mouse.wheel(0, 400);
    await expect.poll(() => page.evaluate(() => Math.round(window.scrollY))).toBeGreaterThan(0);
  });

  test('カードをドラッグしても閉じず、裏(QR)まで回せる', async ({ browser }) => {
    // スマホ相当。ドラッグの touchmove を「スクロール＝先へ進みたい」と誤認して
    // 幕が閉じると、カードを回せず裏の QR に辿り着けなくなる
    const ctx = await browser.newContext({ hasTouch: true, viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    await page.goto('/');

    const stage = page.locator('[data-card-stage]').first();
    await expect(stage).toBeVisible();
    const box = (await stage.boundingBox())!;
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;

    const cdp = await ctx.newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: cx, y: cy }] });
    for (let i = 1; i <= 10; i++) {
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x: cx - i * 20, y: cy }],
      });
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });

    // 幕は開いたまま、かつカードが実際に回っていること
    await expect(gate(page)).toBeVisible();
    const spin = await page.evaluate(() => {
      const el = document.querySelector('[data-card-stage] > div') as HTMLElement | null;
      const m = el?.style.transform.match(/rotateY\((-?[\d.]+)deg\)/);
      return m ? Math.abs(parseFloat(m[1])) : 0;
    });
    expect(spin).toBeGreaterThan(90);

    await ctx.close();
  });

  test('読み込み直すと毎回また出る（状態を保存しない）', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /サイトを見る/ }).click();
    await expect(gate(page)).toBeHidden();

    await page.reload();
    await expect(gate(page)).toBeVisible();
  });

  test('JS が無い環境では幕が出ず、LP がそのまま読める', async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto('/');
    await expect(
      page.getByRole('heading', { level: 1, name: '周りの価値を、最大化するエンジニアへ' }),
    ).toBeVisible();
    await ctx.close();
  });
});
