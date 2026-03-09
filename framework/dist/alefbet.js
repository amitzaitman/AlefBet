class z {
  constructor() {
    this._handlers = {};
  }
  /** הירשם לאירוע */
  on(t, n) {
    return this._handlers[t] || (this._handlers[t] = []), this._handlers[t].push(n), this;
  }
  /** בטל הרשמה לאירוע */
  off(t, n) {
    return this._handlers[t] ? (this._handlers[t] = this._handlers[t].filter((r) => r !== n), this) : this;
  }
  /** שלח אירוע */
  emit(t, n) {
    return (this._handlers[t] || []).slice().forEach((r) => r(n)), this;
  }
}
class q {
  constructor(t) {
    this._totalRounds = t, this._currentRound = 0, this._score = 0;
  }
  get currentRound() {
    return this._currentRound;
  }
  get score() {
    return this._score;
  }
  get totalRounds() {
    return this._totalRounds;
  }
  /** הוסף ניקוד */
  addScore(t) {
    this._score += t;
  }
  /** עבור לסיבוב הבא. מחזיר false אם המשחק הסתיים */
  nextRound() {
    return this._currentRound >= this._totalRounds ? !1 : (this._currentRound++, this._currentRound <= this._totalRounds);
  }
  /** קבל מידע על התקדמות */
  get progress() {
    return {
      current: this._currentRound,
      total: this._totalRounds,
      percentage: Math.round(this._currentRound / this._totalRounds * 100)
    };
  }
  get isComplete() {
    return this._currentRound >= this._totalRounds;
  }
}
class pe {
  /**
   * @param {HTMLElement} containerEl - אלמנט המיכל
   * @param {object} config - הגדרות: { totalRounds, title, homeUrl }
   */
  constructor(t, n = {}) {
    this.container = t, this.config = {
      totalRounds: 8,
      title: "מִשְׂחָק",
      homeUrl: "../../index.html",
      ...n
    }, this.events = new z(), this.state = new q(this.config.totalRounds), this._buildShell();
  }
  _buildShell() {
    this.container.classList.add("alefbet-game");
    const t = this.config.homeUrl ? `<a href="${this.config.homeUrl}" class="game-back-btn" aria-label="סִפְרִיַּית מִשְׂחָקִים">🏠</a>` : '<div class="game-header__spacer"></div>';
    this.container.innerHTML = `
      <div class="game-header">
        <div class="game-header__spacer"></div>
        <h1 class="game-title"></h1>
        ${t}
      </div>
      <div class="game-body"></div>
      <div class="game-footer"></div>
    `, this.titleEl = this.container.querySelector(".game-title"), this.bodyEl = this.container.querySelector(".game-body"), this.footerEl = this.container.querySelector(".game-footer"), this.setTitle(this.config.title);
  }
  /** עדכן את כותרת המשחק */
  setTitle(t) {
    this.titleEl.textContent = t;
  }
  /** התחל את המשחק */
  start() {
    this.state.nextRound(), this.events.emit("start", { state: this.state });
  }
  /** עבור לסיבוב הבא */
  nextRound() {
    const t = this.state.nextRound();
    return t ? this.events.emit("round", { state: this.state }) : this.end(this.state.score), t;
  }
  /** סיים את המשחק */
  end(t) {
    this.events.emit("end", { score: t, state: this.state });
  }
  /** קבל את מצב המשחק הנוכחי */
  getState() {
    return this.state;
  }
  /** הירשם לאירועי מחזור החיים: start, round, end */
  on(t, n) {
    return this.events.on(t, n), this;
  }
}
let g = null;
function D() {
  if (!g)
    try {
      g = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      return null;
    }
  return g.state === "suspended" && g.resume(), g;
}
function m(e, t, n = "sine", r = 0.3) {
  const a = D();
  if (a)
    try {
      const o = a.createOscillator(), i = a.createGain();
      o.connect(i), i.connect(a.destination), o.type = n, o.frequency.setValueAtTime(e, a.currentTime), i.gain.setValueAtTime(r, a.currentTime), i.gain.exponentialRampToValueAtTime(1e-3, a.currentTime + t), o.start(a.currentTime), o.stop(a.currentTime + t + 0.05);
    } catch {
    }
}
const v = {
  /** צליל תשובה נכונה */
  correct() {
    m(523.25, 0.15), setTimeout(() => m(659.25, 0.2), 120), setTimeout(() => m(783.99, 0.3), 240);
  },
  /** צליל עידוד עדין — נסה שוב */
  wrong() {
    m(350, 0.15, "triangle", 0.12);
  },
  /** צליל עידוד - סיום מוצלח */
  cheer() {
    [523.25, 587.33, 659.25, 698.46, 783.99, 1046.5].forEach((t, n) => setTimeout(() => m(t, 0.2), n * 90));
  },
  /** קליק עדין */
  click() {
    m(900, 0.04, "sine", 0.12);
  }
}, F = "https://nakdan-u1-0.loadbalancer.dicta.org.il/api";
let P = !1;
const b = /* @__PURE__ */ new Map();
function O() {
  var a;
  if (typeof window > "u") return F;
  const e = new URLSearchParams(window.location.search).get("nakdanProxy"), t = window.ALEFBET_NAKDAN_PROXY_URL;
  if (e && window.localStorage)
    try {
      window.localStorage.setItem("alefbet.nakdanProxyUrl", e);
    } catch {
    }
  const n = (a = window.localStorage) == null ? void 0 : a.getItem("alefbet.nakdanProxyUrl"), r = e || t || n;
  return r || (window.location.hostname.endsWith("github.io") ? null : F);
}
function X(e) {
  var n;
  let t = "";
  for (const r of e)
    if (r.sep)
      t += r.str ?? "";
    else {
      const a = (n = r.nakdan) == null ? void 0 : n.options;
      a != null && a.length ? t += (a[0].w ?? "").replace(/\|/g, "").replace(/\u05BD/g, "") : t += r.str ?? "";
    }
  return t;
}
async function G(e) {
  const t = O();
  if (!t)
    throw P || (P = !0, console.warn("[nakdan] Dicta API blocked by CORS on GitHub Pages. Configure a proxy URL via ?nakdanProxy=..., window.ALEFBET_NAKDAN_PROXY_URL, or localStorage key alefbet.nakdanProxyUrl.")), new Error("Nakdan unavailable without proxy on this host");
  const n = await fetch(t, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      addmorph: !0,
      keepmetagim: !1,
      keepqq: !1,
      nodageshdefmem: !1,
      patachma: !1,
      task: "nakdan",
      data: e,
      useTokenization: !0,
      genre: "modern"
    })
  });
  if (!n.ok) throw new Error(`Nakdan ${n.status}`);
  const r = await n.json(), a = r == null ? void 0 : r.data;
  if (!Array.isArray(a)) throw new Error("Nakdan: invalid response");
  return X(a);
}
async function Y(e) {
  if (!(e != null && e.trim())) return e ?? "";
  if (b.has(e)) return b.get(e);
  try {
    const t = await G(e);
    return b.set(e, t), t;
  } catch {
    return b.set(e, e), e;
  }
}
function V(e) {
  return b.get(e) ?? e ?? "";
}
async function ge(e) {
  const t = [...new Set(e.filter((n) => n == null ? void 0 : n.trim()))];
  await Promise.all(t.map((n) => Y(n)));
}
let h = [], k = !1, B = !0, p = 0.9, A = 0.5, L = !1, w = null;
function j(e, t, n, r = t) {
  console.warn(`[tts] ${e} TTS failed`, { text: t, sentText: r, reason: n }), typeof window < "u" && typeof window.dispatchEvent == "function" && window.dispatchEvent(new CustomEvent("alefbet:tts-error", {
    detail: { provider: e, text: t, sentText: r, reason: n }
  }));
}
function K(e) {
  return (e || "").replace(/[\u0591-\u05C7]/g, "");
}
function J(e) {
  const t = String(e || "").toLowerCase();
  return t.includes("didn't interact") || t.includes("notallowed");
}
function Q() {
  var e;
  return typeof window > "u" || typeof document > "u" ? Promise.resolve() : L || (e = document.userActivation) != null && e.hasBeenActive ? (L = !0, Promise.resolve()) : w || (w = new Promise((t) => {
    const n = () => {
      L = !0, window.removeEventListener("pointerdown", n, !0), window.removeEventListener("keydown", n, !0), window.removeEventListener("touchstart", n, !0), t();
    };
    window.addEventListener("pointerdown", n, { once: !0, capture: !0 }), window.addEventListener("keydown", n, { once: !0, capture: !0 }), window.addEventListener("touchstart", n, { once: !0, capture: !0 });
  }).finally(() => {
    w = null;
  }), w);
}
function Z(e, t, n) {
  const a = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(e)}&tl=he&client=tw-ob`, o = new Audio(a);
  o.playbackRate = p, o.onended = t, o.onerror = () => n("audio.onerror"), o.play().catch((i) => {
    n((i == null ? void 0 : i.message) || "audio.play() rejected");
  });
}
function ee(e) {
  return new Promise((t, n) => {
    const r = K(e).trim() || e;
    let a = !1, o = !1;
    const i = () => {
      a || (a = !0, t());
    }, s = (l) => {
      a || (a = !0, n(l));
    }, c = () => {
      try {
        Z(r, i, (l) => {
          if (!o && J(l)) {
            o = !0, Q().then(() => {
              a || c();
            });
            return;
          }
          j("google", e, l, r), s(l);
        });
      } catch (l) {
        j("google", e, (l == null ? void 0 : l.message) || "Audio() construction failed", r), s(l == null ? void 0 : l.message);
      }
    };
    c();
  });
}
let E = null;
function te() {
  const e = speechSynthesis.getVoices();
  return e.find((t) => t.lang === "he-IL") || e.find((t) => t.lang === "iw-IL") || e.find((t) => t.lang.startsWith("he")) || null;
}
function $() {
  E = te();
}
typeof speechSynthesis < "u" && (speechSynthesis.getVoices().length > 0 ? $() : speechSynthesis.addEventListener("voiceschanged", $, { once: !0 }));
function ne(e) {
  return new Promise((t) => {
    if (typeof speechSynthesis > "u") {
      t();
      return;
    }
    const n = new SpeechSynthesisUtterance(e);
    n.lang = "he-IL", n.rate = p, E && (n.voice = E), n.onend = t, n.onerror = t, speechSynthesis.speak(n);
  });
}
async function re(e) {
  if (B)
    try {
      await ee(e);
      return;
    } catch {
      console.info("[tts] Falling back to browser Speech API");
    }
  await ne(e);
}
function S() {
  if (k || h.length === 0) return;
  const e = h.shift();
  k = !0, re(e.text).then(() => {
    k = !1, e.resolve(), S();
  });
}
const we = {
  /**
   * הקרא טקסט עברי
   * משתמש ב-Google Translate TTS לאיכות טובה יותר
   */
  speak(e) {
    const t = V(e);
    return new Promise((n) => {
      h.push({ text: t, resolve: n }), S();
    });
  },
  /** עצור את הדיבור הנוכחי */
  cancel() {
    h.forEach((e) => e.resolve()), h = [], k = !1, typeof speechSynthesis < "u" && speechSynthesis.cancel();
  },
  get available() {
    return !0;
  },
  /** הגדר מהירות דיבור (0.5–2.0) */
  setRate(e) {
    p = Math.max(0.5, Math.min(2, e));
  },
  /** השתמש ב-Google Translate TTS (ברירת מחדל) או בדפדפן */
  useGoogle(e = !0) {
    B = e;
  },
  /**
   * הגדר מהירות דיבור להדגשת ניקוד
   * @param {{ rate?: number }} opts
   *   rate: מהירות דיבור להדגשה (ברירת מחדל 0.5)
   */
  setNikudEmphasis({ rate: e } = {}) {
    e != null && (A = Math.max(0.3, Math.min(1.5, e)));
  },
  /**
   * הקרא אות עם ניקוד באיטיות להדגשת התנועה
   * @param {string} letter - האות (למשל 'ב')
   * @param {string} nikudSymbol - סמל הניקוד (למשל '\u05B7')
   */
  speakNikud(e, t) {
    const n = e + t, r = p;
    return p = A, new Promise((a) => {
      h.push({ text: n, resolve: a }), S();
    }).finally(() => {
      p = r;
    });
  }
}, W = {
  shake: [
    { transform: "translateX(0)" },
    { transform: "translateX(-8px)" },
    { transform: "translateX(8px)" },
    { transform: "translateX(-6px)" },
    { transform: "translateX(6px)" },
    { transform: "translateX(-3px)" },
    { transform: "translateX(0)" }
  ],
  bounce: [
    { transform: "scale(1)" },
    { transform: "scale(1.25)" },
    { transform: "scale(0.92)" },
    { transform: "scale(1.08)" },
    { transform: "scale(1)" }
  ],
  pulse: [
    { transform: "scale(1)", opacity: "1" },
    { transform: "scale(1.1)", opacity: "0.8" },
    { transform: "scale(1)", opacity: "1" }
  ],
  fadeIn: [
    { opacity: "0", transform: "translateY(12px)" },
    { opacity: "1", transform: "translateY(0)" }
  ],
  confetti: [
    { transform: "scale(0) rotate(0deg)", opacity: "0" },
    { transform: "scale(1.3) rotate(180deg)", opacity: "1" },
    { transform: "scale(1) rotate(360deg)", opacity: "1" }
  ]
}, ae = {
  shake: 420,
  bounce: 480,
  pulse: 600,
  fadeIn: 320,
  confetti: 700
};
function y(e, t) {
  !e || !W[t] || e.animate(W[t], {
    duration: ae[t] || 400,
    easing: "ease-in-out",
    fill: "none"
  });
}
function oe(e, t, n, r) {
  v.cheer();
  const a = t / n, o = a >= 0.8 ? 3 : a >= 0.5 ? 2 : 1, i = "⭐".repeat(o) + "☆".repeat(3 - o), s = document.createElement("div");
  s.className = "completion-screen", s.innerHTML = `
    <div class="completion-screen__content">
      <div class="completion-screen__stars" aria-label="${o} כּוֹכָבִים">${i}</div>
      <h2 class="completion-screen__title">!כָּל הַכָּבוֹד</h2>
      <p class="completion-screen__score">נִיקּוּד: ${t} מִתּוֹךְ ${n}</p>
      <button class="completion-screen__replay btn btn--primary">שַׂחֵק שׁוּב</button>
    </div>
  `, s.querySelector(".completion-screen__replay").addEventListener("click", () => {
    s.remove(), r();
  }), e.innerHTML = "", e.appendChild(s), y(s.querySelector(".completion-screen__content"), "fadeIn");
}
function be(e, t, {
  totalRounds: n,
  progressBar: r = null,
  buildRoundUI: a,
  onCorrect: o,
  onWrong: i
} = {}) {
  let s = !1;
  async function c(T) {
    if (s) return;
    s = !0, v.correct(), T && await T(), o && await o(), e.state.addScore(1), r == null || r.update(e.state.currentRound), await new Promise((I) => setTimeout(I, 1200)), e.state.nextRound() ? (s = !1, a()) : oe(t, e.state.score, n, () => {
      location.reload();
    });
  }
  async function l() {
    s || (s = !0, i && await i(), s = !1);
  }
  function U() {
    return s;
  }
  function H() {
    s = !1;
  }
  return { handleCorrect: c, handleWrong: l, isAnswered: U, reset: H };
}
const ie = {
  kamatz: "ah",
  patah: "ah",
  tzere: "eh",
  segol: "eh",
  hiriq: "ee",
  holam: "oh",
  kubbutz: "oo"
}, se = {
  ah: [/[אה]/, /^א$/, /אא/, /הא/],
  eh: [/[אה]/, /^א$/, /אא/, /הא/, /אה/],
  ee: [/[אי]/, /^י$/, /אי/, /הי/],
  oh: [/[או]/, /^[או]$/, /או/, /הו/],
  oo: [/[או]/, /^[או]$/, /או/, /הו/, /אוּ/]
};
function ke() {
  const e = typeof window < "u" ? window.SpeechRecognition || window.webkitSpeechRecognition : null, t = !!e;
  let n = null;
  return {
    available: t,
    listen(r = 4e3) {
      return t ? new Promise((a) => {
        n = new e(), n.lang = "he-IL", n.continuous = !1, n.interimResults = !1, n.maxAlternatives = 3;
        let o = !1;
        const i = (c, l) => {
          o || (o = !0, n = null, a({ text: c.trim(), confidence: l }));
        };
        n.onresult = (c) => {
          const l = c.results[0];
          l ? i(l[0].transcript, l[0].confidence) : i("", 0);
        }, n.onerror = () => i("", 0), n.onnomatch = () => i("", 0);
        const s = setTimeout(() => {
          try {
            n == null || n.stop();
          } catch {
          }
          i("", 0);
        }, r);
        n.onend = () => {
          clearTimeout(s), i("", 0);
        };
        try {
          n.start();
        } catch {
          i("", 0);
        }
      }) : Promise.resolve({ text: "", confidence: 0 });
    },
    cancel() {
      try {
        n == null || n.abort();
      } catch {
      }
      n = null;
    }
  };
}
function ye(e, t) {
  if (!e || !t) return !1;
  const n = ie[t];
  if (!n) return !1;
  const r = se[n];
  if (!r) return !1;
  const a = e.replace(/[\s.,!?]/g, "");
  return a.length ? r.some((o) => o.test(a)) : !1;
}
const _ = [
  { letter: "א", name: "אֶלֶף", nameNikud: "אָלֶף", sound: "", exampleWord: "אַרְיֵה", emoji: "🦁", isFinal: !1 },
  { letter: "ב", name: "בַּיִת", nameNikud: "בֵּית", sound: "b", exampleWord: "בַּיִת", emoji: "🏠", isFinal: !1 },
  { letter: "ג", name: "גִּימֶל", nameNikud: "גִּימֶל", sound: "g", exampleWord: "גָּמָל", emoji: "🐪", isFinal: !1 },
  { letter: "ד", name: "דֶּלֶת", nameNikud: "דָּלֶת", sound: "d", exampleWord: "דָּג", emoji: "🐟", isFinal: !1 },
  { letter: "ה", name: "הָא", nameNikud: "הֵא", sound: "h", exampleWord: "הַר", emoji: "⛰️", isFinal: !1 },
  { letter: "ו", name: "ווּ", nameNikud: "וָו", sound: "v", exampleWord: "וֶרֶד", emoji: "🌹", isFinal: !1 },
  { letter: "ז", name: "זַיִן", nameNikud: "זַיִן", sound: "z", exampleWord: "זְאֵב", emoji: "🐺", isFinal: !1 },
  { letter: "ח", name: "חֵית", nameNikud: "חֵית", sound: "ch", exampleWord: "חָתוּל", emoji: "🐱", isFinal: !1 },
  { letter: "ט", name: "טֵית", nameNikud: "טֵית", sound: "t", exampleWord: "טָלֶה", emoji: "🐑", isFinal: !1 },
  { letter: "י", name: "יוֹד", nameNikud: "יוֹד", sound: "y", exampleWord: "יוֹנָה", emoji: "🕊️", isFinal: !1 },
  { letter: "כ", name: "כַּף", nameNikud: "כַּף", sound: "k", exampleWord: "כֶּלֶב", emoji: "🐕", isFinal: !1 },
  { letter: "ךְ", name: "כָּף סוֹפִית", nameNikud: "כָּף סוֹפִית", sound: "k", exampleWord: "מֶלֶךְ", emoji: "👑", isFinal: !0 },
  { letter: "ל", name: "לָמַד", nameNikud: "לָמֵד", sound: "l", exampleWord: "לֵב", emoji: "❤️", isFinal: !1 },
  { letter: "מ", name: "מֵם", nameNikud: "מֵם", sound: "m", exampleWord: "מַיִם", emoji: "💧", isFinal: !1 },
  { letter: "םִ", name: "מֵם סוֹפִית", nameNikud: "מֵם סוֹפִית", sound: "m", exampleWord: "שָׂמִים", emoji: "🌤️", isFinal: !0 },
  { letter: "נ", name: "נוּן", nameNikud: "נוּן", sound: "n", exampleWord: "נָחָשׁ", emoji: "🐍", isFinal: !1 },
  { letter: "ן", name: "נוּן סוֹפִית", nameNikud: "נוּן סוֹפִית", sound: "n", exampleWord: "גַּן", emoji: "🌳", isFinal: !0 },
  { letter: "ס", name: "סֶמֶךְ", nameNikud: "סָמֶךְ", sound: "s", exampleWord: "סוּס", emoji: "🐎", isFinal: !1 },
  { letter: "ע", name: "עַיִן", nameNikud: "עַיִן", sound: "", exampleWord: "עַיִט", emoji: "🦅", isFinal: !1 },
  { letter: "פ", name: "פא", nameNikud: "פֵּא", sound: "p", exampleWord: "פִּיל", emoji: "🐘", isFinal: !1 },
  { letter: "ף", name: "פא סוֹפִית", nameNikud: "פֵּא סוֹפִית", sound: "p", exampleWord: "אַף", emoji: "👃", isFinal: !0 },
  { letter: "צ", name: "צִדֵּי", nameNikud: "צַדִּי", sound: "ts", exampleWord: "צָב", emoji: "🐢", isFinal: !1 },
  { letter: "ץ", name: "צִדֵּי סוֹפִית", nameNikud: "צַדִּי סוֹפִית", sound: "ts", exampleWord: "עֵץ", emoji: "🌲", isFinal: !0 },
  { letter: "ק", name: "קוֹף", nameNikud: "קוֹף", sound: "k", exampleWord: "קוֹף", emoji: "🐒", isFinal: !1 },
  { letter: "ר", name: "רֵישׁ", nameNikud: "רֵישׁ", sound: "r", exampleWord: "רֶכֶב", emoji: "🚗", isFinal: !1 },
  { letter: "ש", name: "שִׁין", nameNikud: "שִׁין", sound: "sh", exampleWord: "שֶׁמֶשׁ", emoji: "☀️", isFinal: !1 },
  { letter: "ת", name: "תָּו", nameNikud: "תָּו", sound: "t", exampleWord: "תַּפּוּחַ", emoji: "🍎", isFinal: !1 }
];
function _e(e) {
  return _.find((t) => t.letter === e) || null;
}
function le(e = "regular") {
  return e === "regular" ? _.filter((t) => !t.isFinal) : e === "final" ? _.filter((t) => t.isFinal) : _;
}
function ve(e, t = "regular") {
  const n = le(t);
  return [...n].sort(() => Math.random() - 0.5).slice(0, Math.min(e, n.length));
}
const x = [
  { id: "kamatz", name: "קָמָץ", nameNikud: "קָמָץ", symbol: "ָ", sound: "אָ", color: "#FF6B6B", textColor: "#fff" },
  { id: "patah", name: "פֶּתַח", nameNikud: "פָּתַח", symbol: "ַ", sound: "אָ", color: "#FF8C42", textColor: "#fff" },
  { id: "hiriq", name: "חִירִיק", nameNikud: "חִירִיק", symbol: "ִ", sound: "אִי", color: "#4ECDC4", textColor: "#fff" },
  { id: "tzere", name: "צָרָה", nameNikud: "צֵרֶה", symbol: "ֵ", sound: "אֶ", color: "#45B7D1", textColor: "#fff" },
  { id: "segol", name: "סָגֹול", nameNikud: "סְגוֹל", symbol: "ֶ", sound: "אֶ", color: "#9B59B6", textColor: "#fff" },
  { id: "holam", name: "חוֹלֵם", nameNikud: "חוֹלָם", symbol: "ֹ", sound: "אֹ", color: "#2ECC71", textColor: "#fff" },
  { id: "kubbutz", name: "קֻובּוּץ", nameNikud: "קֻבּוּץ", symbol: "ֻ", sound: "אֻ", color: "#F39C12", textColor: "#fff" }
], xe = ["א", "ב", "ג", "ד", "מ", "נ", "ל", "ר", "ש", "ת", "פ", "ק"];
function Ne(e, t) {
  return e + t;
}
function Le(e) {
  let t = [...x];
  if (typeof window < "u" && window.location && window.location.search) {
    const r = new URLSearchParams(window.location.search), a = r.get("allowedNikud");
    if (a) {
      const i = a.split(",").map((s) => s.trim());
      t = t.filter(
        (s) => i.includes(s.id) || i.includes(s.name) || i.includes(s.nameNikud)
      );
    }
    const o = r.get("excludedNikud");
    if (o) {
      const i = o.split(",").map((s) => s.trim());
      t = t.filter(
        (s) => !i.includes(s.id) && !i.includes(s.name) && !i.includes(s.nameNikud)
      );
    }
  }
  t.length === 0 && (t = [...x]);
  let n = [...t];
  for (; n.length < e; )
    n.push(...t);
  return n.sort(() => Math.random() - 0.5).slice(0, e);
}
function Ee(e, t, n) {
  e.innerHTML = "";
  const r = document.createElement("div");
  r.className = "option-cards-grid";
  const a = t.map((o) => {
    const i = document.createElement("button");
    return i.className = "option-card", i.dataset.id = o.id, i.innerHTML = `
      <span class="option-card__emoji">${o.emoji || ""}</span>
      <span class="option-card__text">${o.text}</span>
    `, i.addEventListener("click", () => {
      i.disabled || n(o);
    }), r.appendChild(i), { el: i, option: o };
  });
  return e.appendChild(r), {
    /** הַדָּגֵשׁ כַּרְטִיס לְפִי סוּג: 'correct' | 'wrong' | 'hint' */
    highlight(o, i) {
      a.forEach(({ el: s, option: c }) => {
        c.id === o && s.classList.add(`option-card--${i}`);
      });
    },
    /** נטרל את כל הכרטיסים */
    disable() {
      a.forEach(({ el: o }) => {
        o.disabled = !0;
      });
    },
    /** אפס את מצב הכרטיסים */
    reset() {
      a.forEach(({ el: o }) => {
        o.className = "option-card", o.disabled = !1;
      });
    },
    /** הסר את הרכיב */
    destroy() {
      e.innerHTML = "";
    }
  };
}
function Se(e, t) {
  const n = document.createElement("div");
  n.className = "progress-bar", n.setAttribute("role", "progressbar"), n.setAttribute("aria-valuemin", "0"), n.setAttribute("aria-valuemax", String(t)), n.innerHTML = `
    <div class="progress-bar__track">
      <div class="progress-bar__fill" style="width: 0%"></div>
    </div>
    <span class="progress-bar__label">0 / ${t}</span>
  `, e.appendChild(n);
  const r = n.querySelector(".progress-bar__fill"), a = n.querySelector(".progress-bar__label");
  return {
    /** עדכן את ההתקדמות */
    update(o) {
      const i = Math.round(o / t * 100);
      r.style.width = `${i}%`, a.textContent = `${o} / ${t}`, n.setAttribute("aria-valuenow", String(o));
    },
    /** הסר את הרכיב */
    destroy() {
      n.remove();
    }
  };
}
function Re(e) {
  const t = document.createElement("div");
  t.className = "feedback-message", t.setAttribute("aria-live", "polite"), t.setAttribute("role", "status"), e.appendChild(t);
  let n = null;
  function r(a, o, i = 1800) {
    clearTimeout(n), t.textContent = a, t.className = `feedback-message feedback-message--${o}`, n = setTimeout(() => {
      t.textContent = "", t.className = "feedback-message";
    }, i);
  }
  return {
    /** הצג משוב חיובי */
    correct(a = "!כָּל הַכָּבוֹד") {
      v.correct(), r(a, "correct"), y(t, "bounce");
    },
    /** הצג עידוד — נסה שוב */
    wrong(a = "נַסֵּה שׁוּב") {
      v.wrong(), r(a, "wrong"), y(t, "pulse");
    },
    /** הצג רמז */
    hint(a) {
      r(a, "hint"), y(t, "pulse");
    },
    /** הסר את הרכיב */
    destroy() {
      clearTimeout(n), t.remove();
    }
  };
}
function Ce(e, t) {
  let n = document.getElementById("nikud-settings");
  n || (n = document.createElement("div"), n.id = "nikud-settings", Object.assign(n.style, {
    position: "fixed",
    top: 0,
    left: 0,
    right: "0px",
    bottom: "0px",
    background: "rgba(0,0,0,0.5)",
    zIndex: 9999,
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  }), document.body.appendChild(n));
  const r = new URLSearchParams(window.location.search), a = r.get("allowedNikud") ? r.get("allowedNikud").split(",") : [];
  let o = `
    <div style="background:white; padding:1.5rem; border-radius:1rem; min-width:300px; text-align:center; color:#333; font-family:Heebo,Arial; direction:rtl;">
      <h2 style="margin-top:0">בחר ניקוד</h2>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; margin:1rem 0; text-align:right;">
  `;
  x.forEach((i) => {
    const s = a.length === 0 || a.includes(i.id) || a.includes(i.name);
    o += `
      <label style="display:flex; align-items:center; gap:0.5rem; cursor:pointer;">
        <input type="checkbox" value="${i.id}" class="nikud-filter-cb" ${s ? "checked" : ""} style="width:1.2rem;height:1.2rem;">
        <span>${i.nameNikud}</span>
      </label>
    `;
  }), o += `
      </div>
      <button id="save-settings-btn" style="padding:0.5rem 1rem; border-radius:0.5rem; background:#4f67ff; color:white; border:none; font-size:1.1rem; cursor:pointer;">שמור והתחל מחדש</button>
      <button id="close-settings-btn" style="padding:0.5rem 1rem; border-radius:0.5rem; background:#ddd; color:#333; border:none; font-size:1.1rem; cursor:pointer; margin-right:0.5rem;">ביטול</button>
    </div>
  `, n.innerHTML = o, n.style.display = "flex", document.getElementById("save-settings-btn").onclick = () => {
    const i = Array.from(n.querySelectorAll(".nikud-filter-cb")).filter((c) => c.checked).map((c) => c.value), s = new URL(window.location);
    i.length > 0 && i.length < x.length ? s.searchParams.set("allowedNikud", i.join(",")) : s.searchParams.delete("allowedNikud"), s.searchParams.delete("excludedNikud"), n.style.display = "none", window.history.replaceState({}, "", s), t && t(e);
  }, document.getElementById("close-settings-btn").onclick = () => {
    n.style.display = "none";
  };
}
function Te(e) {
  const t = document.createElement("div");
  t.className = "ab-zone", t.style.setProperty("--zone-color", e.color || "#4f67ff"), t.innerHTML = `
    <div class="ab-zone__symbol">${e.symbol || ""}</div>
    <div class="ab-zone__label">${e.label || ""}</div>
  `;
  const n = () => {
    e.onTap && e.onTap();
  };
  return t.addEventListener("click", n), {
    el: t,
    highlight(r) {
      t.classList.remove("ab-zone--correct", "ab-zone--hover"), r && t.classList.add(`ab-zone--${r}`);
    },
    reset() {
      t.classList.remove("ab-zone--correct", "ab-zone--hover");
    },
    destroy() {
      t.removeEventListener("click", n);
    }
  };
}
function Fe(e, t = "טוֹעֵן...") {
  e.innerHTML = `<div class="ab-loading">${t}</div>`;
}
function Pe(e) {
  e.innerHTML = "";
}
function Ae(e, t, n, r) {
  const a = e.querySelector(".game-header__spacer");
  if (!a) return null;
  const o = document.createElement("button");
  return o.className = "ab-header-btn", o.setAttribute("aria-label", n), o.textContent = t, o.onclick = r, a.innerHTML = "", a.appendChild(o), o;
}
function je(e, { size: t = "md" } = {}) {
  const n = document.createElement("div");
  n.className = `ab-nikud-box ab-nikud-box--${e.id} ab-nikud-box--${t}`;
  const r = document.createElement("div");
  r.className = "ab-nikud-box__mark", r.textContent = e.symbol;
  const a = document.createElement("div");
  return a.className = "ab-nikud-box__placeholder", n.appendChild(r), n.appendChild(a), n;
}
let f = null, d = null, R = 0, C = 0;
const N = /* @__PURE__ */ new Map();
function M(e, t) {
  var n;
  return ((n = document.elementFromPoint(e, t)) == null ? void 0 : n.closest('[data-drop-target="true"]')) || null;
}
function ce(e, t, n) {
  const r = e.getBoundingClientRect();
  R = r.width / 2, C = r.height / 2, d = e.cloneNode(!0), Object.assign(d.style, {
    position: "fixed",
    left: `${t - R}px`,
    top: `${n - C}px`,
    width: `${r.width}px`,
    height: `${r.height}px`,
    pointerEvents: "none",
    // keeps it out of elementFromPoint + hit-testing
    zIndex: "9999",
    opacity: "0.85",
    transform: "scale(1.12)",
    cursor: "grabbing",
    margin: "0"
  }), document.body.appendChild(d);
}
function de(e, t) {
  d && (d.style.left = `${e - R}px`, d.style.top = `${t - C}px`);
}
function ue() {
  d == null || d.remove(), d = null;
}
let u = null;
function me(e) {
  u !== e && (u == null || u.classList.remove("drop-target--hover"), u = e, e == null || e.classList.add("drop-target--hover"));
}
function fe() {
  u == null || u.classList.remove("drop-target--hover"), u = null;
}
function $e(e, t) {
  e.classList.add("drag-source");
  let n = null, r = null, a = null;
  function o() {
    n && (e.removeEventListener("pointermove", n), e.removeEventListener("pointerup", r), e.removeEventListener("pointercancel", a), n = r = a = null), fe(), ue(), e.classList.remove("drag-source--dragging"), f = null;
  }
  function i(s) {
    s.button !== void 0 && s.button !== 0 || (s.preventDefault(), f && o(), f = { el: e, data: t }, e.classList.add("drag-source--dragging"), ce(e, s.clientX, s.clientY), e.setPointerCapture(s.pointerId), n = (c) => {
      de(c.clientX, c.clientY), me(M(c.clientX, c.clientY));
    }, r = (c) => {
      const l = M(c.clientX, c.clientY);
      o(), l && N.has(l) && N.get(l).onDrop({ data: t, sourceEl: e, targetEl: l });
    }, a = () => o(), e.addEventListener("pointermove", n), e.addEventListener("pointerup", r), e.addEventListener("pointercancel", a));
  }
  return e.addEventListener("pointerdown", i), {
    destroy() {
      e.removeEventListener("pointerdown", i), (f == null ? void 0 : f.el) === e && o(), e.classList.remove("drag-source");
    }
  };
}
function We(e, t) {
  return e.setAttribute("data-drop-target", "true"), e.classList.add("drop-target--active"), N.set(e, { onDrop: t }), {
    destroy() {
      e.removeAttribute("data-drop-target"), e.classList.remove("drop-target--active", "drop-target--hover"), N.delete(e);
    }
  };
}
export {
  z as EventBus,
  pe as GameShell,
  q as GameState,
  Y as addNikud,
  y as animate,
  $e as createDragSource,
  We as createDropTarget,
  Re as createFeedback,
  je as createNikudBox,
  Ee as createOptionCards,
  Se as createProgressBar,
  be as createRoundManager,
  ke as createSpeechListener,
  Te as createZone,
  _e as getLetter,
  le as getLettersByGroup,
  V as getNikud,
  _ as hebrewLetters,
  Pe as hideLoadingScreen,
  Ae as injectHeaderButton,
  Ne as letterWithNikud,
  ye as matchNikudSound,
  xe as nikudBaseLetters,
  x as nikudList,
  ge as preloadNikud,
  ve as randomLetters,
  Le as randomNikud,
  oe as showCompletionScreen,
  Fe as showLoadingScreen,
  Ce as showNikudSettingsDialog,
  v as sounds,
  we as tts
};
