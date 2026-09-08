// @ts-check
import { test, expect } from '@playwright/test';

const GAME_URL = '/games/syllable-read/';

async function blockGoogleTTS(page) {
  await page.route('**/translate.google.com/**', route => route.abort());
  await page.route('**/translate_tts**', route => route.abort());
}

/**
 * Click through the three option cards until the round advances. Wrong picks
 * are penalty-free (a pulse + replay), so trying each card in turn always
 * reaches the correct one.
 * @param {import('@playwright/test').Page} page
 */
async function answerRound(page) {
  await expect(page.locator('.option-card').first()).toBeVisible({ timeout: 10_000 });
  const labelBefore = await page.locator('.progress-bar__label').textContent();

  for (let i = 0; i < 3; i++) {
    const advanced = await page.locator('.progress-bar__label').textContent();
    if (advanced !== labelBefore) return;
    await page.locator('.option-card').nth(i).click({ force: true });
    // Wrong answers replay the syllable before unlocking the round.
    await page.waitForTimeout(1200);
  }
}

test.describe('syllable-read', () => {
  test.beforeEach(async ({ page }) => {
    await blockGoogleTTS(page);
  });

  test('golden path: replay button and three syllable cards render, correct pick advances', async ({ page }) => {
    await page.goto(GAME_URL);

    await expect(page.locator('.sr-replay')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('.option-card')).toHaveCount(3);

    const initialLabel = await page.locator('.progress-bar__label').textContent();
    await answerRound(page);

    await expect(async () => {
      const label = await page.locator('.progress-bar__label').textContent();
      expect(label).not.toBe(initialLabel);
    }).toPass({ timeout: 10_000 });
  });

  test('offline path: with no network and no system voices the game still plays (phoneme synth)', async ({ page }) => {
    await page.addInitScript(() => {
      // Simulate a fully offline device with no installed TTS voices.
      Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => false });
      Object.defineProperty(window, 'speechSynthesis', { configurable: true, get: () => undefined });
    });
    // Belt and braces: kill every outbound request beyond the local server.
    await page.route(/^https?:\/\/(?!localhost)/, route => route.abort());

    await page.goto(GAME_URL);

    await expect(page.locator('.sr-replay')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('.option-card')).toHaveCount(3);

    // The replay button must not hang: the audio promise chain resolves offline.
    await page.locator('.sr-replay').click();
    await expect(page.locator('.sr-replay')).toBeEnabled({ timeout: 10_000 });

    const initialLabel = await page.locator('.progress-bar__label').textContent();
    await answerRound(page);

    await expect(async () => {
      const label = await page.locator('.progress-bar__label').textContent();
      expect(label).not.toBe(initialLabel);
    }).toPass({ timeout: 10_000 });
  });
});


test('a pending hint cannot unlock cards after a correct answer', async ({ page }) => {
  await blockGoogleTTS(page);
  await page.clock.install();
  await page.goto(GAME_URL);
  const cards = page.locator('.option-card');
  await expect(cards).toHaveCount(3);
  await page.clock.pauseAt(new Date(Date.now() + 1000));
  const ids = await cards.evaluateAll(elements => elements.map(el => el.dataset.id));
  // The target shares its letter with one distractor and its vowel with the other.
  const target = ids.find(id => {
    const [letter, vowel] = id.split(':');
    return ids.filter(other => other.split(':')[0] === letter).length === 2
      && ids.filter(other => other.split(':')[1] === vowel).length === 2;
  });
  expect(target).toBeTruthy();
  const wrongIndex = ids.findIndex(id => id !== target);
  await cards.nth(wrongIndex).dispatchEvent('click');
  await cards.nth(wrongIndex).dispatchEvent('click');
  await expect(page.locator('.option-card--hint')).toHaveCount(1);
  await page.clock.runFor(1200);
  await cards.nth(ids.indexOf(target)).dispatchEvent('click');
  await page.clock.runFor(500);
  expect(await cards.evaluateAll(elements => elements.every(el => el.disabled))).toBe(true);
  await page.clock.runFor(400);
  expect(await cards.evaluateAll(elements => elements.every(el => !el.disabled))).toBe(true);
});
