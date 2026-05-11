// @ts-check
import { test, expect } from '@playwright/test';

const GAME_URL = '/games/nikud-match/';
const BANNER_SELECTOR = '#alefbet-audio-status-banner';

async function blockGoogleTTS(page) {
  await page.route('**/translate.google.com/**', route => route.abort());
  await page.route('**/translate_tts**', route => route.abort());
}

/**
 * Drive the framework's drag.js handlers by dispatching real PointerEvents on
 * the letter element. Playwright's `page.mouse.*` sends Chromium mouse events
 * that, with our setup, don't reliably translate into the pointerId-bearing
 * PointerEvents the framework's `setPointerCapture` flow demands — so we
 * construct + dispatch the events ourselves inside the page.
 *
 * Zone selection: the nikud glyph is rendered as an SVG inside the zone (no
 * text), so we cannot match by `textContent`. We dispatch the drag to the
 * given zone selector and rely on the round-advance assertion to confirm
 * correctness — wrong-zone drags are no-ops in nikud-match (just a pulse),
 * so a second attempt on the other zone is required when the first misses.
 *
 * @param {import('@playwright/test').Page} page
 * @param {'.nm-zone--left' | '.nm-zone--right'} zoneSelector
 */
async function dispatchDragToZone(page, zoneSelector) {
  return page.evaluate((zoneSel) => {
    const letter = /** @type {HTMLElement | null} */ (document.querySelector('.nm-letter'));
    const zone = /** @type {HTMLElement | null} */ (document.querySelector(zoneSel));
    if (!letter || !zone) return false;

    const sBox = letter.getBoundingClientRect();
    const tBox = zone.getBoundingClientRect();
    const sx = sBox.left + sBox.width / 2;
    const sy = sBox.top + sBox.height / 2;
    const tx = tBox.left + tBox.width / 2;
    const ty = tBox.top + tBox.height / 2;

    const fire = (type, x, y) => {
      const ev = new PointerEvent(type, {
        bubbles: true,
        cancelable: true,
        composed: true,
        pointerId: 1,
        pointerType: 'mouse',
        button: 0,
        buttons: type === 'pointerup' ? 0 : 1,
        clientX: x,
        clientY: y,
        isPrimary: true,
      });
      letter.dispatchEvent(ev);
    };

    fire('pointerdown', sx, sy);
    for (let i = 1; i <= 5; i++) {
      const x = sx + (tx - sx) * (i / 5);
      const y = sy + (ty - sy) * (i / 5);
      fire('pointermove', x, y);
    }
    fire('pointerup', tx, ty);
    return true;
  }, zoneSelector);
}

/**
 * Drag the letter to whichever zone is the correct nikud match by trying the
 * left zone first, then the right if the round didn't advance. nikud-match
 * advances only on a correct drop, so two attempts cover both possibilities.
 */
async function dragLetterToCorrectZone(page) {
  await expect(page.locator('.nm-letter')).toBeVisible({ timeout: 10_000 });
  await expect(page.locator('.nm-zone--left')).toBeVisible();
  await expect(page.locator('.nm-zone--right')).toBeVisible();

  const labelBefore = await page.locator('.progress-bar__label').textContent();
  await dispatchDragToZone(page, '.nm-zone--left');
  await page.waitForTimeout(200);

  // If the left zone wasn't the correct one, try the right zone.
  const labelAfter = await page.locator('.progress-bar__label').textContent();
  if (labelAfter === labelBefore) {
    // Wait for any wrong-answer pulse to finish, then try the other zone.
    await page.waitForTimeout(900);
    await dispatchDragToZone(page, '.nm-zone--right');
  }
}

test.describe('nikud-match', () => {
  test.beforeEach(async ({ page }) => {
    await blockGoogleTTS(page);
  });

  test('golden path: dragging the letter to the matching zone advances a round', async ({ page }) => {
    await page.goto(GAME_URL);

    await expect(page.locator('.nm-arena')).toBeVisible({ timeout: 10_000 });
    const initialLabel = await page.locator('.progress-bar__label').textContent();

    await dragLetterToCorrectZone(page);

    await expect(async () => {
      const label = await page.locator('.progress-bar__label').textContent();
      expect(label).not.toBe(initialLabel);
    }).toPass({ timeout: 5_000 });
  });

  test('audio-failure path: banner surfaces and the game still progresses', async ({ page }) => {
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

    await expect(page.locator('.nm-arena')).toBeVisible({ timeout: 10_000 });
    const initialLabel = await page.locator('.progress-bar__label').textContent();

    await dragLetterToCorrectZone(page);

    const banner = page.locator(BANNER_SELECTOR);
    await expect(banner).toBeVisible({ timeout: 5_000 });
    const bannerText = (await banner.textContent()) || '';
    expect(
      bannerText.includes('הַקּוֹל אֵינוֹ זָמִין') || bannerText.includes('בְּעָיָה בַּקּוֹל'),
      `unexpected banner text: ${JSON.stringify(bannerText)}`,
    ).toBeTruthy();

    await expect(async () => {
      const label = await page.locator('.progress-bar__label').textContent();
      expect(label).not.toBe(initialLabel);
    }).toPass({ timeout: 5_000 });
  });
});
