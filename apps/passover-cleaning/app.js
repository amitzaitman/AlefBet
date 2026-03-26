import { createAppShell } from '../../framework/dist/alefbet.js';
import { appState } from './utils/state.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderTasks } from './pages/tasks.js';
import { renderFamily } from './pages/family.js';
import { renderGuide } from './pages/guide.js';
import { openShareQrModal, openScanQrModal } from './utils/qr-sync.js';

const TABS = [
  { id: 'dashboard', label: 'לוח בקרה', icon: '📊' },
  { id: 'tasks', label: 'משימות', icon: '✅' },
  { id: 'family', label: 'משפחה', icon: '👨‍👩‍👧‍👦' },
  { id: 'guide', label: 'מדריך', icon: '📖' },
];

const renderers = { dashboard: renderDashboard, tasks: renderTasks, family: renderFamily, guide: renderGuide };

const shell = createAppShell(document.getElementById('app'), {
  title: 'ניקיון פסח 🧹',
  tabs: TABS,
  homeUrl: '../../index.html',
  onTabChange(tabId) {
    shell.setActiveTab(tabId);
    if (typeof shell.contentEl._cleanup === 'function') {
      shell.contentEl._cleanup();
      shell.contentEl._cleanup = null;
    }
    shell.contentEl.innerHTML = '';
    (renderers[tabId] || renderDashboard)(shell.contentEl);
  },
});

// Update countdown in subtitle every minute
function updateCountdown() {
  const state = appState.get();
  const seder = new Date(state.pesachDate + 'T18:00:00');
  const diff = seder - Date.now();
  if (diff <= 0) { shell.setSubtitle('חג פסח שמח! 🕯️'); return; }
  const days = Math.floor(diff / 86400000);
  if (days === 0) shell.setSubtitle('מחר פסח!');
  else if (days === 1) shell.setSubtitle('מחר פסח!');
  else shell.setSubtitle(`${days} ימים לפסח 🕐`);
}
updateCountdown();
setInterval(updateCountdown, 60000);

// QR sync handlers
window.openShareQr = () => openShareQrModal(appState.get());
window.openScanQr = () => openScanQrModal((newState) => { appState.set(newState); });

// Handle ?sync= URL param (from share link)
function checkUrlImport() {
  const url = new URL(window.location.href);
  // Check regular query param
  let syncParam = url.searchParams.get('sync');
  // Check hash param (#/?sync=ENCODED)
  if (!syncParam) {
    try {
      const hash = window.location.hash;
      const qIdx = hash.indexOf('?');
      if (qIdx !== -1) {
        const hashParams = new URLSearchParams(hash.slice(qIdx));
        syncParam = hashParams.get('sync');
      }
    } catch {
      // ignore
    }
  }
  if (syncParam) {
    import('./utils/state-codec.js').then(({ decodeDelta }) => {
      try {
        const newState = decodeDelta(decodeURIComponent(syncParam));
        const taskCount = newState.tasks.length;
        const memberCount = newState.familyMembers.length;
        const confirmed = window.confirm(
          `התקבלו ${taskCount} משימות ו-${memberCount} בני משפחה מקוד QR.\nהאם להחליף את כל הנתונים הנוכחיים?`
        );
        if (confirmed) {
          appState.set(newState);
        }
      } catch (e) {
        console.warn('Invalid sync param', e);
      }
      // Clean URL regardless
      history.replaceState(null, '', window.location.pathname + '#/');
    });
  }
}
checkUrlImport();

// Initial render
renderers.dashboard(shell.contentEl);
