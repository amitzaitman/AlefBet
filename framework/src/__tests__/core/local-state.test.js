/**
 * חוזה createLocalState
 *
 * עטיפה סביב localStorage שעמידה לנתונים פגומים ולאחסון מלא. מסך הסיום
 * שומר דרכה את ההתקדמות שדף הבית מציג.
 */
import { it, expect, vi, beforeEach } from 'vitest';
import { createLocalState } from '../../core/local-state.js';

beforeEach(() => { localStorage.clear(); });

it('get returns the default when nothing is stored or the JSON is corrupt, else the parsed value', () => {
  expect(createLocalState('test:empty', { count: 0 }).get()).toEqual({ count: 0 });
  localStorage.setItem('test:has', JSON.stringify({ count: 7 }));
  expect(createLocalState('test:has', { count: 0 }).get()).toEqual({ count: 7 });
  localStorage.setItem('test:corrupt', '{{{');
  expect(createLocalState('test:corrupt', []).get()).toEqual([]);
});

it('update applies the transform to the current value, and set persists JSON', () => {
  const s = createLocalState('test:set', { count: 1 });
  s.update(v => ({ count: v.count + 1 }));
  expect(s.get()).toEqual({ count: 2 });
  s.set([1, 2, 3]);
  expect(JSON.parse(localStorage.getItem('test:set'))).toEqual([1, 2, 3]);
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
