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
- Tests: `npm test` from the repo root.
- Dev server: `node start.js` (or double-click `start.bat` on Windows).

## Conventions

- **JS by default**, TypeScript only where it already exists (primarily `framework/src/editor/` and `index.ts`). Vite's resolver maps `.js` imports to `.ts` files, so importers never change extensions.
- **Named exports only** — no default exports anywhere.
- **Hebrew JSDoc** on framework modules, explaining purpose + public API.
- **RTL** everywhere; buttons ≥ 64px for the young end of the age range.
- **No meteg (U+05BD)** in source — a guard test fails if one sneaks in (see `framework/src/__tests__/no-meteg.test.js`).

## Adding things

- **New game:** copy `games/_template/` → edit `game.js` → add a card in the root `index.html`.
- **New framework module:** put it under the right `framework/src/<category>/`, export from `index.ts`, add CSS to `styles/alefbet.css` if it renders, add a vitest in `__tests__/`, then `npm run build`.

## Deploy

Pushing to `main` triggers `.github/workflows/deploy.yml`, which serves `index.html`, `games/`, `apps/`, and `framework/dist/` from GitHub Pages.
