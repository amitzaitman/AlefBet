/**
 * התקנה גלובלית לבדיקות Vitest
 *
 * jsdom חסר כמה ממשקי דפדפן שמשחקי AlefBet משתמשים בהם (Web Animations API,
 * AudioContext, SpeechSynthesis). אנו משלימים פה כדי שבדיקות לא יכשלו בגלל
 * חסרון פלטפורמה - שאינו המטרה של הבדיקות.
 */
import { afterEach, vi } from 'vitest';

// ── Web Animations API ─────────────────────────────────────────────────────
// `framework/src/render/animations.js` קורא ל-`el.animate(...)`. ב-jsdom
// הפונקציה אינה קיימת, ובלעדיה רכיבי feedback/completion-screen זורקים.
if (typeof Element !== 'undefined' && typeof Element.prototype.animate !== 'function') {
  Element.prototype.animate = function () {
    return {
      finished: Promise.resolve(),
      cancel() {},
      finish() {},
      play() {},
      pause() {},
      addEventListener() {},
      removeEventListener() {},
    };
  };
}

// ── Web Audio API ──────────────────────────────────────────────────────────
// `framework/src/audio/sounds.js` יוצר AudioContext בעת הטעינה. אנו מספקים
// stub שקט כדי לא להדפיס אזהרות.
if (typeof window !== 'undefined' && typeof window.AudioContext === 'undefined') {
  class SilentAudioContext {
    constructor() {
      this.currentTime = 0;
      this.state = 'running';
      this.destination = {};
    }
    createOscillator() {
      return {
        connect() {},
        start() {},
        stop() {},
        frequency: { setValueAtTime() {} },
        type: 'sine',
      };
    }
    createGain() {
      return {
        connect() {},
        gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} },
      };
    }
    resume() {}
  }
  window.AudioContext = SilentAudioContext;
  window.webkitAudioContext = SilentAudioContext;
}

// ── נקה את ה-DOM בין בדיקות ────────────────────────────────────────────────
afterEach(() => {
  document.body.innerHTML = '';
  vi.useRealTimers();
});
