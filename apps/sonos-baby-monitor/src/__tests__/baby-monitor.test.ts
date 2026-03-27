import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BabyMonitor } from '../baby-monitor.ts';
import type { SonosSpeaker } from '../schemas.ts';

// Mock the sonos-control module
vi.mock('../sonos-control.ts', () => ({
  getMicEnabled: vi.fn().mockResolvedValue(null),
  getAudioInputLevel: vi.fn().mockResolvedValue(null),
  subscribeToAudioEvents: vi.fn().mockResolvedValue(null),
  playAlert: vi.fn().mockResolvedValue(20),
}));

function makeSpeaker(overrides: Partial<SonosSpeaker> = {}): SonosSpeaker {
  return {
    ip: '192.168.1.10',
    port: 1400,
    location: 'http://192.168.1.10:1400/xml/device_description.xml',
    roomName: 'Nursery',
    modelName: 'Sonos One',
    modelNumber: 'S13',
    hasMic: true,
    ...overrides,
  };
}

function mockWs(): { ws: any; sent: string[] } {
  const sent: string[] = [];
  const ws = {
    readyState: 1,
    send: (data: string) => sent.push(data),
    on: vi.fn(),
  };
  return { ws, sent };
}

describe('BabyMonitor', () => {
  let monitor: BabyMonitor;

  beforeEach(() => {
    monitor = new BabyMonitor();
  });

  describe('getState', () => {
    it('returns default state', () => {
      const state = monitor.getState();
      expect(state.monitoring).toBe(false);
      expect(state.babySpeaker).toBeNull();
      expect(state.parentSpeaker).toBeNull();
      expect(state.threshold).toBe(40);
      expect(state.cooldownMs).toBe(30000);
      expect(state.alertVolume).toBe(30);
      expect(state.alertSoundUrl).toBe('');
      expect(state.currentLevel).toBe(0);
      expect(state.micAvailable).toBe(false);
    });
  });

  describe('updateSettings', () => {
    it('updates threshold', () => {
      monitor.updateSettings({ threshold: 75 });
      expect(monitor.getState().threshold).toBe(75);
    });

    it('updates cooldown', () => {
      monitor.updateSettings({ cooldownMs: 60000 });
      expect(monitor.getState().cooldownMs).toBe(60000);
    });

    it('updates alert volume', () => {
      monitor.updateSettings({ alertVolume: 80 });
      expect(monitor.getState().alertVolume).toBe(80);
    });

    it('updates alert sound URL', () => {
      monitor.updateSettings({ alertSoundUrl: 'http://example.com/sound.mp3' });
      expect(monitor.getState().alertSoundUrl).toBe('http://example.com/sound.mp3');
    });

    it('updates multiple settings at once', () => {
      monitor.updateSettings({ threshold: 50, alertVolume: 60 });
      const state = monitor.getState();
      expect(state.threshold).toBe(50);
      expect(state.alertVolume).toBe(60);
    });

    it('rejects invalid threshold', () => {
      expect(() => monitor.updateSettings({ threshold: 0 })).toThrow();
      expect(() => monitor.updateSettings({ threshold: 101 })).toThrow();
    });

    it('preserves previous values when updating other fields', () => {
      monitor.updateSettings({ threshold: 80 });
      monitor.updateSettings({ alertVolume: 50 });
      expect(monitor.getState().threshold).toBe(80);
      expect(monitor.getState().alertVolume).toBe(50);
    });
  });

  describe('speaker assignment', () => {
    it('sets baby speaker', () => {
      const speaker = makeSpeaker();
      monitor.babySpeaker = speaker;
      expect(monitor.getState().babySpeaker?.ip).toBe('192.168.1.10');
      expect(monitor.getState().babySpeaker?.roomName).toBe('Nursery');
    });

    it('sets parent speaker', () => {
      const speaker = makeSpeaker({ ip: '192.168.1.20', roomName: 'Bedroom' });
      monitor.parentSpeaker = speaker;
      expect(monitor.getState().parentSpeaker?.roomName).toBe('Bedroom');
    });
  });

  describe('addListener', () => {
    it('sends initial state to new listener', () => {
      const { ws, sent } = mockWs();
      monitor.addListener(ws as any);

      expect(sent).toHaveLength(1);
      const msg = JSON.parse(sent[0]);
      expect(msg.type).toBe('state');
      expect(msg.monitoring).toBe(false);
    });

    it('registers close handler', () => {
      const { ws } = mockWs();
      monitor.addListener(ws as any);
      expect(ws.on).toHaveBeenCalledWith('close', expect.any(Function));
    });
  });

  describe('startMonitoring', () => {
    it('requires a baby speaker', async () => {
      const { ws, sent } = mockWs();
      monitor.addListener(ws as any);
      sent.length = 0; // Clear initial state message

      await monitor.startMonitoring(3000, '192.168.1.100');

      const errorMsg = sent.find(s => JSON.parse(s).type === 'error');
      expect(errorMsg).toBeDefined();
      expect(JSON.parse(errorMsg!).message).toContain('No baby room speaker');
    });

    it('starts monitoring with baby speaker set', async () => {
      monitor.babySpeaker = makeSpeaker();
      const { ws, sent } = mockWs();
      monitor.addListener(ws as any);
      sent.length = 0;

      await monitor.startMonitoring(3000, '192.168.1.100');

      expect(monitor.monitoring).toBe(true);
      const statusMsgs = sent.map(s => JSON.parse(s)).filter(m => m.type === 'status');
      expect(statusMsgs.length).toBeGreaterThan(0);

      // Clean up
      monitor.stopMonitoring();
    });
  });

  describe('stopMonitoring', () => {
    it('stops monitoring and broadcasts idle', async () => {
      monitor.babySpeaker = makeSpeaker();
      const { ws, sent } = mockWs();
      monitor.addListener(ws as any);

      await monitor.startMonitoring(3000, null);
      sent.length = 0;

      monitor.stopMonitoring();

      expect(monitor.monitoring).toBe(false);
      const idleMsg = sent.find(s => {
        const m = JSON.parse(s);
        return m.type === 'status' && m.status === 'idle';
      });
      expect(idleMsg).toBeDefined();
    });
  });

  describe('handleSonosEvent', () => {
    it('parses audio level from UPnP event XML', () => {
      const { ws, sent } = mockWs();
      monitor.addListener(ws as any);
      sent.length = 0;

      monitor.handleSonosEvent('<e:property><AudioLevel val="65"/></e:property>');

      expect(monitor.currentLevel).toBe(65);
      expect(monitor.micAvailable).toBe(true);
      const levelMsg = sent.find(s => JSON.parse(s).type === 'level');
      expect(levelMsg).toBeDefined();
      expect(JSON.parse(levelMsg!).level).toBe(65);
    });

    it('parses Level tag format', () => {
      monitor.handleSonosEvent('<Level>42</Level>');
      expect(monitor.currentLevel).toBe(42);
    });

    it('ignores events without level data', () => {
      const { ws, sent } = mockWs();
      monitor.addListener(ws as any);
      sent.length = 0;

      monitor.handleSonosEvent('<e:property><SomeOtherProp>test</SomeOtherProp></e:property>');

      const levelMsg = sent.find(s => JSON.parse(s).type === 'level');
      expect(levelMsg).toBeUndefined();
    });

    it('triggers alert when level exceeds threshold', () => {
      monitor.babySpeaker = makeSpeaker();
      monitor.updateSettings({ threshold: 50 });
      const { ws, sent } = mockWs();
      monitor.addListener(ws as any);
      sent.length = 0;

      monitor.handleSonosEvent('<AudioLevel val="80"/>');

      const alertMsg = sent.find(s => JSON.parse(s).type === 'alert');
      expect(alertMsg).toBeDefined();
      expect(JSON.parse(alertMsg!).level).toBe(80);
    });

    it('respects cooldown between alerts', () => {
      monitor.babySpeaker = makeSpeaker();
      monitor.updateSettings({ threshold: 30, cooldownMs: 60000 });
      const { ws, sent } = mockWs();
      monitor.addListener(ws as any);
      sent.length = 0;

      // First alert should fire
      monitor.handleSonosEvent('<AudioLevel val="50"/>');
      const alertCount1 = sent.filter(s => JSON.parse(s).type === 'alert').length;
      expect(alertCount1).toBe(1);

      // Second alert within cooldown should NOT fire
      monitor.handleSonosEvent('<AudioLevel val="60"/>');
      const alertCount2 = sent.filter(s => JSON.parse(s).type === 'alert').length;
      expect(alertCount2).toBe(1); // Still 1
    });
  });
});
