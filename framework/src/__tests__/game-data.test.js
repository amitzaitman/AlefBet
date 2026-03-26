import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GameData } from '../editor/game-data.js';

const SAMPLE_ROUNDS = [
  { id: 'r1', target: 'א', correct: 'אַרְיֵה', correctEmoji: '🦁' },
  { id: 'r2', target: 'ב', correct: 'בֵּיצָה', correctEmoji: '🥚' },
];

function makeGame() {
  return GameData.fromRoundsArray('test-game', SAMPLE_ROUNDS, { title: 'מבחן', type: 'multiple-choice' });
}

// ── Identity ────────────────────────────────────────────────────────────────

describe('GameData identity', () => {
  it('exposes id from constructor', () => {
    expect(makeGame().id).toBe('test-game');
  });

  it('exposes meta copy (not reference)', () => {
    const gd = makeGame();
    const meta1 = gd.meta;
    const meta2 = gd.meta;
    expect(meta1).not.toBe(meta2);
    expect(meta1).toEqual({ title: 'מבחן', type: 'multiple-choice' });
  });

  it('rounds getter returns a shallow copy', () => {
    const gd = makeGame();
    expect(gd.rounds).not.toBe(gd.rounds); // different array each time
    expect(gd.rounds).toHaveLength(2);
  });
});

// ── Read ─────────────────────────────────────────────────────────────────────

describe('GameData getRound / getRoundIndex', () => {
  it('getRound returns the round object for a known id', () => {
    expect(makeGame().getRound('r1')).toMatchObject({ target: 'א' });
  });

  it('getRound returns null for unknown id', () => {
    expect(makeGame().getRound('nope')).toBeNull();
  });

  it('getRoundIndex returns the zero-based index', () => {
    expect(makeGame().getRoundIndex('r2')).toBe(1);
  });

  it('getRoundIndex returns -1 for unknown id', () => {
    expect(makeGame().getRoundIndex('nope')).toBe(-1);
  });
});

// ── updateRound ──────────────────────────────────────────────────────────────

describe('GameData updateRound', () => {
  it('merges the patch into the existing round', () => {
    const gd = makeGame();
    gd.updateRound('r1', { correct: 'אַרְנָב', correctEmoji: '🐰' });
    expect(gd.getRound('r1')).toMatchObject({ correct: 'אַרְנָב', correctEmoji: '🐰', target: 'א' });
  });

  it('does nothing for an unknown id', () => {
    const gd = makeGame();
    expect(() => gd.updateRound('nope', { target: 'ג' })).not.toThrow();
    expect(gd.rounds).toHaveLength(2);
  });

  it('emits a change event after update', () => {
    const gd = makeGame();
    const handler = vi.fn();
    gd.onChange(handler);
    gd.updateRound('r1', { target: 'ג' });
    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith(gd);
  });
});

// ── addRound ─────────────────────────────────────────────────────────────────

describe('GameData addRound', () => {
  it('appends a blank round when called without afterId', () => {
    const gd = makeGame();
    const newId = gd.addRound();
    expect(gd.rounds).toHaveLength(3);
    expect(gd.rounds[2].id).toBe(newId);
  });

  it('inserts a round immediately after the given id', () => {
    const gd = makeGame();
    const newId = gd.addRound('r1');
    expect(gd.rounds[1].id).toBe(newId);
    expect(gd.rounds[2].id).toBe('r2');
  });

  it('returns a unique id string', () => {
    const gd = makeGame();
    const id1 = gd.addRound();
    const id2 = gd.addRound();
    expect(id1).toBeTruthy();
    expect(id2).toBeTruthy();
    expect(id1).not.toBe(id2);
  });

  it('emits a change event', () => {
    const gd = makeGame();
    const handler = vi.fn();
    gd.onChange(handler);
    gd.addRound();
    expect(handler).toHaveBeenCalledOnce();
  });
});

// ── removeRound ──────────────────────────────────────────────────────────────

describe('GameData removeRound', () => {
  it('removes the round with the given id', () => {
    const gd = makeGame();
    gd.removeRound('r1');
    expect(gd.rounds).toHaveLength(1);
    expect(gd.getRound('r1')).toBeNull();
  });

  it('does NOT remove the last remaining round', () => {
    const gd = GameData.fromRoundsArray('solo', [{ id: 'only' }]);
    gd.removeRound('only');
    expect(gd.rounds).toHaveLength(1);
  });

  it('does nothing for unknown id', () => {
    const gd = makeGame();
    gd.removeRound('nope');
    expect(gd.rounds).toHaveLength(2);
  });

  it('emits a change event when a round is removed', () => {
    const gd = makeGame();
    const handler = vi.fn();
    gd.onChange(handler);
    gd.removeRound('r1');
    expect(handler).toHaveBeenCalledOnce();
  });

  it('does NOT emit when removal is refused (last round)', () => {
    const gd = GameData.fromRoundsArray('solo', [{ id: 'only' }]);
    const handler = vi.fn();
    gd.onChange(handler);
    gd.removeRound('only');
    expect(handler).not.toHaveBeenCalled();
  });
});

