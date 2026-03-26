/**
 * בודק סיבוב — חלונית עריכת שדות הסיבוב הנוכחי
 * מוצב בצד inline-end (שמאל ב-RTL)
 *
 * תכונות:
 *  - שדות טקסט ואמוג'י לפי סוג המשחק
 *  - העלאת תמונה לכל סיבוב (נשמרת כ-data URL ב-round.image)
 *  - כפתור מחיקת סיבוב
 */

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
 * @param {{\
 *   onFieldChange:     (roundId: string, key: string, value: string) => void,
 *   onDeleteRound:     (roundId: string) => void,
 *   getEditableFields?: (type: string) => object[]\
 * }} callbacks
 * @returns {{ loadRound(round, gameType), clear(), destroy() }}
 */
export function createRoundInspector(mountEl, { onFieldChange, onDeleteRound, getEditableFields }) {
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

  function clear() {
    body.innerHTML = `<p class="ab-editor-inspector__empty">בחר סיבוב לעריכה</p>`;
    deleteBtn.hidden = true;
    currentRoundId = null;
  }

  function loadRound(round, gameType = 'multiple-choice') {
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

    // ── Image upload ───────────────────────────────────────────────────────
    body.appendChild(_buildImageField(round));

    // ── Delete ─────────────────────────────────────────────────────────────
    deleteBtn.onclick = () => {
      if (confirm('למחוק את הסיבוב הזה?')) {
        onDeleteRound(currentRoundId);
        clear();
      }
    };
  }

  /** Build the image upload section for a round */
  function _buildImageField(round) {
    const section = document.createElement('div');
    section.className = 'ab-editor-field ab-editor-field--image';

    const label = document.createElement('label');
    label.className = 'ab-editor-field__label';
    label.textContent = '🖼 תמונה';
    section.appendChild(label);

    const row = document.createElement('div');
    row.className = 'ab-editor-field__img-row';

    // Preview box
    const preview = document.createElement('div');
    preview.className = 'ab-editor-field__img-preview';
    if (round.image) {
      preview.style.backgroundImage = `url(${round.image})`;
    }
    row.appendChild(preview);

    // Button column
    const btnCol = document.createElement('div');
    btnCol.className = 'ab-editor-field__img-btns';

    // Hidden file input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    fileInput.addEventListener('change', () => {
      const file = fileInput.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = e => {
        const dataUrl = e.target.result;
        preview.style.backgroundImage = `url(${dataUrl})`;
        onFieldChange(currentRoundId, 'image', dataUrl);
        // Show remove button if not already shown
        if (!clearBtn.isConnected) btnCol.appendChild(clearBtn);
      };
      reader.readAsDataURL(file);
    });
    btnCol.appendChild(fileInput);

    // Upload button
    const uploadBtn = document.createElement('button');
    uploadBtn.className = 'ab-editor-btn ab-editor-btn--img-upload';
    uploadBtn.textContent = round.image ? '🔄 החלף' : '📤 העלה';
    uploadBtn.addEventListener('click', () => fileInput.click());
    btnCol.appendChild(uploadBtn);

    // Remove button — only shown if image exists
    const clearBtn = document.createElement('button');
    clearBtn.className = 'ab-editor-btn ab-editor-btn--img-clear';
    clearBtn.textContent = '✕ הסר';
    clearBtn.addEventListener('click', () => {
      preview.style.backgroundImage = '';
      onFieldChange(currentRoundId, 'image', null);
      clearBtn.remove();
      uploadBtn.textContent = '📤 העלה';
    });
    if (round.image) btnCol.appendChild(clearBtn);

    row.appendChild(btnCol);
    section.appendChild(row);

    return section;
  }

  function destroy() {
    panel.remove();
  }

  clear();

  return { loadRound, clear, destroy };
}
