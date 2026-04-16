/**
 * schema-to-fields — converts a ZodObject into FieldSpec[] for the inspector.
 *
 * Each Zod field drives:
 *   z.string()            → text input
 *   z.string().max(N)     → text input with maxLength
 *   z.boolean()           → toggle checkbox
 *   z.enum([...])         → select dropdown
 *   z.number()            → number input (with optional min/max)
 *   key/description containing 'אמוג' or 'emoji' → emoji picker
 *
 * Use .describe('Hebrew label') on each field to set the inspector label.
 * Fields listed in RESERVED are skipped (handled by dedicated inspector UI).
 */
import { z } from 'zod';

// ── Field spec ────────────────────────────────────────────────────────────────

export type FieldType = 'text' | 'emoji' | 'boolean' | 'select' | 'number' | 'textarea';

export interface FieldSpec {
  key:          string;
  label:        string;
  type:         FieldType;
  options?:     readonly string[];
  maxLength?:   number;
  min?:         number;
  max?:         number;
  placeholder?: string;
  dir?:         'rtl' | 'ltr';
}

// ── Internals ─────────────────────────────────────────────────────────────────

/** Keys managed by dedicated inspector UI — not auto-rendered from schema */
const RESERVED = new Set(['id', 'image']);

/** Unwrap ZodOptional / ZodDefault wrappers to reach the inner type */
function unwrap(field: z.ZodTypeAny): z.ZodTypeAny {
  if (field instanceof z.ZodOptional) return unwrap(field.unwrap() as z.ZodTypeAny);
  if (field instanceof z.ZodDefault)  return unwrap(field._def.innerType as z.ZodTypeAny);
  return field;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Convert a ZodObject into an array of FieldSpec for the round inspector.
 *
 * @example
 * const fields = schemaToFields(MultipleChoiceRoundSchema);
 * // → [ { key: 'target', label: 'אות יעד', type: 'text', maxLength: 2 }, ... ]
 */
export function schemaToFields(schema: z.ZodObject<z.ZodRawShape>): FieldSpec[] {
  const specs: FieldSpec[] = [];

  for (const [key, rawField] of Object.entries(schema.shape)) {
    if (RESERVED.has(key)) continue;

    const zodField = rawField as z.ZodTypeAny;
    const inner    = unwrap(zodField);
    const label    = zodField.description ?? key;

    if (inner instanceof z.ZodBoolean) {
      specs.push({ key, label, type: 'boolean' });
      continue;
    }

    if (inner instanceof z.ZodEnum) {
      specs.push({ key, label, type: 'select', options: inner.options as string[] });
      continue;
    }

    if (inner instanceof z.ZodNumber) {
      // Zod v4 exposes public getters instead of _def.checks
      const num = inner as z.ZodNumber & { minValue?: number | null; maxValue?: number | null };
      specs.push({
        key, label, type: 'number',
        min: num.minValue ?? undefined,
        max: num.maxValue ?? undefined,
      });
      continue;
    }

    if (inner instanceof z.ZodString) {
      // Zod v4 exposes public getters instead of _def.checks
      const str      = inner as z.ZodString & { minLength?: number | null; maxLength?: number | null };
      const isEmoji  = key.toLowerCase().includes('emoji') || label.includes('אמוג');
      specs.push({
        key, label,
        type:      isEmoji ? 'emoji' : 'text',
        maxLength: str.maxLength ?? undefined,
      });
      continue;
    }

    // Fallback for any other Zod type
    specs.push({ key, label, type: 'text' });
  }

  return specs;
}
