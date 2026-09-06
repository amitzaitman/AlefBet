/**
 * מעטפת המשחק
 * מנהל את המיכל, מחזור החיים וממשק המשתמש הבסיסי
 */
import { EventBus } from './events.js';
import { GameState } from './state.js';

const activeShells = new WeakMap();

/** מסיים משחק קודם לפני החלפת תוכן המיכל. */
export function endGame(container) {
  activeShells.get(container)?.end();
}

export class GameShell {
  /**
   * @param {HTMLElement} containerEl - אלמנט המיכל
   * @param {object} config - הגדרות: { totalRounds, title, homeUrl }
   */
  constructor(containerEl, config = {}) {
    endGame(containerEl);
    activeShells.set(containerEl, this);
    this.ended = false;
    this._timers = new Set();
    this.container = containerEl;
    this.config = {
      totalRounds: 8,
      title: 'מִשְׂחָק',
      homeUrl: '../../index.html',
      ...config,
    };
    this.events = new EventBus();
    this.state = new GameState(this.config.totalRounds);
    /**
     * מזהה המשחק לצורך זיכרון התקדמות (core/progress.js).
     * מוגדר על ידי bootstrapGame; ריק במעטפות שנבנו ידנית.
     * @type {string}
     */
    this.gameId = typeof config.gameId === 'string' ? config.gameId : '';
    this._buildShell();
  }

  _buildShell() {
    this.container.classList.add('alefbet-game');

    const backBtn = this.config.homeUrl
      ? `<a href="${this.config.homeUrl}" class="game-back-btn" aria-label="סִפְרִיַּית מִשְׂחָקִים">🏠</a>`
      : '<div class="game-header__spacer"></div>';

    this.container.innerHTML = `
      <div class="game-header">
        <div class="game-header__spacer"></div>
        <h1 class="game-title"></h1>
        ${backBtn}
      </div>
      <div class="game-body"></div>
      <div class="game-footer"></div>
    `;

    this.titleEl  = this.container.querySelector('.game-title');
    this.bodyEl   = this.container.querySelector('.game-body');
    this.footerEl = this.container.querySelector('.game-footer');
    this.setTitle(this.config.title);
  }

  /** עדכן את כותרת המשחק */
  setTitle(title) {
    this.titleEl.textContent = title;
  }

  /** התחל את המשחק */
  start() {
    if (this.ended) return;
    this.state.nextRound();
    this.events.emit('start', { state: this.state });
  }

  /** עבור לסיבוב הבא */
  nextRound() {
    if (this.ended) return false;
    const hasMore = this.state.nextRound();
    if (hasMore) {
      this.events.emit('round', { state: this.state });
    } else {
      this.end(this.state.score);
    }
    return hasMore;
  }

  /** סיים את המשחק */
  end(score = this.state.score) {
    if (this.ended) return;
    this.ended = true;
    for (const timer of this._timers) clearTimeout(timer);
    this._timers.clear();
    if (activeShells.get(this.container) === this) activeShells.delete(this.container);
    this.events.emit('end', { score, state: this.state });
  }

  /** פעולה מושהית מתבטלת אוטומטית בסיום או בהפעלה מחדש. */
  schedule(callback, delayMs) {
    if (this.ended) return;
    const timer = setTimeout(() => {
      this._timers.delete(timer);
      if (!this.ended) callback();
    }, delayMs);
    this._timers.add(timer);
  }

  /** המתנה מתבטלת בסיום; false אומר שאין להמשיך בפעולה. */
  delay(delayMs) {
    return new Promise(resolve => {
      if (this.ended) { resolve(false); return; }
      const cancel = () => resolve(false);
      this.events.on('end', cancel);
      this.schedule(() => {
        this.events.off('end', cancel);
        resolve(true);
      }, delayMs);
    });
  }

  /** קבל את מצב המשחק הנוכחי */
  getState() { return this.state; }

  /** הירשם לאירועי מחזור החיים: start, round, end */
  on(event, handler) {
    this.events.on(event, handler);
    return this;
  }
}
