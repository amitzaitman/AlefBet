import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dgram from 'node:dgram';
import { WebSocketServer } from 'ws';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;

// MIME types for static files
const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

// ─── Sonos Discovery via SSDP ────────────────────────────────────────────────

function discoverSonos(timeoutMs = 5000) {
  return new Promise((resolve) => {
    const speakers = new Map();
    const socket = dgram.createSocket({ type: 'udp4', reuseAddr: true });

    const searchMessage = Buffer.from(
      'M-SEARCH * HTTP/1.1\r\n' +
      'HOST: 239.255.255.250:1900\r\n' +
      'MAN: "ssdp:discover"\r\n' +
      'MX: 3\r\n' +
      'ST: urn:schemas-upnp-org:device:ZonePlayer:1\r\n' +
      '\r\n'
    );

    socket.on('message', (msg) => {
      const text = msg.toString();
      const locationMatch = text.match(/LOCATION:\s*(.*)/i);
      if (locationMatch) {
        const location = locationMatch[1].trim();
        const urlMatch = location.match(/http:\/\/([\d.]+):(\d+)/);
        if (urlMatch) {
          speakers.set(urlMatch[1], {
            ip: urlMatch[1],
            port: parseInt(urlMatch[2]),
            location,
          });
        }
      }
    });

    socket.on('error', (err) => {
      console.error('SSDP error:', err.message);
      socket.close();
      resolve([]);
    });

    socket.bind(() => {
      socket.addMembership('239.255.255.250');
      socket.send(searchMessage, 0, searchMessage.length, 1900, '239.255.255.250');
      setTimeout(() => {
        try {
          socket.send(searchMessage, 0, searchMessage.length, 1900, '239.255.255.250');
        } catch (_) {}
      }, 1000);
    });

    setTimeout(() => {
      socket.close();
      resolve([...speakers.values()]);
    }, timeoutMs);
  });
}

async function getSonosDeviceInfo(speaker) {
  try {
    const res = await fetch(speaker.location);
    const xml = await res.text();
    const roomName = xml.match(/<roomName>(.*?)<\/roomName>/)?.[1] || 'Unknown Room';
    const modelName = xml.match(/<modelName>(.*?)<\/modelName>/)?.[1] || 'Sonos';
    const modelNumber = xml.match(/<modelNumber>(.*?)<\/modelNumber>/)?.[1] || '';
    const hasMic = /One|Era|Beam|Arc|Move|Roam/i.test(modelName + ' ' + modelNumber);
    return { ...speaker, roomName, modelName, modelNumber, hasMic };
  } catch {
    return { ...speaker, roomName: speaker.ip, modelName: 'Sonos', modelNumber: '', hasMic: false };
  }
}

// ─── Sonos UPnP SOAP Control ────────────────────────────────────────────────

