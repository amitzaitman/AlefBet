import { defineConfig } from 'vite';
import { writeReleaseManifest } from '../scripts/build-release.js';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  build: {
    lib: {
      entry: {
        runtime: resolve(root, 'src/runtime/index.ts'),
        editor: resolve(root, 'src/editor/index.ts'),
      },
      formats: ['es'],
      fileName: (_format, name) => `${name}.js`,
    },
    cssCodeSplit: true,
    outDir: 'dist',
    emptyOutDir: false,
    rollupOptions: {
      output: { assetFileNames: '[name][extname]' },
    },
  },
  plugins: [{
    name: 'runtime-precache',
    closeBundle() { writeReleaseManifest(resolve(root, '..')); },
    generateBundle(_options, bundle) {
      const files = new Set();
      const visit = name => {
        if (files.has(name)) return;
        files.add(name);
        const item = bundle[name];
        if (item?.type === 'chunk') {
          item.imports.forEach(visit);
          item.viteMetadata?.importedCss?.forEach(visit);
          item.viteMetadata?.importedAssets?.forEach(visit);
        }
      };
      visit('runtime.js');
      // Dynamic editor dependencies are cached on first use, never required for play.
      this.emitFile({ type: 'asset', fileName: 'runtime-assets.js',
        source: `self.ALEFBET_RUNTIME_ASSETS = ${JSON.stringify([...files].sort())};\n` });
    },
  }],
});
