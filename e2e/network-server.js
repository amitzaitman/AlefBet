import { test as base, expect } from '@playwright/test';
import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { probeInBrowser } from './network-probe.js';

export { expect };

/**
 * The shared browser-test module. Specs import `test` and `expect` from here.
 * - `activate` taps on phone projects and clicks elsewhere.
 * - `network` gives each test one isolated origin; offline transitions and cleanup have one owner.
 */
export const test = base.extend({
  activate: async ({ isMobile }, use) => {
    await use(locator => (isMobile ? locator.tap() : locator.click()));
  },
  network: async ({ baseURL, context, browserName }, use) => {
    let disconnected = false;
    const pending = new Set();
    const server = createServer(async (req, res) => {
      if (disconnected) { req.socket.destroy(); return; }
      res.setHeader('Connection', 'close');
      res.setHeader('Cache-Control', 'no-store');
      if (req.url.startsWith('/network-probe?')) {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(req.url);
        return;
      }
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);
      pending.add(controller);
      const abort = () => controller.abort();
      res.on('close', abort);
      try {
        const response = await fetch(new URL(req.url, baseURL), { signal: controller.signal });
        res.writeHead(response.status, {
          'Content-Type': response.headers.get('content-type') ?? 'application/octet-stream',
        });
        res.end(Buffer.from(await response.arrayBuffer()));
      } catch { req.socket.destroy(); }
      finally {
        clearTimeout(timer);
        res.off('close', abort);
        pending.delete(controller);
      }
    });
    await new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', resolve);
    });
    const url = `http://127.0.0.1:${server.address().port}`;
    const cutConnections = () => {
      for (const controller of pending) controller.abort();
      server.closeAllConnections();
    };
    const waitFor = async (page, expected) => {
      expect(new URL(page.url()).origin, 'Use network.url before changing network state').toBe(url);
      await expect.poll(() => page.evaluate(probeInBrowser, `${url}/network-probe?nonce=${randomUUID()}`), {
        message: `Network transition at ${url}: expected ${expected}; timeout is not proof of connectivity`,
        timeout: 10_000,
      }).toBe(expected);
    };
    /**
     * Takes the test's origin off the network. Requires an active service worker for the page,
     * because going offline here is how a test proves cached play. A test that needs network
     * loss without a service worker should get its own method, not a weaker check here.
     * @param {import('@playwright/test').Page} page
     */
    const offline = async page => {
      // Bounded: a failed install (for example a stale release manifest) never activates.
      await expect.poll(() => page.evaluate(async () => !!(await navigator.serviceWorker.getRegistration())?.active), {
        message: 'Service worker did not activate (stale release manifest? run npm run build)',
        timeout: 10_000,
      }).toBe(true);
      // Verify the probe works first, so a broken endpoint cannot pass as offline.
      await waitFor(page, 'online');
      disconnected = true;
      cutConnections();
      // WebKit's automation offline override prevents cached navigations.
      if (browserName !== 'webkit') await context.setOffline(true);
      await waitFor(page, 'network-error');
    };
    try {
      await use({
        url,
        offline,
        /**
         * Goes offline, reloads, and waits until the service worker controls the page again.
         * @param {import('@playwright/test').Page} page
         */
        async reloadOffline(page) {
          await offline(page);
          await page.reload();
          await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
        },
      });
    } finally {
      try {
        if (browserName !== 'webkit') await context.setOffline(false);
      } finally {
        cutConnections();
        await new Promise(resolve => server.close(resolve));
      }
    }
  },
});

/**
 * Takes the system voice away before the page loads. With `offline`, the page also
 * reports no network and every request outside the local test servers fails.
 * @param {import('@playwright/test').Page} page
 * @param {{ offline?: boolean }} [options]
 */
export async function noVoice(page, { offline = false } = {}) {
  await page.addInitScript(offlineDevice => {
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, get: () => undefined });
    if (offlineDevice) Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => false });
  }, offline);
  if (offline) await page.route(/^https?:\/\/(?!localhost|127\.0\.0\.1)/, route => route.abort());
}

/**
 * Every element the locator matches is a target a child can hit: at least `min` pixels each way.
 * @param {import('@playwright/test').Locator} locator
 * @param {number} [min]
 */
export async function expectTouchTargets(locator, min = 64) {
  for (const target of await locator.all()) {
    const box = await target.boundingBox();
    expect(box.width).toBeGreaterThanOrEqual(min);
    expect(box.height).toBeGreaterThanOrEqual(min);
  }
}

/**
 * The nikud on nikud-match's letter, read from the screen with the game's own nikud list.
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<string>}
 */
export function targetNikud(page) {
  return page.evaluate(async () => {
    const { nikudList } = await import('/framework/dist/runtime.js');
    const text = document.querySelector('.nm-arena .nm-letter').textContent;
    const shown = [...document.querySelectorAll('.nm-zone')].map(zone => zone.dataset.nikud);
    return nikudList.find(n => shown.includes(n.id) && text.includes(n.symbol)).id;
  });
}
