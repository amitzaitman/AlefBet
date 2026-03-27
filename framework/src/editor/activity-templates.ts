/**
 * activity-templates — pre-built zone layouts for quick game creation.
 *
 * Teachers pick a template, and it pre-populates the round with
 * positioned zones. Each template defines zone placements as
 * percentage-based rectangles.
 *
 * Usage:
 *   showTemplatePicker(zones => { ... });
 */

import type { Zone } from './schemas.js';

let _tplIdCounter = 0;
function _zid(): string {
  return `tpl-zone-${Date.now()}-${_tplIdCounter++}`;
}

// ── Template definitions ─────────────────────────────────────────────────────

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

// ── Template picker UI ───────────────────────────────────────────────────────

/**
 * Show a modal picker for activity templates.
 * @param onSelect — called with the generated zones (with IDs) when a template is chosen
 */
export function showTemplatePicker(onSelect: (zones: Zone[]) => void): void {
  document.getElementById('ab-tpl-picker')?.remove();

  const modal = document.createElement('div');
  modal.id = 'ab-tpl-picker';
  modal.className = 'ab-tpl-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', 'בחירת תבנית');

  const backdrop = document.createElement('div');
  backdrop.className = 'ab-tpl-backdrop';
  modal.appendChild(backdrop);

  const box = document.createElement('div');
  box.className = 'ab-tpl-box';

  // Header
  const header = document.createElement('div');
  header.className = 'ab-tpl-header';
  header.innerHTML = `<span class="ab-tpl-title">📐 בחרו תבנית</span>`;
  const closeBtn = document.createElement('button');
  closeBtn.className = 'ab-ze-close';
  closeBtn.textContent = '\u2715';
  closeBtn.addEventListener('click', close);
  header.appendChild(closeBtn);
  box.appendChild(header);

  // Grid
  const grid = document.createElement('div');
  grid.className = 'ab-tpl-grid';

  ACTIVITY_TEMPLATES.forEach(tpl => {
    const card = document.createElement('button');
    card.className = 'ab-tpl-card';
    card.addEventListener('click', () => {
      const zones: Zone[] = tpl.zones.map(z => ({
        ...z,
        id: _zid(),
      } as Zone));
      onSelect(zones);
      close();
    });

    // Preview: mini visual of zones
    const preview = document.createElement('div');
    preview.className = 'ab-tpl-card__preview';
    tpl.zones.forEach(z => {
      const dot = document.createElement('div');
      dot.className = 'ab-tpl-card__zone';
      if (z.correct) dot.classList.add('ab-tpl-card__zone--correct');
      dot.style.left   = `${z.x}%`;
      dot.style.top    = `${z.y}%`;
      dot.style.width  = `${z.width}%`;
      dot.style.height = `${z.height}%`;
      preview.appendChild(dot);
    });
    card.appendChild(preview);

    const label = document.createElement('div');
    label.className = 'ab-tpl-card__label';
    label.innerHTML = `<span class="ab-tpl-card__icon">${tpl.icon}</span> ${tpl.nameHe}`;
    card.appendChild(label);

    const desc = document.createElement('div');
    desc.className = 'ab-tpl-card__desc';
    desc.textContent = tpl.description;
    card.appendChild(desc);

    grid.appendChild(card);
  });

  box.appendChild(grid);
  modal.appendChild(box);
  document.body.appendChild(modal);

  function close() { modal.remove(); }
  backdrop.addEventListener('click', close);
  document.addEventListener('keydown', function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') { close(); document.removeEventListener('keydown', onKey); }
  });
}
