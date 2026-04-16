import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// nakdan.js has a module-level cache; reset modules between tests to get
// a fresh cache each time.
beforeEach(() => { vi.resetModules(); });
afterEach(() => { vi.unstubAllGlobals(); });

/** Build a minimal Nakdan API response for a list of words */
function mockResponse(words) {
  return {
    ok: true,
    json: async () => ({
      data: words.map(w => ({
        sep: false,
        // eslint-disable-next-line no-misleading-character-class
        str: w.replace(/[^\u05D0-\u05EA\u05B0-\u05C7]/gu, ''),
        nakdan: { options: [{ w }] },
      })),
    }),
  };
}

describe('addNikud', () => {
  it('calls fetch and returns nikud-decorated text', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse(['שָׁלוֹם'])));
    const { addNikud } = await import('../utils/nakdan.js');
    expect(await addNikud('שָׁלוֹם')).toBe('שָׁלוֹם');
  });

  it('strips pipe (|) morpheme-boundary markers from response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse(['הַ|בַּיִת'])));
    const { addNikud } = await import('../utils/nakdan.js');
    expect(await addNikud('הַבַּיִת')).toBe('הַבַּיִת');
  });

  it('strips meteg (U+05BD) cantillation mark from API response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse(['גְּרוֹ\u05BDר'])));
    const { addNikud } = await import('../utils/nakdan.js');
    expect(await addNikud('גרור')).toBe('גְּרוֹר');
  });

  it('strips both pipe and meteg together', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse(['הַ|\u05BDנִּיקּוּד'])));
    const { addNikud } = await import('../utils/nakdan.js');
    expect(await addNikud('הניקוד')).toBe('הַנִּיקּוּד');
  });

  it('caches results — fetch called only once for repeated input', async () => {
    const mockFetch = vi.fn().mockResolvedValue(mockResponse(['שָׁלוֹם']));
    vi.stubGlobal('fetch', mockFetch);
    const { addNikud } = await import('../utils/nakdan.js');
    await addNikud('שָׁלוֹם');
    await addNikud('שָׁלוֹם');
    expect(mockFetch).toHaveBeenCalledOnce();
  });

  it('falls back to original text when fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')));
    const { addNikud } = await import('../utils/nakdan.js');
    expect(await addNikud('שָׁלוֹם')).toBe('שָׁלוֹם');
  });

  it('falls back gracefully when API returns a non-OK status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }));
    const { addNikud } = await import('../utils/nakdan.js');
    expect(await addNikud('שָׁלוֹם')).toBe('שָׁלוֹם');
  });

  it('returns empty string for empty / whitespace-only input', async () => {
    vi.stubGlobal('fetch', vi.fn());
    const { addNikud } = await import('../utils/nakdan.js');
    expect(await addNikud('')).toBe('');
    expect(await addNikud('   ')).toBe('   ');
    // fetch should NOT have been called for blank input
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe('getNikud', () => {
  it('returns original text when nothing is cached', async () => {
    vi.stubGlobal('fetch', vi.fn());
    const { getNikud } = await import('../utils/nakdan.js');
    expect(getNikud('לֹא נִטְעַן')).toBe('לֹא נִטְעַן');
  });

  it('returns cached nikud text after addNikud resolves', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse(['עוֹלָם'])));
    const { addNikud, getNikud } = await import('../utils/nakdan.js');
    await addNikud('עוֹלָם');
    expect(getNikud('עוֹלָם')).toBe('עוֹלָם');
  });
});

describe('preloadNikud', () => {
  it('fetches all unique texts', async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce(mockResponse(['שָׁלוֹם']))
      .mockResolvedValueOnce(mockResponse(['עוֹלָם']));
    vi.stubGlobal('fetch', mockFetch);
    const { preloadNikud, getNikud } = await import('../utils/nakdan.js');

    await preloadNikud(['שָׁלוֹם', 'עוֹלָם']);

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(getNikud('שָׁלוֹם')).toBe('שָׁלוֹם');
    expect(getNikud('עוֹלָם')).toBe('עוֹלָם');
  });

  it('deduplicates input — duplicate texts cause only one fetch', async () => {
    const mockFetch = vi.fn().mockResolvedValue(mockResponse(['שָׁלוֹם']));
    vi.stubGlobal('fetch', mockFetch);
    const { preloadNikud } = await import('../utils/nakdan.js');

    await preloadNikud(['שָׁלוֹם', 'שָׁלוֹם', 'שָׁלוֹם']);
    expect(mockFetch).toHaveBeenCalledOnce();
  });

  it('skips empty / whitespace entries', async () => {
    const mockFetch = vi.fn().mockResolvedValue(mockResponse(['שָׁלוֹם']));
    vi.stubGlobal('fetch', mockFetch);
    const { preloadNikud } = await import('../utils/nakdan.js');

    await preloadNikud(['שָׁלוֹם', '', '   ', null, undefined]);
    expect(mockFetch).toHaveBeenCalledOnce();
  });
});
