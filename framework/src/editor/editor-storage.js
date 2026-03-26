/**
 * אחסון נתוני עורך המשחק ב-localStorage
 */

import { createLocalState } from '../core/local-state.js';
import { GameData } from './game-data.js';

const KEY_PREFIX = 'alefbet.editor.';

function stateFor(gameId) {
  return createLocalState(`${KEY_PREFIX}${gameId}`, null);
}

/** שמור GameData ב-localStorage */
export function saveGameData(gameData) {
  stateFor(gameData.id).set(gameData.toJSON());
}

/**
 * טען GameData שמורה לפי מזהה משחק.
 * מחזיר null אם אין נתונים שמורים.
 * @param {string} gameId
 * @returns {GameData|null}
 */
export function loadGameData(gameId) {
  const raw = stateFor(gameId).get();
  if (!raw) return null;
  try {
    return GameData.fromJSON(raw);
  } catch {
    return null;
  }
}

/** מחק נתונים שמורים לפי מזהה משחק */
export function clearGameData(gameId) {
  try {
    localStorage.removeItem(`${KEY_PREFIX}${gameId}`);
  } catch { /* ignore */ }
}

/**
 * ייצא GameData כקובץ JSON להורדה
 * @param {GameData} gameData
 */
export function exportGameDataAsJSON(gameData) {
  const json = JSON.stringify(gameData.toJSON(), null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `${gameData.id}-rounds.json`;
  a.click();
  URL.revokeObjectURL(url);
}
