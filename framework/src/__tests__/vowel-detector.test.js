import { describe, it, expect } from 'vitest';
import {
  VOWEL_TEMPLATES,
  NIKUD_VOWEL,
  classifyFormants,
  cepstralEnvelope,
  extractFormantsFromSpectrum,
  matchNikudVowel,
} from '../audio/vowel-detector.js';

describe('classifyFormants', () => {
  it('returns empty result for invalid input', () => {
    expect(classifyFormants(0, 0)).toEqual({ vowel: '', confidence: 0 });
    expect(classifyFormants(NaN, 1000)).toEqual({ vowel: '', confidence: 0 });
    expect(classifyFormants(-100, 500)).toEqual({ vowel: '', confidence: 0 });
    expect(classifyFormants(2000, 1000)).toEqual({ vowel: '', confidence: 0 });
  });

  it('classifies each template exactly to itself', () => {
    for (const [vowel, t] of Object.entries(VOWEL_TEMPLATES)) {
      const result = classifyFormants(t.F1, t.F2);
      expect(result.vowel, `expected ${vowel} for template ${JSON.stringify(t)}`).toBe(vowel);
    }
  });

  it('classifies typical adult-male /a/', () => {
    expect(classifyFormants(730, 1090).vowel).toBe('a');
  });

  it('classifies typical child /a/', () => {
    expect(classifyFormants(1000, 1500).vowel).toBe('a');
  });

  it('distinguishes /o/ from /u/ by F2', () => {
    expect(classifyFormants(550, 1000).vowel).toBe('o');
    expect(classifyFormants(400, 850).vowel).toBe('u');
  });

  it('classifies /i/ with high F2', () => {
    expect(classifyFormants(300, 2500).vowel).toBe('i');
    expect(classifyFormants(400, 2800).vowel).toBe('i');
  });
});

describe('matchNikudVowel', () => {
  it('accepts every canonical nikud paired with its vowel', () => {
    for (const [nikudId, vowel] of Object.entries(NIKUD_VOWEL)) {
      expect(matchNikudVowel(vowel, nikudId)).toBe(true);
    }
  });

  it('treats kamatz and patah as the /a/ pair, tzere and segol as /e/', () => {
    expect(matchNikudVowel('a', 'kamatz')).toBe(true);
    expect(matchNikudVowel('a', 'patah')).toBe(true);
    expect(matchNikudVowel('e', 'tzere')).toBe(true);
    expect(matchNikudVowel('e', 'segol')).toBe(true);
  });

  it('rejects wrong vowels and unknown inputs', () => {
    expect(matchNikudVowel('i', 'kamatz')).toBe(false);
    expect(matchNikudVowel('a', 'holam')).toBe(false);
    expect(matchNikudVowel('', 'kamatz')).toBe(false);
    expect(matchNikudVowel('a', '')).toBe(false);
    expect(matchNikudVowel('x', 'kamatz')).toBe(false);
    expect(matchNikudVowel('a', 'unknown-nikud')).toBe(false);
  });
});

describe('cepstralEnvelope', () => {
  it('handles trivial input', () => {
    const out = cepstralEnvelope(new Float32Array(0), 10);
    expect(out.length).toBe(0);
  });

  it('flattens harmonic structure, preserving broad envelope shape', () => {
    const N = 512;
    const raw = new Float32Array(N);
    // Envelope: smooth gaussian bump around bin 100
    const bump = (i) => 30 * Math.exp(-((i - 100) ** 2) / (2 * 40 * 40));
    // Harmonic comb: sharp spikes every 20 bins
    for (let i = 0; i < N; i++) raw[i] = bump(i) + (i % 20 === 0 ? 25 : 0);
    const env = cepstralEnvelope(raw, 15);
    // The envelope peak should be near bin 100, not at the comb spikes.
    let maxBin = 0;
    for (let i = 10; i < N - 10; i++) if (env[i] > env[maxBin]) maxBin = i;
    expect(Math.abs(maxBin - 100)).toBeLessThanOrEqual(10);
    // Envelope variance between adjacent bins should be lower than the input's
    // (the comb gets smoothed out).
    const v = (arr) => {
      let sum = 0;
      for (let i = 1; i < arr.length; i++) sum += Math.abs(arr[i] - arr[i - 1]);
      return sum / (arr.length - 1);
    };
    expect(v(env)).toBeLessThan(v(raw));
  });
});

