/**
 * audio-context - הקונטקסט המשותף ושחרור iOS:
 * unlock מריץ resume ומנגן באפר-אפס; playBlob נכשל ברכות כשאין decode;
 * ensureAudioRunning לא מחזיר קונטקסט קפוא (שורש הבאג של השקט באייפון).
 */
import { describe, it, expect, vi, afterEach } from 'vitest';

const originalCtor = window.AudioContext;
afterEach(() => {
  vi.unstubAllGlobals();
  window.AudioContext = originalCtor;
});

/**
 * מתקין AudioContext מבוקר וטוען מופע נקי של המודול.
 * @param {{ state?: string, resumeWorks?: boolean, withDecode?: boolean, source?: object }} [opts]
 */
async function load({ state = 'suspended', resumeWorks = true, withDecode = false, source } = {}) {
  const calls = { resume: 0, started: 0 };
  class TestAudioContext {
    state = state;
    sampleRate = 44100;
    destination = {};
    resume() {
      calls.resume++;
      if (resumeWorks) this.state = 'running';
      return Promise.resolve();
    }
    createBuffer(ch, len, rate) { return { duration: len / rate, getChannelData: () => new Float32Array(len) }; }
    createBufferSource() {
      if (source) return source;
      const src = { connect() {}, start() { calls.started++; queueMicrotask(() => src.onended?.()); } };
      return src;
    }
  }
  if (withDecode) {
    TestAudioContext.prototype.decodeAudioData = (bytes, resolve) => {
      const buffer = { duration: 0.01 };
      resolve?.(buffer);
      return Promise.resolve(buffer);
    };
  }
  vi.resetModules();
  vi.stubGlobal('AudioContext', TestAudioContext);
  window.AudioContext = TestAudioContext;
  return { mod: await import('../../audio/audio-context.js'), calls };
}

describe('unlockAudioOutput / ensureAudioRunning', () => {
  it.each([true, false])('suspended context, resume works: %s - unlock plays the zero-buffer and neither fakes success', async resumeWorks => {
    const unlocked = await load({ resumeWorks });
    expect(await unlocked.mod.unlockAudioOutput()).toBe(resumeWorks);
    expect(unlocked.calls.resume).toBe(1);
    expect(unlocked.calls.started).toBe(1);
    // ensureAudioRunning מחזיר את הקונטקסט רק כשהוא באמת רץ - קוראים נכשלים בכנות.
    const { mod } = await load({ resumeWorks });
    expect(await mod.ensureAudioRunning()).toBe(resumeWorks ? mod.getAudioContext() : null);
  });
});

describe('playBlob', () => {
  it('plays a decodable blob through Web Audio and resolves true', async () => {
    const { mod, calls } = await load({ state: 'running', withDecode: true });
    expect(await mod.playBlob(new Blob(['bytes'], { type: 'audio/mpeg' }))).toBe(true);
    expect(calls.started).toBe(1);
  });

  it('resolves false without throwing for a missing blob or when decode is unavailable', async () => {
    expect(await (await load({ state: 'running', withDecode: true })).mod.playBlob(null)).toBe(false);
    expect(await (await load({ state: 'running' })).mod.playBlob(new Blob(['bytes']))).toBe(false);
  });

  it('stops and disconnects a playing recording when aborted', async () => {
    const source = { connect: vi.fn(), start: vi.fn(), stop: vi.fn(), disconnect: vi.fn() };
    const { mod } = await load({ state: 'running', withDecode: true, source });
    const controller = new AbortController();
    const pending = mod.playBlob(new Blob(['bytes']), { signal: controller.signal });
    await vi.waitFor(() => expect(source.start).toHaveBeenCalledOnce());
    controller.abort();
    expect(await pending).toBe(false);
    expect(source.stop).toHaveBeenCalledOnce();
    expect(source.disconnect).toHaveBeenCalledOnce();
  });
});
