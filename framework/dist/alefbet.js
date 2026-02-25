class y {
  constructor() {
    this._handlers = {};
  }
  /** הירשם לאירוע */
  on(e, n) {
    return this._handlers[e] || (this._handlers[e] = []), this._handlers[e].push(n), this;
  }
  /** בטל הרשמה לאירוע */
  off(e, n) {
    return this._handlers[e] ? (this._handlers[e] = this._handlers[e].filter((i) => i !== n), this) : this;
  }
  /** שלח אירוע */
  emit(e, n) {
    return (this._handlers[e] || []).slice().forEach((i) => i(n)), this;
  }
}
class N {
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
class W {
  /**
   * @param {HTMLElement} containerEl - אלמנט המיכל
   * @param {object} config - הגדרות: { totalRounds, title }
   */
  constructor(e, n = {}) {
    this.container = e, this.config = { totalRounds: 8, title: "משחק", ...n }, this.events = new y(), this.state = new N(this.config.totalRounds), this._buildShell();
  }
  _buildShell() {
    this.container.classList.add("alefbet-game"), this.container.innerHTML = `
      <div class="game-header">
        <h1 class="game-title"></h1>
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
let f = null, b = 0.9, h = [], d = !1;
function v() {
  const t = speechSynthesis.getVoices();
  return t.find((e) => e.lang === "he-IL") || t.find((e) => e.lang === "iw-IL") || t.find((e) => e.lang.startsWith("he")) || null;
}
function g() {
  f = v();
}
typeof speechSynthesis < "u" && (speechSynthesis.getVoices().length > 0 ? g() : speechSynthesis.addEventListener("voiceschanged", g, { once: !0 }));
function p() {
  if (d || h.length === 0) return;
  const t = h.shift(), e = new SpeechSynthesisUtterance(t);
  e.lang = "he-IL", e.rate = b, f && (e.voice = f), e.onend = () => {
    d = !1, p();
  }, e.onerror = () => {
    d = !1, p();
  }, d = !0, speechSynthesis.speak(e);
}
const T = {
  /** הקרא טקסט עברי */
  speak(t) {
    typeof speechSynthesis > "u" || (h.push(t), p());
  },
  /** עצור את הדיבור הנוכחי */
  cancel() {
    typeof speechSynthesis > "u" || (h = [], d = !1, speechSynthesis.cancel());
  },
  /** האם קריאת טקסט זמינה? */
  get available() {
    return typeof speechSynthesis < "u";
  },
  /** הגדר מהירות דיבור (0.5–2.0, ברירת מחדל 0.9) */
  setRate(t) {
    b = Math.max(0.5, Math.min(2, t));
  }
};
let c = null;
function F() {
  if (!c)
    try {
      c = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      return null;
    }
  return c.state === "suspended" && c.resume(), c;
}
function l(t, e, n = "sine", i = 0.3) {
  const a = F();
  if (a)
    try {
      const s = a.createOscillator(), r = a.createGain();
      s.connect(r), r.connect(a.destination), s.type = n, s.frequency.setValueAtTime(t, a.currentTime), r.gain.setValueAtTime(i, a.currentTime), r.gain.exponentialRampToValueAtTime(1e-3, a.currentTime + e), s.start(a.currentTime), s.stop(a.currentTime + e + 0.05);
    } catch {
    }
}
const _ = {
  /** צליל תשובה נכונה */
  correct() {
    l(523.25, 0.15), setTimeout(() => l(659.25, 0.2), 120), setTimeout(() => l(783.99, 0.3), 240);
  },
  /** צליל תשובה שגויה */
  wrong() {
    l(220, 0.25, "sawtooth", 0.2), setTimeout(() => l(165, 0.3, "sawtooth", 0.15), 200);
  },
  /** צליל עידוד - סיום מוצלח */
  cheer() {
    [523.25, 587.33, 659.25, 698.46, 783.99, 1046.5].forEach((e, n) => setTimeout(() => l(e, 0.2), n * 90));
  },
  /** קליק עדין */
  click() {
    l(900, 0.04, "sine", 0.12);
  }
}, u = [
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
function R(t) {
  return u.find((e) => e.letter === t) || null;
}
function j(t = "regular") {
  return t === "regular" ? u.filter((e) => !e.isFinal) : t === "final" ? u.filter((e) => e.isFinal) : u;
}
function w(t, e = "regular") {
  const n = j(e);
  return [...n].sort(() => Math.random() - 0.5).slice(0, Math.min(t, n.length));
}
function E(t, e, n) {
  t.innerHTML = "";
  const i = document.createElement("div");
  i.className = "option-cards-grid";
  const a = e.map((s) => {
    const r = document.createElement("button");
    return r.className = "option-card", r.dataset.id = s.id, r.innerHTML = `
      <span class="option-card__emoji">${s.emoji || ""}</span>
      <span class="option-card__text">${s.text}</span>
    `, r.addEventListener("click", () => {
      r.disabled || n(s);
    }), i.appendChild(r), { el: r, option: s };
  });
  return t.appendChild(i), {
    /** הדגש כרטיס לפי סוג: 'correct' | 'wrong' | 'hint' */
    highlight(s, r) {
      a.forEach(({ el: o, option: k }) => {
        k.id === s && o.classList.add(`option-card--${r}`);
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
function L(t, e) {
  const n = document.createElement("div");
  n.className = "progress-bar", n.setAttribute("role", "progressbar"), n.setAttribute("aria-valuemin", "0"), n.setAttribute("aria-valuemax", String(e)), n.innerHTML = `
    <div class="progress-bar__track">
      <div class="progress-bar__fill" style="width: 0%"></div>
    </div>
    <span class="progress-bar__label">0 / ${e}</span>
  `, t.appendChild(n);
  const i = n.querySelector(".progress-bar__fill"), a = n.querySelector(".progress-bar__label");
  return {
    /** עדכן את ההתקדמות */
    update(s) {
      const r = Math.round(s / e * 100);
      i.style.width = `${r}%`, a.textContent = `${s} / ${e}`, n.setAttribute("aria-valuenow", String(s));
    },
    /** הסר את הרכיב */
    destroy() {
      n.remove();
    }
  };
}
const x = {
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
}, S = {
  shake: 420,
  bounce: 480,
  pulse: 600,
  fadeIn: 320,
  confetti: 700
};
function m(t, e) {
  !t || !x[e] || t.animate(x[e], {
    duration: S[e] || 400,
    easing: "ease-in-out",
    fill: "none"
  });
}
function C(t) {
  const e = document.createElement("div");
  e.className = "feedback-message", e.setAttribute("aria-live", "polite"), e.setAttribute("role", "status"), t.appendChild(e);
  let n = null;
  function i(a, s, r = 1800) {
    clearTimeout(n), e.textContent = a, e.className = `feedback-message feedback-message--${s}`, n = setTimeout(() => {
      e.textContent = "", e.className = "feedback-message";
    }, r);
  }
  return {
    /** הצג משוב חיובי */
    correct(a = "!כל הכבוד") {
      _.correct(), i(a, "correct"), m(e, "bounce");
    },
    /** הצג משוב שלילי */
    wrong(a = "נסה שוב") {
      _.wrong(), i(a, "wrong"), m(e, "shake");
    },
    /** הצג רמז */
    hint(a) {
      i(a, "hint"), m(e, "pulse");
    },
    /** הסר את הרכיב */
    destroy() {
      clearTimeout(n), e.remove();
    }
  };
}
function M(t, e, n, i) {
  _.cheer();
  const a = e / n, s = a >= 0.8 ? 3 : a >= 0.5 ? 2 : 1, r = "⭐".repeat(s) + "☆".repeat(3 - s), o = document.createElement("div");
  o.className = "completion-screen", o.innerHTML = `
    <div class="completion-screen__content">
      <div class="completion-screen__stars" aria-label="${s} כוכבים">${r}</div>
      <h2 class="completion-screen__title">!כל הכבוד</h2>
      <p class="completion-screen__score">ניקוד: ${e} מתוך ${n}</p>
      <button class="completion-screen__replay btn btn--primary">שחק שוב</button>
    </div>
  `, o.querySelector(".completion-screen__replay").addEventListener("click", () => {
    o.remove(), i();
  }), t.innerHTML = "", t.appendChild(o), m(o.querySelector(".completion-screen__content"), "fadeIn");
}
export {
  y as EventBus,
  W as GameShell,
  N as GameState,
  m as animate,
  C as createFeedback,
  E as createOptionCards,
  L as createProgressBar,
  R as getLetter,
  j as getLettersByGroup,
  u as hebrewLetters,
  w as randomLetters,
  M as showCompletionScreen,
  _ as sounds,
  T as tts
};
