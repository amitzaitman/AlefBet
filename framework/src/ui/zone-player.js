/**
 * zone-player — renders tappable zones over a slide image during play.
 *
 * Supports two modes:
 *   'quiz'       — students tap correct zones; wrong taps shake (default)
 *   'soundboard' — no right/wrong; tap any zone to hear its audio
 *
 * Per-zone audio: if gameId is provided, tapping a zone plays its
 * recorded audio from the voice store (key: "zone-{zone.id}").
 *
 * Question audio: if gameId + roundId are provided, the round's
 * instruction audio plays automatically when the player loads.
 *
 * Usage:
 *   const zp = createZonePlayer(containerEl, {
 *     image: 'data:image/...',
 *     zones: [ { id, x, y, width, height, correct, label } ],
 *     mode: 'quiz',            // or 'soundboard'
 *     gameId: 'my-game',       // enables per-zone audio
 *     roundId: 'round-123',    // enables auto-play instruction audio
 *     onCorrect(zone)  { ... },
 *     onWrong(zone)    { ... },
 *     onAllCorrect()   { ... },
 *     onZoneTap(zone)  { ... },  // called in any mode
 *   });
 *   zp.destroy();
 */

import { playVoice } from '../audio/voice-store.js';

/**
 * @param {HTMLElement} container
 * @param {Object} config
 * @param {string} config.image — image URL or data-URL
 * @param {Array<{id:string, x:number, y:number, width:number, height:number, correct:boolean, label?:string}>} config.zones
 * @param {'quiz'|'soundboard'} [config.mode='quiz']
 * @param {string}   [config.gameId]   — game ID for voice playback
 * @param {string}   [config.roundId]  — round ID for instruction audio
 * @param {Function} [config.onCorrect] — called with zone when correct zone tapped (quiz mode)
 * @param {Function} [config.onWrong]   — called with zone when wrong zone tapped (quiz mode)
 * @param {Function} [config.onAllCorrect] — called when all correct zones found (quiz mode)
 * @param {Function} [config.onZoneTap]  — called with zone on any tap (any mode)
 * @param {boolean}  [config.showZones=false] — if true, zones are visible (debug/hint mode)
 * @param {boolean}  [config.autoPlayInstruction=true] — auto-play round instruction audio on load
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
  } = config;

  const isSoundboard = mode === 'soundboard';

  const wrap = document.createElement('div');
  wrap.className = 'ab-zp-wrap';

  // Background image
  const img = document.createElement('img');
  img.className = 'ab-zp-image';
  img.src = image;
  img.alt = '';
  img.draggable = false;
  wrap.appendChild(img);

  // Zone overlay layer
  const layer = document.createElement('div');
  layer.className = 'ab-zp-layer';
  wrap.appendChild(layer);

  container.appendChild(wrap);

  const found = new Set();
  let _playing = false;

  // ── Play zone audio ──────────────────────────────────────────────────────

  async function _playZoneAudio(zoneId) {
    if (!gameId || _playing) return;
    _playing = true;
    try {
      await playVoice(gameId, `zone-${zoneId}`);
    } catch { /* no audio stored — that's fine */ }
    _playing = false;
  }

  // ── Render zone elements ─────────────────────────────────────────────────

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

    // Show label in soundboard mode
    if (isSoundboard && zone.label) {
      const labelEl = document.createElement('span');
      labelEl.className = 'ab-zp-zone__label';
      labelEl.textContent = zone.label;
      el.appendChild(labelEl);
    }

    el.addEventListener('click', () => {
      if (onZoneTap) onZoneTap(zone);

      // Play zone audio regardless of mode
      _playZoneAudio(zone.id);

      if (isSoundboard) {
        // Soundboard: just pulse animation on tap
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

        // Check if all correct zones found
        const totalCorrect = zones.filter(z => z.correct).length;
        if (found.size >= totalCorrect && onAllCorrect) {
          onAllCorrect();
        }
      } else {
        el.classList.add('ab-zp-zone--wrong');
        if (onWrong) onWrong(zone);
        // Remove wrong state after animation
        setTimeout(() => el.classList.remove('ab-zp-zone--wrong'), 600);
      }
    });

    layer.appendChild(el);
  });

  // ── Auto-play instruction audio ──────────────────────────────────────────

  if (autoPlayInstruction && gameId && roundId) {
    // Small delay to let the UI settle before speaking
    setTimeout(() => {
      playVoice(gameId, roundId).catch(() => {});
    }, 400);
  }

  // ── Public API ───────────────────────────────────────────────────────────

  return {
    /** Play the round instruction audio on demand */
    async playInstruction() {
      if (gameId && roundId) {
        return playVoice(gameId, roundId);
      }
      return false;
    },

    /** Play a specific zone's audio */
    async playZoneAudio(zoneId) {
      if (gameId) {
        return playVoice(gameId, `zone-${zoneId}`);
      }
      return false;
    },

    /** Highlight all correct zones (hint/reveal) */
    revealCorrect() {
      layer.querySelectorAll('.ab-zp-zone').forEach((el, i) => {
        if (zones[i]?.correct) el.classList.add('ab-zp-zone--revealed');
      });
    },

    /** Reset all found state */
    reset() {
      found.clear();
      layer.querySelectorAll('.ab-zp-zone').forEach(el => {
        el.classList.remove(
          'ab-zp-zone--correct', 'ab-zp-zone--wrong',
          'ab-zp-zone--revealed', 'ab-zp-zone--tapped',
        );
      });
    },

    destroy() {
      wrap.remove();
    },
  };
}
