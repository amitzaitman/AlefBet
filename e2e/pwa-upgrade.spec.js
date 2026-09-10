import { test, expect } from '@playwright/test';
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const worker = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');

test('an interrupted update preserves offline play; a complete update waits for old tabs', async ({ page, context, browserName }) => {
  let version = 1;
  let interrupted = false;
  let disconnected = false;
  const server = createServer((req, res) => {
    if (disconnected) { req.socket.destroy(); return; }
    // Each outage should break requests, not leave reusable half-closed sockets.
    res.setHeader('Connection', 'close');
    if (req.url.startsWith('/network-probe?')) {
      res.writeHead(200, { 'Content-Type': 'text/plain', 'Cache-Control': 'no-store' });
      res.end(req.url);
      return;
    }
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
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${server.address().port}`;
  try {
    await page.goto(url);
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
    disconnected = true;
    // The server outage also reaches worker requests; WebKit's offline override breaks navigation.
    if (browserName !== 'webkit') await context.setOffline(true);
    expect(await page.evaluate(() => fetch('/network-probe', { cache: 'no-store' }).then(() => false, () => true))).toBe(true);
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-version', '1');
    if (browserName !== 'webkit') await context.setOffline(false);
    disconnected = false;
    interrupted = false;
    // WebKit can keep a failed request pending while its network process recovers.
    // Use a fresh URL for each attempt, abort stalled probes and require a real
    // response from this origin. A timeout must never count as restored connectivity.
    let probe = 0;
    await expect.poll(() => page.evaluate(async path => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 1500);
      try {
        const response = await fetch(path, { cache: 'no-store', signal: controller.signal });
        return response.ok && await response.text() === path;
      } catch {
        return false;
      } finally {
        clearTimeout(timer);
      }
    }, `/network-probe?reconnect=${++probe}`), {
      message: 'The browser must receive a fresh response after the origin reconnects',
      timeout: 10_000,
    }).toBe(true);
    await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.getRegistration();
      await registration.update();
    });
    await expect.poll(() => page.evaluate(async () => !!(await navigator.serviceWorker.getRegistration()).waiting)).toBe(true);
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-version', '1');
    await page.close();
    const next = await context.newPage();
    await next.goto(url);
    await expect(next.locator('html')).toHaveAttribute('data-version', '2');
    disconnected = true;
    if (browserName !== 'webkit') await context.setOffline(true);
    expect(await next.evaluate(() => fetch('/network-probe', { cache: 'no-store' }).then(() => false, () => true))).toBe(true);
    await next.reload();
    await expect(next.locator('html')).toHaveAttribute('data-version', '2');
  } finally {
    if (browserName !== 'webkit') await context.setOffline(false);
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
});
