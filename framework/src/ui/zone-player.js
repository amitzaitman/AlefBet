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
 */
import { LitElement, html } from 'lit';
import { playVoice } from '../audio/voice-store.js';

function _svgPtsAttr(pts, zx, zy, zw, zh) {
  return pts.map(p => {
    const lx = zw > 0 ? ((p.x - zx) / zw) * 100 : 0;
    const ly = zh > 0 ? ((p.y - zy) / zh) * 100 : 0;
    return `${lx},${ly}`;
  }).join(' ');
}

class AbZonePlayer extends LitElement {
  static properties = {
    image:               { type: String },
    zones:               { type: Array },
    mode:                { type: String },
    gameId:              { type: String },
    roundId:             { type: String },
    showZones:           { type: Boolean },
    autoPlayInstruction: { type: Boolean },
    hintAfter:           { type: Number },
    _found:              { state: true },
    _wrongZones:         { state: true },
    _tappedZones:        { state: true },
    _hintZones:          { state: true },
    _revealedZones:      { state: true },
    _wrongCount:         { state: true },
    _hintShown:          { state: true },
  };

  createRenderRoot() { return this; }

  constructor() {
    super();
    this.image = '';
    this.zones = [];
    this.mode = 'quiz';
    this.gameId = null;
    this.roundId = null;
    this.showZones = false;
    this.autoPlayInstruction = true;
    this.hintAfter = 3;
    this._found = new Set();
    this._wrongZones = new Set();
    this._tappedZones = new Set();
    this._hintZones = new Set();
    this._revealedZones = new Set();
    this._wrongCount = 0;
    this._hintShown = false;
    this._playing = false;
    this._onCorrect = null;
    this._onWrong = null;
    this._onAllCorrect = null;
    this._onZoneTap = null;
  }

  firstUpdated() {
    if (this.autoPlayInstruction && this.gameId && this.roundId) {
      setTimeout(() => playVoice(this.gameId, this.roundId).catch(() => {}), 400);
    }
  }

  async _playZoneAudio(zoneId) {
    if (!this.gameId || this._playing) return;
    this._playing = true;
    try { await playVoice(this.gameId, `zone-${zoneId}`); } catch { /* ok */ }
    this._playing = false;
  }

  _maybeShowHint() {
    if (this._hintShown || this.hintAfter <= 0 || this.mode === 'soundboard') return;
    if (this._wrongCount < this.hintAfter) return;
    this._hintShown = true;

    const correctUnsolved = this.zones
      .filter(z => z.correct && !this._found.has(z.id))
      .map(z => z.id);
    this._hintZones = new Set(correctUnsolved);

    setTimeout(() => {
      this._hintZones = new Set();
      this._hintShown = false;
      this._wrongCount = 0;
    }, 1500);
  }

  _handleZoneTap(zone) {
    this._onZoneTap?.(zone);
    this._playZoneAudio(zone.id);

    if (this.mode === 'soundboard') {
      const tapped = new Set(this._tappedZones);
      tapped.add(zone.id);
      this._tappedZones = tapped;
      setTimeout(() => {
        const t = new Set(this._tappedZones);
        t.delete(zone.id);
        this._tappedZones = t;
      }, 400);
      return;
    }

    // Quiz mode
    if (this._found.has(zone.id)) return;

    if (zone.correct) {
      const found = new Set(this._found);
      found.add(zone.id);
      this._found = found;
      this._onCorrect?.(zone);
      const totalCorrect = this.zones.filter(z => z.correct).length;
      if (found.size >= totalCorrect) this._onAllCorrect?.();
    } else {
      const wrong = new Set(this._wrongZones);
      wrong.add(zone.id);
      this._wrongZones = wrong;
      this._wrongCount++;
      this._onWrong?.(zone);
      setTimeout(() => {
        const w = new Set(this._wrongZones);
        w.delete(zone.id);
        this._wrongZones = w;
      }, 600);
      this._maybeShowHint();
    }
  }

