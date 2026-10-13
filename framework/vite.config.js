import { defineConfig } from 'vite';

// Test settings only. The release is built by vite.runtime.config.js.
export default defineConfig({
  test: {
    environment: 'jsdom',
    // vmForks makes jsdom setup cheap but crashes workers on Node 20, so older Node keeps forks.
    pool: Number(process.versions.node.split('.')[0]) >= 22 ? 'vmForks' : 'forks',
    include: ['src/**/*.test.{js,ts}'],
    setupFiles: ['src/__tests__/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{js,ts}'],
      exclude: [
        'src/**/*.test.*',
        'src/__tests__/**',
      ],
    },
  },
});
