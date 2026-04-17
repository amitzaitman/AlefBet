/**
 * עוזרי בדיקה משותפים
 *
 * כולל מפעלי mock שהיו כפולים בעבר ב-voice-store.test.js וב-voice-recorder.test.js.
 * כמו כן עוזרי DOM ו-shell סטאבים לבדיקות round-manager ואינטגרציה.
 */
import { vi } from 'vitest';

// ── DOM ─────────────────────────────────────────────────────────────────────

/**
 * בונה אלמנט מיכל טרי במסמך. מנקה קודם את ה-body.
 * @returns {HTMLElement}
 */
export function mountContainer() {
  document.body.innerHTML = '';
  const el = document.createElement('div');
  document.body.appendChild(el);
  return el;
}

/**
 * ממתין ל-microtasks ו-timers שנתלו לפתור.
 * @param {number} ms
 */
export function tick(ms = 0) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── GameShell stub ──────────────────────────────────────────────────────────

/**
 * shell מינימלי לבדיקות round-manager: חושף state עם nextRound/addScore/score/currentRound.
 * @param {number} totalRounds
 */
export function makeShellStub(totalRounds = 3) {
  let current = 0;
  let score = 0;
  return {
    state: {
      get currentRound() { return current; },
      get score() { return score; },
      get totalRounds() { return totalRounds; },
      addScore(points) { score += points; },
      nextRound() {
        if (current >= totalRounds) return false;
        current++;
        return current <= totalRounds;
      },
    },
  };
}

// ── IndexedDB mock (משותף ל-voice-store tests) ──────────────────────────────

/**
 * מחזיר stub של IndexedDB בזיכרון.
 * תומך ב-open, transaction (readwrite/readonly), put, get, delete, getAllKeys.
 */
export function createIDBMock() {
  const _data = new Map();

  function makeReq(resolveFn) {
    const req = { result: undefined, error: null, onsuccess: null, onerror: null };
    Promise.resolve().then(() => {
      try {
        req.result = resolveFn();
        req.onsuccess?.({ target: req });
      } catch (err) {
        req.error = err;
        req.onerror?.({ target: req });
      }
    });
    return req;
  }

  function makeDB() {
    return {
      transaction() {
        const tx = { oncomplete: null, onerror: null };
        tx.objectStore = function () {
          return {
            put(value, key) {
              _data.set(key, value);
              Promise.resolve().then(() => tx.oncomplete?.());
              return {};
            },
            get(key) {
              return makeReq(() => _data.get(key));
            },
            delete(key) {
              _data.delete(key);
              Promise.resolve().then(() => tx.oncomplete?.());
              return {};
            },
            getAllKeys() {
              return makeReq(() => [..._data.keys()]);
            },
          };
        };
        return tx;
      },
    };
  }

  const db = makeDB();

  function open() {
    const req = {
      result: null,
      error: null,
      onupgradeneeded: null,
      onsuccess: null,
      onerror: null,
    };
    Promise.resolve().then(() => {
      req.result = db;
      req.onsuccess?.({ target: req });
    });
    return req;
  }

  return { open: vi.fn(open), _data };
}

// ── MediaRecorder mock (משותף ל-voice-recorder tests) ──────────────────────

/**
 * בונה class MockMediaRecorder עם הגדרות:
 *   supported[] — רשימת mime types שיודיעו עליהם כנתמכים.
 *   autoStop    — אם true, stop() ישגר onstop מיידית.
 */
export function makeMockMediaRecorder({ supported = ['audio/webm'], autoStop = true } = {}) {
  const instances = [];

  class MockMediaRecorder {
    constructor(stream, options) {
      this.stream    = stream;
      this.options   = options;
      this.state     = 'inactive';
      this.mimeType  = options?.mimeType ?? 'audio/webm';
      this.ondataavailable = null;
      this.onstop    = null;
      this.onerror   = null;
      instances.push(this);
    }

    start() {
      this.state = 'recording';
      Promise.resolve().then(() => {
        this.ondataavailable?.({ data: { size: 10 } });
      });
    }

    stop() {
      this.state = 'inactive';
      if (autoStop) {
        Promise.resolve().then(() => this.onstop?.());
      }
    }

    static isTypeSupported(type) {
      return supported.includes(type);
    }
  }

  MockMediaRecorder.instances = instances;
  return MockMediaRecorder;
}

/** Stream mock עם track יחיד שחושף stop. */
export function makeMockStream() {
  return {
    getTracks: vi.fn(() => [{ stop: vi.fn() }]),
  };
}
