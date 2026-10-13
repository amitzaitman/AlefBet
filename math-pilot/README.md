# Math pilot

An experiment: what would the math games look like on a dedicated platform?
The pilot rebuilds `make-ten` and `balloon-stories` as a standalone Svelte 5
(runes) app, so the owner can play them side by side with today's versions in
`games/`. It is for school children aged 6 to 8 who read, on a phone or tablet
with wifi.

The pilot does not touch the site. It is not in `games/catalog.js` or on the
home page, `sw.js` and the release manifest ignore it, and it never loads
anything from `framework/` or `games/`.

On purpose, for this experiment:

- **No audio.** The children read; every text is on screen with nikud.
- **No offline.** No service worker; the build is plain static files.
- **No stars or saved progress.** The completion screen says what was done.

## Run it

From the repository root (Node 20.19 or later, after `npm ci`):

- `npm run dev:pilot`: the Vite dev server, with hot reload.
- `npm run build:pilot`, then `node start.js` and open
  <http://localhost:8080/math-pilot/dist/> (keep the trailing slash).
- On GitHub Pages it is deployed at `/math-pilot/`.

Tests:

- `npm test` runs the pilot's unit tests after the framework's
  (`npm test --workspace=math-pilot` for the pilot alone).
- `npm run e2e -- e2e/math-pilot.spec.js` builds everything and plays the pilot
  games in the browser. `npm run verify` includes both.

## Layout

```
index.html               the page Vite builds (RTL, Hebrew)
src/main.js              mounts the app and locks page zoom
src/App.svelte           hash routes: #/ is the math home, #/<id> a game
src/games.js             the pilot's game list
src/shell/               home page, game header, progress, feedback line,
                         number cards, completion screen, round runner, round scope
src/lib/                 shuffle, praise, reduced motion, zoom lock
src/games/<id>/          logic.js (pure: rounds, answers, choices, texts),
                         a Round component, index.js (the game's entry)
tests/                   vitest unit tests for the logic and the shell
```

A game is `logic.js` plus a Round component. `GameShell` makes a new
`RoundRunner` for every start and replay and a new Round component for every
round. The component gets `round` and `runner`; it calls `runner.correct()` or
`runner.wrong()`, and the runner owns the answer lock, the pause and the end.
Timers that belong to a round go through `useScope()`, so they stop with it.
To add a game, add its folder and one entry in `src/games.js`.

## Rules it keeps

The same rules as the site's math games (`docs/math-pedagogy.md`): Hebrew with
nikud and no meteg (a unit test checks every Hebrew word in `src/`), an RTL page
with equations and frames in `dir="ltr"`, rows of five from the left, touch
targets of at least 64px, and feedback that helps instead of judging. Motion is
a Svelte transition only where it carries meaning, such as the missing cells
filling in after a correct answer; with reduced motion every duration is 0.
Svelte compiler warnings (accessibility, unused CSS) fail the build.

## Differences from today's games

- The replay button speaks to the children in plural (`שַׂחֲקוּ שׁוּב`), like
  every other text.
- No adult tools menu and no error screen.

## Versions

Exact versions in `package.json`: svelte 5.57.2, vite 7.3.7,
@sveltejs/vite-plugin-svelte 6.2.4 (peer: vite ^6.3 or ^7, svelte ^5) and
vitest 3.2.7 (vite ^5 to ^7). Vite 8 needs vitest 4 or 5: vitest 4 crashes
the npm 10 resolver that ships with Node 22, and vitest 5 needs Node 22.12,
while this repository supports Node 20.19. The framework keeps its own vite 5.

The build is about 51 KB of JavaScript (20 KB gzipped) and 108 KB of fonts.
It targets the browsers Vite 7 supports by default (Safari 16, Chrome 107).
