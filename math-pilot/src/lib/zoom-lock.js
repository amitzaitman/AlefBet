/**
 * Children tap twice or touch with two fingers by accident, and the page
 * zooms under them. A game screen needs no zoom: its targets are already
 * large. One-finger scrolling still works.
 *
 * Three layers, because each browser honours a different one:
 * - the `zoom-lock` class on <html> sets touch-action (styles.css);
 * - iOS Safari ignores user-scalable=no, so its gesture events are blocked;
 * - a touch move with more than one finger is blocked everywhere.
 */

/** @param {Event} event */
function block(event) {
  if (event.cancelable) event.preventDefault();
}

/** @param {TouchEvent} event */
function blockMultiTouch(event) {
  if (event.touches.length > 1) block(event);
}

/** @param {Document} doc */
export function lockPageZoom(doc) {
  doc.documentElement.classList.add('zoom-lock');
  const options = { passive: false };
  doc.addEventListener('gesturestart', block, options);
  doc.addEventListener('gesturechange', block, options);
  doc.addEventListener('touchmove', blockMultiTouch, options);
}
