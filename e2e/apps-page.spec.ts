import { test, expect } from '@playwright/test';

// internal/profile/apps.go の DockApps と同じ並び。アプリを足したらここも足す
const APPS = [
  { name: 'Arc', href: 'https://arc.net/' },
  { name: 'Ghostty', href: 'https://ghostty.org/' },
  { name: 'Obsidian', href: 'https://obsidian.md/' },
  { name: 'Notion', href: 'https://www.notion.com/' },
  { name: 'Notion Calendar', href: 'https://www.notion.com/product/calendar' },
  { name: 'Slack', href: 'https://slack.com/' },
  { name: 'Kindle', href: 'https://www.amazon.com/kindle-dbs/fd/kcp' },
  { name: 'Music', href: 'https://www.apple.com/apple-music/' },
  { name: 'Raycast', href: 'https://www.raycast.com/' },
  { name: 'Nani', href: 'https://nani.now/' },
  { name: 'Typeless', href: 'https://www.typeless.com/' },
];

test.describe('/apps', () => {
  test('使っているアプリが全部並び、それぞれ公式サイトへのリンクになっている', async ({ page }) => {
    await page.goto('/apps');
    await expect(page.getByRole('heading', { level: 1, name: "imutaro's Dock" })).toBeVisible();

    const items = page.getByRole('listitem');
    await expect(items).toHaveCount(APPS.length);

    for (const app of APPS) {
      const link = page.getByRole('link', { name: app.name, exact: true });
      await expect(link).toHaveAttribute('href', app.href);
      // アイコン画像が実際に読み込めている(404 だと naturalWidth が 0)
      await expect
        .poll(
          () =>
            link
              .locator('img')
              .evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0),
          { message: `${app.name} のアイコン` },
        )
        .toBe(true);
    }
  });
});
