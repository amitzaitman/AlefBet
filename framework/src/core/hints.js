/**
 * מעקב רמזים מדורג - הלב של עקרון "פידבק בונה, לא שולל".
 *
 * במקום לסמן לילד "טעית", המשחק סופר ניסיונות שגויים בשקט ומגיב
 * בהדרגה: אחרי מספר ניסיונות מציע רמז עדין (הבהוב התשובה הנכונה),
 * ואחרי עוד ניסיונות מסלים לעזרה משמעותית (צמצום אפשרויות, הדגמה).
 * המודול טהור לחלוטין - ה-UI של הרמז נשאר בידי המשחק.
 *
 * API ציבורי:
 *   createHintTracker(opts) - יוצר מעקב לסיבוב אחד:
 *     miss()   - דיווח על ניסיון שגוי; מחזיר את רמת העזרה החדשה.
 *     level    - רמת העזרה הנוכחית (0=אין, 1=רמז, 2=עזרה מוגברת).
 *     misses   - מספר הניסיונות השגויים עד כה.
 *     reset()  - איפוס לקראת סיבוב חדש.
 */

/**
 * @param {object} [opts]
 * @param {number} [opts.hintAfter] - כמה ניסיונות שגויים לפני רמז ראשון (ברירת מחדל 2)
 * @param {number} [opts.escalateAfter] - כמה לפני עזרה מוגברת (ברירת מחדל 4)
 * @param {(misses: number) => void} [opts.onHint] - נקרא בכל miss ברמה 1
 * @param {(misses: number) => void} [opts.onEscalate] - נקרא בכל miss ברמה 2
 * @returns {{ miss: () => number, reset: () => void, readonly level: number, readonly misses: number }}
 */
export function createHintTracker({ hintAfter = 2, escalateAfter = 4, onHint, onEscalate } = {}) {
  let misses = 0;

  function levelFor(count) {
    if (count >= escalateAfter) return 2;
    if (count >= hintAfter) return 1;
    return 0;
  }

  return {
    /** דיווח על ניסיון שגוי. מפעיל את הקולבק המתאים ומחזיר את הרמה. */
    miss() {
      misses++;
      const level = levelFor(misses);
      if (level === 2 && onEscalate) onEscalate(misses);
      else if (level === 1 && onHint) onHint(misses);
      return level;
    },

    /** איפוס לקראת סיבוב חדש. */
    reset() {
      misses = 0;
    },

    /** רמת העזרה הנוכחית: 0 ללא, 1 רמז עדין, 2 עזרה מוגברת. */
    get level() {
      return levelFor(misses);
    },

    /** מספר הניסיונות השגויים בסיבוב הנוכחי. */
    get misses() {
      return misses;
    },
  };
}
