/**
 * חוזה createFeedback
 *
 * רכיב הודעה חי (aria-live) שמשחקי רב-ברירה מציגים בו נכון / טעות / רמז.
 * ההודעה אוטומטית מתרוקנת לאחר זמן מוגדר, ונגשת עם role=status.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../audio/sounds.js', () => ({
  sounds: { correct: vi.fn(), wrong: vi.fn(), cheer: vi.fn(), click: vi.fn() },
}));
vi.mock('../../render/animations.js', () => ({ animate: vi.fn() }));

import { createFeedback } from '../../ui/feedback.js';
import { sounds } from '../../audio/sounds.js';
import { animate } from '../../render/animations.js';
import { mountContainer } from '../helpers.js';

let container;
beforeEach(() => {
  container = mountContainer();
  vi.clearAllMocks();
  vi.useFakeTimers();
});

describe('createFeedback — element setup', () => {
  it('appends an aria-live status element to the container', () => {
    createFeedback(container);
    const el = container.querySelector('.feedback-message');
    expect(el).not.toBeNull();
    expect(el.getAttribute('aria-live')).toBe('polite');
    expect(el.getAttribute('role')).toBe('status');
  });
});

describe('createFeedback — correct', () => {
  it('plays the correct sound, shows Hebrew praise and bounces', () => {
    const fb = createFeedback(container);
    fb.correct();

    const el = container.querySelector('.feedback-message');
    expect(sounds.correct).toHaveBeenCalledOnce();
    expect(el.textContent).toMatch(/כ.*ב.*ד/); // "כל הכבוד" with any nikud
    expect(el.textContent.length).toBeGreaterThan(0);
    expect(el.className).toBe('feedback-message feedback-message--correct');
    expect(animate).toHaveBeenCalledWith(el, 'bounce');
  });

  it('accepts a custom praise message', () => {
    const fb = createFeedback(container);
    fb.correct('מעולה');
    expect(container.querySelector('.feedback-message').textContent).toBe('מעולה');
  });

  it('auto-clears after 1800ms', () => {
    const fb = createFeedback(container);
    fb.correct('מעולה');
    const el = container.querySelector('.feedback-message');

    vi.advanceTimersByTime(1799);
    expect(el.textContent).toBe('מעולה');

    vi.advanceTimersByTime(1);
    expect(el.textContent).toBe('');
    expect(el.className).toBe('feedback-message');
  });
});

describe('createFeedback — wrong', () => {
  it('plays the wrong sound, shows an encouraging retry message and pulses', () => {
    const fb = createFeedback(container);
    fb.wrong();

    const el = container.querySelector('.feedback-message');
    expect(sounds.wrong).toHaveBeenCalledOnce();
    expect(sounds.correct).not.toHaveBeenCalled();
    expect(el.textContent).toMatch(/נ.*ס.*ה.*ש.*ו.*ב/); // "נסה שוב" with any nikud
    expect(el.className).toBe('feedback-message feedback-message--wrong');
    expect(animate).toHaveBeenCalledWith(el, 'pulse');
  });
});

describe('createFeedback — hint', () => {
  it('shows the hint text without playing any sound', () => {
    const fb = createFeedback(container);
    fb.hint('התחל באות א');

    const el = container.querySelector('.feedback-message');
    expect(sounds.correct).not.toHaveBeenCalled();
    expect(sounds.wrong).not.toHaveBeenCalled();
    expect(el.textContent).toBe('התחל באות א');
    expect(el.className).toBe('feedback-message feedback-message--hint');
  });
});

describe('createFeedback — destroy', () => {
  it('removes the element and cancels the pending clear timer', () => {
    const fb = createFeedback(container);
    fb.correct();
    fb.destroy();

    expect(container.querySelector('.feedback-message')).toBeNull();
    // advancing time after destroy should not throw (no stale ref)
    expect(() => vi.advanceTimersByTime(2000)).not.toThrow();
  });
});

describe('createFeedback — consecutive messages', () => {
  it('replacing a message resets the auto-clear timer', () => {
    const fb = createFeedback(container);
    fb.correct('ראשון');
    vi.advanceTimersByTime(1000);
    fb.wrong('שני'); // replaces mid-flight
    const el = container.querySelector('.feedback-message');
    expect(el.textContent).toBe('שני');

    vi.advanceTimersByTime(1000); // 1000ms after wrong() — still within 1800ms
    expect(el.textContent).toBe('שני');

    vi.advanceTimersByTime(900);
    expect(el.textContent).toBe('');
  });
});
