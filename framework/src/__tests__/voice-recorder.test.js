import { describe, it, expect, vi, afterEach } from 'vitest';
import { createVoiceRecorder, isVoiceRecordingSupported } from '../../../games/sound-studio/voice-recorder.js';
import { createVoiceRecordButton } from '../../../games/sound-studio/voice-record-button.js';
import { makeMockMediaRecorder, makeMockStream, mountContainer } from './helpers.js';

// The record button lives in the sound studio and reaches the voice store through the runtime bundle.
vi.mock('../../dist/runtime.js', async importOriginal => ({ ...await importOriginal(), playVoice: vi.fn(async () => true), loadVoice: vi.fn(async () => null), saveVoice: vi.fn(), deleteVoice: vi.fn() }));

// voice-recorder.js reads MediaRecorder, Blob and navigator.mediaDevices at call time,
// so one import serves every test and each test stubs the globals it needs.
afterEach(() => { vi.unstubAllGlobals(); vi.clearAllMocks(); });

/**
 * Stubs a working microphone and returns a fresh recorder.
 * @param {{ supported?: string[], autoStop?: boolean, stream?: object }} [opts]
 */
function setup({ supported, autoStop, stream = makeMockStream() } = {}) {
  const MockMR = makeMockMediaRecorder({ supported, autoStop });
  const getUserMedia = vi.fn().mockResolvedValue(stream);
  vi.stubGlobal('MediaRecorder', MockMR);
  vi.stubGlobal('Blob', class MockBlob {
    constructor(parts, opts) { this.parts = parts; this.type = opts?.type ?? ''; }
  });
  vi.stubGlobal('navigator', { mediaDevices: { getUserMedia } });
  return { MockMR, getUserMedia, rec: createVoiceRecorder() };
}

describe('isVoiceRecordingSupported', () => {
  it.each([
    { when: 'MediaRecorder and getUserMedia are available', recorder: true, nav: { mediaDevices: { getUserMedia: vi.fn() } }, expected: true },
    { when: 'MediaRecorder is absent', recorder: false, nav: { mediaDevices: { getUserMedia: vi.fn() } }, expected: false },
    { when: 'getUserMedia is absent', recorder: true, nav: { mediaDevices: {} }, expected: false },
    { when: 'navigator.mediaDevices is absent', recorder: true, nav: {}, expected: false },
  ])('returns $expected when $when', ({ recorder, nav, expected }) => {
    vi.stubGlobal('MediaRecorder', recorder ? makeMockMediaRecorder() : undefined);
    vi.stubGlobal('navigator', nav);
    expect(isVoiceRecordingSupported()).toBe(expected);
  });
});

describe('createVoiceRecorder — start / stop', () => {
  it('isActive() is false before start()', () => {
    expect(setup().rec.isActive()).toBe(false);
  });

  it('start() calls getUserMedia and transitions to recording state', async () => {
    const { rec, getUserMedia } = setup();
    await rec.start();
    expect(getUserMedia).toHaveBeenCalledWith({ audio: true, video: false });
    expect(rec.isActive()).toBe(true);
  });

  it('stop() resolves with a Blob', async () => {
    const { rec } = setup({ autoStop: true });
    await rec.start();
    const blob = await rec.stop();
    expect(blob).toBeDefined();
    expect(blob.constructor.name).toBe('MockBlob');
  });

  it('isActive() returns false after stop()', async () => {
    const { rec } = setup({ autoStop: true });
    await rec.start();
    await rec.stop();
    expect(rec.isActive()).toBe(false);
  });

  it('stop() rejects when not recording', async () => {
    await expect(setup().rec.stop()).rejects.toThrow('[voice-recorder] not recording');
  });
});

