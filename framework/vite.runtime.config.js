import { defineConfig } from 'vite';
import { writeReleaseManifest } from '../scripts/build-release.js';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  build: {
    lib: {
      entry: {
        runtime: resolve(root, 'src/runtime/index.js'),
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
      // Library mode inlines every url() in CSS. The fonts go back to separate files, so
      // runtime.css stays small and text paints before they arrive (font-display: swap).
      const css = bundle['runtime.css'];
      const fonts = resolve(root, 'src/styles/fonts');
      const fontFiles = readdirSync(fonts).map(name => {
        const data = readFileSync(resolve(fonts, name));
        const inlined = `data:font/woff2;base64,${data.toString('base64')}`;
        if (css?.type !== 'asset' || typeof css.source !== 'string' || !css.source.includes(inlined)) {
          this.error(`runtime.css does not inline ${name} as expected`);
        }
        css.source = css.source.replaceAll(inlined, `./fonts/${name}`);
        this.emitFile({ type: 'asset', fileName: `fonts/${name}`, source: data });
        return `fonts/${name}`;
      });
      const files = new Set(fontFiles);
      const visit = name => {
        if (files.has(name)) return;
        files.add(name);
        const item = bundle[name];
        if (item?.type === 'chunk') {
          item.imports.forEach(visit);
          // A chunk loaded on demand still has to be precached for offline play.
          item.dynamicImports.forEach(visit);
          item.viteMetadata?.importedCss?.forEach(visit);
          item.viteMetadata?.importedAssets?.forEach(visit);
        }
      };
      visit('runtime.js');
      this.emitFile({ type: 'asset', fileName: 'runtime-assets.js',
        source: `self.ALEFBET_RUNTIME_ASSETS = ${JSON.stringify([...files].sort())};\n` });
    },
  }],
});
