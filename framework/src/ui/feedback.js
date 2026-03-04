/**
 * משוב ויזואלי ושמעי למשחקים
 * משלב אנימציות וצלילים לתגובות נכון / טעות / רמז
 * [נוסף על ידי: letter-match game]
 *
 * @param {HTMLElement} container - אלמנט המיכל
 * @returns {{ correct(text?), wrong(text?), hint(text), destroy() }}
 */
import { sounds } from '../audio/sounds.js';
import { animate } from '../render/animations.js';

export function createFeedback(container) {
  const el = document.createElement('div');
  el.className = 'feedback-message';
  el.setAttribute('aria-live', 'polite');
  el.setAttribute('role', 'status');
  container.appendChild(el);

  let _timer = null;

  function show(text, type, duration = 1800) {
    clearTimeout(_timer);
    el.textContent = text;
    el.className = `feedback-message feedback-message--${type}`;
    _timer = setTimeout(() => {
      el.textContent = '';
      el.className = 'feedback-message';
    }, duration);
  }

  return {
    /** הצג משוב חיובי */
    correct(text = '!כָּל הַכָּבוֹד') {
      sounds.correct();
      show(text, 'correct');
      animate(el, 'bounce');
    },

    /** הצג עידוד — נסה שוב */
    wrong(text = 'נַסֵּה שׁוּב') {
      sounds.wrong();
      show(text, 'wrong');
      animate(el, 'pulse');
    },

    /** הצג רמז */
    hint(text) {
      show(text, 'hint');
      animate(el, 'pulse');
    },

    /** הסר את הרכיב */
    destroy() {
      clearTimeout(_timer);
      el.remove();
    },
  };
}