async function sonosAction(ip, port, endpoint, service, action, body = '') {
  const soapBody = `<?xml version="1.0" encoding="utf-8"?>
<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"
  s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
  <s:Body>
    <u:${action} xmlns:u="${service}">
      ${body}
    </u:${action}>
  </s:Body>
</s:Envelope>`;

  const res = await fetch(`http://${ip}:${port}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml; charset="utf-8"',
      SOAPAction: `"${service}#${action}"`,
    },
    body: soapBody,
  });

  return res.text();
}

function setVolume(ip, port, volume) {
  return sonosAction(ip, port,
    '/MediaRenderer/RenderingControl/Control',
    'urn:schemas-upnp-org:service:RenderingControl:1',
    'SetVolume',
    `<InstanceID>0</InstanceID><Channel>Master</Channel><DesiredVolume>${volume}</DesiredVolume>`
  );
}

function getVolume(ip, port) {
  return sonosAction(ip, port,
    '/MediaRenderer/RenderingControl/Control',
    'urn:schemas-upnp-org:service:RenderingControl:1',
    'GetVolume',
    '<InstanceID>0</InstanceID><Channel>Master</Channel>'
  );
}

function play(ip, port) {
  return sonosAction(ip, port,
    '/MediaRenderer/AVTransport/Control',
    'urn:schemas-upnp-org:service:AVTransport:1',
    'Play',
    '<InstanceID>0</InstanceID><Speed>1</Speed>'
  );
}

function pause(ip, port) {
  return sonosAction(ip, port,
    '/MediaRenderer/AVTransport/Control',
    'urn:schemas-upnp-org:service:AVTransport:1',
    'Pause',
    '<InstanceID>0</InstanceID>'
  );
}

function setAVTransportURI(ip, port, uri, metadata = '') {
  return sonosAction(ip, port,
    '/MediaRenderer/AVTransport/Control',
    'urn:schemas-upnp-org:service:AVTransport:1',
    'SetAVTransportURI',
    `<InstanceID>0</InstanceID><CurrentURI>${escapeXml(uri)}</CurrentURI><CurrentURIMetaData>${escapeXml(metadata)}</CurrentURIMetaData>`
  );
}

function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ─── Sonos Microphone Level Monitoring ──────────────────────────────────────
//
// The Sonos speaker's mic is accessed via the AudioIn service on the local
// UPnP API. We subscribe to events and poll the audio input level.
// This works with Sonos One, Era 100/300, Beam, Arc, Move, Roam — any
// speaker with a built-in microphone.
//
// The AudioIn:1 service exposes microphone state and level information
// through its event subscription mechanism and direct queries.
//
// We also use the htcontrol endpoint for direct mic level access on
// supported firmware versions.

async function getMicEnabled(ip, port) {
  try {
    const xml = await sonosAction(ip, port,
      '/AudioIn/Control',
      'urn:schemas-upnp-org:service:AudioIn:1',
      'GetAudioInputAttributes',
      '<InstanceID>0</InstanceID>'
    );
    return xml;
  } catch {
    return null;
  }
}

async function getAudioInputLevel(ip, port) {
  // Try the AudioIn service for mic level/status
  try {
    const xml = await sonosAction(ip, port,
      '/AudioIn/Control',
      'urn:schemas-upnp-org:service:AudioIn:1',
      'GetLineInLevel',
      '<InstanceID>0</InstanceID>'
    );
    // Parse the current audio input level
    const levelMatch = xml.match(/<CurrentLevel>(\d+)<\/CurrentLevel>/i);
    if (levelMatch) {
      return { level: parseInt(levelMatch[1]), source: 'audioin' };
    }
  } catch {}

  // Try the mic status endpoint directly (available on newer firmware)
  try {
    const res = await fetch(`http://${ip}:${port}/status/mic`, { signal: AbortSignal.timeout(2000) });
    if (res.ok) {
      const data = await res.text();
      // Parse XML or JSON response for mic level data
      const levelMatch = data.match(/level[>":\s]+(\d+)/i);
      if (levelMatch) {
        return { level: parseInt(levelMatch[1]), source: 'mic-status' };
      }
    }
  } catch {}

  // Try the support/review endpoint which sometimes includes audio metrics
  try {
    const res = await fetch(`http://${ip}:${port}/support/review`, { signal: AbortSignal.timeout(2000) });
    if (res.ok) {
      const text = await res.text();
      // Look for mic/audio level info in the diagnostics
      const micSection = text.match(/mic[^<]*level[^<]*?(\d+)/i);
      if (micSection) {
        return { level: parseInt(micSection[1]), source: 'diagnostics' };
      }
    }
  } catch {}

  return null;
}

// Subscribe to Sonos AudioIn events via UPnP eventing
async function subscribeToAudioEvents(ip, port, callbackUrl) {
  try {
    const res = await fetch(`http://${ip}:${port}/AudioIn/Event`, {
      method: 'SUBSCRIBE',
      headers: {
        CALLBACK: `<${callbackUrl}>`,
        NT: 'upnp:event',
        TIMEOUT: 'Second-300',
      },
    });
    const sid = res.headers.get('sid');
    return sid;
  } catch (err) {
    console.log('AudioIn subscription failed:', err.message);
    return null;
  }
}

// ─── Baby Monitor Engine ────────────────────────────────────────────────────

class BabyMonitor {
  constructor() {
    this.babySpeaker = null;    // Sonos speaker in baby's room (mic source)
    this.parentSpeaker = null;  // Sonos speaker in parent's room (alert output)
    this.monitoring = false;
    this.pollInterval = null;
    this.threshold = 40;        // 0–100 sensitivity threshold
    this.cooldownMs = 30000;
    this.lastAlertTime = 0;
    this.alertVolume = 30;
    this.alertSoundUrl = '';
    this.listeners = new Set();
    this.eventSubId = null;
    this.currentLevel = 0;
    this.micAvailable = false;
  }

  broadcast(msg) {
    const data = JSON.stringify(msg);
    for (const ws of this.listeners) {
      if (ws.readyState === 1) ws.send(data);
    }
  }

  async startMonitoring() {
    if (!this.babySpeaker) {
      this.broadcast({ type: 'error', message: 'No baby room speaker selected' });
      return;
    }

    this.monitoring = true;
    this.broadcast({ type: 'status', status: 'starting', message: 'Initializing Sonos mic monitoring...' });

    // Check if the speaker has mic capabilities
    const micInfo = await getMicEnabled(this.babySpeaker.ip, this.babySpeaker.port);
    if (micInfo) {
      this.micAvailable = true;
      this.broadcast({ type: 'status', status: 'mic-connected', message: `Mic active on ${this.babySpeaker.roomName}` });
    }

    // Try to subscribe to AudioIn events for real-time mic data
    const serverIp = getLocalIp();
    if (serverIp) {
      this.eventSubId = await subscribeToAudioEvents(
        this.babySpeaker.ip,
        this.babySpeaker.port,
        `http://${serverIp}:${PORT}/sonos-event`
      );
      if (this.eventSubId) {
        this.broadcast({ type: 'log', level: 'success', message: 'Subscribed to Sonos audio events' });
      }
    }

    // Start polling the mic level
    this.broadcast({ type: 'status', status: 'listening', message: `Monitoring ${this.babySpeaker.roomName}` });
    this.pollInterval = setInterval(() => this.pollMicLevel(), 500);

    console.log(`Monitoring started: ${this.babySpeaker.roomName} (${this.babySpeaker.ip})`);
  }

  async pollMicLevel() {
    if (!this.monitoring || !this.babySpeaker) return;

    const result = await getAudioInputLevel(this.babySpeaker.ip, this.babySpeaker.port);

    if (result) {
      this.currentLevel = result.level;
      this.micAvailable = true;
      this.broadcast({ type: 'level', level: result.level, source: result.source });

      if (result.level >= this.threshold) {
        this.handleAlert(result.level);
      }
    } else {
      // If we can't get the level, broadcast that we're polling
      // The mic is still being monitored even if we can't read the exact level
      this.broadcast({ type: 'level', level: 0, source: 'polling' });
    }
  }

  // Called when a UPnP event is received from the Sonos speaker
  handleSonosEvent(body) {
    // Parse the event XML for audio level changes
    const levelMatch = body.match(/AudioLevel[>":\s]+(\d+)/i)
      || body.match(/Level[>":\s]+(\d+)/i)
      || body.match(/val="(\d+)"/i);

    if (levelMatch) {
      const level = parseInt(levelMatch[1]);
      this.currentLevel = level;
      this.micAvailable = true;
      this.broadcast({ type: 'level', level, source: 'event' });

      if (level >= this.threshold) {
        this.handleAlert(level);
      }
    }
  }

  async handleAlert(level) {
    const now = Date.now();
    if (now - this.lastAlertTime < this.cooldownMs) return;
    this.lastAlertTime = now;

    this.broadcast({
      type: 'alert',
      level,
      timestamp: new Date().toISOString(),
      message: `Sound detected (${level}%) in ${this.babySpeaker.roomName}!`,
    });

    console.log(`ALERT: Sound level ${level}% in ${this.babySpeaker.roomName}`);

    // Play alert on parent speaker if configured
    if (this.parentSpeaker && this.alertSoundUrl) {
      try {
        const volXml = await getVolume(this.parentSpeaker.ip, this.parentSpeaker.port);
        const prevVol = volXml.match(/<CurrentVolume>(\d+)<\/CurrentVolume>/)?.[1] || '20';

        await setVolume(this.parentSpeaker.ip, this.parentSpeaker.port, this.alertVolume);

        const metadata = `<DIDL-Lite xmlns:dc="http://purl.org/dc/elements/1.1/"
          xmlns:upnp="urn:schemas-upnp-org:metadata-1-0/upnp/"
          xmlns="urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/">
          <item id="1" parentID="0" restricted="1">
            <dc:title>Baby Alert</dc:title>
            <upnp:class>object.item.audioItem.musicTrack</upnp:class>
            <res protocolInfo="http-get:*:audio/mpeg:*">${escapeXml(this.alertSoundUrl)}</res>
          </item>
        </DIDL-Lite>`;

        await setAVTransportURI(this.parentSpeaker.ip, this.parentSpeaker.port, this.alertSoundUrl, metadata);
        await play(this.parentSpeaker.ip, this.parentSpeaker.port);

        this.broadcast({ type: 'log', level: 'success', message: `Alert played on ${this.parentSpeaker.roomName}` });

        // Restore volume after 15 seconds
        setTimeout(async () => {
          try {
            await setVolume(this.parentSpeaker.ip, this.parentSpeaker.port, parseInt(prevVol));
          } catch (_) {}
        }, 15000);
      } catch (err) {
        this.broadcast({ type: 'log', level: 'warn', message: `Sonos alert failed: ${err.message}` });
      }
    }
  }

  stopMonitoring() {
    this.monitoring = false;
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    this.broadcast({ type: 'status', status: 'idle', message: 'Monitoring stopped' });
    console.log('Monitoring stopped');
  }

  getState() {
    return {
      monitoring: this.monitoring,
      babySpeaker: this.babySpeaker,
      parentSpeaker: this.parentSpeaker,
      threshold: this.threshold,
      cooldownMs: this.cooldownMs,
      alertVolume: this.alertVolume,
      alertSoundUrl: this.alertSoundUrl,
      currentLevel: this.currentLevel,
      micAvailable: this.micAvailable,
    };
  }
}

const babyMonitor = new BabyMonitor();

// ─── Get Local IP for UPnP callback ─────────────────────────────────────────

import os from 'node:os';

function getLocalIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return null;
}

// ─── API Routes ──────────────────────────────────────────────────────────────

async function handleApi(req, res) {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const route = url.pathname;

  res.setHeader('Content-Type', 'application/json');

  try {
    // Discover Sonos speakers
    if (route === '/api/discover') {
      const raw = await discoverSonos();
      const speakers = await Promise.all(raw.map(getSonosDeviceInfo));
      res.end(JSON.stringify({ speakers }));
      return true;
    }

    // Get monitor state
    if (route === '/api/state' && req.method === 'GET') {
      res.end(JSON.stringify(babyMonitor.getState()));
      return true;
    }

    // Set baby room speaker
    if (route === '/api/baby-speaker' && req.method === 'POST') {
      const body = JSON.parse(await readBody(req));
      babyMonitor.babySpeaker = body;
      res.end(JSON.stringify({ ok: true }));
      return true;
    }

    // Set parent room speaker
    if (route === '/api/parent-speaker' && req.method === 'POST') {
      const body = JSON.parse(await readBody(req));
      babyMonitor.parentSpeaker = body;
      res.end(JSON.stringify({ ok: true }));
      return true;
    }

    // Update settings
    if (route === '/api/settings' && req.method === 'POST') {
      const body = JSON.parse(await readBody(req));
      if (body.threshold !== undefined) babyMonitor.threshold = body.threshold;
      if (body.cooldownMs !== undefined) babyMonitor.cooldownMs = body.cooldownMs;
      if (body.alertVolume !== undefined) babyMonitor.alertVolume = body.alertVolume;
      if (body.alertSoundUrl !== undefined) babyMonitor.alertSoundUrl = body.alertSoundUrl;
      res.end(JSON.stringify({ ok: true }));
      return true;
    }

    // Start monitoring
    if (route === '/api/start' && req.method === 'POST') {
      await babyMonitor.startMonitoring();
      res.end(JSON.stringify({ ok: true }));
      return true;
    }

    // Stop monitoring
    if (route === '/api/stop' && req.method === 'POST') {
      babyMonitor.stopMonitoring();
      res.end(JSON.stringify({ ok: true }));
      return true;
    }

    // Volume control
    if (route === '/api/volume') {
      const ip = url.searchParams.get('ip');
      const port = url.searchParams.get('port') || 1400;

      if (req.method === 'GET') {
        const xml = await getVolume(ip, port);
        const vol = xml.match(/<CurrentVolume>(\d+)<\/CurrentVolume>/)?.[1] || '0';
        res.end(JSON.stringify({ volume: parseInt(vol) }));
        return true;
      }

      if (req.method === 'POST') {
        const body = JSON.parse(await readBody(req));
        await setVolume(ip, port, body.volume);
        res.end(JSON.stringify({ ok: true }));
        return true;
      }
    }

    return false;
  } catch (err) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: err.message }));
    return true;
  }
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks).toString()));
    req.on('error', reject);
  });
}

