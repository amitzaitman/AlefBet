import { expect } from '@playwright/test';
import { test } from './network-server.js';

for (const game of ['fraction-picture', 'fraction-whole', 'fraction-compare']) {
  test(`${game}: visual answers, retry, completion, replay and offline`, async ({ page, context, isMobile, browserName, network }) => {
    const activate = locator => isMobile ? locator.tap() : locator.click();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${network.url}/games/${game}/`);
    for (let round = 0; round < 6; round++) {
      const bars = page.locator('.fraction-bar');
      await expect(bars.first()).toBeVisible();
      const values = await bars.evaluateAll(els => els.map(el => [Number(el.dataset.n), Number(el.dataset.d)]));
      const [n, d] = values[0];
      let answer = `${game === 'fraction-whole' ? d - n : n}/${d}`;
      if (game === 'fraction-compare') {
        const [m, e] = values[1];
        answer = n * e === m * d ? 'equal' : n * e > m * d ? 'top' : 'bottom';
        const widths = await bars.evaluateAll(els => els.map(el => el.getBoundingClientRect().width));
        expect(widths[0]).toBe(widths[1]);
      }
      if (round === 0) {
        const wrong = page.locator(`.option-card:not([data-id="${answer}"])`).first();
        await activate(wrong);
        await expect(page.locator('.feedback-message')).not.toBeEmpty();
        await expect(wrong).toBeEnabled();
        await activate(wrong);
        await expect(page.locator(`.option-card[data-id="${answer}"]`)).toHaveClass(/--hint/);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      }
      const correct = page.locator(`.option-card[data-id="${answer}"]`);
      if (round === 1) { await correct.focus(); await page.keyboard.press('Enter'); }
      else await activate(correct);
      await expect(page.locator('.option-card:disabled')).not.toHaveCount(0);
      if (round < 5) await expect(page.locator('.option-card:enabled').first()).toBeVisible();
    }
    await expect(page.locator('.completion-screen')).toBeVisible();
    await activate(page.locator('.completion-screen__replay'));
    await expect(page.locator('.fraction-bar').first()).toBeVisible();
    await page.evaluate(async () => { await navigator.serviceWorker.ready; });
    network.disconnect();
    if (browserName !== 'webkit') await context.setOffline(true);
    await page.reload();
    await expect(page.locator('.fraction-bar').first()).toBeVisible();
    await expect(page.locator('.option-card').first()).toBeEnabled();
    expect(errors).toEqual([]);
  });
}
