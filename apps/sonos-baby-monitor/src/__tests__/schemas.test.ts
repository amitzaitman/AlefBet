import { describe, it, expect } from 'vitest';
import {
  SonosSpeakerSchema,
  MonitorSettingsSchema,
  MonitorStateSchema,
  AudioLevelSchema,
  AudioLevelSourceSchema,
  MicSourceSchema,
  WSMessageSchema,
  DiscoverResponseSchema,
} from '../schemas.ts';

describe('SonosSpeakerSchema', () => {
  it('parses a full speaker object', () => {
    const speaker = SonosSpeakerSchema.parse({
      ip: '192.168.1.10',
      port: 1400,
      location: 'http://192.168.1.10:1400/xml/device_description.xml',
      roomName: 'Living Room',
      modelName: 'Sonos One',
      modelNumber: 'S13',
      hasMic: true,
    });
    expect(speaker.ip).toBe('192.168.1.10');
    expect(speaker.hasMic).toBe(true);
    expect(speaker.roomName).toBe('Living Room');
  });

  it('applies defaults for optional fields', () => {
    const speaker = SonosSpeakerSchema.parse({
      ip: '10.0.0.5',
      location: 'http://10.0.0.5:1400/xml/device_description.xml',
    });
    expect(speaker.port).toBe(1400);
    expect(speaker.roomName).toBe('Unknown Room');
    expect(speaker.modelName).toBe('Sonos');
    expect(speaker.modelNumber).toBe('');
    expect(speaker.hasMic).toBe(false);
  });

  it('rejects missing ip', () => {
    expect(() => SonosSpeakerSchema.parse({ location: 'http://x' })).toThrow();
  });
});

describe('MonitorSettingsSchema', () => {
  it('parses valid settings', () => {
    const settings = MonitorSettingsSchema.parse({
      threshold: 60,
      cooldownMs: 15000,
      alertVolume: 50,
      alertSoundUrl: 'http://example.com/alert.mp3',
    });
    expect(settings.threshold).toBe(60);
    expect(settings.cooldownMs).toBe(15000);
  });

  it('applies defaults', () => {
    const settings = MonitorSettingsSchema.parse({});
    expect(settings.threshold).toBe(40);
    expect(settings.cooldownMs).toBe(30000);
    expect(settings.alertVolume).toBe(30);
    expect(settings.alertSoundUrl).toBe('');
  });

  it('rejects threshold out of range', () => {
    expect(() => MonitorSettingsSchema.parse({ threshold: 0 })).toThrow();
    expect(() => MonitorSettingsSchema.parse({ threshold: 101 })).toThrow();
  });

  it('rejects cooldown below minimum', () => {
    expect(() => MonitorSettingsSchema.parse({ cooldownMs: 500 })).toThrow();
  });

  it('partial parse for settings updates', () => {
    const partial = MonitorSettingsSchema.partial().parse({ threshold: 75 });
    expect(partial.threshold).toBe(75);
    // Zod v4: .partial() with .default() still applies defaults for missing fields
    expect(partial.cooldownMs).toBe(30000);
  });
});

describe('MonitorStateSchema', () => {
  it('applies all defaults for empty input', () => {
    const state = MonitorStateSchema.parse({});
    expect(state.monitoring).toBe(false);
    expect(state.babySpeaker).toBeNull();
    expect(state.parentSpeaker).toBeNull();
    expect(state.threshold).toBe(40);
    expect(state.currentLevel).toBe(0);
    expect(state.micAvailable).toBe(false);
  });

  it('accepts a full state object', () => {
    const state = MonitorStateSchema.parse({
      monitoring: true,
      babySpeaker: {
        ip: '192.168.1.10', port: 1400,
        location: 'http://192.168.1.10:1400/xml',
        roomName: 'Nursery', modelName: 'Era 100',
        modelNumber: 'S36', hasMic: true,
      },
      parentSpeaker: null,
      threshold: 55,
      cooldownMs: 20000,
      alertVolume: 40,
      alertSoundUrl: '',
      currentLevel: 12,
      micAvailable: true,
    });
    expect(state.monitoring).toBe(true);
    expect(state.babySpeaker?.roomName).toBe('Nursery');
    expect(state.currentLevel).toBe(12);
  });
});

