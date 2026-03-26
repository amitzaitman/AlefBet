class ee {
  constructor() {
    this._handlers = {};
  }
  /** הירשם לאירוע */
  on(e, t) {
    return this._handlers[e] || (this._handlers[e] = []), this._handlers[e].push(t), this;
  }
  /** בטל הרשמה לאירוע */
  off(e, t) {
    return this._handlers[e] ? (this._handlers[e] = this._handlers[e].filter((a) => a !== t), this) : this;
  }
  /** שלח אירוע */
  emit(e, t) {
    return (this._handlers[e] || []).slice().forEach((a) => a(t)), this;
  }
}
class te {
  constructor(e) {
    this._totalRounds = e, this._currentRound = 0, this._score = 0;
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
  addScore(e) {
    this._score += e;
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
class Fe {
  /**
   * @param {HTMLElement} containerEl - אלמנט המיכל
   * @param {object} config - הגדרות: { totalRounds, title, homeUrl }
   */
  constructor(e, t = {}) {
    this.container = e, this.config = {
      totalRounds: 8,
      title: "מִשְׂחָק",
      homeUrl: "../../index.html",
      ...t
    }, this.events = new ee(), this.state = new te(this.config.totalRounds), this._buildShell();
  }
  _buildShell() {
    this.container.classList.add("alefbet-game");
    const e = this.config.homeUrl ? `<a href="${this.config.homeUrl}" class="game-back-btn" aria-label="סִפְרִיַּית מִשְׂחָקִים">🏠</a>` : '<div class="game-header__spacer"></div>';
    this.container.innerHTML = `
      <div class="game-header">
        <div class="game-header__spacer"></div>
        <h1 class="game-title"></h1>
        ${e}
      </div>
      <div class="game-body"></div>
      <div class="game-footer"></div>
    `, this.titleEl = this.container.querySelector(".game-title"), this.bodyEl = this.container.querySelector(".game-body"), this.footerEl = this.container.querySelector(".game-footer"), this.setTitle(this.config.title);
  }
  /** עדכן את כותרת המשחק */
  setTitle(e) {
    this.titleEl.textContent = e;
  }
  /** התחל את המשחק */
  start() {
    this.state.nextRound(), this.events.emit("start", { state: this.state });
  }
  /** עבור לסיבוב הבא */
  nextRound() {
    const e = this.state.nextRound();
    return e ? this.events.emit("round", { state: this.state }) : this.end(this.state.score), e;
  }
  /** סיים את המשחק */
  end(e) {
    this.events.emit("end", { score: e, state: this.state });
  }
  /** קבל את מצב המשחק הנוכחי */
  getState() {
    return this.state;
  }
  /** הירשם לאירועי מחזור החיים: start, round, end */
  on(e, t) {
    return this.events.on(e, t), this;
  }
}
let L = null;
function ne() {
  if (!L)
    try {
      L = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      return null;
    }
  return L.state === "suspended" && L.resume(), L;
}
function w(n, e, t = "sine", a = 0.3) {
  const i = ne();
  if (i)
    try {
      const o = i.createOscillator(), r = i.createGain();
      o.connect(r), r.connect(i.destination), o.type = t, o.frequency.setValueAtTime(n, i.currentTime), r.gain.setValueAtTime(a, i.currentTime), r.gain.exponentialRampToValueAtTime(1e-3, i.currentTime + e), o.start(i.currentTime), o.stop(i.currentTime + e + 0.05);
    } catch {
    }
}
const j = {
  /** צליל תשובה נכונה */
  correct() {
    w(523.25, 0.15), setTimeout(() => w(659.25, 0.2), 120), setTimeout(() => w(783.99, 0.3), 240);
  },
  /** צליל עידוד עדין — נסה שוב */
  wrong() {
    w(350, 0.15, "triangle", 0.12);
  },
  /** צליל עידוד - סיום מוצלח */
  cheer() {
    [523.25, 587.33, 659.25, 698.46, 783.99, 1046.5].forEach((e, t) => setTimeout(() => w(e, 0.2), t * 90));
  },
  /** קליק עדין */
  click() {
    w(900, 0.04, "sine", 0.12);
  }
}, U = "https://nakdan-u1-0.loadbalancer.dicta.org.il/api";
let O = !1;
const S = /* @__PURE__ */ new Map();
function ae() {
  var i;
  if (typeof window > "u") return U;
  const n = new URLSearchParams(window.location.search).get("nakdanProxy"), e = window.ALEFBET_NAKDAN_PROXY_URL;
  if (n && window.localStorage)
    try {
      window.localStorage.setItem("alefbet.nakdanProxyUrl", n);
    } catch {
    }
  const t = (i = window.localStorage) == null ? void 0 : i.getItem("alefbet.nakdanProxyUrl"), a = n || e || t;
  return a || (window.location.hostname.endsWith("github.io") ? null : U);
}
function ie(n) {
  var t;
  let e = "";
  for (const a of n)
    if (a.sep)
      e += a.str ?? "";
    else {
      const i = (t = a.nakdan) == null ? void 0 : t.options;
      i != null && i.length ? e += (i[0].w ?? "").replace(/\|/g, "").replace(/\u05BD/g, "") : e += a.str ?? "";
    }
  return e;
}
async function oe(n) {
  const e = ae();
  if (!e)
    throw O || (O = !0, console.warn("[nakdan] Dicta API blocked by CORS on GitHub Pages. Configure a proxy URL via ?nakdanProxy=..., window.ALEFBET_NAKDAN_PROXY_URL, or localStorage key alefbet.nakdanProxyUrl.")), new Error("Nakdan unavailable without proxy on this host");
  const t = await fetch(e, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      addmorph: !0,
      keepmetagim: !1,
      keepqq: !1,
      nodageshdefmem: !1,
      patachma: !1,
      task: "nakdan",
      data: n,
      useTokenization: !0,
      genre: "modern"
    })
  });
  if (!t.ok) throw new Error(`Nakdan ${t.status}`);
  const a = await t.json(), i = a == null ? void 0 : a.data;
  if (!Array.isArray(i)) throw new Error("Nakdan: invalid response");
  return ie(i);
}
async function se(n) {
  if (!(n != null && n.trim())) return n ?? "";
  if (S.has(n)) return S.get(n);
  try {
    const e = await oe(n);
    return S.set(n, e), e;
  } catch {
    return S.set(n, n), n;
  }
}
function re(n) {
  return S.get(n) ?? n ?? "";
}
async function Ie(n) {
  const e = [...new Set(n.filter((t) => t == null ? void 0 : t.trim()))];
  await Promise.all(e.map((t) => se(t)));
}
let E = [], T = !1, K = !0, N = 0.9, q = typeof localStorage < "u" && parseFloat(localStorage.getItem("alefbet.nikudRate")) || 0.5, P = !1, R = null;
function z(n, e, t, a = e) {
  console.warn(`[tts] ${n} TTS failed`, { text: e, sentText: a, reason: t }), typeof window < "u" && typeof window.dispatchEvent == "function" && window.dispatchEvent(new CustomEvent("alefbet:tts-error", {
    detail: { provider: n, text: e, sentText: a, reason: t }
  }));
}
function le(n) {
  return (n || "").replace(/[\u0591-\u05C7]/g, "");
}
function de(n) {
  const e = String(n || "").toLowerCase();
  return e.includes("didn't interact") || e.includes("notallowed");
}
function ce() {
  var n;
  return typeof window > "u" || typeof document > "u" ? Promise.resolve() : P || (n = document.userActivation) != null && n.hasBeenActive ? (P = !0, Promise.resolve()) : R || (R = new Promise((e) => {
    const t = () => {
      P = !0, window.removeEventListener("pointerdown", t, !0), window.removeEventListener("keydown", t, !0), window.removeEventListener("touchstart", t, !0), e();
    };
    window.addEventListener("pointerdown", t, { once: !0, capture: !0 }), window.addEventListener("keydown", t, { once: !0, capture: !0 }), window.addEventListener("touchstart", t, { once: !0, capture: !0 });
  }).finally(() => {
    R = null;
  }), R);
}
function ue(n, e, t) {
  const i = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(n)}&tl=he&client=tw-ob`, o = new Audio(i);
  o.playbackRate = N, o.onended = e, o.onerror = () => t("audio.onerror"), o.play().catch((r) => {
    t((r == null ? void 0 : r.message) || "audio.play() rejected");
  });
}
function me(n) {
  return new Promise((e, t) => {
    const a = le(n).trim() || n;
    let i = !1, o = !1;
    const r = () => {
      i || (i = !0, e());
    }, s = (l) => {
      i || (i = !0, t(l));
    }, c = () => {
      try {
        ue(a, r, (l) => {
          if (!o && de(l)) {
            o = !0, ce().then(() => {
              i || c();
            });
            return;
          }
          z("google", n, l, a), s(l);
        });
      } catch (l) {
        z("google", n, (l == null ? void 0 : l.message) || "Audio() construction failed", a), s(l == null ? void 0 : l.message);
      }
    };
    c();
  });
}
let B = null;
function he() {
  const n = speechSynthesis.getVoices();
  return n.find((e) => e.lang === "he-IL") || n.find((e) => e.lang === "iw-IL") || n.find((e) => e.lang.startsWith("he")) || null;
}
function G() {
  B = he();
}
typeof speechSynthesis < "u" && (speechSynthesis.getVoices().length > 0 ? G() : speechSynthesis.addEventListener("voiceschanged", G, { once: !0 }));
function pe(n) {
  return new Promise((e) => {
    if (typeof speechSynthesis > "u") {
      e();
      return;
    }
    const t = new SpeechSynthesisUtterance(n);
    t.lang = "he-IL", t.rate = N, B && (t.voice = B), t.onend = e, t.onerror = e, speechSynthesis.speak(t);
  });
}
async function fe(n) {
  if (K)
    try {
      await me(n);
      return;
    } catch {
      console.info("[tts] Falling back to browser Speech API");
    }
  await pe(n);
}
function D() {
  if (T || E.length === 0) return;
  const n = E.shift();
  T = !0, fe(n.text).then(() => {
    T = !1, n.resolve(), D();
  });
}
const be = {
  /**
   * הקרא טקסט עברי
   * משתמש ב-Google Translate TTS לאיכות טובה יותר
   */
  speak(n) {
    const e = re(n);
    return new Promise((t) => {
      E.push({ text: e, resolve: t }), D();
    });
  },
  /** עצור את הדיבור הנוכחי */
  cancel() {
    E.forEach((n) => n.resolve()), E = [], T = !1, typeof speechSynthesis < "u" && speechSynthesis.cancel();
  },
  get available() {
    return !0;
  },
  /** הגדר מהירות דיבור (0.5–2.0) */
  setRate(n) {
    N = Math.max(0.5, Math.min(2, n));
  },
  /** השתמש ב-Google Translate TTS (ברירת מחדל) או בדפדפן */
  useGoogle(n = !0) {
    K = n;
  },
  /**
   * הגדר מהירות דיבור להדגשת ניקוד
   * @param {{ rate?: number }} opts
   *   rate: מהירות דיבור להדגשה (ברירת מחדל 0.5)
   */
  setNikudEmphasis({ rate: n } = {}) {
    n != null && (q = Math.max(0.3, Math.min(1.5, n)));
  },
  /**
   * הקרא אות עם ניקוד באיטיות להדגשת התנועה
   * @param {string} letter - האות (למשל 'ב')
   * @param {string} nikudSymbol - סמל הניקוד (למשל '\u05B7')
   */
  speakNikud(n, e) {
    const t = n + e, a = N;
    return N = q, new Promise((i) => {
      E.push({ text: t, resolve: i }), D();
    }).finally(() => {
      N = a;
    });
  }
}, X = {
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
}, _e = {
  shake: 420,
  bounce: 480,
  pulse: 600,
  fadeIn: 320,
  confetti: 700
};
function $(n, e) {
  !n || !X[e] || n.animate(X[e], {
    duration: _e[e] || 400,
    easing: "ease-in-out",
    fill: "none"
  });
}
function ge(n, e, t, a) {
  j.cheer();
  const i = e / t, o = i >= 0.8 ? 3 : i >= 0.5 ? 2 : 1, r = "⭐".repeat(o) + "☆".repeat(3 - o), s = document.createElement("div");
  s.className = "completion-screen", s.innerHTML = `
    <div class="completion-screen__content">
      <div class="completion-screen__stars" aria-label="${o} כּוֹכָבִים">${r}</div>
      <h2 class="completion-screen__title">!כָּל הַכָּבוֹד</h2>
      <p class="completion-screen__score">נִיקּוּד: ${e} מִתּוֹךְ ${t}</p>
      <button class="completion-screen__replay btn btn--primary">שַׂחֵק שׁוּב</button>
    </div>
  `, s.querySelector(".completion-screen__replay").addEventListener("click", () => {
    s.remove(), a();
  }), n.innerHTML = "", n.appendChild(s), $(s.querySelector(".completion-screen__content"), "fadeIn");
}
function Me(n, e, {
  totalRounds: t,
  progressBar: a = null,
  buildRoundUI: i,
  onCorrect: o,
  onWrong: r
} = {}) {
  let s = !1;
  async function c(h) {
    if (s) return;
    s = !0, j.correct(), h && await h(), o && await o(), n.state.addScore(1), a == null || a.update(n.state.currentRound), await new Promise((f) => setTimeout(f, 1200)), n.state.nextRound() ? (s = !1, i()) : ge(e, n.state.score, t, () => {
      location.reload();
    });
  }
  async function l() {
    s || (s = !0, r && await r(), s = !1);
  }
  function p() {
    return s;
  }
  function g() {
    s = !1;
  }
  return { handleCorrect: c, handleWrong: l, isAnswered: p, reset: g };
}
const ve = {
  kamatz: "ah",
  patah: "ah",
  tzere: "eh",
  segol: "eh",
  hiriq: "ee",
  holam: "oh",
  kubbutz: "oo"
}, ye = {
  ah: [/[אה]/, /^א$/, /אא/, /הא/],
  eh: [/[אה]/, /^א$/, /אא/, /הא/, /אה/],
  ee: [/[אי]/, /^י$/, /אי/, /הי/],
  oh: [/[או]/, /^[או]$/, /או/, /הו/],
  oo: [/[או]/, /^[או]$/, /או/, /הו/, /אוּ/]
};
function Pe() {
  const n = typeof window < "u" ? window.SpeechRecognition || window.webkitSpeechRecognition : null, e = !!n;
  let t = null;
  return {
    available: e,
    listen(a = 4e3) {
      return e ? new Promise((i) => {
        t = new n(), t.lang = "he-IL", t.continuous = !1, t.interimResults = !1, t.maxAlternatives = 3;
        let o = !1;
        const r = (c, l) => {
          o || (o = !0, t = null, i({ text: c.trim(), confidence: l }));
        };
        t.onresult = (c) => {
          const l = c.results[0];
          l ? r(l[0].transcript, l[0].confidence) : r("", 0);
        }, t.onerror = () => r("", 0), t.onnomatch = () => r("", 0);
        const s = setTimeout(() => {
          try {
            t == null || t.stop();
          } catch {
          }
          r("", 0);
        }, a);
        t.onend = () => {
          clearTimeout(s), r("", 0);
        };
        try {
          t.start();
        } catch {
          r("", 0);
        }
      }) : Promise.resolve({ text: "", confidence: 0 });
    },
    cancel() {
      try {
        t == null || t.abort();
      } catch {
      }
      t = null;
    }
  };
}
function Be(n, e) {
  if (!n || !e) return !1;
  const t = ve[e];
  if (!t) return !1;
  const a = ye[t];
  if (!a) return !1;
  const i = n.replace(/[\s.,!?]/g, "");
  return i.length ? a.some((o) => o.test(i)) : !1;
}
const A = [
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
function De(n) {
  return A.find((e) => e.letter === n) || null;
}
function ke(n = "regular") {
  return n === "regular" ? A.filter((e) => !e.isFinal) : n === "final" ? A.filter((e) => e.isFinal) : A;
}
function He(n, e = "regular") {
  const t = ke(e);
  return [...t].sort(() => Math.random() - 0.5).slice(0, Math.min(n, t.length));
}
const F = [
  { id: "kamatz", name: "קָמָץ", nameNikud: "קָמָץ", symbol: "ָ", sound: "אָ", color: "#FF6B6B", textColor: "#fff" },
  { id: "patah", name: "פֶּתַח", nameNikud: "פָּתַח", symbol: "ַ", sound: "אָ", color: "#FF8C42", textColor: "#fff" },
  { id: "hiriq", name: "חִירִיק", nameNikud: "חִירִיק", symbol: "ִ", sound: "אִי", color: "#4ECDC4", textColor: "#fff" },
  { id: "tzere", name: "צָרָה", nameNikud: "צֵרֶה", symbol: "ֵ", sound: "אֶ", color: "#45B7D1", textColor: "#fff" },
  { id: "segol", name: "סָגֹול", nameNikud: "סְגוֹל", symbol: "ֶ", sound: "אֶ", color: "#9B59B6", textColor: "#fff" },
  { id: "holam", name: "חוֹלֵם", nameNikud: "חוֹלָם", symbol: "ֹ", sound: "אֹ", color: "#2ECC71", textColor: "#fff" },
  { id: "kubbutz", name: "קֻובּוּץ", nameNikud: "קֻבּוּץ", symbol: "ֻ", sound: "אֻ", color: "#F39C12", textColor: "#fff" }
], We = ["א", "ב", "ג", "ד", "מ", "נ", "ל", "ר", "ש", "ת", "פ", "ק"];
function Ue(n, e) {
  return n + e;
}
function Oe(n) {
  let e = [...F];
  if (typeof window < "u" && window.location && window.location.search) {
    const a = new URLSearchParams(window.location.search), i = a.get("allowedNikud");
    if (i) {
      const r = i.split(",").map((s) => s.trim());
      e = e.filter(
        (s) => r.includes(s.id) || r.includes(s.name) || r.includes(s.nameNikud)
      );
    }
    const o = a.get("excludedNikud");
    if (o) {
      const r = o.split(",").map((s) => s.trim());
      e = e.filter(
        (s) => !r.includes(s.id) && !r.includes(s.name) && !r.includes(s.nameNikud)
      );
    }
  }
  e.length === 0 && (e = [...F]);
  let t = [...e];
  for (; t.length < n; )
    t.push(...e);
  return t.sort(() => Math.random() - 0.5).slice(0, n);
}
function qe(n, e, t) {
  n.innerHTML = "";
  const a = document.createElement("div");
  a.className = "option-cards-grid";
  const i = e.map((o) => {
    const r = document.createElement("button");
    return r.className = "option-card", r.dataset.id = o.id, r.innerHTML = `
      <span class="option-card__emoji">${o.emoji || ""}</span>
      <span class="option-card__text">${o.text}</span>
    `, r.addEventListener("click", () => {
      r.disabled || t(o);
    }), a.appendChild(r), { el: r, option: o };
  });
  return n.appendChild(a), {
    /** הַדָּגֵשׁ כַּרְטִיס לְפִי סוּג: 'correct' | 'wrong' | 'hint' */
    highlight(o, r) {
      i.forEach(({ el: s, option: c }) => {
        c.id === o && s.classList.add(`option-card--${r}`);
      });
    },
    /** נטרל את כל הכרטיסים */
    disable() {
      i.forEach(({ el: o }) => {
        o.disabled = !0;
      });
    },
    /** אפס את מצב הכרטיסים */
    reset() {
      i.forEach(({ el: o }) => {
        o.className = "option-card", o.disabled = !1;
      });
    },
    /** הסר את הרכיב */
    destroy() {
      n.innerHTML = "";
    }
  };
}
function ze(n, e) {
  const t = document.createElement("div");
  t.className = "progress-bar", t.setAttribute("role", "progressbar"), t.setAttribute("aria-valuemin", "0"), t.setAttribute("aria-valuemax", String(e)), t.innerHTML = `
    <div class="progress-bar__track">
      <div class="progress-bar__fill" style="width: 0%"></div>
    </div>
    <span class="progress-bar__label">0 / ${e}</span>
  `, n.appendChild(t);
  const a = t.querySelector(".progress-bar__fill"), i = t.querySelector(".progress-bar__label");
  return {
    /** עדכן את ההתקדמות */
    update(o) {
      const r = Math.round(o / e * 100);
      a.style.width = `${r}%`, i.textContent = `${o} / ${e}`, t.setAttribute("aria-valuenow", String(o));
    },
    /** הסר את הרכיב */
    destroy() {
      t.remove();
    }
  };
}
function Ge(n) {
  const e = document.createElement("div");
  e.className = "feedback-message", e.setAttribute("aria-live", "polite"), e.setAttribute("role", "status"), n.appendChild(e);
  let t = null;
  function a(i, o, r = 1800) {
    clearTimeout(t), e.textContent = i, e.className = `feedback-message feedback-message--${o}`, t = setTimeout(() => {
      e.textContent = "", e.className = "feedback-message";
    }, r);
  }
  return {
    /** הצג משוב חיובי */
    correct(i = "!כָּל הַכָּבוֹד") {
      j.correct(), a(i, "correct"), $(e, "bounce");
    },
    /** הצג עידוד — נסה שוב */
    wrong(i = "נַסֵּה שׁוּב") {
      j.wrong(), a(i, "wrong"), $(e, "pulse");
    },
    /** הצג רמז */
    hint(i) {
      a(i, "hint"), $(e, "pulse");
    },
    /** הסר את הרכיב */
    destroy() {
      clearTimeout(t), e.remove();
    }
  };
}
function Xe(n, e) {
  let t = document.getElementById("nikud-settings");
  t || (t = document.createElement("div"), t.id = "nikud-settings", Object.assign(t.style, {
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
  }), document.body.appendChild(t));
  const a = new URLSearchParams(window.location.search), i = a.get("allowedNikud") ? a.get("allowedNikud").split(",") : [];
  let o = `
    <div style="background:white; padding:1.5rem; border-radius:1rem; min-width:300px; text-align:center; color:#333; font-family:Heebo,Arial; direction:rtl;">
      <h2 style="margin-top:0">בחר ניקוד</h2>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; margin:1rem 0; text-align:right;">
  `;
  F.forEach((l) => {
    const p = i.length === 0 || i.includes(l.id) || i.includes(l.name);
    o += `
      <label style="display:flex; align-items:center; gap:0.5rem; cursor:pointer;">
        <input type="checkbox" value="${l.id}" class="nikud-filter-cb" ${p ? "checked" : ""} style="width:1.2rem;height:1.2rem;">
        <span>${l.nameNikud}</span>
      </label>
    `;
  });
  const r = parseFloat(localStorage.getItem("alefbet.nikudRate")) || 0.5;
  o += `
      </div>
      <div style="margin:1rem 0; text-align:right;">
        <label style="font-weight:700; font-size:0.95rem;">מהירות הגייה: <span id="nikud-rate-val">${r}</span></label>
        <input type="range" id="nikud-rate-slider" min="0.3" max="1.5" step="0.1" value="${r}" style="width:100%; margin-top:0.3rem; accent-color:#4f67ff;">
        <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:#888;">
          <span>אִטִּי</span>
          <span>מָהִיר</span>
        </div>
      </div>
      <button id="save-settings-btn" style="padding:0.5rem 1rem; border-radius:0.5rem; background:#4f67ff; color:white; border:none; font-size:1.1rem; cursor:pointer;">שמור והתחל מחדש</button>
      <button id="close-settings-btn" style="padding:0.5rem 1rem; border-radius:0.5rem; background:#ddd; color:#333; border:none; font-size:1.1rem; cursor:pointer; margin-right:0.5rem;">ביטול</button>
    </div>
  `, t.innerHTML = o, t.style.display = "flex";
  const s = document.getElementById("nikud-rate-slider"), c = document.getElementById("nikud-rate-val");
  s.oninput = () => {
    c.textContent = s.value;
  }, document.getElementById("save-settings-btn").onclick = () => {
    const l = parseFloat(s.value);
    localStorage.setItem("alefbet.nikudRate", l), be.setNikudEmphasis({ rate: l });
    const p = Array.from(t.querySelectorAll(".nikud-filter-cb")).filter((h) => h.checked).map((h) => h.value), g = new URL(window.location);
    p.length > 0 && p.length < F.length ? g.searchParams.set("allowedNikud", p.join(",")) : g.searchParams.delete("allowedNikud"), g.searchParams.delete("excludedNikud"), t.style.display = "none", window.history.replaceState({}, "", g), e && e(n);
  }, document.getElementById("close-settings-btn").onclick = () => {
    t.style.display = "none";
  };
}
function Je(n) {
  const e = document.createElement("div");
  e.className = "ab-zone", e.style.setProperty("--zone-color", n.color || "#4f67ff"), e.innerHTML = `
    <div class="ab-zone__symbol">${n.symbol || ""}</div>
    <div class="ab-zone__label">${n.label || ""}</div>
  `;
  const t = () => {
    n.onTap && n.onTap();
  };
  return e.addEventListener("click", t), {
    el: e,
    highlight(a) {
      e.classList.remove("ab-zone--correct", "ab-zone--hover"), a && e.classList.add(`ab-zone--${a}`);
    },
    reset() {
      e.classList.remove("ab-zone--correct", "ab-zone--hover");
    },
    destroy() {
      e.removeEventListener("click", t);
    }
  };
}
function Ye(n, e = "טוֹעֵן...") {
  n.innerHTML = `<div class="ab-loading">${e}</div>`;
}
function Ve(n) {
  n.innerHTML = "";
}
function Ke(n, e, t, a) {
  const i = n.querySelector(".game-header__spacer");
  if (!i) return null;
  const o = document.createElement("button");
  return o.className = "ab-header-btn", o.setAttribute("aria-label", t), o.textContent = e, o.onclick = a, i.innerHTML = "", i.appendChild(o), o;
}
function Qe(n, { size: e = "md" } = {}) {
  const t = document.createElement("div");
  t.className = `ab-nikud-box ab-nikud-box--${e} ab-nikud-box--${n.id}`;
  const a = document.createElement("div");
  a.className = "ab-nikud-box__box";
  const i = document.createElement("div");
  return i.className = "ab-nikud-box__mark", i.textContent = n.symbol, t.appendChild(a), t.appendChild(i), t;
}
let x = null, y = null, H = 0, W = 0;
const I = /* @__PURE__ */ new Map();
function J(n, e) {
  var t;
  return ((t = document.elementFromPoint(n, e)) == null ? void 0 : t.closest('[data-drop-target="true"]')) || null;
}
function we(n, e, t) {
  const a = n.getBoundingClientRect();
  H = a.width / 2, W = a.height / 2, y = n.cloneNode(!0), Object.assign(y.style, {
    position: "fixed",
    left: `${e - H}px`,
    top: `${t - W}px`,
    width: `${a.width}px`,
    height: `${a.height}px`,
    pointerEvents: "none",
    // keeps it out of elementFromPoint + hit-testing
    zIndex: "9999",
    opacity: "0.85",
    transform: "scale(1.12)",
    cursor: "grabbing",
    margin: "0"
  }), document.body.appendChild(y);
}
function xe(n, e) {
  y && (y.style.left = `${n - H}px`, y.style.top = `${e - W}px`);
}
function Ee() {
  y == null || y.remove(), y = null;
}
let k = null;
function Ne(n) {
  k !== n && (k == null || k.classList.remove("drop-target--hover"), k = n, n == null || n.classList.add("drop-target--hover"));
}
function Le() {
  k == null || k.classList.remove("drop-target--hover"), k = null;
}
function Ze(n, e) {
  n.classList.add("drag-source");
  let t = null, a = null, i = null;
  function o() {
    t && (n.removeEventListener("pointermove", t), n.removeEventListener("pointerup", a), n.removeEventListener("pointercancel", i), t = a = i = null), Le(), Ee(), n.classList.remove("drag-source--dragging"), x = null;
  }
  function r(s) {
    s.button !== void 0 && s.button !== 0 || (s.preventDefault(), x && o(), x = { el: n, data: e }, n.classList.add("drag-source--dragging"), we(n, s.clientX, s.clientY), n.setPointerCapture(s.pointerId), t = (c) => {
      xe(c.clientX, c.clientY), Ne(J(c.clientX, c.clientY));
    }, a = (c) => {
      const l = J(c.clientX, c.clientY);
      o(), l && I.has(l) && I.get(l).onDrop({ data: e, sourceEl: n, targetEl: l });
    }, i = () => o(), n.addEventListener("pointermove", t), n.addEventListener("pointerup", a), n.addEventListener("pointercancel", i));
  }
  return n.addEventListener("pointerdown", r), {
    destroy() {
      n.removeEventListener("pointerdown", r), (x == null ? void 0 : x.el) === n && o(), n.classList.remove("drag-source");
    }
  };
}
function et(n, e) {
  return n.setAttribute("data-drop-target", "true"), n.classList.add("drop-target--active"), I.set(n, { onDrop: e }), {
    destroy() {
      n.removeAttribute("data-drop-target"), n.classList.remove("drop-target--active", "drop-target--hover"), I.delete(n);
    }
  };
}
function Re(n, e) {
  const t = [];
  function a() {
    try {
      const s = localStorage.getItem(n);
      return s === null ? e : JSON.parse(s);
    } catch {
      return e;
    }
  }
  function i(s) {
    try {
      localStorage.setItem(n, JSON.stringify(s));
    } catch (c) {
      console.warn(`[createLocalState] שגיאה בשמירת "${n}":`, c);
    }
    t.forEach((c) => c(s));
  }
  function o(s) {
    i(s(a()));
  }
  function r(s) {
    return t.push(s), function() {
      const l = t.indexOf(s);
      l !== -1 && t.splice(l, 1);
    };
  }
  return { get: a, set: i, update: o, subscribe: r };
}
function tt(n, e = {}) {
  const {
    title: t = "",
    subtitle: a = "",
    tabs: i = [],
    homeUrl: o = null,
    onTabChange: r = null
  } = e;
  n.classList.add("ab-app");
  const s = o ? `<a href="${o}" class="ab-app-back-link" aria-label="דף הבית">🏠</a>` : "", c = a ? `<span class="ab-app-subtitle">${a}</span>` : '<span class="ab-app-subtitle"></span>', l = i.map(
    (d) => `<button class="ab-app-tab" data-tab="${d.id}" aria-selected="false" role="tab"><span class="ab-app-tab-icon">${d.icon}</span><span class="ab-app-tab-label">${d.label}</span></button>`
  ).join(""), p = i.map(
    (d) => `<button class="ab-app-nav-item" data-tab="${d.id}" aria-selected="false" role="tab"><span class="ab-app-nav-icon">${d.icon}</span><span class="ab-app-nav-label">${d.label}</span></button>`
  ).join("");
  n.innerHTML = `
    <header class="ab-app-header">
      <div class="ab-app-header-text">
        <h1 class="ab-app-title">${t}</h1>
        ${c}
      </div>
      ${s}
    </header>
    <nav class="ab-app-tabs" role="tablist" aria-label="ניווט ראשי">
      ${l}
    </nav>
    <main class="ab-app-content"></main>
    <nav class="ab-app-bottom-nav" role="tablist" aria-label="ניווט תחתון">
      ${p}
    </nav>
  `;
  const g = n.querySelector(".ab-app-subtitle"), h = n.querySelector(".ab-app-content");
  function u(d) {
    f(d), typeof r == "function" && r(d);
  }
  n.querySelectorAll(".ab-app-tab, .ab-app-nav-item").forEach((d) => {
    d.addEventListener("click", () => u(d.dataset.tab));
  });
  function f(d) {
    n.querySelectorAll(".ab-app-tab, .ab-app-nav-item").forEach((b) => {
      const m = b.dataset.tab === d;
      b.classList.toggle("ab-active", m), b.setAttribute("aria-selected", m ? "true" : "false");
    });
  }
  return i.length > 0 && f(i[0].id), {
    /** אלמנט תוכן הראשי — כאן מרנדרים את תוכן הטאב הנוכחי */
    contentEl: h,
    /**
     * עדכן את כותרת המשנה
     * @param {string} text - הטקסט החדש לכותרת המשנה
     */
    setSubtitle(d) {
      g.textContent = d;
    },
    /**
     * הגדר את הטאב הפעיל באופן תכנותי
     * @param {string} tabId - מזהה הטאב להפעלה
     */
    setActiveTab(d) {
      f(d);
    }
  };
}
function Se(n, { onClick: e } = {}) {
  const t = document.createElement("div");
  t.className = "ab-editor-overlay", e && t.addEventListener("pointerdown", e);
  function a() {
    t.parentElement || (n.style.position = "relative", n.appendChild(t));
  }
  function i() {
    t.remove();
  }
  function o() {
    i();
  }
  return { show: a, hide: i, destroy: o };
}
function Ce(n, e, { onSelectRound: t, onAddRound: a }) {
  const i = document.createElement("div");
  i.className = "ab-editor-nav", i.setAttribute("aria-label", "ניווט סיבובים");
  const o = document.createElement("div");
  o.className = "ab-editor-nav__header", o.textContent = "סיבובים", i.appendChild(o);
  const r = document.createElement("div");
  r.className = "ab-editor-nav__list", i.appendChild(r);
  const s = document.createElement("button");
  s.className = "ab-editor-nav__add", s.textContent = "+ הוסף", s.addEventListener("click", () => a(null)), i.appendChild(s), n.appendChild(i);
  let c = null;
  function l(u, f) {
    const d = document.createElement("div");
    d.className = "ab-editor-nav__thumb", u.id === c && d.classList.add("ab-editor-nav__thumb--active"), d.setAttribute("role", "button"), d.setAttribute("tabindex", "0"), d.setAttribute("aria-label", `סיבוב ${f + 1}`), d.dataset.roundId = u.id;
    const b = document.createElement("div");
    if (b.className = "ab-editor-nav__num", b.textContent = f + 1, d.appendChild(b), u.correctEmoji) {
      const m = document.createElement("div");
      m.className = "ab-editor-nav__emoji", m.textContent = u.correctEmoji, d.appendChild(m);
    }
    if (u.target) {
      const m = document.createElement("div");
      m.className = "ab-editor-nav__letter", m.textContent = u.target, d.appendChild(m);
    }
    return d.addEventListener("click", () => t(u.id)), d.addEventListener("keydown", (m) => {
      (m.key === "Enter" || m.key === " ") && (m.preventDefault(), t(u.id));
    }), d;
  }
  function p() {
    r.innerHTML = "", e.rounds.forEach((u, f) => {
      r.appendChild(l(u, f));
    });
  }
  function g(u) {
    c = u, r.querySelectorAll(".ab-editor-nav__thumb").forEach((f) => {
      f.classList.toggle("ab-editor-nav__thumb--active", f.dataset.roundId === u);
    });
  }
  function h() {
    i.remove();
  }
  return p(), { refresh: p, setActiveRound: g, destroy: h };
}
const Y = {
  "multiple-choice": [
    { key: "target", label: "אות יעד", type: "text", maxLength: 2 },
    { key: "correct", label: "תשובה נכונה", type: "text" },
    { key: "correctEmoji", label: "אמוג'י", type: "emoji" }
  ],
  "drag-match": [
    { key: "target", label: "אות יעד", type: "text", maxLength: 2 },
    { key: "correct", label: "תשובה נכונה", type: "text" },
    { key: "correctEmoji", label: "אמוג'י", type: "emoji" }
  ]
};
function Te(n, { onFieldChange: e, onDeleteRound: t, getEditableFields: a }) {
  const i = document.createElement("div");
  i.className = "ab-editor-inspector";
  const o = document.createElement("div");
  o.className = "ab-editor-inspector__header", o.innerHTML = '<span class="ab-editor-inspector__title">✏️ ערוך סיבוב</span>', i.appendChild(o);
  const r = document.createElement("div");
  r.className = "ab-editor-inspector__body", i.appendChild(r);
  const s = document.createElement("button");
  s.className = "ab-editor-inspector__delete", s.textContent = "🗑 מחק סיבוב", i.appendChild(s), n.appendChild(i);
  let c = null;
  function l() {
    r.innerHTML = '<p class="ab-editor-inspector__empty">בחר סיבוב לעריכה</p>', s.hidden = !0, c = null;
  }
  function p(h, u = "multiple-choice") {
    c = h.id, r.innerHTML = "", s.hidden = !1, ((a ? a(u) : null) || Y[u] || Y["multiple-choice"]).forEach((d) => {
      const b = document.createElement("div");
      b.className = "ab-editor-field";
      const m = document.createElement("label");
      if (m.className = "ab-editor-field__label", m.textContent = d.label, b.appendChild(m), d.type === "emoji") {
        const _ = document.createElement("div");
        _.className = "ab-editor-field__emoji-row";
        const C = document.createElement("div");
        C.className = "ab-editor-field__emoji-preview", C.textContent = h[d.key] || "❓", _.appendChild(C);
        const v = document.createElement("input");
        v.className = "ab-editor-field__input", v.type = "text", v.value = h[d.key] || "", v.maxLength = 8, v.placeholder = "🐱", v.style.fontSize = "20px", v.addEventListener("input", () => {
          C.textContent = v.value || "❓", e(c, d.key, v.value);
        }), _.appendChild(v), b.appendChild(_);
      } else {
        const _ = document.createElement("input");
        _.className = "ab-editor-field__input", _.type = "text", _.value = h[d.key] || "", _.dir = "rtl", d.maxLength && (_.maxLength = d.maxLength), _.addEventListener("input", () => {
          e(c, d.key, _.value);
        }), b.appendChild(_);
      }
      r.appendChild(b);
    }), s.onclick = () => {
      confirm("למחוק את הסיבוב הזה?") && (t(c), l());
    };
  }
  function g() {
    i.remove();
  }
  return l(), { loadRound: p, clear: l, destroy: g };
}
let $e = 0;
function V() {
  return `round-${Date.now()}-${$e++}`;
}
class M {
  /**
   * @param {object} schema - { id, version, meta, rounds, distractors }
   */
  constructor(e) {
    this._id = e.id || "game", this._version = e.version || 1, this._meta = { title: "", type: "multiple-choice", ...e.meta }, this._rounds = (e.rounds || []).map((t) => ({ ...t, id: t.id || V() })), this._distractors = e.distractors || [], this._handlers = [];
  }
  // ── Identity ────────────────────────────────────────────────────────────
  get id() {
    return this._id;
  }
  get meta() {
    return { ...this._meta };
  }
  get distractors() {
    return this._distractors;
  }
  // ── Rounds (read) ────────────────────────────────────────────────────────
  get rounds() {
    return [...this._rounds];
  }
  getRound(e) {
    return this._rounds.find((t) => t.id === e) || null;
  }
  getRoundIndex(e) {
    return this._rounds.findIndex((t) => t.id === e);
  }
  // ── Rounds (write) ───────────────────────────────────────────────────────
  updateRound(e, t) {
    const a = this.getRoundIndex(e);
    a !== -1 && (this._rounds[a] = { ...this._rounds[a], ...t }, this._emit());
  }
  addRound(e = null) {
    const t = { id: V(), target: "", correct: "", correctEmoji: "❓" };
    if (e === null)
      this._rounds.push(t);
    else {
      const a = this.getRoundIndex(e);
      this._rounds.splice(a + 1, 0, t);
    }
    return this._emit(), t.id;
  }
  removeRound(e) {
    const t = this.getRoundIndex(e);
    t === -1 || this._rounds.length <= 1 || (this._rounds.splice(t, 1), this._emit());
  }
  moveRound(e, t) {
    const a = this.getRoundIndex(e);
    if (a === -1) return;
    const [i] = this._rounds.splice(a, 1);
    this._rounds.splice(Math.max(0, Math.min(t, this._rounds.length)), 0, i), this._emit();
  }
  // ── Change events ────────────────────────────────────────────────────────
  onChange(e) {
    return this._handlers.push(e), () => this.offChange(e);
  }
  offChange(e) {
    const t = this._handlers.indexOf(e);
    t !== -1 && this._handlers.splice(t, 1);
  }
  _emit() {
    this._handlers.forEach((e) => e(this));
  }
  // ── Serialization ────────────────────────────────────────────────────────
  toJSON() {
    return {
      id: this._id,
      version: this._version,
      meta: { ...this._meta },
      rounds: this._rounds.map((e) => ({ ...e })),
      distractors: this._distractors
    };
  }
  static fromJSON(e) {
    return new M(e);
  }
  /**
   * Migration helper: convert a plain ROUNDS array into a GameData instance.
   * @param {string} gameId
   * @param {object[]} rounds
   * @param {object} meta - { title, type }
   * @param {object[]} [distractors]
   */
  static fromRoundsArray(e, t, a = {}, i = []) {
    return new M({ id: e, meta: a, rounds: t, distractors: i });
  }
}
const Q = "alefbet.editor.";
function Z(n) {
  return Re(`${Q}${n}`, null);
}
function Ae(n) {
  Z(n.id).set(n.toJSON());
}
function nt(n) {
  const e = Z(n).get();
  if (!e) return null;
  try {
    return M.fromJSON(e);
  } catch {
    return null;
  }
}
function at(n) {
  try {
    localStorage.removeItem(`${Q}${n}`);
  } catch {
  }
}
function je(n) {
  const e = JSON.stringify(n.toJSON(), null, 2), t = new Blob([e], { type: "application/json;charset=utf-8" }), a = URL.createObjectURL(t), i = document.createElement("a");
  i.href = a, i.download = `${n.id}-rounds.json`, i.click(), URL.revokeObjectURL(a);
}
class it {
  /**
   * @param {HTMLElement} container  — same container passed to GameShell
   * @param {import('./game-data.js').GameData} gameData
   * @param {{
   *   restartGame:       (container: HTMLElement) => void,
   *   getEditableFields?: (type: string) => object[],
   * }} options
   */
  constructor(e, t, { restartGame: a, getEditableFields: i } = {}) {
    this._container = e, this._gameData = t, this._restartGame = a, this._getEditableFields = i || null, this._mode = "play", this._overlay = null, this._navigator = null, this._inspector = null, this._toolbar = null, this._selectedId = null, requestAnimationFrame(() => this._injectToolbar());
  }
  // ── Toolbar ──────────────────────────────────────────────────────────────
  _injectToolbar() {
    const e = this._container.querySelector(".game-header__spacer");
    e && (this._toolbar = document.createElement("div"), this._toolbar.className = "ab-editor-toolbar", this._editBtn = this._makeBtn("✏️ ערוך", "ab-editor-btn--edit", () => this.enterEditMode()), this._toolbar.appendChild(this._editBtn), e.innerHTML = "", e.appendChild(this._toolbar));
  }
  _makeBtn(e, t, a) {
    const i = document.createElement("button");
    return i.className = `ab-editor-btn ${t}`, i.innerHTML = e, i.addEventListener("click", a), i;
  }
  _setToolbarEditMode() {
    this._toolbar.innerHTML = "";
    const e = this._makeBtn("▶ שחק", "ab-editor-btn--play", () => this.enterPlayMode()), t = this._makeBtn("+ הוסף", "ab-editor-btn--add", () => this._addRound()), a = this._makeBtn("💾 שמור", "ab-editor-btn--save", () => this._save()), i = this._makeBtn("⬇ ייצוא", "ab-editor-btn--export", () => je(this._gameData));
    this._toolbar.append(e, t, a, i);
  }
  _setToolbarPlayMode() {
    this._toolbar.innerHTML = "", this._editBtn = this._makeBtn("✏️ ערוך", "ab-editor-btn--edit", () => this.enterEditMode()), this._toolbar.appendChild(this._editBtn);
  }
  // ── Mode switching ────────────────────────────────────────────────────────
  enterEditMode() {
    if (this._mode === "edit") return;
    this._mode = "edit", this._container.classList.add("ab-editor-active"), this._setToolbarEditMode();
    const e = this._container.querySelector(".game-body");
    if (!e) return;
    this._overlay = Se(e), this._overlay.show(), this._navigator = Ce(
      this._container,
      this._gameData,
      {
        onSelectRound: (a) => this._selectRound(a),
        onAddRound: (a) => this._addRound(a)
      }
    ), this._inspector = Te(
      this._container,
      {
        onFieldChange: (a, i, o) => this._onFieldChange(a, i, o),
        onDeleteRound: (a) => this._deleteRound(a),
        getEditableFields: this._getEditableFields
      }
    );
    const t = this._gameData.rounds;
    t.length > 0 && this._selectRound(t[0].id);
  }
  enterPlayMode() {
    var e, t, a, i;
    this._mode !== "play" && (this._mode = "play", this._container.classList.remove("ab-editor-active"), this._setToolbarPlayMode(), (e = this._overlay) == null || e.destroy(), (t = this._navigator) == null || t.destroy(), (a = this._inspector) == null || a.destroy(), this._overlay = this._navigator = this._inspector = null, this._selectedId = null, (i = this._restartGame) == null || i.call(this, this._container));
  }
  // ── Round management ──────────────────────────────────────────────────────
  _selectRound(e) {
    var a, i;
    this._selectedId = e, (a = this._navigator) == null || a.setActiveRound(e);
    const t = this._gameData.getRound(e);
    t && ((i = this._inspector) == null || i.loadRound(t, this._gameData.meta.type));
  }
  _addRound(e = null) {
    var a;
    const t = this._gameData.addRound(e ?? this._selectedId);
    (a = this._navigator) == null || a.refresh(), this._selectRound(t);
  }
  _deleteRound(e) {
    var a;
    this._gameData.removeRound(e), (a = this._navigator) == null || a.refresh();
    const t = this._gameData.rounds;
    t.length > 0 && this._selectRound(t[0].id);
  }
  _onFieldChange(e, t, a) {
    var i, o;
    this._gameData.updateRound(e, { [t]: a }), (i = this._navigator) == null || i.refresh(), (o = this._navigator) == null || o.setActiveRound(e);
  }
  // ── Save ──────────────────────────────────────────────────────────────────
  _save() {
    Ae(this._gameData), this._showToast("✅ נשמר!");
  }
  _showToast(e) {
    const t = document.createElement("div");
    t.className = "ab-editor-toast", t.textContent = e, document.body.appendChild(t), setTimeout(() => t.remove(), 2200);
  }
}
export {
  ee as EventBus,
  M as GameData,
  it as GameEditor,
  Fe as GameShell,
  te as GameState,
  se as addNikud,
  $ as animate,
  at as clearGameData,
  tt as createAppShell,
  Ze as createDragSource,
  et as createDropTarget,
  Ge as createFeedback,
  Re as createLocalState,
  Qe as createNikudBox,
  qe as createOptionCards,
  ze as createProgressBar,
  Me as createRoundManager,
  Pe as createSpeechListener,
  Je as createZone,
  je as exportGameDataAsJSON,
  De as getLetter,
  ke as getLettersByGroup,
  re as getNikud,
  A as hebrewLetters,
  Ve as hideLoadingScreen,
  Ke as injectHeaderButton,
  Ue as letterWithNikud,
  nt as loadGameData,
  Be as matchNikudSound,
  We as nikudBaseLetters,
  F as nikudList,
  Ie as preloadNikud,
  He as randomLetters,
  Oe as randomNikud,
  Ae as saveGameData,
  ge as showCompletionScreen,
  Ye as showLoadingScreen,
  Xe as showNikudSettingsDialog,
  j as sounds,
  be as tts
};
