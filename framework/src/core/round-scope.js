/** Resources belong to a round and are released together on advance, replay or exit. */
export function createRoundScope() {
  const controller = new AbortController();
  const cleanups = new Set();
  function register(cleanup) {
    if (controller.signal.aborted) cleanup();
    else cleanups.add(cleanup);
  }
  return {
    signal: controller.signal,
    /** @template {(() => void) | { destroy: () => void }} T @param {T} resource @returns {T} */
    use(resource) {
      register(typeof resource === 'function' ? resource : () => resource.destroy());
      return resource;
    },
    /** @param {EventTarget} target @param {string} event @param {EventListener} handler @param {AddEventListenerOptions | boolean} [options] */
    listen(target, event, handler, options) {
      if (controller.signal.aborted) return;
      target.addEventListener(event, handler, options);
      register(() => target.removeEventListener(event, handler, options));
    },
    schedule(action, delayMs) {
      if (controller.signal.aborted) return () => {};
      const cancel = () => { clearTimeout(timer); cleanups.delete(cancel); };
      const timer = setTimeout(() => {
        cleanups.delete(cancel);
        if (!controller.signal.aborted) action();
      }, delayMs);
      register(cancel);
      return cancel;
    },
    dispose() {
      if (controller.signal.aborted) return;
      controller.abort();
      const pending = [...cleanups].reverse();
      cleanups.clear();
      for (const cleanup of pending) {
        try { cleanup(); } catch (error) { console.warn('Round cleanup failed', error); }
      }
    },
  };
}
