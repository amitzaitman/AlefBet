class R {
  constructor() {
    this._handlers = {};
  }
  /** הירשם לאירוע */
  on(e, n) {
    return this._handlers[e] || (this._handlers[e] = []), this._handlers[e].push(n), this;
  }
  /** בטל הרשמה לאירוע */
  off(e, n) {
    return this._handlers[e] ? (this._handlers[e] = this._handlers[e].filter((s) => s !== n), this) : this;
  }
  /** שלח אירוע */
  emit(e, n) {
    return (this._handlers[e] || []).slice().forEach((s) => s(n)), this;
  }
}
class T {
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
class z {
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
    }, this.events = new R(), this.state = new T(this.config.totalRounds), this._buildShell();
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
const W = "https://nakdan-u1-0.loadbalancer.dicta.org.il/api", h = /* @__PURE__ */ new Map();
function A(t) {
  var n;
  let e = "";
  for (const s of t)
    if (s.sep)
      e += s.str ?? "";
    else {
      const a = (n = s.nakdan) == null ? void 0 : n.options;
      a != null && a.length ? e += (a[0].w ?? "").replace(/\|/g, "").replace(/\u05BD/g, "") : e += s.str ?? "";
    }
  return e;
}
async function B(t) {
  const e = await fetch(W, {
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
  const n = await e.json(), s = n == null ? void 0 : n.data;
  if (!Array.isArray(s)) throw new Error("Nakdan: invalid response");
  return A(s);
}
async function $(t) {
  if (!(t != null && t.trim())) return t ?? "";
  if (h.has(t)) return h.get(t);
  try {
    const e = await B(t);
    return h.set(t, e), e;
  } catch {
    return h.set(t, t), t;
  }
}
function M(t) {
  return h.get(t) ?? t ?? "";
}
async function O(t) {
  const e = [...new Set(t.filter((n) => n == null ? void 0 : n.trim()))];
  await Promise.all(e.map((n) => $(n)));
}
let v = null, j = 0.9, g = [], p = !1;
function q() {
  const t = speechSynthesis.getVoices();
  return t.find((e) => e.lang === "he-IL") || t.find((e) => e.lang === "iw-IL") || t.find((e) => e.lang.startsWith("he")) || null;
}
function F() {
  v = q();
}
typeof speechSynthesis < "u" && (speechSynthesis.getVoices().length > 0 ? F() : speechSynthesis.addEventListener("voiceschanged", F, { once: !0 }));
function N() {
  if (p || g.length === 0) return;
  const t = g.shift(), e = new SpeechSynthesisUtterance(t.text);
  e.lang = "he-IL", e.rate = j, v && (e.voice = v), e.onend = () => {
    p = !1, t.resolve(), N();
  }, e.onerror = () => {
    p = !1, t.resolve(), N();
  }, p = !0, speechSynthesis.speak(e);
}
const G = {
  /**
   * הקרא טקסט עברי
   * אם הטקסט נמצא במטמון הניקוד — ישתמש בגרסה המנוקדת לשיפור ההגייה
   */
  speak(t) {
    if (typeof speechSynthesis > "u") return Promise.resolve();
    const e = M(t);
    return new Promise((n) => {
      g.push({ text: e, resolve: n }), N();
    });
  },
  /** עצור את הדיבור הנוכחי */
  cancel() {
    typeof speechSynthesis > "u" || (g.forEach((t) => t.resolve()), g = [], p = !1, speechSynthesis.cancel());
  },
  get available() {
    return typeof speechSynthesis < "u";
  },
  /** הגדר מהירות דיבור (0.5–2.0) */
  setRate(t) {
    j = Math.max(0.5, Math.min(2, t));
  }
};
let f = null;
function H() {
  if (!f)
    try {
      f = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      return null;
    }
  return f.state === "suspended" && f.resume(), f;
}
function u(t, e, n = "sine", s = 0.3) {
  const a = H();
  if (a)
    try {
      const r = a.createOscillator(), i = a.createGain();
      r.connect(i), i.connect(a.destination), r.type = n, r.frequency.setValueAtTime(t, a.currentTime), i.gain.setValueAtTime(s, a.currentTime), i.gain.exponentialRampToValueAtTime(1e-3, a.currentTime + e), r.start(a.currentTime), r.stop(a.currentTime + e + 0.05);
    } catch {
    }
}
const x = {
  /** צליל תשובה נכונה */
  correct() {
    u(523.25, 0.15), setTimeout(() => u(659.25, 0.2), 120), setTimeout(() => u(783.99, 0.3), 240);
  },
  /** צליל תשובה שגויה */
  wrong() {
    u(220, 0.25, "sawtooth", 0.2), setTimeout(() => u(165, 0.3, "sawtooth", 0.15), 200);
  },
  /** צליל עידוד - סיום מוצלח */
  cheer() {
    [523.25, 587.33, 659.25, 698.46, 783.99, 1046.5].forEach((e, n) => setTimeout(() => u(e, 0.2), n * 90));
  },
  /** קליק עדין */
  click() {
    u(900, 0.04, "sine", 0.12);
  }
}, _ = [
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
function K(t) {
  return _.find((e) => e.letter === t) || null;
}
function D(t = "regular") {
  return t === "regular" ? _.filter((e) => !e.isFinal) : t === "final" ? _.filter((e) => e.isFinal) : _;
}
function J(t, e = "regular") {
  const n = D(e);
  return [...n].sort(() => Math.random() - 0.5).slice(0, Math.min(t, n.length));
}
const C = [
  { id: "kamatz", name: "קָמָץ", nameNikud: "קָמָץ", symbol: "ָ", sound: "אָ", color: "#FF6B6B", textColor: "#fff" },
  { id: "patah", name: "פֶּתַח", nameNikud: "פָּתַח", symbol: "ַ", sound: "אָ", color: "#FF8C42", textColor: "#fff" },
  { id: "hiriq", name: "חִירִיק", nameNikud: "חִירִיק", symbol: "ִ", sound: "אִי", color: "#4ECDC4", textColor: "#fff" },
  { id: "tzere", name: "צָרָה", nameNikud: "צֵרֶה", symbol: "ֵ", sound: "אֶ", color: "#45B7D1", textColor: "#fff" },
  { id: "segol", name: "סָגֹול", nameNikud: "סְגוֹל", symbol: "ֶ", sound: "אֶ", color: "#9B59B6", textColor: "#fff" },
  { id: "holam", name: "חוֹלֵם", nameNikud: "חוֹלָם", symbol: "ֹ", sound: "אֹ", color: "#2ECC71", textColor: "#fff" },
  { id: "kubbutz", name: "קֻובּוּץ", nameNikud: "קֻבּוּץ", symbol: "ֻ", sound: "אֻ", color: "#F39C12", textColor: "#fff" },
  { id: "shva", name: "שָׁוְוא", nameNikud: "שְׁוָא", symbol: "ְ", sound: "אְ", color: "#95A5A6", textColor: "#fff" }
], Q = ["א", "ב", "ג", "ד", "מ", "נ", "ל", "ר", "ש", "ת", "פ", "ק"];
function Z(t, e) {
  return t + e;
}
function ee(t) {
  let e = [...C];
  if (typeof window < "u" && window.location && window.location.search) {
    const s = new URLSearchParams(window.location.search), a = s.get("allowedNikud");
    if (a) {
      const i = a.split(",").map((o) => o.trim());
      e = e.filter(
        (o) => i.includes(o.id) || i.includes(o.name) || i.includes(o.nameNikud)
      );
    }
    const r = s.get("excludedNikud");
    if (r) {
      const i = r.split(",").map((o) => o.trim());
      e = e.filter(
        (o) => !i.includes(o.id) && !i.includes(o.name) && !i.includes(o.nameNikud)
      );
    }
  }
  e.length === 0 && (e = [...C]);
  let n = [...e];
  for (; n.length < t; )
    n.push(...e);
  return n.sort(() => Math.random() - 0.5).slice(0, t);
}
function te(t, e, n) {
  t.innerHTML = "";
  const s = document.createElement("div");
  s.className = "option-cards-grid";
  const a = e.map((r) => {
    const i = document.createElement("button");
    return i.className = "option-card", i.dataset.id = r.id, i.innerHTML = `
      <span class="option-card__emoji">${r.emoji || ""}</span>
      <span class="option-card__text">${r.text}</span>
    `, i.addEventListener("click", () => {
      i.disabled || n(r);
    }), s.appendChild(i), { el: i, option: r };
  });
  return t.appendChild(s), {
    /** הַדָּגֵשׁ כַּרְטִיס לְפִי סוּג: 'correct' | 'wrong' | 'hint' */
    highlight(r, i) {
      a.forEach(({ el: o, option: d }) => {
        d.id === r && o.classList.add(`option-card--${i}`);
      });
    },
    /** נטרל את כל הכרטיסים */
    disable() {
      a.forEach(({ el: r }) => {
        r.disabled = !0;
      });
    },
    /** אפס את מצב הכרטיסים */
    reset() {
      a.forEach(({ el: r }) => {
        r.className = "option-card", r.disabled = !1;
      });
    },
    /** הסר את הרכיב */
    destroy() {
      t.innerHTML = "";
    }
  };
}
function ne(t, e) {
  const n = document.createElement("div");
  n.className = "progress-bar", n.setAttribute("role", "progressbar"), n.setAttribute("aria-valuemin", "0"), n.setAttribute("aria-valuemax", String(e)), n.innerHTML = `
    <div class="progress-bar__track">
      <div class="progress-bar__fill" style="width: 0%"></div>
    </div>
    <span class="progress-bar__label">0 / ${e}</span>
  `, t.appendChild(n);
  const s = n.querySelector(".progress-bar__fill"), a = n.querySelector(".progress-bar__label");
  return {
    /** עדכן את ההתקדמות */
    update(r) {
      const i = Math.round(r / e * 100);
      s.style.width = `${i}%`, a.textContent = `${r} / ${e}`, n.setAttribute("aria-valuenow", String(r));
    },
    /** הסר את הרכיב */
    destroy() {
      n.remove();
    }
  };
}
const E = {
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
}, X = {
  shake: 420,
  bounce: 480,
  pulse: 600,
  fadeIn: 320,
  confetti: 700
};
function y(t, e) {
  !t || !E[e] || t.animate(E[e], {
    duration: X[e] || 400,
    easing: "ease-in-out",
    fill: "none"
  });
}
function se(t) {
  const e = document.createElement("div");
  e.className = "feedback-message", e.setAttribute("aria-live", "polite"), e.setAttribute("role", "status"), t.appendChild(e);
  let n = null;
  function s(a, r, i = 1800) {
    clearTimeout(n), e.textContent = a, e.className = `feedback-message feedback-message--${r}`, n = setTimeout(() => {
      e.textContent = "", e.className = "feedback-message";
    }, i);
  }
  return {
    /** הצג משוב חיובי */
    correct(a = "!כָּל הַכָּבוֹד") {
      x.correct(), s(a, "correct"), y(e, "bounce");
    },
    /** הצג משוב שלילי */
    wrong(a = "נַסֵּה שׁוּב") {
      x.wrong(), s(a, "wrong"), y(e, "shake");
    },
    /** הצג רמז */
    hint(a) {
      s(a, "hint"), y(e, "pulse");
    },
    /** הסר את הרכיב */
    destroy() {
      clearTimeout(n), e.remove();
    }
  };
}
function ae(t, e, n, s) {
  x.cheer();
  const a = e / n, r = a >= 0.8 ? 3 : a >= 0.5 ? 2 : 1, i = "⭐".repeat(r) + "☆".repeat(3 - r), o = document.createElement("div");
  o.className = "completion-screen", o.innerHTML = `
    <div class="completion-screen__content">
      <div class="completion-screen__stars" aria-label="${r} כּוֹכָבִים">${i}</div>
      <h2 class="completion-screen__title">!כָּל הַכָּבוֹד</h2>
      <p class="completion-screen__score">נִיקּוּד: ${e} מִתּוֹךְ ${n}</p>
      <button class="completion-screen__replay btn btn--primary">שַׂחֵק שׁוּב</button>
    </div>
  `, o.querySelector(".completion-screen__replay").addEventListener("click", () => {
    o.remove(), s();
  }), t.innerHTML = "", t.appendChild(o), y(o.querySelector(".completion-screen__content"), "fadeIn");
}
let m = null, l = null, w = 0, L = 0;
const b = /* @__PURE__ */ new Map();
function S(t, e) {
  var n;
  return ((n = document.elementFromPoint(t, e)) == null ? void 0 : n.closest('[data-drop-target="true"]')) || null;
}
function P(t, e, n) {
  const s = t.getBoundingClientRect();
  w = s.width / 2, L = s.height / 2, l = t.cloneNode(!0), Object.assign(l.style, {
    position: "fixed",
    left: `${e - w}px`,
    top: `${n - L}px`,
    width: `${s.width}px`,
    height: `${s.height}px`,
    pointerEvents: "none",
    // keeps it out of elementFromPoint + hit-testing
    zIndex: "9999",
    opacity: "0.85",
    transform: "scale(1.12)",
    cursor: "grabbing",
    margin: "0"
  }), document.body.appendChild(l);
}
function I(t, e) {
  l && (l.style.left = `${t - w}px`, l.style.top = `${e - L}px`);
}
function V() {
  l == null || l.remove(), l = null;
}
let c = null;
function U(t) {
  c !== t && (c == null || c.classList.remove("drop-target--hover"), c = t, t == null || t.classList.add("drop-target--hover"));
}
function Y() {
  c == null || c.classList.remove("drop-target--hover"), c = null;
}
function re(t, e) {
  t.classList.add("drag-source");
  let n = null, s = null, a = null;
  function r() {
    n && (t.removeEventListener("pointermove", n), t.removeEventListener("pointerup", s), t.removeEventListener("pointercancel", a), n = s = a = null), Y(), V(), t.classList.remove("drag-source--dragging"), m = null;
  }
  function i(o) {
    o.button !== void 0 && o.button !== 0 || (o.preventDefault(), m && r(), m = { el: t, data: e }, t.classList.add("drag-source--dragging"), P(t, o.clientX, o.clientY), t.setPointerCapture(o.pointerId), n = (d) => {
      I(d.clientX, d.clientY), U(S(d.clientX, d.clientY));
    }, s = (d) => {
      const k = S(d.clientX, d.clientY);
      r(), k && b.has(k) && b.get(k).onDrop({ data: e, sourceEl: t, targetEl: k });
    }, a = () => r(), t.addEventListener("pointermove", n), t.addEventListener("pointerup", s), t.addEventListener("pointercancel", a));
  }
  return t.addEventListener("pointerdown", i), {
    destroy() {
      t.removeEventListener("pointerdown", i), (m == null ? void 0 : m.el) === t && r(), t.classList.remove("drag-source");
    }
  };
}
function ie(t, e) {
  return t.setAttribute("data-drop-target", "true"), t.classList.add("drop-target--active"), b.set(t, { onDrop: e }), {
    destroy() {
      t.removeAttribute("data-drop-target"), t.classList.remove("drop-target--active", "drop-target--hover"), b.delete(t);
    }
  };
}
export {
  R as EventBus,
  z as GameShell,
  T as GameState,
  $ as addNikud,
  y as animate,
  re as createDragSource,
  ie as createDropTarget,
  se as createFeedback,
  te as createOptionCards,
  ne as createProgressBar,
  K as getLetter,
  D as getLettersByGroup,
  M as getNikud,
  _ as hebrewLetters,
  Z as letterWithNikud,
  Q as nikudBaseLetters,
  C as nikudList,
  O as preloadNikud,
  J as randomLetters,
  ee as randomNikud,
  ae as showCompletionScreen,
  x as sounds,
  G as tts
};
