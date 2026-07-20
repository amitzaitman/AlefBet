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

// `tts.js` מייבא את `getNikud` ו-`nikudList`. אנחנו לא בודקים את הנקדן עצמו,
// לכן נחזיר זהות כדי שלא תהיה תלות ברשת או בקאש פנימי בזמן הבדיקה.
vi.mock('../../utils/nakdan.js', () => ({
  getNikud: (text) => text,
  preloadNikud: vi.fn().mockResolvedValue(undefined),
  addNikud: vi.fn(async (text) => text),
}));

vi.mock('../../data/nikud.js', () => ({
  nikudList: [
    { id: 'kamatz', symbol: 'ָ', sound: 'אָה' },
    { id: 'holam', symbol: 'ֹ', sound: 'אוֹ' },
  ],
  nikudBaseLetters: ['א'],
  letterWithNikud: (l, s) => l + s,
}));

/** @typedef {{ type: string, detail: any }} CapturedEvent */

/** @type {CapturedEvent[]} */
let events;
let stateListener;
let errorListener;

/**
 * רושם את כל אירועי ה-state וה-error שנשלחים אל window.
 */
function captureEvents() {
  events = [];
  stateListener = (e) => events.push({ type: 'alefbet:tts-state', detail: e.detail });
  errorListener = (e) => events.push({ type: 'alefbet:tts-error', detail: e.detail });
  window.addEventListener('alefbet:tts-state', stateListener);
  window.addEventListener('alefbet:tts-error', errorListener);
}

/** מחזיר את כל אירועי ה-state בלבד מתוך התור. */
function stateEvents() {
  return events.filter(e => e.type === 'alefbet:tts-state');
}

/** מחזיר את כל אירועי ה-error בלבד מתוך התור. */
function errorEvents() {
  return events.filter(e => e.type === 'alefbet:tts-error');
}

/**
 * בונה stub ל-speechSynthesis התומך ב-EventTarget וב-getVoices מותאם.
 * @param {{ voices?: any[], speakImpl?: (utt: any) => void }} [opts]
 */
function makeSynthStub(opts = {}) {
  const target = new EventTarget();
  let voices = opts.voices ?? [];
  /** @type {any[]} */
  const speakCalls = [];
  const synth = {
    addEventListener: target.addEventListener.bind(target),
    removeEventListener: target.removeEventListener.bind(target),
    dispatchEvent: target.dispatchEvent.bind(target),
    getVoices: vi.fn(() => voices),
    speak: vi.fn((utt) => {
      speakCalls.push(utt);
      if (opts.speakImpl) {
        opts.speakImpl(utt);
      } else {
        // ברירת מחדל: הדמה onend אסינכרוני כדי שהבטחה תיפתר.
        queueMicrotask(() => { if (typeof utt.onend === 'function') utt.onend(); });
      }
    }),
    cancel: vi.fn(),
    _setVoices(next) { voices = next; },
    _speakCalls: speakCalls,
  };
  return synth;
}

/**
 * טוען מחדש את מודול ה-tts אחרי שה-stubs הותקנו, כדי שהאזנת ה-voiceschanged
 * שבמודול תיצמד ל-stub שלנו ולא ל-globalThis הקודם.
 */
async function loadTts() {
  vi.resetModules();
  const mod = await import('../../audio/tts.js');
  return mod.tts;
}

beforeEach(() => {
  // אפס global state בין בדיקות.
  delete globalThis.speechSynthesis;
  delete globalThis.SpeechSynthesisUtterance;
  // SpeechSynthesisUtterance בסיסי שמספיק לכל הבדיקות.
  globalThis.SpeechSynthesisUtterance = class {
    constructor(text) {
      this.text = text;
      this.lang = '';
      this.rate = 1;
      this.voice = null;
      this.onend = null;
      this.onerror = null;
    }
  };
  captureEvents();
});

afterEach(() => {
  vi.useRealTimers();
  window.removeEventListener('alefbet:tts-state', stateListener);
  window.removeEventListener('alefbet:tts-error', errorListener);
  delete globalThis.speechSynthesis;
  delete globalThis.SpeechSynthesisUtterance;
  vi.resetModules();
  vi.unstubAllGlobals();
});

