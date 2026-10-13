import { test, expect, noVoice, targetNikud } from './network-server.js';

test('touch retry, audio failure, completion, replay and offline reload', async ({ page, network }) => {
  await page.route('**/translate.google.com/**', route => route.abort());
  await page.route('**/translate_tts**', route => route.abort());
  await noVoice(page);
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
  for (let round = 0; round < 8; round++) {
    await page.locator('[data-id="correct"]:enabled').tap();
  }
  await expect(page.locator('.completion-screen')).toBeVisible();
  await page.locator('.completion-screen__replay').tap();
  await expect(cards).toHaveCount(4);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await network.reloadOffline(page);
  await expect(cards).toHaveCount(4);
  await page.locator('[data-id="correct"]').tap();
  await expect(page.locator('.progress-bar__label')).toHaveText('1 / 8');
});

test('adult tools stay separate and feedback does not move the choices', async ({ page }) => {
  await page.goto('/');
  const studio = page.locator('a[href="games/sound-studio/"]');
  await expect(studio).toBeHidden();
  await page.getByText('להורים ולמורים', { exact: true }).click();
  await expect(studio).toBeVisible();
  // The adult menu (here: nikud settings) opens without moving the child's choices.
  await page.goto('/games/syllable-read/');
  const choices = page.locator('.option-cards-grid');
  await expect(choices).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  const closed = await choices.boundingBox();
  await expect(page.getByRole('button', { name: 'הגדרות', exact: true })).toBeHidden();
  await page.getByText('למבוגרים', { exact: true }).tap();
  await expect(page.getByRole('button', { name: 'הגדרות', exact: true })).toBeVisible();
  expect(await choices.boundingBox()).toEqual(closed);
  await page.keyboard.press('Escape');
  await expect(page.locator('.adult-tools')).not.toHaveAttribute('open', '');
  await page.goto('/games/letter-match-animals/');
  const cards = page.locator('.option-cards-grid');
  await expect(cards).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  const before = await cards.boundingBox();
  await page.locator('[data-id="wrong-0"]').tap();
  await expect(page.locator('.feedback-message--hint')).toBeVisible();
  const after = await cards.boundingBox();
  expect(Math.abs(after.y - before.y)).toBeLessThan(1);
  expect(Math.abs(after.width - before.width)).toBeLessThan(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('nikud supports tap selection, retry, completion and returning home', async ({ page }) => {
  await page.goto('/games/nikud-match/');
  const letter = page.locator('.nm-arena .nm-letter');
  const label = page.locator('.progress-bar__label');
  await expect(letter).toBeVisible();
  let nikud = await targetNikud(page);
  const correct = () => page.locator(`.nm-zone[data-nikud="${nikud}"]`);
  // Tapping a zone before choosing the letter does nothing; a wrong zone keeps the letter chosen.
  await correct().tap();
  await expect(letter).toHaveAttribute('aria-pressed', 'false');
  await letter.tap();
  await expect(letter).toHaveAttribute('aria-pressed', 'true');
  await page.locator(`.nm-zone:not([data-nikud="${nikud}"])`).tap();
  await expect(letter).toBeEnabled();
  await expect(letter).toHaveAttribute('aria-pressed', 'true');
  // Each answered letter is marked, so the next round is read only once it is on screen.
  const answer = async () => { await letter.evaluate(el => { el.dataset.answered = ''; }); await correct().tap(); };
  await answer();
  for (let round = 1; round < 8; round++) {
    await expect(page.locator('.nm-arena .nm-letter:not([data-answered])')).toBeVisible();
    await expect(label).toHaveText(`${round} / 8`);
    nikud = await targetNikud(page);
    await letter.tap();
    await answer();
  }
  await expect(page.locator('.completion-screen__score')).toHaveText('הִשְׁלַמְתֶּם 8 מְשִׂימוֹת!');
  await page.locator('.completion-screen__home').tap();
  await expect(page.locator('.games-grid').first()).toBeVisible();
});

test('two fingers do not zoom a game and one finger still scrolls', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'Multi-touch input is sent through the Chromium protocol');
  await page.setViewportSize({ width: 412, height: 420 });
  await page.goto('/games/make-ten/');
  await expect(page.locator('.ten-frame')).toBeVisible();
  const cdp = await page.context().newCDPSession(page);
  const touch = (type, touchPoints) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints });
  const frames = () => page.evaluate(() => new Promise(done => requestAnimationFrame(() => requestAnimationFrame(done))));
  /** @param {number} y @param {number[]} xs */
  const fingers = (y, xs) => xs.map((x, id) => ({ x, y, id }));
  // A child's accidental spread of two fingers.
  await touch('touchStart', fingers(80, [186, 226]));
  for (let d = 25; d <= 150; d += 5) {
    await touch('touchMove', fingers(80, [206 - d, 206 + d]));
    await frames();
  }
  await touch('touchEnd', []);
  await frames();
  expect(await page.evaluate(() => visualViewport.scale)).toBe(1);
  // Scrolling a screen taller than the phone still works.
  await touch('touchStart', fingers(380, [206]));
  for (let y = 370; y >= 120; y -= 10) {
    await touch('touchMove', fingers(y, [206]));
    await frames();
  }
  await touch('touchEnd', []);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
});
