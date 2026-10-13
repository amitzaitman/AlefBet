import { describe, it, expect } from 'vitest';
import { HINT, INSTRUCTION, ROUND_COUNT, WHOLE, answerFor, choicesFor, createRounds, frameLabel } from '../src/games/make-ten/logic.js';

describe('make-ten logic', () => {
  it('plays six rounds, each with a different number of full cells from 0 to 10', () => {
    for (let run = 0; run < 50; run++) {
      const givens = createRounds().map(round => round.given);
      expect(givens).toHaveLength(ROUND_COUNT);
      expect(new Set(givens).size).toBe(ROUND_COUNT);
      givens.forEach(given => expect(given).toBeGreaterThanOrEqual(0));
      givens.forEach(given => expect(given).toBeLessThanOrEqual(WHOLE));
    }
  });

  it('answers with the empty cells: 10 minus the full ones', () => {
    expect(answerFor({ given: 0 })).toBe(10);
    expect(answerFor({ given: 7 })).toBe(3);
    expect(answerFor({ given: 10 })).toBe(0);
  });

  it('offers the answer and three other numbers from 0 to 10, and they are shuffled', () => {
    for (let given = 0; given <= WHOLE; given++) {
      for (let run = 0; run < 20; run++) {
        const choices = choicesFor(given);
        expect(choices).toHaveLength(4);
        expect(new Set(choices).size).toBe(4);
        expect(choices).toContain(WHOLE - given);
        choices.forEach(value => expect(value >= 0 && value <= WHOLE).toBe(true));
      }
    }
    // The answer is not always in the same place.
    const places = new Set(Array.from({ length: 200 }, () => choicesFor(5).indexOf(5)));
    expect(places.size).toBeGreaterThan(1);
  });

  it('keeps each round\'s choices with the round, so a round looks the same until it is answered', () => {
    for (const round of createRounds()) expect(round.choices).toContain(answerFor(round));
  });

  it('keeps the words of today\'s game and counts cells in proper Hebrew', () => {
    expect(INSTRUCTION).toBe('כַּמָּה חָסֵר עַד עֶשֶׂר?');
    expect(HINT).toBe('סִפְרוּ אֶת הַמִּשְׁבָּצוֹת הָרֵיקוֹת');
    expect(frameLabel(1)).toBe('מִשְׁבֶּצֶת אַחַת מְלֵאָה מִתּוֹךְ 10');
    expect(frameLabel(4)).toBe('4 מִשְׁבָּצוֹת מְלֵאוֹת מִתּוֹךְ 10');
  });
});
