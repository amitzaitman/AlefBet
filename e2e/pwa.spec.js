// @ts-check
import { expect } from '@playwright/test';
import { test } from './network-server.js';

test.describe('PWA', () => {
  test('service worker registers and precaches the site core', async ({ page }) => {
    await page.goto('/');

    const scope = await page.evaluate(async () => {
      const reg = await navigator.serviceWorker.ready;
      return reg.scope;
    });
    expect(scope).toBe('http://localhost:8080/');

    // The install step precaches the core; poll until the cache appears.
    await expect(async () => {
      const cached = await page.evaluate(async () => {
        const keys = await caches.keys();
        const key = keys.find(k => k.startsWith('alefbet-'));
        if (!key) return [];
        const cache = await caches.open(key);
        const requests = await cache.keys();
        return requests.map(r => new URL(r.url).pathname);
      });
      expect(cached).toEqual(expect.arrayContaining(['/framework/dist/runtime.js', '/framework/dist/runtime.css']));
    }).toPass({ timeout: 10_000 });
  });

  test('manifest and icons are served', async ({ page, request }) => {
    await page.goto('/');
    const manifest = await request.get('/manifest.webmanifest');
    expect(manifest.ok()).toBeTruthy();
    const json = await manifest.json();
    expect(json.lang).toBe('he');
    expect(json.icons.length).toBeGreaterThanOrEqual(2);

    for (const icon of ['/assets/icons/icon-192.png', '/assets/icons/icon-512.png', '/assets/icons/apple-touch-icon.png']) {
      const resp = await request.get(icon);
      expect(resp.ok(), icon).toBeTruthy();
    }
  });

  test('after one visit anywhere, a game works with the network gone', async ({ page, network }) => {
    // ביקור יחיד: ההתקנה שומרת מראש את כל האתר, כולל משחקים שלא בוקרו.
    await page.goto(`${network.url}/games/syllable-read/`);
    await page.waitForSelector('.option-card', { timeout: 15_000 });
    await page.evaluate(() => navigator.serviceWorker.ready);

    // המתן שה-precache של ההתקנה יכלול את עמוד המשחק עצמו.
    await expect(async () => {
      const cached = await page.evaluate(async () => {
        const keys = await caches.keys();
        const key = keys.find(k => k.startsWith('alefbet-'));
        if (!key) return [];
        const cache = await caches.open(key);
        return (await cache.keys()).map(r => new URL(r.url).pathname);
      });
      expect(cached).toEqual(expect.arrayContaining([
        '/games/syllable-read/',
        '/games/syllable-read/game.js',
        '/games/syllable-read/game.css',
      ]));
    }).toPass({ timeout: 10_000 });

    // ניתוק רשת מלא ורענון: העמוד חייב לעלות מהמטמון.
    await network.offline(page);
    await page.reload();
    await expect(page.locator('.sr-replay')).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('.option-card')).toHaveCount(3);
    await network.online(page);
  });

  test('home cards come from the catalog and catalog is precached', async ({ page }) => {
    await page.goto('/');
    const cards = page.locator('.game-card');
    await expect(cards).toHaveCount(await page.evaluate(() => self.ALEFBET_CATALOG.length));
    await expect(page.locator('.game-card[data-game-id="letter-match-animals"]')).toBeVisible();
    await expect(page.locator('.game-card[href$="games/sound-studio/"]')).toBeHidden();
    await page.getByText('להורים ולמורים', { exact: true }).click();
    await expect(page.locator('.game-card[href$="games/sound-studio/"]')).toBeVisible();
    await expect(page.locator('.game-card[data-game-id="letter-match-animals"] .game-card__desc'))
      .toContainText('22');

    await expect(async () => {
      const cached = await page.evaluate(async () => {
        const keys = await caches.keys();
        const key = keys.find(k => k.startsWith('alefbet-'));
        if (!key) return [];
        const cache = await caches.open(key);
        return (await cache.keys()).map(r => new URL(r.url).pathname);
      });
      expect(cached).toEqual(expect.arrayContaining(['/games/catalog.js']));
    }).toPass({ timeout: 10_000 });
  });
});

test('a game that was never opened plays offline, including its own modules', async ({ page, network }) => {
  await page.goto(`${network.url}/games/syllable-read/`);
  await expect(page.locator('.option-card')).toHaveCount(3);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await network.offline(page);
  // nikud-match draws its choices with nikud-box.js, a file in its own folder.
  await page.goto(`${network.url}/games/nikud-match/`);
  await expect(page.locator('.ab-nikud-box')).toHaveCount(2);
});
