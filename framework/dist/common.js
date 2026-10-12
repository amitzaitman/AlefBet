let C = null;
function ie() {
  return typeof window > "u" ? null : window.AudioContext || /** @type {any} */
  window.webkitAudioContext || null;
}
function P() {
  const e = ie();
  if (!e) return null;
  if (!C)
    try {
      C = new e();
    } catch {
      return null;
    }
  return C;
}
async function Fe() {
  const e = P();
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
async function oe() {
  const e = P();
  if (!e) return null;
  if (e.state === "suspended")
    try {
      await e.resume();
    } catch {
    }
  return e.state === "running" ? e : null;
}
function ae(e) {
  return typeof e.arrayBuffer == "function" ? e.arrayBuffer() : new Promise((t, n) => {
    const r = new FileReader();
    r.onload = () => t(
      /** @type {ArrayBuffer} */
      r.result
    ), r.onerror = () => n(r.error), r.readAsArrayBuffer(e);
  });
}
async function Xe(e, { signal: t } = {}) {
  if (t != null && t.aborted || !e) return !1;
  const n = await oe();
  if (t != null && t.aborted || !n || typeof n.decodeAudioData != "function") return !1;
  let r;
  try {
    const s = await ae(e);
    r = await new Promise((i, o) => {
      const a = n.decodeAudioData(s, i, o);
      a && typeof a.then == "function" && a.then(i, o);
    });
  } catch {
    return !1;
  }
  return t != null && t.aborted ? !1 : new Promise((s) => {
    let i, o, a = !1;
    const d = (l) => {
      if (!a) {
        if (a = !0, clearTimeout(o), t == null || t.removeEventListener("abort", c), i) {
          i.onended = null;
          try {
            i.stop(), i.disconnect();
          } catch {
          }
        }
        s(l);
      }
    }, c = () => d(!1);
    try {
      i = n.createBufferSource(), i.buffer = r, i.connect(n.destination), i.onended = () => d(!0), t == null || t.addEventListener("abort", c, { once: !0 }), o = setTimeout(() => d(!0), (r.duration + 0.5) * 1e3), i.start(0);
    } catch {
      d(!1);
    }
  });
}
const B = "alefbet-audio-status-banner";
function de(e) {
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
function Ue(e = typeof document < "u" ? document.body : null, t = {}) {
  const n = t.window || (typeof window < "u" ? window : null);
  if (!e || !n)
    return { destroy() {
    } };
  const r = e.querySelector("#" + B);
  r && r.parentNode && r.parentNode.removeChild(r);
  const s = e.ownerDocument.createElement("div");
  s.id = B, s.className = "alefbet-audio-banner", s.setAttribute("role", "status"), s.setAttribute("aria-live", "polite"), s.dir = "rtl", s.hidden = !0;
  const i = e.ownerDocument.createElement("span");
  i.className = "alefbet-audio-banner__msg", s.appendChild(i);
  const o = e.ownerDocument.createElement("button");
  o.type = "button", o.className = "alefbet-audio-banner__dismiss", o.setAttribute("aria-label", "סְגוֹר הוֹדָעָה"), o.textContent = "×", o.hidden = !0, s.appendChild(o), e.appendChild(s);
  let a = null;
  function d() {
    a && (clearTimeout(a), a = null);
  }
  function c() {
    d(), s.hidden = !0, s.classList.remove("is-visible", "is-await", "is-unsupported", "is-failed"), s.onclick = null, o.hidden = !0;
  }
  function l(m) {
    const u = de(m);
    if (!u) {
      c();
      return;
    }
    d(), i.textContent = u.message, s.hidden = !1, s.classList.add("is-visible"), s.classList.toggle("is-await", u.kind === "await"), s.classList.toggle("is-unsupported", u.kind === "unsupported"), s.classList.toggle("is-failed", u.kind === "failed"), u.kind, u.kind === "await" ? (s.onclick = () => {
      try {
        e.ownerDocument.body.dispatchEvent(new MouseEvent("pointerdown", { bubbles: !0 }));
      } catch {
      }
      c();
    }, o.hidden = !0) : u.kind === "unsupported" ? (s.onclick = null, o.hidden = !1, o.onclick = (h) => {
      h.stopPropagation(), c();
    }) : u.kind === "failed" && (s.onclick = null, o.hidden = !0, a = setTimeout(() => c(), 6e3));
  }
  function f(m) {
    const h = /** @type {CustomEvent} */ (m.detail || {}).state;
    if (h === "ready" || h === "idle") {
      c();
      return;
    }
    l(h);
  }
  return n.addEventListener("alefbet:tts-state", f), {
    destroy() {
      n.removeEventListener("alefbet:tts-state", f), d(), s.parentNode && s.parentNode.removeChild(s);
    }
  };
}
class ue {
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
class ce {
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
const le = "alefbet-zoom-lock", F = /* @__PURE__ */ new WeakSet();
function $(e) {
  e.cancelable && e.preventDefault();
}
function fe(e) {
  const t = (
    /** @type {TouchEvent} */
    e.touches
  );
  t && t.length > 1 && $(e);
}
function he(e = typeof document < "u" ? document : null) {
  if (!e || F.has(e)) return !1;
  F.add(e), e.documentElement.classList.add(le);
  const t = { passive: !1 };
  return e.addEventListener("gesturestart", $, t), e.addEventListener("gesturechange", $, t), e.addEventListener("touchmove", fe, t), !0;
}
const S = /* @__PURE__ */ new WeakMap();
function J(e) {
  var t;
  (t = S.get(e)) == null || t.end();
}
class me {
  /**
   * @param {HTMLElement} containerEl - אלמנט המיכל
   * @param {object} config - הגדרות: { totalRounds, title, homeUrl }
   */
  constructor(t, n = {}) {
    J(t), S.set(t, this), this.ended = !1, this._timers = /* @__PURE__ */ new Set(), this.container = t, this.config = {
      totalRounds: 8,
      title: "מִשְׂחָק",
      homeUrl: "../../index.html",
      ...n
    }, this.events = new ue(), this.state = new ce(this.config.totalRounds), this.gameId = typeof n.gameId == "string" ? n.gameId : "", this._buildShell();
  }
  _buildShell() {
    this.container.classList.add("alefbet-game"), he(this.container.ownerDocument);
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
      this._timers.clear(), S.get(this.container) === this && S.delete(this.container), this.events.emit("end", { score: t, state: this.state });
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
  /** קבל את מצב המשחק הנוכחי */
  getState() {
    return this.state;
  }
  /** הירשם לאירועי מחזור החיים: start, round, end */
  on(t, n) {
    return this.events.on(t, n), this;
  }
}
function je(e) {
  const t = [...e];
  for (let n = t.length - 1; n > 0; n--) {
    const r = Math.floor(Math.random() * (n + 1));
    [t[n], t[r]] = [t[r], t[n]];
  }
  return t;
}
function pe() {
  const e = P();
  return e ? (e.state === "suspended" && e.resume(), e) : null;
}
function w(e, t, n = "sine", r = 0.3) {
  const s = pe();
  if (s)
    try {
      const i = s.createOscillator(), o = s.createGain();
      i.connect(o), o.connect(s.destination), i.type = n, i.frequency.setValueAtTime(e, s.currentTime), o.gain.setValueAtTime(r, s.currentTime), o.gain.exponentialRampToValueAtTime(1e-3, s.currentTime + t), i.start(s.currentTime), i.stop(s.currentTime + t + 0.05);
    } catch {
    }
}
const L = {
  /** צליל תשובה נכונה */
  correct() {
    w(523.25, 0.15), setTimeout(() => w(659.25, 0.2), 120), setTimeout(() => w(783.99, 0.3), 240);
  },
  /** צליל עידוד עדין — נסה שוב */
  wrong() {
    w(350, 0.15, "triangle", 0.12);
  },
  /** צליל עידוד - סיום מוצלח */
  cheer() {
    [523.25, 587.33, 659.25, 698.46, 783.99, 1046.5].forEach((t, n) => setTimeout(() => w(t, 0.2), n * 90));
  },
  /** קליק עדין */
  click() {
    w(900, 0.04, "sine", 0.12);
  }
}, X = {
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
}, ge = {
  shake: 420,
  bounce: 480,
  pulse: 600,
  fadeIn: 320,
  confetti: 700
};
function x(e, t) {
  !e || !X[t] || e.animate(X[t], {
    duration: ge[t] || 400,
    easing: "ease-in-out",
    fill: "none"
  });
}
function z(e, t) {
  const n = [];
  function r() {
    try {
      const a = localStorage.getItem(e);
      return a === null ? t : JSON.parse(a);
    } catch {
      return t;
    }
  }
  function s(a) {
    try {
      localStorage.setItem(e, JSON.stringify(a));
    } catch (d) {
      return console.warn(`[createLocalState] שגיאה בשמירת "${e}":`, d), !1;
    }
    return n.forEach((d) => d(a)), !0;
  }
  function i(a) {
    return s(a(r()));
  }
  function o(a) {
    return n.push(a), function() {
      const c = n.indexOf(a);
      c !== -1 && n.splice(c, 1);
    };
  }
  return { get: r, set: s, update: i, subscribe: o };
}
const _e = "alefbet.progress.v1", O = z(_e, {});
function K(e, t) {
  if (!Number.isFinite(e) || !Number.isFinite(t) || t <= 0) return 1;
  const n = e / t;
  return n >= 0.8 ? 3 : n >= 0.5 ? 2 : 1;
}
function be(e, { score: t, total: n }) {
  if (!e || !Number.isFinite(t) || !Number.isFinite(n) || n <= 0) return null;
  const r = K(t, n);
  let s = null;
  return O.update((i) => {
    const o = i[e];
    return s = {
      plays: ((o == null ? void 0 : o.plays) ?? 0) + 1,
      bestScore: Math.max((o == null ? void 0 : o.bestScore) ?? 0, t),
      bestStars: Math.max((o == null ? void 0 : o.bestStars) ?? 0, r),
      total: o && (o.bestScore ?? 0) > t ? o.total : n,
      lastPlayed: Date.now()
    }, { ...i, [e]: s };
  }), s;
}
function Ge(e) {
  return O.get()[e] ?? null;
}
function Ye() {
  return O.get();
}
function ye(e, t, n, r, s = {}) {
  L.cheer(), s.gameId && be(s.gameId, { score: t, total: n });
  const i = s.completionOnly ? n === 1 ? "הִשְׁלַמְתֶּם מְשִׂימָה!" : `הִשְׁלַמְתֶּם ${n} מְשִׂימוֹת!` : `נִיקּוּד: ${t} מִתּוֹךְ ${n}`, o = K(t, n), a = "⭐".repeat(o) + "☆".repeat(3 - o), d = document.createElement("div");
  d.className = "completion-screen", d.innerHTML = `
    <div class="completion-screen__content">
      <div class="completion-screen__stars" aria-label="${o} כּוֹכָבִים">${a}</div>
      <h2 class="completion-screen__title">כָּל הַכָּבוֹד!</h2>
      <p class="completion-screen__score">${i}</p>
      <div class="completion-screen__actions">
        <button class="completion-screen__replay btn btn--primary">שַׂחֵק שׁוּב</button>
      </div>
    </div>
  `;
  const c = s.homeUrl === void 0 ? "../../index.html" : s.homeUrl;
  if (c) {
    const l = document.createElement("a");
    l.className = "completion-screen__home btn", l.href = c, l.textContent = "בְּחִירַת מִשְׂחָק", d.querySelector(".completion-screen__actions").appendChild(l);
  }
  d.querySelector(".completion-screen__replay").addEventListener("click", () => {
    d.remove(), r();
  }), e.innerHTML = "", e.appendChild(d), x(d.querySelector(".completion-screen__content"), "fadeIn");
}
function we(e, t, {
  totalRounds: n,
  progressBar: r = null,
  buildRoundUI: s,
  onCorrect: i,
  onWrong: o,
  transitionMs: a = 800,
  playCorrectSound: d = !0,
  completionOnly: c = !1,
  onReplay: l = () => location.reload()
}) {
  let f = !1;
  const m = /* @__PURE__ */ new Set();
  function u(p) {
    f = p || e.ended, m.forEach((q) => q(f));
  }
  function h(p) {
    return m.add(p), p(f || e.ended), () => {
      m.delete(p);
    };
  }
  e.on("end", () => {
    u(!0), m.clear();
  });
  async function y(p) {
    if (f || e.ended) return;
    u(!0), d && L.correct();
    try {
      if (p && await p(), e.ended) return;
      i && await i();
    } catch (se) {
      throw u(!1), se;
    }
    if (e.ended || (e.state.addScore(1), r == null || r.update(e.state.currentRound), !await e.delay(a))) return;
    e.nextRound() ? (u(!1), s()) : ye(t, e.state.score, n, l, { gameId: e.gameId, completionOnly: c, homeUrl: e.config.homeUrl });
  }
  async function te(p) {
    if (!(f || e.ended)) {
      u(!0);
      try {
        p && await p(), !e.ended && o && await o();
      } finally {
        u(!1);
      }
    }
  }
  function ne() {
    return f;
  }
  function re() {
    u(!1);
  }
  return { handleCorrect: y, handleWrong: te, isAnswered: ne, reset: re, subscribe: h };
}
function ve() {
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
    listen(r, s, i, o) {
      e.signal.aborted || (r.addEventListener(s, i, o), n(() => r.removeEventListener(s, i, o)));
    },
    schedule(r, s) {
      if (e.signal.aborted) return () => {
      };
      const i = () => {
        clearTimeout(o), t.delete(i);
      }, o = setTimeout(() => {
        t.delete(i), e.signal.aborted || r();
      }, s);
      return n(i), i;
    },
    dispose() {
      if (e.signal.aborted) return;
      e.abort();
      const r = [...t].reverse();
      t.clear();
      for (const s of r)
        try {
          s();
        } catch (i) {
          console.warn("Round cleanup failed", i);
        }
    }
  };
}
function Ee(e, t) {
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
  ), s = n.querySelector(".progress-bar__label");
  return {
    /** עדכן את ההתקדמות */
    update(i) {
      const o = Math.round(i / t * 100);
      r.style.width = `${o}%`, s.textContent = `${i} / ${t}`, n.setAttribute("aria-valuenow", String(i));
    },
    /** הסר את הרכיב */
    destroy() {
      n.remove();
    }
  };
}
let T = !1, D = !1, E = null;
const Re = [
  "ResizeObserver loop",
  // אזהרת דפדפן שפירה
  "Script error."
  // שגיאת cross-origin אטומה, לרוב תוסף דפדפן
];
function U(e) {
  const t = String(e || "");
  return Re.some((n) => t.includes(n));
}
function j() {
  var t;
  if (D || typeof document > "u" || !document.body) return;
  D = !0;
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
function Se() {
  if (typeof window > "u") return { destroy() {
  } };
  if (T) return { destroy() {
  } };
  T = !0;
  const e = (n) => {
    U(n == null ? void 0 : n.message) || (console.error("[alefbet] uncaught error:", (n == null ? void 0 : n.error) ?? (n == null ? void 0 : n.message)), j());
  }, t = (n) => {
    const r = (
      /** @type {any} */
      n == null ? void 0 : n.reason
    );
    U((r == null ? void 0 : r.message) ?? r) || (console.error("[alefbet] unhandled rejection:", r), j());
  };
  return window.addEventListener("error", e), window.addEventListener("unhandledrejection", t), E = () => {
    window.removeEventListener("error", e), window.removeEventListener("unhandledrejection", t), T = !1, D = !1;
  }, { destroy: () => {
    E == null || E(), E = null;
  } };
}
function xe(e, t = "טוֹעֵן...") {
  e.innerHTML = `<div class="ab-loading">${t}</div>`;
}
function Le(e) {
  e.innerHTML = "";
}
function k(e) {
  return e !== null && typeof e == "object" && !Array.isArray(e);
}
function G(e) {
  if (!k(e) || typeof e.id != "string" || !e.id || !Array.isArray(e.rounds) || !e.rounds.every(k) || e.meta !== void 0 && !k(e.meta) || e.distractors !== void 0 && !Array.isArray(e.distractors))
    throw new Error("Invalid game content");
  const t = e.version ?? 1;
  if (!Number.isInteger(t) || Number(t) < 1) throw new Error("Invalid content version");
  const n = /* @__PURE__ */ new Set();
  for (const r of e.rounds)
    if (r.id !== void 0) {
      if (typeof r.id != "string" || !r.id || n.has(r.id)) throw new Error("Invalid round id");
      n.add(r.id);
    }
  return { ...e, version: t };
}
let Ae = 0;
function I() {
  return `round-${Date.now()}-${Ae++}`;
}
class A {
  // redo stack
  constructor(t, n) {
    this._contract = n, this._id = t.id ?? "game", this._version = t.version ?? 1, this._meta = { title: "", type: "multiple-choice", ...t.meta ?? {} }, this._rounds = (t.rounds ?? []).map((r) => ({ ...r, id: r.id || I() })), this._distractors = t.distractors ?? [], this._handlers = [], this._past = [], this._future = [];
  }
  // ── Identity ──────────────────────────────────────────────────────────────
  get id() {
    return this._id;
  }
  get meta() {
    return { ...this._meta };
  }
  get distractors() {
    return [...this._distractors];
  }
  // ── Rounds (read) ─────────────────────────────────────────────────────────
  get rounds() {
    return [...this._rounds];
  }
  getRound(t) {
    return this._rounds.find((n) => n.id === t) ?? null;
  }
  getRoundIndex(t) {
    return this._rounds.findIndex((n) => n.id === t);
  }
  // ── Rounds (write) ────────────────────────────────────────────────────────
  updateRound(t, n) {
    const r = this.getRoundIndex(t);
    r !== -1 && (this._saveHistory(), this._rounds[r] = { ...this._rounds[r], ...n }, this._emit());
  }
  addRound(t = null) {
    var r;
    this._saveHistory();
    const n = { ...(r = this._contract) == null ? void 0 : r.createRound(), id: I() };
    if (t === null)
      this._rounds.push(n);
    else {
      const s = this.getRoundIndex(t);
      this._rounds.splice(s + 1, 0, n);
    }
    return this._emit(), n.id;
  }
  duplicateRound(t) {
    const n = this.getRound(t);
    if (!n) return null;
    this._saveHistory();
    const r = { ...n, id: I() };
    return this._rounds.splice(this.getRoundIndex(t) + 1, 0, r), this._emit(), r.id;
  }
  removeRound(t) {
    const n = this.getRoundIndex(t);
    n === -1 || this._rounds.length <= 1 || (this._saveHistory(), this._rounds.splice(n, 1), this._emit());
  }
  moveRound(t, n) {
    const r = this.getRoundIndex(t);
    if (r === -1) return;
    this._saveHistory();
    const [s] = this._rounds.splice(r, 1);
    this._rounds.splice(Math.max(0, Math.min(n, this._rounds.length)), 0, s), this._emit();
  }
  // ── Undo / Redo ───────────────────────────────────────────────────────────
  get canUndo() {
    return this._past.length > 0;
  }
  get canRedo() {
    return this._future.length > 0;
  }
  undo() {
    this.canUndo && (this._future.push(this._snapshot()), this._rounds = this._past.pop(), this._emit());
  }
  redo() {
    this.canRedo && (this._past.push(this._snapshot()), this._rounds = this._future.pop(), this._emit());
  }
  _saveHistory() {
    this._past.push(this._snapshot()), this._future = [], this._past.length > 50 && this._past.shift();
  }
  _snapshot() {
    return this._rounds.map((t) => ({ ...t }));
  }
  // ── Change events ─────────────────────────────────────────────────────────
  onChange(t) {
    return this._handlers.push(t), () => this.offChange(t);
  }
  offChange(t) {
    const n = this._handlers.indexOf(t);
    n !== -1 && this._handlers.splice(n, 1);
  }
  _emit() {
    this._handlers.forEach((t) => t(this));
  }
  // ── Serialisation ─────────────────────────────────────────────────────────
  toJSON() {
    return {
      id: this._id,
      version: this._version,
      meta: { ...this._meta },
      rounds: this._snapshot(),
      distractors: [...this._distractors]
    };
  }
  validate() {
    return !this._contract || this._rounds.every((t) => this._contract.validateRound(t));
  }
  static fromJSON(t, n) {
    let r = G(t);
    const s = (n == null ? void 0 : n.version) ?? 1;
    if (r.version < s && (n != null && n.migrate)) {
      const o = r.id;
      if (r = G(n.migrate(r)), r.id !== o) throw new Error("Migration changed game identity");
    }
    if (r.version !== s) throw new Error("Unsupported content version");
    const i = new A(r, n);
    if (!i.validate()) throw new Error("Invalid round content");
    return i;
  }
  static fromRoundsArray(t, n, r = {}, s = [], i) {
    return new A({ id: t, meta: r, rounds: n, distractors: s, version: (i == null ? void 0 : i.version) ?? 1 }, i);
  }
}
const Ce = "alefbet.editor.";
function Te(e) {
  return z(`${Ce}${e}`, null);
}
function ke(e, t) {
  const n = Te(e).get();
  if (!n) return null;
  try {
    const r = A.fromJSON(n, t);
    return r.id === e ? r : null;
  } catch {
    return null;
  }
}
const N = /* @__PURE__ */ new WeakMap();
async function Ie(e, t) {
  var a;
  J(e);
  const n = {};
  if (N.set(e, n), Se(), xe(e, t.loadingMessage ?? "טוֹעֵן..."), (a = t.preloadTexts) != null && a.length) {
    const { preloadNikud: d } = await import("./nakdan-DFzp_6d3.js");
    await d(t.preloadTexts);
  }
  const r = t.audio !== !1 ? await import("./game-audio-DWDnzTwh.js").then((d) => d.e) : null;
  if (N.get(e) !== n)
    return { shell: null, activeRounds: [], aborted: !0 };
  if (t.onBeforeHide && (await t.onBeforeHide() === !1 || N.get(e) !== n))
    return { shell: null, activeRounds: [], aborted: !0 };
  Le(e);
  const s = t.editor ? ke(t.gameId, t.editor.content) : null, i = s != null && s.rounds.length ? s.rounds : t.defaultRounds ?? [], o = new me(e, {
    totalRounds: t.totalRounds ?? i.length,
    title: t.title,
    gameId: t.gameId
  });
  return r == null || r.attachGameAudio(o), { shell: o, activeRounds: i, aborted: !1 };
}
async function Ne(e, t) {
  const n = await Ie(e, t);
  if (n.aborted) return n;
  const { shell: r, activeRounds: s } = n;
  if (!s.length)
    return r.bodyEl.textContent = "אֵין סִבּוּבִים לַמִּשְׂחָק.", r.end(), n;
  const i = Ee(r.footerEl, s.length);
  let o;
  const a = () => {
    o == null || o.dispose(), o = void 0;
  }, d = we(r, e, {
    totalRounds: s.length,
    completionOnly: !0,
    progressBar: i,
    transitionMs: t.transitionMs,
    playCorrectSound: t.playCorrectSound,
    onReplay: t.onReplay ?? (() => {
      Ne(e, t);
    }),
    buildRoundUI: c
  });
  r.on("end", a), r.on("start", () => {
    var l;
    i.update(0), (l = t.onStart) == null || l.call(t, r), d.reset();
  }), r.on("start", c);
  function c() {
    a(), r.bodyEl.innerHTML = "";
    const l = ve();
    o = l;
    const f = () => !r.ended && !l.signal.aborted, m = r.state.currentRound - 1;
    try {
      const u = t.buildRound({
        shell: r,
        index: m,
        round: s[m],
        isActive: f,
        scope: l,
        isAnswered: () => !f() || d.isAnswered(),
        subscribeAnswered: (h) => f() ? l.use(d.subscribe(h)) : (h(!0), () => {
        }),
        onCorrect: async (h) => {
          f() && await d.handleCorrect(h);
        },
        onWrong: async (h) => {
          f() && await d.handleWrong(h);
        },
        schedule: l.schedule
      });
      u && l.use(u);
    } catch (u) {
      throw l.dispose(), u;
    }
  }
  return r.start(), n;
}
function Me(e, t, n) {
  e.innerHTML = "";
  const r = document.createElement("div");
  r.className = "option-cards-grid";
  const s = t.map((i) => {
    const o = document.createElement("button");
    o.className = "option-card", o.dataset.id = i.id, o.type = "button";
    const a = document.createElement("span");
    a.className = "option-card__emoji", a.textContent = i.emoji || "";
    const d = document.createElement("span");
    return d.className = "option-card__text", d.textContent = i.text, o.append(a, d), o.addEventListener("click", () => {
      o.disabled || n(i);
    }), r.appendChild(o), { el: o, option: i };
  });
  return e.appendChild(r), {
    /** הַדָּגֵשׁ כַּרְטִיס לְפִי סוּג: 'correct' | 'wrong' | 'hint' */
    highlight(i, o) {
      s.forEach(({ el: a, option: d }) => {
        d.id === i && a.classList.add(`option-card--${o}`);
      });
    },
    /** Visual hints never change the answer lock or other highlights. */
    clearHighlight(i, o) {
      s.forEach(({ el: a, option: d }) => {
        d.id === i && a.classList.remove(`option-card--${o}`);
      });
    },
    setDisabled(i) {
      s.forEach(({ el: o }) => {
        o.disabled = i;
      });
    },
    /** נטרל את כל הכרטיסים */
    disable() {
      s.forEach(({ el: i }) => {
        i.disabled = !0;
      });
    },
    /** אפס את מצב הכרטיסים */
    reset() {
      s.forEach(({ el: i }) => {
        i.className = "option-card", i.disabled = !1;
      });
    },
    /** הסר את הרכיב */
    destroy() {
      e.innerHTML = "";
    }
  };
}
function We(e, t, n) {
  const r = e.scope.use(Me(t, n.options, (s) => {
    e.isAnswered() || (n.isCorrect(s) ? e.onCorrect(() => {
      var i;
      return r.highlight(s.id, "correct"), (i = n.onCorrect) == null ? void 0 : i.call(n, s);
    }) : e.onWrong(() => {
      var i;
      return (i = n.onWrong) == null ? void 0 : i.call(n, s);
    }));
  }));
  return e.subscribeAnswered((s) => r.setDisabled(s)), { highlight: r.highlight, clearHighlight: r.clearHighlight };
}
function Je({ hintAfter: e = 2, escalateAfter: t = 4, onHint: n, onEscalate: r } = {}) {
  let s = 0;
  function i(o) {
    return o >= t ? 2 : o >= e ? 1 : 0;
  }
  return {
    /** דיווח על ניסיון שגוי. מפעיל את הקולבק המתאים ומחזיר את הרמה. */
    miss() {
      s++;
      const o = i(s);
      return o === 2 && r ? r(s) : o === 1 && n && n(s), o;
    },
    /** איפוס לקראת סיבוב חדש. */
    reset() {
      s = 0;
    },
    /** רמת העזרה הנוכחית: 0 ללא, 1 רמז עדין, 2 עזרה מוגברת. */
    get level() {
      return i(s);
    },
    /** מספר הניסיונות השגויים בסיבוב הנוכחי. */
    get misses() {
      return s;
    }
  };
}
const Y = [
  "כָּל הַכָּבוֹד",
  "מְצֻיָּן",
  "יֹפִי",
  "נֶהְדָּר",
  "וָאוּ",
  "אֵיזֶה כֵּיף"
], W = [
  "נַסּוּ שׁוּב, אַתֶּם יְכוֹלִים",
  "כִּמְעַט! הַקְשִׁיבוּ שׁוּב",
  "עוֹד נִסָּיוֹן קָטָן",
  "קְרוֹבִים מְאֹד"
];
function He() {
  return Y[Math.floor(Math.random() * Y.length)];
}
function ze() {
  return W[Math.floor(Math.random() * W.length)];
}
function Ke(e) {
  const t = document.createElement("div");
  t.className = "feedback-message", t.setAttribute("aria-live", "polite"), t.setAttribute("role", "status"), e.appendChild(t);
  let n = null;
  function r(s, i, o = 1800) {
    clearTimeout(n), t.textContent = s, t.className = `feedback-message feedback-message--${i}`, n = setTimeout(() => {
      t.textContent = "", t.className = "feedback-message";
    }, o);
  }
  return {
    /** הצג משוב חיובי - טקסט מפורש, או ביטוי שבח אקראי אם לא סופק */
    correct(s) {
      L.correct(), r(s ?? `!${He()}`, "correct"), x(t, "bounce");
    },
    /** הצג עידוד — נסה שוב */
    wrong(s = "נַסֵּה שׁוּב") {
      L.wrong(), r(s, "wrong"), x(t, "pulse");
    },
    /** הצג רמז */
    hint(s) {
      r(s, "hint"), x(t, "pulse");
    },
    /** הסר את הרכיב */
    destroy() {
      clearTimeout(n), t.remove();
    }
  };
}
function $e(e) {
  let t = e.querySelector(".adult-tools__panel");
  if (t) return t;
  const n = e.querySelector(".game-header");
  if (!n) return null;
  const r = document.createElement("details");
  return r.className = "adult-tools", r.innerHTML = '<summary aria-label="להורים ולמורים">☰<span>למבוגרים</span></summary><div class="adult-tools__panel"><p>להורים ולמורים</p></div>', r.addEventListener("keydown", (s) => {
    s.key === "Escape" && (r.open = !1, r.querySelector("summary").focus(), s.stopPropagation());
  }), n.appendChild(r), r.querySelector(".adult-tools__panel");
}
function Ze(e, t, n, r) {
  const s = $e(e);
  if (!s) return null;
  const i = document.createElement("button");
  return i.className = "btn", i.setAttribute("aria-label", n), i.textContent = `${t} ${n}`, i.onclick = (o) => {
    const a = i.closest("details");
    a && (a.open = !1), r(o);
  }, s.appendChild(i), i;
}
let b = null, g = null, Z = 0, V = 0, v = null, M = 0, H = 0;
const R = /* @__PURE__ */ new Map();
function Q(e, t) {
  var r;
  const n = (r = document.elementFromPoint(e, t)) == null ? void 0 : r.closest('[data-drop-target="true"]');
  return n && R.has(n) && !n.matches(":disabled") && n.getAttribute("aria-disabled") !== "true" ? n : null;
}
function De(e, t, n) {
  const r = e.getBoundingClientRect();
  Z = r.width / 2, V = r.height / 2, g = e.cloneNode(!0), g.setAttribute("aria-hidden", "true"), g.setAttribute("tabindex", "-1"), Object.assign(g.style, {
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
  }), ee(t, n), document.body.appendChild(g);
}
function ee(e, t) {
  g && (g.style.transform = `translate3d(${e - Z}px, ${t - V}px, 0) scale(1.12)`);
}
function Pe(e, t) {
  M = e, H = t, v === null && (v = requestAnimationFrame(() => {
    v = null, ee(M, H), qe(Q(M, H));
  }));
}
function Oe() {
  v !== null && (cancelAnimationFrame(v), v = null), g == null || g.remove(), g = null;
}
let _ = null;
function qe(e) {
  _ !== e && (_ == null || _.classList.remove("drop-target--hover"), _ = e, e == null || e.classList.add("drop-target--hover"));
}
function Be() {
  _ == null || _.classList.remove("drop-target--hover"), _ = null;
}
function Ve(e, t, { onTap: n } = {}) {
  e.classList.add("drag-source");
  let r = null, s = null, i = null, o = null;
  function a() {
    var l;
    r && (e.removeEventListener("pointermove", r), e.removeEventListener("pointerup", s), e.removeEventListener("pointercancel", i), e.removeEventListener("lostpointercapture", i), r = s = i = null), Be(), Oe(), e.classList.remove("drag-source--dragging"), b = null;
    const c = o;
    o = null, c !== null && ((l = e.hasPointerCapture) != null && l.call(e, c)) && e.releasePointerCapture(c);
  }
  function d(c) {
    if (e.matches(":disabled") || e.getAttribute("aria-disabled") === "true" || c.button !== void 0 && c.button !== 0 || o !== null) return;
    c.preventDefault(), b && b.cancel(), b = { el: e, data: t, cancel: a }, o = c.pointerId;
    let l = !1;
    const f = () => {
      l = !0, e.classList.add("drag-source--dragging"), De(e, c.clientX, c.clientY);
    }, m = (u) => Math.hypot(u.clientX - c.clientX, u.clientY - c.clientY) >= 8;
    n || f(), e.setPointerCapture(c.pointerId), r = (u) => {
      u.pointerId === o && (!l && m(u) && f(), l && Pe(u.clientX, u.clientY));
    }, s = (u) => {
      if (u.pointerId !== o) return;
      const h = !l && !m(u), y = h && n ? null : Q(u.clientX, u.clientY);
      if (a(), h && n) {
        n();
        return;
      }
      y && R.has(y) && R.get(y).onDrop({ data: t, sourceEl: e, targetEl: y });
    }, i = (u) => {
      u.pointerId === o && a();
    }, e.addEventListener("pointermove", r), e.addEventListener("pointerup", s), e.addEventListener("pointercancel", i), e.addEventListener("lostpointercapture", i);
  }
  return e.addEventListener("pointerdown", d), {
    destroy() {
      e.removeEventListener("pointerdown", d), (b == null ? void 0 : b.el) === e && a(), e.classList.remove("drag-source");
    }
  };
}
function Qe(e, t) {
  return e.setAttribute("data-drop-target", "true"), e.classList.add("drop-target--active"), R.set(e, { onDrop: t }), {
    destroy() {
      e.removeAttribute("data-drop-target"), e.classList.remove("drop-target--active", "drop-target--hover"), R.delete(e);
    }
  };
}
export {
  ue as EventBus,
  me as GameShell,
  ce as GameState,
  Y as PRAISE_PHRASES,
  W as RETRY_HINTS,
  x as animate,
  Ie as bootstrapGame,
  We as createChoiceRound,
  Ve as createDragSource,
  Qe as createDropTarget,
  Ke as createFeedback,
  Je as createHintTracker,
  z as createLocalState,
  Me as createOptionCards,
  Ee as createProgressBar,
  we as createRoundManager,
  ve as createRoundScope,
  J as endGame,
  oe as ensureAudioRunning,
  Ye as getAllProgress,
  P as getAudioContext,
  Ge as getGameProgress,
  Le as hideLoadingScreen,
  Ze as injectHeaderButton,
  Se as installGlobalErrorScreen,
  he as lockPageZoom,
  Ue as mountAudioStatusBanner,
  Xe as playBlob,
  He as randomPraise,
  ze as randomRetryHint,
  be as recordGameResult,
  Ne as runGame,
  ye as showCompletionScreen,
  xe as showLoadingScreen,
  je as shuffle,
  L as sounds,
  K as starsFor,
  Fe as unlockAudioOutput
};
