import { test, expect } from '@playwright/test';
import { DOCK_APPS } from '../libs/apps';

test.describe('/apps', () => {
  test('使っているアプリが全部並び、それぞれ公式サイトへのリンクになっている', async ({ page }) => {
    await page.goto('/apps');
    await expect(page.getByRole('heading', { level: 1, name: "imutaro's Dock" })).toBeVisible();

    const items = page.getByRole('listitem');
    await expect(items).toHaveCount(DOCK_APPS.length);

    for (const app of DOCK_APPS) {
      const link = page.getByRole('link', { name: app.name, exact: true });
      await expect(link).toHaveAttribute('href', app.href);
      // アイコン画像が実際に読み込めている(404 だと naturalWidth が 0)
      await expect
        .poll(
          () =>
            link
              .locator('img')
              .evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0),
          { message: `${app.id} のアイコン` },
        )
        .toBe(true);
    }
  });
});
