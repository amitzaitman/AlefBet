import { describe, it, expect } from 'vitest';
import { createRounds, countChoices, countingSteps, buildAsk, basketMiss } from '../../../games/apple-basket/game.js';

const NIKUD = /[֑-ׇ]/g;

describe('apple-basket rounds', () => {
  it('counts up to five first, then six to ten, without repeating a number in a stage', () => {
    const bad = [];
    for (let run = 0; run < 300; run++) {
      const rounds = createRounds();
      const check = (ok, why) => { if (!ok) bad.push({ why, rounds }); };
      check(rounds.length === 6, 'not six rounds');
      check(rounds.slice(0, 3).map(r => r.kind).join() === 'how-many,build,how-many', 'stage one kinds');
      check(rounds.slice(3, 5).map(r => r.kind).join() === 'how-many,build', 'stage two kinds');
      check(rounds.slice(0, 3).every(r => r.n >= 2 && r.n <= 5), 'stage one outside 2-5');
      check(rounds.slice(3).every(r => r.n >= 6 && r.n <= 10), 'stage two outside 6-10');
      check(new Set(rounds.slice(0, 3).map(r => r.n)).size === 3, 'stage one repeats');
      check(new Set(rounds.slice(3).map(r => r.n)).size === 3, 'stage two repeats');
    }
    expect(bad).toEqual([]);
  });

  it('offers four sorted numbers from 1 to 10, with one more and one less when they fit', () => {
    const bad = [];
    for (let run = 0; run < 50; run++) {
      for (let n = 2; n <= 10; n++) {
        const choices = countChoices(n);
        const check = (ok, why) => { if (!ok) bad.push({ why, n, choices }); };
        check(choices.length === 4 && new Set(choices).size === 4, 'not four different choices');
        check(choices.includes(n), 'answer missing');
        check(choices.join() === [...choices].sort((a, b) => a - b).join(), 'not sorted');
        check(choices.every(v => v >= 1 && v <= 10), 'outside 1-10');
        check(choices.includes(n - 1) && (n === 10 || choices.includes(n + 1)), 'one more or one less missing');
      }
    }
    expect(bad).toEqual([]);
  });
});

describe('apple-basket counting aloud', () => {
  it('counts one by one up to five, and from a full row of five past it', () => {
    expect(countingSteps(3)).toEqual([
      { upto: 1, say: 'אַחַת' }, { upto: 2, say: 'שְׁתַּיִם' }, { upto: 3, say: 'שָׁלוֹשׁ' },
    ]);
    expect(countingSteps(5).map(step => step.upto)).toEqual([1, 2, 3, 4, 5]);
    expect(countingSteps(7)).toEqual([
      { upto: 5, say: 'חָמֵשׁ' }, { upto: 6, say: 'שֵׁשׁ' }, { upto: 7, say: 'שֶׁבַע' },
    ]);
    expect(countingSteps(10).at(-1)).toEqual({ upto: 10, say: 'עֶשֶׂר' });
  });

  it('asks with a digit on screen and a matching number word aloud', () => {
    expect(buildAsk(4)).toEqual({ text: 'שִׂימוּ 4 תַּפּוּחִים בַּסַּל.', say: 'שִׂימוּ אַרְבָּעָה תַּפּוּחִים בַּסַּל.' });
    expect(buildAsk(2).say).toBe('שִׂימוּ שְׁנֵי תַּפּוּחִים בַּסַּל.');
    expect(buildAsk(7).text.replace(NIKUD, '')).toBe('שימו 7 תפוחים בסל.');
  });

  it('says what a wrong basket holds, what is needed, and which way to fix it', () => {
    expect(basketMiss(6, 4)).toEqual({
      text: 'בַּסַּל 6 תַּפּוּחִים. צָרִיךְ 4.',
      say: 'צָרִיךְ אַרְבָּעָה.',
      hint: 'יֵשׁ יוֹתֵר מִדַּי. הַחְזִירוּ לָעֵץ',
    });
    expect(basketMiss(1, 3).text).toBe('בַּסַּל תַּפּוּחַ אֶחָד. צָרִיךְ 3.');
    expect(basketMiss(2, 3).hint).toBe('חֲסֵרִים תַּפּוּחִים. הוֹסִיפוּ עוֹד');
  });
});
