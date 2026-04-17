/**
 * תבנית משחק — AlefBet
 * Claude מייצר קובץ זה לכל משחק חדש
 *
 * הצעד הראשון בכל משחק הוא קריאה ל-bootstrapGame — עוטפת לטעינת ניקוד,
 * הקמת GameShell וחיווט העורך. ראה framework/src/core/bootstrap.js לאופציות.
 */
import {
  bootstrapGame,
  createOptionCards,
  createProgressBar,
  createFeedback,
  showCompletionScreen,
} from '../../framework/dist/alefbet.js';

const STATIC_TEXTS = [
  'בְּרוּכִים הַבָּאִים',
];

const ROUNDS = [
  // { target: 'א', correct: 'אַרְיֵה', correctEmoji: '🦁' },
];

export async function startGame(container) {
  const { shell } = await bootstrapGame(container, {
    gameId: 'template-game',
    title: 'שֵׁם הַמִּשְׂחָק',
    preloadTexts: STATIC_TEXTS,
    defaultRounds: ROUNDS,
  });

  shell.bodyEl.innerHTML = '<p style="text-align:center;padding:2rem">הַמִּשְׂחָק שֶׁלְּךָ יוֹפִיעַ כָּאן</p>';

  shell.on('start', () => {
  });

  shell.start();
}
