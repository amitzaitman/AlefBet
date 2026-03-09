/**
 * קופסת ניקוד — ריבוע ריק (מסמל אות) עם סימן ניקוד במיקומו הנכון מחוצה לו
 * [נוסף על ידי: nikud-match game]
 */

/**
 * צור אלמנט DOM של קופסת ניקוד
 * הריבוע מסמל מקום לאות, וסימן הניקוד נראה מחוץ לריבוע במיקום הנכון
 * @param {object} nikud — אובייקט ניקוד מ-nikudList (חייב symbol)
 * @param {object} [opts]
 * @param {string} [opts.size] — 'sm' | 'md' | 'lg' (ברירת מחדל 'md')
 * @returns {HTMLElement}
 */
export function createNikudBox(nikud, { size = 'md' } = {}) {
  const wrapper = document.createElement('div');
  wrapper.className = `ab-nikud-box ab-nikud-box--${size}`;

  // Text layer: ◌ + nikud — nikud extends beyond the box
  const text = document.createElement('span');
  text.className = 'ab-nikud-box__text';
  text.textContent = '\u25CC' + nikud.symbol;

  // Box layer: opaque, covers the ◌ but nikud sticks out
  const box = document.createElement('div');
  box.className = 'ab-nikud-box__box';

  wrapper.appendChild(text);
  wrapper.appendChild(box);

  return wrapper;
}
