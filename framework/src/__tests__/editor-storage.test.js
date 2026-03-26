import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// editor-storage uses createLocalState (which reads localStorage at call time)
// and also directly calls localStorage.removeItem in clearGameData.
// Stub localStorage before importing the modules.

function makeLocalStorageMock() {
  const store = {};
  return {
    store,
    getItem:    vi.fn(k   => Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null),
    setItem:    vi.fn((k, v) => { store[k] = v; }),
    removeItem: vi.fn(k   => { delete store[k]; }),
  };
}

let lsMock;

beforeEach(() => {
  vi.resetModules();
  lsMock = makeLocalStorageMock();
  vi.stubGlobal('localStorage', lsMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

async function getStorage() {
  return import('../editor/editor-storage.js');
}

async function getGameData() {
  const { GameData } = await import('../editor/game-data.js');
  return GameData;
}

// ── saveGameData ─────────────────────────────────────────────────────────────

describe('saveGameData', () => {
  it('persists GameData to localStorage', async () => {
    const { saveGameData } = await getStorage();
    const GameData = await getGameData();
    const gd = GameData.fromRoundsArray('my-game', [{ id: 'r1', target: 'א' }], { type: 'multiple-choice' });

    saveGameData(gd);

    expect(lsMock.setItem).toHaveBeenCalled();
    const [key, val] = lsMock.setItem.mock.calls[0];
    expect(key).toContain('my-game');
    const parsed = JSON.parse(val);
    expect(parsed.id).toBe('my-game');
    expect(parsed.rounds).toHaveLength(1);
  });
});

// ── loadGameData ─────────────────────────────────────────────────────────────

describe('loadGameData', () => {
  it('returns null when no data is stored', async () => {
    const { loadGameData } = await getStorage();
    expect(loadGameData('unknown-game')).toBeNull();
  });

  it('returns a GameData instance after a save', async () => {
    const { saveGameData, loadGameData } = await getStorage();
    const GameData = await getGameData();
    const gd = GameData.fromRoundsArray('round-trip', [{ id: 'r1', target: 'ב' }]);

    saveGameData(gd);
    const restored = loadGameData('round-trip');

    expect(restored).not.toBeNull();
    expect(restored.id).toBe('round-trip');
    expect(restored.getRound('r1')?.target).toBe('ב');
  });

  it('returns null when stored JSON is corrupt', async () => {
    const { loadGameData } = await getStorage();
    lsMock.store['alefbet.editor.bad-game'] = '{not valid json}}}';

    expect(loadGameData('bad-game')).toBeNull();
  });

  it('restores rounds count correctly', async () => {
    const { saveGameData, loadGameData } = await getStorage();
    const GameData = await getGameData();
    const gd = GameData.fromRoundsArray('count-check', [
      { id: 'a', target: 'א' },
      { id: 'b', target: 'ב' },
      { id: 'ג', target: 'ג' },
    ]);

    saveGameData(gd);
    const loaded = loadGameData('count-check');

    expect(loaded.rounds).toHaveLength(3);
  });
});

// ── clearGameData ─────────────────────────────────────────────────────────────

describe('clearGameData', () => {
  it('removes the stored key from localStorage', async () => {
    const { saveGameData, clearGameData, loadGameData } = await getStorage();
    const GameData = await getGameData();
    const gd = GameData.fromRoundsArray('temp-game', [{ id: 'r1' }]);
    saveGameData(gd);

    clearGameData('temp-game');

    expect(loadGameData('temp-game')).toBeNull();
    expect(lsMock.removeItem).toHaveBeenCalled();
  });

  it('does not throw when called for a game that was never saved', async () => {
    const { clearGameData } = await getStorage();
    expect(() => clearGameData('never-saved')).not.toThrow();
  });
});

// ── exportGameDataAsJSON ──────────────────────────────────────────────────────

describe('exportGameDataAsJSON', () => {
  it('creates a Blob and triggers a download anchor click', async () => {
    // Mock browser download APIs
    const revokeObjectURL = vi.fn();
    const createObjectURL = vi.fn(() => 'blob:mock-url');

    const mockAnchor = { href: '', download: '', click: vi.fn() };
    const createElement = vi.fn(() => mockAnchor);

    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL });
    vi.stubGlobal('Blob', class MockBlob {
      constructor(parts, opts) { this.parts = parts; this.type = opts?.type ?? ''; }
    });
    vi.stubGlobal('document', { createElement });

    const { exportGameDataAsJSON } = await getStorage();
    const GameData = await getGameData();
    const gd = GameData.fromRoundsArray('export-test', [{ id: 'r1', target: 'א' }]);

    exportGameDataAsJSON(gd);

    expect(createObjectURL).toHaveBeenCalled();
    expect(mockAnchor.click).toHaveBeenCalled();
    expect(mockAnchor.download).toContain('export-test');
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });
});
