import { it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const SOURCE = new Set(['.js', '.svelte', '.css', '.html']);

/** @param {string} dir @returns {string[]} */
const sources = dir => readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
  const path = join(dir, entry.name);
  if (entry.isDirectory()) return sources(path);
  return SOURCE.has(extname(entry.name)) ? [path] : [];
});
const files = [...sources(join(ROOT, 'src')), join(ROOT, 'index.html')];

it('scans the pilot sources', () => {
  expect(files.length).toBeGreaterThanOrEqual(10);
});

it('has no meteg (U+05BD): it makes the fonts fall back', () => {
  const found = files.filter(file => readFileSync(file, 'utf8').includes('ֽ'));
  expect(found.map(file => relative(ROOT, file))).toEqual([]);
});

it('writes every Hebrew word with nikud, since children read it', () => {
  // A word is two or more Hebrew letters; nikud and the geresh-like marks may sit between them.
  const word = /[א-ת][ְ-ׇא-ת]*[א-ת][ְ-ׇ]*/g;
  const bare = files.flatMap(file => (readFileSync(file, 'utf8').match(word) ?? [])
    .filter(found => !/[ְ-ׇּׁׂ]/.test(found))
    .map(found => `${relative(ROOT, file)}: ${found}`));
  expect(bare).toEqual([]);
});
