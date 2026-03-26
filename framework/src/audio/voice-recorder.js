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

  /**
   * בקש גישה למיקרופון והתחל הקלטה.
   * זורק שגיאה אם המשתמש סירב לגישה.
   */
  async function start() {
    if (_recorder && _recorder.state === 'recording') return;

    _stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    _chunks = [];

    const opts = {};
    const mime = _preferredMimeType();
    if (mime) opts.mimeType = mime;

    _recorder = new MediaRecorder(_stream, opts);
    _recorder.ondataavailable = e => { if (e.data?.size > 0) _chunks.push(e.data); };
    _recorder.start(100); // collect chunks every 100ms
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
