/**
 * round-inspector — editable fields panel for the selected round.
 *
 * Fields are derived automatically from a Zod schema via schemaToFields().
 */
import { LitElement, html } from 'lit';
import { z } from 'zod';
import { schemaToFields, type FieldSpec } from './schema-to-fields.js';
import { BUILTIN_ROUND_SCHEMAS } from './schemas.js';
import type { RoundRecord } from './schemas.js';

export interface RoundInspectorOptions {
  onFieldChange: (roundId: string, key: string, value: unknown) => void;
  onDeleteRound: (roundId: string) => void;
  roundSchema?:  z.ZodObject<z.ZodRawShape>;
}

export interface RoundInspector {
  loadRound(round: RoundRecord, gameType?: string): void;
  clear():   void;
  destroy(): void;
}

// ── Web Component ─────────────────────────────────────────────────────────────

class AbRoundInspector extends LitElement {
  static properties = {
    _round:        { state: true },
    _roundId:      { state: true },
    _hasRound:     { state: true },
    _imageDataUrl: { state: true },
  };

  createRenderRoot() { return this; }

  constructor() {
    super();
    this._round      = null as RoundRecord | null;
    this._roundId    = null as string | null;
    this._hasRound   = false;
    this._imageDataUrl = null as string | null;
    this._gameType   = 'multiple-choice';
    this._roundSchema = null as z.ZodObject<z.ZodRawShape> | null;
    this._onFieldChange = null as ((id: string, key: string, val: unknown) => void) | null;
    this._onDeleteRound = null as ((id: string) => void) | null;
  }

  loadRound(round: RoundRecord, gameType = 'multiple-choice'): void {
    this._gameType   = gameType;
    this._roundId    = round.id;
    this._round      = round;
    this._imageDataUrl = (round.image as string | null | undefined) ?? null;
    this._hasRound   = true;
  }

  clear(): void {
    this._round      = null;
    this._roundId    = null;
    this._hasRound   = false;
    this._imageDataUrl = null;
  }

  private _handleDelete(): void {
    if (confirm('למחוק את הסיבוב הזה?')) {
      this._onDeleteRound?.(this._roundId!);
      this.clear();
    }
  }

