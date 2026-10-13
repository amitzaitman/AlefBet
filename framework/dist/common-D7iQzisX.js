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
class Q {
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
const ee = "alefbet-zoom-lock", D = /* @__PURE__ */ new WeakSet();
function I(e) {
  e.cancelable && e.preventDefault();
}
function te(e) {
  const t = (
    /** @type {TouchEvent} */
    e.touches
  );
  t && t.length > 1 && I(e);
}
function ne(e = typeof document < "u" ? document : null) {
  if (!e || D.has(e)) return !1;
  D.add(e), e.documentElement.classList.add(ee);
  const t = { passive: !1 };
  return e.addEventListener("gesturestart", I, t), e.addEventListener("gesturechange", I, t), e.addEventListener("touchmove", te, t), !0;
}
const R = /* @__PURE__ */ new WeakMap();
function F(e) {
  var t;
  (t = R.get(e)) == null || t.end();
}
class re {
  /**
   * @param {HTMLElement} containerEl - אלמנט המיכל
   * @param {object} config - הגדרות: { totalRounds, title, homeUrl }
   */
  constructor(t, n = {}) {
    F(t), R.set(t, this), this.ended = !1, this._timers = /* @__PURE__ */ new Set(), this.container = t, this.config = {
      totalRounds: 8,
      title: "מִשְׂחָק",
      homeUrl: "../../index.html",
      ...n
    }, this.events = new V(), this.state = new Q(this.config.totalRounds), this.gameId = typeof n.gameId == "string" ? n.gameId : "", this._buildShell();
  }
  _buildShell() {
    this.container.classList.add("alefbet-game"), ne(this.container.ownerDocument);
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
      this._timers.clear(), R.get(this.container) === this && R.delete(this.container), this.events.emit("end", { score: t, state: this.state });
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
function se() {
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
let x = null;
function ae() {
  return typeof window > "u" ? null : window.AudioContext || /** @type {any} */
  window.webkitAudioContext || null;
}
function N() {
  const e = ae();
  if (!e) return null;
  if (!x)
    try {
      x = new e();
    } catch {
      return null;
    }
  return x;
}
async function ke() {
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
async function oe() {
  const e = N();
  if (!e) return null;
  if (e.state === "suspended")
    try {
      await e.resume();
    } catch {
    }
  return e.state === "running" ? e : null;
}
function ie(e) {
  return typeof e.arrayBuffer == "function" ? e.arrayBuffer() : new Promise((t, n) => {
    const r = new FileReader();
    r.onload = () => t(
      /** @type {ArrayBuffer} */
      r.result
    ), r.onerror = () => n(r.error), r.readAsArrayBuffer(e);
  });
}
async function Ie(e, { signal: t } = {}) {
  if (t != null && t.aborted || !e) return !1;
  const n = await oe();
  if (t != null && t.aborted || !n || typeof n.decodeAudioData != "function") return !1;
  let r;
  try {
    const a = await ie(e);
    r = await new Promise((s, o) => {
      const i = n.decodeAudioData(a, s, o);
      i && typeof i.then == "function" && i.then(s, o);
    });
  } catch {
    return !1;
  }
  return t != null && t.aborted ? !1 : new Promise((a) => {
    let s, o, i = !1;
    const c = (d) => {
      if (!i) {
        if (i = !0, clearTimeout(o), t == null || t.removeEventListener("abort", u), s) {
          s.onended = null;
          try {
            s.stop(), s.disconnect();
          } catch {
          }
        }
        a(d);
      }
    }, u = () => c(!1);
    try {
      s = n.createBufferSource(), s.buffer = r, s.connect(n.destination), s.onended = () => c(!0), t == null || t.addEventListener("abort", u, { once: !0 }), o = setTimeout(() => c(!0), (r.duration + 0.5) * 1e3), s.start(0);
    } catch {
      c(!1);
    }
  });
}
function ce() {
  const e = N();
  return e ? (e.state === "suspended" && e.resume(), e) : null;
}
function w(e, t, n = "sine", r = 0.3) {
  const a = ce();
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
}, ue = {
  shake: 420,
  bounce: 480,
  pulse: 600,
  fadeIn: 320,
  confetti: 700
};
function L(e, t) {
  !e || !P[t] || e.animate(P[t], {
    duration: ue[t] || 400,
    easing: "ease-in-out",
    fill: "none"
  });
}
function de(e, t) {
  const n = [];
  function r() {
    try {
      const i = localStorage.getItem(e);
      return i === null ? t : JSON.parse(i);
    } catch {
      return t;
    }
  }
  function a(i) {
    try {
      localStorage.setItem(e, JSON.stringify(i));
    } catch (c) {
      return console.warn(`[createLocalState] שגיאה בשמירת "${e}":`, c), !1;
    }
    return n.forEach((c) => c(i)), !0;
  }
  function s(i) {
    return a(i(r()));
  }
  function o(i) {
    return n.push(i), function() {
      const u = n.indexOf(i);
      u !== -1 && n.splice(u, 1);
    };
  }
  return { get: r, set: a, update: s, subscribe: o };
}
const le = "alefbet.progress.v1", fe = de(le, {});
function j(e, t) {
  if (!Number.isFinite(e) || !Number.isFinite(t) || t <= 0) return 1;
  const n = e / t;
  return n >= 0.8 ? 3 : n >= 0.5 ? 2 : 1;
}
function he(e, { score: t, total: n }) {
  if (!e || !Number.isFinite(t) || !Number.isFinite(n) || n <= 0) return null;
  const r = j(t, n);
  let a = null;
  return fe.update((s) => {
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
function me(e, t, n, r, a = {}) {
  C.cheer(), a.gameId && he(a.gameId, { score: t, total: n });
  const s = a.completionOnly ? n === 1 ? "הִשְׁלַמְתֶּם מְשִׂימָה!" : `הִשְׁלַמְתֶּם ${n} מְשִׂימוֹת!` : `נִיקּוּד: ${t} מִתּוֹךְ ${n}`, o = j(t, n), i = "⭐".repeat(o) + "☆".repeat(3 - o), c = document.createElement("div");
  c.className = "completion-screen", c.innerHTML = `
    <div class="completion-screen__content">
      <div class="completion-screen__stars" aria-label="${o} כּוֹכָבִים">${i}</div>
      <h2 class="completion-screen__title">כָּל הַכָּבוֹד!</h2>
      <p class="completion-screen__score">${s}</p>
      <div class="completion-screen__actions">
        <button class="completion-screen__replay btn btn--primary">שַׂחֵק שׁוּב</button>
      </div>
    </div>
  `;
  const u = a.homeUrl === void 0 ? "../../index.html" : a.homeUrl;
  if (u) {
    const d = document.createElement("a");
    d.className = "completion-screen__home btn", d.href = u, d.textContent = "בְּחִירַת מִשְׂחָק", c.querySelector(".completion-screen__actions").appendChild(d);
  }
  c.querySelector(".completion-screen__replay").addEventListener("click", () => {
    c.remove(), r();
  }), e.innerHTML = "", e.appendChild(c), L(c.querySelector(".completion-screen__content"), "fadeIn");
}
function pe(e, t, {
  totalRounds: n,
  progressBar: r = null,
  buildRoundUI: a,
  onCorrect: s,
  onWrong: o,
  transitionMs: i = 800,
  playCorrectSound: c = !0,
  completionOnly: u = !1,
  onReplay: d = () => location.reload()
}) {
  let f = !1;
  const g = /* @__PURE__ */ new Set();
  function l(m) {
    f = m || e.ended, g.forEach(($) => $(f));
  }
  function h(m) {
    return g.add(m), m(f || e.ended), () => {
      g.delete(m);
    };
  }
  e.on("end", () => {
    l(!0), g.clear();
  });
  async function y(m) {
    if (f || e.ended) return;
    l(!0), c && C.correct();
    try {
      if (m && await m(), e.ended) return;
      s && await s();
    } catch (K) {
      throw l(!1), K;
    }
    if (e.ended || (e.state.addScore(1), r == null || r.update(e.state.currentRound), !await e.delay(i))) return;
    e.nextRound() ? (l(!1), a()) : me(t, e.state.score, n, d, { gameId: e.gameId, completionOnly: u, homeUrl: e.config.homeUrl });
  }
  async function z(m) {
    if (!(f || e.ended)) {
      l(!0);
      try {
        m && await m(), !e.ended && o && await o();
      } finally {
        l(!1);
      }
    }
  }
  function J() {
    return f;
  }
  function Z() {
    l(!1);
  }
  return { handleCorrect: y, handleWrong: z, isAnswered: J, reset: Z, subscribe: h };
}
function ge(e, t) {
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
let A = !1, H = !1, E = null;
const be = [
  "ResizeObserver loop",
  // אזהרת דפדפן שפירה
  "Script error."
  // שגיאת cross-origin אטומה, לרוב תוסף דפדפן
];
function O(e) {
  const t = String(e || "");
  return be.some((n) => t.includes(n));
}
function q() {
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
function _e() {
  if (typeof window > "u") return { destroy() {
  } };
  if (A) return { destroy() {
  } };
  A = !0;
  const e = (n) => {
    O(n == null ? void 0 : n.message) || (console.error("[alefbet] uncaught error:", (n == null ? void 0 : n.error) ?? (n == null ? void 0 : n.message)), q());
  }, t = (n) => {
    const r = (
      /** @type {any} */
      n == null ? void 0 : n.reason
    );
    O((r == null ? void 0 : r.message) ?? r) || (console.error("[alefbet] unhandled rejection:", r), q());
  };
  return window.addEventListener("error", e), window.addEventListener("unhandledrejection", t), E = () => {
    window.removeEventListener("error", e), window.removeEventListener("unhandledrejection", t), A = !1, H = !1;
  }, { destroy: () => {
    E == null || E(), E = null;
  } };
}
function ye(e, t = "טוֹעֵן...") {
  e.innerHTML = `<div class="ab-loading">${t}</div>`;
}
function we(e) {
  e.innerHTML = "";
}
const T = /* @__PURE__ */ new WeakMap();
async function ve(e, t) {
  F(e);
  const n = {};
  T.set(e, n), _e(), ye(e, t.loadingMessage ?? "טוֹעֵן...");
  const r = t.audio !== !1 ? await import("./game-audio-Dm1AcWhC.js") : null;
  if (T.get(e) !== n)
    return { shell: null, activeRounds: [], aborted: !0 };
  if (t.onBeforeHide && (await t.onBeforeHide() === !1 || T.get(e) !== n))
    return { shell: null, activeRounds: [], aborted: !0 };
  we(e);
  const a = t.defaultRounds ?? [], s = new re(e, {
    totalRounds: t.totalRounds ?? a.length,
    title: t.title,
    gameId: t.gameId
  });
  return r == null || r.attachGameAudio(s), { shell: s, activeRounds: a, aborted: !1 };
}
async function Ee(e, t) {
  const n = await ve(e, t);
  if (n.aborted) return n;
  const { shell: r, activeRounds: a } = n;
  if (!a.length)
    return r.bodyEl.textContent = "אֵין סִבּוּבִים לַמִּשְׂחָק.", r.end(), n;
  const s = ge(r.footerEl, a.length);
  let o;
  const i = () => {
    o == null || o.dispose(), o = void 0;
  }, c = pe(r, e, {
    totalRounds: a.length,
    completionOnly: !0,
    progressBar: s,
    transitionMs: t.transitionMs,
    playCorrectSound: t.playCorrectSound,
    onReplay: t.onReplay ?? (() => {
      Ee(e, t);
    }),
    buildRoundUI: u
  });
  r.on("end", i), r.on("start", () => {
    var d;
    s.update(0), (d = t.onStart) == null || d.call(t, r), c.reset();
  }), r.on("start", u);
  function u() {
    i(), r.bodyEl.innerHTML = "";
    const d = se();
    o = d;
    const f = () => !r.ended && !d.signal.aborted, g = r.state.currentRound - 1;
    try {
      const l = t.buildRound({
        shell: r,
        index: g,
        round: a[g],
        isActive: f,
        scope: d,
        isAnswered: () => !f() || c.isAnswered(),
        subscribeAnswered: (h) => f() ? d.use(c.subscribe(h)) : (h(!0), () => {
        }),
        onCorrect: async (h) => {
          f() && await c.handleCorrect(h);
        },
        onWrong: async (h) => {
          f() && await c.handleWrong(h);
        },
        schedule: d.schedule
      });
      l && d.use(l);
    } catch (l) {
      throw d.dispose(), l;
    }
  }
  return r.start(), n;
}
function Se(e, t, n) {
  e.innerHTML = "";
  const r = document.createElement("div");
  r.className = "option-cards-grid";
  const a = t.map((s) => {
    const o = document.createElement("button");
    o.className = "option-card", o.dataset.id = s.id, o.type = "button";
    const i = document.createElement("span");
    i.className = "option-card__emoji", i.textContent = s.emoji || "";
    const c = document.createElement("span");
    return c.className = "option-card__text", c.textContent = s.text, o.append(i, c), o.addEventListener("click", () => {
      o.disabled || n(s);
    }), r.appendChild(o), { el: o, option: s };
  });
  return e.appendChild(r), {
    /** הַדָּגֵשׁ כַּרְטִיס לְפִי סוּג: 'correct' | 'wrong' | 'hint' */
    highlight(s, o) {
      a.forEach(({ el: i, option: c }) => {
        c.id === s && i.classList.add(`option-card--${o}`);
      });
    },
    /** Visual hints never change the answer lock or other highlights. */
    clearHighlight(s, o) {
      a.forEach(({ el: i, option: c }) => {
        c.id === s && i.classList.remove(`option-card--${o}`);
      });
    },
    setDisabled(s) {
      a.forEach(({ el: o }) => {
        o.disabled = s;
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
      e.innerHTML = "";
    }
  };
}
function He(e, t, n) {
  const r = e.scope.use(Se(t, n.options, (a) => {
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
function Ne({ hintAfter: e = 2, escalateAfter: t = 4, onHint: n, onEscalate: r } = {}) {
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
function Re() {
  return X[Math.floor(Math.random() * X.length)];
}
function $e() {
  return B[Math.floor(Math.random() * B.length)];
}
function De(e) {
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
      C.correct(), r(a ?? `!${Re()}`, "correct"), L(t, "bounce");
    },
    /** הצג עידוד — נסה שוב */
    wrong(a = "נַסֵּה שׁוּב") {
      C.wrong(), r(a, "wrong"), L(t, "pulse");
    },
    /** הצג רמז */
    hint(a) {
      r(a, "hint"), L(t, "pulse");
    },
    /** הסר את הרכיב */
    destroy() {
      clearTimeout(n), t.remove();
    }
  };
}
function Le(e) {
  let t = e.querySelector(".adult-tools__panel");
  if (t) return t;
  const n = e.querySelector(".game-header");
  if (!n) return null;
  const r = document.createElement("details");
  return r.className = "adult-tools", r.innerHTML = '<summary aria-label="להורים ולמורים">☰<span>למבוגרים</span></summary><div class="adult-tools__panel"><p>להורים ולמורים</p></div>', r.addEventListener("keydown", (a) => {
    a.key === "Escape" && (r.open = !1, r.querySelector("summary").focus(), a.stopPropagation());
  }), n.appendChild(r), r.querySelector(".adult-tools__panel");
}
function Pe(e, t, n, r) {
  const a = Le(e);
  if (!a) return null;
  const s = document.createElement("button");
  return s.className = "btn", s.setAttribute("aria-label", n), s.textContent = `${t} ${n}`, s.onclick = (o) => {
    const i = s.closest("details");
    i && (i.open = !1), r(o);
  }, a.appendChild(s), s;
}
let _ = null, p = null, G = 0, Y = 0, v = null, M = 0, k = 0;
const S = /* @__PURE__ */ new Map();
function U(e, t) {
  var r;
  const n = (r = document.elementFromPoint(e, t)) == null ? void 0 : r.closest('[data-drop-target="true"]');
  return n && S.has(n) && !n.matches(":disabled") && n.getAttribute("aria-disabled") !== "true" ? n : null;
}
function Ce(e, t, n) {
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
function xe(e, t) {
  M = e, k = t, v === null && (v = requestAnimationFrame(() => {
    v = null, W(M, k), Te(U(M, k));
  }));
}
function Ae() {
  v !== null && (cancelAnimationFrame(v), v = null), p == null || p.remove(), p = null;
}
let b = null;
function Te(e) {
  b !== e && (b == null || b.classList.remove("drop-target--hover"), b = e, e == null || e.classList.add("drop-target--hover"));
}
function Me() {
  b == null || b.classList.remove("drop-target--hover"), b = null;
}
function Oe(e, t, { onTap: n } = {}) {
  e.classList.add("drag-source");
  let r = null, a = null, s = null, o = null;
  function i() {
    var d;
    r && (e.removeEventListener("pointermove", r), e.removeEventListener("pointerup", a), e.removeEventListener("pointercancel", s), e.removeEventListener("lostpointercapture", s), r = a = s = null), Me(), Ae(), e.classList.remove("drag-source--dragging"), _ = null;
    const u = o;
    o = null, u !== null && ((d = e.hasPointerCapture) != null && d.call(e, u)) && e.releasePointerCapture(u);
  }
  function c(u) {
    if (e.matches(":disabled") || e.getAttribute("aria-disabled") === "true" || u.button !== void 0 && u.button !== 0 || o !== null) return;
    u.preventDefault(), _ && _.cancel(), _ = { el: e, data: t, cancel: i }, o = u.pointerId;
    let d = !1;
    const f = () => {
      d = !0, e.classList.add("drag-source--dragging"), Ce(e, u.clientX, u.clientY);
    }, g = (l) => Math.hypot(l.clientX - u.clientX, l.clientY - u.clientY) >= 8;
    n || f(), e.setPointerCapture(u.pointerId), r = (l) => {
      l.pointerId === o && (!d && g(l) && f(), d && xe(l.clientX, l.clientY));
    }, a = (l) => {
      if (l.pointerId !== o) return;
      const h = !d && !g(l), y = h && n ? null : U(l.clientX, l.clientY);
      if (i(), h && n) {
        n();
        return;
      }
      y && S.has(y) && S.get(y).onDrop({ data: t, sourceEl: e, targetEl: y });
    }, s = (l) => {
      l.pointerId === o && i();
    }, e.addEventListener("pointermove", r), e.addEventListener("pointerup", a), e.addEventListener("pointercancel", s), e.addEventListener("lostpointercapture", s);
  }
  return e.addEventListener("pointerdown", c), {
    destroy() {
      e.removeEventListener("pointerdown", c), (_ == null ? void 0 : _.el) === e && i(), e.classList.remove("drag-source");
    }
  };
}
function qe(e, t) {
  return e.setAttribute("data-drop-target", "true"), e.classList.add("drop-target--active"), S.set(e, { onDrop: t }), {
    destroy() {
      e.removeAttribute("data-drop-target"), e.classList.remove("drop-target--active", "drop-target--hover"), S.delete(e);
    }
  };
}
function Xe(e) {
  const t = [...e];
  for (let n = t.length - 1; n > 0; n--) {
    const r = Math.floor(Math.random() * (n + 1));
    [t[n], t[r]] = [t[r], t[n]];
  }
  return t;
}
export {
  L as a,
  ve as b,
  He as c,
  Oe as d,
  oe as e,
  qe as f,
  N as g,
  De as h,
  Ne as i,
  ge as j,
  se as k,
  Pe as l,
  ne as m,
  $e as n,
  Ee as o,
  Ie as p,
  Xe as q,
  Re as r,
  me as s,
  C as t,
  ke as u
};
