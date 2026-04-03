/**
 * כפתור הקלטת קול
 * מצבים: idle → recording → has-voice
 */
import { LitElement, html } from 'lit';
import { createVoiceRecorder, isVoiceRecordingSupported } from '../audio/voice-recorder.js';
import { saveVoice, loadVoice, deleteVoice, playVoice }   from '../audio/voice-store.js';

class AbVoiceRecordButton extends LitElement {
  static properties = {
    gameId:   { type: String },
    voiceKey: { type: String },
    label:    { type: String },
    _state:   { state: true },   // 'idle' | 'recording' | 'has-voice' | 'unsupported'
    _elapsed: { state: true },
    _playing: { state: true },
    _error:   { state: true },
  };

  createRenderRoot() { return this; }

  constructor() {
    super();
    this.gameId = '';
    this.voiceKey = '';
    this.label = 'הקלטת קול';
    this._state = 'idle';
    this._elapsed = 0;
    this._playing = false;
    this._error = null;
    this._recorder = null;
    this._timer = null;
    this._onSaved = null;
    this._onDeleted = null;
  }

  connectedCallback() {
    super.connectedCallback();
    if (!isVoiceRecordingSupported()) {
      this._state = 'unsupported';
      return;
    }
    this._recorder = createVoiceRecorder();
    this.refresh();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    clearInterval(this._timer);
    if (this._recorder?.isActive()) this._recorder.cancel();
  }

  async refresh() {
    if (this._recorder?.isActive()) return;
    const blob = await loadVoice(this.gameId, this.voiceKey).catch(() => null);
    this._state = blob ? 'has-voice' : 'idle';
  }

  async _startRecording() {
    try {
      await this._recorder.start();
      this._elapsed = 0;
      this._state = 'recording';
      this._timer = setInterval(() => {
        this._elapsed++;
        if (this._elapsed >= 120) this._stopRecording();
      }, 1000);
    } catch (err) {
      console.warn('[voice-record-button] microphone access denied:', err);
      this._showError('לא ניתן לגשת למיקרופון');
    }
  }

  async _stopRecording() {
    clearInterval(this._timer);
    try {
      const blob = await this._recorder.stop();
      await saveVoice(this.gameId, this.voiceKey, blob);
      this._state = 'has-voice';
      this._onSaved?.(blob);
    } catch (err) {
      console.warn('[voice-record-button] stop error:', err);
      this._state = 'idle';
    }
  }

  async _play() {
    if (this._playing) return;
    this._playing = true;
    await playVoice(this.gameId, this.voiceKey);
    this._playing = false;
  }

  async _delete() {
    if (!confirm('למחוק את ההקלטה?')) return;
    await deleteVoice(this.gameId, this.voiceKey);
    this._state = 'idle';
    this._onDeleted?.();
  }

  _showError(msg) {
    this._error = msg;
    setTimeout(() => { this._error = null; }, 3000);
  }

  _formatTime(s) {
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }

  render() {
    if (this._state === 'unsupported') {
      return html`<span class="ab-voice-unsupported">🎤 הקלטה לא נתמכת בדפדפן זה</span>`;
    }
    return html`
      <div class="ab-voice-btn-wrap" aria-label=${this.label}>
        ${this._state === 'idle' ? html`
          <button class="ab-voice-btn ab-voice-btn--record" type="button"
                  title="התחל הקלטה" aria-label="התחל הקלטה"
                  @click=${() => this._startRecording()}>🎤</button>
        ` : ''}

        ${this._state === 'recording' ? html`
          <span class="ab-voice-indicator"></span>
          <span class="ab-voice-timer">${this._formatTime(this._elapsed)}</span>
          <button class="ab-voice-btn ab-voice-btn--stop" type="button"
                  title="עצור הקלטה" aria-label="עצור הקלטה"
                  @click=${() => this._stopRecording()}>⏹</button>
        ` : ''}

        ${this._state === 'has-voice' ? html`
          <button class="ab-voice-btn ab-voice-btn--play" type="button"
                  title="נגן הקלטה" aria-label="נגן הקלטה"
                  ?disabled=${this._playing}
                  @click=${() => this._play()}>▶</button>
          <button class="ab-voice-btn ab-voice-btn--re-record" type="button"
                  title="הקלט מחדש" aria-label="הקלט מחדש"
                  @click=${() => this._startRecording()}>🎤</button>
          <button class="ab-voice-btn ab-voice-btn--delete" type="button"
                  title="מחק הקלטה" aria-label="מחק הקלטה"
                  @click=${() => this._delete()}>🗑</button>
        ` : ''}

        ${this._error ? html`<span class="ab-voice-error">${this._error}</span>` : ''}
      </div>
    `;
  }
}

customElements.define('ab-voice-record-button', AbVoiceRecordButton);

/**
 * @param {HTMLElement} container
 * @param {{ gameId, voiceKey, label?, onSaved?, onDeleted? }} options
 * @returns {{ refresh(): Promise<void>, destroy(): void }}
 */
export function createVoiceRecordButton(container, {
  gameId,
  voiceKey,
  label = 'הקלטת קול',
  onSaved,
  onDeleted,
} = {}) {
  const el = document.createElement('ab-voice-record-button');
  el.gameId = gameId;
  el.voiceKey = voiceKey;
  el.label = label;
  el._onSaved = onSaved;
  el._onDeleted = onDeleted;
  container.appendChild(el);
  return {
    refresh: () => el.refresh(),
    destroy: () => el.remove(),
  };
}
