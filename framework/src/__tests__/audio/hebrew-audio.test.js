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
  const speech = () => vi.fn(async () => {});
  return { tts: {
    cancel: vi.fn(), speak: speech(), speakVowel: speech(), speakNikud: speech(),
    get audioState() { return state.value; },
    _setTestState(v) { state.value = v; },
  } };
});

vi.mock('../../audio/phoneme-synth.js', () => ({
  synthesizeVowel: vi.fn(async () => true),
  synthesizeSyllable: vi.fn(async () => true),
}));

import {
  SOUND_BANK_ID, letterKey, nikudKey, syllableKey, standardSoundKeys, speakLetter, speakNikudSound, speakSyllable,
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

it('סכימת מפתחות יציבה, ו-standardSoundKeys מכסה אותיות + ניקוד + הברות ללא כפילויות', () => {
  expect(letterKey('ב')).toBe('letter:ב');
  expect(nikudKey('kamatz')).toBe('nikud:kamatz');
  expect(syllableKey('ב', 'kamatz')).toBe('syllable:ב:kamatz');
  const keys = standardSoundKeys();
  const expected = hebrewLetters.length + nikudList.length + nikudBaseLetters.length * nikudList.length;
  expect(keys).toHaveLength(expected);
  expect(new Set(keys.map(k => k.key)).size).toBe(expected);
  for (const k of keys) {
    expect(['letters', 'nikud', 'syllables']).toContain(k.group);
    expect(k.label).toBeTruthy();
  }
});

describe('סדר הספקים', () => {
  it('הקלטת מורה קודמת לכל: בנק מצליח => TTS וסינתזה לא נקראים', async () => {
    playVoice.mockResolvedValue(true);
    expect(await speakSyllable('ב', 'kamatz')).toBe('bank');
    expect(playVoice).toHaveBeenCalledWith(SOUND_BANK_ID, 'syllable:ב:kamatz');
    expect(tts.speakNikud).not.toHaveBeenCalled();
    expect(synthesizeSyllable).not.toHaveBeenCalled();
  });

  it('אין הקלטה => TTS, וכשה-TTS תקין לא מסנתזים', async () => {
    expect(await speakSyllable('ב', 'kamatz')).toBe('tts');
    expect(tts.speakNikud).toHaveBeenCalledWith('ב', 'ָ');
    expect(synthesizeSyllable).not.toHaveBeenCalled();
  });

  it('TTS נכשל => נופלים לסינתזה מקומית של העיצור והתנועה הנכונים', async () => {
    tts._setTestState('failed');
    expect(await speakSyllable('ב', 'kamatz')).toBe('synth');
    expect(synthesizeSyllable).toHaveBeenCalledWith('b', 'a'); // ב=b, קמץ=a
    expect(await speakNikudSound('hiriq')).toBe('synth');
    expect(synthesizeVowel).toHaveBeenCalledWith('i');
  });

  it('speakLetter מקריא את שם האות ב-TTS', async () => {
    expect(await speakLetter('ב')).toBe('tts');
    // השוואה מול הנתונים עצמם - סדר תווי הניקוד המשולבים אינו נורמליזציה יציבה
    expect(tts.speak).toHaveBeenCalledWith(hebrewLetters.find(l => l.letter === 'ב').nameNikud);
  });

  it('כשל בבנק (חריגה) לא מפיל את השרשרת', async () => {
    playVoice.mockRejectedValue(new Error('idb broken'));
    expect(await speakNikudSound('kamatz')).toBe('tts');
  });
});

describe('round audio cancellation', () => {
  it('never starts playback for an ended round', async () => {
    const controller = new AbortController();
    controller.abort();
    expect(await speakSyllable('ב', 'kamatz', { signal: controller.signal })).toBe('none');
    expect(playVoice).not.toHaveBeenCalled();
    expect(tts.speakNikud).not.toHaveBeenCalled();
  });

  it('does not fall back to speech after an aborted recording lookup', async () => {
    const controller = new AbortController();
    let finish;
    playVoice.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
    const pending = speakSyllable('ב', 'kamatz', { signal: controller.signal });
    controller.abort();
    finish(false);
    expect(await pending).toBe('none');
    expect(tts.speakNikud).not.toHaveBeenCalled();
    expect(synthesizeSyllable).not.toHaveBeenCalled();
  });

  it('cancels pending speech without starting synthesis', async () => {
    const controller = new AbortController();
    let finish;
    tts.speakNikud.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
    const pending = speakSyllable('ב', 'kamatz', { signal: controller.signal });
    await vi.waitFor(() => expect(finish).toBeTypeOf('function'));
    controller.abort();
    finish();
    expect(await pending).toBe('none');
    expect(tts.cancel).toHaveBeenCalledOnce();
    expect(synthesizeSyllable).not.toHaveBeenCalled();
  });

  it('removes completed speech cancellation before another round can play', async () => {
    const controller = new AbortController();
    await speakSyllable('ב', 'kamatz', { signal: controller.signal });
    controller.abort();
    expect(tts.cancel).not.toHaveBeenCalled();
  });
});
