class gt {
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
class vt {
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
const _t = "alefbet-zoom-lock", Oe = /* @__PURE__ */ new WeakSet();
function Te(e) {
  e.cancelable && e.preventDefault();
}
function kt(e) {
  const t = (
    /** @type {TouchEvent} */
    e.touches
  );
  t && t.length > 1 && Te(e);
}
function St(e = typeof document < "u" ? document : null) {
  if (!e || Oe.has(e)) return !1;
  Oe.add(e), e.documentElement.classList.add(_t);
  const t = { passive: !1 };
  return e.addEventListener("gesturestart", Te, t), e.addEventListener("gesturechange", Te, t), e.addEventListener("touchmove", kt, t), !0;
}
const ae = /* @__PURE__ */ new WeakMap();
function et(e) {
  var t;
  (t = ae.get(e)) == null || t.end();
}
class Et {
  /**
   * @param {HTMLElement} containerEl - אלמנט המיכל
   * @param {object} config - הגדרות: { totalRounds, title, homeUrl }
   */
  constructor(t, n = {}) {
    et(t), ae.set(t, this), this.ended = !1, this._timers = /* @__PURE__ */ new Set(), this.container = t, this.config = {
      totalRounds: 8,
      title: "מִשְׂחָק",
      homeUrl: "../../index.html",
      ...n
    }, this.events = new gt(), this.state = new vt(this.config.totalRounds), this.gameId = typeof n.gameId == "string" ? n.gameId : "", this._buildShell();
  }
  _buildShell() {
    this.container.classList.add("alefbet-game"), St(this.container.ownerDocument);
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
function Lt() {
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
    listen(r, o, i, s) {
      e.signal.aborted || (r.addEventListener(o, i, s), n(() => r.removeEventListener(o, i, s)));
    },
    schedule(r, o) {
      if (e.signal.aborted) return () => {
      };
      const i = () => {
        clearTimeout(s), t.delete(i);
      }, s = setTimeout(() => {
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
let Se = null;
function Nt() {
  return typeof window > "u" ? null : window.AudioContext || /** @type {any} */
  window.webkitAudioContext || null;
}
function pe() {
  const e = Nt();
  if (!e) return null;
  if (!Se)
    try {
      Se = new e();
    } catch {
      return null;
    }
  return Se;
}
async function At() {
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
function Rt(e) {
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
    const o = await Rt(e);
    r = await new Promise((i, s) => {
      const a = n.decodeAudioData(o, i, s);
      a && typeof a.then == "function" && a.then(i, s);
    });
  } catch {
    return !1;
  }
  return t != null && t.aborted ? !1 : new Promise((o) => {
    let i, s, a = !1;
    const c = (l) => {
      if (!a) {
        if (a = !0, clearTimeout(s), t == null || t.removeEventListener("abort", u), i) {
          i.onended = null;
          try {
            i.stop(), i.disconnect();
          } catch {
          }
        }
        o(l);
      }
    }, u = () => c(!1);
    try {
      i = n.createBufferSource(), i.buffer = r, i.connect(n.destination), i.onended = () => c(!0), t == null || t.addEventListener("abort", u, { once: !0 }), s = setTimeout(() => c(!0), (r.duration + 0.5) * 1e3), i.start(0);
    } catch {
      c(!1);
    }
  });
}
function xt() {
  const e = pe();
  return e ? (e.state === "suspended" && e.resume(), e) : null;
}
function O(e, t, n = "sine", r = 0.3) {
  const o = xt();
  if (o)
    try {
      const i = o.createOscillator(), s = o.createGain();
      i.connect(s), s.connect(o.destination), i.type = n, i.frequency.setValueAtTime(e, o.currentTime), s.gain.setValueAtTime(r, o.currentTime), s.gain.exponentialRampToValueAtTime(1e-3, o.currentTime + t), i.start(o.currentTime), i.stop(o.currentTime + t + 0.05);
    } catch {
    }
}
const de = {
  /** צליל תשובה נכונה */
  correct() {
    O(523.25, 0.15), setTimeout(() => O(659.25, 0.2), 120), setTimeout(() => O(783.99, 0.3), 240);
  },
  /** צליל עידוד עדין — נסה שוב */
  wrong() {
    O(350, 0.15, "triangle", 0.12);
  },
  /** צליל עידוד - סיום מוצלח */
  cheer() {
    [523.25, 587.33, 659.25, 698.46, 783.99, 1046.5].forEach((t, n) => setTimeout(() => O(t, 0.2), n * 90));
  },
  /** קליק עדין */
  click() {
    O(900, 0.04, "sine", 0.12);
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
}, Ct = {
  shake: 420,
  bounce: 480,
  pulse: 600,
  fadeIn: 320,
  confetti: 700
};
function ce(e, t) {
  !e || !De[t] || e.animate(De[t], {
    duration: Ct[t] || 400,
    easing: "ease-in-out",
    fill: "none"
  });
}
function Tt(e, t) {
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
    } catch (s) {
      return console.warn(`[createLocalState] שגיאה בשמירת "${e}":`, s), !1;
    }
    return !0;
  }
  function o(i) {
    return r(i(n()));
  }
  return { get: n, set: r, update: o };
}
const Ft = "alefbet.progress.v1", Pt = Tt(Ft, {});
function tt(e, t) {
  if (!Number.isFinite(e) || !Number.isFinite(t) || t <= 0) return 1;
  const n = e / t;
  return n >= 0.8 ? 3 : n >= 0.5 ? 2 : 1;
}
function $t(e, { score: t, total: n }) {
  if (!e || !Number.isFinite(t) || !Number.isFinite(n) || n <= 0) return null;
  const r = tt(t, n);
  let o = null;
  return Pt.update((i) => {
    const s = i[e];
    return o = {
      plays: ((s == null ? void 0 : s.plays) ?? 0) + 1,
      bestScore: Math.max((s == null ? void 0 : s.bestScore) ?? 0, t),
      bestStars: Math.max((s == null ? void 0 : s.bestStars) ?? 0, r),
      total: s && (s.bestScore ?? 0) > t ? s.total : n,
      lastPlayed: Date.now()
    }, { ...i, [e]: o };
  }), o;
}
function Bt(e, t, n, r, o = {}) {
  de.cheer(), o.gameId && $t(o.gameId, { score: t, total: n });
  const i = o.completionOnly ? n === 1 ? "הִשְׁלַמְתֶּם מְשִׂימָה!" : `הִשְׁלַמְתֶּם ${n} מְשִׂימוֹת!` : `נִיקּוּד: ${t} מִתּוֹךְ ${n}`, s = tt(t, n), a = "⭐".repeat(s) + "☆".repeat(3 - s), c = document.createElement("div");
  c.className = "completion-screen", c.innerHTML = `
    <div class="completion-screen__content">
      <div class="completion-screen__stars" aria-label="${s} כּוֹכָבִים">${a}</div>
      <h2 class="completion-screen__title">כָּל הַכָּבוֹד!</h2>
      <p class="completion-screen__score">${i}</p>
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
  }), e.innerHTML = "", e.appendChild(c), ce(c.querySelector(".completion-screen__content"), "fadeIn");
}
function It(e, t, {
  totalRounds: n,
  progressBar: r = null,
  buildRoundUI: o,
  transitionMs: i = 800,
  playCorrectSound: s = !0,
  completionOnly: a = !1,
  onReplay: c = () => location.reload()
}) {
  let u = !1;
  const l = /* @__PURE__ */ new Set();
  function d(w) {
    u = w || e.ended, l.forEach((ne) => ne(u));
  }
  function y(w) {
    return l.add(w), w(u || e.ended), () => {
      l.delete(w);
    };
  }
  e.on("end", () => {
    d(!0), l.clear();
  });
  async function f(w) {
    if (u || e.ended) return;
    d(!0), s && de.correct();
    try {
      w && await w();
    } catch (S) {
      throw d(!1), S;
    }
    if (e.ended || (e.state.addScore(1), r == null || r.update(e.state.currentRound), !await e.delay(i))) return;
    e.nextRound() ? (d(!1), o()) : Bt(t, e.state.score, n, c, { gameId: e.gameId, completionOnly: a, homeUrl: e.config.homeUrl });
  }
  async function b(w) {
    if (!(u || e.ended)) {
      d(!0);
      try {
        w && await w();
      } finally {
        d(!1);
      }
    }
  }
  function v() {
    return u;
  }
  function $() {
    d(!1);
  }
  return { handleCorrect: f, handleWrong: b, isAnswered: v, reset: $, subscribe: y };
}
function Wt(e, t) {
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
      const s = Math.round(i / t * 100);
      r.style.width = `${s}%`, o.textContent = `${i} / ${t}`, n.setAttribute("aria-valuenow", String(i));
    },
    /** הסר את הרכיב */
    destroy() {
      n.remove();
    }
  };
}
let Ee = !1, Fe = !1, Q = null;
const jt = [
  "ResizeObserver loop",
  // אזהרת דפדפן שפירה
  "Script error."
  // שגיאת cross-origin אטומה, לרוב תוסף דפדפן
];
function ze(e) {
  const t = String(e || "");
  return jt.some((n) => t.includes(n));
}
function Ue() {
  var t;
  if (Fe || typeof document > "u" || !document.body) return;
  Fe = !0;
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
function Ht() {
  if (typeof window > "u") return { destroy() {
  } };
  if (Ee) return { destroy() {
  } };
  Ee = !0;
  const e = (n) => {
    ze(n == null ? void 0 : n.message) || (console.error("[alefbet] uncaught error:", (n == null ? void 0 : n.error) ?? (n == null ? void 0 : n.message)), Ue());
  }, t = (n) => {
    const r = (
      /** @type {any} */
      n == null ? void 0 : n.reason
    );
    ze((r == null ? void 0 : r.message) ?? r) || (console.error("[alefbet] unhandled rejection:", r), Ue());
  };
  return window.addEventListener("error", e), window.addEventListener("unhandledrejection", t), Q = () => {
    window.removeEventListener("error", e), window.removeEventListener("unhandledrejection", t), Ee = !1, Fe = !1;
  }, { destroy: () => {
    Q == null || Q(), Q = null;
  } };
}
function qt(e, t = "טוֹעֵן...") {
  e.innerHTML = `<div class="ab-loading">${t}</div>`;
}
function Vt(e) {
  e.innerHTML = "";
}
const Le = /* @__PURE__ */ new WeakMap();
async function Ot(e, t) {
  et(e);
  const n = {};
  Le.set(e, n), Ht(), qt(e, t.loadingMessage ?? "טוֹעֵן...");
  const r = t.audio !== !1 ? await import("./game-audio-BJuG8VE5.js") : null;
  if (Le.get(e) !== n)
    return { shell: null, activeRounds: [], aborted: !0 };
  if (t.onBeforeHide && (await t.onBeforeHide() === !1 || Le.get(e) !== n))
    return { shell: null, activeRounds: [], aborted: !0 };
  Vt(e);
  const o = t.defaultRounds ?? [], i = new Et(e, {
    totalRounds: t.totalRounds ?? o.length,
    title: t.title,
    gameId: t.gameId
  });
  return r == null || r.attachGameAudio(i), { shell: i, activeRounds: o, aborted: !1 };
}
async function Dt(e, t) {
  const n = await Ot(e, t);
  if (n.aborted) return n;
  const { shell: r, activeRounds: o } = n;
  if (!o.length)
    return r.bodyEl.textContent = "אֵין סִבּוּבִים לַמִּשְׂחָק.", r.end(), n;
  const i = Wt(
    /** @type {HTMLElement} */
    r.footerEl,
    o.length
  );
  let s;
  const a = () => {
    s == null || s.dispose(), s = void 0;
  }, c = It(r, e, {
    totalRounds: o.length,
    completionOnly: !0,
    progressBar: i,
    transitionMs: t.transitionMs,
    playCorrectSound: t.playCorrectSound,
    onReplay: t.onReplay ?? (() => {
      Dt(e, t);
    }),
    buildRoundUI: u
  });
  r.on("end", a), r.on("start", () => {
    var l;
    i.update(0), (l = t.onStart) == null || l.call(t, r), c.reset();
  }), r.on("start", u);
  function u() {
    a(), r.bodyEl.innerHTML = "";
    const l = Lt();
    s = l;
    const d = () => !r.ended && !l.signal.aborted, y = r.state.currentRound - 1;
    try {
      const f = t.buildRound({
        shell: r,
        index: y,
        round: o[y],
        isActive: d,
        scope: l,
        isAnswered: () => !d() || c.isAnswered(),
        subscribeAnswered: (b) => d() ? l.use(c.subscribe(b)) : (b(!0), () => {
        }),
        onCorrect: async (b) => {
          d() && await c.handleCorrect(b);
        },
        onWrong: async (b) => {
          d() && await c.handleWrong(b);
        },
        schedule: l.schedule
      });
      f && l.use(f);
    } catch (f) {
      throw l.dispose(), f;
    }
  }
  return r.start(), n;
}
function zt(e, t, n) {
  e.innerHTML = "";
  const r = document.createElement("div");
  r.className = "option-cards-grid";
  const o = t.map((i) => {
    const s = document.createElement("button");
    s.className = "option-card", s.dataset.id = i.id, s.type = "button";
    const a = document.createElement("span");
    a.className = "option-card__emoji", a.textContent = i.emoji || "";
    const c = document.createElement("span");
    return c.className = "option-card__text", c.textContent = i.text, s.append(a, c), s.addEventListener("click", () => {
      s.disabled || n(i);
    }), r.appendChild(s), { el: s, option: i };
  });
  return e.appendChild(r), {
    /** הַדָּגֵשׁ כַּרְטִיס לְפִי סוּג: 'correct' | 'wrong' | 'hint' */
    highlight(i, s) {
      o.forEach(({ el: a, option: c }) => {
        c.id === i && a.classList.add(`option-card--${s}`);
      });
    },
    /** Visual hints never change the answer lock or other highlights. */
    clearHighlight(i, s) {
      o.forEach(({ el: a, option: c }) => {
        c.id === i && a.classList.remove(`option-card--${s}`);
      });
    },
    setDisabled(i) {
      o.forEach(({ el: s }) => {
        s.disabled = i;
      });
    },
    /** הסר את הרכיב */
    destroy() {
      e.innerHTML = "";
    }
  };
}
function Pn(e, t, n) {
  const r = e.scope.use(zt(t, n.options, (o) => {
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
function nt(e) {
  return z.find((t) => t.letter === e) || null;
}
function Ut(e = "regular") {
  return e === "regular" ? z.filter((t) => !t.isFinal) : e === "final" ? z.filter((t) => t.isFinal) : z;
}
function $n(e, t = "regular") {
  const n = Ut(t);
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
], Gt = z.filter((e) => !e.isFinal).map((e) => e.letter);
function Qt(e, t) {
  return e + t;
}
function Bn(e) {
  let t = [...x];
  if (typeof window < "u" && window.location && window.location.search) {
    const r = new URLSearchParams(window.location.search), o = r.get("allowedNikud");
    if (o) {
      const s = o.split(",").map((a) => a.trim());
      t = t.filter(
        (a) => s.includes(a.id) || s.includes(a.name) || s.includes(a.nameNikud)
      );
    }
    const i = r.get("excludedNikud");
    if (i) {
      const s = i.split(",").map((a) => a.trim());
      t = t.filter(
        (a) => !s.includes(a.id) && !s.includes(a.name) && !s.includes(a.nameNikud)
      );
    }
  }
  t.length === 0 && (t = [...x]);
  let n = [...t];
  for (; n.length < e; )
    n.push(...t);
  return n.sort(() => Math.random() - 0.5).slice(0, e);
}
const Xt = 2e3;
let A = [], Z = !1, D = 0.9, ue = 0.5;
try {
  ue = typeof localStorage < "u" && parseFloat(localStorage.getItem("alefbet.nikudRate")) || 0.5;
} catch {
}
let le = !1, X = null, H = null, R = null, rt = null, J = !1, L = "idle";
function fe() {
  return typeof speechSynthesis < "u";
}
function N(e, t, n = !1) {
  if (L === e && !n) return;
  const r = L;
  if (L = e, typeof window < "u" && typeof window.dispatchEvent == "function") {
    const o = { state: e, previousState: r };
    t && (o.reason = t), window.dispatchEvent(new CustomEvent("alefbet:tts-state", { detail: o }));
  }
}
function Kt() {
  fe() ? L = "idle" : N("unsupported", "no-speech-synthesis");
}
Kt();
function Pe(e, t) {
  rt = String(t || "unknown"), console.warn("[tts] browser TTS failed", { text: e, reason: t }), typeof window < "u" && typeof window.dispatchEvent == "function" && window.dispatchEvent(new CustomEvent("alefbet:tts-error", {
    detail: { provider: "browser", text: e, sentText: e, reason: t }
  }));
}
function Yt(e) {
  const t = String(e).toLowerCase();
  return t.includes("not-allowed") || t.includes("notallowed") || t.includes("didn't interact") || t.includes("user gesture");
}
function Zt() {
  return typeof window > "u" || typeof document > "u" ? Promise.resolve() : le ? (le = !0, Promise.resolve()) : X || (X = new Promise((e) => {
    const t = () => {
      le = !0, window.removeEventListener("pointerdown", t, !0), window.removeEventListener("keydown", t, !0), window.removeEventListener("touchstart", t, !0), e();
    };
    window.addEventListener("pointerdown", t, { once: !0, capture: !0 }), window.addEventListener("keydown", t, { once: !0, capture: !0 }), window.addEventListener("touchstart", t, { once: !0, capture: !0 });
  }).finally(() => {
    X = null;
  }), X);
}
let W = null, K = null, Ne = !1, Ge = !1;
const Jt = ["carmit", "hila", "female"];
function en(e) {
  const t = (e.name || "").toLowerCase();
  return Jt.some((n) => t.includes(n));
}
function Ae() {
  if (typeof speechSynthesis > "u") return null;
  const t = speechSynthesis.getVoices().filter(
    (i) => i.lang === "he-IL" || i.lang === "iw-IL" || (i.lang || "").startsWith("he")
  );
  if (t.length === 0) return null;
  const r = typeof navigator < "u" && navigator.onLine === !1 && t.filter((i) => i.localService !== !1) || t, o = r.length > 0 ? r : t;
  return o.find(en) || o[0];
}
function tn() {
  return typeof speechSynthesis > "u" ? Promise.resolve() : (W = Ae(), W ? (Ne = !0, Promise.resolve()) : Ne ? Promise.resolve() : K || (K = new Promise((e) => {
    let t = !1;
    const n = () => {
      t || (t = !0, Ne = !0, W = Ae(), typeof speechSynthesis < "u" && typeof speechSynthesis.removeEventListener == "function" && speechSynthesis.removeEventListener("voiceschanged", r), clearTimeout(o), e());
    }, r = () => {
      W = Ae(), W && n();
    };
    typeof speechSynthesis.addEventListener == "function" && speechSynthesis.addEventListener("voiceschanged", r);
    const o = setTimeout(() => {
      Ge || (Ge = !0, Pe("", "voice-load-timeout")), n();
    }, Xt);
  }).finally(() => {
    K = null;
  }), K));
}
function nn(e) {
  return 5e3 + ((e == null ? void 0 : e.length) ?? 0) * 200;
}
function Qe(e) {
  return new Promise((t, n) => {
    if (typeof SpeechSynthesisUtterance > "u") {
      n(new Error("SpeechSynthesisUtterance unavailable"));
      return;
    }
    try {
      const r = new SpeechSynthesisUtterance(e);
      r.lang = "he-IL", r.rate = D, W && (r.voice = W), R = r;
      let o = !1;
      const i = setTimeout(() => {
        if (!o) {
          o = !0, R === r && (R = null);
          try {
            speechSynthesis.cancel();
          } catch {
          }
          n(new Error("utterance-timeout"));
        }
      }, nn(e));
      r.onend = () => {
        o || (o = !0, clearTimeout(i), R === r && (R = null), t());
      }, r.onerror = (s) => {
        o || (o = !0, clearTimeout(i), R === r && (R = null), n(new Error(String(s && s.error || "speech-error"))));
      }, speechSynthesis.speak(r);
    } catch (r) {
      n(r instanceof Error ? r : new Error(String(r)));
    }
  });
}
async function rn(e) {
  if (typeof speechSynthesis > "u")
    return { ok: !1, reason: "speechSynthesis unavailable" };
  await tn();
  try {
    return await Qe(e), J = !1, { ok: !0 };
  } catch (t) {
    const n = (t == null ? void 0 : t.message) || "speech-error";
    if (Yt(n)) {
      J || (J = !0, N("awaiting-interaction", "autoplay-blocked")), await Zt(), J = !1;
      try {
        return await Qe(e), { ok: !0 };
      } catch (r) {
        const o = (r == null ? void 0 : r.message) || "speech-error";
        return Pe(e, o), { ok: !1, reason: o };
      }
    }
    return Pe(e, n), { ok: !1, reason: n };
  }
}
function U() {
  if (Z || A.length === 0) return;
  const e = A.shift();
  Z = !0, H = e;
  const t = D, n = typeof e.rate == "number";
  n && (D = e.rate), rn(e.text).then((r) => {
    n && (D = t), Z = !1;
    const o = H === e;
    if (H = null, !o) {
      U();
      return;
    }
    r.ok ? L !== "unsupported" && N("ready") : fe() ? N("failed", r.reason, !0) : N("unsupported", r.reason || "no-provider", !0), e.resolve(), U();
  }).catch((r) => {
    n && (D = t), Z = !1, H = null, N("failed", (r == null ? void 0 : r.message) || "unknown"), e.resolve(), U();
  });
}
const C = {
  /**
   * הקרא טקסט עברי. ה-promise תמיד נפתר (גם בכשל) כדי שמשחקים לא יתקעו.
   * @param {string} text
   * @returns {Promise<void>}
   */
  speak(e) {
    return new Promise((t) => {
      A.push({ text: e, resolve: t }), U();
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
    if (A.forEach((e) => {
      try {
        e.resolve();
      } catch {
      }
    }), A = [], Z = !1, R && (R = null), typeof speechSynthesis < "u" && typeof speechSynthesis.cancel == "function")
      try {
        speechSynthesis.cancel();
      } catch {
      }
    N("idle", "cancelled");
  },
  /**
   * האם יש יכולת קול מקומית במכשיר.
   */
  get available() {
    return L !== "unsupported" && fe();
  },
  /** המצב הנוכחי של מנוע ה-TTS. */
  get audioState() {
    return L;
  },
  /** Alias for audioState — some callers use `state`. */
  get state() {
    return L;
  },
  /** השגיאה האחרונה שדווחה או null אם לא הייתה. */
  get lastError() {
    return rt;
  },
  /**
   * משחרר ידנית את מנוע הקול אחרי gesture ידוע (כפתור התחל וכו').
   * משחקים יקראו לזה במקום להמתין ל-autoplay block.
   * @returns {Promise<void>}
   */
  unlock() {
    if (le = !0, J = !1, At().catch(() => {
    }), typeof speechSynthesis < "u" && typeof SpeechSynthesisUtterance < "u")
      try {
        const e = new SpeechSynthesisUtterance("");
        e.volume = 0, speechSynthesis.speak(e), speechSynthesis.cancel();
      } catch {
      }
    return L === "awaiting-interaction" && N("ready", "unlocked"), Promise.resolve();
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
    return fe() ? L === "unsupported" && N("idle", "recovered") : N("unsupported", "no-speech-synthesis"), this.available;
  },
  /**
   * הגדר מהירות דיבור (0.5-2.0).
   * @param {number} rate
   */
  setRate(e) {
    D = Math.max(0.5, Math.min(2, e));
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
      r && r.sound ? (A.push({ text: n, resolve: () => {
      } }), A.push({
        text: r.sound,
        rate: ue,
        resolve: () => o(void 0)
      })) : A.push({ text: n, resolve: () => o(void 0) }), U();
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
      A.push({
        text: t.sound,
        rate: ue,
        resolve: () => n(void 0)
      }), U();
    });
  }
}, on = 1200, ee = 250, sn = /[֑-ׇ]/g;
let Re = 0;
function an(e, { beatMs: t = on } = {}) {
  const n = (a) => new Promise((c) => {
    e.schedule(() => c(void 0), a);
  }), r = (a) => (Re++, C.speak(a).finally(() => {
    Re--;
  })), o = () => Re ? (C.cancel(), !0) : !1, i = (a, c = t, u = c + 1500 + a.replace(sn, "").length * 120) => Promise.all([n(c), Promise.race([r(a), n(u)])]), s = async () => {
    o() && await n(ee);
  };
  return e.use(() => {
    o();
  }), { wait: n, say: i, speak: r, hush: o, quiet: s };
}
const cn = () => {
  var e;
  return !!((e = globalThis.navigator) != null && e.userActivation) && !navigator.userActivation.hasBeenActive;
};
function j(e, t, n) {
  const r = document.createElement(e);
  return t && (r.className = t), n !== void 0 && (r.textContent = n), r;
}
function un(e) {
  const t = j("span", "story-choice__dots");
  t.setAttribute("aria-hidden", "true");
  for (let n = 0; n < e; n++) t.append(j("span"));
  return t;
}
function ln(e, { retireTried: t = !0 } = {}) {
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
    return c.type = "button", c.dataset.value = String(a), c.setAttribute("aria-label", String(a)), c.append(j("span", "story-choice__number", String(a)), un(a)), c;
  });
  r.append(...o);
  const i = (a) => n ? a.dataset.id : Number(a.dataset.value), s = (a) => i(a) === ("cards" in e ? e.right : e.answer);
  return {
    root: r,
    buttons: o,
    valueOf: i,
    isRight: s,
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
      (a = o.find(s)) == null || a.classList.add("story-pick--hint");
    }
  };
}
const Xe = [
  "כָּל הַכָּבוֹד",
  "מְצֻיָּן",
  "יֹפִי",
  "נֶהְדָּר",
  "וָאוּ",
  "אֵיזֶה כֵּיף"
], Ke = [
  "נַסּוּ שׁוּב, אַתֶּם יְכוֹלִים",
  "כִּמְעַט! הַקְשִׁיבוּ שׁוּב",
  "עוֹד נִסָּיוֹן קָטָן",
  "קְרוֹבִים מְאֹד"
];
function dn() {
  return Xe[Math.floor(Math.random() * Xe.length)];
}
function In() {
  return Ke[Math.floor(Math.random() * Ke.length)];
}
function fn(e) {
  const t = document.createElement("div");
  t.className = "feedback-message", t.setAttribute("aria-live", "polite"), t.setAttribute("role", "status"), e.appendChild(t);
  let n = null;
  function r(o, i, s = 1800) {
    clearTimeout(n), t.textContent = o, t.className = `feedback-message feedback-message--${i}`, n = setTimeout(() => {
      t.textContent = "", t.className = "feedback-message";
    }, s);
  }
  return {
    /** הצג משוב חיובי - טקסט מפורש, או ביטוי שבח אקראי אם לא סופק */
    correct(o) {
      de.correct(), r(o ?? `!${dn()}`, "correct"), ce(t, "bounce");
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
function I(e, t, n) {
  const r = document.createElement(e);
  return t && (r.className = t), n !== void 0 && (r.textContent = n), r;
}
function Ye(e, t) {
  const n = (
    /** @type {HTMLButtonElement} */
    I("button", e, t)
  );
  return n.type = "button", n;
}
function Wn(e, t) {
  const { shell: n, scope: r, isActive: o } = e, { wait: i, say: s, speak: a, hush: c } = an(r), u = t({ wait: i, say: s, speak: a }), { beats: l, scene: d, choices: y, result: f, ladder: b, onMiss: v, beforeResult: $ } = u, w = "cards" in y, ne = u.solvedEquation ?? l[l.length - 1].equation;
  let S = 0, re = !1, be = 0;
  const oe = I("section", ["story-round", u.className, w && "story-round--cards"].filter(Boolean).join(" ")), F = I("div", "story");
  F.setAttribute("aria-live", "polite");
  const we = I("p", "story-equation");
  we.dir = "ltr";
  const P = ln(y, { retireTried: u.retireTried ?? !0 }), q = Ye("story-again", "עוֹד פַּעַם 🔁");
  q.setAttribute("aria-label", "שמיעת הסיפור שוב"), oe.append(F, ...d ? [d.root] : [], we, P.root, q), n.bodyEl.append(oe);
  const ge = r.use(fn(oe));
  function ve(m, p = "story-line") {
    var h;
    (h = F.querySelector(".story-line--now")) == null || h.classList.remove("story-line--now"), F.append(I("p", `${p} story-line--now`, m.text)), d == null || d.root.setAttribute("aria-label", [...F.querySelectorAll(".story-line")].map((g) => g.textContent).join(" "));
  }
  function _e(m, { answer: p, before: h } = {}) {
    const g = h == null ? void 0 : h.split(" ");
    we.replaceChildren(...m.split(" ").filter(Boolean).flatMap((_, k) => {
      const V = _ === "?" && p !== void 0 ? I("span", "story-solved", String(p)) : I("span", _ === "?" ? "story-unknown" : "", _);
      return g && g[k] !== _ && V.classList.add("story-term--new"), k ? [" ", V] : [V];
    }));
  }
  async function ie() {
    var g, _;
    const m = ++S, p = () => m === S && o();
    if (c() && await i(ee), !p()) return;
    (g = d == null ? void 0 : d.clearCount) == null || g.call(d), d == null || d.reset(), F.replaceChildren();
    let h = "";
    for (const k of l) {
      ve(k), _e(k.equation, u.highlight ? { before: h } : {}), h = k.equation, k.scene === "question" && !re && (re = !0, qe());
      const V = s(k.say);
      if (await Promise.all([V, (_ = d == null ? void 0 : d[k.scene]) == null ? void 0 : _.call(d, p, V)]), !p()) return;
    }
  }
  function ke() {
    var p;
    S++;
    const m = c();
    return (p = d == null ? void 0 : d.clearCount) == null || p.call(d), d == null || d.settle(), F.replaceChildren(), l.forEach((h) => ve(h)), _e(l[l.length - 1].equation), m;
  }
  async function bt() {
    const m = ke(), p = S, h = () => p === S && o();
    if (m && await i(ee), !h() || !(d != null && d.counting)) return;
    const { items: g, total: _ } = await d.counting(h);
    for (const k of g) {
      if (!h()) return;
      k.mark(), await s(k.say, 700, 1500);
    }
    _ && h() && await s(_);
  }
  function qe() {
    P.lock(!re || e.isAnswered()), q.disabled = e.isAnswered();
  }
  function Ve(m) {
    if (m.action === "mark") {
      P.mark(), ge.hint(m.hint);
      return;
    }
    ge.hint(m.hint), m.action === "count" ? bt() : ie();
  }
  function wt(m) {
    if (!(!re || e.isAnswered() || m.disabled)) {
      if (!P.isRight(m)) {
        e.onWrong(() => {
          be++, P.tried(m);
          const p = b[Math.min(be, b.length) - 1];
          return v ? (async () => {
            const h = ke(), g = S;
            h && await i(ee), o() && (await v(P.valueOf(m), () => g === S && o()), o() && Ve(p));
          })() : Ve(p);
        });
        return;
      }
      e.onCorrect(() => {
        P.correct(m);
        const p = ke(), h = () => {
          _e(ne, { answer: y.answer }), (u.resultLine ?? !0) && ve(f, "story-line story-line--result"), ge.correct(), r.schedule(() => {
            a(f.say);
          }, p ? ee : 0);
        };
        if (!$) return h();
        const g = S, _ = () => g === S && o();
        return (async () => {
          await $(_), o() && h();
        })();
      });
    }
  }
  for (const m of P.buttons) r.listen(m, "click", () => wt(m));
  if (r.listen(q, "click", () => {
    ie();
  }), e.subscribeAnswered(qe), cn()) {
    const m = Ye("story-start", "▶ הַקְשִׁיבוּ לַסִּפּוּר");
    F.append(m), q.hidden = !0, r.listen(m, "click", () => {
      q.hidden = !1, ie();
    });
  } else
    ie();
  return { host: oe, get misses() {
    return be;
  } };
}
function jn({ hintAfter: e = 2, escalateAfter: t = 4, onHint: n, onEscalate: r } = {}) {
  let o = 0;
  function i(s) {
    return s >= t ? 2 : s >= e ? 1 : 0;
  }
  return {
    /** דיווח על ניסיון שגוי. מפעיל את הקולבק המתאים ומחזיר את הרמה. */
    miss() {
      o++;
      const s = i(o);
      return s === 2 && r ? r(o) : s === 1 && n && n(o), s;
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
function mn(e) {
  let t = e.querySelector(".adult-tools__panel");
  if (t) return t;
  const n = e.querySelector(".game-header");
  if (!n) return null;
  const r = document.createElement("details");
  return r.className = "adult-tools", r.innerHTML = '<summary aria-label="להורים ולמורים">☰<span>למבוגרים</span></summary><div class="adult-tools__panel"><p>להורים ולמורים</p></div>', r.addEventListener("keydown", (o) => {
    o.key === "Escape" && (r.open = !1, r.querySelector("summary").focus(), o.stopPropagation());
  }), n.appendChild(r), r.querySelector(".adult-tools__panel");
}
function Hn(e, t, n, r) {
  const o = mn(e);
  if (!o) return null;
  const i = document.createElement("button");
  return i.className = "btn", i.setAttribute("aria-label", n), i.textContent = `${t} ${n}`, i.onclick = (s) => {
    const a = i.closest("details");
    a && (a.open = !1), r(s);
  }, o.appendChild(i), i;
}
const hn = ["אֶפֶס", "אֶחָד", "שְׁנַיִם", "שְׁלוֹשָׁה", "אַרְבָּעָה", "חֲמִשָּׁה", "שִׁשָּׁה", "שִׁבְעָה", "שְׁמוֹנָה", "תִּשְׁעָה", "עֲשָׂרָה"], pn = ["אֶפֶס", "אַחַת", "שְׁתַּיִם", "שָׁלוֹשׁ", "אַרְבַּע", "חָמֵשׁ", "שֵׁשׁ", "שֶׁבַע", "שְׁמוֹנֶה", "תֵּשַׁע", "עֶשֶׂר"];
function me(e, t = "f") {
  return !Number.isInteger(e) || e < 0 || e > 10 ? String(e) : (t === "m" ? hn : pn)[e];
}
function qn(e, t, { digits: n = !1 } = {}) {
  return e === 1 ? `${t.one} ${me(1, t.gender)}` : n ? `${e} ${t.many}` : e === 2 ? `${t.gender === "m" ? "שְׁנֵי" : "שְׁתֵּי"} ${t.many}` : `${me(e, t.gender)} ${t.many}`;
}
function Vn(e, t, n) {
  return `${me(t)} ${e === "+" ? "וְעוֹד" : "פָּחוֹת"} ${me(n)}`;
}
let B = null, E = null, ot = 0, it = 0, G = null, Me = 0, xe = 0;
const te = /* @__PURE__ */ new Map();
function st(e, t) {
  var r;
  const n = (r = document.elementFromPoint(e, t)) == null ? void 0 : r.closest('[data-drop-target="true"]');
  return n && te.has(n) && !n.matches(":disabled") && n.getAttribute("aria-disabled") !== "true" ? n : null;
}
function yn(e, t, n) {
  const r = e.getBoundingClientRect();
  ot = r.width / 2, it = r.height / 2, E = e.cloneNode(!0), E.setAttribute("aria-hidden", "true"), E.setAttribute("tabindex", "-1"), Object.assign(E.style, {
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
  }), at(t, n), document.body.appendChild(E);
}
function at(e, t) {
  E && (E.style.transform = `translate3d(${e - ot}px, ${t - it}px, 0) scale(1.12)`);
}
function bn(e, t) {
  Me = e, xe = t, G === null && (G = requestAnimationFrame(() => {
    G = null, at(Me, xe), gn(st(Me, xe));
  }));
}
function wn() {
  G !== null && (cancelAnimationFrame(G), G = null), E == null || E.remove(), E = null;
}
let M = null;
function gn(e) {
  M !== e && (M == null || M.classList.remove("drop-target--hover"), M = e, e == null || e.classList.add("drop-target--hover"));
}
function vn() {
  M == null || M.classList.remove("drop-target--hover"), M = null;
}
function On(e, t, { onTap: n } = {}) {
  e.classList.add("drag-source");
  let r = null, o = null, i = null, s = null;
  function a() {
    var l;
    r && (e.removeEventListener("pointermove", r), e.removeEventListener("pointerup", o), e.removeEventListener("pointercancel", i), e.removeEventListener("lostpointercapture", i), r = o = i = null), vn(), wn(), e.classList.remove("drag-source--dragging"), B = null;
    const u = s;
    s = null, u !== null && ((l = e.hasPointerCapture) != null && l.call(e, u)) && e.releasePointerCapture(u);
  }
  function c(u) {
    if (e.matches(":disabled") || e.getAttribute("aria-disabled") === "true" || u.button !== void 0 && u.button !== 0 || s !== null) return;
    u.preventDefault(), B && B.cancel(), B = { el: e, data: t, cancel: a }, s = u.pointerId;
    let l = !1;
    const d = () => {
      l = !0, e.classList.add("drag-source--dragging"), yn(e, u.clientX, u.clientY);
    }, y = (f) => Math.hypot(f.clientX - u.clientX, f.clientY - u.clientY) >= 8;
    n || d(), e.setPointerCapture(u.pointerId), r = (f) => {
      f.pointerId === s && (!l && y(f) && d(), l && bn(f.clientX, f.clientY));
    }, o = (f) => {
      if (f.pointerId !== s) return;
      const b = !l && !y(f), v = b && n ? null : st(f.clientX, f.clientY);
      if (a(), b && n) {
        n();
        return;
      }
      v && te.has(v) && te.get(v).onDrop({ data: t, sourceEl: e, targetEl: v });
    }, i = (f) => {
      f.pointerId === s && a();
    }, e.addEventListener("pointermove", r), e.addEventListener("pointerup", o), e.addEventListener("pointercancel", i), e.addEventListener("lostpointercapture", i);
  }
  return e.addEventListener("pointerdown", c), {
    destroy() {
      e.removeEventListener("pointerdown", c), (B == null ? void 0 : B.el) === e && a(), e.classList.remove("drag-source");
    }
  };
}
function Dn(e, t) {
  return e.setAttribute("data-drop-target", "true"), e.classList.add("drop-target--active"), te.set(e, { onDrop: t }), {
    destroy() {
      e.removeAttribute("data-drop-target"), e.classList.remove("drop-target--active", "drop-target--hover"), te.delete(e);
    }
  };
}
function zn(e) {
  const t = [...e];
  for (let n = t.length - 1; n > 0; n--) {
    const r = Math.floor(Math.random() * (n + 1));
    [t[n], t[r]] = [t[r], t[n]];
  }
  return t;
}
const _n = "alefbet-voices", T = "recordings", kn = 1;
let Y = null;
function ye() {
  return Y || (Y = new Promise((e, t) => {
    const n = indexedDB.open(_n, kn);
    n.onupgradeneeded = () => {
      n.result.createObjectStore(T);
    }, n.onsuccess = () => e(n.result), n.onerror = () => {
      Y = null, t(n.error);
    };
  }), Y);
}
function We(e, t) {
  return `${e}/${t}`;
}
async function Un(e, t, n) {
  const r = await ye();
  return new Promise((o, i) => {
    const s = r.transaction(T, "readwrite");
    s.objectStore(T).put(n, We(e, t)), s.oncomplete = o, s.onerror = (a) => i(a.target.error);
  });
}
async function Sn(e, t) {
  const n = await ye();
  return new Promise((r, o) => {
    const s = n.transaction(T, "readonly").objectStore(T).get(We(e, t));
    s.onsuccess = () => r(s.result ?? null), s.onerror = (a) => o(a.target.error);
  });
}
async function Gn(e, t) {
  const n = await ye();
  return new Promise((r, o) => {
    const i = n.transaction(T, "readwrite");
    i.objectStore(T).delete(We(e, t)), i.oncomplete = r, i.onerror = (s) => o(s.target.error);
  });
}
async function En(e) {
  const t = await ye();
  return new Promise((n, r) => {
    const i = t.transaction(T, "readonly").objectStore(T).getAllKeys();
    i.onsuccess = () => {
      const s = `${e}/`;
      n(
        (i.result || []).filter((a) => a.startsWith(s)).map((a) => a.slice(s.length))
      );
    }, i.onerror = (s) => r(s.target.error);
  });
}
async function Ze(e, t, { signal: n } = {}) {
  if (n != null && n.aborted) return !1;
  let r;
  try {
    r = await Sn(e, t);
  } catch {
    return !1;
  }
  return !r || n != null && n.aborted ? !1 : await Mt(r, { signal: n }) ? !0 : n != null && n.aborted ? !1 : new Promise((o) => {
    const i = URL.createObjectURL(r), s = new Audio(i);
    let a = !1;
    const c = (l) => {
      a || (a = !0, n == null || n.removeEventListener("abort", u), s.onended = null, s.onerror = null, s.pause(), URL.revokeObjectURL(i), o(l));
    }, u = () => c(!1);
    n == null || n.addEventListener("abort", u, { once: !0 }), s.onended = () => c(!0), s.onerror = () => c(!1), s.play().catch(() => c(!1));
  });
}
const Ln = {
  a: { F1: 850, F2: 1400 },
  e: { F1: 550, F2: 2100 },
  i: { F1: 350, F2: 2700 },
  o: { F1: 550, F2: 1e3 },
  u: { F1: 350, F2: 850 }
}, ct = {
  kamatz: "a",
  patah: "a",
  tzere: "e",
  segol: "e",
  hiriq: "i",
  holam: "o",
  kubbutz: "u"
}, ut = 210, lt = 550, Nn = {
  a: { F3: 2700, bandwidths: [90, 110, 170], gains: [1, 0.5, 0.15] },
  e: { F3: 2900, bandwidths: [80, 100, 160], gains: [1, 0.55, 0.2] },
  i: { F3: 3300, bandwidths: [60, 100, 160], gains: [1, 0.6, 0.25] },
  o: { F3: 2600, bandwidths: [80, 90, 150], gains: [1, 0.5, 0.1] },
  u: { F3: 2400, bandwidths: [60, 80, 140], gains: [1, 0.45, 0.1] }
};
function he(e) {
  const t = Ln[e], n = Nn[e];
  return !t || !n ? null : {
    formants: [t.F1, t.F2, n.F3],
    bandwidths: [...n.bandwidths],
    gains: [...n.gains]
  };
}
const Je = {
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
function An(e) {
  return Je[e] ?? Je[""];
}
function Qn() {
  return pe() !== null;
}
let se = null;
function Rn(e) {
  if (se && se.sampleRate === e.sampleRate) return se;
  const t = e.sampleRate, n = e.createBuffer(1, t, e.sampleRate), r = n.getChannelData(0);
  for (let o = 0; o < t; o++) r[o] = Math.random() * 2 - 1;
  return se = n, n;
}
function dt(e, t, n, r = e.destination) {
  const o = e.createOscillator();
  o.type = "sawtooth", o.frequency.value = n;
  const i = e.createGain();
  i.gain.value = 0;
  const s = t.formants.map((a, c) => {
    const u = e.createBiquadFilter();
    u.type = "bandpass", u.frequency.value = a, u.Q.value = a / t.bandwidths[c];
    const l = e.createGain();
    return l.gain.value = t.gains[c], o.connect(u), u.connect(l), l.connect(i), u;
  });
  return i.connect(r), { source: o, filters: s, master: i };
}
function Ce(e, t, n, r, o = e.destination) {
  const i = n.durationMs / 1e3, s = e.createBufferSource();
  s.buffer = Rn(e), s.loop = !0;
  const a = e.createBiquadFilter();
  a.type = "bandpass", a.frequency.value = n.noiseHz ?? 2e3, a.Q.value = n.noiseQ ?? 1;
  const c = e.createGain();
  return c.gain.setValueAtTime(0, t), c.gain.linearRampToValueAtTime(r, t + Math.min(0.01, i / 3)), c.gain.linearRampToValueAtTime(1e-4, t + i), s.connect(a), a.connect(c), c.connect(o), s.start(t), s.stop(t + i + 0.02), t + i;
}
function ft(e, t, n, r, o, i, s = e.destination) {
  const a = r / 1e3, { source: c, filters: u, master: l } = dt(e, n, o, s);
  if (c.frequency.setValueAtTime(o * 1.04, t), c.frequency.linearRampToValueAtTime(o * 0.92, t + a), i) {
    const f = Math.min(0.09, a / 3);
    u.forEach((b, v) => {
      const $ = i[v];
      $ && (b.frequency.setValueAtTime($, t), b.frequency.exponentialRampToValueAtTime(n.formants[v], t + f));
    });
  }
  const d = 0.04, y = 0.12;
  return l.gain.setValueAtTime(0, t), l.gain.linearRampToValueAtTime(0.5, t + d), l.gain.setValueAtTime(0.5, t + a - y), l.gain.linearRampToValueAtTime(1e-4, t + a), c.start(t), c.stop(t + a + 0.05), t + a;
}
function Mn(e, t, n, r, o = e.destination) {
  const i = n / 1e3, s = { formants: [250, 1100, 2200], bandwidths: [80, 200, 300], gains: [1, 0.12, 0.05] }, { source: a, master: c } = dt(e, s, r, o);
  return c.gain.setValueAtTime(0, t), c.gain.linearRampToValueAtTime(0.35, t + 0.02), c.gain.setValueAtTime(0.35, t + i - 0.02), c.gain.linearRampToValueAtTime(1e-4, t + i), a.start(t), a.stop(t + i + 0.05), t + i;
}
function mt(e, t, n, r) {
  const o = Math.max(0, (t - e.currentTime) * 1e3) + 60;
  return new Promise((i) => {
    const s = () => {
      clearTimeout(a), r == null || r.removeEventListener("abort", s), n.disconnect(), i(!(r != null && r.aborted));
    }, a = setTimeout(s, o);
    r == null || r.addEventListener("abort", s, { once: !0 }), r != null && r.aborted && s();
  });
}
async function xn(e, t = {}) {
  var s, a;
  const n = he(e);
  if (!n || (s = t.signal) != null && s.aborted) return !1;
  const r = await Ie();
  if (!r || (a = t.signal) != null && a.aborted) return !1;
  let o, i;
  try {
    i = r.createGain(), i.connect(r.destination);
    const c = r.currentTime + 0.03;
    o = ft(r, c, n, t.durationMs ?? lt, t.pitchHz ?? ut, null, i);
  } catch {
    return i == null || i.disconnect(), !1;
  }
  return mt(r, o, i, t.signal);
}
async function $e(e, t, n = {}) {
  var l, d;
  const r = he(t);
  if (!r || (l = n.signal) != null && l.aborted) return !1;
  const o = await Ie();
  if (!o || (d = n.signal) != null && d.aborted) return !1;
  const i = An(e), s = n.pitchHz ?? ut, a = n.durationMs ?? lt;
  let c, u;
  try {
    u = o.createGain(), u.connect(o.destination), c = Cn(o, i, e, r, a, s, u);
  } catch {
    return u == null || u.disconnect(), !1;
  }
  return mt(o, c, u, n.signal);
}
function Cn(e, t, n, r, o, i, s = e.destination) {
  let a = e.currentTime + 0.03, c = null;
  switch (t.type) {
    case "plosive": {
      a = Ce(e, a, t, t.voiced ? 0.25 : 0.35, s), a += 0.01;
      break;
    }
    case "fricative": {
      a = Ce(e, a, t, 0.22, s) - 0.03;
      break;
    }
    case "affricate": {
      a += 0.03, a = Ce(e, a, { ...t, durationMs: t.durationMs - 30 }, 0.3, s) - 0.02;
      break;
    }
    case "nasal": {
      a = Mn(e, a, t.durationMs, i, s), c = [300, 1300, 2300];
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
  return ft(e, a, r, o, i, c, s);
}
const Be = "sound-bank";
function ht(e) {
  return `letter:${e}`;
}
function pt(e) {
  return `nikud:${e}`;
}
function yt(e, t) {
  return `syllable:${e}:${t}`;
}
function Xn() {
  const e = [];
  for (const t of z)
    e.push({ key: ht(t.letter), label: t.nameNikud, group: "letters" });
  for (const t of x)
    e.push({ key: pt(t.id), label: `${t.nameNikud} (${t.sound})`, group: "nikud" });
  for (const t of Gt)
    for (const n of x)
      e.push({
        key: yt(t, n.id),
        label: Qt(t, n.symbol),
        group: "syllables"
      });
  return e;
}
function Tn() {
  return typeof navigator < "u" && navigator.onLine === !1;
}
async function je(e, t = void 0) {
  try {
    return typeof indexedDB > "u" ? !1 : await (t ? Ze(Be, e, t) : Ze(Be, e));
  } catch {
    return !1;
  }
}
async function He(e) {
  if (Tn() && !Fn()) return !1;
  try {
    return await e(), C.audioState !== "failed" && C.audioState !== "unsupported";
  } catch {
    return !1;
  }
}
function Fn() {
  return typeof speechSynthesis < "u";
}
async function Kn() {
  try {
    return typeof indexedDB > "u" ? [] : await En(Be);
  } catch {
    return [];
  }
}
async function Yn(e) {
  if (await je(ht(e))) return "bank";
  const t = nt(e), n = t ? t.nameNikud : e;
  return await He(() => C.speak(n)) ? "tts" : t && await $e(t.sound, "a", { durationMs: 400 }) ? "synth" : "none";
}
async function Zn(e) {
  if (await je(pt(e))) return "bank";
  if (await He(() => C.speakVowel(e))) return "tts";
  const t = ct[e];
  return t && await xn(t) ? "synth" : "none";
}
async function Jn(e, t, n = {}) {
  const { signal: r } = n;
  if (r != null && r.aborted) return "none";
  if (await je(yt(e, t), r ? n : void 0)) return "bank";
  if (r != null && r.aborted) return "none";
  const o = x.find((c) => c.id === t), i = () => C.cancel();
  r == null || r.addEventListener("abort", i, { once: !0 });
  try {
    if (o && await He(() => C.speakNikud(e, o.symbol)))
      return r != null && r.aborted ? "none" : "tts";
  } finally {
    r == null || r.removeEventListener("abort", i);
  }
  if (r != null && r.aborted) return "none";
  const s = nt(e), a = ct[t];
  return a && await (r ? $e(s ? s.sound : "", a, n) : $e(s ? s.sound : "", a)) ? "synth" : "none";
}
function er(e, t) {
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
  x.forEach((u) => {
    const l = o.length === 0 || o.includes(u.id) || o.includes(u.name);
    i += `
      <label style="display:flex; align-items:center; gap:0.5rem; cursor:pointer;">
        <input type="checkbox" value="${u.id}" class="nikud-filter-cb" ${l ? "checked" : ""} style="width:1.2rem;height:1.2rem;">
        <span>${u.nameNikud}</span>
      </label>
    `;
  });
  const s = parseFloat(localStorage.getItem("alefbet.nikudRate")) || 0.5;
  i += `
      </div>
      <div style="margin:1rem 0; text-align:right;">
        <label style="font-weight:700; font-size:0.95rem;">מהירות הגייה: <span id="nikud-rate-val">${s}</span></label>
        <input type="range" id="nikud-rate-slider" min="0.3" max="1.5" step="0.1" value="${s}" style="width:100%; margin-top:0.3rem; accent-color:#4f67ff;">
        <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:#888;">
          <span>אִטִּי</span>
          <span>מָהִיר</span>
        </div>
      </div>
      <button id="save-settings-btn" style="padding:0.5rem 1rem; border-radius:0.5rem; background:#4f67ff; color:white; border:none; font-size:1.1rem; cursor:pointer;">שמור והתחל מחדש</button>
      <button id="close-settings-btn" style="padding:0.5rem 1rem; border-radius:0.5rem; background:#ddd; color:#333; border:none; font-size:1.1rem; cursor:pointer; margin-right:0.5rem;">ביטול</button>
    </div>
  `, n.innerHTML = i, n.style.display = "flex";
  const a = (
    /** @type {HTMLInputElement} */
    document.getElementById("nikud-rate-slider")
  ), c = document.getElementById("nikud-rate-val");
  a.oninput = () => {
    c.textContent = a.value;
  }, document.getElementById("save-settings-btn").onclick = () => {
    const u = parseFloat(a.value);
    localStorage.setItem("alefbet.nikudRate", String(u)), C.setNikudEmphasis({ rate: u });
    const l = Array.from(n.querySelectorAll(".nikud-filter-cb")).filter((y) => (
      /** @type {HTMLInputElement} */
      y.checked
    )).map((y) => (
      /** @type {HTMLInputElement} */
      y.value
    )), d = new URL(window.location.href);
    l.length > 0 && l.length < x.length ? d.searchParams.set("allowedNikud", l.join(",")) : d.searchParams.delete("allowedNikud"), d.searchParams.delete("excludedNikud"), n.style.display = "none", window.history.replaceState({}, "", d), t && t(e);
  }, document.getElementById("close-settings-btn").onclick = () => {
    n.style.display = "none";
  };
}
export {
  ct as NIKUD_VOWEL,
  Be as SOUND_BANK_ID,
  Ln as VOWEL_TEMPLATES,
  ce as animate,
  Ot as bootstrapGame,
  qn as countNoun,
  Pn as createChoiceRound,
  On as createDragSource,
  Dn as createDropTarget,
  fn as createFeedback,
  jn as createHintTracker,
  Wt as createProgressBar,
  Lt as createRoundScope,
  Wn as createStoryRound,
  Gn as deleteVoice,
  Vn as exerciseWords,
  pe as getAudioContext,
  nt as getLetter,
  Ut as getLettersByGroup,
  Hn as injectHeaderButton,
  Qn as isSynthSupported,
  Qt as letterWithNikud,
  Sn as loadVoice,
  St as lockPageZoom,
  Gt as nikudBaseLetters,
  x as nikudList,
  me as numberWord,
  Ze as playVoice,
  $n as randomLetters,
  Bn as randomNikud,
  dn as randomPraise,
  In as randomRetryHint,
  Kn as recordedKeys,
  Dt as runGame,
  Un as saveVoice,
  Bt as showCompletionScreen,
  er as showNikudSettingsDialog,
  zn as shuffle,
  de as sounds,
  Yn as speakLetter,
  Zn as speakNikudSound,
  Jn as speakSyllable,
  Xn as standardSoundKeys,
  C as tts
};
