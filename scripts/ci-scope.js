import { appendFileSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Repeated upgrade tests are useful when offline behavior or its packaging changes. */
export function needsStability(paths) {
  return paths.some(path => !path.endsWith('.md') && (
    path === 'sw.js' || path === 'games/catalog.js' || path === 'manifest.webmanifest' ||
    /^scripts\/(build|ci-scope|check-dist).*\.js$/.test(path) ||
    /^framework\/vite.*\.js$/.test(path) ||
    /^framework\/src\/core\/(bootstrap|editor-storage|game-data|lazy-editor)\./.test(path) ||
    /^e2e\/(pwa.*|network.*)\.js$/.test(path) ||
    /(^|\/)package(-lock)?\.json$/.test(path) ||
    path === 'playwright.config.js' || path.startsWith('.github/')
  ));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let stability = true; // Manual/scheduled runs and missing history use the full check.
  const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));
  const kind = process.env.GITHUB_EVENT_NAME;
  if (kind === 'pull_request' || kind === 'push') {
    const base = kind === 'pull_request' ? event.pull_request.base.sha : event.before;
    const head = kind === 'pull_request' ? event.pull_request.head.sha : event.after;
    try {
      if (!/^[a-f0-9]{40}$/.test(base) || /^0+$/.test(base) || !/^[a-f0-9]{40}$/.test(head)) {
        throw new Error('No comparable history');
      }
      const range = kind === 'pull_request' ? `${base}...${head}` : `${base}..${head}`;
      const paths = execFileSync('git', ['diff', '--name-only', range], { encoding: 'utf8' }).trim().split('\n');
      stability = needsStability(paths);
    } catch {
      console.warn('Cannot compare revisions; running repeated offline checks.');
    }
  }
  appendFileSync(process.env.GITHUB_OUTPUT, `stability=${stability}\n`);
  console.log(`Repeated offline checks: ${stability}`);
}
