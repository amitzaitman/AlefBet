import type { SonosSpeaker, WSMessage, MicSource } from '../schemas.ts';
import { createLocalState } from '../../../../framework/src/core/local-state.js';
import { sounds } from '../../../../framework/src/audio/sounds.js';
import { Visualizer } from './visualizer.ts';
import { DeviceMic } from './device-mic.ts';
import * as api from './sonos-api.ts';

// ─── Persisted settings (survives page refresh) ─────────────────────────────

interface PersistedSettings {
  micSource: MicSource;
  threshold: number;
  cooldownSec: number;
  alertVolume: number;
  alertSound: string;
  babySpeaker: SonosSpeaker | null;
  parentSpeaker: SonosSpeaker | null;
}

const savedSettings = createLocalState('sonos-monitor:settings', {
  micSource: 'sonos',
  threshold: 40,
  cooldownSec: 30,
  alertVolume: 30,
  alertSound: '',
  babySpeaker: null,
  parentSpeaker: null,
});

// ─── State ───────────────────────────────────────────────────────────────────

interface AppState {
  micSource: MicSource;
  speakers: SonosSpeaker[];
  babySpeaker: SonosSpeaker | null;
  parentSpeaker: SonosSpeaker | null;
  monitoring: boolean;
  threshold: number;
  cooldownSec: number;
  alertVolume: number;
  alertSound: string;
  currentLevel: number;
  lastAlertTime: number;
}

const saved = savedSettings.get();
const state: AppState = {
  micSource: saved.micSource,
  speakers: [],
  babySpeaker: saved.babySpeaker,
  parentSpeaker: saved.parentSpeaker,
  monitoring: false,
  threshold: saved.threshold,
  cooldownSec: saved.cooldownSec,
  alertVolume: saved.alertVolume,
  alertSound: saved.alertSound,
  currentLevel: 0,
  lastAlertTime: 0,
};

function persistSettings(): void {
  savedSettings.set({
    micSource: state.micSource,
    threshold: state.threshold,
    cooldownSec: state.cooldownSec,
    alertVolume: state.alertVolume,
    alertSound: state.alertSound,
    babySpeaker: state.babySpeaker,
    parentSpeaker: state.parentSpeaker,
  });
}

let ws: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
const deviceMic = new DeviceMic();
let deviceMicFrame: number | null = null;

// ─── DOM ─────────────────────────────────────────────────────────────────────

const $ = <T extends HTMLElement>(s: string): T => document.querySelector<T>(s)!;

const dom = {
  btnStart: $<HTMLButtonElement>('#btn-start'),
  btnStop: $<HTMLButtonElement>('#btn-stop'),
  btnMicSonos: $<HTMLButtonElement>('#btn-mic-sonos'),
  btnMicDevice: $<HTMLButtonElement>('#btn-mic-device'),
  sonosMicSection: $<HTMLDivElement>('#sonos-mic-section'),
  deviceMicSection: $<HTMLDivElement>('#device-mic-section'),
  btnDiscover: $<HTMLButtonElement>('#btn-discover'),
  btnDiscoverDevice: $<HTMLButtonElement>('#btn-discover-device'),
  discoverStatus: $<HTMLSpanElement>('#discover-status'),
  discoverStatusDevice: $<HTMLSpanElement>('#discover-status-device'),
  speakersContainer: $<HTMLDivElement>('#speakers-container'),
  speakersContainerDevice: $<HTMLDivElement>('#speakers-container-device'),
  babySpeakers: $<HTMLDivElement>('#baby-speakers'),
  parentSpeakers: $<HTMLDivElement>('#parent-speakers'),
  parentSpeakersDevice: $<HTMLDivElement>('#parent-speakers-device'),
  sonosAlertSettings: $<HTMLDivElement>('#sonos-alert-settings'),
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

// ─── Mic Source Toggle ───────────────────────────────────────────────────────

function setMicSource(source: MicSource): void {
  state.micSource = source;
  persistSettings();

  dom.btnMicSonos.classList.toggle('mic-btn-active', source === 'sonos');
  dom.btnMicDevice.classList.toggle('mic-btn-active', source === 'device');
  dom.sonosMicSection.style.display = source === 'sonos' ? '' : 'none';
  dom.deviceMicSection.style.display = source === 'device' ? '' : 'none';

  addLog(`Mic source: ${source === 'sonos' ? 'Sonos speaker mic' : 'Device microphone'}`, 'info');
}

dom.btnMicSonos.addEventListener('click', () => setMicSource('sonos'));
dom.btnMicDevice.addEventListener('click', () => setMicSource('device'));

// ─── WebSocket (Sonos mic mode) ─────────────────────────────────────────────

function connectWS(): void {
  try {
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
      reconnectTimer = setTimeout(connectWS, 3000);
    };

    ws.onerror = () => ws?.close();
  } catch {
    // Server not available (e.g. static hosting) — ignore
  }
}

