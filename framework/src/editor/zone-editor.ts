/**
 * zone-editor — TinyTap-style zone drawing overlay.
 *
 * Two drawing tools:
 *   'rect'    — click+drag to draw a rectangle
 *   'polygon' — click to place points, double-click/close to finish
 *
 * Zones are stored as percentage-based coordinates (0–100).
 */

import type { Zone, Point } from './schemas.js';
import { createVoiceRecordButton } from '../ui/voice-record-button.js';

let _zoneIdCounter = 0;
function generateZoneId(): string {
  return `zone-${Date.now()}-${_zoneIdCounter++}`;
}

/** Compute bounding box from polygon points */
function boundingBox(pts: Point[]): { x: number; y: number; width: number; height: number } {
  const xs = pts.map(p => p.x);
  const ys = pts.map(p => p.y);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y };
}

/** Build SVG polygon points attribute string */
function svgPointsAttr(pts: Point[], zoneX: number, zoneY: number, zoneW: number, zoneH: number): string {
  return pts.map(p => {
    const lx = zoneW > 0 ? ((p.x - zoneX) / zoneW) * 100 : 0;
    const ly = zoneH > 0 ? ((p.y - zoneY) / zoneH) * 100 : 0;
    return `${lx},${ly}`;
  }).join(' ');
}

// ── Public interface ────────────────────────────────────────────────────────

export type DrawTool = 'rect' | 'polygon';

export interface ZoneEditorOptions {
  onChange: (zones: Zone[]) => void;
  gameId?: string;
}

export interface ZoneEditor {
  setZones(zones: Zone[]): void;
  getZones(): Zone[];
  setTool(tool: DrawTool): void;
  destroy(): void;
}

// ── Create ──────────────────────────────────────────────────────────────────

