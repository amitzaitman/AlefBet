import { encodeDelta, decodeDelta, encodedByteSize, MAX_QR_BYTES } from './state-codec.js';

// ===== Shared modal helpers =====

function createModalOverlay() {
  const overlay = document.createElement('div');
  overlay.style.cssText = [
    'position:fixed', 'inset:0', 'z-index:9999',
    'display:flex', 'align-items:center', 'justify-content:center', 'padding:1rem',
    'background:rgba(0,0,0,0.5)', 'backdrop-filter:blur(4px)',
  ].join(';');
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  return overlay;
}

function createModalCard() {
  const card = document.createElement('div');
  card.style.cssText = [
    'position:relative', 'background:#fff', 'border-radius:1rem', 'box-shadow:0 20px 60px rgba(0,0,0,0.2)',
    'width:100%', 'max-width:22rem', 'max-height:90vh', 'overflow-y:auto',
    'padding:1.5rem', 'text-align:center', 'direction:rtl',
  ].join(';');
  return card;
}

const BTN_BASE = [
  'border:none', 'cursor:pointer', 'font-family:inherit',
  'border-radius:0.75rem', 'font-size:0.875rem', 'font-weight:500',
  'padding:0.625rem 1rem', 'transition:opacity 0.15s',
].join(';');

const BTN_PRIMARY = BTN_BASE + ';background:#7c3f1e;color:#fff;flex:1;';
const BTN_SECONDARY = BTN_BASE + ';background:#f3ece8;color:#4a2008;flex:1;';
const BTN_FULL = BTN_BASE + ';background:#f3ece8;color:#4a2008;width:100%;';

function closeXButton(onClose) {
  const btn = document.createElement('button');
  btn.setAttribute('aria-label', 'סגור');
  btn.style.cssText = [
    'position:absolute', 'top:0.75rem', 'left:0.75rem',
    'width:2.25rem', 'height:2.25rem', 'border-radius:50%',
    'border:none', 'background:transparent', 'cursor:pointer',
    'display:flex', 'align-items:center', 'justify-content:center',
    'color:#9a5a2a', 'font-size:1.25rem', 'line-height:1',
  ].join(';');
  btn.innerHTML = '&#x2715;';
  btn.addEventListener('click', onClose);
  return btn;
}

function makeTitle(text) {
  const h = document.createElement('h2');
  h.style.cssText = 'font-size:1.125rem;font-weight:700;color:#4a2008;margin:0 0 0.25rem;';
  h.textContent = text;
  return h;
}

function makeSubtitle(text) {
  const p = document.createElement('p');
  p.style.cssText = 'font-size:0.875rem;color:#6b7280;margin:0 0 1.25rem;line-height:1.5;';
  p.textContent = text;
  return p;
}

// ===== Share QR Modal =====

