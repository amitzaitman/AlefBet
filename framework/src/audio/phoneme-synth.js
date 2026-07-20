/**
 * סינתזת פונמות עבריות אופליין - Web Audio API בלבד, ללא רשת וללא קבצים.
 *
 * ההיפוך של vowel-detector: במקום לחלץ פורמנטים מקול חי, בונים קול
 * ממקור גלוטלי (sawtooth בתדר יסוד) המסונן דרך שלושה מסנני bandpass
 * בתדרי הפורמנטים של התנועה (source-filter model). עיצורים ממומשים
 * כ-onset קצר לפני התנועה: פרץ רעש לפוצצים, רעש מסונן לחוככים,
 * זמזום נמוך לאפיים, ו-glide פורמנטי לחצאי-תנועות.
 *
 * זהו מנגנון הגיבוי האחרון בשרשרת השמע (ראו hebrew-audio.js): איכותו
 * "רובוטית" אך ברורה, והוא זמין תמיד - גם בלי רשת, בלי קולות מערכת
 * ובלי הקלטות מורה.
 *
 * API ציבורי:
 *   isSynthSupported() - האם Web Audio זמין.
 *   vowelFormantSpec(vowel) - מפרט פורמנטים לתנועה (טהור, לבדיקות).
 *   consonantOnsetSpec(sound) - מפרט onset לעיצור (טהור, לבדיקות).
 *   synthesizeVowel(vowel, opts) - השמעת תנועה a/e/i/o/u.
 *   synthesizeSyllable(consonantSound, vowel, opts) - השמעת הברה עיצור+תנועה.
 */
import { VOWEL_TEMPLATES } from './vowel-detector.js';

/** תדר יסוד ברירת מחדל (Hz) - קול נשי/ילדי נעים. */
const DEFAULT_PITCH_HZ = 210;

/** משך תנועה ברירת מחדל (מילישניות). */
const DEFAULT_VOWEL_MS = 550;

/**
 * פורמנט שלישי ורוחבי סרט לכל תנועה. F1/F2 מגיעים מ-VOWEL_TEMPLATES
 * (אותן תבניות שהגלאי משתמש בהן) כדי שהסינתזה והזיהוי יהיו עקביים.
 * @type {Record<'a'|'e'|'i'|'o'|'u', { F3: number, bandwidths: [number, number, number], gains: [number, number, number] }>}
 */
const VOWEL_EXTRAS = {
  a: { F3: 2700, bandwidths: [90, 110, 170], gains: [1.0, 0.5, 0.15] },
  e: { F3: 2900, bandwidths: [80, 100, 160], gains: [1.0, 0.55, 0.2] },
  i: { F3: 3300, bandwidths: [60, 100, 160], gains: [1.0, 0.6, 0.25] },
  o: { F3: 2600, bandwidths: [80, 90, 150],  gains: [1.0, 0.5, 0.1] },
  u: { F3: 2400, bandwidths: [60, 80, 140],  gains: [1.0, 0.45, 0.1] },
};

/**
 * מפרט פורמנטים מלא לתנועה: תדרים, רוחבי סרט ועוצמות יחסיות.
 * פונקציה טהורה - ניתנת לבדיקה ללא AudioContext.
 * @param {string} vowel - 'a'|'e'|'i'|'o'|'u'
 * @returns {{ formants: number[], bandwidths: number[], gains: number[] } | null}
 */
export function vowelFormantSpec(vowel) {
  const base = VOWEL_TEMPLATES[vowel];
  const extras = VOWEL_EXTRAS[vowel];
  if (!base || !extras) return null;
  return {
    formants: [base.F1, base.F2, extras.F3],
    bandwidths: [...extras.bandwidths],
    gains: [...extras.gains],
  };
}

/**
 * מפרטי onset לעיצורים לפי מחרוזת ה-sound מ-hebrew-letters
 * ('b', 'sh', 'ts' וכו'). סוגי onset:
 * - plosive: פרץ רעש קצר (עם/בלי קול) ואז התנועה.
 * - fricative: רעש מסונן ממושך יותר לפני התנועה.
 * - affricate: סגר + חיכוך (צ).
 * - nasal: זמזום נמוך מונשם דרך האף (מ, נ).
 * - liquid: מעבר קולי רציף (ל, ר).
 * - glide: תנועת-עזר קצרה שגולשת אל התנועה (י, ו).
 * - none: אין עיצור (א, ע, ה חלשה) - התנועה מתחילה ישר.
 * @type {Record<string, { type: string, voiced: boolean, noiseHz?: number, noiseQ?: number, durationMs: number }>}
 */
