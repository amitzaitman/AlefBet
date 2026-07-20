/**
 * phoneme-synth - בדיקות לחלקים הטהורים של הסינתזה:
 * מפרטי הפורמנטים חייבים להיות עקביים עם תבניות הגלאי,
 * וכל עיצור של hebrew-letters חייב לקבל מפרט onset תקין.
 */
import { describe, it, expect } from 'vitest';
import { vowelFormantSpec, consonantOnsetSpec, isSynthSupported, synthesizeVowel } from '../../audio/phoneme-synth.js';
import { VOWEL_TEMPLATES } from '../../audio/vowel-detector.js';
import { hebrewLetters } from '../../data/hebrew-letters.js';

describe('vowelFormantSpec', () => {
  it.each(['a', 'e', 'i', 'o', 'u'])('מחזיר מפרט מלא לתנועה %s', (vowel) => {
    const spec = vowelFormantSpec(vowel);
    expect(spec).not.toBeNull();
    expect(spec.formants).toHaveLength(3);
    expect(spec.bandwidths).toHaveLength(3);
    expect(spec.gains).toHaveLength(3);
    // F1 < F2 < F3 - סדר פורמנטים תקין
    expect(spec.formants[0]).toBeLessThan(spec.formants[1]);
    expect(spec.formants[1]).toBeLessThan(spec.formants[2]);
  });

  it('F1/F2 זהים לתבניות הגלאי - סינתזה וזיהוי עקביים', () => {
    for (const [vowel, t] of Object.entries(VOWEL_TEMPLATES)) {
      const spec = vowelFormantSpec(vowel);
      expect(spec.formants[0]).toBe(t.F1);
      expect(spec.formants[1]).toBe(t.F2);
    }
  });

  it('מחזיר null לתנועה לא מוכרת', () => {
    expect(vowelFormantSpec('x')).toBeNull();
    expect(vowelFormantSpec('')).toBeNull();
  });
});

describe('consonantOnsetSpec', () => {
  it('לכל עיצור באלף-בית יש מפרט onset', () => {
    const sounds = new Set(hebrewLetters.map(l => l.sound));
    for (const sound of sounds) {
      const spec = consonantOnsetSpec(sound);
      expect(spec, `sound "${sound}"`).toBeDefined();
      expect(spec.type).toBeTruthy();
      expect(spec.durationMs).toBeGreaterThanOrEqual(0);
      if (spec.type === 'plosive' || spec.type === 'fricative' || spec.type === 'affricate') {
        expect(spec.noiseHz).toBeGreaterThan(0);
      }
    }
  });

  it('אותיות גרוניות (sound ריק) מקבלות onset מסוג none', () => {
    expect(consonantOnsetSpec('').type).toBe('none');
  });

  it('עיצור לא מוכר נופל ל-none במקום לזרוק', () => {
    expect(consonantOnsetSpec('zzz').type).toBe('none');
  });
});

describe('synthesizeVowel', () => {
  it('תנועה לא מוכרת נפתרת ב-false בלי לגעת באודיו', async () => {
    await expect(synthesizeVowel('x')).resolves.toBe(false);
  });

  it('תנועה תקינה מנוגנת דרך ה-AudioContext (stub) ונפתרת ב-true', async () => {
    // setup.js מספק SilentAudioContext, כך שהמסלול המלא רץ בלי קול.
    expect(isSynthSupported()).toBe(true);
    await expect(synthesizeVowel('a', { durationMs: 30 })).resolves.toBe(true);
  });
});
