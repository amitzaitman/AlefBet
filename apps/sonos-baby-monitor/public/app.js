// ─── State ────────────────────────────────────────────────────────────────────

const state = {
  speakers: [],
  babySpeaker: null,
  parentSpeaker: null,
  monitoring: false,
  threshold: 40,
  cooldownSec: 30,
  alertVolume: 30,
  alertSound: '',
  currentLevel: 0,
};

let ws = null;
let reconnectTimer = null;

// ─── DOM ─────────────────────────────────────────────────────────────────────

const $ = (s) => document.querySelector(s);
const dom = {
  btnStart: $('#btn-start'),
  btnStop: $('#btn-stop'),
  btnDiscover: $('#btn-discover'),
  discoverStatus: $('#discover-status'),
  speakersContainer: $('#speakers-container'),
  babySpeakers: $('#baby-speakers'),
  parentSpeakers: $('#parent-speakers'),
  sensitivity: $('#sensitivity'),
  sensitivityVal: $('#sensitivity-value'),
  cooldown: $('#cooldown'),
  cooldownVal: $('#cooldown-value'),
  alertVolume: $('#alert-volume'),
  alertVolumeVal: $('#alert-volume-value'),
  alertSound: $('#alert-sound'),
  statusBanner: $('#status-banner'),
  statusIcon: $('#status-icon'),
  statusText: $('#status-text'),
  levelBar: $('#level-bar'),
  thresholdMarker: $('#threshold-marker'),
  currentLevel: $('#current-level'),
  eventLog: $('#event-log'),
  visualizer: $('#visualizer'),
};

// ─── Visualizer ──────────────────────────────────────────────────────────────

class Visualizer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.history = new Array(64).fill(0);
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    this.width = rect.width;
    this.height = rect.height;
  }

  push(level) {
    this.history.push(level);
    if (this.history.length > 64) this.history.shift();
  }

  draw(threshold) {
    const { ctx, width, height, history } = this;
    ctx.clearRect(0, 0, width, height);

    const barCount = history.length;
    const barW = width / barCount - 1;

    // Threshold line
    const threshY = height - (threshold / 100) * height;
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, threshY);
    ctx.lineTo(width, threshY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Bars
    for (let i = 0; i < barCount; i++) {
      const val = history[i] / 100;
      const barH = Math.max(1, val * height * 0.95);
      const isAbove = history[i] >= threshold;

      const alpha = 0.4 + val * 0.6;
      if (isAbove) {
        ctx.fillStyle = `rgba(255, 71, 87, ${alpha})`;
      } else if (history[i] > threshold * 0.7) {
        ctx.fillStyle = `rgba(255, 165, 2, ${alpha})`;
      } else {
        ctx.fillStyle = `rgba(46, 213, 115, ${alpha})`;
      }

      const x = i * (barW + 1);
      ctx.fillRect(x, height - barH, barW, barH);
    }
  }

  drawIdle() {
    const { ctx, width, height } = this;
    ctx.clearRect(0, 0, width, height);
    const t = Date.now() / 2000;
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    for (let i = 0; i < 64; i++) {
      const h = (Math.sin(t + i * 0.15) * 0.5 + 0.5) * 12 + 2;
      ctx.fillRect(i * (width / 64), height - h, width / 64 - 1, h);
    }
  }
}

const viz = new Visualizer(dom.visualizer);

// ─── WebSocket ───────────────────────────────────────────────────────────────

function connectWS() {
  const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
  ws = new WebSocket(`${protocol}//${location.host}`);

  ws.onopen = () => {
    addLog('Connected to server', 'success');
    clearTimeout(reconnectTimer);
  };

  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    handleWSMessage(msg);
  };

  ws.onclose = () => {
    addLog('Disconnected from server, reconnecting...', 'warn');
    reconnectTimer = setTimeout(connectWS, 3000);
  };

  ws.onerror = () => {
    ws.close();
  };
}