const CONSONANT_ONSETS = {
  '':   { type: 'none',      voiced: true,  durationMs: 0 },
  'b':  { type: 'plosive',   voiced: true,  noiseHz: 500,  noiseQ: 1.2, durationMs: 25 },
  'g':  { type: 'plosive',   voiced: true,  noiseHz: 1800, noiseQ: 1.5, durationMs: 30 },
  'd':  { type: 'plosive',   voiced: true,  noiseHz: 3000, noiseQ: 1.5, durationMs: 25 },
  'h':  { type: 'fricative', voiced: false, noiseHz: 1200, noiseQ: 0.4, durationMs: 90 },
  'v':  { type: 'fricative', voiced: true,  noiseHz: 900,  noiseQ: 0.8, durationMs: 90 },
  'z':  { type: 'fricative', voiced: true,  noiseHz: 5200, noiseQ: 2.5, durationMs: 110 },
  'ch': { type: 'fricative', voiced: false, noiseHz: 1500, noiseQ: 0.6, durationMs: 130 },
  't':  { type: 'plosive',   voiced: false, noiseHz: 3500, noiseQ: 1.5, durationMs: 30 },
  'y':  { type: 'glide',     voiced: true,  durationMs: 90 },
  'k':  { type: 'plosive',   voiced: false, noiseHz: 1600, noiseQ: 1.5, durationMs: 35 },
  'l':  { type: 'liquid',    voiced: true,  durationMs: 80 },
  'm':  { type: 'nasal',     voiced: true,  durationMs: 110 },
  'n':  { type: 'nasal',     voiced: true,  durationMs: 100 },
  's':  { type: 'fricative', voiced: false, noiseHz: 5800, noiseQ: 2.5, durationMs: 130 },
  'p':  { type: 'plosive',   voiced: false, noiseHz: 700,  noiseQ: 1.2, durationMs: 25 },
  'ts': { type: 'affricate', voiced: false, noiseHz: 5200, noiseQ: 2.5, durationMs: 140 },
  'r':  { type: 'liquid',    voiced: true,  durationMs: 80 },
  'sh': { type: 'fricative', voiced: false, noiseHz: 3000, noiseQ: 1.8, durationMs: 140 },
};

/**
 * מחזיר את מפרט ה-onset לעיצור. פונקציה טהורה - לבדיקות ולסינתזה.
 * עיצור לא מוכר מקבל את מפרט ה'none' (התנועה בלבד) כדי שההברה
 * תישמע תמיד ולא תיזרק שגיאה.
 * @param {string} sound - מחרוזת sound מ-hebrew-letters (למשל 'b', 'sh', '')
 * @returns {{ type: string, voiced: boolean, noiseHz?: number, noiseQ?: number, durationMs: number }}
 */
export function consonantOnsetSpec(sound) {
  return CONSONANT_ONSETS[sound] ?? CONSONANT_ONSETS[''];
}

// ── AudioContext משותף ─────────────────────────────────────────────────────

/** @type {AudioContext | null} */
let _ctx = null;

function _getCtx() {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext || /** @type {any} */ (window).webkitAudioContext;
  if (!Ctor) return null;
  if (!_ctx) {
    try { _ctx = new Ctor(); } catch { return null; }
  }
  if (_ctx.state === 'suspended') {
    try { _ctx.resume(); } catch { /* noop */ }
  }
  return _ctx;
}

/**
 * האם סינתזת פונמות זמינה בסביבה הנוכחית.
 * @returns {boolean}
 */
export function isSynthSupported() {
  return typeof window !== 'undefined' &&
    !!(window.AudioContext || /** @type {any} */ (window).webkitAudioContext);
}

/** באפר רעש לבן ממוחזר (שנייה אחת). */
let _noiseBuffer = null;

/**
 * @param {AudioContext} ctx
 * @returns {AudioBuffer}
 */
function _getNoiseBuffer(ctx) {
  if (_noiseBuffer && _noiseBuffer.sampleRate === ctx.sampleRate) return _noiseBuffer;
  const length = ctx.sampleRate;
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  _noiseBuffer = buffer;
  return buffer;
}

/**
 * בונה שרשרת מקור-גלוטלי -> מסנני פורמנטים -> gain ראשי, ומחזיר את
 * הצמתים כדי שהקורא יוכל לתזמן מעטפות ו-glides.
 * @param {AudioContext} ctx
 * @param {{ formants: number[], bandwidths: number[], gains: number[] }} spec
 * @param {number} pitchHz
 * @returns {{ source: OscillatorNode, filters: BiquadFilterNode[], master: GainNode }}
 */
