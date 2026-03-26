/**
 * GameEditor — live game editing in TinyTap style.
 *
 * Keyboard shortcuts (edit mode only):
 *   Ctrl/Cmd + S       — save
 *   Ctrl/Cmd + Z       — undo
 *   Ctrl/Cmd + Y  /
 *   Ctrl/Cmd + Shift+Z — redo
 *   Escape             — exit to play mode
 */
import './editor-styles.css';
import { z } from 'zod';
import { createEditorOverlay }   from './editor-overlay.js';
import { createSlideNavigator }  from './slide-navigator.js';
import { createRoundInspector }  from './round-inspector.js';
import { saveGameData, exportGameDataAsJSON } from './editor-storage.js';
import { showAudioManager }      from './audio-manager.js';
import type { GameData }         from './game-data.js';

export interface GameEditorOptions {
  restartGame?: (container: HTMLElement) => void;
  /** Zod schema for the round fields shown in the inspector. */
  roundSchema?: z.ZodObject<z.ZodRawShape>;
}

export class GameEditor {
  private _container:   HTMLElement;
  private _gameData:    GameData;
  private _restartGame: ((c: HTMLElement) => void) | undefined;
  private _roundSchema: z.ZodObject<z.ZodRawShape> | undefined;
  private _mode:        'play' | 'edit' = 'play';

  private _overlay:   ReturnType<typeof createEditorOverlay>   | null = null;
  private _navigator: ReturnType<typeof createSlideNavigator>  | null = null;
  private _inspector: ReturnType<typeof createRoundInspector>  | null = null;
  private _toolbar:   HTMLElement | null = null;
  private _selectedId: string | null = null;

  private _undoBtn: HTMLButtonElement | null = null;
  private _redoBtn: HTMLButtonElement | null = null;
  private _shortcutHandler: ((e: KeyboardEvent) => void) | null = null;

  constructor(container: HTMLElement, gameData: GameData, options: GameEditorOptions = {}) {
    this._container   = container;
    this._gameData    = gameData;
    this._restartGame = options.restartGame;
    this._roundSchema = options.roundSchema;
    requestAnimationFrame(() => this._injectToolbar());
  }

  // ── Toolbar ───────────────────────────────────────────────────────────────

  private _injectToolbar() {
    const spacer = this._container.querySelector('.game-header__spacer');
    if (!spacer) return;

    this._toolbar = document.createElement('div');
    this._toolbar.className = 'ab-editor-toolbar';
    this._toolbar.append(
      this._makeBtn('✏️ ערוך', 'ab-editor-btn--edit',  () => this.enterEditMode()),
      this._makeBtn('🎤 קול',  'ab-editor-btn--audio', () => this._openAudioManager()),
    );

    spacer.innerHTML = '';
    spacer.appendChild(this._toolbar);
  }

