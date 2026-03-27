/**
 * zone-editor — TinyTap-style zone drawing overlay.
 *
 * Teachers draw rectangular zones on a slide image, mark each as
 * correct/incorrect, and optionally add a label. Zones are stored
 * as percentage-based coordinates (0–100) so they scale with any
 * container size.
 *
 * Usage:
 *   const ze = createZoneEditor(containerEl, zones, { onChange });
 *   ze.destroy();
 */

import type { Zone } from './schemas.js';
import { createVoiceRecordButton } from '../ui/voice-record-button.js';

let _zoneIdCounter = 0;
function generateZoneId(): string {
  return `zone-${Date.now()}-${_zoneIdCounter++}`;
}

// ── Public interface ────────────────────────────────────────────────────────

export interface ZoneEditorOptions {
  /** Called whenever zones change (add, move, resize, delete, toggle correct) */
  onChange: (zones: Zone[]) => void;
  /** Game ID for voice storage (enables per-zone audio recording) */
  gameId?: string;
}

export interface ZoneEditor {
  /** Replace the displayed zones (e.g. when switching rounds) */
  setZones(zones: Zone[]): void;
  /** Get current zones */
  getZones(): Zone[];
  /** Remove the editor from the DOM */
  destroy(): void;
}

// ── Create ──────────────────────────────────────────────────────────────────

