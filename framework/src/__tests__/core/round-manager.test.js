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
    expect(showCompletionScreen).toHaveBeenCalledWith(container, shell.state.score, 2, expect.any(Function), { gameId: shell.gameId, completionOnly: false, homeUrl: shell.config.homeUrl });
    expect(buildRoundUI).toHaveBeenCalledTimes(1); // only after round 1
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

  it('leaves the lock open so the user can try again', async () => {
    const { manager } = setup();

    await manager.handleWrong();

    expect(manager.isAnswered()).toBe(false);
  });
});

describe('createRoundManager — reset', () => {
  it('reset() re-opens a lock held by an answer in flight', async () => {
    const { manager } = setup();
    const pending = manager.handleCorrect();
    expect(manager.isAnswered()).toBe(true);
    manager.reset();
    expect(manager.isAnswered()).toBe(false);
    await vi.runAllTimersAsync();
    await pending;
  });
});
