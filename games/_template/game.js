/**
 * תבנית משחק — AlefBet
 * Claude מייצר קובץ זה לכל משחק חדש
 */
import {
  GameShell,
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
    title: 'שֵׁם הַמִּשְׂחָק',
  });

  // הוסף לוגיקת משחק כאן
  shell.bodyEl.innerHTML = '<p style="text-align:center;padding:2rem">הַמִּשְׂחָק שֶׁלְּךָ יוֹפִיעַ כָּאן</p>';

  shell.on('start', () => {
  });

  shell.start();
}
