/**
 * תבנית משחק — AlefBet
 * Claude מייצר קובץ זה לכל משחק חדש
 */
import {
  GameShell,
  tts,
  hebrewLetters,
  getLettersByGroup,
  randomLetters,
  createOptionCards,
  createProgressBar,
  createFeedback,
  showCompletionScreen,
} from '../../framework/dist/alefbet.js';

export function startGame(container) {
  const shell = new GameShell(container, {
    totalRounds: 5,
    title: 'שם המשחק',
  });

  // הוסף לוגיקת משחק כאן
  shell.bodyEl.innerHTML = '<p style="text-align:center;padding:2rem">המשחק שלך יופיע כאן</p>';

  shell.on('start', () => {
    tts.speak('ברוך הבא למשחק');
  });

  shell.start();
}
