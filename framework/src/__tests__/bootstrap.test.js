/**
 * bootstrapGame - שלושה נתיבים עיקריים:
 * 1) עם חוזה תוכן: סיבובים שמורים תקינים מחליפים את defaultRounds,
 *    ובלי תוכן שמור משחקים ב-defaultRounds.
 * 2) בלי חוזה תוכן: תוכן שמור לא נקרא.
 * 3) onBeforeHide מחזיר false: כל השלבים שאחריו לא רצים, aborted=true.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../utils/nakdan.js', () => ({
  preloadNikud: vi.fn().mockResolvedValue(undefined),
  addNikud: vi.fn(async t => t),
  getNikud: vi.fn(t => t),
}));

import { bootstrapGame, runGame } from '../core/bootstrap.ts';
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
  const content = {
    version: 1,
    createRound: () => ({ target: 'א' }),
    validateRound: round => typeof round.target === 'string',
  };

  it('plays saved rounds when the game has a content contract', async () => {
    const host = mountContainer();
    const saved = [{ id: 'saved-1', target: 'ב', zones: [{ id: 'z', x: 1, y: 1, w: 5, h: 5 }] }];
    localStorage.setItem('alefbet.editor.test-game', JSON.stringify({
      id: 'test-game', version: 1, meta: { title: '', type: 'multiple-choice' }, rounds: saved, distractors: [],
    }));

    const result = await bootstrapGame(host, {
      gameId: 'test-game',
      title: 'בדיקה',
      preloadTexts: ['שלום'],
      defaultRounds: [{ id: 'default', target: 'א' }],
      editor: { content },
    });

    expect(result.aborted).toBe(false);
    // Rounds saved by the removed editor, zones included, still load.
    expect(result.activeRounds).toEqual(saved);
    expect(result.shell.state.totalRounds).toBe(1);
    expect(preloadNikud).toHaveBeenCalledWith(['שלום']);
    expect(host.querySelector('.ab-loading')).toBeNull();
    expect(host.querySelector('.game-title')?.textContent).toBe('בדיקה');
    // There is no editing UI any more.
    expect(host.querySelector('.ab-lazy-editor')).toBeNull();
    expect(host.querySelector('.adult-tools')).toBeNull();
  });

  it('plays the default rounds when nothing is saved', async () => {
    const host = mountContainer();
    const rounds = [{ id: 'default', target: 'א' }];
    const result = await bootstrapGame(host, { gameId: 'test-empty', title: 'ריק', defaultRounds: rounds, editor: { content } });
    expect(result.activeRounds).toEqual(rounds);
  });

  it('ignores saved content when the game has no content contract', async () => {
    const host = mountContainer();
    localStorage.setItem('alefbet.editor.test-no-editor', JSON.stringify({ id: 'test-no-editor', rounds: [{ id: 'x' }] }));

    const result = await bootstrapGame(host, {
      gameId: 'test-no-editor',
      title: 'ללא תוכן שמור',
      preloadTexts: [],
      totalRounds: 8,
    });

    expect(result.aborted).toBe(false);
    expect(result.activeRounds).toEqual([]);
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

    expect(result).toEqual({ shell: null, activeRounds: [], aborted: true });
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
