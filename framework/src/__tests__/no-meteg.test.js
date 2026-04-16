import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

/**
 * Scan source files for meteg (U+05BD) — a cantillation mark that causes
 * font fallback in Heebo. It must never appear in source code.
 */

const PROJECT_ROOT = join(import.meta.dirname, '..', '..', '..');
const SCAN_DIRS = ['framework/src', 'games', 'apps'];
const SCAN_FILES = ['index.html'];
const SCAN_EXTENSIONS = new Set(['.js', '.html', '.css', '.json']);
const SKIP_DIRS = new Set(['node_modules', 'dist', '.a5c', '.git', '.claude']);
const METEG = '\u05BD';

function collectFiles(dir) {
  const files = [];
  let entries;
  try { entries = readdirSync(dir); } catch { return files; }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    let stat;
    try { stat = statSync(full); } catch { continue; }
    if (stat.isDirectory()) {
      files.push(...collectFiles(full));
    } else if (SCAN_EXTENSIONS.has(extname(entry))) {
      files.push(full);
    }
  }
  return files;
}

describe('no-meteg source guard', () => {
  const files = [];
  for (const d of SCAN_DIRS) {
    const full = join(PROJECT_ROOT, d);
    try {
      if (statSync(full).isDirectory()) files.push(...collectFiles(full));
    } catch { /* skip missing dirs */ }
  }
  for (const f of SCAN_FILES) {
    const full = join(PROJECT_ROOT, f);
    try {
      if (statSync(full).isFile()) files.push(full);
    } catch { /* skip missing files */ }
  }

  it('scans at least 10 source files', () => {
    expect(files.length).toBeGreaterThanOrEqual(10);
  });

  it('no source file contains meteg (U+05BD)', () => {
    const violations = [];
    for (const file of files) {
      const content = readFileSync(file, 'utf-8');
      if (content.includes(METEG)) {
        const lines = content.split('\n');
        const lineNums = [];
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes(METEG)) lineNums.push(i + 1);
        }
        const rel = file.replace(PROJECT_ROOT + '/', '');
        violations.push(`${rel} (lines: ${lineNums.join(', ')})`);
      }
    }
    expect(violations, `Meteg (U+05BD) found in:\n${violations.join('\n')}`).toHaveLength(0);
  });
});
