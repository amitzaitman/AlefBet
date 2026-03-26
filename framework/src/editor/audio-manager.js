/**
 * מנהל הקלטות — Audio Manager
 * חלונית מודלית לניהול כל ההקלטות הקוליות של המשחק.
 * מאורגן בקטגוריות: הוראות, משוב, סיבובים, מותאם אישית.
 * עובד עם מפתחות voiceKey שרירותיים — ניתן להשתמש בכל הקלטה
 * בכל נקודה בקוד המשחק דרך playVoice(gameId, voiceKey).
 */

import { createVoiceRecordButton } from '../ui/voice-record-button.js';
import { createLocalState }        from '../core/local-state.js';

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
      { key: 'nikud-patah',    label: 'פַּתַח' },
      { key: 'nikud-kamatz',   label: 'קָמַץ' },
      { key: 'nikud-hiriq',    label: 'חִירִיק' },
      { key: 'nikud-tsere',    label: 'צֵרֵי' },
      { key: 'nikud-segol',    label: 'סֶגּוֹל' },
      { key: 'nikud-holam',    label: 'חוֹלָם' },
      { key: 'nikud-shuruq',   label: 'שׁוּרוּק' },
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────

function _slugify(str) {
  return str
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\u05D0-\u05EA_-]/gi, '')
    .toLowerCase() || `custom-${Date.now()}`;
}

function _customSlotsState(gameId) {
  return createLocalState(`alefbet.audio-manager.${gameId}.custom`, []);
}

// ── Main export ───────────────────────────────────────────────────────────

/**
 * פתח את מנהל ההקלטות כמודל.
 *
 * @param {string} gameId
 * @param {import('./game-data.js').GameData} [gameData]
 *   — optional; when provided, adds a "Rounds" category built from the rounds array
 */
export function showAudioManager(gameId, gameData = null) {
  document.getElementById('ab-audio-manager')?.remove();

  const modal = document.createElement('div');
  modal.id        = 'ab-audio-manager';
  modal.className = 'ab-am-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', 'מנהל הקלטות');
  modal.innerHTML = `
    <div class="ab-am-backdrop"></div>
    <div class="ab-am-box">
      <div class="ab-am-header">
        <span class="ab-am-title">🎤 מנהל הקלטות</span>
        <span class="ab-am-subtitle">כל ההקלטות נשמרות בדפדפן וניתן להשתמש בהן דרך <code>playVoice('${gameId}', voiceKey)</code></span>
        <button class="ab-am-close" aria-label="סגור">✕</button>
      </div>
      <div class="ab-am-body" id="ab-am-body"></div>
    </div>
  `;

  document.body.appendChild(modal);

  const body        = modal.querySelector('#ab-am-body');
  const closeBtn    = modal.querySelector('.ab-am-close');
  const backdrop    = modal.querySelector('.ab-am-backdrop');
  const voiceBtns   = [];   // track for cleanup

  // ── Build categories ────────────────────────────────────────────────────

  const categories = [...BUILTIN_CATEGORIES];

  // Rounds category: built from gameData if provided
  if (gameData && gameData.rounds.length > 0) {
    categories.splice(1, 0, {   // insert after Instructions
      id:    'rounds',
      label: '🔤 שאלות / סיבובים',
      slots: gameData.rounds.map((r, i) => ({
        key:   r.id,
        label: `סיבוב ${i + 1}${r.target ? ' — ' + r.target : ''}${r.correct ? ' (' + r.correct + ')' : ''}`,
      })),
    });
  }

  categories.forEach(cat => {
    body.appendChild(_buildCategory(cat, gameId, voiceBtns));
  });

  // Custom slots category
  body.appendChild(_buildCustomCategory(gameId, voiceBtns));

  // ── Close ───────────────────────────────────────────────────────────────

  function close() {
    voiceBtns.forEach(b => b.destroy());
    modal.remove();
  }

  closeBtn.addEventListener('click', close);
  backdrop.addEventListener('click', close);
  document.addEventListener('keydown', function onKey(e) {
    if (e.key === 'Escape') { close(); document.removeEventListener('keydown', onKey); }
  });
}

// ── Category builder ──────────────────────────────────────────────────────

