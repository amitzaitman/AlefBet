/**
 * AudioContext משותף + שחרור (unlock) ל-iOS/Safari.
 *
 * ב-iOS ה-AudioContext נולד במצב 'suspended' ואסור לו להתחיל לנגן אלא
 * מתוך מחוות משתמש; בנוסף, השמעת <audio> שלא בתוך מחווה נחסמת. לכן:
 * - כל מודולי השמע (sounds, phoneme-synth, voice-store) חולקים קונטקסט
 *   אחד שמשוחרר פעם אחת במחווה הראשונה (tts.unlock קורא לזה אוטומטית).
 * - השמעת הקלטות עוברת דרך Web Audio (decodeAudioData) ולא דרך אלמנט
 *   <audio> - אחרי השחרור זה עובד גם עמוק בתוך שרשראות async.
 *
 * API ציבורי:
 *   getAudioContext() - הקונטקסט המשותף (או null אם אין תמיכה).
 *   unlockAudioOutput() - לקרוא מתוך מחוות משתמש; משחרר את הקונטקסט.
 *   ensureAudioRunning() - מנסה resume; מחזיר את הקונטקסט רק אם הוא רץ.
 *   playBlob(blob) - נגינת blob דרך Web Audio; false אם אי אפשר.
 */

/** @type {AudioContext | null} */
let _ctx = null;

/**
 * הקונסטרקטור הזמין בדפדפן, או null.
 * @returns {typeof AudioContext | null}
 */
function _ctor() {
  if (typeof window === 'undefined') return null;
  return window.AudioContext || /** @type {any} */ (window).webkitAudioContext || null;
}

/**
 * הקונטקסט המשותף. נוצר בעצלנות; מחזיר null בסביבה ללא Web Audio.
 * @returns {AudioContext | null}
 */
export function getAudioContext() {
  const Ctor = _ctor();
  if (!Ctor) return null;
  if (!_ctx) {
    try { _ctx = new Ctor(); } catch { return null; }
  }
  return _ctx;
}

/**
 * שחרור השמע - חובה לקרוא מתוך מחוות משתמש (pointerdown/click) כדי
 * ש-iOS ירשה נגינה. בטוח לקריאה חוזרת. מנגן באפר-אפס קצרצר: זו הדרך
 * הקנונית לגרום ל-Safari לפתוח את ערוץ השמע לשארית הסשן.
 * @returns {Promise<boolean>} האם הקונטקסט רץ בסוף התהליך.
 */
export async function unlockAudioOutput() {
  const ctx = getAudioContext();
  if (!ctx) return false;
  try {
    if (ctx.state === 'suspended') await ctx.resume();
  } catch { /* noop */ }
  try {
    const buffer = ctx.createBuffer(1, 1, ctx.sampleRate || 44100);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
  } catch { /* noop */ }
  return ctx.state === 'running';
}

/**
 * מנסה להביא את הקונטקסט למצב רץ. מחזיר אותו רק אם הוא באמת רץ -
 * כך מסלולי סינתזה יכולים להיכשל בכנות במקום "לנגן" לתוך קונטקסט קפוא
 * (המצב שגרם לשקט מוחלט באייפון לפני המחווה הראשונה).
 * @returns {Promise<AudioContext | null>}
 */
export async function ensureAudioRunning() {
  const ctx = getAudioContext();
  if (!ctx) return null;
  if (ctx.state === 'suspended') {
    try { await ctx.resume(); } catch { /* noop */ }
  }
  return ctx.state === 'running' ? ctx : null;
}

/**
 * נגינת blob שמע דרך Web Audio. עמיד ל-iOS: אחרי unlock אחד, נגינה
 * דרך buffer source מותרת גם שלא בתוך מחווה (בניגוד לאלמנט <audio>).
 * @param {Blob} blob
 * @returns {Promise<boolean>} true אם נוגן עד סופו, false אם אי אפשר.
 */
/**
 * קריאת בייטים מ-blob: arrayBuffer כשקיים, אחרת FileReader (Safari ישן).
 * @param {Blob} blob
 * @returns {Promise<ArrayBuffer>}
 */
function _blobBytes(blob) {
  if (typeof blob.arrayBuffer === 'function') return blob.arrayBuffer();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(/** @type {ArrayBuffer} */ (reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });
}

/** @param {Blob} blob @param {{ signal?: AbortSignal }} [options] */
export async function playBlob(blob, { signal } = {}) {
  if (signal?.aborted || !blob) return false;
  const ctx = await ensureAudioRunning();
  if (signal?.aborted || !ctx || typeof ctx.decodeAudioData !== 'function') return false;
  let buffer;
  try {
    const bytes = await _blobBytes(blob);
    // חתימת promise של decodeAudioData; Safari ישן דורש callback - עטוף.
    buffer = await new Promise((resolve, reject) => {
      const maybe = ctx.decodeAudioData(bytes, resolve, reject);
      if (maybe && typeof maybe.then === 'function') maybe.then(resolve, reject);
    });
  } catch {
    return false;
  }
  if (signal?.aborted) return false;
  return new Promise((resolve) => {
    let source;
    let timer;
    let settled = false;
    const done = ok => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal?.removeEventListener('abort', abort);
      if (source) {
        source.onended = null;
        try { source.stop(); source.disconnect(); } catch { /* already stopped */ }
      }
      resolve(ok);
    };
    const abort = () => done(false);
    try {
      source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.onended = () => done(true);
      signal?.addEventListener('abort', abort, { once: true });
      timer = setTimeout(() => done(true), (buffer.duration + 0.5) * 1000);
      source.start(0);
    } catch {
      done(false);
    }
  });
}
