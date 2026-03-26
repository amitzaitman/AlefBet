/**
 * GameData — מודל נתוני המשחק הניתן לעריכה
 * מנהל סיבובים, אירועי שינוי, undo/redo ו-serialization לאחסון
 */

let _idCounter = 0;
function generateId() {
  return `round-${Date.now()}-${_idCounter++}`;
}

export class GameData {
  /**
   * @param {object} schema - { id, version, meta, rounds, distractors }
   */
  constructor(schema) {
    this._id          = schema.id || 'game';
    this._version     = schema.version || 1;
    this._meta        = { title: '', type: 'multiple-choice', ...schema.meta };
    this._rounds      = (schema.rounds || []).map(r => ({ ...r, id: r.id || generateId() }));
    this._distractors = schema.distractors || [];
    this._handlers    = [];
    this._past        = [];   // undo stack (rounds snapshots, oldest → newest)
    this._future      = [];   // redo stack (most-recent-undone first)
  }

  // ── Identity ────────────────────────────────────────────────────────────

  get id()          { return this._id; }
  get meta()        { return { ...this._meta }; }
  get distractors() { return this._distractors; }

  // ── Rounds (read) ────────────────────────────────────────────────────────

  get rounds() { return [...this._rounds]; }

  getRound(id) {
    return this._rounds.find(r => r.id === id) || null;
  }

  getRoundIndex(id) {
    return this._rounds.findIndex(r => r.id === id);
  }

  // ── Rounds (write) ───────────────────────────────────────────────────────

  updateRound(id, patch) {
    const idx = this.getRoundIndex(id);
    if (idx === -1) return;
    this._saveHistory();
    this._rounds[idx] = { ...this._rounds[idx], ...patch };
    this._emit();
  }

  addRound(afterId = null) {
    this._saveHistory();
    const blank = { id: generateId(), target: '', correct: '', correctEmoji: '❓' };
    if (afterId === null) {
      this._rounds.push(blank);
    } else {
      const idx = this.getRoundIndex(afterId);
      this._rounds.splice(idx + 1, 0, blank);
    }
    this._emit();
    return blank.id;
  }

  /**
   * שכפל סיבוב קיים ומקם את העותק מיד אחריו.
   * @param {string} id
   * @returns {string|null} מזהה הסיבוב החדש, או null אם לא נמצא
   */
  duplicateRound(id) {
    const round = this.getRound(id);
    if (!round) return null;
    this._saveHistory();
    const copy = { ...round, id: generateId() };
    const idx  = this.getRoundIndex(id);
    this._rounds.splice(idx + 1, 0, copy);
    this._emit();
    return copy.id;
  }

  removeRound(id) {
    const idx = this.getRoundIndex(id);
    if (idx === -1 || this._rounds.length <= 1) return; // keep at least 1
    this._saveHistory();
    this._rounds.splice(idx, 1);
    this._emit();
  }

  moveRound(id, toIndex) {
    const fromIndex = this.getRoundIndex(id);
    if (fromIndex === -1) return;
    this._saveHistory();
    const [round] = this._rounds.splice(fromIndex, 1);
    this._rounds.splice(Math.max(0, Math.min(toIndex, this._rounds.length)), 0, round);
    this._emit();
  }

  // ── Undo / Redo ──────────────────────────────────────────────────────────

  get canUndo() { return this._past.length > 0; }
  get canRedo() { return this._future.length > 0; }

  undo() {
    if (!this.canUndo) return;
    this._future.push(this._rounds.map(r => ({ ...r })));
    this._rounds = this._past.pop();
    this._emit();
  }

  redo() {
    if (!this.canRedo) return;
    this._past.push(this._rounds.map(r => ({ ...r })));
    this._rounds = this._future.pop();
    this._emit();
  }

  _saveHistory() {
    this._past.push(this._rounds.map(r => ({ ...r })));
    this._future = [];                        // new mutation clears redo
    if (this._past.length > 50) this._past.shift();
  }

  // ── Change events ────────────────────────────────────────────────────────

  onChange(handler) {
    this._handlers.push(handler);
    return () => this.offChange(handler);
  }

  offChange(handler) {
    const idx = this._handlers.indexOf(handler);
    if (idx !== -1) this._handlers.splice(idx, 1);
  }

  _emit() {
    this._handlers.forEach(fn => fn(this));
  }

  // ── Serialization ────────────────────────────────────────────────────────

  toJSON() {
    return {
      id:          this._id,
      version:     this._version,
      meta:        { ...this._meta },
      rounds:      this._rounds.map(r => ({ ...r })),
      distractors: this._distractors,
    };
  }

  static fromJSON(json) {
    return new GameData(json);
  }

  /**
   * Migration helper: convert a plain ROUNDS array into a GameData instance.
   * @param {string} gameId
   * @param {object[]} rounds
   * @param {object} meta - { title, type }
   * @param {object[]} [distractors]
   */
  static fromRoundsArray(gameId, rounds, meta = {}, distractors = []) {
    return new GameData({ id: gameId, meta, rounds, distractors });
  }
}
