/**
 * נתוני הניקוד העברי
 * כולל את סמלי הניקוד, שמותיהם ואופן הגייתם
 * [נוסף על ידי: nikud-match game]
 */

/** רשימת סימני הניקוד העיקריים */
export const nikudList = [
  { id: 'kamatz',  name: 'קמץ',    nameNikud: 'קָמַץ',   symbol: '\u05B8', sound: 'אָ',  color: '#FF6B6B', textColor: '#fff' },
  { id: 'patah',   name: 'פתח',    nameNikud: 'פַּתַח',   symbol: '\u05B7', sound: 'אַ',  color: '#FF8C42', textColor: '#fff' },
  { id: 'hiriq',   name: 'חיריק',  nameNikud: 'חִירִיק',  symbol: '\u05B4', sound: 'אִי', color: '#4ECDC4', textColor: '#fff' },
  { id: 'tzere',   name: 'צרה',    nameNikud: 'צֵרֶה',   symbol: '\u05B5', sound: 'אֵ',  color: '#45B7D1', textColor: '#fff' },
  { id: 'segol',   name: 'סגול',   nameNikud: 'סְגוֹל',   symbol: '\u05B6', sound: 'אֶ',  color: '#9B59B6', textColor: '#fff' },
  { id: 'holam',   name: 'חולם',   nameNikud: 'חוֹלָם',   symbol: '\u05B9', sound: 'אֹ',  color: '#2ECC71', textColor: '#fff' },
  { id: 'kubbutz', name: 'קובוץ',  nameNikud: 'קֻבּוּץ',  symbol: '\u05BB', sound: 'אֻ',  color: '#F39C12', textColor: '#fff' },
  { id: 'shva',    name: 'שווא',   nameNikud: 'שְׁוָא',   symbol: '\u05B0', sound: 'אְ',  color: '#95A5A6', textColor: '#fff' },
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
 * בחר n פריטי ניקוד אקראיים
 * @param {number} count
 * @returns {Array}
 */
export function randomNikud(count) {
  return [...nikudList].sort(() => Math.random() - 0.5).slice(0, count);
}