export function createZoneEditor(
  container: HTMLElement,
  initialZones: Zone[],
  { onChange, gameId }: ZoneEditorOptions,
): ZoneEditor {

  let zones: Zone[] = structuredClone(initialZones);
  let selectedId: string | null = null;
  let activeTool: DrawTool = 'rect';
  let _voiceBtns: Array<{ destroy(): void }> = [];

  // Rect drawing state
  let drawState: { startX: number; startY: number; curX: number; curY: number } | null = null;

  // Polygon drawing state
  let polyPoints: Point[] = [];
  let polyCursorPt: Point | null = null;

  // Drag/resize state
  let dragState: { zoneId: string; offsetX: number; offsetY: number } | null = null;
  let resizeState: {
    zoneId: string; handle: string; origZone: Zone;
    startX: number; startY: number;
  } | null = null;

  // ── DOM ──────────────────────────────────────────────────────────────────

  const overlay = document.createElement('div');
  overlay.className = 'ab-ze-overlay';

  const drawRect = document.createElement('div');
  drawRect.className = 'ab-ze-draw-rect';
  drawRect.hidden = true;
  overlay.appendChild(drawRect);

  // SVG for polygon preview
  const polySvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  polySvg.classList.add('ab-ze-poly-svg');
  polySvg.setAttribute('viewBox', '0 0 100 100');
  polySvg.setAttribute('preserveAspectRatio', 'none');
  polySvg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:12;';
  overlay.appendChild(polySvg);

  // Toolbar
  const toolbar = document.createElement('div');
  toolbar.className = 'ab-ze-toolbar';
  overlay.appendChild(toolbar);

  function renderToolbar() {
    toolbar.innerHTML = '';
    const rectBtn = document.createElement('button');
    rectBtn.className = `ab-ze-tool-btn${activeTool === 'rect' ? ' ab-ze-tool-btn--active' : ''}`;
    rectBtn.textContent = '▭ מלבן';
    rectBtn.addEventListener('click', () => { setTool('rect'); });
    toolbar.appendChild(rectBtn);

    const polyBtn = document.createElement('button');
    polyBtn.className = `ab-ze-tool-btn${activeTool === 'polygon' ? ' ab-ze-tool-btn--active' : ''}`;
    polyBtn.textContent = '✎ חופשי';
    polyBtn.addEventListener('click', () => { setTool('polygon'); });
    toolbar.appendChild(polyBtn);

    const hint = document.createElement('span');
    hint.className = 'ab-ze-toolbar__hint';
    hint.textContent = activeTool === 'rect'
      ? 'גררו לציור מלבן'
      : 'לחצו נקודות, לחצו פעמיים לסגירה';
    toolbar.appendChild(hint);
  }

  container.style.position = 'relative';
  container.appendChild(overlay);
  renderToolbar();

  // ── Coordinate helpers ─────────────────────────────────────────────────

  function toPercent(clientX: number, clientY: number): { px: number; py: number } {
    const rect = overlay.getBoundingClientRect();
    return {
      px: Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)),
      py: Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100)),
    };
  }

  // ── Rendering ──────────────────────────────────────────────────────────

  function render() {
    _voiceBtns.forEach(b => b.destroy());
    _voiceBtns = [];
    overlay.querySelectorAll('.ab-ze-zone').forEach(el => el.remove());
    overlay.querySelectorAll('.ab-ze-panel').forEach(el => el.remove());

    zones.forEach(zone => {
      const el = document.createElement('div');
      el.className = 'ab-ze-zone';
      if (zone.correct) el.classList.add('ab-ze-zone--correct');
      if (zone.id === selectedId) el.classList.add('ab-ze-zone--selected');
      el.dataset.zoneId = zone.id;

      el.style.left   = `${zone.x}%`;
      el.style.top    = `${zone.y}%`;
      el.style.width  = `${zone.width}%`;
      el.style.height = `${zone.height}%`;

      // For polygons, render SVG clip mask
      if (zone.shape === 'polygon' && zone.points && zone.points.length >= 3) {
        const clipId = `clip-${zone.id}`;
        el.innerHTML = `<svg class="ab-ze-zone__poly-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs><clipPath id="${clipId}"><polygon points="${svgPointsAttr(zone.points, zone.x, zone.y, zone.width, zone.height)}"/></clipPath></defs>
          <rect x="0" y="0" width="100" height="100" clip-path="url(#${clipId})" fill="currentColor"/>
        </svg>`;
        el.classList.add('ab-ze-zone--poly');
      }

      // Badge
      const badge = document.createElement('div');
      badge.className = 'ab-ze-zone__badge';
      badge.textContent = zone.correct ? '\u2713' : '';
      if (zone.label) badge.textContent = zone.label;
      el.appendChild(badge);

      // Toggle correct
      const toggleBtn = document.createElement('button');
      toggleBtn.className = 'ab-ze-zone__toggle';
      toggleBtn.textContent = zone.correct ? '\u2713 נכון' : '\u2717 לא נכון';
      toggleBtn.title = 'סמן כתשובה נכונה / לא נכונה';
      toggleBtn.addEventListener('pointerdown', e => e.stopPropagation());
      toggleBtn.addEventListener('click', e => {
        e.stopPropagation();
        zone.correct = !zone.correct;
        emit();
        render();
      });
      el.appendChild(toggleBtn);

      // Delete
      const delBtn = document.createElement('button');
      delBtn.className = 'ab-ze-zone__delete';
      delBtn.textContent = '\u2715';
      delBtn.title = 'מחק אזור';
      delBtn.addEventListener('pointerdown', e => e.stopPropagation());
      delBtn.addEventListener('click', e => {
        e.stopPropagation();
        zones = zones.filter(z => z.id !== zone.id);
        if (selectedId === zone.id) selectedId = null;
        emit();
        render();
      });
      el.appendChild(delBtn);

      // Resize handles for rects only, when selected
      if (zone.shape !== 'polygon' && zone.id === selectedId) {
        for (const handle of ['nw', 'ne', 'sw', 'se'] as const) {
          const h = document.createElement('div');
          h.className = `ab-ze-zone__handle ab-ze-zone__handle--${handle}`;
          h.dataset.handle = handle;
          h.addEventListener('pointerdown', e => {
            e.stopPropagation();
            e.preventDefault();
            resizeState = {
              zoneId: zone.id, handle,
              origZone: { ...zone },
              startX: e.clientX, startY: e.clientY,
            };
          });
          el.appendChild(h);
        }
      }

      // Select + drag
      el.addEventListener('pointerdown', e => {
        e.stopPropagation();
        if (resizeState) return;
        selectedId = zone.id;
        render();
        const { px, py } = toPercent(e.clientX, e.clientY);
        dragState = { zoneId: zone.id, offsetX: px - zone.x, offsetY: py - zone.y };
      });

      overlay.appendChild(el);

      // Detail panel for selected zone
      if (zone.id === selectedId) {
        const panel = document.createElement('div');
        panel.className = 'ab-ze-panel';
        panel.style.left = `${zone.x}%`;
        panel.style.top  = `${zone.y + zone.height + 1}%`;

        const labelRow = document.createElement('div');
        labelRow.className = 'ab-ze-panel__row';
        const labelInput = document.createElement('input');
        labelInput.className = 'ab-ze-panel__input';
        labelInput.type = 'text';
        labelInput.dir = 'rtl';
        labelInput.placeholder = 'תווית (למשל: חתול)';
        labelInput.value = zone.label || '';
        labelInput.addEventListener('pointerdown', e => e.stopPropagation());
        labelInput.addEventListener('input', () => {
          zone.label = labelInput.value || undefined;
          emit();
        });
        labelRow.appendChild(labelInput);
        panel.appendChild(labelRow);

        if (gameId) {
          const audioRow = document.createElement('div');
          audioRow.className = 'ab-ze-panel__row';
          const audioLabel = document.createElement('span');
          audioLabel.className = 'ab-ze-panel__audio-label';
          audioLabel.textContent = '🎤';
          audioRow.appendChild(audioLabel);
          const btn = createVoiceRecordButton(audioRow, {
            gameId,
            voiceKey: `zone-${zone.id}`,
            label: `הקלטה לאזור ${zone.label || zone.id}`,
          });
          _voiceBtns.push(btn);
          panel.appendChild(audioRow);
        }

        panel.addEventListener('pointerdown', e => e.stopPropagation());
        overlay.appendChild(panel);
      }
    });
  }

  // ── Polygon preview SVG ────────────────────────────────────────────────

  function renderPolyPreview() {
    polySvg.innerHTML = '';
    if (polyPoints.length === 0) return;

    const pts = [...polyPoints];
    if (polyCursorPt) pts.push(polyCursorPt);

    // Polyline
    const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    polyline.setAttribute('points', pts.map(p => `${p.x},${p.y}`).join(' '));
    polyline.setAttribute('fill', 'rgba(251,191,36,0.15)');
    polyline.setAttribute('stroke', '#fbbf24');
    polyline.setAttribute('stroke-width', '0.4');
    polyline.setAttribute('stroke-dasharray', '1,0.5');
    polySvg.appendChild(polyline);

    // Dots at placed points
    polyPoints.forEach((p, i) => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', String(p.x));
      circle.setAttribute('cy', String(p.y));
      circle.setAttribute('r', '0.8');
      circle.setAttribute('fill', i === 0 ? '#22c55e' : '#fbbf24');
      circle.setAttribute('stroke', '#fff');
      circle.setAttribute('stroke-width', '0.3');
      polySvg.appendChild(circle);
    });
  }

  // ── Tool switching ─────────────────────────────────────────────────────

  function setTool(tool: DrawTool) {
    // Cancel any in-progress polygon
    if (polyPoints.length > 0) {
      polyPoints = [];
      polyCursorPt = null;
      renderPolyPreview();
    }
    activeTool = tool;
    overlay.classList.toggle('ab-ze-overlay--poly-mode', tool === 'polygon');
    renderToolbar();
  }

  // ── Rect drawing ───────────────────────────────────────────────────────

  function updateDrawRect() {
    if (!drawState) return;
    const x = Math.min(drawState.startX, drawState.curX);
    const y = Math.min(drawState.startY, drawState.curY);
    const w = Math.abs(drawState.curX - drawState.startX);
    const h = Math.abs(drawState.curY - drawState.startY);
    drawRect.style.left   = `${x}%`;
    drawRect.style.top    = `${y}%`;
    drawRect.style.width  = `${w}%`;
    drawRect.style.height = `${h}%`;
  }

  // ── Polygon closing ────────────────────────────────────────────────────

  function closePolygon() {
    if (polyPoints.length < 3) {
      polyPoints = [];
      polyCursorPt = null;
      renderPolyPreview();
      return;
    }
    const pts = [...polyPoints];
    const bb = boundingBox(pts);
    if (bb.width > 1 && bb.height > 1) {
      const newZone: Zone = {
        id: generateZoneId(),
        shape: 'polygon',
        ...bb,
        points: pts,
        correct: false,
      };
      zones.push(newZone);
      selectedId = newZone.id;
      emit();
    }
    polyPoints = [];
    polyCursorPt = null;
    renderPolyPreview();
    render();
  }

  // ── Event handlers ─────────────────────────────────────────────────────

  function onOverlayPointerDown(e: PointerEvent) {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest('.ab-ze-zone')) return;
    if ((e.target as HTMLElement).closest('.ab-ze-toolbar')) return;
    if ((e.target as HTMLElement).closest('.ab-ze-panel')) return;

    selectedId = null;

    if (activeTool === 'polygon') {
      const { px, py } = toPercent(e.clientX, e.clientY);

      // Close if clicking near the first point
      if (polyPoints.length >= 3) {
        const first = polyPoints[0];
        if (Math.abs(px - first.x) < 2 && Math.abs(py - first.y) < 2) {
          closePolygon();
          return;
        }
      }

      polyPoints.push({ x: px, y: py });
      renderPolyPreview();
      render();
      return;
    }

    // Rect tool
    const { px, py } = toPercent(e.clientX, e.clientY);
    drawState = { startX: px, startY: py, curX: px, curY: py };
    drawRect.hidden = false;
    updateDrawRect();
    render();
  }

  function onOverlayDblClick(e: MouseEvent) {
    if (activeTool === 'polygon' && polyPoints.length >= 3) {
      e.preventDefault();
      closePolygon();
    }
  }

  function onPointerMove(e: PointerEvent) {
    // Polygon cursor tracking
    if (activeTool === 'polygon' && polyPoints.length > 0) {
      const { px, py } = toPercent(e.clientX, e.clientY);
      polyCursorPt = { x: px, y: py };
      renderPolyPreview();
    }

    if (drawState) {
      const { px, py } = toPercent(e.clientX, e.clientY);
      drawState.curX = px;
      drawState.curY = py;
      updateDrawRect();
      return;
    }

    if (resizeState) {
      e.preventDefault();
      const zone = zones.find(z => z.id === resizeState!.zoneId);
      if (!zone) return;
      const orig = resizeState.origZone;
      const rect = overlay.getBoundingClientRect();
      const dx = ((e.clientX - resizeState.startX) / rect.width) * 100;
      const dy = ((e.clientY - resizeState.startY) / rect.height) * 100;
      const handle = resizeState.handle;
      if (handle.includes('e')) zone.width  = Math.max(3, orig.width + dx);
      if (handle.includes('w')) { zone.x = orig.x + dx; zone.width = Math.max(3, orig.width - dx); }
      if (handle.includes('s')) zone.height = Math.max(3, orig.height + dy);
      if (handle.includes('n')) { zone.y = orig.y + dy; zone.height = Math.max(3, orig.height - dy); }
      render();
      return;
    }

    if (dragState) {
      e.preventDefault();
      const zone = zones.find(z => z.id === dragState!.zoneId);
      if (!zone) return;
      const { px, py } = toPercent(e.clientX, e.clientY);
      const newX = Math.max(0, Math.min(100 - zone.width, px - dragState.offsetX));
      const newY = Math.max(0, Math.min(100 - zone.height, py - dragState.offsetY));
      // For polygons, shift all points too
      if (zone.shape === 'polygon' && zone.points) {
        const dx = newX - zone.x;
        const dy = newY - zone.y;
        zone.points = zone.points.map(p => ({ x: p.x + dx, y: p.y + dy }));
      }
      zone.x = newX;
      zone.y = newY;
      render();
    }
  }

  function onPointerUp() {
    if (drawState) {
      const x = Math.min(drawState.startX, drawState.curX);
      const y = Math.min(drawState.startY, drawState.curY);
      const w = Math.abs(drawState.curX - drawState.startX);
      const h = Math.abs(drawState.curY - drawState.startY);

      if (w > 3 && h > 3) {
        const newZone: Zone = {
          id: generateZoneId(), shape: 'rect',
          x, y, width: w, height: h, correct: false,
        };
        zones.push(newZone);
        selectedId = newZone.id;
        emit();
      }
      drawState = null;
      drawRect.hidden = true;
      render();
      return;
    }
    if (resizeState) { resizeState = null; emit(); return; }
    if (dragState)   { dragState = null;   emit(); }
  }

  function emit() { onChange(structuredClone(zones)); }

  function onKeyDown(e: KeyboardEvent) {
    // Escape cancels polygon in progress
    if (e.key === 'Escape' && polyPoints.length > 0) {
      polyPoints = [];
      polyCursorPt = null;
      renderPolyPreview();
      return;
    }
    // Enter closes polygon
    if (e.key === 'Enter' && polyPoints.length >= 3) {
      closePolygon();
      return;
    }
    if (!selectedId) return;
    if (e.key === 'Delete' || e.key === 'Backspace') {
      zones = zones.filter(z => z.id !== selectedId);
      selectedId = null;
      emit();
      render();
    }
    if (e.key === 'Escape') {
      selectedId = null;
      render();
    }
  }

  // ── Attach listeners ───────────────────────────────────────────────────

  overlay.addEventListener('pointerdown', onOverlayPointerDown);
  overlay.addEventListener('dblclick',    onOverlayDblClick);
  document.addEventListener('pointermove', onPointerMove);
  document.addEventListener('pointerup',   onPointerUp);
  document.addEventListener('keydown',     onKeyDown);

  render();

  // ── Public API ─────────────────────────────────────────────────────────

  return {
    setZones(newZones: Zone[]) {
      zones = structuredClone(newZones);
      selectedId = null;
      render();
    },
    getZones(): Zone[] { return structuredClone(zones); },
    setTool(tool: DrawTool) { setTool(tool); },
    destroy() {
      overlay.removeEventListener('pointerdown', onOverlayPointerDown);
      overlay.removeEventListener('dblclick',    onOverlayDblClick);
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup',   onPointerUp);
      document.removeEventListener('keydown',     onKeyDown);
      _voiceBtns.forEach(b => b.destroy());
      overlay.remove();
    },
  };
}