describe('extractFormantsFromSpectrum', () => {
  /**
   * מחקה ספקטרום קול חי: גריד הרמוני בגובה F0, שמועצם עפ"י מעטפת של
   * שלושה פורמנטים F1/F2/F3. זה הקלט שהאלגוריתם אמור להתמודד איתו בפועל.
   */
  function synthVoiceSpectrum(F0, F1, F2, F3 = 2900, binHz = 12, length = 2048) {
    const spectrum = new Float32Array(length).fill(-100);
    const envelopeDb = (freq) => {
      const bw = 110;
      const peak1 = 30 * Math.exp(-((freq - F1) ** 2) / (2 * bw * bw));
      const peak2 = 28 * Math.exp(-((freq - F2) ** 2) / (2 * (bw + 10) ** 2));
      const peak3 = 18 * Math.exp(-((freq - F3) ** 2) / (2 * (bw + 30) ** 2));
      // נפילה גבוהה-תדר של -6dB לאוקטבה, כמו בדיבור אמיתי
      const rolloff = -6 * Math.log2(Math.max(freq, 100) / 100);
      return -30 + peak1 + peak2 + peak3 + rolloff;
    };
    // מוסיפים הרמוניות (H × F0) עם גובה שמוכתב על ידי המעטפת.
    // כל הרמוניה מתבטאת ב-3-4 bins סמוכים כדי להתקרב לרזולוציית FFT אמיתית.
    const nyquist = length * binHz;
    for (let h = 1; h * F0 < nyquist; h++) {
      const freq = h * F0;
      const bin = Math.round(freq / binHz);
      if (bin < 0 || bin >= length) continue;
      const height = envelopeDb(freq);
      for (let i = Math.max(0, bin - 2); i <= Math.min(length - 1, bin + 2); i++) {
        const d = i - bin;
        const local = height - 4 * d * d;
        if (local > spectrum[i]) spectrum[i] = local;
      }
    }
    return spectrum;
  }

  it('returns zeros for invalid inputs', () => {
    expect(extractFormantsFromSpectrum(null, 10)).toEqual({ F1: 0, F2: 0 });
    expect(extractFormantsFromSpectrum(new Float32Array(0), 10)).toEqual({ F1: 0, F2: 0 });
    expect(extractFormantsFromSpectrum(new Float32Array(100), 0)).toEqual({ F1: 0, F2: 0 });
  });

  it('classifies simulated adult /a/ (F0=150, F1=800, F2=1250)', () => {
    const binHz = 12;
    const spectrum = synthVoiceSpectrum(150, 800, 1250, 2440, binHz);
    const { F1, F2 } = extractFormantsFromSpectrum(spectrum, binHz);
    expect(classifyFormants(F1, F2).vowel).toBe('a');
  });

  it('classifies simulated child /a/ (F0=300, F1=1000, F2=1500)', () => {
    const binHz = 12;
    const spectrum = synthVoiceSpectrum(300, 1000, 1500, 3100, binHz);
    const { F1, F2 } = extractFormantsFromSpectrum(spectrum, binHz);
    expect(classifyFormants(F1, F2).vowel).toBe('a');
  });

  it('classifies simulated adult /i/', () => {
    const binHz = 12;
    const spectrum = synthVoiceSpectrum(180, 300, 2500, 3300, binHz);
    const { F1, F2 } = extractFormantsFromSpectrum(spectrum, binHz);
    expect(classifyFormants(F1, F2).vowel).toBe('i');
  });

  it('classifies simulated child /i/', () => {
    const binHz = 12;
    const spectrum = synthVoiceSpectrum(320, 400, 2900, 3700, binHz);
    const { F1, F2 } = extractFormantsFromSpectrum(spectrum, binHz);
    expect(classifyFormants(F1, F2).vowel).toBe('i');
  });

  it('classifies simulated /o/ with low F2', () => {
    const binHz = 12;
    const spectrum = synthVoiceSpectrum(160, 500, 900, 2500, binHz);
    const { F1, F2 } = extractFormantsFromSpectrum(spectrum, binHz);
    expect(classifyFormants(F1, F2).vowel).toBe('o');
  });

  it('classifies simulated /u/ below /o/ in F2', () => {
    const binHz = 12;
    const spectrum = synthVoiceSpectrum(180, 320, 800, 2400, binHz);
    const { F1, F2 } = extractFormantsFromSpectrum(spectrum, binHz);
    expect(classifyFormants(F1, F2).vowel).toBe('u');
  });

  it('classifies simulated /e/ between /a/ and /i/', () => {
    const binHz = 12;
    const spectrum = synthVoiceSpectrum(170, 550, 2100, 2700, binHz);
    const { F1, F2 } = extractFormantsFromSpectrum(spectrum, binHz);
    expect(classifyFormants(F1, F2).vowel).toBe('e');
  });

  it('is stable across reasonable F0 variation for /a/', () => {
    const binHz = 12;
    for (const F0 of [140, 180, 220]) {
      const spectrum = synthVoiceSpectrum(F0, 850, 1400, 2700, binHz);
      const { F1, F2 } = extractFormantsFromSpectrum(spectrum, binHz);
      expect(classifyFormants(F1, F2).vowel, `F0=${F0}`).toBe('a');
    }
  });
});
