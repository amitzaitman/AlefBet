/**
 * חוזה showCompletionScreen
 *
 * המסך שמסיים כל משחק. מציג ניקוד, כוכבים לפי יחס הצלחה, וכפתור לחזרה
 * על המשחק. הקולבק onReplay נקרא כאשר המשתמש לוחץ על הכפתור.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../audio/sounds.js', () => ({
  sounds: { correct: vi.fn(), wrong: vi.fn(), cheer: vi.fn(), click: vi.fn() },
}));
vi.mock('../../render/animations.js', () => ({ animate: vi.fn() }));

import { showCompletionScreen } from '../../ui/completion-screen.js';
import { sounds } from '../../audio/sounds.js';
import { mountContainer } from '../helpers.js';

let container;
const text = selector => container.querySelector(`.completion-screen__${selector}`).textContent;
beforeEach(() => {
  container = mountContainer();
  vi.clearAllMocks();
});

describe('showCompletionScreen', () => {
  it('replaces the container contents, plays the cheer sound and renders score, title and replay button', () => {
    container.innerHTML = '<div class="previous">round UI</div>';
    showCompletionScreen(container, 3, 5, () => {});
    expect(container.querySelector('.previous')).toBeNull();
    expect(sounds.cheer).toHaveBeenCalledOnce();
    expect(text('score')).toBe('נִיקּוּד: 3 מִתּוֹךְ 5');
    // The title ends with its exclamation mark so RTL draws it on the left.
    expect(text('title')).toMatch(/^[^!]+!$/);
    // "שחק שוב" — matched loosely because the source string carries nikud.
    expect(text('replay')).toMatch(/ש.*ח.*ק.*ש.*ו.*ב/);
  });

  it.each([
    [4, '⭐⭐⭐'], // ratio ≥ 0.8
    [3, '⭐⭐☆'], // 0.5 ≤ ratio < 0.8
    [1, '⭐☆☆'], // ratio < 0.5
  ])('awards stars by success ratio: %i of 5 shows %s', (score, stars) => {
    showCompletionScreen(container, score, 5, () => {});
    expect(text('stars')).toBe(stars);
  });

  it('removes the screen and calls onReplay when the button is clicked', () => {
    const onReplay = vi.fn();
    showCompletionScreen(container, 2, 3, onReplay);
    container.querySelector('.completion-screen__replay').click();
    expect(onReplay).toHaveBeenCalledOnce();
    expect(container.querySelector('.completion-screen')).toBeNull();
  });

  it('offers the game library and a completed-task summary for retry games', () => {
    const replay = vi.fn();
    showCompletionScreen(container, 8, 8, replay, { completionOnly: true, homeUrl: '/games/' });
    expect(text('score')).toBe('הִשְׁלַמְתֶּם 8 מְשִׂימוֹת!');
    expect(container.querySelector('.completion-screen__home').getAttribute('href')).toBe('/games/');
    expect(replay).not.toHaveBeenCalled();
  });

  it('supports a single completed task and an embedded game without a home link', () => {
    showCompletionScreen(container, 1, 1, () => {}, { completionOnly: true, homeUrl: null });
    expect(text('score')).toBe('הִשְׁלַמְתֶּם מְשִׂימָה!');
    expect(container.querySelector('.completion-screen__home')).toBeNull();
  });
});