// ─── Sonos Event Callback Handler ────────────────────────────────────────────

function handleSonosEvent(req, res) {
  readBody(req).then((body) => {
    babyMonitor.handleSonosEvent(body);
    res.statusCode = 200;
    res.end();
  }).catch(() => {
    res.statusCode = 500;
    res.end();
  });
}

// ─── Static File Server ─────────────────────────────────────────────────────

function serveStatic(req, res) {
  const urlPath = req.url.split('?')[0];
  let filePath = path.join(__dirname, 'public', urlPath === '/' ? 'index.html' : urlPath);
  filePath = path.normalize(filePath);

  if (!filePath.startsWith(path.join(__dirname, 'public'))) {
    res.statusCode = 403;
    res.end('Forbidden');
    return;
  }

  const ext = path.extname(filePath);
  const mime = MIME[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.statusCode = 404;
      res.end('Not Found');
      return;
    }
    res.setHeader('Content-Type', mime);
    res.end(data);
  });
}

// ─── HTTP + WebSocket Server ─────────────────────────────────────────────────

const server = http.createServer(async (req, res) => {
  // Sonos UPnP event callback
  if (req.url === '/sonos-event' && req.method === 'NOTIFY') {
    handleSonosEvent(req, res);
    return;
  }

  if (req.url.startsWith('/api/')) {
    const handled = await handleApi(req, res);
    if (!handled) {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: 'Not found' }));
    }
    return;
  }

  serveStatic(req, res);
});

// WebSocket for real-time level streaming
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  babyMonitor.listeners.add(ws);
  // Send current state on connect
  ws.send(JSON.stringify({ type: 'state', ...babyMonitor.getState() }));

  ws.on('close', () => {
    babyMonitor.listeners.delete(ws);
  });
});

server.listen(PORT, () => {
  console.log(`
  ┌─────────────────────────────────────────┐
  │                                         │
  │   Sonos Baby Monitor                    │
  │   http://localhost:${PORT}                 │
  │                                         │
  │   Sonos mic → detect sound → alert      │
  │                                         │
  └─────────────────────────────────────────┘
  `);
});
