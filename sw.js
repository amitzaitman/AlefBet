/**
 * AlefBet Service Worker - אופליין אמיתי לכל האתר.
 *
 * אסטרטגיה: stale-while-revalidate לכל בקשת GET באותו מקור -
 * עונים מיד מהמטמון (מהיר ועובד אופליין) ומרעננים ברקע. ביקור אחד
 * בכל עמוד מספיק כדי שהוא יעבוד לתמיד ללא רשת; ליבת האתר (דף הבית
 * וה-framework) נשמרת מראש כבר בהתקנה.
 *
 * החלפת גרסה: העלאת CACHE_VERSION מפנה מטמונים ישנים ב-activate.
 */

const CACHE_VERSION = 'alefbet-v1';

/** תיקיות המשחקים - בעת הוספת משחק חדש יש להוסיף אותו גם כאן. */
const GAMES = [
  'letter-match-animals',
  'nikud-match',
  'nikud-speak',
  'syllable-read',
  'sound-studio',
];

/**
 * כל האתר נשמר מראש כבר בהתקנה: ביקור יחיד בכל עמוד שהוא מספיק
 * כדי שכל המשחקים יעבדו אופליין - לא רק העמוד שביקרו בו.
 */
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './framework/dist/alefbet.js',
  './framework/dist/alefbet.css',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/apple-touch-icon.png',
  ...GAMES.flatMap(game => [
    `./games/${game}/`,
    `./games/${game}/index.html`,
    `./games/${game}/game.js`,
    `./games/${game}/game.css`,
  ]),
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(CORE_ASSETS))
      .catch(() => { /* התקנה חלקית עדיפה על כישלון התקנה */ })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // רק נכסים שלנו

  event.respondWith(
    caches.open(CACHE_VERSION).then(async (cache) => {
      const cached = await cache.match(request);
      const refresh = fetch(request)
        .then((response) => {
          if (response && response.ok) cache.put(request, response.clone());
          return response;
        })
        .catch(() => null);

      if (cached) {
        // stale-while-revalidate: עונים מהמטמון, הרענון רץ ברקע.
        refresh.catch(() => {});
        return cached;
      }

      const fresh = await refresh;
      if (fresh) return fresh;

      // אופליין ועמוד שלא בוקר בו: ניווט נופל לדף הבית שנשמר בהתקנה.
      if (request.mode === 'navigate') {
        const home = await cache.match('./index.html');
        if (home) return home;
      }
      return Response.error();
    })
  );
});
