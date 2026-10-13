import { it, expect } from 'vitest';
import { numberWord, countNoun, exerciseWords } from '../../data/hebrew-numbers.js';

const HOP = { one: 'קְפִיצָה', many: 'קְפִיצוֹת', gender: /** @type {const} */ ('f') };
const BALLOON = { one: 'בָּלוֹן', many: 'בָּלוֹנִים', gender: /** @type {const} */ ('m') };

it('says 0 to 10 in both genders with no digits, and digits outside that range', () => {
  const feminine = Array.from({ length: 11 }, (_, n) => numberWord(n));
  const masculine = Array.from({ length: 11 }, (_, n) => numberWord(n, 'm'));
  expect(feminine).toEqual(['אֶפֶס', 'אַחַת', 'שְׁתַּיִם', 'שָׁלוֹשׁ', 'אַרְבַּע', 'חָמֵשׁ', 'שֵׁשׁ', 'שֶׁבַע', 'שְׁמוֹנֶה', 'תֵּשַׁע', 'עֶשֶׂר']);
  expect(masculine).toEqual(['אֶפֶס', 'אֶחָד', 'שְׁנַיִם', 'שְׁלוֹשָׁה', 'אַרְבָּעָה', 'חֲמִשָּׁה', 'שִׁשָּׁה', 'שִׁבְעָה', 'שְׁמוֹנָה', 'תִּשְׁעָה', 'עֲשָׂרָה']);
  expect([numberWord(11), numberWord(-1), numberWord(2.5)]).toEqual(['11', '-1', '2.5']);
});

it('makes the number agree with the noun, in words or digits', () => {
  expect(countNoun(1, HOP)).toBe('קְפִיצָה אַחַת');
  expect(countNoun(1, HOP, { digits: true })).toBe('קְפִיצָה אַחַת');
  expect(countNoun(2, HOP)).toBe('שְׁתֵּי קְפִיצוֹת');
  expect(countNoun(2, HOP, { digits: true })).toBe('2 קְפִיצוֹת');
  expect(countNoun(4, HOP)).toBe('אַרְבַּע קְפִיצוֹת');
  expect(countNoun(4, HOP, { digits: true })).toBe('4 קְפִיצוֹת');
  expect(countNoun(1, BALLOON)).toBe('בָּלוֹן אֶחָד');
  expect(countNoun(1, BALLOON, { digits: true })).toBe('בָּלוֹן אֶחָד');
  expect(countNoun(2, BALLOON)).toBe('שְׁנֵי בָּלוֹנִים');
  expect(countNoun(2, BALLOON, { digits: true })).toBe('2 בָּלוֹנִים');
  expect(countNoun(4, BALLOON)).toBe('אַרְבָּעָה בָּלוֹנִים');
  expect(countNoun(4, BALLOON, { digits: true })).toBe('4 בָּלוֹנִים');
});

it('reads an exercise in counting words', () => {
  expect(exerciseWords('-', 6, 2)).toBe('שֵׁשׁ פָּחוֹת שְׁתַּיִם');
  expect(exerciseWords('+', 4, 3)).toBe('אַרְבַּע וְעוֹד שָׁלוֹשׁ');
});
