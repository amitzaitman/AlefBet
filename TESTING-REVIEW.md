# Testing method — review

*A review of how AlefBet tests its code, with a focus on test quality & patterns and on E2E / games / real-browser coverage.*

## Summary

AlefBet has a solid unit-testing foundation on Vitest + jsdom (22 test files, ~3,060 LOC), with well-chosen patterns: fake timers, module resets for cache-holding modules, shared helpers, and a clever `no-meteg` guard that prevents a specific font-breaking bug. The framework core (events, state, round-manager) and the editor's Zod schemas are well covered.

The gaps cluster in two places. **Test quality**: small mock factories (`sounds`, `tts`, `animations`) are copy-pasted across several test files, inviting drift when the underlying APIs change. **E2E / games**: there are zero tests under `games/` or `apps/`, the committed `framework/dist/alefbet.js` build artifact has no smoke test, and nothing verifies that games actually wire up to framework exports — meaning a renamed or removed export in `framework/src/index.ts` will pass CI and only surface when a user opens the game.

This document reviews what exists, identifies the gaps, and proposes prioritized fixes. Two of those fixes are implemented in the same change that introduced this document.

## Setup & configuration

| What | Where | Notes |
| --- | --- | --- |
| Test runner | Vitest 2.1.9 (`framework/package.json`) | Modern, jest-compatible API. |
| Environment | `jsdom` (`framework/vite.config.js:16`) | Appropriate for DOM-heavy framework. |
| Setup file | `framework/src/__tests__/setup.js` | Polyfills Web Animations API and `AudioContext`; clears DOM between tests. |
| Test pattern | `src/**/*.test.{js,ts}` (`framework/vite.config.js:17`) | Conventional. |
| Coverage | `@vitest/coverage-v8`, reporters `text` + `html` (`framework/vite.config.js:19-28`) | Opt-in via `npm run test:coverage`; **not** run in CI. Editor TS files are excluded from coverage reporting. |
| Shared helpers | `framework/src/__tests__/helpers.js` | `mountContainer`, `tick`, `makeShellStub`, `createIDBMock`, `makeMockMediaRecorder`, `makeMockStream`. |
| CI | `.github/workflows/deploy.yml:34-35` runs `npm run check` | `check = lint + typecheck + test`. No coverage upload, no thresholds, no pre-commit hooks. |

## Test quality & patterns

### Strengths

- **Consistent use of fake timers.** `vi.useFakeTimers()` + `vi.advanceTimersByTime()` / `vi.runAllTimersAsync()` is applied consistently in UI and integration tests (`ui/feedback.test.js`, `game-flow.integration.test.js:25-26`). No flaky `setTimeout(..., 100)` hacks.
- **Proper module-cache hygiene.** Tests that exercise modules with module-level state use `vi.resetModules()` and dynamic `import()` to get a fresh instance — e.g. `nakdan.test.js` for the fetch cache, `voice-recorder.test.js` for `MediaRecorder` globals. This is the right pattern, and the file authors clearly knew to reach for it.
- **Good shared helpers.** `helpers.js` centralizes the non-trivial boilerplate: in-memory IndexedDB (`createIDBMock`), `MediaRecorder` class factory (`makeMockMediaRecorder`), `GameShell` stub (`makeShellStub`). This is exactly the framework-over-duplication philosophy the repo asks for.
- **Accessibility is asserted, not just rendered.** Tests check `aria-live`, `role=status`, and `aria-valuenow` (`ui/feedback.test.js`, `ui/progress-bar` assertions) — an unusually good habit.
- **One real integration test exists.** `game-flow.integration.test.js` assembles `GameShell` + `createRoundManager` + `createOptionCards` and runs three rounds end-to-end. This is the only net the full wiring has.
- **`no-meteg.test.js` is a model guard test.** It scans `framework/src/`, `games/`, `apps/`, and `index.html` for U+05BD, reports line numbers, and has a sanity assertion that it scanned ≥10 files so the guard can't silently pass by finding nothing.

### Weaknesses

