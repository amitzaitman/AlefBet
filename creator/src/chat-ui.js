/**
 * ממשק הצ'אט
 * מנהל הצגת הודעות, אינדיקטור הקלדה, גלילה אוטומטית
 */

export class ChatUI {
  constructor(messagesContainer) {
    this.container = messagesContainer;
    this._thinkingEl = null;
  }

  /** הצג הודעת משתמש */
  addUserMessage(text) {
    const el = this._createBubble('user', text);
    this.container.appendChild(el);
    this._scrollToBottom();
    return el;
  }

  /** התחל הודעת עוזר עם אינדיקטור הקלדה */
  startAssistantMessage() {
    const el = this._createThinkingBubble();
    this.container.appendChild(el);
    this._thinkingEl = el;
    this._scrollToBottom();
    return el;
  }

  /** עדכן הודעת עוזר עם תוכן streaming */
  updateAssistantMessage(fullText) {
    if (!this._thinkingEl) return;
    const bubble = this._thinkingEl.querySelector('.message__bubble');
    if (bubble) {
      bubble.textContent = fullText;
      bubble.classList.remove('typing-dots-wrapper');
    }
    this._scrollToBottom();
  }

  /** סיים הודעת עוזר */
  finalizeAssistantMessage(fullText) {
    if (!this._thinkingEl) return;
    const bubble = this._thinkingEl.querySelector('.message__bubble');
    if (bubble) bubble.textContent = fullText;
    this._thinkingEl.classList.remove('message--thinking');
    this._thinkingEl = null;
    this._scrollToBottom();
  }

  /** הצג הודעת שגיאה */
  addErrorMessage(text) {
    const el = document.createElement('div');
    el.className = 'message-error';
    el.textContent = `שְׁגִיאָה: ${text}`;
    this.container.appendChild(el);
    this._scrollToBottom();
  }

  /** נקה את כל ההודעות */
  clear() {
    this.container.innerHTML = '';
    this._thinkingEl = null;
  }

  _createBubble(role, text) {
    const wrapper = document.createElement('div');
    wrapper.className = `message message--${role}`;
    const bubble = document.createElement('div');
    bubble.className = 'message__bubble';
    bubble.textContent = text;
    const time = document.createElement('div');
    time.className = 'message__time';
    time.textContent = new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
    wrapper.appendChild(bubble);
    wrapper.appendChild(time);
    return wrapper;
  }

  _createThinkingBubble() {
    const wrapper = document.createElement('div');
    wrapper.className = 'message message--assistant message--thinking';
    const bubble = document.createElement('div');
    bubble.className = 'message__bubble';
    bubble.innerHTML = `חוֹשֵׁב <span class="typing-dots"><span></span><span></span><span></span></span>`;
    wrapper.appendChild(bubble);
    return wrapper;
  }

  _scrollToBottom() {
    this.container.scrollTop = this.container.scrollHeight;
  }
}
