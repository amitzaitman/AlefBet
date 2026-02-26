/**
 * נתוני הניקוד העברי
 * כולל את סמלי הניקוד, שמותיהם ואופן הגייתם
 * [נוסף על ידי: nikud-match game]
 */

/** רשימת סימני הניקוד העיקריים */
export const nikudList = [
  { id: 'kamatz', name: 'קָמָץ', nameNikud: 'קָמָץ', symbol: '\u05B8', sound: 'אָ', color: '#FF6B6B', textColor: '#fff' },
  { id: 'patah', name: 'פֶּתַח', nameNikud: 'פָּתַח', symbol: '\u05B7', sound: 'אָ', color: '#FF8C42', textColor: '#fff' },
  { id: 'hiriq', name: 'חִירִיק', nameNikud: 'חִירִיק', symbol: '\u05B4', sound: 'אִי', color: '#4ECDC4', textColor: '#fff' },
  { id: 'tzere', name: 'צָרָה', nameNikud: 'צֵרֶה', symbol: '\u05B5', sound: 'אֶ', color: '#45B7D1', textColor: '#fff' },
  { id: 'segol', name: 'סָגֹוֽל', nameNikud: 'סְגוֹל', symbol: '\u05B6', sound: 'אֶ', color: '#9B59B6', textColor: '#fff' },
  { id: 'holam', name: 'חוֹלֵם', nameNikud: 'חוֹלָם', symbol: '\u05B9', sound: 'אֹ', color: '#2ECC71', textColor: '#fff' },
  { id: 'kubbutz', name: 'קֻוֽבּוּץ', nameNikud: 'קֻבּוּץ', symbol: '\u05BB', sound: 'אֻ', color: '#F39C12', textColor: '#fff' },
  { id: 'shva', name: 'שָׁוְוֽא', nameNikud: 'שְׁוָא', symbol: '\u05B0', sound: 'אְ', color: '#95A5A6', textColor: '#fff' },
];

/** אותיות בסיס לשימוש עם ניקוד (ללא אותיות סופיות) */
export const nikudBaseLetters = ['א', 'ב', 'ג', 'ד', 'מ', 'נ', 'ל', 'ר', 'ש', 'ת', 'פ', 'ק'];

/**
 * בנה מחרוזת של אות עם ניקוד
 * @param {string} letter - האות
 * @param {string} symbol - סמל הניקוד (תו Unicode)
 * @returns {string}
 */
export function letterWithNikud(letter, symbol) {
  return letter + symbol;
}

/**
 * בחר n פריטי ניקוד אקראיים, תוך תמיכה בסינון לסינון על ידי מורה
 * @param {number} count
 * @returns {Array}
 */
export function randomNikud(count) {
  let list = [...nikudList];

  if (typeof window !== 'undefined' && window.location && window.location.search) {
    const params = new URLSearchParams(window.location.search);

    const allowed = params.get('allowedNikud');
    if (allowed) {
      const allowedNames = allowed.split(',').map(s => s.trim());
      list = list.filter(n =>
        allowedNames.includes(n.id) ||
        allowedNames.includes(n.name) ||
        allowedNames.includes(n.nameNikud)
      );
    }

    const excluded = params.get('excludedNikud');
    if (excluded) {
      const excludedNames = excluded.split(',').map(s => s.trim());
      list = list.filter(n =>
        !excludedNames.includes(n.id) &&
        !excludedNames.includes(n.name) &&
        !excludedNames.includes(n.nameNikud)
      );
    }
  }

  if (list.length === 0) {
    list = [...nikudList]; // חזרה למצב בסיס אם הסינון רוקן הכל
  }

  // אם המורה בחר מעט ניקודים, נכפיל כדי שנספק מספיק לרמת המשחק
  let resultPool = [...list];
  while (resultPool.length < count) {
    resultPool.push(...list);
  }

  return resultPool.sort(() => Math.random() - 0.5).slice(0, count);
}
