/**
 * זיהוי תנועות עבריות (a/e/i/o/u) מקלט מיקרופון באמצעות ניתוח פורמנטים
 * רץ אופליין לחלוטין - Web Audio API בלבד, ללא שירות חיצוני.
 *
 * הרעיון: לכל תנועה יש חתימה אופיינית של שני הפורמנטים הראשונים
 * (F1 - גובה הלשון, F2 - קדמיות/אחוריות). מחלצים אותם מהספקטרום,
 * משווים במישור לוג-תדרי לתבניות ידועות, ומחזירים את התנועה הקרובה ביותר.
 *
 * חילוץ הפורמנטים משתמש ב-Cepstral Liftering: DCT של הספקטרום בלוג,
 * חיתוך המקדמים הגבוהים (שמייצגים את הגריד ההרמוני של הטון F0),
 * ו-IDCT שמחזירה מעטפת חלקה שהפסגות שלה הן פורמנטים אמיתיים -
 * לא ההרמוניות של הקול. זו הגישה הסטנדרטית; חיפוש פסגות ישיר על
 * ה-FFT היה מחזיר כפולות של F0 במקום פורמנטים, ולכן נכשל על קול חי.
 *
 * API ציבורי:
 *   createVowelDetector() - יוצר listener שמקליט לכמה שניות ומחזיר תנועה.
 *   matchNikudVowel(vowel, nikudId) - בודק אם התנועה תואמת לניקוד.
 *   classifyFormants(F1, F2) - סיווג טהור (ללא אודיו) - חשוף לשם בדיקות.
 *   extractFormantsFromSpectrum(spectrum, binHz) - חילוץ פסגות מספקטרום.
 *   cepstralEnvelope(logSpectrum, cutoff) - מעטפת ספקטרלית בלבד, לבדיקות.
 */

/**
 * תבניות פורמנטים לתנועות עבריות. מחושבות כממוצע בין ערכי מבוגר לילד
 * (F1/F2 של ילד גבוהים ב-20-30% מאלו של מבוגר) כדי לעבוד על טווח רחב.
 * הסיווג עובד במרחק לוג-תדרי ולכן גמיש מול הפרשי פיץ' מתונים.
 * @type {Record<'a'|'e'|'i'|'o'|'u', {F1: number, F2: number}>}
 */
export const VOWEL_TEMPLATES = {
  a: { F1: 850, F2: 1400 },
  e: { F1: 550, F2: 2100 },
  i: { F1: 350, F2: 2700 },
  o: { F1: 550, F2: 1000 },
  u: { F1: 350, F2: 850 },
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
 * מעטפת ספקטרלית על ידי DCT + liftering + IDCT. החיתוך במקדם cutoff מסנן
 * את הגריד ההרמוני (רעש מהיר בתדרים גבוהים של ה-cepstrum) ומשאיר את
 * המעטפת ההדרגתית שמייצגת את מסלול הקול.
 *
 * @param {ArrayLike<number>} logSpectrum - ספקטרום בלוג (dB יעבוד)
 * @param {number} cutoff - כמה מקדמי cepstrum לשמור (15-40 טיפוסי)
 * @returns {Float32Array}
 */
export function cepstralEnvelope(logSpectrum, cutoff) {
  const N = logSpectrum.length;
  const L = Math.max(1, Math.min(cutoff, N));
  const cepstrum = new Float32Array(L);
  // DCT-II, מחושב רק עבור L המקדמים הראשונים שאותם נשמור.
  for (let k = 0; k < L; k++) {
    let sum = 0;
    const factor = Math.PI * k / N;
    for (let n = 0; n < N; n++) {
      sum += logSpectrum[n] * Math.cos(factor * (n + 0.5));
    }
    cepstrum[k] = sum;
  }
  // IDCT מוגבל ל-L המקדמים בלבד - זה שקול לאיפוס כל המקדמים מעל L
  // לפני ההיפוך, כלומר ל-low-pass lifter.
  const out = new Float32Array(N);
  const scale = 2 / N;
  for (let n = 0; n < N; n++) {
    let sum = cepstrum[0] * 0.5;
    for (let k = 1; k < L; k++) {
      sum += cepstrum[k] * Math.cos(Math.PI * k * (n + 0.5) / N);
    }
    out[n] = scale * sum;
  }
  return out;
}

/**
 * מחלץ את שני הפורמנטים המובילים מספקטרום תדר דרך מעטפת cepstral.
 * הבחירה לפי חוזק הפסגה בטווחי תדר פונטיים סטנדרטיים:
 * F1 ב-200-1100Hz (טווח רחב לכלול ילדים עם /a/ גבוה),
 * F2 ב-max(F1+250, 700) עד 3500Hz. בחירה לפי חוזק כדי לא להיתפס
 * לגבשושיות משניות כגון הדלף בתדרים נמוכים.
 *
 * @param {ArrayLike<number>} spectrum - ערכי ספקטרום בלוג (ב-dB או דומה)
 * @param {number} binHz - כמה הרץ מיצג כל bin
 * @returns {{F1: number, F2: number}}
 */
export function extractFormantsFromSpectrum(spectrum, binHz) {
  if (!spectrum || spectrum.length === 0 || !Number.isFinite(binHz) || binHz <= 0) {
    return { F1: 0, F2: 0 };
  }
  const envelope = cepstralEnvelope(spectrum, 80);
  const maxSearchBin = Math.min(envelope.length - 3, Math.floor(3500 / binHz));
  const peaks = [];
  for (let i = 3; i <= maxSearchBin; i++) {
    const v = envelope[i];
    if (v > envelope[i - 1] && v > envelope[i - 2] && v > envelope[i + 1] && v > envelope[i + 2]) {
      peaks.push({ freq: i * binHz, mag: v });
    }
  }
  if (peaks.length === 0) return { F1: 0, F2: 0 };

  const f1Candidates = peaks.filter(p => p.freq >= 200 && p.freq <= 1100);
  if (f1Candidates.length === 0) return { F1: 0, F2: 0 };
  f1Candidates.sort((a, b) => b.mag - a.mag);
  const F1 = f1Candidates[0].freq;

  const f2Low = Math.max(F1 + 250, 700);
  const f2Candidates = peaks.filter(p => p.freq >= f2Low && p.freq <= 3500);
  if (f2Candidates.length === 0) return { F1, F2: 0 };
  f2Candidates.sort((a, b) => b.mag - a.mag);
  return { F1, F2: f2Candidates[0].freq };
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
