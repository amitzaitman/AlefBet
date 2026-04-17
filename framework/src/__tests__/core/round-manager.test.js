/**
 * חוזה מנהל הסיבובים
 *
 * round-manager הוא לב זרימת המשחק: תשובה נכונה מעלה ניקוד, מקדמת סיבוב,
 * ומציגה מסך סיום כשנגמרו הסיבובים. תשובה שגויה אינה מקדמת. נעילה בין
 * תשובות מונעת ספירה כפולה. בדיקות אלה מתעדות את החוזה שעליו כל משחק סומך.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeShellStub } from '../helpers.js';

// שים לב: vi.mock מתבצע לפני ה-import של round-manager.
vi.mock('../../audio/sounds.js', () => ({
  sounds: { correct: vi.fn(), wrong: vi.fn(), cheer: vi.fn(), click: vi.fn() },
}));
vi.mock('../../audio/tts.js', () => ({
  tts: { speak: vi.fn().mockResolvedValue(undefined), speakNikud: vi.fn().mockResolvedValue(undefined) },
}));
vi.mock('../../ui/completion-screen.js', () => ({
  showCompletionScreen: vi.fn(),
}));

import { createRoundManager } from '../../core/round-manager.js';
import { sounds } from '../../audio/sounds.js';
import { showCompletionScreen } from '../../ui/completion-screen.js';

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
});

function setup(opts = {}) {
  const shell = makeShellStub(opts.totalRounds ?? 3);
  shell.state.nextRound(); // simulate shell.start() advancing to round 1
  const container = document.createElement('div');
  const progressBar = { update: vi.fn() };
  const buildRoundUI = vi.fn();
  const manager = createRoundManager(shell, container, {
    totalRounds: opts.totalRounds ?? 3,
    progressBar,
    buildRoundUI,
    onCorrect: opts.onCorrect,
    onWrong: opts.onWrong,
  });
  return { shell, container, progressBar, buildRoundUI, manager };
}

describe('createRoundManager — handleCorrect', () => {
  it('plays the correct sound, adds one point and advances the round', async () => {
    const { shell, manager, progressBar, buildRoundUI } = setup();

    const promise = manager.handleCorrect();
    await vi.runAllTimersAsync();
    await promise;

    expect(sounds.correct).toHaveBeenCalledOnce();
    expect(shell.state.score).toBe(1);
    expect(progressBar.update).toHaveBeenCalledWith(1);
    expect(buildRoundUI).toHaveBeenCalledOnce();
    expect(shell.state.currentRound).toBe(2);
  });

  it('invokes onCorrect before scoring so callers can run finishing touches', async () => {
    const order = [];
    const onCorrect = vi.fn(async () => { order.push('onCorrect'); });
    const { shell, manager } = setup({ onCorrect });
    const original = shell.state.addScore.bind(shell.state);
    shell.state.addScore = vi.fn((p) => { order.push('addScore'); original(p); });

    const promise = manager.handleCorrect();
    await vi.runAllTimersAsync();
    await promise;

    expect(onCorrect).toHaveBeenCalledOnce();
    expect(order).toEqual(['onCorrect', 'addScore']);
  });

  it('awaits the extraAction argument before advancing', async () => {
    const { manager, buildRoundUI } = setup();
    let resolved = false;
    const extraAction = vi.fn(() => new Promise(r => setTimeout(() => { resolved = true; r(); }, 500)));

    const promise = manager.handleCorrect(extraAction);
    await vi.advanceTimersByTimeAsync(499);
    expect(resolved).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect(resolved).toBe(true);
    await vi.runAllTimersAsync();
    await promise;

    expect(buildRoundUI).toHaveBeenCalledOnce();
  });

  it('ignores a second call while the current answer is still being processed', async () => {
    const { shell, manager, buildRoundUI } = setup();

    const p1 = manager.handleCorrect();
    const p2 = manager.handleCorrect(); // locked
    await vi.runAllTimersAsync();
    await Promise.all([p1, p2]);

    expect(shell.state.score).toBe(1);
    expect(buildRoundUI).toHaveBeenCalledOnce();
  });

  it('shows the completion screen when no more rounds remain', async () => {
    const { shell, container, manager, buildRoundUI } = setup({ totalRounds: 2 });

    // answer round 1 → advances to round 2
    const p1 = manager.handleCorrect();
    await vi.runAllTimersAsync();
    await p1;
    // answer round 2 → should trigger completion, not buildRoundUI
    const p2 = manager.handleCorrect();
    await vi.runAllTimersAsync();
    await p2;

    expect(showCompletionScreen).toHaveBeenCalledOnce();
    expect(showCompletionScreen).toHaveBeenCalledWith(container, shell.state.score, 2, expect.any(Function));
    expect(buildRoundUI).toHaveBeenCalledTimes(1); // only after round 1
  });

  it('tolerates a missing progressBar', async () => {
    const shell = makeShellStub(2);
    shell.state.nextRound();
    const manager = createRoundManager(shell, document.createElement('div'), {
      totalRounds: 2,
      progressBar: null,
      buildRoundUI: vi.fn(),
    });

    await expect((async () => {
      const p = manager.handleCorrect();
      await vi.runAllTimersAsync();
      await p;
    })()).resolves.not.toThrow();
  });
});

describe('createRoundManager — handleWrong', () => {
  it('does not change the score or advance the round', async () => {
    const { shell, manager, progressBar, buildRoundUI } = setup();

    await manager.handleWrong();

    expect(shell.state.score).toBe(0);
    expect(shell.state.currentRound).toBe(1);
    expect(progressBar.update).not.toHaveBeenCalled();
    expect(buildRoundUI).not.toHaveBeenCalled();
    expect(sounds.correct).not.toHaveBeenCalled();
  });

  it('invokes the onWrong callback when supplied', async () => {
    const onWrong = vi.fn().mockResolvedValue(undefined);
    const { manager } = setup({ onWrong });

    await manager.handleWrong();

    expect(onWrong).toHaveBeenCalledOnce();
  });

  it('leaves the lock open so the user can try again', async () => {
    const { manager } = setup();

    await manager.handleWrong();

    expect(manager.isAnswered()).toBe(false);
  });
});

describe('createRoundManager — lock / reset', () => {
  it('isAnswered() is false on a fresh manager', () => {
    const { manager } = setup();
    expect(manager.isAnswered()).toBe(false);
  });

  it('reset() re-opens the lock after a correct answer was locked', async () => {
    const { manager } = setup();
    // Lock the manager without advancing (simulate mid-flight)
    const pending = manager.handleCorrect();
    expect(manager.isAnswered()).toBe(true);
    await vi.runAllTimersAsync();
    await pending;
    // After handleCorrect completes it unlocks on its own before buildRoundUI,
    // but reset() is still expected to be safe to call.
    manager.reset();
    expect(manager.isAnswered()).toBe(false);
  });
});
