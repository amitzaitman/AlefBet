import { expect } from '@playwright/test';
import { test } from './network-server.js';

for (const game of ['fraction-picture', 'fraction-whole', 'fraction-compare']) {
  test(`${game}: visual answers, retry, completion, replay and offline`, async ({ page, isMobile, network }) => {
    const activate = locator => isMobile ? locator.tap() : locator.click();
    const painting = game !== 'fraction-compare';
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${network.url}/games/${game}/`);
    for (let round = 0; round < 6; round++) {
      const bars = page.locator('.fraction-bar');
      await expect(bars.first()).toBeVisible();
      const values = await bars.evaluateAll(els => els.map(el => [Number(el.dataset.n), Number(el.dataset.d)]));
      const [n, d] = values[0];
      if (painting) {
        expect(d).toBe([2, 4, 4, 4, 3, 3][round]);
        const cells = page.locator('.fraction-bar button');
        const check = page.getByRole('button', { name: 'בדיקת התשובה', exact: true });
        const goal = game === 'fraction-whole' ? d - n : n;
        if (round === 0) {
          await activate(check);
          const hint = page.locator('.fraction-guidance');
          await expect(hint).not.toBeEmpty();
          const firstHint = await hint.textContent();
          await activate(check);
          await expect(hint).not.toHaveText(firstHint);
          await activate(check);
          await expect(hint).toContainText('צָרִיךְ');
          // Touch toggles work in both directions, without submitting a round.
          await activate(cells.first());
          await expect(cells.first()).toHaveAttribute('aria-pressed', 'true');
          await activate(cells.first());
          await expect(cells.first()).toHaveAttribute('aria-pressed', 'false');
          if (game === 'fraction-picture') {
            for (const cell of await cells.all()) await activate(cell);
            await activate(check); // Over-painting must not advance.
            await expect(page.locator('.fraction-status')).toContainText(` ${d} `);
          }
          await activate(page.locator('.fraction-reset'));
          await expect(page.locator('.fraction-bar [aria-pressed="true"]')).toHaveCount(0);
          await expect(page.locator('.fraction-cell--given')).toHaveCount(game === 'fraction-whole' ? n : 0);
          for (const cell of await cells.all()) {
            const box = await cell.boundingBox();
            expect(box.width).toBeGreaterThanOrEqual(64);
            expect(box.height).toBeGreaterThanOrEqual(64);
          }
          expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        }
        for (let i = 0; i < goal; i++) {
          // Choose from the end too: any subset of equal parts is a valid answer.
          const cell = cells.nth(await cells.count() - 1 - i);
          if (round === 1 && i === 0) { await cell.focus(); await page.keyboard.press('Space'); }
          else await activate(cell);
        }
        await activate(check);
        await expect(check).toBeDisabled();
        await expect(cells.first()).toBeDisabled();
        await expect(page.locator('.fraction-reset')).toBeDisabled();
        if (game === 'fraction-whole') await expect(page.locator('.fraction-equation .fraction-label')).toHaveCount(2);
        if (round < 5) await expect(page.locator('.fraction-check:enabled')).toBeVisible();
      } else {
        const [m, e] = values[1];
        const answer = n * e === m * d ? 'equal' : n * e > m * d ? 'top' : 'bottom';
        const widths = await bars.evaluateAll(els => els.map(el => el.getBoundingClientRect().width));
        expect(widths[0]).toBe(widths[1]);
        const correct = page.locator(`.option-card[data-id="${answer}"]`);
        if (round === 0) {
          const wrong = page.locator(`.option-card:not([data-id="${answer}"])`).first();
          await activate(wrong);
          await expect(correct).not.toHaveClass(/--hint/);
          await activate(wrong);
          await expect(correct).not.toHaveClass(/--hint/);
          await activate(wrong);
          await expect(correct).toHaveClass(/--hint/);
        }
        await activate(correct);
        await expect(correct).toBeDisabled();
        if (round === 5) {
          expect(answer).toBe('equal');
          await expect(page.locator('.feedback-message')).toContainText('אוֹתָהּ');
        } else await expect(page.locator('.option-card:enabled').first()).toBeVisible();
      }
    }
    await expect(page.locator('.completion-screen')).toBeVisible();
    await activate(page.locator('.completion-screen__replay'));
    await expect(page.locator('.fraction-bar').first()).toBeVisible();
    if (painting) await expect(page.locator('.fraction-bar [aria-pressed="true"]')).toHaveCount(0);
    await page.evaluate(async () => { await navigator.serviceWorker.ready; });
    await network.offline(page);
    await page.reload();
    await expect(page.locator('.fraction-bar').first()).toBeVisible();
    await expect(page.locator(painting ? '.fraction-check' : '.option-card').first()).toBeEnabled();
    expect(errors).toEqual([]);
  });
}
