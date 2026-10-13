import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RoundRunner } from '../src/shell/round-runner.svelte.js';

describe('RoundRunner', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('locks a correct answer, counts it, and moves on after the pause', async () => {
    const runner = new RoundRunner(['a', 'b'], { transitionMs: 800 });
    const action = vi.fn();
    expect(await runner.correct(action)).toBe(true);
    expect(action).toHaveBeenCalledOnce();
    expect(runner).toMatchObject({ solved: 1, locked: true, index: 0 });
    // A second tap during the pause is ignored.
    expect(await runner.correct()).toBe(false);
    expect(await runner.wrong()).toBe(false);
    vi.advanceTimersByTime(799);
    expect(runner.index).toBe(0);
    vi.advanceTimersByTime(1);
    expect(runner).toMatchObject({ index: 1, round: 'b', locked: false, finished: false });
  });

  it('gives each round its own pause when the game asks for one', async () => {
    const runner = new RoundRunner(['short', 'long', 'end'], { transitionMs: round => (round === 'long' ? 500 : 100) });
    await runner.correct();
    vi.advanceTimersByTime(100);
    expect(runner.round).toBe('long');
    await runner.correct();
    vi.advanceTimersByTime(499);
    expect(runner.round).toBe('long');
    vi.advanceTimersByTime(1);
    expect(runner.round).toBe('end');
  });

  it('keeps the round after a wrong answer, locked only while the help is shown', async () => {
    const runner = new RoundRunner(['a']);
    let lockedDuringHelp;
    expect(await runner.wrong(() => { lockedDuringHelp = runner.locked; })).toBe(true);
    expect(lockedDuringHelp).toBe(true);
    expect(runner).toMatchObject({ index: 0, solved: 0, locked: false });
  });

  it('finishes after the last round', async () => {
    const runner = new RoundRunner(['a'], { transitionMs: 100 });
    await runner.correct();
    vi.advanceTimersByTime(100);
    expect(runner).toMatchObject({ finished: true, solved: 1, total: 1 });
    expect(await runner.correct()).toBe(false);
  });

  it('reopens the round when the game\'s action fails', async () => {
    const runner = new RoundRunner(['a']);
    await expect(runner.correct(() => { throw new Error('broken'); })).rejects.toThrow('broken');
    expect(runner).toMatchObject({ locked: false, solved: 0 });
  });

  it('never moves on once destroyed (replay or leaving the game)', async () => {
    const runner = new RoundRunner(['a', 'b'], { transitionMs: 100 });
    await runner.correct();
    runner.destroy();
    vi.advanceTimersByTime(1000);
    expect(runner.index).toBe(0);
    expect(await runner.wrong()).toBe(false);
  });

  it('needs at least one round', () => {
    expect(() => new RoundRunner([])).toThrow();
  });
});
