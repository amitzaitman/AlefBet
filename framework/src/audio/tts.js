/**
 * מנוע קריאת טקסט עברי
 * משתמש ב-Web Speech API עם קול עברי אוטומטי
 * תור מדובר - מונע חפיפות
 */

let _hebrewVoice = null;
let _rate = 0.9;
let _queue = [];
let _speaking = false;

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

function _processQueue() {
  if (_speaking || _queue.length === 0) return;
  const text = _queue.shift();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = 'he-IL';
  utt.rate = _rate;
  if (_hebrewVoice) utt.voice = _hebrewVoice;
  utt.onend = () => { _speaking = false; _processQueue(); };
  utt.onerror = () => { _speaking = false; _processQueue(); };
  _speaking = true;
  speechSynthesis.speak(utt);
}

export const tts = {
  /** הקרא טקסט עברי */
  speak(text) {
    if (typeof speechSynthesis === 'undefined') return;
    _queue.push(text);
    _processQueue();
  },

  /** עצור את הדיבור הנוכחי */
  cancel() {
    if (typeof speechSynthesis === 'undefined') return;
    _queue = [];
    _speaking = false;
    speechSynthesis.cancel();
  },

  /** האם קריאת טקסט זמינה? */
  get available() {
    return typeof speechSynthesis !== 'undefined';
  },

  /** הגדר מהירות דיבור (0.5–2.0, ברירת מחדל 0.9) */
  setRate(rate) {
    _rate = Math.max(0.5, Math.min(2.0, rate));
  },
};
