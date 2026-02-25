/**
 * מעטפת המשחק
 * מנהל את המיכל, מחזור החיים וממשק המשתמש הבסיסי
 */
import { EventBus } from './events.js';
import { GameState } from './state.js';

export class GameShell {
  /**
   * @param {HTMLElement} containerEl - אלמנט המיכל
   * @param {object} config - הגדרות: { totalRounds, title }
   */
  constructor(containerEl, config = {}) {
    this.container = containerEl;
    this.config = { totalRounds: 8, title: 'משחק', ...config };
    this.events = new EventBus();
    this.state = new GameState(this.config.totalRounds);
    this._buildShell();
  }

  _buildShell() {
    this.container.classList.add('alefbet-game');
    this.container.innerHTML = `
      <div class="game-header">
        <h1 class="game-title"></h1>
      </div>
      <div class="game-body"></div>
      <div class="game-footer"></div>
    `;
    this.titleEl = this.container.querySelector('.game-title');
    this.bodyEl = this.container.querySelector('.game-body');
    this.footerEl = this.container.querySelector('.game-footer');
    this.setTitle(this.config.title);
  }

  /** עדכן את כותרת המשחק */
  setTitle(title) {
    this.titleEl.textContent = title;
  }

  /** התחל את המשחק */
  start() {
    this.state.nextRound();
    this.events.emit('start', { state: this.state });
  }

  /** עבור לסיבוב הבא */
  nextRound() {
    const hasMore = this.state.nextRound();
    if (hasMore) {
      this.events.emit('round', { state: this.state });
    } else {
      this.end(this.state.score);
    }
    return hasMore;
  }

  /** סיים את המשחק */
  end(score) {
    this.events.emit('end', { score, state: this.state });
  }

  /** קבל את מצב המשחק הנוכחי */
  getState() {
    return this.state;
  }

  /** הירשם לאירועי מחזור החיים: start, round, end */
  on(event, handler) {
    this.events.on(event, handler);
    return this;
  }
}
