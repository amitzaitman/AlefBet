# AlefBet — משחקים חינוכיים לעברית
**Hebrew Educational Games for Children (Ages 3–8)**

A growing framework for creating interactive Hebrew literacy games. Teachers use the built-in **Creator** tool to generate new games by chatting with Claude in Hebrew — no coding required.

---

## Quick Start — One Click

**Double-click `start.bat`** in Windows Explorer.

That's it. The server starts and the browser opens automatically at the games menu.

> **Requires:** [Node.js](https://nodejs.org) installed on your machine (v18 or later).
> If you don't have it: download and install from https://nodejs.org, then try again.

---

## Manual Start (from terminal)

```bash
# From the AlefBet folder:
node start.js

# Custom port:
node start.js 3000
```

Then open **http://localhost:8080** in your browser.

---

## Games

### 🦁 התאמת אותיות — Letter Match
Match each Hebrew letter to the animal whose name starts with it.
- 8 rounds, letters **א–ח**
- Full nikud (vowel marks) on all text
- Hebrew TTS reads instructions and feedback

### אָ לִמּוּד נִיקּוּד — Nikud Match
Drag the vowel symbol onto the letter that carries the same vowel.
- 8 rounds with 7 different nikud marks (קָמַץ, חִירִיק, חוֹלָם, ...)
- Supports drag-and-drop (mouse/stylus) and tap-to-select (touch)
- Sound effects + TTS feedback

---

## Development

### Prerequisites
- Node.js v18+
- npm v8+

### First-time setup
```bash
npm install          # install dependencies for all workspaces
npm run build        # build the framework → framework/dist/
```

### After changing framework source
```bash
npm run build        # rebuilds alefbet.js, alefbet.css, api-manifest.json
```

### Creator App (AI game generator)
```bash
npm run dev:creator  # starts Vite dev server at http://localhost:3000
```
Enter your [Anthropic API key](https://console.anthropic.com/) in the modal, then chat in Hebrew to generate new games.

---

## Project Structure

```
AlefBet/
├── start.js                    ← local server (no deps, auto-opens browser)
├── start.bat                   ← Windows one-click launcher
├── index.html                  ← Games library hub
│
├── framework/                  ← The growing infrastructure
│   ├── src/
│   │   ├── index.js            ← exports everything
│   │   ├── core/
│   │   │   ├── events.js       EventBus
│   │   │   ├── state.js        GameState (score, rounds, progress)
│   │   │   └── game-shell.js   GameShell (container, lifecycle, back button)
│   │   ├── audio/
│   │   │   ├── tts.js          Hebrew TTS — auto-uses nikud for pronunciation
│   │   │   └── sounds.js       Programmatic sound effects (Web Audio API)
│   │   ├── data/
│   │   │   ├── hebrew-letters.js   Full alphabet + metadata + nikud names
│   │   │   └── nikud.js            Vowel mark data (8 nikud types)
│   │   ├── ui/
│   │   │   ├── option-cards.js     Tappable card grid
│   │   │   ├── progress-bar.js     Round progress indicator
│   │   │   ├── feedback.js         Visual + audio correct/wrong feedback
│   │   │   └── completion-screen.js End-of-game celebration with stars
│   │   ├── render/
│   │   │   └── animations.js       shake, bounce, pulse, fadeIn (Web Animations API)
│   │   ├── input/
│   │   │   └── drag.js             Pointer-based drag-and-drop (mouse + touch)
│   │   ├── utils/
│   │   │   └── nakdan.js           Auto-nikud via Dicta API (cached)
│   │   └── styles/
│   │       └── alefbet.css         RTL base, Hebrew fonts, dynamic layout
│   ├── dist/                   ← Built output (committed for easy game loading)
│   │   ├── alefbet.js
│   │   ├── alefbet.umd.cjs
│   │   ├── alefbet.css
│   │   └── api-manifest.json   ← Auto-generated module manifest for Creator
│   └── scripts/
│       └── generate-manifest.js
│
├── creator/                    ← Educator's AI-powered game creation tool
│   ├── index.html
│   └── src/
│       ├── main.js
│       ├── chat-ui.js          Hebrew chat interface
│       ├── claude-client.js    Anthropic API (streaming, browser-side)
│       ├── system-prompt.js    Dynamic prompt built from api-manifest.json
│       ├── game-preview.js     Live game preview in sandboxed iframe
│       └── styles/creator.css
│
└── games/                      ← Each game is an independent folder
    ├── _template/              ← Copy this to start a new game
    ├── letter-match-animals/   🦁 Letter → Animal matching
    └── nikud-match/            אָ Vowel mark drag-and-drop
```

---

## Adding a New Game

1. Copy `games/_template/` to a new folder, e.g. `games/my-game/`
2. Edit `game.js` — import from `../../framework/dist/alefbet.js`
3. Open `http://localhost:8080/games/my-game/` to test
4. Add a card for it in `index.html`

Or use the **Creator** app to have Claude generate the game for you.

### Framework Growth Pattern
When a game needs a feature that doesn't exist yet:
1. Create a new module in `framework/src/<category>/<module>.js`
2. Export named functions — no default exports
3. Add JSDoc comments in Hebrew
4. Add the export to `framework/src/index.js`
5. Run `npm run build` — the api-manifest updates automatically

---

## Nikud (Vowel Marks)

All Hebrew text is automatically vowelized using the **Dicta Nakdan API**:
- Endpoint: `https://nakdan-u1-0.loadbalancer.dicta.org.il/api`
- Called once at game start, results cached for the session
- TTS uses the nikud'd text for significantly better pronunciation
- Graceful fallback to plain text if the API is unavailable

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework build | Vite (library mode, ESM + UMD) |
| Creator dev server | Vite |
| AI generation | Anthropic Claude API (streaming) |
| Hebrew TTS | Web Speech API |
| Hebrew nikud | Dicta Nakdan API |
| Sounds | Web Audio API |
| Drag & drop | Pointer Events API |
| Animations | Web Animations API |
| Fonts | Heebo (Google Fonts) |
| Language | Vanilla JS (ES modules) |

---

## License
MIT
