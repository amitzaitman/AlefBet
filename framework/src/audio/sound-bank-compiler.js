/**
 * מהדר בנק הצלילים - "קימפול" חד-פעמי של קולות מחשב אל המכשיר.
 *
 * במקום להשתמש בשירות TTS חיצוני בזמן משחק (תלות רשת, fallback שקט),
 * המורה מריצה קימפול פעם אחת: כל צליל סטנדרטי (אות/ניקוד/הברה) מורד
 * כקובץ שמע דרך ה-proxy של הפרויקט ונשמר ב-IndexedDB. מרגע זה כל
 * המשחקים מנגנים מהבנק המקומי - אפס תעבורת רשת בזמן ריצה.
 *
 * אין כשל שקט: התוצאה מפרטת אילו מפתחות הצליחו ואילו נכשלו ולמה,
 * וכשה-proxy לא מוגדר נזרקת שגיאה ברורה במקום לדלג בשקט.
 *
 * API ציבורי:
 *   resolveTtsProxyUrl() - כתובת שירות הקולות או null אם לא הוגדרה.
 *   compileTextForKey(key) - איזה טקסט יוקרא עבור מפתח בנק (טהור, לבדיקות).
 *   compileSoundBank(opts) - הורדת כל הצלילים החסרים אל הבנק.
 */
import { SOUND_BANK_ID, standardSoundKeys } from './hebrew-audio.js';
import { saveVoice, listVoiceKeys } from './voice-store.js';
import { getLetter } from '../data/hebrew-letters.js';
import { nikudList, letterWithNikud } from '../data/nikud.js';

/** מפתח localStorage לכתובת שירות הקולות. */
const PROXY_STORAGE_KEY = 'alefbet.ttsProxyUrl';

/**
 * כתובת שירות הקולות (ה-worker של הפרויקט), לפי סדר עדיפות:
 * פרמטר ?ttsProxy= בכתובת (נשמר ל-localStorage), משתנה גלובלי
 * window.ALEFBET_TTS_PROXY_URL, localStorage, או גזירה מכתובת ה-proxy
 * של הנקדן (אותו worker משרת את שני המסלולים).
 * @returns {string | null} כתובת בסיס ללא סלאש סופי, או null אם אין.
 */
export function resolveTtsProxyUrl() {
  if (typeof window === 'undefined') return null;

  const queryProxy = new URLSearchParams(window.location.search).get('ttsProxy');
  if (queryProxy && window.localStorage) {
    try { window.localStorage.setItem(PROXY_STORAGE_KEY, queryProxy); } catch { /* noop */ }
  }
  const globalProxy = /** @type {any} */ (window).ALEFBET_TTS_PROXY_URL;
  const storageProxy = window.localStorage?.getItem(PROXY_STORAGE_KEY);
  const nakdanProxy = window.localStorage?.getItem('alefbet.nakdanProxyUrl');

  const base = queryProxy || globalProxy || storageProxy || nakdanProxy;
  if (!base) return null;
  return String(base).replace(/\/+$/, '');
}

/**
 * הטקסט שיוקרא עבור מפתח בנק סטנדרטי. פונקציה טהורה.
 * @param {string} key - מפתח בנק ('letter:ב', 'nikud:kamatz', 'syllable:ב:kamatz', 'word:...')
 * @returns {string | null} הטקסט להקראה, או null למפתח לא מוכר.
 */
export function compileTextForKey(key) {
  const [kind, a, b] = key.split(':');
  if (kind === 'letter') {
    const data = getLetter(a);
    return data ? data.nameNikud : null;
  }
  if (kind === 'nikud') {
    const nikud = nikudList.find(n => n.id === a);
    return nikud ? nikud.sound : null;
  }
  if (kind === 'syllable') {
    const nikud = nikudList.find(n => n.id === b);
    return nikud ? letterWithNikud(a, nikud.symbol) : null;
  }
  if (kind === 'word') {
    return key.slice('word:'.length) || null;
  }
  return null;
}

/**
 * מוריד קובץ שמע יחיד מה-proxy. זורק על כל כשל.
 * @param {string} baseUrl
 * @param {string} text
 * @returns {Promise<Blob>}
 */
async function _fetchAudio(baseUrl, text) {
  const resp = await fetch(`${baseUrl}/tts?text=${encodeURIComponent(text)}&lang=he`);
  if (!resp.ok) throw new Error(`tts-proxy ${resp.status}`);
  const blob = await resp.blob();
  if (!blob || blob.size === 0) throw new Error('empty-audio');
  return blob;
}

/**
 * @typedef {object} CompileResult
 * @property {number} total - כמה מפתחות נסרקו
 * @property {number} compiled - כמה קבצים הורדו ונשמרו עכשיו
 * @property {number} skipped - כמה דולגו כי כבר קיימים בבנק
 * @property {{ key: string, reason: string }[]} failures - כשלים מפורטים
 */

/**
 * מוריד את כל הצלילים הסטנדרטיים החסרים אל בנק הצלילים.
 *
 * מפתחות שכבר קיימים בבנק (הקלטת מורה או קימפול קודם) לא נדרסים -
 * אלא אם force=true. כשלים לא עוצרים את הריצה ולא נבלעים: הם חוזרים
 * ברשימת failures כדי שהממשק יציג אותם.
 *
 * @param {object} [opts]
 * @param {boolean} [opts.force] - דרוס גם צלילים קיימים
 * @param {string[]} [opts.extraTexts] - משפטים חופשיים לקימפול כ-word keys
 * @param {(done: number, total: number, key: string) => void} [opts.onProgress]
 * @returns {Promise<CompileResult>}
 */
export async function compileSoundBank({ force = false, extraTexts = [], onProgress } = {}) {
  const baseUrl = resolveTtsProxyUrl();
  if (!baseUrl) {
    throw new Error('tts-proxy-not-configured: הגדירו כתובת דרך ?ttsProxy=... או window.ALEFBET_TTS_PROXY_URL');
  }
  if (typeof indexedDB === 'undefined') {
    throw new Error('indexeddb-unavailable: אין אחסון מקומי לשמירת הצלילים');
  }

  const targets = [
    ...standardSoundKeys().map(k => k.key),
    ...extraTexts.filter(t => t?.trim()).map(t => `word:${t}`),
  ];

  const existing = new Set(force ? [] : await listVoiceKeys(SOUND_BANK_ID).catch(() => []));

  /** @type {CompileResult} */
  const result = { total: targets.length, compiled: 0, skipped: 0, failures: [] };
  let done = 0;

  for (const key of targets) {
    done++;
    if (existing.has(key)) {
      result.skipped++;
      onProgress?.(done, targets.length, key);
      continue;
    }
    const text = compileTextForKey(key);
    if (!text) {
      result.failures.push({ key, reason: 'unknown-key' });
      onProgress?.(done, targets.length, key);
      continue;
    }
    try {
      const blob = await _fetchAudio(baseUrl, text);
      await saveVoice(SOUND_BANK_ID, key, blob);
      result.compiled++;
    } catch (err) {
      result.failures.push({ key, reason: err?.message || 'fetch-failed' });
    }
    onProgress?.(done, targets.length, key);
  }

  return result;
}
