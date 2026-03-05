class P {
  constructor() {
    this._handlers = {};
  }
  /** הירשם לאירוע */
  on(e, n) {
    return this._handlers[e] || (this._handlers[e] = []), this._handlers[e].push(n), this;
  }
  /** בטל הרשמה לאירוע */
  off(e, n) {
    return this._handlers[e] ? (this._handlers[e] = this._handlers[e].filter((r) => r !== n), this) : this;
  }
  /** שלח אירוע */
  emit(e, n) {
    return (this._handlers[e] || []).slice().forEach((r) => r(n)), this;
  }
}
class z {
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
class se {
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
    }, this.events = new P(), this.state = new z(this.config.totalRounds), this._buildShell();
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
let h = null;
function B() {
  if (!h)
    try {
      h = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      return null;
    }
  return h.state === "suspended" && h.resume(), h;
}
function m(t, e, n = "sine", r = 0.3) {
  const a = B();
  if (a)
    try {
      const s = a.createOscillator(), i = a.createGain();
      s.connect(i), i.connect(a.destination), s.type = n, s.frequency.setValueAtTime(t, a.currentTime), i.gain.setValueAtTime(r, a.currentTime), i.gain.exponentialRampToValueAtTime(1e-3, a.currentTime + e), s.start(a.currentTime), s.stop(a.currentTime + e + 0.05);
    } catch {
    }
}
const _ = {
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
    [523.25, 587.33, 659.25, 698.46, 783.99, 1046.5].forEach((e, n) => setTimeout(() => m(e, 0.2), n * 90));
  },
  /** קליק עדין */
  click() {
    m(900, 0.04, "sine", 0.12);
  }
}, H = "https://nakdan-u1-0.loadbalancer.dicta.org.il/api", p = /* @__PURE__ */ new Map();
function q(t) {
  var n;
  let e = "";
  for (const r of t)
    if (r.sep)
      e += r.str ?? "";
    else {
      const a = (n = r.nakdan) == null ? void 0 : n.options;
      a != null && a.length ? e += (a[0].w ?? "").replace(/\|/g, "").replace(/\u05BD/g, "") : e += r.str ?? "";
    }
  return e;
}
async function I(t) {
  const e = await fetch(H, {
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
  if (!e.ok) throw new Error(`Nakdan ${e.status}`);
  const n = await e.json(), r = n == null ? void 0 : n.data;
  if (!Array.isArray(r)) throw new Error("Nakdan: invalid response");
  return q(r);
}
async function D(t) {
  if (!(t != null && t.trim())) return t ?? "";
  if (p.has(t)) return p.get(t);
  try {
    const e = await I(t);
    return p.set(t, e), e;
  } catch {
    return p.set(t, t), t;
  }
}
function U(t) {
  return p.get(t) ?? t ?? "";
}
async function ie(t) {
  const e = [...new Set(t.filter((n) => n == null ? void 0 : n.trim()))];
  await Promise.all(e.map((n) => D(n)));
}
let g = [], b = !1, $ = !0, E = 0.9;
function X(t) {
  return new Promise((e) => {
    try {
      const r = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(t)}&tl=he&client=tw-ob`, a = new Audio(r);
      a.playbackRate = E, a.onended = e, a.onerror = () => {
        k(t).then(e);
      }, a.play().catch(() => {
        k(t).then(e);
      });
    } catch {
      k(t).then(e);
    }
  });
}
let x = null;
function O() {
  const t = speechSynthesis.getVoices();
  return t.find((e) => e.lang === "he-IL") || t.find((e) => e.lang === "iw-IL") || t.find((e) => e.lang.startsWith("he")) || null;
}
function R() {
  x = O();
}
typeof speechSynthesis < "u" && (speechSynthesis.getVoices().length > 0 ? R() : speechSynthesis.addEventListener("voiceschanged", R, { once: !0 }));
function k(t) {
  return new Promise((e) => {
    if (typeof speechSynthesis > "u") {
      e();
      return;
    }
    const n = new SpeechSynthesisUtterance(t);
    n.lang = "he-IL", n.rate = E, x && (n.voice = x), n.onend = e, n.onerror = e, speechSynthesis.speak(n);
  });
}
function j() {
  if (b || g.length === 0) return;
  const t = g.shift();
  b = !0, ($ ? X : k)(t.text).then(() => {
    b = !1, t.resolve(), j();
  });
}
const V = {
  /**
   * הקרא טקסט עברי
   * משתמש ב-Google Translate TTS לאיכות טובה יותר
   */
  speak(t) {
    const e = U(t);
    return new Promise((n) => {
      g.push({ text: e, resolve: n }), j();
    });
  },
  /** עצור את הדיבור הנוכחי */
  cancel() {
    g.forEach((t) => t.resolve()), g = [], b = !1, typeof speechSynthesis < "u" && speechSynthesis.cancel();
  },
  get available() {
    return !0;
  },
  /** הגדר מהירות דיבור (0.5–2.0) */
  setRate(t) {
    E = Math.max(0.5, Math.min(2, t));
  },
  /** השתמש ב-Google Translate TTS (ברירת מחדל) או בדפדפן */
  useGoogle(t = !0) {
    $ = t;
  }
}, C = {
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
}, G = {
  shake: 420,
  bounce: 480,
  pulse: 600,
  fadeIn: 320,
  confetti: 700
};
function y(t, e) {
  !t || !C[e] || t.animate(C[e], {
    duration: G[e] || 400,
    easing: "ease-in-out",
    fill: "none"
  });
}
function Y(t, e, n, r) {
  _.cheer();
  const a = e / n, s = a >= 0.8 ? 3 : a >= 0.5 ? 2 : 1, i = "⭐".repeat(s) + "☆".repeat(3 - s), o = document.createElement("div");
  o.className = "completion-screen", o.innerHTML = `
    <div class="completion-screen__content">
      <div class="completion-screen__stars" aria-label="${s} כּוֹכָבִים">${i}</div>
      <h2 class="completion-screen__title">!כָּל הַכָּבוֹד</h2>
      <p class="completion-screen__score">נִיקּוּד: ${e} מִתּוֹךְ ${n}</p>
      <button class="completion-screen__replay btn btn--primary">שַׂחֵק שׁוּב</button>
    </div>
  `, o.querySelector(".completion-screen__replay").addEventListener("click", () => {
    o.remove(), r();
  }), t.innerHTML = "", t.appendChild(o), y(o.querySelector(".completion-screen__content"), "fadeIn");
}
function oe(t, e, {
  totalRounds: n,
  progressBar: r = null,
  buildRoundUI: a,
  onCorrect: s,
  onWrong: i
} = {}) {
  let o = !1;
  async function l(T) {
    if (o) return;
    o = !0, _.correct(), T && await T(), s && await s(), t.state.addScore(1), r == null || r.update(t.state.currentRound), await new Promise((M) => setTimeout(M, 1200)), t.state.nextRound() ? (o = !1, a()) : Y(e, t.state.score, n, () => {
      location.reload();
    });
  }
  async function c() {
    o || (o = !0, await V.speak("נסה שוב"), i && await i(), o = !1);
  }
  function W() {
    return o;
  }
  function A() {
    o = !1;
  }
  return { handleCorrect: l, handleWrong: c, isAnswered: W, reset: A };
}
const K = {
  kamatz: "ah",
  patah: "ah",
  tzere: "eh",
  segol: "eh",
  hiriq: "ee",
  holam: "oh",
  kubbutz: "oo",
  shva: "shva"
}, J = {
  ah: [/[אה]/, /^א$/, /אא/, /הא/],
  eh: [/[אה]/, /^א$/, /אא/, /הא/, /אה/],
  ee: [/[אי]/, /^י$/, /אי/, /הי/],
  oh: [/[או]/, /^[או]$/, /או/, /הו/],
  oo: [/[או]/, /^[או]$/, /או/, /הו/, /אוּ/],
  shva: [/[אה]/, /^א$/, /^$/, /אה/]
};
function le() {
  const t = typeof window < "u" ? window.SpeechRecognition || window.webkitSpeechRecognition : null, e = !!t;
  let n = null;
  return {
    available: e,
    listen(r = 4e3) {
      return e ? new Promise((a) => {
        n = new t(), n.lang = "he-IL", n.continuous = !1, n.interimResults = !1, n.maxAlternatives = 3;
        let s = !1;
        const i = (l, c) => {
          s || (s = !0, n = null, a({ text: l.trim(), confidence: c }));
        };
        n.onresult = (l) => {
          const c = l.results[0];
          c ? i(c[0].transcript, c[0].confidence) : i("", 0);
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
function ce(t, e) {
  if (!t || !e) return !1;
  const n = K[e];
  if (!n) return !1;
  const r = J[n];
  if (!r) return !1;
  const a = t.replace(/[\s.,!?]/g, "");
  return a.length ? r.some((s) => s.test(a)) : !1;
}
const w = [
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
function de(t) {
  return w.find((e) => e.letter === t) || null;
}
function Q(t = "regular") {
  return t === "regular" ? w.filter((e) => !e.isFinal) : t === "final" ? w.filter((e) => e.isFinal) : w;
}
function ue(t, e = "regular") {
  const n = Q(e);
  return [...n].sort(() => Math.random() - 0.5).slice(0, Math.min(t, n.length));
}
const v = [
  { id: "kamatz", name: "קָמָץ", nameNikud: "קָמָץ", symbol: "ָ", sound: "אָ", color: "#FF6B6B", textColor: "#fff" },
  { id: "patah", name: "פֶּתַח", nameNikud: "פָּתַח", symbol: "ַ", sound: "אָ", color: "#FF8C42", textColor: "#fff" },
  { id: "hiriq", name: "חִירִיק", nameNikud: "חִירִיק", symbol: "ִ", sound: "אִי", color: "#4ECDC4", textColor: "#fff" },
  { id: "tzere", name: "צָרָה", nameNikud: "צֵרֶה", symbol: "ֵ", sound: "אֶ", color: "#45B7D1", textColor: "#fff" },
  { id: "segol", name: "סָגֹול", nameNikud: "סְגוֹל", symbol: "ֶ", sound: "אֶ", color: "#9B59B6", textColor: "#fff" },
  { id: "holam", name: "חוֹלֵם", nameNikud: "חוֹלָם", symbol: "ֹ", sound: "אֹ", color: "#2ECC71", textColor: "#fff" },
  { id: "kubbutz", name: "קֻובּוּץ", nameNikud: "קֻבּוּץ", symbol: "ֻ", sound: "אֻ", color: "#F39C12", textColor: "#fff" },
  { id: "shva", name: "שָׁוְוא", nameNikud: "שְׁוָא", symbol: "ְ", sound: "אְ", color: "#95A5A6", textColor: "#fff" }
], me = ["א", "ב", "ג", "ד", "מ", "נ", "ל", "ר", "ש", "ת", "פ", "ק"];
function fe(t, e) {
  return t + e;
}
function he(t) {
  let e = [...v];
  if (typeof window < "u" && window.location && window.location.search) {
    const r = new URLSearchParams(window.location.search), a = r.get("allowedNikud");
    if (a) {
      const i = a.split(",").map((o) => o.trim());
      e = e.filter(
        (o) => i.includes(o.id) || i.includes(o.name) || i.includes(o.nameNikud)
      );
    }
    const s = r.get("excludedNikud");
    if (s) {
      const i = s.split(",").map((o) => o.trim());
      e = e.filter(
        (o) => !i.includes(o.id) && !i.includes(o.name) && !i.includes(o.nameNikud)
      );
    }
  }
  e.length === 0 && (e = [...v]);
  let n = [...e];
  for (; n.length < t; )
    n.push(...e);
  return n.sort(() => Math.random() - 0.5).slice(0, t);
}
function pe(t, e, n) {
  t.innerHTML = "";
  const r = document.createElement("div");
  r.className = "option-cards-grid";
  const a = e.map((s) => {
    const i = document.createElement("button");
    return i.className = "option-card", i.dataset.id = s.id, i.innerHTML = `
      <span class="option-card__emoji">${s.emoji || ""}</span>
      <span class="option-card__text">${s.text}</span>
    `, i.addEventListener("click", () => {
      i.disabled || n(s);
    }), r.appendChild(i), { el: i, option: s };
  });
  return t.appendChild(r), {
    /** הַדָּגֵשׁ כַּרְטִיס לְפִי סוּג: 'correct' | 'wrong' | 'hint' */
    highlight(s, i) {
      a.forEach(({ el: o, option: l }) => {
        l.id === s && o.classList.add(`option-card--${i}`);
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
      t.innerHTML = "";
    }
  };
}
function ge(t, e) {
  const n = document.createElement("div");
  n.className = "progress-bar", n.setAttribute("role", "progressbar"), n.setAttribute("aria-valuemin", "0"), n.setAttribute("aria-valuemax", String(e)), n.innerHTML = `
    <div class="progress-bar__track">
      <div class="progress-bar__fill" style="width: 0%"></div>
    </div>
    <span class="progress-bar__label">0 / ${e}</span>
  `, t.appendChild(n);
  const r = n.querySelector(".progress-bar__fill"), a = n.querySelector(".progress-bar__label");
  return {
    /** עדכן את ההתקדמות */
    update(s) {
      const i = Math.round(s / e * 100);
      r.style.width = `${i}%`, a.textContent = `${s} / ${e}`, n.setAttribute("aria-valuenow", String(s));
    },
    /** הסר את הרכיב */
    destroy() {
      n.remove();
    }
  };
}
function be(t) {
  const e = document.createElement("div");
  e.className = "feedback-message", e.setAttribute("aria-live", "polite"), e.setAttribute("role", "status"), t.appendChild(e);
  let n = null;
  function r(a, s, i = 1800) {
    clearTimeout(n), e.textContent = a, e.className = `feedback-message feedback-message--${s}`, n = setTimeout(() => {
      e.textContent = "", e.className = "feedback-message";
    }, i);
  }
  return {
    /** הצג משוב חיובי */
    correct(a = "!כָּל הַכָּבוֹד") {
      _.correct(), r(a, "correct"), y(e, "bounce");
    },
    /** הצג עידוד — נסה שוב */
    wrong(a = "נַסֵּה שׁוּב") {
      _.wrong(), r(a, "wrong"), y(e, "pulse");
    },
    /** הצג רמז */
    hint(a) {
      r(a, "hint"), y(e, "pulse");
    },
    /** הסר את הרכיב */
    destroy() {
      clearTimeout(n), e.remove();
    }
  };
}
function ke(t, e) {
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
  v.forEach((i) => {
    const o = a.length === 0 || a.includes(i.id) || a.includes(i.name);
    s += `
      <label style="display:flex; align-items:center; gap:0.5rem; cursor:pointer;">
        <input type="checkbox" value="${i.id}" class="nikud-filter-cb" ${o ? "checked" : ""} style="width:1.2rem;height:1.2rem;">
        <span>${i.nameNikud}</span>
      </label>
    `;
  }), s += `
      </div>
      <button id="save-settings-btn" style="padding:0.5rem 1rem; border-radius:0.5rem; background:#4f67ff; color:white; border:none; font-size:1.1rem; cursor:pointer;">שמור והתחל מחדש</button>
      <button id="close-settings-btn" style="padding:0.5rem 1rem; border-radius:0.5rem; background:#ddd; color:#333; border:none; font-size:1.1rem; cursor:pointer; margin-right:0.5rem;">ביטול</button>
    </div>
  `, n.innerHTML = s, n.style.display = "flex", document.getElementById("save-settings-btn").onclick = () => {
    const i = Array.from(n.querySelectorAll(".nikud-filter-cb")).filter((l) => l.checked).map((l) => l.value), o = new URL(window.location);
    i.length > 0 && i.length < v.length ? o.searchParams.set("allowedNikud", i.join(",")) : o.searchParams.delete("allowedNikud"), o.searchParams.delete("excludedNikud"), n.style.display = "none", window.history.replaceState({}, "", o), e && e(t);
  }, document.getElementById("close-settings-btn").onclick = () => {
    n.style.display = "none";
  };
}
function ye(t) {
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
    highlight(r) {
      e.classList.remove("ab-zone--correct", "ab-zone--hover"), r && e.classList.add(`ab-zone--${r}`);
    },
    reset() {
      e.classList.remove("ab-zone--correct", "ab-zone--hover");
    },
    destroy() {
      e.removeEventListener("click", n);
    }
  };
}
function we(t, e = "טוֹעֵן...") {
  t.innerHTML = `<div class="ab-loading">${e}</div>`;
}
function _e(t) {
  t.innerHTML = "";
}
function ve(t, e, n, r) {
  const a = t.querySelector(".game-header__spacer");
  if (!a) return null;
  const s = document.createElement("button");
  return s.className = "ab-header-btn", s.setAttribute("aria-label", n), s.textContent = e, s.onclick = r, a.innerHTML = "", a.appendChild(s), s;
}
let f = null, d = null, L = 0, S = 0;
const N = /* @__PURE__ */ new Map();
function F(t, e) {
  var n;
  return ((n = document.elementFromPoint(t, e)) == null ? void 0 : n.closest('[data-drop-target="true"]')) || null;
}
function Z(t, e, n) {
  const r = t.getBoundingClientRect();
  L = r.width / 2, S = r.height / 2, d = t.cloneNode(!0), Object.assign(d.style, {
    position: "fixed",
    left: `${e - L}px`,
    top: `${n - S}px`,
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
function ee(t, e) {
  d && (d.style.left = `${t - L}px`, d.style.top = `${e - S}px`);
}
function te() {
  d == null || d.remove(), d = null;
}
let u = null;
function ne(t) {
  u !== t && (u == null || u.classList.remove("drop-target--hover"), u = t, t == null || t.classList.add("drop-target--hover"));
}
function ae() {
  u == null || u.classList.remove("drop-target--hover"), u = null;
}
function Ne(t, e) {
  t.classList.add("drag-source");
  let n = null, r = null, a = null;
  function s() {
    n && (t.removeEventListener("pointermove", n), t.removeEventListener("pointerup", r), t.removeEventListener("pointercancel", a), n = r = a = null), ae(), te(), t.classList.remove("drag-source--dragging"), f = null;
  }
  function i(o) {
    o.button !== void 0 && o.button !== 0 || (o.preventDefault(), f && s(), f = { el: t, data: e }, t.classList.add("drag-source--dragging"), Z(t, o.clientX, o.clientY), t.setPointerCapture(o.pointerId), n = (l) => {
      ee(l.clientX, l.clientY), ne(F(l.clientX, l.clientY));
    }, r = (l) => {
      const c = F(l.clientX, l.clientY);
      s(), c && N.has(c) && N.get(c).onDrop({ data: e, sourceEl: t, targetEl: c });
    }, a = () => s(), t.addEventListener("pointermove", n), t.addEventListener("pointerup", r), t.addEventListener("pointercancel", a));
  }
  return t.addEventListener("pointerdown", i), {
    destroy() {
      t.removeEventListener("pointerdown", i), (f == null ? void 0 : f.el) === t && s(), t.classList.remove("drag-source");
    }
  };
}
function xe(t, e) {
  return t.setAttribute("data-drop-target", "true"), t.classList.add("drop-target--active"), N.set(t, { onDrop: e }), {
    destroy() {
      t.removeAttribute("data-drop-target"), t.classList.remove("drop-target--active", "drop-target--hover"), N.delete(t);
    }
  };
}
export {
  P as EventBus,
  se as GameShell,
  z as GameState,
  D as addNikud,
  y as animate,
  Ne as createDragSource,
  xe as createDropTarget,
  be as createFeedback,
  pe as createOptionCards,
  ge as createProgressBar,
  oe as createRoundManager,
  le as createSpeechListener,
  ye as createZone,
  de as getLetter,
  Q as getLettersByGroup,
  U as getNikud,
  w as hebrewLetters,
  _e as hideLoadingScreen,
  ve as injectHeaderButton,
  fe as letterWithNikud,
  ce as matchNikudSound,
  me as nikudBaseLetters,
  v as nikudList,
  ie as preloadNikud,
  ue as randomLetters,
  he as randomNikud,
  Y as showCompletionScreen,
  we as showLoadingScreen,
  ke as showNikudSettingsDialog,
  _ as sounds,
  V as tts
};
