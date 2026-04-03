/**
 * סרגל התקדמות ויזואלי
 * מציג את ההתקדמות בסיבובי המשחק
 */
import { LitElement, html } from 'lit';

class AbProgressBar extends LitElement {
  static properties = {
    total:   { type: Number },
    current: { type: Number },
  };

  createRenderRoot() { return this; }

  constructor() {
    super();
    this.total = 0;
    this.current = 0;
  }

  render() {
    const pct = this.total > 0 ? Math.round((this.current / this.total) * 100) : 0;
    return html`
      <div class="progress-bar"
           role="progressbar"
           aria-valuemin="0"
           aria-valuemax=${this.total}
           aria-valuenow=${this.current}>
        <div class="progress-bar__track">
          <div class="progress-bar__fill" style="width:${pct}%"></div>
        </div>
        <span class="progress-bar__label">${this.current} / ${this.total}</span>
      </div>
    `;
  }
}

customElements.define('ab-progress-bar', AbProgressBar);

/**
 * @param {HTMLElement} container - אלמנט המיכל
 * @param {number} total - מספר הסיבובים הכולל
 * @returns {{ update(current), destroy() }}
 */
export function createProgressBar(container, total) {
  const el = document.createElement('ab-progress-bar');
  el.total = total;
  container.appendChild(el);
  return {
    update(current) { el.current = current; },
    destroy()       { el.remove(); },
  };
}
