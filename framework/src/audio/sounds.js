/**
 * אפקטים קוליים תכנותיים
 * יוצר צלילים פשוטים דרך Web Audio API - ללא קבצים חיצוניים
 * [נוסף על ידי: letter-match game]
 */

let _ctx = null;

function _getCtx() {
  if (!_ctx) {
    try {
      _ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      return null;
    }
  }
  // Resume if suspended (autoplay policy)
  if (_ctx.state === 'suspended') _ctx.resume();
  return _ctx;
}

function _playTone(freq, duration, type = 'sine', gainVal = 0.3) {
  const ctx = _getCtx();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(gainVal, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration + 0.05);
  } catch (e) {
    // Audio context not available in this environment
  }
}

export const sounds = {
  /** צליל תשובה נכונה */
  correct() {
    _playTone(523.25, 0.15);                        // C5
    setTimeout(() => _playTone(659.25, 0.2), 120);  // E5
    setTimeout(() => _playTone(783.99, 0.3), 240);  // G5
  },

  /** צליל עידוד עדין — נסה שוב */
  wrong() {
    _playTone(350, 0.15, 'triangle', 0.12);
  },

  /** צליל עידוד - סיום מוצלח */
  cheer() {
    const notes = [523.25, 587.33, 659.25, 698.46, 783.99, 1046.50];
    notes.forEach((freq, i) => setTimeout(() => _playTone(freq, 0.2), i * 90));
  },

  /** קליק עדין */
  click() {
    _playTone(900, 0.04, 'sine', 0.12);
  },

  /** צליל התראה — דחוף, יורד */
  alert() {
    _playTone(880, 0.15, 'square', 0.25);                 // A5
    setTimeout(() => _playTone(740, 0.15, 'square', 0.25), 150);  // F#5
    setTimeout(() => _playTone(880, 0.15, 'square', 0.25), 300);  // A5
    setTimeout(() => _playTone(587, 0.3, 'square', 0.2), 450);    // D5
  },
};
