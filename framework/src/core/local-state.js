/**
 * מנהל מצב מקומי — שמירה ב-localStorage
 *
 * @template T
 * @param {string} storageKey - המפתח לשמירה ב-localStorage
 * @param {T} defaultValue - ערך ברירת המחדל אם אין נתונים שמורים
 * @returns {{ get: () => T, set: (v: T) => boolean, update: (fn: (v: T) => T) => boolean }}
 *
 * @example
 * const state = createLocalState('myApp:tasks', []);
 * state.set([{ id: 1, done: false }]);
 * state.update(tasks => tasks.map(t => ({ ...t, done: true })));
 */
export function createLocalState(storageKey, defaultValue) {
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
   * שמור ערך חדש ב-localStorage
   * @param {*} newVal - הערך החדש לשמירה
   */
  function set(newVal) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(newVal));
    } catch (err) {
      console.warn(`[createLocalState] שגיאה בשמירת "${storageKey}":`, err);
      return false;
    }
    return true;
  }

  /**
   * עדכן את הערך הנוכחי על-פי פונקציית טרנספורמציה
   * @param {(v: T) => T} fn - פונקציה שמקבלת את הערך הנוכחי ומחזירה ערך חדש
   */
  function update(fn) {
    return set(fn(get()));
  }

  return { get, set, update };
}