describe('AudioLevelSchema', () => {
  it('parses valid audio level', () => {
    const level = AudioLevelSchema.parse({ level: 42, source: 'audioin' });
    expect(level.level).toBe(42);
    expect(level.source).toBe('audioin');
  });

  it('accepts device-mic source', () => {
    const level = AudioLevelSchema.parse({ level: 78, source: 'device-mic' });
    expect(level.source).toBe('device-mic');
  });

  it('rejects invalid source', () => {
    expect(() => AudioLevelSchema.parse({ level: 50, source: 'invalid' })).toThrow();
  });

  it('rejects level out of range', () => {
    expect(() => AudioLevelSchema.parse({ level: -1, source: 'audioin' })).toThrow();
    expect(() => AudioLevelSchema.parse({ level: 101, source: 'audioin' })).toThrow();
  });
});

describe('AudioLevelSourceSchema', () => {
  it('accepts all valid sources', () => {
    const sources = ['audioin', 'mic-status', 'diagnostics', 'event', 'polling', 'device-mic'];
    for (const s of sources) {
      expect(AudioLevelSourceSchema.parse(s)).toBe(s);
    }
  });
});

describe('MicSourceSchema', () => {
  it('accepts sonos and device', () => {
    expect(MicSourceSchema.parse('sonos')).toBe('sonos');
    expect(MicSourceSchema.parse('device')).toBe('device');
  });

  it('rejects invalid mic source', () => {
    expect(() => MicSourceSchema.parse('bluetooth')).toThrow();
  });
});

describe('WSMessageSchema', () => {
  it('parses a level message', () => {
    const msg = WSMessageSchema.parse({
      type: 'level',
      level: 45,
      source: 'device-mic',
    });
    expect(msg.type).toBe('level');
    if (msg.type === 'level') {
      expect(msg.level).toBe(45);
      expect(msg.source).toBe('device-mic');
    }
  });

  it('parses a status message', () => {
    const msg = WSMessageSchema.parse({
      type: 'status',
      status: 'listening',
      message: 'Monitoring nursery',
    });
    expect(msg.type).toBe('status');
  });

  it('parses an alert message', () => {
    const msg = WSMessageSchema.parse({
      type: 'alert',
      level: 82,
      timestamp: '2026-01-01T00:00:00.000Z',
      message: 'Sound detected!',
    });
    expect(msg.type).toBe('alert');
    if (msg.type === 'alert') expect(msg.level).toBe(82);
  });

  it('parses a log message', () => {
    const msg = WSMessageSchema.parse({
      type: 'log',
      level: 'success',
      message: 'Connected',
    });
    expect(msg.type).toBe('log');
  });

  it('parses an error message', () => {
    const msg = WSMessageSchema.parse({
      type: 'error',
      message: 'Something went wrong',
    });
    expect(msg.type).toBe('error');
  });

  it('rejects unknown message type', () => {
    expect(() => WSMessageSchema.parse({ type: 'unknown', data: 123 })).toThrow();
  });
});

describe('DiscoverResponseSchema', () => {
  it('parses a response with speakers', () => {
    const res = DiscoverResponseSchema.parse({
      speakers: [
        { ip: '192.168.1.10', port: 1400, location: 'http://x', roomName: 'Kitchen' },
        { ip: '192.168.1.11', port: 1400, location: 'http://y', roomName: 'Bedroom' },
      ],
    });
    expect(res.speakers).toHaveLength(2);
    expect(res.speakers[0].roomName).toBe('Kitchen');
  });

  it('parses empty speakers list', () => {
    const res = DiscoverResponseSchema.parse({ speakers: [] });
    expect(res.speakers).toHaveLength(0);
  });
});
