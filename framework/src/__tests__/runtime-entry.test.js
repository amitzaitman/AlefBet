import { it, expect, vi, afterEach } from 'vitest';

afterEach(() => vi.restoreAllMocks());

// Every game loads the one runtime entry, so blocked site storage (Safari with all cookies blocked) must not stop it.
it('the runtime entry loads when site storage is blocked', async () => {
  vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => { throw new DOMException('blocked', 'SecurityError'); });
  vi.resetModules();
  const runtime = await import('../runtime/index.js');
  expect(runtime.tts).toBeDefined();
  expect(runtime.runGame).toBeTypeOf('function');
});
