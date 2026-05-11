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
  tts,
  mountAudioStatusBanner,
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

  // הבאנר מציג למשתמש מצבי שמע (חסום, ממתין למחווה, שגיאה).
  // ממוקם על ה-container כדי שיופיע מעל מעטפת המשחק; נסגר ב-'end' כדי שאתחול-מחדש יקים אותו נקי.
  const audioBanner = mountAudioStatusBanner(container);
  shell.on('end', () => audioBanner.destroy());

  let firstInteractionHandled = false;
  function handleFirstInteraction() {
    if (firstInteractionHandled) return;
    firstInteractionHandled = true;
    // חימום מוקדם של ה-TTS ממחווה אמיתית של המשתמש — מונע חסימת autoplay בקריאה הראשונה ל-speak().
    tts.unlock();
  }

  shell.bodyEl.innerHTML = '<p style="text-align:center;padding:2rem">הַמִּשְׂחָק שֶׁלְּךָ יוֹפִיעַ כָּאן</p>';
  // קוראים ל-handleFirstInteraction בכל אינטראקציה ראשונה של המשתמש (למשל onClick של כרטיס).
  shell.bodyEl.addEventListener('pointerdown', handleFirstInteraction, { once: true });

  shell.on('start', () => {
  });

  shell.start();
}
