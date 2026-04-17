/**
 * חוזה createLocalState
 *
 * עטיפה סביב localStorage שמשדרת לנרשמים בכל שינוי. משמש ב-apps גדולים
 * (למשל passover-cleaning) כמקור אמת עמיד לאיפוס.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createLocalState } from '../../core/local-state.js';

beforeEach(() => {
  localStorage.clear();
});

describe('createLocalState — get', () => {
  it('returns the default value when no data is stored', () => {
    const s = createLocalState('test:empty', { count: 0 });
    expect(s.get()).toEqual({ count: 0 });
  });

  it('returns the parsed value when data exists', () => {
    localStorage.setItem('test:has', JSON.stringify({ count: 7 }));
    const s = createLocalState('test:has', { count: 0 });
    expect(s.get()).toEqual({ count: 7 });
  });

  it('returns the default value when stored JSON is corrupt', () => {
    localStorage.setItem('test:corrupt', '{{{');
    const s = createLocalState('test:corrupt', []);
    expect(s.get()).toEqual([]);
  });
});

describe('createLocalState — set', () => {
  it('persists the new value to localStorage as JSON', () => {
    const s = createLocalState('test:set', []);
    s.set([1, 2, 3]);
    expect(JSON.parse(localStorage.getItem('test:set'))).toEqual([1, 2, 3]);
  });

  it('notifies every subscriber with the new value', () => {
    const s = createLocalState('test:notify', { n: 0 });
    const a = vi.fn();
    const b = vi.fn();
    s.subscribe(a);
    s.subscribe(b);

    s.set({ n: 5 });

    expect(a).toHaveBeenCalledWith({ n: 5 });
    expect(b).toHaveBeenCalledWith({ n: 5 });
  });
});

describe('createLocalState — update', () => {
  it('applies the transform to the current value and persists the result', () => {
    const s = createLocalState('test:update', { count: 1 });
    s.update(v => ({ count: v.count + 1 }));
    expect(s.get()).toEqual({ count: 2 });
  });
});

describe('createLocalState — subscribe', () => {
  it('returns an unsubscribe function that stops further notifications', () => {
    const s = createLocalState('test:unsub', 0);
    const handler = vi.fn();
    const unsubscribe = s.subscribe(handler);

    s.set(1);
    unsubscribe();
    s.set(2);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(1);
  });

  it('unsubscribing one handler does not affect others', () => {
    const s = createLocalState('test:multi', 0);
    const a = vi.fn();
    const b = vi.fn();
    const unsubA = s.subscribe(a);
    s.subscribe(b);

    unsubA();
    s.set(99);

    expect(a).not.toHaveBeenCalled();
    expect(b).toHaveBeenCalledWith(99);
  });
});
