import { expect } from '@playwright/test';
import { test } from './network-server.js';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const worker = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');

test('an interrupted update preserves offline play; a complete update waits for old tabs', async ({ page, context, network }) => {
  let version = 1;
  let interrupted = false;
  network.respondWith((req, res) => {
    const html = '<!doctype html><script src="/app.js"></script>';
    const app = `document.documentElement.dataset.version = '${version}';`;
    const assets = { './': html, './index.html': html, './app.js': app };
    const manifest = { version: `test-${version}`, core: Object.keys(assets), assets: Object.fromEntries(
      Object.entries(assets).map(([path, body]) => [path, createHash('sha256').update(body).digest('hex')]),
    ) };
    const path = req.url.split('?')[0];
    const content = path === '/sw.js' ? worker
      : path === '/framework/dist/release-manifest.js' ? `self.ALEFBET_RELEASE = ${JSON.stringify(manifest)};`
      : assets[`.${path}`];
    res.writeHead(content === undefined || (interrupted && path === '/app.js') ? 503 : 200, {
      'Content-Type': path.endsWith('.js') ? 'application/javascript' : 'text/html',
      'Cache-Control': 'no-store',
    });
    res.end(content ?? 'unavailable');
  });
  await page.goto(network.url);
  await page.evaluate(async () => {
    await navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' });
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-version', '1');
  version = 2;
  interrupted = true;
  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    const finished = new Promise(resolve => registration.addEventListener('updatefound', () => {
      const worker = registration.installing;
      worker.addEventListener('statechange', () => {
        if (worker.state === 'redundant') resolve();
      });
    }, { once: true }));
    await registration.update();
    await finished;
  });
  await network.offline(page);
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-version', '1');
  interrupted = false;
  await network.online(page);
  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    await registration.update();
  });
  await expect.poll(() => page.evaluate(async () => !!(await navigator.serviceWorker.getRegistration()).waiting)).toBe(true);
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-version', '1');
  await page.close();
  const next = await context.newPage();
  await next.goto(network.url);
  await expect(next.locator('html')).toHaveAttribute('data-version', '2');
  await network.offline(next);
  await next.reload();
  await expect(next.locator('html')).toHaveAttribute('data-version', '2');
});
