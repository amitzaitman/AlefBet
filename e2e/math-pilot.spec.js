import { existsSync } from 'node:fs';
import { test, expect, expectTouchTargets } from './network-server.js';
import { pauseAfter, storyMs } from '../math-pilot/src/games/balloon-stories/logic.js';

/** The pilot is its own Svelte build; start.js serves it from the build folder. */
const PILOT = '/math-pilot/dist/';
const HOME_TITLE = 'מִשְׂחֲקֵי חֶשְׁבּוֹן';

test.beforeAll(() => {
  expect(existsSync(new URL('../math-pilot/dist/index.html', import.meta.url)), 'Build the pilot first: npm run build:pilot').toBe(true);
});

const fitsWidth = page => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);

test('the math home opens every pilot game, and nothing loads from outside the pilot', async ({ page, activate }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
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
  expect(titles).toEqual(expect.arrayContaining(['סִפּוּרֵי בָּלוֹנִים', 'מַשְׁלִימִים לְעֶשֶׂר']));
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
  expect(errors).toEqual([]);
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

/**
 * Every take, add, compare and missing round within ten. The story waits for the
 * child to read, so the spec skips as long as the slowest round takes at the game's
 * own pace: to the question, and from a correct answer to the next round.
 */
const PICTURE_ROUNDS = ['take', 'add', 'compare', 'missing']
  .flatMap(kind => Array.from({ length: 100 }, (_, n) => ({ kind, a: 1 + Math.floor(n / 10), b: 1 + (n % 10), look: 'balloons' })))
  .filter(({ kind, a, b }) => (kind === 'add' ? a + b <= 10 : kind === 'missing' ? a < b : b < a));
const STORY_MS = Math.max(...PICTURE_ROUNDS.map(storyMs));
const PAUSE_MS = Math.max(...[...PICTURE_ROUNDS, { kind: 'match', op: '+', a: 5, b: 3, look: 'dots' }].map(pauseAfter));

/** Reads a balloon-stories question: a − b = ?, a + b = ? or a + ? = b. */
async function solveBalloonExercise(equation) {
  const [x, op, y, , z] = (await equation.innerText()).trim().split(/\s+/);
  if (y === '?') return Number(z) - Number(x);
  return op === '+' ? Number(x) + Number(y) : Number(x) - Number(y);
}

test('balloon-stories: the story sentence by sentence, the hint ladder, exercise to story, completion and replay', async ({ page, activate }) => {
  test.setTimeout(60_000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  // The story's pacing is fixed waits for reading (STORY_MS, PAUSE_MS), counting takes
  // 700 ms a balloon. The page clock skips them.
  await page.clock.install();
  const skip = ms => page.clock.runFor(ms);
  await page.goto(`${PILOT}#/balloon-stories`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('סִפּוּרֵי בָּלוֹנִים');
  const line = page.locator('.line');
  const now = page.locator('.line--now');
  const choice = page.locator('.choice');
  const equation = page.locator('.equation');
  const solved = page.locator('.solved');
  const status = page.getByRole('status');
  const progress = page.getByRole('progressbar');
  const again = page.getByRole('button', { name: 'הַסִּפּוּר עוֹד פַּעַם' });
  const numbers = async () => (await equation.innerText()).trim().split(/\s+/);

  // No audio, so no tap to start: the first sentence is there at once, its number is the
  // start of the exercise, and the choices wait for the question.
  await expect(line).toHaveCount(1);
  await expect(line.first()).toHaveText(/^לְנוֹעָה יֵשׁ \d+ בָּלוֹנִים\.$/);
  const opening = await line.first().innerText();
  await expect(equation).toHaveText(/^\d+$/);
  await expect(choice.first()).toBeDisabled();
  await skip(STORY_MS);
  await expect(line).toHaveCount(3);
  await expect(choice.first()).toBeEnabled();
  await expect(equation).toHaveAttribute('dir', 'ltr');
  await expect(equation).toContainText('= ?');
  await expectTouchTargets(choice);
  await expectTouchTargets(again);

  // Rows of five from the left, and the popped balloons stay on the picture as outlines.
  const [a, , b] = await numbers();
  const balloons = page.locator('.scene .balloon');
  await expect(balloons).toHaveCount(Number(a));
  await expect(page.locator('.balloon[data-state="popped"]')).toHaveCount(Number(b));
  const [first, second, sixth] = await Promise.all([0, 1, 5].map(n => (n < Number(a) ? balloons.nth(n).boundingBox() : null)));
  expect(first.x).toBeLessThan(second.x);
  if (sixth) expect(sixth.y).toBeGreaterThan(first.y);
  if (sixth) expect(Math.abs(sixth.x - first.x)).toBeLessThan(1);

  // The help goes back to the picture: the story again, then counting on it, then the answer.
  const answer = await solveBalloonExercise(equation);
  const correct = page.locator(`.choice[data-value="${answer}"]`);
  const wrong = page.locator(`.choice:enabled:not([data-value="${answer}"])`);
  await activate(wrong.first());
  await expect(status).toHaveText('בּוֹאוּ נִקְרָא שׁוּב אֶת הַסִּפּוּר');
  await expect(page.locator('.pick--tried')).toBeDisabled();
  // Read again: the whole story stays on the screen, the question too; the highlight starts over.
  await expect(line).toHaveCount(3);
  await expect(now).toHaveText(opening);
  await expect(correct).toBeEnabled();
  await activate(wrong.first());
  await expect(status).toHaveText('סִפְרוּ אֶת הַבָּלוֹנִים שֶׁנִּשְׁאֲרוּ');
  await expect(line).toHaveCount(3);
  await skip(700 * answer);
  const counted = page.locator('.balloon--counted');
  await expect(counted).toHaveCount(answer);
  await expect(counted.last()).toHaveText(String(answer));
  await activate(wrong.first());
  await expect(status).toHaveText('נַסּוּ אֶת הַמִּסְפָּר הַמְּסֻמָּן');
  await expect(correct).toHaveClass(/pick--hint/);
  await activate(correct);
  // The answer takes the place of '?', the story closes with it, and the round is locked.
  await expect(solved).toHaveText(String(answer));
  await expect(page.locator('.line--result')).toContainText('לְנוֹעָה');
  await expect(page.locator('.choice:enabled')).toHaveCount(0);
  await expect(again).toBeDisabled();
  await expect(progress).toHaveAttribute('aria-valuenow', '1');

  for (let round = 2; round <= 9; round++) {
    await skip(PAUSE_MS);
    await expect(solved).toHaveCount(0);
    let waiting = null;
    if (round === 4) {
      // The comparing rounds are the widest pictures; they still fit a small phone.
      await page.setViewportSize({ width: 320, height: 640 });
      // While the story is told the choices wait, and the question opens them where they are.
      await expect(choice.first()).toBeDisabled();
      waiting = await choice.first().boundingBox();
    }
    await skip(STORY_MS);
    if (round <= 6) {
      await expect(choice.first()).toBeEnabled();
      if (waiting) expect(await choice.first().boundingBox()).toEqual(waiting);
      // Each of the first two stages ends with plain circles instead of drawn balloons.
      await expect(page.locator('.scene--dots')).toHaveCount(round === 3 || round === 6 ? 1 : 0);
      const [, , y] = await numbers();
      if (round === 2) {
        await expect(page.locator('.balloon--added[data-state="shown"]')).toHaveCount(Number(y));
        // The story can be read again at any time, and the choices stay open meanwhile.
        await activate(again);
        await expect(line).toHaveCount(3);
        await expect(now).toHaveText(/^לְנוֹעָה יֵשׁ \d+ בָּלוֹנִים\.$/);
        await expect(choice.first()).toBeEnabled();
        await skip(STORY_MS);
        await expect(now).toContainText('כַּמָּה');
      }
      if (round === 4) {
        await expect(page.locator('.pair--matched')).toHaveCount(Number(y));
        await expectTouchTargets(choice);
      }
      if (round === 5) await expect(page.locator('.balloon[data-state="empty"]')).toHaveCount(await solveBalloonExercise(equation));
      expect(await fitsWidth(page), `round ${round}`).toBe(true);
      const value = await solveBalloonExercise(equation);
      await activate(page.locator(`.choice[data-value="${value}"]`));
      await expect(solved).toHaveText(String(value));
      if (round === 5) {
        // The full exercise on the picture: the empty places fill in, in the missing part's colour.
        await expect(page.locator('.balloon--added[data-state="shown"]')).toHaveCount(value);
        await expect(page.locator('.balloon[data-state="empty"]')).toHaveCount(0);
        await expect(solved).toHaveClass(/solved--part/);
      }
    } else {
      // From exercise to story: pick the picture that matches a op b.
      const cards = page.locator('.card');
      await expect(cards).toHaveCount(3);
      await expect(cards.first()).toBeEnabled();
      await expectTouchTargets(cards);
      expect(await fitsWidth(page)).toBe(true);
      const [x, op, y] = await numbers();
      const sign = op === '+' ? '+' : '-';
      const right = page.locator(`.card[data-op="${sign}"][data-a="${x}"][data-b="${y}"]`);
      if (round === 7) {
        await activate(page.locator(`.card[data-op="${sign === '+' ? '-' : '+'}"]`));
        await expect(status).toHaveText('סִפְרוּ אֶת הַבָּלוֹנִים בְּכָל סִפּוּר');
        await expect(page.locator('.card.pick--tried')).toBeDisabled();
        await activate(page.locator(`.card:enabled:not([data-b="${y}"])`));
        await expect(status).toHaveText('נַסּוּ אֶת הַסִּפּוּר הַמְּסֻמָּן');
        await expect(right).toHaveClass(/pick--hint/);
      }
      await activate(right);
      await expect(solved).toHaveText(String(sign === '+' ? Number(x) + Number(y) : Number(x) - Number(y)));
      await expect(equation).toContainText('=');
    }
    await expect(progress).toHaveAttribute('aria-valuenow', String(round));
  }
  await skip(PAUSE_MS);
  await expect(page.getByRole('heading', { name: 'כָּל הַכָּבוֹד!' })).toBeVisible();
  await expect(page.getByText('הִשְׁלַמְתֶּם 9 מְשִׂימוֹת!')).toBeVisible();

  // Replay starts a new story by itself.
  await activate(page.getByRole('button', { name: 'שַׂחֲקוּ שׁוּב' }));
  await expect(progress).toHaveAttribute('aria-valuenow', '0');
  await expect(line).toHaveCount(1);
  await skip(STORY_MS);
  const value = await solveBalloonExercise(equation);
  await activate(page.locator(`.choice[data-value="${value}"]`));
  await expect(solved).toHaveText(String(value));
  await skip(PAUSE_MS);
  await expect(progress).toHaveAttribute('aria-valuenow', '1');
  await expect(solved).toHaveCount(0);
  await skip(STORY_MS);
  await expect(choice.first()).toBeEnabled();
  expect(await fitsWidth(page)).toBe(true);
  expect(errors).toEqual([]);
});
