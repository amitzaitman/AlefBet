import { existsSync } from 'node:fs';
import { test, expect, expectTouchTargets } from './network-server.js';

/** The pilot is its own Svelte build; start.js serves it from the build folder. */
const PILOT = '/math-pilot/dist/';
const HOME_TITLE = 'מִשְׂחֲקֵי חֶשְׁבּוֹן';

test.beforeAll(() => {
  expect(existsSync(new URL('../math-pilot/dist/index.html', import.meta.url)), 'Build the pilot first: npm run build:pilot').toBe(true);
});

const fitsWidth = page => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);

test('the math home opens every pilot game, and nothing loads from outside the pilot', async ({ page, activate }) => {
  const outside = [];
  page.on('request', request => {
    const url = new URL(request.url());
    if (url.protocol.startsWith('http') && !url.pathname.startsWith(PILOT)) outside.push(url.pathname);
  });
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto(PILOT);
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  const heading = page.getByRole('heading', { level: 1 });
  await expect(heading).toHaveText(HOME_TITLE);
  const cards = page.locator('.game-card');
  await expectTouchTargets(cards);
  const titles = await page.locator('.game-card__title').allTextContents();
  expect(titles).toContain('מַשְׁלִימִים לְעֶשֶׂר');
  for (const title of titles) {
    await activate(cards.filter({ hasText: title }));
    await expect(heading).toHaveText(title);
    await expect(page).toHaveTitle(title);
    await expectTouchTargets(page.getByRole('link', { name: HOME_TITLE }));
    expect(await fitsWidth(page), title).toBe(true);
    await activate(page.getByRole('link', { name: HOME_TITLE }));
    await expect(heading).toHaveText(HOME_TITLE);
  }
  expect(outside).toEqual([]);
});

test('make-ten: retry, completion and a round after replay', async ({ page, activate }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  // The page clock skips the 800 ms pause after a correct answer.
  await page.clock.install();
  await page.goto(`${PILOT}#/make-ten`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('מַשְׁלִימִים לְעֶשֶׂר');
  const equation = page.locator('.ten-equation');
  const progress = page.getByRole('progressbar');
  const status = page.getByRole('status');

  // Rows of five fill from the left, and the exercise reads left to right inside the RTL page.
  const cells = page.locator('.ten-cell');
  await expect(cells).toHaveCount(10);
  const [first, fifth, sixth] = await Promise.all([0, 4, 5].map(n => cells.nth(n).boundingBox()));
  expect(first.x).toBeLessThan(fifth.x);
  expect(sixth.y).toBeGreaterThan(first.y);
  expect(Math.abs(sixth.x - first.x)).toBeLessThan(1);
  expect(await equation.evaluate(el => getComputedStyle(el).direction)).toBe('ltr');
  await expectTouchTargets(page.locator('.choice'));

  /** Answers the round on screen, after one wrong card when `retry` is set. */
  async function solveRound(retry = false) {
    const given = Number((await equation.innerText()).split(' ')[0]);
    const answer = 10 - given;
    await expect(page.locator('.ten-cell--given')).toHaveCount(given);
    if (retry) {
      await activate(page.locator(`.choice:not([data-value="${answer}"])`).first());
      // Help instead of a verdict: back to the picture, and the round stays open.
      await expect(status).toHaveText('סִפְרוּ אֶת הַמִּשְׁבָּצוֹת הָרֵיקוֹת');
      await expect(equation).toHaveText(`${given} + ? = 10`);
      await expect(page.locator('.choice:enabled')).toHaveCount(4);
    }
    await activate(page.locator(`.choice[data-value="${answer}"]`));
    // The exercise is completed on the picture: the empty cells fill in.
    await expect(equation).toHaveText(`${given} + ${answer} = 10`);
    await expect(page.locator('.ten-cell__added')).toHaveCount(answer);
    // A completed answer is locked until the next round is built.
    await expect(page.locator('.choice:enabled')).toHaveCount(0);
  }

  for (let round = 1; round <= 6; round++) {
    await solveRound(round === 1);
    await expect(progress).toHaveAttribute('aria-valuenow', String(round));
    await expect(progress).toContainText(`${round} / 6`);
    await page.clock.runFor(800);
  }
  await expect(page.getByRole('heading', { name: 'כָּל הַכָּבוֹד!' })).toBeVisible();
  await expect(page.getByText('הִשְׁלַמְתֶּם 6 מְשִׂימוֹת!')).toBeVisible();
  await expectTouchTargets(page.locator('.completion .button'));

  await activate(page.getByRole('button', { name: 'שַׂחֲקוּ שׁוּב' }));
  await expect(progress).toHaveAttribute('aria-valuenow', '0');
  await solveRound();
  await page.clock.runFor(800);
  await expect(progress).toHaveAttribute('aria-valuenow', '1');
  await expect(page.locator('.choice:enabled')).toHaveCount(4);
  await expect(equation).toContainText('?');
  expect(await fitsWidth(page)).toBe(true);
  expect(errors).toEqual([]);
});
