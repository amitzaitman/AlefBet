import { describe, it, expect } from 'vitest';
import {
  nikudList,
  nikudBaseLetters,
  letterWithNikud,
  randomNikud,
} from '../data/nikud.js';

describe('nikudList data integrity', () => {
  it('has 8 entries', () => {
    expect(nikudList).toHaveLength(8);
  });

  it('every entry has required fields', () => {
    for (const n of nikudList) {
      expect(n.id,        `id missing`).toBeTruthy();
      expect(n.name,      `name missing for ${n.id}`).toBeTruthy();
      expect(n.nameNikud, `nameNikud missing for ${n.id}`).toBeTruthy();
      expect(n.symbol,    `symbol missing for ${n.id}`).toBeTruthy();
      expect(n.sound,     `sound missing for ${n.id}`).toBeTruthy();
      expect(n.color,     `color missing for ${n.id}`).toBeTruthy();
    }
  });

  it('ids are unique', () => {
    const ids = nikudList.map(n => n.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('symbols are unique Unicode characters', () => {
    const syms = nikudList.map(n => n.symbol);
    expect(new Set(syms).size).toBe(syms.length);
  });

  it('contains the seven canonical nikud + shva', () => {
    const ids = nikudList.map(n => n.id);
    for (const expected of ['kamatz', 'patah', 'hiriq', 'tzere', 'segol', 'holam', 'kubbutz', 'shva']) {
      expect(ids, `missing ${expected}`).toContain(expected);
    }
  });
});

describe('nikudBaseLetters', () => {
  it('contains only single Hebrew characters', () => {
    for (const ch of nikudBaseLetters) {
      expect(ch).toHaveLength(1);
      // Unicode range for Hebrew letters: U+05D0–U+05EA
      expect(ch.charCodeAt(0)).toBeGreaterThanOrEqual(0x05D0);
      expect(ch.charCodeAt(0)).toBeLessThanOrEqual(0x05EA);
    }
  });

  it('contains no final-form letters', () => {
    const finalForms = ['ך', 'ם', 'ן', 'ף', 'ץ'];
    for (const ch of nikudBaseLetters) {
      expect(finalForms).not.toContain(ch);
    }
  });
});

describe('letterWithNikud', () => {
  it('concatenates letter + symbol into a 2-character string', () => {
    const kamatz = '\u05B8';
    const result = letterWithNikud('א', kamatz);
    expect(result).toBe('א' + kamatz);
    expect([...result]).toHaveLength(2); // 2 Unicode code points
  });

  it('works for all nikud symbols', () => {
    for (const n of nikudList) {
      const r = letterWithNikud('מ', n.symbol);
      expect(r).toHaveLength(2);
      expect(r[0]).toBe('מ');
      expect(r[1]).toBe(n.symbol);
    }
  });
});

describe('randomNikud', () => {
  it('returns the requested count', () => {
    expect(randomNikud(3)).toHaveLength(3);
    expect(randomNikud(1)).toHaveLength(1);
  });

  it('returns entries from nikudList', () => {
    const ids = new Set(nikudList.map(n => n.id));
    for (const n of randomNikud(5)) {
      expect(ids.has(n.id)).toBe(true);
    }
  });

  it('returns no duplicates', () => {
    const result = randomNikud(8);
    const ids = result.map(n => n.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
