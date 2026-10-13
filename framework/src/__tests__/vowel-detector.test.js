import { describe, it, expect, vi, afterEach } from 'vitest';
import { VOWEL_TEMPLATES, NIKUD_VOWEL } from '../data/vowels.js';
import {
  classifyFormants,
  cepstralEnvelope,
  extractFormantsFromSpectrum,
  matchNikudVowel,
  createVowelDetector,
} from '../../../games/nikud-speak/vowel-detector.js';

afterEach(() => { vi.unstubAllGlobals(); });

describe('createVowelDetector cancellation', () => {
  it('cancels immediately during permission and stops a late microphone stream', async () => {
    let grant;
    vi.stubGlobal('navigator', { mediaDevices: { getUserMedia: () => new Promise(resolve => { grant = resolve; }) } });
    const audio = vi.fn(function () {});
    vi.stubGlobal('AudioContext', audio);
    const detector = createVowelDetector();
    const pending = detector.listen();
    await Promise.resolve();
    detector.cancel();
    expect(await pending).toMatchObject({ vowel: '' });
    const stop = vi.fn();
    grant({ getTracks: () => [{ stop }] });
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(stop).toHaveBeenCalledOnce();
    expect(audio).not.toHaveBeenCalled();
  });

  it('cancels recording without waiting for another animation frame', async () => {
    const stop = vi.fn(), close = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { mediaDevices: { getUserMedia: async () => ({ getTracks: () => [{ stop }] }) } });
    vi.stubGlobal('AudioContext', vi.fn(function () {
      return { close, sampleRate: 48000,
        createMediaStreamSource: () => ({ connect() {} }),
        createAnalyser: () => ({ frequencyBinCount: 2048 }),
      };
    }));
    const raf = vi.fn(() => 42), cancelFrame = vi.fn();
    vi.stubGlobal('requestAnimationFrame', raf);
    vi.stubGlobal('cancelAnimationFrame', cancelFrame);
    const detector = createVowelDetector();
    const pending = detector.listen();
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(raf).toHaveBeenCalled();
    detector.cancel();
    expect(await pending).toMatchObject({ vowel: '' });
    expect(stop).toHaveBeenCalledOnce();
    expect(close).toHaveBeenCalledOnce();
    expect(cancelFrame).toHaveBeenCalledWith(42);
  });
});

describe('classifyFormants', () => {
  it.each([[0, 0], [NaN, 1000], [-100, 500], [2000, 1000]])('returns an empty result for invalid F1=%s, F2=%s', (F1, F2) => {
    expect(classifyFormants(F1, F2)).toEqual({ vowel: '', confidence: 0 });
  });

  it('classifies each template exactly to itself', () => {
    for (const [vowel, t] of Object.entries(VOWEL_TEMPLATES)) {
      expect(classifyFormants(t.F1, t.F2).vowel, `expected ${vowel} for template ${JSON.stringify(t)}`).toBe(vowel);
    }
  });

  it.each([
    ['adult-male /a/', 730, 1090, 'a'],
    ['child /a/', 1000, 1500, 'a'],
    ['/o/, told from /u/ by F2', 550, 1000, 'o'],
    ['/u/, told from /o/ by F2', 400, 850, 'u'],
    ['/i/ with high F2', 300, 2500, 'i'],
    ['/i/ with higher F2', 400, 2800, 'i'],
  ])('classifies typical %s', (_, F1, F2, vowel) => {
    expect(classifyFormants(F1, F2).vowel).toBe(vowel);
  });
});

describe('matchNikudVowel', () => {
  it.each([
    // kamatz ו-patah הם זוג ה-/a/, tzere ו-segol זוג ה-/e/; וכל ניקוד מהטבלה עם התנועה שלו.
    ['a', 'kamatz', true], ['a', 'patah', true], ['e', 'tzere', true], ['e', 'segol', true],
    ...Object.entries(NIKUD_VOWEL).map(([nikudId, vowel]) => [vowel, nikudId, true]),
    ['i', 'kamatz', false], ['a', 'holam', false], ['', 'kamatz', false],
    ['a', '', false], ['x', 'kamatz', false], ['a', 'unknown-nikud', false],
  ])('matchNikudVowel(%j, %j) is %s', (vowel, nikudId, expected) => {
    expect(matchNikudVowel(vowel, nikudId)).toBe(expected);
  });
});

describe('cepstralEnvelope', () => {
  it('handles trivial input', () => {
    expect(cepstralEnvelope(new Float32Array(0), 10).length).toBe(0);
  });

  it('flattens harmonic structure, preserving broad envelope shape', () => {
    const N = 512;
    const raw = new Float32Array(N);
    // Envelope: smooth gaussian bump around bin 100, plus a harmonic comb of sharp spikes every 20 bins.
    const bump = (i) => 30 * Math.exp(-((i - 100) ** 2) / (2 * 40 * 40));
    for (let i = 0; i < N; i++) raw[i] = bump(i) + (i % 20 === 0 ? 25 : 0);
    const env = cepstralEnvelope(raw, 15);
    // The envelope peak should be near bin 100, not at the comb spikes.
    let maxBin = 0;
    for (let i = 10; i < N - 10; i++) if (env[i] > env[maxBin]) maxBin = i;
    expect(Math.abs(maxBin - 100)).toBeLessThanOrEqual(10);
    // Mean change between adjacent bins drops: the comb gets smoothed out.
    const roughness = (arr) => {
      let sum = 0;
      for (let i = 1; i < arr.length; i++) sum += Math.abs(arr[i] - arr[i - 1]);
      return sum / (arr.length - 1);
    };
    expect(roughness(env)).toBeLessThan(roughness(raw));
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

  it.each([
    ['adult /a/', 150, 800, 1250, 2440, 'a'],
    ['child /a/', 300, 1000, 1500, 3100, 'a'],
    ['adult /i/', 180, 300, 2500, 3300, 'i'],
    ['child /i/', 320, 400, 2900, 3700, 'i'],
    ['/o/ with low F2', 160, 500, 900, 2500, 'o'],
    ['/u/ below /o/ in F2', 180, 320, 800, 2400, 'u'],
    ['/e/ between /a/ and /i/', 170, 550, 2100, 2700, 'e'],
    // יציב לשינויי F0 סבירים
    ['/a/ at low F0', 140, 850, 1400, 2700, 'a'],
    ['/a/ at mid F0', 180, 850, 1400, 2700, 'a'],
    ['/a/ at high F0', 220, 850, 1400, 2700, 'a'],
  ])('classifies simulated %s (F0=%i, F1=%i, F2=%i)', (_, F0, F1, F2, F3, vowel) => {
    const formants = extractFormantsFromSpectrum(synthVoiceSpectrum(F0, F1, F2, F3), 12);
    expect(classifyFormants(formants.F1, formants.F2).vowel).toBe(vowel);
  });
});