// ── moveRound ─────────────────────────────────────────────────────────────────

describe('GameData moveRound', () => {
  it('moves a round to the target index', () => {
    const gd = GameData.fromRoundsArray('mv', [
      { id: 'a' }, { id: 'b' }, { id: 'c' },
    ]);
    gd.moveRound('c', 0);
    expect(gd.rounds.map(r => r.id)).toEqual(['c', 'a', 'b']);
  });

  it('clamps out-of-range index to last position', () => {
    const gd = GameData.fromRoundsArray('mv', [
      { id: 'a' }, { id: 'b' },
    ]);
    gd.moveRound('a', 999);
    expect(gd.rounds.map(r => r.id)).toEqual(['b', 'a']);
  });

  it('does nothing for unknown id', () => {
    const gd = makeGame();
    expect(() => gd.moveRound('nope', 0)).not.toThrow();
    expect(gd.rounds.map(r => r.id)).toEqual(['r1', 'r2']);
  });

  it('emits a change event', () => {
    const gd = makeGame();
    const handler = vi.fn();
    gd.onChange(handler);
    gd.moveRound('r2', 0);
    expect(handler).toHaveBeenCalledOnce();
  });
});

// ── onChange / offChange ─────────────────────────────────────────────────────

describe('GameData onChange / offChange', () => {
  it('calls multiple handlers', () => {
    const gd = makeGame();
    const h1 = vi.fn(), h2 = vi.fn();
    gd.onChange(h1);
    gd.onChange(h2);
    gd.updateRound('r1', { target: 'ג' });
    expect(h1).toHaveBeenCalledOnce();
    expect(h2).toHaveBeenCalledOnce();
  });

  it('unsubscribes via returned function', () => {
    const gd = makeGame();
    const handler = vi.fn();
    const unsub = gd.onChange(handler);
    unsub();
    gd.updateRound('r1', { target: 'ג' });
    expect(handler).not.toHaveBeenCalled();
  });

  it('offChange removes a specific handler without affecting others', () => {
    const gd = makeGame();
    const h1 = vi.fn(), h2 = vi.fn();
    gd.onChange(h1);
    gd.onChange(h2);
    gd.offChange(h1);
    gd.updateRound('r1', { target: 'ג' });
    expect(h1).not.toHaveBeenCalled();
    expect(h2).toHaveBeenCalledOnce();
  });
});

// ── Serialization ────────────────────────────────────────────────────────────

describe('GameData toJSON / fromJSON', () => {
  it('toJSON returns a plain serializable object', () => {
    const json = makeGame().toJSON();
    expect(json).toMatchObject({
      id: 'test-game',
      version: 1,
      meta: { title: 'מבחן', type: 'multiple-choice' },
    });
    expect(json.rounds).toHaveLength(2);
  });

  it('toJSON round-trips through fromJSON', () => {
    const original = makeGame();
    original.updateRound('r1', { correct: 'אַרְנָב' });
    const restored = GameData.fromJSON(original.toJSON());
    expect(restored.getRound('r1')?.correct).toBe('אַרְנָב');
    expect(restored.id).toBe('test-game');
  });

  it('toJSON returns independent copies (mutation does not affect source)', () => {
    const gd = makeGame();
    const json = gd.toJSON();
    json.rounds[0].target = 'zzz';
    expect(gd.getRound('r1')?.target).toBe('א');
  });
});

// ── duplicateRound ────────────────────────────────────────────────────────────

describe('GameData duplicateRound', () => {
  it('inserts a copy immediately after the original', () => {
    const gd = makeGame();
    const newId = gd.duplicateRound('r1');
    expect(gd.rounds).toHaveLength(3);
    expect(gd.rounds[1].id).toBe(newId);
    expect(gd.rounds[2].id).toBe('r2');
  });

  it('copy has all fields of the original but a unique id', () => {
    const gd = makeGame();
    const newId = gd.duplicateRound('r1');
    const copy = gd.getRound(newId);
    expect(copy.target).toBe('א');
    expect(copy.correct).toBe('אַרְיֵה');
    expect(newId).not.toBe('r1');
  });

  it('returns null for unknown id', () => {
    expect(makeGame().duplicateRound('nope')).toBeNull();
  });

  it('emits a change event', () => {
    const gd = makeGame();
    const handler = vi.fn();
    gd.onChange(handler);
    gd.duplicateRound('r1');
    expect(handler).toHaveBeenCalledOnce();
  });
});

// ── undo / redo ───────────────────────────────────────────────────────────────

