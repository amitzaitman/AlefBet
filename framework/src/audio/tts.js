/**
 * מנוע קריאת טקסט עברי מקומי (Web Speech API בלבד).
 *
 * אין כאן אף ספק רשת: קול המערכת (speechSynthesis) הוא הספק היחיד.
 * הקלטות מורה וסינתזת פונמות אופליין נמצאות מעליו בשרשרת של
 * hebrew-audio.js, ומילוי חד-פעמי של בנק הצלילים דרך הרשת נעשה
 * ב-sound-bank-compiler.js - כך שבזמן משחק לא יוצאת אף בקשת רשת.
 *
 * מכונת מצבים מדווחת אירועים (`alefbet:tts-state` ו-`alefbet:tts-error`)
 * ב-window כדי שמשחקים יציגו באנר ברור ולא ייכשלו בשקט.
 * מצבים: idle | ready | awaiting-interaction | unsupported | failed.
 * הבטחות תמיד נפתרות (גם בכשל) כדי שמשחק לא יתקע על המתנה לקול.
 */
import { getNikud } from '../utils/nakdan.js';
import { nikudList } from '../data/nikud.js';
import { unlockAudioOutput } from './audio-context.js';

/** טיים-אאוט להמתנה לטעינת קולות עבריים מהדפדפן (במילישניות). */
const VOICE_LOAD_TIMEOUT_MS = 2000;

/**
 * תור הדיבור. כל פריט יכול לכלול:
 * - `rate`: קצב ספציפי לפריט (משמש את `speakNikud`/`speakVowel`).
 * @type {{ text: string, resolve: () => void, rate?: number }[]}
 */
let _queue = [];
let _speaking = false;
let _rate = 0.9;
let _nikudRate = (typeof localStorage !== 'undefined' && parseFloat(localStorage.getItem('alefbet.nikudRate'))) || 0.5;
let _interactionReady = false;
/** @type {Promise<void> | null} */
let _interactionPromise = null;

/** @type {{ resolve: () => void } | null} פריט שכרגע "במעוף" - נשמר כדי ש-cancel יוכל לפתור אותו. */
let _activeItem = null;
/** @type {SpeechSynthesisUtterance | null} ה-utterance של הדפדפן שכרגע מנוגן. */
let _activeUtterance = null;

/** @type {string | null} השגיאה האחרונה שדווחה (לשימוש משחקים שצריכים להציג באנר). */
let _lastError = null;
/** סימון שכבר פלטנו אירוע awaiting-interaction עבור הניסיון הנוכחי - מונע ספאם. */
let _awaitingInteractionEmitted = false;

// ── מכונת מצבים ────────────────────────────────────────────────────────────

/** @type {'idle' | 'ready' | 'awaiting-interaction' | 'unsupported' | 'failed'} */
let _state = 'idle';

/**
 * מחזיר true אם יכולת הקול המקומית קיימת (Web Speech API).
 */
function _probeCapability() {
  return typeof speechSynthesis !== 'undefined';
}

/**
 * שולח אירוע `alefbet:tts-state` ב-window ומעדכן את המצב הפנימי.
 * אינו שולח אם המצב לא השתנה (de-dup), אלא אם force=true - נדרש כדי
 * שכל ניסיון דיבור כושל יידווח לבאנר גם כשהמצב כבר 'unsupported'/'failed'
 * (אחרת הכשל היה שקט: האירוע הראשון נורה בטעינת המודול, לפני שיש מאזין).
 * @param {'idle' | 'ready' | 'awaiting-interaction' | 'unsupported' | 'failed'} next
 * @param {string} [reason]
 * @param {boolean} [force]
 */
function _setState(next, reason, force = false) {
  if (_state === next && !force) return;
  const previousState = _state;
  _state = next;
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    /** @type {{ state: string, previousState: string, reason?: string }} */
    const detail = { state: next, previousState };
    if (reason) detail.reason = reason;
    window.dispatchEvent(new CustomEvent('alefbet:tts-state', { detail }));
  }
}

/**
 * אתחול ראשוני של מכונת המצבים. אם אין יכולת קול - נכנסים ל-unsupported
 * ופולטים אירוע. אחרת המצב נשאר idle (ללא אירוע).
 */
function _bootstrapState() {
  if (!_probeCapability()) {
    _setState('unsupported', 'no-speech-synthesis');
  } else {
    _state = 'idle';
  }
}

_bootstrapState();

// ── דיווח שגיאות ──────────────────────────────────────────────────────────

