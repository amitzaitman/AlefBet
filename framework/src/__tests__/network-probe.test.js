// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { probeInBrowser } from '../../../e2e/network-probe.js';

const url = 'http://127.0.0.1:12345/network-probe?nonce=fresh';
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

describe('offline test probes', () => {
  it('requires a fresh successful response, rejecting stale bodies and HTTP errors', async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce(new Response('/network-probe?nonce=old'))
      .mockResolvedValueOnce(new Response('/network-probe?nonce=fresh', { status: 503 }))
      .mockResolvedValueOnce(new Response('/network-probe?nonce=fresh'));
    vi.stubGlobal('fetch', fetch);
    expect(await probeInBrowser(url)).toBe('unexpected-response');
    expect(await probeInBrowser(url)).toBe('unexpected-response');
    expect(await probeInBrowser(url)).toBe('online');
  });
  it('distinguishes an actual network error from a stalled request', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    expect(await probeInBrowser(url)).toBe('network-error');
  });
  it.each(['headers', 'body'])('bounds a request stuck at %s and cancels it', async stage => {
    vi.useFakeTimers();
    let signal;
    vi.stubGlobal('fetch', vi.fn((_url, options) => {
      signal = options.signal;
      const never = new Promise(() => {});
      return stage === 'headers' ? never : Promise.resolve({ ok: true, text: () => never });
    }));
    const result = probeInBrowser(url);
    await vi.advanceTimersByTimeAsync(1500);
    expect(await result).toBe('timeout');
    expect(signal.aborted).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });
  it('keeps raw network switches and probes out of browser specs', () => {
    const directory = new URL('../../../e2e/', import.meta.url);
    for (const file of readdirSync(directory).filter(name => name.endsWith('.spec.js'))) {
      const source = readFileSync(new URL(file, directory), 'utf8');
      expect(source, `${file}: use network.offline/online instead`).not.toMatch(/\.setOffline\s*\(|network-probe|\.disconnect\s*\(/);
    }
  });
});
