/**
 * מנוע שמע עברי מאוחד - אופליין תחילה (offline-first).
 *
 * כל השמעה עוברת שרשרת ספקים לפי סדר איכות וזמינות - כולם מקומיים,
 * אף אחד מהם אינו יוצר תעבורת רשת בזמן משחק:
 *   1. בנק הצלילים - הקלטות אנושיות (מורה/הורה) או קבצים שקומפלו
 *      חד-פעמית (sound-bank-compiler), שמורים ב-IndexedDB.
 *   2. TTS מקומי - קול המערכת דרך Web Speech API (ראו tts.js).
 *   3. סינתזת פונמות מקומית (phoneme-synth) - תמיד זמינה, איכות בסיסית.
 * ההבטחות תמיד נפתרות; מוחזר מקור ההשמעה בפועל ('bank'|'tts'|'synth'|'none')
 * כדי שמשחקים ובדיקות יוכלו לדעת מה קרה מבלי להיתקע.
 *
 * מפתחות הבנק סמנטיים וקבועים:
 *   letter:<אות>            - שם האות ("בית")
 *   nikud:<id>              - צליל התנועה של הניקוד ("אָה")
 *   syllable:<אות>:<id>     - הברה אות+ניקוד ("בָּ")
 *   word:<טקסט>             - מילה/משפט חופשי (הוראות משחק)
 *
 * API ציבורי:
 *   SOUND_BANK_ID, letterKey, nikudKey, syllableKey, wordKey,
 *   standardSoundKeys, keyLabel, isOffline,
 *   speakLetter, speakNikudSound, speakSyllable, speakWord,
 *   recordedKeys (רשימת המפתחות שכבר הוקלטו).
 */
import { tts } from './tts.js';
import { playVoice, listVoiceKeys } from './voice-store.js';
import { NIKUD_VOWEL } from './vowel-detector.js';
import { synthesizeVowel, synthesizeSyllable } from './phoneme-synth.js';
import { hebrewLetters, getLetter } from '../data/hebrew-letters.js';
import { nikudList, nikudBaseLetters, letterWithNikud } from '../data/nikud.js';

/** מזהה ה"משחק" של בנק הצלילים ב-voice-store - משותף לכל המשחקים. */
export const SOUND_BANK_ID = 'sound-bank';

/**
 * מפתח בנק לשם אות.
 * @param {string} letter - תו האות (למשל 'ב')
 * @returns {string}
 */
export function letterKey(letter) {
  return `letter:${letter}`;
}

/**
 * מפתח בנק לצליל תנועת ניקוד.
 * @param {string} nikudId - מזהה מתוך nikudList (למשל 'kamatz')
 * @returns {string}
 */
export function nikudKey(nikudId) {
  return `nikud:${nikudId}`;
}

/**
 * מפתח בנק להברה אות+ניקוד.
 * @param {string} letter - תו האות
 * @param {string} nikudId - מזהה ניקוד
 * @returns {string}
 */
export function syllableKey(letter, nikudId) {
  return `syllable:${letter}:${nikudId}`;
}

/**
 * מפתח בנק למילה/משפט חופשי (הוראות, מילות עידוד).
 * @param {string} text
 * @returns {string}
 */
export function wordKey(text) {
  return `word:${text}`;
}

/**
 * כל המפתחות הסטנדרטיים של הבנק: 27 אותיות, 7 ניקודים,
 * וכל הברות אות-בסיס x ניקוד. משמש את אולפן ההקלטה של המורה
 * כדי להציג רשימת "מה נשאר להקליט".
 * @returns {{ key: string, label: string, group: 'letters'|'nikud'|'syllables' }[]}
 */
export function standardSoundKeys() {
  /** @type {{ key: string, label: string, group: 'letters'|'nikud'|'syllables' }[]} */
  const keys = [];
  for (const l of hebrewLetters) {
    keys.push({ key: letterKey(l.letter), label: l.nameNikud, group: 'letters' });
  }
  for (const n of nikudList) {
    keys.push({ key: nikudKey(n.id), label: `${n.nameNikud} (${n.sound})`, group: 'nikud' });
  }
  for (const letter of nikudBaseLetters) {
    for (const n of nikudList) {
      keys.push({
        key: syllableKey(letter, n.id),
        label: letterWithNikud(letter, n.symbol),
        group: 'syllables',
      });
    }
  }
  return keys;
}

/**
 * תווית תצוגה למפתח בנק (לאולפן ההקלטה ולדיבוג).
 * @param {string} key
 * @returns {string}
 */
export function keyLabel(key) {
  const std = standardSoundKeys().find(k => k.key === key);
  if (std) return std.label;
  const [, ...rest] = key.split(':');
  return rest.join(':');
}

