import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { runInNewContext } from 'node:vm';

/** Deterministic release identity covers deployed content and worker behavior. */
export function writeReleaseManifest(root) {
  const read = path => readFileSync(resolve(root, path));
  const digest = data => createHash('sha256').update(data).digest('hex');
  const context = { self: {} };
  runInNewContext(read('games/catalog.js').toString(), context);
  runInNewContext(read('framework/dist/runtime-assets.js').toString(), context);
  const core = [
    './', './index.html', './games/catalog.js', './manifest.webmanifest',
    './assets/icons/icon-192.png', './assets/icons/icon-512.png', './assets/icons/apple-touch-icon.png',
    './framework/dist/runtime-assets.js',
    ...context.self.ALEFBET_RUNTIME_ASSETS.map(file => `./framework/dist/${file}`),
    ...context.self.ALEFBET_CATALOG.flatMap(({ id }) => [
      `./games/${id}/`, `./games/${id}/index.html`, `./games/${id}/game.js`, `./games/${id}/game.css`,
    ]),
  ].sort();
  // Optional editor assets are verified on first use, but never downloaded for play.
  const optional = readdirSync(resolve(root, 'framework/dist'))
    .filter(file => /\.(js|css)$/.test(file) && !file.startsWith('alefbet.') && file !== 'release-manifest.js')
    .map(file => `./framework/dist/${file}`);
  const assets = Object.fromEntries([...new Set([...core, ...optional])].sort().map(path => [
    path, digest(read(path.endsWith('/') ? `${path}index.html` : path)),
  ]));
  const version = digest(JSON.stringify({ core, assets }) + read('sw.js').toString());
  writeFileSync(resolve(root, 'framework/dist/release-manifest.js'),
    `self.ALEFBET_RELEASE = ${JSON.stringify({ version, core, assets }, null, 2)};\n`);
}
