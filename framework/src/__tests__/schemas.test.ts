import { describe, it, expect } from 'vitest';
import {
  MultipleChoiceRoundSchema,
  DragMatchRoundSchema,
  GameDataSchema,
  GameMetaSchema,
  BUILTIN_ROUND_SCHEMAS,
} from '../editor/schemas.js';
import { schemaToFields } from '../editor/schema-to-fields.js';
import { z } from 'zod';

// ── MultipleChoiceRoundSchema ─────────────────────────────────────────────────

describe('MultipleChoiceRoundSchema', () => {
  it('parses a valid round', () => {
    const result = MultipleChoiceRoundSchema.safeParse({
      id: 'r1', target: 'א', correct: 'אַרְיֵה', correctEmoji: '🦁',
    });
    expect(result.success).toBe(true);
  });

  it('enforces max length 2 on target', () => {
    const result = MultipleChoiceRoundSchema.safeParse({
      id: 'r1', target: 'אבג', correct: 'foo', correctEmoji: '🦁',
    });
    expect(result.success).toBe(false);
  });

  it('allows optional image field', () => {
    const result = MultipleChoiceRoundSchema.safeParse({
      id: 'r1', target: 'א', correct: 'foo', correctEmoji: '🦁', image: 'data:image/png;base64,abc',
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.image).toBe('data:image/png;base64,abc');
  });

  it('passes through unknown extra fields', () => {
    const result = MultipleChoiceRoundSchema.safeParse({
      id: 'r1', target: 'א', correct: 'foo', correctEmoji: '🦁', customField: 'hello',
    });
    expect(result.success).toBe(true);
    if (result.success) expect((result.data as Record<string, unknown>).customField).toBe('hello');
  });
});

// ── GameMetaSchema ────────────────────────────────────────────────────────────

describe('GameMetaSchema', () => {
  it('fills in defaults for missing fields', () => {
    const result = GameMetaSchema.parse({});
    expect(result.title).toBe('');
    expect(result.type).toBe('multiple-choice');
  });

  it('preserves provided values', () => {
    const result = GameMetaSchema.parse({ title: 'מבחן', type: 'drag-match' });
    expect(result.title).toBe('מבחן');
    expect(result.type).toBe('drag-match');
  });
});

// ── GameDataSchema ────────────────────────────────────────────────────────────

describe('GameDataSchema', () => {
  it('parses a minimal game data object', () => {
    const result = GameDataSchema.safeParse({ id: 'my-game' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe('my-game');
      expect(result.data.rounds).toEqual([]);
      expect(result.data.version).toBe(1);
    }
  });

  it('rejects missing id', () => {
    const result = GameDataSchema.safeParse({ rounds: [] });
    expect(result.success).toBe(false);
  });
});

// ── BUILTIN_ROUND_SCHEMAS ─────────────────────────────────────────────────────

describe('BUILTIN_ROUND_SCHEMAS', () => {
  it('contains multiple-choice and drag-match entries', () => {
    expect(BUILTIN_ROUND_SCHEMAS['multiple-choice']).toBeDefined();
    expect(BUILTIN_ROUND_SCHEMAS['drag-match']).toBeDefined();
  });
});

// ── schemaToFields ────────────────────────────────────────────────────────────

describe('schemaToFields', () => {
  it('returns a FieldSpec for each non-reserved field', () => {
    const fields = schemaToFields(MultipleChoiceRoundSchema);
    const keys = fields.map(f => f.key);
    // id and image are reserved — should not appear
    expect(keys).not.toContain('id');
    expect(keys).not.toContain('image');
    expect(keys).toContain('target');
    expect(keys).toContain('correct');
    expect(keys).toContain('correctEmoji');
  });

  it('uses .describe() text as the field label', () => {
    const fields = schemaToFields(MultipleChoiceRoundSchema);
    const targetField = fields.find(f => f.key === 'target');
    expect(targetField?.label).toBe('אות יעד');
  });

  it('sets maxLength from z.string().max(N)', () => {
    const fields = schemaToFields(MultipleChoiceRoundSchema);
    const targetField = fields.find(f => f.key === 'target');
    expect(targetField?.maxLength).toBe(2);
  });

  it('marks emoji fields correctly', () => {
    const fields = schemaToFields(MultipleChoiceRoundSchema);
    const emojiField = fields.find(f => f.key === 'correctEmoji');
    expect(emojiField?.type).toBe('emoji');
  });

  it('marks plain string fields as text', () => {
    const fields = schemaToFields(MultipleChoiceRoundSchema);
    const correctField = fields.find(f => f.key === 'correct');
    expect(correctField?.type).toBe('text');
  });

  it('produces select type for z.enum fields', () => {
    const schema = z.object({
      id:     z.string(),
      layout: z.enum(['grid-2x2', 'grid-3x1']).describe('פריסה'),
    });
    const fields = schemaToFields(schema);
    const layoutField = fields.find(f => f.key === 'layout');
    expect(layoutField?.type).toBe('select');
    expect(layoutField?.options).toEqual(['grid-2x2', 'grid-3x1']);
  });

  it('produces boolean type for z.boolean fields', () => {
    const schema = z.object({
      id:      z.string(),
      shuffle: z.boolean().describe('ערבב'),
    });
    const fields = schemaToFields(schema);
    expect(fields.find(f => f.key === 'shuffle')?.type).toBe('boolean');
  });

  it('produces number type with min/max for z.number fields', () => {
    const schema = z.object({
      id:         z.string(),
      numOptions: z.number().min(2).max(6).describe('כמות אפשרויות'),
    });
    const fields = schemaToFields(schema);
    const f = fields.find(f => f.key === 'numOptions');
    expect(f?.type).toBe('number');
    expect(f?.min).toBe(2);
    expect(f?.max).toBe(6);
  });

  it('handles z.optional() wrapped fields', () => {
    const schema = z.object({
      id:    z.string(),
      notes: z.string().optional().describe('הערות'),
    });
    const fields = schemaToFields(schema);
    expect(fields.find(f => f.key === 'notes')?.type).toBe('text');
  });

  it('handles z.default() wrapped fields', () => {
    const schema = z.object({
      id:     z.string(),
      active: z.boolean().default(true).describe('פעיל'),
    });
    const fields = schemaToFields(schema);
    expect(fields.find(f => f.key === 'active')?.type).toBe('boolean');
  });

  it('returns empty array for a schema with only reserved fields', () => {
    const schema = z.object({ id: z.string(), image: z.string().optional() });
    expect(schemaToFields(schema)).toEqual([]);
  });

  it('DragMatchRoundSchema produces the same field structure as MultipleChoiceRoundSchema', () => {
    const mc = schemaToFields(MultipleChoiceRoundSchema).map(f => f.key);
    const dm = schemaToFields(DragMatchRoundSchema).map(f => f.key);
    expect(mc).toEqual(dm);
  });
});
