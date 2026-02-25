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
class U {
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
let _ = null, F = 0.9, g = [], f = !1;
function S() {
  const t = speechSynthesis.getVoices();
  return t.find((e) => e.lang === "he-IL") || t.find((e) => e.lang === "iw-IL") || t.find((e) => e.lang.startsWith("he")) || null;
}
function L() {
  _ = S();
}
typeof speechSynthesis < "u" && (speechSynthesis.getVoices().length > 0 ? L() : speechSynthesis.addEventListener("voiceschanged", L, { once: !0 }));
function x() {
  if (f || g.length === 0) return;
  const t = g.shift(), e = new SpeechSynthesisUtterance(t);
  e.lang = "he-IL", e.rate = F, _ && (e.voice = _), e.onend = () => {
    f = !1, x();
  }, e.onerror = () => {
    f = !1, x();
  }, f = !0, speechSynthesis.speak(e);
}
const Y = {
  /** הקרא טקסט עברי */
  speak(t) {
    typeof speechSynthesis > "u" || (g.push(t), x());
  },
  /** עצור את הדיבור הנוכחי */
  cancel() {
    typeof speechSynthesis > "u" || (g = [], f = !1, speechSynthesis.cancel());
  },
  /** האם קריאת טקסט זמינה? */
  get available() {
    return typeof speechSynthesis < "u";
  },
  /** הגדר מהירות דיבור (0.5–2.0, ברירת מחדל 0.9) */
  setRate(t) {
    F = Math.max(0.5, Math.min(2, t));
  }
};
let m = null;
function B() {
  if (!m)
    try {
      m = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      return null;
    }
  return m.state === "suspended" && m.resume(), m;
}
function u(t, e, n = "sine", s = 0.3) {
  const o = B();
  if (o)
    try {
      const r = o.createOscillator(), i = o.createGain();
      r.connect(i), i.connect(o.destination), r.type = n, r.frequency.setValueAtTime(t, o.currentTime), i.gain.setValueAtTime(s, o.currentTime), i.gain.exponentialRampToValueAtTime(1e-3, o.currentTime + e), r.start(o.currentTime), r.stop(o.currentTime + e + 0.05);
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
}, h = [
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
function z(t) {
  return h.find((e) => e.letter === t) || null;
}
function $(t = "regular") {
  return t === "regular" ? h.filter((e) => !e.isFinal) : t === "final" ? h.filter((e) => e.isFinal) : h;
}
function P(t, e = "regular") {
  const n = $(e);
  return [...n].sort(() => Math.random() - 0.5).slice(0, Math.min(t, n.length));
}
const A = [
  { id: "kamatz", name: "קמץ", symbol: "ָ", sound: "אָ", color: "#FF6B6B", textColor: "#fff" },
  { id: "patah", name: "פתח", symbol: "ַ", sound: "אַ", color: "#FF8C42", textColor: "#fff" },
  { id: "hiriq", name: "חיריק", symbol: "ִ", sound: "אִי", color: "#4ECDC4", textColor: "#fff" },
  { id: "tzere", name: "צרה", symbol: "ֵ", sound: "אֵ", color: "#45B7D1", textColor: "#fff" },
  { id: "segol", name: "סגול", symbol: "ֶ", sound: "אֶ", color: "#9B59B6", textColor: "#fff" },
  { id: "holam", name: "חולם", symbol: "ֹ", sound: "אֹ", color: "#2ECC71", textColor: "#fff" },
  { id: "kubbutz", name: "קובוץ", symbol: "ֻ", sound: "אֻ", color: "#F39C12", textColor: "#fff" },
  { id: "shva", name: "שווא", symbol: "ְ", sound: "אְ", color: "#95A5A6", textColor: "#fff" }
], G = ["א", "ב", "ג", "ד", "מ", "נ", "ל", "ר", "ש", "ת", "פ", "ק"];
function O(t, e) {
  return t + e;
}
function K(t) {
  return [...A].sort(() => Math.random() - 0.5).slice(0, t);
}
function Q(t, e, n) {
  t.innerHTML = "";
  const s = document.createElement("div");
  s.className = "option-cards-grid";
  const o = e.map((r) => {
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
      o.forEach(({ el: c, option: T }) => {
        T.id === r && c.classList.add(`option-card--${i}`);
      });
    },
    /** נטרל את כל הכרטיסים */
    disable() {
      o.forEach(({ el: r }) => {
        r.disabled = !0;
      });
    },
    /** אפס את מצב הכרטיסים */
    reset() {
      o.forEach(({ el: r }) => {
        r.className = "option-card", r.disabled = !1;
      });
    },
    /** הסר את הרכיב */
    destroy() {
      t.innerHTML = "";
    }
  };
}
function J(t, e) {
  const n = document.createElement("div");
  n.className = "progress-bar", n.setAttribute("role", "progressbar"), n.setAttribute("aria-valuemin", "0"), n.setAttribute("aria-valuemax", String(e)), n.innerHTML = `
    <div class="progress-bar__track">
      <div class="progress-bar__fill" style="width: 0%"></div>
    </div>
    <span class="progress-bar__label">0 / ${e}</span>
  `, t.appendChild(n);
  const s = n.querySelector(".progress-bar__fill"), o = n.querySelector(".progress-bar__label");
  return {
    /** עדכן את ההתקדמות */
    update(r) {
      const i = Math.round(r / e * 100);
      s.style.width = `${i}%`, o.textContent = `${r} / ${e}`, n.setAttribute("aria-valuenow", String(r));
    },
    /** הסר את הרכיב */
    destroy() {
      n.remove();
    }
  };
}
const N = {
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
}, M = {
  shake: 420,
  bounce: 480,
  pulse: 600,
  fadeIn: 320,
  confetti: 700
};
function p(t, e) {
  !t || !N[e] || t.animate(N[e], {
    duration: M[e] || 400,
    easing: "ease-in-out",
    fill: "none"
  });
}
function Z(t) {
  const e = document.createElement("div");
  e.className = "feedback-message", e.setAttribute("aria-live", "polite"), e.setAttribute("role", "status"), t.appendChild(e);
  let n = null;
  function s(o, r, i = 1800) {
    clearTimeout(n), e.textContent = o, e.className = `feedback-message feedback-message--${r}`, n = setTimeout(() => {
      e.textContent = "", e.className = "feedback-message";
    }, i);
  }
  return {
    /** הצג משוב חיובי */
    correct(o = "!כל הכבוד") {
      b.correct(), s(o, "correct"), p(e, "bounce");
    },
    /** הצג משוב שלילי */
    wrong(o = "נסה שוב") {
      b.wrong(), s(o, "wrong"), p(e, "shake");
    },
    /** הצג רמז */
    hint(o) {
      s(o, "hint"), p(e, "pulse");
    },
    /** הסר את הרכיב */
    destroy() {
      clearTimeout(n), e.remove();
    }
  };
}
function ee(t, e, n, s) {
  b.cheer();
  const o = e / n, r = o >= 0.8 ? 3 : o >= 0.5 ? 2 : 1, i = "⭐".repeat(r) + "☆".repeat(3 - r), c = document.createElement("div");
  c.className = "completion-screen", c.innerHTML = `
    <div class="completion-screen__content">
      <div class="completion-screen__stars" aria-label="${r} כוכבים">${i}</div>
      <h2 class="completion-screen__title">!כל הכבוד</h2>
      <p class="completion-screen__score">ניקוד: ${e} מתוך ${n}</p>
      <button class="completion-screen__replay btn btn--primary">שחק שוב</button>
    </div>
  `, c.querySelector(".completion-screen__replay").addEventListener("click", () => {
    c.remove(), s();
  }), t.innerHTML = "", t.appendChild(c), p(c.querySelector(".completion-screen__content"), "fadeIn");
}
let a = null, l = null, v = 0, y = 0;
const k = /* @__PURE__ */ new Map();
function C(t, e) {
  var s;
  l && (l.style.pointerEvents = "none");
  const n = ((s = document.elementFromPoint(t, e)) == null ? void 0 : s.closest('[data-drop-target="true"]')) || null;
  return l && (l.style.pointerEvents = ""), n;
}
function X(t, e, n) {
  const s = t.getBoundingClientRect();
  v = s.width / 2, y = s.height / 2, l = t.cloneNode(!0), Object.assign(l.style, {
    position: "fixed",
    left: `${e - v}px`,
    top: `${n - y}px`,
    width: `${s.width}px`,
    height: `${s.height}px`,
    pointerEvents: "none",
    zIndex: "9999",
    opacity: "0.9",
    transform: "scale(1.12)",
    transition: "transform 0.1s",
    cursor: "grabbing"
  }), document.body.appendChild(l);
}
function q(t, e) {
  l && (l.style.left = `${t - v}px`, l.style.top = `${e - y}px`);
}
function D() {
  l == null || l.remove(), l = null;
}
let d = null;
function H(t) {
  d !== t && (d == null || d.classList.remove("drop-target--hover"), d = t, t == null || t.classList.add("drop-target--hover"));
}
function I() {
  d == null || d.classList.remove("drop-target--hover"), d = null;
}
function E(t) {
  q(t.clientX, t.clientY), H(C(t.clientX, t.clientY));
}
function w(t) {
  I();
  const e = C(t.clientX, t.clientY);
  V(e), j();
}
function V(t) {
  if (!a || !t) return;
  const e = k.get(t);
  e && e.onDrop({
    data: a.data,
    sourceEl: a.el,
    targetEl: t
  });
}
function j() {
  a && a.el.classList.remove("drag-source--dragging"), D(), a = null, document.removeEventListener("pointermove", E), document.removeEventListener("pointerup", w);
}
function te(t, e) {
  t.classList.add("drag-source");
  function n(s) {
    if (!(s.button !== void 0 && s.button !== 0)) {
      if (s.preventDefault(), !s.pointerType || s.pointerType === "touch") {
        if ((a == null ? void 0 : a.el) === t) {
          t.classList.remove("drag-source--selected"), a = null;
          return;
        }
        a == null || a.el.classList.remove("drag-source--selected"), a = { el: t, data: e }, t.classList.add("drag-source--selected");
        return;
      }
      a == null || a.el.classList.remove("drag-source--selected"), a = { el: t, data: e }, t.classList.add("drag-source--dragging"), X(t, s.clientX, s.clientY), document.addEventListener("pointermove", E), document.addEventListener("pointerup", w);
    }
  }
  return t.addEventListener("pointerdown", n), {
    destroy() {
      t.removeEventListener("pointerdown", n), t.classList.remove("drag-source", "drag-source--dragging", "drag-source--selected"), (a == null ? void 0 : a.el) === t && (j(), a = null);
    }
  };
}
function ne(t, e) {
  t.setAttribute("data-drop-target", "true"), t.classList.add("drop-target--active"), k.set(t, { onDrop: e });
  function n(s) {
    a && s.pointerType !== "mouse" && (e({
      data: a.data,
      sourceEl: a.el,
      targetEl: t
    }), a.el.classList.remove("drag-source--selected"), a = null);
  }
  return t.addEventListener("pointerup", n), {
    destroy() {
      t.removeAttribute("data-drop-target"), t.classList.remove("drop-target--active", "drop-target--hover"), k.delete(t), t.removeEventListener("pointerup", n);
    }
  };
}
export {
  W as EventBus,
  U as GameShell,
  R as GameState,
  p as animate,
  te as createDragSource,
  ne as createDropTarget,
  Z as createFeedback,
  Q as createOptionCards,
  J as createProgressBar,
  z as getLetter,
  $ as getLettersByGroup,
  h as hebrewLetters,
  O as letterWithNikud,
  G as nikudBaseLetters,
  A as nikudList,
  P as randomLetters,
  K as randomNikud,
  ee as showCompletionScreen,
  b as sounds,
  Y as tts
};
