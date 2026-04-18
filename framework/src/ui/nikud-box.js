/**
 * קופסת ניקוד - ריבוע ריק (מסמל אות) עם סימן ניקוד מחוצה לו
 * [נוסף על ידי: nikud-match game]
 */

// תו עוגן בלתי-נראה (NBSP) שעליו מוצמד סימן הניקוד.
// בלעדיו דפדפנים מציגים את הסימן הצירופי כריבוע ריק או לא מציגים כלל,
// במיוחד ב-Safari על iOS שלא משלים DOTTED CIRCLE אוטומטית.
const NIKUD_ANCHOR = '\u00A0';

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
  // העוגן והסימן חייבים לשבת באותו text node כדי שהדפדפן יתפוס אותם
  // כאשכול גרפמי אחד וירנדר את הסימן הצירופי על העוגן.
  mark.textContent = NIKUD_ANCHOR + nikud.symbol;

  wrapper.appendChild(box);
  wrapper.appendChild(mark);

  return wrapper;
}