function handleWSMessage(msg: WSMessage): void {
  // Only process Sonos mic messages when in Sonos mode
  if (state.micSource === 'sonos' || msg.type === 'state') {
    switch (msg.type) {
      case 'state':
        if (msg.monitoring && state.micSource === 'sonos') {
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
}

// ─── Device Mic Mode ─────────────────────────────────────────────────────────

function deviceMicTick(): void {
  if (!state.monitoring || state.micSource !== 'device') return;

  const level = deviceMic.getLevel();
  state.currentLevel = level;
  updateLevelDisplay(level);
  viz.push(level);

  if (level >= state.threshold) {
    handleDeviceMicAlert(level);
  }

  deviceMicFrame = requestAnimationFrame(deviceMicTick);
}

async function handleDeviceMicAlert(level: number): Promise<void> {
  const now = Date.now();
  if (now - state.lastAlertTime < state.cooldownSec * 1000) return;
  state.lastAlertTime = now;

  const message = `Sound detected (${Math.round(level)}%) via device mic!`;
  setStatus('alert', message);
  addLog(message, 'alert');
  sendBrowserNotification(message);

  // Try to play alert on parent Sonos speaker via server
  if (state.parentSpeaker && state.alertSound) {
    try {
      await api.sendAlert(
        state.parentSpeaker.ip,
        state.parentSpeaker.port,
        state.alertVolume,
        state.alertSound,
      );
      addLog(`Alert played on ${state.parentSpeaker.roomName}`, 'success');
    } catch {
      // Server not available — play local alert tone as fallback
      sounds.alert();
    }
  } else {
    // No Sonos speaker or alert URL — play local alert tone
    sounds.alert();
  }

  setTimeout(() => {
    if (state.monitoring) setStatus('listening', 'Monitoring via device mic');
  }, 5000);
}

async function startDeviceMic(): Promise<void> {
  try {
    await deviceMic.start();
    state.monitoring = true;
    dom.btnStart.disabled = true;
    dom.btnStop.disabled = false;
    setStatus('listening', 'Monitoring via device mic');
    addLog('Device mic monitoring started', 'success');
    deviceMicTick();
  } catch (err) {
    addLog(`Microphone access denied: ${(err as Error).message}`, 'warn');
    setStatus('idle', 'Mic access denied');
  }
}

function stopDeviceMic(): void {
  deviceMic.stop();
  state.monitoring = false;
  if (deviceMicFrame) { cancelAnimationFrame(deviceMicFrame); deviceMicFrame = null; }
  dom.btnStart.disabled = false;
  dom.btnStop.disabled = true;
  setStatus('idle', 'Not monitoring');
  updateLevelDisplay(0);
  addLog('Device mic monitoring stopped', 'info');
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
      persistSettings();
      renderSpeakers(list, container, role);
    });
    container.appendChild(el);
  }
}

// ─── Discovery ───────────────────────────────────────────────────────────────

async function discoverSpeakers(
  statusEl: HTMLElement,
  discoverBtn: HTMLButtonElement,
  onDone: (speakers: SonosSpeaker[]) => void,
): Promise<void> {
  statusEl.textContent = 'Searching for Sonos speakers...';
  discoverBtn.disabled = true;
  addLog('Discovering Sonos speakers on network...', 'info');

  try {
    state.speakers = await api.discover();

    if (state.speakers.length === 0) {
      statusEl.textContent = 'No speakers found. Ensure Sonos is on the same network.';
      addLog('No Sonos speakers found.', 'warn');
    } else {
      const micCount = state.speakers.filter(s => s.hasMic).length;
      statusEl.textContent = `Found ${state.speakers.length} speaker(s), ${micCount} with mic`;
      addLog(`Found ${state.speakers.length} speaker(s), ${micCount} with mic`, 'success');
      onDone(state.speakers);
    }
  } catch (err) {
    statusEl.textContent = `Discovery failed: ${(err as Error).message}`;
    addLog(`Discovery error: ${(err as Error).message}`, 'warn');
  }

  discoverBtn.disabled = false;
}

