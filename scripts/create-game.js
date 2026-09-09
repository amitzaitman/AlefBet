import { mkdirSync, readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';

/** Creates a runnable game and registers it. Invalid/duplicate IDs never overwrite work. */
export function createGame(root, id, title = id) {
  if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(id ?? '')) {
    throw new Error('Use a game ID such as make-ten (lowercase letters, digits and hyphens).');
  }
  const destination = resolve(root, 'games', id);
  const catalogPath = resolve(root, 'games/catalog.js');
  const original = readFileSync(catalogPath, 'utf8');
  const context = { self: {} };
  runInNewContext(original, context);
  const catalog = context.self.ALEFBET_CATALOG;
  if (existsSync(destination) || catalog.some(game => game.id === id)) {
    throw new Error(`Game already exists: ${id}`);
  }
  const escapeHtml = text => text.replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char]);
  const files = Object.fromEntries(['index.html', 'game.js', 'game.css'].map(file => {
    let content = readFileSync(resolve(root, 'games/_template', file), 'utf8');
    if (file === 'game.js') content = content.replace("'template-game'", JSON.stringify(id))
      .replace("'שֵׁם הַמִּשְׂחָק'", JSON.stringify(title));
    if (file === 'index.html') content = content.replace('<title>מִשְׂחָק</title>', `<title>${escapeHtml(title)}</title>`);
    return [file, content];
  }));
  const entry = { id, title, desc: 'משחק חדש', kind: 'game', icon: '🎲', play: 'שחקו עכשיו ▶' };
  // Preserve the existing comments and formatting instead of rewriting the catalog.
  const marker = 'root.ALEFBET_CATALOG = [';
  if (!original.includes(marker)) throw new Error('Catalog assignment not found. No files changed.');
  const updated = original.replace(marker, `${marker}\n    ${JSON.stringify(entry, null, 6)},`);
  mkdirSync(destination);
  try {
    for (const [file, content] of Object.entries(files)) writeFileSync(resolve(destination, file), content);
    writeFileSync(catalogPath, updated);
  } catch (error) {
    rmSync(destination, { recursive: true, force: true });
    throw error;
  }
  return destination;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
    const [, , id, ...words] = process.argv;
    createGame(root, id, words.join(' ') || id);
    console.log(`Created games/${id}/ and registered it in the catalog.\nRun node start.js, then open /games/${id}/.\nBefore pushing: npm run check && npm run build && npm run e2e`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
