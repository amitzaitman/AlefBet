import { describe, it, expect } from 'vitest';
import {
  hebrewLetters,
  getLetter,
  getLettersByGroup,
  randomLetters,
} from '../data/hebrew-letters.js';

describe('hebrewLetters data integrity', () => {
  it('has 27 entries: 22 regular + 5 final forms', () => {
    expect(hebrewLetters).toHaveLength(27);
  });

  it('has exactly 5 final-form letters', () => {
    expect(hebrewLetters.filter(l => l.isFinal)).toHaveLength(5);
  });

  it('has exactly 22 regular letters', () => {
    expect(hebrewLetters.filter(l => !l.isFinal)).toHaveLength(22);
  });

  it('every entry has required fields', () => {
    for (const l of hebrewLetters) {
      expect(l.letter,      `letter field missing for ${l.name}`).toBeTruthy();
      expect(l.name,        `name missing for ${l.letter}`).toBeTruthy();
      expect(l.nameNikud,   `nameNikud missing for ${l.letter}`).toBeTruthy();
      expect(l.exampleWord, `exampleWord missing for ${l.letter}`).toBeTruthy();
      expect(l.emoji,       `emoji missing for ${l.letter}`).toBeTruthy();
      expect(typeof l.isFinal).toBe('boolean');
    }
  });

  it('letter characters are unique', () => {
    const chars = hebrewLetters.map(l => l.letter);
    expect(new Set(chars).size).toBe(chars.length);
  });

  it('all final forms are marked correctly', () => {
    const finalChars = ['ךְ', 'םִ', 'ן', 'ף', 'ץ'];
    for (const ch of finalChars) {
      expect(getLetter(ch)?.isFinal, `${ch} should be isFinal`).toBe(true);
    }
  });
});

describe('getLetter', () => {
  it('returns the correct entry for known letters', () => {
    expect(getLetter('א')?.name).toBe('אֶלֶף');
    expect(getLetter('ת')?.name).toBe('תָּו');
  });

  it('returns null for characters not in the alphabet', () => {
    expect(getLetter('X')).toBeNull();
    expect(getLetter('a')).toBeNull();
    expect(getLetter('')).toBeNull();
  });
});

describe('getLettersByGroup', () => {
  it('returns only regular letters by default', () => {
    const regular = getLettersByGroup();
    expect(regular).toHaveLength(22);
    expect(regular.every(l => !l.isFinal)).toBe(true);
  });

  it('"final" returns only final-form letters', () => {
    const final = getLettersByGroup('final');
    expect(final).toHaveLength(5);
    expect(final.every(l => l.isFinal)).toBe(true);
  });

  it('"all" returns all 27 letters', () => {
    expect(getLettersByGroup('all')).toHaveLength(27);
  });

  it('unknown group falls through and returns all 27 letters', () => {
    expect(getLettersByGroup('???')).toHaveLength(27);
  });
});

describe('randomLetters', () => {
  it('returns the requested count', () => {
    expect(randomLetters(4)).toHaveLength(4);
    expect(randomLetters(1)).toHaveLength(1);
  });

  it('returns no duplicate letters', () => {
    const result = randomLetters(10);
    const unique = new Set(result.map(l => l.letter));
    expect(unique.size).toBe(result.length);
  });

  it('caps at pool size rather than throwing', () => {
    // 22 regular letters maximum
    expect(randomLetters(100)).toHaveLength(22);
  });

  it('respects the "final" group filter', () => {
    const result = randomLetters(3, 'final');
    expect(result.every(l => l.isFinal)).toBe(true);
  });
});
