var Mo = Object.defineProperty;
var Do = (e, t, n) => t in e ? Mo(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n;
var W = (e, t, n) => Do(e, typeof t != "symbol" ? t + "" : t, n);
class Uo {
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
class Bo {
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
class Gu {
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
    }, this.events = new Uo(), this.state = new Bo(this.config.totalRounds), this._buildShell();
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
let xe = null;
function Fo() {
  if (!xe)
    try {
      xe = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      return null;
    }
  return xe.state === "suspended" && xe.resume(), xe;
}
function me(e, t, n = "sine", o = 0.3) {
  const r = Fo();
  if (r)
    try {
      const i = r.createOscillator(), s = r.createGain();
      i.connect(s), s.connect(r.destination), i.type = n, i.frequency.setValueAtTime(e, r.currentTime), s.gain.setValueAtTime(o, r.currentTime), s.gain.exponentialRampToValueAtTime(1e-3, r.currentTime + t), i.start(r.currentTime), i.stop(r.currentTime + t + 0.05);
    } catch {
    }
}
const Ge = {
  /** צליל תשובה נכונה */
  correct() {
    me(523.25, 0.15), setTimeout(() => me(659.25, 0.2), 120), setTimeout(() => me(783.99, 0.3), 240);
  },
  /** צליל עידוד עדין — נסה שוב */
  wrong() {
    me(350, 0.15, "triangle", 0.12);
  },
  /** צליל עידוד - סיום מוצלח */
  cheer() {
    [523.25, 587.33, 659.25, 698.46, 783.99, 1046.5].forEach((t, n) => setTimeout(() => me(t, 0.2), n * 90));
  },
  /** קליק עדין */
  click() {
    me(900, 0.04, "sine", 0.12);
  }
}, Jt = "https://nakdan-u1-0.loadbalancer.dicta.org.il/api";
let Wt = !1;
const Te = /* @__PURE__ */ new Map();
function Ho() {
  var r;
  if (typeof window > "u") return Jt;
  const e = new URLSearchParams(window.location.search).get("nakdanProxy"), t = window.ALEFBET_NAKDAN_PROXY_URL;
  if (e && window.localStorage)
    try {
      window.localStorage.setItem("alefbet.nakdanProxyUrl", e);
    } catch {
    }
  const n = (r = window.localStorage) == null ? void 0 : r.getItem("alefbet.nakdanProxyUrl"), o = e || t || n;
  return o || (window.location.hostname.endsWith("github.io") ? null : Jt);
}
function Jo(e) {
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
async function Wo(e) {
  const t = Ho();
  if (!t)
    throw Wt || (Wt = !0, console.warn("[nakdan] Dicta API blocked by CORS on GitHub Pages. Configure a proxy URL via ?nakdanProxy=..., window.ALEFBET_NAKDAN_PROXY_URL, or localStorage key alefbet.nakdanProxyUrl.")), new Error("Nakdan unavailable without proxy on this host");
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
  return Jo(r);
}
async function Vo(e) {
  if (!(e != null && e.trim())) return e ?? "";
  if (Te.has(e)) return Te.get(e);
  try {
    const t = await Wo(e);
    return Te.set(e, t), t;
  } catch {
    return Te.set(e, e), e;
  }
}
function qo(e) {
  return Te.get(e) ?? e ?? "";
}
async function Qu(e) {
  const t = [...new Set(e.filter((n) => n == null ? void 0 : n.trim()))];
  await Promise.all(t.map((n) => Vo(n)));
}
let be = [], Xe = !1, In = !0, ve = 0.9, Vt = typeof localStorage < "u" && parseFloat(localStorage.getItem("alefbet.nikudRate")) || 0.5, mt = !1, Ae = null;
function qt(e, t, n, o = t) {
  console.warn(`[tts] ${e} TTS failed`, { text: t, sentText: o, reason: n }), typeof window < "u" && typeof window.dispatchEvent == "function" && window.dispatchEvent(new CustomEvent("alefbet:tts-error", {
    detail: { provider: e, text: t, sentText: o, reason: n }
  }));
}
function Xo(e) {
  return (e || "").replace(/[\u0591-\u05C7]/g, "");
}
function Yo(e) {
  const t = String(e || "").toLowerCase();
  return t.includes("didn't interact") || t.includes("notallowed");
}
function Ko() {
  var e;
  return typeof window > "u" || typeof document > "u" ? Promise.resolve() : mt || (e = document.userActivation) != null && e.hasBeenActive ? (mt = !0, Promise.resolve()) : Ae || (Ae = new Promise((t) => {
    const n = () => {
      mt = !0, window.removeEventListener("pointerdown", n, !0), window.removeEventListener("keydown", n, !0), window.removeEventListener("touchstart", n, !0), t();
    };
    window.addEventListener("pointerdown", n, { once: !0, capture: !0 }), window.addEventListener("keydown", n, { once: !0, capture: !0 }), window.addEventListener("touchstart", n, { once: !0, capture: !0 });
  }).finally(() => {
    Ae = null;
  }), Ae);
}
function Go(e, t, n) {
  const r = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(e)}&tl=he&client=tw-ob`, i = new Audio(r);
  i.playbackRate = ve, i.onended = t, i.onerror = () => n("audio.onerror"), i.play().catch((s) => {
    n((s == null ? void 0 : s.message) || "audio.play() rejected");
  });
}
function Qo(e) {
  return new Promise((t, n) => {
    const o = Xo(e).trim() || e;
    let r = !1, i = !1;
    const s = () => {
      r || (r = !0, t());
    }, a = (u) => {
      r || (r = !0, n(u));
    }, c = () => {
      try {
        Go(o, s, (u) => {
          if (!i && Yo(u)) {
            i = !0, Ko().then(() => {
              r || c();
            });
            return;
          }
          qt("google", e, u, o), a(u);
        });
      } catch (u) {
        qt("google", e, (u == null ? void 0 : u.message) || "Audio() construction failed", o), a(u == null ? void 0 : u.message);
      }
    };
    c();
  });
}
let $t = null;
function er() {
  const e = speechSynthesis.getVoices();
  return e.find((t) => t.lang === "he-IL") || e.find((t) => t.lang === "iw-IL") || e.find((t) => t.lang.startsWith("he")) || null;
}
function Xt() {
  $t = er();
}
typeof speechSynthesis < "u" && (speechSynthesis.getVoices().length > 0 ? Xt() : speechSynthesis.addEventListener("voiceschanged", Xt, { once: !0 }));
function tr(e) {
  return new Promise((t) => {
    if (typeof speechSynthesis > "u") {
      t();
      return;
    }
    const n = new SpeechSynthesisUtterance(e);
    n.lang = "he-IL", n.rate = ve, $t && (n.voice = $t), n.onend = t, n.onerror = t, speechSynthesis.speak(n);
  });
}
async function nr(e) {
  if (In)
    try {
      await Qo(e);
      return;
    } catch {
      console.info("[tts] Falling back to browser Speech API");
    }
  await tr(e);
}
function Et() {
  if (Xe || be.length === 0) return;
  const e = be.shift();
  Xe = !0, nr(e.text).then(() => {
    Xe = !1, e.resolve(), Et();
  });
}
const or = {
  /**
   * הקרא טקסט עברי
   * משתמש ב-Google Translate TTS לאיכות טובה יותר
   */
  speak(e) {
    const t = qo(e);
    return new Promise((n) => {
      be.push({ text: t, resolve: n }), Et();
    });
  },
  /** עצור את הדיבור הנוכחי */
  cancel() {
    be.forEach((e) => e.resolve()), be = [], Xe = !1, typeof speechSynthesis < "u" && speechSynthesis.cancel();
  },
  get available() {
    return !0;
  },
  /** הגדר מהירות דיבור (0.5–2.0) */
  setRate(e) {
    ve = Math.max(0.5, Math.min(2, e));
  },
  /** השתמש ב-Google Translate TTS (ברירת מחדל) או בדפדפן */
  useGoogle(e = !0) {
    In = e;
  },
  /**
   * הגדר מהירות דיבור להדגשת ניקוד
   * @param {{ rate?: number }} opts
   *   rate: מהירות דיבור להדגשה (ברירת מחדל 0.5)
   */
  setNikudEmphasis({ rate: e } = {}) {
    e != null && (Vt = Math.max(0.3, Math.min(1.5, e)));
  },
  /**
   * הקרא אות עם ניקוד באיטיות להדגשת התנועה
   * @param {string} letter - האות (למשל 'ב')
   * @param {string} nikudSymbol - סמל הניקוד (למשל '\u05B7')
   */
  speakNikud(e, t) {
    const n = e + t, o = ve;
    return ve = Vt, new Promise((r) => {
      be.push({ text: n, resolve: r }), Et();
    }).finally(() => {
      ve = o;
    });
  }
};
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ye = globalThis, Zt = Ye.ShadowRoot && (Ye.ShadyCSS === void 0 || Ye.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Pn = Symbol(), Yt = /* @__PURE__ */ new WeakMap();
let rr = class {
  constructor(t, n, o) {
    if (this._$cssResult$ = !0, o !== Pn) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = n;
  }
  get styleSheet() {
    let t = this.o;
    const n = this.t;
    if (Zt && t === void 0) {
      const o = n !== void 0 && n.length === 1;
      o && (t = Yt.get(n)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), o && Yt.set(n, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const ir = (e) => new rr(typeof e == "string" ? e : e + "", void 0, Pn), sr = (e, t) => {
  if (Zt) e.adoptedStyleSheets = t.map((n) => n instanceof CSSStyleSheet ? n : n.styleSheet);
  else for (const n of t) {
    const o = document.createElement("style"), r = Ye.litNonce;
    r !== void 0 && o.setAttribute("nonce", r), o.textContent = n.cssText, e.appendChild(o);
  }
}, Kt = Zt ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((t) => {
  let n = "";
  for (const o of t.cssRules) n += o.cssText;
  return ir(n);
})(e) : e;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: ar, defineProperty: cr, getOwnPropertyDescriptor: ur, getOwnPropertyNames: lr, getOwnPropertySymbols: dr, getPrototypeOf: hr } = Object, re = globalThis, Gt = re.trustedTypes, pr = Gt ? Gt.emptyScript : "", _t = re.reactiveElementPolyfillSupport, Pe = (e, t) => e, St = { toAttribute(e, t) {
  switch (t) {
    case Boolean:
      e = e ? pr : null;
      break;
    case Object:
    case Array:
      e = e == null ? e : JSON.stringify(e);
  }
  return e;
}, fromAttribute(e, t) {
  let n = e;
  switch (t) {
    case Boolean:
      n = e !== null;
      break;
    case Number:
      n = e === null ? null : Number(e);
      break;
    case Object:
    case Array:
      try {
        n = JSON.parse(e);
      } catch {
        n = null;
      }
  }
  return n;
} }, On = (e, t) => !ar(e, t), Qt = { attribute: !0, type: String, converter: St, reflect: !1, useDefault: !1, hasChanged: On };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), re.litPropertyMetadata ?? (re.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let ge = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ?? (this.l = [])).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, n = Qt) {
    if (n.state && (n.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((n = Object.create(n)).wrapped = !0), this.elementProperties.set(t, n), !n.noAccessor) {
      const o = Symbol(), r = this.getPropertyDescriptor(t, o, n);
      r !== void 0 && cr(this.prototype, t, r);
    }
  }
  static getPropertyDescriptor(t, n, o) {
    const { get: r, set: i } = ur(this.prototype, t) ?? { get() {
      return this[n];
    }, set(s) {
      this[n] = s;
    } };
    return { get: r, set(s) {
      const a = r == null ? void 0 : r.call(this);
      i == null || i.call(this, s), this.requestUpdate(t, a, o);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? Qt;
  }
  static _$Ei() {
    if (this.hasOwnProperty(Pe("elementProperties"))) return;
    const t = hr(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(Pe("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(Pe("properties"))) {
      const n = this.properties, o = [...lr(n), ...dr(n)];
      for (const r of o) this.createProperty(r, n[r]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const n = litPropertyMetadata.get(t);
      if (n !== void 0) for (const [o, r] of n) this.elementProperties.set(o, r);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [n, o] of this.elementProperties) {
      const r = this._$Eu(n, o);
      r !== void 0 && this._$Eh.set(r, n);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const n = [];
    if (Array.isArray(t)) {
      const o = new Set(t.flat(1 / 0).reverse());
      for (const r of o) n.unshift(Kt(r));
    } else t !== void 0 && n.push(Kt(t));
    return n;
  }
  static _$Eu(t, n) {
    const o = n.attribute;
    return o === !1 ? void 0 : typeof o == "string" ? o : typeof t == "string" ? t.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    var t;
    this._$ES = new Promise((n) => this.enableUpdating = n), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), (t = this.constructor.l) == null || t.forEach((n) => n(this));
  }
  addController(t) {
    var n;
    (this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(t), this.renderRoot !== void 0 && this.isConnected && ((n = t.hostConnected) == null || n.call(t));
  }
  removeController(t) {
    var n;
    (n = this._$EO) == null || n.delete(t);
  }
  _$E_() {
    const t = /* @__PURE__ */ new Map(), n = this.constructor.elementProperties;
    for (const o of n.keys()) this.hasOwnProperty(o) && (t.set(o, this[o]), delete this[o]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return sr(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    var t;
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), (t = this._$EO) == null || t.forEach((n) => {
      var o;
      return (o = n.hostConnected) == null ? void 0 : o.call(n);
    });
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    var t;
    (t = this._$EO) == null || t.forEach((n) => {
      var o;
      return (o = n.hostDisconnected) == null ? void 0 : o.call(n);
    });
  }
  attributeChangedCallback(t, n, o) {
    this._$AK(t, o);
  }
  _$ET(t, n) {
    var i;
    const o = this.constructor.elementProperties.get(t), r = this.constructor._$Eu(t, o);
    if (r !== void 0 && o.reflect === !0) {
      const s = (((i = o.converter) == null ? void 0 : i.toAttribute) !== void 0 ? o.converter : St).toAttribute(n, o.type);
      this._$Em = t, s == null ? this.removeAttribute(r) : this.setAttribute(r, s), this._$Em = null;
    }
  }
  _$AK(t, n) {
    var i, s;
    const o = this.constructor, r = o._$Eh.get(t);
    if (r !== void 0 && this._$Em !== r) {
      const a = o.getPropertyOptions(r), c = typeof a.converter == "function" ? { fromAttribute: a.converter } : ((i = a.converter) == null ? void 0 : i.fromAttribute) !== void 0 ? a.converter : St;
      this._$Em = r;
      const u = c.fromAttribute(n, a.type);
      this[r] = u ?? ((s = this._$Ej) == null ? void 0 : s.get(r)) ?? u, this._$Em = null;
    }
  }
  requestUpdate(t, n, o, r = !1, i) {
    var s;
    if (t !== void 0) {
      const a = this.constructor;
      if (r === !1 && (i = this[t]), o ?? (o = a.getPropertyOptions(t)), !((o.hasChanged ?? On)(i, n) || o.useDefault && o.reflect && i === ((s = this._$Ej) == null ? void 0 : s.get(t)) && !this.hasAttribute(a._$Eu(t, o)))) return;
      this.C(t, n, o);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, n, { useDefault: o, reflect: r, wrapped: i }, s) {
    o && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(t) && (this._$Ej.set(t, s ?? n ?? this[t]), i !== !0 || s !== void 0) || (this._$AL.has(t) || (this.hasUpdated || o || (n = void 0), this._$AL.set(t, n)), r === !0 && this._$Em !== t && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(t));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (n) {
      Promise.reject(n);
    }
    const t = this.scheduleUpdate();
    return t != null && await t, !this.isUpdatePending;
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
    let t = !1;
    const n = this._$AL;
    try {
      t = this.shouldUpdate(n), t ? (this.willUpdate(n), (o = this._$EO) == null || o.forEach((r) => {
        var i;
        return (i = r.hostUpdate) == null ? void 0 : i.call(r);
      }), this.update(n)) : this._$EM();
    } catch (r) {
      throw t = !1, this._$EM(), r;
    }
    t && this._$AE(n);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    var n;
    (n = this._$EO) == null || n.forEach((o) => {
      var r;
      return (r = o.hostUpdated) == null ? void 0 : r.call(o);
    }), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
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
  shouldUpdate(t) {
    return !0;
  }
  update(t) {
    this._$Eq && (this._$Eq = this._$Eq.forEach((n) => this._$ET(n, this[n]))), this._$EM();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
};
ge.elementStyles = [], ge.shadowRootOptions = { mode: "open" }, ge[Pe("elementProperties")] = /* @__PURE__ */ new Map(), ge[Pe("finalized")] = /* @__PURE__ */ new Map(), _t == null || _t({ ReactiveElement: ge }), (re.reactiveElementVersions ?? (re.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Oe = globalThis, en = (e) => e, Qe = Oe.trustedTypes, tn = Qe ? Qe.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, Ln = "$lit$", oe = `lit$${Math.random().toFixed(9).slice(2)}$`, jn = "?" + oe, fr = `<${jn}>`, pe = document, je = () => pe.createComment(""), Me = (e) => e === null || typeof e != "object" && typeof e != "function", Tt = Array.isArray, mr = (e) => Tt(e) || typeof (e == null ? void 0 : e[Symbol.iterator]) == "function", gt = `[ 	
\f\r]`, Ne = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, nn = /-->/g, on = />/g, ue = RegExp(`>|${gt}(?:([^\\s"'>=/]+)(${gt}*=${gt}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), rn = /'/g, sn = /"/g, Mn = /^(?:script|style|textarea|title)$/i, _r = (e) => (t, ...n) => ({ _$litType$: e, strings: t, values: n }), T = _r(1), $e = Symbol.for("lit-noChange"), U = Symbol.for("lit-nothing"), an = /* @__PURE__ */ new WeakMap(), le = pe.createTreeWalker(pe, 129);
function Dn(e, t) {
  if (!Tt(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return tn !== void 0 ? tn.createHTML(t) : t;
}
const gr = (e, t) => {
  const n = e.length - 1, o = [];
  let r, i = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", s = Ne;
  for (let a = 0; a < n; a++) {
    const c = e[a];
    let u, l, d = -1, m = 0;
    for (; m < c.length && (s.lastIndex = m, l = s.exec(c), l !== null); ) m = s.lastIndex, s === Ne ? l[1] === "!--" ? s = nn : l[1] !== void 0 ? s = on : l[2] !== void 0 ? (Mn.test(l[2]) && (r = RegExp("</" + l[2], "g")), s = ue) : l[3] !== void 0 && (s = ue) : s === ue ? l[0] === ">" ? (s = r ?? Ne, d = -1) : l[1] === void 0 ? d = -2 : (d = s.lastIndex - l[2].length, u = l[1], s = l[3] === void 0 ? ue : l[3] === '"' ? sn : rn) : s === sn || s === rn ? s = ue : s === nn || s === on ? s = Ne : (s = ue, r = void 0);
    const f = s === ue && e[a + 1].startsWith("/>") ? " " : "";
    i += s === Ne ? c + fr : d >= 0 ? (o.push(u), c.slice(0, d) + Ln + c.slice(d) + oe + f) : c + oe + (d === -2 ? a : f);
  }
  return [Dn(e, i + (e[n] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), o];
};
class De {
  constructor({ strings: t, _$litType$: n }, o) {
    let r;
    this.parts = [];
    let i = 0, s = 0;
    const a = t.length - 1, c = this.parts, [u, l] = gr(t, n);
    if (this.el = De.createElement(u, o), le.currentNode = this.el.content, n === 2 || n === 3) {
      const d = this.el.content.firstChild;
      d.replaceWith(...d.childNodes);
    }
    for (; (r = le.nextNode()) !== null && c.length < a; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) for (const d of r.getAttributeNames()) if (d.endsWith(Ln)) {
          const m = l[s++], f = r.getAttribute(d).split(oe), _ = /([.?@])?(.*)/.exec(m);
          c.push({ type: 1, index: i, name: _[2], strings: f, ctor: _[1] === "." ? vr : _[1] === "?" ? yr : _[1] === "@" ? wr : ct }), r.removeAttribute(d);
        } else d.startsWith(oe) && (c.push({ type: 6, index: i }), r.removeAttribute(d));
        if (Mn.test(r.tagName)) {
          const d = r.textContent.split(oe), m = d.length - 1;
          if (m > 0) {
            r.textContent = Qe ? Qe.emptyScript : "";
            for (let f = 0; f < m; f++) r.append(d[f], je()), le.nextNode(), c.push({ type: 2, index: ++i });
            r.append(d[m], je());
          }
        }
      } else if (r.nodeType === 8) if (r.data === jn) c.push({ type: 2, index: i });
      else {
        let d = -1;
        for (; (d = r.data.indexOf(oe, d + 1)) !== -1; ) c.push({ type: 7, index: i }), d += oe.length - 1;
      }
      i++;
    }
  }
  static createElement(t, n) {
    const o = pe.createElement("template");
    return o.innerHTML = t, o;
  }
}
function Ee(e, t, n = e, o) {
  var s, a;
  if (t === $e) return t;
  let r = o !== void 0 ? (s = n._$Co) == null ? void 0 : s[o] : n._$Cl;
  const i = Me(t) ? void 0 : t._$litDirective$;
  return (r == null ? void 0 : r.constructor) !== i && ((a = r == null ? void 0 : r._$AO) == null || a.call(r, !1), i === void 0 ? r = void 0 : (r = new i(e), r._$AT(e, n, o)), o !== void 0 ? (n._$Co ?? (n._$Co = []))[o] = r : n._$Cl = r), r !== void 0 && (t = Ee(e, r._$AS(e, t.values), r, o)), t;
}
class br {
  constructor(t, n) {
    this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = n;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t) {
    const { el: { content: n }, parts: o } = this._$AD, r = ((t == null ? void 0 : t.creationScope) ?? pe).importNode(n, !0);
    le.currentNode = r;
    let i = le.nextNode(), s = 0, a = 0, c = o[0];
    for (; c !== void 0; ) {
      if (s === c.index) {
        let u;
        c.type === 2 ? u = new Fe(i, i.nextSibling, this, t) : c.type === 1 ? u = new c.ctor(i, c.name, c.strings, this, t) : c.type === 6 && (u = new kr(i, this, t)), this._$AV.push(u), c = o[++a];
      }
      s !== (c == null ? void 0 : c.index) && (i = le.nextNode(), s++);
    }
    return le.currentNode = pe, r;
  }
  p(t) {
    let n = 0;
    for (const o of this._$AV) o !== void 0 && (o.strings !== void 0 ? (o._$AI(t, o, n), n += o.strings.length - 2) : o._$AI(t[n])), n++;
  }
}
class Fe {
  get _$AU() {
    var t;
    return ((t = this._$AM) == null ? void 0 : t._$AU) ?? this._$Cv;
  }
  constructor(t, n, o, r) {
    this.type = 2, this._$AH = U, this._$AN = void 0, this._$AA = t, this._$AB = n, this._$AM = o, this.options = r, this._$Cv = (r == null ? void 0 : r.isConnected) ?? !0;
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const n = this._$AM;
    return n !== void 0 && (t == null ? void 0 : t.nodeType) === 11 && (t = n.parentNode), t;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, n = this) {
    t = Ee(this, t, n), Me(t) ? t === U || t == null || t === "" ? (this._$AH !== U && this._$AR(), this._$AH = U) : t !== this._$AH && t !== $e && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : mr(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== U && Me(this._$AH) ? this._$AA.nextSibling.data = t : this.T(pe.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    var i;
    const { values: n, _$litType$: o } = t, r = typeof o == "number" ? this._$AC(t) : (o.el === void 0 && (o.el = De.createElement(Dn(o.h, o.h[0]), this.options)), o);
    if (((i = this._$AH) == null ? void 0 : i._$AD) === r) this._$AH.p(n);
    else {
      const s = new br(r, this), a = s.u(this.options);
      s.p(n), this.T(a), this._$AH = s;
    }
  }
  _$AC(t) {
    let n = an.get(t.strings);
    return n === void 0 && an.set(t.strings, n = new De(t)), n;
  }
  k(t) {
    Tt(this._$AH) || (this._$AH = [], this._$AR());
    const n = this._$AH;
    let o, r = 0;
    for (const i of t) r === n.length ? n.push(o = new Fe(this.O(je()), this.O(je()), this, this.options)) : o = n[r], o._$AI(i), r++;
    r < n.length && (this._$AR(o && o._$AB.nextSibling, r), n.length = r);
  }
  _$AR(t = this._$AA.nextSibling, n) {
    var o;
    for ((o = this._$AP) == null ? void 0 : o.call(this, !1, !0, n); t !== this._$AB; ) {
      const r = en(t).nextSibling;
      en(t).remove(), t = r;
    }
  }
  setConnected(t) {
    var n;
    this._$AM === void 0 && (this._$Cv = t, (n = this._$AP) == null || n.call(this, t));
  }
}
class ct {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, n, o, r, i) {
    this.type = 1, this._$AH = U, this._$AN = void 0, this.element = t, this.name = n, this._$AM = r, this.options = i, o.length > 2 || o[0] !== "" || o[1] !== "" ? (this._$AH = Array(o.length - 1).fill(new String()), this.strings = o) : this._$AH = U;
  }
  _$AI(t, n = this, o, r) {
    const i = this.strings;
    let s = !1;
    if (i === void 0) t = Ee(this, t, n, 0), s = !Me(t) || t !== this._$AH && t !== $e, s && (this._$AH = t);
    else {
      const a = t;
      let c, u;
      for (t = i[0], c = 0; c < i.length - 1; c++) u = Ee(this, a[o + c], n, c), u === $e && (u = this._$AH[c]), s || (s = !Me(u) || u !== this._$AH[c]), u === U ? t = U : t !== U && (t += (u ?? "") + i[c + 1]), this._$AH[c] = u;
    }
    s && !r && this.j(t);
  }
  j(t) {
    t === U ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class vr extends ct {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === U ? void 0 : t;
  }
}
class yr extends ct {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== U);
  }
}
class wr extends ct {
  constructor(t, n, o, r, i) {
    super(t, n, o, r, i), this.type = 5;
  }
  _$AI(t, n = this) {
    if ((t = Ee(this, t, n, 0) ?? U) === $e) return;
    const o = this._$AH, r = t === U && o !== U || t.capture !== o.capture || t.once !== o.once || t.passive !== o.passive, i = t !== U && (o === U || r);
    r && this.element.removeEventListener(this.name, this, o), i && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    var n;
    typeof this._$AH == "function" ? this._$AH.call(((n = this.options) == null ? void 0 : n.host) ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class kr {
  constructor(t, n, o) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = n, this.options = o;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    Ee(this, t);
  }
}
const bt = Oe.litHtmlPolyfillSupport;
bt == null || bt(De, Fe), (Oe.litHtmlVersions ?? (Oe.litHtmlVersions = [])).push("3.3.2");
const $r = (e, t, n) => {
  const o = (n == null ? void 0 : n.renderBefore) ?? t;
  let r = o._$litPart$;
  if (r === void 0) {
    const i = (n == null ? void 0 : n.renderBefore) ?? null;
    o._$litPart$ = r = new Fe(t.insertBefore(je(), i), i, void 0, n ?? {});
  }
  return r._$AI(e), r;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const he = globalThis;
class B extends ge {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    var n;
    const t = super.createRenderRoot();
    return (n = this.renderOptions).renderBefore ?? (n.renderBefore = t.firstChild), t;
  }
  update(t) {
    const n = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = $r(n, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    var t;
    super.connectedCallback(), (t = this._$Do) == null || t.setConnected(!0);
  }
  disconnectedCallback() {
    var t;
    super.disconnectedCallback(), (t = this._$Do) == null || t.setConnected(!1);
  }
  render() {
    return $e;
  }
}
var Rn;
B._$litElement$ = !0, B.finalized = !0, (Rn = he.litElementHydrateSupport) == null || Rn.call(he, { LitElement: B });
const vt = he.litElementPolyfillSupport;
vt == null || vt({ LitElement: B });
(he.litElementVersions ?? (he.litElementVersions = [])).push("4.2.2");
const cn = {
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
}, Er = {
  shake: 420,
  bounce: 480,
  pulse: 600,
  fadeIn: 320,
  confetti: 700
};
function Un(e, t) {
  !e || !cn[t] || e.animate(cn[t], {
    duration: Er[t] || 400,
    easing: "ease-in-out",
    fill: "none"
  });
}
class Bn extends B {
  createRenderRoot() {
    return this;
  }
  constructor() {
    super(), this.score = 0, this.totalRounds = 0, this._onReplay = null;
  }
  firstUpdated() {
    Ge.cheer();
    const t = this.querySelector(".completion-screen__content");
    t && Un(t, "fadeIn");
  }
  _replay() {
    var t;
    this.remove(), (t = this._onReplay) == null || t.call(this);
  }
  render() {
    const t = this.totalRounds > 0 ? this.score / this.totalRounds : 0, n = t >= 0.8 ? 3 : t >= 0.5 ? 2 : 1, o = "⭐".repeat(n) + "☆".repeat(3 - n);
    return T`
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
W(Bn, "properties", {
  score: { type: Number },
  totalRounds: { type: Number }
});
customElements.define("ab-completion-screen", Bn);
function Sr(e, t, n, o) {
  e.innerHTML = "";
  const r = document.createElement("ab-completion-screen");
  r.score = t, r.totalRounds = n, r._onReplay = o, e.appendChild(r);
}
function nl(e, t, {
  totalRounds: n,
  progressBar: o = null,
  buildRoundUI: r,
  onCorrect: i,
  onWrong: s
} = {}) {
  let a = !1;
  async function c(m) {
    if (a) return;
    a = !0, Ge.correct(), m && await m(), i && await i(), e.state.addScore(1), o == null || o.update(e.state.currentRound), await new Promise((_) => setTimeout(_, 1200)), e.state.nextRound() ? (a = !1, r()) : Sr(t, e.state.score, n, () => {
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
function Fn(e, t) {
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
const zr = {
  kamatz: "ah",
  patah: "ah",
  tzere: "eh",
  segol: "eh",
  hiriq: "ee",
  holam: "oh",
  kubbutz: "oo"
}, Cr = {
  ah: [/[אה]/, /^א$/, /אא/, /הא/],
  eh: [/[אה]/, /^א$/, /אא/, /הא/, /אה/],
  ee: [/[אי]/, /^י$/, /אי/, /הי/],
  oh: [/[או]/, /^[או]$/, /או/, /הו/],
  oo: [/[או]/, /^[או]$/, /או/, /הו/, /אוּ/]
};
function ol() {
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
function rl(e, t) {
  if (!e || !t) return !1;
  const n = zr[t];
  if (!n) return !1;
  const o = Cr[n];
  if (!o) return !1;
  const r = e.replace(/[\s.,!?]/g, "");
  return r.length ? o.some((i) => i.test(r)) : !1;
}
function xr() {
  return ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/ogg"].find((t) => MediaRecorder.isTypeSupported(t)) || "";
}
function Ar() {
  var e;
  return typeof navigator < "u" && typeof ((e = navigator.mediaDevices) == null ? void 0 : e.getUserMedia) == "function" && typeof MediaRecorder < "u";
}
function Nr() {
  let e = null, t = null, n = [];
  async function o() {
    if (e && e.state === "recording") return;
    t = await navigator.mediaDevices.getUserMedia({ audio: !0, video: !1 }), n = [];
    const c = {}, u = xr();
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
const Zr = "alefbet-voices", ne = "recordings", Tr = 1;
let Ze = null;
function ut() {
  return Ze || (Ze = new Promise((e, t) => {
    const n = indexedDB.open(Zr, Tr);
    n.onupgradeneeded = (o) => {
      o.target.result.createObjectStore(ne);
    }, n.onsuccess = (o) => e(o.target.result), n.onerror = (o) => {
      Ze = null, t(o.target.error);
    };
  }), Ze);
}
function Rt(e, t) {
  return `${e}/${t}`;
}
async function Rr(e, t, n) {
  const o = await ut();
  return new Promise((r, i) => {
    const s = o.transaction(ne, "readwrite");
    s.objectStore(ne).put(n, Rt(e, t)), s.oncomplete = r, s.onerror = (a) => i(a.target.error);
  });
}
async function It(e, t) {
  const n = await ut();
  return new Promise((o, r) => {
    const s = n.transaction(ne, "readonly").objectStore(ne).get(Rt(e, t));
    s.onsuccess = () => o(s.result ?? null), s.onerror = (a) => r(a.target.error);
  });
}
async function Ir(e, t) {
  const n = await ut();
  return new Promise((o, r) => {
    const i = n.transaction(ne, "readwrite");
    i.objectStore(ne).delete(Rt(e, t)), i.oncomplete = o, i.onerror = (s) => r(s.target.error);
  });
}
async function il(e) {
  const t = await ut();
  return new Promise((n, o) => {
    const i = t.transaction(ne, "readonly").objectStore(ne).getAllKeys();
    i.onsuccess = () => {
      const s = `${e}/`;
      n(
        (i.result || []).filter((a) => a.startsWith(s)).map((a) => a.slice(s.length))
      );
    }, i.onerror = (s) => o(s.target.error);
  });
}
async function Re(e, t) {
  let n;
  try {
    n = await It(e, t);
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
async function sl(e, t) {
  return await It(e, t).catch(() => null) !== null;
}
const Ke = [
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
function al(e) {
  return Ke.find((t) => t.letter === e) || null;
}
function Pr(e = "regular") {
  return e === "regular" ? Ke.filter((t) => !t.isFinal) : e === "final" ? Ke.filter((t) => t.isFinal) : Ke;
}
function cl(e, t = "regular") {
  const n = Pr(t);
  return [...n].sort(() => Math.random() - 0.5).slice(0, Math.min(e, n.length));
}
const Le = [
  { id: "kamatz", name: "קָמָץ", nameNikud: "קָמָץ", symbol: "ָ", sound: "אָ", color: "#FF6B6B", textColor: "#fff" },
  { id: "patah", name: "פֶּתַח", nameNikud: "פָּתַח", symbol: "ַ", sound: "אָ", color: "#FF8C42", textColor: "#fff" },
  { id: "hiriq", name: "חִירִיק", nameNikud: "חִירִיק", symbol: "ִ", sound: "אִי", color: "#4ECDC4", textColor: "#fff" },
  { id: "tzere", name: "צָרָה", nameNikud: "צֵרֶה", symbol: "ֵ", sound: "אֶ", color: "#45B7D1", textColor: "#fff" },
  { id: "segol", name: "סָגֹול", nameNikud: "סְגוֹל", symbol: "ֶ", sound: "אֶ", color: "#9B59B6", textColor: "#fff" },
  { id: "holam", name: "חוֹלֵם", nameNikud: "חוֹלָם", symbol: "ֹ", sound: "אֹ", color: "#2ECC71", textColor: "#fff" },
  { id: "kubbutz", name: "קֻובּוּץ", nameNikud: "קֻבּוּץ", symbol: "ֻ", sound: "אֻ", color: "#F39C12", textColor: "#fff" }
], ul = ["א", "ב", "ג", "ד", "מ", "נ", "ל", "ר", "ש", "ת", "פ", "ק"];
function ll(e, t) {
  return e + t;
}
function dl(e) {
  let t = [...Le];
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
  t.length === 0 && (t = [...Le]);
  let n = [...t];
  for (; n.length < e; )
    n.push(...t);
  return n.sort(() => Math.random() - 0.5).slice(0, e);
}
class Hn extends B {
  createRenderRoot() {
    return this;
  }
  constructor() {
    super(), this.options = [], this._disabled = !1, this._highlights = {}, this._onSelect = null;
  }
  render() {
    return T`
      <div class="option-cards-grid">
        ${this.options.map((t) => {
      const n = this._highlights[t.id];
      return T`
            <button
              class=${"option-card" + (n ? ` option-card--${n}` : "")}
              data-id=${t.id}
              ?disabled=${this._disabled}
              @click=${() => {
        var o;
        this._disabled || (o = this._onSelect) == null || o.call(this, t);
      }}
            >
              <span class="option-card__emoji">${t.emoji ?? ""}</span>
              <span class="option-card__text">${t.text}</span>
            </button>
          `;
    })}
      </div>
    `;
  }
}
W(Hn, "properties", {
  options: { type: Array },
  _disabled: { state: !0 },
  _highlights: { state: !0 }
});
customElements.define("ab-option-cards", Hn);
function hl(e, t, n) {
  e.innerHTML = "";
  const o = document.createElement("ab-option-cards");
  return o.options = t, o._onSelect = n, e.appendChild(o), {
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
      e.innerHTML = "";
    }
  };
}
class Jn extends B {
  createRenderRoot() {
    return this;
  }
  constructor() {
    super(), this.total = 0, this.current = 0;
  }
  render() {
    const t = this.total > 0 ? Math.round(this.current / this.total * 100) : 0;
    return T`
      <div class="progress-bar"
           role="progressbar"
           aria-valuemin="0"
           aria-valuemax=${this.total}
           aria-valuenow=${this.current}>
        <div class="progress-bar__track">
          <div class="progress-bar__fill" style="width:${t}%"></div>
        </div>
        <span class="progress-bar__label">${this.current} / ${this.total}</span>
      </div>
    `;
  }
}
W(Jn, "properties", {
  total: { type: Number },
  current: { type: Number }
});
customElements.define("ab-progress-bar", Jn);
function pl(e, t) {
  const n = document.createElement("ab-progress-bar");
  return n.total = t, e.appendChild(n), {
    update(o) {
      n.current = o;
    },
    destroy() {
      n.remove();
    }
  };
}
class Wn extends B {
  createRenderRoot() {
    return this;
  }
  constructor() {
    super(), this._text = "", this._type = "", this._anim = null, this._timer = null;
  }
  updated(t) {
    if (t.has("_anim") && this._anim) {
      const n = this.querySelector(".feedback-message");
      n && Un(n, this._anim);
    }
  }
  _show(t, n, o, r = 1800) {
    clearTimeout(this._timer), this._text = t, this._type = n, this._anim = o, this._timer = setTimeout(() => {
      this._text = "", this._type = "";
    }, r);
  }
  correct(t = "!כָּל הַכָּבוֹד") {
    Ge.correct(), this._show(t, "correct", "bounce");
  }
  wrong(t = "נַסֵּה שׁוּב") {
    Ge.wrong(), this._show(t, "wrong", "pulse");
  }
  hint(t) {
    this._show(t, "hint", "pulse");
  }
  destroy() {
    clearTimeout(this._timer), this.remove();
  }
  render() {
    return T`
      <div
        class=${"feedback-message" + (this._type ? ` feedback-message--${this._type}` : "")}
        aria-live="polite"
        role="status"
      >${this._text}</div>
    `;
  }
}
W(Wn, "properties", {
  _text: { state: !0 },
  _type: { state: !0 },
  _anim: { state: !0 }
});
customElements.define("ab-feedback", Wn);
function fl(e) {
  const t = document.createElement("ab-feedback");
  return e.appendChild(t), {
    correct: (n) => t.correct(n),
    wrong: (n) => t.wrong(n),
    hint: (n) => t.hint(n),
    destroy: () => t.destroy()
  };
}
class Vn extends B {
  createRenderRoot() {
    return this;
  }
  constructor() {
    super(), this._open = !1, this._rate = 0.5, this._checked = /* @__PURE__ */ new Set(), this._container = null, this._onSave = null;
  }
  open(t, n) {
    var r;
    this._container = t, this._onSave = n;
    const o = ((r = new URLSearchParams(window.location.search).get("allowedNikud")) == null ? void 0 : r.split(",")) ?? [];
    this._checked = new Set(
      Le.filter((i) => o.length === 0 || o.includes(i.id) || o.includes(i.name)).map((i) => i.id)
    ), this._rate = parseFloat(localStorage.getItem("alefbet.nikudRate")) || 0.5, this._open = !0;
  }
  _save() {
    var o;
    localStorage.setItem("alefbet.nikudRate", this._rate), or.setNikudEmphasis({ rate: this._rate });
    const t = [...this._checked], n = new URL(window.location);
    t.length > 0 && t.length < Le.length ? n.searchParams.set("allowedNikud", t.join(",")) : n.searchParams.delete("allowedNikud"), n.searchParams.delete("excludedNikud"), window.history.replaceState({}, "", n), this._open = !1, (o = this._onSave) == null || o.call(this, this._container);
  }
  _toggleNikud(t) {
    const n = new Set(this._checked);
    n.has(t) ? n.delete(t) : n.add(t), this._checked = n;
  }
  render() {
    return this._open ? T`
      <div class="ab-nikud-dialog-backdrop">
        <div class="ab-nikud-dialog">
          <h2 style="margin-top:0">בחר ניקוד</h2>
          <div class="ab-nikud-dialog__grid">
            ${Le.map((t) => T`
              <label class="ab-nikud-dialog__label">
                <input type="checkbox"
                       .checked=${this._checked.has(t.id)}
                       @change=${() => this._toggleNikud(t.id)}
                       class="ab-nikud-dialog__cb">
                <span>${t.nameNikud}</span>
              </label>
            `)}
          </div>
          <div class="ab-nikud-dialog__rate">
            <label class="ab-nikud-dialog__rate-label">
              מהירות הגייה: <span>${this._rate}</span>
            </label>
            <input type="range" min="0.3" max="1.5" step="0.1"
                   .value=${String(this._rate)}
                   @input=${(t) => {
      this._rate = parseFloat(t.target.value);
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
    ` : T``;
  }
}
W(Vn, "properties", {
  _open: { state: !0 },
  _rate: { state: !0 },
  _checked: { state: !0 }
});
customElements.define("ab-nikud-settings-dialog", Vn);
let Je = null;
function Or() {
  return Je || (Je = document.createElement("ab-nikud-settings-dialog"), document.body.appendChild(Je)), Je;
}
function ml(e, t) {
  Or().open(e, t);
}
class qn extends B {
  createRenderRoot() {
    return this;
  }
  constructor() {
    super(), this.color = "#4f67ff", this.symbol = "", this.label = "", this._highlight = null, this._onTap = null;
  }
  render() {
    return T`
      <div
        class=${"ab-zone" + (this._highlight ? ` ab-zone--${this._highlight}` : "")}
        style="--zone-color: ${this.color}"
        @click=${() => {
      var t;
      return (t = this._onTap) == null ? void 0 : t.call(this);
    }}
      >
        <div class="ab-zone__symbol">${this.symbol}</div>
        <div class="ab-zone__label">${this.label}</div>
      </div>
    `;
  }
}
W(qn, "properties", {
  color: { type: String },
  symbol: { type: String },
  label: { type: String },
  _highlight: { state: !0 }
});
customElements.define("ab-zone", qn);
function _l(e) {
  const t = document.createElement("ab-zone");
  return t.color = e.color || "#4f67ff", t.symbol = e.symbol || "", t.label = e.label || "", t._onTap = e.onTap || null, {
    el: t,
    highlight(n) {
      t._highlight = n || null;
    },
    reset() {
      t._highlight = null;
    },
    destroy() {
      t.remove();
    }
  };
}
function Lr(e, t, n, o, r) {
  return e.map((i) => {
    const s = o > 0 ? (i.x - t) / o * 100 : 0, a = r > 0 ? (i.y - n) / r * 100 : 0;
    return `${s},${a}`;
  }).join(" ");
}
class Xn extends B {
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
  async _playZoneAudio(t) {
    if (!(!this.gameId || this._playing)) {
      this._playing = !0;
      try {
        await Re(this.gameId, `zone-${t}`);
      } catch {
      }
      this._playing = !1;
    }
  }
  _maybeShowHint() {
    if (this._hintShown || this.hintAfter <= 0 || this.mode === "soundboard" || this._wrongCount < this.hintAfter) return;
    this._hintShown = !0;
    const t = this.zones.filter((n) => n.correct && !this._found.has(n.id)).map((n) => n.id);
    this._hintZones = new Set(t), setTimeout(() => {
      this._hintZones = /* @__PURE__ */ new Set(), this._hintShown = !1, this._wrongCount = 0;
    }, 1500);
  }
  _handleZoneTap(t) {
    var n, o, r, i;
    if ((n = this._onZoneTap) == null || n.call(this, t), this._playZoneAudio(t.id), this.mode === "soundboard") {
      const s = new Set(this._tappedZones);
      s.add(t.id), this._tappedZones = s, setTimeout(() => {
        const a = new Set(this._tappedZones);
        a.delete(t.id), this._tappedZones = a;
      }, 400);
      return;
    }
    if (!this._found.has(t.id))
      if (t.correct) {
        const s = new Set(this._found);
        s.add(t.id), this._found = s, (o = this._onCorrect) == null || o.call(this, t);
        const a = this.zones.filter((c) => c.correct).length;
        s.size >= a && ((r = this._onAllCorrect) == null || r.call(this));
      } else {
        const s = new Set(this._wrongZones);
        s.add(t.id), this._wrongZones = s, this._wrongCount++, (i = this._onWrong) == null || i.call(this, t), setTimeout(() => {
          const a = new Set(this._wrongZones);
          a.delete(t.id), this._wrongZones = a;
        }, 600), this._maybeShowHint();
      }
  }
  _zoneClass(t) {
    const n = this.mode === "soundboard", o = ["ab-zp-zone"];
    return (this.showZones || n) && o.push("ab-zp-zone--visible"), n && o.push("ab-zp-zone--soundboard"), t.shape === "polygon" && o.push("ab-zp-zone--poly"), this._found.has(t.id) && o.push("ab-zp-zone--correct"), this._wrongZones.has(t.id) && o.push("ab-zp-zone--wrong"), this._tappedZones.has(t.id) && o.push("ab-zp-zone--tapped"), this._hintZones.has(t.id) && o.push("ab-zp-zone--hint"), this._revealedZones.has(t.id) && o.push("ab-zp-zone--revealed"), o.join(" ");
  }
  _renderZoneContent(t) {
    var o;
    const n = [];
    if (t.shape === "polygon" && ((o = t.points) == null ? void 0 : o.length) >= 3) {
      const r = `zp-clip-${t.id}`, i = Lr(t.points, t.x, t.y, t.width, t.height);
      n.push(T`
        <svg class="ab-zp-zone__poly-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs><clipPath id=${r}><polygon points=${i}/></clipPath></defs>
          <rect x="0" y="0" width="100" height="100" clip-path=${"url(#" + r + ")"} fill="transparent"/>
        </svg>`);
    }
    return this.mode === "soundboard" && t.label && n.push(T`<span class="ab-zp-zone__label">${t.label}</span>`), n;
  }
  // ── Public API ─────────────────────────────────────────────────────────────
  async playInstruction() {
    return this.gameId && this.roundId ? Re(this.gameId, this.roundId) : !1;
  }
  async playZoneAudio(t) {
    return this.gameId ? Re(this.gameId, `zone-${t}`) : !1;
  }
  revealCorrect() {
    const t = new Set(this._revealedZones);
    this.zones.filter((n) => n.correct).forEach((n) => t.add(n.id)), this._revealedZones = t;
  }
  reset() {
    this._found = /* @__PURE__ */ new Set(), this._wrongZones = /* @__PURE__ */ new Set(), this._tappedZones = /* @__PURE__ */ new Set(), this._hintZones = /* @__PURE__ */ new Set(), this._revealedZones = /* @__PURE__ */ new Set(), this._wrongCount = 0, this._hintShown = !1;
  }
  render() {
    return T`
      <div class="ab-zp-wrap">
        <img class="ab-zp-image" src=${this.image} alt="" draggable="false">
        <div class="ab-zp-layer">
          ${this.zones.map((t) => T`
            <button
              class=${this._zoneClass(t)}
              style="left:${t.x}%; top:${t.y}%; width:${t.width}%; height:${t.height}%"
              aria-label=${t.label || (t.correct ? "correct zone" : "zone")}
              @click=${() => this._handleZoneTap(t)}
            >${this._renderZoneContent(t)}</button>
          `)}
        </div>
      </div>
    `;
  }
}
W(Xn, "properties", {
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
customElements.define("ab-zone-player", Xn);
function gl(e, t) {
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
  } = t, _ = document.createElement("ab-zone-player");
  return _.image = n, _.zones = o, _.mode = r, _.gameId = i, _.roundId = s, _.showZones = d, _.autoPlayInstruction = m, _.hintAfter = f, _._onCorrect = a, _._onWrong = c, _._onAllCorrect = u, _._onZoneTap = l, e.appendChild(_), {
    playInstruction: () => _.playInstruction(),
    playZoneAudio: (w) => _.playZoneAudio(w),
    revealCorrect: () => _.revealCorrect(),
    reset: () => _.reset(),
    destroy: () => _.remove()
  };
}
class Yn extends B {
  createRenderRoot() {
    return this;
  }
  constructor() {
    super(), this.text = "טוֹעֵן...";
  }
  render() {
    return T`<div class="ab-loading">${this.text}</div>`;
  }
}
W(Yn, "properties", {
  text: { type: String }
});
customElements.define("ab-loading-screen", Yn);
function bl(e, t = "טוֹעֵן...") {
  e.innerHTML = "";
  const n = document.createElement("ab-loading-screen");
  n.text = t, e.appendChild(n);
}
function vl(e) {
  e.innerHTML = "";
}
class Kn extends B {
  createRenderRoot() {
    return this;
  }
  constructor() {
    super(), this.icon = "", this.ariaLabel = "", this._onClick = null;
  }
  render() {
    return T`
      <button
        class="ab-header-btn"
        aria-label=${this.ariaLabel}
        @click=${() => {
      var t;
      return (t = this._onClick) == null ? void 0 : t.call(this);
    }}
      >${this.icon}</button>
    `;
  }
}
W(Kn, "properties", {
  icon: { type: String },
  ariaLabel: { type: String }
});
customElements.define("ab-header-btn", Kn);
function yl(e, t, n, o) {
  const r = e.querySelector(".game-header__spacer");
  if (!r) return null;
  const i = document.createElement("ab-header-btn");
  return i.icon = t, i.ariaLabel = n, i._onClick = o, r.innerHTML = "", r.appendChild(i), i;
}
class Gn extends B {
  createRenderRoot() {
    return this;
  }
  constructor() {
    super(), this.nikud = null, this.size = "md";
  }
  render() {
    return this.nikud ? T`
      <div class=${"ab-nikud-box ab-nikud-box--" + this.size + " ab-nikud-box--" + this.nikud.id}>
        <div class="ab-nikud-box__box"></div>
        <div class="ab-nikud-box__mark">${this.nikud.symbol}</div>
      </div>
    ` : T``;
  }
}
W(Gn, "properties", {
  nikud: { type: Object },
  size: { type: String }
});
customElements.define("ab-nikud-box", Gn);
function wl(e, { size: t = "md" } = {}) {
  const n = document.createElement("ab-nikud-box");
  return n.nikud = e, n.size = t, n;
}
class Qn extends B {
  createRenderRoot() {
    return this;
  }
  constructor() {
    super(), this.title = "", this.subtitle = "", this.tabs = [], this.homeUrl = null, this._activeTab = null, this._onTabChange = null;
  }
  _handleTabClick(t) {
    var n;
    this._activeTab = t, (n = this._onTabChange) == null || n.call(this, t);
  }
  render() {
    const { title: t, subtitle: n, tabs: o, homeUrl: r, _activeTab: i } = this;
    return T`
      <header class="ab-app-header">
        <div class="ab-app-header-text">
          <h1 class="ab-app-title">${t}</h1>
          <span class="ab-app-subtitle">${n}</span>
        </div>
        ${r ? T`<a href=${r} class="ab-app-back-link" aria-label="דף הבית">🏠</a>` : ""}
      </header>
      <nav class="ab-app-tabs" role="tablist" aria-label="ניווט ראשי">
        ${o.map((s) => T`
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
        ${o.map((s) => T`
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
W(Qn, "properties", {
  title: { type: String },
  subtitle: { type: String },
  tabs: { type: Array },
  homeUrl: { type: String },
  _activeTab: { state: !0 }
});
customElements.define("ab-app-shell", Qn);
function kl(e, t = {}) {
  const {
    title: n = "",
    subtitle: o = "",
    tabs: r = [],
    homeUrl: i = null,
    onTabChange: s = null
  } = t;
  e.classList.add("ab-app");
  const a = document.createElement("ab-app-shell");
  return a.title = n, a.subtitle = o, a.tabs = r, a.homeUrl = i, a._onTabChange = s, a._activeTab = r.length > 0 ? r[0].id : null, e.appendChild(a), {
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
class eo extends B {
  createRenderRoot() {
    return this;
  }
  constructor() {
    super(), this.gameId = "", this.voiceKey = "", this.label = "הקלטת קול", this._state = "idle", this._elapsed = 0, this._playing = !1, this._error = null, this._recorder = null, this._timer = null, this._onSaved = null, this._onDeleted = null;
  }
  connectedCallback() {
    if (super.connectedCallback(), !Ar()) {
      this._state = "unsupported";
      return;
    }
    this._recorder = Nr(), this.refresh();
  }
  disconnectedCallback() {
    var t;
    super.disconnectedCallback(), clearInterval(this._timer), (t = this._recorder) != null && t.isActive() && this._recorder.cancel();
  }
  async refresh() {
    var n;
    if ((n = this._recorder) != null && n.isActive()) return;
    const t = await It(this.gameId, this.voiceKey).catch(() => null);
    this._state = t ? "has-voice" : "idle";
  }
  async _startRecording() {
    try {
      await this._recorder.start(), this._elapsed = 0, this._state = "recording", this._timer = setInterval(() => {
        this._elapsed++, this._elapsed >= 120 && this._stopRecording();
      }, 1e3);
    } catch (t) {
      console.warn("[voice-record-button] microphone access denied:", t), this._showError("לא ניתן לגשת למיקרופון");
    }
  }
  async _stopRecording() {
    var t;
    clearInterval(this._timer);
    try {
      const n = await this._recorder.stop();
      await Rr(this.gameId, this.voiceKey, n), this._state = "has-voice", (t = this._onSaved) == null || t.call(this, n);
    } catch (n) {
      console.warn("[voice-record-button] stop error:", n), this._state = "idle";
    }
  }
  async _play() {
    this._playing || (this._playing = !0, await Re(this.gameId, this.voiceKey), this._playing = !1);
  }
  async _delete() {
    var t;
    confirm("למחוק את ההקלטה?") && (await Ir(this.gameId, this.voiceKey), this._state = "idle", (t = this._onDeleted) == null || t.call(this));
  }
  _showError(t) {
    this._error = t, setTimeout(() => {
      this._error = null;
    }, 3e3);
  }
  _formatTime(t) {
    return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
  }
  render() {
    return this._state === "unsupported" ? T`<span class="ab-voice-unsupported">🎤 הקלטה לא נתמכת בדפדפן זה</span>` : T`
      <div class="ab-voice-btn-wrap" aria-label=${this.label}>
        ${this._state === "idle" ? T`
          <button class="ab-voice-btn ab-voice-btn--record" type="button"
                  title="התחל הקלטה" aria-label="התחל הקלטה"
                  @click=${() => this._startRecording()}>🎤</button>
        ` : ""}

        ${this._state === "recording" ? T`
          <span class="ab-voice-indicator"></span>
          <span class="ab-voice-timer">${this._formatTime(this._elapsed)}</span>
          <button class="ab-voice-btn ab-voice-btn--stop" type="button"
                  title="עצור הקלטה" aria-label="עצור הקלטה"
                  @click=${() => this._stopRecording()}>⏹</button>
        ` : ""}

        ${this._state === "has-voice" ? T`
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

        ${this._error ? T`<span class="ab-voice-error">${this._error}</span>` : ""}
      </div>
    `;
  }
}
W(eo, "properties", {
  gameId: { type: String },
  voiceKey: { type: String },
  label: { type: String },
  _state: { state: !0 },
  // 'idle' | 'recording' | 'has-voice' | 'unsupported'
  _elapsed: { state: !0 },
  _playing: { state: !0 },
  _error: { state: !0 }
});
customElements.define("ab-voice-record-button", eo);
function to(e, {
  gameId: t,
  voiceKey: n,
  label: o = "הקלטת קול",
  onSaved: r,
  onDeleted: i
} = {}) {
  const s = document.createElement("ab-voice-record-button");
  return s.gameId = t, s.voiceKey = n, s.label = o, s._onSaved = r, s._onDeleted = i, e.appendChild(s), {
    refresh: () => s.refresh(),
    destroy: () => s.remove()
  };
}
let _e = null, Q = null, zt = 0, Ct = 0;
const et = /* @__PURE__ */ new Map();
function un(e, t) {
  var n;
  return ((n = document.elementFromPoint(e, t)) == null ? void 0 : n.closest('[data-drop-target="true"]')) || null;
}
function jr(e, t, n) {
  const o = e.getBoundingClientRect();
  zt = o.width / 2, Ct = o.height / 2, Q = e.cloneNode(!0), Object.assign(Q.style, {
    position: "fixed",
    left: `${t - zt}px`,
    top: `${n - Ct}px`,
    width: `${o.width}px`,
    height: `${o.height}px`,
    pointerEvents: "none",
    // keeps it out of elementFromPoint + hit-testing
    zIndex: "9999",
    opacity: "0.85",
    transform: "scale(1.12)",
    cursor: "grabbing",
    margin: "0"
  }), document.body.appendChild(Q);
}
function Mr(e, t) {
  Q && (Q.style.left = `${e - zt}px`, Q.style.top = `${t - Ct}px`);
}
function Dr() {
  Q == null || Q.remove(), Q = null;
}
let te = null;
function Ur(e) {
  te !== e && (te == null || te.classList.remove("drop-target--hover"), te = e, e == null || e.classList.add("drop-target--hover"));
}
function Br() {
  te == null || te.classList.remove("drop-target--hover"), te = null;
}
function Fr(e, t) {
  e.classList.add("drag-source");
  let n = null, o = null, r = null;
  function i() {
    n && (e.removeEventListener("pointermove", n), e.removeEventListener("pointerup", o), e.removeEventListener("pointercancel", r), n = o = r = null), Br(), Dr(), e.classList.remove("drag-source--dragging"), _e = null;
  }
  function s(a) {
    a.button !== void 0 && a.button !== 0 || (a.preventDefault(), _e && i(), _e = { el: e, data: t }, e.classList.add("drag-source--dragging"), jr(e, a.clientX, a.clientY), e.setPointerCapture(a.pointerId), n = (c) => {
      Mr(c.clientX, c.clientY), Ur(un(c.clientX, c.clientY));
    }, o = (c) => {
      const u = un(c.clientX, c.clientY);
      i(), u && et.has(u) && et.get(u).onDrop({ data: t, sourceEl: e, targetEl: u });
    }, r = () => i(), e.addEventListener("pointermove", n), e.addEventListener("pointerup", o), e.addEventListener("pointercancel", r));
  }
  return e.addEventListener("pointerdown", s), {
    destroy() {
      e.removeEventListener("pointerdown", s), (_e == null ? void 0 : _e.el) === e && i(), e.classList.remove("drag-source");
    }
  };
}
function Hr(e, t) {
  return e.setAttribute("data-drop-target", "true"), e.classList.add("drop-target--active"), et.set(e, { onDrop: t }), {
    destroy() {
      e.removeAttribute("data-drop-target"), e.classList.remove("drop-target--active", "drop-target--hover"), et.delete(e);
    }
  };
}
function Jr(e, { onClick: t } = {}) {
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
function Wr(e, t, { onSelectRound: n, onAddRound: o, onDuplicateRound: r, onMoveRound: i }) {
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
    d.forEach((x) => x.destroy()), d = [];
  }
  function f(x, C) {
    const g = document.createElement("div");
    g.className = "ab-editor-nav__thumb", x.id === l && g.classList.add("ab-editor-nav__thumb--active"), g.setAttribute("role", "button"), g.setAttribute("tabindex", "0"), g.setAttribute("aria-label", `סיבוב ${C + 1}`), g.dataset.roundId = x.id, x.image && (g.style.backgroundImage = `url(${x.image})`, g.classList.add("ab-editor-nav__thumb--has-img"));
    const k = document.createElement("div");
    k.className = "ab-editor-nav__grip", k.innerHTML = "⠿", k.setAttribute("aria-hidden", "true"), k.title = "גרור לשינוי סדר", g.appendChild(k);
    const b = document.createElement("div");
    if (b.className = "ab-editor-nav__num", b.textContent = String(C + 1), g.appendChild(b), x.correctEmoji && !x.image) {
      const $ = document.createElement("div");
      $.className = "ab-editor-nav__emoji", $.textContent = x.correctEmoji, g.appendChild($);
    }
    if (x.target) {
      const $ = document.createElement("div");
      $.className = "ab-editor-nav__letter", $.textContent = x.target, g.appendChild($);
    }
    const S = document.createElement("button");
    return S.className = "ab-editor-nav__dup", S.innerHTML = "⧉", S.title = "שכפל סיבוב", S.setAttribute("aria-label", "שכפל סיבוב"), S.addEventListener("click", ($) => {
      $.stopPropagation(), r(x.id);
    }), g.appendChild(S), g.addEventListener("click", () => n(x.id)), g.addEventListener("keydown", ($) => {
      ($.key === "Enter" || $.key === " ") && ($.preventDefault(), n(x.id));
    }), d.push(Fr(k, { roundId: x.id })), d.push(Hr(g, ({ data: $ }) => {
      $.roundId !== x.id && i($.roundId, t.getRoundIndex(x.id));
    })), g;
  }
  function _() {
    m(), c.innerHTML = "", t.rounds.forEach((x, C) => c.appendChild(f(x, C)));
  }
  function w(x) {
    l = x, c.querySelectorAll(".ab-editor-nav__thumb").forEach((C) => {
      C.classList.toggle("ab-editor-nav__thumb--active", C.dataset.roundId === x);
    });
  }
  function A() {
    m(), s.remove();
  }
  return _(), { refresh: _, setActiveRound: w, destroy: A };
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
class ke extends Error {
  constructor() {
    super("Encountered Promise during synchronous parse. Use .parseAsync() instead.");
  }
}
class no extends Error {
  constructor(t) {
    super(`Encountered unidirectional transform during encode: ${t}`), this.name = "ZodEncodeError";
  }
}
const oo = {};
function ie(e) {
  return oo;
}
function ro(e) {
  const t = Object.values(e).filter((o) => typeof o == "number");
  return Object.entries(e).filter(([o, r]) => t.indexOf(+o) === -1).map(([o, r]) => r);
}
function xt(e, t) {
  return typeof t == "bigint" ? t.toString() : t;
}
function Pt(e) {
  return {
    get value() {
      {
        const t = e();
        return Object.defineProperty(this, "value", { value: t }), t;
      }
    }
  };
}
function Ot(e) {
  return e == null;
}
function Lt(e) {
  const t = e.startsWith("^") ? 1 : 0, n = e.endsWith("$") ? e.length - 1 : e.length;
  return e.slice(t, n);
}
function Vr(e, t) {
  const n = (e.toString().split(".")[1] || "").length, o = t.toString();
  let r = (o.split(".")[1] || "").length;
  if (r === 0 && /\d?e-\d?/.test(o)) {
    const c = o.match(/\d?e-(\d?)/);
    c != null && c[1] && (r = Number.parseInt(c[1]));
  }
  const i = n > r ? n : r, s = Number.parseInt(e.toFixed(i).replace(".", "")), a = Number.parseInt(t.toFixed(i).replace(".", ""));
  return s % a / 10 ** i;
}
const ln = Symbol("evaluating");
function N(e, t, n) {
  let o;
  Object.defineProperty(e, t, {
    get() {
      if (o !== ln)
        return o === void 0 && (o = ln, o = n()), o;
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
function fe(e, t, n) {
  Object.defineProperty(e, t, {
    value: n,
    writable: !0,
    enumerable: !0,
    configurable: !0
  });
}
function ae(...e) {
  const t = {};
  for (const n of e) {
    const o = Object.getOwnPropertyDescriptors(n);
    Object.assign(t, o);
  }
  return Object.defineProperties({}, t);
}
function dn(e) {
  return JSON.stringify(e);
}
function qr(e) {
  return e.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
const io = "captureStackTrace" in Error ? Error.captureStackTrace : (...e) => {
};
function tt(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
const Xr = Pt(() => {
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
function Se(e) {
  if (tt(e) === !1)
    return !1;
  const t = e.constructor;
  if (t === void 0 || typeof t != "function")
    return !0;
  const n = t.prototype;
  return !(tt(n) === !1 || Object.prototype.hasOwnProperty.call(n, "isPrototypeOf") === !1);
}
function so(e) {
  return Se(e) ? { ...e } : Array.isArray(e) ? [...e] : e;
}
const Yr = /* @__PURE__ */ new Set(["string", "number", "symbol"]);
function lt(e) {
  return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function ce(e, t, n) {
  const o = new e._zod.constr(t ?? e._zod.def);
  return (!t || n != null && n.parent) && (o._zod.parent = e), o;
}
function y(e) {
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
function Kr(e) {
  return Object.keys(e).filter((t) => e[t]._zod.optin === "optional" && e[t]._zod.optout === "optional");
}
const Gr = {
  safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
  int32: [-2147483648, 2147483647],
  uint32: [0, 4294967295],
  float32: [-34028234663852886e22, 34028234663852886e22],
  float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
};
function Qr(e, t) {
  const n = e._zod.def, o = n.checks;
  if (o && o.length > 0)
    throw new Error(".pick() cannot be used on object schemas containing refinements");
  const i = ae(e._zod.def, {
    get shape() {
      const s = {};
      for (const a in t) {
        if (!(a in n.shape))
          throw new Error(`Unrecognized key: "${a}"`);
        t[a] && (s[a] = n.shape[a]);
      }
      return fe(this, "shape", s), s;
    },
    checks: []
  });
  return ce(e, i);
}
function ei(e, t) {
  const n = e._zod.def, o = n.checks;
  if (o && o.length > 0)
    throw new Error(".omit() cannot be used on object schemas containing refinements");
  const i = ae(e._zod.def, {
    get shape() {
      const s = { ...e._zod.def.shape };
      for (const a in t) {
        if (!(a in n.shape))
          throw new Error(`Unrecognized key: "${a}"`);
        t[a] && delete s[a];
      }
      return fe(this, "shape", s), s;
    },
    checks: []
  });
  return ce(e, i);
}
function ti(e, t) {
  if (!Se(t))
    throw new Error("Invalid input to extend: expected a plain object");
  const n = e._zod.def.checks;
  if (n && n.length > 0) {
    const i = e._zod.def.shape;
    for (const s in t)
      if (Object.getOwnPropertyDescriptor(i, s) !== void 0)
        throw new Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
  }
  const r = ae(e._zod.def, {
    get shape() {
      const i = { ...e._zod.def.shape, ...t };
      return fe(this, "shape", i), i;
    }
  });
  return ce(e, r);
}
function ni(e, t) {
  if (!Se(t))
    throw new Error("Invalid input to safeExtend: expected a plain object");
  const n = ae(e._zod.def, {
    get shape() {
      const o = { ...e._zod.def.shape, ...t };
      return fe(this, "shape", o), o;
    }
  });
  return ce(e, n);
}
function oi(e, t) {
  const n = ae(e._zod.def, {
    get shape() {
      const o = { ...e._zod.def.shape, ...t._zod.def.shape };
      return fe(this, "shape", o), o;
    },
    get catchall() {
      return t._zod.def.catchall;
    },
    checks: []
    // delete existing checks
  });
  return ce(e, n);
}
function ri(e, t, n) {
  const r = t._zod.def.checks;
  if (r && r.length > 0)
    throw new Error(".partial() cannot be used on object schemas containing refinements");
  const s = ae(t._zod.def, {
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
      return fe(this, "shape", c), c;
    },
    checks: []
  });
  return ce(t, s);
}
function ii(e, t, n) {
  const o = ae(t._zod.def, {
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
      return fe(this, "shape", i), i;
    }
  });
  return ce(t, o);
}
function ye(e, t = 0) {
  var n;
  if (e.aborted === !0)
    return !0;
  for (let o = t; o < e.issues.length; o++)
    if (((n = e.issues[o]) == null ? void 0 : n.continue) !== !0)
      return !0;
  return !1;
}
function we(e, t) {
  return t.map((n) => {
    var o;
    return (o = n).path ?? (o.path = []), n.path.unshift(e), n;
  });
}
function We(e) {
  return typeof e == "string" ? e : e == null ? void 0 : e.message;
}
function se(e, t, n) {
  var r, i, s, a, c, u;
  const o = { ...e, path: e.path ?? [] };
  if (!e.message) {
    const l = We((s = (i = (r = e.inst) == null ? void 0 : r._zod.def) == null ? void 0 : i.error) == null ? void 0 : s.call(i, e)) ?? We((a = t == null ? void 0 : t.error) == null ? void 0 : a.call(t, e)) ?? We((c = n.customError) == null ? void 0 : c.call(n, e)) ?? We((u = n.localeError) == null ? void 0 : u.call(n, e)) ?? "Invalid input";
    o.message = l;
  }
  return delete o.inst, delete o.continue, t != null && t.reportInput || delete o.input, o;
}
function jt(e) {
  return Array.isArray(e) ? "array" : typeof e == "string" ? "string" : "unknown";
}
function Ue(...e) {
  const [t, n, o] = e;
  return typeof t == "string" ? {
    message: t,
    code: "custom",
    input: n,
    inst: o
  } : { ...t };
}
const ao = (e, t) => {
  e.name = "$ZodError", Object.defineProperty(e, "_zod", {
    value: e._zod,
    enumerable: !1
  }), Object.defineProperty(e, "issues", {
    value: t,
    enumerable: !1
  }), e.message = JSON.stringify(t, xt, 2), Object.defineProperty(e, "toString", {
    value: () => e.message,
    enumerable: !1
  });
}, co = h("$ZodError", ao), uo = h("$ZodError", ao, { Parent: Error });
function si(e, t = (n) => n.message) {
  const n = {}, o = [];
  for (const r of e.issues)
    r.path.length > 0 ? (n[r.path[0]] = n[r.path[0]] || [], n[r.path[0]].push(t(r))) : o.push(t(r));
  return { formErrors: o, fieldErrors: n };
}
function ai(e, t = (n) => n.message) {
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
const Mt = (e) => (t, n, o, r) => {
  const i = o ? Object.assign(o, { async: !1 }) : { async: !1 }, s = t._zod.run({ value: n, issues: [] }, i);
  if (s instanceof Promise)
    throw new ke();
  if (s.issues.length) {
    const a = new ((r == null ? void 0 : r.Err) ?? e)(s.issues.map((c) => se(c, i, ie())));
    throw io(a, r == null ? void 0 : r.callee), a;
  }
  return s.value;
}, Dt = (e) => async (t, n, o, r) => {
  const i = o ? Object.assign(o, { async: !0 }) : { async: !0 };
  let s = t._zod.run({ value: n, issues: [] }, i);
  if (s instanceof Promise && (s = await s), s.issues.length) {
    const a = new ((r == null ? void 0 : r.Err) ?? e)(s.issues.map((c) => se(c, i, ie())));
    throw io(a, r == null ? void 0 : r.callee), a;
  }
  return s.value;
}, dt = (e) => (t, n, o) => {
  const r = o ? { ...o, async: !1 } : { async: !1 }, i = t._zod.run({ value: n, issues: [] }, r);
  if (i instanceof Promise)
    throw new ke();
  return i.issues.length ? {
    success: !1,
    error: new (e ?? co)(i.issues.map((s) => se(s, r, ie())))
  } : { success: !0, data: i.value };
}, ci = /* @__PURE__ */ dt(uo), ht = (e) => async (t, n, o) => {
  const r = o ? Object.assign(o, { async: !0 }) : { async: !0 };
  let i = t._zod.run({ value: n, issues: [] }, r);
  return i instanceof Promise && (i = await i), i.issues.length ? {
    success: !1,
    error: new e(i.issues.map((s) => se(s, r, ie())))
  } : { success: !0, data: i.value };
}, ui = /* @__PURE__ */ ht(uo), li = (e) => (t, n, o) => {
  const r = o ? Object.assign(o, { direction: "backward" }) : { direction: "backward" };
  return Mt(e)(t, n, r);
}, di = (e) => (t, n, o) => Mt(e)(t, n, o), hi = (e) => async (t, n, o) => {
  const r = o ? Object.assign(o, { direction: "backward" }) : { direction: "backward" };
  return Dt(e)(t, n, r);
}, pi = (e) => async (t, n, o) => Dt(e)(t, n, o), fi = (e) => (t, n, o) => {
  const r = o ? Object.assign(o, { direction: "backward" }) : { direction: "backward" };
  return dt(e)(t, n, r);
}, mi = (e) => (t, n, o) => dt(e)(t, n, o), _i = (e) => async (t, n, o) => {
  const r = o ? Object.assign(o, { direction: "backward" }) : { direction: "backward" };
  return ht(e)(t, n, r);
}, gi = (e) => async (t, n, o) => ht(e)(t, n, o), bi = /^[cC][^\s-]{8,}$/, vi = /^[0-9a-z]+$/, yi = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/, wi = /^[0-9a-vA-V]{20}$/, ki = /^[A-Za-z0-9]{27}$/, $i = /^[a-zA-Z0-9_-]{21}$/, Ei = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/, Si = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/, hn = (e) => e ? new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${e}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`) : /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/, zi = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/, Ci = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
function xi() {
  return new RegExp(Ci, "u");
}
const Ai = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, Ni = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/, Zi = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/, Ti = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, Ri = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/, lo = /^[A-Za-z0-9_-]*$/, Ii = /^\+[1-9]\d{6,14}$/, ho = "(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))", Pi = /* @__PURE__ */ new RegExp(`^${ho}$`);
function po(e) {
  const t = "(?:[01]\\d|2[0-3]):[0-5]\\d";
  return typeof e.precision == "number" ? e.precision === -1 ? `${t}` : e.precision === 0 ? `${t}:[0-5]\\d` : `${t}:[0-5]\\d\\.\\d{${e.precision}}` : `${t}(?::[0-5]\\d(?:\\.\\d+)?)?`;
}
function Oi(e) {
  return new RegExp(`^${po(e)}$`);
}
function Li(e) {
  const t = po({ precision: e.precision }), n = ["Z"];
  e.local && n.push(""), e.offset && n.push("([+-](?:[01]\\d|2[0-3]):[0-5]\\d)");
  const o = `${t}(?:${n.join("|")})`;
  return new RegExp(`^${ho}T(?:${o})$`);
}
const ji = (e) => {
  const t = e ? `[\\s\\S]{${(e == null ? void 0 : e.minimum) ?? 0},${(e == null ? void 0 : e.maximum) ?? ""}}` : "[\\s\\S]*";
  return new RegExp(`^${t}$`);
}, Mi = /^-?\d+$/, fo = /^-?\d+(?:\.\d+)?$/, Di = /^(?:true|false)$/i, Ui = /^[^A-Z]*$/, Bi = /^[^a-z]*$/, J = /* @__PURE__ */ h("$ZodCheck", (e, t) => {
  var n;
  e._zod ?? (e._zod = {}), e._zod.def = t, (n = e._zod).onattach ?? (n.onattach = []);
}), mo = {
  number: "number",
  bigint: "bigint",
  object: "date"
}, _o = /* @__PURE__ */ h("$ZodCheckLessThan", (e, t) => {
  J.init(e, t);
  const n = mo[typeof t.value];
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
}), go = /* @__PURE__ */ h("$ZodCheckGreaterThan", (e, t) => {
  J.init(e, t);
  const n = mo[typeof t.value];
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
}), Fi = /* @__PURE__ */ h("$ZodCheckMultipleOf", (e, t) => {
  J.init(e, t), e._zod.onattach.push((n) => {
    var o;
    (o = n._zod.bag).multipleOf ?? (o.multipleOf = t.value);
  }), e._zod.check = (n) => {
    if (typeof n.value != typeof t.value)
      throw new Error("Cannot mix number and bigint in multiple_of check.");
    (typeof n.value == "bigint" ? n.value % t.value === BigInt(0) : Vr(n.value, t.value) === 0) || n.issues.push({
      origin: typeof n.value,
      code: "not_multiple_of",
      divisor: t.value,
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), Hi = /* @__PURE__ */ h("$ZodCheckNumberFormat", (e, t) => {
  var s;
  J.init(e, t), t.format = t.format || "float64";
  const n = (s = t.format) == null ? void 0 : s.includes("int"), o = n ? "int" : "number", [r, i] = Gr[t.format];
  e._zod.onattach.push((a) => {
    const c = a._zod.bag;
    c.format = t.format, c.minimum = r, c.maximum = i, n && (c.pattern = Mi);
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
}), Ji = /* @__PURE__ */ h("$ZodCheckMaxLength", (e, t) => {
  var n;
  J.init(e, t), (n = e._zod.def).when ?? (n.when = (o) => {
    const r = o.value;
    return !Ot(r) && r.length !== void 0;
  }), e._zod.onattach.push((o) => {
    const r = o._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
    t.maximum < r && (o._zod.bag.maximum = t.maximum);
  }), e._zod.check = (o) => {
    const r = o.value;
    if (r.length <= t.maximum)
      return;
    const s = jt(r);
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
}), Wi = /* @__PURE__ */ h("$ZodCheckMinLength", (e, t) => {
  var n;
  J.init(e, t), (n = e._zod.def).when ?? (n.when = (o) => {
    const r = o.value;
    return !Ot(r) && r.length !== void 0;
  }), e._zod.onattach.push((o) => {
    const r = o._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
    t.minimum > r && (o._zod.bag.minimum = t.minimum);
  }), e._zod.check = (o) => {
    const r = o.value;
    if (r.length >= t.minimum)
      return;
    const s = jt(r);
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
}), Vi = /* @__PURE__ */ h("$ZodCheckLengthEquals", (e, t) => {
  var n;
  J.init(e, t), (n = e._zod.def).when ?? (n.when = (o) => {
    const r = o.value;
    return !Ot(r) && r.length !== void 0;
  }), e._zod.onattach.push((o) => {
    const r = o._zod.bag;
    r.minimum = t.length, r.maximum = t.length, r.length = t.length;
  }), e._zod.check = (o) => {
    const r = o.value, i = r.length;
    if (i === t.length)
      return;
    const s = jt(r), a = i > t.length;
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
}), pt = /* @__PURE__ */ h("$ZodCheckStringFormat", (e, t) => {
  var n, o;
  J.init(e, t), e._zod.onattach.push((r) => {
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
}), qi = /* @__PURE__ */ h("$ZodCheckRegex", (e, t) => {
  pt.init(e, t), e._zod.check = (n) => {
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
}), Xi = /* @__PURE__ */ h("$ZodCheckLowerCase", (e, t) => {
  t.pattern ?? (t.pattern = Ui), pt.init(e, t);
}), Yi = /* @__PURE__ */ h("$ZodCheckUpperCase", (e, t) => {
  t.pattern ?? (t.pattern = Bi), pt.init(e, t);
}), Ki = /* @__PURE__ */ h("$ZodCheckIncludes", (e, t) => {
  J.init(e, t);
  const n = lt(t.includes), o = new RegExp(typeof t.position == "number" ? `^.{${t.position}}${n}` : n);
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
}), Gi = /* @__PURE__ */ h("$ZodCheckStartsWith", (e, t) => {
  J.init(e, t);
  const n = new RegExp(`^${lt(t.prefix)}.*`);
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
}), Qi = /* @__PURE__ */ h("$ZodCheckEndsWith", (e, t) => {
  J.init(e, t);
  const n = new RegExp(`.*${lt(t.suffix)}$`);
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
}), es = /* @__PURE__ */ h("$ZodCheckOverwrite", (e, t) => {
  J.init(e, t), e._zod.check = (n) => {
    n.value = t.tx(n.value);
  };
});
class ts {
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
const ns = {
  major: 4,
  minor: 3,
  patch: 6
}, P = /* @__PURE__ */ h("$ZodType", (e, t) => {
  var r;
  var n;
  e ?? (e = {}), e._zod.def = t, e._zod.bag = e._zod.bag || {}, e._zod.version = ns;
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
      let l = ye(a), d;
      for (const m of c) {
        if (m._zod.def.when) {
          if (!m._zod.def.when(a))
            continue;
        } else if (l)
          continue;
        const f = a.issues.length, _ = m._zod.check(a);
        if (_ instanceof Promise && (u == null ? void 0 : u.async) === !1)
          throw new ke();
        if (d || _ instanceof Promise)
          d = (d ?? Promise.resolve()).then(async () => {
            await _, a.issues.length !== f && (l || (l = ye(a, f)));
          });
        else {
          if (a.issues.length === f)
            continue;
          l || (l = ye(a, f));
        }
      }
      return d ? d.then(() => a) : a;
    }, s = (a, c, u) => {
      if (ye(a))
        return a.aborted = !0, a;
      const l = i(c, o, u);
      if (l instanceof Promise) {
        if (u.async === !1)
          throw new ke();
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
          throw new ke();
        return u.then((l) => i(l, o, c));
      }
      return i(u, o, c);
    };
  }
  N(e, "~standard", () => ({
    validate: (i) => {
      var s;
      try {
        const a = ci(e, i);
        return a.success ? { value: a.data } : { issues: (s = a.error) == null ? void 0 : s.issues };
      } catch {
        return ui(e, i).then((c) => {
          var u;
          return c.success ? { value: c.data } : { issues: (u = c.error) == null ? void 0 : u.issues };
        });
      }
    },
    vendor: "zod",
    version: 1
  }));
}), Ut = /* @__PURE__ */ h("$ZodString", (e, t) => {
  var n;
  P.init(e, t), e._zod.pattern = [...((n = e == null ? void 0 : e._zod.bag) == null ? void 0 : n.patterns) ?? []].pop() ?? ji(e._zod.bag), e._zod.parse = (o, r) => {
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
}), R = /* @__PURE__ */ h("$ZodStringFormat", (e, t) => {
  pt.init(e, t), Ut.init(e, t);
}), os = /* @__PURE__ */ h("$ZodGUID", (e, t) => {
  t.pattern ?? (t.pattern = Si), R.init(e, t);
}), rs = /* @__PURE__ */ h("$ZodUUID", (e, t) => {
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
    t.pattern ?? (t.pattern = hn(o));
  } else
    t.pattern ?? (t.pattern = hn());
  R.init(e, t);
}), is = /* @__PURE__ */ h("$ZodEmail", (e, t) => {
  t.pattern ?? (t.pattern = zi), R.init(e, t);
}), ss = /* @__PURE__ */ h("$ZodURL", (e, t) => {
  R.init(e, t), e._zod.check = (n) => {
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
}), as = /* @__PURE__ */ h("$ZodEmoji", (e, t) => {
  t.pattern ?? (t.pattern = xi()), R.init(e, t);
}), cs = /* @__PURE__ */ h("$ZodNanoID", (e, t) => {
  t.pattern ?? (t.pattern = $i), R.init(e, t);
}), us = /* @__PURE__ */ h("$ZodCUID", (e, t) => {
  t.pattern ?? (t.pattern = bi), R.init(e, t);
}), ls = /* @__PURE__ */ h("$ZodCUID2", (e, t) => {
  t.pattern ?? (t.pattern = vi), R.init(e, t);
}), ds = /* @__PURE__ */ h("$ZodULID", (e, t) => {
  t.pattern ?? (t.pattern = yi), R.init(e, t);
}), hs = /* @__PURE__ */ h("$ZodXID", (e, t) => {
  t.pattern ?? (t.pattern = wi), R.init(e, t);
}), ps = /* @__PURE__ */ h("$ZodKSUID", (e, t) => {
  t.pattern ?? (t.pattern = ki), R.init(e, t);
}), fs = /* @__PURE__ */ h("$ZodISODateTime", (e, t) => {
  t.pattern ?? (t.pattern = Li(t)), R.init(e, t);
}), ms = /* @__PURE__ */ h("$ZodISODate", (e, t) => {
  t.pattern ?? (t.pattern = Pi), R.init(e, t);
}), _s = /* @__PURE__ */ h("$ZodISOTime", (e, t) => {
  t.pattern ?? (t.pattern = Oi(t)), R.init(e, t);
}), gs = /* @__PURE__ */ h("$ZodISODuration", (e, t) => {
  t.pattern ?? (t.pattern = Ei), R.init(e, t);
}), bs = /* @__PURE__ */ h("$ZodIPv4", (e, t) => {
  t.pattern ?? (t.pattern = Ai), R.init(e, t), e._zod.bag.format = "ipv4";
}), vs = /* @__PURE__ */ h("$ZodIPv6", (e, t) => {
  t.pattern ?? (t.pattern = Ni), R.init(e, t), e._zod.bag.format = "ipv6", e._zod.check = (n) => {
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
}), ys = /* @__PURE__ */ h("$ZodCIDRv4", (e, t) => {
  t.pattern ?? (t.pattern = Zi), R.init(e, t);
}), ws = /* @__PURE__ */ h("$ZodCIDRv6", (e, t) => {
  t.pattern ?? (t.pattern = Ti), R.init(e, t), e._zod.check = (n) => {
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
function bo(e) {
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
const ks = /* @__PURE__ */ h("$ZodBase64", (e, t) => {
  t.pattern ?? (t.pattern = Ri), R.init(e, t), e._zod.bag.contentEncoding = "base64", e._zod.check = (n) => {
    bo(n.value) || n.issues.push({
      code: "invalid_format",
      format: "base64",
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
});
function $s(e) {
  if (!lo.test(e))
    return !1;
  const t = e.replace(/[-_]/g, (o) => o === "-" ? "+" : "/"), n = t.padEnd(Math.ceil(t.length / 4) * 4, "=");
  return bo(n);
}
const Es = /* @__PURE__ */ h("$ZodBase64URL", (e, t) => {
  t.pattern ?? (t.pattern = lo), R.init(e, t), e._zod.bag.contentEncoding = "base64url", e._zod.check = (n) => {
    $s(n.value) || n.issues.push({
      code: "invalid_format",
      format: "base64url",
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), Ss = /* @__PURE__ */ h("$ZodE164", (e, t) => {
  t.pattern ?? (t.pattern = Ii), R.init(e, t);
});
function zs(e, t = null) {
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
const Cs = /* @__PURE__ */ h("$ZodJWT", (e, t) => {
  R.init(e, t), e._zod.check = (n) => {
    zs(n.value, t.alg) || n.issues.push({
      code: "invalid_format",
      format: "jwt",
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), vo = /* @__PURE__ */ h("$ZodNumber", (e, t) => {
  P.init(e, t), e._zod.pattern = e._zod.bag.pattern ?? fo, e._zod.parse = (n, o) => {
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
}), xs = /* @__PURE__ */ h("$ZodNumberFormat", (e, t) => {
  Hi.init(e, t), vo.init(e, t);
}), As = /* @__PURE__ */ h("$ZodBoolean", (e, t) => {
  P.init(e, t), e._zod.pattern = Di, e._zod.parse = (n, o) => {
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
}), Ns = /* @__PURE__ */ h("$ZodUnknown", (e, t) => {
  P.init(e, t), e._zod.parse = (n) => n;
}), Zs = /* @__PURE__ */ h("$ZodNever", (e, t) => {
  P.init(e, t), e._zod.parse = (n, o) => (n.issues.push({
    expected: "never",
    code: "invalid_type",
    input: n.value,
    inst: e
  }), n);
});
function pn(e, t, n) {
  e.issues.length && t.issues.push(...we(n, e.issues)), t.value[n] = e.value;
}
const Ts = /* @__PURE__ */ h("$ZodArray", (e, t) => {
  P.init(e, t), e._zod.parse = (n, o) => {
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
      c instanceof Promise ? i.push(c.then((u) => pn(u, n, s))) : pn(c, n, s);
    }
    return i.length ? Promise.all(i).then(() => n) : n;
  };
});
function nt(e, t, n, o, r) {
  if (e.issues.length) {
    if (r && !(n in o))
      return;
    t.issues.push(...we(n, e.issues));
  }
  e.value === void 0 ? n in o && (t.value[n] = void 0) : t.value[n] = e.value;
}
function yo(e) {
  var o, r, i, s;
  const t = Object.keys(e.shape);
  for (const a of t)
    if (!((s = (i = (r = (o = e.shape) == null ? void 0 : o[a]) == null ? void 0 : r._zod) == null ? void 0 : i.traits) != null && s.has("$ZodType")))
      throw new Error(`Invalid element at key "${a}": expected a Zod schema`);
  const n = Kr(e.shape);
  return {
    ...e,
    keys: t,
    keySet: new Set(t),
    numKeys: t.length,
    optionalKeys: new Set(n)
  };
}
function wo(e, t, n, o, r, i) {
  const s = [], a = r.keySet, c = r.catchall._zod, u = c.def.type, l = c.optout === "optional";
  for (const d in t) {
    if (a.has(d))
      continue;
    if (u === "never") {
      s.push(d);
      continue;
    }
    const m = c.run({ value: t[d], issues: [] }, o);
    m instanceof Promise ? e.push(m.then((f) => nt(f, n, d, t, l))) : nt(m, n, d, t, l);
  }
  return s.length && n.issues.push({
    code: "unrecognized_keys",
    keys: s,
    input: t,
    inst: i
  }), e.length ? Promise.all(e).then(() => n) : n;
}
const Rs = /* @__PURE__ */ h("$ZodObject", (e, t) => {
  P.init(e, t);
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
  const o = Pt(() => yo(t));
  N(e._zod, "propValues", () => {
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
  const r = tt, i = t.catchall;
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
      const f = d[m], _ = f._zod.optout === "optional", w = f._zod.run({ value: u[m], issues: [] }, c);
      w instanceof Promise ? l.push(w.then((A) => nt(A, a, m, u, _))) : nt(w, a, m, u, _);
    }
    return i ? wo(l, u, a, c, o.value, e) : l.length ? Promise.all(l).then(() => a) : a;
  };
}), Is = /* @__PURE__ */ h("$ZodObjectJIT", (e, t) => {
  Rs.init(e, t);
  const n = e._zod.parse, o = Pt(() => yo(t)), r = (m) => {
    var g;
    const f = new ts(["shape", "payload", "ctx"]), _ = o.value, w = (k) => {
      const b = dn(k);
      return `shape[${b}]._zod.run({ value: input[${b}], issues: [] }, ctx)`;
    };
    f.write("const input = payload.value;");
    const A = /* @__PURE__ */ Object.create(null);
    let x = 0;
    for (const k of _.keys)
      A[k] = `key_${x++}`;
    f.write("const newResult = {};");
    for (const k of _.keys) {
      const b = A[k], S = dn(k), $ = m[k], q = ((g = $ == null ? void 0 : $._zod) == null ? void 0 : g.optout) === "optional";
      f.write(`const ${b} = ${w(k)};`), q ? f.write(`
        if (${b}.issues.length) {
          if (${S} in input) {
            payload.issues = payload.issues.concat(${b}.issues.map(iss => ({
              ...iss,
              path: iss.path ? [${S}, ...iss.path] : [${S}]
            })));
          }
        }
        
        if (${b}.value === undefined) {
          if (${S} in input) {
            newResult[${S}] = undefined;
          }
        } else {
          newResult[${S}] = ${b}.value;
        }
        
      `) : f.write(`
        if (${b}.issues.length) {
          payload.issues = payload.issues.concat(${b}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${S}, ...iss.path] : [${S}]
          })));
        }
        
        if (${b}.value === undefined) {
          if (${S} in input) {
            newResult[${S}] = undefined;
          }
        } else {
          newResult[${S}] = ${b}.value;
        }
        
      `);
    }
    f.write("payload.value = newResult;"), f.write("return payload;");
    const C = f.compile();
    return (k, b) => C(m, k, b);
  };
  let i;
  const s = tt, a = !oo.jitless, u = a && Xr.value, l = t.catchall;
  let d;
  e._zod.parse = (m, f) => {
    d ?? (d = o.value);
    const _ = m.value;
    return s(_) ? a && u && (f == null ? void 0 : f.async) === !1 && f.jitless !== !0 ? (i || (i = r(t.shape)), m = i(m, f), l ? wo([], _, m, f, d, e) : m) : n(m, f) : (m.issues.push({
      expected: "object",
      code: "invalid_type",
      input: _,
      inst: e
    }), m);
  };
});
function fn(e, t, n, o) {
  for (const i of e)
    if (i.issues.length === 0)
      return t.value = i.value, t;
  const r = e.filter((i) => !ye(i));
  return r.length === 1 ? (t.value = r[0].value, r[0]) : (t.issues.push({
    code: "invalid_union",
    input: t.value,
    inst: n,
    errors: e.map((i) => i.issues.map((s) => se(s, o, ie())))
  }), t);
}
const Ps = /* @__PURE__ */ h("$ZodUnion", (e, t) => {
  P.init(e, t), N(e._zod, "optin", () => t.options.some((r) => r._zod.optin === "optional") ? "optional" : void 0), N(e._zod, "optout", () => t.options.some((r) => r._zod.optout === "optional") ? "optional" : void 0), N(e._zod, "values", () => {
    if (t.options.every((r) => r._zod.values))
      return new Set(t.options.flatMap((r) => Array.from(r._zod.values)));
  }), N(e._zod, "pattern", () => {
    if (t.options.every((r) => r._zod.pattern)) {
      const r = t.options.map((i) => i._zod.pattern);
      return new RegExp(`^(${r.map((i) => Lt(i.source)).join("|")})$`);
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
    return s ? Promise.all(a).then((c) => fn(c, r, e, i)) : fn(a, r, e, i);
  };
}), Os = /* @__PURE__ */ h("$ZodIntersection", (e, t) => {
  P.init(e, t), e._zod.parse = (n, o) => {
    const r = n.value, i = t.left._zod.run({ value: r, issues: [] }, o), s = t.right._zod.run({ value: r, issues: [] }, o);
    return i instanceof Promise || s instanceof Promise ? Promise.all([i, s]).then(([c, u]) => mn(n, c, u)) : mn(n, i, s);
  };
});
function At(e, t) {
  if (e === t)
    return { valid: !0, data: e };
  if (e instanceof Date && t instanceof Date && +e == +t)
    return { valid: !0, data: e };
  if (Se(e) && Se(t)) {
    const n = Object.keys(t), o = Object.keys(e).filter((i) => n.indexOf(i) !== -1), r = { ...e, ...t };
    for (const i of o) {
      const s = At(e[i], t[i]);
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
      const r = e[o], i = t[o], s = At(r, i);
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
function mn(e, t, n) {
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
  if (i.length && r && e.issues.push({ ...r, keys: i }), ye(e))
    return e;
  const s = At(t.value, n.value);
  if (!s.valid)
    throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(s.mergeErrorPath)}`);
  return e.value = s.data, e;
}
const Ls = /* @__PURE__ */ h("$ZodRecord", (e, t) => {
  P.init(e, t), e._zod.parse = (n, o) => {
    const r = n.value;
    if (!Se(r))
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
            d.issues.length && n.issues.push(...we(u, d.issues)), n.value[u] = d.value;
          })) : (l.issues.length && n.issues.push(...we(u, l.issues)), n.value[u] = l.value);
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
        if (typeof a == "string" && fo.test(a) && c.issues.length) {
          const d = t.keyType._zod.run({ value: Number(a), issues: [] }, o);
          if (d instanceof Promise)
            throw new Error("Async schemas not supported in object keys currently");
          d.issues.length === 0 && (c = d);
        }
        if (c.issues.length) {
          t.mode === "loose" ? n.value[a] = r[a] : n.issues.push({
            code: "invalid_key",
            origin: "record",
            issues: c.issues.map((d) => se(d, o, ie())),
            input: a,
            path: [a],
            inst: e
          });
          continue;
        }
        const l = t.valueType._zod.run({ value: r[a], issues: [] }, o);
        l instanceof Promise ? i.push(l.then((d) => {
          d.issues.length && n.issues.push(...we(a, d.issues)), n.value[c.value] = d.value;
        })) : (l.issues.length && n.issues.push(...we(a, l.issues)), n.value[c.value] = l.value);
      }
    }
    return i.length ? Promise.all(i).then(() => n) : n;
  };
}), js = /* @__PURE__ */ h("$ZodEnum", (e, t) => {
  P.init(e, t);
  const n = ro(t.entries), o = new Set(n);
  e._zod.values = o, e._zod.pattern = new RegExp(`^(${n.filter((r) => Yr.has(typeof r)).map((r) => typeof r == "string" ? lt(r) : r.toString()).join("|")})$`), e._zod.parse = (r, i) => {
    const s = r.value;
    return o.has(s) || r.issues.push({
      code: "invalid_value",
      values: n,
      input: s,
      inst: e
    }), r;
  };
}), Ms = /* @__PURE__ */ h("$ZodTransform", (e, t) => {
  P.init(e, t), e._zod.parse = (n, o) => {
    if (o.direction === "backward")
      throw new no(e.constructor.name);
    const r = t.transform(n.value, n);
    if (o.async)
      return (r instanceof Promise ? r : Promise.resolve(r)).then((s) => (n.value = s, n));
    if (r instanceof Promise)
      throw new ke();
    return n.value = r, n;
  };
});
function _n(e, t) {
  return e.issues.length && t === void 0 ? { issues: [], value: void 0 } : e;
}
const ko = /* @__PURE__ */ h("$ZodOptional", (e, t) => {
  P.init(e, t), e._zod.optin = "optional", e._zod.optout = "optional", N(e._zod, "values", () => t.innerType._zod.values ? /* @__PURE__ */ new Set([...t.innerType._zod.values, void 0]) : void 0), N(e._zod, "pattern", () => {
    const n = t.innerType._zod.pattern;
    return n ? new RegExp(`^(${Lt(n.source)})?$`) : void 0;
  }), e._zod.parse = (n, o) => {
    if (t.innerType._zod.optin === "optional") {
      const r = t.innerType._zod.run(n, o);
      return r instanceof Promise ? r.then((i) => _n(i, n.value)) : _n(r, n.value);
    }
    return n.value === void 0 ? n : t.innerType._zod.run(n, o);
  };
}), Ds = /* @__PURE__ */ h("$ZodExactOptional", (e, t) => {
  ko.init(e, t), N(e._zod, "values", () => t.innerType._zod.values), N(e._zod, "pattern", () => t.innerType._zod.pattern), e._zod.parse = (n, o) => t.innerType._zod.run(n, o);
}), Us = /* @__PURE__ */ h("$ZodNullable", (e, t) => {
  P.init(e, t), N(e._zod, "optin", () => t.innerType._zod.optin), N(e._zod, "optout", () => t.innerType._zod.optout), N(e._zod, "pattern", () => {
    const n = t.innerType._zod.pattern;
    return n ? new RegExp(`^(${Lt(n.source)}|null)$`) : void 0;
  }), N(e._zod, "values", () => t.innerType._zod.values ? /* @__PURE__ */ new Set([...t.innerType._zod.values, null]) : void 0), e._zod.parse = (n, o) => n.value === null ? n : t.innerType._zod.run(n, o);
}), Bs = /* @__PURE__ */ h("$ZodDefault", (e, t) => {
  P.init(e, t), e._zod.optin = "optional", N(e._zod, "values", () => t.innerType._zod.values), e._zod.parse = (n, o) => {
    if (o.direction === "backward")
      return t.innerType._zod.run(n, o);
    if (n.value === void 0)
      return n.value = t.defaultValue, n;
    const r = t.innerType._zod.run(n, o);
    return r instanceof Promise ? r.then((i) => gn(i, t)) : gn(r, t);
  };
});
function gn(e, t) {
  return e.value === void 0 && (e.value = t.defaultValue), e;
}
const Fs = /* @__PURE__ */ h("$ZodPrefault", (e, t) => {
  P.init(e, t), e._zod.optin = "optional", N(e._zod, "values", () => t.innerType._zod.values), e._zod.parse = (n, o) => (o.direction === "backward" || n.value === void 0 && (n.value = t.defaultValue), t.innerType._zod.run(n, o));
}), Hs = /* @__PURE__ */ h("$ZodNonOptional", (e, t) => {
  P.init(e, t), N(e._zod, "values", () => {
    const n = t.innerType._zod.values;
    return n ? new Set([...n].filter((o) => o !== void 0)) : void 0;
  }), e._zod.parse = (n, o) => {
    const r = t.innerType._zod.run(n, o);
    return r instanceof Promise ? r.then((i) => bn(i, e)) : bn(r, e);
  };
});
function bn(e, t) {
  return !e.issues.length && e.value === void 0 && e.issues.push({
    code: "invalid_type",
    expected: "nonoptional",
    input: e.value,
    inst: t
  }), e;
}
const Js = /* @__PURE__ */ h("$ZodCatch", (e, t) => {
  P.init(e, t), N(e._zod, "optin", () => t.innerType._zod.optin), N(e._zod, "optout", () => t.innerType._zod.optout), N(e._zod, "values", () => t.innerType._zod.values), e._zod.parse = (n, o) => {
    if (o.direction === "backward")
      return t.innerType._zod.run(n, o);
    const r = t.innerType._zod.run(n, o);
    return r instanceof Promise ? r.then((i) => (n.value = i.value, i.issues.length && (n.value = t.catchValue({
      ...n,
      error: {
        issues: i.issues.map((s) => se(s, o, ie()))
      },
      input: n.value
    }), n.issues = []), n)) : (n.value = r.value, r.issues.length && (n.value = t.catchValue({
      ...n,
      error: {
        issues: r.issues.map((i) => se(i, o, ie()))
      },
      input: n.value
    }), n.issues = []), n);
  };
}), Ws = /* @__PURE__ */ h("$ZodPipe", (e, t) => {
  P.init(e, t), N(e._zod, "values", () => t.in._zod.values), N(e._zod, "optin", () => t.in._zod.optin), N(e._zod, "optout", () => t.out._zod.optout), N(e._zod, "propValues", () => t.in._zod.propValues), e._zod.parse = (n, o) => {
    if (o.direction === "backward") {
      const i = t.out._zod.run(n, o);
      return i instanceof Promise ? i.then((s) => Ve(s, t.in, o)) : Ve(i, t.in, o);
    }
    const r = t.in._zod.run(n, o);
    return r instanceof Promise ? r.then((i) => Ve(i, t.out, o)) : Ve(r, t.out, o);
  };
});
function Ve(e, t, n) {
  return e.issues.length ? (e.aborted = !0, e) : t._zod.run({ value: e.value, issues: e.issues }, n);
}
const Vs = /* @__PURE__ */ h("$ZodReadonly", (e, t) => {
  P.init(e, t), N(e._zod, "propValues", () => t.innerType._zod.propValues), N(e._zod, "values", () => t.innerType._zod.values), N(e._zod, "optin", () => {
    var n, o;
    return (o = (n = t.innerType) == null ? void 0 : n._zod) == null ? void 0 : o.optin;
  }), N(e._zod, "optout", () => {
    var n, o;
    return (o = (n = t.innerType) == null ? void 0 : n._zod) == null ? void 0 : o.optout;
  }), e._zod.parse = (n, o) => {
    if (o.direction === "backward")
      return t.innerType._zod.run(n, o);
    const r = t.innerType._zod.run(n, o);
    return r instanceof Promise ? r.then(vn) : vn(r);
  };
});
function vn(e) {
  return e.value = Object.freeze(e.value), e;
}
const qs = /* @__PURE__ */ h("$ZodCustom", (e, t) => {
  J.init(e, t), P.init(e, t), e._zod.parse = (n, o) => n, e._zod.check = (n) => {
    const o = n.value, r = t.fn(o);
    if (r instanceof Promise)
      return r.then((i) => yn(i, n, o, e));
    yn(r, n, o, e);
  };
});
function yn(e, t, n, o) {
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
    o._zod.def.params && (r.params = o._zod.def.params), t.issues.push(Ue(r));
  }
}
var wn;
class Xs {
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
function Ys() {
  return new Xs();
}
(wn = globalThis).__zod_globalRegistry ?? (wn.__zod_globalRegistry = Ys());
const Ie = globalThis.__zod_globalRegistry;
// @__NO_SIDE_EFFECTS__
function Ks(e, t) {
  return new e({
    type: "string",
    ...y(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Gs(e, t) {
  return new e({
    type: "string",
    format: "email",
    check: "string_format",
    abort: !1,
    ...y(t)
  });
}
// @__NO_SIDE_EFFECTS__
function kn(e, t) {
  return new e({
    type: "string",
    format: "guid",
    check: "string_format",
    abort: !1,
    ...y(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Qs(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    ...y(t)
  });
}
// @__NO_SIDE_EFFECTS__
function ea(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v4",
    ...y(t)
  });
}
// @__NO_SIDE_EFFECTS__
function ta(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v6",
    ...y(t)
  });
}
// @__NO_SIDE_EFFECTS__
function na(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v7",
    ...y(t)
  });
}
// @__NO_SIDE_EFFECTS__
function oa(e, t) {
  return new e({
    type: "string",
    format: "url",
    check: "string_format",
    abort: !1,
    ...y(t)
  });
}
// @__NO_SIDE_EFFECTS__
function ra(e, t) {
  return new e({
    type: "string",
    format: "emoji",
    check: "string_format",
    abort: !1,
    ...y(t)
  });
}
// @__NO_SIDE_EFFECTS__
function ia(e, t) {
  return new e({
    type: "string",
    format: "nanoid",
    check: "string_format",
    abort: !1,
    ...y(t)
  });
}
// @__NO_SIDE_EFFECTS__
function sa(e, t) {
  return new e({
    type: "string",
    format: "cuid",
    check: "string_format",
    abort: !1,
    ...y(t)
  });
}
// @__NO_SIDE_EFFECTS__
function aa(e, t) {
  return new e({
    type: "string",
    format: "cuid2",
    check: "string_format",
    abort: !1,
    ...y(t)
  });
}
// @__NO_SIDE_EFFECTS__
function ca(e, t) {
  return new e({
    type: "string",
    format: "ulid",
    check: "string_format",
    abort: !1,
    ...y(t)
  });
}
// @__NO_SIDE_EFFECTS__
function ua(e, t) {
  return new e({
    type: "string",
    format: "xid",
    check: "string_format",
    abort: !1,
    ...y(t)
  });
}
// @__NO_SIDE_EFFECTS__
function la(e, t) {
  return new e({
    type: "string",
    format: "ksuid",
    check: "string_format",
    abort: !1,
    ...y(t)
  });
}
// @__NO_SIDE_EFFECTS__
function da(e, t) {
  return new e({
    type: "string",
    format: "ipv4",
    check: "string_format",
    abort: !1,
    ...y(t)
  });
}
// @__NO_SIDE_EFFECTS__
function ha(e, t) {
  return new e({
    type: "string",
    format: "ipv6",
    check: "string_format",
    abort: !1,
    ...y(t)
  });
}
// @__NO_SIDE_EFFECTS__
function pa(e, t) {
  return new e({
    type: "string",
    format: "cidrv4",
    check: "string_format",
    abort: !1,
    ...y(t)
  });
}
// @__NO_SIDE_EFFECTS__
function fa(e, t) {
  return new e({
    type: "string",
    format: "cidrv6",
    check: "string_format",
    abort: !1,
    ...y(t)
  });
}
// @__NO_SIDE_EFFECTS__
function ma(e, t) {
  return new e({
    type: "string",
    format: "base64",
    check: "string_format",
    abort: !1,
    ...y(t)
  });
}
// @__NO_SIDE_EFFECTS__
function _a(e, t) {
  return new e({
    type: "string",
    format: "base64url",
    check: "string_format",
    abort: !1,
    ...y(t)
  });
}
// @__NO_SIDE_EFFECTS__
function ga(e, t) {
  return new e({
    type: "string",
    format: "e164",
    check: "string_format",
    abort: !1,
    ...y(t)
  });
}
// @__NO_SIDE_EFFECTS__
function ba(e, t) {
  return new e({
    type: "string",
    format: "jwt",
    check: "string_format",
    abort: !1,
    ...y(t)
  });
}
// @__NO_SIDE_EFFECTS__
function va(e, t) {
  return new e({
    type: "string",
    format: "datetime",
    check: "string_format",
    offset: !1,
    local: !1,
    precision: null,
    ...y(t)
  });
}
// @__NO_SIDE_EFFECTS__
function ya(e, t) {
  return new e({
    type: "string",
    format: "date",
    check: "string_format",
    ...y(t)
  });
}
// @__NO_SIDE_EFFECTS__
function wa(e, t) {
  return new e({
    type: "string",
    format: "time",
    check: "string_format",
    precision: null,
    ...y(t)
  });
}
// @__NO_SIDE_EFFECTS__
function ka(e, t) {
  return new e({
    type: "string",
    format: "duration",
    check: "string_format",
    ...y(t)
  });
}
// @__NO_SIDE_EFFECTS__
function $a(e, t) {
  return new e({
    type: "number",
    checks: [],
    ...y(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Ea(e, t) {
  return new e({
    type: "number",
    check: "number_format",
    abort: !1,
    format: "safeint",
    ...y(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Sa(e, t) {
  return new e({
    type: "boolean",
    ...y(t)
  });
}
// @__NO_SIDE_EFFECTS__
function za(e) {
  return new e({
    type: "unknown"
  });
}
// @__NO_SIDE_EFFECTS__
function Ca(e, t) {
  return new e({
    type: "never",
    ...y(t)
  });
}
// @__NO_SIDE_EFFECTS__
function $n(e, t) {
  return new _o({
    check: "less_than",
    ...y(t),
    value: e,
    inclusive: !1
  });
}
// @__NO_SIDE_EFFECTS__
function yt(e, t) {
  return new _o({
    check: "less_than",
    ...y(t),
    value: e,
    inclusive: !0
  });
}
// @__NO_SIDE_EFFECTS__
function En(e, t) {
  return new go({
    check: "greater_than",
    ...y(t),
    value: e,
    inclusive: !1
  });
}
// @__NO_SIDE_EFFECTS__
function wt(e, t) {
  return new go({
    check: "greater_than",
    ...y(t),
    value: e,
    inclusive: !0
  });
}
// @__NO_SIDE_EFFECTS__
function Sn(e, t) {
  return new Fi({
    check: "multiple_of",
    ...y(t),
    value: e
  });
}
// @__NO_SIDE_EFFECTS__
function $o(e, t) {
  return new Ji({
    check: "max_length",
    ...y(t),
    maximum: e
  });
}
// @__NO_SIDE_EFFECTS__
function ot(e, t) {
  return new Wi({
    check: "min_length",
    ...y(t),
    minimum: e
  });
}
// @__NO_SIDE_EFFECTS__
function Eo(e, t) {
  return new Vi({
    check: "length_equals",
    ...y(t),
    length: e
  });
}
// @__NO_SIDE_EFFECTS__
function xa(e, t) {
  return new qi({
    check: "string_format",
    format: "regex",
    ...y(t),
    pattern: e
  });
}
// @__NO_SIDE_EFFECTS__
function Aa(e) {
  return new Xi({
    check: "string_format",
    format: "lowercase",
    ...y(e)
  });
}
// @__NO_SIDE_EFFECTS__
function Na(e) {
  return new Yi({
    check: "string_format",
    format: "uppercase",
    ...y(e)
  });
}
// @__NO_SIDE_EFFECTS__
function Za(e, t) {
  return new Ki({
    check: "string_format",
    format: "includes",
    ...y(t),
    includes: e
  });
}
// @__NO_SIDE_EFFECTS__
function Ta(e, t) {
  return new Gi({
    check: "string_format",
    format: "starts_with",
    ...y(t),
    prefix: e
  });
}
// @__NO_SIDE_EFFECTS__
function Ra(e, t) {
  return new Qi({
    check: "string_format",
    format: "ends_with",
    ...y(t),
    suffix: e
  });
}
// @__NO_SIDE_EFFECTS__
function ze(e) {
  return new es({
    check: "overwrite",
    tx: e
  });
}
// @__NO_SIDE_EFFECTS__
function Ia(e) {
  return /* @__PURE__ */ ze((t) => t.normalize(e));
}
// @__NO_SIDE_EFFECTS__
function Pa() {
  return /* @__PURE__ */ ze((e) => e.trim());
}
// @__NO_SIDE_EFFECTS__
function Oa() {
  return /* @__PURE__ */ ze((e) => e.toLowerCase());
}
// @__NO_SIDE_EFFECTS__
function La() {
  return /* @__PURE__ */ ze((e) => e.toUpperCase());
}
// @__NO_SIDE_EFFECTS__
function ja() {
  return /* @__PURE__ */ ze((e) => qr(e));
}
// @__NO_SIDE_EFFECTS__
function Ma(e, t, n) {
  return new e({
    type: "array",
    element: t,
    // get element() {
    //   return element;
    // },
    ...y(n)
  });
}
// @__NO_SIDE_EFFECTS__
function Da(e, t, n) {
  return new e({
    type: "custom",
    check: "custom",
    fn: t,
    ...y(n)
  });
}
// @__NO_SIDE_EFFECTS__
function Ua(e) {
  const t = /* @__PURE__ */ Ba((n) => (n.addIssue = (o) => {
    if (typeof o == "string")
      n.issues.push(Ue(o, n.value, t._zod.def));
    else {
      const r = o;
      r.fatal && (r.continue = !1), r.code ?? (r.code = "custom"), r.input ?? (r.input = n.value), r.inst ?? (r.inst = t), r.continue ?? (r.continue = !t._zod.def.abort), n.issues.push(Ue(r));
    }
  }, e(n.value, n)));
  return t;
}
// @__NO_SIDE_EFFECTS__
function Ba(e, t) {
  const n = new J({
    check: "custom",
    ...y(t)
  });
  return n._zod.check = e, n;
}
function So(e) {
  let t = (e == null ? void 0 : e.target) ?? "draft-2020-12";
  return t === "draft-4" && (t = "draft-04"), t === "draft-7" && (t = "draft-07"), {
    processors: e.processors ?? {},
    metadataRegistry: (e == null ? void 0 : e.metadata) ?? Ie,
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
function D(e, t, n = { path: [], schemaPath: [] }) {
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
      const _ = s.schema, w = t.processors[r.type];
      if (!w)
        throw new Error(`[toJSONSchema]: Non-representable type encountered: ${r.type}`);
      w(e, t, _, m);
    }
    const f = e._zod.parent;
    f && (s.ref || (s.ref = f), D(f, t, m), t.seen.get(f).isParent = !0);
  }
  const c = t.metadataRegistry.get(e);
  return c && Object.assign(s.schema, c), t.io === "input" && F(e) && (delete s.schema.examples, delete s.schema.default), t.io === "input" && s.schema._prefault && ((o = s.schema).default ?? (o.default = s.schema._prefault)), delete s.schema._prefault, t.seen.get(e).schema;
}
function zo(e, t) {
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
    var w;
    const d = e.target === "draft-2020-12" ? "$defs" : "definitions";
    if (e.external) {
      const A = (w = e.external.registry.get(l[0])) == null ? void 0 : w.id, x = e.external.uri ?? ((g) => g);
      if (A)
        return { ref: x(A) };
      const C = l[1].defId ?? l[1].schema.id ?? `schema${e.counter++}`;
      return l[1].defId = C, { defId: C, ref: `${x("__shared")}#/${d}/${C}` };
    }
    if (l[1] === n)
      return { ref: "#" };
    const f = `#/${d}/`, _ = l[1].schema.id ?? `__schema${e.counter++}`;
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
function Co(e, t) {
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
      const w = e.seen.get(f), A = w.schema;
      if (A.$ref && (e.target === "draft-07" || e.target === "draft-04" || e.target === "openapi-3.0") ? (d.allOf = d.allOf ?? [], d.allOf.push(A)) : Object.assign(d, A), Object.assign(d, m), u._zod.parent === f)
        for (const C in d)
          C === "$ref" || C === "allOf" || C in m || delete d[C];
      if (A.$ref && w.def)
        for (const C in d)
          C === "$ref" || C === "allOf" || C in w.def && JSON.stringify(d[C]) === JSON.stringify(w.def[C]) && delete d[C];
    }
    const _ = u._zod.parent;
    if (_ && _ !== f) {
      o(_);
      const w = e.seen.get(_);
      if (w != null && w.schema.$ref && (d.$ref = w.schema.$ref, w.def))
        for (const A in d)
          A === "$ref" || A === "allOf" || A in w.def && JSON.stringify(d[A]) === JSON.stringify(w.def[A]) && delete d[A];
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
          input: rt(t, "input", e.processors),
          output: rt(t, "output", e.processors)
        }
      },
      enumerable: !1,
      writable: !1
    }), u;
  } catch {
    throw new Error("Error converting schema to JSON.");
  }
}
function F(e, t) {
  const n = t ?? { seen: /* @__PURE__ */ new Set() };
  if (n.seen.has(e))
    return !1;
  n.seen.add(e);
  const o = e._zod.def;
  if (o.type === "transform")
    return !0;
  if (o.type === "array")
    return F(o.element, n);
  if (o.type === "set")
    return F(o.valueType, n);
  if (o.type === "lazy")
    return F(o.getter(), n);
  if (o.type === "promise" || o.type === "optional" || o.type === "nonoptional" || o.type === "nullable" || o.type === "readonly" || o.type === "default" || o.type === "prefault")
    return F(o.innerType, n);
  if (o.type === "intersection")
    return F(o.left, n) || F(o.right, n);
  if (o.type === "record" || o.type === "map")
    return F(o.keyType, n) || F(o.valueType, n);
  if (o.type === "pipe")
    return F(o.in, n) || F(o.out, n);
  if (o.type === "object") {
    for (const r in o.shape)
      if (F(o.shape[r], n))
        return !0;
    return !1;
  }
  if (o.type === "union") {
    for (const r of o.options)
      if (F(r, n))
        return !0;
    return !1;
  }
  if (o.type === "tuple") {
    for (const r of o.items)
      if (F(r, n))
        return !0;
    return !!(o.rest && F(o.rest, n));
  }
  return !1;
}
const Fa = (e, t = {}) => (n) => {
  const o = So({ ...n, processors: t });
  return D(e, o), zo(o, e), Co(o, e);
}, rt = (e, t, n = {}) => (o) => {
  const { libraryOptions: r, target: i } = o ?? {}, s = So({ ...r ?? {}, target: i, io: t, processors: n });
  return D(e, s), zo(s, e), Co(s, e);
}, Ha = {
  guid: "uuid",
  url: "uri",
  datetime: "date-time",
  json_string: "json-string",
  regex: ""
  // do not set
}, Ja = (e, t, n, o) => {
  const r = n;
  r.type = "string";
  const { minimum: i, maximum: s, format: a, patterns: c, contentEncoding: u } = e._zod.bag;
  if (typeof i == "number" && (r.minLength = i), typeof s == "number" && (r.maxLength = s), a && (r.format = Ha[a] ?? a, r.format === "" && delete r.format, a === "time" && delete r.format), u && (r.contentEncoding = u), c && c.size > 0) {
    const l = [...c];
    l.length === 1 ? r.pattern = l[0].source : l.length > 1 && (r.allOf = [
      ...l.map((d) => ({
        ...t.target === "draft-07" || t.target === "draft-04" || t.target === "openapi-3.0" ? { type: "string" } : {},
        pattern: d.source
      }))
    ]);
  }
}, Wa = (e, t, n, o) => {
  const r = n, { minimum: i, maximum: s, format: a, multipleOf: c, exclusiveMaximum: u, exclusiveMinimum: l } = e._zod.bag;
  typeof a == "string" && a.includes("int") ? r.type = "integer" : r.type = "number", typeof l == "number" && (t.target === "draft-04" || t.target === "openapi-3.0" ? (r.minimum = l, r.exclusiveMinimum = !0) : r.exclusiveMinimum = l), typeof i == "number" && (r.minimum = i, typeof l == "number" && t.target !== "draft-04" && (l >= i ? delete r.minimum : delete r.exclusiveMinimum)), typeof u == "number" && (t.target === "draft-04" || t.target === "openapi-3.0" ? (r.maximum = u, r.exclusiveMaximum = !0) : r.exclusiveMaximum = u), typeof s == "number" && (r.maximum = s, typeof u == "number" && t.target !== "draft-04" && (u <= s ? delete r.maximum : delete r.exclusiveMaximum)), typeof c == "number" && (r.multipleOf = c);
}, Va = (e, t, n, o) => {
  n.type = "boolean";
}, qa = (e, t, n, o) => {
  n.not = {};
}, Xa = (e, t, n, o) => {
}, Ya = (e, t, n, o) => {
  const r = e._zod.def, i = ro(r.entries);
  i.every((s) => typeof s == "number") && (n.type = "number"), i.every((s) => typeof s == "string") && (n.type = "string"), n.enum = i;
}, Ka = (e, t, n, o) => {
  if (t.unrepresentable === "throw")
    throw new Error("Custom types cannot be represented in JSON Schema");
}, Ga = (e, t, n, o) => {
  if (t.unrepresentable === "throw")
    throw new Error("Transforms cannot be represented in JSON Schema");
}, Qa = (e, t, n, o) => {
  const r = n, i = e._zod.def, { minimum: s, maximum: a } = e._zod.bag;
  typeof s == "number" && (r.minItems = s), typeof a == "number" && (r.maxItems = a), r.type = "array", r.items = D(i.element, t, { ...o, path: [...o.path, "items"] });
}, ec = (e, t, n, o) => {
  var u;
  const r = n, i = e._zod.def;
  r.type = "object", r.properties = {};
  const s = i.shape;
  for (const l in s)
    r.properties[l] = D(s[l], t, {
      ...o,
      path: [...o.path, "properties", l]
    });
  const a = new Set(Object.keys(s)), c = new Set([...a].filter((l) => {
    const d = i.shape[l]._zod;
    return t.io === "input" ? d.optin === void 0 : d.optout === void 0;
  }));
  c.size > 0 && (r.required = Array.from(c)), ((u = i.catchall) == null ? void 0 : u._zod.def.type) === "never" ? r.additionalProperties = !1 : i.catchall ? i.catchall && (r.additionalProperties = D(i.catchall, t, {
    ...o,
    path: [...o.path, "additionalProperties"]
  })) : t.io === "output" && (r.additionalProperties = !1);
}, tc = (e, t, n, o) => {
  const r = e._zod.def, i = r.inclusive === !1, s = r.options.map((a, c) => D(a, t, {
    ...o,
    path: [...o.path, i ? "oneOf" : "anyOf", c]
  }));
  i ? n.oneOf = s : n.anyOf = s;
}, nc = (e, t, n, o) => {
  const r = e._zod.def, i = D(r.left, t, {
    ...o,
    path: [...o.path, "allOf", 0]
  }), s = D(r.right, t, {
    ...o,
    path: [...o.path, "allOf", 1]
  }), a = (u) => "allOf" in u && Object.keys(u).length === 1, c = [
    ...a(i) ? i.allOf : [i],
    ...a(s) ? s.allOf : [s]
  ];
  n.allOf = c;
}, oc = (e, t, n, o) => {
  const r = n, i = e._zod.def;
  r.type = "object";
  const s = i.keyType, a = s._zod.bag, c = a == null ? void 0 : a.patterns;
  if (i.mode === "loose" && c && c.size > 0) {
    const l = D(i.valueType, t, {
      ...o,
      path: [...o.path, "patternProperties", "*"]
    });
    r.patternProperties = {};
    for (const d of c)
      r.patternProperties[d.source] = l;
  } else
    (t.target === "draft-07" || t.target === "draft-2020-12") && (r.propertyNames = D(i.keyType, t, {
      ...o,
      path: [...o.path, "propertyNames"]
    })), r.additionalProperties = D(i.valueType, t, {
      ...o,
      path: [...o.path, "additionalProperties"]
    });
  const u = s._zod.values;
  if (u) {
    const l = [...u].filter((d) => typeof d == "string" || typeof d == "number");
    l.length > 0 && (r.required = l);
  }
}, rc = (e, t, n, o) => {
  const r = e._zod.def, i = D(r.innerType, t, o), s = t.seen.get(e);
  t.target === "openapi-3.0" ? (s.ref = r.innerType, n.nullable = !0) : n.anyOf = [i, { type: "null" }];
}, ic = (e, t, n, o) => {
  const r = e._zod.def;
  D(r.innerType, t, o);
  const i = t.seen.get(e);
  i.ref = r.innerType;
}, sc = (e, t, n, o) => {
  const r = e._zod.def;
  D(r.innerType, t, o);
  const i = t.seen.get(e);
  i.ref = r.innerType, n.default = JSON.parse(JSON.stringify(r.defaultValue));
}, ac = (e, t, n, o) => {
  const r = e._zod.def;
  D(r.innerType, t, o);
  const i = t.seen.get(e);
  i.ref = r.innerType, t.io === "input" && (n._prefault = JSON.parse(JSON.stringify(r.defaultValue)));
}, cc = (e, t, n, o) => {
  const r = e._zod.def;
  D(r.innerType, t, o);
  const i = t.seen.get(e);
  i.ref = r.innerType;
  let s;
  try {
    s = r.catchValue(void 0);
  } catch {
    throw new Error("Dynamic catch values are not supported in JSON Schema");
  }
  n.default = s;
}, uc = (e, t, n, o) => {
  const r = e._zod.def, i = t.io === "input" ? r.in._zod.def.type === "transform" ? r.out : r.in : r.out;
  D(i, t, o);
  const s = t.seen.get(e);
  s.ref = i;
}, lc = (e, t, n, o) => {
  const r = e._zod.def;
  D(r.innerType, t, o);
  const i = t.seen.get(e);
  i.ref = r.innerType, n.readOnly = !0;
}, xo = (e, t, n, o) => {
  const r = e._zod.def;
  D(r.innerType, t, o);
  const i = t.seen.get(e);
  i.ref = r.innerType;
}, dc = /* @__PURE__ */ h("ZodISODateTime", (e, t) => {
  fs.init(e, t), I.init(e, t);
});
function hc(e) {
  return /* @__PURE__ */ va(dc, e);
}
const pc = /* @__PURE__ */ h("ZodISODate", (e, t) => {
  ms.init(e, t), I.init(e, t);
});
function fc(e) {
  return /* @__PURE__ */ ya(pc, e);
}
const mc = /* @__PURE__ */ h("ZodISOTime", (e, t) => {
  _s.init(e, t), I.init(e, t);
});
function _c(e) {
  return /* @__PURE__ */ wa(mc, e);
}
const gc = /* @__PURE__ */ h("ZodISODuration", (e, t) => {
  gs.init(e, t), I.init(e, t);
});
function bc(e) {
  return /* @__PURE__ */ ka(gc, e);
}
const vc = (e, t) => {
  co.init(e, t), e.name = "ZodError", Object.defineProperties(e, {
    format: {
      value: (n) => ai(e, n)
      // enumerable: false,
    },
    flatten: {
      value: (n) => si(e, n)
      // enumerable: false,
    },
    addIssue: {
      value: (n) => {
        e.issues.push(n), e.message = JSON.stringify(e.issues, xt, 2);
      }
      // enumerable: false,
    },
    addIssues: {
      value: (n) => {
        e.issues.push(...n), e.message = JSON.stringify(e.issues, xt, 2);
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
}, V = h("ZodError", vc, {
  Parent: Error
}), yc = /* @__PURE__ */ Mt(V), wc = /* @__PURE__ */ Dt(V), kc = /* @__PURE__ */ dt(V), $c = /* @__PURE__ */ ht(V), Ec = /* @__PURE__ */ li(V), Sc = /* @__PURE__ */ di(V), zc = /* @__PURE__ */ hi(V), Cc = /* @__PURE__ */ pi(V), xc = /* @__PURE__ */ fi(V), Ac = /* @__PURE__ */ mi(V), Nc = /* @__PURE__ */ _i(V), Zc = /* @__PURE__ */ gi(V), O = /* @__PURE__ */ h("ZodType", (e, t) => (P.init(e, t), Object.assign(e["~standard"], {
  jsonSchema: {
    input: rt(e, "input"),
    output: rt(e, "output")
  }
}), e.toJSONSchema = Fa(e, {}), e.def = t, e.type = t.type, Object.defineProperty(e, "_def", { value: t }), e.check = (...n) => e.clone(ae(t, {
  checks: [
    ...t.checks ?? [],
    ...n.map((o) => typeof o == "function" ? { _zod: { check: o, def: { check: "custom" }, onattach: [] } } : o)
  ]
}), {
  parent: !0
}), e.with = e.check, e.clone = (n, o) => ce(e, n, o), e.brand = () => e, e.register = (n, o) => (n.add(e, o), e), e.parse = (n, o) => yc(e, n, o, { callee: e.parse }), e.safeParse = (n, o) => kc(e, n, o), e.parseAsync = async (n, o) => wc(e, n, o, { callee: e.parseAsync }), e.safeParseAsync = async (n, o) => $c(e, n, o), e.spa = e.safeParseAsync, e.encode = (n, o) => Ec(e, n, o), e.decode = (n, o) => Sc(e, n, o), e.encodeAsync = async (n, o) => zc(e, n, o), e.decodeAsync = async (n, o) => Cc(e, n, o), e.safeEncode = (n, o) => xc(e, n, o), e.safeDecode = (n, o) => Ac(e, n, o), e.safeEncodeAsync = async (n, o) => Nc(e, n, o), e.safeDecodeAsync = async (n, o) => Zc(e, n, o), e.refine = (n, o) => e.check($u(n, o)), e.superRefine = (n) => e.check(Eu(n)), e.overwrite = (n) => e.check(/* @__PURE__ */ ze(n)), e.optional = () => xn(e), e.exactOptional = () => du(e), e.nullable = () => An(e), e.nullish = () => xn(An(e)), e.nonoptional = (n) => _u(e, n), e.array = () => Be(e), e.or = (n) => ou([e, n]), e.and = (n) => iu(e, n), e.transform = (n) => Nn(e, uu(n)), e.default = (n) => pu(e, n), e.prefault = (n) => mu(e, n), e.catch = (n) => bu(e, n), e.pipe = (n) => Nn(e, n), e.readonly = () => wu(e), e.describe = (n) => {
  const o = e.clone();
  return Ie.add(o, { description: n }), o;
}, Object.defineProperty(e, "description", {
  get() {
    var n;
    return (n = Ie.get(e)) == null ? void 0 : n.description;
  },
  configurable: !0
}), e.meta = (...n) => {
  if (n.length === 0)
    return Ie.get(e);
  const o = e.clone();
  return Ie.add(o, n[0]), o;
}, e.isOptional = () => e.safeParse(void 0).success, e.isNullable = () => e.safeParse(null).success, e.apply = (n) => n(e), e)), Ao = /* @__PURE__ */ h("_ZodString", (e, t) => {
  Ut.init(e, t), O.init(e, t), e._zod.processJSONSchema = (o, r, i) => Ja(e, o, r);
  const n = e._zod.bag;
  e.format = n.format ?? null, e.minLength = n.minimum ?? null, e.maxLength = n.maximum ?? null, e.regex = (...o) => e.check(/* @__PURE__ */ xa(...o)), e.includes = (...o) => e.check(/* @__PURE__ */ Za(...o)), e.startsWith = (...o) => e.check(/* @__PURE__ */ Ta(...o)), e.endsWith = (...o) => e.check(/* @__PURE__ */ Ra(...o)), e.min = (...o) => e.check(/* @__PURE__ */ ot(...o)), e.max = (...o) => e.check(/* @__PURE__ */ $o(...o)), e.length = (...o) => e.check(/* @__PURE__ */ Eo(...o)), e.nonempty = (...o) => e.check(/* @__PURE__ */ ot(1, ...o)), e.lowercase = (o) => e.check(/* @__PURE__ */ Aa(o)), e.uppercase = (o) => e.check(/* @__PURE__ */ Na(o)), e.trim = () => e.check(/* @__PURE__ */ Pa()), e.normalize = (...o) => e.check(/* @__PURE__ */ Ia(...o)), e.toLowerCase = () => e.check(/* @__PURE__ */ Oa()), e.toUpperCase = () => e.check(/* @__PURE__ */ La()), e.slugify = () => e.check(/* @__PURE__ */ ja());
}), No = /* @__PURE__ */ h("ZodString", (e, t) => {
  Ut.init(e, t), Ao.init(e, t), e.email = (n) => e.check(/* @__PURE__ */ Gs(Tc, n)), e.url = (n) => e.check(/* @__PURE__ */ oa(Rc, n)), e.jwt = (n) => e.check(/* @__PURE__ */ ba(qc, n)), e.emoji = (n) => e.check(/* @__PURE__ */ ra(Ic, n)), e.guid = (n) => e.check(/* @__PURE__ */ kn(zn, n)), e.uuid = (n) => e.check(/* @__PURE__ */ Qs(qe, n)), e.uuidv4 = (n) => e.check(/* @__PURE__ */ ea(qe, n)), e.uuidv6 = (n) => e.check(/* @__PURE__ */ ta(qe, n)), e.uuidv7 = (n) => e.check(/* @__PURE__ */ na(qe, n)), e.nanoid = (n) => e.check(/* @__PURE__ */ ia(Pc, n)), e.guid = (n) => e.check(/* @__PURE__ */ kn(zn, n)), e.cuid = (n) => e.check(/* @__PURE__ */ sa(Oc, n)), e.cuid2 = (n) => e.check(/* @__PURE__ */ aa(Lc, n)), e.ulid = (n) => e.check(/* @__PURE__ */ ca(jc, n)), e.base64 = (n) => e.check(/* @__PURE__ */ ma(Jc, n)), e.base64url = (n) => e.check(/* @__PURE__ */ _a(Wc, n)), e.xid = (n) => e.check(/* @__PURE__ */ ua(Mc, n)), e.ksuid = (n) => e.check(/* @__PURE__ */ la(Dc, n)), e.ipv4 = (n) => e.check(/* @__PURE__ */ da(Uc, n)), e.ipv6 = (n) => e.check(/* @__PURE__ */ ha(Bc, n)), e.cidrv4 = (n) => e.check(/* @__PURE__ */ pa(Fc, n)), e.cidrv6 = (n) => e.check(/* @__PURE__ */ fa(Hc, n)), e.e164 = (n) => e.check(/* @__PURE__ */ ga(Vc, n)), e.datetime = (n) => e.check(hc(n)), e.date = (n) => e.check(fc(n)), e.time = (n) => e.check(_c(n)), e.duration = (n) => e.check(bc(n));
});
function H(e) {
  return /* @__PURE__ */ Ks(No, e);
}
const I = /* @__PURE__ */ h("ZodStringFormat", (e, t) => {
  R.init(e, t), Ao.init(e, t);
}), Tc = /* @__PURE__ */ h("ZodEmail", (e, t) => {
  is.init(e, t), I.init(e, t);
}), zn = /* @__PURE__ */ h("ZodGUID", (e, t) => {
  os.init(e, t), I.init(e, t);
}), qe = /* @__PURE__ */ h("ZodUUID", (e, t) => {
  rs.init(e, t), I.init(e, t);
}), Rc = /* @__PURE__ */ h("ZodURL", (e, t) => {
  ss.init(e, t), I.init(e, t);
}), Ic = /* @__PURE__ */ h("ZodEmoji", (e, t) => {
  as.init(e, t), I.init(e, t);
}), Pc = /* @__PURE__ */ h("ZodNanoID", (e, t) => {
  cs.init(e, t), I.init(e, t);
}), Oc = /* @__PURE__ */ h("ZodCUID", (e, t) => {
  us.init(e, t), I.init(e, t);
}), Lc = /* @__PURE__ */ h("ZodCUID2", (e, t) => {
  ls.init(e, t), I.init(e, t);
}), jc = /* @__PURE__ */ h("ZodULID", (e, t) => {
  ds.init(e, t), I.init(e, t);
}), Mc = /* @__PURE__ */ h("ZodXID", (e, t) => {
  hs.init(e, t), I.init(e, t);
}), Dc = /* @__PURE__ */ h("ZodKSUID", (e, t) => {
  ps.init(e, t), I.init(e, t);
}), Uc = /* @__PURE__ */ h("ZodIPv4", (e, t) => {
  bs.init(e, t), I.init(e, t);
}), Bc = /* @__PURE__ */ h("ZodIPv6", (e, t) => {
  vs.init(e, t), I.init(e, t);
}), Fc = /* @__PURE__ */ h("ZodCIDRv4", (e, t) => {
  ys.init(e, t), I.init(e, t);
}), Hc = /* @__PURE__ */ h("ZodCIDRv6", (e, t) => {
  ws.init(e, t), I.init(e, t);
}), Jc = /* @__PURE__ */ h("ZodBase64", (e, t) => {
  ks.init(e, t), I.init(e, t);
}), Wc = /* @__PURE__ */ h("ZodBase64URL", (e, t) => {
  Es.init(e, t), I.init(e, t);
}), Vc = /* @__PURE__ */ h("ZodE164", (e, t) => {
  Ss.init(e, t), I.init(e, t);
}), qc = /* @__PURE__ */ h("ZodJWT", (e, t) => {
  Cs.init(e, t), I.init(e, t);
}), Bt = /* @__PURE__ */ h("ZodNumber", (e, t) => {
  vo.init(e, t), O.init(e, t), e._zod.processJSONSchema = (o, r, i) => Wa(e, o, r), e.gt = (o, r) => e.check(/* @__PURE__ */ En(o, r)), e.gte = (o, r) => e.check(/* @__PURE__ */ wt(o, r)), e.min = (o, r) => e.check(/* @__PURE__ */ wt(o, r)), e.lt = (o, r) => e.check(/* @__PURE__ */ $n(o, r)), e.lte = (o, r) => e.check(/* @__PURE__ */ yt(o, r)), e.max = (o, r) => e.check(/* @__PURE__ */ yt(o, r)), e.int = (o) => e.check(Cn(o)), e.safe = (o) => e.check(Cn(o)), e.positive = (o) => e.check(/* @__PURE__ */ En(0, o)), e.nonnegative = (o) => e.check(/* @__PURE__ */ wt(0, o)), e.negative = (o) => e.check(/* @__PURE__ */ $n(0, o)), e.nonpositive = (o) => e.check(/* @__PURE__ */ yt(0, o)), e.multipleOf = (o, r) => e.check(/* @__PURE__ */ Sn(o, r)), e.step = (o, r) => e.check(/* @__PURE__ */ Sn(o, r)), e.finite = () => e;
  const n = e._zod.bag;
  e.minValue = Math.max(n.minimum ?? Number.NEGATIVE_INFINITY, n.exclusiveMinimum ?? Number.NEGATIVE_INFINITY) ?? null, e.maxValue = Math.min(n.maximum ?? Number.POSITIVE_INFINITY, n.exclusiveMaximum ?? Number.POSITIVE_INFINITY) ?? null, e.isInt = (n.format ?? "").includes("int") || Number.isSafeInteger(n.multipleOf ?? 0.5), e.isFinite = !0, e.format = n.format ?? null;
});
function de(e) {
  return /* @__PURE__ */ $a(Bt, e);
}
const Xc = /* @__PURE__ */ h("ZodNumberFormat", (e, t) => {
  xs.init(e, t), Bt.init(e, t);
});
function Cn(e) {
  return /* @__PURE__ */ Ea(Xc, e);
}
const Zo = /* @__PURE__ */ h("ZodBoolean", (e, t) => {
  As.init(e, t), O.init(e, t), e._zod.processJSONSchema = (n, o, r) => Va(e, n, o);
});
function Yc(e) {
  return /* @__PURE__ */ Sa(Zo, e);
}
const Kc = /* @__PURE__ */ h("ZodUnknown", (e, t) => {
  Ns.init(e, t), O.init(e, t), e._zod.processJSONSchema = (n, o, r) => Xa();
});
function it() {
  return /* @__PURE__ */ za(Kc);
}
const Gc = /* @__PURE__ */ h("ZodNever", (e, t) => {
  Zs.init(e, t), O.init(e, t), e._zod.processJSONSchema = (n, o, r) => qa(e, n, o);
});
function Qc(e) {
  return /* @__PURE__ */ Ca(Gc, e);
}
const eu = /* @__PURE__ */ h("ZodArray", (e, t) => {
  Ts.init(e, t), O.init(e, t), e._zod.processJSONSchema = (n, o, r) => Qa(e, n, o, r), e.element = t.element, e.min = (n, o) => e.check(/* @__PURE__ */ ot(n, o)), e.nonempty = (n) => e.check(/* @__PURE__ */ ot(1, n)), e.max = (n, o) => e.check(/* @__PURE__ */ $o(n, o)), e.length = (n, o) => e.check(/* @__PURE__ */ Eo(n, o)), e.unwrap = () => e.element;
});
function Be(e, t) {
  return /* @__PURE__ */ Ma(eu, e, t);
}
const tu = /* @__PURE__ */ h("ZodObject", (e, t) => {
  Is.init(e, t), O.init(e, t), e._zod.processJSONSchema = (n, o, r) => ec(e, n, o, r), N(e, "shape", () => t.shape), e.keyof = () => To(Object.keys(e._zod.def.shape)), e.catchall = (n) => e.clone({ ...e._zod.def, catchall: n }), e.passthrough = () => e.clone({ ...e._zod.def, catchall: it() }), e.loose = () => e.clone({ ...e._zod.def, catchall: it() }), e.strict = () => e.clone({ ...e._zod.def, catchall: Qc() }), e.strip = () => e.clone({ ...e._zod.def, catchall: void 0 }), e.extend = (n) => ti(e, n), e.safeExtend = (n) => ni(e, n), e.merge = (n) => oi(e, n), e.pick = (n) => Qr(e, n), e.omit = (n) => ei(e, n), e.partial = (...n) => ri(Ft, e, n[0]), e.required = (...n) => ii(Io, e, n[0]);
});
function He(e, t) {
  const n = {
    type: "object",
    shape: e ?? {},
    ...y(t)
  };
  return new tu(n);
}
const nu = /* @__PURE__ */ h("ZodUnion", (e, t) => {
  Ps.init(e, t), O.init(e, t), e._zod.processJSONSchema = (n, o, r) => tc(e, n, o, r), e.options = t.options;
});
function ou(e, t) {
  return new nu({
    type: "union",
    options: e,
    ...y(t)
  });
}
const ru = /* @__PURE__ */ h("ZodIntersection", (e, t) => {
  Os.init(e, t), O.init(e, t), e._zod.processJSONSchema = (n, o, r) => nc(e, n, o, r);
});
function iu(e, t) {
  return new ru({
    type: "intersection",
    left: e,
    right: t
  });
}
const su = /* @__PURE__ */ h("ZodRecord", (e, t) => {
  Ls.init(e, t), O.init(e, t), e._zod.processJSONSchema = (n, o, r) => oc(e, n, o, r), e.keyType = t.keyType, e.valueType = t.valueType;
});
function au(e, t, n) {
  return new su({
    type: "record",
    keyType: e,
    valueType: t,
    ...y(n)
  });
}
const st = /* @__PURE__ */ h("ZodEnum", (e, t) => {
  js.init(e, t), O.init(e, t), e._zod.processJSONSchema = (o, r, i) => Ya(e, o, r), e.enum = t.entries, e.options = Object.values(t.entries);
  const n = new Set(Object.keys(t.entries));
  e.extract = (o, r) => {
    const i = {};
    for (const s of o)
      if (n.has(s))
        i[s] = t.entries[s];
      else
        throw new Error(`Key ${s} not found in enum`);
    return new st({
      ...t,
      checks: [],
      ...y(r),
      entries: i
    });
  }, e.exclude = (o, r) => {
    const i = { ...t.entries };
    for (const s of o)
      if (n.has(s))
        delete i[s];
      else
        throw new Error(`Key ${s} not found in enum`);
    return new st({
      ...t,
      checks: [],
      ...y(r),
      entries: i
    });
  };
});
function To(e, t) {
  const n = Array.isArray(e) ? Object.fromEntries(e.map((o) => [o, o])) : e;
  return new st({
    type: "enum",
    entries: n,
    ...y(t)
  });
}
const cu = /* @__PURE__ */ h("ZodTransform", (e, t) => {
  Ms.init(e, t), O.init(e, t), e._zod.processJSONSchema = (n, o, r) => Ga(e, n), e._zod.parse = (n, o) => {
    if (o.direction === "backward")
      throw new no(e.constructor.name);
    n.addIssue = (i) => {
      if (typeof i == "string")
        n.issues.push(Ue(i, n.value, t));
      else {
        const s = i;
        s.fatal && (s.continue = !1), s.code ?? (s.code = "custom"), s.input ?? (s.input = n.value), s.inst ?? (s.inst = e), n.issues.push(Ue(s));
      }
    };
    const r = t.transform(n.value, n);
    return r instanceof Promise ? r.then((i) => (n.value = i, n)) : (n.value = r, n);
  };
});
function uu(e) {
  return new cu({
    type: "transform",
    transform: e
  });
}
const Ft = /* @__PURE__ */ h("ZodOptional", (e, t) => {
  ko.init(e, t), O.init(e, t), e._zod.processJSONSchema = (n, o, r) => xo(e, n, o, r), e.unwrap = () => e._zod.def.innerType;
});
function xn(e) {
  return new Ft({
    type: "optional",
    innerType: e
  });
}
const lu = /* @__PURE__ */ h("ZodExactOptional", (e, t) => {
  Ds.init(e, t), O.init(e, t), e._zod.processJSONSchema = (n, o, r) => xo(e, n, o, r), e.unwrap = () => e._zod.def.innerType;
});
function du(e) {
  return new lu({
    type: "optional",
    innerType: e
  });
}
const hu = /* @__PURE__ */ h("ZodNullable", (e, t) => {
  Us.init(e, t), O.init(e, t), e._zod.processJSONSchema = (n, o, r) => rc(e, n, o, r), e.unwrap = () => e._zod.def.innerType;
});
function An(e) {
  return new hu({
    type: "nullable",
    innerType: e
  });
}
const Ro = /* @__PURE__ */ h("ZodDefault", (e, t) => {
  Bs.init(e, t), O.init(e, t), e._zod.processJSONSchema = (n, o, r) => sc(e, n, o, r), e.unwrap = () => e._zod.def.innerType, e.removeDefault = e.unwrap;
});
function pu(e, t) {
  return new Ro({
    type: "default",
    innerType: e,
    get defaultValue() {
      return typeof t == "function" ? t() : so(t);
    }
  });
}
const fu = /* @__PURE__ */ h("ZodPrefault", (e, t) => {
  Fs.init(e, t), O.init(e, t), e._zod.processJSONSchema = (n, o, r) => ac(e, n, o, r), e.unwrap = () => e._zod.def.innerType;
});
function mu(e, t) {
  return new fu({
    type: "prefault",
    innerType: e,
    get defaultValue() {
      return typeof t == "function" ? t() : so(t);
    }
  });
}
const Io = /* @__PURE__ */ h("ZodNonOptional", (e, t) => {
  Hs.init(e, t), O.init(e, t), e._zod.processJSONSchema = (n, o, r) => ic(e, n, o, r), e.unwrap = () => e._zod.def.innerType;
});
function _u(e, t) {
  return new Io({
    type: "nonoptional",
    innerType: e,
    ...y(t)
  });
}
const gu = /* @__PURE__ */ h("ZodCatch", (e, t) => {
  Js.init(e, t), O.init(e, t), e._zod.processJSONSchema = (n, o, r) => cc(e, n, o, r), e.unwrap = () => e._zod.def.innerType, e.removeCatch = e.unwrap;
});
function bu(e, t) {
  return new gu({
    type: "catch",
    innerType: e,
    catchValue: typeof t == "function" ? t : () => t
  });
}
const vu = /* @__PURE__ */ h("ZodPipe", (e, t) => {
  Ws.init(e, t), O.init(e, t), e._zod.processJSONSchema = (n, o, r) => uc(e, n, o, r), e.in = t.in, e.out = t.out;
});
function Nn(e, t) {
  return new vu({
    type: "pipe",
    in: e,
    out: t
    // ...util.normalizeParams(params),
  });
}
const yu = /* @__PURE__ */ h("ZodReadonly", (e, t) => {
  Vs.init(e, t), O.init(e, t), e._zod.processJSONSchema = (n, o, r) => lc(e, n, o, r), e.unwrap = () => e._zod.def.innerType;
});
function wu(e) {
  return new yu({
    type: "readonly",
    innerType: e
  });
}
const ku = /* @__PURE__ */ h("ZodCustom", (e, t) => {
  qs.init(e, t), O.init(e, t), e._zod.processJSONSchema = (n, o, r) => Ka(e, n);
});
function $u(e, t = {}) {
  return /* @__PURE__ */ Da(ku, e, t);
}
function Eu(e) {
  return /* @__PURE__ */ Ua(e);
}
const Su = /* @__PURE__ */ new Set(["id", "image"]);
function Nt(e) {
  return e instanceof Ft ? Nt(e.unwrap()) : e instanceof Ro ? Nt(e._def.innerType) : e;
}
function zu(e) {
  const t = [];
  for (const [n, o] of Object.entries(e.shape)) {
    if (Su.has(n)) continue;
    const r = o, i = Nt(r), s = r.description ?? n;
    if (i instanceof Zo) {
      t.push({ key: n, label: s, type: "boolean" });
      continue;
    }
    if (i instanceof st) {
      t.push({ key: n, label: s, type: "select", options: i.options });
      continue;
    }
    if (i instanceof Bt) {
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
    if (i instanceof No) {
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
const Cu = He({
  x: de().min(0).max(100),
  y: de().min(0).max(100)
}), xu = He({
  id: H(),
  shape: To(["rect", "polygon"]).default("rect"),
  x: de().min(0).max(100),
  y: de().min(0).max(100),
  width: de().min(0).max(100),
  height: de().min(0).max(100),
  points: Be(Cu).optional(),
  correct: Yc().default(!1),
  label: H().optional()
}), Ht = He({
  id: H(),
  image: H().optional(),
  zones: Be(xu).optional()
}).passthrough(), Au = Ht.extend({
  target: H().max(2).describe("אות יעד"),
  correct: H().describe("תשובה נכונה"),
  correctEmoji: H().describe("אמוג'י")
}), Nu = Ht.extend({
  target: H().max(2).describe("אות יעד"),
  correct: H().describe("תשובה נכונה"),
  correctEmoji: H().describe("אמוג'י")
}), Zu = He({
  title: H().default(""),
  type: H().default("multiple-choice")
}).passthrough(), $l = He({
  id: H(),
  version: de().default(1),
  meta: Zu.default({}),
  rounds: Be(au(H(), it())).default([]),
  distractors: Be(it()).default([])
}), Tu = Ht.extend({
  instruction: H().optional().describe("הוראה")
}), Zn = {
  "multiple-choice": Au,
  "drag-match": Nu,
  "zone-tap": Tu
};
function Ru(e, { onFieldChange: t, onDeleteRound: n, roundSchema: o }) {
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
  function l(g, k = "multiple-choice") {
    c = g.id, s.innerHTML = "", a.hidden = !1;
    const b = o ?? Zn[k] ?? Zn["multiple-choice"];
    zu(b).forEach(($) => s.appendChild(d($, g))), s.appendChild(x(g)), a.onclick = () => {
      confirm("למחוק את הסיבוב הזה?") && (n(c), u());
    };
  }
  function d(g, k) {
    const b = document.createElement("div");
    b.className = "ab-editor-field";
    const S = document.createElement("label");
    switch (S.className = "ab-editor-field__label", S.textContent = g.label, b.appendChild(S), g.type) {
      case "emoji":
        b.appendChild(f(g, k));
        break;
      case "boolean":
        b.appendChild(_(g, k));
        break;
      case "select":
        b.appendChild(w(g, k));
        break;
      case "number":
        b.appendChild(A(g, k));
        break;
      default:
        b.appendChild(m(g, k));
        break;
    }
    return b;
  }
  function m(g, k) {
    const b = document.createElement("input");
    return b.className = "ab-editor-field__input", b.type = "text", b.value = String(k[g.key] ?? ""), b.dir = "rtl", g.maxLength && (b.maxLength = g.maxLength), b.addEventListener("input", () => t(c, g.key, b.value)), b;
  }
  function f(g, k) {
    const b = document.createElement("div");
    b.className = "ab-editor-field__emoji-row";
    const S = document.createElement("div");
    S.className = "ab-editor-field__emoji-preview", S.textContent = String(k[g.key] ?? "❓"), b.appendChild(S);
    const $ = document.createElement("input");
    return $.className = "ab-editor-field__input", $.type = "text", $.value = String(k[g.key] ?? ""), $.maxLength = 8, $.placeholder = "🐱", $.style.fontSize = "20px", $.addEventListener("input", () => {
      S.textContent = $.value || "❓", t(c, g.key, $.value);
    }), b.appendChild($), b;
  }
  function _(g, k) {
    const b = document.createElement("input");
    return b.type = "checkbox", b.checked = !!k[g.key], b.addEventListener("change", () => t(c, g.key, b.checked)), b;
  }
  function w(g, k) {
    const b = document.createElement("select");
    return b.className = "ab-editor-field__input", (g.options ?? []).forEach((S) => {
      const $ = document.createElement("option");
      $.value = S, $.textContent = S, k[g.key] === S && ($.selected = !0), b.appendChild($);
    }), b.addEventListener("change", () => t(c, g.key, b.value)), b;
  }
  function A(g, k) {
    const b = document.createElement("input");
    return b.className = "ab-editor-field__input", b.type = "number", b.value = String(k[g.key] ?? ""), g.min !== void 0 && (b.min = String(g.min)), g.max !== void 0 && (b.max = String(g.max)), b.addEventListener("input", () => t(c, g.key, Number(b.value))), b;
  }
  function x(g) {
    const k = document.createElement("div");
    k.className = "ab-editor-field ab-editor-field--image";
    const b = document.createElement("label");
    b.className = "ab-editor-field__label", b.textContent = "🖼 תמונה", k.appendChild(b);
    const S = document.createElement("div");
    S.className = "ab-editor-field__img-row";
    const $ = document.createElement("div");
    $.className = "ab-editor-field__img-preview", g.image && ($.style.backgroundImage = `url(${g.image})`), S.appendChild($);
    const q = document.createElement("div");
    q.className = "ab-editor-field__img-btns";
    const K = document.createElement("input");
    K.type = "file", K.accept = "image/*", K.style.display = "none", K.addEventListener("change", () => {
      var p;
      const X = (p = K.files) == null ? void 0 : p[0];
      if (!X) return;
      const Ce = new FileReader();
      Ce.onload = (v) => {
        const E = v.target.result;
        $.style.backgroundImage = `url(${E})`, ee.textContent = "🔄 החלף", t(c, "image", E), G.isConnected || q.appendChild(G);
      }, Ce.readAsDataURL(X);
    }), q.appendChild(K);
    const ee = document.createElement("button");
    ee.className = "ab-editor-btn ab-editor-btn--img-upload", ee.textContent = g.image ? "🔄 החלף" : "📤 העלה", ee.addEventListener("click", () => K.click()), q.appendChild(ee);
    const G = document.createElement("button");
    return G.className = "ab-editor-btn ab-editor-btn--img-clear", G.textContent = "✕ הסר", G.addEventListener("click", () => {
      $.style.backgroundImage = "", ee.textContent = "📤 העלה", t(c, "image", null), G.remove();
    }), g.image && q.appendChild(G), S.appendChild(q), k.appendChild(S), k;
  }
  function C() {
    r.remove();
  }
  return u(), { loadRound: l, clear: u, destroy: C };
}
let Iu = 0;
function kt() {
  return `round-${Date.now()}-${Iu++}`;
}
class at {
  // redo stack
  constructor(t) {
    this._id = t.id ?? "game", this._version = t.version ?? 1, this._meta = { title: "", type: "multiple-choice", ...t.meta ?? {} }, this._rounds = (t.rounds ?? []).map((n) => ({ ...n, id: n.id || kt() })), this._distractors = t.distractors ?? [], this._handlers = [], this._past = [], this._future = [];
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
    const n = { id: kt(), target: "", correct: "", correctEmoji: "❓" };
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
    const o = { ...n, id: kt() };
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
    return new at(t);
  }
  static fromRoundsArray(t, n, o = {}, r = []) {
    return new at({ id: t, meta: o, rounds: n, distractors: r });
  }
}
const Po = "alefbet.editor.";
function Oo(e) {
  return Fn(`${Po}${e}`, null);
}
function Pu(e) {
  Oo(e.id).set(e.toJSON());
}
function El(e) {
  const t = Oo(e).get();
  if (!t) return null;
  try {
    return at.fromJSON(t);
  } catch {
    return null;
  }
}
function Sl(e) {
  try {
    localStorage.removeItem(`${Po}${e}`);
  } catch {
  }
}
function Ou(e) {
  const t = JSON.stringify(e.toJSON(), null, 2), n = new Blob([t], { type: "application/json;charset=utf-8" }), o = URL.createObjectURL(n), r = document.createElement("a");
  r.href = o, r.download = `${e.id}-rounds.json`, r.click(), URL.revokeObjectURL(o);
}
const Lu = [
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
function ju(e) {
  return e.trim().replace(/\s+/g, "-").replace(/[^a-z0-9\u05D0-\u05EA_-]/gi, "").toLowerCase() || `custom-${Date.now()}`;
}
function Mu(e) {
  return Fn(`alefbet.audio-manager.${e}.custom`, []);
}
function Du(e, t = null) {
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
  const o = n.querySelector("#ab-am-body"), r = n.querySelector(".ab-am-close"), i = n.querySelector(".ab-am-backdrop"), s = [], a = [...Lu];
  t && t.rounds.length > 0 && a.splice(1, 0, {
    // insert after Instructions
    id: "rounds",
    label: "🔤 שאלות / סיבובים",
    slots: t.rounds.map((l, d) => ({
      key: l.id,
      label: `סיבוב ${d + 1}${l.target ? " — " + l.target : ""}${l.correct ? " (" + l.correct + ")" : ""}`
    }))
  }), a.forEach((l) => {
    o.appendChild(Uu(l, e, s));
  }), o.appendChild(Bu(e, s));
  function c() {
    s.forEach((l) => l.destroy()), n.remove();
  }
  r.addEventListener("click", c), i.addEventListener("click", c), document.addEventListener("keydown", function l(d) {
    d.key === "Escape" && (c(), document.removeEventListener("keydown", l));
  });
}
function Uu(e, t, n) {
  const o = document.createElement("section");
  o.className = "ab-am-section";
  const r = document.createElement("button");
  r.className = "ab-am-section__heading", r.setAttribute("aria-expanded", "true"), r.innerHTML = `<span>${e.label}</span><span class="ab-am-chevron">▾</span>`, o.appendChild(r);
  const i = document.createElement("div");
  return i.className = "ab-am-grid", o.appendChild(i), e.slots.forEach((s) => {
    i.appendChild(Lo(t, s.key, s.label, n));
  }), r.addEventListener("click", () => {
    const s = r.getAttribute("aria-expanded") === "true";
    r.setAttribute("aria-expanded", String(!s)), i.hidden = s, r.querySelector(".ab-am-chevron").textContent = s ? "▸" : "▾";
  }), o;
}
function Bu(e, t) {
  const n = Mu(e), o = document.createElement("section");
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
      const m = Lo(e, d.key, d.label, t, () => {
        n.update((f) => f.filter((_) => _.key !== d.key)), s();
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
    const m = ju(d);
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
function Lo(e, t, n, o, r = null) {
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
  const l = to(u, { gameId: e, voiceKey: t, label: n });
  return o.push(l), i._voiceBtn = l, i.appendChild(c), i.appendChild(u), i;
}
let Fu = 0;
function Tn() {
  return `zone-${Date.now()}-${Fu++}`;
}
function Hu(e) {
  const t = e.map((i) => i.x), n = e.map((i) => i.y), o = Math.min(...t), r = Math.min(...n);
  return { x: o, y: r, width: Math.max(...t) - o, height: Math.max(...n) - r };
}
function Ju(e, t, n, o, r) {
  return e.map((i) => {
    const s = o > 0 ? (i.x - t) / o * 100 : 0, a = r > 0 ? (i.y - n) / r * 100 : 0;
    return `${s},${a}`;
  }).join(" ");
}
function Wu(e, t, { onChange: n, gameId: o }) {
  let r = structuredClone(t), i = null, s = "rect", a = [], c = null, u = [], l = null, d = null, m = null;
  const f = document.createElement("div");
  f.className = "ab-ze-overlay";
  const _ = document.createElement("div");
  _.className = "ab-ze-draw-rect", _.hidden = !0, f.appendChild(_);
  const w = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  w.classList.add("ab-ze-poly-svg"), w.setAttribute("viewBox", "0 0 100 100"), w.setAttribute("preserveAspectRatio", "none"), w.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:12;", f.appendChild(w);
  const A = document.createElement("div");
  A.className = "ab-ze-toolbar", f.appendChild(A);
  function x() {
    A.innerHTML = "";
    const p = document.createElement("button");
    p.className = `ab-ze-tool-btn${s === "rect" ? " ab-ze-tool-btn--active" : ""}`, p.textContent = "▭ מלבן", p.addEventListener("click", () => {
      b("rect");
    }), A.appendChild(p);
    const v = document.createElement("button");
    v.className = `ab-ze-tool-btn${s === "polygon" ? " ab-ze-tool-btn--active" : ""}`, v.textContent = "✎ חופשי", v.addEventListener("click", () => {
      b("polygon");
    }), A.appendChild(v);
    const E = document.createElement("span");
    E.className = "ab-ze-toolbar__hint", E.textContent = s === "rect" ? "גררו לציור מלבן" : "לחצו נקודות, לחצו פעמיים לסגירה", A.appendChild(E);
  }
  e.style.position = "relative", e.appendChild(f), x();
  function C(p, v) {
    const E = f.getBoundingClientRect();
    return {
      px: Math.max(0, Math.min(100, (p - E.left) / E.width * 100)),
      py: Math.max(0, Math.min(100, (v - E.top) / E.height * 100))
    };
  }
  function g() {
    a.forEach((p) => p.destroy()), a = [], f.querySelectorAll(".ab-ze-zone").forEach((p) => p.remove()), f.querySelectorAll(".ab-ze-panel").forEach((p) => p.remove()), r.forEach((p) => {
      const v = document.createElement("div");
      if (v.className = "ab-ze-zone", p.correct && v.classList.add("ab-ze-zone--correct"), p.id === i && v.classList.add("ab-ze-zone--selected"), v.dataset.zoneId = p.id, v.style.left = `${p.x}%`, v.style.top = `${p.y}%`, v.style.width = `${p.width}%`, v.style.height = `${p.height}%`, p.shape === "polygon" && p.points && p.points.length >= 3) {
        const z = `clip-${p.id}`;
        v.innerHTML = `<svg class="ab-ze-zone__poly-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs><clipPath id="${z}"><polygon points="${Ju(p.points, p.x, p.y, p.width, p.height)}"/></clipPath></defs>
          <rect x="0" y="0" width="100" height="100" clip-path="url(#${z})" fill="currentColor"/>
        </svg>`, v.classList.add("ab-ze-zone--poly");
      }
      const E = document.createElement("div");
      E.className = "ab-ze-zone__badge", E.textContent = p.correct ? "✓" : "", p.label && (E.textContent = p.label), v.appendChild(E);
      const L = document.createElement("button");
      L.className = "ab-ze-zone__toggle", L.textContent = p.correct ? "✓ נכון" : "✗ לא נכון", L.title = "סמן כתשובה נכונה / לא נכונה", L.addEventListener("pointerdown", (z) => z.stopPropagation()), L.addEventListener("click", (z) => {
        z.stopPropagation(), p.correct = !p.correct, X(), g();
      }), v.appendChild(L);
      const Z = document.createElement("button");
      if (Z.className = "ab-ze-zone__delete", Z.textContent = "✕", Z.title = "מחק אזור", Z.addEventListener("pointerdown", (z) => z.stopPropagation()), Z.addEventListener("click", (z) => {
        z.stopPropagation(), r = r.filter((j) => j.id !== p.id), i === p.id && (i = null), X(), g();
      }), v.appendChild(Z), p.shape !== "polygon" && p.id === i)
        for (const z of ["nw", "ne", "sw", "se"]) {
          const j = document.createElement("div");
          j.className = `ab-ze-zone__handle ab-ze-zone__handle--${z}`, j.dataset.handle = z, j.addEventListener("pointerdown", (M) => {
            M.stopPropagation(), M.preventDefault(), m = {
              zoneId: p.id,
              handle: z,
              origZone: { ...p },
              startX: M.clientX,
              startY: M.clientY
            };
          }), v.appendChild(j);
        }
      if (v.addEventListener("pointerdown", (z) => {
        if (z.stopPropagation(), m) return;
        i = p.id, g();
        const { px: j, py: M } = C(z.clientX, z.clientY);
        d = { zoneId: p.id, offsetX: j - p.x, offsetY: M - p.y };
      }), f.appendChild(v), p.id === i) {
        const z = document.createElement("div");
        z.className = "ab-ze-panel", z.style.left = `${p.x}%`, z.style.top = `${p.y + p.height + 1}%`;
        const j = document.createElement("div");
        j.className = "ab-ze-panel__row";
        const M = document.createElement("input");
        if (M.className = "ab-ze-panel__input", M.type = "text", M.dir = "rtl", M.placeholder = "תווית (למשל: חתול)", M.value = p.label || "", M.addEventListener("pointerdown", (Y) => Y.stopPropagation()), M.addEventListener("input", () => {
          p.label = M.value || void 0, X();
        }), j.appendChild(M), z.appendChild(j), o) {
          const Y = document.createElement("div");
          Y.className = "ab-ze-panel__row";
          const ft = document.createElement("span");
          ft.className = "ab-ze-panel__audio-label", ft.textContent = "🎤", Y.appendChild(ft);
          const jo = to(Y, {
            gameId: o,
            voiceKey: `zone-${p.id}`,
            label: `הקלטה לאזור ${p.label || p.id}`
          });
          a.push(jo), z.appendChild(Y);
        }
        z.addEventListener("pointerdown", (Y) => Y.stopPropagation()), f.appendChild(z);
      }
    });
  }
  function k() {
    if (w.innerHTML = "", u.length === 0) return;
    const p = [...u];
    l && p.push(l);
    const v = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    v.setAttribute("points", p.map((E) => `${E.x},${E.y}`).join(" ")), v.setAttribute("fill", "rgba(251,191,36,0.15)"), v.setAttribute("stroke", "#fbbf24"), v.setAttribute("stroke-width", "0.4"), v.setAttribute("stroke-dasharray", "1,0.5"), w.appendChild(v), u.forEach((E, L) => {
      const Z = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      Z.setAttribute("cx", String(E.x)), Z.setAttribute("cy", String(E.y)), Z.setAttribute("r", "0.8"), Z.setAttribute("fill", L === 0 ? "#22c55e" : "#fbbf24"), Z.setAttribute("stroke", "#fff"), Z.setAttribute("stroke-width", "0.3"), w.appendChild(Z);
    });
  }
  function b(p) {
    u.length > 0 && (u = [], l = null, k()), s = p, f.classList.toggle("ab-ze-overlay--poly-mode", p === "polygon"), x();
  }
  function S() {
    if (!c) return;
    const p = Math.min(c.startX, c.curX), v = Math.min(c.startY, c.curY), E = Math.abs(c.curX - c.startX), L = Math.abs(c.curY - c.startY);
    _.style.left = `${p}%`, _.style.top = `${v}%`, _.style.width = `${E}%`, _.style.height = `${L}%`;
  }
  function $() {
    if (u.length < 3) {
      u = [], l = null, k();
      return;
    }
    const p = [...u], v = Hu(p);
    if (v.width > 1 && v.height > 1) {
      const E = {
        id: Tn(),
        shape: "polygon",
        ...v,
        points: p,
        correct: !1
      };
      r.push(E), i = E.id, X();
    }
    u = [], l = null, k(), g();
  }
  function q(p) {
    if (p.button !== 0 || p.target.closest(".ab-ze-zone") || p.target.closest(".ab-ze-toolbar") || p.target.closest(".ab-ze-panel")) return;
    if (i = null, s === "polygon") {
      const { px: L, py: Z } = C(p.clientX, p.clientY);
      if (u.length >= 3) {
        const z = u[0];
        if (Math.abs(L - z.x) < 2 && Math.abs(Z - z.y) < 2) {
          $();
          return;
        }
      }
      u.push({ x: L, y: Z }), k(), g();
      return;
    }
    const { px: v, py: E } = C(p.clientX, p.clientY);
    c = { startX: v, startY: E, curX: v, curY: E }, _.hidden = !1, S(), g();
  }
  function K(p) {
    s === "polygon" && u.length >= 3 && (p.preventDefault(), $());
  }
  function ee(p) {
    if (s === "polygon" && u.length > 0) {
      const { px: v, py: E } = C(p.clientX, p.clientY);
      l = { x: v, y: E }, k();
    }
    if (c) {
      const { px: v, py: E } = C(p.clientX, p.clientY);
      c.curX = v, c.curY = E, S();
      return;
    }
    if (m) {
      p.preventDefault();
      const v = r.find((M) => M.id === m.zoneId);
      if (!v) return;
      const E = m.origZone, L = f.getBoundingClientRect(), Z = (p.clientX - m.startX) / L.width * 100, z = (p.clientY - m.startY) / L.height * 100, j = m.handle;
      j.includes("e") && (v.width = Math.max(3, E.width + Z)), j.includes("w") && (v.x = E.x + Z, v.width = Math.max(3, E.width - Z)), j.includes("s") && (v.height = Math.max(3, E.height + z)), j.includes("n") && (v.y = E.y + z, v.height = Math.max(3, E.height - z)), g();
      return;
    }
    if (d) {
      p.preventDefault();
      const v = r.find((j) => j.id === d.zoneId);
      if (!v) return;
      const { px: E, py: L } = C(p.clientX, p.clientY), Z = Math.max(0, Math.min(100 - v.width, E - d.offsetX)), z = Math.max(0, Math.min(100 - v.height, L - d.offsetY));
      if (v.shape === "polygon" && v.points) {
        const j = Z - v.x, M = z - v.y;
        v.points = v.points.map((Y) => ({ x: Y.x + j, y: Y.y + M }));
      }
      v.x = Z, v.y = z, g();
    }
  }
  function G() {
    if (c) {
      const p = Math.min(c.startX, c.curX), v = Math.min(c.startY, c.curY), E = Math.abs(c.curX - c.startX), L = Math.abs(c.curY - c.startY);
      if (E > 3 && L > 3) {
        const Z = {
          id: Tn(),
          shape: "rect",
          x: p,
          y: v,
          width: E,
          height: L,
          correct: !1
        };
        r.push(Z), i = Z.id, X();
      }
      c = null, _.hidden = !0, g();
      return;
    }
    if (m) {
      m = null, X();
      return;
    }
    d && (d = null, X());
  }
  function X() {
    n(structuredClone(r));
  }
  function Ce(p) {
    if (p.key === "Escape" && u.length > 0) {
      u = [], l = null, k();
      return;
    }
    if (p.key === "Enter" && u.length >= 3) {
      $();
      return;
    }
    i && ((p.key === "Delete" || p.key === "Backspace") && (r = r.filter((v) => v.id !== i), i = null, X(), g()), p.key === "Escape" && (i = null, g()));
  }
  return f.addEventListener("pointerdown", q), f.addEventListener("dblclick", K), document.addEventListener("pointermove", ee), document.addEventListener("pointerup", G), document.addEventListener("keydown", Ce), g(), {
    setZones(p) {
      r = structuredClone(p), i = null, g();
    },
    getZones() {
      return structuredClone(r);
    },
    setTool(p) {
      b(p);
    },
    destroy() {
      f.removeEventListener("pointerdown", q), f.removeEventListener("dblclick", K), document.removeEventListener("pointermove", ee), document.removeEventListener("pointerup", G), document.removeEventListener("keydown", Ce), a.forEach((p) => p.destroy()), f.remove();
    }
  };
}
let Vu = 0;
function qu() {
  return `tpl-zone-${Date.now()}-${Vu++}`;
}
const Xu = [
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
function Yu(e) {
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
  s.className = "ab-tpl-grid", Xu.forEach((u) => {
    const l = document.createElement("button");
    l.className = "ab-tpl-card", l.addEventListener("click", () => {
      const _ = u.zones.map((w) => ({
        ...w,
        id: qu()
      }));
      e(_), a();
    });
    const d = document.createElement("div");
    d.className = "ab-tpl-card__preview", u.zones.forEach((_) => {
      const w = document.createElement("div");
      w.className = "ab-tpl-card__zone", _.correct && w.classList.add("ab-tpl-card__zone--correct"), w.style.left = `${_.x}%`, w.style.top = `${_.y}%`, w.style.width = `${_.width}%`, w.style.height = `${_.height}%`, d.appendChild(w);
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
class zl {
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
      this._makeBtn("⬇ ייצוא", "ab-editor-btn--export", () => Ou(this._gameData))
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
    this._overlay = Jr(t), this._overlay.show(), this._navigator = Wr(this._container, this._gameData, {
      onSelectRound: (o) => this._selectRound(o),
      onAddRound: (o) => this._addRound(o),
      onDuplicateRound: (o) => this._duplicateRound(o),
      onMoveRound: (o, r) => this._moveRound(o, r)
    }), this._inspector = Ru(this._container, {
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
      Yu((f) => {
        var _;
        this._selectedId && (this._gameData.updateRound(this._selectedId, { zones: f }), this._refreshUndoButtons(), (_ = this._zoneEditor) == null || _.setZones(f));
      });
    }), u.appendChild(l);
    const d = document.createElement("button");
    d.className = "ab-editor-btn ab-editor-btn--play", d.textContent = "✓ סיום", d.addEventListener("click", () => this._closeZoneEditor()), u.appendChild(d), r.appendChild(u), n.appendChild(r), document.body.appendChild(n), this._zoneModal = n, c.onload = () => {
      const f = t.zones ?? [];
      this._zoneEditor = Wu(a, f, {
        gameId: this._gameData.id,
        onChange: (_) => {
          this._selectedId && (this._gameData.updateRound(this._selectedId, { zones: _ }), this._refreshUndoButtons());
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
    Du(this._gameData.id, this._gameData);
  }
  _save() {
    Pu(this._gameData), this._showToast("✅ נשמר!");
  }
  _showToast(t) {
    const n = document.createElement("div");
    n.className = "ab-editor-toast", n.textContent = t, document.body.appendChild(n), setTimeout(() => n.remove(), 2200);
  }
}
export {
  Xu as ACTIVITY_TEMPLATES,
  Zn as BUILTIN_ROUND_SCHEMAS,
  Ht as BaseRoundSchema,
  Nu as DragMatchRoundSchema,
  Uo as EventBus,
  at as GameData,
  $l as GameDataSchema,
  zl as GameEditor,
  Zu as GameMetaSchema,
  Gu as GameShell,
  Bo as GameState,
  Au as MultipleChoiceRoundSchema,
  Cu as PointSchema,
  xu as ZoneSchema,
  Tu as ZoneTapRoundSchema,
  Vo as addNikud,
  Un as animate,
  Sl as clearGameData,
  kl as createAppShell,
  Fr as createDragSource,
  Hr as createDropTarget,
  fl as createFeedback,
  Fn as createLocalState,
  wl as createNikudBox,
  hl as createOptionCards,
  pl as createProgressBar,
  nl as createRoundManager,
  ol as createSpeechListener,
  to as createVoiceRecordButton,
  Nr as createVoiceRecorder,
  _l as createZone,
  Wu as createZoneEditor,
  gl as createZonePlayer,
  Ir as deleteVoice,
  Ou as exportGameDataAsJSON,
  al as getLetter,
  Pr as getLettersByGroup,
  qo as getNikud,
  sl as hasVoice,
  Ke as hebrewLetters,
  vl as hideLoadingScreen,
  yl as injectHeaderButton,
  Ar as isVoiceRecordingSupported,
  ll as letterWithNikud,
  il as listVoiceKeys,
  El as loadGameData,
  It as loadVoice,
  rl as matchNikudSound,
  ul as nikudBaseLetters,
  Le as nikudList,
  Re as playVoice,
  Qu as preloadNikud,
  cl as randomLetters,
  dl as randomNikud,
  Pu as saveGameData,
  Rr as saveVoice,
  zu as schemaToFields,
  Du as showAudioManager,
  Sr as showCompletionScreen,
  bl as showLoadingScreen,
  ml as showNikudSettingsDialog,
  Yu as showTemplatePicker,
  Ge as sounds,
  or as tts
};