export function openShareQrModal(state) {
  let encoded;
  try {
    encoded = encodeDelta(state);
  } catch (e) {
    console.error('Failed to encode state', e);
    alert('שגיאה בקידוד הנתונים');
    return;
  }

  const byteSize = encodedByteSize(encoded);
  const isOverLimit = byteSize > MAX_QR_BYTES;

  // Build sync URL using hash param (same format as React app: #/?sync=ENCODED)
  const syncUrl =
    window.location.origin +
    window.location.pathname +
    '#/?sync=' +
    encodeURIComponent(encoded);

  const overlay = createModalOverlay();
  overlay.setAttribute('aria-label', 'שיתוף מצב הניקיון');

  const card = createModalCard();

  function closeModal() {
    overlay.remove();
  }

  // Close on backdrop click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // Close X button
  card.appendChild(closeXButton(closeModal));

  // Title + subtitle
  card.appendChild(makeTitle('שיתוף מצב הניקיון'));
  card.appendChild(makeSubtitle('סרקו את הקוד במכשיר אחר כדי לסנכרן'));

  if (isOverLimit) {
    // Over-limit warning
    const warn = document.createElement('div');
    warn.style.cssText =
      'background:#fdf5f0;border:1px solid #e8c4a0;border-radius:0.75rem;padding:1.25rem;margin-bottom:1rem;';
    warn.innerHTML =
      '<span style="font-size:1.5rem;display:block;margin-bottom:0.5rem">⚠️</span>' +
      '<p style="font-size:0.875rem;font-weight:500;color:#4a2008;margin:0 0 0.25rem;">יש יותר מדי נתונים ליצירת קוד QR</p>' +
      `<p style="font-size:0.75rem;color:#9a5a2a;margin:0">(${byteSize.toLocaleString()} / ${MAX_QR_BYTES.toLocaleString()} בייטים)</p>`;
    card.appendChild(warn);
  } else {
    // QR canvas wrapper
    const qrWrapper = document.createElement('div');
    qrWrapper.style.cssText =
      'display:inline-block;background:#fff;padding:1rem;border-radius:0.75rem;border:1px solid #e8d8d0;box-shadow:0 2px 8px rgba(0,0,0,0.06);margin-bottom:1rem;';

    const canvas = document.createElement('canvas');
    qrWrapper.appendChild(canvas);
    card.appendChild(qrWrapper);

    // Render QR code
    window.QRCode.toCanvas(canvas, syncUrl, { width: 220, errorCorrectionLevel: 'L' }, (err) => {
      if (err) {
        qrWrapper.innerHTML =
          '<p style="color:#c0392b;font-size:0.875rem;">שגיאה ביצירת קוד QR</p>';
        console.error('QRCode.toCanvas error', err);
      }
    });

    // Byte size info
    const sizeInfo = document.createElement('p');
    sizeInfo.style.cssText = 'font-size:0.75rem;color:#9ca3af;margin:0 0 1rem;';
    sizeInfo.textContent = `${byteSize.toLocaleString()} / ${MAX_QR_BYTES.toLocaleString()} בייטים`;
    card.appendChild(sizeInfo);
  }

  // Copyable URL
  const urlBox = document.createElement('div');
  urlBox.style.cssText = [
    'background:#fdf5f0', 'border:1px solid #e8c4a0', 'border-radius:0.5rem',
    'padding:0.5rem 0.75rem', 'margin-bottom:1rem',
    'font-size:0.7rem', 'color:#9a5a2a', 'word-break:break-all',
    'cursor:pointer', 'text-align:start', 'direction:ltr',
  ].join(';');
  urlBox.title = 'לחץ להעתקה';
  urlBox.textContent = syncUrl;
  urlBox.addEventListener('click', () => {
    navigator.clipboard.writeText(syncUrl).then(() => {
      const orig = urlBox.textContent;
      urlBox.textContent = 'הועתק ✓';
      setTimeout(() => { urlBox.textContent = orig; }, 1500);
    }).catch(() => {
      // Fallback: select text
      const range = document.createRange();
      range.selectNodeContents(urlBox);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    });
  });
  card.appendChild(urlBox);

  // Close button at bottom
  const closeBtn = document.createElement('button');
  closeBtn.style.cssText = BTN_FULL;
  closeBtn.textContent = 'סגור';
  closeBtn.addEventListener('click', closeModal);
  card.appendChild(closeBtn);

  overlay.appendChild(card);
  document.body.appendChild(overlay);
}

// ===== Scan QR Modal =====

