/**
 * קופסת ניקוד — תצוגת ריבוע ריק עם סימן ניקוד במיקום הנכון
 * שימושי להצגת סימן ניקוד בלי אות — למשחקי התאמה, בחירה ולימוד
 * [נוסף על ידי: nikud-match game]
 */

/**
 * צור אלמנט DOM של קופסת ניקוד — ריבוע עם סימן הניקוד במיקומו הנכון
 * משתמש בעיגול מנוקד (◌ U+25CC) כדי שהדפדפן ימקם את הניקוד בדיוק
 * @param {object} nikud — אובייקט ניקוד מ-nikudList (חייב id ו-symbol)
 * @param {object} [opts] — אפשרויות
 * @param {string} [opts.size] — גודל: 'sm' | 'md' | 'lg' (ברירת מחדל 'md')
 * @returns {HTMLElement}
 */
export function createNikudBox(nikud, { size = 'md' } = {}) {
  const box = document.createElement('div');
  box.className = `ab-nikud-box ab-nikud-box--${size}`;
  box.textContent = '\u25CC' + nikud.symbol; // ◌ + nikud
  return box;
}
