/**
 * GameEditor — עורך משחק חי בסגנון TinyTap
 * מוסיף כפתור "ערוך / שחק" לכותרת ומנהל את מצב העריכה
 *
 * קיצורי מקלדת בעריכה:
 *   Ctrl/Cmd + S  — שמור
 *   Ctrl/Cmd + Z  — בטל פעולה
 *   Ctrl/Cmd + Y  — בצע שנית (גם Ctrl+Shift+Z)
 *   Escape        — חזור למצב שחקיה
 */

import './editor-styles.css';
import { createEditorOverlay }   from './editor-overlay.js';
import { createSlideNavigator }  from './slide-navigator.js';
import { createRoundInspector }  from './round-inspector.js';
import { saveGameData, exportGameDataAsJSON } from './editor-storage.js';
import { showAudioManager }      from './audio-manager.js';

export class GameEditor {
  /**
   * @param {HTMLElement} container  — same container passed to GameShell
   * @param {import('./game-data.js').GameData} gameData
   * @param {{\
   *   restartGame:       (container: HTMLElement) => void,
   *   getEditableFields?: (type: string) => object[],
   * }} options
   */
  constructor(container, gameData, { restartGame, getEditableFields } = {}) {
    this._container        = container;
    this._gameData         = gameData;
    this._restartGame      = restartGame;
    this._getEditableFields = getEditableFields || null;
    this._mode             = 'play';

    this._overlay    = null;
    this._navigator  = null;
    this._inspector  = null;
    this._toolbar    = null;
    this._selectedId = null;

    this._undoBtn    = null;
    this._redoBtn    = null;
    this._shortcutHandler = null;

    // Wait for GameShell to finish building the DOM before injecting toolbar
    requestAnimationFrame(() => this._injectToolbar());
  }

  // ── Toolbar ──────────────────────────────────────────────────────────────

  _injectToolbar() {
    const spacer = this._container.querySelector('.game-header__spacer');
    if (!spacer) return;

    this._toolbar = document.createElement('div');
    this._toolbar.className = 'ab-editor-toolbar';

    this._editBtn  = this._makeBtn('✏️ ערוך', 'ab-editor-btn--edit',  () => this.enterEditMode());
    this._audioBtn = this._makeBtn('🎤 קול',  'ab-editor-btn--audio', () => this._openAudioManager());
    this._toolbar.append(this._editBtn, this._audioBtn);

    spacer.innerHTML = '';
    spacer.appendChild(this._toolbar);
  }

  _makeBtn(label, cls, onClick) {
    const btn = document.createElement('button');
    btn.className = `ab-editor-btn ${cls}`;
    btn.innerHTML = label;
    btn.addEventListener('click', onClick);
    return btn;
  }

  _setToolbarEditMode() {
    this._toolbar.innerHTML = '';

    const playBtn   = this._makeBtn('▶ שחק',   'ab-editor-btn--play',   () => this.enterPlayMode());
    const addBtn    = this._makeBtn('+ הוסף',   'ab-editor-btn--add',    () => this._addRound());
    const saveBtn   = this._makeBtn('💾 שמור',  'ab-editor-btn--save',   () => this._save());
    const audioBtn  = this._makeBtn('🎤 קול',   'ab-editor-btn--audio',  () => this._openAudioManager());
    const exportBtn = this._makeBtn('⬇ ייצוא',  'ab-editor-btn--export', () => exportGameDataAsJSON(this._gameData));

    this._undoBtn = this._makeBtn('↩', 'ab-editor-btn--undo', () => this._undo());
    this._undoBtn.title = 'בטל (Ctrl+Z)';

    this._redoBtn = this._makeBtn('↪', 'ab-editor-btn--redo', () => this._redo());
    this._redoBtn.title = 'בצע שנית (Ctrl+Y)';

    this._toolbar.append(playBtn, addBtn, this._undoBtn, this._redoBtn, saveBtn, audioBtn, exportBtn);
    this._refreshUndoButtons();
  }

  _setToolbarPlayMode() {
    this._toolbar.innerHTML = '';
    this._undoBtn = null;
    this._redoBtn = null;
    this._editBtn  = this._makeBtn('✏️ ערוך', 'ab-editor-btn--edit',  () => this.enterEditMode());
    this._audioBtn = this._makeBtn('🎤 קול',  'ab-editor-btn--audio', () => this._openAudioManager());
    this._toolbar.append(this._editBtn, this._audioBtn);
  }

  // ── Mode switching ────────────────────────────────────────────────────────

