import { describe, it, expect } from 'vitest';
import { hebrewLetters, getLetter, getLettersByGroup, randomLetters } from '../data/hebrew-letters.js';

describe('hebrewLetters data integrity', () => {
  it('has 22 regular letters plus the 5 final forms, all unique and the finals marked', () => {
    expect(hebrewLetters).toHaveLength(27);
    expect(hebrewLetters.filter(l => !l.isFinal)).toHaveLength(22);
    expect(hebrewLetters.filter(l => l.isFinal).map(l => l.letter).sort()).toEqual(['ך', 'ם', 'ן', 'ף', 'ץ'].sort());
    expect(new Set(hebrewLetters.map(l => l.letter)).size).toBe(27);
  });

  it('every entry has the required fields and a single bare letter - no embedded nikud', () => {
    for (const l of hebrewLetters) {
      for (const field of ['letter', 'name', 'nameNikud', 'exampleWord', 'emoji']) {
        expect(l[field], `${field} missing for ${l.letter ?? l.name}`).toBeTruthy();
      }
      expect(typeof l.isFinal).toBe('boolean');
      // רגרסיה: ם נשמרה בעבר עם חיריק תקוע ו-ך עם שווא, ולכן getLetter('ם')
      // נכשל וכל התאמה לפי תו נשברה בשקט.
      expect(l.letter, `letter "${l.name}" must be one bare Hebrew letter`).toMatch(/^[א-ת]$/);
    }
  });

  it('every regular letter has an example word that starts with it', () => {
    // Letter games show the example word's picture as the answer for its letter.
    for (const l of hebrewLetters.filter(entry => !entry.isFinal)) {
      expect(l.exampleWord.replace(/[\u0591-\u05C7]/g, '')[0], `exampleWord of ${l.letter}`).toBe(l.letter);
    }
  });
});

describe('getLetter', () => {
  it('returns the correct entry for known letters', () => {
    expect(getLetter('א')?.name).toBe('אֶלֶף');
    expect(getLetter('ת')?.name).toBe('תָּו');
    // רגרסיה: ל היה שמור בעבר כ-'לָמַד' (הפועל "למד", לא שם האות),
    // צ כ-'צִדֵּי' (ניקוד שגוי), ו-פ/ף ללא ניקוד כלל ('פא'/'פא סופית').
    expect(getLetter('ל')?.name).toBe('לָמֵד');
    expect(getLetter('צ')?.name).toBe('צַדִּי');
    expect(getLetter('פ')?.name).toBe('פֵּא');
    expect(getLetter('ף')?.name).toBe('פֵּא סוֹפִית');
  });

  it.each(['X', 'a', ''])('returns null for %j, which is not in the alphabet', char => {
    expect(getLetter(char)).toBeNull();
  });
});

describe('letter groups', () => {
  it.each([
    [undefined, 22, l => !l.isFinal],
    ['final', 5, l => l.isFinal],
    ['all', 27, () => true],
    ['???', 27, () => true], // unknown group falls through to all letters
  ])('getLettersByGroup(%j) returns %i letters', (group, count, belongs) => {
    const letters = getLettersByGroup(group);
    expect(letters).toHaveLength(count);
    expect(letters.every(belongs)).toBe(true);
  });

  it('randomLetters returns the requested count without duplicates, capped at the pool, within the group', () => {
    expect(randomLetters(4)).toHaveLength(4);
    expect(randomLetters(1)).toHaveLength(1);
    const ten = randomLetters(10);
    expect(ten).toHaveLength(10);
    expect(new Set(ten.map(l => l.letter)).size).toBe(10);
    expect(randomLetters(100)).toHaveLength(22); // 22 regular letters maximum, rather than throwing
    expect(randomLetters(3, 'final').every(l => l.isFinal)).toBe(true);
  });
});