describe('createVoiceRecorder — cancel', () => {
  it('cancel() does not throw when not recording', () => {
    const { rec } = setup();
    expect(() => rec.cancel()).not.toThrow();
  });

  it('cancel() stops the media stream tracks', async () => {
    const trackStop = vi.fn();
    const { rec } = setup({ autoStop: false, stream: { getTracks: vi.fn(() => [{ stop: trackStop }]) } });
    await rec.start();
    rec.cancel();
    expect(trackStop).toHaveBeenCalled();
    expect(rec.isActive()).toBe(false);
  });

  it('start() is idempotent while already recording', async () => {
    const { rec, getUserMedia } = setup({ autoStop: false });
    await rec.start();
    await rec.start(); // second call while already recording
    expect(getUserMedia).toHaveBeenCalledOnce();
  });
});

describe('createVoiceRecorder — MIME type selection', () => {
  it('uses the first supported MIME type', async () => {
    const { rec, MockMR } = setup({ supported: ['audio/ogg;codecs=opus'] });
    await rec.start();
    expect(MockMR.instances[0].options?.mimeType).toBe('audio/ogg;codecs=opus');
  });

  it('passes no mimeType option when none are supported', async () => {
    const { rec, MockMR } = setup({ supported: [] });
    await rec.start();
    expect(MockMR.instances[0].options?.mimeType).toBeFalsy();
  });
});

describe('createVoiceRecorder — recording permissions', () => {
  it('stops a late stream after cancellation and allows a new recording', async () => {
    let allow;
    const stop = vi.fn();
    const getUserMedia = vi.fn().mockImplementationOnce(() => new Promise(resolve => { allow = resolve; }))
      .mockResolvedValue({ getTracks: () => [{ stop: vi.fn() }] });
    vi.stubGlobal('navigator', { mediaDevices: { getUserMedia } });
    const MR = makeMockMediaRecorder(); vi.stubGlobal('MediaRecorder', MR);
    const recorder = createVoiceRecorder();
    const pending = recorder.start();
    const rejected = expect(pending).rejects.toMatchObject({ name: 'AbortError' });
    recorder.cancel();
    await recorder.start();
    allow({ getTracks: () => [{ stop }] });
    await rejected;
    expect(stop).toHaveBeenCalledOnce();
    expect(recorder.isActive()).toBe(true);
    expect(MR.instances).toHaveLength(1);
    recorder.cancel();
  });

  it('shares a pending permission request and releases the stream if construction fails', async () => {
    let allow;
    const stop = vi.fn(), getUserMedia = vi.fn(() => new Promise(resolve => { allow = resolve; }));
    vi.stubGlobal('navigator', { mediaDevices: { getUserMedia } });
    vi.stubGlobal('MediaRecorder', class { static isTypeSupported() { return false; } constructor() { throw new Error('unsupported'); } });
    const recorder = createVoiceRecorder();
    const a = recorder.start(), b = recorder.start();
    const results = Promise.allSettled([a, b]);
    expect(getUserMedia).toHaveBeenCalledOnce();
    allow({ getTracks: () => [{ stop }] });
    expect((await results).every(result => result.status === 'rejected')).toBe(true);
    expect(stop).toHaveBeenCalledOnce();
  });
});

describe('voice record button (voice-record-button.js)', () => {
  it('destroying a recording button during permission prompt cannot restart it', async () => {
    vi.useFakeTimers();
    let allow;
    const stop = vi.fn();
    vi.stubGlobal('navigator', { mediaDevices: { getUserMedia: () => new Promise(resolve => { allow = resolve; }) } });
    const MR = makeMockMediaRecorder(); vi.stubGlobal('MediaRecorder', MR);
    const host = mountContainer();
    const button = createVoiceRecordButton(host, { gameId: 'g', voiceKey: 'r' });
    await button.refresh();
    host.querySelector('.ab-voice-btn--record').click();
    button.destroy();
    allow({ getTracks: () => [{ stop }] });
    await vi.advanceTimersByTimeAsync(0);
    expect(stop).toHaveBeenCalledOnce();
    expect(MR.instances).toHaveLength(0);
    expect(vi.getTimerCount()).toBe(0);
    expect(host.querySelector('.ab-voice-btn-wrap')).toBeNull();
  });
});
