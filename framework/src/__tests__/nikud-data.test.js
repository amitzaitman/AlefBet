import { describe, it, expect } from 'vitest';
import { nikudList, nikudBaseLetters, letterWithNikud, randomNikud } from '../data/nikud.js';
import { hebrewLetters } from '../data/hebrew-letters.js';

describe('nikud data', () => {
  it('nikudList holds the seven canonical nikud, each complete, with unique symbols', () => {
    expect(nikudList.map(n => n.id).sort()).toEqual(['hiriq', 'holam', 'kamatz', 'kubbutz', 'patah', 'segol', 'tzere']);
    for (const n of nikudList) {
      for (const field of ['name', 'nameNikud', 'symbol', 'sound', 'color']) expect(n[field], `${field} missing for ${n.id}`).toBeTruthy();
    }
    expect(new Set(nikudList.map(n => n.symbol)).size).toBe(7);
  });

  it('nikudBaseLetters are exactly the 22 regular letters - single characters, no final forms', () => {
    // רגרסיה: הרשימה הייתה מוגבלת בעבר ל-12 אותיות בלבד, ומנעה תרגול
    // ניקוד/הברות על ה,ו,ז,ח,ט,י,כ,ס,ע,צ. נגזרת עכשיו מ-hebrewLetters
    // כדי שלא תוכל להתפצל שוב.
    expect(nikudBaseLetters).toHaveLength(22);
    expect(new Set(nikudBaseLetters)).toEqual(new Set(hebrewLetters.filter(l => !l.isFinal).map(l => l.letter)));
  });

  it('letterWithNikud joins a letter and each nikud symbol into two code points', () => {
    for (const n of nikudList) expect([...letterWithNikud('מ', n.symbol)]).toEqual(['מ', n.symbol]);
  });

  it('randomNikud returns the requested count of distinct nikudList entries', () => {
    expect(randomNikud(1)).toHaveLength(1);
    expect(randomNikud(3)).toHaveLength(3);
    expect(new Set(randomNikud(7).map(n => n.id)).size).toBe(7);
    const ids = new Set(nikudList.map(n => n.id));
    expect(randomNikud(5).every(n => ids.has(n.id))).toBe(true);
  });
});
