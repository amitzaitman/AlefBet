# AlefBet: notes for Claude and coding agents

Hebrew reading and math games for ages 3–8. Vanilla JS games plus a Vite library build of the shared framework, no runtime framework, no server. Each game is a standalone folder that imports the committed framework bundle.

Where things are documented:

- `README.md`: for people (what it is, how to run, the game list).
- `docs/architecture.md`: how the infrastructure works (lifecycle, audio, offline, tests, CI) and the owner's past decisions.
- `docs/adding-games.md`: how to write a game.
- `docs/math-pedagogy.md`: the rules every math game follows.
- `BACKLOG.md`: what is next.

## Shared code boundary

- Game rules, content, hints and rendering stay in the game. Code only one game uses lives in that game's folder (`nikud-match/nikud-box.js`, `nikud-speak/vowel-detector.js`, `sound-studio/voice-recorder.js`).
- Move behavior into `framework/src/` only when a second game needs the same thing. New games do not have to grow the framework.
- There is one entry, `framework/src/runtime/index.js`, built to `framework/dist/runtime.js`. It exports only what games use. When a game needs another export, add it there and rebuild. Don't re-add exports "for completeness".
- `runGame` is optional composition for round-based games, not a requirement for every game or teacher tool.

## Layout

```
framework/src/
  runtime/   index.js (the one game API)
  core/      bootstrap (runGame, bootstrapGame), game-shell, round-manager, round-scope,
             choice-round, hints, progress, state, events, local-state
  audio/     hebrew-audio, tts, phoneme-synth, voice-store, audio-context, sounds, game-audio
  data/      hebrew-letters, nikud, vowels, encouragement
  ui/        feedback, progress-bar, completion/loading/error screens, audio-status-banner,
             adult-tools, header-button, option-cards, nikud-settings
  input/     drag, zoom-lock
  render/    animations
  utils/     shuffle
  styles/    alefbet.css and local fonts
  __tests__/ vitest suites, including tests for modules that live in game folders
framework/dist/   built output, committed on purpose
games/<id>/       index.html + game.js + game.css, plus any modules or assets the game owns
games/catalog.js  the only list of games (home page and offline release both read it)
e2e/              Playwright specs: one per game area, plus home, pwa and mobile
scripts/          build, release manifest, check-dist, create-game
```

## Build and offline contract

- Games load `../../framework/dist/runtime.js` (preloaded with `<link rel="modulepreload">`) and `runtime.css`. Fonts are separate files in `framework/dist/fonts/`; keep them out of the CSS so first load stays fast.
- **After editing site code or assets, run `npm run build`** and commit `framework/dist/`. The owner decided (2026-10-13) to keep dist in git so games open without a build step; don't propose removing it.
- The build writes `runtime-assets.js` (the entry, its fonts and anything it imports) and `release-manifest.js` (SHA-256 of every release file: home page, catalog, icons, runtime files and every file in every catalog game folder).
- Every file in a game folder is precached for offline play. Don't put tests, drafts or large unused files there.
- `sw.js`: all-or-nothing verified install, no `skipWaiting`/`clients.claim` (updates wait for old tabs to close), cache-first only for release files; `refresh.html` triggers the adult "full refresh" (`refresh-assets` message).
- Dev server: `node start.js` (or `start.bat` on Windows). Node 20+.

## Commands

- `npm run check`: lint + typecheck + unit tests. Run during development.
- `npm run verify`: the full pre-push gate (check, clean build, all browser tests). CI and deploy run the same thing through `.github/actions/verify`.
- `npm run build`: clean rebuild of `framework/dist/` and the release manifest.
- `npm run e2e -- e2e/math.spec.js`: rebuild and run one browser spec.
- `npm run new:game -- my-game "Title"`: copy the template and add a catalog row.
- `npm run setup:browsers`: install Chromium and WebKit once and after Playwright updates.
- `npm run verify:ci`: verify plus a check that dist matches the commit. Commit regenerated files first.
- In this cloud container WebKit isn't installed: run browser tests with `PW_CHROMIUM_PATH=/opt/pw-browsers/chromium npx playwright test --project=chromium --project=mobile-chromium`.

## Conventions

