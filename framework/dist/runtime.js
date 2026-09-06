import { u as Xe, g as Te, c as Ye, l as Ze, G as Je, e as Me, a as Ae, p as W, s as et } from "./drag-CGFmXd-t.js";
import { b as In, d as qn, f as Bn, h as $n, i as Vn, j as Hn, k as Un, m as Wn, n as jn } from "./drag-CGFmXd-t.js";
class tt {
  constructor() {
    this._handlers = {};
  }
  /** הירשם לאירוע */
  on(e, n) {
    return this._handlers[e] || (this._handlers[e] = []), this._handlers[e].push(n), this;
  }
  /** בטל הרשמה לאירוע */
  off(e, n) {
    return this._handlers[e] ? (this._handlers[e] = this._handlers[e].filter((a) => a !== n), this) : this;
  }
  /** שלח אירוע */
  emit(e, n) {
    return (this._handlers[e] || []).slice().forEach((a) => a(n)), this;
  }
}
class nt {
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
const K = /* @__PURE__ */ new WeakMap();
function Fe(t) {
  var e;
  (e = K.get(t)) == null || e.end();
}
class rt {
  /**
   * @param {HTMLElement} containerEl - אלמנט המיכל
   * @param {object} config - הגדרות: { totalRounds, title, homeUrl }
   */
  constructor(e, n = {}) {
    Fe(e), K.set(e, this), this.ended = !1, this._timers = /* @__PURE__ */ new Set(), this.container = e, this.config = {
      totalRounds: 8,
      title: "מִשְׂחָק",
      homeUrl: "../../index.html",
      ...n
    }, this.events = new tt(), this.state = new nt(this.config.totalRounds), this.gameId = typeof n.gameId == "string" ? n.gameId : "", this._buildShell();
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
      this._timers.clear(), K.get(this.container) === this && K.delete(this.container), this.events.emit("end", { score: e, state: this.state });
    }
  }
  /** פעולה מושהית מתבטלת אוטומטית בסיום או בהפעלה מחדש. */
  schedule(e, n) {
    if (this.ended) return;
    const a = setTimeout(() => {
      this._timers.delete(a), this.ended || e();
    }, n);
    this._timers.add(a);
  }
  /** המתנה מתבטלת בסיום; false אומר שאין להמשיך בפעולה. */
  delay(e) {
    return new Promise((n) => {
      if (this.ended) {
        n(!1);
        return;
      }
      const a = () => n(!1);
      this.events.on("end", a), this.schedule(() => {
        this.events.off("end", a), n(!0);
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
const ge = "https://nakdan-u1-0.loadbalancer.dicta.org.il/api";
let we = !1;
const at = 4e3, Ce = "alefbet.nikudCache.v1", it = 300, M = /* @__PURE__ */ new Map();
(function() {
  if (!(typeof localStorage > "u"))
    try {
      const e = localStorage.getItem(Ce);
      if (!e) return;
      const n = JSON.parse(e);
      if (Array.isArray(n))
        for (const [a, r] of n)
          typeof a == "string" && typeof r == "string" && M.set(a, r);
    } catch {
    }
})();
function ot() {
  if (!(typeof localStorage > "u"))
    try {
      const t = [...M.entries()].filter(([e, n]) => n !== e).slice(-it);
      localStorage.setItem(Ce, JSON.stringify(t));
    } catch {
    }
}
function st(t) {
  if (!t) return !1;
  const e = t.split(/\s+/).filter((a) => /[א-ת]/.test(a));
  return e.length === 0 ? !0 : e.filter((a) => /[\u05B0-\u05BC\u05C1\u05C2\u05C7]/.test(a)).length / e.length >= 0.8;
}
function lt() {
  var r;
  if (typeof window > "u") return ge;
  const t = new URLSearchParams(window.location.search).get("nakdanProxy"), e = window.ALEFBET_NAKDAN_PROXY_URL;
  if (t && window.localStorage)
    try {
      window.localStorage.setItem("alefbet.nakdanProxyUrl", t);
    } catch {
    }
  const n = (r = window.localStorage) == null ? void 0 : r.getItem("alefbet.nakdanProxyUrl"), a = t || e || n;
  return a || (window.location.hostname.endsWith("github.io") ? null : ge);
}
function ct(t) {
  var n;
  let e = "";
  for (const a of t)
    if (a.sep)
      e += a.str ?? "";
    else {
      const r = (n = a.nakdan) == null ? void 0 : n.options;
      r != null && r.length ? e += (r[0].w ?? "").replace(/\|/g, "").replace(/\u05BD/g, "") : e += a.str ?? "";
    }
  return e;
}
async function dt(t) {
  const e = lt();
  if (!e)
    throw we || (we = !0, console.warn("[nakdan] Dicta API blocked by CORS on GitHub Pages. Configure a proxy URL via ?nakdanProxy=..., window.ALEFBET_NAKDAN_PROXY_URL, or localStorage key alefbet.nakdanProxyUrl.")), new Error("Nakdan unavailable without proxy on this host");
  const n = typeof AbortController < "u" ? new AbortController() : null, a = n ? setTimeout(() => n.abort(), at) : null;
  let r;
  try {
    r = await fetch(e, {
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
        data: t,
        useTokenization: !0,
        genre: "modern"
      })
    });
  } finally {
    a && clearTimeout(a);
  }
  if (!r.ok) throw new Error(`Nakdan ${r.status}`);
  const o = await r.json(), i = o == null ? void 0 : o.data;
  if (!Array.isArray(i)) throw new Error("Nakdan: invalid response");
  return ct(i);
}
async function ut(t) {
  if (!(t != null && t.trim())) return t ?? "";
  if (M.has(t)) return M.get(t);
  if (st(t))
    return M.set(t, t), t;
  if (typeof navigator < "u" && navigator.onLine === !1)
    return t;
  try {
    const e = await dt(t);
    return M.set(t, e), ot(), e;
  } catch {
    return M.set(t, t), t;
  }
}
function ft(t) {
  return M.get(t) ?? t ?? "";
}
async function mt(t) {
  const e = [...new Set(t.filter((n) => n == null ? void 0 : n.trim()))];
  await Promise.all(e.map((n) => ut(n)));
}
const q = [
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
function me(t) {
  return q.find((e) => e.letter === t) || null;
}
function ht(t = "regular") {
  return t === "regular" ? q.filter((e) => !e.isFinal) : t === "final" ? q.filter((e) => e.isFinal) : q;
}
function cn(t, e = "regular") {
  const n = ht(e);
  return [...n].sort(() => Math.random() - 0.5).slice(0, Math.min(t, n.length));
}
const k = [
  { id: "kamatz", name: "קָמָץ", nameNikud: "קָמָץ", symbol: "ָ", sound: "אָה", color: "#C9442C", textColor: "#fff" },
  { id: "patah", name: "פָּתַח", nameNikud: "פָּתַח", symbol: "ַ", sound: "אָה", color: "#C58119", textColor: "#fff" },
  { id: "hiriq", name: "חִירִיק", nameNikud: "חִירִיק", symbol: "ִ", sound: "אִי", color: "#2A7B71", textColor: "#fff" },
  { id: "tzere", name: "צֵרֶה", nameNikud: "צֵרֶה", symbol: "ֵ", sound: "אֶה", color: "#4A6B8C", textColor: "#fff" },
  { id: "segol", name: "סְגוֹל", nameNikud: "סְגוֹל", symbol: "ֶ", sound: "אֶה", color: "#783952", textColor: "#fff" },
  { id: "holam", name: "חוֹלָם", nameNikud: "חוֹלָם", symbol: "ֹ", sound: "אוֹ", color: "#5F7A42", textColor: "#fff" },
  { id: "kubbutz", name: "קֻבּוּץ", nameNikud: "קֻבּוּץ", symbol: "ֻ", sound: "אוּ", color: "#6B4A8A", textColor: "#fff" }
], pt = q.filter((t) => !t.isFinal).map((t) => t.letter);
function ze(t, e) {
  return t + e;
}
function dn(t) {
  let e = [...k];
  if (typeof window < "u" && window.location && window.location.search) {
    const a = new URLSearchParams(window.location.search), r = a.get("allowedNikud");
    if (r) {
      const i = r.split(",").map((s) => s.trim());
      e = e.filter(
        (s) => i.includes(s.id) || i.includes(s.name) || i.includes(s.nameNikud)
      );
    }
    const o = a.get("excludedNikud");
    if (o) {
      const i = o.split(",").map((s) => s.trim());
      e = e.filter(
        (s) => !i.includes(s.id) && !i.includes(s.name) && !i.includes(s.nameNikud)
      );
    }
  }
  e.length === 0 && (e = [...k]);
  let n = [...e];
  for (; n.length < t; )
    n.push(...e);
  return n.sort(() => Math.random() - 0.5).slice(0, t);
}
const yt = 2e3;
let x = [], j = !1, I = 0.9, ie = typeof localStorage < "u" && parseFloat(localStorage.getItem("alefbet.nikudRate")) || 0.5, Q = !1, V = null, z = null, L = null, Pe = null, D = !1, S = "idle";
function Y() {
  return typeof speechSynthesis < "u";
}
function E(t, e, n = !1) {
  if (S === t && !n) return;
  const a = S;
  if (S = t, typeof window < "u" && typeof window.dispatchEvent == "function") {
    const r = { state: t, previousState: a };
    e && (r.reason = e), window.dispatchEvent(new CustomEvent("alefbet:tts-state", { detail: r }));
  }
}
function gt() {
  Y() ? S = "idle" : E("unsupported", "no-speech-synthesis");
}
gt();
function ue(t, e) {
  Pe = String(e || "unknown"), console.warn("[tts] browser TTS failed", { text: t, reason: e }), typeof window < "u" && typeof window.dispatchEvent == "function" && window.dispatchEvent(new CustomEvent("alefbet:tts-error", {
    detail: { provider: "browser", text: t, sentText: t, reason: e }
  }));
}
function wt(t) {
  const e = String(t).toLowerCase();
  return e.includes("not-allowed") || e.includes("notallowed") || e.includes("didn't interact") || e.includes("user gesture");
}
function bt() {
  var t;
  return typeof window > "u" || typeof document > "u" ? Promise.resolve() : Q || (t = document.userActivation) != null && t.hasBeenActive ? (Q = !0, Promise.resolve()) : V || (V = new Promise((e) => {
    const n = () => {
      Q = !0, window.removeEventListener("pointerdown", n, !0), window.removeEventListener("keydown", n, !0), window.removeEventListener("touchstart", n, !0), e();
    };
    window.addEventListener("pointerdown", n, { once: !0, capture: !0 }), window.addEventListener("keydown", n, { once: !0, capture: !0 }), window.addEventListener("touchstart", n, { once: !0, capture: !0 });
  }).finally(() => {
    V = null;
  }), V);
}
let C = null, H = null, oe = !1, be = !1;
const vt = ["carmit", "hila", "female"];
function kt(t) {
  const e = (t.name || "").toLowerCase();
  return vt.some((n) => e.includes(n));
}
function se() {
  if (typeof speechSynthesis > "u") return null;
  const e = speechSynthesis.getVoices().filter(
    (o) => o.lang === "he-IL" || o.lang === "iw-IL" || (o.lang || "").startsWith("he")
  );
  if (e.length === 0) return null;
  const a = typeof navigator < "u" && navigator.onLine === !1 && e.filter((o) => o.localService !== !1) || e, r = a.length > 0 ? a : e;
  return r.find(kt) || r[0];
}
function _t() {
  return typeof speechSynthesis > "u" ? Promise.resolve() : (C = se(), C ? (oe = !0, Promise.resolve()) : oe ? Promise.resolve() : H || (H = new Promise((t) => {
    let e = !1;
    const n = () => {
      e || (e = !0, oe = !0, C = se(), typeof speechSynthesis < "u" && typeof speechSynthesis.removeEventListener == "function" && speechSynthesis.removeEventListener("voiceschanged", a), clearTimeout(r), t());
    }, a = () => {
      C = se(), C && n();
    };
    typeof speechSynthesis.addEventListener == "function" && speechSynthesis.addEventListener("voiceschanged", a);
    const r = setTimeout(() => {
      be || (be = !0, ue("", "voice-load-timeout")), n();
    }, yt);
  }).finally(() => {
    H = null;
  }), H));
}
function St(t) {
  return 5e3 + ((t == null ? void 0 : t.length) ?? 0) * 200;
}
function ve(t) {
  return new Promise((e, n) => {
    if (typeof SpeechSynthesisUtterance > "u") {
      n(new Error("SpeechSynthesisUtterance unavailable"));
      return;
    }
    try {
      const a = new SpeechSynthesisUtterance(t);
      a.lang = "he-IL", a.rate = I, C && (a.voice = C), L = a;
      let r = !1;
      const o = setTimeout(() => {
        if (!r) {
          r = !0, L === a && (L = null);
          try {
            speechSynthesis.cancel();
          } catch {
          }
          n(new Error("utterance-timeout"));
        }
      }, St(t));
      a.onend = () => {
        r || (r = !0, clearTimeout(o), L === a && (L = null), e());
      }, a.onerror = (i) => {
        r || (r = !0, clearTimeout(o), L === a && (L = null), n(new Error(String(i && i.error || "speech-error"))));
      }, speechSynthesis.speak(a);
    } catch (a) {
      n(a instanceof Error ? a : new Error(String(a)));
    }
  });
}
async function Et(t) {
  if (typeof speechSynthesis > "u")
    return { ok: !1, reason: "speechSynthesis unavailable" };
  await _t();
  try {
    return await ve(t), D = !1, { ok: !0 };
  } catch (e) {
    const n = (e == null ? void 0 : e.message) || "speech-error";
    if (wt(n)) {
      D || (D = !0, E("awaiting-interaction", "autoplay-blocked")), await bt(), D = !1;
      try {
        return await ve(t), { ok: !0 };
      } catch (a) {
        const r = (a == null ? void 0 : a.message) || "speech-error";
        return ue(t, r), { ok: !1, reason: r };
      }
    }
    return ue(t, n), { ok: !1, reason: n };
  }
}
function B() {
  if (j || x.length === 0) return;
  const t = x.shift();
  j = !0, z = t;
  const e = I, n = typeof t.rate == "number";
  n && (I = t.rate), Et(t.text).then((a) => {
    n && (I = e), j = !1;
    const r = z === t;
    if (z = null, !r) {
      B();
      return;
    }
    a.ok ? S !== "unsupported" && E("ready") : Y() ? E("failed", a.reason, !0) : E("unsupported", a.reason || "no-provider", !0), t.resolve(), B();
  }).catch((a) => {
    n && (I = e), j = !1, z = null, E("failed", (a == null ? void 0 : a.message) || "unknown"), t.resolve(), B();
  });
}
const R = {
  /**
   * הקרא טקסט עברי. ה-promise תמיד נפתר (גם בכשל) כדי שמשחקים לא יתקעו.
   * @param {string} text
   * @returns {Promise<void>}
   */
  speak(t) {
    const e = ft(t);
    return new Promise((n) => {
      x.push({ text: e, resolve: n }), B();
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
    if (z) {
      try {
        z.resolve();
      } catch {
      }
      z = null;
    }
    if (x.forEach((t) => {
      try {
        t.resolve();
      } catch {
      }
    }), x = [], j = !1, L && (L = null), typeof speechSynthesis < "u" && typeof speechSynthesis.cancel == "function")
      try {
        speechSynthesis.cancel();
      } catch {
      }
    E("idle", "cancelled");
  },
  /**
   * האם יש יכולת קול מקומית במכשיר.
   */
  get available() {
    return S !== "unsupported" && Y();
  },
  /** המצב הנוכחי של מנוע ה-TTS. */
  get audioState() {
    return S;
  },
  /** Alias for audioState — some callers use `state`. */
  get state() {
    return S;
  },
  /** השגיאה האחרונה שדווחה או null אם לא הייתה. */
  get lastError() {
    return Pe;
  },
  /**
   * משחרר ידנית את מנוע הקול אחרי gesture ידוע (כפתור התחל וכו').
   * משחקים יקראו לזה במקום להמתין ל-autoplay block.
   * @returns {Promise<void>}
   */
  unlock() {
    if (Q = !0, D = !1, Xe().catch(() => {
    }), typeof speechSynthesis < "u" && typeof SpeechSynthesisUtterance < "u")
      try {
        const t = new SpeechSynthesisUtterance("");
        t.volume = 0, speechSynthesis.speak(t), speechSynthesis.cancel();
      } catch {
      }
    return S === "awaiting-interaction" && E("ready", "unlocked"), Promise.resolve();
  },
  /**
   * רושם handler לאירועי `alefbet:tts-state`. מחזיר פונקציית unsubscribe.
   * @param {(detail: { state: string, previousState: string, reason?: string }) => void} handler
   * @returns {() => void}
   */
  onStateChange(t) {
    if (typeof window > "u") return () => {
    };
    const e = (n) => t(
      /** @type {CustomEvent} */
      n.detail
    );
    return window.addEventListener("alefbet:tts-state", e), () => window.removeEventListener("alefbet:tts-state", e);
  },
  /**
   * רושם handler לאירועי `alefbet:tts-error`. מחזיר פונקציית unsubscribe.
   * @param {(detail: { provider: string, text: string, sentText: string, reason: string }) => void} handler
   * @returns {() => void}
   */
  onError(t) {
    if (typeof window > "u") return () => {
    };
    const e = (n) => t(
      /** @type {CustomEvent} */
      n.detail
    );
    return window.addEventListener("alefbet:tts-error", e), () => window.removeEventListener("alefbet:tts-error", e);
  },
  /**
   * סריקת יכולת מחודשת. מחזירה את הערך של `tts.available`. שימושית לבדיקות.
   */
  probe() {
    return Y() ? S === "unsupported" && E("idle", "recovered") : E("unsupported", "no-speech-synthesis"), this.available;
  },
  /**
   * הגדר מהירות דיבור (0.5-2.0).
   * @param {number} rate
   */
  setRate(t) {
    I = Math.max(0.5, Math.min(2, t));
  },
  /**
   * הגדר מהירות דיבור להדגשת ניקוד.
   * @param {{ rate?: number }} opts - rate: מהירות הדגשה (ברירת מחדל 0.5).
   */
  setNikudEmphasis({ rate: t } = {}) {
    t != null && (ie = Math.max(0.3, Math.min(1.5, t)));
  },
  /**
   * הקרא אות עם ניקוד בשני שלבים: קודם את ההברה בקצב טבעי כדי שהעיצור יהיה קצר,
   * ואז את צליל התנועה לבד בקצב האיטי שמיועד לניקוד - כך הילד שומע
   * "מ-אההההה" במקום "ממממ-אה" שמתקבל מהאטה אחידה של ההברה כולה.
   * @param {string} letter - האות (למשל 'ב').
   * @param {string} nikudSymbol - סמל הניקוד (למשל U+05B7).
   */
  speakNikud(t, e) {
    const n = t + e, a = k.find((r) => r.symbol === e);
    return new Promise((r) => {
      a && a.sound ? (x.push({ text: n, resolve: () => {
      } }), x.push({
        text: a.sound,
        rate: ie,
        resolve: () => r(void 0)
      })) : x.push({ text: n, resolve: () => r(void 0) }), B();
    });
  },
  /**
   * הקרא את צליל התנועה של הניקוד ("אָה", "אוֹ" וכו'),
   * כדי להדגים לילד מה להגות.
   * @param {string} nikudId - מזהה ניקוד מתוך nikudList (למשל 'kamatz').
   */
  speakVowel(t) {
    const e = k.find((n) => n.id === t);
    return !e || !e.sound ? Promise.resolve() : new Promise((n) => {
      x.push({
        text: e.sound,
        rate: ie,
        resolve: () => n(void 0)
      }), B();
    });
  }
}, ke = "alefbet-audio-status-banner";
function Nt(t) {
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
function xt(t = typeof document < "u" ? document.body : null, e = {}) {
  const n = e.window || (typeof window < "u" ? window : null);
  if (!t || !n)
    return { destroy() {
    } };
  const a = t.querySelector("#" + ke);
  a && a.parentNode && a.parentNode.removeChild(a);
  const r = t.ownerDocument.createElement("div");
  r.id = ke, r.className = "alefbet-audio-banner", r.setAttribute("role", "status"), r.setAttribute("aria-live", "polite"), r.dir = "rtl", r.hidden = !0;
  const o = t.ownerDocument.createElement("span");
  o.className = "alefbet-audio-banner__msg", r.appendChild(o);
  const i = t.ownerDocument.createElement("button");
  i.type = "button", i.className = "alefbet-audio-banner__dismiss", i.setAttribute("aria-label", "סְגוֹר הוֹדָעָה"), i.textContent = "×", i.hidden = !0, r.appendChild(i), t.appendChild(r);
  let s = null;
  function c() {
    s && (clearTimeout(s), s = null);
  }
  function l() {
    c(), r.hidden = !0, r.classList.remove("is-visible", "is-await", "is-unsupported", "is-failed"), r.onclick = null, i.hidden = !0;
  }
  function d(f) {
    const g = Nt(f);
    if (!g) {
      l();
      return;
    }
    c(), o.textContent = g.message, r.hidden = !1, r.classList.add("is-visible"), r.classList.toggle("is-await", g.kind === "await"), r.classList.toggle("is-unsupported", g.kind === "unsupported"), r.classList.toggle("is-failed", g.kind === "failed"), g.kind, g.kind === "await" ? (r.onclick = () => {
      try {
        t.ownerDocument.body.dispatchEvent(new MouseEvent("pointerdown", { bubbles: !0 }));
      } catch {
      }
      l();
    }, i.hidden = !0) : g.kind === "unsupported" ? (r.onclick = null, i.hidden = !1, i.onclick = (h) => {
      h.stopPropagation(), l();
    }) : g.kind === "failed" && (r.onclick = null, i.hidden = !0, s = setTimeout(() => l(), 6e3));
  }
  function m(f) {
    const h = /** @type {CustomEvent} */ (f.detail || {}).state;
    if (h === "ready" || h === "idle") {
      l();
      return;
    }
    d(h);
  }
  return n.addEventListener("alefbet:tts-state", m), {
    destroy() {
      n.removeEventListener("alefbet:tts-state", m), c(), r.parentNode && r.parentNode.removeChild(r);
    }
  };
}
function Lt(t, { banner: e = !0 } = {}) {
  const n = e ? xt(t.container) : null, a = () => {
    t.container.removeEventListener("pointerdown", a, !0), t.container.removeEventListener("keydown", a, !0), R.unlock();
  };
  t.container.addEventListener("pointerdown", a, { once: !0, capture: !0 }), t.container.addEventListener("keydown", a, { once: !0, capture: !0 }), t.on("end", () => {
    t.container.removeEventListener("pointerdown", a, !0), t.container.removeEventListener("keydown", a, !0), n == null || n.destroy(), R.cancel();
  });
}
function un(t) {
  const e = [...t];
  for (let n = e.length - 1; n > 0; n--) {
    const a = Math.floor(Math.random() * (n + 1));
    [e[n], e[a]] = [e[a], e[n]];
  }
  return e;
}
function Rt() {
  const t = Te();
  return t ? (t.state === "suspended" && t.resume(), t) : null;
}
function P(t, e, n = "sine", a = 0.3) {
  const r = Rt();
  if (r)
    try {
      const o = r.createOscillator(), i = r.createGain();
      o.connect(i), i.connect(r.destination), o.type = n, o.frequency.setValueAtTime(t, r.currentTime), i.gain.setValueAtTime(a, r.currentTime), i.gain.exponentialRampToValueAtTime(1e-3, r.currentTime + e), o.start(r.currentTime), o.stop(r.currentTime + e + 0.05);
    } catch {
    }
}
const Z = {
  /** צליל תשובה נכונה */
  correct() {
    P(523.25, 0.15), setTimeout(() => P(659.25, 0.2), 120), setTimeout(() => P(783.99, 0.3), 240);
  },
  /** צליל עידוד עדין — נסה שוב */
  wrong() {
    P(350, 0.15, "triangle", 0.12);
  },
  /** צליל עידוד - סיום מוצלח */
  cheer() {
    [523.25, 587.33, 659.25, 698.46, 783.99, 1046.5].forEach((e, n) => setTimeout(() => P(e, 0.2), n * 90));
  },
  /** קליק עדין */
  click() {
    P(900, 0.04, "sine", 0.12);
  }
}, _e = {
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
}, Tt = {
  shake: 420,
  bounce: 480,
  pulse: 600,
  fadeIn: 320,
  confetti: 700
};
function X(t, e) {
  !t || !_e[e] || t.animate(_e[e], {
    duration: Tt[e] || 400,
    easing: "ease-in-out",
    fill: "none"
  });
}
const Mt = "alefbet.progress.v1", he = Ye(Mt, {});
function Ie(t, e) {
  if (!Number.isFinite(t) || !Number.isFinite(e) || e <= 0) return 1;
  const n = t / e;
  return n >= 0.8 ? 3 : n >= 0.5 ? 2 : 1;
}
function At(t, { score: e, total: n }) {
  if (!t || !Number.isFinite(e) || !Number.isFinite(n) || n <= 0) return null;
  const a = Ie(e, n);
  let r = null;
  return he.update((o) => {
    const i = o[t];
    return r = {
      plays: ((i == null ? void 0 : i.plays) ?? 0) + 1,
      bestScore: Math.max((i == null ? void 0 : i.bestScore) ?? 0, e),
      bestStars: Math.max((i == null ? void 0 : i.bestStars) ?? 0, a),
      total: i && (i.bestScore ?? 0) > e ? i.total : n,
      lastPlayed: Date.now()
    }, { ...o, [t]: r };
  }), r;
}
function fn(t) {
  return he.get()[t] ?? null;
}
function mn() {
  return he.get();
}
function Ft(t, e, n, a, r = {}) {
  Z.cheer(), r.gameId && At(r.gameId, { score: e, total: n });
  const o = Ie(e, n), i = "⭐".repeat(o) + "☆".repeat(3 - o), s = document.createElement("div");
  s.className = "completion-screen", s.innerHTML = `
    <div class="completion-screen__content">
      <div class="completion-screen__stars" aria-label="${o} כּוֹכָבִים">${i}</div>
      <h2 class="completion-screen__title">!כָּל הַכָּבוֹד</h2>
      <p class="completion-screen__score">נִיקּוּד: ${e} מִתּוֹךְ ${n}</p>
      <button class="completion-screen__replay btn btn--primary">שַׂחֵק שׁוּב</button>
    </div>
  `, s.querySelector(".completion-screen__replay").addEventListener("click", () => {
    s.remove(), a();
  }), t.innerHTML = "", t.appendChild(s), X(s.querySelector(".completion-screen__content"), "fadeIn");
}
function Ct(t, e, {
  totalRounds: n,
  progressBar: a = null,
  buildRoundUI: r,
  onCorrect: o,
  onWrong: i,
  transitionMs: s = 1200,
  playCorrectSound: c = !0,
  onReplay: l = () => location.reload()
}) {
  let d = !1;
  async function m(w) {
    if (d || t.ended) return;
    d = !0, c && Z.correct();
    try {
      if (w && await w(), t.ended) return;
      o && await o();
    } catch (b) {
      throw d = !1, b;
    }
    if (t.ended || (t.state.addScore(1), a == null || a.update(t.state.currentRound), !await t.delay(s))) return;
    t.nextRound() ? (d = !1, r()) : Ft(e, t.state.score, n, l, { gameId: t.gameId });
  }
  async function f(w) {
    if (!(d || t.ended)) {
      d = !0;
      try {
        w && await w(), !t.ended && i && await i();
      } finally {
        d = !1;
      }
    }
  }
  function g() {
    return d;
  }
  function h() {
    d = !1;
  }
  return { handleCorrect: m, handleWrong: f, isAnswered: g, reset: h };
}
function zt(t, e) {
  const n = document.createElement("div");
  n.className = "progress-bar", n.setAttribute("role", "progressbar"), n.setAttribute("aria-valuemin", "0"), n.setAttribute("aria-valuemax", String(e)), n.innerHTML = `
    <div class="progress-bar__track">
      <div class="progress-bar__fill" style="width: 0%"></div>
    </div>
    <span class="progress-bar__label">0 / ${e}</span>
  `, t.appendChild(n);
  const a = (
    /** @type {HTMLElement} */
    n.querySelector(".progress-bar__fill")
  ), r = n.querySelector(".progress-bar__label");
  return {
    /** עדכן את ההתקדמות */
    update(o) {
      const i = Math.round(o / e * 100);
      a.style.width = `${i}%`, r.textContent = `${o} / ${e}`, n.setAttribute("aria-valuenow", String(o));
    },
    /** הסר את הרכיב */
    destroy() {
      n.remove();
    }
  };
}
let le = !1, fe = !1, U = null;
const Pt = [
  "ResizeObserver loop",
  // אזהרת דפדפן שפירה
  "Script error."
  // שגיאת cross-origin אטומה, לרוב תוסף דפדפן
];
function Se(t) {
  const e = String(t || "");
  return Pt.some((n) => e.includes(n));
}
function Ee() {
  var e;
  if (fe || typeof document > "u" || !document.body) return;
  fe = !0;
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
function It() {
  if (typeof window > "u") return { destroy() {
  } };
  if (le) return { destroy() {
  } };
  le = !0;
  const t = (n) => {
    Se(n == null ? void 0 : n.message) || (console.error("[alefbet] uncaught error:", (n == null ? void 0 : n.error) ?? (n == null ? void 0 : n.message)), Ee());
  }, e = (n) => {
    const a = (
      /** @type {any} */
      n == null ? void 0 : n.reason
    );
    Se((a == null ? void 0 : a.message) ?? a) || (console.error("[alefbet] unhandled rejection:", a), Ee());
  };
  return window.addEventListener("error", t), window.addEventListener("unhandledrejection", e), U = () => {
    window.removeEventListener("error", t), window.removeEventListener("unhandledrejection", e), le = !1, fe = !1;
  }, { destroy: () => {
    U == null || U(), U = null;
  } };
}
function qt(t, e = "טוֹעֵן...") {
  t.innerHTML = `<div class="ab-loading">${e}</div>`;
}
function Bt(t) {
  t.innerHTML = "";
}
function $t(t, e, n) {
  const a = t.container.querySelector(".game-header__spacer");
  if (!a) return;
  const r = document.createElement("div");
  r.className = "ab-lazy-editor";
  const o = document.createElement("span");
  o.setAttribute("role", "status");
  let i = !1, s = null;
  async function c() {
    if (!document.querySelector('link[href$="/runtime.css"]') || document.querySelector("link[data-alefbet-editor]")) return;
    const d = document.createElement("link");
    d.rel = "stylesheet";
    const m = new URL(".", import.meta.url);
    d.href = new URL("editor.css", m).href, d.dataset.alefbetEditor = "", await new Promise((f, g) => {
      d.onload = () => f(), d.onerror = () => {
        d.remove(), g(new Error("Editor styles unavailable"));
      }, document.head.appendChild(d);
    });
  }
  async function l(d) {
    if (!(i || t.ended)) {
      i = !0, o.textContent = "טוֹעֵן...";
      try {
        const [m] = await Promise.all([import("./editor.js"), c()]);
        if (t.ended) return;
        d === "audio" ? m.showAudioManager(e.id, e) : (s = new m.GameEditor(t.container, e, n), await new Promise((f) => requestAnimationFrame(f)), t.ended || s.enterEditMode()), o.textContent = "";
      } catch {
        t.ended || (o.textContent = "לֹא הִצְלַחְנוּ לִטְעֹן אֶת הָעוֹרֵךְ. הִתְחַבְּרוּ לָרֶשֶׁת וְנַסּוּ שׁוּב.");
      } finally {
        i = !1;
      }
    }
  }
  for (const [d, m] of [["✏️ ערוך", "edit"], ["🎤 קול", "audio"]]) {
    const f = document.createElement("button");
    f.className = "btn", f.textContent = d, f.addEventListener("click", () => {
      l(m);
    }), r.appendChild(f);
  }
  r.appendChild(o), a.appendChild(r), t.on("end", () => {
    s == null || s.destroy(), r.remove();
  });
}
const ce = /* @__PURE__ */ new WeakMap();
async function Vt(t, e) {
  Fe(t);
  const n = {};
  if (ce.set(t, n), It(), qt(t, e.loadingMessage ?? "טוֹעֵן..."), await mt(e.preloadTexts ?? []), ce.get(t) !== n)
    return { shell: null, activeRounds: [], gameData: null, aborted: !0 };
  if (e.onBeforeHide && (await e.onBeforeHide() === !1 || ce.get(t) !== n))
    return { shell: null, activeRounds: [], gameData: null, aborted: !0 };
  Bt(t);
  const a = e.editor ? Ze(e.gameId) : null, r = a ? a.rounds : e.defaultRounds ?? [], o = new rt(t, {
    totalRounds: e.totalRounds ?? r.length,
    title: e.title,
    gameId: e.gameId
  });
  e.audio !== !1 && Lt(o);
  let i = null;
  if (e.editor) {
    const s = {
      title: e.editor.title ?? e.title,
      type: e.editor.type ?? "multiple-choice"
    };
    i = Je.fromRoundsArray(e.gameId, r, s, e.editor.distractors ?? []), $t(o, i, { restartGame: e.editor.restartGame });
  }
  return { shell: o, activeRounds: r, gameData: i, aborted: !1 };
}
async function Ht(t, e) {
  const n = await Vt(t, e);
  if (n.aborted) return n;
  const { shell: a, activeRounds: r } = n;
  if (!r.length)
    return a.bodyEl.textContent = "אֵין סִבּוּבִים לַמִּשְׂחָק.", a.end(), n;
  const o = zt(a.footerEl, r.length);
  let i = 0, s;
  const c = () => {
    i++, s && s(), s = void 0;
  }, l = Ct(a, t, {
    totalRounds: r.length,
    progressBar: o,
    transitionMs: e.transitionMs,
    playCorrectSound: e.playCorrectSound,
    onReplay: e.onReplay ?? (() => {
      Ht(t, e);
    }),
    buildRoundUI: d
  });
  a.on("end", c), a.on("start", () => {
    var m;
    o.update(0), (m = e.onStart) == null || m.call(e, a), l.reset();
  }), a.on("start", d);
  function d() {
    c(), a.bodyEl.innerHTML = "";
    const m = i, f = () => !a.ended && i === m, g = a.state.currentRound - 1;
    s = e.buildRound({
      shell: a,
      index: g,
      round: r[g],
      isActive: f,
      isAnswered: () => !f() || l.isAnswered(),
      onCorrect: async (h) => {
        f() && await l.handleCorrect(h);
      },
      onWrong: async (h) => {
        f() && await l.handleWrong(h);
      },
      schedule: (h, w) => a.schedule(() => {
        f() && h();
      }, w)
    });
  }
  return a.start(), n;
}
function hn({ hintAfter: t = 2, escalateAfter: e = 4, onHint: n, onEscalate: a } = {}) {
  let r = 0;
  function o(i) {
    return i >= e ? 2 : i >= t ? 1 : 0;
  }
  return {
    /** דיווח על ניסיון שגוי. מפעיל את הקולבק המתאים ומחזיר את הרמה. */
    miss() {
      r++;
      const i = o(r);
      return i === 2 && a ? a(r) : i === 1 && n && n(r), i;
    },
    /** איפוס לקראת סיבוב חדש. */
    reset() {
      r = 0;
    },
    /** רמת העזרה הנוכחית: 0 ללא, 1 רמז עדין, 2 עזרה מוגברת. */
    get level() {
      return o(r);
    },
    /** מספר הניסיונות השגויים בסיבוב הנוכחי. */
    get misses() {
      return r;
    }
  };
}
const qe = {
  a: { F1: 850, F2: 1400 },
  e: { F1: 550, F2: 2100 },
  i: { F1: 350, F2: 2700 },
  o: { F1: 550, F2: 1e3 },
  u: { F1: 350, F2: 850 }
}, pe = {
  kamatz: "a",
  patah: "a",
  tzere: "e",
  segol: "e",
  hiriq: "i",
  holam: "o",
  kubbutz: "u"
};
function Ut(t, e) {
  if (!Number.isFinite(t) || !Number.isFinite(e) || t <= 0 || e <= 0 || e <= t)
    return { vowel: "", confidence: 0 };
  const n = Math.log2(t), a = Math.log2(e), r = [];
  for (const [c, l] of Object.entries(qe)) {
    const d = n - Math.log2(l.F1), m = a - Math.log2(l.F2);
    r.push({ vowel: c, dist: Math.sqrt(d * d + m * m) });
  }
  r.sort((c, l) => c.dist - l.dist);
  const o = r[0], i = r[1], s = i.dist === 0 ? 1 : Math.max(0, Math.min(1, 1 - o.dist / i.dist));
  return { vowel: o.vowel, confidence: s };
}
function pn(t, e) {
  return !t || !e ? !1 : pe[e] === t;
}
function Wt(t, e) {
  const n = t.length, a = Math.max(1, Math.min(e, n)), r = new Float32Array(a);
  for (let s = 0; s < a; s++) {
    let c = 0;
    const l = Math.PI * s / n;
    for (let d = 0; d < n; d++)
      c += t[d] * Math.cos(l * (d + 0.5));
    r[s] = c;
  }
  const o = new Float32Array(n), i = 2 / n;
  for (let s = 0; s < n; s++) {
    let c = r[0] * 0.5;
    for (let l = 1; l < a; l++)
      c += r[l] * Math.cos(Math.PI * l * (s + 0.5) / n);
    o[s] = i * c;
  }
  return o;
}
function jt(t, e) {
  if (!t || t.length === 0 || !Number.isFinite(e) || e <= 0)
    return { F1: 0, F2: 0 };
  const n = Wt(t, 80), a = Math.min(n.length - 3, Math.floor(3500 / e)), r = [];
  for (let l = 3; l <= a; l++) {
    const d = n[l];
    d > n[l - 1] && d > n[l - 2] && d > n[l + 1] && d > n[l + 2] && r.push({ freq: l * e, mag: d });
  }
  if (r.length === 0) return { F1: 0, F2: 0 };
  const o = r.filter((l) => l.freq >= 200 && l.freq <= 1100);
  if (o.length === 0) return { F1: 0, F2: 0 };
  o.sort((l, d) => d.mag - l.mag);
  const i = o[0].freq, s = Math.max(i + 250, 700), c = r.filter((l) => l.freq >= s && l.freq <= 3500);
  return c.length === 0 ? { F1: i, F2: 0 } : (c.sort((l, d) => d.mag - l.mag), { F1: i, F2: c[0].freq });
}
function yn() {
  var l;
  const t = typeof window < "u", e = t && !!((l = navigator == null ? void 0 : navigator.mediaDevices) != null && l.getUserMedia), n = t ? window.AudioContext || window.webkitAudioContext : null, a = e && !!n;
  let r = null, o = null, i = !1;
  const s = () => ({ vowel: "", confidence: 0, F1: 0, F2: 0 }), c = () => {
    if (r)
      for (const d of r.getTracks())
        try {
          d.stop();
        } catch {
        }
    if (o)
      try {
        o.close();
      } catch {
      }
    r = null, o = null;
  };
  return {
    available: a,
    async listen(d = 3e3) {
      if (!a) return s();
      i = !1;
      let m;
      try {
        m = await navigator.mediaDevices.getUserMedia({ audio: !0 });
      } catch {
        return s();
      }
      r = m;
      const f = new n();
      o = f;
      const g = f.createMediaStreamSource(m), h = f.createAnalyser();
      h.fftSize = 4096, h.smoothingTimeConstant = 0.2, g.connect(h);
      const w = f.sampleRate / h.fftSize, N = new Float32Array(h.frequencyBinCount), b = new Float32Array(h.fftSize), A = 0.015, _ = [], $ = performance.now();
      return new Promise((T) => {
        const re = () => {
          if (c(), _.length < 3) {
            T(s());
            return;
          }
          const u = _.map((F) => F.F1).sort((F, ae) => F - ae), p = _.map((F) => F.F2).sort((F, ae) => F - ae), y = Math.floor(_.length / 2), v = u[y], ye = p[y], Qe = Ut(v, ye);
          T({ ...Qe, F1: v, F2: ye });
        }, O = () => {
          if (i) {
            c(), T(s());
            return;
          }
          if (performance.now() - $ > d) {
            re();
            return;
          }
          h.getFloatTimeDomainData(b);
          let u = 0;
          for (let y = 0; y < b.length; y++) u += b[y] * b[y];
          if (Math.sqrt(u / b.length) > A) {
            h.getFloatFrequencyData(N);
            const { F1: y, F2: v } = jt(N, w);
            y > 0 && v > 0 && v > y && _.push({ F1: y, F2: v });
          }
          requestAnimationFrame(O);
        };
        requestAnimationFrame(O);
      });
    },
    cancel() {
      i = !0, c();
    }
  };
}
const Be = 210, $e = 550, Dt = {
  a: { F3: 2700, bandwidths: [90, 110, 170], gains: [1, 0.5, 0.15] },
  e: { F3: 2900, bandwidths: [80, 100, 160], gains: [1, 0.55, 0.2] },
  i: { F3: 3300, bandwidths: [60, 100, 160], gains: [1, 0.6, 0.25] },
  o: { F3: 2600, bandwidths: [80, 90, 150], gains: [1, 0.5, 0.1] },
  u: { F3: 2400, bandwidths: [60, 80, 140], gains: [1, 0.45, 0.1] }
};
function J(t) {
  const e = qe[t], n = Dt[t];
  return !e || !n ? null : {
    formants: [e.F1, e.F2, n.F3],
    bandwidths: [...n.bandwidths],
    gains: [...n.gains]
  };
}
const Ne = {
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
function Ot(t) {
  return Ne[t] ?? Ne[""];
}
function gn() {
  return Te() !== null;
}
let G = null;
function Gt(t) {
  if (G && G.sampleRate === t.sampleRate) return G;
  const e = t.sampleRate, n = t.createBuffer(1, e, t.sampleRate), a = n.getChannelData(0);
  for (let r = 0; r < e; r++) a[r] = Math.random() * 2 - 1;
  return G = n, n;
}
function Ve(t, e, n) {
  const a = t.createOscillator();
  a.type = "sawtooth", a.frequency.value = n;
  const r = t.createGain();
  r.gain.value = 0;
  const o = e.formants.map((i, s) => {
    const c = t.createBiquadFilter();
    c.type = "bandpass", c.frequency.value = i, c.Q.value = i / e.bandwidths[s];
    const l = t.createGain();
    return l.gain.value = e.gains[s], a.connect(c), c.connect(l), l.connect(r), c;
  });
  return r.connect(t.destination), { source: a, filters: o, master: r };
}
function de(t, e, n, a) {
  const r = n.durationMs / 1e3, o = t.createBufferSource();
  o.buffer = Gt(t), o.loop = !0;
  const i = t.createBiquadFilter();
  i.type = "bandpass", i.frequency.value = n.noiseHz ?? 2e3, i.Q.value = n.noiseQ ?? 1;
  const s = t.createGain();
  return s.gain.setValueAtTime(0, e), s.gain.linearRampToValueAtTime(a, e + Math.min(0.01, r / 3)), s.gain.linearRampToValueAtTime(1e-4, e + r), o.connect(i), i.connect(s), s.connect(t.destination), o.start(e), o.stop(e + r + 0.02), e + r;
}
function He(t, e, n, a, r, o) {
  const i = a / 1e3, { source: s, filters: c, master: l } = Ve(t, n, r);
  if (s.frequency.setValueAtTime(r * 1.04, e), s.frequency.linearRampToValueAtTime(r * 0.92, e + i), o) {
    const f = Math.min(0.09, i / 3);
    c.forEach((g, h) => {
      const w = o[h];
      w && (g.frequency.setValueAtTime(w, e), g.frequency.exponentialRampToValueAtTime(n.formants[h], e + f));
    });
  }
  const d = 0.04, m = 0.12;
  return l.gain.setValueAtTime(0, e), l.gain.linearRampToValueAtTime(0.5, e + d), l.gain.setValueAtTime(0.5, e + i - m), l.gain.linearRampToValueAtTime(1e-4, e + i), s.start(e), s.stop(e + i + 0.05), e + i;
}
function Kt(t, e, n, a) {
  const r = n / 1e3, o = { formants: [250, 1100, 2200], bandwidths: [80, 200, 300], gains: [1, 0.12, 0.05] }, { source: i, master: s } = Ve(t, o, a);
  return s.gain.setValueAtTime(0, e), s.gain.linearRampToValueAtTime(0.35, e + 0.02), s.gain.setValueAtTime(0.35, e + r - 0.02), s.gain.linearRampToValueAtTime(1e-4, e + r), i.start(e), i.stop(e + r + 0.05), e + r;
}
function Ue(t, e) {
  const n = Math.max(0, (e - t.currentTime) * 1e3) + 60;
  return new Promise((a) => setTimeout(a, n));
}
async function Qt(t, e = {}) {
  const n = J(t);
  if (!n) return !1;
  const a = await Me();
  if (!a) return !1;
  let r;
  try {
    const o = a.currentTime + 0.03;
    r = He(a, o, n, e.durationMs ?? $e, e.pitchHz ?? Be, null);
  } catch {
    return !1;
  }
  return await Ue(a, r), !0;
}
async function We(t, e, n = {}) {
  const a = J(e);
  if (!a) return !1;
  const r = await Me();
  if (!r) return !1;
  const o = Ot(t), i = n.pitchHz ?? Be, s = n.durationMs ?? $e;
  let c;
  try {
    c = Xt(r, o, t, a, s, i);
  } catch {
    return !1;
  }
  return await Ue(r, c), !0;
}
function Xt(t, e, n, a, r, o) {
  let i = t.currentTime + 0.03, s = null;
  switch (e.type) {
    case "plosive": {
      i = de(t, i, e, e.voiced ? 0.25 : 0.35), i += 0.01;
      break;
    }
    case "fricative": {
      i = de(t, i, e, 0.22) - 0.03;
      break;
    }
    case "affricate": {
      i += 0.03, i = de(t, i, { ...e, durationMs: e.durationMs - 30 }, 0.3) - 0.02;
      break;
    }
    case "nasal": {
      i = Kt(t, i, e.durationMs, o), s = [300, 1300, 2300];
      break;
    }
    case "liquid": {
      s = n === "r" ? [450, 1300, 1600] : [380, 1e3, 2600];
      break;
    }
    case "glide": {
      const c = J(n === "y" ? "i" : "u");
      s = c ? c.formants : null;
      break;
    }
  }
  return He(t, i, a, r, o, s);
}
const ee = "sound-bank";
function je(t) {
  return `letter:${t}`;
}
function De(t) {
  return `nikud:${t}`;
}
function Oe(t, e) {
  return `syllable:${t}:${e}`;
}
function Yt(t) {
  return `word:${t}`;
}
function Ge() {
  const t = [];
  for (const e of q)
    t.push({ key: je(e.letter), label: e.nameNikud, group: "letters" });
  for (const e of k)
    t.push({ key: De(e.id), label: `${e.nameNikud} (${e.sound})`, group: "nikud" });
  for (const e of pt)
    for (const n of k)
      t.push({
        key: Oe(e, n.id),
        label: ze(e, n.symbol),
        group: "syllables"
      });
  return t;
}
function wn(t) {
  const e = Ge().find((a) => a.key === t);
  if (e) return e.label;
  const [, ...n] = t.split(":");
  return n.join(":");
}
function Zt() {
  return typeof navigator < "u" && navigator.onLine === !1;
}
async function te(t) {
  try {
    return typeof indexedDB > "u" ? !1 : await W(ee, t);
  } catch {
    return !1;
  }
}
async function ne(t) {
  if (Zt() && !Jt()) return !1;
  try {
    return await t(), R.audioState !== "failed" && R.audioState !== "unsupported";
  } catch {
    return !1;
  }
}
function Jt() {
  return typeof speechSynthesis < "u";
}
async function bn() {
  try {
    return typeof indexedDB > "u" ? [] : await Ae(ee);
  } catch {
    return [];
  }
}
async function vn(t) {
  if (await te(je(t))) return "bank";
  const e = me(t), n = e ? e.nameNikud : t;
  return await ne(() => R.speak(n)) ? "tts" : e && await We(e.sound, "a", { durationMs: 400 }) ? "synth" : "none";
}
async function kn(t) {
  if (await te(De(t))) return "bank";
  if (await ne(() => R.speakVowel(t))) return "tts";
  const e = pe[t];
  return e && await Qt(e) ? "synth" : "none";
}
async function _n(t, e) {
  if (await te(Oe(t, e))) return "bank";
  const n = k.find((o) => o.id === e);
  if (n && await ne(() => R.speakNikud(t, n.symbol))) return "tts";
  const a = me(t), r = pe[e];
  return r && await We(a ? a.sound : "", r) ? "synth" : "none";
}
async function Sn(t) {
  return await te(Yt(t)) ? "bank" : await ne(() => R.speak(t)) ? "tts" : "none";
}
const xe = "alefbet.ttsProxyUrl";
function en() {
  var o, i;
  if (typeof window > "u") return null;
  const t = new URLSearchParams(window.location.search).get("ttsProxy");
  if (t && window.localStorage)
    try {
      window.localStorage.setItem(xe, t);
    } catch {
    }
  const e = (
    /** @type {any} */
    window.ALEFBET_TTS_PROXY_URL
  ), n = (o = window.localStorage) == null ? void 0 : o.getItem(xe), a = (i = window.localStorage) == null ? void 0 : i.getItem("alefbet.nakdanProxyUrl"), r = t || e || n || a;
  return r ? String(r).replace(/\/+$/, "") : null;
}
function tn(t) {
  const [e, n, a] = t.split(":");
  if (e === "letter") {
    const r = me(n);
    return r ? r.nameNikud : null;
  }
  if (e === "nikud") {
    const r = k.find((o) => o.id === n);
    return r ? r.sound : null;
  }
  if (e === "syllable") {
    const r = k.find((o) => o.id === a);
    return r ? ze(n, r.symbol) : null;
  }
  return e === "word" && t.slice(5) || null;
}
async function nn(t, e) {
  const n = await fetch(`${t}/tts?text=${encodeURIComponent(e)}&lang=he`);
  if (!n.ok) throw new Error(`tts-proxy ${n.status}`);
  const a = await n.blob();
  if (!a || a.size === 0) throw new Error("empty-audio");
  return a;
}
async function En({ force: t = !1, extraTexts: e = [], onProgress: n } = {}) {
  const a = en();
  if (!a)
    throw new Error("tts-proxy-not-configured: הגדירו כתובת דרך ?ttsProxy=... או window.ALEFBET_TTS_PROXY_URL");
  if (typeof indexedDB > "u")
    throw new Error("indexeddb-unavailable: אין אחסון מקומי לשמירת הצלילים");
  const r = [
    ...Ge().map((c) => c.key),
    ...e.filter((c) => c == null ? void 0 : c.trim()).map((c) => `word:${c}`)
  ], o = new Set(t ? [] : await Ae(ee).catch(() => [])), i = { total: r.length, compiled: 0, skipped: 0, failures: [] };
  let s = 0;
  for (const c of r) {
    if (s++, o.has(c)) {
      i.skipped++, n == null || n(s, r.length, c);
      continue;
    }
    const l = tn(c);
    if (!l) {
      i.failures.push({ key: c, reason: "unknown-key" }), n == null || n(s, r.length, c);
      continue;
    }
    try {
      const d = await nn(a, l);
      await et(ee, c, d), i.compiled++;
    } catch (d) {
      i.failures.push({ key: c, reason: (d == null ? void 0 : d.message) || "fetch-failed" });
    }
    n == null || n(s, r.length, c);
  }
  return i;
}
const Le = [
  "כָּל הַכָּבוֹד",
  "מְצֻיָּן",
  "יֹפִי",
  "נֶהְדָּר",
  "וָאוּ",
  "אֵיזֶה כֵּיף"
], Re = [
  "נַסּוּ שׁוּב, אַתֶּם יְכוֹלִים",
  "כִּמְעַט! הַקְשִׁיבוּ שׁוּב",
  "עוֹד נִסָּיוֹן קָטָן",
  "קְרוֹבִים מְאֹד"
];
function rn() {
  return Le[Math.floor(Math.random() * Le.length)];
}
function Nn() {
  return Re[Math.floor(Math.random() * Re.length)];
}
function xn(t, e, n) {
  t.innerHTML = "";
  const a = document.createElement("div");
  a.className = "option-cards-grid";
  const r = e.map((o) => {
    const i = document.createElement("button");
    return i.className = "option-card", i.dataset.id = o.id, i.innerHTML = `
      <span class="option-card__emoji">${o.emoji || ""}</span>
      <span class="option-card__text">${o.text}</span>
    `, i.addEventListener("click", () => {
      i.disabled || n(o);
    }), a.appendChild(i), { el: i, option: o };
  });
  return t.appendChild(a), {
    /** הַדָּגֵשׁ כַּרְטִיס לְפִי סוּג: 'correct' | 'wrong' | 'hint' */
    highlight(o, i) {
      r.forEach(({ el: s, option: c }) => {
        c.id === o && s.classList.add(`option-card--${i}`);
      });
    },
    /** נטרל את כל הכרטיסים */
    disable() {
      r.forEach(({ el: o }) => {
        o.disabled = !0;
      });
    },
    /** אפס את מצב הכרטיסים */
    reset() {
      r.forEach(({ el: o }) => {
        o.className = "option-card", o.disabled = !1;
      });
    },
    /** הסר את הרכיב */
    destroy() {
      t.innerHTML = "";
    }
  };
}
function Ln(t) {
  const e = document.createElement("div");
  e.className = "feedback-message", e.setAttribute("aria-live", "polite"), e.setAttribute("role", "status"), t.appendChild(e);
  let n = null;
  function a(r, o, i = 1800) {
    clearTimeout(n), e.textContent = r, e.className = `feedback-message feedback-message--${o}`, n = setTimeout(() => {
      e.textContent = "", e.className = "feedback-message";
    }, i);
  }
  return {
    /** הצג משוב חיובי - טקסט מפורש, או ביטוי שבח אקראי אם לא סופק */
    correct(r) {
      Z.correct(), a(r ?? `!${rn()}`, "correct"), X(e, "bounce");
    },
    /** הצג עידוד — נסה שוב */
    wrong(r = "נַסֵּה שׁוּב") {
      Z.wrong(), a(r, "wrong"), X(e, "pulse");
    },
    /** הצג רמז */
    hint(r) {
      a(r, "hint"), X(e, "pulse");
    },
    /** הסר את הרכיב */
    destroy() {
      clearTimeout(n), e.remove();
    }
  };
}
function Rn(t, e) {
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
  const a = new URLSearchParams(window.location.search), r = a.get("allowedNikud") ? a.get("allowedNikud").split(",") : [];
  let o = `
    <div style="background:white; padding:1.5rem; border-radius:1rem; min-width:300px; text-align:center; color:#333; font-family:Heebo,Arial; direction:rtl;">
      <h2 style="margin-top:0">בחר ניקוד</h2>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; margin:1rem 0; text-align:right;">
  `;
  k.forEach((l) => {
    const d = r.length === 0 || r.includes(l.id) || r.includes(l.name);
    o += `
      <label style="display:flex; align-items:center; gap:0.5rem; cursor:pointer;">
        <input type="checkbox" value="${l.id}" class="nikud-filter-cb" ${d ? "checked" : ""} style="width:1.2rem;height:1.2rem;">
        <span>${l.nameNikud}</span>
      </label>
    `;
  });
  const i = parseFloat(localStorage.getItem("alefbet.nikudRate")) || 0.5;
  o += `
      </div>
      <div style="margin:1rem 0; text-align:right;">
        <label style="font-weight:700; font-size:0.95rem;">מהירות הגייה: <span id="nikud-rate-val">${i}</span></label>
        <input type="range" id="nikud-rate-slider" min="0.3" max="1.5" step="0.1" value="${i}" style="width:100%; margin-top:0.3rem; accent-color:#4f67ff;">
        <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:#888;">
          <span>אִטִּי</span>
          <span>מָהִיר</span>
        </div>
      </div>
      <button id="save-settings-btn" style="padding:0.5rem 1rem; border-radius:0.5rem; background:#4f67ff; color:white; border:none; font-size:1.1rem; cursor:pointer;">שמור והתחל מחדש</button>
      <button id="close-settings-btn" style="padding:0.5rem 1rem; border-radius:0.5rem; background:#ddd; color:#333; border:none; font-size:1.1rem; cursor:pointer; margin-right:0.5rem;">ביטול</button>
    </div>
  `, n.innerHTML = o, n.style.display = "flex";
  const s = (
    /** @type {HTMLInputElement} */
    document.getElementById("nikud-rate-slider")
  ), c = document.getElementById("nikud-rate-val");
  s.oninput = () => {
    c.textContent = s.value;
  }, document.getElementById("save-settings-btn").onclick = () => {
    const l = parseFloat(s.value);
    localStorage.setItem("alefbet.nikudRate", String(l)), R.setNikudEmphasis({ rate: l });
    const d = Array.from(n.querySelectorAll(".nikud-filter-cb")).filter((f) => (
      /** @type {HTMLInputElement} */
      f.checked
    )).map((f) => (
      /** @type {HTMLInputElement} */
      f.value
    )), m = new URL(window.location.href);
    d.length > 0 && d.length < k.length ? m.searchParams.set("allowedNikud", d.join(",")) : m.searchParams.delete("allowedNikud"), m.searchParams.delete("excludedNikud"), n.style.display = "none", window.history.replaceState({}, "", m), e && e(t);
  }, document.getElementById("close-settings-btn").onclick = () => {
    n.style.display = "none";
  };
}
function Tn(t) {
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
    highlight(a) {
      e.classList.remove("ab-zone--correct", "ab-zone--hover"), a && e.classList.add(`ab-zone--${a}`);
    },
    reset() {
      e.classList.remove("ab-zone--correct", "ab-zone--hover");
    },
    destroy() {
      e.removeEventListener("click", n);
    }
  };
}
function an(t, e, n, a, r) {
  return t.map((o) => {
    const i = a > 0 ? (o.x - e) / a * 100 : 0, s = r > 0 ? (o.y - n) / r * 100 : 0;
    return `${i},${s}`;
  }).join(" ");
}
function Mn(t, e) {
  const {
    image: n,
    zones: a = [],
    mode: r = "quiz",
    gameId: o,
    roundId: i,
    onCorrect: s,
    onWrong: c,
    onAllCorrect: l,
    onZoneTap: d,
    showZones: m = !1,
    autoPlayInstruction: f = !0,
    hintAfter: g = 3
  } = e, h = r === "soundboard", w = document.createElement("div");
  w.className = "ab-zp-wrap";
  const N = document.createElement("img");
  N.className = "ab-zp-image", N.src = n, N.alt = "", N.draggable = !1, w.appendChild(N);
  const b = document.createElement("div");
  b.className = "ab-zp-layer", w.appendChild(b), t.appendChild(w);
  const A = /* @__PURE__ */ new Set();
  let _ = 0, $ = !1, T = !1;
  async function re(u) {
    if (!(!o || $)) {
      $ = !0;
      try {
        await W(o, `zone-${u}`);
      } catch {
      }
      $ = !1;
    }
  }
  function O() {
    if (T || g <= 0 || h || _ < g) return;
    T = !0;
    const u = b.querySelectorAll(".ab-zp-zone");
    u.forEach((p, y) => {
      var v;
      (v = a[y]) != null && v.correct && !A.has(a[y].id) && p.classList.add("ab-zp-zone--hint");
    }), setTimeout(() => {
      u.forEach((p) => p.classList.remove("ab-zp-zone--hint")), T = !1, _ = 0;
    }, 1500);
  }
  return a.forEach((u) => {
    const p = document.createElement("button");
    if (p.className = "ab-zp-zone", (m || h) && p.classList.add("ab-zp-zone--visible"), h && p.classList.add("ab-zp-zone--soundboard"), p.style.left = `${u.x}%`, p.style.top = `${u.y}%`, p.style.width = `${u.width}%`, p.style.height = `${u.height}%`, p.setAttribute("aria-label", u.label || (u.correct ? "correct zone" : "zone")), u.shape === "polygon" && u.points && u.points.length >= 3) {
      const y = `zp-clip-${u.id}`;
      p.innerHTML = `<svg class="ab-zp-zone__poly-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs><clipPath id="${y}"><polygon points="${an(u.points, u.x, u.y, u.width, u.height)}"/></clipPath></defs>
        <rect x="0" y="0" width="100" height="100" clip-path="url(#${y})" fill="transparent"/>
      </svg>`, p.classList.add("ab-zp-zone--poly");
    }
    if (h && u.label) {
      const y = document.createElement("span");
      y.className = "ab-zp-zone__label", y.textContent = u.label, p.appendChild(y);
    }
    p.addEventListener("click", () => {
      if (d && d(u), re(u.id), h) {
        p.classList.add("ab-zp-zone--tapped"), setTimeout(() => p.classList.remove("ab-zp-zone--tapped"), 400);
        return;
      }
      if (!A.has(u.id))
        if (u.correct) {
          A.add(u.id), p.classList.add("ab-zp-zone--correct"), s && s(u);
          const y = a.filter((v) => v.correct).length;
          A.size >= y && l && l();
        } else
          p.classList.add("ab-zp-zone--wrong"), _++, c && c(u), setTimeout(() => p.classList.remove("ab-zp-zone--wrong"), 600), O();
    }), b.appendChild(p);
  }), f && o && i && setTimeout(() => {
    W(o, i).catch(() => {
    });
  }, 400), {
    async playInstruction() {
      return o && i ? W(o, i) : !1;
    },
    async playZoneAudio(u) {
      return o ? W(o, `zone-${u}`) : !1;
    },
    revealCorrect() {
      b.querySelectorAll(".ab-zp-zone").forEach((u, p) => {
        var y;
        (y = a[p]) != null && y.correct && u.classList.add("ab-zp-zone--revealed");
      });
    },
    reset() {
      A.clear(), _ = 0, T = !1, b.querySelectorAll(".ab-zp-zone").forEach((u) => {
        u.classList.remove(
          "ab-zp-zone--correct",
          "ab-zp-zone--wrong",
          "ab-zp-zone--revealed",
          "ab-zp-zone--tapped",
          "ab-zp-zone--hint"
        );
      });
    },
    destroy() {
      w.remove();
    }
  };
}
function An(t, e, n, a) {
  const r = t.querySelector(".game-header__spacer");
  if (!r) return null;
  const o = document.createElement("button");
  return o.className = "ab-header-btn", o.setAttribute("aria-label", n), o.textContent = e, o.onclick = a, r.innerHTML = "", r.appendChild(o), o;
}
const on = "0 0 32 16", Ke = {
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
function sn(t) {
  const e = Ke[t];
  return e ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${on}" aria-hidden="true" focusable="false">${e}</svg>` : null;
}
const Fn = Object.freeze(Object.keys(Ke));
function Cn(t, { size: e = "md" } = {}) {
  const n = document.createElement("div");
  n.className = `ab-nikud-box ab-nikud-box--${e} ab-nikud-box--${t.id}`;
  const a = document.createElement("div");
  a.className = "ab-nikud-box__box";
  const r = document.createElement("div");
  return r.className = "ab-nikud-box__mark", r.innerHTML = sn(t.id) ?? "", n.appendChild(a), n.appendChild(r), n;
}
export {
  tt as EventBus,
  rt as GameShell,
  nt as GameState,
  Fn as NIKUD_GLYPH_IDS,
  pe as NIKUD_VOWEL,
  Le as PRAISE_PHRASES,
  Re as RETRY_HINTS,
  ee as SOUND_BANK_ID,
  qe as VOWEL_TEMPLATES,
  ut as addNikud,
  X as animate,
  Lt as attachGameAudio,
  Vt as bootstrapGame,
  Ut as classifyFormants,
  En as compileSoundBank,
  tn as compileTextForKey,
  Ot as consonantOnsetSpec,
  In as createDragSource,
  qn as createDropTarget,
  Ln as createFeedback,
  hn as createHintTracker,
  Ye as createLocalState,
  Cn as createNikudBox,
  xn as createOptionCards,
  zt as createProgressBar,
  Ct as createRoundManager,
  Bn as createVoiceRecordButton,
  $n as createVoiceRecorder,
  yn as createVowelDetector,
  Tn as createZone,
  Mn as createZonePlayer,
  Vn as deleteVoice,
  Fe as endGame,
  Me as ensureAudioRunning,
  jt as extractFormantsFromSpectrum,
  mn as getAllProgress,
  Te as getAudioContext,
  fn as getGameProgress,
  me as getLetter,
  ht as getLettersByGroup,
  ft as getNikud,
  Hn as hasVoice,
  q as hebrewLetters,
  Bt as hideLoadingScreen,
  An as injectHeaderButton,
  It as installGlobalErrorScreen,
  Zt as isOffline,
  gn as isSynthSupported,
  Un as isVoiceRecordingSupported,
  st as isVowelized,
  wn as keyLabel,
  je as letterKey,
  ze as letterWithNikud,
  Ae as listVoiceKeys,
  Wn as loadVoice,
  pn as matchNikudVowel,
  xt as mountAudioStatusBanner,
  pt as nikudBaseLetters,
  sn as nikudGlyphSvg,
  De as nikudKey,
  k as nikudList,
  jn as playBlob,
  W as playVoice,
  mt as preloadNikud,
  cn as randomLetters,
  dn as randomNikud,
  rn as randomPraise,
  Nn as randomRetryHint,
  At as recordGameResult,
  bn as recordedKeys,
  en as resolveTtsProxyUrl,
  Ht as runGame,
  et as saveVoice,
  Ft as showCompletionScreen,
  qt as showLoadingScreen,
  Rn as showNikudSettingsDialog,
  un as shuffle,
  Z as sounds,
  vn as speakLetter,
  kn as speakNikudSound,
  _n as speakSyllable,
  Sn as speakWord,
  Ge as standardSoundKeys,
  Ie as starsFor,
  Oe as syllableKey,
  We as synthesizeSyllable,
  Qt as synthesizeVowel,
  R as tts,
  Xe as unlockAudioOutput,
  J as vowelFormantSpec,
  Yt as wordKey
};
