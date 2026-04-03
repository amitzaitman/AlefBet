/**
 * כרטיסי בחירה למשחקי התאמה
 * מציג רשת של כרטיסים עם אמוג'י וטקסט, תומך בלחיצה ובמגע
 *
 * @param {HTMLElement} container - אלמנט המיכל
 * @param {Array<{id, text, emoji}>} options - רשימת האפשרויות
 * @param {function} onSelect - קולבק שנקרא עם האפשרות שנבחרה
 * @returns {{ highlight(id, type), disable(), reset(), destroy() }}
 */
import { LitElement, html } from 'lit';

class AbOptionCards extends LitElement {
  static properties = {
    options:     { type: Array },
    _disabled:   { state: true },
    _highlights: { state: true },
  };

  createRenderRoot() { return this; }

  constructor() {
    super();
    this.options = [];
    this._disabled = false;
    this._highlights = {};
    this._onSelect = null;
  }

  render() {
    return html`
      <div class="option-cards-grid">
        ${this.options.map(opt => {
          const hl = this._highlights[opt.id];
          return html`
            <button
              class=${'option-card' + (hl ? ` option-card--${hl}` : '')}
              data-id=${opt.id}
              ?disabled=${this._disabled}
              @click=${() => { if (!this._disabled) this._onSelect?.(opt); }}
            >
              <span class="option-card__emoji">${opt.emoji ?? ''}</span>
              <span class="option-card__text">${opt.text}</span>
            </button>
          `;
        })}
      </div>
    `;
  }
}

customElements.define('ab-option-cards', AbOptionCards);

export function createOptionCards(container, options, onSelect) {
  container.innerHTML = '';
  const el = document.createElement('ab-option-cards');
  el.options = options;
  el._onSelect = onSelect;
  container.appendChild(el);
  return {
    highlight(id, type) { el._highlights = { ...el._highlights, [id]: type }; },
    disable()           { el._disabled = true; },
    reset()             { el._highlights = {}; el._disabled = false; },
    destroy()           { container.innerHTML = ''; },
  };
}
