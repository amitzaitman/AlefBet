/**
 * zone-player — renders tappable zones over a slide image during play.
 *
 * Students see the image and tap zones. Correct zones trigger positive
 * feedback; wrong zones shake and give another chance.
 *
 * Usage:
 *   const zp = createZonePlayer(containerEl, {
 *     image: 'data:image/...',
 *     zones: [ { id, x, y, width, height, correct, label } ],
 *     onCorrect(zone)  { ... },
 *     onWrong(zone)     { ... },
 *     onAllCorrect()    { ... },
 *   });
 *   zp.destroy();
 */

/**
 * @param {HTMLElement} container
 * @param {Object} config
 * @param {string} config.image — image URL or data-URL
 * @param {Array<{id:string, x:number, y:number, width:number, height:number, correct:boolean, label?:string}>} config.zones
 * @param {Function} [config.onCorrect] — called with zone when correct zone tapped
 * @param {Function} [config.onWrong]   — called with zone when wrong zone tapped
 * @param {Function} [config.onAllCorrect] — called when all correct zones found
 * @param {boolean}  [config.showZones=false] — if true, zones are visible (debug/hint mode)
 */
export function createZonePlayer(container, config) {
  const { image, zones = [], onCorrect, onWrong, onAllCorrect, showZones = false } = config;

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

  // Render zone elements
  zones.forEach(zone => {
    const el = document.createElement('button');
    el.className = 'ab-zp-zone';
    if (showZones) el.classList.add('ab-zp-zone--visible');
    el.style.left   = `${zone.x}%`;
    el.style.top    = `${zone.y}%`;
    el.style.width  = `${zone.width}%`;
    el.style.height = `${zone.height}%`;
    el.setAttribute('aria-label', zone.label || (zone.correct ? 'correct zone' : 'zone'));

    el.addEventListener('click', () => {
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

  return {
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
        el.classList.remove('ab-zp-zone--correct', 'ab-zp-zone--wrong', 'ab-zp-zone--revealed');
      });
    },

    destroy() {
      wrap.remove();
    },
  };
}
