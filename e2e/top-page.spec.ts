import { test, expect } from '@playwright/test';

test.describe('トップページ', () => {
  test('ヒーロー見出しが表示される', async ({ page }) => {
    await page.goto('/');

    // TypedTitle はタイプ演出だが aria-label に全文を持つ
    const heading = page.getByRole('heading', {
      level: 1,
      name: '周りの価値を、最大化するエンジニアへ',
    });
    await expect(heading).toBeVisible();
  });

  test('主要セクションが表示される', async ({ page }) => {
    await page.goto('/');

    for (const section of ['About', 'Learning Log', 'Stack', 'Contact']) {
      await expect(page.getByRole('heading', { level: 2, name: section })).toBeVisible();
    }
  });

  test('ブログ一覧への導線が機能する', async ({ page }) => {
    await page.goto('/');

    const blogLink = page.locator('a[href="/blog"]').first();
    await blogLink.scrollIntoViewIfNeeded();
    await expect(blogLink).toBeVisible();
    await blogLink.click();
    await expect(page).toHaveURL(/\/blog/);
  });
});
