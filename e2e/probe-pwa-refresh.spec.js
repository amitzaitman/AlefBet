// Diagnostic only (branch diag-webkit-refresh): where does WebKit lose an unrelated cache?
import { test } from './network-server.js';

const snapshot = page => page.evaluate(async () => {
  const names = await caches.keys();
  const contents = {};
  for (const name of names) {
    const keys = await (await caches.open(name)).keys();
    contents[name.startsWith('alefbet-release-') ? 'alefbet-release-*' : name] = name.startsWith('alefbet-release-')
      ? `${keys.length} entries` : keys.map(request => new URL(request.url).pathname);
  }
  return {
    url: location.pathname + location.search,
    names: names.map(name => name.startsWith('alefbet-release-') ? 'alefbet-release-*' : name),
    contents,
    globalMatch: !!await caches.match('/other'),
    globalMatchAbsolute: !!await caches.match(new URL('/other', location.href).href),
    directMatch: await caches.has('another-app') ? !!await (await caches.open('another-app')).match('/other') : 'no cache',
    controlled: !!navigator.serviceWorker.controller,
  };
});

async function setup(page, network, log) {
  await page.goto(network.url);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await page.evaluate(async () => {
    await (await caches.open('another-app')).put('/other', new Response('keep'));
  });
  await log('after-put');
}

const logger = (page, browserName, probe) => async step => {
  console.log(`PROBE ${browserName} ${probe} ${step} ${JSON.stringify(await snapshot(page))}`);
};

test('probe 1: reload and navigation only', async ({ page, network, browserName }) => {
  const log = logger(page, browserName, 'reload-only');
  await setup(page, network, log);
  await page.reload();
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await log('after-reload');
  await page.goto(`${network.url}/?refreshed=1`);
  await log('after-goto-query');
});

test('probe 2: register with updateViaCache none and update', async ({ page, network, browserName }) => {
  const log = logger(page, browserName, 'register-update');
  await setup(page, network, log);
  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' });
    await registration.update();
  });
  await log('after-update');
  await page.reload();
  await log('after-reload');
});

test('probe 3: refresh-assets message only', async ({ page, network, browserName }) => {
  const log = logger(page, browserName, 'refresh-message');
  await setup(page, network, log);
  const reply = await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    return new Promise(resolve => {
      const channel = new MessageChannel();
      channel.port1.onmessage = event => resolve(event.data);
      registration.active.postMessage({ type: 'refresh-assets' }, [channel.port2]);
      setTimeout(() => resolve('timeout'), 30000);
    });
  });
  console.log(`PROBE ${browserName} refresh-message reply ${JSON.stringify(reply)}`);
  await log('after-message');
  await page.reload();
  await log('after-reload');
});

test('probe 4: full refresh page flow', async ({ page, network, browserName }) => {
  const log = logger(page, browserName, 'full-flow');
  await setup(page, network, log);
  await page.goto(`${network.url}/refresh.html`);
  await page.waitForURL(/\?refreshed=\d+$/, { timeout: 30000 });
  await log('after-refresh');
});
