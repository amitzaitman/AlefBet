/**
 * מנהל הקלטות — Audio Manager
 * חלונית מודלית לניהול כל ההקלטות הקוליות של המשחק.
 */
import { LitElement, html } from 'lit';

// ── Built-in categories ───────────────────────────────────────────────────

const BUILTIN_CATEGORIES = [
  {
    id:    'instructions',
    label: '📝 הוראות',
    slots: [
      { key: 'instruction-welcome',  label: 'ברוכים הבאים' },
      { key: 'instruction-how-to',   label: 'איך משחקים' },
      { key: 'instruction-complete', label: 'סיום המשחק' },
    ],
  },
  {
    id:    'feedback',
    label: '✅ משוב',
    slots: [
      { key: 'feedback-correct',   label: 'תשובה נכונה — כל הכבוד!' },
      { key: 'feedback-wrong',     label: 'תשובה שגויה' },
      { key: 'feedback-try-again', label: 'נסה שוב' },
      { key: 'feedback-encourage', label: 'עידוד כללי' },
    ],
  },
  {
    id:    'nikud',
    label: '◌ ניקוד',
    slots: [
      { key: 'nikud-patah',  label: 'פַּתַח' },
      { key: 'nikud-kamatz', label: 'קָמַץ' },
      { key: 'nikud-hiriq',  label: 'חִירִיק' },
      { key: 'nikud-tsere',  label: 'צֵרֵי' },
      { key: 'nikud-segol',  label: 'סֶגּוֹל' },
      { key: 'nikud-holam',  label: 'חוֹלָם' },
      { key: 'nikud-shuruq', label: 'שׁוּרוּק' },
    ],
  },
];

function _slugify(str) {
  return str
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\u05D0-\u05EA_-]/gi, '')
    .toLowerCase() || `custom-${Date.now()}`;
}

// ── Web Component ─────────────────────────────────────────────────────────

class AbAudioManager extends LitElement {
  static properties = {
    _open:         { state: true },
    _gameId:       { state: true },
    _categories:   { state: true },
    _expanded:     { state: true },
    _customSlots:  { state: true },
  };

  createRenderRoot() { return this; }

  constructor() {
    super();
    this._open = false;
    this._gameId = '';
    this._categories = [];
    this._expanded = new Set();
    this._customSlots = [];
  }

  open(gameId, gameData = null) {
    this._gameId = gameId;
    this._customSlots = this._loadCustomSlots(gameId);

    const cats = [...BUILTIN_CATEGORIES];
    if (gameData?.rounds?.length > 0) {
      cats.splice(1, 0, {
        id:    'rounds',
        label: '🔤 שאלות / סיבובים',
        slots: gameData.rounds.map((r, i) => ({
          key:   r.id,
          label: `סיבוב ${i + 1}${r.target ? ' — ' + r.target : ''}${r.correct ? ' (' + r.correct + ')' : ''}`,
        })),
      });
    }
    this._categories = cats;
    this._expanded = new Set([...cats.map(c => c.id), 'custom']);
    this._open = true;
  }

  _loadCustomSlots(gameId) {
    try {
      return JSON.parse(localStorage.getItem(`alefbet.audio-manager.${gameId}.custom`) || '[]');
    } catch { return []; }
  }

  _saveCustomSlots() {
    localStorage.setItem(
      `alefbet.audio-manager.${this._gameId}.custom`,
      JSON.stringify(this._customSlots),
    );
  }

  _toggleExpand(catId) {
    const next = new Set(this._expanded);
    if (next.has(catId)) next.delete(catId); else next.add(catId);
    this._expanded = next;
  }

  _addCustomSlot() {
    const input = this.querySelector('.ab-am-add-input');
    const label = input?.value?.trim();
    if (!label) return;
    const key = _slugify(label);
    if (this._customSlots.some(s => s.key === key)) { input?.select(); return; }
    this._customSlots = [...this._customSlots, { key, label }];
    this._saveCustomSlots();
    if (input) input.value = '';
  }

