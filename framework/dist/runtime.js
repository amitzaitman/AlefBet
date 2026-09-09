import { u as Ze, g as Me, c as Je, l as et, G as tt, e as Ce, a as ze, p as V, s as nt } from "./drag-BVpjy2vl.js";
import { b as Bn, d as Un, f as Vn, h as Wn, i as Hn, j as jn, k as Dn, m as On, n as Gn } from "./drag-BVpjy2vl.js";
class rt {
  constructor() {
    this._handlers = {};
  }
  /** הירשם לאירוע */
  on(e, n) {
    return this._handlers[e] || (this._handlers[e] = []), this._handlers[e].push(n), this;
  }
  /** בטל הרשמה לאירוע */
  off(e, n) {
    return this._handlers[e] ? (this._handlers[e] = this._handlers[e].filter((r) => r !== n), this) : this;
  }
  /** שלח אירוע */
  emit(e, n) {
    return (this._handlers[e] || []).slice().forEach((r) => r(n)), this;
  }
}
class at {
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
const Z = /* @__PURE__ */ new WeakMap();
function Pe(t) {
  var e;
  (e = Z.get(t)) == null || e.end();
}
class it {
  /**
   * @param {HTMLElement} containerEl - אלמנט המיכל
   * @param {object} config - הגדרות: { totalRounds, title, homeUrl }
   */
  constructor(e, n = {}) {
    Pe(e), Z.set(e, this), this.ended = !1, this._timers = /* @__PURE__ */ new Set(), this.container = e, this.config = {
      totalRounds: 8,
      title: "מִשְׂחָק",
      homeUrl: "../../index.html",
      ...n
    }, this.events = new rt(), this.state = new at(this.config.totalRounds), this.gameId = typeof n.gameId == "string" ? n.gameId : "", this._buildShell();
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
      this._timers.clear(), Z.get(this.container) === this && Z.delete(this.container), this.events.emit("end", { score: e, state: this.state });
    }
  }
  /** פעולה מושהית מתבטלת אוטומטית בסיום או בהפעלה מחדש. */
  schedule(e, n) {
    if (this.ended) return;
    const r = setTimeout(() => {
      this._timers.delete(r), this.ended || e();
    }, n);
    this._timers.add(r);
  }
  /** המתנה מתבטלת בסיום; false אומר שאין להמשיך בפעולה. */
  delay(e) {
    return new Promise((n) => {
      if (this.ended) {
        n(!1);
        return;
      }
      const r = () => n(!1);
      this.events.on("end", r), this.schedule(() => {
        this.events.off("end", r), n(!0);
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
const ve = "https://nakdan-u1-0.loadbalancer.dicta.org.il/api";
let ke = !1;
const ot = 4e3, Ie = "alefbet.nikudCache.v1", st = 300, M = /* @__PURE__ */ new Map();
(function() {
  if (!(typeof localStorage > "u"))
    try {
      const e = localStorage.getItem(Ie);
      if (!e) return;
      const n = JSON.parse(e);
      if (Array.isArray(n))
        for (const [r, a] of n)
          typeof r == "string" && typeof a == "string" && M.set(r, a);
    } catch {
    }
})();
function lt() {
  if (!(typeof localStorage > "u"))
    try {
      const t = [...M.entries()].filter(([e, n]) => n !== e).slice(-st);
      localStorage.setItem(Ie, JSON.stringify(t));
    } catch {
    }
}
function ct(t) {
  if (!t) return !1;
  const e = t.split(/\s+/).filter((r) => /[א-ת]/.test(r));
  return e.length === 0 ? !0 : e.filter((r) => /[\u05B0-\u05BC\u05C1\u05C2\u05C7]/.test(r)).length / e.length >= 0.8;
}
function dt() {
  var a;
  if (typeof window > "u") return ve;
  const t = new URLSearchParams(window.location.search).get("nakdanProxy"), e = window.ALEFBET_NAKDAN_PROXY_URL;
  if (t && window.localStorage)
    try {
      window.localStorage.setItem("alefbet.nakdanProxyUrl", t);
    } catch {
    }
  const n = (a = window.localStorage) == null ? void 0 : a.getItem("alefbet.nakdanProxyUrl"), r = t || e || n;
  return r || (window.location.hostname.endsWith("github.io") ? null : ve);
}
function ut(t) {
  var n;
  let e = "";
  for (const r of t)
    if (r.sep)
      e += r.str ?? "";
    else {
      const a = (n = r.nakdan) == null ? void 0 : n.options;
      a != null && a.length ? e += (a[0].w ?? "").replace(/\|/g, "").replace(/\u05BD/g, "") : e += r.str ?? "";
    }
  return e;
}
async function ft(t) {
  const e = dt();
  if (!e)
    throw ke || (ke = !0, console.warn("[nakdan] Dicta API blocked by CORS on GitHub Pages. Configure a proxy URL via ?nakdanProxy=..., window.ALEFBET_NAKDAN_PROXY_URL, or localStorage key alefbet.nakdanProxyUrl.")), new Error("Nakdan unavailable without proxy on this host");
  const n = typeof AbortController < "u" ? new AbortController() : null, r = n ? setTimeout(() => n.abort(), ot) : null;
  let a;
  try {
    a = await fetch(e, {
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
    r && clearTimeout(r);
  }
  if (!a.ok) throw new Error(`Nakdan ${a.status}`);
  const i = await a.json(), o = i == null ? void 0 : i.data;
  if (!Array.isArray(o)) throw new Error("Nakdan: invalid response");
  return ut(o);
}
async function mt(t) {
  if (!(t != null && t.trim())) return t ?? "";
  if (M.has(t)) return M.get(t);
  if (ct(t))
    return M.set(t, t), t;
  if (typeof navigator < "u" && navigator.onLine === !1)
    return t;
  try {
    const e = await ft(t);
    return M.set(t, e), lt(), e;
  } catch {
    return M.set(t, t), t;
  }
}
function ht(t) {
  return M.get(t) ?? t ?? "";
}
async function pt(t) {
  const e = [...new Set(t.filter((n) => n == null ? void 0 : n.trim()))];
  await Promise.all(e.map((n) => mt(n)));
}
const H = [
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
function be(t) {
  return H.find((e) => e.letter === t) || null;
}
function yt(t = "regular") {
  return t === "regular" ? H.filter((e) => !e.isFinal) : t === "final" ? H.filter((e) => e.isFinal) : H;
}
function fn(t, e = "regular") {
  const n = yt(e);
  return [...n].sort(() => Math.random() - 0.5).slice(0, Math.min(t, n.length));
}
const N = [
  { id: "kamatz", name: "קָמָץ", nameNikud: "קָמָץ", symbol: "ָ", sound: "אָה", color: "#C9442C", textColor: "#fff" },
  { id: "patah", name: "פָּתַח", nameNikud: "פָּתַח", symbol: "ַ", sound: "אָה", color: "#C58119", textColor: "#fff" },
  { id: "hiriq", name: "חִירִיק", nameNikud: "חִירִיק", symbol: "ִ", sound: "אִי", color: "#2A7B71", textColor: "#fff" },
  { id: "tzere", name: "צֵרֶה", nameNikud: "צֵרֶה", symbol: "ֵ", sound: "אֶה", color: "#4A6B8C", textColor: "#fff" },
  { id: "segol", name: "סְגוֹל", nameNikud: "סְגוֹל", symbol: "ֶ", sound: "אֶה", color: "#783952", textColor: "#fff" },
  { id: "holam", name: "חוֹלָם", nameNikud: "חוֹלָם", symbol: "ֹ", sound: "אוֹ", color: "#5F7A42", textColor: "#fff" },
  { id: "kubbutz", name: "קֻבּוּץ", nameNikud: "קֻבּוּץ", symbol: "ֻ", sound: "אוּ", color: "#6B4A8A", textColor: "#fff" }
], bt = H.filter((t) => !t.isFinal).map((t) => t.letter);
function $e(t, e) {
  return t + e;
}
function mn(t) {
  let e = [...N];
  if (typeof window < "u" && window.location && window.location.search) {
    const r = new URLSearchParams(window.location.search), a = r.get("allowedNikud");
    if (a) {
      const o = a.split(",").map((s) => s.trim());
      e = e.filter(
        (s) => o.includes(s.id) || o.includes(s.name) || o.includes(s.nameNikud)
      );
    }
    const i = r.get("excludedNikud");
    if (i) {
      const o = i.split(",").map((s) => s.trim());
      e = e.filter(
        (s) => !o.includes(s.id) && !o.includes(s.name) && !o.includes(s.nameNikud)
      );
    }
  }
  e.length === 0 && (e = [...N]);
  let n = [...e];
  for (; n.length < t; )
    n.push(...e);
  return n.sort(() => Math.random() - 0.5).slice(0, t);
}
const gt = 2e3;
let F = [], K = !1, W = 0.9, le = typeof localStorage < "u" && parseFloat(localStorage.getItem("alefbet.nikudRate")) || 0.5, J = !1, D = null, $ = null, T = null, qe = null, Q = !1, L = "idle";
function ne() {
  return typeof speechSynthesis < "u";
}
function x(t, e, n = !1) {
  if (L === t && !n) return;
  const r = L;
  if (L = t, typeof window < "u" && typeof window.dispatchEvent == "function") {
    const a = { state: t, previousState: r };
    e && (a.reason = e), window.dispatchEvent(new CustomEvent("alefbet:tts-state", { detail: a }));
  }
}
function wt() {
  ne() ? L = "idle" : x("unsupported", "no-speech-synthesis");
}
wt();
function he(t, e) {
  qe = String(e || "unknown"), console.warn("[tts] browser TTS failed", { text: t, reason: e }), typeof window < "u" && typeof window.dispatchEvent == "function" && window.dispatchEvent(new CustomEvent("alefbet:tts-error", {
    detail: { provider: "browser", text: t, sentText: t, reason: e }
  }));
}
function vt(t) {
  const e = String(t).toLowerCase();
  return e.includes("not-allowed") || e.includes("notallowed") || e.includes("didn't interact") || e.includes("user gesture");
}
function kt() {
  var t;
  return typeof window > "u" || typeof document > "u" ? Promise.resolve() : J || (t = document.userActivation) != null && t.hasBeenActive ? (J = !0, Promise.resolve()) : D || (D = new Promise((e) => {
    const n = () => {
      J = !0, window.removeEventListener("pointerdown", n, !0), window.removeEventListener("keydown", n, !0), window.removeEventListener("touchstart", n, !0), e();
    };
    window.addEventListener("pointerdown", n, { once: !0, capture: !0 }), window.addEventListener("keydown", n, { once: !0, capture: !0 }), window.addEventListener("touchstart", n, { once: !0, capture: !0 });
  }).finally(() => {
    D = null;
  }), D);
}
let I = null, O = null, ce = !1, _e = !1;
const _t = ["carmit", "hila", "female"];
function St(t) {
  const e = (t.name || "").toLowerCase();
  return _t.some((n) => e.includes(n));
}
function de() {
  if (typeof speechSynthesis > "u") return null;
  const e = speechSynthesis.getVoices().filter(
    (i) => i.lang === "he-IL" || i.lang === "iw-IL" || (i.lang || "").startsWith("he")
  );
  if (e.length === 0) return null;
  const r = typeof navigator < "u" && navigator.onLine === !1 && e.filter((i) => i.localService !== !1) || e, a = r.length > 0 ? r : e;
  return a.find(St) || a[0];
}
function Et() {
  return typeof speechSynthesis > "u" ? Promise.resolve() : (I = de(), I ? (ce = !0, Promise.resolve()) : ce ? Promise.resolve() : O || (O = new Promise((t) => {
    let e = !1;
    const n = () => {
      e || (e = !0, ce = !0, I = de(), typeof speechSynthesis < "u" && typeof speechSynthesis.removeEventListener == "function" && speechSynthesis.removeEventListener("voiceschanged", r), clearTimeout(a), t());
    }, r = () => {
      I = de(), I && n();
    };
    typeof speechSynthesis.addEventListener == "function" && speechSynthesis.addEventListener("voiceschanged", r);
    const a = setTimeout(() => {
      _e || (_e = !0, he("", "voice-load-timeout")), n();
    }, gt);
  }).finally(() => {
    O = null;
  }), O));
}
function Nt(t) {
  return 5e3 + ((t == null ? void 0 : t.length) ?? 0) * 200;
}
function Se(t) {
  return new Promise((e, n) => {
    if (typeof SpeechSynthesisUtterance > "u") {
      n(new Error("SpeechSynthesisUtterance unavailable"));
      return;
    }
    try {
      const r = new SpeechSynthesisUtterance(t);
      r.lang = "he-IL", r.rate = W, I && (r.voice = I), T = r;
      let a = !1;
      const i = setTimeout(() => {
        if (!a) {
          a = !0, T === r && (T = null);
          try {
            speechSynthesis.cancel();
          } catch {
          }
          n(new Error("utterance-timeout"));
        }
      }, Nt(t));
      r.onend = () => {
        a || (a = !0, clearTimeout(i), T === r && (T = null), e());
      }, r.onerror = (o) => {
        a || (a = !0, clearTimeout(i), T === r && (T = null), n(new Error(String(o && o.error || "speech-error"))));
      }, speechSynthesis.speak(r);
    } catch (r) {
      n(r instanceof Error ? r : new Error(String(r)));
    }
  });
}
async function Lt(t) {
  if (typeof speechSynthesis > "u")
    return { ok: !1, reason: "speechSynthesis unavailable" };
  await Et();
  try {
    return await Se(t), Q = !1, { ok: !0 };
  } catch (e) {
    const n = (e == null ? void 0 : e.message) || "speech-error";
    if (vt(n)) {
      Q || (Q = !0, x("awaiting-interaction", "autoplay-blocked")), await kt(), Q = !1;
      try {
        return await Se(t), { ok: !0 };
      } catch (r) {
        const a = (r == null ? void 0 : r.message) || "speech-error";
        return he(t, a), { ok: !1, reason: a };
      }
    }
    return he(t, n), { ok: !1, reason: n };
  }
}
function j() {
  if (K || F.length === 0) return;
  const t = F.shift();
  K = !0, $ = t;
  const e = W, n = typeof t.rate == "number";
  n && (W = t.rate), Lt(t.text).then((r) => {
    n && (W = e), K = !1;
    const a = $ === t;
    if ($ = null, !a) {
      j();
      return;
    }
    r.ok ? L !== "unsupported" && x("ready") : ne() ? x("failed", r.reason, !0) : x("unsupported", r.reason || "no-provider", !0), t.resolve(), j();
  }).catch((r) => {
    n && (W = e), K = !1, $ = null, x("failed", (r == null ? void 0 : r.message) || "unknown"), t.resolve(), j();
  });
}
const A = {
  /**
   * הקרא טקסט עברי. ה-promise תמיד נפתר (גם בכשל) כדי שמשחקים לא יתקעו.
   * @param {string} text
   * @returns {Promise<void>}
   */
  speak(t) {
    const e = ht(t);
    return new Promise((n) => {
      F.push({ text: e, resolve: n }), j();
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
    if ($) {
      try {
        $.resolve();
      } catch {
      }
      $ = null;
    }
    if (F.forEach((t) => {
      try {
        t.resolve();
      } catch {
      }
    }), F = [], K = !1, T && (T = null), typeof speechSynthesis < "u" && typeof speechSynthesis.cancel == "function")
      try {
        speechSynthesis.cancel();
      } catch {
      }
    x("idle", "cancelled");
  },
  /**
   * האם יש יכולת קול מקומית במכשיר.
   */
  get available() {
    return L !== "unsupported" && ne();
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
    return qe;
  },
  /**
   * משחרר ידנית את מנוע הקול אחרי gesture ידוע (כפתור התחל וכו').
   * משחקים יקראו לזה במקום להמתין ל-autoplay block.
   * @returns {Promise<void>}
   */
  unlock() {
    if (J = !0, Q = !1, Ze().catch(() => {
    }), typeof speechSynthesis < "u" && typeof SpeechSynthesisUtterance < "u")
      try {
        const t = new SpeechSynthesisUtterance("");
        t.volume = 0, speechSynthesis.speak(t), speechSynthesis.cancel();
      } catch {
      }
    return L === "awaiting-interaction" && x("ready", "unlocked"), Promise.resolve();
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
    return ne() ? L === "unsupported" && x("idle", "recovered") : x("unsupported", "no-speech-synthesis"), this.available;
  },
  /**
   * הגדר מהירות דיבור (0.5-2.0).
   * @param {number} rate
   */
  setRate(t) {
    W = Math.max(0.5, Math.min(2, t));
  },
  /**
   * הגדר מהירות דיבור להדגשת ניקוד.
   * @param {{ rate?: number }} opts - rate: מהירות הדגשה (ברירת מחדל 0.5).
   */
  setNikudEmphasis({ rate: t } = {}) {
    t != null && (le = Math.max(0.3, Math.min(1.5, t)));
  },
  /**
   * הקרא אות עם ניקוד בשני שלבים: קודם את ההברה בקצב טבעי כדי שהעיצור יהיה קצר,
   * ואז את צליל התנועה לבד בקצב האיטי שמיועד לניקוד - כך הילד שומע
   * "מ-אההההה" במקום "ממממ-אה" שמתקבל מהאטה אחידה של ההברה כולה.
   * @param {string} letter - האות (למשל 'ב').
   * @param {string} nikudSymbol - סמל הניקוד (למשל U+05B7).
   */
  speakNikud(t, e) {
    const n = t + e, r = N.find((a) => a.symbol === e);
    return new Promise((a) => {
      r && r.sound ? (F.push({ text: n, resolve: () => {
      } }), F.push({
        text: r.sound,
        rate: le,
        resolve: () => a(void 0)
      })) : F.push({ text: n, resolve: () => a(void 0) }), j();
    });
  },
  /**
   * הקרא את צליל התנועה של הניקוד ("אָה", "אוֹ" וכו'),
   * כדי להדגים לילד מה להגות.
   * @param {string} nikudId - מזהה ניקוד מתוך nikudList (למשל 'kamatz').
   */
  speakVowel(t) {
    const e = N.find((n) => n.id === t);
    return !e || !e.sound ? Promise.resolve() : new Promise((n) => {
      F.push({
        text: e.sound,
        rate: le,
        resolve: () => n(void 0)
      }), j();
    });
  }
}, Ee = "alefbet-audio-status-banner";
function xt(t) {
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
function At(t = typeof document < "u" ? document.body : null, e = {}) {
  const n = e.window || (typeof window < "u" ? window : null);
  if (!t || !n)
    return { destroy() {
    } };
  const r = t.querySelector("#" + Ee);
  r && r.parentNode && r.parentNode.removeChild(r);
  const a = t.ownerDocument.createElement("div");
  a.id = Ee, a.className = "alefbet-audio-banner", a.setAttribute("role", "status"), a.setAttribute("aria-live", "polite"), a.dir = "rtl", a.hidden = !0;
  const i = t.ownerDocument.createElement("span");
  i.className = "alefbet-audio-banner__msg", a.appendChild(i);
  const o = t.ownerDocument.createElement("button");
  o.type = "button", o.className = "alefbet-audio-banner__dismiss", o.setAttribute("aria-label", "סְגוֹר הוֹדָעָה"), o.textContent = "×", o.hidden = !0, a.appendChild(o), t.appendChild(a);
  let s = null;
  function l() {
    s && (clearTimeout(s), s = null);
  }
  function c() {
    l(), a.hidden = !0, a.classList.remove("is-visible", "is-await", "is-unsupported", "is-failed"), a.onclick = null, o.hidden = !0;
  }
  function d(h) {
    const m = xt(h);
    if (!m) {
      c();
      return;
    }
    l(), i.textContent = m.message, a.hidden = !1, a.classList.add("is-visible"), a.classList.toggle("is-await", m.kind === "await"), a.classList.toggle("is-unsupported", m.kind === "unsupported"), a.classList.toggle("is-failed", m.kind === "failed"), m.kind, m.kind === "await" ? (a.onclick = () => {
      try {
        t.ownerDocument.body.dispatchEvent(new MouseEvent("pointerdown", { bubbles: !0 }));
      } catch {
      }
      c();
    }, o.hidden = !0) : m.kind === "unsupported" ? (a.onclick = null, o.hidden = !1, o.onclick = (y) => {
      y.stopPropagation(), c();
    }) : m.kind === "failed" && (a.onclick = null, o.hidden = !0, s = setTimeout(() => c(), 6e3));
  }
  function u(h) {
    const y = /** @type {CustomEvent} */ (h.detail || {}).state;
    if (y === "ready" || y === "idle") {
      c();
      return;
    }
    d(y);
  }
  return n.addEventListener("alefbet:tts-state", u), {
    destroy() {
      n.removeEventListener("alefbet:tts-state", u), l(), a.parentNode && a.parentNode.removeChild(a);
    }
  };
}
function Rt(t, { banner: e = !0 } = {}) {
  const n = e ? At(t.container) : null, r = () => {
    t.container.removeEventListener("pointerdown", r, !0), t.container.removeEventListener("keydown", r, !0), A.unlock();
  };
  t.container.addEventListener("pointerdown", r, { once: !0, capture: !0 }), t.container.addEventListener("keydown", r, { once: !0, capture: !0 }), t.on("end", () => {
    t.container.removeEventListener("pointerdown", r, !0), t.container.removeEventListener("keydown", r, !0), n == null || n.destroy(), A.cancel();
  });
}
function hn(t) {
  const e = [...t];
  for (let n = e.length - 1; n > 0; n--) {
    const r = Math.floor(Math.random() * (n + 1));
    [e[n], e[r]] = [e[r], e[n]];
  }
  return e;
}
function Ft() {
  const t = Me();
  return t ? (t.state === "suspended" && t.resume(), t) : null;
}
function U(t, e, n = "sine", r = 0.3) {
  const a = Ft();
  if (a)
    try {
      const i = a.createOscillator(), o = a.createGain();
      i.connect(o), o.connect(a.destination), i.type = n, i.frequency.setValueAtTime(t, a.currentTime), o.gain.setValueAtTime(r, a.currentTime), o.gain.exponentialRampToValueAtTime(1e-3, a.currentTime + e), i.start(a.currentTime), i.stop(a.currentTime + e + 0.05);
    } catch {
    }
}
const re = {
  /** צליל תשובה נכונה */
  correct() {
    U(523.25, 0.15), setTimeout(() => U(659.25, 0.2), 120), setTimeout(() => U(783.99, 0.3), 240);
  },
  /** צליל עידוד עדין — נסה שוב */
  wrong() {
    U(350, 0.15, "triangle", 0.12);
  },
  /** צליל עידוד - סיום מוצלח */
  cheer() {
    [523.25, 587.33, 659.25, 698.46, 783.99, 1046.5].forEach((e, n) => setTimeout(() => U(e, 0.2), n * 90));
  },
  /** קליק עדין */
  click() {
    U(900, 0.04, "sine", 0.12);
  }
}, Ne = {
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
function ee(t, e) {
  !t || !Ne[e] || t.animate(Ne[e], {
    duration: Tt[e] || 400,
    easing: "ease-in-out",
    fill: "none"
  });
}
const Mt = "alefbet.progress.v1", ge = Je(Mt, {});
function Be(t, e) {
  if (!Number.isFinite(t) || !Number.isFinite(e) || e <= 0) return 1;
  const n = t / e;
  return n >= 0.8 ? 3 : n >= 0.5 ? 2 : 1;
}
function Ct(t, { score: e, total: n }) {
  if (!t || !Number.isFinite(e) || !Number.isFinite(n) || n <= 0) return null;
  const r = Be(e, n);
  let a = null;
  return ge.update((i) => {
    const o = i[t];
    return a = {
      plays: ((o == null ? void 0 : o.plays) ?? 0) + 1,
      bestScore: Math.max((o == null ? void 0 : o.bestScore) ?? 0, e),
      bestStars: Math.max((o == null ? void 0 : o.bestStars) ?? 0, r),
      total: o && (o.bestScore ?? 0) > e ? o.total : n,
      lastPlayed: Date.now()
    }, { ...i, [t]: a };
  }), a;
}
function pn(t) {
  return ge.get()[t] ?? null;
}
function yn() {
  return ge.get();
}
function zt(t, e, n, r, a = {}) {
  re.cheer(), a.gameId && Ct(a.gameId, { score: e, total: n });
  const i = a.completionOnly ? n === 1 ? "הִשְׁלַמְתֶּם מְשִׂימָה!" : `הִשְׁלַמְתֶּם ${n} מְשִׂימוֹת!` : `נִיקּוּד: ${e} מִתּוֹךְ ${n}`, o = Be(e, n), s = "⭐".repeat(o) + "☆".repeat(3 - o), l = document.createElement("div");
  l.className = "completion-screen", l.innerHTML = `
    <div class="completion-screen__content">
      <div class="completion-screen__stars" aria-label="${o} כּוֹכָבִים">${s}</div>
      <h2 class="completion-screen__title">!כָּל הַכָּבוֹד</h2>
      <p class="completion-screen__score">${i}</p>
      <div class="completion-screen__actions">
        <button class="completion-screen__replay btn btn--primary">שַׂחֵק שׁוּב</button>
      </div>
    </div>
  `;
  const c = a.homeUrl === void 0 ? "../../index.html" : a.homeUrl;
  if (c) {
    const d = document.createElement("a");
    d.className = "completion-screen__home btn", d.href = c, d.textContent = "בְּחִירַת מִשְׂחָק", l.querySelector(".completion-screen__actions").appendChild(d);
  }
  l.querySelector(".completion-screen__replay").addEventListener("click", () => {
    l.remove(), r();
  }), t.innerHTML = "", t.appendChild(l), ee(l.querySelector(".completion-screen__content"), "fadeIn");
}
function Pt(t, e, {
  totalRounds: n,
  progressBar: r = null,
  buildRoundUI: a,
  onCorrect: i,
  onWrong: o,
  transitionMs: s = 800,
  playCorrectSound: l = !0,
  completionOnly: c = !1,
  onReplay: d = () => location.reload()
}) {
  let u = !1;
  const h = /* @__PURE__ */ new Set();
  function m(g) {
    u = g || t.ended, h.forEach((_) => _(u));
  }
  function y(g) {
    return h.add(g), g(u || t.ended), () => {
      h.delete(g);
    };
  }
  t.on("end", () => {
    m(!0), h.clear();
  });
  async function b(g) {
    if (u || t.ended) return;
    m(!0), l && re.correct();
    try {
      if (g && await g(), t.ended) return;
      i && await i();
    } catch (S) {
      throw m(!1), S;
    }
    if (t.ended || (t.state.addScore(1), r == null || r.update(t.state.currentRound), !await t.delay(s))) return;
    t.nextRound() ? (m(!1), a()) : zt(e, t.state.score, n, d, { gameId: t.gameId, completionOnly: c, homeUrl: t.config.homeUrl });
  }
  async function k(g) {
    if (!(u || t.ended)) {
      m(!0);
      try {
        g && await g(), !t.ended && o && await o();
      } finally {
        m(!1);
      }
    }
  }
  function w() {
    return u;
  }
  function R() {
    m(!1);
  }
  return { handleCorrect: b, handleWrong: k, isAnswered: w, reset: R, subscribe: y };
}
function te() {
  const t = new AbortController(), e = /* @__PURE__ */ new Set();
  function n(r) {
    t.signal.aborted ? r() : e.add(r);
  }
  return {
    signal: t.signal,
    /** @template {(() => void) | { destroy: () => void }} T @param {T} resource @returns {T} */
    use(r) {
      return n(typeof r == "function" ? r : () => r.destroy()), r;
    },
    /** @param {EventTarget} target @param {string} event @param {EventListener} handler @param {AddEventListenerOptions | boolean} [options] */
    listen(r, a, i, o) {
      t.signal.aborted || (r.addEventListener(a, i, o), n(() => r.removeEventListener(a, i, o)));
    },
    schedule(r, a) {
      if (t.signal.aborted) return () => {
      };
      const i = () => {
        clearTimeout(o), e.delete(i);
      }, o = setTimeout(() => {
        e.delete(i), t.signal.aborted || r();
      }, a);
      return n(i), i;
    },
    dispose() {
      if (t.signal.aborted) return;
      t.abort();
      const r = [...e].reverse();
      e.clear();
      for (const a of r)
        try {
          a();
        } catch (i) {
          console.warn("Round cleanup failed", i);
        }
    }
  };
}
function It(t, e) {
  const n = document.createElement("div");
  n.className = "progress-bar", n.setAttribute("role", "progressbar"), n.setAttribute("aria-valuemin", "0"), n.setAttribute("aria-valuemax", String(e)), n.innerHTML = `
    <div class="progress-bar__track">
      <div class="progress-bar__fill" style="width: 0%"></div>
    </div>
    <span class="progress-bar__label">0 / ${e}</span>
  `, t.appendChild(n);
  const r = (
    /** @type {HTMLElement} */
    n.querySelector(".progress-bar__fill")
  ), a = n.querySelector(".progress-bar__label");
  return {
    /** עדכן את ההתקדמות */
    update(i) {
      const o = Math.round(i / e * 100);
      r.style.width = `${o}%`, a.textContent = `${i} / ${e}`, n.setAttribute("aria-valuenow", String(i));
    },
    /** הסר את הרכיב */
    destroy() {
      n.remove();
    }
  };
}
let ue = !1, pe = !1, G = null;
const $t = [
  "ResizeObserver loop",
  // אזהרת דפדפן שפירה
  "Script error."
  // שגיאת cross-origin אטומה, לרוב תוסף דפדפן
];
function Le(t) {
  const e = String(t || "");
  return $t.some((n) => e.includes(n));
}
function xe() {
  var e;
  if (pe || typeof document > "u" || !document.body) return;
  pe = !0;
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
function qt() {
  if (typeof window > "u") return { destroy() {
  } };
  if (ue) return { destroy() {
  } };
  ue = !0;
  const t = (n) => {
    Le(n == null ? void 0 : n.message) || (console.error("[alefbet] uncaught error:", (n == null ? void 0 : n.error) ?? (n == null ? void 0 : n.message)), xe());
  }, e = (n) => {
    const r = (
      /** @type {any} */
      n == null ? void 0 : n.reason
    );
    Le((r == null ? void 0 : r.message) ?? r) || (console.error("[alefbet] unhandled rejection:", r), xe());
  };
  return window.addEventListener("error", t), window.addEventListener("unhandledrejection", e), G = () => {
    window.removeEventListener("error", t), window.removeEventListener("unhandledrejection", e), ue = !1, pe = !1;
  }, { destroy: () => {
    G == null || G(), G = null;
  } };
}
function Bt(t, e = "טוֹעֵן...") {
  t.innerHTML = `<div class="ab-loading">${e}</div>`;
}
function Ut(t) {
  t.innerHTML = "";
}
function Ue(t) {
  let e = t.querySelector(".adult-tools__panel");
  if (e) return e;
  const n = t.querySelector(".game-header");
  if (!n) return null;
  const r = document.createElement("details");
  return r.className = "adult-tools", r.innerHTML = '<summary aria-label="להורים ולמורים">☰<span>למבוגרים</span></summary><div class="adult-tools__panel"><p>להורים ולמורים</p></div>', r.addEventListener("keydown", (a) => {
    a.key === "Escape" && (r.open = !1, r.querySelector("summary").focus(), a.stopPropagation());
  }), n.appendChild(r), r.querySelector(".adult-tools__panel");
}
function Vt(t, e, n) {
  const r = Ue(t.container);
  if (!r) return;
  const a = document.createElement("div");
  a.className = "ab-lazy-editor";
  const i = document.createElement("span");
  i.setAttribute("role", "status");
  let o = !1, s = null;
  async function l() {
    if (!document.querySelector('link[href$="/runtime.css"]') || document.querySelector("link[data-alefbet-editor]")) return;
    const d = document.createElement("link");
    d.rel = "stylesheet";
    const u = new URL(".", import.meta.url);
    d.href = new URL("editor.css", u).href, d.dataset.alefbetEditor = "", await new Promise((h, m) => {
      d.onload = () => h(), d.onerror = () => {
        d.remove(), m(new Error("Editor styles unavailable"));
      }, document.head.appendChild(d);
    });
  }
  async function c(d) {
    if (!(o || t.ended)) {
      o = !0, i.textContent = "טוֹעֵן...";
      try {
        const [u] = await Promise.all([import("./editor.js"), l()]);
        if (t.ended) return;
        "serviceWorker" in navigator && navigator.serviceWorker.ready.then((h) => {
          var m;
          (m = h.active) == null || m.postMessage({ type: "cache-editor" });
        }).catch(() => {
        }), d === "audio" ? u.showAudioManager(e.id, e) : (s = new u.GameEditor(t.container, e, n), await new Promise((h) => requestAnimationFrame(h)), t.ended || (s.enterEditMode(), a.remove())), i.textContent = "";
      } catch {
        t.ended || (i.textContent = "לֹא הִצְלַחְנוּ לִטְעֹן אֶת הָעוֹרֵךְ. הִתְחַבְּרוּ לָרֶשֶׁת וְנַסּוּ שׁוּב.");
      } finally {
        o = !1;
      }
    }
  }
  for (const [d, u] of [["✏️ ערוך", "edit"], ["🎤 קול", "audio"]]) {
    const h = document.createElement("button");
    h.className = "btn", h.textContent = d, h.addEventListener("click", () => {
      c(u);
    }), a.appendChild(h);
  }
  a.appendChild(i), r.appendChild(a), t.on("end", () => {
    s == null || s.destroy(), a.remove();
  });
}
const fe = /* @__PURE__ */ new WeakMap();
async function Wt(t, e) {
  Pe(t);
  const n = {};
  if (fe.set(t, n), qt(), Bt(t, e.loadingMessage ?? "טוֹעֵן..."), await pt(e.preloadTexts ?? []), fe.get(t) !== n)
    return { shell: null, activeRounds: [], gameData: null, aborted: !0 };
  if (e.onBeforeHide && (await e.onBeforeHide() === !1 || fe.get(t) !== n))
    return { shell: null, activeRounds: [], gameData: null, aborted: !0 };
  Ut(t);
  const r = e.editor ? et(e.gameId, e.editor.content) : null, a = r != null && r.rounds.length ? r.rounds : e.defaultRounds ?? [], i = new it(t, {
    totalRounds: e.totalRounds ?? a.length,
    title: e.title,
    gameId: e.gameId
  });
  e.audio !== !1 && Rt(i);
  let o = null;
  if (e.editor) {
    const s = {
      title: e.editor.title ?? e.title,
      type: e.editor.type ?? "multiple-choice"
    };
    o = tt.fromRoundsArray(e.gameId, a, s, e.editor.distractors ?? [], e.editor.content), Vt(i, o, { restartGame: e.editor.restartGame });
  }
  return { shell: i, activeRounds: a, gameData: o, aborted: !1 };
}
async function Ht(t, e) {
  const n = await Wt(t, e);
  if (n.aborted) return n;
  const { shell: r, activeRounds: a } = n;
  if (!a.length)
    return r.bodyEl.textContent = "אֵין סִבּוּבִים לַמִּשְׂחָק.", r.end(), n;
  const i = It(r.footerEl, a.length);
  let o;
  const s = () => {
    o == null || o.dispose(), o = void 0;
  }, l = Pt(r, t, {
    totalRounds: a.length,
    completionOnly: !0,
    progressBar: i,
    transitionMs: e.transitionMs,
    playCorrectSound: e.playCorrectSound,
    onReplay: e.onReplay ?? (() => {
      Ht(t, e);
    }),
    buildRoundUI: c
  });
  r.on("end", s), r.on("start", () => {
    var d;
    i.update(0), (d = e.onStart) == null || d.call(e, r), l.reset();
  }), r.on("start", c);
  function c() {
    s(), r.bodyEl.innerHTML = "";
    const d = te();
    o = d;
    const u = () => !r.ended && !d.signal.aborted, h = r.state.currentRound - 1;
    try {
      const m = e.buildRound({
        shell: r,
        index: h,
        round: a[h],
        isActive: u,
        scope: d,
        isAnswered: () => !u() || l.isAnswered(),
        subscribeAnswered: (y) => u() ? d.use(l.subscribe(y)) : (y(!0), () => {
        }),
        onCorrect: async (y) => {
          u() && await l.handleCorrect(y);
        },
        onWrong: async (y) => {
          u() && await l.handleWrong(y);
        },
        schedule: d.schedule
      });
      m && d.use(m);
    } catch (m) {
      throw d.dispose(), m;
    }
  }
  return r.start(), n;
}
function jt(t, e, n) {
  t.innerHTML = "";
  const r = document.createElement("div");
  r.className = "option-cards-grid";
  const a = e.map((i) => {
    const o = document.createElement("button");
    o.className = "option-card", o.dataset.id = i.id, o.type = "button";
    const s = document.createElement("span");
    s.className = "option-card__emoji", s.textContent = i.emoji || "";
    const l = document.createElement("span");
    return l.className = "option-card__text", l.textContent = i.text, o.append(s, l), o.addEventListener("click", () => {
      o.disabled || n(i);
    }), r.appendChild(o), { el: o, option: i };
  });
  return t.appendChild(r), {
    /** הַדָּגֵשׁ כַּרְטִיס לְפִי סוּג: 'correct' | 'wrong' | 'hint' */
    highlight(i, o) {
      a.forEach(({ el: s, option: l }) => {
        l.id === i && s.classList.add(`option-card--${o}`);
      });
    },
    /** Visual hints never change the answer lock or other highlights. */
    clearHighlight(i, o) {
      a.forEach(({ el: s, option: l }) => {
        l.id === i && s.classList.remove(`option-card--${o}`);
      });
    },
    setDisabled(i) {
      a.forEach(({ el: o }) => {
        o.disabled = i;
      });
    },
    /** נטרל את כל הכרטיסים */
    disable() {
      a.forEach(({ el: i }) => {
        i.disabled = !0;
      });
    },
    /** אפס את מצב הכרטיסים */
    reset() {
      a.forEach(({ el: i }) => {
        i.className = "option-card", i.disabled = !1;
      });
    },
    /** הסר את הרכיב */
    destroy() {
      t.innerHTML = "";
    }
  };
}
function bn(t, e, n) {
  const r = t.scope.use(jt(e, n.options, (a) => {
    t.isAnswered() || (n.isCorrect(a) ? t.onCorrect(() => {
      var i;
      return r.highlight(a.id, "correct"), (i = n.onCorrect) == null ? void 0 : i.call(n, a);
    }) : t.onWrong(() => {
      var i;
      return (i = n.onWrong) == null ? void 0 : i.call(n, a);
    }));
  }));
  return t.subscribeAnswered((a) => r.setDisabled(a)), { highlight: r.highlight, clearHighlight: r.clearHighlight };
}
function gn({ hintAfter: t = 2, escalateAfter: e = 4, onHint: n, onEscalate: r } = {}) {
  let a = 0;
  function i(o) {
    return o >= e ? 2 : o >= t ? 1 : 0;
  }
  return {
    /** דיווח על ניסיון שגוי. מפעיל את הקולבק המתאים ומחזיר את הרמה. */
    miss() {
      a++;
      const o = i(a);
      return o === 2 && r ? r(a) : o === 1 && n && n(a), o;
    },
    /** איפוס לקראת סיבוב חדש. */
    reset() {
      a = 0;
    },
    /** רמת העזרה הנוכחית: 0 ללא, 1 רמז עדין, 2 עזרה מוגברת. */
    get level() {
      return i(a);
    },
    /** מספר הניסיונות השגויים בסיבוב הנוכחי. */
    get misses() {
      return a;
    }
  };
}
const Ve = {
  a: { F1: 850, F2: 1400 },
  e: { F1: 550, F2: 2100 },
  i: { F1: 350, F2: 2700 },
  o: { F1: 550, F2: 1e3 },
  u: { F1: 350, F2: 850 }
}, we = {
  kamatz: "a",
  patah: "a",
  tzere: "e",
  segol: "e",
  hiriq: "i",
  holam: "o",
  kubbutz: "u"
};
function Dt(t, e) {
  if (!Number.isFinite(t) || !Number.isFinite(e) || t <= 0 || e <= 0 || e <= t)
    return { vowel: "", confidence: 0 };
  const n = Math.log2(t), r = Math.log2(e), a = [];
  for (const [l, c] of Object.entries(Ve)) {
    const d = n - Math.log2(c.F1), u = r - Math.log2(c.F2);
    a.push({ vowel: l, dist: Math.sqrt(d * d + u * u) });
  }
  a.sort((l, c) => l.dist - c.dist);
  const i = a[0], o = a[1], s = o.dist === 0 ? 1 : Math.max(0, Math.min(1, 1 - i.dist / o.dist));
  return { vowel: i.vowel, confidence: s };
}
function wn(t, e) {
  return !t || !e ? !1 : we[e] === t;
}
function Ot(t, e) {
  const n = t.length, r = Math.max(1, Math.min(e, n)), a = new Float32Array(r);
  for (let s = 0; s < r; s++) {
    let l = 0;
    const c = Math.PI * s / n;
    for (let d = 0; d < n; d++)
      l += t[d] * Math.cos(c * (d + 0.5));
    a[s] = l;
  }
  const i = new Float32Array(n), o = 2 / n;
  for (let s = 0; s < n; s++) {
    let l = a[0] * 0.5;
    for (let c = 1; c < r; c++)
      l += a[c] * Math.cos(Math.PI * c * (s + 0.5) / n);
    i[s] = o * l;
  }
  return i;
}
function Gt(t, e) {
  if (!t || t.length === 0 || !Number.isFinite(e) || e <= 0)
    return { F1: 0, F2: 0 };
  const n = Ot(t, 80), r = Math.min(n.length - 3, Math.floor(3500 / e)), a = [];
  for (let c = 3; c <= r; c++) {
    const d = n[c];
    d > n[c - 1] && d > n[c - 2] && d > n[c + 1] && d > n[c + 2] && a.push({ freq: c * e, mag: d });
  }
  if (a.length === 0) return { F1: 0, F2: 0 };
  const i = a.filter((c) => c.freq >= 200 && c.freq <= 1100);
  if (i.length === 0) return { F1: 0, F2: 0 };
  i.sort((c, d) => d.mag - c.mag);
  const o = i[0].freq, s = Math.max(o + 250, 700), l = a.filter((c) => c.freq >= s && c.freq <= 3500);
  return l.length === 0 ? { F1: o, F2: 0 } : (l.sort((c, d) => d.mag - c.mag), { F1: o, F2: l[0].freq });
}
function vn() {
  var o;
  const t = typeof window < "u", e = t && !!((o = navigator == null ? void 0 : navigator.mediaDevices) != null && o.getUserMedia), n = t ? window.AudioContext || window.webkitAudioContext : null, r = e && !!n;
  let a = null;
  const i = () => ({ vowel: "", confidence: 0, F1: 0, F2: 0 });
  return {
    available: r,
    listen(s = 3e3) {
      return a == null || a(), r ? new Promise((l) => {
        let c = !1, d = null, u = null, h = null;
        const m = (b) => {
          var k;
          if (!c) {
            c = !0, h !== null && cancelAnimationFrame(h), d == null || d.getTracks().forEach((w) => {
              try {
                w.stop();
              } catch {
              }
            });
            try {
              (k = u == null ? void 0 : u.close()) == null || k.catch(() => {
              });
            } catch {
            }
            a === y && (a = null), l(b);
          }
        }, y = () => m(i());
        a = y, Promise.resolve().then(() => navigator.mediaDevices.getUserMedia({ audio: !0 })).then((b) => {
          if (c) {
            b.getTracks().forEach((B) => {
              try {
                B.stop();
              } catch {
              }
            });
            return;
          }
          d = b, u = new n();
          const k = u.createMediaStreamSource(d), w = u.createAnalyser();
          w.fftSize = 4096, w.smoothingTimeConstant = 0.2, k.connect(w);
          const R = u.sampleRate / w.fftSize, g = new Float32Array(w.frequencyBinCount), _ = new Float32Array(w.fftSize), S = [], q = performance.now(), C = () => {
            if (c) return;
            if (performance.now() - q > s) {
              if (S.length < 3) {
                m(i());
                return;
              }
              const E = S.map((P) => P.F1).sort((P, se) => P - se), f = S.map((P) => P.F2).sort((P, se) => P - se), p = Math.floor(S.length / 2), v = E[p], z = f[p];
              m({ ...Dt(v, z), F1: v, F2: z });
              return;
            }
            w.getFloatTimeDomainData(_);
            let B = 0;
            for (let E = 0; E < _.length; E++) B += _[E] * _[E];
            if (Math.sqrt(B / _.length) > 0.015) {
              w.getFloatFrequencyData(g);
              const { F1: E, F2: f } = Gt(g, R);
              E > 0 && f > 0 && f > E && S.push({ F1: E, F2: f });
            }
            h = requestAnimationFrame(C);
          };
          h = requestAnimationFrame(C);
        }).catch(() => m(i()));
      }) : Promise.resolve(i());
    },
    cancel() {
      a == null || a();
    }
  };
}
const We = 210, He = 550, Kt = {
  a: { F3: 2700, bandwidths: [90, 110, 170], gains: [1, 0.5, 0.15] },
  e: { F3: 2900, bandwidths: [80, 100, 160], gains: [1, 0.55, 0.2] },
  i: { F3: 3300, bandwidths: [60, 100, 160], gains: [1, 0.6, 0.25] },
  o: { F3: 2600, bandwidths: [80, 90, 150], gains: [1, 0.5, 0.1] },
  u: { F3: 2400, bandwidths: [60, 80, 140], gains: [1, 0.45, 0.1] }
};
function ae(t) {
  const e = Ve[t], n = Kt[t];
  return !e || !n ? null : {
    formants: [e.F1, e.F2, n.F3],
    bandwidths: [...n.bandwidths],
    gains: [...n.gains]
  };
}
const Ae = {
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
function Qt(t) {
  return Ae[t] ?? Ae[""];
}
function kn() {
  return Me() !== null;
}
let Y = null;
function Xt(t) {
  if (Y && Y.sampleRate === t.sampleRate) return Y;
  const e = t.sampleRate, n = t.createBuffer(1, e, t.sampleRate), r = n.getChannelData(0);
  for (let a = 0; a < e; a++) r[a] = Math.random() * 2 - 1;
  return Y = n, n;
}
function je(t, e, n, r = t.destination) {
  const a = t.createOscillator();
  a.type = "sawtooth", a.frequency.value = n;
  const i = t.createGain();
  i.gain.value = 0;
  const o = e.formants.map((s, l) => {
    const c = t.createBiquadFilter();
    c.type = "bandpass", c.frequency.value = s, c.Q.value = s / e.bandwidths[l];
    const d = t.createGain();
    return d.gain.value = e.gains[l], a.connect(c), c.connect(d), d.connect(i), c;
  });
  return i.connect(r), { source: a, filters: o, master: i };
}
function me(t, e, n, r, a = t.destination) {
  const i = n.durationMs / 1e3, o = t.createBufferSource();
  o.buffer = Xt(t), o.loop = !0;
  const s = t.createBiquadFilter();
  s.type = "bandpass", s.frequency.value = n.noiseHz ?? 2e3, s.Q.value = n.noiseQ ?? 1;
  const l = t.createGain();
  return l.gain.setValueAtTime(0, e), l.gain.linearRampToValueAtTime(r, e + Math.min(0.01, i / 3)), l.gain.linearRampToValueAtTime(1e-4, e + i), o.connect(s), s.connect(l), l.connect(a), o.start(e), o.stop(e + i + 0.02), e + i;
}
function De(t, e, n, r, a, i, o = t.destination) {
  const s = r / 1e3, { source: l, filters: c, master: d } = je(t, n, a, o);
  if (l.frequency.setValueAtTime(a * 1.04, e), l.frequency.linearRampToValueAtTime(a * 0.92, e + s), i) {
    const m = Math.min(0.09, s / 3);
    c.forEach((y, b) => {
      const k = i[b];
      k && (y.frequency.setValueAtTime(k, e), y.frequency.exponentialRampToValueAtTime(n.formants[b], e + m));
    });
  }
  const u = 0.04, h = 0.12;
  return d.gain.setValueAtTime(0, e), d.gain.linearRampToValueAtTime(0.5, e + u), d.gain.setValueAtTime(0.5, e + s - h), d.gain.linearRampToValueAtTime(1e-4, e + s), l.start(e), l.stop(e + s + 0.05), e + s;
}
function Yt(t, e, n, r, a = t.destination) {
  const i = n / 1e3, o = { formants: [250, 1100, 2200], bandwidths: [80, 200, 300], gains: [1, 0.12, 0.05] }, { source: s, master: l } = je(t, o, r, a);
  return l.gain.setValueAtTime(0, e), l.gain.linearRampToValueAtTime(0.35, e + 0.02), l.gain.setValueAtTime(0.35, e + i - 0.02), l.gain.linearRampToValueAtTime(1e-4, e + i), s.start(e), s.stop(e + i + 0.05), e + i;
}
function Oe(t, e, n, r) {
  const a = Math.max(0, (e - t.currentTime) * 1e3) + 60;
  return new Promise((i) => {
    const o = () => {
      clearTimeout(s), r == null || r.removeEventListener("abort", o), n.disconnect(), i(!(r != null && r.aborted));
    }, s = setTimeout(o, a);
    r == null || r.addEventListener("abort", o, { once: !0 }), r != null && r.aborted && o();
  });
}
async function Zt(t, e = {}) {
  var o, s;
  const n = ae(t);
  if (!n || (o = e.signal) != null && o.aborted) return !1;
  const r = await Ce();
  if (!r || (s = e.signal) != null && s.aborted) return !1;
  let a, i;
  try {
    i = r.createGain(), i.connect(r.destination);
    const l = r.currentTime + 0.03;
    a = De(r, l, n, e.durationMs ?? He, e.pitchHz ?? We, null, i);
  } catch {
    return i == null || i.disconnect(), !1;
  }
  return Oe(r, a, i, e.signal);
}
async function ye(t, e, n = {}) {
  var d, u;
  const r = ae(e);
  if (!r || (d = n.signal) != null && d.aborted) return !1;
  const a = await Ce();
  if (!a || (u = n.signal) != null && u.aborted) return !1;
  const i = Qt(t), o = n.pitchHz ?? We, s = n.durationMs ?? He;
  let l, c;
  try {
    c = a.createGain(), c.connect(a.destination), l = Jt(a, i, t, r, s, o, c);
  } catch {
    return c == null || c.disconnect(), !1;
  }
  return Oe(a, l, c, n.signal);
}
function Jt(t, e, n, r, a, i, o = t.destination) {
  let s = t.currentTime + 0.03, l = null;
  switch (e.type) {
    case "plosive": {
      s = me(t, s, e, e.voiced ? 0.25 : 0.35, o), s += 0.01;
      break;
    }
    case "fricative": {
      s = me(t, s, e, 0.22, o) - 0.03;
      break;
    }
    case "affricate": {
      s += 0.03, s = me(t, s, { ...e, durationMs: e.durationMs - 30 }, 0.3, o) - 0.02;
      break;
    }
    case "nasal": {
      s = Yt(t, s, e.durationMs, i, o), l = [300, 1300, 2300];
      break;
    }
    case "liquid": {
      l = n === "r" ? [450, 1300, 1600] : [380, 1e3, 2600];
      break;
    }
    case "glide": {
      const c = ae(n === "y" ? "i" : "u");
      l = c ? c.formants : null;
      break;
    }
  }
  return De(t, s, r, a, i, l, o);
}
const X = "sound-bank";
function Ge(t) {
  return `letter:${t}`;
}
function Ke(t) {
  return `nikud:${t}`;
}
function Qe(t, e) {
  return `syllable:${t}:${e}`;
}
function en(t) {
  return `word:${t}`;
}
function Xe() {
  const t = [];
  for (const e of H)
    t.push({ key: Ge(e.letter), label: e.nameNikud, group: "letters" });
  for (const e of N)
    t.push({ key: Ke(e.id), label: `${e.nameNikud} (${e.sound})`, group: "nikud" });
  for (const e of bt)
    for (const n of N)
      t.push({
        key: Qe(e, n.id),
        label: $e(e, n.symbol),
        group: "syllables"
      });
  return t;
}
function _n(t) {
  const e = Xe().find((r) => r.key === t);
  if (e) return e.label;
  const [, ...n] = t.split(":");
  return n.join(":");
}
function tn() {
  return typeof navigator < "u" && navigator.onLine === !1;
}
async function ie(t, e = void 0) {
  try {
    return typeof indexedDB > "u" ? !1 : await (e ? V(X, t, e) : V(X, t));
  } catch {
    return !1;
  }
}
async function oe(t) {
  if (tn() && !nn()) return !1;
  try {
    return await t(), A.audioState !== "failed" && A.audioState !== "unsupported";
  } catch {
    return !1;
  }
}
function nn() {
  return typeof speechSynthesis < "u";
}
async function Sn() {
  try {
    return typeof indexedDB > "u" ? [] : await ze(X);
  } catch {
    return [];
  }
}
async function En(t) {
  if (await ie(Ge(t))) return "bank";
  const e = be(t), n = e ? e.nameNikud : t;
  return await oe(() => A.speak(n)) ? "tts" : e && await ye(e.sound, "a", { durationMs: 400 }) ? "synth" : "none";
}
async function Nn(t) {
  if (await ie(Ke(t))) return "bank";
  if (await oe(() => A.speakVowel(t))) return "tts";
  const e = we[t];
  return e && await Zt(e) ? "synth" : "none";
}
async function Ln(t, e, n = {}) {
  const { signal: r } = n;
  if (r != null && r.aborted) return "none";
  if (await ie(Qe(t, e), r ? n : void 0)) return "bank";
  if (r != null && r.aborted) return "none";
  const a = N.find((l) => l.id === e), i = () => A.cancel();
  r == null || r.addEventListener("abort", i, { once: !0 });
  try {
    if (a && await oe(() => A.speakNikud(t, a.symbol)))
      return r != null && r.aborted ? "none" : "tts";
  } finally {
    r == null || r.removeEventListener("abort", i);
  }
  if (r != null && r.aborted) return "none";
  const o = be(t), s = we[e];
  return s && await (r ? ye(o ? o.sound : "", s, n) : ye(o ? o.sound : "", s)) ? "synth" : "none";
}
async function xn(t) {
  return await ie(en(t)) ? "bank" : await oe(() => A.speak(t)) ? "tts" : "none";
}
const Re = "alefbet.ttsProxyUrl";
function rn() {
  var i, o;
  if (typeof window > "u") return null;
  const t = new URLSearchParams(window.location.search).get("ttsProxy");
  if (t && window.localStorage)
    try {
      window.localStorage.setItem(Re, t);
    } catch {
    }
  const e = (
    /** @type {any} */
    window.ALEFBET_TTS_PROXY_URL
  ), n = (i = window.localStorage) == null ? void 0 : i.getItem(Re), r = (o = window.localStorage) == null ? void 0 : o.getItem("alefbet.nakdanProxyUrl"), a = t || e || n || r;
  return a ? String(a).replace(/\/+$/, "") : null;
}
function an(t) {
  const [e, n, r] = t.split(":");
  if (e === "letter") {
    const a = be(n);
    return a ? a.nameNikud : null;
  }
  if (e === "nikud") {
    const a = N.find((i) => i.id === n);
    return a ? a.sound : null;
  }
  if (e === "syllable") {
    const a = N.find((i) => i.id === r);
    return a ? $e(n, a.symbol) : null;
  }
  return e === "word" && t.slice(5) || null;
}
async function on(t, e) {
  const n = await fetch(`${t}/tts?text=${encodeURIComponent(e)}&lang=he`);
  if (!n.ok) throw new Error(`tts-proxy ${n.status}`);
  const r = await n.blob();
  if (!r || r.size === 0) throw new Error("empty-audio");
  return r;
}
async function An({ force: t = !1, extraTexts: e = [], onProgress: n } = {}) {
  const r = rn();
  if (!r)
    throw new Error("tts-proxy-not-configured: הגדירו כתובת דרך ?ttsProxy=... או window.ALEFBET_TTS_PROXY_URL");
  if (typeof indexedDB > "u")
    throw new Error("indexeddb-unavailable: אין אחסון מקומי לשמירת הצלילים");
  const a = [
    ...Xe().map((l) => l.key),
    ...e.filter((l) => l == null ? void 0 : l.trim()).map((l) => `word:${l}`)
  ], i = new Set(t ? [] : await ze(X).catch(() => [])), o = { total: a.length, compiled: 0, skipped: 0, failures: [] };
  let s = 0;
  for (const l of a) {
    if (s++, i.has(l)) {
      o.skipped++, n == null || n(s, a.length, l);
      continue;
    }
    const c = an(l);
    if (!c) {
      o.failures.push({ key: l, reason: "unknown-key" }), n == null || n(s, a.length, l);
      continue;
    }
    try {
      const d = await on(r, c);
      await nt(X, l, d), o.compiled++;
    } catch (d) {
      o.failures.push({ key: l, reason: (d == null ? void 0 : d.message) || "fetch-failed" });
    }
    n == null || n(s, a.length, l);
  }
  return o;
}
const Fe = [
  "כָּל הַכָּבוֹד",
  "מְצֻיָּן",
  "יֹפִי",
  "נֶהְדָּר",
  "וָאוּ",
  "אֵיזֶה כֵּיף"
], Te = [
  "נַסּוּ שׁוּב, אַתֶּם יְכוֹלִים",
  "כִּמְעַט! הַקְשִׁיבוּ שׁוּב",
  "עוֹד נִסָּיוֹן קָטָן",
  "קְרוֹבִים מְאֹד"
];
function sn() {
  return Fe[Math.floor(Math.random() * Fe.length)];
}
function Rn() {
  return Te[Math.floor(Math.random() * Te.length)];
}
function Fn(t) {
  const e = document.createElement("div");
  e.className = "feedback-message", e.setAttribute("aria-live", "polite"), e.setAttribute("role", "status"), t.appendChild(e);
  let n = null;
  function r(a, i, o = 1800) {
    clearTimeout(n), e.textContent = a, e.className = `feedback-message feedback-message--${i}`, n = setTimeout(() => {
      e.textContent = "", e.className = "feedback-message";
    }, o);
  }
  return {
    /** הצג משוב חיובי - טקסט מפורש, או ביטוי שבח אקראי אם לא סופק */
    correct(a) {
      re.correct(), r(a ?? `!${sn()}`, "correct"), ee(e, "bounce");
    },
    /** הצג עידוד — נסה שוב */
    wrong(a = "נַסֵּה שׁוּב") {
      re.wrong(), r(a, "wrong"), ee(e, "pulse");
    },
    /** הצג רמז */
    hint(a) {
      r(a, "hint"), ee(e, "pulse");
    },
    /** הסר את הרכיב */
    destroy() {
      clearTimeout(n), e.remove();
    }
  };
}
function Tn(t, e) {
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
  const r = new URLSearchParams(window.location.search), a = r.get("allowedNikud") ? r.get("allowedNikud").split(",") : [];
  let i = `
    <div style="background:white; padding:1.5rem; border-radius:1rem; min-width:300px; text-align:center; color:#333; font-family:Heebo,Arial; direction:rtl;">
      <h2 style="margin-top:0">בחר ניקוד</h2>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; margin:1rem 0; text-align:right;">
  `;
  N.forEach((c) => {
    const d = a.length === 0 || a.includes(c.id) || a.includes(c.name);
    i += `
      <label style="display:flex; align-items:center; gap:0.5rem; cursor:pointer;">
        <input type="checkbox" value="${c.id}" class="nikud-filter-cb" ${d ? "checked" : ""} style="width:1.2rem;height:1.2rem;">
        <span>${c.nameNikud}</span>
      </label>
    `;
  });
  const o = parseFloat(localStorage.getItem("alefbet.nikudRate")) || 0.5;
  i += `
      </div>
      <div style="margin:1rem 0; text-align:right;">
        <label style="font-weight:700; font-size:0.95rem;">מהירות הגייה: <span id="nikud-rate-val">${o}</span></label>
        <input type="range" id="nikud-rate-slider" min="0.3" max="1.5" step="0.1" value="${o}" style="width:100%; margin-top:0.3rem; accent-color:#4f67ff;">
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
  ), l = document.getElementById("nikud-rate-val");
  s.oninput = () => {
    l.textContent = s.value;
  }, document.getElementById("save-settings-btn").onclick = () => {
    const c = parseFloat(s.value);
    localStorage.setItem("alefbet.nikudRate", String(c)), A.setNikudEmphasis({ rate: c });
    const d = Array.from(n.querySelectorAll(".nikud-filter-cb")).filter((h) => (
      /** @type {HTMLInputElement} */
      h.checked
    )).map((h) => (
      /** @type {HTMLInputElement} */
      h.value
    )), u = new URL(window.location.href);
    d.length > 0 && d.length < N.length ? u.searchParams.set("allowedNikud", d.join(",")) : u.searchParams.delete("allowedNikud"), u.searchParams.delete("excludedNikud"), n.style.display = "none", window.history.replaceState({}, "", u), e && e(t);
  }, document.getElementById("close-settings-btn").onclick = () => {
    n.style.display = "none";
  };
}
function Mn(t) {
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
    highlight(r) {
      e.classList.remove("ab-zone--correct", "ab-zone--hover"), r && e.classList.add(`ab-zone--${r}`);
    },
    reset() {
      e.classList.remove("ab-zone--correct", "ab-zone--hover");
    },
    destroy() {
      e.removeEventListener("click", n);
    }
  };
}
function ln(t, e, n, r, a) {
  return t.map((i) => {
    const o = r > 0 ? (i.x - e) / r * 100 : 0, s = a > 0 ? (i.y - n) / a * 100 : 0;
    return `${o},${s}`;
  }).join(" ");
}
function Cn(t, e) {
  const {
    image: n,
    zones: r = [],
    mode: a = "quiz",
    gameId: i,
    roundId: o,
    onCorrect: s,
    onWrong: l,
    onAllCorrect: c,
    onZoneTap: d,
    showZones: u = !1,
    autoPlayInstruction: h = !0,
    hintAfter: m = 3
  } = e, y = te();
  let b = te();
  y.use(() => b.dispose());
  const k = a === "soundboard", w = document.createElement("div");
  w.className = "ab-zp-wrap";
  const R = document.createElement("img");
  R.className = "ab-zp-image", R.src = n, R.alt = "", R.draggable = !1, w.appendChild(R);
  const g = document.createElement("div");
  g.className = "ab-zp-layer", w.appendChild(g), t.appendChild(w);
  const _ = /* @__PURE__ */ new Set();
  let S = 0, q = !1, C = !1;
  async function B(f) {
    if (!i || q) return;
    q = !0;
    const p = b.signal;
    try {
      await V(i, `zone-${f}`, { signal: p });
    } catch {
    }
    p.aborted || (q = !1);
  }
  function E() {
    if (C || m <= 0 || k || S < m) return;
    C = !0;
    const f = g.querySelectorAll(".ab-zp-zone");
    f.forEach((p, v) => {
      var z;
      (z = r[v]) != null && z.correct && !_.has(r[v].id) && p.classList.add("ab-zp-zone--hint");
    }), b.schedule(() => {
      f.forEach((p) => p.classList.remove("ab-zp-zone--hint")), C = !1, S = 0;
    }, 1500);
  }
  return r.forEach((f) => {
    const p = document.createElement("button");
    if (p.className = "ab-zp-zone", (u || k) && p.classList.add("ab-zp-zone--visible"), k && p.classList.add("ab-zp-zone--soundboard"), p.style.left = `${f.x}%`, p.style.top = `${f.y}%`, p.style.width = `${f.width}%`, p.style.height = `${f.height}%`, p.setAttribute("aria-label", f.label || (f.correct ? "correct zone" : "zone")), f.shape === "polygon" && f.points && f.points.length >= 3) {
      const v = `zp-clip-${f.id}`;
      p.innerHTML = `<svg class="ab-zp-zone__poly-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs><clipPath id="${v}"><polygon points="${ln(f.points, f.x, f.y, f.width, f.height)}"/></clipPath></defs>
        <rect x="0" y="0" width="100" height="100" clip-path="url(#${v})" fill="transparent"/>
      </svg>`, p.classList.add("ab-zp-zone--poly");
    }
    if (k && f.label) {
      const v = document.createElement("span");
      v.className = "ab-zp-zone__label", v.textContent = f.label, p.appendChild(v);
    }
    y.listen(p, "click", () => {
      if (d && d(f), B(f.id), k) {
        p.classList.add("ab-zp-zone--tapped"), b.schedule(() => p.classList.remove("ab-zp-zone--tapped"), 400);
        return;
      }
      if (!_.has(f.id))
        if (f.correct) {
          _.add(f.id), p.classList.add("ab-zp-zone--correct"), s && s(f);
          const v = r.filter((z) => z.correct).length;
          _.size >= v && c && c();
        } else
          p.classList.add("ab-zp-zone--wrong"), S++, l && l(f), b.schedule(() => p.classList.remove("ab-zp-zone--wrong"), 600), E();
    }), g.appendChild(p);
  }), h && i && o && b.schedule(() => {
    V(i, o, { signal: b.signal }).catch(() => {
    });
  }, 400), {
    async playInstruction() {
      return i && o ? V(i, o, { signal: b.signal }) : !1;
    },
    async playZoneAudio(f) {
      return i ? V(i, `zone-${f}`, { signal: b.signal }) : !1;
    },
    revealCorrect() {
      g.querySelectorAll(".ab-zp-zone").forEach((f, p) => {
        var v;
        (v = r[p]) != null && v.correct && f.classList.add("ab-zp-zone--revealed");
      });
    },
    reset() {
      y.signal.aborted || (b.dispose(), b = te(), q = !1, _.clear(), S = 0, C = !1, g.querySelectorAll(".ab-zp-zone").forEach((f) => {
        f.classList.remove(
          "ab-zp-zone--correct",
          "ab-zp-zone--wrong",
          "ab-zp-zone--revealed",
          "ab-zp-zone--tapped",
          "ab-zp-zone--hint"
        );
      }));
    },
    destroy() {
      y.dispose(), w.remove();
    }
  };
}
function zn(t, e, n, r) {
  const a = Ue(t);
  if (!a) return null;
  const i = document.createElement("button");
  return i.className = "btn", i.setAttribute("aria-label", n), i.textContent = `${e} ${n}`, i.onclick = (o) => {
    const s = i.closest("details");
    s && (s.open = !1), r(o);
  }, a.appendChild(i), i;
}
const cn = "0 0 32 16", Ye = {
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
function dn(t) {
  const e = Ye[t];
  return e ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${cn}" aria-hidden="true" focusable="false">${e}</svg>` : null;
}
const Pn = Object.freeze(Object.keys(Ye));
function In(t, { size: e = "md" } = {}) {
  const n = document.createElement("div");
  n.className = `ab-nikud-box ab-nikud-box--${e} ab-nikud-box--${t.id}`;
  const r = document.createElement("div");
  r.className = "ab-nikud-box__box";
  const a = document.createElement("div");
  return a.className = "ab-nikud-box__mark", a.innerHTML = dn(t.id) ?? "", n.appendChild(r), n.appendChild(a), n;
}
export {
  rt as EventBus,
  it as GameShell,
  at as GameState,
  Pn as NIKUD_GLYPH_IDS,
  we as NIKUD_VOWEL,
  Fe as PRAISE_PHRASES,
  Te as RETRY_HINTS,
  X as SOUND_BANK_ID,
  Ve as VOWEL_TEMPLATES,
  mt as addNikud,
  ee as animate,
  Rt as attachGameAudio,
  Wt as bootstrapGame,
  Dt as classifyFormants,
  An as compileSoundBank,
  an as compileTextForKey,
  Qt as consonantOnsetSpec,
  bn as createChoiceRound,
  Bn as createDragSource,
  Un as createDropTarget,
  Fn as createFeedback,
  gn as createHintTracker,
  Je as createLocalState,
  In as createNikudBox,
  jt as createOptionCards,
  It as createProgressBar,
  Pt as createRoundManager,
  Vn as createVoiceRecordButton,
  Wn as createVoiceRecorder,
  vn as createVowelDetector,
  Mn as createZone,
  Cn as createZonePlayer,
  Hn as deleteVoice,
  Pe as endGame,
  Ce as ensureAudioRunning,
  Gt as extractFormantsFromSpectrum,
  yn as getAllProgress,
  Me as getAudioContext,
  pn as getGameProgress,
  be as getLetter,
  yt as getLettersByGroup,
  ht as getNikud,
  jn as hasVoice,
  H as hebrewLetters,
  Ut as hideLoadingScreen,
  zn as injectHeaderButton,
  qt as installGlobalErrorScreen,
  tn as isOffline,
  kn as isSynthSupported,
  Dn as isVoiceRecordingSupported,
  ct as isVowelized,
  _n as keyLabel,
  Ge as letterKey,
  $e as letterWithNikud,
  ze as listVoiceKeys,
  On as loadVoice,
  wn as matchNikudVowel,
  At as mountAudioStatusBanner,
  bt as nikudBaseLetters,
  dn as nikudGlyphSvg,
  Ke as nikudKey,
  N as nikudList,
  Gn as playBlob,
  V as playVoice,
  pt as preloadNikud,
  fn as randomLetters,
  mn as randomNikud,
  sn as randomPraise,
  Rn as randomRetryHint,
  Ct as recordGameResult,
  Sn as recordedKeys,
  rn as resolveTtsProxyUrl,
  Ht as runGame,
  nt as saveVoice,
  zt as showCompletionScreen,
  Bt as showLoadingScreen,
  Tn as showNikudSettingsDialog,
  hn as shuffle,
  re as sounds,
  En as speakLetter,
  Nn as speakNikudSound,
  Ln as speakSyllable,
  xn as speakWord,
  Xe as standardSoundKeys,
  Be as starsFor,
  Qe as syllableKey,
  ye as synthesizeSyllable,
  Zt as synthesizeVowel,
  A as tts,
  Ze as unlockAudioOutput,
  ae as vowelFormantSpec,
  en as wordKey
};
