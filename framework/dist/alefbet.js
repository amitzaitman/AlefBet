class W {
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
class R {
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
class K {
  /**
   * @param {HTMLElement} containerEl - אלמנט המיכל
   * @param {object} config - הגדרות: { totalRounds, title, homeUrl }
   */
  constructor(e, n = {}) {
    this.container = e, this.config = {
      totalRounds: 8,
      title: "משחק",
      homeUrl: "../../index.html",
      ...n
    }, this.events = new W(), this.state = new R(this.config.totalRounds), this._buildShell();
  }
  _buildShell() {
    this.container.classList.add("alefbet-game");
    const e = this.config.homeUrl ? `<a href="${this.config.homeUrl}" class="game-back-btn" aria-label="ספריית משחקים">🏠</a>` : '<div class="game-header__spacer"></div>';
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
const A = "https://nakdan-u1-0.loadbalancer.dicta.org.il/api", f = /* @__PURE__ */ new Map();
function $(t) {
  var n;
  let e = "";
  for (const s of t)
    if (s.sep)
      e += s.str ?? "";
    else {
      const a = (n = s.nakdan) == null ? void 0 : n.options;
      a != null && a.length ? e += (a[0].w ?? "").replace(/\|/g, "") : e += s.str ?? "";
    }
  return e;
}
async function B(t) {
  const e = await fetch(A, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      addmorph: !0,
      keepmetagim: !0,
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
  return $(s);
}
async function M(t) {
  if (!(t != null && t.trim())) return t ?? "";
  if (f.has(t)) return f.get(t);
  try {
    const e = await B(t);
    return f.set(t, e), e;
  } catch {
    return f.set(t, t), t;
  }
}
function q(t) {
  return f.get(t) ?? t ?? "";
}
async function J(t) {
  const e = [...new Set(t.filter((n) => n == null ? void 0 : n.trim()))];
  await Promise.all(e.map((n) => M(n)));
}
let k = null, C = 0.9, _ = [], h = !1;
function D() {
  const t = speechSynthesis.getVoices();
  return t.find((e) => e.lang === "he-IL") || t.find((e) => e.lang === "iw-IL") || t.find((e) => e.lang.startsWith("he")) || null;
}
function w() {
  k = D();
}
typeof speechSynthesis < "u" && (speechSynthesis.getVoices().length > 0 ? w() : speechSynthesis.addEventListener("voiceschanged", w, { once: !0 }));
function y() {
  if (h || _.length === 0) return;
  const t = _.shift(), e = new SpeechSynthesisUtterance(t);
  e.lang = "he-IL", e.rate = C, k && (e.voice = k), e.onend = () => {
    h = !1, y();
  }, e.onerror = () => {
    h = !1, y();
  }, h = !0, speechSynthesis.speak(e);
}
const Q = {
  /**
   * הקרא טקסט עברי
   * אם הטקסט נמצא במטמון הניקוד — ישתמש בגרסה המנוקדת לשיפור ההגייה
   */
  speak(t) {
    if (typeof speechSynthesis > "u") return;
    const e = q(t);
    _.push(e), y();
  },
  /** עצור את הדיבור הנוכחי */
  cancel() {
    typeof speechSynthesis > "u" || (_ = [], h = !1, speechSynthesis.cancel());
  },
  get available() {
    return typeof speechSynthesis < "u";
  },
  /** הגדר מהירות דיבור (0.5–2.0) */
  setRate(t) {
    C = Math.max(0.5, Math.min(2, t));
  }
};
let m = null;
function I() {
  if (!m)
    try {
      m = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      return null;
    }
  return m.state === "suspended" && m.resume(), m;
}
function u(t, e, n = "sine", s = 0.3) {
  const a = I();
  if (a)
    try {
      const r = a.createOscillator(), i = a.createGain();
      r.connect(i), i.connect(a.destination), r.type = n, r.frequency.setValueAtTime(t, a.currentTime), i.gain.setValueAtTime(s, a.currentTime), i.gain.exponentialRampToValueAtTime(1e-3, a.currentTime + e), r.start(a.currentTime), r.stop(a.currentTime + e + 0.05);
    } catch {
    }
}
const b = {
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
}, p = [
  { letter: "א", name: "אלף", nameNikud: "אָלֶף", sound: "", exampleWord: "אריה", emoji: "🦁", isFinal: !1 },
  { letter: "ב", name: "בית", nameNikud: "בֵּית", sound: "b", exampleWord: "בית", emoji: "🏠", isFinal: !1 },
  { letter: "ג", name: "גימל", nameNikud: "גִּימֶל", sound: "g", exampleWord: "גמל", emoji: "🐪", isFinal: !1 },
  { letter: "ד", name: "דלת", nameNikud: "דָּלֶת", sound: "d", exampleWord: "דג", emoji: "🐟", isFinal: !1 },
  { letter: "ה", name: "הא", nameNikud: "הֵא", sound: "h", exampleWord: "הר", emoji: "⛰️", isFinal: !1 },
  { letter: "ו", name: "וו", nameNikud: "וָו", sound: "v", exampleWord: "ורד", emoji: "🌹", isFinal: !1 },
  { letter: "ז", name: "זין", nameNikud: "זַיִן", sound: "z", exampleWord: "זאב", emoji: "🐺", isFinal: !1 },
  { letter: "ח", name: "חית", nameNikud: "חֵית", sound: "ch", exampleWord: "חתול", emoji: "🐱", isFinal: !1 },
  { letter: "ט", name: "טית", nameNikud: "טֵית", sound: "t", exampleWord: "טלה", emoji: "🐑", isFinal: !1 },
  { letter: "י", name: "יוד", nameNikud: "יוֹד", sound: "y", exampleWord: "יונה", emoji: "🕊️", isFinal: !1 },
  { letter: "כ", name: "כף", nameNikud: "כַּף", sound: "k", exampleWord: "כלב", emoji: "🐕", isFinal: !1 },
  { letter: "ך", name: "כף סופית", nameNikud: "כַּף סוֹפִית", sound: "k", exampleWord: "מלך", emoji: "👑", isFinal: !0 },
  { letter: "ל", name: "למד", nameNikud: "לָמֶד", sound: "l", exampleWord: "לב", emoji: "❤️", isFinal: !1 },
  { letter: "מ", name: "מם", nameNikud: "מֵם", sound: "m", exampleWord: "מים", emoji: "💧", isFinal: !1 },
  { letter: "ם", name: "מם סופית", nameNikud: "מֵם סוֹפִית", sound: "m", exampleWord: "שמים", emoji: "🌤️", isFinal: !0 },
  { letter: "נ", name: "נון", nameNikud: "נוּן", sound: "n", exampleWord: "נחש", emoji: "🐍", isFinal: !1 },
  { letter: "ן", name: "נון סופית", nameNikud: "נוּן סוֹפִית", sound: "n", exampleWord: "גן", emoji: "🌳", isFinal: !0 },
  { letter: "ס", name: "סמך", nameNikud: "סָמֶךְ", sound: "s", exampleWord: "סוס", emoji: "🐎", isFinal: !1 },
  { letter: "ע", name: "עין", nameNikud: "עַיִן", sound: "", exampleWord: "עיט", emoji: "🦅", isFinal: !1 },
  { letter: "פ", name: "פא", nameNikud: "פֵּא", sound: "p", exampleWord: "פיל", emoji: "🐘", isFinal: !1 },
  { letter: "ף", name: "פא סופית", nameNikud: "פֵּא סוֹפִית", sound: "p", exampleWord: "אף", emoji: "👃", isFinal: !0 },
  { letter: "צ", name: "צדי", nameNikud: "צַדִּי", sound: "ts", exampleWord: "צב", emoji: "🐢", isFinal: !1 },
  { letter: "ץ", name: "צדי סופית", nameNikud: "צַדִּי סוֹפִית", sound: "ts", exampleWord: "עץ", emoji: "🌲", isFinal: !0 },
  { letter: "ק", name: "קוף", nameNikud: "קוֹף", sound: "k", exampleWord: "קוף", emoji: "🐒", isFinal: !1 },
  { letter: "ר", name: "ריש", nameNikud: "רֵישׁ", sound: "r", exampleWord: "רכב", emoji: "🚗", isFinal: !1 },
  { letter: "ש", name: "שין", nameNikud: "שִׁין", sound: "sh", exampleWord: "שמש", emoji: "☀️", isFinal: !1 },
  { letter: "ת", name: "תו", nameNikud: "תָּו", sound: "t", exampleWord: "תפוח", emoji: "🍎", isFinal: !1 }
];
function Z(t) {
  return p.find((e) => e.letter === t) || null;
}
function X(t = "regular") {
  return t === "regular" ? p.filter((e) => !e.isFinal) : t === "final" ? p.filter((e) => e.isFinal) : p;
}
function ee(t, e = "regular") {
  const n = X(e);
  return [...n].sort(() => Math.random() - 0.5).slice(0, Math.min(t, n.length));
}
const H = [
  { id: "kamatz", name: "קמץ", nameNikud: "קָמַץ", symbol: "ָ", sound: "אָ", color: "#FF6B6B", textColor: "#fff" },
  { id: "patah", name: "פתח", nameNikud: "פַּתַח", symbol: "ַ", sound: "אַ", color: "#FF8C42", textColor: "#fff" },
  { id: "hiriq", name: "חיריק", nameNikud: "חִירִיק", symbol: "ִ", sound: "אִי", color: "#4ECDC4", textColor: "#fff" },
  { id: "tzere", name: "צרה", nameNikud: "צֵרֶה", symbol: "ֵ", sound: "אֵ", color: "#45B7D1", textColor: "#fff" },
  { id: "segol", name: "סגול", nameNikud: "סְגוֹל", symbol: "ֶ", sound: "אֶ", color: "#9B59B6", textColor: "#fff" },
  { id: "holam", name: "חולם", nameNikud: "חוֹלָם", symbol: "ֹ", sound: "אֹ", color: "#2ECC71", textColor: "#fff" },
  { id: "kubbutz", name: "קובוץ", nameNikud: "קֻבּוּץ", symbol: "ֻ", sound: "אֻ", color: "#F39C12", textColor: "#fff" },
  { id: "shva", name: "שווא", nameNikud: "שְׁוָא", symbol: "ְ", sound: "אְ", color: "#95A5A6", textColor: "#fff" }
], te = ["א", "ב", "ג", "ד", "מ", "נ", "ל", "ר", "ש", "ת", "פ", "ק"];
function ne(t, e) {
  return t + e;
}
function se(t) {
  return [...H].sort(() => Math.random() - 0.5).slice(0, t);
}
function ae(t, e, n) {
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
    /** הדגש כרטיס לפי סוג: 'correct' | 'wrong' | 'hint' */
    highlight(r, i) {
      a.forEach(({ el: c, option: T }) => {
        T.id === r && c.classList.add(`option-card--${i}`);
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
function re(t, e) {
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
const L = {
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
}, P = {
  shake: 420,
  bounce: 480,
  pulse: 600,
  fadeIn: 320,
  confetti: 700
};
function g(t, e) {
  !t || !L[e] || t.animate(L[e], {
    duration: P[e] || 400,
    easing: "ease-in-out",
    fill: "none"
  });
}
function ie(t) {
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
    correct(a = "!כל הכבוד") {
      b.correct(), s(a, "correct"), g(e, "bounce");
    },
    /** הצג משוב שלילי */
    wrong(a = "נסה שוב") {
      b.wrong(), s(a, "wrong"), g(e, "shake");
    },
    /** הצג רמז */
    hint(a) {
      s(a, "hint"), g(e, "pulse");
    },
    /** הסר את הרכיב */
    destroy() {
      clearTimeout(n), e.remove();
    }
  };
}
function oe(t, e, n, s) {
  b.cheer();
  const a = e / n, r = a >= 0.8 ? 3 : a >= 0.5 ? 2 : 1, i = "⭐".repeat(r) + "☆".repeat(3 - r), c = document.createElement("div");
  c.className = "completion-screen", c.innerHTML = `
    <div class="completion-screen__content">
      <div class="completion-screen__stars" aria-label="${r} כוכבים">${i}</div>
      <h2 class="completion-screen__title">!כל הכבוד</h2>
      <p class="completion-screen__score">ניקוד: ${e} מתוך ${n}</p>
      <button class="completion-screen__replay btn btn--primary">שחק שוב</button>
    </div>
  `, c.querySelector(".completion-screen__replay").addEventListener("click", () => {
    c.remove(), s();
  }), t.innerHTML = "", t.appendChild(c), g(c.querySelector(".completion-screen__content"), "fadeIn");
}
let l = null, o = null, v = 0, x = 0;
const N = /* @__PURE__ */ new Map();
function F(t, e) {
  var s;
  o && (o.style.display = "none");
  const n = ((s = document.elementFromPoint(t, e)) == null ? void 0 : s.closest('[data-drop-target="true"]')) || null;
  return o && (o.style.display = ""), n;
}
function V(t, e, n) {
  const s = t.getBoundingClientRect();
  v = s.width / 2, x = s.height / 2, o = t.cloneNode(!0), Object.assign(o.style, {
    position: "fixed",
    left: `${e - v}px`,
    top: `${n - x}px`,
    width: `${s.width}px`,
    height: `${s.height}px`,
    pointerEvents: "none",
    zIndex: "9999",
    opacity: "0.85",
    transform: "scale(1.12)",
    cursor: "grabbing",
    margin: "0"
  }), document.body.appendChild(o);
}
function z(t, e) {
  o && (o.style.left = `${t - v}px`, o.style.top = `${e - x}px`);
}
function U() {
  o == null || o.remove(), o = null;
}
let d = null;
function Y(t) {
  d !== t && (d == null || d.classList.remove("drop-target--hover"), d = t, t == null || t.classList.add("drop-target--hover"));
}
function O() {
  d == null || d.classList.remove("drop-target--hover"), d = null;
}
function j(t) {
  z(t.clientX, t.clientY), Y(F(t.clientX, t.clientY));
}
function S(t) {
  O();
  const e = F(t.clientX, t.clientY);
  G(e), E();
}
function G(t) {
  if (!l || !t) return;
  const e = N.get(t);
  e && e.onDrop({
    data: l.data,
    sourceEl: l.el,
    targetEl: t
  });
}
function E() {
  l && l.el.classList.remove("drag-source--dragging"), U(), l = null, document.removeEventListener("pointermove", j), document.removeEventListener("pointerup", S);
}
function le(t, e) {
  t.classList.add("drag-source");
  function n(s) {
    var a;
    s.button !== void 0 && s.button !== 0 || (s.preventDefault(), (a = t.hasPointerCapture) != null && a.call(t, s.pointerId) && t.releasePointerCapture(s.pointerId), l == null || l.el.classList.remove("drag-source--dragging"), l = { el: t, data: e }, t.classList.add("drag-source--dragging"), V(t, s.clientX, s.clientY), document.addEventListener("pointermove", j), document.addEventListener("pointerup", S));
  }
  return t.addEventListener("pointerdown", n), {
    destroy() {
      t.removeEventListener("pointerdown", n), t.classList.remove("drag-source", "drag-source--dragging"), (l == null ? void 0 : l.el) === t && E();
    }
  };
}
function de(t, e) {
  return t.setAttribute("data-drop-target", "true"), t.classList.add("drop-target--active"), N.set(t, { onDrop: e }), {
    destroy() {
      t.removeAttribute("data-drop-target"), t.classList.remove("drop-target--active", "drop-target--hover"), N.delete(t);
    }
  };
}
export {
  W as EventBus,
  K as GameShell,
  R as GameState,
  M as addNikud,
  g as animate,
  le as createDragSource,
  de as createDropTarget,
  ie as createFeedback,
  ae as createOptionCards,
  re as createProgressBar,
  Z as getLetter,
  X as getLettersByGroup,
  q as getNikud,
  p as hebrewLetters,
  ne as letterWithNikud,
  te as nikudBaseLetters,
  H as nikudList,
  J as preloadNikud,
  ee as randomLetters,
  se as randomNikud,
  oe as showCompletionScreen,
  b as sounds,
  Q as tts
};
