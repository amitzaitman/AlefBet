class _o {
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
class yo {
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
class vo {
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
    }, this.events = new _o(), this.state = new yo(this.config.totalRounds), this._buildShell();
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
let ct = null;
function wo() {
  return typeof window > "u" ? null : window.AudioContext || /** @type {any} */
  window.webkitAudioContext || null;
}
function Qe() {
  const e = wo();
  if (!e) return null;
  if (!ct)
    try {
      ct = new e();
    } catch {
      return null;
    }
  return ct;
}
async function ko() {
  const e = Qe();
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
async function kt() {
  const e = Qe();
  if (!e) return null;
  if (e.state === "suspended")
    try {
      await e.resume();
    } catch {
    }
  return e.state === "running" ? e : null;
}
function Eo(e) {
  return typeof e.arrayBuffer == "function" ? e.arrayBuffer() : new Promise((t, n) => {
    const o = new FileReader();
    o.onload = () => t(
      /** @type {ArrayBuffer} */
      o.result
    ), o.onerror = () => n(o.error), o.readAsArrayBuffer(e);
  });
}
async function zo(e) {
  if (!e) return !1;
  const t = await kt();
  if (!t || typeof t.decodeAudioData != "function") return !1;
  let n;
  try {
    const o = await Eo(e);
    n = await new Promise((r, i) => {
      const s = t.decodeAudioData(o, r, i);
      s && typeof s.then == "function" && s.then(r, i);
    });
  } catch {
    return !1;
  }
  return new Promise((o) => {
    try {
      const r = t.createBufferSource();
      r.buffer = n, r.connect(t.destination), r.onended = () => o(!0), r.start(0), setTimeout(() => o(!0), (n.duration + 0.5) * 1e3);
    } catch {
      o(!1);
    }
  });
}
function So() {
  const e = Qe();
  return e ? (e.state === "suspended" && e.resume(), e) : null;
}
function me(e, t, n = "sine", o = 0.3) {
  const r = So();
  if (r)
    try {
      const i = r.createOscillator(), s = r.createGain();
      i.connect(s), s.connect(r.destination), i.type = n, i.frequency.setValueAtTime(e, r.currentTime), s.gain.setValueAtTime(o, r.currentTime), s.gain.exponentialRampToValueAtTime(1e-3, r.currentTime + t), i.start(r.currentTime), i.stop(r.currentTime + t + 0.05);
    } catch {
    }
}
const Be = {
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
}, Pt = "https://nakdan-u1-0.loadbalancer.dicta.org.il/api";
let Mt = !1;
const $o = 4e3, bn = "alefbet.nikudCache.v1", No = 300, ie = /* @__PURE__ */ new Map();
(function() {
  if (!(typeof localStorage > "u"))
    try {
      const t = localStorage.getItem(bn);
      if (!t) return;
      const n = JSON.parse(t);
      if (Array.isArray(n))
        for (const [o, r] of n)
          typeof o == "string" && typeof r == "string" && ie.set(o, r);
    } catch {
    }
})();
function Co() {
  if (!(typeof localStorage > "u"))
    try {
      const e = [...ie.entries()].filter(([t, n]) => n !== t).slice(-No);
      localStorage.setItem(bn, JSON.stringify(e));
    } catch {
    }
}
function xo(e) {
  if (!e) return !1;
  const t = e.split(/\s+/).filter((o) => /[א-ת]/.test(o));
  return t.length === 0 ? !0 : t.filter((o) => /[\u05B0-\u05BC\u05C1\u05C2\u05C7]/.test(o)).length / t.length >= 0.8;
}
function To() {
  var r;
  if (typeof window > "u") return Pt;
  const e = new URLSearchParams(window.location.search).get("nakdanProxy"), t = window.ALEFBET_NAKDAN_PROXY_URL;
  if (e && window.localStorage)
    try {
      window.localStorage.setItem("alefbet.nakdanProxyUrl", e);
    } catch {
    }
  const n = (r = window.localStorage) == null ? void 0 : r.getItem("alefbet.nakdanProxyUrl"), o = e || t || n;
  return o || (window.location.hostname.endsWith("github.io") ? null : Pt);
}
function Ao(e) {
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
async function Ro(e) {
  const t = To();
  if (!t)
    throw Mt || (Mt = !0, console.warn("[nakdan] Dicta API blocked by CORS on GitHub Pages. Configure a proxy URL via ?nakdanProxy=..., window.ALEFBET_NAKDAN_PROXY_URL, or localStorage key alefbet.nakdanProxyUrl.")), new Error("Nakdan unavailable without proxy on this host");
  const n = typeof AbortController < "u" ? new AbortController() : null, o = n ? setTimeout(() => n.abort(), $o) : null;
  let r;
  try {
    r = await fetch(t, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: n == null ? void 0 : n.signal,
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
  } finally {
    o && clearTimeout(o);
  }
  if (!r.ok) throw new Error(`Nakdan ${r.status}`);
  const i = await r.json(), s = i == null ? void 0 : i.data;
  if (!Array.isArray(s)) throw new Error("Nakdan: invalid response");
  return Ao(s);
}
async function Lo(e) {
  if (!(e != null && e.trim())) return e ?? "";
  if (ie.has(e)) return ie.get(e);
  if (xo(e))
    return ie.set(e, e), e;
  if (typeof navigator < "u" && navigator.onLine === !1)
    return e;
  try {
    const t = await Ro(e);
    return ie.set(e, t), Co(), t;
  } catch {
    return ie.set(e, e), e;
  }
}
function Zo(e) {
  return ie.get(e) ?? e ?? "";
}
async function Io(e) {
  const t = [...new Set(e.filter((n) => n == null ? void 0 : n.trim()))];
  await Promise.all(t.map((n) => Lo(n)));
}
const G = [
  { id: "kamatz", name: "קָמָץ", nameNikud: "קָמָץ", symbol: "ָ", sound: "אָה", color: "#C9442C", textColor: "#fff" },
  { id: "patah", name: "פֶּתַח", nameNikud: "פָּתַח", symbol: "ַ", sound: "אָה", color: "#C58119", textColor: "#fff" },
  { id: "hiriq", name: "חִירִיק", nameNikud: "חִירִיק", symbol: "ִ", sound: "אִי", color: "#2A7B71", textColor: "#fff" },
  { id: "tzere", name: "צָרָה", nameNikud: "צֵרֶה", symbol: "ֵ", sound: "אֶה", color: "#4A6B8C", textColor: "#fff" },
  { id: "segol", name: "סָגֹול", nameNikud: "סְגוֹל", symbol: "ֶ", sound: "אֶה", color: "#783952", textColor: "#fff" },
  { id: "holam", name: "חוֹלֵם", nameNikud: "חוֹלָם", symbol: "ֹ", sound: "אוֹ", color: "#5F7A42", textColor: "#fff" },
  { id: "kubbutz", name: "קֻובּוּץ", nameNikud: "קֻבּוּץ", symbol: "ֻ", sound: "אוּ", color: "#6B4A8A", textColor: "#fff" }
], Oo = ["א", "ב", "ג", "ד", "מ", "נ", "ל", "ר", "ש", "ת", "פ", "ק"];
function gn(e, t) {
  return e + t;
}
function Mu(e) {
  let t = [...G];
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
  t.length === 0 && (t = [...G]);
  let n = [...t];
  for (; n.length < e; )
    n.push(...t);
  return n.sort(() => Math.random() - 0.5).slice(0, e);
}
const Po = 2e3;
let te = [], Ce = !1, ge = 0.9, ut = typeof localStorage < "u" && parseFloat(localStorage.getItem("alefbet.nikudRate")) || 0.5, De = !1, Se = null, de = null, ne = null, _n = null, xe = !1, K = "idle";
function Ue() {
  return typeof speechSynthesis < "u";
}
function Q(e, t, n = !1) {
  if (K === e && !n) return;
  const o = K;
  if (K = e, typeof window < "u" && typeof window.dispatchEvent == "function") {
    const r = { state: e, previousState: o };
    t && (r.reason = t), window.dispatchEvent(new CustomEvent("alefbet:tts-state", { detail: r }));
  }
}
function Mo() {
  Ue() ? K = "idle" : Q("unsupported", "no-speech-synthesis");
}
Mo();
function bt(e, t) {
  _n = String(t || "unknown"), console.warn("[tts] browser TTS failed", { text: e, reason: t }), typeof window < "u" && typeof window.dispatchEvent == "function" && window.dispatchEvent(new CustomEvent("alefbet:tts-error", {
    detail: { provider: "browser", text: e, sentText: e, reason: t }
  }));
}
function jo(e) {
  const t = String(e).toLowerCase();
  return t.includes("not-allowed") || t.includes("notallowed") || t.includes("didn't interact") || t.includes("user gesture");
}
function Do() {
  var e;
  return typeof window > "u" || typeof document > "u" ? Promise.resolve() : De || (e = document.userActivation) != null && e.hasBeenActive ? (De = !0, Promise.resolve()) : Se || (Se = new Promise((t) => {
    const n = () => {
      De = !0, window.removeEventListener("pointerdown", n, !0), window.removeEventListener("keydown", n, !0), window.removeEventListener("touchstart", n, !0), t();
    };
    window.addEventListener("pointerdown", n, { once: !0, capture: !0 }), window.addEventListener("keydown", n, { once: !0, capture: !0 }), window.addEventListener("touchstart", n, { once: !0, capture: !0 });
  }).finally(() => {
    Se = null;
  }), Se);
}
let le = null, $e = null, lt = !1, jt = !1;
const Fo = ["carmit", "hila", "female"];
function Bo(e) {
  const t = (e.name || "").toLowerCase();
  return Fo.some((n) => t.includes(n));
}
function dt() {
  if (typeof speechSynthesis > "u") return null;
  const t = speechSynthesis.getVoices().filter(
    (i) => i.lang === "he-IL" || i.lang === "iw-IL" || (i.lang || "").startsWith("he")
  );
  if (t.length === 0) return null;
  const o = typeof navigator < "u" && navigator.onLine === !1 && t.filter((i) => i.localService !== !1) || t, r = o.length > 0 ? o : t;
  return r.find(Bo) || r[0];
}
function Uo() {
  return typeof speechSynthesis > "u" ? Promise.resolve() : (le = dt(), le ? (lt = !0, Promise.resolve()) : lt ? Promise.resolve() : $e || ($e = new Promise((e) => {
    let t = !1;
    const n = () => {
      t || (t = !0, lt = !0, le = dt(), typeof speechSynthesis < "u" && typeof speechSynthesis.removeEventListener == "function" && speechSynthesis.removeEventListener("voiceschanged", o), clearTimeout(r), e());
    }, o = () => {
      le = dt(), le && n();
    };
    typeof speechSynthesis.addEventListener == "function" && speechSynthesis.addEventListener("voiceschanged", o);
    const r = setTimeout(() => {
      jt || (jt = !0, bt("", "voice-load-timeout")), n();
    }, Po);
  }).finally(() => {
    $e = null;
  }), $e));
}
function Ho(e) {
  return 5e3 + ((e == null ? void 0 : e.length) ?? 0) * 200;
}
function Dt(e) {
  return new Promise((t, n) => {
    if (typeof SpeechSynthesisUtterance > "u") {
      n(new Error("SpeechSynthesisUtterance unavailable"));
      return;
    }
    try {
      const o = new SpeechSynthesisUtterance(e);
      o.lang = "he-IL", o.rate = ge, le && (o.voice = le), ne = o;
      let r = !1;
      const i = setTimeout(() => {
        if (!r) {
          r = !0, ne === o && (ne = null);
          try {
            speechSynthesis.cancel();
          } catch {
          }
          n(new Error("utterance-timeout"));
        }
      }, Ho(e));
      o.onend = () => {
        r || (r = !0, clearTimeout(i), ne === o && (ne = null), t());
      }, o.onerror = (s) => {
        r || (r = !0, clearTimeout(i), ne === o && (ne = null), n(new Error(String(s && s.error || "speech-error"))));
      }, speechSynthesis.speak(o);
    } catch (o) {
      n(o instanceof Error ? o : new Error(String(o)));
    }
  });
}
async function Vo(e) {
  if (typeof speechSynthesis > "u")
    return { ok: !1, reason: "speechSynthesis unavailable" };
  await Uo();
  try {
    return await Dt(e), xe = !1, { ok: !0 };
  } catch (t) {
    const n = (t == null ? void 0 : t.message) || "speech-error";
    if (jo(n)) {
      xe || (xe = !0, Q("awaiting-interaction", "autoplay-blocked")), await Do(), xe = !1;
      try {
        return await Dt(e), { ok: !0 };
      } catch (o) {
        const r = (o == null ? void 0 : o.message) || "speech-error";
        return bt(e, r), { ok: !1, reason: r };
      }
    }
    return bt(e, n), { ok: !1, reason: n };
  }
}
function we() {
  if (Ce || te.length === 0) return;
  const e = te.shift();
  Ce = !0, de = e;
  const t = ge, n = typeof e.rate == "number";
  n && (ge = e.rate), Vo(e.text).then((o) => {
    n && (ge = t), Ce = !1;
    const r = de === e;
    if (de = null, !r) {
      we();
      return;
    }
    o.ok ? K !== "unsupported" && Q("ready") : Ue() ? Q("failed", o.reason, !0) : Q("unsupported", o.reason || "no-provider", !0), e.resolve(), we();
  }).catch((o) => {
    n && (ge = t), Ce = !1, de = null, Q("failed", (o == null ? void 0 : o.message) || "unknown"), e.resolve(), we();
  });
}
const he = {
  /**
   * הקרא טקסט עברי. ה-promise תמיד נפתר (גם בכשל) כדי שמשחקים לא יתקעו.
   * @param {string} text
   * @returns {Promise<void>}
   */
  speak(e) {
    const t = Zo(e);
    return new Promise((n) => {
      te.push({ text: t, resolve: n }), we();
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
    if (de) {
      try {
        de.resolve();
      } catch {
      }
      de = null;
    }
    if (te.forEach((e) => {
      try {
        e.resolve();
      } catch {
      }
    }), te = [], Ce = !1, ne && (ne = null), typeof speechSynthesis < "u" && typeof speechSynthesis.cancel == "function")
      try {
        speechSynthesis.cancel();
      } catch {
      }
    Q("idle", "cancelled");
  },
  /**
   * האם יש יכולת קול מקומית במכשיר.
   */
  get available() {
    return K !== "unsupported" && Ue();
  },
  /** המצב הנוכחי של מנוע ה-TTS. */
  get audioState() {
    return K;
  },
  /** Alias for audioState — some callers use `state`. */
  get state() {
    return K;
  },
  /** השגיאה האחרונה שדווחה או null אם לא הייתה. */
  get lastError() {
    return _n;
  },
  /**
   * משחרר ידנית את מנוע הקול אחרי gesture ידוע (כפתור התחל וכו').
   * משחקים יקראו לזה במקום להמתין ל-autoplay block.
   * @returns {Promise<void>}
   */
  unlock() {
    if (De = !0, xe = !1, ko().catch(() => {
    }), typeof speechSynthesis < "u" && typeof SpeechSynthesisUtterance < "u")
      try {
        const e = new SpeechSynthesisUtterance("");
        e.volume = 0, speechSynthesis.speak(e), speechSynthesis.cancel();
      } catch {
      }
    return K === "awaiting-interaction" && Q("ready", "unlocked"), Promise.resolve();
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
    return Ue() ? K === "unsupported" && Q("idle", "recovered") : Q("unsupported", "no-speech-synthesis"), this.available;
  },
  /**
   * הגדר מהירות דיבור (0.5-2.0).
   * @param {number} rate
   */
  setRate(e) {
    ge = Math.max(0.5, Math.min(2, e));
  },
  /**
   * הגדר מהירות דיבור להדגשת ניקוד.
   * @param {{ rate?: number }} opts - rate: מהירות הדגשה (ברירת מחדל 0.5).
   */
  setNikudEmphasis({ rate: e } = {}) {
    e != null && (ut = Math.max(0.3, Math.min(1.5, e)));
  },
  /**
   * הקרא אות עם ניקוד בשני שלבים: קודם את ההברה בקצב טבעי כדי שהעיצור יהיה קצר,
   * ואז את צליל התנועה לבד בקצב האיטי שמיועד לניקוד - כך הילד שומע
   * "מ-אההההה" במקום "ממממ-אה" שמתקבל מהאטה אחידה של ההברה כולה.
   * @param {string} letter - האות (למשל 'ב').
   * @param {string} nikudSymbol - סמל הניקוד (למשל U+05B7).
   */
  speakNikud(e, t) {
    const n = e + t, o = G.find((r) => r.symbol === t);
    return new Promise((r) => {
      o && o.sound ? (te.push({ text: n, resolve: () => {
      } }), te.push({
        text: o.sound,
        rate: ut,
        resolve: () => r(void 0)
      })) : te.push({ text: n, resolve: () => r(void 0) }), we();
    });
  },
  /**
   * הקרא את צליל התנועה של הניקוד ("אָה", "אוֹ" וכו'),
   * כדי להדגים לילד מה להגות.
   * @param {string} nikudId - מזהה ניקוד מתוך nikudList (למשל 'kamatz').
   */
  speakVowel(e) {
    const t = G.find((n) => n.id === e);
    return !t || !t.sound ? Promise.resolve() : new Promise((n) => {
      te.push({
        text: t.sound,
        rate: ut,
        resolve: () => n(void 0)
      }), we();
    });
  }
}, Ft = {
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
}, qo = {
  shake: 420,
  bounce: 480,
  pulse: 600,
  fadeIn: 320,
  confetti: 700
};
function Fe(e, t) {
  !e || !Ft[t] || e.animate(Ft[t], {
    duration: qo[t] || 400,
    easing: "ease-in-out",
    fill: "none"
  });
}
function Jo(e, t, n, o) {
  Be.cheer();
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
  }), e.innerHTML = "", e.appendChild(a), Fe(a.querySelector(".completion-screen__content"), "fadeIn");
}
function ju(e, t, {
  totalRounds: n,
  progressBar: o = null,
  buildRoundUI: r,
  onCorrect: i,
  onWrong: s
}) {
  let a = !1;
  async function c(m) {
    if (a) return;
    a = !0, Be.correct(), m && await m(), i && await i(), e.state.addScore(1), o == null || o.update(e.state.currentRound), await new Promise((g) => setTimeout(g, 1200)), e.state.nextRound() ? (a = !1, r()) : Jo(t, e.state.score, n, () => {
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
function yn(e, t) {
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
function Wo(e, t = "טוֹעֵן...") {
  e.innerHTML = `<div class="ab-loading">${t}</div>`;
}
function Xo(e) {
  e.innerHTML = "";
}
let Yo = 0;
function ft() {
  return `round-${Date.now()}-${Yo++}`;
}
class Re {
  // redo stack
  constructor(t) {
    this._id = t.id ?? "game", this._version = t.version ?? 1, this._meta = { title: "", type: "multiple-choice", ...t.meta ?? {} }, this._rounds = (t.rounds ?? []).map((n) => ({ ...n, id: n.id || ft() })), this._distractors = t.distractors ?? [], this._handlers = [], this._past = [], this._future = [];
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
    const n = { id: ft(), target: "", correct: "", correctEmoji: "❓" };
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
    const o = { ...n, id: ft() };
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
    return new Re(t);
  }
  static fromRoundsArray(t, n, o = {}, r = []) {
    return new Re({ id: t, meta: o, rounds: n, distractors: r });
  }
}
const vn = "alefbet.editor.";
function wn(e) {
  return yn(`${vn}${e}`, null);
}
function Go(e) {
  wn(e.id).set(e.toJSON());
}
function Ko(e) {
  const t = wn(e).get();
  if (!t) return null;
  try {
    return Re.fromJSON(t);
  } catch {
    return null;
  }
}
function Du(e) {
  try {
    localStorage.removeItem(`${vn}${e}`);
  } catch {
  }
}
function Qo(e) {
  const t = JSON.stringify(e.toJSON(), null, 2), n = new Blob([t], { type: "application/json;charset=utf-8" }), o = URL.createObjectURL(n), r = document.createElement("a");
  r.href = o, r.download = `${e.id}-rounds.json`, r.click(), URL.revokeObjectURL(o);
}
function er(e, { onClick: t } = {}) {
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
let be = null, ee = null, gt = 0, _t = 0;
const He = /* @__PURE__ */ new Map();
function Bt(e, t) {
  var n;
  return ((n = document.elementFromPoint(e, t)) == null ? void 0 : n.closest('[data-drop-target="true"]')) || null;
}
function tr(e, t, n) {
  const o = e.getBoundingClientRect();
  gt = o.width / 2, _t = o.height / 2, ee = e.cloneNode(!0), Object.assign(ee.style, {
    position: "fixed",
    left: `${t - gt}px`,
    top: `${n - _t}px`,
    width: `${o.width}px`,
    height: `${o.height}px`,
    pointerEvents: "none",
    // keeps it out of elementFromPoint + hit-testing
    zIndex: "9999",
    opacity: "0.85",
    transform: "scale(1.12)",
    cursor: "grabbing",
    margin: "0"
  }), document.body.appendChild(ee);
}
function nr(e, t) {
  ee && (ee.style.left = `${e - gt}px`, ee.style.top = `${t - _t}px`);
}
function or() {
  ee == null || ee.remove(), ee = null;
}
let oe = null;
function rr(e) {
  oe !== e && (oe == null || oe.classList.remove("drop-target--hover"), oe = e, e == null || e.classList.add("drop-target--hover"));
}
function ir() {
  oe == null || oe.classList.remove("drop-target--hover"), oe = null;
}
function sr(e, t) {
  e.classList.add("drag-source");
  let n = null, o = null, r = null;
  function i() {
    n && (e.removeEventListener("pointermove", n), e.removeEventListener("pointerup", o), e.removeEventListener("pointercancel", r), n = o = r = null), ir(), or(), e.classList.remove("drag-source--dragging"), be = null;
  }
  function s(a) {
    a.button !== void 0 && a.button !== 0 || (a.preventDefault(), be && i(), be = { el: e, data: t }, e.classList.add("drag-source--dragging"), tr(e, a.clientX, a.clientY), e.setPointerCapture(a.pointerId), n = (c) => {
      nr(c.clientX, c.clientY), rr(Bt(c.clientX, c.clientY));
    }, o = (c) => {
      const u = Bt(c.clientX, c.clientY);
      i(), u && He.has(u) && He.get(u).onDrop({ data: t, sourceEl: e, targetEl: u });
    }, r = () => i(), e.addEventListener("pointermove", n), e.addEventListener("pointerup", o), e.addEventListener("pointercancel", r));
  }
  return e.addEventListener("pointerdown", s), {
    destroy() {
      e.removeEventListener("pointerdown", s), (be == null ? void 0 : be.el) === e && i(), e.classList.remove("drag-source");
    }
  };
}
function ar(e, t) {
  return e.setAttribute("data-drop-target", "true"), e.classList.add("drop-target--active"), He.set(e, { onDrop: t }), {
    destroy() {
      e.removeAttribute("data-drop-target"), e.classList.remove("drop-target--active", "drop-target--hover"), He.delete(e);
    }
  };
}
function cr(e, t, { onSelectRound: n, onAddRound: o, onDuplicateRound: r, onMoveRound: i }) {
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
    d.forEach((k) => k.destroy()), d = [];
  }
  function p(k, N) {
    const b = document.createElement("div");
    b.className = "ab-editor-nav__thumb", k.id === l && b.classList.add("ab-editor-nav__thumb--active"), b.setAttribute("role", "button"), b.setAttribute("tabindex", "0"), b.setAttribute("aria-label", `סיבוב ${N + 1}`), b.dataset.roundId = k.id, k.image && (b.style.backgroundImage = `url(${k.image})`, b.classList.add("ab-editor-nav__thumb--has-img"));
    const E = document.createElement("div");
    E.className = "ab-editor-nav__grip", E.innerHTML = "⠿", E.setAttribute("aria-hidden", "true"), E.title = "גרור לשינוי סדר", b.appendChild(E);
    const y = document.createElement("div");
    if (y.className = "ab-editor-nav__num", y.textContent = String(N + 1), b.appendChild(y), k.correctEmoji && !k.image) {
      const z = document.createElement("div");
      z.className = "ab-editor-nav__emoji", z.textContent = k.correctEmoji, b.appendChild(z);
    }
    if (k.target) {
      const z = document.createElement("div");
      z.className = "ab-editor-nav__letter", z.textContent = k.target, b.appendChild(z);
    }
    const x = document.createElement("button");
    return x.className = "ab-editor-nav__dup", x.innerHTML = "⧉", x.title = "שכפל סיבוב", x.setAttribute("aria-label", "שכפל סיבוב"), x.addEventListener("click", (z) => {
      z.stopPropagation(), r(k.id);
    }), b.appendChild(x), b.addEventListener("click", () => n(k.id)), b.addEventListener("keydown", (z) => {
      (z.key === "Enter" || z.key === " ") && (z.preventDefault(), n(k.id));
    }), d.push(sr(E, { roundId: k.id })), d.push(ar(b, ({ data: z }) => {
      z.roundId !== k.id && i(z.roundId, t.getRoundIndex(k.id));
    })), b;
  }
  function g() {
    m(), c.innerHTML = "", t.rounds.forEach((k, N) => c.appendChild(p(k, N)));
  }
  function _(k) {
    l = k, c.querySelectorAll(".ab-editor-nav__thumb").forEach((N) => {
      N.classList.toggle("ab-editor-nav__thumb--active", N.dataset.roundId === k);
    });
  }
  function C() {
    m(), s.remove();
  }
  return g(), { refresh: g, setActiveRound: _, destroy: C };
}
function f(e, t, n) {
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
class kn extends Error {
  constructor(t) {
    super(`Encountered unidirectional transform during encode: ${t}`), this.name = "ZodEncodeError";
  }
}
const En = {};
function se(e) {
  return En;
}
function zn(e) {
  const t = Object.values(e).filter((o) => typeof o == "number");
  return Object.entries(e).filter(([o, r]) => t.indexOf(+o) === -1).map(([o, r]) => r);
}
function yt(e, t) {
  return typeof t == "bigint" ? t.toString() : t;
}
function Et(e) {
  return {
    get value() {
      {
        const t = e();
        return Object.defineProperty(this, "value", { value: t }), t;
      }
    }
  };
}
function zt(e) {
  return e == null;
}
function St(e) {
  const t = e.startsWith("^") ? 1 : 0, n = e.endsWith("$") ? e.length - 1 : e.length;
  return e.slice(t, n);
}
function ur(e, t) {
  const n = (e.toString().split(".")[1] || "").length, o = t.toString();
  let r = (o.split(".")[1] || "").length;
  if (r === 0 && /\d?e-\d?/.test(o)) {
    const c = o.match(/\d?e-(\d?)/);
    c != null && c[1] && (r = Number.parseInt(c[1]));
  }
  const i = n > r ? n : r, s = Number.parseInt(e.toFixed(i).replace(".", "")), a = Number.parseInt(t.toFixed(i).replace(".", ""));
  return s % a / 10 ** i;
}
const Ut = Symbol("evaluating");
function L(e, t, n) {
  let o;
  Object.defineProperty(e, t, {
    get() {
      if (o !== Ut)
        return o === void 0 && (o = Ut, o = n()), o;
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
function pe(e, t, n) {
  Object.defineProperty(e, t, {
    value: n,
    writable: !0,
    enumerable: !0,
    configurable: !0
  });
}
function ce(...e) {
  const t = {};
  for (const n of e) {
    const o = Object.getOwnPropertyDescriptors(n);
    Object.assign(t, o);
  }
  return Object.defineProperties({}, t);
}
function Ht(e) {
  return JSON.stringify(e);
}
function lr(e) {
  return e.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
const Sn = "captureStackTrace" in Error ? Error.captureStackTrace : (...e) => {
};
function Ve(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
const dr = Et(() => {
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
function Ee(e) {
  if (Ve(e) === !1)
    return !1;
  const t = e.constructor;
  if (t === void 0 || typeof t != "function")
    return !0;
  const n = t.prototype;
  return !(Ve(n) === !1 || Object.prototype.hasOwnProperty.call(n, "isPrototypeOf") === !1);
}
function $n(e) {
  return Ee(e) ? { ...e } : Array.isArray(e) ? [...e] : e;
}
const fr = /* @__PURE__ */ new Set(["string", "number", "symbol"]);
function et(e) {
  return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function ue(e, t, n) {
  const o = new e._zod.constr(t ?? e._zod.def);
  return (!t || n != null && n.parent) && (o._zod.parent = e), o;
}
function S(e) {
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
function hr(e) {
  return Object.keys(e).filter((t) => e[t]._zod.optin === "optional" && e[t]._zod.optout === "optional");
}
const pr = {
  safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
  int32: [-2147483648, 2147483647],
  uint32: [0, 4294967295],
  float32: [-34028234663852886e22, 34028234663852886e22],
  float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
};
function mr(e, t) {
  const n = e._zod.def, o = n.checks;
  if (o && o.length > 0)
    throw new Error(".pick() cannot be used on object schemas containing refinements");
  const i = ce(e._zod.def, {
    get shape() {
      const s = {};
      for (const a in t) {
        if (!(a in n.shape))
          throw new Error(`Unrecognized key: "${a}"`);
        t[a] && (s[a] = n.shape[a]);
      }
      return pe(this, "shape", s), s;
    },
    checks: []
  });
  return ue(e, i);
}
function br(e, t) {
  const n = e._zod.def, o = n.checks;
  if (o && o.length > 0)
    throw new Error(".omit() cannot be used on object schemas containing refinements");
  const i = ce(e._zod.def, {
    get shape() {
      const s = { ...e._zod.def.shape };
      for (const a in t) {
        if (!(a in n.shape))
          throw new Error(`Unrecognized key: "${a}"`);
        t[a] && delete s[a];
      }
      return pe(this, "shape", s), s;
    },
    checks: []
  });
  return ue(e, i);
}
function gr(e, t) {
  if (!Ee(t))
    throw new Error("Invalid input to extend: expected a plain object");
  const n = e._zod.def.checks;
  if (n && n.length > 0) {
    const i = e._zod.def.shape;
    for (const s in t)
      if (Object.getOwnPropertyDescriptor(i, s) !== void 0)
        throw new Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
  }
  const r = ce(e._zod.def, {
    get shape() {
      const i = { ...e._zod.def.shape, ...t };
      return pe(this, "shape", i), i;
    }
  });
  return ue(e, r);
}
function _r(e, t) {
  if (!Ee(t))
    throw new Error("Invalid input to safeExtend: expected a plain object");
  const n = ce(e._zod.def, {
    get shape() {
      const o = { ...e._zod.def.shape, ...t };
      return pe(this, "shape", o), o;
    }
  });
  return ue(e, n);
}
function yr(e, t) {
  const n = ce(e._zod.def, {
    get shape() {
      const o = { ...e._zod.def.shape, ...t._zod.def.shape };
      return pe(this, "shape", o), o;
    },
    get catchall() {
      return t._zod.def.catchall;
    },
    checks: []
    // delete existing checks
  });
  return ue(e, n);
}
function vr(e, t, n) {
  const r = t._zod.def.checks;
  if (r && r.length > 0)
    throw new Error(".partial() cannot be used on object schemas containing refinements");
  const s = ce(t._zod.def, {
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
      return pe(this, "shape", c), c;
    },
    checks: []
  });
  return ue(t, s);
}
function wr(e, t, n) {
  const o = ce(t._zod.def, {
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
      return pe(this, "shape", i), i;
    }
  });
  return ue(t, o);
}
function _e(e, t = 0) {
  var n;
  if (e.aborted === !0)
    return !0;
  for (let o = t; o < e.issues.length; o++)
    if (((n = e.issues[o]) == null ? void 0 : n.continue) !== !0)
      return !0;
  return !1;
}
function ye(e, t) {
  return t.map((n) => {
    var o;
    return (o = n).path ?? (o.path = []), n.path.unshift(e), n;
  });
}
function Oe(e) {
  return typeof e == "string" ? e : e == null ? void 0 : e.message;
}
function ae(e, t, n) {
  var r, i, s, a, c, u;
  const o = { ...e, path: e.path ?? [] };
  if (!e.message) {
    const l = Oe((s = (i = (r = e.inst) == null ? void 0 : r._zod.def) == null ? void 0 : i.error) == null ? void 0 : s.call(i, e)) ?? Oe((a = t == null ? void 0 : t.error) == null ? void 0 : a.call(t, e)) ?? Oe((c = n.customError) == null ? void 0 : c.call(n, e)) ?? Oe((u = n.localeError) == null ? void 0 : u.call(n, e)) ?? "Invalid input";
    o.message = l;
  }
  return delete o.inst, delete o.continue, t != null && t.reportInput || delete o.input, o;
}
function $t(e) {
  return Array.isArray(e) ? "array" : typeof e == "string" ? "string" : "unknown";
}
function Le(...e) {
  const [t, n, o] = e;
  return typeof t == "string" ? {
    message: t,
    code: "custom",
    input: n,
    inst: o
  } : { ...t };
}
const Nn = (e, t) => {
  e.name = "$ZodError", Object.defineProperty(e, "_zod", {
    value: e._zod,
    enumerable: !1
  }), Object.defineProperty(e, "issues", {
    value: t,
    enumerable: !1
  }), e.message = JSON.stringify(t, yt, 2), Object.defineProperty(e, "toString", {
    value: () => e.message,
    enumerable: !1
  });
}, Cn = f("$ZodError", Nn), xn = f("$ZodError", Nn, { Parent: Error });
function kr(e, t = (n) => n.message) {
  const n = {}, o = [];
  for (const r of e.issues)
    r.path.length > 0 ? (n[r.path[0]] = n[r.path[0]] || [], n[r.path[0]].push(t(r))) : o.push(t(r));
  return { formErrors: o, fieldErrors: n };
}
function Er(e, t = (n) => n.message) {
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
const Nt = (e) => (t, n, o, r) => {
  const i = o ? Object.assign(o, { async: !1 }) : { async: !1 }, s = t._zod.run({ value: n, issues: [] }, i);
  if (s instanceof Promise)
    throw new ke();
  if (s.issues.length) {
    const a = new ((r == null ? void 0 : r.Err) ?? e)(s.issues.map((c) => ae(c, i, se())));
    throw Sn(a, r == null ? void 0 : r.callee), a;
  }
  return s.value;
}, Ct = (e) => async (t, n, o, r) => {
  const i = o ? Object.assign(o, { async: !0 }) : { async: !0 };
  let s = t._zod.run({ value: n, issues: [] }, i);
  if (s instanceof Promise && (s = await s), s.issues.length) {
    const a = new ((r == null ? void 0 : r.Err) ?? e)(s.issues.map((c) => ae(c, i, se())));
    throw Sn(a, r == null ? void 0 : r.callee), a;
  }
  return s.value;
}, tt = (e) => (t, n, o) => {
  const r = o ? { ...o, async: !1 } : { async: !1 }, i = t._zod.run({ value: n, issues: [] }, r);
  if (i instanceof Promise)
    throw new ke();
  return i.issues.length ? {
    success: !1,
    error: new (e ?? Cn)(i.issues.map((s) => ae(s, r, se())))
  } : { success: !0, data: i.value };
}, zr = /* @__PURE__ */ tt(xn), nt = (e) => async (t, n, o) => {
  const r = o ? Object.assign(o, { async: !0 }) : { async: !0 };
  let i = t._zod.run({ value: n, issues: [] }, r);
  return i instanceof Promise && (i = await i), i.issues.length ? {
    success: !1,
    error: new e(i.issues.map((s) => ae(s, r, se())))
  } : { success: !0, data: i.value };
}, Sr = /* @__PURE__ */ nt(xn), $r = (e) => (t, n, o) => {
  const r = o ? Object.assign(o, { direction: "backward" }) : { direction: "backward" };
  return Nt(e)(t, n, r);
}, Nr = (e) => (t, n, o) => Nt(e)(t, n, o), Cr = (e) => async (t, n, o) => {
  const r = o ? Object.assign(o, { direction: "backward" }) : { direction: "backward" };
  return Ct(e)(t, n, r);
}, xr = (e) => async (t, n, o) => Ct(e)(t, n, o), Tr = (e) => (t, n, o) => {
  const r = o ? Object.assign(o, { direction: "backward" }) : { direction: "backward" };
  return tt(e)(t, n, r);
}, Ar = (e) => (t, n, o) => tt(e)(t, n, o), Rr = (e) => async (t, n, o) => {
  const r = o ? Object.assign(o, { direction: "backward" }) : { direction: "backward" };
  return nt(e)(t, n, r);
}, Lr = (e) => async (t, n, o) => nt(e)(t, n, o), Zr = /^[cC][^\s-]{8,}$/, Ir = /^[0-9a-z]+$/, Or = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/, Pr = /^[0-9a-vA-V]{20}$/, Mr = /^[A-Za-z0-9]{27}$/, jr = /^[a-zA-Z0-9_-]{21}$/, Dr = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/, Fr = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/, Vt = (e) => e ? new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${e}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`) : /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/, Br = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/, Ur = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
function Hr() {
  return new RegExp(Ur, "u");
}
const Vr = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, qr = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/, Jr = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/, Wr = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, Xr = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/, Tn = /^[A-Za-z0-9_-]*$/, Yr = /^\+[1-9]\d{6,14}$/, An = "(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))", Gr = /* @__PURE__ */ new RegExp(`^${An}$`);
function Rn(e) {
  const t = "(?:[01]\\d|2[0-3]):[0-5]\\d";
  return typeof e.precision == "number" ? e.precision === -1 ? `${t}` : e.precision === 0 ? `${t}:[0-5]\\d` : `${t}:[0-5]\\d\\.\\d{${e.precision}}` : `${t}(?::[0-5]\\d(?:\\.\\d+)?)?`;
}
function Kr(e) {
  return new RegExp(`^${Rn(e)}$`);
}
function Qr(e) {
  const t = Rn({ precision: e.precision }), n = ["Z"];
  e.local && n.push(""), e.offset && n.push("([+-](?:[01]\\d|2[0-3]):[0-5]\\d)");
  const o = `${t}(?:${n.join("|")})`;
  return new RegExp(`^${An}T(?:${o})$`);
}
const ei = (e) => {
  const t = e ? `[\\s\\S]{${(e == null ? void 0 : e.minimum) ?? 0},${(e == null ? void 0 : e.maximum) ?? ""}}` : "[\\s\\S]*";
  return new RegExp(`^${t}$`);
}, ti = /^-?\d+$/, Ln = /^-?\d+(?:\.\d+)?$/, ni = /^(?:true|false)$/i, oi = /^[^A-Z]*$/, ri = /^[^a-z]*$/, W = /* @__PURE__ */ f("$ZodCheck", (e, t) => {
  var n;
  e._zod ?? (e._zod = {}), e._zod.def = t, (n = e._zod).onattach ?? (n.onattach = []);
}), Zn = {
  number: "number",
  bigint: "bigint",
  object: "date"
}, In = /* @__PURE__ */ f("$ZodCheckLessThan", (e, t) => {
  W.init(e, t);
  const n = Zn[typeof t.value];
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
}), On = /* @__PURE__ */ f("$ZodCheckGreaterThan", (e, t) => {
  W.init(e, t);
  const n = Zn[typeof t.value];
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
}), ii = /* @__PURE__ */ f("$ZodCheckMultipleOf", (e, t) => {
  W.init(e, t), e._zod.onattach.push((n) => {
    var o;
    (o = n._zod.bag).multipleOf ?? (o.multipleOf = t.value);
  }), e._zod.check = (n) => {
    if (typeof n.value != typeof t.value)
      throw new Error("Cannot mix number and bigint in multiple_of check.");
    (typeof n.value == "bigint" ? n.value % t.value === BigInt(0) : ur(n.value, t.value) === 0) || n.issues.push({
      origin: typeof n.value,
      code: "not_multiple_of",
      divisor: t.value,
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), si = /* @__PURE__ */ f("$ZodCheckNumberFormat", (e, t) => {
  var s;
  W.init(e, t), t.format = t.format || "float64";
  const n = (s = t.format) == null ? void 0 : s.includes("int"), o = n ? "int" : "number", [r, i] = pr[t.format];
  e._zod.onattach.push((a) => {
    const c = a._zod.bag;
    c.format = t.format, c.minimum = r, c.maximum = i, n && (c.pattern = ti);
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
}), ai = /* @__PURE__ */ f("$ZodCheckMaxLength", (e, t) => {
  var n;
  W.init(e, t), (n = e._zod.def).when ?? (n.when = (o) => {
    const r = o.value;
    return !zt(r) && r.length !== void 0;
  }), e._zod.onattach.push((o) => {
    const r = o._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
    t.maximum < r && (o._zod.bag.maximum = t.maximum);
  }), e._zod.check = (o) => {
    const r = o.value;
    if (r.length <= t.maximum)
      return;
    const s = $t(r);
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
}), ci = /* @__PURE__ */ f("$ZodCheckMinLength", (e, t) => {
  var n;
  W.init(e, t), (n = e._zod.def).when ?? (n.when = (o) => {
    const r = o.value;
    return !zt(r) && r.length !== void 0;
  }), e._zod.onattach.push((o) => {
    const r = o._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
    t.minimum > r && (o._zod.bag.minimum = t.minimum);
  }), e._zod.check = (o) => {
    const r = o.value;
    if (r.length >= t.minimum)
      return;
    const s = $t(r);
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
}), ui = /* @__PURE__ */ f("$ZodCheckLengthEquals", (e, t) => {
  var n;
  W.init(e, t), (n = e._zod.def).when ?? (n.when = (o) => {
    const r = o.value;
    return !zt(r) && r.length !== void 0;
  }), e._zod.onattach.push((o) => {
    const r = o._zod.bag;
    r.minimum = t.length, r.maximum = t.length, r.length = t.length;
  }), e._zod.check = (o) => {
    const r = o.value, i = r.length;
    if (i === t.length)
      return;
    const s = $t(r), a = i > t.length;
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
}), ot = /* @__PURE__ */ f("$ZodCheckStringFormat", (e, t) => {
  var n, o;
  W.init(e, t), e._zod.onattach.push((r) => {
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
}), li = /* @__PURE__ */ f("$ZodCheckRegex", (e, t) => {
  ot.init(e, t), e._zod.check = (n) => {
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
}), di = /* @__PURE__ */ f("$ZodCheckLowerCase", (e, t) => {
  t.pattern ?? (t.pattern = oi), ot.init(e, t);
}), fi = /* @__PURE__ */ f("$ZodCheckUpperCase", (e, t) => {
  t.pattern ?? (t.pattern = ri), ot.init(e, t);
}), hi = /* @__PURE__ */ f("$ZodCheckIncludes", (e, t) => {
  W.init(e, t);
  const n = et(t.includes), o = new RegExp(typeof t.position == "number" ? `^.{${t.position}}${n}` : n);
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
}), pi = /* @__PURE__ */ f("$ZodCheckStartsWith", (e, t) => {
  W.init(e, t);
  const n = new RegExp(`^${et(t.prefix)}.*`);
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
}), mi = /* @__PURE__ */ f("$ZodCheckEndsWith", (e, t) => {
  W.init(e, t);
  const n = new RegExp(`.*${et(t.suffix)}$`);
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
}), bi = /* @__PURE__ */ f("$ZodCheckOverwrite", (e, t) => {
  W.init(e, t), e._zod.check = (n) => {
    n.value = t.tx(n.value);
  };
});
class gi {
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
const _i = {
  major: 4,
  minor: 3,
  patch: 6
}, M = /* @__PURE__ */ f("$ZodType", (e, t) => {
  var r;
  var n;
  e ?? (e = {}), e._zod.def = t, e._zod.bag = e._zod.bag || {}, e._zod.version = _i;
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
      let l = _e(a), d;
      for (const m of c) {
        if (m._zod.def.when) {
          if (!m._zod.def.when(a))
            continue;
        } else if (l)
          continue;
        const p = a.issues.length, g = m._zod.check(a);
        if (g instanceof Promise && (u == null ? void 0 : u.async) === !1)
          throw new ke();
        if (d || g instanceof Promise)
          d = (d ?? Promise.resolve()).then(async () => {
            await g, a.issues.length !== p && (l || (l = _e(a, p)));
          });
        else {
          if (a.issues.length === p)
            continue;
          l || (l = _e(a, p));
        }
      }
      return d ? d.then(() => a) : a;
    }, s = (a, c, u) => {
      if (_e(a))
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
  L(e, "~standard", () => ({
    validate: (i) => {
      var s;
      try {
        const a = zr(e, i);
        return a.success ? { value: a.data } : { issues: (s = a.error) == null ? void 0 : s.issues };
      } catch {
        return Sr(e, i).then((c) => {
          var u;
          return c.success ? { value: c.data } : { issues: (u = c.error) == null ? void 0 : u.issues };
        });
      }
    },
    vendor: "zod",
    version: 1
  }));
}), xt = /* @__PURE__ */ f("$ZodString", (e, t) => {
  var n;
  M.init(e, t), e._zod.pattern = [...((n = e == null ? void 0 : e._zod.bag) == null ? void 0 : n.patterns) ?? []].pop() ?? ei(e._zod.bag), e._zod.parse = (o, r) => {
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
}), O = /* @__PURE__ */ f("$ZodStringFormat", (e, t) => {
  ot.init(e, t), xt.init(e, t);
}), yi = /* @__PURE__ */ f("$ZodGUID", (e, t) => {
  t.pattern ?? (t.pattern = Fr), O.init(e, t);
}), vi = /* @__PURE__ */ f("$ZodUUID", (e, t) => {
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
    t.pattern ?? (t.pattern = Vt(o));
  } else
    t.pattern ?? (t.pattern = Vt());
  O.init(e, t);
}), wi = /* @__PURE__ */ f("$ZodEmail", (e, t) => {
  t.pattern ?? (t.pattern = Br), O.init(e, t);
}), ki = /* @__PURE__ */ f("$ZodURL", (e, t) => {
  O.init(e, t), e._zod.check = (n) => {
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
}), Ei = /* @__PURE__ */ f("$ZodEmoji", (e, t) => {
  t.pattern ?? (t.pattern = Hr()), O.init(e, t);
}), zi = /* @__PURE__ */ f("$ZodNanoID", (e, t) => {
  t.pattern ?? (t.pattern = jr), O.init(e, t);
}), Si = /* @__PURE__ */ f("$ZodCUID", (e, t) => {
  t.pattern ?? (t.pattern = Zr), O.init(e, t);
}), $i = /* @__PURE__ */ f("$ZodCUID2", (e, t) => {
  t.pattern ?? (t.pattern = Ir), O.init(e, t);
}), Ni = /* @__PURE__ */ f("$ZodULID", (e, t) => {
  t.pattern ?? (t.pattern = Or), O.init(e, t);
}), Ci = /* @__PURE__ */ f("$ZodXID", (e, t) => {
  t.pattern ?? (t.pattern = Pr), O.init(e, t);
}), xi = /* @__PURE__ */ f("$ZodKSUID", (e, t) => {
  t.pattern ?? (t.pattern = Mr), O.init(e, t);
}), Ti = /* @__PURE__ */ f("$ZodISODateTime", (e, t) => {
  t.pattern ?? (t.pattern = Qr(t)), O.init(e, t);
}), Ai = /* @__PURE__ */ f("$ZodISODate", (e, t) => {
  t.pattern ?? (t.pattern = Gr), O.init(e, t);
}), Ri = /* @__PURE__ */ f("$ZodISOTime", (e, t) => {
  t.pattern ?? (t.pattern = Kr(t)), O.init(e, t);
}), Li = /* @__PURE__ */ f("$ZodISODuration", (e, t) => {
  t.pattern ?? (t.pattern = Dr), O.init(e, t);
}), Zi = /* @__PURE__ */ f("$ZodIPv4", (e, t) => {
  t.pattern ?? (t.pattern = Vr), O.init(e, t), e._zod.bag.format = "ipv4";
}), Ii = /* @__PURE__ */ f("$ZodIPv6", (e, t) => {
  t.pattern ?? (t.pattern = qr), O.init(e, t), e._zod.bag.format = "ipv6", e._zod.check = (n) => {
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
}), Oi = /* @__PURE__ */ f("$ZodCIDRv4", (e, t) => {
  t.pattern ?? (t.pattern = Jr), O.init(e, t);
}), Pi = /* @__PURE__ */ f("$ZodCIDRv6", (e, t) => {
  t.pattern ?? (t.pattern = Wr), O.init(e, t), e._zod.check = (n) => {
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
function Pn(e) {
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
const Mi = /* @__PURE__ */ f("$ZodBase64", (e, t) => {
  t.pattern ?? (t.pattern = Xr), O.init(e, t), e._zod.bag.contentEncoding = "base64", e._zod.check = (n) => {
    Pn(n.value) || n.issues.push({
      code: "invalid_format",
      format: "base64",
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
});
function ji(e) {
  if (!Tn.test(e))
    return !1;
  const t = e.replace(/[-_]/g, (o) => o === "-" ? "+" : "/"), n = t.padEnd(Math.ceil(t.length / 4) * 4, "=");
  return Pn(n);
}
const Di = /* @__PURE__ */ f("$ZodBase64URL", (e, t) => {
  t.pattern ?? (t.pattern = Tn), O.init(e, t), e._zod.bag.contentEncoding = "base64url", e._zod.check = (n) => {
    ji(n.value) || n.issues.push({
      code: "invalid_format",
      format: "base64url",
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), Fi = /* @__PURE__ */ f("$ZodE164", (e, t) => {
  t.pattern ?? (t.pattern = Yr), O.init(e, t);
});
function Bi(e, t = null) {
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
const Ui = /* @__PURE__ */ f("$ZodJWT", (e, t) => {
  O.init(e, t), e._zod.check = (n) => {
    Bi(n.value, t.alg) || n.issues.push({
      code: "invalid_format",
      format: "jwt",
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), Mn = /* @__PURE__ */ f("$ZodNumber", (e, t) => {
  M.init(e, t), e._zod.pattern = e._zod.bag.pattern ?? Ln, e._zod.parse = (n, o) => {
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
}), Hi = /* @__PURE__ */ f("$ZodNumberFormat", (e, t) => {
  si.init(e, t), Mn.init(e, t);
}), Vi = /* @__PURE__ */ f("$ZodBoolean", (e, t) => {
  M.init(e, t), e._zod.pattern = ni, e._zod.parse = (n, o) => {
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
}), qi = /* @__PURE__ */ f("$ZodUnknown", (e, t) => {
  M.init(e, t), e._zod.parse = (n) => n;
}), Ji = /* @__PURE__ */ f("$ZodNever", (e, t) => {
  M.init(e, t), e._zod.parse = (n, o) => (n.issues.push({
    expected: "never",
    code: "invalid_type",
    input: n.value,
    inst: e
  }), n);
});
function qt(e, t, n) {
  e.issues.length && t.issues.push(...ye(n, e.issues)), t.value[n] = e.value;
}
const Wi = /* @__PURE__ */ f("$ZodArray", (e, t) => {
  M.init(e, t), e._zod.parse = (n, o) => {
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
      c instanceof Promise ? i.push(c.then((u) => qt(u, n, s))) : qt(c, n, s);
    }
    return i.length ? Promise.all(i).then(() => n) : n;
  };
});
function qe(e, t, n, o, r) {
  if (e.issues.length) {
    if (r && !(n in o))
      return;
    t.issues.push(...ye(n, e.issues));
  }
  e.value === void 0 ? n in o && (t.value[n] = void 0) : t.value[n] = e.value;
}
function jn(e) {
  var o, r, i, s;
  const t = Object.keys(e.shape);
  for (const a of t)
    if (!((s = (i = (r = (o = e.shape) == null ? void 0 : o[a]) == null ? void 0 : r._zod) == null ? void 0 : i.traits) != null && s.has("$ZodType")))
      throw new Error(`Invalid element at key "${a}": expected a Zod schema`);
  const n = hr(e.shape);
  return {
    ...e,
    keys: t,
    keySet: new Set(t),
    numKeys: t.length,
    optionalKeys: new Set(n)
  };
}
function Dn(e, t, n, o, r, i) {
  const s = [], a = r.keySet, c = r.catchall._zod, u = c.def.type, l = c.optout === "optional";
  for (const d in t) {
    if (a.has(d))
      continue;
    if (u === "never") {
      s.push(d);
      continue;
    }
    const m = c.run({ value: t[d], issues: [] }, o);
    m instanceof Promise ? e.push(m.then((p) => qe(p, n, d, t, l))) : qe(m, n, d, t, l);
  }
  return s.length && n.issues.push({
    code: "unrecognized_keys",
    keys: s,
    input: t,
    inst: i
  }), e.length ? Promise.all(e).then(() => n) : n;
}
const Xi = /* @__PURE__ */ f("$ZodObject", (e, t) => {
  M.init(e, t);
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
  const o = Et(() => jn(t));
  L(e._zod, "propValues", () => {
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
  const r = Ve, i = t.catchall;
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
      const p = d[m], g = p._zod.optout === "optional", _ = p._zod.run({ value: u[m], issues: [] }, c);
      _ instanceof Promise ? l.push(_.then((C) => qe(C, a, m, u, g))) : qe(_, a, m, u, g);
    }
    return i ? Dn(l, u, a, c, o.value, e) : l.length ? Promise.all(l).then(() => a) : a;
  };
}), Yi = /* @__PURE__ */ f("$ZodObjectJIT", (e, t) => {
  Xi.init(e, t);
  const n = e._zod.parse, o = Et(() => jn(t)), r = (m) => {
    var b;
    const p = new gi(["shape", "payload", "ctx"]), g = o.value, _ = (E) => {
      const y = Ht(E);
      return `shape[${y}]._zod.run({ value: input[${y}], issues: [] }, ctx)`;
    };
    p.write("const input = payload.value;");
    const C = /* @__PURE__ */ Object.create(null);
    let k = 0;
    for (const E of g.keys)
      C[E] = `key_${k++}`;
    p.write("const newResult = {};");
    for (const E of g.keys) {
      const y = C[E], x = Ht(E), z = m[E], $ = ((b = z == null ? void 0 : z._zod) == null ? void 0 : b.optout) === "optional";
      p.write(`const ${y} = ${_(E)};`), $ ? p.write(`
        if (${y}.issues.length) {
          if (${x} in input) {
            payload.issues = payload.issues.concat(${y}.issues.map(iss => ({
              ...iss,
              path: iss.path ? [${x}, ...iss.path] : [${x}]
            })));
          }
        }
        
        if (${y}.value === undefined) {
          if (${x} in input) {
            newResult[${x}] = undefined;
          }
        } else {
          newResult[${x}] = ${y}.value;
        }
        
      `) : p.write(`
        if (${y}.issues.length) {
          payload.issues = payload.issues.concat(${y}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${x}, ...iss.path] : [${x}]
          })));
        }
        
        if (${y}.value === undefined) {
          if (${x} in input) {
            newResult[${x}] = undefined;
          }
        } else {
          newResult[${x}] = ${y}.value;
        }
        
      `);
    }
    p.write("payload.value = newResult;"), p.write("return payload;");
    const N = p.compile();
    return (E, y) => N(m, E, y);
  };
  let i;
  const s = Ve, a = !En.jitless, u = a && dr.value, l = t.catchall;
  let d;
  e._zod.parse = (m, p) => {
    d ?? (d = o.value);
    const g = m.value;
    return s(g) ? a && u && (p == null ? void 0 : p.async) === !1 && p.jitless !== !0 ? (i || (i = r(t.shape)), m = i(m, p), l ? Dn([], g, m, p, d, e) : m) : n(m, p) : (m.issues.push({
      expected: "object",
      code: "invalid_type",
      input: g,
      inst: e
    }), m);
  };
});
function Jt(e, t, n, o) {
  for (const i of e)
    if (i.issues.length === 0)
      return t.value = i.value, t;
  const r = e.filter((i) => !_e(i));
  return r.length === 1 ? (t.value = r[0].value, r[0]) : (t.issues.push({
    code: "invalid_union",
    input: t.value,
    inst: n,
    errors: e.map((i) => i.issues.map((s) => ae(s, o, se())))
  }), t);
}
const Gi = /* @__PURE__ */ f("$ZodUnion", (e, t) => {
  M.init(e, t), L(e._zod, "optin", () => t.options.some((r) => r._zod.optin === "optional") ? "optional" : void 0), L(e._zod, "optout", () => t.options.some((r) => r._zod.optout === "optional") ? "optional" : void 0), L(e._zod, "values", () => {
    if (t.options.every((r) => r._zod.values))
      return new Set(t.options.flatMap((r) => Array.from(r._zod.values)));
  }), L(e._zod, "pattern", () => {
    if (t.options.every((r) => r._zod.pattern)) {
      const r = t.options.map((i) => i._zod.pattern);
      return new RegExp(`^(${r.map((i) => St(i.source)).join("|")})$`);
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
    return s ? Promise.all(a).then((c) => Jt(c, r, e, i)) : Jt(a, r, e, i);
  };
}), Ki = /* @__PURE__ */ f("$ZodIntersection", (e, t) => {
  M.init(e, t), e._zod.parse = (n, o) => {
    const r = n.value, i = t.left._zod.run({ value: r, issues: [] }, o), s = t.right._zod.run({ value: r, issues: [] }, o);
    return i instanceof Promise || s instanceof Promise ? Promise.all([i, s]).then(([c, u]) => Wt(n, c, u)) : Wt(n, i, s);
  };
});
function vt(e, t) {
  if (e === t)
    return { valid: !0, data: e };
  if (e instanceof Date && t instanceof Date && +e == +t)
    return { valid: !0, data: e };
  if (Ee(e) && Ee(t)) {
    const n = Object.keys(t), o = Object.keys(e).filter((i) => n.indexOf(i) !== -1), r = { ...e, ...t };
    for (const i of o) {
      const s = vt(e[i], t[i]);
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
      const r = e[o], i = t[o], s = vt(r, i);
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
function Wt(e, t, n) {
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
  if (i.length && r && e.issues.push({ ...r, keys: i }), _e(e))
    return e;
  const s = vt(t.value, n.value);
  if (!s.valid)
    throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(s.mergeErrorPath)}`);
  return e.value = s.data, e;
}
const Qi = /* @__PURE__ */ f("$ZodRecord", (e, t) => {
  M.init(e, t), e._zod.parse = (n, o) => {
    const r = n.value;
    if (!Ee(r))
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
            d.issues.length && n.issues.push(...ye(u, d.issues)), n.value[u] = d.value;
          })) : (l.issues.length && n.issues.push(...ye(u, l.issues)), n.value[u] = l.value);
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
        if (typeof a == "string" && Ln.test(a) && c.issues.length) {
          const d = t.keyType._zod.run({ value: Number(a), issues: [] }, o);
          if (d instanceof Promise)
            throw new Error("Async schemas not supported in object keys currently");
          d.issues.length === 0 && (c = d);
        }
        if (c.issues.length) {
          t.mode === "loose" ? n.value[a] = r[a] : n.issues.push({
            code: "invalid_key",
            origin: "record",
            issues: c.issues.map((d) => ae(d, o, se())),
            input: a,
            path: [a],
            inst: e
          });
          continue;
        }
        const l = t.valueType._zod.run({ value: r[a], issues: [] }, o);
        l instanceof Promise ? i.push(l.then((d) => {
          d.issues.length && n.issues.push(...ye(a, d.issues)), n.value[c.value] = d.value;
        })) : (l.issues.length && n.issues.push(...ye(a, l.issues)), n.value[c.value] = l.value);
      }
    }
    return i.length ? Promise.all(i).then(() => n) : n;
  };
}), es = /* @__PURE__ */ f("$ZodEnum", (e, t) => {
  M.init(e, t);
  const n = zn(t.entries), o = new Set(n);
  e._zod.values = o, e._zod.pattern = new RegExp(`^(${n.filter((r) => fr.has(typeof r)).map((r) => typeof r == "string" ? et(r) : r.toString()).join("|")})$`), e._zod.parse = (r, i) => {
    const s = r.value;
    return o.has(s) || r.issues.push({
      code: "invalid_value",
      values: n,
      input: s,
      inst: e
    }), r;
  };
}), ts = /* @__PURE__ */ f("$ZodTransform", (e, t) => {
  M.init(e, t), e._zod.parse = (n, o) => {
    if (o.direction === "backward")
      throw new kn(e.constructor.name);
    const r = t.transform(n.value, n);
    if (o.async)
      return (r instanceof Promise ? r : Promise.resolve(r)).then((s) => (n.value = s, n));
    if (r instanceof Promise)
      throw new ke();
    return n.value = r, n;
  };
});
function Xt(e, t) {
  return e.issues.length && t === void 0 ? { issues: [], value: void 0 } : e;
}
const Fn = /* @__PURE__ */ f("$ZodOptional", (e, t) => {
  M.init(e, t), e._zod.optin = "optional", e._zod.optout = "optional", L(e._zod, "values", () => t.innerType._zod.values ? /* @__PURE__ */ new Set([...t.innerType._zod.values, void 0]) : void 0), L(e._zod, "pattern", () => {
    const n = t.innerType._zod.pattern;
    return n ? new RegExp(`^(${St(n.source)})?$`) : void 0;
  }), e._zod.parse = (n, o) => {
    if (t.innerType._zod.optin === "optional") {
      const r = t.innerType._zod.run(n, o);
      return r instanceof Promise ? r.then((i) => Xt(i, n.value)) : Xt(r, n.value);
    }
    return n.value === void 0 ? n : t.innerType._zod.run(n, o);
  };
}), ns = /* @__PURE__ */ f("$ZodExactOptional", (e, t) => {
  Fn.init(e, t), L(e._zod, "values", () => t.innerType._zod.values), L(e._zod, "pattern", () => t.innerType._zod.pattern), e._zod.parse = (n, o) => t.innerType._zod.run(n, o);
}), os = /* @__PURE__ */ f("$ZodNullable", (e, t) => {
  M.init(e, t), L(e._zod, "optin", () => t.innerType._zod.optin), L(e._zod, "optout", () => t.innerType._zod.optout), L(e._zod, "pattern", () => {
    const n = t.innerType._zod.pattern;
    return n ? new RegExp(`^(${St(n.source)}|null)$`) : void 0;
  }), L(e._zod, "values", () => t.innerType._zod.values ? /* @__PURE__ */ new Set([...t.innerType._zod.values, null]) : void 0), e._zod.parse = (n, o) => n.value === null ? n : t.innerType._zod.run(n, o);
}), rs = /* @__PURE__ */ f("$ZodDefault", (e, t) => {
  M.init(e, t), e._zod.optin = "optional", L(e._zod, "values", () => t.innerType._zod.values), e._zod.parse = (n, o) => {
    if (o.direction === "backward")
      return t.innerType._zod.run(n, o);
    if (n.value === void 0)
      return n.value = t.defaultValue, n;
    const r = t.innerType._zod.run(n, o);
    return r instanceof Promise ? r.then((i) => Yt(i, t)) : Yt(r, t);
  };
});
function Yt(e, t) {
  return e.value === void 0 && (e.value = t.defaultValue), e;
}
const is = /* @__PURE__ */ f("$ZodPrefault", (e, t) => {
  M.init(e, t), e._zod.optin = "optional", L(e._zod, "values", () => t.innerType._zod.values), e._zod.parse = (n, o) => (o.direction === "backward" || n.value === void 0 && (n.value = t.defaultValue), t.innerType._zod.run(n, o));
}), ss = /* @__PURE__ */ f("$ZodNonOptional", (e, t) => {
  M.init(e, t), L(e._zod, "values", () => {
    const n = t.innerType._zod.values;
    return n ? new Set([...n].filter((o) => o !== void 0)) : void 0;
  }), e._zod.parse = (n, o) => {
    const r = t.innerType._zod.run(n, o);
    return r instanceof Promise ? r.then((i) => Gt(i, e)) : Gt(r, e);
  };
});
function Gt(e, t) {
  return !e.issues.length && e.value === void 0 && e.issues.push({
    code: "invalid_type",
    expected: "nonoptional",
    input: e.value,
    inst: t
  }), e;
}
const as = /* @__PURE__ */ f("$ZodCatch", (e, t) => {
  M.init(e, t), L(e._zod, "optin", () => t.innerType._zod.optin), L(e._zod, "optout", () => t.innerType._zod.optout), L(e._zod, "values", () => t.innerType._zod.values), e._zod.parse = (n, o) => {
    if (o.direction === "backward")
      return t.innerType._zod.run(n, o);
    const r = t.innerType._zod.run(n, o);
    return r instanceof Promise ? r.then((i) => (n.value = i.value, i.issues.length && (n.value = t.catchValue({
      ...n,
      error: {
        issues: i.issues.map((s) => ae(s, o, se()))
      },
      input: n.value
    }), n.issues = []), n)) : (n.value = r.value, r.issues.length && (n.value = t.catchValue({
      ...n,
      error: {
        issues: r.issues.map((i) => ae(i, o, se()))
      },
      input: n.value
    }), n.issues = []), n);
  };
}), cs = /* @__PURE__ */ f("$ZodPipe", (e, t) => {
  M.init(e, t), L(e._zod, "values", () => t.in._zod.values), L(e._zod, "optin", () => t.in._zod.optin), L(e._zod, "optout", () => t.out._zod.optout), L(e._zod, "propValues", () => t.in._zod.propValues), e._zod.parse = (n, o) => {
    if (o.direction === "backward") {
      const i = t.out._zod.run(n, o);
      return i instanceof Promise ? i.then((s) => Pe(s, t.in, o)) : Pe(i, t.in, o);
    }
    const r = t.in._zod.run(n, o);
    return r instanceof Promise ? r.then((i) => Pe(i, t.out, o)) : Pe(r, t.out, o);
  };
});
function Pe(e, t, n) {
  return e.issues.length ? (e.aborted = !0, e) : t._zod.run({ value: e.value, issues: e.issues }, n);
}
const us = /* @__PURE__ */ f("$ZodReadonly", (e, t) => {
  M.init(e, t), L(e._zod, "propValues", () => t.innerType._zod.propValues), L(e._zod, "values", () => t.innerType._zod.values), L(e._zod, "optin", () => {
    var n, o;
    return (o = (n = t.innerType) == null ? void 0 : n._zod) == null ? void 0 : o.optin;
  }), L(e._zod, "optout", () => {
    var n, o;
    return (o = (n = t.innerType) == null ? void 0 : n._zod) == null ? void 0 : o.optout;
  }), e._zod.parse = (n, o) => {
    if (o.direction === "backward")
      return t.innerType._zod.run(n, o);
    const r = t.innerType._zod.run(n, o);
    return r instanceof Promise ? r.then(Kt) : Kt(r);
  };
});
function Kt(e) {
  return e.value = Object.freeze(e.value), e;
}
const ls = /* @__PURE__ */ f("$ZodCustom", (e, t) => {
  W.init(e, t), M.init(e, t), e._zod.parse = (n, o) => n, e._zod.check = (n) => {
    const o = n.value, r = t.fn(o);
    if (r instanceof Promise)
      return r.then((i) => Qt(i, n, o, e));
    Qt(r, n, o, e);
  };
});
function Qt(e, t, n, o) {
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
    o._zod.def.params && (r.params = o._zod.def.params), t.issues.push(Le(r));
  }
}
var en;
class ds {
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
function fs() {
  return new ds();
}
(en = globalThis).__zod_globalRegistry ?? (en.__zod_globalRegistry = fs());
const Te = globalThis.__zod_globalRegistry;
// @__NO_SIDE_EFFECTS__
function hs(e, t) {
  return new e({
    type: "string",
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function ps(e, t) {
  return new e({
    type: "string",
    format: "email",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function tn(e, t) {
  return new e({
    type: "string",
    format: "guid",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function ms(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function bs(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v4",
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function gs(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v6",
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function _s(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v7",
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function ys(e, t) {
  return new e({
    type: "string",
    format: "url",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function vs(e, t) {
  return new e({
    type: "string",
    format: "emoji",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function ws(e, t) {
  return new e({
    type: "string",
    format: "nanoid",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function ks(e, t) {
  return new e({
    type: "string",
    format: "cuid",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Es(e, t) {
  return new e({
    type: "string",
    format: "cuid2",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function zs(e, t) {
  return new e({
    type: "string",
    format: "ulid",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Ss(e, t) {
  return new e({
    type: "string",
    format: "xid",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function $s(e, t) {
  return new e({
    type: "string",
    format: "ksuid",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Ns(e, t) {
  return new e({
    type: "string",
    format: "ipv4",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Cs(e, t) {
  return new e({
    type: "string",
    format: "ipv6",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function xs(e, t) {
  return new e({
    type: "string",
    format: "cidrv4",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Ts(e, t) {
  return new e({
    type: "string",
    format: "cidrv6",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function As(e, t) {
  return new e({
    type: "string",
    format: "base64",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Rs(e, t) {
  return new e({
    type: "string",
    format: "base64url",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Ls(e, t) {
  return new e({
    type: "string",
    format: "e164",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Zs(e, t) {
  return new e({
    type: "string",
    format: "jwt",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Is(e, t) {
  return new e({
    type: "string",
    format: "datetime",
    check: "string_format",
    offset: !1,
    local: !1,
    precision: null,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Os(e, t) {
  return new e({
    type: "string",
    format: "date",
    check: "string_format",
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Ps(e, t) {
  return new e({
    type: "string",
    format: "time",
    check: "string_format",
    precision: null,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Ms(e, t) {
  return new e({
    type: "string",
    format: "duration",
    check: "string_format",
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function js(e, t) {
  return new e({
    type: "number",
    checks: [],
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Ds(e, t) {
  return new e({
    type: "number",
    check: "number_format",
    abort: !1,
    format: "safeint",
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Fs(e, t) {
  return new e({
    type: "boolean",
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Bs(e) {
  return new e({
    type: "unknown"
  });
}
// @__NO_SIDE_EFFECTS__
function Us(e, t) {
  return new e({
    type: "never",
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function nn(e, t) {
  return new In({
    check: "less_than",
    ...S(t),
    value: e,
    inclusive: !1
  });
}
// @__NO_SIDE_EFFECTS__
function ht(e, t) {
  return new In({
    check: "less_than",
    ...S(t),
    value: e,
    inclusive: !0
  });
}
// @__NO_SIDE_EFFECTS__
function on(e, t) {
  return new On({
    check: "greater_than",
    ...S(t),
    value: e,
    inclusive: !1
  });
}
// @__NO_SIDE_EFFECTS__
function pt(e, t) {
  return new On({
    check: "greater_than",
    ...S(t),
    value: e,
    inclusive: !0
  });
}
// @__NO_SIDE_EFFECTS__
function rn(e, t) {
  return new ii({
    check: "multiple_of",
    ...S(t),
    value: e
  });
}
// @__NO_SIDE_EFFECTS__
function Bn(e, t) {
  return new ai({
    check: "max_length",
    ...S(t),
    maximum: e
  });
}
// @__NO_SIDE_EFFECTS__
function Je(e, t) {
  return new ci({
    check: "min_length",
    ...S(t),
    minimum: e
  });
}
// @__NO_SIDE_EFFECTS__
function Un(e, t) {
  return new ui({
    check: "length_equals",
    ...S(t),
    length: e
  });
}
// @__NO_SIDE_EFFECTS__
function Hs(e, t) {
  return new li({
    check: "string_format",
    format: "regex",
    ...S(t),
    pattern: e
  });
}
// @__NO_SIDE_EFFECTS__
function Vs(e) {
  return new di({
    check: "string_format",
    format: "lowercase",
    ...S(e)
  });
}
// @__NO_SIDE_EFFECTS__
function qs(e) {
  return new fi({
    check: "string_format",
    format: "uppercase",
    ...S(e)
  });
}
// @__NO_SIDE_EFFECTS__
function Js(e, t) {
  return new hi({
    check: "string_format",
    format: "includes",
    ...S(t),
    includes: e
  });
}
// @__NO_SIDE_EFFECTS__
function Ws(e, t) {
  return new pi({
    check: "string_format",
    format: "starts_with",
    ...S(t),
    prefix: e
  });
}
// @__NO_SIDE_EFFECTS__
function Xs(e, t) {
  return new mi({
    check: "string_format",
    format: "ends_with",
    ...S(t),
    suffix: e
  });
}
// @__NO_SIDE_EFFECTS__
function ze(e) {
  return new bi({
    check: "overwrite",
    tx: e
  });
}
// @__NO_SIDE_EFFECTS__
function Ys(e) {
  return /* @__PURE__ */ ze((t) => t.normalize(e));
}
// @__NO_SIDE_EFFECTS__
function Gs() {
  return /* @__PURE__ */ ze((e) => e.trim());
}
// @__NO_SIDE_EFFECTS__
function Ks() {
  return /* @__PURE__ */ ze((e) => e.toLowerCase());
}
// @__NO_SIDE_EFFECTS__
function Qs() {
  return /* @__PURE__ */ ze((e) => e.toUpperCase());
}
// @__NO_SIDE_EFFECTS__
function ea() {
  return /* @__PURE__ */ ze((e) => lr(e));
}
// @__NO_SIDE_EFFECTS__
function ta(e, t, n) {
  return new e({
    type: "array",
    element: t,
    // get element() {
    //   return element;
    // },
    ...S(n)
  });
}
// @__NO_SIDE_EFFECTS__
function na(e, t, n) {
  return new e({
    type: "custom",
    check: "custom",
    fn: t,
    ...S(n)
  });
}
// @__NO_SIDE_EFFECTS__
function oa(e) {
  const t = /* @__PURE__ */ ra((n) => (n.addIssue = (o) => {
    if (typeof o == "string")
      n.issues.push(Le(o, n.value, t._zod.def));
    else {
      const r = o;
      r.fatal && (r.continue = !1), r.code ?? (r.code = "custom"), r.input ?? (r.input = n.value), r.inst ?? (r.inst = t), r.continue ?? (r.continue = !t._zod.def.abort), n.issues.push(Le(r));
    }
  }, e(n.value, n)));
  return t;
}
// @__NO_SIDE_EFFECTS__
function ra(e, t) {
  const n = new W({
    check: "custom",
    ...S(t)
  });
  return n._zod.check = e, n;
}
function Hn(e) {
  let t = (e == null ? void 0 : e.target) ?? "draft-2020-12";
  return t === "draft-4" && (t = "draft-04"), t === "draft-7" && (t = "draft-07"), {
    processors: e.processors ?? {},
    metadataRegistry: (e == null ? void 0 : e.metadata) ?? Te,
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
      const g = s.schema, _ = t.processors[r.type];
      if (!_)
        throw new Error(`[toJSONSchema]: Non-representable type encountered: ${r.type}`);
      _(e, t, g, m);
    }
    const p = e._zod.parent;
    p && (s.ref || (s.ref = p), U(p, t, m), t.seen.get(p).isParent = !0);
  }
  const c = t.metadataRegistry.get(e);
  return c && Object.assign(s.schema, c), t.io === "input" && q(e) && (delete s.schema.examples, delete s.schema.default), t.io === "input" && s.schema._prefault && ((o = s.schema).default ?? (o.default = s.schema._prefault)), delete s.schema._prefault, t.seen.get(e).schema;
}
function Vn(e, t) {
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
    var _;
    const d = e.target === "draft-2020-12" ? "$defs" : "definitions";
    if (e.external) {
      const C = (_ = e.external.registry.get(l[0])) == null ? void 0 : _.id, k = e.external.uri ?? ((b) => b);
      if (C)
        return { ref: k(C) };
      const N = l[1].defId ?? l[1].schema.id ?? `schema${e.counter++}`;
      return l[1].defId = N, { defId: N, ref: `${k("__shared")}#/${d}/${N}` };
    }
    if (l[1] === n)
      return { ref: "#" };
    const p = `#/${d}/`, g = l[1].schema.id ?? `__schema${e.counter++}`;
    return { defId: g, ref: p + g };
  }, i = (l) => {
    if (l[1].schema.$ref)
      return;
    const d = l[1], { ref: m, defId: p } = r(l);
    d.def = { ...d.schema }, p && (d.defId = p);
    const g = d.schema;
    for (const _ in g)
      delete g[_];
    g.$ref = m;
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
      const p = (c = e.external.registry.get(l[0])) == null ? void 0 : c.id;
      if (t !== l[0] && p) {
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
function qn(e, t) {
  var s, a, c;
  const n = e.seen.get(t);
  if (!n)
    throw new Error("Unprocessed schema. This is a bug in Zod.");
  const o = (u) => {
    const l = e.seen.get(u);
    if (l.ref === null)
      return;
    const d = l.def ?? l.schema, m = { ...d }, p = l.ref;
    if (l.ref = null, p) {
      o(p);
      const _ = e.seen.get(p), C = _.schema;
      if (C.$ref && (e.target === "draft-07" || e.target === "draft-04" || e.target === "openapi-3.0") ? (d.allOf = d.allOf ?? [], d.allOf.push(C)) : Object.assign(d, C), Object.assign(d, m), u._zod.parent === p)
        for (const N in d)
          N === "$ref" || N === "allOf" || N in m || delete d[N];
      if (C.$ref && _.def)
        for (const N in d)
          N === "$ref" || N === "allOf" || N in _.def && JSON.stringify(d[N]) === JSON.stringify(_.def[N]) && delete d[N];
    }
    const g = u._zod.parent;
    if (g && g !== p) {
      o(g);
      const _ = e.seen.get(g);
      if (_ != null && _.schema.$ref && (d.$ref = _.schema.$ref, _.def))
        for (const C in d)
          C === "$ref" || C === "allOf" || C in _.def && JSON.stringify(d[C]) === JSON.stringify(_.def[C]) && delete d[C];
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
          input: We(t, "input", e.processors),
          output: We(t, "output", e.processors)
        }
      },
      enumerable: !1,
      writable: !1
    }), u;
  } catch {
    throw new Error("Error converting schema to JSON.");
  }
}
function q(e, t) {
  const n = t ?? { seen: /* @__PURE__ */ new Set() };
  if (n.seen.has(e))
    return !1;
  n.seen.add(e);
  const o = e._zod.def;
  if (o.type === "transform")
    return !0;
  if (o.type === "array")
    return q(o.element, n);
  if (o.type === "set")
    return q(o.valueType, n);
  if (o.type === "lazy")
    return q(o.getter(), n);
  if (o.type === "promise" || o.type === "optional" || o.type === "nonoptional" || o.type === "nullable" || o.type === "readonly" || o.type === "default" || o.type === "prefault")
    return q(o.innerType, n);
  if (o.type === "intersection")
    return q(o.left, n) || q(o.right, n);
  if (o.type === "record" || o.type === "map")
    return q(o.keyType, n) || q(o.valueType, n);
  if (o.type === "pipe")
    return q(o.in, n) || q(o.out, n);
  if (o.type === "object") {
    for (const r in o.shape)
      if (q(o.shape[r], n))
        return !0;
    return !1;
  }
  if (o.type === "union") {
    for (const r of o.options)
      if (q(r, n))
        return !0;
    return !1;
  }
  if (o.type === "tuple") {
    for (const r of o.items)
      if (q(r, n))
        return !0;
    return !!(o.rest && q(o.rest, n));
  }
  return !1;
}
const ia = (e, t = {}) => (n) => {
  const o = Hn({ ...n, processors: t });
  return U(e, o), Vn(o, e), qn(o, e);
}, We = (e, t, n = {}) => (o) => {
  const { libraryOptions: r, target: i } = o ?? {}, s = Hn({ ...r ?? {}, target: i, io: t, processors: n });
  return U(e, s), Vn(s, e), qn(s, e);
}, sa = {
  guid: "uuid",
  url: "uri",
  datetime: "date-time",
  json_string: "json-string",
  regex: ""
  // do not set
}, aa = (e, t, n, o) => {
  const r = n;
  r.type = "string";
  const { minimum: i, maximum: s, format: a, patterns: c, contentEncoding: u } = e._zod.bag;
  if (typeof i == "number" && (r.minLength = i), typeof s == "number" && (r.maxLength = s), a && (r.format = sa[a] ?? a, r.format === "" && delete r.format, a === "time" && delete r.format), u && (r.contentEncoding = u), c && c.size > 0) {
    const l = [...c];
    l.length === 1 ? r.pattern = l[0].source : l.length > 1 && (r.allOf = [
      ...l.map((d) => ({
        ...t.target === "draft-07" || t.target === "draft-04" || t.target === "openapi-3.0" ? { type: "string" } : {},
        pattern: d.source
      }))
    ]);
  }
}, ca = (e, t, n, o) => {
  const r = n, { minimum: i, maximum: s, format: a, multipleOf: c, exclusiveMaximum: u, exclusiveMinimum: l } = e._zod.bag;
  typeof a == "string" && a.includes("int") ? r.type = "integer" : r.type = "number", typeof l == "number" && (t.target === "draft-04" || t.target === "openapi-3.0" ? (r.minimum = l, r.exclusiveMinimum = !0) : r.exclusiveMinimum = l), typeof i == "number" && (r.minimum = i, typeof l == "number" && t.target !== "draft-04" && (l >= i ? delete r.minimum : delete r.exclusiveMinimum)), typeof u == "number" && (t.target === "draft-04" || t.target === "openapi-3.0" ? (r.maximum = u, r.exclusiveMaximum = !0) : r.exclusiveMaximum = u), typeof s == "number" && (r.maximum = s, typeof u == "number" && t.target !== "draft-04" && (u <= s ? delete r.maximum : delete r.exclusiveMaximum)), typeof c == "number" && (r.multipleOf = c);
}, ua = (e, t, n, o) => {
  n.type = "boolean";
}, la = (e, t, n, o) => {
  n.not = {};
}, da = (e, t, n, o) => {
}, fa = (e, t, n, o) => {
  const r = e._zod.def, i = zn(r.entries);
  i.every((s) => typeof s == "number") && (n.type = "number"), i.every((s) => typeof s == "string") && (n.type = "string"), n.enum = i;
}, ha = (e, t, n, o) => {
  if (t.unrepresentable === "throw")
    throw new Error("Custom types cannot be represented in JSON Schema");
}, pa = (e, t, n, o) => {
  if (t.unrepresentable === "throw")
    throw new Error("Transforms cannot be represented in JSON Schema");
}, ma = (e, t, n, o) => {
  const r = n, i = e._zod.def, { minimum: s, maximum: a } = e._zod.bag;
  typeof s == "number" && (r.minItems = s), typeof a == "number" && (r.maxItems = a), r.type = "array", r.items = U(i.element, t, { ...o, path: [...o.path, "items"] });
}, ba = (e, t, n, o) => {
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
}, ga = (e, t, n, o) => {
  const r = e._zod.def, i = r.inclusive === !1, s = r.options.map((a, c) => U(a, t, {
    ...o,
    path: [...o.path, i ? "oneOf" : "anyOf", c]
  }));
  i ? n.oneOf = s : n.anyOf = s;
}, _a = (e, t, n, o) => {
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
}, ya = (e, t, n, o) => {
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
}, va = (e, t, n, o) => {
  const r = e._zod.def, i = U(r.innerType, t, o), s = t.seen.get(e);
  t.target === "openapi-3.0" ? (s.ref = r.innerType, n.nullable = !0) : n.anyOf = [i, { type: "null" }];
}, wa = (e, t, n, o) => {
  const r = e._zod.def;
  U(r.innerType, t, o);
  const i = t.seen.get(e);
  i.ref = r.innerType;
}, ka = (e, t, n, o) => {
  const r = e._zod.def;
  U(r.innerType, t, o);
  const i = t.seen.get(e);
  i.ref = r.innerType, n.default = JSON.parse(JSON.stringify(r.defaultValue));
}, Ea = (e, t, n, o) => {
  const r = e._zod.def;
  U(r.innerType, t, o);
  const i = t.seen.get(e);
  i.ref = r.innerType, t.io === "input" && (n._prefault = JSON.parse(JSON.stringify(r.defaultValue)));
}, za = (e, t, n, o) => {
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
}, Sa = (e, t, n, o) => {
  const r = e._zod.def, i = t.io === "input" ? r.in._zod.def.type === "transform" ? r.out : r.in : r.out;
  U(i, t, o);
  const s = t.seen.get(e);
  s.ref = i;
}, $a = (e, t, n, o) => {
  const r = e._zod.def;
  U(r.innerType, t, o);
  const i = t.seen.get(e);
  i.ref = r.innerType, n.readOnly = !0;
}, Jn = (e, t, n, o) => {
  const r = e._zod.def;
  U(r.innerType, t, o);
  const i = t.seen.get(e);
  i.ref = r.innerType;
}, Na = /* @__PURE__ */ f("ZodISODateTime", (e, t) => {
  Ti.init(e, t), P.init(e, t);
});
function Ca(e) {
  return /* @__PURE__ */ Is(Na, e);
}
const xa = /* @__PURE__ */ f("ZodISODate", (e, t) => {
  Ai.init(e, t), P.init(e, t);
});
function Ta(e) {
  return /* @__PURE__ */ Os(xa, e);
}
const Aa = /* @__PURE__ */ f("ZodISOTime", (e, t) => {
  Ri.init(e, t), P.init(e, t);
});
function Ra(e) {
  return /* @__PURE__ */ Ps(Aa, e);
}
const La = /* @__PURE__ */ f("ZodISODuration", (e, t) => {
  Li.init(e, t), P.init(e, t);
});
function Za(e) {
  return /* @__PURE__ */ Ms(La, e);
}
const Ia = (e, t) => {
  Cn.init(e, t), e.name = "ZodError", Object.defineProperties(e, {
    format: {
      value: (n) => Er(e, n)
      // enumerable: false,
    },
    flatten: {
      value: (n) => kr(e, n)
      // enumerable: false,
    },
    addIssue: {
      value: (n) => {
        e.issues.push(n), e.message = JSON.stringify(e.issues, yt, 2);
      }
      // enumerable: false,
    },
    addIssues: {
      value: (n) => {
        e.issues.push(...n), e.message = JSON.stringify(e.issues, yt, 2);
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
}, X = f("ZodError", Ia, {
  Parent: Error
}), Oa = /* @__PURE__ */ Nt(X), Pa = /* @__PURE__ */ Ct(X), Ma = /* @__PURE__ */ tt(X), ja = /* @__PURE__ */ nt(X), Da = /* @__PURE__ */ $r(X), Fa = /* @__PURE__ */ Nr(X), Ba = /* @__PURE__ */ Cr(X), Ua = /* @__PURE__ */ xr(X), Ha = /* @__PURE__ */ Tr(X), Va = /* @__PURE__ */ Ar(X), qa = /* @__PURE__ */ Rr(X), Ja = /* @__PURE__ */ Lr(X), j = /* @__PURE__ */ f("ZodType", (e, t) => (M.init(e, t), Object.assign(e["~standard"], {
  jsonSchema: {
    input: We(e, "input"),
    output: We(e, "output")
  }
}), e.toJSONSchema = ia(e, {}), e.def = t, e.type = t.type, Object.defineProperty(e, "_def", { value: t }), e.check = (...n) => e.clone(ce(t, {
  checks: [
    ...t.checks ?? [],
    ...n.map((o) => typeof o == "function" ? { _zod: { check: o, def: { check: "custom" }, onattach: [] } } : o)
  ]
}), {
  parent: !0
}), e.with = e.check, e.clone = (n, o) => ue(e, n, o), e.brand = () => e, e.register = (n, o) => (n.add(e, o), e), e.parse = (n, o) => Oa(e, n, o, { callee: e.parse }), e.safeParse = (n, o) => Ma(e, n, o), e.parseAsync = async (n, o) => Pa(e, n, o, { callee: e.parseAsync }), e.safeParseAsync = async (n, o) => ja(e, n, o), e.spa = e.safeParseAsync, e.encode = (n, o) => Da(e, n, o), e.decode = (n, o) => Fa(e, n, o), e.encodeAsync = async (n, o) => Ba(e, n, o), e.decodeAsync = async (n, o) => Ua(e, n, o), e.safeEncode = (n, o) => Ha(e, n, o), e.safeDecode = (n, o) => Va(e, n, o), e.safeEncodeAsync = async (n, o) => qa(e, n, o), e.safeDecodeAsync = async (n, o) => Ja(e, n, o), e.refine = (n, o) => e.check(jc(n, o)), e.superRefine = (n) => e.check(Dc(n)), e.overwrite = (n) => e.check(/* @__PURE__ */ ze(n)), e.optional = () => cn(e), e.exactOptional = () => Nc(e), e.nullable = () => un(e), e.nullish = () => cn(un(e)), e.nonoptional = (n) => Rc(e, n), e.array = () => Ze(e), e.or = (n) => yc([e, n]), e.and = (n) => wc(e, n), e.transform = (n) => ln(e, Sc(n)), e.default = (n) => xc(e, n), e.prefault = (n) => Ac(e, n), e.catch = (n) => Zc(e, n), e.pipe = (n) => ln(e, n), e.readonly = () => Pc(e), e.describe = (n) => {
  const o = e.clone();
  return Te.add(o, { description: n }), o;
}, Object.defineProperty(e, "description", {
  get() {
    var n;
    return (n = Te.get(e)) == null ? void 0 : n.description;
  },
  configurable: !0
}), e.meta = (...n) => {
  if (n.length === 0)
    return Te.get(e);
  const o = e.clone();
  return Te.add(o, n[0]), o;
}, e.isOptional = () => e.safeParse(void 0).success, e.isNullable = () => e.safeParse(null).success, e.apply = (n) => n(e), e)), Wn = /* @__PURE__ */ f("_ZodString", (e, t) => {
  xt.init(e, t), j.init(e, t), e._zod.processJSONSchema = (o, r, i) => aa(e, o, r);
  const n = e._zod.bag;
  e.format = n.format ?? null, e.minLength = n.minimum ?? null, e.maxLength = n.maximum ?? null, e.regex = (...o) => e.check(/* @__PURE__ */ Hs(...o)), e.includes = (...o) => e.check(/* @__PURE__ */ Js(...o)), e.startsWith = (...o) => e.check(/* @__PURE__ */ Ws(...o)), e.endsWith = (...o) => e.check(/* @__PURE__ */ Xs(...o)), e.min = (...o) => e.check(/* @__PURE__ */ Je(...o)), e.max = (...o) => e.check(/* @__PURE__ */ Bn(...o)), e.length = (...o) => e.check(/* @__PURE__ */ Un(...o)), e.nonempty = (...o) => e.check(/* @__PURE__ */ Je(1, ...o)), e.lowercase = (o) => e.check(/* @__PURE__ */ Vs(o)), e.uppercase = (o) => e.check(/* @__PURE__ */ qs(o)), e.trim = () => e.check(/* @__PURE__ */ Gs()), e.normalize = (...o) => e.check(/* @__PURE__ */ Ys(...o)), e.toLowerCase = () => e.check(/* @__PURE__ */ Ks()), e.toUpperCase = () => e.check(/* @__PURE__ */ Qs()), e.slugify = () => e.check(/* @__PURE__ */ ea());
}), Xn = /* @__PURE__ */ f("ZodString", (e, t) => {
  xt.init(e, t), Wn.init(e, t), e.email = (n) => e.check(/* @__PURE__ */ ps(Wa, n)), e.url = (n) => e.check(/* @__PURE__ */ ys(Xa, n)), e.jwt = (n) => e.check(/* @__PURE__ */ Zs(lc, n)), e.emoji = (n) => e.check(/* @__PURE__ */ vs(Ya, n)), e.guid = (n) => e.check(/* @__PURE__ */ tn(sn, n)), e.uuid = (n) => e.check(/* @__PURE__ */ ms(Me, n)), e.uuidv4 = (n) => e.check(/* @__PURE__ */ bs(Me, n)), e.uuidv6 = (n) => e.check(/* @__PURE__ */ gs(Me, n)), e.uuidv7 = (n) => e.check(/* @__PURE__ */ _s(Me, n)), e.nanoid = (n) => e.check(/* @__PURE__ */ ws(Ga, n)), e.guid = (n) => e.check(/* @__PURE__ */ tn(sn, n)), e.cuid = (n) => e.check(/* @__PURE__ */ ks(Ka, n)), e.cuid2 = (n) => e.check(/* @__PURE__ */ Es(Qa, n)), e.ulid = (n) => e.check(/* @__PURE__ */ zs(ec, n)), e.base64 = (n) => e.check(/* @__PURE__ */ As(ac, n)), e.base64url = (n) => e.check(/* @__PURE__ */ Rs(cc, n)), e.xid = (n) => e.check(/* @__PURE__ */ Ss(tc, n)), e.ksuid = (n) => e.check(/* @__PURE__ */ $s(nc, n)), e.ipv4 = (n) => e.check(/* @__PURE__ */ Ns(oc, n)), e.ipv6 = (n) => e.check(/* @__PURE__ */ Cs(rc, n)), e.cidrv4 = (n) => e.check(/* @__PURE__ */ xs(ic, n)), e.cidrv6 = (n) => e.check(/* @__PURE__ */ Ts(sc, n)), e.e164 = (n) => e.check(/* @__PURE__ */ Ls(uc, n)), e.datetime = (n) => e.check(Ca(n)), e.date = (n) => e.check(Ta(n)), e.time = (n) => e.check(Ra(n)), e.duration = (n) => e.check(Za(n));
});
function J(e) {
  return /* @__PURE__ */ hs(Xn, e);
}
const P = /* @__PURE__ */ f("ZodStringFormat", (e, t) => {
  O.init(e, t), Wn.init(e, t);
}), Wa = /* @__PURE__ */ f("ZodEmail", (e, t) => {
  wi.init(e, t), P.init(e, t);
}), sn = /* @__PURE__ */ f("ZodGUID", (e, t) => {
  yi.init(e, t), P.init(e, t);
}), Me = /* @__PURE__ */ f("ZodUUID", (e, t) => {
  vi.init(e, t), P.init(e, t);
}), Xa = /* @__PURE__ */ f("ZodURL", (e, t) => {
  ki.init(e, t), P.init(e, t);
}), Ya = /* @__PURE__ */ f("ZodEmoji", (e, t) => {
  Ei.init(e, t), P.init(e, t);
}), Ga = /* @__PURE__ */ f("ZodNanoID", (e, t) => {
  zi.init(e, t), P.init(e, t);
}), Ka = /* @__PURE__ */ f("ZodCUID", (e, t) => {
  Si.init(e, t), P.init(e, t);
}), Qa = /* @__PURE__ */ f("ZodCUID2", (e, t) => {
  $i.init(e, t), P.init(e, t);
}), ec = /* @__PURE__ */ f("ZodULID", (e, t) => {
  Ni.init(e, t), P.init(e, t);
}), tc = /* @__PURE__ */ f("ZodXID", (e, t) => {
  Ci.init(e, t), P.init(e, t);
}), nc = /* @__PURE__ */ f("ZodKSUID", (e, t) => {
  xi.init(e, t), P.init(e, t);
}), oc = /* @__PURE__ */ f("ZodIPv4", (e, t) => {
  Zi.init(e, t), P.init(e, t);
}), rc = /* @__PURE__ */ f("ZodIPv6", (e, t) => {
  Ii.init(e, t), P.init(e, t);
}), ic = /* @__PURE__ */ f("ZodCIDRv4", (e, t) => {
  Oi.init(e, t), P.init(e, t);
}), sc = /* @__PURE__ */ f("ZodCIDRv6", (e, t) => {
  Pi.init(e, t), P.init(e, t);
}), ac = /* @__PURE__ */ f("ZodBase64", (e, t) => {
  Mi.init(e, t), P.init(e, t);
}), cc = /* @__PURE__ */ f("ZodBase64URL", (e, t) => {
  Di.init(e, t), P.init(e, t);
}), uc = /* @__PURE__ */ f("ZodE164", (e, t) => {
  Fi.init(e, t), P.init(e, t);
}), lc = /* @__PURE__ */ f("ZodJWT", (e, t) => {
  Ui.init(e, t), P.init(e, t);
}), Tt = /* @__PURE__ */ f("ZodNumber", (e, t) => {
  Mn.init(e, t), j.init(e, t), e._zod.processJSONSchema = (o, r, i) => ca(e, o, r), e.gt = (o, r) => e.check(/* @__PURE__ */ on(o, r)), e.gte = (o, r) => e.check(/* @__PURE__ */ pt(o, r)), e.min = (o, r) => e.check(/* @__PURE__ */ pt(o, r)), e.lt = (o, r) => e.check(/* @__PURE__ */ nn(o, r)), e.lte = (o, r) => e.check(/* @__PURE__ */ ht(o, r)), e.max = (o, r) => e.check(/* @__PURE__ */ ht(o, r)), e.int = (o) => e.check(an(o)), e.safe = (o) => e.check(an(o)), e.positive = (o) => e.check(/* @__PURE__ */ on(0, o)), e.nonnegative = (o) => e.check(/* @__PURE__ */ pt(0, o)), e.negative = (o) => e.check(/* @__PURE__ */ nn(0, o)), e.nonpositive = (o) => e.check(/* @__PURE__ */ ht(0, o)), e.multipleOf = (o, r) => e.check(/* @__PURE__ */ rn(o, r)), e.step = (o, r) => e.check(/* @__PURE__ */ rn(o, r)), e.finite = () => e;
  const n = e._zod.bag;
  e.minValue = Math.max(n.minimum ?? Number.NEGATIVE_INFINITY, n.exclusiveMinimum ?? Number.NEGATIVE_INFINITY) ?? null, e.maxValue = Math.min(n.maximum ?? Number.POSITIVE_INFINITY, n.exclusiveMaximum ?? Number.POSITIVE_INFINITY) ?? null, e.isInt = (n.format ?? "").includes("int") || Number.isSafeInteger(n.multipleOf ?? 0.5), e.isFinite = !0, e.format = n.format ?? null;
});
function fe(e) {
  return /* @__PURE__ */ js(Tt, e);
}
const dc = /* @__PURE__ */ f("ZodNumberFormat", (e, t) => {
  Hi.init(e, t), Tt.init(e, t);
});
function an(e) {
  return /* @__PURE__ */ Ds(dc, e);
}
const Yn = /* @__PURE__ */ f("ZodBoolean", (e, t) => {
  Vi.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, o, r) => ua(e, n, o);
});
function fc(e) {
  return /* @__PURE__ */ Fs(Yn, e);
}
const hc = /* @__PURE__ */ f("ZodUnknown", (e, t) => {
  qi.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, o, r) => da();
});
function Xe() {
  return /* @__PURE__ */ Bs(hc);
}
const pc = /* @__PURE__ */ f("ZodNever", (e, t) => {
  Ji.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, o, r) => la(e, n, o);
});
function mc(e) {
  return /* @__PURE__ */ Us(pc, e);
}
const bc = /* @__PURE__ */ f("ZodArray", (e, t) => {
  Wi.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, o, r) => ma(e, n, o, r), e.element = t.element, e.min = (n, o) => e.check(/* @__PURE__ */ Je(n, o)), e.nonempty = (n) => e.check(/* @__PURE__ */ Je(1, n)), e.max = (n, o) => e.check(/* @__PURE__ */ Bn(n, o)), e.length = (n, o) => e.check(/* @__PURE__ */ Un(n, o)), e.unwrap = () => e.element;
});
function Ze(e, t) {
  return /* @__PURE__ */ ta(bc, e, t);
}
const gc = /* @__PURE__ */ f("ZodObject", (e, t) => {
  Yi.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, o, r) => ba(e, n, o, r), L(e, "shape", () => t.shape), e.keyof = () => Gn(Object.keys(e._zod.def.shape)), e.catchall = (n) => e.clone({ ...e._zod.def, catchall: n }), e.passthrough = () => e.clone({ ...e._zod.def, catchall: Xe() }), e.loose = () => e.clone({ ...e._zod.def, catchall: Xe() }), e.strict = () => e.clone({ ...e._zod.def, catchall: mc() }), e.strip = () => e.clone({ ...e._zod.def, catchall: void 0 }), e.extend = (n) => gr(e, n), e.safeExtend = (n) => _r(e, n), e.merge = (n) => yr(e, n), e.pick = (n) => mr(e, n), e.omit = (n) => br(e, n), e.partial = (...n) => vr(At, e, n[0]), e.required = (...n) => wr(Qn, e, n[0]);
});
function Ie(e, t) {
  const n = {
    type: "object",
    shape: e ?? {},
    ...S(t)
  };
  return new gc(n);
}
const _c = /* @__PURE__ */ f("ZodUnion", (e, t) => {
  Gi.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, o, r) => ga(e, n, o, r), e.options = t.options;
});
function yc(e, t) {
  return new _c({
    type: "union",
    options: e,
    ...S(t)
  });
}
const vc = /* @__PURE__ */ f("ZodIntersection", (e, t) => {
  Ki.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, o, r) => _a(e, n, o, r);
});
function wc(e, t) {
  return new vc({
    type: "intersection",
    left: e,
    right: t
  });
}
const kc = /* @__PURE__ */ f("ZodRecord", (e, t) => {
  Qi.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, o, r) => ya(e, n, o, r), e.keyType = t.keyType, e.valueType = t.valueType;
});
function Ec(e, t, n) {
  return new kc({
    type: "record",
    keyType: e,
    valueType: t,
    ...S(n)
  });
}
const Ye = /* @__PURE__ */ f("ZodEnum", (e, t) => {
  es.init(e, t), j.init(e, t), e._zod.processJSONSchema = (o, r, i) => fa(e, o, r), e.enum = t.entries, e.options = Object.values(t.entries);
  const n = new Set(Object.keys(t.entries));
  e.extract = (o, r) => {
    const i = {};
    for (const s of o)
      if (n.has(s))
        i[s] = t.entries[s];
      else
        throw new Error(`Key ${s} not found in enum`);
    return new Ye({
      ...t,
      checks: [],
      ...S(r),
      entries: i
    });
  }, e.exclude = (o, r) => {
    const i = { ...t.entries };
    for (const s of o)
      if (n.has(s))
        delete i[s];
      else
        throw new Error(`Key ${s} not found in enum`);
    return new Ye({
      ...t,
      checks: [],
      ...S(r),
      entries: i
    });
  };
});
function Gn(e, t) {
  const n = Array.isArray(e) ? Object.fromEntries(e.map((o) => [o, o])) : e;
  return new Ye({
    type: "enum",
    entries: n,
    ...S(t)
  });
}
const zc = /* @__PURE__ */ f("ZodTransform", (e, t) => {
  ts.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, o, r) => pa(e, n), e._zod.parse = (n, o) => {
    if (o.direction === "backward")
      throw new kn(e.constructor.name);
    n.addIssue = (i) => {
      if (typeof i == "string")
        n.issues.push(Le(i, n.value, t));
      else {
        const s = i;
        s.fatal && (s.continue = !1), s.code ?? (s.code = "custom"), s.input ?? (s.input = n.value), s.inst ?? (s.inst = e), n.issues.push(Le(s));
      }
    };
    const r = t.transform(n.value, n);
    return r instanceof Promise ? r.then((i) => (n.value = i, n)) : (n.value = r, n);
  };
});
function Sc(e) {
  return new zc({
    type: "transform",
    transform: e
  });
}
const At = /* @__PURE__ */ f("ZodOptional", (e, t) => {
  Fn.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, o, r) => Jn(e, n, o, r), e.unwrap = () => e._zod.def.innerType;
});
function cn(e) {
  return new At({
    type: "optional",
    innerType: e
  });
}
const $c = /* @__PURE__ */ f("ZodExactOptional", (e, t) => {
  ns.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, o, r) => Jn(e, n, o, r), e.unwrap = () => e._zod.def.innerType;
});
function Nc(e) {
  return new $c({
    type: "optional",
    innerType: e
  });
}
const Cc = /* @__PURE__ */ f("ZodNullable", (e, t) => {
  os.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, o, r) => va(e, n, o, r), e.unwrap = () => e._zod.def.innerType;
});
function un(e) {
  return new Cc({
    type: "nullable",
    innerType: e
  });
}
const Kn = /* @__PURE__ */ f("ZodDefault", (e, t) => {
  rs.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, o, r) => ka(e, n, o, r), e.unwrap = () => e._zod.def.innerType, e.removeDefault = e.unwrap;
});
function xc(e, t) {
  return new Kn({
    type: "default",
    innerType: e,
    get defaultValue() {
      return typeof t == "function" ? t() : $n(t);
    }
  });
}
const Tc = /* @__PURE__ */ f("ZodPrefault", (e, t) => {
  is.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, o, r) => Ea(e, n, o, r), e.unwrap = () => e._zod.def.innerType;
});
function Ac(e, t) {
  return new Tc({
    type: "prefault",
    innerType: e,
    get defaultValue() {
      return typeof t == "function" ? t() : $n(t);
    }
  });
}
const Qn = /* @__PURE__ */ f("ZodNonOptional", (e, t) => {
  ss.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, o, r) => wa(e, n, o, r), e.unwrap = () => e._zod.def.innerType;
});
function Rc(e, t) {
  return new Qn({
    type: "nonoptional",
    innerType: e,
    ...S(t)
  });
}
const Lc = /* @__PURE__ */ f("ZodCatch", (e, t) => {
  as.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, o, r) => za(e, n, o, r), e.unwrap = () => e._zod.def.innerType, e.removeCatch = e.unwrap;
});
function Zc(e, t) {
  return new Lc({
    type: "catch",
    innerType: e,
    catchValue: typeof t == "function" ? t : () => t
  });
}
const Ic = /* @__PURE__ */ f("ZodPipe", (e, t) => {
  cs.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, o, r) => Sa(e, n, o, r), e.in = t.in, e.out = t.out;
});
function ln(e, t) {
  return new Ic({
    type: "pipe",
    in: e,
    out: t
    // ...util.normalizeParams(params),
  });
}
const Oc = /* @__PURE__ */ f("ZodReadonly", (e, t) => {
  us.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, o, r) => $a(e, n, o, r), e.unwrap = () => e._zod.def.innerType;
});
function Pc(e) {
  return new Oc({
    type: "readonly",
    innerType: e
  });
}
const Mc = /* @__PURE__ */ f("ZodCustom", (e, t) => {
  ls.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, o, r) => ha(e, n);
});
function jc(e, t = {}) {
  return /* @__PURE__ */ na(Mc, e, t);
}
function Dc(e) {
  return /* @__PURE__ */ oa(e);
}
const Fc = /* @__PURE__ */ new Set(["id", "image"]);
function wt(e) {
  return e instanceof At ? wt(e.unwrap()) : e instanceof Kn ? wt(e._def.innerType) : e;
}
function Bc(e) {
  const t = [];
  for (const [n, o] of Object.entries(e.shape)) {
    if (Fc.has(n)) continue;
    const r = o, i = wt(r), s = r.description ?? n;
    if (i instanceof Yn) {
      t.push({ key: n, label: s, type: "boolean" });
      continue;
    }
    if (i instanceof Ye) {
      t.push({ key: n, label: s, type: "select", options: i.options });
      continue;
    }
    if (i instanceof Tt) {
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
    if (i instanceof Xn) {
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
const Uc = Ie({
  x: fe().min(0).max(100),
  y: fe().min(0).max(100)
}), Hc = Ie({
  id: J(),
  shape: Gn(["rect", "polygon"]).default("rect"),
  x: fe().min(0).max(100),
  y: fe().min(0).max(100),
  width: fe().min(0).max(100),
  height: fe().min(0).max(100),
  points: Ze(Uc).optional(),
  correct: fc().default(!1),
  label: J().optional()
}), Rt = Ie({
  id: J(),
  image: J().optional(),
  zones: Ze(Hc).optional()
}).passthrough(), Vc = Rt.extend({
  target: J().max(2).describe("אות יעד"),
  correct: J().describe("תשובה נכונה"),
  correctEmoji: J().describe("אמוג'י")
}), qc = Rt.extend({
  target: J().max(2).describe("אות יעד"),
  correct: J().describe("תשובה נכונה"),
  correctEmoji: J().describe("אמוג'י")
}), Jc = Ie({
  title: J().default(""),
  type: J().default("multiple-choice")
}).passthrough(), Fu = Ie({
  id: J(),
  version: fe().default(1),
  meta: Jc.default({ title: "", type: "multiple-choice" }),
  rounds: Ze(Ec(J(), Xe())).default([]),
  distractors: Ze(Xe()).default([])
}), Wc = Rt.extend({
  instruction: J().optional().describe("הוראה")
}), dn = {
  "multiple-choice": Vc,
  "drag-match": qc,
  "zone-tap": Wc
};
function Xc(e, { onFieldChange: t, onDeleteRound: n, roundSchema: o }) {
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
  function l(b, E = "multiple-choice") {
    c = b.id, s.innerHTML = "", a.hidden = !1;
    const y = o ?? dn[E] ?? dn["multiple-choice"];
    Bc(y).forEach((z) => s.appendChild(d(z, b))), s.appendChild(k(b)), a.onclick = () => {
      confirm("למחוק את הסיבוב הזה?") && (n(c), u());
    };
  }
  function d(b, E) {
    const y = document.createElement("div");
    y.className = "ab-editor-field";
    const x = document.createElement("label");
    switch (x.className = "ab-editor-field__label", x.textContent = b.label, y.appendChild(x), b.type) {
      case "emoji":
        y.appendChild(p(b, E));
        break;
      case "boolean":
        y.appendChild(g(b, E));
        break;
      case "select":
        y.appendChild(_(b, E));
        break;
      case "number":
        y.appendChild(C(b, E));
        break;
      default:
        y.appendChild(m(b, E));
        break;
    }
    return y;
  }
  function m(b, E) {
    const y = document.createElement("input");
    return y.className = "ab-editor-field__input", y.type = "text", y.value = String(E[b.key] ?? ""), y.dir = "rtl", b.maxLength && (y.maxLength = b.maxLength), y.addEventListener("input", () => t(c, b.key, y.value)), y;
  }
  function p(b, E) {
    const y = document.createElement("div");
    y.className = "ab-editor-field__emoji-row";
    const x = document.createElement("div");
    x.className = "ab-editor-field__emoji-preview", x.textContent = String(E[b.key] ?? "❓"), y.appendChild(x);
    const z = document.createElement("input");
    return z.className = "ab-editor-field__input", z.type = "text", z.value = String(E[b.key] ?? ""), z.maxLength = 8, z.placeholder = "🐱", z.style.fontSize = "20px", z.addEventListener("input", () => {
      x.textContent = z.value || "❓", t(c, b.key, z.value);
    }), y.appendChild(z), y;
  }
  function g(b, E) {
    const y = document.createElement("input");
    return y.type = "checkbox", y.checked = !!E[b.key], y.addEventListener("change", () => t(c, b.key, y.checked)), y;
  }
  function _(b, E) {
    const y = document.createElement("select");
    return y.className = "ab-editor-field__input", (b.options ?? []).forEach((x) => {
      const z = document.createElement("option");
      z.value = x, z.textContent = x, E[b.key] === x && (z.selected = !0), y.appendChild(z);
    }), y.addEventListener("change", () => t(c, b.key, y.value)), y;
  }
  function C(b, E) {
    const y = document.createElement("input");
    return y.className = "ab-editor-field__input", y.type = "number", y.value = String(E[b.key] ?? ""), b.min !== void 0 && (y.min = String(b.min)), b.max !== void 0 && (y.max = String(b.max)), y.addEventListener("input", () => t(c, b.key, Number(y.value))), y;
  }
  function k(b) {
    const E = document.createElement("div");
    E.className = "ab-editor-field ab-editor-field--image";
    const y = document.createElement("label");
    y.className = "ab-editor-field__label", y.textContent = "🖼 תמונה", E.appendChild(y);
    const x = document.createElement("div");
    x.className = "ab-editor-field__img-row";
    const z = document.createElement("div");
    z.className = "ab-editor-field__img-preview", b.image && (z.style.backgroundImage = `url(${b.image})`), x.appendChild(z);
    const $ = document.createElement("div");
    $.className = "ab-editor-field__img-btns";
    const w = document.createElement("input");
    w.type = "file", w.accept = "image/*", w.style.display = "none", w.addEventListener("change", () => {
      var h;
      const H = (h = w.files) == null ? void 0 : h[0];
      if (!H) return;
      const V = new FileReader();
      V.onload = (v) => {
        const T = v.target.result;
        z.style.backgroundImage = `url(${T})`, A.textContent = "🔄 החלף", t(c, "image", T), Z.isConnected || $.appendChild(Z);
      }, V.readAsDataURL(H);
    }), $.appendChild(w);
    const A = document.createElement("button");
    A.className = "ab-editor-btn ab-editor-btn--img-upload", A.textContent = b.image ? "🔄 החלף" : "📤 העלה", A.addEventListener("click", () => w.click()), $.appendChild(A);
    const Z = document.createElement("button");
    return Z.className = "ab-editor-btn ab-editor-btn--img-clear", Z.textContent = "✕ הסר", Z.addEventListener("click", () => {
      z.style.backgroundImage = "", A.textContent = "📤 העלה", t(c, "image", null), Z.remove();
    }), b.image && $.appendChild(Z), x.appendChild($), E.appendChild(x), E;
  }
  function N() {
    r.remove();
  }
  return u(), { loadRound: l, clear: u, destroy: N };
}
function Yc() {
  return ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/ogg"].find((t) => MediaRecorder.isTypeSupported(t)) || "";
}
function Gc() {
  var e;
  return typeof navigator < "u" && typeof ((e = navigator.mediaDevices) == null ? void 0 : e.getUserMedia) == "function" && typeof MediaRecorder < "u";
}
function Kc() {
  let e = null, t = null, n = [];
  async function o() {
    if (e && e.state === "recording") return;
    t = await navigator.mediaDevices.getUserMedia({ audio: !0, video: !1 }), n = [];
    const c = {}, u = Yc();
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
const Qc = "alefbet-voices", re = "recordings", eu = 1;
let Ne = null;
function rt() {
  return Ne || (Ne = new Promise((e, t) => {
    const n = indexedDB.open(Qc, eu);
    n.onupgradeneeded = () => {
      n.result.createObjectStore(re);
    }, n.onsuccess = () => e(n.result), n.onerror = () => {
      Ne = null, t(n.error);
    };
  }), Ne);
}
function Lt(e, t) {
  return `${e}/${t}`;
}
async function eo(e, t, n) {
  const o = await rt();
  return new Promise((r, i) => {
    const s = o.transaction(re, "readwrite");
    s.objectStore(re).put(n, Lt(e, t)), s.oncomplete = r, s.onerror = (a) => i(a.target.error);
  });
}
async function Zt(e, t) {
  const n = await rt();
  return new Promise((o, r) => {
    const s = n.transaction(re, "readonly").objectStore(re).get(Lt(e, t));
    s.onsuccess = () => o(s.result ?? null), s.onerror = (a) => r(a.target.error);
  });
}
async function tu(e, t) {
  const n = await rt();
  return new Promise((o, r) => {
    const i = n.transaction(re, "readwrite");
    i.objectStore(re).delete(Lt(e, t)), i.oncomplete = o, i.onerror = (s) => r(s.target.error);
  });
}
async function to(e) {
  const t = await rt();
  return new Promise((n, o) => {
    const i = t.transaction(re, "readonly").objectStore(re).getAllKeys();
    i.onsuccess = () => {
      const s = `${e}/`;
      n(
        (i.result || []).filter((a) => a.startsWith(s)).map((a) => a.slice(s.length))
      );
    }, i.onerror = (s) => o(s.target.error);
  });
}
async function ve(e, t) {
  let n;
  try {
    n = await Zt(e, t);
  } catch {
    return !1;
  }
  return n ? await zo(n) ? !0 : new Promise((o) => {
    const r = URL.createObjectURL(n), i = new Audio(r), s = (a) => {
      URL.revokeObjectURL(r), o(a);
    };
    i.onended = () => s(!0), i.onerror = () => s(!1), i.play().catch(() => s(!1));
  }) : !1;
}
async function Bu(e, t) {
  return await Zt(e, t).catch(() => null) !== null;
}
function no(e, {
  gameId: t,
  voiceKey: n,
  label: o = "הקלטת קול",
  onSaved: r,
  onDeleted: i
}) {
  if (!Gc()) {
    const w = document.createElement("span");
    return w.className = "ab-voice-unsupported", w.textContent = "🎤 הקלטה לא נתמכת בדפדפן זה", e.appendChild(w), { refresh: async () => {
    }, destroy: () => w.remove() };
  }
  const s = Kc(), a = document.createElement("div");
  a.className = "ab-voice-btn-wrap", a.setAttribute("aria-label", o), e.appendChild(a);
  let c = "idle", u = null, l = null, d = null, m = null, p = null, g = null, _ = 0;
  function C() {
    if (a.innerHTML = "", c === "idle")
      u = k("🎤", "ab-voice-btn ab-voice-btn--record", "התחל הקלטה", N), a.appendChild(u);
    else if (c === "recording") {
      p = document.createElement("span"), p.className = "ab-voice-indicator", a.appendChild(p);
      const w = document.createElement("span");
      w.className = "ab-voice-timer", w.textContent = "0:00", a.appendChild(w), _ = 0, g = setInterval(() => {
        _++;
        const A = Math.floor(_ / 60), Z = String(_ % 60).padStart(2, "0");
        w.textContent = `${A}:${Z}`, _ >= 120 && b();
      }, 1e3), l = k("⏹", "ab-voice-btn ab-voice-btn--stop", "עצור הקלטה", b), a.appendChild(l);
    } else c === "has-voice" && (d = k("▶", "ab-voice-btn ab-voice-btn--play", "נגן הקלטה", E), a.appendChild(d), u = k("🎤", "ab-voice-btn ab-voice-btn--re-record", "הקלט מחדש", N), a.appendChild(u), m = k("🗑", "ab-voice-btn ab-voice-btn--delete", "מחק הקלטה", y), a.appendChild(m));
  }
  function k(w, A, Z, H) {
    const V = document.createElement("button");
    return V.className = A, V.type = "button", V.title = Z, V.setAttribute("aria-label", Z), V.textContent = w, V.addEventListener("click", H), V;
  }
  async function N() {
    try {
      await s.start(), c = "recording", C();
    } catch (w) {
      console.warn("[voice-record-button] microphone access denied:", w), x("לא ניתן לגשת למיקרופון");
    }
  }
  async function b() {
    clearInterval(g);
    try {
      const w = await s.stop();
      await eo(t, n, w), c = "has-voice", C(), r == null || r(w);
    } catch (w) {
      console.warn("[voice-record-button] stop error:", w), c = "idle", C();
    }
  }
  async function E() {
    d == null || d.setAttribute("disabled", "true"), await ve(t, n), d == null || d.removeAttribute("disabled");
  }
  async function y() {
    confirm("למחוק את ההקלטה?") && (await tu(t, n), c = "idle", C(), i == null || i());
  }
  function x(w) {
    const A = document.createElement("span");
    A.className = "ab-voice-error", A.textContent = w, a.appendChild(A), setTimeout(() => A.remove(), 3e3);
  }
  async function z() {
    if (s.isActive()) return;
    c = await Zt(t, n).catch(() => null) ? "has-voice" : "idle", C();
  }
  function $() {
    clearInterval(g), s.isActive() && s.cancel(), a.remove();
  }
  return z(), { refresh: z, destroy: $ };
}
const nu = [
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
function ou(e) {
  return e.trim().replace(/\s+/g, "-").replace(/[^a-z0-9\u05D0-\u05EA_-]/gi, "").toLowerCase() || `custom-${Date.now()}`;
}
function ru(e) {
  return yn(`alefbet.audio-manager.${e}.custom`, []);
}
function iu(e, t = null) {
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
  const o = n.querySelector("#ab-am-body"), r = n.querySelector(".ab-am-close"), i = n.querySelector(".ab-am-backdrop"), s = [], a = [...nu];
  t && t.rounds.length > 0 && a.splice(1, 0, {
    // insert after Instructions
    id: "rounds",
    label: "🔤 שאלות / סיבובים",
    slots: t.rounds.map((l, d) => ({
      key: l.id,
      label: `סיבוב ${d + 1}${l.target ? " — " + l.target : ""}${l.correct ? " (" + l.correct + ")" : ""}`
    }))
  }), a.forEach((l) => {
    o.appendChild(su(l, e, s));
  }), o.appendChild(au(e, s));
  function c() {
    s.forEach((l) => l.destroy()), n.remove();
  }
  r.addEventListener("click", c), i.addEventListener("click", c), document.addEventListener("keydown", function l(d) {
    d.key === "Escape" && (c(), document.removeEventListener("keydown", l));
  });
}
function su(e, t, n) {
  const o = document.createElement("section");
  o.className = "ab-am-section";
  const r = document.createElement("button");
  r.className = "ab-am-section__heading", r.setAttribute("aria-expanded", "true"), r.innerHTML = `<span>${e.label}</span><span class="ab-am-chevron">▾</span>`, o.appendChild(r);
  const i = document.createElement("div");
  return i.className = "ab-am-grid", o.appendChild(i), e.slots.forEach((s) => {
    i.appendChild(oo(t, s.key, s.label, n));
  }), r.addEventListener("click", () => {
    const s = r.getAttribute("aria-expanded") === "true";
    r.setAttribute("aria-expanded", String(!s)), i.hidden = s, r.querySelector(".ab-am-chevron").textContent = s ? "▸" : "▾";
  }), o;
}
function au(e, t) {
  const n = ru(e), o = document.createElement("section");
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
      const m = oo(e, d.key, d.label, t, () => {
        n.update((p) => p.filter((g) => g.key !== d.key)), s();
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
    const m = ou(d);
    if (n.get().some((p) => p.key === m)) {
      c.select();
      return;
    }
    n.update((p) => [...p, { key: m, label: d }]), c.value = "", s();
  }
  return u.addEventListener("click", l), c.addEventListener("keydown", (d) => {
    d.key === "Enter" && l();
  }), r.addEventListener("click", () => {
    const d = r.getAttribute("aria-expanded") === "true";
    r.setAttribute("aria-expanded", String(!d)), i.hidden = d, a.hidden = d, r.querySelector(".ab-am-chevron").textContent = d ? "▸" : "▾";
  }), o;
}
function oo(e, t, n, o, r = null) {
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
  const l = no(u, { gameId: e, voiceKey: t, label: n });
  return o.push(l), i._voiceBtn = l, i.appendChild(c), i.appendChild(u), i;
}
let cu = 0;
function fn() {
  return `zone-${Date.now()}-${cu++}`;
}
function uu(e) {
  const t = e.map((i) => i.x), n = e.map((i) => i.y), o = Math.min(...t), r = Math.min(...n);
  return { x: o, y: r, width: Math.max(...t) - o, height: Math.max(...n) - r };
}
function lu(e, t, n, o, r) {
  return e.map((i) => {
    const s = o > 0 ? (i.x - t) / o * 100 : 0, a = r > 0 ? (i.y - n) / r * 100 : 0;
    return `${s},${a}`;
  }).join(" ");
}
function du(e, t, { onChange: n, gameId: o }) {
  let r = structuredClone(t), i = null, s = "rect", a = [], c = null, u = [], l = null, d = null, m = null;
  const p = document.createElement("div");
  p.className = "ab-ze-overlay";
  const g = document.createElement("div");
  g.className = "ab-ze-draw-rect", g.hidden = !0, p.appendChild(g);
  const _ = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  _.classList.add("ab-ze-poly-svg"), _.setAttribute("viewBox", "0 0 100 100"), _.setAttribute("preserveAspectRatio", "none"), _.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:12;", p.appendChild(_);
  const C = document.createElement("div");
  C.className = "ab-ze-toolbar", p.appendChild(C);
  function k() {
    C.innerHTML = "";
    const h = document.createElement("button");
    h.className = `ab-ze-tool-btn${s === "rect" ? " ab-ze-tool-btn--active" : ""}`, h.textContent = "▭ מלבן", h.addEventListener("click", () => {
      y("rect");
    }), C.appendChild(h);
    const v = document.createElement("button");
    v.className = `ab-ze-tool-btn${s === "polygon" ? " ab-ze-tool-btn--active" : ""}`, v.textContent = "✎ חופשי", v.addEventListener("click", () => {
      y("polygon");
    }), C.appendChild(v);
    const T = document.createElement("span");
    T.className = "ab-ze-toolbar__hint", T.textContent = s === "rect" ? "גררו לציור מלבן" : "לחצו נקודות, לחצו פעמיים לסגירה", C.appendChild(T);
  }
  e.style.position = "relative", e.appendChild(p), k();
  function N(h, v) {
    const T = p.getBoundingClientRect();
    return {
      px: Math.max(0, Math.min(100, (h - T.left) / T.width * 100)),
      py: Math.max(0, Math.min(100, (v - T.top) / T.height * 100))
    };
  }
  function b() {
    a.forEach((h) => h.destroy()), a = [], p.querySelectorAll(".ab-ze-zone").forEach((h) => h.remove()), p.querySelectorAll(".ab-ze-panel").forEach((h) => h.remove()), r.forEach((h) => {
      const v = document.createElement("div");
      if (v.className = "ab-ze-zone", h.correct && v.classList.add("ab-ze-zone--correct"), h.id === i && v.classList.add("ab-ze-zone--selected"), v.dataset.zoneId = h.id, v.style.left = `${h.x}%`, v.style.top = `${h.y}%`, v.style.width = `${h.width}%`, v.style.height = `${h.height}%`, h.shape === "polygon" && h.points && h.points.length >= 3) {
        const R = `clip-${h.id}`;
        v.innerHTML = `<svg class="ab-ze-zone__poly-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs><clipPath id="${R}"><polygon points="${lu(h.points, h.x, h.y, h.width, h.height)}"/></clipPath></defs>
          <rect x="0" y="0" width="100" height="100" clip-path="url(#${R})" fill="currentColor"/>
        </svg>`, v.classList.add("ab-ze-zone--poly");
      }
      const T = document.createElement("div");
      T.className = "ab-ze-zone__badge", T.textContent = h.correct ? "✓" : "", h.label && (T.textContent = h.label), v.appendChild(T);
      const D = document.createElement("button");
      D.className = "ab-ze-zone__toggle", D.textContent = h.correct ? "✓ נכון" : "✗ לא נכון", D.title = "סמן כתשובה נכונה / לא נכונה", D.addEventListener("pointerdown", (R) => R.stopPropagation()), D.addEventListener("click", (R) => {
        R.stopPropagation(), h.correct = !h.correct, H(), b();
      }), v.appendChild(D);
      const I = document.createElement("button");
      if (I.className = "ab-ze-zone__delete", I.textContent = "✕", I.title = "מחק אזור", I.addEventListener("pointerdown", (R) => R.stopPropagation()), I.addEventListener("click", (R) => {
        R.stopPropagation(), r = r.filter((F) => F.id !== h.id), i === h.id && (i = null), H(), b();
      }), v.appendChild(I), h.shape !== "polygon" && h.id === i)
        for (const R of ["nw", "ne", "sw", "se"]) {
          const F = document.createElement("div");
          F.className = `ab-ze-zone__handle ab-ze-zone__handle--${R}`, F.dataset.handle = R, F.addEventListener("pointerdown", (B) => {
            B.stopPropagation(), B.preventDefault(), m = {
              zoneId: h.id,
              handle: R,
              origZone: { ...h },
              startX: B.clientX,
              startY: B.clientY
            };
          }), v.appendChild(F);
        }
      if (v.addEventListener("pointerdown", (R) => {
        if (R.stopPropagation(), m) return;
        i = h.id, b();
        const { px: F, py: B } = N(R.clientX, R.clientY);
        d = { zoneId: h.id, offsetX: F - h.x, offsetY: B - h.y };
      }), p.appendChild(v), h.id === i) {
        const R = document.createElement("div");
        R.className = "ab-ze-panel", R.style.left = `${h.x}%`, R.style.top = `${h.y + h.height + 1}%`;
        const F = document.createElement("div");
        F.className = "ab-ze-panel__row";
        const B = document.createElement("input");
        if (B.className = "ab-ze-panel__input", B.type = "text", B.dir = "rtl", B.placeholder = "תווית (למשל: חתול)", B.value = h.label || "", B.addEventListener("pointerdown", (Y) => Y.stopPropagation()), B.addEventListener("input", () => {
          h.label = B.value || void 0, H();
        }), F.appendChild(B), R.appendChild(F), o) {
          const Y = document.createElement("div");
          Y.className = "ab-ze-panel__row";
          const at = document.createElement("span");
          at.className = "ab-ze-panel__audio-label", at.textContent = "🎤", Y.appendChild(at);
          const go = no(Y, {
            gameId: o,
            voiceKey: `zone-${h.id}`,
            label: `הקלטה לאזור ${h.label || h.id}`
          });
          a.push(go), R.appendChild(Y);
        }
        R.addEventListener("pointerdown", (Y) => Y.stopPropagation()), p.appendChild(R);
      }
    });
  }
  function E() {
    if (_.innerHTML = "", u.length === 0) return;
    const h = [...u];
    l && h.push(l);
    const v = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    v.setAttribute("points", h.map((T) => `${T.x},${T.y}`).join(" ")), v.setAttribute("fill", "rgba(251,191,36,0.15)"), v.setAttribute("stroke", "#fbbf24"), v.setAttribute("stroke-width", "0.4"), v.setAttribute("stroke-dasharray", "1,0.5"), _.appendChild(v), u.forEach((T, D) => {
      const I = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      I.setAttribute("cx", String(T.x)), I.setAttribute("cy", String(T.y)), I.setAttribute("r", "0.8"), I.setAttribute("fill", D === 0 ? "#22c55e" : "#fbbf24"), I.setAttribute("stroke", "#fff"), I.setAttribute("stroke-width", "0.3"), _.appendChild(I);
    });
  }
  function y(h) {
    u.length > 0 && (u = [], l = null, E()), s = h, p.classList.toggle("ab-ze-overlay--poly-mode", h === "polygon"), k();
  }
  function x() {
    if (!c) return;
    const h = Math.min(c.startX, c.curX), v = Math.min(c.startY, c.curY), T = Math.abs(c.curX - c.startX), D = Math.abs(c.curY - c.startY);
    g.style.left = `${h}%`, g.style.top = `${v}%`, g.style.width = `${T}%`, g.style.height = `${D}%`;
  }
  function z() {
    if (u.length < 3) {
      u = [], l = null, E();
      return;
    }
    const h = [...u], v = uu(h);
    if (v.width > 1 && v.height > 1) {
      const T = {
        id: fn(),
        shape: "polygon",
        ...v,
        points: h,
        correct: !1
      };
      r.push(T), i = T.id, H();
    }
    u = [], l = null, E(), b();
  }
  function $(h) {
    if (h.button !== 0 || h.target.closest(".ab-ze-zone") || h.target.closest(".ab-ze-toolbar") || h.target.closest(".ab-ze-panel")) return;
    if (i = null, s === "polygon") {
      const { px: D, py: I } = N(h.clientX, h.clientY);
      if (u.length >= 3) {
        const R = u[0];
        if (Math.abs(D - R.x) < 2 && Math.abs(I - R.y) < 2) {
          z();
          return;
        }
      }
      u.push({ x: D, y: I }), E(), b();
      return;
    }
    const { px: v, py: T } = N(h.clientX, h.clientY);
    c = { startX: v, startY: T, curX: v, curY: T }, g.hidden = !1, x(), b();
  }
  function w(h) {
    s === "polygon" && u.length >= 3 && (h.preventDefault(), z());
  }
  function A(h) {
    if (s === "polygon" && u.length > 0) {
      const { px: v, py: T } = N(h.clientX, h.clientY);
      l = { x: v, y: T }, E();
    }
    if (c) {
      const { px: v, py: T } = N(h.clientX, h.clientY);
      c.curX = v, c.curY = T, x();
      return;
    }
    if (m) {
      h.preventDefault();
      const v = r.find((B) => B.id === m.zoneId);
      if (!v) return;
      const T = m.origZone, D = p.getBoundingClientRect(), I = (h.clientX - m.startX) / D.width * 100, R = (h.clientY - m.startY) / D.height * 100, F = m.handle;
      F.includes("e") && (v.width = Math.max(3, T.width + I)), F.includes("w") && (v.x = T.x + I, v.width = Math.max(3, T.width - I)), F.includes("s") && (v.height = Math.max(3, T.height + R)), F.includes("n") && (v.y = T.y + R, v.height = Math.max(3, T.height - R)), b();
      return;
    }
    if (d) {
      h.preventDefault();
      const v = r.find((F) => F.id === d.zoneId);
      if (!v) return;
      const { px: T, py: D } = N(h.clientX, h.clientY), I = Math.max(0, Math.min(100 - v.width, T - d.offsetX)), R = Math.max(0, Math.min(100 - v.height, D - d.offsetY));
      if (v.shape === "polygon" && v.points) {
        const F = I - v.x, B = R - v.y;
        v.points = v.points.map((Y) => ({ x: Y.x + F, y: Y.y + B }));
      }
      v.x = I, v.y = R, b();
    }
  }
  function Z() {
    if (c) {
      const h = Math.min(c.startX, c.curX), v = Math.min(c.startY, c.curY), T = Math.abs(c.curX - c.startX), D = Math.abs(c.curY - c.startY);
      if (T > 3 && D > 3) {
        const I = {
          id: fn(),
          shape: "rect",
          x: h,
          y: v,
          width: T,
          height: D,
          correct: !1
        };
        r.push(I), i = I.id, H();
      }
      c = null, g.hidden = !0, b();
      return;
    }
    if (m) {
      m = null, H();
      return;
    }
    d && (d = null, H());
  }
  function H() {
    n(structuredClone(r));
  }
  function V(h) {
    if (h.key === "Escape" && u.length > 0) {
      u = [], l = null, E();
      return;
    }
    if (h.key === "Enter" && u.length >= 3) {
      z();
      return;
    }
    i && ((h.key === "Delete" || h.key === "Backspace") && (r = r.filter((v) => v.id !== i), i = null, H(), b()), h.key === "Escape" && (i = null, b()));
  }
  return p.addEventListener("pointerdown", $), p.addEventListener("dblclick", w), document.addEventListener("pointermove", A), document.addEventListener("pointerup", Z), document.addEventListener("keydown", V), b(), {
    setZones(h) {
      r = structuredClone(h), i = null, b();
    },
    getZones() {
      return structuredClone(r);
    },
    setTool(h) {
      y(h);
    },
    destroy() {
      p.removeEventListener("pointerdown", $), p.removeEventListener("dblclick", w), document.removeEventListener("pointermove", A), document.removeEventListener("pointerup", Z), document.removeEventListener("keydown", V), a.forEach((h) => h.destroy()), p.remove();
    }
  };
}
let fu = 0;
function hu() {
  return `tpl-zone-${Date.now()}-${fu++}`;
}
const pu = [
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
function mu(e) {
  return e.zones.map((t) => ({ ...t, id: hu() }));
}
function bu(e) {
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
  s.className = "ab-tpl-grid", pu.forEach((u) => {
    const l = document.createElement("button");
    l.className = "ab-tpl-card", l.addEventListener("click", () => {
      e(mu(u)), a();
    });
    const d = document.createElement("div");
    d.className = "ab-tpl-card__preview", u.zones.forEach((g) => {
      const _ = document.createElement("div");
      _.className = "ab-tpl-card__zone", g.correct && _.classList.add("ab-tpl-card__zone--correct"), _.style.left = `${g.x}%`, _.style.top = `${g.y}%`, _.style.width = `${g.width}%`, _.style.height = `${g.height}%`, d.appendChild(_);
    }), l.appendChild(d);
    const m = document.createElement("div");
    m.className = "ab-tpl-card__label", m.innerHTML = `<span class="ab-tpl-card__icon">${u.icon}</span> ${u.nameHe}`, l.appendChild(m);
    const p = document.createElement("div");
    p.className = "ab-tpl-card__desc", p.textContent = u.description, l.appendChild(p), s.appendChild(l);
  }), o.appendChild(s), t.appendChild(o), document.body.appendChild(t);
  function a() {
    t.remove();
  }
  n.addEventListener("click", a), document.addEventListener("keydown", function u(l) {
    l.key === "Escape" && (a(), document.removeEventListener("keydown", u));
  });
}
class gu {
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
      this._makeBtn("⬇ ייצוא", "ab-editor-btn--export", () => Qo(this._gameData))
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
    this._overlay = er(t), this._overlay.show(), this._navigator = cr(this._container, this._gameData, {
      onSelectRound: (o) => this._selectRound(o),
      onAddRound: (o) => this._addRound(o),
      onDuplicateRound: (o) => this._duplicateRound(o),
      onMoveRound: (o, r) => this._moveRound(o, r)
    }), this._inspector = Xc(this._container, {
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
      bu((p) => {
        var g;
        this._selectedId && (this._gameData.updateRound(this._selectedId, { zones: p }), this._refreshUndoButtons(), (g = this._zoneEditor) == null || g.setZones(p));
      });
    }), u.appendChild(l);
    const d = document.createElement("button");
    d.className = "ab-editor-btn ab-editor-btn--play", d.textContent = "✓ סיום", d.addEventListener("click", () => this._closeZoneEditor()), u.appendChild(d), r.appendChild(u), n.appendChild(r), document.body.appendChild(n), this._zoneModal = n, c.onload = () => {
      const p = t.zones ?? [];
      this._zoneEditor = du(a, p, {
        gameId: this._gameData.id,
        onChange: (g) => {
          this._selectedId && (this._gameData.updateRound(this._selectedId, { zones: g }), this._refreshUndoButtons());
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
    iu(this._gameData.id, this._gameData);
  }
  _save() {
    Go(this._gameData), this._showToast("✅ נשמר!");
  }
  _showToast(t) {
    const n = document.createElement("div");
    n.className = "ab-editor-toast", n.textContent = t, document.body.appendChild(n), setTimeout(() => n.remove(), 2200);
  }
}
async function Uu(e, t) {
  if (Wo(e, t.loadingMessage ?? "טוֹעֵן..."), await Io(t.preloadTexts ?? []), t.onBeforeHide && await t.onBeforeHide() === !1)
    return { shell: null, activeRounds: [], gameData: null, aborted: !0 };
  Xo(e);
  const n = Ko(t.gameId), o = n ? n.rounds : t.defaultRounds ?? [], r = new vo(e, {
    totalRounds: t.totalRounds ?? o.length,
    title: t.title
  });
  let i = null;
  if (t.editor) {
    const s = {
      title: t.editor.title ?? t.title,
      type: t.editor.type ?? "multiple-choice"
    };
    i = Re.fromRoundsArray(t.gameId, o, s, t.editor.distractors ?? []), new gu(e, i, { restartGame: t.editor.restartGame });
  }
  return { shell: r, activeRounds: o, gameData: i, aborted: !1 };
}
function Hu({ hintAfter: e = 2, escalateAfter: t = 4, onHint: n, onEscalate: o } = {}) {
  let r = 0;
  function i(s) {
    return s >= t ? 2 : s >= e ? 1 : 0;
  }
  return {
    /** דיווח על ניסיון שגוי. מפעיל את הקולבק המתאים ומחזיר את הרמה. */
    miss() {
      r++;
      const s = i(r);
      return s === 2 && o ? o(r) : s === 1 && n && n(r), s;
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
const ro = {
  a: { F1: 850, F2: 1400 },
  e: { F1: 550, F2: 2100 },
  i: { F1: 350, F2: 2700 },
  o: { F1: 550, F2: 1e3 },
  u: { F1: 350, F2: 850 }
}, It = {
  kamatz: "a",
  patah: "a",
  tzere: "e",
  segol: "e",
  hiriq: "i",
  holam: "o",
  kubbutz: "u"
};
function _u(e, t) {
  if (!Number.isFinite(e) || !Number.isFinite(t) || e <= 0 || t <= 0 || t <= e)
    return { vowel: "", confidence: 0 };
  const n = Math.log2(e), o = Math.log2(t), r = [];
  for (const [c, u] of Object.entries(ro)) {
    const l = n - Math.log2(u.F1), d = o - Math.log2(u.F2);
    r.push({ vowel: c, dist: Math.sqrt(l * l + d * d) });
  }
  r.sort((c, u) => c.dist - u.dist);
  const i = r[0], s = r[1], a = s.dist === 0 ? 1 : Math.max(0, Math.min(1, 1 - i.dist / s.dist));
  return { vowel: i.vowel, confidence: a };
}
function Vu(e, t) {
  return !e || !t ? !1 : It[t] === e;
}
function yu(e, t) {
  const n = e.length, o = Math.max(1, Math.min(t, n)), r = new Float32Array(o);
  for (let a = 0; a < o; a++) {
    let c = 0;
    const u = Math.PI * a / n;
    for (let l = 0; l < n; l++)
      c += e[l] * Math.cos(u * (l + 0.5));
    r[a] = c;
  }
  const i = new Float32Array(n), s = 2 / n;
  for (let a = 0; a < n; a++) {
    let c = r[0] * 0.5;
    for (let u = 1; u < o; u++)
      c += r[u] * Math.cos(Math.PI * u * (a + 0.5) / n);
    i[a] = s * c;
  }
  return i;
}
function vu(e, t) {
  if (!e || e.length === 0 || !Number.isFinite(t) || t <= 0)
    return { F1: 0, F2: 0 };
  const n = yu(e, 80), o = Math.min(n.length - 3, Math.floor(3500 / t)), r = [];
  for (let u = 3; u <= o; u++) {
    const l = n[u];
    l > n[u - 1] && l > n[u - 2] && l > n[u + 1] && l > n[u + 2] && r.push({ freq: u * t, mag: l });
  }
  if (r.length === 0) return { F1: 0, F2: 0 };
  const i = r.filter((u) => u.freq >= 200 && u.freq <= 1100);
  if (i.length === 0) return { F1: 0, F2: 0 };
  i.sort((u, l) => l.mag - u.mag);
  const s = i[0].freq, a = Math.max(s + 250, 700), c = r.filter((u) => u.freq >= a && u.freq <= 3500);
  return c.length === 0 ? { F1: s, F2: 0 } : (c.sort((u, l) => l.mag - u.mag), { F1: s, F2: c[0].freq });
}
function qu() {
  var u;
  const e = typeof window < "u", t = e && !!((u = navigator == null ? void 0 : navigator.mediaDevices) != null && u.getUserMedia), n = e ? window.AudioContext || window.webkitAudioContext : null, o = t && !!n;
  let r = null, i = null, s = !1;
  const a = () => ({ vowel: "", confidence: 0, F1: 0, F2: 0 }), c = () => {
    if (r)
      for (const l of r.getTracks())
        try {
          l.stop();
        } catch {
        }
    if (i)
      try {
        i.close();
      } catch {
      }
    r = null, i = null;
  };
  return {
    available: o,
    async listen(l = 3e3) {
      if (!o) return a();
      s = !1;
      let d;
      try {
        d = await navigator.mediaDevices.getUserMedia({ audio: !0 });
      } catch {
        return a();
      }
      r = d;
      const m = new n();
      i = m;
      const p = m.createMediaStreamSource(d), g = m.createAnalyser();
      g.fftSize = 4096, g.smoothingTimeConstant = 0.2, p.connect(g);
      const _ = m.sampleRate / g.fftSize, C = new Float32Array(g.frequencyBinCount), k = new Float32Array(g.fftSize), N = 0.015, b = [], E = performance.now();
      return new Promise((y) => {
        const x = () => {
          if (c(), b.length < 3) {
            y(a());
            return;
          }
          const $ = b.map((h) => h.F1).sort((h, v) => h - v), w = b.map((h) => h.F2).sort((h, v) => h - v), A = Math.floor(b.length / 2), Z = $[A], H = w[A], V = _u(Z, H);
          y({ ...V, F1: Z, F2: H });
        }, z = () => {
          if (s) {
            c(), y(a());
            return;
          }
          if (performance.now() - E > l) {
            x();
            return;
          }
          g.getFloatTimeDomainData(k);
          let $ = 0;
          for (let A = 0; A < k.length; A++) $ += k[A] * k[A];
          if (Math.sqrt($ / k.length) > N) {
            g.getFloatFrequencyData(C);
            const { F1: A, F2: Z } = vu(C, _);
            A > 0 && Z > 0 && Z > A && b.push({ F1: A, F2: Z });
          }
          requestAnimationFrame(z);
        };
        requestAnimationFrame(z);
      });
    },
    cancel() {
      s = !0, c();
    }
  };
}
const io = 210, so = 550, wu = {
  a: { F3: 2700, bandwidths: [90, 110, 170], gains: [1, 0.5, 0.15] },
  e: { F3: 2900, bandwidths: [80, 100, 160], gains: [1, 0.55, 0.2] },
  i: { F3: 3300, bandwidths: [60, 100, 160], gains: [1, 0.6, 0.25] },
  o: { F3: 2600, bandwidths: [80, 90, 150], gains: [1, 0.5, 0.1] },
  u: { F3: 2400, bandwidths: [60, 80, 140], gains: [1, 0.45, 0.1] }
};
function Ge(e) {
  const t = ro[e], n = wu[e];
  return !t || !n ? null : {
    formants: [t.F1, t.F2, n.F3],
    bandwidths: [...n.bandwidths],
    gains: [...n.gains]
  };
}
const hn = {
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
function ku(e) {
  return hn[e] ?? hn[""];
}
function Ju() {
  return Qe() !== null;
}
let je = null;
function Eu(e) {
  if (je && je.sampleRate === e.sampleRate) return je;
  const t = e.sampleRate, n = e.createBuffer(1, t, e.sampleRate), o = n.getChannelData(0);
  for (let r = 0; r < t; r++) o[r] = Math.random() * 2 - 1;
  return je = n, n;
}
function ao(e, t, n) {
  const o = e.createOscillator();
  o.type = "sawtooth", o.frequency.value = n;
  const r = e.createGain();
  r.gain.value = 0;
  const i = t.formants.map((s, a) => {
    const c = e.createBiquadFilter();
    c.type = "bandpass", c.frequency.value = s, c.Q.value = s / t.bandwidths[a];
    const u = e.createGain();
    return u.gain.value = t.gains[a], o.connect(c), c.connect(u), u.connect(r), c;
  });
  return r.connect(e.destination), { source: o, filters: i, master: r };
}
function mt(e, t, n, o) {
  const r = n.durationMs / 1e3, i = e.createBufferSource();
  i.buffer = Eu(e), i.loop = !0;
  const s = e.createBiquadFilter();
  s.type = "bandpass", s.frequency.value = n.noiseHz ?? 2e3, s.Q.value = n.noiseQ ?? 1;
  const a = e.createGain();
  return a.gain.setValueAtTime(0, t), a.gain.linearRampToValueAtTime(o, t + Math.min(0.01, r / 3)), a.gain.linearRampToValueAtTime(1e-4, t + r), i.connect(s), s.connect(a), a.connect(e.destination), i.start(t), i.stop(t + r + 0.02), t + r;
}
function co(e, t, n, o, r, i) {
  const s = o / 1e3, { source: a, filters: c, master: u } = ao(e, n, r);
  if (a.frequency.setValueAtTime(r * 1.04, t), a.frequency.linearRampToValueAtTime(r * 0.92, t + s), i) {
    const m = Math.min(0.09, s / 3);
    c.forEach((p, g) => {
      const _ = i[g];
      _ && (p.frequency.setValueAtTime(_, t), p.frequency.exponentialRampToValueAtTime(n.formants[g], t + m));
    });
  }
  const l = 0.04, d = 0.12;
  return u.gain.setValueAtTime(0, t), u.gain.linearRampToValueAtTime(0.5, t + l), u.gain.setValueAtTime(0.5, t + s - d), u.gain.linearRampToValueAtTime(1e-4, t + s), a.start(t), a.stop(t + s + 0.05), t + s;
}
function zu(e, t, n, o) {
  const r = n / 1e3, i = { formants: [250, 1100, 2200], bandwidths: [80, 200, 300], gains: [1, 0.12, 0.05] }, { source: s, master: a } = ao(e, i, o);
  return a.gain.setValueAtTime(0, t), a.gain.linearRampToValueAtTime(0.35, t + 0.02), a.gain.setValueAtTime(0.35, t + r - 0.02), a.gain.linearRampToValueAtTime(1e-4, t + r), s.start(t), s.stop(t + r + 0.05), t + r;
}
function uo(e, t) {
  const n = Math.max(0, (t - e.currentTime) * 1e3) + 60;
  return new Promise((o) => setTimeout(o, n));
}
async function Su(e, t = {}) {
  const n = Ge(e);
  if (!n) return !1;
  const o = await kt();
  if (!o) return !1;
  let r;
  try {
    const i = o.currentTime + 0.03;
    r = co(o, i, n, t.durationMs ?? so, t.pitchHz ?? io, null);
  } catch {
    return !1;
  }
  return await uo(o, r), !0;
}
async function lo(e, t, n = {}) {
  const o = Ge(t);
  if (!o) return !1;
  const r = await kt();
  if (!r) return !1;
  const i = ku(e), s = n.pitchHz ?? io, a = n.durationMs ?? so;
  let c;
  try {
    c = $u(r, i, e, o, a, s);
  } catch {
    return !1;
  }
  return await uo(r, c), !0;
}
function $u(e, t, n, o, r, i) {
  let s = e.currentTime + 0.03, a = null;
  switch (t.type) {
    case "plosive": {
      s = mt(e, s, t, t.voiced ? 0.25 : 0.35), s += 0.01;
      break;
    }
    case "fricative": {
      s = mt(e, s, t, 0.22) - 0.03;
      break;
    }
    case "affricate": {
      s += 0.03, s = mt(e, s, { ...t, durationMs: t.durationMs - 30 }, 0.3) - 0.02;
      break;
    }
    case "nasal": {
      s = zu(e, s, t.durationMs, i), a = [300, 1300, 2300];
      break;
    }
    case "liquid": {
      a = n === "r" ? [450, 1300, 1600] : [380, 1e3, 2600];
      break;
    }
    case "glide": {
      const c = Ge(n === "y" ? "i" : "u");
      a = c ? c.formants : null;
      break;
    }
  }
  return co(e, s, o, r, i, a);
}
const Ae = [
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
  { letter: "ל", name: "לָמַד", nameNikud: "לָמֵד", sound: "l", exampleWord: "לֵב", emoji: "❤️", isFinal: !1 },
  { letter: "מ", name: "מֵם", nameNikud: "מֵם", sound: "m", exampleWord: "מַיִם", emoji: "💧", isFinal: !1 },
  { letter: "ם", name: "מֵם סוֹפִית", nameNikud: "מֵם סוֹפִית", sound: "m", exampleWord: "שָׁמַיִם", emoji: "🌤️", isFinal: !0 },
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
function Ot(e) {
  return Ae.find((t) => t.letter === e) || null;
}
function Nu(e = "regular") {
  return e === "regular" ? Ae.filter((t) => !t.isFinal) : e === "final" ? Ae.filter((t) => t.isFinal) : Ae;
}
function Wu(e, t = "regular") {
  const n = Nu(t);
  return [...n].sort(() => Math.random() - 0.5).slice(0, Math.min(e, n.length));
}
const Ke = "sound-bank";
function fo(e) {
  return `letter:${e}`;
}
function ho(e) {
  return `nikud:${e}`;
}
function po(e, t) {
  return `syllable:${e}:${t}`;
}
function Cu(e) {
  return `word:${e}`;
}
function mo() {
  const e = [];
  for (const t of Ae)
    e.push({ key: fo(t.letter), label: t.nameNikud, group: "letters" });
  for (const t of G)
    e.push({ key: ho(t.id), label: `${t.nameNikud} (${t.sound})`, group: "nikud" });
  for (const t of Oo)
    for (const n of G)
      e.push({
        key: po(t, n.id),
        label: gn(t, n.symbol),
        group: "syllables"
      });
  return e;
}
function Xu(e) {
  const t = mo().find((o) => o.key === e);
  if (t) return t.label;
  const [, ...n] = e.split(":");
  return n.join(":");
}
function xu() {
  return typeof navigator < "u" && navigator.onLine === !1;
}
async function it(e) {
  try {
    return typeof indexedDB > "u" ? !1 : await ve(Ke, e);
  } catch {
    return !1;
  }
}
async function st(e) {
  if (xu() && !Tu()) return !1;
  try {
    return await e(), he.audioState !== "failed" && he.audioState !== "unsupported";
  } catch {
    return !1;
  }
}
function Tu() {
  return typeof speechSynthesis < "u";
}
async function Yu() {
  try {
    return typeof indexedDB > "u" ? [] : await to(Ke);
  } catch {
    return [];
  }
}
async function Gu(e) {
  if (await it(fo(e))) return "bank";
  const t = Ot(e), n = t ? t.nameNikud : e;
  return await st(() => he.speak(n)) ? "tts" : t && await lo(t.sound, "a", { durationMs: 400 }) ? "synth" : "none";
}
async function Ku(e) {
  if (await it(ho(e))) return "bank";
  if (await st(() => he.speakVowel(e))) return "tts";
  const t = It[e];
  return t && await Su(t) ? "synth" : "none";
}
async function Qu(e, t) {
  if (await it(po(e, t))) return "bank";
  const n = G.find((i) => i.id === t);
  if (n && await st(() => he.speakNikud(e, n.symbol))) return "tts";
  const o = Ot(e), r = It[t];
  return r && await lo(o ? o.sound : "", r) ? "synth" : "none";
}
async function el(e) {
  return await it(Cu(e)) ? "bank" : await st(() => he.speak(e)) ? "tts" : "none";
}
const pn = "alefbet.ttsProxyUrl";
function Au() {
  var i, s;
  if (typeof window > "u") return null;
  const e = new URLSearchParams(window.location.search).get("ttsProxy");
  if (e && window.localStorage)
    try {
      window.localStorage.setItem(pn, e);
    } catch {
    }
  const t = (
    /** @type {any} */
    window.ALEFBET_TTS_PROXY_URL
  ), n = (i = window.localStorage) == null ? void 0 : i.getItem(pn), o = (s = window.localStorage) == null ? void 0 : s.getItem("alefbet.nakdanProxyUrl"), r = e || t || n || o;
  return r ? String(r).replace(/\/+$/, "") : null;
}
function Ru(e) {
  const [t, n, o] = e.split(":");
  if (t === "letter") {
    const r = Ot(n);
    return r ? r.nameNikud : null;
  }
  if (t === "nikud") {
    const r = G.find((i) => i.id === n);
    return r ? r.sound : null;
  }
  if (t === "syllable") {
    const r = G.find((i) => i.id === o);
    return r ? gn(n, r.symbol) : null;
  }
  return t === "word" && e.slice(5) || null;
}
async function Lu(e, t) {
  const n = await fetch(`${e}/tts?text=${encodeURIComponent(t)}&lang=he`);
  if (!n.ok) throw new Error(`tts-proxy ${n.status}`);
  const o = await n.blob();
  if (!o || o.size === 0) throw new Error("empty-audio");
  return o;
}
async function tl({ force: e = !1, extraTexts: t = [], onProgress: n } = {}) {
  const o = Au();
  if (!o)
    throw new Error("tts-proxy-not-configured: הגדירו כתובת דרך ?ttsProxy=... או window.ALEFBET_TTS_PROXY_URL");
  if (typeof indexedDB > "u")
    throw new Error("indexeddb-unavailable: אין אחסון מקומי לשמירת הצלילים");
  const r = [
    ...mo().map((c) => c.key),
    ...t.filter((c) => c == null ? void 0 : c.trim()).map((c) => `word:${c}`)
  ], i = new Set(e ? [] : await to(Ke).catch(() => [])), s = { total: r.length, compiled: 0, skipped: 0, failures: [] };
  let a = 0;
  for (const c of r) {
    if (a++, i.has(c)) {
      s.skipped++, n == null || n(a, r.length, c);
      continue;
    }
    const u = Ru(c);
    if (!u) {
      s.failures.push({ key: c, reason: "unknown-key" }), n == null || n(a, r.length, c);
      continue;
    }
    try {
      const l = await Lu(o, u);
      await eo(Ke, c, l), s.compiled++;
    } catch (l) {
      s.failures.push({ key: c, reason: (l == null ? void 0 : l.message) || "fetch-failed" });
    }
    n == null || n(a, r.length, c);
  }
  return s;
}
function nl(e, t, n) {
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
function ol(e, t) {
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
function rl(e) {
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
      Be.correct(), o(r, "correct"), Fe(t, "bounce");
    },
    /** הצג עידוד — נסה שוב */
    wrong(r = "נַסֵּה שׁוּב") {
      Be.wrong(), o(r, "wrong"), Fe(t, "pulse");
    },
    /** הצג רמז */
    hint(r) {
      o(r, "hint"), Fe(t, "pulse");
    },
    /** הסר את הרכיב */
    destroy() {
      clearTimeout(n), t.remove();
    }
  };
}
function il(e, t) {
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
  G.forEach((u) => {
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
    localStorage.setItem("alefbet.nikudRate", String(u)), he.setNikudEmphasis({ rate: u });
    const l = Array.from(n.querySelectorAll(".nikud-filter-cb")).filter((m) => (
      /** @type {HTMLInputElement} */
      m.checked
    )).map((m) => (
      /** @type {HTMLInputElement} */
      m.value
    )), d = new URL(window.location.href);
    l.length > 0 && l.length < G.length ? d.searchParams.set("allowedNikud", l.join(",")) : d.searchParams.delete("allowedNikud"), d.searchParams.delete("excludedNikud"), n.style.display = "none", window.history.replaceState({}, "", d), t && t(e);
  }, document.getElementById("close-settings-btn").onclick = () => {
    n.style.display = "none";
  };
}
function sl(e) {
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
function Zu(e, t, n, o, r) {
  return e.map((i) => {
    const s = o > 0 ? (i.x - t) / o * 100 : 0, a = r > 0 ? (i.y - n) / r * 100 : 0;
    return `${s},${a}`;
  }).join(" ");
}
function al(e, t) {
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
    hintAfter: p = 3
  } = t, g = r === "soundboard", _ = document.createElement("div");
  _.className = "ab-zp-wrap";
  const C = document.createElement("img");
  C.className = "ab-zp-image", C.src = n, C.alt = "", C.draggable = !1, _.appendChild(C);
  const k = document.createElement("div");
  k.className = "ab-zp-layer", _.appendChild(k), e.appendChild(_);
  const N = /* @__PURE__ */ new Set();
  let b = 0, E = !1, y = !1;
  async function x($) {
    if (!(!i || E)) {
      E = !0;
      try {
        await ve(i, `zone-${$}`);
      } catch {
      }
      E = !1;
    }
  }
  function z() {
    if (y || p <= 0 || g || b < p) return;
    y = !0;
    const $ = k.querySelectorAll(".ab-zp-zone");
    $.forEach((w, A) => {
      var Z;
      (Z = o[A]) != null && Z.correct && !N.has(o[A].id) && w.classList.add("ab-zp-zone--hint");
    }), setTimeout(() => {
      $.forEach((w) => w.classList.remove("ab-zp-zone--hint")), y = !1, b = 0;
    }, 1500);
  }
  return o.forEach(($) => {
    const w = document.createElement("button");
    if (w.className = "ab-zp-zone", (d || g) && w.classList.add("ab-zp-zone--visible"), g && w.classList.add("ab-zp-zone--soundboard"), w.style.left = `${$.x}%`, w.style.top = `${$.y}%`, w.style.width = `${$.width}%`, w.style.height = `${$.height}%`, w.setAttribute("aria-label", $.label || ($.correct ? "correct zone" : "zone")), $.shape === "polygon" && $.points && $.points.length >= 3) {
      const A = `zp-clip-${$.id}`;
      w.innerHTML = `<svg class="ab-zp-zone__poly-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs><clipPath id="${A}"><polygon points="${Zu($.points, $.x, $.y, $.width, $.height)}"/></clipPath></defs>
        <rect x="0" y="0" width="100" height="100" clip-path="url(#${A})" fill="transparent"/>
      </svg>`, w.classList.add("ab-zp-zone--poly");
    }
    if (g && $.label) {
      const A = document.createElement("span");
      A.className = "ab-zp-zone__label", A.textContent = $.label, w.appendChild(A);
    }
    w.addEventListener("click", () => {
      if (l && l($), x($.id), g) {
        w.classList.add("ab-zp-zone--tapped"), setTimeout(() => w.classList.remove("ab-zp-zone--tapped"), 400);
        return;
      }
      if (!N.has($.id))
        if ($.correct) {
          N.add($.id), w.classList.add("ab-zp-zone--correct"), a && a($);
          const A = o.filter((Z) => Z.correct).length;
          N.size >= A && u && u();
        } else
          w.classList.add("ab-zp-zone--wrong"), b++, c && c($), setTimeout(() => w.classList.remove("ab-zp-zone--wrong"), 600), z();
    }), k.appendChild(w);
  }), m && i && s && setTimeout(() => {
    ve(i, s).catch(() => {
    });
  }, 400), {
    async playInstruction() {
      return i && s ? ve(i, s) : !1;
    },
    async playZoneAudio($) {
      return i ? ve(i, `zone-${$}`) : !1;
    },
    revealCorrect() {
      k.querySelectorAll(".ab-zp-zone").forEach(($, w) => {
        var A;
        (A = o[w]) != null && A.correct && $.classList.add("ab-zp-zone--revealed");
      });
    },
    reset() {
      N.clear(), b = 0, y = !1, k.querySelectorAll(".ab-zp-zone").forEach(($) => {
        $.classList.remove(
          "ab-zp-zone--correct",
          "ab-zp-zone--wrong",
          "ab-zp-zone--revealed",
          "ab-zp-zone--tapped",
          "ab-zp-zone--hint"
        );
      });
    },
    destroy() {
      _.remove();
    }
  };
}
function cl(e, t, n, o) {
  const r = e.querySelector(".game-header__spacer");
  if (!r) return null;
  const i = document.createElement("button");
  return i.className = "ab-header-btn", i.setAttribute("aria-label", n), i.textContent = t, i.onclick = o, r.innerHTML = "", r.appendChild(i), i;
}
const Iu = "0 0 32 16", bo = {
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
function Ou(e) {
  const t = bo[e];
  return t ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${Iu}" aria-hidden="true" focusable="false">${t}</svg>` : null;
}
const ul = Object.freeze(Object.keys(bo));
function ll(e, { size: t = "md" } = {}) {
  const n = document.createElement("div");
  n.className = `ab-nikud-box ab-nikud-box--${t} ab-nikud-box--${e.id}`;
  const o = document.createElement("div");
  o.className = "ab-nikud-box__box";
  const r = document.createElement("div");
  return r.className = "ab-nikud-box__mark", r.innerHTML = Ou(e.id) ?? "", n.appendChild(o), n.appendChild(r), n;
}
function dl(e, t) {
  const {
    title: n = "",
    subtitle: o = "",
    tabs: r = [],
    homeUrl: i = null,
    onTabChange: s = null
  } = t;
  e.classList.add("ab-app");
  const a = i ? `<a href="${i}" class="ab-app-back-link" aria-label="דף הבית">🏠</a>` : "", c = o ? `<span class="ab-app-subtitle">${o}</span>` : '<span class="ab-app-subtitle"></span>', u = r.map(
    (_) => `<button class="ab-app-tab" data-tab="${_.id}" aria-selected="false" role="tab"><span class="ab-app-tab-icon">${_.icon}</span><span class="ab-app-tab-label">${_.label}</span></button>`
  ).join(""), l = r.map(
    (_) => `<button class="ab-app-nav-item" data-tab="${_.id}" aria-selected="false" role="tab"><span class="ab-app-nav-icon">${_.icon}</span><span class="ab-app-nav-label">${_.label}</span></button>`
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
  function p(_) {
    g(_), typeof s == "function" && s(_);
  }
  e.querySelectorAll(".ab-app-tab, .ab-app-nav-item").forEach((_) => {
    _.addEventListener("click", () => p(
      /** @type {HTMLElement} */
      _.dataset.tab
    ));
  });
  function g(_) {
    e.querySelectorAll(".ab-app-tab, .ab-app-nav-item").forEach((C) => {
      const k = (
        /** @type {HTMLElement} */
        C
      ), N = k.dataset.tab === _;
      k.classList.toggle("ab-active", N), k.setAttribute("aria-selected", N ? "true" : "false");
    });
  }
  return r.length > 0 && g(r[0].id), {
    /** אלמנט תוכן הראשי — כאן מרנדרים את תוכן הטאב הנוכחי */
    contentEl: m,
    /**
     * עדכן את כותרת המשנה
     * @param {string} text - הטקסט החדש לכותרת המשנה
     */
    setSubtitle(_) {
      d.textContent = _;
    },
    /**
     * הגדר את הטאב הפעיל באופן תכנותי
     * @param {string} tabId - מזהה הטאב להפעלה
     */
    setActiveTab(_) {
      g(_);
    }
  };
}
const mn = "alefbet-audio-status-banner";
function Pu(e) {
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
function fl(e = typeof document < "u" ? document.body : null, t = {}) {
  const n = t.window || (typeof window < "u" ? window : null);
  if (!e || !n)
    return { destroy() {
    } };
  const o = e.querySelector("#" + mn);
  o && o.parentNode && o.parentNode.removeChild(o);
  const r = e.ownerDocument.createElement("div");
  r.id = mn, r.className = "alefbet-audio-banner", r.setAttribute("role", "status"), r.setAttribute("aria-live", "polite"), r.dir = "rtl", r.hidden = !0;
  const i = e.ownerDocument.createElement("span");
  i.className = "alefbet-audio-banner__msg", r.appendChild(i);
  const s = e.ownerDocument.createElement("button");
  s.type = "button", s.className = "alefbet-audio-banner__dismiss", s.setAttribute("aria-label", "סְגוֹר הוֹדָעָה"), s.textContent = "×", s.hidden = !0, r.appendChild(s), e.appendChild(r);
  let a = null;
  function c() {
    a && (clearTimeout(a), a = null);
  }
  function u() {
    c(), r.hidden = !0, r.classList.remove("is-visible", "is-await", "is-unsupported", "is-failed"), r.onclick = null, s.hidden = !0;
  }
  function l(m) {
    const p = Pu(m);
    if (!p) {
      u();
      return;
    }
    c(), i.textContent = p.message, r.hidden = !1, r.classList.add("is-visible"), r.classList.toggle("is-await", p.kind === "await"), r.classList.toggle("is-unsupported", p.kind === "unsupported"), r.classList.toggle("is-failed", p.kind === "failed"), p.kind, p.kind === "await" ? (r.onclick = () => {
      try {
        e.ownerDocument.body.dispatchEvent(new MouseEvent("pointerdown", { bubbles: !0 }));
      } catch {
      }
      u();
    }, s.hidden = !0) : p.kind === "unsupported" ? (r.onclick = null, s.hidden = !1, s.onclick = (g) => {
      g.stopPropagation(), u();
    }) : p.kind === "failed" && (r.onclick = null, s.hidden = !0, a = setTimeout(() => u(), 6e3));
  }
  function d(m) {
    const g = /** @type {CustomEvent} */ (m.detail || {}).state;
    if (g === "ready" || g === "idle") {
      u();
      return;
    }
    l(g);
  }
  return n.addEventListener("alefbet:tts-state", d), {
    destroy() {
      n.removeEventListener("alefbet:tts-state", d), c(), r.parentNode && r.parentNode.removeChild(r);
    }
  };
}
export {
  pu as ACTIVITY_TEMPLATES,
  dn as BUILTIN_ROUND_SCHEMAS,
  Rt as BaseRoundSchema,
  qc as DragMatchRoundSchema,
  _o as EventBus,
  Re as GameData,
  Fu as GameDataSchema,
  gu as GameEditor,
  Jc as GameMetaSchema,
  vo as GameShell,
  yo as GameState,
  Vc as MultipleChoiceRoundSchema,
  ul as NIKUD_GLYPH_IDS,
  It as NIKUD_VOWEL,
  Uc as PointSchema,
  Ke as SOUND_BANK_ID,
  ro as VOWEL_TEMPLATES,
  Hc as ZoneSchema,
  Wc as ZoneTapRoundSchema,
  Lo as addNikud,
  Fe as animate,
  Uu as bootstrapGame,
  _u as classifyFormants,
  Du as clearGameData,
  tl as compileSoundBank,
  Ru as compileTextForKey,
  ku as consonantOnsetSpec,
  dl as createAppShell,
  sr as createDragSource,
  ar as createDropTarget,
  rl as createFeedback,
  Hu as createHintTracker,
  yn as createLocalState,
  ll as createNikudBox,
  nl as createOptionCards,
  ol as createProgressBar,
  ju as createRoundManager,
  no as createVoiceRecordButton,
  Kc as createVoiceRecorder,
  qu as createVowelDetector,
  sl as createZone,
  du as createZoneEditor,
  al as createZonePlayer,
  tu as deleteVoice,
  kt as ensureAudioRunning,
  Qo as exportGameDataAsJSON,
  vu as extractFormantsFromSpectrum,
  mu as generateZonesFromTemplate,
  Qe as getAudioContext,
  Ot as getLetter,
  Nu as getLettersByGroup,
  Zo as getNikud,
  Bu as hasVoice,
  Ae as hebrewLetters,
  Xo as hideLoadingScreen,
  cl as injectHeaderButton,
  xu as isOffline,
  Ju as isSynthSupported,
  Gc as isVoiceRecordingSupported,
  xo as isVowelized,
  Xu as keyLabel,
  fo as letterKey,
  gn as letterWithNikud,
  to as listVoiceKeys,
  Ko as loadGameData,
  Zt as loadVoice,
  Vu as matchNikudVowel,
  fl as mountAudioStatusBanner,
  Oo as nikudBaseLetters,
  Ou as nikudGlyphSvg,
  ho as nikudKey,
  G as nikudList,
  zo as playBlob,
  ve as playVoice,
  Io as preloadNikud,
  Wu as randomLetters,
  Mu as randomNikud,
  Yu as recordedKeys,
  Au as resolveTtsProxyUrl,
  Go as saveGameData,
  eo as saveVoice,
  Bc as schemaToFields,
  iu as showAudioManager,
  Jo as showCompletionScreen,
  Wo as showLoadingScreen,
  il as showNikudSettingsDialog,
  bu as showTemplatePicker,
  Be as sounds,
  Gu as speakLetter,
  Ku as speakNikudSound,
  Qu as speakSyllable,
  el as speakWord,
  mo as standardSoundKeys,
  po as syllableKey,
  lo as synthesizeSyllable,
  Su as synthesizeVowel,
  he as tts,
  ko as unlockAudioOutput,
  Ge as vowelFormantSpec,
  Cu as wordKey
};
