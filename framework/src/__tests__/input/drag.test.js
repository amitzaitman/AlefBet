/**
 * drag.js - חוזה הגרירה:
 * 1) התזוזה עוברת דרך transform בלבד (compositor-only), לא left/top.
 * 2) כמה אירועי pointermove לפני פריים אחד מצטמצמים לעדכון DOM יחיד
 *    (זו הבדיקה נגד הגמגום שדווח בפועל - עדכון על כל אירוע גולמי).
 * 3) שחרור מעל יעד קורא ל-onDrop עם הנתונים הנכונים ומנקה את השיבוט.
 * 4) ביטול/הרס באמצע גרירה לא משאיר רפרנס rAF תלוי.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createDragSource, createDropTarget } from '../../input/drag.js';
import { mountContainer } from '../helpers.js';

/** בונה תור rAF נשלט: callbacks נאספים ומופעלים ידנית דרך flush(). */
function stubRAF() {
  /** @type {Map<number, FrameRequestCallback>} */
  const queue = new Map();
  let nextId = 1;
  vi.stubGlobal('requestAnimationFrame', cb => { queue.set(nextId, cb); return nextId++; });
  vi.stubGlobal('cancelAnimationFrame', id => queue.delete(id));
  return {
    flush() {
      const pending = [...queue.values()];
      queue.clear();
      pending.forEach(cb => cb(performance.now()));
    },
    pendingCount: () => queue.size,
  };
}

function firePointer(el, type, { x, y, pointerId = 1 } = {}) {
  const ev = new Event(type, { bubbles: true, cancelable: true });
  el.dispatchEvent(Object.assign(ev, { clientX: x, clientY: y, pointerId, button: 0 }));
}

let container, source, target, raf;

beforeEach(() => {
  container = mountContainer();
  source = container.appendChild(document.createElement('div'));
  source.getBoundingClientRect = () => ({ width: 100, height: 50, left: 0, top: 0 });
  target = container.appendChild(document.createElement('div'));
  // jsdom אינו מממש setPointerCapture/elementFromPoint - סטאבים שקטים.
  Element.prototype.setPointerCapture = vi.fn();
  document.elementFromPoint = vi.fn(() => null);
  raf = stubRAF();
});

afterEach(() => {
  vi.unstubAllGlobals();
  delete Element.prototype.setPointerCapture;
  delete document.elementFromPoint;
});

/** The floating drag clone: the only body child besides the test container. */
const clone = () => [...document.body.children].find(el => el !== container);

describe('createDragSource - clone and rAF batching', () => {
  it('positions the floating clone via transform, not left/top, on its own compositor layer', () => {
    createDragSource(source, { id: 'x' });
    // rect is 100x50 (half: 50,25), so the clone centers under (40,30) at (-10,5).
    firePointer(source, 'pointerdown', { x: 40, y: 30 });
    expect(clone().style.transform).toContain('translate3d(-10px, 5px, 0)');
    expect(clone().style.left).toBe('0px');
    expect(clone().style.top).toBe('0px');
    expect(clone().style.willChange).toBe('transform');
  });

  it('collapses several pointermoves before a frame into one DOM update, and cancels a pending frame on release', () => {
    createDragSource(source, { id: 'x' });
    // rect is 100x50 (half: 50,25); pointerdown at (0,0) paints immediately at (-50,-25).
    firePointer(source, 'pointerdown', { x: 0, y: 0 });
    // שלושה אירועי pointermove גולמיים "לפני" שהדפדפן הספיק לצייר פריים.
    for (const at of [10, 20, 30]) firePointer(source, 'pointermove', { x: at, y: at });
    // רק בקשת rAF אחת ממתינה - לא שלוש; ועד ה-flush השיבוט נשאר במיקום ה-pointerdown.
    expect(raf.pendingCount()).toBe(1);
    expect(clone().style.transform).toContain('translate3d(-50px, -25px, 0)');
    raf.flush();
    // אחרי הפריים - רק המיקום האחרון (30,30) מוחל, לא הביניים: 30 - halfW(50), 30 - halfH(25).
    expect(clone().style.transform).toContain('translate3d(-20px, 5px, 0)');
    firePointer(source, 'pointermove', { x: 40, y: 40 });
    expect(raf.pendingCount()).toBe(1);
    firePointer(source, 'pointerup', { x: 40, y: 40 });
    expect(raf.pendingCount()).toBe(0);
  });
});

