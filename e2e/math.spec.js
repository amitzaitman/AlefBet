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
  const choice = page.locator('.story-choice');
  const equation = page.locator('.story-equation');
  const feedback = page.locator('.feedback-message');
  const solved = page.locator('.story-solved');
  const fits = () => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
  const solve = () => solveBalloonExercise(equation);
  await expect(page.locator('.bs-scene')).toBeVisible();
  // Speech needs a first tap on phones, so the first story waits for one with its answers locked.
  const start = page.locator('.story-start');
  if (await start.count()) {
    await expect(choice.first()).toBeDisabled();
    await activate(start);
    await expect(start).toHaveCount(0);
  }
  await skip(3000);
  await expect(choice.first()).toBeEnabled();
  await expect(page.locator('.story-line')).toHaveCount(3);
  await expect(equation).toHaveAttribute('dir', 'ltr');
  await expect(equation).toContainText('= ?');
  // Shown with digits, spoken with number words.
  await expect(page.locator('.story-line').first()).toHaveText(/^לְנוֹעָה יֵשׁ \d+ בָּלוֹנִים\.$/);
  expect((await page.evaluate(() => window.__spoken))[0]).toMatch(/^לְנוֹעָה יֵשׁ \D+ בָּלוֹנִים\.$/);
  await expectTouchTargets(choice);
  const answer = await solve();
  const correct = page.locator(`.story-choice[data-value="${answer}"]`);
  const wrong = page.locator(`.story-choice:enabled:not([data-value="${answer}"])`);
  // The help goes back to the picture: the story again, then counting aloud, then the answer.
  await activate(wrong.first());
  await expect(feedback).toContainText('הַסִּפּוּר');
  await expect(page.locator('.story-pick--tried')).toBeDisabled();
  await activate(wrong.first());
  await expect(feedback).toContainText('שֶׁנִּשְׁאֲרוּ');
  await skip(300 + 700 * answer);
  await expect(page.locator('.bs-balloon--counted')).toHaveCount(answer);
  await expect(page.locator('.bs-balloon--counted').last()).toHaveText(String(answer));
  await activate(wrong.first());
  await expect(correct).toHaveClass(/story-pick--hint/);
  await activate(correct);
  await expect(solved).toHaveText(String(answer));
  await expect(page.locator('.story-line--result')).toBeVisible();

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
      await activate(page.locator(`.story-choice[data-value="${value}"]`));
      await expect(solved).toHaveText(String(value));
    } else {
      // From exercise to story: pick the picture that matches a op b.
      const cards = page.locator('.story-card');
      await expect(cards).toHaveCount(3);
      await expect(cards.first()).toBeEnabled();
      const [a, op, b] = (await equation.innerText()).trim().split(/\s+/);
      const sign = op === '+' ? '+' : '-';
      if (round === 7) {
        await activate(page.locator(`.story-card[data-op="${sign === '+' ? '-' : '+'}"]`));
        await expect(feedback).toContainText('בְּכָל סִפּוּר');
        await expect(page.locator('.story-card.story-pick--tried')).toBeDisabled();
      }
      await activate(page.locator(`.story-card[data-op="${sign}"][data-a="${a}"][data-b="${b}"]`));
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
  const start = page.locator('.story-start');
  if (await start.count()) await activate(start);
  await expect(page.locator('.story-choice').first()).toBeEnabled();
  await expect(page.locator('#alefbet-audio-status-banner')).toContainText('הַקּוֹל אֵינוֹ זָמִין');
  const answer = await solveBalloonExercise(page.locator('.story-equation'));
  await activate(page.locator(`.story-choice[data-value="${answer}"]`));
  await expect(page.locator('.story-line--result')).toBeVisible();
  await expect(page.locator('.progress-bar__label')).toContainText('1');
});