// ─── Start / Stop ────────────────────────────────────────────────────────────

async function startMonitoring(): Promise<void> {
  if (state.micSource === 'device') {
    await startDeviceMic();
    return;
  }

  // Sonos mic mode
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
  if (state.micSource === 'device') {
    stopDeviceMic();
    return;
  }

  try { await api.stopMonitoring(); }
  catch (err) { addLog(`Stop failed: ${(err as Error).message}`, 'warn'); }
}

function pushSettings(): void {
  api.syncSettings({
    threshold: state.threshold,
    cooldownMs: state.cooldownSec * 1000,
    alertVolume: state.alertVolume,
    alertSoundUrl: state.alertSound,
  });
}

// ─── Event Listeners ─────────────────────────────────────────────────────────

dom.btnStart.addEventListener('click', startMonitoring);
dom.btnStop.addEventListener('click', stopMonitoring);

// Sonos mode discovery
dom.btnDiscover.addEventListener('click', () => {
  discoverSpeakers(dom.discoverStatus, dom.btnDiscover, (speakers) => {
    dom.speakersContainer.style.display = 'block';
    const sorted = [...speakers].sort((a, b) => (b.hasMic ? 1 : 0) - (a.hasMic ? 1 : 0));
    renderSpeakers(sorted, dom.babySpeakers, 'baby');
    renderSpeakers(speakers, dom.parentSpeakers, 'parent');
  });
});

// Device mic mode discovery (parent speaker only)
dom.btnDiscoverDevice.addEventListener('click', () => {
  discoverSpeakers(dom.discoverStatusDevice, dom.btnDiscoverDevice, (speakers) => {
    dom.speakersContainerDevice.style.display = 'block';
    renderSpeakers(speakers, dom.parentSpeakersDevice, 'parent');
  });
});

dom.sensitivity.addEventListener('input', () => {
  state.threshold = parseInt(dom.sensitivity.value);
  dom.sensitivityVal.textContent = `${state.threshold}%`;
  dom.thresholdMarker.style.left = `${state.threshold}%`;
  persistSettings();
  if (state.micSource === 'sonos') pushSettings();
});

dom.cooldown.addEventListener('input', () => {
  state.cooldownSec = parseInt(dom.cooldown.value);
  dom.cooldownVal.textContent = `${state.cooldownSec}s`;
  persistSettings();
  if (state.micSource === 'sonos') pushSettings();
});

dom.alertVolume.addEventListener('input', () => {
  state.alertVolume = parseInt(dom.alertVolume.value);
  dom.alertVolumeVal.textContent = `${state.alertVolume}%`;
  persistSettings();
  if (state.micSource === 'sonos') pushSettings();
});

dom.alertSound.addEventListener('change', () => {
  state.alertSound = dom.alertSound.value.trim();
  persistSettings();
  if (state.micSource === 'sonos') pushSettings();
});

// ─── Render loop ─────────────────────────────────────────────────────────────

function renderLoop(): void {
  if (state.monitoring && state.micSource === 'sonos') viz.draw(state.threshold);
  else if (state.monitoring && state.micSource === 'device') viz.draw(state.threshold);
  else viz.drawIdle();
  requestAnimationFrame(renderLoop);
}

// ─── Init ────────────────────────────────────────────────────────────────────

if (Notification.permission === 'default') Notification.requestPermission();

// Restore UI from saved settings
dom.sensitivity.value = String(state.threshold);
dom.sensitivityVal.textContent = `${state.threshold}%`;
dom.thresholdMarker.style.left = `${state.threshold}%`;
dom.cooldown.value = String(state.cooldownSec);
dom.cooldownVal.textContent = `${state.cooldownSec}s`;
dom.alertVolume.value = String(state.alertVolume);
dom.alertVolumeVal.textContent = `${state.alertVolume}%`;
dom.alertSound.value = state.alertSound;
setMicSource(state.micSource);

// Try connecting to server (works in local mode, silently fails on static hosting)
connectWS();
renderLoop();
addLog('App loaded. Choose a microphone source and start monitoring.', 'info');
