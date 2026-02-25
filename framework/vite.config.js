import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'AlefBet',
      fileName: 'alefbet',
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      output: {
        assetFileNames: 'alefbet.[ext]',
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
});
