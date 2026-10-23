import { defineConfig, devices } from '@playwright/test';

// テストの前に Go でサイトを書き出し、Cloudflare と同じ URL の解決をする手元のサーバー(cmd/serve)で配信する。
// 本番と同じ「書き出した静的ファイル」を相手にテストするので、ビルドの不具合もここで見つかる
const PORT = 8788;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: `go run ./cmd/build && go run ./cmd/serve -addr :${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
