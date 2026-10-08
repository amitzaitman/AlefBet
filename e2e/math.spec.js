import { expect } from '@playwright/test';
import { test } from './network-server.js';

for (const game of ['make-ten', 'number-line']) {
  test(`${game}: retry, completion, replay and offline`, async ({ page, isMobile, network }) => {
    const activate = locator => isMobile ? locator.tap() : locator.click();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${network.url}/games/${game}/`);
    await expect(page.locator('.game-title')).toBeVisible();
    for (let i = 0; i < 6; i++) {
      if (game === 'make-ten') {
        const given = Number((await page.locator('.ten-equation').innerText()).split(' ')[0]);
        const answer = String(10 - given);
        if (i === 0) {
          await activate(page.locator(`.option-card:not([data-id="${answer}"])`).first());
          await expect(page.locator('.feedback-message')).toContainText('הָרֵיקוֹת');
        }
        await activate(page.locator(`.option-card[data-id="${answer}"]`));
      } else {
        const equation = await page.locator('.line-equation').innerText();
        const [start, sign, steps] = equation.split(' ');
        if (i === 0) {
          await activate(page.getByRole('button', { name: 'בדיקת התשובה', exact: true }));
          await expect(page.locator('.feedback-message')).toContainText('הַקְּפִיצוֹת');
          // Keyboard and native buttons use the same input path as touch.
          const direction = page.getByRole('button', { name: sign === '+' ? 'צעד ימינה' : 'צעד שמאלה', exact: true });
          await direction.focus();
          await page.keyboard.press('Enter');
          await activate(page.getByRole('button', { name: 'חזרה לנקודת ההתחלה', exact: true }));
          await expect(page.locator('.line-position')).toContainText(start);
        }
        for (let step = 0; step < Number(steps); step++) {
          await activate(page.getByRole('button', { name: sign === '+' ? 'צעד ימינה' : 'צעד שמאלה', exact: true }));
        }
        await activate(page.getByRole('button', { name: 'בדיקת התשובה', exact: true }));
      }
      if (i < 5) {
        // A completed answer is locked until the following round is built.
        await expect(page.locator(game === 'make-ten' ? '.option-card:disabled' : '.line-check:disabled')).not.toHaveCount(0);
        await expect(page.locator(game === 'make-ten' ? '.option-card:enabled' : '.line-check:enabled').first()).toBeVisible();
      }
    }
    await expect(page.locator('.completion-screen')).toBeVisible();
    await activate(page.locator('.completion-screen__replay'));
    await expect(page.locator('.game-title')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.evaluate(async () => { await navigator.serviceWorker.ready; });
    await network.offline(page);
    await page.reload();
    await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
    await expect(page.locator(game === 'make-ten' ? '.ten-frame' : '.number-line')).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test('long-exercise: solve part by part, hints, keyboard, completion, replay and offline', async ({ page, isMobile, network }) => {
  test.setTimeout(120_000);
  const activate = locator => isMobile ? locator.tap() : locator.click();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${network.url}/games/long-exercise/`);
  await expect(page.locator('.game-title')).toBeVisible();
  const part = page.locator('.chain-part');
  const trail = page.locator('.chain-trail li');
  const terms = [3, 4, 4, 5, 6, 7];
  for (let round = 0; round < terms.length; round++) {
    // A new round starts with an empty trail; the previous round keeps its solved parts.
    await expect(trail).toHaveCount(0);
    await expect(page.locator('.chain-original .chain-term')).toHaveCount(terms[round]);
    let last;
    for (let step = 0; step < terms[round] - 1; step++) {
      await expect(part).toBeVisible();
      const [left, right] = (await part.locator('.chain-term').allInnerTexts()).map(Number);
      const op = await part.locator('.chain-op').innerText();
      last = op === '+' ? left + right : left - right;
      await expect(page.locator('.chain-question')).toContainText(`${step + 1} מִתּוֹךְ ${terms[round] - 1}`);
      const correct = page.locator(`.chain-choice[data-value="${last}"]`);
      if (round === 0 && step === 0) {
        for (const choice of await page.locator('.chain-choice').all()) {
          const box = await choice.boundingBox();
          expect(box.width).toBeGreaterThanOrEqual(64);
          expect(box.height).toBeGreaterThanOrEqual(64);
        }
        await expect(page.locator('.chain-dots')).toBeHidden();
        const wrong = page.locator(`.chain-choice:not([data-value="${last}"])`);
        await activate(wrong.first());
        // A wrong answer reveals counting dots and retires that choice, without advancing.
        await expect(page.locator('.chain-dots')).toBeVisible();
        await expect(page.locator('.chain-dot')).toHaveCount(left + right);
        await expect(page.locator('.feedback-message')).toContainText('הַנְּקֻדּוֹת');
        await expect(wrong.first()).toBeDisabled();
        await expect(correct).not.toHaveClass(/--hint/);
        await activate(page.locator(`.chain-choice:enabled:not([data-value="${last}"])`).first());
        await expect(correct).toHaveClass(/--hint/);
        await expect(trail).toHaveCount(0);
      }
      if (round === 1 && step === 0) {
        await activate(page.getByRole('button', { name: 'רמז לחלק המסומן', exact: true }));
        await expect(page.locator('.chain-dots')).toBeVisible();
        await correct.focus();
        await page.keyboard.press('Enter');
      } else await activate(correct);
      await expect(trail).toHaveCount(step + 1);
      await expect(trail.nth(step)).toHaveText(`${left} ${op} ${right} = ${last}`);
      if (step < terms[round] - 2) {
        // The solved part merges into one number before the next part is marked.
        await expect(page.locator('.chain-current .chain-term--total')).toHaveText(String(last));
      }
    }
    await expect(page.locator('.chain-original .chain-answer--solved')).toHaveText(String(last));
    await expect(page.locator('.chain-current .chain-term')).toHaveText(String(last));
    await expect(page.locator('.chain-choice')).toHaveCount(0);
    await expect(page.locator('.chain-help')).toBeDisabled();
  }
  await expect(page.locator('.completion-screen')).toBeVisible();
  await activate(page.locator('.completion-screen__replay'));
  await expect(part).toBeVisible();
  await expect(trail).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await network.offline(page);
  await page.reload();
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  await expect(part).toBeVisible();
  await expect(page.locator('.chain-choice').first()).toBeEnabled();
  expect(errors).toEqual([]);
});
