/**
 * core/progress - זיכרון ההתקדמות המקומי:
 * חישוב כוכבים עקבי, רישום משפר-בלבד, ועמידות לקלט שגוי.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { starsFor, recordGameResult } from '../../core/progress.js';

/** What the home page reads to draw stars on the game cards. */
const saved = () => JSON.parse(localStorage.getItem('alefbet.progress.v1') || '{}');

beforeEach(() => {
  try { localStorage.clear(); } catch { /* ignore */ }
});

describe('starsFor', () => {
  it('3 כוכבים מ-80%, 2 מ-50%, אחרת 1', () => {
    expect(starsFor(8, 8)).toBe(3);
    expect(starsFor(7, 8)).toBe(3);   // 87%
    expect(starsFor(5, 8)).toBe(2);   // 62%
    expect(starsFor(4, 8)).toBe(2);   // 50%
    expect(starsFor(2, 8)).toBe(1);
    expect(starsFor(0, 8)).toBe(1);
  });

  it('קלט שגוי מחזיר כוכב אחד ולא זורק', () => {
    expect(starsFor(NaN, 8)).toBe(1);
    expect(starsFor(3, 0)).toBe(1);
  });
});

describe('recordGameResult', () => {
  it('רישום ראשון יוצר רשומה מלאה', () => {
    const result = recordGameResult('syllable-read', { score: 7, total: 8 });
    expect(result).toMatchObject({ plays: 1, bestScore: 7, bestStars: 3, total: 8 });
    expect(saved()['syllable-read']).toMatchObject({ bestScore: 7, bestStars: 3 });
  });

  it('משפר-בלבד: תוצאה חלשה לא דורסת שיא, אבל plays נספר', () => {
    recordGameResult('g', { score: 8, total: 8 });
    const after = recordGameResult('g', { score: 2, total: 8 });
    expect(after.plays).toBe(2);
    expect(after.bestScore).toBe(8);
    expect(after.bestStars).toBe(3);
  });

  it('תוצאה טובה יותר מעדכנת את השיא', () => {
    recordGameResult('g', { score: 3, total: 8 });
    const after = recordGameResult('g', { score: 8, total: 8 });
    expect(after.bestScore).toBe(8);
    expect(after.bestStars).toBe(3);
  });

  it('קלט שגוי מוחזר null ולא נכתב', () => {
    expect(recordGameResult('', { score: 5, total: 8 })).toBeNull();
    expect(recordGameResult('g', { score: NaN, total: 8 })).toBeNull();
    expect(saved().g).toBeUndefined();
  });

  it('שומר את כל המשחקים במפתח שדף הבית קורא', () => {
    recordGameResult('a', { score: 5, total: 8 });
    recordGameResult('b', { score: 8, total: 8 });
    expect(Object.keys(saved()).sort()).toEqual(['a', 'b']);
  });
});
