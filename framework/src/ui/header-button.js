import { getAdultTools } from './adult-tools.js';
/**
 * הזרקת כפתור לכותרת המשחק
 */

/**
 * הוסף כפתור לאזור הכותרת
 * @param {HTMLElement} container — מיכל המשחק
 * @param {string} icon — אייקון (אמוג'י או HTML)
 * @param {string} ariaLabel — תווית נגישות
 * @param {(ev: MouseEvent) => void} onClick - פעולה בלחיצה
 * @returns {HTMLElement|null}
 */
export function injectHeaderButton(container, icon, ariaLabel, onClick) {
  const spacer = getAdultTools(container);
  if (!spacer) return null;
  const btn = document.createElement('button');
  btn.className = 'btn';
  btn.setAttribute('aria-label', ariaLabel);
  btn.textContent = `${icon} ${ariaLabel}`;
  btn.onclick = event => {
    const menu = btn.closest('details');
    if (menu) menu.open = false;
    onClick(event);
  };
  spacer.appendChild(btn);
  return btn;
}
