import { describe, it, expect } from 'vitest';
import { LEVELS, createExercise, solveSteps, answerChoices } from '../../../games/long-exercise/game.js';

describe('long-exercise generation', () => {
  it('keeps every part small, positive and in the requested shape', () => {
    for (let run = 0; run < 300; run++) {
      for (const level of LEVELS) {
        const exercise = createExercise(level);
        expect(exercise.parts).toHaveLength(level.terms - 1);
        expect(exercise.start).toBeGreaterThanOrEqual(1);
        expect(exercise.start).toBeLessThanOrEqual(level.biggest);
        for (const { value } of exercise.parts) {
          expect(value).toBeGreaterThanOrEqual(1);
          expect(value).toBeLessThanOrEqual(level.biggest);
        }
        const minuses = exercise.parts.filter(part => part.op === '-').length;
        if (level.minus) expect(minuses).toBeGreaterThan(0);
        else expect(minuses).toBe(0);
        for (const { result } of solveSteps(exercise)) {
          expect(result).toBeGreaterThanOrEqual(1);
          expect(result).toBeLessThanOrEqual(20);
        }
      }
    }
  });

  it('solves the chain from left to right', () => {
    const steps = solveSteps({ start: 5, parts: [{ op: '-', value: 2 }, { op: '+', value: 4 }] });
    expect(steps).toEqual([
      { left: 5, op: '-', right: 2, result: 3 },
      { left: 3, op: '+', right: 4, result: 7 },
    ]);
  });

  it('offers four distinct, sorted, non-negative answers including the correct one', () => {
    for (let run = 0; run < 300; run++) {
      for (const step of [
        { left: 1, op: '+', right: 1, result: 2 },
        { left: 2, op: '-', right: 1, result: 1 },
        { left: 19, op: '+', right: 1, result: 20 },
        { left: 9, op: '-', right: 8, result: 1 },
      ]) {
        const choices = answerChoices(step);
        expect(choices).toHaveLength(4);
        expect(new Set(choices).size).toBe(4);
        expect(choices).toContain(step.result);
        expect(choices).toEqual([...choices].sort((a, b) => a - b));
        expect(Math.min(...choices)).toBeGreaterThanOrEqual(0);
      }
    }
  });
});
