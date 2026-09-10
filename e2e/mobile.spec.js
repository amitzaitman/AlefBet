import { expect } from '@playwright/test';
import { test } from './network-server.js';

test('touch retry, audio failure, completion, replay and offline reload', async ({ page, network }) => {
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
  await page.goto(`${network.url}/games/letter-match-animals/`);
  const cards = page.locator('.option-card');
  await expect(cards).toHaveCount(4);
  const choices = await cards.allTextContents();
  await page.locator('[data-id="wrong-0"]').tap();
  expect(await cards.evaluateAll(elements => elements.every(el => !el.disabled))).toBe(true);
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
  await network.offline(page);
  await page.reload();
  await expect(cards).toHaveCount(4);
  await page.locator('[data-id="correct"]').tap();
  await expect(page.locator('.letter-display')).toHaveText('ב');
});

test('adult tools stay separate and feedback does not move the choices', async ({ page }) => {
  await page.goto('/');
  const studio = page.locator('a[href="games/sound-studio/"]');
  await expect(studio).toBeHidden();
  await page.getByText('להורים ולמורים', { exact: true }).click();
  await expect(studio).toBeVisible();
  await page.goto('/games/letter-match-animals/');
  const cards = page.locator('.option-cards-grid');
  await expect(cards).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  const before = await cards.boundingBox();
  await expect(page.getByRole('button', { name: '✏️ ערוך', exact: true })).toBeHidden();
  await page.getByText('למבוגרים', { exact: true }).tap();
  expect(await cards.boundingBox()).toEqual(before);
  await page.keyboard.press('Escape');
  await expect(page.locator('.adult-tools')).not.toHaveAttribute('open', '');
  await page.locator('[data-id="wrong-0"]').tap();
  await expect(page.locator('.feedback-message--hint')).toBeVisible();
  const after = await cards.boundingBox();
  expect(Math.abs(after.y - before.y)).toBeLessThan(1);
  expect(Math.abs(after.width - before.width)).toBeLessThan(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('nikud supports tap selection, retry, completion and returning home', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('alefbet.editor.nikud-match', JSON.stringify({
      id: 'nikud-match', version: 1, meta: { type: 'drag-match' },
      rounds: [{ id: 'a', target: 'ב', correct: 'kamatz', correctEmoji: '' }],
    }));
  });
  await page.goto('/games/nikud-match/');
  const letter = page.locator('.nm-arena .nm-letter');
  const correct = page.locator('.nm-zone[data-nikud="kamatz"]');
  const wrong = page.locator('.nm-zone:not([data-nikud="kamatz"])');
  await expect(letter).toBeVisible();
  await correct.tap();
  await expect(letter).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('.completion-screen')).toHaveCount(0);
  await letter.tap();
  await expect(letter).toHaveAttribute('aria-pressed', 'true');
  await wrong.tap();
  await expect(letter).toBeEnabled();
  await expect(letter).toHaveAttribute('aria-pressed', 'true');
  await correct.tap();
  await expect(page.locator('.completion-screen__score')).toHaveText('הִשְׁלַמְתֶּם מְשִׂימָה!');
  await page.locator('.completion-screen__replay').tap();
  await expect(page.locator('.nm-arena .nm-letter')).toHaveAttribute('aria-pressed', 'false');
  await letter.tap();
  await correct.tap();
  await expect(page.locator('.completion-screen')).toBeVisible();
  await page.locator('.completion-screen__home').tap();
  await expect(page.locator('.games-grid').first()).toBeVisible();
});