export function openScanQrModal(onImport) {
  const viewfinderId = 'qr-sync-scan-viewfinder-' + Date.now();
  let scanner = null;
  let scanHandled = false;
  let stopped = false;

  const overlay = createModalOverlay();
  overlay.setAttribute('aria-label', 'סריקת קוד QR');

  const card = createModalCard();

  async function stopScanner() {
    if (stopped) return;
    stopped = true;
    try {
      if (scanner) {
        const state = scanner.getState();
        // State 2 = SCANNING, 3 = PAUSED
        if (state === 2 || state === 3) {
          await scanner.stop();
        }
        scanner.clear();
      }
    } catch {
      // ignore cleanup errors
    }
    scanner = null;
  }

  function closeModal() {
    stopScanner().then(() => overlay.remove());
  }

  // Close on backdrop click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // Close X button
  card.appendChild(closeXButton(closeModal));

  // Title + subtitle
  card.appendChild(makeTitle('סריקת קוד QR'));
  card.appendChild(makeSubtitle('כוונו את המצלמה לקוד QR כדי לייבא נתונים'));

  // Viewfinder container
  const viewfinderWrap = document.createElement('div');
  viewfinderWrap.style.cssText =
    'overflow:hidden;border-radius:0.75rem;border:1px solid #e8d8d0;margin-bottom:1rem;';

  const viewfinderDiv = document.createElement('div');
  viewfinderDiv.id = viewfinderId;
  viewfinderDiv.style.width = '100%';
  viewfinderWrap.appendChild(viewfinderDiv);
  card.appendChild(viewfinderWrap);

  // Dynamic content area (confirmation / error / permission-denied)
  const dynamicArea = document.createElement('div');
  card.appendChild(dynamicArea);

  // Close button (shown during scanning phase)
  const closeBtnBottom = document.createElement('button');
  closeBtnBottom.style.cssText = BTN_FULL;
  closeBtnBottom.textContent = 'סגור';
  closeBtnBottom.addEventListener('click', closeModal);
  card.appendChild(closeBtnBottom);

  overlay.appendChild(card);
  document.body.appendChild(overlay);

  // ---- helpers to show phases ----

  function showConfirm(decodedState) {
    viewfinderWrap.style.display = 'none';
    closeBtnBottom.style.display = 'none';
    dynamicArea.innerHTML =
      '<div style="background:#fdf5f0;border:1px solid #e8c4a0;border-radius:0.75rem;padding:1.25rem;margin-bottom:1rem;">' +
      '<span style="font-size:1.5rem;display:block;margin-bottom:0.5rem">📱</span>' +
      '<p style="font-size:0.875rem;font-weight:500;color:#4a2008;margin:0 0 0.5rem;">נמצאו נתונים!</p>' +
      `<p style="font-size:0.75rem;color:#9a5a2a;margin:0">${decodedState.tasks.length} משימות, ${decodedState.familyMembers.length} בני משפחה</p>` +
      '</div>' +
      '<p style="font-size:0.875rem;font-weight:600;color:#4a2008;margin:0 0 1rem;">האם להחליף את כל הנתונים הנוכחיים?</p>';

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;gap:0.75rem;';

    const confirmBtn = document.createElement('button');
    confirmBtn.style.cssText = BTN_PRIMARY;
    confirmBtn.textContent = 'כן, ייבא';
    confirmBtn.addEventListener('click', () => {
      onImport(decodedState);
      overlay.remove();
    });

    const cancelBtn = document.createElement('button');
    cancelBtn.style.cssText = BTN_SECONDARY;
    cancelBtn.textContent = 'ביטול';
    cancelBtn.addEventListener('click', closeModal);

    btnRow.appendChild(confirmBtn);
    btnRow.appendChild(cancelBtn);
    dynamicArea.appendChild(btnRow);
  }

  function showError(msg) {
    viewfinderWrap.style.display = 'none';
    closeBtnBottom.style.display = 'none';
    dynamicArea.innerHTML =
      '<div style="background:#fdf5f0;border:1px solid #e8c4a0;border-radius:0.75rem;padding:1.25rem;margin-bottom:1rem;">' +
      '<span style="font-size:1.5rem;display:block;margin-bottom:0.5rem">⚠️</span>' +
      `<p style="font-size:0.875rem;font-weight:500;color:#4a2008;margin:0">${msg}</p>` +
      '</div>';

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;gap:0.75rem;';

    const retryBtn = document.createElement('button');
    retryBtn.style.cssText = BTN_PRIMARY;
    retryBtn.textContent = 'נסו שוב';
    retryBtn.addEventListener('click', () => {
      dynamicArea.innerHTML = '';
      viewfinderWrap.style.display = '';
      closeBtnBottom.style.display = '';
      // Reset state for retry
      scanHandled = false;
      stopped = false;
      viewfinderDiv.innerHTML = '';
      startScanner();
    });

    const closeBtnErr = document.createElement('button');
    closeBtnErr.style.cssText = BTN_SECONDARY;
    closeBtnErr.textContent = 'סגור';
    closeBtnErr.addEventListener('click', closeModal);

    btnRow.appendChild(retryBtn);
    btnRow.appendChild(closeBtnErr);
    dynamicArea.appendChild(btnRow);
  }

  function showPermissionDenied() {
    viewfinderWrap.style.display = 'none';
    closeBtnBottom.style.display = 'none';
    dynamicArea.innerHTML =
      '<div style="background:#fdf5f0;border:1px solid #e8c4a0;border-radius:0.75rem;padding:1.25rem;margin-bottom:1rem;">' +
      '<span style="font-size:1.5rem;display:block;margin-bottom:0.5rem">📷</span>' +
      '<p style="font-size:0.875rem;font-weight:500;color:#4a2008;margin:0 0 0.25rem;">יש לאפשר גישה למצלמה כדי לסרוק</p>' +
      '<p style="font-size:0.75rem;color:#9a5a2a;margin:0">בדקו את הגדרות הדפדפן ונסו שוב</p>' +
      '</div>';

    const closeBtn2 = document.createElement('button');
    closeBtn2.style.cssText = BTN_FULL;
    closeBtn2.textContent = 'סגור';
    closeBtn2.addEventListener('click', closeModal);
    dynamicArea.appendChild(closeBtn2);
  }

  // ---- payload extraction (same logic as React ScanQrModal) ----

  function extractPayload(text) {
    try {
      const url = new URL(text);
      // Check regular query params first
      const syncFromQuery = url.searchParams.get('sync');
      if (syncFromQuery) return decodeURIComponent(syncFromQuery);
      // Check hash params (#/?sync=ENCODED)
      const hash = url.hash;
      const qIdx = hash.indexOf('?');
      if (qIdx !== -1) {
        const hashParams = new URLSearchParams(hash.slice(qIdx));
        const syncFromHash = hashParams.get('sync');
        if (syncFromHash) return decodeURIComponent(syncFromHash);
      }
    } catch {
      // not a URL — maybe raw encoded payload
    }
    // If it looks like base64url, try directly
    if (/^[A-Za-z0-9_-]{4,}$/.test(text.trim())) {
      return text.trim();
    }
    return null;
  }

  function handleScanSuccess(decodedText) {
    if (scanHandled) return;
    scanHandled = true;

    const payload = extractPayload(decodedText);
    if (!payload) {
      stopScanner().then(() => showError('קוד QR לא תקין'));
      return;
    }
    try {
      const decodedState = decodeDelta(payload);
      stopScanner().then(() => showConfirm(decodedState));
    } catch {
      stopScanner().then(() => showError('קוד QR לא תקין'));
    }
  }

  // ---- start scanner ----

  function startScanner() {
    scanner = new window.Html5Qrcode(viewfinderId);

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (text) => handleScanSuccess(text),
        () => {
          // ignore per-frame failures (no QR found)
        },
      )
      .catch((err) => {
        const msg = err instanceof Error ? err.message : String(err);
        if (
          msg.includes('NotAllowedError') ||
          msg.includes('Permission') ||
          msg.includes('permission')
        ) {
          showPermissionDenied();
        } else {
          showError(msg);
        }
      });
  }

  startScanner();
}
