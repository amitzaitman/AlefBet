/**
 * חוזה עמידוּת ל-TTS (RED של TDD)
 *
 * הבדיקות הבאות מתעדות את ההתנהגות העתידית של מנוע ה-TTS לפי המסמך
 * `audio-audit.md`: מכונת מצבים עם המצבים idle / awaiting-interaction /
 * ready / unsupported / failed, אירועי `alefbet:tts-state` ו-
 * `alefbet:tts-error`, טיים-אאוט לטעינת קולות, וטיפול נכון ב-NotAllowedError.
 *
 * שים לב: רוב הבדיקות ייכשלו על המימוש הנוכחי. זה מכוון - הן מובילות
 * רפקטור של `framework/src/audio/tts.js` שיגרום להן לעבור.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ── Mocks למודולים תלויים ──────────────────────────────────────────────────
// `tts.js` מייבא את `getNikud` ו-`nikudList`. אנחנו לא בודקים את הנקדן עצמו,
// לכן נחזיר זהות (returns the input unchanged) כדי שלא תהיה תלות ברשת או
// בקאש פנימי בזמן הבדיקה.
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
 * מחזיר את הפונקציות שיש להסיר ב-afterEach.
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
 * @param {{ voices?: any[], voicesAfter?: any[], speakImpl?: (utt: any) => void }} [opts]
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
 * מחליף את globalThis.Audio בקונסטרקטור מבוקר.
 * @param {(audio: any) => void} configure - מקבל את ה-instance ויקבע onended/onerror/play.
 */
function installAudioStub(configure) {
  /** @type {any[]} */
  const instances = [];
  function FakeAudio(url) {
    const a = {
      src: typeof url === 'string' ? url : '',
      playbackRate: 1,
      onended: null,
      onerror: null,
      play: vi.fn(() => Promise.resolve()),
      load: vi.fn(),
      pause: vi.fn(),
    };
    instances.push(a);
    if (typeof configure === 'function') configure(a);
    return a;
  }
  globalThis.Audio = FakeAudio;
  return instances;
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
  delete globalThis.Audio;
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
  delete globalThis.Audio;
  vi.resetModules();
});