/**
 * שולח אירוע `alefbet:tts-error` עם פרטי הכשל.
 * @param {string} text
 * @param {string} reason
 */
function _reportTTSFailure(text, reason) {
  _lastError = String(reason || 'unknown');
  console.warn('[tts] browser TTS failed', { text, reason });
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(new CustomEvent('alefbet:tts-error', {
      detail: { provider: 'browser', text, sentText: text, reason },
    }));
  }
}

// ── זיהוי חסימת autoplay והמתנה לאינטראקציה ──────────────────────────────

function _isInteractionBlockedReason(reason) {
  const msg = String(reason || '').toLowerCase();
  return msg.includes('not-allowed') || msg.includes('notallowed') || msg.includes("didn't interact") || msg.includes('user gesture');
}

/**
 * מחזיר Promise שנפתר על האינטראקציה הראשונה של המשתמש (pointer/touch/key).
 * אם המשתמש כבר קיים אינטראקציה - הפתרון מיידי.
 */
function _waitForFirstInteraction() {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.resolve();
  }
  if (_interactionReady || document.userActivation?.hasBeenActive) {
    _interactionReady = true;
    return Promise.resolve();
  }
  if (_interactionPromise) return _interactionPromise;

  _interactionPromise = new Promise((resolve) => {
    const done = () => {
      _interactionReady = true;
      window.removeEventListener('pointerdown', done, true);
      window.removeEventListener('keydown', done, true);
      window.removeEventListener('touchstart', done, true);
      resolve();
    };
    window.addEventListener('pointerdown', done, { once: true, capture: true });
    window.addEventListener('keydown', done, { once: true, capture: true });
    window.addEventListener('touchstart', done, { once: true, capture: true });
  }).finally(() => {
    _interactionPromise = null;
  });

  return _interactionPromise;
}

// ── Web Speech API ────────────────────────────────────────────────────────

/** @type {SpeechSynthesisVoice | null} */
let _hebrewVoice = null;
/** @type {Promise<void> | null} ההמתנה הנוכחית לטעינת קולות (משותפת בין speak-ים). */
let _voicesReadyPromise = null;
let _voicesResolved = false;
let _voiceTimeoutWarned = false;

// קולות עבריים נשיים ידועים ברחבי מערכות הפעלה נפוצות (macOS Carmit,
// Windows Hila, Google he-IL). ננסה להתאים תחילה קול נשי כדי להדמות
// מורה/מבוגרת שמדברת אל הילד.
const FEMALE_HEBREW_VOICES = ['carmit', 'hila', 'female'];

function _isFemaleHebrew(voice) {
  const name = (voice.name || '').toLowerCase();
  return FEMALE_HEBREW_VOICES.some(f => name.includes(f));
}

function _findHebrewVoice() {
  if (typeof speechSynthesis === 'undefined') return null;
  const voices = speechSynthesis.getVoices();
  const hebrew = voices.filter(v =>
    v.lang === 'he-IL' || v.lang === 'iw-IL' || (v.lang || '').startsWith('he')
  );
  if (hebrew.length === 0) return null;
  // כשאין רשת - קול רשת (localService=false, כמו Google he-IL ב-Chrome)
  // ייכשל או ייתקע; מעדיפים קול שמותקן במכשיר.
  const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
  const pool = offline ? (hebrew.filter(v => v.localService !== false) || hebrew) : hebrew;
  const usable = pool.length > 0 ? pool : hebrew;
  return usable.find(_isFemaleHebrew) || usable[0];
}

/**
 * מבטיח שהקולות נטענו (עד טיים-אאוט). נקרא בכל speak ולא רק פעם אחת.
 * אם הקולות לא הגיעו תוך VOICE_LOAD_TIMEOUT_MS - יורה אירוע אזהרה ומתקדם
 * עם הקול ברירת המחדל של ה-OS.
 * @returns {Promise<void>}
 */