export function createZoneEditor(
  /** The image container element to overlay */
  container: HTMLElement,
  initialZones: Zone[],
  { onChange, gameId }: ZoneEditorOptions,
): ZoneEditor {

  let zones: Zone[] = structuredClone(initialZones);
  let selectedId: string | null = null;
  let _voiceBtns: Array<{ destroy(): void }> = [];
  let drawState: {
    startX: number; startY: number;
    curX: number;   curY: number;
  } | null = null;
  let dragState: {
    zoneId: string;
    offsetX: number; offsetY: number;
  } | null = null;
  let resizeState: {
    zoneId: string;
    handle: string;          // e.g. 'se', 'nw', 'ne', 'sw'
    origZone: Zone;
    startX: number; startY: number;
  } | null = null;

  // ── DOM ──────────────────────────────────────────────────────────────────

  const overlay = document.createElement('div');
  overlay.className = 'ab-ze-overlay';

  // Drawing preview rectangle
  const drawRect = document.createElement('div');
  drawRect.className = 'ab-ze-draw-rect';
  drawRect.hidden = true;
  overlay.appendChild(drawRect);

  // Toolbar at top
  const toolbar = document.createElement('div');
  toolbar.className = 'ab-ze-toolbar';
  toolbar.innerHTML = `
    <span class="ab-ze-toolbar__hint">לחצו וגררו לציור אזור</span>
  `;
  overlay.appendChild(toolbar);

  container.style.position = 'relative';
  container.appendChild(overlay);

  // ── Coordinate helpers ───────────────────────────────────────────────────

  function toPercent(clientX: number, clientY: number): { px: number; py: number } {
    const rect = overlay.getBoundingClientRect();
    return {
      px: Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)),
      py: Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100)),
    };
  }

  // ── Rendering ────────────────────────────────────────────────────────────

  function render() {
    // Destroy old voice buttons
    _voiceBtns.forEach(b => b.destroy());
    _voiceBtns = [];

    // Remove old zone elements (keep draw rect and toolbar)
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

      // Label badge
      const badge = document.createElement('div');
      badge.className = 'ab-ze-zone__badge';
      badge.textContent = zone.correct ? '\u2713' : '';
      if (zone.label) badge.textContent = zone.label;
      el.appendChild(badge);

      // Correct toggle button
      const toggleBtn = document.createElement('button');
      toggleBtn.className = 'ab-ze-zone__toggle';
      toggleBtn.textContent = zone.correct ? '\u2713 נכון' : '\u2717 לא נכון';
      toggleBtn.title = 'סמן כתשובה נכונה / לא נכונה';
      toggleBtn.addEventListener('pointerdown', e => { e.stopPropagation(); });
      toggleBtn.addEventListener('click', e => {
        e.stopPropagation();
        zone.correct = !zone.correct;
        emit();
        render();
      });
      el.appendChild(toggleBtn);

      // Delete button
      const delBtn = document.createElement('button');
      delBtn.className = 'ab-ze-zone__delete';
      delBtn.textContent = '\u2715';
      delBtn.title = 'מחק אזור';
      delBtn.addEventListener('pointerdown', e => { e.stopPropagation(); });
      delBtn.addEventListener('click', e => {
        e.stopPropagation();
        zones = zones.filter(z => z.id !== zone.id);
        if (selectedId === zone.id) selectedId = null;
        emit();
        render();
      });
      el.appendChild(delBtn);

      // Resize handles (only when selected)
      if (zone.id === selectedId) {
        for (const handle of ['nw', 'ne', 'sw', 'se'] as const) {
          const h = document.createElement('div');
          h.className = `ab-ze-zone__handle ab-ze-zone__handle--${handle}`;
          h.dataset.handle = handle;
          h.addEventListener('pointerdown', e => {
            e.stopPropagation();
            e.preventDefault();
            resizeState = {
              zoneId: zone.id,
              handle,
              origZone: { ...zone },
              startX: e.clientX,
              startY: e.clientY,
            };
          });
          el.appendChild(h);
        }
      }

      // Select on click
      el.addEventListener('pointerdown', e => {
        e.stopPropagation();
        if (resizeState) return;
        selectedId = zone.id;
        render();
        // Start drag
        const { px, py } = toPercent(e.clientX, e.clientY);
        dragState = {
          zoneId: zone.id,
          offsetX: px - zone.x,
          offsetY: py - zone.y,
        };
      });

      overlay.appendChild(el);

      // ── Detail panel for selected zone (label + audio) ────────────
      if (zone.id === selectedId) {
        const panel = document.createElement('div');
        panel.className = 'ab-ze-panel';
        // Position below the zone
        panel.style.left = `${zone.x}%`;
        panel.style.top  = `${zone.y + zone.height + 1}%`;

        // Label input
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

        // Audio record button (if gameId provided)
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

  // ── Drawing new zones ────────────────────────────────────────────────────

  function onOverlayPointerDown(e: PointerEvent) {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest('.ab-ze-zone')) return;
    if ((e.target as HTMLElement).closest('.ab-ze-toolbar')) return;

    selectedId = null;

    const { px, py } = toPercent(e.clientX, e.clientY);
    drawState = { startX: px, startY: py, curX: px, curY: py };
    drawRect.hidden = false;
    updateDrawRect();
    render();
  }

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

  // ── Global pointer move/up ───────────────────────────────────────────────

  function onPointerMove(e: PointerEvent) {
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
      if (handle.includes('e')) {
        zone.width = Math.max(3, orig.width + dx);
      }
      if (handle.includes('w')) {
        zone.x     = orig.x + dx;
        zone.width = Math.max(3, orig.width - dx);
      }
      if (handle.includes('s')) {
        zone.height = Math.max(3, orig.height + dy);
      }
      if (handle.includes('n')) {
        zone.y      = orig.y + dy;
        zone.height = Math.max(3, orig.height - dy);
      }
      render();
      return;
    }

    if (dragState) {
      e.preventDefault();
      const zone = zones.find(z => z.id === dragState!.zoneId);
      if (!zone) return;
      const { px, py } = toPercent(e.clientX, e.clientY);
      zone.x = Math.max(0, Math.min(100 - zone.width, px - dragState.offsetX));
      zone.y = Math.max(0, Math.min(100 - zone.height, py - dragState.offsetY));
      render();
    }
  }

  function onPointerUp(e: PointerEvent) {
    if (drawState) {
      const x = Math.min(drawState.startX, drawState.curX);
      const y = Math.min(drawState.startY, drawState.curY);
      const w = Math.abs(drawState.curX - drawState.startX);
      const h = Math.abs(drawState.curY - drawState.startY);

      // Only create zone if big enough (> 3% in both dimensions)
      if (w > 3 && h > 3) {
        const newZone: Zone = {
          id: generateZoneId(),
          x, y, width: w, height: h,
          correct: false,
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

    if (resizeState) {
      resizeState = null;
      emit();
      return;
    }

    if (dragState) {
      dragState = null;
      emit();
    }
  }

  // ── Events ───────────────────────────────────────────────────────────────

  function emit() {
    onChange(structuredClone(zones));
  }

  // ── Keyboard ─────────────────────────────────────────────────────────────

  function onKeyDown(e: KeyboardEvent) {
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

  // ── Attach listeners ────────────────────────────────────────────────────

  overlay.addEventListener('pointerdown', onOverlayPointerDown);
  document.addEventListener('pointermove', onPointerMove);
  document.addEventListener('pointerup',   onPointerUp);
  document.addEventListener('keydown',     onKeyDown);

  render();

  // ── Public API ──────────────────────────────────────────────────────────

  return {
    setZones(newZones: Zone[]) {
      zones = structuredClone(newZones);
      selectedId = null;
      render();
    },

    getZones(): Zone[] {
      return structuredClone(zones);
    },

    destroy() {
      overlay.removeEventListener('pointerdown', onOverlayPointerDown);
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup',   onPointerUp);
      document.removeEventListener('keydown',     onKeyDown);
      overlay.remove();
    },
  };
}
