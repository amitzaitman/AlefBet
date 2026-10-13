// @ts-check
import { expect } from '@playwright/test';
import { test } from './network-server.js';

const GAME_URL = '/games/letter-match-animals/';

/**
 * Always block the live Google TTS endpoints — keeps every spec deterministic
 * and offline regardless of which path it is exercising.
 */
async function blockGoogleTTS(page) {
  await page.route('**/translate.google.com/**', route => route.abort());
  await page.route('**/translate_tts**', route => route.abort());
}

/**
 * Clicks the card the game grades as correct, after checking that its word starts with
 * the letter on screen. hebrew-letters.test.js checks every example word against its letter.
 * @param {import('@playwright/test').Page} page
 */
async function answerCorrectly(page) {
  await expect(page.locator('.option-card')).toHaveCount(4);
  const letter = (await page.locator('.letter-display').textContent())?.trim();
  const correct = page.locator('.option-card[data-id="correct"]:enabled');
  await expect(correct.locator('.option-card__text')).toHaveText(new RegExp(`^${letter}`));
  await correct.click();
}

test('eight rounds with a retry, a completion summary and a replay that keeps one audio listener', async ({ page }) => {
  await blockGoogleTTS(page);
  // Counts the game's audio-state listeners, so a game that leaks one on completion or replay fails.
  await page.addInitScript(() => {
    const listeners = new Set();
    const add = window.addEventListener.bind(window);
    const remove = window.removeEventListener.bind(window);
    window.addEventListener = (type, listener, options) => {
      if (type === 'alefbet:tts-state') listeners.add(listener);
      return add(type, listener, options);
    };
    window.removeEventListener = (type, listener, options) => {
      if (type === 'alefbet:tts-state') listeners.delete(listener);
      return remove(type, listener, options);
    };
    window.audioListenerCount = () => listeners.size;
  });
  const audioListeners = () => page.evaluate(() => window.audioListenerCount());
  await page.goto(GAME_URL);
  const cards = page.locator('.option-card');
  const letterDisplay = page.locator('.letter-display');
  const progress = page.locator('.progress-bar__label');
  const letters = new Set();
  for (let round = 0; round < 8; round++) {
    await expect(page.locator('.game-instruction')).toHaveText('אֵיזוֹ מִלָּה מַתְחִילָה בָּאוֹת?');
    const letter = await letterDisplay.textContent();
    expect(letters.has(letter)).toBe(false);
    letters.add(letter);
    if (round === 0) {
      await expect(letterDisplay).toBeVisible();
      await expect(cards).toHaveCount(4);
      expect(await audioListeners()).toBe(1);
      // A wrong answer keeps the same choices, letter and score, and the child can try again.
      const choices = await cards.allTextContents();
      await page.locator('.option-card[data-id="wrong-0"]').click();
      await expect(page.locator('.feedback-message--hint')).toBeVisible();
      expect(await cards.evaluateAll(elements => elements.every(el => !el.disabled))).toBe(true);
      expect(await cards.allTextContents()).toEqual(choices);
      await expect(letterDisplay).toHaveText(letter);
      await expect(progress).toHaveText('0 / 8');
    }
    await answerCorrectly(page);
    await expect(progress).toHaveText(`${round + 1} / 8`);
    if (round < 7) await expect(letterDisplay).not.toHaveText(letter);
  }
  await expect(page.locator('.completion-screen')).toBeVisible();
  await expect(page.locator('.completion-screen__score')).toHaveText('הִשְׁלַמְתֶּם 8 מְשִׂימוֹת!');
  expect(await audioListeners()).toBe(0);
  // mobile.spec.js follows the home link; here a trial click checks it can be clicked and stays for the replay.
  const home = page.locator('.completion-screen__home');
  await expect(home).toHaveAttribute('href', '../../index.html');
  await home.click({ trial: true });
  await page.locator('.completion-screen__replay').click();
  await expect(cards).toHaveCount(4);
  expect(await audioListeners()).toBe(1);
});
