import { test as base, expect } from '@playwright/test';
import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { probeInBrowser } from './network-probe.js';

/** One isolated origin per test; offline transitions and cleanup have one owner. */
export const test = base.extend({
  network: async ({ baseURL, context, browserName }, use) => {
    let disconnected = false;
    let handler;
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
        if (handler) await handler(req, res);
        else {
          const response = await fetch(new URL(req.url, baseURL), { signal: controller.signal });
          res.writeHead(response.status, {
            'Content-Type': response.headers.get('content-type') ?? 'application/octet-stream',
          });
          res.end(Buffer.from(await response.arrayBuffer()));
        }
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
    try {
      await use({
        url,
        respondWith: customHandler => { handler = customHandler; },
        async offline(page) {
          // Verify the probe works first, so a broken endpoint cannot pass as offline.
          await waitFor(page, 'online');
          disconnected = true;
          cutConnections();
          // WebKit's automation offline override prevents cached navigations.
          if (browserName !== 'webkit') await context.setOffline(true);
          await waitFor(page, 'network-error');
        },
        async online(page) {
          disconnected = false;
          if (browserName !== 'webkit') await context.setOffline(false);
          await waitFor(page, 'online');
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
