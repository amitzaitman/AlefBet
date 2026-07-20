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
    // סביבות מנוהלות (Claude Code on the web וכד') מספקות Chromium מותקן מראש
    // בגרסה שונה מזו שהחבילה מצפה לה; PW_CHROMIUM_PATH עוקף את ההורדה.
    ...(process.env.PW_CHROMIUM_PATH
      ? { launchOptions: { executablePath: process.env.PW_CHROMIUM_PATH } }
      : {}),
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
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
