/**
 * slide-navigator — thumbnail panel for all game rounds.
 * Positioned at inline-start (right in RTL).
 * Supports drag-to-reorder (grip handle) and duplicate (hover button).
 */
import { LitElement, html, PropertyValues } from 'lit';
import { createDragSource, createDropTarget } from '../input/drag.js';
import type { GameData } from './game-data.js';

interface SlideNavigatorCallbacks {
  onSelectRound:    (roundId: string) => void;
  onAddRound:       (afterId: string | null) => void;
  onDuplicateRound: (roundId: string) => void;
  onMoveRound:      (roundId: string, toIndex: number) => void;
}

export interface SlideNavigator {
  refresh():             void;
  setActiveRound(id: string): void;
  destroy():             void;
}

// ── Web Component ─────────────────────────────────────────────────────────────

class AbSlideNavigator extends LitElement {
  static properties = {
    _rounds:   { state: true },
    _activeId: { state: true },
  };

  createRenderRoot() { return this; }

  constructor() {
    super();
    this._rounds   = [] as Array<Record<string, unknown> & { id: string }>;
    this._activeId = null as string | null;
    this._gameData = null as GameData | null;
    this._onSelectRound    = null as ((id: string) => void) | null;
    this._onAddRound       = null as ((afterId: string | null) => void) | null;
    this._onDuplicateRound = null as ((id: string) => void) | null;
    this._onMoveRound      = null as ((id: string, toIndex: number) => void) | null;
    this._ddCleanup        = [] as Array<{ destroy(): void }>;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._ddCleanup.forEach(d => d.destroy());
    this._ddCleanup = [];
  }

  // Re-setup drag/drop only when the rounds list actually changes.
  updated(changedProps: PropertyValues) {
    if (changedProps.has('_rounds')) {
      this._ddCleanup.forEach(d => d.destroy());
      this._ddCleanup = [];

      this.querySelectorAll<HTMLElement>('.ab-editor-nav__thumb').forEach((thumb, i) => {
        const round = this._rounds[i];
        if (!round) return;

        const grip = thumb.querySelector<HTMLElement>('.ab-editor-nav__grip');
        if (grip) {
          this._ddCleanup.push(createDragSource(grip, { roundId: round.id }));
        }

        this._ddCleanup.push(
          createDropTarget(thumb, ({ data }: { data: { roundId: string } }) => {
            if (data.roundId !== round.id) {
              this._onMoveRound?.(data.roundId, this._gameData!.getRoundIndex(round.id));
            }
          }),
        );
      });
    }
  }

  render() {
    return html`
      <div class="ab-editor-nav" aria-label="ניווט סיבובים">
        <div class="ab-editor-nav__header">סיבובים</div>
        <div class="ab-editor-nav__list">
          ${this._rounds.map((round, i) => this._renderThumb(round, i))}
        </div>
        <button class="ab-editor-nav__add"
                @click=${() => this._onAddRound?.(null)}>+ הוסף</button>
      </div>
    `;
  }

  private _renderThumb(round: Record<string, unknown> & { id: string }, index: number) {
    const isActive = round.id === this._activeId;
    return html`
      <div
        class=${'ab-editor-nav__thumb' + (isActive ? ' ab-editor-nav__thumb--active' : '')
          + (round.image ? ' ab-editor-nav__thumb--has-img' : '')}
        role="button"
        tabindex="0"
        aria-label=${`סיבוב ${index + 1}`}
        data-round-id=${round.id}
        style=${round.image ? `background-image:url(${round.image as string})` : ''}
        @click=${() => this._onSelectRound?.(round.id)}
        @keydown=${(e: KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this._onSelectRound?.(round.id);
          }
        }}
      >
        <div class="ab-editor-nav__grip" aria-hidden="true" title="גרור לשינוי סדר">⠿</div>
        <div class="ab-editor-nav__num">${index + 1}</div>
        ${!round.image && round.correctEmoji ? html`
          <div class="ab-editor-nav__emoji">${round.correctEmoji}</div>
        ` : ''}
        ${round.target ? html`
          <div class="ab-editor-nav__letter">${round.target}</div>
        ` : ''}
        <button class="ab-editor-nav__dup" title="שכפל סיבוב" aria-label="שכפל סיבוב"
                @click=${(e: Event) => { e.stopPropagation(); this._onDuplicateRound?.(round.id); }}>
          ⧉
        </button>
      </div>
    `;
  }
}

customElements.define('ab-slide-navigator', AbSlideNavigator);

// ── Factory function (backward-compatible) ────────────────────────────────────

export function createSlideNavigator(
  mountEl:  HTMLElement,
  gameData: GameData,
  { onSelectRound, onAddRound, onDuplicateRound, onMoveRound }: SlideNavigatorCallbacks,
): SlideNavigator {
  const el = document.createElement('ab-slide-navigator') as AbSlideNavigator;
  el._gameData          = gameData;
  el._rounds            = [...gameData.rounds] as Array<Record<string, unknown> & { id: string }>;
  el._onSelectRound     = onSelectRound;
  el._onAddRound        = onAddRound;
  el._onDuplicateRound  = onDuplicateRound;
  el._onMoveRound       = onMoveRound;
  mountEl.appendChild(el);

  return {
    refresh() {
      el._rounds = [...gameData.rounds] as Array<Record<string, unknown> & { id: string }>;
    },
    setActiveRound(id: string) { el._activeId = id; },
    destroy()                  { el.remove(); },
  };
}
