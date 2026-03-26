class be {
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
class _e {
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
class mt {
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
    }, this.events = new be(), this.state = new _e(this.config.totalRounds), this._buildShell();
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
let I = null;
function ge() {
  if (!I)
    try {
      I = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      return null;
    }
  return I.state === "suspended" && I.resume(), I;
}
function A(n, e, t = "sine", a = 0.3) {
  const i = ge();
  if (i)
    try {
      const o = i.createOscillator(), s = i.createGain();
      o.connect(s), s.connect(i.destination), o.type = t, o.frequency.setValueAtTime(n, i.currentTime), s.gain.setValueAtTime(a, i.currentTime), s.gain.exponentialRampToValueAtTime(1e-3, i.currentTime + e), o.start(i.currentTime), o.stop(i.currentTime + e + 0.05);
    } catch {
    }
}
const O = {
  /** צליל תשובה נכונה */
  correct() {
    A(523.25, 0.15), setTimeout(() => A(659.25, 0.2), 120), setTimeout(() => A(783.99, 0.3), 240);
  },
  /** צליל עידוד עדין — נסה שוב */
  wrong() {
    A(350, 0.15, "triangle", 0.12);
  },
  /** צליל עידוד - סיום מוצלח */
  cheer() {
    [523.25, 587.33, 659.25, 698.46, 783.99, 1046.5].forEach((e, t) => setTimeout(() => A(e, 0.2), t * 90));
  },
  /** קליק עדין */
  click() {
    A(900, 0.04, "sine", 0.12);
  }
}, ne = "https://nakdan-u1-0.loadbalancer.dicta.org.il/api";
let ae = !1;
const P = /* @__PURE__ */ new Map();
function ve() {
  var i;
  if (typeof window > "u") return ne;
  const n = new URLSearchParams(window.location.search).get("nakdanProxy"), e = window.ALEFBET_NAKDAN_PROXY_URL;
  if (n && window.localStorage)
    try {
      window.localStorage.setItem("alefbet.nakdanProxyUrl", n);
    } catch {
    }
  const t = (i = window.localStorage) == null ? void 0 : i.getItem("alefbet.nakdanProxyUrl"), a = n || e || t;
  return a || (window.location.hostname.endsWith("github.io") ? null : ne);
}
function ye(n) {
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
async function ke(n) {
  const e = ve();
  if (!e)
    throw ae || (ae = !0, console.warn("[nakdan] Dicta API blocked by CORS on GitHub Pages. Configure a proxy URL via ?nakdanProxy=..., window.ALEFBET_NAKDAN_PROXY_URL, or localStorage key alefbet.nakdanProxyUrl.")), new Error("Nakdan unavailable without proxy on this host");
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
  return ye(i);
}
async function we(n) {
  if (!(n != null && n.trim())) return n ?? "";
  if (P.has(n)) return P.get(n);
  try {
    const e = await ke(n);
    return P.set(n, e), e;
  } catch {
    return P.set(n, n), n;
  }
}
function Ee(n) {
  return P.get(n) ?? n ?? "";
}
async function ht(n) {
  const e = [...new Set(n.filter((t) => t == null ? void 0 : t.trim()))];
  await Promise.all(e.map((t) => we(t)));
}
let $ = [], H = !1, ce = !0, M = 0.9, ie = typeof localStorage < "u" && parseFloat(localStorage.getItem("alefbet.nikudRate")) || 0.5, X = !1, j = null;
function oe(n, e, t, a = e) {
  console.warn(`[tts] ${n} TTS failed`, { text: e, sentText: a, reason: t }), typeof window < "u" && typeof window.dispatchEvent == "function" && window.dispatchEvent(new CustomEvent("alefbet:tts-error", {
    detail: { provider: n, text: e, sentText: a, reason: t }
  }));
}
function xe(n) {
  return (n || "").replace(/[\u0591-\u05C7]/g, "");
}
function Ne(n) {
  const e = String(n || "").toLowerCase();
  return e.includes("didn't interact") || e.includes("notallowed");
}
function Ce() {
  var n;
  return typeof window > "u" || typeof document > "u" ? Promise.resolve() : X || (n = document.userActivation) != null && n.hasBeenActive ? (X = !0, Promise.resolve()) : j || (j = new Promise((e) => {
    const t = () => {
      X = !0, window.removeEventListener("pointerdown", t, !0), window.removeEventListener("keydown", t, !0), window.removeEventListener("touchstart", t, !0), e();
    };
    window.addEventListener("pointerdown", t, { once: !0, capture: !0 }), window.addEventListener("keydown", t, { once: !0, capture: !0 }), window.addEventListener("touchstart", t, { once: !0, capture: !0 });
  }).finally(() => {
    j = null;
  }), j);
}
function Le(n, e, t) {
  const i = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(n)}&tl=he&client=tw-ob`, o = new Audio(i);
  o.playbackRate = M, o.onended = e, o.onerror = () => t("audio.onerror"), o.play().catch((s) => {
    t((s == null ? void 0 : s.message) || "audio.play() rejected");
  });
}
function Re(n) {
  return new Promise((e, t) => {
    const a = xe(n).trim() || n;
    let i = !1, o = !1;
    const s = () => {
      i || (i = !0, e());
    }, r = (d) => {
      i || (i = !0, t(d));
    }, l = () => {
      try {
        Le(a, s, (d) => {
          if (!o && Ne(d)) {
            o = !0, Ce().then(() => {
              i || l();
            });
            return;
          }
          oe("google", n, d, a), r(d);
        });
      } catch (d) {
        oe("google", n, (d == null ? void 0 : d.message) || "Audio() construction failed", a), r(d == null ? void 0 : d.message);
      }
    };
    l();
  });
}
let J = null;
function Se() {
  const n = speechSynthesis.getVoices();
  return n.find((e) => e.lang === "he-IL") || n.find((e) => e.lang === "iw-IL") || n.find((e) => e.lang.startsWith("he")) || null;
}
function se() {
  J = Se();
}
typeof speechSynthesis < "u" && (speechSynthesis.getVoices().length > 0 ? se() : speechSynthesis.addEventListener("voiceschanged", se, { once: !0 }));
function Be(n) {
  return new Promise((e) => {
    if (typeof speechSynthesis > "u") {
      e();
      return;
    }
    const t = new SpeechSynthesisUtterance(n);
    t.lang = "he-IL", t.rate = M, J && (t.voice = J), t.onend = e, t.onerror = e, speechSynthesis.speak(t);
  });
}
async function Ae(n) {
  if (ce)
    try {
      await Re(n);
      return;
    } catch {
      console.info("[tts] Falling back to browser Speech API");
    }
  await Be(n);
}
function K() {
  if (H || $.length === 0) return;
  const n = $.shift();
  H = !0, Ae(n.text).then(() => {
    H = !1, n.resolve(), K();
  });
}
const Te = {
  /**
   * הקרא טקסט עברי
   * משתמש ב-Google Translate TTS לאיכות טובה יותר
   */
  speak(n) {
    const e = Ee(n);
    return new Promise((t) => {
      $.push({ text: e, resolve: t }), K();
    });
  },
  /** עצור את הדיבור הנוכחי */
  cancel() {
    $.forEach((n) => n.resolve()), $ = [], H = !1, typeof speechSynthesis < "u" && speechSynthesis.cancel();
  },
  get available() {
    return !0;
  },
  /** הגדר מהירות דיבור (0.5–2.0) */
  setRate(n) {
    M = Math.max(0.5, Math.min(2, n));
  },
  /** השתמש ב-Google Translate TTS (ברירת מחדל) או בדפדפן */
  useGoogle(n = !0) {
    ce = n;
  },
  /**
   * הגדר מהירות דיבור להדגשת ניקוד
   * @param {{ rate?: number }} opts
   *   rate: מהירות דיבור להדגשה (ברירת מחדל 0.5)
   */
  setNikudEmphasis({ rate: n } = {}) {
    n != null && (ie = Math.max(0.3, Math.min(1.5, n)));
  },
  /**
   * הקרא אות עם ניקוד באיטיות להדגשת התנועה
   * @param {string} letter - האות (למשל 'ב')
   * @param {string} nikudSymbol - סמל הניקוד (למשל '\u05B7')
   */
  speakNikud(n, e) {
    const t = n + e, a = M;
    return M = ie, new Promise((i) => {
      $.push({ text: t, resolve: i }), K();
    }).finally(() => {
      M = a;
    });
  }
}, re = {
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
}, $e = {
  shake: 420,
  bounce: 480,
  pulse: 600,
  fadeIn: 320,
  confetti: 700
};
function U(n, e) {
  !n || !re[e] || n.animate(re[e], {
    duration: $e[e] || 400,
    easing: "ease-in-out",
    fill: "none"
  });
}
function Me(n, e, t, a) {
  O.cheer();
  const i = e / t, o = i >= 0.8 ? 3 : i >= 0.5 ? 2 : 1, s = "⭐".repeat(o) + "☆".repeat(3 - o), r = document.createElement("div");
  r.className = "completion-screen", r.innerHTML = `
    <div class="completion-screen__content">
      <div class="completion-screen__stars" aria-label="${o} כּוֹכָבִים">${s}</div>
      <h2 class="completion-screen__title">!כָּל הַכָּבוֹד</h2>
      <p class="completion-screen__score">נִיקּוּד: ${e} מִתּוֹךְ ${t}</p>
      <button class="completion-screen__replay btn btn--primary">שַׂחֵק שׁוּב</button>
    </div>
  `, r.querySelector(".completion-screen__replay").addEventListener("click", () => {
    r.remove(), a();
  }), n.innerHTML = "", n.appendChild(r), U(r.querySelector(".completion-screen__content"), "fadeIn");
}
function pt(n, e, {
  totalRounds: t,
  progressBar: a = null,
  buildRoundUI: i,
  onCorrect: o,
  onWrong: s
} = {}) {
  let r = !1;
  async function l(_) {
    if (r) return;
    r = !0, O.correct(), _ && await _(), o && await o(), n.state.addScore(1), a == null || a.update(n.state.currentRound), await new Promise((y) => setTimeout(y, 1200)), n.state.nextRound() ? (r = !1, i()) : Me(e, n.state.score, t, () => {
      location.reload();
    });
  }
  async function d() {
    r || (r = !0, s && await s(), r = !1);
  }
  function m() {
    return r;
  }
  function c() {
    r = !1;
  }
  return { handleCorrect: l, handleWrong: d, isAnswered: m, reset: c };
}
const Ie = {
  kamatz: "ah",
  patah: "ah",
  tzere: "eh",
  segol: "eh",
  hiriq: "ee",
  holam: "oh",
  kubbutz: "oo"
}, je = {
  ah: [/[אה]/, /^א$/, /אא/, /הא/],
  eh: [/[אה]/, /^א$/, /אא/, /הא/, /אה/],
  ee: [/[אי]/, /^י$/, /אי/, /הי/],
  oh: [/[או]/, /^[או]$/, /או/, /הו/],
  oo: [/[או]/, /^[או]$/, /או/, /הו/, /אוּ/]
};
function ft() {
  const n = typeof window < "u" ? window.SpeechRecognition || window.webkitSpeechRecognition : null, e = !!n;
  let t = null;
  return {
    available: e,
    listen(a = 4e3) {
      return e ? new Promise((i) => {
        t = new n(), t.lang = "he-IL", t.continuous = !1, t.interimResults = !1, t.maxAlternatives = 3;
        let o = !1;
        const s = (l, d) => {
          o || (o = !0, t = null, i({ text: l.trim(), confidence: d }));
        };
        t.onresult = (l) => {
          const d = l.results[0];
          d ? s(d[0].transcript, d[0].confidence) : s("", 0);
        }, t.onerror = () => s("", 0), t.onnomatch = () => s("", 0);
        const r = setTimeout(() => {
          try {
            t == null || t.stop();
          } catch {
          }
          s("", 0);
        }, a);
        t.onend = () => {
          clearTimeout(r), s("", 0);
        };
        try {
          t.start();
        } catch {
          s("", 0);
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
function bt(n, e) {
  if (!n || !e) return !1;
  const t = Ie[e];
  if (!t) return !1;
  const a = je[t];
  if (!a) return !1;
  const i = n.replace(/[\s.,!?]/g, "");
  return i.length ? a.some((o) => o.test(i)) : !1;
}
const q = [
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
function _t(n) {
  return q.find((e) => e.letter === n) || null;
}
function Fe(n = "regular") {
  return n === "regular" ? q.filter((e) => !e.isFinal) : n === "final" ? q.filter((e) => e.isFinal) : q;
}
function gt(n, e = "regular") {
  const t = Fe(e);
  return [...t].sort(() => Math.random() - 0.5).slice(0, Math.min(n, t.length));
}
const W = [
  { id: "kamatz", name: "קָמָץ", nameNikud: "קָמָץ", symbol: "ָ", sound: "אָ", color: "#FF6B6B", textColor: "#fff" },
  { id: "patah", name: "פֶּתַח", nameNikud: "פָּתַח", symbol: "ַ", sound: "אָ", color: "#FF8C42", textColor: "#fff" },
  { id: "hiriq", name: "חִירִיק", nameNikud: "חִירִיק", symbol: "ִ", sound: "אִי", color: "#4ECDC4", textColor: "#fff" },
  { id: "tzere", name: "צָרָה", nameNikud: "צֵרֶה", symbol: "ֵ", sound: "אֶ", color: "#45B7D1", textColor: "#fff" },
  { id: "segol", name: "סָגֹול", nameNikud: "סְגוֹל", symbol: "ֶ", sound: "אֶ", color: "#9B59B6", textColor: "#fff" },
  { id: "holam", name: "חוֹלֵם", nameNikud: "חוֹלָם", symbol: "ֹ", sound: "אֹ", color: "#2ECC71", textColor: "#fff" },
  { id: "kubbutz", name: "קֻובּוּץ", nameNikud: "קֻבּוּץ", symbol: "ֻ", sound: "אֻ", color: "#F39C12", textColor: "#fff" }
], vt = ["א", "ב", "ג", "ד", "מ", "נ", "ל", "ר", "ש", "ת", "פ", "ק"];
function yt(n, e) {
  return n + e;
}
function kt(n) {
  let e = [...W];
  if (typeof window < "u" && window.location && window.location.search) {
    const a = new URLSearchParams(window.location.search), i = a.get("allowedNikud");
    if (i) {
      const s = i.split(",").map((r) => r.trim());
      e = e.filter(
        (r) => s.includes(r.id) || s.includes(r.name) || s.includes(r.nameNikud)
      );
    }
    const o = a.get("excludedNikud");
    if (o) {
      const s = o.split(",").map((r) => r.trim());
      e = e.filter(
        (r) => !s.includes(r.id) && !s.includes(r.name) && !s.includes(r.nameNikud)
      );
    }
  }
  e.length === 0 && (e = [...W]);
  let t = [...e];
  for (; t.length < n; )
    t.push(...e);
  return t.sort(() => Math.random() - 0.5).slice(0, n);
}
function wt(n, e, t) {
  n.innerHTML = "";
  const a = document.createElement("div");
  a.className = "option-cards-grid";
  const i = e.map((o) => {
    const s = document.createElement("button");
    return s.className = "option-card", s.dataset.id = o.id, s.innerHTML = `
      <span class="option-card__emoji">${o.emoji || ""}</span>
      <span class="option-card__text">${o.text}</span>
    `, s.addEventListener("click", () => {
      s.disabled || t(o);
    }), a.appendChild(s), { el: s, option: o };
  });
  return n.appendChild(a), {
    /** הַדָּגֵשׁ כַּרְטִיס לְפִי סוּג: 'correct' | 'wrong' | 'hint' */
    highlight(o, s) {
      i.forEach(({ el: r, option: l }) => {
        l.id === o && r.classList.add(`option-card--${s}`);
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
function Et(n, e) {
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
      const s = Math.round(o / e * 100);
      a.style.width = `${s}%`, i.textContent = `${o} / ${e}`, t.setAttribute("aria-valuenow", String(o));
    },
    /** הסר את הרכיב */
    destroy() {
      t.remove();
    }
  };
}
function xt(n) {
  const e = document.createElement("div");
  e.className = "feedback-message", e.setAttribute("aria-live", "polite"), e.setAttribute("role", "status"), n.appendChild(e);
  let t = null;
  function a(i, o, s = 1800) {
    clearTimeout(t), e.textContent = i, e.className = `feedback-message feedback-message--${o}`, t = setTimeout(() => {
      e.textContent = "", e.className = "feedback-message";
    }, s);
  }
  return {
    /** הצג משוב חיובי */
    correct(i = "!כָּל הַכָּבוֹד") {
      O.correct(), a(i, "correct"), U(e, "bounce");
    },
    /** הצג עידוד — נסה שוב */
    wrong(i = "נַסֵּה שׁוּב") {
      O.wrong(), a(i, "wrong"), U(e, "pulse");
    },
    /** הצג רמז */
    hint(i) {
      a(i, "hint"), U(e, "pulse");
    },
    /** הסר את הרכיב */
    destroy() {
      clearTimeout(t), e.remove();
    }
  };
}
function Nt(n, e) {
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
  W.forEach((d) => {
    const m = i.length === 0 || i.includes(d.id) || i.includes(d.name);
    o += `
      <label style="display:flex; align-items:center; gap:0.5rem; cursor:pointer;">
        <input type="checkbox" value="${d.id}" class="nikud-filter-cb" ${m ? "checked" : ""} style="width:1.2rem;height:1.2rem;">
        <span>${d.nameNikud}</span>
      </label>
    `;
  });
  const s = parseFloat(localStorage.getItem("alefbet.nikudRate")) || 0.5;
  o += `
      </div>
      <div style="margin:1rem 0; text-align:right;">
        <label style="font-weight:700; font-size:0.95rem;">מהירות הגייה: <span id="nikud-rate-val">${s}</span></label>
        <input type="range" id="nikud-rate-slider" min="0.3" max="1.5" step="0.1" value="${s}" style="width:100%; margin-top:0.3rem; accent-color:#4f67ff;">
        <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:#888;">
          <span>אִטִּי</span>
          <span>מָהִיר</span>
        </div>
      </div>
      <button id="save-settings-btn" style="padding:0.5rem 1rem; border-radius:0.5rem; background:#4f67ff; color:white; border:none; font-size:1.1rem; cursor:pointer;">שמור והתחל מחדש</button>
      <button id="close-settings-btn" style="padding:0.5rem 1rem; border-radius:0.5rem; background:#ddd; color:#333; border:none; font-size:1.1rem; cursor:pointer; margin-right:0.5rem;">ביטול</button>
    </div>
  `, t.innerHTML = o, t.style.display = "flex";
  const r = document.getElementById("nikud-rate-slider"), l = document.getElementById("nikud-rate-val");
  r.oninput = () => {
    l.textContent = r.value;
  }, document.getElementById("save-settings-btn").onclick = () => {
    const d = parseFloat(r.value);
    localStorage.setItem("alefbet.nikudRate", d), Te.setNikudEmphasis({ rate: d });
    const m = Array.from(t.querySelectorAll(".nikud-filter-cb")).filter((_) => _.checked).map((_) => _.value), c = new URL(window.location);
    m.length > 0 && m.length < W.length ? c.searchParams.set("allowedNikud", m.join(",")) : c.searchParams.delete("allowedNikud"), c.searchParams.delete("excludedNikud"), t.style.display = "none", window.history.replaceState({}, "", c), e && e(n);
  }, document.getElementById("close-settings-btn").onclick = () => {
    t.style.display = "none";
  };
}
function Ct(n) {
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
function Lt(n, e = "טוֹעֵן...") {
  n.innerHTML = `<div class="ab-loading">${e}</div>`;
}
function Rt(n) {
  n.innerHTML = "";
}
function St(n, e, t, a) {
  const i = n.querySelector(".game-header__spacer");
  if (!i) return null;
  const o = document.createElement("button");
  return o.className = "ab-header-btn", o.setAttribute("aria-label", t), o.textContent = e, o.onclick = a, i.innerHTML = "", i.appendChild(o), o;
}
function Bt(n, { size: e = "md" } = {}) {
  const t = document.createElement("div");
  t.className = `ab-nikud-box ab-nikud-box--${e} ab-nikud-box--${n.id}`;
  const a = document.createElement("div");
  a.className = "ab-nikud-box__box";
  const i = document.createElement("div");
  return i.className = "ab-nikud-box__mark", i.textContent = n.symbol, t.appendChild(a), t.appendChild(i), t;
}
let T = null, N = null, Z = 0, Q = 0;
const z = /* @__PURE__ */ new Map();
function le(n, e) {
  var t;
  return ((t = document.elementFromPoint(n, e)) == null ? void 0 : t.closest('[data-drop-target="true"]')) || null;
}
function Pe(n, e, t) {
  const a = n.getBoundingClientRect();
  Z = a.width / 2, Q = a.height / 2, N = n.cloneNode(!0), Object.assign(N.style, {
    position: "fixed",
    left: `${e - Z}px`,
    top: `${t - Q}px`,
    width: `${a.width}px`,
    height: `${a.height}px`,
    pointerEvents: "none",
    // keeps it out of elementFromPoint + hit-testing
    zIndex: "9999",
    opacity: "0.85",
    transform: "scale(1.12)",
    cursor: "grabbing",
    margin: "0"
  }), document.body.appendChild(N);
}
function De(n, e) {
  N && (N.style.left = `${n - Z}px`, N.style.top = `${e - Q}px`);
}
function He() {
  N == null || N.remove(), N = null;
}
let C = null;
function Ue(n) {
  C !== n && (C == null || C.classList.remove("drop-target--hover"), C = n, n == null || n.classList.add("drop-target--hover"));
}
function qe() {
  C == null || C.classList.remove("drop-target--hover"), C = null;
}
function Oe(n, e) {
  n.classList.add("drag-source");
  let t = null, a = null, i = null;
  function o() {
    t && (n.removeEventListener("pointermove", t), n.removeEventListener("pointerup", a), n.removeEventListener("pointercancel", i), t = a = i = null), qe(), He(), n.classList.remove("drag-source--dragging"), T = null;
  }
  function s(r) {
    r.button !== void 0 && r.button !== 0 || (r.preventDefault(), T && o(), T = { el: n, data: e }, n.classList.add("drag-source--dragging"), Pe(n, r.clientX, r.clientY), n.setPointerCapture(r.pointerId), t = (l) => {
      De(l.clientX, l.clientY), Ue(le(l.clientX, l.clientY));
    }, a = (l) => {
      const d = le(l.clientX, l.clientY);
      o(), d && z.has(d) && z.get(d).onDrop({ data: e, sourceEl: n, targetEl: d });
    }, i = () => o(), n.addEventListener("pointermove", t), n.addEventListener("pointerup", a), n.addEventListener("pointercancel", i));
  }
  return n.addEventListener("pointerdown", s), {
    destroy() {
      n.removeEventListener("pointerdown", s), (T == null ? void 0 : T.el) === n && o(), n.classList.remove("drag-source");
    }
  };
}
function We(n, e) {
  return n.setAttribute("data-drop-target", "true"), n.classList.add("drop-target--active"), z.set(n, { onDrop: e }), {
    destroy() {
      n.removeAttribute("data-drop-target"), n.classList.remove("drop-target--active", "drop-target--hover"), z.delete(n);
    }
  };
}
function ue(n, e) {
  const t = [];
  function a() {
    try {
      const r = localStorage.getItem(n);
      return r === null ? e : JSON.parse(r);
    } catch {
      return e;
    }
  }
  function i(r) {
    try {
      localStorage.setItem(n, JSON.stringify(r));
    } catch (l) {
      console.warn(`[createLocalState] שגיאה בשמירת "${n}":`, l);
    }
    t.forEach((l) => l(r));
  }
  function o(r) {
    i(r(a()));
  }
  function s(r) {
    return t.push(r), function() {
      const d = t.indexOf(r);
      d !== -1 && t.splice(d, 1);
    };
  }
  return { get: a, set: i, update: o, subscribe: s };
}
function At(n, e = {}) {
  const {
    title: t = "",
    subtitle: a = "",
    tabs: i = [],
    homeUrl: o = null,
    onTabChange: s = null
  } = e;
  n.classList.add("ab-app");
  const r = o ? `<a href="${o}" class="ab-app-back-link" aria-label="דף הבית">🏠</a>` : "", l = a ? `<span class="ab-app-subtitle">${a}</span>` : '<span class="ab-app-subtitle"></span>', d = i.map(
    (f) => `<button class="ab-app-tab" data-tab="${f.id}" aria-selected="false" role="tab"><span class="ab-app-tab-icon">${f.icon}</span><span class="ab-app-tab-label">${f.label}</span></button>`
  ).join(""), m = i.map(
    (f) => `<button class="ab-app-nav-item" data-tab="${f.id}" aria-selected="false" role="tab"><span class="ab-app-nav-icon">${f.icon}</span><span class="ab-app-nav-label">${f.label}</span></button>`
  ).join("");
  n.innerHTML = `
    <header class="ab-app-header">
      <div class="ab-app-header-text">
        <h1 class="ab-app-title">${t}</h1>
        ${l}
      </div>
      ${r}
    </header>
    <nav class="ab-app-tabs" role="tablist" aria-label="ניווט ראשי">
      ${d}
    </nav>
    <main class="ab-app-content"></main>
    <nav class="ab-app-bottom-nav" role="tablist" aria-label="ניווט תחתון">
      ${m}
    </nav>
  `;
  const c = n.querySelector(".ab-app-subtitle"), _ = n.querySelector(".ab-app-content");
  function g(f) {
    y(f), typeof s == "function" && s(f);
  }
  n.querySelectorAll(".ab-app-tab, .ab-app-nav-item").forEach((f) => {
    f.addEventListener("click", () => g(f.dataset.tab));
  });
  function y(f) {
    n.querySelectorAll(".ab-app-tab, .ab-app-nav-item").forEach((b) => {
      const u = b.dataset.tab === f;
      b.classList.toggle("ab-active", u), b.setAttribute("aria-selected", u ? "true" : "false");
    });
  }
  return i.length > 0 && y(i[0].id), {
    /** אלמנט תוכן הראשי — כאן מרנדרים את תוכן הטאב הנוכחי */
    contentEl: _,
    /**
     * עדכן את כותרת המשנה
     * @param {string} text - הטקסט החדש לכותרת המשנה
     */
    setSubtitle(f) {
      c.textContent = f;
    },
    /**
     * הגדר את הטאב הפעיל באופן תכנותי
     * @param {string} tabId - מזהה הטאב להפעלה
     */
    setActiveTab(f) {
      y(f);
    }
  };
}
function ze() {
  return ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/ogg"].find((e) => MediaRecorder.isTypeSupported(e)) || "";
}
function Ve() {
  var n;
  return typeof navigator < "u" && typeof ((n = navigator.mediaDevices) == null ? void 0 : n.getUserMedia) == "function" && typeof MediaRecorder < "u";
}
function Ge() {
  let n = null, e = null, t = [];
  async function a() {
    if (n && n.state === "recording") return;
    e = await navigator.mediaDevices.getUserMedia({ audio: !0, video: !1 }), t = [];
    const l = {}, d = ze();
    d && (l.mimeType = d), n = new MediaRecorder(e, l), n.ondataavailable = (m) => {
      var c;
      ((c = m.data) == null ? void 0 : c.size) > 0 && t.push(m.data);
    }, n.start(100);
  }
  function i() {
    return new Promise((l, d) => {
      if (!n || n.state === "inactive") {
        d(new Error("[voice-recorder] not recording"));
        return;
      }
      n.onstop = () => {
        const m = new Blob(t, { type: n.mimeType || "audio/webm" });
        s(), l(m);
      }, n.onerror = (m) => {
        s(), d(m.error);
      }, n.stop();
    });
  }
  function o() {
    n && n.state !== "inactive" && (n.ondataavailable = null, n.onstop = null, n.stop()), s();
  }
  function s() {
    e == null || e.getTracks().forEach((l) => l.stop()), e = null, n = null, t = [];
  }
  function r() {
    return (n == null ? void 0 : n.state) === "recording";
  }
  return { start: a, stop: i, cancel: o, isActive: r };
}
const Xe = "alefbet-voices", L = "recordings", Ye = 1;
let F = null;
function G() {
  return F || (F = new Promise((n, e) => {
    const t = indexedDB.open(Xe, Ye);
    t.onupgradeneeded = (a) => {
      a.target.result.createObjectStore(L);
    }, t.onsuccess = (a) => n(a.target.result), t.onerror = (a) => {
      F = null, e(a.target.error);
    };
  }), F);
}
function ee(n, e) {
  return `${n}/${e}`;
}
async function Je(n, e, t) {
  const a = await G();
  return new Promise((i, o) => {
    const s = a.transaction(L, "readwrite");
    s.objectStore(L).put(t, ee(n, e)), s.oncomplete = i, s.onerror = (r) => o(r.target.error);
  });
}
async function te(n, e) {
  const t = await G();
  return new Promise((a, i) => {
    const s = t.transaction(L, "readonly").objectStore(L).get(ee(n, e));
    s.onsuccess = () => a(s.result ?? null), s.onerror = (r) => i(r.target.error);
  });
}
async function Ke(n, e) {
  const t = await G();
  return new Promise((a, i) => {
    const o = t.transaction(L, "readwrite");
    o.objectStore(L).delete(ee(n, e)), o.oncomplete = a, o.onerror = (s) => i(s.target.error);
  });
}
async function Tt(n) {
  const e = await G();
  return new Promise((t, a) => {
    const o = e.transaction(L, "readonly").objectStore(L).getAllKeys();
    o.onsuccess = () => {
      const s = `${n}/`;
      t(
        (o.result || []).filter((r) => r.startsWith(s)).map((r) => r.slice(s.length))
      );
    }, o.onerror = (s) => a(s.target.error);
  });
}
async function Ze(n, e) {
  let t;
  try {
    t = await te(n, e);
  } catch {
    return !1;
  }
  return t ? new Promise((a) => {
    const i = URL.createObjectURL(t), o = new Audio(i), s = (r) => {
      URL.revokeObjectURL(i), a(r);
    };
    o.onended = () => s(!0), o.onerror = () => s(!1), o.play().catch(() => s(!1));
  }) : !1;
}
async function $t(n, e) {
  return await te(n, e).catch(() => null) !== null;
}
function Qe(n, {
  gameId: e,
  voiceKey: t,
  label: a = "הקלטת קול",
  onSaved: i,
  onDeleted: o
} = {}) {
  if (!Ve()) {
    const p = document.createElement("span");
    return p.className = "ab-voice-unsupported", p.textContent = "🎤 הקלטה לא נתמכת בדפדפן זה", n.appendChild(p), { refresh: async () => {
    }, destroy: () => p.remove() };
  }
  const s = Ge(), r = document.createElement("div");
  r.className = "ab-voice-btn-wrap", r.setAttribute("aria-label", a), n.appendChild(r);
  let l = "idle", d = null, m = null, c = null, _ = null, g = null, y = null, f = 0;
  function b() {
    if (r.innerHTML = "", l === "idle")
      d = u("🎤", "ab-voice-btn ab-voice-btn--record", "התחל הקלטה", k), r.appendChild(d);
    else if (l === "recording") {
      g = document.createElement("span"), g.className = "ab-voice-indicator", r.appendChild(g);
      const p = document.createElement("span");
      p.className = "ab-voice-timer", p.textContent = "0:00", r.appendChild(p), f = 0, y = setInterval(() => {
        f++;
        const E = Math.floor(f / 60), D = String(f % 60).padStart(2, "0");
        p.textContent = `${E}:${D}`, f >= 120 && h();
      }, 1e3), m = u("⏹", "ab-voice-btn ab-voice-btn--stop", "עצור הקלטה", h), r.appendChild(m);
    } else l === "has-voice" && (c = u("▶", "ab-voice-btn ab-voice-btn--play", "נגן הקלטה", w), r.appendChild(c), d = u("🎤", "ab-voice-btn ab-voice-btn--re-record", "הקלט מחדש", k), r.appendChild(d), _ = u("🗑", "ab-voice-btn ab-voice-btn--delete", "מחק הקלטה", v), r.appendChild(_));
  }
  function u(p, E, D, fe) {
    const S = document.createElement("button");
    return S.className = E, S.type = "button", S.title = D, S.setAttribute("aria-label", D), S.textContent = p, S.addEventListener("click", fe), S;
  }
  async function k() {
    try {
      await s.start(), l = "recording", b();
    } catch (p) {
      console.warn("[voice-record-button] microphone access denied:", p), x("לא ניתן לגשת למיקרופון");
    }
  }
  async function h() {
    clearInterval(y);
    try {
      const p = await s.stop();
      await Je(e, t, p), l = "has-voice", b(), i == null || i(p);
    } catch (p) {
      console.warn("[voice-record-button] stop error:", p), l = "idle", b();
    }
  }
  async function w() {
    c == null || c.setAttribute("disabled", "true"), await Ze(e, t), c == null || c.removeAttribute("disabled");
  }
  async function v() {
    confirm("למחוק את ההקלטה?") && (await Ke(e, t), l = "idle", b(), o == null || o());
  }
  function x(p) {
    const E = document.createElement("span");
    E.className = "ab-voice-error", E.textContent = p, r.appendChild(E), setTimeout(() => E.remove(), 3e3);
  }
  async function R() {
    if (s.isActive()) return;
    l = await te(e, t).catch(() => null) ? "has-voice" : "idle", b();
  }
  function B() {
    clearInterval(y), s.isActive() && s.cancel(), r.remove();
  }
  return R(), { refresh: R, destroy: B };
}
function et(n, { onClick: e } = {}) {
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
function tt(n, e, {
  onSelectRound: t,
  onAddRound: a,
  onDuplicateRound: i,
  onMoveRound: o
}) {
  const s = document.createElement("div");
  s.className = "ab-editor-nav", s.setAttribute("aria-label", "ניווט סיבובים");
  const r = document.createElement("div");
  r.className = "ab-editor-nav__header", r.textContent = "סיבובים", s.appendChild(r);
  const l = document.createElement("div");
  l.className = "ab-editor-nav__list", s.appendChild(l);
  const d = document.createElement("button");
  d.className = "ab-editor-nav__add", d.textContent = "+ הוסף", d.addEventListener("click", () => a(null)), s.appendChild(d), n.appendChild(s);
  let m = null, c = [];
  function _() {
    c.forEach((u) => u.destroy()), c = [];
  }
  function g(u, k) {
    const h = document.createElement("div");
    h.className = "ab-editor-nav__thumb", u.id === m && h.classList.add("ab-editor-nav__thumb--active"), h.setAttribute("role", "button"), h.setAttribute("tabindex", "0"), h.setAttribute("aria-label", `סיבוב ${k + 1}`), h.dataset.roundId = u.id, u.image && (h.style.backgroundImage = `url(${u.image})`, h.classList.add("ab-editor-nav__thumb--has-img"));
    const w = document.createElement("div");
    w.className = "ab-editor-nav__grip", w.innerHTML = "⠿", w.setAttribute("aria-hidden", "true"), w.title = "גרור לשינוי סדר", h.appendChild(w);
    const v = document.createElement("div");
    if (v.className = "ab-editor-nav__num", v.textContent = k + 1, h.appendChild(v), u.correctEmoji && !u.image) {
      const p = document.createElement("div");
      p.className = "ab-editor-nav__emoji", p.textContent = u.correctEmoji, h.appendChild(p);
    }
    if (u.target) {
      const p = document.createElement("div");
      p.className = "ab-editor-nav__letter", p.textContent = u.target, h.appendChild(p);
    }
    const x = document.createElement("button");
    x.className = "ab-editor-nav__dup", x.innerHTML = "⧉", x.title = "שכפל סיבוב", x.setAttribute("aria-label", "שכפל סיבוב"), x.addEventListener("click", (p) => {
      p.stopPropagation(), i(u.id);
    }), h.appendChild(x), h.addEventListener("click", () => t(u.id)), h.addEventListener("keydown", (p) => {
      (p.key === "Enter" || p.key === " ") && (p.preventDefault(), t(u.id));
    });
    const R = Oe(w, { roundId: u.id });
    c.push(R);
    const B = We(h, ({ data: p }) => {
      if (p.roundId === u.id) return;
      const E = e.getRoundIndex(u.id);
      o(p.roundId, E);
    });
    return c.push(B), h;
  }
  function y() {
    _(), l.innerHTML = "", e.rounds.forEach((u, k) => {
      l.appendChild(g(u, k));
    });
  }
  function f(u) {
    m = u, l.querySelectorAll(".ab-editor-nav__thumb").forEach((k) => {
      k.classList.toggle("ab-editor-nav__thumb--active", k.dataset.roundId === u);
    });
  }
  function b() {
    _(), s.remove();
  }
  return y(), { refresh: y, setActiveRound: f, destroy: b };
}
const de = {
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
function nt(n, { onFieldChange: e, onDeleteRound: t, getEditableFields: a }) {
  const i = document.createElement("div");
  i.className = "ab-editor-inspector";
  const o = document.createElement("div");
  o.className = "ab-editor-inspector__header", o.innerHTML = '<span class="ab-editor-inspector__title">✏️ ערוך סיבוב</span>', i.appendChild(o);
  const s = document.createElement("div");
  s.className = "ab-editor-inspector__body", i.appendChild(s);
  const r = document.createElement("button");
  r.className = "ab-editor-inspector__delete", r.textContent = "🗑 מחק סיבוב", i.appendChild(r), n.appendChild(i);
  let l = null;
  function d() {
    s.innerHTML = '<p class="ab-editor-inspector__empty">בחר סיבוב לעריכה</p>', r.hidden = !0, l = null;
  }
  function m(g, y = "multiple-choice") {
    l = g.id, s.innerHTML = "", r.hidden = !1, ((a ? a(y) : null) || de[y] || de["multiple-choice"]).forEach((b) => {
      const u = document.createElement("div");
      u.className = "ab-editor-field";
      const k = document.createElement("label");
      if (k.className = "ab-editor-field__label", k.textContent = b.label, u.appendChild(k), b.type === "emoji") {
        const h = document.createElement("div");
        h.className = "ab-editor-field__emoji-row";
        const w = document.createElement("div");
        w.className = "ab-editor-field__emoji-preview", w.textContent = g[b.key] || "❓", h.appendChild(w);
        const v = document.createElement("input");
        v.className = "ab-editor-field__input", v.type = "text", v.value = g[b.key] || "", v.maxLength = 8, v.placeholder = "🐱", v.style.fontSize = "20px", v.addEventListener("input", () => {
          w.textContent = v.value || "❓", e(l, b.key, v.value);
        }), h.appendChild(v), u.appendChild(h);
      } else {
        const h = document.createElement("input");
        h.className = "ab-editor-field__input", h.type = "text", h.value = g[b.key] || "", h.dir = "rtl", b.maxLength && (h.maxLength = b.maxLength), h.addEventListener("input", () => {
          e(l, b.key, h.value);
        }), u.appendChild(h);
      }
      s.appendChild(u);
    }), s.appendChild(c(g)), r.onclick = () => {
      confirm("למחוק את הסיבוב הזה?") && (t(l), d());
    };
  }
  function c(g) {
    const y = document.createElement("div");
    y.className = "ab-editor-field ab-editor-field--image";
    const f = document.createElement("label");
    f.className = "ab-editor-field__label", f.textContent = "🖼 תמונה", y.appendChild(f);
    const b = document.createElement("div");
    b.className = "ab-editor-field__img-row";
    const u = document.createElement("div");
    u.className = "ab-editor-field__img-preview", g.image && (u.style.backgroundImage = `url(${g.image})`), b.appendChild(u);
    const k = document.createElement("div");
    k.className = "ab-editor-field__img-btns";
    const h = document.createElement("input");
    h.type = "file", h.accept = "image/*", h.style.display = "none", h.addEventListener("change", () => {
      var B;
      const x = (B = h.files) == null ? void 0 : B[0];
      if (!x) return;
      const R = new FileReader();
      R.onload = (p) => {
        const E = p.target.result;
        u.style.backgroundImage = `url(${E})`, e(l, "image", E), v.isConnected || k.appendChild(v);
      }, R.readAsDataURL(x);
    }), k.appendChild(h);
    const w = document.createElement("button");
    w.className = "ab-editor-btn ab-editor-btn--img-upload", w.textContent = g.image ? "🔄 החלף" : "📤 העלה", w.addEventListener("click", () => h.click()), k.appendChild(w);
    const v = document.createElement("button");
    return v.className = "ab-editor-btn ab-editor-btn--img-clear", v.textContent = "✕ הסר", v.addEventListener("click", () => {
      u.style.backgroundImage = "", e(l, "image", null), v.remove(), w.textContent = "📤 העלה";
    }), g.image && k.appendChild(v), b.appendChild(k), y.appendChild(b), y;
  }
  function _() {
    i.remove();
  }
  return d(), { loadRound: m, clear: d, destroy: _ };
}
let at = 0;
function Y() {
  return `round-${Date.now()}-${at++}`;
}
class V {
  /**
   * @param {object} schema - { id, version, meta, rounds, distractors }
   */
  constructor(e) {
    this._id = e.id || "game", this._version = e.version || 1, this._meta = { title: "", type: "multiple-choice", ...e.meta }, this._rounds = (e.rounds || []).map((t) => ({ ...t, id: t.id || Y() })), this._distractors = e.distractors || [], this._handlers = [], this._past = [], this._future = [];
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
    a !== -1 && (this._saveHistory(), this._rounds[a] = { ...this._rounds[a], ...t }, this._emit());
  }
  addRound(e = null) {
    this._saveHistory();
    const t = { id: Y(), target: "", correct: "", correctEmoji: "❓" };
    if (e === null)
      this._rounds.push(t);
    else {
      const a = this.getRoundIndex(e);
      this._rounds.splice(a + 1, 0, t);
    }
    return this._emit(), t.id;
  }
  /**
   * שכפל סיבוב קיים ומקם את העותק מיד אחריו.
   * @param {string} id
   * @returns {string|null} מזהה הסיבוב החדש, או null אם לא נמצא
   */
  duplicateRound(e) {
    const t = this.getRound(e);
    if (!t) return null;
    this._saveHistory();
    const a = { ...t, id: Y() }, i = this.getRoundIndex(e);
    return this._rounds.splice(i + 1, 0, a), this._emit(), a.id;
  }
  removeRound(e) {
    const t = this.getRoundIndex(e);
    t === -1 || this._rounds.length <= 1 || (this._saveHistory(), this._rounds.splice(t, 1), this._emit());
  }
  moveRound(e, t) {
    const a = this.getRoundIndex(e);
    if (a === -1) return;
    this._saveHistory();
    const [i] = this._rounds.splice(a, 1);
    this._rounds.splice(Math.max(0, Math.min(t, this._rounds.length)), 0, i), this._emit();
  }
  // ── Undo / Redo ──────────────────────────────────────────────────────────
  get canUndo() {
    return this._past.length > 0;
  }
  get canRedo() {
    return this._future.length > 0;
  }
  undo() {
    this.canUndo && (this._future.push(this._rounds.map((e) => ({ ...e }))), this._rounds = this._past.pop(), this._emit());
  }
  redo() {
    this.canRedo && (this._past.push(this._rounds.map((e) => ({ ...e }))), this._rounds = this._future.pop(), this._emit());
  }
  _saveHistory() {
    this._past.push(this._rounds.map((e) => ({ ...e }))), this._future = [], this._past.length > 50 && this._past.shift();
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
    return new V(e);
  }
  /**
   * Migration helper: convert a plain ROUNDS array into a GameData instance.
   * @param {string} gameId
   * @param {object[]} rounds
   * @param {object} meta - { title, type }
   * @param {object[]} [distractors]
   */
  static fromRoundsArray(e, t, a = {}, i = []) {
    return new V({ id: e, meta: a, rounds: t, distractors: i });
  }
}
const me = "alefbet.editor.";
function he(n) {
  return ue(`${me}${n}`, null);
}
function it(n) {
  he(n.id).set(n.toJSON());
}
function Mt(n) {
  const e = he(n).get();
  if (!e) return null;
  try {
    return V.fromJSON(e);
  } catch {
    return null;
  }
}
function It(n) {
  try {
    localStorage.removeItem(`${me}${n}`);
  } catch {
  }
}
function ot(n) {
  const e = JSON.stringify(n.toJSON(), null, 2), t = new Blob([e], { type: "application/json;charset=utf-8" }), a = URL.createObjectURL(t), i = document.createElement("a");
  i.href = a, i.download = `${n.id}-rounds.json`, i.click(), URL.revokeObjectURL(a);
}
const st = [
  {
    id: "instructions",
    label: "📝 הוראות",
    slots: [
      { key: "instruction-welcome", label: "ברוכים הבאים" },
      { key: "instruction-how-to", label: "איך משחקים" },
      { key: "instruction-complete", label: "סיום המשחק" }
    ]
  },
  {
    id: "feedback",
    label: "✅ משוב",
    slots: [
      { key: "feedback-correct", label: "תשובה נכונה — כל הכבוד!" },
      { key: "feedback-wrong", label: "תשובה שגויה" },
      { key: "feedback-try-again", label: "נסה שוב" },
      { key: "feedback-encourage", label: "עידוד כללי" }
    ]
  },
  {
    id: "nikud",
    label: "◌ ניקוד",
    slots: [
      { key: "nikud-patah", label: "פַּתַח" },
      { key: "nikud-kamatz", label: "קָמַץ" },
      { key: "nikud-hiriq", label: "חִירִיק" },
      { key: "nikud-tsere", label: "צֵרֵי" },
      { key: "nikud-segol", label: "סֶגּוֹל" },
      { key: "nikud-holam", label: "חוֹלָם" },
      { key: "nikud-shuruq", label: "שׁוּרוּק" }
    ]
  }
];
function rt(n) {
  return n.trim().replace(/\s+/g, "-").replace(/[^a-z0-9\u05D0-\u05EA_-]/gi, "").toLowerCase() || `custom-${Date.now()}`;
}
function lt(n) {
  return ue(`alefbet.audio-manager.${n}.custom`, []);
}
function dt(n, e = null) {
  var d;
  (d = document.getElementById("ab-audio-manager")) == null || d.remove();
  const t = document.createElement("div");
  t.id = "ab-audio-manager", t.className = "ab-am-modal", t.setAttribute("role", "dialog"), t.setAttribute("aria-modal", "true"), t.setAttribute("aria-label", "מנהל הקלטות"), t.innerHTML = `
    <div class="ab-am-backdrop"></div>
    <div class="ab-am-box">
      <div class="ab-am-header">
        <span class="ab-am-title">🎤 מנהל הקלטות</span>
        <span class="ab-am-subtitle">כל ההקלטות נשמרות בדפדפן וניתן להשתמש בהן דרך <code>playVoice('${n}', voiceKey)</code></span>
        <button class="ab-am-close" aria-label="סגור">✕</button>
      </div>
      <div class="ab-am-body" id="ab-am-body"></div>
    </div>
  `, document.body.appendChild(t);
  const a = t.querySelector("#ab-am-body"), i = t.querySelector(".ab-am-close"), o = t.querySelector(".ab-am-backdrop"), s = [], r = [...st];
  e && e.rounds.length > 0 && r.splice(1, 0, {
    // insert after Instructions
    id: "rounds",
    label: "🔤 שאלות / סיבובים",
    slots: e.rounds.map((m, c) => ({
      key: m.id,
      label: `סיבוב ${c + 1}${m.target ? " — " + m.target : ""}${m.correct ? " (" + m.correct + ")" : ""}`
    }))
  }), r.forEach((m) => {
    a.appendChild(ct(m, n, s));
  }), a.appendChild(ut(n, s));
  function l() {
    s.forEach((m) => m.destroy()), t.remove();
  }
  i.addEventListener("click", l), o.addEventListener("click", l), document.addEventListener("keydown", function m(c) {
    c.key === "Escape" && (l(), document.removeEventListener("keydown", m));
  });
}
function ct(n, e, t) {
  const a = document.createElement("section");
  a.className = "ab-am-section";
  const i = document.createElement("button");
  i.className = "ab-am-section__heading", i.setAttribute("aria-expanded", "true"), i.innerHTML = `<span>${n.label}</span><span class="ab-am-chevron">▾</span>`, a.appendChild(i);
  const o = document.createElement("div");
  return o.className = "ab-am-grid", a.appendChild(o), n.slots.forEach((s) => {
    o.appendChild(pe(e, s.key, s.label, t));
  }), i.addEventListener("click", () => {
    const s = i.getAttribute("aria-expanded") === "true";
    i.setAttribute("aria-expanded", String(!s)), o.hidden = s, i.querySelector(".ab-am-chevron").textContent = s ? "▸" : "▾";
  }), a;
}
function ut(n, e) {
  const t = lt(n), a = document.createElement("section");
  a.className = "ab-am-section";
  const i = document.createElement("button");
  i.className = "ab-am-section__heading", i.setAttribute("aria-expanded", "true"), i.innerHTML = '<span>➕ מותאם אישית</span><span class="ab-am-chevron">▾</span>', a.appendChild(i);
  const o = document.createElement("div");
  o.className = "ab-am-grid", a.appendChild(o);
  function s() {
    o.querySelectorAll(".ab-am-row").forEach((c) => {
      const _ = c._voiceBtn;
      _ && (e.splice(e.indexOf(_), 1), _.destroy());
    }), o.innerHTML = "", t.get().forEach((c) => {
      const _ = pe(n, c.key, c.label, e, () => {
        t.update((g) => g.filter((y) => y.key !== c.key)), s();
      });
      o.appendChild(_);
    });
  }
  s();
  const r = document.createElement("div");
  r.className = "ab-am-add-row", r.innerHTML = `
    <input class="ab-am-add-input" type="text" placeholder="שם ההקלטה... (למשל: שאלה ראשונה)" dir="rtl" />
    <button class="ab-am-add-btn">+ הוסף</button>
  `, a.appendChild(r);
  const l = r.querySelector(".ab-am-add-input"), d = r.querySelector(".ab-am-add-btn");
  function m() {
    const c = l.value.trim();
    if (!c) return;
    const _ = rt(c);
    if (t.get().some((g) => g.key === _)) {
      l.select();
      return;
    }
    t.update((g) => [...g, { key: _, label: c }]), l.value = "", s();
  }
  return d.addEventListener("click", m), l.addEventListener("keydown", (c) => {
    c.key === "Enter" && m();
  }), i.addEventListener("click", () => {
    const c = i.getAttribute("aria-expanded") === "true";
    i.setAttribute("aria-expanded", String(!c)), o.hidden = c, r.hidden = c, i.querySelector(".ab-am-chevron").textContent = c ? "▸" : "▾";
  }), a;
}
function pe(n, e, t, a, i = null) {
  const o = document.createElement("div");
  o.className = "ab-am-row";
  const s = document.createElement("div");
  s.className = "ab-am-row__label", s.textContent = t;
  const r = document.createElement("code");
  r.className = "ab-am-row__key", r.textContent = e;
  const l = document.createElement("div");
  l.className = "ab-am-row__label-col", l.appendChild(s), l.appendChild(r);
  const d = document.createElement("div");
  if (d.className = "ab-am-row__ctrl", i) {
    const c = document.createElement("button");
    c.className = "ab-am-row__del", c.title = "הסר", c.setAttribute("aria-label", "הסר הקלטה"), c.textContent = "✕", c.addEventListener("click", i), d.appendChild(c);
  }
  const m = Qe(d, { gameId: n, voiceKey: e, label: t });
  return a.push(m), o._voiceBtn = m, o.appendChild(l), o.appendChild(d), o;
}
class jt {
  /**
   * @param {HTMLElement} container  — same container passed to GameShell
   * @param {import('./game-data.js').GameData} gameData
   * @param {{\
   *   restartGame:       (container: HTMLElement) => void,
   *   getEditableFields?: (type: string) => object[],
   * }} options
   */
  constructor(e, t, { restartGame: a, getEditableFields: i } = {}) {
    this._container = e, this._gameData = t, this._restartGame = a, this._getEditableFields = i || null, this._mode = "play", this._overlay = null, this._navigator = null, this._inspector = null, this._toolbar = null, this._selectedId = null, this._undoBtn = null, this._redoBtn = null, this._shortcutHandler = null, requestAnimationFrame(() => this._injectToolbar());
  }
  // ── Toolbar ──────────────────────────────────────────────────────────────
  _injectToolbar() {
    const e = this._container.querySelector(".game-header__spacer");
    e && (this._toolbar = document.createElement("div"), this._toolbar.className = "ab-editor-toolbar", this._editBtn = this._makeBtn("✏️ ערוך", "ab-editor-btn--edit", () => this.enterEditMode()), this._audioBtn = this._makeBtn("🎤 קול", "ab-editor-btn--audio", () => this._openAudioManager()), this._toolbar.append(this._editBtn, this._audioBtn), e.innerHTML = "", e.appendChild(this._toolbar));
  }
  _makeBtn(e, t, a) {
    const i = document.createElement("button");
    return i.className = `ab-editor-btn ${t}`, i.innerHTML = e, i.addEventListener("click", a), i;
  }
  _setToolbarEditMode() {
    this._toolbar.innerHTML = "";
    const e = this._makeBtn("▶ שחק", "ab-editor-btn--play", () => this.enterPlayMode()), t = this._makeBtn("+ הוסף", "ab-editor-btn--add", () => this._addRound()), a = this._makeBtn("💾 שמור", "ab-editor-btn--save", () => this._save()), i = this._makeBtn("🎤 קול", "ab-editor-btn--audio", () => this._openAudioManager()), o = this._makeBtn("⬇ ייצוא", "ab-editor-btn--export", () => ot(this._gameData));
    this._undoBtn = this._makeBtn("↩", "ab-editor-btn--undo", () => this._undo()), this._undoBtn.title = "בטל (Ctrl+Z)", this._redoBtn = this._makeBtn("↪", "ab-editor-btn--redo", () => this._redo()), this._redoBtn.title = "בצע שנית (Ctrl+Y)", this._toolbar.append(e, t, this._undoBtn, this._redoBtn, a, i, o), this._refreshUndoButtons();
  }
  _setToolbarPlayMode() {
    this._toolbar.innerHTML = "", this._undoBtn = null, this._redoBtn = null, this._editBtn = this._makeBtn("✏️ ערוך", "ab-editor-btn--edit", () => this.enterEditMode()), this._audioBtn = this._makeBtn("🎤 קול", "ab-editor-btn--audio", () => this._openAudioManager()), this._toolbar.append(this._editBtn, this._audioBtn);
  }
  // ── Mode switching ────────────────────────────────────────────────────────
  enterEditMode() {
    if (this._mode === "edit") return;
    this._mode = "edit", this._container.classList.add("ab-editor-active"), this._setToolbarEditMode(), this._attachShortcuts();
    const e = this._container.querySelector(".game-body");
    if (!e) return;
    this._overlay = et(e), this._overlay.show(), this._navigator = tt(
      this._container,
      this._gameData,
      {
        onSelectRound: (a) => this._selectRound(a),
        onAddRound: (a) => this._addRound(a),
        onDuplicateRound: (a) => this._duplicateRound(a),
        onMoveRound: (a, i) => this._moveRound(a, i)
      }
    ), this._inspector = nt(
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
    this._mode !== "play" && (this._mode = "play", this._container.classList.remove("ab-editor-active"), this._setToolbarPlayMode(), this._detachShortcuts(), (e = this._overlay) == null || e.destroy(), (t = this._navigator) == null || t.destroy(), (a = this._inspector) == null || a.destroy(), this._overlay = this._navigator = this._inspector = null, this._selectedId = null, (i = this._restartGame) == null || i.call(this, this._container));
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
    (a = this._navigator) == null || a.refresh(), this._selectRound(t), this._refreshUndoButtons();
  }
  _duplicateRound(e) {
    var a;
    const t = this._gameData.duplicateRound(e ?? this._selectedId);
    t && ((a = this._navigator) == null || a.refresh(), this._selectRound(t), this._refreshUndoButtons());
  }
  _deleteRound(e) {
    var a;
    this._gameData.removeRound(e), (a = this._navigator) == null || a.refresh();
    const t = this._gameData.rounds;
    t.length > 0 && this._selectRound(t[0].id), this._refreshUndoButtons();
  }
  _moveRound(e, t) {
    var a, i;
    this._gameData.moveRound(e, t), (a = this._navigator) == null || a.refresh(), (i = this._navigator) == null || i.setActiveRound(e), this._refreshUndoButtons();
  }
  _onFieldChange(e, t, a) {
    var i, o;
    this._gameData.updateRound(e, { [t]: a }), (i = this._navigator) == null || i.refresh(), (o = this._navigator) == null || o.setActiveRound(e), this._refreshUndoButtons();
  }
  // ── Undo / Redo ───────────────────────────────────────────────────────────
  _undo() {
    var e;
    this._gameData.canUndo && (this._gameData.undo(), (e = this._navigator) == null || e.refresh(), this._resyncSelection(), this._refreshUndoButtons(), this._showToast("↩ בוטל"));
  }
  _redo() {
    var e;
    this._gameData.canRedo && (this._gameData.redo(), (e = this._navigator) == null || e.refresh(), this._resyncSelection(), this._refreshUndoButtons(), this._showToast("↪ בוצע שנית"));
  }
  /** Re-select the current round (or fall back to first) after undo/redo. */
  _resyncSelection() {
    const e = this._gameData.rounds;
    e.find((a) => a.id === this._selectedId) ? this._selectRound(this._selectedId) : e.length > 0 && this._selectRound(e[0].id);
  }
  _refreshUndoButtons() {
    this._undoBtn && (this._undoBtn.disabled = !this._gameData.canUndo), this._redoBtn && (this._redoBtn.disabled = !this._gameData.canRedo);
  }
  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  _attachShortcuts() {
    this._shortcutHandler = (e) => {
      if (this._mode !== "edit") return;
      const t = e.ctrlKey || e.metaKey;
      if (e.key === "Escape") {
        this.enterPlayMode();
        return;
      }
      if (t && !e.shiftKey && e.key.toLowerCase() === "s") {
        e.preventDefault(), this._save();
        return;
      }
      if (t && !e.shiftKey && e.key.toLowerCase() === "z") {
        e.preventDefault(), this._undo();
        return;
      }
      if (t && (e.key.toLowerCase() === "y" || e.shiftKey && e.key.toLowerCase() === "z")) {
        e.preventDefault(), this._redo();
        return;
      }
    }, document.addEventListener("keydown", this._shortcutHandler);
  }
  _detachShortcuts() {
    this._shortcutHandler && (document.removeEventListener("keydown", this._shortcutHandler), this._shortcutHandler = null);
  }
  // ── Audio Manager ─────────────────────────────────────────────────────────
  _openAudioManager() {
    dt(this._gameData.id, this._gameData);
  }
  // ── Save ──────────────────────────────────────────────────────────────────
  _save() {
    it(this._gameData), this._showToast("✅ נשמר!");
  }
  _showToast(e) {
    const t = document.createElement("div");
    t.className = "ab-editor-toast", t.textContent = e, document.body.appendChild(t), setTimeout(() => t.remove(), 2200);
  }
}
export {
  be as EventBus,
  V as GameData,
  jt as GameEditor,
  mt as GameShell,
  _e as GameState,
  we as addNikud,
  U as animate,
  It as clearGameData,
  At as createAppShell,
  Oe as createDragSource,
  We as createDropTarget,
  xt as createFeedback,
  ue as createLocalState,
  Bt as createNikudBox,
  wt as createOptionCards,
  Et as createProgressBar,
  pt as createRoundManager,
  ft as createSpeechListener,
  Qe as createVoiceRecordButton,
  Ge as createVoiceRecorder,
  Ct as createZone,
  Ke as deleteVoice,
  ot as exportGameDataAsJSON,
  _t as getLetter,
  Fe as getLettersByGroup,
  Ee as getNikud,
  $t as hasVoice,
  q as hebrewLetters,
  Rt as hideLoadingScreen,
  St as injectHeaderButton,
  Ve as isVoiceRecordingSupported,
  yt as letterWithNikud,
  Tt as listVoiceKeys,
  Mt as loadGameData,
  te as loadVoice,
  bt as matchNikudSound,
  vt as nikudBaseLetters,
  W as nikudList,
  Ze as playVoice,
  ht as preloadNikud,
  gt as randomLetters,
  kt as randomNikud,
  it as saveGameData,
  Je as saveVoice,
  dt as showAudioManager,
  Me as showCompletionScreen,
  Lt as showLoadingScreen,
  Nt as showNikudSettingsDialog,
  O as sounds,
  Te as tts
};
