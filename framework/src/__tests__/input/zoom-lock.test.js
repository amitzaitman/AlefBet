/**
 * zoom-lock.js - הקשה כפולה או שתי אצבעות לא מגדילות מסך משחק,
 * וגלילה באצבע אחת לא נחסמת.
 */
import { describe, it, expect, vi } from 'vitest';
import { lockPageZoom, ZOOM_LOCK_CLASS } from '../../input/zoom-lock.js';
import { GameShell } from '../../core/game-shell.js';
import { mountContainer } from '../helpers.js';

const freshDocument = () => document.implementation.createHTMLDocument('');

/** @param {string} type @param {number} touchCount @param {boolean} [cancelable] */
function touchEvent(type, touchCount, cancelable = true) {
  const event = new Event(type, { cancelable });
  Object.defineProperty(event, 'touches', { value: Array.from({ length: touchCount }, () => ({})) });
  return event;
}

describe('lockPageZoom', () => {
  it('marks the page once and installs its listeners once', () => {
    const doc = freshDocument();
    const add = vi.spyOn(doc, 'addEventListener');
    expect(lockPageZoom(doc)).toBe(true);
    expect(lockPageZoom(doc)).toBe(false);
    expect(doc.documentElement.classList.contains(ZOOM_LOCK_CLASS)).toBe(true);
    expect(add.mock.calls.map(([type]) => type).sort()).toEqual(['gesturechange', 'gesturestart', 'touchmove']);
    // Listeners that cancel must not be passive, or the browser ignores them.
    for (const [, , options] of add.mock.calls) expect(options).toEqual({ passive: false });
  });

  it('cancels the Safari pinch gesture', () => {
    const doc = freshDocument();
    lockPageZoom(doc);
    for (const type of ['gesturestart', 'gesturechange']) {
      const event = new Event(type, { cancelable: true });
      doc.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
    }
  });

  it('cancels two-finger moves and keeps one-finger scrolling', () => {
    const doc = freshDocument();
    lockPageZoom(doc);
    const pinch = touchEvent('touchmove', 2);
    doc.dispatchEvent(pinch);
    expect(pinch.defaultPrevented).toBe(true);
    const scroll = touchEvent('touchmove', 1);
    doc.dispatchEvent(scroll);
    expect(scroll.defaultPrevented).toBe(false);
    // A move that is already scrolling cannot be cancelled; that is not an error.
    expect(() => doc.dispatchEvent(touchEvent('touchmove', 2, false))).not.toThrow();
  });

  it('is on for every game shell', () => {
    document.documentElement.classList.remove(ZOOM_LOCK_CLASS);
    const shell = new GameShell(mountContainer(), { totalRounds: 1 });
    expect(document.documentElement.classList.contains(ZOOM_LOCK_CLASS)).toBe(true);
    shell.end();
  });
});