  private _handleImageUpload(e: Event): void {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = (ev.target as FileReader).result as string;
      this._imageDataUrl = dataUrl;
      this._onFieldChange?.(this._roundId!, 'image', dataUrl);
    };
    reader.readAsDataURL(file);
  }

  private _clearImage(): void {
    this._imageDataUrl = null;
    this._onFieldChange?.(this._roundId!, 'image', null);
    const input = this.querySelector<HTMLInputElement>('.ab-editor-field__file-input');
    if (input) input.value = '';
  }

  // ── Field renderers ───────────────────────────────────────────────────────

  private _renderField(spec: FieldSpec) {
    const round = this._round!;
    return html`
      <div class="ab-editor-field">
        <label class="ab-editor-field__label">${spec.label}</label>
        ${spec.type === 'emoji'   ? this._renderEmojiInput(spec, round)  : ''}
        ${spec.type === 'boolean' ? this._renderToggle(spec, round)      : ''}
        ${spec.type === 'select'  ? this._renderSelect(spec, round)      : ''}
        ${spec.type === 'number'  ? this._renderNumberInput(spec, round) : ''}
        ${spec.type !== 'emoji' && spec.type !== 'boolean' &&
          spec.type !== 'select' && spec.type !== 'number'
            ? this._renderTextInput(spec, round) : ''}
      </div>
    `;
  }

  private _renderTextInput(spec: FieldSpec, round: RoundRecord) {
    return html`
      <input class="ab-editor-field__input" type="text" dir="rtl"
             .value=${String(round[spec.key] ?? '')}
             maxlength=${spec.maxLength ?? 9999}
             @input=${(e: Event) =>
               this._onFieldChange?.(this._roundId!, spec.key, (e.target as HTMLInputElement).value)}>
    `;
  }

  private _renderEmojiInput(spec: FieldSpec, round: RoundRecord) {
    const val = String(round[spec.key] ?? '');
    return html`
      <div class="ab-editor-field__emoji-row">
        <div class="ab-editor-field__emoji-preview">${val || '❓'}</div>
        <input class="ab-editor-field__input" type="text" .value=${val} maxlength="8"
               placeholder="🐱" style="font-size:20px"
               @input=${(e: Event) => {
                 const v = (e.target as HTMLInputElement).value;
                 const preview = (e.target as HTMLElement)
                   .closest('.ab-editor-field__emoji-row')
                   ?.querySelector('.ab-editor-field__emoji-preview');
                 if (preview) preview.textContent = v || '❓';
                 this._onFieldChange?.(this._roundId!, spec.key, v);
               }}>
      </div>
    `;
  }

  private _renderToggle(spec: FieldSpec, round: RoundRecord) {
    return html`
      <input type="checkbox" .checked=${Boolean(round[spec.key])}
             @change=${(e: Event) =>
               this._onFieldChange?.(this._roundId!, spec.key,
                 (e.target as HTMLInputElement).checked)}>
    `;
  }

  private _renderSelect(spec: FieldSpec, round: RoundRecord) {
    return html`
      <select class="ab-editor-field__input"
              @change=${(e: Event) =>
                this._onFieldChange?.(this._roundId!, spec.key,
                  (e.target as HTMLSelectElement).value)}>
        ${(spec.options ?? []).map(opt => html`
          <option value=${opt} ?selected=${round[spec.key] === opt}>${opt}</option>
        `)}
      </select>
    `;
  }

  private _renderNumberInput(spec: FieldSpec, round: RoundRecord) {
    return html`
      <input class="ab-editor-field__input" type="number"
             .value=${String(round[spec.key] ?? '')}
             min=${spec.min ?? ''}
             max=${spec.max ?? ''}
             @input=${(e: Event) =>
               this._onFieldChange?.(this._roundId!, spec.key,
                 Number((e.target as HTMLInputElement).value))}>
    `;
  }

  private _renderImageField() {
    const hasImage = Boolean(this._imageDataUrl);
    return html`
      <div class="ab-editor-field ab-editor-field--image">
        <label class="ab-editor-field__label">🖼 תמונה</label>
        <div class="ab-editor-field__img-row">
          <div class="ab-editor-field__img-preview"
               style=${hasImage ? `background-image:url(${this._imageDataUrl})` : ''}>
          </div>
          <div class="ab-editor-field__img-btns">
            <input class="ab-editor-field__file-input" type="file" accept="image/*"
                   style="display:none"
                   @change=${this._handleImageUpload}>
            <button class="ab-editor-btn ab-editor-btn--img-upload"
                    @click=${() => this.querySelector<HTMLInputElement>(
                      '.ab-editor-field__file-input')?.click()}>
              ${hasImage ? '🔄 החלף' : '📤 העלה'}
            </button>
            ${hasImage ? html`
              <button class="ab-editor-btn ab-editor-btn--img-clear"
                      @click=${() => this._clearImage()}>✕ הסר</button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  render() {
    const schema = this._roundSchema
      ?? BUILTIN_ROUND_SCHEMAS[this._gameType]
      ?? BUILTIN_ROUND_SCHEMAS['multiple-choice'];
    const fields = this._hasRound ? schemaToFields(schema) : [];

    return html`
      <div class="ab-editor-inspector">
        <div class="ab-editor-inspector__header">
          <span class="ab-editor-inspector__title">✏️ ערוך סיבוב</span>
        </div>
        <div class="ab-editor-inspector__body">
          ${this._hasRound
            ? html`${fields.map(spec => this._renderField(spec))}${this._renderImageField()}`
            : html`<p class="ab-editor-inspector__empty">בחר סיבוב לעריכה</p>`}
        </div>
        ${this._hasRound ? html`
          <button class="ab-editor-inspector__delete"
                  @click=${() => this._handleDelete()}>🗑 מחק סיבוב</button>
        ` : ''}
      </div>
    `;
  }
}

customElements.define('ab-round-inspector', AbRoundInspector);

// ── Factory function (backward-compatible) ────────────────────────────────────

export function createRoundInspector(
  mountEl: HTMLElement,
  { onFieldChange, onDeleteRound, roundSchema }: RoundInspectorOptions,
): RoundInspector {
  const el = document.createElement('ab-round-inspector') as AbRoundInspector;
  el._onFieldChange = onFieldChange;
  el._onDeleteRound = onDeleteRound;
  el._roundSchema   = roundSchema ?? null;
  mountEl.appendChild(el);

  return {
    loadRound: (round, gameType) => el.loadRound(round, gameType),
    clear:     ()                => el.clear(),
    destroy:   ()                => el.remove(),
  };
}
