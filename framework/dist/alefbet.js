class be {
  constructor() {
    this._handlers = {};
  }
  /** הירשם לאירוע */
  on(e, n) {
    return this._handlers[e] || (this._handlers[e] = []), this._handlers[e].push(n), this;
  }
  /** בטל הרשמה לאירוע */
  off(e, n) {
    return this._handlers[e] ? (this._handlers[e] = this._handlers[e].filter((o) => o !== n), this) : this;
  }
  /** שלח אירוע */
  emit(e, n) {
    return (this._handlers[e] || []).slice().forEach((o) => o(n)), this;
  }
}
class ge {
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
class dt {
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
    }, this.events = new be(), this.state = new ge(this.config.totalRounds), this._buildShell();
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
let T = null;
function _e() {
  if (!T)
    try {
      T = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      return null;
    }
  return T.state === "suspended" && T.resume(), T;
}
function L(t, e, n = "sine", o = 0.3) {
  const a = _e();
  if (a)
    try {
      const i = a.createOscillator(), r = a.createGain();
      i.connect(r), r.connect(a.destination), i.type = n, i.frequency.setValueAtTime(t, a.currentTime), r.gain.setValueAtTime(o, a.currentTime), r.gain.exponentialRampToValueAtTime(1e-3, a.currentTime + e), i.start(a.currentTime), i.stop(a.currentTime + e + 0.05);
    } catch {
    }
}
const H = {
  /** צליל תשובה נכונה */
  correct() {
    L(523.25, 0.15), setTimeout(() => L(659.25, 0.2), 120), setTimeout(() => L(783.99, 0.3), 240);
  },
  /** צליל עידוד עדין — נסה שוב */
  wrong() {
    L(350, 0.15, "triangle", 0.12);
  },
  /** צליל עידוד - סיום מוצלח */
  cheer() {
    [523.25, 587.33, 659.25, 698.46, 783.99, 1046.5].forEach((e, n) => setTimeout(() => L(e, 0.2), n * 90));
  },
  /** קליק עדין */
  click() {
    L(900, 0.04, "sine", 0.12);
  }
}, Q = "https://nakdan-u1-0.loadbalancer.dicta.org.il/api";
let Z = !1;
const B = /* @__PURE__ */ new Map();
function ve() {
  var a;
  if (typeof window > "u") return Q;
  const t = new URLSearchParams(window.location.search).get("nakdanProxy"), e = window.ALEFBET_NAKDAN_PROXY_URL;
  if (t && window.localStorage)
    try {
      window.localStorage.setItem("alefbet.nakdanProxyUrl", t);
    } catch {
    }
  const n = (a = window.localStorage) == null ? void 0 : a.getItem("alefbet.nakdanProxyUrl"), o = t || e || n;
  return o || (window.location.hostname.endsWith("github.io") ? null : Q);
}
function ye(t) {
  var n;
  let e = "";
  for (const o of t)
    if (o.sep)
      e += o.str ?? "";
    else {
      const a = (n = o.nakdan) == null ? void 0 : n.options;
      a != null && a.length ? e += (a[0].w ?? "").replace(/\|/g, "").replace(/\u05BD/g, "") : e += o.str ?? "";
    }
  return e;
}
async function ke(t) {
  const e = ve();
  if (!e)
    throw Z || (Z = !0, console.warn("[nakdan] Dicta API blocked by CORS on GitHub Pages. Configure a proxy URL via ?nakdanProxy=..., window.ALEFBET_NAKDAN_PROXY_URL, or localStorage key alefbet.nakdanProxyUrl.")), new Error("Nakdan unavailable without proxy on this host");
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
  const o = await n.json(), a = o == null ? void 0 : o.data;
  if (!Array.isArray(a)) throw new Error("Nakdan: invalid response");
  return ye(a);
}
async function we(t) {
  if (!(t != null && t.trim())) return t ?? "";
  if (B.has(t)) return B.get(t);
  try {
    const e = await ke(t);
    return B.set(t, e), e;
  } catch {
    return B.set(t, t), t;
  }
}
function Ee(t) {
  return B.get(t) ?? t ?? "";
}
async function ut(t) {
  const e = [...new Set(t.filter((n) => n == null ? void 0 : n.trim()))];
  await Promise.all(e.map((n) => we(n)));
}
let R = [], F = !1, se = !0, A = 0.9, ee = typeof localStorage < "u" && parseFloat(localStorage.getItem("alefbet.nikudRate")) || 0.5, W = !1, $ = null;
function te(t, e, n, o = e) {
  console.warn(`[tts] ${t} TTS failed`, { text: e, sentText: o, reason: n }), typeof window < "u" && typeof window.dispatchEvent == "function" && window.dispatchEvent(new CustomEvent("alefbet:tts-error", {
    detail: { provider: t, text: e, sentText: o, reason: n }
  }));
}
function xe(t) {
  return (t || "").replace(/[\u0591-\u05C7]/g, "");
}
function Ne(t) {
  const e = String(t || "").toLowerCase();
  return e.includes("didn't interact") || e.includes("notallowed");
}
function Ce() {
  var t;
  return typeof window > "u" || typeof document > "u" ? Promise.resolve() : W || (t = document.userActivation) != null && t.hasBeenActive ? (W = !0, Promise.resolve()) : $ || ($ = new Promise((e) => {
    const n = () => {
      W = !0, window.removeEventListener("pointerdown", n, !0), window.removeEventListener("keydown", n, !0), window.removeEventListener("touchstart", n, !0), e();
    };
    window.addEventListener("pointerdown", n, { once: !0, capture: !0 }), window.addEventListener("keydown", n, { once: !0, capture: !0 }), window.addEventListener("touchstart", n, { once: !0, capture: !0 });
  }).finally(() => {
    $ = null;
  }), $);
}
function Le(t, e, n) {
  const a = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(t)}&tl=he&client=tw-ob`, i = new Audio(a);
  i.playbackRate = A, i.onended = e, i.onerror = () => n("audio.onerror"), i.play().catch((r) => {
    n((r == null ? void 0 : r.message) || "audio.play() rejected");
  });
}
function Se(t) {
  return new Promise((e, n) => {
    const o = xe(t).trim() || t;
    let a = !1, i = !1;
    const r = () => {
      a || (a = !0, e());
    }, s = (c) => {
      a || (a = !0, n(c));
    }, l = () => {
      try {
        Le(o, r, (c) => {
          if (!i && Ne(c)) {
            i = !0, Ce().then(() => {
              a || l();
            });
            return;
          }
          te("google", t, c, o), s(c);
        });
      } catch (c) {
        te("google", t, (c == null ? void 0 : c.message) || "Audio() construction failed", o), s(c == null ? void 0 : c.message);
      }
    };
    l();
  });
}
let z = null;
function Re() {
  const t = speechSynthesis.getVoices();
  return t.find((e) => e.lang === "he-IL") || t.find((e) => e.lang === "iw-IL") || t.find((e) => e.lang.startsWith("he")) || null;
}
function ne() {
  z = Re();
}
typeof speechSynthesis < "u" && (speechSynthesis.getVoices().length > 0 ? ne() : speechSynthesis.addEventListener("voiceschanged", ne, { once: !0 }));
function Ae(t) {
  return new Promise((e) => {
    if (typeof speechSynthesis > "u") {
      e();
      return;
    }
    const n = new SpeechSynthesisUtterance(t);
    n.lang = "he-IL", n.rate = A, z && (n.voice = z), n.onend = e, n.onerror = e, speechSynthesis.speak(n);
  });
}
async function Te(t) {
  if (se)
    try {
      await Se(t);
      return;
    } catch {
      console.info("[tts] Falling back to browser Speech API");
    }
  await Ae(t);
}
function V() {
  if (F || R.length === 0) return;
  const t = R.shift();
  F = !0, Te(t.text).then(() => {
    F = !1, t.resolve(), V();
  });
}
const $e = {
  /**
   * הקרא טקסט עברי
   * משתמש ב-Google Translate TTS לאיכות טובה יותר
   */
  speak(t) {
    const e = Ee(t);
    return new Promise((n) => {
      R.push({ text: e, resolve: n }), V();
    });
  },
  /** עצור את הדיבור הנוכחי */
  cancel() {
    R.forEach((t) => t.resolve()), R = [], F = !1, typeof speechSynthesis < "u" && speechSynthesis.cancel();
  },
  get available() {
    return !0;
  },
  /** הגדר מהירות דיבור (0.5–2.0) */
  setRate(t) {
    A = Math.max(0.5, Math.min(2, t));
  },
  /** השתמש ב-Google Translate TTS (ברירת מחדל) או בדפדפן */
  useGoogle(t = !0) {
    se = t;
  },
  /**
   * הגדר מהירות דיבור להדגשת ניקוד
   * @param {{ rate?: number }} opts
   *   rate: מהירות דיבור להדגשה (ברירת מחדל 0.5)
   */
  setNikudEmphasis({ rate: t } = {}) {
    t != null && (ee = Math.max(0.3, Math.min(1.5, t)));
  },
  /**
   * הקרא אות עם ניקוד באיטיות להדגשת התנועה
   * @param {string} letter - האות (למשל 'ב')
   * @param {string} nikudSymbol - סמל הניקוד (למשל '\u05B7')
   */
  speakNikud(t, e) {
    const n = t + e, o = A;
    return A = ee, new Promise((a) => {
      R.push({ text: n, resolve: a }), V();
    }).finally(() => {
      A = o;
    });
  }
}, ae = {
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
}, Me = {
  shake: 420,
  bounce: 480,
  pulse: 600,
  fadeIn: 320,
  confetti: 700
};
function P(t, e) {
  !t || !ae[e] || t.animate(ae[e], {
    duration: Me[e] || 400,
    easing: "ease-in-out",
    fill: "none"
  });
}
function Be(t, e, n, o) {
  H.cheer();
  const a = e / n, i = a >= 0.8 ? 3 : a >= 0.5 ? 2 : 1, r = "⭐".repeat(i) + "☆".repeat(3 - i), s = document.createElement("div");
  s.className = "completion-screen", s.innerHTML = `
    <div class="completion-screen__content">
      <div class="completion-screen__stars" aria-label="${i} כּוֹכָבִים">${r}</div>
      <h2 class="completion-screen__title">!כָּל הַכָּבוֹד</h2>
      <p class="completion-screen__score">נִיקּוּד: ${e} מִתּוֹךְ ${n}</p>
      <button class="completion-screen__replay btn btn--primary">שַׂחֵק שׁוּב</button>
    </div>
  `, s.querySelector(".completion-screen__replay").addEventListener("click", () => {
    s.remove(), o();
  }), t.innerHTML = "", t.appendChild(s), P(s.querySelector(".completion-screen__content"), "fadeIn");
}
function mt(t, e, {
  totalRounds: n,
  progressBar: o = null,
  buildRoundUI: a,
  onCorrect: i,
  onWrong: r
} = {}) {
  let s = !1;
  async function l(h) {
    if (s) return;
    s = !0, H.correct(), h && await h(), i && await i(), t.state.addScore(1), o == null || o.update(t.state.currentRound), await new Promise((g) => setTimeout(g, 1200)), t.state.nextRound() ? (s = !1, a()) : Be(e, t.state.score, n, () => {
      location.reload();
    });
  }
  async function c() {
    s || (s = !0, r && await r(), s = !1);
  }
  function m() {
    return s;
  }
  function d() {
    s = !1;
  }
  return { handleCorrect: l, handleWrong: c, isAnswered: m, reset: d };
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
function pt() {
  const t = typeof window < "u" ? window.SpeechRecognition || window.webkitSpeechRecognition : null, e = !!t;
  let n = null;
  return {
    available: e,
    listen(o = 4e3) {
      return e ? new Promise((a) => {
        n = new t(), n.lang = "he-IL", n.continuous = !1, n.interimResults = !1, n.maxAlternatives = 3;
        let i = !1;
        const r = (l, c) => {
          i || (i = !0, n = null, a({ text: l.trim(), confidence: c }));
        };
        n.onresult = (l) => {
          const c = l.results[0];
          c ? r(c[0].transcript, c[0].confidence) : r("", 0);
        }, n.onerror = () => r("", 0), n.onnomatch = () => r("", 0);
        const s = setTimeout(() => {
          try {
            n == null || n.stop();
          } catch {
          }
          r("", 0);
        }, o);
        n.onend = () => {
          clearTimeout(s), r("", 0);
        };
        try {
          n.start();
        } catch {
          r("", 0);
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
function ht(t, e) {
  if (!t || !e) return !1;
  const n = je[e];
  if (!n) return !1;
  const o = Fe[n];
  if (!o) return !1;
  const a = t.replace(/[\s.,!?]/g, "");
  return a.length ? o.some((i) => i.test(a)) : !1;
}
const I = [
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
function ft(t) {
  return I.find((e) => e.letter === t) || null;
}
function Pe(t = "regular") {
  return t === "regular" ? I.filter((e) => !e.isFinal) : t === "final" ? I.filter((e) => e.isFinal) : I;
}
function bt(t, e = "regular") {
  const n = Pe(e);
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
], gt = ["א", "ב", "ג", "ד", "מ", "נ", "ל", "ר", "ש", "ת", "פ", "ק"];
function _t(t, e) {
  return t + e;
}
function vt(t) {
  let e = [...q];
  if (typeof window < "u" && window.location && window.location.search) {
    const o = new URLSearchParams(window.location.search), a = o.get("allowedNikud");
    if (a) {
      const r = a.split(",").map((s) => s.trim());
      e = e.filter(
        (s) => r.includes(s.id) || r.includes(s.name) || r.includes(s.nameNikud)
      );
    }
    const i = o.get("excludedNikud");
    if (i) {
      const r = i.split(",").map((s) => s.trim());
      e = e.filter(
        (s) => !r.includes(s.id) && !r.includes(s.name) && !r.includes(s.nameNikud)
      );
    }
  }
  e.length === 0 && (e = [...q]);
  let n = [...e];
  for (; n.length < t; )
    n.push(...e);
  return n.sort(() => Math.random() - 0.5).slice(0, t);
}
function yt(t, e, n) {
  t.innerHTML = "";
  const o = document.createElement("div");
  o.className = "option-cards-grid";
  const a = e.map((i) => {
    const r = document.createElement("button");
    return r.className = "option-card", r.dataset.id = i.id, r.innerHTML = `
      <span class="option-card__emoji">${i.emoji || ""}</span>
      <span class="option-card__text">${i.text}</span>
    `, r.addEventListener("click", () => {
      r.disabled || n(i);
    }), o.appendChild(r), { el: r, option: i };
  });
  return t.appendChild(o), {
    /** הַדָּגֵשׁ כַּרְטִיס לְפִי סוּג: 'correct' | 'wrong' | 'hint' */
    highlight(i, r) {
      a.forEach(({ el: s, option: l }) => {
        l.id === i && s.classList.add(`option-card--${r}`);
      });
    },
    /** נטרל את כל הכרטיסים */
    disable() {
      a.forEach(({ el: i }) => {
        i.disabled = !0;
      });
    },
    /** אפס את מצב הכרטיסים */
    reset() {
      a.forEach(({ el: i }) => {
        i.className = "option-card", i.disabled = !1;
      });
    },
    /** הסר את הרכיב */
    destroy() {
      t.innerHTML = "";
    }
  };
}
function kt(t, e) {
  const n = document.createElement("div");
  n.className = "progress-bar", n.setAttribute("role", "progressbar"), n.setAttribute("aria-valuemin", "0"), n.setAttribute("aria-valuemax", String(e)), n.innerHTML = `
    <div class="progress-bar__track">
      <div class="progress-bar__fill" style="width: 0%"></div>
    </div>
    <span class="progress-bar__label">0 / ${e}</span>
  `, t.appendChild(n);
  const o = n.querySelector(".progress-bar__fill"), a = n.querySelector(".progress-bar__label");
  return {
    /** עדכן את ההתקדמות */
    update(i) {
      const r = Math.round(i / e * 100);
      o.style.width = `${r}%`, a.textContent = `${i} / ${e}`, n.setAttribute("aria-valuenow", String(i));
    },
    /** הסר את הרכיב */
    destroy() {
      n.remove();
    }
  };
}
function wt(t) {
  const e = document.createElement("div");
  e.className = "feedback-message", e.setAttribute("aria-live", "polite"), e.setAttribute("role", "status"), t.appendChild(e);
  let n = null;
  function o(a, i, r = 1800) {
    clearTimeout(n), e.textContent = a, e.className = `feedback-message feedback-message--${i}`, n = setTimeout(() => {
      e.textContent = "", e.className = "feedback-message";
    }, r);
  }
  return {
    /** הצג משוב חיובי */
    correct(a = "!כָּל הַכָּבוֹד") {
      H.correct(), o(a, "correct"), P(e, "bounce");
    },
    /** הצג עידוד — נסה שוב */
    wrong(a = "נַסֵּה שׁוּב") {
      H.wrong(), o(a, "wrong"), P(e, "pulse");
    },
    /** הצג רמז */
    hint(a) {
      o(a, "hint"), P(e, "pulse");
    },
    /** הסר את הרכיב */
    destroy() {
      clearTimeout(n), e.remove();
    }
  };
}
function Et(t, e) {
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
  const o = new URLSearchParams(window.location.search), a = o.get("allowedNikud") ? o.get("allowedNikud").split(",") : [];
  let i = `
    <div style="background:white; padding:1.5rem; border-radius:1rem; min-width:300px; text-align:center; color:#333; font-family:Heebo,Arial; direction:rtl;">
      <h2 style="margin-top:0">בחר ניקוד</h2>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; margin:1rem 0; text-align:right;">
  `;
  q.forEach((c) => {
    const m = a.length === 0 || a.includes(c.id) || a.includes(c.name);
    i += `
      <label style="display:flex; align-items:center; gap:0.5rem; cursor:pointer;">
        <input type="checkbox" value="${c.id}" class="nikud-filter-cb" ${m ? "checked" : ""} style="width:1.2rem;height:1.2rem;">
        <span>${c.nameNikud}</span>
      </label>
    `;
  });
  const r = parseFloat(localStorage.getItem("alefbet.nikudRate")) || 0.5;
  i += `
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
  `, n.innerHTML = i, n.style.display = "flex";
  const s = document.getElementById("nikud-rate-slider"), l = document.getElementById("nikud-rate-val");
  s.oninput = () => {
    l.textContent = s.value;
  }, document.getElementById("save-settings-btn").onclick = () => {
    const c = parseFloat(s.value);
    localStorage.setItem("alefbet.nikudRate", c), $e.setNikudEmphasis({ rate: c });
    const m = Array.from(n.querySelectorAll(".nikud-filter-cb")).filter((h) => h.checked).map((h) => h.value), d = new URL(window.location);
    m.length > 0 && m.length < q.length ? d.searchParams.set("allowedNikud", m.join(",")) : d.searchParams.delete("allowedNikud"), d.searchParams.delete("excludedNikud"), n.style.display = "none", window.history.replaceState({}, "", d), e && e(t);
  }, document.getElementById("close-settings-btn").onclick = () => {
    n.style.display = "none";
  };
}
function xt(t) {
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
    highlight(o) {
      e.classList.remove("ab-zone--correct", "ab-zone--hover"), o && e.classList.add(`ab-zone--${o}`);
    },
    reset() {
      e.classList.remove("ab-zone--correct", "ab-zone--hover");
    },
    destroy() {
      e.removeEventListener("click", n);
    }
  };
}
function Nt(t, e = "טוֹעֵן...") {
  t.innerHTML = `<div class="ab-loading">${e}</div>`;
}
function Ct(t) {
  t.innerHTML = "";
}
function Lt(t, e, n, o) {
  const a = t.querySelector(".game-header__spacer");
  if (!a) return null;
  const i = document.createElement("button");
  return i.className = "ab-header-btn", i.setAttribute("aria-label", n), i.textContent = e, i.onclick = o, a.innerHTML = "", a.appendChild(i), i;
}
function St(t, { size: e = "md" } = {}) {
  const n = document.createElement("div");
  n.className = `ab-nikud-box ab-nikud-box--${e} ab-nikud-box--${t.id}`;
  const o = document.createElement("div");
  o.className = "ab-nikud-box__box";
  const a = document.createElement("div");
  return a.className = "ab-nikud-box__mark", a.textContent = t.symbol, n.appendChild(o), n.appendChild(a), n;
}
let S = null, k = null, G = 0, X = 0;
const D = /* @__PURE__ */ new Map();
function oe(t, e) {
  var n;
  return ((n = document.elementFromPoint(t, e)) == null ? void 0 : n.closest('[data-drop-target="true"]')) || null;
}
function Ie(t, e, n) {
  const o = t.getBoundingClientRect();
  G = o.width / 2, X = o.height / 2, k = t.cloneNode(!0), Object.assign(k.style, {
    position: "fixed",
    left: `${e - G}px`,
    top: `${n - X}px`,
    width: `${o.width}px`,
    height: `${o.height}px`,
    pointerEvents: "none",
    // keeps it out of elementFromPoint + hit-testing
    zIndex: "9999",
    opacity: "0.85",
    transform: "scale(1.12)",
    cursor: "grabbing",
    margin: "0"
  }), document.body.appendChild(k);
}
function He(t, e) {
  k && (k.style.left = `${t - G}px`, k.style.top = `${e - X}px`);
}
function qe() {
  k == null || k.remove(), k = null;
}
let w = null;
function De(t) {
  w !== t && (w == null || w.classList.remove("drop-target--hover"), w = t, t == null || t.classList.add("drop-target--hover"));
}
function Ue() {
  w == null || w.classList.remove("drop-target--hover"), w = null;
}
function Rt(t, e) {
  t.classList.add("drag-source");
  let n = null, o = null, a = null;
  function i() {
    n && (t.removeEventListener("pointermove", n), t.removeEventListener("pointerup", o), t.removeEventListener("pointercancel", a), n = o = a = null), Ue(), qe(), t.classList.remove("drag-source--dragging"), S = null;
  }
  function r(s) {
    s.button !== void 0 && s.button !== 0 || (s.preventDefault(), S && i(), S = { el: t, data: e }, t.classList.add("drag-source--dragging"), Ie(t, s.clientX, s.clientY), t.setPointerCapture(s.pointerId), n = (l) => {
      He(l.clientX, l.clientY), De(oe(l.clientX, l.clientY));
    }, o = (l) => {
      const c = oe(l.clientX, l.clientY);
      i(), c && D.has(c) && D.get(c).onDrop({ data: e, sourceEl: t, targetEl: c });
    }, a = () => i(), t.addEventListener("pointermove", n), t.addEventListener("pointerup", o), t.addEventListener("pointercancel", a));
  }
  return t.addEventListener("pointerdown", r), {
    destroy() {
      t.removeEventListener("pointerdown", r), (S == null ? void 0 : S.el) === t && i(), t.classList.remove("drag-source");
    }
  };
}
function At(t, e) {
  return t.setAttribute("data-drop-target", "true"), t.classList.add("drop-target--active"), D.set(t, { onDrop: e }), {
    destroy() {
      t.removeAttribute("data-drop-target"), t.classList.remove("drop-target--active", "drop-target--hover"), D.delete(t);
    }
  };
}
function le(t, e) {
  const n = [];
  function o() {
    try {
      const s = localStorage.getItem(t);
      return s === null ? e : JSON.parse(s);
    } catch {
      return e;
    }
  }
  function a(s) {
    try {
      localStorage.setItem(t, JSON.stringify(s));
    } catch (l) {
      console.warn(`[createLocalState] שגיאה בשמירת "${t}":`, l);
    }
    n.forEach((l) => l(s));
  }
  function i(s) {
    a(s(o()));
  }
  function r(s) {
    return n.push(s), function() {
      const c = n.indexOf(s);
      c !== -1 && n.splice(c, 1);
    };
  }
  return { get: o, set: a, update: i, subscribe: r };
}
function Tt(t, e = {}) {
  const {
    title: n = "",
    subtitle: o = "",
    tabs: a = [],
    homeUrl: i = null,
    onTabChange: r = null
  } = e;
  t.classList.add("ab-app");
  const s = i ? `<a href="${i}" class="ab-app-back-link" aria-label="דף הבית">🏠</a>` : "", l = o ? `<span class="ab-app-subtitle">${o}</span>` : '<span class="ab-app-subtitle"></span>', c = a.map(
    (u) => `<button class="ab-app-tab" data-tab="${u.id}" aria-selected="false" role="tab"><span class="ab-app-tab-icon">${u.icon}</span><span class="ab-app-tab-label">${u.label}</span></button>`
  ).join(""), m = a.map(
    (u) => `<button class="ab-app-nav-item" data-tab="${u.id}" aria-selected="false" role="tab"><span class="ab-app-nav-icon">${u.icon}</span><span class="ab-app-nav-label">${u.label}</span></button>`
  ).join("");
  t.innerHTML = `
    <header class="ab-app-header">
      <div class="ab-app-header-text">
        <h1 class="ab-app-title">${n}</h1>
        ${l}
      </div>
      ${s}
    </header>
    <nav class="ab-app-tabs" role="tablist" aria-label="ניווט ראשי">
      ${c}
    </nav>
    <main class="ab-app-content"></main>
    <nav class="ab-app-bottom-nav" role="tablist" aria-label="ניווט תחתון">
      ${m}
    </nav>
  `;
  const d = t.querySelector(".ab-app-subtitle"), h = t.querySelector(".ab-app-content");
  function p(u) {
    g(u), typeof r == "function" && r(u);
  }
  t.querySelectorAll(".ab-app-tab, .ab-app-nav-item").forEach((u) => {
    u.addEventListener("click", () => p(u.dataset.tab));
  });
  function g(u) {
    t.querySelectorAll(".ab-app-tab, .ab-app-nav-item").forEach((_) => {
      const f = _.dataset.tab === u;
      _.classList.toggle("ab-active", f), _.setAttribute("aria-selected", f ? "true" : "false");
    });
  }
  return a.length > 0 && g(a[0].id), {
    /** אלמנט תוכן הראשי — כאן מרנדרים את תוכן הטאב הנוכחי */
    contentEl: h,
    /**
     * עדכן את כותרת המשנה
     * @param {string} text - הטקסט החדש לכותרת המשנה
     */
    setSubtitle(u) {
      d.textContent = u;
    },
    /**
     * הגדר את הטאב הפעיל באופן תכנותי
     * @param {string} tabId - מזהה הטאב להפעלה
     */
    setActiveTab(u) {
      g(u);
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
function ze() {
  let t = null, e = null, n = [];
  async function o() {
    if (t && t.state === "recording") return;
    e = await navigator.mediaDevices.getUserMedia({ audio: !0, video: !1 }), n = [];
    const l = {}, c = Oe();
    c && (l.mimeType = c), t = new MediaRecorder(e, l), t.ondataavailable = (m) => {
      var d;
      ((d = m.data) == null ? void 0 : d.size) > 0 && n.push(m.data);
    }, t.start(100);
  }
  function a() {
    return new Promise((l, c) => {
      if (!t || t.state === "inactive") {
        c(new Error("[voice-recorder] not recording"));
        return;
      }
      t.onstop = () => {
        const m = new Blob(n, { type: t.mimeType || "audio/webm" });
        r(), l(m);
      }, t.onerror = (m) => {
        r(), c(m.error);
      }, t.stop();
    });
  }
  function i() {
    t && t.state !== "inactive" && (t.ondataavailable = null, t.onstop = null, t.stop()), r();
  }
  function r() {
    e == null || e.getTracks().forEach((l) => l.stop()), e = null, t = null, n = [];
  }
  function s() {
    return (t == null ? void 0 : t.state) === "recording";
  }
  return { start: o, stop: a, cancel: i, isActive: s };
}
const Ve = "alefbet-voices", E = "recordings", Ge = 1;
let M = null;
function O() {
  return M || (M = new Promise((t, e) => {
    const n = indexedDB.open(Ve, Ge);
    n.onupgradeneeded = (o) => {
      o.target.result.createObjectStore(E);
    }, n.onsuccess = (o) => t(o.target.result), n.onerror = (o) => {
      M = null, e(o.target.error);
    };
  }), M);
}
function J(t, e) {
  return `${t}/${e}`;
}
async function Xe(t, e, n) {
  const o = await O();
  return new Promise((a, i) => {
    const r = o.transaction(E, "readwrite");
    r.objectStore(E).put(n, J(t, e)), r.oncomplete = a, r.onerror = (s) => i(s.target.error);
  });
}
async function Y(t, e) {
  const n = await O();
  return new Promise((o, a) => {
    const r = n.transaction(E, "readonly").objectStore(E).get(J(t, e));
    r.onsuccess = () => o(r.result ?? null), r.onerror = (s) => a(s.target.error);
  });
}
async function Je(t, e) {
  const n = await O();
  return new Promise((o, a) => {
    const i = n.transaction(E, "readwrite");
    i.objectStore(E).delete(J(t, e)), i.oncomplete = o, i.onerror = (r) => a(r.target.error);
  });
}
async function $t(t) {
  const e = await O();
  return new Promise((n, o) => {
    const i = e.transaction(E, "readonly").objectStore(E).getAllKeys();
    i.onsuccess = () => {
      const r = `${t}/`;
      n(
        (i.result || []).filter((s) => s.startsWith(r)).map((s) => s.slice(r.length))
      );
    }, i.onerror = (r) => o(r.target.error);
  });
}
async function Ye(t, e) {
  let n;
  try {
    n = await Y(t, e);
  } catch {
    return !1;
  }
  return n ? new Promise((o) => {
    const a = URL.createObjectURL(n), i = new Audio(a), r = (s) => {
      URL.revokeObjectURL(a), o(s);
    };
    i.onended = () => r(!0), i.onerror = () => r(!1), i.play().catch(() => r(!1));
  }) : !1;
}
async function Mt(t, e) {
  return await Y(t, e).catch(() => null) !== null;
}
function Ke(t, {
  gameId: e,
  voiceKey: n,
  label: o = "הקלטת קול",
  onSaved: a,
  onDeleted: i
} = {}) {
  if (!We()) {
    const b = document.createElement("span");
    return b.className = "ab-voice-unsupported", b.textContent = "🎤 הקלטה לא נתמכת בדפדפן זה", t.appendChild(b), { refresh: async () => {
    }, destroy: () => b.remove() };
  }
  const r = ze(), s = document.createElement("div");
  s.className = "ab-voice-btn-wrap", s.setAttribute("aria-label", o), t.appendChild(s);
  let l = "idle", c = null, m = null, d = null, h = null, p = null, g = null, u = 0;
  function _() {
    if (s.innerHTML = "", l === "idle")
      c = f("🎤", "ab-voice-btn ab-voice-btn--record", "התחל הקלטה", v), s.appendChild(c);
    else if (l === "recording") {
      p = document.createElement("span"), p.className = "ab-voice-indicator", s.appendChild(p);
      const b = document.createElement("span");
      b.className = "ab-voice-timer", b.textContent = "0:00", s.appendChild(b), u = 0, g = setInterval(() => {
        u++;
        const x = Math.floor(u / 60), j = String(u % 60).padStart(2, "0");
        b.textContent = `${x}:${j}`, u >= 120 && N();
      }, 1e3), m = f("⏹", "ab-voice-btn ab-voice-btn--stop", "עצור הקלטה", N), s.appendChild(m);
    } else l === "has-voice" && (d = f("▶", "ab-voice-btn ab-voice-btn--play", "נגן הקלטה", y), s.appendChild(d), c = f("🎤", "ab-voice-btn ab-voice-btn--re-record", "הקלט מחדש", v), s.appendChild(c), h = f("🗑", "ab-voice-btn ab-voice-btn--delete", "מחק הקלטה", me), s.appendChild(h));
  }
  function f(b, x, j, fe) {
    const C = document.createElement("button");
    return C.className = x, C.type = "button", C.title = j, C.setAttribute("aria-label", j), C.textContent = b, C.addEventListener("click", fe), C;
  }
  async function v() {
    try {
      await r.start(), l = "recording", _();
    } catch (b) {
      console.warn("[voice-record-button] microphone access denied:", b), pe("לא ניתן לגשת למיקרופון");
    }
  }
  async function N() {
    clearInterval(g);
    try {
      const b = await r.stop();
      await Xe(e, n, b), l = "has-voice", _(), a == null || a(b);
    } catch (b) {
      console.warn("[voice-record-button] stop error:", b), l = "idle", _();
    }
  }
  async function y() {
    d == null || d.setAttribute("disabled", "true"), await Ye(e, n), d == null || d.removeAttribute("disabled");
  }
  async function me() {
    confirm("למחוק את ההקלטה?") && (await Je(e, n), l = "idle", _(), i == null || i());
  }
  function pe(b) {
    const x = document.createElement("span");
    x.className = "ab-voice-error", x.textContent = b, s.appendChild(x), setTimeout(() => x.remove(), 3e3);
  }
  async function K() {
    if (r.isActive()) return;
    l = await Y(e, n).catch(() => null) ? "has-voice" : "idle", _();
  }
  function he() {
    clearInterval(g), r.isActive() && r.cancel(), s.remove();
  }
  return K(), { refresh: K, destroy: he };
}
function Qe(t, { onClick: e } = {}) {
  const n = document.createElement("div");
  n.className = "ab-editor-overlay", e && n.addEventListener("pointerdown", e);
  function o() {
    n.parentElement || (t.style.position = "relative", t.appendChild(n));
  }
  function a() {
    n.remove();
  }
  function i() {
    a();
  }
  return { show: o, hide: a, destroy: i };
}
function Ze(t, e, { onSelectRound: n, onAddRound: o }) {
  const a = document.createElement("div");
  a.className = "ab-editor-nav", a.setAttribute("aria-label", "ניווט סיבובים");
  const i = document.createElement("div");
  i.className = "ab-editor-nav__header", i.textContent = "סיבובים", a.appendChild(i);
  const r = document.createElement("div");
  r.className = "ab-editor-nav__list", a.appendChild(r);
  const s = document.createElement("button");
  s.className = "ab-editor-nav__add", s.textContent = "+ הוסף", s.addEventListener("click", () => o(null)), a.appendChild(s), t.appendChild(a);
  let l = null;
  function c(p, g) {
    const u = document.createElement("div");
    u.className = "ab-editor-nav__thumb", p.id === l && u.classList.add("ab-editor-nav__thumb--active"), u.setAttribute("role", "button"), u.setAttribute("tabindex", "0"), u.setAttribute("aria-label", `סיבוב ${g + 1}`), u.dataset.roundId = p.id;
    const _ = document.createElement("div");
    if (_.className = "ab-editor-nav__num", _.textContent = g + 1, u.appendChild(_), p.correctEmoji) {
      const f = document.createElement("div");
      f.className = "ab-editor-nav__emoji", f.textContent = p.correctEmoji, u.appendChild(f);
    }
    if (p.target) {
      const f = document.createElement("div");
      f.className = "ab-editor-nav__letter", f.textContent = p.target, u.appendChild(f);
    }
    return u.addEventListener("click", () => n(p.id)), u.addEventListener("keydown", (f) => {
      (f.key === "Enter" || f.key === " ") && (f.preventDefault(), n(p.id));
    }), u;
  }
  function m() {
    r.innerHTML = "", e.rounds.forEach((p, g) => {
      r.appendChild(c(p, g));
    });
  }
  function d(p) {
    l = p, r.querySelectorAll(".ab-editor-nav__thumb").forEach((g) => {
      g.classList.toggle("ab-editor-nav__thumb--active", g.dataset.roundId === p);
    });
  }
  function h() {
    a.remove();
  }
  return m(), { refresh: m, setActiveRound: d, destroy: h };
}
const ie = {
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
function et(t, { onFieldChange: e, onDeleteRound: n, getEditableFields: o }) {
  const a = document.createElement("div");
  a.className = "ab-editor-inspector";
  const i = document.createElement("div");
  i.className = "ab-editor-inspector__header", i.innerHTML = '<span class="ab-editor-inspector__title">✏️ ערוך סיבוב</span>', a.appendChild(i);
  const r = document.createElement("div");
  r.className = "ab-editor-inspector__body", a.appendChild(r);
  const s = document.createElement("button");
  s.className = "ab-editor-inspector__delete", s.textContent = "🗑 מחק סיבוב", a.appendChild(s), t.appendChild(a);
  let l = null;
  function c() {
    r.innerHTML = '<p class="ab-editor-inspector__empty">בחר סיבוב לעריכה</p>', s.hidden = !0, l = null;
  }
  function m(h, p = "multiple-choice") {
    l = h.id, r.innerHTML = "", s.hidden = !1, ((o ? o(p) : null) || ie[p] || ie["multiple-choice"]).forEach((u) => {
      const _ = document.createElement("div");
      _.className = "ab-editor-field";
      const f = document.createElement("label");
      if (f.className = "ab-editor-field__label", f.textContent = u.label, _.appendChild(f), u.type === "emoji") {
        const v = document.createElement("div");
        v.className = "ab-editor-field__emoji-row";
        const N = document.createElement("div");
        N.className = "ab-editor-field__emoji-preview", N.textContent = h[u.key] || "❓", v.appendChild(N);
        const y = document.createElement("input");
        y.className = "ab-editor-field__input", y.type = "text", y.value = h[u.key] || "", y.maxLength = 8, y.placeholder = "🐱", y.style.fontSize = "20px", y.addEventListener("input", () => {
          N.textContent = y.value || "❓", e(l, u.key, y.value);
        }), v.appendChild(y), _.appendChild(v);
      } else {
        const v = document.createElement("input");
        v.className = "ab-editor-field__input", v.type = "text", v.value = h[u.key] || "", v.dir = "rtl", u.maxLength && (v.maxLength = u.maxLength), v.addEventListener("input", () => {
          e(l, u.key, v.value);
        }), _.appendChild(v);
      }
      r.appendChild(_);
    }), s.onclick = () => {
      confirm("למחוק את הסיבוב הזה?") && (n(l), c());
    };
  }
  function d() {
    a.remove();
  }
  return c(), { loadRound: m, clear: c, destroy: d };
}
let tt = 0;
function re() {
  return `round-${Date.now()}-${tt++}`;
}
class U {
  /**
   * @param {object} schema - { id, version, meta, rounds, distractors }
   */
  constructor(e) {
    this._id = e.id || "game", this._version = e.version || 1, this._meta = { title: "", type: "multiple-choice", ...e.meta }, this._rounds = (e.rounds || []).map((n) => ({ ...n, id: n.id || re() })), this._distractors = e.distractors || [], this._handlers = [];
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
    const o = this.getRoundIndex(e);
    o !== -1 && (this._rounds[o] = { ...this._rounds[o], ...n }, this._emit());
  }
  addRound(e = null) {
    const n = { id: re(), target: "", correct: "", correctEmoji: "❓" };
    if (e === null)
      this._rounds.push(n);
    else {
      const o = this.getRoundIndex(e);
      this._rounds.splice(o + 1, 0, n);
    }
    return this._emit(), n.id;
  }
  removeRound(e) {
    const n = this.getRoundIndex(e);
    n === -1 || this._rounds.length <= 1 || (this._rounds.splice(n, 1), this._emit());
  }
  moveRound(e, n) {
    const o = this.getRoundIndex(e);
    if (o === -1) return;
    const [a] = this._rounds.splice(o, 1);
    this._rounds.splice(Math.max(0, Math.min(n, this._rounds.length)), 0, a), this._emit();
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
    return new U(e);
  }
  /**
   * Migration helper: convert a plain ROUNDS array into a GameData instance.
   * @param {string} gameId
   * @param {object[]} rounds
   * @param {object} meta - { title, type }
   * @param {object[]} [distractors]
   */
  static fromRoundsArray(e, n, o = {}, a = []) {
    return new U({ id: e, meta: o, rounds: n, distractors: a });
  }
}
const ce = "alefbet.editor.";
function de(t) {
  return le(`${ce}${t}`, null);
}
function nt(t) {
  de(t.id).set(t.toJSON());
}
function Bt(t) {
  const e = de(t).get();
  if (!e) return null;
  try {
    return U.fromJSON(e);
  } catch {
    return null;
  }
}
function jt(t) {
  try {
    localStorage.removeItem(`${ce}${t}`);
  } catch {
  }
}
function at(t) {
  const e = JSON.stringify(t.toJSON(), null, 2), n = new Blob([e], { type: "application/json;charset=utf-8" }), o = URL.createObjectURL(n), a = document.createElement("a");
  a.href = o, a.download = `${t.id}-rounds.json`, a.click(), URL.revokeObjectURL(o);
}
const ot = [
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
function it(t) {
  return t.trim().replace(/\s+/g, "-").replace(/[^a-z0-9\u05D0-\u05EA_-]/gi, "").toLowerCase() || `custom-${Date.now()}`;
}
function rt(t) {
  return le(`alefbet.audio-manager.${t}.custom`, []);
}
function st(t, e = null) {
  var c;
  (c = document.getElementById("ab-audio-manager")) == null || c.remove();
  const n = document.createElement("div");
  n.id = "ab-audio-manager", n.className = "ab-am-modal", n.setAttribute("role", "dialog"), n.setAttribute("aria-modal", "true"), n.setAttribute("aria-label", "מנהל הקלטות"), n.innerHTML = `
    <div class="ab-am-backdrop"></div>
    <div class="ab-am-box">
      <div class="ab-am-header">
        <span class="ab-am-title">🎤 מנהל הקלטות</span>
        <span class="ab-am-subtitle">כל ההקלטות נשמרות בדפדפן וניתן להשתמש בהן דרך <code>playVoice('${t}', voiceKey)</code></span>
        <button class="ab-am-close" aria-label="סגור">✕</button>
      </div>
      <div class="ab-am-body" id="ab-am-body"></div>
    </div>
  `, document.body.appendChild(n);
  const o = n.querySelector("#ab-am-body"), a = n.querySelector(".ab-am-close"), i = n.querySelector(".ab-am-backdrop"), r = [], s = [...ot];
  e && e.rounds.length > 0 && s.splice(1, 0, {
    // insert after Instructions
    id: "rounds",
    label: "🔤 שאלות / סיבובים",
    slots: e.rounds.map((m, d) => ({
      key: m.id,
      label: `סיבוב ${d + 1}${m.target ? " — " + m.target : ""}${m.correct ? " (" + m.correct + ")" : ""}`
    }))
  }), s.forEach((m) => {
    o.appendChild(lt(m, t, r));
  }), o.appendChild(ct(t, r));
  function l() {
    r.forEach((m) => m.destroy()), n.remove();
  }
  a.addEventListener("click", l), i.addEventListener("click", l), document.addEventListener("keydown", function m(d) {
    d.key === "Escape" && (l(), document.removeEventListener("keydown", m));
  });
}
function lt(t, e, n) {
  const o = document.createElement("section");
  o.className = "ab-am-section";
  const a = document.createElement("button");
  a.className = "ab-am-section__heading", a.setAttribute("aria-expanded", "true"), a.innerHTML = `<span>${t.label}</span><span class="ab-am-chevron">▾</span>`, o.appendChild(a);
  const i = document.createElement("div");
  return i.className = "ab-am-grid", o.appendChild(i), t.slots.forEach((r) => {
    i.appendChild(ue(e, r.key, r.label, n));
  }), a.addEventListener("click", () => {
    const r = a.getAttribute("aria-expanded") === "true";
    a.setAttribute("aria-expanded", String(!r)), i.hidden = r, a.querySelector(".ab-am-chevron").textContent = r ? "▸" : "▾";
  }), o;
}
function ct(t, e) {
  const n = rt(t), o = document.createElement("section");
  o.className = "ab-am-section";
  const a = document.createElement("button");
  a.className = "ab-am-section__heading", a.setAttribute("aria-expanded", "true"), a.innerHTML = '<span>➕ מותאם אישית</span><span class="ab-am-chevron">▾</span>', o.appendChild(a);
  const i = document.createElement("div");
  i.className = "ab-am-grid", o.appendChild(i);
  function r() {
    i.querySelectorAll(".ab-am-row").forEach((d) => {
      const h = d._voiceBtn;
      h && (e.splice(e.indexOf(h), 1), h.destroy());
    }), i.innerHTML = "", n.get().forEach((d) => {
      const h = ue(t, d.key, d.label, e, () => {
        n.update((p) => p.filter((g) => g.key !== d.key)), r();
      });
      i.appendChild(h);
    });
  }
  r();
  const s = document.createElement("div");
  s.className = "ab-am-add-row", s.innerHTML = `
    <input class="ab-am-add-input" type="text" placeholder="שם ההקלטה... (למשל: שאלה ראשונה)" dir="rtl" />
    <button class="ab-am-add-btn">+ הוסף</button>
  `, o.appendChild(s);
  const l = s.querySelector(".ab-am-add-input"), c = s.querySelector(".ab-am-add-btn");
  function m() {
    const d = l.value.trim();
    if (!d) return;
    const h = it(d);
    if (n.get().some((p) => p.key === h)) {
      l.select();
      return;
    }
    n.update((p) => [...p, { key: h, label: d }]), l.value = "", r();
  }
  return c.addEventListener("click", m), l.addEventListener("keydown", (d) => {
    d.key === "Enter" && m();
  }), a.addEventListener("click", () => {
    const d = a.getAttribute("aria-expanded") === "true";
    a.setAttribute("aria-expanded", String(!d)), i.hidden = d, s.hidden = d, a.querySelector(".ab-am-chevron").textContent = d ? "▸" : "▾";
  }), o;
}
function ue(t, e, n, o, a = null) {
  const i = document.createElement("div");
  i.className = "ab-am-row";
  const r = document.createElement("div");
  r.className = "ab-am-row__label", r.textContent = n;
  const s = document.createElement("code");
  s.className = "ab-am-row__key", s.textContent = e;
  const l = document.createElement("div");
  l.className = "ab-am-row__label-col", l.appendChild(r), l.appendChild(s);
  const c = document.createElement("div");
  if (c.className = "ab-am-row__ctrl", a) {
    const d = document.createElement("button");
    d.className = "ab-am-row__del", d.title = "הסר", d.setAttribute("aria-label", "הסר הקלטה"), d.textContent = "✕", d.addEventListener("click", a), c.appendChild(d);
  }
  const m = Ke(c, { gameId: t, voiceKey: e, label: n });
  return o.push(m), i._voiceBtn = m, i.appendChild(l), i.appendChild(c), i;
}
class Ft {
  /**
   * @param {HTMLElement} container  — same container passed to GameShell
   * @param {import('./game-data.js').GameData} gameData
   * @param {{
   *   restartGame:       (container: HTMLElement) => void,
   *   getEditableFields?: (type: string) => object[],
   * }} options
   */
  constructor(e, n, { restartGame: o, getEditableFields: a } = {}) {
    this._container = e, this._gameData = n, this._restartGame = o, this._getEditableFields = a || null, this._mode = "play", this._overlay = null, this._navigator = null, this._inspector = null, this._toolbar = null, this._selectedId = null, requestAnimationFrame(() => this._injectToolbar());
  }
  // ── Toolbar ──────────────────────────────────────────────────────────────
  _injectToolbar() {
    const e = this._container.querySelector(".game-header__spacer");
    e && (this._toolbar = document.createElement("div"), this._toolbar.className = "ab-editor-toolbar", this._editBtn = this._makeBtn("✏️ ערוך", "ab-editor-btn--edit", () => this.enterEditMode()), this._audioBtn = this._makeBtn("🎤 קול", "ab-editor-btn--audio", () => this._openAudioManager()), this._toolbar.append(this._editBtn, this._audioBtn), e.innerHTML = "", e.appendChild(this._toolbar));
  }
  _makeBtn(e, n, o) {
    const a = document.createElement("button");
    return a.className = `ab-editor-btn ${n}`, a.innerHTML = e, a.addEventListener("click", o), a;
  }
  _setToolbarEditMode() {
    this._toolbar.innerHTML = "";
    const e = this._makeBtn("▶ שחק", "ab-editor-btn--play", () => this.enterPlayMode()), n = this._makeBtn("+ הוסף", "ab-editor-btn--add", () => this._addRound()), o = this._makeBtn("💾 שמור", "ab-editor-btn--save", () => this._save()), a = this._makeBtn("🎤 קול", "ab-editor-btn--audio", () => this._openAudioManager()), i = this._makeBtn("⬇ ייצוא", "ab-editor-btn--export", () => at(this._gameData));
    this._toolbar.append(e, n, o, a, i);
  }
  _setToolbarPlayMode() {
    this._toolbar.innerHTML = "", this._editBtn = this._makeBtn("✏️ ערוך", "ab-editor-btn--edit", () => this.enterEditMode()), this._audioBtn = this._makeBtn("🎤 קול", "ab-editor-btn--audio", () => this._openAudioManager()), this._toolbar.append(this._editBtn, this._audioBtn);
  }
  // ── Mode switching ────────────────────────────────────────────────────────
  enterEditMode() {
    if (this._mode === "edit") return;
    this._mode = "edit", this._container.classList.add("ab-editor-active"), this._setToolbarEditMode();
    const e = this._container.querySelector(".game-body");
    if (!e) return;
    this._overlay = Qe(e), this._overlay.show(), this._navigator = Ze(
      this._container,
      this._gameData,
      {
        onSelectRound: (o) => this._selectRound(o),
        onAddRound: (o) => this._addRound(o)
      }
    ), this._inspector = et(
      this._container,
      {
        onFieldChange: (o, a, i) => this._onFieldChange(o, a, i),
        onDeleteRound: (o) => this._deleteRound(o),
        getEditableFields: this._getEditableFields
      }
    );
    const n = this._gameData.rounds;
    n.length > 0 && this._selectRound(n[0].id);
  }
  enterPlayMode() {
    var e, n, o, a;
    this._mode !== "play" && (this._mode = "play", this._container.classList.remove("ab-editor-active"), this._setToolbarPlayMode(), (e = this._overlay) == null || e.destroy(), (n = this._navigator) == null || n.destroy(), (o = this._inspector) == null || o.destroy(), this._overlay = this._navigator = this._inspector = null, this._selectedId = null, (a = this._restartGame) == null || a.call(this, this._container));
  }
  // ── Round management ──────────────────────────────────────────────────────
  _selectRound(e) {
    var o, a;
    this._selectedId = e, (o = this._navigator) == null || o.setActiveRound(e);
    const n = this._gameData.getRound(e);
    n && ((a = this._inspector) == null || a.loadRound(n, this._gameData.meta.type));
  }
  _addRound(e = null) {
    var o;
    const n = this._gameData.addRound(e ?? this._selectedId);
    (o = this._navigator) == null || o.refresh(), this._selectRound(n);
  }
  _deleteRound(e) {
    var o;
    this._gameData.removeRound(e), (o = this._navigator) == null || o.refresh();
    const n = this._gameData.rounds;
    n.length > 0 && this._selectRound(n[0].id);
  }
  _onFieldChange(e, n, o) {
    var a, i;
    this._gameData.updateRound(e, { [n]: o }), (a = this._navigator) == null || a.refresh(), (i = this._navigator) == null || i.setActiveRound(e);
  }
  // ── Audio Manager ─────────────────────────────────────────────────────────
  _openAudioManager() {
    st(this._gameData.id, this._gameData);
  }
  // ── Save ──────────────────────────────────────────────────────────────────
  _save() {
    nt(this._gameData), this._showToast("✅ נשמר!");
  }
  _showToast(e) {
    const n = document.createElement("div");
    n.className = "ab-editor-toast", n.textContent = e, document.body.appendChild(n), setTimeout(() => n.remove(), 2200);
  }
}
export {
  be as EventBus,
  U as GameData,
  Ft as GameEditor,
  dt as GameShell,
  ge as GameState,
  we as addNikud,
  P as animate,
  jt as clearGameData,
  Tt as createAppShell,
  Rt as createDragSource,
  At as createDropTarget,
  wt as createFeedback,
  le as createLocalState,
  St as createNikudBox,
  yt as createOptionCards,
  kt as createProgressBar,
  mt as createRoundManager,
  pt as createSpeechListener,
  Ke as createVoiceRecordButton,
  ze as createVoiceRecorder,
  xt as createZone,
  Je as deleteVoice,
  at as exportGameDataAsJSON,
  ft as getLetter,
  Pe as getLettersByGroup,
  Ee as getNikud,
  Mt as hasVoice,
  I as hebrewLetters,
  Ct as hideLoadingScreen,
  Lt as injectHeaderButton,
  We as isVoiceRecordingSupported,
  _t as letterWithNikud,
  $t as listVoiceKeys,
  Bt as loadGameData,
  Y as loadVoice,
  ht as matchNikudSound,
  gt as nikudBaseLetters,
  q as nikudList,
  Ye as playVoice,
  ut as preloadNikud,
  bt as randomLetters,
  vt as randomNikud,
  nt as saveGameData,
  Xe as saveVoice,
  st as showAudioManager,
  Be as showCompletionScreen,
  Nt as showLoadingScreen,
  Et as showNikudSettingsDialog,
  H as sounds,
  $e as tts
};
