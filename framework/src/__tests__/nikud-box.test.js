/**
 * חוזה createNikudBox
 *
 * הקופסה מציגה ריבוע מקווקו (מסמן את האות) ולצידה SVG של סימן הניקוד.
 * עברנו ל-SVG כדי לקבל מראה זהה בכל פלטפורמה ולהפסיק להיתלות בהתנהגות
 * הסימנים הצירופיים של מנוע הטקסט (היה בעייתי במיוחד ב-iOS Safari).
 */
import { describe, it, expect } from 'vitest';
import { createNikudBox } from '../../../games/nikud-match/nikud-box.js';
import { nikudGlyphSvg, NIKUD_GLYPH_IDS } from '../../../games/nikud-match/nikud-glyphs.js';
import { nikudList } from '../data/nikud.js';

const nikud = id => nikudList.find(n => n.id === id);

describe('createNikudBox', () => {
  it('renders a sized, id-specific wrapper around the dashed letter placeholder and a mark', () => {
    const patah = createNikudBox(nikud('patah'));
    expect(patah.classList.contains('ab-nikud-box')).toBe(true);
    expect(patah.classList.contains('ab-nikud-box--patah')).toBe(true);
    expect(patah.classList.contains('ab-nikud-box--md')).toBe(true);
    expect(patah.querySelector('.ab-nikud-box__box')).toBeTruthy();
    expect(createNikudBox(nikud('tzere'), { size: 'lg' }).classList.contains('ab-nikud-box--lg')).toBe(true);
  });

  it('draws every mark as an inline svg, with no Hebrew nikud characters in the mark', () => {
    for (const n of nikudList) {
      const mark = createNikudBox(n).querySelector('.ab-nikud-box__mark');
      const svg = mark.querySelector('svg');
      expect(svg, `svg missing for ${n.id}`).toBeTruthy();
      expect(svg.getAttribute('viewBox'), `viewBox for ${n.id}`).toBe('0 0 32 16');
      expect(svg.getAttribute('aria-hidden'), `aria-hidden for ${n.id}`).toBe('true');
      // ננעלים על האינווריאנט: אסור שייכנס בחזרה תו צירופי של נקוד
      // לתוך ה-DOM של ה-mark — היה גורם להבדלי רינדור בין דפדפנים.
      expect(/[\u05B0-\u05C7]/.test(mark.textContent), `${n.id} leaks combining char`).toBe(false);
    }
  });
});

describe('nikudGlyphSvg', () => {
  it('returns SVG markup for every nikud id in nikudList, and null for unknown ids', () => {
    for (const n of nikudList) expect(nikudGlyphSvg(n.id), `glyph for ${n.id}`).toMatch(/^<svg[\s>]/);
    expect(nikudGlyphSvg('nonsense')).toBeNull();
  });

  it('NIKUD_GLYPH_IDS covers the seven canonical nikud', () => {
    expect(NIKUD_GLYPH_IDS).toEqual(expect.arrayContaining(['kamatz', 'patah', 'hiriq', 'tzere', 'segol', 'holam', 'kubbutz']));
  });
});
