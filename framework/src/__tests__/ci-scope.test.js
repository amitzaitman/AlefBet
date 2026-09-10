// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { needsStability } from '../../../scripts/ci-scope.js';

describe('CI offline stability scope', () => {
  it.each(['sw.js', 'games/catalog.js', 'manifest.webmanifest', 'scripts/build-release.js',
    'framework/vite.runtime.config.js', 'framework/src/core/editor-storage.ts',
    'e2e/pwa-upgrade.spec.js', 'e2e/network-server.js', 'e2e/network-probe.js', 'e2e/network.spec.js', 'package-lock.json',
    'framework/package.json', '.github/workflows/ci.yml', 'playwright.config.js'])('repeats offline checks for %s', path => expect(needsStability([path])).toBe(true));
  it('keeps routine game and documentation changes lightweight', () => {
    expect(needsStability(['README.md', 'docs/adding-games.md', '.github/README.md',
      'games/make-ten/game.js', 'games/make-ten/game.css', 'e2e/math.spec.js',
      'framework/dist/release-manifest.js'])).toBe(false);
  });
  it('does not hide a sensitive change among ordinary changes', () => {
    expect(needsStability(['README.md', 'games/make-ten/game.js', 'sw.js'])).toBe(true);
  });
});
