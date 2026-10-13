class vt {
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
class kt {
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
const _t = "alefbet-zoom-lock", Ve = /* @__PURE__ */ new WeakSet();
function xe(e) {
  e.cancelable && e.preventDefault();
}
function St(e) {
  const t = (
    /** @type {TouchEvent} */
    e.touches
  );
  t && t.length > 1 && xe(e);
}
function Et(e = typeof document < "u" ? document : null) {
  if (!e || Ve.has(e)) return !1;
  Ve.add(e), e.documentElement.classList.add(_t);
  const t = { passive: !1 };
  return e.addEventListener("gesturestart", xe, t), e.addEventListener("gesturechange", xe, t), e.addEventListener("touchmove", St, t), !0;
}
const ae = /* @__PURE__ */ new WeakMap();
function tt(e) {
  var t;
  (t = ae.get(e)) == null || t.end();
}
class Lt {
  /**
   * @param {HTMLElement} containerEl - אלמנט המיכל
   * @param {object} config - הגדרות: { totalRounds, title, homeUrl }
   */
  constructor(t, n = {}) {
    tt(t), ae.set(t, this), this.ended = !1, this._timers = /* @__PURE__ */ new Set(), this.container = t, this.config = {
      totalRounds: 8,
      title: "מִשְׂחָק",
      homeUrl: "../../index.html",
      ...n
    }, this.events = new vt(), this.state = new kt(this.config.totalRounds), this.gameId = typeof n.gameId == "string" ? n.gameId : "", this._buildShell();
  }
  _buildShell() {
    this.container.classList.add("alefbet-game"), Et(this.container.ownerDocument);
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
      this._timers.clear(), ae.get(this.container) === this && ae.delete(this.container), this.events.emit("end", { score: t, state: this.state });
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
function Nt() {
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
    listen(r, o, s, i) {
      e.signal.aborted || (r.addEventListener(o, s, i), n(() => r.removeEventListener(o, s, i)));
    },
    schedule(r, o) {
      if (e.signal.aborted) return () => {
      };
      const s = () => {
        clearTimeout(i), t.delete(s);
      }, i = setTimeout(() => {
        t.delete(s), e.signal.aborted || r();
      }, o);
      return n(s), s;
    },
    dispose() {
      if (e.signal.aborted) return;
      e.abort();
      const r = [...t].reverse();
      t.clear();
      for (const o of r)
        try {
          o();
        } catch (s) {
          console.warn("Round cleanup failed", s);
        }
    }
  };
}
let Se = null;
function At() {
  return typeof window > "u" ? null : window.AudioContext || /** @type {any} */
  window.webkitAudioContext || null;
}
function pe() {
  const e = At();
  if (!e) return null;
  if (!Se)
    try {
      Se = new e();
    } catch {
      return null;
    }
  return Se;
}
async function Rt() {
  const e = pe();
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
async function Ie() {
  const e = pe();
  if (!e) return null;
  if (e.state === "suspended")
    try {
      await e.resume();
    } catch {
    }
  return e.state === "running" ? e : null;
}
function Ct(e) {
  return typeof e.arrayBuffer == "function" ? e.arrayBuffer() : new Promise((t, n) => {
    const r = new FileReader();
    r.onload = () => t(
      /** @type {ArrayBuffer} */
      r.result
    ), r.onerror = () => n(r.error), r.readAsArrayBuffer(e);
  });
}
async function Mt(e, { signal: t } = {}) {
  if (t != null && t.aborted || !e) return !1;
  const n = await Ie();
  if (t != null && t.aborted || !n || typeof n.decodeAudioData != "function") return !1;
  let r;
  try {
    const o = await Ct(e);
    r = await new Promise((s, i) => {
      const a = n.decodeAudioData(o, s, i);
      a && typeof a.then == "function" && a.then(s, i);
    });
  } catch {
    return !1;
  }
  return t != null && t.aborted ? !1 : new Promise((o) => {
    let s, i, a = !1;
    const c = (d) => {
      if (!a) {
        if (a = !0, clearTimeout(i), t == null || t.removeEventListener("abort", u), s) {
          s.onended = null;
          try {
            s.stop(), s.disconnect();
          } catch {
          }
        }
        o(d);
      }
    }, u = () => c(!1);
    try {
      s = n.createBufferSource(), s.buffer = r, s.connect(n.destination), s.onended = () => c(!0), t == null || t.addEventListener("abort", u, { once: !0 }), i = setTimeout(() => c(!0), (r.duration + 0.5) * 1e3), s.start(0);
    } catch {
      c(!1);
    }
  });
}
function xt() {
  const e = pe();
  return e ? (e.state === "suspended" && e.resume(), e) : null;
}
function D(e, t, n = "sine", r = 0.3) {
  const o = xt();
  if (o)
    try {
      const s = o.createOscillator(), i = o.createGain();
      s.connect(i), i.connect(o.destination), s.type = n, s.frequency.setValueAtTime(e, o.currentTime), i.gain.setValueAtTime(r, o.currentTime), i.gain.exponentialRampToValueAtTime(1e-3, o.currentTime + t), s.start(o.currentTime), s.stop(o.currentTime + t + 0.05);
    } catch {
    }
}
const de = {
  /** צליל תשובה נכונה */
  correct() {
    D(523.25, 0.15), setTimeout(() => D(659.25, 0.2), 120), setTimeout(() => D(783.99, 0.3), 240);
  },
  /** צליל עידוד עדין — נסה שוב */
  wrong() {
    D(350, 0.15, "triangle", 0.12);
  },
  /** צליל עידוד - סיום מוצלח */
  cheer() {
    [523.25, 587.33, 659.25, 698.46, 783.99, 1046.5].forEach((t, n) => setTimeout(() => D(t, 0.2), n * 90));
  },
  /** קליק עדין */
  click() {
    D(900, 0.04, "sine", 0.12);
  }
}, De = {
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
}, Tt = {
  shake: 420,
  bounce: 480,
  pulse: 600,
  fadeIn: 320,
  confetti: 700
};
function ce(e, t) {
  !e || !De[t] || e.animate(De[t], {
    duration: Tt[t] || 400,
    easing: "ease-in-out",
    fill: "none"
  });
}
function Ft(e, t) {
  function n() {
    try {
      const s = localStorage.getItem(e);
      return s === null ? t : JSON.parse(s);
    } catch {
      return t;
    }
  }
  function r(s) {
    try {
      localStorage.setItem(e, JSON.stringify(s));
    } catch (i) {
      return console.warn(`[createLocalState] שגיאה בשמירת "${e}":`, i), !1;
    }
    return !0;
  }
  function o(s) {
    return r(s(n()));
  }
  return { get: n, set: r, update: o };
}
const Pt = "alefbet.progress.v1", Bt = Ft(Pt, {});
function nt(e, t) {
  if (!Number.isFinite(e) || !Number.isFinite(t) || t <= 0) return 1;
  const n = e / t;
  return n >= 0.8 ? 3 : n >= 0.5 ? 2 : 1;
}
function It(e, { score: t, total: n }) {
  if (!e || !Number.isFinite(t) || !Number.isFinite(n) || n <= 0) return null;
  const r = nt(t, n);
  let o = null;
  return Bt.update((s) => {
    const i = s[e];
    return o = {
      plays: ((i == null ? void 0 : i.plays) ?? 0) + 1,
      bestScore: Math.max((i == null ? void 0 : i.bestScore) ?? 0, t),
      bestStars: Math.max((i == null ? void 0 : i.bestStars) ?? 0, r),
      total: i && (i.bestScore ?? 0) > t ? i.total : n,
      lastPlayed: Date.now()
    }, { ...s, [e]: o };
  }), o;
}
function $t(e, t, n, r, o = {}) {
  de.cheer(), o.gameId && It(o.gameId, { score: t, total: n });
  const s = o.completionOnly ? n === 1 ? "הִשְׁלַמְתֶּם מְשִׂימָה!" : `הִשְׁלַמְתֶּם ${n} מְשִׂימוֹת!` : `נִיקּוּד: ${t} מִתּוֹךְ ${n}`, i = nt(t, n), a = "⭐".repeat(i) + "☆".repeat(3 - i), c = document.createElement("div");
  c.className = "completion-screen", c.innerHTML = `
    <div class="completion-screen__content">
      <div class="completion-screen__stars" aria-label="${i} כּוֹכָבִים">${a}</div>
      <h2 class="completion-screen__title">כָּל הַכָּבוֹד!</h2>
      <p class="completion-screen__score">${s}</p>
      <div class="completion-screen__actions">
        <button class="completion-screen__replay btn btn--primary">שַׂחֵק שׁוּב</button>
      </div>
    </div>
  `;
  const u = o.homeUrl === void 0 ? "../../index.html" : o.homeUrl;
  if (u) {
    const d = document.createElement("a");
    d.className = "completion-screen__home btn", d.href = u, d.textContent = "בְּחִירַת מִשְׂחָק", c.querySelector(".completion-screen__actions").appendChild(d);
  }
  c.querySelector(".completion-screen__replay").addEventListener("click", () => {
    c.remove(), r();
  }), e.innerHTML = "", e.appendChild(c), ce(c.querySelector(".completion-screen__content"), "fadeIn");
}
function Wt(e, t, {
  totalRounds: n,
  progressBar: r = null,
  buildRoundUI: o,
  transitionMs: s = 800,
  playCorrectSound: i = !0,
  completionOnly: a = !1,
  onReplay: c = () => location.reload()
}) {
  let u = !1;
  const d = /* @__PURE__ */ new Set();
  function l(w) {
    u = w || e.ended, d.forEach((ne) => ne(u));
  }
  function p(w) {
    return d.add(w), w(u || e.ended), () => {
      d.delete(w);
    };
  }
  e.on("end", () => {
    l(!0), d.clear();
  });
  async function f(w) {
    if (u || e.ended) return;
    l(!0), i && de.correct();
    try {
      w && await w();
    } catch (S) {
      throw l(!1), S;
    }
    if (e.ended || (e.state.addScore(1), r == null || r.update(e.state.currentRound), !await e.delay(s))) return;
    e.nextRound() ? (l(!1), o()) : $t(t, e.state.score, n, c, { gameId: e.gameId, completionOnly: a, homeUrl: e.config.homeUrl });
  }
  async function h(w) {
    if (!(u || e.ended)) {
      l(!0);
      try {
        w && await w();
      } finally {
        l(!1);
      }
    }
  }
  function v() {
    return u;
  }
  function B() {
    l(!1);
  }
  return { handleCorrect: f, handleWrong: h, isAnswered: v, reset: B, subscribe: p };
}
function jt(e, t) {
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
    update(s) {
      const i = Math.round(s / t * 100);
      r.style.width = `${i}%`, o.textContent = `${s} / ${t}`, n.setAttribute("aria-valuenow", String(s));
    },
    /** הסר את הרכיב */
    destroy() {
      n.remove();
    }
  };
}
let Ee = !1, Te = !1, Q = null;
const Ht = [
  "ResizeObserver loop",
  // אזהרת דפדפן שפירה
  "Script error."
  // שגיאת cross-origin אטומה, לרוב תוסף דפדפן
];
function Oe(e) {
  const t = String(e || "");
  return Ht.some((n) => t.includes(n));
}
function ze() {
  var t;
  if (Te || typeof document > "u" || !document.body) return;
  Te = !0;
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
function qt() {
  if (typeof window > "u") return { destroy() {
  } };
  if (Ee) return { destroy() {
  } };
  Ee = !0;
  const e = (n) => {
    Oe(n == null ? void 0 : n.message) || (console.error("[alefbet] uncaught error:", (n == null ? void 0 : n.error) ?? (n == null ? void 0 : n.message)), ze());
  }, t = (n) => {
    const r = (
      /** @type {any} */
      n == null ? void 0 : n.reason
    );
    Oe((r == null ? void 0 : r.message) ?? r) || (console.error("[alefbet] unhandled rejection:", r), ze());
  };
  return window.addEventListener("error", e), window.addEventListener("unhandledrejection", t), Q = () => {
    window.removeEventListener("error", e), window.removeEventListener("unhandledrejection", t), Ee = !1, Te = !1;
  }, { destroy: () => {
    Q == null || Q(), Q = null;
  } };
}
function Vt(e, t = "טוֹעֵן...") {
  e.innerHTML = `<div class="ab-loading">${t}</div>`;
}
function Dt(e) {
  e.innerHTML = "";
}
const z = [
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
function rt(e) {
  return z.find((t) => t.letter === e) || null;
}
function Ot(e = "regular") {
  return e === "regular" ? z.filter((t) => !t.isFinal) : e === "final" ? z.filter((t) => t.isFinal) : z;
}
function Wn(e, t = "regular") {
  const n = Ot(t);
  return [...n].sort(() => Math.random() - 0.5).slice(0, Math.min(e, n.length));
}
const x = [
  { id: "kamatz", name: "קָמָץ", nameNikud: "קָמָץ", symbol: "ָ", sound: "אָה", color: "#C9442C", textColor: "#fff" },
  { id: "patah", name: "פָּתַח", nameNikud: "פָּתַח", symbol: "ַ", sound: "אָה", color: "#C58119", textColor: "#fff" },
  { id: "hiriq", name: "חִירִיק", nameNikud: "חִירִיק", symbol: "ִ", sound: "אִי", color: "#2A7B71", textColor: "#fff" },
  { id: "tzere", name: "צֵרֶה", nameNikud: "צֵרֶה", symbol: "ֵ", sound: "אֶה", color: "#4A6B8C", textColor: "#fff" },
  { id: "segol", name: "סְגוֹל", nameNikud: "סְגוֹל", symbol: "ֶ", sound: "אֶה", color: "#783952", textColor: "#fff" },
  { id: "holam", name: "חוֹלָם", nameNikud: "חוֹלָם", symbol: "ֹ", sound: "אוֹ", color: "#5F7A42", textColor: "#fff" },
  { id: "kubbutz", name: "קֻבּוּץ", nameNikud: "קֻבּוּץ", symbol: "ֻ", sound: "אוּ", color: "#6B4A8A", textColor: "#fff" }
], zt = z.filter((e) => !e.isFinal).map((e) => e.letter);
function Ut(e, t) {
  return e + t;
}
function jn(e) {
  let t = [...x];
  if (typeof window < "u" && window.location && window.location.search) {
    const r = new URLSearchParams(window.location.search), o = r.get("allowedNikud");
    if (o) {
      const i = o.split(",").map((a) => a.trim());
      t = t.filter(
        (a) => i.includes(a.id) || i.includes(a.name) || i.includes(a.nameNikud)
      );
    }
    const s = r.get("excludedNikud");
    if (s) {
      const i = s.split(",").map((a) => a.trim());
      t = t.filter(
        (a) => !i.includes(a.id) && !i.includes(a.name) && !i.includes(a.nameNikud)
      );
    }
  }
  t.length === 0 && (t = [...x]);
  let n = [...t];
  for (; n.length < e; )
    n.push(...t);
  return n.sort(() => Math.random() - 0.5).slice(0, e);
}
const Gt = 2e3;
let R = [], Z = !1, O = 0.9, ue = 0.5;
try {
  ue = typeof localStorage < "u" && parseFloat(localStorage.getItem("alefbet.nikudRate")) || 0.5;
} catch {
}
let le = !1, X = null, H = null, C = null, ot = null, J = !1, N = "idle";
function fe() {
  return typeof speechSynthesis < "u";
}
function A(e, t, n = !1) {
  if (N === e && !n) return;
  const r = N;
  if (N = e, typeof window < "u" && typeof window.dispatchEvent == "function") {
    const o = { state: e, previousState: r };
    t && (o.reason = t), window.dispatchEvent(new CustomEvent("alefbet:tts-state", { detail: o }));
  }
}
function Qt() {
  fe() ? N = "idle" : A("unsupported", "no-speech-synthesis");
}
Qt();
function Fe(e, t) {
  ot = String(t || "unknown"), console.warn("[tts] browser TTS failed", { text: e, reason: t }), typeof window < "u" && typeof window.dispatchEvent == "function" && window.dispatchEvent(new CustomEvent("alefbet:tts-error", {
    detail: { provider: "browser", text: e, sentText: e, reason: t }
  }));
}
function Xt(e) {
  const t = String(e).toLowerCase();
  return t.includes("not-allowed") || t.includes("notallowed") || t.includes("didn't interact") || t.includes("user gesture");
}
function Kt() {
  return typeof window > "u" || typeof document > "u" ? Promise.resolve() : le ? (le = !0, Promise.resolve()) : X || (X = new Promise((e) => {
    const t = () => {
      le = !0, window.removeEventListener("pointerdown", t, !0), window.removeEventListener("keydown", t, !0), window.removeEventListener("touchstart", t, !0), e();
    };
    window.addEventListener("pointerdown", t, { once: !0, capture: !0 }), window.addEventListener("keydown", t, { once: !0, capture: !0 }), window.addEventListener("touchstart", t, { once: !0, capture: !0 });
  }).finally(() => {
    X = null;
  }), X);
}
let W = null, K = null, Le = !1, Ue = !1;
const Yt = ["carmit", "hila", "female"];
function Zt(e) {
  const t = (e.name || "").toLowerCase();
  return Yt.some((n) => t.includes(n));
}
function Ne() {
  if (typeof speechSynthesis > "u") return null;
  const t = speechSynthesis.getVoices().filter(
    (s) => s.lang === "he-IL" || s.lang === "iw-IL" || (s.lang || "").startsWith("he")
  );
  if (t.length === 0) return null;
  const r = typeof navigator < "u" && navigator.onLine === !1 && t.filter((s) => s.localService !== !1) || t, o = r.length > 0 ? r : t;
  return o.find(Zt) || o[0];
}
function Jt() {
  return typeof speechSynthesis > "u" ? Promise.resolve() : (W = Ne(), W ? (Le = !0, Promise.resolve()) : Le ? Promise.resolve() : K || (K = new Promise((e) => {
    let t = !1;
    const n = () => {
      t || (t = !0, Le = !0, W = Ne(), typeof speechSynthesis < "u" && typeof speechSynthesis.removeEventListener == "function" && speechSynthesis.removeEventListener("voiceschanged", r), clearTimeout(o), e());
    }, r = () => {
      W = Ne(), W && n();
    };
    typeof speechSynthesis.addEventListener == "function" && speechSynthesis.addEventListener("voiceschanged", r);
    const o = setTimeout(() => {
      Ue || (Ue = !0, Fe("", "voice-load-timeout")), n();
    }, Gt);
  }).finally(() => {
    K = null;
  }), K));
}
function en(e) {
  return 5e3 + ((e == null ? void 0 : e.length) ?? 0) * 200;
}
function Ge(e) {
  return new Promise((t, n) => {
    if (typeof SpeechSynthesisUtterance > "u") {
      n(new Error("SpeechSynthesisUtterance unavailable"));
      return;
    }
    try {
      const r = new SpeechSynthesisUtterance(e);
      r.lang = "he-IL", r.rate = O, W && (r.voice = W), C = r;
      let o = !1;
      const s = setTimeout(() => {
        if (!o) {
          o = !0, C === r && (C = null);
          try {
            speechSynthesis.cancel();
          } catch {
          }
          n(new Error("utterance-timeout"));
        }
      }, en(e));
      r.onend = () => {
        o || (o = !0, clearTimeout(s), C === r && (C = null), t());
      }, r.onerror = (i) => {
        o || (o = !0, clearTimeout(s), C === r && (C = null), n(new Error(String(i && i.error || "speech-error"))));
      }, speechSynthesis.speak(r);
    } catch (r) {
      n(r instanceof Error ? r : new Error(String(r)));
    }
  });
}
async function tn(e) {
  if (typeof speechSynthesis > "u")
    return { ok: !1, reason: "speechSynthesis unavailable" };
  await Jt();
  try {
    return await Ge(e), J = !1, { ok: !0 };
  } catch (t) {
    const n = (t == null ? void 0 : t.message) || "speech-error";
    if (Xt(n)) {
      J || (J = !0, A("awaiting-interaction", "autoplay-blocked")), await Kt(), J = !1;
      try {
        return await Ge(e), { ok: !0 };
      } catch (r) {
        const o = (r == null ? void 0 : r.message) || "speech-error";
        return Fe(e, o), { ok: !1, reason: o };
      }
    }
    return Fe(e, n), { ok: !1, reason: n };
  }
}
function U() {
  if (Z || R.length === 0) return;
  const e = R.shift();
  Z = !0, H = e;
  const t = O, n = typeof e.rate == "number";
  n && (O = e.rate), tn(e.text).then((r) => {
    n && (O = t), Z = !1;
    const o = H === e;
    if (H = null, !o) {
      U();
      return;
    }
    r.ok ? N !== "unsupported" && A("ready") : fe() ? A("failed", r.reason, !0) : A("unsupported", r.reason || "no-provider", !0), e.resolve(), U();
  }).catch((r) => {
    n && (O = t), Z = !1, H = null, A("failed", (r == null ? void 0 : r.message) || "unknown"), e.resolve(), U();
  });
}
const L = {
  /**
   * הקרא טקסט עברי. ה-promise תמיד נפתר (גם בכשל) כדי שמשחקים לא יתקעו.
   * @param {string} text
   * @returns {Promise<void>}
   */
  speak(e) {
    return new Promise((t) => {
      R.push({ text: e, resolve: t }), U();
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
    if (H) {
      try {
        H.resolve();
      } catch {
      }
      H = null;
    }
    if (R.forEach((e) => {
      try {
        e.resolve();
      } catch {
      }
    }), R = [], Z = !1, C && (C = null), typeof speechSynthesis < "u" && typeof speechSynthesis.cancel == "function")
      try {
        speechSynthesis.cancel();
      } catch {
      }
    A("idle", "cancelled");
  },
  /**
   * האם יש יכולת קול מקומית במכשיר.
   */
  get available() {
    return N !== "unsupported" && fe();
  },
  /** המצב הנוכחי של מנוע ה-TTS. */
  get audioState() {
    return N;
  },
  /** Alias for audioState — some callers use `state`. */
  get state() {
    return N;
  },
  /** השגיאה האחרונה שדווחה או null אם לא הייתה. */
  get lastError() {
    return ot;
  },
  /**
   * משחרר ידנית את מנוע הקול אחרי gesture ידוע (כפתור התחל וכו').
   * משחקים יקראו לזה במקום להמתין ל-autoplay block.
   * @returns {Promise<void>}
   */
  unlock() {
    if (le = !0, J = !1, Rt().catch(() => {
    }), typeof speechSynthesis < "u" && typeof SpeechSynthesisUtterance < "u")
      try {
        const e = new SpeechSynthesisUtterance("");
        e.volume = 0, speechSynthesis.speak(e), speechSynthesis.cancel();
      } catch {
      }
    return N === "awaiting-interaction" && A("ready", "unlocked"), Promise.resolve();
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
    return fe() ? N === "unsupported" && A("idle", "recovered") : A("unsupported", "no-speech-synthesis"), this.available;
  },
  /**
   * הגדר מהירות דיבור (0.5-2.0).
   * @param {number} rate
   */
  setRate(e) {
    O = Math.max(0.5, Math.min(2, e));
  },
  /**
   * הגדר מהירות דיבור להדגשת ניקוד.
   * @param {{ rate?: number }} opts - rate: מהירות הדגשה (ברירת מחדל 0.5).
   */
  setNikudEmphasis({ rate: e } = {}) {
    e != null && (ue = Math.max(0.3, Math.min(1.5, e)));
  },
  /**
   * הקרא אות עם ניקוד בשני שלבים: קודם את ההברה בקצב טבעי כדי שהעיצור יהיה קצר,
   * ואז את צליל התנועה לבד בקצב האיטי שמיועד לניקוד - כך הילד שומע
   * "מ-אההההה" במקום "ממממ-אה" שמתקבל מהאטה אחידה של ההברה כולה.
   * @param {string} letter - האות (למשל 'ב').
   * @param {string} nikudSymbol - סמל הניקוד (למשל U+05B7).
   */
  speakNikud(e, t) {
    const n = e + t, r = x.find((o) => o.symbol === t);
    return new Promise((o) => {
      r && r.sound ? (R.push({ text: n, resolve: () => {
      } }), R.push({
        text: r.sound,
        rate: ue,
        resolve: () => o(void 0)
      })) : R.push({ text: n, resolve: () => o(void 0) }), U();
    });
  },
  /**
   * הקרא את צליל התנועה של הניקוד ("אָה", "אוֹ" וכו'),
   * כדי להדגים לילד מה להגות.
   * @param {string} nikudId - מזהה ניקוד מתוך nikudList (למשל 'kamatz').
   */
  speakVowel(e) {
    const t = x.find((n) => n.id === e);
    return !t || !t.sound ? Promise.resolve() : new Promise((n) => {
      R.push({
        text: t.sound,
        rate: ue,
        resolve: () => n(void 0)
      }), U();
    });
  }
}, Qe = "alefbet-audio-status-banner";
function nn(e) {
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
function rn(e = typeof document < "u" ? document.body : null, t = {}) {
  const n = t.window || (typeof window < "u" ? window : null);
  if (!e || !n)
    return { destroy() {
    } };
  const r = e.querySelector("#" + Qe);
  r && r.parentNode && r.parentNode.removeChild(r);
  const o = e.ownerDocument.createElement("div");
  o.id = Qe, o.className = "alefbet-audio-banner", o.setAttribute("role", "status"), o.setAttribute("aria-live", "polite"), o.dir = "rtl", o.hidden = !0;
  const s = e.ownerDocument.createElement("span");
  s.className = "alefbet-audio-banner__msg", o.appendChild(s);
  const i = e.ownerDocument.createElement("button");
  i.type = "button", i.className = "alefbet-audio-banner__dismiss", i.setAttribute("aria-label", "סְגוֹר הוֹדָעָה"), i.textContent = "×", i.hidden = !0, o.appendChild(i), e.appendChild(o);
  let a = null;
  function c() {
    a && (clearTimeout(a), a = null);
  }
  function u() {
    c(), o.hidden = !0, o.classList.remove("is-visible", "is-await", "is-unsupported", "is-failed"), o.onclick = null, i.hidden = !0;
  }
  function d(p) {
    const f = nn(p);
    if (!f) {
      u();
      return;
    }
    c(), s.textContent = f.message, o.hidden = !1, o.classList.add("is-visible"), o.classList.toggle("is-await", f.kind === "await"), o.classList.toggle("is-unsupported", f.kind === "unsupported"), o.classList.toggle("is-failed", f.kind === "failed"), f.kind === "await" ? (o.onclick = () => {
      try {
        e.ownerDocument.body.dispatchEvent(new MouseEvent("pointerdown", { bubbles: !0 }));
      } catch {
      }
      u();
    }, i.hidden = !0) : f.kind === "unsupported" ? (o.onclick = null, i.hidden = !1, i.onclick = (h) => {
      h.stopPropagation(), u();
    }) : f.kind === "failed" && (o.onclick = null, i.hidden = !0, a = setTimeout(() => u(), 6e3));
  }
  function l(p) {
    const h = /** @type {CustomEvent} */ (p.detail || {}).state;
    if (h === "ready" || h === "idle") {
      u();
      return;
    }
    d(h);
  }
  return n.addEventListener("alefbet:tts-state", l), {
    destroy() {
      n.removeEventListener("alefbet:tts-state", l), c(), o.parentNode && o.parentNode.removeChild(o);
    }
  };
}
function on(e, { banner: t = !0 } = {}) {
  const n = t ? rn(e.container) : null, r = () => {
    e.container.removeEventListener("pointerdown", r, !0), e.container.removeEventListener("keydown", r, !0), L.unlock();
  };
  e.container.addEventListener("pointerdown", r, { once: !0, capture: !0 }), e.container.addEventListener("keydown", r, { once: !0, capture: !0 }), e.on("end", () => {
    e.container.removeEventListener("pointerdown", r, !0), e.container.removeEventListener("keydown", r, !0), n == null || n.destroy(), L.cancel();
  });
}
const Xe = /* @__PURE__ */ new WeakMap();
async function sn(e, t) {
  tt(e);
  const n = {};
  if (Xe.set(e, n), qt(), Vt(e, t.loadingMessage ?? "טוֹעֵן..."), t.onBeforeHide && (await t.onBeforeHide() === !1 || Xe.get(e) !== n))
    return { shell: null, activeRounds: [], aborted: !0 };
  Dt(e);
  const r = t.defaultRounds ?? [], o = new Lt(e, {
    totalRounds: t.totalRounds ?? r.length,
    title: t.title,
    gameId: t.gameId
  });
  return t.audio !== !1 && on(o), { shell: o, activeRounds: r, aborted: !1 };
}
async function an(e, t) {
  const n = await sn(e, t);
  if (n.aborted) return n;
  const { shell: r, activeRounds: o } = n;
  if (!o.length)
    return r.bodyEl.textContent = "אֵין סִבּוּבִים לַמִּשְׂחָק.", r.end(), n;
  const s = jt(
    /** @type {HTMLElement} */
    r.footerEl,
    o.length
  );
  let i;
  const a = () => {
    i == null || i.dispose(), i = void 0;
  }, c = Wt(r, e, {
    totalRounds: o.length,
    completionOnly: !0,
    progressBar: s,
    transitionMs: t.transitionMs,
    playCorrectSound: t.playCorrectSound,
    onReplay: t.onReplay ?? (() => {
      an(e, t);
    }),
    buildRoundUI: u
  });
  r.on("end", a), r.on("start", () => {
    var d;
    s.update(0), (d = t.onStart) == null || d.call(t, r), c.reset();
  }), r.on("start", u);
  function u() {
    a(), r.bodyEl.innerHTML = "";
    const d = Nt();
    i = d;
    const l = () => !r.ended && !d.signal.aborted, p = r.state.currentRound - 1;
    try {
      const f = t.buildRound({
        shell: r,
        index: p,
        round: o[p],
        isActive: l,
        scope: d,
        isAnswered: () => !l() || c.isAnswered(),
        subscribeAnswered: (h) => l() ? d.use(c.subscribe(h)) : (h(!0), () => {
        }),
        onCorrect: async (h) => {
          l() && await c.handleCorrect(h);
        },
        onWrong: async (h) => {
          l() && await c.handleWrong(h);
        },
        schedule: d.schedule
      });
      f && d.use(f);
    } catch (f) {
      throw d.dispose(), f;
    }
  }
  return r.start(), n;
}
function cn(e, t, n) {
  e.innerHTML = "";
  const r = document.createElement("div");
  r.className = "option-cards-grid";
  const o = t.map((s) => {
    const i = document.createElement("button");
    i.className = "option-card", i.dataset.id = s.id, i.type = "button";
    const a = document.createElement("span");
    a.className = "option-card__emoji", a.textContent = s.emoji || "";
    const c = document.createElement("span");
    return c.className = "option-card__text", c.textContent = s.text, i.append(a, c), i.addEventListener("click", () => {
      i.disabled || n(s);
    }), r.appendChild(i), { el: i, option: s };
  });
  return e.appendChild(r), {
    /** הַדָּגֵשׁ כַּרְטִיס לְפִי סוּג: 'correct' | 'wrong' | 'hint' */
    highlight(s, i) {
      o.forEach(({ el: a, option: c }) => {
        c.id === s && a.classList.add(`option-card--${i}`);
      });
    },
    /** Visual hints never change the answer lock or other highlights. */
    clearHighlight(s, i) {
      o.forEach(({ el: a, option: c }) => {
        c.id === s && a.classList.remove(`option-card--${i}`);
      });
    },
    setDisabled(s) {
      o.forEach(({ el: i }) => {
        i.disabled = s;
      });
    },
    /** הסר את הרכיב */
    destroy() {
      e.innerHTML = "";
    }
  };
}
function Hn(e, t, n) {
  const r = e.scope.use(cn(t, n.options, (o) => {
    e.isAnswered() || (n.isCorrect(o) ? e.onCorrect(() => {
      var s;
      return r.highlight(o.id, "correct"), (s = n.onCorrect) == null ? void 0 : s.call(n, o);
    }) : e.onWrong(() => {
      var s;
      return (s = n.onWrong) == null ? void 0 : s.call(n, o);
    }));
  }));
  return e.subscribeAnswered((o) => r.setDisabled(o)), { highlight: r.highlight, clearHighlight: r.clearHighlight };
}
const un = 1200, ee = 250, ln = /[֑-ׇ]/g;
let Ae = 0;
function dn(e) {
  const t = (i) => new Promise((a) => {
    e.schedule(() => a(void 0), i);
  }), n = (i) => (Ae++, L.speak(i).finally(() => {
    Ae--;
  })), r = () => Ae ? (L.cancel(), !0) : !1, o = (i, a = un, c = a + 1500 + i.replace(ln, "").length * 120) => Promise.all([t(a), Promise.race([n(i), t(c)])]), s = async () => {
    r() && await t(ee);
  };
  return e.use(() => {
    r();
  }), { wait: t, say: o, speak: n, hush: r, quiet: s };
}
const fn = () => {
  var e;
  return !!((e = globalThis.navigator) != null && e.userActivation) && !navigator.userActivation.hasBeenActive;
};
function j(e, t, n) {
  const r = document.createElement(e);
  return t && (r.className = t), n !== void 0 && (r.textContent = n), r;
}
function mn(e) {
  const t = j("span", "story-choice__dots");
  t.setAttribute("aria-hidden", "true");
  for (let n = 0; n < e; n++) t.append(j("span"));
  return t;
}
function hn(e, { retireTried: t = !0 } = {}) {
  const n = "cards" in e, r = j("div", n ? "story-cards" : "story-choices");
  n || (r.dir = "ltr");
  const o = n ? e.cards.map((a) => {
    const c = (
      /** @type {HTMLButtonElement} */
      j("button", "story-card")
    );
    return c.type = "button", Object.assign(c.dataset, { id: a.id, ...a.data }), c.setAttribute("aria-label", a.label), c.append(j("span", "story-card__caption", a.label), a.picture), c;
  }) : e.values.map((a) => {
    const c = (
      /** @type {HTMLButtonElement} */
      j("button", "story-choice")
    );
    return c.type = "button", c.dataset.value = String(a), c.setAttribute("aria-label", String(a)), c.append(j("span", "story-choice__number", String(a)), mn(a)), c;
  });
  r.append(...o);
  const s = (a) => n ? a.dataset.id : Number(a.dataset.value), i = (a) => s(a) === ("cards" in e ? e.right : e.answer);
  return {
    root: r,
    buttons: o,
    valueOf: s,
    isRight: i,
    /** @param {boolean} locked */
    lock(a) {
      for (const c of o) c.disabled = a || c.classList.contains("story-pick--tried");
    },
    /** @param {HTMLElement} button */
    tried(a) {
      t && a.classList.add("story-pick--tried");
    },
    /** @param {HTMLElement} button */
    correct(a) {
      a.classList.add("story-pick--correct");
    },
    mark() {
      var a;
      (a = o.find(i)) == null || a.classList.add("story-pick--hint");
    }
  };
}
const Ke = [
  "כָּל הַכָּבוֹד",
  "מְצֻיָּן",
  "יֹפִי",
  "נֶהְדָּר",
  "וָאוּ",
  "אֵיזֶה כֵּיף"
], Ye = [
  "נַסּוּ שׁוּב, אַתֶּם יְכוֹלִים",
  "כִּמְעַט! הַקְשִׁיבוּ שׁוּב",
  "עוֹד נִסָּיוֹן קָטָן",
  "קְרוֹבִים מְאֹד"
];
function pn() {
  return Ke[Math.floor(Math.random() * Ke.length)];
}
function qn() {
  return Ye[Math.floor(Math.random() * Ye.length)];
}
function yn(e) {
  const t = document.createElement("div");
  t.className = "feedback-message", t.setAttribute("aria-live", "polite"), t.setAttribute("role", "status"), e.appendChild(t);
  let n = null;
  function r(o, s, i = 1800) {
    clearTimeout(n), t.textContent = o, t.className = `feedback-message feedback-message--${s}`, n = setTimeout(() => {
      t.textContent = "", t.className = "feedback-message";
    }, i);
  }
  return {
    /** הצג משוב חיובי - טקסט מפורש, או ביטוי שבח אקראי אם לא סופק */
    correct(o) {
      de.correct(), r(o ?? `!${pn()}`, "correct"), ce(t, "bounce");
    },
    /** הצג עידוד — נסה שוב */
    wrong(o = "נַסֵּה שׁוּב") {
      de.wrong(), r(o, "wrong"), ce(t, "pulse");
    },
    /** הצג רמז */
    hint(o) {
      r(o, "hint"), ce(t, "pulse");
    },
    /** הסר את הרכיב */
    destroy() {
      clearTimeout(n), t.remove();
    }
  };
}
function $(e, t, n) {
  const r = document.createElement(e);
  return t && (r.className = t), n !== void 0 && (r.textContent = n), r;
}
function Ze(e, t) {
  const n = (
    /** @type {HTMLButtonElement} */
    $("button", e, t)
  );
  return n.type = "button", n;
}
function Vn(e, t) {
  const { shell: n, scope: r, isActive: o } = e, { wait: s, say: i, speak: a, hush: c } = dn(r), u = t({ wait: s, say: i, speak: a }), { beats: d, scene: l, choices: p, result: f, ladder: h, onMiss: v, beforeResult: B } = u, w = "cards" in p, ne = u.solvedEquation ?? d[d.length - 1].equation;
  let S = 0, re = !1, be = 0;
  const oe = $("section", ["story-round", u.className, w && "story-round--cards"].filter(Boolean).join(" ")), F = $("div", "story");
  F.setAttribute("aria-live", "polite");
  const we = $("p", "story-equation");
  we.dir = "ltr";
  const P = hn(p, { retireTried: u.retireTried ?? !0 }), q = Ze("story-again", "עוֹד פַּעַם 🔁");
  q.setAttribute("aria-label", "שמיעת הסיפור שוב"), oe.append(F, ...l ? [l.root] : [], we, P.root, q), n.bodyEl.append(oe);
  const ge = r.use(yn(oe));
  function ve(m, b = "story-line") {
    var y;
    (y = F.querySelector(".story-line--now")) == null || y.classList.remove("story-line--now"), F.append($("p", `${b} story-line--now`, m.text)), l == null || l.root.setAttribute("aria-label", [...F.querySelectorAll(".story-line")].map((g) => g.textContent).join(" "));
  }
  function ke(m, { answer: b, before: y } = {}) {
    const g = y == null ? void 0 : y.split(" ");
    we.replaceChildren(...m.split(" ").filter(Boolean).flatMap((k, _) => {
      const V = k === "?" && b !== void 0 ? $("span", "story-solved", String(b)) : $("span", k === "?" ? "story-unknown" : "", k);
      return g && g[_] !== k && V.classList.add("story-term--new"), _ ? [" ", V] : [V];
    }));
  }
  async function ie() {
    var g, k;
    const m = ++S, b = () => m === S && o();
    if (c() && await s(ee), !b()) return;
    (g = l == null ? void 0 : l.clearCount) == null || g.call(l), l == null || l.reset(), F.replaceChildren();
    let y = "";
    for (const _ of d) {
      ve(_), ke(_.equation, u.highlight ? { before: y } : {}), y = _.equation, _.scene === "question" && !re && (re = !0, He());
      const V = i(_.say);
      if (await Promise.all([V, (k = l == null ? void 0 : l[_.scene]) == null ? void 0 : k.call(l, b, V)]), !b()) return;
    }
  }
  function _e() {
    var b;
    S++;
    const m = c();
    return (b = l == null ? void 0 : l.clearCount) == null || b.call(l), l == null || l.settle(), F.replaceChildren(), d.forEach((y) => ve(y)), ke(d[d.length - 1].equation), m;
  }
  async function wt() {
    const m = _e(), b = S, y = () => b === S && o();
    if (m && await s(ee), !y() || !(l != null && l.counting)) return;
    const { items: g, total: k } = await l.counting(y);
    for (const _ of g) {
      if (!y()) return;
      _.mark(), await i(_.say, 700, 1500);
    }
    k && y() && await i(k);
  }
  function He() {
    P.lock(!re || e.isAnswered()), q.disabled = e.isAnswered();
  }
  function qe(m) {
    if (m.action === "mark") {
      P.mark(), ge.hint(m.hint);
      return;
    }
    ge.hint(m.hint), m.action === "count" ? wt() : ie();
  }
  function gt(m) {
    if (!(!re || e.isAnswered() || m.disabled)) {
      if (!P.isRight(m)) {
        e.onWrong(() => {
          be++, P.tried(m);
          const b = h[Math.min(be, h.length) - 1];
          return v ? (async () => {
            const y = _e(), g = S;
            y && await s(ee), o() && (await v(P.valueOf(m), () => g === S && o()), o() && qe(b));
          })() : qe(b);
        });
        return;
      }
      e.onCorrect(() => {
        P.correct(m);
        const b = _e(), y = () => {
          ke(ne, { answer: p.answer }), (u.resultLine ?? !0) && ve(f, "story-line story-line--result"), ge.correct(), r.schedule(() => {
            a(f.say);
          }, b ? ee : 0);
        };
        if (!B) return y();
        const g = S, k = () => g === S && o();
        return (async () => {
          await B(k), o() && y();
        })();
      });
    }
  }
  for (const m of P.buttons) r.listen(m, "click", () => gt(m));
  if (r.listen(q, "click", () => {
    ie();
  }), e.subscribeAnswered(He), fn()) {
    const m = Ze("story-start", "▶ הַקְשִׁיבוּ לַסִּפּוּר");
    F.append(m), q.hidden = !0, r.listen(m, "click", () => {
      q.hidden = !1, ie();
    });
  } else
    ie();
  return { host: oe, get misses() {
    return be;
  } };
}
function Dn({ hintAfter: e = 2, escalateAfter: t = 4, onHint: n, onEscalate: r } = {}) {
  let o = 0;
  function s(i) {
    return i >= t ? 2 : i >= e ? 1 : 0;
  }
  return {
    /** דיווח על ניסיון שגוי. מפעיל את הקולבק המתאים ומחזיר את הרמה. */
    miss() {
      o++;
      const i = s(o);
      return i === 2 && r ? r(o) : i === 1 && n && n(o), i;
    },
    /** איפוס לקראת סיבוב חדש. */
    reset() {
      o = 0;
    },
    /** רמת העזרה הנוכחית: 0 ללא, 1 רמז עדין, 2 עזרה מוגברת. */
    get level() {
      return s(o);
    },
    /** מספר הניסיונות השגויים בסיבוב הנוכחי. */
    get misses() {
      return o;
    }
  };
}
function bn(e) {
  let t = e.querySelector(".adult-tools__panel");
  if (t) return t;
  const n = e.querySelector(".game-header");
  if (!n) return null;
  const r = document.createElement("details");
  return r.className = "adult-tools", r.innerHTML = '<summary aria-label="להורים ולמורים">☰<span>למבוגרים</span></summary><div class="adult-tools__panel"><p>להורים ולמורים</p></div>', r.addEventListener("keydown", (o) => {
    o.key === "Escape" && (r.open = !1, r.querySelector("summary").focus(), o.stopPropagation());
  }), n.appendChild(r), r.querySelector(".adult-tools__panel");
}
function On(e, t, n, r) {
  const o = bn(e);
  if (!o) return null;
  const s = document.createElement("button");
  return s.className = "btn", s.setAttribute("aria-label", n), s.textContent = `${t} ${n}`, s.onclick = (i) => {
    const a = s.closest("details");
    a && (a.open = !1), r(i);
  }, o.appendChild(s), s;
}
const wn = ["אֶפֶס", "אֶחָד", "שְׁנַיִם", "שְׁלוֹשָׁה", "אַרְבָּעָה", "חֲמִשָּׁה", "שִׁשָּׁה", "שִׁבְעָה", "שְׁמוֹנָה", "תִּשְׁעָה", "עֲשָׂרָה"], gn = ["אֶפֶס", "אַחַת", "שְׁתַּיִם", "שָׁלוֹשׁ", "אַרְבַּע", "חָמֵשׁ", "שֵׁשׁ", "שֶׁבַע", "שְׁמוֹנֶה", "תֵּשַׁע", "עֶשֶׂר"];
function me(e, t = "f") {
  return !Number.isInteger(e) || e < 0 || e > 10 ? String(e) : (t === "m" ? wn : gn)[e];
}
function zn(e, t, { digits: n = !1 } = {}) {
  return e === 1 ? `${t.one} ${me(1, t.gender)}` : n ? `${e} ${t.many}` : e === 2 ? `${t.gender === "m" ? "שְׁנֵי" : "שְׁתֵּי"} ${t.many}` : `${me(e, t.gender)} ${t.many}`;
}
function Un(e, t, n) {
  return `${me(t)} ${e === "+" ? "וְעוֹד" : "פָּחוֹת"} ${me(n)}`;
}
let I = null, E = null, it = 0, st = 0, G = null, Re = 0, Ce = 0;
const te = /* @__PURE__ */ new Map();
function at(e, t) {
  var r;
  const n = (r = document.elementFromPoint(e, t)) == null ? void 0 : r.closest('[data-drop-target="true"]');
  return n && te.has(n) && !n.matches(":disabled") && n.getAttribute("aria-disabled") !== "true" ? n : null;
}
function vn(e, t, n) {
  const r = e.getBoundingClientRect();
  it = r.width / 2, st = r.height / 2, E = e.cloneNode(!0), E.setAttribute("aria-hidden", "true"), E.setAttribute("tabindex", "-1"), Object.assign(E.style, {
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
  }), ct(t, n), document.body.appendChild(E);
}
function ct(e, t) {
  E && (E.style.transform = `translate3d(${e - it}px, ${t - st}px, 0) scale(1.12)`);
}
function kn(e, t) {
  Re = e, Ce = t, G === null && (G = requestAnimationFrame(() => {
    G = null, ct(Re, Ce), Sn(at(Re, Ce));
  }));
}
function _n() {
  G !== null && (cancelAnimationFrame(G), G = null), E == null || E.remove(), E = null;
}
let M = null;
function Sn(e) {
  M !== e && (M == null || M.classList.remove("drop-target--hover"), M = e, e == null || e.classList.add("drop-target--hover"));
}
function En() {
  M == null || M.classList.remove("drop-target--hover"), M = null;
}
function Gn(e, t, { onTap: n } = {}) {
  e.classList.add("drag-source");
  let r = null, o = null, s = null, i = null;
  function a() {
    var d;
    r && (e.removeEventListener("pointermove", r), e.removeEventListener("pointerup", o), e.removeEventListener("pointercancel", s), e.removeEventListener("lostpointercapture", s), r = o = s = null), En(), _n(), e.classList.remove("drag-source--dragging"), I = null;
    const u = i;
    i = null, u !== null && ((d = e.hasPointerCapture) != null && d.call(e, u)) && e.releasePointerCapture(u);
  }
  function c(u) {
    if (e.matches(":disabled") || e.getAttribute("aria-disabled") === "true" || u.button !== void 0 && u.button !== 0 || i !== null) return;
    u.preventDefault(), I && I.cancel(), I = { el: e, data: t, cancel: a }, i = u.pointerId;
    let d = !1;
    const l = () => {
      d = !0, e.classList.add("drag-source--dragging"), vn(e, u.clientX, u.clientY);
    }, p = (f) => Math.hypot(f.clientX - u.clientX, f.clientY - u.clientY) >= 8;
    n || l(), e.setPointerCapture(u.pointerId), r = (f) => {
      f.pointerId === i && (!d && p(f) && l(), d && kn(f.clientX, f.clientY));
    }, o = (f) => {
      if (f.pointerId !== i) return;
      const h = !d && !p(f), v = h && n ? null : at(f.clientX, f.clientY);
      if (a(), h && n) {
        n();
        return;
      }
      v && te.has(v) && te.get(v).onDrop({ data: t, sourceEl: e, targetEl: v });
    }, s = (f) => {
      f.pointerId === i && a();
    }, e.addEventListener("pointermove", r), e.addEventListener("pointerup", o), e.addEventListener("pointercancel", s), e.addEventListener("lostpointercapture", s);
  }
  return e.addEventListener("pointerdown", c), {
    destroy() {
      e.removeEventListener("pointerdown", c), (I == null ? void 0 : I.el) === e && a(), e.classList.remove("drag-source");
    }
  };
}
function Qn(e, t) {
  return e.setAttribute("data-drop-target", "true"), e.classList.add("drop-target--active"), te.set(e, { onDrop: t }), {
    destroy() {
      e.removeAttribute("data-drop-target"), e.classList.remove("drop-target--active", "drop-target--hover"), te.delete(e);
    }
  };
}
function Xn(e) {
  const t = [...e];
  for (let n = t.length - 1; n > 0; n--) {
    const r = Math.floor(Math.random() * (n + 1));
    [t[n], t[r]] = [t[r], t[n]];
  }
  return t;
}
const Ln = "alefbet-voices", T = "recordings", Nn = 1;
let Y = null;
function ye() {
  return Y || (Y = new Promise((e, t) => {
    const n = indexedDB.open(Ln, Nn);
    n.onupgradeneeded = () => {
      n.result.createObjectStore(T);
    }, n.onsuccess = () => e(n.result), n.onerror = () => {
      Y = null, t(n.error);
    };
  }), Y);
}
function $e(e, t) {
  return `${e}/${t}`;
}
async function Kn(e, t, n) {
  const r = await ye();
  return new Promise((o, s) => {
    const i = r.transaction(T, "readwrite");
    i.objectStore(T).put(n, $e(e, t)), i.oncomplete = o, i.onerror = (a) => s(a.target.error);
  });
}
async function An(e, t) {
  const n = await ye();
  return new Promise((r, o) => {
    const i = n.transaction(T, "readonly").objectStore(T).get($e(e, t));
    i.onsuccess = () => r(i.result ?? null), i.onerror = (a) => o(a.target.error);
  });
}
async function Yn(e, t) {
  const n = await ye();
  return new Promise((r, o) => {
    const s = n.transaction(T, "readwrite");
    s.objectStore(T).delete($e(e, t)), s.oncomplete = r, s.onerror = (i) => o(i.target.error);
  });
}
async function Rn(e) {
  const t = await ye();
  return new Promise((n, r) => {
    const s = t.transaction(T, "readonly").objectStore(T).getAllKeys();
    s.onsuccess = () => {
      const i = `${e}/`;
      n(
        (s.result || []).filter((a) => a.startsWith(i)).map((a) => a.slice(i.length))
      );
    }, s.onerror = (i) => r(i.target.error);
  });
}
async function Je(e, t, { signal: n } = {}) {
  if (n != null && n.aborted) return !1;
  let r;
  try {
    r = await An(e, t);
  } catch {
    return !1;
  }
  return !r || n != null && n.aborted ? !1 : await Mt(r, { signal: n }) ? !0 : n != null && n.aborted ? !1 : new Promise((o) => {
    const s = URL.createObjectURL(r), i = new Audio(s);
    let a = !1;
    const c = (d) => {
      a || (a = !0, n == null || n.removeEventListener("abort", u), i.onended = null, i.onerror = null, i.pause(), URL.revokeObjectURL(s), o(d));
    }, u = () => c(!1);
    n == null || n.addEventListener("abort", u, { once: !0 }), i.onended = () => c(!0), i.onerror = () => c(!1), i.play().catch(() => c(!1));
  });
}
const Cn = {
  a: { F1: 850, F2: 1400 },
  e: { F1: 550, F2: 2100 },
  i: { F1: 350, F2: 2700 },
  o: { F1: 550, F2: 1e3 },
  u: { F1: 350, F2: 850 }
}, ut = {
  kamatz: "a",
  patah: "a",
  tzere: "e",
  segol: "e",
  hiriq: "i",
  holam: "o",
  kubbutz: "u"
}, lt = 210, dt = 550, Mn = {
  a: { F3: 2700, bandwidths: [90, 110, 170], gains: [1, 0.5, 0.15] },
  e: { F3: 2900, bandwidths: [80, 100, 160], gains: [1, 0.55, 0.2] },
  i: { F3: 3300, bandwidths: [60, 100, 160], gains: [1, 0.6, 0.25] },
  o: { F3: 2600, bandwidths: [80, 90, 150], gains: [1, 0.5, 0.1] },
  u: { F3: 2400, bandwidths: [60, 80, 140], gains: [1, 0.45, 0.1] }
};
function he(e) {
  const t = Cn[e], n = Mn[e];
  return !t || !n ? null : {
    formants: [t.F1, t.F2, n.F3],
    bandwidths: [...n.bandwidths],
    gains: [...n.gains]
  };
}
const et = {
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
function xn(e) {
  return et[e] ?? et[""];
}
function Zn() {
  return pe() !== null;
}
let se = null;
function Tn(e) {
  if (se && se.sampleRate === e.sampleRate) return se;
  const t = e.sampleRate, n = e.createBuffer(1, t, e.sampleRate), r = n.getChannelData(0);
  for (let o = 0; o < t; o++) r[o] = Math.random() * 2 - 1;
  return se = n, n;
}
function ft(e, t, n, r = e.destination) {
  const o = e.createOscillator();
  o.type = "sawtooth", o.frequency.value = n;
  const s = e.createGain();
  s.gain.value = 0;
  const i = t.formants.map((a, c) => {
    const u = e.createBiquadFilter();
    u.type = "bandpass", u.frequency.value = a, u.Q.value = a / t.bandwidths[c];
    const d = e.createGain();
    return d.gain.value = t.gains[c], o.connect(u), u.connect(d), d.connect(s), u;
  });
  return s.connect(r), { source: o, filters: i, master: s };
}
function Me(e, t, n, r, o = e.destination) {
  const s = n.durationMs / 1e3, i = e.createBufferSource();
  i.buffer = Tn(e), i.loop = !0;
  const a = e.createBiquadFilter();
  a.type = "bandpass", a.frequency.value = n.noiseHz ?? 2e3, a.Q.value = n.noiseQ ?? 1;
  const c = e.createGain();
  return c.gain.setValueAtTime(0, t), c.gain.linearRampToValueAtTime(r, t + Math.min(0.01, s / 3)), c.gain.linearRampToValueAtTime(1e-4, t + s), i.connect(a), a.connect(c), c.connect(o), i.start(t), i.stop(t + s + 0.02), t + s;
}
function mt(e, t, n, r, o, s, i = e.destination) {
  const a = r / 1e3, { source: c, filters: u, master: d } = ft(e, n, o, i);
  if (c.frequency.setValueAtTime(o * 1.04, t), c.frequency.linearRampToValueAtTime(o * 0.92, t + a), s) {
    const f = Math.min(0.09, a / 3);
    u.forEach((h, v) => {
      const B = s[v];
      B && (h.frequency.setValueAtTime(B, t), h.frequency.exponentialRampToValueAtTime(n.formants[v], t + f));
    });
  }
  const l = 0.04, p = 0.12;
  return d.gain.setValueAtTime(0, t), d.gain.linearRampToValueAtTime(0.5, t + l), d.gain.setValueAtTime(0.5, t + a - p), d.gain.linearRampToValueAtTime(1e-4, t + a), c.start(t), c.stop(t + a + 0.05), t + a;
}
function Fn(e, t, n, r, o = e.destination) {
  const s = n / 1e3, i = { formants: [250, 1100, 2200], bandwidths: [80, 200, 300], gains: [1, 0.12, 0.05] }, { source: a, master: c } = ft(e, i, r, o);
  return c.gain.setValueAtTime(0, t), c.gain.linearRampToValueAtTime(0.35, t + 0.02), c.gain.setValueAtTime(0.35, t + s - 0.02), c.gain.linearRampToValueAtTime(1e-4, t + s), a.start(t), a.stop(t + s + 0.05), t + s;
}
function ht(e, t, n, r) {
  const o = Math.max(0, (t - e.currentTime) * 1e3) + 60;
  return new Promise((s) => {
    const i = () => {
      clearTimeout(a), r == null || r.removeEventListener("abort", i), n.disconnect(), s(!(r != null && r.aborted));
    }, a = setTimeout(i, o);
    r == null || r.addEventListener("abort", i, { once: !0 }), r != null && r.aborted && i();
  });
}
async function Pn(e, t = {}) {
  var i, a;
  const n = he(e);
  if (!n || (i = t.signal) != null && i.aborted) return !1;
  const r = await Ie();
  if (!r || (a = t.signal) != null && a.aborted) return !1;
  let o, s;
  try {
    s = r.createGain(), s.connect(r.destination);
    const c = r.currentTime + 0.03;
    o = mt(r, c, n, t.durationMs ?? dt, t.pitchHz ?? lt, null, s);
  } catch {
    return s == null || s.disconnect(), !1;
  }
  return ht(r, o, s, t.signal);
}
async function Pe(e, t, n = {}) {
  var d, l;
  const r = he(t);
  if (!r || (d = n.signal) != null && d.aborted) return !1;
  const o = await Ie();
  if (!o || (l = n.signal) != null && l.aborted) return !1;
  const s = xn(e), i = n.pitchHz ?? lt, a = n.durationMs ?? dt;
  let c, u;
  try {
    u = o.createGain(), u.connect(o.destination), c = Bn(o, s, e, r, a, i, u);
  } catch {
    return u == null || u.disconnect(), !1;
  }
  return ht(o, c, u, n.signal);
}
function Bn(e, t, n, r, o, s, i = e.destination) {
  let a = e.currentTime + 0.03, c = null;
  switch (t.type) {
    case "plosive": {
      a = Me(e, a, t, t.voiced ? 0.25 : 0.35, i), a += 0.01;
      break;
    }
    case "fricative": {
      a = Me(e, a, t, 0.22, i) - 0.03;
      break;
    }
    case "affricate": {
      a += 0.03, a = Me(e, a, { ...t, durationMs: t.durationMs - 30 }, 0.3, i) - 0.02;
      break;
    }
    case "nasal": {
      a = Fn(e, a, t.durationMs, s, i), c = [300, 1300, 2300];
      break;
    }
    case "liquid": {
      c = n === "r" ? [450, 1300, 1600] : [380, 1e3, 2600];
      break;
    }
    case "glide": {
      const u = he(n === "y" ? "i" : "u");
      c = u ? u.formants : null;
      break;
    }
  }
  return mt(e, a, r, o, s, c, i);
}
const Be = "sound-bank";
function pt(e) {
  return `letter:${e}`;
}
function yt(e) {
  return `nikud:${e}`;
}
function bt(e, t) {
  return `syllable:${e}:${t}`;
}
function Jn() {
  const e = [];
  for (const t of z)
    e.push({ key: pt(t.letter), label: t.nameNikud, group: "letters" });
  for (const t of x)
    e.push({ key: yt(t.id), label: `${t.nameNikud} (${t.sound})`, group: "nikud" });
  for (const t of zt)
    for (const n of x)
      e.push({
        key: bt(t, n.id),
        label: Ut(t, n.symbol),
        group: "syllables"
      });
  return e;
}
function In() {
  return typeof navigator < "u" && navigator.onLine === !1;
}
async function We(e, t = void 0) {
  try {
    return typeof indexedDB > "u" ? !1 : await (t ? Je(Be, e, t) : Je(Be, e));
  } catch {
    return !1;
  }
}
async function je(e) {
  if (In() && !$n()) return !1;
  try {
    return await e(), L.audioState !== "failed" && L.audioState !== "unsupported";
  } catch {
    return !1;
  }
}
function $n() {
  return typeof speechSynthesis < "u";
}
async function er() {
  try {
    return typeof indexedDB > "u" ? [] : await Rn(Be);
  } catch {
    return [];
  }
}
async function tr(e) {
  if (await We(pt(e))) return "bank";
  const t = rt(e), n = t ? t.nameNikud : e;
  return await je(() => L.speak(n)) ? "tts" : t && await Pe(t.sound, "a", { durationMs: 400 }) ? "synth" : "none";
}
async function nr(e) {
  if (await We(yt(e))) return "bank";
  if (await je(() => L.speakVowel(e))) return "tts";
  const t = ut[e];
  return t && await Pn(t) ? "synth" : "none";
}
async function rr(e, t, n = {}) {
  const { signal: r } = n;
  if (r != null && r.aborted) return "none";
  if (await We(bt(e, t), r ? n : void 0)) return "bank";
  if (r != null && r.aborted) return "none";
  const o = x.find((c) => c.id === t), s = () => L.cancel();
  r == null || r.addEventListener("abort", s, { once: !0 });
  try {
    if (o && await je(() => L.speakNikud(e, o.symbol)))
      return r != null && r.aborted ? "none" : "tts";
  } finally {
    r == null || r.removeEventListener("abort", s);
  }
  if (r != null && r.aborted) return "none";
  const i = rt(e), a = ut[t];
  return a && await (r ? Pe(i ? i.sound : "", a, n) : Pe(i ? i.sound : "", a)) ? "synth" : "none";
}
function or(e, t) {
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
  let s = `
    <div style="background:white; padding:1.5rem; border-radius:1rem; min-width:300px; text-align:center; color:#333; font-family:Heebo,Arial; direction:rtl;">
      <h2 style="margin-top:0">בחר ניקוד</h2>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; margin:1rem 0; text-align:right;">
  `;
  x.forEach((u) => {
    const d = o.length === 0 || o.includes(u.id) || o.includes(u.name);
    s += `
      <label style="display:flex; align-items:center; gap:0.5rem; cursor:pointer;">
        <input type="checkbox" value="${u.id}" class="nikud-filter-cb" ${d ? "checked" : ""} style="width:1.2rem;height:1.2rem;">
        <span>${u.nameNikud}</span>
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
  const a = (
    /** @type {HTMLInputElement} */
    document.getElementById("nikud-rate-slider")
  ), c = document.getElementById("nikud-rate-val");
  a.oninput = () => {
    c.textContent = a.value;
  }, document.getElementById("save-settings-btn").onclick = () => {
    const u = parseFloat(a.value);
    localStorage.setItem("alefbet.nikudRate", String(u)), L.setNikudEmphasis({ rate: u });
    const d = Array.from(n.querySelectorAll(".nikud-filter-cb")).filter((p) => (
      /** @type {HTMLInputElement} */
      p.checked
    )).map((p) => (
      /** @type {HTMLInputElement} */
      p.value
    )), l = new URL(window.location.href);
    d.length > 0 && d.length < x.length ? l.searchParams.set("allowedNikud", d.join(",")) : l.searchParams.delete("allowedNikud"), l.searchParams.delete("excludedNikud"), n.style.display = "none", window.history.replaceState({}, "", l), t && t(e);
  }, document.getElementById("close-settings-btn").onclick = () => {
    n.style.display = "none";
  };
}
export {
  ut as NIKUD_VOWEL,
  Be as SOUND_BANK_ID,
  Cn as VOWEL_TEMPLATES,
  ce as animate,
  sn as bootstrapGame,
  zn as countNoun,
  Hn as createChoiceRound,
  Gn as createDragSource,
  Qn as createDropTarget,
  yn as createFeedback,
  Dn as createHintTracker,
  dn as createNarrator,
  jt as createProgressBar,
  Nt as createRoundScope,
  Vn as createStoryRound,
  Yn as deleteVoice,
  Un as exerciseWords,
  pe as getAudioContext,
  rt as getLetter,
  Ot as getLettersByGroup,
  On as injectHeaderButton,
  Zn as isSynthSupported,
  Ut as letterWithNikud,
  An as loadVoice,
  Et as lockPageZoom,
  zt as nikudBaseLetters,
  x as nikudList,
  me as numberWord,
  Je as playVoice,
  Wn as randomLetters,
  jn as randomNikud,
  pn as randomPraise,
  qn as randomRetryHint,
  er as recordedKeys,
  an as runGame,
  Kn as saveVoice,
  $t as showCompletionScreen,
  or as showNikudSettingsDialog,
  Xn as shuffle,
  de as sounds,
  tr as speakLetter,
  nr as speakNikudSound,
  rr as speakSyllable,
  Jn as standardSoundKeys,
  L as tts
};
