class V {
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
class Z {
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
const K = "alefbet-zoom-lock", D = /* @__PURE__ */ new WeakSet();
function I(e) {
  e.cancelable && e.preventDefault();
}
function Q(e) {
  const t = (
    /** @type {TouchEvent} */
    e.touches
  );
  t && t.length > 1 && I(e);
}
function ee(e = typeof document < "u" ? document : null) {
  if (!e || D.has(e)) return !1;
  D.add(e), e.documentElement.classList.add(K);
  const t = { passive: !1 };
  return e.addEventListener("gesturestart", I, t), e.addEventListener("gesturechange", I, t), e.addEventListener("touchmove", Q, t), !0;
}
const L = /* @__PURE__ */ new WeakMap();
function F(e) {
  var t;
  (t = L.get(e)) == null || t.end();
}
class te {
  /**
   * @param {HTMLElement} containerEl - אלמנט המיכל
   * @param {object} config - הגדרות: { totalRounds, title, homeUrl }
   */
  constructor(t, n = {}) {
    F(t), L.set(t, this), this.ended = !1, this._timers = /* @__PURE__ */ new Set(), this.container = t, this.config = {
      totalRounds: 8,
      title: "מִשְׂחָק",
      homeUrl: "../../index.html",
      ...n
    }, this.events = new V(), this.state = new Z(this.config.totalRounds), this.gameId = typeof n.gameId == "string" ? n.gameId : "", this._buildShell();
  }
  _buildShell() {
    this.container.classList.add("alefbet-game"), ee(this.container.ownerDocument);
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
  /** הירשם לאירועי מחזור החיים: start, round, end */
  on(t, n) {
    return this.events.on(t, n), this;
  }
}
function ne() {
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
    listen(r, a, s, o) {
      e.signal.aborted || (r.addEventListener(a, s, o), n(() => r.removeEventListener(a, s, o)));
    },
    schedule(r, a) {
      if (e.signal.aborted) return () => {
      };
      const s = () => {
        clearTimeout(o), t.delete(s);
      }, o = setTimeout(() => {
        t.delete(s), e.signal.aborted || r();
      }, a);
      return n(s), s;
    },
    dispose() {
      if (e.signal.aborted) return;
      e.abort();
      const r = [...t].reverse();
      t.clear();
      for (const a of r)
        try {
          a();
        } catch (s) {
          console.warn("Round cleanup failed", s);
        }
    }
  };
}
let A = null;
function re() {
  return typeof window > "u" ? null : window.AudioContext || /** @type {any} */
  window.webkitAudioContext || null;
}
function N() {
  const e = re();
  if (!e) return null;
  if (!A)
    try {
      A = new e();
    } catch {
      return null;
    }
  return A;
}
async function Te() {
  const e = N();
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
async function se() {
  const e = N();
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
async function Me(e, { signal: t } = {}) {
  if (t != null && t.aborted || !e) return !1;
  const n = await se();
  if (t != null && t.aborted || !n || typeof n.decodeAudioData != "function") return !1;
  let r;
  try {
    const a = await ae(e);
    r = await new Promise((s, o) => {
      const u = n.decodeAudioData(a, s, o);
      u && typeof u.then == "function" && u.then(s, o);
    });
  } catch {
    return !1;
  }
  return t != null && t.aborted ? !1 : new Promise((a) => {
    let s, o, u = !1;
    const i = (c) => {
      if (!u) {
        if (u = !0, clearTimeout(o), t == null || t.removeEventListener("abort", l), s) {
          s.onended = null;
          try {
            s.stop(), s.disconnect();
          } catch {
          }
        }
        a(c);
      }
    }, l = () => i(!1);
    try {
      s = n.createBufferSource(), s.buffer = r, s.connect(n.destination), s.onended = () => i(!0), t == null || t.addEventListener("abort", l, { once: !0 }), o = setTimeout(() => i(!0), (r.duration + 0.5) * 1e3), s.start(0);
    } catch {
      i(!1);
    }
  });
}
function oe() {
  const e = N();
  return e ? (e.state === "suspended" && e.resume(), e) : null;
}
function w(e, t, n = "sine", r = 0.3) {
  const a = oe();
  if (a)
    try {
      const s = a.createOscillator(), o = a.createGain();
      s.connect(o), o.connect(a.destination), s.type = n, s.frequency.setValueAtTime(e, a.currentTime), o.gain.setValueAtTime(r, a.currentTime), o.gain.exponentialRampToValueAtTime(1e-3, a.currentTime + t), s.start(a.currentTime), s.stop(a.currentTime + t + 0.05);
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
}, P = {
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
}, ie = {
  shake: 420,
  bounce: 480,
  pulse: 600,
  fadeIn: 320,
  confetti: 700
};
function R(e, t) {
  !e || !P[t] || e.animate(P[t], {
    duration: ie[t] || 400,
    easing: "ease-in-out",
    fill: "none"
  });
}
function ce(e, t) {
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
    } catch (o) {
      return console.warn(`[createLocalState] שגיאה בשמירת "${e}":`, o), !1;
    }
    return !0;
  }
  function a(s) {
    return r(s(n()));
  }
  return { get: n, set: r, update: a };
}
const ue = "alefbet.progress.v1", le = ce(ue, {});
function j(e, t) {
  if (!Number.isFinite(e) || !Number.isFinite(t) || t <= 0) return 1;
  const n = e / t;
  return n >= 0.8 ? 3 : n >= 0.5 ? 2 : 1;
}
function de(e, { score: t, total: n }) {
  if (!e || !Number.isFinite(t) || !Number.isFinite(n) || n <= 0) return null;
  const r = j(t, n);
  let a = null;
  return le.update((s) => {
    const o = s[e];
    return a = {
      plays: ((o == null ? void 0 : o.plays) ?? 0) + 1,
      bestScore: Math.max((o == null ? void 0 : o.bestScore) ?? 0, t),
      bestStars: Math.max((o == null ? void 0 : o.bestStars) ?? 0, r),
      total: o && (o.bestScore ?? 0) > t ? o.total : n,
      lastPlayed: Date.now()
    }, { ...s, [e]: a };
  }), a;
}
function fe(e, t, n, r, a = {}) {
  C.cheer(), a.gameId && de(a.gameId, { score: t, total: n });
  const s = a.completionOnly ? n === 1 ? "הִשְׁלַמְתֶּם מְשִׂימָה!" : `הִשְׁלַמְתֶּם ${n} מְשִׂימוֹת!` : `נִיקּוּד: ${t} מִתּוֹךְ ${n}`, o = j(t, n), u = "⭐".repeat(o) + "☆".repeat(3 - o), i = document.createElement("div");
  i.className = "completion-screen", i.innerHTML = `
    <div class="completion-screen__content">
      <div class="completion-screen__stars" aria-label="${o} כּוֹכָבִים">${u}</div>
      <h2 class="completion-screen__title">כָּל הַכָּבוֹד!</h2>
      <p class="completion-screen__score">${s}</p>
      <div class="completion-screen__actions">
        <button class="completion-screen__replay btn btn--primary">שַׂחֵק שׁוּב</button>
      </div>
    </div>
  `;
  const l = a.homeUrl === void 0 ? "../../index.html" : a.homeUrl;
  if (l) {
    const c = document.createElement("a");
    c.className = "completion-screen__home btn", c.href = l, c.textContent = "בְּחִירַת מִשְׂחָק", i.querySelector(".completion-screen__actions").appendChild(c);
  }
  i.querySelector(".completion-screen__replay").addEventListener("click", () => {
    i.remove(), r();
  }), e.innerHTML = "", e.appendChild(i), R(i.querySelector(".completion-screen__content"), "fadeIn");
}
function me(e, t, {
  totalRounds: n,
  progressBar: r = null,
  buildRoundUI: a,
  transitionMs: s = 800,
  playCorrectSound: o = !0,
  completionOnly: u = !1,
  onReplay: i = () => location.reload()
}) {
  let l = !1;
  const c = /* @__PURE__ */ new Set();
  function f(h) {
    l = h || e.ended, c.forEach(($) => $(l));
  }
  function b(h) {
    return c.add(h), h(l || e.ended), () => {
      c.delete(h);
    };
  }
  e.on("end", () => {
    f(!0), c.clear();
  });
  async function d(h) {
    if (l || e.ended) return;
    f(!0), o && C.correct();
    try {
      h && await h();
    } catch (J) {
      throw f(!1), J;
    }
    if (e.ended || (e.state.addScore(1), r == null || r.update(e.state.currentRound), !await e.delay(s))) return;
    e.nextRound() ? (f(!1), a()) : fe(t, e.state.score, n, i, { gameId: e.gameId, completionOnly: u, homeUrl: e.config.homeUrl });
  }
  async function m(h) {
    if (!(l || e.ended)) {
      f(!0);
      try {
        h && await h();
      } finally {
        f(!1);
      }
    }
  }
  function _() {
    return l;
  }
  function z() {
    f(!1);
  }
  return { handleCorrect: d, handleWrong: m, isAnswered: _, reset: z, subscribe: b };
}
function he(e, t) {
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
  ), a = n.querySelector(".progress-bar__label");
  return {
    /** עדכן את ההתקדמות */
    update(s) {
      const o = Math.round(s / t * 100);
      r.style.width = `${o}%`, a.textContent = `${s} / ${t}`, n.setAttribute("aria-valuenow", String(s));
    },
    /** הסר את הרכיב */
    destroy() {
      n.remove();
    }
  };
}
let x = !1, H = !1, E = null;
const pe = [
  "ResizeObserver loop",
  // אזהרת דפדפן שפירה
  "Script error."
  // שגיאת cross-origin אטומה, לרוב תוסף דפדפן
];
function q(e) {
  const t = String(e || "");
  return pe.some((n) => t.includes(n));
}
function O() {
  var t;
  if (H || typeof document > "u" || !document.body) return;
  H = !0;
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
function ge() {
  if (typeof window > "u") return { destroy() {
  } };
  if (x) return { destroy() {
  } };
  x = !0;
  const e = (n) => {
    q(n == null ? void 0 : n.message) || (console.error("[alefbet] uncaught error:", (n == null ? void 0 : n.error) ?? (n == null ? void 0 : n.message)), O());
  }, t = (n) => {
    const r = (
      /** @type {any} */
      n == null ? void 0 : n.reason
    );
    q((r == null ? void 0 : r.message) ?? r) || (console.error("[alefbet] unhandled rejection:", r), O());
  };
  return window.addEventListener("error", e), window.addEventListener("unhandledrejection", t), E = () => {
    window.removeEventListener("error", e), window.removeEventListener("unhandledrejection", t), x = !1, H = !1;
  }, { destroy: () => {
    E == null || E(), E = null;
  } };
}
function be(e, t = "טוֹעֵן...") {
  e.innerHTML = `<div class="ab-loading">${t}</div>`;
}
function ye(e) {
  e.innerHTML = "";
}
const T = /* @__PURE__ */ new WeakMap();
async function _e(e, t) {
  F(e);
  const n = {};
  T.set(e, n), ge(), be(e, t.loadingMessage ?? "טוֹעֵן...");
  const r = t.audio !== !1 ? await import("./game-audio-BbLXdX8-.js") : null;
  if (T.get(e) !== n)
    return { shell: null, activeRounds: [], aborted: !0 };
  if (t.onBeforeHide && (await t.onBeforeHide() === !1 || T.get(e) !== n))
    return { shell: null, activeRounds: [], aborted: !0 };
  ye(e);
  const a = t.defaultRounds ?? [], s = new te(e, {
    totalRounds: t.totalRounds ?? a.length,
    title: t.title,
    gameId: t.gameId
  });
  return r == null || r.attachGameAudio(s), { shell: s, activeRounds: a, aborted: !1 };
}
async function we(e, t) {
  const n = await _e(e, t);
  if (n.aborted) return n;
  const { shell: r, activeRounds: a } = n;
  if (!a.length)
    return r.bodyEl.textContent = "אֵין סִבּוּבִים לַמִּשְׂחָק.", r.end(), n;
  const s = he(r.footerEl, a.length);
  let o;
  const u = () => {
    o == null || o.dispose(), o = void 0;
  }, i = me(r, e, {
    totalRounds: a.length,
    completionOnly: !0,
    progressBar: s,
    transitionMs: t.transitionMs,
    playCorrectSound: t.playCorrectSound,
    onReplay: t.onReplay ?? (() => {
      we(e, t);
    }),
    buildRoundUI: l
  });
  r.on("end", u), r.on("start", () => {
    var c;
    s.update(0), (c = t.onStart) == null || c.call(t, r), i.reset();
  }), r.on("start", l);
  function l() {
    u(), r.bodyEl.innerHTML = "";
    const c = ne();
    o = c;
    const f = () => !r.ended && !c.signal.aborted, b = r.state.currentRound - 1;
    try {
      const d = t.buildRound({
        shell: r,
        index: b,
        round: a[b],
        isActive: f,
        scope: c,
        isAnswered: () => !f() || i.isAnswered(),
        subscribeAnswered: (m) => f() ? c.use(i.subscribe(m)) : (m(!0), () => {
        }),
        onCorrect: async (m) => {
          f() && await i.handleCorrect(m);
        },
        onWrong: async (m) => {
          f() && await i.handleWrong(m);
        },
        schedule: c.schedule
      });
      d && c.use(d);
    } catch (d) {
      throw c.dispose(), d;
    }
  }
  return r.start(), n;
}
function ve(e, t, n) {
  e.innerHTML = "";
  const r = document.createElement("div");
  r.className = "option-cards-grid";
  const a = t.map((s) => {
    const o = document.createElement("button");
    o.className = "option-card", o.dataset.id = s.id, o.type = "button";
    const u = document.createElement("span");
    u.className = "option-card__emoji", u.textContent = s.emoji || "";
    const i = document.createElement("span");
    return i.className = "option-card__text", i.textContent = s.text, o.append(u, i), o.addEventListener("click", () => {
      o.disabled || n(s);
    }), r.appendChild(o), { el: o, option: s };
  });
  return e.appendChild(r), {
    /** הַדָּגֵשׁ כַּרְטִיס לְפִי סוּג: 'correct' | 'wrong' | 'hint' */
    highlight(s, o) {
      a.forEach(({ el: u, option: i }) => {
        i.id === s && u.classList.add(`option-card--${o}`);
      });
    },
    /** Visual hints never change the answer lock or other highlights. */
    clearHighlight(s, o) {
      a.forEach(({ el: u, option: i }) => {
        i.id === s && u.classList.remove(`option-card--${o}`);
      });
    },
    setDisabled(s) {
      a.forEach(({ el: o }) => {
        o.disabled = s;
      });
    },
    /** הסר את הרכיב */
    destroy() {
      e.innerHTML = "";
    }
  };
}
function ke(e, t, n) {
  const r = e.scope.use(ve(t, n.options, (a) => {
    e.isAnswered() || (n.isCorrect(a) ? e.onCorrect(() => {
      var s;
      return r.highlight(a.id, "correct"), (s = n.onCorrect) == null ? void 0 : s.call(n, a);
    }) : e.onWrong(() => {
      var s;
      return (s = n.onWrong) == null ? void 0 : s.call(n, a);
    }));
  }));
  return e.subscribeAnswered((a) => r.setDisabled(a)), { highlight: r.highlight, clearHighlight: r.clearHighlight };
}
function Ie({ hintAfter: e = 2, escalateAfter: t = 4, onHint: n, onEscalate: r } = {}) {
  let a = 0;
  function s(o) {
    return o >= t ? 2 : o >= e ? 1 : 0;
  }
  return {
    /** דיווח על ניסיון שגוי. מפעיל את הקולבק המתאים ומחזיר את הרמה. */
    miss() {
      a++;
      const o = s(a);
      return o === 2 && r ? r(a) : o === 1 && n && n(a), o;
    },
    /** איפוס לקראת סיבוב חדש. */
    reset() {
      a = 0;
    },
    /** רמת העזרה הנוכחית: 0 ללא, 1 רמז עדין, 2 עזרה מוגברת. */
    get level() {
      return s(a);
    },
    /** מספר הניסיונות השגויים בסיבוב הנוכחי. */
    get misses() {
      return a;
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
], B = [
  "נַסּוּ שׁוּב, אַתֶּם יְכוֹלִים",
  "כִּמְעַט! הַקְשִׁיבוּ שׁוּב",
  "עוֹד נִסָּיוֹן קָטָן",
  "קְרוֹבִים מְאֹד"
];
function Ee() {
  return X[Math.floor(Math.random() * X.length)];
}
function He() {
  return B[Math.floor(Math.random() * B.length)];
}
function Ne(e) {
  const t = document.createElement("div");
  t.className = "feedback-message", t.setAttribute("aria-live", "polite"), t.setAttribute("role", "status"), e.appendChild(t);
  let n = null;
  function r(a, s, o = 1800) {
    clearTimeout(n), t.textContent = a, t.className = `feedback-message feedback-message--${s}`, n = setTimeout(() => {
      t.textContent = "", t.className = "feedback-message";
    }, o);
  }
  return {
    /** הצג משוב חיובי - טקסט מפורש, או ביטוי שבח אקראי אם לא סופק */
    correct(a) {
      C.correct(), r(a ?? `!${Ee()}`, "correct"), R(t, "bounce");
    },
    /** הצג עידוד — נסה שוב */
    wrong(a = "נַסֵּה שׁוּב") {
      C.wrong(), r(a, "wrong"), R(t, "pulse");
    },
    /** הצג רמז */
    hint(a) {
      r(a, "hint"), R(t, "pulse");
    },
    /** הסר את הרכיב */
    destroy() {
      clearTimeout(n), t.remove();
    }
  };
}
function Se(e) {
  let t = e.querySelector(".adult-tools__panel");
  if (t) return t;
  const n = e.querySelector(".game-header");
  if (!n) return null;
  const r = document.createElement("details");
  return r.className = "adult-tools", r.innerHTML = '<summary aria-label="להורים ולמורים">☰<span>למבוגרים</span></summary><div class="adult-tools__panel"><p>להורים ולמורים</p></div>', r.addEventListener("keydown", (a) => {
    a.key === "Escape" && (r.open = !1, r.querySelector("summary").focus(), a.stopPropagation());
  }), n.appendChild(r), r.querySelector(".adult-tools__panel");
}
function $e(e, t, n, r) {
  const a = Se(e);
  if (!a) return null;
  const s = document.createElement("button");
  return s.className = "btn", s.setAttribute("aria-label", n), s.textContent = `${t} ${n}`, s.onclick = (o) => {
    const u = s.closest("details");
    u && (u.open = !1), r(o);
  }, a.appendChild(s), s;
}
let y = null, p = null, G = 0, Y = 0, v = null, M = 0, k = 0;
const S = /* @__PURE__ */ new Map();
function U(e, t) {
  var r;
  const n = (r = document.elementFromPoint(e, t)) == null ? void 0 : r.closest('[data-drop-target="true"]');
  return n && S.has(n) && !n.matches(":disabled") && n.getAttribute("aria-disabled") !== "true" ? n : null;
}
function Le(e, t, n) {
  const r = e.getBoundingClientRect();
  G = r.width / 2, Y = r.height / 2, p = e.cloneNode(!0), p.setAttribute("aria-hidden", "true"), p.setAttribute("tabindex", "-1"), Object.assign(p.style, {
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
  }), W(t, n), document.body.appendChild(p);
}
function W(e, t) {
  p && (p.style.transform = `translate3d(${e - G}px, ${t - Y}px, 0) scale(1.12)`);
}
function Re(e, t) {
  M = e, k = t, v === null && (v = requestAnimationFrame(() => {
    v = null, W(M, k), Ae(U(M, k));
  }));
}
function Ce() {
  v !== null && (cancelAnimationFrame(v), v = null), p == null || p.remove(), p = null;
}
let g = null;
function Ae(e) {
  g !== e && (g == null || g.classList.remove("drop-target--hover"), g = e, e == null || e.classList.add("drop-target--hover"));
}
function xe() {
  g == null || g.classList.remove("drop-target--hover"), g = null;
}
function De(e, t, { onTap: n } = {}) {
  e.classList.add("drag-source");
  let r = null, a = null, s = null, o = null;
  function u() {
    var c;
    r && (e.removeEventListener("pointermove", r), e.removeEventListener("pointerup", a), e.removeEventListener("pointercancel", s), e.removeEventListener("lostpointercapture", s), r = a = s = null), xe(), Ce(), e.classList.remove("drag-source--dragging"), y = null;
    const l = o;
    o = null, l !== null && ((c = e.hasPointerCapture) != null && c.call(e, l)) && e.releasePointerCapture(l);
  }
  function i(l) {
    if (e.matches(":disabled") || e.getAttribute("aria-disabled") === "true" || l.button !== void 0 && l.button !== 0 || o !== null) return;
    l.preventDefault(), y && y.cancel(), y = { el: e, data: t, cancel: u }, o = l.pointerId;
    let c = !1;
    const f = () => {
      c = !0, e.classList.add("drag-source--dragging"), Le(e, l.clientX, l.clientY);
    }, b = (d) => Math.hypot(d.clientX - l.clientX, d.clientY - l.clientY) >= 8;
    n || f(), e.setPointerCapture(l.pointerId), r = (d) => {
      d.pointerId === o && (!c && b(d) && f(), c && Re(d.clientX, d.clientY));
    }, a = (d) => {
      if (d.pointerId !== o) return;
      const m = !c && !b(d), _ = m && n ? null : U(d.clientX, d.clientY);
      if (u(), m && n) {
        n();
        return;
      }
      _ && S.has(_) && S.get(_).onDrop({ data: t, sourceEl: e, targetEl: _ });
    }, s = (d) => {
      d.pointerId === o && u();
    }, e.addEventListener("pointermove", r), e.addEventListener("pointerup", a), e.addEventListener("pointercancel", s), e.addEventListener("lostpointercapture", s);
  }
  return e.addEventListener("pointerdown", i), {
    destroy() {
      e.removeEventListener("pointerdown", i), (y == null ? void 0 : y.el) === e && u(), e.classList.remove("drag-source");
    }
  };
}
function Pe(e, t) {
  return e.setAttribute("data-drop-target", "true"), e.classList.add("drop-target--active"), S.set(e, { onDrop: t }), {
    destroy() {
      e.removeAttribute("data-drop-target"), e.classList.remove("drop-target--active", "drop-target--hover"), S.delete(e);
    }
  };
}
function qe(e) {
  const t = [...e];
  for (let n = t.length - 1; n > 0; n--) {
    const r = Math.floor(Math.random() * (n + 1));
    [t[n], t[r]] = [t[r], t[n]];
  }
  return t;
}
export {
  R as a,
  _e as b,
  ke as c,
  De as d,
  se as e,
  Pe as f,
  N as g,
  Ne as h,
  Ie as i,
  he as j,
  ne as k,
  $e as l,
  ee as m,
  He as n,
  we as o,
  Me as p,
  qe as q,
  Ee as r,
  fe as s,
  C as t,
  Te as u
};
