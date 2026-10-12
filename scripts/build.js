import { rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';

// One release: never include leftover chunks from a prior build.
const root = fileURLToPath(new URL('../framework/', import.meta.url));
rmSync(new URL('../framework/dist/', import.meta.url), { recursive: true, force: true });
await build({ root, configFile: fileURLToPath(new URL('../framework/vite.runtime.config.js', import.meta.url)) });