function _buildVoicedChain(ctx, spec, pitchHz) {
  const source = ctx.createOscillator();
  source.type = 'sawtooth';
  source.frequency.value = pitchHz;

  const master = ctx.createGain();
  master.gain.value = 0;

  const filters = spec.formants.map((freq, i) => {
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = freq;
    filter.Q.value = freq / spec.bandwidths[i];
    const formantGain = ctx.createGain();
    formantGain.gain.value = spec.gains[i];
    source.connect(filter);
    filter.connect(formantGain);
    formantGain.connect(master);
    return filter;
  });

  master.connect(ctx.destination);
  return { source, filters, master };
}

/**
 * מתזמן פרץ/משך רעש מסונן. מחזיר את זמן הסיום.
 * @param {AudioContext} ctx
 * @param {number} startTime
 * @param {{ noiseHz?: number, noiseQ?: number, durationMs: number }} spec
 * @param {number} peakGain
 * @returns {number} זמן סיום הרעש (שניות, בציר הזמן של ה-context)
 */
function _scheduleNoise(ctx, startTime, spec, peakGain) {
  const duration = spec.durationMs / 1000;
  const noise = ctx.createBufferSource();
  noise.buffer = _getNoiseBuffer(ctx);
  noise.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = spec.noiseHz ?? 2000;
  filter.Q.value = spec.noiseQ ?? 1;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(peakGain, startTime + Math.min(0.01, duration / 3));
  gain.gain.linearRampToValueAtTime(0.0001, startTime + duration);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start(startTime);
  noise.stop(startTime + duration + 0.02);
  return startTime + duration;
}

/**
 * מתזמן תנועה קולית: מעטפת עלייה-החזקה-דעיכה + ויברטו קל של תדר היסוד,
 * ואופציונלית glide של הפורמנטים מנקודת התחלה (לחצאי-תנועות ולנוזלים).
 * @param {AudioContext} ctx
 * @param {number} startTime
 * @param {{ formants: number[], bandwidths: number[], gains: number[] }} spec
 * @param {number} durationMs
 * @param {number} pitchHz
 * @param {number[] | null} glideFromFormants - תדרי פורמנטים התחלתיים או null
 * @returns {number} זמן הסיום
 */
function _scheduleVowel(ctx, startTime, spec, durationMs, pitchHz, glideFromFormants) {
  const duration = durationMs / 1000;
  const { source, filters, master } = _buildVoicedChain(ctx, spec, pitchHz);

  // אינטונציה טבעית: ירידה קלה של תדר היסוד לאורך התנועה.
  source.frequency.setValueAtTime(pitchHz * 1.04, startTime);
  source.frequency.linearRampToValueAtTime(pitchHz * 0.92, startTime + duration);

  if (glideFromFormants) {
    const glideDuration = Math.min(0.09, duration / 3);
    filters.forEach((filter, i) => {
      const from = glideFromFormants[i];
      if (!from) return;
      filter.frequency.setValueAtTime(from, startTime);
      filter.frequency.exponentialRampToValueAtTime(spec.formants[i], startTime + glideDuration);
    });
  }

  const attack = 0.04;
  const release = 0.12;
  master.gain.setValueAtTime(0, startTime);
  master.gain.linearRampToValueAtTime(0.5, startTime + attack);
  master.gain.setValueAtTime(0.5, startTime + duration - release);
  master.gain.linearRampToValueAtTime(0.0001, startTime + duration);

  source.start(startTime);
  source.stop(startTime + duration + 0.05);
  return startTime + duration;
}

/**
 * מתזמן זמזום אפי (מ/נ): טון בתדר היסוד + פורמנט אפי נמוך (~250Hz).
 * @param {AudioContext} ctx
 * @param {number} startTime
 * @param {number} durationMs
 * @param {number} pitchHz
 * @returns {number} זמן הסיום
 */
function _scheduleNasal(ctx, startTime, durationMs, pitchHz) {
  const duration = durationMs / 1000;
  const spec = { formants: [250, 1100, 2200], bandwidths: [80, 200, 300], gains: [1.0, 0.12, 0.05] };
  const { source, master } = _buildVoicedChain(ctx, spec, pitchHz);
  master.gain.setValueAtTime(0, startTime);
  master.gain.linearRampToValueAtTime(0.35, startTime + 0.02);
  master.gain.setValueAtTime(0.35, startTime + duration - 0.02);
  master.gain.linearRampToValueAtTime(0.0001, startTime + duration);
  source.start(startTime);
  source.stop(startTime + duration + 0.05);
  return startTime + duration;
}

/**
 * ממתין (Promise) עד שזמן ה-context חולף את endTime.
 * @param {AudioContext} ctx
 * @param {number} endTime
 * @returns {Promise<void>}
 */
