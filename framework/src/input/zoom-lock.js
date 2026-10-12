/**
 * נעילת זום במסכי משחק.
 *
 * ילדים מקישים פעמיים או נוגעים בשתי אצבעות בטעות, והמסך מתקרב או זז
 * מתחת לאצבע. במסך משחק אין צורך בהגדלה: הכפתורים כבר גדולים. גלילה
 * באצבע אחת נשארת, וגם גרירה (drag.js) לא משתנה.
 *
 * שלוש שכבות, כי כל דפדפן מכבד משהו אחר:
 * - המחלקה alefbet-zoom-lock על <html> מפעילה touch-action ב-alefbet.css:
 *   בלי הקשה כפולה בכל הדפדפנים, ובלי צביטה בכרום ובאנדרואיד.
 * - Safari ב-iOS מתעלם מ-user-scalable=no, ולכן חוסמים את אירועי
 *   המחווה שלו (gesturestart, gesturechange).
 * - תנועת מגע עם יותר מאצבע אחת נחסמת בכל דפדפן.
 *
 * API ציבורי:
 *   lockPageZoom(doc?) - מתקין פעם אחת לכל מסמך; קריאה חוזרת לא עושה כלום.
 *   ה-GameShell קורא לה, כך שכל משחק נעול בלי קוד נוסף.
 */

export const ZOOM_LOCK_CLASS = 'alefbet-zoom-lock';

/** @type {WeakSet<Document>} */
const lockedDocuments = new WeakSet();

/** @param {Event} event */
function block(event) {
  if (event.cancelable) event.preventDefault();
}

/** @param {Event} event */
function blockMultiTouch(event) {
  const touches = /** @type {TouchEvent} */ (event).touches;
  if (touches && touches.length > 1) block(event);
}

/**
 * @param {Document | null} [doc]
 * @returns {boolean} true אם הנעילה הותקנה בקריאה הזאת
 */
export function lockPageZoom(doc = typeof document !== 'undefined' ? document : null) {
  if (!doc || lockedDocuments.has(doc)) return false;
  lockedDocuments.add(doc);
  doc.documentElement.classList.add(ZOOM_LOCK_CLASS);
  // passive: false - אחרת הדפדפן מתעלם מ-preventDefault.
  const options = { passive: false };
  doc.addEventListener('gesturestart', block, options);
  doc.addEventListener('gesturechange', block, options);
  doc.addEventListener('touchmove', blockMultiTouch, options);
  return true;
}
