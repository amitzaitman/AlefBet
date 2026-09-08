import { it, expect, vi } from 'vitest';
import { createChoiceRound } from '../../core/choice-round.js';
import { createRoundScope } from '../../core/round-scope.js';
import { createRoundManager } from '../../core/round-manager.js';
import { makeShellStub } from '../helpers.js';

function setup(callbacks = {}) {
  const shell = makeShellStub(2);
  shell.state.nextRound();
  const host = document.createElement('div');
  const scope = createRoundScope();
  const manager = createRoundManager(shell, host, {
    totalRounds: 2, buildRoundUI: () => scope.dispose(), playCorrectSound: false,
  });
  shell.on('end', () => scope.dispose());
  const cards = createChoiceRound({
    shell, scope, isAnswered: () => scope.signal.aborted || manager.isAnswered(),
    onCorrect: manager.handleCorrect, onWrong: manager.handleWrong,
    subscribeAnswered: listener => scope.use(manager.subscribe(listener)),
  }, host, {
    options: [{ id: 'yes', text: 'א' }, { id: 'no', text: 'ב' }],
    isCorrect: option => option.id === 'yes', ...callbacks,
  });
  return { shell, host, scope, cards };
}

it('locks before feedback, ignores double taps and cannot unlock through hint cleanup', async () => {
  vi.useFakeTimers();
  const feedback = vi.fn(() => { expect(button.disabled).toBe(true); });
  const { host, cards, shell } = setup({ onCorrect: feedback });
  const button = host.querySelector('button');
  cards.highlight('yes', 'hint');
  button.click();
  button.click();
  cards.clearHighlight('yes', 'hint');
  expect(button.disabled).toBe(true);
  expect(button.classList.contains('option-card--correct')).toBe(true);
  await vi.runAllTimersAsync();
  expect(feedback).toHaveBeenCalledOnce();
  expect(shell.state.score).toBe(1);
  button.click();
  expect(feedback).toHaveBeenCalledOnce();
  shell.end();
});

it('unlocks after wrong feedback and stays closed when disposed during pending feedback', async () => {
  let release;
  const feedback = vi.fn(() => new Promise(resolve => { release = resolve; }));
  const { host, shell } = setup({ onWrong: feedback });
  const button = host.querySelector('[data-id="no"]');
  button.click();
  expect(button.disabled).toBe(true);
  release();
  await Promise.resolve();
  await Promise.resolve();
  expect(button.disabled).toBe(false);
  button.click();
  shell.end();
  release();
  await Promise.resolve();
  await Promise.resolve();
  expect(button.disabled).toBe(true);
  expect(host.children).toHaveLength(0);
});
