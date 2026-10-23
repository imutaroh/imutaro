import { test, expect } from '@playwright/test';

test.describe('/writings', () => {
  test('すべて・Zenn・note のタブがそれぞれ別のページになっている', async ({ page }) => {
    await page.goto('/writings');
    await expect(page.getByRole('heading', { level: 1, name: 'Zenn / note' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'すべて' })).toHaveAttribute('aria-current', 'page');

    await page.getByRole('link', { name: 'Zenn', exact: true }).last().click();
    await expect(page).toHaveURL(/\/writings\/zenn$/);
    await expect(page.getByRole('link', { name: 'Zenn', exact: true }).last()).toHaveAttribute(
      'aria-current',
      'page',
    );
    // Zenn のページには Zenn の記事だけが並ぶ
    await expect(page.locator('.ext-badge[data-source="note"]')).toHaveCount(0);
    await expect(page.locator('.ext-badge[data-source="zenn"]').first()).toBeVisible();
  });

  test('旧 URL(?source=note)で来ても、新しい URL へ送られる', async ({ page }) => {
    await page.goto('/writings?source=note');
    await expect(page).toHaveURL(/\/writings\/note$/);
  });
});

test.describe('/uses', () => {
  test('道具の一覧と、アプリの Dock が出る', async ({ page }) => {
    await page.goto('/uses');
    await expect(page.getByRole('heading', { level: 1, name: 'Uses' })).toBeVisible();
    for (const group of ['マシン', 'アプリ', 'エディタ', 'AI']) {
      await expect(page.getByRole('heading', { level: 2, name: group })).toBeVisible();
    }
    await expect(page.getByRole('link', { name: 'Ghostty', exact: true }).first()).toBeVisible();
    await page.getByRole('link', { name: /大きく見る/ }).click();
    await expect(page).toHaveURL(/\/apps$/);
  });
});

test.describe('URL の扱い(Cloudflare と同じ)', () => {
  test('無いページは 404 を返し、トップへ戻る導線を出す', async ({ page }) => {
    const res = await page.goto('/no-such-page');
    expect(res?.status()).toBe(404);
    await expect(page.getByRole('link', { name: /トップへ戻る/ })).toBeVisible();
  });

  test('末尾のスラッシュや .html 付きの URL は、正規の URL へ送られる', async ({ page }) => {
    await page.goto('/apps/');
    await expect(page).toHaveURL(/\/apps$/);
    await page.goto('/card.html');
    await expect(page).toHaveURL(/\/card$/);
  });

  test('廃止した microCMS ブログの URL は 404 になる', async ({ page }) => {
    for (const path of ['/blog', '/articles/foo', '/tags/bar', '/search?q=go']) {
      const res = await page.goto(path);
      expect(res?.status(), path).toBe(404);
    }
  });
});

test.describe('トップのヒーロー', () => {
  test('見出しをクリックすると、いったん消えてから打ち直され、全文に戻る', async ({ page }) => {
    await page.goto('/');
    const title = page.locator('[data-typed]');
    await title.click();
    // 消している途中で、隠れた文字が出てくる
    await expect(title.locator('.tt-char-hidden').first()).toBeAttached();
    // 18文字 × 45ms + 400ms + 18文字 × 70ms ≒ 2.5秒で全文に戻る
    await expect(title.locator('.tt-char-hidden')).toHaveCount(0, { timeout: 5000 });
  });
});

test.describe('/card の「入る」', () => {
  test('Enter キーでトップへ移る', async ({ page }) => {
    await page.goto('/card');
    await page.locator('[data-card-stage]').focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/$/, { timeout: 5000 });
  });
});
