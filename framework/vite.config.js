import { defineConfig } from 'vite';

// Test settings only. The release is built by vite.runtime.config.js.
export default defineConfig({
  resolve: {
    // Allow imports with .js extension to resolve .ts files (enables
    // gradual JS→TS migration without updating every import path).
    extensions: ['.ts', '.js', '.json', '.css'],
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{js,ts}'],
    setupFiles: ['src/__tests__/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{js,ts}'],
      exclude: [
        'src/**/*.test.*',
        'src/__tests__/**',
        'src/editor/**/*.ts',
      ],
    },
  },
});
