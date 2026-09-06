# AlefBet — notes for Claude / coding agents

Hebrew-literacy games for ages 3–8. Vanilla JS + Vite library build, no runtime framework. Each game is a standalone folder that imports the shared framework bundle.

## The one invariant rule

**Grow the framework; don't hardcode in games.** If a game needs functionality that doesn't exist in `framework/src/`, add it there as a named-export module and re-export it from `framework/src/index.ts`. Reuse beats duplication — every new game should leave the framework richer.

## Infra changes

Read [`MIGRATION.md`](./MIGRATION.md) before touching build, `sw.js`, `framework/src/index.ts`, or more than one `games/*/game.js` in the same PR.

- Two contracts in parallel until the old one is dead: games still import `framework/dist/alefbet.js` + `bootstrapGame`; the new contract (runtime entry + `runGame`) lands game-by-game.
- One step per branch. `npm run check` + the touched game's e2e must pass. Merge to `main` so Pages stays shippable.
- Do **not** start with a Vite multi-page rewrite of the site. That is step 5, last on purpose.
- Do **not** convert runtime JS to TypeScript "while the file is open". Separate PR, never required.
- Do **not** land a BACKLOG feature (puzzle, student tracking, ZIP export) inside a migration PR.
- After every merge to `main`: one real phone, offline, one game end-to-end including audio. Audio+iOS is the dangerous refactor here, not folder layout.

## Layout

```
framework/src/
  core/      EventBus, GameState, GameShell, round-manager, local-state, bootstrap
  audio/     hebrew-audio, tts, phoneme-synth, audio-context, vowel-detector,
             sound-bank-compiler, sounds, voice-recorder, voice-store
  data/      hebrew-letters, nikud, encouragement
  ui/        option-cards, progress-bar, feedback, zones, completion, ...
  render/    animations
  input/     drag
  utils/     nakdan (Dicta auto-vowelization)
  editor/    in-browser game/zone editor (TypeScript + zod)
  styles/    alefbet.css
  index.ts   the public API — re-export every new module from here
  __tests__/ vitest suites

games/<name>/     index.html + game.js + game.css  (single-screen games)
e2e/              Playwright specs, one per live game + pwa
deploy/           Cloudflare Worker (Nakdan proxy) + infra
```

There is no `audio/speech-recognition.js`. Pronunciation games use `audio/vowel-detector.js`.

## Build contract

- Games load from `../../framework/dist/alefbet.js` (a committed artifact).
- **After editing `framework/src/`, run `npm run build`** or games won't see the change. `framework/dist/` is committed on purpose so games open without a build step. Un-committing it is migration step 5, not a drive-by.
- Dev server: `node start.js` (or double-click `start.bat` on Windows). Node 20+.

## Commands

- `npm run check` — lint + typecheck + tests. CI runs this; make it pass before pushing.
- `npm run lint` — ESLint over the whole repo (config: `eslint.config.js`).
- `npm run typecheck` — `tsc --noEmit` over `framework/src/`. `checkJs` is on, so JSDoc types are checked.
- `npm test` — vitest suites in `framework/src/__tests__/`.
- `npm run build` — rebuild `framework/dist/`.
- `npx playwright test` — e2e. In managed environments: `PW_CHROMIUM_PATH=/opt/pw-browsers/chromium`.

## Conventions

- **JavaScript by default.** The small number of TypeScript files in `framework/src/editor/` + `framework/src/index.ts` exist because the editor uses zod schemas that emit types; don't spread TS elsewhere without reason.
- **JSDoc types** on framework JS files — `tsc --noEmit` type-checks them via `checkJs: true`. Add `@param`, `@returns`, and `@template` where it helps the type-check.
- Vite's resolver maps `.js` imports to `.ts` files, so importers always write `./foo.js` regardless of the target's extension.
- **Named exports only** — no default exports anywhere.
- **Hebrew JSDoc prose** on framework modules, explaining purpose + public API. Avoid em-dash (`—`) in JSDoc type/param lines — it breaks the TS JSDoc parser; use `-`.
- **RTL** everywhere; buttons ≥ 64px for the young end of the age range.
- **No meteg (U+05BD)** in source — a guard test fails if one sneaks in (see `framework/src/__tests__/no-meteg.test.js`).

## Adding things

- **New game:** copy `games/_template/` → edit `game.js` → add one row to `games/catalog.js`. The home page and the service worker both read that file. Do not also edit `index.html` or a `GAMES` list in `sw.js`.
- **New framework module:** put it under the right `framework/src/<category>/`, export from `index.ts`, add CSS to `styles/alefbet.css` if it renders, add a vitest in `__tests__/`, then `npm run build`.

## Deploy

Pushing to `main` triggers `.github/workflows/deploy.yml`, which serves `index.html`, `games/`, and `framework/dist/` from GitHub Pages.
