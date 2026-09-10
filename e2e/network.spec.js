import { expect } from '@playwright/test';
import { test } from './network-server.js';

// Parallel cases exercise separate origins as well as repeated reconnects.
for (const marker of ['first', 'second']) {
  test(`network fixture isolates ${marker} origin and reconnects twice`, async ({ page, network }) => {
    network.respondWith((_req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`<html><body>${marker}</body></html>`);
    });
    await page.goto(network.url);
    for (let cycle = 0; cycle < 2; cycle++) {
      await network.offline(page);
      await network.online(page);
      await page.reload();
      await expect(page.locator('body')).toHaveText(marker);
    }
  });
}
