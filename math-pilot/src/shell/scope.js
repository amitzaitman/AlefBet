import { onDestroy } from 'svelte';

/**
 * Timers and async work that belong to one round. Everything stops when the
 * scope is disposed, so a round that is gone never changes the screen.
 */
export function createScope() {
  const controller = new AbortController();
  const { signal } = controller;
  /** @type {Set<ReturnType<typeof setTimeout>>} */
  const timers = new Set();

  /**
   * Runs `action` after `delayMs` unless the scope ends first.
   * @param {() => void} action
   * @param {number} delayMs
   * @returns {() => void} cancels this one timer
   */
  function schedule(action, delayMs) {
    if (signal.aborted) return () => {};
    const timer = setTimeout(() => {
      timers.delete(timer);
      action();
    }, delayMs);
    timers.add(timer);
    return () => {
      clearTimeout(timer);
      timers.delete(timer);
    };
  }

  return {
    signal,
    /** False once the round is gone; check it after every await. */
    active: () => !signal.aborted,
    schedule,
    /**
     * @param {number} delayMs
     * @returns {Promise<boolean>} true after the pause, false if the scope ended first
     */
    wait(delayMs) {
      return new Promise(resolve => {
        if (signal.aborted) { resolve(false); return; }
        const stop = () => resolve(false);
        signal.addEventListener('abort', stop, { once: true });
        schedule(() => {
          signal.removeEventListener('abort', stop);
          resolve(true);
        }, delayMs);
      });
    },
    dispose() {
      controller.abort();
      timers.forEach(clearTimeout);
      timers.clear();
    },
  };
}

/** @typedef {ReturnType<typeof createScope>} Scope */

/** A scope that ends with the component that creates it. Call during component setup. */
export function useScope() {
  const scope = createScope();
  onDestroy(scope.dispose);
  return scope;
}
