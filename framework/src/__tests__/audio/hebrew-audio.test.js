/**
 * hebrew-audio - בדיקות לשרשרת השמע האופליין-תחילה:
 * 1) סכימת המפתחות יציבה ומכסה את כל האותיות/ניקוד/הברות.
 * 2) סדר הספקים: בנק הקלטות לפני TTS, וסינתזה כגיבוי אחרון.
 * 3) הבטחות תמיד נפתרות עם מקור ההשמעה בפועל.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../audio/voice-store.js', () => ({
  playVoice: vi.fn(async () => false),
  listVoiceKeys: vi.fn(async () => []),
}));

vi.mock('../../audio/tts.js', () => {
  const state = { value: 'ready' };
  return {
    tts: {
      speak: vi.fn(async () => {}),
      speakVowel: vi.fn(async () => {}),
      speakNikud: vi.fn(async () => {}),
      get audioState() { return state.value; },
      _setTestState(v) { state.value = v; },
    },
  };
});

vi.mock('../../audio/phoneme-synth.js', () => ({
  synthesizeVowel: vi.fn(async () => true),
  synthesizeSyllable: vi.fn(async () => true),
}));

import {
  SOUND_BANK_ID,
  letterKey, nikudKey, syllableKey, wordKey,
  standardSoundKeys, keyLabel,
  speakLetter, speakNikudSound, speakSyllable, speakWord,
} from '../../audio/hebrew-audio.js';
import { playVoice } from '../../audio/voice-store.js';
import { tts } from '../../audio/tts.js';
import { synthesizeVowel, synthesizeSyllable } from '../../audio/phoneme-synth.js';
import { hebrewLetters } from '../../data/hebrew-letters.js';
import { nikudList, nikudBaseLetters } from '../../data/nikud.js';

beforeEach(() => {
  vi.clearAllMocks();
  playVoice.mockResolvedValue(false);
  tts._setTestState('ready');
  // ל-jsdom אין indexedDB; hebrew-audio מדלג על הבנק כשהוא חסר,
  // ולכן נדרש stub כדי לבדוק את מסלול הבנק (voice-store עצמו ממוקק).
  vi.stubGlobal('indexedDB', {});
});

describe('סכימת מפתחות', () => {
  it('בוני מפתחות יציבים', () => {
    expect(letterKey('ב')).toBe('letter:ב');
    expect(nikudKey('kamatz')).toBe('nikud:kamatz');
    expect(syllableKey('ב', 'kamatz')).toBe('syllable:ב:kamatz');
    expect(wordKey('שלום')).toBe('word:שלום');
  });

  it('standardSoundKeys מכסה אותיות + ניקוד + הברות ללא כפילויות', () => {
    const keys = standardSoundKeys();
    const expected = hebrewLetters.length + nikudList.length + nikudBaseLetters.length * nikudList.length;
    expect(keys).toHaveLength(expected);
    expect(new Set(keys.map(k => k.key)).size).toBe(expected);
    for (const k of keys) {
      expect(['letters', 'nikud', 'syllables']).toContain(k.group);
      expect(k.label).toBeTruthy();
    }
  });

  it('keyLabel מחזיר תווית קריאה', () => {
    expect(keyLabel(nikudKey('kamatz'))).toContain('קָמָץ');
    expect(keyLabel(wordKey('שלום'))).toBe('שלום');
  });
});

describe('סדר הספקים', () => {
  it('הקלטת מורה קודמת לכל: בנק מצליח => TTS וסינתזה לא נקראים', async () => {
    playVoice.mockResolvedValue(true);
    const source = await speakSyllable('ב', 'kamatz');
    expect(source).toBe('bank');
    expect(playVoice).toHaveBeenCalledWith(SOUND_BANK_ID, 'syllable:ב:kamatz');
    expect(tts.speakNikud).not.toHaveBeenCalled();
    expect(synthesizeSyllable).not.toHaveBeenCalled();
  });

  it('אין הקלטה => TTS, וכשה-TTS תקין לא מסנתזים', async () => {
    const source = await speakSyllable('ב', 'kamatz');
    expect(source).toBe('tts');
    expect(tts.speakNikud).toHaveBeenCalledWith('ב', 'ָ');
    expect(synthesizeSyllable).not.toHaveBeenCalled();
  });

  it('TTS נכשל => נופלים לסינתזה מקומית', async () => {
    tts._setTestState('failed');
    const source = await speakSyllable('ב', 'kamatz');
    expect(source).toBe('synth');
    // ב=b, קמץ=a - הסינתזה מקבלת את העיצור והתנועה הנכונים
    expect(synthesizeSyllable).toHaveBeenCalledWith('b', 'a');
  });

  it('speakNikudSound נופל לסינתזת התנועה המתאימה', async () => {
    tts._setTestState('failed');
    const source = await speakNikudSound('hiriq');
    expect(source).toBe('synth');
    expect(synthesizeVowel).toHaveBeenCalledWith('i');
  });

  it('speakWord ללא בנק וללא TTS מחזיר none בלי לזרוק', async () => {
    tts._setTestState('failed');
    await expect(speakWord('שלום')).resolves.toBe('none');
  });

  it('speakLetter מקריא את שם האות ב-TTS', async () => {
    const source = await speakLetter('ב');
    expect(source).toBe('tts');
    // השוואה מול הנתונים עצמם - סדר תווי הניקוד המשולבים אינו נורמליזציה יציבה
    const bet = hebrewLetters.find(l => l.letter === 'ב');
    expect(tts.speak).toHaveBeenCalledWith(bet.nameNikud);
  });

  it('כשל בבנק (חריגה) לא מפיל את השרשרת', async () => {
    playVoice.mockRejectedValue(new Error('idb broken'));
    const source = await speakNikudSound('kamatz');
    expect(source).toBe('tts');
  });
});
