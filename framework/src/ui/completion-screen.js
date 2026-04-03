/**
 * מסך סיום המשחק
 * מציג כוכבים, ניקוד וכפתור לשחק שוב
 *
 * @param {HTMLElement} container
 * @param {number} score
 * @param {number} totalRounds
 * @param {function} onReplay
 */
import { LitElement, html } from 'lit';
import { sounds } from '../audio/sounds.js';
import { animate } from '../render/animations.js';

class AbCompletionScreen extends LitElement {
  static properties = {
    score:       { type: Number },
    totalRounds: { type: Number },
  };

  createRenderRoot() { return this; }

  constructor() {
    super();
    this.score = 0;
    this.totalRounds = 0;
    this._onReplay = null;
  }

  firstUpdated() {
    sounds.cheer();
    const content = this.querySelector('.completion-screen__content');
    if (content) animate(content, 'fadeIn');
  }

  _replay() {
    this.remove();
    this._onReplay?.();
  }

  render() {
    const ratio = this.totalRounds > 0 ? this.score / this.totalRounds : 0;
    const stars = ratio >= 0.8 ? 3 : ratio >= 0.5 ? 2 : 1;
    const starDisplay = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);

    return html`
      <div class="completion-screen">
        <div class="completion-screen__content">
          <div class="completion-screen__stars" aria-label="${stars} כּוֹכָבִים">${starDisplay}</div>
          <h2 class="completion-screen__title">!כָּל הַכָּבוֹד</h2>
          <p class="completion-screen__score">נִיקּוּד: ${this.score} מִתּוֹךְ ${this.totalRounds}</p>
          <button class="completion-screen__replay btn btn--primary" @click=${() => this._replay()}>שַׂחֵק שׁוּב</button>
        </div>
      </div>
    `;
  }
}

customElements.define('ab-completion-screen', AbCompletionScreen);

export function showCompletionScreen(container, score, totalRounds, onReplay) {
  container.innerHTML = '';
  const el = document.createElement('ab-completion-screen');
  el.score = score;
  el.totalRounds = totalRounds;
  el._onReplay = onReplay;
  container.appendChild(el);
}
