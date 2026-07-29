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
  /** @type {FrameRequestCallback[]} */
  let queue = [];
  let nextId = 1;
  vi.stubGlobal('requestAnimationFrame', (cb) => {
    const id = nextId++;
    queue.push({ id, cb });
    return id;
  });
  vi.stubGlobal('cancelAnimationFrame', (id) => {
    queue = queue.filter(item => item.id !== id);
  });
  return {
    flush() {
      const pending = queue;
      queue = [];
      pending.forEach(({ cb }) => cb(performance.now()));
    },
    pendingCount() { return queue.length; },
  };
}

function firePointer(el, type, { x, y, pointerId = 1 } = {}) {
  const ev = new Event(type, { bubbles: true, cancelable: true });
  Object.assign(ev, { clientX: x, clientY: y, pointerId, button: 0 });
  el.dispatchEvent(ev);
  return ev;
}

let container, source, target;
let raf;

beforeEach(() => {
  container = mountContainer();

  source = document.createElement('div');
  source.className = 'letter';
  source.getBoundingClientRect = () => ({ width: 100, height: 50, left: 0, top: 0 });
  container.appendChild(source);

  target = document.createElement('div');
  container.appendChild(target);

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

describe('createDragSource - clone positioning', () => {
  it('positions the floating clone via transform, not left/top', () => {
    createDragSource(source, { id: 'x' });
    // rect is 100x50 (half: 50,25), so the clone centers under (40,30) at (-10,5).
    firePointer(source, 'pointerdown', { x: 40, y: 30 });

    const clone = [...document.body.children].find(el => el !== container);

    expect(clone).toBeTruthy();
    expect(clone.style.transform).toContain('translate3d(-10px, 5px, 0)');
    expect(clone.style.left).toBe('0px');
    expect(clone.style.top).toBe('0px');
  });

  it('sets will-change:transform on the clone (compositor promotion hint)', () => {
    createDragSource(source, { id: 'x' });
    firePointer(source, 'pointerdown', { x: 40, y: 30 });
    const clone = [...document.body.children].find(el => el !== container);
    expect(clone.style.willChange).toBe('transform');
  });
});

describe('createDragSource - rAF batching', () => {
  it('collapses several pointermove events before a frame into a single DOM update', () => {
    createDragSource(source, { id: 'x' });
    // rect is 100x50 (half: 50,25); pointerdown at (0,0) paints immediately at (-50,-25).
    firePointer(source, 'pointerdown', { x: 0, y: 0 });

    // שלושה אירועי pointermove גולמיים "לפני" שהדפדפן הספיק לצייר פריים.
    firePointer(source, 'pointermove', { x: 10, y: 10 });
    firePointer(source, 'pointermove', { x: 20, y: 20 });
    firePointer(source, 'pointermove', { x: 30, y: 30 });

    // רק בקשת rAF אחת ממתינה - לא שלוש.
    expect(raf.pendingCount()).toBe(1);

    const clone = [...document.body.children].find(el => el !== container);
    // עוד לא צויר עד ה-flush - נשאר במיקום ה-pointerdown המקורי.
    expect(clone.style.transform).toContain('translate3d(-50px, -25px, 0)');

    raf.flush();

    // אחרי הפריים - המיקום האחרון בלבד מוחל (30,30), לא הביניים (10,10)/(20,20).
    expect(clone.style.transform).toContain('translate3d(-20px, 5px, 0)'); // 30 - halfW(50), 30 - halfH(25)
  });

  it('cancels the pending frame when the drag ends before it fires', () => {
    createDragSource(source, { id: 'x' });
    firePointer(source, 'pointerdown', { x: 0, y: 0 });
    firePointer(source, 'pointermove', { x: 10, y: 10 });
    expect(raf.pendingCount()).toBe(1);

    firePointer(source, 'pointerup', { x: 10, y: 10 });
    expect(raf.pendingCount()).toBe(0);
  });
});

describe('createDragSource + createDropTarget - drop', () => {
  it('calls onDrop with data/sourceEl/targetEl when released over a registered target', () => {
    const onDrop = vi.fn();
    createDropTarget(target, onDrop);
    createDragSource(source, { letter: 'א' });

    document.elementFromPoint = vi.fn(() => target);

    firePointer(source, 'pointerdown', { x: 0, y: 0 });
    firePointer(source, 'pointerup', { x: 5, y: 5 });

    expect(onDrop).toHaveBeenCalledOnce();
    expect(onDrop.mock.calls[0][0]).toMatchObject({ data: { letter: 'א' }, sourceEl: source, targetEl: target });
  });

  it('removes the floating clone after drop', () => {
    createDropTarget(target, vi.fn());
    createDragSource(source, { id: 'x' });
    document.elementFromPoint = vi.fn(() => target);

    firePointer(source, 'pointerdown', { x: 0, y: 0 });
    expect([...document.body.children].some(el => el !== container)).toBe(true);

    firePointer(source, 'pointerup', { x: 5, y: 5 });
    expect([...document.body.children].some(el => el !== container)).toBe(false);
  });

  it('does not call onDrop when released outside any registered target', () => {
    const onDrop = vi.fn();
    createDropTarget(target, onDrop);
    createDragSource(source, { id: 'x' });
    document.elementFromPoint = vi.fn(() => null);

    firePointer(source, 'pointerdown', { x: 0, y: 0 });
    firePointer(source, 'pointerup', { x: 999, y: 999 });

    expect(onDrop).not.toHaveBeenCalled();
  });
});

describe('createDragSource - destroy', () => {
  it('cleans up an in-flight drag and stops responding to further events', () => {
    const handle = createDragSource(source, { id: 'x' });
    firePointer(source, 'pointerdown', { x: 0, y: 0 });
    firePointer(source, 'pointermove', { x: 10, y: 10 });

    handle.destroy();

    expect(raf.pendingCount()).toBe(0);
    expect([...document.body.children].some(el => el !== container)).toBe(false);
    expect(source.classList.contains('drag-source')).toBe(false);
  });
});
