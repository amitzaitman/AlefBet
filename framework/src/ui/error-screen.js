/**
 * מסך שגיאה גלובלי ידידותי לילדים.
 *
 * שגיאת JavaScript לא-מטופלת (error / unhandledrejection) לא תשאיר ילד
 * מול מסך לבן או משחק קפוא: מוצג כיסוי חם עם כפתור "להתחיל מחדש" גדול.
 * ההתקנה אידמפוטנטית (מותקן פעם אחת לחלון) והכיסוי מוצג רק פעם אחת -
 * שגיאות המשך לא מערימות כיסויים.
 *
 * API ציבורי:
 *   installGlobalErrorScreen() - התקנת המאזינים; מחזיר { destroy }.
 */

let _installed = false;
let _shown = false;
/** @type {(() => void) | null} */
let _teardown = null;

/** הודעות רעש מוכרות שאינן קריסה אמיתית של המשחק. */
const IGNORED_PATTERNS = [
  'ResizeObserver loop', // אזהרת דפדפן שפירה
  'Script error.',       // שגיאת cross-origin אטומה, לרוב תוסף דפדפן
];

function _isIgnorable(message) {
  const msg = String(message || '');
  return IGNORED_PATTERNS.some(p => msg.includes(p));
}

function _showOverlay() {
  if (_shown || typeof document === 'undefined' || !document.body) return;
  _shown = true;

  const overlay = document.createElement('div');
  overlay.className = 'ab-error-screen';
  overlay.setAttribute('role', 'alert');
  overlay.dir = 'rtl';
  overlay.innerHTML = `
    <div class="ab-error-screen__card">
      <div class="ab-error-screen__emoji">🙈</div>
      <h2 class="ab-error-screen__title">אוֹפְּס! מַשֶּׁהוּ הִשְׁתַּבֵּשׁ</h2>
      <p class="ab-error-screen__text">זֶה לֹא בִּגְלַלְכֶם! לְחִיצָה עַל הַכַּפְתּוֹר תַּחְזִיר אֶת הַמִּשְׂחָק.</p>
      <button type="button" class="btn btn--primary ab-error-screen__reload">לְהַתְחִיל מֵחָדָשׁ</button>
    </div>
  `;
  overlay.querySelector('.ab-error-screen__reload')?.addEventListener('click', () => {
    try { location.reload(); } catch { /* noop */ }
  });
  document.body.appendChild(overlay);
}

/**
 * התקנת רשת הביטחון הגלובלית. קריאה חוזרת אינה מוסיפה מאזינים.
 * @returns {{ destroy: () => void }}
 */
export function installGlobalErrorScreen() {
  if (typeof window === 'undefined') return { destroy() { /* noop */ } };
  if (_installed) return { destroy() { /* noop */ } };
  _installed = true;

  /** @param {ErrorEvent} ev */
  const onError = (ev) => {
    if (_isIgnorable(ev?.message)) return;
    console.error('[alefbet] uncaught error:', ev?.error ?? ev?.message);
    _showOverlay();
  };
  /** @param {PromiseRejectionEvent} ev */
  const onRejection = (ev) => {
    const reason = /** @type {any} */ (ev)?.reason;
    if (_isIgnorable(reason?.message ?? reason)) return;
    console.error('[alefbet] unhandled rejection:', reason);
    _showOverlay();
  };

  window.addEventListener('error', onError);
  window.addEventListener('unhandledrejection', onRejection);

  _teardown = () => {
    window.removeEventListener('error', onError);
    window.removeEventListener('unhandledrejection', onRejection);
    _installed = false;
    _shown = false;
  };

  return { destroy: () => { _teardown?.(); _teardown = null; } };
}
