import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  resolve: {
    // Allow imports with .js extension to resolve .ts files (enables
    // gradual JS→TS migration without updating every import path).
    extensions: ['.ts', '.js', '.json', '.css'],
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.{js,ts}'],
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
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
