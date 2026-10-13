# AlefBet — notes for Claude / coding agents

Hebrew-literacy games for ages 3–8. Vanilla JS + Vite library builds, no runtime framework. Each game is a standalone folder that imports the shared framework bundle.

## Shared code boundary

Keep game-specific rules and rendering in the game. Extract a shared named-export module when multiple games need the same behavior. `runGame` is optional composition for round-based games, not a requirement for every game or teacher tool. New games do not have to grow the framework.

## Infra changes

Read [`MIGRATION.md`](./MIGRATION.md) before touching build, `sw.js`, the framework entries in `framework/src/runtime/`, or more than one `games/*/game.js` in the same PR.

- Games import `framework/dist/runtime.js` (or `common.js`). There is no combined `alefbet.js`/UMD bundle, no in-browser editor and no saved round content: a game's rounds come from its own code.
- One step per branch. `npm run verify` must pass. Merge to `main` so Pages stays shippable.
- Do **not** start with a Vite multi-page rewrite of the site. That is step 5, last on purpose.
- Do **not** convert runtime JS to TypeScript "while the file is open". Separate PR, never required.
- Do **not** land a BACKLOG feature (puzzle, student tracking, ZIP export) inside a migration PR.
- After every merge to `main`: one real phone, offline, one game end-to-end including audio. Audio+iOS is the dangerous refactor here, not folder layout.

## Layout

```
framework/src/
  core/      EventBus, GameState, GameShell, round-manager, local-state, bootstrap
  audio/     hebrew-audio, tts, phoneme-synth, audio-context, sounds, voice-store
  data/      hebrew-letters, nikud, vowels, encouragement
  ui/        option-cards, progress-bar, feedback, completion, adult-tools, ...
  render/    animations
  input/     drag
  utils/     shuffle
  styles/    alefbet.css
  runtime/index.ts  public gameplay API
  runtime/common.ts general gameplay API (no Hebrew content)
  __tests__/ vitest suites

games/<name>/     index.html + game.js + game.css, plus any modules or assets the game owns
                  (every file in the folder is precached for offline play)
e2e/              Playwright specs, one per live game + pwa
```

There is no speech recognition module. nikud-speak owns its vowel detector (`games/nikud-speak/vowel-detector.js`); the sound studio owns recording.

## Build contract

- Games load `../../framework/dist/runtime.js` and `runtime.css` (committed artifacts).
- The runtime build generates `runtime-assets.js` from static dependencies and `release-manifest.js` with content hashes for deployed assets. Every cached asset must match the active release. Updates activate after old tabs close.
- **After editing site code or assets, run `npm run build`** to rebuild the framework and release manifest. `framework/dist/` is committed on purpose so games open without a build step. Un-committing it is migration step 5, not a drive-by.
- Dev server: `node start.js` (or double-click `start.bat` on Windows). Node 20+.

## Commands

- `npm run verify` — the full pre-push gate: checks, clean build and all browser tests. CI and deploy share `.github/actions/verify`.
- `npm run setup:browsers` — install Chromium/WebKit once and after Playwright updates.
- `npm run check` — fast lint + typecheck + unit tests during development.
- `npm run lint` — ESLint over the whole repo (config: `eslint.config.js`).
- `npm run typecheck` — `tsc --noEmit` over `framework/src/`. `checkJs` is on, so JSDoc types are checked.
- `npm test` — vitest suites in `framework/src/__tests__/`.
- `npm run build` — clean and rebuild `framework/dist/` (runtime, common) and the release manifest; removes obsolete chunks.
- `npm run e2e -- e2e/math.spec.js` — rebuild and run a focused browser test.
- `npm run verify:ci` — full verification plus a check for modified, staged or untracked dist files. Commit regenerated artifacts before running this CI-only check.
- Browser traces are saved under `test-results/games/`.

## Conventions

- **JavaScript by default.** A few `core`/`runtime` files are TypeScript for historical reasons; don't spread TS elsewhere without reason.
- **JSDoc types** on framework JS files — `tsc --noEmit` type-checks them via `checkJs: true`. Add `@param`, `@returns`, and `@template` where it helps the type-check.
- Vite's resolver maps `.js` imports to `.ts` files, so importers always write `./foo.js` regardless of the target's extension.
- **Named exports only** — no default exports anywhere.
- **Hebrew JSDoc prose** on framework modules, explaining purpose + public API. Avoid em-dash (`—`) in JSDoc type/param lines — it breaks the TS JSDoc parser; use `-`.
- **RTL** everywhere; buttons ≥ 64px for the young end of the age range.
- **No meteg (U+05BD)** in source — a guard test fails if one sneaks in (see `framework/src/__tests__/no-meteg.test.js`).

## Adding things

- **New game:** copy `games/_template/` → edit `game.js` → add one row to `games/catalog.js`. The home page and the service worker both read that file. Do not also edit `index.html` or a `GAMES` list in `sw.js`.
- **New framework module:** put it under the right `framework/src/<category>/`, export from `runtime/index.ts` (or `runtime/common.ts` if it has no Hebrew content), add CSS to `styles/alefbet.css` if it renders, add a vitest in `__tests__/`, then `npm run build`.

## Deploy

Pushing to `main` triggers `.github/workflows/deploy.yml`, gated by unit/type/lint checks and Chromium/WebKit browser tests, which serves `index.html`, `games/`, and `framework/dist/` from GitHub Pages.

## Lifecycle

- `runGame` owns score, progression and completion for syllable-read, letter-match-animals and nikud-match. `buildRound` receives `scope`: register components with `scope.use`, listeners with `scope.listen`, timers with `scope.schedule`, and pass `scope.signal` to `speakSyllable`. Resources are disposed on advance, replay and exit; returning a cleanup function remains supported.
- Choice games use `createChoiceRound(context, host, { options, isCorrect, onCorrect, onWrong })`. The manager owns the answer lock; games only control grading and feedback. Use `clearHighlight` for timed hints, never `reset` to unlock cards.
- Custom games use `bootstrapGame` and `shell.nextRound()` (never bypass the shell with `shell.state.nextRound()`). Use `shell.schedule` for delayed work, check `shell.ended` after awaits, and dispose resources on `end`.
- nikud-speak keeps its three-attempt policy locally. sound-studio remains outside the round runner.
- Do not delete `createRoundManager`: runGame still uses it internally and it remains a compatibility export.

## General games (2026-09-09)

- New games: `npm run new:game -- my-game "Title"`; edits template + catalog automatically.
- General gameplay API: `framework/dist/common.js`, with existing `runtime.css`.
- Hebrew API and backward compatibility: `framework/dist/runtime.js`.
- Write Hebrew text with nikud in the source; there is no runtime vowelization.
- Examples: `make-ten` (choice), `number-line` (custom interaction); guide: `docs/adding-games.md`.
- Avoid putting arithmetic rules or Hebrew content in common.ts.
- Math games follow `docs/math-pedagogy.md` (Aharoni: meaning before calculation; story, picture and exercise each enough alone). `balloon-stories` is the narrated reference.

## Lightweight CI

- PRs trigger CI; branch pushes do not. Use workflow_dispatch for a branch without a PR.
- Main pushes keep the full pre-deploy gate. Documentation-only changes skip both workflows.
- No scheduled runs and no repeated stability passes. Browser tests cover games and basic offline play (`pwa.spec.js` plus each game's offline reload).
- Service worker internals (refresh, interrupted upgrades, integrity) are covered by `framework/src/__tests__/service-worker.test.js`, not by browser tests. Do not add browser tests for background infrastructure.
- Never use `pull_request_target` to run untrusted code.
