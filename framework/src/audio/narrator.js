/**
 * הקריין של משחקי הסיפור: מקריא משפט ומחזיק אותו על המסך זמן קצוב.
 *
 * כל משפט נשאר "עכשווי" לפחות BEAT_MS, גם בלי קול, כך שהסיפור מתקדם באותו
 * קצב בכל מכשיר. אם הקול לא מסיים, הקריין מוותר אחרי גבול זמן שנגזר מאורך
 * המשפט, ולכן קול שקט או חסום אף פעם לא תוקע את הסיפור.
 *
 * כל ההמתנות עוברות דרך scope של הסיבוב: אחרי פירוק ה-scope הן לא
 * מסתיימות לעולם, והסיפור פשוט נעצר. ניקוי שייך ל-scope.use, לא לקוד שאחרי await.
 *
 * API ציבורי:
 *   createNarrator(scope)          - { wait, say, speak, hush } לסיבוב אחד.
 *   needsTap()                     - האם הקול עוד מחכה לנגיעה ראשונה בדף.
 *   BEAT_MS, HUSH_MS               - משך משפט מינימלי, והפסקה אחרי ביטול דיבור.
 */
import { tts } from './tts.js';

/** הזמן הקצר ביותר שמשפט נשאר עכשווי, גם כשאין קול. */
export const BEAT_MS = 1200;
/** הפסקה אחרי ביטול דיבור: iOS עלול לבלוע משפט שנאמר מיד אחרי ביטול. */
export const HUSH_MS = 250;
/** ניקוד וטעמים לא נספרים באורך המשפט. */
const MARKS = /[֑-ׇ]/g;

/**
 * משפטים בתור או בהשמעה, משותף לכל הקריינים כי ל-tts יש תור אחד.
 * המונה ברמת המודול בכוונה: runGame מפרק את הסיבוב הישן ובונה את הבא באותו
 * tick, ו-tts.cancel פותר את ההבטחות מיד, אבל ה-finally שמוריד את המונה רץ
 * ב-microtask מאוחר יותר. כך ה-hush הראשון של הסיבוב החדש עוד רואה את המשפט
 * הישן ומחזיר true, והסיבוב מחכה HUSH_MS לפני שהוא מדבר. מונה לכל קריין היה
 * מוותר על ההפסקה הזו.
 */
let pending = 0;

/**
 * קריין לסיבוב אחד.
 * @param {Pick<ReturnType<typeof import('../core/round-scope.js').createRoundScope>, 'schedule' | 'use'>} scope
 */
export function createNarrator(scope) {
  /**
   * המתנה דרך ה-scope; לא מסתיימת אם ה-scope התפרק.
   * @param {number} ms
   * @returns {Promise<undefined>}
   */
  const wait = ms => new Promise(resolve => { scope.schedule(() => resolve(undefined), ms); });

  /**
   * מקריא בלי הגבלת זמן. ההבטחה של tts תמיד נפתרת, גם בכשל ובביטול.
   * @param {string} text
   * @returns {Promise<void>}
   */
  const speak = text => {
    pending++;
    return tts.speak(text).finally(() => { pending--; });
  };

  /**
   * מבטל את הדיבור, אם יש כזה.
   * @returns {boolean} האם היה דיבור לבטל
   */
  const hush = () => {
    if (!pending) return false;
    tts.cancel();
    return true;
  };

  /**
   * מקריא משפט ונפתר אחרי minMs, וגם אחרי שהקול סיים או שעבר limitMs, המוקדם מביניהם.
   * @param {string} text
   * @param {number} [minMs] - ברירת מחדל: BEAT_MS
   * @param {number} [limitMs] - ברירת מחדל: minMs + 1500 + 120 לכל אות בלי ניקוד
   * @returns {Promise<unknown>}
   */
  const say = (text, minMs = BEAT_MS, limitMs = minMs + 1500 + text.replace(MARKS, '').length * 120) =>
    Promise.all([wait(minMs), Promise.race([speak(text), wait(limitMs)])]);

  scope.use(() => { hush(); });
  return { wait, say, speak, hush };
}

/**
 * true כשהקול עוד צריך נגיעה ראשונה: navigator.userActivation קיים ומעולם לא היה פעיל.
 * @returns {boolean}
 */
export const needsTap = () => !!globalThis.navigator?.userActivation && !navigator.userActivation.hasBeenActive;