function _ensureVoicesReady() {
  if (typeof speechSynthesis === 'undefined') return Promise.resolve();
  // אם כבר יש לנו קול עברי - אין צורך לחכות.
  _hebrewVoice = _findHebrewVoice();
  if (_hebrewVoice) {
    _voicesResolved = true;
    return Promise.resolve();
  }
  if (_voicesResolved) return Promise.resolve();
  if (_voicesReadyPromise) return _voicesReadyPromise;

  _voicesReadyPromise = new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      _voicesResolved = true;
      _hebrewVoice = _findHebrewVoice();
      if (typeof speechSynthesis !== 'undefined' && typeof speechSynthesis.removeEventListener === 'function') {
        speechSynthesis.removeEventListener('voiceschanged', onVoices);
      }
      clearTimeout(timer);
      resolve();
    };
    const onVoices = () => {
      _hebrewVoice = _findHebrewVoice();
      if (_hebrewVoice) finish();
      // אחרת חכה לטיים-אאוט.
    };
    if (typeof speechSynthesis.addEventListener === 'function') {
      speechSynthesis.addEventListener('voiceschanged', onVoices);
    }
    const timer = setTimeout(() => {
      if (!_voiceTimeoutWarned) {
        _voiceTimeoutWarned = true;
        _reportTTSFailure('', 'voice-load-timeout');
      }
      finish();
    }, VOICE_LOAD_TIMEOUT_MS);
  }).finally(() => {
    _voicesReadyPromise = null;
  });

  return _voicesReadyPromise;
}

/**
 * גבול זמן קשיח ל-utterance: קול רשת של הדפדפן (למשל Google he-IL
 * ב-Chrome) עלול אופליין לא לירות לא onend ולא onerror - בלי watchdog
 * ההבטחה הייתה נתקעת לנצח והמשחק איתה.
 * @param {string} text
 * @returns {number} מילישניות
 */
function _utteranceWatchdogMs(text) {
  return 5000 + (text?.length ?? 0) * 200;
}

/**
 * מנגן utterance יחיד ב-Web Speech API. דוחה על כשל או על watchdog.
 * @param {string} text
 * @returns {Promise<void>}
 */
function _speakUtterance(text) {
  return new Promise((resolve, reject) => {
    if (typeof SpeechSynthesisUtterance === 'undefined') {
      reject(new Error('SpeechSynthesisUtterance unavailable'));
      return;
    }
    try {
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = 'he-IL';
      utt.rate = _rate;
      if (_hebrewVoice) utt.voice = _hebrewVoice;
      _activeUtterance = utt;
      let settled = false;
      const watchdog = setTimeout(() => {
        if (settled) return;
        settled = true;
        if (_activeUtterance === utt) _activeUtterance = null;
        try { speechSynthesis.cancel(); } catch { /* noop */ }
        reject(new Error('utterance-timeout'));
      }, _utteranceWatchdogMs(text));
      utt.onend = () => {
        if (settled) return;
        settled = true;
        clearTimeout(watchdog);
        if (_activeUtterance === utt) _activeUtterance = null;
        resolve();
      };
      utt.onerror = (ev) => {
        if (settled) return;
        settled = true;
        clearTimeout(watchdog);
        if (_activeUtterance === utt) _activeUtterance = null;
        reject(new Error(String((ev && ev.error) || 'speech-error')));
      };
      speechSynthesis.speak(utt);
    } catch (err) {
      reject(err instanceof Error ? err : new Error(String(err)));
    }
  });
}

/**
 * מנגן ב-Web Speech API עם טיפול בחסימת autoplay: אם ההשמעה נחסמה כי
 * המשתמש עוד לא נגע בדף - עוברים ל-awaiting-interaction, ממתינים למגע
 * הראשון ומנסים שוב פעם אחת.
 * @param {string} text
 * @returns {Promise<{ ok: boolean, reason?: string }>} תמיד נפתר.
 */
async function _browserSpeak(text) {
  if (typeof speechSynthesis === 'undefined') {
    return { ok: false, reason: 'speechSynthesis unavailable' };
  }
  await _ensureVoicesReady();
  try {
    await _speakUtterance(text);
    _awaitingInteractionEmitted = false;
    return { ok: true };
  } catch (err) {
    const reason = err?.message || 'speech-error';
    if (_isInteractionBlockedReason(reason)) {
      if (!_awaitingInteractionEmitted) {
        _awaitingInteractionEmitted = true;
        _setState('awaiting-interaction', 'autoplay-blocked');
      }
      await _waitForFirstInteraction();
      _awaitingInteractionEmitted = false;
      try {
        await _speakUtterance(text);
        return { ok: true };
      } catch (retryErr) {
        const retryReason = retryErr?.message || 'speech-error';
        _reportTTSFailure(text, retryReason);
        return { ok: false, reason: retryReason };
      }
    }
    _reportTTSFailure(text, reason);
    return { ok: false, reason };
  }
}

// ── Queue ─────────────────────────────────────────────────────────────────

