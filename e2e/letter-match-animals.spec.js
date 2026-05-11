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
 * known animal list. Falls back to clicking the first card to avoid hangs —
 * round progression is the only thing the test asserts.
 */
async function pickAndClickCorrectCard(page) {
  // Wait for the round UI: an instruction line plus 4 option cards.
  const cards = page.locator('.option-card');
  await expect(cards.first()).toBeVisible({ timeout: 10_000 });
  await expect(cards).toHaveCount(4, { timeout: 10_000 });

  // The correct round letter is the first/only `.letter-display` on screen.
  const letter = (await page.locator('.letter-display').first().textContent())?.trim() || '';

  // Mapping mirrors ROUNDS in games/letter-match-animals/game.js.
  const correctByLetter = {
    'א': 'אריה',
    'ב': 'בית',
    'ג': 'גמל',
    'ד': 'דג',
    'ה': 'הר',
    'ו': 'ורד',
    'ז': 'זאב',
    'ח': 'חתול',
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
  // Fallback: click the first card. Either way, the UI moves to the next
  // round (correct → score++, wrong → re-roll). For golden-path we expect
  // a correct match because the mapping above is exhaustive over ROUNDS.
  await cards.first().click();
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
      const mod = await import('/framework/dist/alefbet.js');
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
