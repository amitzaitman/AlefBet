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

test('equations and the number line read left to right inside the RTL page', async ({ page, isMobile, network }) => {
  const activate = locator => isMobile ? locator.tap() : locator.click();
  // Compares where the first and last visible characters are drawn, not the DOM order.
  const readsLeftToRight = locator => locator.evaluate(el => {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) if (walker.currentNode.data.trim()) nodes.push(walker.currentNode);
    const edge = (node, index) => {
      const range = document.createRange();
      range.setStart(node, index);
      range.setEnd(node, index + 1);
      return range.getBoundingClientRect();
    };
    const first = nodes[0], last = nodes[nodes.length - 1];
    return edge(first, first.data.search(/\S/)).left < edge(last, last.data.trimEnd().length - 1).left;
  });
  for (const [game, selector] of [['make-ten', '.ten-equation'], ['number-line', '.line-equation'], ['fraction-whole', '.fraction-equation']]) {
    await page.goto(`${network.url}/games/${game}/`);
    await expect(page.locator(selector)).toBeVisible();
    expect(await readsLeftToRight(page.locator(selector)), `${game} ${selector}`).toBe(true);
  }
  // The number line grows to the right, and the right arrow moves the marker right.
  await page.goto(`${network.url}/games/number-line/`);
  const x = async locator => (await locator.boundingBox()).x;
  const marks = page.locator('.number-line__mark');
  expect(await x(marks.first())).toBeLessThan(await x(marks.last()));
  const left = page.getByRole('button', { name: 'צעד שמאלה', exact: true });
  const right = page.getByRole('button', { name: 'צעד ימינה', exact: true });
  expect(await x(left)).toBeLessThan(await x(right));
  const current = page.locator('.number-line__mark--current');
  const before = await x(current);
  const atEnd = await right.isDisabled();
  await activate(atEnd ? left : right);
  if (atEnd) await expect.poll(() => x(current)).toBeLessThan(before);
  else await expect.poll(() => x(current)).toBeGreaterThan(before);
});