describe('GameData undo / redo', () => {
  it('canUndo is false before any mutation', () => {
    expect(makeGame().canUndo).toBe(false);
  });

  it('canRedo is false before any undo', () => {
    expect(makeGame().canRedo).toBe(false);
  });

  it('canUndo is true after a mutation', () => {
    const gd = makeGame();
    gd.updateRound('r1', { target: 'ג' });
    expect(gd.canUndo).toBe(true);
  });

  it('undo reverses an updateRound', () => {
    const gd = makeGame();
    gd.updateRound('r1', { target: 'ג' });
    gd.undo();
    expect(gd.getRound('r1')?.target).toBe('א');
  });

  it('redo re-applies the undone change', () => {
    const gd = makeGame();
    gd.updateRound('r1', { target: 'ג' });
    gd.undo();
    gd.redo();
    expect(gd.getRound('r1')?.target).toBe('ג');
  });

  it('canUndo is true after redo', () => {
    const gd = makeGame();
    gd.updateRound('r1', { target: 'ג' });
    gd.undo();
    gd.redo();
    expect(gd.canUndo).toBe(true);
  });

  it('canRedo is false after a new mutation clears the redo stack', () => {
    const gd = makeGame();
    gd.updateRound('r1', { target: 'ג' });
    gd.undo();
    gd.updateRound('r2', { target: 'ד' }); // new mutation
    expect(gd.canRedo).toBe(false);
  });

  it('undo reverses addRound', () => {
    const gd = makeGame();
    gd.addRound();
    gd.undo();
    expect(gd.rounds).toHaveLength(2);
  });

  it('undo reverses removeRound', () => {
    const gd = makeGame();
    gd.removeRound('r1');
    gd.undo();
    expect(gd.rounds).toHaveLength(2);
    expect(gd.getRound('r1')).not.toBeNull();
  });

  it('undo reverses duplicateRound', () => {
    const gd = makeGame();
    gd.duplicateRound('r1');
    gd.undo();
    expect(gd.rounds).toHaveLength(2);
  });

  it('undo emits a change event', () => {
    const gd = makeGame();
    gd.updateRound('r1', { target: 'ג' });
    const handler = vi.fn();
    gd.onChange(handler);
    gd.undo();
    expect(handler).toHaveBeenCalledOnce();
  });

  it('redo emits a change event', () => {
    const gd = makeGame();
    gd.updateRound('r1', { target: 'ג' });
    gd.undo();
    const handler = vi.fn();
    gd.onChange(handler);
    gd.redo();
    expect(handler).toHaveBeenCalledOnce();
  });

  it('undo does nothing if canUndo is false', () => {
    const gd = makeGame();
    expect(() => gd.undo()).not.toThrow();
    expect(gd.rounds).toHaveLength(2);
  });

  it('redo does nothing if canRedo is false', () => {
    const gd = makeGame();
    expect(() => gd.redo()).not.toThrow();
    expect(gd.rounds).toHaveLength(2);
  });

  it('supports multiple undo steps', () => {
    const gd = makeGame();
    gd.updateRound('r1', { target: 'ג' });
    gd.updateRound('r1', { target: 'ד' });
    gd.undo(); // back to 'ג'
    gd.undo(); // back to 'א'
    expect(gd.getRound('r1')?.target).toBe('א');
  });

  it('supports undo + redo chain', () => {
    const gd = makeGame();
    gd.updateRound('r1', { target: 'ג' }); // step 1
    gd.updateRound('r1', { target: 'ד' }); // step 2
    gd.undo(); // undo step 2 → 'ג'
    gd.undo(); // undo step 1 → 'א'
    gd.redo(); // redo step 1 → 'ג'
    expect(gd.getRound('r1')?.target).toBe('ג');
    expect(gd.canRedo).toBe(true);
  });
});

// ── fromRoundsArray ──────────────────────────────────────────────────────────

describe('GameData.fromRoundsArray', () => {
  it('creates a GameData with the supplied rounds', () => {
    const gd = GameData.fromRoundsArray('my-game', SAMPLE_ROUNDS, { type: 'drag-match' });
    expect(gd.rounds).toHaveLength(2);
    expect(gd.meta.type).toBe('drag-match');
  });

  it('assigns generated ids to rounds that lack one', () => {
    const gd = GameData.fromRoundsArray('gen', [{ target: 'א' }, { target: 'ב' }]);
    const [r1, r2] = gd.rounds;
    expect(r1.id).toBeTruthy();
    expect(r2.id).toBeTruthy();
    expect(r1.id).not.toBe(r2.id);
  });

  it('works with an empty rounds array', () => {
    const gd = GameData.fromRoundsArray('empty', [], { type: 'multiple-choice' });
    expect(gd.rounds).toHaveLength(0);
  });
});
