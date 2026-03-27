import { z } from 'zod';

// ─── Sonos Speaker ──────────────────────────────────────────────────────────

export const SonosSpeakerSchema = z.object({
  ip:          z.string().describe('IP address'),
  port:        z.number().default(1400).describe('UPnP port'),
  location:    z.string().describe('SSDP location URL'),
  roomName:    z.string().default('Unknown Room').describe('Room name'),
  modelName:   z.string().default('Sonos').describe('Model name'),
  modelNumber: z.string().default('').describe('Model number'),
  hasMic:      z.boolean().default(false).describe('Has built-in microphone'),
});

export type SonosSpeaker = z.infer<typeof SonosSpeakerSchema>;

// ─── Mic Source ─────────────────────────────────────────────────────────────

export const MicSourceSchema = z.enum(['sonos', 'device']);
export type MicSource = z.infer<typeof MicSourceSchema>;

// ─── Monitor Settings ───────────────────────────────────────────────────────

export const MonitorSettingsSchema = z.object({
  threshold:     z.number().min(1).max(100).default(40).describe('Detection sensitivity (1–100)'),
  cooldownMs:    z.number().min(1000).max(300000).default(30000).describe('Alert cooldown in ms'),
  alertVolume:   z.number().min(1).max(100).default(30).describe('Alert playback volume (1–100)'),
  alertSoundUrl: z.string().default('').describe('MP3 URL for alert sound'),
});

export type MonitorSettings = z.infer<typeof MonitorSettingsSchema>;

// ─── Monitor State (server → client via WebSocket) ──────────────────────────

export const MonitorStateSchema = z.object({
  monitoring:    z.boolean().default(false),
  babySpeaker:   SonosSpeakerSchema.nullable().default(null),
  parentSpeaker: SonosSpeakerSchema.nullable().default(null),
  threshold:     z.number().default(40),
  cooldownMs:    z.number().default(30000),
  alertVolume:   z.number().default(30),
  alertSoundUrl: z.string().default(''),
  currentLevel:  z.number().default(0),
  micAvailable:  z.boolean().default(false),
});

export type MonitorState = z.infer<typeof MonitorStateSchema>;

// ─── Audio Level Reading ────────────────────────────────────────────────────

export const AudioLevelSourceSchema = z.enum([
  'audioin',
  'mic-status',
  'diagnostics',
  'event',
  'polling',
  'device-mic',
]);

export type AudioLevelSource = z.infer<typeof AudioLevelSourceSchema>;

export const AudioLevelSchema = z.object({
  level:  z.number().min(0).max(100),
  source: AudioLevelSourceSchema,
});

export type AudioLevel = z.infer<typeof AudioLevelSchema>;

// ─── WebSocket Messages ─────────────────────────────────────────────────────

export const WSMessageSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('state'),
  }).merge(MonitorStateSchema),

  z.object({
    type:    z.literal('level'),
    level:   z.number(),
    source:  AudioLevelSourceSchema,
  }),

  z.object({
    type:    z.literal('status'),
    status:  z.string(),
    message: z.string(),
  }),

  z.object({
    type:      z.literal('alert'),
    level:     z.number(),
    timestamp: z.string(),
    message:   z.string(),
  }),

  z.object({
    type:    z.literal('log'),
    level:   z.enum(['info', 'success', 'warn', 'alert']),
    message: z.string(),
  }),

  z.object({
    type:    z.literal('error'),
    message: z.string(),
  }),
]);

export type WSMessage = z.infer<typeof WSMessageSchema>;

// ─── API Request/Response Schemas ───────────────────────────────────────────

export const DiscoverResponseSchema = z.object({
  speakers: z.array(SonosSpeakerSchema),
});

export const VolumeResponseSchema = z.object({
  volume: z.number(),
});

export const OkResponseSchema = z.object({
  ok: z.literal(true),
});

export const ErrorResponseSchema = z.object({
  error: z.string(),
});
