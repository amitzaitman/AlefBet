/**
 * מצב המשחק
 * מנהל ניקוד, סיבובים והתקדמות
 */
export class GameState {
  constructor(totalRounds) {
    this._totalRounds = totalRounds;
    this._currentRound = 0;
    this._score = 0;
  }

  get currentRound() { return this._currentRound; }
  get score() { return this._score; }
  get totalRounds() { return this._totalRounds; }

  /** הוסף ניקוד */
  addScore(points) {
    this._score += points;
  }

  /** עבור לסיבוב הבא. מחזיר false אם המשחק הסתיים */
  nextRound() {
    if (this._currentRound >= this._totalRounds) return false;
    this._currentRound++;
    return this._currentRound <= this._totalRounds;
  }

  /** קבל מידע על התקדמות */
  get progress() {
    return {
      current: this._currentRound,
      total: this._totalRounds,
      percentage: Math.round((this._currentRound / this._totalRounds) * 100),
    };
  }

  get isComplete() {
    return this._currentRound >= this._totalRounds;
  }
}
