import { describe, it, expect } from 'vitest';
import {
  countWord, straws, createRounds, totalOf, tensExercise, tensChoices, madeOf, storyFor, resultFor,
} from '../../../games/tens-bundles/game.js';

describe('tens-bundles number words', () => {
  it('counts past ten in the counting form, with the "and" fitted to the number', () => {
    expect([10, 11, 12, 19].map(countWord)).toEqual(['עֶשֶׂר', 'אַחַת עֶשְׂרֵה', 'שְׁתֵּים עֶשְׂרֵה', 'תְּשַׁע עֶשְׂרֵה']);
    expect([20, 23, 32, 48, 50, 57].map(countWord)).toEqual([
      'עֶשְׂרִים', 'עֶשְׂרִים וְשָׁלוֹשׁ', 'שְׁלוֹשִׁים וּשְׁתַּיִם', 'אַרְבָּעִים וּשְׁמוֹנֶה', 'חֲמִשִּׁים', 'חֲמִשִּׁים וְשֶׁבַע',
    ]);
    const words = Array.from({ length: 100 }, (_, n) => countWord(n));
    expect(new Set(words).size).toBe(100);
    for (const word of words) expect(word).not.toMatch(/\d/);
  });

  it('names straws with their number, shown with digits and said with words', () => {
    expect(straws(23)).toEqual({ text: '23 קַשִּׁיּוֹת', say: 'עֶשְׂרִים וְשָׁלוֹשׁ קַשִּׁיּוֹת' });
    expect(straws(2).say).toBe('שְׁתֵּי קַשִּׁיּוֹת');
    expect(straws(1).text).toBe('קַשִּׁית אַחַת');
  });

  it('says what a number is made of', () => {
    expect(madeOf(32)).toBe('שְׁלוֹשִׁים וּשְׁתַּיִם זֶה שְׁלוֹשָׁה צְרוֹרוֹת וְעוֹד שְׁתֵּי קַשִּׁיּוֹת.');
    expect(madeOf(20)).toBe('עֶשְׂרִים זֶה שְׁנֵי צְרוֹרוֹת.');
    expect(madeOf(5)).toBe('חָמֵשׁ זֶה חָמֵשׁ קַשִּׁיּוֹת.');
    expect(madeOf(11)).toBe('אַחַת עֶשְׂרֵה זֶה צְרוֹר אֶחָד וְעוֹד קַשִּׁית אַחַת.');
  });
});

describe('tens-bundles rounds', () => {
  it('ties one bundle, two, and one more, then reads, then builds', () => {
    const bad = [];
    for (let run = 0; run < 300; run++) {
      const rounds = createRounds();
      const check = (ok, why, round) => { if (!ok) bad.push({ why, round: round ?? rounds }); };
      check(rounds.map(r => r.kind).join() === 'bundle,bundle,bundle,read,build,build', 'wrong kinds');
      check(rounds.slice(0, 3).map(r => `${r.tens}/${r.ready}`).join() === '1/0,2/0,3/2', 'wrong bundles to tie');
      check(rounds[5].ones === 0, 'the last build is not a round ten');
      for (const round of rounds) {
        check(round.tens >= 1 && round.tens <= 5 && round.ones >= 0 && round.ones <= 9, 'outside the mat', round);
        check(totalOf(round) <= 59, 'above 59', round);
        if (round.kind === 'bundle') check(round.ones >= 1, 'no single straws left', round);
        if (round.kind === 'read' || rounds.indexOf(round) === 4) check(round.tens !== round.ones, 'digits repeat', round);
      }
    }
    expect(bad).toEqual([]);
  });

  it('writes each bundle as 10 in the exercise', () => {
    expect(tensExercise({ tens: 2, ones: 3 })).toBe('10 + 10 + 3');
    expect(tensExercise({ tens: 4, ones: 0 })).toBe('10 + 10 + 10 + 10');
    const beats = storyFor({ kind: 'bundle', tens: 1, ones: 6, ready: 0 });
    expect(beats.map(b => b.equation)).toEqual(['', '', '10 + 6 = ?']);
    expect(beats.map(b => b.scene)).toEqual(['start', 'change', 'question']);
    expect(storyFor({ kind: 'bundle', tens: 3, ones: 4, ready: 2 })[0].text).toBe('בַּקֻּפְסָה יֵשׁ 2 צְרוֹרוֹת, וְעוֹד הַרְבֵּה קַשִּׁיּוֹת.');
    expect(storyFor({ kind: 'read', tens: 3, ones: 4 })[0].say).toBe('בַּקֻּפְסָה יֵשׁ שְׁלוֹשָׁה צְרוֹרוֹת, וְעוֹד אַרְבַּע קַשִּׁיּוֹת.');
    expect(resultFor({ kind: 'read', tens: 3, ones: 4 })).toEqual({ text: 'יֵשׁ 34 קַשִּׁיּוֹת.', say: 'יֵשׁ שְׁלוֹשִׁים וְאַרְבַּע קַשִּׁיּוֹת.' });
  });

  it('offers the swapped digits and the bundles counted as straws', () => {
    const bad = [];
    for (let run = 0; run < 100; run++) {
      for (const round of createRounds().filter(r => r.kind !== 'build')) {
        const choices = tensChoices(round);
        const n = totalOf(round);
        const swapped = round.ones * 10 + round.tens;
        const check = (ok, why) => { if (!ok) bad.push({ why, round, choices }); };
        check(choices.length === 4 && new Set(choices).size === 4, 'not four different choices');
        check(choices.includes(n), 'answer missing');
        check(choices.join() === [...choices].sort((a, b) => a - b).join(), 'not sorted');
        check(choices.every(c => c >= 1 && c <= 59), 'outside 1-59');
        check(swapped > 59 || swapped === n || choices.includes(swapped), 'swapped digits missing');
        check(choices.includes(round.tens + round.ones), 'bundles as straws missing');
      }
    }
    expect(bad).toEqual([]);
    expect(tensChoices({ kind: 'read', tens: 3, ones: 4 })).toEqual([7, 34, 43, 44]);
  });
});
