/**
 * הזרקת כפתור לכותרת המשחק
 */
import { LitElement, html } from 'lit';

class AbHeaderBtn extends LitElement {
  static properties = {
    icon:      { type: String },
    ariaLabel: { type: String },
  };

  createRenderRoot() { return this; }

  constructor() {
    super();
    this.icon = '';
    this.ariaLabel = '';
    this._onClick = null;
  }

  render() {
    return html`
      <button
        class="ab-header-btn"
        aria-label=${this.ariaLabel}
        @click=${() => this._onClick?.()}
      >${this.icon}</button>
    `;
  }
}

customElements.define('ab-header-btn', AbHeaderBtn);

/**
 * @param {HTMLElement} container — מיכל המשחק
 * @param {string} icon
 * @param {string} ariaLabel
 * @param {Function} onClick
 * @returns {HTMLElement|null}
 */
export function injectHeaderButton(container, icon, ariaLabel, onClick) {
  const spacer = container.querySelector('.game-header__spacer');
  if (!spacer) return null;
  const el = document.createElement('ab-header-btn');
  el.icon = icon;
  el.ariaLabel = ariaLabel;
  el._onClick = onClick;
  spacer.innerHTML = '';
  spacer.appendChild(el);
  return el;
}
