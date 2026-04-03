/**
 * אזור אינטראקטיבי — לחצן/אזור שמיש עם מצבי משוב
 */
import { LitElement, html } from 'lit';

class AbZone extends LitElement {
  static properties = {
    color:      { type: String },
    symbol:     { type: String },
    label:      { type: String },
    _highlight: { state: true },
  };

  createRenderRoot() { return this; }

  constructor() {
    super();
    this.color = '#4f67ff';
    this.symbol = '';
    this.label = '';
    this._highlight = null;
    this._onTap = null;
  }

  render() {
    return html`
      <div
        class=${'ab-zone' + (this._highlight ? ` ab-zone--${this._highlight}` : '')}
        style="--zone-color: ${this.color}"
        @click=${() => this._onTap?.()}
      >
        <div class="ab-zone__symbol">${this.symbol}</div>
        <div class="ab-zone__label">${this.label}</div>
      </div>
    `;
  }
}

customElements.define('ab-zone', AbZone);

/**
 * @param {Object} config
 * @param {string} config.color
 * @param {string} config.symbol
 * @param {string} config.label
 * @param {Function} config.onTap
 * @returns {{ el: HTMLElement, highlight: Function, reset: Function, destroy: Function }}
 */
export function createZone(config) {
  const el = document.createElement('ab-zone');
  el.color = config.color || '#4f67ff';
  el.symbol = config.symbol || '';
  el.label = config.label || '';
  el._onTap = config.onTap || null;
  return {
    el,
    highlight(state) { el._highlight = state || null; },
    reset()          { el._highlight = null; },
    destroy()        { el.remove(); },
  };
}
