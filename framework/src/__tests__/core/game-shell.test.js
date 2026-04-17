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
  it('renders title, body, footer and a back button into the container', () => {
    new GameShell(container, { title: 'משחק ניקוד', totalRounds: 5 });

    expect(container.classList.contains('alefbet-game')).toBe(true);
    expect(container.querySelector('.game-title').textContent).toBe('משחק ניקוד');
    expect(container.querySelector('.game-body')).not.toBeNull();
    expect(container.querySelector('.game-footer')).not.toBeNull();
    expect(container.querySelector('.game-back-btn')?.getAttribute('href')).toBe('../../index.html');
  });

  it('omits the back button when homeUrl is explicitly null', () => {
    new GameShell(container, { homeUrl: null });
    expect(container.querySelector('.game-back-btn')).toBeNull();
  });

  it('setTitle updates the rendered title', () => {
    const shell = new GameShell(container, { title: 'a' });
    shell.setTitle('b');
    expect(container.querySelector('.game-title').textContent).toBe('b');
  });

  it('defaults totalRounds to 8 when unspecified', () => {
    const shell = new GameShell(container);
    expect(shell.state.totalRounds).toBe(8);
  });
});

describe('GameShell — lifecycle events', () => {
  it('emits "start" with the current state when start() is called', () => {
    const shell = new GameShell(container, { totalRounds: 3 });
    const onStart = vi.fn();
    shell.on('start', onStart);

    shell.start();

    expect(onStart).toHaveBeenCalledOnce();
    expect(onStart.mock.calls[0][0].state.currentRound).toBe(1);
  });

  it('emits "round" when nextRound advances within the game', () => {
    const shell = new GameShell(container, { totalRounds: 3 });
    const onRound = vi.fn();
    shell.on('round', onRound);

    shell.start();           // → round 1
    const more = shell.nextRound(); // → round 2

    expect(more).toBe(true);
    expect(onRound).toHaveBeenCalledOnce();
  });

  it('emits "end" instead of "round" when the last round is passed', () => {
    const shell = new GameShell(container, { totalRounds: 2 });
    const onRound = vi.fn();
    const onEnd = vi.fn();
    shell.on('round', onRound);
    shell.on('end', onEnd);

    shell.start();            // → round 1
    shell.nextRound();        // → round 2 (emits round)
    const more = shell.nextRound(); // no more rounds → end

    expect(more).toBe(false);
    expect(onRound).toHaveBeenCalledTimes(1);
    expect(onEnd).toHaveBeenCalledOnce();
    expect(onEnd.mock.calls[0][0]).toMatchObject({ score: 0 });
  });

  it('on() returns the shell so handlers can be chained', () => {
    const shell = new GameShell(container);
    const ret = shell.on('start', () => {}).on('end', () => {});
    expect(ret).toBe(shell);
  });

  it('getState returns the live GameState instance', () => {
    const shell = new GameShell(container, { totalRounds: 4 });
    shell.start();
    expect(shell.getState()).toBe(shell.state);
    expect(shell.getState().currentRound).toBe(1);
  });
});