describe('tts resilience (local-only)', () => {
  it('speechSynthesis missing → silent + unsupported state', async () => {
    globalThis.speechSynthesis = undefined;

    const tts = await loadTts();

    await expect(tts.speak('שלום')).resolves.toBeUndefined();

    expect(tts.available).toBe(false);
    expect(tts.audioState).toBe('unsupported');

    const unsupported = stateEvents().find(e => e.detail?.state === 'unsupported');
    expect(unsupported).toBeDefined();
  });

  it('does not construct any network Audio - Google is gone from runtime', async () => {
    const AudioSpy = vi.fn(function FakeAudio() {
      return { play: vi.fn(() => Promise.resolve()) };
    });
    vi.stubGlobal('Audio', AudioSpy);

    const synth = makeSynthStub({ voices: [{ name: 'Carmit', lang: 'he-IL' }] });
    globalThis.speechSynthesis = synth;

    const tts = await loadTts();
    await tts.speak('שלום');
    await tts.speakNikud('מ', 'ָ');

    expect(synth.speak).toHaveBeenCalled();
    expect(AudioSpy).not.toHaveBeenCalled();
  });

  it('getVoices empty initially, voiceschanged fires later → proceeds with he-IL voice', async () => {
    const hebrewVoice = { name: 'Carmit', lang: 'he-IL' };
    const synth = makeSynthStub({ voices: [] });
    globalThis.speechSynthesis = synth;

    const tts = await loadTts();

    setTimeout(() => {
      synth._setVoices([hebrewVoice]);
      synth.dispatchEvent(new Event('voiceschanged'));
    }, 0);

    await tts.speak('שלום');

    expect(synth.speak).toHaveBeenCalled();
    const utt = synth._speakCalls[0];
    expect(utt.lang).toBe('he-IL');
    expect(utt.voice).toBe(hebrewVoice);
  });

  it('voiceschanged never fires within ~2s timeout → fallthrough with warning', async () => {
    vi.useFakeTimers();
    const synth = makeSynthStub({ voices: [] });
    globalThis.speechSynthesis = synth;

    const tts = await loadTts();

    const speakPromise = tts.speak('שלום');

    await vi.advanceTimersByTimeAsync(2500);
    await vi.runAllTimersAsync();

    await speakPromise;

    expect(synth.speak).toHaveBeenCalled();
    const errorTimeout = errorEvents().some(e =>
      typeof e.detail?.reason === 'string' && e.detail.reason.toLowerCase().includes('timeout')
    );
    expect(errorTimeout).toBe(true);
  });

  it('offline prefers a locally-installed voice over a network voice', async () => {
    const networkVoice = { name: 'Google עברית', lang: 'he-IL', localService: false };
    const localVoice = { name: 'Carmit', lang: 'he-IL', localService: true };
    const synth = makeSynthStub({ voices: [networkVoice, localVoice] });
    globalThis.speechSynthesis = synth;
    vi.stubGlobal('navigator', { ...navigator, onLine: false });

    const tts = await loadTts();
    await tts.speak('שלום');

    expect(synth._speakCalls[0].voice).toBe(localVoice);
  });

  it('utterance blocked by autoplay → awaiting-interaction once, retries on first pointerdown', async () => {
    let attempts = 0;
    const synth = makeSynthStub({
      voices: [{ name: 'Carmit', lang: 'he-IL' }],
      speakImpl: (utt) => {
        attempts++;
        if (attempts === 1) {
          queueMicrotask(() => { if (typeof utt.onerror === 'function') utt.onerror({ error: 'not-allowed' }); });
        } else {
          queueMicrotask(() => { if (typeof utt.onend === 'function') utt.onend(); });
        }
      },
    });
    globalThis.speechSynthesis = synth;

    const tts = await loadTts();

    let resolved = false;
    const speakPromise = tts.speak('שלום').then(() => { resolved = true; });

    await new Promise(r => setTimeout(r, 0));
    expect(resolved).toBe(false);

    const awaiting = stateEvents().filter(e => e.detail?.state === 'awaiting-interaction');
    expect(awaiting.length).toBe(1);

    window.dispatchEvent(new Event('pointerdown'));
    await speakPromise;

    expect(attempts).toBe(2);
    expect(stateEvents().filter(e => e.detail?.state === 'awaiting-interaction').length).toBe(1);
  });

  it('browser speech fails → state=failed + error event (no silent fallback)', async () => {
    const synth = makeSynthStub({
      voices: [{ name: 'Carmit', lang: 'he-IL' }],
      speakImpl: (utt) => {
        queueMicrotask(() => {
          if (typeof utt.onerror === 'function') utt.onerror({ error: 'language-unavailable' });
        });
      },
    });
    globalThis.speechSynthesis = synth;

    const tts = await loadTts();

    await expect(tts.speak('שלום')).resolves.toBeUndefined();

    expect(tts.audioState).toBe('failed');
    const failed = stateEvents().filter(e => e.detail?.state === 'failed');
    expect(failed.length).toBeGreaterThanOrEqual(1);
    expect(errorEvents().length).toBeGreaterThanOrEqual(1);
  });

  it('watchdog: utterance that never ends resolves as failure instead of hanging', async () => {
    vi.useFakeTimers();
    // קול רשת אופליין ב-Chrome: speak() נקרא אבל לא onend ולא onerror.
    const synth = makeSynthStub({
      voices: [{ name: 'Google עברית', lang: 'he-IL', localService: false }],
      speakImpl: () => {},
    });
    globalThis.speechSynthesis = synth;

    const tts = await loadTts();

    const speakPromise = tts.speak('שלום');
    await vi.advanceTimersByTimeAsync(20_000);
    await vi.runAllTimersAsync();

    await expect(speakPromise).resolves.toBeUndefined();
    expect(tts.audioState).toBe('failed');
    const timeoutError = errorEvents().some(e => String(e.detail?.reason).includes('utterance-timeout'));
    expect(timeoutError).toBe(true);
  });

  it('audioState transitions idle → ready on success', async () => {
    const synth = makeSynthStub({ voices: [{ name: 'Carmit', lang: 'he-IL' }] });
    globalThis.speechSynthesis = synth;

    const tts = await loadTts();

    expect(['idle', 'ready']).toContain(tts.audioState);

    await tts.speak('שלום');
    expect(tts.audioState).toBe('ready');

    const sequence = stateEvents().map(e => e.detail?.state);
    expect(sequence).toContain('ready');
  });

  it('speakNikud → syllable at natural rate then vowel sound at slow rate', async () => {
    const synth = makeSynthStub({ voices: [{ name: 'Carmit', lang: 'he-IL' }] });
    globalThis.speechSynthesis = synth;

    const tts = await loadTts();
    tts.setRate(0.9);
    tts.setNikudEmphasis({ rate: 0.5 });

    await tts.speakNikud('מ', 'ָ');

    expect(synth._speakCalls).toHaveLength(2);
    // השלב הראשון - ההברה עם הניקוד - בקצב הרגיל.
    expect(synth._speakCalls[0].text).toBe('מָ');
    expect(synth._speakCalls[0].rate).toBe(0.9);
    // השלב השני - צליל התנועה - בקצב האיטי.
    expect(synth._speakCalls[1].text).toBe('אָה');
    expect(synth._speakCalls[1].rate).toBe(0.5);
  });

  it('speakNikud → unknown nikud falls back to single syllable utterance', async () => {
    const synth = makeSynthStub({ voices: [{ name: 'Carmit', lang: 'he-IL' }] });
    globalThis.speechSynthesis = synth;

    const tts = await loadTts();

    // 'ַ' (פתח) לא קיים ב-mock שמכיל רק kamatz/holam - נצפה לשלב יחיד.
    await tts.speakNikud('מ', 'ַ');

    expect(synth._speakCalls).toHaveLength(1);
    expect(synth._speakCalls[0].text).toBe('מַ');
  });

  it('per-item rate override does not leak to the global rate', async () => {
    const synth = makeSynthStub({ voices: [{ name: 'Carmit', lang: 'he-IL' }] });
    globalThis.speechSynthesis = synth;

    const tts = await loadTts();
    tts.setRate(0.9);
    tts.setNikudEmphasis({ rate: 0.5 });

    await tts.speakNikud('מ', 'ָ');
    await tts.speak('שלום');

    const last = synth._speakCalls[synth._speakCalls.length - 1];
    expect(last.text).toBe('שלום');
    expect(last.rate).toBe(0.9);
  });

  it('cancel() leaves state machine consistent and drains queued speaks', async () => {
    const synth = makeSynthStub({
      voices: [{ name: 'Carmit', lang: 'he-IL' }],
      // אל תפתור אוטומטית; נמתין עד cancel.
      speakImpl: () => {},
    });
    globalThis.speechSynthesis = synth;

    const tts = await loadTts();

    const p1 = tts.speak('one');
    const p2 = tts.speak('two');
    const p3 = tts.speak('three');

    await new Promise(r => setTimeout(r, 0));

    tts.cancel();

    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('cancel did not drain in-flight speak')), 250));
    await expect(Promise.race([Promise.all([p1, p2, p3]), timeout])).resolves.toEqual([undefined, undefined, undefined]);
    expect(synth.cancel).toHaveBeenCalledTimes(1);

    expect(['idle', 'ready']).toContain(tts.audioState);

    // speak שני אחרי cancel חייב לרוץ נקי - אחרת _speaking נשאר תקוע ב-true.
    let nextResolved = false;
    synth.speak = vi.fn((utt) => {
      queueMicrotask(() => { if (typeof utt.onend === 'function') utt.onend(); });
    });

    const nextTimeout = new Promise((_, reject) => setTimeout(() => reject(new Error('post-cancel speak did not run')), 250));
    await Promise.race([
      tts.speak('after-cancel').then(() => { nextResolved = true; }),
      nextTimeout,
    ]).catch(() => {});
    expect(nextResolved).toBe(true);
  });
});
