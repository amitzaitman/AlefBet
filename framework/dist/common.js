import { g as z, b as U, l as j, G as F } from "./drag-NEBgUr1u.js";
import { c as Se, a as Te, e as Ce, p as ke, u as Le } from "./drag-NEBgUr1u.js";
const C = "alefbet-audio-status-banner";
function O(t) {
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
function me(t = typeof document < "u" ? document.body : null, e = {}) {
  const n = e.window || (typeof window < "u" ? window : null);
  if (!t || !n)
    return { destroy() {
    } };
  const s = t.querySelector("#" + C);
  s && s.parentNode && s.parentNode.removeChild(s);
  const r = t.ownerDocument.createElement("div");
  r.id = C, r.className = "alefbet-audio-banner", r.setAttribute("role", "status"), r.setAttribute("aria-live", "polite"), r.dir = "rtl", r.hidden = !0;
  const i = t.ownerDocument.createElement("span");
  i.className = "alefbet-audio-banner__msg", r.appendChild(i);
  const a = t.ownerDocument.createElement("button");
  a.type = "button", a.className = "alefbet-audio-banner__dismiss", a.setAttribute("aria-label", "סְגוֹר הוֹדָעָה"), a.textContent = "×", a.hidden = !0, r.appendChild(a), t.appendChild(r);
  let o = null;
  function c() {
    o && (clearTimeout(o), o = null);
  }
  function u() {
    c(), r.hidden = !0, r.classList.remove("is-visible", "is-await", "is-unsupported", "is-failed"), r.onclick = null, a.hidden = !0;
  }
  function l(f) {
    const d = O(f);
    if (!d) {
      u();
      return;
    }
    c(), i.textContent = d.message, r.hidden = !1, r.classList.add("is-visible"), r.classList.toggle("is-await", d.kind === "await"), r.classList.toggle("is-unsupported", d.kind === "unsupported"), r.classList.toggle("is-failed", d.kind === "failed"), d.kind, d.kind === "await" ? (r.onclick = () => {
      try {
        t.ownerDocument.body.dispatchEvent(new MouseEvent("pointerdown", { bubbles: !0 }));
      } catch {
      }
      u();
    }, a.hidden = !0) : d.kind === "unsupported" ? (r.onclick = null, a.hidden = !1, a.onclick = (h) => {
      h.stopPropagation(), u();
    }) : d.kind === "failed" && (r.onclick = null, a.hidden = !0, o = setTimeout(() => u(), 6e3));
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
class B {
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
const y = /* @__PURE__ */ new WeakMap();
function N(t) {
  var e;
  (e = y.get(t)) == null || e.end();
}
class X {
  /**
   * @param {HTMLElement} containerEl - אלמנט המיכל
   * @param {object} config - הגדרות: { totalRounds, title, homeUrl }
   */
  constructor(e, n = {}) {
    N(e), y.set(e, this), this.ended = !1, this._timers = /* @__PURE__ */ new Set(), this.container = e, this.config = {
      totalRounds: 8,
      title: "מִשְׂחָק",
      homeUrl: "../../index.html",
      ...n
    }, this.events = new W(), this.state = new B(this.config.totalRounds), this.gameId = typeof n.gameId == "string" ? n.gameId : "", this._buildShell();
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
function fe(t) {
  const e = [...t];
  for (let n = e.length - 1; n > 0; n--) {
    const s = Math.floor(Math.random() * (n + 1));
    [e[n], e[s]] = [e[s], e[n]];
  }
  return e;
}
function Y() {
  const t = z();
  return t ? (t.state === "suspended" && t.resume(), t) : null;
}
function g(t, e, n = "sine", s = 0.3) {
  const r = Y();
  if (r)
    try {
      const i = r.createOscillator(), a = r.createGain();
      i.connect(a), a.connect(r.destination), i.type = n, i.frequency.setValueAtTime(t, r.currentTime), a.gain.setValueAtTime(s, r.currentTime), a.gain.exponentialRampToValueAtTime(1e-3, r.currentTime + e), i.start(r.currentTime), i.stop(r.currentTime + e + 0.05);
    } catch {
    }
}
const w = {
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
}, k = {
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
}, V = {
  shake: 420,
  bounce: 480,
  pulse: 600,
  fadeIn: 320,
  confetti: 700
};
function _(t, e) {
  !t || !k[e] || t.animate(k[e], {
    duration: V[e] || 400,
    easing: "ease-in-out",
    fill: "none"
  });
}
const K = "alefbet.progress.v1", S = U(K, {});
function $(t, e) {
  if (!Number.isFinite(t) || !Number.isFinite(e) || e <= 0) return 1;
  const n = t / e;
  return n >= 0.8 ? 3 : n >= 0.5 ? 2 : 1;
}
function Z(t, { score: e, total: n }) {
  if (!t || !Number.isFinite(e) || !Number.isFinite(n) || n <= 0) return null;
  const s = $(e, n);
  let r = null;
  return S.update((i) => {
    const a = i[t];
    return r = {
      plays: ((a == null ? void 0 : a.plays) ?? 0) + 1,
      bestScore: Math.max((a == null ? void 0 : a.bestScore) ?? 0, e),
      bestStars: Math.max((a == null ? void 0 : a.bestStars) ?? 0, s),
      total: a && (a.bestScore ?? 0) > e ? a.total : n,
      lastPlayed: Date.now()
    }, { ...i, [t]: r };
  }), r;
}
function he(t) {
  return S.get()[t] ?? null;
}
function be() {
  return S.get();
}
function J(t, e, n, s, r = {}) {
  w.cheer(), r.gameId && Z(r.gameId, { score: e, total: n });
  const i = r.completionOnly ? n === 1 ? "הִשְׁלַמְתֶּם מְשִׂימָה!" : `הִשְׁלַמְתֶּם ${n} מְשִׂימוֹת!` : `נִיקּוּד: ${e} מִתּוֹךְ ${n}`, a = $(e, n), o = "⭐".repeat(a) + "☆".repeat(3 - a), c = document.createElement("div");
  c.className = "completion-screen", c.innerHTML = `
    <div class="completion-screen__content">
      <div class="completion-screen__stars" aria-label="${a} כּוֹכָבִים">${o}</div>
      <h2 class="completion-screen__title">!כָּל הַכָּבוֹד</h2>
      <p class="completion-screen__score">${i}</p>
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
function Q(t, e, {
  totalRounds: n,
  progressBar: s = null,
  buildRoundUI: r,
  onCorrect: i,
  onWrong: a,
  transitionMs: o = 800,
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
  async function I(b) {
    if (m || t.ended) return;
    d(!0), c && w.correct();
    try {
      if (b && await b(), t.ended) return;
      i && await i();
    } catch (P) {
      throw d(!1), P;
    }
    if (t.ended || (t.state.addScore(1), s == null || s.update(t.state.currentRound), !await t.delay(o))) return;
    t.nextRound() ? (d(!1), r()) : J(e, t.state.score, n, l, { gameId: t.gameId, completionOnly: u, homeUrl: t.config.homeUrl });
  }
  async function q(b) {
    if (!(m || t.ended)) {
      d(!0);
      try {
        b && await b(), !t.ended && a && await a();
      } finally {
        d(!1);
      }
    }
  }
  function D() {
    return m;
  }
  function G() {
    d(!1);
  }
  return { handleCorrect: I, handleWrong: q, isAnswered: D, reset: G, subscribe: h };
}
function ee() {
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
    listen(s, r, i, a) {
      t.signal.aborted || (s.addEventListener(r, i, a), n(() => s.removeEventListener(r, i, a)));
    },
    schedule(s, r) {
      if (t.signal.aborted) return () => {
      };
      const i = () => {
        clearTimeout(a), e.delete(i);
      }, a = setTimeout(() => {
        e.delete(i), t.signal.aborted || s();
      }, r);
      return n(i), i;
    },
    dispose() {
      if (t.signal.aborted) return;
      t.abort();
      const s = [...e].reverse();
      e.clear();
      for (const r of s)
        try {
          r();
        } catch (i) {
          console.warn("Round cleanup failed", i);
        }
    }
  };
}
function te(t, e) {
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
    update(i) {
      const a = Math.round(i / e * 100);
      s.style.width = `${a}%`, r.textContent = `${i} / ${e}`, n.setAttribute("aria-valuenow", String(i));
    },
    /** הסר את הרכיב */
    destroy() {
      n.remove();
    }
  };
}
let v = !1, R = !1, p = null;
const ne = [
  "ResizeObserver loop",
  // אזהרת דפדפן שפירה
  "Script error."
  // שגיאת cross-origin אטומה, לרוב תוסף דפדפן
];
function L(t) {
  const e = String(t || "");
  return ne.some((n) => e.includes(n));
}
function A() {
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
function re() {
  if (typeof window > "u") return { destroy() {
  } };
  if (v) return { destroy() {
  } };
  v = !0;
  const t = (n) => {
    L(n == null ? void 0 : n.message) || (console.error("[alefbet] uncaught error:", (n == null ? void 0 : n.error) ?? (n == null ? void 0 : n.message)), A());
  }, e = (n) => {
    const s = (
      /** @type {any} */
      n == null ? void 0 : n.reason
    );
    L((s == null ? void 0 : s.message) ?? s) || (console.error("[alefbet] unhandled rejection:", s), A());
  };
  return window.addEventListener("error", t), window.addEventListener("unhandledrejection", e), p = () => {
    window.removeEventListener("error", t), window.removeEventListener("unhandledrejection", e), v = !1, R = !1;
  }, { destroy: () => {
    p == null || p(), p = null;
  } };
}
function se(t, e = "טוֹעֵן...") {
  t.innerHTML = `<div class="ab-loading">${e}</div>`;
}
function ae(t) {
  t.innerHTML = "";
}
function H(t) {
  let e = t.querySelector(".adult-tools__panel");
  if (e) return e;
  const n = t.querySelector(".game-header");
  if (!n) return null;
  const s = document.createElement("details");
  return s.className = "adult-tools", s.innerHTML = '<summary aria-label="להורים ולמורים">☰<span>למבוגרים</span></summary><div class="adult-tools__panel"><p>להורים ולמורים</p></div>', s.addEventListener("keydown", (r) => {
    r.key === "Escape" && (s.open = !1, s.querySelector("summary").focus(), r.stopPropagation());
  }), n.appendChild(s), s.querySelector(".adult-tools__panel");
}
function ie(t, e, n) {
  const s = H(t.container);
  if (!s) return;
  const r = document.createElement("div");
  r.className = "ab-lazy-editor";
  const i = document.createElement("span");
  i.setAttribute("role", "status");
  let a = !1, o = null;
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
      a = !0, i.textContent = "טוֹעֵן...";
      try {
        const [m] = await Promise.all([import("./editor.js"), c()]);
        if (t.ended) return;
        "serviceWorker" in navigator && navigator.serviceWorker.ready.then((f) => {
          var d;
          (d = f.active) == null || d.postMessage({ type: "cache-editor" });
        }).catch(() => {
        }), l === "audio" ? m.showAudioManager(e.id, e) : (o = new m.GameEditor(t.container, e, n), await new Promise((f) => requestAnimationFrame(f)), t.ended || (o.enterEditMode(), r.remove())), i.textContent = "";
      } catch {
        t.ended || (i.textContent = "לֹא הִצְלַחְנוּ לִטְעֹן אֶת הָעוֹרֵךְ. הִתְחַבְּרוּ לָרֶשֶׁת וְנַסּוּ שׁוּב.");
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
  r.appendChild(i), s.appendChild(r), t.on("end", () => {
    o == null || o.destroy(), r.remove();
  });
}
const E = /* @__PURE__ */ new WeakMap();
async function oe(t, e) {
  var c;
  N(t);
  const n = {};
  if (E.set(t, n), re(), se(t, e.loadingMessage ?? "טוֹעֵן..."), (c = e.preloadTexts) != null && c.length) {
    const { preloadNikud: u } = await import("./nakdan-DFzp_6d3.js");
    await u(e.preloadTexts);
  }
  const s = e.audio !== !1 ? await import("./game-audio-CIXXhVEq.js").then((u) => u.e) : null;
  if (E.get(t) !== n)
    return { shell: null, activeRounds: [], gameData: null, aborted: !0 };
  if (e.onBeforeHide && (await e.onBeforeHide() === !1 || E.get(t) !== n))
    return { shell: null, activeRounds: [], gameData: null, aborted: !0 };
  ae(t);
  const r = e.editor ? j(e.gameId, e.editor.content) : null, i = r != null && r.rounds.length ? r.rounds : e.defaultRounds ?? [], a = new X(t, {
    totalRounds: e.totalRounds ?? i.length,
    title: e.title,
    gameId: e.gameId
  });
  s == null || s.attachGameAudio(a);
  let o = null;
  if (e.editor) {
    const u = {
      title: e.editor.title ?? e.title,
      type: e.editor.type ?? "multiple-choice"
    };
    o = F.fromRoundsArray(e.gameId, i, u, e.editor.distractors ?? [], e.editor.content), ie(a, o, { restartGame: e.editor.restartGame });
  }
  return { shell: a, activeRounds: i, gameData: o, aborted: !1 };
}
async function ce(t, e) {
  const n = await oe(t, e);
  if (n.aborted) return n;
  const { shell: s, activeRounds: r } = n;
  if (!r.length)
    return s.bodyEl.textContent = "אֵין סִבּוּבִים לַמִּשְׂחָק.", s.end(), n;
  const i = te(s.footerEl, r.length);
  let a;
  const o = () => {
    a == null || a.dispose(), a = void 0;
  }, c = Q(s, t, {
    totalRounds: r.length,
    completionOnly: !0,
    progressBar: i,
    transitionMs: e.transitionMs,
    playCorrectSound: e.playCorrectSound,
    onReplay: e.onReplay ?? (() => {
      ce(t, e);
    }),
    buildRoundUI: u
  });
  s.on("end", o), s.on("start", () => {
    var l;
    i.update(0), (l = e.onStart) == null || l.call(e, s), c.reset();
  }), s.on("start", u);
  function u() {
    o(), s.bodyEl.innerHTML = "";
    const l = ee();
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
function le(t, e, n) {
  t.innerHTML = "";
  const s = document.createElement("div");
  s.className = "option-cards-grid";
  const r = e.map((i) => {
    const a = document.createElement("button");
    a.className = "option-card", a.dataset.id = i.id, a.type = "button";
    const o = document.createElement("span");
    o.className = "option-card__emoji", o.textContent = i.emoji || "";
    const c = document.createElement("span");
    return c.className = "option-card__text", c.textContent = i.text, a.append(o, c), a.addEventListener("click", () => {
      a.disabled || n(i);
    }), s.appendChild(a), { el: a, option: i };
  });
  return t.appendChild(s), {
    /** הַדָּגֵשׁ כַּרְטִיס לְפִי סוּג: 'correct' | 'wrong' | 'hint' */
    highlight(i, a) {
      r.forEach(({ el: o, option: c }) => {
        c.id === i && o.classList.add(`option-card--${a}`);
      });
    },
    /** Visual hints never change the answer lock or other highlights. */
    clearHighlight(i, a) {
      r.forEach(({ el: o, option: c }) => {
        c.id === i && o.classList.remove(`option-card--${a}`);
      });
    },
    setDisabled(i) {
      r.forEach(({ el: a }) => {
        a.disabled = i;
      });
    },
    /** נטרל את כל הכרטיסים */
    disable() {
      r.forEach(({ el: i }) => {
        i.disabled = !0;
      });
    },
    /** אפס את מצב הכרטיסים */
    reset() {
      r.forEach(({ el: i }) => {
        i.className = "option-card", i.disabled = !1;
      });
    },
    /** הסר את הרכיב */
    destroy() {
      t.innerHTML = "";
    }
  };
}
function ge(t, e, n) {
  const s = t.scope.use(le(e, n.options, (r) => {
    t.isAnswered() || (n.isCorrect(r) ? t.onCorrect(() => {
      var i;
      return s.highlight(r.id, "correct"), (i = n.onCorrect) == null ? void 0 : i.call(n, r);
    }) : t.onWrong(() => {
      var i;
      return (i = n.onWrong) == null ? void 0 : i.call(n, r);
    }));
  }));
  return t.subscribeAnswered((r) => s.setDisabled(r)), { highlight: s.highlight, clearHighlight: s.clearHighlight };
}
function pe({ hintAfter: t = 2, escalateAfter: e = 4, onHint: n, onEscalate: s } = {}) {
  let r = 0;
  function i(a) {
    return a >= e ? 2 : a >= t ? 1 : 0;
  }
  return {
    /** דיווח על ניסיון שגוי. מפעיל את הקולבק המתאים ומחזיר את הרמה. */
    miss() {
      r++;
      const a = i(r);
      return a === 2 && s ? s(r) : a === 1 && n && n(r), a;
    },
    /** איפוס לקראת סיבוב חדש. */
    reset() {
      r = 0;
    },
    /** רמת העזרה הנוכחית: 0 ללא, 1 רמז עדין, 2 עזרה מוגברת. */
    get level() {
      return i(r);
    },
    /** מספר הניסיונות השגויים בסיבוב הנוכחי. */
    get misses() {
      return r;
    }
  };
}
const x = [
  "כָּל הַכָּבוֹד",
  "מְצֻיָּן",
  "יֹפִי",
  "נֶהְדָּר",
  "וָאוּ",
  "אֵיזֶה כֵּיף"
], M = [
  "נַסּוּ שׁוּב, אַתֶּם יְכוֹלִים",
  "כִּמְעַט! הַקְשִׁיבוּ שׁוּב",
  "עוֹד נִסָּיוֹן קָטָן",
  "קְרוֹבִים מְאֹד"
];
function de() {
  return x[Math.floor(Math.random() * x.length)];
}
function ye() {
  return M[Math.floor(Math.random() * M.length)];
}
function _e(t) {
  const e = document.createElement("div");
  e.className = "feedback-message", e.setAttribute("aria-live", "polite"), e.setAttribute("role", "status"), t.appendChild(e);
  let n = null;
  function s(r, i, a = 1800) {
    clearTimeout(n), e.textContent = r, e.className = `feedback-message feedback-message--${i}`, n = setTimeout(() => {
      e.textContent = "", e.className = "feedback-message";
    }, a);
  }
  return {
    /** הצג משוב חיובי - טקסט מפורש, או ביטוי שבח אקראי אם לא סופק */
    correct(r) {
      w.correct(), s(r ?? `!${de()}`, "correct"), _(e, "bounce");
    },
    /** הצג עידוד — נסה שוב */
    wrong(r = "נַסֵּה שׁוּב") {
      w.wrong(), s(r, "wrong"), _(e, "pulse");
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
function we(t) {
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
function ve(t, e, n, s) {
  const r = H(t);
  if (!r) return null;
  const i = document.createElement("button");
  return i.className = "btn", i.setAttribute("aria-label", n), i.textContent = `${e} ${n}`, i.onclick = (a) => {
    const o = i.closest("details");
    o && (o.open = !1), s(a);
  }, r.appendChild(i), i;
}
export {
  W as EventBus,
  X as GameShell,
  B as GameState,
  x as PRAISE_PHRASES,
  M as RETRY_HINTS,
  _ as animate,
  oe as bootstrapGame,
  ge as createChoiceRound,
  Se as createDragSource,
  Te as createDropTarget,
  _e as createFeedback,
  pe as createHintTracker,
  U as createLocalState,
  le as createOptionCards,
  te as createProgressBar,
  Q as createRoundManager,
  ee as createRoundScope,
  we as createZone,
  N as endGame,
  Ce as ensureAudioRunning,
  be as getAllProgress,
  z as getAudioContext,
  he as getGameProgress,
  ae as hideLoadingScreen,
  ve as injectHeaderButton,
  re as installGlobalErrorScreen,
  me as mountAudioStatusBanner,
  ke as playBlob,
  de as randomPraise,
  ye as randomRetryHint,
  Z as recordGameResult,
  ce as runGame,
  J as showCompletionScreen,
  se as showLoadingScreen,
  fe as shuffle,
  w as sounds,
  $ as starsFor,
  Le as unlockAudioOutput
};
