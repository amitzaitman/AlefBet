/**
 * מסך סיום המשחק
 * מציג כוכבים, ניקוד וכפתור לשחק שוב; אם סופק gameId - התוצאה נרשמת
 * בזיכרון ההתקדמות המקומי (core/progress.js) ומוצגת בדף הבית.
 * [נוסף על ידי: letter-match game]
 *
 * @param {HTMLElement} container - אלמנט המיכל
 * @param {number} score - ניקוד שהושג
 * @param {number} totalRounds - מספר הסיבובים הכולל
 * @param {function} onReplay - קולבק לחזרה על המשחק
 * @param {{ gameId?: string }} [opts] - gameId לרישום התקדמות
 */
import { sounds } from '../audio/sounds.js';
import { animate } from '../render/animations.js';
import { recordGameResult, starsFor } from '../core/progress.js';

export function showCompletionScreen(container, score, totalRounds, onReplay, opts = {}) {
  sounds.cheer();

  if (opts.gameId) {
    recordGameResult(opts.gameId, { score, total: totalRounds });
  }

  const stars = starsFor(score, totalRounds);
  const starDisplay = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);

  const screen = document.createElement('div');
  screen.className = 'completion-screen';
  screen.innerHTML = `
    <div class="completion-screen__content">
      <div class="completion-screen__stars" aria-label="${stars} כּוֹכָבִים">${starDisplay}</div>
      <h2 class="completion-screen__title">!כָּל הַכָּבוֹד</h2>
      <p class="completion-screen__score">נִיקּוּד: ${score} מִתּוֹךְ ${totalRounds}</p>
      <button class="completion-screen__replay btn btn--primary">שַׂחֵק שׁוּב</button>
    </div>
  `;

  screen.querySelector('.completion-screen__replay').addEventListener('click', () => {
    screen.remove();
    onReplay();
  });

  container.innerHTML = '';
  container.appendChild(screen);
  animate(screen.querySelector('.completion-screen__content'), 'fadeIn');
}
