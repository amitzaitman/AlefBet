// @ts-check
import { test, expect, noVoice, targetNikud } from './network-server.js';

const GAME_URL = '/games/nikud-match/';

async function blockGoogleTTS(page) {
  await page.route('**/translate.google.com/**', route => route.abort());
  await page.route('**/translate_tts**', route => route.abort());
}

test('keyboard play, the settings button, the demonstration and the no-voice banner', async ({ page }) => {
  // The syllable spoken after a correct answer has no voice, so the audio banner must show.
  await noVoice(page);
  await page.goto(GAME_URL);
  // The game adds its own settings button to the adult menu.
  const adultMenu = page.getByText('למבוגרים', { exact: true });
  const settings = page.getByRole('button', { name: 'הגדרות', exact: true });
  await adultMenu.click();
  await expect(settings).toBeVisible();
  await adultMenu.click();
  await expect(settings).toBeHidden();
  await page.locator('.nm-help').click();
  await expect(page.locator('.nm-demo')).toHaveCount(1);
  const letter = page.locator('.nm-arena .nm-letter');
  await letter.focus();
  await page.keyboard.press('Space');
  await expect(letter).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.nm-demo')).toHaveCount(0);
  await page.locator(`.nm-zone[data-nikud="${await targetNikud(page)}"]`).focus();
  const banner = page.locator('#alefbet-audio-status-banner');
  await expect(banner).toBeHidden();
  await page.keyboard.press('Enter');
  await expect(page.locator('.progress-bar__label')).toHaveText('1 / 8');
  await expect(banner).toBeVisible();
  await expect(banner).toContainText('הַקּוֹל אֵינוֹ זָמִין');
});

for (const input of ['mouse', 'touch']) {
  test(`drag preview follows real ${input} input and a wrong drop can be retried`, async ({ page }) => {
    await page.setViewportSize(input === 'touch' ? { width: 390, height: 844 } : { width: 1280, height: 720 });
    await blockGoogleTTS(page);
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
    const nikud = await targetNikud(page);
    for (const correct of [false, true]) {
      const source = await letter.boundingBox();
      const target = await page.locator(correct ? `.nm-zone[data-nikud="${nikud}"]` : `.nm-zone:not([data-nikud="${nikud}"])`).boundingBox();
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
    await expect(page.locator('.progress-bar__label')).toHaveText('1 / 8');
    await touch?.detach();
  });
}
