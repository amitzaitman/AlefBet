// @ts-check
import { test, expect } from './network-server.js';

// One visit installs the whole site, so a reloaded game and a game that was never opened both play offline.
// What the install caches is unit-tested (service-worker.test.js, release-manifest.test.js).
test('after one visit, a reloaded game and a game never opened play offline', async ({ page, network }) => {
  await page.goto(`${network.url}/games/syllable-read/`);
  await expect(page.locator('.option-card')).toHaveCount(3);
  await network.reloadOffline(page);
  await expect(page.locator('.sr-replay')).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('.option-card')).toHaveCount(3);
  // nikud-match draws its choices with nikud-box.js, a file in its own folder.
  await page.goto(`${network.url}/games/nikud-match/`);
  await expect(page.locator('.ab-nikud-box')).toHaveCount(2);
});
