/**
 * כפתור הקלטת קול
 * מצבים: ריק → מקליט → יש הקלטה
 * ניתן להטמיע בכל מקום בממשק
 */

import { createVoiceRecorder, isVoiceRecordingSupported } from '../audio/voice-recorder.js';
import { saveVoice, loadVoice, deleteVoice, playVoice }   from '../audio/voice-store.js';

/**
 * @param {HTMLElement} container - element to append the button group into
 * @param {object} options
 * @param {string} options.gameId
 * @param {string} options.voiceKey - unique key within the game (e.g. round id, 'instruction')
 * @param {string} [options.label] - shown as aria-label / tooltip
 * @param {(blob: Blob) => void} [options.onSaved]
 * @param {() => void} [options.onDeleted]
 * @returns {{ refresh(): Promise<void>, destroy(): void }}
 */
export function createVoiceRecordButton(container, {
  gameId,
  voiceKey,
  label = 'הקלטת קול',
  onSaved,
  onDeleted,
}) {
  if (!isVoiceRecordingSupported()) {
    // Show disabled indicator instead of crashing
    const note = document.createElement('span');
    note.className = 'ab-voice-unsupported';
    note.textContent = '🎤 הקלטה לא נתמכת בדפדפן זה';
    container.appendChild(note);
    return { refresh: async () => {}, destroy: () => note.remove() };
  }

  const recorder = createVoiceRecorder();

  const wrap = document.createElement('div');
  wrap.className = 'ab-voice-btn-wrap';
  wrap.setAttribute('aria-label', label);
  container.appendChild(wrap);

  // ── State machine ─────────────────────────────────────────────────────────
  // 'idle'       — no recording exists
  // 'recording'  — actively recording
  // 'has-voice'  — recording saved in store

  let state = 'idle';
  let _recordBtn = null;
  let _stopBtn   = null;
  let _playBtn   = null;
  let _deleteBtn = null;
  let _indicator = null;
  let _timer     = null;
  let _elapsed   = 0;

  function _render() {
    wrap.innerHTML = '';

    if (state === 'idle') {
      _recordBtn = _btn('🎤', 'ab-voice-btn ab-voice-btn--record', 'התחל הקלטה', _startRecording);
      wrap.appendChild(_recordBtn);

    } else if (state === 'recording') {
      _indicator = document.createElement('span');
      _indicator.className = 'ab-voice-indicator';
      wrap.appendChild(_indicator);

      const timeEl = document.createElement('span');
      timeEl.className = 'ab-voice-timer';
      timeEl.textContent = '0:00';
      wrap.appendChild(timeEl);

      _elapsed = 0;
      _timer = setInterval(() => {
        _elapsed++;
        const m = Math.floor(_elapsed / 60);
        const s = String(_elapsed % 60).padStart(2, '0');
        timeEl.textContent = `${m}:${s}`;
        if (_elapsed >= 120) _stopRecording(); // 2-min max
      }, 1000);

      _stopBtn = _btn('⏹', 'ab-voice-btn ab-voice-btn--stop', 'עצור הקלטה', _stopRecording);
      wrap.appendChild(_stopBtn);

    } else if (state === 'has-voice') {
      _playBtn = _btn('▶', 'ab-voice-btn ab-voice-btn--play', 'נגן הקלטה', _play);
      wrap.appendChild(_playBtn);

      _recordBtn = _btn('🎤', 'ab-voice-btn ab-voice-btn--re-record', 'הקלט מחדש', _startRecording);
      wrap.appendChild(_recordBtn);

      _deleteBtn = _btn('🗑', 'ab-voice-btn ab-voice-btn--delete', 'מחק הקלטה', _delete);
      wrap.appendChild(_deleteBtn);
    }
  }

  function _btn(icon, cls, title, onClick) {
    const b = document.createElement('button');
    b.className = cls;
    b.type = 'button';
    b.title = title;
    b.setAttribute('aria-label', title);
    b.textContent = icon;
    b.addEventListener('click', onClick);
    return b;
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  async function _startRecording() {
    try {
      await recorder.start();
      state = 'recording';
      _render();
    } catch (err) {
      console.warn('[voice-record-button] microphone access denied:', err);
      _showError('לא ניתן לגשת למיקרופון');
    }
  }

  async function _stopRecording() {
    clearInterval(_timer);
    try {
      const blob = await recorder.stop();
      await saveVoice(gameId, voiceKey, blob);
      state = 'has-voice';
      _render();
      onSaved?.(blob);
    } catch (err) {
      console.warn('[voice-record-button] stop error:', err);
      state = 'idle';
      _render();
    }
  }

  async function _play() {
    _playBtn?.setAttribute('disabled', 'true');
    await playVoice(gameId, voiceKey);
    _playBtn?.removeAttribute('disabled');
  }

  async function _delete() {
    if (!confirm('למחוק את ההקלטה?')) return;
    await deleteVoice(gameId, voiceKey);
    state = 'idle';
    _render();
    onDeleted?.();
  }

  function _showError(msg) {
    const err = document.createElement('span');
    err.className = 'ab-voice-error';
    err.textContent = msg;
    wrap.appendChild(err);
    setTimeout(() => err.remove(), 3000);
  }

  // ── Public API ────────────────────────────────────────────────────────────

  /** Sync UI state with what's actually in the store */
  async function refresh() {
    if (recorder.isActive()) return; // don't interrupt an active recording
    const blob = await loadVoice(gameId, voiceKey).catch(() => null);
    state = blob ? 'has-voice' : 'idle';
    _render();
  }

  function destroy() {
    clearInterval(_timer);
    if (recorder.isActive()) recorder.cancel();
    wrap.remove();
  }

  // Initial render
  refresh();

  return { refresh, destroy };
}
