import { g as U, b as j, l as F, G as W } from "./drag-NEBgUr1u.js";
import { c as Ae, a as xe, e as Me, p as Ne, u as $e } from "./drag-NEBgUr1u.js";
const C = "alefbet-audio-status-banner";
function B(t) {
  switch (t) {
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
function pe(t = typeof document < "u" ? document.body : null, e = {}) {
  const n = e.window || (typeof window < "u" ? window : null);
  if (!t || !n)
    return { destroy() {
    } };
  const s = t.querySelector("#" + C);
  s && s.parentNode && s.parentNode.removeChild(s);
  const r = t.ownerDocument.createElement("div");
  r.id = C, r.className = "alefbet-audio-banner", r.setAttribute("role", "status"), r.setAttribute("aria-live", "polite"), r.dir = "rtl", r.hidden = !0;
  const o = t.ownerDocument.createElement("span");
  o.className = "alefbet-audio-banner__msg", r.appendChild(o);
  const a = t.ownerDocument.createElement("button");
  a.type = "button", a.className = "alefbet-audio-banner__dismiss", a.setAttribute("aria-label", "סְגוֹר הוֹדָעָה"), a.textContent = "×", a.hidden = !0, r.appendChild(a), t.appendChild(r);
  let i = null;
  function c() {
    i && (clearTimeout(i), i = null);
  }
  function u() {
    c(), r.hidden = !0, r.classList.remove("is-visible", "is-await", "is-unsupported", "is-failed"), r.onclick = null, a.hidden = !0;
  }
  function l(f) {
    const d = B(f);
    if (!d) {
      u();
      return;
    }
    c(), o.textContent = d.message, r.hidden = !1, r.classList.add("is-visible"), r.classList.toggle("is-await", d.kind === "await"), r.classList.toggle("is-unsupported", d.kind === "unsupported"), r.classList.toggle("is-failed", d.kind === "failed"), d.kind, d.kind === "await" ? (r.onclick = () => {
      try {
        t.ownerDocument.body.dispatchEvent(new MouseEvent("pointerdown", { bubbles: !0 }));
      } catch {
      }
      u();
    }, a.hidden = !0) : d.kind === "unsupported" ? (r.onclick = null, a.hidden = !1, a.onclick = (h) => {
      h.stopPropagation(), u();
    }) : d.kind === "failed" && (r.onclick = null, a.hidden = !0, i = setTimeout(() => u(), 6e3));
  }
  function m(f) {
    const h = /** @type {CustomEvent} */ (f.detail || {}).state;
    if (h === "ready" || h === "idle") {
      u();
      return;
    }
    l(h);
  }
  return n.addEventListener("alefbet:tts-state", m), {
    destroy() {
      n.removeEventListener("alefbet:tts-state", m), c(), r.parentNode && r.parentNode.removeChild(r);
    }
  };
}
class X {
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
class Y {
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
const K = "alefbet-zoom-lock", L = /* @__PURE__ */ new WeakSet();
function S(t) {
  t.cancelable && t.preventDefault();
}
function V(t) {
  const e = (
    /** @type {TouchEvent} */
    t.touches
  );
  e && e.length > 1 && S(t);
}
function Z(t = typeof document < "u" ? document : null) {
  if (!t || L.has(t)) return !1;
  L.add(t), t.documentElement.classList.add(K);
  const e = { passive: !1 };
  return t.addEventListener("gesturestart", S, e), t.addEventListener("gesturechange", S, e), t.addEventListener("touchmove", V, e), !0;
}
const y = /* @__PURE__ */ new WeakMap();
function H(t) {
  var e;
  (e = y.get(t)) == null || e.end();
}
class J {
  /**
   * @param {HTMLElement} containerEl - אלמנט המיכל
   * @param {object} config - הגדרות: { totalRounds, title, homeUrl }
   */
  constructor(e, n = {}) {
    H(e), y.set(e, this), this.ended = !1, this._timers = /* @__PURE__ */ new Set(), this.container = e, this.config = {
      totalRounds: 8,
      title: "מִשְׂחָק",
      homeUrl: "../../index.html",
      ...n
    }, this.events = new X(), this.state = new Y(this.config.totalRounds), this.gameId = typeof n.gameId == "string" ? n.gameId : "", this._buildShell();
  }
  _buildShell() {
    this.container.classList.add("alefbet-game"), Z(this.container.ownerDocument);
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
    this.ended || (this.state.nextRound(), this.events.emit("start", { state: this.state }));
  }
  /** עבור לסיבוב הבא */
  nextRound() {
    if (this.ended) return !1;
    const e = this.state.nextRound();
    return e ? this.events.emit("round", { state: this.state }) : this.end(this.state.score), e;
  }
  /** סיים את המשחק */
  end(e = this.state.score) {
    if (!this.ended) {
      this.ended = !0;
      for (const n of this._timers) clearTimeout(n);
      this._timers.clear(), y.get(this.container) === this && y.delete(this.container), this.events.emit("end", { score: e, state: this.state });
    }
  }
  /** פעולה מושהית מתבטלת אוטומטית בסיום או בהפעלה מחדש. */
  schedule(e, n) {
    if (this.ended) return;
    const s = setTimeout(() => {
      this._timers.delete(s), this.ended || e();
    }, n);
    this._timers.add(s);
  }
  /** המתנה מתבטלת בסיום; false אומר שאין להמשיך בפעולה. */
  delay(e) {
    return new Promise((n) => {
      if (this.ended) {
        n(!1);
        return;
      }
      const s = () => n(!1);
      this.events.on("end", s), this.schedule(() => {
        this.events.off("end", s), n(!0);
      }, e);
    });
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
function ye(t) {
  const e = [...t];
  for (let n = e.length - 1; n > 0; n--) {
    const s = Math.floor(Math.random() * (n + 1));
    [e[n], e[s]] = [e[s], e[n]];
  }
  return e;
}
function Q() {
  const t = U();
  return t ? (t.state === "suspended" && t.resume(), t) : null;
}
function g(t, e, n = "sine", s = 0.3) {
  const r = Q();
  if (r)
    try {
      const o = r.createOscillator(), a = r.createGain();
      o.connect(a), a.connect(r.destination), o.type = n, o.frequency.setValueAtTime(t, r.currentTime), a.gain.setValueAtTime(s, r.currentTime), a.gain.exponentialRampToValueAtTime(1e-3, r.currentTime + e), o.start(r.currentTime), o.stop(r.currentTime + e + 0.05);
    } catch {
    }
}
const v = {
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
    [523.25, 587.33, 659.25, 698.46, 783.99, 1046.5].forEach((e, n) => setTimeout(() => g(e, 0.2), n * 90));
  },
  /** קליק עדין */
  click() {
    g(900, 0.04, "sine", 0.12);
  }
}, A = {
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
}, ee = {
  shake: 420,
  bounce: 480,
  pulse: 600,
  fadeIn: 320,
  confetti: 700
};
function _(t, e) {
  !t || !A[e] || t.animate(A[e], {
    duration: ee[e] || 400,
    easing: "ease-in-out",
    fill: "none"
  });
}
const te = "alefbet.progress.v1", k = j(te, {});
function D(t, e) {
  if (!Number.isFinite(t) || !Number.isFinite(e) || e <= 0) return 1;
  const n = t / e;
  return n >= 0.8 ? 3 : n >= 0.5 ? 2 : 1;
}
function ne(t, { score: e, total: n }) {
  if (!t || !Number.isFinite(e) || !Number.isFinite(n) || n <= 0) return null;
  const s = D(e, n);
  let r = null;
  return k.update((o) => {
    const a = o[t];
    return r = {
      plays: ((a == null ? void 0 : a.plays) ?? 0) + 1,
      bestScore: Math.max((a == null ? void 0 : a.bestScore) ?? 0, e),
      bestStars: Math.max((a == null ? void 0 : a.bestStars) ?? 0, s),
      total: a && (a.bestScore ?? 0) > e ? a.total : n,
      lastPlayed: Date.now()
    }, { ...o, [t]: r };
  }), r;
}
function _e(t) {
  return k.get()[t] ?? null;
}
function ve() {
  return k.get();
}
function re(t, e, n, s, r = {}) {
  v.cheer(), r.gameId && ne(r.gameId, { score: e, total: n });
  const o = r.completionOnly ? n === 1 ? "הִשְׁלַמְתֶּם מְשִׂימָה!" : `הִשְׁלַמְתֶּם ${n} מְשִׂימוֹת!` : `נִיקּוּד: ${e} מִתּוֹךְ ${n}`, a = D(e, n), i = "⭐".repeat(a) + "☆".repeat(3 - a), c = document.createElement("div");
  c.className = "completion-screen", c.innerHTML = `
    <div class="completion-screen__content">
      <div class="completion-screen__stars" aria-label="${a} כּוֹכָבִים">${i}</div>
      <h2 class="completion-screen__title">כָּל הַכָּבוֹד!</h2>
      <p class="completion-screen__score">${o}</p>
      <div class="completion-screen__actions">
        <button class="completion-screen__replay btn btn--primary">שַׂחֵק שׁוּב</button>
      </div>
    </div>
  `;
  const u = r.homeUrl === void 0 ? "../../index.html" : r.homeUrl;
  if (u) {
    const l = document.createElement("a");
    l.className = "completion-screen__home btn", l.href = u, l.textContent = "בְּחִירַת מִשְׂחָק", c.querySelector(".completion-screen__actions").appendChild(l);
  }
  c.querySelector(".completion-screen__replay").addEventListener("click", () => {
    c.remove(), s();
  }), t.innerHTML = "", t.appendChild(c), _(c.querySelector(".completion-screen__content"), "fadeIn");
}
function se(t, e, {
  totalRounds: n,
  progressBar: s = null,
  buildRoundUI: r,
  onCorrect: o,
  onWrong: a,
  transitionMs: i = 800,
  playCorrectSound: c = !0,
  completionOnly: u = !1,
  onReplay: l = () => location.reload()
}) {
  let m = !1;
  const f = /* @__PURE__ */ new Set();
  function d(b) {
    m = b || t.ended, f.forEach((T) => T(m));
  }
  function h(b) {
    return f.add(b), b(m || t.ended), () => {
      f.delete(b);
    };
  }
  t.on("end", () => {
    d(!0), f.clear();
  });
  async function q(b) {
    if (m || t.ended) return;
    d(!0), c && v.correct();
    try {
      if (b && await b(), t.ended) return;
      o && await o();
    } catch (O) {
      throw d(!1), O;
    }
    if (t.ended || (t.state.addScore(1), s == null || s.update(t.state.currentRound), !await t.delay(i))) return;
    t.nextRound() ? (d(!1), r()) : re(e, t.state.score, n, l, { gameId: t.gameId, completionOnly: u, homeUrl: t.config.homeUrl });
  }
  async function G(b) {
    if (!(m || t.ended)) {
      d(!0);
      try {
        b && await b(), !t.ended && a && await a();
      } finally {
        d(!1);
      }
    }
  }
  function P() {
    return m;
  }
  function z() {
    d(!1);
  }
  return { handleCorrect: q, handleWrong: G, isAnswered: P, reset: z, subscribe: h };
}
function ae() {
  const t = new AbortController(), e = /* @__PURE__ */ new Set();
  function n(s) {
    t.signal.aborted ? s() : e.add(s);
  }
  return {
    signal: t.signal,
    /** @template {(() => void) | { destroy: () => void }} T @param {T} resource @returns {T} */
    use(s) {
      return n(typeof s == "function" ? s : () => s.destroy()), s;
    },
    /** @param {EventTarget} target @param {string} event @param {EventListener} handler @param {AddEventListenerOptions | boolean} [options] */
    listen(s, r, o, a) {
      t.signal.aborted || (s.addEventListener(r, o, a), n(() => s.removeEventListener(r, o, a)));
    },
    schedule(s, r) {
      if (t.signal.aborted) return () => {
      };
      const o = () => {
        clearTimeout(a), e.delete(o);
      }, a = setTimeout(() => {
        e.delete(o), t.signal.aborted || s();
      }, r);
      return n(o), o;
    },
    dispose() {
      if (t.signal.aborted) return;
      t.abort();
      const s = [...e].reverse();
      e.clear();
      for (const r of s)
        try {
          r();
        } catch (o) {
          console.warn("Round cleanup failed", o);
        }
    }
  };
}
function oe(t, e) {
  const n = document.createElement("div");
  n.className = "progress-bar", n.setAttribute("role", "progressbar"), n.setAttribute("aria-valuemin", "0"), n.setAttribute("aria-valuemax", String(e)), n.innerHTML = `
    <div class="progress-bar__track">
      <div class="progress-bar__fill" style="width: 0%"></div>
    </div>
    <span class="progress-bar__label">0 / ${e}</span>
  `, t.appendChild(n);
  const s = (
    /** @type {HTMLElement} */
    n.querySelector(".progress-bar__fill")
  ), r = n.querySelector(".progress-bar__label");
  return {
    /** עדכן את ההתקדמות */
    update(o) {
      const a = Math.round(o / e * 100);
      s.style.width = `${a}%`, r.textContent = `${o} / ${e}`, n.setAttribute("aria-valuenow", String(o));
    },
    /** הסר את הרכיב */
    destroy() {
      n.remove();
    }
  };
}
let w = !1, R = !1, p = null;
const ie = [
  "ResizeObserver loop",
  // אזהרת דפדפן שפירה
  "Script error."
  // שגיאת cross-origin אטומה, לרוב תוסף דפדפן
];
function x(t) {
  const e = String(t || "");
  return ie.some((n) => e.includes(n));
}
function M() {
  var e;
  if (R || typeof document > "u" || !document.body) return;
  R = !0;
  const t = document.createElement("div");
  t.className = "ab-error-screen", t.setAttribute("role", "alert"), t.dir = "rtl", t.innerHTML = `
    <div class="ab-error-screen__card">
      <div class="ab-error-screen__emoji">🙈</div>
      <h2 class="ab-error-screen__title">אוֹפְּס! מַשֶּׁהוּ הִשְׁתַּבֵּשׁ</h2>
      <p class="ab-error-screen__text">זֶה לֹא בִּגְלַלְכֶם! לְחִיצָה עַל הַכַּפְתּוֹר תַּחְזִיר אֶת הַמִּשְׂחָק.</p>
      <button type="button" class="btn btn--primary ab-error-screen__reload">לְהַתְחִיל מֵחָדָשׁ</button>
    </div>
  `, (e = t.querySelector(".ab-error-screen__reload")) == null || e.addEventListener("click", () => {
    try {
      location.reload();
    } catch {
    }
  }), document.body.appendChild(t);
}
function ce() {
  if (typeof window > "u") return { destroy() {
  } };
  if (w) return { destroy() {
  } };
  w = !0;
  const t = (n) => {
    x(n == null ? void 0 : n.message) || (console.error("[alefbet] uncaught error:", (n == null ? void 0 : n.error) ?? (n == null ? void 0 : n.message)), M());
  }, e = (n) => {
    const s = (
      /** @type {any} */
      n == null ? void 0 : n.reason
    );
    x((s == null ? void 0 : s.message) ?? s) || (console.error("[alefbet] unhandled rejection:", s), M());
  };
  return window.addEventListener("error", t), window.addEventListener("unhandledrejection", e), p = () => {
    window.removeEventListener("error", t), window.removeEventListener("unhandledrejection", e), w = !1, R = !1;
  }, { destroy: () => {
    p == null || p(), p = null;
  } };
}
function le(t, e = "טוֹעֵן...") {
  t.innerHTML = `<div class="ab-loading">${e}</div>`;
}
function de(t) {
  t.innerHTML = "";
}
function I(t) {
  let e = t.querySelector(".adult-tools__panel");
  if (e) return e;
  const n = t.querySelector(".game-header");
  if (!n) return null;
  const s = document.createElement("details");
  return s.className = "adult-tools", s.innerHTML = '<summary aria-label="להורים ולמורים">☰<span>למבוגרים</span></summary><div class="adult-tools__panel"><p>להורים ולמורים</p></div>', s.addEventListener("keydown", (r) => {
    r.key === "Escape" && (s.open = !1, s.querySelector("summary").focus(), r.stopPropagation());
  }), n.appendChild(s), s.querySelector(".adult-tools__panel");
}
function ue(t, e, n) {
  const s = I(t.container);
  if (!s) return;
  const r = document.createElement("div");
  r.className = "ab-lazy-editor";
  const o = document.createElement("span");
  o.setAttribute("role", "status");
  let a = !1, i = null;
  async function c() {
    if (!document.querySelector('link[href$="/runtime.css"]') || document.querySelector("link[data-alefbet-editor]")) return;
    const l = document.createElement("link");
    l.rel = "stylesheet";
    const m = new URL(".", import.meta.url);
    l.href = new URL("editor.css", m).href, l.dataset.alefbetEditor = "", await new Promise((f, d) => {
      l.onload = () => f(), l.onerror = () => {
        l.remove(), d(new Error("Editor styles unavailable"));
      }, document.head.appendChild(l);
    });
  }
  async function u(l) {
    if (!(a || t.ended)) {
      a = !0, o.textContent = "טוֹעֵן...";
      try {
        const [m] = await Promise.all([import("./editor.js"), c()]);
        if (t.ended) return;
        "serviceWorker" in navigator && navigator.serviceWorker.ready.then((f) => {
          var d;
          (d = f.active) == null || d.postMessage({ type: "cache-editor" });
        }).catch(() => {
        }), l === "audio" ? m.showAudioManager(e.id, e) : (i = new m.GameEditor(t.container, e, n), await new Promise((f) => requestAnimationFrame(f)), t.ended || (i.enterEditMode(), r.remove())), o.textContent = "";
      } catch {
        t.ended || (o.textContent = "לֹא הִצְלַחְנוּ לִטְעֹן אֶת הָעוֹרֵךְ. הִתְחַבְּרוּ לָרֶשֶׁת וְנַסּוּ שׁוּב.");
      } finally {
        a = !1;
      }
    }
  }
  for (const [l, m] of [["✏️ ערוך", "edit"], ["🎤 קול", "audio"]]) {
    const f = document.createElement("button");
    f.className = "btn", f.textContent = l, f.addEventListener("click", () => {
      u(m);
    }), r.appendChild(f);
  }
  r.appendChild(o), s.appendChild(r), t.on("end", () => {
    i == null || i.destroy(), r.remove();
  });
}
const E = /* @__PURE__ */ new WeakMap();
async function me(t, e) {
  var c;
  H(t);
  const n = {};
  if (E.set(t, n), ce(), le(t, e.loadingMessage ?? "טוֹעֵן..."), (c = e.preloadTexts) != null && c.length) {
    const { preloadNikud: u } = await import("./nakdan-DFzp_6d3.js");
    await u(e.preloadTexts);
  }
  const s = e.audio !== !1 ? await import("./game-audio-CIXXhVEq.js").then((u) => u.e) : null;
  if (E.get(t) !== n)
    return { shell: null, activeRounds: [], gameData: null, aborted: !0 };
  if (e.onBeforeHide && (await e.onBeforeHide() === !1 || E.get(t) !== n))
    return { shell: null, activeRounds: [], gameData: null, aborted: !0 };
  de(t);
  const r = e.editor ? F(e.gameId, e.editor.content) : null, o = r != null && r.rounds.length ? r.rounds : e.defaultRounds ?? [], a = new J(t, {
    totalRounds: e.totalRounds ?? o.length,
    title: e.title,
    gameId: e.gameId
  });
  s == null || s.attachGameAudio(a);
  let i = null;
  if (e.editor) {
    const u = {
      title: e.editor.title ?? e.title,
      type: e.editor.type ?? "multiple-choice"
    };
    i = W.fromRoundsArray(e.gameId, o, u, e.editor.distractors ?? [], e.editor.content), ue(a, i, { restartGame: e.editor.restartGame });
  }
  return { shell: a, activeRounds: o, gameData: i, aborted: !1 };
}
async function fe(t, e) {
  const n = await me(t, e);
  if (n.aborted) return n;
  const { shell: s, activeRounds: r } = n;
  if (!r.length)
    return s.bodyEl.textContent = "אֵין סִבּוּבִים לַמִּשְׂחָק.", s.end(), n;
  const o = oe(s.footerEl, r.length);
  let a;
  const i = () => {
    a == null || a.dispose(), a = void 0;
  }, c = se(s, t, {
    totalRounds: r.length,
    completionOnly: !0,
    progressBar: o,
    transitionMs: e.transitionMs,
    playCorrectSound: e.playCorrectSound,
    onReplay: e.onReplay ?? (() => {
      fe(t, e);
    }),
    buildRoundUI: u
  });
  s.on("end", i), s.on("start", () => {
    var l;
    o.update(0), (l = e.onStart) == null || l.call(e, s), c.reset();
  }), s.on("start", u);
  function u() {
    i(), s.bodyEl.innerHTML = "";
    const l = ae();
    a = l;
    const m = () => !s.ended && !l.signal.aborted, f = s.state.currentRound - 1;
    try {
      const d = e.buildRound({
        shell: s,
        index: f,
        round: r[f],
        isActive: m,
        scope: l,
        isAnswered: () => !m() || c.isAnswered(),
        subscribeAnswered: (h) => m() ? l.use(c.subscribe(h)) : (h(!0), () => {
        }),
        onCorrect: async (h) => {
          m() && await c.handleCorrect(h);
        },
        onWrong: async (h) => {
          m() && await c.handleWrong(h);
        },
        schedule: l.schedule
      });
      d && l.use(d);
    } catch (d) {
      throw l.dispose(), d;
    }
  }
  return s.start(), n;
}
function he(t, e, n) {
  t.innerHTML = "";
  const s = document.createElement("div");
  s.className = "option-cards-grid";
  const r = e.map((o) => {
    const a = document.createElement("button");
    a.className = "option-card", a.dataset.id = o.id, a.type = "button";
    const i = document.createElement("span");
    i.className = "option-card__emoji", i.textContent = o.emoji || "";
    const c = document.createElement("span");
    return c.className = "option-card__text", c.textContent = o.text, a.append(i, c), a.addEventListener("click", () => {
      a.disabled || n(o);
    }), s.appendChild(a), { el: a, option: o };
  });
  return t.appendChild(s), {
    /** הַדָּגֵשׁ כַּרְטִיס לְפִי סוּג: 'correct' | 'wrong' | 'hint' */
    highlight(o, a) {
      r.forEach(({ el: i, option: c }) => {
        c.id === o && i.classList.add(`option-card--${a}`);
      });
    },
    /** Visual hints never change the answer lock or other highlights. */
    clearHighlight(o, a) {
      r.forEach(({ el: i, option: c }) => {
        c.id === o && i.classList.remove(`option-card--${a}`);
      });
    },
    setDisabled(o) {
      r.forEach(({ el: a }) => {
        a.disabled = o;
      });
    },
    /** נטרל את כל הכרטיסים */
    disable() {
      r.forEach(({ el: o }) => {
        o.disabled = !0;
      });
    },
    /** אפס את מצב הכרטיסים */
    reset() {
      r.forEach(({ el: o }) => {
        o.className = "option-card", o.disabled = !1;
      });
    },
    /** הסר את הרכיב */
    destroy() {
      t.innerHTML = "";
    }
  };
}
function we(t, e, n) {
  const s = t.scope.use(he(e, n.options, (r) => {
    t.isAnswered() || (n.isCorrect(r) ? t.onCorrect(() => {
      var o;
      return s.highlight(r.id, "correct"), (o = n.onCorrect) == null ? void 0 : o.call(n, r);
    }) : t.onWrong(() => {
      var o;
      return (o = n.onWrong) == null ? void 0 : o.call(n, r);
    }));
  }));
  return t.subscribeAnswered((r) => s.setDisabled(r)), { highlight: s.highlight, clearHighlight: s.clearHighlight };
}
function Ee({ hintAfter: t = 2, escalateAfter: e = 4, onHint: n, onEscalate: s } = {}) {
  let r = 0;
  function o(a) {
    return a >= e ? 2 : a >= t ? 1 : 0;
  }
  return {
    /** דיווח על ניסיון שגוי. מפעיל את הקולבק המתאים ומחזיר את הרמה. */
    miss() {
      r++;
      const a = o(r);
      return a === 2 && s ? s(r) : a === 1 && n && n(r), a;
    },
    /** איפוס לקראת סיבוב חדש. */
    reset() {
      r = 0;
    },
    /** רמת העזרה הנוכחית: 0 ללא, 1 רמז עדין, 2 עזרה מוגברת. */
    get level() {
      return o(r);
    },
    /** מספר הניסיונות השגויים בסיבוב הנוכחי. */
    get misses() {
      return r;
    }
  };
}
const N = [
  "כָּל הַכָּבוֹד",
  "מְצֻיָּן",
  "יֹפִי",
  "נֶהְדָּר",
  "וָאוּ",
  "אֵיזֶה כֵּיף"
], $ = [
  "נַסּוּ שׁוּב, אַתֶּם יְכוֹלִים",
  "כִּמְעַט! הַקְשִׁיבוּ שׁוּב",
  "עוֹד נִסָּיוֹן קָטָן",
  "קְרוֹבִים מְאֹד"
];
function be() {
  return N[Math.floor(Math.random() * N.length)];
}
function Se() {
  return $[Math.floor(Math.random() * $.length)];
}
function Re(t) {
  const e = document.createElement("div");
  e.className = "feedback-message", e.setAttribute("aria-live", "polite"), e.setAttribute("role", "status"), t.appendChild(e);
  let n = null;
  function s(r, o, a = 1800) {
    clearTimeout(n), e.textContent = r, e.className = `feedback-message feedback-message--${o}`, n = setTimeout(() => {
      e.textContent = "", e.className = "feedback-message";
    }, a);
  }
  return {
    /** הצג משוב חיובי - טקסט מפורש, או ביטוי שבח אקראי אם לא סופק */
    correct(r) {
      v.correct(), s(r ?? `!${be()}`, "correct"), _(e, "bounce");
    },
    /** הצג עידוד — נסה שוב */
    wrong(r = "נַסֵּה שׁוּב") {
      v.wrong(), s(r, "wrong"), _(e, "pulse");
    },
    /** הצג רמז */
    hint(r) {
      s(r, "hint"), _(e, "pulse");
    },
    /** הסר את הרכיב */
    destroy() {
      clearTimeout(n), e.remove();
    }
  };
}
function ke(t) {
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
    highlight(s) {
      e.classList.remove("ab-zone--correct", "ab-zone--hover"), s && e.classList.add(`ab-zone--${s}`);
    },
    reset() {
      e.classList.remove("ab-zone--correct", "ab-zone--hover");
    },
    destroy() {
      e.removeEventListener("click", n);
    }
  };
}
function Te(t, e, n, s) {
  const r = I(t);
  if (!r) return null;
  const o = document.createElement("button");
  return o.className = "btn", o.setAttribute("aria-label", n), o.textContent = `${e} ${n}`, o.onclick = (a) => {
    const i = o.closest("details");
    i && (i.open = !1), s(a);
  }, r.appendChild(o), o;
}
export {
  X as EventBus,
  J as GameShell,
  Y as GameState,
  N as PRAISE_PHRASES,
  $ as RETRY_HINTS,
  _ as animate,
  me as bootstrapGame,
  we as createChoiceRound,
  Ae as createDragSource,
  xe as createDropTarget,
  Re as createFeedback,
  Ee as createHintTracker,
  j as createLocalState,
  he as createOptionCards,
  oe as createProgressBar,
  se as createRoundManager,
  ae as createRoundScope,
  ke as createZone,
  H as endGame,
  Me as ensureAudioRunning,
  ve as getAllProgress,
  U as getAudioContext,
  _e as getGameProgress,
  de as hideLoadingScreen,
  Te as injectHeaderButton,
  ce as installGlobalErrorScreen,
  Z as lockPageZoom,
  pe as mountAudioStatusBanner,
  Ne as playBlob,
  be as randomPraise,
  Se as randomRetryHint,
  ne as recordGameResult,
  fe as runGame,
  re as showCompletionScreen,
  le as showLoadingScreen,
  ye as shuffle,
  v as sounds,
  D as starsFor,
  $e as unlockAudioOutput
};
