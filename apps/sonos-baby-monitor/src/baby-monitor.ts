import type { WebSocket } from 'ws';
import { EventBus } from '../../../framework/src/core/events.js';
import {
  MonitorSettingsSchema,
  type SonosSpeaker,
  type MonitorState,
  type WSMessage,
  type MonitorSettings,
} from './schemas.ts';
import {
  getMicEnabled,
  getAudioInputLevel,
  subscribeToAudioEvents,
  playAlert,
} from './sonos-control.ts';

export class BabyMonitor {
  babySpeaker: SonosSpeaker | null = null;
  parentSpeaker: SonosSpeaker | null = null;
  monitoring = false;
  currentLevel = 0;
  micAvailable = false;

  /** EventBus for decoupled event dispatch */
  readonly events = new EventBus();

  private threshold = 40;
  private cooldownMs = 30000;
  private alertVolume = 30;
  private alertSoundUrl = '';
  private lastAlertTime = 0;
  private pollInterval: ReturnType<typeof setInterval> | null = null;
  private eventSubId: string | null = null;

  // ─── WebSocket adapter ────────────────────────────────────────────────

  addListener(ws: WebSocket): void {
    ws.send(JSON.stringify({ type: 'state', ...this.getState() } satisfies WSMessage));

    const handler = (msg: WSMessage) => {
      if (ws.readyState === 1) ws.send(JSON.stringify(msg));
    };

    // Subscribe to all event types
    const eventTypes = ['level', 'status', 'alert', 'log', 'error'] as const;
    for (const type of eventTypes) {
      this.events.on(type, handler);
    }

    ws.on('close', () => {
      for (const type of eventTypes) {
        this.events.off(type, handler);
      }
    });
  }

  private broadcast(msg: WSMessage): void {
    this.events.emit(msg.type, msg);
  }

  // ─── Settings ───────────────────────────────────────────────────────────

  updateSettings(raw: Partial<MonitorSettings>): void {
    // Validate each field individually — avoid Zod v4 .partial() applying defaults
    if ('threshold' in raw && raw.threshold !== undefined) {
      this.threshold = MonitorSettingsSchema.shape.threshold.parse(raw.threshold);
    }
    if ('cooldownMs' in raw && raw.cooldownMs !== undefined) {
      this.cooldownMs = MonitorSettingsSchema.shape.cooldownMs.parse(raw.cooldownMs);
    }
    if ('alertVolume' in raw && raw.alertVolume !== undefined) {
      this.alertVolume = MonitorSettingsSchema.shape.alertVolume.parse(raw.alertVolume);
    }
    if ('alertSoundUrl' in raw && raw.alertSoundUrl !== undefined) {
      this.alertSoundUrl = MonitorSettingsSchema.shape.alertSoundUrl.parse(raw.alertSoundUrl);
    }
  }

  getState(): MonitorState {
    return {
      monitoring: this.monitoring,
      babySpeaker: this.babySpeaker,
      parentSpeaker: this.parentSpeaker,
      threshold: this.threshold,
      cooldownMs: this.cooldownMs,
      alertVolume: this.alertVolume,
      alertSoundUrl: this.alertSoundUrl,
      currentLevel: this.currentLevel,
      micAvailable: this.micAvailable,
    };
  }

  // ─── Monitoring lifecycle ───────────────────────────────────────────────

  async startMonitoring(serverPort: number, localIp: string | null): Promise<void> {
    if (!this.babySpeaker) {
      this.broadcast({ type: 'error', message: 'No baby room speaker selected' });
      return;
    }

    this.monitoring = true;
    this.broadcast({ type: 'status', status: 'starting', message: 'Initializing Sonos mic monitoring...' });

    // Check mic capabilities
    const micInfo = await getMicEnabled(this.babySpeaker.ip, this.babySpeaker.port);
    if (micInfo) {
      this.micAvailable = true;
      this.broadcast({
        type: 'status', status: 'mic-connected',
        message: `Mic active on ${this.babySpeaker.roomName}`,
      });
    }

    // Subscribe to AudioIn UPnP events
    if (localIp) {
      this.eventSubId = await subscribeToAudioEvents(
        this.babySpeaker.ip, this.babySpeaker.port,
        `http://${localIp}:${serverPort}/sonos-event`,
      );
      if (this.eventSubId) {
        this.broadcast({ type: 'log', level: 'success', message: 'Subscribed to Sonos audio events' });
      }
    }

    // Start polling
    this.broadcast({
      type: 'status', status: 'listening',
      message: `Monitoring ${this.babySpeaker.roomName}`,
    });
    this.pollInterval = setInterval(() => this.pollMicLevel(), 500);
    console.log(`Monitoring started: ${this.babySpeaker.roomName} (${this.babySpeaker.ip})`);
  }

  stopMonitoring(): void {
    this.monitoring = false;
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    this.eventSubId = null;
    this.broadcast({ type: 'status', status: 'idle', message: 'Monitoring stopped' });
    console.log('Monitoring stopped');
  }

  // ─── Mic polling ────────────────────────────────────────────────────────

  private async pollMicLevel(): Promise<void> {
    if (!this.monitoring || !this.babySpeaker) return;

    const result = await getAudioInputLevel(this.babySpeaker.ip, this.babySpeaker.port);

    if (result) {
      this.currentLevel = result.level;
      this.micAvailable = true;
      this.broadcast({ type: 'level', level: result.level, source: result.source });
      if (result.level >= this.threshold) this.handleAlert(result.level);
    } else {
      this.broadcast({ type: 'level', level: 0, source: 'polling' });
    }
  }

  // Called when a UPnP NOTIFY event arrives from the Sonos speaker
  handleSonosEvent(body: string): void {
    const match =
      body.match(/AudioLevel[>":\s]+(\d+)/i) ??
      body.match(/Level[>":\s]+(\d+)/i) ??
      body.match(/val="(\d+)"/i);

    if (match) {
      const level = parseInt(match[1]);
      this.currentLevel = level;
      this.micAvailable = true;
      this.broadcast({ type: 'level', level, source: 'event' });
      if (level >= this.threshold) this.handleAlert(level);
    }
  }

  // ─── Alert ──────────────────────────────────────────────────────────────

  private async handleAlert(level: number): Promise<void> {
    const now = Date.now();
    if (now - this.lastAlertTime < this.cooldownMs) return;
    this.lastAlertTime = now;

    const roomName = this.babySpeaker?.roomName ?? 'unknown';
    const message = `Sound detected (${level}%) in ${roomName}!`;
    this.broadcast({ type: 'alert', level, timestamp: new Date().toISOString(), message });
    console.log(`ALERT: ${message}`);

    if (this.parentSpeaker && this.alertSoundUrl) {
      try {
        await playAlert(
          this.parentSpeaker.ip, this.parentSpeaker.port,
          this.alertVolume, this.alertSoundUrl,
        );
        this.broadcast({
          type: 'log', level: 'success',
          message: `Alert played on ${this.parentSpeaker.roomName}`,
        });
      } catch (err) {
        this.broadcast({
          type: 'log', level: 'warn',
          message: `Sonos alert failed: ${(err as Error).message}`,
        });
      }
    }
  }
}