function handleWSMessage(msg) {
  switch (msg.type) {
    case 'state':
      // Initial state sync
      if (msg.monitoring) {
        state.monitoring = true;
        dom.btnStart.disabled = true;
        dom.btnStop.disabled = false;
      }
      break;

    case 'level':
      state.currentLevel = msg.level;
      updateLevelDisplay(msg.level);
      viz.push(msg.level);
      break;

    case 'status':
      setStatus(msg.status, msg.message);
      if (msg.status === 'listening') {
        state.monitoring = true;
        dom.btnStart.disabled = true;
        dom.btnStop.disabled = false;
      } else if (msg.status === 'idle') {
        state.monitoring = false;
        dom.btnStart.disabled = false;
        dom.btnStop.disabled = true;
      }
      break;

    case 'alert':
      setStatus('alert', msg.message);
      addLog(msg.message, 'alert');
      sendBrowserNotification(msg.message);
      // Reset status after 5 seconds
      setTimeout(() => {
        if (state.monitoring) setStatus('listening', `Monitoring ${state.babySpeaker?.roomName || '...'}`);
      }, 5000);
      break;

    case 'log':
      addLog(msg.message, msg.level);
      break;

    case 'error':
      addLog(msg.message, 'warn');
      break;
  }
}

// ─── UI Helpers ──────────────────────────────────────────────────────────────

function setStatus(mode, text) {
  dom.statusBanner.className = `status-banner status-${mode}`;
  dom.statusText.textContent = text;
  dom.statusIcon.innerHTML = mode === 'alert' ? '&#x26A0;' : '&#x25CF;';
}

function addLog(message, type = 'info') {
  const entry = document.createElement('div');
  entry.className = `log-entry log-${type}`;
  const time = new Date().toLocaleTimeString();
  entry.textContent = `[${time}] ${message}`;
  dom.eventLog.appendChild(entry);
  dom.eventLog.scrollTop = dom.eventLog.scrollHeight;
  while (dom.eventLog.children.length > 100) {
    dom.eventLog.removeChild(dom.eventLog.firstChild);
  }
}

function updateLevelDisplay(level) {
  dom.levelBar.style.width = `${level}%`;
  dom.currentLevel.textContent = `${Math.round(level)}%`;
  dom.levelBar.classList.toggle('warn', level > state.threshold * 0.7 && level < state.threshold);
  dom.levelBar.classList.toggle('alert', level >= state.threshold);
}

function sendBrowserNotification(message) {
  if (Notification.permission === 'granted') {
    new Notification('Baby Monitor Alert', {
      body: message,
      requireInteraction: true,
    });
  }
}

function renderSpeakers(list, container, role) {
  container.innerHTML = '';
  list.forEach((sp) => {
    const isSelected = role === 'baby'
      ? state.babySpeaker?.ip === sp.ip
      : state.parentSpeaker?.ip === sp.ip;

    const el = document.createElement('div');
    el.className = 'speaker-item' + (isSelected ? (role === 'baby' ? ' selected' : ' selected-parent') : '');
    el.innerHTML = `
      <div class="speaker-icon">${sp.hasMic ? '&#x1f3a4;' : '&#x1f50a;'}</div>
      <div class="speaker-info">
        <div class="speaker-name">${sp.roomName}</div>
        <div class="speaker-meta">${sp.modelName} ${sp.modelNumber} &middot; ${sp.ip}</div>
      </div>
      ${sp.hasMic && role === 'baby' ? '<span class="speaker-badge badge-mic">MIC</span>' : ''}
      <div class="speaker-check">&#x2713;</div>
    `;
    el.addEventListener('click', () => {
      if (role === 'baby') {
        state.babySpeaker = sp;
        fetch('/api/baby-speaker', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sp),
        });
        addLog(`Baby room: ${sp.roomName}`, 'success');
      } else {
        state.parentSpeaker = sp;
        fetch('/api/parent-speaker', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sp),
        });
        addLog(`Parent room: ${sp.roomName}`, 'success');
      }
      renderSpeakers(list, container, role);
    });
    container.appendChild(el);
  });
}

// ─── API Calls ───────────────────────────────────────────────────────────────