  enterEditMode() {
    if (this._mode === 'edit') return;
    this._mode = 'edit';
    this._container.classList.add('ab-editor-active');
    this._setToolbarEditMode();
    this._attachShortcuts();

    const gameBodyEl = this._container.querySelector('.game-body');
    if (!gameBodyEl) return;

    // Overlay
    this._overlay = createEditorOverlay(gameBodyEl);
    this._overlay.show();

    // Slide navigator
    this._navigator = createSlideNavigator(
      this._container,
      this._gameData,
      {
        onSelectRound:    id       => this._selectRound(id),
        onAddRound:       afterId  => this._addRound(afterId),
        onDuplicateRound: id       => this._duplicateRound(id),
        onMoveRound:      (id, to) => this._moveRound(id, to),
      }
    );

    // Round inspector
    this._inspector = createRoundInspector(
      this._container,
      {
        onFieldChange:    (id, key, val) => this._onFieldChange(id, key, val),
        onDeleteRound:    id => this._deleteRound(id),
        getEditableFields: this._getEditableFields,
      }
    );

    // Select first round by default
    const rounds = this._gameData.rounds;
    if (rounds.length > 0) {
      this._selectRound(rounds[0].id);
    }
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

    // Restart game so it picks up any changes
    this._restartGame?.(this._container);
  }

  // ── Round management ──────────────────────────────────────────────────────

  _selectRound(id) {
    this._selectedId = id;
    this._navigator?.setActiveRound(id);
    const round = this._gameData.getRound(id);
    if (round) {
      this._inspector?.loadRound(round, this._gameData.meta.type);
    }
  }

  _addRound(afterId = null) {
    const newId = this._gameData.addRound(afterId ?? this._selectedId);
    this._navigator?.refresh();
    this._selectRound(newId);
    this._refreshUndoButtons();
  }

  _duplicateRound(id) {
    const newId = this._gameData.duplicateRound(id ?? this._selectedId);
    if (!newId) return;
    this._navigator?.refresh();
    this._selectRound(newId);
    this._refreshUndoButtons();
  }

  _deleteRound(id) {
    this._gameData.removeRound(id);
    this._navigator?.refresh();
    const rounds = this._gameData.rounds;
    if (rounds.length > 0) {
      this._selectRound(rounds[0].id);
    }
    this._refreshUndoButtons();
  }

  _moveRound(id, toIndex) {
    this._gameData.moveRound(id, toIndex);
    this._navigator?.refresh();
    this._navigator?.setActiveRound(id);
    this._refreshUndoButtons();
  }

  _onFieldChange(id, key, value) {
    this._gameData.updateRound(id, { [key]: value });
    this._navigator?.refresh();
    this._navigator?.setActiveRound(id);
    this._refreshUndoButtons();
  }

  // ── Undo / Redo ───────────────────────────────────────────────────────────

  _undo() {
    if (!this._gameData.canUndo) return;
    this._gameData.undo();
    this._navigator?.refresh();
    this._resyncSelection();
    this._refreshUndoButtons();
    this._showToast('↩ בוטל');
  }

  _redo() {
    if (!this._gameData.canRedo) return;
    this._gameData.redo();
    this._navigator?.refresh();
    this._resyncSelection();
    this._refreshUndoButtons();
    this._showToast('↪ בוצע שנית');
  }

  /** Re-select the current round (or fall back to first) after undo/redo. */
  _resyncSelection() {
    const rounds = this._gameData.rounds;
    const stillExists = rounds.find(r => r.id === this._selectedId);
    if (stillExists) {
      this._selectRound(this._selectedId);
    } else if (rounds.length > 0) {
      this._selectRound(rounds[0].id);
    }
  }

  _refreshUndoButtons() {
    if (this._undoBtn) this._undoBtn.disabled = !this._gameData.canUndo;
    if (this._redoBtn) this._redoBtn.disabled = !this._gameData.canRedo;
  }

  // ── Keyboard shortcuts ────────────────────────────────────────────────────

  _attachShortcuts() {
    this._shortcutHandler = (e) => {
      if (this._mode !== 'edit') return;
      const ctrl = e.ctrlKey || e.metaKey;

      if (e.key === 'Escape') {
        this.enterPlayMode();
        return;
      }
      if (ctrl && !e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        this._save();
        return;
      }
      if (ctrl && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        this._undo();
        return;
      }
      if (ctrl && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) {
        e.preventDefault();
        this._redo();
        return;
      }
    };
    document.addEventListener('keydown', this._shortcutHandler);
  }

  _detachShortcuts() {
    if (this._shortcutHandler) {
      document.removeEventListener('keydown', this._shortcutHandler);
      this._shortcutHandler = null;
    }
  }

  // ── Audio Manager ─────────────────────────────────────────────────────────

  _openAudioManager() {
    showAudioManager(this._gameData.id, this._gameData);
  }

  // ── Save ──────────────────────────────────────────────────────────────────

  _save() {
    saveGameData(this._gameData);
    this._showToast('✅ נשמר!');
  }

  _showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'ab-editor-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2200);
  }
}
