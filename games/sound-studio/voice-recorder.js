/**
 * עטיפה ל-MediaRecorder API
 * מאפשרת הקלטת קול ממיקרופון ומחזירה Blob
 */

/** מחזיר את ה-MIME type הנתמך על ידי הדפדפן */
function _preferredMimeType() {
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/ogg'];
  return candidates.find(t => MediaRecorder.isTypeSupported(t)) || '';
}

/**
 * בדוק האם המכשיר תומך בהקלטת קול
 * @returns {boolean}
 */
export function isVoiceRecordingSupported() {
  return (
    typeof navigator !== 'undefined' &&
    typeof navigator.mediaDevices?.getUserMedia === 'function' &&
    typeof MediaRecorder !== 'undefined'
  );
}

/**
 * צור מקליט קול חדש.
 * @returns {{
 *   start():   Promise<void>,
 *   stop():    Promise<Blob>,
 *   cancel():  void,
 *   isActive(): boolean,
 * }}
 */
export function createVoiceRecorder() {
  let _recorder = null;
  let _stream   = null;
  let _chunks   = [];
  let generation = 0;
  let pendingStart = null;

  /**
   * בקש גישה למיקרופון והתחל הקלטה.
   * זורק שגיאה אם המשתמש סירב לגישה.
   */
  function start() {
    if (_recorder?.state === 'recording') return Promise.resolve();
    if (pendingStart) return pendingStart;
    const request = ++generation;
    const pending = (async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      if (request !== generation) {
        stream.getTracks().forEach(track => track.stop());
        throw new DOMException('Recording cancelled', 'AbortError');
      }
      _stream = stream;
      _chunks = [];
      try {
        const mime = _preferredMimeType();
        _recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : {});
        _recorder.ondataavailable = e => { if (e.data?.size > 0) _chunks.push(e.data); };
        _recorder.start(100);
      } catch (error) {
        _cleanup();
        throw error;
      }
    })();
    pendingStart = pending;
    return pending.finally(() => { if (pendingStart === pending) pendingStart = null; });
  }

  /**
   * עצור הקלטה והחזר Blob.
   * @returns {Promise<Blob>}
   */
  function stop() {
    return new Promise((resolve, reject) => {
      if (!_recorder || _recorder.state === 'inactive') {
        reject(new Error('[voice-recorder] not recording'));
        return;
      }
      _recorder.onstop = () => {
        const blob = new Blob(_chunks, { type: _recorder.mimeType || 'audio/webm' });
        _cleanup();
        resolve(blob);
      };
      _recorder.onerror = e => { _cleanup(); reject(e.error); };
      _recorder.stop();
    });
  }

  /** בטל הקלטה ללא שמירה */
  function cancel() {
    generation++;
    pendingStart = null;
    if (_recorder && _recorder.state !== 'inactive') {
      _recorder.ondataavailable = null;
      _recorder.onstop = null;
      _recorder.stop();
    }
    _cleanup();
  }

  function _cleanup() {
    _stream?.getTracks().forEach(t => t.stop());
    _stream   = null;
    _recorder = null;
    _chunks   = [];
  }

  /** האם ההקלטה פעילה? */
  function isActive() {
    return _recorder?.state === 'recording';
  }

  return { start, stop, cancel, isActive };
}