function _buildCategory(cat, gameId, voiceBtns) {
  const section = document.createElement('section');
  section.className = 'ab-am-section';

  const heading = document.createElement('button');
  heading.className = 'ab-am-section__heading';
  heading.setAttribute('aria-expanded', 'true');
  heading.innerHTML = `<span>${cat.label}</span><span class="ab-am-chevron">▾</span>`;
  section.appendChild(heading);

  const grid = document.createElement('div');
  grid.className = 'ab-am-grid';
  section.appendChild(grid);

  cat.slots.forEach(slot => {
    grid.appendChild(_buildSlotRow(gameId, slot.key, slot.label, voiceBtns));
  });

  // Collapse toggle
  heading.addEventListener('click', () => {
    const expanded = heading.getAttribute('aria-expanded') === 'true';
    heading.setAttribute('aria-expanded', String(!expanded));
    grid.hidden = expanded;
    heading.querySelector('.ab-am-chevron').textContent = expanded ? '▸' : '▾';
  });

  return section;
}

// ── Custom (user-defined) category ────────────────────────────────────────

function _buildCustomCategory(gameId, voiceBtns) {
  const state   = _customSlotsState(gameId);
  const section = document.createElement('section');
  section.className = 'ab-am-section';

  const heading = document.createElement('button');
  heading.className = 'ab-am-section__heading';
  heading.setAttribute('aria-expanded', 'true');
  heading.innerHTML = `<span>➕ מותאם אישית</span><span class="ab-am-chevron">▾</span>`;
  section.appendChild(heading);

  const grid = document.createElement('div');
  grid.className = 'ab-am-grid';
  section.appendChild(grid);

  function renderSlots() {
    // Destroy existing voice buttons before re-rendering
    grid.querySelectorAll('.ab-am-row').forEach(row => {
      const btn = row._voiceBtn;
      if (btn) { voiceBtns.splice(voiceBtns.indexOf(btn), 1); btn.destroy(); }
    });
    grid.innerHTML = '';
    state.get().forEach(slot => {
      const row = _buildSlotRow(gameId, slot.key, slot.label, voiceBtns, () => {
        state.update(slots => slots.filter(s => s.key !== slot.key));
        renderSlots();
      });
      grid.appendChild(row);
    });
  }

  renderSlots();

  // Add new slot
  const addRow = document.createElement('div');
  addRow.className = 'ab-am-add-row';
  addRow.innerHTML = `
    <input class="ab-am-add-input" type="text" placeholder="שם ההקלטה... (למשל: שאלה ראשונה)" dir="rtl" />
    <button class="ab-am-add-btn">+ הוסף</button>
  `;
  section.appendChild(addRow);

  const input  = addRow.querySelector('.ab-am-add-input');
  const addBtn = addRow.querySelector('.ab-am-add-btn');

  function addSlot() {
    const label = input.value.trim();
    if (!label) return;
    const key = _slugify(label);
    if (state.get().some(s => s.key === key)) { input.select(); return; }
    state.update(slots => [...slots, { key, label }]);
    input.value = '';
    renderSlots();
  }

  addBtn.addEventListener('click', addSlot);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') addSlot(); });

  // Collapse toggle
  heading.addEventListener('click', () => {
    const expanded = heading.getAttribute('aria-expanded') === 'true';
    heading.setAttribute('aria-expanded', String(!expanded));
    grid.hidden = expanded;
    addRow.hidden = expanded;
    heading.querySelector('.ab-am-chevron').textContent = expanded ? '▸' : '▾';
  });

  return section;
}

// ── Slot row ──────────────────────────────────────────────────────────────

function _buildSlotRow(gameId, voiceKey, label, voiceBtns, onDelete = null) {
  const row = document.createElement('div');
  row.className = 'ab-am-row';

  const labelEl = document.createElement('div');
  labelEl.className = 'ab-am-row__label';
  labelEl.textContent = label;

  const keyEl = document.createElement('code');
  keyEl.className = 'ab-am-row__key';
  keyEl.textContent = voiceKey;

  const labelCol = document.createElement('div');
  labelCol.className = 'ab-am-row__label-col';
  labelCol.appendChild(labelEl);
  labelCol.appendChild(keyEl);

  const ctrlCol = document.createElement('div');
  ctrlCol.className = 'ab-am-row__ctrl';

  if (onDelete) {
    const delBtn = document.createElement('button');
    delBtn.className = 'ab-am-row__del';
    delBtn.title = 'הסר';
    delBtn.setAttribute('aria-label', 'הסר הקלטה');
    delBtn.textContent = '✕';
    delBtn.addEventListener('click', onDelete);
    ctrlCol.appendChild(delBtn);
  }

  const btn = createVoiceRecordButton(ctrlCol, { gameId, voiceKey, label });
  voiceBtns.push(btn);
  row._voiceBtn = btn;

  row.appendChild(labelCol);
  row.appendChild(ctrlCol);

  return row;
}
