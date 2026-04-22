/**
 * בדיקת עשן למשחקים
 *
 * משחקים מייבאים מהגרסה הבנויה `framework/dist/alefbet.js` ולא מקוד המקור.
 * בלי בדיקה כזו, שינוי שם של export ב-`framework/src/index.ts` יגרום לכל
 * הבדיקות להעבור (הן מייבאות מהמקור) בזמן שהמשחק שהשתמש בשם הישן נשבר
 * בשקט — עד שמישהו פותח אותו בדפדפן.
 *
 * הבדיקה מאמתת:
 *   1) מבנה ה-HTML של כל משחק (מקום עגינה, import תקין).
 *   2) `game.js` של המשחק נטען ללא שגיאה ומייצא `startGame`.
 *   3) **כל שם שה-game מיבא מ-`framework/dist/alefbet.js` אכן קיים שם.**
 *      נדרש במפורש כי Vitest/Vite משתמשים ב-SSR transform שהופך named
 *      imports חסרים ל-undefined במקום לזרוק. בלי בדיקה זו שינוי שם של
 *      export ב-index.ts יעבור בשקט.
 *
 * הבדיקה *לא* קוראת ל-startGame: ריצה אמיתית תדרוש mocks לחבילה המלאה,
 * וזה פרויקט גדול בנפרד (ראה TESTING-REVIEW.md).
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { readFile, readdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const GAMES_DIR = resolve(dirname(__filename), '..', '..', '..', 'games');
const DIST_PATH = '../../dist/alefbet.js';

const entries = await readdir(GAMES_DIR, { withFileTypes: true });
const games = entries
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  .sort();

/**
 * Extract the named imports a game pulls from `framework/dist/alefbet.js`.
 * Matches `import { a, b, c } from '../../framework/dist/alefbet.js';` with
 * any whitespace / newlines. Returns [] if the game doesn't import from dist.
 */
function parseFrameworkImports(source) {
  const re = /import\s*\{([^}]+)\}\s*from\s*['"][^'"]*framework\/dist\/alefbet\.js['"]/;
  const m = source.match(re);
  if (!m) return [];
  return m[1]
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    // handle `foo as bar` — we check the source name on the LHS
    .map((s) => s.split(/\s+as\s+/)[0].trim());
}

describe('games smoke test', () => {
  it('discovered at least one game (sanity: scan ran)', () => {
    expect(games.length).toBeGreaterThan(0);
  });

  for (const name of games) {
    describe(name, () => {
      beforeEach(() => {
        document.body.innerHTML = '';
      });

      it('index.html has the expected structure', async () => {
        const html = await readFile(resolve(GAMES_DIR, name, 'index.html'), 'utf8');
        expect(html, 'missing dir="rtl"').toMatch(/dir="rtl"/);
        expect(html, 'missing link to built CSS').toMatch(/alefbet\.css/);
        expect(html, 'missing #game mount element').toMatch(/<div\s+id="game">/);
        expect(html, 'missing startGame import from ./game.js').toMatch(
          /import\s*\{\s*startGame\s*\}\s*from\s*['"]\.\/game\.js['"]/,
        );
      });

      it('game.js loads and exports startGame', async () => {
        const mod = await import(`../../../games/${name}/game.js`);
        expect(typeof mod.startGame).toBe('function');
      });

      it('every framework symbol imported by the game exists on the dist bundle', async () => {
        const gameSource = await readFile(resolve(GAMES_DIR, name, 'game.js'), 'utf8');
        const imports = parseFrameworkImports(gameSource);

        // Template may have no framework imports; other games must have some.
        if (name !== '_template') {
          expect(imports.length, `${name}/game.js imports nothing from the dist`).toBeGreaterThan(0);
        }

        const dist = await import(DIST_PATH);
        const missing = imports.filter((sym) => !(sym in dist));
        expect(missing, `missing from framework/dist/alefbet.js: ${missing.join(', ')}`).toEqual([]);
      });
    });
  }
});
