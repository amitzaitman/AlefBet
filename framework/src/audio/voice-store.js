/**
 * אחסון הקלטות קוליות ב-IndexedDB
 * משמש לשמירת הקלטות מורה לסיבובי משחק, הוראות וניקוד
 */

const DB_NAME    = 'alefbet-voices';
const STORE_NAME = 'recordings';
const DB_VERSION = 1;

let _dbPromise = null;

function _openDB() {
  if (_dbPromise) return _dbPromise;
  _dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = e => {
      e.target.result.createObjectStore(STORE_NAME);
    };
    req.onsuccess = e => resolve(e.target.result);
    req.onerror   = e => { _dbPromise = null; reject(e.target.error); };
  });
  return _dbPromise;
}

function _key(gameId, voiceKey) {
  return `${gameId}/${voiceKey}`;
}

/**
 * שמור הקלטה ב-IndexedDB
 * @param {string} gameId
 * @param {string} voiceKey  — e.g. round id, 'instruction', 'nikud-kamatz'
 * @param {Blob} blob
 */
export async function saveVoice(gameId, voiceKey, blob) {
  const db = await _openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(blob, _key(gameId, voiceKey));
    tx.oncomplete = resolve;
    tx.onerror    = e => reject(e.target.error);
  });
}

/**
 * טען הקלטה לפי מפתח
 * @returns {Promise<Blob|null>}
 */
export async function loadVoice(gameId, voiceKey) {
  const db = await _openDB();
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(_key(gameId, voiceKey));
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror   = e => reject(e.target.error);
  });
}

/**
 * מחק הקלטה
 */
export async function deleteVoice(gameId, voiceKey) {
  const db = await _openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(_key(gameId, voiceKey));
    tx.oncomplete = resolve;
    tx.onerror    = e => reject(e.target.error);
  });
}

/**
 * רשימת כל המפתחות השמורים למשחק מסוים
 * @returns {Promise<string[]>}
 */
export async function listVoiceKeys(gameId) {
  const db = await _openDB();
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).getAllKeys();
    req.onsuccess = () => {
      const prefix = `${gameId}/`;
      resolve(
        (req.result || [])
          .filter(k => k.startsWith(prefix))
          .map(k => k.slice(prefix.length))
      );
    };
    req.onerror = e => reject(e.target.error);
  });
}

/**
 * נגן הקלטה שמורה.
 * @returns {Promise<boolean>} true אם ניגן בהצלחה, false אם אין הקלטה
 */
export async function playVoice(gameId, voiceKey) {
  let blob;
  try {
    blob = await loadVoice(gameId, voiceKey);
  } catch {
    return false;
  }
  if (!blob) return false;

  return new Promise(resolve => {
    const url   = URL.createObjectURL(blob);
    const audio = new Audio(url);
    const done  = ok => { URL.revokeObjectURL(url); resolve(ok); };
    audio.onended = () => done(true);
    audio.onerror = () => done(false);
    audio.play().catch(() => done(false));
  });
}

/**
 * בדוק האם קיימת הקלטה למפתח
 * @returns {Promise<boolean>}
 */
export async function hasVoice(gameId, voiceKey) {
  const blob = await loadVoice(gameId, voiceKey).catch(() => null);
  return blob !== null;
}
