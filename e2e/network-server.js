import { test as base } from '@playwright/test';
import { createServer } from 'node:http';

/** A separate origin per test lets us cut network access without affecting other tests. */
export const test = base.extend({
  network: async ({ baseURL }, use) => {
    let disconnected = false;
    const server = createServer(async (req, res) => {
      if (disconnected) { req.socket.destroy(); return; }
      try {
        const response = await fetch(new URL(req.url, baseURL));
        res.writeHead(response.status, {
          'Content-Type': response.headers.get('content-type') ?? 'application/octet-stream',
          'Cache-Control': 'no-store',
        });
        res.end(Buffer.from(await response.arrayBuffer()));
      } catch { req.socket.destroy(); }
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    try {
      await use({
        url: `http://127.0.0.1:${server.address().port}`,
        disconnect: () => { disconnected = true; },
      });
    } finally {
      server.closeAllConnections();
      await new Promise(resolve => server.close(resolve));
    }
  },
});
