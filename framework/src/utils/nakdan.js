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

/** טיים-אאוט לבקשת ניקוד (במילישניות) - בלי זה מסך הטעינה נתקע אופליין. */
const FETCH_TIMEOUT_MS = 4000;

/** מפתח המטמון המתמיד ב-localStorage - "קימפול" חד-פעמי של ניקוד. */
const PERSIST_KEY = 'alefbet.nikudCache.v1';

/** תקרת רשומות במטמון המתמיד, למניעת תפיחת localStorage. */
const PERSIST_MAX_ENTRIES = 300;

const _cache = new Map();

// טען את המטמון המתמיד פעם אחת בעליית המודול: ניקוד שהושג פעם ברשת
// זמין מעכשיו גם אופליין לגמרי.
(function _loadPersistedCache() {
  if (typeof localStorage === 'undefined') return;
  try {
    const raw = localStorage.getItem(PERSIST_KEY);
    if (!raw) return;
    const entries = JSON.parse(raw);
    if (Array.isArray(entries)) {
      for (const [key, value] of entries) {
        if (typeof key === 'string' && typeof value === 'string') _cache.set(key, value);
      }
    }
  } catch { /* מטמון פגום - מתעלמים וממשיכים ריק */ }
})();

/** שמור את המטמון המתמיד (רק תוצאות אמיתיות, עד התקרה). */
function _persistCache() {
  if (typeof localStorage === 'undefined') return;
  try {
    const entries = [..._cache.entries()]
      .filter(([key, value]) => value !== key) // אל תשמור fallbackים של "אותו טקסט"
      .slice(-PERSIST_MAX_ENTRIES);
    localStorage.setItem(PERSIST_KEY, JSON.stringify(entries));
  } catch { /* localStorage מלא/חסום - המטמון בזיכרון עדיין עובד */ }
}

/**
 * האם הטקסט כבר מנוקד מספיק כדי לוותר על הרשת: אם לרוב המילים העבריות
 * יש כבר סימן ניקוד אחד לפחות - אין מה לבקש מדיקטה. כך משחקים שכל
 * הטקסטים שלהם מנוקדים מראש לא יוצרים אף בקשת רשת.
 * @param {string} text
 * @returns {boolean}
 */
export function isVowelized(text) {
  if (!text) return false;
  const words = text.split(/\s+/).filter(w => /[א-ת]/.test(w));
  if (words.length === 0) return true; // אין עברית - אין מה לנקד
  // סימני ניקוד: U+05B0-U+05BC, שין/שין שמאלית (U+05C1/2), קמץ קטן (U+05C7).
  // מתג (U+05BD) מוחרג בכוונה - הוא אסור במקורות הפרויקט.
  const vowelized = words.filter(w => /[\u05B0-\u05BC\u05C1\u05C2\u05C7]/.test(w));
  return vowelized.length / words.length >= 0.8;
}

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

  // טיים-אאוט קשיח: בלעדיו fetch תלוי-רשת יכול להחזיק את מסך הטעינה
  // של משחק שניות ארוכות במכשיר עם רשת גרועה.
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS) : null;

  let resp;
  try {
    resp = await fetch(nakdanUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller?.signal,
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
  } finally {
    if (timer) clearTimeout(timer);
  }

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

  // טקסט שכבר מנוקד לא צריך רשת בכלל - זה המסלול של כל המשחקים,
  // שמספקים את הטקסטים שלהם מנוקדים מראש.
  if (isVowelized(text)) {
    _cache.set(text, text);
    return text;
  }

  // אופליין מדווח - אל תנסה בכלל; הטקסט יוצג כפי שהוא, בלי המתנה.
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return text;
  }

  try {
    const result = await _fetchNikud(text);
    _cache.set(text, result);
    _persistCache();
    return result;
  } catch {
    // שמור את הטקסט המקורי במטמון בזיכרון כדי למנוע קריאות חוזרות כושלות
    // באותו סשן; לא נשמר ל-localStorage כדי שניסיון רענן יקרה בסשן הבא.
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