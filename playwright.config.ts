import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end tests run the real API and web app together.
 *
 * - Separate ports (API 3101, web 5174) so they never clash with `npm run dev`.
 * - The committed Fake Store snapshot is the product source, so results are
 *   deterministic and an upstream outage can't fail the suite.
 * - A throwaway SQLite file and console email: no accounts or network needed.
 */
const API_PORT = 3101;
const WEB_PORT = 5174;
const baseURL = `http://localhost:${WEB_PORT}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] }, testIgnore: /mobile\.spec\.ts/ },
    { name: 'mobile', use: { ...devices['Pixel 7'] }, testMatch: /mobile\.spec\.ts/ },
  ],
  webServer: [
    {
      command: 'npm run start -w @catalogue/api',
      url: `http://localhost:${API_PORT}/api/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
      env: {
        API_PORT: String(API_PORT),
        PRODUCT_SOURCE: 'fakestore-snapshot',
        DATABASE_URL: 'file:data/e2e.db',
        EMAIL_PROVIDER: 'console',
        SALES_INBOX_EMAIL: 'sales@example.com',
      },
    },
    {
      command: `npm run dev -w @catalogue/web -- --port ${WEB_PORT} --strictPort`,
      url: baseURL,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
      env: { API_PROXY_TARGET: `http://localhost:${API_PORT}` },
    },
  ],
});
