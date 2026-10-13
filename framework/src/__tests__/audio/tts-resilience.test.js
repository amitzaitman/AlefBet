/**
 * חוזה עמידוּת ל-TTS - ספק מקומי בלבד.
 *
 * מנוע ה-TTS משתמש אך ורק ב-Web Speech API (קול מערכת): אין ספק רשת
 * ואין fallback שקט לשירות חיצוני. הבדיקות מכסות את מכונת המצבים
 * (idle / awaiting-interaction / ready / unsupported / failed), את אירועי
 * `alefbet:tts-state` ו-`alefbet:tts-error`, טיים-אאוט לטעינת קולות,
 * watchdog נגד utterance תקוע (קול רשת אופליין), וטיפול בחסימת autoplay.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../../data/nikud.js', () => ({
  nikudList: [
    { id: 'kamatz', symbol: 'ָ', sound: 'אָה' },
    { id: 'holam', symbol: 'ֹ', sound: 'אוֹ' },
  ],
}));

const carmit = { name: 'Carmit', lang: 'he-IL' };
const end = utt => queueMicrotask(() => utt.onend?.());
const fail = error => utt => queueMicrotask(() => utt.onerror?.({ error }));
/** Fails fast with a clear message instead of hanging until the test timeout. */
const within = (promise, what) => Promise.race([
  promise, new Promise((_, reject) => setTimeout(() => reject(new Error(what)), 250)),
]);

/** @type {CustomEvent[]} */
let events;
const record = e => events.push(e);
const states = () => events.filter(e => e.type === 'alefbet:tts-state').map(e => e.detail.state);
const errors = () => events.filter(e => e.type === 'alefbet:tts-error').map(e => e.detail.reason);

/**
 * Loads a fresh tts module, so its voiceschanged listener binds to the current stub.
 */
async function loadTts() {
  vi.resetModules();
  return (await import('../../audio/tts.js')).tts;
}

/**
 * Installs a speechSynthesis stub and loads tts. `speak` decides how each utterance ends.
 * @param {{ voices?: any[], speak?: (utt: any, attempt: number) => void }} [opts]
 */
async function setup({ voices = [carmit], speak = end } = {}) {
  const target = new EventTarget();
  const synth = {
    voices,
    /** @type {any[]} */ spoken: [],
    addEventListener: target.addEventListener.bind(target),
    removeEventListener: target.removeEventListener.bind(target),
    dispatchEvent: target.dispatchEvent.bind(target),
    getVoices: () => synth.voices,
    speak: vi.fn(utt => { synth.spoken.push(utt); speak(utt, synth.spoken.length); }),
    cancel: vi.fn(),
  };
  vi.stubGlobal('speechSynthesis', synth);
  return { tts: await loadTts(), synth };
}

beforeEach(() => {
  events = [];
  window.addEventListener('alefbet:tts-state', record);
  window.addEventListener('alefbet:tts-error', record);
  vi.stubGlobal('SpeechSynthesisUtterance', class {
    constructor(text) { Object.assign(this, { text, lang: '', rate: 1, voice: null }); }
  });
});

