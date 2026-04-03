/**
 * משוב ויזואלי ושמעי למשחקים
 * משלב אנימציות וצלילים לתגובות נכון / טעות / רמז
 *
 * @param {HTMLElement} container - אלמנט המיכל
 * @returns {{ correct(text?), wrong(text?), hint(text), destroy() }}
 */
import { LitElement, html } from 'lit';
import { sounds } from '../audio/sounds.js';
import { animate } from '../render/animations.js';

class AbFeedback extends LitElement {
  static properties = {
    _text: { state: true },
    _type: { state: true },
    _anim: { state: true },
  };

  createRenderRoot() { return this; }

  constructor() {
    super();
    this._text = '';
    this._type = '';
    this._anim = null;
    this._timer = null;
  }

  updated(changed) {
    if (changed.has('_anim') && this._anim) {
      const el = this.querySelector('.feedback-message');
      if (el) animate(el, this._anim);
    }
  }

  _show(text, type, anim, duration = 1800) {
    clearTimeout(this._timer);
    this._text = text;
    this._type = type;
    this._anim = anim;
    this._timer = setTimeout(() => {
      this._text = '';
      this._type = '';
    }, duration);
  }

  correct(text = '!כָּל הַכָּבוֹד') { sounds.correct(); this._show(text, 'correct', 'bounce'); }
  wrong(text = 'נַסֵּה שׁוּב')       { sounds.wrong();   this._show(text, 'wrong',   'pulse'); }
  hint(text)                         {                    this._show(text, 'hint',    'pulse'); }

  destroy() {
    clearTimeout(this._timer);
    this.remove();
  }

  render() {
    return html`
      <div
        class=${'feedback-message' + (this._type ? ` feedback-message--${this._type}` : '')}
        aria-live="polite"
        role="status"
      >${this._text}</div>
    `;
  }
}

customElements.define('ab-feedback', AbFeedback);

export function createFeedback(container) {
  const el = document.createElement('ab-feedback');
  container.appendChild(el);
  return {
    correct: (text) => el.correct(text),
    wrong:   (text) => el.wrong(text),
    hint:    (text) => el.hint(text),
    destroy: ()     => el.destroy(),
  };
}
