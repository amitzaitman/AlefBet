import { describe, it, expect } from 'vitest';
import {
  READ_BASE_MS, createRound, createRounds, answerFor, answerChoices, storyFor, resultFor,
  matchOptions, storyCaption, readingMs, scenePlan, finalStates,
} from '../src/games/balloon-stories/logic.js';

const NIKUD = /[֑-ׇ]/g;
const PICTURE_KINDS = /** @type {const} */ (['take', 'add', 'compare', 'missing']);

// The two hottest random loops collect failures in plain JS and assert once;
// each failure names the broken rule and the round.
/** @param {*} n @param {number} min @param {number} max */
const wholeIn = (n, min, max) => Number.isInteger(n) && n >= min && n <= max;
/** @param {any[]} actual @param {any[]} expected */
const same = (actual, expected) => actual.length === expected.length && actual.every((value, i) => value === expected[i]);

describe('balloon-stories rounds', () => {
  it('follows the three stages and keeps every picture within ten', () => {
    const bad = [];
    for (let run = 0; run < 300; run++) {
      const rounds = createRounds();
      const check = (ok, why, round) => { if (!ok) bad.push({ why, round: round ?? rounds }); };
      const kinds = rounds.map(round => round.kind);
      check(same(kinds.slice(0, 2), ['take', 'add']), 'stage one does not open with take, add');
      check(['take', 'add'].includes(rounds[2].kind), 'round 3 is not take or add');
      check(same(kinds.slice(3, 5), ['compare', 'missing']), 'stage two does not open with compare, missing');
      check(['compare', 'missing'].includes(rounds[5].kind), 'round 6 is not compare or missing');
      check(rounds.slice(6).every(round => round.kind === 'match'), 'stage three is not all match');
      check(same(rounds.slice(6, 8).map(round => round.op), ['-', '+']), 'stage three does not open with -, +');
      // The last round of each of the first two stages trades balloons for circles.
      check(same(rounds.slice(0, 6).map(round => round.look), ['balloons', 'balloons', 'dots', 'balloons', 'balloons', 'dots']), 'wrong looks');
      for (const round of rounds) {
        check(wholeIn(answerFor(round), 1, 10), 'answer outside 1-10', round);
        check(wholeIn(round.b, 2, Infinity), 'b below 2', round);
        if (round.kind === 'take' || round.kind === 'compare') check(Number.isInteger(round.a) && round.b < round.a, 'b not below a', round);
        if (round.kind === 'add') check(Number.isInteger(round.a) && round.a + round.b <= 10, 'sum above 10', round);
        if (round.kind === 'missing') check(wholeIn(round.a, 2, Infinity), 'a below 2', round);
      }
    }
    expect(bad).toEqual([]);
  });

  it('solves each meaning of addition and subtraction', () => {
    expect(answerFor({ kind: 'take', a: 5, b: 2, look: 'balloons' })).toBe(3);
    expect(answerFor({ kind: 'add', a: 3, b: 2, look: 'balloons' })).toBe(5);
    expect(answerFor({ kind: 'compare', a: 5, b: 3, look: 'balloons' })).toBe(2);
    expect(answerFor({ kind: 'missing', a: 4, b: 7, look: 'balloons' })).toBe(3);
    expect(answerFor({ kind: 'match', op: '+', a: 4, b: 3, look: 'dots' })).toBe(7);
    expect(answerFor({ kind: 'match', op: '-', a: 6, b: 2, look: 'dots' })).toBe(4);
  });

  it('offers four sorted choices with the telling mistakes', () => {
    const bad = [];
    for (let run = 0; run < 300; run++) {
      for (const kind of PICTURE_KINDS) {
        const round = createRound({ kind, max: 9 });
        const choices = answerChoices(round);
        const check = (ok, why) => { if (!ok) bad.push({ why, round, choices }); };
        check(choices.length === 4, 'not four choices');
        check(new Set(choices).size === 4, 'repeated choice');
        check(choices.includes(answerFor(round)), 'correct answer missing');
        check(same([...choices].sort((x, y) => x - y), choices), 'not sorted');
        check(choices.every(n => wholeIn(n, 0, 10)), 'choice outside 0-10');
      }
    }
    expect(bad).toEqual([]);
    // Adding instead of subtracting, and naming the popped balloons, are both offered.
    expect(answerChoices({ kind: 'take', a: 6, b: 2, look: 'balloons' })).toEqual(expect.arrayContaining([4, 8, 2]));
    expect(answerChoices({ kind: 'missing', a: 4, b: 7, look: 'balloons' })).toEqual(expect.arrayContaining([3, 7, 4]));
  });
});

