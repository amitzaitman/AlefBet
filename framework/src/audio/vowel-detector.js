/**
 * זיהוי תנועות עבריות (a/e/i/o/u) מקלט מיקרופון באמצעות ניתוח פורמנטים
 * רץ אופליין לחלוטין - Web Audio API בלבד, ללא שירות חיצוני.
 *
 * הרעיון: לכל תנועה יש חתימה אופיינית של שני הפורמנטים הראשונים
 * (F1 - גובה הלשון, F2 - קדמיות/אחוריות). מחלצים אותם מהספקטרום,
 * משווים במישור לוג-תדרי לתבניות ידועות, ומחזירים את התנועה הקרובה ביותר.
 *
 * API ציבורי:
 *   createVowelDetector() - יוצר listener שמקליט לכמה שניות ומחזיר תנועה.
 *   matchNikudVowel(vowel, nikudId) - בודק אם התנועה תואמת לניקוד.
 *   classifyFormants(F1, F2) - סיווג טהור (ללא אודיו) - חשוף לשם בדיקות.
 *   extractFormantsFromSpectrum(spectrum, binHz) - חילוץ פסגות מספקטרום - גם לטסטים.
 */

/**
 * תבניות פורמנטים לתנועות עבריות. הערכים הם ממוצעים גסים עבור ילדים בגיל 3-8,
 * שבהם מסלול הקול קצר והפורמנטים גבוהים ב-20-30% מהמבוגרים.
 * @type {Record<'a'|'e'|'i'|'o'|'u', {F1: number, F2: number}>}
 */
export const VOWEL_TEMPLATES = {
  a: { F1: 950, F2: 1500 },
  e: { F1: 600, F2: 2300 },
  i: { F1: 400, F2: 2900 },
  o: { F1: 600, F2: 1050 },
  u: { F1: 400, F2: 900 },
};

/**
 * מיפוי מזהה ניקוד לתנועה פונטית.
 * שימו לב: קמץ/פתח וצירה/סגול נשמעים זהה, ולכן משויכים לאותה תנועה.
 * @type {Record<string, 'a'|'e'|'i'|'o'|'u'>}
 */
export const NIKUD_VOWEL = {
  kamatz: 'a', patah: 'a',
  tzere: 'e', segol: 'e',
  hiriq: 'i',
  holam: 'o',
  kubbutz: 'u',
};

/**
 * סיווג זוג פורמנטים לתנועה. משתמש במרחק אוקלידי במישור לוג-תדרי
 * (log2 Hz) כדי שקרבה תשקף יחס תפיסתי ולא הפרש ליניארי.
 *
 * @param {number} F1 - הפורמנט הראשון ב-Hz
 * @param {number} F2 - הפורמנט השני ב-Hz
 * @returns {{vowel: string, confidence: number}}
 *   vowel ריק אם הקלט לא תקין. confidence הוא 1 - (dBest / dSecond), בין 0 ל-1.
 */
export function classifyFormants(F1, F2) {
  if (!Number.isFinite(F1) || !Number.isFinite(F2) || F1 <= 0 || F2 <= 0 || F2 <= F1) {
    return { vowel: '', confidence: 0 };
  }
  const logF1 = Math.log2(F1);
  const logF2 = Math.log2(F2);
  const distances = [];
  for (const [vowel, t] of Object.entries(VOWEL_TEMPLATES)) {
    const dF1 = logF1 - Math.log2(t.F1);
    const dF2 = logF2 - Math.log2(t.F2);
    distances.push({ vowel, dist: Math.sqrt(dF1 * dF1 + dF2 * dF2) });
  }
  distances.sort((a, b) => a.dist - b.dist);
  const best = distances[0];
  const second = distances[1];
  const confidence = second.dist === 0 ? 1 : Math.max(0, Math.min(1, 1 - best.dist / second.dist));
  return { vowel: best.vowel, confidence };
}

/**
 * בודק אם התנועה שזוהתה תואמת לניקוד המבוקש.
 * @param {string} vowel - 'a'|'e'|'i'|'o'|'u'
 * @param {string} nikudId - מזהה ניקוד מתוך nikudList
 * @returns {boolean}
 */
export function matchNikudVowel(vowel, nikudId) {
  if (!vowel || !nikudId) return false;
  return NIKUD_VOWEL[nikudId] === vowel;
}

/**
 * ממוצע נע על ספקטרום כדי להחליק רעש לפני חיפוש פסגות.
 * @param {ArrayLike<number>} spectrum
 * @param {number} window - חצי-חלון משני הצדדים (סה"כ 2*window+1 נקודות)
 * @returns {Float32Array}
 */
function smoothSpectrum(spectrum, window) {
  const n = spectrum.length;
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    let sum = 0;
    let count = 0;
    const from = Math.max(0, i - window);
    const to = Math.min(n - 1, i + window);
    for (let j = from; j <= to; j++) { sum += spectrum[j]; count++; }
    out[i] = sum / count;
  }
  return out;
}

