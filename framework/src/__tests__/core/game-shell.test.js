/**
 * חוזה GameShell
 *
 * GameShell בונה את שלד המשחק בתוך המיכל שסופק ומפיץ אירועי מחזור חיים
 * (start, round, end) דרך EventBus פנימי. כל משחק נסמך על כך שהתבנית קיימת
 * (.game-title / .game-body / .game-footer) ושאירועי lifecycle נורים בזמן הנכון.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GameShell } from '../../core/game-shell.js';
import { mountContainer } from '../helpers.js';

let container;
beforeEach(() => { container = mountContainer(); });

describe('GameShell — DOM scaffold', () => {
  it('renders title, body, footer and a back button into the container; setTitle updates the title', () => {
    const shell = new GameShell(container, { title: 'משחק ניקוד', totalRounds: 5 });
    expect(container.classList.contains('alefbet-game')).toBe(true);
    expect(container.querySelector('.game-title').textContent).toBe('משחק ניקוד');
    expect(container.querySelector('.game-body')).not.toBeNull();
    expect(container.querySelector('.game-footer')).not.toBeNull();
    expect(container.querySelector('.game-back-btn')?.getAttribute('href')).toBe('../../index.html');
    shell.setTitle('b');
    expect(container.querySelector('.game-title').textContent).toBe('b');
  });

  it('omits the back button when homeUrl is explicitly null, and defaults totalRounds to 8', () => {
    const shell = new GameShell(container, { homeUrl: null });
    expect(container.querySelector('.game-back-btn')).toBeNull();
    expect(shell.state.totalRounds).toBe(8);
  });
});

describe('GameShell — lifecycle events', () => {
  it('replacing a game ends it once and cancels its pending work', async () => {
    vi.useFakeTimers();
    const shell = new GameShell(container);
    const end = vi.fn();
    const staleUI = vi.fn();
    shell.on('end', end);
    shell.schedule(staleUI, 100);
    const waiting = shell.delay(200);
    const replacement = new GameShell(container);
    shell.end();
    await vi.runAllTimersAsync();
    expect(await waiting).toBe(false);
    expect(end).toHaveBeenCalledOnce();
    expect(staleUI).not.toHaveBeenCalled();
    expect(shell.nextRound()).toBe(false);
    expect(replacement.ended).toBe(false);
  });

  it('emits "start", then "round" while rounds remain, then "end" instead of "round"; on() chains', () => {
    const shell = new GameShell(container, { totalRounds: 2 });
    const onStart = vi.fn(), onRound = vi.fn(), onEnd = vi.fn();
    expect(shell.on('start', onStart).on('round', onRound).on('end', onEnd)).toBe(shell);
    shell.start(); // → round 1
    expect(onStart).toHaveBeenCalledOnce();
    expect(onStart.mock.calls[0][0].state.currentRound).toBe(1);
    expect(shell.nextRound()).toBe(true); // → round 2
    expect(onRound).toHaveBeenCalledOnce();
    expect(shell.nextRound()).toBe(false); // no more rounds → end
    expect(onRound).toHaveBeenCalledOnce();
    expect(onEnd).toHaveBeenCalledOnce();
    expect(onEnd.mock.calls[0][0]).toMatchObject({ score: 0 });
  });
});
