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
import { PRAISE_PHRASES } from '../../data/encouragement.js';
import { mountContainer } from '../helpers.js';

let container;
const message = () => container.querySelector('.feedback-message');
beforeEach(() => {
  container = mountContainer();
  vi.clearAllMocks();
  vi.useFakeTimers();
});

describe('createFeedback', () => {
  it('appends an aria-live status element; correct() plays the sound, shows a praise phrase and bounces', () => {
    const fb = createFeedback(container);
    expect(message().getAttribute('aria-live')).toBe('polite');
    expect(message().getAttribute('role')).toBe('status');
    fb.correct();
    expect(sounds.correct).toHaveBeenCalledOnce();
    // הטקסט הוא "!" + אחד מביטויי השבח המשותפים - לא נניח איזה נבחר.
    expect(message().textContent.startsWith('!')).toBe(true);
    expect(PRAISE_PHRASES).toContain(message().textContent.slice(1));
    expect(message().className).toBe('feedback-message feedback-message--correct');
    expect(animate).toHaveBeenCalledWith(message(), 'bounce');
  });

  it('shows a custom praise message and clears it after 1800ms', () => {
    createFeedback(container).correct('מעולה');
    vi.advanceTimersByTime(1799);
    expect(message().textContent).toBe('מעולה');
    vi.advanceTimersByTime(1);
    expect(message().textContent).toBe('');
    expect(message().className).toBe('feedback-message');
  });

  it('wrong() plays the wrong sound, shows an encouraging retry message and pulses', () => {
    createFeedback(container).wrong();
    expect(sounds.wrong).toHaveBeenCalledOnce();
    expect(sounds.correct).not.toHaveBeenCalled();
    expect(message().textContent).toMatch(/נ.*ס.*ה.*ש.*ו.*ב/); // "נסה שוב" with any nikud
    expect(message().className).toBe('feedback-message feedback-message--wrong');
    expect(animate).toHaveBeenCalledWith(message(), 'pulse');
  });

  it('hint() shows the hint text without playing any sound', () => {
    createFeedback(container).hint('התחל באות א');
    expect(sounds.correct).not.toHaveBeenCalled();
    expect(sounds.wrong).not.toHaveBeenCalled();
    expect(message().textContent).toBe('התחל באות א');
    expect(message().className).toBe('feedback-message feedback-message--hint');
  });

  it('replacing a message resets the auto-clear timer', () => {
    const fb = createFeedback(container);
    fb.correct('ראשון');
    vi.advanceTimersByTime(1000);
    fb.wrong('שני'); // replaces mid-flight
    expect(message().textContent).toBe('שני');
    vi.advanceTimersByTime(1000); // 1000ms after wrong() — still within 1800ms
    expect(message().textContent).toBe('שני');
    vi.advanceTimersByTime(900);
    expect(message().textContent).toBe('');
  });

  it('destroy removes the element and cancels the pending clear timer', () => {
    const fb = createFeedback(container);
    fb.correct();
    fb.destroy();
    expect(message()).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
  });
});