function _processQueue() {
  if (_speaking || _queue.length === 0) return;
  const item = _queue.shift();
  _speaking = true;
  _activeItem = item;

  // קצב לכל פריט: שומרים את הגלובלי, דורסים בזמן ההשמעה, ומחזירים אחרי שהפריט
  // סיים - כך ש-speakNikud יכול לתור הברה בקצב טבעי ואחריה תנועה איטית
  // בלי לגרור את הגלובלי לכל המתקשרים האחרים.
  const previousRate = _rate;
  const hasRateOverride = typeof item.rate === 'number';
  if (hasRateOverride) _rate = item.rate;

  _browserSpeak(item.text).then((result) => {
    if (hasRateOverride) _rate = previousRate;
    _speaking = false;
    const wasActive = _activeItem === item;
    _activeItem = null;
    if (!wasActive) {
      // המשתמש קרא ל-cancel: ה-resolve כבר רץ, וה-state כבר idle.
      _processQueue();
      return;
    }
    if (result.ok) {
      if (_state !== 'unsupported') {
        _setState('ready');
      }
    } else {
      // force=true: מדווחים על כל כשל השמעה, גם אם המצב לא השתנה -
      // כך משחק שנטען אחרי אירוע ה-unsupported הראשוני עדיין מציג באנר.
      if (!_probeCapability()) {
        _setState('unsupported', result.reason || 'no-provider', true);
      } else {
        _setState('failed', result.reason, true);
      }
    }
    item.resolve();
    _processQueue();
  }).catch((err) => {
    // הגנה: _browserSpeak אמור לא לדחות אבל למקרה.
    if (hasRateOverride) _rate = previousRate;
    _speaking = false;
    _activeItem = null;
    _setState('failed', err?.message || 'unknown');
    item.resolve();
    _processQueue();
  });
}

/**
 * אובייקט ה-TTS הציבורי - ספק מקומי בלבד. אין קריאות רשת.
 */
