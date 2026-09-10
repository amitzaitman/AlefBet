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
    const names = await caches.keys();
    const cache = await caches.open(names.find(name => name.startsWith('alefbet-release-')));
    await cache.put('/old-cache-marker', new Response('obsolete'));
    await (await caches.open('another-app')).put('/other', new Response('keep'));
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
    return {
      audio, content: localStorage.getItem('alefbet.editor.test'),
      obsolete: !!await caches.match('/old-cache-marker'),
      unrelated: !!await caches.match('/other'),
    };
  });
  expect(saved).toEqual({ audio: 'my-recording', content: 'saved-content', obsolete: false, unrelated: true });
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  await network.offline(page);
  await page.reload();
  await expect(page.locator('#subject-math')).toBeVisible();
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
