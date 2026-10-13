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

function setup(totalRounds = 3) {
  const shell = makeShellStub(totalRounds);
  shell.state.nextRound(); // simulate shell.start() advancing to round 1
  const container = document.createElement('div');
  const progressBar = { update: vi.fn() };
  const buildRoundUI = vi.fn();
  const manager = createRoundManager(shell, container, { totalRounds, progressBar, buildRoundUI });
  return { shell, container, progressBar, buildRoundUI, manager };
}

/** Lets an answer's round transition run to the end. */
async function settle(answer) {
  await vi.runAllTimersAsync();
  await answer;
}

describe('createRoundManager — handleCorrect', () => {
  it('plays the correct sound, adds one point and advances once, ignoring a second answer in flight', async () => {
    const { shell, manager, progressBar, buildRoundUI } = setup();
    await settle(Promise.all([manager.handleCorrect(), manager.handleCorrect()]));
    expect(sounds.correct).toHaveBeenCalledOnce();
    expect(shell.state.score).toBe(1);
    expect(progressBar.update).toHaveBeenCalledWith(1);
    expect(buildRoundUI).toHaveBeenCalledOnce();
    expect(shell.state.currentRound).toBe(2);
  });

  it('awaits the extraAction argument before advancing', async () => {
    const { manager, buildRoundUI } = setup();
    let resolved = false;
    const answer = manager.handleCorrect(() => new Promise(r => setTimeout(() => { resolved = true; r(); }, 500)));
    await vi.advanceTimersByTimeAsync(499);
    expect(resolved).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect(resolved).toBe(true);
    await settle(answer);
    expect(buildRoundUI).toHaveBeenCalledOnce();
  });

  it('shows the completion screen when no more rounds remain', async () => {
    const { shell, container, manager, buildRoundUI } = setup(2);
    await settle(manager.handleCorrect()); // round 1 → round 2
    await settle(manager.handleCorrect()); // round 2 → completion, not buildRoundUI
    expect(showCompletionScreen).toHaveBeenCalledOnce();
    expect(showCompletionScreen).toHaveBeenCalledWith(container, shell.state.score, 2, expect.any(Function), { gameId: shell.gameId, completionOnly: false, homeUrl: shell.config.homeUrl });
    expect(buildRoundUI).toHaveBeenCalledTimes(1); // only after round 1
  });
});

describe('createRoundManager — handleWrong and reset', () => {
  it('handleWrong changes neither score nor round, and leaves the lock open to try again', async () => {
    const { shell, manager, progressBar, buildRoundUI } = setup();
    await manager.handleWrong();
    expect(shell.state.score).toBe(0);
    expect(shell.state.currentRound).toBe(1);
    expect(progressBar.update).not.toHaveBeenCalled();
    expect(buildRoundUI).not.toHaveBeenCalled();
    expect(sounds.correct).not.toHaveBeenCalled();
    expect(manager.isAnswered()).toBe(false);
  });

  it('reset() re-opens a lock held by an answer in flight', async () => {
    const { manager } = setup();
    const pending = manager.handleCorrect();
    expect(manager.isAnswered()).toBe(true);
    manager.reset();
    expect(manager.isAnswered()).toBe(false);
    await settle(pending);
  });
});
