import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Import after mocking
const { getVolume, setVolume, play, pause, getMicEnabled, getAudioInputLevel } =
  await import('../sonos-control.ts');

describe('sonos-control', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getVolume', () => {
    it('parses volume from SOAP response', async () => {
      mockFetch.mockResolvedValue({
        text: () => Promise.resolve(
          '<s:Envelope><s:Body><u:GetVolumeResponse><CurrentVolume>42</CurrentVolume></u:GetVolumeResponse></s:Body></s:Envelope>'
        ),
      });

      const vol = await getVolume('192.168.1.10', 1400);
      expect(vol).toBe(42);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://192.168.1.10:1400/MediaRenderer/RenderingControl/Control',
        expect.objectContaining({ method: 'POST' }),
      );
    });

    it('returns 0 when volume not found in response', async () => {
      mockFetch.mockResolvedValue({
        text: () => Promise.resolve('<s:Envelope><s:Body></s:Body></s:Envelope>'),
      });

      const vol = await getVolume('192.168.1.10', 1400);
      expect(vol).toBe(0);
    });
  });

  describe('setVolume', () => {
    it('sends SOAP request with correct volume', async () => {
      mockFetch.mockResolvedValue({ text: () => Promise.resolve('<ok/>') });

      await setVolume('192.168.1.10', 1400, 65);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [, options] = mockFetch.mock.calls[0];
      expect(options.body).toContain('<DesiredVolume>65</DesiredVolume>');
    });
  });

  describe('play', () => {
    it('sends Play SOAP action', async () => {
      mockFetch.mockResolvedValue({ text: () => Promise.resolve('<ok/>') });

      await play('192.168.1.10', 1400);

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/MediaRenderer/AVTransport/Control');
      expect(options.headers.SOAPAction).toContain('Play');
    });
  });

  describe('pause', () => {
    it('sends Pause SOAP action', async () => {
      mockFetch.mockResolvedValue({ text: () => Promise.resolve('<ok/>') });

      await pause('192.168.1.10', 1400);

      const [, options] = mockFetch.mock.calls[0];
      expect(options.headers.SOAPAction).toContain('Pause');
    });
  });

  describe('getMicEnabled', () => {
    it('returns XML on success', async () => {
      mockFetch.mockResolvedValue({
        text: () => Promise.resolve('<AudioInputAttributes>enabled</AudioInputAttributes>'),
      });

      const result = await getMicEnabled('192.168.1.10', 1400);
      expect(result).toContain('AudioInputAttributes');
    });

    it('returns null on failure', async () => {
      mockFetch.mockRejectedValue(new Error('Connection refused'));

      const result = await getMicEnabled('192.168.1.10', 1400);
      expect(result).toBeNull();
    });
  });

  describe('getAudioInputLevel', () => {
    it('returns level from AudioIn SOAP response', async () => {
      mockFetch.mockResolvedValue({
        text: () => Promise.resolve(
          '<GetLineInLevelResponse><CurrentLevel>73</CurrentLevel></GetLineInLevelResponse>'
        ),
      });

      const result = await getAudioInputLevel('192.168.1.10', 1400);
      expect(result).toEqual({ level: 73, source: 'audioin' });
    });

    it('falls back to mic-status endpoint', async () => {
      // First call (AudioIn SOAP) fails
      mockFetch.mockRejectedValueOnce(new Error('not supported'));
      // Second call (mic status) succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('{"level": 55}'),
      });

      const result = await getAudioInputLevel('192.168.1.10', 1400);
      expect(result).toEqual({ level: 55, source: 'mic-status' });
    });

    it('falls back to diagnostics endpoint', async () => {
      // First two calls fail
      mockFetch.mockRejectedValueOnce(new Error('fail'));
      mockFetch.mockRejectedValueOnce(new Error('fail'));
      // Diagnostics succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('mic noise level 38 dB'),
      });

      const result = await getAudioInputLevel('192.168.1.10', 1400);
      expect(result).toEqual({ level: 38, source: 'diagnostics' });
    });

    it('returns null when all methods fail', async () => {
      mockFetch.mockRejectedValue(new Error('fail'));

      const result = await getAudioInputLevel('192.168.1.10', 1400);
      expect(result).toBeNull();
    });
  });
});
