import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// voice-recorder.js uses MediaRecorder and navigator.mediaDevices at call time.
// Provide mocks via vi.stubGlobal before each test.

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeMockStream() {
  return {
    getTracks: vi.fn(() => [{ stop: vi.fn() }]),
  };
}

/**
 * Build a mock MediaRecorder class.
 *
 * @param {object} opts
 * @param {string[]} [opts.supported]     — mime types to report as supported
 * @param {boolean}  [opts.autoStop]      — if true, calling stop() fires onstop immediately
 */
function makeMockMediaRecorder({ supported = ['audio/webm'], autoStop = true } = {}) {
  const instances = [];

  class MockMediaRecorder {
    constructor(stream, options) {
      this.stream    = stream;
      this.options   = options;
      this.state     = 'inactive';
      this.mimeType  = options?.mimeType ?? 'audio/webm';
      this.ondataavailable = null;
      this.onstop    = null;
      this.onerror   = null;
      instances.push(this);
    }

    start(timeslice) {
      this.state = 'recording';
      // Simulate a data chunk arriving
      Promise.resolve().then(() => {
        this.ondataavailable?.({ data: { size: 10 } });
      });
    }

    stop() {
      this.state = 'inactive';
      if (autoStop) {
        Promise.resolve().then(() => this.onstop?.());
      }
    }

    static isTypeSupported(type) {
      return supported.includes(type);
    }
  }

  MockMediaRecorder.instances = instances;
  return MockMediaRecorder;
}

// ── isVoiceRecordingSupported ─────────────────────────────────────────────────

describe('isVoiceRecordingSupported', () => {
  it('returns true when both MediaRecorder and getUserMedia are available', async () => {
    vi.stubGlobal('MediaRecorder', makeMockMediaRecorder());
    vi.stubGlobal('navigator', {
      mediaDevices: { getUserMedia: vi.fn() },
    });

    const { isVoiceRecordingSupported } = await import('../audio/voice-recorder.js');
    expect(isVoiceRecordingSupported()).toBe(true);
  });

  it('returns false when MediaRecorder is absent', async () => {
    vi.stubGlobal('navigator', {
      mediaDevices: { getUserMedia: vi.fn() },
    });
    // no MediaRecorder stubbed

    const { isVoiceRecordingSupported } = await import('../audio/voice-recorder.js');
    expect(isVoiceRecordingSupported()).toBe(false);
  });

  it('returns false when getUserMedia is absent', async () => {
    vi.stubGlobal('MediaRecorder', makeMockMediaRecorder());
    vi.stubGlobal('navigator', { mediaDevices: {} }); // no getUserMedia

    const { isVoiceRecordingSupported } = await import('../audio/voice-recorder.js');
    expect(isVoiceRecordingSupported()).toBe(false);
  });

  it('returns false when navigator.mediaDevices is absent', async () => {
    vi.stubGlobal('MediaRecorder', makeMockMediaRecorder());
    vi.stubGlobal('navigator', {});

    const { isVoiceRecordingSupported } = await import('../audio/voice-recorder.js');
    expect(isVoiceRecordingSupported()).toBe(false);
  });
});

// ── createVoiceRecorder ───────────────────────────────────────────────────────

describe('createVoiceRecorder — initial state', () => {
  it('isActive() is false before start()', async () => {
    vi.stubGlobal('MediaRecorder', makeMockMediaRecorder());
    vi.stubGlobal('navigator', {
      mediaDevices: { getUserMedia: vi.fn().mockResolvedValue(makeMockStream()) },
    });

    const { createVoiceRecorder } = await import('../audio/voice-recorder.js');
    const rec = createVoiceRecorder();
    expect(rec.isActive()).toBe(false);
  });
});

