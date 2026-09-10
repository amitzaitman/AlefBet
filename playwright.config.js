// @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * AlefBet Playwright e2e config.
 * Boots the static dev server (`node start.js 8080`) and runs Chromium specs
 * from the `e2e/` directory.
 */
export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:8080',
    trace: 'retain-on-failure',

  },
  projects: [
    {
      name: 'chromium',
      testIgnore: /mobile\.spec\.js/,
      use: { ...devices['Desktop Chrome'],
        ...(process.env.PW_CHROMIUM_PATH ? { launchOptions: { executablePath: process.env.PW_CHROMIUM_PATH } } : {}),
      },
    },
    {
      name: 'mobile-chromium',
      testMatch: /mobile\.spec\.js|math\.spec\.js|network\.spec\.js|home\.spec\.js|pwa-refresh\.spec\.js/,
      use: { ...devices['Pixel 7'],
        ...(process.env.PW_CHROMIUM_PATH ? { launchOptions: { executablePath: process.env.PW_CHROMIUM_PATH } } : {}),
      },
    },
    {
      name: 'mobile-webkit',
      testMatch: /mobile\.spec\.js|math\.spec\.js|network\.spec\.js|home\.spec\.js|pwa-refresh\.spec\.js|pwa-upgrade\.spec\.js/,
      use: { ...devices['iPhone 13'] },
    },
  ],
  webServer: {
    command: 'node start.js 8080',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
