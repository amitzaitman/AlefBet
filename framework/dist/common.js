let A = null;
function ee() {
  return typeof window > "u" ? null : window.AudioContext || /** @type {any} */
  window.webkitAudioContext || null;
}
function D() {
  const e = ee();
  if (!e) return null;
  if (!A)
    try {
      A = new e();
    } catch {
      return null;
    }
  return A;
}
async function Ie() {
  const e = D();
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
async function te() {
  const e = D();
  if (!e) return null;
  if (e.state === "suspended")
    try {
      await e.resume();
    } catch {
    }
  return e.state === "running" ? e : null;
}
function ne(e) {
  return typeof e.arrayBuffer == "function" ? e.arrayBuffer() : new Promise((t, n) => {
    const r = new FileReader();
    r.onload = () => t(
      /** @type {ArrayBuffer} */
      r.result
    ), r.onerror = () => n(r.error), r.readAsArrayBuffer(e);
  });
}
async function De(e, { signal: t } = {}) {
  if (t != null && t.aborted || !e) return !1;
  const n = await te();
  if (t != null && t.aborted || !n || typeof n.decodeAudioData != "function") return !1;
  let r;
  try {
    const s = await ne(e);
    r = await new Promise((i, o) => {
      const a = n.decodeAudioData(s, i, o);
      a && typeof a.then == "function" && a.then(i, o);
    });
  } catch {
    return !1;
  }
  return t != null && t.aborted ? !1 : new Promise((s) => {
    let i, o, a = !1;
    const c = (l) => {
      if (!a) {
        if (a = !0, clearTimeout(o), t == null || t.removeEventListener("abort", d), i) {
          i.onended = null;
          try {
            i.stop(), i.disconnect();
          } catch {
          }
        }
        s(l);
      }
    }, d = () => c(!1);
    try {
      i = n.createBufferSource(), i.buffer = r, i.connect(n.destination), i.onended = () => c(!0), t == null || t.addEventListener("abort", d, { once: !0 }), o = setTimeout(() => c(!0), (r.duration + 0.5) * 1e3), i.start(0);
    } catch {
      c(!1);
    }
  });
}
const P = "alefbet-audio-status-banner";
function re(e) {
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
function He(e = typeof document < "u" ? document.body : null, t = {}) {
  const n = t.window || (typeof window < "u" ? window : null);
  if (!e || !n)
    return { destroy() {
    } };
  const r = e.querySelector("#" + P);
  r && r.parentNode && r.parentNode.removeChild(r);
  const s = e.ownerDocument.createElement("div");
  s.id = P, s.className = "alefbet-audio-banner", s.setAttribute("role", "status"), s.setAttribute("aria-live", "polite"), s.dir = "rtl", s.hidden = !0;
  const i = e.ownerDocument.createElement("span");
  i.className = "alefbet-audio-banner__msg", s.appendChild(i);
  const o = e.ownerDocument.createElement("button");
  o.type = "button", o.className = "alefbet-audio-banner__dismiss", o.setAttribute("aria-label", "סְגוֹר הוֹדָעָה"), o.textContent = "×", o.hidden = !0, s.appendChild(o), e.appendChild(s);
  let a = null;
  function c() {
    a && (clearTimeout(a), a = null);
  }
  function d() {
    c(), s.hidden = !0, s.classList.remove("is-visible", "is-await", "is-unsupported", "is-failed"), s.onclick = null, o.hidden = !0;
  }
  function l(h) {
    const u = re(h);
    if (!u) {
      d();
      return;
    }
    c(), i.textContent = u.message, s.hidden = !1, s.classList.add("is-visible"), s.classList.toggle("is-await", u.kind === "await"), s.classList.toggle("is-unsupported", u.kind === "unsupported"), s.classList.toggle("is-failed", u.kind === "failed"), u.kind, u.kind === "await" ? (s.onclick = () => {
      try {
        e.ownerDocument.body.dispatchEvent(new MouseEvent("pointerdown", { bubbles: !0 }));
      } catch {
      }
      d();
    }, o.hidden = !0) : u.kind === "unsupported" ? (s.onclick = null, o.hidden = !1, o.onclick = (m) => {
      m.stopPropagation(), d();
    }) : u.kind === "failed" && (s.onclick = null, o.hidden = !0, a = setTimeout(() => d(), 6e3));
  }
  function f(h) {
    const m = /** @type {CustomEvent} */ (h.detail || {}).state;
    if (m === "ready" || m === "idle") {
      d();
      return;
    }
    l(m);
  }
  return n.addEventListener("alefbet:tts-state", f), {
    destroy() {
      n.removeEventListener("alefbet:tts-state", f), c(), s.parentNode && s.parentNode.removeChild(s);
    }
  };
}
class se {
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
class ie {
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
const oe = "alefbet-zoom-lock", O = /* @__PURE__ */ new WeakSet();
function N(e) {
  e.cancelable && e.preventDefault();
}
function ae(e) {
  const t = (
    /** @type {TouchEvent} */
    e.touches
  );
  t && t.length > 1 && N(e);
}
function ce(e = typeof document < "u" ? document : null) {
  if (!e || O.has(e)) return !1;
  O.add(e), e.documentElement.classList.add(oe);
  const t = { passive: !1 };
  return e.addEventListener("gesturestart", N, t), e.addEventListener("gesturechange", N, t), e.addEventListener("touchmove", ae, t), !0;
}
const L = /* @__PURE__ */ new WeakMap();
function Y(e) {
  var t;
  (t = L.get(e)) == null || t.end();
}
class ue {
  /**
   * @param {HTMLElement} containerEl - אלמנט המיכל
   * @param {object} config - הגדרות: { totalRounds, title, homeUrl }
   */
  constructor(t, n = {}) {
    Y(t), L.set(t, this), this.ended = !1, this._timers = /* @__PURE__ */ new Set(), this.container = t, this.config = {
      totalRounds: 8,
      title: "מִשְׂחָק",
      homeUrl: "../../index.html",
      ...n
    }, this.events = new se(), this.state = new ie(this.config.totalRounds), this.gameId = typeof n.gameId == "string" ? n.gameId : "", this._buildShell();
  }
  _buildShell() {
    this.container.classList.add("alefbet-game"), ce(this.container.ownerDocument);
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
      this._timers.clear(), L.get(this.container) === this && L.delete(this.container), this.events.emit("end", { score: t, state: this.state });
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
function $e(e) {
  const t = [...e];
  for (let n = t.length - 1; n > 0; n--) {
    const r = Math.floor(Math.random() * (n + 1));
    [t[n], t[r]] = [t[r], t[n]];
  }
  return t;
}
function de() {
  const e = D();
  return e ? (e.state === "suspended" && e.resume(), e) : null;
}
function w(e, t, n = "sine", r = 0.3) {
  const s = de();
  if (s)
    try {
      const i = s.createOscillator(), o = s.createGain();
      i.connect(o), o.connect(s.destination), i.type = n, i.frequency.setValueAtTime(e, s.currentTime), o.gain.setValueAtTime(r, s.currentTime), o.gain.exponentialRampToValueAtTime(1e-3, s.currentTime + t), i.start(s.currentTime), i.stop(s.currentTime + t + 0.05);
    } catch {
    }
}
const C = {
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
}, q = {
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
}, le = {
  shake: 420,
  bounce: 480,
  pulse: 600,
  fadeIn: 320,
  confetti: 700
};
function R(e, t) {
  !e || !q[t] || e.animate(q[t], {
    duration: le[t] || 400,
    easing: "ease-in-out",
    fill: "none"
  });
}
function fe(e, t) {
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
    } catch (c) {
      return console.warn(`[createLocalState] שגיאה בשמירת "${e}":`, c), !1;
    }
    return n.forEach((c) => c(a)), !0;
  }
  function i(a) {
    return s(a(r()));
  }
  function o(a) {
    return n.push(a), function() {
      const d = n.indexOf(a);
      d !== -1 && n.splice(d, 1);
    };
  }
  return { get: r, set: s, update: i, subscribe: o };
}
const me = "alefbet.progress.v1", H = fe(me, {});
function j(e, t) {
  if (!Number.isFinite(e) || !Number.isFinite(t) || t <= 0) return 1;
  const n = e / t;
  return n >= 0.8 ? 3 : n >= 0.5 ? 2 : 1;
}
function he(e, { score: t, total: n }) {
  if (!e || !Number.isFinite(t) || !Number.isFinite(n) || n <= 0) return null;
  const r = j(t, n);
  let s = null;
  return H.update((i) => {
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
function Pe(e) {
  return H.get()[e] ?? null;
}
function Oe() {
  return H.get();
}
function pe(e, t, n, r, s = {}) {
  C.cheer(), s.gameId && he(s.gameId, { score: t, total: n });
  const i = s.completionOnly ? n === 1 ? "הִשְׁלַמְתֶּם מְשִׂימָה!" : `הִשְׁלַמְתֶּם ${n} מְשִׂימוֹת!` : `נִיקּוּד: ${t} מִתּוֹךְ ${n}`, o = j(t, n), a = "⭐".repeat(o) + "☆".repeat(3 - o), c = document.createElement("div");
  c.className = "completion-screen", c.innerHTML = `
    <div class="completion-screen__content">
      <div class="completion-screen__stars" aria-label="${o} כּוֹכָבִים">${a}</div>
      <h2 class="completion-screen__title">כָּל הַכָּבוֹד!</h2>
      <p class="completion-screen__score">${i}</p>
      <div class="completion-screen__actions">
        <button class="completion-screen__replay btn btn--primary">שַׂחֵק שׁוּב</button>
      </div>
    </div>
  `;
  const d = s.homeUrl === void 0 ? "../../index.html" : s.homeUrl;
  if (d) {
    const l = document.createElement("a");
    l.className = "completion-screen__home btn", l.href = d, l.textContent = "בְּחִירַת מִשְׂחָק", c.querySelector(".completion-screen__actions").appendChild(l);
  }
  c.querySelector(".completion-screen__replay").addEventListener("click", () => {
    c.remove(), r();
  }), e.innerHTML = "", e.appendChild(c), R(c.querySelector(".completion-screen__content"), "fadeIn");
}
function be(e, t, {
  totalRounds: n,
  progressBar: r = null,
  buildRoundUI: s,
  onCorrect: i,
  onWrong: o,
  transitionMs: a = 800,
  playCorrectSound: c = !0,
  completionOnly: d = !1,
  onReplay: l = () => location.reload()
}) {
  let f = !1;
  const h = /* @__PURE__ */ new Set();
  function u(p) {
    f = p || e.ended, h.forEach(($) => $(f));
  }
  function m(p) {
    return h.add(p), p(f || e.ended), () => {
      h.delete(p);
    };
  }
  e.on("end", () => {
    u(!0), h.clear();
  });
  async function _(p) {
    if (f || e.ended) return;
    u(!0), c && C.correct();
    try {
      if (p && await p(), e.ended) return;
      i && await i();
    } catch (Q) {
      throw u(!1), Q;
    }
    if (e.ended || (e.state.addScore(1), r == null || r.update(e.state.currentRound), !await e.delay(a))) return;
    e.nextRound() ? (u(!1), s()) : pe(t, e.state.score, n, l, { gameId: e.gameId, completionOnly: d, homeUrl: e.config.homeUrl });
  }
  async function Z(p) {
    if (!(f || e.ended)) {
      u(!0);
      try {
        p && await p(), !e.ended && o && await o();
      } finally {
        u(!1);
      }
    }
  }
  function K() {
    return f;
  }
  function V() {
    u(!1);
  }
  return { handleCorrect: _, handleWrong: Z, isAnswered: K, reset: V, subscribe: m };
}
function ge() {
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
function ye(e, t) {
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
let x = !1, I = !1, E = null;
const _e = [
  "ResizeObserver loop",
  // אזהרת דפדפן שפירה
  "Script error."
  // שגיאת cross-origin אטומה, לרוב תוסף דפדפן
];
function B(e) {
  const t = String(e || "");
  return _e.some((n) => t.includes(n));
}
function F() {
  var t;
  if (I || typeof document > "u" || !document.body) return;
  I = !0;
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
function we() {
  if (typeof window > "u") return { destroy() {
  } };
  if (x) return { destroy() {
  } };
  x = !0;
  const e = (n) => {
    B(n == null ? void 0 : n.message) || (console.error("[alefbet] uncaught error:", (n == null ? void 0 : n.error) ?? (n == null ? void 0 : n.message)), F());
  }, t = (n) => {
    const r = (
      /** @type {any} */
      n == null ? void 0 : n.reason
    );
    B((r == null ? void 0 : r.message) ?? r) || (console.error("[alefbet] unhandled rejection:", r), F());
  };
  return window.addEventListener("error", e), window.addEventListener("unhandledrejection", t), E = () => {
    window.removeEventListener("error", e), window.removeEventListener("unhandledrejection", t), x = !1, I = !1;
  }, { destroy: () => {
    E == null || E(), E = null;
  } };
}
function ve(e, t = "טוֹעֵן...") {
  e.innerHTML = `<div class="ab-loading">${t}</div>`;
}
function Ee(e) {
  e.innerHTML = "";
}
const T = /* @__PURE__ */ new WeakMap();
async function Se(e, t) {
  Y(e);
  const n = {};
  T.set(e, n), we(), ve(e, t.loadingMessage ?? "טוֹעֵן...");
  const r = t.audio !== !1 ? await import("./game-audio-Cwpuytb0.js").then((o) => o.e) : null;
  if (T.get(e) !== n)
    return { shell: null, activeRounds: [], aborted: !0 };
  if (t.onBeforeHide && (await t.onBeforeHide() === !1 || T.get(e) !== n))
    return { shell: null, activeRounds: [], aborted: !0 };
  Ee(e);
  const s = t.defaultRounds ?? [], i = new ue(e, {
    totalRounds: t.totalRounds ?? s.length,
    title: t.title,
    gameId: t.gameId
  });
  return r == null || r.attachGameAudio(i), { shell: i, activeRounds: s, aborted: !1 };
}
async function Le(e, t) {
  const n = await Se(e, t);
  if (n.aborted) return n;
  const { shell: r, activeRounds: s } = n;
  if (!s.length)
    return r.bodyEl.textContent = "אֵין סִבּוּבִים לַמִּשְׂחָק.", r.end(), n;
  const i = ye(r.footerEl, s.length);
  let o;
  const a = () => {
    o == null || o.dispose(), o = void 0;
  }, c = be(r, e, {
    totalRounds: s.length,
    completionOnly: !0,
    progressBar: i,
    transitionMs: t.transitionMs,
    playCorrectSound: t.playCorrectSound,
    onReplay: t.onReplay ?? (() => {
      Le(e, t);
    }),
    buildRoundUI: d
  });
  r.on("end", a), r.on("start", () => {
    var l;
    i.update(0), (l = t.onStart) == null || l.call(t, r), c.reset();
  }), r.on("start", d);
  function d() {
    a(), r.bodyEl.innerHTML = "";
    const l = ge();
    o = l;
    const f = () => !r.ended && !l.signal.aborted, h = r.state.currentRound - 1;
    try {
      const u = t.buildRound({
        shell: r,
        index: h,
        round: s[h],
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
      u && l.use(u);
    } catch (u) {
      throw l.dispose(), u;
    }
  }
  return r.start(), n;
}
function Re(e, t, n) {
  e.innerHTML = "";
  const r = document.createElement("div");
  r.className = "option-cards-grid";
  const s = t.map((i) => {
    const o = document.createElement("button");
    o.className = "option-card", o.dataset.id = i.id, o.type = "button";
    const a = document.createElement("span");
    a.className = "option-card__emoji", a.textContent = i.emoji || "";
    const c = document.createElement("span");
    return c.className = "option-card__text", c.textContent = i.text, o.append(a, c), o.addEventListener("click", () => {
      o.disabled || n(i);
    }), r.appendChild(o), { el: o, option: i };
  });
  return e.appendChild(r), {
    /** הַדָּגֵשׁ כַּרְטִיס לְפִי סוּג: 'correct' | 'wrong' | 'hint' */
    highlight(i, o) {
      s.forEach(({ el: a, option: c }) => {
        c.id === i && a.classList.add(`option-card--${o}`);
      });
    },
    /** Visual hints never change the answer lock or other highlights. */
    clearHighlight(i, o) {
      s.forEach(({ el: a, option: c }) => {
        c.id === i && a.classList.remove(`option-card--${o}`);
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
function qe(e, t, n) {
  const r = e.scope.use(Re(t, n.options, (s) => {
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
function Be({ hintAfter: e = 2, escalateAfter: t = 4, onHint: n, onEscalate: r } = {}) {
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
const X = [
  "כָּל הַכָּבוֹד",
  "מְצֻיָּן",
  "יֹפִי",
  "נֶהְדָּר",
  "וָאוּ",
  "אֵיזֶה כֵּיף"
], G = [
  "נַסּוּ שׁוּב, אַתֶּם יְכוֹלִים",
  "כִּמְעַט! הַקְשִׁיבוּ שׁוּב",
  "עוֹד נִסָּיוֹן קָטָן",
  "קְרוֹבִים מְאֹד"
];
function Ce() {
  return X[Math.floor(Math.random() * X.length)];
}
function Fe() {
  return G[Math.floor(Math.random() * G.length)];
}
function Xe(e) {
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
      C.correct(), r(s ?? `!${Ce()}`, "correct"), R(t, "bounce");
    },
    /** הצג עידוד — נסה שוב */
    wrong(s = "נַסֵּה שׁוּב") {
      C.wrong(), r(s, "wrong"), R(t, "pulse");
    },
    /** הצג רמז */
    hint(s) {
      r(s, "hint"), R(t, "pulse");
    },
    /** הסר את הרכיב */
    destroy() {
      clearTimeout(n), t.remove();
    }
  };
}
function Ae(e) {
  let t = e.querySelector(".adult-tools__panel");
  if (t) return t;
  const n = e.querySelector(".game-header");
  if (!n) return null;
  const r = document.createElement("details");
  return r.className = "adult-tools", r.innerHTML = '<summary aria-label="להורים ולמורים">☰<span>למבוגרים</span></summary><div class="adult-tools__panel"><p>להורים ולמורים</p></div>', r.addEventListener("keydown", (s) => {
    s.key === "Escape" && (r.open = !1, r.querySelector("summary").focus(), s.stopPropagation());
  }), n.appendChild(r), r.querySelector(".adult-tools__panel");
}
function Ge(e, t, n, r) {
  const s = Ae(e);
  if (!s) return null;
  const i = document.createElement("button");
  return i.className = "btn", i.setAttribute("aria-label", n), i.textContent = `${t} ${n}`, i.onclick = (o) => {
    const a = i.closest("details");
    a && (a.open = !1), r(o);
  }, s.appendChild(i), i;
}
let y = null, b = null, U = 0, W = 0, v = null, k = 0, M = 0;
const S = /* @__PURE__ */ new Map();
function z(e, t) {
  var r;
  const n = (r = document.elementFromPoint(e, t)) == null ? void 0 : r.closest('[data-drop-target="true"]');
  return n && S.has(n) && !n.matches(":disabled") && n.getAttribute("aria-disabled") !== "true" ? n : null;
}
function xe(e, t, n) {
  const r = e.getBoundingClientRect();
  U = r.width / 2, W = r.height / 2, b = e.cloneNode(!0), b.setAttribute("aria-hidden", "true"), b.setAttribute("tabindex", "-1"), Object.assign(b.style, {
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
  }), J(t, n), document.body.appendChild(b);
}
function J(e, t) {
  b && (b.style.transform = `translate3d(${e - U}px, ${t - W}px, 0) scale(1.12)`);
}
function Te(e, t) {
  k = e, M = t, v === null && (v = requestAnimationFrame(() => {
    v = null, J(k, M), Me(z(k, M));
  }));
}
function ke() {
  v !== null && (cancelAnimationFrame(v), v = null), b == null || b.remove(), b = null;
}
let g = null;
function Me(e) {
  g !== e && (g == null || g.classList.remove("drop-target--hover"), g = e, e == null || e.classList.add("drop-target--hover"));
}
function Ne() {
  g == null || g.classList.remove("drop-target--hover"), g = null;
}
function Ye(e, t, { onTap: n } = {}) {
  e.classList.add("drag-source");
  let r = null, s = null, i = null, o = null;
  function a() {
    var l;
    r && (e.removeEventListener("pointermove", r), e.removeEventListener("pointerup", s), e.removeEventListener("pointercancel", i), e.removeEventListener("lostpointercapture", i), r = s = i = null), Ne(), ke(), e.classList.remove("drag-source--dragging"), y = null;
    const d = o;
    o = null, d !== null && ((l = e.hasPointerCapture) != null && l.call(e, d)) && e.releasePointerCapture(d);
  }
  function c(d) {
    if (e.matches(":disabled") || e.getAttribute("aria-disabled") === "true" || d.button !== void 0 && d.button !== 0 || o !== null) return;
    d.preventDefault(), y && y.cancel(), y = { el: e, data: t, cancel: a }, o = d.pointerId;
    let l = !1;
    const f = () => {
      l = !0, e.classList.add("drag-source--dragging"), xe(e, d.clientX, d.clientY);
    }, h = (u) => Math.hypot(u.clientX - d.clientX, u.clientY - d.clientY) >= 8;
    n || f(), e.setPointerCapture(d.pointerId), r = (u) => {
      u.pointerId === o && (!l && h(u) && f(), l && Te(u.clientX, u.clientY));
    }, s = (u) => {
      if (u.pointerId !== o) return;
      const m = !l && !h(u), _ = m && n ? null : z(u.clientX, u.clientY);
      if (a(), m && n) {
        n();
        return;
      }
      _ && S.has(_) && S.get(_).onDrop({ data: t, sourceEl: e, targetEl: _ });
    }, i = (u) => {
      u.pointerId === o && a();
    }, e.addEventListener("pointermove", r), e.addEventListener("pointerup", s), e.addEventListener("pointercancel", i), e.addEventListener("lostpointercapture", i);
  }
  return e.addEventListener("pointerdown", c), {
    destroy() {
      e.removeEventListener("pointerdown", c), (y == null ? void 0 : y.el) === e && a(), e.classList.remove("drag-source");
    }
  };
}
function je(e, t) {
  return e.setAttribute("data-drop-target", "true"), e.classList.add("drop-target--active"), S.set(e, { onDrop: t }), {
    destroy() {
      e.removeAttribute("data-drop-target"), e.classList.remove("drop-target--active", "drop-target--hover"), S.delete(e);
    }
  };
}
export {
  se as EventBus,
  ue as GameShell,
  ie as GameState,
  X as PRAISE_PHRASES,
  G as RETRY_HINTS,
  R as animate,
  Se as bootstrapGame,
  qe as createChoiceRound,
  Ye as createDragSource,
  je as createDropTarget,
  Xe as createFeedback,
  Be as createHintTracker,
  fe as createLocalState,
  Re as createOptionCards,
  ye as createProgressBar,
  be as createRoundManager,
  ge as createRoundScope,
  Y as endGame,
  te as ensureAudioRunning,
  Oe as getAllProgress,
  D as getAudioContext,
  Pe as getGameProgress,
  Ee as hideLoadingScreen,
  Ge as injectHeaderButton,
  we as installGlobalErrorScreen,
  ce as lockPageZoom,
  He as mountAudioStatusBanner,
  De as playBlob,
  Ce as randomPraise,
  Fe as randomRetryHint,
  he as recordGameResult,
  Le as runGame,
  pe as showCompletionScreen,
  ve as showLoadingScreen,
  $e as shuffle,
  C as sounds,
  j as starsFor,
  Ie as unlockAudioOutput
};
