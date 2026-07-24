/**
 * ui/error-screen - רשת הביטחון הגלובלית:
 * שגיאה לא-מטופלת מציגה כיסוי ידידותי פעם אחת; רעש מוכר מסונן;
 * ההתקנה אידמפוטנטית וניתנת לפירוק.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { installGlobalErrorScreen } from '../../ui/error-screen.js';

/** @type {{ destroy: () => void } | null} */
let handle = null;

beforeEach(() => {
  document.body.innerHTML = '';
});

afterEach(() => {
  handle?.destroy();
  handle = null;
});

function fireError(message) {
  window.dispatchEvent(new ErrorEvent('error', { message, error: new Error(message) }));
}

describe('installGlobalErrorScreen', () => {
  it('שגיאה לא-מטופלת מציגה את הכיסוי עם כפתור התחלה מחדש', () => {
    handle = installGlobalErrorScreen();
    fireError('boom');

    const overlay = document.querySelector('.ab-error-screen');
    expect(overlay).not.toBeNull();
    expect(overlay.textContent).toContain('מַשֶּׁהוּ הִשְׁתַּבֵּשׁ');
    expect(overlay.querySelector('.ab-error-screen__reload')).not.toBeNull();
  });

  it('הכיסוי מוצג פעם אחת בלבד גם על שגיאות מרובות', () => {
    handle = installGlobalErrorScreen();
    fireError('boom-1');
    fireError('boom-2');
    expect(document.querySelectorAll('.ab-error-screen')).toHaveLength(1);
  });

  it('unhandledrejection מציג את הכיסוי', () => {
    handle = installGlobalErrorScreen();
    // jsdom לא בונה PromiseRejectionEvent - אירוע מותאם עם reason מספיק.
    const ev = new Event('unhandledrejection');
    /** @type {any} */ (ev).reason = new Error('rejected!');
    window.dispatchEvent(ev);
    expect(document.querySelector('.ab-error-screen')).not.toBeNull();
  });

  it('רעש מוכר (ResizeObserver) מסונן ולא מקפיץ כיסוי', () => {
    handle = installGlobalErrorScreen();
    fireError('ResizeObserver loop completed with undelivered notifications.');
    expect(document.querySelector('.ab-error-screen')).toBeNull();
  });

  it('התקנה כפולה לא מוסיפה מאזינים; destroy מנקה', () => {
    handle = installGlobalErrorScreen();
    const second = installGlobalErrorScreen();
    second.destroy(); // ה-handle השני הוא noop - לא אמור לפרק את הראשון

    fireError('boom');
    expect(document.querySelectorAll('.ab-error-screen')).toHaveLength(1);

    // destroy מאפס את הסינגלטון - התקנה חדשה עובדת מחדש (מוכיח שהפירוק תפס).
    handle.destroy();
    document.body.innerHTML = '';
    handle = installGlobalErrorScreen();
    fireError('fresh-install');
    expect(document.querySelectorAll('.ab-error-screen')).toHaveLength(1);
  });
});
