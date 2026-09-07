/**
 * editor-storage — persist GameData to localStorage.
 */
import { createLocalState } from './local-state.js';
import { GameData } from './game-data.js';
import type { ContentContract } from './game-data.js';
import type { GameDataJson } from '../editor/schemas.js';

const KEY_PREFIX = 'alefbet.editor.';

function stateFor(gameId: string) {
  return createLocalState<GameDataJson | null>(`${KEY_PREFIX}${gameId}`, null);
}

/** Save GameData to localStorage. */
export function saveGameData(gameData: GameData): boolean {
  return stateFor(gameData.id).set(gameData.toJSON());
}

/**
 * Load a saved GameData by game id.
 * Returns null if nothing is stored or the stored JSON is corrupt.
 */
export function loadGameData(gameId: string, contract?: ContentContract): GameData | null {
  const raw = stateFor(gameId).get();
  if (!raw) return null;
  try {
    const data = GameData.fromJSON(raw, contract);
    return data.id === gameId ? data : null;
  } catch {
    return null;
  }
}

/** Remove saved data for a game. */
export function clearGameData(gameId: string): void {
  try {
    localStorage.removeItem(`${KEY_PREFIX}${gameId}`);
  } catch { /* ignore */ }
}

/** Trigger a JSON file download of the game data. */
export function exportGameDataAsJSON(gameData: GameData): void {
  const json = JSON.stringify(gameData.toJSON(), null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `${gameData.id}-rounds.json`;
  a.click();
  URL.revokeObjectURL(url);
}
