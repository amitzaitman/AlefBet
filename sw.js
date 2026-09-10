/**
 * Each release owns an immutable cache. A failed installation leaves the
 * working release intact; updates wait until its open tabs are closed.
 */
importScripts('./framework/dist/release-manifest.js');

const release = self.ALEFBET_RELEASE;
const CACHE_VERSION = `alefbet-release-${release.version}`;
const absolute = path => new URL(path, self.location.href).href;
const assets = new Map(Object.entries(release.assets).map(([path, hash]) => [absolute(path), hash]));

async function fetchVerified(url, signal) {
  const response = await fetch(new Request(url, { cache: 'no-store', signal }));
  if (!response.ok) throw new Error(`Release asset unavailable: ${url}`);
  const bytes = await response.clone().arrayBuffer();
  const hash = [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))]
    .map(byte => byte.toString(16).padStart(2, '0')).join('');
  if (hash !== assets.get(url)) throw new Error(`Release asset changed: ${url}`);
  return response;
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_VERSION);
    // Wait for all writes before deleting a failed staging cache.
    const results = await Promise.allSettled(release.core.map(async path => {
      const url = absolute(path);
      await cache.put(url, await fetchVerified(url));
    }));
    if (results.some(result => result.status === 'rejected')) {
      await caches.delete(CACHE_VERSION);
      throw new Error('Incomplete offline release');
    }
    // No skipWaiting: existing pages must keep their original runtime.
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key.startsWith('alefbet-') && key !== CACHE_VERSION)
      .map(key => caches.delete(key)),
  )));
  // No clients.claim: do not change the release underneath an already loaded page.
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  url.search = '';
  // Section anchors identify a position within an asset, not a separate file.
  url.hash = '';
  if (!assets.has(url.href)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_VERSION);
    const cached = await cache.match(url.href);
    if (cached) return cached;
    try {
      const response = await fetchVerified(url.href);
      await cache.put(url.href, response.clone());
      return response;
    } catch {
      return Response.error();
    }
  })());
});

// The first page can open the editor before any worker controls that page.
// Cache it explicitly on demand without claiming or reloading that document.
self.addEventListener('message', event => {
  if (event.data?.type !== 'cache-editor') return;
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_VERSION);
    const core = new Set(release.core);
    await Promise.allSettled(Object.keys(release.assets).filter(path => !core.has(path)).map(async path => {
      const url = absolute(path);
      if (!await cache.match(url)) await cache.put(url, await fetchVerified(url));
    }));
  })());
});

// Explicit adult action: refresh verified assets without unregistering the worker.
// WebKit may discard unrelated CacheStorage entries when a registration is removed.
self.addEventListener('message', event => {
  if (event.data?.type !== 'refresh-assets' || !event.ports[0]) return;
  const port = event.ports[0];
  event.waitUntil((async () => {
    try {
      // Fetches initiated by the worker bypass its own cache-first handler.
      // Download everything before replacing anything, preserving offline play on failure.
      const entries = await Promise.all([...assets.keys()].map(async url => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 8000);
        try {
          const response = await fetchVerified(url, controller.signal);
          return [url, response];
        } finally { clearTimeout(timer); }
      }));
      const cache = await caches.open(CACHE_VERSION);
      for (const [url, response] of entries) await cache.put(url, response);
      for (const request of await cache.keys()) {
        if (!assets.has(request.url)) await cache.delete(request);
      }
      // Only a user-requested refresh activates an update while old tabs are open.
      await self.skipWaiting();
      port.postMessage({ ok: true });
    } catch {
      port.postMessage({ ok: false });
    } finally { port.close(); }
  })());
});
