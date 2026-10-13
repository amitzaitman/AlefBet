import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createScope } from '../src/shell/scope.js';
import { Feedback } from '../src/shell/feedback.svelte.js';
import { PRAISE } from '../src/lib/praise.js';
import { HOLD_MS, readingMs } from '../src/lib/reading.js';

const HINT = 'סִפְרוּ אֶת הַמִּשְׁבָּצוֹת הָרֵיקוֹת';

describe('round scope', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('runs scheduled work until it is disposed, then nothing', () => {
    const scope = createScope();
    const early = vi.fn();
    const late = vi.fn();
    const cancelled = vi.fn();
    scope.schedule(early, 100);
    scope.schedule(late, 300);
    scope.schedule(cancelled, 100)();
    vi.advanceTimersByTime(200);
    scope.dispose();
    vi.advanceTimersByTime(500);
    expect(early).toHaveBeenCalledOnce();
    expect(late).not.toHaveBeenCalled();
    expect(cancelled).not.toHaveBeenCalled();
    expect(scope.active()).toBe(false);
    scope.schedule(late, 0);
    vi.advanceTimersByTime(10);
    expect(late).not.toHaveBeenCalled();
  });

  it('tells an awaited pause whether the round is still there', async () => {
    const scope = createScope();
    const done = scope.wait(100);
    vi.advanceTimersByTime(100);
    expect(await done).toBe(true);
    const cut = scope.wait(100);
    scope.dispose();
    expect(await cut).toBe(false);
    expect(await scope.wait(10)).toBe(false);
  });
});

describe('feedback line', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('shows praise or a hint, and clears itself once it has been read', () => {
    const feedback = new Feedback(createScope());
    feedback.correct();
    expect(feedback.tone).toBe('correct');
    // Hebrew puts the exclamation mark at the end of the phrase.
    expect(PRAISE.map(phrase => `${phrase}!`)).toContain(feedback.text);
    feedback.hint(HINT);
    expect(feedback).toMatchObject({ text: HINT, tone: 'hint', count: 2 });
    vi.advanceTimersByTime(readingMs(HINT) + HOLD_MS - 1);
    expect(feedback.text).toBe(HINT);
    vi.advanceTimersByTime(1);
    expect(feedback).toMatchObject({ text: '', tone: '' });
  });

  it('can be cleared at once, and stops clearing when its round is gone', () => {
    const feedback = new Feedback(createScope());
    feedback.hint(HINT);
    feedback.clear();
    expect(feedback).toMatchObject({ text: '', tone: '' });

    const scope = createScope();
    const late = new Feedback(scope);
    late.hint(HINT);
    scope.dispose();
    vi.advanceTimersByTime(20_000);
    expect(late.text).toBe(HINT);
  });
});
