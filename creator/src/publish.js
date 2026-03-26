/**
 * פרסום משחק — Share / Publish modal
 * Builds a standalone HTML file and lets the creator share it via QR code.
 */

import { buildStandaloneHTML, downloadStandaloneGame } from './game-preview.js';

/**
 * Open the publish dialog for the current game.
 * @param {string} gameName
 * @param {object} files  — { 'game.js': ..., 'game.css': ... }
 */
export async function showPublishDialog(gameName, files) {
  // Remove any previous instance
  document.getElementById('publish-modal')?.remove();

  const modal = document.createElement('div');
  modal.id = 'publish-modal';
  modal.className = 'pub-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'pub-title');
  modal.innerHTML = `
    <div class="pub-backdrop"></div>
    <div class="pub-box">
      <button class="pub-close" aria-label="סגור">✕</button>
      <h2 id="pub-title" class="pub-title">📤 פרסם משחק</h2>

      <div class="pub-section">
        <p class="pub-desc">הורד את המשחק כקובץ HTML יחיד — עובד על כל מחשב, ניתן לשליחה במייל או לשיתוף דרך כל שרת.</p>
        <button id="pub-download-btn" class="pub-btn pub-btn--primary" disabled>
          <span class="pub-btn__icon">⏳</span> מכין קובץ…
        </button>
      </div>

      <div class="pub-divider">או — שתף קישור ל-QR</div>

      <div class="pub-section">
        <p class="pub-desc">העלה את הקובץ לכל שרת (GitHub Pages, Google Drive, Netlify וכו׳), הדבק את הקישור כאן:</p>
        <div class="pub-url-row">
          <input id="pub-url-input" class="pub-url-input" type="url" placeholder="https://..." dir="ltr" />
          <button id="pub-qr-btn" class="pub-btn pub-btn--secondary">צור QR</button>
        </div>
        <div id="pub-qr-area" class="pub-qr-area" hidden>
          <img id="pub-qr-img" class="pub-qr-img" alt="QR code" />
          <div class="pub-qr-actions">
            <button id="pub-copy-link-btn" class="pub-btn pub-btn--ghost">העתק קישור</button>
            <a id="pub-qr-download" class="pub-btn pub-btn--ghost" download="qr-code.png">הורד QR</a>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // ── Refs ────────────────────────────────────────────────────────────────
  const downloadBtn  = modal.querySelector('#pub-download-btn');
  const urlInput     = modal.querySelector('#pub-url-input');
  const qrBtn        = modal.querySelector('#pub-qr-btn');
  const qrArea       = modal.querySelector('#pub-qr-area');
  const qrImg        = modal.querySelector('#pub-qr-img');
  const copyLinkBtn  = modal.querySelector('#pub-copy-link-btn');
  const qrDownload   = modal.querySelector('#pub-qr-download');

  // ── Build standalone HTML (async) ──────────────────────────────────────
  let standaloneHtml = null;
  try {
    standaloneHtml = await buildStandaloneHTML(gameName, files);
    downloadBtn.disabled = false;
    downloadBtn.innerHTML = '<span class="pub-btn__icon">⬇️</span> הורד משחק (HTML יחיד)';
  } catch (err) {
    downloadBtn.textContent = 'שגיאה בבניית הקובץ';
    console.error('Standalone build error:', err);
  }

  // ── Download standalone ─────────────────────────────────────────────────
  downloadBtn.addEventListener('click', () => {
    if (standaloneHtml) downloadStandaloneGame(gameName, standaloneHtml);
  });

  // ── QR Code ────────────────────────────────────────────────────────────
  function generateQR() {
    const url = urlInput.value.trim();
    if (!url) return;

    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&format=png&data=${encodeURIComponent(url)}`;
    qrImg.src = qrApiUrl;
    qrArea.removeAttribute('hidden');
    qrDownload.href = qrApiUrl;
  }

  qrBtn.addEventListener('click', generateQR);
  urlInput.addEventListener('keydown', e => { if (e.key === 'Enter') generateQR(); });

  // ── Copy link ──────────────────────────────────────────────────────────
  copyLinkBtn.addEventListener('click', async () => {
    const url = urlInput.value.trim();
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      copyLinkBtn.textContent = 'הועתק!';
      setTimeout(() => { copyLinkBtn.textContent = 'העתק קישור'; }, 2000);
    } catch {
      // Fallback
      const ta = Object.assign(document.createElement('textarea'), { value: url });
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
  });

  // ── Close ──────────────────────────────────────────────────────────────
  function close() { modal.remove(); }
  modal.querySelector('.pub-close').addEventListener('click', close);
  modal.querySelector('.pub-backdrop').addEventListener('click', close);
  document.addEventListener('keydown', function onKey(e) {
    if (e.key === 'Escape') { close(); document.removeEventListener('keydown', onKey); }
  });
}
