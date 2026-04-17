/**
 * חוזה activity-templates
 *
 * כל תבנית (2×2 / 3×3 / center-spotlight וכו') היא קטלוג נתונים שעורך המשחק
 * בונה ממנו סיבוב חדש. ערכים תחומים ב-0-100 (אחוזים של הסליד), ולכן קל
 * להכניס בטעות מספר מחוץ לגבולות. בדיקות אלה מאמתות את שלמות הקטלוג כנגד
 * ZoneSchema ומוודאות שגם לאחר ייצור מזהים הרשומות עדיין תקינות.
 */
import { describe, it, expect } from 'vitest';
import {
  ACTIVITY_TEMPLATES,
  generateZonesFromTemplate,
  type ActivityTemplate,
} from '../../editor/activity-templates.js';
import { ZoneSchema } from '../../editor/schemas.js';

describe('ACTIVITY_TEMPLATES — catalog integrity', () => {
  it('exposes the expected stable set of template ids', () => {
    const ids = ACTIVITY_TEMPLATES.map(t => t.id).sort();
    expect(ids).toEqual([
      'center-spotlight',
      'empty',
      'grid-2x2',
      'grid-3x3',
      'one-of-four',
      'row-of-3',
      'top-bottom',
      'two-columns',
    ]);
  });

  it('template ids are unique', () => {
    const ids = ACTIVITY_TEMPLATES.map(t => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every template has Hebrew name, icon and description', () => {
    for (const tpl of ACTIVITY_TEMPLATES) {
      expect(tpl.nameHe.trim(), `nameHe for ${tpl.id}`).not.toBe('');
      expect(tpl.icon.trim(), `icon for ${tpl.id}`).not.toBe('');
      expect(tpl.description.trim(), `description for ${tpl.id}`).not.toBe('');
    }
  });
});

describe('ACTIVITY_TEMPLATES — geometry', () => {
  it.each(ACTIVITY_TEMPLATES)('$id: zones stay within the 0-100 percent canvas', (tpl: ActivityTemplate) => {
    for (const z of tpl.zones) {
      expect(z.x, `${tpl.id} zone.x`).toBeGreaterThanOrEqual(0);
      expect(z.y, `${tpl.id} zone.y`).toBeGreaterThanOrEqual(0);
      expect(z.width, `${tpl.id} zone.width`).toBeGreaterThan(0);
      expect(z.height, `${tpl.id} zone.height`).toBeGreaterThan(0);
      expect(z.x + z.width, `${tpl.id} x+width`).toBeLessThanOrEqual(100);
      expect(z.y + z.height, `${tpl.id} y+height`).toBeLessThanOrEqual(100);
    }
  });

  it.each(ACTIVITY_TEMPLATES)('$id: every zone has shape=rect', (tpl: ActivityTemplate) => {
    for (const z of tpl.zones) {
      expect(z.shape).toBe('rect');
    }
  });
});

describe('ACTIVITY_TEMPLATES — selector vs layout templates', () => {
  it('"one-of-four" has exactly one correct zone', () => {
    const tpl = ACTIVITY_TEMPLATES.find(t => t.id === 'one-of-four')!;
    const correctCount = tpl.zones.filter(z => z.correct).length;
    expect(correctCount).toBe(1);
  });

  it('"center-spotlight" marks its single zone as correct', () => {
    const tpl = ACTIVITY_TEMPLATES.find(t => t.id === 'center-spotlight')!;
    expect(tpl.zones).toHaveLength(1);
    expect(tpl.zones[0].correct).toBe(true);
  });

  it('layout-only templates leave every zone with correct=false', () => {
    const layoutOnly = ['grid-2x2', 'grid-3x3', 'two-columns', 'top-bottom', 'row-of-3'];
    for (const id of layoutOnly) {
      const tpl = ACTIVITY_TEMPLATES.find(t => t.id === id)!;
      const anyCorrect = tpl.zones.some(z => z.correct);
      expect(anyCorrect, `template ${id} should have no correct zone`).toBe(false);
    }
  });

  it('"empty" produces no zones', () => {
    const tpl = ACTIVITY_TEMPLATES.find(t => t.id === 'empty')!;
    expect(tpl.zones).toEqual([]);
  });
});

describe('generateZonesFromTemplate', () => {
  it('attaches a unique id to each zone', () => {
    const tpl = ACTIVITY_TEMPLATES.find(t => t.id === 'grid-3x3')!;
    const zones = generateZonesFromTemplate(tpl);

    expect(zones).toHaveLength(9);
    const ids = zones.map(z => z.id);
    expect(new Set(ids).size).toBe(9);
    for (const id of ids) {
      expect(id).toMatch(/^tpl-zone-\d+-\d+$/);
    }
  });

  it('preserves all original geometry fields', () => {
    const tpl = ACTIVITY_TEMPLATES.find(t => t.id === 'grid-2x2')!;
    const zones = generateZonesFromTemplate(tpl);

    zones.forEach((z, i) => {
      expect(z.x).toBe(tpl.zones[i].x);
      expect(z.y).toBe(tpl.zones[i].y);
      expect(z.width).toBe(tpl.zones[i].width);
      expect(z.height).toBe(tpl.zones[i].height);
      expect(z.correct).toBe(tpl.zones[i].correct);
    });
  });

  it('returns an empty array for the "empty" template', () => {
    const tpl = ACTIVITY_TEMPLATES.find(t => t.id === 'empty')!;
    expect(generateZonesFromTemplate(tpl)).toEqual([]);
  });

  it('successive calls produce disjoint id sets', () => {
    const tpl = ACTIVITY_TEMPLATES.find(t => t.id === 'grid-2x2')!;
    const a = generateZonesFromTemplate(tpl).map(z => z.id);
    const b = generateZonesFromTemplate(tpl).map(z => z.id);
    const overlap = a.filter(id => b.includes(id));
    expect(overlap).toEqual([]);
  });
});

describe('ACTIVITY_TEMPLATES — ZoneSchema conformance', () => {
  it.each(ACTIVITY_TEMPLATES)('$id: every generated zone parses as a Zone', (tpl: ActivityTemplate) => {
    const zones = generateZonesFromTemplate(tpl);
    for (const z of zones) {
      expect(() => ZoneSchema.parse(z)).not.toThrow();
    }
  });
});
