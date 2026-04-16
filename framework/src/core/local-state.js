/**
 * מנהל מצב מקומי — שמירה ב-localStorage עם הודעה לנרשמים
 *
 * @template T
 * @param {string} storageKey - המפתח לשמירה ב-localStorage
 * @param {T} defaultValue - ערך ברירת המחדל אם אין נתונים שמורים
 * @returns {{ get: () => T, set: (v: T) => void, update: (fn: (v: T) => T) => void, subscribe: (fn: (v: T) => void) => () => void }}
 *
 * @example
 * const state = createLocalState('myApp:tasks', []);
 * state.subscribe(tasks => console.log('עודכן:', tasks));
 * state.set([{ id: 1, done: false }]);
 * state.update(tasks => tasks.map(t => ({ ...t, done: true })));
 */
export function createLocalState(storageKey, defaultValue) {
  /** @type {Array<(v: T) => void>} רשימת הפונקציות הנרשמות */
  const subscribers = [];

  /**
   * קרא את הערך הנוכחי מ-localStorage
   * @returns {*} הערך המפורש, או ערך ברירת המחדל אם אין נתונים
   */
  function get() {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw === null) return defaultValue;
      return JSON.parse(raw);
    } catch {
      return defaultValue;
    }
  }

  /**
   * שמור ערך חדש ב-localStorage והודע לכל הנרשמים
   * @param {*} newVal - הערך החדש לשמירה
   */
  function set(newVal) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(newVal));
    } catch (err) {
      console.warn(`[createLocalState] שגיאה בשמירת "${storageKey}":`, err);
    }
    subscribers.forEach(fn => fn(newVal));
  }

  /**
   * עדכן את הערך הנוכחי על-פי פונקציית טרנספורמציה
   * @param {(v: T) => T} fn - פונקציה שמקבלת את הערך הנוכחי ומחזירה ערך חדש
   */
  function update(fn) {
    set(fn(get()));
  }

  /**
   * הירשם לשינויים במצב
   * @param {(v: T) => void} fn - פונקציה שתיקרא עם הערך החדש בכל שינוי
   * @returns {() => void} פונקציית ביטול הרישום
   */
  function subscribe(fn) {
    subscribers.push(fn);
    return function unsubscribe() {
      const idx = subscribers.indexOf(fn);
      if (idx !== -1) subscribers.splice(idx, 1);
    };
  }

  return { get, set, update, subscribe };
}
