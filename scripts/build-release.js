import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { runInNewContext } from 'node:vm';

/**
 * Every file in a game folder is part of the release, so a game can keep its
 * own modules and assets next to game.js and still play offline.
 */
function gameFiles(root, id) {
  const list = dir => readdirSync(resolve(root, dir), { withFileTypes: true })
    .filter(entry => !entry.name.startsWith('.'))
    .flatMap(entry => (entry.isDirectory() ? list(`${dir}/${entry.name}`) : [`./${dir}/${entry.name}`]));
  return list(`games/${id}`);
}

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
    ...context.self.ALEFBET_CATALOG.flatMap(({ id }) => [`./games/${id}/`, ...gameFiles(root, id)]),
  ].sort();
  const assets = Object.fromEntries(core.map(path => [
    path, digest(read(path.endsWith('/') ? `${path}index.html` : path)),
  ]));
  const version = digest(JSON.stringify({ core, assets }) + read('sw.js').toString());
  writeFileSync(resolve(root, 'framework/dist/release-manifest.js'),
    `self.ALEFBET_RELEASE = ${JSON.stringify({ version, core, assets }, null, 2)};\n`);
}
