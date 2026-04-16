# AlefBet — משחקים חינוכיים לעברית
**Hebrew Educational Games for Children (Ages 3–8)**

A growing framework for creating interactive Hebrew literacy games. Each game is a small folder that imports from the shared framework bundle.

**🌐 Play online:** [amitzaitman.github.io/AlefBet](https://amitzaitman.github.io/AlefBet/) (hosted on GitHub Pages)

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
A letter appears in the center — drag it to the correct nikud side.
- 8 rounds with 7 different nikud marks (קָמַץ, חִירִיק, חוֹלָם, ...)
- Two nikud options shown on left and right sides
- On success, TTS speaks the letter with the correct nikud
- Supports drag and tap-to-select (touch)

### 🎤 אֱמוֹר אֶת הַנִּיקּוּד — Nikud Speak
Listen to a nikud name and say it aloud — speech recognition validates pronunciation.
- 8 rounds with random nikud marks
- Microphone recording via Web Speech API (Chrome/Edge)
- Up to 3 attempts per round, auto-advances on 3 misses
- Gentle encouragement only — no negative feedback

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
npm run build        # rebuilds alefbet.js and alefbet.css
```

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
│   │   │   ├── tts.js          Hebrew TTS — Google Translate (browser fallback)
│   │   │   ├── sounds.js       Programmatic sound effects (Web Audio API)
│   │   │   └── speech-recognition.js  Microphone input via Web Speech API
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
│   └── dist/                   ← Built output (committed for easy game loading)
│       ├── alefbet.js
│       ├── alefbet.umd.cjs
│       └── alefbet.css
│
├── apps/                       ← Larger multi-page apps
│   └── passover-cleaning/
│
└── games/                      ← Each game is an independent folder
    ├── _template/              ← Copy this to start a new game
    ├── letter-match-animals/   🦁 Letter → Animal matching
    ├── nikud-match/            אָ Drag letter to correct nikud side
    └── nikud-speak/            🎤 Say nikud aloud (speech recognition)
```

---

## Adding a New Game

1. Copy `games/_template/` to a new folder, e.g. `games/my-game/`
2. Edit `game.js` — import from `../../framework/dist/alefbet.js`
3. Open `http://localhost:8080/games/my-game/` to test
4. Add a card for it in `index.html`

### Framework Growth Pattern
When a game needs a feature that doesn't exist yet:
1. Create a new module in `framework/src/<category>/<module>.js`
2. Export named functions — no default exports
3. Add JSDoc comments in Hebrew
4. Add the export to `framework/src/index.ts`
5. Run `npm run build` to refresh `framework/dist/`

---

## GitHub Pages + Nakdan Proxy

Dicta Nakdan blocks direct browser CORS from `https://amitzaitman.github.io`, so production on GitHub Pages must use a proxy.

A ready Cloudflare Worker proxy is included at:
- `deploy/cloudflare-nakdan-proxy/worker.js`
- `deploy/cloudflare-nakdan-proxy/wrangler.toml`
- `deploy/cloudflare-nakdan-proxy/README.md`

You can configure the proxy URL in any one of these ways:
- Query string: `?nakdanProxy=https://<your-worker>.workers.dev`
- Local storage key: `alefbet.nakdanProxyUrl`
- Global variable: `window.ALEFBET_NAKDAN_PROXY_URL`
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
| Hebrew TTS | Google Translate TTS (Web Speech API fallback) |
| Hebrew nikud | Dicta Nakdan API |
| Sounds | Web Audio API |
| Drag & drop | Pointer Events API |
| Animations | Web Animations API |
| Fonts | Heebo (Google Fonts) |
| Language | Vanilla JS (ES modules) |

---

## GitHub Pages Deployment

The site is hosted at **https://amitzaitman.github.io/AlefBet/** via GitHub Pages, serving directly from the `main` branch root.

Every push to `main` automatically deploys. To add a new game to the live site:
1. Create the game folder under `games/`
2. Add a game card to `index.html` (the hub page)
3. Commit and push — the game appears on the site after Pages rebuilds (~1–2 minutes)

---

## Hebrew TTS

The framework uses **Google Translate TTS** for high-quality Hebrew pronunciation:
- Audio is fetched from Google's servers and played via the `<audio>` element
- Nikud-aware: text is auto-vowelized via the Dicta Nakdan API before speaking
- If Google TTS is unavailable (offline, blocked), falls back to the browser's built-in Web Speech API
- Configurable speech rate via `tts.setRate()`

---

## License
MIT
