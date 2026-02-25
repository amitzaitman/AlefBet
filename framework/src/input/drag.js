/**
 * גרירה ושחרור (Drag & Drop)
 * תומך בעכבר, מגע ועט — מבוסס PointerEvents
 * תומך גם בבחירה בהקשה + שחרור בהקשה (למגע קל יותר)
 * [נוסף על ידי: nikud-match game]
 *
 * שימוש:
 *   const src = createDragSource(el, { id: 'foo' }, onDragStart?);
 *   const tgt = createDropTarget(el, ({ data, sourceEl }) => { ... });
 *   src.destroy(); tgt.destroy();
 */

let _activeSource = null;   // currently selected/dragging source
let _clone        = null;   // floating clone during drag
let _halfW = 0, _halfH = 0; // half-dimensions of clone

// ── Drop Target Registry ──────────────────────────────────────────────────

const _targets = new Map(); // el → { onDrop, data }

function _findTargetAt(x, y) {
  // Hide clone temporarily so it doesn't block elementFromPoint
  if (_clone) _clone.style.pointerEvents = 'none';
  const el = document.elementFromPoint(x, y)?.closest('[data-drop-target="true"]') || null;
  if (_clone) _clone.style.pointerEvents = '';
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
    opacity:       '0.9',
    transform:     'scale(1.12)',
    transition:    'transform 0.1s',
    cursor:        'grabbing',
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

// ── Global pointer handlers (attached during drag) ────────────────────────

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

    // If tap-to-select mode: first tap selects, second tap (on target) drops
    if (!e.pointerType || e.pointerType === 'touch') {
      // Toggle selection
      if (_activeSource?.el === el) {
        // Second tap on same source — deselect
        el.classList.remove('drag-source--selected');
        _activeSource = null;
        return;
      }
      // Clear previous selection
      _activeSource?.el.classList.remove('drag-source--selected');
      _activeSource = { el, data };
      el.classList.add('drag-source--selected');
      // Tap-to-place is handled by drop targets
      return;
    }

    // Mouse / stylus: full drag
    _activeSource?.el.classList.remove('drag-source--selected');
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
      el.classList.remove('drag-source', 'drag-source--dragging', 'drag-source--selected');
      if (_activeSource?.el === el) {
        _endDrag();
        _activeSource = null;
      }
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

  // Tap-to-place: when a source is selected and user taps this target
  function onPointerUp(e) {
    if (!_activeSource) return;
    if (e.pointerType === 'mouse') return; // handled globally for mouse

    // Touch tap on this target
    onDrop({
      data:     _activeSource.data,
      sourceEl: _activeSource.el,
      targetEl: el,
    });
    _activeSource.el.classList.remove('drag-source--selected');
    _activeSource = null;
  }

  el.addEventListener('pointerup', onPointerUp);

  return {
    destroy() {
      el.removeAttribute('data-drop-target');
      el.classList.remove('drop-target--active', 'drop-target--hover');
      _targets.delete(el);
      el.removeEventListener('pointerup', onPointerUp);
    },
  };
}
