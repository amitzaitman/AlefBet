import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { WebSocketServer } from 'ws';
import {
  SonosSpeakerSchema,
  MonitorSettingsSchema,
} from './schemas.ts';
import { discoverSonos, getSonosDeviceInfo } from './sonos-discovery.ts';
import { getVolume, setVolume } from './sonos-control.ts';
import { BabyMonitor } from './baby-monitor.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.PORT ?? '3000', 10);
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

const MIME: Record<string, string> = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

// ─── Local IP ───────────────────────────────────────────────────────────────

function getLocalIp(): string | null {
  const nets = os.networkInterfaces();
  for (const interfaces of Object.values(nets)) {
    if (!interfaces) continue;
    for (const net of interfaces) {
      if (net.family === 'IPv4' && !net.internal) return net.address;
    }
  }
  return null;
}

// ─── Request helpers ────────────────────────────────────────────────────────

function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (c: Buffer) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks).toString()));
    req.on('error', reject);
  });
}

function json(res: http.ServerResponse, data: unknown, status = 200): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

// ─── Baby Monitor instance ──────────────────────────────────────────────────

const monitor = new BabyMonitor();

// ─── API Router ─────────────────────────────────────────────────────────────

async function handleApi(req: http.IncomingMessage, res: http.ServerResponse): Promise<boolean> {
  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);
  const route = url.pathname;

  try {
    if (route === '/api/discover') {
      const raw = await discoverSonos();
      const speakers = await Promise.all(raw.map(getSonosDeviceInfo));
      json(res, { speakers });
      return true;
    }

    if (route === '/api/state' && req.method === 'GET') {
      json(res, monitor.getState());
      return true;
    }

    if (route === '/api/baby-speaker' && req.method === 'POST') {
      const body = JSON.parse(await readBody(req));
      monitor.babySpeaker = SonosSpeakerSchema.parse(body);
      json(res, { ok: true });
      return true;
    }

    if (route === '/api/parent-speaker' && req.method === 'POST') {
      const body = JSON.parse(await readBody(req));
      monitor.parentSpeaker = SonosSpeakerSchema.parse(body);
      json(res, { ok: true });
      return true;
    }

    if (route === '/api/settings' && req.method === 'POST') {
      const body = JSON.parse(await readBody(req));
      monitor.updateSettings(MonitorSettingsSchema.partial().parse(body));
      json(res, { ok: true });
      return true;
    }

    if (route === '/api/start' && req.method === 'POST') {
      await monitor.startMonitoring(PORT, getLocalIp());
      json(res, { ok: true });
      return true;
    }

    if (route === '/api/stop' && req.method === 'POST') {
      monitor.stopMonitoring();
      json(res, { ok: true });
      return true;
    }

    if (route === '/api/volume') {
      const ip = url.searchParams.get('ip');
      const port = parseInt(url.searchParams.get('port') ?? '1400', 10);
      if (!ip) { json(res, { error: 'Missing ip param' }, 400); return true; }

      if (req.method === 'GET') {
        const volume = await getVolume(ip, port);
        json(res, { volume });
        return true;
      }

      if (req.method === 'POST') {
        const body = JSON.parse(await readBody(req));
        await setVolume(ip, port, body.volume);
        json(res, { ok: true });
        return true;
      }
    }

    return false;
  } catch (err) {
    json(res, { error: (err as Error).message }, 500);
    return true;
  }
}

// ─── Static file server ─────────────────────────────────────────────────────

function serveStatic(req: http.IncomingMessage, res: http.ServerResponse): void {
  const urlPath = (req.url ?? '/').split('?')[0];
  let filePath = path.join(PUBLIC_DIR, urlPath === '/' ? 'index.html' : urlPath);
  filePath = path.normalize(filePath);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.statusCode = 403;
    res.end('Forbidden');
    return;
  }

  const ext = path.extname(filePath);
  const mime = MIME[ext] ?? 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) { res.statusCode = 404; res.end('Not Found'); return; }
    res.setHeader('Content-Type', mime);
    res.end(data);
  });
}

// ─── HTTP + WebSocket ───────────────────────────────────────────────────────

const server = http.createServer(async (req, res) => {
  if (req.url === '/sonos-event' && req.method === 'NOTIFY') {
    const body = await readBody(req);
    monitor.handleSonosEvent(body);
    res.statusCode = 200;
    res.end();
    return;
  }

  if (req.url?.startsWith('/api/')) {
    const handled = await handleApi(req, res);
    if (!handled) json(res, { error: 'Not found' }, 404);
    return;
  }

  serveStatic(req, res);
});

const wss = new WebSocketServer({ server });
wss.on('connection', (ws) => monitor.addListener(ws));

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
