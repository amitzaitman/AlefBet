// @ts-check
import { test, expect, noVoice } from './network-server.js';

const GAME_URL = '/games/nikud-speak/';

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
    await stubMicrophone(page);
  });

  test('without a voice the banner surfaces and three misses still advance the round', async ({ page }) => {
    await noVoice(page);
    await page.goto(GAME_URL);

    await expect(page.locator('.nikud-speak-card')).toBeVisible({ timeout: 10_000 });

    // Tap the demo (speaker) button first. With no voice, speaking puts the
    // TTS state machine in `unsupported`, which surfaces the banner.
    await page.locator('.demo-btn').click();

    const banner = page.locator('#alefbet-audio-status-banner');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('הַקּוֹל אֵינוֹ זָמִין');

    // And the round still progresses despite the audio failure.
    await pressMicUntilAdvance(page);
    await expect(page.locator('.progress-bar__label')).toHaveText('1 / 8');
  });
});