  _removeCustomSlot(key) {
    this._customSlots = this._customSlots.filter(s => s.key !== key);
    this._saveCustomSlots();
  }

  _renderCategory(cat) {
    const expanded = this._expanded.has(cat.id);
    return html`
      <section class="ab-am-section">
        <button class="ab-am-section__heading" aria-expanded=${expanded}
                @click=${() => this._toggleExpand(cat.id)}>
          <span>${cat.label}</span>
          <span class="ab-am-chevron">${expanded ? '▾' : '▸'}</span>
        </button>
        <div class="ab-am-grid" ?hidden=${!expanded}>
          ${cat.slots.map(slot => this._renderSlotRow(slot.key, slot.label, false))}
        </div>
      </section>
    `;
  }

  _renderCustomCategory() {
    const expanded = this._expanded.has('custom');
    return html`
      <section class="ab-am-section">
        <button class="ab-am-section__heading" aria-expanded=${expanded}
                @click=${() => this._toggleExpand('custom')}>
          <span>➕ מותאם אישית</span>
          <span class="ab-am-chevron">${expanded ? '▾' : '▸'}</span>
        </button>
        <div class="ab-am-grid" ?hidden=${!expanded}>
          ${this._customSlots.map(slot => this._renderSlotRow(slot.key, slot.label, true))}
        </div>
        <div class="ab-am-add-row" ?hidden=${!expanded}>
          <input class="ab-am-add-input" type="text" dir="rtl"
                 placeholder="שם ההקלטה... (למשל: שאלה ראשונה)"
                 @keydown=${e => { if (e.key === 'Enter') this._addCustomSlot(); }}>
          <button class="ab-am-add-btn" @click=${() => this._addCustomSlot()}>+ הוסף</button>
        </div>
      </section>
    `;
  }

  _renderSlotRow(voiceKey, label, deletable) {
    return html`
      <div class="ab-am-row">
        <div class="ab-am-row__label-col">
          <div class="ab-am-row__label">${label}</div>
          <code class="ab-am-row__key">${voiceKey}</code>
        </div>
        <div class="ab-am-row__ctrl">
          ${deletable ? html`
            <button class="ab-am-row__del" title="הסר" aria-label="הסר הקלטה"
                    @click=${() => this._removeCustomSlot(voiceKey)}>✕</button>
          ` : ''}
          <ab-voice-record-button
            .gameId=${this._gameId}
            .voiceKey=${voiceKey}
            .label=${label}
          ></ab-voice-record-button>
        </div>
      </div>
    `;
  }

  render() {
    if (!this._open) return html``;
    return html`
      <div class="ab-am-modal" role="dialog" aria-modal="true" aria-label="מנהל הקלטות">
        <div class="ab-am-backdrop" @click=${() => { this._open = false; }}></div>
        <div class="ab-am-box">
          <div class="ab-am-header">
            <span class="ab-am-title">🎤 מנהל הקלטות</span>
            <span class="ab-am-subtitle">
              כל ההקלטות נשמרות בדפדפן וניתן להשתמש בהן דרך
              <code>playVoice('${this._gameId}', voiceKey)</code>
            </span>
            <button class="ab-am-close" aria-label="סגור"
                    @click=${() => { this._open = false; }}>✕</button>
          </div>
          <div class="ab-am-body">
            ${this._categories.map(cat => this._renderCategory(cat))}
            ${this._renderCustomCategory()}
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('ab-audio-manager', AbAudioManager);

// ── Singleton + public API ────────────────────────────────────────────────

let _instance = null;

function _getInstance() {
  if (!_instance) {
    _instance = document.createElement('ab-audio-manager');
    document.body.appendChild(_instance);
  }
  return _instance;
}

/**
 * @param {string} gameId
 * @param {import('./game-data.js').GameData} [gameData]
 */
export function showAudioManager(gameId, gameData = null) {
  _getInstance().open(gameId, gameData);
}
