import { describe, it, expect } from 'vitest';
import {
  createRounds, answerFor, childSide, equationText, equationWords, weighMiss,
} from '../../../games/balance-scale/game.js';

/** @param {(number | '?')[]} side */
const shape = side => side.map(term => (term === '?' ? '?' : 'n')).join('+');
/** @param {(number | '?')[]} side */
const sum = side => side.reduce((total, term) => total + (term === '?' ? 0 : term), 0);

describe('balance-scale rounds', () => {
  it('moves the unknown around the equal sign and keeps every pan within ten', () => {
    const bad = [];
    for (let run = 0; run < 300; run++) {
      const rounds = createRounds();
      const check = (ok, why, round) => { if (!ok) bad.push({ why, round: round ?? rounds }); };
      check(rounds.map(r => `${shape(r.left)}=${shape(r.right)}`).join(' ') === 'n=? n+n=? ?=n+n n=n+? n+n=n+? n+?=n+n', 'wrong shapes');
      check(rounds.filter(r => r.tip).length === 1 && rounds[0].tip, 'the = tip is not on the first round only');
      for (const round of rounds) {
        const answer = answerFor(round);
        check(Number.isInteger(answer) && answer >= 2, 'answer below 2', round);
        check(sum(childSide(round) === 'left' ? round.right : round.left) <= 10, 'pan above ten', round);
        check(sum(round.left) + (childSide(round) === 'left' ? answer : 0) === sum(round.right) + (childSide(round) === 'right' ? answer : 0), 'sides not equal', round);
        check([...round.left, ...round.right].every(term => term === '?' || term >= 2), 'a term below 2', round);
      }
      // With an exercise on both sides, the lone number differs from both parts.
      for (const round of rounds.slice(4)) {
        const [lone] = childSide(round) === 'right' ? round.right : round.left;
        const parts = childSide(round) === 'right' ? round.left : round.right;
        check(!parts.includes(lone), 'the lone number repeats a part', round);
      }
    }
    expect(bad).toEqual([]);
  });

  it('solves for the child\'s cubes on either side', () => {
    expect(answerFor({ left: [3, 4], right: [5, '?'] })).toBe(2);
    expect(answerFor({ left: [5, '?'], right: [3, 4] })).toBe(2);
    expect(answerFor({ left: ['?'], right: [3, 4] })).toBe(7);
    expect(childSide({ left: ['?'], right: [3, 4] })).toBe('left');
    expect(childSide({ left: [6], right: ['?'] })).toBe('right');
  });
});

describe('balance-scale exercise', () => {
  it('shows the exercise left to right, with the answer once solved', () => {
    expect(equationText({ left: [7], right: [3, '?'] })).toBe('7 = 3 + ?');
    expect(equationText({ left: [5, '?'], right: [3, 4] }, 2)).toBe('5 + 2 = 3 + 4');
  });

  it('reads = as "שָׁוֶה לְ", with the prefix fitted to the number', () => {
    expect(equationWords({ left: [7], right: [3, '?'] })).toBe('שֶׁבַע שָׁוֶה לְשָׁלוֹשׁ וְעוֹד כַּמָּה?');
    expect(equationWords({ left: [7], right: [3, '?'] }, 4)).toBe('שֶׁבַע שָׁוֶה לְשָׁלוֹשׁ וְעוֹד אַרְבַּע.');
    expect(equationWords({ left: ['?'], right: [3, 4] })).toBe('כַּמָּה שָׁוֶה לְשָׁלוֹשׁ וְעוֹד אַרְבַּע?');
    expect(equationWords({ left: [2, 6], right: ['?'] }, 8)).toBe('שְׁתַּיִם וְעוֹד שֵׁשׁ שָׁוֶה לִשְׁמוֹנֶה.');
    expect(equationWords({ left: [4], right: ['?'] })).toBe('אַרְבַּע שָׁוֶה לְכַמָּה?');
    expect(equationWords({ left: [6], right: [2, '?'] }, 4)).toBe('שֵׁשׁ שָׁוֶה לִשְׁתַּיִם וְעוֹד אַרְבַּע.');
  });

  it('says which side has more, then both totals left to right', () => {
    expect(weighMiss(6, 7, 'left')).toEqual({
      more: false,
      side: 'בַּצַּד שֶׁלָּכֶם פָּחוֹת.',
      hint: 'הוֹסִיפוּ קֻבִּיּוֹת',
      totals: { text: 'שְׁנֵי הַצְּדָדִים אֵינָם שָׁוִים.', say: 'שֵׁשׁ וְשֶׁבַע אֵינָם שָׁוִים.' },
    });
    expect(weighMiss(9, 7, 'right').side).toBe('בַּצַּד שֶׁלָּכֶם יוֹתֵר.');
    expect(weighMiss(9, 7, 'right').hint).toBe('הוֹרִידוּ קֻבִּיּוֹת');
    expect(weighMiss(9, 7, 'right').totals.say).toBe('שֶׁבַע וְתֵשַׁע אֵינָם שָׁוִים.');
    expect(weighMiss(6, 8, 'left').totals.say).toBe('שֵׁשׁ וּשְׁמוֹנֶה אֵינָם שָׁוִים.');
    expect(weighMiss(3, 2, 'left').totals.say).toBe('שָׁלוֹשׁ וּשְׁתַּיִם אֵינָם שָׁוִים.');
  });
});
