/**
 * קופסת ניקוד — ריבוע ריק (מסמל אות) עם סימן ניקוד מחוצה לו
 * [נוסף על ידי: nikud-match game]
 */

/**
 * צור אלמנט DOM של קופסת ניקוד
 * הריבוע מסמל מקום לאות, וסימן הניקוד מוצג מחוצה לו במיקום הנכון
 * @param {object} nikud - אובייקט ניקוד מ-nikudList (חייב id ו-symbol)
 * @param {object} [opts]
 * @param {string} [opts.size] - 'sm' | 'md' | 'lg' (ברירת מחדל 'md')
 * @returns {HTMLElement}
 */
export function createNikudBox(nikud, { size = 'md' } = {}) {
  const wrapper = document.createElement('div');
  wrapper.className = `ab-nikud-box ab-nikud-box--${size} ab-nikud-box--${nikud.id}`;

  const box = document.createElement('div');
  box.className = 'ab-nikud-box__box';

  const mark = document.createElement('div');
  mark.className = 'ab-nikud-box__mark';
  mark.textContent = nikud.symbol;

  wrapper.appendChild(box);
  wrapper.appendChild(mark);

  return wrapper;
}
