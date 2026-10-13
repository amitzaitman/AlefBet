import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createIDBMock } from './helpers.js';

// voice-store.js caches its database promise at module level,
// so each test loads a fresh module over a fresh IndexedDB stub.
let store;
beforeEach(async () => {
  vi.stubGlobal('indexedDB', createIDBMock());
  vi.resetModules();
  store = await import('../audio/voice-store.js');
});
afterEach(() => { vi.unstubAllGlobals(); });

/** Stubs blob URLs and the <audio> fallback; `onPlay(audio)` decides how playback goes. */
function stubAudio(onPlay) {
  vi.stubGlobal('URL', { createObjectURL: vi.fn(() => 'blob:fake-url'), revokeObjectURL: vi.fn() });
  const pause = vi.fn(), play = vi.fn(onPlay);
  vi.stubGlobal('Audio', class { pause = pause; play() { return play(this); } });
  return { pause, play };
}

describe('saveVoice / loadVoice / deleteVoice', () => {
  it('saves, overwrites and isolates recordings per game; unknown keys load as null', async () => {
    const { saveVoice, loadVoice } = store;
    const blobA = { game: 'A' }, blobB = { game: 'B' }, updated = { version: 2 };
    await saveVoice('game-A', 'welcome', blobA);
    await saveVoice('game-B', 'welcome', blobB);
    expect(await loadVoice('game-A', 'welcome')).toBe(blobA);
    expect(await loadVoice('game-B', 'welcome')).toBe(blobB);
    await saveVoice('game-A', 'welcome', updated);
    expect(await loadVoice('game-A', 'welcome')).toBe(updated);
    expect(await loadVoice('game-A', 'nope')).toBeNull();
  });

  it('deleteVoice removes a stored recording and does not throw for a missing key', async () => {
    await store.saveVoice('game-1', 'to-delete', { size: 10 });
    await store.deleteVoice('game-1', 'to-delete');
    expect(await store.loadVoice('game-1', 'to-delete')).toBeNull();
    await expect(store.deleteVoice('game-1', 'ghost')).resolves.not.toThrow();
  });
});

describe('listVoiceKeys', () => {
  it('lists only the given game\'s keys, without the gameId prefix', async () => {
    expect(await store.listVoiceKeys('game-1')).toEqual([]);
    await store.saveVoice('game-1', 'feedback-correct', {});
    await store.saveVoice('game-1', 'nikud-kamatz', {});
    await store.saveVoice('game-2', 'feedback-correct', {}); // different game — excluded
    expect((await store.listVoiceKeys('game-1')).sort()).toEqual(['feedback-correct', 'nikud-kamatz']);
  });
});

describe('playVoice', () => {
  it('returns false without a recording, true when the <audio> fallback ends, false when play() rejects', async () => {
    expect(await store.playVoice('game-1', 'missing')).toBe(false);
    await store.saveVoice('game-1', 'play-key', { size: 5 });
    stubAudio(audio => { Promise.resolve().then(() => audio.onended?.()); return Promise.resolve(); });
    expect(await store.playVoice('game-1', 'play-key')).toBe(true);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:fake-url');
    stubAudio(() => Promise.reject(new Error('not allowed')));
    expect(await store.playVoice('game-1', 'play-key')).toBe(false);
  });

  it('pauses HTML audio and releases its URL when the round is aborted', async () => {
    await store.saveVoice('round', 'target', { size: 5 });
    const { pause, play } = stubAudio(() => Promise.resolve());
    const controller = new AbortController();
    const pending = store.playVoice('round', 'target', { signal: controller.signal });
    await vi.waitFor(() => expect(play).toHaveBeenCalledOnce());
    controller.abort();
    expect(await pending).toBe(false);
    expect(pause).toHaveBeenCalledOnce();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:fake-url');
  });
});
