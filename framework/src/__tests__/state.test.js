import { describe, it, expect } from 'vitest';
import { GameState } from '../core/state.js';

describe('GameState — initialisation', () => {
  it('starts at round 0 with score 0', () => {
    const s = new GameState(8);
    expect(s.currentRound).toBe(0);
    expect(s.score).toBe(0);
    expect(s.totalRounds).toBe(8);
  });

  it('is not complete at start', () => {
    expect(new GameState(5).isComplete).toBe(false);
  });

  it('progress at start is 0%', () => {
    const p = new GameState(4).progress;
    expect(p.current).toBe(0);
    expect(p.total).toBe(4);
    expect(p.percentage).toBe(0);
  });
});

describe('GameState — nextRound', () => {
  it('increments currentRound', () => {
    const s = new GameState(3);
    s.nextRound();
    expect(s.currentRound).toBe(1);
  });

  it('returns true while rounds remain', () => {
    const s = new GameState(3);
    expect(s.nextRound()).toBe(true);
    expect(s.nextRound()).toBe(true);
    expect(s.nextRound()).toBe(true);
  });

  it('returns false when all rounds are done', () => {
    const s = new GameState(2);
    s.nextRound();
    s.nextRound();
    expect(s.nextRound()).toBe(false);
  });

  it('isComplete after all rounds', () => {
    const s = new GameState(3);
    for (let i = 0; i < 3; i++) s.nextRound();
    expect(s.isComplete).toBe(true);
  });
});

describe('GameState — addScore', () => {
  it('accumulates points', () => {
    const s = new GameState(5);
    s.addScore(10);
    s.addScore(5);
    expect(s.score).toBe(15);
  });

  it('can add 0 without changing score', () => {
    const s = new GameState(5);
    s.addScore(0);
    expect(s.score).toBe(0);
  });
});

describe('GameState — progress', () => {
  it('percentage is correct mid-game', () => {
    const s = new GameState(4);
    s.nextRound();
    s.nextRound();
    expect(s.progress.percentage).toBe(50);
  });

  it('percentage rounds to integer', () => {
    const s = new GameState(3);
    s.nextRound();
    // 1/3 = 33.33... → rounds to 33
    expect(s.progress.percentage).toBe(33);
  });
});
