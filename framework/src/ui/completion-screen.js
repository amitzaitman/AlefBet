/**
 * מסך סיום המשחק
 * מציג כוכבים, ניקוד וכפתור לשחק שוב
 * [נוסף על ידי: letter-match game]
 *
 * @param {HTMLElement} container - אלמנט המיכל
 * @param {number} score - ניקוד שהושג
 * @param {number} totalRounds - מספר הסיבובים הכולל
 * @param {function} onReplay - קולבק לחזרה על המשחק
 */
import { sounds } from '../audio/sounds.js';
import { animate } from '../render/animations.js';

export function showCompletionScreen(container, score, totalRounds, onReplay) {
  sounds.cheer();

  const ratio = score / totalRounds;
  const stars = ratio >= 0.8 ? 3 : ratio >= 0.5 ? 2 : 1;
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
