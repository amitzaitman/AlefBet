/**
 * מנוע ניקוד אוטומטי — Dicta Nakdan
 * מוסיף ניקוד לטקסט עברי דרך ה-API של Dicta
 * [נוסף על ידי: nikud support]
 *
 * שימוש:
 *   await preloadNikud(['שלום עולם', 'מצא את החיה']);
 *   const text = getNikud('שלום עולם');  // סינכרוני — מהמטמון
 *   const text = await addNikud('שלום');  // אסינכרוני
 */

const NAKDAN_URL = 'https://nakdan-u1-0.loadbalancer.dicta.org.il/api';
let _nakdanDisabledNoticeShown = false;

const _cache = new Map();

function _resolveNakdanUrl() {
  if (typeof window === 'undefined') return NAKDAN_URL;

  const queryProxy = new URLSearchParams(window.location.search).get('nakdanProxy');
  const globalProxy = window.ALEFBET_NAKDAN_PROXY_URL;
  if (queryProxy && window.localStorage) {
    try { window.localStorage.setItem('alefbet.nakdanProxyUrl', queryProxy); } catch {}
  }
  const storageProxy = window.localStorage?.getItem('alefbet.nakdanProxyUrl');
  const proxyUrl = queryProxy || globalProxy || storageProxy;

  if (proxyUrl) return proxyUrl;

  // Dicta blocks browser CORS on GitHub Pages; use proxy there.
  if (window.location.hostname.endsWith('github.io')) return null;

  return NAKDAN_URL;
}

/** המר תגובת Nakdan API לטקסט עם ניקוד */
function _parseResponse(tokens) {
  let result = '';
  for (const token of tokens) {
    if (token.sep) {
      result += token.str ?? '';
    } else {
      const opts = token.nakdan?.options;
      if (opts?.length) {
        // opts[0].w = המילה עם ניקוד; | = גבול מורפמי, U+05BD = מתג — יש להסיר
        result += (opts[0].w ?? '').replace(/\|/g, '').replace(/\u05BD/g, '');
      } else {
        result += token.str ?? '';
      }
    }
  }
  return result;
}

/** קרא ל-API לניקוד טקסט יחיד */
async function _fetchNikud(text) {
  const nakdanUrl = _resolveNakdanUrl();
  if (!nakdanUrl) {
    if (!_nakdanDisabledNoticeShown) {
      _nakdanDisabledNoticeShown = true;
      console.warn('[nakdan] Dicta API blocked by CORS on GitHub Pages. Configure a proxy URL via ?nakdanProxy=..., window.ALEFBET_NAKDAN_PROXY_URL, or localStorage key alefbet.nakdanProxyUrl.');
    }
    throw new Error('Nakdan unavailable without proxy on this host');
  }

  const resp = await fetch(nakdanUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      addmorph: true,
      keepmetagim: false,
      keepqq: false,
      nodageshdefmem: false,
      patachma: false,
      task: 'nakdan',
      data: text,
      useTokenization: true,
      genre: 'modern',
    }),
  });

  if (!resp.ok) throw new Error(`Nakdan ${resp.status}`);
  const json = await resp.json();
  const tokens = json?.data;
  if (!Array.isArray(tokens)) throw new Error('Nakdan: invalid response');
  return _parseResponse(tokens);
}

/**
 * הוסף ניקוד לטקסט (אסינכרוני, עם מטמון)
 * @param {string} text - טקסט עברי
 * @returns {Promise<string>} טקסט עם ניקוד
 */
export async function addNikud(text) {
  if (!text?.trim()) return text ?? '';
  if (_cache.has(text)) return _cache.get(text);

  try {
    const result = await _fetchNikud(text);
    _cache.set(text, result);
    return result;
  } catch {
    // שמור את הטקסט המקורי במטמון כדי למנוע קריאות חוזרות כושלות
    _cache.set(text, text);
    return text;
  }
}

/**
 * קבל ניקוד מהמטמון (סינכרוני)
 * מחזיר את הטקסט המנוקד אם נטען מראש, אחרת את הטקסט המקורי
 * @param {string} text
 * @returns {string}
 */
export function getNikud(text) {
  return _cache.get(text) ?? text ?? '';
}

/**
 * טעון ניקוד מראש לרשימת טקסטים (מקבילה)
 * יש לקרוא לפני תחילת המשחק
 * @param {string[]} texts
 * @returns {Promise<void>}
 */
export async function preloadNikud(texts) {
  const unique = [...new Set(texts.filter(t => t?.trim()))];
  await Promise.all(unique.map(t => addNikud(t)));
}