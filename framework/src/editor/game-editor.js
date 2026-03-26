/**
 * GameEditor — עורך משחק חי בסגנון TinyTap
 * מוסיף כפתור "ערוך / שחק" לכותרת ומנהל את מצב העריכה
 */

import './editor-styles.css';
import { createEditorOverlay }   from './editor-overlay.js';
import { createSlideNavigator }  from './slide-navigator.js';
import { createRoundInspector }  from './round-inspector.js';
import { saveGameData, exportGameDataAsJSON } from './editor-storage.js';

export class GameEditor {
  /**
   * @param {HTMLElement} container  — same container passed to GameShell
   * @param {import('./game-data.js').GameData} gameData
   * @param {{
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

    // Wait for GameShell to finish building the DOM before injecting toolbar
    requestAnimationFrame(() => this._injectToolbar());
  }

  // ── Toolbar ──────────────────────────────────────────────────────────────

  _injectToolbar() {
    const spacer = this._container.querySelector('.game-header__spacer');
    if (!spacer) return;

    this._toolbar = document.createElement('div');
    this._toolbar.className = 'ab-editor-toolbar';

    this._editBtn = this._makeBtn('✏️ ערוך', 'ab-editor-btn--edit', () => this.enterEditMode());
    this._toolbar.appendChild(this._editBtn);

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
    const exportBtn = this._makeBtn('⬇ ייצוא',  'ab-editor-btn--export', () => exportGameDataAsJSON(this._gameData));
    this._toolbar.append(playBtn, addBtn, saveBtn, exportBtn);
  }

  _setToolbarPlayMode() {
    this._toolbar.innerHTML = '';
    this._editBtn = this._makeBtn('✏️ ערוך', 'ab-editor-btn--edit', () => this.enterEditMode());
    this._toolbar.appendChild(this._editBtn);
  }

  // ── Mode switching ────────────────────────────────────────────────────────

  enterEditMode() {
    if (this._mode === 'edit') return;
    this._mode = 'edit';
    this._container.classList.add('ab-editor-active');
    this._setToolbarEditMode();

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
        onSelectRound: id => this._selectRound(id),
        onAddRound:    afterId => this._addRound(afterId),
      }
    );

    // Round inspector
    this._inspector = createRoundInspector(
      this._container,
      {
        gameId:           this._gameData.id,
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
  }

  _deleteRound(id) {
    this._gameData.removeRound(id);
    this._navigator?.refresh();
    const rounds = this._gameData.rounds;
    if (rounds.length > 0) {
      this._selectRound(rounds[0].id);
    }
  }

  _onFieldChange(id, key, value) {
    this._gameData.updateRound(id, { [key]: value });
    this._navigator?.refresh();
    this._navigator?.setActiveRound(id);
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
