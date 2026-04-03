var Jo = Object.defineProperty;
var Wo = (t, e, n) => e in t ? Jo(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n;
var B = (t, e, n) => Wo(t, typeof e != "symbol" ? e + "" : e, n);
class Vo {
  constructor() {
    this._handlers = {};
  }
  /** הירשם לאירוע */
  on(e, n) {
    return this._handlers[e] || (this._handlers[e] = []), this._handlers[e].push(n), this;
  }
  /** בטל הרשמה לאירוע */
  off(e, n) {
    return this._handlers[e] ? (this._handlers[e] = this._handlers[e].filter((o) => o !== n), this) : this;
  }
  /** שלח אירוע */
  emit(e, n) {
    return (this._handlers[e] || []).slice().forEach((o) => o(n)), this;
  }
}
class qo {
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
class il {
  /**
   * @param {HTMLElement} containerEl - אלמנט המיכל
   * @param {object} config - הגדרות: { totalRounds, title, homeUrl }
   */
  constructor(e, n = {}) {
    this.container = e, this.config = {
      totalRounds: 8,
      title: "מִשְׂחָק",
      homeUrl: "../../index.html",
      ...n
    }, this.events = new Vo(), this.state = new qo(this.config.totalRounds), this._buildShell();
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
    this.state.nextRound(), this.events.emit("start", { state: this.state });
  }
  /** עבור לסיבוב הבא */
  nextRound() {
    const e = this.state.nextRound();
    return e ? this.events.emit("round", { state: this.state }) : this.end(this.state.score), e;
  }
  /** סיים את המשחק */
  end(e) {
    this.events.emit("end", { score: e, state: this.state });
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
let ke = null;
function Xo() {
  if (!ke)
    try {
      ke = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      return null;
    }
  return ke.state === "suspended" && ke.resume(), ke;
}
function de(t, e, n = "sine", o = 0.3) {
  const r = Xo();
  if (r)
    try {
      const i = r.createOscillator(), s = r.createGain();
      i.connect(s), s.connect(r.destination), i.type = n, i.frequency.setValueAtTime(t, r.currentTime), s.gain.setValueAtTime(o, r.currentTime), s.gain.exponentialRampToValueAtTime(1e-3, r.currentTime + e), i.start(r.currentTime), i.stop(r.currentTime + e + 0.05);
    } catch {
    }
}
const Ye = {
  /** צליל תשובה נכונה */
  correct() {
    de(523.25, 0.15), setTimeout(() => de(659.25, 0.2), 120), setTimeout(() => de(783.99, 0.3), 240);
  },
  /** צליל עידוד עדין — נסה שוב */
  wrong() {
    de(350, 0.15, "triangle", 0.12);
  },
  /** צליל עידוד - סיום מוצלח */
  cheer() {
    [523.25, 587.33, 659.25, 698.46, 783.99, 1046.5].forEach((e, n) => setTimeout(() => de(e, 0.2), n * 90));
  },
  /** קליק עדין */
  click() {
    de(900, 0.04, "sine", 0.12);
  }
}, Qt = "https://nakdan-u1-0.loadbalancer.dicta.org.il/api";
let en = !1;
const xe = /* @__PURE__ */ new Map();
function Yo() {
  var r;
  if (typeof window > "u") return Qt;
  const t = new URLSearchParams(window.location.search).get("nakdanProxy"), e = window.ALEFBET_NAKDAN_PROXY_URL;
  if (t && window.localStorage)
    try {
      window.localStorage.setItem("alefbet.nakdanProxyUrl", t);
    } catch {
    }
  const n = (r = window.localStorage) == null ? void 0 : r.getItem("alefbet.nakdanProxyUrl"), o = t || e || n;
  return o || (window.location.hostname.endsWith("github.io") ? null : Qt);
}
function Ko(t) {
  var n;
  let e = "";
  for (const o of t)
    if (o.sep)
      e += o.str ?? "";
    else {
      const r = (n = o.nakdan) == null ? void 0 : n.options;
      r != null && r.length ? e += (r[0].w ?? "").replace(/\|/g, "").replace(/\u05BD/g, "") : e += o.str ?? "";
    }
  return e;
}
async function Go(t) {
  const e = Yo();
  if (!e)
    throw en || (en = !0, console.warn("[nakdan] Dicta API blocked by CORS on GitHub Pages. Configure a proxy URL via ?nakdanProxy=..., window.ALEFBET_NAKDAN_PROXY_URL, or localStorage key alefbet.nakdanProxyUrl.")), new Error("Nakdan unavailable without proxy on this host");
  const n = await fetch(e, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      addmorph: !0,
      keepmetagim: !1,
      keepqq: !1,
      nodageshdefmem: !1,
      patachma: !1,
      task: "nakdan",
      data: t,
      useTokenization: !0,
      genre: "modern"
    })
  });
  if (!n.ok) throw new Error(`Nakdan ${n.status}`);
  const o = await n.json(), r = o == null ? void 0 : o.data;
  if (!Array.isArray(r)) throw new Error("Nakdan: invalid response");
  return Ko(r);
}
async function Qo(t) {
  if (!(t != null && t.trim())) return t ?? "";
  if (xe.has(t)) return xe.get(t);
  try {
    const e = await Go(t);
    return xe.set(t, e), e;
  } catch {
    return xe.set(t, t), t;
  }
}
function er(t) {
  return xe.get(t) ?? t ?? "";
}
async function sl(t) {
  const e = [...new Set(t.filter((n) => n == null ? void 0 : n.trim()))];
  await Promise.all(e.map((n) => Qo(n)));
}
let fe = [], Ve = !1, Fn = !0, me = 0.9, tn = typeof localStorage < "u" && parseFloat(localStorage.getItem("alefbet.nikudRate")) || 0.5, pt = !1, Se = null;
function nn(t, e, n, o = e) {
  console.warn(`[tts] ${t} TTS failed`, { text: e, sentText: o, reason: n }), typeof window < "u" && typeof window.dispatchEvent == "function" && window.dispatchEvent(new CustomEvent("alefbet:tts-error", {
    detail: { provider: t, text: e, sentText: o, reason: n }
  }));
}
function tr(t) {
  return (t || "").replace(/[\u0591-\u05C7]/g, "");
}
function nr(t) {
  const e = String(t || "").toLowerCase();
  return e.includes("didn't interact") || e.includes("notallowed");
}
function or() {
  var t;
  return typeof window > "u" || typeof document > "u" ? Promise.resolve() : pt || (t = document.userActivation) != null && t.hasBeenActive ? (pt = !0, Promise.resolve()) : Se || (Se = new Promise((e) => {
    const n = () => {
      pt = !0, window.removeEventListener("pointerdown", n, !0), window.removeEventListener("keydown", n, !0), window.removeEventListener("touchstart", n, !0), e();
    };
    window.addEventListener("pointerdown", n, { once: !0, capture: !0 }), window.addEventListener("keydown", n, { once: !0, capture: !0 }), window.addEventListener("touchstart", n, { once: !0, capture: !0 });
  }).finally(() => {
    Se = null;
  }), Se);
}
function rr(t, e, n) {
  const r = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(t)}&tl=he&client=tw-ob`, i = new Audio(r);
  i.playbackRate = me, i.onended = e, i.onerror = () => n("audio.onerror"), i.play().catch((s) => {
    n((s == null ? void 0 : s.message) || "audio.play() rejected");
  });
}
function ir(t) {
  return new Promise((e, n) => {
    const o = tr(t).trim() || t;
    let r = !1, i = !1;
    const s = () => {
      r || (r = !0, e());
    }, a = (u) => {
      r || (r = !0, n(u));
    }, c = () => {
      try {
        rr(o, s, (u) => {
          if (!i && nr(u)) {
            i = !0, or().then(() => {
              r || c();
            });
            return;
          }
          nn("google", t, u, o), a(u);
        });
      } catch (u) {
        nn("google", t, (u == null ? void 0 : u.message) || "Audio() construction failed", o), a(u == null ? void 0 : u.message);
      }
    };
    c();
  });
}
let wt = null;
function sr() {
  const t = speechSynthesis.getVoices();
  return t.find((e) => e.lang === "he-IL") || t.find((e) => e.lang === "iw-IL") || t.find((e) => e.lang.startsWith("he")) || null;
}
function on() {
  wt = sr();
}
typeof speechSynthesis < "u" && (speechSynthesis.getVoices().length > 0 ? on() : speechSynthesis.addEventListener("voiceschanged", on, { once: !0 }));
function ar(t) {
  return new Promise((e) => {
    if (typeof speechSynthesis > "u") {
      e();
      return;
    }
    const n = new SpeechSynthesisUtterance(t);
    n.lang = "he-IL", n.rate = me, wt && (n.voice = wt), n.onend = e, n.onerror = e, speechSynthesis.speak(n);
  });
}
async function cr(t) {
  if (Fn)
    try {
      await ir(t);
      return;
    } catch {
      console.info("[tts] Falling back to browser Speech API");
    }
  await ar(t);
}
function $t() {
  if (Ve || fe.length === 0) return;
  const t = fe.shift();
  Ve = !0, cr(t.text).then(() => {
    Ve = !1, t.resolve(), $t();
  });
}
const ur = {
  /**
   * הקרא טקסט עברי
   * משתמש ב-Google Translate TTS לאיכות טובה יותר
   */
  speak(t) {
    const e = er(t);
    return new Promise((n) => {
      fe.push({ text: e, resolve: n }), $t();
    });
  },
  /** עצור את הדיבור הנוכחי */
  cancel() {
    fe.forEach((t) => t.resolve()), fe = [], Ve = !1, typeof speechSynthesis < "u" && speechSynthesis.cancel();
  },
  get available() {
    return !0;
  },
  /** הגדר מהירות דיבור (0.5–2.0) */
  setRate(t) {
    me = Math.max(0.5, Math.min(2, t));
  },
  /** השתמש ב-Google Translate TTS (ברירת מחדל) או בדפדפן */
  useGoogle(t = !0) {
    Fn = t;
  },
  /**
   * הגדר מהירות דיבור להדגשת ניקוד
   * @param {{ rate?: number }} opts
   *   rate: מהירות דיבור להדגשה (ברירת מחדל 0.5)
   */
  setNikudEmphasis({ rate: t } = {}) {
    t != null && (tn = Math.max(0.3, Math.min(1.5, t)));
  },
  /**
   * הקרא אות עם ניקוד באיטיות להדגשת התנועה
   * @param {string} letter - האות (למשל 'ב')
   * @param {string} nikudSymbol - סמל הניקוד (למשל '\u05B7')
   */
  speakNikud(t, e) {
    const n = t + e, o = me;
    return me = tn, new Promise((r) => {
      fe.push({ text: n, resolve: r }), $t();
    }).finally(() => {
      me = o;
    });
  }
};
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const qe = globalThis, It = qe.ShadowRoot && (qe.ShadyCSS === void 0 || qe.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Bn = Symbol(), rn = /* @__PURE__ */ new WeakMap();
let lr = class {
  constructor(e, n, o) {
    if (this._$cssResult$ = !0, o !== Bn) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = n;
  }
  get styleSheet() {
    let e = this.o;
    const n = this.t;
    if (It && e === void 0) {
      const o = n !== void 0 && n.length === 1;
      o && (e = rn.get(n)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), o && rn.set(n, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const dr = (t) => new lr(typeof t == "string" ? t : t + "", void 0, Bn), hr = (t, e) => {
  if (It) t.adoptedStyleSheets = e.map((n) => n instanceof CSSStyleSheet ? n : n.styleSheet);
  else for (const n of e) {
    const o = document.createElement("style"), r = qe.litNonce;
    r !== void 0 && o.setAttribute("nonce", r), o.textContent = n.cssText, t.appendChild(o);
  }
}, sn = It ? (t) => t : (t) => t instanceof CSSStyleSheet ? ((e) => {
  let n = "";
  for (const o of e.cssRules) n += o.cssText;
  return dr(n);
})(t) : t;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: pr, defineProperty: fr, getOwnPropertyDescriptor: mr, getOwnPropertyNames: _r, getOwnPropertySymbols: gr, getPrototypeOf: br } = Object, Q = globalThis, an = Q.trustedTypes, vr = an ? an.emptyScript : "", ft = Q.reactiveElementPolyfillSupport, Ce = (t, e) => t, kt = { toAttribute(t, e) {
  switch (e) {
    case Boolean:
      t = t ? vr : null;
      break;
    case Object:
    case Array:
      t = t == null ? t : JSON.stringify(t);
  }
  return t;
}, fromAttribute(t, e) {
  let n = t;
  switch (e) {
    case Boolean:
      n = t !== null;
      break;
    case Number:
      n = t === null ? null : Number(t);
      break;
    case Object:
    case Array:
      try {
        n = JSON.parse(t);
      } catch {
        n = null;
      }
  }
  return n;
} }, Hn = (t, e) => !pr(t, e), cn = { attribute: !0, type: String, converter: kt, reflect: !1, useDefault: !1, hasChanged: Hn };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), Q.litPropertyMetadata ?? (Q.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let pe = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ?? (this.l = [])).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, n = cn) {
    if (n.state && (n.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((n = Object.create(n)).wrapped = !0), this.elementProperties.set(e, n), !n.noAccessor) {
      const o = Symbol(), r = this.getPropertyDescriptor(e, o, n);
      r !== void 0 && fr(this.prototype, e, r);
    }
  }
  static getPropertyDescriptor(e, n, o) {
    const { get: r, set: i } = mr(this.prototype, e) ?? { get() {
      return this[n];
    }, set(s) {
      this[n] = s;
    } };
    return { get: r, set(s) {
      const a = r == null ? void 0 : r.call(this);
      i == null || i.call(this, s), this.requestUpdate(e, a, o);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? cn;
  }
  static _$Ei() {
    if (this.hasOwnProperty(Ce("elementProperties"))) return;
    const e = br(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(Ce("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(Ce("properties"))) {
      const n = this.properties, o = [..._r(n), ...gr(n)];
      for (const r of o) this.createProperty(r, n[r]);
    }
    const e = this[Symbol.metadata];
    if (e !== null) {
      const n = litPropertyMetadata.get(e);
      if (n !== void 0) for (const [o, r] of n) this.elementProperties.set(o, r);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [n, o] of this.elementProperties) {
      const r = this._$Eu(n, o);
      r !== void 0 && this._$Eh.set(r, n);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(e) {
    const n = [];
    if (Array.isArray(e)) {
      const o = new Set(e.flat(1 / 0).reverse());
      for (const r of o) n.unshift(sn(r));
    } else e !== void 0 && n.push(sn(e));
    return n;
  }
  static _$Eu(e, n) {
    const o = n.attribute;
    return o === !1 ? void 0 : typeof o == "string" ? o : typeof e == "string" ? e.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    var e;
    this._$ES = new Promise((n) => this.enableUpdating = n), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), (e = this.constructor.l) == null || e.forEach((n) => n(this));
  }
  addController(e) {
    var n;
    (this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(e), this.renderRoot !== void 0 && this.isConnected && ((n = e.hostConnected) == null || n.call(e));
  }
  removeController(e) {
    var n;
    (n = this._$EO) == null || n.delete(e);
  }
  _$E_() {
    const e = /* @__PURE__ */ new Map(), n = this.constructor.elementProperties;
    for (const o of n.keys()) this.hasOwnProperty(o) && (e.set(o, this[o]), delete this[o]);
    e.size > 0 && (this._$Ep = e);
  }
  createRenderRoot() {
    const e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return hr(e, this.constructor.elementStyles), e;
  }
  connectedCallback() {
    var e;
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), (e = this._$EO) == null || e.forEach((n) => {
      var o;
      return (o = n.hostConnected) == null ? void 0 : o.call(n);
    });
  }
  enableUpdating(e) {
  }
  disconnectedCallback() {
    var e;
    (e = this._$EO) == null || e.forEach((n) => {
      var o;
      return (o = n.hostDisconnected) == null ? void 0 : o.call(n);
    });
  }
  attributeChangedCallback(e, n, o) {
    this._$AK(e, o);
  }
  _$ET(e, n) {
    var i;
    const o = this.constructor.elementProperties.get(e), r = this.constructor._$Eu(e, o);
    if (r !== void 0 && o.reflect === !0) {
      const s = (((i = o.converter) == null ? void 0 : i.toAttribute) !== void 0 ? o.converter : kt).toAttribute(n, o.type);
      this._$Em = e, s == null ? this.removeAttribute(r) : this.setAttribute(r, s), this._$Em = null;
    }
  }
  _$AK(e, n) {
    var i, s;
    const o = this.constructor, r = o._$Eh.get(e);
    if (r !== void 0 && this._$Em !== r) {
      const a = o.getPropertyOptions(r), c = typeof a.converter == "function" ? { fromAttribute: a.converter } : ((i = a.converter) == null ? void 0 : i.fromAttribute) !== void 0 ? a.converter : kt;
      this._$Em = r;
      const u = c.fromAttribute(n, a.type);
      this[r] = u ?? ((s = this._$Ej) == null ? void 0 : s.get(r)) ?? u, this._$Em = null;
    }
  }
  requestUpdate(e, n, o, r = !1, i) {
    var s;
    if (e !== void 0) {
      const a = this.constructor;
      if (r === !1 && (i = this[e]), o ?? (o = a.getPropertyOptions(e)), !((o.hasChanged ?? Hn)(i, n) || o.useDefault && o.reflect && i === ((s = this._$Ej) == null ? void 0 : s.get(e)) && !this.hasAttribute(a._$Eu(e, o)))) return;
      this.C(e, n, o);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, n, { useDefault: o, reflect: r, wrapped: i }, s) {
    o && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(e) && (this._$Ej.set(e, s ?? n ?? this[e]), i !== !0 || s !== void 0) || (this._$AL.has(e) || (this.hasUpdated || o || (n = void 0), this._$AL.set(e, n)), r === !0 && this._$Em !== e && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(e));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (n) {
      Promise.reject(n);
    }
    const e = this.scheduleUpdate();
    return e != null && await e, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    var o;
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
        for (const [i, s] of this._$Ep) this[i] = s;
        this._$Ep = void 0;
      }
      const r = this.constructor.elementProperties;
      if (r.size > 0) for (const [i, s] of r) {
        const { wrapped: a } = s, c = this[i];
        a !== !0 || this._$AL.has(i) || c === void 0 || this.C(i, void 0, s, c);
      }
    }
    let e = !1;
    const n = this._$AL;
    try {
      e = this.shouldUpdate(n), e ? (this.willUpdate(n), (o = this._$EO) == null || o.forEach((r) => {
        var i;
        return (i = r.hostUpdate) == null ? void 0 : i.call(r);
      }), this.update(n)) : this._$EM();
    } catch (r) {
      throw e = !1, this._$EM(), r;
    }
    e && this._$AE(n);
  }
  willUpdate(e) {
  }
  _$AE(e) {
    var n;
    (n = this._$EO) == null || n.forEach((o) => {
      var r;
      return (r = o.hostUpdated) == null ? void 0 : r.call(o);
    }), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(e) {
    return !0;
  }
  update(e) {
    this._$Eq && (this._$Eq = this._$Eq.forEach((n) => this._$ET(n, this[n]))), this._$EM();
  }
  updated(e) {
  }
  firstUpdated(e) {
  }
};
pe.elementStyles = [], pe.shadowRootOptions = { mode: "open" }, pe[Ce("elementProperties")] = /* @__PURE__ */ new Map(), pe[Ce("finalized")] = /* @__PURE__ */ new Map(), ft == null || ft({ ReactiveElement: pe }), (Q.reactiveElementVersions ?? (Q.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ze = globalThis, un = (t) => t, Ke = Ze.trustedTypes, ln = Ke ? Ke.createPolicy("lit-html", { createHTML: (t) => t }) : void 0, Jn = "$lit$", G = `lit$${Math.random().toFixed(9).slice(2)}$`, Wn = "?" + G, yr = `<${Wn}>`, ue = document, Te = () => ue.createComment(""), Ne = (t) => t === null || typeof t != "object" && typeof t != "function", Tt = Array.isArray, wr = (t) => Tt(t) || typeof (t == null ? void 0 : t[Symbol.iterator]) == "function", mt = `[ 	
\f\r]`, ze = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, dn = /-->/g, hn = />/g, ie = RegExp(`>|${mt}(?:([^\\s"'>=/]+)(${mt}*=${mt}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), pn = /'/g, fn = /"/g, Vn = /^(?:script|style|textarea|title)$/i, $r = (t) => (e, ...n) => ({ _$litType$: t, strings: e, values: n }), v = $r(1), ve = Symbol.for("lit-noChange"), D = Symbol.for("lit-nothing"), mn = /* @__PURE__ */ new WeakMap(), se = ue.createTreeWalker(ue, 129);
function qn(t, e) {
  if (!Tt(t) || !t.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return ln !== void 0 ? ln.createHTML(e) : e;
}
const kr = (t, e) => {
  const n = t.length - 1, o = [];
  let r, i = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", s = ze;
  for (let a = 0; a < n; a++) {
    const c = t[a];
    let u, l, d = -1, m = 0;
    for (; m < c.length && (s.lastIndex = m, l = s.exec(c), l !== null); ) m = s.lastIndex, s === ze ? l[1] === "!--" ? s = dn : l[1] !== void 0 ? s = hn : l[2] !== void 0 ? (Vn.test(l[2]) && (r = RegExp("</" + l[2], "g")), s = ie) : l[3] !== void 0 && (s = ie) : s === ie ? l[0] === ">" ? (s = r ?? ze, d = -1) : l[1] === void 0 ? d = -2 : (d = s.lastIndex - l[2].length, u = l[1], s = l[3] === void 0 ? ie : l[3] === '"' ? fn : pn) : s === fn || s === pn ? s = ie : s === dn || s === hn ? s = ze : (s = ie, r = void 0);
    const f = s === ie && t[a + 1].startsWith("/>") ? " " : "";
    i += s === ze ? c + yr : d >= 0 ? (o.push(u), c.slice(0, d) + Jn + c.slice(d) + G + f) : c + G + (d === -2 ? a : f);
  }
  return [qn(t, i + (t[n] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), o];
};
class Pe {
  constructor({ strings: e, _$litType$: n }, o) {
    let r;
    this.parts = [];
    let i = 0, s = 0;
    const a = e.length - 1, c = this.parts, [u, l] = kr(e, n);
    if (this.el = Pe.createElement(u, o), se.currentNode = this.el.content, n === 2 || n === 3) {
      const d = this.el.content.firstChild;
      d.replaceWith(...d.childNodes);
    }
    for (; (r = se.nextNode()) !== null && c.length < a; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) for (const d of r.getAttributeNames()) if (d.endsWith(Jn)) {
          const m = l[s++], f = r.getAttribute(d).split(G), _ = /([.?@])?(.*)/.exec(m);
          c.push({ type: 1, index: i, name: _[2], strings: f, ctor: _[1] === "." ? zr : _[1] === "?" ? Er : _[1] === "@" ? xr : st }), r.removeAttribute(d);
        } else d.startsWith(G) && (c.push({ type: 6, index: i }), r.removeAttribute(d));
        if (Vn.test(r.tagName)) {
          const d = r.textContent.split(G), m = d.length - 1;
          if (m > 0) {
            r.textContent = Ke ? Ke.emptyScript : "";
            for (let f = 0; f < m; f++) r.append(d[f], Te()), se.nextNode(), c.push({ type: 2, index: ++i });
            r.append(d[m], Te());
          }
        }
      } else if (r.nodeType === 8) if (r.data === Wn) c.push({ type: 2, index: i });
      else {
        let d = -1;
        for (; (d = r.data.indexOf(G, d + 1)) !== -1; ) c.push({ type: 7, index: i }), d += G.length - 1;
      }
      i++;
    }
  }
  static createElement(e, n) {
    const o = ue.createElement("template");
    return o.innerHTML = e, o;
  }
}
function ye(t, e, n = t, o) {
  var s, a;
  if (e === ve) return e;
  let r = o !== void 0 ? (s = n._$Co) == null ? void 0 : s[o] : n._$Cl;
  const i = Ne(e) ? void 0 : e._$litDirective$;
  return (r == null ? void 0 : r.constructor) !== i && ((a = r == null ? void 0 : r._$AO) == null || a.call(r, !1), i === void 0 ? r = void 0 : (r = new i(t), r._$AT(t, n, o)), o !== void 0 ? (n._$Co ?? (n._$Co = []))[o] = r : n._$Cl = r), r !== void 0 && (e = ye(t, r._$AS(t, e.values), r, o)), e;
}
class Sr {
  constructor(e, n) {
    this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = n;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(e) {
    const { el: { content: n }, parts: o } = this._$AD, r = ((e == null ? void 0 : e.creationScope) ?? ue).importNode(n, !0);
    se.currentNode = r;
    let i = se.nextNode(), s = 0, a = 0, c = o[0];
    for (; c !== void 0; ) {
      if (s === c.index) {
        let u;
        c.type === 2 ? u = new De(i, i.nextSibling, this, e) : c.type === 1 ? u = new c.ctor(i, c.name, c.strings, this, e) : c.type === 6 && (u = new Rr(i, this, e)), this._$AV.push(u), c = o[++a];
      }
      s !== (c == null ? void 0 : c.index) && (i = se.nextNode(), s++);
    }
    return se.currentNode = ue, r;
  }
  p(e) {
    let n = 0;
    for (const o of this._$AV) o !== void 0 && (o.strings !== void 0 ? (o._$AI(e, o, n), n += o.strings.length - 2) : o._$AI(e[n])), n++;
  }
}
class De {
  get _$AU() {
    var e;
    return ((e = this._$AM) == null ? void 0 : e._$AU) ?? this._$Cv;
  }
  constructor(e, n, o, r) {
    this.type = 2, this._$AH = D, this._$AN = void 0, this._$AA = e, this._$AB = n, this._$AM = o, this.options = r, this._$Cv = (r == null ? void 0 : r.isConnected) ?? !0;
  }
  get parentNode() {
    let e = this._$AA.parentNode;
    const n = this._$AM;
    return n !== void 0 && (e == null ? void 0 : e.nodeType) === 11 && (e = n.parentNode), e;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(e, n = this) {
    e = ye(this, e, n), Ne(e) ? e === D || e == null || e === "" ? (this._$AH !== D && this._$AR(), this._$AH = D) : e !== this._$AH && e !== ve && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : wr(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== D && Ne(this._$AH) ? this._$AA.nextSibling.data = e : this.T(ue.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    var i;
    const { values: n, _$litType$: o } = e, r = typeof o == "number" ? this._$AC(e) : (o.el === void 0 && (o.el = Pe.createElement(qn(o.h, o.h[0]), this.options)), o);
    if (((i = this._$AH) == null ? void 0 : i._$AD) === r) this._$AH.p(n);
    else {
      const s = new Sr(r, this), a = s.u(this.options);
      s.p(n), this.T(a), this._$AH = s;
    }
  }
  _$AC(e) {
    let n = mn.get(e.strings);
    return n === void 0 && mn.set(e.strings, n = new Pe(e)), n;
  }
  k(e) {
    Tt(this._$AH) || (this._$AH = [], this._$AR());
    const n = this._$AH;
    let o, r = 0;
    for (const i of e) r === n.length ? n.push(o = new De(this.O(Te()), this.O(Te()), this, this.options)) : o = n[r], o._$AI(i), r++;
    r < n.length && (this._$AR(o && o._$AB.nextSibling, r), n.length = r);
  }
  _$AR(e = this._$AA.nextSibling, n) {
    var o;
    for ((o = this._$AP) == null ? void 0 : o.call(this, !1, !0, n); e !== this._$AB; ) {
      const r = un(e).nextSibling;
      un(e).remove(), e = r;
    }
  }
  setConnected(e) {
    var n;
    this._$AM === void 0 && (this._$Cv = e, (n = this._$AP) == null || n.call(this, e));
  }
}
class st {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, n, o, r, i) {
    this.type = 1, this._$AH = D, this._$AN = void 0, this.element = e, this.name = n, this._$AM = r, this.options = i, o.length > 2 || o[0] !== "" || o[1] !== "" ? (this._$AH = Array(o.length - 1).fill(new String()), this.strings = o) : this._$AH = D;
  }
  _$AI(e, n = this, o, r) {
    const i = this.strings;
    let s = !1;
    if (i === void 0) e = ye(this, e, n, 0), s = !Ne(e) || e !== this._$AH && e !== ve, s && (this._$AH = e);
    else {
      const a = e;
      let c, u;
      for (e = i[0], c = 0; c < i.length - 1; c++) u = ye(this, a[o + c], n, c), u === ve && (u = this._$AH[c]), s || (s = !Ne(u) || u !== this._$AH[c]), u === D ? e = D : e !== D && (e += (u ?? "") + i[c + 1]), this._$AH[c] = u;
    }
    s && !r && this.j(e);
  }
  j(e) {
    e === D ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class zr extends st {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === D ? void 0 : e;
  }
}
class Er extends st {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== D);
  }
}
class xr extends st {
  constructor(e, n, o, r, i) {
    super(e, n, o, r, i), this.type = 5;
  }
  _$AI(e, n = this) {
    if ((e = ye(this, e, n, 0) ?? D) === ve) return;
    const o = this._$AH, r = e === D && o !== D || e.capture !== o.capture || e.once !== o.once || e.passive !== o.passive, i = e !== D && (o === D || r);
    r && this.element.removeEventListener(this.name, this, o), i && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    var n;
    typeof this._$AH == "function" ? this._$AH.call(((n = this.options) == null ? void 0 : n.host) ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class Rr {
  constructor(e, n, o) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = n, this.options = o;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    ye(this, e);
  }
}
const _t = Ze.litHtmlPolyfillSupport;
_t == null || _t(Pe, De), (Ze.litHtmlVersions ?? (Ze.litHtmlVersions = [])).push("3.3.2");
const Ar = (t, e, n) => {
  const o = (n == null ? void 0 : n.renderBefore) ?? e;
  let r = o._$litPart$;
  if (r === void 0) {
    const i = (n == null ? void 0 : n.renderBefore) ?? null;
    o._$litPart$ = r = new De(e.insertBefore(Te(), i), i, void 0, n ?? {});
  }
  return r._$AI(t), r;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ce = globalThis;
class N extends pe {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    var n;
    const e = super.createRenderRoot();
    return (n = this.renderOptions).renderBefore ?? (n.renderBefore = e.firstChild), e;
  }
  update(e) {
    const n = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = Ar(n, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    var e;
    super.connectedCallback(), (e = this._$Do) == null || e.setConnected(!0);
  }
  disconnectedCallback() {
    var e;
    super.disconnectedCallback(), (e = this._$Do) == null || e.setConnected(!1);
  }
  render() {
    return ve;
  }
}
var Mn;
N._$litElement$ = !0, N.finalized = !0, (Mn = ce.litElementHydrateSupport) == null || Mn.call(ce, { LitElement: N });
const gt = ce.litElementPolyfillSupport;
gt == null || gt({ LitElement: N });
(ce.litElementVersions ?? (ce.litElementVersions = [])).push("4.2.2");
const _n = {
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
}, Cr = {
  shake: 420,
  bounce: 480,
  pulse: 600,
  fadeIn: 320,
  confetti: 700
};
function Xn(t, e) {
  !t || !_n[e] || t.animate(_n[e], {
    duration: Cr[e] || 400,
    easing: "ease-in-out",
    fill: "none"
  });
}
class Yn extends N {
  createRenderRoot() {
    return this;
  }
  constructor() {
    super(), this.score = 0, this.totalRounds = 0, this._onReplay = null;
  }
  firstUpdated() {
    Ye.cheer();
    const e = this.querySelector(".completion-screen__content");
    e && Xn(e, "fadeIn");
  }
  _replay() {
    var e;
    this.remove(), (e = this._onReplay) == null || e.call(this);
  }
  render() {
    const e = this.totalRounds > 0 ? this.score / this.totalRounds : 0, n = e >= 0.8 ? 3 : e >= 0.5 ? 2 : 1, o = "⭐".repeat(n) + "☆".repeat(3 - n);
    return v`
      <div class="completion-screen">
        <div class="completion-screen__content">
          <div class="completion-screen__stars" aria-label="${n} כּוֹכָבִים">${o}</div>
          <h2 class="completion-screen__title">!כָּל הַכָּבוֹד</h2>
          <p class="completion-screen__score">נִיקּוּד: ${this.score} מִתּוֹךְ ${this.totalRounds}</p>
          <button class="completion-screen__replay btn btn--primary" @click=${() => this._replay()}>שַׂחֵק שׁוּב</button>
        </div>
      </div>
    `;
  }
}
B(Yn, "properties", {
  score: { type: Number },
  totalRounds: { type: Number }
});
customElements.define("ab-completion-screen", Yn);
function Zr(t, e, n, o) {
  t.innerHTML = "";
  const r = document.createElement("ab-completion-screen");
  r.score = e, r.totalRounds = n, r._onReplay = o, t.appendChild(r);
}
function ul(t, e, {
  totalRounds: n,
  progressBar: o = null,
  buildRoundUI: r,
  onCorrect: i,
  onWrong: s
} = {}) {
  let a = !1;
  async function c(m) {
    if (a) return;
    a = !0, Ye.correct(), m && await m(), i && await i(), t.state.addScore(1), o == null || o.update(t.state.currentRound), await new Promise((_) => setTimeout(_, 1200)), t.state.nextRound() ? (a = !1, r()) : Zr(e, t.state.score, n, () => {
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
function Ir(t, e) {
  const n = [];
  function o() {
    try {
      const a = localStorage.getItem(t);
      return a === null ? e : JSON.parse(a);
    } catch {
      return e;
    }
  }
  function r(a) {
    try {
      localStorage.setItem(t, JSON.stringify(a));
    } catch (c) {
      console.warn(`[createLocalState] שגיאה בשמירת "${t}":`, c);
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
const Tr = {
  kamatz: "ah",
  patah: "ah",
  tzere: "eh",
  segol: "eh",
  hiriq: "ee",
  holam: "oh",
  kubbutz: "oo"
}, Nr = {
  ah: [/[אה]/, /^א$/, /אא/, /הא/],
  eh: [/[אה]/, /^א$/, /אא/, /הא/, /אה/],
  ee: [/[אי]/, /^י$/, /אי/, /הי/],
  oh: [/[או]/, /^[או]$/, /או/, /הו/],
  oo: [/[או]/, /^[או]$/, /או/, /הו/, /אוּ/]
};
function ll() {
  const t = typeof window < "u" ? window.SpeechRecognition || window.webkitSpeechRecognition : null, e = !!t;
  let n = null;
  return {
    available: e,
    listen(o = 4e3) {
      return e ? new Promise((r) => {
        n = new t(), n.lang = "he-IL", n.continuous = !1, n.interimResults = !1, n.maxAlternatives = 3;
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
function dl(t, e) {
  if (!t || !e) return !1;
  const n = Tr[e];
  if (!n) return !1;
  const o = Nr[n];
  if (!o) return !1;
  const r = t.replace(/[\s.,!?]/g, "");
  return r.length ? o.some((i) => i.test(r)) : !1;
}
function Pr() {
  return ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/ogg"].find((e) => MediaRecorder.isTypeSupported(e)) || "";
}
function Or() {
  var t;
  return typeof navigator < "u" && typeof ((t = navigator.mediaDevices) == null ? void 0 : t.getUserMedia) == "function" && typeof MediaRecorder < "u";
}
function jr() {
  let t = null, e = null, n = [];
  async function o() {
    if (t && t.state === "recording") return;
    e = await navigator.mediaDevices.getUserMedia({ audio: !0, video: !1 }), n = [];
    const c = {}, u = Pr();
    u && (c.mimeType = u), t = new MediaRecorder(e, c), t.ondataavailable = (l) => {
      var d;
      ((d = l.data) == null ? void 0 : d.size) > 0 && n.push(l.data);
    }, t.start(100);
  }
  function r() {
    return new Promise((c, u) => {
      if (!t || t.state === "inactive") {
        u(new Error("[voice-recorder] not recording"));
        return;
      }
      t.onstop = () => {
        const l = new Blob(n, { type: t.mimeType || "audio/webm" });
        s(), c(l);
      }, t.onerror = (l) => {
        s(), u(l.error);
      }, t.stop();
    });
  }
  function i() {
    t && t.state !== "inactive" && (t.ondataavailable = null, t.onstop = null, t.stop()), s();
  }
  function s() {
    e == null || e.getTracks().forEach((c) => c.stop()), e = null, t = null, n = [];
  }
  function a() {
    return (t == null ? void 0 : t.state) === "recording";
  }
  return { start: o, stop: r, cancel: i, isActive: a };
}
const Dr = "alefbet-voices", X = "recordings", Lr = 1;
let Ee = null;
function at() {
  return Ee || (Ee = new Promise((t, e) => {
    const n = indexedDB.open(Dr, Lr);
    n.onupgradeneeded = (o) => {
      o.target.result.createObjectStore(X);
    }, n.onsuccess = (o) => t(o.target.result), n.onerror = (o) => {
      Ee = null, e(o.target.error);
    };
  }), Ee);
}
function Nt(t, e) {
  return `${t}/${e}`;
}
async function Ur(t, e, n) {
  const o = await at();
  return new Promise((r, i) => {
    const s = o.transaction(X, "readwrite");
    s.objectStore(X).put(n, Nt(t, e)), s.oncomplete = r, s.onerror = (a) => i(a.target.error);
  });
}
async function Pt(t, e) {
  const n = await at();
  return new Promise((o, r) => {
    const s = n.transaction(X, "readonly").objectStore(X).get(Nt(t, e));
    s.onsuccess = () => o(s.result ?? null), s.onerror = (a) => r(a.target.error);
  });
}
async function Mr(t, e) {
  const n = await at();
  return new Promise((o, r) => {
    const i = n.transaction(X, "readwrite");
    i.objectStore(X).delete(Nt(t, e)), i.oncomplete = o, i.onerror = (s) => r(s.target.error);
  });
}
async function hl(t) {
  const e = await at();
  return new Promise((n, o) => {
    const i = e.transaction(X, "readonly").objectStore(X).getAllKeys();
    i.onsuccess = () => {
      const s = `${t}/`;
      n(
        (i.result || []).filter((a) => a.startsWith(s)).map((a) => a.slice(s.length))
      );
    }, i.onerror = (s) => o(s.target.error);
  });
}
async function Re(t, e) {
  let n;
  try {
    n = await Pt(t, e);
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
async function pl(t, e) {
  return await Pt(t, e).catch(() => null) !== null;
}
const Xe = [
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
function fl(t) {
  return Xe.find((e) => e.letter === t) || null;
}
function Fr(t = "regular") {
  return t === "regular" ? Xe.filter((e) => !e.isFinal) : t === "final" ? Xe.filter((e) => e.isFinal) : Xe;
}
function ml(t, e = "regular") {
  const n = Fr(e);
  return [...n].sort(() => Math.random() - 0.5).slice(0, Math.min(t, n.length));
}
const Ie = [
  { id: "kamatz", name: "קָמָץ", nameNikud: "קָמָץ", symbol: "ָ", sound: "אָ", color: "#FF6B6B", textColor: "#fff" },
  { id: "patah", name: "פֶּתַח", nameNikud: "פָּתַח", symbol: "ַ", sound: "אָ", color: "#FF8C42", textColor: "#fff" },
  { id: "hiriq", name: "חִירִיק", nameNikud: "חִירִיק", symbol: "ִ", sound: "אִי", color: "#4ECDC4", textColor: "#fff" },
  { id: "tzere", name: "צָרָה", nameNikud: "צֵרֶה", symbol: "ֵ", sound: "אֶ", color: "#45B7D1", textColor: "#fff" },
  { id: "segol", name: "סָגֹול", nameNikud: "סְגוֹל", symbol: "ֶ", sound: "אֶ", color: "#9B59B6", textColor: "#fff" },
  { id: "holam", name: "חוֹלֵם", nameNikud: "חוֹלָם", symbol: "ֹ", sound: "אֹ", color: "#2ECC71", textColor: "#fff" },
  { id: "kubbutz", name: "קֻובּוּץ", nameNikud: "קֻבּוּץ", symbol: "ֻ", sound: "אֻ", color: "#F39C12", textColor: "#fff" }
], _l = ["א", "ב", "ג", "ד", "מ", "נ", "ל", "ר", "ש", "ת", "פ", "ק"];
function gl(t, e) {
  return t + e;
}
function bl(t) {
  let e = [...Ie];
  if (typeof window < "u" && window.location && window.location.search) {
    const o = new URLSearchParams(window.location.search), r = o.get("allowedNikud");
    if (r) {
      const s = r.split(",").map((a) => a.trim());
      e = e.filter(
        (a) => s.includes(a.id) || s.includes(a.name) || s.includes(a.nameNikud)
      );
    }
    const i = o.get("excludedNikud");
    if (i) {
      const s = i.split(",").map((a) => a.trim());
      e = e.filter(
        (a) => !s.includes(a.id) && !s.includes(a.name) && !s.includes(a.nameNikud)
      );
    }
  }
  e.length === 0 && (e = [...Ie]);
  let n = [...e];
  for (; n.length < t; )
    n.push(...e);
  return n.sort(() => Math.random() - 0.5).slice(0, t);
}
class Kn extends N {
  createRenderRoot() {
    return this;
  }
  constructor() {
    super(), this.options = [], this._disabled = !1, this._highlights = {}, this._onSelect = null;
  }
  render() {
    return v`
      <div class="option-cards-grid">
        ${this.options.map((e) => {
      const n = this._highlights[e.id];
      return v`
            <button
              class=${"option-card" + (n ? ` option-card--${n}` : "")}
              data-id=${e.id}
              ?disabled=${this._disabled}
              @click=${() => {
        var o;
        this._disabled || (o = this._onSelect) == null || o.call(this, e);
      }}
            >
              <span class="option-card__emoji">${e.emoji ?? ""}</span>
              <span class="option-card__text">${e.text}</span>
            </button>
          `;
    })}
      </div>
    `;
  }
}
B(Kn, "properties", {
  options: { type: Array },
  _disabled: { state: !0 },
  _highlights: { state: !0 }
});
customElements.define("ab-option-cards", Kn);
function vl(t, e, n) {
  t.innerHTML = "";
  const o = document.createElement("ab-option-cards");
  return o.options = e, o._onSelect = n, t.appendChild(o), {
    highlight(r, i) {
      o._highlights = { ...o._highlights, [r]: i };
    },
    disable() {
      o._disabled = !0;
    },
    reset() {
      o._highlights = {}, o._disabled = !1;
    },
    destroy() {
      t.innerHTML = "";
    }
  };
}
class Gn extends N {
  createRenderRoot() {
    return this;
  }
  constructor() {
    super(), this.total = 0, this.current = 0;
  }
  render() {
    const e = this.total > 0 ? Math.round(this.current / this.total * 100) : 0;
    return v`
      <div class="progress-bar"
           role="progressbar"
           aria-valuemin="0"
           aria-valuemax=${this.total}
           aria-valuenow=${this.current}>
        <div class="progress-bar__track">
          <div class="progress-bar__fill" style="width:${e}%"></div>
        </div>
        <span class="progress-bar__label">${this.current} / ${this.total}</span>
      </div>
    `;
  }
}
B(Gn, "properties", {
  total: { type: Number },
  current: { type: Number }
});
customElements.define("ab-progress-bar", Gn);
function yl(t, e) {
  const n = document.createElement("ab-progress-bar");
  return n.total = e, t.appendChild(n), {
    update(o) {
      n.current = o;
    },
    destroy() {
      n.remove();
    }
  };
}
class Qn extends N {
  createRenderRoot() {
    return this;
  }
  constructor() {
    super(), this._text = "", this._type = "", this._anim = null, this._timer = null;
  }
  updated(e) {
    if (e.has("_anim") && this._anim) {
      const n = this.querySelector(".feedback-message");
      n && Xn(n, this._anim);
    }
  }
  _show(e, n, o, r = 1800) {
    clearTimeout(this._timer), this._text = e, this._type = n, this._anim = o, this._timer = setTimeout(() => {
      this._text = "", this._type = "";
    }, r);
  }
  correct(e = "!כָּל הַכָּבוֹד") {
    Ye.correct(), this._show(e, "correct", "bounce");
  }
  wrong(e = "נַסֵּה שׁוּב") {
    Ye.wrong(), this._show(e, "wrong", "pulse");
  }
  hint(e) {
    this._show(e, "hint", "pulse");
  }
  destroy() {
    clearTimeout(this._timer), this.remove();
  }
  render() {
    return v`
      <div
        class=${"feedback-message" + (this._type ? ` feedback-message--${this._type}` : "")}
        aria-live="polite"
        role="status"
      >${this._text}</div>
    `;
  }
}
B(Qn, "properties", {
  _text: { state: !0 },
  _type: { state: !0 },
  _anim: { state: !0 }
});
customElements.define("ab-feedback", Qn);
function wl(t) {
  const e = document.createElement("ab-feedback");
  return t.appendChild(e), {
    correct: (n) => e.correct(n),
    wrong: (n) => e.wrong(n),
    hint: (n) => e.hint(n),
    destroy: () => e.destroy()
  };
}
class eo extends N {
  createRenderRoot() {
    return this;
  }
  constructor() {
    super(), this._open = !1, this._rate = 0.5, this._checked = /* @__PURE__ */ new Set(), this._container = null, this._onSave = null;
  }
  open(e, n) {
    var r;
    this._container = e, this._onSave = n;
    const o = ((r = new URLSearchParams(window.location.search).get("allowedNikud")) == null ? void 0 : r.split(",")) ?? [];
    this._checked = new Set(
      Ie.filter((i) => o.length === 0 || o.includes(i.id) || o.includes(i.name)).map((i) => i.id)
    ), this._rate = parseFloat(localStorage.getItem("alefbet.nikudRate")) || 0.5, this._open = !0;
  }
  _save() {
    var o;
    localStorage.setItem("alefbet.nikudRate", this._rate), ur.setNikudEmphasis({ rate: this._rate });
    const e = [...this._checked], n = new URL(window.location);
    e.length > 0 && e.length < Ie.length ? n.searchParams.set("allowedNikud", e.join(",")) : n.searchParams.delete("allowedNikud"), n.searchParams.delete("excludedNikud"), window.history.replaceState({}, "", n), this._open = !1, (o = this._onSave) == null || o.call(this, this._container);
  }
  _toggleNikud(e) {
    const n = new Set(this._checked);
    n.has(e) ? n.delete(e) : n.add(e), this._checked = n;
  }
  render() {
    return this._open ? v`
      <div class="ab-nikud-dialog-backdrop">
        <div class="ab-nikud-dialog">
          <h2 style="margin-top:0">בחר ניקוד</h2>
          <div class="ab-nikud-dialog__grid">
            ${Ie.map((e) => v`
              <label class="ab-nikud-dialog__label">
                <input type="checkbox"
                       .checked=${this._checked.has(e.id)}
                       @change=${() => this._toggleNikud(e.id)}
                       class="ab-nikud-dialog__cb">
                <span>${e.nameNikud}</span>
              </label>
            `)}
          </div>
          <div class="ab-nikud-dialog__rate">
            <label class="ab-nikud-dialog__rate-label">
              מהירות הגייה: <span>${this._rate}</span>
            </label>
            <input type="range" min="0.3" max="1.5" step="0.1"
                   .value=${String(this._rate)}
                   @input=${(e) => {
      this._rate = parseFloat(e.target.value);
    }}
                   class="ab-nikud-dialog__slider">
            <div class="ab-nikud-dialog__rate-hints">
              <span>אִטִּי</span><span>מָהִיר</span>
            </div>
          </div>
          <button class="ab-nikud-dialog__save" @click=${() => this._save()}>שמור והתחל מחדש</button>
          <button class="ab-nikud-dialog__cancel" @click=${() => {
      this._open = !1;
    }}>ביטול</button>
        </div>
      </div>
    ` : v``;
  }
}
B(eo, "properties", {
  _open: { state: !0 },
  _rate: { state: !0 },
  _checked: { state: !0 }
});
customElements.define("ab-nikud-settings-dialog", eo);
let Me = null;
function Br() {
  return Me || (Me = document.createElement("ab-nikud-settings-dialog"), document.body.appendChild(Me)), Me;
}
function $l(t, e) {
  Br().open(t, e);
}
class to extends N {
  createRenderRoot() {
    return this;
  }
  constructor() {
    super(), this.color = "#4f67ff", this.symbol = "", this.label = "", this._highlight = null, this._onTap = null;
  }
  render() {
    return v`
      <div
        class=${"ab-zone" + (this._highlight ? ` ab-zone--${this._highlight}` : "")}
        style="--zone-color: ${this.color}"
        @click=${() => {
      var e;
      return (e = this._onTap) == null ? void 0 : e.call(this);
    }}
      >
        <div class="ab-zone__symbol">${this.symbol}</div>
        <div class="ab-zone__label">${this.label}</div>
      </div>
    `;
  }
}
B(to, "properties", {
  color: { type: String },
  symbol: { type: String },
  label: { type: String },
  _highlight: { state: !0 }
});
customElements.define("ab-zone", to);
function kl(t) {
  const e = document.createElement("ab-zone");
  return e.color = t.color || "#4f67ff", e.symbol = t.symbol || "", e.label = t.label || "", e._onTap = t.onTap || null, {
    el: e,
    highlight(n) {
      e._highlight = n || null;
    },
    reset() {
      e._highlight = null;
    },
    destroy() {
      e.remove();
    }
  };
}
function Hr(t, e, n, o, r) {
  return t.map((i) => {
    const s = o > 0 ? (i.x - e) / o * 100 : 0, a = r > 0 ? (i.y - n) / r * 100 : 0;
    return `${s},${a}`;
  }).join(" ");
}
class no extends N {
  createRenderRoot() {
    return this;
  }
  constructor() {
    super(), this.image = "", this.zones = [], this.mode = "quiz", this.gameId = null, this.roundId = null, this.showZones = !1, this.autoPlayInstruction = !0, this.hintAfter = 3, this._found = /* @__PURE__ */ new Set(), this._wrongZones = /* @__PURE__ */ new Set(), this._tappedZones = /* @__PURE__ */ new Set(), this._hintZones = /* @__PURE__ */ new Set(), this._revealedZones = /* @__PURE__ */ new Set(), this._wrongCount = 0, this._hintShown = !1, this._playing = !1, this._onCorrect = null, this._onWrong = null, this._onAllCorrect = null, this._onZoneTap = null;
  }
  firstUpdated() {
    this.autoPlayInstruction && this.gameId && this.roundId && setTimeout(() => Re(this.gameId, this.roundId).catch(() => {
    }), 400);
  }
  async _playZoneAudio(e) {
    if (!(!this.gameId || this._playing)) {
      this._playing = !0;
      try {
        await Re(this.gameId, `zone-${e}`);
      } catch {
      }
      this._playing = !1;
    }
  }
  _maybeShowHint() {
    if (this._hintShown || this.hintAfter <= 0 || this.mode === "soundboard" || this._wrongCount < this.hintAfter) return;
    this._hintShown = !0;
    const e = this.zones.filter((n) => n.correct && !this._found.has(n.id)).map((n) => n.id);
    this._hintZones = new Set(e), setTimeout(() => {
      this._hintZones = /* @__PURE__ */ new Set(), this._hintShown = !1, this._wrongCount = 0;
    }, 1500);
  }
  _handleZoneTap(e) {
    var n, o, r, i;
    if ((n = this._onZoneTap) == null || n.call(this, e), this._playZoneAudio(e.id), this.mode === "soundboard") {
      const s = new Set(this._tappedZones);
      s.add(e.id), this._tappedZones = s, setTimeout(() => {
        const a = new Set(this._tappedZones);
        a.delete(e.id), this._tappedZones = a;
      }, 400);
      return;
    }
    if (!this._found.has(e.id))
      if (e.correct) {
        const s = new Set(this._found);
        s.add(e.id), this._found = s, (o = this._onCorrect) == null || o.call(this, e);
        const a = this.zones.filter((c) => c.correct).length;
        s.size >= a && ((r = this._onAllCorrect) == null || r.call(this));
      } else {
        const s = new Set(this._wrongZones);
        s.add(e.id), this._wrongZones = s, this._wrongCount++, (i = this._onWrong) == null || i.call(this, e), setTimeout(() => {
          const a = new Set(this._wrongZones);
          a.delete(e.id), this._wrongZones = a;
        }, 600), this._maybeShowHint();
      }
  }
  _zoneClass(e) {
    const n = this.mode === "soundboard", o = ["ab-zp-zone"];
    return (this.showZones || n) && o.push("ab-zp-zone--visible"), n && o.push("ab-zp-zone--soundboard"), e.shape === "polygon" && o.push("ab-zp-zone--poly"), this._found.has(e.id) && o.push("ab-zp-zone--correct"), this._wrongZones.has(e.id) && o.push("ab-zp-zone--wrong"), this._tappedZones.has(e.id) && o.push("ab-zp-zone--tapped"), this._hintZones.has(e.id) && o.push("ab-zp-zone--hint"), this._revealedZones.has(e.id) && o.push("ab-zp-zone--revealed"), o.join(" ");
  }
  _renderZoneContent(e) {
    var o;
    const n = [];
    if (e.shape === "polygon" && ((o = e.points) == null ? void 0 : o.length) >= 3) {
      const r = `zp-clip-${e.id}`, i = Hr(e.points, e.x, e.y, e.width, e.height);
      n.push(v`
        <svg class="ab-zp-zone__poly-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs><clipPath id=${r}><polygon points=${i}/></clipPath></defs>
          <rect x="0" y="0" width="100" height="100" clip-path=${"url(#" + r + ")"} fill="transparent"/>
        </svg>`);
    }
    return this.mode === "soundboard" && e.label && n.push(v`<span class="ab-zp-zone__label">${e.label}</span>`), n;
  }
  // ── Public API ─────────────────────────────────────────────────────────────
  async playInstruction() {
    return this.gameId && this.roundId ? Re(this.gameId, this.roundId) : !1;
  }
  async playZoneAudio(e) {
    return this.gameId ? Re(this.gameId, `zone-${e}`) : !1;
  }
  revealCorrect() {
    const e = new Set(this._revealedZones);
    this.zones.filter((n) => n.correct).forEach((n) => e.add(n.id)), this._revealedZones = e;
  }
  reset() {
    this._found = /* @__PURE__ */ new Set(), this._wrongZones = /* @__PURE__ */ new Set(), this._tappedZones = /* @__PURE__ */ new Set(), this._hintZones = /* @__PURE__ */ new Set(), this._revealedZones = /* @__PURE__ */ new Set(), this._wrongCount = 0, this._hintShown = !1;
  }
  render() {
    return v`
      <div class="ab-zp-wrap">
        <img class="ab-zp-image" src=${this.image} alt="" draggable="false">
        <div class="ab-zp-layer">
          ${this.zones.map((e) => v`
            <button
              class=${this._zoneClass(e)}
              style="left:${e.x}%; top:${e.y}%; width:${e.width}%; height:${e.height}%"
              aria-label=${e.label || (e.correct ? "correct zone" : "zone")}
              @click=${() => this._handleZoneTap(e)}
            >${this._renderZoneContent(e)}</button>
          `)}
        </div>
      </div>
    `;
  }
}
B(no, "properties", {
  image: { type: String },
  zones: { type: Array },
  mode: { type: String },
  gameId: { type: String },
  roundId: { type: String },
  showZones: { type: Boolean },
  autoPlayInstruction: { type: Boolean },
  hintAfter: { type: Number },
  _found: { state: !0 },
  _wrongZones: { state: !0 },
  _tappedZones: { state: !0 },
  _hintZones: { state: !0 },
  _revealedZones: { state: !0 },
  _wrongCount: { state: !0 },
  _hintShown: { state: !0 }
});
customElements.define("ab-zone-player", no);
function Sl(t, e) {
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
  } = e, _ = document.createElement("ab-zone-player");
  return _.image = n, _.zones = o, _.mode = r, _.gameId = i, _.roundId = s, _.showZones = d, _.autoPlayInstruction = m, _.hintAfter = f, _._onCorrect = a, _._onWrong = c, _._onAllCorrect = u, _._onZoneTap = l, t.appendChild(_), {
    playInstruction: () => _.playInstruction(),
    playZoneAudio: (w) => _.playZoneAudio(w),
    revealCorrect: () => _.revealCorrect(),
    reset: () => _.reset(),
    destroy: () => _.remove()
  };
}
class oo extends N {
  createRenderRoot() {
    return this;
  }
  constructor() {
    super(), this.text = "טוֹעֵן...";
  }
  render() {
    return v`<div class="ab-loading">${this.text}</div>`;
  }
}
B(oo, "properties", {
  text: { type: String }
});
customElements.define("ab-loading-screen", oo);
function zl(t, e = "טוֹעֵן...") {
  t.innerHTML = "";
  const n = document.createElement("ab-loading-screen");
  n.text = e, t.appendChild(n);
}
function El(t) {
  t.innerHTML = "";
}
class ro extends N {
  createRenderRoot() {
    return this;
  }
  constructor() {
    super(), this.icon = "", this.ariaLabel = "", this._onClick = null;
  }
  render() {
    return v`
      <button
        class="ab-header-btn"
        aria-label=${this.ariaLabel}
        @click=${() => {
      var e;
      return (e = this._onClick) == null ? void 0 : e.call(this);
    }}
      >${this.icon}</button>
    `;
  }
}
B(ro, "properties", {
  icon: { type: String },
  ariaLabel: { type: String }
});
customElements.define("ab-header-btn", ro);
function xl(t, e, n, o) {
  const r = t.querySelector(".game-header__spacer");
  if (!r) return null;
  const i = document.createElement("ab-header-btn");
  return i.icon = e, i.ariaLabel = n, i._onClick = o, r.innerHTML = "", r.appendChild(i), i;
}
class io extends N {
  createRenderRoot() {
    return this;
  }
  constructor() {
    super(), this.nikud = null, this.size = "md";
  }
  render() {
    return this.nikud ? v`
      <div class=${"ab-nikud-box ab-nikud-box--" + this.size + " ab-nikud-box--" + this.nikud.id}>
        <div class="ab-nikud-box__box"></div>
        <div class="ab-nikud-box__mark">${this.nikud.symbol}</div>
      </div>
    ` : v``;
  }
}
B(io, "properties", {
  nikud: { type: Object },
  size: { type: String }
});
customElements.define("ab-nikud-box", io);
function Rl(t, { size: e = "md" } = {}) {
  const n = document.createElement("ab-nikud-box");
  return n.nikud = t, n.size = e, n;
}
class so extends N {
  createRenderRoot() {
    return this;
  }
  constructor() {
    super(), this.title = "", this.subtitle = "", this.tabs = [], this.homeUrl = null, this._activeTab = null, this._onTabChange = null;
  }
  _handleTabClick(e) {
    var n;
    this._activeTab = e, (n = this._onTabChange) == null || n.call(this, e);
  }
  render() {
    const { title: e, subtitle: n, tabs: o, homeUrl: r, _activeTab: i } = this;
    return v`
      <header class="ab-app-header">
        <div class="ab-app-header-text">
          <h1 class="ab-app-title">${e}</h1>
          <span class="ab-app-subtitle">${n}</span>
        </div>
        ${r ? v`<a href=${r} class="ab-app-back-link" aria-label="דף הבית">🏠</a>` : ""}
      </header>
      <nav class="ab-app-tabs" role="tablist" aria-label="ניווט ראשי">
        ${o.map((s) => v`
          <button
            class=${"ab-app-tab" + (i === s.id ? " ab-active" : "")}
            data-tab=${s.id}
            aria-selected=${i === s.id ? "true" : "false"}
            role="tab"
            @click=${() => this._handleTabClick(s.id)}
          >
            <span class="ab-app-tab-icon">${s.icon}</span>
            <span class="ab-app-tab-label">${s.label}</span>
          </button>
        `)}
      </nav>
      <main class="ab-app-content"></main>
      <nav class="ab-app-bottom-nav" role="tablist" aria-label="ניווט תחתון">
        ${o.map((s) => v`
          <button
            class=${"ab-app-nav-item" + (i === s.id ? " ab-active" : "")}
            data-tab=${s.id}
            aria-selected=${i === s.id ? "true" : "false"}
            role="tab"
            @click=${() => this._handleTabClick(s.id)}
          >
            <span class="ab-app-nav-icon">${s.icon}</span>
            <span class="ab-app-nav-label">${s.label}</span>
          </button>
        `)}
      </nav>
    `;
  }
}
B(so, "properties", {
  title: { type: String },
  subtitle: { type: String },
  tabs: { type: Array },
  homeUrl: { type: String },
  _activeTab: { state: !0 }
});
customElements.define("ab-app-shell", so);
function Al(t, e = {}) {
  const {
    title: n = "",
    subtitle: o = "",
    tabs: r = [],
    homeUrl: i = null,
    onTabChange: s = null
  } = e;
  t.classList.add("ab-app");
  const a = document.createElement("ab-app-shell");
  return a.title = n, a.subtitle = o, a.tabs = r, a.homeUrl = i, a._onTabChange = s, a._activeTab = r.length > 0 ? r[0].id : null, t.appendChild(a), {
    get contentEl() {
      return a.querySelector(".ab-app-content");
    },
    setSubtitle(c) {
      a.subtitle = c;
    },
    setActiveTab(c) {
      a._activeTab = c;
    }
  };
}
class ao extends N {
  createRenderRoot() {
    return this;
  }
  constructor() {
    super(), this.gameId = "", this.voiceKey = "", this.label = "הקלטת קול", this._state = "idle", this._elapsed = 0, this._playing = !1, this._error = null, this._recorder = null, this._timer = null, this._onSaved = null, this._onDeleted = null;
  }
  connectedCallback() {
    if (super.connectedCallback(), !Or()) {
      this._state = "unsupported";
      return;
    }
    this._recorder = jr(), this.refresh();
  }
  disconnectedCallback() {
    var e;
    super.disconnectedCallback(), clearInterval(this._timer), (e = this._recorder) != null && e.isActive() && this._recorder.cancel();
  }
  async refresh() {
    var n;
    if ((n = this._recorder) != null && n.isActive()) return;
    const e = await Pt(this.gameId, this.voiceKey).catch(() => null);
    this._state = e ? "has-voice" : "idle";
  }
  async _startRecording() {
    try {
      await this._recorder.start(), this._elapsed = 0, this._state = "recording", this._timer = setInterval(() => {
        this._elapsed++, this._elapsed >= 120 && this._stopRecording();
      }, 1e3);
    } catch (e) {
      console.warn("[voice-record-button] microphone access denied:", e), this._showError("לא ניתן לגשת למיקרופון");
    }
  }
  async _stopRecording() {
    var e;
    clearInterval(this._timer);
    try {
      const n = await this._recorder.stop();
      await Ur(this.gameId, this.voiceKey, n), this._state = "has-voice", (e = this._onSaved) == null || e.call(this, n);
    } catch (n) {
      console.warn("[voice-record-button] stop error:", n), this._state = "idle";
    }
  }
  async _play() {
    this._playing || (this._playing = !0, await Re(this.gameId, this.voiceKey), this._playing = !1);
  }
  async _delete() {
    var e;
    confirm("למחוק את ההקלטה?") && (await Mr(this.gameId, this.voiceKey), this._state = "idle", (e = this._onDeleted) == null || e.call(this));
  }
  _showError(e) {
    this._error = e, setTimeout(() => {
      this._error = null;
    }, 3e3);
  }
  _formatTime(e) {
    return `${Math.floor(e / 60)}:${String(e % 60).padStart(2, "0")}`;
  }
  render() {
    return this._state === "unsupported" ? v`<span class="ab-voice-unsupported">🎤 הקלטה לא נתמכת בדפדפן זה</span>` : v`
      <div class="ab-voice-btn-wrap" aria-label=${this.label}>
        ${this._state === "idle" ? v`
          <button class="ab-voice-btn ab-voice-btn--record" type="button"
                  title="התחל הקלטה" aria-label="התחל הקלטה"
                  @click=${() => this._startRecording()}>🎤</button>
        ` : ""}

        ${this._state === "recording" ? v`
          <span class="ab-voice-indicator"></span>
          <span class="ab-voice-timer">${this._formatTime(this._elapsed)}</span>
          <button class="ab-voice-btn ab-voice-btn--stop" type="button"
                  title="עצור הקלטה" aria-label="עצור הקלטה"
                  @click=${() => this._stopRecording()}>⏹</button>
        ` : ""}

        ${this._state === "has-voice" ? v`
          <button class="ab-voice-btn ab-voice-btn--play" type="button"
                  title="נגן הקלטה" aria-label="נגן הקלטה"
                  ?disabled=${this._playing}
                  @click=${() => this._play()}>▶</button>
          <button class="ab-voice-btn ab-voice-btn--re-record" type="button"
                  title="הקלט מחדש" aria-label="הקלט מחדש"
                  @click=${() => this._startRecording()}>🎤</button>
          <button class="ab-voice-btn ab-voice-btn--delete" type="button"
                  title="מחק הקלטה" aria-label="מחק הקלטה"
                  @click=${() => this._delete()}>🗑</button>
        ` : ""}

        ${this._error ? v`<span class="ab-voice-error">${this._error}</span>` : ""}
      </div>
    `;
  }
}
B(ao, "properties", {
  gameId: { type: String },
  voiceKey: { type: String },
  label: { type: String },
  _state: { state: !0 },
  // 'idle' | 'recording' | 'has-voice' | 'unsupported'
  _elapsed: { state: !0 },
  _playing: { state: !0 },
  _error: { state: !0 }
});
customElements.define("ab-voice-record-button", ao);
function Jr(t, {
  gameId: e,
  voiceKey: n,
  label: o = "הקלטת קול",
  onSaved: r,
  onDeleted: i
} = {}) {
  const s = document.createElement("ab-voice-record-button");
  return s.gameId = e, s.voiceKey = n, s.label = o, s._onSaved = r, s._onDeleted = i, t.appendChild(s), {
    refresh: () => s.refresh(),
    destroy: () => s.remove()
  };
}
let he = null, V = null, St = 0, zt = 0;
const Ge = /* @__PURE__ */ new Map();
function gn(t, e) {
  var n;
  return ((n = document.elementFromPoint(t, e)) == null ? void 0 : n.closest('[data-drop-target="true"]')) || null;
}
function Wr(t, e, n) {
  const o = t.getBoundingClientRect();
  St = o.width / 2, zt = o.height / 2, V = t.cloneNode(!0), Object.assign(V.style, {
    position: "fixed",
    left: `${e - St}px`,
    top: `${n - zt}px`,
    width: `${o.width}px`,
    height: `${o.height}px`,
    pointerEvents: "none",
    // keeps it out of elementFromPoint + hit-testing
    zIndex: "9999",
    opacity: "0.85",
    transform: "scale(1.12)",
    cursor: "grabbing",
    margin: "0"
  }), document.body.appendChild(V);
}
function Vr(t, e) {
  V && (V.style.left = `${t - St}px`, V.style.top = `${e - zt}px`);
}
function qr() {
  V == null || V.remove(), V = null;
}
let q = null;
function Xr(t) {
  q !== t && (q == null || q.classList.remove("drop-target--hover"), q = t, t == null || t.classList.add("drop-target--hover"));
}
function Yr() {
  q == null || q.classList.remove("drop-target--hover"), q = null;
}
function Kr(t, e) {
  t.classList.add("drag-source");
  let n = null, o = null, r = null;
  function i() {
    n && (t.removeEventListener("pointermove", n), t.removeEventListener("pointerup", o), t.removeEventListener("pointercancel", r), n = o = r = null), Yr(), qr(), t.classList.remove("drag-source--dragging"), he = null;
  }
  function s(a) {
    a.button !== void 0 && a.button !== 0 || (a.preventDefault(), he && i(), he = { el: t, data: e }, t.classList.add("drag-source--dragging"), Wr(t, a.clientX, a.clientY), t.setPointerCapture(a.pointerId), n = (c) => {
      Vr(c.clientX, c.clientY), Xr(gn(c.clientX, c.clientY));
    }, o = (c) => {
      const u = gn(c.clientX, c.clientY);
      i(), u && Ge.has(u) && Ge.get(u).onDrop({ data: e, sourceEl: t, targetEl: u });
    }, r = () => i(), t.addEventListener("pointermove", n), t.addEventListener("pointerup", o), t.addEventListener("pointercancel", r));
  }
  return t.addEventListener("pointerdown", s), {
    destroy() {
      t.removeEventListener("pointerdown", s), (he == null ? void 0 : he.el) === t && i(), t.classList.remove("drag-source");
    }
  };
}
function Gr(t, e) {
  return t.setAttribute("data-drop-target", "true"), t.classList.add("drop-target--active"), Ge.set(t, { onDrop: e }), {
    destroy() {
      t.removeAttribute("data-drop-target"), t.classList.remove("drop-target--active", "drop-target--hover"), Ge.delete(t);
    }
  };
}
function Qr(t, { onClick: e } = {}) {
  const n = document.createElement("div");
  n.className = "ab-editor-overlay", e && n.addEventListener("pointerdown", e);
  function o() {
    n.parentElement || (t.style.position = "relative", t.appendChild(n));
  }
  function r() {
    n.remove();
  }
  function i() {
    r();
  }
  return { show: o, hide: r, destroy: i };
}
const Wt = class Wt extends N {
  createRenderRoot() {
    return this;
  }
  constructor() {
    super(), this._rounds = [], this._activeId = null, this._gameData = null, this._onSelectRound = null, this._onAddRound = null, this._onDuplicateRound = null, this._onMoveRound = null, this._ddCleanup = [];
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._ddCleanup.forEach((e) => e.destroy()), this._ddCleanup = [];
  }
  // Re-setup drag/drop only when the rounds list actually changes.
  updated(e) {
    e.has("_rounds") && (this._ddCleanup.forEach((n) => n.destroy()), this._ddCleanup = [], this.querySelectorAll(".ab-editor-nav__thumb").forEach((n, o) => {
      const r = this._rounds[o];
      if (!r) return;
      const i = n.querySelector(".ab-editor-nav__grip");
      i && this._ddCleanup.push(Kr(i, { roundId: r.id })), this._ddCleanup.push(
        Gr(n, ({ data: s }) => {
          var a;
          s.roundId !== r.id && ((a = this._onMoveRound) == null || a.call(this, s.roundId, this._gameData.getRoundIndex(r.id)));
        })
      );
    }));
  }
  render() {
    return v`
      <div class="ab-editor-nav" aria-label="ניווט סיבובים">
        <div class="ab-editor-nav__header">סיבובים</div>
        <div class="ab-editor-nav__list">
          ${this._rounds.map((e, n) => this._renderThumb(e, n))}
        </div>
        <button class="ab-editor-nav__add"
                @click=${() => {
      var e;
      return (e = this._onAddRound) == null ? void 0 : e.call(this, null);
    }}>+ הוסף</button>
      </div>
    `;
  }
  _renderThumb(e, n) {
    const o = e.id === this._activeId;
    return v`
      <div
        class=${"ab-editor-nav__thumb" + (o ? " ab-editor-nav__thumb--active" : "") + (e.image ? " ab-editor-nav__thumb--has-img" : "")}
        role="button"
        tabindex="0"
        aria-label=${`סיבוב ${n + 1}`}
        data-round-id=${e.id}
        style=${e.image ? `background-image:url(${e.image})` : ""}
        @click=${() => {
      var r;
      return (r = this._onSelectRound) == null ? void 0 : r.call(this, e.id);
    }}
        @keydown=${(r) => {
      var i;
      (r.key === "Enter" || r.key === " ") && (r.preventDefault(), (i = this._onSelectRound) == null || i.call(this, e.id));
    }}
      >
        <div class="ab-editor-nav__grip" aria-hidden="true" title="גרור לשינוי סדר">⠿</div>
        <div class="ab-editor-nav__num">${n + 1}</div>
        ${!e.image && e.correctEmoji ? v`
          <div class="ab-editor-nav__emoji">${e.correctEmoji}</div>
        ` : ""}
        ${e.target ? v`
          <div class="ab-editor-nav__letter">${e.target}</div>
        ` : ""}
        <button class="ab-editor-nav__dup" title="שכפל סיבוב" aria-label="שכפל סיבוב"
                @click=${(r) => {
      var i;
      r.stopPropagation(), (i = this._onDuplicateRound) == null || i.call(this, e.id);
    }}>
          ⧉
        </button>
      </div>
    `;
  }
};
Wt.properties = {
  _rounds: { state: !0 },
  _activeId: { state: !0 }
};
let Et = Wt;
customElements.define("ab-slide-navigator", Et);
function ei(t, e, { onSelectRound: n, onAddRound: o, onDuplicateRound: r, onMoveRound: i }) {
  const s = document.createElement("ab-slide-navigator");
  return s._gameData = e, s._rounds = [...e.rounds], s._onSelectRound = n, s._onAddRound = o, s._onDuplicateRound = r, s._onMoveRound = i, t.appendChild(s), {
    refresh() {
      s._rounds = [...e.rounds];
    },
    setActiveRound(a) {
      s._activeId = a;
    },
    destroy() {
      s.remove();
    }
  };
}
function h(t, e, n) {
  function o(a, c) {
    if (a._zod || Object.defineProperty(a, "_zod", {
      value: {
        def: c,
        constr: s,
        traits: /* @__PURE__ */ new Set()
      },
      enumerable: !1
    }), a._zod.traits.has(t))
      return;
    a._zod.traits.add(t), e(a, c);
    const u = s.prototype, l = Object.keys(u);
    for (let d = 0; d < l.length; d++) {
      const m = l[d];
      m in a || (a[m] = u[m].bind(a));
    }
  }
  const r = (n == null ? void 0 : n.Parent) ?? Object;
  class i extends r {
  }
  Object.defineProperty(i, "name", { value: t });
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
      return n != null && n.Parent && a instanceof n.Parent ? !0 : (u = (c = a == null ? void 0 : a._zod) == null ? void 0 : c.traits) == null ? void 0 : u.has(t);
    }
  }), Object.defineProperty(s, "name", { value: t }), s;
}
class be extends Error {
  constructor() {
    super("Encountered Promise during synchronous parse. Use .parseAsync() instead.");
  }
}
class co extends Error {
  constructor(e) {
    super(`Encountered unidirectional transform during encode: ${e}`), this.name = "ZodEncodeError";
  }
}
const uo = {};
function ee(t) {
  return uo;
}
function lo(t) {
  const e = Object.values(t).filter((o) => typeof o == "number");
  return Object.entries(t).filter(([o, r]) => e.indexOf(+o) === -1).map(([o, r]) => r);
}
function xt(t, e) {
  return typeof e == "bigint" ? e.toString() : e;
}
function Ot(t) {
  return {
    get value() {
      {
        const e = t();
        return Object.defineProperty(this, "value", { value: e }), e;
      }
    }
  };
}
function jt(t) {
  return t == null;
}
function Dt(t) {
  const e = t.startsWith("^") ? 1 : 0, n = t.endsWith("$") ? t.length - 1 : t.length;
  return t.slice(e, n);
}
function ti(t, e) {
  const n = (t.toString().split(".")[1] || "").length, o = e.toString();
  let r = (o.split(".")[1] || "").length;
  if (r === 0 && /\d?e-\d?/.test(o)) {
    const c = o.match(/\d?e-(\d?)/);
    c != null && c[1] && (r = Number.parseInt(c[1]));
  }
  const i = n > r ? n : r, s = Number.parseInt(t.toFixed(i).replace(".", "")), a = Number.parseInt(e.toFixed(i).replace(".", ""));
  return s % a / 10 ** i;
}
const bn = Symbol("evaluating");
function k(t, e, n) {
  let o;
  Object.defineProperty(t, e, {
    get() {
      if (o !== bn)
        return o === void 0 && (o = bn, o = n()), o;
    },
    set(r) {
      Object.defineProperty(t, e, {
        value: r
        // configurable: true,
      });
    },
    configurable: !0
  });
}
function le(t, e, n) {
  Object.defineProperty(t, e, {
    value: n,
    writable: !0,
    enumerable: !0,
    configurable: !0
  });
}
function ne(...t) {
  const e = {};
  for (const n of t) {
    const o = Object.getOwnPropertyDescriptors(n);
    Object.assign(e, o);
  }
  return Object.defineProperties({}, e);
}
function vn(t) {
  return JSON.stringify(t);
}
function ni(t) {
  return t.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
const ho = "captureStackTrace" in Error ? Error.captureStackTrace : (...t) => {
};
function Qe(t) {
  return typeof t == "object" && t !== null && !Array.isArray(t);
}
const oi = Ot(() => {
  var t;
  if (typeof navigator < "u" && ((t = navigator == null ? void 0 : navigator.userAgent) != null && t.includes("Cloudflare")))
    return !1;
  try {
    const e = Function;
    return new e(""), !0;
  } catch {
    return !1;
  }
});
function we(t) {
  if (Qe(t) === !1)
    return !1;
  const e = t.constructor;
  if (e === void 0 || typeof e != "function")
    return !0;
  const n = e.prototype;
  return !(Qe(n) === !1 || Object.prototype.hasOwnProperty.call(n, "isPrototypeOf") === !1);
}
function po(t) {
  return we(t) ? { ...t } : Array.isArray(t) ? [...t] : t;
}
const ri = /* @__PURE__ */ new Set(["string", "number", "symbol"]);
function ct(t) {
  return t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function oe(t, e, n) {
  const o = new t._zod.constr(e ?? t._zod.def);
  return (!e || n != null && n.parent) && (o._zod.parent = t), o;
}
function b(t) {
  const e = t;
  if (!e)
    return {};
  if (typeof e == "string")
    return { error: () => e };
  if ((e == null ? void 0 : e.message) !== void 0) {
    if ((e == null ? void 0 : e.error) !== void 0)
      throw new Error("Cannot specify both `message` and `error` params");
    e.error = e.message;
  }
  return delete e.message, typeof e.error == "string" ? { ...e, error: () => e.error } : e;
}
function ii(t) {
  return Object.keys(t).filter((e) => t[e]._zod.optin === "optional" && t[e]._zod.optout === "optional");
}
const si = {
  safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
  int32: [-2147483648, 2147483647],
  uint32: [0, 4294967295],
  float32: [-34028234663852886e22, 34028234663852886e22],
  float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
};
function ai(t, e) {
  const n = t._zod.def, o = n.checks;
  if (o && o.length > 0)
    throw new Error(".pick() cannot be used on object schemas containing refinements");
  const i = ne(t._zod.def, {
    get shape() {
      const s = {};
      for (const a in e) {
        if (!(a in n.shape))
          throw new Error(`Unrecognized key: "${a}"`);
        e[a] && (s[a] = n.shape[a]);
      }
      return le(this, "shape", s), s;
    },
    checks: []
  });
  return oe(t, i);
}
function ci(t, e) {
  const n = t._zod.def, o = n.checks;
  if (o && o.length > 0)
    throw new Error(".omit() cannot be used on object schemas containing refinements");
  const i = ne(t._zod.def, {
    get shape() {
      const s = { ...t._zod.def.shape };
      for (const a in e) {
        if (!(a in n.shape))
          throw new Error(`Unrecognized key: "${a}"`);
        e[a] && delete s[a];
      }
      return le(this, "shape", s), s;
    },
    checks: []
  });
  return oe(t, i);
}
function ui(t, e) {
  if (!we(e))
    throw new Error("Invalid input to extend: expected a plain object");
  const n = t._zod.def.checks;
  if (n && n.length > 0) {
    const i = t._zod.def.shape;
    for (const s in e)
      if (Object.getOwnPropertyDescriptor(i, s) !== void 0)
        throw new Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
  }
  const r = ne(t._zod.def, {
    get shape() {
      const i = { ...t._zod.def.shape, ...e };
      return le(this, "shape", i), i;
    }
  });
  return oe(t, r);
}
function li(t, e) {
  if (!we(e))
    throw new Error("Invalid input to safeExtend: expected a plain object");
  const n = ne(t._zod.def, {
    get shape() {
      const o = { ...t._zod.def.shape, ...e };
      return le(this, "shape", o), o;
    }
  });
  return oe(t, n);
}
function di(t, e) {
  const n = ne(t._zod.def, {
    get shape() {
      const o = { ...t._zod.def.shape, ...e._zod.def.shape };
      return le(this, "shape", o), o;
    },
    get catchall() {
      return e._zod.def.catchall;
    },
    checks: []
    // delete existing checks
  });
  return oe(t, n);
}
function hi(t, e, n) {
  const r = e._zod.def.checks;
  if (r && r.length > 0)
    throw new Error(".partial() cannot be used on object schemas containing refinements");
  const s = ne(e._zod.def, {
    get shape() {
      const a = e._zod.def.shape, c = { ...a };
      if (n)
        for (const u in n) {
          if (!(u in a))
            throw new Error(`Unrecognized key: "${u}"`);
          n[u] && (c[u] = t ? new t({
            type: "optional",
            innerType: a[u]
          }) : a[u]);
        }
      else
        for (const u in a)
          c[u] = t ? new t({
            type: "optional",
            innerType: a[u]
          }) : a[u];
      return le(this, "shape", c), c;
    },
    checks: []
  });
  return oe(e, s);
}
function pi(t, e, n) {
  const o = ne(e._zod.def, {
    get shape() {
      const r = e._zod.def.shape, i = { ...r };
      if (n)
        for (const s in n) {
          if (!(s in i))
            throw new Error(`Unrecognized key: "${s}"`);
          n[s] && (i[s] = new t({
            type: "nonoptional",
            innerType: r[s]
          }));
        }
      else
        for (const s in r)
          i[s] = new t({
            type: "nonoptional",
            innerType: r[s]
          });
      return le(this, "shape", i), i;
    }
  });
  return oe(e, o);
}
function _e(t, e = 0) {
  var n;
  if (t.aborted === !0)
    return !0;
  for (let o = e; o < t.issues.length; o++)
    if (((n = t.issues[o]) == null ? void 0 : n.continue) !== !0)
      return !0;
  return !1;
}
function ge(t, e) {
  return e.map((n) => {
    var o;
    return (o = n).path ?? (o.path = []), n.path.unshift(t), n;
  });
}
function Fe(t) {
  return typeof t == "string" ? t : t == null ? void 0 : t.message;
}
function te(t, e, n) {
  var r, i, s, a, c, u;
  const o = { ...t, path: t.path ?? [] };
  if (!t.message) {
    const l = Fe((s = (i = (r = t.inst) == null ? void 0 : r._zod.def) == null ? void 0 : i.error) == null ? void 0 : s.call(i, t)) ?? Fe((a = e == null ? void 0 : e.error) == null ? void 0 : a.call(e, t)) ?? Fe((c = n.customError) == null ? void 0 : c.call(n, t)) ?? Fe((u = n.localeError) == null ? void 0 : u.call(n, t)) ?? "Invalid input";
    o.message = l;
  }
  return delete o.inst, delete o.continue, e != null && e.reportInput || delete o.input, o;
}
function Lt(t) {
  return Array.isArray(t) ? "array" : typeof t == "string" ? "string" : "unknown";
}
function Oe(...t) {
  const [e, n, o] = t;
  return typeof e == "string" ? {
    message: e,
    code: "custom",
    input: n,
    inst: o
  } : { ...e };
}
const fo = (t, e) => {
  t.name = "$ZodError", Object.defineProperty(t, "_zod", {
    value: t._zod,
    enumerable: !1
  }), Object.defineProperty(t, "issues", {
    value: e,
    enumerable: !1
  }), t.message = JSON.stringify(e, xt, 2), Object.defineProperty(t, "toString", {
    value: () => t.message,
    enumerable: !1
  });
}, mo = h("$ZodError", fo), _o = h("$ZodError", fo, { Parent: Error });
function fi(t, e = (n) => n.message) {
  const n = {}, o = [];
  for (const r of t.issues)
    r.path.length > 0 ? (n[r.path[0]] = n[r.path[0]] || [], n[r.path[0]].push(e(r))) : o.push(e(r));
  return { formErrors: o, fieldErrors: n };
}
function mi(t, e = (n) => n.message) {
  const n = { _errors: [] }, o = (r) => {
    for (const i of r.issues)
      if (i.code === "invalid_union" && i.errors.length)
        i.errors.map((s) => o({ issues: s }));
      else if (i.code === "invalid_key")
        o({ issues: i.issues });
      else if (i.code === "invalid_element")
        o({ issues: i.issues });
      else if (i.path.length === 0)
        n._errors.push(e(i));
      else {
        let s = n, a = 0;
        for (; a < i.path.length; ) {
          const c = i.path[a];
          a === i.path.length - 1 ? (s[c] = s[c] || { _errors: [] }, s[c]._errors.push(e(i))) : s[c] = s[c] || { _errors: [] }, s = s[c], a++;
        }
      }
  };
  return o(t), n;
}
const Ut = (t) => (e, n, o, r) => {
  const i = o ? Object.assign(o, { async: !1 }) : { async: !1 }, s = e._zod.run({ value: n, issues: [] }, i);
  if (s instanceof Promise)
    throw new be();
  if (s.issues.length) {
    const a = new ((r == null ? void 0 : r.Err) ?? t)(s.issues.map((c) => te(c, i, ee())));
    throw ho(a, r == null ? void 0 : r.callee), a;
  }
  return s.value;
}, Mt = (t) => async (e, n, o, r) => {
  const i = o ? Object.assign(o, { async: !0 }) : { async: !0 };
  let s = e._zod.run({ value: n, issues: [] }, i);
  if (s instanceof Promise && (s = await s), s.issues.length) {
    const a = new ((r == null ? void 0 : r.Err) ?? t)(s.issues.map((c) => te(c, i, ee())));
    throw ho(a, r == null ? void 0 : r.callee), a;
  }
  return s.value;
}, ut = (t) => (e, n, o) => {
  const r = o ? { ...o, async: !1 } : { async: !1 }, i = e._zod.run({ value: n, issues: [] }, r);
  if (i instanceof Promise)
    throw new be();
  return i.issues.length ? {
    success: !1,
    error: new (t ?? mo)(i.issues.map((s) => te(s, r, ee())))
  } : { success: !0, data: i.value };
}, _i = /* @__PURE__ */ ut(_o), lt = (t) => async (e, n, o) => {
  const r = o ? Object.assign(o, { async: !0 }) : { async: !0 };
  let i = e._zod.run({ value: n, issues: [] }, r);
  return i instanceof Promise && (i = await i), i.issues.length ? {
    success: !1,
    error: new t(i.issues.map((s) => te(s, r, ee())))
  } : { success: !0, data: i.value };
}, gi = /* @__PURE__ */ lt(_o), bi = (t) => (e, n, o) => {
  const r = o ? Object.assign(o, { direction: "backward" }) : { direction: "backward" };
  return Ut(t)(e, n, r);
}, vi = (t) => (e, n, o) => Ut(t)(e, n, o), yi = (t) => async (e, n, o) => {
  const r = o ? Object.assign(o, { direction: "backward" }) : { direction: "backward" };
  return Mt(t)(e, n, r);
}, wi = (t) => async (e, n, o) => Mt(t)(e, n, o), $i = (t) => (e, n, o) => {
  const r = o ? Object.assign(o, { direction: "backward" }) : { direction: "backward" };
  return ut(t)(e, n, r);
}, ki = (t) => (e, n, o) => ut(t)(e, n, o), Si = (t) => async (e, n, o) => {
  const r = o ? Object.assign(o, { direction: "backward" }) : { direction: "backward" };
  return lt(t)(e, n, r);
}, zi = (t) => async (e, n, o) => lt(t)(e, n, o), Ei = /^[cC][^\s-]{8,}$/, xi = /^[0-9a-z]+$/, Ri = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/, Ai = /^[0-9a-vA-V]{20}$/, Ci = /^[A-Za-z0-9]{27}$/, Zi = /^[a-zA-Z0-9_-]{21}$/, Ii = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/, Ti = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/, yn = (t) => t ? new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${t}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`) : /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/, Ni = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/, Pi = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
function Oi() {
  return new RegExp(Pi, "u");
}
const ji = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, Di = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/, Li = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/, Ui = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, Mi = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/, go = /^[A-Za-z0-9_-]*$/, Fi = /^\+[1-9]\d{6,14}$/, bo = "(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))", Bi = /* @__PURE__ */ new RegExp(`^${bo}$`);
function vo(t) {
  const e = "(?:[01]\\d|2[0-3]):[0-5]\\d";
  return typeof t.precision == "number" ? t.precision === -1 ? `${e}` : t.precision === 0 ? `${e}:[0-5]\\d` : `${e}:[0-5]\\d\\.\\d{${t.precision}}` : `${e}(?::[0-5]\\d(?:\\.\\d+)?)?`;
}
function Hi(t) {
  return new RegExp(`^${vo(t)}$`);
}
function Ji(t) {
  const e = vo({ precision: t.precision }), n = ["Z"];
  t.local && n.push(""), t.offset && n.push("([+-](?:[01]\\d|2[0-3]):[0-5]\\d)");
  const o = `${e}(?:${n.join("|")})`;
  return new RegExp(`^${bo}T(?:${o})$`);
}
const Wi = (t) => {
  const e = t ? `[\\s\\S]{${(t == null ? void 0 : t.minimum) ?? 0},${(t == null ? void 0 : t.maximum) ?? ""}}` : "[\\s\\S]*";
  return new RegExp(`^${e}$`);
}, Vi = /^-?\d+$/, yo = /^-?\d+(?:\.\d+)?$/, qi = /^(?:true|false)$/i, Xi = /^[^A-Z]*$/, Yi = /^[^a-z]*$/, H = /* @__PURE__ */ h("$ZodCheck", (t, e) => {
  var n;
  t._zod ?? (t._zod = {}), t._zod.def = e, (n = t._zod).onattach ?? (n.onattach = []);
}), wo = {
  number: "number",
  bigint: "bigint",
  object: "date"
}, $o = /* @__PURE__ */ h("$ZodCheckLessThan", (t, e) => {
  H.init(t, e);
  const n = wo[typeof e.value];
  t._zod.onattach.push((o) => {
    const r = o._zod.bag, i = (e.inclusive ? r.maximum : r.exclusiveMaximum) ?? Number.POSITIVE_INFINITY;
    e.value < i && (e.inclusive ? r.maximum = e.value : r.exclusiveMaximum = e.value);
  }), t._zod.check = (o) => {
    (e.inclusive ? o.value <= e.value : o.value < e.value) || o.issues.push({
      origin: n,
      code: "too_big",
      maximum: typeof e.value == "object" ? e.value.getTime() : e.value,
      input: o.value,
      inclusive: e.inclusive,
      inst: t,
      continue: !e.abort
    });
  };
}), ko = /* @__PURE__ */ h("$ZodCheckGreaterThan", (t, e) => {
  H.init(t, e);
  const n = wo[typeof e.value];
  t._zod.onattach.push((o) => {
    const r = o._zod.bag, i = (e.inclusive ? r.minimum : r.exclusiveMinimum) ?? Number.NEGATIVE_INFINITY;
    e.value > i && (e.inclusive ? r.minimum = e.value : r.exclusiveMinimum = e.value);
  }), t._zod.check = (o) => {
    (e.inclusive ? o.value >= e.value : o.value > e.value) || o.issues.push({
      origin: n,
      code: "too_small",
      minimum: typeof e.value == "object" ? e.value.getTime() : e.value,
      input: o.value,
      inclusive: e.inclusive,
      inst: t,
      continue: !e.abort
    });
  };
}), Ki = /* @__PURE__ */ h("$ZodCheckMultipleOf", (t, e) => {
  H.init(t, e), t._zod.onattach.push((n) => {
    var o;
    (o = n._zod.bag).multipleOf ?? (o.multipleOf = e.value);
  }), t._zod.check = (n) => {
    if (typeof n.value != typeof e.value)
      throw new Error("Cannot mix number and bigint in multiple_of check.");
    (typeof n.value == "bigint" ? n.value % e.value === BigInt(0) : ti(n.value, e.value) === 0) || n.issues.push({
      origin: typeof n.value,
      code: "not_multiple_of",
      divisor: e.value,
      input: n.value,
      inst: t,
      continue: !e.abort
    });
  };
}), Gi = /* @__PURE__ */ h("$ZodCheckNumberFormat", (t, e) => {
  var s;
  H.init(t, e), e.format = e.format || "float64";
  const n = (s = e.format) == null ? void 0 : s.includes("int"), o = n ? "int" : "number", [r, i] = si[e.format];
  t._zod.onattach.push((a) => {
    const c = a._zod.bag;
    c.format = e.format, c.minimum = r, c.maximum = i, n && (c.pattern = Vi);
  }), t._zod.check = (a) => {
    const c = a.value;
    if (n) {
      if (!Number.isInteger(c)) {
        a.issues.push({
          expected: o,
          format: e.format,
          code: "invalid_type",
          continue: !1,
          input: c,
          inst: t
        });
        return;
      }
      if (!Number.isSafeInteger(c)) {
        c > 0 ? a.issues.push({
          input: c,
          code: "too_big",
          maximum: Number.MAX_SAFE_INTEGER,
          note: "Integers must be within the safe integer range.",
          inst: t,
          origin: o,
          inclusive: !0,
          continue: !e.abort
        }) : a.issues.push({
          input: c,
          code: "too_small",
          minimum: Number.MIN_SAFE_INTEGER,
          note: "Integers must be within the safe integer range.",
          inst: t,
          origin: o,
          inclusive: !0,
          continue: !e.abort
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
      inst: t,
      continue: !e.abort
    }), c > i && a.issues.push({
      origin: "number",
      input: c,
      code: "too_big",
      maximum: i,
      inclusive: !0,
      inst: t,
      continue: !e.abort
    });
  };
}), Qi = /* @__PURE__ */ h("$ZodCheckMaxLength", (t, e) => {
  var n;
  H.init(t, e), (n = t._zod.def).when ?? (n.when = (o) => {
    const r = o.value;
    return !jt(r) && r.length !== void 0;
  }), t._zod.onattach.push((o) => {
    const r = o._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
    e.maximum < r && (o._zod.bag.maximum = e.maximum);
  }), t._zod.check = (o) => {
    const r = o.value;
    if (r.length <= e.maximum)
      return;
    const s = Lt(r);
    o.issues.push({
      origin: s,
      code: "too_big",
      maximum: e.maximum,
      inclusive: !0,
      input: r,
      inst: t,
      continue: !e.abort
    });
  };
}), es = /* @__PURE__ */ h("$ZodCheckMinLength", (t, e) => {
  var n;
  H.init(t, e), (n = t._zod.def).when ?? (n.when = (o) => {
    const r = o.value;
    return !jt(r) && r.length !== void 0;
  }), t._zod.onattach.push((o) => {
    const r = o._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
    e.minimum > r && (o._zod.bag.minimum = e.minimum);
  }), t._zod.check = (o) => {
    const r = o.value;
    if (r.length >= e.minimum)
      return;
    const s = Lt(r);
    o.issues.push({
      origin: s,
      code: "too_small",
      minimum: e.minimum,
      inclusive: !0,
      input: r,
      inst: t,
      continue: !e.abort
    });
  };
}), ts = /* @__PURE__ */ h("$ZodCheckLengthEquals", (t, e) => {
  var n;
  H.init(t, e), (n = t._zod.def).when ?? (n.when = (o) => {
    const r = o.value;
    return !jt(r) && r.length !== void 0;
  }), t._zod.onattach.push((o) => {
    const r = o._zod.bag;
    r.minimum = e.length, r.maximum = e.length, r.length = e.length;
  }), t._zod.check = (o) => {
    const r = o.value, i = r.length;
    if (i === e.length)
      return;
    const s = Lt(r), a = i > e.length;
    o.issues.push({
      origin: s,
      ...a ? { code: "too_big", maximum: e.length } : { code: "too_small", minimum: e.length },
      inclusive: !0,
      exact: !0,
      input: o.value,
      inst: t,
      continue: !e.abort
    });
  };
}), dt = /* @__PURE__ */ h("$ZodCheckStringFormat", (t, e) => {
  var n, o;
  H.init(t, e), t._zod.onattach.push((r) => {
    const i = r._zod.bag;
    i.format = e.format, e.pattern && (i.patterns ?? (i.patterns = /* @__PURE__ */ new Set()), i.patterns.add(e.pattern));
  }), e.pattern ? (n = t._zod).check ?? (n.check = (r) => {
    e.pattern.lastIndex = 0, !e.pattern.test(r.value) && r.issues.push({
      origin: "string",
      code: "invalid_format",
      format: e.format,
      input: r.value,
      ...e.pattern ? { pattern: e.pattern.toString() } : {},
      inst: t,
      continue: !e.abort
    });
  }) : (o = t._zod).check ?? (o.check = () => {
  });
}), ns = /* @__PURE__ */ h("$ZodCheckRegex", (t, e) => {
  dt.init(t, e), t._zod.check = (n) => {
    e.pattern.lastIndex = 0, !e.pattern.test(n.value) && n.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "regex",
      input: n.value,
      pattern: e.pattern.toString(),
      inst: t,
      continue: !e.abort
    });
  };
}), os = /* @__PURE__ */ h("$ZodCheckLowerCase", (t, e) => {
  e.pattern ?? (e.pattern = Xi), dt.init(t, e);
}), rs = /* @__PURE__ */ h("$ZodCheckUpperCase", (t, e) => {
  e.pattern ?? (e.pattern = Yi), dt.init(t, e);
}), is = /* @__PURE__ */ h("$ZodCheckIncludes", (t, e) => {
  H.init(t, e);
  const n = ct(e.includes), o = new RegExp(typeof e.position == "number" ? `^.{${e.position}}${n}` : n);
  e.pattern = o, t._zod.onattach.push((r) => {
    const i = r._zod.bag;
    i.patterns ?? (i.patterns = /* @__PURE__ */ new Set()), i.patterns.add(o);
  }), t._zod.check = (r) => {
    r.value.includes(e.includes, e.position) || r.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "includes",
      includes: e.includes,
      input: r.value,
      inst: t,
      continue: !e.abort
    });
  };
}), ss = /* @__PURE__ */ h("$ZodCheckStartsWith", (t, e) => {
  H.init(t, e);
  const n = new RegExp(`^${ct(e.prefix)}.*`);
  e.pattern ?? (e.pattern = n), t._zod.onattach.push((o) => {
    const r = o._zod.bag;
    r.patterns ?? (r.patterns = /* @__PURE__ */ new Set()), r.patterns.add(n);
  }), t._zod.check = (o) => {
    o.value.startsWith(e.prefix) || o.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "starts_with",
      prefix: e.prefix,
      input: o.value,
      inst: t,
      continue: !e.abort
    });
  };
}), as = /* @__PURE__ */ h("$ZodCheckEndsWith", (t, e) => {
  H.init(t, e);
  const n = new RegExp(`.*${ct(e.suffix)}$`);
  e.pattern ?? (e.pattern = n), t._zod.onattach.push((o) => {
    const r = o._zod.bag;
    r.patterns ?? (r.patterns = /* @__PURE__ */ new Set()), r.patterns.add(n);
  }), t._zod.check = (o) => {
    o.value.endsWith(e.suffix) || o.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "ends_with",
      suffix: e.suffix,
      input: o.value,
      inst: t,
      continue: !e.abort
    });
  };
}), cs = /* @__PURE__ */ h("$ZodCheckOverwrite", (t, e) => {
  H.init(t, e), t._zod.check = (n) => {
    n.value = e.tx(n.value);
  };
});
class us {
  constructor(e = []) {
    this.content = [], this.indent = 0, this && (this.args = e);
  }
  indented(e) {
    this.indent += 1, e(this), this.indent -= 1;
  }
  write(e) {
    if (typeof e == "function") {
      e(this, { execution: "sync" }), e(this, { execution: "async" });
      return;
    }
    const o = e.split(`
`).filter((s) => s), r = Math.min(...o.map((s) => s.length - s.trimStart().length)), i = o.map((s) => s.slice(r)).map((s) => " ".repeat(this.indent * 2) + s);
    for (const s of i)
      this.content.push(s);
  }
  compile() {
    const e = Function, n = this == null ? void 0 : this.args, r = [...((this == null ? void 0 : this.content) ?? [""]).map((i) => `  ${i}`)];
    return new e(...n, r.join(`
`));
  }
}
const ls = {
  major: 4,
  minor: 3,
  patch: 6
}, A = /* @__PURE__ */ h("$ZodType", (t, e) => {
  var r;
  var n;
  t ?? (t = {}), t._zod.def = e, t._zod.bag = t._zod.bag || {}, t._zod.version = ls;
  const o = [...t._zod.def.checks ?? []];
  t._zod.traits.has("$ZodCheck") && o.unshift(t);
  for (const i of o)
    for (const s of i._zod.onattach)
      s(t);
  if (o.length === 0)
    (n = t._zod).deferred ?? (n.deferred = []), (r = t._zod.deferred) == null || r.push(() => {
      t._zod.run = t._zod.parse;
    });
  else {
    const i = (a, c, u) => {
      let l = _e(a), d;
      for (const m of c) {
        if (m._zod.def.when) {
          if (!m._zod.def.when(a))
            continue;
        } else if (l)
          continue;
        const f = a.issues.length, _ = m._zod.check(a);
        if (_ instanceof Promise && (u == null ? void 0 : u.async) === !1)
          throw new be();
        if (d || _ instanceof Promise)
          d = (d ?? Promise.resolve()).then(async () => {
            await _, a.issues.length !== f && (l || (l = _e(a, f)));
          });
        else {
          if (a.issues.length === f)
            continue;
          l || (l = _e(a, f));
        }
      }
      return d ? d.then(() => a) : a;
    }, s = (a, c, u) => {
      if (_e(a))
        return a.aborted = !0, a;
      const l = i(c, o, u);
      if (l instanceof Promise) {
        if (u.async === !1)
          throw new be();
        return l.then((d) => t._zod.parse(d, u));
      }
      return t._zod.parse(l, u);
    };
    t._zod.run = (a, c) => {
      if (c.skipChecks)
        return t._zod.parse(a, c);
      if (c.direction === "backward") {
        const l = t._zod.parse({ value: a.value, issues: [] }, { ...c, skipChecks: !0 });
        return l instanceof Promise ? l.then((d) => s(d, a, c)) : s(l, a, c);
      }
      const u = t._zod.parse(a, c);
      if (u instanceof Promise) {
        if (c.async === !1)
          throw new be();
        return u.then((l) => i(l, o, c));
      }
      return i(u, o, c);
    };
  }
  k(t, "~standard", () => ({
    validate: (i) => {
      var s;
      try {
        const a = _i(t, i);
        return a.success ? { value: a.data } : { issues: (s = a.error) == null ? void 0 : s.issues };
      } catch {
        return gi(t, i).then((c) => {
          var u;
          return c.success ? { value: c.data } : { issues: (u = c.error) == null ? void 0 : u.issues };
        });
      }
    },
    vendor: "zod",
    version: 1
  }));
}), Ft = /* @__PURE__ */ h("$ZodString", (t, e) => {
  var n;
  A.init(t, e), t._zod.pattern = [...((n = t == null ? void 0 : t._zod.bag) == null ? void 0 : n.patterns) ?? []].pop() ?? Wi(t._zod.bag), t._zod.parse = (o, r) => {
    if (e.coerce)
      try {
        o.value = String(o.value);
      } catch {
      }
    return typeof o.value == "string" || o.issues.push({
      expected: "string",
      code: "invalid_type",
      input: o.value,
      inst: t
    }), o;
  };
}), x = /* @__PURE__ */ h("$ZodStringFormat", (t, e) => {
  dt.init(t, e), Ft.init(t, e);
}), ds = /* @__PURE__ */ h("$ZodGUID", (t, e) => {
  e.pattern ?? (e.pattern = Ti), x.init(t, e);
}), hs = /* @__PURE__ */ h("$ZodUUID", (t, e) => {
  if (e.version) {
    const o = {
      v1: 1,
      v2: 2,
      v3: 3,
      v4: 4,
      v5: 5,
      v6: 6,
      v7: 7,
      v8: 8
    }[e.version];
    if (o === void 0)
      throw new Error(`Invalid UUID version: "${e.version}"`);
    e.pattern ?? (e.pattern = yn(o));
  } else
    e.pattern ?? (e.pattern = yn());
  x.init(t, e);
}), ps = /* @__PURE__ */ h("$ZodEmail", (t, e) => {
  e.pattern ?? (e.pattern = Ni), x.init(t, e);
}), fs = /* @__PURE__ */ h("$ZodURL", (t, e) => {
  x.init(t, e), t._zod.check = (n) => {
    try {
      const o = n.value.trim(), r = new URL(o);
      e.hostname && (e.hostname.lastIndex = 0, e.hostname.test(r.hostname) || n.issues.push({
        code: "invalid_format",
        format: "url",
        note: "Invalid hostname",
        pattern: e.hostname.source,
        input: n.value,
        inst: t,
        continue: !e.abort
      })), e.protocol && (e.protocol.lastIndex = 0, e.protocol.test(r.protocol.endsWith(":") ? r.protocol.slice(0, -1) : r.protocol) || n.issues.push({
        code: "invalid_format",
        format: "url",
        note: "Invalid protocol",
        pattern: e.protocol.source,
        input: n.value,
        inst: t,
        continue: !e.abort
      })), e.normalize ? n.value = r.href : n.value = o;
      return;
    } catch {
      n.issues.push({
        code: "invalid_format",
        format: "url",
        input: n.value,
        inst: t,
        continue: !e.abort
      });
    }
  };
}), ms = /* @__PURE__ */ h("$ZodEmoji", (t, e) => {
  e.pattern ?? (e.pattern = Oi()), x.init(t, e);
}), _s = /* @__PURE__ */ h("$ZodNanoID", (t, e) => {
  e.pattern ?? (e.pattern = Zi), x.init(t, e);
}), gs = /* @__PURE__ */ h("$ZodCUID", (t, e) => {
  e.pattern ?? (e.pattern = Ei), x.init(t, e);
}), bs = /* @__PURE__ */ h("$ZodCUID2", (t, e) => {
  e.pattern ?? (e.pattern = xi), x.init(t, e);
}), vs = /* @__PURE__ */ h("$ZodULID", (t, e) => {
  e.pattern ?? (e.pattern = Ri), x.init(t, e);
}), ys = /* @__PURE__ */ h("$ZodXID", (t, e) => {
  e.pattern ?? (e.pattern = Ai), x.init(t, e);
}), ws = /* @__PURE__ */ h("$ZodKSUID", (t, e) => {
  e.pattern ?? (e.pattern = Ci), x.init(t, e);
}), $s = /* @__PURE__ */ h("$ZodISODateTime", (t, e) => {
  e.pattern ?? (e.pattern = Ji(e)), x.init(t, e);
}), ks = /* @__PURE__ */ h("$ZodISODate", (t, e) => {
  e.pattern ?? (e.pattern = Bi), x.init(t, e);
}), Ss = /* @__PURE__ */ h("$ZodISOTime", (t, e) => {
  e.pattern ?? (e.pattern = Hi(e)), x.init(t, e);
}), zs = /* @__PURE__ */ h("$ZodISODuration", (t, e) => {
  e.pattern ?? (e.pattern = Ii), x.init(t, e);
}), Es = /* @__PURE__ */ h("$ZodIPv4", (t, e) => {
  e.pattern ?? (e.pattern = ji), x.init(t, e), t._zod.bag.format = "ipv4";
}), xs = /* @__PURE__ */ h("$ZodIPv6", (t, e) => {
  e.pattern ?? (e.pattern = Di), x.init(t, e), t._zod.bag.format = "ipv6", t._zod.check = (n) => {
    try {
      new URL(`http://[${n.value}]`);
    } catch {
      n.issues.push({
        code: "invalid_format",
        format: "ipv6",
        input: n.value,
        inst: t,
        continue: !e.abort
      });
    }
  };
}), Rs = /* @__PURE__ */ h("$ZodCIDRv4", (t, e) => {
  e.pattern ?? (e.pattern = Li), x.init(t, e);
}), As = /* @__PURE__ */ h("$ZodCIDRv6", (t, e) => {
  e.pattern ?? (e.pattern = Ui), x.init(t, e), t._zod.check = (n) => {
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
        inst: t,
        continue: !e.abort
      });
    }
  };
});
function So(t) {
  if (t === "")
    return !0;
  if (t.length % 4 !== 0)
    return !1;
  try {
    return atob(t), !0;
  } catch {
    return !1;
  }
}
const Cs = /* @__PURE__ */ h("$ZodBase64", (t, e) => {
  e.pattern ?? (e.pattern = Mi), x.init(t, e), t._zod.bag.contentEncoding = "base64", t._zod.check = (n) => {
    So(n.value) || n.issues.push({
      code: "invalid_format",
      format: "base64",
      input: n.value,
      inst: t,
      continue: !e.abort
    });
  };
});
function Zs(t) {
  if (!go.test(t))
    return !1;
  const e = t.replace(/[-_]/g, (o) => o === "-" ? "+" : "/"), n = e.padEnd(Math.ceil(e.length / 4) * 4, "=");
  return So(n);
}
const Is = /* @__PURE__ */ h("$ZodBase64URL", (t, e) => {
  e.pattern ?? (e.pattern = go), x.init(t, e), t._zod.bag.contentEncoding = "base64url", t._zod.check = (n) => {
    Zs(n.value) || n.issues.push({
      code: "invalid_format",
      format: "base64url",
      input: n.value,
      inst: t,
      continue: !e.abort
    });
  };
}), Ts = /* @__PURE__ */ h("$ZodE164", (t, e) => {
  e.pattern ?? (e.pattern = Fi), x.init(t, e);
});
function Ns(t, e = null) {
  try {
    const n = t.split(".");
    if (n.length !== 3)
      return !1;
    const [o] = n;
    if (!o)
      return !1;
    const r = JSON.parse(atob(o));
    return !("typ" in r && (r == null ? void 0 : r.typ) !== "JWT" || !r.alg || e && (!("alg" in r) || r.alg !== e));
  } catch {
    return !1;
  }
}
const Ps = /* @__PURE__ */ h("$ZodJWT", (t, e) => {
  x.init(t, e), t._zod.check = (n) => {
    Ns(n.value, e.alg) || n.issues.push({
      code: "invalid_format",
      format: "jwt",
      input: n.value,
      inst: t,
      continue: !e.abort
    });
  };
}), zo = /* @__PURE__ */ h("$ZodNumber", (t, e) => {
  A.init(t, e), t._zod.pattern = t._zod.bag.pattern ?? yo, t._zod.parse = (n, o) => {
    if (e.coerce)
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
      inst: t,
      ...i ? { received: i } : {}
    }), n;
  };
}), Os = /* @__PURE__ */ h("$ZodNumberFormat", (t, e) => {
  Gi.init(t, e), zo.init(t, e);
}), js = /* @__PURE__ */ h("$ZodBoolean", (t, e) => {
  A.init(t, e), t._zod.pattern = qi, t._zod.parse = (n, o) => {
    if (e.coerce)
      try {
        n.value = !!n.value;
      } catch {
      }
    const r = n.value;
    return typeof r == "boolean" || n.issues.push({
      expected: "boolean",
      code: "invalid_type",
      input: r,
      inst: t
    }), n;
  };
}), Ds = /* @__PURE__ */ h("$ZodUnknown", (t, e) => {
  A.init(t, e), t._zod.parse = (n) => n;
}), Ls = /* @__PURE__ */ h("$ZodNever", (t, e) => {
  A.init(t, e), t._zod.parse = (n, o) => (n.issues.push({
    expected: "never",
    code: "invalid_type",
    input: n.value,
    inst: t
  }), n);
});
function wn(t, e, n) {
  t.issues.length && e.issues.push(...ge(n, t.issues)), e.value[n] = t.value;
}
const Us = /* @__PURE__ */ h("$ZodArray", (t, e) => {
  A.init(t, e), t._zod.parse = (n, o) => {
    const r = n.value;
    if (!Array.isArray(r))
      return n.issues.push({
        expected: "array",
        code: "invalid_type",
        input: r,
        inst: t
      }), n;
    n.value = Array(r.length);
    const i = [];
    for (let s = 0; s < r.length; s++) {
      const a = r[s], c = e.element._zod.run({
        value: a,
        issues: []
      }, o);
      c instanceof Promise ? i.push(c.then((u) => wn(u, n, s))) : wn(c, n, s);
    }
    return i.length ? Promise.all(i).then(() => n) : n;
  };
});
function et(t, e, n, o, r) {
  if (t.issues.length) {
    if (r && !(n in o))
      return;
    e.issues.push(...ge(n, t.issues));
  }
  t.value === void 0 ? n in o && (e.value[n] = void 0) : e.value[n] = t.value;
}
function Eo(t) {
  var o, r, i, s;
  const e = Object.keys(t.shape);
  for (const a of e)
    if (!((s = (i = (r = (o = t.shape) == null ? void 0 : o[a]) == null ? void 0 : r._zod) == null ? void 0 : i.traits) != null && s.has("$ZodType")))
      throw new Error(`Invalid element at key "${a}": expected a Zod schema`);
  const n = ii(t.shape);
  return {
    ...t,
    keys: e,
    keySet: new Set(e),
    numKeys: e.length,
    optionalKeys: new Set(n)
  };
}
function xo(t, e, n, o, r, i) {
  const s = [], a = r.keySet, c = r.catchall._zod, u = c.def.type, l = c.optout === "optional";
  for (const d in e) {
    if (a.has(d))
      continue;
    if (u === "never") {
      s.push(d);
      continue;
    }
    const m = c.run({ value: e[d], issues: [] }, o);
    m instanceof Promise ? t.push(m.then((f) => et(f, n, d, e, l))) : et(m, n, d, e, l);
  }
  return s.length && n.issues.push({
    code: "unrecognized_keys",
    keys: s,
    input: e,
    inst: i
  }), t.length ? Promise.all(t).then(() => n) : n;
}
const Ms = /* @__PURE__ */ h("$ZodObject", (t, e) => {
  A.init(t, e);
  const n = Object.getOwnPropertyDescriptor(e, "shape");
  if (!(n != null && n.get)) {
    const a = e.shape;
    Object.defineProperty(e, "shape", {
      get: () => {
        const c = { ...a };
        return Object.defineProperty(e, "shape", {
          value: c
        }), c;
      }
    });
  }
  const o = Ot(() => Eo(e));
  k(t._zod, "propValues", () => {
    const a = e.shape, c = {};
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
  const r = Qe, i = e.catchall;
  let s;
  t._zod.parse = (a, c) => {
    s ?? (s = o.value);
    const u = a.value;
    if (!r(u))
      return a.issues.push({
        expected: "object",
        code: "invalid_type",
        input: u,
        inst: t
      }), a;
    a.value = {};
    const l = [], d = s.shape;
    for (const m of s.keys) {
      const f = d[m], _ = f._zod.optout === "optional", w = f._zod.run({ value: u[m], issues: [] }, c);
      w instanceof Promise ? l.push(w.then((z) => et(z, a, m, u, _))) : et(w, a, m, u, _);
    }
    return i ? xo(l, u, a, c, o.value, t) : l.length ? Promise.all(l).then(() => a) : a;
  };
}), Fs = /* @__PURE__ */ h("$ZodObjectJIT", (t, e) => {
  Ms.init(t, e);
  const n = t._zod.parse, o = Ot(() => Eo(e)), r = (m) => {
    var O;
    const f = new us(["shape", "payload", "ctx"]), _ = o.value, w = (L) => {
      const j = vn(L);
      return `shape[${j}]._zod.run({ value: input[${j}], issues: [] }, ctx)`;
    };
    f.write("const input = payload.value;");
    const z = /* @__PURE__ */ Object.create(null);
    let Y = 0;
    for (const L of _.keys)
      z[L] = `key_${Y++}`;
    f.write("const newResult = {};");
    for (const L of _.keys) {
      const j = z[L], F = vn(L), re = m[L], Ue = ((O = re == null ? void 0 : re._zod) == null ? void 0 : O.optout) === "optional";
      f.write(`const ${j} = ${w(L)};`), Ue ? f.write(`
        if (${j}.issues.length) {
          if (${F} in input) {
            payload.issues = payload.issues.concat(${j}.issues.map(iss => ({
              ...iss,
              path: iss.path ? [${F}, ...iss.path] : [${F}]
            })));
          }
        }
        
        if (${j}.value === undefined) {
          if (${F} in input) {
            newResult[${F}] = undefined;
          }
        } else {
          newResult[${F}] = ${j}.value;
        }
        
      `) : f.write(`
        if (${j}.issues.length) {
          payload.issues = payload.issues.concat(${j}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${F}, ...iss.path] : [${F}]
          })));
        }
        
        if (${j}.value === undefined) {
          if (${F} in input) {
            newResult[${F}] = undefined;
          }
        } else {
          newResult[${F}] = ${j}.value;
        }
        
      `);
    }
    f.write("payload.value = newResult;"), f.write("return payload;");
    const E = f.compile();
    return (L, j) => E(m, L, j);
  };
  let i;
  const s = Qe, a = !uo.jitless, u = a && oi.value, l = e.catchall;
  let d;
  t._zod.parse = (m, f) => {
    d ?? (d = o.value);
    const _ = m.value;
    return s(_) ? a && u && (f == null ? void 0 : f.async) === !1 && f.jitless !== !0 ? (i || (i = r(e.shape)), m = i(m, f), l ? xo([], _, m, f, d, t) : m) : n(m, f) : (m.issues.push({
      expected: "object",
      code: "invalid_type",
      input: _,
      inst: t
    }), m);
  };
});
function $n(t, e, n, o) {
  for (const i of t)
    if (i.issues.length === 0)
      return e.value = i.value, e;
  const r = t.filter((i) => !_e(i));
  return r.length === 1 ? (e.value = r[0].value, r[0]) : (e.issues.push({
    code: "invalid_union",
    input: e.value,
    inst: n,
    errors: t.map((i) => i.issues.map((s) => te(s, o, ee())))
  }), e);
}
const Bs = /* @__PURE__ */ h("$ZodUnion", (t, e) => {
  A.init(t, e), k(t._zod, "optin", () => e.options.some((r) => r._zod.optin === "optional") ? "optional" : void 0), k(t._zod, "optout", () => e.options.some((r) => r._zod.optout === "optional") ? "optional" : void 0), k(t._zod, "values", () => {
    if (e.options.every((r) => r._zod.values))
      return new Set(e.options.flatMap((r) => Array.from(r._zod.values)));
  }), k(t._zod, "pattern", () => {
    if (e.options.every((r) => r._zod.pattern)) {
      const r = e.options.map((i) => i._zod.pattern);
      return new RegExp(`^(${r.map((i) => Dt(i.source)).join("|")})$`);
    }
  });
  const n = e.options.length === 1, o = e.options[0]._zod.run;
  t._zod.parse = (r, i) => {
    if (n)
      return o(r, i);
    let s = !1;
    const a = [];
    for (const c of e.options) {
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
    return s ? Promise.all(a).then((c) => $n(c, r, t, i)) : $n(a, r, t, i);
  };
}), Hs = /* @__PURE__ */ h("$ZodIntersection", (t, e) => {
  A.init(t, e), t._zod.parse = (n, o) => {
    const r = n.value, i = e.left._zod.run({ value: r, issues: [] }, o), s = e.right._zod.run({ value: r, issues: [] }, o);
    return i instanceof Promise || s instanceof Promise ? Promise.all([i, s]).then(([c, u]) => kn(n, c, u)) : kn(n, i, s);
  };
});
function Rt(t, e) {
  if (t === e)
    return { valid: !0, data: t };
  if (t instanceof Date && e instanceof Date && +t == +e)
    return { valid: !0, data: t };
  if (we(t) && we(e)) {
    const n = Object.keys(e), o = Object.keys(t).filter((i) => n.indexOf(i) !== -1), r = { ...t, ...e };
    for (const i of o) {
      const s = Rt(t[i], e[i]);
      if (!s.valid)
        return {
          valid: !1,
          mergeErrorPath: [i, ...s.mergeErrorPath]
        };
      r[i] = s.data;
    }
    return { valid: !0, data: r };
  }
  if (Array.isArray(t) && Array.isArray(e)) {
    if (t.length !== e.length)
      return { valid: !1, mergeErrorPath: [] };
    const n = [];
    for (let o = 0; o < t.length; o++) {
      const r = t[o], i = e[o], s = Rt(r, i);
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
function kn(t, e, n) {
  const o = /* @__PURE__ */ new Map();
  let r;
  for (const a of e.issues)
    if (a.code === "unrecognized_keys") {
      r ?? (r = a);
      for (const c of a.keys)
        o.has(c) || o.set(c, {}), o.get(c).l = !0;
    } else
      t.issues.push(a);
  for (const a of n.issues)
    if (a.code === "unrecognized_keys")
      for (const c of a.keys)
        o.has(c) || o.set(c, {}), o.get(c).r = !0;
    else
      t.issues.push(a);
  const i = [...o].filter(([, a]) => a.l && a.r).map(([a]) => a);
  if (i.length && r && t.issues.push({ ...r, keys: i }), _e(t))
    return t;
  const s = Rt(e.value, n.value);
  if (!s.valid)
    throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(s.mergeErrorPath)}`);
  return t.value = s.data, t;
}
const Js = /* @__PURE__ */ h("$ZodRecord", (t, e) => {
  A.init(t, e), t._zod.parse = (n, o) => {
    const r = n.value;
    if (!we(r))
      return n.issues.push({
        expected: "record",
        code: "invalid_type",
        input: r,
        inst: t
      }), n;
    const i = [], s = e.keyType._zod.values;
    if (s) {
      n.value = {};
      const a = /* @__PURE__ */ new Set();
      for (const u of s)
        if (typeof u == "string" || typeof u == "number" || typeof u == "symbol") {
          a.add(typeof u == "number" ? u.toString() : u);
          const l = e.valueType._zod.run({ value: r[u], issues: [] }, o);
          l instanceof Promise ? i.push(l.then((d) => {
            d.issues.length && n.issues.push(...ge(u, d.issues)), n.value[u] = d.value;
          })) : (l.issues.length && n.issues.push(...ge(u, l.issues)), n.value[u] = l.value);
        }
      let c;
      for (const u in r)
        a.has(u) || (c = c ?? [], c.push(u));
      c && c.length > 0 && n.issues.push({
        code: "unrecognized_keys",
        input: r,
        inst: t,
        keys: c
      });
    } else {
      n.value = {};
      for (const a of Reflect.ownKeys(r)) {
        if (a === "__proto__")
          continue;
        let c = e.keyType._zod.run({ value: a, issues: [] }, o);
        if (c instanceof Promise)
          throw new Error("Async schemas not supported in object keys currently");
        if (typeof a == "string" && yo.test(a) && c.issues.length) {
          const d = e.keyType._zod.run({ value: Number(a), issues: [] }, o);
          if (d instanceof Promise)
            throw new Error("Async schemas not supported in object keys currently");
          d.issues.length === 0 && (c = d);
        }
        if (c.issues.length) {
          e.mode === "loose" ? n.value[a] = r[a] : n.issues.push({
            code: "invalid_key",
            origin: "record",
            issues: c.issues.map((d) => te(d, o, ee())),
            input: a,
            path: [a],
            inst: t
          });
          continue;
        }
        const l = e.valueType._zod.run({ value: r[a], issues: [] }, o);
        l instanceof Promise ? i.push(l.then((d) => {
          d.issues.length && n.issues.push(...ge(a, d.issues)), n.value[c.value] = d.value;
        })) : (l.issues.length && n.issues.push(...ge(a, l.issues)), n.value[c.value] = l.value);
      }
    }
    return i.length ? Promise.all(i).then(() => n) : n;
  };
}), Ws = /* @__PURE__ */ h("$ZodEnum", (t, e) => {
  A.init(t, e);
  const n = lo(e.entries), o = new Set(n);
  t._zod.values = o, t._zod.pattern = new RegExp(`^(${n.filter((r) => ri.has(typeof r)).map((r) => typeof r == "string" ? ct(r) : r.toString()).join("|")})$`), t._zod.parse = (r, i) => {
    const s = r.value;
    return o.has(s) || r.issues.push({
      code: "invalid_value",
      values: n,
      input: s,
      inst: t
    }), r;
  };
}), Vs = /* @__PURE__ */ h("$ZodTransform", (t, e) => {
  A.init(t, e), t._zod.parse = (n, o) => {
    if (o.direction === "backward")
      throw new co(t.constructor.name);
    const r = e.transform(n.value, n);
    if (o.async)
      return (r instanceof Promise ? r : Promise.resolve(r)).then((s) => (n.value = s, n));
    if (r instanceof Promise)
      throw new be();
    return n.value = r, n;
  };
});
function Sn(t, e) {
  return t.issues.length && e === void 0 ? { issues: [], value: void 0 } : t;
}
const Ro = /* @__PURE__ */ h("$ZodOptional", (t, e) => {
  A.init(t, e), t._zod.optin = "optional", t._zod.optout = "optional", k(t._zod, "values", () => e.innerType._zod.values ? /* @__PURE__ */ new Set([...e.innerType._zod.values, void 0]) : void 0), k(t._zod, "pattern", () => {
    const n = e.innerType._zod.pattern;
    return n ? new RegExp(`^(${Dt(n.source)})?$`) : void 0;
  }), t._zod.parse = (n, o) => {
    if (e.innerType._zod.optin === "optional") {
      const r = e.innerType._zod.run(n, o);
      return r instanceof Promise ? r.then((i) => Sn(i, n.value)) : Sn(r, n.value);
    }
    return n.value === void 0 ? n : e.innerType._zod.run(n, o);
  };
}), qs = /* @__PURE__ */ h("$ZodExactOptional", (t, e) => {
  Ro.init(t, e), k(t._zod, "values", () => e.innerType._zod.values), k(t._zod, "pattern", () => e.innerType._zod.pattern), t._zod.parse = (n, o) => e.innerType._zod.run(n, o);
}), Xs = /* @__PURE__ */ h("$ZodNullable", (t, e) => {
  A.init(t, e), k(t._zod, "optin", () => e.innerType._zod.optin), k(t._zod, "optout", () => e.innerType._zod.optout), k(t._zod, "pattern", () => {
    const n = e.innerType._zod.pattern;
    return n ? new RegExp(`^(${Dt(n.source)}|null)$`) : void 0;
  }), k(t._zod, "values", () => e.innerType._zod.values ? /* @__PURE__ */ new Set([...e.innerType._zod.values, null]) : void 0), t._zod.parse = (n, o) => n.value === null ? n : e.innerType._zod.run(n, o);
}), Ys = /* @__PURE__ */ h("$ZodDefault", (t, e) => {
  A.init(t, e), t._zod.optin = "optional", k(t._zod, "values", () => e.innerType._zod.values), t._zod.parse = (n, o) => {
    if (o.direction === "backward")
      return e.innerType._zod.run(n, o);
    if (n.value === void 0)
      return n.value = e.defaultValue, n;
    const r = e.innerType._zod.run(n, o);
    return r instanceof Promise ? r.then((i) => zn(i, e)) : zn(r, e);
  };
});
function zn(t, e) {
  return t.value === void 0 && (t.value = e.defaultValue), t;
}
const Ks = /* @__PURE__ */ h("$ZodPrefault", (t, e) => {
  A.init(t, e), t._zod.optin = "optional", k(t._zod, "values", () => e.innerType._zod.values), t._zod.parse = (n, o) => (o.direction === "backward" || n.value === void 0 && (n.value = e.defaultValue), e.innerType._zod.run(n, o));
}), Gs = /* @__PURE__ */ h("$ZodNonOptional", (t, e) => {
  A.init(t, e), k(t._zod, "values", () => {
    const n = e.innerType._zod.values;
    return n ? new Set([...n].filter((o) => o !== void 0)) : void 0;
  }), t._zod.parse = (n, o) => {
    const r = e.innerType._zod.run(n, o);
    return r instanceof Promise ? r.then((i) => En(i, t)) : En(r, t);
  };
});
function En(t, e) {
  return !t.issues.length && t.value === void 0 && t.issues.push({
    code: "invalid_type",
    expected: "nonoptional",
    input: t.value,
    inst: e
  }), t;
}
const Qs = /* @__PURE__ */ h("$ZodCatch", (t, e) => {
  A.init(t, e), k(t._zod, "optin", () => e.innerType._zod.optin), k(t._zod, "optout", () => e.innerType._zod.optout), k(t._zod, "values", () => e.innerType._zod.values), t._zod.parse = (n, o) => {
    if (o.direction === "backward")
      return e.innerType._zod.run(n, o);
    const r = e.innerType._zod.run(n, o);
    return r instanceof Promise ? r.then((i) => (n.value = i.value, i.issues.length && (n.value = e.catchValue({
      ...n,
      error: {
        issues: i.issues.map((s) => te(s, o, ee()))
      },
      input: n.value
    }), n.issues = []), n)) : (n.value = r.value, r.issues.length && (n.value = e.catchValue({
      ...n,
      error: {
        issues: r.issues.map((i) => te(i, o, ee()))
      },
      input: n.value
    }), n.issues = []), n);
  };
}), ea = /* @__PURE__ */ h("$ZodPipe", (t, e) => {
  A.init(t, e), k(t._zod, "values", () => e.in._zod.values), k(t._zod, "optin", () => e.in._zod.optin), k(t._zod, "optout", () => e.out._zod.optout), k(t._zod, "propValues", () => e.in._zod.propValues), t._zod.parse = (n, o) => {
    if (o.direction === "backward") {
      const i = e.out._zod.run(n, o);
      return i instanceof Promise ? i.then((s) => Be(s, e.in, o)) : Be(i, e.in, o);
    }
    const r = e.in._zod.run(n, o);
    return r instanceof Promise ? r.then((i) => Be(i, e.out, o)) : Be(r, e.out, o);
  };
});
function Be(t, e, n) {
  return t.issues.length ? (t.aborted = !0, t) : e._zod.run({ value: t.value, issues: t.issues }, n);
}
const ta = /* @__PURE__ */ h("$ZodReadonly", (t, e) => {
  A.init(t, e), k(t._zod, "propValues", () => e.innerType._zod.propValues), k(t._zod, "values", () => e.innerType._zod.values), k(t._zod, "optin", () => {
    var n, o;
    return (o = (n = e.innerType) == null ? void 0 : n._zod) == null ? void 0 : o.optin;
  }), k(t._zod, "optout", () => {
    var n, o;
    return (o = (n = e.innerType) == null ? void 0 : n._zod) == null ? void 0 : o.optout;
  }), t._zod.parse = (n, o) => {
    if (o.direction === "backward")
      return e.innerType._zod.run(n, o);
    const r = e.innerType._zod.run(n, o);
    return r instanceof Promise ? r.then(xn) : xn(r);
  };
});
function xn(t) {
  return t.value = Object.freeze(t.value), t;
}
const na = /* @__PURE__ */ h("$ZodCustom", (t, e) => {
  H.init(t, e), A.init(t, e), t._zod.parse = (n, o) => n, t._zod.check = (n) => {
    const o = n.value, r = e.fn(o);
    if (r instanceof Promise)
      return r.then((i) => Rn(i, n, o, t));
    Rn(r, n, o, t);
  };
});
function Rn(t, e, n, o) {
  if (!t) {
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
    o._zod.def.params && (r.params = o._zod.def.params), e.issues.push(Oe(r));
  }
}
var An;
class oa {
  constructor() {
    this._map = /* @__PURE__ */ new WeakMap(), this._idmap = /* @__PURE__ */ new Map();
  }
  add(e, ...n) {
    const o = n[0];
    return this._map.set(e, o), o && typeof o == "object" && "id" in o && this._idmap.set(o.id, e), this;
  }
  clear() {
    return this._map = /* @__PURE__ */ new WeakMap(), this._idmap = /* @__PURE__ */ new Map(), this;
  }
  remove(e) {
    const n = this._map.get(e);
    return n && typeof n == "object" && "id" in n && this._idmap.delete(n.id), this._map.delete(e), this;
  }
  get(e) {
    const n = e._zod.parent;
    if (n) {
      const o = { ...this.get(n) ?? {} };
      delete o.id;
      const r = { ...o, ...this._map.get(e) };
      return Object.keys(r).length ? r : void 0;
    }
    return this._map.get(e);
  }
  has(e) {
    return this._map.has(e);
  }
}
function ra() {
  return new oa();
}
(An = globalThis).__zod_globalRegistry ?? (An.__zod_globalRegistry = ra());
const Ae = globalThis.__zod_globalRegistry;
// @__NO_SIDE_EFFECTS__
function ia(t, e) {
  return new t({
    type: "string",
    ...b(e)
  });
}
// @__NO_SIDE_EFFECTS__
function sa(t, e) {
  return new t({
    type: "string",
    format: "email",
    check: "string_format",
    abort: !1,
    ...b(e)
  });
}
// @__NO_SIDE_EFFECTS__
function Cn(t, e) {
  return new t({
    type: "string",
    format: "guid",
    check: "string_format",
    abort: !1,
    ...b(e)
  });
}
// @__NO_SIDE_EFFECTS__
function aa(t, e) {
  return new t({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    ...b(e)
  });
}
// @__NO_SIDE_EFFECTS__
function ca(t, e) {
  return new t({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v4",
    ...b(e)
  });
}
// @__NO_SIDE_EFFECTS__
function ua(t, e) {
  return new t({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v6",
    ...b(e)
  });
}
// @__NO_SIDE_EFFECTS__
function la(t, e) {
  return new t({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v7",
    ...b(e)
  });
}
// @__NO_SIDE_EFFECTS__
function da(t, e) {
  return new t({
    type: "string",
    format: "url",
    check: "string_format",
    abort: !1,
    ...b(e)
  });
}
// @__NO_SIDE_EFFECTS__
function ha(t, e) {
  return new t({
    type: "string",
    format: "emoji",
    check: "string_format",
    abort: !1,
    ...b(e)
  });
}
// @__NO_SIDE_EFFECTS__
function pa(t, e) {
  return new t({
    type: "string",
    format: "nanoid",
    check: "string_format",
    abort: !1,
    ...b(e)
  });
}
// @__NO_SIDE_EFFECTS__
function fa(t, e) {
  return new t({
    type: "string",
    format: "cuid",
    check: "string_format",
    abort: !1,
    ...b(e)
  });
}
// @__NO_SIDE_EFFECTS__
function ma(t, e) {
  return new t({
    type: "string",
    format: "cuid2",
    check: "string_format",
    abort: !1,
    ...b(e)
  });
}
// @__NO_SIDE_EFFECTS__
function _a(t, e) {
  return new t({
    type: "string",
    format: "ulid",
    check: "string_format",
    abort: !1,
    ...b(e)
  });
}
// @__NO_SIDE_EFFECTS__
function ga(t, e) {
  return new t({
    type: "string",
    format: "xid",
    check: "string_format",
    abort: !1,
    ...b(e)
  });
}
// @__NO_SIDE_EFFECTS__
function ba(t, e) {
  return new t({
    type: "string",
    format: "ksuid",
    check: "string_format",
    abort: !1,
    ...b(e)
  });
}
// @__NO_SIDE_EFFECTS__
function va(t, e) {
  return new t({
    type: "string",
    format: "ipv4",
    check: "string_format",
    abort: !1,
    ...b(e)
  });
}
// @__NO_SIDE_EFFECTS__
function ya(t, e) {
  return new t({
    type: "string",
    format: "ipv6",
    check: "string_format",
    abort: !1,
    ...b(e)
  });
}
// @__NO_SIDE_EFFECTS__
function wa(t, e) {
  return new t({
    type: "string",
    format: "cidrv4",
    check: "string_format",
    abort: !1,
    ...b(e)
  });
}
// @__NO_SIDE_EFFECTS__
function $a(t, e) {
  return new t({
    type: "string",
    format: "cidrv6",
    check: "string_format",
    abort: !1,
    ...b(e)
  });
}
// @__NO_SIDE_EFFECTS__
function ka(t, e) {
  return new t({
    type: "string",
    format: "base64",
    check: "string_format",
    abort: !1,
    ...b(e)
  });
}
// @__NO_SIDE_EFFECTS__
function Sa(t, e) {
  return new t({
    type: "string",
    format: "base64url",
    check: "string_format",
    abort: !1,
    ...b(e)
  });
}
// @__NO_SIDE_EFFECTS__
function za(t, e) {
  return new t({
    type: "string",
    format: "e164",
    check: "string_format",
    abort: !1,
    ...b(e)
  });
}
// @__NO_SIDE_EFFECTS__
function Ea(t, e) {
  return new t({
    type: "string",
    format: "jwt",
    check: "string_format",
    abort: !1,
    ...b(e)
  });
}
// @__NO_SIDE_EFFECTS__
function xa(t, e) {
  return new t({
    type: "string",
    format: "datetime",
    check: "string_format",
    offset: !1,
    local: !1,
    precision: null,
    ...b(e)
  });
}
// @__NO_SIDE_EFFECTS__
function Ra(t, e) {
  return new t({
    type: "string",
    format: "date",
    check: "string_format",
    ...b(e)
  });
}
// @__NO_SIDE_EFFECTS__
function Aa(t, e) {
  return new t({
    type: "string",
    format: "time",
    check: "string_format",
    precision: null,
    ...b(e)
  });
}
// @__NO_SIDE_EFFECTS__
function Ca(t, e) {
  return new t({
    type: "string",
    format: "duration",
    check: "string_format",
    ...b(e)
  });
}
// @__NO_SIDE_EFFECTS__
function Za(t, e) {
  return new t({
    type: "number",
    checks: [],
    ...b(e)
  });
}
// @__NO_SIDE_EFFECTS__
function Ia(t, e) {
  return new t({
    type: "number",
    check: "number_format",
    abort: !1,
    format: "safeint",
    ...b(e)
  });
}
// @__NO_SIDE_EFFECTS__
function Ta(t, e) {
  return new t({
    type: "boolean",
    ...b(e)
  });
}
// @__NO_SIDE_EFFECTS__
function Na(t) {
  return new t({
    type: "unknown"
  });
}
// @__NO_SIDE_EFFECTS__
function Pa(t, e) {
  return new t({
    type: "never",
    ...b(e)
  });
}
// @__NO_SIDE_EFFECTS__
function Zn(t, e) {
  return new $o({
    check: "less_than",
    ...b(e),
    value: t,
    inclusive: !1
  });
}
// @__NO_SIDE_EFFECTS__
function bt(t, e) {
  return new $o({
    check: "less_than",
    ...b(e),
    value: t,
    inclusive: !0
  });
}
// @__NO_SIDE_EFFECTS__
function In(t, e) {
  return new ko({
    check: "greater_than",
    ...b(e),
    value: t,
    inclusive: !1
  });
}
// @__NO_SIDE_EFFECTS__
function vt(t, e) {
  return new ko({
    check: "greater_than",
    ...b(e),
    value: t,
    inclusive: !0
  });
}
// @__NO_SIDE_EFFECTS__
function Tn(t, e) {
  return new Ki({
    check: "multiple_of",
    ...b(e),
    value: t
  });
}
// @__NO_SIDE_EFFECTS__
function Ao(t, e) {
  return new Qi({
    check: "max_length",
    ...b(e),
    maximum: t
  });
}
// @__NO_SIDE_EFFECTS__
function tt(t, e) {
  return new es({
    check: "min_length",
    ...b(e),
    minimum: t
  });
}
// @__NO_SIDE_EFFECTS__
function Co(t, e) {
  return new ts({
    check: "length_equals",
    ...b(e),
    length: t
  });
}
// @__NO_SIDE_EFFECTS__
function Oa(t, e) {
  return new ns({
    check: "string_format",
    format: "regex",
    ...b(e),
    pattern: t
  });
}
// @__NO_SIDE_EFFECTS__
function ja(t) {
  return new os({
    check: "string_format",
    format: "lowercase",
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Da(t) {
  return new rs({
    check: "string_format",
    format: "uppercase",
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function La(t, e) {
  return new is({
    check: "string_format",
    format: "includes",
    ...b(e),
    includes: t
  });
}
// @__NO_SIDE_EFFECTS__
function Ua(t, e) {
  return new ss({
    check: "string_format",
    format: "starts_with",
    ...b(e),
    prefix: t
  });
}
// @__NO_SIDE_EFFECTS__
function Ma(t, e) {
  return new as({
    check: "string_format",
    format: "ends_with",
    ...b(e),
    suffix: t
  });
}
// @__NO_SIDE_EFFECTS__
function $e(t) {
  return new cs({
    check: "overwrite",
    tx: t
  });
}
// @__NO_SIDE_EFFECTS__
function Fa(t) {
  return /* @__PURE__ */ $e((e) => e.normalize(t));
}
// @__NO_SIDE_EFFECTS__
function Ba() {
  return /* @__PURE__ */ $e((t) => t.trim());
}
// @__NO_SIDE_EFFECTS__
function Ha() {
  return /* @__PURE__ */ $e((t) => t.toLowerCase());
}
// @__NO_SIDE_EFFECTS__
function Ja() {
  return /* @__PURE__ */ $e((t) => t.toUpperCase());
}
// @__NO_SIDE_EFFECTS__
function Wa() {
  return /* @__PURE__ */ $e((t) => ni(t));
}
// @__NO_SIDE_EFFECTS__
function Va(t, e, n) {
  return new t({
    type: "array",
    element: e,
    // get element() {
    //   return element;
    // },
    ...b(n)
  });
}
// @__NO_SIDE_EFFECTS__
function qa(t, e, n) {
  return new t({
    type: "custom",
    check: "custom",
    fn: e,
    ...b(n)
  });
}
// @__NO_SIDE_EFFECTS__
function Xa(t) {
  const e = /* @__PURE__ */ Ya((n) => (n.addIssue = (o) => {
    if (typeof o == "string")
      n.issues.push(Oe(o, n.value, e._zod.def));
    else {
      const r = o;
      r.fatal && (r.continue = !1), r.code ?? (r.code = "custom"), r.input ?? (r.input = n.value), r.inst ?? (r.inst = e), r.continue ?? (r.continue = !e._zod.def.abort), n.issues.push(Oe(r));
    }
  }, t(n.value, n)));
  return e;
}
// @__NO_SIDE_EFFECTS__
function Ya(t, e) {
  const n = new H({
    check: "custom",
    ...b(e)
  });
  return n._zod.check = t, n;
}
function Zo(t) {
  let e = (t == null ? void 0 : t.target) ?? "draft-2020-12";
  return e === "draft-4" && (e = "draft-04"), e === "draft-7" && (e = "draft-07"), {
    processors: t.processors ?? {},
    metadataRegistry: (t == null ? void 0 : t.metadata) ?? Ae,
    target: e,
    unrepresentable: (t == null ? void 0 : t.unrepresentable) ?? "throw",
    override: (t == null ? void 0 : t.override) ?? (() => {
    }),
    io: (t == null ? void 0 : t.io) ?? "output",
    counter: 0,
    seen: /* @__PURE__ */ new Map(),
    cycles: (t == null ? void 0 : t.cycles) ?? "ref",
    reused: (t == null ? void 0 : t.reused) ?? "inline",
    external: (t == null ? void 0 : t.external) ?? void 0
  };
}
function P(t, e, n = { path: [], schemaPath: [] }) {
  var l, d;
  var o;
  const r = t._zod.def, i = e.seen.get(t);
  if (i)
    return i.count++, n.schemaPath.includes(t) && (i.cycle = n.path), i.schema;
  const s = { schema: {}, count: 1, cycle: void 0, path: n.path };
  e.seen.set(t, s);
  const a = (d = (l = t._zod).toJSONSchema) == null ? void 0 : d.call(l);
  if (a)
    s.schema = a;
  else {
    const m = {
      ...n,
      schemaPath: [...n.schemaPath, t],
      path: n.path
    };
    if (t._zod.processJSONSchema)
      t._zod.processJSONSchema(e, s.schema, m);
    else {
      const _ = s.schema, w = e.processors[r.type];
      if (!w)
        throw new Error(`[toJSONSchema]: Non-representable type encountered: ${r.type}`);
      w(t, e, _, m);
    }
    const f = t._zod.parent;
    f && (s.ref || (s.ref = f), P(f, e, m), e.seen.get(f).isParent = !0);
  }
  const c = e.metadataRegistry.get(t);
  return c && Object.assign(s.schema, c), e.io === "input" && U(t) && (delete s.schema.examples, delete s.schema.default), e.io === "input" && s.schema._prefault && ((o = s.schema).default ?? (o.default = s.schema._prefault)), delete s.schema._prefault, e.seen.get(t).schema;
}
function Io(t, e) {
  var s, a, c, u;
  const n = t.seen.get(e);
  if (!n)
    throw new Error("Unprocessed schema. This is a bug in Zod.");
  const o = /* @__PURE__ */ new Map();
  for (const l of t.seen.entries()) {
    const d = (s = t.metadataRegistry.get(l[0])) == null ? void 0 : s.id;
    if (d) {
      const m = o.get(d);
      if (m && m !== l[0])
        throw new Error(`Duplicate schema id "${d}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`);
      o.set(d, l[0]);
    }
  }
  const r = (l) => {
    var w;
    const d = t.target === "draft-2020-12" ? "$defs" : "definitions";
    if (t.external) {
      const z = (w = t.external.registry.get(l[0])) == null ? void 0 : w.id, Y = t.external.uri ?? ((O) => O);
      if (z)
        return { ref: Y(z) };
      const E = l[1].defId ?? l[1].schema.id ?? `schema${t.counter++}`;
      return l[1].defId = E, { defId: E, ref: `${Y("__shared")}#/${d}/${E}` };
    }
    if (l[1] === n)
      return { ref: "#" };
    const f = `#/${d}/`, _ = l[1].schema.id ?? `__schema${t.counter++}`;
    return { defId: _, ref: f + _ };
  }, i = (l) => {
    if (l[1].schema.$ref)
      return;
    const d = l[1], { ref: m, defId: f } = r(l);
    d.def = { ...d.schema }, f && (d.defId = f);
    const _ = d.schema;
    for (const w in _)
      delete _[w];
    _.$ref = m;
  };
  if (t.cycles === "throw")
    for (const l of t.seen.entries()) {
      const d = l[1];
      if (d.cycle)
        throw new Error(`Cycle detected: #/${(a = d.cycle) == null ? void 0 : a.join("/")}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`);
    }
  for (const l of t.seen.entries()) {
    const d = l[1];
    if (e === l[0]) {
      i(l);
      continue;
    }
    if (t.external) {
      const f = (c = t.external.registry.get(l[0])) == null ? void 0 : c.id;
      if (e !== l[0] && f) {
        i(l);
        continue;
      }
    }
    if ((u = t.metadataRegistry.get(l[0])) == null ? void 0 : u.id) {
      i(l);
      continue;
    }
    if (d.cycle) {
      i(l);
      continue;
    }
    if (d.count > 1 && t.reused === "ref") {
      i(l);
      continue;
    }
  }
}
function To(t, e) {
  var s, a, c;
  const n = t.seen.get(e);
  if (!n)
    throw new Error("Unprocessed schema. This is a bug in Zod.");
  const o = (u) => {
    const l = t.seen.get(u);
    if (l.ref === null)
      return;
    const d = l.def ?? l.schema, m = { ...d }, f = l.ref;
    if (l.ref = null, f) {
      o(f);
      const w = t.seen.get(f), z = w.schema;
      if (z.$ref && (t.target === "draft-07" || t.target === "draft-04" || t.target === "openapi-3.0") ? (d.allOf = d.allOf ?? [], d.allOf.push(z)) : Object.assign(d, z), Object.assign(d, m), u._zod.parent === f)
        for (const E in d)
          E === "$ref" || E === "allOf" || E in m || delete d[E];
      if (z.$ref && w.def)
        for (const E in d)
          E === "$ref" || E === "allOf" || E in w.def && JSON.stringify(d[E]) === JSON.stringify(w.def[E]) && delete d[E];
    }
    const _ = u._zod.parent;
    if (_ && _ !== f) {
      o(_);
      const w = t.seen.get(_);
      if (w != null && w.schema.$ref && (d.$ref = w.schema.$ref, w.def))
        for (const z in d)
          z === "$ref" || z === "allOf" || z in w.def && JSON.stringify(d[z]) === JSON.stringify(w.def[z]) && delete d[z];
    }
    t.override({
      zodSchema: u,
      jsonSchema: d,
      path: l.path ?? []
    });
  };
  for (const u of [...t.seen.entries()].reverse())
    o(u[0]);
  const r = {};
  if (t.target === "draft-2020-12" ? r.$schema = "https://json-schema.org/draft/2020-12/schema" : t.target === "draft-07" ? r.$schema = "http://json-schema.org/draft-07/schema#" : t.target === "draft-04" ? r.$schema = "http://json-schema.org/draft-04/schema#" : t.target, (s = t.external) != null && s.uri) {
    const u = (a = t.external.registry.get(e)) == null ? void 0 : a.id;
    if (!u)
      throw new Error("Schema is missing an `id` property");
    r.$id = t.external.uri(u);
  }
  Object.assign(r, n.def ?? n.schema);
  const i = ((c = t.external) == null ? void 0 : c.defs) ?? {};
  for (const u of t.seen.entries()) {
    const l = u[1];
    l.def && l.defId && (i[l.defId] = l.def);
  }
  t.external || Object.keys(i).length > 0 && (t.target === "draft-2020-12" ? r.$defs = i : r.definitions = i);
  try {
    const u = JSON.parse(JSON.stringify(r));
    return Object.defineProperty(u, "~standard", {
      value: {
        ...e["~standard"],
        jsonSchema: {
          input: nt(e, "input", t.processors),
          output: nt(e, "output", t.processors)
        }
      },
      enumerable: !1,
      writable: !1
    }), u;
  } catch {
    throw new Error("Error converting schema to JSON.");
  }
}
function U(t, e) {
  const n = e ?? { seen: /* @__PURE__ */ new Set() };
  if (n.seen.has(t))
    return !1;
  n.seen.add(t);
  const o = t._zod.def;
  if (o.type === "transform")
    return !0;
  if (o.type === "array")
    return U(o.element, n);
  if (o.type === "set")
    return U(o.valueType, n);
  if (o.type === "lazy")
    return U(o.getter(), n);
  if (o.type === "promise" || o.type === "optional" || o.type === "nonoptional" || o.type === "nullable" || o.type === "readonly" || o.type === "default" || o.type === "prefault")
    return U(o.innerType, n);
  if (o.type === "intersection")
    return U(o.left, n) || U(o.right, n);
  if (o.type === "record" || o.type === "map")
    return U(o.keyType, n) || U(o.valueType, n);
  if (o.type === "pipe")
    return U(o.in, n) || U(o.out, n);
  if (o.type === "object") {
    for (const r in o.shape)
      if (U(o.shape[r], n))
        return !0;
    return !1;
  }
  if (o.type === "union") {
    for (const r of o.options)
      if (U(r, n))
        return !0;
    return !1;
  }
  if (o.type === "tuple") {
    for (const r of o.items)
      if (U(r, n))
        return !0;
    return !!(o.rest && U(o.rest, n));
  }
  return !1;
}
const Ka = (t, e = {}) => (n) => {
  const o = Zo({ ...n, processors: e });
  return P(t, o), Io(o, t), To(o, t);
}, nt = (t, e, n = {}) => (o) => {
  const { libraryOptions: r, target: i } = o ?? {}, s = Zo({ ...r ?? {}, target: i, io: e, processors: n });
  return P(t, s), Io(s, t), To(s, t);
}, Ga = {
  guid: "uuid",
  url: "uri",
  datetime: "date-time",
  json_string: "json-string",
  regex: ""
  // do not set
}, Qa = (t, e, n, o) => {
  const r = n;
  r.type = "string";
  const { minimum: i, maximum: s, format: a, patterns: c, contentEncoding: u } = t._zod.bag;
  if (typeof i == "number" && (r.minLength = i), typeof s == "number" && (r.maxLength = s), a && (r.format = Ga[a] ?? a, r.format === "" && delete r.format, a === "time" && delete r.format), u && (r.contentEncoding = u), c && c.size > 0) {
    const l = [...c];
    l.length === 1 ? r.pattern = l[0].source : l.length > 1 && (r.allOf = [
      ...l.map((d) => ({
        ...e.target === "draft-07" || e.target === "draft-04" || e.target === "openapi-3.0" ? { type: "string" } : {},
        pattern: d.source
      }))
    ]);
  }
}, ec = (t, e, n, o) => {
  const r = n, { minimum: i, maximum: s, format: a, multipleOf: c, exclusiveMaximum: u, exclusiveMinimum: l } = t._zod.bag;
  typeof a == "string" && a.includes("int") ? r.type = "integer" : r.type = "number", typeof l == "number" && (e.target === "draft-04" || e.target === "openapi-3.0" ? (r.minimum = l, r.exclusiveMinimum = !0) : r.exclusiveMinimum = l), typeof i == "number" && (r.minimum = i, typeof l == "number" && e.target !== "draft-04" && (l >= i ? delete r.minimum : delete r.exclusiveMinimum)), typeof u == "number" && (e.target === "draft-04" || e.target === "openapi-3.0" ? (r.maximum = u, r.exclusiveMaximum = !0) : r.exclusiveMaximum = u), typeof s == "number" && (r.maximum = s, typeof u == "number" && e.target !== "draft-04" && (u <= s ? delete r.maximum : delete r.exclusiveMaximum)), typeof c == "number" && (r.multipleOf = c);
}, tc = (t, e, n, o) => {
  n.type = "boolean";
}, nc = (t, e, n, o) => {
  n.not = {};
}, oc = (t, e, n, o) => {
}, rc = (t, e, n, o) => {
  const r = t._zod.def, i = lo(r.entries);
  i.every((s) => typeof s == "number") && (n.type = "number"), i.every((s) => typeof s == "string") && (n.type = "string"), n.enum = i;
}, ic = (t, e, n, o) => {
  if (e.unrepresentable === "throw")
    throw new Error("Custom types cannot be represented in JSON Schema");
}, sc = (t, e, n, o) => {
  if (e.unrepresentable === "throw")
    throw new Error("Transforms cannot be represented in JSON Schema");
}, ac = (t, e, n, o) => {
  const r = n, i = t._zod.def, { minimum: s, maximum: a } = t._zod.bag;
  typeof s == "number" && (r.minItems = s), typeof a == "number" && (r.maxItems = a), r.type = "array", r.items = P(i.element, e, { ...o, path: [...o.path, "items"] });
}, cc = (t, e, n, o) => {
  var u;
  const r = n, i = t._zod.def;
  r.type = "object", r.properties = {};
  const s = i.shape;
  for (const l in s)
    r.properties[l] = P(s[l], e, {
      ...o,
      path: [...o.path, "properties", l]
    });
  const a = new Set(Object.keys(s)), c = new Set([...a].filter((l) => {
    const d = i.shape[l]._zod;
    return e.io === "input" ? d.optin === void 0 : d.optout === void 0;
  }));
  c.size > 0 && (r.required = Array.from(c)), ((u = i.catchall) == null ? void 0 : u._zod.def.type) === "never" ? r.additionalProperties = !1 : i.catchall ? i.catchall && (r.additionalProperties = P(i.catchall, e, {
    ...o,
    path: [...o.path, "additionalProperties"]
  })) : e.io === "output" && (r.additionalProperties = !1);
}, uc = (t, e, n, o) => {
  const r = t._zod.def, i = r.inclusive === !1, s = r.options.map((a, c) => P(a, e, {
    ...o,
    path: [...o.path, i ? "oneOf" : "anyOf", c]
  }));
  i ? n.oneOf = s : n.anyOf = s;
}, lc = (t, e, n, o) => {
  const r = t._zod.def, i = P(r.left, e, {
    ...o,
    path: [...o.path, "allOf", 0]
  }), s = P(r.right, e, {
    ...o,
    path: [...o.path, "allOf", 1]
  }), a = (u) => "allOf" in u && Object.keys(u).length === 1, c = [
    ...a(i) ? i.allOf : [i],
    ...a(s) ? s.allOf : [s]
  ];
  n.allOf = c;
}, dc = (t, e, n, o) => {
  const r = n, i = t._zod.def;
  r.type = "object";
  const s = i.keyType, a = s._zod.bag, c = a == null ? void 0 : a.patterns;
  if (i.mode === "loose" && c && c.size > 0) {
    const l = P(i.valueType, e, {
      ...o,
      path: [...o.path, "patternProperties", "*"]
    });
    r.patternProperties = {};
    for (const d of c)
      r.patternProperties[d.source] = l;
  } else
    (e.target === "draft-07" || e.target === "draft-2020-12") && (r.propertyNames = P(i.keyType, e, {
      ...o,
      path: [...o.path, "propertyNames"]
    })), r.additionalProperties = P(i.valueType, e, {
      ...o,
      path: [...o.path, "additionalProperties"]
    });
  const u = s._zod.values;
  if (u) {
    const l = [...u].filter((d) => typeof d == "string" || typeof d == "number");
    l.length > 0 && (r.required = l);
  }
}, hc = (t, e, n, o) => {
  const r = t._zod.def, i = P(r.innerType, e, o), s = e.seen.get(t);
  e.target === "openapi-3.0" ? (s.ref = r.innerType, n.nullable = !0) : n.anyOf = [i, { type: "null" }];
}, pc = (t, e, n, o) => {
  const r = t._zod.def;
  P(r.innerType, e, o);
  const i = e.seen.get(t);
  i.ref = r.innerType;
}, fc = (t, e, n, o) => {
  const r = t._zod.def;
  P(r.innerType, e, o);
  const i = e.seen.get(t);
  i.ref = r.innerType, n.default = JSON.parse(JSON.stringify(r.defaultValue));
}, mc = (t, e, n, o) => {
  const r = t._zod.def;
  P(r.innerType, e, o);
  const i = e.seen.get(t);
  i.ref = r.innerType, e.io === "input" && (n._prefault = JSON.parse(JSON.stringify(r.defaultValue)));
}, _c = (t, e, n, o) => {
  const r = t._zod.def;
  P(r.innerType, e, o);
  const i = e.seen.get(t);
  i.ref = r.innerType;
  let s;
  try {
    s = r.catchValue(void 0);
  } catch {
    throw new Error("Dynamic catch values are not supported in JSON Schema");
  }
  n.default = s;
}, gc = (t, e, n, o) => {
  const r = t._zod.def, i = e.io === "input" ? r.in._zod.def.type === "transform" ? r.out : r.in : r.out;
  P(i, e, o);
  const s = e.seen.get(t);
  s.ref = i;
}, bc = (t, e, n, o) => {
  const r = t._zod.def;
  P(r.innerType, e, o);
  const i = e.seen.get(t);
  i.ref = r.innerType, n.readOnly = !0;
}, No = (t, e, n, o) => {
  const r = t._zod.def;
  P(r.innerType, e, o);
  const i = e.seen.get(t);
  i.ref = r.innerType;
}, vc = /* @__PURE__ */ h("ZodISODateTime", (t, e) => {
  $s.init(t, e), R.init(t, e);
});
function yc(t) {
  return /* @__PURE__ */ xa(vc, t);
}
const wc = /* @__PURE__ */ h("ZodISODate", (t, e) => {
  ks.init(t, e), R.init(t, e);
});
function $c(t) {
  return /* @__PURE__ */ Ra(wc, t);
}
const kc = /* @__PURE__ */ h("ZodISOTime", (t, e) => {
  Ss.init(t, e), R.init(t, e);
});
function Sc(t) {
  return /* @__PURE__ */ Aa(kc, t);
}
const zc = /* @__PURE__ */ h("ZodISODuration", (t, e) => {
  zs.init(t, e), R.init(t, e);
});
function Ec(t) {
  return /* @__PURE__ */ Ca(zc, t);
}
const xc = (t, e) => {
  mo.init(t, e), t.name = "ZodError", Object.defineProperties(t, {
    format: {
      value: (n) => mi(t, n)
      // enumerable: false,
    },
    flatten: {
      value: (n) => fi(t, n)
      // enumerable: false,
    },
    addIssue: {
      value: (n) => {
        t.issues.push(n), t.message = JSON.stringify(t.issues, xt, 2);
      }
      // enumerable: false,
    },
    addIssues: {
      value: (n) => {
        t.issues.push(...n), t.message = JSON.stringify(t.issues, xt, 2);
      }
      // enumerable: false,
    },
    isEmpty: {
      get() {
        return t.issues.length === 0;
      }
      // enumerable: false,
    }
  });
}, J = h("ZodError", xc, {
  Parent: Error
}), Rc = /* @__PURE__ */ Ut(J), Ac = /* @__PURE__ */ Mt(J), Cc = /* @__PURE__ */ ut(J), Zc = /* @__PURE__ */ lt(J), Ic = /* @__PURE__ */ bi(J), Tc = /* @__PURE__ */ vi(J), Nc = /* @__PURE__ */ yi(J), Pc = /* @__PURE__ */ wi(J), Oc = /* @__PURE__ */ $i(J), jc = /* @__PURE__ */ ki(J), Dc = /* @__PURE__ */ Si(J), Lc = /* @__PURE__ */ zi(J), C = /* @__PURE__ */ h("ZodType", (t, e) => (A.init(t, e), Object.assign(t["~standard"], {
  jsonSchema: {
    input: nt(t, "input"),
    output: nt(t, "output")
  }
}), t.toJSONSchema = Ka(t, {}), t.def = e, t.type = e.type, Object.defineProperty(t, "_def", { value: e }), t.check = (...n) => t.clone(ne(e, {
  checks: [
    ...e.checks ?? [],
    ...n.map((o) => typeof o == "function" ? { _zod: { check: o, def: { check: "custom" }, onattach: [] } } : o)
  ]
}), {
  parent: !0
}), t.with = t.check, t.clone = (n, o) => oe(t, n, o), t.brand = () => t, t.register = (n, o) => (n.add(t, o), t), t.parse = (n, o) => Rc(t, n, o, { callee: t.parse }), t.safeParse = (n, o) => Cc(t, n, o), t.parseAsync = async (n, o) => Ac(t, n, o, { callee: t.parseAsync }), t.safeParseAsync = async (n, o) => Zc(t, n, o), t.spa = t.safeParseAsync, t.encode = (n, o) => Ic(t, n, o), t.decode = (n, o) => Tc(t, n, o), t.encodeAsync = async (n, o) => Nc(t, n, o), t.decodeAsync = async (n, o) => Pc(t, n, o), t.safeEncode = (n, o) => Oc(t, n, o), t.safeDecode = (n, o) => jc(t, n, o), t.safeEncodeAsync = async (n, o) => Dc(t, n, o), t.safeDecodeAsync = async (n, o) => Lc(t, n, o), t.refine = (n, o) => t.check(Zu(n, o)), t.superRefine = (n) => t.check(Iu(n)), t.overwrite = (n) => t.check(/* @__PURE__ */ $e(n)), t.optional = () => On(t), t.exactOptional = () => vu(t), t.nullable = () => jn(t), t.nullish = () => On(jn(t)), t.nonoptional = (n) => Su(t, n), t.array = () => je(t), t.or = (n) => du([t, n]), t.and = (n) => pu(t, n), t.transform = (n) => Dn(t, gu(n)), t.default = (n) => wu(t, n), t.prefault = (n) => ku(t, n), t.catch = (n) => Eu(t, n), t.pipe = (n) => Dn(t, n), t.readonly = () => Au(t), t.describe = (n) => {
  const o = t.clone();
  return Ae.add(o, { description: n }), o;
}, Object.defineProperty(t, "description", {
  get() {
    var n;
    return (n = Ae.get(t)) == null ? void 0 : n.description;
  },
  configurable: !0
}), t.meta = (...n) => {
  if (n.length === 0)
    return Ae.get(t);
  const o = t.clone();
  return Ae.add(o, n[0]), o;
}, t.isOptional = () => t.safeParse(void 0).success, t.isNullable = () => t.safeParse(null).success, t.apply = (n) => n(t), t)), Po = /* @__PURE__ */ h("_ZodString", (t, e) => {
  Ft.init(t, e), C.init(t, e), t._zod.processJSONSchema = (o, r, i) => Qa(t, o, r);
  const n = t._zod.bag;
  t.format = n.format ?? null, t.minLength = n.minimum ?? null, t.maxLength = n.maximum ?? null, t.regex = (...o) => t.check(/* @__PURE__ */ Oa(...o)), t.includes = (...o) => t.check(/* @__PURE__ */ La(...o)), t.startsWith = (...o) => t.check(/* @__PURE__ */ Ua(...o)), t.endsWith = (...o) => t.check(/* @__PURE__ */ Ma(...o)), t.min = (...o) => t.check(/* @__PURE__ */ tt(...o)), t.max = (...o) => t.check(/* @__PURE__ */ Ao(...o)), t.length = (...o) => t.check(/* @__PURE__ */ Co(...o)), t.nonempty = (...o) => t.check(/* @__PURE__ */ tt(1, ...o)), t.lowercase = (o) => t.check(/* @__PURE__ */ ja(o)), t.uppercase = (o) => t.check(/* @__PURE__ */ Da(o)), t.trim = () => t.check(/* @__PURE__ */ Ba()), t.normalize = (...o) => t.check(/* @__PURE__ */ Fa(...o)), t.toLowerCase = () => t.check(/* @__PURE__ */ Ha()), t.toUpperCase = () => t.check(/* @__PURE__ */ Ja()), t.slugify = () => t.check(/* @__PURE__ */ Wa());
}), Oo = /* @__PURE__ */ h("ZodString", (t, e) => {
  Ft.init(t, e), Po.init(t, e), t.email = (n) => t.check(/* @__PURE__ */ sa(Uc, n)), t.url = (n) => t.check(/* @__PURE__ */ da(Mc, n)), t.jwt = (n) => t.check(/* @__PURE__ */ Ea(nu, n)), t.emoji = (n) => t.check(/* @__PURE__ */ ha(Fc, n)), t.guid = (n) => t.check(/* @__PURE__ */ Cn(Nn, n)), t.uuid = (n) => t.check(/* @__PURE__ */ aa(He, n)), t.uuidv4 = (n) => t.check(/* @__PURE__ */ ca(He, n)), t.uuidv6 = (n) => t.check(/* @__PURE__ */ ua(He, n)), t.uuidv7 = (n) => t.check(/* @__PURE__ */ la(He, n)), t.nanoid = (n) => t.check(/* @__PURE__ */ pa(Bc, n)), t.guid = (n) => t.check(/* @__PURE__ */ Cn(Nn, n)), t.cuid = (n) => t.check(/* @__PURE__ */ fa(Hc, n)), t.cuid2 = (n) => t.check(/* @__PURE__ */ ma(Jc, n)), t.ulid = (n) => t.check(/* @__PURE__ */ _a(Wc, n)), t.base64 = (n) => t.check(/* @__PURE__ */ ka(Qc, n)), t.base64url = (n) => t.check(/* @__PURE__ */ Sa(eu, n)), t.xid = (n) => t.check(/* @__PURE__ */ ga(Vc, n)), t.ksuid = (n) => t.check(/* @__PURE__ */ ba(qc, n)), t.ipv4 = (n) => t.check(/* @__PURE__ */ va(Xc, n)), t.ipv6 = (n) => t.check(/* @__PURE__ */ ya(Yc, n)), t.cidrv4 = (n) => t.check(/* @__PURE__ */ wa(Kc, n)), t.cidrv6 = (n) => t.check(/* @__PURE__ */ $a(Gc, n)), t.e164 = (n) => t.check(/* @__PURE__ */ za(tu, n)), t.datetime = (n) => t.check(yc(n)), t.date = (n) => t.check($c(n)), t.time = (n) => t.check(Sc(n)), t.duration = (n) => t.check(Ec(n));
});
function M(t) {
  return /* @__PURE__ */ ia(Oo, t);
}
const R = /* @__PURE__ */ h("ZodStringFormat", (t, e) => {
  x.init(t, e), Po.init(t, e);
}), Uc = /* @__PURE__ */ h("ZodEmail", (t, e) => {
  ps.init(t, e), R.init(t, e);
}), Nn = /* @__PURE__ */ h("ZodGUID", (t, e) => {
  ds.init(t, e), R.init(t, e);
}), He = /* @__PURE__ */ h("ZodUUID", (t, e) => {
  hs.init(t, e), R.init(t, e);
}), Mc = /* @__PURE__ */ h("ZodURL", (t, e) => {
  fs.init(t, e), R.init(t, e);
}), Fc = /* @__PURE__ */ h("ZodEmoji", (t, e) => {
  ms.init(t, e), R.init(t, e);
}), Bc = /* @__PURE__ */ h("ZodNanoID", (t, e) => {
  _s.init(t, e), R.init(t, e);
}), Hc = /* @__PURE__ */ h("ZodCUID", (t, e) => {
  gs.init(t, e), R.init(t, e);
}), Jc = /* @__PURE__ */ h("ZodCUID2", (t, e) => {
  bs.init(t, e), R.init(t, e);
}), Wc = /* @__PURE__ */ h("ZodULID", (t, e) => {
  vs.init(t, e), R.init(t, e);
}), Vc = /* @__PURE__ */ h("ZodXID", (t, e) => {
  ys.init(t, e), R.init(t, e);
}), qc = /* @__PURE__ */ h("ZodKSUID", (t, e) => {
  ws.init(t, e), R.init(t, e);
}), Xc = /* @__PURE__ */ h("ZodIPv4", (t, e) => {
  Es.init(t, e), R.init(t, e);
}), Yc = /* @__PURE__ */ h("ZodIPv6", (t, e) => {
  xs.init(t, e), R.init(t, e);
}), Kc = /* @__PURE__ */ h("ZodCIDRv4", (t, e) => {
  Rs.init(t, e), R.init(t, e);
}), Gc = /* @__PURE__ */ h("ZodCIDRv6", (t, e) => {
  As.init(t, e), R.init(t, e);
}), Qc = /* @__PURE__ */ h("ZodBase64", (t, e) => {
  Cs.init(t, e), R.init(t, e);
}), eu = /* @__PURE__ */ h("ZodBase64URL", (t, e) => {
  Is.init(t, e), R.init(t, e);
}), tu = /* @__PURE__ */ h("ZodE164", (t, e) => {
  Ts.init(t, e), R.init(t, e);
}), nu = /* @__PURE__ */ h("ZodJWT", (t, e) => {
  Ps.init(t, e), R.init(t, e);
}), Bt = /* @__PURE__ */ h("ZodNumber", (t, e) => {
  zo.init(t, e), C.init(t, e), t._zod.processJSONSchema = (o, r, i) => ec(t, o, r), t.gt = (o, r) => t.check(/* @__PURE__ */ In(o, r)), t.gte = (o, r) => t.check(/* @__PURE__ */ vt(o, r)), t.min = (o, r) => t.check(/* @__PURE__ */ vt(o, r)), t.lt = (o, r) => t.check(/* @__PURE__ */ Zn(o, r)), t.lte = (o, r) => t.check(/* @__PURE__ */ bt(o, r)), t.max = (o, r) => t.check(/* @__PURE__ */ bt(o, r)), t.int = (o) => t.check(Pn(o)), t.safe = (o) => t.check(Pn(o)), t.positive = (o) => t.check(/* @__PURE__ */ In(0, o)), t.nonnegative = (o) => t.check(/* @__PURE__ */ vt(0, o)), t.negative = (o) => t.check(/* @__PURE__ */ Zn(0, o)), t.nonpositive = (o) => t.check(/* @__PURE__ */ bt(0, o)), t.multipleOf = (o, r) => t.check(/* @__PURE__ */ Tn(o, r)), t.step = (o, r) => t.check(/* @__PURE__ */ Tn(o, r)), t.finite = () => t;
  const n = t._zod.bag;
  t.minValue = Math.max(n.minimum ?? Number.NEGATIVE_INFINITY, n.exclusiveMinimum ?? Number.NEGATIVE_INFINITY) ?? null, t.maxValue = Math.min(n.maximum ?? Number.POSITIVE_INFINITY, n.exclusiveMaximum ?? Number.POSITIVE_INFINITY) ?? null, t.isInt = (n.format ?? "").includes("int") || Number.isSafeInteger(n.multipleOf ?? 0.5), t.isFinite = !0, t.format = n.format ?? null;
});
function ae(t) {
  return /* @__PURE__ */ Za(Bt, t);
}
const ou = /* @__PURE__ */ h("ZodNumberFormat", (t, e) => {
  Os.init(t, e), Bt.init(t, e);
});
function Pn(t) {
  return /* @__PURE__ */ Ia(ou, t);
}
const jo = /* @__PURE__ */ h("ZodBoolean", (t, e) => {
  js.init(t, e), C.init(t, e), t._zod.processJSONSchema = (n, o, r) => tc(t, n, o);
});
function ru(t) {
  return /* @__PURE__ */ Ta(jo, t);
}
const iu = /* @__PURE__ */ h("ZodUnknown", (t, e) => {
  Ds.init(t, e), C.init(t, e), t._zod.processJSONSchema = (n, o, r) => oc();
});
function ot() {
  return /* @__PURE__ */ Na(iu);
}
const su = /* @__PURE__ */ h("ZodNever", (t, e) => {
  Ls.init(t, e), C.init(t, e), t._zod.processJSONSchema = (n, o, r) => nc(t, n, o);
});
function au(t) {
  return /* @__PURE__ */ Pa(su, t);
}
const cu = /* @__PURE__ */ h("ZodArray", (t, e) => {
  Us.init(t, e), C.init(t, e), t._zod.processJSONSchema = (n, o, r) => ac(t, n, o, r), t.element = e.element, t.min = (n, o) => t.check(/* @__PURE__ */ tt(n, o)), t.nonempty = (n) => t.check(/* @__PURE__ */ tt(1, n)), t.max = (n, o) => t.check(/* @__PURE__ */ Ao(n, o)), t.length = (n, o) => t.check(/* @__PURE__ */ Co(n, o)), t.unwrap = () => t.element;
});
function je(t, e) {
  return /* @__PURE__ */ Va(cu, t, e);
}
const uu = /* @__PURE__ */ h("ZodObject", (t, e) => {
  Fs.init(t, e), C.init(t, e), t._zod.processJSONSchema = (n, o, r) => cc(t, n, o, r), k(t, "shape", () => e.shape), t.keyof = () => Do(Object.keys(t._zod.def.shape)), t.catchall = (n) => t.clone({ ...t._zod.def, catchall: n }), t.passthrough = () => t.clone({ ...t._zod.def, catchall: ot() }), t.loose = () => t.clone({ ...t._zod.def, catchall: ot() }), t.strict = () => t.clone({ ...t._zod.def, catchall: au() }), t.strip = () => t.clone({ ...t._zod.def, catchall: void 0 }), t.extend = (n) => ui(t, n), t.safeExtend = (n) => li(t, n), t.merge = (n) => di(t, n), t.pick = (n) => ai(t, n), t.omit = (n) => ci(t, n), t.partial = (...n) => hi(Ht, t, n[0]), t.required = (...n) => pi(Uo, t, n[0]);
});
function Le(t, e) {
  const n = {
    type: "object",
    shape: t ?? {},
    ...b(e)
  };
  return new uu(n);
}
const lu = /* @__PURE__ */ h("ZodUnion", (t, e) => {
  Bs.init(t, e), C.init(t, e), t._zod.processJSONSchema = (n, o, r) => uc(t, n, o, r), t.options = e.options;
});
function du(t, e) {
  return new lu({
    type: "union",
    options: t,
    ...b(e)
  });
}
const hu = /* @__PURE__ */ h("ZodIntersection", (t, e) => {
  Hs.init(t, e), C.init(t, e), t._zod.processJSONSchema = (n, o, r) => lc(t, n, o, r);
});
function pu(t, e) {
  return new hu({
    type: "intersection",
    left: t,
    right: e
  });
}
const fu = /* @__PURE__ */ h("ZodRecord", (t, e) => {
  Js.init(t, e), C.init(t, e), t._zod.processJSONSchema = (n, o, r) => dc(t, n, o, r), t.keyType = e.keyType, t.valueType = e.valueType;
});
function mu(t, e, n) {
  return new fu({
    type: "record",
    keyType: t,
    valueType: e,
    ...b(n)
  });
}
const rt = /* @__PURE__ */ h("ZodEnum", (t, e) => {
  Ws.init(t, e), C.init(t, e), t._zod.processJSONSchema = (o, r, i) => rc(t, o, r), t.enum = e.entries, t.options = Object.values(e.entries);
  const n = new Set(Object.keys(e.entries));
  t.extract = (o, r) => {
    const i = {};
    for (const s of o)
      if (n.has(s))
        i[s] = e.entries[s];
      else
        throw new Error(`Key ${s} not found in enum`);
    return new rt({
      ...e,
      checks: [],
      ...b(r),
      entries: i
    });
  }, t.exclude = (o, r) => {
    const i = { ...e.entries };
    for (const s of o)
      if (n.has(s))
        delete i[s];
      else
        throw new Error(`Key ${s} not found in enum`);
    return new rt({
      ...e,
      checks: [],
      ...b(r),
      entries: i
    });
  };
});
function Do(t, e) {
  const n = Array.isArray(t) ? Object.fromEntries(t.map((o) => [o, o])) : t;
  return new rt({
    type: "enum",
    entries: n,
    ...b(e)
  });
}
const _u = /* @__PURE__ */ h("ZodTransform", (t, e) => {
  Vs.init(t, e), C.init(t, e), t._zod.processJSONSchema = (n, o, r) => sc(t, n), t._zod.parse = (n, o) => {
    if (o.direction === "backward")
      throw new co(t.constructor.name);
    n.addIssue = (i) => {
      if (typeof i == "string")
        n.issues.push(Oe(i, n.value, e));
      else {
        const s = i;
        s.fatal && (s.continue = !1), s.code ?? (s.code = "custom"), s.input ?? (s.input = n.value), s.inst ?? (s.inst = t), n.issues.push(Oe(s));
      }
    };
    const r = e.transform(n.value, n);
    return r instanceof Promise ? r.then((i) => (n.value = i, n)) : (n.value = r, n);
  };
});
function gu(t) {
  return new _u({
    type: "transform",
    transform: t
  });
}
const Ht = /* @__PURE__ */ h("ZodOptional", (t, e) => {
  Ro.init(t, e), C.init(t, e), t._zod.processJSONSchema = (n, o, r) => No(t, n, o, r), t.unwrap = () => t._zod.def.innerType;
});
function On(t) {
  return new Ht({
    type: "optional",
    innerType: t
  });
}
const bu = /* @__PURE__ */ h("ZodExactOptional", (t, e) => {
  qs.init(t, e), C.init(t, e), t._zod.processJSONSchema = (n, o, r) => No(t, n, o, r), t.unwrap = () => t._zod.def.innerType;
});
function vu(t) {
  return new bu({
    type: "optional",
    innerType: t
  });
}
const yu = /* @__PURE__ */ h("ZodNullable", (t, e) => {
  Xs.init(t, e), C.init(t, e), t._zod.processJSONSchema = (n, o, r) => hc(t, n, o, r), t.unwrap = () => t._zod.def.innerType;
});
function jn(t) {
  return new yu({
    type: "nullable",
    innerType: t
  });
}
const Lo = /* @__PURE__ */ h("ZodDefault", (t, e) => {
  Ys.init(t, e), C.init(t, e), t._zod.processJSONSchema = (n, o, r) => fc(t, n, o, r), t.unwrap = () => t._zod.def.innerType, t.removeDefault = t.unwrap;
});
function wu(t, e) {
  return new Lo({
    type: "default",
    innerType: t,
    get defaultValue() {
      return typeof e == "function" ? e() : po(e);
    }
  });
}
const $u = /* @__PURE__ */ h("ZodPrefault", (t, e) => {
  Ks.init(t, e), C.init(t, e), t._zod.processJSONSchema = (n, o, r) => mc(t, n, o, r), t.unwrap = () => t._zod.def.innerType;
});
function ku(t, e) {
  return new $u({
    type: "prefault",
    innerType: t,
    get defaultValue() {
      return typeof e == "function" ? e() : po(e);
    }
  });
}
const Uo = /* @__PURE__ */ h("ZodNonOptional", (t, e) => {
  Gs.init(t, e), C.init(t, e), t._zod.processJSONSchema = (n, o, r) => pc(t, n, o, r), t.unwrap = () => t._zod.def.innerType;
});
function Su(t, e) {
  return new Uo({
    type: "nonoptional",
    innerType: t,
    ...b(e)
  });
}
const zu = /* @__PURE__ */ h("ZodCatch", (t, e) => {
  Qs.init(t, e), C.init(t, e), t._zod.processJSONSchema = (n, o, r) => _c(t, n, o, r), t.unwrap = () => t._zod.def.innerType, t.removeCatch = t.unwrap;
});
function Eu(t, e) {
  return new zu({
    type: "catch",
    innerType: t,
    catchValue: typeof e == "function" ? e : () => e
  });
}
const xu = /* @__PURE__ */ h("ZodPipe", (t, e) => {
  ea.init(t, e), C.init(t, e), t._zod.processJSONSchema = (n, o, r) => gc(t, n, o, r), t.in = e.in, t.out = e.out;
});
function Dn(t, e) {
  return new xu({
    type: "pipe",
    in: t,
    out: e
    // ...util.normalizeParams(params),
  });
}
const Ru = /* @__PURE__ */ h("ZodReadonly", (t, e) => {
  ta.init(t, e), C.init(t, e), t._zod.processJSONSchema = (n, o, r) => bc(t, n, o, r), t.unwrap = () => t._zod.def.innerType;
});
function Au(t) {
  return new Ru({
    type: "readonly",
    innerType: t
  });
}
const Cu = /* @__PURE__ */ h("ZodCustom", (t, e) => {
  na.init(t, e), C.init(t, e), t._zod.processJSONSchema = (n, o, r) => ic(t, n);
});
function Zu(t, e = {}) {
  return /* @__PURE__ */ qa(Cu, t, e);
}
function Iu(t) {
  return /* @__PURE__ */ Xa(t);
}
const Tu = /* @__PURE__ */ new Set(["id", "image"]);
function At(t) {
  return t instanceof Ht ? At(t.unwrap()) : t instanceof Lo ? At(t._def.innerType) : t;
}
function Nu(t) {
  const e = [];
  for (const [n, o] of Object.entries(t.shape)) {
    if (Tu.has(n)) continue;
    const r = o, i = At(r), s = r.description ?? n;
    if (i instanceof jo) {
      e.push({ key: n, label: s, type: "boolean" });
      continue;
    }
    if (i instanceof rt) {
      e.push({ key: n, label: s, type: "select", options: i.options });
      continue;
    }
    if (i instanceof Bt) {
      const a = i;
      e.push({
        key: n,
        label: s,
        type: "number",
        min: a.minValue ?? void 0,
        max: a.maxValue ?? void 0
      });
      continue;
    }
    if (i instanceof Oo) {
      const a = i, c = n.toLowerCase().includes("emoji") || s.includes("אמוג");
      e.push({
        key: n,
        label: s,
        type: c ? "emoji" : "text",
        maxLength: a.maxLength ?? void 0
      });
      continue;
    }
    e.push({ key: n, label: s, type: "text" });
  }
  return e;
}
const Pu = Le({
  x: ae().min(0).max(100),
  y: ae().min(0).max(100)
}), Ou = Le({
  id: M(),
  shape: Do(["rect", "polygon"]).default("rect"),
  x: ae().min(0).max(100),
  y: ae().min(0).max(100),
  width: ae().min(0).max(100),
  height: ae().min(0).max(100),
  points: je(Pu).optional(),
  correct: ru().default(!1),
  label: M().optional()
}), Jt = Le({
  id: M(),
  image: M().optional(),
  zones: je(Ou).optional()
}).passthrough(), ju = Jt.extend({
  target: M().max(2).describe("אות יעד"),
  correct: M().describe("תשובה נכונה"),
  correctEmoji: M().describe("אמוג'י")
}), Du = Jt.extend({
  target: M().max(2).describe("אות יעד"),
  correct: M().describe("תשובה נכונה"),
  correctEmoji: M().describe("אמוג'י")
}), Lu = Le({
  title: M().default(""),
  type: M().default("multiple-choice")
}).passthrough(), Cl = Le({
  id: M(),
  version: ae().default(1),
  meta: Lu.default({}),
  rounds: je(mu(M(), ot())).default([]),
  distractors: je(ot()).default([])
}), Uu = Jt.extend({
  instruction: M().optional().describe("הוראה")
}), Ln = {
  "multiple-choice": ju,
  "drag-match": Du,
  "zone-tap": Uu
}, Vt = class Vt extends N {
  createRenderRoot() {
    return this;
  }
  constructor() {
    super(), this._round = null, this._roundId = null, this._hasRound = !1, this._imageDataUrl = null, this._gameType = "multiple-choice", this._roundSchema = null, this._onFieldChange = null, this._onDeleteRound = null;
  }
  loadRound(e, n = "multiple-choice") {
    this._gameType = n, this._roundId = e.id, this._round = e, this._imageDataUrl = e.image ?? null, this._hasRound = !0;
  }
  clear() {
    this._round = null, this._roundId = null, this._hasRound = !1, this._imageDataUrl = null;
  }
  _handleDelete() {
    var e;
    confirm("למחוק את הסיבוב הזה?") && ((e = this._onDeleteRound) == null || e.call(this, this._roundId), this.clear());
  }
  _handleImageUpload(e) {
    var r;
    const n = (r = e.target.files) == null ? void 0 : r[0];
    if (!n) return;
    const o = new FileReader();
    o.onload = (i) => {
      var a;
      const s = i.target.result;
      this._imageDataUrl = s, (a = this._onFieldChange) == null || a.call(this, this._roundId, "image", s);
    }, o.readAsDataURL(n);
  }
  _clearImage() {
    var n;
    this._imageDataUrl = null, (n = this._onFieldChange) == null || n.call(this, this._roundId, "image", null);
    const e = this.querySelector(".ab-editor-field__file-input");
    e && (e.value = "");
  }
  // ── Field renderers ───────────────────────────────────────────────────────
  _renderField(e) {
    const n = this._round;
    return v`
      <div class="ab-editor-field">
        <label class="ab-editor-field__label">${e.label}</label>
        ${e.type === "emoji" ? this._renderEmojiInput(e, n) : ""}
        ${e.type === "boolean" ? this._renderToggle(e, n) : ""}
        ${e.type === "select" ? this._renderSelect(e, n) : ""}
        ${e.type === "number" ? this._renderNumberInput(e, n) : ""}
        ${e.type !== "emoji" && e.type !== "boolean" && e.type !== "select" && e.type !== "number" ? this._renderTextInput(e, n) : ""}
      </div>
    `;
  }
  _renderTextInput(e, n) {
    return v`
      <input class="ab-editor-field__input" type="text" dir="rtl"
             .value=${String(n[e.key] ?? "")}
             maxlength=${e.maxLength ?? 9999}
             @input=${(o) => {
      var r;
      return (r = this._onFieldChange) == null ? void 0 : r.call(this, this._roundId, e.key, o.target.value);
    }}>
    `;
  }
  _renderEmojiInput(e, n) {
    const o = String(n[e.key] ?? "");
    return v`
      <div class="ab-editor-field__emoji-row">
        <div class="ab-editor-field__emoji-preview">${o || "❓"}</div>
        <input class="ab-editor-field__input" type="text" .value=${o} maxlength="8"
               placeholder="🐱" style="font-size:20px"
               @input=${(r) => {
      var a, c;
      const i = r.target.value, s = (a = r.target.closest(".ab-editor-field__emoji-row")) == null ? void 0 : a.querySelector(".ab-editor-field__emoji-preview");
      s && (s.textContent = i || "❓"), (c = this._onFieldChange) == null || c.call(this, this._roundId, e.key, i);
    }}>
      </div>
    `;
  }
  _renderToggle(e, n) {
    return v`
      <input type="checkbox" .checked=${!!n[e.key]}
             @change=${(o) => {
      var r;
      return (r = this._onFieldChange) == null ? void 0 : r.call(
        this,
        this._roundId,
        e.key,
        o.target.checked
      );
    }}>
    `;
  }
  _renderSelect(e, n) {
    return v`
      <select class="ab-editor-field__input"
              @change=${(o) => {
      var r;
      return (r = this._onFieldChange) == null ? void 0 : r.call(
        this,
        this._roundId,
        e.key,
        o.target.value
      );
    }}>
        ${(e.options ?? []).map((o) => v`
          <option value=${o} ?selected=${n[e.key] === o}>${o}</option>
        `)}
      </select>
    `;
  }
  _renderNumberInput(e, n) {
    return v`
      <input class="ab-editor-field__input" type="number"
             .value=${String(n[e.key] ?? "")}
             min=${e.min ?? ""}
             max=${e.max ?? ""}
             @input=${(o) => {
      var r;
      return (r = this._onFieldChange) == null ? void 0 : r.call(
        this,
        this._roundId,
        e.key,
        Number(o.target.value)
      );
    }}>
    `;
  }
  _renderImageField() {
    const e = !!this._imageDataUrl;
    return v`
      <div class="ab-editor-field ab-editor-field--image">
        <label class="ab-editor-field__label">🖼 תמונה</label>
        <div class="ab-editor-field__img-row">
          <div class="ab-editor-field__img-preview"
               style=${e ? `background-image:url(${this._imageDataUrl})` : ""}>
          </div>
          <div class="ab-editor-field__img-btns">
            <input class="ab-editor-field__file-input" type="file" accept="image/*"
                   style="display:none"
                   @change=${this._handleImageUpload}>
            <button class="ab-editor-btn ab-editor-btn--img-upload"
                    @click=${() => {
      var n;
      return (n = this.querySelector(
        ".ab-editor-field__file-input"
      )) == null ? void 0 : n.click();
    }}>
              ${e ? "🔄 החלף" : "📤 העלה"}
            </button>
            ${e ? v`
              <button class="ab-editor-btn ab-editor-btn--img-clear"
                      @click=${() => this._clearImage()}>✕ הסר</button>
            ` : ""}
          </div>
        </div>
      </div>
    `;
  }
  render() {
    const e = this._roundSchema ?? Ln[this._gameType] ?? Ln["multiple-choice"], n = this._hasRound ? Nu(e) : [];
    return v`
      <div class="ab-editor-inspector">
        <div class="ab-editor-inspector__header">
          <span class="ab-editor-inspector__title">✏️ ערוך סיבוב</span>
        </div>
        <div class="ab-editor-inspector__body">
          ${this._hasRound ? v`${n.map((o) => this._renderField(o))}${this._renderImageField()}` : v`<p class="ab-editor-inspector__empty">בחר סיבוב לעריכה</p>`}
        </div>
        ${this._hasRound ? v`
          <button class="ab-editor-inspector__delete"
                  @click=${() => this._handleDelete()}>🗑 מחק סיבוב</button>
        ` : ""}
      </div>
    `;
  }
};
Vt.properties = {
  _round: { state: !0 },
  _roundId: { state: !0 },
  _hasRound: { state: !0 },
  _imageDataUrl: { state: !0 }
};
let Ct = Vt;
customElements.define("ab-round-inspector", Ct);
function Mu(t, { onFieldChange: e, onDeleteRound: n, roundSchema: o }) {
  const r = document.createElement("ab-round-inspector");
  return r._onFieldChange = e, r._onDeleteRound = n, r._roundSchema = o ?? null, t.appendChild(r), {
    loadRound: (i, s) => r.loadRound(i, s),
    clear: () => r.clear(),
    destroy: () => r.remove()
  };
}
let Fu = 0;
function yt() {
  return `round-${Date.now()}-${Fu++}`;
}
class it {
  // redo stack
  constructor(e) {
    this._id = e.id ?? "game", this._version = e.version ?? 1, this._meta = { title: "", type: "multiple-choice", ...e.meta ?? {} }, this._rounds = (e.rounds ?? []).map((n) => ({ ...n, id: n.id || yt() })), this._distractors = e.distractors ?? [], this._handlers = [], this._past = [], this._future = [];
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
  getRound(e) {
    return this._rounds.find((n) => n.id === e) ?? null;
  }
  getRoundIndex(e) {
    return this._rounds.findIndex((n) => n.id === e);
  }
  // ── Rounds (write) ────────────────────────────────────────────────────────
  updateRound(e, n) {
    const o = this.getRoundIndex(e);
    o !== -1 && (this._saveHistory(), this._rounds[o] = { ...this._rounds[o], ...n }, this._emit());
  }
  addRound(e = null) {
    this._saveHistory();
    const n = { id: yt(), target: "", correct: "", correctEmoji: "❓" };
    if (e === null)
      this._rounds.push(n);
    else {
      const o = this.getRoundIndex(e);
      this._rounds.splice(o + 1, 0, n);
    }
    return this._emit(), n.id;
  }
  duplicateRound(e) {
    const n = this.getRound(e);
    if (!n) return null;
    this._saveHistory();
    const o = { ...n, id: yt() };
    return this._rounds.splice(this.getRoundIndex(e) + 1, 0, o), this._emit(), o.id;
  }
  removeRound(e) {
    const n = this.getRoundIndex(e);
    n === -1 || this._rounds.length <= 1 || (this._saveHistory(), this._rounds.splice(n, 1), this._emit());
  }
  moveRound(e, n) {
    const o = this.getRoundIndex(e);
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
    return this._rounds.map((e) => ({ ...e }));
  }
  // ── Change events ─────────────────────────────────────────────────────────
  onChange(e) {
    return this._handlers.push(e), () => this.offChange(e);
  }
  offChange(e) {
    const n = this._handlers.indexOf(e);
    n !== -1 && this._handlers.splice(n, 1);
  }
  _emit() {
    this._handlers.forEach((e) => e(this));
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
  static fromJSON(e) {
    return new it(e);
  }
  static fromRoundsArray(e, n, o = {}, r = []) {
    return new it({ id: e, meta: o, rounds: n, distractors: r });
  }
}
const Mo = "alefbet.editor.";
function Fo(t) {
  return Ir(`${Mo}${t}`, null);
}
function Bu(t) {
  Fo(t.id).set(t.toJSON());
}
function Zl(t) {
  const e = Fo(t).get();
  if (!e) return null;
  try {
    return it.fromJSON(e);
  } catch {
    return null;
  }
}
function Il(t) {
  try {
    localStorage.removeItem(`${Mo}${t}`);
  } catch {
  }
}
function Hu(t) {
  const e = JSON.stringify(t.toJSON(), null, 2), n = new Blob([e], { type: "application/json;charset=utf-8" }), o = URL.createObjectURL(n), r = document.createElement("a");
  r.href = o, r.download = `${t.id}-rounds.json`, r.click(), URL.revokeObjectURL(o);
}
const Ju = [
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
function Wu(t) {
  return t.trim().replace(/\s+/g, "-").replace(/[^a-z0-9\u05D0-\u05EA_-]/gi, "").toLowerCase() || `custom-${Date.now()}`;
}
class Bo extends N {
  createRenderRoot() {
    return this;
  }
  constructor() {
    super(), this._open = !1, this._gameId = "", this._categories = [], this._expanded = /* @__PURE__ */ new Set(), this._customSlots = [];
  }
  open(e, n = null) {
    var r;
    this._gameId = e, this._customSlots = this._loadCustomSlots(e);
    const o = [...Ju];
    ((r = n == null ? void 0 : n.rounds) == null ? void 0 : r.length) > 0 && o.splice(1, 0, {
      id: "rounds",
      label: "🔤 שאלות / סיבובים",
      slots: n.rounds.map((i, s) => ({
        key: i.id,
        label: `סיבוב ${s + 1}${i.target ? " — " + i.target : ""}${i.correct ? " (" + i.correct + ")" : ""}`
      }))
    }), this._categories = o, this._expanded = /* @__PURE__ */ new Set([...o.map((i) => i.id), "custom"]), this._open = !0;
  }
  _loadCustomSlots(e) {
    try {
      return JSON.parse(localStorage.getItem(`alefbet.audio-manager.${e}.custom`) || "[]");
    } catch {
      return [];
    }
  }
  _saveCustomSlots() {
    localStorage.setItem(
      `alefbet.audio-manager.${this._gameId}.custom`,
      JSON.stringify(this._customSlots)
    );
  }
  _toggleExpand(e) {
    const n = new Set(this._expanded);
    n.has(e) ? n.delete(e) : n.add(e), this._expanded = n;
  }
  _addCustomSlot() {
    var r;
    const e = this.querySelector(".ab-am-add-input"), n = (r = e == null ? void 0 : e.value) == null ? void 0 : r.trim();
    if (!n) return;
    const o = Wu(n);
    if (this._customSlots.some((i) => i.key === o)) {
      e == null || e.select();
      return;
    }
    this._customSlots = [...this._customSlots, { key: o, label: n }], this._saveCustomSlots(), e && (e.value = "");
  }
  _removeCustomSlot(e) {
    this._customSlots = this._customSlots.filter((n) => n.key !== e), this._saveCustomSlots();
  }
  _renderCategory(e) {
    const n = this._expanded.has(e.id);
    return v`
      <section class="ab-am-section">
        <button class="ab-am-section__heading" aria-expanded=${n}
                @click=${() => this._toggleExpand(e.id)}>
          <span>${e.label}</span>
          <span class="ab-am-chevron">${n ? "▾" : "▸"}</span>
        </button>
        <div class="ab-am-grid" ?hidden=${!n}>
          ${e.slots.map((o) => this._renderSlotRow(o.key, o.label, !1))}
        </div>
      </section>
    `;
  }
  _renderCustomCategory() {
    const e = this._expanded.has("custom");
    return v`
      <section class="ab-am-section">
        <button class="ab-am-section__heading" aria-expanded=${e}
                @click=${() => this._toggleExpand("custom")}>
          <span>➕ מותאם אישית</span>
          <span class="ab-am-chevron">${e ? "▾" : "▸"}</span>
        </button>
        <div class="ab-am-grid" ?hidden=${!e}>
          ${this._customSlots.map((n) => this._renderSlotRow(n.key, n.label, !0))}
        </div>
        <div class="ab-am-add-row" ?hidden=${!e}>
          <input class="ab-am-add-input" type="text" dir="rtl"
                 placeholder="שם ההקלטה... (למשל: שאלה ראשונה)"
                 @keydown=${(n) => {
      n.key === "Enter" && this._addCustomSlot();
    }}>
          <button class="ab-am-add-btn" @click=${() => this._addCustomSlot()}>+ הוסף</button>
        </div>
      </section>
    `;
  }
  _renderSlotRow(e, n, o) {
    return v`
      <div class="ab-am-row">
        <div class="ab-am-row__label-col">
          <div class="ab-am-row__label">${n}</div>
          <code class="ab-am-row__key">${e}</code>
        </div>
        <div class="ab-am-row__ctrl">
          ${o ? v`
            <button class="ab-am-row__del" title="הסר" aria-label="הסר הקלטה"
                    @click=${() => this._removeCustomSlot(e)}>✕</button>
          ` : ""}
          <ab-voice-record-button
            .gameId=${this._gameId}
            .voiceKey=${e}
            .label=${n}
          ></ab-voice-record-button>
        </div>
      </div>
    `;
  }
  render() {
    return this._open ? v`
      <div class="ab-am-modal" role="dialog" aria-modal="true" aria-label="מנהל הקלטות">
        <div class="ab-am-backdrop" @click=${() => {
      this._open = !1;
    }}></div>
        <div class="ab-am-box">
          <div class="ab-am-header">
            <span class="ab-am-title">🎤 מנהל הקלטות</span>
            <span class="ab-am-subtitle">
              כל ההקלטות נשמרות בדפדפן וניתן להשתמש בהן דרך
              <code>playVoice('${this._gameId}', voiceKey)</code>
            </span>
            <button class="ab-am-close" aria-label="סגור"
                    @click=${() => {
      this._open = !1;
    }}>✕</button>
          </div>
          <div class="ab-am-body">
            ${this._categories.map((e) => this._renderCategory(e))}
            ${this._renderCustomCategory()}
          </div>
        </div>
      </div>
    ` : v``;
  }
}
B(Bo, "properties", {
  _open: { state: !0 },
  _gameId: { state: !0 },
  _categories: { state: !0 },
  _expanded: { state: !0 },
  _customSlots: { state: !0 }
});
customElements.define("ab-audio-manager", Bo);
let Je = null;
function Vu() {
  return Je || (Je = document.createElement("ab-audio-manager"), document.body.appendChild(Je)), Je;
}
function qu(t, e = null) {
  Vu().open(t, e);
}
let Xu = 0;
function Un() {
  return `zone-${Date.now()}-${Xu++}`;
}
function Yu(t) {
  const e = t.map((i) => i.x), n = t.map((i) => i.y), o = Math.min(...e), r = Math.min(...n);
  return { x: o, y: r, width: Math.max(...e) - o, height: Math.max(...n) - r };
}
function Ku(t, e, n, o, r) {
  return t.map((i) => {
    const s = o > 0 ? (i.x - e) / o * 100 : 0, a = r > 0 ? (i.y - n) / r * 100 : 0;
    return `${s},${a}`;
  }).join(" ");
}
function Gu(t, e, { onChange: n, gameId: o }) {
  let r = structuredClone(e), i = null, s = "rect", a = [], c = null, u = [], l = null, d = null, m = null;
  const f = document.createElement("div");
  f.className = "ab-ze-overlay";
  const _ = document.createElement("div");
  _.className = "ab-ze-draw-rect", _.hidden = !0, f.appendChild(_);
  const w = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  w.classList.add("ab-ze-poly-svg"), w.setAttribute("viewBox", "0 0 100 100"), w.setAttribute("preserveAspectRatio", "none"), w.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:12;", f.appendChild(w);
  const z = document.createElement("div");
  z.className = "ab-ze-toolbar", f.appendChild(z);
  function Y() {
    z.innerHTML = "";
    const p = document.createElement("button");
    p.className = `ab-ze-tool-btn${s === "rect" ? " ab-ze-tool-btn--active" : ""}`, p.textContent = "▭ מלבן", p.addEventListener("click", () => {
      j("rect");
    }), z.appendChild(p);
    const g = document.createElement("button");
    g.className = `ab-ze-tool-btn${s === "polygon" ? " ab-ze-tool-btn--active" : ""}`, g.textContent = "✎ חופשי", g.addEventListener("click", () => {
      j("polygon");
    }), z.appendChild(g);
    const y = document.createElement("span");
    y.className = "ab-ze-toolbar__hint", y.textContent = s === "rect" ? "גררו לציור מלבן" : "לחצו נקודות, לחצו פעמיים לסגירה", z.appendChild(y);
  }
  t.style.position = "relative", t.appendChild(f), Y();
  function E(p, g) {
    const y = f.getBoundingClientRect();
    return {
      px: Math.max(0, Math.min(100, (p - y.left) / y.width * 100)),
      py: Math.max(0, Math.min(100, (g - y.top) / y.height * 100))
    };
  }
  function O() {
    a.forEach((p) => p.destroy()), a = [], f.querySelectorAll(".ab-ze-zone").forEach((p) => p.remove()), f.querySelectorAll(".ab-ze-panel").forEach((p) => p.remove()), r.forEach((p) => {
      const g = document.createElement("div");
      if (g.className = "ab-ze-zone", p.correct && g.classList.add("ab-ze-zone--correct"), p.id === i && g.classList.add("ab-ze-zone--selected"), g.dataset.zoneId = p.id, g.style.left = `${p.x}%`, g.style.top = `${p.y}%`, g.style.width = `${p.width}%`, g.style.height = `${p.height}%`, p.shape === "polygon" && p.points && p.points.length >= 3) {
        const $ = `clip-${p.id}`;
        g.innerHTML = `<svg class="ab-ze-zone__poly-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs><clipPath id="${$}"><polygon points="${Ku(p.points, p.x, p.y, p.width, p.height)}"/></clipPath></defs>
          <rect x="0" y="0" width="100" height="100" clip-path="url(#${$})" fill="currentColor"/>
        </svg>`, g.classList.add("ab-ze-zone--poly");
      }
      const y = document.createElement("div");
      y.className = "ab-ze-zone__badge", y.textContent = p.correct ? "✓" : "", p.label && (y.textContent = p.label), g.appendChild(y);
      const Z = document.createElement("button");
      Z.className = "ab-ze-zone__toggle", Z.textContent = p.correct ? "✓ נכון" : "✗ לא נכון", Z.title = "סמן כתשובה נכונה / לא נכונה", Z.addEventListener("pointerdown", ($) => $.stopPropagation()), Z.addEventListener("click", ($) => {
        $.stopPropagation(), p.correct = !p.correct, K(), O();
      }), g.appendChild(Z);
      const S = document.createElement("button");
      if (S.className = "ab-ze-zone__delete", S.textContent = "✕", S.title = "מחק אזור", S.addEventListener("pointerdown", ($) => $.stopPropagation()), S.addEventListener("click", ($) => {
        $.stopPropagation(), r = r.filter((I) => I.id !== p.id), i === p.id && (i = null), K(), O();
      }), g.appendChild(S), p.shape !== "polygon" && p.id === i)
        for (const $ of ["nw", "ne", "sw", "se"]) {
          const I = document.createElement("div");
          I.className = `ab-ze-zone__handle ab-ze-zone__handle--${$}`, I.dataset.handle = $, I.addEventListener("pointerdown", (T) => {
            T.stopPropagation(), T.preventDefault(), m = {
              zoneId: p.id,
              handle: $,
              origZone: { ...p },
              startX: T.clientX,
              startY: T.clientY
            };
          }), g.appendChild(I);
        }
      if (g.addEventListener("pointerdown", ($) => {
        if ($.stopPropagation(), m) return;
        i = p.id, O();
        const { px: I, py: T } = E($.clientX, $.clientY);
        d = { zoneId: p.id, offsetX: I - p.x, offsetY: T - p.y };
      }), f.appendChild(g), p.id === i) {
        const $ = document.createElement("div");
        $.className = "ab-ze-panel", $.style.left = `${p.x}%`, $.style.top = `${p.y + p.height + 1}%`;
        const I = document.createElement("div");
        I.className = "ab-ze-panel__row";
        const T = document.createElement("input");
        if (T.className = "ab-ze-panel__input", T.type = "text", T.dir = "rtl", T.placeholder = "תווית (למשל: חתול)", T.value = p.label || "", T.addEventListener("pointerdown", (W) => W.stopPropagation()), T.addEventListener("input", () => {
          p.label = T.value || void 0, K();
        }), I.appendChild(T), $.appendChild(I), o) {
          const W = document.createElement("div");
          W.className = "ab-ze-panel__row";
          const ht = document.createElement("span");
          ht.className = "ab-ze-panel__audio-label", ht.textContent = "🎤", W.appendChild(ht);
          const Ho = Jr(W, {
            gameId: o,
            voiceKey: `zone-${p.id}`,
            label: `הקלטה לאזור ${p.label || p.id}`
          });
          a.push(Ho), $.appendChild(W);
        }
        $.addEventListener("pointerdown", (W) => W.stopPropagation()), f.appendChild($);
      }
    });
  }
  function L() {
    if (w.innerHTML = "", u.length === 0) return;
    const p = [...u];
    l && p.push(l);
    const g = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    g.setAttribute("points", p.map((y) => `${y.x},${y.y}`).join(" ")), g.setAttribute("fill", "rgba(251,191,36,0.15)"), g.setAttribute("stroke", "#fbbf24"), g.setAttribute("stroke-width", "0.4"), g.setAttribute("stroke-dasharray", "1,0.5"), w.appendChild(g), u.forEach((y, Z) => {
      const S = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      S.setAttribute("cx", String(y.x)), S.setAttribute("cy", String(y.y)), S.setAttribute("r", "0.8"), S.setAttribute("fill", Z === 0 ? "#22c55e" : "#fbbf24"), S.setAttribute("stroke", "#fff"), S.setAttribute("stroke-width", "0.3"), w.appendChild(S);
    });
  }
  function j(p) {
    u.length > 0 && (u = [], l = null, L()), s = p, f.classList.toggle("ab-ze-overlay--poly-mode", p === "polygon"), Y();
  }
  function F() {
    if (!c) return;
    const p = Math.min(c.startX, c.curX), g = Math.min(c.startY, c.curY), y = Math.abs(c.curX - c.startX), Z = Math.abs(c.curY - c.startY);
    _.style.left = `${p}%`, _.style.top = `${g}%`, _.style.width = `${y}%`, _.style.height = `${Z}%`;
  }
  function re() {
    if (u.length < 3) {
      u = [], l = null, L();
      return;
    }
    const p = [...u], g = Yu(p);
    if (g.width > 1 && g.height > 1) {
      const y = {
        id: Un(),
        shape: "polygon",
        ...g,
        points: p,
        correct: !1
      };
      r.push(y), i = y.id, K();
    }
    u = [], l = null, L(), O();
  }
  function Ue(p) {
    if (p.button !== 0 || p.target.closest(".ab-ze-zone") || p.target.closest(".ab-ze-toolbar") || p.target.closest(".ab-ze-panel")) return;
    if (i = null, s === "polygon") {
      const { px: Z, py: S } = E(p.clientX, p.clientY);
      if (u.length >= 3) {
        const $ = u[0];
        if (Math.abs(Z - $.x) < 2 && Math.abs(S - $.y) < 2) {
          re();
          return;
        }
      }
      u.push({ x: Z, y: S }), L(), O();
      return;
    }
    const { px: g, py: y } = E(p.clientX, p.clientY);
    c = { startX: g, startY: y, curX: g, curY: y }, _.hidden = !1, F(), O();
  }
  function Xt(p) {
    s === "polygon" && u.length >= 3 && (p.preventDefault(), re());
  }
  function Yt(p) {
    if (s === "polygon" && u.length > 0) {
      const { px: g, py: y } = E(p.clientX, p.clientY);
      l = { x: g, y }, L();
    }
    if (c) {
      const { px: g, py: y } = E(p.clientX, p.clientY);
      c.curX = g, c.curY = y, F();
      return;
    }
    if (m) {
      p.preventDefault();
      const g = r.find((T) => T.id === m.zoneId);
      if (!g) return;
      const y = m.origZone, Z = f.getBoundingClientRect(), S = (p.clientX - m.startX) / Z.width * 100, $ = (p.clientY - m.startY) / Z.height * 100, I = m.handle;
      I.includes("e") && (g.width = Math.max(3, y.width + S)), I.includes("w") && (g.x = y.x + S, g.width = Math.max(3, y.width - S)), I.includes("s") && (g.height = Math.max(3, y.height + $)), I.includes("n") && (g.y = y.y + $, g.height = Math.max(3, y.height - $)), O();
      return;
    }
    if (d) {
      p.preventDefault();
      const g = r.find((I) => I.id === d.zoneId);
      if (!g) return;
      const { px: y, py: Z } = E(p.clientX, p.clientY), S = Math.max(0, Math.min(100 - g.width, y - d.offsetX)), $ = Math.max(0, Math.min(100 - g.height, Z - d.offsetY));
      if (g.shape === "polygon" && g.points) {
        const I = S - g.x, T = $ - g.y;
        g.points = g.points.map((W) => ({ x: W.x + I, y: W.y + T }));
      }
      g.x = S, g.y = $, O();
    }
  }
  function Kt() {
    if (c) {
      const p = Math.min(c.startX, c.curX), g = Math.min(c.startY, c.curY), y = Math.abs(c.curX - c.startX), Z = Math.abs(c.curY - c.startY);
      if (y > 3 && Z > 3) {
        const S = {
          id: Un(),
          shape: "rect",
          x: p,
          y: g,
          width: y,
          height: Z,
          correct: !1
        };
        r.push(S), i = S.id, K();
      }
      c = null, _.hidden = !0, O();
      return;
    }
    if (m) {
      m = null, K();
      return;
    }
    d && (d = null, K());
  }
  function K() {
    n(structuredClone(r));
  }
  function Gt(p) {
    if (p.key === "Escape" && u.length > 0) {
      u = [], l = null, L();
      return;
    }
    if (p.key === "Enter" && u.length >= 3) {
      re();
      return;
    }
    i && ((p.key === "Delete" || p.key === "Backspace") && (r = r.filter((g) => g.id !== i), i = null, K(), O()), p.key === "Escape" && (i = null, O()));
  }
  return f.addEventListener("pointerdown", Ue), f.addEventListener("dblclick", Xt), document.addEventListener("pointermove", Yt), document.addEventListener("pointerup", Kt), document.addEventListener("keydown", Gt), O(), {
    setZones(p) {
      r = structuredClone(p), i = null, O();
    },
    getZones() {
      return structuredClone(r);
    },
    setTool(p) {
      j(p);
    },
    destroy() {
      f.removeEventListener("pointerdown", Ue), f.removeEventListener("dblclick", Xt), document.removeEventListener("pointermove", Yt), document.removeEventListener("pointerup", Kt), document.removeEventListener("keydown", Gt), a.forEach((p) => p.destroy()), f.remove();
    }
  };
}
let Qu = 0;
function el() {
  return `tpl-zone-${Date.now()}-${Qu++}`;
}
const tl = [
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
      const t = [];
      for (let e = 0; e < 3; e++)
        for (let n = 0; n < 3; n++)
          t.push({ shape: "rect", x: 2 + n * 33, y: 2 + e * 33, width: 30, height: 30, correct: !1 });
      return t;
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
], qt = class qt extends N {
  createRenderRoot() {
    return this;
  }
  constructor() {
    super(), this._open = !1, this._onSelect = null;
  }
  open(e) {
    this._onSelect = e, this._open = !0;
  }
  _select(e) {
    var o;
    const n = e.zones.map((r) => ({ ...r, id: el() }));
    (o = this._onSelect) == null || o.call(this, n), this._open = !1;
  }
  render() {
    return this._open ? v`
      <div class="ab-tpl-backdrop" @click=${() => {
      this._open = !1;
    }}></div>
      <div class="ab-tpl-box">
        <div class="ab-tpl-header">
          <span class="ab-tpl-title">📐 בחרו תבנית</span>
          <button class="ab-ze-close" aria-label="סגור"
                  @click=${() => {
      this._open = !1;
    }}>✕</button>
        </div>
        <div class="ab-tpl-grid">
          ${tl.map((e) => v`
            <button class="ab-tpl-card" @click=${() => this._select(e)}>
              <div class="ab-tpl-card__preview">
                ${e.zones.map((n) => v`
                  <div class=${"ab-tpl-card__zone" + (n.correct ? " ab-tpl-card__zone--correct" : "")}
                       style="left:${n.x}%;top:${n.y}%;width:${n.width}%;height:${n.height}%">
                  </div>
                `)}
              </div>
              <div class="ab-tpl-card__label">
                <span class="ab-tpl-card__icon">${e.icon}</span> ${e.nameHe}
              </div>
              <div class="ab-tpl-card__desc">${e.description}</div>
            </button>
          `)}
        </div>
      </div>
    ` : v``;
  }
};
qt.properties = {
  _open: { state: !0 }
};
let Zt = qt;
customElements.define("ab-template-picker", Zt);
let We = null;
function nl() {
  return We || (We = document.createElement("ab-template-picker"), document.body.appendChild(We)), We;
}
function ol(t) {
  nl().open(t);
}
class Tl {
  constructor(e, n, o = {}) {
    this._mode = "play", this._overlay = null, this._navigator = null, this._inspector = null, this._toolbar = null, this._selectedId = null, this._undoBtn = null, this._redoBtn = null, this._shortcutHandler = null, this._zoneEditor = null, this._zoneModal = null, this._container = e, this._gameData = n, this._restartGame = o.restartGame, this._roundSchema = o.roundSchema, requestAnimationFrame(() => this._injectToolbar());
  }
  // ── Toolbar ───────────────────────────────────────────────────────────────
  _injectToolbar() {
    const e = this._container.querySelector(".game-header__spacer");
    e && (this._toolbar = document.createElement("div"), this._toolbar.className = "ab-editor-toolbar", this._toolbar.append(
      this._makeBtn("✏️ ערוך", "ab-editor-btn--edit", () => this.enterEditMode()),
      this._makeBtn("🎤 קול", "ab-editor-btn--audio", () => this._openAudioManager())
    ), e.innerHTML = "", e.appendChild(this._toolbar));
  }
  _makeBtn(e, n, o) {
    const r = document.createElement("button");
    return r.className = `ab-editor-btn ${n}`, r.innerHTML = e, r.addEventListener("click", o), r;
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
      this._makeBtn("⬇ ייצוא", "ab-editor-btn--export", () => Hu(this._gameData))
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
    const e = this._container.querySelector(".game-body");
    if (!e) return;
    this._overlay = Qr(e), this._overlay.show(), this._navigator = ei(this._container, this._gameData, {
      onSelectRound: (o) => this._selectRound(o),
      onAddRound: (o) => this._addRound(o),
      onDuplicateRound: (o) => this._duplicateRound(o),
      onMoveRound: (o, r) => this._moveRound(o, r)
    }), this._inspector = Mu(this._container, {
      onFieldChange: (o, r, i) => this._onFieldChange(o, r, i),
      onDeleteRound: (o) => this._deleteRound(o),
      roundSchema: this._roundSchema
    });
    const n = this._gameData.rounds;
    n.length > 0 && this._selectRound(n[0].id);
  }
  enterPlayMode() {
    var e, n, o, r;
    this._mode !== "play" && (this._mode = "play", this._container.classList.remove("ab-editor-active"), this._setToolbarPlayMode(), this._detachShortcuts(), this._closeZoneEditor(), (e = this._overlay) == null || e.destroy(), (n = this._navigator) == null || n.destroy(), (o = this._inspector) == null || o.destroy(), this._overlay = this._navigator = this._inspector = null, this._selectedId = null, (r = this._restartGame) == null || r.call(this, this._container));
  }
  // ── Round management ──────────────────────────────────────────────────────
  _selectRound(e) {
    var o, r;
    this._selectedId = e, (o = this._navigator) == null || o.setActiveRound(e);
    const n = this._gameData.getRound(e);
    n && ((r = this._inspector) == null || r.loadRound(n, this._gameData.meta.type));
  }
  _addRound(e = null) {
    var o;
    const n = this._gameData.addRound(e ?? this._selectedId);
    (o = this._navigator) == null || o.refresh(), this._selectRound(n), this._refreshUndoButtons();
  }
  _duplicateRound(e) {
    var o;
    const n = this._gameData.duplicateRound(e ?? this._selectedId);
    n && ((o = this._navigator) == null || o.refresh(), this._selectRound(n), this._refreshUndoButtons());
  }
  _deleteRound(e) {
    var o;
    this._gameData.removeRound(e), (o = this._navigator) == null || o.refresh();
    const n = this._gameData.rounds;
    n.length > 0 && this._selectRound(n[0].id), this._refreshUndoButtons();
  }
  _moveRound(e, n) {
    var o, r;
    this._gameData.moveRound(e, n), (o = this._navigator) == null || o.refresh(), (r = this._navigator) == null || r.setActiveRound(e), this._refreshUndoButtons();
  }
  _onFieldChange(e, n, o) {
    var r, i;
    this._gameData.updateRound(e, { [n]: o }), (r = this._navigator) == null || r.refresh(), (i = this._navigator) == null || i.setActiveRound(e), this._refreshUndoButtons();
  }
  // ── Undo / Redo ───────────────────────────────────────────────────────────
  _undo() {
    var e;
    this._gameData.canUndo && (this._gameData.undo(), (e = this._navigator) == null || e.refresh(), this._resyncSelection(), this._refreshUndoButtons(), this._showToast("↩ בוטל"));
  }
  _redo() {
    var e;
    this._gameData.canRedo && (this._gameData.redo(), (e = this._navigator) == null || e.refresh(), this._resyncSelection(), this._refreshUndoButtons(), this._showToast("↪ בוצע שנית"));
  }
  _resyncSelection() {
    var o;
    const e = this._gameData.rounds, n = e.find((r) => r.id === this._selectedId);
    this._selectRound(n ? this._selectedId : (o = e[0]) == null ? void 0 : o.id);
  }
  _refreshUndoButtons() {
    this._undoBtn && (this._undoBtn.disabled = !this._gameData.canUndo), this._redoBtn && (this._redoBtn.disabled = !this._gameData.canRedo);
  }
  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  _attachShortcuts() {
    this._shortcutHandler = (e) => {
      if (this._mode !== "edit") return;
      const n = e.ctrlKey || e.metaKey;
      if (e.key === "Escape") {
        this.enterPlayMode();
        return;
      }
      if (n && !e.shiftKey && e.key.toLowerCase() === "s") {
        e.preventDefault(), this._save();
        return;
      }
      if (n && !e.shiftKey && e.key.toLowerCase() === "z") {
        e.preventDefault(), this._undo();
        return;
      }
      if (n && (e.key.toLowerCase() === "y" || e.shiftKey && e.key.toLowerCase() === "z")) {
        e.preventDefault(), this._redo();
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
    const e = this._gameData.getRound(this._selectedId);
    if (!e) return;
    if (!e.image) {
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
    c.className = "ab-ze-img", c.src = e.image, c.alt = "", c.draggable = !1, a.appendChild(c), r.appendChild(a);
    const u = document.createElement("div");
    u.className = "ab-ze-footer";
    const l = document.createElement("button");
    l.className = "ab-editor-btn ab-editor-btn--zones", l.textContent = "📐 תבנית", l.addEventListener("click", () => {
      ol((f) => {
        var _;
        this._selectedId && (this._gameData.updateRound(this._selectedId, { zones: f }), this._refreshUndoButtons(), (_ = this._zoneEditor) == null || _.setZones(f));
      });
    }), u.appendChild(l);
    const d = document.createElement("button");
    d.className = "ab-editor-btn ab-editor-btn--play", d.textContent = "✓ סיום", d.addEventListener("click", () => this._closeZoneEditor()), u.appendChild(d), r.appendChild(u), n.appendChild(r), document.body.appendChild(n), this._zoneModal = n, c.onload = () => {
      const f = e.zones ?? [];
      this._zoneEditor = Gu(a, f, {
        gameId: this._gameData.id,
        onChange: (_) => {
          this._selectedId && (this._gameData.updateRound(this._selectedId, { zones: _ }), this._refreshUndoButtons());
        }
      });
    }, c.complete && c.naturalWidth > 0 && ((m = c.onload) == null || m.call(c, new Event("load"))), o.addEventListener("click", () => this._closeZoneEditor());
  }
  _closeZoneEditor() {
    var e, n;
    (e = this._zoneEditor) == null || e.destroy(), this._zoneEditor = null, (n = this._zoneModal) == null || n.remove(), this._zoneModal = null;
  }
  // ── Helpers ───────────────────────────────────────────────────────────────
  _openAudioManager() {
    qu(this._gameData.id, this._gameData);
  }
  _save() {
    Bu(this._gameData), this._showToast("✅ נשמר!");
  }
  _showToast(e) {
    const n = document.createElement("div");
    n.className = "ab-editor-toast", n.textContent = e, document.body.appendChild(n), setTimeout(() => n.remove(), 2200);
  }
}
export {
  tl as ACTIVITY_TEMPLATES,
  Ln as BUILTIN_ROUND_SCHEMAS,
  Jt as BaseRoundSchema,
  Du as DragMatchRoundSchema,
  Vo as EventBus,
  it as GameData,
  Cl as GameDataSchema,
  Tl as GameEditor,
  Lu as GameMetaSchema,
  il as GameShell,
  qo as GameState,
  ju as MultipleChoiceRoundSchema,
  Pu as PointSchema,
  Ou as ZoneSchema,
  Uu as ZoneTapRoundSchema,
  Qo as addNikud,
  Xn as animate,
  Il as clearGameData,
  Al as createAppShell,
  Kr as createDragSource,
  Gr as createDropTarget,
  wl as createFeedback,
  Ir as createLocalState,
  Rl as createNikudBox,
  vl as createOptionCards,
  yl as createProgressBar,
  ul as createRoundManager,
  ll as createSpeechListener,
  Jr as createVoiceRecordButton,
  jr as createVoiceRecorder,
  kl as createZone,
  Gu as createZoneEditor,
  Sl as createZonePlayer,
  Mr as deleteVoice,
  Hu as exportGameDataAsJSON,
  fl as getLetter,
  Fr as getLettersByGroup,
  er as getNikud,
  pl as hasVoice,
  Xe as hebrewLetters,
  El as hideLoadingScreen,
  xl as injectHeaderButton,
  Or as isVoiceRecordingSupported,
  gl as letterWithNikud,
  hl as listVoiceKeys,
  Zl as loadGameData,
  Pt as loadVoice,
  dl as matchNikudSound,
  _l as nikudBaseLetters,
  Ie as nikudList,
  Re as playVoice,
  sl as preloadNikud,
  ml as randomLetters,
  bl as randomNikud,
  Bu as saveGameData,
  Ur as saveVoice,
  Nu as schemaToFields,
  qu as showAudioManager,
  Zr as showCompletionScreen,
  zl as showLoadingScreen,
  $l as showNikudSettingsDialog,
  ol as showTemplatePicker,
  Ye as sounds,
  ur as tts
};
