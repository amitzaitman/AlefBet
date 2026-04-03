/**
 * קופסת ניקוד — ריבוע ריק (מסמל אות) עם סימן ניקוד מחוצה לו
 */
import { LitElement, html } from 'lit';

class AbNikudBox extends LitElement {
  static properties = {
    nikud: { type: Object },
    size:  { type: String },
  };

  createRenderRoot() { return this; }

  constructor() {
    super();
    this.nikud = null;
    this.size = 'md';
  }

  render() {
    if (!this.nikud) return html``;
    return html`
      <div class=${'ab-nikud-box ab-nikud-box--' + this.size + ' ab-nikud-box--' + this.nikud.id}>
        <div class="ab-nikud-box__box"></div>
        <div class="ab-nikud-box__mark">${this.nikud.symbol}</div>
      </div>
    `;
  }
}

customElements.define('ab-nikud-box', AbNikudBox);

/**
 * @param {object} nikud — אובייקט ניקוד מ-nikudList
 * @param {object} [opts]
 * @param {string} [opts.size] — 'sm' | 'md' | 'lg'
 * @returns {HTMLElement}
 */
export function createNikudBox(nikud, { size = 'md' } = {}) {
  const el = document.createElement('ab-nikud-box');
  el.nikud = nikud;
  el.size = size;
  return el;
}
