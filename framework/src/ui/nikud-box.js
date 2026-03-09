/**
 * קופסת ניקוד — תצוגת ריבוע ריק עם סימן ניקוד במיקום הנכון
 * שימושי להצגת סימן ניקוד בלי אות — למשחקי התאמה, בחירה ולימוד
 * [נוסף על ידי: nikud-match game]
 */

/**
 * צור אלמנט DOM של קופסת ניקוד — ריבוע ריק עם סימן הניקוד במיקומו הנכון
 * @param {object} nikud — אובייקט ניקוד מ-nikudList (חייב id ו-symbol)
 * @param {object} [opts] — אפשרויות
 * @param {string} [opts.size] — גודל: 'sm' | 'md' | 'lg' (ברירת מחדל 'md')
 * @returns {HTMLElement}
 */
export function createNikudBox(nikud, { size = 'md' } = {}) {
  const wrapper = document.createElement('div');
  wrapper.className = `ab-nikud-box ab-nikud-box--${nikud.id} ab-nikud-box--${size}`;

  const mark = document.createElement('div');
  mark.className = 'ab-nikud-box__mark';
  mark.textContent = nikud.symbol;

  const box = document.createElement('div');
  box.className = 'ab-nikud-box__placeholder';

  wrapper.appendChild(mark);
  wrapper.appendChild(box);

  return wrapper;
}
