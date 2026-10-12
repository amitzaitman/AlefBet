/**
 * build-release.js - כל קובץ בתיקיית משחק נכנס לגרסה ונשמר לאופליין,
 * כך שמשחק יכול להחזיק מודולים ונכסים משלו ליד game.js.
 */
import { describe, it, expect, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runInNewContext } from 'node:vm';
import { writeReleaseManifest } from '../../../scripts/build-release.js';

let root;
afterEach(() => { if (root) rmSync(root, { recursive: true, force: true }); });

/** @param {string} path @param {string} [content] */
function put(path, content = path) {
  mkdirSync(join(root, path, '..'), { recursive: true });
  writeFileSync(join(root, path), content);
}

function buildSite() {
  root = mkdtempSync(join(tmpdir(), 'alefbet-release-'));
  for (const path of ['index.html', 'manifest.webmanifest', 'sw.js', 'framework/dist/runtime.js',
    'assets/icons/icon-192.png', 'assets/icons/icon-512.png', 'assets/icons/apple-touch-icon.png']) put(path);
  put('framework/dist/runtime-assets.js', "self.ALEFBET_RUNTIME_ASSETS = ['runtime.js'];");
  put('games/catalog.js', "self.ALEFBET_CATALOG = [{ id: 'story' }];");
  for (const path of ['index.html', 'game.js', 'game.css', 'scene.js', 'art/balloon.svg', '.DS_Store']) put(`games/story/${path}`);
  writeReleaseManifest(root);
  const context = { self: {} };
  runInNewContext(readFileSync(join(root, 'framework/dist/release-manifest.js'), 'utf8'), context);
  return context.self.ALEFBET_RELEASE;
}

describe('release manifest', () => {
  it('precaches every file a game folder ships, including subfolders', () => {
    const { core, assets } = buildSite();
    for (const path of ['./games/story/', './games/story/index.html', './games/story/game.js',
      './games/story/game.css', './games/story/scene.js', './games/story/art/balloon.svg']) {
      expect(core).toContain(path);
      expect(assets[path]).toMatch(/^[0-9a-f]{64}$/);
    }
    // Hidden files are never deployed content.
    expect(core.some(path => path.includes('.DS_Store'))).toBe(false);
  });
});
