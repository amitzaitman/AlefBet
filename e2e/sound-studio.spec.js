// @ts-check
import { test, expect } from '@playwright/test';

const STUDIO_URL = '/games/sound-studio/';

test.describe('sound-studio', () => {
  test('renders all three recording sections with progress counter', async ({ page }) => {
    await page.goto(STUDIO_URL);

    await expect(page.locator('.studio__title')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('.studio__section')).toHaveCount(3);

    // 27 letters + 7 nikud + 12x7 syllables = 118 sound cards.
    await expect(page.locator('.studio__card')).toHaveCount(118);

    const progress = await page.locator('.studio__progress').textContent();
    expect(progress).toContain('118');
  });

  test('listen button previews a sound without breaking when offline', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => false });
      Object.defineProperty(window, 'speechSynthesis', { configurable: true, get: () => undefined });
    });
    await page.route(/^https?:\/\/(?!localhost)/, route => route.abort());

    await page.goto(STUDIO_URL);
    const firstListen = page.locator('.studio__listen').first();
    await expect(firstListen).toBeVisible({ timeout: 10_000 });

    await firstListen.click();
    // The chain must resolve and re-enable the button (offline synth path).
    await expect(firstListen).toBeEnabled({ timeout: 10_000 });
  });
});
