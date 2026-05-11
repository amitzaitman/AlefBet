// @ts-check
import { test, expect } from '@playwright/test';

const GAME_URL = '/games/nikud-speak/';
const BANNER_SELECTOR = '#alefbet-audio-status-banner';

async function blockGoogleTTS(page) {
  await page.route('**/translate.google.com/**', route => route.abort());
  await page.route('**/translate_tts**', route => route.abort());
}

/**
 * Stubs `navigator.mediaDevices.getUserMedia` so that the vowel detector
 * is reported as `available` (the game's gate) but every `listen()` call
 * resolves to an empty result instantly. With three failed mic presses,
 * the game's built-in auto-advance fires and the round progresses.
 *
 * This keeps the test deterministic and offline — no real microphone, no
 * waiting for the 3-second listen window.
 */
async function stubMicrophone(page) {
  await page.addInitScript(() => {
    // Provide a thin, always-rejecting getUserMedia. The presence of the
    // function is enough to make createVowelDetector() report available=true,
    // so the game proceeds past its onBeforeHide gate. The listen() flow then
    // catches the rejection and returns empty() immediately.
    const md = navigator.mediaDevices || {};
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      get: () => ({
        ...md,
        getUserMedia: () => Promise.reject(new DOMException('blocked', 'NotAllowedError')),
      }),
    });
  });
}

/**
 * Drive the round from "freshly visible nikud card" to "round advanced"
 * by pressing the mic three times. With `stubMicrophone` in place each
 * press resolves immediately as a non-match, the third press triggers
 * the failCount>=3 auto-advance branch in nikud-speak/game.js.
 */
async function pressMicUntilAdvance(page) {
  const mic = page.locator('.mic-btn');
  await expect(mic).toBeVisible({ timeout: 10_000 });

  for (let i = 0; i < 3; i++) {
    // The button disables itself while listening, then re-enables on a
    // fail (failCount<3). `click` from Playwright auto-waits for enabled.
    await mic.click();
  }
}

test.describe('nikud-speak', () => {
  test.beforeEach(async ({ page }) => {
    await blockGoogleTTS(page);
    await stubMicrophone(page);
  });

  test('golden path: a round advances after the auto-advance threshold', async ({ page }) => {
    await page.goto(GAME_URL);

    await expect(page.locator('.nikud-speak-card')).toBeVisible({ timeout: 10_000 });
    const initialLabel = await page.locator('.progress-bar__label').textContent();

    await pressMicUntilAdvance(page);

    // Either the progress label changed, or a fresh card replaced the old one —
    // both are unambiguous "round advanced" signals.
    await expect(async () => {
      const label = await page.locator('.progress-bar__label').textContent();
      expect(label).not.toBe(initialLabel);
    }).toPass({ timeout: 6_000 });
  });

  test('audio-failure path: banner surfaces and the round still progresses', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'speechSynthesis', {
        configurable: true,
        get: () => undefined,
      });
      // eslint-disable-next-line no-undef
      HTMLAudioElement.prototype.play = function () {
        return Promise.reject(new DOMException('blocked', 'NotAllowedError'));
      };
    });

    await page.goto(GAME_URL);

    await expect(page.locator('.nikud-speak-card')).toBeVisible({ timeout: 10_000 });
    const initialLabel = await page.locator('.progress-bar__label').textContent();

    // Tap the demo (speaker) button first — that triggers the TTS state
    // machine, which under our stubs ends up in `unsupported`/`failed` and
    // surfaces the banner.
    await page.locator('.demo-btn').click();

    const banner = page.locator(BANNER_SELECTOR);
    await expect(banner).toBeVisible({ timeout: 5_000 });
    const bannerText = (await banner.textContent()) || '';
    expect(
      bannerText.includes('הַקּוֹל אֵינוֹ זָמִין') || bannerText.includes('בְּעָיָה בַּקּוֹל'),
      `unexpected banner text: ${JSON.stringify(bannerText)}`,
    ).toBeTruthy();

    // And the round still progresses despite the audio failure.
    await pressMicUntilAdvance(page);

    await expect(async () => {
      const label = await page.locator('.progress-bar__label').textContent();
      expect(label).not.toBe(initialLabel);
    }).toPass({ timeout: 6_000 });
  });
});
