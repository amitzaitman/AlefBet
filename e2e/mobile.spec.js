import { test, expect } from '@playwright/test';

test('touch retry, audio failure, completion, replay and offline reload', async ({ page, context }) => {
  await page.route('**/translate.google.com/**', route => route.abort());
  await page.route('**/translate_tts**', route => route.abort());
  await page.addInitScript(() => {
    localStorage.setItem('alefbet.editor.letter-match-animals', JSON.stringify({
      id: 'letter-match-animals', version: 1, meta: { type: 'multiple-choice' },
      rounds: [
        { id: 'a', target: 'א', correct: 'אַרְיֵה', correctEmoji: '🦁' },
        { id: 'b', target: 'ב', correct: 'בֵּיצָה', correctEmoji: '🥚' },
      ],
    }));
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, get: () => undefined });
    HTMLAudioElement.prototype.play = () => Promise.reject(new DOMException('blocked', 'NotAllowedError'));
  });
  await page.goto('/games/letter-match-animals/');
  const cards = page.locator('.option-card');
  await expect(cards).toHaveCount(4);
  const choices = await cards.allTextContents();
  await page.locator('[data-id="wrong-0"]').tap();
  await expect(cards.first()).toBeDisabled();
  await expect(cards.first()).toBeEnabled();
  expect(await cards.allTextContents()).toEqual(choices);
  await page.evaluate(async () => {
    const { tts } = await import('/framework/dist/runtime.js');
    await tts.speak('שלום');
  });
  await expect(page.locator('#alefbet-audio-status-banner')).toBeVisible();
  await page.locator('[data-id="correct"]').tap();
  await expect(page.locator('.letter-display')).toHaveText('ב');
  await page.locator('[data-id="correct"]').tap();
  await expect(page.locator('.completion-screen')).toBeVisible();
  await page.locator('.completion-screen__replay').tap();
  await expect(cards).toHaveCount(4);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await context.setOffline(true);
  await page.reload();
  await expect(cards).toHaveCount(4);
  await page.locator('[data-id="correct"]').tap();
  await expect(page.locator('.letter-display')).toHaveText('ב');
});
