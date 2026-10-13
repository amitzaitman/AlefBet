class De {
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
class ze {
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
const Ue = "alefbet-zoom-lock", ye = /* @__PURE__ */ new WeakSet();
function ae(e) {
  e.cancelable && e.preventDefault();
}
function Ge(e) {
  const t = (
    /** @type {TouchEvent} */
    e.touches
  );
  t && t.length > 1 && ae(e);
}
function Qe(e = typeof document < "u" ? document : null) {
  if (!e || ye.has(e)) return !1;
  ye.add(e), e.documentElement.classList.add(Ue);
  const t = { passive: !1 };
  return e.addEventListener("gesturestart", ae, t), e.addEventListener("gesturechange", ae, t), e.addEventListener("touchmove", Ge, t), !0;
}
const q = /* @__PURE__ */ new WeakMap();
function Ne(e) {
  var t;
  (t = q.get(e)) == null || t.end();
}
class Xe {
  /**
   * @param {HTMLElement} containerEl - אלמנט המיכל
   * @param {object} config - הגדרות: { totalRounds, title, homeUrl }
   */
  constructor(t, n = {}) {
    Ne(t), q.set(t, this), this.ended = !1, this._timers = /* @__PURE__ */ new Set(), this.container = t, this.config = {
      totalRounds: 8,
      title: "מִשְׂחָק",
      homeUrl: "../../index.html",
      ...n
    }, this.events = new De(), this.state = new ze(this.config.totalRounds), this.gameId = typeof n.gameId == "string" ? n.gameId : "", this._buildShell();
  }
  _buildShell() {
    this.container.classList.add("alefbet-game"), Qe(this.container.ownerDocument);
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
      this._timers.clear(), q.get(this.container) === this && q.delete(this.container), this.events.emit("end", { score: t, state: this.state });
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
function Ye() {
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
    listen(r, o, i, a) {
      e.signal.aborted || (r.addEventListener(o, i, a), n(() => r.removeEventListener(o, i, a)));
    },
    schedule(r, o) {
      if (e.signal.aborted) return () => {
      };
      const i = () => {
        clearTimeout(a), t.delete(i);
      }, a = setTimeout(() => {
        t.delete(i), e.signal.aborted || r();
      }, o);
      return n(i), i;
    },
    dispose() {
      if (e.signal.aborted) return;
      e.abort();
      const r = [...t].reverse();
      t.clear();
      for (const o of r)
        try {
          o();
        } catch (i) {
          console.warn("Round cleanup failed", i);
        }
    }
  };
}
let Z = null;
function Ke() {
  return typeof window > "u" ? null : window.AudioContext || /** @type {any} */
  window.webkitAudioContext || null;
}
function Y() {
  const e = Ke();
  if (!e) return null;
  if (!Z)
    try {
      Z = new e();
    } catch {
      return null;
    }
  return Z;
}
async function Ze() {
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
async function de() {
  const e = Y();
  if (!e) return null;
  if (e.state === "suspended")
    try {
      await e.resume();
    } catch {
    }
  return e.state === "running" ? e : null;
}
function Je(e) {
  return typeof e.arrayBuffer == "function" ? e.arrayBuffer() : new Promise((t, n) => {
    const r = new FileReader();
    r.onload = () => t(
      /** @type {ArrayBuffer} */
      r.result
    ), r.onerror = () => n(r.error), r.readAsArrayBuffer(e);
  });
}
async function et(e, { signal: t } = {}) {
  if (t != null && t.aborted || !e) return !1;
  const n = await de();
  if (t != null && t.aborted || !n || typeof n.decodeAudioData != "function") return !1;
  let r;
  try {
    const o = await Je(e);
    r = await new Promise((i, a) => {
      const s = n.decodeAudioData(o, i, a);
      s && typeof s.then == "function" && s.then(i, a);
    });
  } catch {
    return !1;
  }
  return t != null && t.aborted ? !1 : new Promise((o) => {
    let i, a, s = !1;
    const c = (u) => {
      if (!s) {
        if (s = !0, clearTimeout(a), t == null || t.removeEventListener("abort", l), i) {
          i.onended = null;
          try {
            i.stop(), i.disconnect();
          } catch {
          }
        }
        o(u);
      }
    }, l = () => c(!1);
    try {
      i = n.createBufferSource(), i.buffer = r, i.connect(n.destination), i.onended = () => c(!0), t == null || t.addEventListener("abort", l, { once: !0 }), a = setTimeout(() => c(!0), (r.duration + 0.5) * 1e3), i.start(0);
    } catch {
      c(!1);
    }
  });
}
function tt() {
  const e = Y();
  return e ? (e.state === "suspended" && e.resume(), e) : null;
}
function A(e, t, n = "sine", r = 0.3) {
  const o = tt();
  if (o)
    try {
      const i = o.createOscillator(), a = o.createGain();
      i.connect(a), a.connect(o.destination), i.type = n, i.frequency.setValueAtTime(e, o.currentTime), a.gain.setValueAtTime(r, o.currentTime), a.gain.exponentialRampToValueAtTime(1e-3, o.currentTime + t), i.start(o.currentTime), i.stop(o.currentTime + t + 0.05);
    } catch {
    }
}
const G = {
  /** צליל תשובה נכונה */
  correct() {
    A(523.25, 0.15), setTimeout(() => A(659.25, 0.2), 120), setTimeout(() => A(783.99, 0.3), 240);
  },
  /** צליל עידוד עדין — נסה שוב */
  wrong() {
    A(350, 0.15, "triangle", 0.12);
  },
  /** צליל עידוד - סיום מוצלח */
  cheer() {
    [523.25, 587.33, 659.25, 698.46, 783.99, 1046.5].forEach((t, n) => setTimeout(() => A(t, 0.2), n * 90));
  },
  /** קליק עדין */
  click() {
    A(900, 0.04, "sine", 0.12);
  }
}, be = {
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
}, nt = {
  shake: 420,
  bounce: 480,
  pulse: 600,
  fadeIn: 320,
  confetti: 700
};
function D(e, t) {
  !e || !be[t] || e.animate(be[t], {
    duration: nt[t] || 400,
    easing: "ease-in-out",
    fill: "none"
  });
}
function rt(e, t) {
  function n() {
    try {
      const i = localStorage.getItem(e);
      return i === null ? t : JSON.parse(i);
    } catch {
      return t;
    }
  }
  function r(i) {
    try {
      localStorage.setItem(e, JSON.stringify(i));
    } catch (a) {
      return console.warn(`[createLocalState] שגיאה בשמירת "${e}":`, a), !1;
    }
    return !0;
  }
  function o(i) {
    return r(i(n()));
  }
  return { get: n, set: r, update: o };
}
const ot = "alefbet.progress.v1", it = rt(ot, {});
function xe(e, t) {
  if (!Number.isFinite(e) || !Number.isFinite(t) || t <= 0) return 1;
  const n = e / t;
  return n >= 0.8 ? 3 : n >= 0.5 ? 2 : 1;
}
function at(e, { score: t, total: n }) {
  if (!e || !Number.isFinite(t) || !Number.isFinite(n) || n <= 0) return null;
  const r = xe(t, n);
  let o = null;
  return it.update((i) => {
    const a = i[e];
    return o = {
      plays: ((a == null ? void 0 : a.plays) ?? 0) + 1,
      bestScore: Math.max((a == null ? void 0 : a.bestScore) ?? 0, t),
      bestStars: Math.max((a == null ? void 0 : a.bestStars) ?? 0, r),
      total: a && (a.bestScore ?? 0) > t ? a.total : n,
      lastPlayed: Date.now()
    }, { ...i, [e]: o };
  }), o;
}
function st(e, t, n, r, o = {}) {
  G.cheer(), o.gameId && at(o.gameId, { score: t, total: n });
  const i = o.completionOnly ? n === 1 ? "הִשְׁלַמְתֶּם מְשִׂימָה!" : `הִשְׁלַמְתֶּם ${n} מְשִׂימוֹת!` : `נִיקּוּד: ${t} מִתּוֹךְ ${n}`, a = xe(t, n), s = "⭐".repeat(a) + "☆".repeat(3 - a), c = document.createElement("div");
  c.className = "completion-screen", c.innerHTML = `
    <div class="completion-screen__content">
      <div class="completion-screen__stars" aria-label="${a} כּוֹכָבִים">${s}</div>
      <h2 class="completion-screen__title">כָּל הַכָּבוֹד!</h2>
      <p class="completion-screen__score">${i}</p>
      <div class="completion-screen__actions">
        <button class="completion-screen__replay btn btn--primary">שַׂחֵק שׁוּב</button>
      </div>
    </div>
  `;
  const l = o.homeUrl === void 0 ? "../../index.html" : o.homeUrl;
  if (l) {
    const u = document.createElement("a");
    u.className = "completion-screen__home btn", u.href = l, u.textContent = "בְּחִירַת מִשְׂחָק", c.querySelector(".completion-screen__actions").appendChild(u);
  }
  c.querySelector(".completion-screen__replay").addEventListener("click", () => {
    c.remove(), r();
  }), e.innerHTML = "", e.appendChild(c), D(c.querySelector(".completion-screen__content"), "fadeIn");
}
function ct(e, t, {
  totalRounds: n,
  progressBar: r = null,
  buildRoundUI: o,
  transitionMs: i = 800,
  playCorrectSound: a = !0,
  completionOnly: s = !1,
  onReplay: c = () => location.reload()
}) {
  let l = !1;
  const u = /* @__PURE__ */ new Set();
  function d(p) {
    l = p || e.ended, u.forEach((pe) => pe(l));
  }
  function h(p) {
    return u.add(p), p(l || e.ended), () => {
      u.delete(p);
    };
  }
  e.on("end", () => {
    d(!0), u.clear();
  });
  async function f(p) {
    if (l || e.ended) return;
    d(!0), a && G.correct();
    try {
      p && await p();
    } catch (qe) {
      throw d(!1), qe;
    }
    if (e.ended || (e.state.addScore(1), r == null || r.update(e.state.currentRound), !await e.delay(i))) return;
    e.nextRound() ? (d(!1), o()) : st(t, e.state.score, n, c, { gameId: e.gameId, completionOnly: s, homeUrl: e.config.homeUrl });
  }
  async function m(p) {
    if (!(l || e.ended)) {
      d(!0);
      try {
        p && await p();
      } finally {
        d(!1);
      }
    }
  }
  function g() {
    return l;
  }
  function O() {
    d(!1);
  }
  return { handleCorrect: f, handleWrong: m, isAnswered: g, reset: O, subscribe: h };
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
    update(i) {
      const a = Math.round(i / t * 100);
      r.style.width = `${a}%`, o.textContent = `${i} / ${t}`, n.setAttribute("aria-valuenow", String(i));
    },
    /** הסר את הרכיב */
    destroy() {
      n.remove();
    }
  };
}
let J = !1, se = !1, P = null;
const ut = [
  "ResizeObserver loop",
  // אזהרת דפדפן שפירה
  "Script error."
  // שגיאת cross-origin אטומה, לרוב תוסף דפדפן
];
function we(e) {
  const t = String(e || "");
  return ut.some((n) => t.includes(n));
}
function ge() {
  var t;
  if (se || typeof document > "u" || !document.body) return;
  se = !0;
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
function dt() {
  if (typeof window > "u") return { destroy() {
  } };
  if (J) return { destroy() {
  } };
  J = !0;
  const e = (n) => {
    we(n == null ? void 0 : n.message) || (console.error("[alefbet] uncaught error:", (n == null ? void 0 : n.error) ?? (n == null ? void 0 : n.message)), ge());
  }, t = (n) => {
    const r = (
      /** @type {any} */
      n == null ? void 0 : n.reason
    );
    we((r == null ? void 0 : r.message) ?? r) || (console.error("[alefbet] unhandled rejection:", r), ge());
  };
  return window.addEventListener("error", e), window.addEventListener("unhandledrejection", t), P = () => {
    window.removeEventListener("error", e), window.removeEventListener("unhandledrejection", t), J = !1, se = !1;
  }, { destroy: () => {
    P == null || P(), P = null;
  } };
}
function ft(e, t = "טוֹעֵן...") {
  e.innerHTML = `<div class="ab-loading">${t}</div>`;
}
function mt(e) {
  e.innerHTML = "";
}
const ee = /* @__PURE__ */ new WeakMap();
async function ht(e, t) {
  Ne(e);
  const n = {};
  ee.set(e, n), dt(), ft(e, t.loadingMessage ?? "טוֹעֵן...");
  const r = t.audio !== !1 ? await import("./game-audio-BJuG8VE5.js") : null;
  if (ee.get(e) !== n)
    return { shell: null, activeRounds: [], aborted: !0 };
  if (t.onBeforeHide && (await t.onBeforeHide() === !1 || ee.get(e) !== n))
    return { shell: null, activeRounds: [], aborted: !0 };
  mt(e);
  const o = t.defaultRounds ?? [], i = new Xe(e, {
    totalRounds: t.totalRounds ?? o.length,
    title: t.title,
    gameId: t.gameId
  });
  return r == null || r.attachGameAudio(i), { shell: i, activeRounds: o, aborted: !1 };
}
async function pt(e, t) {
  const n = await ht(e, t);
  if (n.aborted) return n;
  const { shell: r, activeRounds: o } = n;
  if (!o.length)
    return r.bodyEl.textContent = "אֵין סִבּוּבִים לַמִּשְׂחָק.", r.end(), n;
  const i = lt(
    /** @type {HTMLElement} */
    r.footerEl,
    o.length
  );
  let a;
  const s = () => {
    a == null || a.dispose(), a = void 0;
  }, c = ct(r, e, {
    totalRounds: o.length,
    completionOnly: !0,
    progressBar: i,
    transitionMs: t.transitionMs,
    playCorrectSound: t.playCorrectSound,
    onReplay: t.onReplay ?? (() => {
      pt(e, t);
    }),
    buildRoundUI: l
  });
  r.on("end", s), r.on("start", () => {
    var u;
    i.update(0), (u = t.onStart) == null || u.call(t, r), c.reset();
  }), r.on("start", l);
  function l() {
    s(), r.bodyEl.innerHTML = "";
    const u = Ye();
    a = u;
    const d = () => !r.ended && !u.signal.aborted, h = r.state.currentRound - 1;
    try {
      const f = t.buildRound({
        shell: r,
        index: h,
        round: o[h],
        isActive: d,
        scope: u,
        isAnswered: () => !d() || c.isAnswered(),
        subscribeAnswered: (m) => d() ? u.use(c.subscribe(m)) : (m(!0), () => {
        }),
        onCorrect: async (m) => {
          d() && await c.handleCorrect(m);
        },
        onWrong: async (m) => {
          d() && await c.handleWrong(m);
        },
        schedule: u.schedule
      });
      f && u.use(f);
    } catch (f) {
      throw u.dispose(), f;
    }
  }
  return r.start(), n;
}
function yt(e, t, n) {
  e.innerHTML = "";
  const r = document.createElement("div");
  r.className = "option-cards-grid";
  const o = t.map((i) => {
    const a = document.createElement("button");
    a.className = "option-card", a.dataset.id = i.id, a.type = "button";
    const s = document.createElement("span");
    s.className = "option-card__emoji", s.textContent = i.emoji || "";
    const c = document.createElement("span");
    return c.className = "option-card__text", c.textContent = i.text, a.append(s, c), a.addEventListener("click", () => {
      a.disabled || n(i);
    }), r.appendChild(a), { el: a, option: i };
  });
  return e.appendChild(r), {
    /** הַדָּגֵשׁ כַּרְטִיס לְפִי סוּג: 'correct' | 'wrong' | 'hint' */
    highlight(i, a) {
      o.forEach(({ el: s, option: c }) => {
        c.id === i && s.classList.add(`option-card--${a}`);
      });
    },
    /** Visual hints never change the answer lock or other highlights. */
    clearHighlight(i, a) {
      o.forEach(({ el: s, option: c }) => {
        c.id === i && s.classList.remove(`option-card--${a}`);
      });
    },
    setDisabled(i) {
      o.forEach(({ el: a }) => {
        a.disabled = i;
      });
    },
    /** הסר את הרכיב */
    destroy() {
      e.innerHTML = "";
    }
  };
}
function Xt(e, t, n) {
  const r = e.scope.use(yt(t, n.options, (o) => {
    e.isAnswered() || (n.isCorrect(o) ? e.onCorrect(() => {
      var i;
      return r.highlight(o.id, "correct"), (i = n.onCorrect) == null ? void 0 : i.call(n, o);
    }) : e.onWrong(() => {
      var i;
      return (i = n.onWrong) == null ? void 0 : i.call(n, o);
    }));
  }));
  return e.subscribeAnswered((o) => r.setDisabled(o)), { highlight: r.highlight, clearHighlight: r.clearHighlight };
}
function Yt({ hintAfter: e = 2, escalateAfter: t = 4, onHint: n, onEscalate: r } = {}) {
  let o = 0;
  function i(a) {
    return a >= t ? 2 : a >= e ? 1 : 0;
  }
  return {
    /** דיווח על ניסיון שגוי. מפעיל את הקולבק המתאים ומחזיר את הרמה. */
    miss() {
      o++;
      const a = i(o);
      return a === 2 && r ? r(o) : a === 1 && n && n(o), a;
    },
    /** איפוס לקראת סיבוב חדש. */
    reset() {
      o = 0;
    },
    /** רמת העזרה הנוכחית: 0 ללא, 1 רמז עדין, 2 עזרה מוגברת. */
    get level() {
      return i(o);
    },
    /** מספר הניסיונות השגויים בסיבוב הנוכחי. */
    get misses() {
      return o;
    }
  };
}
const ve = [
  "כָּל הַכָּבוֹד",
  "מְצֻיָּן",
  "יֹפִי",
  "נֶהְדָּר",
  "וָאוּ",
  "אֵיזֶה כֵּיף"
], _e = [
  "נַסּוּ שׁוּב, אַתֶּם יְכוֹלִים",
  "כִּמְעַט! הַקְשִׁיבוּ שׁוּב",
  "עוֹד נִסָּיוֹן קָטָן",
  "קְרוֹבִים מְאֹד"
];
function bt() {
  return ve[Math.floor(Math.random() * ve.length)];
}
function Kt() {
  return _e[Math.floor(Math.random() * _e.length)];
}
function Zt(e) {
  const t = document.createElement("div");
  t.className = "feedback-message", t.setAttribute("aria-live", "polite"), t.setAttribute("role", "status"), e.appendChild(t);
  let n = null;
  function r(o, i, a = 1800) {
    clearTimeout(n), t.textContent = o, t.className = `feedback-message feedback-message--${i}`, n = setTimeout(() => {
      t.textContent = "", t.className = "feedback-message";
    }, a);
  }
  return {
    /** הצג משוב חיובי - טקסט מפורש, או ביטוי שבח אקראי אם לא סופק */
    correct(o) {
      G.correct(), r(o ?? `!${bt()}`, "correct"), D(t, "bounce");
    },
    /** הצג עידוד — נסה שוב */
    wrong(o = "נַסֵּה שׁוּב") {
      G.wrong(), r(o, "wrong"), D(t, "pulse");
    },
    /** הצג רמז */
    hint(o) {
      r(o, "hint"), D(t, "pulse");
    },
    /** הסר את הרכיב */
    destroy() {
      clearTimeout(n), t.remove();
    }
  };
}
function wt(e) {
  let t = e.querySelector(".adult-tools__panel");
  if (t) return t;
  const n = e.querySelector(".game-header");
  if (!n) return null;
  const r = document.createElement("details");
  return r.className = "adult-tools", r.innerHTML = '<summary aria-label="להורים ולמורים">☰<span>למבוגרים</span></summary><div class="adult-tools__panel"><p>להורים ולמורים</p></div>', r.addEventListener("keydown", (o) => {
    o.key === "Escape" && (r.open = !1, r.querySelector("summary").focus(), o.stopPropagation());
  }), n.appendChild(r), r.querySelector(".adult-tools__panel");
}
function Jt(e, t, n, r) {
  const o = wt(e);
  if (!o) return null;
  const i = document.createElement("button");
  return i.className = "btn", i.setAttribute("aria-label", n), i.textContent = `${t} ${n}`, i.onclick = (a) => {
    const s = i.closest("details");
    s && (s.open = !1), r(a);
  }, o.appendChild(i), i;
}
let L = null, y = null, Re = 0, Ae = 0, C = null, te = 0, ne = 0;
const V = /* @__PURE__ */ new Map();
function Me(e, t) {
  var r;
  const n = (r = document.elementFromPoint(e, t)) == null ? void 0 : r.closest('[data-drop-target="true"]');
  return n && V.has(n) && !n.matches(":disabled") && n.getAttribute("aria-disabled") !== "true" ? n : null;
}
function gt(e, t, n) {
  const r = e.getBoundingClientRect();
  Re = r.width / 2, Ae = r.height / 2, y = e.cloneNode(!0), y.setAttribute("aria-hidden", "true"), y.setAttribute("tabindex", "-1"), Object.assign(y.style, {
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
  }), Ce(t, n), document.body.appendChild(y);
}
function Ce(e, t) {
  y && (y.style.transform = `translate3d(${e - Re}px, ${t - Ae}px, 0) scale(1.12)`);
}
function vt(e, t) {
  te = e, ne = t, C === null && (C = requestAnimationFrame(() => {
    C = null, Ce(te, ne), kt(Me(te, ne));
  }));
}
function _t() {
  C !== null && (cancelAnimationFrame(C), C = null), y == null || y.remove(), y = null;
}
let k = null;
function kt(e) {
  k !== e && (k == null || k.classList.remove("drop-target--hover"), k = e, e == null || e.classList.add("drop-target--hover"));
}
function St() {
  k == null || k.classList.remove("drop-target--hover"), k = null;
}
function en(e, t, { onTap: n } = {}) {
  e.classList.add("drag-source");
  let r = null, o = null, i = null, a = null;
  function s() {
    var u;
    r && (e.removeEventListener("pointermove", r), e.removeEventListener("pointerup", o), e.removeEventListener("pointercancel", i), e.removeEventListener("lostpointercapture", i), r = o = i = null), St(), _t(), e.classList.remove("drag-source--dragging"), L = null;
    const l = a;
    a = null, l !== null && ((u = e.hasPointerCapture) != null && u.call(e, l)) && e.releasePointerCapture(l);
  }
  function c(l) {
    if (e.matches(":disabled") || e.getAttribute("aria-disabled") === "true" || l.button !== void 0 && l.button !== 0 || a !== null) return;
    l.preventDefault(), L && L.cancel(), L = { el: e, data: t, cancel: s }, a = l.pointerId;
    let u = !1;
    const d = () => {
      u = !0, e.classList.add("drag-source--dragging"), gt(e, l.clientX, l.clientY);
    }, h = (f) => Math.hypot(f.clientX - l.clientX, f.clientY - l.clientY) >= 8;
    n || d(), e.setPointerCapture(l.pointerId), r = (f) => {
      f.pointerId === a && (!u && h(f) && d(), u && vt(f.clientX, f.clientY));
    }, o = (f) => {
      if (f.pointerId !== a) return;
      const m = !u && !h(f), g = m && n ? null : Me(f.clientX, f.clientY);
      if (s(), m && n) {
        n();
        return;
      }
      g && V.has(g) && V.get(g).onDrop({ data: t, sourceEl: e, targetEl: g });
    }, i = (f) => {
      f.pointerId === a && s();
    }, e.addEventListener("pointermove", r), e.addEventListener("pointerup", o), e.addEventListener("pointercancel", i), e.addEventListener("lostpointercapture", i);
  }
  return e.addEventListener("pointerdown", c), {
    destroy() {
      e.removeEventListener("pointerdown", c), (L == null ? void 0 : L.el) === e && s(), e.classList.remove("drag-source");
    }
  };
}
function tn(e, t) {
  return e.setAttribute("data-drop-target", "true"), e.classList.add("drop-target--active"), V.set(e, { onDrop: t }), {
    destroy() {
      e.removeAttribute("data-drop-target"), e.classList.remove("drop-target--active", "drop-target--hover"), V.delete(e);
    }
  };
}
function nn(e) {
  const t = [...e];
  for (let n = t.length - 1; n > 0; n--) {
    const r = Math.floor(Math.random() * (n + 1));
    [t[n], t[r]] = [t[r], t[n]];
  }
  return t;
}
const F = [
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
function Fe(e) {
  return F.find((t) => t.letter === e) || null;
}
function Et(e = "regular") {
  return e === "regular" ? F.filter((t) => !t.isFinal) : e === "final" ? F.filter((t) => t.isFinal) : F;
}
function rn(e, t = "regular") {
  const n = Et(t);
  return [...n].sort(() => Math.random() - 0.5).slice(0, Math.min(e, n.length));
}
const S = [
  { id: "kamatz", name: "קָמָץ", nameNikud: "קָמָץ", symbol: "ָ", sound: "אָה", color: "#C9442C", textColor: "#fff" },
  { id: "patah", name: "פָּתַח", nameNikud: "פָּתַח", symbol: "ַ", sound: "אָה", color: "#C58119", textColor: "#fff" },
  { id: "hiriq", name: "חִירִיק", nameNikud: "חִירִיק", symbol: "ִ", sound: "אִי", color: "#2A7B71", textColor: "#fff" },
  { id: "tzere", name: "צֵרֶה", nameNikud: "צֵרֶה", symbol: "ֵ", sound: "אֶה", color: "#4A6B8C", textColor: "#fff" },
  { id: "segol", name: "סְגוֹל", nameNikud: "סְגוֹל", symbol: "ֶ", sound: "אֶה", color: "#783952", textColor: "#fff" },
  { id: "holam", name: "חוֹלָם", nameNikud: "חוֹלָם", symbol: "ֹ", sound: "אוֹ", color: "#5F7A42", textColor: "#fff" },
  { id: "kubbutz", name: "קֻבּוּץ", nameNikud: "קֻבּוּץ", symbol: "ֻ", sound: "אוּ", color: "#6B4A8A", textColor: "#fff" }
], Lt = F.filter((e) => !e.isFinal).map((e) => e.letter);
function Nt(e, t) {
  return e + t;
}
function on(e) {
  let t = [...S];
  if (typeof window < "u" && window.location && window.location.search) {
    const r = new URLSearchParams(window.location.search), o = r.get("allowedNikud");
    if (o) {
      const a = o.split(",").map((s) => s.trim());
      t = t.filter(
        (s) => a.includes(s.id) || a.includes(s.name) || a.includes(s.nameNikud)
      );
    }
    const i = r.get("excludedNikud");
    if (i) {
      const a = i.split(",").map((s) => s.trim());
      t = t.filter(
        (s) => !a.includes(s.id) && !a.includes(s.name) && !a.includes(s.nameNikud)
      );
    }
  }
  t.length === 0 && (t = [...S]);
  let n = [...t];
  for (; n.length < e; )
    n.push(...t);
  return n.sort(() => Math.random() - 0.5).slice(0, e);
}
const xt = 2e3;
let v = [], W = !1, M = 0.9, z = 0.5;
try {
  z = typeof localStorage < "u" && parseFloat(localStorage.getItem("alefbet.nikudRate")) || 0.5;
} catch {
}
let U = !1, B = null, x = null, _ = null, Te = null, j = !1, b = "idle";
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
function Rt() {
  Q() ? b = "idle" : w("unsupported", "no-speech-synthesis");
}
Rt();
function ce(e, t) {
  Te = String(t || "unknown"), console.warn("[tts] browser TTS failed", { text: e, reason: t }), typeof window < "u" && typeof window.dispatchEvent == "function" && window.dispatchEvent(new CustomEvent("alefbet:tts-error", {
    detail: { provider: "browser", text: e, sentText: e, reason: t }
  }));
}
function At(e) {
  const t = String(e).toLowerCase();
  return t.includes("not-allowed") || t.includes("notallowed") || t.includes("didn't interact") || t.includes("user gesture");
}
function Mt() {
  return typeof window > "u" || typeof document > "u" ? Promise.resolve() : U ? (U = !0, Promise.resolve()) : B || (B = new Promise((e) => {
    const t = () => {
      U = !0, window.removeEventListener("pointerdown", t, !0), window.removeEventListener("keydown", t, !0), window.removeEventListener("touchstart", t, !0), e();
    };
    window.addEventListener("pointerdown", t, { once: !0, capture: !0 }), window.addEventListener("keydown", t, { once: !0, capture: !0 }), window.addEventListener("touchstart", t, { once: !0, capture: !0 });
  }).finally(() => {
    B = null;
  }), B);
}
let N = null, H = null, re = !1, ke = !1;
const Ct = ["carmit", "hila", "female"];
function Ft(e) {
  const t = (e.name || "").toLowerCase();
  return Ct.some((n) => t.includes(n));
}
function oe() {
  if (typeof speechSynthesis > "u") return null;
  const t = speechSynthesis.getVoices().filter(
    (i) => i.lang === "he-IL" || i.lang === "iw-IL" || (i.lang || "").startsWith("he")
  );
  if (t.length === 0) return null;
  const r = typeof navigator < "u" && navigator.onLine === !1 && t.filter((i) => i.localService !== !1) || t, o = r.length > 0 ? r : t;
  return o.find(Ft) || o[0];
}
function Tt() {
  return typeof speechSynthesis > "u" ? Promise.resolve() : (N = oe(), N ? (re = !0, Promise.resolve()) : re ? Promise.resolve() : H || (H = new Promise((e) => {
    let t = !1;
    const n = () => {
      t || (t = !0, re = !0, N = oe(), typeof speechSynthesis < "u" && typeof speechSynthesis.removeEventListener == "function" && speechSynthesis.removeEventListener("voiceschanged", r), clearTimeout(o), e());
    }, r = () => {
      N = oe(), N && n();
    };
    typeof speechSynthesis.addEventListener == "function" && speechSynthesis.addEventListener("voiceschanged", r);
    const o = setTimeout(() => {
      ke || (ke = !0, ce("", "voice-load-timeout")), n();
    }, xt);
  }).finally(() => {
    H = null;
  }), H));
}
function Pt(e) {
  return 5e3 + ((e == null ? void 0 : e.length) ?? 0) * 200;
}
function Se(e) {
  return new Promise((t, n) => {
    if (typeof SpeechSynthesisUtterance > "u") {
      n(new Error("SpeechSynthesisUtterance unavailable"));
      return;
    }
    try {
      const r = new SpeechSynthesisUtterance(e);
      r.lang = "he-IL", r.rate = M, N && (r.voice = N), _ = r;
      let o = !1;
      const i = setTimeout(() => {
        if (!o) {
          o = !0, _ === r && (_ = null);
          try {
            speechSynthesis.cancel();
          } catch {
          }
          n(new Error("utterance-timeout"));
        }
      }, Pt(e));
      r.onend = () => {
        o || (o = !0, clearTimeout(i), _ === r && (_ = null), t());
      }, r.onerror = (a) => {
        o || (o = !0, clearTimeout(i), _ === r && (_ = null), n(new Error(String(a && a.error || "speech-error"))));
      }, speechSynthesis.speak(r);
    } catch (r) {
      n(r instanceof Error ? r : new Error(String(r)));
    }
  });
}
async function Bt(e) {
  if (typeof speechSynthesis > "u")
    return { ok: !1, reason: "speechSynthesis unavailable" };
  await Tt();
  try {
    return await Se(e), j = !1, { ok: !0 };
  } catch (t) {
    const n = (t == null ? void 0 : t.message) || "speech-error";
    if (At(n)) {
      j || (j = !0, w("awaiting-interaction", "autoplay-blocked")), await Mt(), j = !1;
      try {
        return await Se(e), { ok: !0 };
      } catch (r) {
        const o = (r == null ? void 0 : r.message) || "speech-error";
        return ce(e, o), { ok: !1, reason: o };
      }
    }
    return ce(e, n), { ok: !1, reason: n };
  }
}
function T() {
  if (W || v.length === 0) return;
  const e = v.shift();
  W = !0, x = e;
  const t = M, n = typeof e.rate == "number";
  n && (M = e.rate), Bt(e.text).then((r) => {
    n && (M = t), W = !1;
    const o = x === e;
    if (x = null, !o) {
      T();
      return;
    }
    r.ok ? b !== "unsupported" && w("ready") : Q() ? w("failed", r.reason, !0) : w("unsupported", r.reason || "no-provider", !0), e.resolve(), T();
  }).catch((r) => {
    n && (M = t), W = !1, x = null, w("failed", (r == null ? void 0 : r.message) || "unknown"), e.resolve(), T();
  });
}
const R = {
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
    if (x) {
      try {
        x.resolve();
      } catch {
      }
      x = null;
    }
    if (v.forEach((e) => {
      try {
        e.resolve();
      } catch {
      }
    }), v = [], W = !1, _ && (_ = null), typeof speechSynthesis < "u" && typeof speechSynthesis.cancel == "function")
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
    return Te;
  },
  /**
   * משחרר ידנית את מנוע הקול אחרי gesture ידוע (כפתור התחל וכו').
   * משחקים יקראו לזה במקום להמתין ל-autoplay block.
   * @returns {Promise<void>}
   */
  unlock() {
    if (U = !0, j = !1, Ze().catch(() => {
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
    const n = e + t, r = S.find((o) => o.symbol === t);
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
    const t = S.find((n) => n.id === e);
    return !t || !t.sound ? Promise.resolve() : new Promise((n) => {
      v.push({
        text: t.sound,
        rate: z,
        resolve: () => n(void 0)
      }), T();
    });
  }
}, Ht = "alefbet-voices", E = "recordings", It = 1;
let I = null;
function K() {
  return I || (I = new Promise((e, t) => {
    const n = indexedDB.open(Ht, It);
    n.onupgradeneeded = () => {
      n.result.createObjectStore(E);
    }, n.onsuccess = () => e(n.result), n.onerror = () => {
      I = null, t(n.error);
    };
  }), I);
}
function fe(e, t) {
  return `${e}/${t}`;
}
async function an(e, t, n) {
  const r = await K();
  return new Promise((o, i) => {
    const a = r.transaction(E, "readwrite");
    a.objectStore(E).put(n, fe(e, t)), a.oncomplete = o, a.onerror = (s) => i(s.target.error);
  });
}
async function Wt(e, t) {
  const n = await K();
  return new Promise((r, o) => {
    const a = n.transaction(E, "readonly").objectStore(E).get(fe(e, t));
    a.onsuccess = () => r(a.result ?? null), a.onerror = (s) => o(s.target.error);
  });
}
async function sn(e, t) {
  const n = await K();
  return new Promise((r, o) => {
    const i = n.transaction(E, "readwrite");
    i.objectStore(E).delete(fe(e, t)), i.oncomplete = r, i.onerror = (a) => o(a.target.error);
  });
}
async function jt(e) {
  const t = await K();
  return new Promise((n, r) => {
    const i = t.transaction(E, "readonly").objectStore(E).getAllKeys();
    i.onsuccess = () => {
      const a = `${e}/`;
      n(
        (i.result || []).filter((s) => s.startsWith(a)).map((s) => s.slice(a.length))
      );
    }, i.onerror = (a) => r(a.target.error);
  });
}
async function Ee(e, t, { signal: n } = {}) {
  if (n != null && n.aborted) return !1;
  let r;
  try {
    r = await Wt(e, t);
  } catch {
    return !1;
  }
  return !r || n != null && n.aborted ? !1 : await et(r, { signal: n }) ? !0 : n != null && n.aborted ? !1 : new Promise((o) => {
    const i = URL.createObjectURL(r), a = new Audio(i);
    let s = !1;
    const c = (u) => {
      s || (s = !0, n == null || n.removeEventListener("abort", l), a.onended = null, a.onerror = null, a.pause(), URL.revokeObjectURL(i), o(u));
    }, l = () => c(!1);
    n == null || n.addEventListener("abort", l, { once: !0 }), a.onended = () => c(!0), a.onerror = () => c(!1), a.play().catch(() => c(!1));
  });
}
const Vt = {
  a: { F1: 850, F2: 1400 },
  e: { F1: 550, F2: 2100 },
  i: { F1: 350, F2: 2700 },
  o: { F1: 550, F2: 1e3 },
  u: { F1: 350, F2: 850 }
}, Pe = {
  kamatz: "a",
  patah: "a",
  tzere: "e",
  segol: "e",
  hiriq: "i",
  holam: "o",
  kubbutz: "u"
}, Be = 210, He = 550, Ot = {
  a: { F3: 2700, bandwidths: [90, 110, 170], gains: [1, 0.5, 0.15] },
  e: { F3: 2900, bandwidths: [80, 100, 160], gains: [1, 0.55, 0.2] },
  i: { F3: 3300, bandwidths: [60, 100, 160], gains: [1, 0.6, 0.25] },
  o: { F3: 2600, bandwidths: [80, 90, 150], gains: [1, 0.5, 0.1] },
  u: { F3: 2400, bandwidths: [60, 80, 140], gains: [1, 0.45, 0.1] }
};
function X(e) {
  const t = Vt[e], n = Ot[e];
  return !t || !n ? null : {
    formants: [t.F1, t.F2, n.F3],
    bandwidths: [...n.bandwidths],
    gains: [...n.gains]
  };
}
const Le = {
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
function $t(e) {
  return Le[e] ?? Le[""];
}
function cn() {
  return Y() !== null;
}
let $ = null;
function qt(e) {
  if ($ && $.sampleRate === e.sampleRate) return $;
  const t = e.sampleRate, n = e.createBuffer(1, t, e.sampleRate), r = n.getChannelData(0);
  for (let o = 0; o < t; o++) r[o] = Math.random() * 2 - 1;
  return $ = n, n;
}
function Ie(e, t, n, r = e.destination) {
  const o = e.createOscillator();
  o.type = "sawtooth", o.frequency.value = n;
  const i = e.createGain();
  i.gain.value = 0;
  const a = t.formants.map((s, c) => {
    const l = e.createBiquadFilter();
    l.type = "bandpass", l.frequency.value = s, l.Q.value = s / t.bandwidths[c];
    const u = e.createGain();
    return u.gain.value = t.gains[c], o.connect(l), l.connect(u), u.connect(i), l;
  });
  return i.connect(r), { source: o, filters: a, master: i };
}
function ie(e, t, n, r, o = e.destination) {
  const i = n.durationMs / 1e3, a = e.createBufferSource();
  a.buffer = qt(e), a.loop = !0;
  const s = e.createBiquadFilter();
  s.type = "bandpass", s.frequency.value = n.noiseHz ?? 2e3, s.Q.value = n.noiseQ ?? 1;
  const c = e.createGain();
  return c.gain.setValueAtTime(0, t), c.gain.linearRampToValueAtTime(r, t + Math.min(0.01, i / 3)), c.gain.linearRampToValueAtTime(1e-4, t + i), a.connect(s), s.connect(c), c.connect(o), a.start(t), a.stop(t + i + 0.02), t + i;
}
function We(e, t, n, r, o, i, a = e.destination) {
  const s = r / 1e3, { source: c, filters: l, master: u } = Ie(e, n, o, a);
  if (c.frequency.setValueAtTime(o * 1.04, t), c.frequency.linearRampToValueAtTime(o * 0.92, t + s), i) {
    const f = Math.min(0.09, s / 3);
    l.forEach((m, g) => {
      const O = i[g];
      O && (m.frequency.setValueAtTime(O, t), m.frequency.exponentialRampToValueAtTime(n.formants[g], t + f));
    });
  }
  const d = 0.04, h = 0.12;
  return u.gain.setValueAtTime(0, t), u.gain.linearRampToValueAtTime(0.5, t + d), u.gain.setValueAtTime(0.5, t + s - h), u.gain.linearRampToValueAtTime(1e-4, t + s), c.start(t), c.stop(t + s + 0.05), t + s;
}
function Dt(e, t, n, r, o = e.destination) {
  const i = n / 1e3, a = { formants: [250, 1100, 2200], bandwidths: [80, 200, 300], gains: [1, 0.12, 0.05] }, { source: s, master: c } = Ie(e, a, r, o);
  return c.gain.setValueAtTime(0, t), c.gain.linearRampToValueAtTime(0.35, t + 0.02), c.gain.setValueAtTime(0.35, t + i - 0.02), c.gain.linearRampToValueAtTime(1e-4, t + i), s.start(t), s.stop(t + i + 0.05), t + i;
}
function je(e, t, n, r) {
  const o = Math.max(0, (t - e.currentTime) * 1e3) + 60;
  return new Promise((i) => {
    const a = () => {
      clearTimeout(s), r == null || r.removeEventListener("abort", a), n.disconnect(), i(!(r != null && r.aborted));
    }, s = setTimeout(a, o);
    r == null || r.addEventListener("abort", a, { once: !0 }), r != null && r.aborted && a();
  });
}
async function zt(e, t = {}) {
  var a, s;
  const n = X(e);
  if (!n || (a = t.signal) != null && a.aborted) return !1;
  const r = await de();
  if (!r || (s = t.signal) != null && s.aborted) return !1;
  let o, i;
  try {
    i = r.createGain(), i.connect(r.destination);
    const c = r.currentTime + 0.03;
    o = We(r, c, n, t.durationMs ?? He, t.pitchHz ?? Be, null, i);
  } catch {
    return i == null || i.disconnect(), !1;
  }
  return je(r, o, i, t.signal);
}
async function le(e, t, n = {}) {
  var u, d;
  const r = X(t);
  if (!r || (u = n.signal) != null && u.aborted) return !1;
  const o = await de();
  if (!o || (d = n.signal) != null && d.aborted) return !1;
  const i = $t(e), a = n.pitchHz ?? Be, s = n.durationMs ?? He;
  let c, l;
  try {
    l = o.createGain(), l.connect(o.destination), c = Ut(o, i, e, r, s, a, l);
  } catch {
    return l == null || l.disconnect(), !1;
  }
  return je(o, c, l, n.signal);
}
function Ut(e, t, n, r, o, i, a = e.destination) {
  let s = e.currentTime + 0.03, c = null;
  switch (t.type) {
    case "plosive": {
      s = ie(e, s, t, t.voiced ? 0.25 : 0.35, a), s += 0.01;
      break;
    }
    case "fricative": {
      s = ie(e, s, t, 0.22, a) - 0.03;
      break;
    }
    case "affricate": {
      s += 0.03, s = ie(e, s, { ...t, durationMs: t.durationMs - 30 }, 0.3, a) - 0.02;
      break;
    }
    case "nasal": {
      s = Dt(e, s, t.durationMs, i, a), c = [300, 1300, 2300];
      break;
    }
    case "liquid": {
      c = n === "r" ? [450, 1300, 1600] : [380, 1e3, 2600];
      break;
    }
    case "glide": {
      const l = X(n === "y" ? "i" : "u");
      c = l ? l.formants : null;
      break;
    }
  }
  return We(e, s, r, o, i, c, a);
}
const ue = "sound-bank";
function Ve(e) {
  return `letter:${e}`;
}
function Oe(e) {
  return `nikud:${e}`;
}
function $e(e, t) {
  return `syllable:${e}:${t}`;
}
function ln() {
  const e = [];
  for (const t of F)
    e.push({ key: Ve(t.letter), label: t.nameNikud, group: "letters" });
  for (const t of S)
    e.push({ key: Oe(t.id), label: `${t.nameNikud} (${t.sound})`, group: "nikud" });
  for (const t of Lt)
    for (const n of S)
      e.push({
        key: $e(t, n.id),
        label: Nt(t, n.symbol),
        group: "syllables"
      });
  return e;
}
function Gt() {
  return typeof navigator < "u" && navigator.onLine === !1;
}
async function me(e, t = void 0) {
  try {
    return typeof indexedDB > "u" ? !1 : await (t ? Ee(ue, e, t) : Ee(ue, e));
  } catch {
    return !1;
  }
}
async function he(e) {
  if (Gt() && !Qt()) return !1;
  try {
    return await e(), R.audioState !== "failed" && R.audioState !== "unsupported";
  } catch {
    return !1;
  }
}
function Qt() {
  return typeof speechSynthesis < "u";
}
async function un() {
  try {
    return typeof indexedDB > "u" ? [] : await jt(ue);
  } catch {
    return [];
  }
}
async function dn(e) {
  if (await me(Ve(e))) return "bank";
  const t = Fe(e), n = t ? t.nameNikud : e;
  return await he(() => R.speak(n)) ? "tts" : t && await le(t.sound, "a", { durationMs: 400 }) ? "synth" : "none";
}
async function fn(e) {
  if (await me(Oe(e))) return "bank";
  if (await he(() => R.speakVowel(e))) return "tts";
  const t = Pe[e];
  return t && await zt(t) ? "synth" : "none";
}
async function mn(e, t, n = {}) {
  const { signal: r } = n;
  if (r != null && r.aborted) return "none";
  if (await me($e(e, t), r ? n : void 0)) return "bank";
  if (r != null && r.aborted) return "none";
  const o = S.find((c) => c.id === t), i = () => R.cancel();
  r == null || r.addEventListener("abort", i, { once: !0 });
  try {
    if (o && await he(() => R.speakNikud(e, o.symbol)))
      return r != null && r.aborted ? "none" : "tts";
  } finally {
    r == null || r.removeEventListener("abort", i);
  }
  if (r != null && r.aborted) return "none";
  const a = Fe(e), s = Pe[t];
  return s && await (r ? le(a ? a.sound : "", s, n) : le(a ? a.sound : "", s)) ? "synth" : "none";
}
function hn(e, t) {
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
  let i = `
    <div style="background:white; padding:1.5rem; border-radius:1rem; min-width:300px; text-align:center; color:#333; font-family:Heebo,Arial; direction:rtl;">
      <h2 style="margin-top:0">בחר ניקוד</h2>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; margin:1rem 0; text-align:right;">
  `;
  S.forEach((l) => {
    const u = o.length === 0 || o.includes(l.id) || o.includes(l.name);
    i += `
      <label style="display:flex; align-items:center; gap:0.5rem; cursor:pointer;">
        <input type="checkbox" value="${l.id}" class="nikud-filter-cb" ${u ? "checked" : ""} style="width:1.2rem;height:1.2rem;">
        <span>${l.nameNikud}</span>
      </label>
    `;
  });
  const a = parseFloat(localStorage.getItem("alefbet.nikudRate")) || 0.5;
  i += `
      </div>
      <div style="margin:1rem 0; text-align:right;">
        <label style="font-weight:700; font-size:0.95rem;">מהירות הגייה: <span id="nikud-rate-val">${a}</span></label>
        <input type="range" id="nikud-rate-slider" min="0.3" max="1.5" step="0.1" value="${a}" style="width:100%; margin-top:0.3rem; accent-color:#4f67ff;">
        <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:#888;">
          <span>אִטִּי</span>
          <span>מָהִיר</span>
        </div>
      </div>
      <button id="save-settings-btn" style="padding:0.5rem 1rem; border-radius:0.5rem; background:#4f67ff; color:white; border:none; font-size:1.1rem; cursor:pointer;">שמור והתחל מחדש</button>
      <button id="close-settings-btn" style="padding:0.5rem 1rem; border-radius:0.5rem; background:#ddd; color:#333; border:none; font-size:1.1rem; cursor:pointer; margin-right:0.5rem;">ביטול</button>
    </div>
  `, n.innerHTML = i, n.style.display = "flex";
  const s = (
    /** @type {HTMLInputElement} */
    document.getElementById("nikud-rate-slider")
  ), c = document.getElementById("nikud-rate-val");
  s.oninput = () => {
    c.textContent = s.value;
  }, document.getElementById("save-settings-btn").onclick = () => {
    const l = parseFloat(s.value);
    localStorage.setItem("alefbet.nikudRate", String(l)), R.setNikudEmphasis({ rate: l });
    const u = Array.from(n.querySelectorAll(".nikud-filter-cb")).filter((h) => (
      /** @type {HTMLInputElement} */
      h.checked
    )).map((h) => (
      /** @type {HTMLInputElement} */
      h.value
    )), d = new URL(window.location.href);
    u.length > 0 && u.length < S.length ? d.searchParams.set("allowedNikud", u.join(",")) : d.searchParams.delete("allowedNikud"), d.searchParams.delete("excludedNikud"), n.style.display = "none", window.history.replaceState({}, "", d), t && t(e);
  }, document.getElementById("close-settings-btn").onclick = () => {
    n.style.display = "none";
  };
}
export {
  Pe as NIKUD_VOWEL,
  ue as SOUND_BANK_ID,
  Vt as VOWEL_TEMPLATES,
  D as animate,
  ht as bootstrapGame,
  Xt as createChoiceRound,
  en as createDragSource,
  tn as createDropTarget,
  Zt as createFeedback,
  Yt as createHintTracker,
  lt as createProgressBar,
  Ye as createRoundScope,
  sn as deleteVoice,
  Y as getAudioContext,
  Fe as getLetter,
  Et as getLettersByGroup,
  Jt as injectHeaderButton,
  cn as isSynthSupported,
  Nt as letterWithNikud,
  Wt as loadVoice,
  Qe as lockPageZoom,
  Lt as nikudBaseLetters,
  S as nikudList,
  Ee as playVoice,
  rn as randomLetters,
  on as randomNikud,
  bt as randomPraise,
  Kt as randomRetryHint,
  un as recordedKeys,
  pt as runGame,
  an as saveVoice,
  st as showCompletionScreen,
  hn as showNikudSettingsDialog,
  nn as shuffle,
  G as sounds,
  dn as speakLetter,
  fn as speakNikudSound,
  mn as speakSyllable,
  ln as standardSoundKeys,
  R as tts
};
