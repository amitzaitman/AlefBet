/**
 * activity-templates — pre-built zone layouts for quick game creation.
 */
import { LitElement, html } from 'lit';
import type { Zone } from './schemas.js';

let _tplIdCounter = 0;
function _zid(): string {
  return `tpl-zone-${Date.now()}-${_tplIdCounter++}`;
}

// ── Template definitions ──────────────────────────────────────────────────────

export interface ActivityTemplate {
  id:          string;
  name:        string;
  nameHe:      string;
  icon:        string;
  description: string;
  zones:       Omit<Zone, 'id'>[];
}

export const ACTIVITY_TEMPLATES: ActivityTemplate[] = [
  {
    id: 'grid-2x2',
    name: '2×2 Grid',
    nameHe: 'רשת 2×2',
    icon: '⊞',
    description: 'ארבעה אזורים בפריסה שווה',
    zones: [
      { shape: 'rect', x: 3,  y: 3,  width: 44, height: 44, correct: false },
      { shape: 'rect', x: 53, y: 3,  width: 44, height: 44, correct: false },
      { shape: 'rect', x: 3,  y: 53, width: 44, height: 44, correct: false },
      { shape: 'rect', x: 53, y: 53, width: 44, height: 44, correct: false },
    ],
  },
  {
    id: 'grid-3x3',
    name: '3×3 Grid',
    nameHe: 'רשת 3×3',
    icon: '⊞',
    description: 'תשעה אזורים בפריסה שווה',
    zones: (() => {
      const z: Omit<Zone, 'id'>[] = [];
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          z.push({ shape: 'rect', x: 2 + c * 33, y: 2 + r * 33, width: 30, height: 30, correct: false });
        }
      }
      return z;
    })(),
  },
  {
    id: 'two-columns',
    name: 'Two Columns',
    nameHe: 'שני עמודים',
    icon: '▮▮',
    description: 'שני אזורים גדולים — ימין ושמאל',
    zones: [
      { shape: 'rect', x: 3,  y: 5, width: 44, height: 90, correct: false },
      { shape: 'rect', x: 53, y: 5, width: 44, height: 90, correct: false },
    ],
  },
  {
    id: 'top-bottom',
    name: 'Top & Bottom',
    nameHe: 'למעלה ולמטה',
    icon: '▬▬',
    description: 'שני אזורים — עליון ותחתון',
    zones: [
      { shape: 'rect', x: 5, y: 3,  width: 90, height: 44, correct: false },
      { shape: 'rect', x: 5, y: 53, width: 90, height: 44, correct: false },
    ],
  },
  {
    id: 'one-of-four',
    name: 'One Correct of Four',
    nameHe: 'אחד נכון מתוך ארבעה',
    icon: '✓✗',
    description: 'ארבע אפשרויות — אחת נכונה',
    zones: [
      { shape: 'rect', x: 3,  y: 3,  width: 44, height: 44, correct: true },
      { shape: 'rect', x: 53, y: 3,  width: 44, height: 44, correct: false },
      { shape: 'rect', x: 3,  y: 53, width: 44, height: 44, correct: false },
      { shape: 'rect', x: 53, y: 53, width: 44, height: 44, correct: false },
    ],
  },
  {
    id: 'row-of-3',
    name: 'Row of Three',
    nameHe: 'שורה של שלוש',
    icon: '▭▭▭',
    description: 'שלושה אזורים בשורה אחת',
    zones: [
      { shape: 'rect', x: 2,  y: 20, width: 30, height: 60, correct: false },
      { shape: 'rect', x: 35, y: 20, width: 30, height: 60, correct: false },
      { shape: 'rect', x: 68, y: 20, width: 30, height: 60, correct: false },
    ],
  },
  {
    id: 'center-spotlight',
    name: 'Center Spotlight',
    nameHe: 'זרקור במרכז',
    icon: '◎',
    description: 'אזור אחד גדול במרכז',
    zones: [
      { shape: 'rect', x: 20, y: 15, width: 60, height: 70, correct: true },
    ],
  },
  {
    id: 'empty',
    name: 'Empty (Draw Your Own)',
    nameHe: 'ריק — ציירו בעצמכם',
    icon: '✎',
    description: 'התחלה ריקה, ציירו אזורים חופשיים',
    zones: [],
  },
];

// ── Web Component ─────────────────────────────────────────────────────────────

class AbTemplatePicker extends LitElement {
  static properties = {
    _open: { state: true },
  };

  createRenderRoot() { return this; }

  constructor() {
    super();
    this._open = false;
    this._onSelect = null as ((zones: Zone[]) => void) | null;
  }

  open(onSelect: (zones: Zone[]) => void): void {
    this._onSelect = onSelect;
    this._open = true;
  }

  private _select(tpl: ActivityTemplate): void {
    const zones: Zone[] = tpl.zones.map(z => ({ ...z, id: _zid() } as Zone));
    this._onSelect?.(zones);
    this._open = false;
  }

  render() {
    if (!this._open) return html``;
    return html`
      <div class="ab-tpl-backdrop" @click=${() => { this._open = false; }}></div>
      <div class="ab-tpl-box">
        <div class="ab-tpl-header">
          <span class="ab-tpl-title">📐 בחרו תבנית</span>
          <button class="ab-ze-close" aria-label="סגור"
                  @click=${() => { this._open = false; }}>✕</button>
        </div>
        <div class="ab-tpl-grid">
          ${ACTIVITY_TEMPLATES.map(tpl => html`
            <button class="ab-tpl-card" @click=${() => this._select(tpl)}>
              <div class="ab-tpl-card__preview">
                ${tpl.zones.map(z => html`
                  <div class=${'ab-tpl-card__zone' + (z.correct ? ' ab-tpl-card__zone--correct' : '')}
                       style="left:${z.x}%;top:${z.y}%;width:${z.width}%;height:${z.height}%">
                  </div>
                `)}
              </div>
              <div class="ab-tpl-card__label">
                <span class="ab-tpl-card__icon">${tpl.icon}</span> ${tpl.nameHe}
              </div>
              <div class="ab-tpl-card__desc">${tpl.description}</div>
            </button>
          `)}
        </div>
      </div>
    `;
  }
}

customElements.define('ab-template-picker', AbTemplatePicker);

// ── Singleton + public API ────────────────────────────────────────────────────

let _instance: AbTemplatePicker | null = null;

function _getInstance(): AbTemplatePicker {
  if (!_instance) {
    _instance = document.createElement('ab-template-picker') as AbTemplatePicker;
    document.body.appendChild(_instance);
  }
  return _instance;
}

/**
 * Show a modal picker for activity templates.
 * @param onSelect — called with the generated zones (with IDs) when a template is chosen
 */
export function showTemplatePicker(onSelect: (zones: Zone[]) => void): void {
  _getInstance().open(onSelect);
}