/**
 * האם הדפדפן מדווח שאין רשת. כשאין רשת מדלגים על ספקי הרשת מראש
 * במקום להמתין לכישלון - זה מה ששומר על המשחק "יציב מאוד" אופליין.
 * @returns {boolean}
 */
export function isOffline() {
  return typeof navigator !== 'undefined' && navigator.onLine === false;
}

/**
 * ניסיון השמעה מבנק ההקלטות. לעולם לא זורק.
 * @param {string} key
 * @returns {Promise<boolean>}
 */
async function _tryBank(key) {
  try {
    if (typeof indexedDB === 'undefined') return false;
    return await playVoice(SOUND_BANK_ID, key);
  } catch {
    return false;
  }
}

/**
 * ניסיון השמעה דרך TTS. מצליח אם מכונת המצבים לא דיווחה כשל.
 * @param {() => Promise<void>} speakFn
 * @returns {Promise<boolean>}
 */
async function _tryTTS(speakFn) {
  if (isOffline() && !_hasLocalVoice()) return false;
  try {
    await speakFn();
    return tts.audioState !== 'failed' && tts.audioState !== 'unsupported';
  } catch {
    return false;
  }
}

/** האם קיים קול מערכת מקומי (speechSynthesis) שיכול לעבוד גם בלי רשת. */
function _hasLocalVoice() {
  return typeof speechSynthesis !== 'undefined';
}

/**
 * רשימת המפתחות שכבר הוקלטו בבנק. לעולם לא זורק.
 * @returns {Promise<string[]>}
 */
export async function recordedKeys() {
  try {
    if (typeof indexedDB === 'undefined') return [];
    return await listVoiceKeys(SOUND_BANK_ID);
  } catch {
    return [];
  }
}

/**
 * השמע את שם האות (למשל "בית" עבור 'ב').
 * שרשרת: בנק -> TTS(שם האות) -> סינתזת הברה עם התנועה של שם האות.
 * @param {string} letter - תו האות
 * @returns {Promise<'bank'|'tts'|'synth'|'none'>} המקור שניגן בפועל
 */
export async function speakLetter(letter) {
  if (await _tryBank(letterKey(letter))) return 'bank';
  const data = getLetter(letter);
  const name = data ? data.nameNikud : letter;
  if (await _tryTTS(() => tts.speak(name))) return 'tts';
  if (data && await synthesizeSyllable(data.sound, 'a', { durationMs: 400 })) return 'synth';
  return 'none';
}

/**
 * השמע את צליל התנועה של ניקוד ("אָה" עבור קמץ).
 * שרשרת: בנק -> TTS -> סינתזת תנועה.
 * @param {string} nikudId - מזהה מתוך nikudList
 * @returns {Promise<'bank'|'tts'|'synth'|'none'>}
 */
export async function speakNikudSound(nikudId) {
  if (await _tryBank(nikudKey(nikudId))) return 'bank';
  if (await _tryTTS(() => tts.speakVowel(nikudId))) return 'tts';
  const vowel = NIKUD_VOWEL[nikudId];
  if (vowel && await synthesizeVowel(vowel)) return 'synth';
  return 'none';
}

/**
 * השמע הברה אות+ניקוד ("בָּ").
 * שרשרת: בנק -> TTS דו-שלבי (speakNikud) -> סינתזת עיצור+תנועה.
 * @param {string} letter - תו האות
 * @param {string} nikudId - מזהה ניקוד
 * @returns {Promise<'bank'|'tts'|'synth'|'none'>}
 */
export async function speakSyllable(letter, nikudId) {
  if (await _tryBank(syllableKey(letter, nikudId))) return 'bank';
  const nikud = nikudList.find(n => n.id === nikudId);
  if (nikud && await _tryTTS(() => tts.speakNikud(letter, nikud.symbol))) return 'tts';
  const data = getLetter(letter);
  const vowel = NIKUD_VOWEL[nikudId];
  if (vowel && await synthesizeSyllable(data ? data.sound : '', vowel)) return 'synth';
  return 'none';
}

/**
 * השמע מילה/משפט חופשי (הוראות משחק, עידוד).
 * שרשרת: בנק (אם המורה הקליטה את המשפט) -> TTS. אין סינתזה למילים
 * שלמות - אם אין קול, מוחזר 'none' והמשחק ימשיך בשקט.
 * @param {string} text
 * @returns {Promise<'bank'|'tts'|'none'>}
 */
export async function speakWord(text) {
  if (await _tryBank(wordKey(text))) return 'bank';
  if (await _tryTTS(() => tts.speak(text))) return 'tts';
  return 'none';
}