- **Duplicated audio / animation mock boilerplate.** The same small factory appears inline in at least four test files:
  - `framework/src/__tests__/game-flow.integration.test.js:10-16` — all three (`sounds`, `tts`, `animations`)
  - `framework/src/__tests__/core/round-manager.test.js:12-20` — `sounds`, `tts`, and `completion-screen`
  - `framework/src/__tests__/ui/feedback.test.js:9-12` — `sounds` + `animations`
  - `framework/src/__tests__/ui/completion-screen.test.js:9-12` — `sounds` + `animations`

  If the `sounds` module gains a new export (say `sounds.swoosh()`), every caller must be updated, or the mock silently omits it and code that calls `sounds.swoosh()` under test calls `undefined`.

  **Attempted fix, not shipped.** The natural dedup — extract `soundsFactory`, `ttsFactory`, etc. into a shared `mocks.js` and call `vi.mock('../audio/sounds.js', soundsFactory)` — doesn't work under Vitest. Vitest hoists every `vi.mock(...)` call above all `import` statements, so any identifier imported from `./mocks.js` is in the temporal dead zone when `vi.mock` runs. We confirmed this by implementing the refactor and running the suite: four files fail with `ReferenceError: Cannot access '__vi_import_0__' before initialization`. The Vitest-sanctioned workaround is `vi.hoisted(async () => await import('./mocks.js'))`, but that trades three lines of inline factory for three lines of hoisting boilerplate — no net savings. The edit was reverted; the duplication is noted as a recommendation (#3 below) rather than a shipped fix, to be addressed if/when a cleaner pattern emerges (e.g. a `setupMocks()` helper in `setup.js` that applies globally to tests that opt in via a `describe` tag).

- **`setup.js` polyfills hide missing mocks.** Tests that forget to mock `audio/sounds.js` still "work" because `setup.js` installs a silent `AudioContext` stub (`framework/src/__tests__/setup.js:30-56`). This is pragmatic for jsdom but means a test can silently exercise a real audio path without the author noticing. The stub should be narrower, or paired with a lint/guard that warns when a UI test imports `sounds` without mocking it.

- **Only one integration test.** `game-flow.integration.test.js` exercises the multiple-choice flow. There is no equivalent for drag-match (`input/drag.js` is entirely untested) or for the voice-recording flow (`voice-recorder.js` + `voice-store.js` are tested in isolation but never composed with `createVowelDetector` or a UI).

- **Error paths are under-tested.** `nakdan.test.js` does test a fetch failure — good — but most modules only exercise the happy path. What happens when `voice-store.js` can't open IndexedDB? When `bootstrap.ts`'s `onBeforeHide` throws? These are known edge cases in the code, not in the tests.

- **`editor/*.ts` UI has no tests, and is excluded from coverage.** The exclusion (`framework/vite.config.js:26`) hides the gap. Editor data modules (`game-data.ts`, `schemas.ts`, `activity-templates.ts`) are tested; UI modules (`game-editor.ts`, `zone-editor.ts`, `audio-manager.ts`, `round-inspector.ts`, `schema-to-fields.ts`, `slide-navigator.ts`, `editor-overlay.ts`) are not.

## E2E / games / real browser

This is the largest gap in the project's test strategy.

- **Zero tests under `games/` or `apps/`.** `find games apps -name '*.test.*'` returns nothing. The three games (`letter-match-animals`, `nikud-match`, `nikud-speak`) and the `passover-cleaning` app rely entirely on "open it in a browser and see if it works".

- **`framework/dist/alefbet.js` is committed but not verified.** Games import from the committed dist (`CLAUDE.md` explains why: games open without a build step). If the dist is stale — e.g. someone edited `framework/src/` and forgot `npm run build` — `npm run check` still passes, because nothing tests that the dist's exports match what games import.

- **A renamed or deleted framework export silently breaks games.** `games/nikud-speak/game.js` imports 15 named symbols from the dist. If a refactor renames, for example, `matchNikudVowel` → `matchVowel`, `npm run check` passes (all framework tests import from source paths that follow the rename), `npm run build` produces a valid dist, and only the user opening the game sees the blank screen.

- **No real browser in CI.** `jsdom` covers DOM APIs but not Web Audio output, MediaRecorder, `speechSynthesis`, drag-and-drop gesture semantics, canvas rendering, IndexedDB quota behavior, or real fetch to Dicta. Everything in these categories is mocked. This is defensible for unit tests but means no automated check verifies the pieces that most affect the end-user experience.