export const tts = {
  /**
   * הקרא טקסט עברי. ה-promise תמיד נפתר (גם בכשל) כדי שמשחקים לא יתקעו.
   * @param {string} text
   * @returns {Promise<void>}
   */
  speak(text) {
    const toSpeak = getNikud(text);
    return new Promise(resolve => {
      _queue.push({ text: toSpeak, resolve });
      _processQueue();
    });
  },

  /**
   * עצור את כל הדיבור הנוכחי וניקה את התור.
   * - כל ה-promises שבתור נפתרים (לא נדחים).
   * - אם יש פריט "in-flight" - גם הוא נפתר.
   * - אם הדפדפן תומך - speechSynthesis.cancel() יקרא פעם אחת.
   * - המצב חוזר ל-idle.
   */
  cancel() {
    // פתור פריט פעיל (אם יש) - חשוב מבחינת הילד שמחכה ל-promise.
    if (_activeItem) {
      try { _activeItem.resolve(); } catch { /* noop */ }
      _activeItem = null;
    }
    _queue.forEach(item => { try { item.resolve(); } catch { /* noop */ } });
    _queue = [];
    _speaking = false;

    if (_activeUtterance) {
      _activeUtterance = null;
    }
    if (typeof speechSynthesis !== 'undefined' && typeof speechSynthesis.cancel === 'function') {
      try { speechSynthesis.cancel(); } catch { /* noop */ }
    }
    _setState('idle', 'cancelled');
  },

  /**
   * האם יש יכולת קול מקומית במכשיר.
   */
  get available() {
    return _state !== 'unsupported' && _probeCapability();
  },

  /** המצב הנוכחי של מנוע ה-TTS. */
  get audioState() {
    return _state;
  },

  /** Alias for audioState — some callers use `state`. */
  get state() {
    return _state;
  },

  /** השגיאה האחרונה שדווחה או null אם לא הייתה. */
  get lastError() {
    return _lastError;
  },

  /**
   * משחרר ידנית את מנוע הקול אחרי gesture ידוע (כפתור התחל וכו').
   * משחקים יקראו לזה במקום להמתין ל-autoplay block.
   * @returns {Promise<void>}
   */
  unlock() {
    _interactionReady = true;
    _awaitingInteractionEmitted = false;
    // שחרור ה-AudioContext המשותף (סינתזה, אפקטים, נגינת הקלטות) - קריטי
    // ל-iOS, שם הקונטקסט קפוא עד מחוות משתמש. כל המשחקים קוראים unlock
    // במחווה הראשונה, כך שכל מסלולי השמע משתחררים בבת אחת.
    unlockAudioOutput().catch(() => {});
    // Pre-warm the speech engine so the first real speak doesn't hit autoplay restrictions.
    if (typeof speechSynthesis !== 'undefined' && typeof SpeechSynthesisUtterance !== 'undefined') {
      try {
        const warmup = new SpeechSynthesisUtterance('');
        warmup.volume = 0;
        speechSynthesis.speak(warmup);
        speechSynthesis.cancel();
      } catch { /* noop */ }
    }
    if (_state === 'awaiting-interaction') {
      _setState('ready', 'unlocked');
    }
    return Promise.resolve();
  },

  /**
   * רושם handler לאירועי `alefbet:tts-state`. מחזיר פונקציית unsubscribe.
   * @param {(detail: { state: string, previousState: string, reason?: string }) => void} handler
   * @returns {() => void}
   */
  onStateChange(handler) {
    if (typeof window === 'undefined') return () => {};
    const listener = (e) => handler(/** @type {CustomEvent} */(e).detail);
    window.addEventListener('alefbet:tts-state', listener);
    return () => window.removeEventListener('alefbet:tts-state', listener);
  },

  /**
   * רושם handler לאירועי `alefbet:tts-error`. מחזיר פונקציית unsubscribe.
   * @param {(detail: { provider: string, text: string, sentText: string, reason: string }) => void} handler
   * @returns {() => void}
   */
  onError(handler) {
    if (typeof window === 'undefined') return () => {};
    const listener = (e) => handler(/** @type {CustomEvent} */(e).detail);
    window.addEventListener('alefbet:tts-error', listener);
    return () => window.removeEventListener('alefbet:tts-error', listener);
  },

  /**
   * סריקת יכולת מחודשת. מחזירה את הערך של `tts.available`. שימושית לבדיקות.
   */
  probe() {
    if (!_probeCapability()) {
      _setState('unsupported', 'no-speech-synthesis');
    } else if (_state === 'unsupported') {
      _setState('idle', 'recovered');
    }
    return this.available;
  },

  /**
   * הגדר מהירות דיבור (0.5-2.0).
   * @param {number} rate
   */
  setRate(rate) {
    _rate = Math.max(0.5, Math.min(2.0, rate));
  },

  /**
   * הגדר מהירות דיבור להדגשת ניקוד.
   * @param {{ rate?: number }} opts - rate: מהירות הדגשה (ברירת מחדל 0.5).
   */
  setNikudEmphasis({ rate } = {}) {
    if (rate != null) _nikudRate = Math.max(0.3, Math.min(1.5, rate));
  },

  /**
   * הקרא אות עם ניקוד בשני שלבים: קודם את ההברה בקצב טבעי כדי שהעיצור יהיה קצר,
   * ואז את צליל התנועה לבד בקצב האיטי שמיועד לניקוד - כך הילד שומע
   * "מ-אההההה" במקום "ממממ-אה" שמתקבל מהאטה אחידה של ההברה כולה.
   * @param {string} letter - האות (למשל 'ב').
   * @param {string} nikudSymbol - סמל הניקוד (למשל U+05B7).
   */
  speakNikud(letter, nikudSymbol) {
    const syllable = letter + nikudSymbol;
    const entry = nikudList.find(n => n.symbol === nikudSymbol);
    return new Promise(resolve => {
      if (entry && entry.sound) {
        // שלב 1: ההברה השלמה בקצב הרגיל. ה-resolve שלה noop כי המתקשר
        // מחכה רק לסיום השלב השני.
        _queue.push({ text: syllable, resolve: () => {} });
        // שלב 2: צליל התנועה בקצב האיטי - מאריך את התנועה.
        _queue.push({
          text: entry.sound,
          rate: _nikudRate,
          resolve: () => resolve(undefined),
        });
      } else {
        // אין נתון תנועה - הברה אחת בקצב טבעי.
        _queue.push({ text: syllable, resolve: () => resolve(undefined) });
      }
      _processQueue();
    });
  },

  /**
   * הקרא את צליל התנועה של הניקוד ("אָה", "אוֹ" וכו'),
   * כדי להדגים לילד מה להגות.
   * @param {string} nikudId - מזהה ניקוד מתוך nikudList (למשל 'kamatz').
   */
  speakVowel(nikudId) {
    const entry = nikudList.find(n => n.id === nikudId);
    if (!entry || !entry.sound) return Promise.resolve();
    return new Promise(resolve => {
      _queue.push({
        text: entry.sound,
        rate: _nikudRate,
        resolve: () => resolve(undefined),
      });
      _processQueue();
    });
  },
};
