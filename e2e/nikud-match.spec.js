// @ts-check
import { test, expect } from '@playwright/test';

const GAME_URL = '/games/nikud-match/';
const BANNER_SELECTOR = '#alefbet-audio-status-banner';

async function blockGoogleTTS(page) {
  await page.route('**/translate.google.com/**', route => route.abort());
  await page.route('**/translate_tts**', route => route.abort());
}

/** גרירה עם קלט עכבר אמיתי, כולל לכידת המצביע של הדפדפן. */
async function dispatchDragToZone(page, zoneSelector) {
  const letter = page.locator('.nm-arena .nm-letter');
  await letter.evaluate(el => Promise.all(el.getAnimations().map(animation => animation.finished)));
  const source = await letter.boundingBox();
  const target = await page.locator(zoneSelector).boundingBox();
  if (!source || !target) return false;
  await page.mouse.move(source.x + source.width / 2, source.y + source.height / 2);
  await page.mouse.down();
  await page.mouse.move(target.x + target.width / 2, target.y + target.height / 2, { steps: 8 });
  await page.mouse.up();
  return true;
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
    await expect(page.getByRole('button', { name: '✏️ ערוך', exact: true })).toBeHidden();
    await page.getByText('למבוגרים', { exact: true }).click();
    await expect(page.getByRole('button', { name: '✏️ ערוך', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'הגדרות', exact: true })).toBeVisible();
    await page.getByText('למבוגרים', { exact: true }).click();
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

test('keyboard selection works and the optional demonstration cleans up on input', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('alefbet.editor.nikud-match', JSON.stringify({
      id: 'nikud-match', version: 1, meta: { type: 'drag-match' },
      rounds: [{ id: 'a', target: 'ב', correct: 'kamatz', correctEmoji: '' }],
    }));
  });
  await page.goto(GAME_URL);
  await page.locator('.nm-help').click();
  await expect(page.locator('.nm-demo')).toHaveCount(1);
  const letter = page.locator('.nm-arena .nm-letter');
  await letter.focus();
  await page.keyboard.press('Space');
  await expect(letter).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.nm-demo')).toHaveCount(0);
  await page.locator('.nm-zone[data-nikud="kamatz"]').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.completion-screen')).toBeVisible();
});

for (const input of ['mouse', 'touch']) {
  test(`drag preview follows real ${input} input and a wrong drop can be retried`, async ({ page }) => {
    await page.setViewportSize(input === 'touch' ? { width: 390, height: 844 } : { width: 1280, height: 720 });
    await blockGoogleTTS(page);
    await page.addInitScript(() => {
      localStorage.setItem('alefbet.editor.nikud-match', JSON.stringify({
        id: 'nikud-match', version: 1, meta: { type: 'drag-match' },
        rounds: [{ id: 'a', target: 'ב', correct: 'kamatz', correctEmoji: '' }],
      }));
    });
    await page.goto(GAME_URL);
    const letter = page.locator('.nm-arena .nm-letter');
    await expect(letter).toBeVisible();
    await letter.evaluate(el => Promise.all(el.getAnimations().map(animation => animation.finished)));
    const touch = input === 'touch' ? await page.context().newCDPSession(page) : null;
    const move = async (type, x, y) => {
      if (touch) {
        await touch.send('Input.dispatchTouchEvent', {
          type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }],
        });
      } else {
        if (type !== 'touchEnd') await page.mouse.move(x, y);
        if (type === 'touchStart') await page.mouse.down();
        if (type === 'touchEnd') await page.mouse.up();
      }
    };
    for (const correct of [false, true]) {
      const source = await letter.boundingBox();
      const target = await page.locator(correct ? '.nm-zone[data-nikud="kamatz"]' : '.nm-zone:not([data-nikud="kamatz"])').boundingBox();
      if (!source || !target) throw new Error('Missing drag source or target');
      await move('touchStart', source.x + source.width / 2, source.y + source.height / 2);
      const x = target.x + target.width / 2;
      const y = target.y + target.height / 2;
      await move('touchMove', x, y);
      const clone = page.locator('body > .nm-letter[aria-hidden="true"]');
      await expect(clone).toBeVisible();
      await expect.poll(async () => {
        const box = await clone.boundingBox();
        return box ? Math.hypot(box.x + box.width / 2 - x, box.y + box.height / 2 - y) : Infinity;
      }).toBeLessThan(2);
      await move('touchEnd', x, y);
      await expect(clone).toHaveCount(0);
      if (!correct) {
        await expect(page.locator('.nm-status')).toHaveText('נַסּוּ אֶת הַנִּיקּוּד הָאַחֵר');
        await expect(letter).toHaveAttribute('aria-pressed', 'false');
        await letter.evaluate(el => Promise.all(el.getAnimations().map(animation => animation.finished)));
      }
    }
    await expect(page.locator('.completion-screen')).toBeVisible();
    await touch?.detach();
  });
}
