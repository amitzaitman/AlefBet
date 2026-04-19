class In {
  constructor() {
    this._handlers = {};
  }
  /** הירשם לאירוע */
  on(t, n) {
    return this._handlers[t] || (this._handlers[t] = []), this._handlers[t].push(n), this;
  }
  /** בטל הרשמה לאירוע */
  off(t, n) {
    return this._handlers[t] ? (this._handlers[t] = this._handlers[t].filter((o) => o !== n), this) : this;
  }
  /** שלח אירוע */
  emit(t, n) {
    return (this._handlers[t] || []).slice().forEach((o) => o(n)), this;
  }
}
class Rn {
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
class Ln {
  /**
   * @param {HTMLElement} containerEl - אלמנט המיכל
   * @param {object} config - הגדרות: { totalRounds, title, homeUrl }
   */
  constructor(t, n = {}) {
    this.container = t, this.config = {
      totalRounds: 8,
      title: "מִשְׂחָק",
      homeUrl: "../../index.html",
      ...n
    }, this.events = new In(), this.state = new Rn(this.config.totalRounds), this._buildShell();
  }
  _buildShell() {
    this.container.classList.add("alefbet-game");
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
    this.state.nextRound(), this.events.emit("start", { state: this.state });
  }
  /** עבור לסיבוב הבא */
  nextRound() {
    const t = this.state.nextRound();
    return t ? this.events.emit("round", { state: this.state }) : this.end(this.state.score), t;
  }
  /** סיים את המשחק */
  end(t) {
    this.events.emit("end", { score: t, state: this.state });
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
let me = null;
function An() {
  if (!me)
    try {
      me = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      return null;
    }
  return me.state === "suspended" && me.resume(), me;
}
function se(e, t, n = "sine", o = 0.3) {
  const r = An();
  if (r)
    try {
      const i = r.createOscillator(), s = r.createGain();
      i.connect(s), s.connect(r.destination), i.type = n, i.frequency.setValueAtTime(e, r.currentTime), s.gain.setValueAtTime(o, r.currentTime), s.gain.exponentialRampToValueAtTime(1e-3, r.currentTime + t), i.start(r.currentTime), i.stop(r.currentTime + t + 0.05);
    } catch {
    }
}
const Ze = {
  /** צליל תשובה נכונה */
  correct() {
    se(523.25, 0.15), setTimeout(() => se(659.25, 0.2), 120), setTimeout(() => se(783.99, 0.3), 240);
  },
  /** צליל עידוד עדין — נסה שוב */
  wrong() {
    se(350, 0.15, "triangle", 0.12);
  },
  /** צליל עידוד - סיום מוצלח */
  cheer() {
    [523.25, 587.33, 659.25, 698.46, 783.99, 1046.5].forEach((t, n) => setTimeout(() => se(t, 0.2), n * 90));
  },
  /** קליק עדין */
  click() {
    se(900, 0.04, "sine", 0.12);
  }
}, mt = "https://nakdan-u1-0.loadbalancer.dicta.org.il/api";
let _t = !1;
const ge = /* @__PURE__ */ new Map();
function Pn() {
  var r;
  if (typeof window > "u") return mt;
  const e = new URLSearchParams(window.location.search).get("nakdanProxy"), t = window.ALEFBET_NAKDAN_PROXY_URL;
  if (e && window.localStorage)
    try {
      window.localStorage.setItem("alefbet.nakdanProxyUrl", e);
    } catch {
    }
  const n = (r = window.localStorage) == null ? void 0 : r.getItem("alefbet.nakdanProxyUrl"), o = e || t || n;
  return o || (window.location.hostname.endsWith("github.io") ? null : mt);
}
function On(e) {
  var n;
  let t = "";
  for (const o of e)
    if (o.sep)
      t += o.str ?? "";
    else {
      const r = (n = o.nakdan) == null ? void 0 : n.options;
      r != null && r.length ? t += (r[0].w ?? "").replace(/\|/g, "").replace(/\u05BD/g, "") : t += o.str ?? "";
    }
  return t;
}
async function jn(e) {
  const t = Pn();
  if (!t)
    throw _t || (_t = !0, console.warn("[nakdan] Dicta API blocked by CORS on GitHub Pages. Configure a proxy URL via ?nakdanProxy=..., window.ALEFBET_NAKDAN_PROXY_URL, or localStorage key alefbet.nakdanProxyUrl.")), new Error("Nakdan unavailable without proxy on this host");
  const n = await fetch(t, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      addmorph: !0,
      keepmetagim: !1,
      keepqq: !1,
      nodageshdefmem: !1,
      patachma: !1,
      task: "nakdan",
      data: e,
      useTokenization: !0,
      genre: "modern"
    })
  });
  if (!n.ok) throw new Error(`Nakdan ${n.status}`);
  const o = await n.json(), r = o == null ? void 0 : o.data;
  if (!Array.isArray(r)) throw new Error("Nakdan: invalid response");
  return On(r);
}
async function Mn(e) {
  if (!(e != null && e.trim())) return e ?? "";
  if (ge.has(e)) return ge.get(e);
  try {
    const t = await jn(e);
    return ge.set(e, t), t;
  } catch {
    return ge.set(e, e), e;
  }
}
function Dn(e) {
  return ge.get(e) ?? e ?? "";
}
async function Bn(e) {
  const t = [...new Set(e.filter((n) => n == null ? void 0 : n.trim()))];
  await Promise.all(t.map((n) => Mn(n)));
}
let ce = [], xe = !1, Jt = !0, ue = 0.9, bt = typeof localStorage < "u" && parseFloat(localStorage.getItem("alefbet.nikudRate")) || 0.5, Ve = !1, _e = null;
function gt(e, t, n, o = t) {
  console.warn(`[tts] ${e} TTS failed`, { text: t, sentText: o, reason: n }), typeof window < "u" && typeof window.dispatchEvent == "function" && window.dispatchEvent(new CustomEvent("alefbet:tts-error", {
    detail: { provider: e, text: t, sentText: o, reason: n }
  }));
}
function Fn(e) {
  return (e || "").replace(/[\u0591-\u05C7]/g, "");
}
function Un(e) {
  const t = String(e || "").toLowerCase();
  return t.includes("didn't interact") || t.includes("notallowed");
}
function Hn() {
  var e;
  return typeof window > "u" || typeof document > "u" ? Promise.resolve() : Ve || (e = document.userActivation) != null && e.hasBeenActive ? (Ve = !0, Promise.resolve()) : _e || (_e = new Promise((t) => {
    const n = () => {
      Ve = !0, window.removeEventListener("pointerdown", n, !0), window.removeEventListener("keydown", n, !0), window.removeEventListener("touchstart", n, !0), t();
    };
    window.addEventListener("pointerdown", n, { once: !0, capture: !0 }), window.addEventListener("keydown", n, { once: !0, capture: !0 }), window.addEventListener("touchstart", n, { once: !0, capture: !0 });
  }).finally(() => {
    _e = null;
  }), _e);
}
function Jn(e, t, n) {
  const r = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(e)}&tl=he&client=tw-ob`, i = new Audio(r);
  i.playbackRate = ue, i.onended = t, i.onerror = () => n("audio.onerror"), i.play().catch((s) => {
    n((s == null ? void 0 : s.message) || "audio.play() rejected");
  });
}
function Vn(e) {
  return new Promise((t, n) => {
    const o = Fn(e).trim() || e;
    let r = !1, i = !1;
    const s = () => {
      r || (r = !0, t());
    }, a = (u) => {
      r || (r = !0, n(u));
    }, c = () => {
      try {
        Jn(o, s, (u) => {
          if (!i && Un(u)) {
            i = !0, Hn().then(() => {
              r || c();
            });
            return;
          }
          gt("google", e, u, o), a(u);
        });
      } catch (u) {
        gt("google", e, (u == null ? void 0 : u.message) || "Audio() construction failed", o), a(u == null ? void 0 : u.message);
      }
    };
    c();
  });
}
let Ye = null;
function Wn() {
  const e = speechSynthesis.getVoices();
  return e.find((t) => t.lang === "he-IL") || e.find((t) => t.lang === "iw-IL") || e.find((t) => t.lang.startsWith("he")) || null;
}
function vt() {
  Ye = Wn();
}
typeof speechSynthesis < "u" && (speechSynthesis.getVoices().length > 0 ? vt() : speechSynthesis.addEventListener("voiceschanged", vt, { once: !0 }));
function qn(e) {
  return new Promise((t) => {
    if (typeof speechSynthesis > "u") {
      t();
      return;
    }
    const n = new SpeechSynthesisUtterance(e);
    n.lang = "he-IL", n.rate = ue, Ye && (n.voice = Ye), n.onend = t, n.onerror = t, speechSynthesis.speak(n);
  });
}
async function Xn(e) {
  if (Jt)
    try {
      await Vn(e);
      return;
    } catch {
      console.info("[tts] Falling back to browser Speech API");
    }
  await qn(e);
}
function Ge() {
  if (xe || ce.length === 0) return;
  const e = ce.shift();
  xe = !0, Xn(e.text).then(() => {
    xe = !1, e.resolve(), Ge();
  });
}
const Yn = {
  /**
   * הקרא טקסט עברי
   * משתמש ב-Google Translate TTS לאיכות טובה יותר
   */
  speak(e) {
    const t = Dn(e);
    return new Promise((n) => {
      ce.push({ text: t, resolve: n }), Ge();
    });
  },
  /** עצור את הדיבור הנוכחי */
  cancel() {
    ce.forEach((e) => e.resolve()), ce = [], xe = !1, typeof speechSynthesis < "u" && speechSynthesis.cancel();
  },
  get available() {
    return !0;
  },
  /** הגדר מהירות דיבור (0.5–2.0) */
  setRate(e) {
    ue = Math.max(0.5, Math.min(2, e));
  },
  /** השתמש ב-Google Translate TTS (ברירת מחדל) או בדפדפן */
  useGoogle(e = !0) {
    Jt = e;
  },
  /**
   * הגדר מהירות דיבור להדגשת ניקוד
   * @param {{ rate?: number }} opts
   *   rate: מהירות דיבור להדגשה (ברירת מחדל 0.5)
   */
  setNikudEmphasis({ rate: e } = {}) {
    e != null && (bt = Math.max(0.3, Math.min(1.5, e)));
  },
  /**
   * הקרא אות עם ניקוד באיטיות להדגשת התנועה
   * @param {string} letter - האות (למשל 'ב')
   * @param {string} nikudSymbol - סמל הניקוד (למשל '\u05B7')
   */
  speakNikud(e, t) {
    const n = e + t, o = ue;
    return ue = bt, new Promise((r) => {
      ce.push({ text: n, resolve: r }), Ge();
    }).finally(() => {
      ue = o;
    });
  }
}, yt = {
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
}, Gn = {
  shake: 420,
  bounce: 480,
  pulse: 600,
  fadeIn: 320,
  confetti: 700
};
function Ce(e, t) {
  !e || !yt[t] || e.animate(yt[t], {
    duration: Gn[t] || 400,
    easing: "ease-in-out",
    fill: "none"
  });
}
function Kn(e, t, n, o) {
  Ze.cheer();
  const r = t / n, i = r >= 0.8 ? 3 : r >= 0.5 ? 2 : 1, s = "⭐".repeat(i) + "☆".repeat(3 - i), a = document.createElement("div");
  a.className = "completion-screen", a.innerHTML = `
    <div class="completion-screen__content">
      <div class="completion-screen__stars" aria-label="${i} כּוֹכָבִים">${s}</div>
      <h2 class="completion-screen__title">!כָּל הַכָּבוֹד</h2>
      <p class="completion-screen__score">נִיקּוּד: ${t} מִתּוֹךְ ${n}</p>
      <button class="completion-screen__replay btn btn--primary">שַׂחֵק שׁוּב</button>
    </div>
  `, a.querySelector(".completion-screen__replay").addEventListener("click", () => {
    a.remove(), o();
  }), e.innerHTML = "", e.appendChild(a), Ce(a.querySelector(".completion-screen__content"), "fadeIn");
}
function Zc(e, t, {
  totalRounds: n,
  progressBar: o = null,
  buildRoundUI: r,
  onCorrect: i,
  onWrong: s
}) {
  let a = !1;
  async function c(m) {
    if (a) return;
    a = !0, Ze.correct(), m && await m(), i && await i(), e.state.addScore(1), o == null || o.update(e.state.currentRound), await new Promise((v) => setTimeout(v, 1200)), e.state.nextRound() ? (a = !1, r()) : Kn(t, e.state.score, n, () => {
      location.reload();
    });
  }
  async function u() {
    a || (a = !0, s && await s(), a = !1);
  }
  function l() {
    return a;
  }
  function d() {
    a = !1;
  }
  return { handleCorrect: c, handleWrong: u, isAnswered: l, reset: d };
}
function Vt(e, t) {
  const n = [];
  function o() {
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
    } catch (c) {
      console.warn(`[createLocalState] שגיאה בשמירת "${e}":`, c);
    }
    n.forEach((c) => c(a));
  }
  function i(a) {
    r(a(o()));
  }
  function s(a) {
    return n.push(a), function() {
      const u = n.indexOf(a);
      u !== -1 && n.splice(u, 1);
    };
  }
  return { get: o, set: r, update: i, subscribe: s };
}
function Qn(e, t = "טוֹעֵן...") {
  e.innerHTML = `<div class="ab-loading">${t}</div>`;
}
function eo(e) {
  e.innerHTML = "";
}
let to = 0;
function We() {
  return `round-${Date.now()}-${to++}`;
}
class we {
  // redo stack
  constructor(t) {
    this._id = t.id ?? "game", this._version = t.version ?? 1, this._meta = { title: "", type: "multiple-choice", ...t.meta ?? {} }, this._rounds = (t.rounds ?? []).map((n) => ({ ...n, id: n.id || We() })), this._distractors = t.distractors ?? [], this._handlers = [], this._past = [], this._future = [];
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
    const o = this.getRoundIndex(t);
    o !== -1 && (this._saveHistory(), this._rounds[o] = { ...this._rounds[o], ...n }, this._emit());
  }
  addRound(t = null) {
    this._saveHistory();
    const n = { id: We(), target: "", correct: "", correctEmoji: "❓" };
    if (t === null)
      this._rounds.push(n);
    else {
      const o = this.getRoundIndex(t);
      this._rounds.splice(o + 1, 0, n);
    }
    return this._emit(), n.id;
  }
  duplicateRound(t) {
    const n = this.getRound(t);
    if (!n) return null;
    this._saveHistory();
    const o = { ...n, id: We() };
    return this._rounds.splice(this.getRoundIndex(t) + 1, 0, o), this._emit(), o.id;
  }
  removeRound(t) {
    const n = this.getRoundIndex(t);
    n === -1 || this._rounds.length <= 1 || (this._saveHistory(), this._rounds.splice(n, 1), this._emit());
  }
  moveRound(t, n) {
    const o = this.getRoundIndex(t);
    if (o === -1) return;
    this._saveHistory();
    const [r] = this._rounds.splice(o, 1);
    this._rounds.splice(Math.max(0, Math.min(n, this._rounds.length)), 0, r), this._emit();
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
  static fromJSON(t) {
    return new we(t);
  }
  static fromRoundsArray(t, n, o = {}, r = []) {
    return new we({ id: t, meta: o, rounds: n, distractors: r });
  }
}
const Wt = "alefbet.editor.";
function qt(e) {
  return Vt(`${Wt}${e}`, null);
}
function no(e) {
  qt(e.id).set(e.toJSON());
}
function oo(e) {
  const t = qt(e).get();
  if (!t) return null;
  try {
    return we.fromJSON(t);
  } catch {
    return null;
  }
}
function Ic(e) {
  try {
    localStorage.removeItem(`${Wt}${e}`);
  } catch {
  }
}
function ro(e) {
  const t = JSON.stringify(e.toJSON(), null, 2), n = new Blob([t], { type: "application/json;charset=utf-8" }), o = URL.createObjectURL(n), r = document.createElement("a");
  r.href = o, r.download = `${e.id}-rounds.json`, r.click(), URL.revokeObjectURL(o);
}
function io(e, { onClick: t } = {}) {
  const n = document.createElement("div");
  n.className = "ab-editor-overlay", t && n.addEventListener("pointerdown", t);
  function o() {
    n.parentElement || (e.style.position = "relative", e.appendChild(n));
  }
  function r() {
    n.remove();
  }
  function i() {
    r();
  }
  return { show: o, hide: r, destroy: i };
}
let ae = null, G = null, Ke = 0, Qe = 0;
const Ie = /* @__PURE__ */ new Map();
function wt(e, t) {
  var n;
  return ((n = document.elementFromPoint(e, t)) == null ? void 0 : n.closest('[data-drop-target="true"]')) || null;
}
function so(e, t, n) {
  const o = e.getBoundingClientRect();
  Ke = o.width / 2, Qe = o.height / 2, G = e.cloneNode(!0), Object.assign(G.style, {
    position: "fixed",
    left: `${t - Ke}px`,
    top: `${n - Qe}px`,
    width: `${o.width}px`,
    height: `${o.height}px`,
    pointerEvents: "none",
    // keeps it out of elementFromPoint + hit-testing
    zIndex: "9999",
    opacity: "0.85",
    transform: "scale(1.12)",
    cursor: "grabbing",
    margin: "0"
  }), document.body.appendChild(G);
}
function ao(e, t) {
  G && (G.style.left = `${e - Ke}px`, G.style.top = `${t - Qe}px`);
}
function co() {
  G == null || G.remove(), G = null;
}
let K = null;
function uo(e) {
  K !== e && (K == null || K.classList.remove("drop-target--hover"), K = e, e == null || e.classList.add("drop-target--hover"));
}
function lo() {
  K == null || K.classList.remove("drop-target--hover"), K = null;
}
function ho(e, t) {
  e.classList.add("drag-source");
  let n = null, o = null, r = null;
  function i() {
    n && (e.removeEventListener("pointermove", n), e.removeEventListener("pointerup", o), e.removeEventListener("pointercancel", r), n = o = r = null), lo(), co(), e.classList.remove("drag-source--dragging"), ae = null;
  }
  function s(a) {
    a.button !== void 0 && a.button !== 0 || (a.preventDefault(), ae && i(), ae = { el: e, data: t }, e.classList.add("drag-source--dragging"), so(e, a.clientX, a.clientY), e.setPointerCapture(a.pointerId), n = (c) => {
      ao(c.clientX, c.clientY), uo(wt(c.clientX, c.clientY));
    }, o = (c) => {
      const u = wt(c.clientX, c.clientY);
      i(), u && Ie.has(u) && Ie.get(u).onDrop({ data: t, sourceEl: e, targetEl: u });
    }, r = () => i(), e.addEventListener("pointermove", n), e.addEventListener("pointerup", o), e.addEventListener("pointercancel", r));
  }
  return e.addEventListener("pointerdown", s), {
    destroy() {
      e.removeEventListener("pointerdown", s), (ae == null ? void 0 : ae.el) === e && i(), e.classList.remove("drag-source");
    }
  };
}
function po(e, t) {
  return e.setAttribute("data-drop-target", "true"), e.classList.add("drop-target--active"), Ie.set(e, { onDrop: t }), {
    destroy() {
      e.removeAttribute("data-drop-target"), e.classList.remove("drop-target--active", "drop-target--hover"), Ie.delete(e);
    }
  };
}
function fo(e, t, { onSelectRound: n, onAddRound: o, onDuplicateRound: r, onMoveRound: i }) {
  const s = document.createElement("div");
  s.className = "ab-editor-nav", s.setAttribute("aria-label", "ניווט סיבובים");
  const a = document.createElement("div");
  a.className = "ab-editor-nav__header", a.textContent = "סיבובים", s.appendChild(a);
  const c = document.createElement("div");
  c.className = "ab-editor-nav__list", s.appendChild(c);
  const u = document.createElement("button");
  u.className = "ab-editor-nav__add", u.textContent = "+ הוסף", u.addEventListener("click", () => o(null)), s.appendChild(u), e.appendChild(s);
  let l = null, d = [];
  function m() {
    d.forEach(($) => $.destroy()), d = [];
  }
  function f($, N) {
    const _ = document.createElement("div");
    _.className = "ab-editor-nav__thumb", $.id === l && _.classList.add("ab-editor-nav__thumb--active"), _.setAttribute("role", "button"), _.setAttribute("tabindex", "0"), _.setAttribute("aria-label", `סיבוב ${N + 1}`), _.dataset.roundId = $.id, $.image && (_.style.backgroundImage = `url(${$.image})`, _.classList.add("ab-editor-nav__thumb--has-img"));
    const E = document.createElement("div");
    E.className = "ab-editor-nav__grip", E.innerHTML = "⠿", E.setAttribute("aria-hidden", "true"), E.title = "גרור לשינוי סדר", _.appendChild(E);
    const g = document.createElement("div");
    if (g.className = "ab-editor-nav__num", g.textContent = String(N + 1), _.appendChild(g), $.correctEmoji && !$.image) {
      const z = document.createElement("div");
      z.className = "ab-editor-nav__emoji", z.textContent = $.correctEmoji, _.appendChild(z);
    }
    if ($.target) {
      const z = document.createElement("div");
      z.className = "ab-editor-nav__letter", z.textContent = $.target, _.appendChild(z);
    }
    const T = document.createElement("button");
    return T.className = "ab-editor-nav__dup", T.innerHTML = "⧉", T.title = "שכפל סיבוב", T.setAttribute("aria-label", "שכפל סיבוב"), T.addEventListener("click", (z) => {
      z.stopPropagation(), r($.id);
    }), _.appendChild(T), _.addEventListener("click", () => n($.id)), _.addEventListener("keydown", (z) => {
      (z.key === "Enter" || z.key === " ") && (z.preventDefault(), n($.id));
    }), d.push(ho(E, { roundId: $.id })), d.push(po(_, ({ data: z }) => {
      z.roundId !== $.id && i(z.roundId, t.getRoundIndex($.id));
    })), _;
  }
  function v() {
    m(), c.innerHTML = "", t.rounds.forEach(($, N) => c.appendChild(f($, N)));
  }
  function b($) {
    l = $, c.querySelectorAll(".ab-editor-nav__thumb").forEach((N) => {
      N.classList.toggle("ab-editor-nav__thumb--active", N.dataset.roundId === $);
    });
  }
  function C() {
    m(), s.remove();
  }
  return v(), { refresh: v, setActiveRound: b, destroy: C };
}
function h(e, t, n) {
  function o(a, c) {
    if (a._zod || Object.defineProperty(a, "_zod", {
      value: {
        def: c,
        constr: s,
        traits: /* @__PURE__ */ new Set()
      },
      enumerable: !1
    }), a._zod.traits.has(e))
      return;
    a._zod.traits.add(e), t(a, c);
    const u = s.prototype, l = Object.keys(u);
    for (let d = 0; d < l.length; d++) {
      const m = l[d];
      m in a || (a[m] = u[m].bind(a));
    }
  }
  const r = (n == null ? void 0 : n.Parent) ?? Object;
  class i extends r {
  }
  Object.defineProperty(i, "name", { value: e });
  function s(a) {
    var c;
    const u = n != null && n.Parent ? new i() : this;
    o(u, a), (c = u._zod).deferred ?? (c.deferred = []);
    for (const l of u._zod.deferred)
      l();
    return u;
  }
  return Object.defineProperty(s, "init", { value: o }), Object.defineProperty(s, Symbol.hasInstance, {
    value: (a) => {
      var c, u;
      return n != null && n.Parent && a instanceof n.Parent ? !0 : (u = (c = a == null ? void 0 : a._zod) == null ? void 0 : c.traits) == null ? void 0 : u.has(e);
    }
  }), Object.defineProperty(s, "name", { value: e }), s;
}
class he extends Error {
  constructor() {
    super("Encountered Promise during synchronous parse. Use .parseAsync() instead.");
  }
}
class Xt extends Error {
  constructor(t) {
    super(`Encountered unidirectional transform during encode: ${t}`), this.name = "ZodEncodeError";
  }
}
const Yt = {};
function ee(e) {
  return Yt;
}
function Gt(e) {
  const t = Object.values(e).filter((o) => typeof o == "number");
  return Object.entries(e).filter(([o, r]) => t.indexOf(+o) === -1).map(([o, r]) => r);
}
function et(e, t) {
  return typeof t == "bigint" ? t.toString() : t;
}
function ot(e) {
  return {
    get value() {
      {
        const t = e();
        return Object.defineProperty(this, "value", { value: t }), t;
      }
    }
  };
}
function rt(e) {
  return e == null;
}
function it(e) {
  const t = e.startsWith("^") ? 1 : 0, n = e.endsWith("$") ? e.length - 1 : e.length;
  return e.slice(t, n);
}
function mo(e, t) {
  const n = (e.toString().split(".")[1] || "").length, o = t.toString();
  let r = (o.split(".")[1] || "").length;
  if (r === 0 && /\d?e-\d?/.test(o)) {
    const c = o.match(/\d?e-(\d?)/);
    c != null && c[1] && (r = Number.parseInt(c[1]));
  }
  const i = n > r ? n : r, s = Number.parseInt(e.toFixed(i).replace(".", "")), a = Number.parseInt(t.toFixed(i).replace(".", ""));
  return s % a / 10 ** i;
}
const kt = Symbol("evaluating");
function R(e, t, n) {
  let o;
  Object.defineProperty(e, t, {
    get() {
      if (o !== kt)
        return o === void 0 && (o = kt, o = n()), o;
    },
    set(r) {
      Object.defineProperty(e, t, {
        value: r
        // configurable: true,
      });
    },
    configurable: !0
  });
}
function ie(e, t, n) {
  Object.defineProperty(e, t, {
    value: n,
    writable: !0,
    enumerable: !0,
    configurable: !0
  });
}
function ne(...e) {
  const t = {};
  for (const n of e) {
    const o = Object.getOwnPropertyDescriptors(n);
    Object.assign(t, o);
  }
  return Object.defineProperties({}, t);
}
function Et(e) {
  return JSON.stringify(e);
}
function _o(e) {
  return e.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
const Kt = "captureStackTrace" in Error ? Error.captureStackTrace : (...e) => {
};
function Re(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
const bo = ot(() => {
  var e;
  if (typeof navigator < "u" && ((e = navigator == null ? void 0 : navigator.userAgent) != null && e.includes("Cloudflare")))
    return !1;
  try {
    const t = Function;
    return new t(""), !0;
  } catch {
    return !1;
  }
});
function pe(e) {
  if (Re(e) === !1)
    return !1;
  const t = e.constructor;
  if (t === void 0 || typeof t != "function")
    return !0;
  const n = t.prototype;
  return !(Re(n) === !1 || Object.prototype.hasOwnProperty.call(n, "isPrototypeOf") === !1);
}
function Qt(e) {
  return pe(e) ? { ...e } : Array.isArray(e) ? [...e] : e;
}
const go = /* @__PURE__ */ new Set(["string", "number", "symbol"]);
function De(e) {
  return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function oe(e, t, n) {
  const o = new e._zod.constr(t ?? e._zod.def);
  return (!t || n != null && n.parent) && (o._zod.parent = e), o;
}
function k(e) {
  const t = e;
  if (!t)
    return {};
  if (typeof t == "string")
    return { error: () => t };
  if ((t == null ? void 0 : t.message) !== void 0) {
    if ((t == null ? void 0 : t.error) !== void 0)
      throw new Error("Cannot specify both `message` and `error` params");
    t.error = t.message;
  }
  return delete t.message, typeof t.error == "string" ? { ...t, error: () => t.error } : t;
}
function vo(e) {
  return Object.keys(e).filter((t) => e[t]._zod.optin === "optional" && e[t]._zod.optout === "optional");
}
const yo = {
  safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
  int32: [-2147483648, 2147483647],
  uint32: [0, 4294967295],
  float32: [-34028234663852886e22, 34028234663852886e22],
  float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
};
function wo(e, t) {
  const n = e._zod.def, o = n.checks;
  if (o && o.length > 0)
    throw new Error(".pick() cannot be used on object schemas containing refinements");
  const i = ne(e._zod.def, {
    get shape() {
      const s = {};
      for (const a in t) {
        if (!(a in n.shape))
          throw new Error(`Unrecognized key: "${a}"`);
        t[a] && (s[a] = n.shape[a]);
      }
      return ie(this, "shape", s), s;
    },
    checks: []
  });
  return oe(e, i);
}
function ko(e, t) {
  const n = e._zod.def, o = n.checks;
  if (o && o.length > 0)
    throw new Error(".omit() cannot be used on object schemas containing refinements");
  const i = ne(e._zod.def, {
    get shape() {
      const s = { ...e._zod.def.shape };
      for (const a in t) {
        if (!(a in n.shape))
          throw new Error(`Unrecognized key: "${a}"`);
        t[a] && delete s[a];
      }
      return ie(this, "shape", s), s;
    },
    checks: []
  });
  return oe(e, i);
}
function Eo(e, t) {
  if (!pe(t))
    throw new Error("Invalid input to extend: expected a plain object");
  const n = e._zod.def.checks;
  if (n && n.length > 0) {
    const i = e._zod.def.shape;
    for (const s in t)
      if (Object.getOwnPropertyDescriptor(i, s) !== void 0)
        throw new Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
  }
  const r = ne(e._zod.def, {
    get shape() {
      const i = { ...e._zod.def.shape, ...t };
      return ie(this, "shape", i), i;
    }
  });
  return oe(e, r);
}
function zo(e, t) {
  if (!pe(t))
    throw new Error("Invalid input to safeExtend: expected a plain object");
  const n = ne(e._zod.def, {
    get shape() {
      const o = { ...e._zod.def.shape, ...t };
      return ie(this, "shape", o), o;
    }
  });
  return oe(e, n);
}
function $o(e, t) {
  const n = ne(e._zod.def, {
    get shape() {
      const o = { ...e._zod.def.shape, ...t._zod.def.shape };
      return ie(this, "shape", o), o;
    },
    get catchall() {
      return t._zod.def.catchall;
    },
    checks: []
    // delete existing checks
  });
  return oe(e, n);
}
function So(e, t, n) {
  const r = t._zod.def.checks;
  if (r && r.length > 0)
    throw new Error(".partial() cannot be used on object schemas containing refinements");
  const s = ne(t._zod.def, {
    get shape() {
      const a = t._zod.def.shape, c = { ...a };
      if (n)
        for (const u in n) {
          if (!(u in a))
            throw new Error(`Unrecognized key: "${u}"`);
          n[u] && (c[u] = e ? new e({
            type: "optional",
            innerType: a[u]
          }) : a[u]);
        }
      else
        for (const u in a)
          c[u] = e ? new e({
            type: "optional",
            innerType: a[u]
          }) : a[u];
      return ie(this, "shape", c), c;
    },
    checks: []
  });
  return oe(t, s);
}
function No(e, t, n) {
  const o = ne(t._zod.def, {
    get shape() {
      const r = t._zod.def.shape, i = { ...r };
      if (n)
        for (const s in n) {
          if (!(s in i))
            throw new Error(`Unrecognized key: "${s}"`);
          n[s] && (i[s] = new e({
            type: "nonoptional",
            innerType: r[s]
          }));
        }
      else
        for (const s in r)
          i[s] = new e({
            type: "nonoptional",
            innerType: r[s]
          });
      return ie(this, "shape", i), i;
    }
  });
  return oe(t, o);
}
function le(e, t = 0) {
  var n;
  if (e.aborted === !0)
    return !0;
  for (let o = t; o < e.issues.length; o++)
    if (((n = e.issues[o]) == null ? void 0 : n.continue) !== !0)
      return !0;
  return !1;
}
function de(e, t) {
  return t.map((n) => {
    var o;
    return (o = n).path ?? (o.path = []), n.path.unshift(e), n;
  });
}
function $e(e) {
  return typeof e == "string" ? e : e == null ? void 0 : e.message;
}
function te(e, t, n) {
  var r, i, s, a, c, u;
  const o = { ...e, path: e.path ?? [] };
  if (!e.message) {
    const l = $e((s = (i = (r = e.inst) == null ? void 0 : r._zod.def) == null ? void 0 : i.error) == null ? void 0 : s.call(i, e)) ?? $e((a = t == null ? void 0 : t.error) == null ? void 0 : a.call(t, e)) ?? $e((c = n.customError) == null ? void 0 : c.call(n, e)) ?? $e((u = n.localeError) == null ? void 0 : u.call(n, e)) ?? "Invalid input";
    o.message = l;
  }
  return delete o.inst, delete o.continue, t != null && t.reportInput || delete o.input, o;
}
function st(e) {
  return Array.isArray(e) ? "array" : typeof e == "string" ? "string" : "unknown";
}
function ke(...e) {
  const [t, n, o] = e;
  return typeof t == "string" ? {
    message: t,
    code: "custom",
    input: n,
    inst: o
  } : { ...t };
}
const en = (e, t) => {
  e.name = "$ZodError", Object.defineProperty(e, "_zod", {
    value: e._zod,
    enumerable: !1
  }), Object.defineProperty(e, "issues", {
    value: t,
    enumerable: !1
  }), e.message = JSON.stringify(t, et, 2), Object.defineProperty(e, "toString", {
    value: () => e.message,
    enumerable: !1
  });
}, tn = h("$ZodError", en), nn = h("$ZodError", en, { Parent: Error });
function xo(e, t = (n) => n.message) {
  const n = {}, o = [];
  for (const r of e.issues)
    r.path.length > 0 ? (n[r.path[0]] = n[r.path[0]] || [], n[r.path[0]].push(t(r))) : o.push(t(r));
  return { formErrors: o, fieldErrors: n };
}
function Co(e, t = (n) => n.message) {
  const n = { _errors: [] }, o = (r) => {
    for (const i of r.issues)
      if (i.code === "invalid_union" && i.errors.length)
        i.errors.map((s) => o({ issues: s }));
      else if (i.code === "invalid_key")
        o({ issues: i.issues });
      else if (i.code === "invalid_element")
        o({ issues: i.issues });
      else if (i.path.length === 0)
        n._errors.push(t(i));
      else {
        let s = n, a = 0;
        for (; a < i.path.length; ) {
          const c = i.path[a];
          a === i.path.length - 1 ? (s[c] = s[c] || { _errors: [] }, s[c]._errors.push(t(i))) : s[c] = s[c] || { _errors: [] }, s = s[c], a++;
        }
      }
  };
  return o(e), n;
}
const at = (e) => (t, n, o, r) => {
  const i = o ? Object.assign(o, { async: !1 }) : { async: !1 }, s = t._zod.run({ value: n, issues: [] }, i);
  if (s instanceof Promise)
    throw new he();
  if (s.issues.length) {
    const a = new ((r == null ? void 0 : r.Err) ?? e)(s.issues.map((c) => te(c, i, ee())));
    throw Kt(a, r == null ? void 0 : r.callee), a;
  }
  return s.value;
}, ct = (e) => async (t, n, o, r) => {
  const i = o ? Object.assign(o, { async: !0 }) : { async: !0 };
  let s = t._zod.run({ value: n, issues: [] }, i);
  if (s instanceof Promise && (s = await s), s.issues.length) {
    const a = new ((r == null ? void 0 : r.Err) ?? e)(s.issues.map((c) => te(c, i, ee())));
    throw Kt(a, r == null ? void 0 : r.callee), a;
  }
  return s.value;
}, Be = (e) => (t, n, o) => {
  const r = o ? { ...o, async: !1 } : { async: !1 }, i = t._zod.run({ value: n, issues: [] }, r);
  if (i instanceof Promise)
    throw new he();
  return i.issues.length ? {
    success: !1,
    error: new (e ?? tn)(i.issues.map((s) => te(s, r, ee())))
  } : { success: !0, data: i.value };
}, To = /* @__PURE__ */ Be(nn), Fe = (e) => async (t, n, o) => {
  const r = o ? Object.assign(o, { async: !0 }) : { async: !0 };
  let i = t._zod.run({ value: n, issues: [] }, r);
  return i instanceof Promise && (i = await i), i.issues.length ? {
    success: !1,
    error: new e(i.issues.map((s) => te(s, r, ee())))
  } : { success: !0, data: i.value };
}, Zo = /* @__PURE__ */ Fe(nn), Io = (e) => (t, n, o) => {
  const r = o ? Object.assign(o, { direction: "backward" }) : { direction: "backward" };
  return at(e)(t, n, r);
}, Ro = (e) => (t, n, o) => at(e)(t, n, o), Lo = (e) => async (t, n, o) => {
  const r = o ? Object.assign(o, { direction: "backward" }) : { direction: "backward" };
  return ct(e)(t, n, r);
}, Ao = (e) => async (t, n, o) => ct(e)(t, n, o), Po = (e) => (t, n, o) => {
  const r = o ? Object.assign(o, { direction: "backward" }) : { direction: "backward" };
  return Be(e)(t, n, r);
}, Oo = (e) => (t, n, o) => Be(e)(t, n, o), jo = (e) => async (t, n, o) => {
  const r = o ? Object.assign(o, { direction: "backward" }) : { direction: "backward" };
  return Fe(e)(t, n, r);
}, Mo = (e) => async (t, n, o) => Fe(e)(t, n, o), Do = /^[cC][^\s-]{8,}$/, Bo = /^[0-9a-z]+$/, Fo = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/, Uo = /^[0-9a-vA-V]{20}$/, Ho = /^[A-Za-z0-9]{27}$/, Jo = /^[a-zA-Z0-9_-]{21}$/, Vo = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/, Wo = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/, zt = (e) => e ? new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${e}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`) : /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/, qo = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/, Xo = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
function Yo() {
  return new RegExp(Xo, "u");
}
const Go = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, Ko = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/, Qo = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/, er = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, tr = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/, on = /^[A-Za-z0-9_-]*$/, nr = /^\+[1-9]\d{6,14}$/, rn = "(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))", or = /* @__PURE__ */ new RegExp(`^${rn}$`);
function sn(e) {
  const t = "(?:[01]\\d|2[0-3]):[0-5]\\d";
  return typeof e.precision == "number" ? e.precision === -1 ? `${t}` : e.precision === 0 ? `${t}:[0-5]\\d` : `${t}:[0-5]\\d\\.\\d{${e.precision}}` : `${t}(?::[0-5]\\d(?:\\.\\d+)?)?`;
}
function rr(e) {
  return new RegExp(`^${sn(e)}$`);
}
function ir(e) {
  const t = sn({ precision: e.precision }), n = ["Z"];
  e.local && n.push(""), e.offset && n.push("([+-](?:[01]\\d|2[0-3]):[0-5]\\d)");
  const o = `${t}(?:${n.join("|")})`;
  return new RegExp(`^${rn}T(?:${o})$`);
}
const sr = (e) => {
  const t = e ? `[\\s\\S]{${(e == null ? void 0 : e.minimum) ?? 0},${(e == null ? void 0 : e.maximum) ?? ""}}` : "[\\s\\S]*";
  return new RegExp(`^${t}$`);
}, ar = /^-?\d+$/, an = /^-?\d+(?:\.\d+)?$/, cr = /^(?:true|false)$/i, ur = /^[^A-Z]*$/, lr = /^[^a-z]*$/, V = /* @__PURE__ */ h("$ZodCheck", (e, t) => {
  var n;
  e._zod ?? (e._zod = {}), e._zod.def = t, (n = e._zod).onattach ?? (n.onattach = []);
}), cn = {
  number: "number",
  bigint: "bigint",
  object: "date"
}, un = /* @__PURE__ */ h("$ZodCheckLessThan", (e, t) => {
  V.init(e, t);
  const n = cn[typeof t.value];
  e._zod.onattach.push((o) => {
    const r = o._zod.bag, i = (t.inclusive ? r.maximum : r.exclusiveMaximum) ?? Number.POSITIVE_INFINITY;
    t.value < i && (t.inclusive ? r.maximum = t.value : r.exclusiveMaximum = t.value);
  }), e._zod.check = (o) => {
    (t.inclusive ? o.value <= t.value : o.value < t.value) || o.issues.push({
      origin: n,
      code: "too_big",
      maximum: typeof t.value == "object" ? t.value.getTime() : t.value,
      input: o.value,
      inclusive: t.inclusive,
      inst: e,
      continue: !t.abort
    });
  };
}), ln = /* @__PURE__ */ h("$ZodCheckGreaterThan", (e, t) => {
  V.init(e, t);
  const n = cn[typeof t.value];
  e._zod.onattach.push((o) => {
    const r = o._zod.bag, i = (t.inclusive ? r.minimum : r.exclusiveMinimum) ?? Number.NEGATIVE_INFINITY;
    t.value > i && (t.inclusive ? r.minimum = t.value : r.exclusiveMinimum = t.value);
  }), e._zod.check = (o) => {
    (t.inclusive ? o.value >= t.value : o.value > t.value) || o.issues.push({
      origin: n,
      code: "too_small",
      minimum: typeof t.value == "object" ? t.value.getTime() : t.value,
      input: o.value,
      inclusive: t.inclusive,
      inst: e,
      continue: !t.abort
    });
  };
}), dr = /* @__PURE__ */ h("$ZodCheckMultipleOf", (e, t) => {
  V.init(e, t), e._zod.onattach.push((n) => {
    var o;
    (o = n._zod.bag).multipleOf ?? (o.multipleOf = t.value);
  }), e._zod.check = (n) => {
    if (typeof n.value != typeof t.value)
      throw new Error("Cannot mix number and bigint in multiple_of check.");
    (typeof n.value == "bigint" ? n.value % t.value === BigInt(0) : mo(n.value, t.value) === 0) || n.issues.push({
      origin: typeof n.value,
      code: "not_multiple_of",
      divisor: t.value,
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), hr = /* @__PURE__ */ h("$ZodCheckNumberFormat", (e, t) => {
  var s;
  V.init(e, t), t.format = t.format || "float64";
  const n = (s = t.format) == null ? void 0 : s.includes("int"), o = n ? "int" : "number", [r, i] = yo[t.format];
  e._zod.onattach.push((a) => {
    const c = a._zod.bag;
    c.format = t.format, c.minimum = r, c.maximum = i, n && (c.pattern = ar);
  }), e._zod.check = (a) => {
    const c = a.value;
    if (n) {
      if (!Number.isInteger(c)) {
        a.issues.push({
          expected: o,
          format: t.format,
          code: "invalid_type",
          continue: !1,
          input: c,
          inst: e
        });
        return;
      }
      if (!Number.isSafeInteger(c)) {
        c > 0 ? a.issues.push({
          input: c,
          code: "too_big",
          maximum: Number.MAX_SAFE_INTEGER,
          note: "Integers must be within the safe integer range.",
          inst: e,
          origin: o,
          inclusive: !0,
          continue: !t.abort
        }) : a.issues.push({
          input: c,
          code: "too_small",
          minimum: Number.MIN_SAFE_INTEGER,
          note: "Integers must be within the safe integer range.",
          inst: e,
          origin: o,
          inclusive: !0,
          continue: !t.abort
        });
        return;
      }
    }
    c < r && a.issues.push({
      origin: "number",
      input: c,
      code: "too_small",
      minimum: r,
      inclusive: !0,
      inst: e,
      continue: !t.abort
    }), c > i && a.issues.push({
      origin: "number",
      input: c,
      code: "too_big",
      maximum: i,
      inclusive: !0,
      inst: e,
      continue: !t.abort
    });
  };
}), pr = /* @__PURE__ */ h("$ZodCheckMaxLength", (e, t) => {
  var n;
  V.init(e, t), (n = e._zod.def).when ?? (n.when = (o) => {
    const r = o.value;
    return !rt(r) && r.length !== void 0;
  }), e._zod.onattach.push((o) => {
    const r = o._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
    t.maximum < r && (o._zod.bag.maximum = t.maximum);
  }), e._zod.check = (o) => {
    const r = o.value;
    if (r.length <= t.maximum)
      return;
    const s = st(r);
    o.issues.push({
      origin: s,
      code: "too_big",
      maximum: t.maximum,
      inclusive: !0,
      input: r,
      inst: e,
      continue: !t.abort
    });
  };
}), fr = /* @__PURE__ */ h("$ZodCheckMinLength", (e, t) => {
  var n;
  V.init(e, t), (n = e._zod.def).when ?? (n.when = (o) => {
    const r = o.value;
    return !rt(r) && r.length !== void 0;
  }), e._zod.onattach.push((o) => {
    const r = o._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
    t.minimum > r && (o._zod.bag.minimum = t.minimum);
  }), e._zod.check = (o) => {
    const r = o.value;
    if (r.length >= t.minimum)
      return;
    const s = st(r);
    o.issues.push({
      origin: s,
      code: "too_small",
      minimum: t.minimum,
      inclusive: !0,
      input: r,
      inst: e,
      continue: !t.abort
    });
  };
}), mr = /* @__PURE__ */ h("$ZodCheckLengthEquals", (e, t) => {
  var n;
  V.init(e, t), (n = e._zod.def).when ?? (n.when = (o) => {
    const r = o.value;
    return !rt(r) && r.length !== void 0;
  }), e._zod.onattach.push((o) => {
    const r = o._zod.bag;
    r.minimum = t.length, r.maximum = t.length, r.length = t.length;
  }), e._zod.check = (o) => {
    const r = o.value, i = r.length;
    if (i === t.length)
      return;
    const s = st(r), a = i > t.length;
    o.issues.push({
      origin: s,
      ...a ? { code: "too_big", maximum: t.length } : { code: "too_small", minimum: t.length },
      inclusive: !0,
      exact: !0,
      input: o.value,
      inst: e,
      continue: !t.abort
    });
  };
}), Ue = /* @__PURE__ */ h("$ZodCheckStringFormat", (e, t) => {
  var n, o;
  V.init(e, t), e._zod.onattach.push((r) => {
    const i = r._zod.bag;
    i.format = t.format, t.pattern && (i.patterns ?? (i.patterns = /* @__PURE__ */ new Set()), i.patterns.add(t.pattern));
  }), t.pattern ? (n = e._zod).check ?? (n.check = (r) => {
    t.pattern.lastIndex = 0, !t.pattern.test(r.value) && r.issues.push({
      origin: "string",
      code: "invalid_format",
      format: t.format,
      input: r.value,
      ...t.pattern ? { pattern: t.pattern.toString() } : {},
      inst: e,
      continue: !t.abort
    });
  }) : (o = e._zod).check ?? (o.check = () => {
  });
}), _r = /* @__PURE__ */ h("$ZodCheckRegex", (e, t) => {
  Ue.init(e, t), e._zod.check = (n) => {
    t.pattern.lastIndex = 0, !t.pattern.test(n.value) && n.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "regex",
      input: n.value,
      pattern: t.pattern.toString(),
      inst: e,
      continue: !t.abort
    });
  };
}), br = /* @__PURE__ */ h("$ZodCheckLowerCase", (e, t) => {
  t.pattern ?? (t.pattern = ur), Ue.init(e, t);
}), gr = /* @__PURE__ */ h("$ZodCheckUpperCase", (e, t) => {
  t.pattern ?? (t.pattern = lr), Ue.init(e, t);
}), vr = /* @__PURE__ */ h("$ZodCheckIncludes", (e, t) => {
  V.init(e, t);
  const n = De(t.includes), o = new RegExp(typeof t.position == "number" ? `^.{${t.position}}${n}` : n);
  t.pattern = o, e._zod.onattach.push((r) => {
    const i = r._zod.bag;
    i.patterns ?? (i.patterns = /* @__PURE__ */ new Set()), i.patterns.add(o);
  }), e._zod.check = (r) => {
    r.value.includes(t.includes, t.position) || r.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "includes",
      includes: t.includes,
      input: r.value,
      inst: e,
      continue: !t.abort
    });
  };
}), yr = /* @__PURE__ */ h("$ZodCheckStartsWith", (e, t) => {
  V.init(e, t);
  const n = new RegExp(`^${De(t.prefix)}.*`);
  t.pattern ?? (t.pattern = n), e._zod.onattach.push((o) => {
    const r = o._zod.bag;
    r.patterns ?? (r.patterns = /* @__PURE__ */ new Set()), r.patterns.add(n);
  }), e._zod.check = (o) => {
    o.value.startsWith(t.prefix) || o.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "starts_with",
      prefix: t.prefix,
      input: o.value,
      inst: e,
      continue: !t.abort
    });
  };
}), wr = /* @__PURE__ */ h("$ZodCheckEndsWith", (e, t) => {
  V.init(e, t);
  const n = new RegExp(`.*${De(t.suffix)}$`);
  t.pattern ?? (t.pattern = n), e._zod.onattach.push((o) => {
    const r = o._zod.bag;
    r.patterns ?? (r.patterns = /* @__PURE__ */ new Set()), r.patterns.add(n);
  }), e._zod.check = (o) => {
    o.value.endsWith(t.suffix) || o.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "ends_with",
      suffix: t.suffix,
      input: o.value,
      inst: e,
      continue: !t.abort
    });
  };
}), kr = /* @__PURE__ */ h("$ZodCheckOverwrite", (e, t) => {
  V.init(e, t), e._zod.check = (n) => {
    n.value = t.tx(n.value);
  };
});
class Er {
  constructor(t = []) {
    this.content = [], this.indent = 0, this && (this.args = t);
  }
  indented(t) {
    this.indent += 1, t(this), this.indent -= 1;
  }
  write(t) {
    if (typeof t == "function") {
      t(this, { execution: "sync" }), t(this, { execution: "async" });
      return;
    }
    const o = t.split(`
`).filter((s) => s), r = Math.min(...o.map((s) => s.length - s.trimStart().length)), i = o.map((s) => s.slice(r)).map((s) => " ".repeat(this.indent * 2) + s);
    for (const s of i)
      this.content.push(s);
  }
  compile() {
    const t = Function, n = this == null ? void 0 : this.args, r = [...((this == null ? void 0 : this.content) ?? [""]).map((i) => `  ${i}`)];
    return new t(...n, r.join(`
`));
  }
}
const zr = {
  major: 4,
  minor: 3,
  patch: 6
}, O = /* @__PURE__ */ h("$ZodType", (e, t) => {
  var r;
  var n;
  e ?? (e = {}), e._zod.def = t, e._zod.bag = e._zod.bag || {}, e._zod.version = zr;
  const o = [...e._zod.def.checks ?? []];
  e._zod.traits.has("$ZodCheck") && o.unshift(e);
  for (const i of o)
    for (const s of i._zod.onattach)
      s(e);
  if (o.length === 0)
    (n = e._zod).deferred ?? (n.deferred = []), (r = e._zod.deferred) == null || r.push(() => {
      e._zod.run = e._zod.parse;
    });
  else {
    const i = (a, c, u) => {
      let l = le(a), d;
      for (const m of c) {
        if (m._zod.def.when) {
          if (!m._zod.def.when(a))
            continue;
        } else if (l)
          continue;
        const f = a.issues.length, v = m._zod.check(a);
        if (v instanceof Promise && (u == null ? void 0 : u.async) === !1)
          throw new he();
        if (d || v instanceof Promise)
          d = (d ?? Promise.resolve()).then(async () => {
            await v, a.issues.length !== f && (l || (l = le(a, f)));
          });
        else {
          if (a.issues.length === f)
            continue;
          l || (l = le(a, f));
        }
      }
      return d ? d.then(() => a) : a;
    }, s = (a, c, u) => {
      if (le(a))
        return a.aborted = !0, a;
      const l = i(c, o, u);
      if (l instanceof Promise) {
        if (u.async === !1)
          throw new he();
        return l.then((d) => e._zod.parse(d, u));
      }
      return e._zod.parse(l, u);
    };
    e._zod.run = (a, c) => {
      if (c.skipChecks)
        return e._zod.parse(a, c);
      if (c.direction === "backward") {
        const l = e._zod.parse({ value: a.value, issues: [] }, { ...c, skipChecks: !0 });
        return l instanceof Promise ? l.then((d) => s(d, a, c)) : s(l, a, c);
      }
      const u = e._zod.parse(a, c);
      if (u instanceof Promise) {
        if (c.async === !1)
          throw new he();
        return u.then((l) => i(l, o, c));
      }
      return i(u, o, c);
    };
  }
  R(e, "~standard", () => ({
    validate: (i) => {
      var s;
      try {
        const a = To(e, i);
        return a.success ? { value: a.data } : { issues: (s = a.error) == null ? void 0 : s.issues };
      } catch {
        return Zo(e, i).then((c) => {
          var u;
          return c.success ? { value: c.data } : { issues: (u = c.error) == null ? void 0 : u.issues };
        });
      }
    },
    vendor: "zod",
    version: 1
  }));
}), ut = /* @__PURE__ */ h("$ZodString", (e, t) => {
  var n;
  O.init(e, t), e._zod.pattern = [...((n = e == null ? void 0 : e._zod.bag) == null ? void 0 : n.patterns) ?? []].pop() ?? sr(e._zod.bag), e._zod.parse = (o, r) => {
    if (t.coerce)
      try {
        o.value = String(o.value);
      } catch {
      }
    return typeof o.value == "string" || o.issues.push({
      expected: "string",
      code: "invalid_type",
      input: o.value,
      inst: e
    }), o;
  };
}), A = /* @__PURE__ */ h("$ZodStringFormat", (e, t) => {
  Ue.init(e, t), ut.init(e, t);
}), $r = /* @__PURE__ */ h("$ZodGUID", (e, t) => {
  t.pattern ?? (t.pattern = Wo), A.init(e, t);
}), Sr = /* @__PURE__ */ h("$ZodUUID", (e, t) => {
  if (t.version) {
    const o = {
      v1: 1,
      v2: 2,
      v3: 3,
      v4: 4,
      v5: 5,
      v6: 6,
      v7: 7,
      v8: 8
    }[t.version];
    if (o === void 0)
      throw new Error(`Invalid UUID version: "${t.version}"`);
    t.pattern ?? (t.pattern = zt(o));
  } else
    t.pattern ?? (t.pattern = zt());
  A.init(e, t);
}), Nr = /* @__PURE__ */ h("$ZodEmail", (e, t) => {
  t.pattern ?? (t.pattern = qo), A.init(e, t);
}), xr = /* @__PURE__ */ h("$ZodURL", (e, t) => {
  A.init(e, t), e._zod.check = (n) => {
    try {
      const o = n.value.trim(), r = new URL(o);
      t.hostname && (t.hostname.lastIndex = 0, t.hostname.test(r.hostname) || n.issues.push({
        code: "invalid_format",
        format: "url",
        note: "Invalid hostname",
        pattern: t.hostname.source,
        input: n.value,
        inst: e,
        continue: !t.abort
      })), t.protocol && (t.protocol.lastIndex = 0, t.protocol.test(r.protocol.endsWith(":") ? r.protocol.slice(0, -1) : r.protocol) || n.issues.push({
        code: "invalid_format",
        format: "url",
        note: "Invalid protocol",
        pattern: t.protocol.source,
        input: n.value,
        inst: e,
        continue: !t.abort
      })), t.normalize ? n.value = r.href : n.value = o;
      return;
    } catch {
      n.issues.push({
        code: "invalid_format",
        format: "url",
        input: n.value,
        inst: e,
        continue: !t.abort
      });
    }
  };
}), Cr = /* @__PURE__ */ h("$ZodEmoji", (e, t) => {
  t.pattern ?? (t.pattern = Yo()), A.init(e, t);
}), Tr = /* @__PURE__ */ h("$ZodNanoID", (e, t) => {
  t.pattern ?? (t.pattern = Jo), A.init(e, t);
}), Zr = /* @__PURE__ */ h("$ZodCUID", (e, t) => {
  t.pattern ?? (t.pattern = Do), A.init(e, t);
}), Ir = /* @__PURE__ */ h("$ZodCUID2", (e, t) => {
  t.pattern ?? (t.pattern = Bo), A.init(e, t);
}), Rr = /* @__PURE__ */ h("$ZodULID", (e, t) => {
  t.pattern ?? (t.pattern = Fo), A.init(e, t);
}), Lr = /* @__PURE__ */ h("$ZodXID", (e, t) => {
  t.pattern ?? (t.pattern = Uo), A.init(e, t);
}), Ar = /* @__PURE__ */ h("$ZodKSUID", (e, t) => {
  t.pattern ?? (t.pattern = Ho), A.init(e, t);
}), Pr = /* @__PURE__ */ h("$ZodISODateTime", (e, t) => {
  t.pattern ?? (t.pattern = ir(t)), A.init(e, t);
}), Or = /* @__PURE__ */ h("$ZodISODate", (e, t) => {
  t.pattern ?? (t.pattern = or), A.init(e, t);
}), jr = /* @__PURE__ */ h("$ZodISOTime", (e, t) => {
  t.pattern ?? (t.pattern = rr(t)), A.init(e, t);
}), Mr = /* @__PURE__ */ h("$ZodISODuration", (e, t) => {
  t.pattern ?? (t.pattern = Vo), A.init(e, t);
}), Dr = /* @__PURE__ */ h("$ZodIPv4", (e, t) => {
  t.pattern ?? (t.pattern = Go), A.init(e, t), e._zod.bag.format = "ipv4";
}), Br = /* @__PURE__ */ h("$ZodIPv6", (e, t) => {
  t.pattern ?? (t.pattern = Ko), A.init(e, t), e._zod.bag.format = "ipv6", e._zod.check = (n) => {
    try {
      new URL(`http://[${n.value}]`);
    } catch {
      n.issues.push({
        code: "invalid_format",
        format: "ipv6",
        input: n.value,
        inst: e,
        continue: !t.abort
      });
    }
  };
}), Fr = /* @__PURE__ */ h("$ZodCIDRv4", (e, t) => {
  t.pattern ?? (t.pattern = Qo), A.init(e, t);
}), Ur = /* @__PURE__ */ h("$ZodCIDRv6", (e, t) => {
  t.pattern ?? (t.pattern = er), A.init(e, t), e._zod.check = (n) => {
    const o = n.value.split("/");
    try {
      if (o.length !== 2)
        throw new Error();
      const [r, i] = o;
      if (!i)
        throw new Error();
      const s = Number(i);
      if (`${s}` !== i)
        throw new Error();
      if (s < 0 || s > 128)
        throw new Error();
      new URL(`http://[${r}]`);
    } catch {
      n.issues.push({
        code: "invalid_format",
        format: "cidrv6",
        input: n.value,
        inst: e,
        continue: !t.abort
      });
    }
  };
});
function dn(e) {
  if (e === "")
    return !0;
  if (e.length % 4 !== 0)
    return !1;
  try {
    return atob(e), !0;
  } catch {
    return !1;
  }
}
const Hr = /* @__PURE__ */ h("$ZodBase64", (e, t) => {
  t.pattern ?? (t.pattern = tr), A.init(e, t), e._zod.bag.contentEncoding = "base64", e._zod.check = (n) => {
    dn(n.value) || n.issues.push({
      code: "invalid_format",
      format: "base64",
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
});
function Jr(e) {
  if (!on.test(e))
    return !1;
  const t = e.replace(/[-_]/g, (o) => o === "-" ? "+" : "/"), n = t.padEnd(Math.ceil(t.length / 4) * 4, "=");
  return dn(n);
}
const Vr = /* @__PURE__ */ h("$ZodBase64URL", (e, t) => {
  t.pattern ?? (t.pattern = on), A.init(e, t), e._zod.bag.contentEncoding = "base64url", e._zod.check = (n) => {
    Jr(n.value) || n.issues.push({
      code: "invalid_format",
      format: "base64url",
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), Wr = /* @__PURE__ */ h("$ZodE164", (e, t) => {
  t.pattern ?? (t.pattern = nr), A.init(e, t);
});
function qr(e, t = null) {
  try {
    const n = e.split(".");
    if (n.length !== 3)
      return !1;
    const [o] = n;
    if (!o)
      return !1;
    const r = JSON.parse(atob(o));
    return !("typ" in r && (r == null ? void 0 : r.typ) !== "JWT" || !r.alg || t && (!("alg" in r) || r.alg !== t));
  } catch {
    return !1;
  }
}
const Xr = /* @__PURE__ */ h("$ZodJWT", (e, t) => {
  A.init(e, t), e._zod.check = (n) => {
    qr(n.value, t.alg) || n.issues.push({
      code: "invalid_format",
      format: "jwt",
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), hn = /* @__PURE__ */ h("$ZodNumber", (e, t) => {
  O.init(e, t), e._zod.pattern = e._zod.bag.pattern ?? an, e._zod.parse = (n, o) => {
    if (t.coerce)
      try {
        n.value = Number(n.value);
      } catch {
      }
    const r = n.value;
    if (typeof r == "number" && !Number.isNaN(r) && Number.isFinite(r))
      return n;
    const i = typeof r == "number" ? Number.isNaN(r) ? "NaN" : Number.isFinite(r) ? void 0 : "Infinity" : void 0;
    return n.issues.push({
      expected: "number",
      code: "invalid_type",
      input: r,
      inst: e,
      ...i ? { received: i } : {}
    }), n;
  };
}), Yr = /* @__PURE__ */ h("$ZodNumberFormat", (e, t) => {
  hr.init(e, t), hn.init(e, t);
}), Gr = /* @__PURE__ */ h("$ZodBoolean", (e, t) => {
  O.init(e, t), e._zod.pattern = cr, e._zod.parse = (n, o) => {
    if (t.coerce)
      try {
        n.value = !!n.value;
      } catch {
      }
    const r = n.value;
    return typeof r == "boolean" || n.issues.push({
      expected: "boolean",
      code: "invalid_type",
      input: r,
      inst: e
    }), n;
  };
}), Kr = /* @__PURE__ */ h("$ZodUnknown", (e, t) => {
  O.init(e, t), e._zod.parse = (n) => n;
}), Qr = /* @__PURE__ */ h("$ZodNever", (e, t) => {
  O.init(e, t), e._zod.parse = (n, o) => (n.issues.push({
    expected: "never",
    code: "invalid_type",
    input: n.value,
    inst: e
  }), n);
});
function $t(e, t, n) {
  e.issues.length && t.issues.push(...de(n, e.issues)), t.value[n] = e.value;
}
const ei = /* @__PURE__ */ h("$ZodArray", (e, t) => {
  O.init(e, t), e._zod.parse = (n, o) => {
    const r = n.value;
    if (!Array.isArray(r))
      return n.issues.push({
        expected: "array",
        code: "invalid_type",
        input: r,
        inst: e
      }), n;
    n.value = Array(r.length);
    const i = [];
    for (let s = 0; s < r.length; s++) {
      const a = r[s], c = t.element._zod.run({
        value: a,
        issues: []
      }, o);
      c instanceof Promise ? i.push(c.then((u) => $t(u, n, s))) : $t(c, n, s);
    }
    return i.length ? Promise.all(i).then(() => n) : n;
  };
});
function Le(e, t, n, o, r) {
  if (e.issues.length) {
    if (r && !(n in o))
      return;
    t.issues.push(...de(n, e.issues));
  }
  e.value === void 0 ? n in o && (t.value[n] = void 0) : t.value[n] = e.value;
}
function pn(e) {
  var o, r, i, s;
  const t = Object.keys(e.shape);
  for (const a of t)
    if (!((s = (i = (r = (o = e.shape) == null ? void 0 : o[a]) == null ? void 0 : r._zod) == null ? void 0 : i.traits) != null && s.has("$ZodType")))
      throw new Error(`Invalid element at key "${a}": expected a Zod schema`);
  const n = vo(e.shape);
  return {
    ...e,
    keys: t,
    keySet: new Set(t),
    numKeys: t.length,
    optionalKeys: new Set(n)
  };
}
function fn(e, t, n, o, r, i) {
  const s = [], a = r.keySet, c = r.catchall._zod, u = c.def.type, l = c.optout === "optional";
  for (const d in t) {
    if (a.has(d))
      continue;
    if (u === "never") {
      s.push(d);
      continue;
    }
    const m = c.run({ value: t[d], issues: [] }, o);
    m instanceof Promise ? e.push(m.then((f) => Le(f, n, d, t, l))) : Le(m, n, d, t, l);
  }
  return s.length && n.issues.push({
    code: "unrecognized_keys",
    keys: s,
    input: t,
    inst: i
  }), e.length ? Promise.all(e).then(() => n) : n;
}
const ti = /* @__PURE__ */ h("$ZodObject", (e, t) => {
  O.init(e, t);
  const n = Object.getOwnPropertyDescriptor(t, "shape");
  if (!(n != null && n.get)) {
    const a = t.shape;
    Object.defineProperty(t, "shape", {
      get: () => {
        const c = { ...a };
        return Object.defineProperty(t, "shape", {
          value: c
        }), c;
      }
    });
  }
  const o = ot(() => pn(t));
  R(e._zod, "propValues", () => {
    const a = t.shape, c = {};
    for (const u in a) {
      const l = a[u]._zod;
      if (l.values) {
        c[u] ?? (c[u] = /* @__PURE__ */ new Set());
        for (const d of l.values)
          c[u].add(d);
      }
    }
    return c;
  });
  const r = Re, i = t.catchall;
  let s;
  e._zod.parse = (a, c) => {
    s ?? (s = o.value);
    const u = a.value;
    if (!r(u))
      return a.issues.push({
        expected: "object",
        code: "invalid_type",
        input: u,
        inst: e
      }), a;
    a.value = {};
    const l = [], d = s.shape;
    for (const m of s.keys) {
      const f = d[m], v = f._zod.optout === "optional", b = f._zod.run({ value: u[m], issues: [] }, c);
      b instanceof Promise ? l.push(b.then((C) => Le(C, a, m, u, v))) : Le(b, a, m, u, v);
    }
    return i ? fn(l, u, a, c, o.value, e) : l.length ? Promise.all(l).then(() => a) : a;
  };
}), ni = /* @__PURE__ */ h("$ZodObjectJIT", (e, t) => {
  ti.init(e, t);
  const n = e._zod.parse, o = ot(() => pn(t)), r = (m) => {
    var _;
    const f = new Er(["shape", "payload", "ctx"]), v = o.value, b = (E) => {
      const g = Et(E);
      return `shape[${g}]._zod.run({ value: input[${g}], issues: [] }, ctx)`;
    };
    f.write("const input = payload.value;");
    const C = /* @__PURE__ */ Object.create(null);
    let $ = 0;
    for (const E of v.keys)
      C[E] = `key_${$++}`;
    f.write("const newResult = {};");
    for (const E of v.keys) {
      const g = C[E], T = Et(E), z = m[E], S = ((_ = z == null ? void 0 : z._zod) == null ? void 0 : _.optout) === "optional";
      f.write(`const ${g} = ${b(E)};`), S ? f.write(`
        if (${g}.issues.length) {
          if (${T} in input) {
            payload.issues = payload.issues.concat(${g}.issues.map(iss => ({
              ...iss,
              path: iss.path ? [${T}, ...iss.path] : [${T}]
            })));
          }
        }
        
        if (${g}.value === undefined) {
          if (${T} in input) {
            newResult[${T}] = undefined;
          }
        } else {
          newResult[${T}] = ${g}.value;
        }
        
      `) : f.write(`
        if (${g}.issues.length) {
          payload.issues = payload.issues.concat(${g}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${T}, ...iss.path] : [${T}]
          })));
        }
        
        if (${g}.value === undefined) {
          if (${T} in input) {
            newResult[${T}] = undefined;
          }
        } else {
          newResult[${T}] = ${g}.value;
        }
        
      `);
    }
    f.write("payload.value = newResult;"), f.write("return payload;");
    const N = f.compile();
    return (E, g) => N(m, E, g);
  };
  let i;
  const s = Re, a = !Yt.jitless, u = a && bo.value, l = t.catchall;
  let d;
  e._zod.parse = (m, f) => {
    d ?? (d = o.value);
    const v = m.value;
    return s(v) ? a && u && (f == null ? void 0 : f.async) === !1 && f.jitless !== !0 ? (i || (i = r(t.shape)), m = i(m, f), l ? fn([], v, m, f, d, e) : m) : n(m, f) : (m.issues.push({
      expected: "object",
      code: "invalid_type",
      input: v,
      inst: e
    }), m);
  };
});
function St(e, t, n, o) {
  for (const i of e)
    if (i.issues.length === 0)
      return t.value = i.value, t;
  const r = e.filter((i) => !le(i));
  return r.length === 1 ? (t.value = r[0].value, r[0]) : (t.issues.push({
    code: "invalid_union",
    input: t.value,
    inst: n,
    errors: e.map((i) => i.issues.map((s) => te(s, o, ee())))
  }), t);
}
const oi = /* @__PURE__ */ h("$ZodUnion", (e, t) => {
  O.init(e, t), R(e._zod, "optin", () => t.options.some((r) => r._zod.optin === "optional") ? "optional" : void 0), R(e._zod, "optout", () => t.options.some((r) => r._zod.optout === "optional") ? "optional" : void 0), R(e._zod, "values", () => {
    if (t.options.every((r) => r._zod.values))
      return new Set(t.options.flatMap((r) => Array.from(r._zod.values)));
  }), R(e._zod, "pattern", () => {
    if (t.options.every((r) => r._zod.pattern)) {
      const r = t.options.map((i) => i._zod.pattern);
      return new RegExp(`^(${r.map((i) => it(i.source)).join("|")})$`);
    }
  });
  const n = t.options.length === 1, o = t.options[0]._zod.run;
  e._zod.parse = (r, i) => {
    if (n)
      return o(r, i);
    let s = !1;
    const a = [];
    for (const c of t.options) {
      const u = c._zod.run({
        value: r.value,
        issues: []
      }, i);
      if (u instanceof Promise)
        a.push(u), s = !0;
      else {
        if (u.issues.length === 0)
          return u;
        a.push(u);
      }
    }
    return s ? Promise.all(a).then((c) => St(c, r, e, i)) : St(a, r, e, i);
  };
}), ri = /* @__PURE__ */ h("$ZodIntersection", (e, t) => {
  O.init(e, t), e._zod.parse = (n, o) => {
    const r = n.value, i = t.left._zod.run({ value: r, issues: [] }, o), s = t.right._zod.run({ value: r, issues: [] }, o);
    return i instanceof Promise || s instanceof Promise ? Promise.all([i, s]).then(([c, u]) => Nt(n, c, u)) : Nt(n, i, s);
  };
});
function tt(e, t) {
  if (e === t)
    return { valid: !0, data: e };
  if (e instanceof Date && t instanceof Date && +e == +t)
    return { valid: !0, data: e };
  if (pe(e) && pe(t)) {
    const n = Object.keys(t), o = Object.keys(e).filter((i) => n.indexOf(i) !== -1), r = { ...e, ...t };
    for (const i of o) {
      const s = tt(e[i], t[i]);
      if (!s.valid)
        return {
          valid: !1,
          mergeErrorPath: [i, ...s.mergeErrorPath]
        };
      r[i] = s.data;
    }
    return { valid: !0, data: r };
  }
  if (Array.isArray(e) && Array.isArray(t)) {
    if (e.length !== t.length)
      return { valid: !1, mergeErrorPath: [] };
    const n = [];
    for (let o = 0; o < e.length; o++) {
      const r = e[o], i = t[o], s = tt(r, i);
      if (!s.valid)
        return {
          valid: !1,
          mergeErrorPath: [o, ...s.mergeErrorPath]
        };
      n.push(s.data);
    }
    return { valid: !0, data: n };
  }
  return { valid: !1, mergeErrorPath: [] };
}
function Nt(e, t, n) {
  const o = /* @__PURE__ */ new Map();
  let r;
  for (const a of t.issues)
    if (a.code === "unrecognized_keys") {
      r ?? (r = a);
      for (const c of a.keys)
        o.has(c) || o.set(c, {}), o.get(c).l = !0;
    } else
      e.issues.push(a);
  for (const a of n.issues)
    if (a.code === "unrecognized_keys")
      for (const c of a.keys)
        o.has(c) || o.set(c, {}), o.get(c).r = !0;
    else
      e.issues.push(a);
  const i = [...o].filter(([, a]) => a.l && a.r).map(([a]) => a);
  if (i.length && r && e.issues.push({ ...r, keys: i }), le(e))
    return e;
  const s = tt(t.value, n.value);
  if (!s.valid)
    throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(s.mergeErrorPath)}`);
  return e.value = s.data, e;
}
const ii = /* @__PURE__ */ h("$ZodRecord", (e, t) => {
  O.init(e, t), e._zod.parse = (n, o) => {
    const r = n.value;
    if (!pe(r))
      return n.issues.push({
        expected: "record",
        code: "invalid_type",
        input: r,
        inst: e
      }), n;
    const i = [], s = t.keyType._zod.values;
    if (s) {
      n.value = {};
      const a = /* @__PURE__ */ new Set();
      for (const u of s)
        if (typeof u == "string" || typeof u == "number" || typeof u == "symbol") {
          a.add(typeof u == "number" ? u.toString() : u);
          const l = t.valueType._zod.run({ value: r[u], issues: [] }, o);
          l instanceof Promise ? i.push(l.then((d) => {
            d.issues.length && n.issues.push(...de(u, d.issues)), n.value[u] = d.value;
          })) : (l.issues.length && n.issues.push(...de(u, l.issues)), n.value[u] = l.value);
        }
      let c;
      for (const u in r)
        a.has(u) || (c = c ?? [], c.push(u));
      c && c.length > 0 && n.issues.push({
        code: "unrecognized_keys",
        input: r,
        inst: e,
        keys: c
      });
    } else {
      n.value = {};
      for (const a of Reflect.ownKeys(r)) {
        if (a === "__proto__")
          continue;
        let c = t.keyType._zod.run({ value: a, issues: [] }, o);
        if (c instanceof Promise)
          throw new Error("Async schemas not supported in object keys currently");
        if (typeof a == "string" && an.test(a) && c.issues.length) {
          const d = t.keyType._zod.run({ value: Number(a), issues: [] }, o);
          if (d instanceof Promise)
            throw new Error("Async schemas not supported in object keys currently");
          d.issues.length === 0 && (c = d);
        }
        if (c.issues.length) {
          t.mode === "loose" ? n.value[a] = r[a] : n.issues.push({
            code: "invalid_key",
            origin: "record",
            issues: c.issues.map((d) => te(d, o, ee())),
            input: a,
            path: [a],
            inst: e
          });
          continue;
        }
        const l = t.valueType._zod.run({ value: r[a], issues: [] }, o);
        l instanceof Promise ? i.push(l.then((d) => {
          d.issues.length && n.issues.push(...de(a, d.issues)), n.value[c.value] = d.value;
        })) : (l.issues.length && n.issues.push(...de(a, l.issues)), n.value[c.value] = l.value);
      }
    }
    return i.length ? Promise.all(i).then(() => n) : n;
  };
}), si = /* @__PURE__ */ h("$ZodEnum", (e, t) => {
  O.init(e, t);
  const n = Gt(t.entries), o = new Set(n);
  e._zod.values = o, e._zod.pattern = new RegExp(`^(${n.filter((r) => go.has(typeof r)).map((r) => typeof r == "string" ? De(r) : r.toString()).join("|")})$`), e._zod.parse = (r, i) => {
    const s = r.value;
    return o.has(s) || r.issues.push({
      code: "invalid_value",
      values: n,
      input: s,
      inst: e
    }), r;
  };
}), ai = /* @__PURE__ */ h("$ZodTransform", (e, t) => {
  O.init(e, t), e._zod.parse = (n, o) => {
    if (o.direction === "backward")
      throw new Xt(e.constructor.name);
    const r = t.transform(n.value, n);
    if (o.async)
      return (r instanceof Promise ? r : Promise.resolve(r)).then((s) => (n.value = s, n));
    if (r instanceof Promise)
      throw new he();
    return n.value = r, n;
  };
});
function xt(e, t) {
  return e.issues.length && t === void 0 ? { issues: [], value: void 0 } : e;
}
const mn = /* @__PURE__ */ h("$ZodOptional", (e, t) => {
  O.init(e, t), e._zod.optin = "optional", e._zod.optout = "optional", R(e._zod, "values", () => t.innerType._zod.values ? /* @__PURE__ */ new Set([...t.innerType._zod.values, void 0]) : void 0), R(e._zod, "pattern", () => {
    const n = t.innerType._zod.pattern;
    return n ? new RegExp(`^(${it(n.source)})?$`) : void 0;
  }), e._zod.parse = (n, o) => {
    if (t.innerType._zod.optin === "optional") {
      const r = t.innerType._zod.run(n, o);
      return r instanceof Promise ? r.then((i) => xt(i, n.value)) : xt(r, n.value);
    }
    return n.value === void 0 ? n : t.innerType._zod.run(n, o);
  };
}), ci = /* @__PURE__ */ h("$ZodExactOptional", (e, t) => {
  mn.init(e, t), R(e._zod, "values", () => t.innerType._zod.values), R(e._zod, "pattern", () => t.innerType._zod.pattern), e._zod.parse = (n, o) => t.innerType._zod.run(n, o);
}), ui = /* @__PURE__ */ h("$ZodNullable", (e, t) => {
  O.init(e, t), R(e._zod, "optin", () => t.innerType._zod.optin), R(e._zod, "optout", () => t.innerType._zod.optout), R(e._zod, "pattern", () => {
    const n = t.innerType._zod.pattern;
    return n ? new RegExp(`^(${it(n.source)}|null)$`) : void 0;
  }), R(e._zod, "values", () => t.innerType._zod.values ? /* @__PURE__ */ new Set([...t.innerType._zod.values, null]) : void 0), e._zod.parse = (n, o) => n.value === null ? n : t.innerType._zod.run(n, o);
}), li = /* @__PURE__ */ h("$ZodDefault", (e, t) => {
  O.init(e, t), e._zod.optin = "optional", R(e._zod, "values", () => t.innerType._zod.values), e._zod.parse = (n, o) => {
    if (o.direction === "backward")
      return t.innerType._zod.run(n, o);
    if (n.value === void 0)
      return n.value = t.defaultValue, n;
    const r = t.innerType._zod.run(n, o);
    return r instanceof Promise ? r.then((i) => Ct(i, t)) : Ct(r, t);
  };
});
function Ct(e, t) {
  return e.value === void 0 && (e.value = t.defaultValue), e;
}
const di = /* @__PURE__ */ h("$ZodPrefault", (e, t) => {
  O.init(e, t), e._zod.optin = "optional", R(e._zod, "values", () => t.innerType._zod.values), e._zod.parse = (n, o) => (o.direction === "backward" || n.value === void 0 && (n.value = t.defaultValue), t.innerType._zod.run(n, o));
}), hi = /* @__PURE__ */ h("$ZodNonOptional", (e, t) => {
  O.init(e, t), R(e._zod, "values", () => {
    const n = t.innerType._zod.values;
    return n ? new Set([...n].filter((o) => o !== void 0)) : void 0;
  }), e._zod.parse = (n, o) => {
    const r = t.innerType._zod.run(n, o);
    return r instanceof Promise ? r.then((i) => Tt(i, e)) : Tt(r, e);
  };
});
function Tt(e, t) {
  return !e.issues.length && e.value === void 0 && e.issues.push({
    code: "invalid_type",
    expected: "nonoptional",
    input: e.value,
    inst: t
  }), e;
}
const pi = /* @__PURE__ */ h("$ZodCatch", (e, t) => {
  O.init(e, t), R(e._zod, "optin", () => t.innerType._zod.optin), R(e._zod, "optout", () => t.innerType._zod.optout), R(e._zod, "values", () => t.innerType._zod.values), e._zod.parse = (n, o) => {
    if (o.direction === "backward")
      return t.innerType._zod.run(n, o);
    const r = t.innerType._zod.run(n, o);
    return r instanceof Promise ? r.then((i) => (n.value = i.value, i.issues.length && (n.value = t.catchValue({
      ...n,
      error: {
        issues: i.issues.map((s) => te(s, o, ee()))
      },
      input: n.value
    }), n.issues = []), n)) : (n.value = r.value, r.issues.length && (n.value = t.catchValue({
      ...n,
      error: {
        issues: r.issues.map((i) => te(i, o, ee()))
      },
      input: n.value
    }), n.issues = []), n);
  };
}), fi = /* @__PURE__ */ h("$ZodPipe", (e, t) => {
  O.init(e, t), R(e._zod, "values", () => t.in._zod.values), R(e._zod, "optin", () => t.in._zod.optin), R(e._zod, "optout", () => t.out._zod.optout), R(e._zod, "propValues", () => t.in._zod.propValues), e._zod.parse = (n, o) => {
    if (o.direction === "backward") {
      const i = t.out._zod.run(n, o);
      return i instanceof Promise ? i.then((s) => Se(s, t.in, o)) : Se(i, t.in, o);
    }
    const r = t.in._zod.run(n, o);
    return r instanceof Promise ? r.then((i) => Se(i, t.out, o)) : Se(r, t.out, o);
  };
});
function Se(e, t, n) {
  return e.issues.length ? (e.aborted = !0, e) : t._zod.run({ value: e.value, issues: e.issues }, n);
}
const mi = /* @__PURE__ */ h("$ZodReadonly", (e, t) => {
  O.init(e, t), R(e._zod, "propValues", () => t.innerType._zod.propValues), R(e._zod, "values", () => t.innerType._zod.values), R(e._zod, "optin", () => {
    var n, o;
    return (o = (n = t.innerType) == null ? void 0 : n._zod) == null ? void 0 : o.optin;
  }), R(e._zod, "optout", () => {
    var n, o;
    return (o = (n = t.innerType) == null ? void 0 : n._zod) == null ? void 0 : o.optout;
  }), e._zod.parse = (n, o) => {
    if (o.direction === "backward")
      return t.innerType._zod.run(n, o);
    const r = t.innerType._zod.run(n, o);
    return r instanceof Promise ? r.then(Zt) : Zt(r);
  };
});
function Zt(e) {
  return e.value = Object.freeze(e.value), e;
}
const _i = /* @__PURE__ */ h("$ZodCustom", (e, t) => {
  V.init(e, t), O.init(e, t), e._zod.parse = (n, o) => n, e._zod.check = (n) => {
    const o = n.value, r = t.fn(o);
    if (r instanceof Promise)
      return r.then((i) => It(i, n, o, e));
    It(r, n, o, e);
  };
});
function It(e, t, n, o) {
  if (!e) {
    const r = {
      code: "custom",
      input: n,
      inst: o,
      // incorporates params.error into issue reporting
      path: [...o._zod.def.path ?? []],
      // incorporates params.error into issue reporting
      continue: !o._zod.def.abort
      // params: inst._zod.def.params,
    };
    o._zod.def.params && (r.params = o._zod.def.params), t.issues.push(ke(r));
  }
}
var Rt;
class bi {
  constructor() {
    this._map = /* @__PURE__ */ new WeakMap(), this._idmap = /* @__PURE__ */ new Map();
  }
  add(t, ...n) {
    const o = n[0];
    return this._map.set(t, o), o && typeof o == "object" && "id" in o && this._idmap.set(o.id, t), this;
  }
  clear() {
    return this._map = /* @__PURE__ */ new WeakMap(), this._idmap = /* @__PURE__ */ new Map(), this;
  }
  remove(t) {
    const n = this._map.get(t);
    return n && typeof n == "object" && "id" in n && this._idmap.delete(n.id), this._map.delete(t), this;
  }
  get(t) {
    const n = t._zod.parent;
    if (n) {
      const o = { ...this.get(n) ?? {} };
      delete o.id;
      const r = { ...o, ...this._map.get(t) };
      return Object.keys(r).length ? r : void 0;
    }
    return this._map.get(t);
  }
  has(t) {
    return this._map.has(t);
  }
}
function gi() {
  return new bi();
}
(Rt = globalThis).__zod_globalRegistry ?? (Rt.__zod_globalRegistry = gi());
const ve = globalThis.__zod_globalRegistry;
// @__NO_SIDE_EFFECTS__
function vi(e, t) {
  return new e({
    type: "string",
    ...k(t)
  });
}
// @__NO_SIDE_EFFECTS__
function yi(e, t) {
  return new e({
    type: "string",
    format: "email",
    check: "string_format",
    abort: !1,
    ...k(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Lt(e, t) {
  return new e({
    type: "string",
    format: "guid",
    check: "string_format",
    abort: !1,
    ...k(t)
  });
}
// @__NO_SIDE_EFFECTS__
function wi(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    ...k(t)
  });
}
// @__NO_SIDE_EFFECTS__
function ki(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v4",
    ...k(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Ei(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v6",
    ...k(t)
  });
}
// @__NO_SIDE_EFFECTS__
function zi(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v7",
    ...k(t)
  });
}
// @__NO_SIDE_EFFECTS__
function $i(e, t) {
  return new e({
    type: "string",
    format: "url",
    check: "string_format",
    abort: !1,
    ...k(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Si(e, t) {
  return new e({
    type: "string",
    format: "emoji",
    check: "string_format",
    abort: !1,
    ...k(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Ni(e, t) {
  return new e({
    type: "string",
    format: "nanoid",
    check: "string_format",
    abort: !1,
    ...k(t)
  });
}
// @__NO_SIDE_EFFECTS__
function xi(e, t) {
  return new e({
    type: "string",
    format: "cuid",
    check: "string_format",
    abort: !1,
    ...k(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Ci(e, t) {
  return new e({
    type: "string",
    format: "cuid2",
    check: "string_format",
    abort: !1,
    ...k(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Ti(e, t) {
  return new e({
    type: "string",
    format: "ulid",
    check: "string_format",
    abort: !1,
    ...k(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Zi(e, t) {
  return new e({
    type: "string",
    format: "xid",
    check: "string_format",
    abort: !1,
    ...k(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Ii(e, t) {
  return new e({
    type: "string",
    format: "ksuid",
    check: "string_format",
    abort: !1,
    ...k(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Ri(e, t) {
  return new e({
    type: "string",
    format: "ipv4",
    check: "string_format",
    abort: !1,
    ...k(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Li(e, t) {
  return new e({
    type: "string",
    format: "ipv6",
    check: "string_format",
    abort: !1,
    ...k(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Ai(e, t) {
  return new e({
    type: "string",
    format: "cidrv4",
    check: "string_format",
    abort: !1,
    ...k(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Pi(e, t) {
  return new e({
    type: "string",
    format: "cidrv6",
    check: "string_format",
    abort: !1,
    ...k(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Oi(e, t) {
  return new e({
    type: "string",
    format: "base64",
    check: "string_format",
    abort: !1,
    ...k(t)
  });
}
// @__NO_SIDE_EFFECTS__
function ji(e, t) {
  return new e({
    type: "string",
    format: "base64url",
    check: "string_format",
    abort: !1,
    ...k(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Mi(e, t) {
  return new e({
    type: "string",
    format: "e164",
    check: "string_format",
    abort: !1,
    ...k(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Di(e, t) {
  return new e({
    type: "string",
    format: "jwt",
    check: "string_format",
    abort: !1,
    ...k(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Bi(e, t) {
  return new e({
    type: "string",
    format: "datetime",
    check: "string_format",
    offset: !1,
    local: !1,
    precision: null,
    ...k(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Fi(e, t) {
  return new e({
    type: "string",
    format: "date",
    check: "string_format",
    ...k(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Ui(e, t) {
  return new e({
    type: "string",
    format: "time",
    check: "string_format",
    precision: null,
    ...k(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Hi(e, t) {
  return new e({
    type: "string",
    format: "duration",
    check: "string_format",
    ...k(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Ji(e, t) {
  return new e({
    type: "number",
    checks: [],
    ...k(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Vi(e, t) {
  return new e({
    type: "number",
    check: "number_format",
    abort: !1,
    format: "safeint",
    ...k(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Wi(e, t) {
  return new e({
    type: "boolean",
    ...k(t)
  });
}
// @__NO_SIDE_EFFECTS__
function qi(e) {
  return new e({
    type: "unknown"
  });
}
// @__NO_SIDE_EFFECTS__
function Xi(e, t) {
  return new e({
    type: "never",
    ...k(t)
  });
}
// @__NO_SIDE_EFFECTS__
function At(e, t) {
  return new un({
    check: "less_than",
    ...k(t),
    value: e,
    inclusive: !1
  });
}
// @__NO_SIDE_EFFECTS__
function qe(e, t) {
  return new un({
    check: "less_than",
    ...k(t),
    value: e,
    inclusive: !0
  });
}
// @__NO_SIDE_EFFECTS__
function Pt(e, t) {
  return new ln({
    check: "greater_than",
    ...k(t),
    value: e,
    inclusive: !1
  });
}
// @__NO_SIDE_EFFECTS__
function Xe(e, t) {
  return new ln({
    check: "greater_than",
    ...k(t),
    value: e,
    inclusive: !0
  });
}
// @__NO_SIDE_EFFECTS__
function Ot(e, t) {
  return new dr({
    check: "multiple_of",
    ...k(t),
    value: e
  });
}
// @__NO_SIDE_EFFECTS__
function _n(e, t) {
  return new pr({
    check: "max_length",
    ...k(t),
    maximum: e
  });
}
// @__NO_SIDE_EFFECTS__
function Ae(e, t) {
  return new fr({
    check: "min_length",
    ...k(t),
    minimum: e
  });
}
// @__NO_SIDE_EFFECTS__
function bn(e, t) {
  return new mr({
    check: "length_equals",
    ...k(t),
    length: e
  });
}
// @__NO_SIDE_EFFECTS__
function Yi(e, t) {
  return new _r({
    check: "string_format",
    format: "regex",
    ...k(t),
    pattern: e
  });
}
// @__NO_SIDE_EFFECTS__
function Gi(e) {
  return new br({
    check: "string_format",
    format: "lowercase",
    ...k(e)
  });
}
// @__NO_SIDE_EFFECTS__
function Ki(e) {
  return new gr({
    check: "string_format",
    format: "uppercase",
    ...k(e)
  });
}
// @__NO_SIDE_EFFECTS__
function Qi(e, t) {
  return new vr({
    check: "string_format",
    format: "includes",
    ...k(t),
    includes: e
  });
}
// @__NO_SIDE_EFFECTS__
function es(e, t) {
  return new yr({
    check: "string_format",
    format: "starts_with",
    ...k(t),
    prefix: e
  });
}
// @__NO_SIDE_EFFECTS__
function ts(e, t) {
  return new wr({
    check: "string_format",
    format: "ends_with",
    ...k(t),
    suffix: e
  });
}
// @__NO_SIDE_EFFECTS__
function fe(e) {
  return new kr({
    check: "overwrite",
    tx: e
  });
}
// @__NO_SIDE_EFFECTS__
function ns(e) {
  return /* @__PURE__ */ fe((t) => t.normalize(e));
}
// @__NO_SIDE_EFFECTS__
function os() {
  return /* @__PURE__ */ fe((e) => e.trim());
}
// @__NO_SIDE_EFFECTS__
function rs() {
  return /* @__PURE__ */ fe((e) => e.toLowerCase());
}
// @__NO_SIDE_EFFECTS__
function is() {
  return /* @__PURE__ */ fe((e) => e.toUpperCase());
}
// @__NO_SIDE_EFFECTS__
function ss() {
  return /* @__PURE__ */ fe((e) => _o(e));
}
// @__NO_SIDE_EFFECTS__
function as(e, t, n) {
  return new e({
    type: "array",
    element: t,
    // get element() {
    //   return element;
    // },
    ...k(n)
  });
}
// @__NO_SIDE_EFFECTS__
function cs(e, t, n) {
  return new e({
    type: "custom",
    check: "custom",
    fn: t,
    ...k(n)
  });
}
// @__NO_SIDE_EFFECTS__
function us(e) {
  const t = /* @__PURE__ */ ls((n) => (n.addIssue = (o) => {
    if (typeof o == "string")
      n.issues.push(ke(o, n.value, t._zod.def));
    else {
      const r = o;
      r.fatal && (r.continue = !1), r.code ?? (r.code = "custom"), r.input ?? (r.input = n.value), r.inst ?? (r.inst = t), r.continue ?? (r.continue = !t._zod.def.abort), n.issues.push(ke(r));
    }
  }, e(n.value, n)));
  return t;
}
// @__NO_SIDE_EFFECTS__
function ls(e, t) {
  const n = new V({
    check: "custom",
    ...k(t)
  });
  return n._zod.check = e, n;
}
function gn(e) {
  let t = (e == null ? void 0 : e.target) ?? "draft-2020-12";
  return t === "draft-4" && (t = "draft-04"), t === "draft-7" && (t = "draft-07"), {
    processors: e.processors ?? {},
    metadataRegistry: (e == null ? void 0 : e.metadata) ?? ve,
    target: t,
    unrepresentable: (e == null ? void 0 : e.unrepresentable) ?? "throw",
    override: (e == null ? void 0 : e.override) ?? (() => {
    }),
    io: (e == null ? void 0 : e.io) ?? "output",
    counter: 0,
    seen: /* @__PURE__ */ new Map(),
    cycles: (e == null ? void 0 : e.cycles) ?? "ref",
    reused: (e == null ? void 0 : e.reused) ?? "inline",
    external: (e == null ? void 0 : e.external) ?? void 0
  };
}
function U(e, t, n = { path: [], schemaPath: [] }) {
  var l, d;
  var o;
  const r = e._zod.def, i = t.seen.get(e);
  if (i)
    return i.count++, n.schemaPath.includes(e) && (i.cycle = n.path), i.schema;
  const s = { schema: {}, count: 1, cycle: void 0, path: n.path };
  t.seen.set(e, s);
  const a = (d = (l = e._zod).toJSONSchema) == null ? void 0 : d.call(l);
  if (a)
    s.schema = a;
  else {
    const m = {
      ...n,
      schemaPath: [...n.schemaPath, e],
      path: n.path
    };
    if (e._zod.processJSONSchema)
      e._zod.processJSONSchema(t, s.schema, m);
    else {
      const v = s.schema, b = t.processors[r.type];
      if (!b)
        throw new Error(`[toJSONSchema]: Non-representable type encountered: ${r.type}`);
      b(e, t, v, m);
    }
    const f = e._zod.parent;
    f && (s.ref || (s.ref = f), U(f, t, m), t.seen.get(f).isParent = !0);
  }
  const c = t.metadataRegistry.get(e);
  return c && Object.assign(s.schema, c), t.io === "input" && H(e) && (delete s.schema.examples, delete s.schema.default), t.io === "input" && s.schema._prefault && ((o = s.schema).default ?? (o.default = s.schema._prefault)), delete s.schema._prefault, t.seen.get(e).schema;
}
function vn(e, t) {
  var s, a, c, u;
  const n = e.seen.get(t);
  if (!n)
    throw new Error("Unprocessed schema. This is a bug in Zod.");
  const o = /* @__PURE__ */ new Map();
  for (const l of e.seen.entries()) {
    const d = (s = e.metadataRegistry.get(l[0])) == null ? void 0 : s.id;
    if (d) {
      const m = o.get(d);
      if (m && m !== l[0])
        throw new Error(`Duplicate schema id "${d}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`);
      o.set(d, l[0]);
    }
  }
  const r = (l) => {
    var b;
    const d = e.target === "draft-2020-12" ? "$defs" : "definitions";
    if (e.external) {
      const C = (b = e.external.registry.get(l[0])) == null ? void 0 : b.id, $ = e.external.uri ?? ((_) => _);
      if (C)
        return { ref: $(C) };
      const N = l[1].defId ?? l[1].schema.id ?? `schema${e.counter++}`;
      return l[1].defId = N, { defId: N, ref: `${$("__shared")}#/${d}/${N}` };
    }
    if (l[1] === n)
      return { ref: "#" };
    const f = `#/${d}/`, v = l[1].schema.id ?? `__schema${e.counter++}`;
    return { defId: v, ref: f + v };
  }, i = (l) => {
    if (l[1].schema.$ref)
      return;
    const d = l[1], { ref: m, defId: f } = r(l);
    d.def = { ...d.schema }, f && (d.defId = f);
    const v = d.schema;
    for (const b in v)
      delete v[b];
    v.$ref = m;
  };
  if (e.cycles === "throw")
    for (const l of e.seen.entries()) {
      const d = l[1];
      if (d.cycle)
        throw new Error(`Cycle detected: #/${(a = d.cycle) == null ? void 0 : a.join("/")}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`);
    }
  for (const l of e.seen.entries()) {
    const d = l[1];
    if (t === l[0]) {
      i(l);
      continue;
    }
    if (e.external) {
      const f = (c = e.external.registry.get(l[0])) == null ? void 0 : c.id;
      if (t !== l[0] && f) {
        i(l);
        continue;
      }
    }
    if ((u = e.metadataRegistry.get(l[0])) == null ? void 0 : u.id) {
      i(l);
      continue;
    }
    if (d.cycle) {
      i(l);
      continue;
    }
    if (d.count > 1 && e.reused === "ref") {
      i(l);
      continue;
    }
  }
}
function yn(e, t) {
  var s, a, c;
  const n = e.seen.get(t);
  if (!n)
    throw new Error("Unprocessed schema. This is a bug in Zod.");
  const o = (u) => {
    const l = e.seen.get(u);
    if (l.ref === null)
      return;
    const d = l.def ?? l.schema, m = { ...d }, f = l.ref;
    if (l.ref = null, f) {
      o(f);
      const b = e.seen.get(f), C = b.schema;
      if (C.$ref && (e.target === "draft-07" || e.target === "draft-04" || e.target === "openapi-3.0") ? (d.allOf = d.allOf ?? [], d.allOf.push(C)) : Object.assign(d, C), Object.assign(d, m), u._zod.parent === f)
        for (const N in d)
          N === "$ref" || N === "allOf" || N in m || delete d[N];
      if (C.$ref && b.def)
        for (const N in d)
          N === "$ref" || N === "allOf" || N in b.def && JSON.stringify(d[N]) === JSON.stringify(b.def[N]) && delete d[N];
    }
    const v = u._zod.parent;
    if (v && v !== f) {
      o(v);
      const b = e.seen.get(v);
      if (b != null && b.schema.$ref && (d.$ref = b.schema.$ref, b.def))
        for (const C in d)
          C === "$ref" || C === "allOf" || C in b.def && JSON.stringify(d[C]) === JSON.stringify(b.def[C]) && delete d[C];
    }
    e.override({
      zodSchema: u,
      jsonSchema: d,
      path: l.path ?? []
    });
  };
  for (const u of [...e.seen.entries()].reverse())
    o(u[0]);
  const r = {};
  if (e.target === "draft-2020-12" ? r.$schema = "https://json-schema.org/draft/2020-12/schema" : e.target === "draft-07" ? r.$schema = "http://json-schema.org/draft-07/schema#" : e.target === "draft-04" ? r.$schema = "http://json-schema.org/draft-04/schema#" : e.target, (s = e.external) != null && s.uri) {
    const u = (a = e.external.registry.get(t)) == null ? void 0 : a.id;
    if (!u)
      throw new Error("Schema is missing an `id` property");
    r.$id = e.external.uri(u);
  }
  Object.assign(r, n.def ?? n.schema);
  const i = ((c = e.external) == null ? void 0 : c.defs) ?? {};
  for (const u of e.seen.entries()) {
    const l = u[1];
    l.def && l.defId && (i[l.defId] = l.def);
  }
  e.external || Object.keys(i).length > 0 && (e.target === "draft-2020-12" ? r.$defs = i : r.definitions = i);
  try {
    const u = JSON.parse(JSON.stringify(r));
    return Object.defineProperty(u, "~standard", {
      value: {
        ...t["~standard"],
        jsonSchema: {
          input: Pe(t, "input", e.processors),
          output: Pe(t, "output", e.processors)
        }
      },
      enumerable: !1,
      writable: !1
    }), u;
  } catch {
    throw new Error("Error converting schema to JSON.");
  }
}
function H(e, t) {
  const n = t ?? { seen: /* @__PURE__ */ new Set() };
  if (n.seen.has(e))
    return !1;
  n.seen.add(e);
  const o = e._zod.def;
  if (o.type === "transform")
    return !0;
  if (o.type === "array")
    return H(o.element, n);
  if (o.type === "set")
    return H(o.valueType, n);
  if (o.type === "lazy")
    return H(o.getter(), n);
  if (o.type === "promise" || o.type === "optional" || o.type === "nonoptional" || o.type === "nullable" || o.type === "readonly" || o.type === "default" || o.type === "prefault")
    return H(o.innerType, n);
  if (o.type === "intersection")
    return H(o.left, n) || H(o.right, n);
  if (o.type === "record" || o.type === "map")
    return H(o.keyType, n) || H(o.valueType, n);
  if (o.type === "pipe")
    return H(o.in, n) || H(o.out, n);
  if (o.type === "object") {
    for (const r in o.shape)
      if (H(o.shape[r], n))
        return !0;
    return !1;
  }
  if (o.type === "union") {
    for (const r of o.options)
      if (H(r, n))
        return !0;
    return !1;
  }
  if (o.type === "tuple") {
    for (const r of o.items)
      if (H(r, n))
        return !0;
    return !!(o.rest && H(o.rest, n));
  }
  return !1;
}
const ds = (e, t = {}) => (n) => {
  const o = gn({ ...n, processors: t });
  return U(e, o), vn(o, e), yn(o, e);
}, Pe = (e, t, n = {}) => (o) => {
  const { libraryOptions: r, target: i } = o ?? {}, s = gn({ ...r ?? {}, target: i, io: t, processors: n });
  return U(e, s), vn(s, e), yn(s, e);
}, hs = {
  guid: "uuid",
  url: "uri",
  datetime: "date-time",
  json_string: "json-string",
  regex: ""
  // do not set
}, ps = (e, t, n, o) => {
  const r = n;
  r.type = "string";
  const { minimum: i, maximum: s, format: a, patterns: c, contentEncoding: u } = e._zod.bag;
  if (typeof i == "number" && (r.minLength = i), typeof s == "number" && (r.maxLength = s), a && (r.format = hs[a] ?? a, r.format === "" && delete r.format, a === "time" && delete r.format), u && (r.contentEncoding = u), c && c.size > 0) {
    const l = [...c];
    l.length === 1 ? r.pattern = l[0].source : l.length > 1 && (r.allOf = [
      ...l.map((d) => ({
        ...t.target === "draft-07" || t.target === "draft-04" || t.target === "openapi-3.0" ? { type: "string" } : {},
        pattern: d.source
      }))
    ]);
  }
}, fs = (e, t, n, o) => {
  const r = n, { minimum: i, maximum: s, format: a, multipleOf: c, exclusiveMaximum: u, exclusiveMinimum: l } = e._zod.bag;
  typeof a == "string" && a.includes("int") ? r.type = "integer" : r.type = "number", typeof l == "number" && (t.target === "draft-04" || t.target === "openapi-3.0" ? (r.minimum = l, r.exclusiveMinimum = !0) : r.exclusiveMinimum = l), typeof i == "number" && (r.minimum = i, typeof l == "number" && t.target !== "draft-04" && (l >= i ? delete r.minimum : delete r.exclusiveMinimum)), typeof u == "number" && (t.target === "draft-04" || t.target === "openapi-3.0" ? (r.maximum = u, r.exclusiveMaximum = !0) : r.exclusiveMaximum = u), typeof s == "number" && (r.maximum = s, typeof u == "number" && t.target !== "draft-04" && (u <= s ? delete r.maximum : delete r.exclusiveMaximum)), typeof c == "number" && (r.multipleOf = c);
}, ms = (e, t, n, o) => {
  n.type = "boolean";
}, _s = (e, t, n, o) => {
  n.not = {};
}, bs = (e, t, n, o) => {
}, gs = (e, t, n, o) => {
  const r = e._zod.def, i = Gt(r.entries);
  i.every((s) => typeof s == "number") && (n.type = "number"), i.every((s) => typeof s == "string") && (n.type = "string"), n.enum = i;
}, vs = (e, t, n, o) => {
  if (t.unrepresentable === "throw")
    throw new Error("Custom types cannot be represented in JSON Schema");
}, ys = (e, t, n, o) => {
  if (t.unrepresentable === "throw")
    throw new Error("Transforms cannot be represented in JSON Schema");
}, ws = (e, t, n, o) => {
  const r = n, i = e._zod.def, { minimum: s, maximum: a } = e._zod.bag;
  typeof s == "number" && (r.minItems = s), typeof a == "number" && (r.maxItems = a), r.type = "array", r.items = U(i.element, t, { ...o, path: [...o.path, "items"] });
}, ks = (e, t, n, o) => {
  var u;
  const r = n, i = e._zod.def;
  r.type = "object", r.properties = {};
  const s = i.shape;
  for (const l in s)
    r.properties[l] = U(s[l], t, {
      ...o,
      path: [...o.path, "properties", l]
    });
  const a = new Set(Object.keys(s)), c = new Set([...a].filter((l) => {
    const d = i.shape[l]._zod;
    return t.io === "input" ? d.optin === void 0 : d.optout === void 0;
  }));
  c.size > 0 && (r.required = Array.from(c)), ((u = i.catchall) == null ? void 0 : u._zod.def.type) === "never" ? r.additionalProperties = !1 : i.catchall ? i.catchall && (r.additionalProperties = U(i.catchall, t, {
    ...o,
    path: [...o.path, "additionalProperties"]
  })) : t.io === "output" && (r.additionalProperties = !1);
}, Es = (e, t, n, o) => {
  const r = e._zod.def, i = r.inclusive === !1, s = r.options.map((a, c) => U(a, t, {
    ...o,
    path: [...o.path, i ? "oneOf" : "anyOf", c]
  }));
  i ? n.oneOf = s : n.anyOf = s;
}, zs = (e, t, n, o) => {
  const r = e._zod.def, i = U(r.left, t, {
    ...o,
    path: [...o.path, "allOf", 0]
  }), s = U(r.right, t, {
    ...o,
    path: [...o.path, "allOf", 1]
  }), a = (u) => "allOf" in u && Object.keys(u).length === 1, c = [
    ...a(i) ? i.allOf : [i],
    ...a(s) ? s.allOf : [s]
  ];
  n.allOf = c;
}, $s = (e, t, n, o) => {
  const r = n, i = e._zod.def;
  r.type = "object";
  const s = i.keyType, a = s._zod.bag, c = a == null ? void 0 : a.patterns;
  if (i.mode === "loose" && c && c.size > 0) {
    const l = U(i.valueType, t, {
      ...o,
      path: [...o.path, "patternProperties", "*"]
    });
    r.patternProperties = {};
    for (const d of c)
      r.patternProperties[d.source] = l;
  } else
    (t.target === "draft-07" || t.target === "draft-2020-12") && (r.propertyNames = U(i.keyType, t, {
      ...o,
      path: [...o.path, "propertyNames"]
    })), r.additionalProperties = U(i.valueType, t, {
      ...o,
      path: [...o.path, "additionalProperties"]
    });
  const u = s._zod.values;
  if (u) {
    const l = [...u].filter((d) => typeof d == "string" || typeof d == "number");
    l.length > 0 && (r.required = l);
  }
}, Ss = (e, t, n, o) => {
  const r = e._zod.def, i = U(r.innerType, t, o), s = t.seen.get(e);
  t.target === "openapi-3.0" ? (s.ref = r.innerType, n.nullable = !0) : n.anyOf = [i, { type: "null" }];
}, Ns = (e, t, n, o) => {
  const r = e._zod.def;
  U(r.innerType, t, o);
  const i = t.seen.get(e);
  i.ref = r.innerType;
}, xs = (e, t, n, o) => {
  const r = e._zod.def;
  U(r.innerType, t, o);
  const i = t.seen.get(e);
  i.ref = r.innerType, n.default = JSON.parse(JSON.stringify(r.defaultValue));
}, Cs = (e, t, n, o) => {
  const r = e._zod.def;
  U(r.innerType, t, o);
  const i = t.seen.get(e);
  i.ref = r.innerType, t.io === "input" && (n._prefault = JSON.parse(JSON.stringify(r.defaultValue)));
}, Ts = (e, t, n, o) => {
  const r = e._zod.def;
  U(r.innerType, t, o);
  const i = t.seen.get(e);
  i.ref = r.innerType;
  let s;
  try {
    s = r.catchValue(void 0);
  } catch {
    throw new Error("Dynamic catch values are not supported in JSON Schema");
  }
  n.default = s;
}, Zs = (e, t, n, o) => {
  const r = e._zod.def, i = t.io === "input" ? r.in._zod.def.type === "transform" ? r.out : r.in : r.out;
  U(i, t, o);
  const s = t.seen.get(e);
  s.ref = i;
}, Is = (e, t, n, o) => {
  const r = e._zod.def;
  U(r.innerType, t, o);
  const i = t.seen.get(e);
  i.ref = r.innerType, n.readOnly = !0;
}, wn = (e, t, n, o) => {
  const r = e._zod.def;
  U(r.innerType, t, o);
  const i = t.seen.get(e);
  i.ref = r.innerType;
}, Rs = /* @__PURE__ */ h("ZodISODateTime", (e, t) => {
  Pr.init(e, t), P.init(e, t);
});
function Ls(e) {
  return /* @__PURE__ */ Bi(Rs, e);
}
const As = /* @__PURE__ */ h("ZodISODate", (e, t) => {
  Or.init(e, t), P.init(e, t);
});
function Ps(e) {
  return /* @__PURE__ */ Fi(As, e);
}
const Os = /* @__PURE__ */ h("ZodISOTime", (e, t) => {
  jr.init(e, t), P.init(e, t);
});
function js(e) {
  return /* @__PURE__ */ Ui(Os, e);
}
const Ms = /* @__PURE__ */ h("ZodISODuration", (e, t) => {
  Mr.init(e, t), P.init(e, t);
});
function Ds(e) {
  return /* @__PURE__ */ Hi(Ms, e);
}
const Bs = (e, t) => {
  tn.init(e, t), e.name = "ZodError", Object.defineProperties(e, {
    format: {
      value: (n) => Co(e, n)
      // enumerable: false,
    },
    flatten: {
      value: (n) => xo(e, n)
      // enumerable: false,
    },
    addIssue: {
      value: (n) => {
        e.issues.push(n), e.message = JSON.stringify(e.issues, et, 2);
      }
      // enumerable: false,
    },
    addIssues: {
      value: (n) => {
        e.issues.push(...n), e.message = JSON.stringify(e.issues, et, 2);
      }
      // enumerable: false,
    },
    isEmpty: {
      get() {
        return e.issues.length === 0;
      }
      // enumerable: false,
    }
  });
}, X = h("ZodError", Bs, {
  Parent: Error
}), Fs = /* @__PURE__ */ at(X), Us = /* @__PURE__ */ ct(X), Hs = /* @__PURE__ */ Be(X), Js = /* @__PURE__ */ Fe(X), Vs = /* @__PURE__ */ Io(X), Ws = /* @__PURE__ */ Ro(X), qs = /* @__PURE__ */ Lo(X), Xs = /* @__PURE__ */ Ao(X), Ys = /* @__PURE__ */ Po(X), Gs = /* @__PURE__ */ Oo(X), Ks = /* @__PURE__ */ jo(X), Qs = /* @__PURE__ */ Mo(X), j = /* @__PURE__ */ h("ZodType", (e, t) => (O.init(e, t), Object.assign(e["~standard"], {
  jsonSchema: {
    input: Pe(e, "input"),
    output: Pe(e, "output")
  }
}), e.toJSONSchema = ds(e, {}), e.def = t, e.type = t.type, Object.defineProperty(e, "_def", { value: t }), e.check = (...n) => e.clone(ne(t, {
  checks: [
    ...t.checks ?? [],
    ...n.map((o) => typeof o == "function" ? { _zod: { check: o, def: { check: "custom" }, onattach: [] } } : o)
  ]
}), {
  parent: !0
}), e.with = e.check, e.clone = (n, o) => oe(e, n, o), e.brand = () => e, e.register = (n, o) => (n.add(e, o), e), e.parse = (n, o) => Fs(e, n, o, { callee: e.parse }), e.safeParse = (n, o) => Hs(e, n, o), e.parseAsync = async (n, o) => Us(e, n, o, { callee: e.parseAsync }), e.safeParseAsync = async (n, o) => Js(e, n, o), e.spa = e.safeParseAsync, e.encode = (n, o) => Vs(e, n, o), e.decode = (n, o) => Ws(e, n, o), e.encodeAsync = async (n, o) => qs(e, n, o), e.decodeAsync = async (n, o) => Xs(e, n, o), e.safeEncode = (n, o) => Ys(e, n, o), e.safeDecode = (n, o) => Gs(e, n, o), e.safeEncodeAsync = async (n, o) => Ks(e, n, o), e.safeDecodeAsync = async (n, o) => Qs(e, n, o), e.refine = (n, o) => e.check(Ja(n, o)), e.superRefine = (n) => e.check(Va(n)), e.overwrite = (n) => e.check(/* @__PURE__ */ fe(n)), e.optional = () => Dt(e), e.exactOptional = () => Ra(e), e.nullable = () => Bt(e), e.nullish = () => Dt(Bt(e)), e.nonoptional = (n) => ja(e, n), e.array = () => Ee(e), e.or = (n) => $a([e, n]), e.and = (n) => Na(e, n), e.transform = (n) => Ft(e, Za(n)), e.default = (n) => Aa(e, n), e.prefault = (n) => Oa(e, n), e.catch = (n) => Da(e, n), e.pipe = (n) => Ft(e, n), e.readonly = () => Ua(e), e.describe = (n) => {
  const o = e.clone();
  return ve.add(o, { description: n }), o;
}, Object.defineProperty(e, "description", {
  get() {
    var n;
    return (n = ve.get(e)) == null ? void 0 : n.description;
  },
  configurable: !0
}), e.meta = (...n) => {
  if (n.length === 0)
    return ve.get(e);
  const o = e.clone();
  return ve.add(o, n[0]), o;
}, e.isOptional = () => e.safeParse(void 0).success, e.isNullable = () => e.safeParse(null).success, e.apply = (n) => n(e), e)), kn = /* @__PURE__ */ h("_ZodString", (e, t) => {
  ut.init(e, t), j.init(e, t), e._zod.processJSONSchema = (o, r, i) => ps(e, o, r);
  const n = e._zod.bag;
  e.format = n.format ?? null, e.minLength = n.minimum ?? null, e.maxLength = n.maximum ?? null, e.regex = (...o) => e.check(/* @__PURE__ */ Yi(...o)), e.includes = (...o) => e.check(/* @__PURE__ */ Qi(...o)), e.startsWith = (...o) => e.check(/* @__PURE__ */ es(...o)), e.endsWith = (...o) => e.check(/* @__PURE__ */ ts(...o)), e.min = (...o) => e.check(/* @__PURE__ */ Ae(...o)), e.max = (...o) => e.check(/* @__PURE__ */ _n(...o)), e.length = (...o) => e.check(/* @__PURE__ */ bn(...o)), e.nonempty = (...o) => e.check(/* @__PURE__ */ Ae(1, ...o)), e.lowercase = (o) => e.check(/* @__PURE__ */ Gi(o)), e.uppercase = (o) => e.check(/* @__PURE__ */ Ki(o)), e.trim = () => e.check(/* @__PURE__ */ os()), e.normalize = (...o) => e.check(/* @__PURE__ */ ns(...o)), e.toLowerCase = () => e.check(/* @__PURE__ */ rs()), e.toUpperCase = () => e.check(/* @__PURE__ */ is()), e.slugify = () => e.check(/* @__PURE__ */ ss());
}), En = /* @__PURE__ */ h("ZodString", (e, t) => {
  ut.init(e, t), kn.init(e, t), e.email = (n) => e.check(/* @__PURE__ */ yi(ea, n)), e.url = (n) => e.check(/* @__PURE__ */ $i(ta, n)), e.jwt = (n) => e.check(/* @__PURE__ */ Di(_a, n)), e.emoji = (n) => e.check(/* @__PURE__ */ Si(na, n)), e.guid = (n) => e.check(/* @__PURE__ */ Lt(jt, n)), e.uuid = (n) => e.check(/* @__PURE__ */ wi(Ne, n)), e.uuidv4 = (n) => e.check(/* @__PURE__ */ ki(Ne, n)), e.uuidv6 = (n) => e.check(/* @__PURE__ */ Ei(Ne, n)), e.uuidv7 = (n) => e.check(/* @__PURE__ */ zi(Ne, n)), e.nanoid = (n) => e.check(/* @__PURE__ */ Ni(oa, n)), e.guid = (n) => e.check(/* @__PURE__ */ Lt(jt, n)), e.cuid = (n) => e.check(/* @__PURE__ */ xi(ra, n)), e.cuid2 = (n) => e.check(/* @__PURE__ */ Ci(ia, n)), e.ulid = (n) => e.check(/* @__PURE__ */ Ti(sa, n)), e.base64 = (n) => e.check(/* @__PURE__ */ Oi(pa, n)), e.base64url = (n) => e.check(/* @__PURE__ */ ji(fa, n)), e.xid = (n) => e.check(/* @__PURE__ */ Zi(aa, n)), e.ksuid = (n) => e.check(/* @__PURE__ */ Ii(ca, n)), e.ipv4 = (n) => e.check(/* @__PURE__ */ Ri(ua, n)), e.ipv6 = (n) => e.check(/* @__PURE__ */ Li(la, n)), e.cidrv4 = (n) => e.check(/* @__PURE__ */ Ai(da, n)), e.cidrv6 = (n) => e.check(/* @__PURE__ */ Pi(ha, n)), e.e164 = (n) => e.check(/* @__PURE__ */ Mi(ma, n)), e.datetime = (n) => e.check(Ls(n)), e.date = (n) => e.check(Ps(n)), e.time = (n) => e.check(js(n)), e.duration = (n) => e.check(Ds(n));
});
function J(e) {
  return /* @__PURE__ */ vi(En, e);
}
const P = /* @__PURE__ */ h("ZodStringFormat", (e, t) => {
  A.init(e, t), kn.init(e, t);
}), ea = /* @__PURE__ */ h("ZodEmail", (e, t) => {
  Nr.init(e, t), P.init(e, t);
}), jt = /* @__PURE__ */ h("ZodGUID", (e, t) => {
  $r.init(e, t), P.init(e, t);
}), Ne = /* @__PURE__ */ h("ZodUUID", (e, t) => {
  Sr.init(e, t), P.init(e, t);
}), ta = /* @__PURE__ */ h("ZodURL", (e, t) => {
  xr.init(e, t), P.init(e, t);
}), na = /* @__PURE__ */ h("ZodEmoji", (e, t) => {
  Cr.init(e, t), P.init(e, t);
}), oa = /* @__PURE__ */ h("ZodNanoID", (e, t) => {
  Tr.init(e, t), P.init(e, t);
}), ra = /* @__PURE__ */ h("ZodCUID", (e, t) => {
  Zr.init(e, t), P.init(e, t);
}), ia = /* @__PURE__ */ h("ZodCUID2", (e, t) => {
  Ir.init(e, t), P.init(e, t);
}), sa = /* @__PURE__ */ h("ZodULID", (e, t) => {
  Rr.init(e, t), P.init(e, t);
}), aa = /* @__PURE__ */ h("ZodXID", (e, t) => {
  Lr.init(e, t), P.init(e, t);
}), ca = /* @__PURE__ */ h("ZodKSUID", (e, t) => {
  Ar.init(e, t), P.init(e, t);
}), ua = /* @__PURE__ */ h("ZodIPv4", (e, t) => {
  Dr.init(e, t), P.init(e, t);
}), la = /* @__PURE__ */ h("ZodIPv6", (e, t) => {
  Br.init(e, t), P.init(e, t);
}), da = /* @__PURE__ */ h("ZodCIDRv4", (e, t) => {
  Fr.init(e, t), P.init(e, t);
}), ha = /* @__PURE__ */ h("ZodCIDRv6", (e, t) => {
  Ur.init(e, t), P.init(e, t);
}), pa = /* @__PURE__ */ h("ZodBase64", (e, t) => {
  Hr.init(e, t), P.init(e, t);
}), fa = /* @__PURE__ */ h("ZodBase64URL", (e, t) => {
  Vr.init(e, t), P.init(e, t);
}), ma = /* @__PURE__ */ h("ZodE164", (e, t) => {
  Wr.init(e, t), P.init(e, t);
}), _a = /* @__PURE__ */ h("ZodJWT", (e, t) => {
  Xr.init(e, t), P.init(e, t);
}), lt = /* @__PURE__ */ h("ZodNumber", (e, t) => {
  hn.init(e, t), j.init(e, t), e._zod.processJSONSchema = (o, r, i) => fs(e, o, r), e.gt = (o, r) => e.check(/* @__PURE__ */ Pt(o, r)), e.gte = (o, r) => e.check(/* @__PURE__ */ Xe(o, r)), e.min = (o, r) => e.check(/* @__PURE__ */ Xe(o, r)), e.lt = (o, r) => e.check(/* @__PURE__ */ At(o, r)), e.lte = (o, r) => e.check(/* @__PURE__ */ qe(o, r)), e.max = (o, r) => e.check(/* @__PURE__ */ qe(o, r)), e.int = (o) => e.check(Mt(o)), e.safe = (o) => e.check(Mt(o)), e.positive = (o) => e.check(/* @__PURE__ */ Pt(0, o)), e.nonnegative = (o) => e.check(/* @__PURE__ */ Xe(0, o)), e.negative = (o) => e.check(/* @__PURE__ */ At(0, o)), e.nonpositive = (o) => e.check(/* @__PURE__ */ qe(0, o)), e.multipleOf = (o, r) => e.check(/* @__PURE__ */ Ot(o, r)), e.step = (o, r) => e.check(/* @__PURE__ */ Ot(o, r)), e.finite = () => e;
  const n = e._zod.bag;
  e.minValue = Math.max(n.minimum ?? Number.NEGATIVE_INFINITY, n.exclusiveMinimum ?? Number.NEGATIVE_INFINITY) ?? null, e.maxValue = Math.min(n.maximum ?? Number.POSITIVE_INFINITY, n.exclusiveMaximum ?? Number.POSITIVE_INFINITY) ?? null, e.isInt = (n.format ?? "").includes("int") || Number.isSafeInteger(n.multipleOf ?? 0.5), e.isFinite = !0, e.format = n.format ?? null;
});
function re(e) {
  return /* @__PURE__ */ Ji(lt, e);
}
const ba = /* @__PURE__ */ h("ZodNumberFormat", (e, t) => {
  Yr.init(e, t), lt.init(e, t);
});
function Mt(e) {
  return /* @__PURE__ */ Vi(ba, e);
}
const zn = /* @__PURE__ */ h("ZodBoolean", (e, t) => {
  Gr.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, o, r) => ms(e, n, o);
});
function ga(e) {
  return /* @__PURE__ */ Wi(zn, e);
}
const va = /* @__PURE__ */ h("ZodUnknown", (e, t) => {
  Kr.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, o, r) => bs();
});
function Oe() {
  return /* @__PURE__ */ qi(va);
}
const ya = /* @__PURE__ */ h("ZodNever", (e, t) => {
  Qr.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, o, r) => _s(e, n, o);
});
function wa(e) {
  return /* @__PURE__ */ Xi(ya, e);
}
const ka = /* @__PURE__ */ h("ZodArray", (e, t) => {
  ei.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, o, r) => ws(e, n, o, r), e.element = t.element, e.min = (n, o) => e.check(/* @__PURE__ */ Ae(n, o)), e.nonempty = (n) => e.check(/* @__PURE__ */ Ae(1, n)), e.max = (n, o) => e.check(/* @__PURE__ */ _n(n, o)), e.length = (n, o) => e.check(/* @__PURE__ */ bn(n, o)), e.unwrap = () => e.element;
});
function Ee(e, t) {
  return /* @__PURE__ */ as(ka, e, t);
}
const Ea = /* @__PURE__ */ h("ZodObject", (e, t) => {
  ni.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, o, r) => ks(e, n, o, r), R(e, "shape", () => t.shape), e.keyof = () => $n(Object.keys(e._zod.def.shape)), e.catchall = (n) => e.clone({ ...e._zod.def, catchall: n }), e.passthrough = () => e.clone({ ...e._zod.def, catchall: Oe() }), e.loose = () => e.clone({ ...e._zod.def, catchall: Oe() }), e.strict = () => e.clone({ ...e._zod.def, catchall: wa() }), e.strip = () => e.clone({ ...e._zod.def, catchall: void 0 }), e.extend = (n) => Eo(e, n), e.safeExtend = (n) => zo(e, n), e.merge = (n) => $o(e, n), e.pick = (n) => wo(e, n), e.omit = (n) => ko(e, n), e.partial = (...n) => So(dt, e, n[0]), e.required = (...n) => No(Nn, e, n[0]);
});
function ze(e, t) {
  const n = {
    type: "object",
    shape: e ?? {},
    ...k(t)
  };
  return new Ea(n);
}
const za = /* @__PURE__ */ h("ZodUnion", (e, t) => {
  oi.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, o, r) => Es(e, n, o, r), e.options = t.options;
});
function $a(e, t) {
  return new za({
    type: "union",
    options: e,
    ...k(t)
  });
}
const Sa = /* @__PURE__ */ h("ZodIntersection", (e, t) => {
  ri.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, o, r) => zs(e, n, o, r);
});
function Na(e, t) {
  return new Sa({
    type: "intersection",
    left: e,
    right: t
  });
}
const xa = /* @__PURE__ */ h("ZodRecord", (e, t) => {
  ii.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, o, r) => $s(e, n, o, r), e.keyType = t.keyType, e.valueType = t.valueType;
});
function Ca(e, t, n) {
  return new xa({
    type: "record",
    keyType: e,
    valueType: t,
    ...k(n)
  });
}
const je = /* @__PURE__ */ h("ZodEnum", (e, t) => {
  si.init(e, t), j.init(e, t), e._zod.processJSONSchema = (o, r, i) => gs(e, o, r), e.enum = t.entries, e.options = Object.values(t.entries);
  const n = new Set(Object.keys(t.entries));
  e.extract = (o, r) => {
    const i = {};
    for (const s of o)
      if (n.has(s))
        i[s] = t.entries[s];
      else
        throw new Error(`Key ${s} not found in enum`);
    return new je({
      ...t,
      checks: [],
      ...k(r),
      entries: i
    });
  }, e.exclude = (o, r) => {
    const i = { ...t.entries };
    for (const s of o)
      if (n.has(s))
        delete i[s];
      else
        throw new Error(`Key ${s} not found in enum`);
    return new je({
      ...t,
      checks: [],
      ...k(r),
      entries: i
    });
  };
});
function $n(e, t) {
  const n = Array.isArray(e) ? Object.fromEntries(e.map((o) => [o, o])) : e;
  return new je({
    type: "enum",
    entries: n,
    ...k(t)
  });
}
const Ta = /* @__PURE__ */ h("ZodTransform", (e, t) => {
  ai.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, o, r) => ys(e, n), e._zod.parse = (n, o) => {
    if (o.direction === "backward")
      throw new Xt(e.constructor.name);
    n.addIssue = (i) => {
      if (typeof i == "string")
        n.issues.push(ke(i, n.value, t));
      else {
        const s = i;
        s.fatal && (s.continue = !1), s.code ?? (s.code = "custom"), s.input ?? (s.input = n.value), s.inst ?? (s.inst = e), n.issues.push(ke(s));
      }
    };
    const r = t.transform(n.value, n);
    return r instanceof Promise ? r.then((i) => (n.value = i, n)) : (n.value = r, n);
  };
});
function Za(e) {
  return new Ta({
    type: "transform",
    transform: e
  });
}
const dt = /* @__PURE__ */ h("ZodOptional", (e, t) => {
  mn.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, o, r) => wn(e, n, o, r), e.unwrap = () => e._zod.def.innerType;
});
function Dt(e) {
  return new dt({
    type: "optional",
    innerType: e
  });
}
const Ia = /* @__PURE__ */ h("ZodExactOptional", (e, t) => {
  ci.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, o, r) => wn(e, n, o, r), e.unwrap = () => e._zod.def.innerType;
});
function Ra(e) {
  return new Ia({
    type: "optional",
    innerType: e
  });
}
const La = /* @__PURE__ */ h("ZodNullable", (e, t) => {
  ui.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, o, r) => Ss(e, n, o, r), e.unwrap = () => e._zod.def.innerType;
});
function Bt(e) {
  return new La({
    type: "nullable",
    innerType: e
  });
}
const Sn = /* @__PURE__ */ h("ZodDefault", (e, t) => {
  li.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, o, r) => xs(e, n, o, r), e.unwrap = () => e._zod.def.innerType, e.removeDefault = e.unwrap;
});
function Aa(e, t) {
  return new Sn({
    type: "default",
    innerType: e,
    get defaultValue() {
      return typeof t == "function" ? t() : Qt(t);
    }
  });
}
const Pa = /* @__PURE__ */ h("ZodPrefault", (e, t) => {
  di.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, o, r) => Cs(e, n, o, r), e.unwrap = () => e._zod.def.innerType;
});
function Oa(e, t) {
  return new Pa({
    type: "prefault",
    innerType: e,
    get defaultValue() {
      return typeof t == "function" ? t() : Qt(t);
    }
  });
}
const Nn = /* @__PURE__ */ h("ZodNonOptional", (e, t) => {
  hi.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, o, r) => Ns(e, n, o, r), e.unwrap = () => e._zod.def.innerType;
});
function ja(e, t) {
  return new Nn({
    type: "nonoptional",
    innerType: e,
    ...k(t)
  });
}
const Ma = /* @__PURE__ */ h("ZodCatch", (e, t) => {
  pi.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, o, r) => Ts(e, n, o, r), e.unwrap = () => e._zod.def.innerType, e.removeCatch = e.unwrap;
});
function Da(e, t) {
  return new Ma({
    type: "catch",
    innerType: e,
    catchValue: typeof t == "function" ? t : () => t
  });
}
const Ba = /* @__PURE__ */ h("ZodPipe", (e, t) => {
  fi.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, o, r) => Zs(e, n, o, r), e.in = t.in, e.out = t.out;
});
function Ft(e, t) {
  return new Ba({
    type: "pipe",
    in: e,
    out: t
    // ...util.normalizeParams(params),
  });
}
const Fa = /* @__PURE__ */ h("ZodReadonly", (e, t) => {
  mi.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, o, r) => Is(e, n, o, r), e.unwrap = () => e._zod.def.innerType;
});
function Ua(e) {
  return new Fa({
    type: "readonly",
    innerType: e
  });
}
const Ha = /* @__PURE__ */ h("ZodCustom", (e, t) => {
  _i.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, o, r) => vs(e, n);
});
function Ja(e, t = {}) {
  return /* @__PURE__ */ cs(Ha, e, t);
}
function Va(e) {
  return /* @__PURE__ */ us(e);
}
const Wa = /* @__PURE__ */ new Set(["id", "image"]);
function nt(e) {
  return e instanceof dt ? nt(e.unwrap()) : e instanceof Sn ? nt(e._def.innerType) : e;
}
function qa(e) {
  const t = [];
  for (const [n, o] of Object.entries(e.shape)) {
    if (Wa.has(n)) continue;
    const r = o, i = nt(r), s = r.description ?? n;
    if (i instanceof zn) {
      t.push({ key: n, label: s, type: "boolean" });
      continue;
    }
    if (i instanceof je) {
      t.push({ key: n, label: s, type: "select", options: i.options });
      continue;
    }
    if (i instanceof lt) {
      const a = i;
      t.push({
        key: n,
        label: s,
        type: "number",
        min: a.minValue ?? void 0,
        max: a.maxValue ?? void 0
      });
      continue;
    }
    if (i instanceof En) {
      const a = i, c = n.toLowerCase().includes("emoji") || s.includes("אמוג");
      t.push({
        key: n,
        label: s,
        type: c ? "emoji" : "text",
        maxLength: a.maxLength ?? void 0
      });
      continue;
    }
    t.push({ key: n, label: s, type: "text" });
  }
  return t;
}
const Xa = ze({
  x: re().min(0).max(100),
  y: re().min(0).max(100)
}), Ya = ze({
  id: J(),
  shape: $n(["rect", "polygon"]).default("rect"),
  x: re().min(0).max(100),
  y: re().min(0).max(100),
  width: re().min(0).max(100),
  height: re().min(0).max(100),
  points: Ee(Xa).optional(),
  correct: ga().default(!1),
  label: J().optional()
}), ht = ze({
  id: J(),
  image: J().optional(),
  zones: Ee(Ya).optional()
}).passthrough(), Ga = ht.extend({
  target: J().max(2).describe("אות יעד"),
  correct: J().describe("תשובה נכונה"),
  correctEmoji: J().describe("אמוג'י")
}), Ka = ht.extend({
  target: J().max(2).describe("אות יעד"),
  correct: J().describe("תשובה נכונה"),
  correctEmoji: J().describe("אמוג'י")
}), Qa = ze({
  title: J().default(""),
  type: J().default("multiple-choice")
}).passthrough(), Rc = ze({
  id: J(),
  version: re().default(1),
  meta: Qa.default({ title: "", type: "multiple-choice" }),
  rounds: Ee(Ca(J(), Oe())).default([]),
  distractors: Ee(Oe()).default([])
}), ec = ht.extend({
  instruction: J().optional().describe("הוראה")
}), Ut = {
  "multiple-choice": Ga,
  "drag-match": Ka,
  "zone-tap": ec
};
function tc(e, { onFieldChange: t, onDeleteRound: n, roundSchema: o }) {
  const r = document.createElement("div");
  r.className = "ab-editor-inspector";
  const i = document.createElement("div");
  i.className = "ab-editor-inspector__header", i.innerHTML = '<span class="ab-editor-inspector__title">✏️ ערוך סיבוב</span>', r.appendChild(i);
  const s = document.createElement("div");
  s.className = "ab-editor-inspector__body", r.appendChild(s);
  const a = document.createElement("button");
  a.className = "ab-editor-inspector__delete", a.textContent = "🗑 מחק סיבוב", r.appendChild(a), e.appendChild(r);
  let c = null;
  function u() {
    s.innerHTML = '<p class="ab-editor-inspector__empty">בחר סיבוב לעריכה</p>', a.hidden = !0, c = null;
  }
  function l(_, E = "multiple-choice") {
    c = _.id, s.innerHTML = "", a.hidden = !1;
    const g = o ?? Ut[E] ?? Ut["multiple-choice"];
    qa(g).forEach((z) => s.appendChild(d(z, _))), s.appendChild($(_)), a.onclick = () => {
      confirm("למחוק את הסיבוב הזה?") && (n(c), u());
    };
  }
  function d(_, E) {
    const g = document.createElement("div");
    g.className = "ab-editor-field";
    const T = document.createElement("label");
    switch (T.className = "ab-editor-field__label", T.textContent = _.label, g.appendChild(T), _.type) {
      case "emoji":
        g.appendChild(f(_, E));
        break;
      case "boolean":
        g.appendChild(v(_, E));
        break;
      case "select":
        g.appendChild(b(_, E));
        break;
      case "number":
        g.appendChild(C(_, E));
        break;
      default:
        g.appendChild(m(_, E));
        break;
    }
    return g;
  }
  function m(_, E) {
    const g = document.createElement("input");
    return g.className = "ab-editor-field__input", g.type = "text", g.value = String(E[_.key] ?? ""), g.dir = "rtl", _.maxLength && (g.maxLength = _.maxLength), g.addEventListener("input", () => t(c, _.key, g.value)), g;
  }
  function f(_, E) {
    const g = document.createElement("div");
    g.className = "ab-editor-field__emoji-row";
    const T = document.createElement("div");
    T.className = "ab-editor-field__emoji-preview", T.textContent = String(E[_.key] ?? "❓"), g.appendChild(T);
    const z = document.createElement("input");
    return z.className = "ab-editor-field__input", z.type = "text", z.value = String(E[_.key] ?? ""), z.maxLength = 8, z.placeholder = "🐱", z.style.fontSize = "20px", z.addEventListener("input", () => {
      T.textContent = z.value || "❓", t(c, _.key, z.value);
    }), g.appendChild(z), g;
  }
  function v(_, E) {
    const g = document.createElement("input");
    return g.type = "checkbox", g.checked = !!E[_.key], g.addEventListener("change", () => t(c, _.key, g.checked)), g;
  }
  function b(_, E) {
    const g = document.createElement("select");
    return g.className = "ab-editor-field__input", (_.options ?? []).forEach((T) => {
      const z = document.createElement("option");
      z.value = T, z.textContent = T, E[_.key] === T && (z.selected = !0), g.appendChild(z);
    }), g.addEventListener("change", () => t(c, _.key, g.value)), g;
  }
  function C(_, E) {
    const g = document.createElement("input");
    return g.className = "ab-editor-field__input", g.type = "number", g.value = String(E[_.key] ?? ""), _.min !== void 0 && (g.min = String(_.min)), _.max !== void 0 && (g.max = String(_.max)), g.addEventListener("input", () => t(c, _.key, Number(g.value))), g;
  }
  function $(_) {
    const E = document.createElement("div");
    E.className = "ab-editor-field ab-editor-field--image";
    const g = document.createElement("label");
    g.className = "ab-editor-field__label", g.textContent = "🖼 תמונה", E.appendChild(g);
    const T = document.createElement("div");
    T.className = "ab-editor-field__img-row";
    const z = document.createElement("div");
    z.className = "ab-editor-field__img-preview", _.image && (z.style.backgroundImage = `url(${_.image})`), T.appendChild(z);
    const S = document.createElement("div");
    S.className = "ab-editor-field__img-btns";
    const w = document.createElement("input");
    w.type = "file", w.accept = "image/*", w.style.display = "none", w.addEventListener("change", () => {
      var p;
      const W = (p = w.files) == null ? void 0 : p[0];
      if (!W) return;
      const q = new FileReader();
      q.onload = (y) => {
        const x = y.target.result;
        z.style.backgroundImage = `url(${x})`, I.textContent = "🔄 החלף", t(c, "image", x), B.isConnected || S.appendChild(B);
      }, q.readAsDataURL(W);
    }), S.appendChild(w);
    const I = document.createElement("button");
    I.className = "ab-editor-btn ab-editor-btn--img-upload", I.textContent = _.image ? "🔄 החלף" : "📤 העלה", I.addEventListener("click", () => w.click()), S.appendChild(I);
    const B = document.createElement("button");
    return B.className = "ab-editor-btn ab-editor-btn--img-clear", B.textContent = "✕ הסר", B.addEventListener("click", () => {
      z.style.backgroundImage = "", I.textContent = "📤 העלה", t(c, "image", null), B.remove();
    }), _.image && S.appendChild(B), T.appendChild(S), E.appendChild(T), E;
  }
  function N() {
    r.remove();
  }
  return u(), { loadRound: l, clear: u, destroy: N };
}
function nc() {
  return ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/ogg"].find((t) => MediaRecorder.isTypeSupported(t)) || "";
}
function oc() {
  var e;
  return typeof navigator < "u" && typeof ((e = navigator.mediaDevices) == null ? void 0 : e.getUserMedia) == "function" && typeof MediaRecorder < "u";
}
function rc() {
  let e = null, t = null, n = [];
  async function o() {
    if (e && e.state === "recording") return;
    t = await navigator.mediaDevices.getUserMedia({ audio: !0, video: !1 }), n = [];
    const c = {}, u = nc();
    u && (c.mimeType = u), e = new MediaRecorder(t, c), e.ondataavailable = (l) => {
      var d;
      ((d = l.data) == null ? void 0 : d.size) > 0 && n.push(l.data);
    }, e.start(100);
  }
  function r() {
    return new Promise((c, u) => {
      if (!e || e.state === "inactive") {
        u(new Error("[voice-recorder] not recording"));
        return;
      }
      e.onstop = () => {
        const l = new Blob(n, { type: e.mimeType || "audio/webm" });
        s(), c(l);
      }, e.onerror = (l) => {
        s(), u(l.error);
      }, e.stop();
    });
  }
  function i() {
    e && e.state !== "inactive" && (e.ondataavailable = null, e.onstop = null, e.stop()), s();
  }
  function s() {
    t == null || t.getTracks().forEach((c) => c.stop()), t = null, e = null, n = [];
  }
  function a() {
    return (e == null ? void 0 : e.state) === "recording";
  }
  return { start: o, stop: r, cancel: i, isActive: a };
}
const ic = "alefbet-voices", Q = "recordings", sc = 1;
let be = null;
function He() {
  return be || (be = new Promise((e, t) => {
    const n = indexedDB.open(ic, sc);
    n.onupgradeneeded = () => {
      n.result.createObjectStore(Q);
    }, n.onsuccess = () => e(n.result), n.onerror = () => {
      be = null, t(n.error);
    };
  }), be);
}
function pt(e, t) {
  return `${e}/${t}`;
}
async function ac(e, t, n) {
  const o = await He();
  return new Promise((r, i) => {
    const s = o.transaction(Q, "readwrite");
    s.objectStore(Q).put(n, pt(e, t)), s.oncomplete = r, s.onerror = (a) => i(a.target.error);
  });
}
async function ft(e, t) {
  const n = await He();
  return new Promise((o, r) => {
    const s = n.transaction(Q, "readonly").objectStore(Q).get(pt(e, t));
    s.onsuccess = () => o(s.result ?? null), s.onerror = (a) => r(a.target.error);
  });
}
async function cc(e, t) {
  const n = await He();
  return new Promise((o, r) => {
    const i = n.transaction(Q, "readwrite");
    i.objectStore(Q).delete(pt(e, t)), i.oncomplete = o, i.onerror = (s) => r(s.target.error);
  });
}
async function Lc(e) {
  const t = await He();
  return new Promise((n, o) => {
    const i = t.transaction(Q, "readonly").objectStore(Q).getAllKeys();
    i.onsuccess = () => {
      const s = `${e}/`;
      n(
        (i.result || []).filter((a) => a.startsWith(s)).map((a) => a.slice(s.length))
      );
    }, i.onerror = (s) => o(s.target.error);
  });
}
async function ye(e, t) {
  let n;
  try {
    n = await ft(e, t);
  } catch {
    return !1;
  }
  return n ? new Promise((o) => {
    const r = URL.createObjectURL(n), i = new Audio(r), s = (a) => {
      URL.revokeObjectURL(r), o(a);
    };
    i.onended = () => s(!0), i.onerror = () => s(!1), i.play().catch(() => s(!1));
  }) : !1;
}
async function Ac(e, t) {
  return await ft(e, t).catch(() => null) !== null;
}
function xn(e, {
  gameId: t,
  voiceKey: n,
  label: o = "הקלטת קול",
  onSaved: r,
  onDeleted: i
}) {
  if (!oc()) {
    const w = document.createElement("span");
    return w.className = "ab-voice-unsupported", w.textContent = "🎤 הקלטה לא נתמכת בדפדפן זה", e.appendChild(w), { refresh: async () => {
    }, destroy: () => w.remove() };
  }
  const s = rc(), a = document.createElement("div");
  a.className = "ab-voice-btn-wrap", a.setAttribute("aria-label", o), e.appendChild(a);
  let c = "idle", u = null, l = null, d = null, m = null, f = null, v = null, b = 0;
  function C() {
    if (a.innerHTML = "", c === "idle")
      u = $("🎤", "ab-voice-btn ab-voice-btn--record", "התחל הקלטה", N), a.appendChild(u);
    else if (c === "recording") {
      f = document.createElement("span"), f.className = "ab-voice-indicator", a.appendChild(f);
      const w = document.createElement("span");
      w.className = "ab-voice-timer", w.textContent = "0:00", a.appendChild(w), b = 0, v = setInterval(() => {
        b++;
        const I = Math.floor(b / 60), B = String(b % 60).padStart(2, "0");
        w.textContent = `${I}:${B}`, b >= 120 && _();
      }, 1e3), l = $("⏹", "ab-voice-btn ab-voice-btn--stop", "עצור הקלטה", _), a.appendChild(l);
    } else c === "has-voice" && (d = $("▶", "ab-voice-btn ab-voice-btn--play", "נגן הקלטה", E), a.appendChild(d), u = $("🎤", "ab-voice-btn ab-voice-btn--re-record", "הקלט מחדש", N), a.appendChild(u), m = $("🗑", "ab-voice-btn ab-voice-btn--delete", "מחק הקלטה", g), a.appendChild(m));
  }
  function $(w, I, B, W) {
    const q = document.createElement("button");
    return q.className = I, q.type = "button", q.title = B, q.setAttribute("aria-label", B), q.textContent = w, q.addEventListener("click", W), q;
  }
  async function N() {
    try {
      await s.start(), c = "recording", C();
    } catch (w) {
      console.warn("[voice-record-button] microphone access denied:", w), T("לא ניתן לגשת למיקרופון");
    }
  }
  async function _() {
    clearInterval(v);
    try {
      const w = await s.stop();
      await ac(t, n, w), c = "has-voice", C(), r == null || r(w);
    } catch (w) {
      console.warn("[voice-record-button] stop error:", w), c = "idle", C();
    }
  }
  async function E() {
    d == null || d.setAttribute("disabled", "true"), await ye(t, n), d == null || d.removeAttribute("disabled");
  }
  async function g() {
    confirm("למחוק את ההקלטה?") && (await cc(t, n), c = "idle", C(), i == null || i());
  }
  function T(w) {
    const I = document.createElement("span");
    I.className = "ab-voice-error", I.textContent = w, a.appendChild(I), setTimeout(() => I.remove(), 3e3);
  }
  async function z() {
    if (s.isActive()) return;
    c = await ft(t, n).catch(() => null) ? "has-voice" : "idle", C();
  }
  function S() {
    clearInterval(v), s.isActive() && s.cancel(), a.remove();
  }
  return z(), { refresh: z, destroy: S };
}
const uc = [
  {
    id: "instructions",
    label: "📝 הוראות",
    slots: [
      { key: "instruction-welcome", label: "ברוכים הבאים" },
      { key: "instruction-how-to", label: "איך משחקים" },
      { key: "instruction-complete", label: "סיום המשחק" }
    ]
  },
  {
    id: "feedback",
    label: "✅ משוב",
    slots: [
      { key: "feedback-correct", label: "תשובה נכונה — כל הכבוד!" },
      { key: "feedback-wrong", label: "תשובה שגויה" },
      { key: "feedback-try-again", label: "נסה שוב" },
      { key: "feedback-encourage", label: "עידוד כללי" }
    ]
  },
  {
    id: "nikud",
    label: "◌ ניקוד",
    slots: [
      { key: "nikud-patah", label: "פַּתַח" },
      { key: "nikud-kamatz", label: "קָמַץ" },
      { key: "nikud-hiriq", label: "חִירִיק" },
      { key: "nikud-tsere", label: "צֵרֵי" },
      { key: "nikud-segol", label: "סֶגּוֹל" },
      { key: "nikud-holam", label: "חוֹלָם" },
      { key: "nikud-shuruq", label: "שׁוּרוּק" }
    ]
  }
];
function lc(e) {
  return e.trim().replace(/\s+/g, "-").replace(/[^a-z0-9\u05D0-\u05EA_-]/gi, "").toLowerCase() || `custom-${Date.now()}`;
}
function dc(e) {
  return Vt(`alefbet.audio-manager.${e}.custom`, []);
}
function hc(e, t = null) {
  var u;
  (u = document.getElementById("ab-audio-manager")) == null || u.remove();
  const n = document.createElement("div");
  n.id = "ab-audio-manager", n.className = "ab-am-modal", n.setAttribute("role", "dialog"), n.setAttribute("aria-modal", "true"), n.setAttribute("aria-label", "מנהל הקלטות"), n.innerHTML = `
    <div class="ab-am-backdrop"></div>
    <div class="ab-am-box">
      <div class="ab-am-header">
        <span class="ab-am-title">🎤 מנהל הקלטות</span>
        <span class="ab-am-subtitle">כל ההקלטות נשמרות בדפדפן וניתן להשתמש בהן דרך <code>playVoice('${e}', voiceKey)</code></span>
        <button class="ab-am-close" aria-label="סגור">✕</button>
      </div>
      <div class="ab-am-body" id="ab-am-body"></div>
    </div>
  `, document.body.appendChild(n);
  const o = n.querySelector("#ab-am-body"), r = n.querySelector(".ab-am-close"), i = n.querySelector(".ab-am-backdrop"), s = [], a = [...uc];
  t && t.rounds.length > 0 && a.splice(1, 0, {
    // insert after Instructions
    id: "rounds",
    label: "🔤 שאלות / סיבובים",
    slots: t.rounds.map((l, d) => ({
      key: l.id,
      label: `סיבוב ${d + 1}${l.target ? " — " + l.target : ""}${l.correct ? " (" + l.correct + ")" : ""}`
    }))
  }), a.forEach((l) => {
    o.appendChild(pc(l, e, s));
  }), o.appendChild(fc(e, s));
  function c() {
    s.forEach((l) => l.destroy()), n.remove();
  }
  r.addEventListener("click", c), i.addEventListener("click", c), document.addEventListener("keydown", function l(d) {
    d.key === "Escape" && (c(), document.removeEventListener("keydown", l));
  });
}
function pc(e, t, n) {
  const o = document.createElement("section");
  o.className = "ab-am-section";
  const r = document.createElement("button");
  r.className = "ab-am-section__heading", r.setAttribute("aria-expanded", "true"), r.innerHTML = `<span>${e.label}</span><span class="ab-am-chevron">▾</span>`, o.appendChild(r);
  const i = document.createElement("div");
  return i.className = "ab-am-grid", o.appendChild(i), e.slots.forEach((s) => {
    i.appendChild(Cn(t, s.key, s.label, n));
  }), r.addEventListener("click", () => {
    const s = r.getAttribute("aria-expanded") === "true";
    r.setAttribute("aria-expanded", String(!s)), i.hidden = s, r.querySelector(".ab-am-chevron").textContent = s ? "▸" : "▾";
  }), o;
}
function fc(e, t) {
  const n = dc(e), o = document.createElement("section");
  o.className = "ab-am-section";
  const r = document.createElement("button");
  r.className = "ab-am-section__heading", r.setAttribute("aria-expanded", "true"), r.innerHTML = '<span>➕ מותאם אישית</span><span class="ab-am-chevron">▾</span>', o.appendChild(r);
  const i = document.createElement("div");
  i.className = "ab-am-grid", o.appendChild(i);
  function s() {
    i.querySelectorAll(".ab-am-row").forEach((d) => {
      const m = d._voiceBtn;
      m && (t.splice(t.indexOf(m), 1), m.destroy());
    }), i.innerHTML = "", n.get().forEach((d) => {
      const m = Cn(e, d.key, d.label, t, () => {
        n.update((f) => f.filter((v) => v.key !== d.key)), s();
      });
      i.appendChild(m);
    });
  }
  s();
  const a = document.createElement("div");
  a.className = "ab-am-add-row", a.innerHTML = `
    <input class="ab-am-add-input" type="text" placeholder="שם ההקלטה... (למשל: שאלה ראשונה)" dir="rtl" />
    <button class="ab-am-add-btn">+ הוסף</button>
  `, o.appendChild(a);
  const c = a.querySelector(".ab-am-add-input"), u = a.querySelector(".ab-am-add-btn");
  function l() {
    const d = c.value.trim();
    if (!d) return;
    const m = lc(d);
    if (n.get().some((f) => f.key === m)) {
      c.select();
      return;
    }
    n.update((f) => [...f, { key: m, label: d }]), c.value = "", s();
  }
  return u.addEventListener("click", l), c.addEventListener("keydown", (d) => {
    d.key === "Enter" && l();
  }), r.addEventListener("click", () => {
    const d = r.getAttribute("aria-expanded") === "true";
    r.setAttribute("aria-expanded", String(!d)), i.hidden = d, a.hidden = d, r.querySelector(".ab-am-chevron").textContent = d ? "▸" : "▾";
  }), o;
}
function Cn(e, t, n, o, r = null) {
  const i = document.createElement("div");
  i.className = "ab-am-row";
  const s = document.createElement("div");
  s.className = "ab-am-row__label", s.textContent = n;
  const a = document.createElement("code");
  a.className = "ab-am-row__key", a.textContent = t;
  const c = document.createElement("div");
  c.className = "ab-am-row__label-col", c.appendChild(s), c.appendChild(a);
  const u = document.createElement("div");
  if (u.className = "ab-am-row__ctrl", r) {
    const d = document.createElement("button");
    d.className = "ab-am-row__del", d.title = "הסר", d.setAttribute("aria-label", "הסר הקלטה"), d.textContent = "✕", d.addEventListener("click", r), u.appendChild(d);
  }
  const l = xn(u, { gameId: e, voiceKey: t, label: n });
  return o.push(l), i._voiceBtn = l, i.appendChild(c), i.appendChild(u), i;
}
let mc = 0;
function Ht() {
  return `zone-${Date.now()}-${mc++}`;
}
function _c(e) {
  const t = e.map((i) => i.x), n = e.map((i) => i.y), o = Math.min(...t), r = Math.min(...n);
  return { x: o, y: r, width: Math.max(...t) - o, height: Math.max(...n) - r };
}
function bc(e, t, n, o, r) {
  return e.map((i) => {
    const s = o > 0 ? (i.x - t) / o * 100 : 0, a = r > 0 ? (i.y - n) / r * 100 : 0;
    return `${s},${a}`;
  }).join(" ");
}
function gc(e, t, { onChange: n, gameId: o }) {
  let r = structuredClone(t), i = null, s = "rect", a = [], c = null, u = [], l = null, d = null, m = null;
  const f = document.createElement("div");
  f.className = "ab-ze-overlay";
  const v = document.createElement("div");
  v.className = "ab-ze-draw-rect", v.hidden = !0, f.appendChild(v);
  const b = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  b.classList.add("ab-ze-poly-svg"), b.setAttribute("viewBox", "0 0 100 100"), b.setAttribute("preserveAspectRatio", "none"), b.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:12;", f.appendChild(b);
  const C = document.createElement("div");
  C.className = "ab-ze-toolbar", f.appendChild(C);
  function $() {
    C.innerHTML = "";
    const p = document.createElement("button");
    p.className = `ab-ze-tool-btn${s === "rect" ? " ab-ze-tool-btn--active" : ""}`, p.textContent = "▭ מלבן", p.addEventListener("click", () => {
      g("rect");
    }), C.appendChild(p);
    const y = document.createElement("button");
    y.className = `ab-ze-tool-btn${s === "polygon" ? " ab-ze-tool-btn--active" : ""}`, y.textContent = "✎ חופשי", y.addEventListener("click", () => {
      g("polygon");
    }), C.appendChild(y);
    const x = document.createElement("span");
    x.className = "ab-ze-toolbar__hint", x.textContent = s === "rect" ? "גררו לציור מלבן" : "לחצו נקודות, לחצו פעמיים לסגירה", C.appendChild(x);
  }
  e.style.position = "relative", e.appendChild(f), $();
  function N(p, y) {
    const x = f.getBoundingClientRect();
    return {
      px: Math.max(0, Math.min(100, (p - x.left) / x.width * 100)),
      py: Math.max(0, Math.min(100, (y - x.top) / x.height * 100))
    };
  }
  function _() {
    a.forEach((p) => p.destroy()), a = [], f.querySelectorAll(".ab-ze-zone").forEach((p) => p.remove()), f.querySelectorAll(".ab-ze-panel").forEach((p) => p.remove()), r.forEach((p) => {
      const y = document.createElement("div");
      if (y.className = "ab-ze-zone", p.correct && y.classList.add("ab-ze-zone--correct"), p.id === i && y.classList.add("ab-ze-zone--selected"), y.dataset.zoneId = p.id, y.style.left = `${p.x}%`, y.style.top = `${p.y}%`, y.style.width = `${p.width}%`, y.style.height = `${p.height}%`, p.shape === "polygon" && p.points && p.points.length >= 3) {
        const Z = `clip-${p.id}`;
        y.innerHTML = `<svg class="ab-ze-zone__poly-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs><clipPath id="${Z}"><polygon points="${bc(p.points, p.x, p.y, p.width, p.height)}"/></clipPath></defs>
          <rect x="0" y="0" width="100" height="100" clip-path="url(#${Z})" fill="currentColor"/>
        </svg>`, y.classList.add("ab-ze-zone--poly");
      }
      const x = document.createElement("div");
      x.className = "ab-ze-zone__badge", x.textContent = p.correct ? "✓" : "", p.label && (x.textContent = p.label), y.appendChild(x);
      const M = document.createElement("button");
      M.className = "ab-ze-zone__toggle", M.textContent = p.correct ? "✓ נכון" : "✗ לא נכון", M.title = "סמן כתשובה נכונה / לא נכונה", M.addEventListener("pointerdown", (Z) => Z.stopPropagation()), M.addEventListener("click", (Z) => {
        Z.stopPropagation(), p.correct = !p.correct, W(), _();
      }), y.appendChild(M);
      const L = document.createElement("button");
      if (L.className = "ab-ze-zone__delete", L.textContent = "✕", L.title = "מחק אזור", L.addEventListener("pointerdown", (Z) => Z.stopPropagation()), L.addEventListener("click", (Z) => {
        Z.stopPropagation(), r = r.filter((D) => D.id !== p.id), i === p.id && (i = null), W(), _();
      }), y.appendChild(L), p.shape !== "polygon" && p.id === i)
        for (const Z of ["nw", "ne", "sw", "se"]) {
          const D = document.createElement("div");
          D.className = `ab-ze-zone__handle ab-ze-zone__handle--${Z}`, D.dataset.handle = Z, D.addEventListener("pointerdown", (F) => {
            F.stopPropagation(), F.preventDefault(), m = {
              zoneId: p.id,
              handle: Z,
              origZone: { ...p },
              startX: F.clientX,
              startY: F.clientY
            };
          }), y.appendChild(D);
        }
      if (y.addEventListener("pointerdown", (Z) => {
        if (Z.stopPropagation(), m) return;
        i = p.id, _();
        const { px: D, py: F } = N(Z.clientX, Z.clientY);
        d = { zoneId: p.id, offsetX: D - p.x, offsetY: F - p.y };
      }), f.appendChild(y), p.id === i) {
        const Z = document.createElement("div");
        Z.className = "ab-ze-panel", Z.style.left = `${p.x}%`, Z.style.top = `${p.y + p.height + 1}%`;
        const D = document.createElement("div");
        D.className = "ab-ze-panel__row";
        const F = document.createElement("input");
        if (F.className = "ab-ze-panel__input", F.type = "text", F.dir = "rtl", F.placeholder = "תווית (למשל: חתול)", F.value = p.label || "", F.addEventListener("pointerdown", (Y) => Y.stopPropagation()), F.addEventListener("input", () => {
          p.label = F.value || void 0, W();
        }), D.appendChild(F), Z.appendChild(D), o) {
          const Y = document.createElement("div");
          Y.className = "ab-ze-panel__row";
          const Je = document.createElement("span");
          Je.className = "ab-ze-panel__audio-label", Je.textContent = "🎤", Y.appendChild(Je);
          const Zn = xn(Y, {
            gameId: o,
            voiceKey: `zone-${p.id}`,
            label: `הקלטה לאזור ${p.label || p.id}`
          });
          a.push(Zn), Z.appendChild(Y);
        }
        Z.addEventListener("pointerdown", (Y) => Y.stopPropagation()), f.appendChild(Z);
      }
    });
  }
  function E() {
    if (b.innerHTML = "", u.length === 0) return;
    const p = [...u];
    l && p.push(l);
    const y = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    y.setAttribute("points", p.map((x) => `${x.x},${x.y}`).join(" ")), y.setAttribute("fill", "rgba(251,191,36,0.15)"), y.setAttribute("stroke", "#fbbf24"), y.setAttribute("stroke-width", "0.4"), y.setAttribute("stroke-dasharray", "1,0.5"), b.appendChild(y), u.forEach((x, M) => {
      const L = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      L.setAttribute("cx", String(x.x)), L.setAttribute("cy", String(x.y)), L.setAttribute("r", "0.8"), L.setAttribute("fill", M === 0 ? "#22c55e" : "#fbbf24"), L.setAttribute("stroke", "#fff"), L.setAttribute("stroke-width", "0.3"), b.appendChild(L);
    });
  }
  function g(p) {
    u.length > 0 && (u = [], l = null, E()), s = p, f.classList.toggle("ab-ze-overlay--poly-mode", p === "polygon"), $();
  }
  function T() {
    if (!c) return;
    const p = Math.min(c.startX, c.curX), y = Math.min(c.startY, c.curY), x = Math.abs(c.curX - c.startX), M = Math.abs(c.curY - c.startY);
    v.style.left = `${p}%`, v.style.top = `${y}%`, v.style.width = `${x}%`, v.style.height = `${M}%`;
  }
  function z() {
    if (u.length < 3) {
      u = [], l = null, E();
      return;
    }
    const p = [...u], y = _c(p);
    if (y.width > 1 && y.height > 1) {
      const x = {
        id: Ht(),
        shape: "polygon",
        ...y,
        points: p,
        correct: !1
      };
      r.push(x), i = x.id, W();
    }
    u = [], l = null, E(), _();
  }
  function S(p) {
    if (p.button !== 0 || p.target.closest(".ab-ze-zone") || p.target.closest(".ab-ze-toolbar") || p.target.closest(".ab-ze-panel")) return;
    if (i = null, s === "polygon") {
      const { px: M, py: L } = N(p.clientX, p.clientY);
      if (u.length >= 3) {
        const Z = u[0];
        if (Math.abs(M - Z.x) < 2 && Math.abs(L - Z.y) < 2) {
          z();
          return;
        }
      }
      u.push({ x: M, y: L }), E(), _();
      return;
    }
    const { px: y, py: x } = N(p.clientX, p.clientY);
    c = { startX: y, startY: x, curX: y, curY: x }, v.hidden = !1, T(), _();
  }
  function w(p) {
    s === "polygon" && u.length >= 3 && (p.preventDefault(), z());
  }
  function I(p) {
    if (s === "polygon" && u.length > 0) {
      const { px: y, py: x } = N(p.clientX, p.clientY);
      l = { x: y, y: x }, E();
    }
    if (c) {
      const { px: y, py: x } = N(p.clientX, p.clientY);
      c.curX = y, c.curY = x, T();
      return;
    }
    if (m) {
      p.preventDefault();
      const y = r.find((F) => F.id === m.zoneId);
      if (!y) return;
      const x = m.origZone, M = f.getBoundingClientRect(), L = (p.clientX - m.startX) / M.width * 100, Z = (p.clientY - m.startY) / M.height * 100, D = m.handle;
      D.includes("e") && (y.width = Math.max(3, x.width + L)), D.includes("w") && (y.x = x.x + L, y.width = Math.max(3, x.width - L)), D.includes("s") && (y.height = Math.max(3, x.height + Z)), D.includes("n") && (y.y = x.y + Z, y.height = Math.max(3, x.height - Z)), _();
      return;
    }
    if (d) {
      p.preventDefault();
      const y = r.find((D) => D.id === d.zoneId);
      if (!y) return;
      const { px: x, py: M } = N(p.clientX, p.clientY), L = Math.max(0, Math.min(100 - y.width, x - d.offsetX)), Z = Math.max(0, Math.min(100 - y.height, M - d.offsetY));
      if (y.shape === "polygon" && y.points) {
        const D = L - y.x, F = Z - y.y;
        y.points = y.points.map((Y) => ({ x: Y.x + D, y: Y.y + F }));
      }
      y.x = L, y.y = Z, _();
    }
  }
  function B() {
    if (c) {
      const p = Math.min(c.startX, c.curX), y = Math.min(c.startY, c.curY), x = Math.abs(c.curX - c.startX), M = Math.abs(c.curY - c.startY);
      if (x > 3 && M > 3) {
        const L = {
          id: Ht(),
          shape: "rect",
          x: p,
          y,
          width: x,
          height: M,
          correct: !1
        };
        r.push(L), i = L.id, W();
      }
      c = null, v.hidden = !0, _();
      return;
    }
    if (m) {
      m = null, W();
      return;
    }
    d && (d = null, W());
  }
  function W() {
    n(structuredClone(r));
  }
  function q(p) {
    if (p.key === "Escape" && u.length > 0) {
      u = [], l = null, E();
      return;
    }
    if (p.key === "Enter" && u.length >= 3) {
      z();
      return;
    }
    i && ((p.key === "Delete" || p.key === "Backspace") && (r = r.filter((y) => y.id !== i), i = null, W(), _()), p.key === "Escape" && (i = null, _()));
  }
  return f.addEventListener("pointerdown", S), f.addEventListener("dblclick", w), document.addEventListener("pointermove", I), document.addEventListener("pointerup", B), document.addEventListener("keydown", q), _(), {
    setZones(p) {
      r = structuredClone(p), i = null, _();
    },
    getZones() {
      return structuredClone(r);
    },
    setTool(p) {
      g(p);
    },
    destroy() {
      f.removeEventListener("pointerdown", S), f.removeEventListener("dblclick", w), document.removeEventListener("pointermove", I), document.removeEventListener("pointerup", B), document.removeEventListener("keydown", q), a.forEach((p) => p.destroy()), f.remove();
    }
  };
}
let vc = 0;
function yc() {
  return `tpl-zone-${Date.now()}-${vc++}`;
}
const wc = [
  {
    id: "grid-2x2",
    name: "2×2 Grid",
    nameHe: "רשת 2×2",
    icon: "⊞",
    description: "ארבעה אזורים בפריסה שווה",
    zones: [
      { shape: "rect", x: 3, y: 3, width: 44, height: 44, correct: !1 },
      { shape: "rect", x: 53, y: 3, width: 44, height: 44, correct: !1 },
      { shape: "rect", x: 3, y: 53, width: 44, height: 44, correct: !1 },
      { shape: "rect", x: 53, y: 53, width: 44, height: 44, correct: !1 }
    ]
  },
  {
    id: "grid-3x3",
    name: "3×3 Grid",
    nameHe: "רשת 3×3",
    icon: "⊞",
    description: "תשעה אזורים בפריסה שווה",
    zones: (() => {
      const e = [];
      for (let t = 0; t < 3; t++)
        for (let n = 0; n < 3; n++)
          e.push({ shape: "rect", x: 2 + n * 33, y: 2 + t * 33, width: 30, height: 30, correct: !1 });
      return e;
    })()
  },
  {
    id: "two-columns",
    name: "Two Columns",
    nameHe: "שני עמודים",
    icon: "▮▮",
    description: "שני אזורים גדולים — ימין ושמאל",
    zones: [
      { shape: "rect", x: 3, y: 5, width: 44, height: 90, correct: !1 },
      { shape: "rect", x: 53, y: 5, width: 44, height: 90, correct: !1 }
    ]
  },
  {
    id: "top-bottom",
    name: "Top & Bottom",
    nameHe: "למעלה ולמטה",
    icon: "▬▬",
    description: "שני אזורים — עליון ותחתון",
    zones: [
      { shape: "rect", x: 5, y: 3, width: 90, height: 44, correct: !1 },
      { shape: "rect", x: 5, y: 53, width: 90, height: 44, correct: !1 }
    ]
  },
  {
    id: "one-of-four",
    name: "One Correct of Four",
    nameHe: "אחד נכון מתוך ארבעה",
    icon: "✓✗",
    description: "ארבע אפשרויות — אחת נכונה",
    zones: [
      { shape: "rect", x: 3, y: 3, width: 44, height: 44, correct: !0 },
      { shape: "rect", x: 53, y: 3, width: 44, height: 44, correct: !1 },
      { shape: "rect", x: 3, y: 53, width: 44, height: 44, correct: !1 },
      { shape: "rect", x: 53, y: 53, width: 44, height: 44, correct: !1 }
    ]
  },
  {
    id: "row-of-3",
    name: "Row of Three",
    nameHe: "שורה של שלוש",
    icon: "▭▭▭",
    description: "שלושה אזורים בשורה אחת",
    zones: [
      { shape: "rect", x: 2, y: 20, width: 30, height: 60, correct: !1 },
      { shape: "rect", x: 35, y: 20, width: 30, height: 60, correct: !1 },
      { shape: "rect", x: 68, y: 20, width: 30, height: 60, correct: !1 }
    ]
  },
  {
    id: "center-spotlight",
    name: "Center Spotlight",
    nameHe: "זרקור במרכז",
    icon: "◎",
    description: "אזור אחד גדול במרכז",
    zones: [
      { shape: "rect", x: 20, y: 15, width: 60, height: 70, correct: !0 }
    ]
  },
  {
    id: "empty",
    name: "Empty (Draw Your Own)",
    nameHe: "ריק — ציירו בעצמכם",
    icon: "✎",
    description: "התחלה ריקה, ציירו אזורים חופשיים",
    zones: []
  }
];
function kc(e) {
  return e.zones.map((t) => ({ ...t, id: yc() }));
}
function Ec(e) {
  var c;
  (c = document.getElementById("ab-tpl-picker")) == null || c.remove();
  const t = document.createElement("div");
  t.id = "ab-tpl-picker", t.className = "ab-tpl-modal", t.setAttribute("role", "dialog"), t.setAttribute("aria-modal", "true"), t.setAttribute("aria-label", "בחירת תבנית");
  const n = document.createElement("div");
  n.className = "ab-tpl-backdrop", t.appendChild(n);
  const o = document.createElement("div");
  o.className = "ab-tpl-box";
  const r = document.createElement("div");
  r.className = "ab-tpl-header", r.innerHTML = '<span class="ab-tpl-title">📐 בחרו תבנית</span>';
  const i = document.createElement("button");
  i.className = "ab-ze-close", i.textContent = "✕", i.addEventListener("click", a), r.appendChild(i), o.appendChild(r);
  const s = document.createElement("div");
  s.className = "ab-tpl-grid", wc.forEach((u) => {
    const l = document.createElement("button");
    l.className = "ab-tpl-card", l.addEventListener("click", () => {
      e(kc(u)), a();
    });
    const d = document.createElement("div");
    d.className = "ab-tpl-card__preview", u.zones.forEach((v) => {
      const b = document.createElement("div");
      b.className = "ab-tpl-card__zone", v.correct && b.classList.add("ab-tpl-card__zone--correct"), b.style.left = `${v.x}%`, b.style.top = `${v.y}%`, b.style.width = `${v.width}%`, b.style.height = `${v.height}%`, d.appendChild(b);
    }), l.appendChild(d);
    const m = document.createElement("div");
    m.className = "ab-tpl-card__label", m.innerHTML = `<span class="ab-tpl-card__icon">${u.icon}</span> ${u.nameHe}`, l.appendChild(m);
    const f = document.createElement("div");
    f.className = "ab-tpl-card__desc", f.textContent = u.description, l.appendChild(f), s.appendChild(l);
  }), o.appendChild(s), t.appendChild(o), document.body.appendChild(t);
  function a() {
    t.remove();
  }
  n.addEventListener("click", a), document.addEventListener("keydown", function u(l) {
    l.key === "Escape" && (a(), document.removeEventListener("keydown", u));
  });
}
class zc {
  constructor(t, n, o = {}) {
    this._mode = "play", this._overlay = null, this._navigator = null, this._inspector = null, this._toolbar = null, this._selectedId = null, this._undoBtn = null, this._redoBtn = null, this._shortcutHandler = null, this._zoneEditor = null, this._zoneModal = null, this._container = t, this._gameData = n, this._restartGame = o.restartGame, this._roundSchema = o.roundSchema, requestAnimationFrame(() => this._injectToolbar());
  }
  // ── Toolbar ───────────────────────────────────────────────────────────────
  _injectToolbar() {
    const t = this._container.querySelector(".game-header__spacer");
    t && (this._toolbar = document.createElement("div"), this._toolbar.className = "ab-editor-toolbar", this._toolbar.append(
      this._makeBtn("✏️ ערוך", "ab-editor-btn--edit", () => this.enterEditMode()),
      this._makeBtn("🎤 קול", "ab-editor-btn--audio", () => this._openAudioManager())
    ), t.innerHTML = "", t.appendChild(this._toolbar));
  }
  _makeBtn(t, n, o) {
    const r = document.createElement("button");
    return r.className = `ab-editor-btn ${n}`, r.innerHTML = t, r.addEventListener("click", o), r;
  }
  _setToolbarEditMode() {
    this._toolbar && (this._toolbar.innerHTML = "", this._undoBtn = this._makeBtn("↩", "ab-editor-btn--undo", () => this._undo()), this._undoBtn.title = "בטל (Ctrl+Z)", this._redoBtn = this._makeBtn("↪", "ab-editor-btn--redo", () => this._redo()), this._redoBtn.title = "בצע שנית (Ctrl+Y)", this._toolbar.append(
      this._makeBtn("▶ שחק", "ab-editor-btn--play", () => this.enterPlayMode()),
      this._makeBtn("+ הוסף", "ab-editor-btn--add", () => this._addRound()),
      this._undoBtn,
      this._redoBtn,
      this._makeBtn("🔲 אזורים", "ab-editor-btn--zones", () => this._openZoneEditor()),
      this._makeBtn("💾 שמור", "ab-editor-btn--save", () => this._save()),
      this._makeBtn("🎤 קול", "ab-editor-btn--audio", () => this._openAudioManager()),
      this._makeBtn("⬇ ייצוא", "ab-editor-btn--export", () => ro(this._gameData))
    ), this._refreshUndoButtons());
  }
  _setToolbarPlayMode() {
    this._toolbar && (this._toolbar.innerHTML = "", this._undoBtn = null, this._redoBtn = null, this._toolbar.append(
      this._makeBtn("✏️ ערוך", "ab-editor-btn--edit", () => this.enterEditMode()),
      this._makeBtn("🎤 קול", "ab-editor-btn--audio", () => this._openAudioManager())
    ));
  }
  // ── Mode switching ────────────────────────────────────────────────────────
  enterEditMode() {
    if (this._mode === "edit") return;
    this._mode = "edit", this._container.classList.add("ab-editor-active"), this._setToolbarEditMode(), this._attachShortcuts();
    const t = this._container.querySelector(".game-body");
    if (!t) return;
    this._overlay = io(t), this._overlay.show(), this._navigator = fo(this._container, this._gameData, {
      onSelectRound: (o) => this._selectRound(o),
      onAddRound: (o) => this._addRound(o),
      onDuplicateRound: (o) => this._duplicateRound(o),
      onMoveRound: (o, r) => this._moveRound(o, r)
    }), this._inspector = tc(this._container, {
      onFieldChange: (o, r, i) => this._onFieldChange(o, r, i),
      onDeleteRound: (o) => this._deleteRound(o),
      roundSchema: this._roundSchema
    });
    const n = this._gameData.rounds;
    n.length > 0 && this._selectRound(n[0].id);
  }
  enterPlayMode() {
    var t, n, o, r;
    this._mode !== "play" && (this._mode = "play", this._container.classList.remove("ab-editor-active"), this._setToolbarPlayMode(), this._detachShortcuts(), this._closeZoneEditor(), (t = this._overlay) == null || t.destroy(), (n = this._navigator) == null || n.destroy(), (o = this._inspector) == null || o.destroy(), this._overlay = this._navigator = this._inspector = null, this._selectedId = null, (r = this._restartGame) == null || r.call(this, this._container));
  }
  // ── Round management ──────────────────────────────────────────────────────
  _selectRound(t) {
    var o, r;
    this._selectedId = t, (o = this._navigator) == null || o.setActiveRound(t);
    const n = this._gameData.getRound(t);
    n && ((r = this._inspector) == null || r.loadRound(n, this._gameData.meta.type));
  }
  _addRound(t = null) {
    var o;
    const n = this._gameData.addRound(t ?? this._selectedId);
    (o = this._navigator) == null || o.refresh(), this._selectRound(n), this._refreshUndoButtons();
  }
  _duplicateRound(t) {
    var o;
    const n = this._gameData.duplicateRound(t ?? this._selectedId);
    n && ((o = this._navigator) == null || o.refresh(), this._selectRound(n), this._refreshUndoButtons());
  }
  _deleteRound(t) {
    var o;
    this._gameData.removeRound(t), (o = this._navigator) == null || o.refresh();
    const n = this._gameData.rounds;
    n.length > 0 && this._selectRound(n[0].id), this._refreshUndoButtons();
  }
  _moveRound(t, n) {
    var o, r;
    this._gameData.moveRound(t, n), (o = this._navigator) == null || o.refresh(), (r = this._navigator) == null || r.setActiveRound(t), this._refreshUndoButtons();
  }
  _onFieldChange(t, n, o) {
    var r, i;
    this._gameData.updateRound(t, { [n]: o }), (r = this._navigator) == null || r.refresh(), (i = this._navigator) == null || i.setActiveRound(t), this._refreshUndoButtons();
  }
  // ── Undo / Redo ───────────────────────────────────────────────────────────
  _undo() {
    var t;
    this._gameData.canUndo && (this._gameData.undo(), (t = this._navigator) == null || t.refresh(), this._resyncSelection(), this._refreshUndoButtons(), this._showToast("↩ בוטל"));
  }
  _redo() {
    var t;
    this._gameData.canRedo && (this._gameData.redo(), (t = this._navigator) == null || t.refresh(), this._resyncSelection(), this._refreshUndoButtons(), this._showToast("↪ בוצע שנית"));
  }
  _resyncSelection() {
    var o;
    const t = this._gameData.rounds, n = t.find((r) => r.id === this._selectedId);
    this._selectRound(n ? this._selectedId : (o = t[0]) == null ? void 0 : o.id);
  }
  _refreshUndoButtons() {
    this._undoBtn && (this._undoBtn.disabled = !this._gameData.canUndo), this._redoBtn && (this._redoBtn.disabled = !this._gameData.canRedo);
  }
  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  _attachShortcuts() {
    this._shortcutHandler = (t) => {
      if (this._mode !== "edit") return;
      const n = t.ctrlKey || t.metaKey;
      if (t.key === "Escape") {
        this.enterPlayMode();
        return;
      }
      if (n && !t.shiftKey && t.key.toLowerCase() === "s") {
        t.preventDefault(), this._save();
        return;
      }
      if (n && !t.shiftKey && t.key.toLowerCase() === "z") {
        t.preventDefault(), this._undo();
        return;
      }
      if (n && (t.key.toLowerCase() === "y" || t.shiftKey && t.key.toLowerCase() === "z")) {
        t.preventDefault(), this._redo();
        return;
      }
    }, document.addEventListener("keydown", this._shortcutHandler);
  }
  _detachShortcuts() {
    this._shortcutHandler && (document.removeEventListener("keydown", this._shortcutHandler), this._shortcutHandler = null);
  }
  // ── Zone editor ──────────────────────────────────────────────────────────
  _openZoneEditor() {
    var m;
    if (!this._selectedId) {
      this._showToast("בחרו סיבוב קודם");
      return;
    }
    const t = this._gameData.getRound(this._selectedId);
    if (!t) return;
    if (!t.image) {
      this._showToast("יש להוסיף תמונה לפני ציור אזורים");
      return;
    }
    const n = document.createElement("div");
    n.className = "ab-ze-modal";
    const o = document.createElement("div");
    o.className = "ab-ze-backdrop", n.appendChild(o);
    const r = document.createElement("div");
    r.className = "ab-ze-box";
    const i = document.createElement("div");
    i.className = "ab-ze-header", i.innerHTML = `
      <span class="ab-ze-title">🔲 עריכת אזורים</span>
      <span class="ab-ze-subtitle">ציירו מלבנים על התמונה וסמנו תשובות נכונות</span>
    `;
    const s = document.createElement("button");
    s.className = "ab-ze-close", s.textContent = "✕", s.addEventListener("click", () => this._closeZoneEditor()), i.appendChild(s), r.appendChild(i);
    const a = document.createElement("div");
    a.className = "ab-ze-img-container";
    const c = document.createElement("img");
    c.className = "ab-ze-img", c.src = t.image, c.alt = "", c.draggable = !1, a.appendChild(c), r.appendChild(a);
    const u = document.createElement("div");
    u.className = "ab-ze-footer";
    const l = document.createElement("button");
    l.className = "ab-editor-btn ab-editor-btn--zones", l.textContent = "📐 תבנית", l.addEventListener("click", () => {
      Ec((f) => {
        var v;
        this._selectedId && (this._gameData.updateRound(this._selectedId, { zones: f }), this._refreshUndoButtons(), (v = this._zoneEditor) == null || v.setZones(f));
      });
    }), u.appendChild(l);
    const d = document.createElement("button");
    d.className = "ab-editor-btn ab-editor-btn--play", d.textContent = "✓ סיום", d.addEventListener("click", () => this._closeZoneEditor()), u.appendChild(d), r.appendChild(u), n.appendChild(r), document.body.appendChild(n), this._zoneModal = n, c.onload = () => {
      const f = t.zones ?? [];
      this._zoneEditor = gc(a, f, {
        gameId: this._gameData.id,
        onChange: (v) => {
          this._selectedId && (this._gameData.updateRound(this._selectedId, { zones: v }), this._refreshUndoButtons());
        }
      });
    }, c.complete && c.naturalWidth > 0 && ((m = c.onload) == null || m.call(c, new Event("load"))), o.addEventListener("click", () => this._closeZoneEditor());
  }
  _closeZoneEditor() {
    var t, n;
    (t = this._zoneEditor) == null || t.destroy(), this._zoneEditor = null, (n = this._zoneModal) == null || n.remove(), this._zoneModal = null;
  }
  // ── Helpers ───────────────────────────────────────────────────────────────
  _openAudioManager() {
    hc(this._gameData.id, this._gameData);
  }
  _save() {
    no(this._gameData), this._showToast("✅ נשמר!");
  }
  _showToast(t) {
    const n = document.createElement("div");
    n.className = "ab-editor-toast", n.textContent = t, document.body.appendChild(n), setTimeout(() => n.remove(), 2200);
  }
}
async function Pc(e, t) {
  if (Qn(e, t.loadingMessage ?? "טוֹעֵן..."), await Bn(t.preloadTexts ?? []), t.onBeforeHide && await t.onBeforeHide() === !1)
    return { shell: null, activeRounds: [], gameData: null, aborted: !0 };
  eo(e);
  const n = oo(t.gameId), o = n ? n.rounds : t.defaultRounds ?? [], r = new Ln(e, {
    totalRounds: t.totalRounds ?? o.length,
    title: t.title
  });
  let i = null;
  if (t.editor) {
    const s = {
      title: t.editor.title ?? t.title,
      type: t.editor.type ?? "multiple-choice"
    };
    i = we.fromRoundsArray(t.gameId, o, s, t.editor.distractors ?? []), new zc(e, i, { restartGame: t.editor.restartGame });
  }
  return { shell: r, activeRounds: o, gameData: i, aborted: !1 };
}
const $c = {
  kamatz: "ah",
  patah: "ah",
  tzere: "eh",
  segol: "eh",
  hiriq: "ee",
  holam: "oh",
  kubbutz: "oo"
}, Sc = {
  ah: [/[אה]/, /^א$/, /אא/, /הא/],
  eh: [/[אה]/, /^א$/, /אא/, /הא/, /אה/],
  ee: [/[אי]/, /^י$/, /אי/, /הי/],
  oh: [/[או]/, /^[או]$/, /או/, /הו/],
  oo: [/[או]/, /^[או]$/, /או/, /הו/, /אוּ/]
};
function Oc() {
  const e = typeof window < "u" ? window.SpeechRecognition || window.webkitSpeechRecognition : null, t = !!e;
  let n = null;
  return {
    available: t,
    listen(o = 4e3) {
      return t ? new Promise((r) => {
        n = new e(), n.lang = "he-IL", n.continuous = !1, n.interimResults = !1, n.maxAlternatives = 3;
        let i = !1;
        const s = (c, u) => {
          i || (i = !0, n = null, r({ text: c.trim(), confidence: u }));
        };
        n.onresult = (c) => {
          const u = c.results[0];
          u ? s(u[0].transcript, u[0].confidence) : s("", 0);
        }, n.onerror = () => s("", 0), n.onnomatch = () => s("", 0);
        const a = setTimeout(() => {
          try {
            n == null || n.stop();
          } catch {
          }
          s("", 0);
        }, o);
        n.onend = () => {
          clearTimeout(a), s("", 0);
        };
        try {
          n.start();
        } catch {
          s("", 0);
        }
      }) : Promise.resolve({ text: "", confidence: 0 });
    },
    cancel() {
      try {
        n == null || n.abort();
      } catch {
      }
      n = null;
    }
  };
}
function jc(e, t) {
  if (!e || !t) return !1;
  const n = $c[t];
  if (!n) return !1;
  const o = Sc[n];
  if (!o) return !1;
  const r = e.replace(/[\s.,!?]/g, "");
  return r.length ? o.some((i) => i.test(r)) : !1;
}
const Te = [
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
  { letter: "ךְ", name: "כָּף סוֹפִית", nameNikud: "כָּף סוֹפִית", sound: "k", exampleWord: "מֶלֶךְ", emoji: "👑", isFinal: !0 },
  { letter: "ל", name: "לָמַד", nameNikud: "לָמֵד", sound: "l", exampleWord: "לֵב", emoji: "❤️", isFinal: !1 },
  { letter: "מ", name: "מֵם", nameNikud: "מֵם", sound: "m", exampleWord: "מַיִם", emoji: "💧", isFinal: !1 },
  { letter: "םִ", name: "מֵם סוֹפִית", nameNikud: "מֵם סוֹפִית", sound: "m", exampleWord: "שָׂמִים", emoji: "🌤️", isFinal: !0 },
  { letter: "נ", name: "נוּן", nameNikud: "נוּן", sound: "n", exampleWord: "נָחָשׁ", emoji: "🐍", isFinal: !1 },
  { letter: "ן", name: "נוּן סוֹפִית", nameNikud: "נוּן סוֹפִית", sound: "n", exampleWord: "גַּן", emoji: "🌳", isFinal: !0 },
  { letter: "ס", name: "סֶמֶךְ", nameNikud: "סָמֶךְ", sound: "s", exampleWord: "סוּס", emoji: "🐎", isFinal: !1 },
  { letter: "ע", name: "עַיִן", nameNikud: "עַיִן", sound: "", exampleWord: "עַיִט", emoji: "🦅", isFinal: !1 },
  { letter: "פ", name: "פא", nameNikud: "פֵּא", sound: "p", exampleWord: "פִּיל", emoji: "🐘", isFinal: !1 },
  { letter: "ף", name: "פא סוֹפִית", nameNikud: "פֵּא סוֹפִית", sound: "p", exampleWord: "אַף", emoji: "👃", isFinal: !0 },
  { letter: "צ", name: "צִדֵּי", nameNikud: "צַדִּי", sound: "ts", exampleWord: "צָב", emoji: "🐢", isFinal: !1 },
  { letter: "ץ", name: "צִדֵּי סוֹפִית", nameNikud: "צַדִּי סוֹפִית", sound: "ts", exampleWord: "עֵץ", emoji: "🌲", isFinal: !0 },
  { letter: "ק", name: "קוֹף", nameNikud: "קוֹף", sound: "k", exampleWord: "קוֹף", emoji: "🐒", isFinal: !1 },
  { letter: "ר", name: "רֵישׁ", nameNikud: "רֵישׁ", sound: "r", exampleWord: "רֶכֶב", emoji: "🚗", isFinal: !1 },
  { letter: "ש", name: "שִׁין", nameNikud: "שִׁין", sound: "sh", exampleWord: "שֶׁמֶשׁ", emoji: "☀️", isFinal: !1 },
  { letter: "ת", name: "תָּו", nameNikud: "תָּו", sound: "t", exampleWord: "תַּפּוּחַ", emoji: "🍎", isFinal: !1 }
];
function Mc(e) {
  return Te.find((t) => t.letter === e) || null;
}
function Nc(e = "regular") {
  return e === "regular" ? Te.filter((t) => !t.isFinal) : e === "final" ? Te.filter((t) => t.isFinal) : Te;
}
function Dc(e, t = "regular") {
  const n = Nc(t);
  return [...n].sort(() => Math.random() - 0.5).slice(0, Math.min(e, n.length));
}
const Me = [
  { id: "kamatz", name: "קָמָץ", nameNikud: "קָמָץ", symbol: "ָ", sound: "אָ", color: "#FF6B6B", textColor: "#fff" },
  { id: "patah", name: "פֶּתַח", nameNikud: "פָּתַח", symbol: "ַ", sound: "אָ", color: "#FF8C42", textColor: "#fff" },
  { id: "hiriq", name: "חִירִיק", nameNikud: "חִירִיק", symbol: "ִ", sound: "אִי", color: "#4ECDC4", textColor: "#fff" },
  { id: "tzere", name: "צָרָה", nameNikud: "צֵרֶה", symbol: "ֵ", sound: "אֶ", color: "#45B7D1", textColor: "#fff" },
  { id: "segol", name: "סָגֹול", nameNikud: "סְגוֹל", symbol: "ֶ", sound: "אֶ", color: "#9B59B6", textColor: "#fff" },
  { id: "holam", name: "חוֹלֵם", nameNikud: "חוֹלָם", symbol: "ֹ", sound: "אֹ", color: "#2ECC71", textColor: "#fff" },
  { id: "kubbutz", name: "קֻובּוּץ", nameNikud: "קֻבּוּץ", symbol: "ֻ", sound: "אֻ", color: "#F39C12", textColor: "#fff" }
], Bc = ["א", "ב", "ג", "ד", "מ", "נ", "ל", "ר", "ש", "ת", "פ", "ק"];
function Fc(e, t) {
  return e + t;
}
function Uc(e) {
  let t = [...Me];
  if (typeof window < "u" && window.location && window.location.search) {
    const o = new URLSearchParams(window.location.search), r = o.get("allowedNikud");
    if (r) {
      const s = r.split(",").map((a) => a.trim());
      t = t.filter(
        (a) => s.includes(a.id) || s.includes(a.name) || s.includes(a.nameNikud)
      );
    }
    const i = o.get("excludedNikud");
    if (i) {
      const s = i.split(",").map((a) => a.trim());
      t = t.filter(
        (a) => !s.includes(a.id) && !s.includes(a.name) && !s.includes(a.nameNikud)
      );
    }
  }
  t.length === 0 && (t = [...Me]);
  let n = [...t];
  for (; n.length < e; )
    n.push(...t);
  return n.sort(() => Math.random() - 0.5).slice(0, e);
}
function Hc(e, t, n) {
  e.innerHTML = "";
  const o = document.createElement("div");
  o.className = "option-cards-grid";
  const r = t.map((i) => {
    const s = document.createElement("button");
    return s.className = "option-card", s.dataset.id = i.id, s.innerHTML = `
      <span class="option-card__emoji">${i.emoji || ""}</span>
      <span class="option-card__text">${i.text}</span>
    `, s.addEventListener("click", () => {
      s.disabled || n(i);
    }), o.appendChild(s), { el: s, option: i };
  });
  return e.appendChild(o), {
    /** הַדָּגֵשׁ כַּרְטִיס לְפִי סוּג: 'correct' | 'wrong' | 'hint' */
    highlight(i, s) {
      r.forEach(({ el: a, option: c }) => {
        c.id === i && a.classList.add(`option-card--${s}`);
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
      e.innerHTML = "";
    }
  };
}
function Jc(e, t) {
  const n = document.createElement("div");
  n.className = "progress-bar", n.setAttribute("role", "progressbar"), n.setAttribute("aria-valuemin", "0"), n.setAttribute("aria-valuemax", String(t)), n.innerHTML = `
    <div class="progress-bar__track">
      <div class="progress-bar__fill" style="width: 0%"></div>
    </div>
    <span class="progress-bar__label">0 / ${t}</span>
  `, e.appendChild(n);
  const o = (
    /** @type {HTMLElement} */
    n.querySelector(".progress-bar__fill")
  ), r = n.querySelector(".progress-bar__label");
  return {
    /** עדכן את ההתקדמות */
    update(i) {
      const s = Math.round(i / t * 100);
      o.style.width = `${s}%`, r.textContent = `${i} / ${t}`, n.setAttribute("aria-valuenow", String(i));
    },
    /** הסר את הרכיב */
    destroy() {
      n.remove();
    }
  };
}
function Vc(e) {
  const t = document.createElement("div");
  t.className = "feedback-message", t.setAttribute("aria-live", "polite"), t.setAttribute("role", "status"), e.appendChild(t);
  let n = null;
  function o(r, i, s = 1800) {
    clearTimeout(n), t.textContent = r, t.className = `feedback-message feedback-message--${i}`, n = setTimeout(() => {
      t.textContent = "", t.className = "feedback-message";
    }, s);
  }
  return {
    /** הצג משוב חיובי */
    correct(r = "!כָּל הַכָּבוֹד") {
      Ze.correct(), o(r, "correct"), Ce(t, "bounce");
    },
    /** הצג עידוד — נסה שוב */
    wrong(r = "נַסֵּה שׁוּב") {
      Ze.wrong(), o(r, "wrong"), Ce(t, "pulse");
    },
    /** הצג רמז */
    hint(r) {
      o(r, "hint"), Ce(t, "pulse");
    },
    /** הסר את הרכיב */
    destroy() {
      clearTimeout(n), t.remove();
    }
  };
}
function Wc(e, t) {
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
  const o = new URLSearchParams(window.location.search), r = o.get("allowedNikud") ? o.get("allowedNikud").split(",") : [];
  let i = `
    <div style="background:white; padding:1.5rem; border-radius:1rem; min-width:300px; text-align:center; color:#333; font-family:Heebo,Arial; direction:rtl;">
      <h2 style="margin-top:0">בחר ניקוד</h2>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; margin:1rem 0; text-align:right;">
  `;
  Me.forEach((u) => {
    const l = r.length === 0 || r.includes(u.id) || r.includes(u.name);
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
    localStorage.setItem("alefbet.nikudRate", String(u)), Yn.setNikudEmphasis({ rate: u });
    const l = Array.from(n.querySelectorAll(".nikud-filter-cb")).filter((m) => (
      /** @type {HTMLInputElement} */
      m.checked
    )).map((m) => (
      /** @type {HTMLInputElement} */
      m.value
    )), d = new URL(window.location.href);
    l.length > 0 && l.length < Me.length ? d.searchParams.set("allowedNikud", l.join(",")) : d.searchParams.delete("allowedNikud"), d.searchParams.delete("excludedNikud"), n.style.display = "none", window.history.replaceState({}, "", d), t && t(e);
  }, document.getElementById("close-settings-btn").onclick = () => {
    n.style.display = "none";
  };
}
function qc(e) {
  const t = document.createElement("div");
  t.className = "ab-zone", t.style.setProperty("--zone-color", e.color || "#4f67ff"), t.innerHTML = `
    <div class="ab-zone__symbol">${e.symbol || ""}</div>
    <div class="ab-zone__label">${e.label || ""}</div>
  `;
  const n = () => {
    e.onTap && e.onTap();
  };
  return t.addEventListener("click", n), {
    el: t,
    highlight(o) {
      t.classList.remove("ab-zone--correct", "ab-zone--hover"), o && t.classList.add(`ab-zone--${o}`);
    },
    reset() {
      t.classList.remove("ab-zone--correct", "ab-zone--hover");
    },
    destroy() {
      t.removeEventListener("click", n);
    }
  };
}
function xc(e, t, n, o, r) {
  return e.map((i) => {
    const s = o > 0 ? (i.x - t) / o * 100 : 0, a = r > 0 ? (i.y - n) / r * 100 : 0;
    return `${s},${a}`;
  }).join(" ");
}
function Xc(e, t) {
  const {
    image: n,
    zones: o = [],
    mode: r = "quiz",
    gameId: i,
    roundId: s,
    onCorrect: a,
    onWrong: c,
    onAllCorrect: u,
    onZoneTap: l,
    showZones: d = !1,
    autoPlayInstruction: m = !0,
    hintAfter: f = 3
  } = t, v = r === "soundboard", b = document.createElement("div");
  b.className = "ab-zp-wrap";
  const C = document.createElement("img");
  C.className = "ab-zp-image", C.src = n, C.alt = "", C.draggable = !1, b.appendChild(C);
  const $ = document.createElement("div");
  $.className = "ab-zp-layer", b.appendChild($), e.appendChild(b);
  const N = /* @__PURE__ */ new Set();
  let _ = 0, E = !1, g = !1;
  async function T(S) {
    if (!(!i || E)) {
      E = !0;
      try {
        await ye(i, `zone-${S}`);
      } catch {
      }
      E = !1;
    }
  }
  function z() {
    if (g || f <= 0 || v || _ < f) return;
    g = !0;
    const S = $.querySelectorAll(".ab-zp-zone");
    S.forEach((w, I) => {
      var B;
      (B = o[I]) != null && B.correct && !N.has(o[I].id) && w.classList.add("ab-zp-zone--hint");
    }), setTimeout(() => {
      S.forEach((w) => w.classList.remove("ab-zp-zone--hint")), g = !1, _ = 0;
    }, 1500);
  }
  return o.forEach((S) => {
    const w = document.createElement("button");
    if (w.className = "ab-zp-zone", (d || v) && w.classList.add("ab-zp-zone--visible"), v && w.classList.add("ab-zp-zone--soundboard"), w.style.left = `${S.x}%`, w.style.top = `${S.y}%`, w.style.width = `${S.width}%`, w.style.height = `${S.height}%`, w.setAttribute("aria-label", S.label || (S.correct ? "correct zone" : "zone")), S.shape === "polygon" && S.points && S.points.length >= 3) {
      const I = `zp-clip-${S.id}`;
      w.innerHTML = `<svg class="ab-zp-zone__poly-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs><clipPath id="${I}"><polygon points="${xc(S.points, S.x, S.y, S.width, S.height)}"/></clipPath></defs>
        <rect x="0" y="0" width="100" height="100" clip-path="url(#${I})" fill="transparent"/>
      </svg>`, w.classList.add("ab-zp-zone--poly");
    }
    if (v && S.label) {
      const I = document.createElement("span");
      I.className = "ab-zp-zone__label", I.textContent = S.label, w.appendChild(I);
    }
    w.addEventListener("click", () => {
      if (l && l(S), T(S.id), v) {
        w.classList.add("ab-zp-zone--tapped"), setTimeout(() => w.classList.remove("ab-zp-zone--tapped"), 400);
        return;
      }
      if (!N.has(S.id))
        if (S.correct) {
          N.add(S.id), w.classList.add("ab-zp-zone--correct"), a && a(S);
          const I = o.filter((B) => B.correct).length;
          N.size >= I && u && u();
        } else
          w.classList.add("ab-zp-zone--wrong"), _++, c && c(S), setTimeout(() => w.classList.remove("ab-zp-zone--wrong"), 600), z();
    }), $.appendChild(w);
  }), m && i && s && setTimeout(() => {
    ye(i, s).catch(() => {
    });
  }, 400), {
    async playInstruction() {
      return i && s ? ye(i, s) : !1;
    },
    async playZoneAudio(S) {
      return i ? ye(i, `zone-${S}`) : !1;
    },
    revealCorrect() {
      $.querySelectorAll(".ab-zp-zone").forEach((S, w) => {
        var I;
        (I = o[w]) != null && I.correct && S.classList.add("ab-zp-zone--revealed");
      });
    },
    reset() {
      N.clear(), _ = 0, g = !1, $.querySelectorAll(".ab-zp-zone").forEach((S) => {
        S.classList.remove(
          "ab-zp-zone--correct",
          "ab-zp-zone--wrong",
          "ab-zp-zone--revealed",
          "ab-zp-zone--tapped",
          "ab-zp-zone--hint"
        );
      });
    },
    destroy() {
      b.remove();
    }
  };
}
function Yc(e, t, n, o) {
  const r = e.querySelector(".game-header__spacer");
  if (!r) return null;
  const i = document.createElement("button");
  return i.className = "ab-header-btn", i.setAttribute("aria-label", n), i.textContent = t, i.onclick = o, r.innerHTML = "", r.appendChild(i), i;
}
const Cc = "0 0 32 16", Tn = {
  // קו אופקי עבה
  patah: '<rect x="3" y="5" width="26" height="4" rx="1.6"/>',
  // קו אופקי + זנב קצר היורד מהמרכז (T הפוך)
  kamatz: '<rect x="3" y="3" width="26" height="3.4" rx="1.4"/><rect x="14.4" y="6.4" width="3.2" height="6.6" rx="1.4"/>',
  // נקודה אחת
  hiriq: '<circle cx="16" cy="8" r="3.4"/>',
  // שתי נקודות זו לצד זו
  tzere: '<circle cx="9" cy="8" r="2.8"/><circle cx="23" cy="8" r="2.8"/>',
  // משולש הפוך — שתיים למעלה, אחת למטה במרכז
  segol: '<circle cx="8" cy="4" r="2.6"/><circle cx="24" cy="4" r="2.6"/><circle cx="16" cy="12" r="2.6"/>',
  // נקודה אחת - ממוקמת מעל הקופסה בפינה השמאלית דרך .ab-nikud-box--holam
  holam: '<circle cx="7" cy="11" r="3.4"/>',
  // שלוש נקודות אלכסון - משמאל-למעלה לימין-למטה
  kubbutz: '<circle cx="6"  cy="3"  r="2.5"/><circle cx="16" cy="8"  r="2.5"/><circle cx="26" cy="13" r="2.5"/>'
};
function Tc(e) {
  const t = Tn[e];
  return t ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${Cc}" aria-hidden="true" focusable="false">${t}</svg>` : null;
}
const Gc = Object.freeze(Object.keys(Tn));
function Kc(e, { size: t = "md" } = {}) {
  const n = document.createElement("div");
  n.className = `ab-nikud-box ab-nikud-box--${t} ab-nikud-box--${e.id}`;
  const o = document.createElement("div");
  o.className = "ab-nikud-box__box";
  const r = document.createElement("div");
  return r.className = "ab-nikud-box__mark", r.innerHTML = Tc(e.id) ?? "", n.appendChild(o), n.appendChild(r), n;
}
function Qc(e, t) {
  const {
    title: n = "",
    subtitle: o = "",
    tabs: r = [],
    homeUrl: i = null,
    onTabChange: s = null
  } = t;
  e.classList.add("ab-app");
  const a = i ? `<a href="${i}" class="ab-app-back-link" aria-label="דף הבית">🏠</a>` : "", c = o ? `<span class="ab-app-subtitle">${o}</span>` : '<span class="ab-app-subtitle"></span>', u = r.map(
    (b) => `<button class="ab-app-tab" data-tab="${b.id}" aria-selected="false" role="tab"><span class="ab-app-tab-icon">${b.icon}</span><span class="ab-app-tab-label">${b.label}</span></button>`
  ).join(""), l = r.map(
    (b) => `<button class="ab-app-nav-item" data-tab="${b.id}" aria-selected="false" role="tab"><span class="ab-app-nav-icon">${b.icon}</span><span class="ab-app-nav-label">${b.label}</span></button>`
  ).join("");
  e.innerHTML = `
    <header class="ab-app-header">
      <div class="ab-app-header-text">
        <h1 class="ab-app-title">${n}</h1>
        ${c}
      </div>
      ${a}
    </header>
    <nav class="ab-app-tabs" role="tablist" aria-label="ניווט ראשי">
      ${u}
    </nav>
    <main class="ab-app-content"></main>
    <nav class="ab-app-bottom-nav" role="tablist" aria-label="ניווט תחתון">
      ${l}
    </nav>
  `;
  const d = (
    /** @type {HTMLElement} */
    e.querySelector(".ab-app-subtitle")
  ), m = (
    /** @type {HTMLElement} */
    e.querySelector(".ab-app-content")
  );
  function f(b) {
    v(b), typeof s == "function" && s(b);
  }
  e.querySelectorAll(".ab-app-tab, .ab-app-nav-item").forEach((b) => {
    b.addEventListener("click", () => f(
      /** @type {HTMLElement} */
      b.dataset.tab
    ));
  });
  function v(b) {
    e.querySelectorAll(".ab-app-tab, .ab-app-nav-item").forEach((C) => {
      const $ = (
        /** @type {HTMLElement} */
        C
      ), N = $.dataset.tab === b;
      $.classList.toggle("ab-active", N), $.setAttribute("aria-selected", N ? "true" : "false");
    });
  }
  return r.length > 0 && v(r[0].id), {
    /** אלמנט תוכן הראשי — כאן מרנדרים את תוכן הטאב הנוכחי */
    contentEl: m,
    /**
     * עדכן את כותרת המשנה
     * @param {string} text - הטקסט החדש לכותרת המשנה
     */
    setSubtitle(b) {
      d.textContent = b;
    },
    /**
     * הגדר את הטאב הפעיל באופן תכנותי
     * @param {string} tabId - מזהה הטאב להפעלה
     */
    setActiveTab(b) {
      v(b);
    }
  };
}
export {
  wc as ACTIVITY_TEMPLATES,
  Ut as BUILTIN_ROUND_SCHEMAS,
  ht as BaseRoundSchema,
  Ka as DragMatchRoundSchema,
  In as EventBus,
  we as GameData,
  Rc as GameDataSchema,
  zc as GameEditor,
  Qa as GameMetaSchema,
  Ln as GameShell,
  Rn as GameState,
  Ga as MultipleChoiceRoundSchema,
  Gc as NIKUD_GLYPH_IDS,
  Xa as PointSchema,
  Ya as ZoneSchema,
  ec as ZoneTapRoundSchema,
  Mn as addNikud,
  Ce as animate,
  Pc as bootstrapGame,
  Ic as clearGameData,
  Qc as createAppShell,
  ho as createDragSource,
  po as createDropTarget,
  Vc as createFeedback,
  Vt as createLocalState,
  Kc as createNikudBox,
  Hc as createOptionCards,
  Jc as createProgressBar,
  Zc as createRoundManager,
  Oc as createSpeechListener,
  xn as createVoiceRecordButton,
  rc as createVoiceRecorder,
  qc as createZone,
  gc as createZoneEditor,
  Xc as createZonePlayer,
  cc as deleteVoice,
  ro as exportGameDataAsJSON,
  kc as generateZonesFromTemplate,
  Mc as getLetter,
  Nc as getLettersByGroup,
  Dn as getNikud,
  Ac as hasVoice,
  Te as hebrewLetters,
  eo as hideLoadingScreen,
  Yc as injectHeaderButton,
  oc as isVoiceRecordingSupported,
  Fc as letterWithNikud,
  Lc as listVoiceKeys,
  oo as loadGameData,
  ft as loadVoice,
  jc as matchNikudSound,
  Bc as nikudBaseLetters,
  Tc as nikudGlyphSvg,
  Me as nikudList,
  ye as playVoice,
  Bn as preloadNikud,
  Dc as randomLetters,
  Uc as randomNikud,
  no as saveGameData,
  ac as saveVoice,
  qa as schemaToFields,
  hc as showAudioManager,
  Kn as showCompletionScreen,
  Qn as showLoadingScreen,
  Wc as showNikudSettingsDialog,
  Ec as showTemplatePicker,
  Ze as sounds,
  Yn as tts
};
