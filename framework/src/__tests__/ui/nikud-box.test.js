/**
 * חוזה createNikudBox
 *
 * הקופסה מציגה ריבוע מקווקו (מסמן את האות) וסימן ניקוד לידו.
 * התו עוגן (NBSP) נדרש כדי שהסימן הצירופי בכלל יראה בדפדפן.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { createNikudBox } from '../../ui/nikud-box.js';
import { nikudList } from '../../data/nikud.js';
import { mountContainer } from '../helpers.js';

let container;
beforeEach(() => { container = mountContainer(); });

describe('createNikudBox', () => {
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

  it('attaches the combining nikud to an invisible NBSP base so it actually renders', () => {
    // ללא תו בסיס דפדפנים מציגים את הסימן הצירופי כריבוע ריק או כלום.
    // הבדיקה הזו ננעלה על הפתרון: NBSP (U+00A0) ולאחריו הסימן באותו text node.
    for (const n of nikudList) {
      const box = createNikudBox(n);
      const mark = box.querySelector('.ab-nikud-box__mark');
      expect(mark.textContent.length, `mark text for ${n.id}`).toBe(2);
      expect(mark.textContent.charCodeAt(0), `anchor char for ${n.id}`).toBe(0x00A0);
      expect(mark.textContent.charCodeAt(1), `nikud char for ${n.id}`).toBe(n.symbol.charCodeAt(0));
    }
  });
});
