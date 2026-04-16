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
  const spacer = container.querySelector('.game-header__spacer');
  if (!spacer) return null;
  const btn = document.createElement('button');
  btn.className = 'ab-header-btn';
  btn.setAttribute('aria-label', ariaLabel);
  btn.textContent = icon;
  btn.onclick = onClick;
  spacer.innerHTML = '';
  spacer.appendChild(btn);
  return btn;
}
