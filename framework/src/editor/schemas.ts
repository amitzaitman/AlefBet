/**
 * Zod schemas for AlefBet game data.
 *
 * Using .describe('Hebrew label') on each field tells the round inspector
 * what label to render — no separate DEFAULT_FIELDS object needed.
 */
import { z } from 'zod';

// ── Zone schema ──────────────────────────────────────────────────────────────

/** A single [x,y] point in percentage coordinates (0–100) */
export const PointSchema = z.object({
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
});

export type Point = z.infer<typeof PointSchema>;

/**
 * A single interactive zone drawn on a slide image (percentages 0–100).
 *
 * shape:
 *   'rect'    — defined by x/y/width/height (default, backwards-compatible)
 *   'polygon' — defined by points[] array (freeform tracing)
 *
 * For polygons, x/y/width/height are computed from the bounding box on save
 * so that hit-testing and positioning still work generically.
 */
export const ZoneSchema = z.object({
  id:      z.string(),
  shape:   z.enum(['rect', 'polygon']).default('rect'),
  x:       z.number().min(0).max(100),
  y:       z.number().min(0).max(100),
  width:   z.number().min(0).max(100),
  height:  z.number().min(0).max(100),
  points:  z.array(PointSchema).optional(),
  correct: z.boolean().default(false),
  label:   z.string().optional(),
});

export type Zone = z.infer<typeof ZoneSchema>;

// ── Round schemas ─────────────────────────────────────────────────────────────

/**
 * Base round schema — every round has at least an id and optional image.
 * Extend this with .merge() or .extend() for game-specific fields.
 */
export const BaseRoundSchema = z.object({
  id:    z.string(),
  image: z.string().optional(),
  zones: z.array(ZoneSchema).optional(),
}).passthrough();

/** Multiple-choice game (e.g. letter-match-animals) */
export const MultipleChoiceRoundSchema = BaseRoundSchema.extend({
  target:       z.string().max(2).describe('אות יעד'),
  correct:      z.string().describe('תשובה נכונה'),
  correctEmoji: z.string().describe("אמוג'י"),
});

/** Drag-match game (e.g. nikud-match) */
export const DragMatchRoundSchema = BaseRoundSchema.extend({
  target:       z.string().max(2).describe('אות יעד'),
  correct:      z.string().describe('תשובה נכונה'),
  correctEmoji: z.string().describe("אמוג'י"),
});

// ── GameData schema ───────────────────────────────────────────────────────────

export const GameMetaSchema = z.object({
  title: z.string().default(''),
  type:  z.string().default('multiple-choice'),
}).passthrough();

export const GameDataSchema = z.object({
  id:          z.string(),
  version:     z.number().default(1),
  meta:        GameMetaSchema.default({ title: '', type: 'multiple-choice' }),
  rounds:      z.array(z.record(z.string(), z.unknown())).default([]),
  distractors: z.array(z.unknown()).default([]),
});

// ── Inferred types ────────────────────────────────────────────────────────────

export type BaseRound          = z.infer<typeof BaseRoundSchema>;
export type MultipleChoiceRound = z.infer<typeof MultipleChoiceRoundSchema>;
export type DragMatchRound     = z.infer<typeof DragMatchRoundSchema>;
export type ZoneTapRound       = z.infer<typeof ZoneTapRoundSchema>;
export type GameMeta           = z.infer<typeof GameMetaSchema>;
export type GameDataJson       = z.infer<typeof GameDataSchema>;

/** Any round record — open map with a required id */
export type RoundRecord = Record<string, unknown> & { id: string };

/** Zone-tap game (TinyTap-style: tap the correct zone on an image) */
export const ZoneTapRoundSchema = BaseRoundSchema.extend({
  instruction: z.string().optional().describe('הוראה'),
});

// ── Built-in round schema registry ───────────────────────────────────────────

/** Lookup map: game type string → Zod schema for its rounds */
export const BUILTIN_ROUND_SCHEMAS: Record<string, z.ZodObject<z.ZodRawShape>> = {
  'multiple-choice': MultipleChoiceRoundSchema,
  'drag-match':      DragMatchRoundSchema,
  'zone-tap':        ZoneTapRoundSchema,
};