  _zoneClass(zone) {
    const isSoundboard = this.mode === 'soundboard';
    const cls = ['ab-zp-zone'];
    if (this.showZones || isSoundboard) cls.push('ab-zp-zone--visible');
    if (isSoundboard)                   cls.push('ab-zp-zone--soundboard');
    if (zone.shape === 'polygon')       cls.push('ab-zp-zone--poly');
    if (this._found.has(zone.id))       cls.push('ab-zp-zone--correct');
    if (this._wrongZones.has(zone.id))  cls.push('ab-zp-zone--wrong');
    if (this._tappedZones.has(zone.id)) cls.push('ab-zp-zone--tapped');
    if (this._hintZones.has(zone.id))   cls.push('ab-zp-zone--hint');
    if (this._revealedZones.has(zone.id)) cls.push('ab-zp-zone--revealed');
    return cls.join(' ');
  }

  _renderZoneContent(zone) {
    const parts = [];
    if (zone.shape === 'polygon' && zone.points?.length >= 3) {
      const uid = `zp-clip-${zone.id}`;
      const pts = _svgPtsAttr(zone.points, zone.x, zone.y, zone.width, zone.height);
      parts.push(html`
        <svg class="ab-zp-zone__poly-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs><clipPath id=${uid}><polygon points=${pts}/></clipPath></defs>
          <rect x="0" y="0" width="100" height="100" clip-path=${'url(#' + uid + ')'} fill="transparent"/>
        </svg>`);
    }
    if (this.mode === 'soundboard' && zone.label) {
      parts.push(html`<span class="ab-zp-zone__label">${zone.label}</span>`);
    }
    return parts;
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  async playInstruction() {
    if (this.gameId && this.roundId) return playVoice(this.gameId, this.roundId);
    return false;
  }

  async playZoneAudio(zoneId) {
    if (this.gameId) return playVoice(this.gameId, `zone-${zoneId}`);
    return false;
  }

  revealCorrect() {
    const revealed = new Set(this._revealedZones);
    this.zones.filter(z => z.correct).forEach(z => revealed.add(z.id));
    this._revealedZones = revealed;
  }

  reset() {
    this._found = new Set();
    this._wrongZones = new Set();
    this._tappedZones = new Set();
    this._hintZones = new Set();
    this._revealedZones = new Set();
    this._wrongCount = 0;
    this._hintShown = false;
  }

  render() {
    return html`
      <div class="ab-zp-wrap">
        <img class="ab-zp-image" src=${this.image} alt="" draggable="false">
        <div class="ab-zp-layer">
          ${this.zones.map(zone => html`
            <button
              class=${this._zoneClass(zone)}
              style="left:${zone.x}%; top:${zone.y}%; width:${zone.width}%; height:${zone.height}%"
              aria-label=${zone.label || (zone.correct ? 'correct zone' : 'zone')}
              @click=${() => this._handleZoneTap(zone)}
            >${this._renderZoneContent(zone)}</button>
          `)}
        </div>
      </div>
    `;
  }
}

customElements.define('ab-zone-player', AbZonePlayer);

/**
 * @param {HTMLElement} container
 * @param {Object} config
 * @returns {{ playInstruction(), playZoneAudio(id), revealCorrect(), reset(), destroy() }}
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

  const el = document.createElement('ab-zone-player');
  el.image = image;
  el.zones = zones;
  el.mode = mode;
  el.gameId = gameId;
  el.roundId = roundId;
  el.showZones = showZones;
  el.autoPlayInstruction = autoPlayInstruction;
  el.hintAfter = hintAfter;
  el._onCorrect = onCorrect;
  el._onWrong = onWrong;
  el._onAllCorrect = onAllCorrect;
  el._onZoneTap = onZoneTap;
  container.appendChild(el);

  return {
    playInstruction:       () => el.playInstruction(),
    playZoneAudio: (id)    => el.playZoneAudio(id),
    revealCorrect:         () => el.revealCorrect(),
    reset:                 () => el.reset(),
    destroy:               () => el.remove(),
  };
}
