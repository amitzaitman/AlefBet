import { describe, it, expect } from 'vitest';
import {
  createRound, createRounds, answerFor, answerChoices, storyFor, resultFor, matchOptions, storyCaption,
} from '../../../games/balloon-stories/game.js';

const NIKUD = /[֑-ׇ]/g;

describe('balloon-stories rounds', () => {
  it('follows the three stages and keeps every picture within ten', () => {
    for (let run = 0; run < 300; run++) {
      const rounds = createRounds();
      expect(rounds.map(round => round.kind).slice(0, 2)).toEqual(['take', 'add']);
      expect(['take', 'add']).toContain(rounds[2].kind);
      expect(rounds.map(round => round.kind).slice(3, 5)).toEqual(['compare', 'missing']);
      expect(['compare', 'missing']).toContain(rounds[5].kind);
      expect(rounds.slice(6).every(round => round.kind === 'match')).toBe(true);
      expect(rounds.slice(6, 8).map(round => round.op)).toEqual(['-', '+']);
      // The last round of each of the first two stages trades balloons for circles.
      expect(rounds.slice(0, 6).map(round => round.look)).toEqual(['balloons', 'balloons', 'dots', 'balloons', 'balloons', 'dots']);
      for (const round of rounds) {
        const answer = answerFor(round);
        expect(answer).toBeGreaterThanOrEqual(1);
        expect(answer).toBeLessThanOrEqual(10);
        expect(round.b).toBeGreaterThanOrEqual(2);
        if (round.kind === 'take' || round.kind === 'compare') expect(round.b).toBeLessThan(round.a);
        if (round.kind === 'add') expect(round.a + round.b).toBeLessThanOrEqual(10);
        if (round.kind === 'missing') expect(round.a).toBeGreaterThanOrEqual(2);
      }
    }
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
    for (let run = 0; run < 300; run++) {
      for (const kind of ['take', 'add', 'compare', 'missing']) {
        const round = createRound({ kind, max: 9 });
        const choices = answerChoices(round);
        expect(choices).toHaveLength(4);
        expect(new Set(choices).size).toBe(4);
        expect(choices).toContain(answerFor(round));
        expect([...choices].sort((x, y) => x - y)).toEqual(choices);
        expect(choices.every(n => n >= 0 && n <= 10)).toBe(true);
      }
    }
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
