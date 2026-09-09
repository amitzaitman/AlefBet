// @vitest-environment node
import { it, expect } from 'vitest';
import { mkdtempSync, mkdirSync, cpSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runInNewContext } from 'node:vm';
import { createGame } from '../../../scripts/create-game.js';

it('creates a runnable registered game, escapes titles, and refuses duplicate/path IDs without changing files', () => {
  const root = mkdtempSync(join(tmpdir(), 'alefbet-scaffold-'));
  try {
    mkdirSync(join(root, 'games'));
    cpSync(new URL('../../../games/_template/', import.meta.url), join(root, 'games/_template'), { recursive: true });
    cpSync(new URL('../../../games/catalog.js', import.meta.url), join(root, 'games/catalog.js'));
    const title = 'תרגול "מספרים" <script>';
    const destination = createGame(root, 'test-math', title);
    expect(readFileSync(join(destination, 'game.js'), 'utf8')).toContain(JSON.stringify(title));
    expect(readFileSync(join(destination, 'index.html'), 'utf8')).toContain('&lt;script&gt;');
    const catalog = readFileSync(join(root, 'games/catalog.js'), 'utf8');
    const context = { self: {} };
    runInNewContext(catalog, context);
    expect(context.self.ALEFBET_CATALOG.filter(g => g.id === 'test-math')).toHaveLength(1);
    for (const id of ['test-math', '../escape', '', '_template', 'UPPER']) {
      expect(() => createGame(root, id)).toThrow();
      expect(readFileSync(join(root, 'games/catalog.js'), 'utf8')).toBe(catalog);
    }
    expect(existsSync(join(root, 'escape'))).toBe(false);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
