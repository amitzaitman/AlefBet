/**
 * בודק סיבוב — חלונית עריכת שדות הסיבוב הנוכחי
 * מוצב בצד inline-end (שמאל ב-RTL)
 */

import { createVoiceRecordButton } from '../ui/voice-record-button.js';

/**
 * Default field specs per game type.
 * Each spec: { key, label, type: 'text'|'emoji' }
 */
const DEFAULT_FIELDS = {
  'multiple-choice': [
    { key: 'target',       label: 'אות יעד',      type: 'text',  maxLength: 2 },
    { key: 'correct',      label: 'תשובה נכונה',  type: 'text' },
    { key: 'correctEmoji', label: 'אמוג\'י',       type: 'emoji' },
  ],
  'drag-match': [
    { key: 'target',       label: 'אות יעד',      type: 'text',  maxLength: 2 },
    { key: 'correct',      label: 'תשובה נכונה',  type: 'text' },
    { key: 'correctEmoji', label: 'אמוג\'י',       type: 'emoji' },
  ],
};

/**
 * @param {HTMLElement} mountEl
 * @param {{
 *   gameId:            string,
 *   onFieldChange:     (roundId: string, key: string, value: string) => void,
 *   onDeleteRound:     (roundId: string) => void,
 *   getEditableFields?: (type: string) => object[]
 * }} callbacks
 * @returns {{ loadRound(round, gameType), clear(), destroy() }}
 */
export function createRoundInspector(mountEl, { gameId, onFieldChange, onDeleteRound, getEditableFields }) {
  const panel = document.createElement('div');
  panel.className = 'ab-editor-inspector';

  const headerEl = document.createElement('div');
  headerEl.className = 'ab-editor-inspector__header';
  headerEl.innerHTML = `<span class="ab-editor-inspector__title">✏️ ערוך סיבוב</span>`;
  panel.appendChild(headerEl);

  const body = document.createElement('div');
  body.className = 'ab-editor-inspector__body';
  panel.appendChild(body);

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'ab-editor-inspector__delete';
  deleteBtn.textContent = '🗑 מחק סיבוב';
  panel.appendChild(deleteBtn);

  mountEl.appendChild(panel);

  let currentRoundId = null;
  let _voiceBtn = null;

  function clear() {
    _voiceBtn?.destroy();
    _voiceBtn = null;
    body.innerHTML = `<p class="ab-editor-inspector__empty">בחר סיבוב לעריכה</p>`;
    deleteBtn.hidden = true;
    currentRoundId = null;
  }

  function loadRound(round, gameType = 'multiple-choice') {
    _voiceBtn?.destroy();
    _voiceBtn = null;

    currentRoundId = round.id;
    body.innerHTML = '';
    deleteBtn.hidden = false;

    const fields = (getEditableFields ? getEditableFields(gameType) : null)
      || DEFAULT_FIELDS[gameType]
      || DEFAULT_FIELDS['multiple-choice'];

    // ── Text / emoji fields ────────────────────────────────────────────────
    fields.forEach(spec => {
      const fieldEl = document.createElement('div');
      fieldEl.className = 'ab-editor-field';

      const label = document.createElement('label');
      label.className = 'ab-editor-field__label';
      label.textContent = spec.label;
      fieldEl.appendChild(label);

      if (spec.type === 'emoji') {
        const row = document.createElement('div');
        row.className = 'ab-editor-field__emoji-row';

        const preview = document.createElement('div');
        preview.className = 'ab-editor-field__emoji-preview';
        preview.textContent = round[spec.key] || '❓';
        row.appendChild(preview);

        const input = document.createElement('input');
        input.className = 'ab-editor-field__input';
        input.type = 'text';
        input.value = round[spec.key] || '';
        input.maxLength = 8;
        input.placeholder = '🐱';
        input.style.fontSize = '20px';
        input.addEventListener('input', () => {
          preview.textContent = input.value || '❓';
          onFieldChange(currentRoundId, spec.key, input.value);
        });
        row.appendChild(input);
        fieldEl.appendChild(row);
      } else {
        const input = document.createElement('input');
        input.className = 'ab-editor-field__input';
        input.type = 'text';
        input.value = round[spec.key] || '';
        input.dir = 'rtl';
        if (spec.maxLength) input.maxLength = spec.maxLength;
        input.addEventListener('input', () => {
          onFieldChange(currentRoundId, spec.key, input.value);
        });
        fieldEl.appendChild(input);
      }

      body.appendChild(fieldEl);
    });

    // ── Voice recording section ────────────────────────────────────────────
    const voiceField = document.createElement('div');
    voiceField.className = 'ab-editor-field ab-editor-field--voice';

    const voiceLabel = document.createElement('div');
    voiceLabel.className = 'ab-editor-field__label';
    voiceLabel.textContent = '🎤 הקלטת קול לסיבוב';
    voiceField.appendChild(voiceLabel);

    const voiceDesc = document.createElement('p');
    voiceDesc.style.cssText = 'font-size:11px;color:var(--ab-editor-muted);margin:2px 0 6px';
    voiceDesc.textContent = 'יושמע בזמן המשחק במקום קריאת-טקסט';
    voiceField.appendChild(voiceDesc);

    _voiceBtn = createVoiceRecordButton(voiceField, {
      gameId,
      voiceKey: round.id,
      label: `הקלטת קול — סיבוב ${round.id}`,
    });

    body.appendChild(voiceField);

    // ── Delete ─────────────────────────────────────────────────────────────
    deleteBtn.onclick = () => {
      if (confirm('למחוק את הסיבוב הזה?')) {
        onDeleteRound(currentRoundId);
        clear();
      }
    };
  }

  function destroy() {
    _voiceBtn?.destroy();
    panel.remove();
  }

  clear();

  return { loadRound, clear, destroy };
}
