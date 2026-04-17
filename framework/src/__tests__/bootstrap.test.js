/**
 * bootstrapGame — שלוש נתיבים עיקריים:
 * 1) עורך מופעל: activeRounds נלקחים מ-defaultRounds כש-localStorage ריק,
 *    GameShell נבנה, GameData נבנה עם meta וה-distractors.
 * 2) עורך מושבת: gameData הוא null.
 * 3) onBeforeHide מחזיר false: כל השלבים שאחריו לא רצים, aborted=true.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../utils/nakdan.js', () => ({
  preloadNikud: vi.fn().mockResolvedValue(undefined),
  addNikud: vi.fn(async t => t),
  getNikud: vi.fn(t => t),
}));

import { bootstrapGame } from '../core/bootstrap.ts';
import { GameData } from '../editor/game-data.ts';
import { mountContainer } from './helpers.js';
import { preloadNikud } from '../utils/nakdan.js';

beforeEach(() => {
  vi.clearAllMocks();
  try { localStorage.clear(); } catch { /* ignore */ }
});

describe('bootstrapGame', () => {
  it('builds shell + editor + gameData when editor options are provided', async () => {
    const host = mountContainer();
    const rounds = [{ target: 'א', correct: 'אַרְיֵה', correctEmoji: '🦁' }];

    const result = await bootstrapGame(host, {
      gameId: 'test-game',
      title: 'בדיקה',
      preloadTexts: ['שלום'],
      defaultRounds: rounds,
      editor: {
        type: 'multiple-choice',
        title: 'כותרת עורך',
        distractors: [{ text: 'x' }],
        restartGame: () => {},
      },
    });

    expect(result.aborted).toBe(false);
    expect(result.shell).not.toBeNull();
    expect(result.shell.state.totalRounds).toBe(1);
    expect(result.activeRounds).toEqual(rounds);
    expect(result.gameData).toBeInstanceOf(GameData);
    expect(result.gameData.id).toBe('test-game');
    expect(result.gameData.meta.type).toBe('multiple-choice');
    expect(result.gameData.meta.title).toBe('כותרת עורך');
    expect(result.gameData.distractors).toEqual([{ text: 'x' }]);
    expect(preloadNikud).toHaveBeenCalledWith(['שלום']);
    // loading screen removed and shell DOM injected
    expect(host.querySelector('.ab-loading')).toBeNull();
    expect(host.querySelector('.game-title')?.textContent).toBe('בדיקה');
  });

  it('returns gameData=null when editor is omitted', async () => {
    const host = mountContainer();

    const result = await bootstrapGame(host, {
      gameId: 'test-no-editor',
      title: 'ללא עורך',
      preloadTexts: [],
      totalRounds: 8,
    });

    expect(result.aborted).toBe(false);
    expect(result.gameData).toBeNull();
    expect(result.shell.state.totalRounds).toBe(8);
  });

  it('aborts when onBeforeHide returns false and keeps the loading screen intact', async () => {
    const host = mountContainer();

    const result = await bootstrapGame(host, {
      gameId: 'test-abort',
      title: 'יבטל',
      preloadTexts: [],
      onBeforeHide: () => false,
    });

    expect(result).toEqual({ shell: null, activeRounds: [], gameData: null, aborted: true });
    // caller is responsible for the DOM; bootstrap did not hide the loading screen
    expect(host.querySelector('.ab-loading')).not.toBeNull();
    expect(host.querySelector('.game-title')).toBeNull();
  });
});
