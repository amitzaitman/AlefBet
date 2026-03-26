/**
 * GameData — מודל נתוני המשחק הניתן לעריכה
 * מנהל סיבובים, אירועי שינוי, ו-serialization לאחסון
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
    this._rounds[idx] = { ...this._rounds[idx], ...patch };
    this._emit();
  }

  addRound(afterId = null) {
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

  removeRound(id) {
    const idx = this.getRoundIndex(id);
    if (idx === -1 || this._rounds.length <= 1) return; // keep at least 1
    this._rounds.splice(idx, 1);
    this._emit();
  }

  moveRound(id, toIndex) {
    const fromIndex = this.getRoundIndex(id);
    if (fromIndex === -1) return;
    const [round] = this._rounds.splice(fromIndex, 1);
    this._rounds.splice(Math.max(0, Math.min(toIndex, this._rounds.length)), 0, round);
    this._emit();
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