test('apple-basket: count by touch, put a number in the basket, help, completion, replay and offline', async ({ page, activate, network }) => {
  test.setTimeout(60_000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  // Without a voice every sentence takes its fixed 1200 ms and every counted step 700 ms;
  // the page clock skips those and the 2400 ms round transition.
  await noVoice(page);
  await page.clock.install();
  const skip = ms => page.clock.runFor(ms);
  await page.goto(`${network.url}/games/apple-basket/`);
  const choice = page.locator('.story-choice');
  const onTree = page.locator('.ab-tree .ab-apple[data-state="shown"]');
  const inBasket = page.locator('.ab-basket .ab-apple[data-state="shown"]');
  const counted = page.locator('.ab-apple--counted');
  const solved = page.locator('.story-solved');
  const feedback = page.locator('.feedback-message');
  const done = page.locator('.ab-done');
  const fits = () => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
  const start = page.locator('.story-start');
  await expect(page.locator('.ab-tree')).toBeVisible();
  if (await start.count()) await activate(start);
  await skip(3000);
  await expect(choice.first()).toBeEnabled();

  // How many: each touch counts one apple, once.
  const n = await onTree.count();
  expect(n).toBeGreaterThanOrEqual(2);
  expect(n).toBeLessThanOrEqual(5);
  await expectTouchTargets(onTree);
  await expectTouchTargets(choice);
  await activate(onTree.nth(1));
  await activate(onTree.nth(0));
  await activate(onTree.nth(1));
  await expect(counted).toHaveCount(2);
  await expect(onTree.nth(1)).toHaveText('1');
  await expect(onTree.nth(0)).toHaveText('2');
  // A wrong number shows what it says on the tree, then the help counts together.
  const wrong = n + 1;
  await activate(page.locator(`.story-choice[data-value="${wrong}"]`));
  await expect(page.locator('.ab-apple--chosen')).toHaveCount(n);
  await expect(page.locator('.ab-tree .ab-apple[data-state="ghost"]')).toHaveCount(1);
  await expect(page.locator('.story-pick--tried')).toBeDisabled();
  await skip(1300);
  await expect(feedback).toContainText('נִסְפֹּר יַחַד');
  await skip(700 * n + 1300);
  await expect(counted).toHaveCount(n);
  await expect(page.locator('.ab-apple--total')).toHaveCount(n);
  await expect(onTree.nth(n - 1)).toHaveText(String(n));
  await activate(page.locator(`.story-choice[data-value="${n}"]`));
  await expect(solved).toHaveText(String(n));
  await expect(page.locator('.story-line--result')).toContainText(`${n} תַּפּוּחִים`);

  /** Reads the number to put in the basket from the instruction. */
  const target = async () => Number((await page.locator('.ab-build .story-line').first().innerText()).match(/\d+/)[0]);
  /** Moves apples until the basket holds count. */
  const fill = async count => {
    while (await inBasket.count() < count) await activate(onTree.first());
    while (await inBasket.count() > count) await activate(inBasket.last());
  };
  /** Counting the basket aloud: 700 ms a step, by the row of five past five, then the total. */
  const countTime = count => 700 * (count > 5 ? count - 4 : count) + 1300;

  for (let round = 2; round <= 6; round++) {
    await skip(2600);
    await expect(solved).toHaveCount(0);
    const building = page.locator('.ab-build');
    if (round === 2 || round === 5 || (round === 6 && await building.count())) {
      await expect(building).toBeVisible();
      const goal = await target();
      if (round === 2) {
        // One too many: the count ends with the total, then says what is needed.
        await fill(goal + 1);
        await expect(onTree).toHaveCount(10 - goal - 1);
        await expect(page.locator('.ab-tree .ab-apple[data-state="taken"]')).toHaveCount(goal + 1);
        await expectTouchTargets(done);
        await activate(done);
        await expect(done).toBeDisabled();
        await skip(countTime(goal + 1));
        await expect(page.locator('.ab-miss')).toHaveText(`בַּסַּל ${goal + 1} תַּפּוּחִים. צָרִיךְ ${goal}.`);
        await expect(feedback).toContainText('יוֹתֵר מִדַּי');
        await expect(page.locator('.ab-basket .ab-apple--total')).toHaveCount(goal + 1);
        // A second miss marks the places to fill.
        await activate(done);
        await skip(countTime(goal + 1));
        await expect(page.locator('.ab-slot--target')).toHaveCount(goal);
        // A touch in the basket puts the apple back on the tree, and the old count is cleared.
        await activate(inBasket.last());
        await expect(page.locator('.ab-basket .ab-apple--counted')).toHaveCount(0);
        await expect(inBasket).toHaveCount(goal);
      } else {
        await fill(goal);
      }
      await activate(done);
      await skip(countTime(goal));
      await expect(solved).toHaveText(String(goal));
      await expect(page.locator('.story-line--result')).toContainText(`${goal} תַּפּוּחִים`);
    } else {
      await skip(3000);
      await expect(choice.first()).toBeEnabled();
      const count = await onTree.count();
      expect(count).toBeGreaterThanOrEqual(round === 3 ? 2 : 6);
      // Apples stay full touch targets on a 360px phone.
      if (round === 3) {
        await page.setViewportSize({ width: 360, height: 640 });
        await expectTouchTargets(onTree);
      }
      expect(await fits()).toBe(true);
      await activate(page.locator(`.story-choice[data-value="${count}"]`));
      await expect(solved).toHaveText(String(count));
    }
  }
  await skip(2600);
  await expect(page.locator('.completion-screen')).toBeVisible();
  await activate(page.locator('.completion-screen__replay'));
  // After the first tap the replayed story starts by itself.
  await expect(page.locator('.ab-tree')).toBeVisible();
  await skip(3000);
  await expect(start).toHaveCount(0);
  const again = await onTree.count();
  await activate(page.locator(`.story-choice[data-value="${again}"]`));
  await expect(solved).toHaveText(String(again));
  expect(await fits()).toBe(true);
  await network.reloadOffline(page);
  await expect(page.locator('.ab-tree')).toBeVisible();
  await expect(choice).toHaveCount(4);
  expect(errors).toEqual([]);
});

test('fair-share: deal by touch, an unfair deal goes back, help, completion, replay and offline', async ({ page, activate, network }) => {
  test.setTimeout(60_000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  // Without a voice each sentence takes 1200 ms and each counted cookie 700 ms; the page
  // clock skips those, the 600 ms pause before an unfair deal goes back, and the 2800 ms transition.
  await noVoice(page);
  await page.clock.install();
  const skip = ms => page.clock.runFor(ms);
  await page.goto(`${network.url}/games/fair-share/`);
  const plates = page.locator('.fs-plate');
  const choice = page.locator('.story-choice');
  const solved = page.locator('.story-solved');
  const note = page.locator('.fs-note');
  const inJar = page.locator('.fs-jar .fs-cookie:not([data-state="taken"])');
  const onPlate = k => plates.nth(k).locator('.fs-dish .fs-cookie');
  const start = page.locator('.story-start');
  await expect(page.locator('.fs-jar')).toBeVisible();
  if (await start.count()) await activate(start);
  /** The exercise on screen: total : by. */
  const exercise = async () => {
    const [total, , by] = (await page.locator('.story-equation').innerText()).trim().split(/\s+/).map(Number);
    return { total, by };
  };
  /** Waits for the dealing step: two sentences, then the plates open. */
  const toDealing = async () => {
    await skip(2600);
    await expect(plates.first()).toBeEnabled();
  };
  /** Deals fairly: one to each child in turn, or `by` on each plate from the left. */
  const dealFairly = async ({ total, by }, group) => {
    for (let k = 0; k < total; k++) await activate(plates.nth(group ? Math.floor(k / by) : k % by));
  };
  const answerTo = ({ total, by }) => total / by;

  await toDealing();
  const first = await exercise();
  expect(first.by).toBe(2);
  await expect(plates).toHaveCount(2);
  await expect(choice.first()).toBeDisabled();
  await expectTouchTargets(plates);
  await expect(note).toContainText('גְּעוּ בְּצַלַּחַת');
  // Everything to Noa: the plates say what each got, and the cookies go back to the jar.
  for (let k = 0; k < first.total; k++) await activate(plates.first());
  await expect(note).toHaveText(`לְנוֹעָה ${first.total} וּלְדָנִי 0. זֶה לֹא שָׁוֶה.`);
  await expect(plates.first().locator('.fs-badge')).toHaveText(String(first.total));
  await expect(plates.first()).toBeDisabled();
  await skip(1900);
  await expect(inJar).toHaveCount(first.total);
  await expect(onPlate(0)).toHaveCount(0);
  // From the first miss the plate with the fewest cookies glows.
  await expect(page.locator('.fs-plate--next')).toHaveCount(1);
  await dealFairly(first, false);
  await expect(onPlate(1)).toHaveCount(answerTo(first));
  await skip(1300);
  await expect(choice.first()).toBeEnabled();
  await expectTouchTargets(choice);
  // The number of children is the telling mistake; it shows on Noa's plate, then the help counts.
  const each = answerTo(first);
  const wrong = each === 2 ? 3 : 2;
  await activate(page.locator(`.story-choice[data-value="${wrong}"]`));
  await expect(page.locator('.fs-chosen')).toHaveCount(Math.min(wrong, each));
  await expect(page.locator('.fs-cookie--ghost')).toHaveCount(Math.max(0, wrong - each));
  await skip(1300);
  await expect(page.locator('.feedback-message')).toContainText('בְּצַלַּחַת אַחַת');
  await skip(700 * each + 1300);
  await expect(page.locator('.fs-cookie.fs-counted')).toHaveCount(each);
  await activate(page.locator(`.story-choice[data-value="${each}"]`));
  await expect(solved).toHaveText(String(each));
  await expect(page.locator('.story-line--result')).toHaveText(`כָּל אֶחָד קִבֵּל ${each} עוּגִיּוֹת.`);

  for (let round = 2; round <= 6; round++) {
    await skip(3000);
    await expect(solved).toHaveCount(0);
    const group = round >= 5;
    await expect(page.locator('.fs-scene--group')).toHaveCount(group ? 1 : 0);
    await toDealing();
    const ex = await exercise();
    if (round === 5) {
      // The plates repeat the first exercise with its other meaning.
      expect(ex).toEqual(first);
      await expect(note).toContainText('לָשִׂים');
      // A full plate takes no more, and says so.
      for (let k = 0; k <= ex.by; k++) await activate(plates.first());
      await expect(onPlate(0)).toHaveCount(ex.by);
      await expect(note).toHaveText(`בְּכָל צַלַּחַת ${ex.by} עוּגִיּוֹת, לֹא יוֹתֵר.`);
      // The first plate is full; the rest go on the next plates.
      for (let k = ex.by; k < ex.total; k++) await activate(plates.nth(Math.floor(k / ex.by)));
    }
    if (round !== 5) await dealFairly(ex, group);
    if (round === 3) await expect(page.locator('.story-line').last()).toContainText('חֲצִי מִתּוֹךְ');
    await skip(1300);
    await expect(choice.first()).toBeEnabled();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await activate(page.locator(`.story-choice[data-value="${answerTo(ex)}"]`));
    await expect(solved).toHaveText(String(answerTo(ex)));
  }
  await skip(3000);
  await expect(page.locator('.completion-screen')).toBeVisible();
  await activate(page.locator('.completion-screen__replay'));
  await expect(page.locator('.fs-jar')).toBeVisible();
  await expect(start).toHaveCount(0);
  await toDealing();
  const again = await exercise();
  await dealFairly(again, false);
  await skip(1300);
  await activate(page.locator(`.story-choice[data-value="${answerTo(again)}"]`));
  await expect(solved).toHaveText(String(answerTo(again)));
  await network.reloadOffline(page);
  await expect(page.locator('.fs-jar')).toBeVisible();
  await expect(choice).toHaveCount(4);
  expect(errors).toEqual([]);
});

test('balance-scale: add cubes and weigh, the beam shows the heavier side, help, completion, replay and offline', async ({ page, activate, network }) => {
  test.setTimeout(60_000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  // Without a voice a sentence takes 1200 ms and a counted step 700 ms; the page clock skips
  // those, the 700 ms swing of the beam and the 3400 ms round transition.
  await noVoice(page);
  await page.clock.install();
  const skip = ms => page.clock.runFor(ms);
  await page.goto(`${network.url}/games/balance-scale/`);
  const scale = page.locator('.bl-scale');
  const more = page.getByRole('button', { name: 'הוֹסָפַת קֻבִּיָּה', exact: true });
  const less = page.getByRole('button', { name: 'הוֹרָדַת קֻבִּיָּה', exact: true });
  const weigh = page.locator('.bl-weigh');
  const solved = page.locator('.story-solved');
  const mine = page.locator('.bl-side--mine .bl-cube[data-term="mine"]');
  const fits = () => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
  /** Reads the exercise: the total of the other side and the known part of the child's side. */
  const read = async () => {
    const [left, right] = (await page.locator('.story-equation').innerText()).split('=').map(side => side.trim().split(/\s*\+\s*/));
    const sum = terms => terms.filter(t => t !== '?').reduce((a, t) => a + Number(t), 0);
    const childLeft = left.includes('?');
    const answer = childLeft ? sum(right) - sum(left) : sum(left) - sum(right);
    return { answer, childLeft, other: childLeft ? sum(right) : sum(left) };
  };
  /** Sets the child's cubes to count. */
  const setCubes = async count => {
    while (await mine.count() < count) await activate(more);
    while (await mine.count() > count) await activate(less);
  };
  const steps = n => (n > 5 ? n - 4 : n);

  await expect(scale).toBeVisible();
  await expect(page.locator('.story-line').first()).toContainText('אוֹמֵר: שְׁנֵי הַצְּדָדִים שָׁוִים');
  // Speech needs a first tap on phones, so the first intro waits for one.
  const start = page.locator('.story-start');
  if (await start.count()) await activate(start);
  await expect(start).toHaveCount(0);
  const first = await read();
  expect(first.childLeft).toBe(false);
  await expect(page.locator('.story-equation')).toHaveText(`${first.other} = ?`);
  await expect(page.locator('.story-equation')).toHaveAttribute('dir', 'ltr');
  await expectTouchTargets(page.locator('.bl-step, .bl-weigh'));
  await expect(less).toBeDisabled();
  // One too few: the beam goes down on the other side and says the child's side has less.
  await setCubes(first.answer - 1);
  await activate(weigh);
  await expect(weigh).toBeDisabled();
  await expect(scale).toHaveAttribute('data-down', 'left');
  await skip(700);
  await expect(page.locator('.bl-miss')).toHaveText('בַּצַּד שֶׁלָּכֶם פָּחוֹת.');
  await skip(1300);
  // Any change holds the beam level again.
  await setCubes(first.answer + 1);
  await expect(scale).toHaveAttribute('data-down', 'level');
  await activate(weigh);
  await expect(scale).toHaveAttribute('data-down', 'right');
  // The second miss counts both pans, left to right, and shows both totals.
  await skip(700 + 700 * (steps(first.other) + steps(first.answer + 1)) + 1300);
  await expect(page.locator('.bl-total')).toHaveText([String(first.other), String(first.answer + 1)]);
  await expect(page.locator('.bl-miss')).toHaveText('שְׁנֵי הַצְּדָדִים אֵינָם שָׁוִים.');
  await expect(weigh).toBeEnabled();
  // The third miss marks the cube past the places to fill.
  await activate(weigh);
  await skip(700 + 700 * (steps(first.other) + steps(first.answer + 1)) + 1300);
  await expect(page.locator('.bl-cube--extra')).toHaveCount(1);
  await setCubes(first.answer);
  await expect(page.locator('.bl-cube--extra')).toHaveCount(0);
  await expect(page.locator('.bl-total').first()).toHaveText('');
  await activate(weigh);
  await expect(solved).toHaveText(String(first.answer));
  await expect(scale).toHaveAttribute('data-down', 'level');
  await expect(page.locator('.bl-total')).toHaveText([String(first.other), String(first.other)]);
  await expect(page.locator('.story-line--result')).toHaveText('שְׁנֵי הַצְּדָדִים שָׁוִים.');

  const shapes = [];
  for (let round = 2; round <= 6; round++) {
    await skip(3600);
    await expect(solved).toHaveCount(0);
    shapes.push((await page.locator('.story-equation').innerText()).replace(/\d+/g, 'n'));
    const { answer } = await read();
    expect(await fits()).toBe(true);
    await setCubes(answer);
    await activate(weigh);
    await expect(solved).toHaveText(String(answer));
  }
  // The unknown and the sum also stand to the left of =.
  expect(shapes).toEqual(['n + n = ?', '? = n + n', 'n = n + ?', 'n + n = n + ?', 'n + ? = n + n']);
  await skip(3600);
  await expect(page.locator('.completion-screen')).toBeVisible();
  await activate(page.locator('.completion-screen__replay'));
  await expect(scale).toBeVisible();
  await expect(start).toHaveCount(0);
  const again = await read();
  await setCubes(again.answer);
  await activate(weigh);
  await expect(solved).toHaveText(String(again.answer));
  await network.reloadOffline(page);
  await expect(scale).toBeVisible();
  await expect(weigh).toBeEnabled();
  expect(errors).toEqual([]);
});

test('tens-bundles: tie ten straws into a bundle, read, build a number, help, completion, replay and offline', async ({ page, activate, network }) => {
  test.setTimeout(60_000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  // Without a voice a sentence takes 1200 ms and a counted step 700 ms; the page clock
  // skips those and the 3000 ms round transition.
  await noVoice(page);
  await page.clock.install();
  const skip = ms => page.clock.runFor(ms);
  await page.goto(`${network.url}/games/tens-bundles/`);
  const pile = page.locator('.tb-pile');
  const tie = page.locator('.tb-tie');
  const choice = page.locator('.story-choice');
  const solved = page.locator('.story-solved');
  const bundles = page.locator('.tb-bundles .tb-bundle[data-state="shown"]');
  const loose = page.locator('.tb-loose .tb-straw[data-state="shown"]');
  const making = page.locator('.tb-frame .tb-straw[data-state="shown"]');
  const fits = () => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
  const start = page.locator('.story-start');
  /** Takes ten straws from the pile and ties them. */
  const tieBundle = async () => {
    for (let k = 0; k < 10; k++) await activate(pile);
    await expect(making).toHaveCount(10);
    await activate(tie);
  };
  /** The number on the mat: bundles and single straws. */
  const onMat = async () => ({ tens: await bundles.count(), ones: await loose.count() });

  await expect(page.locator('.tb-mat')).toBeVisible();
  if (await start.count()) await activate(start);
  await skip(2600);
  await expect(pile).toBeEnabled();
  await expectTouchTargets(pile);
  await expect(choice.first()).toBeDisabled();
  const inPile = page.locator('.tb-pile .tb-straw').filter({ visible: true });
  const piled = await inPile.count();
  expect(piled).toBeGreaterThanOrEqual(12);
  for (let k = 0; k < 10; k++) await activate(pile);
  // Every straw in the bundle being made has left the pile.
  await expect(inPile).toHaveCount(piled - 10);
  await expect(tie).toBeEnabled();
  // The bundle being made holds ten, and says so.
  await activate(pile);
  await expect(page.locator('.tb-note')).toContainText('כְּבָר עֶשֶׂר');
  await expect(making).toHaveCount(10);
  await expectTouchTargets(tie);
  await activate(tie);
  await expect(page.locator('.tb-note')).toHaveText('עֶשֶׂר קַשִּׁיּוֹת הֵן צְרוֹר אֶחָד.');
  await expect(bundles).toHaveCount(1);
  await expect(page.locator('.tb-workbench')).toBeHidden();
  await expect(choice.first()).toBeEnabled();
  const first = await onMat();
  const n = 10 + first.ones;
  await expect(page.locator('.story-equation')).toHaveText(`10 + ${first.ones} = ?`);
  // Counting the bundle as one straw shows on the mat, then the help counts by tens.
  const chosen = 1 + first.ones;
  await activate(page.locator(`.story-choice[data-value="${chosen}"]`));
  // Places the number needs are ghosts, places it does not need fade.
  const [wantTens, wantOnes] = [Math.floor(chosen / 10), chosen % 10];
  await expect(page.locator('.tb-straw[data-state="ghost"]')).toHaveCount(Math.max(0, wantOnes - first.ones));
  await expect(page.locator('.tb-straw.tb-extra')).toHaveCount(Math.max(0, first.ones - wantOnes));
  await expect(page.locator('.tb-bundle.tb-extra')).toHaveCount(1 - wantTens);
  await skip(1300);
  await expect(page.locator('.feedback-message')).toContainText('בַּעֲשָׂרוֹת');
  await skip(700 * (1 + first.ones) + 1300);
  await expect(page.locator('.tb-counted')).toHaveCount(1 + first.ones);
  await expect(page.locator('.tb-running')).toHaveText(String(n));
  await activate(page.locator(`.story-choice[data-value="${n}"]`));
  await expect(solved).toHaveText(String(n));
  await expect(page.locator('.story-line--result')).toHaveText(`יֵשׁ ${n} קַשִּׁיּוֹת.`);

  for (let round = 2; round <= 6; round++) {
    await skip(3200);
    await expect(solved).toHaveCount(0);
    if (round <= 4) {
      if (round === 3) await expect(bundles).toHaveCount(2);
      if (round < 4) {
        await skip(2600);
        await tieBundle();
        if (round === 2) await tieBundle();
      }
      await expect(choice.first()).toBeEnabled();
      const { tens, ones } = await onMat();
      if (round < 4) expect(tens).toBe(round);
      expect(await fits()).toBe(true);
      await activate(page.locator(`.story-choice[data-value="${tens * 10 + ones}"]`));
      await expect(solved).toHaveText(String(tens * 10 + ones));
      continue;
    }
    // Build the written number from bundles and straws.
    const target = Number(await page.locator('.tb-target').innerText());
    const tens = Math.floor(target / 10);
    const ones = target % 10;
    const set = async (name, count, now) => {
      for (let k = now; k < count; k++) await activate(page.getByRole('button', { name: `הוֹסָפַת ${name}`, exact: true }));
      for (let k = now; k > count; k--) await activate(page.getByRole('button', { name: `הוֹרָדַת ${name}`, exact: true }));
    };
    if (round === 5) {
      await expectTouchTargets(page.locator('.tb-step, .tb-check'));
      // Swapped digits: what was built and what is needed, then the places to fill.
      await set('צְרוֹר', ones > 5 ? 5 : ones, 0);
      await set('קַשִּׁית', tens, 0);
      const built = (ones > 5 ? 5 : ones) * 10 + tens;
      await activate(page.locator('.tb-check'));
      await expect(page.locator('.tb-miss')).toHaveText(`בְּנִיתֶם ${built}. צָרִיךְ ${target}.`);
      await skip(1300);
      // The number built stays under the mat after the miss.
      await expect(page.locator('.tb-running')).toHaveText(String(built));
      await activate(page.locator('.tb-check'));
      await expect(page.locator('.tb-straw[data-state="ghost"], .tb-bundle[data-state="ghost"], .tb-extra')).not.toHaveCount(0);
      await skip(1300);
      await set('צְרוֹר', tens, ones > 5 ? 5 : ones);
      await set('קַשִּׁית', ones, tens);
    } else {
      await set('צְרוֹר', tens, 0);
    }
    await expect(page.locator('.tb-running')).toHaveText(String(target));
    await activate(page.locator('.tb-check'));
    await expect(solved).toHaveText(String(target));
    await expect(page.locator('.story-equation')).toHaveText(`${[...Array(tens).fill('10'), ...(ones ? [ones] : [])].join(' + ')} = ${target}`);
  }
  await skip(3200);
  await expect(page.locator('.completion-screen')).toBeVisible();
  await activate(page.locator('.completion-screen__replay'));
  await expect(page.locator('.tb-mat')).toBeVisible();
  await expect(start).toHaveCount(0);
  await skip(2600);
  await tieBundle();
  const again = await onMat();
  await activate(page.locator(`.story-choice[data-value="${10 + again.ones}"]`));
  await expect(solved).toHaveText(String(10 + again.ones));
  await network.reloadOffline(page);
  await expect(page.locator('.tb-mat')).toBeVisible();
  await expect(choice).toHaveCount(4);
  expect(errors).toEqual([]);
});