function _waitUntil(ctx, endTime) {
  const ms = Math.max(0, (endTime - ctx.currentTime) * 1000) + 60;
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * השמעת תנועה בודדת (a/e/i/o/u). נפתר בסיום ההשמעה.
 * נפתר מיד (ללא שגיאה) אם אין תמיכת אודיו או שהתנועה לא מוכרת -
 * בהתאם לעקרון "הבטחות שמע לעולם לא תוקעות משחק".
 * @param {string} vowel - 'a'|'e'|'i'|'o'|'u'
 * @param {{ durationMs?: number, pitchHz?: number }} [opts]
 * @returns {Promise<boolean>} true אם הושמע בפועל
 */
export async function synthesizeVowel(vowel, opts = {}) {
  const spec = vowelFormantSpec(vowel);
  const ctx = _getCtx();
  if (!spec || !ctx) return false;
  let end;
  try {
    const start = ctx.currentTime + 0.03;
    end = _scheduleVowel(ctx, start, spec, opts.durationMs ?? DEFAULT_VOWEL_MS, opts.pitchHz ?? DEFAULT_PITCH_HZ, null);
  } catch {
    return false; // סביבת אודיו חלקית - נכשלים ברכות, לא מפילים משחק
  }
  await _waitUntil(ctx, end);
  return true;
}

/**
 * השמעת הברה עיצור+תנועה, למשל ('b', 'a') -> "בָּה".
 * העיצור מזוהה לפי מחרוזת ה-sound של hebrew-letters.
 * @param {string} consonantSound - למשל 'b', 'sh', 'ts', '' (אין עיצור)
 * @param {string} vowel - 'a'|'e'|'i'|'o'|'u'
 * @param {{ durationMs?: number, pitchHz?: number }} [opts]
 * @returns {Promise<boolean>} true אם הושמע בפועל
 */
export async function synthesizeSyllable(consonantSound, vowel, opts = {}) {
  const spec = vowelFormantSpec(vowel);
  const ctx = _getCtx();
  if (!spec || !ctx) return false;

  const onset = consonantOnsetSpec(consonantSound);
  const pitchHz = opts.pitchHz ?? DEFAULT_PITCH_HZ;
  const vowelMs = opts.durationMs ?? DEFAULT_VOWEL_MS;
  let end;
  try {
    end = _scheduleSyllable(ctx, onset, consonantSound, spec, vowelMs, pitchHz);
  } catch {
    return false; // סביבת אודיו חלקית - נכשלים ברכות, לא מפילים משחק
  }
  await _waitUntil(ctx, end);
  return true;
}

/**
 * תזמון ההברה בפועל (עיצור + תנועה). מופרד כדי ש-synthesizeSyllable
 * יוכל לעטוף את כל התזמון ב-try/catch אחד.
 * @param {AudioContext} ctx
 * @param {ReturnType<typeof consonantOnsetSpec>} onset
 * @param {string} consonantSound
 * @param {NonNullable<ReturnType<typeof vowelFormantSpec>>} spec
 * @param {number} vowelMs
 * @param {number} pitchHz
 * @returns {number} זמן הסיום
 */
function _scheduleSyllable(ctx, onset, consonantSound, spec, vowelMs, pitchHz) {
  let t = ctx.currentTime + 0.03;
  /** @type {number[] | null} */
  let glideFrom = null;

  switch (onset.type) {
    case 'plosive': {
      t = _scheduleNoise(ctx, t, onset, onset.voiced ? 0.25 : 0.35);
      t += 0.01; // הפסקה זעירה בין הפרץ לתנועה
      break;
    }
    case 'fricative': {
      t = _scheduleNoise(ctx, t, onset, 0.22) - 0.03; // חפיפה קלה עם התנועה
      break;
    }
    case 'affricate': {
      // סגר שקט קצרצר ואז חיכוך - "צ".
      t += 0.03;
      t = _scheduleNoise(ctx, t, { ...onset, durationMs: onset.durationMs - 30 }, 0.3) - 0.02;
      break;
    }
    case 'nasal': {
      t = _scheduleNasal(ctx, t, onset.durationMs, pitchHz);
      glideFrom = [300, 1300, 2300];
      break;
    }
    case 'liquid': {
      glideFrom = consonantSound === 'r' ? [450, 1300, 1600] : [380, 1000, 2600];
      break;
    }
    case 'glide': {
      // י גולש מ-i, ו גולש מ-u.
      const fromVowel = consonantSound === 'y' ? vowelFormantSpec('i') : vowelFormantSpec('u');
      glideFrom = fromVowel ? fromVowel.formants : null;
      break;
    }
    default:
      break; // 'none' - התנועה מתחילה ישר
  }

  return _scheduleVowel(ctx, t, spec, vowelMs, pitchHz, glideFrom);
}