  private _makeBtn(label: string, cls: string, onClick: () => void): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.className = `ab-editor-btn ${cls}`;
    btn.innerHTML = label;
    btn.addEventListener('click', onClick);
    return btn;
  }

  private _setToolbarEditMode() {
    if (!this._toolbar) return;
    this._toolbar.innerHTML = '';

    this._undoBtn = this._makeBtn('↩', 'ab-editor-btn--undo', () => this._undo());
    this._undoBtn.title = 'בטל (Ctrl+Z)';

    this._redoBtn = this._makeBtn('↪', 'ab-editor-btn--redo', () => this._redo());
    this._redoBtn.title = 'בצע שנית (Ctrl+Y)';

    this._toolbar.append(
      this._makeBtn('▶ שחק',  'ab-editor-btn--play',   () => this.enterPlayMode()),
      this._makeBtn('+ הוסף', 'ab-editor-btn--add',    () => this._addRound()),
      this._undoBtn,
      this._redoBtn,
      this._makeBtn('💾 שמור', 'ab-editor-btn--save',   () => this._save()),
      this._makeBtn('🎤 קול',  'ab-editor-btn--audio',  () => this._openAudioManager()),
      this._makeBtn('⬇ ייצוא','ab-editor-btn--export',  () => exportGameDataAsJSON(this._gameData)),
    );
    this._refreshUndoButtons();
  }

  private _setToolbarPlayMode() {
    if (!this._toolbar) return;
    this._toolbar.innerHTML = '';
    this._undoBtn = null;
    this._redoBtn = null;
    this._toolbar.append(
      this._makeBtn('✏️ ערוך', 'ab-editor-btn--edit',  () => this.enterEditMode()),
      this._makeBtn('🎤 קול',  'ab-editor-btn--audio', () => this._openAudioManager()),
    );
  }

  // ── Mode switching ────────────────────────────────────────────────────────

  enterEditMode() {
    if (this._mode === 'edit') return;
    this._mode = 'edit';
    this._container.classList.add('ab-editor-active');
    this._setToolbarEditMode();
    this._attachShortcuts();

    const body = this._container.querySelector<HTMLElement>('.game-body');
    if (!body) return;

    this._overlay = createEditorOverlay(body);
    this._overlay.show();

    this._navigator = createSlideNavigator(this._container, this._gameData, {
      onSelectRound:    id      => this._selectRound(id),
      onAddRound:       afterId => this._addRound(afterId),
      onDuplicateRound: id      => this._duplicateRound(id),
      onMoveRound:     (id, to) => this._moveRound(id, to),
    });

    this._inspector = createRoundInspector(this._container, {
      onFieldChange:  (id, key, val) => this._onFieldChange(id, key, val),
      onDeleteRound:  id             => this._deleteRound(id),
      roundSchema:    this._roundSchema,
    });

    const rounds = this._gameData.rounds;
    if (rounds.length > 0) this._selectRound(rounds[0].id);
  }

  enterPlayMode() {
    if (this._mode === 'play') return;
    this._mode = 'play';
    this._container.classList.remove('ab-editor-active');
    this._setToolbarPlayMode();
    this._detachShortcuts();

    this._overlay?.destroy();
    this._navigator?.destroy();
    this._inspector?.destroy();
    this._overlay = this._navigator = this._inspector = null;
    this._selectedId = null;

    this._restartGame?.(this._container);
  }

  // ── Round management ──────────────────────────────────────────────────────

  private _selectRound(id: string) {
    this._selectedId = id;
    this._navigator?.setActiveRound(id);
    const round = this._gameData.getRound(id);
    if (round) this._inspector?.loadRound(round, this._gameData.meta.type as string);
  }

  private _addRound(afterId: string | null = null) {
    const newId = this._gameData.addRound(afterId ?? this._selectedId);
    this._navigator?.refresh();
    this._selectRound(newId);
    this._refreshUndoButtons();
  }

  private _duplicateRound(id: string) {
    const newId = this._gameData.duplicateRound(id ?? this._selectedId);
    if (!newId) return;
    this._navigator?.refresh();
    this._selectRound(newId);
    this._refreshUndoButtons();
  }

  private _deleteRound(id: string) {
    this._gameData.removeRound(id);
    this._navigator?.refresh();
    const rounds = this._gameData.rounds;
    if (rounds.length > 0) this._selectRound(rounds[0].id);
    this._refreshUndoButtons();
  }

  private _moveRound(id: string, toIndex: number) {
    this._gameData.moveRound(id, toIndex);
    this._navigator?.refresh();
    this._navigator?.setActiveRound(id);
    this._refreshUndoButtons();
  }

  private _onFieldChange(id: string, key: string, value: unknown) {
    this._gameData.updateRound(id, { [key]: value });
    this._navigator?.refresh();
    this._navigator?.setActiveRound(id);
    this._refreshUndoButtons();
  }

  // ── Undo / Redo ───────────────────────────────────────────────────────────

  private _undo() {
    if (!this._gameData.canUndo) return;
    this._gameData.undo();
    this._navigator?.refresh();
    this._resyncSelection();
    this._refreshUndoButtons();
    this._showToast('↩ בוטל');
  }

  private _redo() {
    if (!this._gameData.canRedo) return;
    this._gameData.redo();
    this._navigator?.refresh();
    this._resyncSelection();
    this._refreshUndoButtons();
    this._showToast('↪ בוצע שנית');
  }

  private _resyncSelection() {
    const rounds = this._gameData.rounds;
    const still  = rounds.find(r => r.id === this._selectedId);
    this._selectRound(still ? this._selectedId! : rounds[0]?.id);
  }

  private _refreshUndoButtons() {
    if (this._undoBtn) this._undoBtn.disabled = !this._gameData.canUndo;
    if (this._redoBtn) this._redoBtn.disabled = !this._gameData.canRedo;
  }

  // ── Keyboard shortcuts ────────────────────────────────────────────────────

  private _attachShortcuts() {
    this._shortcutHandler = (e: KeyboardEvent) => {
      if (this._mode !== 'edit') return;
      const ctrl = e.ctrlKey || e.metaKey;
      if (e.key === 'Escape')                                        { this.enterPlayMode(); return; }
      if (ctrl && !e.shiftKey && e.key.toLowerCase() === 's')        { e.preventDefault(); this._save(); return; }
      if (ctrl && !e.shiftKey && e.key.toLowerCase() === 'z')        { e.preventDefault(); this._undo(); return; }
      if (ctrl && (e.key.toLowerCase() === 'y' ||
         (e.shiftKey && e.key.toLowerCase() === 'z')))               { e.preventDefault(); this._redo(); return; }
    };
    document.addEventListener('keydown', this._shortcutHandler);
  }

  private _detachShortcuts() {
    if (this._shortcutHandler) {
      document.removeEventListener('keydown', this._shortcutHandler);
      this._shortcutHandler = null;
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private _openAudioManager() { showAudioManager(this._gameData.id, this._gameData); }

  private _save() {
    saveGameData(this._gameData);
    this._showToast('✅ נשמר!');
  }

  private _showToast(message: string) {
    const toast = document.createElement('div');
    toast.className = 'ab-editor-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2200);
  }
}
