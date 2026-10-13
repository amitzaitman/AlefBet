// @ts-check
import { test, expect, noVoice } from './network-server.js';

const GAME_URL = '/games/syllable-read/';

/**
 * The index of the round's target card. The target shares its letter with one option
 * and its vowel with the other, which no distractor can do (games/syllable-read/game.js).
 * @param {import('@playwright/test').Page} page
 */
async function targetIndex(page) {
  const ids = await page.locator('.option-card').evaluateAll(elements => elements.map(el => el.dataset.id));
  const index = ids.findIndex(id => {
    const [letter, vowel] = id.split(':');
    return ids.filter(other => other.split(':')[0] === letter).length === 2
      && ids.filter(other => other.split(':')[1] === vowel).length === 2;
  });
  expect(index).toBeGreaterThanOrEqual(0);
  return index;
}

test.describe('syllable-read', () => {
  test('offline path: with no network and no system voices the game still plays (phoneme synth)', async ({ page }) => {
    // A device with no network and no installed voices.
    await noVoice(page, { offline: true });
    await page.goto(GAME_URL);

    await expect(page.locator('.sr-replay')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('.option-card')).toHaveCount(3);

    // The replay button must not hang: the audio promise chain resolves offline.
    await page.locator('.sr-replay').click();
    await expect(page.locator('.sr-replay')).toBeEnabled({ timeout: 10_000 });

    await page.locator('.option-card').nth(await targetIndex(page)).click();
    await expect(page.locator('.progress-bar__label')).toHaveText('1 / 8');
  });
});


test('a pending hint cannot unlock cards after a correct answer', async ({ page }) => {
  await page.clock.install();
  await page.goto(GAME_URL);
  const cards = page.locator('.option-card');
  await expect(cards).toHaveCount(3);
  await page.clock.pauseAt(new Date(Date.now() + 1000));
  const target = await targetIndex(page);
  const wrong = cards.nth((target + 1) % 3);
  await wrong.dispatchEvent('click');
  await wrong.dispatchEvent('click');
  await expect(page.locator('.option-card--hint')).toHaveCount(1);
  await page.clock.runFor(1200);
  await cards.nth(target).dispatchEvent('click');
  await page.clock.runFor(500);
  expect(await cards.evaluateAll(elements => elements.every(el => el.disabled))).toBe(true);
  await page.clock.runFor(400);
  expect(await cards.evaluateAll(elements => elements.every(el => !el.disabled))).toBe(true);
});
