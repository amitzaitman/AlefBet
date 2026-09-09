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

import { bootstrapGame, runGame } from '../core/bootstrap.ts';
import { GameData } from '../editor/game-data.ts';
import { mountContainer } from './helpers.js';
import { preloadNikud } from '../utils/nakdan.js';

beforeEach(() => {
  vi.clearAllMocks();
  try { localStorage.clear(); } catch { /* ignore */ }
});

describe('bootstrapGame', () => {
  it('runs rounds, ignores stale answers and cleans up on completion and replay', async () => {
    vi.useFakeTimers();
    try {
      const host = mountContainer();
      const rounds = [];
      const dispose = vi.fn();
      const replay = vi.fn();
      const result = await runGame(host, {
        gameId: 'runner', title: 'בדיקה', preloadTexts: [], audio: false,
        defaultRounds: [{ target: 'א' }, { target: 'ב' }],
        transitionMs: 20, onReplay: replay,
        buildRound: context => { rounds.push(context); return dispose; },
      });
      expect(rounds[0].round.target).toBe('א');
      const first = rounds[0].onCorrect();
      await vi.runAllTimersAsync();
      await first;
      expect(rounds[1].round.target).toBe('ב');
      await rounds[0].onCorrect();
      expect(result.shell.state.score).toBe(1);
      const second = rounds[1].onCorrect();
      await vi.runAllTimersAsync();
      await second;
      expect(result.shell.ended).toBe(true);
      expect(dispose).toHaveBeenCalledTimes(2);
      expect(host.querySelector('.completion-screen')).not.toBeNull();
      host.querySelector('.completion-screen__replay').click();
      expect(replay).toHaveBeenCalledOnce();
    } finally { vi.useRealTimers(); }
  });

  it('cancels a pending round transition when another game starts', async () => {
    vi.useFakeTimers();
    try {
      const host = mountContainer();
      let round;
      const result = await runGame(host, {
        gameId: 'cancel-runner', title: 'ישן', preloadTexts: [], audio: false,
        defaultRounds: [{ target: 'א' }, { target: 'ב' }],
        buildRound: context => { round = context; },
      });
      const pending = round.onCorrect();
      await bootstrapGame(host, { gameId: 'next', title: 'חדש', preloadTexts: [], audio: false });
      await vi.runAllTimersAsync();
      await pending;
      expect(result.shell.ended).toBe(true);
      expect(host.querySelector('.game-title').textContent).toBe('חדש');
      expect(host.querySelector('.completion-screen')).toBeNull();
    } finally { vi.useRealTimers(); }
  });
  it('does not let a slow start overwrite a newer game', async () => {
    const host = mountContainer();
    let release;
    preloadNikud.mockImplementationOnce(() => new Promise(resolve => { release = resolve; }));
    const older = bootstrapGame(host, { gameId: 'old', title: 'ישן', preloadTexts: ['שלום'] });
    const newer = await bootstrapGame(host, { gameId: 'new', title: 'חדש', preloadTexts: [] });
    await vi.waitFor(() => expect(release).toBeTypeOf('function'));
    release();
    expect((await older).aborted).toBe(true);
    expect(host.querySelector('.game-title').textContent).toBe('חדש');
    newer.shell.end();
  });

  it('restarts without accumulating window audio listeners', async () => {
    const host = mountContainer();
    const add = vi.spyOn(window, 'addEventListener');
    const remove = vi.spyOn(window, 'removeEventListener');
    const opts = { gameId: 'again', title: 'שוב', preloadTexts: [] };
    const first = await bootstrapGame(host, opts);
    const listener = add.mock.calls.find(([name]) => name === 'alefbet:tts-state')[1];
    const second = await bootstrapGame(host, opts);
    expect(first.shell.ended).toBe(true);
    expect(remove).toHaveBeenCalledWith('alefbet:tts-state', listener);
    expect(host.querySelectorAll('#alefbet-audio-status-banner')).toHaveLength(1);
    second.shell.end();
    expect(host.querySelector('#alefbet-audio-status-banner')).toBeNull();
    add.mockRestore();
    remove.mockRestore();
  });
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

it('round scope removes old timers and listeners on advance and after a synchronous exit', async () => {
  vi.useFakeTimers();
  const contexts = [];
  const action = vi.fn();
  const button = document.createElement('button');
  const cleanup = vi.fn();
  await runGame(mountContainer(), {
    gameId: 'scopes', title: '', preloadTexts: [], audio: false,
    defaultRounds: [{ target: 'א' }, { target: 'ב' }], transitionMs: 10,
    buildRound: context => {
      contexts.push(context);
      context.scope.schedule(action, 1000);
      context.scope.listen(button, 'click', action);
      if (context.index === 1) context.shell.end();
      return cleanup;
    },
  });
  const pending = contexts[0].onCorrect();
  await vi.runAllTimersAsync();
  await pending;
  button.click();
  expect(action).not.toHaveBeenCalled();
  expect(cleanup).toHaveBeenCalledTimes(2);
  expect(contexts.every(context => context.scope.signal.aborted)).toBe(true);
});

it('starts a generic game without invoking Hebrew preprocessing', async () => {
  const result = await bootstrapGame(mountContainer(), {
    gameId: 'math', title: 'חשבון', audio: false,
  });
  expect(result.aborted).toBe(false);
  expect(preloadNikud).not.toHaveBeenCalled();
  result.shell.end();
});