afterEach(() => {
  window.removeEventListener('alefbet:tts-state', record);
  window.removeEventListener('alefbet:tts-error', record);
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('tts resilience (local-only)', () => {
  it('speechSynthesis missing → silent + unsupported state', async () => {
    vi.stubGlobal('speechSynthesis', undefined);
    const tts = await loadTts();
    await expect(tts.speak('שלום')).resolves.toBeUndefined();
    expect(tts.available).toBe(false);
    expect(tts.audioState).toBe('unsupported');
    expect(states()).toContain('unsupported');
  });

  it('speaks only through the system voice (no network Audio) and moves idle → ready', async () => {
    const Audio = vi.fn();
    vi.stubGlobal('Audio', Audio);
    const { tts, synth } = await setup();
    expect(tts.audioState).toBe('idle');
    await tts.speak('שלום');
    await tts.speakNikud('מ', 'ָ');
    expect(synth.speak).toHaveBeenCalledTimes(3);
    expect(Audio).not.toHaveBeenCalled();
    expect(tts.audioState).toBe('ready');
    expect(states()).toEqual(['ready']);
  });

  it('speakNikud: syllable at the natural rate, then the vowel slowly, without leaking the rate', async () => {
    const { tts, synth } = await setup();
    tts.setRate(0.9);
    tts.setNikudEmphasis({ rate: 0.5 });
    await tts.speakNikud('מ', 'ָ');
    // פתח לא קיים ב-mock שמכיל רק kamatz/holam - שלב יחיד.
    await tts.speakNikud('מ', 'ַ');
    await tts.speak('שלום');
    expect(synth.spoken.map(utt => [utt.text, utt.rate])).toEqual([
      ['מָ', 0.9], ['אָה', 0.5], ['מַ', 0.9], ['שלום', 0.9],
    ]);
  });

  it('getVoices empty initially, voiceschanged fires later → proceeds with he-IL voice', async () => {
    const { tts, synth } = await setup({ voices: [] });
    setTimeout(() => {
      synth.voices = [carmit];
      synth.dispatchEvent(new Event('voiceschanged'));
    }, 0);
    await tts.speak('שלום');
    expect(synth.spoken[0].lang).toBe('he-IL');
    expect(synth.spoken[0].voice).toBe(carmit);
  });

  it('voiceschanged never fires within ~2s timeout → fallthrough with warning', async () => {
    vi.useFakeTimers();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { tts, synth } = await setup({ voices: [] });
    const done = tts.speak('שלום');
    await vi.advanceTimersByTimeAsync(2500);
    await done;
    expect(synth.speak).toHaveBeenCalled();
    expect(errors()).toEqual(['voice-load-timeout']);
    expect(warn).toHaveBeenCalledWith('[tts] browser TTS failed', expect.objectContaining({ reason: 'voice-load-timeout' }));
  });

  it('offline prefers a locally-installed voice over a network voice', async () => {
    // Both names match the female-voice preference, so only the offline rule can pick the local one.
    const local = { name: 'Carmit', lang: 'he-IL', localService: true };
    vi.stubGlobal('navigator', { ...navigator, onLine: false });
    const { tts, synth } = await setup({ voices: [{ name: 'Google Carmit', lang: 'he-IL', localService: false }, local] });
    await tts.speak('שלום');
    expect(synth.spoken[0].voice).toBe(local);
  });

  it('utterance blocked by autoplay → awaiting-interaction once, retries on first pointerdown', async () => {
    const { tts, synth } = await setup({ speak: (utt, attempt) => (attempt === 1 ? fail('not-allowed') : end)(utt) });
    let resolved = false;
    const done = tts.speak('שלום').then(() => { resolved = true; });
    await new Promise(r => setTimeout(r, 0));
    expect(resolved).toBe(false);
    expect(states()).toEqual(['awaiting-interaction']);
    window.dispatchEvent(new Event('pointerdown'));
    await done;
    expect(synth.speak).toHaveBeenCalledTimes(2);
    expect(states()).toEqual(['awaiting-interaction', 'ready']);
  });

  it('browser speech fails → state=failed + error event (no silent fallback)', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { tts } = await setup({ speak: fail('language-unavailable') });
    await expect(tts.speak('שלום')).resolves.toBeUndefined();
    expect(tts.audioState).toBe('failed');
    expect(states()).toEqual(['failed']);
    expect(errors()).toEqual(['language-unavailable']);
    expect(warn).toHaveBeenCalledWith('[tts] browser TTS failed', expect.objectContaining({ reason: 'language-unavailable' }));
  });

  it('watchdog: utterance that never ends resolves as failure instead of hanging', async () => {
    vi.useFakeTimers();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    // קול רשת אופליין ב-Chrome: speak() נקרא אבל לא onend ולא onerror.
    const { tts } = await setup({ voices: [{ name: 'Google עברית', lang: 'he-IL', localService: false }], speak: () => {} });
    const done = tts.speak('שלום');
    await vi.advanceTimersByTimeAsync(20_000);
    await expect(done).resolves.toBeUndefined();
    expect(tts.audioState).toBe('failed');
    expect(errors()).toEqual(['utterance-timeout']);
    expect(warn).toHaveBeenCalledWith('[tts] browser TTS failed', expect.objectContaining({ reason: 'utterance-timeout' }));
  });

  it('cancel() leaves state machine consistent and drains queued speaks', async () => {
    const { tts, synth } = await setup({ speak: () => {} });
    const queued = Promise.all(['one', 'two', 'three'].map(text => tts.speak(text)));
    await new Promise(r => setTimeout(r, 0));
    tts.cancel();
    await expect(within(queued, 'cancel did not drain in-flight speak')).resolves.toEqual([undefined, undefined, undefined]);
    expect(synth.cancel).toHaveBeenCalledTimes(1);
    expect(tts.audioState).toBe('idle');
    // speak שני אחרי cancel חייב לרוץ נקי - אחרת _speaking נשאר תקוע ב-true.
    synth.speak.mockImplementation(end);
    await within(tts.speak('after-cancel'), 'post-cancel speak did not run');
  });
});
