/**
 * מסך טעינה פשוט
 * מציג הודעת טעינה ממורכזת בתוך מיכל נתון
 */

/**
 * מציג מסך טעינה בתוך המיכל
 * @param {HTMLElement} container - אלמנט המיכל
 * @param {string} [text='טוֹעֵן...'] - טקסט הטעינה
 */
export function showLoadingScreen(container, text = 'טוֹעֵן...') {
  container.innerHTML = `<div class="ab-loading">${text}</div>`;
}

/**
 * מסיר את מסך הטעינה מהמיכל
 * @param {HTMLElement} container - אלמנט המיכל
 */
export function hideLoadingScreen(container) {
  container.innerHTML = '';
}
