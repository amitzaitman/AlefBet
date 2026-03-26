/**
 * round-inspector — editable fields panel for the selected round.
 *
 * Fields are derived automatically from a Zod schema via schemaToFields().
 * Pass `roundSchema` to GameEditor options to customise the inspector for
 * a specific game type; otherwise falls back to the built-in schemas.
 */
import { z } from 'zod';
import { schemaToFields, type FieldSpec } from './schema-to-fields.js';
import { BUILTIN_ROUND_SCHEMAS } from './schemas.js';
import type { RoundRecord } from './schemas.js';

export interface RoundInspectorOptions {
  onFieldChange:    (roundId: string, key: string, value: unknown) => void;
  onDeleteRound:    (roundId: string) => void;
  /** Preferred: Zod schema whose fields drive the inspector UI. */
  roundSchema?:     z.ZodObject<z.ZodRawShape>;
}

export interface RoundInspector {
  loadRound(round: RoundRecord, gameType?: string): void;
  clear():   void;
  destroy(): void;
}

export function createRoundInspector(
  mountEl: HTMLElement,
  { onFieldChange, onDeleteRound, roundSchema }: RoundInspectorOptions,
): RoundInspector {
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

  let currentRoundId: string | null = null;

  // ── clear ───────────────────────────────────────────────────────────────

  function clear() {
    body.innerHTML = `<p class="ab-editor-inspector__empty">בחר סיבוב לעריכה</p>`;
    deleteBtn.hidden = true;
    currentRoundId = null;
  }

  // ── loadRound ───────────────────────────────────────────────────────────

  function loadRound(round: RoundRecord, gameType = 'multiple-choice') {
    currentRoundId = round.id;
    body.innerHTML = '';
    deleteBtn.hidden = false;

    // Resolve schema: explicit option > built-in for game type > fallback
    const schema  = roundSchema
      ?? BUILTIN_ROUND_SCHEMAS[gameType]
      ?? BUILTIN_ROUND_SCHEMAS['multiple-choice'];
    const fields  = schemaToFields(schema);

    // ── Auto-generated fields from schema ─────────────────────────────────
    fields.forEach(spec => body.appendChild(_buildField(spec, round)));

    // ── Image upload (always shown, handled outside schema) ────────────────
    body.appendChild(_buildImageField(round));

    // ── Delete button ──────────────────────────────────────────────────────
    deleteBtn.onclick = () => {
      if (confirm('למחוק את הסיבוב הזה?')) {
        onDeleteRound(currentRoundId!);
        clear();
      }
    };
  }

  // ── Field builders ───────────────────────────────────────────────────────

  function _buildField(spec: FieldSpec, round: RoundRecord): HTMLElement {
    const wrap = document.createElement('div');
    wrap.className = 'ab-editor-field';

    const label = document.createElement('label');
    label.className = 'ab-editor-field__label';
    label.textContent = spec.label;
    wrap.appendChild(label);

    switch (spec.type) {
      case 'emoji':   wrap.appendChild(_buildEmojiInput(spec, round));  break;
      case 'boolean': wrap.appendChild(_buildToggle(spec, round));      break;
      case 'select':  wrap.appendChild(_buildSelect(spec, round));      break;
      case 'number':  wrap.appendChild(_buildNumberInput(spec, round)); break;
      default:        wrap.appendChild(_buildTextInput(spec, round));   break;
    }

    return wrap;
  }

  function _buildTextInput(spec: FieldSpec, round: RoundRecord): HTMLElement {
    const input = document.createElement('input');
    input.className = 'ab-editor-field__input';
    input.type = 'text';
    input.value = String(round[spec.key] ?? '');
    input.dir = 'rtl';
    if (spec.maxLength) input.maxLength = spec.maxLength;
    input.addEventListener('input', () => onFieldChange(currentRoundId!, spec.key, input.value));
    return input;
  }

  function _buildEmojiInput(spec: FieldSpec, round: RoundRecord): HTMLElement {
    const row = document.createElement('div');
    row.className = 'ab-editor-field__emoji-row';

    const preview = document.createElement('div');
    preview.className = 'ab-editor-field__emoji-preview';
    preview.textContent = String(round[spec.key] ?? '❓');
    row.appendChild(preview);

    const input = document.createElement('input');
    input.className = 'ab-editor-field__input';
    input.type = 'text';
    input.value = String(round[spec.key] ?? '');
    input.maxLength = 8;
    input.placeholder = '🐱';
    input.style.fontSize = '20px';
    input.addEventListener('input', () => {
      preview.textContent = input.value || '❓';
      onFieldChange(currentRoundId!, spec.key, input.value);
    });
    row.appendChild(input);
    return row;
  }

  function _buildToggle(spec: FieldSpec, round: RoundRecord): HTMLElement {
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = Boolean(round[spec.key]);
    input.addEventListener('change', () => onFieldChange(currentRoundId!, spec.key, input.checked));
    return input;
  }

  function _buildSelect(spec: FieldSpec, round: RoundRecord): HTMLElement {
    const select = document.createElement('select');
    select.className = 'ab-editor-field__input';
    (spec.options ?? []).forEach(opt => {
      const option = document.createElement('option');
      option.value = opt;
      option.textContent = opt;
      if (round[spec.key] === opt) option.selected = true;
      select.appendChild(option);
    });
    select.addEventListener('change', () => onFieldChange(currentRoundId!, spec.key, select.value));
    return select;
  }

  function _buildNumberInput(spec: FieldSpec, round: RoundRecord): HTMLElement {
    const input = document.createElement('input');
    input.className = 'ab-editor-field__input';
    input.type = 'number';
    input.value = String(round[spec.key] ?? '');
    if (spec.min !== undefined) input.min = String(spec.min);
    if (spec.max !== undefined) input.max = String(spec.max);
    input.addEventListener('input', () => onFieldChange(currentRoundId!, spec.key, Number(input.value)));
    return input;
  }

  function _buildImageField(round: RoundRecord): HTMLElement {
    const section = document.createElement('div');
    section.className = 'ab-editor-field ab-editor-field--image';

    const label = document.createElement('label');
    label.className = 'ab-editor-field__label';
    label.textContent = '🖼 תמונה';
    section.appendChild(label);

    const row = document.createElement('div');
    row.className = 'ab-editor-field__img-row';

    const preview = document.createElement('div');
    preview.className = 'ab-editor-field__img-preview';
    if (round.image) preview.style.backgroundImage = `url(${round.image as string})`;
    row.appendChild(preview);

    const btnCol = document.createElement('div');
    btnCol.className = 'ab-editor-field__img-btns';

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    fileInput.addEventListener('change', () => {
      const file = fileInput.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = e => {
        const dataUrl = (e.target as FileReader).result as string;
        preview.style.backgroundImage = `url(${dataUrl})`;
        uploadBtn.textContent = '🔄 החלף';
        onFieldChange(currentRoundId!, 'image', dataUrl);
        if (!clearBtn.isConnected) btnCol.appendChild(clearBtn);
      };
      reader.readAsDataURL(file);
    });
    btnCol.appendChild(fileInput);

    const uploadBtn = document.createElement('button');
    uploadBtn.className = 'ab-editor-btn ab-editor-btn--img-upload';
    uploadBtn.textContent = round.image ? '🔄 החלף' : '📤 העלה';
    uploadBtn.addEventListener('click', () => fileInput.click());
    btnCol.appendChild(uploadBtn);

    const clearBtn = document.createElement('button');
    clearBtn.className = 'ab-editor-btn ab-editor-btn--img-clear';
    clearBtn.textContent = '✕ הסר';
    clearBtn.addEventListener('click', () => {
      preview.style.backgroundImage = '';
      uploadBtn.textContent = '📤 העלה';
      onFieldChange(currentRoundId!, 'image', null);
      clearBtn.remove();
    });
    if (round.image) btnCol.appendChild(clearBtn);

    row.appendChild(btnCol);
    section.appendChild(row);
    return section;
  }

  // ── destroy ──────────────────────────────────────────────────────────────

  function destroy() { panel.remove(); }

  clear();
  return { loadRound, clear, destroy };
}