describe('createDragSource + createDropTarget', () => {
  it('drops only over a registered target, with data/sourceEl/targetEl, and removes the clone', () => {
    const onDrop = vi.fn();
    createDropTarget(target, onDrop);
    createDragSource(source, { letter: 'א' });
    firePointer(source, 'pointerdown', { x: 0, y: 0 });
    firePointer(source, 'pointerup', { x: 999, y: 999 });
    expect(onDrop).not.toHaveBeenCalled();

    document.elementFromPoint = vi.fn(() => target);
    firePointer(source, 'pointerdown', { x: 0, y: 0 });
    expect(clone()).toBeTruthy();
    firePointer(source, 'pointerup', { x: 5, y: 5 });
    expect(onDrop).toHaveBeenCalledOnce();
    expect(onDrop.mock.calls[0][0]).toMatchObject({ data: { letter: 'א' }, sourceEl: source, targetEl: target });
    expect(clone()).toBeUndefined();
  });

  it('destroy cleans up an in-flight drag and stops responding to further events', () => {
    const handle = createDragSource(source, { id: 'x' });
    firePointer(source, 'pointerdown', { x: 0, y: 0 });
    firePointer(source, 'pointermove', { x: 10, y: 10 });
    handle.destroy();
    expect(raf.pendingCount()).toBe(0);
    expect(clone()).toBeUndefined();
    expect(source.classList.contains('drag-source')).toBe(false);
  });
});

describe('tap selection alongside dragging', () => {
  it('treats a short press as a tap without a clone, but not a cancelled press or a disabled source', () => {
    const onTap = vi.fn();
    const handle = createDragSource(source, {}, { onTap });
    firePointer(source, 'pointerdown', { x: 0, y: 0 });
    firePointer(source, 'pointercancel', { x: 0, y: 0 });
    source.setAttribute('aria-disabled', 'true');
    firePointer(source, 'pointerdown', { x: 0, y: 0 });
    firePointer(source, 'pointerup', { x: 0, y: 0 });
    expect(onTap).not.toHaveBeenCalled();
    expect(document.body.children).toHaveLength(1);
    source.removeAttribute('aria-disabled');
    firePointer(source, 'pointerdown', { x: 40, y: 30 });
    firePointer(source, 'pointermove', { x: 43, y: 32 });
    expect(document.body.children).toHaveLength(1);
    firePointer(source, 'pointerup', { x: 43, y: 32 });
    expect(onTap).toHaveBeenCalledOnce();
    expect(raf.pendingCount()).toBe(0);
    handle.destroy();
  });

  it('drops after movement without also selecting the source', () => {
    const onTap = vi.fn();
    const onDrop = vi.fn();
    const handle = createDragSource(source, {}, { onTap });
    const drop = createDropTarget(target, onDrop);
    document.elementFromPoint = vi.fn(() => target);
    firePointer(source, 'pointerdown', { x: 0, y: 0 });
    firePointer(source, 'pointermove', { x: 30, y: 30 });
    expect(document.body.children).toHaveLength(2);
    firePointer(source, 'pointerup', { x: 30, y: 30 });
    expect(onDrop).toHaveBeenCalledOnce();
    expect(onTap).not.toHaveBeenCalled();
    handle.destroy(); drop.destroy();
  });
});

describe('drag ownership', () => {
  const at = { x: 20, y: 20 };
  const button = () => container.appendChild(document.createElement('button'));

  it('ignores other fingers, cancels the old source, and handles capture loss', () => {
    const a = button(), b = button();
    const first = createDragSource(a, {}), second = createDragSource(b, {});
    firePointer(a, 'pointerdown', at);
    firePointer(a, 'pointerup', { ...at, pointerId: 2 });
    expect(a.classList.contains('drag-source--dragging')).toBe(true);
    firePointer(b, 'pointerdown', { ...at, pointerId: 2 });
    expect(a.classList.contains('drag-source--dragging')).toBe(false);
    firePointer(a, 'pointerup', at);
    expect(document.querySelector('[aria-hidden="true"]')).not.toBeNull();
    firePointer(b, 'lostpointercapture', { ...at, pointerId: 2 });
    expect(document.querySelector('[aria-hidden="true"]')).toBeNull();
    first.destroy(); second.destroy();
  });

  it.each(['disabled', 'aria-disabled'])('rejects a target locked with %s during a drag', attribute => {
    const from = button(), locked = button(), drop = vi.fn();
    const drag = createDragSource(from, {}), zone = createDropTarget(locked, drop);
    document.elementFromPoint = vi.fn(() => locked);
    firePointer(from, 'pointerdown', at);
    locked.setAttribute(attribute, 'true');
    firePointer(from, 'pointerup', at);
    expect(drop).not.toHaveBeenCalled();
    locked.removeAttribute(attribute);
    firePointer(from, 'pointerdown', at); firePointer(from, 'pointerup', at);
    expect(drop).toHaveBeenCalledOnce();
    drag.destroy(); zone.destroy();
  });
});