describe('balloon-stories story', () => {
  it('builds the exercise along with the story', () => {
    const beats = storyFor({ kind: 'take', a: 5, b: 2, look: 'balloons' });
    expect(beats.map(beat => beat.equation)).toEqual(['5', '5 − 2', '5 − 2 = ?']);
    expect(beats.map(beat => beat.scene)).toEqual(['start', 'change', 'question']);
    expect(storyFor({ kind: 'add', a: 3, b: 2, look: 'balloons' }).map(beat => beat.equation)).toEqual(['3', '3 + 2', '3 + 2 = ?']);
    expect(storyFor({ kind: 'missing', a: 4, b: 7, look: 'balloons' }).at(-1).equation).toBe('4 + ? = 7');
    expect(storyFor({ kind: 'compare', a: 5, b: 3, look: 'balloons' }).at(-1).equation).toBe('5 − 3 = ?');
  });

  it('writes the numbers as digits, the same numbers as the exercise beside it', () => {
    const [first, second] = storyFor({ kind: 'take', a: 5, b: 2, look: 'balloons' });
    expect(first.text).toBe('לְנוֹעָה יֵשׁ 5 בָּלוֹנִים.');
    expect(second.text).toBe('2 בָּלוֹנִים הִתְפּוֹצְצוּ!');
    for (let run = 0; run < 100; run++) {
      for (const round of createRounds()) {
        const beats = storyFor(round);
        const exercise = beats.at(-1).equation.match(/\d+/g);
        for (const { text } of beats) for (const n of text.match(/\d+/g) ?? []) expect(exercise).toContain(n);
      }
    }
  });

  it('closes with a sentence that agrees with a single balloon', () => {
    expect(resultFor({ kind: 'take', a: 4, b: 3, look: 'balloons' })).toBe('נִשְׁאַר לְנוֹעָה בָּלוֹן אֶחָד.');
    expect(resultFor({ kind: 'take', a: 6, b: 2, look: 'balloons' })).toBe('נִשְׁאֲרוּ לְנוֹעָה 4 בָּלוֹנִים.');
    expect(resultFor({ kind: 'missing', a: 6, b: 7, look: 'balloons' })).toBe('חָסֵר לָהּ בָּלוֹן אֶחָד.');
    expect(resultFor({ kind: 'compare', a: 5, b: 3, look: 'balloons' })).toBe('לְנוֹעָה יֵשׁ 2 בָּלוֹנִים יוֹתֵר.');
    expect(resultFor({ kind: 'match', op: '-', a: 5, b: 2, look: 'dots' })).toBe('5 − 2 = 3');
  });

  it('keeps sentences short, gives each one time to be read, and asks within seven seconds', () => {
    for (let run = 0; run < 100; run++) {
      for (const round of createRounds()) {
        const beats = storyFor(round);
        for (const { text } of beats) {
          expect(text.replace(NIKUD, '').length).toBeLessThanOrEqual(48);
          // Never shorter than today's shortest beat.
          expect(readingMs(text)).toBeGreaterThanOrEqual(1200);
        }
        // The browser test skips 7 seconds to reach the question.
        const untilQuestion = beats.slice(0, -1).reduce((sum, { text }) => sum + readingMs(text), 0);
        expect(untilQuestion).toBeLessThanOrEqual(7000);
      }
    }
    // Longer sentences stay longer; nikud and spaces do not count.
    expect(readingMs('לְנוֹעָה יֵשׁ 5 בָּלוֹנִים.')).toBe(READ_BASE_MS + 14 * 100);
    expect(readingMs('סָבְתָא הֵבִיאָה לָהּ עוֹד 3 בָּלוֹנִים.')).toBeGreaterThan(readingMs('לְנוֹעָה יֵשׁ 5 בָּלוֹנִים.'));
  });
});

describe('balloon-stories picture', () => {
  it('counts the answer on the picture, and changes as many balloons as the story says', () => {
    const bad = [];
    for (let run = 0; run < 200; run++) {
      for (const kind of PICTURE_KINDS) {
        const round = createRound({ kind, max: 10 });
        const plan = scenePlan(round);
        const end = finalStates(plan);
        const check = (ok, why) => { if (!ok) bad.push({ why, round, plan }); };
        check(plan.counted.length === answerFor(round), 'the counted balloons are not the answer');
        check(plan.owners.length === plan.start.length, 'owners and states differ in length');
        // What pops or arrives is the change; completing fills Noa's a balloons.
        check(plan.change.length === (kind === 'missing' ? round.a : round.b), 'wrong number of changing balloons');
        check(plan.change.every(k => plan.start[k] !== plan.changeTo), 'a change that changes nothing');
        if (kind === 'take') check(end.filter(state => state === 'popped').length === round.b && end.length === round.a, 'take picture');
        if (kind === 'add') check(end.every(state => state === 'shown') && end.length === round.a + round.b, 'add picture');
        if (kind === 'missing') check(end.filter(state => state === 'empty').length === answerFor(round) && end.length === round.b, 'missing picture');
        if (kind === 'compare') check(plan.owners.filter(owner => owner === 'dani').length === round.b, 'compare picture');
        // Rows of five from the left: what pops or arrives is at the end.
        if (kind === 'take' || kind === 'add') check(same(plan.change, plan.owners.map((_, k) => k).slice(-round.b)), 'change not at the end');
      }
    }
    expect(bad).toEqual([]);
    expect(() => scenePlan({ kind: 'match', a: 5, b: 2 })).toThrow();
  });
});

describe('balloon-stories exercise to story', () => {
  it('has one right story and two pictures that fit within ten', () => {
    for (let run = 0; run < 300; run++) {
      for (const op of /** @type {const} */ (['-', '+'])) {
        const round = createRound({ kind: 'match', op });
        const options = matchOptions(round);
        expect(options.filter(option => option.op === op && option.a === round.a && option.b === round.b)).toHaveLength(1);
        expect(new Set(options.map(storyCaption)).size).toBe(3);
        for (const option of options) {
          if (option.op === '-') expect(option.b).toBeLessThan(option.a);
          else expect(option.a + option.b).toBeLessThanOrEqual(10);
        }
      }
    }
    expect(storyCaption({ op: '-', a: 5, b: 2 })).toBe('הָיוּ 5, 2 הִתְפּוֹצְצוּ');
    expect(storyCaption({ op: '+', a: 3, b: 2 })).toBe('הָיוּ 3, הִגִּיעוּ עוֹד 2');
  });
});
