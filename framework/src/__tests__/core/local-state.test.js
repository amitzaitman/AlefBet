/**
 * חוזה createLocalState
 *
 * עטיפה סביב localStorage שעמידה לנתונים פגומים ולאחסון מלא. מסך הסיום
 * שומר דרכה את ההתקדמות שדף הבית מציג.
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
});

describe('createLocalState — update', () => {
  it('applies the transform to the current value and persists the result', () => {
    const s = createLocalState('test:update', { count: 1 });
    s.update(v => ({ count: v.count + 1 }));
    expect(s.get()).toEqual({ count: 2 });
  });
});

it('reports failed persistence and keeps the saved value', () => {
  const s = createLocalState('test:quota', 0);
  s.set(1);
  const fail = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new DOMException('Full', 'QuotaExceededError');
  });
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  try {
    expect(s.update(n => n + 1)).toBe(false);
    expect(s.get()).toBe(1);
    expect(warn).toHaveBeenCalledOnce();
  } finally { fail.mockRestore(); warn.mockRestore(); }
});
