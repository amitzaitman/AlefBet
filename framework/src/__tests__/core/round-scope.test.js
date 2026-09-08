import { describe, it, expect, vi } from 'vitest';
import { createRoundScope } from '../../core/round-scope.js';

describe('round resources', () => {
  it('cancels timers, removes listeners and releases resources once on disposal', () => {
    vi.useFakeTimers();
    const scope = createRoundScope();
    const action = vi.fn();
    const event = vi.fn();
    const destroy = vi.fn();
    const button = document.createElement('button');
    scope.schedule(action, 100);
    scope.listen(button, 'click', event);
    scope.use({ destroy });
    button.click();
    scope.dispose();
    scope.dispose();
    button.click();
    vi.runAllTimers();
    expect(action).not.toHaveBeenCalled();
    expect(event).toHaveBeenCalledOnce();
    expect(destroy).toHaveBeenCalledOnce();
    expect(scope.signal.aborted).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('allows cancelling a hint without ending the round', () => {
    vi.useFakeTimers();
    const scope = createRoundScope();
    const hint = vi.fn();
    scope.schedule(hint, 100)();
    vi.runAllTimers();
    expect(hint).not.toHaveBeenCalled();
    expect(scope.signal.aborted).toBe(false);
  });

  it('cleans up late resources and continues after a faulty cleanup', () => {
    const scope = createRoundScope();
    const destroy = vi.fn();
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    scope.use(destroy);
    scope.use(() => { throw new Error('broken component'); });
    scope.dispose();
    scope.use(destroy);
    expect(destroy).toHaveBeenCalledTimes(2);
    expect(warning).toHaveBeenCalledOnce();
    warning.mockRestore();
  });
});
