import { test, expect, noVoice, expectTouchTargets } from './network-server.js';

for (const game of ['make-ten', 'number-line']) {
  test(`${game}: retry, completion, replay and offline`, async ({ page, activate, network }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    // The page clock skips the fixed 800 ms round transition; it still flows in real time otherwise.
    await page.clock.install();
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
      // A completed answer is locked until the following round is built.
      await expect(page.locator(game === 'make-ten' ? '.option-card:disabled' : '.line-check:disabled')).not.toHaveCount(0);
      await page.clock.runFor(800);
      if (i < 5) await expect(page.locator(game === 'make-ten' ? '.option-card:enabled' : '.line-check:enabled').first()).toBeVisible();
    }
    await expect(page.locator('.completion-screen')).toBeVisible();
    await activate(page.locator('.completion-screen__replay'));
    await expect(page.locator('.game-title')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await network.reloadOffline(page);
    await expect(page.locator(game === 'make-ten' ? '.ten-frame' : '.number-line')).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test('equations and the number line read left to right inside the RTL page', async ({ page, activate, network }) => {
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
  for (const [game, selector] of [['make-ten', '.ten-equation'], ['number-line', '.line-equation'], ['fraction-whole', '.fraction-equation'], ['long-exercise', '.chain-current']]) {
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
  // A wrapped Hebrew instruction stays centered like the short lines around it.
  await page.setViewportSize({ width: 320, height: 640 });
  const lastLineGaps = await page.locator('.game-body h2').evaluate(el => {
    const range = document.createRange();
    range.selectNodeContents(el);
    const rects = [...range.getClientRects()];
    const top = Math.max(...rects.map(r => r.top));
    const line = rects.filter(r => Math.abs(r.top - top) < 4);
    const box = el.getBoundingClientRect();
    return { lines: new Set(rects.map(r => Math.round(r.top))).size, left: Math.min(...line.map(r => r.left)) - box.left, right: box.right - Math.max(...line.map(r => r.right)) };
  });
  expect(lastLineGaps.lines).toBeGreaterThan(1);
  expect(Math.abs(lastLineGaps.left - lastLineGaps.right)).toBeLessThan(6);
});

test('long-exercise: solve part by part, hints, keyboard, completion, replay and offline', async ({ page, activate, network }) => {
  test.setTimeout(60_000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  // The page clock skips the fixed pauses: 700 ms on each merged part and the 1600 ms round transition.
  await page.clock.install();
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
        await expectTouchTargets(page.locator('.chain-choice'));
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
        await page.clock.runFor(700);
      }
    }
    await expect(page.locator('.chain-original .chain-answer--solved')).toHaveText(String(last));
    await expect(page.locator('.chain-current .chain-term')).toHaveText(String(last));
    await expect(page.locator('.chain-choice')).toHaveCount(0);
    await expect(page.locator('.chain-help')).toBeDisabled();
    await page.clock.runFor(1600);
  }
  await expect(page.locator('.completion-screen')).toBeVisible();
  await activate(page.locator('.completion-screen__replay'));
  await expect(part).toBeVisible();
  await expect(trail).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await network.reloadOffline(page);
  await expect(part).toBeVisible();
  await expect(page.locator('.chain-choice').first()).toBeEnabled();
  expect(errors).toEqual([]);
});

/** Reads a balloon-stories question: a − b = ?, a + b = ? or a + ? = b. */
async function solveBalloonExercise(equation) {
  const [x, op, y, , z] = (await equation.innerText()).trim().split(/\s+/);
  if (y === '?') return Number(z) - Number(x);
  return op === '+' ? Number(x) + Number(y) : Number(x) - Number(y);
}

test('balloon-stories: narrated story, hints, exercise to story, completion, replay and offline', async ({ page, activate, network }) => {
  test.setTimeout(60_000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  // A recording voice that answers at once, so the story's sentences can be checked.
  await page.addInitScript(() => {
    window.__spoken = [];
    window.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
    const voice = { name: 'Carmit', lang: 'he-IL', localService: true };
    const synth = {
      getVoices: () => [voice],
      speak(utterance) { if (utterance.text) window.__spoken.push(utterance.text); setTimeout(() => utterance.onend?.(), 20); },
      cancel() {}, addEventListener() {}, removeEventListener() {},
    };
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, get: () => synth });
  });
  // The story's pacing is fixed waits: a beat lasts at least 1200 ms, a change step staggers
  // up to 6 x 280 ms, counting aloud takes 700 ms per balloon and the round transition 2600 ms.
  // The page clock skips them; it still flows in real time otherwise. The no-voice test below
  // plays its story in real time.
  await page.clock.install();
  const skip = ms => page.clock.runFor(ms);
  await page.goto(`${network.url}/games/balloon-stories/`);
  const choice = page.locator('.bs-choice');
  const equation = page.locator('.bs-equation');
  const feedback = page.locator('.feedback-message');
  const solved = page.locator('.bs-solved');
  const fits = () => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
  const solve = () => solveBalloonExercise(equation);
  await expect(page.locator('.bs-scene')).toBeVisible();
  // Speech needs a first tap on phones, so the first story waits for one with its answers locked.
  const start = page.locator('.bs-start');
  if (await start.count()) {
    await expect(choice.first()).toBeDisabled();
    await activate(start);
    await expect(start).toHaveCount(0);
  }
  await skip(3000);
  await expect(choice.first()).toBeEnabled();
  await expect(page.locator('.bs-line')).toHaveCount(3);
  await expect(equation).toHaveAttribute('dir', 'ltr');
  await expect(equation).toContainText('= ?');
  // Shown with digits, spoken with number words.
  await expect(page.locator('.bs-line').first()).toHaveText(/^לְנוֹעָה יֵשׁ \d+ בָּלוֹנִים\.$/);
  expect((await page.evaluate(() => window.__spoken))[0]).toMatch(/^לְנוֹעָה יֵשׁ \D+ בָּלוֹנִים\.$/);
  await expectTouchTargets(choice);
  const answer = await solve();
  const correct = page.locator(`.bs-choice[data-value="${answer}"]`);
  const wrong = page.locator(`.bs-choice:enabled:not([data-value="${answer}"])`);
  // The help goes back to the picture: the story again, then counting aloud, then the answer.
  await activate(wrong.first());
  await expect(feedback).toContainText('הַסִּפּוּר');
  await expect(page.locator('.bs-pick--tried')).toBeDisabled();
  await activate(wrong.first());
  await expect(feedback).toContainText('שֶׁנִּשְׁאֲרוּ');
  await skip(300 + 700 * answer);
  await expect(page.locator('.bs-balloon--counted')).toHaveCount(answer);
  await expect(page.locator('.bs-balloon--counted').last()).toHaveText(String(answer));
  await activate(wrong.first());
  await expect(correct).toHaveClass(/bs-pick--hint/);
  await activate(correct);
  await expect(solved).toHaveText(String(answer));
  await expect(page.locator('.bs-line--result')).toBeVisible();

  for (let round = 2; round <= 9; round++) {
    await skip(6500);
    await expect(solved).toHaveCount(0, { timeout: 10_000 });
    // The comparing rounds are the widest pictures; they still fit a small phone.
    if (round === 4) await page.setViewportSize({ width: 320, height: 640 });
    if (round <= 6) {
      await expect(choice.first()).toBeEnabled({ timeout: 10_000 });
      // Each of the first two stages ends with plain circles instead of drawn balloons.
      await expect(page.locator('.bs-scene--dots')).toHaveCount(round === 3 || round === 6 ? 1 : 0);
      expect(await fits()).toBe(true);
      const value = await solve();
      await activate(page.locator(`.bs-choice[data-value="${value}"]`));
      await expect(solved).toHaveText(String(value));
    } else {
      // From exercise to story: pick the picture that matches a op b.
      const cards = page.locator('.bs-card');
      await expect(cards).toHaveCount(3);
      await expect(cards.first()).toBeEnabled();
      const [a, op, b] = (await equation.innerText()).trim().split(/\s+/);
      const sign = op === '+' ? '+' : '-';
      if (round === 7) {
        await activate(page.locator(`.bs-card[data-op="${sign === '+' ? '-' : '+'}"]`));
        await expect(feedback).toContainText('בְּכָל סִפּוּר');
        await expect(page.locator('.bs-card.bs-pick--tried')).toBeDisabled();
      }
      await activate(page.locator(`.bs-card[data-op="${sign}"][data-a="${a}"][data-b="${b}"]`));
      await expect(solved).toHaveText(String(sign === '+' ? Number(a) + Number(b) : Number(a) - Number(b)));
      await expect.poll(() => page.evaluate(() => window.__spoken.at(-1))).toContain('שָׁוֶה');
    }
  }
  await skip(3000);
  await expect(page.locator('.completion-screen')).toBeVisible({ timeout: 10_000 });
  await activate(page.locator('.completion-screen__replay'));
  // After the first tap the replayed story starts by itself.
  await expect(page.locator('.bs-scene')).toBeVisible();
  await skip(3000);
  await expect(start).toHaveCount(0);
  await expect(choice.first()).toBeEnabled({ timeout: 10_000 });
  expect(await fits()).toBe(true);
  await network.reloadOffline(page);
  await expect(page.locator('.bs-scene')).toBeVisible();
  await expect(choice).toHaveCount(4);
  expect(errors).toEqual([]);
});

test('balloon-stories: without a voice the story still plays and can be answered', async ({ page, activate, network }) => {
  await noVoice(page);
  await page.goto(`${network.url}/games/balloon-stories/`);
  await expect(page.locator('.bs-scene')).toBeVisible();
  const start = page.locator('.bs-start');
  if (await start.count()) await activate(start);
  await expect(page.locator('.bs-choice').first()).toBeEnabled();
  await expect(page.locator('#alefbet-audio-status-banner')).toContainText('הַקּוֹל אֵינוֹ זָמִין');
  const answer = await solveBalloonExercise(page.locator('.bs-equation'));
  await activate(page.locator(`.bs-choice[data-value="${answer}"]`));
  await expect(page.locator('.bs-line--result')).toBeVisible();
  await expect(page.locator('.progress-bar__label')).toContainText('1');
});
