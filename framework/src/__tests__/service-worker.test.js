// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash, webcrypto } from 'node:crypto';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../../../sw.js', import.meta.url), 'utf8');
const origin = 'https://example.test/AlefBet/';
const hash = body => createHash('sha256').update(body).digest('hex');

function storage() {
  const stores = new Map();
  return {
    stores,
    keys: async () => [...stores.keys()],
    delete: async key => stores.delete(key),
    open: async key => {
      if (!stores.has(key)) stores.set(key, new Map());
      const entries = stores.get(key);
      return {
        put: async (url, response) => entries.set(url, response.clone()),
        match: async url => entries.get(url)?.clone(),
        keys: async () => [...entries.keys()].map(url => new Request(url)),
        delete: async request => entries.delete(request.url),
      };
    },
  };
}

function worker(caches, version, network) {
  const handlers = {};
  const release = {
    version, core: ['./', './app.js'],
    assets: { './': hash('home'), './app.js': hash(version), './editor.js': hash(`editor-${version}`) },
  };
  const self = {
    ALEFBET_RELEASE: release, location: { href: `${origin}sw.js` },
    addEventListener: (name, fn) => { handlers[name] = fn; },
    skipWaiting: vi.fn(), clients: { claim: vi.fn() },
  };
  runInNewContext(source, {
    self, caches, crypto: webcrypto, URL, Request, Response, AbortController, setTimeout, clearTimeout,
    importScripts: () => {}, fetch: async req => {
      const body = network.get(req.url);
      if (body === undefined) throw new Error('offline');
      return new Response(body);
    },
  });
  return {
    self,
    refresh: () => new Promise((resolve, reject) => handlers.message({
      data: { type: 'refresh-assets' },
      ports: [{ postMessage: resolve, close() {} }],
      waitUntil: promise => promise.catch(reject),
    })),
    lifecycle: name => new Promise((resolve, reject) => handlers[name]({
      waitUntil: promise => promise.then(resolve, reject),
    })),
    request: async path => {
      let result;
      handlers.fetch({ request: new Request(`${origin}${path}`), respondWith: value => { result = value; } });
      return result;
    },
  };
}

describe('release updates', () => {
  it('refreshes poisoned assets and removes stale entries without touching unrelated caches', async () => {
    const caches = storage();
    const network = new Map([[origin, 'home'], [`${origin}app.js`, 'v1'], [`${origin}editor.js`, 'editor-v1']]);
    const active = worker(caches, 'v1', network);
    await active.lifecycle('install');
    const cache = await caches.open('alefbet-release-v1');
    await cache.put(`${origin}app.js`, new Response('poisoned'));
    await cache.put(`${origin}stale`, new Response('old'));
    await (await caches.open('unrelated')).put('https://example.test/other', new Response('keep'));
    expect(await active.refresh()).toEqual({ ok: true });
    expect(await (await active.request('app.js')).text()).toBe('v1');
    expect(await cache.match(`${origin}stale`)).toBeUndefined();
    expect(await caches.keys()).toContain('unrelated');
    expect(active.self.skipWaiting).toHaveBeenCalledOnce();
  });

  it('keeps working offline assets when a full refresh fails integrity checks', async () => {
    const caches = storage();
    const network = new Map([[origin, 'home'], [`${origin}app.js`, 'v1'], [`${origin}editor.js`, 'wrong-release']]);
    const active = worker(caches, 'v1', network);
    await active.lifecycle('install');
    expect(await active.refresh()).toEqual({ ok: false });
    network.clear();
    expect(await (await active.request('app.js')).text()).toBe('v1');
    expect(active.self.skipWaiting).not.toHaveBeenCalled();
  });

  it('serves anchored home links offline without changing the cached asset identity', async () => {
    const caches = storage();
    const network = new Map([[origin, 'home'], [`${origin}app.js`, 'v1']]);
    const active = worker(caches, 'v1', network);
    await active.lifecycle('install');
    network.clear();
    for (const path of ['#subject-math', '?source=home#subject-reading']) {
      const response = await active.request(path);
      expect(response).toBeDefined();
      expect(await response.text()).toBe('home');
    }
    expect(await active.request('not-cached#subject-math')).toBeUndefined();
  });

  it('retains the working cache after an interrupted upgrade, then activates a complete release', async () => {
    const caches = storage();
    const network = new Map([[origin, 'home'], [`${origin}app.js`, 'v1']]);
    const old = worker(caches, 'v1', network);
    await old.lifecycle('install');
    network.delete(`${origin}app.js`);
    const next = worker(caches, 'v2', network);
    await expect(next.lifecycle('install')).rejects.toThrow('Incomplete');
    expect(await caches.keys()).toEqual(['alefbet-release-v1']);
    expect(await (await old.request('app.js')).text()).toBe('v1');
    network.set(`${origin}app.js`, 'v2');
    await next.lifecycle('install');
    expect(next.self.skipWaiting).not.toHaveBeenCalled();
    expect(await (await old.request('app.js')).text()).toBe('v1');
    await next.lifecycle('activate');
    expect(await caches.keys()).toEqual(['alefbet-release-v2']);
    expect(await (await next.request('app.js')).text()).toBe('v2');
  });

  it('rejects mixed deployment files and does not cache a newer optional editor in an old release', async () => {
    const caches = storage();
    const network = new Map([[origin, 'home'], [`${origin}app.js`, 'v1'], [`${origin}editor.js`, 'editor-v2']]);
    const old = worker(caches, 'v1', network);
    await old.lifecycle('install');
    expect((await old.request('editor.js')).type).toBe('error');
    const next = worker(caches, 'v2', network);
    await expect(next.lifecycle('install')).rejects.toThrow('Incomplete');
    expect(await caches.keys()).toEqual(['alefbet-release-v1']);
  });
});
