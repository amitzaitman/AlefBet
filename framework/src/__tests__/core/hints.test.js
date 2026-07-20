/**
 * createHintTracker - מדרג הרמזים של "פידבק בונה, לא שולל":
 * שקט עד hintAfter, רמז עדין עד escalateAfter, ואז עזרה מוגברת.
 */
import { describe, it, expect, vi } from 'vitest';
import { createHintTracker } from '../../core/hints.js';

describe('createHintTracker', () => {
  it('רמות מתקדמות לפי מספר הטעויות', () => {
    const tracker = createHintTracker({ hintAfter: 2, escalateAfter: 4 });
    expect(tracker.level).toBe(0);
    expect(tracker.miss()).toBe(0); // 1
    expect(tracker.miss()).toBe(1); // 2 - רמז
    expect(tracker.miss()).toBe(1); // 3
    expect(tracker.miss()).toBe(2); // 4 - עזרה מוגברת
    expect(tracker.misses).toBe(4);
    expect(tracker.level).toBe(2);
  });

  it('מפעיל קולבקים ברמה המתאימה בלבד', () => {
    const onHint = vi.fn();
    const onEscalate = vi.fn();
    const tracker = createHintTracker({ hintAfter: 1, escalateAfter: 3, onHint, onEscalate });

    tracker.miss(); // רמה 1
    tracker.miss(); // רמה 1
    expect(onHint).toHaveBeenCalledTimes(2);
    expect(onEscalate).not.toHaveBeenCalled();

    tracker.miss(); // רמה 2
    expect(onEscalate).toHaveBeenCalledWith(3);
    expect(onHint).toHaveBeenCalledTimes(2); // לא נקרא שוב ברמה 2
  });

  it('reset מחזיר לסיבוב נקי', () => {
    const tracker = createHintTracker({ hintAfter: 1 });
    tracker.miss();
    expect(tracker.level).toBe(1);
    tracker.reset();
    expect(tracker.level).toBe(0);
    expect(tracker.misses).toBe(0);
  });

  it('ברירות מחדל: רמז אחרי 2, הסלמה אחרי 4', () => {
    const tracker = createHintTracker();
    tracker.miss();
    expect(tracker.level).toBe(0);
    tracker.miss();
    expect(tracker.level).toBe(1);
    tracker.miss();
    tracker.miss();
    expect(tracker.level).toBe(2);
  });
});
