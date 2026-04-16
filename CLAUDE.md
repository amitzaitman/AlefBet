# AlefBet — notes for Claude / coding agents

Hebrew-literacy games for ages 3–8. Vanilla JS + Vite library build, no runtime framework. Each game is a standalone folder that imports the shared framework bundle.

## The one invariant rule

**Grow the framework; don't hardcode in games.** If a game needs functionality that doesn't exist in `framework/src/`, add it there as a named-export module and re-export it from `framework/src/index.ts`. Reuse beats duplication — every new game should leave the framework richer.

## Layout

```
framework/src/
  core/      EventBus, GameState, GameShell, round-manager, local-state
  audio/     tts, sounds, speech-recognition, voice-recorder, voice-store
  data/      hebrew-letters, nikud
  ui/        option-cards, progress-bar, feedback, zones, completion, ...
  render/    animations
  input/     drag
  utils/     nakdan (Dicta auto-vowelization)
  editor/    in-browser game/zone editor (TypeScript)
  styles/    alefbet.css
  index.ts   the public API — re-export every new module from here
  __tests__/ vitest suites

games/<name>/     index.html + game.js + game.css  (single-screen games)
apps/<name>/      larger multi-page apps (e.g. passover-cleaning)
deploy/           Cloudflare Worker (Nakdan proxy) + infra
```

## Build contract

- Games load from `../../framework/dist/alefbet.js` (a committed artifact).
- **After editing `framework/src/`, run `npm run build`** or games won't see the change. `framework/dist/` is committed on purpose so games open without a build step.
- Dev server: `node start.js` (or double-click `start.bat` on Windows).

## Commands

- `npm run check` — lint + typecheck + tests. CI runs this; make it pass before pushing.
- `npm run lint` — ESLint over the whole repo (config: `eslint.config.js`).
- `npm run typecheck` — `tsc --noEmit` over `framework/src/`. `checkJs` is on, so JSDoc types are checked.
- `npm test` — vitest suites in `framework/src/__tests__/`.
- `npm run build` — rebuild `framework/dist/`.

## Conventions

- **JavaScript by default.** The small number of TypeScript files in `framework/src/editor/` + `framework/src/index.ts` exist because the editor uses zod schemas that emit types; don't spread TS elsewhere without reason.
- **JSDoc types** on framework JS files — `tsc --noEmit` type-checks them via `checkJs: true`. Add `@param`, `@returns`, and `@template` where it helps the type-check.
- Vite's resolver maps `.js` imports to `.ts` files, so importers always write `./foo.js` regardless of the target's extension.
- **Named exports only** — no default exports anywhere.
- **Hebrew JSDoc prose** on framework modules, explaining purpose + public API. Avoid em-dash (`—`) in JSDoc type/param lines — it breaks the TS JSDoc parser; use `-`.
- **RTL** everywhere; buttons ≥ 64px for the young end of the age range.
- **No meteg (U+05BD)** in source — a guard test fails if one sneaks in (see `framework/src/__tests__/no-meteg.test.js`).

## Adding things

- **New game:** copy `games/_template/` → edit `game.js` → add a card in the root `index.html`.
- **New framework module:** put it under the right `framework/src/<category>/`, export from `index.ts`, add CSS to `styles/alefbet.css` if it renders, add a vitest in `__tests__/`, then `npm run build`.

## Deploy

Pushing to `main` triggers `.github/workflows/deploy.yml`, which serves `index.html`, `games/`, `apps/`, and `framework/dist/` from GitHub Pages.
