import { defineConfig, devices } from '@playwright/test';

const port = process.env.PLAYWRIGHT_PORT || '4176';
const baseURL = `http://127.0.0.1:${port}/acsic-knowledge-hub/`;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'] } },
    {
      name: 'desktop-webkit',
      testMatch: /experience-smoke\.spec\.ts/,
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'desktop-firefox',
      testMatch: /experience-smoke\.spec\.ts/,
      use: { ...devices['Desktop Firefox'] },
    },
  ],
  webServer: {
    command: `pnpm build && pnpm exec vite preview --host 127.0.0.1 --port ${port} --strictPort`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
