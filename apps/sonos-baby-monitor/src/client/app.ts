import type { SonosSpeaker, WSMessage } from '../schemas.ts';
import { Visualizer } from './visualizer.ts';
import * as api from './sonos-api.ts';

// ─── State ───────────────────────────────────────────────────────────────────

interface AppState {
  speakers: SonosSpeaker[];
  babySpeaker: SonosSpeaker | null;
  parentSpeaker: SonosSpeaker | null;
  monitoring: boolean;
  threshold: number;
  cooldownSec: number;
  alertVolume: number;
  alertSound: string;
  currentLevel: number;
}

const state: AppState = {
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

let ws: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

// ─── DOM ─────────────────────────────────────────────────────────────────────

const $ = <T extends HTMLElement>(s: string): T => document.querySelector<T>(s)!;

const dom = {
  btnStart: $<HTMLButtonElement>('#btn-start'),
  btnStop: $<HTMLButtonElement>('#btn-stop'),
  btnDiscover: $<HTMLButtonElement>('#btn-discover'),
  discoverStatus: $<HTMLSpanElement>('#discover-status'),
  speakersContainer: $<HTMLDivElement>('#speakers-container'),
  babySpeakers: $<HTMLDivElement>('#baby-speakers'),
  parentSpeakers: $<HTMLDivElement>('#parent-speakers'),
  sensitivity: $<HTMLInputElement>('#sensitivity'),
  sensitivityVal: $<HTMLSpanElement>('#sensitivity-value'),
  cooldown: $<HTMLInputElement>('#cooldown'),
  cooldownVal: $<HTMLSpanElement>('#cooldown-value'),
  alertVolume: $<HTMLInputElement>('#alert-volume'),
  alertVolumeVal: $<HTMLSpanElement>('#alert-volume-value'),
  alertSound: $<HTMLInputElement>('#alert-sound'),
  statusBanner: $<HTMLDivElement>('#status-banner'),
  statusIcon: $<HTMLSpanElement>('#status-icon'),
  statusText: $<HTMLSpanElement>('#status-text'),
  levelBar: $<HTMLDivElement>('#level-bar'),
  thresholdMarker: $<HTMLDivElement>('#threshold-marker'),
  currentLevel: $<HTMLSpanElement>('#current-level'),
  eventLog: $<HTMLDivElement>('#event-log'),
  visualizer: $<HTMLCanvasElement>('#visualizer'),
};

const viz = new Visualizer(dom.visualizer);

// ─── WebSocket ───────────────────────────────────────────────────────────────

function connectWS(): void {
  const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
  ws = new WebSocket(`${protocol}//${location.host}`);

  ws.onopen = () => {
    addLog('Connected to server', 'success');
    if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
  };

  ws.onmessage = (e) => {
    const msg: WSMessage = JSON.parse(e.data as string);
    handleWSMessage(msg);
  };

  ws.onclose = () => {
    addLog('Disconnected, reconnecting...', 'warn');
    reconnectTimer = setTimeout(connectWS, 3000);
  };

  ws.onerror = () => ws?.close();
}

function handleWSMessage(msg: WSMessage): void {
  switch (msg.type) {
    case 'state':
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
      setTimeout(() => {
        if (state.monitoring) setStatus('listening', `Monitoring ${state.babySpeaker?.roomName ?? '...'}`);
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

type LogLevel = 'info' | 'success' | 'warn' | 'alert';

function setStatus(mode: string, text: string): void {
  dom.statusBanner.className = `status-banner status-${mode}`;
  dom.statusText.textContent = text;
  dom.statusIcon.innerHTML = mode === 'alert' ? '&#x26A0;' : '&#x25CF;';
}

function addLog(message: string, type: LogLevel = 'info'): void {
  const entry = document.createElement('div');
  entry.className = `log-entry log-${type}`;
  entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
  dom.eventLog.appendChild(entry);
  dom.eventLog.scrollTop = dom.eventLog.scrollHeight;
  while (dom.eventLog.children.length > 100) dom.eventLog.removeChild(dom.eventLog.firstChild!);
}

function updateLevelDisplay(level: number): void {
  dom.levelBar.style.width = `${level}%`;
  dom.currentLevel.textContent = `${Math.round(level)}%`;
  dom.levelBar.classList.toggle('warn', level > state.threshold * 0.7 && level < state.threshold);
  dom.levelBar.classList.toggle('alert', level >= state.threshold);
}

function sendBrowserNotification(message: string): void {
  if (Notification.permission === 'granted') {
    new Notification('Baby Monitor Alert', { body: message, requireInteraction: true });
  }
}

// ─── Speaker rendering ───────────────────────────────────────────────────────

type SpeakerRole = 'baby' | 'parent';

function renderSpeakers(list: SonosSpeaker[], container: HTMLElement, role: SpeakerRole): void {
  container.innerHTML = '';
  for (const sp of list) {
    const isSelected = role === 'baby'
      ? state.babySpeaker?.ip === sp.ip
      : state.parentSpeaker?.ip === sp.ip;

    const el = document.createElement('div');
    el.className = `speaker-item${isSelected ? (role === 'baby' ? ' selected' : ' selected-parent') : ''}`;
    el.innerHTML = `
      <div class="speaker-icon">${sp.hasMic ? '&#x1f3a4;' : '&#x1f50a;'}</div>
      <div class="speaker-info">
        <div class="speaker-name">${sp.roomName}</div>
        <div class="speaker-meta">${sp.modelName} ${sp.modelNumber} &middot; ${sp.ip}</div>
      </div>
      ${sp.hasMic && role === 'baby' ? '<span class="speaker-badge badge-mic">MIC</span>' : ''}
      <div class="speaker-check">&#x2713;</div>
    `;
    el.addEventListener('click', async () => {
      if (role === 'baby') {
        state.babySpeaker = sp;
        await api.setBabySpeaker(sp);
        addLog(`Baby room: ${sp.roomName}`, 'success');
      } else {
        state.parentSpeaker = sp;
        await api.setParentSpeaker(sp);
        addLog(`Parent room: ${sp.roomName}`, 'success');
      }
      renderSpeakers(list, container, role);
    });
    container.appendChild(el);
  }
}

// ─── Actions ─────────────────────────────────────────────────────────────────

async function discoverSpeakers(): Promise<void> {
  dom.discoverStatus.textContent = 'Searching for Sonos speakers...';
  dom.btnDiscover.disabled = true;
  addLog('Discovering Sonos speakers on network...', 'info');

  try {
    state.speakers = await api.discover();

    if (state.speakers.length === 0) {
      dom.discoverStatus.textContent = 'No speakers found. Ensure Sonos is on the same network.';
      addLog('No Sonos speakers found.', 'warn');
    } else {
      const micCount = state.speakers.filter(s => s.hasMic).length;
      dom.discoverStatus.textContent = `Found ${state.speakers.length} speaker(s), ${micCount} with mic`;
      addLog(`Found ${state.speakers.length} speaker(s), ${micCount} with mic`, 'success');
      dom.speakersContainer.style.display = 'block';

      const sorted = [...state.speakers].sort((a, b) => (b.hasMic ? 1 : 0) - (a.hasMic ? 1 : 0));
      renderSpeakers(sorted, dom.babySpeakers, 'baby');
      renderSpeakers(state.speakers, dom.parentSpeakers, 'parent');
    }
  } catch (err) {
    dom.discoverStatus.textContent = `Discovery failed: ${(err as Error).message}`;
    addLog(`Discovery error: ${(err as Error).message}`, 'warn');
  }

  dom.btnDiscover.disabled = false;
}

function pushSettings(): void {
  api.syncSettings({
    threshold: state.threshold,
    cooldownMs: state.cooldownSec * 1000,
    alertVolume: state.alertVolume,
    alertSoundUrl: state.alertSound,
  });
}

async function startMonitoring(): Promise<void> {
  if (!state.babySpeaker) { addLog('Select a baby room speaker first', 'warn'); return; }
  pushSettings();
  dom.btnStart.disabled = true;
  addLog('Starting monitoring...', 'info');

  try {
    const data = await api.startMonitoring();
    if (data.error) { addLog(`Start failed: ${data.error}`, 'warn'); dom.btnStart.disabled = false; }
  } catch (err) {
    addLog(`Start failed: ${(err as Error).message}`, 'warn');
    dom.btnStart.disabled = false;
  }
}

async function stopMonitoring(): Promise<void> {
  try { await api.stopMonitoring(); }
  catch (err) { addLog(`Stop failed: ${(err as Error).message}`, 'warn'); }
}

// ─── Event Listeners ─────────────────────────────────────────────────────────

dom.btnDiscover.addEventListener('click', discoverSpeakers);
dom.btnStart.addEventListener('click', startMonitoring);
dom.btnStop.addEventListener('click', stopMonitoring);

dom.sensitivity.addEventListener('input', () => {
  state.threshold = parseInt(dom.sensitivity.value);
  dom.sensitivityVal.textContent = `${state.threshold}%`;
  dom.thresholdMarker.style.left = `${state.threshold}%`;
  pushSettings();
});

dom.cooldown.addEventListener('input', () => {
  state.cooldownSec = parseInt(dom.cooldown.value);
  dom.cooldownVal.textContent = `${state.cooldownSec}s`;
  pushSettings();
});

dom.alertVolume.addEventListener('input', () => {
  state.alertVolume = parseInt(dom.alertVolume.value);
  dom.alertVolumeVal.textContent = `${state.alertVolume}%`;
  pushSettings();
});

dom.alertSound.addEventListener('change', () => {
  state.alertSound = dom.alertSound.value.trim();
  pushSettings();
});

// ─── Render loop ─────────────────────────────────────────────────────────────

function renderLoop(): void {
  if (state.monitoring) viz.draw(state.threshold);
  else viz.drawIdle();
  requestAnimationFrame(renderLoop);
}

// ─── Init ────────────────────────────────────────────────────────────────────

if (Notification.permission === 'default') Notification.requestPermission();
connectWS();
renderLoop();
addLog('App loaded. Discover speakers to begin.', 'info');
