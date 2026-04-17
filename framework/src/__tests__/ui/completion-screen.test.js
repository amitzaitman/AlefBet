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
beforeEach(() => {
  container = mountContainer();
  vi.clearAllMocks();
});

describe('showCompletionScreen — rendering', () => {
  it('plays the cheer sound and renders score + total', () => {
    showCompletionScreen(container, 3, 5, () => {});
    expect(sounds.cheer).toHaveBeenCalledOnce();
    expect(container.querySelector('.completion-screen__score').textContent)
      .toBe('נִיקּוּד: 3 מִתּוֹךְ 5');
  });

  it('replaces any pre-existing contents of the container', () => {
    container.innerHTML = '<div class="previous">round UI</div>';
    showCompletionScreen(container, 1, 1, () => {});
    expect(container.querySelector('.previous')).toBeNull();
    expect(container.querySelector('.completion-screen')).not.toBeNull();
  });

  it('renders the replay button with Hebrew label', () => {
    showCompletionScreen(container, 0, 1, () => {});
    // "שחק שוב" — matched loosely because the source string carries nikud.
    expect(container.querySelector('.completion-screen__replay').textContent).toMatch(/ש.*ח.*ק.*ש.*ו.*ב/);
  });
});

describe('showCompletionScreen — star rating', () => {
  it('awards 3 stars when ratio ≥ 0.8', () => {
    showCompletionScreen(container, 4, 5, () => {});
    expect(container.querySelector('.completion-screen__stars').textContent).toBe('⭐⭐⭐');
  });

  it('awards 2 stars when ratio is between 0.5 and 0.8', () => {
    showCompletionScreen(container, 3, 5, () => {});
    expect(container.querySelector('.completion-screen__stars').textContent).toBe('⭐⭐☆');
  });

  it('awards 1 star when ratio < 0.5', () => {
    showCompletionScreen(container, 1, 5, () => {});
    expect(container.querySelector('.completion-screen__stars').textContent).toBe('⭐☆☆');
  });
});

describe('showCompletionScreen — replay', () => {
  it('removes the screen and calls onReplay when the button is clicked', () => {
    const onReplay = vi.fn();
    showCompletionScreen(container, 2, 3, onReplay);

    container.querySelector('.completion-screen__replay').click();

    expect(onReplay).toHaveBeenCalledOnce();
    expect(container.querySelector('.completion-screen')).toBeNull();
  });
});
