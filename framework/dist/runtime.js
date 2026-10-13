class ze {
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
class Ue {
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
}
const Ge = "alefbet-zoom-lock", pe = /* @__PURE__ */ new WeakSet();
function ie(e) {
  e.cancelable && e.preventDefault();
}
function Qe(e) {
  const t = (
    /** @type {TouchEvent} */
    e.touches
  );
  t && t.length > 1 && ie(e);
}
function Xe(e = typeof document < "u" ? document : null) {
  if (!e || pe.has(e)) return !1;
  pe.add(e), e.documentElement.classList.add(Ge);
  const t = { passive: !1 };
  return e.addEventListener("gesturestart", ie, t), e.addEventListener("gesturechange", ie, t), e.addEventListener("touchmove", Qe, t), !0;
}
const $ = /* @__PURE__ */ new WeakMap();
function xe(e) {
  var t;
  (t = $.get(e)) == null || t.end();
}
class Ye {
  /**
   * @param {HTMLElement} containerEl - אלמנט המיכל
   * @param {object} config - הגדרות: { totalRounds, title, homeUrl }
   */
  constructor(t, n = {}) {
    xe(t), $.set(t, this), this.ended = !1, this._timers = /* @__PURE__ */ new Set(), this.container = t, this.config = {
      totalRounds: 8,
      title: "מִשְׂחָק",
      homeUrl: "../../index.html",
      ...n
    }, this.events = new ze(), this.state = new Ue(this.config.totalRounds), this.gameId = typeof n.gameId == "string" ? n.gameId : "", this._buildShell();
  }
  _buildShell() {
    this.container.classList.add("alefbet-game"), Xe(this.container.ownerDocument);
    const t = this.config.homeUrl ? `<a href="${this.config.homeUrl}" class="game-back-btn" aria-label="סִפְרִיַּית מִשְׂחָקִים">🏠</a>` : "";
    this.container.innerHTML = `
      <div class="game-header">
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
    this.ended || (this.state.nextRound(), this.events.emit("start", { state: this.state }));
  }
  /** עבור לסיבוב הבא */
  nextRound() {
    if (this.ended) return !1;
    const t = this.state.nextRound();
    return t ? this.events.emit("round", { state: this.state }) : this.end(this.state.score), t;
  }
  /** סיים את המשחק */
  end(t = this.state.score) {
    if (!this.ended) {
      this.ended = !0;
      for (const n of this._timers) clearTimeout(n);
      this._timers.clear(), $.get(this.container) === this && $.delete(this.container), this.events.emit("end", { score: t, state: this.state });
    }
  }
  /** פעולה מושהית מתבטלת אוטומטית בסיום או בהפעלה מחדש. */
  schedule(t, n) {
    if (this.ended) return;
    const r = setTimeout(() => {
      this._timers.delete(r), this.ended || t();
    }, n);
    this._timers.add(r);
  }
  /** המתנה מתבטלת בסיום; false אומר שאין להמשיך בפעולה. */
  delay(t) {
    return new Promise((n) => {
      if (this.ended) {
        n(!1);
        return;
      }
      const r = () => n(!1);
      this.events.on("end", r), this.schedule(() => {
        this.events.off("end", r), n(!0);
      }, t);
    });
  }
  /** הירשם לאירועי מחזור החיים: start, round, end */
  on(t, n) {
    return this.events.on(t, n), this;
  }
}
function Ke() {
  const e = new AbortController(), t = /* @__PURE__ */ new Set();
  function n(r) {
    e.signal.aborted ? r() : t.add(r);
  }
  return {
    signal: e.signal,
    /** @template {(() => void) | { destroy: () => void }} T @param {T} resource @returns {T} */
    use(r) {
      return n(typeof r == "function" ? r : () => r.destroy()), r;
    },
    /** @param {EventTarget} target @param {string} event @param {EventListener} handler @param {AddEventListenerOptions | boolean} [options] */
    listen(r, o, a, i) {
      e.signal.aborted || (r.addEventListener(o, a, i), n(() => r.removeEventListener(o, a, i)));
    },
    schedule(r, o) {
      if (e.signal.aborted) return () => {
      };
      const a = () => {
        clearTimeout(i), t.delete(a);
      }, i = setTimeout(() => {
        t.delete(a), e.signal.aborted || r();
      }, o);
      return n(a), a;
    },
    dispose() {
      if (e.signal.aborted) return;
      e.abort();
      const r = [...t].reverse();
      t.clear();
      for (const o of r)
        try {
          o();
        } catch (a) {
          console.warn("Round cleanup failed", a);
        }
    }
  };
}
let Z = null;
function Ze() {
  return typeof window > "u" ? null : window.AudioContext || /** @type {any} */
  window.webkitAudioContext || null;
}
function Y() {
  const e = Ze();
  if (!e) return null;
  if (!Z)
    try {
      Z = new e();
    } catch {
      return null;
    }
  return Z;
}
async function Je() {
  const e = Y();
  if (!e) return !1;
  try {
    e.state === "suspended" && await e.resume();
  } catch {
  }
  try {
    const t = e.createBuffer(1, 1, e.sampleRate || 44100), n = e.createBufferSource();
    n.buffer = t, n.connect(e.destination), n.start(0);
  } catch {
  }
  return e.state === "running";
}
async function le() {
  const e = Y();
  if (!e) return null;
  if (e.state === "suspended")
    try {
      await e.resume();
    } catch {
    }
  return e.state === "running" ? e : null;
}
function et(e) {
  return typeof e.arrayBuffer == "function" ? e.arrayBuffer() : new Promise((t, n) => {
    const r = new FileReader();
    r.onload = () => t(
      /** @type {ArrayBuffer} */
      r.result
    ), r.onerror = () => n(r.error), r.readAsArrayBuffer(e);
  });
}
async function tt(e, { signal: t } = {}) {
  if (t != null && t.aborted || !e) return !1;
  const n = await le();
  if (t != null && t.aborted || !n || typeof n.decodeAudioData != "function") return !1;
  let r;
  try {
    const o = await et(e);
    r = await new Promise((a, i) => {
      const s = n.decodeAudioData(o, a, i);
      s && typeof s.then == "function" && s.then(a, i);
    });
  } catch {
    return !1;
  }
  return t != null && t.aborted ? !1 : new Promise((o) => {
    let a, i, s = !1;
    const c = (l) => {
      if (!s) {
        if (s = !0, clearTimeout(i), t == null || t.removeEventListener("abort", u), a) {
          a.onended = null;
          try {
            a.stop(), a.disconnect();
          } catch {
          }
        }
        o(l);
      }
    }, u = () => c(!1);
    try {
      a = n.createBufferSource(), a.buffer = r, a.connect(n.destination), a.onended = () => c(!0), t == null || t.addEventListener("abort", u, { once: !0 }), i = setTimeout(() => c(!0), (r.duration + 0.5) * 1e3), a.start(0);
    } catch {
      c(!1);
    }
  });
}
function nt() {
  const e = Y();
  return e ? (e.state === "suspended" && e.resume(), e) : null;
}
function R(e, t, n = "sine", r = 0.3) {
  const o = nt();
  if (o)
    try {
      const a = o.createOscillator(), i = o.createGain();
      a.connect(i), i.connect(o.destination), a.type = n, a.frequency.setValueAtTime(e, o.currentTime), i.gain.setValueAtTime(r, o.currentTime), i.gain.exponentialRampToValueAtTime(1e-3, o.currentTime + t), a.start(o.currentTime), a.stop(o.currentTime + t + 0.05);
    } catch {
    }
}
const G = {
  /** צליל תשובה נכונה */
  correct() {
    R(523.25, 0.15), setTimeout(() => R(659.25, 0.2), 120), setTimeout(() => R(783.99, 0.3), 240);
  },
  /** צליל עידוד עדין — נסה שוב */
  wrong() {
    R(350, 0.15, "triangle", 0.12);
  },
  /** צליל עידוד - סיום מוצלח */
  cheer() {
    [523.25, 587.33, 659.25, 698.46, 783.99, 1046.5].forEach((t, n) => setTimeout(() => R(t, 0.2), n * 90));
  },
  /** קליק עדין */
  click() {
    R(900, 0.04, "sine", 0.12);
  }
}, ye = {
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
}, rt = {
  shake: 420,
  bounce: 480,
  pulse: 600,
  fadeIn: 320,
  confetti: 700
};
function q(e, t) {
  !e || !ye[t] || e.animate(ye[t], {
    duration: rt[t] || 400,
    easing: "ease-in-out",
    fill: "none"
  });
}
function ot(e, t) {
  function n() {
    try {
      const a = localStorage.getItem(e);
      return a === null ? t : JSON.parse(a);
    } catch {
      return t;
    }
  }
  function r(a) {
    try {
      localStorage.setItem(e, JSON.stringify(a));
    } catch (i) {
      return console.warn(`[createLocalState] שגיאה בשמירת "${e}":`, i), !1;
    }
    return !0;
  }
  function o(a) {
    return r(a(n()));
  }
  return { get: n, set: r, update: o };
}
const it = "alefbet.progress.v1", at = ot(it, {});
function Ae(e, t) {
  if (!Number.isFinite(e) || !Number.isFinite(t) || t <= 0) return 1;
  const n = e / t;
  return n >= 0.8 ? 3 : n >= 0.5 ? 2 : 1;
}
function st(e, { score: t, total: n }) {
  if (!e || !Number.isFinite(t) || !Number.isFinite(n) || n <= 0) return null;
  const r = Ae(t, n);
  let o = null;
  return at.update((a) => {
    const i = a[e];
    return o = {
      plays: ((i == null ? void 0 : i.plays) ?? 0) + 1,
      bestScore: Math.max((i == null ? void 0 : i.bestScore) ?? 0, t),
      bestStars: Math.max((i == null ? void 0 : i.bestStars) ?? 0, r),
      total: i && (i.bestScore ?? 0) > t ? i.total : n,
      lastPlayed: Date.now()
    }, { ...a, [e]: o };
  }), o;
}
function ct(e, t, n, r, o = {}) {
  G.cheer(), o.gameId && st(o.gameId, { score: t, total: n });
  const a = o.completionOnly ? n === 1 ? "הִשְׁלַמְתֶּם מְשִׂימָה!" : `הִשְׁלַמְתֶּם ${n} מְשִׂימוֹת!` : `נִיקּוּד: ${t} מִתּוֹךְ ${n}`, i = Ae(t, n), s = "⭐".repeat(i) + "☆".repeat(3 - i), c = document.createElement("div");
  c.className = "completion-screen", c.innerHTML = `
    <div class="completion-screen__content">
      <div class="completion-screen__stars" aria-label="${i} כּוֹכָבִים">${s}</div>
      <h2 class="completion-screen__title">כָּל הַכָּבוֹד!</h2>
      <p class="completion-screen__score">${a}</p>
      <div class="completion-screen__actions">
        <button class="completion-screen__replay btn btn--primary">שַׂחֵק שׁוּב</button>
      </div>
    </div>
  `;
  const u = o.homeUrl === void 0 ? "../../index.html" : o.homeUrl;
  if (u) {
    const l = document.createElement("a");
    l.className = "completion-screen__home btn", l.href = u, l.textContent = "בְּחִירַת מִשְׂחָק", c.querySelector(".completion-screen__actions").appendChild(l);
  }
  c.querySelector(".completion-screen__replay").addEventListener("click", () => {
    c.remove(), r();
  }), e.innerHTML = "", e.appendChild(c), q(c.querySelector(".completion-screen__content"), "fadeIn");
}
function ut(e, t, {
  totalRounds: n,
  progressBar: r = null,
  buildRoundUI: o,
  transitionMs: a = 800,
  playCorrectSound: i = !0,
  completionOnly: s = !1,
  onReplay: c = () => location.reload()
}) {
  let u = !1;
  const l = /* @__PURE__ */ new Set();
  function f(p) {
    u = p || e.ended, l.forEach((he) => he(u));
  }
  function h(p) {
    return l.add(p), p(u || e.ended), () => {
      l.delete(p);
    };
  }
  e.on("end", () => {
    f(!0), l.clear();
  });
  async function d(p) {
    if (u || e.ended) return;
    f(!0), i && G.correct();
    try {
      p && await p();
    } catch (qe) {
      throw f(!1), qe;
    }
    if (e.ended || (e.state.addScore(1), r == null || r.update(e.state.currentRound), !await e.delay(a))) return;
    e.nextRound() ? (f(!1), o()) : ct(t, e.state.score, n, c, { gameId: e.gameId, completionOnly: s, homeUrl: e.config.homeUrl });
  }
  async function m(p) {
    if (!(u || e.ended)) {
      f(!0);
      try {
        p && await p();
      } finally {
        f(!1);
      }
    }
  }
  function g() {
    return u;
  }
  function D() {
    f(!1);
  }
  return { handleCorrect: d, handleWrong: m, isAnswered: g, reset: D, subscribe: h };
}
function lt(e, t) {
  const n = document.createElement("div");
  n.className = "progress-bar", n.setAttribute("role", "progressbar"), n.setAttribute("aria-valuemin", "0"), n.setAttribute("aria-valuemax", String(t)), n.innerHTML = `
    <div class="progress-bar__track">
      <div class="progress-bar__fill" style="width: 0%"></div>
    </div>
    <span class="progress-bar__label">0 / ${t}</span>
  `, e.appendChild(n);
  const r = (
    /** @type {HTMLElement} */
    n.querySelector(".progress-bar__fill")
  ), o = n.querySelector(".progress-bar__label");
  return {
    /** עדכן את ההתקדמות */
    update(a) {
      const i = Math.round(a / t * 100);
      r.style.width = `${i}%`, o.textContent = `${a} / ${t}`, n.setAttribute("aria-valuenow", String(a));
    },
    /** הסר את הרכיב */
    destroy() {
      n.remove();
    }
  };
}
let J = !1, ae = !1, P = null;
const dt = [
  "ResizeObserver loop",
  // אזהרת דפדפן שפירה
  "Script error."
  // שגיאת cross-origin אטומה, לרוב תוסף דפדפן
];
function be(e) {
  const t = String(e || "");
  return dt.some((n) => t.includes(n));
}
function we() {
  var t;
  if (ae || typeof document > "u" || !document.body) return;
  ae = !0;
  const e = document.createElement("div");
  e.className = "ab-error-screen", e.setAttribute("role", "alert"), e.dir = "rtl", e.innerHTML = `
    <div class="ab-error-screen__card">
      <div class="ab-error-screen__emoji">🙈</div>
      <h2 class="ab-error-screen__title">אוֹפְּס! מַשֶּׁהוּ הִשְׁתַּבֵּשׁ</h2>
      <p class="ab-error-screen__text">זֶה לֹא בִּגְלַלְכֶם! לְחִיצָה עַל הַכַּפְתּוֹר תַּחְזִיר אֶת הַמִּשְׂחָק.</p>
      <button type="button" class="btn btn--primary ab-error-screen__reload">לְהַתְחִיל מֵחָדָשׁ</button>
    </div>
  `, (t = e.querySelector(".ab-error-screen__reload")) == null || t.addEventListener("click", () => {
    try {
      location.reload();
    } catch {
    }
  }), document.body.appendChild(e);
}
function ft() {
  if (typeof window > "u") return { destroy() {
  } };
  if (J) return { destroy() {
  } };
  J = !0;
  const e = (n) => {
    be(n == null ? void 0 : n.message) || (console.error("[alefbet] uncaught error:", (n == null ? void 0 : n.error) ?? (n == null ? void 0 : n.message)), we());
  }, t = (n) => {
    const r = (
      /** @type {any} */
      n == null ? void 0 : n.reason
    );
    be((r == null ? void 0 : r.message) ?? r) || (console.error("[alefbet] unhandled rejection:", r), we());
  };
  return window.addEventListener("error", e), window.addEventListener("unhandledrejection", t), P = () => {
    window.removeEventListener("error", e), window.removeEventListener("unhandledrejection", t), J = !1, ae = !1;
  }, { destroy: () => {
    P == null || P(), P = null;
  } };
}
function mt(e, t = "טוֹעֵן...") {
  e.innerHTML = `<div class="ab-loading">${t}</div>`;
}
function ht(e) {
  e.innerHTML = "";
}
const C = [
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
  { letter: "ך", name: "כָּף סוֹפִית", nameNikud: "כָּף סוֹפִית", sound: "k", exampleWord: "מֶלֶךְ", emoji: "👑", isFinal: !0 },
  { letter: "ל", name: "לָמֵד", nameNikud: "לָמֵד", sound: "l", exampleWord: "לֵב", emoji: "❤️", isFinal: !1 },
  { letter: "מ", name: "מֵם", nameNikud: "מֵם", sound: "m", exampleWord: "מַיִם", emoji: "💧", isFinal: !1 },
  { letter: "ם", name: "מֵם סוֹפִית", nameNikud: "מֵם סוֹפִית", sound: "m", exampleWord: "שָׁמַיִם", emoji: "🌤️", isFinal: !0 },
  { letter: "נ", name: "נוּן", nameNikud: "נוּן", sound: "n", exampleWord: "נָחָשׁ", emoji: "🐍", isFinal: !1 },
  { letter: "ן", name: "נוּן סוֹפִית", nameNikud: "נוּן סוֹפִית", sound: "n", exampleWord: "גַּן", emoji: "🌳", isFinal: !0 },
  { letter: "ס", name: "סֶמֶךְ", nameNikud: "סָמֶךְ", sound: "s", exampleWord: "סוּס", emoji: "🐎", isFinal: !1 },
  { letter: "ע", name: "עַיִן", nameNikud: "עַיִן", sound: "", exampleWord: "עוּגָה", emoji: "🎂", isFinal: !1 },
  { letter: "פ", name: "פֵּא", nameNikud: "פֵּא", sound: "p", exampleWord: "פִּיל", emoji: "🐘", isFinal: !1 },
  { letter: "ף", name: "פֵּא סוֹפִית", nameNikud: "פֵּא סוֹפִית", sound: "p", exampleWord: "אַף", emoji: "👃", isFinal: !0 },
  { letter: "צ", name: "צַדִּי", nameNikud: "צַדִּי", sound: "ts", exampleWord: "צָב", emoji: "🐢", isFinal: !1 },
  { letter: "ץ", name: "צִדֵּי סוֹפִית", nameNikud: "צַדִּי סוֹפִית", sound: "ts", exampleWord: "עֵץ", emoji: "🌲", isFinal: !0 },
  { letter: "ק", name: "קוֹף", nameNikud: "קוֹף", sound: "k", exampleWord: "קוֹף", emoji: "🐒", isFinal: !1 },
  { letter: "ר", name: "רֵישׁ", nameNikud: "רֵישׁ", sound: "r", exampleWord: "רֶכֶב", emoji: "🚗", isFinal: !1 },
  { letter: "ש", name: "שִׁין", nameNikud: "שִׁין", sound: "sh", exampleWord: "שֶׁמֶשׁ", emoji: "☀️", isFinal: !1 },
  { letter: "ת", name: "תָּו", nameNikud: "תָּו", sound: "t", exampleWord: "תַּפּוּחַ", emoji: "🍎", isFinal: !1 }
];
function Re(e) {
  return C.find((t) => t.letter === e) || null;
}
function pt(e = "regular") {
  return e === "regular" ? C.filter((t) => !t.isFinal) : e === "final" ? C.filter((t) => t.isFinal) : C;
}
function Jt(e, t = "regular") {
  const n = pt(t);
  return [...n].sort(() => Math.random() - 0.5).slice(0, Math.min(e, n.length));
}
const E = [
  { id: "kamatz", name: "קָמָץ", nameNikud: "קָמָץ", symbol: "ָ", sound: "אָה", color: "#C9442C", textColor: "#fff" },
  { id: "patah", name: "פָּתַח", nameNikud: "פָּתַח", symbol: "ַ", sound: "אָה", color: "#C58119", textColor: "#fff" },
  { id: "hiriq", name: "חִירִיק", nameNikud: "חִירִיק", symbol: "ִ", sound: "אִי", color: "#2A7B71", textColor: "#fff" },
  { id: "tzere", name: "צֵרֶה", nameNikud: "צֵרֶה", symbol: "ֵ", sound: "אֶה", color: "#4A6B8C", textColor: "#fff" },
  { id: "segol", name: "סְגוֹל", nameNikud: "סְגוֹל", symbol: "ֶ", sound: "אֶה", color: "#783952", textColor: "#fff" },
  { id: "holam", name: "חוֹלָם", nameNikud: "חוֹלָם", symbol: "ֹ", sound: "אוֹ", color: "#5F7A42", textColor: "#fff" },
  { id: "kubbutz", name: "קֻבּוּץ", nameNikud: "קֻבּוּץ", symbol: "ֻ", sound: "אוּ", color: "#6B4A8A", textColor: "#fff" }
], yt = C.filter((e) => !e.isFinal).map((e) => e.letter);
function bt(e, t) {
  return e + t;
}
function en(e) {
  let t = [...E];
  if (typeof window < "u" && window.location && window.location.search) {
    const r = new URLSearchParams(window.location.search), o = r.get("allowedNikud");
    if (o) {
      const i = o.split(",").map((s) => s.trim());
      t = t.filter(
        (s) => i.includes(s.id) || i.includes(s.name) || i.includes(s.nameNikud)
      );
    }
    const a = r.get("excludedNikud");
    if (a) {
      const i = a.split(",").map((s) => s.trim());
      t = t.filter(
        (s) => !i.includes(s.id) && !i.includes(s.name) && !i.includes(s.nameNikud)
      );
    }
  }
  t.length === 0 && (t = [...E]);
  let n = [...t];
  for (; n.length < e; )
    n.push(...t);
  return n.sort(() => Math.random() - 0.5).slice(0, e);
}
const wt = 2e3;
let v = [], W = !1, M = 0.9, z = 0.5;
try {
  z = typeof localStorage < "u" && parseFloat(localStorage.getItem("alefbet.nikudRate")) || 0.5;
} catch {
}
let U = !1, B = null, A = null, k = null, Me = null, j = !1, b = "idle";
function Q() {
  return typeof speechSynthesis < "u";
}
function w(e, t, n = !1) {
  if (b === e && !n) return;
  const r = b;
  if (b = e, typeof window < "u" && typeof window.dispatchEvent == "function") {
    const o = { state: e, previousState: r };
    t && (o.reason = t), window.dispatchEvent(new CustomEvent("alefbet:tts-state", { detail: o }));
  }
}
function gt() {
  Q() ? b = "idle" : w("unsupported", "no-speech-synthesis");
}
gt();
function se(e, t) {
  Me = String(t || "unknown"), console.warn("[tts] browser TTS failed", { text: e, reason: t }), typeof window < "u" && typeof window.dispatchEvent == "function" && window.dispatchEvent(new CustomEvent("alefbet:tts-error", {
    detail: { provider: "browser", text: e, sentText: e, reason: t }
  }));
}
function vt(e) {
  const t = String(e).toLowerCase();
  return t.includes("not-allowed") || t.includes("notallowed") || t.includes("didn't interact") || t.includes("user gesture");
}
function kt() {
  var e;
  return typeof window > "u" || typeof document > "u" ? Promise.resolve() : U || (e = document.userActivation) != null && e.hasBeenActive ? (U = !0, Promise.resolve()) : B || (B = new Promise((t) => {
    const n = () => {
      U = !0, window.removeEventListener("pointerdown", n, !0), window.removeEventListener("keydown", n, !0), window.removeEventListener("touchstart", n, !0), t();
    };
    window.addEventListener("pointerdown", n, { once: !0, capture: !0 }), window.addEventListener("keydown", n, { once: !0, capture: !0 }), window.addEventListener("touchstart", n, { once: !0, capture: !0 });
  }).finally(() => {
    B = null;
  }), B);
}
let x = null, I = null, ee = !1, ge = !1;
const _t = ["carmit", "hila", "female"];
function Et(e) {
  const t = (e.name || "").toLowerCase();
  return _t.some((n) => t.includes(n));
}
function te() {
  if (typeof speechSynthesis > "u") return null;
  const t = speechSynthesis.getVoices().filter(
    (a) => a.lang === "he-IL" || a.lang === "iw-IL" || (a.lang || "").startsWith("he")
  );
  if (t.length === 0) return null;
  const r = typeof navigator < "u" && navigator.onLine === !1 && t.filter((a) => a.localService !== !1) || t, o = r.length > 0 ? r : t;
  return o.find(Et) || o[0];
}
function St() {
  return typeof speechSynthesis > "u" ? Promise.resolve() : (x = te(), x ? (ee = !0, Promise.resolve()) : ee ? Promise.resolve() : I || (I = new Promise((e) => {
    let t = !1;
    const n = () => {
      t || (t = !0, ee = !0, x = te(), typeof speechSynthesis < "u" && typeof speechSynthesis.removeEventListener == "function" && speechSynthesis.removeEventListener("voiceschanged", r), clearTimeout(o), e());
    }, r = () => {
      x = te(), x && n();
    };
    typeof speechSynthesis.addEventListener == "function" && speechSynthesis.addEventListener("voiceschanged", r);
    const o = setTimeout(() => {
      ge || (ge = !0, se("", "voice-load-timeout")), n();
    }, wt);
  }).finally(() => {
    I = null;
  }), I));
}
function Lt(e) {
  return 5e3 + ((e == null ? void 0 : e.length) ?? 0) * 200;
}
function ve(e) {
  return new Promise((t, n) => {
    if (typeof SpeechSynthesisUtterance > "u") {
      n(new Error("SpeechSynthesisUtterance unavailable"));
      return;
    }
    try {
      const r = new SpeechSynthesisUtterance(e);
      r.lang = "he-IL", r.rate = M, x && (r.voice = x), k = r;
      let o = !1;
      const a = setTimeout(() => {
        if (!o) {
          o = !0, k === r && (k = null);
          try {
            speechSynthesis.cancel();
          } catch {
          }
          n(new Error("utterance-timeout"));
        }
      }, Lt(e));
      r.onend = () => {
        o || (o = !0, clearTimeout(a), k === r && (k = null), t());
      }, r.onerror = (i) => {
        o || (o = !0, clearTimeout(a), k === r && (k = null), n(new Error(String(i && i.error || "speech-error"))));
      }, speechSynthesis.speak(r);
    } catch (r) {
      n(r instanceof Error ? r : new Error(String(r)));
    }
  });
}
async function Nt(e) {
  if (typeof speechSynthesis > "u")
    return { ok: !1, reason: "speechSynthesis unavailable" };
  await St();
  try {
    return await ve(e), j = !1, { ok: !0 };
  } catch (t) {
    const n = (t == null ? void 0 : t.message) || "speech-error";
    if (vt(n)) {
      j || (j = !0, w("awaiting-interaction", "autoplay-blocked")), await kt(), j = !1;
      try {
        return await ve(e), { ok: !0 };
      } catch (r) {
        const o = (r == null ? void 0 : r.message) || "speech-error";
        return se(e, o), { ok: !1, reason: o };
      }
    }
    return se(e, n), { ok: !1, reason: n };
  }
}
function T() {
  if (W || v.length === 0) return;
  const e = v.shift();
  W = !0, A = e;
  const t = M, n = typeof e.rate == "number";
  n && (M = e.rate), Nt(e.text).then((r) => {
    n && (M = t), W = !1;
    const o = A === e;
    if (A = null, !o) {
      T();
      return;
    }
    r.ok ? b !== "unsupported" && w("ready") : Q() ? w("failed", r.reason, !0) : w("unsupported", r.reason || "no-provider", !0), e.resolve(), T();
  }).catch((r) => {
    n && (M = t), W = !1, A = null, w("failed", (r == null ? void 0 : r.message) || "unknown"), e.resolve(), T();
  });
}
const S = {
  /**
   * הקרא טקסט עברי. ה-promise תמיד נפתר (גם בכשל) כדי שמשחקים לא יתקעו.
   * @param {string} text
   * @returns {Promise<void>}
   */
  speak(e) {
    return new Promise((t) => {
      v.push({ text: e, resolve: t }), T();
    });
  },
  /**
   * עצור את כל הדיבור הנוכחי וניקה את התור.
   * - כל ה-promises שבתור נפתרים (לא נדחים).
   * - אם יש פריט "in-flight" - גם הוא נפתר.
   * - אם הדפדפן תומך - speechSynthesis.cancel() יקרא פעם אחת.
   * - המצב חוזר ל-idle.
   */
  cancel() {
    if (A) {
      try {
        A.resolve();
      } catch {
      }
      A = null;
    }
    if (v.forEach((e) => {
      try {
        e.resolve();
      } catch {
      }
    }), v = [], W = !1, k && (k = null), typeof speechSynthesis < "u" && typeof speechSynthesis.cancel == "function")
      try {
        speechSynthesis.cancel();
      } catch {
      }
    w("idle", "cancelled");
  },
  /**
   * האם יש יכולת קול מקומית במכשיר.
   */
  get available() {
    return b !== "unsupported" && Q();
  },
  /** המצב הנוכחי של מנוע ה-TTS. */
  get audioState() {
    return b;
  },
  /** Alias for audioState — some callers use `state`. */
  get state() {
    return b;
  },
  /** השגיאה האחרונה שדווחה או null אם לא הייתה. */
  get lastError() {
    return Me;
  },
  /**
   * משחרר ידנית את מנוע הקול אחרי gesture ידוע (כפתור התחל וכו').
   * משחקים יקראו לזה במקום להמתין ל-autoplay block.
   * @returns {Promise<void>}
   */
  unlock() {
    if (U = !0, j = !1, Je().catch(() => {
    }), typeof speechSynthesis < "u" && typeof SpeechSynthesisUtterance < "u")
      try {
        const e = new SpeechSynthesisUtterance("");
        e.volume = 0, speechSynthesis.speak(e), speechSynthesis.cancel();
      } catch {
      }
    return b === "awaiting-interaction" && w("ready", "unlocked"), Promise.resolve();
  },
  /**
   * רושם handler לאירועי `alefbet:tts-state`. מחזיר פונקציית unsubscribe.
   * @param {(detail: { state: string, previousState: string, reason?: string }) => void} handler
   * @returns {() => void}
   */
  onStateChange(e) {
    if (typeof window > "u") return () => {
    };
    const t = (n) => e(
      /** @type {CustomEvent} */
      n.detail
    );
    return window.addEventListener("alefbet:tts-state", t), () => window.removeEventListener("alefbet:tts-state", t);
  },
  /**
   * רושם handler לאירועי `alefbet:tts-error`. מחזיר פונקציית unsubscribe.
   * @param {(detail: { provider: string, text: string, sentText: string, reason: string }) => void} handler
   * @returns {() => void}
   */
  onError(e) {
    if (typeof window > "u") return () => {
    };
    const t = (n) => e(
      /** @type {CustomEvent} */
      n.detail
    );
    return window.addEventListener("alefbet:tts-error", t), () => window.removeEventListener("alefbet:tts-error", t);
  },
  /**
   * סריקת יכולת מחודשת. מחזירה את הערך של `tts.available`. שימושית לבדיקות.
   */
  probe() {
    return Q() ? b === "unsupported" && w("idle", "recovered") : w("unsupported", "no-speech-synthesis"), this.available;
  },
  /**
   * הגדר מהירות דיבור (0.5-2.0).
   * @param {number} rate
   */
  setRate(e) {
    M = Math.max(0.5, Math.min(2, e));
  },
  /**
   * הגדר מהירות דיבור להדגשת ניקוד.
   * @param {{ rate?: number }} opts - rate: מהירות הדגשה (ברירת מחדל 0.5).
   */
  setNikudEmphasis({ rate: e } = {}) {
    e != null && (z = Math.max(0.3, Math.min(1.5, e)));
  },
  /**
   * הקרא אות עם ניקוד בשני שלבים: קודם את ההברה בקצב טבעי כדי שהעיצור יהיה קצר,
   * ואז את צליל התנועה לבד בקצב האיטי שמיועד לניקוד - כך הילד שומע
   * "מ-אההההה" במקום "ממממ-אה" שמתקבל מהאטה אחידה של ההברה כולה.
   * @param {string} letter - האות (למשל 'ב').
   * @param {string} nikudSymbol - סמל הניקוד (למשל U+05B7).
   */
  speakNikud(e, t) {
    const n = e + t, r = E.find((o) => o.symbol === t);
    return new Promise((o) => {
      r && r.sound ? (v.push({ text: n, resolve: () => {
      } }), v.push({
        text: r.sound,
        rate: z,
        resolve: () => o(void 0)
      })) : v.push({ text: n, resolve: () => o(void 0) }), T();
    });
  },
  /**
   * הקרא את צליל התנועה של הניקוד ("אָה", "אוֹ" וכו'),
   * כדי להדגים לילד מה להגות.
   * @param {string} nikudId - מזהה ניקוד מתוך nikudList (למשל 'kamatz').
   */
  speakVowel(e) {
    const t = E.find((n) => n.id === e);
    return !t || !t.sound ? Promise.resolve() : new Promise((n) => {
      v.push({
        text: t.sound,
        rate: z,
        resolve: () => n(void 0)
      }), T();
    });
  }
}, ke = "alefbet-audio-status-banner";
function xt(e) {
  switch (e) {
    case "awaiting-interaction":
      return { message: "הַקֵּשׁ כְּדֵי לְהַפְעִיל קוֹל", kind: "await" };
    case "unsupported":
      return { message: "הַקּוֹל אֵינוֹ זָמִין כָּרֶגַע", kind: "unsupported" };
    case "failed":
      return { message: "בְּעָיָה בַּקּוֹל. נַמְשִׁיךְ לְלֹא קוֹל", kind: "failed" };
    default:
      return null;
  }
}
function At(e = typeof document < "u" ? document.body : null, t = {}) {
  const n = t.window || (typeof window < "u" ? window : null);
  if (!e || !n)
    return { destroy() {
    } };
  const r = e.querySelector("#" + ke);
  r && r.parentNode && r.parentNode.removeChild(r);
  const o = e.ownerDocument.createElement("div");
  o.id = ke, o.className = "alefbet-audio-banner", o.setAttribute("role", "status"), o.setAttribute("aria-live", "polite"), o.dir = "rtl", o.hidden = !0;
  const a = e.ownerDocument.createElement("span");
  a.className = "alefbet-audio-banner__msg", o.appendChild(a);
  const i = e.ownerDocument.createElement("button");
  i.type = "button", i.className = "alefbet-audio-banner__dismiss", i.setAttribute("aria-label", "סְגוֹר הוֹדָעָה"), i.textContent = "×", i.hidden = !0, o.appendChild(i), e.appendChild(o);
  let s = null;
  function c() {
    s && (clearTimeout(s), s = null);
  }
  function u() {
    c(), o.hidden = !0, o.classList.remove("is-visible", "is-await", "is-unsupported", "is-failed"), o.onclick = null, i.hidden = !0;
  }
  function l(h) {
    const d = xt(h);
    if (!d) {
      u();
      return;
    }
    c(), a.textContent = d.message, o.hidden = !1, o.classList.add("is-visible"), o.classList.toggle("is-await", d.kind === "await"), o.classList.toggle("is-unsupported", d.kind === "unsupported"), o.classList.toggle("is-failed", d.kind === "failed"), d.kind === "await" ? (o.onclick = () => {
      try {
        e.ownerDocument.body.dispatchEvent(new MouseEvent("pointerdown", { bubbles: !0 }));
      } catch {
      }
      u();
    }, i.hidden = !0) : d.kind === "unsupported" ? (o.onclick = null, i.hidden = !1, i.onclick = (m) => {
      m.stopPropagation(), u();
    }) : d.kind === "failed" && (o.onclick = null, i.hidden = !0, s = setTimeout(() => u(), 6e3));
  }
  function f(h) {
    const m = /** @type {CustomEvent} */ (h.detail || {}).state;
    if (m === "ready" || m === "idle") {
      u();
      return;
    }
    l(m);
  }
  return n.addEventListener("alefbet:tts-state", f), {
    destroy() {
      n.removeEventListener("alefbet:tts-state", f), c(), o.parentNode && o.parentNode.removeChild(o);
    }
  };
}
function Rt(e, { banner: t = !0 } = {}) {
  const n = t ? At(e.container) : null, r = () => {
    e.container.removeEventListener("pointerdown", r, !0), e.container.removeEventListener("keydown", r, !0), S.unlock();
  };
  e.container.addEventListener("pointerdown", r, { once: !0, capture: !0 }), e.container.addEventListener("keydown", r, { once: !0, capture: !0 }), e.on("end", () => {
    e.container.removeEventListener("pointerdown", r, !0), e.container.removeEventListener("keydown", r, !0), n == null || n.destroy(), S.cancel();
  });
}
const _e = /* @__PURE__ */ new WeakMap();
async function Mt(e, t) {
  xe(e);
  const n = {};
  if (_e.set(e, n), ft(), mt(e, t.loadingMessage ?? "טוֹעֵן..."), t.onBeforeHide && (await t.onBeforeHide() === !1 || _e.get(e) !== n))
    return { shell: null, activeRounds: [], aborted: !0 };
  ht(e);
  const r = t.defaultRounds ?? [], o = new Ye(e, {
    totalRounds: t.totalRounds ?? r.length,
    title: t.title,
    gameId: t.gameId
  });
  return t.audio !== !1 && Rt(o), { shell: o, activeRounds: r, aborted: !1 };
}
async function Ct(e, t) {
  const n = await Mt(e, t);
  if (n.aborted) return n;
  const { shell: r, activeRounds: o } = n;
  if (!o.length)
    return r.bodyEl.textContent = "אֵין סִבּוּבִים לַמִּשְׂחָק.", r.end(), n;
  const a = lt(
    /** @type {HTMLElement} */
    r.footerEl,
    o.length
  );
  let i;
  const s = () => {
    i == null || i.dispose(), i = void 0;
  }, c = ut(r, e, {
    totalRounds: o.length,
    completionOnly: !0,
    progressBar: a,
    transitionMs: t.transitionMs,
    playCorrectSound: t.playCorrectSound,
    onReplay: t.onReplay ?? (() => {
      Ct(e, t);
    }),
    buildRoundUI: u
  });
  r.on("end", s), r.on("start", () => {
    var l;
    a.update(0), (l = t.onStart) == null || l.call(t, r), c.reset();
  }), r.on("start", u);
  function u() {
    s(), r.bodyEl.innerHTML = "";
    const l = Ke();
    i = l;
    const f = () => !r.ended && !l.signal.aborted, h = r.state.currentRound - 1;
    try {
      const d = t.buildRound({
        shell: r,
        index: h,
        round: o[h],
        isActive: f,
        scope: l,
        isAnswered: () => !f() || c.isAnswered(),
        subscribeAnswered: (m) => f() ? l.use(c.subscribe(m)) : (m(!0), () => {
        }),
        onCorrect: async (m) => {
          f() && await c.handleCorrect(m);
        },
        onWrong: async (m) => {
          f() && await c.handleWrong(m);
        },
        schedule: l.schedule
      });
      d && l.use(d);
    } catch (d) {
      throw l.dispose(), d;
    }
  }
  return r.start(), n;
}
function Tt(e, t, n) {
  e.innerHTML = "";
  const r = document.createElement("div");
  r.className = "option-cards-grid";
  const o = t.map((a) => {
    const i = document.createElement("button");
    i.className = "option-card", i.dataset.id = a.id, i.type = "button";
    const s = document.createElement("span");
    s.className = "option-card__emoji", s.textContent = a.emoji || "";
    const c = document.createElement("span");
    return c.className = "option-card__text", c.textContent = a.text, i.append(s, c), i.addEventListener("click", () => {
      i.disabled || n(a);
    }), r.appendChild(i), { el: i, option: a };
  });
  return e.appendChild(r), {
    /** הַדָּגֵשׁ כַּרְטִיס לְפִי סוּג: 'correct' | 'wrong' | 'hint' */
    highlight(a, i) {
      o.forEach(({ el: s, option: c }) => {
        c.id === a && s.classList.add(`option-card--${i}`);
      });
    },
    /** Visual hints never change the answer lock or other highlights. */
    clearHighlight(a, i) {
      o.forEach(({ el: s, option: c }) => {
        c.id === a && s.classList.remove(`option-card--${i}`);
      });
    },
    setDisabled(a) {
      o.forEach(({ el: i }) => {
        i.disabled = a;
      });
    },
    /** הסר את הרכיב */
    destroy() {
      e.innerHTML = "";
    }
  };
}
function tn(e, t, n) {
  const r = e.scope.use(Tt(t, n.options, (o) => {
    e.isAnswered() || (n.isCorrect(o) ? e.onCorrect(() => {
      var a;
      return r.highlight(o.id, "correct"), (a = n.onCorrect) == null ? void 0 : a.call(n, o);
    }) : e.onWrong(() => {
      var a;
      return (a = n.onWrong) == null ? void 0 : a.call(n, o);
    }));
  }));
  return e.subscribeAnswered((o) => r.setDisabled(o)), { highlight: r.highlight, clearHighlight: r.clearHighlight };
}
function nn({ hintAfter: e = 2, escalateAfter: t = 4, onHint: n, onEscalate: r } = {}) {
  let o = 0;
  function a(i) {
    return i >= t ? 2 : i >= e ? 1 : 0;
  }
  return {
    /** דיווח על ניסיון שגוי. מפעיל את הקולבק המתאים ומחזיר את הרמה. */
    miss() {
      o++;
      const i = a(o);
      return i === 2 && r ? r(o) : i === 1 && n && n(o), i;
    },
    /** איפוס לקראת סיבוב חדש. */
    reset() {
      o = 0;
    },
    /** רמת העזרה הנוכחית: 0 ללא, 1 רמז עדין, 2 עזרה מוגברת. */
    get level() {
      return a(o);
    },
    /** מספר הניסיונות השגויים בסיבוב הנוכחי. */
    get misses() {
      return o;
    }
  };
}
const Ee = [
  "כָּל הַכָּבוֹד",
  "מְצֻיָּן",
  "יֹפִי",
  "נֶהְדָּר",
  "וָאוּ",
  "אֵיזֶה כֵּיף"
], Se = [
  "נַסּוּ שׁוּב, אַתֶּם יְכוֹלִים",
  "כִּמְעַט! הַקְשִׁיבוּ שׁוּב",
  "עוֹד נִסָּיוֹן קָטָן",
  "קְרוֹבִים מְאֹד"
];
function Ft() {
  return Ee[Math.floor(Math.random() * Ee.length)];
}
function rn() {
  return Se[Math.floor(Math.random() * Se.length)];
}
function on(e) {
  const t = document.createElement("div");
  t.className = "feedback-message", t.setAttribute("aria-live", "polite"), t.setAttribute("role", "status"), e.appendChild(t);
  let n = null;
  function r(o, a, i = 1800) {
    clearTimeout(n), t.textContent = o, t.className = `feedback-message feedback-message--${a}`, n = setTimeout(() => {
      t.textContent = "", t.className = "feedback-message";
    }, i);
  }
  return {
    /** הצג משוב חיובי - טקסט מפורש, או ביטוי שבח אקראי אם לא סופק */
    correct(o) {
      G.correct(), r(o ?? `!${Ft()}`, "correct"), q(t, "bounce");
    },
    /** הצג עידוד — נסה שוב */
    wrong(o = "נַסֵּה שׁוּב") {
      G.wrong(), r(o, "wrong"), q(t, "pulse");
    },
    /** הצג רמז */
    hint(o) {
      r(o, "hint"), q(t, "pulse");
    },
    /** הסר את הרכיב */
    destroy() {
      clearTimeout(n), t.remove();
    }
  };
}
function Pt(e) {
  let t = e.querySelector(".adult-tools__panel");
  if (t) return t;
  const n = e.querySelector(".game-header");
  if (!n) return null;
  const r = document.createElement("details");
  return r.className = "adult-tools", r.innerHTML = '<summary aria-label="להורים ולמורים">☰<span>למבוגרים</span></summary><div class="adult-tools__panel"><p>להורים ולמורים</p></div>', r.addEventListener("keydown", (o) => {
    o.key === "Escape" && (r.open = !1, r.querySelector("summary").focus(), o.stopPropagation());
  }), n.appendChild(r), r.querySelector(".adult-tools__panel");
}
function an(e, t, n, r) {
  const o = Pt(e);
  if (!o) return null;
  const a = document.createElement("button");
  return a.className = "btn", a.setAttribute("aria-label", n), a.textContent = `${t} ${n}`, a.onclick = (i) => {
    const s = a.closest("details");
    s && (s.open = !1), r(i);
  }, o.appendChild(a), a;
}
let N = null, y = null, Ce = 0, Te = 0, F = null, ne = 0, re = 0;
const V = /* @__PURE__ */ new Map();
function Fe(e, t) {
  var r;
  const n = (r = document.elementFromPoint(e, t)) == null ? void 0 : r.closest('[data-drop-target="true"]');
  return n && V.has(n) && !n.matches(":disabled") && n.getAttribute("aria-disabled") !== "true" ? n : null;
}
function Bt(e, t, n) {
  const r = e.getBoundingClientRect();
  Ce = r.width / 2, Te = r.height / 2, y = e.cloneNode(!0), y.setAttribute("aria-hidden", "true"), y.setAttribute("tabindex", "-1"), Object.assign(y.style, {
    position: "fixed",
    left: "0",
    top: "0",
    width: `${r.width}px`,
    height: `${r.height}px`,
    pointerEvents: "none",
    // keeps it out of elementFromPoint + hit-testing
    zIndex: "9999",
    opacity: "0.85",
    cursor: "grabbing",
    margin: "0",
    // אנימציות המקור גוברות על transform; מעברים גורמים לפיגור אחרי המצביע.
    animation: "none",
    transition: "none",
    willChange: "transform"
    // מקדם שכבת compositor מראש - בלי זה הפריים הראשון של תזוזה עלול לגמגם
  }), Pe(t, n), document.body.appendChild(y);
}
function Pe(e, t) {
  y && (y.style.transform = `translate3d(${e - Ce}px, ${t - Te}px, 0) scale(1.12)`);
}
function It(e, t) {
  ne = e, re = t, F === null && (F = requestAnimationFrame(() => {
    F = null, Pe(ne, re), Wt(Fe(ne, re));
  }));
}
function Ht() {
  F !== null && (cancelAnimationFrame(F), F = null), y == null || y.remove(), y = null;
}
let _ = null;
function Wt(e) {
  _ !== e && (_ == null || _.classList.remove("drop-target--hover"), _ = e, e == null || e.classList.add("drop-target--hover"));
}
function jt() {
  _ == null || _.classList.remove("drop-target--hover"), _ = null;
}
function sn(e, t, { onTap: n } = {}) {
  e.classList.add("drag-source");
  let r = null, o = null, a = null, i = null;
  function s() {
    var l;
    r && (e.removeEventListener("pointermove", r), e.removeEventListener("pointerup", o), e.removeEventListener("pointercancel", a), e.removeEventListener("lostpointercapture", a), r = o = a = null), jt(), Ht(), e.classList.remove("drag-source--dragging"), N = null;
    const u = i;
    i = null, u !== null && ((l = e.hasPointerCapture) != null && l.call(e, u)) && e.releasePointerCapture(u);
  }
  function c(u) {
    if (e.matches(":disabled") || e.getAttribute("aria-disabled") === "true" || u.button !== void 0 && u.button !== 0 || i !== null) return;
    u.preventDefault(), N && N.cancel(), N = { el: e, data: t, cancel: s }, i = u.pointerId;
    let l = !1;
    const f = () => {
      l = !0, e.classList.add("drag-source--dragging"), Bt(e, u.clientX, u.clientY);
    }, h = (d) => Math.hypot(d.clientX - u.clientX, d.clientY - u.clientY) >= 8;
    n || f(), e.setPointerCapture(u.pointerId), r = (d) => {
      d.pointerId === i && (!l && h(d) && f(), l && It(d.clientX, d.clientY));
    }, o = (d) => {
      if (d.pointerId !== i) return;
      const m = !l && !h(d), g = m && n ? null : Fe(d.clientX, d.clientY);
      if (s(), m && n) {
        n();
        return;
      }
      g && V.has(g) && V.get(g).onDrop({ data: t, sourceEl: e, targetEl: g });
    }, a = (d) => {
      d.pointerId === i && s();
    }, e.addEventListener("pointermove", r), e.addEventListener("pointerup", o), e.addEventListener("pointercancel", a), e.addEventListener("lostpointercapture", a);
  }
  return e.addEventListener("pointerdown", c), {
    destroy() {
      e.removeEventListener("pointerdown", c), (N == null ? void 0 : N.el) === e && s(), e.classList.remove("drag-source");
    }
  };
}
function cn(e, t) {
  return e.setAttribute("data-drop-target", "true"), e.classList.add("drop-target--active"), V.set(e, { onDrop: t }), {
    destroy() {
      e.removeAttribute("data-drop-target"), e.classList.remove("drop-target--active", "drop-target--hover"), V.delete(e);
    }
  };
}
function un(e) {
  const t = [...e];
  for (let n = t.length - 1; n > 0; n--) {
    const r = Math.floor(Math.random() * (n + 1));
    [t[n], t[r]] = [t[r], t[n]];
  }
  return t;
}
const Vt = "alefbet-voices", L = "recordings", Dt = 1;
let H = null;
function K() {
  return H || (H = new Promise((e, t) => {
    const n = indexedDB.open(Vt, Dt);
    n.onupgradeneeded = () => {
      n.result.createObjectStore(L);
    }, n.onsuccess = () => e(n.result), n.onerror = () => {
      H = null, t(n.error);
    };
  }), H);
}
function de(e, t) {
  return `${e}/${t}`;
}
async function ln(e, t, n) {
  const r = await K();
  return new Promise((o, a) => {
    const i = r.transaction(L, "readwrite");
    i.objectStore(L).put(n, de(e, t)), i.oncomplete = o, i.onerror = (s) => a(s.target.error);
  });
}
async function Ot(e, t) {
  const n = await K();
  return new Promise((r, o) => {
    const i = n.transaction(L, "readonly").objectStore(L).get(de(e, t));
    i.onsuccess = () => r(i.result ?? null), i.onerror = (s) => o(s.target.error);
  });
}
async function dn(e, t) {
  const n = await K();
  return new Promise((r, o) => {
    const a = n.transaction(L, "readwrite");
    a.objectStore(L).delete(de(e, t)), a.oncomplete = r, a.onerror = (i) => o(i.target.error);
  });
}
async function $t(e) {
  const t = await K();
  return new Promise((n, r) => {
    const a = t.transaction(L, "readonly").objectStore(L).getAllKeys();
    a.onsuccess = () => {
      const i = `${e}/`;
      n(
        (a.result || []).filter((s) => s.startsWith(i)).map((s) => s.slice(i.length))
      );
    }, a.onerror = (i) => r(i.target.error);
  });
}
async function Le(e, t, { signal: n } = {}) {
  if (n != null && n.aborted) return !1;
  let r;
  try {
    r = await Ot(e, t);
  } catch {
    return !1;
  }
  return !r || n != null && n.aborted ? !1 : await tt(r, { signal: n }) ? !0 : n != null && n.aborted ? !1 : new Promise((o) => {
    const a = URL.createObjectURL(r), i = new Audio(a);
    let s = !1;
    const c = (l) => {
      s || (s = !0, n == null || n.removeEventListener("abort", u), i.onended = null, i.onerror = null, i.pause(), URL.revokeObjectURL(a), o(l));
    }, u = () => c(!1);
    n == null || n.addEventListener("abort", u, { once: !0 }), i.onended = () => c(!0), i.onerror = () => c(!1), i.play().catch(() => c(!1));
  });
}
const qt = {
  a: { F1: 850, F2: 1400 },
  e: { F1: 550, F2: 2100 },
  i: { F1: 350, F2: 2700 },
  o: { F1: 550, F2: 1e3 },
  u: { F1: 350, F2: 850 }
}, Be = {
  kamatz: "a",
  patah: "a",
  tzere: "e",
  segol: "e",
  hiriq: "i",
  holam: "o",
  kubbutz: "u"
}, Ie = 210, He = 550, zt = {
  a: { F3: 2700, bandwidths: [90, 110, 170], gains: [1, 0.5, 0.15] },
  e: { F3: 2900, bandwidths: [80, 100, 160], gains: [1, 0.55, 0.2] },
  i: { F3: 3300, bandwidths: [60, 100, 160], gains: [1, 0.6, 0.25] },
  o: { F3: 2600, bandwidths: [80, 90, 150], gains: [1, 0.5, 0.1] },
  u: { F3: 2400, bandwidths: [60, 80, 140], gains: [1, 0.45, 0.1] }
};
function X(e) {
  const t = qt[e], n = zt[e];
  return !t || !n ? null : {
    formants: [t.F1, t.F2, n.F3],
    bandwidths: [...n.bandwidths],
    gains: [...n.gains]
  };
}
const Ne = {
  "": { type: "none", voiced: !0, durationMs: 0 },
  b: { type: "plosive", voiced: !0, noiseHz: 500, noiseQ: 1.2, durationMs: 25 },
  g: { type: "plosive", voiced: !0, noiseHz: 1800, noiseQ: 1.5, durationMs: 30 },
  d: { type: "plosive", voiced: !0, noiseHz: 3e3, noiseQ: 1.5, durationMs: 25 },
  h: { type: "fricative", voiced: !1, noiseHz: 1200, noiseQ: 0.4, durationMs: 90 },
  v: { type: "fricative", voiced: !0, noiseHz: 900, noiseQ: 0.8, durationMs: 90 },
  z: { type: "fricative", voiced: !0, noiseHz: 5200, noiseQ: 2.5, durationMs: 110 },
  ch: { type: "fricative", voiced: !1, noiseHz: 1500, noiseQ: 0.6, durationMs: 130 },
  t: { type: "plosive", voiced: !1, noiseHz: 3500, noiseQ: 1.5, durationMs: 30 },
  y: { type: "glide", voiced: !0, durationMs: 90 },
  k: { type: "plosive", voiced: !1, noiseHz: 1600, noiseQ: 1.5, durationMs: 35 },
  l: { type: "liquid", voiced: !0, durationMs: 80 },
  m: { type: "nasal", voiced: !0, durationMs: 110 },
  n: { type: "nasal", voiced: !0, durationMs: 100 },
  s: { type: "fricative", voiced: !1, noiseHz: 5800, noiseQ: 2.5, durationMs: 130 },
  p: { type: "plosive", voiced: !1, noiseHz: 700, noiseQ: 1.2, durationMs: 25 },
  ts: { type: "affricate", voiced: !1, noiseHz: 5200, noiseQ: 2.5, durationMs: 140 },
  r: { type: "liquid", voiced: !0, durationMs: 80 },
  sh: { type: "fricative", voiced: !1, noiseHz: 3e3, noiseQ: 1.8, durationMs: 140 }
};
function Ut(e) {
  return Ne[e] ?? Ne[""];
}
function fn() {
  return Y() !== null;
}
let O = null;
function Gt(e) {
  if (O && O.sampleRate === e.sampleRate) return O;
  const t = e.sampleRate, n = e.createBuffer(1, t, e.sampleRate), r = n.getChannelData(0);
  for (let o = 0; o < t; o++) r[o] = Math.random() * 2 - 1;
  return O = n, n;
}
function We(e, t, n, r = e.destination) {
  const o = e.createOscillator();
  o.type = "sawtooth", o.frequency.value = n;
  const a = e.createGain();
  a.gain.value = 0;
  const i = t.formants.map((s, c) => {
    const u = e.createBiquadFilter();
    u.type = "bandpass", u.frequency.value = s, u.Q.value = s / t.bandwidths[c];
    const l = e.createGain();
    return l.gain.value = t.gains[c], o.connect(u), u.connect(l), l.connect(a), u;
  });
  return a.connect(r), { source: o, filters: i, master: a };
}
function oe(e, t, n, r, o = e.destination) {
  const a = n.durationMs / 1e3, i = e.createBufferSource();
  i.buffer = Gt(e), i.loop = !0;
  const s = e.createBiquadFilter();
  s.type = "bandpass", s.frequency.value = n.noiseHz ?? 2e3, s.Q.value = n.noiseQ ?? 1;
  const c = e.createGain();
  return c.gain.setValueAtTime(0, t), c.gain.linearRampToValueAtTime(r, t + Math.min(0.01, a / 3)), c.gain.linearRampToValueAtTime(1e-4, t + a), i.connect(s), s.connect(c), c.connect(o), i.start(t), i.stop(t + a + 0.02), t + a;
}
function je(e, t, n, r, o, a, i = e.destination) {
  const s = r / 1e3, { source: c, filters: u, master: l } = We(e, n, o, i);
  if (c.frequency.setValueAtTime(o * 1.04, t), c.frequency.linearRampToValueAtTime(o * 0.92, t + s), a) {
    const d = Math.min(0.09, s / 3);
    u.forEach((m, g) => {
      const D = a[g];
      D && (m.frequency.setValueAtTime(D, t), m.frequency.exponentialRampToValueAtTime(n.formants[g], t + d));
    });
  }
  const f = 0.04, h = 0.12;
  return l.gain.setValueAtTime(0, t), l.gain.linearRampToValueAtTime(0.5, t + f), l.gain.setValueAtTime(0.5, t + s - h), l.gain.linearRampToValueAtTime(1e-4, t + s), c.start(t), c.stop(t + s + 0.05), t + s;
}
function Qt(e, t, n, r, o = e.destination) {
  const a = n / 1e3, i = { formants: [250, 1100, 2200], bandwidths: [80, 200, 300], gains: [1, 0.12, 0.05] }, { source: s, master: c } = We(e, i, r, o);
  return c.gain.setValueAtTime(0, t), c.gain.linearRampToValueAtTime(0.35, t + 0.02), c.gain.setValueAtTime(0.35, t + a - 0.02), c.gain.linearRampToValueAtTime(1e-4, t + a), s.start(t), s.stop(t + a + 0.05), t + a;
}
function Ve(e, t, n, r) {
  const o = Math.max(0, (t - e.currentTime) * 1e3) + 60;
  return new Promise((a) => {
    const i = () => {
      clearTimeout(s), r == null || r.removeEventListener("abort", i), n.disconnect(), a(!(r != null && r.aborted));
    }, s = setTimeout(i, o);
    r == null || r.addEventListener("abort", i, { once: !0 }), r != null && r.aborted && i();
  });
}
async function Xt(e, t = {}) {
  var i, s;
  const n = X(e);
  if (!n || (i = t.signal) != null && i.aborted) return !1;
  const r = await le();
  if (!r || (s = t.signal) != null && s.aborted) return !1;
  let o, a;
  try {
    a = r.createGain(), a.connect(r.destination);
    const c = r.currentTime + 0.03;
    o = je(r, c, n, t.durationMs ?? He, t.pitchHz ?? Ie, null, a);
  } catch {
    return a == null || a.disconnect(), !1;
  }
  return Ve(r, o, a, t.signal);
}
async function ce(e, t, n = {}) {
  var l, f;
  const r = X(t);
  if (!r || (l = n.signal) != null && l.aborted) return !1;
  const o = await le();
  if (!o || (f = n.signal) != null && f.aborted) return !1;
  const a = Ut(e), i = n.pitchHz ?? Ie, s = n.durationMs ?? He;
  let c, u;
  try {
    u = o.createGain(), u.connect(o.destination), c = Yt(o, a, e, r, s, i, u);
  } catch {
    return u == null || u.disconnect(), !1;
  }
  return Ve(o, c, u, n.signal);
}
function Yt(e, t, n, r, o, a, i = e.destination) {
  let s = e.currentTime + 0.03, c = null;
  switch (t.type) {
    case "plosive": {
      s = oe(e, s, t, t.voiced ? 0.25 : 0.35, i), s += 0.01;
      break;
    }
    case "fricative": {
      s = oe(e, s, t, 0.22, i) - 0.03;
      break;
    }
    case "affricate": {
      s += 0.03, s = oe(e, s, { ...t, durationMs: t.durationMs - 30 }, 0.3, i) - 0.02;
      break;
    }
    case "nasal": {
      s = Qt(e, s, t.durationMs, a, i), c = [300, 1300, 2300];
      break;
    }
    case "liquid": {
      c = n === "r" ? [450, 1300, 1600] : [380, 1e3, 2600];
      break;
    }
    case "glide": {
      const u = X(n === "y" ? "i" : "u");
      c = u ? u.formants : null;
      break;
    }
  }
  return je(e, s, r, o, a, c, i);
}
const ue = "sound-bank";
function De(e) {
  return `letter:${e}`;
}
function Oe(e) {
  return `nikud:${e}`;
}
function $e(e, t) {
  return `syllable:${e}:${t}`;
}
function mn() {
  const e = [];
  for (const t of C)
    e.push({ key: De(t.letter), label: t.nameNikud, group: "letters" });
  for (const t of E)
    e.push({ key: Oe(t.id), label: `${t.nameNikud} (${t.sound})`, group: "nikud" });
  for (const t of yt)
    for (const n of E)
      e.push({
        key: $e(t, n.id),
        label: bt(t, n.symbol),
        group: "syllables"
      });
  return e;
}
function Kt() {
  return typeof navigator < "u" && navigator.onLine === !1;
}
async function fe(e, t = void 0) {
  try {
    return typeof indexedDB > "u" ? !1 : await (t ? Le(ue, e, t) : Le(ue, e));
  } catch {
    return !1;
  }
}
async function me(e) {
  if (Kt() && !Zt()) return !1;
  try {
    return await e(), S.audioState !== "failed" && S.audioState !== "unsupported";
  } catch {
    return !1;
  }
}
function Zt() {
  return typeof speechSynthesis < "u";
}
async function hn() {
  try {
    return typeof indexedDB > "u" ? [] : await $t(ue);
  } catch {
    return [];
  }
}
async function pn(e) {
  if (await fe(De(e))) return "bank";
  const t = Re(e), n = t ? t.nameNikud : e;
  return await me(() => S.speak(n)) ? "tts" : t && await ce(t.sound, "a", { durationMs: 400 }) ? "synth" : "none";
}
async function yn(e) {
  if (await fe(Oe(e))) return "bank";
  if (await me(() => S.speakVowel(e))) return "tts";
  const t = Be[e];
  return t && await Xt(t) ? "synth" : "none";
}
async function bn(e, t, n = {}) {
  const { signal: r } = n;
  if (r != null && r.aborted) return "none";
  if (await fe($e(e, t), r ? n : void 0)) return "bank";
  if (r != null && r.aborted) return "none";
  const o = E.find((c) => c.id === t), a = () => S.cancel();
  r == null || r.addEventListener("abort", a, { once: !0 });
  try {
    if (o && await me(() => S.speakNikud(e, o.symbol)))
      return r != null && r.aborted ? "none" : "tts";
  } finally {
    r == null || r.removeEventListener("abort", a);
  }
  if (r != null && r.aborted) return "none";
  const i = Re(e), s = Be[t];
  return s && await (r ? ce(i ? i.sound : "", s, n) : ce(i ? i.sound : "", s)) ? "synth" : "none";
}
function wn(e, t) {
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
  const r = new URLSearchParams(window.location.search), o = r.get("allowedNikud") ? r.get("allowedNikud").split(",") : [];
  let a = `
    <div style="background:white; padding:1.5rem; border-radius:1rem; min-width:300px; text-align:center; color:#333; font-family:Heebo,Arial; direction:rtl;">
      <h2 style="margin-top:0">בחר ניקוד</h2>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; margin:1rem 0; text-align:right;">
  `;
  E.forEach((u) => {
    const l = o.length === 0 || o.includes(u.id) || o.includes(u.name);
    a += `
      <label style="display:flex; align-items:center; gap:0.5rem; cursor:pointer;">
        <input type="checkbox" value="${u.id}" class="nikud-filter-cb" ${l ? "checked" : ""} style="width:1.2rem;height:1.2rem;">
        <span>${u.nameNikud}</span>
      </label>
    `;
  });
  const i = parseFloat(localStorage.getItem("alefbet.nikudRate")) || 0.5;
  a += `
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
  `, n.innerHTML = a, n.style.display = "flex";
  const s = (
    /** @type {HTMLInputElement} */
    document.getElementById("nikud-rate-slider")
  ), c = document.getElementById("nikud-rate-val");
  s.oninput = () => {
    c.textContent = s.value;
  }, document.getElementById("save-settings-btn").onclick = () => {
    const u = parseFloat(s.value);
    localStorage.setItem("alefbet.nikudRate", String(u)), S.setNikudEmphasis({ rate: u });
    const l = Array.from(n.querySelectorAll(".nikud-filter-cb")).filter((h) => (
      /** @type {HTMLInputElement} */
      h.checked
    )).map((h) => (
      /** @type {HTMLInputElement} */
      h.value
    )), f = new URL(window.location.href);
    l.length > 0 && l.length < E.length ? f.searchParams.set("allowedNikud", l.join(",")) : f.searchParams.delete("allowedNikud"), f.searchParams.delete("excludedNikud"), n.style.display = "none", window.history.replaceState({}, "", f), t && t(e);
  }, document.getElementById("close-settings-btn").onclick = () => {
    n.style.display = "none";
  };
}
export {
  Be as NIKUD_VOWEL,
  ue as SOUND_BANK_ID,
  qt as VOWEL_TEMPLATES,
  q as animate,
  Mt as bootstrapGame,
  tn as createChoiceRound,
  sn as createDragSource,
  cn as createDropTarget,
  on as createFeedback,
  nn as createHintTracker,
  lt as createProgressBar,
  Ke as createRoundScope,
  dn as deleteVoice,
  Y as getAudioContext,
  Re as getLetter,
  pt as getLettersByGroup,
  an as injectHeaderButton,
  fn as isSynthSupported,
  bt as letterWithNikud,
  Ot as loadVoice,
  Xe as lockPageZoom,
  yt as nikudBaseLetters,
  E as nikudList,
  Le as playVoice,
  Jt as randomLetters,
  en as randomNikud,
  Ft as randomPraise,
  rn as randomRetryHint,
  hn as recordedKeys,
  Ct as runGame,
  ln as saveVoice,
  ct as showCompletionScreen,
  wn as showNikudSettingsDialog,
  un as shuffle,
  G as sounds,
  pn as speakLetter,
  yn as speakNikudSound,
  bn as speakSyllable,
  mn as standardSoundKeys,
  S as tts
};