async function discoverSpeakers() {
  dom.discoverStatus.textContent = 'Searching for Sonos speakers...';
  dom.btnDiscover.disabled = true;
  addLog('Discovering Sonos speakers on network...', 'info');

  try {
    const res = await fetch('/api/discover');
    const data = await res.json();
    state.speakers = data.speakers || [];

    if (state.speakers.length === 0) {
      dom.discoverStatus.textContent = 'No speakers found. Ensure Sonos is on the same network.';
      addLog('No Sonos speakers found.', 'warn');
    } else {
      const micCount = state.speakers.filter(s => s.hasMic).length;
      dom.discoverStatus.textContent = `Found ${state.speakers.length} speaker(s), ${micCount} with mic`;
      addLog(`Found ${state.speakers.length} speaker(s), ${micCount} with mic`, 'success');
      dom.speakersContainer.style.display = 'block';

      // Show mic-equipped speakers first in baby list
      const sorted = [...state.speakers].sort((a, b) => (b.hasMic ? 1 : 0) - (a.hasMic ? 1 : 0));
      renderSpeakers(sorted, dom.babySpeakers, 'baby');
      renderSpeakers(state.speakers, dom.parentSpeakers, 'parent');
    }
  } catch (err) {
    dom.discoverStatus.textContent = 'Discovery failed: ' + err.message;
    addLog('Discovery error: ' + err.message, 'warn');
  }

  dom.btnDiscover.disabled = false;
}

async function syncSettings() {
  await fetch('/api/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      threshold: state.threshold,
      cooldownMs: state.cooldownSec * 1000,
      alertVolume: state.alertVolume,
      alertSoundUrl: state.alertSound,
    }),
  });
}

async function startMonitoring() {
  if (!state.babySpeaker) {
    addLog('Please select a baby room speaker first', 'warn');
    return;
  }

  await syncSettings();

  dom.btnStart.disabled = true;
  addLog('Starting monitoring...', 'info');

  try {
    const res = await fetch('/api/start', { method: 'POST' });
    const data = await res.json();
    if (data.error) {
      addLog('Start failed: ' + data.error, 'warn');
      dom.btnStart.disabled = false;
    }
  } catch (err) {
    addLog('Start failed: ' + err.message, 'warn');
    dom.btnStart.disabled = false;
  }
}

async function stopMonitoring() {
  try {
    await fetch('/api/stop', { method: 'POST' });
  } catch (err) {
    addLog('Stop failed: ' + err.message, 'warn');
  }
}

// ─── Event Listeners ─────────────────────────────────────────────────────────

dom.btnDiscover.addEventListener('click', discoverSpeakers);
dom.btnStart.addEventListener('click', startMonitoring);
dom.btnStop.addEventListener('click', stopMonitoring);

dom.sensitivity.addEventListener('input', (e) => {
  state.threshold = parseInt(e.target.value);
  dom.sensitivityVal.textContent = `${state.threshold}%`;
  dom.thresholdMarker.style.left = `${state.threshold}%`;
  syncSettings();
});

dom.cooldown.addEventListener('input', (e) => {
  state.cooldownSec = parseInt(e.target.value);
  dom.cooldownVal.textContent = `${state.cooldownSec}s`;
  syncSettings();
});

dom.alertVolume.addEventListener('input', (e) => {
  state.alertVolume = parseInt(e.target.value);
  dom.alertVolumeVal.textContent = `${state.alertVolume}%`;
  syncSettings();
});

dom.alertSound.addEventListener('change', (e) => {
  state.alertSound = e.target.value.trim();
  syncSettings();
});

// ─── Render Loop ─────────────────────────────────────────────────────────────

function renderLoop() {
  if (state.monitoring) {
    viz.draw(state.threshold);
  } else {
    viz.drawIdle();
  }
  requestAnimationFrame(renderLoop);
}

// ─── Init ────────────────────────────────────────────────────────────────────

// Request notification permission early
if (Notification.permission === 'default') {
  Notification.requestPermission();
}

connectWS();
renderLoop();
addLog('App loaded. Discover speakers to begin.', 'info');
