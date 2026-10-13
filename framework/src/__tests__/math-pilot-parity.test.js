import { describe, it, expect, vi } from 'vitest';
import * as today from '../../../games/balloon-stories/game.js';
import * as pilot from '../../../math-pilot/src/games/balloon-stories/logic.js';

// Temporary, while the math pilot (math-pilot/) runs beside today's games: its
// copy of the balloon-stories logic must teach exactly what today's game does.
// Delete this file with the pilot, or when the pilot changes the logic on purpose.

/** A repeatable Math.random, so both copies draw the same numbers. @param {number} seed */
function seeded(seed) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

/** @template T @param {number} seed @param {() => T} make @returns {T} */
function withSeed(seed, make) {
  const random = vi.spyOn(Math, 'random').mockImplementation(seeded(seed));
  try {
    return make();
  } finally {
    random.mockRestore();
  }
}

describe('the math pilot keeps today\'s balloon-stories', () => {
  it('makes the same rounds, choices, stories, closing sentences and story cards', () => {
    for (let seed = 1; seed <= 200; seed++) {
      const rounds = withSeed(seed, today.createRounds);
      expect(withSeed(seed, pilot.createRounds)).toEqual(rounds);
      for (const round of rounds) {
        expect(pilot.answerFor(round)).toBe(today.answerFor(round));
        expect(pilot.storyFor(round)).toEqual(today.storyFor(round).map(({ text, equation, scene }) => ({ text, equation, scene })));
        expect(pilot.resultFor(round)).toBe(today.resultFor(round).text);
        if (round.kind === 'match') {
          expect(pilot.matchOptions(round)).toEqual(today.matchOptions(round));
          expect(pilot.matchOptions(round).map(pilot.storyCaption)).toEqual(today.matchOptions(round).map(today.storyCaption));
        } else {
          expect(withSeed(seed, () => pilot.answerChoices(round))).toEqual(withSeed(seed, () => today.answerChoices(round)));
        }
      }
    }
  });
});
