/**
 * קופסת ניקוד — תצוגת ריבוע ריק עם סימן ניקוד במיקום הנכון
 * שימושי להצגת סימן ניקוד בלי אות — למשחקי התאמה, בחירה ולימוד
 * [נוסף על ידי: nikud-match game]
 */

/**
 * צור אלמנט DOM של קופסת ניקוד — ריבוע ריק עם סימן הניקוד במיקומו הנכון
 * משתמש באות א שקופה כדי שהדפדפן ימקם את הניקוד בדיוק במקום הנכון
 * @param {object} nikud — אובייקט ניקוד מ-nikudList (חייב id ו-symbol)
 * @param {object} [opts] — אפשרויות
 * @param {string} [opts.size] — גודל: 'sm' | 'md' | 'lg' (ברירת מחדל 'md')
 * @returns {HTMLElement}
 */
export function createNikudBox(nikud, { size = 'md' } = {}) {
  const wrapper = document.createElement('div');
  wrapper.className = `ab-nikud-box ab-nikud-box--${size}`;

  const letter = document.createElement('span');
  letter.className = 'ab-nikud-box__letter';
  letter.textContent = '\u05D0' + nikud.symbol; // א + nikud

  wrapper.appendChild(letter);

  return wrapper;
}
