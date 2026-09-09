/**
 * גרירה ושחרור (Drag & Drop)
 * תומך בעכבר, מגע ועט — מבוסס PointerEvents + setPointerCapture
 * [נוסף על ידי: nikud-match game]
 *
 * שימוש:
 *   const src = createDragSource(el, { id: 'foo' });
 *   const tgt = createDropTarget(el, ({ data, sourceEl }) => { ... });
 *   src.destroy(); tgt.destroy();
 */

let _activeSource = null;   // currently dragging source
let _clone        = null;   // floating clone during drag
let _halfW = 0, _halfH = 0; // half-dimensions of clone

// ── rAF-batched pointer tracking ──────────────────────────────────────────
// גרירה גולמית (pointermove) יכולה לירות הרבה יותר מהר מקצב הרינדור של
// המסך, במיוחד במגע. עדכון מיידי של style.left/top על כל אירוע מכריח
// layout+paint שוב ושוב ומרגיש מקוטע. במקום זה שומרים רק את המיקום
// האחרון ומעדכנים את ה-DOM פעם אחת לפריים דרך requestAnimationFrame,
// וגם התזוזה עצמה עוברת ל-transform (compositor-only, אין layout).
let _rafId = null;
let _pendingX = 0, _pendingY = 0;

// ── Drop Target Registry ──────────────────────────────────────────────────

const _targets = new Map(); // el → { onDrop }

// The clone always has pointer-events:none so elementFromPoint skips it —
// no need to hide/show it.
function _findTargetAt(x, y) {
  return document.elementFromPoint(x, y)?.closest('[data-drop-target="true"]') || null;
}

// ── Floating Clone ────────────────────────────────────────────────────────

function _createClone(sourceEl, x, y) {
  const rect = sourceEl.getBoundingClientRect();
  _halfW = rect.width  / 2;
  _halfH = rect.height / 2;

  _clone = sourceEl.cloneNode(true);
  _clone.setAttribute('aria-hidden', 'true');
  _clone.setAttribute('tabindex', '-1');
  Object.assign(_clone.style, {
    position:      'fixed',
    left:          '0',
    top:           '0',
    width:         `${rect.width}px`,
    height:        `${rect.height}px`,
    pointerEvents: 'none',   // keeps it out of elementFromPoint + hit-testing
    zIndex:        '9999',
    opacity:       '0.85',
    cursor:        'grabbing',
    margin:        '0',
    // אנימציות המקור גוברות על transform; מעברים גורמים לפיגור אחרי המצביע.
    animation:     'none',
    transition:    'none',
    willChange:    'transform', // מקדם שכבת compositor מראש - בלי זה הפריים הראשון של תזוזה עלול לגמגם
  });
  _paintClonePosition(x, y);
  document.body.appendChild(_clone);
}

/** כותב את מיקום השיבוט דרך transform בלבד - compositor-only, ללא layout. */
function _paintClonePosition(x, y) {
  if (!_clone) return;
  _clone.style.transform = `translate3d(${x - _halfW}px, ${y - _halfH}px, 0) scale(1.12)`;
}

/**
 * מתזמן עדכון מיקום פעם אחת לפריים: שומר את המיקום העדכני ומצרף בקשת
 * rAF יחידה (אם כבר יש אחת ממתינה, לא נוספת בקשה נוספת). כך גם 200
 * אירועי pointermove בשנייה מתורגמים לכל היותר לעדכון DOM אחד לפריים.
 */
function _scheduleMove(x, y) {
  _pendingX = x;
  _pendingY = y;
  if (_rafId !== null) return;
  _rafId = requestAnimationFrame(() => {
    _rafId = null;
    _paintClonePosition(_pendingX, _pendingY);
    _highlightTarget(_findTargetAt(_pendingX, _pendingY));
  });
}

function _destroyClone() {
  if (_rafId !== null) {
    cancelAnimationFrame(_rafId);
    _rafId = null;
  }
  _clone?.remove();
  _clone = null;
}

// ── Drop Target hover highlight ───────────────────────────────────────────

let _hoveredTarget = null;

