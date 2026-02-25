#!/usr/bin/env node
/**
 * AlefBet — Local Game Server
 * Serves all games statically and opens the browser automatically.
 * No external dependencies — works with Node.js out of the box.
 *
 * Usage:
 *   node start.js            (default port 8080)
 *   node start.js 3000       (custom port)
 */

import { createServer } from 'http';
import { readFileSync, existsSync, statSync } from 'fs';
import { join, extname, normalize } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { exec } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
let PORT = parseInt(process.argv[2] ?? '8080', 10);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.mjs':  'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff2':'font/woff2',
  '.woff': 'font/woff',
  '.ttf':  'font/ttf',
};

function resolvePath(urlPath) {
  // Sanitize: remove query string, normalize, prevent path traversal
  const clean = normalize(urlPath.split('?')[0].split('#')[0]).replace(/^[/\\]+/, '');
  const abs = join(__dirname, clean);

  // Must stay inside the project root
  if (!abs.startsWith(__dirname)) return null;

  if (existsSync(abs)) {
    const stat = statSync(abs);
    if (stat.isDirectory()) {
      const index = join(abs, 'index.html');
      return existsSync(index) ? index : null;
    }
    return abs;
  }
  return null;
}

const server = createServer((req, res) => {
  const urlPath = req.url === '/' ? '/index.html' : req.url;
  const filePath = resolvePath(urlPath);

  if (!filePath) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end(`404 — not found: ${req.url}`);
    return;
  }

  try {
    const ext = extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const data = readFileSync(filePath);
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache',
    });
    res.end(data);
  } catch {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('500 — server error');
  }
});

function listen(port) {
  server.once('error', err => {
    if (err.code === 'EADDRINUSE') {
      listen(port + 1);
    } else {
      console.error('\n  Server error:', err.message, '\n');
      process.exit(1);
    }
  });

  server.listen(port, '127.0.0.1', () => {
    PORT = port;
    const url = `http://localhost:${port}`;

    console.log('');
    console.log('  ╔══════════════════════════════════════╗');
    console.log('  ║   AlefBet — Hebrew Educational Games ║');
    console.log('  ╠══════════════════════════════════════╣');
    console.log(`  ║   Open:  ${url.padEnd(30)}║`);
    console.log('  ║   Stop:  Ctrl + C                    ║');
    console.log('  ╚══════════════════════════════════════╝');
    console.log('');

    // Auto-open browser
    let openCmd;
    if (process.platform === 'win32') {
      openCmd = `start "" "${url}"`;
    } else if (process.platform === 'darwin') {
      openCmd = `open "${url}"`;
    } else {
      // WSL / Linux — try Windows browser via explorer.exe
      openCmd = `explorer.exe "${url}" 2>/dev/null || xdg-open "${url}" 2>/dev/null || true`;
    }

    exec(openCmd, err => {
      if (err) {
        console.log(`  Could not open browser automatically.`);
        console.log(`  Please open ${url} manually.\n`);
      }
    });
  });
}

listen(PORT);
