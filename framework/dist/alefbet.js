class pe {
  constructor() {
    this._handlers = {};
  }
  /** הירשם לאירוע */
  on(e, n) {
    return this._handlers[e] || (this._handlers[e] = []), this._handlers[e].push(n), this;
  }
  /** בטל הרשמה לאירוע */
  off(e, n) {
    return this._handlers[e] ? (this._handlers[e] = this._handlers[e].filter((a) => a !== n), this) : this;
  }
  /** שלח אירוע */
  emit(e, n) {
    return (this._handlers[e] || []).slice().forEach((a) => a(n)), this;
  }
}
class fe {
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
class at {
  /**
   * @param {HTMLElement} containerEl - אלמנט המיכל
   * @param {object} config - הגדרות: { totalRounds, title, homeUrl }
   */
  constructor(e, n = {}) {
    this.container = e, this.config = {
      totalRounds: 8,
      title: "מִשְׂחָק",
      homeUrl: "../../index.html",
      ...n
    }, this.events = new pe(), this.state = new fe(this.config.totalRounds), this._buildShell();
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
  on(e, n) {
    return this.events.on(e, n), this;
  }
}
let M = null;
function be() {
  if (!M)
    try {
      M = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      return null;
    }
  return M.state === "suspended" && M.resume(), M;
}
function T(t, e, n = "sine", a = 0.3) {
  const o = be();
  if (o)
    try {
      const i = o.createOscillator(), s = o.createGain();
      i.connect(s), s.connect(o.destination), i.type = n, i.frequency.setValueAtTime(t, o.currentTime), s.gain.setValueAtTime(a, o.currentTime), s.gain.exponentialRampToValueAtTime(1e-3, o.currentTime + e), i.start(o.currentTime), i.stop(o.currentTime + e + 0.05);
    } catch {
    }
}
const W = {
  /** צליל תשובה נכונה */
  correct() {
    T(523.25, 0.15), setTimeout(() => T(659.25, 0.2), 120), setTimeout(() => T(783.99, 0.3), 240);
  },
  /** צליל עידוד עדין — נסה שוב */
  wrong() {
    T(350, 0.15, "triangle", 0.12);
  },
  /** צליל עידוד - סיום מוצלח */
  cheer() {
    [523.25, 587.33, 659.25, 698.46, 783.99, 1046.5].forEach((e, n) => setTimeout(() => T(e, 0.2), n * 90));
  },
  /** קליק עדין */
  click() {
    T(900, 0.04, "sine", 0.12);
  }
}, te = "https://nakdan-u1-0.loadbalancer.dicta.org.il/api";
let ne = !1;
const B = /* @__PURE__ */ new Map();
function ge() {
  var o;
  if (typeof window > "u") return te;
  const t = new URLSearchParams(window.location.search).get("nakdanProxy"), e = window.ALEFBET_NAKDAN_PROXY_URL;
  if (t && window.localStorage)
    try {
      window.localStorage.setItem("alefbet.nakdanProxyUrl", t);
    } catch {
    }
  const n = (o = window.localStorage) == null ? void 0 : o.getItem("alefbet.nakdanProxyUrl"), a = t || e || n;
  return a || (window.location.hostname.endsWith("github.io") ? null : te);
}
function _e(t) {
  var n;
  let e = "";
  for (const a of t)
    if (a.sep)
      e += a.str ?? "";
    else {
      const o = (n = a.nakdan) == null ? void 0 : n.options;
      o != null && o.length ? e += (o[0].w ?? "").replace(/\|/g, "").replace(/\u05BD/g, "") : e += a.str ?? "";
    }
  return e;
}
async function ve(t) {
  const e = ge();
  if (!e)
    throw ne || (ne = !0, console.warn("[nakdan] Dicta API blocked by CORS on GitHub Pages. Configure a proxy URL via ?nakdanProxy=..., window.ALEFBET_NAKDAN_PROXY_URL, or localStorage key alefbet.nakdanProxyUrl.")), new Error("Nakdan unavailable without proxy on this host");
  const n = await fetch(e, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      addmorph: !0,
      keepmetagim: !1,
      keepqq: !1,
      nodageshdefmem: !1,
      patachma: !1,
      task: "nakdan",
      data: t,
      useTokenization: !0,
      genre: "modern"
    })
  });
  if (!n.ok) throw new Error(`Nakdan ${n.status}`);
  const a = await n.json(), o = a == null ? void 0 : a.data;
  if (!Array.isArray(o)) throw new Error("Nakdan: invalid response");
  return _e(o);
}
async function ye(t) {
  if (!(t != null && t.trim())) return t ?? "";
  if (B.has(t)) return B.get(t);
  try {
    const e = await ve(t);
    return B.set(t, e), e;
  } catch {
    return B.set(t, t), t;
  }
}
function we(t) {
  return B.get(t) ?? t ?? "";
}
async function ot(t) {
  const e = [...new Set(t.filter((n) => n == null ? void 0 : n.trim()))];
  await Promise.all(e.map((n) => ye(n)));
}
let $ = [], H = !1, de = !0, j = 0.9, ae = typeof localStorage < "u" && parseFloat(localStorage.getItem("alefbet.nikudRate")) || 0.5, X = !1, P = null;
function oe(t, e, n, a = e) {
  console.warn(`[tts] ${t} TTS failed`, { text: e, sentText: a, reason: n }), typeof window < "u" && typeof window.dispatchEvent == "function" && window.dispatchEvent(new CustomEvent("alefbet:tts-error", {
    detail: { provider: t, text: e, sentText: a, reason: n }
  }));
}
function ke(t) {
  return (t || "").replace(/[\u0591-\u05C7]/g, "");
}
function xe(t) {
  const e = String(t || "").toLowerCase();
  return e.includes("didn't interact") || e.includes("notallowed");
}
function Ee() {
  var t;
  return typeof window > "u" || typeof document > "u" ? Promise.resolve() : X || (t = document.userActivation) != null && t.hasBeenActive ? (X = !0, Promise.resolve()) : P || (P = new Promise((e) => {
    const n = () => {
      X = !0, window.removeEventListener("pointerdown", n, !0), window.removeEventListener("keydown", n, !0), window.removeEventListener("touchstart", n, !0), e();
    };
    window.addEventListener("pointerdown", n, { once: !0, capture: !0 }), window.addEventListener("keydown", n, { once: !0, capture: !0 }), window.addEventListener("touchstart", n, { once: !0, capture: !0 });
  }).finally(() => {
    P = null;
  }), P);
}
function Ne(t, e, n) {
  const o = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(t)}&tl=he&client=tw-ob`, i = new Audio(o);
  i.playbackRate = j, i.onended = e, i.onerror = () => n("audio.onerror"), i.play().catch((s) => {
    n((s == null ? void 0 : s.message) || "audio.play() rejected");
  });
}
function Le(t) {
  return new Promise((e, n) => {
    const a = ke(t).trim() || t;
    let o = !1, i = !1;
    const s = () => {
      o || (o = !0, e());
    }, r = (l) => {
      o || (o = !0, n(l));
    }, c = () => {
      try {
        Ne(a, s, (l) => {
          if (!i && xe(l)) {
            i = !0, Ee().then(() => {
              o || c();
            });
            return;
          }
          oe("google", t, l, a), r(l);
        });
      } catch (l) {
        oe("google", t, (l == null ? void 0 : l.message) || "Audio() construction failed", a), r(l == null ? void 0 : l.message);
      }
    };
    c();
  });
}
let J = null;
function Ce() {
  const t = speechSynthesis.getVoices();
  return t.find((e) => e.lang === "he-IL") || t.find((e) => e.lang === "iw-IL") || t.find((e) => e.lang.startsWith("he")) || null;
}
function ie() {
  J = Ce();
}
typeof speechSynthesis < "u" && (speechSynthesis.getVoices().length > 0 ? ie() : speechSynthesis.addEventListener("voiceschanged", ie, { once: !0 }));
function Re(t) {
  return new Promise((e) => {
    if (typeof speechSynthesis > "u") {
      e();
      return;
    }
    const n = new SpeechSynthesisUtterance(t);
    n.lang = "he-IL", n.rate = j, J && (n.voice = J), n.onend = e, n.onerror = e, speechSynthesis.speak(n);
  });
}
async function Se(t) {
  if (de)
    try {
      await Le(t);
      return;
    } catch {
      console.info("[tts] Falling back to browser Speech API");
    }
  await Re(t);
}
function Y() {
  if (H || $.length === 0) return;
  const t = $.shift();
  H = !0, Se(t.text).then(() => {
    H = !1, t.resolve(), Y();
  });
}
const Te = {
  /**
   * הקרא טקסט עברי
   * משתמש ב-Google Translate TTS לאיכות טובה יותר
   */
  speak(t) {
    const e = we(t);
    return new Promise((n) => {
      $.push({ text: e, resolve: n }), Y();
    });
  },
  /** עצור את הדיבור הנוכחי */
  cancel() {
    $.forEach((t) => t.resolve()), $ = [], H = !1, typeof speechSynthesis < "u" && speechSynthesis.cancel();
  },
  get available() {
    return !0;
  },
  /** הגדר מהירות דיבור (0.5–2.0) */
  setRate(t) {
    j = Math.max(0.5, Math.min(2, t));
  },
  /** השתמש ב-Google Translate TTS (ברירת מחדל) או בדפדפן */
  useGoogle(t = !0) {
    de = t;
  },
  /**
   * הגדר מהירות דיבור להדגשת ניקוד
   * @param {{ rate?: number }} opts
   *   rate: מהירות דיבור להדגשה (ברירת מחדל 0.5)
   */
  setNikudEmphasis({ rate: t } = {}) {
    t != null && (ae = Math.max(0.3, Math.min(1.5, t)));
  },
  /**
   * הקרא אות עם ניקוד באיטיות להדגשת התנועה
   * @param {string} letter - האות (למשל 'ב')
   * @param {string} nikudSymbol - סמל הניקוד (למשל '\u05B7')
   */
  speakNikud(t, e) {
    const n = t + e, a = j;
    return j = ae, new Promise((o) => {
      $.push({ text: n, resolve: o }), Y();
    }).finally(() => {
      j = a;
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
}, Ae = {
  shake: 420,
  bounce: 480,
  pulse: 600,
  fadeIn: 320,
  confetti: 700
};
function U(t, e) {
  !t || !re[e] || t.animate(re[e], {
    duration: Ae[e] || 400,
    easing: "ease-in-out",
    fill: "none"
  });
}
function $e(t, e, n, a) {
  W.cheer();
  const o = e / n, i = o >= 0.8 ? 3 : o >= 0.5 ? 2 : 1, s = "⭐".repeat(i) + "☆".repeat(3 - i), r = document.createElement("div");
  r.className = "completion-screen", r.innerHTML = `
    <div class="completion-screen__content">
      <div class="completion-screen__stars" aria-label="${i} כּוֹכָבִים">${s}</div>
      <h2 class="completion-screen__title">!כָּל הַכָּבוֹד</h2>
      <p class="completion-screen__score">נִיקּוּד: ${e} מִתּוֹךְ ${n}</p>
      <button class="completion-screen__replay btn btn--primary">שַׂחֵק שׁוּב</button>
    </div>
  `, r.querySelector(".completion-screen__replay").addEventListener("click", () => {
    r.remove(), a();
  }), t.innerHTML = "", t.appendChild(r), U(r.querySelector(".completion-screen__content"), "fadeIn");
}
function it(t, e, {
  totalRounds: n,
  progressBar: a = null,
  buildRoundUI: o,
  onCorrect: i,
  onWrong: s
} = {}) {
  let r = !1;
  async function c(_) {
    if (r) return;
    r = !0, W.correct(), _ && await _(), i && await i(), t.state.addScore(1), a == null || a.update(t.state.currentRound), await new Promise((f) => setTimeout(f, 1200)), t.state.nextRound() ? (r = !1, o()) : $e(e, t.state.score, n, () => {
      location.reload();
    });
  }
  async function l() {
    r || (r = !0, s && await s(), r = !1);
  }
  function u() {
    return r;
  }
  function h() {
    r = !1;
  }
  return { handleCorrect: c, handleWrong: l, isAnswered: u, reset: h };
}
const je = {
  kamatz: "ah",
  patah: "ah",
  tzere: "eh",
  segol: "eh",
  hiriq: "ee",
  holam: "oh",
  kubbutz: "oo"
}, Fe = {
  ah: [/[אה]/, /^א$/, /אא/, /הא/],
  eh: [/[אה]/, /^א$/, /אא/, /הא/, /אה/],
  ee: [/[אי]/, /^י$/, /אי/, /הי/],
  oh: [/[או]/, /^[או]$/, /או/, /הו/],
  oo: [/[או]/, /^[או]$/, /או/, /הו/, /אוּ/]
};
function rt() {
  const t = typeof window < "u" ? window.SpeechRecognition || window.webkitSpeechRecognition : null, e = !!t;
  let n = null;
  return {
    available: e,
    listen(a = 4e3) {
      return e ? new Promise((o) => {
        n = new t(), n.lang = "he-IL", n.continuous = !1, n.interimResults = !1, n.maxAlternatives = 3;
        let i = !1;
        const s = (c, l) => {
          i || (i = !0, n = null, o({ text: c.trim(), confidence: l }));
        };
        n.onresult = (c) => {
          const l = c.results[0];
          l ? s(l[0].transcript, l[0].confidence) : s("", 0);
        }, n.onerror = () => s("", 0), n.onnomatch = () => s("", 0);
        const r = setTimeout(() => {
          try {
            n == null || n.stop();
          } catch {
          }
          s("", 0);
        }, a);
        n.onend = () => {
          clearTimeout(r), s("", 0);
        };
        try {
          n.start();
        } catch {
          s("", 0);
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
function st(t, e) {
  if (!t || !e) return !1;
  const n = je[e];
  if (!n) return !1;
  const a = Fe[n];
  if (!a) return !1;
  const o = t.replace(/[\s.,!?]/g, "");
  return o.length ? a.some((i) => i.test(o)) : !1;
}
const O = [
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
function lt(t) {
  return O.find((e) => e.letter === t) || null;
}
function Me(t = "regular") {
  return t === "regular" ? O.filter((e) => !e.isFinal) : t === "final" ? O.filter((e) => e.isFinal) : O;
}
function ct(t, e = "regular") {
  const n = Me(e);
  return [...n].sort(() => Math.random() - 0.5).slice(0, Math.min(t, n.length));
}
const q = [
  { id: "kamatz", name: "קָמָץ", nameNikud: "קָמָץ", symbol: "ָ", sound: "אָ", color: "#FF6B6B", textColor: "#fff" },
  { id: "patah", name: "פֶּתַח", nameNikud: "פָּתַח", symbol: "ַ", sound: "אָ", color: "#FF8C42", textColor: "#fff" },
  { id: "hiriq", name: "חִירִיק", nameNikud: "חִירִיק", symbol: "ִ", sound: "אִי", color: "#4ECDC4", textColor: "#fff" },
  { id: "tzere", name: "צָרָה", nameNikud: "צֵרֶה", symbol: "ֵ", sound: "אֶ", color: "#45B7D1", textColor: "#fff" },
  { id: "segol", name: "סָגֹול", nameNikud: "סְגוֹל", symbol: "ֶ", sound: "אֶ", color: "#9B59B6", textColor: "#fff" },
  { id: "holam", name: "חוֹלֵם", nameNikud: "חוֹלָם", symbol: "ֹ", sound: "אֹ", color: "#2ECC71", textColor: "#fff" },
  { id: "kubbutz", name: "קֻובּוּץ", nameNikud: "קֻבּוּץ", symbol: "ֻ", sound: "אֻ", color: "#F39C12", textColor: "#fff" }
], dt = ["א", "ב", "ג", "ד", "מ", "נ", "ל", "ר", "ש", "ת", "פ", "ק"];
function ut(t, e) {
  return t + e;
}
function mt(t) {
  let e = [...q];
  if (typeof window < "u" && window.location && window.location.search) {
    const a = new URLSearchParams(window.location.search), o = a.get("allowedNikud");
    if (o) {
      const s = o.split(",").map((r) => r.trim());
      e = e.filter(
        (r) => s.includes(r.id) || s.includes(r.name) || s.includes(r.nameNikud)
      );
    }
    const i = a.get("excludedNikud");
    if (i) {
      const s = i.split(",").map((r) => r.trim());
      e = e.filter(
        (r) => !s.includes(r.id) && !s.includes(r.name) && !s.includes(r.nameNikud)
      );
    }
  }
  e.length === 0 && (e = [...q]);
  let n = [...e];
  for (; n.length < t; )
    n.push(...e);
  return n.sort(() => Math.random() - 0.5).slice(0, t);
}
function ht(t, e, n) {
  t.innerHTML = "";
  const a = document.createElement("div");
  a.className = "option-cards-grid";
  const o = e.map((i) => {
    const s = document.createElement("button");
    return s.className = "option-card", s.dataset.id = i.id, s.innerHTML = `
      <span class="option-card__emoji">${i.emoji || ""}</span>
      <span class="option-card__text">${i.text}</span>
    `, s.addEventListener("click", () => {
      s.disabled || n(i);
    }), a.appendChild(s), { el: s, option: i };
  });
  return t.appendChild(a), {
    /** הַדָּגֵשׁ כַּרְטִיס לְפִי סוּג: 'correct' | 'wrong' | 'hint' */
    highlight(i, s) {
      o.forEach(({ el: r, option: c }) => {
        c.id === i && r.classList.add(`option-card--${s}`);
      });
    },
    /** נטרל את כל הכרטיסים */
    disable() {
      o.forEach(({ el: i }) => {
        i.disabled = !0;
      });
    },
    /** אפס את מצב הכרטיסים */
    reset() {
      o.forEach(({ el: i }) => {
        i.className = "option-card", i.disabled = !1;
      });
    },
    /** הסר את הרכיב */
    destroy() {
      t.innerHTML = "";
    }
  };
}
function pt(t, e) {
  const n = document.createElement("div");
  n.className = "progress-bar", n.setAttribute("role", "progressbar"), n.setAttribute("aria-valuemin", "0"), n.setAttribute("aria-valuemax", String(e)), n.innerHTML = `
    <div class="progress-bar__track">
      <div class="progress-bar__fill" style="width: 0%"></div>
    </div>
    <span class="progress-bar__label">0 / ${e}</span>
  `, t.appendChild(n);
  const a = n.querySelector(".progress-bar__fill"), o = n.querySelector(".progress-bar__label");
  return {
    /** עדכן את ההתקדמות */
    update(i) {
      const s = Math.round(i / e * 100);
      a.style.width = `${s}%`, o.textContent = `${i} / ${e}`, n.setAttribute("aria-valuenow", String(i));
    },
    /** הסר את הרכיב */
    destroy() {
      n.remove();
    }
  };
}
function ft(t) {
  const e = document.createElement("div");
  e.className = "feedback-message", e.setAttribute("aria-live", "polite"), e.setAttribute("role", "status"), t.appendChild(e);
  let n = null;
  function a(o, i, s = 1800) {
    clearTimeout(n), e.textContent = o, e.className = `feedback-message feedback-message--${i}`, n = setTimeout(() => {
      e.textContent = "", e.className = "feedback-message";
    }, s);
  }
  return {
    /** הצג משוב חיובי */
    correct(o = "!כָּל הַכָּבוֹד") {
      W.correct(), a(o, "correct"), U(e, "bounce");
    },
    /** הצג עידוד — נסה שוב */
    wrong(o = "נַסֵּה שׁוּב") {
      W.wrong(), a(o, "wrong"), U(e, "pulse");
    },
    /** הצג רמז */
    hint(o) {
      a(o, "hint"), U(e, "pulse");
    },
    /** הסר את הרכיב */
    destroy() {
      clearTimeout(n), e.remove();
    }
  };
}
function bt(t, e) {
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
  const a = new URLSearchParams(window.location.search), o = a.get("allowedNikud") ? a.get("allowedNikud").split(",") : [];
  let i = `
    <div style="background:white; padding:1.5rem; border-radius:1rem; min-width:300px; text-align:center; color:#333; font-family:Heebo,Arial; direction:rtl;">
      <h2 style="margin-top:0">בחר ניקוד</h2>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; margin:1rem 0; text-align:right;">
  `;
  q.forEach((l) => {
    const u = o.length === 0 || o.includes(l.id) || o.includes(l.name);
    i += `
      <label style="display:flex; align-items:center; gap:0.5rem; cursor:pointer;">
        <input type="checkbox" value="${l.id}" class="nikud-filter-cb" ${u ? "checked" : ""} style="width:1.2rem;height:1.2rem;">
        <span>${l.nameNikud}</span>
      </label>
    `;
  });
  const s = parseFloat(localStorage.getItem("alefbet.nikudRate")) || 0.5;
  i += `
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
  `, n.innerHTML = i, n.style.display = "flex";
  const r = document.getElementById("nikud-rate-slider"), c = document.getElementById("nikud-rate-val");
  r.oninput = () => {
    c.textContent = r.value;
  }, document.getElementById("save-settings-btn").onclick = () => {
    const l = parseFloat(r.value);
    localStorage.setItem("alefbet.nikudRate", l), Te.setNikudEmphasis({ rate: l });
    const u = Array.from(n.querySelectorAll(".nikud-filter-cb")).filter((_) => _.checked).map((_) => _.value), h = new URL(window.location);
    u.length > 0 && u.length < q.length ? h.searchParams.set("allowedNikud", u.join(",")) : h.searchParams.delete("allowedNikud"), h.searchParams.delete("excludedNikud"), n.style.display = "none", window.history.replaceState({}, "", h), e && e(t);
  }, document.getElementById("close-settings-btn").onclick = () => {
    n.style.display = "none";
  };
}
function gt(t) {
  const e = document.createElement("div");
  e.className = "ab-zone", e.style.setProperty("--zone-color", t.color || "#4f67ff"), e.innerHTML = `
    <div class="ab-zone__symbol">${t.symbol || ""}</div>
    <div class="ab-zone__label">${t.label || ""}</div>
  `;
  const n = () => {
    t.onTap && t.onTap();
  };
  return e.addEventListener("click", n), {
    el: e,
    highlight(a) {
      e.classList.remove("ab-zone--correct", "ab-zone--hover"), a && e.classList.add(`ab-zone--${a}`);
    },
    reset() {
      e.classList.remove("ab-zone--correct", "ab-zone--hover");
    },
    destroy() {
      e.removeEventListener("click", n);
    }
  };
}
function _t(t, e = "טוֹעֵן...") {
  t.innerHTML = `<div class="ab-loading">${e}</div>`;
}
function vt(t) {
  t.innerHTML = "";
}
function yt(t, e, n, a) {
  const o = t.querySelector(".game-header__spacer");
  if (!o) return null;
  const i = document.createElement("button");
  return i.className = "ab-header-btn", i.setAttribute("aria-label", n), i.textContent = e, i.onclick = a, o.innerHTML = "", o.appendChild(i), i;
}
function wt(t, { size: e = "md" } = {}) {
  const n = document.createElement("div");
  n.className = `ab-nikud-box ab-nikud-box--${e} ab-nikud-box--${t.id}`;
  const a = document.createElement("div");
  a.className = "ab-nikud-box__box";
  const o = document.createElement("div");
  return o.className = "ab-nikud-box__mark", o.textContent = t.symbol, n.appendChild(a), n.appendChild(o), n;
}
let A = null, w = null, K = 0, Q = 0;
const z = /* @__PURE__ */ new Map();
function se(t, e) {
  var n;
  return ((n = document.elementFromPoint(t, e)) == null ? void 0 : n.closest('[data-drop-target="true"]')) || null;
}
function Pe(t, e, n) {
  const a = t.getBoundingClientRect();
  K = a.width / 2, Q = a.height / 2, w = t.cloneNode(!0), Object.assign(w.style, {
    position: "fixed",
    left: `${e - K}px`,
    top: `${n - Q}px`,
    width: `${a.width}px`,
    height: `${a.height}px`,
    pointerEvents: "none",
    // keeps it out of elementFromPoint + hit-testing
    zIndex: "9999",
    opacity: "0.85",
    transform: "scale(1.12)",
    cursor: "grabbing",
    margin: "0"
  }), document.body.appendChild(w);
}
function Ie(t, e) {
  w && (w.style.left = `${t - K}px`, w.style.top = `${e - Q}px`);
}
function Be() {
  w == null || w.remove(), w = null;
}
let k = null;
function De(t) {
  k !== t && (k == null || k.classList.remove("drop-target--hover"), k = t, t == null || t.classList.add("drop-target--hover"));
}
function He() {
  k == null || k.classList.remove("drop-target--hover"), k = null;
}
function kt(t, e) {
  t.classList.add("drag-source");
  let n = null, a = null, o = null;
  function i() {
    n && (t.removeEventListener("pointermove", n), t.removeEventListener("pointerup", a), t.removeEventListener("pointercancel", o), n = a = o = null), He(), Be(), t.classList.remove("drag-source--dragging"), A = null;
  }
  function s(r) {
    r.button !== void 0 && r.button !== 0 || (r.preventDefault(), A && i(), A = { el: t, data: e }, t.classList.add("drag-source--dragging"), Pe(t, r.clientX, r.clientY), t.setPointerCapture(r.pointerId), n = (c) => {
      Ie(c.clientX, c.clientY), De(se(c.clientX, c.clientY));
    }, a = (c) => {
      const l = se(c.clientX, c.clientY);
      i(), l && z.has(l) && z.get(l).onDrop({ data: e, sourceEl: t, targetEl: l });
    }, o = () => i(), t.addEventListener("pointermove", n), t.addEventListener("pointerup", a), t.addEventListener("pointercancel", o));
  }
  return t.addEventListener("pointerdown", s), {
    destroy() {
      t.removeEventListener("pointerdown", s), (A == null ? void 0 : A.el) === t && i(), t.classList.remove("drag-source");
    }
  };
}
function xt(t, e) {
  return t.setAttribute("data-drop-target", "true"), t.classList.add("drop-target--active"), z.set(t, { onDrop: e }), {
    destroy() {
      t.removeAttribute("data-drop-target"), t.classList.remove("drop-target--active", "drop-target--hover"), z.delete(t);
    }
  };
}
function Ue(t, e) {
  const n = [];
  function a() {
    try {
      const r = localStorage.getItem(t);
      return r === null ? e : JSON.parse(r);
    } catch {
      return e;
    }
  }
  function o(r) {
    try {
      localStorage.setItem(t, JSON.stringify(r));
    } catch (c) {
      console.warn(`[createLocalState] שגיאה בשמירת "${t}":`, c);
    }
    n.forEach((c) => c(r));
  }
  function i(r) {
    o(r(a()));
  }
  function s(r) {
    return n.push(r), function() {
      const l = n.indexOf(r);
      l !== -1 && n.splice(l, 1);
    };
  }
  return { get: a, set: o, update: i, subscribe: s };
}
function Et(t, e = {}) {
  const {
    title: n = "",
    subtitle: a = "",
    tabs: o = [],
    homeUrl: i = null,
    onTabChange: s = null
  } = e;
  t.classList.add("ab-app");
  const r = i ? `<a href="${i}" class="ab-app-back-link" aria-label="דף הבית">🏠</a>` : "", c = a ? `<span class="ab-app-subtitle">${a}</span>` : '<span class="ab-app-subtitle"></span>', l = o.map(
    (d) => `<button class="ab-app-tab" data-tab="${d.id}" aria-selected="false" role="tab"><span class="ab-app-tab-icon">${d.icon}</span><span class="ab-app-tab-label">${d.label}</span></button>`
  ).join(""), u = o.map(
    (d) => `<button class="ab-app-nav-item" data-tab="${d.id}" aria-selected="false" role="tab"><span class="ab-app-nav-icon">${d.icon}</span><span class="ab-app-nav-label">${d.label}</span></button>`
  ).join("");
  t.innerHTML = `
    <header class="ab-app-header">
      <div class="ab-app-header-text">
        <h1 class="ab-app-title">${n}</h1>
        ${c}
      </div>
      ${r}
    </header>
    <nav class="ab-app-tabs" role="tablist" aria-label="ניווט ראשי">
      ${l}
    </nav>
    <main class="ab-app-content"></main>
    <nav class="ab-app-bottom-nav" role="tablist" aria-label="ניווט תחתון">
      ${u}
    </nav>
  `;
  const h = t.querySelector(".ab-app-subtitle"), _ = t.querySelector(".ab-app-content");
  function b(d) {
    f(d), typeof s == "function" && s(d);
  }
  t.querySelectorAll(".ab-app-tab, .ab-app-nav-item").forEach((d) => {
    d.addEventListener("click", () => b(d.dataset.tab));
  });
  function f(d) {
    t.querySelectorAll(".ab-app-tab, .ab-app-nav-item").forEach((v) => {
      const p = v.dataset.tab === d;
      v.classList.toggle("ab-active", p), v.setAttribute("aria-selected", p ? "true" : "false");
    });
  }
  return o.length > 0 && f(o[0].id), {
    /** אלמנט תוכן הראשי — כאן מרנדרים את תוכן הטאב הנוכחי */
    contentEl: _,
    /**
     * עדכן את כותרת המשנה
     * @param {string} text - הטקסט החדש לכותרת המשנה
     */
    setSubtitle(d) {
      h.textContent = d;
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
function Oe() {
  return ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/ogg"].find((e) => MediaRecorder.isTypeSupported(e)) || "";
}
function We() {
  var t;
  return typeof navigator < "u" && typeof ((t = navigator.mediaDevices) == null ? void 0 : t.getUserMedia) == "function" && typeof MediaRecorder < "u";
}
function qe() {
  let t = null, e = null, n = [];
  async function a() {
    if (t && t.state === "recording") return;
    e = await navigator.mediaDevices.getUserMedia({ audio: !0, video: !1 }), n = [];
    const c = {}, l = Oe();
    l && (c.mimeType = l), t = new MediaRecorder(e, c), t.ondataavailable = (u) => {
      var h;
      ((h = u.data) == null ? void 0 : h.size) > 0 && n.push(u.data);
    }, t.start(100);
  }
  function o() {
    return new Promise((c, l) => {
      if (!t || t.state === "inactive") {
        l(new Error("[voice-recorder] not recording"));
        return;
      }
      t.onstop = () => {
        const u = new Blob(n, { type: t.mimeType || "audio/webm" });
        s(), c(u);
      }, t.onerror = (u) => {
        s(), l(u.error);
      }, t.stop();
    });
  }
  function i() {
    t && t.state !== "inactive" && (t.ondataavailable = null, t.onstop = null, t.stop()), s();
  }
  function s() {
    e == null || e.getTracks().forEach((c) => c.stop()), e = null, t = null, n = [];
  }
  function r() {
    return (t == null ? void 0 : t.state) === "recording";
  }
  return { start: a, stop: o, cancel: i, isActive: r };
}
const ze = "alefbet-voices", x = "recordings", Ve = 1;
let I = null;
function G() {
  return I || (I = new Promise((t, e) => {
    const n = indexedDB.open(ze, Ve);
    n.onupgradeneeded = (a) => {
      a.target.result.createObjectStore(x);
    }, n.onsuccess = (a) => t(a.target.result), n.onerror = (a) => {
      I = null, e(a.target.error);
    };
  }), I);
}
function Z(t, e) {
  return `${t}/${e}`;
}
async function Ge(t, e, n) {
  const a = await G();
  return new Promise((o, i) => {
    const s = a.transaction(x, "readwrite");
    s.objectStore(x).put(n, Z(t, e)), s.oncomplete = o, s.onerror = (r) => i(r.target.error);
  });
}
async function ee(t, e) {
  const n = await G();
  return new Promise((a, o) => {
    const s = n.transaction(x, "readonly").objectStore(x).get(Z(t, e));
    s.onsuccess = () => a(s.result ?? null), s.onerror = (r) => o(r.target.error);
  });
}
async function Xe(t, e) {
  const n = await G();
  return new Promise((a, o) => {
    const i = n.transaction(x, "readwrite");
    i.objectStore(x).delete(Z(t, e)), i.oncomplete = a, i.onerror = (s) => o(s.target.error);
  });
}
async function Nt(t) {
  const e = await G();
  return new Promise((n, a) => {
    const i = e.transaction(x, "readonly").objectStore(x).getAllKeys();
    i.onsuccess = () => {
      const s = `${t}/`;
      n(
        (i.result || []).filter((r) => r.startsWith(s)).map((r) => r.slice(s.length))
      );
    }, i.onerror = (s) => a(s.target.error);
  });
}
async function Je(t, e) {
  let n;
  try {
    n = await ee(t, e);
  } catch {
    return !1;
  }
  return n ? new Promise((a) => {
    const o = URL.createObjectURL(n), i = new Audio(o), s = (r) => {
      URL.revokeObjectURL(o), a(r);
    };
    i.onended = () => s(!0), i.onerror = () => s(!1), i.play().catch(() => s(!1));
  }) : !1;
}
async function Lt(t, e) {
  return await ee(t, e).catch(() => null) !== null;
}
function Ye(t, {
  gameId: e,
  voiceKey: n,
  label: a = "הקלטת קול",
  onSaved: o,
  onDeleted: i
} = {}) {
  if (!We()) {
    const m = document.createElement("span");
    return m.className = "ab-voice-unsupported", m.textContent = "🎤 הקלטה לא נתמכת בדפדפן זה", t.appendChild(m), { refresh: async () => {
    }, destroy: () => m.remove() };
  }
  const s = qe(), r = document.createElement("div");
  r.className = "ab-voice-btn-wrap", r.setAttribute("aria-label", a), t.appendChild(r);
  let c = "idle", l = null, u = null, h = null, _ = null, b = null, f = null, d = 0;
  function v() {
    if (r.innerHTML = "", c === "idle")
      l = p("🎤", "ab-voice-btn ab-voice-btn--record", "התחל הקלטה", C), r.appendChild(l);
    else if (c === "recording") {
      b = document.createElement("span"), b.className = "ab-voice-indicator", r.appendChild(b);
      const m = document.createElement("span");
      m.className = "ab-voice-timer", m.textContent = "0:00", r.appendChild(m), d = 0, f = setInterval(() => {
        d++;
        const E = Math.floor(d / 60), D = String(d % 60).padStart(2, "0");
        m.textContent = `${E}:${D}`, d >= 120 && R();
      }, 1e3), u = p("⏹", "ab-voice-btn ab-voice-btn--stop", "עצור הקלטה", R), r.appendChild(u);
    } else c === "has-voice" && (h = p("▶", "ab-voice-btn ab-voice-btn--play", "נגן הקלטה", y), r.appendChild(h), l = p("🎤", "ab-voice-btn ab-voice-btn--re-record", "הקלט מחדש", C), r.appendChild(l), _ = p("🗑", "ab-voice-btn ab-voice-btn--delete", "מחק הקלטה", N), r.appendChild(_));
  }
  function p(m, E, D, he) {
    const L = document.createElement("button");
    return L.className = E, L.type = "button", L.title = D, L.setAttribute("aria-label", D), L.textContent = m, L.addEventListener("click", he), L;
  }
  async function C() {
    try {
      await s.start(), c = "recording", v();
    } catch (m) {
      console.warn("[voice-record-button] microphone access denied:", m), F("לא ניתן לגשת למיקרופון");
    }
  }
  async function R() {
    clearInterval(f);
    try {
      const m = await s.stop();
      await Ge(e, n, m), c = "has-voice", v(), o == null || o(m);
    } catch (m) {
      console.warn("[voice-record-button] stop error:", m), c = "idle", v();
    }
  }
  async function y() {
    h == null || h.setAttribute("disabled", "true"), await Je(e, n), h == null || h.removeAttribute("disabled");
  }
  async function N() {
    confirm("למחוק את ההקלטה?") && (await Xe(e, n), c = "idle", v(), i == null || i());
  }
  function F(m) {
    const E = document.createElement("span");
    E.className = "ab-voice-error", E.textContent = m, r.appendChild(E), setTimeout(() => E.remove(), 3e3);
  }
  async function g() {
    if (s.isActive()) return;
    c = await ee(e, n).catch(() => null) ? "has-voice" : "idle", v();
  }
  function S() {
    clearInterval(f), s.isActive() && s.cancel(), r.remove();
  }
  return g(), { refresh: g, destroy: S };
}
function Ke(t, { onClick: e } = {}) {
  const n = document.createElement("div");
  n.className = "ab-editor-overlay", e && n.addEventListener("pointerdown", e);
  function a() {
    n.parentElement || (t.style.position = "relative", t.appendChild(n));
  }
  function o() {
    n.remove();
  }
  function i() {
    o();
  }
  return { show: a, hide: o, destroy: i };
}
function Qe(t, e, { onSelectRound: n, onAddRound: a }) {
  const o = document.createElement("div");
  o.className = "ab-editor-nav", o.setAttribute("aria-label", "ניווט סיבובים");
  const i = document.createElement("div");
  i.className = "ab-editor-nav__header", i.textContent = "סיבובים", o.appendChild(i);
  const s = document.createElement("div");
  s.className = "ab-editor-nav__list", o.appendChild(s);
  const r = document.createElement("button");
  r.className = "ab-editor-nav__add", r.textContent = "+ הוסף", r.addEventListener("click", () => a(null)), o.appendChild(r), t.appendChild(o);
  let c = null;
  function l(b, f) {
    const d = document.createElement("div");
    d.className = "ab-editor-nav__thumb", b.id === c && d.classList.add("ab-editor-nav__thumb--active"), d.setAttribute("role", "button"), d.setAttribute("tabindex", "0"), d.setAttribute("aria-label", `סיבוב ${f + 1}`), d.dataset.roundId = b.id;
    const v = document.createElement("div");
    if (v.className = "ab-editor-nav__num", v.textContent = f + 1, d.appendChild(v), b.correctEmoji) {
      const p = document.createElement("div");
      p.className = "ab-editor-nav__emoji", p.textContent = b.correctEmoji, d.appendChild(p);
    }
    if (b.target) {
      const p = document.createElement("div");
      p.className = "ab-editor-nav__letter", p.textContent = b.target, d.appendChild(p);
    }
    return d.addEventListener("click", () => n(b.id)), d.addEventListener("keydown", (p) => {
      (p.key === "Enter" || p.key === " ") && (p.preventDefault(), n(b.id));
    }), d;
  }
  function u() {
    s.innerHTML = "", e.rounds.forEach((b, f) => {
      s.appendChild(l(b, f));
    });
  }
  function h(b) {
    c = b, s.querySelectorAll(".ab-editor-nav__thumb").forEach((f) => {
      f.classList.toggle("ab-editor-nav__thumb--active", f.dataset.roundId === b);
    });
  }
  function _() {
    o.remove();
  }
  return u(), { refresh: u, setActiveRound: h, destroy: _ };
}
const le = {
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
function Ze(t, { gameId: e, onFieldChange: n, onDeleteRound: a, getEditableFields: o }) {
  const i = document.createElement("div");
  i.className = "ab-editor-inspector";
  const s = document.createElement("div");
  s.className = "ab-editor-inspector__header", s.innerHTML = '<span class="ab-editor-inspector__title">✏️ ערוך סיבוב</span>', i.appendChild(s);
  const r = document.createElement("div");
  r.className = "ab-editor-inspector__body", i.appendChild(r);
  const c = document.createElement("button");
  c.className = "ab-editor-inspector__delete", c.textContent = "🗑 מחק סיבוב", i.appendChild(c), t.appendChild(i);
  let l = null, u = null;
  function h() {
    u == null || u.destroy(), u = null, r.innerHTML = '<p class="ab-editor-inspector__empty">בחר סיבוב לעריכה</p>', c.hidden = !0, l = null;
  }
  function _(f, d = "multiple-choice") {
    u == null || u.destroy(), u = null, l = f.id, r.innerHTML = "", c.hidden = !1, ((o ? o(d) : null) || le[d] || le["multiple-choice"]).forEach((y) => {
      const N = document.createElement("div");
      N.className = "ab-editor-field";
      const F = document.createElement("label");
      if (F.className = "ab-editor-field__label", F.textContent = y.label, N.appendChild(F), y.type === "emoji") {
        const g = document.createElement("div");
        g.className = "ab-editor-field__emoji-row";
        const S = document.createElement("div");
        S.className = "ab-editor-field__emoji-preview", S.textContent = f[y.key] || "❓", g.appendChild(S);
        const m = document.createElement("input");
        m.className = "ab-editor-field__input", m.type = "text", m.value = f[y.key] || "", m.maxLength = 8, m.placeholder = "🐱", m.style.fontSize = "20px", m.addEventListener("input", () => {
          S.textContent = m.value || "❓", n(l, y.key, m.value);
        }), g.appendChild(m), N.appendChild(g);
      } else {
        const g = document.createElement("input");
        g.className = "ab-editor-field__input", g.type = "text", g.value = f[y.key] || "", g.dir = "rtl", y.maxLength && (g.maxLength = y.maxLength), g.addEventListener("input", () => {
          n(l, y.key, g.value);
        }), N.appendChild(g);
      }
      r.appendChild(N);
    });
    const p = document.createElement("div");
    p.className = "ab-editor-field ab-editor-field--voice";
    const C = document.createElement("div");
    C.className = "ab-editor-field__label", C.textContent = "🎤 הקלטת קול לסיבוב", p.appendChild(C);
    const R = document.createElement("p");
    R.style.cssText = "font-size:11px;color:var(--ab-editor-muted);margin:2px 0 6px", R.textContent = "יושמע בזמן המשחק במקום קריאת-טקסט", p.appendChild(R), u = Ye(p, {
      gameId: e,
      voiceKey: f.id,
      label: `הקלטת קול — סיבוב ${f.id}`
    }), r.appendChild(p), c.onclick = () => {
      confirm("למחוק את הסיבוב הזה?") && (a(l), h());
    };
  }
  function b() {
    u == null || u.destroy(), i.remove();
  }
  return h(), { loadRound: _, clear: h, destroy: b };
}
let et = 0;
function ce() {
  return `round-${Date.now()}-${et++}`;
}
class V {
  /**
   * @param {object} schema - { id, version, meta, rounds, distractors }
   */
  constructor(e) {
    this._id = e.id || "game", this._version = e.version || 1, this._meta = { title: "", type: "multiple-choice", ...e.meta }, this._rounds = (e.rounds || []).map((n) => ({ ...n, id: n.id || ce() })), this._distractors = e.distractors || [], this._handlers = [];
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
    return this._rounds.find((n) => n.id === e) || null;
  }
  getRoundIndex(e) {
    return this._rounds.findIndex((n) => n.id === e);
  }
  // ── Rounds (write) ───────────────────────────────────────────────────────
  updateRound(e, n) {
    const a = this.getRoundIndex(e);
    a !== -1 && (this._rounds[a] = { ...this._rounds[a], ...n }, this._emit());
  }
  addRound(e = null) {
    const n = { id: ce(), target: "", correct: "", correctEmoji: "❓" };
    if (e === null)
      this._rounds.push(n);
    else {
      const a = this.getRoundIndex(e);
      this._rounds.splice(a + 1, 0, n);
    }
    return this._emit(), n.id;
  }
  removeRound(e) {
    const n = this.getRoundIndex(e);
    n === -1 || this._rounds.length <= 1 || (this._rounds.splice(n, 1), this._emit());
  }
  moveRound(e, n) {
    const a = this.getRoundIndex(e);
    if (a === -1) return;
    const [o] = this._rounds.splice(a, 1);
    this._rounds.splice(Math.max(0, Math.min(n, this._rounds.length)), 0, o), this._emit();
  }
  // ── Change events ────────────────────────────────────────────────────────
  onChange(e) {
    return this._handlers.push(e), () => this.offChange(e);
  }
  offChange(e) {
    const n = this._handlers.indexOf(e);
    n !== -1 && this._handlers.splice(n, 1);
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
  static fromRoundsArray(e, n, a = {}, o = []) {
    return new V({ id: e, meta: a, rounds: n, distractors: o });
  }
}
const ue = "alefbet.editor.";
function me(t) {
  return Ue(`${ue}${t}`, null);
}
function tt(t) {
  me(t.id).set(t.toJSON());
}
function Ct(t) {
  const e = me(t).get();
  if (!e) return null;
  try {
    return V.fromJSON(e);
  } catch {
    return null;
  }
}
function Rt(t) {
  try {
    localStorage.removeItem(`${ue}${t}`);
  } catch {
  }
}
function nt(t) {
  const e = JSON.stringify(t.toJSON(), null, 2), n = new Blob([e], { type: "application/json;charset=utf-8" }), a = URL.createObjectURL(n), o = document.createElement("a");
  o.href = a, o.download = `${t.id}-rounds.json`, o.click(), URL.revokeObjectURL(a);
}
class St {
  /**
   * @param {HTMLElement} container  — same container passed to GameShell
   * @param {import('./game-data.js').GameData} gameData
   * @param {{
   *   restartGame:       (container: HTMLElement) => void,
   *   getEditableFields?: (type: string) => object[],
   * }} options
   */
  constructor(e, n, { restartGame: a, getEditableFields: o } = {}) {
    this._container = e, this._gameData = n, this._restartGame = a, this._getEditableFields = o || null, this._mode = "play", this._overlay = null, this._navigator = null, this._inspector = null, this._toolbar = null, this._selectedId = null, requestAnimationFrame(() => this._injectToolbar());
  }
  // ── Toolbar ──────────────────────────────────────────────────────────────
  _injectToolbar() {
    const e = this._container.querySelector(".game-header__spacer");
    e && (this._toolbar = document.createElement("div"), this._toolbar.className = "ab-editor-toolbar", this._editBtn = this._makeBtn("✏️ ערוך", "ab-editor-btn--edit", () => this.enterEditMode()), this._toolbar.appendChild(this._editBtn), e.innerHTML = "", e.appendChild(this._toolbar));
  }
  _makeBtn(e, n, a) {
    const o = document.createElement("button");
    return o.className = `ab-editor-btn ${n}`, o.innerHTML = e, o.addEventListener("click", a), o;
  }
  _setToolbarEditMode() {
    this._toolbar.innerHTML = "";
    const e = this._makeBtn("▶ שחק", "ab-editor-btn--play", () => this.enterPlayMode()), n = this._makeBtn("+ הוסף", "ab-editor-btn--add", () => this._addRound()), a = this._makeBtn("💾 שמור", "ab-editor-btn--save", () => this._save()), o = this._makeBtn("⬇ ייצוא", "ab-editor-btn--export", () => nt(this._gameData));
    this._toolbar.append(e, n, a, o);
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
    this._overlay = Ke(e), this._overlay.show(), this._navigator = Qe(
      this._container,
      this._gameData,
      {
        onSelectRound: (a) => this._selectRound(a),
        onAddRound: (a) => this._addRound(a)
      }
    ), this._inspector = Ze(
      this._container,
      {
        gameId: this._gameData.id,
        onFieldChange: (a, o, i) => this._onFieldChange(a, o, i),
        onDeleteRound: (a) => this._deleteRound(a),
        getEditableFields: this._getEditableFields
      }
    );
    const n = this._gameData.rounds;
    n.length > 0 && this._selectRound(n[0].id);
  }
  enterPlayMode() {
    var e, n, a, o;
    this._mode !== "play" && (this._mode = "play", this._container.classList.remove("ab-editor-active"), this._setToolbarPlayMode(), (e = this._overlay) == null || e.destroy(), (n = this._navigator) == null || n.destroy(), (a = this._inspector) == null || a.destroy(), this._overlay = this._navigator = this._inspector = null, this._selectedId = null, (o = this._restartGame) == null || o.call(this, this._container));
  }
  // ── Round management ──────────────────────────────────────────────────────
  _selectRound(e) {
    var a, o;
    this._selectedId = e, (a = this._navigator) == null || a.setActiveRound(e);
    const n = this._gameData.getRound(e);
    n && ((o = this._inspector) == null || o.loadRound(n, this._gameData.meta.type));
  }
  _addRound(e = null) {
    var a;
    const n = this._gameData.addRound(e ?? this._selectedId);
    (a = this._navigator) == null || a.refresh(), this._selectRound(n);
  }
  _deleteRound(e) {
    var a;
    this._gameData.removeRound(e), (a = this._navigator) == null || a.refresh();
    const n = this._gameData.rounds;
    n.length > 0 && this._selectRound(n[0].id);
  }
  _onFieldChange(e, n, a) {
    var o, i;
    this._gameData.updateRound(e, { [n]: a }), (o = this._navigator) == null || o.refresh(), (i = this._navigator) == null || i.setActiveRound(e);
  }
  // ── Save ──────────────────────────────────────────────────────────────────
  _save() {
    tt(this._gameData), this._showToast("✅ נשמר!");
  }
  _showToast(e) {
    const n = document.createElement("div");
    n.className = "ab-editor-toast", n.textContent = e, document.body.appendChild(n), setTimeout(() => n.remove(), 2200);
  }
}
export {
  pe as EventBus,
  V as GameData,
  St as GameEditor,
  at as GameShell,
  fe as GameState,
  ye as addNikud,
  U as animate,
  Rt as clearGameData,
  Et as createAppShell,
  kt as createDragSource,
  xt as createDropTarget,
  ft as createFeedback,
  Ue as createLocalState,
  wt as createNikudBox,
  ht as createOptionCards,
  pt as createProgressBar,
  it as createRoundManager,
  rt as createSpeechListener,
  Ye as createVoiceRecordButton,
  qe as createVoiceRecorder,
  gt as createZone,
  Xe as deleteVoice,
  nt as exportGameDataAsJSON,
  lt as getLetter,
  Me as getLettersByGroup,
  we as getNikud,
  Lt as hasVoice,
  O as hebrewLetters,
  vt as hideLoadingScreen,
  yt as injectHeaderButton,
  We as isVoiceRecordingSupported,
  ut as letterWithNikud,
  Nt as listVoiceKeys,
  Ct as loadGameData,
  ee as loadVoice,
  st as matchNikudSound,
  dt as nikudBaseLetters,
  q as nikudList,
  Je as playVoice,
  ot as preloadNikud,
  ct as randomLetters,
  mt as randomNikud,
  tt as saveGameData,
  Ge as saveVoice,
  $e as showCompletionScreen,
  _t as showLoadingScreen,
  bt as showNikudSettingsDialog,
  W as sounds,
  Te as tts
};
