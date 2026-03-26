/**
 * Zod schemas for AlefBet game data.
 *
 * Using .describe('Hebrew label') on each field tells the round inspector
 * what label to render — no separate DEFAULT_FIELDS object needed.
 */
import { z } from 'zod';

// ── Round schemas ─────────────────────────────────────────────────────────────

/**
 * Base round schema — every round has at least an id and optional image.
 * Extend this with .merge() or .extend() for game-specific fields.
 */
export const BaseRoundSchema = z.object({
  id:    z.string(),
  image: z.string().optional(),
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
  meta:        GameMetaSchema.default({}),
  rounds:      z.array(z.record(z.string(), z.unknown())).default([]),
  distractors: z.array(z.unknown()).default([]),
});

// ── Inferred types ────────────────────────────────────────────────────────────

export type BaseRound          = z.infer<typeof BaseRoundSchema>;
export type MultipleChoiceRound = z.infer<typeof MultipleChoiceRoundSchema>;
export type DragMatchRound     = z.infer<typeof DragMatchRoundSchema>;
export type GameMeta           = z.infer<typeof GameMetaSchema>;
export type GameDataJson       = z.infer<typeof GameDataSchema>;

/** Any round record — open map with a required id */
export type RoundRecord = Record<string, unknown> & { id: string };

// ── Built-in round schema registry ───────────────────────────────────────────

/** Lookup map: game type string → Zod schema for its rounds */
export const BUILTIN_ROUND_SCHEMAS: Record<string, z.ZodObject<z.ZodRawShape>> = {
  'multiple-choice': MultipleChoiceRoundSchema,
  'drag-match':      DragMatchRoundSchema,
};
