// @ts-check
import { test, expect } from '@playwright/test';

const GAME_URL = '/games/letter-match-animals/';
const BANNER_SELECTOR = '#alefbet-audio-status-banner';

/**
 * Always block the live Google TTS endpoints — keeps every spec deterministic
 * and offline regardless of which path it is exercising.
 */
async function blockGoogleTTS(page) {
  await page.route('**/translate.google.com/**', route => route.abort());
  await page.route('**/translate_tts**', route => route.abort());
}

/**
 * Picks the option card whose text matches the correct animal for the current
 * round, by reading the on-screen Hebrew letter and matching it against the
 * known animal list. Fails explicitly if the expected answer is missing.
 */
async function pickAndClickCorrectCard(page) {
  // Wait for the round UI: an instruction line plus 4 option cards.
  const cards = page.locator('.option-card');
  await expect(cards.first()).toBeVisible({ timeout: 10_000 });
  await expect(cards).toHaveCount(4, { timeout: 10_000 });

  // The correct round letter is the first/only `.letter-display` on screen.
  const letter = (await page.locator('.letter-display').first().textContent())?.trim() || '';

  // Mapping mirrors hebrewLetters' exampleWord in framework/src/data/hebrew-letters.js
  // (stripped of nikud). The game now randomizes its 8 target letters out of
  // all 22 regular letters each session, so every regular letter needs an
  // entry here or the golden-path assertion could flake.
  const correctByLetter = {
    'א': 'אריה',
    'ב': 'בית',
    'ג': 'גמל',
    'ד': 'דג',
    'ה': 'הר',
    'ו': 'ורד',
    'ז': 'זאב',
    'ח': 'חתול',
    'ט': 'טלה',
    'י': 'יונה',
    'כ': 'כלב',
    'ל': 'לב',
    'מ': 'מים',
    'נ': 'נחש',
    'ס': 'סוס',
    'ע': 'עוגה',
    'פ': 'פיל',
    'צ': 'צב',
    'ק': 'קוף',
    'ר': 'רכב',
    'ש': 'שמש',
    'ת': 'תפוח',
  };
  const wantedBase = correctByLetter[letter];

  if (wantedBase) {
    // Each card text contains the animal's nikud-marked form; we compare
    // after stripping nikud characters to keep matching simple.
    const stripNikud = s => s.replace(/[֑-ׇ]/g, '');
    const count = await cards.count();
    for (let i = 0; i < count; i++) {
      const txt = (await cards.nth(i).textContent()) || '';
      if (stripNikud(txt).includes(wantedBase)) {
        await cards.nth(i).click();
        return;
      }
    }
  }
  throw new Error(`No correct card found for letter ${letter}`);
}

