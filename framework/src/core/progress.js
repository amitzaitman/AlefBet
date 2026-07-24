/**
 * זיכרון התקדמות מקומי - כוכבים ותוצאות לכל משחק, במכשיר בלבד.
 *
 * נשמר ב-localStorage (ללא שרת, ללא רשת): מספר משחקים שהושלמו, התוצאה
 * הטובה ביותר ומספר הכוכבים לכל משחק. דף הבית מציג את הכוכבים על כרטיסי
 * המשחקים, ומסך הסיום מעדכן את הזיכרון אוטומטית.
 *
 * API ציבורי:
 *   starsFor(score, total) - חישוב כוכבים 1-3 (טהור).
 *   recordGameResult(gameId, { score, total }) - עדכון אחרי סיום משחק.
 *   getGameProgress(gameId) - ההתקדמות השמורה או null.
 *   getAllProgress() - מפת gameId -> התקדמות.
 */
import { createLocalState } from './local-state.js';

const STORAGE_KEY = 'alefbet.progress.v1';

/**
 * @typedef {object} GameProgress
 * @property {number} plays - כמה פעמים הושלם המשחק
 * @property {number} bestScore - התוצאה הטובה ביותר
 * @property {number} bestStars - מספר הכוכבים הטוב ביותר (1-3)
 * @property {number} total - מספר הסיבובים במשחק (של התוצאה הטובה)
 * @property {number} lastPlayed - חותמת זמן (ms) של הסיום האחרון
 */

/** @type {ReturnType<typeof createLocalState<Record<string, GameProgress>>>} */
const _store = createLocalState(STORAGE_KEY, {});

/**
 * חישוב כוכבים מתוצאה - אותה נוסחה שמסך הסיום מציג.
 * @param {number} score
 * @param {number} total
 * @returns {number} 1-3
 */
export function starsFor(score, total) {
  if (!Number.isFinite(score) || !Number.isFinite(total) || total <= 0) return 1;
  const ratio = score / total;
  return ratio >= 0.8 ? 3 : ratio >= 0.5 ? 2 : 1;
}

/**
 * רישום תוצאת סיום משחק. משפר-בלבד: תוצאה חלשה לא דורסת שיא קודם.
 * @param {string} gameId
 * @param {{ score: number, total: number }} result
 * @returns {GameProgress | null} ההתקדמות המעודכנת, או null אם הקלט לא תקין
 */
export function recordGameResult(gameId, { score, total }) {
  if (!gameId || !Number.isFinite(score) || !Number.isFinite(total) || total <= 0) return null;
  const stars = starsFor(score, total);
  /** @type {GameProgress | null} */
  let updated = null;
  _store.update(all => {
    const prev = all[gameId];
    updated = {
      plays: (prev?.plays ?? 0) + 1,
      bestScore: Math.max(prev?.bestScore ?? 0, score),
      bestStars: Math.max(prev?.bestStars ?? 0, stars),
      total: (prev && (prev.bestScore ?? 0) > score) ? prev.total : total,
      lastPlayed: Date.now(),
    };
    return { ...all, [gameId]: updated };
  });
  return updated;
}

/**
 * ההתקדמות השמורה למשחק.
 * @param {string} gameId
 * @returns {GameProgress | null}
 */
export function getGameProgress(gameId) {
  return _store.get()[gameId] ?? null;
}

/**
 * כל ההתקדמות השמורה.
 * @returns {Record<string, GameProgress>}
 */
export function getAllProgress() {
  return _store.get();
}
