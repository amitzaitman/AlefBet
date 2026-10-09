import { expect } from '@playwright/test';
import { test } from './network-server.js';

test('hard refresh clears app cache, reattaches the worker and preserves personal data', async ({ page, network }) => {
  await page.goto(network.url);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  await page.evaluate(async () => {
    localStorage.setItem('alefbet.progress.v1', JSON.stringify({ 'fraction-picture': { bestStars: 2 } }));
    localStorage.setItem('alefbet.editor.test', 'saved-content');
    await new Promise((resolve, reject) => {
      const request = indexedDB.open('refresh-recording-test', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('audio');
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction('audio', 'readwrite');
        transaction.objectStore('audio').put('my-recording', 'sample');
        transaction.oncomplete = () => { db.close(); resolve(); };
        transaction.onerror = () => reject(transaction.error);
      };
    });
  });
  await page.getByText('להורים ולמורים', { exact: true }).click();
  await page.locator('#hard-refresh').click();
  await expect(page).toHaveURL(/\?refreshed=\d+$/, { timeout: 20_000 });
  await expect(page.locator('#subject-reading')).toBeVisible();
  await expect(page.locator('[data-game-id="fraction-picture"] .game-card__stars')).toHaveText('⭐⭐');
  const saved = await page.evaluate(async () => {
    const audio = await new Promise((resolve, reject) => {
      const request = indexedDB.open('refresh-recording-test', 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const read = db.transaction('audio').objectStore('audio').get('sample');
        read.onsuccess = () => { db.close(); resolve(read.result); };
      };
    });
    return { audio, content: localStorage.getItem('alefbet.editor.test') };
  });
  expect(saved).toEqual({ audio: 'my-recording', content: 'saved-content' });
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  await network.offline(page);
  await page.reload();
  await expect(page.locator('#subject-math')).toBeVisible();
});

test('hard refresh removes obsolete app files and keeps caches of other apps', async ({ page, network }) => {
  await page.goto(network.url);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  await page.evaluate(async () => {
    const names = await caches.keys();
    const cache = await caches.open(names.find(name => name.startsWith('alefbet-release-')));
    await cache.put('/old-cache-marker', new Response('obsolete'));
    await (await caches.open('another-app')).put('/other', new Response('keep'));
  });
  // Playwright's WebKit drops cache entries written by a page once the top-level page
  // navigates to any page served from the network, even with no app code involved.
  // Running the real recovery page in a frame keeps this check about the refresh itself.
  await page.evaluate(() => {
    const frame = document.createElement('iframe');
    frame.src = 'refresh.html';
    document.body.append(frame);
  });
  await expect.poll(() => page.frames().some(frame => /\?refreshed=\d+$/.test(frame.url())), { timeout: 20_000 }).toBe(true);
  expect(await page.evaluate(async () => ({
    obsolete: !!await caches.match('/old-cache-marker'),
    unrelated: !!await caches.match('/other'),
  }))).toEqual({ obsolete: false, unrelated: true });
});

test('hard refresh reports missing network without clearing the working offline cache', async ({ page, network }) => {
  await page.goto(network.url);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await network.offline(page);
  const names = await page.evaluate(() => caches.keys());
  await page.getByText('להורים ולמורים', { exact: true }).click();
  await page.locator('#hard-refresh').click();
  await expect(page.locator('#refresh-status')).toContainText('המטמון לא נוקה', { timeout: 10_000 });
  await expect(page.locator('#hard-refresh')).toBeEnabled();
  expect(await page.evaluate(() => caches.keys())).toEqual(names);
  await page.reload();
  await expect(page.locator('#subject-reading')).toBeVisible();
});
