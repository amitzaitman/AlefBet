/**
 * שכבת-על שקופה מעל game-body — מקפיאה את המשחק במצב עריכה
 */

/**
 * @param {HTMLElement} gameBodyEl
 * @param {{ onClick?: (e: PointerEvent) => void }} options
 * @returns {{ show(), hide(), destroy() }}
 */
export function createEditorOverlay(gameBodyEl, { onClick } = {}) {
  const overlay = document.createElement('div');
  overlay.className = 'ab-editor-overlay';

  if (onClick) {
    overlay.addEventListener('pointerdown', onClick);
  }

  function show() {
    if (!overlay.parentElement) {
      gameBodyEl.style.position = 'relative';
      gameBodyEl.appendChild(overlay);
    }
  }

  function hide() {
    overlay.remove();
  }

  function destroy() {
    hide();
  }

  return { show, hide, destroy };
}