/**
 * מחלץ את שני הפורמנטים המובילים מספקטרום תדר.
 * אסטרטגיה: החלקה קלה, חיפוש מקסימה מקומיים ברצועה 200-3500Hz,
 * בחירת ארבע הפסגות החזקות ביותר, ואז שתי התדירויות הנמוכות מביניהן
 * כ-F1 ו-F2. דרישה: F2 - F1 >= 200Hz כדי לא לקחת פסגה כפולה.
 *
 * @param {ArrayLike<number>} spectrum - ערכי ספקטרום ב-dB (או יחידה עקבית אחרת)
 * @param {number} binHz - כמה הרץ מיצג כל bin
 * @returns {{F1: number, F2: number}} - מחזיר אפס אם לא נמצאו פסגות מספקות
 */
export function extractFormantsFromSpectrum(spectrum, binHz) {
  if (!spectrum || spectrum.length === 0 || !Number.isFinite(binHz) || binHz <= 0) {
    return { F1: 0, F2: 0 };
  }
  const smooth = smoothSpectrum(spectrum, 3);
  const minBin = Math.max(2, Math.floor(200 / binHz));
  const maxBin = Math.min(smooth.length - 3, Math.floor(3500 / binHz));
  const peaks = [];
  for (let i = minBin; i <= maxBin; i++) {
    const v = smooth[i];
    if (v > smooth[i - 1] && v > smooth[i - 2] && v > smooth[i + 1] && v > smooth[i + 2]) {
      peaks.push({ bin: i, mag: v });
    }
  }
  if (peaks.length === 0) return { F1: 0, F2: 0 };
  peaks.sort((a, b) => b.mag - a.mag);
  const candidates = peaks.slice(0, 4).sort((a, b) => a.bin - b.bin);
  if (candidates.length < 2) return { F1: candidates[0].bin * binHz, F2: 0 };

  const F1 = candidates[0].bin * binHz;
  const minGap = 200 / binHz;
  let f2Candidate = candidates[1];
  for (const c of candidates.slice(1)) {
    if (c.bin - candidates[0].bin >= minGap) { f2Candidate = c; break; }
  }
  return { F1, F2: f2Candidate.bin * binHz };
}

/**
 * יוצר מאזין מיקרופון מבוסס פורמנטים. ממשק תואם בצורתו ל-createSpeechListener הישן
 * (listen/cancel/available) כדי לאפשר החלפה קלה.
 *
 * @returns {{
 *   available: boolean,
 *   listen: (timeoutMs?: number) => Promise<{vowel: string, confidence: number, F1: number, F2: number}>,
 *   cancel: () => void,
 * }}
 */
export function createVowelDetector() {
  const hasWindow = typeof window !== 'undefined';
  const hasGUM = hasWindow && !!navigator?.mediaDevices?.getUserMedia;
  const AudioCtx = hasWindow ? (window.AudioContext || window.webkitAudioContext) : null;
  const available = hasGUM && !!AudioCtx;

  let currentStream = null;
  let currentCtx = null;
  let cancelled = false;

  const empty = () => ({ vowel: '', confidence: 0, F1: 0, F2: 0 });

  const cleanup = () => {
    if (currentStream) {
      for (const t of currentStream.getTracks()) { try { t.stop(); } catch { /* ignore */ } }
    }
    if (currentCtx) { try { currentCtx.close(); } catch { /* ignore */ } }
    currentStream = null;
    currentCtx = null;
  };

  return {
    available,

    async listen(timeoutMs = 3000) {
      if (!available) return empty();
      cancelled = false;

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch {
        return empty();
      }
      currentStream = stream;

      const ctx = new AudioCtx();
      currentCtx = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 4096;
      analyser.smoothingTimeConstant = 0.2;
      source.connect(analyser);

      const binHz = ctx.sampleRate / analyser.fftSize;
      const spectrum = new Float32Array(analyser.frequencyBinCount);
      const timeDomain = new Float32Array(analyser.fftSize);
      const VOICE_RMS_THRESHOLD = 0.015;
      const samples = [];
      const start = performance.now();

      return new Promise((resolve) => {
        const finish = () => {
          cleanup();
          if (samples.length < 3) { resolve(empty()); return; }
          const f1s = samples.map(s => s.F1).sort((a, b) => a - b);
          const f2s = samples.map(s => s.F2).sort((a, b) => a - b);
          const mid = Math.floor(samples.length / 2);
          const F1 = f1s[mid];
          const F2 = f2s[mid];
          const classified = classifyFormants(F1, F2);
          resolve({ ...classified, F1, F2 });
        };

        const tick = () => {
          if (cancelled) { cleanup(); resolve(empty()); return; }
          if (performance.now() - start > timeoutMs) { finish(); return; }

          analyser.getFloatTimeDomainData(timeDomain);
          let sumSq = 0;
          for (let i = 0; i < timeDomain.length; i++) sumSq += timeDomain[i] * timeDomain[i];
          const rms = Math.sqrt(sumSq / timeDomain.length);

          if (rms > VOICE_RMS_THRESHOLD) {
            analyser.getFloatFrequencyData(spectrum);
            const { F1, F2 } = extractFormantsFromSpectrum(spectrum, binHz);
            if (F1 > 0 && F2 > 0 && F2 > F1) samples.push({ F1, F2 });
          }
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    },

    cancel() {
      cancelled = true;
      cleanup();
    },
  };
}
