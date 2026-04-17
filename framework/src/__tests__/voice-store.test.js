import { describe, it, expect, vi, afterEach } from 'vitest';
import { createIDBMock } from './helpers.js';

// voice-store.js has a module-level _dbPromise cache.
// Reset modules before each test to get a fresh cache, then stub indexedDB.

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

// ── saveVoice / loadVoice ─────────────────────────────────────────────────────

describe('saveVoice + loadVoice', () => {
  it('saves and retrieves a blob by gameId + voiceKey', async () => {
    const idb = createIDBMock();
    vi.stubGlobal('indexedDB', idb);

    const { saveVoice, loadVoice } = await import('../audio/voice-store.js');
    const blob = { _type: 'audio/webm', size: 42 };

    await saveVoice('game-1', 'instruction-welcome', blob);
    const result = await loadVoice('game-1', 'instruction-welcome');

    expect(result).toBe(blob);
  });

  it('loadVoice returns null for an unknown key', async () => {
    const idb = createIDBMock();
    vi.stubGlobal('indexedDB', idb);

    const { loadVoice } = await import('../audio/voice-store.js');

    expect(await loadVoice('game-1', 'nope')).toBeNull();
  });

  it('composite key isolates recordings per game', async () => {
    const idb = createIDBMock();
    vi.stubGlobal('indexedDB', idb);

    const { saveVoice, loadVoice } = await import('../audio/voice-store.js');
    const blobA = { game: 'A' };
    const blobB = { game: 'B' };

    await saveVoice('game-A', 'welcome', blobA);
    await saveVoice('game-B', 'welcome', blobB);

    expect(await loadVoice('game-A', 'welcome')).toBe(blobA);
    expect(await loadVoice('game-B', 'welcome')).toBe(blobB);
  });

  it('overwrites an existing recording', async () => {
    const idb = createIDBMock();
    vi.stubGlobal('indexedDB', idb);

    const { saveVoice, loadVoice } = await import('../audio/voice-store.js');
    const old = { version: 1 };
    const updated = { version: 2 };

    await saveVoice('game-1', 'key', old);
    await saveVoice('game-1', 'key', updated);

    expect(await loadVoice('game-1', 'key')).toBe(updated);
  });
});

// ── deleteVoice ───────────────────────────────────────────────────────────────

describe('deleteVoice', () => {
  it('removes a stored recording', async () => {
    const idb = createIDBMock();
    vi.stubGlobal('indexedDB', idb);

    const { saveVoice, loadVoice, deleteVoice } = await import('../audio/voice-store.js');
    const blob = { size: 10 };

    await saveVoice('game-1', 'to-delete', blob);
    await deleteVoice('game-1', 'to-delete');

    expect(await loadVoice('game-1', 'to-delete')).toBeNull();
  });

  it('does not throw when key does not exist', async () => {
    const idb = createIDBMock();
    vi.stubGlobal('indexedDB', idb);

    const { deleteVoice } = await import('../audio/voice-store.js');

    await expect(deleteVoice('game-1', 'ghost')).resolves.not.toThrow();
  });
});

// ── listVoiceKeys ─────────────────────────────────────────────────────────────

describe('listVoiceKeys', () => {
  it('returns keys belonging to the specified game', async () => {
    const idb = createIDBMock();
    vi.stubGlobal('indexedDB', idb);

    const { saveVoice, listVoiceKeys } = await import('../audio/voice-store.js');
    await saveVoice('game-1', 'feedback-correct', {});
    await saveVoice('game-1', 'instruction-welcome', {});
    await saveVoice('game-2', 'feedback-correct', {}); // different game — excluded

    const keys = await listVoiceKeys('game-1');

    expect(keys).toHaveLength(2);
    expect(keys).toContain('feedback-correct');
    expect(keys).toContain('instruction-welcome');
  });

  it('returns an empty array when no recordings exist', async () => {
    const idb = createIDBMock();
    vi.stubGlobal('indexedDB', idb);

    const { listVoiceKeys } = await import('../audio/voice-store.js');

    expect(await listVoiceKeys('empty-game')).toEqual([]);
  });

  it('strips the gameId prefix from returned keys', async () => {
    const idb = createIDBMock();
    vi.stubGlobal('indexedDB', idb);

    const { saveVoice, listVoiceKeys } = await import('../audio/voice-store.js');
    await saveVoice('game-1', 'nikud-kamatz', {});

    const keys = await listVoiceKeys('game-1');

    expect(keys[0]).toBe('nikud-kamatz'); // not 'game-1/nikud-kamatz'
  });
});

// ── hasVoice ──────────────────────────────────────────────────────────────────

describe('hasVoice', () => {
  it('returns true when a recording exists', async () => {
    const idb = createIDBMock();
    vi.stubGlobal('indexedDB', idb);

    const { saveVoice, hasVoice } = await import('../audio/voice-store.js');
    await saveVoice('game-1', 'existing', {});

    expect(await hasVoice('game-1', 'existing')).toBe(true);
  });

  it('returns false when no recording exists', async () => {
    const idb = createIDBMock();
    vi.stubGlobal('indexedDB', idb);

    const { hasVoice } = await import('../audio/voice-store.js');

    expect(await hasVoice('game-1', 'missing')).toBe(false);
  });
});

// ── playVoice ─────────────────────────────────────────────────────────────────

describe('playVoice', () => {
  it('returns false when there is no recording', async () => {
    const idb = createIDBMock();
    vi.stubGlobal('indexedDB', idb);

    const { playVoice } = await import('../audio/voice-store.js');

    expect(await playVoice('game-1', 'missing')).toBe(false);
  });

  it('plays the recording and returns true on success', async () => {
    const idb = createIDBMock();
    vi.stubGlobal('indexedDB', idb);

    // Mock URL and Audio APIs
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:fake-url'),
      revokeObjectURL: vi.fn(),
    });

    let capturedAudio;
    vi.stubGlobal('Audio', class MockAudio {
      constructor(src) {
        this.src = src;
        this.onended = null;
        this.onerror = null;
        capturedAudio = this;
      }
      play() {
        // Simulate successful playback: fire onended on next tick
        Promise.resolve().then(() => this.onended?.());
        return Promise.resolve();
      }
    });

    const { saveVoice, playVoice } = await import('../audio/voice-store.js');
    const blob = { size: 5 };
    await saveVoice('game-1', 'play-key', blob);

    const result = await playVoice('game-1', 'play-key');

    expect(result).toBe(true);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:fake-url');
  });

  it('returns false when audio.play() rejects', async () => {
    const idb = createIDBMock();
    vi.stubGlobal('indexedDB', idb);

    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:fake-url'),
      revokeObjectURL: vi.fn(),
    });

    vi.stubGlobal('Audio', class MockAudio {
      constructor() { this.onended = null; this.onerror = null; }
      play() { return Promise.reject(new Error('not allowed')); }
    });

    const { saveVoice, playVoice } = await import('../audio/voice-store.js');
    await saveVoice('game-1', 'play-key', { size: 5 });

    expect(await playVoice('game-1', 'play-key')).toBe(false);
  });
});
