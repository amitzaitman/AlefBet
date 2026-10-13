import { describe, it, expect } from 'vitest';
import { LEVELS, createExercise, solveSteps, answerChoices } from '../../../games/long-exercise/game.js';

// The random loops below check thousands of cases, so they collect failures in
// plain JS and assert once; each failure names the broken rule and the case.
/** @param {*} n @param {number} min @param {number} max */
const wholeIn = (n, min, max) => Number.isInteger(n) && n >= min && n <= max;

describe('long-exercise generation', () => {
  it('keeps every part small, positive and in the requested shape', () => {
    const bad = [];
    for (let run = 0; run < 300; run++) {
      for (const level of LEVELS) {
        const exercise = createExercise(level);
        const check = (ok, why) => { if (!ok) bad.push({ why, level, exercise }); };
        check(exercise.parts.length === level.terms - 1, 'wrong number of parts');
        check(wholeIn(exercise.start, 1, level.biggest), 'start out of range');
        check(exercise.parts.every(({ value }) => wholeIn(value, 1, level.biggest)), 'part out of range');
        const minuses = exercise.parts.filter(part => part.op === '-').length;
        check(level.minus ? minuses > 0 : minuses === 0, level.minus ? 'no minus' : 'unexpected minus');
        check(solveSteps(exercise).every(({ result }) => wholeIn(result, 1, 20)), 'step result out of range');
      }
    }
    expect(bad).toEqual([]);
  });

  it('solves the chain from left to right', () => {
    const steps = solveSteps({ start: 5, parts: [{ op: '-', value: 2 }, { op: '+', value: 4 }] });
    expect(steps).toEqual([
      { left: 5, op: '-', right: 2, result: 3 },
      { left: 3, op: '+', right: 4, result: 7 },
    ]);
  });

  it('offers four distinct, sorted, non-negative answers including the correct one', () => {
    const bad = [];
    for (let run = 0; run < 300; run++) {
      for (const step of [
        { left: 1, op: '+', right: 1, result: 2 },
        { left: 2, op: '-', right: 1, result: 1 },
        { left: 19, op: '+', right: 1, result: 20 },
        { left: 9, op: '-', right: 8, result: 1 },
      ]) {
        const choices = answerChoices(step);
        const check = (ok, why) => { if (!ok) bad.push({ why, step, choices }); };
        check(choices.length === 4, 'not four choices');
        check(new Set(choices).size === 4, 'repeated choice');
        check(choices.includes(step.result), 'correct answer missing');
        check([...choices].sort((a, b) => a - b).every((n, i) => n === choices[i]), 'not sorted');
        check(choices.every(n => Number.isInteger(n) && n >= 0), 'negative or not a whole number');
      }
    }
    expect(bad).toEqual([]);
  });
});
