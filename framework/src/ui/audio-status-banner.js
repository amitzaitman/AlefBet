/**
 * באנר סטטוס קול ידידותי לילדים.
 *
 * מאזין לאירועי `alefbet:tts-state` ב-window ומציג הודעה קצרה כש-TTS
 * דורש אינטראקציה, אינו זמין, או נכשל. כל ההודעות בעברית עם ניקוד פשוט
 * וללא מטג. הבאנר RTL, לא חוסם את המשחק (פס עליון בלבד), עם תאימות
 * tap-target גדול לילדים.
 *
 * Public API:
 *   mountAudioStatusBanner(parent?, options?) -> { destroy(): void }
 */

const BANNER_ID = 'alefbet-audio-status-banner';

/** @typedef {{ state: string, previousState: string, reason?: string }} StateDetail */

/**
 * @param {string} state
 * @returns {{ message: string, kind: 'await'|'unsupported'|'failed' } | null}
 */
function _messageFor(state) {
  switch (state) {
    case 'awaiting-interaction':
      return { message: 'הַקֵּשׁ כְּדֵי לְהַפְעִיל קוֹל', kind: 'await' };
    case 'unsupported':
      return { message: 'הַקּוֹל אֵינוֹ זָמִין כָּרֶגַע', kind: 'unsupported' };
    case 'failed':
      return { message: 'בְּעָיָה בַּקּוֹל. נַמְשִׁיךְ לְלֹא קוֹל', kind: 'failed' };
    default:
      return null;
  }
}

/**
 * מציב באנר סטטוס קול בתוך parent. קריאה חוזרת מחליפה את הקיים.
 *
 * @param {HTMLElement} [parent] - יעד הצמדה (ברירת מחדל document.body).
 * @param {{ window?: Window }} [options] - אפשר להזריק window לבדיקות.
 * @returns {{ destroy: () => void }}
 */
export function mountAudioStatusBanner(parent = (typeof document !== 'undefined' ? document.body : null), options = {}) {
  const win = options.window || (typeof window !== 'undefined' ? window : null);
  if (!parent || !win) {
    return { destroy() { /* noop */ } };
  }

  // הסר באנר קודם אם קיים (idempotent).
  const prior = parent.querySelector('#' + BANNER_ID);
  if (prior && prior.parentNode) prior.parentNode.removeChild(prior);

  const banner = parent.ownerDocument.createElement('div');
  banner.id = BANNER_ID;
  banner.className = 'alefbet-audio-banner';
  banner.setAttribute('role', 'status');
  banner.setAttribute('aria-live', 'polite');
  banner.dir = 'rtl';
  banner.hidden = true;

  const messageEl = parent.ownerDocument.createElement('span');
  messageEl.className = 'alefbet-audio-banner__msg';
  banner.appendChild(messageEl);

  const dismissBtn = parent.ownerDocument.createElement('button');
  dismissBtn.type = 'button';
  dismissBtn.className = 'alefbet-audio-banner__dismiss';
  dismissBtn.setAttribute('aria-label', 'סְגוֹר הוֹדָעָה');
  dismissBtn.textContent = '×';
  dismissBtn.hidden = true;
  banner.appendChild(dismissBtn);

  parent.appendChild(banner);

  /** @type {ReturnType<typeof setTimeout> | null} */
  let autoDismissTimer = null;
  /** @type {'await'|'unsupported'|'failed'|null} */
  let currentKind = null;

  function clearAutoDismiss() {
    if (autoDismissTimer) {
      clearTimeout(autoDismissTimer);
      autoDismissTimer = null;
    }
  }

  function hide() {
    clearAutoDismiss();
    currentKind = null;
    banner.hidden = true;
    banner.classList.remove('is-visible', 'is-await', 'is-unsupported', 'is-failed');
    banner.onclick = null;
    dismissBtn.hidden = true;
  }

  /** @param {string} state */
  function show(state) {
    const info = _messageFor(state);
    if (!info) {
      hide();
      return;
    }
    clearAutoDismiss();
    messageEl.textContent = info.message;
    banner.hidden = false;
    banner.classList.add('is-visible');
    banner.classList.toggle('is-await', info.kind === 'await');
    banner.classList.toggle('is-unsupported', info.kind === 'unsupported');
    banner.classList.toggle('is-failed', info.kind === 'failed');
    currentKind = info.kind;

    if (info.kind === 'await') {
      banner.onclick = () => {
        // לחיצה על הבאנר עצמה היא כבר אינטראקציה -
        // נשלח גם click על body כדי להבטיח שספריות אחרות יתפסו אותה.
        try {
          parent.ownerDocument.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
        } catch { /* noop */ }
        hide();
      };
      dismissBtn.hidden = true;
    } else if (info.kind === 'unsupported') {
      banner.onclick = null;
      dismissBtn.hidden = false;
      dismissBtn.onclick = (e) => {
        e.stopPropagation();
        hide();
      };
    } else if (info.kind === 'failed') {
      banner.onclick = null;
      dismissBtn.hidden = true;
      autoDismissTimer = setTimeout(() => hide(), 6000);
    }
  }

  /** @param {Event} ev */
  function onState(ev) {
    /** @type {StateDetail} */
    const detail = /** @type {CustomEvent} */(ev).detail || {};
    const state = detail.state;
    if (state === 'ready' || state === 'idle') {
      hide();
      return;
    }
    show(state);
  }

  win.addEventListener('alefbet:tts-state', onState);

  return {
    destroy() {
      win.removeEventListener('alefbet:tts-state', onState);
      clearAutoDismiss();
      if (banner.parentNode) banner.parentNode.removeChild(banner);
      currentKind = null;
    },
  };
}