describe('createVoiceRecorder — start / stop', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('start() calls getUserMedia and transitions to recording state', async () => {
    const MockMR   = makeMockMediaRecorder();
    const stream   = makeMockStream();
    const getUserMedia = vi.fn().mockResolvedValue(stream);

    vi.stubGlobal('MediaRecorder', MockMR);
    vi.stubGlobal('navigator', { mediaDevices: { getUserMedia } });

    const { createVoiceRecorder } = await import('../audio/voice-recorder.js');
    const rec = createVoiceRecorder();

    await rec.start();

    expect(getUserMedia).toHaveBeenCalledWith({ audio: true, video: false });
    expect(rec.isActive()).toBe(true);
  });

  it('stop() resolves with a Blob', async () => {
    const MockMR = makeMockMediaRecorder({ autoStop: true });
    const stream = makeMockStream();

    vi.stubGlobal('MediaRecorder', MockMR);
    vi.stubGlobal('Blob', class MockBlob {
      constructor(parts, opts) { this.parts = parts; this.type = opts?.type ?? ''; }
    });
    vi.stubGlobal('navigator', {
      mediaDevices: { getUserMedia: vi.fn().mockResolvedValue(stream) },
    });

    const { createVoiceRecorder } = await import('../audio/voice-recorder.js');
    const rec = createVoiceRecorder();
    await rec.start();
    const blob = await rec.stop();

    expect(blob).toBeDefined();
    expect(blob.constructor.name).toBe('MockBlob');
  });

  it('isActive() returns false after stop()', async () => {
    const MockMR = makeMockMediaRecorder({ autoStop: true });
    const stream = makeMockStream();

    vi.stubGlobal('MediaRecorder', MockMR);
    vi.stubGlobal('Blob', class MockBlob {
      constructor(parts, opts) { this.parts = parts; this.type = opts?.type ?? ''; }
    });
    vi.stubGlobal('navigator', {
      mediaDevices: { getUserMedia: vi.fn().mockResolvedValue(stream) },
    });

    const { createVoiceRecorder } = await import('../audio/voice-recorder.js');
    const rec = createVoiceRecorder();
    await rec.start();
    await rec.stop();

    expect(rec.isActive()).toBe(false);
  });

  it('stop() rejects when not recording', async () => {
    vi.stubGlobal('MediaRecorder', makeMockMediaRecorder());
    vi.stubGlobal('navigator', {
      mediaDevices: { getUserMedia: vi.fn() },
    });

    const { createVoiceRecorder } = await import('../audio/voice-recorder.js');
    const rec = createVoiceRecorder();

    await expect(rec.stop()).rejects.toThrow('[voice-recorder] not recording');
  });
});

describe('createVoiceRecorder — cancel', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('cancel() does not throw when not recording', async () => {
    vi.stubGlobal('MediaRecorder', makeMockMediaRecorder());
    vi.stubGlobal('navigator', {
      mediaDevices: { getUserMedia: vi.fn() },
    });

    const { createVoiceRecorder } = await import('../audio/voice-recorder.js');
    const rec = createVoiceRecorder();

    expect(() => rec.cancel()).not.toThrow();
  });

  it('cancel() stops the media stream tracks', async () => {
    const MockMR = makeMockMediaRecorder({ autoStop: false });
    const trackStop = vi.fn();
    const stream = { getTracks: vi.fn(() => [{ stop: trackStop }]) };

    vi.stubGlobal('MediaRecorder', MockMR);
    vi.stubGlobal('navigator', {
      mediaDevices: { getUserMedia: vi.fn().mockResolvedValue(stream) },
    });

    const { createVoiceRecorder } = await import('../audio/voice-recorder.js');
    const rec = createVoiceRecorder();
    await rec.start();
    rec.cancel();

    expect(trackStop).toHaveBeenCalled();
    expect(rec.isActive()).toBe(false);
  });

  it('start() is idempotent while already recording', async () => {
    const MockMR = makeMockMediaRecorder({ autoStop: false });
    const getUserMedia = vi.fn().mockResolvedValue(makeMockStream());

    vi.stubGlobal('MediaRecorder', MockMR);
    vi.stubGlobal('navigator', { mediaDevices: { getUserMedia } });

    const { createVoiceRecorder } = await import('../audio/voice-recorder.js');
    const rec = createVoiceRecorder();
    await rec.start();
    await rec.start(); // second call while already recording

    // getUserMedia should only be called once
    expect(getUserMedia).toHaveBeenCalledOnce();
  });
});

// ── MIME type selection ───────────────────────────────────────────────────────

describe('createVoiceRecorder — MIME type selection', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('uses the first supported MIME type', async () => {
    const MockMR = makeMockMediaRecorder({ supported: ['audio/ogg;codecs=opus'], autoStop: true });
    const stream = makeMockStream();

    vi.stubGlobal('MediaRecorder', MockMR);
    vi.stubGlobal('Blob', class MockBlob {
      constructor(parts, opts) { this.parts = parts; this.type = opts?.type ?? ''; }
    });
    vi.stubGlobal('navigator', {
      mediaDevices: { getUserMedia: vi.fn().mockResolvedValue(stream) },
    });

    const { createVoiceRecorder } = await import('../audio/voice-recorder.js');
    const rec = createVoiceRecorder();
    await rec.start();

    const [instance] = MockMR.instances;
    expect(instance.options?.mimeType).toBe('audio/ogg;codecs=opus');
  });

  it('passes no mimeType option when none are supported', async () => {
    const MockMR = makeMockMediaRecorder({ supported: [], autoStop: true });
    const stream = makeMockStream();

    vi.stubGlobal('MediaRecorder', MockMR);
    vi.stubGlobal('Blob', class MockBlob {
      constructor(parts, opts) { this.parts = parts; this.type = opts?.type ?? ''; }
    });
    vi.stubGlobal('navigator', {
      mediaDevices: { getUserMedia: vi.fn().mockResolvedValue(stream) },
    });

    const { createVoiceRecorder } = await import('../audio/voice-recorder.js');
    const rec = createVoiceRecorder();
    await rec.start();

    const [instance] = MockMR.instances;
    // When _preferredMimeType returns '' the opts object should be empty
    expect(instance.options?.mimeType).toBeFalsy();
  });
});
