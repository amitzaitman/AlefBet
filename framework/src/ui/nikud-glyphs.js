/**
 * סמלי ניקוד מצוירים ב-SVG
 *
 * החלפנו רינדור טקסט (אות-ניקוד) ב-SVG ידני כדי לקבל מראה זהה בכל פלטפורמה
 * ולהסיר תלות בהתנהגות הסימנים הצירופיים של מנוע הטקסט (במיוחד ב-iOS Safari).
 *
 * כל סמל מצויר בתיבה 32×16, "תלוי" בקצה העליון של התיבה (top-aligned), כך שאפשר
 * למקם את ה-SVG מעל או מתחת לקופסה בלי להזיז את האנימציה. הצורות מילוי-בלבד עם
 * `currentColor` כדי שייקלטו את הצבע של הקונטיינר.
 */

const VIEWBOX = '0 0 32 16';

/** @type {Record<string, string>} */
const PATHS = {
  // קו אופקי עבה
  patah: '<rect x="3" y="5" width="26" height="4" rx="1.6"/>',
  // קו אופקי + זנב קצר היורד מהמרכז (T הפוך)
  kamatz:
    '<rect x="3" y="3" width="26" height="3.4" rx="1.4"/>' +
    '<rect x="14.4" y="6.4" width="3.2" height="6.6" rx="1.4"/>',
  // נקודה אחת
  hiriq: '<circle cx="16" cy="8" r="3.4"/>',
  // שתי נקודות זו לצד זו
  tzere:
    '<circle cx="9" cy="8" r="2.8"/>' +
    '<circle cx="23" cy="8" r="2.8"/>',
  // משולש הפוך — שתיים למעלה, אחת למטה במרכז
  segol:
    '<circle cx="8" cy="4" r="2.6"/>' +
    '<circle cx="24" cy="4" r="2.6"/>' +
    '<circle cx="16" cy="12" r="2.6"/>',
  // נקודה אחת (ממוקמת מעל הקופסה דרך .ab-nikud-box--holam)
  holam: '<circle cx="16" cy="8" r="3.4"/>',
  // שלוש נקודות אלכסון — מימין-למטה לשמאל-למעלה
  kubbutz:
    '<circle cx="6" cy="13" r="2.5"/>' +
    '<circle cx="16" cy="8"  r="2.5"/>' +
    '<circle cx="26" cy="3"  r="2.5"/>',
};

/**
 * החזר מחרוזת SVG מלאה (כולל תגית svg) עבור id ניקוד מסוים.
 * @param {string} nikudId - מזהה הניקוד (kamatz, patah, hiriq, ...)
 * @returns {string|null}
 */
export function nikudGlyphSvg(nikudId) {
  const inner = PATHS[nikudId];
  if (!inner) return null;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEWBOX}" ` +
    `aria-hidden="true" focusable="false">${inner}</svg>`
  );
}

/**
 * רשימת ה-IDs הנתמכים — שימושי לבדיקות ול-iteration.
 */
export const NIKUD_GLYPH_IDS = Object.freeze(Object.keys(PATHS));