- **JavaScript only.** The framework is JavaScript with JSDoc types; `globals.d.ts` holds only ambient type declarations. Don't convert JS to TypeScript (owner decision 2026-10-13).
- **JSDoc types** on framework JS files; `tsc --noEmit` checks them (`checkJs: true`). Avoid em-dash (`—`) in JSDoc type/param lines; it breaks the parser. Use `-`.
- **Named exports only.**
- **Hebrew JSDoc prose** on framework modules, explaining purpose and public API.
- **RTL** everywhere; buttons ≥ 64px. Equations and number lines use `dir="ltr"` inside the Hebrew page.
- Hebrew text is written with nikud in the source; there is no runtime vowelization.
- **No meteg (U+05BD)** in source; `framework/src/__tests__/no-meteg.test.js` fails if one sneaks in.

## Writing games

- **New game:** `npm run new:game -- my-game "Title"`. Don't edit `index.html` or `sw.js` to register it; the catalog row is enough. Set `category` (`reading`, `math`, `other`) or `kind: 'teacher-tool'`.
- **Choice games:** `runGame` + `createChoiceRound(context, host, { options, isCorrect, onCorrect, onWrong })`. The round owns the answer lock; games control grading and feedback. Use `highlight`/`clearHighlight` for timed hints. Example: `make-ten`.
- **Custom interaction per round:** `runGame` with your own `buildRound`. Register components with `scope.use`, listeners with `scope.listen`, timers with `scope.schedule`, and pass `scope.signal` to `speakSyllable`. Everything is disposed on advance, replay and exit. After an `await`, check `isActive()`. Use `isAnswered`/`subscribeAnswered` to block double answers. Examples: `number-line`, `balloon-stories`.
- **No rounds:** `bootstrapGame` + `createRoundScope`. Use `shell.nextRound()` (never `shell.state.nextRound()`), `shell.schedule` for delayed work, check `shell.ended` after awaits, dispose on `end`. `sound-studio` works this way; `nikud-speak` keeps its three-attempt policy locally.
- **Math games** follow every principle in `docs/math-pedagogy.md`: Aharoni's 1-7 (meaning before calculation; picture, exercise and story each enough alone) and the research principles 8-21 (problem structure and unknown position, counting on along a straight path, help from the first miss, counts ending in the total, rows of five, introduce then mix, a clean screen, '=' as 'the same as'). `balloon-stories` is the narrated reference.
- Add one browser spec per game that plays it through (correct answer, retry, completion, a round after replay, offline). Don't add a separate one-round 'golden path' test next to it. Put unit tests for non-trivial game logic in `framework/src/__tests__/`, importing from `games/<id>/`.

## Tests and CI

- PRs trigger CI; branch pushes do not (use workflow_dispatch for a branch without a PR). Pushes to `main` run the full gate before deploying to GitHub Pages. Changes only to Markdown, `docs/` or `LICENSE` skip both workflows.
- No scheduled runs and no repeated stability passes.
- Specs import `test` and `expect` from `e2e/network-server.js`, which also has `activate`, `noVoice`, `expectTouchTargets` and `network.reloadOffline`. Don't copy offline plumbing or speech stubs into specs.
- Projects: `chromium` runs every spec except `mobile.spec.js`; `mobile-chromium` runs only `mobile` and `home` (owner decision 2026-10-13: same engine as desktop); `mobile-webkit` runs `mobile`, `home`, `math` and `fractions-math`.
- Don't wait out fixed game pauses: `page.clock.install()` before `goto`, then `page.clock.runFor(<the game's delay>)` only after an assertion proves the action was handled. Keep at least one real-time test per narrated game.
- CI runs on Node 22, where vitest uses the `vmForks` pool (unit tests take about 3s); below Node 22 it falls back to `forks`.
- Service worker internals are covered by `framework/src/__tests__/service-worker.test.js`. Don't add browser tests for background infrastructure.

## Working rules

- One step per branch. `npm run verify` must pass. Merge to `main` so Pages stays shippable.
- Don't land a new feature inside an infrastructure cleanup, or the other way around.
- After every merge to `main` that touches the site: one real phone, offline, one game end-to-end including audio. Audio on iOS is the fragile part.
- Don't rewrite the site as a Vite multi-page app, and don't bring back the in-browser editor, zones, saved round content or a network service at play time, without a new decision from the owner. `docs/architecture.md` lists past decisions and why.
- Branches other than `main` are old: merged history, abandoned experiments, or unrelated apps (Passover, baby monitor). The owner chose to keep them. Don't merge or build on them.
- For decisions that are the owner's to make, gather the facts and ask a multiple-choice question, rating each option with up to five stars and listing the recommended option first.
