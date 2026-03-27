/**
 * zone-player — renders tappable zones over a slide image during play.
 *
 * Supports:
 *   mode: 'quiz'       — tap correct zones; wrong taps shake (default)
 *   mode: 'soundboard' — tap any zone to hear audio, no right/wrong
 *
 * Zone shapes: 'rect' (default) and 'polygon' (freeform SVG).
 *
 * Auto-hint: after `hintAfter` wrong taps (default 3), correct zones
 * blink briefly to guide the student. Set hintAfter=0 to disable.
 *
 * Per-zone audio: if gameId provided, plays voice store audio on tap.
 * Instruction audio: if gameId + roundId, auto-plays on load.
 */

import { playVoice } from '../audio/voice-store.js';

/**
 * Build SVG polygon points attr from zone points relative to bounding box.
 * @param {Array<{x:number,y:number}>} pts
 * @param {number} zx zone x
 * @param {number} zy zone y
 * @param {number} zw zone width
 * @param {number} zh zone height
 */
function _svgPtsAttr(pts, zx, zy, zw, zh) {
  return pts.map(p => {
    const lx = zw > 0 ? ((p.x - zx) / zw) * 100 : 0;
    const ly = zh > 0 ? ((p.y - zy) / zh) * 100 : 0;
    return `${lx},${ly}`;
  }).join(' ');
}

/**
 * @param {HTMLElement} container
 * @param {Object} config
 * @param {string} config.image
 * @param {Array} config.zones
 * @param {'quiz'|'soundboard'} [config.mode='quiz']
 * @param {string}   [config.gameId]
 * @param {string}   [config.roundId]
 * @param {Function} [config.onCorrect]
 * @param {Function} [config.onWrong]
 * @param {Function} [config.onAllCorrect]
 * @param {Function} [config.onZoneTap]
 * @param {boolean}  [config.showZones=false]
 * @param {boolean}  [config.autoPlayInstruction=true]
 * @param {number}   [config.hintAfter=3] — wrong taps before auto-hint (0=disabled)
 */
export function createZonePlayer(container, config) {
  const {
    image,
    zones = [],
    mode = 'quiz',
    gameId,
    roundId,
    onCorrect,
    onWrong,
    onAllCorrect,
    onZoneTap,
    showZones = false,
    autoPlayInstruction = true,
    hintAfter = 3,
  } = config;

  const isSoundboard = mode === 'soundboard';

  const wrap = document.createElement('div');
  wrap.className = 'ab-zp-wrap';

  const img = document.createElement('img');
  img.className = 'ab-zp-image';
  img.src = image;
  img.alt = '';
  img.draggable = false;
  wrap.appendChild(img);

  const layer = document.createElement('div');
  layer.className = 'ab-zp-layer';
  wrap.appendChild(layer);

  container.appendChild(wrap);

  const found = new Set();
  let wrongCount = 0;
  let _playing = false;
  let _hintShown = false;

  // ── Play zone audio ────────────────────────────────────────────────────

  async function _playZoneAudio(zoneId) {
    if (!gameId || _playing) return;
    _playing = true;
    try { await playVoice(gameId, `zone-${zoneId}`); } catch { /* ok */ }
    _playing = false;
  }

  // ── Auto-hint ──────────────────────────────────────────────────────────

  function _maybeShowHint() {
    if (_hintShown || hintAfter <= 0 || isSoundboard) return;
    if (wrongCount < hintAfter) return;
    _hintShown = true;

    // Briefly blink correct zones
    const els = layer.querySelectorAll('.ab-zp-zone');
    els.forEach((el, i) => {
      if (zones[i]?.correct && !found.has(zones[i].id)) {
        el.classList.add('ab-zp-zone--hint');
      }
    });
    setTimeout(() => {
      els.forEach(el => el.classList.remove('ab-zp-zone--hint'));
      // Allow another hint after more wrong attempts
      _hintShown = false;
      wrongCount = 0;
    }, 1500);
  }

  // ── Render zones ───────────────────────────────────────────────────────

  zones.forEach(zone => {
    const el = document.createElement('button');
    el.className = 'ab-zp-zone';
    if (showZones || isSoundboard) el.classList.add('ab-zp-zone--visible');
    if (isSoundboard) el.classList.add('ab-zp-zone--soundboard');
    el.style.left   = `${zone.x}%`;
    el.style.top    = `${zone.y}%`;
    el.style.width  = `${zone.width}%`;
    el.style.height = `${zone.height}%`;
    el.setAttribute('aria-label', zone.label || (zone.correct ? 'correct zone' : 'zone'));

    // Polygon: SVG clip-path for non-rectangular hit area
    if (zone.shape === 'polygon' && zone.points && zone.points.length >= 3) {
      const uid = `zp-clip-${zone.id}`;
      el.innerHTML = `<svg class="ab-zp-zone__poly-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs><clipPath id="${uid}"><polygon points="${_svgPtsAttr(zone.points, zone.x, zone.y, zone.width, zone.height)}"/></clipPath></defs>
        <rect x="0" y="0" width="100" height="100" clip-path="url(#${uid})" fill="transparent"/>
      </svg>`;
      el.classList.add('ab-zp-zone--poly');
    }

    // Label in soundboard mode
    if (isSoundboard && zone.label) {
      const labelEl = document.createElement('span');
      labelEl.className = 'ab-zp-zone__label';
      labelEl.textContent = zone.label;
      el.appendChild(labelEl);
    }

    el.addEventListener('click', () => {
      if (onZoneTap) onZoneTap(zone);
      _playZoneAudio(zone.id);

      if (isSoundboard) {
        el.classList.add('ab-zp-zone--tapped');
        setTimeout(() => el.classList.remove('ab-zp-zone--tapped'), 400);
        return;
      }

      // Quiz mode
      if (found.has(zone.id)) return;

      if (zone.correct) {
        found.add(zone.id);
        el.classList.add('ab-zp-zone--correct');
        if (onCorrect) onCorrect(zone);
        const totalCorrect = zones.filter(z => z.correct).length;
        if (found.size >= totalCorrect && onAllCorrect) {
          onAllCorrect();
        }
      } else {
        el.classList.add('ab-zp-zone--wrong');
        wrongCount++;
        if (onWrong) onWrong(zone);
        setTimeout(() => el.classList.remove('ab-zp-zone--wrong'), 600);
        _maybeShowHint();
      }
    });

    layer.appendChild(el);
  });

  // ── Auto-play instruction audio ────────────────────────────────────────

  if (autoPlayInstruction && gameId && roundId) {
    setTimeout(() => { playVoice(gameId, roundId).catch(() => {}); }, 400);
  }

  // ── Public API ─────────────────────────────────────────────────────────

  return {
    async playInstruction() {
      if (gameId && roundId) return playVoice(gameId, roundId);
      return false;
    },

    async playZoneAudio(zoneId) {
      if (gameId) return playVoice(gameId, `zone-${zoneId}`);
      return false;
    },

    revealCorrect() {
      layer.querySelectorAll('.ab-zp-zone').forEach((el, i) => {
        if (zones[i]?.correct) el.classList.add('ab-zp-zone--revealed');
      });
    },

    reset() {
      found.clear();
      wrongCount = 0;
      _hintShown = false;
      layer.querySelectorAll('.ab-zp-zone').forEach(el => {
        el.classList.remove(
          'ab-zp-zone--correct', 'ab-zp-zone--wrong',
          'ab-zp-zone--revealed', 'ab-zp-zone--tapped', 'ab-zp-zone--hint',
        );
      });
    },

    destroy() { wrap.remove(); },
  };
}
