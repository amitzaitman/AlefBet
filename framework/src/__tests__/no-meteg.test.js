import { it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname, relative } from 'path';

/**
 * Scan source files for meteg (U+05BD) — a cantillation mark that causes
 * font fallback in Heebo. It must never appear in source code.
 */
const PROJECT_ROOT = join(import.meta.dirname, '..', '..', '..');
const SKIP_DIRS = new Set(['node_modules', 'dist', '.a5c', '.git', '.claude']);
const SCAN_EXTENSIONS = new Set(['.js', '.html', '.css', '.json']);
const METEG = '\u05BD';

/** @param {string} dir @returns {string[]} */
function collectFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = join(dir, entry.name);
    const isDir = entry.isDirectory() || (entry.isSymbolicLink() && statSync(full).isDirectory());
    if (isDir) return SKIP_DIRS.has(entry.name) ? [] : collectFiles(full);
    return SCAN_EXTENSIONS.has(extname(entry.name)) ? [full] : [];
  });
}

it('no source file contains meteg (U+05BD), scanning at least 10 files', () => {
  const files = [
    ...collectFiles(join(PROJECT_ROOT, 'framework/src')),
    ...collectFiles(join(PROJECT_ROOT, 'games')),
    join(PROJECT_ROOT, 'index.html'),
  ];
  expect(files.length).toBeGreaterThanOrEqual(10);
  const violations = files.flatMap(file => {
    const lineNums = readFileSync(file, 'utf-8').split('\n').flatMap((line, i) => (line.includes(METEG) ? [i + 1] : []));
    return lineNums.length ? [`${relative(PROJECT_ROOT, file)} (lines: ${lineNums.join(', ')})`] : [];
  });
  expect(violations, `Meteg (U+05BD) found in:\n${violations.join('\n')}`).toHaveLength(0);
});
