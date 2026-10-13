import { describe, it, expect } from 'vitest';
import {
  createRound, createRounds, answerFor, answerChoices, storyFor, resultFor, matchOptions, storyCaption,
} from '../../../games/balloon-stories/game.js';

const NIKUD = /[֑-ׇ]/g;

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
      for (const kind of ['take', 'add', 'compare', 'missing']) {
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

  it('shows digits and speaks number words that agree with the noun', () => {
    const [first, second] = storyFor({ kind: 'take', a: 5, b: 2, look: 'balloons' });
    expect(first.text).toBe('לְנוֹעָה יֵשׁ 5 בָּלוֹנִים.');
    expect(first.say).toBe('לְנוֹעָה יֵשׁ חֲמִשָּׁה בָּלוֹנִים.');
    expect(second.say).toBe('שְׁנֵי בָּלוֹנִים הִתְפּוֹצְצוּ!');
    for (let run = 0; run < 100; run++) {
      for (const round of createRounds()) {
        for (const { say } of [...storyFor(round), resultFor(round)]) expect(say).not.toMatch(/\d/);
      }
    }
  });

  it('closes with a sentence that agrees with a single balloon', () => {
    expect(resultFor({ kind: 'take', a: 4, b: 3, look: 'balloons' })).toEqual({
      text: 'נִשְׁאַר לְנוֹעָה בָּלוֹן אֶחָד.', say: 'נִשְׁאַר לְנוֹעָה בָּלוֹן אֶחָד.',
    });
    expect(resultFor({ kind: 'take', a: 6, b: 2, look: 'balloons' }).say).toBe('נִשְׁאֲרוּ לְנוֹעָה אַרְבָּעָה בָּלוֹנִים.');
    expect(resultFor({ kind: 'missing', a: 6, b: 7, look: 'balloons' }).text).toBe('חָסֵר לָהּ בָּלוֹן אֶחָד.');
    expect(resultFor({ kind: 'compare', a: 5, b: 3, look: 'balloons' }).say).toBe('לְנוֹעָה יֵשׁ שְׁנֵי בָּלוֹנִים יוֹתֵר.');
    expect(resultFor({ kind: 'match', op: '-', a: 5, b: 2, look: 'dots' })).toEqual({
      text: '5 − 2 = 3', say: 'חָמֵשׁ פָּחוֹת שְׁתַּיִם שָׁוֶה שָׁלוֹשׁ.',
    });
  });

  it('keeps narrated sentences short enough to follow', () => {
    for (let run = 0; run < 100; run++) {
      for (const round of createRounds()) {
        for (const { say } of storyFor(round)) expect(say.replace(NIKUD, '').length).toBeLessThanOrEqual(48);
      }
    }
  });
});

describe('balloon-stories exercise to story', () => {
  it('has one right story and two pictures that fit within ten', () => {
    for (let run = 0; run < 300; run++) {
      for (const op of ['-', '+']) {
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
