/**
 * מנוע קריאת טקסט עברי
 * משתמש ב-Google Translate TTS לאיכות גבוהה יותר
 * עם נפילה ל-Web Speech API כגיבוי
 */
import { getNikud } from '../utils/nakdan.js';

let _queue = [];
let _speaking = false;
let _useGoogleTTS = true;
let _rate = 0.9;

// ── Google Translate TTS ──────────────────────────────────────────────────

function _googleSpeak(text) {
  return new Promise((resolve) => {
    try {
      const encoded = encodeURIComponent(text);
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=he&client=tw-ob`;
      const audio = new Audio(url);
      audio.playbackRate = _rate;
      audio.onended = resolve;
      audio.onerror = () => {
        // Google TTS failed — fall back to browser TTS for this call
        _browserSpeak(text).then(resolve);
      };
      audio.play().catch(() => {
        _browserSpeak(text).then(resolve);
      });
    } catch {
      _browserSpeak(text).then(resolve);
    }
  });
}

// ── Browser Web Speech API (fallback) ─────────────────────────────────────

let _hebrewVoice = null;

function _findHebrewVoice() {
  const voices = speechSynthesis.getVoices();
  return (
    voices.find(v => v.lang === 'he-IL') ||
    voices.find(v => v.lang === 'iw-IL') ||
    voices.find(v => v.lang.startsWith('he')) ||
    null
  );
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

function _processQueue() {
  if (_speaking || _queue.length === 0) return;
  const item = _queue.shift();
  _speaking = true;

  const speakFn = _useGoogleTTS ? _googleSpeak : _browserSpeak;
  speakFn(item.text).then(() => {
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
};
