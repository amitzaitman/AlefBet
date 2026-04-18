/**
 * חוזה createNikudBox
 *
 * הקופסה מציגה ריבוע מקווקו (מסמן את האות) ולצידה SVG של סימן הניקוד.
 * עברנו ל-SVG כדי לקבל מראה זהה בכל פלטפורמה ולהפסיק להיתלות בהתנהגות
 * הסימנים הצירופיים של מנוע הטקסט (היה בעייתי במיוחד ב-iOS Safari).
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { createNikudBox } from '../../ui/nikud-box.js';
import { nikudGlyphSvg, NIKUD_GLYPH_IDS } from '../../ui/nikud-glyphs.js';
import { nikudList } from '../../data/nikud.js';
import { mountContainer } from '../helpers.js';

let container;
beforeEach(() => { container = mountContainer(); });

describe('createNikudBox — wrapper structure', () => {
  it('renders a wrapper with id-specific class', () => {
    const patah = nikudList.find(n => n.id === 'patah');
    container.appendChild(createNikudBox(patah));
    const wrap = container.querySelector('.ab-nikud-box');
    expect(wrap).toBeTruthy();
    expect(wrap.classList.contains('ab-nikud-box--patah')).toBe(true);
    expect(wrap.classList.contains('ab-nikud-box--md')).toBe(true);
  });

  it('honours the size option', () => {
    const tzere = nikudList.find(n => n.id === 'tzere');
    container.appendChild(createNikudBox(tzere, { size: 'lg' }));
    expect(container.querySelector('.ab-nikud-box--lg')).toBeTruthy();
  });

  it('renders the dashed letter placeholder and a mark element', () => {
    const segol = nikudList.find(n => n.id === 'segol');
    container.appendChild(createNikudBox(segol));
    expect(container.querySelector('.ab-nikud-box__box')).toBeTruthy();
    expect(container.querySelector('.ab-nikud-box__mark')).toBeTruthy();
  });
});

describe('createNikudBox — SVG mark', () => {
  it('renders an inline svg inside the mark element', () => {
    for (const n of nikudList) {
      const box = createNikudBox(n);
      const svg = box.querySelector('.ab-nikud-box__mark svg');
      expect(svg, `svg missing for ${n.id}`).toBeTruthy();
      expect(svg.getAttribute('viewBox'), `viewBox for ${n.id}`).toBe('0 0 32 16');
      expect(svg.getAttribute('aria-hidden'), `aria-hidden for ${n.id}`).toBe('true');
    }
  });

  it('mark contains no Hebrew nikud characters (rendering is purely SVG)', () => {
    // ננעלים על האינווריאנט: אסור שייכנס בחזרה תו צירופי של נקוד
    // לתוך ה-DOM של ה-mark — היה גורם להבדלי רינדור בין דפדפנים.
    for (const n of nikudList) {
      const mark = createNikudBox(n).querySelector('.ab-nikud-box__mark');
      expect(/[\u05B0-\u05C7]/.test(mark.textContent), `${n.id} leaks combining char`).toBe(false);
    }
  });
});

describe('nikudGlyphSvg', () => {
  it('returns SVG markup for every nikud id in nikudList', () => {
    for (const n of nikudList) {
      const svg = nikudGlyphSvg(n.id);
      expect(svg, `glyph for ${n.id}`).toBeTruthy();
      expect(svg).toMatch(/^<svg[\s>]/);
    }
  });

  it('returns null for unknown ids', () => {
    expect(nikudGlyphSvg('nonsense')).toBeNull();
  });

  it('NIKUD_GLYPH_IDS covers the seven canonical nikud', () => {
    for (const id of ['kamatz', 'patah', 'hiriq', 'tzere', 'segol', 'holam', 'kubbutz']) {
      expect(NIKUD_GLYPH_IDS, `missing ${id}`).toContain(id);
    }
  });
});
