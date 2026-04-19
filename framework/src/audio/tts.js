/**
 * מנוע קריאת טקסט עברי
 * משתמש ב-Google Translate TTS לאיכות גבוהה יותר
 * עם נפילה ל-Web Speech API כגיבוי
 */
import { getNikud } from '../utils/nakdan.js';
import { nikudList } from '../data/nikud.js';

let _queue = [];
let _speaking = false;
let _useGoogleTTS = true;
let _rate = 0.9;
let _nikudRate = (typeof localStorage !== 'undefined' && parseFloat(localStorage.getItem('alefbet.nikudRate'))) || 0.5;
let _interactionReady = false;
let _interactionPromise = null;

// ── Google Translate TTS ──────────────────────────────────────────────────

function _reportTTSFailure(provider, text, reason, sentText = text) {
  console.warn(`[tts] ${provider} TTS failed`, { text, sentText, reason });
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(new CustomEvent('alefbet:tts-error', {
      detail: { provider, text, sentText, reason },
    }));
  }
}

function _stripNikud(text) {
  return (text || '').replace(/[\u0591-\u05C7]/g, '');
}

function _isInteractionBlockedReason(reason) {
  const msg = String(reason || '').toLowerCase();
  return msg.includes("didn't interact") || msg.includes('notallowed');
}

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

function _playGoogleAudio(text, resolve, fail) {
  const encoded = encodeURIComponent(text);
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=he&client=tw-ob`;
  const audio = new Audio(url);
  audio.playbackRate = _rate;
  audio.onended = resolve;
  audio.onerror = () => fail('audio.onerror');
  audio.play().catch((err) => {
    fail(err?.message || 'audio.play() rejected');
  });
}

function _googleSpeak(text) {
  return new Promise((resolve, reject) => {
    const textForGoogle = _stripNikud(text).trim() || text;
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
      reject(reason);
    };

    const startPlay = () => {
      try {
        _playGoogleAudio(textForGoogle, resolveOnce, (reason) => {
          if (!retriedAfterInteraction && _isInteractionBlockedReason(reason)) {
            retriedAfterInteraction = true;
            _waitForFirstInteraction().then(() => {
              if (!settled) startPlay();
            });
            return;
          }
          _reportTTSFailure('google', text, reason, textForGoogle);
          rejectOnce(reason);
        });
      } catch (err) {
        _reportTTSFailure('google', text, err?.message || 'Audio() construction failed', textForGoogle);
        rejectOnce(err?.message);
      }
    };

    startPlay();
  });
}

// ── Browser Web Speech API (fallback) ─────────────────────────────────────

let _hebrewVoice = null;

// קולות עבריים נשיים ידועים ברחבי מערכות הפעלה נפוצות (macOS Carmit,
// Windows Hila, Google he-IL). ננסה להתאים תחילה קול נשי כדי להדמות
// מורה/מבוגרת שמדברת אל הילד.
const FEMALE_HEBREW_VOICES = ['carmit', 'hila', 'female'];

function _isFemaleHebrew(voice) {
  const name = (voice.name || '').toLowerCase();
  return FEMALE_HEBREW_VOICES.some(f => name.includes(f));
}

function _findHebrewVoice() {
  const voices = speechSynthesis.getVoices();
  const hebrew = voices.filter(v =>
    v.lang === 'he-IL' || v.lang === 'iw-IL' || v.lang.startsWith('he')
  );
  if (hebrew.length === 0) return null;
  return hebrew.find(_isFemaleHebrew) || hebrew[0];
}

function _initVoice() {
  _hebrewVoice = _findHebrewVoice();
}

if (typeof speechSynthesis !== 'undefined') {
  if (speechSynthesis.getVoices().length > 0) {
    _initVoice();
  } else {
    speechSynthesis.addEventListener('voiceschanged', _initVoice, { once: true });
  }
}

function _browserSpeak(text) {
  return new Promise((resolve) => {
    if (typeof speechSynthesis === 'undefined') { resolve(); return; }
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'he-IL';
    utt.rate = _rate;
    if (_hebrewVoice) utt.voice = _hebrewVoice;
    utt.onend = resolve;
    utt.onerror = resolve;
    speechSynthesis.speak(utt);
  });
}

// ── Queue ─────────────────────────────────────────────────────────────────

async function _speakWithFallback(text) {
  if (_useGoogleTTS) {
    try {
      await _googleSpeak(text);
      return;
    } catch {
      console.info('[tts] Falling back to browser Speech API');
    }
  }
  await _browserSpeak(text);
}

function _processQueue() {
  if (_speaking || _queue.length === 0) return;
  const item = _queue.shift();
  _speaking = true;

  _speakWithFallback(item.text).then(() => {
    _speaking = false;
    item.resolve();
    _processQueue();
  });
}

export const tts = {
  /**
   * הקרא טקסט עברי
   * משתמש ב-Google Translate TTS לאיכות טובה יותר
   */
  speak(text) {
    const toSpeak = getNikud(text);
    return new Promise(resolve => {
      _queue.push({ text: toSpeak, resolve });
      _processQueue();
    });
  },

  /** עצור את הדיבור הנוכחי */
  cancel() {
    _queue.forEach(item => item.resolve());
    _queue = [];
    _speaking = false;
    if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel();
  },

  get available() {
    return true;
  },

  /** הגדר מהירות דיבור (0.5–2.0) */
  setRate(rate) {
    _rate = Math.max(0.5, Math.min(2.0, rate));
  },

  /** השתמש ב-Google Translate TTS (ברירת מחדל) או בדפדפן */
  useGoogle(enabled = true) {
    _useGoogleTTS = enabled;
  },

  /**
   * הגדר מהירות דיבור להדגשת ניקוד
   * @param {{ rate?: number }} opts
   *   rate: מהירות דיבור להדגשה (ברירת מחדל 0.5)
   */
  setNikudEmphasis({ rate } = {}) {
    if (rate != null) _nikudRate = Math.max(0.3, Math.min(1.5, rate));
  },

  /**
   * הקרא אות עם ניקוד באיטיות להדגשת התנועה
   * @param {string} letter - האות (למשל 'ב')
   * @param {string} nikudSymbol - סמל הניקוד (למשל '\u05B7')
   */
  speakNikud(letter, nikudSymbol) {
    const text = letter + nikudSymbol;
    const savedRate = _rate;
    _rate = _nikudRate;
    return new Promise(resolve => {
      _queue.push({ text, resolve });
      _processQueue();
    }).finally(() => {
      _rate = savedRate;
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
    const savedRate = _rate;
    _rate = _nikudRate;
    return new Promise(resolve => {
      _queue.push({ text: entry.sound, resolve });
      _processQueue();
    }).finally(() => {
      _rate = savedRate;
    });
  },
};