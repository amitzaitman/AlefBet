/**
 * עוזרי בדיקה משותפים: מיכל DOM, shell לבדיקות סיבובים, ו-mocks ל-IndexedDB
 * (voice-store) ול-MediaRecorder (voice-recorder).
 */
import { vi } from 'vitest';
import { GameShell } from '../core/game-shell.js';

/**
 * בונה אלמנט מיכל טרי במסמך. מנקה קודם את ה-body.
 * @returns {HTMLElement}
 */
export function mountContainer() {
  document.body.innerHTML = '';
  return document.body.appendChild(document.createElement('div'));
}

/**
 * GameShell אמיתי בלי DOM במסמך, לבדיקות round-manager ו-choice-round.
 * @param {number} totalRounds
 */
export function makeShellStub(totalRounds = 3) {
  return new GameShell(document.createElement('div'), { totalRounds });
}

/**
 * IndexedDB בזיכרון: open, transaction, put, get, delete, getAllKeys.
 * בקשות וטרנזקציות נסגרות ב-microtask, כמו ב-API האמיתי.
 */
export function createIDBMock() {
  const data = new Map();
  const later = fn => Promise.resolve().then(fn);
  const request = read => {
    const req = { result: undefined, onsuccess: null };
    later(() => { req.result = read(); req.onsuccess?.({ target: req }); });
    return req;
  };
  const db = {
    transaction() {
      const tx = { oncomplete: null };
      const write = change => { change(); later(() => tx.oncomplete?.()); return {}; };
      tx.objectStore = () => ({
        put: (value, key) => write(() => data.set(key, value)),
        get: key => request(() => data.get(key)),
        delete: key => write(() => data.delete(key)),
        getAllKeys: () => request(() => [...data.keys()]),
      });
      return tx;
    },
  };
  return { open: vi.fn(() => request(() => db)) };
}

/**
 * MediaRecorder מדומה. `supported`: ה-MIME types שידווחו כנתמכים;
 * עם autoStop, stop() יורה onstop מיד. כל המופעים נאספים ב-`instances`.
 */
export function makeMockMediaRecorder({ supported = ['audio/webm'], autoStop = true } = {}) {
  return class MockMediaRecorder {
    static instances = [];
    static isTypeSupported(type) { return supported.includes(type); }
    constructor(stream, options) {
      Object.assign(this, { stream, options, state: 'inactive', mimeType: options?.mimeType ?? 'audio/webm' });
      MockMediaRecorder.instances.push(this);
    }
    start() {
      this.state = 'recording';
      Promise.resolve().then(() => this.ondataavailable?.({ data: { size: 10 } }));
    }
    stop() {
      this.state = 'inactive';
      if (autoStop) Promise.resolve().then(() => this.onstop?.());
    }
  };
}
