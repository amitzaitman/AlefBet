/**
 * דיאלוג לבחירת ניקוד פעיל
 */
import { LitElement, html } from 'lit';
import { nikudList } from '../data/nikud.js';
import { tts } from '../audio/tts.js';

class AbNikudSettingsDialog extends LitElement {
  static properties = {
    _open:    { state: true },
    _rate:    { state: true },
    _checked: { state: true },
  };

  createRenderRoot() { return this; }

  constructor() {
    super();
    this._open = false;
    this._rate = 0.5;
    this._checked = new Set();
    this._container = null;
    this._onSave = null;
  }

  open(container, onSave) {
    this._container = container;
    this._onSave = onSave;
    const allowed = new URLSearchParams(window.location.search).get('allowedNikud')?.split(',') ?? [];
    this._checked = new Set(
      nikudList
        .filter(n => allowed.length === 0 || allowed.includes(n.id) || allowed.includes(n.name))
        .map(n => n.id)
    );
    this._rate = parseFloat(localStorage.getItem('alefbet.nikudRate')) || 0.5;
    this._open = true;
  }

  _save() {
    localStorage.setItem('alefbet.nikudRate', this._rate);
    tts.setNikudEmphasis({ rate: this._rate });

    const checked = [...this._checked];
    const url = new URL(window.location);
    if (checked.length > 0 && checked.length < nikudList.length) {
      url.searchParams.set('allowedNikud', checked.join(','));
    } else {
      url.searchParams.delete('allowedNikud');
    }
    url.searchParams.delete('excludedNikud');
    window.history.replaceState({}, '', url);

    this._open = false;
    this._onSave?.(this._container);
  }

  _toggleNikud(id) {
    const next = new Set(this._checked);
    if (next.has(id)) next.delete(id); else next.add(id);
    this._checked = next;
  }

  render() {
    if (!this._open) return html``;
    return html`
      <div class="ab-nikud-dialog-backdrop">
        <div class="ab-nikud-dialog">
          <h2 style="margin-top:0">בחר ניקוד</h2>
          <div class="ab-nikud-dialog__grid">
            ${nikudList.map(n => html`
              <label class="ab-nikud-dialog__label">
                <input type="checkbox"
                       .checked=${this._checked.has(n.id)}
                       @change=${() => this._toggleNikud(n.id)}
                       class="ab-nikud-dialog__cb">
                <span>${n.nameNikud}</span>
              </label>
            `)}
          </div>
          <div class="ab-nikud-dialog__rate">
            <label class="ab-nikud-dialog__rate-label">
              מהירות הגייה: <span>${this._rate}</span>
            </label>
            <input type="range" min="0.3" max="1.5" step="0.1"
                   .value=${String(this._rate)}
                   @input=${e => { this._rate = parseFloat(e.target.value); }}
                   class="ab-nikud-dialog__slider">
            <div class="ab-nikud-dialog__rate-hints">
              <span>אִטִּי</span><span>מָהִיר</span>
            </div>
          </div>
          <button class="ab-nikud-dialog__save" @click=${() => this._save()}>שמור והתחל מחדש</button>
          <button class="ab-nikud-dialog__cancel" @click=${() => { this._open = false; }}>ביטול</button>
        </div>
      </div>
    `;
  }
}

customElements.define('ab-nikud-settings-dialog', AbNikudSettingsDialog);

let _instance = null;

function _getInstance() {
  if (!_instance) {
    _instance = document.createElement('ab-nikud-settings-dialog');
    document.body.appendChild(_instance);
  }
  return _instance;
}

/**
 * @param {HTMLElement} container
 * @param {Function} onSave
 */
export function showNikudSettingsDialog(container, onSave) {
  _getInstance().open(container, onSave);
}
