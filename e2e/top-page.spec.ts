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
    for (const section of [
      'About',
      'Learning Log',
      'Stack',
      'Dotfiles & Favorite Apps',
      'Notes',
      'Contact',
    ]) {
      await expect(page.getByRole('heading', { level: 2, name: section })).toBeVisible();
    }
  });

  test('ヘッダーの案内で各ページへ行ける', async ({ page }) => {
    const header = page.locator('header');
    await expect(header.getByText('いむたろ')).toBeVisible();
    await expect(header.getByRole('link', { name: '技術メモ' })).toHaveAttribute(
      'href',
      'https://notes.imutaro.com',
    );

    await header.getByRole('link', { name: '連絡' }).click();
    await expect(page).toHaveURL(/\/#contact$/);
    await expect(page.getByRole('heading', { level: 2, name: 'Contact' })).toBeInViewport();

    await header.getByRole('link', { name: '記事' }).click();
    await expect(page).toHaveURL(/\/writings$/);

    await page
      .locator('header')
      .getByRole('link', { name: /いむたろ/ })
      .click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('hero の Dock から外のサービスへ行ける', async ({ page }) => {
    const dock = page.locator('.lp-hero-dock');
    for (const [name, href] of [
      ['GitHub', 'https://github.com/imutaroh'],
      ['Zenn', 'https://zenn.dev/imu_imu'],
      ['note', 'https://note.com/imutaroh'],
      ['X', 'https://x.com/imutaroh'],
    ]) {
      await expect(dock.getByRole('link', { name, exact: true })).toHaveAttribute('href', href);
    }
  });

  test('Notes から Obsidian の技術メモへ行ける', async ({ page }) => {
    const notes = page.locator('section', {
      has: page.getByRole('heading', { level: 2, name: 'Notes' }),
    });
    await expect(notes.getByText('僕の技術メモは、')).toBeVisible();
    await expect(notes.getByRole('link', { name: /メモを読む/ })).toHaveAttribute(
      'href',
      'https://notes.imutaro.com',
    );
    // 遅延読み込みの画像がスクロール後に読み込めている
    const icon = notes.locator('img');
    await icon.scrollIntoViewIfNeeded();
    await expect.poll(() => icon.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBe(480);
  });

  test('Zenn / note 一覧への導線が機能する', async ({ page }) => {
    const writingsLink = page.locator('a[href="/writings"]').first();
    await writingsLink.scrollIntoViewIfNeeded();
    await expect(writingsLink).toBeVisible();
    await writingsLink.click();
    await expect(page).toHaveURL(/\/writings/);
  });

  test('Favorite Apps に6個並び、dotfiles へ行ける', async ({ page }) => {
    const apps = page.locator('section', {
      has: page.getByRole('heading', { level: 2, name: 'Dotfiles & Favorite Apps' }),
    });
    const dock = apps.locator('.lp-apps-dock');
    await expect(dock.getByRole('link')).toHaveCount(6);
    for (const name of ['Arc', 'Herdr', 'Obsidian', 'Raycast', 'Typeless', 'Notion Calendar']) {
      await expect(dock.getByRole('link', { name, exact: true })).toBeVisible();
    }
    await expect(apps.getByRole('link', { name: /dotfiles/ })).toHaveAttribute(
      'href',
      'https://github.com/imutaroh/dotfiles',
    );
  });
});

test.describe('スマホ', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('メニューのボタンは、スクロールしても右上に残って開ける', async ({ page }) => {
    await page.goto('/');
    const button = page.locator('header summary');
    const before = (await button.boundingBox())!;

    await page.evaluate(() => window.scrollTo(0, 3000));
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(2000);
    const after = (await button.boundingBox())!;
    expect(after.x).toBe(before.x);
    expect(after.y).toBe(before.y);

    // 名札はページと一緒に流れる
    await expect(page.locator('.hdr-who')).not.toBeInViewport();

    await button.click();
    const panel = page.locator('.hdr-menu-panel');
    await expect(panel).toBeInViewport();
    await panel.getByRole('link', { name: 'About', exact: true }).click();
    await expect(page).toHaveURL(/\/#about$/);
    await expect(page.locator('section#about')).toBeInViewport();
  });

  test('hero のボタンと Dock は出さない', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.lp-hero-cta')).toBeHidden();
  });

  test('メニューを開くと、トップの目次と各サービスへのリンクが出る', async ({ page }) => {
    await page.goto('/');
    const header = page.locator('header');
    await expect(header.locator('.hdr-nav')).toBeHidden();

    const button = header.locator('summary');
    await button.click();
    const panel = header.locator('.hdr-menu-panel');
    for (const name of [
      'About',
      'Learning Log',
      'Stack',
      'Dotfiles & Favorite Apps',
      'Notes',
      'Zenn / note の記事',
      'Contact',
      'GitHub',
      'Zenn',
      'note',
      'X',
    ]) {
      await expect(panel.getByRole('link', { name, exact: true })).toBeVisible();
    }

    // 目次の行き先がトップに全部ある
    for (const id of ['about', 'log', 'stack', 'apps', 'notes', 'articles', 'contact']) {
      await expect(page.locator(`section#${id}`)).toHaveCount(1);
    }

    // 同じページの中へ移るときは閉じる
    await panel.getByRole('link', { name: 'Contact', exact: true }).click();
    await expect(page).toHaveURL(/\/#contact$/);
    await expect(panel).toBeHidden();

    // 外を押しても閉じる
    await button.click();
    await expect(panel).toBeVisible();
    await page.mouse.click(20, 500);
    await expect(panel).toBeHidden();
  });

  test('記事は2列に並び、題名は読み上げのために残っている', async ({ page }) => {
    await page.goto('/writings');
    const cards = page.locator('.ext-card');
    const first = (await cards.nth(0).boundingBox())!;
    const second = (await cards.nth(1).boundingBox())!;
    expect(second.x).toBeGreaterThan(first.x + first.width - 1);
    expect(second.y).toBe(first.y);

    await expect(cards.nth(0).locator('.ext-title')).toHaveCSS('position', 'absolute');
    await expect(cards.nth(0).locator('.ext-title')).not.toHaveText('');
  });

  test('横にはみ出さない', async ({ page }) => {
    for (const path of ['/', '/writings', '/card']) {
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, path).toBe(0);
    }
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
