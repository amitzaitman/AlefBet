import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// nakdan.js has a module-level cache; reset modules between tests to get
// a fresh cache each time. localStorage is cleared too because the module
// now persists successful results ("compile once") and would otherwise
// leak state between tests.
beforeEach(() => {
  vi.resetModules();
  try { localStorage.clear(); } catch { /* ignore */ }
});
afterEach(() => { vi.unstubAllGlobals(); });

/** Build a minimal Nakdan API response for a list of words */
function mockResponse(words) {
  return {
    ok: true,
    json: async () => ({
      data: words.map(w => ({
        sep: false,
        // eslint-disable-next-line no-misleading-character-class
        str: w.replace(/[^א-תְ-ׇ]/gu, ''),
        nakdan: { options: [{ w }] },
      })),
    }),
  };
}

describe('isVowelized', () => {
  it('recognises fully vowelized text', async () => {
    const { isVowelized } = await import('../utils/nakdan.js');
    expect(isVowelized('שָׁלוֹם עוֹלָם')).toBe(true);
    expect(isVowelized('בְּרוּכִים הַבָּאִים לְמִשְׂחַק הַנִּיקּוּד')).toBe(true);
  });

  it('recognises plain text as not vowelized', async () => {
    const { isVowelized } = await import('../utils/nakdan.js');
    expect(isVowelized('שלום עולם')).toBe(false);
    expect(isVowelized('מצא את החיה')).toBe(false);
  });

  it('non-Hebrew or empty text counts as vowelized (nothing to fetch)', async () => {
    const { isVowelized } = await import('../utils/nakdan.js');
    expect(isVowelized('hello world')).toBe(true);
    expect(isVowelized('123 !')).toBe(true);
    expect(isVowelized('')).toBe(false);
  });
});

describe('addNikud', () => {
  it('already-vowelized text short-circuits — no network at all', async () => {
    const mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);
    const { addNikud } = await import('../utils/nakdan.js');
    expect(await addNikud('שָׁלוֹם')).toBe('שָׁלוֹם');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('calls fetch for plain text and returns nikud-decorated text', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse(['שָׁלוֹם'])));
    const { addNikud } = await import('../utils/nakdan.js');
    expect(await addNikud('שלום')).toBe('שָׁלוֹם');
  });

  it('passes an abort signal so a hung request cannot stall the loading screen', async () => {
    const mockFetch = vi.fn().mockResolvedValue(mockResponse(['שָׁלוֹם']));
    vi.stubGlobal('fetch', mockFetch);
    const { addNikud } = await import('../utils/nakdan.js');
    await addNikud('שלום');
    const [, init] = mockFetch.mock.calls[0];
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it('skips the network entirely when the browser reports offline', async () => {
    const mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);
    vi.stubGlobal('navigator', { ...navigator, onLine: false });
    const { addNikud } = await import('../utils/nakdan.js');
    expect(await addNikud('שלום')).toBe('שלום');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('strips pipe (|) morpheme-boundary markers from response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse(['הַ|בַּיִת'])));
    const { addNikud } = await import('../utils/nakdan.js');
    expect(await addNikud('הבית')).toBe('הַבַּיִת');
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
    const mockFetch = vi.fn().mockResolvedValue(mockResponse(['שָׁלוֹם']));
    vi.stubGlobal('fetch', mockFetch);
    const { addNikud } = await import('../utils/nakdan.js');
    await addNikud('שלום');
    await addNikud('שלום');
    expect(mockFetch).toHaveBeenCalledOnce();
  });

  it('persists successful results — a fresh module load needs no network', async () => {
    const mockFetch = vi.fn().mockResolvedValue(mockResponse(['שָׁלוֹם']));
    vi.stubGlobal('fetch', mockFetch);
    const first = await import('../utils/nakdan.js');
    await first.addNikud('שלום');
    expect(mockFetch).toHaveBeenCalledOnce();

    // "מכשיר אחרי ריסטארט": מודול נטען מחדש, הרשת לא זמינה.
    vi.resetModules();
    const offlineFetch = vi.fn().mockRejectedValue(new Error('offline'));
    vi.stubGlobal('fetch', offlineFetch);
    const second = await import('../utils/nakdan.js');
    expect(await second.addNikud('שלום')).toBe('שָׁלוֹם');
    expect(offlineFetch).not.toHaveBeenCalled();
  });

  it('falls back to original text when fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')));
    const { addNikud } = await import('../utils/nakdan.js');
    expect(await addNikud('שלום')).toBe('שלום');
  });

  it('failure is NOT persisted — the next session retries fresh', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')));
    const first = await import('../utils/nakdan.js');
    await first.addNikud('שלום');

    vi.resetModules();
    const mockFetch = vi.fn().mockResolvedValue(mockResponse(['שָׁלוֹם']));
    vi.stubGlobal('fetch', mockFetch);
    const second = await import('../utils/nakdan.js');
    expect(await second.addNikud('שלום')).toBe('שָׁלוֹם');
    expect(mockFetch).toHaveBeenCalledOnce();
  });

  it('falls back gracefully when API returns a non-OK status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }));
    const { addNikud } = await import('../utils/nakdan.js');
    expect(await addNikud('שלום')).toBe('שלום');
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
    await addNikud('עולם');
    expect(getNikud('עולם')).toBe('עוֹלָם');
  });
});

describe('preloadNikud', () => {
  it('fetches all unique plain texts', async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce(mockResponse(['שָׁלוֹם']))
      .mockResolvedValueOnce(mockResponse(['עוֹלָם']));
    vi.stubGlobal('fetch', mockFetch);
    const { preloadNikud, getNikud } = await import('../utils/nakdan.js');

    await preloadNikud(['שלום', 'עולם']);

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(getNikud('שלום')).toBe('שָׁלוֹם');
    expect(getNikud('עולם')).toBe('עוֹלָם');
  });

  it('pre-vowelized game texts produce zero network requests', async () => {
    const mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);
    const { preloadNikud } = await import('../utils/nakdan.js');

    await preloadNikud(['בְּרוּכִים הַבָּאִים לְמִשְׂחַק הַנִּיקּוּד', 'כָּל הַכָּבוֹד']);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('deduplicates input — duplicate texts cause only one fetch', async () => {
    const mockFetch = vi.fn().mockResolvedValue(mockResponse(['שָׁלוֹם']));
    vi.stubGlobal('fetch', mockFetch);
    const { preloadNikud } = await import('../utils/nakdan.js');

    await preloadNikud(['שלום', 'שלום', 'שלום']);
    expect(mockFetch).toHaveBeenCalledOnce();
  });

  it('skips empty / whitespace entries', async () => {
    const mockFetch = vi.fn().mockResolvedValue(mockResponse(['שָׁלוֹם']));
    vi.stubGlobal('fetch', mockFetch);
    const { preloadNikud } = await import('../utils/nakdan.js');

    await preloadNikud(['שלום', '', '   ', null, undefined]);
    expect(mockFetch).toHaveBeenCalledOnce();
  });
});
