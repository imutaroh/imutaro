import { test, expect, type Page } from '@playwright/test';

/* 「カーテン(.heroWipe)が一度でも立ったか」を rAF で観測する計測器。
   入場が丸ごと捨てられた場合(bail 経路・保留クラスの取りこぼし)でも
   最終状態は正常時と同じ値になるため、入場が実在したことはこれでしか見えない。
   ★計測ループは必ず止める。このサイトの中心的な受け入れ条件が
   「アイドル時 Paint/Raster/rAF が 0」なので、止まらない rAF を仕込んだまま
   フレーム計測を書くと計測器自身が偽陽性を作る */
const WATCH_TIMEOUT_MS = 6000;

const watchWipe = async (page: Page) => {
  await page.addInitScript((timeoutMs) => {
    (window as unknown as { __sawWipe: boolean }).__sawWipe = false;
    const deadline = performance.now() + timeoutMs;
    let raf = 0;
    const tick = () => {
      const el = document.querySelector('[data-hero="wipe"]');
      if (el && getComputedStyle(el).display === 'block') {
        (window as unknown as { __sawWipe: boolean }).__sawWipe = true;
        cancelAnimationFrame(raf);
        return;
      }
      if (performance.now() > deadline) return;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }, WATCH_TIMEOUT_MS);
};

const sawWipe = (page: Page) =>
  page.evaluate(() => (window as unknown as { __sawWipe: boolean }).__sawWipe);

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

  // toBeVisible() は opacity を見ないため、入場が壊れて opacity:0 のまま残る回帰を
  // 上のテストは1件も検知できない。ヒーローの事前状態(CSS keyframes の opacity:0 と
  // GSAP の inline style)が確実に解けることを、この1件だけが自動で守る
  test('ヒーロー入場が完了して不透明になる', async ({ page }) => {
    await page.goto('/');

    // 入場は js-hero-hold 解除(最大1600ms)+ 1.3秒。余裕を見て 4 秒で判定する。
    // CTA は行(.heroCta)側がフェード対象なので親を見る
    await expect
      .poll(() => page.locator('h1').evaluate((el) => Number(getComputedStyle(el).opacity)), {
        timeout: 4000,
      })
      .toBe(1);
    await expect
      .poll(
        () =>
          page
            .locator('[data-hero="cta-primary"]')
            .evaluate((el) => Number(getComputedStyle(el.parentElement!).opacity)),
        { timeout: 4000 },
      )
      .toBe(1);
    // 「注ぎ込み」のカーテンは入場後に描画ツリーから外れる(アイドル時 Paint 0ms の担保)
    await expect
      .poll(
        () => page.locator('[data-hero="wipe"]').evaluate((el) => getComputedStyle(el).display),
        { timeout: 4000 },
      )
      .toBe('none');
  });

  /* 上のテストの3つのアサーションは、HeroStage が入場を丸ごと捨てた場合(bail 経路・
     保留クラスの取りこぼし)でも同じ値になる。とくに wipe の display:none は CSS 既定値
     そのものなので「一度も走らなかった」ケースを無条件に通してしまう。
     そこで watchWipe(ファイル先頭)で入場が実在したことを直接見る */
  test('ヒーロー入場(注ぎ込みのカーテン)が実際に走る', async ({ page }) => {
    await watchWipe(page);
    await page.goto('/');

    await expect.poll(() => sawWipe(page), { timeout: 5000 }).toBe(true);
  });

  test('ブログからロゴでトップへ戻ってもヒーロー入場が走る', async ({ page }) => {
    // クライアント遷移では layout.tsx のインライン script が再実行されず
    // js-hero-hold が付かない。それを「手遅れ」と誤判定して入場を捨てる回帰を防ぐ
    await watchWipe(page);
    await page.goto('/blog');
    await page.locator('header a[href="/"]').first().click();
    // baseURL 相対で解決させる(ホスト・ポートを直書きすると CI でポートを変えた瞬間に落ちる)
    await expect(page).toHaveURL('/');

    await expect.poll(() => sawWipe(page), { timeout: 5000 }).toBe(true);
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

test.describe('トップページ(prefers-reduced-motion: reduce)', () => {
  test('カーテンは一度も現れず、ヒーローは最初から不透明', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await watchWipe(page);
    await page.goto('/');

    // 版面は待たずに不透明(globals.css の reduce 一括対応で duration も delay も潰れる)
    await expect
      .poll(() => page.locator('h1').evaluate((el) => Number(getComputedStyle(el).opacity)), {
        timeout: 2000,
      })
      .toBe(1);
    expect(await page.evaluate(() => (window as unknown as { __sawWipe: boolean }).__sawWipe)).toBe(
      false,
    );
  });
});
