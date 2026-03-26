class X {
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
class G {
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
class ke {
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
    }, this.events = new X(), this.state = new G(this.config.totalRounds), this._buildShell();
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
let v = null;
function Y() {
  if (!v)
    try {
      v = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      return null;
    }
  return v.state === "suspended" && v.resume(), v;
}
function g(e, t, n = "sine", r = 0.3) {
  const a = Y();
  if (a)
    try {
      const s = a.createOscillator(), i = a.createGain();
      s.connect(i), i.connect(a.destination), s.type = n, s.frequency.setValueAtTime(e, a.currentTime), i.gain.setValueAtTime(r, a.currentTime), i.gain.exponentialRampToValueAtTime(1e-3, a.currentTime + t), s.start(a.currentTime), s.stop(a.currentTime + t + 0.05);
    } catch {
    }
}
const E = {
  /** צליל תשובה נכונה */
  correct() {
    g(523.25, 0.15), setTimeout(() => g(659.25, 0.2), 120), setTimeout(() => g(783.99, 0.3), 240);
  },
  /** צליל עידוד עדין — נסה שוב */
  wrong() {
    g(350, 0.15, "triangle", 0.12);
  },
  /** צליל עידוד - סיום מוצלח */
  cheer() {
    [523.25, 587.33, 659.25, 698.46, 783.99, 1046.5].forEach((t, n) => setTimeout(() => g(t, 0.2), n * 90));
  },
  /** קליק עדין */
  click() {
    g(900, 0.04, "sine", 0.12);
  }
}, M = "https://nakdan-u1-0.loadbalancer.dicta.org.il/api";
let B = !1;
const x = /* @__PURE__ */ new Map();
function V() {
  var a;
  if (typeof window > "u") return M;
  const e = new URLSearchParams(window.location.search).get("nakdanProxy"), t = window.ALEFBET_NAKDAN_PROXY_URL;
  if (e && window.localStorage)
    try {
      window.localStorage.setItem("alefbet.nakdanProxyUrl", e);
    } catch {
    }
  const n = (a = window.localStorage) == null ? void 0 : a.getItem("alefbet.nakdanProxyUrl"), r = e || t || n;
  return r || (window.location.hostname.endsWith("github.io") ? null : M);
}
function J(e) {
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
async function K(e) {
  const t = V();
  if (!t)
    throw B || (B = !0, console.warn("[nakdan] Dicta API blocked by CORS on GitHub Pages. Configure a proxy URL via ?nakdanProxy=..., window.ALEFBET_NAKDAN_PROXY_URL, or localStorage key alefbet.nakdanProxyUrl.")), new Error("Nakdan unavailable without proxy on this host");
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
  return J(a);
}
async function Q(e) {
  if (!(e != null && e.trim())) return e ?? "";
  if (x.has(e)) return x.get(e);
  try {
    const t = await K(e);
    return x.set(e, t), t;
  } catch {
    return x.set(e, e), e;
  }
}
function Z(e) {
  return x.get(e) ?? e ?? "";
}
async function we(e) {
  const t = [...new Set(e.filter((n) => n == null ? void 0 : n.trim()))];
  await Promise.all(t.map((n) => Q(n)));
}
let y = [], N = !1, O = !0, k = 0.9, H = typeof localStorage < "u" && parseFloat(localStorage.getItem("alefbet.nikudRate")) || 0.5, $ = !1, _ = null;
function U(e, t, n, r = t) {
  console.warn(`[tts] ${e} TTS failed`, { text: t, sentText: r, reason: n }), typeof window < "u" && typeof window.dispatchEvent == "function" && window.dispatchEvent(new CustomEvent("alefbet:tts-error", {
    detail: { provider: e, text: t, sentText: r, reason: n }
  }));
}
function ee(e) {
  return (e || "").replace(/[\u0591-\u05C7]/g, "");
}
function te(e) {
  const t = String(e || "").toLowerCase();
  return t.includes("didn't interact") || t.includes("notallowed");
}
function ne() {
  var e;
  return typeof window > "u" || typeof document > "u" ? Promise.resolve() : $ || (e = document.userActivation) != null && e.hasBeenActive ? ($ = !0, Promise.resolve()) : _ || (_ = new Promise((t) => {
    const n = () => {
      $ = !0, window.removeEventListener("pointerdown", n, !0), window.removeEventListener("keydown", n, !0), window.removeEventListener("touchstart", n, !0), t();
    };
    window.addEventListener("pointerdown", n, { once: !0, capture: !0 }), window.addEventListener("keydown", n, { once: !0, capture: !0 }), window.addEventListener("touchstart", n, { once: !0, capture: !0 });
  }).finally(() => {
    _ = null;
  }), _);
}
function ae(e, t, n) {
  const a = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(e)}&tl=he&client=tw-ob`, s = new Audio(a);
  s.playbackRate = k, s.onended = t, s.onerror = () => n("audio.onerror"), s.play().catch((i) => {
    n((i == null ? void 0 : i.message) || "audio.play() rejected");
  });
}
function re(e) {
  return new Promise((t, n) => {
    const r = ee(e).trim() || e;
    let a = !1, s = !1;
    const i = () => {
      a || (a = !0, t());
    }, o = (l) => {
      a || (a = !0, n(l));
    }, c = () => {
      try {
        ae(r, i, (l) => {
          if (!s && te(l)) {
            s = !0, ne().then(() => {
              a || c();
            });
            return;
          }
          U("google", e, l, r), o(l);
        });
      } catch (l) {
        U("google", e, (l == null ? void 0 : l.message) || "Audio() construction failed", r), o(l == null ? void 0 : l.message);
      }
    };
    c();
  });
}
let F = null;
function se() {
  const e = speechSynthesis.getVoices();
  return e.find((t) => t.lang === "he-IL") || e.find((t) => t.lang === "iw-IL") || e.find((t) => t.lang.startsWith("he")) || null;
}
function z() {
  F = se();
}
typeof speechSynthesis < "u" && (speechSynthesis.getVoices().length > 0 ? z() : speechSynthesis.addEventListener("voiceschanged", z, { once: !0 }));
function oe(e) {
  return new Promise((t) => {
    if (typeof speechSynthesis > "u") {
      t();
      return;
    }
    const n = new SpeechSynthesisUtterance(e);
    n.lang = "he-IL", n.rate = k, F && (n.voice = F), n.onend = t, n.onerror = t, speechSynthesis.speak(n);
  });
}
async function ie(e) {
  if (O)
    try {
      await re(e);
      return;
    } catch {
      console.info("[tts] Falling back to browser Speech API");
    }
  await oe(e);
}
function A() {
  if (N || y.length === 0) return;
  const e = y.shift();
  N = !0, ie(e.text).then(() => {
    N = !1, e.resolve(), A();
  });
}
const le = {
  /**
   * הקרא טקסט עברי
   * משתמש ב-Google Translate TTS לאיכות טובה יותר
   */
  speak(e) {
    const t = Z(e);
    return new Promise((n) => {
      y.push({ text: t, resolve: n }), A();
    });
  },
  /** עצור את הדיבור הנוכחי */
  cancel() {
    y.forEach((e) => e.resolve()), y = [], N = !1, typeof speechSynthesis < "u" && speechSynthesis.cancel();
  },
  get available() {
    return !0;
  },
  /** הגדר מהירות דיבור (0.5–2.0) */
  setRate(e) {
    k = Math.max(0.5, Math.min(2, e));
  },
  /** השתמש ב-Google Translate TTS (ברירת מחדל) או בדפדפן */
  useGoogle(e = !0) {
    O = e;
  },
  /**
   * הגדר מהירות דיבור להדגשת ניקוד
   * @param {{ rate?: number }} opts
   *   rate: מהירות דיבור להדגשה (ברירת מחדל 0.5)
   */
  setNikudEmphasis({ rate: e } = {}) {
    e != null && (H = Math.max(0.3, Math.min(1.5, e)));
  },
  /**
   * הקרא אות עם ניקוד באיטיות להדגשת התנועה
   * @param {string} letter - האות (למשל 'ב')
   * @param {string} nikudSymbol - סמל הניקוד (למשל '\u05B7')
   */
  speakNikud(e, t) {
    const n = e + t, r = k;
    return k = H, new Promise((a) => {
      y.push({ text: n, resolve: a }), A();
    }).finally(() => {
      k = r;
    });
  }
}, q = {
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
}, ce = {
  shake: 420,
  bounce: 480,
  pulse: 600,
  fadeIn: 320,
  confetti: 700
};
function S(e, t) {
  !e || !q[t] || e.animate(q[t], {
    duration: ce[t] || 400,
    easing: "ease-in-out",
    fill: "none"
  });
}
function de(e, t, n, r) {
  E.cheer();
  const a = t / n, s = a >= 0.8 ? 3 : a >= 0.5 ? 2 : 1, i = "⭐".repeat(s) + "☆".repeat(3 - s), o = document.createElement("div");
  o.className = "completion-screen", o.innerHTML = `
    <div class="completion-screen__content">
      <div class="completion-screen__stars" aria-label="${s} כּוֹכָבִים">${i}</div>
      <h2 class="completion-screen__title">!כָּל הַכָּבוֹד</h2>
      <p class="completion-screen__score">נִיקּוּד: ${t} מִתּוֹךְ ${n}</p>
      <button class="completion-screen__replay btn btn--primary">שַׂחֵק שׁוּב</button>
    </div>
  `, o.querySelector(".completion-screen__replay").addEventListener("click", () => {
    o.remove(), r();
  }), e.innerHTML = "", e.appendChild(o), S(o.querySelector(".completion-screen__content"), "fadeIn");
}
function ve(e, t, {
  totalRounds: n,
  progressBar: r = null,
  buildRoundUI: a,
  onCorrect: s,
  onWrong: i
} = {}) {
  let o = !1;
  async function c(h) {
    if (o) return;
    o = !0, E.correct(), h && await h(), s && await s(), e.state.addScore(1), r == null || r.update(e.state.currentRound), await new Promise((w) => setTimeout(w, 1200)), e.state.nextRound() ? (o = !1, a()) : de(t, e.state.score, n, () => {
      location.reload();
    });
  }
  async function l() {
    o || (o = !0, i && await i(), o = !1);
  }
  function m() {
    return o;
  }
  function p() {
    o = !1;
  }
  return { handleCorrect: c, handleWrong: l, isAnswered: m, reset: p };
}
const ue = {
  kamatz: "ah",
  patah: "ah",
  tzere: "eh",
  segol: "eh",
  hiriq: "ee",
  holam: "oh",
  kubbutz: "oo"
}, me = {
  ah: [/[אה]/, /^א$/, /אא/, /הא/],
  eh: [/[אה]/, /^א$/, /אא/, /הא/, /אה/],
  ee: [/[אי]/, /^י$/, /אי/, /הי/],
  oh: [/[או]/, /^[או]$/, /או/, /הו/],
  oo: [/[או]/, /^[או]$/, /או/, /הו/, /אוּ/]
};
function _e() {
  const e = typeof window < "u" ? window.SpeechRecognition || window.webkitSpeechRecognition : null, t = !!e;
  let n = null;
  return {
    available: t,
    listen(r = 4e3) {
      return t ? new Promise((a) => {
        n = new e(), n.lang = "he-IL", n.continuous = !1, n.interimResults = !1, n.maxAlternatives = 3;
        let s = !1;
        const i = (c, l) => {
          s || (s = !0, n = null, a({ text: c.trim(), confidence: l }));
        };
        n.onresult = (c) => {
          const l = c.results[0];
          l ? i(l[0].transcript, l[0].confidence) : i("", 0);
        }, n.onerror = () => i("", 0), n.onnomatch = () => i("", 0);
        const o = setTimeout(() => {
          try {
            n == null || n.stop();
          } catch {
          }
          i("", 0);
        }, r);
        n.onend = () => {
          clearTimeout(o), i("", 0);
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
function xe(e, t) {
  if (!e || !t) return !1;
  const n = ue[t];
  if (!n) return !1;
  const r = me[n];
  if (!r) return !1;
  const a = e.replace(/[\s.,!?]/g, "");
  return a.length ? r.some((s) => s.test(a)) : !1;
}
const L = [
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
function Ne(e) {
  return L.find((t) => t.letter === e) || null;
}
function fe(e = "regular") {
  return e === "regular" ? L.filter((t) => !t.isFinal) : e === "final" ? L.filter((t) => t.isFinal) : L;
}
function Se(e, t = "regular") {
  const n = fe(t);
  return [...n].sort(() => Math.random() - 0.5).slice(0, Math.min(e, n.length));
}
const R = [
  { id: "kamatz", name: "קָמָץ", nameNikud: "קָמָץ", symbol: "ָ", sound: "אָ", color: "#FF6B6B", textColor: "#fff" },
  { id: "patah", name: "פֶּתַח", nameNikud: "פָּתַח", symbol: "ַ", sound: "אָ", color: "#FF8C42", textColor: "#fff" },
  { id: "hiriq", name: "חִירִיק", nameNikud: "חִירִיק", symbol: "ִ", sound: "אִי", color: "#4ECDC4", textColor: "#fff" },
  { id: "tzere", name: "צָרָה", nameNikud: "צֵרֶה", symbol: "ֵ", sound: "אֶ", color: "#45B7D1", textColor: "#fff" },
  { id: "segol", name: "סָגֹול", nameNikud: "סְגוֹל", symbol: "ֶ", sound: "אֶ", color: "#9B59B6", textColor: "#fff" },
  { id: "holam", name: "חוֹלֵם", nameNikud: "חוֹלָם", symbol: "ֹ", sound: "אֹ", color: "#2ECC71", textColor: "#fff" },
  { id: "kubbutz", name: "קֻובּוּץ", nameNikud: "קֻבּוּץ", symbol: "ֻ", sound: "אֻ", color: "#F39C12", textColor: "#fff" }
], Le = ["א", "ב", "ג", "ד", "מ", "נ", "ל", "ר", "ש", "ת", "פ", "ק"];
function Ee(e, t) {
  return e + t;
}
function Re(e) {
  let t = [...R];
  if (typeof window < "u" && window.location && window.location.search) {
    const r = new URLSearchParams(window.location.search), a = r.get("allowedNikud");
    if (a) {
      const i = a.split(",").map((o) => o.trim());
      t = t.filter(
        (o) => i.includes(o.id) || i.includes(o.name) || i.includes(o.nameNikud)
      );
    }
    const s = r.get("excludedNikud");
    if (s) {
      const i = s.split(",").map((o) => o.trim());
      t = t.filter(
        (o) => !i.includes(o.id) && !i.includes(o.name) && !i.includes(o.nameNikud)
      );
    }
  }
  t.length === 0 && (t = [...R]);
  let n = [...t];
  for (; n.length < e; )
    n.push(...t);
  return n.sort(() => Math.random() - 0.5).slice(0, e);
}
function Te(e, t, n) {
  e.innerHTML = "";
  const r = document.createElement("div");
  r.className = "option-cards-grid";
  const a = t.map((s) => {
    const i = document.createElement("button");
    return i.className = "option-card", i.dataset.id = s.id, i.innerHTML = `
      <span class="option-card__emoji">${s.emoji || ""}</span>
      <span class="option-card__text">${s.text}</span>
    `, i.addEventListener("click", () => {
      i.disabled || n(s);
    }), r.appendChild(i), { el: i, option: s };
  });
  return e.appendChild(r), {
    /** הַדָּגֵשׁ כַּרְטִיס לְפִי סוּג: 'correct' | 'wrong' | 'hint' */
    highlight(s, i) {
      a.forEach(({ el: o, option: c }) => {
        c.id === s && o.classList.add(`option-card--${i}`);
      });
    },
    /** נטרל את כל הכרטיסים */
    disable() {
      a.forEach(({ el: s }) => {
        s.disabled = !0;
      });
    },
    /** אפס את מצב הכרטיסים */
    reset() {
      a.forEach(({ el: s }) => {
        s.className = "option-card", s.disabled = !1;
      });
    },
    /** הסר את הרכיב */
    destroy() {
      e.innerHTML = "";
    }
  };
}
function Ce(e, t) {
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
    update(s) {
      const i = Math.round(s / t * 100);
      r.style.width = `${i}%`, a.textContent = `${s} / ${t}`, n.setAttribute("aria-valuenow", String(s));
    },
    /** הסר את הרכיב */
    destroy() {
      n.remove();
    }
  };
}
function $e(e) {
  const t = document.createElement("div");
  t.className = "feedback-message", t.setAttribute("aria-live", "polite"), t.setAttribute("role", "status"), e.appendChild(t);
  let n = null;
  function r(a, s, i = 1800) {
    clearTimeout(n), t.textContent = a, t.className = `feedback-message feedback-message--${s}`, n = setTimeout(() => {
      t.textContent = "", t.className = "feedback-message";
    }, i);
  }
  return {
    /** הצג משוב חיובי */
    correct(a = "!כָּל הַכָּבוֹד") {
      E.correct(), r(a, "correct"), S(t, "bounce");
    },
    /** הצג עידוד — נסה שוב */
    wrong(a = "נַסֵּה שׁוּב") {
      E.wrong(), r(a, "wrong"), S(t, "pulse");
    },
    /** הצג רמז */
    hint(a) {
      r(a, "hint"), S(t, "pulse");
    },
    /** הסר את הרכיב */
    destroy() {
      clearTimeout(n), t.remove();
    }
  };
}
function Fe(e, t) {
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
  let s = `
    <div style="background:white; padding:1.5rem; border-radius:1rem; min-width:300px; text-align:center; color:#333; font-family:Heebo,Arial; direction:rtl;">
      <h2 style="margin-top:0">בחר ניקוד</h2>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; margin:1rem 0; text-align:right;">
  `;
  R.forEach((l) => {
    const m = a.length === 0 || a.includes(l.id) || a.includes(l.name);
    s += `
      <label style="display:flex; align-items:center; gap:0.5rem; cursor:pointer;">
        <input type="checkbox" value="${l.id}" class="nikud-filter-cb" ${m ? "checked" : ""} style="width:1.2rem;height:1.2rem;">
        <span>${l.nameNikud}</span>
      </label>
    `;
  });
  const i = parseFloat(localStorage.getItem("alefbet.nikudRate")) || 0.5;
  s += `
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
  `, n.innerHTML = s, n.style.display = "flex";
  const o = document.getElementById("nikud-rate-slider"), c = document.getElementById("nikud-rate-val");
  o.oninput = () => {
    c.textContent = o.value;
  }, document.getElementById("save-settings-btn").onclick = () => {
    const l = parseFloat(o.value);
    localStorage.setItem("alefbet.nikudRate", l), le.setNikudEmphasis({ rate: l });
    const m = Array.from(n.querySelectorAll(".nikud-filter-cb")).filter((h) => h.checked).map((h) => h.value), p = new URL(window.location);
    m.length > 0 && m.length < R.length ? p.searchParams.set("allowedNikud", m.join(",")) : p.searchParams.delete("allowedNikud"), p.searchParams.delete("excludedNikud"), n.style.display = "none", window.history.replaceState({}, "", p), t && t(e);
  }, document.getElementById("close-settings-btn").onclick = () => {
    n.style.display = "none";
  };
}
function Ae(e) {
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
function Pe(e, t = "טוֹעֵן...") {
  e.innerHTML = `<div class="ab-loading">${t}</div>`;
}
function je(e) {
  e.innerHTML = "";
}
function We(e, t, n, r) {
  const a = e.querySelector(".game-header__spacer");
  if (!a) return null;
  const s = document.createElement("button");
  return s.className = "ab-header-btn", s.setAttribute("aria-label", n), s.textContent = t, s.onclick = r, a.innerHTML = "", a.appendChild(s), s;
}
function Ie(e, { size: t = "md" } = {}) {
  const n = document.createElement("div");
  n.className = `ab-nikud-box ab-nikud-box--${t} ab-nikud-box--${e.id}`;
  const r = document.createElement("div");
  r.className = "ab-nikud-box__box";
  const a = document.createElement("div");
  return a.className = "ab-nikud-box__mark", a.textContent = e.symbol, n.appendChild(r), n.appendChild(a), n;
}
let b = null, u = null, P = 0, j = 0;
const T = /* @__PURE__ */ new Map();
function D(e, t) {
  var n;
  return ((n = document.elementFromPoint(e, t)) == null ? void 0 : n.closest('[data-drop-target="true"]')) || null;
}
function pe(e, t, n) {
  const r = e.getBoundingClientRect();
  P = r.width / 2, j = r.height / 2, u = e.cloneNode(!0), Object.assign(u.style, {
    position: "fixed",
    left: `${t - P}px`,
    top: `${n - j}px`,
    width: `${r.width}px`,
    height: `${r.height}px`,
    pointerEvents: "none",
    // keeps it out of elementFromPoint + hit-testing
    zIndex: "9999",
    opacity: "0.85",
    transform: "scale(1.12)",
    cursor: "grabbing",
    margin: "0"
  }), document.body.appendChild(u);
}
function he(e, t) {
  u && (u.style.left = `${e - P}px`, u.style.top = `${t - j}px`);
}
function ge() {
  u == null || u.remove(), u = null;
}
let f = null;
function be(e) {
  f !== e && (f == null || f.classList.remove("drop-target--hover"), f = e, e == null || e.classList.add("drop-target--hover"));
}
function ye() {
  f == null || f.classList.remove("drop-target--hover"), f = null;
}
function Me(e, t) {
  e.classList.add("drag-source");
  let n = null, r = null, a = null;
  function s() {
    n && (e.removeEventListener("pointermove", n), e.removeEventListener("pointerup", r), e.removeEventListener("pointercancel", a), n = r = a = null), ye(), ge(), e.classList.remove("drag-source--dragging"), b = null;
  }
  function i(o) {
    o.button !== void 0 && o.button !== 0 || (o.preventDefault(), b && s(), b = { el: e, data: t }, e.classList.add("drag-source--dragging"), pe(e, o.clientX, o.clientY), e.setPointerCapture(o.pointerId), n = (c) => {
      he(c.clientX, c.clientY), be(D(c.clientX, c.clientY));
    }, r = (c) => {
      const l = D(c.clientX, c.clientY);
      s(), l && T.has(l) && T.get(l).onDrop({ data: t, sourceEl: e, targetEl: l });
    }, a = () => s(), e.addEventListener("pointermove", n), e.addEventListener("pointerup", r), e.addEventListener("pointercancel", a));
  }
  return e.addEventListener("pointerdown", i), {
    destroy() {
      e.removeEventListener("pointerdown", i), (b == null ? void 0 : b.el) === e && s(), e.classList.remove("drag-source");
    }
  };
}
function Be(e, t) {
  return e.setAttribute("data-drop-target", "true"), e.classList.add("drop-target--active"), T.set(e, { onDrop: t }), {
    destroy() {
      e.removeAttribute("data-drop-target"), e.classList.remove("drop-target--active", "drop-target--hover"), T.delete(e);
    }
  };
}
function He(e, t) {
  const n = [];
  function r() {
    try {
      const o = localStorage.getItem(e);
      return o === null ? t : JSON.parse(o);
    } catch {
      return t;
    }
  }
  function a(o) {
    try {
      localStorage.setItem(e, JSON.stringify(o));
    } catch (c) {
      console.warn(`[createLocalState] שגיאה בשמירת "${e}":`, c);
    }
    n.forEach((c) => c(o));
  }
  function s(o) {
    a(o(r()));
  }
  function i(o) {
    return n.push(o), function() {
      const l = n.indexOf(o);
      l !== -1 && n.splice(l, 1);
    };
  }
  return { get: r, set: a, update: s, subscribe: i };
}
function Ue(e, t = {}) {
  const {
    title: n = "",
    subtitle: r = "",
    tabs: a = [],
    homeUrl: s = null,
    onTabChange: i = null
  } = t;
  e.classList.add("ab-app");
  const o = s ? `<a href="${s}" class="ab-app-back-link" aria-label="דף הבית">🏠</a>` : "", c = r ? `<span class="ab-app-subtitle">${r}</span>` : '<span class="ab-app-subtitle"></span>', l = a.map(
    (d) => `<button class="ab-app-tab" data-tab="${d.id}" aria-selected="false" role="tab"><span class="ab-app-tab-icon">${d.icon}</span><span class="ab-app-tab-label">${d.label}</span></button>`
  ).join(""), m = a.map(
    (d) => `<button class="ab-app-nav-item" data-tab="${d.id}" aria-selected="false" role="tab"><span class="ab-app-nav-icon">${d.icon}</span><span class="ab-app-nav-label">${d.label}</span></button>`
  ).join("");
  e.innerHTML = `
    <header class="ab-app-header">
      <div class="ab-app-header-text">
        <h1 class="ab-app-title">${n}</h1>
        ${c}
      </div>
      ${o}
    </header>
    <nav class="ab-app-tabs" role="tablist" aria-label="ניווט ראשי">
      ${l}
    </nav>
    <main class="ab-app-content"></main>
    <nav class="ab-app-bottom-nav" role="tablist" aria-label="ניווט תחתון">
      ${m}
    </nav>
  `;
  const p = e.querySelector(".ab-app-subtitle"), h = e.querySelector(".ab-app-content");
  function W(d) {
    w(d), typeof i == "function" && i(d);
  }
  e.querySelectorAll(".ab-app-tab, .ab-app-nav-item").forEach((d) => {
    d.addEventListener("click", () => W(d.dataset.tab));
  });
  function w(d) {
    e.querySelectorAll(".ab-app-tab, .ab-app-nav-item").forEach((C) => {
      const I = C.dataset.tab === d;
      C.classList.toggle("ab-active", I), C.setAttribute("aria-selected", I ? "true" : "false");
    });
  }
  return a.length > 0 && w(a[0].id), {
    /** אלמנט תוכן הראשי — כאן מרנדרים את תוכן הטאב הנוכחי */
    contentEl: h,
    /**
     * עדכן את כותרת המשנה
     * @param {string} text - הטקסט החדש לכותרת המשנה
     */
    setSubtitle(d) {
      p.textContent = d;
    },
    /**
     * הגדר את הטאב הפעיל באופן תכנותי
     * @param {string} tabId - מזהה הטאב להפעלה
     */
    setActiveTab(d) {
      w(d);
    }
  };
}
export {
  X as EventBus,
  ke as GameShell,
  G as GameState,
  Q as addNikud,
  S as animate,
  Ue as createAppShell,
  Me as createDragSource,
  Be as createDropTarget,
  $e as createFeedback,
  He as createLocalState,
  Ie as createNikudBox,
  Te as createOptionCards,
  Ce as createProgressBar,
  ve as createRoundManager,
  _e as createSpeechListener,
  Ae as createZone,
  Ne as getLetter,
  fe as getLettersByGroup,
  Z as getNikud,
  L as hebrewLetters,
  je as hideLoadingScreen,
  We as injectHeaderButton,
  Ee as letterWithNikud,
  xe as matchNikudSound,
  Le as nikudBaseLetters,
  R as nikudList,
  we as preloadNikud,
  Se as randomLetters,
  Re as randomNikud,
  de as showCompletionScreen,
  Pe as showLoadingScreen,
  Fe as showNikudSettingsDialog,
  E as sounds,
  le as tts
};
