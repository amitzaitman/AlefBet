/**
 * מילות המספרים מ-0 עד 10, מנוקדות, לקריינות של משחקי חשבון.
 *
 * בסיפור המספר מוצג בספרות, כדי שיתאים לתרגיל, ונאמר במילים שמתאימות
 * למין של שם העצם ("שְׁנֵי בָּלוֹנִים", "שְׁתֵּי קְפִיצוֹת"). ספירה ותרגילים
 * נאמרים בצורת הנקבה ("שָׁלוֹשׁ", "אַרְבַּע").
 *
 * API ציבורי:
 *   numberWord(n, gender)       - המילה למספר, או הספרות מחוץ לטווח 0 עד 10.
 *   countNoun(n, noun, options) - מספר ושם עצם שמתאימים זה לזה.
 *   exerciseWords(op, a, b)     - תרגיל במילים: "אַרְבַּע וְעוֹד שָׁלוֹשׁ".
 */

/** צורת הזכר מתאימה לשמות עצם בזכר, כמו בָּלוֹן. */
const MASCULINE = ['אֶפֶס', 'אֶחָד', 'שְׁנַיִם', 'שְׁלוֹשָׁה', 'אַרְבָּעָה', 'חֲמִשָּׁה', 'שִׁשָּׁה', 'שִׁבְעָה', 'שְׁמוֹנָה', 'תִּשְׁעָה', 'עֲשָׂרָה'];
/** צורת הנקבה היא צורת הספירה והתרגילים, ומתאימה לשמות עצם בנקבה, כמו קְפִיצָה. */
const FEMININE = ['אֶפֶס', 'אַחַת', 'שְׁתַּיִם', 'שָׁלוֹשׁ', 'אַרְבַּע', 'חָמֵשׁ', 'שֵׁשׁ', 'שֶׁבַע', 'שְׁמוֹנֶה', 'תֵּשַׁע', 'עֶשֶׂר'];

/**
 * שם עצם לספירה: יחיד, רבים, ומין שקובע את צורת המספר.
 * @typedef {{ one: string, many: string, gender: 'f' | 'm' }} CountedNoun
 */

/**
 * המילה למספר: 'שָׁלוֹשׁ' בנקבה (ברירת המחדל), 'שְׁלוֹשָׁה' בזכר.
 * מחוץ לטווח 0 עד 10 מוחזרות הספרות עצמן.
 * @param {number} n
 * @param {'f' | 'm'} [gender]
 * @returns {string}
 */
export function numberWord(n, gender = 'f') {
  if (!Number.isInteger(n) || n < 0 || n > 10) return String(n);
  return (gender === 'm' ? MASCULINE : FEMININE)[n];
}

/**
 * מספר ושם עצם שמתאימים זה לזה. 1 נאמר אחרי שם העצם ('קְפִיצָה אַחַת',
 * 'בָּלוֹן אֶחָד'), 2 בצורת הסמיכות ('שְׁתֵּי קְפִיצוֹת', 'שְׁנֵי בָּלוֹנִים'),
 * ושאר המספרים לפני שם העצם ('אַרְבָּעָה בָּלוֹנִים').
 * עם digits מתקבלת הצורה שמוצגת בסיפור ('4 קְפִיצוֹת'); 1 נשאר במילה.
 * @param {number} n
 * @param {CountedNoun} noun
 * @param {{ digits?: boolean }} [options]
 * @returns {string}
 */
export function countNoun(n, noun, { digits = false } = {}) {
  if (n === 1) return `${noun.one} ${numberWord(1, noun.gender)}`;
  if (digits) return `${n} ${noun.many}`;
  if (n === 2) return `${noun.gender === 'm' ? 'שְׁנֵי' : 'שְׁתֵּי'} ${noun.many}`;
  return `${numberWord(n, noun.gender)} ${noun.many}`;
}

/**
 * תרגיל במילים, בצורת הספירה: 'אַרְבַּע וְעוֹד שָׁלוֹשׁ', 'שֵׁשׁ פָּחוֹת שְׁתַּיִם'.
 * @param {'+' | '-'} op
 * @param {number} a
 * @param {number} b
 * @returns {string}
 */
export function exerciseWords(op, a, b) {
  return `${numberWord(a)} ${op === '+' ? 'וְעוֹד' : 'פָּחוֹת'} ${numberWord(b)}`;
}
