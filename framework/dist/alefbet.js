class H {
  constructor() {
    this._handlers = {};
  }
  /** הירשם לאירוע */
  on(t, n) {
    return this._handlers[t] || (this._handlers[t] = []), this._handlers[t].push(n), this;
  }
  /** בטל הרשמה לאירוע */
  off(t, n) {
    return this._handlers[t] ? (this._handlers[t] = this._handlers[t].filter((a) => a !== n), this) : this;
  }
  /** שלח אירוע */
  emit(t, n) {
    return (this._handlers[t] || []).slice().forEach((a) => a(n)), this;
  }
}
class D {
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
class ge {
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
    }, this.events = new H(), this.state = new D(this.config.totalRounds), this._buildShell();
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
let b = null;
function q() {
  if (!b)
    try {
      b = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      return null;
    }
  return b.state === "suspended" && b.resume(), b;
}
function p(e, t, n = "sine", a = 0.3) {
  const r = q();
  if (r)
    try {
      const o = r.createOscillator(), i = r.createGain();
      o.connect(i), i.connect(r.destination), o.type = n, o.frequency.setValueAtTime(e, r.currentTime), i.gain.setValueAtTime(a, r.currentTime), i.gain.exponentialRampToValueAtTime(1e-3, r.currentTime + t), o.start(r.currentTime), o.stop(r.currentTime + t + 0.05);
    } catch {
    }
}
const L = {
  /** צליל תשובה נכונה */
  correct() {
    p(523.25, 0.15), setTimeout(() => p(659.25, 0.2), 120), setTimeout(() => p(783.99, 0.3), 240);
  },
  /** צליל עידוד עדין — נסה שוב */
  wrong() {
    p(350, 0.15, "triangle", 0.12);
  },
  /** צליל עידוד - סיום מוצלח */
  cheer() {
    [523.25, 587.33, 659.25, 698.46, 783.99, 1046.5].forEach((t, n) => setTimeout(() => p(t, 0.2), n * 90));
  },
  /** קליק עדין */
  click() {
    p(900, 0.04, "sine", 0.12);
  }
}, A = "https://nakdan-u1-0.loadbalancer.dicta.org.il/api";
let j = !1;
const v = /* @__PURE__ */ new Map();
function O() {
  var r;
  if (typeof window > "u") return A;
  const e = new URLSearchParams(window.location.search).get("nakdanProxy"), t = window.ALEFBET_NAKDAN_PROXY_URL;
  if (e && window.localStorage)
    try {
      window.localStorage.setItem("alefbet.nakdanProxyUrl", e);
    } catch {
    }
  const n = (r = window.localStorage) == null ? void 0 : r.getItem("alefbet.nakdanProxyUrl"), a = e || t || n;
  return a || (window.location.hostname.endsWith("github.io") ? null : A);
}
function X(e) {
  var n;
  let t = "";
  for (const a of e)
    if (a.sep)
      t += a.str ?? "";
    else {
      const r = (n = a.nakdan) == null ? void 0 : n.options;
      r != null && r.length ? t += (r[0].w ?? "").replace(/\|/g, "").replace(/\u05BD/g, "") : t += a.str ?? "";
    }
  return t;
}
async function G(e) {
  const t = O();
  if (!t)
    throw j || (j = !0, console.warn("[nakdan] Dicta API blocked by CORS on GitHub Pages. Configure a proxy URL via ?nakdanProxy=..., window.ALEFBET_NAKDAN_PROXY_URL, or localStorage key alefbet.nakdanProxyUrl.")), new Error("Nakdan unavailable without proxy on this host");
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
  const a = await n.json(), r = a == null ? void 0 : a.data;
  if (!Array.isArray(r)) throw new Error("Nakdan: invalid response");
  return X(r);
}
async function V(e) {
  if (!(e != null && e.trim())) return e ?? "";
  if (v.has(e)) return v.get(e);
  try {
    const t = await G(e);
    return v.set(e, t), t;
  } catch {
    return v.set(e, e), e;
  }
}
function Y(e) {
  return v.get(e) ?? e ?? "";
}
async function we(e) {
  const t = [...new Set(e.filter((n) => n == null ? void 0 : n.trim()))];
  await Promise.all(t.map((n) => V(n)));
}
let w = [], _ = !1, z = !0, y = 0.9, $ = typeof localStorage < "u" && parseFloat(localStorage.getItem("alefbet.nikudRate")) || 0.5, R = !1, k = null;
function W(e, t, n, a = t) {
  console.warn(`[tts] ${e} TTS failed`, { text: t, sentText: a, reason: n }), typeof window < "u" && typeof window.dispatchEvent == "function" && window.dispatchEvent(new CustomEvent("alefbet:tts-error", {
    detail: { provider: e, text: t, sentText: a, reason: n }
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
  return typeof window > "u" || typeof document > "u" ? Promise.resolve() : R || (e = document.userActivation) != null && e.hasBeenActive ? (R = !0, Promise.resolve()) : k || (k = new Promise((t) => {
    const n = () => {
      R = !0, window.removeEventListener("pointerdown", n, !0), window.removeEventListener("keydown", n, !0), window.removeEventListener("touchstart", n, !0), t();
    };
    window.addEventListener("pointerdown", n, { once: !0, capture: !0 }), window.addEventListener("keydown", n, { once: !0, capture: !0 }), window.addEventListener("touchstart", n, { once: !0, capture: !0 });
  }).finally(() => {
    k = null;
  }), k);
}
function Z(e, t, n) {
  const r = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(e)}&tl=he&client=tw-ob`, o = new Audio(r);
  o.playbackRate = y, o.onended = t, o.onerror = () => n("audio.onerror"), o.play().catch((i) => {
    n((i == null ? void 0 : i.message) || "audio.play() rejected");
  });
}
function ee(e) {
  return new Promise((t, n) => {
    const a = K(e).trim() || e;
    let r = !1, o = !1;
    const i = () => {
      r || (r = !0, t());
    }, s = (l) => {
      r || (r = !0, n(l));
    }, c = () => {
      try {
        Z(a, i, (l) => {
          if (!o && J(l)) {
            o = !0, Q().then(() => {
              r || c();
            });
            return;
          }
          W("google", e, l, a), s(l);
        });
      } catch (l) {
        W("google", e, (l == null ? void 0 : l.message) || "Audio() construction failed", a), s(l == null ? void 0 : l.message);
      }
    };
    c();
  });
}
let C = null;
function te() {
  const e = speechSynthesis.getVoices();
  return e.find((t) => t.lang === "he-IL") || e.find((t) => t.lang === "iw-IL") || e.find((t) => t.lang.startsWith("he")) || null;
}
function M() {
  C = te();
}
typeof speechSynthesis < "u" && (speechSynthesis.getVoices().length > 0 ? M() : speechSynthesis.addEventListener("voiceschanged", M, { once: !0 }));
function ne(e) {
  return new Promise((t) => {
    if (typeof speechSynthesis > "u") {
      t();
      return;
    }
    const n = new SpeechSynthesisUtterance(e);
    n.lang = "he-IL", n.rate = y, C && (n.voice = C), n.onend = t, n.onerror = t, speechSynthesis.speak(n);
  });
}
async function ae(e) {
  if (z)
    try {
      await ee(e);
      return;
    } catch {
      console.info("[tts] Falling back to browser Speech API");
    }
  await ne(e);
}
function F() {
  if (_ || w.length === 0) return;
  const e = w.shift();
  _ = !0, ae(e.text).then(() => {
    _ = !1, e.resolve(), F();
  });
}
const re = {
  /**
   * הקרא טקסט עברי
   * משתמש ב-Google Translate TTS לאיכות טובה יותר
   */
  speak(e) {
    const t = Y(e);
    return new Promise((n) => {
      w.push({ text: t, resolve: n }), F();
    });
  },
  /** עצור את הדיבור הנוכחי */
  cancel() {
    w.forEach((e) => e.resolve()), w = [], _ = !1, typeof speechSynthesis < "u" && speechSynthesis.cancel();
  },
  get available() {
    return !0;
  },
  /** הגדר מהירות דיבור (0.5–2.0) */
  setRate(e) {
    y = Math.max(0.5, Math.min(2, e));
  },
  /** השתמש ב-Google Translate TTS (ברירת מחדל) או בדפדפן */
  useGoogle(e = !0) {
    z = e;
  },
  /**
   * הגדר מהירות דיבור להדגשת ניקוד
   * @param {{ rate?: number }} opts
   *   rate: מהירות דיבור להדגשה (ברירת מחדל 0.5)
   */
  setNikudEmphasis({ rate: e } = {}) {
    e != null && ($ = Math.max(0.3, Math.min(1.5, e)));
  },
  /**
   * הקרא אות עם ניקוד באיטיות להדגשת התנועה
   * @param {string} letter - האות (למשל 'ב')
   * @param {string} nikudSymbol - סמל הניקוד (למשל '\u05B7')
   */
  speakNikud(e, t) {
    const n = e + t, a = y;
    return y = $, new Promise((r) => {
      w.push({ text: n, resolve: r }), F();
    }).finally(() => {
      y = a;
    });
  }
}, B = {
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
}, oe = {
  shake: 420,
  bounce: 480,
  pulse: 600,
  fadeIn: 320,
  confetti: 700
};
function x(e, t) {
  !e || !B[t] || e.animate(B[t], {
    duration: oe[t] || 400,
    easing: "ease-in-out",
    fill: "none"
  });
}
function ie(e, t, n, a) {
  L.cheer();
  const r = t / n, o = r >= 0.8 ? 3 : r >= 0.5 ? 2 : 1, i = "⭐".repeat(o) + "☆".repeat(3 - o), s = document.createElement("div");
  s.className = "completion-screen", s.innerHTML = `
    <div class="completion-screen__content">
      <div class="completion-screen__stars" aria-label="${o} כּוֹכָבִים">${i}</div>
      <h2 class="completion-screen__title">!כָּל הַכָּבוֹד</h2>
      <p class="completion-screen__score">נִיקּוּד: ${t} מִתּוֹךְ ${n}</p>
      <button class="completion-screen__replay btn btn--primary">שַׂחֵק שׁוּב</button>
    </div>
  `, s.querySelector(".completion-screen__replay").addEventListener("click", () => {
    s.remove(), a();
  }), e.innerHTML = "", e.appendChild(s), x(s.querySelector(".completion-screen__content"), "fadeIn");
}
function ye(e, t, {
  totalRounds: n,
  progressBar: a = null,
  buildRoundUI: r,
  onCorrect: o,
  onWrong: i
} = {}) {
  let s = !1;
  async function c(h) {
    if (s) return;
    s = !0, L.correct(), h && await h(), o && await o(), e.state.addScore(1), a == null || a.update(e.state.currentRound), await new Promise((U) => setTimeout(U, 1200)), e.state.nextRound() ? (s = !1, r()) : ie(t, e.state.score, n, () => {
      location.reload();
    });
  }
  async function l() {
    s || (s = !0, i && await i(), s = !1);
  }
  function m() {
    return s;
  }
  function f() {
    s = !1;
  }
  return { handleCorrect: c, handleWrong: l, isAnswered: m, reset: f };
}
const se = {
  kamatz: "ah",
  patah: "ah",
  tzere: "eh",
  segol: "eh",
  hiriq: "ee",
  holam: "oh",
  kubbutz: "oo"
}, le = {
  ah: [/[אה]/, /^א$/, /אא/, /הא/],
  eh: [/[אה]/, /^א$/, /אא/, /הא/, /אה/],
  ee: [/[אי]/, /^י$/, /אי/, /הי/],
  oh: [/[או]/, /^[או]$/, /או/, /הו/],
  oo: [/[או]/, /^[או]$/, /או/, /הו/, /אוּ/]
};
function be() {
  const e = typeof window < "u" ? window.SpeechRecognition || window.webkitSpeechRecognition : null, t = !!e;
  let n = null;
  return {
    available: t,
    listen(a = 4e3) {
      return t ? new Promise((r) => {
        n = new e(), n.lang = "he-IL", n.continuous = !1, n.interimResults = !1, n.maxAlternatives = 3;
        let o = !1;
        const i = (c, l) => {
          o || (o = !0, n = null, r({ text: c.trim(), confidence: l }));
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
        }, a);
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
function ke(e, t) {
  if (!e || !t) return !1;
  const n = se[t];
  if (!n) return !1;
  const a = le[n];
  if (!a) return !1;
  const r = e.replace(/[\s.,!?]/g, "");
  return r.length ? a.some((o) => o.test(r)) : !1;
}
const N = [
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
function ve(e) {
  return N.find((t) => t.letter === e) || null;
}
function ce(e = "regular") {
  return e === "regular" ? N.filter((t) => !t.isFinal) : e === "final" ? N.filter((t) => t.isFinal) : N;
}
function _e(e, t = "regular") {
  const n = ce(t);
  return [...n].sort(() => Math.random() - 0.5).slice(0, Math.min(e, n.length));
}
const S = [
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
  let t = [...S];
  if (typeof window < "u" && window.location && window.location.search) {
    const a = new URLSearchParams(window.location.search), r = a.get("allowedNikud");
    if (r) {
      const i = r.split(",").map((s) => s.trim());
      t = t.filter(
        (s) => i.includes(s.id) || i.includes(s.name) || i.includes(s.nameNikud)
      );
    }
    const o = a.get("excludedNikud");
    if (o) {
      const i = o.split(",").map((s) => s.trim());
      t = t.filter(
        (s) => !i.includes(s.id) && !i.includes(s.name) && !i.includes(s.nameNikud)
      );
    }
  }
  t.length === 0 && (t = [...S]);
  let n = [...t];
  for (; n.length < e; )
    n.push(...t);
  return n.sort(() => Math.random() - 0.5).slice(0, e);
}
function Se(e, t, n) {
  e.innerHTML = "";
  const a = document.createElement("div");
  a.className = "option-cards-grid";
  const r = t.map((o) => {
    const i = document.createElement("button");
    return i.className = "option-card", i.dataset.id = o.id, i.innerHTML = `
      <span class="option-card__emoji">${o.emoji || ""}</span>
      <span class="option-card__text">${o.text}</span>
    `, i.addEventListener("click", () => {
      i.disabled || n(o);
    }), a.appendChild(i), { el: i, option: o };
  });
  return e.appendChild(a), {
    /** הַדָּגֵשׁ כַּרְטִיס לְפִי סוּג: 'correct' | 'wrong' | 'hint' */
    highlight(o, i) {
      r.forEach(({ el: s, option: c }) => {
        c.id === o && s.classList.add(`option-card--${i}`);
      });
    },
    /** נטרל את כל הכרטיסים */
    disable() {
      r.forEach(({ el: o }) => {
        o.disabled = !0;
      });
    },
    /** אפס את מצב הכרטיסים */
    reset() {
      r.forEach(({ el: o }) => {
        o.className = "option-card", o.disabled = !1;
      });
    },
    /** הסר את הרכיב */
    destroy() {
      e.innerHTML = "";
    }
  };
}
function Ee(e, t) {
  const n = document.createElement("div");
  n.className = "progress-bar", n.setAttribute("role", "progressbar"), n.setAttribute("aria-valuemin", "0"), n.setAttribute("aria-valuemax", String(t)), n.innerHTML = `
    <div class="progress-bar__track">
      <div class="progress-bar__fill" style="width: 0%"></div>
    </div>
    <span class="progress-bar__label">0 / ${t}</span>
  `, e.appendChild(n);
  const a = n.querySelector(".progress-bar__fill"), r = n.querySelector(".progress-bar__label");
  return {
    /** עדכן את ההתקדמות */
    update(o) {
      const i = Math.round(o / t * 100);
      a.style.width = `${i}%`, r.textContent = `${o} / ${t}`, n.setAttribute("aria-valuenow", String(o));
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
  function a(r, o, i = 1800) {
    clearTimeout(n), t.textContent = r, t.className = `feedback-message feedback-message--${o}`, n = setTimeout(() => {
      t.textContent = "", t.className = "feedback-message";
    }, i);
  }
  return {
    /** הצג משוב חיובי */
    correct(r = "!כָּל הַכָּבוֹד") {
      L.correct(), a(r, "correct"), x(t, "bounce");
    },
    /** הצג עידוד — נסה שוב */
    wrong(r = "נַסֵּה שׁוּב") {
      L.wrong(), a(r, "wrong"), x(t, "pulse");
    },
    /** הצג רמז */
    hint(r) {
      a(r, "hint"), x(t, "pulse");
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
  const a = new URLSearchParams(window.location.search), r = a.get("allowedNikud") ? a.get("allowedNikud").split(",") : [];
  let o = `
    <div style="background:white; padding:1.5rem; border-radius:1rem; min-width:300px; text-align:center; color:#333; font-family:Heebo,Arial; direction:rtl;">
      <h2 style="margin-top:0">בחר ניקוד</h2>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; margin:1rem 0; text-align:right;">
  `;
  S.forEach((l) => {
    const m = r.length === 0 || r.includes(l.id) || r.includes(l.name);
    o += `
      <label style="display:flex; align-items:center; gap:0.5rem; cursor:pointer;">
        <input type="checkbox" value="${l.id}" class="nikud-filter-cb" ${m ? "checked" : ""} style="width:1.2rem;height:1.2rem;">
        <span>${l.nameNikud}</span>
      </label>
    `;
  });
  const i = parseFloat(localStorage.getItem("alefbet.nikudRate")) || 0.5;
  o += `
      </div>
      <div style="margin:1rem 0; text-align:right;">
        <label style="font-weight:700; font-size:0.95rem;">מהירות הגייה: <span id="nikud-rate-val">${i}</span></label>
        <input type="range" id="nikud-rate-slider" min="0.3" max="1.5" step="0.1" value="${i}" style="width:100%; margin-top:0.3rem; accent-color:#4f67ff;">
        <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:#888;">
          <span>אִטִּי</span>
          <span>מָהִיר</span>
        </div>
      </div>
      <button id="save-settings-btn" style="padding:0.5rem 1rem; border-radius:0.5rem; background:#4f67ff; color:white; border:none; font-size:1.1rem; cursor:pointer;">שמור והתחל מחדש</button>
      <button id="close-settings-btn" style="padding:0.5rem 1rem; border-radius:0.5rem; background:#ddd; color:#333; border:none; font-size:1.1rem; cursor:pointer; margin-right:0.5rem;">ביטול</button>
    </div>
  `, n.innerHTML = o, n.style.display = "flex";
  const s = document.getElementById("nikud-rate-slider"), c = document.getElementById("nikud-rate-val");
  s.oninput = () => {
    c.textContent = s.value;
  }, document.getElementById("save-settings-btn").onclick = () => {
    const l = parseFloat(s.value);
    localStorage.setItem("alefbet.nikudRate", l), re.setNikudEmphasis({ rate: l });
    const m = Array.from(n.querySelectorAll(".nikud-filter-cb")).filter((h) => h.checked).map((h) => h.value), f = new URL(window.location);
    m.length > 0 && m.length < S.length ? f.searchParams.set("allowedNikud", m.join(",")) : f.searchParams.delete("allowedNikud"), f.searchParams.delete("excludedNikud"), n.style.display = "none", window.history.replaceState({}, "", f), t && t(e);
  }, document.getElementById("close-settings-btn").onclick = () => {
    n.style.display = "none";
  };
}
function Fe(e) {
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
    highlight(a) {
      t.classList.remove("ab-zone--correct", "ab-zone--hover"), a && t.classList.add(`ab-zone--${a}`);
    },
    reset() {
      t.classList.remove("ab-zone--correct", "ab-zone--hover");
    },
    destroy() {
      t.removeEventListener("click", n);
    }
  };
}
function Te(e, t = "טוֹעֵן...") {
  e.innerHTML = `<div class="ab-loading">${t}</div>`;
}
function Pe(e) {
  e.innerHTML = "";
}
function Ae(e, t, n, a) {
  const r = e.querySelector(".game-header__spacer");
  if (!r) return null;
  const o = document.createElement("button");
  return o.className = "ab-header-btn", o.setAttribute("aria-label", n), o.textContent = t, o.onclick = a, r.innerHTML = "", r.appendChild(o), o;
}
function je(e, { size: t = "md" } = {}) {
  const n = document.createElement("div");
  n.className = `ab-nikud-box ab-nikud-box--${t}`;
  const a = document.createElement("span");
  return a.className = "ab-nikud-box__letter", a.textContent = "א" + e.symbol, n.appendChild(a), n;
}
let g = null, d = null, T = 0, P = 0;
const E = /* @__PURE__ */ new Map();
function I(e, t) {
  var n;
  return ((n = document.elementFromPoint(e, t)) == null ? void 0 : n.closest('[data-drop-target="true"]')) || null;
}
function de(e, t, n) {
  const a = e.getBoundingClientRect();
  T = a.width / 2, P = a.height / 2, d = e.cloneNode(!0), Object.assign(d.style, {
    position: "fixed",
    left: `${t - T}px`,
    top: `${n - P}px`,
    width: `${a.width}px`,
    height: `${a.height}px`,
    pointerEvents: "none",
    // keeps it out of elementFromPoint + hit-testing
    zIndex: "9999",
    opacity: "0.85",
    transform: "scale(1.12)",
    cursor: "grabbing",
    margin: "0"
  }), document.body.appendChild(d);
}
function ue(e, t) {
  d && (d.style.left = `${e - T}px`, d.style.top = `${t - P}px`);
}
function me() {
  d == null || d.remove(), d = null;
}
let u = null;
function fe(e) {
  u !== e && (u == null || u.classList.remove("drop-target--hover"), u = e, e == null || e.classList.add("drop-target--hover"));
}
function he() {
  u == null || u.classList.remove("drop-target--hover"), u = null;
}
function $e(e, t) {
  e.classList.add("drag-source");
  let n = null, a = null, r = null;
  function o() {
    n && (e.removeEventListener("pointermove", n), e.removeEventListener("pointerup", a), e.removeEventListener("pointercancel", r), n = a = r = null), he(), me(), e.classList.remove("drag-source--dragging"), g = null;
  }
  function i(s) {
    s.button !== void 0 && s.button !== 0 || (s.preventDefault(), g && o(), g = { el: e, data: t }, e.classList.add("drag-source--dragging"), de(e, s.clientX, s.clientY), e.setPointerCapture(s.pointerId), n = (c) => {
      ue(c.clientX, c.clientY), fe(I(c.clientX, c.clientY));
    }, a = (c) => {
      const l = I(c.clientX, c.clientY);
      o(), l && E.has(l) && E.get(l).onDrop({ data: t, sourceEl: e, targetEl: l });
    }, r = () => o(), e.addEventListener("pointermove", n), e.addEventListener("pointerup", a), e.addEventListener("pointercancel", r));
  }
  return e.addEventListener("pointerdown", i), {
    destroy() {
      e.removeEventListener("pointerdown", i), (g == null ? void 0 : g.el) === e && o(), e.classList.remove("drag-source");
    }
  };
}
function We(e, t) {
  return e.setAttribute("data-drop-target", "true"), e.classList.add("drop-target--active"), E.set(e, { onDrop: t }), {
    destroy() {
      e.removeAttribute("data-drop-target"), e.classList.remove("drop-target--active", "drop-target--hover"), E.delete(e);
    }
  };
}
export {
  H as EventBus,
  ge as GameShell,
  D as GameState,
  V as addNikud,
  x as animate,
  $e as createDragSource,
  We as createDropTarget,
  Re as createFeedback,
  je as createNikudBox,
  Se as createOptionCards,
  Ee as createProgressBar,
  ye as createRoundManager,
  be as createSpeechListener,
  Fe as createZone,
  ve as getLetter,
  ce as getLettersByGroup,
  Y as getNikud,
  N as hebrewLetters,
  Pe as hideLoadingScreen,
  Ae as injectHeaderButton,
  Ne as letterWithNikud,
  ke as matchNikudSound,
  xe as nikudBaseLetters,
  S as nikudList,
  we as preloadNikud,
  _e as randomLetters,
  Le as randomNikud,
  ie as showCompletionScreen,
  Te as showLoadingScreen,
  Ce as showNikudSettingsDialog,
  L as sounds,
  re as tts
};
