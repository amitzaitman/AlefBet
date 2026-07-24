/**
 * audio-context - הקונטקסט המשותף ושחרור iOS:
 * unlock מריץ resume ומנגן באפר-אפס; playBlob נכשל ברכות כשאין decode;
 * ensureAudioRunning לא מחזיר קונטקסט קפוא (שורש הבאג של השקט באייפון).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/** בונה מחלקת AudioContext מבוקרת לבדיקה. */
function makeCtxClass({ state = 'suspended', resumeWorks = true, withDecode = false } = {}) {
  const calls = { resume: 0, bufferSourcesStarted: 0 };
  class TestAudioContext {
    constructor() {
      this.state = state;
      this.sampleRate = 44100;
      this.destination = {};
      TestAudioContext.instance = this;
    }
    resume() {
      calls.resume++;
      if (resumeWorks) this.state = 'running';
      return Promise.resolve();
    }
    createBuffer(ch, len, rate) {
      return { duration: len / rate, getChannelData: () => new Float32Array(len) };
    }
    createBufferSource() {
      const src = {
        buffer: null,
        onended: null,
        connect() {},
        start() {
          calls.bufferSourcesStarted++;
          queueMicrotask(() => src.onended?.());
        },
      };
      return src;
    }
  }
  if (withDecode) {
    TestAudioContext.prototype.decodeAudioData = function (bytes, resolve) {
      const buffer = { duration: 0.01 };
      if (resolve) resolve(buffer);
      return Promise.resolve(buffer);
    };
  }
  return { TestAudioContext, calls };
}

/** טוען מופע נקי של המודול אחרי החלפת ה-AudioContext הגלובלי. */
async function loadModule(CtxClass) {
  vi.resetModules();
  vi.stubGlobal('AudioContext', CtxClass);
  window.AudioContext = CtxClass;
  return import('../../audio/audio-context.js');
}

const originalCtor = window.AudioContext;

beforeEach(() => { vi.resetModules(); });
afterEach(() => {
  vi.unstubAllGlobals();
  window.AudioContext = originalCtor;
});

describe('unlockAudioOutput', () => {
  it('resumes a suspended context and plays the canonical zero-buffer', async () => {
    const { TestAudioContext, calls } = makeCtxClass({ state: 'suspended' });
    const mod = await loadModule(TestAudioContext);

    const ok = await mod.unlockAudioOutput();

    expect(ok).toBe(true);
    expect(calls.resume).toBeGreaterThanOrEqual(1);
    expect(calls.bufferSourcesStarted).toBe(1);
  });

  it('reports false when the context stays suspended (no fake success)', async () => {
    const { TestAudioContext } = makeCtxClass({ state: 'suspended', resumeWorks: false });
    const mod = await loadModule(TestAudioContext);
    expect(await mod.unlockAudioOutput()).toBe(false);
  });
});

describe('ensureAudioRunning', () => {
  it('returns the context only when it actually runs', async () => {
    const { TestAudioContext } = makeCtxClass({ state: 'suspended' });
    const mod = await loadModule(TestAudioContext);
    expect(await mod.ensureAudioRunning()).not.toBeNull();
  });

  it('returns null for a context that cannot resume - callers fail honestly', async () => {
    const { TestAudioContext } = makeCtxClass({ state: 'suspended', resumeWorks: false });
    const mod = await loadModule(TestAudioContext);
    expect(await mod.ensureAudioRunning()).toBeNull();
  });
});

describe('playBlob', () => {
  it('plays a decodable blob through Web Audio and resolves true', async () => {
    const { TestAudioContext, calls } = makeCtxClass({ state: 'running', withDecode: true });
    const mod = await loadModule(TestAudioContext);

    const ok = await mod.playBlob(new Blob(['bytes'], { type: 'audio/mpeg' }));

    expect(ok).toBe(true);
    expect(calls.bufferSourcesStarted).toBe(1);
  });

  it('resolves false without throwing when decode is unavailable', async () => {
    const { TestAudioContext } = makeCtxClass({ state: 'running', withDecode: false });
    const mod = await loadModule(TestAudioContext);
    expect(await mod.playBlob(new Blob(['bytes']))).toBe(false);
  });

  it('resolves false for a missing blob', async () => {
    const { TestAudioContext } = makeCtxClass({ state: 'running', withDecode: true });
    const mod = await loadModule(TestAudioContext);
    expect(await mod.playBlob(null)).toBe(false);
  });
});
