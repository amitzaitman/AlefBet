/**
 * גרירה ושחרור (Drag & Drop)
 * תומך בעכבר, מגע ועט — מבוסס PointerEvents
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

// ── Drop Target Registry ──────────────────────────────────────────────────

const _targets = new Map(); // el → { onDrop }

function _findTargetAt(x, y) {
  // Hide clone temporarily so it doesn't block elementFromPoint
  if (_clone) _clone.style.display = 'none';
  const el = document.elementFromPoint(x, y)?.closest('[data-drop-target="true"]') || null;
  if (_clone) _clone.style.display = '';
  return el;
}

// ── Floating Clone ────────────────────────────────────────────────────────

function _createClone(sourceEl, x, y) {
  const rect = sourceEl.getBoundingClientRect();
  _halfW = rect.width  / 2;
  _halfH = rect.height / 2;

  _clone = sourceEl.cloneNode(true);
  Object.assign(_clone.style, {
    position:      'fixed',
    left:          `${x - _halfW}px`,
    top:           `${y - _halfH}px`,
    width:         `${rect.width}px`,
    height:        `${rect.height}px`,
    pointerEvents: 'none',
    zIndex:        '9999',
    opacity:       '0.85',
    transform:     'scale(1.12)',
    cursor:        'grabbing',
    margin:        '0',
  });
  document.body.appendChild(_clone);
}

function _moveClone(x, y) {
  if (!_clone) return;
  _clone.style.left = `${x - _halfW}px`;
  _clone.style.top  = `${y - _halfH}px`;
}

function _destroyClone() {
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

// ── Global pointer handlers (active during drag) ──────────────────────────

function _onPointerMove(e) {
  _moveClone(e.clientX, e.clientY);
  _highlightTarget(_findTargetAt(e.clientX, e.clientY));
}

function _onPointerUp(e) {
  _clearHighlight();
  const targetEl = _findTargetAt(e.clientX, e.clientY);
  _finalizeDrop(targetEl);
  _endDrag();
}

function _finalizeDrop(targetEl) {
  if (!_activeSource || !targetEl) return;
  const targetInfo = _targets.get(targetEl);
  if (!targetInfo) return;
  targetInfo.onDrop({
    data:     _activeSource.data,
    sourceEl: _activeSource.el,
    targetEl,
  });
}

function _endDrag() {
  if (_activeSource) {
    _activeSource.el.classList.remove('drag-source--dragging');
  }
  _destroyClone();
  _activeSource = null;
  document.removeEventListener('pointermove', _onPointerMove);
  document.removeEventListener('pointerup',   _onPointerUp);
}

// ── Public API ────────────────────────────────────────────────────────────

/**
 * הפוך אלמנט למקור גרירה
 * @param {HTMLElement} el - האלמנט הנגרר
 * @param {*} data - נתונים שיועברו ל-drop target
 * @returns {{ destroy() }}
 */
export function createDragSource(el, data) {
  el.classList.add('drag-source');

  function onPointerDown(e) {
    if (e.button !== undefined && e.button !== 0) return; // left click only (mouse)
    e.preventDefault();

    // Release any implicit pointer capture so pointermove/pointerup
    // fire on document (needed for touch)
    if (el.hasPointerCapture?.(e.pointerId)) {
      el.releasePointerCapture(e.pointerId);
    }

    _activeSource?.el.classList.remove('drag-source--dragging');
    _activeSource = { el, data };
    el.classList.add('drag-source--dragging');
    _createClone(el, e.clientX, e.clientY);

    document.addEventListener('pointermove', _onPointerMove);
    document.addEventListener('pointerup',   _onPointerUp);
  }

  el.addEventListener('pointerdown', onPointerDown);

  return {
    destroy() {
      el.removeEventListener('pointerdown', onPointerDown);
      el.classList.remove('drag-source', 'drag-source--dragging');
      if (_activeSource?.el === el) _endDrag();
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
