import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

/**
 * The math pilot: a standalone Svelte app with its own shell, styles and fonts.
 * base './' lets one build run from the dev server at /math-pilot/dist/ and
 * from GitHub Pages at /math-pilot/.
 */
export default defineConfig(({ command }) => ({
  base: './',
  plugins: [svelte({
    configFile: false,
    compilerOptions: { runes: true },
    // Svelte's compiler is the pilot's linter for components: a warning
    // (accessibility, unused CSS, a stale prop) fails the build.
    onwarn(warning, handler) {
      if (command !== 'build') { handler(warning); return; }
      const where = warning.filename ? `${warning.filename}:${warning.start?.line ?? '?'} ` : '';
      throw new Error(`${where}${warning.code}: ${warning.message}`);
    },
  })],
  build: { outDir: 'dist', emptyOutDir: true },
  test: { include: ['tests/**/*.test.js'] },
}));