test.describe('letter-match-animals', () => {
  test.beforeEach(async ({ page }) => {
    await blockGoogleTTS(page);
  });

  test('golden path: a round advances after picking the correct card', async ({ page }) => {
    await page.goto(GAME_URL);

    // Round UI is up.
    await expect(page.locator('.letter-display').first()).toBeVisible({ timeout: 10_000 });
    const initialLabel = await page.locator('.progress-bar__label').textContent();

    await pickAndClickCorrectCard(page);

    // Either the progress label updates, or the displayed letter changes —
    // both are unambiguous "round advanced" signals.
    await expect(async () => {
      const label = await page.locator('.progress-bar__label').textContent();
      expect(label).not.toBe(initialLabel);
    }).toPass({ timeout: 5_000 });
  });

  test('audio-failure path: banner surfaces and a round still advances', async ({ page }) => {
    await page.addInitScript(() => {
      // Disable Web Speech API completely.
      Object.defineProperty(window, 'speechSynthesis', {
        configurable: true,
        get: () => undefined,
      });
      // Reject every HTMLAudioElement.play() so Google TTS path also fails.
      // eslint-disable-next-line no-undef
      HTMLAudioElement.prototype.play = function () {
        return Promise.reject(new DOMException('blocked', 'NotAllowedError'));
      };
    });

    await page.goto(GAME_URL);

    await expect(page.locator('.letter-display').first()).toBeVisible({ timeout: 10_000 });
    const initialLabel = await page.locator('.progress-bar__label').textContent();

    // letter-match-animals only calls tts.unlock() on first click — it doesn't
    // route the chosen animal through speak(). To exercise the failure path we
    // dynamically import the framework module and invoke tts.speak() directly;
    // with speechSynthesis undef and Audio.play rejecting, this drives the
    // state machine to `failed`, which the banner surfaces.
    await page.evaluate(async () => {
      const mod = await import('/framework/dist/runtime.js');
      await mod.tts.speak('שלום');
    });

    // The banner must surface one of the failure-state messages within 5s.
    const banner = page.locator(BANNER_SELECTOR);
    await expect(banner).toBeVisible({ timeout: 5_000 });
    const bannerText = (await banner.textContent()) || '';
    expect(
      bannerText.includes('הַקּוֹל אֵינוֹ זָמִין') || bannerText.includes('בְּעָיָה בַּקּוֹל'),
      `unexpected banner text: ${JSON.stringify(bannerText)}`,
    ).toBeTruthy();

    // And a round still progresses despite the audio failure.
    await pickAndClickCorrectCard(page);
    await expect(async () => {
      const label = await page.locator('.progress-bar__label').textContent();
      expect(label).not.toBe(initialLabel);
    }).toPass({ timeout: 5_000 });
  });
});

test('editor loads on demand, preserves saved content, and reopens offline', async ({ page, context }) => {
  const editorRequests = [];
  page.on('request', request => {
    if (/\/editor\.(js|css)/.test(request.url())) editorRequests.push(request.url());
  });
  await page.addInitScript(() => {
    localStorage.setItem('alefbet.editor.letter-match-animals', JSON.stringify({
      id: 'letter-match-animals', version: 1, meta: { type: 'multiple-choice' },
      rounds: [{ id: 'saved', target: 'א', correct: 'אַרְיֵה', correctEmoji: '🦁' }],
    }));
  });
  await page.goto('/games/letter-match-animals/');
  await expect(page.locator('.letter-display')).toHaveText('א');
  expect(editorRequests).toEqual([]);
  await page.getByRole('button', { name: '✏️ ערוך', exact: true }).click();
  await expect(page.locator('#game')).toHaveClass(/ab-editor-active/);
  expect(editorRequests.some(url => url.endsWith('editor.js'))).toBe(true);
  expect(editorRequests.some(url => url.endsWith('editor.css'))).toBe(true);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await expect(async () => {
    const css = await page.evaluate(async () => !!await caches.match('/framework/dist/editor.css'));
    expect(css).toBe(true);
  }).toPass();
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('.letter-display')).toHaveText('א');
  await page.getByRole('button', { name: '✏️ ערוך', exact: true }).click();
  await expect(page.locator('#game')).toHaveClass(/ab-editor-active/);
});

test('completion and replay do not accumulate audio listeners', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('alefbet.editor.letter-match-animals', JSON.stringify({
      id: 'letter-match-animals', version: 1, meta: { type: 'multiple-choice' },
      rounds: [{ id: 'only', target: 'א', correct: 'אַרְיֵה', correctEmoji: '🦁' }],
    }));
    const listeners = new Set();
    const add = window.addEventListener.bind(window);
    const remove = window.removeEventListener.bind(window);
    window.addEventListener = (type, listener, options) => {
      if (type === 'alefbet:tts-state') listeners.add(listener);
      return add(type, listener, options);
    };
    window.removeEventListener = (type, listener, options) => {
      if (type === 'alefbet:tts-state') listeners.delete(listener);
      return remove(type, listener, options);
    };
    window.audioListenerCount = () => listeners.size;
  });
  await page.goto(GAME_URL);
  for (let replay = 0; replay < 2; replay++) {
    await expect(page.locator('.option-card')).toHaveCount(4);
    expect(await page.evaluate(() => window.audioListenerCount())).toBe(1);
    await page.locator('.option-card[data-id="correct"]').click();
    await expect(page.locator('.completion-screen')).toBeVisible();
    expect(await page.evaluate(() => window.audioListenerCount())).toBe(0);
    await page.locator('.completion-screen__replay').click();
  }
  await expect(page.locator('.option-card')).toHaveCount(4);
  expect(await page.evaluate(() => window.audioListenerCount())).toBe(1);
});


