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

test.beforeEach(({ browserName }) => test.skip(browserName !== 'webkit', 'WebKit-only probe'));

test('probe 4: full refresh page flow (reference)', async ({ page, network, browserName }) => {
  const log = logger(page, browserName, 'full-flow');
  await setup(page, network, log);
  await page.goto(`${network.url}/refresh.html`);
  await page.waitForURL(/\?refreshed=\d+$/, { timeout: 30000 });
  await log('after-refresh');
});

test('probe 5: visit a network page that does nothing, then come back', async ({ page, network, browserName }) => {
  const log = logger(page, browserName, 'network-page');
  await setup(page, network, log);
  await page.goto(`${network.url}/__probe-network-page__`);
  await log('on-network-page');
  await page.goto(network.url);
  await log('back-home');
});

test('probe 6: same as 5 but leave through location.assign like the real button', async ({ page, network, browserName }) => {
  const log = logger(page, browserName, 'network-page-assign');
  await setup(page, network, log);
  await page.evaluate(() => location.assign('/__probe-network-page__'));
  await page.waitForURL(/__probe-network-page__/);
  await log('on-network-page');
});

test('probe 7: visit another cached game page', async ({ page, network, browserName }) => {
  const log = logger(page, browserName, 'asset-page');
  await setup(page, network, log);
  await page.goto(`${network.url}/games/make-ten/`);
  await log('on-asset-page');
});

test('probe 8: run every refresh.html step inside the home page, without navigating', async ({ page, network, browserName }) => {
  const log = logger(page, browserName, 'in-page-steps');
  await setup(page, network, log);
  const reply = await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' });
    await registration.update();
    const worker = registration.waiting || registration.active;
    return new Promise(resolve => {
      const channel = new MessageChannel();
      channel.port1.onmessage = event => resolve(event.data);
      worker.postMessage({ type: 'refresh-assets' }, [channel.port2]);
      setTimeout(() => resolve('timeout'), 30000);
    });
  });
  console.log(`PROBE ${browserName} in-page-steps reply ${JSON.stringify(reply)}`);
  await log('after-steps');
});

test('probe 9: full flow, but wait 2s after writing before leaving', async ({ page, network, browserName }) => {
  const log = logger(page, browserName, 'full-flow-delay');
  await setup(page, network, log);
  await page.waitForTimeout(2000);
  await page.goto(`${network.url}/refresh.html`);
  await page.waitForURL(/\?refreshed=\d+$/, { timeout: 30000 });
  await log('after-refresh');
});
