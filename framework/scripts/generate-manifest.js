#!/usr/bin/env node
/**
 * סקריפט יצירת מניפסט ה-API
 * סורק את framework/src/ ומחלץ JSDoc + ייצואים לכל מודול
 * מייצר dist/api-manifest.json לשימוש ה-Creator
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, relative, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SRC_DIR  = join(__dirname, '..', 'src');
const OUT_FILE = join(__dirname, '..', 'dist', 'api-manifest.json');

/** Recursively collect all .js files (excluding index.js) */
function collectJsFiles(dir, results = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      collectJsFiles(full, results);
    } else if (entry.endsWith('.js') && entry !== 'index.js') {
      results.push(full);
    }
  }
  return results;
}

/** Extract the first block JSDoc comment */
function extractJSDoc(src) {
  const match = src.match(/^\/\*\*([\s\S]*?)\*\//);
  if (!match) return '';
  return match[1]
    .split('\n')
    .map(l => l.replace(/^\s*\*\s?/, ''))
    .join('\n')
    .trim();
}

/** Extract export names */
function extractExports(src) {
  const exports = [];
  // export function / export class / export const
  const re = /^export\s+(?:async\s+)?(?:function|class|const|let|var)\s+(\w+)/gm;
  let m;
  while ((m = re.exec(src)) !== null) {
    exports.push(m[1]);
  }
  // named export { ... }
  const namedRe = /^export\s*\{([^}]+)\}/gm;
  while ((m = namedRe.exec(src)) !== null) {
    m[1].split(',').forEach(name => {
      const clean = name.trim().split(' as ')[0].trim();
      if (clean) exports.push(clean);
    });
  }
  return [...new Set(exports)];
}

const files = collectJsFiles(SRC_DIR);
const modules = files.map(file => {
  const src = readFileSync(file, 'utf-8');
  const path = relative(SRC_DIR, file).replace(/\\/g, '/');
  return {
    path,
    description: extractJSDoc(src),
    exports: extractExports(src),
  };
});

const manifest = {
  generatedAt: new Date().toISOString(),
  version: '1.0.0',
  modules,
};

writeFileSync(OUT_FILE, JSON.stringify(manifest, null, 2), 'utf-8');
console.log(`✅ api-manifest.json generated — ${modules.length} modules`);