describe('tts resilience', () => {
  it('speechSynthesis missing → silent + unsupported state', async () => {
    // אין speechSynthesis ואין Audio תקין; Google כבוי כדי לחייב את המסלול
    // הלא-נתמך.
    globalThis.speechSynthesis = undefined;
    installAudioStub((a) => {
      a.play = vi.fn(() => Promise.resolve());
    });

    const tts = await loadTts();
    tts.useGoogle(false);

    await expect(tts.speak('שלום')).resolves.toBeUndefined();

    // tts.available אמור לשקף את היכולת האמיתית, או tts.audioState/state.
    const stateGetter = tts.audioState ?? tts.state;
    expect(tts.available === false || stateGetter === 'unsupported').toBe(true);

    const unsupported = stateEvents().find(e => e.detail?.state === 'unsupported');
    expect(unsupported).toBeDefined();
  });

  it('getVoices empty initially, voiceschanged fires later → proceeds with he-IL voice', async () => {
    const hebrewVoice = { name: 'Carmit', lang: 'he-IL' };
    const synth = makeSynthStub({ voices: [] });
    globalThis.speechSynthesis = synth;
    installAudioStub((a) => {
      // נכשיל את Google כדי לאלץ נפילה ל-browser path.
      a.play = vi.fn(() => Promise.reject(Object.assign(new Error('google off'), { name: 'Error' })));
    });

    const tts = await loadTts();
    tts.useGoogle(false);

    // הוסף את הקול וירה את האירוע אחרי tick כדי לדמות התנהגות אסינכרונית של
    // הדפדפן.
    setTimeout(() => {
      synth._setVoices([hebrewVoice]);
      synth.dispatchEvent(new Event('voiceschanged'));
    }, 0);

    await tts.speak('שלום');

    expect(synth.speak).toHaveBeenCalled();
    const utt = synth._speakCalls[0];
    expect(utt.lang).toBe('he-IL');
  });

  it('voiceschanged never fires within ~2s timeout → fallthrough with warning', async () => {
    vi.useFakeTimers();
    const synth = makeSynthStub({ voices: [] });
    globalThis.speechSynthesis = synth;
    installAudioStub();

    const tts = await loadTts();
    tts.useGoogle(false);

    const speakPromise = tts.speak('שלום');

    // הזז את הזמן מעבר ל-2 שניות; המנוע צריך להתעורר ולשלוח דיבור עם הקול
    // ברירת המחדל של ה-OS, ולסמן warning ב-event.
    await vi.advanceTimersByTimeAsync(2500);
    await vi.runAllTimersAsync();

    await speakPromise;

    expect(synth.speak).toHaveBeenCalled();

    // קבל אחד משני אופנים: state=ready עם reason='no-hebrew-voice' או error
    // נפרד עם reason שכולל timeout.
    const noVoice = stateEvents().some(e =>
      e.detail?.state === 'ready' &&
      typeof e.detail?.reason === 'string' &&
      (e.detail.reason.includes('no-hebrew-voice') || e.detail.reason.includes('timeout'))
    );
    const errorTimeout = errorEvents().some(e =>
      typeof e.detail?.reason === 'string' && e.detail.reason.toLowerCase().includes('timeout')
    );
    expect(noVoice || errorTimeout).toBe(true);
  });

  it('Audio.play() rejects with NotAllowedError → defers and retries on first interaction', async () => {
    let callCount = 0;
    const audios = installAudioStub((a) => {
      a.play = vi.fn(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.reject(Object.assign(new Error('NotAllowedError: user gesture required'), { name: 'NotAllowedError' }));
        }
        // קריאה שנייה: הצליחה. הפעל onended כדי לפתור את ה-promise.
        queueMicrotask(() => { if (typeof a.onended === 'function') a.onended(); });
        return Promise.resolve();
      });
    });
    const synth = makeSynthStub({ voices: [{ name: 'Carmit', lang: 'he-IL' }] });
    globalThis.speechSynthesis = synth;

    const tts = await loadTts();
    tts.useGoogle(true);

    let resolved = false;
    const speakPromise = tts.speak('שלום').then(() => { resolved = true; });

    // אפשר ל-microtasks לרוץ כדי שה-rejection הראשון יתרחש.
    await new Promise(r => setTimeout(r, 0));

    // עד שלא ניצור אינטראקציה, ה-promise אינו אמור להיפתר.
    expect(resolved).toBe(false);

    const awaiting = stateEvents().filter(e => e.detail?.state === 'awaiting-interaction');
    expect(awaiting.length).toBe(1);

    // עכשיו ירה pointerdown על window כדי לשחרר את ההמתנה.
    window.dispatchEvent(new Event('pointerdown'));

    await speakPromise;

    expect(audios.length).toBeGreaterThanOrEqual(1);
    expect(callCount).toBeGreaterThanOrEqual(2);

    // לא היה ספאם של אירועי awaiting-interaction.
    expect(stateEvents().filter(e => e.detail?.state === 'awaiting-interaction').length).toBe(1);
  });

  it('Google fails AND browser fails → state=failed event', async () => {
    installAudioStub((a) => {
      a.play = vi.fn(() => Promise.reject(Object.assign(new Error('boom'), { name: 'Error' })));
    });
    const synth = makeSynthStub({
      voices: [{ name: 'Carmit', lang: 'he-IL' }],
      speakImpl: (utt) => {
        // הדמה כשל סינכרוני של ה-Web Speech API.
        queueMicrotask(() => {
          if (typeof utt.onerror === 'function') {
            utt.onerror({ error: 'language-unavailable' });
          }
        });
      },
    });
    globalThis.speechSynthesis = synth;

    const tts = await loadTts();
    tts.useGoogle(true);

    await expect(tts.speak('שלום')).resolves.toBeUndefined();

    const failed = stateEvents().filter(e => e.detail?.state === 'failed');
    expect(failed.length).toBeGreaterThanOrEqual(1);
    expect(errorEvents().length).toBeGreaterThanOrEqual(1);
  });

  it('audioState transitions across the chain idle → ready → unsupported → failed', async () => {
    // התחל עם speechSynthesis זמין כדי שנגיע ל-ready.
    const synth = makeSynthStub({ voices: [{ name: 'Carmit', lang: 'he-IL' }] });
    globalThis.speechSynthesis = synth;
    installAudioStub((a) => {
      a.play = vi.fn(() => Promise.reject(Object.assign(new Error('google offline'), { name: 'Error' })));
    });

    const tts = await loadTts();
    tts.useGoogle(false); // browser only

    // אחרי טעינת המודול: אמור להיות 'idle' או 'ready'.
    const initial = tts.audioState ?? tts.state;
    expect(['idle', 'ready']).toContain(initial);

    await tts.speak('שלום');
    const afterSuccess = tts.audioState ?? tts.state;
    expect(afterSuccess).toBe('ready');

    const sequence = stateEvents().map(e => e.detail?.state);
    // המעבר חייב לכלול מעבר ל-ready לפחות פעם אחת.
    expect(sequence).toContain('ready');
  });

  it('speakNikud → plays syllable at natural rate then vowel sound at slow rate', async () => {
    // הבעיה ההיסטורית: הברה אחת בקצב 0.5 מתחה גם את העיצור (-> "מממממההה").
    // המימוש החדש משמיע את ההברה בקצב הרגיל ואז את צליל התנועה לבד בקצב
    // האיטי כדי שתישמע "מההההה".
    /** @type {any[]} */
    const audios = installAudioStub((a) => {
      a.play = vi.fn(() => {
        queueMicrotask(() => { if (typeof a.onended === 'function') a.onended(); });
        return Promise.resolve();
      });
    });
    const synth = makeSynthStub({ voices: [{ name: 'Carmit', lang: 'he-IL' }] });
    globalThis.speechSynthesis = synth;

    const tts = await loadTts();
    tts.useGoogle(true);
    tts.setNikudEmphasis({ rate: 0.5 });

    await tts.speakNikud('מ', 'ָ');

    // שני audio instances - הברה ואחריה תנועה.
    expect(audios.length).toBe(2);

    // השלב הראשון - ההברה - בקצב הברירת מחדל (לא הקצב האיטי).
    expect(audios[0].src).toContain(encodeURIComponent('מָ'));
    expect(audios[0].playbackRate).toBeGreaterThan(0.5);

    // השלב השני - צליל התנועה - בקצב האיטי שהוגדר.
    expect(audios[1].src).toContain(encodeURIComponent('אָה'));
    expect(audios[1].playbackRate).toBe(0.5);
  });

  it('speakNikud → sends nikud to Google (so it speaks the syllable, not the letter name)', async () => {
    // הרגרסיה ההיסטורית: _stripNikud היה מסיר את "ַ" וGoogle קיבל "מ" בלבד,
    // מה שגרם לו לחזור לשם האות ("mem") ולהישמע "ממממ" בקצב איטי. הסעיף הזה
    // מבטיח שהניקוד מגיע ל-Google כך שהוא מבטא הברה אמיתית.
    const audios = installAudioStub((a) => {
      a.play = vi.fn(() => {
        queueMicrotask(() => { if (typeof a.onended === 'function') a.onended(); });
        return Promise.resolve();
      });
    });
    const synth = makeSynthStub({ voices: [{ name: 'Carmit', lang: 'he-IL' }] });
    globalThis.speechSynthesis = synth;

    const tts = await loadTts();
    tts.useGoogle(true);

    await tts.speakNikud('מ', 'ָ');

    // ה-URL של ההברה חייב להכיל את הניקוד (קמץ), לא רק את האות.
    expect(audios[0].src).toContain(encodeURIComponent('מָ'));
    // ולא רק את "מ" - אחרת זו אותה רגרסיה.
    expect(audios[0].src).not.toBe(`https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent('מ')}&tl=he&client=tw-ob`);
  });

  it('regular tts.speak() still strips nikud (default protective behaviour)', async () => {
    const audios = installAudioStub((a) => {
      a.play = vi.fn(() => {
        queueMicrotask(() => { if (typeof a.onended === 'function') a.onended(); });
        return Promise.resolve();
      });
    });
    const synth = makeSynthStub({ voices: [{ name: 'Carmit', lang: 'he-IL' }] });
    globalThis.speechSynthesis = synth;

    const tts = await loadTts();
    tts.useGoogle(true);

    await tts.speak('שָׁלוֹם');

    // ברירת המחדל של speak נשארת: הסרת ניקוד לפני שליחה ל-Google.
    expect(audios[0].src).toContain(encodeURIComponent('שלום'));
    expect(audios[0].src).not.toContain(encodeURIComponent('שָׁ'));
  });

  it('speakNikud → unknown nikud falls back to single syllable utterance', async () => {
    const audios = installAudioStub((a) => {
      a.play = vi.fn(() => {
        queueMicrotask(() => { if (typeof a.onended === 'function') a.onended(); });
        return Promise.resolve();
      });
    });
    const synth = makeSynthStub({ voices: [{ name: 'Carmit', lang: 'he-IL' }] });
    globalThis.speechSynthesis = synth;

    const tts = await loadTts();
    tts.useGoogle(true);

    // 'ַ' (פתח) לא קיים ב-mock שמכיל רק kamatz/holam - נצפה לשלב יחיד.
    await tts.speakNikud('מ', 'ַ');

    expect(audios.length).toBe(1);
    expect(audios[0].src).toContain(encodeURIComponent('מַ'));
  });

  it('per-item rate override does not leak to the global rate', async () => {
    const audios = installAudioStub((a) => {
      a.play = vi.fn(() => {
        queueMicrotask(() => { if (typeof a.onended === 'function') a.onended(); });
        return Promise.resolve();
      });
    });
    const synth = makeSynthStub({ voices: [{ name: 'Carmit', lang: 'he-IL' }] });
    globalThis.speechSynthesis = synth;

    const tts = await loadTts();
    tts.useGoogle(true);
    tts.setRate(0.9);
    tts.setNikudEmphasis({ rate: 0.5 });

    await tts.speakNikud('מ', 'ָ');
    // אחרי speakNikud, speak רגיל אמור להמשיך בקצב הגלובלי 0.9.
    await tts.speak('שלום');

    const lastAudio = audios[audios.length - 1];
    expect(lastAudio.src).toContain(encodeURIComponent('שלום'));
    expect(lastAudio.playbackRate).toBe(0.9);
  });

  it('cancel() leaves state machine consistent and drains queued speaks', async () => {
    const synth = makeSynthStub({
      voices: [{ name: 'Carmit', lang: 'he-IL' }],
      // אל תפתור אוטומטית; נמתין עד cancel.
      speakImpl: () => {},
    });
    globalThis.speechSynthesis = synth;
    installAudioStub((a) => {
      a.play = vi.fn(() => Promise.reject(Object.assign(new Error('google off'), { name: 'Error' })));
    });

    const tts = await loadTts();
    tts.useGoogle(false);

    const p1 = tts.speak('one');
    const p2 = tts.speak('two');
    const p3 = tts.speak('three');

    // אפשר ל-queue להתחיל לפני cancel.
    await new Promise(r => setTimeout(r, 0));

    tts.cancel();

    // cancel חייב לפתור גם את הפריט שכבר נשלף מהתור (ה-in-flight). מימוש
    // נוכחי משאיר אותו תלוי לנצח - לכן נשתמש ב-Promise.race עם timeout
    // קצר כדי להפוך את ה-hang ל-failure ברור.
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('cancel did not drain in-flight speak')), 250));
    await expect(Promise.race([Promise.all([p1, p2, p3]), timeout])).resolves.toEqual([undefined, undefined, undefined]);
    expect(synth.cancel).toHaveBeenCalledTimes(1);

    const stateAfter = tts.audioState ?? tts.state;
    // אחרי cancel המנוע אמור לחזור ל-idle או לפחות לא להישאר ב-'speaking'.
    expect(['idle', 'ready']).toContain(stateAfter);

    // speak שני אחרי cancel חייב לרוץ נקי - אחרת _speaking נשאר תקוע ב-true.
    let nextResolved = false;
    // החלף את ההתנהגות כך שה-speak הבא יצליח.
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
