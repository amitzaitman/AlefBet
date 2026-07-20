/**
 * sound-bank-compiler - חוזה הקימפול החד-פעמי:
 * 1) בלי proxy מוגדר - שגיאה ברורה, לא דילוג שקט.
 * 2) הטקסט הנכון לכל סוג מפתח (שם אות / צליל תנועה / הברה מנוקדת).
 * 3) מפתחות קיימים לא נדרסים; כשלים נאספים ולא נבלעים.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../audio/voice-store.js', () => ({
  saveVoice: vi.fn(async () => {}),
  listVoiceKeys: vi.fn(async () => []),
  playVoice: vi.fn(async () => false),
}));

import { compileTextForKey, compileSoundBank, resolveTtsProxyUrl } from '../../audio/sound-bank-compiler.js';
import { standardSoundKeys } from '../../audio/hebrew-audio.js';
import { saveVoice, listVoiceKeys } from '../../audio/voice-store.js';
import { getLetter } from '../../data/hebrew-letters.js';
import { nikudList } from '../../data/nikud.js';

function okAudioResponse() {
  return {
    ok: true,
    blob: async () => new Blob(['audio-bytes'], { type: 'audio/mpeg' }),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  listVoiceKeys.mockResolvedValue([]);
  try { localStorage.clear(); } catch { /* ignore */ }
  delete window.ALEFBET_TTS_PROXY_URL;
  vi.stubGlobal('indexedDB', {});
});

describe('compileTextForKey', () => {
  it('letter key → the letter name with nikud', () => {
    expect(compileTextForKey('letter:ב')).toBe(getLetter('ב').nameNikud);
  });

  it('nikud key → the vowel sound', () => {
    const kamatz = nikudList.find(n => n.id === 'kamatz');
    expect(compileTextForKey('nikud:kamatz')).toBe(kamatz.sound);
  });

  it('syllable key → letter + nikud symbol (vowelized, so TTS speaks the syllable)', () => {
    const kamatz = nikudList.find(n => n.id === 'kamatz');
    expect(compileTextForKey('syllable:ב:kamatz')).toBe('ב' + kamatz.symbol);
  });

  it('word key → the raw text', () => {
    expect(compileTextForKey('word:כל הכבוד')).toBe('כל הכבוד');
  });

  it('unknown keys → null (reported as failure, not skipped silently)', () => {
    expect(compileTextForKey('bogus:x')).toBeNull();
    expect(compileTextForKey('letter:Q')).toBeNull();
  });

  it('every standard key has a compilable text', () => {
    for (const { key } of standardSoundKeys()) {
      expect(compileTextForKey(key), key).toBeTruthy();
    }
  });
});

describe('resolveTtsProxyUrl', () => {
  it('returns null when nothing is configured', () => {
    expect(resolveTtsProxyUrl()).toBeNull();
  });

  it('reads the global override and strips trailing slashes', () => {
    window.ALEFBET_TTS_PROXY_URL = 'https://proxy.example.com/';
    expect(resolveTtsProxyUrl()).toBe('https://proxy.example.com');
  });

  it('falls back to the stored nakdan proxy (same worker serves both routes)', () => {
    localStorage.setItem('alefbet.nakdanProxyUrl', 'https://worker.example.com');
    expect(resolveTtsProxyUrl()).toBe('https://worker.example.com');
  });
});

describe('compileSoundBank', () => {
  it('throws a clear error when no proxy is configured', async () => {
    await expect(compileSoundBank()).rejects.toThrow('tts-proxy-not-configured');
  });

  it('downloads and saves every missing standard key', async () => {
    window.ALEFBET_TTS_PROXY_URL = 'https://proxy.example.com';
    const mockFetch = vi.fn().mockResolvedValue(okAudioResponse());
    vi.stubGlobal('fetch', mockFetch);

    const result = await compileSoundBank();

    const total = standardSoundKeys().length;
    expect(result.total).toBe(total);
    expect(result.compiled).toBe(total);
    expect(result.failures).toEqual([]);
    expect(saveVoice).toHaveBeenCalledTimes(total);
    // הבקשה הראשונה נשלחת למסלול /tts של ה-worker.
    expect(String(mockFetch.mock.calls[0][0])).toContain('https://proxy.example.com/tts?text=');
  });

  it('skips keys that already exist (teacher recordings win)', async () => {
    window.ALEFBET_TTS_PROXY_URL = 'https://proxy.example.com';
    const allKeys = standardSoundKeys().map(k => k.key);
    listVoiceKeys.mockResolvedValue(allKeys.slice(0, 5));
    const mockFetch = vi.fn().mockResolvedValue(okAudioResponse());
    vi.stubGlobal('fetch', mockFetch);

    const result = await compileSoundBank();

    expect(result.skipped).toBe(5);
    expect(result.compiled).toBe(allKeys.length - 5);
    expect(mockFetch).toHaveBeenCalledTimes(allKeys.length - 5);
  });

  it('collects failures per key instead of aborting or swallowing them', async () => {
    window.ALEFBET_TTS_PROXY_URL = 'https://proxy.example.com';
    let call = 0;
    const mockFetch = vi.fn().mockImplementation(async () => {
      call++;
      if (call <= 2) return { ok: false, status: 502 };
      return okAudioResponse();
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await compileSoundBank();

    expect(result.failures).toHaveLength(2);
    expect(result.failures[0].reason).toContain('502');
    expect(result.compiled).toBe(result.total - 2);
  });

  it('reports progress for every key', async () => {
    window.ALEFBET_TTS_PROXY_URL = 'https://proxy.example.com';
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(okAudioResponse()));
    const onProgress = vi.fn();

    await compileSoundBank({ onProgress });

    const total = standardSoundKeys().length;
    expect(onProgress).toHaveBeenCalledTimes(total);
    expect(onProgress).toHaveBeenLastCalledWith(total, total, expect.any(String));
  });

  it('extraTexts are compiled as word keys', async () => {
    window.ALEFBET_TTS_PROXY_URL = 'https://proxy.example.com';
    const mockFetch = vi.fn().mockResolvedValue(okAudioResponse());
    vi.stubGlobal('fetch', mockFetch);

    const result = await compileSoundBank({ extraTexts: ['כל הכבוד'] });

    expect(result.total).toBe(standardSoundKeys().length + 1);
    expect(saveVoice).toHaveBeenCalledWith('sound-bank', 'word:כל הכבוד', expect.any(Blob));
  });
});
