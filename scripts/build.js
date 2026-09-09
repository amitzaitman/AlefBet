import { rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';

// Both bundles form one release. Never include leftover chunks from a prior build.
const root = fileURLToPath(new URL('../framework/', import.meta.url));
rmSync(new URL('../framework/dist/', import.meta.url), { recursive: true, force: true });
for (const config of ['vite.config.js', 'vite.runtime.config.js']) {
  await build({ root, configFile: fileURLToPath(new URL(`../framework/${config}`, import.meta.url)) });
}