function _highlightTarget(el) {
  if (_hoveredTarget === el) return;
  _hoveredTarget?.classList.remove('drop-target--hover');
  _hoveredTarget = el;
  el?.classList.add('drop-target--hover');
}

function _clearHighlight() {
  _hoveredTarget?.classList.remove('drop-target--hover');
  _hoveredTarget = null;
}

// ── Public API ────────────────────────────────────────────────────────────

/**
 * הפוך אלמנט למקור גרירה
 * @param {HTMLElement} el - האלמנט הנגרר
 * @param {*} data - נתונים שיועברו ל-drop target
 * @param {{ onTap?: () => void }} [options] - בחירה קצרה ללא גרירה
 * @returns {{ destroy() }}
 */
export function createDragSource(el, data, { onTap } = {}) {
  el.classList.add('drag-source');

  // Handlers are created per-drag so they can be removed cleanly
  let _moveHandler    = null;
  let _upHandler      = null;
  let _cancelHandler  = null;

  function _endDrag() {
    if (_moveHandler) {
      el.removeEventListener('pointermove',   _moveHandler);
      el.removeEventListener('pointerup',     _upHandler);
      el.removeEventListener('pointercancel', _cancelHandler);
      _moveHandler = _upHandler = _cancelHandler = null;
    }
    _clearHighlight();
    _destroyClone();
    el.classList.remove('drag-source--dragging');
    _activeSource = null;
  }

  function onPointerDown(e) {
    if (el.matches(':disabled') || el.getAttribute('aria-disabled') === 'true') return;
    if (e.button !== undefined && e.button !== 0) return; // left button only
    e.preventDefault();

    // End any existing drag (shouldn't happen, but be safe)
    if (_activeSource) _endDrag();

    _activeSource = { el, data };
    let dragging = false;
    const startDrag = () => {
      dragging = true;
      el.classList.add('drag-source--dragging');
      _createClone(el, e.clientX, e.clientY);
    };
    const moved = ev => Math.hypot(ev.clientX - e.clientX, ev.clientY - e.clientY) >= 8;
    if (!onTap) startDrag();

    // Explicit pointer capture ensures pointermove/pointerup always fire on
    // this element — for BOTH mouse and touch — even when the pointer moves
    // outside the element. clientX/clientY still reflect the real position.
    el.setPointerCapture(e.pointerId);

    _moveHandler = (ev) => {
      if (!dragging && moved(ev)) startDrag();
      if (dragging) _scheduleMove(ev.clientX, ev.clientY);
    };

    _upHandler = (ev) => {
      const tapped = !dragging && !moved(ev);
      const targetEl = tapped && onTap ? null : _findTargetAt(ev.clientX, ev.clientY);
      _endDrag();
      if (tapped && onTap) { onTap(); return; }
      // Finalize after cleanup so onDrop can safely call destroy()
      if (targetEl && _targets.has(targetEl)) {
        _targets.get(targetEl).onDrop({ data, sourceEl: el, targetEl });
      }
    };

    _cancelHandler = () => _endDrag();

    el.addEventListener('pointermove',   _moveHandler);
    el.addEventListener('pointerup',     _upHandler);
    el.addEventListener('pointercancel', _cancelHandler);
  }

  el.addEventListener('pointerdown', onPointerDown);

  return {
    destroy() {
      el.removeEventListener('pointerdown', onPointerDown);
      if (_activeSource?.el === el) _endDrag();
      el.classList.remove('drag-source');
    },
  };
}

/**
 * הפוך אלמנט ליעד שחרור
 * @param {HTMLElement} el
 * @param {function} onDrop - ({ data, sourceEl, targetEl }) => void
 * @returns {{ destroy() }}
 */
export function createDropTarget(el, onDrop) {
  el.setAttribute('data-drop-target', 'true');
  el.classList.add('drop-target--active');
  _targets.set(el, { onDrop });

  return {
    destroy() {
      el.removeAttribute('data-drop-target');
      el.classList.remove('drop-target--active', 'drop-target--hover');
      _targets.delete(el);
    },
  };
}
