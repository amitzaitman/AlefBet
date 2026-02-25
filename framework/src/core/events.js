/**
 * אוטובוס אירועים פשוט
 * מאפשר תקשורת בין חלקי המשחק ללא תלויות הדדיות
 */
export class EventBus {
  constructor() {
    this._handlers = {};
  }

  /** הירשם לאירוע */
  on(event, handler) {
    if (!this._handlers[event]) this._handlers[event] = [];
    this._handlers[event].push(handler);
    return this;
  }

  /** בטל הרשמה לאירוע */
  off(event, handler) {
    if (!this._handlers[event]) return this;
    this._handlers[event] = this._handlers[event].filter(h => h !== handler);
    return this;
  }

  /** שלח אירוע */
  emit(event, data) {
    (this._handlers[event] || []).slice().forEach(h => h(data));
    return this;
  }
}