- **No visual or interaction regression tests.** No screenshot comparisons, no Playwright/Cypress, no lighthouse budget. Regressions in letter rendering (the very bug the `no-meteg` guard targets) are caught by one targeted scan, not by visual diff.

### Fix shipped in this PR

A new lightweight smoke test — `framework/src/__tests__/games-smoke.test.js` — iterates over each game folder in `games/` (skipping `_template`), statically verifies the `index.html` structure, and dynamically imports `game.js` to confirm it loads without throwing and exports `startGame`. It does **not** invoke `startGame` (which would require mocking the full dist — a much larger project). This is the smallest change that catches the "renamed framework export breaks a game" class of bug, which is the concrete failure mode the project has no defense against today.

## CI & tooling — brief notes

- `npm run check` in `.github/workflows/deploy.yml:34-35` runs only on push to `main`. There's no PR check job, so a PR can't be blocked on test failure — it can only break `main` after merge.
- No pre-commit / husky. Nothing prevents pushing a branch with failing tests.
- `npm run test:coverage` exists but isn't invoked. No coverage threshold, no CI upload (Codecov, etc.).
- The coverage `exclude` list in `framework/vite.config.js:23-28` hides `editor/**/*.ts` and `src/index.ts` from reports — both should be measured, even if they're partially tested.

## Recommendations (prioritized)

| # | Recommendation | Effort | Rationale |
| --- | --- | --- | --- |
| 1 | **Run `npm run check` on PRs**, not just on push to `main`. Add `pull_request:` trigger to `.github/workflows/deploy.yml` (or split into a separate `ci.yml`). | S | The current setup lets a broken PR merge and only fails on `main`. Single-line fix. |
| 2 | **Keep games-smoke test in CI** (shipped here) and extend it as games are added. | S (shipped) | Closes the "renamed export silently breaks games" blind spot. |
| 3 | **De-duplicate mock factories.** Attempted here via a shared `mocks.js`; reverted because Vitest's `vi.mock` hoisting is incompatible with imported factories (see "Weaknesses" above). Revisit with `vi.hoisted` or a `setup.js`-level auto-mock opt-in. | S | Prevents drift when `sounds`/`tts`/`animations` APIs grow. |
| 4 | **Add an integration test for the drag-match flow.** Compose `createDragSource` + `createDropTarget` + `createNikudBox` + `createRoundManager`, simulate a drag sequence, assert scoring. | M | Currently the drag-match game class has no integration coverage at all. |
| 5 | **Enable coverage reporting in CI** with a modest threshold (e.g. 70% statements on `framework/src/` excluding editor UI), uploaded to a free service like Codecov. Remove the `editor/**/*.ts` exclusion once editor UI tests are written. | M | Makes regressions in coverage visible. |
| 6 | **Add one Playwright smoke test per game** that loads the game's `index.html`, clicks through one round, and asserts the progress bar advances. Run only on PR, not on every push, to keep CI fast. | M | The only way to catch real-browser regressions (Web Audio, speech, drag gestures). |
| 7 | **Write tests for the editor UI modules** (`game-editor.ts`, `zone-editor.ts`, `audio-manager.ts`). Start with the highest-churn one. | L | Currently ~7 TS files with nontrivial DOM manipulation have zero tests. |
| 8 | **Narrow `setup.js` polyfills** so tests that forget to mock `sounds`/`animations` fail loudly. Consider emitting a warning when the stubs are invoked outside of explicitly opted-in tests. | S | Makes the "silent mock" failure mode visible. |

## Fixes shipped alongside this review

1. **`framework/src/__tests__/games-smoke.test.js`** — new smoke test. Iterates `games/*` (excluding `_template`), asserts each `index.html` has the expected mount point and module-script wiring, and dynamically imports `game.js` to confirm it loads and exports `startGame`. Catches the "stale `framework/dist/` bundle" and "renamed/removed framework export" regressions that no existing test covers.

One fix — the shared-mock-factories dedup for test quality — was attempted and reverted because it's structurally incompatible with Vitest's `vi.mock` hoisting. The finding is recorded in "Weaknesses" above and as recommendation #3; the games smoke test shipped in its place is higher-value anyway (it closes the only complete coverage gap: games aren't tested at all).

Other items in the recommendations table are left for follow-up work.
