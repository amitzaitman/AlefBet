/**
 * Each release owns an immutable cache. A failed installation leaves the
 * working release intact; updates wait until its open tabs are closed.
 */
importScripts('./framework/dist/release-manifest.js');

const release = self.ALEFBET_RELEASE;
const CACHE_VERSION = `alefbet-release-${release.version}`;
const absolute = path => new URL(path, self.location.href).href;
const assets = new Map(Object.entries(release.assets).map(([path, hash]) => [absolute(path), hash]));

async function fetchVerified(url) {
  const response = await fetch(new Request(url, { cache: 'no-store' }));
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
