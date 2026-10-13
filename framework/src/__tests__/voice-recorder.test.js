import { describe, it, expect, vi, afterEach } from 'vitest';
import { createVoiceRecorder, isVoiceRecordingSupported } from '../../../games/sound-studio/voice-recorder.js';
import { createVoiceRecordButton } from '../../../games/sound-studio/voice-record-button.js';
import { makeMockMediaRecorder, mountContainer } from './helpers.js';

// The record button lives in the sound studio and reaches the voice store through the runtime bundle.
vi.mock('../../dist/runtime.js', async importOriginal => ({ ...await importOriginal(), playVoice: vi.fn(async () => true), loadVoice: vi.fn(async () => null), saveVoice: vi.fn(), deleteVoice: vi.fn() }));

// voice-recorder.js reads MediaRecorder, Blob and navigator.mediaDevices at call time,
// so one import serves every test and each test stubs the globals it needs.
afterEach(() => { vi.unstubAllGlobals(); vi.clearAllMocks(); });

/** A microphone stream whose single track can be stopped. */
const stream = (stop = vi.fn()) => ({ getTracks: () => [{ stop }] });

/**
 * Stubs a working microphone and returns a fresh recorder.
 * @param {{ supported?: string[], autoStop?: boolean, getUserMedia?: Function, MR?: Function }} [opts]
 */
function setup({ supported, autoStop, getUserMedia = vi.fn().mockResolvedValue(stream()), MR = makeMockMediaRecorder({ supported, autoStop }) } = {}) {
  vi.stubGlobal('MediaRecorder', MR);
  vi.stubGlobal('Blob', class MockBlob {
    constructor(parts, opts) { this.parts = parts; this.type = opts?.type ?? ''; }
  });
  vi.stubGlobal('navigator', { mediaDevices: { getUserMedia } });
  return { MR, getUserMedia, rec: createVoiceRecorder() };
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

describe('createVoiceRecorder', () => {
  it('records from the microphone and stop() resolves with a Blob', async () => {
    const { rec, getUserMedia } = setup();
    expect(rec.isActive()).toBe(false);
    await rec.start();
    expect(getUserMedia).toHaveBeenCalledWith({ audio: true, video: false });
    expect(rec.isActive()).toBe(true);
    const blob = await rec.stop();
    expect(blob.constructor.name).toBe('MockBlob');
    expect(rec.isActive()).toBe(false);
  });

  it('stop() rejects and cancel() does nothing when not recording', async () => {
    const { rec } = setup();
    expect(() => rec.cancel()).not.toThrow();
    await expect(rec.stop()).rejects.toThrow('[voice-recorder] not recording');
  });

  it('start() is idempotent while recording, and cancel() stops the stream tracks', async () => {
    const trackStop = vi.fn();
    const { rec, getUserMedia } = setup({ autoStop: false, getUserMedia: vi.fn().mockResolvedValue(stream(trackStop)) });
    await rec.start();
    await rec.start(); // second call while already recording
    expect(getUserMedia).toHaveBeenCalledOnce();
    rec.cancel();
    expect(trackStop).toHaveBeenCalled();
    expect(rec.isActive()).toBe(false);
  });

  it.each([
    [['audio/ogg;codecs=opus'], 'audio/ogg;codecs=opus'],
    [[], undefined],
  ])('with %j supported, records with mimeType %s and labels the Blob with it', async (supported, mimeType) => {
    const { rec, MR } = setup({ supported });
    await rec.start();
    expect(MR.instances[0].options?.mimeType).toBe(mimeType);
    expect((await rec.stop()).type).toBe(mimeType ?? 'audio/webm');
  });
});

describe('createVoiceRecorder — recording permissions', () => {
  it('stops a late stream after cancellation and allows a new recording', async () => {
    let allow;
    const stop = vi.fn();
    const { rec, MR } = setup({
      getUserMedia: vi.fn().mockImplementationOnce(() => new Promise(resolve => { allow = resolve; })).mockResolvedValue(stream()),
    });
    const rejected = expect(rec.start()).rejects.toMatchObject({ name: 'AbortError' });
    rec.cancel();
    await rec.start();
    allow(stream(stop));
    await rejected;
    expect(stop).toHaveBeenCalledOnce();
    expect(rec.isActive()).toBe(true);
    expect(MR.instances).toHaveLength(1);
    rec.cancel();
  });

  it('shares a pending permission request and releases the stream if construction fails', async () => {
    let allow;
    const stop = vi.fn();
    const { rec, getUserMedia } = setup({
      getUserMedia: vi.fn(() => new Promise(resolve => { allow = resolve; })),
      MR: class { static isTypeSupported() { return false; } constructor() { throw new Error('unsupported'); } },
    });
    const results = Promise.allSettled([rec.start(), rec.start()]);
    expect(getUserMedia).toHaveBeenCalledOnce();
    allow(stream(stop));
    expect((await results).every(result => result.status === 'rejected')).toBe(true);
    expect(stop).toHaveBeenCalledOnce();
  });

  it('destroying a record button during the permission prompt cannot restart it', async () => {
    vi.useFakeTimers();
    let allow;
    const stop = vi.fn();
    const { MR } = setup({ getUserMedia: () => new Promise(resolve => { allow = resolve; }) });
    const host = mountContainer();
    const button = createVoiceRecordButton(host, { gameId: 'g', voiceKey: 'r' });
    await button.refresh();
    host.querySelector('.ab-voice-btn--record').click();
    button.destroy();
    allow(stream(stop));
    await vi.advanceTimersByTimeAsync(0);
    expect(stop).toHaveBeenCalledOnce();
    expect(MR.instances).toHaveLength(0);
    expect(vi.getTimerCount()).toBe(0);
    expect(host.querySelector('.ab-voice-btn-wrap')).toBeNull();
  });
});
