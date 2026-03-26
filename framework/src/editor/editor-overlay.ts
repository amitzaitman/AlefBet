/**
 * editor-overlay — transparent layer over game-body that freezes interaction in edit mode.
 */

export interface EditorOverlay {
  show():    void;
  hide():    void;
  destroy(): void;
}

export function createEditorOverlay(
  gameBodyEl: HTMLElement,
  { onClick }: { onClick?: (e: PointerEvent) => void } = {},
): EditorOverlay {
  const overlay = document.createElement('div');
  overlay.className = 'ab-editor-overlay';

  if (onClick) overlay.addEventListener('pointerdown', onClick as EventListener);

  function show() {
    if (!overlay.parentElement) {
      gameBodyEl.style.position = 'relative';
      gameBodyEl.appendChild(overlay);
    }
  }

  function hide()    { overlay.remove(); }
  function destroy() { hide(); }

  return { show, hide, destroy };
}
