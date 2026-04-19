import { describe, it, expect } from 'vitest';
import {
  VOWEL_TEMPLATES,
  NIKUD_VOWEL,
  classifyFormants,
  extractFormantsFromSpectrum,
  matchNikudVowel,
} from '../audio/vowel-detector.js';

describe('classifyFormants', () => {
  it('returns empty result for invalid input', () => {
    expect(classifyFormants(0, 0)).toEqual({ vowel: '', confidence: 0 });
    expect(classifyFormants(NaN, 1000)).toEqual({ vowel: '', confidence: 0 });
    expect(classifyFormants(-100, 500)).toEqual({ vowel: '', confidence: 0 });
    expect(classifyFormants(2000, 1000)).toEqual({ vowel: '', confidence: 0 }); // F2 <= F1
  });

  it('classifies each template exactly to itself', () => {
    for (const [vowel, t] of Object.entries(VOWEL_TEMPLATES)) {
      const result = classifyFormants(t.F1, t.F2);
      expect(result.vowel, `expected ${vowel} for template ${JSON.stringify(t)}`).toBe(vowel);
    }
  });

  it('classifies /a/ in a realistic child range', () => {
    expect(classifyFormants(900, 1400).vowel).toBe('a');
    expect(classifyFormants(1100, 1600).vowel).toBe('a');
  });

  it('classifies /i/ with high F2', () => {
    expect(classifyFormants(380, 2800).vowel).toBe('i');
    expect(classifyFormants(450, 3000).vowel).toBe('i');
  });

  it('classifies /u/ with low F2 far from /o/', () => {
    expect(classifyFormants(380, 850).vowel).toBe('u');
  });

  it('distinguishes /o/ from /u/ by F2', () => {
    const o = classifyFormants(600, 1100);
    const u = classifyFormants(400, 850);
    expect(o.vowel).toBe('o');
    expect(u.vowel).toBe('u');
  });

  it('returns confidence between 0 and 1', () => {
    for (const [, t] of Object.entries(VOWEL_TEMPLATES)) {
      const { confidence } = classifyFormants(t.F1, t.F2);
      expect(confidence).toBeGreaterThanOrEqual(0);
      expect(confidence).toBeLessThanOrEqual(1);
    }
  });
});

describe('matchNikudVowel', () => {
  it('accepts every canonical nikud paired with its vowel', () => {
    for (const [nikudId, vowel] of Object.entries(NIKUD_VOWEL)) {
      expect(matchNikudVowel(vowel, nikudId)).toBe(true);
    }
  });

  it('treats kamatz and patah as the /a/ pair', () => {
    expect(matchNikudVowel('a', 'kamatz')).toBe(true);
    expect(matchNikudVowel('a', 'patah')).toBe(true);
  });

  it('treats tzere and segol as the /e/ pair', () => {
    expect(matchNikudVowel('e', 'tzere')).toBe(true);
    expect(matchNikudVowel('e', 'segol')).toBe(true);
  });

  it('rejects wrong vowels', () => {
    expect(matchNikudVowel('i', 'kamatz')).toBe(false);
    expect(matchNikudVowel('o', 'hiriq')).toBe(false);
    expect(matchNikudVowel('a', 'holam')).toBe(false);
  });

  it('rejects unknown inputs', () => {
    expect(matchNikudVowel('', 'kamatz')).toBe(false);
    expect(matchNikudVowel('a', '')).toBe(false);
    expect(matchNikudVowel('x', 'kamatz')).toBe(false);
    expect(matchNikudVowel('a', 'unknown-nikud')).toBe(false);
  });
});

describe('extractFormantsFromSpectrum', () => {
  /**
   * בונה ספקטרום סינתטי בגודל קבוע שבו מוזרקות שתי פסגות גאוסיניות
   * סביב F1 ו-F2. מחקה את הצורה הגסה של ספקטרום תנועה.
   */
  function makeSpectrum(F1, F2, binHz = 12, length = 2048) {
    const spectrum = new Float32Array(length).fill(-120);
    const addPeak = (freq, height, width) => {
      const center = Math.round(freq / binHz);
      for (let i = 0; i < length; i++) {
        const d = i - center;
        spectrum[i] = Math.max(spectrum[i], height * Math.exp(-(d * d) / (2 * width * width)) - 120 + height);
      }
    };
    // צורה כללית + שתי פסגות חזקות
    for (let i = 0; i < length; i++) spectrum[i] = -100 - (i / length) * 20;
    addPeak(F1, 60, 4);
    addPeak(F2, 55, 5);
    return spectrum;
  }

  it('returns zeros for invalid inputs', () => {
    expect(extractFormantsFromSpectrum(null, 10)).toEqual({ F1: 0, F2: 0 });
    expect(extractFormantsFromSpectrum(new Float32Array(0), 10)).toEqual({ F1: 0, F2: 0 });
    expect(extractFormantsFromSpectrum(new Float32Array(100), 0)).toEqual({ F1: 0, F2: 0 });
  });

  it('recovers F1/F2 from a synthetic /a/ spectrum within one bin', () => {
    const binHz = 12;
    const spectrum = makeSpectrum(950, 1500, binHz);
    const { F1, F2 } = extractFormantsFromSpectrum(spectrum, binHz);
    expect(Math.abs(F1 - 950)).toBeLessThanOrEqual(binHz);
    expect(Math.abs(F2 - 1500)).toBeLessThanOrEqual(binHz);
  });

  it('recovers F1/F2 from a synthetic /i/ spectrum', () => {
    const binHz = 12;
    const spectrum = makeSpectrum(400, 2800, binHz);
    const { F1, F2 } = extractFormantsFromSpectrum(spectrum, binHz);
    expect(Math.abs(F1 - 400)).toBeLessThanOrEqual(binHz * 2);
    expect(Math.abs(F2 - 2800)).toBeLessThanOrEqual(binHz * 2);
  });

  it('synthetic pipeline: spectrum -> formants -> vowel classifies correctly', () => {
    const binHz = 12;
    const cases = [
      { label: 'a', F1: 950, F2: 1500 },
      { label: 'e', F1: 600, F2: 2300 },
      { label: 'i', F1: 400, F2: 2900 },
      { label: 'o', F1: 600, F2: 1050 },
      { label: 'u', F1: 400, F2: 900 },
    ];
    for (const c of cases) {
      const spectrum = makeSpectrum(c.F1, c.F2, binHz);
      const { F1, F2 } = extractFormantsFromSpectrum(spectrum, binHz);
      const { vowel } = classifyFormants(F1, F2);
      expect(vowel, `expected ${c.label} for synthetic spectrum`).toBe(c.label);
    }
  });
});
