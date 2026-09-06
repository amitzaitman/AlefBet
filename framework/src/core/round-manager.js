/**
 * מנהל סיבובים
 * עוזר משותף לניהול זרימת תשובה נכונה / שגויה בין סיבובים
 */
import { sounds } from '../audio/sounds.js';
import { tts } from '../audio/tts.js';
import { showCompletionScreen } from '../ui/completion-screen.js';

/**
 * יוצר מנהל סיבובים למשחק
 * @param {import('./game-shell.js').GameShell} shell - מעטפת המשחק
 * @param {HTMLElement} container - אלמנט המיכל הראשי (למסך סיום)
 * @param {object} opts - הגדרות
 * @param {number} opts.totalRounds - מספר סיבובים כולל
 * @param {{ update: (n: number) => void } | null} opts.progressBar - סרגל התקדמות (אופציונלי)
 * @param {function} opts.buildRoundUI - קולבק לבניית ממשק הסיבוב הבא
 * @param {function} [opts.onCorrect] - קולבק אופציונלי לאחר תשובה נכונה (לפני קידום)
 * @param {function} [opts.onWrong] - קולבק אופציונלי לאחר תשובה שגויה
 * @returns {{ handleCorrect: function, handleWrong: function, isAnswered: function, reset: function }}
 */
export function createRoundManager(shell, container, {
  totalRounds,
  progressBar = null,
  buildRoundUI,
  onCorrect,
  onWrong,
}) {
  let answered = false;

  /**
   * טפל בתשובה נכונה
   * @param {function} [extraAction] - פעולה נוספת להרצה לפני קידום (async)
   */
  async function handleCorrect(extraAction) {
    if (answered || shell.ended) return;
    answered = true;

    sounds.correct();

    if (extraAction) await extraAction();
    if (onCorrect) await onCorrect();

    if (shell.ended) return;
    shell.state.addScore(1);
    progressBar?.update(shell.state.currentRound);

    if (!await shell.delay(1200)) return;

    const hasMore = shell.nextRound();
    if (hasMore) {
      answered = false;
      buildRoundUI();
    } else {
      showCompletionScreen(container, shell.state.score, totalRounds, () => {
        location.reload();
      }, { gameId: shell.gameId });
    }
  }

  /**
   * טפל בתשובה שגויה — בלי משוב שלילי!
   */
  async function handleWrong() {
    if (answered || shell.ended) return;
    answered = true;

    if (onWrong) await onWrong();

    answered = false;
  }

  /** בדוק אם הסיבוב נעול (כבר ענו) */
  function isAnswered() {
    return answered;
  }

  /** אפס את הנעילה לסיבוב חדש */
  function reset() {
    answered = false;
  }

  return { handleCorrect, handleWrong, isAnswered, reset };
}
