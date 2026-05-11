/**
 * מנוע קריאת טקסט עברי עמיד.
 *
 * המנוע משתמש ב-Google Translate TTS לאיכות גבוהה יותר עם נפילה
 * ל-Web Speech API כגיבוי. קיימת מכונת מצבים שמדווחת על אירועים
 * (`alefbet:tts-state` ו-`alefbet:tts-error`) ב-window כדי שמשחקים
 * יוכלו להציג באנר תמיכה לילד ולא להישאר תקועים.
 *
 * מצבים: idle | ready | awaiting-interaction | unsupported | failed.
 * הבטחות תמיד נפתרות (גם בכשל) כדי שמשחק לא יתקע על המתנה לקול.
 */
import { getNikud } from '../utils/nakdan.js';
import { nikudList } from '../data/nikud.js';

/** טיים-אאוט להמתנה לטעינת קולות עבריים מהדפדפן (במילישניות). */
const VOICE_LOAD_TIMEOUT_MS = 2000;

/**
 * תור הדיבור. כל פריט יכול לכלול:
 * - `rate`: קצב ספציפי לפריט (משמש את `speakNikud`/`speakVowel`).
 * - `keepNikud`: לא להסיר ניקוד לפני שליחה ל-Google. דרוש להגיית הברה
 *   בודדת (`מַ`) כי בלי הניקוד Google חוזר לשם האות ("mem") במקום לצליל.
 * @type {{ text: string, resolve: () => void, rate?: number, keepNikud?: boolean }[]}
 */
let _queue = [];
let _speaking = false;
let _useGoogleTTS = true;
let _rate = 0.9;
let _nikudRate = (typeof localStorage !== 'undefined' && parseFloat(localStorage.getItem('alefbet.nikudRate'))) || 0.5;
let _interactionReady = false;
/** @type {Promise<void> | null} */
let _interactionPromise = null;

/** @type {{ resolve: () => void } | null} פריט שכרגע "במעוף" - נשמר כדי ש-cancel יוכל לפתור אותו. */
let _activeItem = null;
/** @type {any} אובייקט Audio של גוגל שכרגע מתנגן (אם יש). */
let _activeAudio = null;
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
 * מחזיר true אם יש לפחות יכולת קול אחת זמינה (Web Speech או Audio).
 */
function _probeCapability() {
  const hasSynth = typeof speechSynthesis !== 'undefined';
  const hasAudio = typeof Audio !== 'undefined';
  return hasSynth || hasAudio;
}

/**
 * מחזיר true אם יש לפחות ספק קול שאפשר להשתמש בו עכשיו -
 * synth זמין, או Google מופעל ו-Audio זמין.
 */
function _hasUsableProvider() {
  const hasSynth = typeof speechSynthesis !== 'undefined';
  const hasAudio = typeof Audio !== 'undefined';
  return hasSynth || (_useGoogleTTS && hasAudio);
}

/**
 * שולח אירוע `alefbet:tts-state` ב-window ומעדכן את המצב הפנימי.
 * אינו שולח אם המצב לא השתנה (de-dup).
 * @param {'idle' | 'ready' | 'awaiting-interaction' | 'unsupported' | 'failed'} next
 * @param {string} [reason]
 */
function _setState(next, reason) {
  if (_state === next) return;
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
 * אתחול ראשוני של מכונת המצבים. אם אין אף יכולת קול - נכנסים ל-unsupported
 * ופולטים אירוע. אחרת המצב נשאר idle (ללא אירוע).
 */
function _bootstrapState() {
  const capable = _probeCapability();
  if (!capable) {
    _setState('unsupported', 'no-audio-capability');
  } else {
    _state = 'idle';
  }
}

_bootstrapState();

// ── דיווח שגיאות ──────────────────────────────────────────────────────────

/**
 * שולח אירוע `alefbet:tts-error` עם פרטי הכשל.
 * @param {'google' | 'browser'} provider
 * @param {string} text
 * @param {string} reason
 * @param {string} [sentText]
 */
function _reportTTSFailure(provider, text, reason, sentText = text) {
  _lastError = String(reason || 'unknown');
  console.warn(`[tts] ${provider} TTS failed`, { text, sentText, reason });
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(new CustomEvent('alefbet:tts-error', {
      detail: { provider, text, sentText, reason },
    }));
  }
}

// ── עזרי טקסט וזיהוי autoplay ─────────────────────────────────────────────

function _stripNikud(text) {
  return (text || '').replace(/[֑-ׇ]/g, '');
}

function _isInteractionBlockedReason(reason) {
  const msg = String(reason || '').toLowerCase();
  return msg.includes("didn't interact") || msg.includes('notallowed') || msg.includes('user gesture');
}

/**
 * מחזיר Promise שנפתר על האינטראקציה הראשונה של המשתמש (pointer/touch/key).
 * אם המשתמש כבר התעניין - הפתרון מיידי.
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

// ── Google Translate TTS ──────────────────────────────────────────────────

/**
 * מנגן את ה-Audio של גוגל. שומר רפרנס פעיל ב-_activeAudio.
 * @param {string} text
 * @param {() => void} resolve
 * @param {(reason: string) => void} fail
 */