test('wrong answer keeps the same choices and allows a correct retry', async ({ page }) => {
  await blockGoogleTTS(page);
  await page.goto(GAME_URL);
  const cards = page.locator('.option-card');
  await expect(cards).toHaveCount(4);
  const choices = await cards.allTextContents();
  const letter = await page.locator('.letter-display').textContent();
  const progress = await page.locator('.progress-bar__label').textContent();
  await page.locator('.option-card[data-id="wrong-0"]').click();
  await expect(page.locator('.feedback-message--hint')).toBeVisible();
  await expect(cards.first()).toBeDisabled();
  await expect(cards.first()).toBeEnabled();
  expect(await cards.allTextContents()).toEqual(choices);
  await expect(page.locator('.letter-display')).toHaveText(letter);
  await expect(page.locator('.progress-bar__label')).toHaveText(progress);
  await pickAndClickCorrectCard(page);
  await expect(page.locator('.progress-bar__label')).not.toHaveText(progress);
});

test('all eight rounds complete with word instructions and full score', async ({ page }) => {
  await blockGoogleTTS(page);
  await page.goto(GAME_URL);
  const letters = new Set();
  for (let round = 0; round < 8; round++) {
    const instruction = page.locator('.game-instruction');
    await expect(instruction).toHaveText('מִצְאוּ אֶת הַמִּלָּה שֶׁמַּתְחִילָה בָּאוֹת:');
    const letter = await page.locator('.letter-display').textContent();
    expect(letters.has(letter)).toBe(false);
    letters.add(letter);
    await pickAndClickCorrectCard(page);
    if (round < 7) await expect(page.locator('.letter-display')).not.toHaveText(letter);
  }
  await expect(page.locator('.completion-screen')).toBeVisible();
  await expect(page.locator('.completion-screen__score')).toContainText('8');
});

test('phone choices fill the panel and remain inside the screen', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await blockGoogleTTS(page);
  await page.goto(GAME_URL);
  const cards = page.locator('.option-card');
  await expect(cards).toHaveCount(4);
  for (const card of await cards.all()) {
    const box = await card.boundingBox();
    expect(box).not.toBeNull();
    expect(box.width).toBeGreaterThanOrEqual(120);
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(390);
  }
});


test('failed editor save stays editable and permits export and retry', async ({ page }) => {
  await blockGoogleTTS(page);
  await page.goto(GAME_URL);
  await page.getByRole('button', { name: '✏️ ערוך', exact: true }).click();
  await page.locator('.ab-editor-btn--add').click();
  await page.evaluate(() => {
    window.originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = () => { throw new DOMException('Full', 'QuotaExceededError'); };
  });
  await page.getByRole('button', { name: '💾 שמור', exact: true }).click();
  await expect(page.locator('.ab-editor-save-status')).toContainText('לא נשמר');
  await expect(page.locator('.ab-editor-toast')).toHaveCount(0);
  await page.getByRole('button', { name: '▶ שחק', exact: true }).click();
  await expect(page.locator('.ab-editor-active')).toHaveCount(1);
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: '⬇ ייצוא', exact: true }).click();
  expect((await download).suggestedFilename()).toBe('letter-match-animals-rounds.json');
  await page.evaluate(() => { Storage.prototype.setItem = window.originalSetItem; });
  await page.getByRole('button', { name: '💾 שמור', exact: true }).click();
  await expect(page.locator('.ab-editor-save-status')).toHaveText('נשמר');
});
