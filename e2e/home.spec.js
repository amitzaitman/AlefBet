import { expect } from '@playwright/test';
import { test } from './network-server.js';

test('home groups games by subject, supports navigation and keeps groups offline', async ({ page, network }) => {
  await page.goto(network.url);
  const reading = page.locator('#subject-reading');
  const math = page.locator('#subject-math');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(reading.locator('.game-card')).toHaveCount(4);
  await expect(math.locator('.game-card')).toHaveCount(5);
  await expect(page.locator('#subject-other')).toHaveCount(0);
  await expect(math.locator('.game-card__topic')).toHaveCount(5);
  await expect(reading.locator('[data-game-id="letter-match-animals"]')).toBeVisible();
  await expect(math.locator('[data-game-id="fraction-picture"]')).toBeVisible();
  const mathLink = page.locator('.subject-nav a[href="#subject-math"]');
  await mathLink.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#subject-math$/);
  await expect(math.getByRole('heading', { level: 2 })).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.locator('.teacher-tools-grid .game-card')).toBeHidden();
  await page.getByText('להורים ולמורים', { exact: true }).click();
  await expect(page.locator('.teacher-tools-grid .game-card')).toBeVisible();
  await page.evaluate(() => navigator.serviceWorker.ready);
  await network.offline(page);
  await page.reload();
  await expect(reading.locator('.game-card')).toHaveCount(4);
  await expect(math.locator('.game-card')).toHaveCount(5);
});
