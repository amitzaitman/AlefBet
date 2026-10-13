/**
 * bootstrapGame ו-runGame: הסיבובים שהמשחק מעביר, ביטול התחלה ישנה,
 * ניקוי מאזינים ו-scope של סיבוב, ו-onBeforeHide שמבטל את האתחול.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { bootstrapGame, runGame } from '../core/bootstrap.ts';
import { mountContainer } from './helpers.js';

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
        gameId: 'runner', title: 'בדיקה', audio: false,
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
        gameId: 'cancel-runner', title: 'ישן', audio: false,
        defaultRounds: [{ target: 'א' }, { target: 'ב' }],
        buildRound: context => { round = context; },
      });
      const pending = round.onCorrect();
      await bootstrapGame(host, { gameId: 'next', title: 'חדש', audio: false });
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
    // The older start pauses just before building its shell; the newer one finishes first.
    const older = bootstrapGame(host, { gameId: 'old', title: 'ישן', onBeforeHide: () => new Promise(resolve => { release = resolve; }) });
    await vi.waitFor(() => expect(release).toBeTypeOf('function'));
    const newer = await bootstrapGame(host, { gameId: 'new', title: 'חדש' });
    release();
    expect((await older).aborted).toBe(true);
    expect(host.querySelector('.game-title').textContent).toBe('חדש');
    newer.shell.end();
  });

  it('restarts without accumulating window audio listeners', async () => {
    const host = mountContainer();
    const add = vi.spyOn(window, 'addEventListener');
    const remove = vi.spyOn(window, 'removeEventListener');
    const opts = { gameId: 'again', title: 'שוב' };
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
  it('plays the rounds the game passes', async () => {
    const host = mountContainer();
    const rounds = [{ target: 'א' }, { target: 'ב' }];
    const result = await bootstrapGame(host, { gameId: 'rounds', title: 'בדיקה', defaultRounds: rounds });
    expect(result.aborted).toBe(false);
    expect(result.activeRounds).toEqual(rounds);
    expect(result.shell.state.totalRounds).toBe(2);
    expect(host.querySelector('.ab-loading')).toBeNull();
    expect(host.querySelector('.game-title')?.textContent).toBe('בדיקה');
    expect(host.querySelector('.adult-tools')).toBeNull();
    result.shell.end();
  });

  it('uses totalRounds when the game runs its own flow', async () => {
    const result = await bootstrapGame(mountContainer(), { gameId: 'free', title: 'חופשי', totalRounds: 8 });
    expect(result.activeRounds).toEqual([]);
    expect(result.shell.state.totalRounds).toBe(8);
    result.shell.end();
  });

  it('aborts when onBeforeHide returns false and keeps the loading screen intact', async () => {
    const host = mountContainer();

    const result = await bootstrapGame(host, {
      gameId: 'test-abort',
      title: 'יבטל',
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
    gameId: 'scopes', title: '', audio: false,
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