function _playGoogleAudio(text, resolve, fail) {
  const encoded = encodeURIComponent(text);
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=he&client=tw-ob`;
  const audio = new Audio(url);
  _activeAudio = audio;
  audio.playbackRate = _rate;
  audio.onended = () => {
    if (_activeAudio === audio) _activeAudio = null;
    resolve();
  };
  audio.onerror = () => {
    if (_activeAudio === audio) _activeAudio = null;
    fail('audio.onerror');
  };
  const playResult = audio.play();
  if (playResult && typeof playResult.catch === 'function') {
    playResult.catch((err) => {
      fail(err?.message || err?.name || 'audio.play() rejected');
    });
  }
}

/**
 * מנסה להשמיע ב-Google. דוחה אם אין Audio זמין או אם ההפעלה נכשלה
 * (אחרי טיפול ב-NotAllowedError ו-retry פעם אחת על אינטראקציה).
 * @param {string} text
 * @param {{ keepNikud?: boolean }} [opts]
 */
function _googleSpeak(text, opts = {}) {
  return new Promise((resolve, reject) => {
    if (typeof Audio === 'undefined') {
      reject(new Error('Audio constructor unavailable'));
      return;
    }
    // הסרת ניקוד היא הגנה ברירת מחדל לטקסטים ארוכים. עבור הברה בודדת בניקוד
    // (speakNikud) חייבים לשמור את הניקוד כי בלעדיו Google חוזר לשם האות.
    const textForGoogle = opts.keepNikud ? text : (_stripNikud(text).trim() || text);
    let settled = false;
    let retriedAfterInteraction = false;

    const resolveOnce = () => {
      if (settled) return;
      settled = true;
      resolve();
    };

    const rejectOnce = (reason) => {
      if (settled) return;
      settled = true;
      reject(reason instanceof Error ? reason : new Error(String(reason)));
    };

    const startPlay = () => {
      try {
        _playGoogleAudio(textForGoogle, resolveOnce, (reason) => {
          if (!retriedAfterInteraction && _isInteractionBlockedReason(reason)) {
            retriedAfterInteraction = true;
            // Emit awaiting-interaction exactly once per blocked attempt — the test asserts a SINGLE event.
            if (!_awaitingInteractionEmitted) {
              _awaitingInteractionEmitted = true;
              _setState('awaiting-interaction', 'autoplay-blocked');
            }
            _waitForFirstInteraction().then(() => {
              _awaitingInteractionEmitted = false;
              if (!settled) startPlay();
            });
            return;
          }
          _reportTTSFailure('google', text, reason, textForGoogle);
          rejectOnce(reason);
        });
      } catch (err) {
        const reason = err?.message || 'Audio() construction failed';
        _reportTTSFailure('google', text, reason, textForGoogle);
        rejectOnce(reason);
      }
    };

    startPlay();
  });
}

// ── Browser Web Speech API (fallback) ─────────────────────────────────────

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
  return hebrew.find(_isFemaleHebrew) || hebrew[0];
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
        _reportTTSFailure('browser', '', 'voice-load-timeout');
      }
      finish();
    }, VOICE_LOAD_TIMEOUT_MS);
  }).finally(() => {
    _voicesReadyPromise = null;
  });

  return _voicesReadyPromise;
}

/**
 * מנגן ב-Web Speech API. דוחה אם אין speechSynthesis, או אם ה-utterance
 * נכשל (onerror) - כדי שהשרשרת תוכל לטפל בזה.
 * @param {string} text
 */
async function _browserSpeak(text) {
  if (typeof speechSynthesis === 'undefined') {
    throw new Error('speechSynthesis unavailable');
  }
  await _ensureVoicesReady();
  return new Promise((resolve, reject) => {
    try {
      if (typeof SpeechSynthesisUtterance === 'undefined') {
        reject(new Error('SpeechSynthesisUtterance unavailable'));
        return;
      }
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = 'he-IL';
      utt.rate = _rate;
      if (_hebrewVoice) utt.voice = _hebrewVoice;
      _activeUtterance = utt;
      utt.onend = () => {
        if (_activeUtterance === utt) _activeUtterance = null;
        resolve();
      };
      utt.onerror = (ev) => {
        if (_activeUtterance === utt) _activeUtterance = null;
        const reason = (ev && ev.error) || 'speech-error';
        _reportTTSFailure('browser', text, String(reason));
        reject(new Error(String(reason)));
      };
      speechSynthesis.speak(utt);
    } catch (err) {
      const reason = err?.message || 'browser-speak-threw';
      _reportTTSFailure('browser', text, reason);
      reject(err instanceof Error ? err : new Error(reason));
    }
  });
}

// ── Queue ─────────────────────────────────────────────────────────────────

/**
 * מנסה Google ואז דפדפן. מחזיר { ok: true } בהצלחה, או { ok: false, reason }
 * אם שני הספקים נכשלו. תמיד נפתר (לא דוחה).
 * @param {string} text
 * @param {{ keepNikud?: boolean }} [opts]
 * @returns {Promise<{ ok: boolean, reason?: string }>}
 */
async function _speakWithFallback(text, opts = {}) {
  let lastReason = '';
  if (_useGoogleTTS && typeof Audio !== 'undefined') {
    try {
      await _googleSpeak(text, opts);
      return { ok: true };
    } catch (err) {
      lastReason = err?.message || 'google-failed';
      console.info('[tts] Falling back to browser Speech API');
    }
  }
  if (typeof speechSynthesis !== 'undefined') {
    try {
      await _browserSpeak(text);
      return { ok: true };
    } catch (err) {
      lastReason = err?.message || 'browser-failed';
    }
  } else if (!lastReason) {
    lastReason = 'no-provider';
  }
  return { ok: false, reason: lastReason };
}

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

  _speakWithFallback(item.text, { keepNikud: item.keepNikud === true }).then((result) => {
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
      // ב-unsupported כבר אין צורך לעבור - אבל המסלולים האמיתיים יחזירו ready.
      if (_state !== 'unsupported') {
        _setState('ready');
      }
    } else {
      // שני הספקים נכשלו (או שאין ספק זמין כלל).
      if (!_hasUsableProvider()) {
        _setState('unsupported', result.reason || 'no-provider');
      } else {
        _setState('failed', result.reason);
      }
    }
    item.resolve();
    _processQueue();
  }).catch((err) => {
    // הגנה: _speakWithFallback אמור לא לדחות אבל למקרה.
    if (hasRateOverride) _rate = previousRate;
    _speaking = false;
    _activeItem = null;
    _setState('failed', err?.message || 'unknown');
    item.resolve();
    _processQueue();
  });
}

/**
 * אובייקט ה-TTS הציבורי. כל המתודות שומרות תאימות אחורה ומוסיפות
 * `audioState`, `onStateChange`, `probe`.
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
   * - אם יש Audio של גוגל מנגן - הוא יושתק (pause + src='').
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

    if (_activeAudio) {
      try { _activeAudio.pause?.(); } catch { /* noop */ }
      try { _activeAudio.src = ''; } catch { /* noop */ }
      _activeAudio = null;
    }
    if (_activeUtterance) {
      _activeUtterance = null;
    }
    if (typeof speechSynthesis !== 'undefined' && typeof speechSynthesis.cancel === 'function') {
      try { speechSynthesis.cancel(); } catch { /* noop */ }
    }
    _setState('idle', 'cancelled');
  },

  /**
   * האם יש בכלל יכולת קול במכשיר. true אם יש speechSynthesis או Audio.
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

  /** השגיאה האחרונה שדווחה (provider/reason) או null אם לא הייתה. */
  get lastError() {
    return _lastError;
  },

  /**
   * משחרר ידנית את ה-audio context אחרי gesture ידוע (כפתור התחל וכו').
   * משחקים יקראו לזה במקום להמתין ל-autoplay block.
   * @returns {Promise<void>}
   */
  unlock() {
    _interactionReady = true;
    _awaitingInteractionEmitted = false;
    // Pre-warm both audio paths so the first real speak doesn't hit autoplay restrictions.
    if (typeof speechSynthesis !== 'undefined' && typeof SpeechSynthesisUtterance !== 'undefined') {
      try {
        const warmup = new SpeechSynthesisUtterance('');
        warmup.volume = 0;
        speechSynthesis.speak(warmup);
        speechSynthesis.cancel();
      } catch { /* noop */ }
    }
    if (typeof Audio !== 'undefined') {
      try {
        const a = new Audio();
        a.muted = true;
        const p = a.play?.();
        if (p && typeof p.catch === 'function') p.catch(() => {});
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
    const capable = _probeCapability();
    if (!capable) {
      _setState('unsupported', 'no-audio-capability');
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
   * השתמש ב-Google Translate TTS (ברירת מחדל) או רק בדפדפן.
   * @param {boolean} [enabled]
   */
  useGoogle(enabled = true) {
    _useGoogleTTS = enabled;
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
        // שלב 1: ההברה השלמה בקצב הרגיל; keepNikud=true כדי ש-Google יקבל
        // את הניקוד ויהגה הברה ולא שם אות. ה-resolve שלה noop כי המתקשר
        // מחכה רק לסיום השלב השני.
        _queue.push({ text: syllable, keepNikud: true, resolve: () => {} });
        // שלב 2: צליל התנועה בקצב האיטי - מאריך את התנועה.
        _queue.push({
          text: entry.sound,
          rate: _nikudRate,
          keepNikud: true,
          resolve: () => resolve(undefined),
        });
      } else {
        // אין נתון תנועה - הברה אחת בקצב טבעי.
        _queue.push({ text: syllable, keepNikud: true, resolve: () => resolve(undefined) });
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
        keepNikud: true,
        resolve: () => resolve(undefined),
      });
      _processQueue();
    });
  },
};
