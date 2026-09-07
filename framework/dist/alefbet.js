class Yr {
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
class Xr {
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
const Be = /* @__PURE__ */ new WeakMap();
function xn(e) {
  var t;
  (t = Be.get(e)) == null || t.end();
}
class Kr {
  /**
   * @param {HTMLElement} containerEl - אלמנט המיכל
   * @param {object} config - הגדרות: { totalRounds, title, homeUrl }
   */
  constructor(t, n = {}) {
    xn(t), Be.set(t, this), this.ended = !1, this._timers = /* @__PURE__ */ new Set(), this.container = t, this.config = {
      totalRounds: 8,
      title: "מִשְׂחָק",
      homeUrl: "../../index.html",
      ...n
    }, this.events = new Yr(), this.state = new Xr(this.config.totalRounds), this.gameId = typeof n.gameId == "string" ? n.gameId : "", this._buildShell();
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
      this._timers.clear(), Be.get(this.container) === this && Be.delete(this.container), this.events.emit("end", { score: t, state: this.state });
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
const Wt = "https://nakdan-u1-0.loadbalancer.dicta.org.il/api";
let Jt = !1;
const Qr = 4e3, Tn = "alefbet.nikudCache.v1", eo = 300, se = /* @__PURE__ */ new Map();
(function() {
  if (!(typeof localStorage > "u"))
    try {
      const t = localStorage.getItem(Tn);
      if (!t) return;
      const n = JSON.parse(t);
      if (Array.isArray(n))
        for (const [r, o] of n)
          typeof r == "string" && typeof o == "string" && se.set(r, o);
    } catch {
    }
})();
function to() {
  if (!(typeof localStorage > "u"))
    try {
      const e = [...se.entries()].filter(([t, n]) => n !== t).slice(-eo);
      localStorage.setItem(Tn, JSON.stringify(e));
    } catch {
    }
}
function no(e) {
  if (!e) return !1;
  const t = e.split(/\s+/).filter((r) => /[א-ת]/.test(r));
  return t.length === 0 ? !0 : t.filter((r) => /[\u05B0-\u05BC\u05C1\u05C2\u05C7]/.test(r)).length / t.length >= 0.8;
}
function ro() {
  var o;
  if (typeof window > "u") return Wt;
  const e = new URLSearchParams(window.location.search).get("nakdanProxy"), t = window.ALEFBET_NAKDAN_PROXY_URL;
  if (e && window.localStorage)
    try {
      window.localStorage.setItem("alefbet.nakdanProxyUrl", e);
    } catch {
    }
  const n = (o = window.localStorage) == null ? void 0 : o.getItem("alefbet.nakdanProxyUrl"), r = e || t || n;
  return r || (window.location.hostname.endsWith("github.io") ? null : Wt);
}
function oo(e) {
  var n;
  let t = "";
  for (const r of e)
    if (r.sep)
      t += r.str ?? "";
    else {
      const o = (n = r.nakdan) == null ? void 0 : n.options;
      o != null && o.length ? t += (o[0].w ?? "").replace(/\|/g, "").replace(/\u05BD/g, "") : t += r.str ?? "";
    }
  return t;
}
async function io(e) {
  const t = ro();
  if (!t)
    throw Jt || (Jt = !0, console.warn("[nakdan] Dicta API blocked by CORS on GitHub Pages. Configure a proxy URL via ?nakdanProxy=..., window.ALEFBET_NAKDAN_PROXY_URL, or localStorage key alefbet.nakdanProxyUrl.")), new Error("Nakdan unavailable without proxy on this host");
  const n = typeof AbortController < "u" ? new AbortController() : null, r = n ? setTimeout(() => n.abort(), Qr) : null;
  let o;
  try {
    o = await fetch(t, {
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
    r && clearTimeout(r);
  }
  if (!o.ok) throw new Error(`Nakdan ${o.status}`);
  const i = await o.json(), s = i == null ? void 0 : i.data;
  if (!Array.isArray(s)) throw new Error("Nakdan: invalid response");
  return oo(s);
}
async function so(e) {
  if (!(e != null && e.trim())) return e ?? "";
  if (se.has(e)) return se.get(e);
  if (no(e))
    return se.set(e, e), e;
  if (typeof navigator < "u" && navigator.onLine === !1)
    return e;
  try {
    const t = await io(e);
    return se.set(e, t), to(), t;
  } catch {
    return se.set(e, e), e;
  }
}
function ao(e) {
  return se.get(e) ?? e ?? "";
}
async function co(e) {
  const t = [...new Set(e.filter((n) => n == null ? void 0 : n.trim()))];
  await Promise.all(t.map((n) => so(n)));
}
const we = [
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
function At(e) {
  return we.find((t) => t.letter === e) || null;
}
function uo(e = "regular") {
  return e === "regular" ? we.filter((t) => !t.isFinal) : e === "final" ? we.filter((t) => t.isFinal) : we;
}
function _l(e, t = "regular") {
  const n = uo(t);
  return [...n].sort(() => Math.random() - 0.5).slice(0, Math.min(e, n.length));
}
const X = [
  { id: "kamatz", name: "קָמָץ", nameNikud: "קָמָץ", symbol: "ָ", sound: "אָה", color: "#C9442C", textColor: "#fff" },
  { id: "patah", name: "פָּתַח", nameNikud: "פָּתַח", symbol: "ַ", sound: "אָה", color: "#C58119", textColor: "#fff" },
  { id: "hiriq", name: "חִירִיק", nameNikud: "חִירִיק", symbol: "ִ", sound: "אִי", color: "#2A7B71", textColor: "#fff" },
  { id: "tzere", name: "צֵרֶה", nameNikud: "צֵרֶה", symbol: "ֵ", sound: "אֶה", color: "#4A6B8C", textColor: "#fff" },
  { id: "segol", name: "סְגוֹל", nameNikud: "סְגוֹל", symbol: "ֶ", sound: "אֶה", color: "#783952", textColor: "#fff" },
  { id: "holam", name: "חוֹלָם", nameNikud: "חוֹלָם", symbol: "ֹ", sound: "אוֹ", color: "#5F7A42", textColor: "#fff" },
  { id: "kubbutz", name: "קֻבּוּץ", nameNikud: "קֻבּוּץ", symbol: "ֻ", sound: "אוּ", color: "#6B4A8A", textColor: "#fff" }
], lo = we.filter((e) => !e.isFinal).map((e) => e.letter);
function An(e, t) {
  return e + t;
}
function gl(e) {
  let t = [...X];
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
  t.length === 0 && (t = [...X]);
  let n = [...t];
  for (; n.length < e; )
    n.push(...t);
  return n.sort(() => Math.random() - 0.5).slice(0, e);
}
let ft = null;
function fo() {
  return typeof window > "u" ? null : window.AudioContext || /** @type {any} */
  window.webkitAudioContext || null;
}
function nt() {
  const e = fo();
  if (!e) return null;
  if (!ft)
    try {
      ft = new e();
    } catch {
      return null;
    }
  return ft;
}
async function ho() {
  const e = nt();
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
async function Rt() {
  const e = nt();
  if (!e) return null;
  if (e.state === "suspended")
    try {
      await e.resume();
    } catch {
    }
  return e.state === "running" ? e : null;
}
function po(e) {
  return typeof e.arrayBuffer == "function" ? e.arrayBuffer() : new Promise((t, n) => {
    const r = new FileReader();
    r.onload = () => t(
      /** @type {ArrayBuffer} */
      r.result
    ), r.onerror = () => n(r.error), r.readAsArrayBuffer(e);
  });
}
async function mo(e) {
  if (!e) return !1;
  const t = await Rt();
  if (!t || typeof t.decodeAudioData != "function") return !1;
  let n;
  try {
    const r = await po(e);
    n = await new Promise((o, i) => {
      const s = t.decodeAudioData(r, o, i);
      s && typeof s.then == "function" && s.then(o, i);
    });
  } catch {
    return !1;
  }
  return new Promise((r) => {
    try {
      const o = t.createBufferSource();
      o.buffer = n, o.connect(t.destination), o.onended = () => r(!0), o.start(0), setTimeout(() => r(!0), (n.duration + 0.5) * 1e3);
    } catch {
      r(!1);
    }
  });
}
const bo = 2e3;
let ee = [], Re = !1, _e = 0.9, ht = typeof localStorage < "u" && parseFloat(localStorage.getItem("alefbet.nikudRate")) || 0.5, Ue = !1, Ce = null, fe = null, te = null, Rn = null, Le = !1, K = "idle";
function Ve() {
  return typeof speechSynthesis < "u";
}
function Q(e, t, n = !1) {
  if (K === e && !n) return;
  const r = K;
  if (K = e, typeof window < "u" && typeof window.dispatchEvent == "function") {
    const o = { state: e, previousState: r };
    t && (o.reason = t), window.dispatchEvent(new CustomEvent("alefbet:tts-state", { detail: o }));
  }
}
function _o() {
  Ve() ? K = "idle" : Q("unsupported", "no-speech-synthesis");
}
_o();
function St(e, t) {
  Rn = String(t || "unknown"), console.warn("[tts] browser TTS failed", { text: e, reason: t }), typeof window < "u" && typeof window.dispatchEvent == "function" && window.dispatchEvent(new CustomEvent("alefbet:tts-error", {
    detail: { provider: "browser", text: e, sentText: e, reason: t }
  }));
}
function go(e) {
  const t = String(e).toLowerCase();
  return t.includes("not-allowed") || t.includes("notallowed") || t.includes("didn't interact") || t.includes("user gesture");
}
function yo() {
  var e;
  return typeof window > "u" || typeof document > "u" ? Promise.resolve() : Ue || (e = document.userActivation) != null && e.hasBeenActive ? (Ue = !0, Promise.resolve()) : Ce || (Ce = new Promise((t) => {
    const n = () => {
      Ue = !0, window.removeEventListener("pointerdown", n, !0), window.removeEventListener("keydown", n, !0), window.removeEventListener("touchstart", n, !0), t();
    };
    window.addEventListener("pointerdown", n, { once: !0, capture: !0 }), window.addEventListener("keydown", n, { once: !0, capture: !0 }), window.addEventListener("touchstart", n, { once: !0, capture: !0 });
  }).finally(() => {
    Ce = null;
  }), Ce);
}
let de = null, xe = null, pt = !1, Gt = !1;
const vo = ["carmit", "hila", "female"];
function wo(e) {
  const t = (e.name || "").toLowerCase();
  return vo.some((n) => t.includes(n));
}
function mt() {
  if (typeof speechSynthesis > "u") return null;
  const t = speechSynthesis.getVoices().filter(
    (i) => i.lang === "he-IL" || i.lang === "iw-IL" || (i.lang || "").startsWith("he")
  );
  if (t.length === 0) return null;
  const r = typeof navigator < "u" && navigator.onLine === !1 && t.filter((i) => i.localService !== !1) || t, o = r.length > 0 ? r : t;
  return o.find(wo) || o[0];
}
function ko() {
  return typeof speechSynthesis > "u" ? Promise.resolve() : (de = mt(), de ? (pt = !0, Promise.resolve()) : pt ? Promise.resolve() : xe || (xe = new Promise((e) => {
    let t = !1;
    const n = () => {
      t || (t = !0, pt = !0, de = mt(), typeof speechSynthesis < "u" && typeof speechSynthesis.removeEventListener == "function" && speechSynthesis.removeEventListener("voiceschanged", r), clearTimeout(o), e());
    }, r = () => {
      de = mt(), de && n();
    };
    typeof speechSynthesis.addEventListener == "function" && speechSynthesis.addEventListener("voiceschanged", r);
    const o = setTimeout(() => {
      Gt || (Gt = !0, St("", "voice-load-timeout")), n();
    }, bo);
  }).finally(() => {
    xe = null;
  }), xe));
}
function Eo(e) {
  return 5e3 + ((e == null ? void 0 : e.length) ?? 0) * 200;
}
function Yt(e) {
  return new Promise((t, n) => {
    if (typeof SpeechSynthesisUtterance > "u") {
      n(new Error("SpeechSynthesisUtterance unavailable"));
      return;
    }
    try {
      const r = new SpeechSynthesisUtterance(e);
      r.lang = "he-IL", r.rate = _e, de && (r.voice = de), te = r;
      let o = !1;
      const i = setTimeout(() => {
        if (!o) {
          o = !0, te === r && (te = null);
          try {
            speechSynthesis.cancel();
          } catch {
          }
          n(new Error("utterance-timeout"));
        }
      }, Eo(e));
      r.onend = () => {
        o || (o = !0, clearTimeout(i), te === r && (te = null), t());
      }, r.onerror = (s) => {
        o || (o = !0, clearTimeout(i), te === r && (te = null), n(new Error(String(s && s.error || "speech-error"))));
      }, speechSynthesis.speak(r);
    } catch (r) {
      n(r instanceof Error ? r : new Error(String(r)));
    }
  });
}
async function zo(e) {
  if (typeof speechSynthesis > "u")
    return { ok: !1, reason: "speechSynthesis unavailable" };
  await ko();
  try {
    return await Yt(e), Le = !1, { ok: !0 };
  } catch (t) {
    const n = (t == null ? void 0 : t.message) || "speech-error";
    if (go(n)) {
      Le || (Le = !0, Q("awaiting-interaction", "autoplay-blocked")), await yo(), Le = !1;
      try {
        return await Yt(e), { ok: !0 };
      } catch (r) {
        const o = (r == null ? void 0 : r.message) || "speech-error";
        return St(e, o), { ok: !1, reason: o };
      }
    }
    return St(e, n), { ok: !1, reason: n };
  }
}
function ke() {
  if (Re || ee.length === 0) return;
  const e = ee.shift();
  Re = !0, fe = e;
  const t = _e, n = typeof e.rate == "number";
  n && (_e = e.rate), zo(e.text).then((r) => {
    n && (_e = t), Re = !1;
    const o = fe === e;
    if (fe = null, !o) {
      ke();
      return;
    }
    r.ok ? K !== "unsupported" && Q("ready") : Ve() ? Q("failed", r.reason, !0) : Q("unsupported", r.reason || "no-provider", !0), e.resolve(), ke();
  }).catch((r) => {
    n && (_e = t), Re = !1, fe = null, Q("failed", (r == null ? void 0 : r.message) || "unknown"), e.resolve(), ke();
  });
}
const oe = {
  /**
   * הקרא טקסט עברי. ה-promise תמיד נפתר (גם בכשל) כדי שמשחקים לא יתקעו.
   * @param {string} text
   * @returns {Promise<void>}
   */
  speak(e) {
    const t = ao(e);
    return new Promise((n) => {
      ee.push({ text: t, resolve: n }), ke();
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
    if (fe) {
      try {
        fe.resolve();
      } catch {
      }
      fe = null;
    }
    if (ee.forEach((e) => {
      try {
        e.resolve();
      } catch {
      }
    }), ee = [], Re = !1, te && (te = null), typeof speechSynthesis < "u" && typeof speechSynthesis.cancel == "function")
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
    return K !== "unsupported" && Ve();
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
    return Rn;
  },
  /**
   * משחרר ידנית את מנוע הקול אחרי gesture ידוע (כפתור התחל וכו').
   * משחקים יקראו לזה במקום להמתין ל-autoplay block.
   * @returns {Promise<void>}
   */
  unlock() {
    if (Ue = !0, Le = !1, ho().catch(() => {
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
    return Ve() ? K === "unsupported" && Q("idle", "recovered") : Q("unsupported", "no-speech-synthesis"), this.available;
  },
  /**
   * הגדר מהירות דיבור (0.5-2.0).
   * @param {number} rate
   */
  setRate(e) {
    _e = Math.max(0.5, Math.min(2, e));
  },
  /**
   * הגדר מהירות דיבור להדגשת ניקוד.
   * @param {{ rate?: number }} opts - rate: מהירות הדגשה (ברירת מחדל 0.5).
   */
  setNikudEmphasis({ rate: e } = {}) {
    e != null && (ht = Math.max(0.3, Math.min(1.5, e)));
  },
  /**
   * הקרא אות עם ניקוד בשני שלבים: קודם את ההברה בקצב טבעי כדי שהעיצור יהיה קצר,
   * ואז את צליל התנועה לבד בקצב האיטי שמיועד לניקוד - כך הילד שומע
   * "מ-אההההה" במקום "ממממ-אה" שמתקבל מהאטה אחידה של ההברה כולה.
   * @param {string} letter - האות (למשל 'ב').
   * @param {string} nikudSymbol - סמל הניקוד (למשל U+05B7).
   */
  speakNikud(e, t) {
    const n = e + t, r = X.find((o) => o.symbol === t);
    return new Promise((o) => {
      r && r.sound ? (ee.push({ text: n, resolve: () => {
      } }), ee.push({
        text: r.sound,
        rate: ht,
        resolve: () => o(void 0)
      })) : ee.push({ text: n, resolve: () => o(void 0) }), ke();
    });
  },
  /**
   * הקרא את צליל התנועה של הניקוד ("אָה", "אוֹ" וכו'),
   * כדי להדגים לילד מה להגות.
   * @param {string} nikudId - מזהה ניקוד מתוך nikudList (למשל 'kamatz').
   */
  speakVowel(e) {
    const t = X.find((n) => n.id === e);
    return !t || !t.sound ? Promise.resolve() : new Promise((n) => {
      ee.push({
        text: t.sound,
        rate: ht,
        resolve: () => n(void 0)
      }), ke();
    });
  }
}, Xt = "alefbet-audio-status-banner";
function So(e) {
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
function $o(e = typeof document < "u" ? document.body : null, t = {}) {
  const n = t.window || (typeof window < "u" ? window : null);
  if (!e || !n)
    return { destroy() {
    } };
  const r = e.querySelector("#" + Xt);
  r && r.parentNode && r.parentNode.removeChild(r);
  const o = e.ownerDocument.createElement("div");
  o.id = Xt, o.className = "alefbet-audio-banner", o.setAttribute("role", "status"), o.setAttribute("aria-live", "polite"), o.dir = "rtl", o.hidden = !0;
  const i = e.ownerDocument.createElement("span");
  i.className = "alefbet-audio-banner__msg", o.appendChild(i);
  const s = e.ownerDocument.createElement("button");
  s.type = "button", s.className = "alefbet-audio-banner__dismiss", s.setAttribute("aria-label", "סְגוֹר הוֹדָעָה"), s.textContent = "×", s.hidden = !0, o.appendChild(s), e.appendChild(o);
  let a = null;
  function c() {
    a && (clearTimeout(a), a = null);
  }
  function u() {
    c(), o.hidden = !0, o.classList.remove("is-visible", "is-await", "is-unsupported", "is-failed"), o.onclick = null, s.hidden = !0;
  }
  function l(p) {
    const f = So(p);
    if (!f) {
      u();
      return;
    }
    c(), i.textContent = f.message, o.hidden = !1, o.classList.add("is-visible"), o.classList.toggle("is-await", f.kind === "await"), o.classList.toggle("is-unsupported", f.kind === "unsupported"), o.classList.toggle("is-failed", f.kind === "failed"), f.kind, f.kind === "await" ? (o.onclick = () => {
      try {
        e.ownerDocument.body.dispatchEvent(new MouseEvent("pointerdown", { bubbles: !0 }));
      } catch {
      }
      u();
    }, s.hidden = !0) : f.kind === "unsupported" ? (o.onclick = null, s.hidden = !1, s.onclick = (_) => {
      _.stopPropagation(), u();
    }) : f.kind === "failed" && (o.onclick = null, s.hidden = !0, a = setTimeout(() => u(), 6e3));
  }
  function d(p) {
    const _ = /** @type {CustomEvent} */ (p.detail || {}).state;
    if (_ === "ready" || _ === "idle") {
      u();
      return;
    }
    l(_);
  }
  return n.addEventListener("alefbet:tts-state", d), {
    destroy() {
      n.removeEventListener("alefbet:tts-state", d), c(), o.parentNode && o.parentNode.removeChild(o);
    }
  };
}
function No(e, { banner: t = !0 } = {}) {
  const n = t ? $o(e.container) : null, r = () => {
    e.container.removeEventListener("pointerdown", r, !0), e.container.removeEventListener("keydown", r, !0), oe.unlock();
  };
  e.container.addEventListener("pointerdown", r, { once: !0, capture: !0 }), e.container.addEventListener("keydown", r, { once: !0, capture: !0 }), e.on("end", () => {
    e.container.removeEventListener("pointerdown", r, !0), e.container.removeEventListener("keydown", r, !0), n == null || n.destroy(), oe.cancel();
  });
}
function yl(e) {
  const t = [...e];
  for (let n = t.length - 1; n > 0; n--) {
    const r = Math.floor(Math.random() * (n + 1));
    [t[n], t[r]] = [t[r], t[n]];
  }
  return t;
}
function Co() {
  const e = nt();
  return e ? (e.state === "suspended" && e.resume(), e) : null;
}
function me(e, t, n = "sine", r = 0.3) {
  const o = Co();
  if (o)
    try {
      const i = o.createOscillator(), s = o.createGain();
      i.connect(s), s.connect(o.destination), i.type = n, i.frequency.setValueAtTime(e, o.currentTime), s.gain.setValueAtTime(r, o.currentTime), s.gain.exponentialRampToValueAtTime(1e-3, o.currentTime + t), i.start(o.currentTime), i.stop(o.currentTime + t + 0.05);
    } catch {
    }
}
const qe = {
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
}, Kt = {
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
}, xo = {
  shake: 420,
  bounce: 480,
  pulse: 600,
  fadeIn: 320,
  confetti: 700
};
function He(e, t) {
  !e || !Kt[t] || e.animate(Kt[t], {
    duration: xo[t] || 400,
    easing: "ease-in-out",
    fill: "none"
  });
}
function Lt(e, t) {
  const n = [];
  function r() {
    try {
      const a = localStorage.getItem(e);
      return a === null ? t : JSON.parse(a);
    } catch {
      return t;
    }
  }
  function o(a) {
    try {
      localStorage.setItem(e, JSON.stringify(a));
    } catch (c) {
      return console.warn(`[createLocalState] שגיאה בשמירת "${e}":`, c), !1;
    }
    return n.forEach((c) => c(a)), !0;
  }
  function i(a) {
    return o(a(r()));
  }
  function s(a) {
    return n.push(a), function() {
      const u = n.indexOf(a);
      u !== -1 && n.splice(u, 1);
    };
  }
  return { get: r, set: o, update: i, subscribe: s };
}
const To = "alefbet.progress.v1", It = Lt(To, {});
function Ln(e, t) {
  if (!Number.isFinite(e) || !Number.isFinite(t) || t <= 0) return 1;
  const n = e / t;
  return n >= 0.8 ? 3 : n >= 0.5 ? 2 : 1;
}
function Ao(e, { score: t, total: n }) {
  if (!e || !Number.isFinite(t) || !Number.isFinite(n) || n <= 0) return null;
  const r = Ln(t, n);
  let o = null;
  return It.update((i) => {
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
function vl(e) {
  return It.get()[e] ?? null;
}
function wl() {
  return It.get();
}
function Ro(e, t, n, r, o = {}) {
  qe.cheer(), o.gameId && Ao(o.gameId, { score: t, total: n });
  const i = Ln(t, n), s = "⭐".repeat(i) + "☆".repeat(3 - i), a = document.createElement("div");
  a.className = "completion-screen", a.innerHTML = `
    <div class="completion-screen__content">
      <div class="completion-screen__stars" aria-label="${i} כּוֹכָבִים">${s}</div>
      <h2 class="completion-screen__title">!כָּל הַכָּבוֹד</h2>
      <p class="completion-screen__score">נִיקּוּד: ${t} מִתּוֹךְ ${n}</p>
      <button class="completion-screen__replay btn btn--primary">שַׂחֵק שׁוּב</button>
    </div>
  `, a.querySelector(".completion-screen__replay").addEventListener("click", () => {
    a.remove(), r();
  }), e.innerHTML = "", e.appendChild(a), He(a.querySelector(".completion-screen__content"), "fadeIn");
}
function Lo(e, t, {
  totalRounds: n,
  progressBar: r = null,
  buildRoundUI: o,
  onCorrect: i,
  onWrong: s,
  transitionMs: a = 1200,
  playCorrectSound: c = !0,
  onReplay: u = () => location.reload()
}) {
  let l = !1;
  async function d(b) {
    if (l || e.ended) return;
    l = !0, c && qe.correct();
    try {
      if (b && await b(), e.ended) return;
      i && await i();
    } catch (k) {
      throw l = !1, k;
    }
    if (e.ended || (e.state.addScore(1), r == null || r.update(e.state.currentRound), !await e.delay(a))) return;
    e.nextRound() ? (l = !1, o()) : Ro(t, e.state.score, n, u, { gameId: e.gameId });
  }
  async function p(b) {
    if (!(l || e.ended)) {
      l = !0;
      try {
        b && await b(), !e.ended && s && await s();
      } finally {
        l = !1;
      }
    }
  }
  function f() {
    return l;
  }
  function _() {
    l = !1;
  }
  return { handleCorrect: d, handleWrong: p, isAnswered: f, reset: _ };
}
function Io(e, t) {
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
let bt = !1, $t = !1, Te = null;
const Zo = [
  "ResizeObserver loop",
  // אזהרת דפדפן שפירה
  "Script error."
  // שגיאת cross-origin אטומה, לרוב תוסף דפדפן
];
function Qt(e) {
  const t = String(e || "");
  return Zo.some((n) => t.includes(n));
}
function en() {
  var t;
  if ($t || typeof document > "u" || !document.body) return;
  $t = !0;
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
function Oo() {
  if (typeof window > "u") return { destroy() {
  } };
  if (bt) return { destroy() {
  } };
  bt = !0;
  const e = (n) => {
    Qt(n == null ? void 0 : n.message) || (console.error("[alefbet] uncaught error:", (n == null ? void 0 : n.error) ?? (n == null ? void 0 : n.message)), en());
  }, t = (n) => {
    const r = (
      /** @type {any} */
      n == null ? void 0 : n.reason
    );
    Qt((r == null ? void 0 : r.message) ?? r) || (console.error("[alefbet] unhandled rejection:", r), en());
  };
  return window.addEventListener("error", e), window.addEventListener("unhandledrejection", t), Te = () => {
    window.removeEventListener("error", e), window.removeEventListener("unhandledrejection", t), bt = !1, $t = !1;
  }, { destroy: () => {
    Te == null || Te(), Te = null;
  } };
}
function Po(e, t = "טוֹעֵן...") {
  e.innerHTML = `<div class="ab-loading">${t}</div>`;
}
function Mo(e) {
  e.innerHTML = "";
}
function _t(e) {
  return e !== null && typeof e == "object" && !Array.isArray(e);
}
function tn(e) {
  if (!_t(e) || typeof e.id != "string" || !e.id || !Array.isArray(e.rounds) || !e.rounds.every(_t) || e.meta !== void 0 && !_t(e.meta) || e.distractors !== void 0 && !Array.isArray(e.distractors))
    throw new Error("Invalid game content");
  const t = e.version ?? 1;
  if (!Number.isInteger(t) || Number(t) < 1) throw new Error("Invalid content version");
  const n = /* @__PURE__ */ new Set();
  for (const r of e.rounds)
    if (r.id !== void 0) {
      if (typeof r.id != "string" || !r.id || n.has(r.id)) throw new Error("Invalid round id");
      n.add(r.id);
    }
  return { ...e, version: t };
}
let jo = 0;
function gt() {
  return `round-${Date.now()}-${jo++}`;
}
class Se {
  // redo stack
  constructor(t, n) {
    this._contract = n, this._id = t.id ?? "game", this._version = t.version ?? 1, this._meta = { title: "", type: "multiple-choice", ...t.meta ?? {} }, this._rounds = (t.rounds ?? []).map((r) => ({ ...r, id: r.id || gt() })), this._distractors = t.distractors ?? [], this._handlers = [], this._past = [], this._future = [];
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
    const r = this.getRoundIndex(t);
    r !== -1 && (this._saveHistory(), this._rounds[r] = { ...this._rounds[r], ...n }, this._emit());
  }
  addRound(t = null) {
    var r;
    this._saveHistory();
    const n = { ...(r = this._contract) == null ? void 0 : r.createRound(), id: gt() };
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
    const r = { ...n, id: gt() };
    return this._rounds.splice(this.getRoundIndex(t) + 1, 0, r), this._emit(), r.id;
  }
  removeRound(t) {
    const n = this.getRoundIndex(t);
    n === -1 || this._rounds.length <= 1 || (this._saveHistory(), this._rounds.splice(n, 1), this._emit());
  }
  moveRound(t, n) {
    const r = this.getRoundIndex(t);
    if (r === -1) return;
    this._saveHistory();
    const [o] = this._rounds.splice(r, 1);
    this._rounds.splice(Math.max(0, Math.min(n, this._rounds.length)), 0, o), this._emit();
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
  validate() {
    return !this._contract || this._rounds.every((t) => this._contract.validateRound(t));
  }
  static fromJSON(t, n) {
    let r = tn(t);
    const o = (n == null ? void 0 : n.version) ?? 1;
    if (r.version < o && (n != null && n.migrate)) {
      const s = r.id;
      if (r = tn(n.migrate(r)), r.id !== s) throw new Error("Migration changed game identity");
    }
    if (r.version !== o) throw new Error("Unsupported content version");
    const i = new Se(r, n);
    if (!i.validate()) throw new Error("Invalid round content");
    return i;
  }
  static fromRoundsArray(t, n, r = {}, o = [], i) {
    return new Se({ id: t, meta: r, rounds: n, distractors: o, version: (i == null ? void 0 : i.version) ?? 1 }, i);
  }
}
const In = "alefbet.editor.";
function Zn(e) {
  return Lt(`${In}${e}`, null);
}
function On(e) {
  return Zn(e.id).set(e.toJSON());
}
function Pn(e, t) {
  const n = Zn(e).get();
  if (!n) return null;
  try {
    const r = Se.fromJSON(n, t);
    return r.id === e ? r : null;
  } catch {
    return null;
  }
}
function Fo(e) {
  try {
    localStorage.removeItem(`${In}${e}`);
  } catch {
  }
}
function Mn(e) {
  const t = JSON.stringify(e.toJSON(), null, 2), n = new Blob([t], { type: "application/json;charset=utf-8" }), r = URL.createObjectURL(n), o = document.createElement("a");
  o.href = r, o.download = `${e.id}-rounds.json`, o.click(), URL.revokeObjectURL(r);
}
function Do(e, t, n) {
  const r = e.container.querySelector(".game-header");
  if (!r) return;
  const o = document.createElement("div");
  o.className = "ab-lazy-editor";
  const i = document.createElement("span");
  i.setAttribute("role", "status");
  let s = !1, a = null;
  async function c() {
    if (!document.querySelector('link[href$="/runtime.css"]') || document.querySelector("link[data-alefbet-editor]")) return;
    const l = document.createElement("link");
    l.rel = "stylesheet";
    const d = new URL(".", import.meta.url);
    l.href = new URL("editor.css", d).href, l.dataset.alefbetEditor = "", await new Promise((p, f) => {
      l.onload = () => p(), l.onerror = () => {
        l.remove(), f(new Error("Editor styles unavailable"));
      }, document.head.appendChild(l);
    });
  }
  async function u(l) {
    if (!(s || e.ended)) {
      s = !0, i.textContent = "טוֹעֵן...";
      try {
        const [d] = await Promise.all([Promise.resolve().then(() => bl), c()]);
        if (e.ended) return;
        "serviceWorker" in navigator && navigator.serviceWorker.ready.then((p) => {
          var f;
          (f = p.active) == null || f.postMessage({ type: "cache-editor" });
        }).catch(() => {
        }), l === "audio" ? d.showAudioManager(t.id, t) : (a = new d.GameEditor(e.container, t, n), await new Promise((p) => requestAnimationFrame(p)), e.ended || (a.enterEditMode(), o.remove())), i.textContent = "";
      } catch {
        e.ended || (i.textContent = "לֹא הִצְלַחְנוּ לִטְעֹן אֶת הָעוֹרֵךְ. הִתְחַבְּרוּ לָרֶשֶׁת וְנַסּוּ שׁוּב.");
      } finally {
        s = !1;
      }
    }
  }
  for (const [l, d] of [["✏️ ערוך", "edit"], ["🎤 קול", "audio"]]) {
    const p = document.createElement("button");
    p.className = "btn", p.textContent = l, p.addEventListener("click", () => {
      u(d);
    }), o.appendChild(p);
  }
  o.appendChild(i), r.after(o), e.on("end", () => {
    a == null || a.destroy(), o.remove();
  });
}
const yt = /* @__PURE__ */ new WeakMap();
async function Bo(e, t) {
  xn(e);
  const n = {};
  if (yt.set(e, n), Oo(), Po(e, t.loadingMessage ?? "טוֹעֵן..."), await co(t.preloadTexts ?? []), yt.get(e) !== n)
    return { shell: null, activeRounds: [], gameData: null, aborted: !0 };
  if (t.onBeforeHide && (await t.onBeforeHide() === !1 || yt.get(e) !== n))
    return { shell: null, activeRounds: [], gameData: null, aborted: !0 };
  Mo(e);
  const r = t.editor ? Pn(t.gameId, t.editor.content) : null, o = r != null && r.rounds.length ? r.rounds : t.defaultRounds ?? [], i = new Kr(e, {
    totalRounds: t.totalRounds ?? o.length,
    title: t.title,
    gameId: t.gameId
  });
  t.audio !== !1 && No(i);
  let s = null;
  if (t.editor) {
    const a = {
      title: t.editor.title ?? t.title,
      type: t.editor.type ?? "multiple-choice"
    };
    s = Se.fromRoundsArray(t.gameId, o, a, t.editor.distractors ?? [], t.editor.content), Do(i, s, { restartGame: t.editor.restartGame });
  }
  return { shell: i, activeRounds: o, gameData: s, aborted: !1 };
}
async function Uo(e, t) {
  const n = await Bo(e, t);
  if (n.aborted) return n;
  const { shell: r, activeRounds: o } = n;
  if (!o.length)
    return r.bodyEl.textContent = "אֵין סִבּוּבִים לַמִּשְׂחָק.", r.end(), n;
  const i = Io(r.footerEl, o.length);
  let s = 0, a;
  const c = () => {
    s++, a && a(), a = void 0;
  }, u = Lo(r, e, {
    totalRounds: o.length,
    progressBar: i,
    transitionMs: t.transitionMs,
    playCorrectSound: t.playCorrectSound,
    onReplay: t.onReplay ?? (() => {
      Uo(e, t);
    }),
    buildRoundUI: l
  });
  r.on("end", c), r.on("start", () => {
    var d;
    i.update(0), (d = t.onStart) == null || d.call(t, r), u.reset();
  }), r.on("start", l);
  function l() {
    c(), r.bodyEl.innerHTML = "";
    const d = s, p = () => !r.ended && s === d, f = r.state.currentRound - 1;
    a = t.buildRound({
      shell: r,
      index: f,
      round: o[f],
      isActive: p,
      isAnswered: () => !p() || u.isAnswered(),
      onCorrect: async (_) => {
        p() && await u.handleCorrect(_);
      },
      onWrong: async (_) => {
        p() && await u.handleWrong(_);
      },
      schedule: (_, b) => r.schedule(() => {
        p() && _();
      }, b)
    });
  }
  return r.start(), n;
}
function kl({ hintAfter: e = 2, escalateAfter: t = 4, onHint: n, onEscalate: r } = {}) {
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
const jn = {
  a: { F1: 850, F2: 1400 },
  e: { F1: 550, F2: 2100 },
  i: { F1: 350, F2: 2700 },
  o: { F1: 550, F2: 1e3 },
  u: { F1: 350, F2: 850 }
}, Zt = {
  kamatz: "a",
  patah: "a",
  tzere: "e",
  segol: "e",
  hiriq: "i",
  holam: "o",
  kubbutz: "u"
};
function Ho(e, t) {
  if (!Number.isFinite(e) || !Number.isFinite(t) || e <= 0 || t <= 0 || t <= e)
    return { vowel: "", confidence: 0 };
  const n = Math.log2(e), r = Math.log2(t), o = [];
  for (const [c, u] of Object.entries(jn)) {
    const l = n - Math.log2(u.F1), d = r - Math.log2(u.F2);
    o.push({ vowel: c, dist: Math.sqrt(l * l + d * d) });
  }
  o.sort((c, u) => c.dist - u.dist);
  const i = o[0], s = o[1], a = s.dist === 0 ? 1 : Math.max(0, Math.min(1, 1 - i.dist / s.dist));
  return { vowel: i.vowel, confidence: a };
}
function El(e, t) {
  return !e || !t ? !1 : Zt[t] === e;
}
function Vo(e, t) {
  const n = e.length, r = Math.max(1, Math.min(t, n)), o = new Float32Array(r);
  for (let a = 0; a < r; a++) {
    let c = 0;
    const u = Math.PI * a / n;
    for (let l = 0; l < n; l++)
      c += e[l] * Math.cos(u * (l + 0.5));
    o[a] = c;
  }
  const i = new Float32Array(n), s = 2 / n;
  for (let a = 0; a < n; a++) {
    let c = o[0] * 0.5;
    for (let u = 1; u < r; u++)
      c += o[u] * Math.cos(Math.PI * u * (a + 0.5) / n);
    i[a] = s * c;
  }
  return i;
}
function qo(e, t) {
  if (!e || e.length === 0 || !Number.isFinite(t) || t <= 0)
    return { F1: 0, F2: 0 };
  const n = Vo(e, 80), r = Math.min(n.length - 3, Math.floor(3500 / t)), o = [];
  for (let u = 3; u <= r; u++) {
    const l = n[u];
    l > n[u - 1] && l > n[u - 2] && l > n[u + 1] && l > n[u + 2] && o.push({ freq: u * t, mag: l });
  }
  if (o.length === 0) return { F1: 0, F2: 0 };
  const i = o.filter((u) => u.freq >= 200 && u.freq <= 1100);
  if (i.length === 0) return { F1: 0, F2: 0 };
  i.sort((u, l) => l.mag - u.mag);
  const s = i[0].freq, a = Math.max(s + 250, 700), c = o.filter((u) => u.freq >= a && u.freq <= 3500);
  return c.length === 0 ? { F1: s, F2: 0 } : (c.sort((u, l) => l.mag - u.mag), { F1: s, F2: c[0].freq });
}
function zl() {
  var s;
  const e = typeof window < "u", t = e && !!((s = navigator == null ? void 0 : navigator.mediaDevices) != null && s.getUserMedia), n = e ? window.AudioContext || window.webkitAudioContext : null, r = t && !!n;
  let o = null;
  const i = () => ({ vowel: "", confidence: 0, F1: 0, F2: 0 });
  return {
    available: r,
    listen(a = 3e3) {
      return o == null || o(), r ? new Promise((c) => {
        let u = !1, l = null, d = null, p = null;
        const f = (b) => {
          var N;
          if (!u) {
            u = !0, p !== null && cancelAnimationFrame(p), l == null || l.getTracks().forEach((k) => {
              try {
                k.stop();
              } catch {
              }
            });
            try {
              (N = d == null ? void 0 : d.close()) == null || N.catch(() => {
              });
            } catch {
            }
            o === _ && (o = null), c(b);
          }
        }, _ = () => f(i());
        o = _, Promise.resolve().then(() => navigator.mediaDevices.getUserMedia({ audio: !0 })).then((b) => {
          if (u) {
            b.getTracks().forEach(($) => {
              try {
                $.stop();
              } catch {
              }
            });
            return;
          }
          l = b, d = new n();
          const N = d.createMediaStreamSource(l), k = d.createAnalyser();
          k.fftSize = 4096, k.smoothingTimeConstant = 0.2, N.connect(k);
          const C = d.sampleRate / k.fftSize, g = new Float32Array(k.frequencyBinCount), E = new Float32Array(k.fftSize), y = [], x = performance.now(), z = () => {
            if (u) return;
            if (performance.now() - x > a) {
              if (y.length < 3) {
                f(i());
                return;
              }
              const w = y.map((m) => m.F1).sort((m, v) => m - v), A = y.map((m) => m.F2).sort((m, v) => m - v), O = Math.floor(y.length / 2), H = w[O], V = A[O];
              f({ ...Ho(H, V), F1: H, F2: V });
              return;
            }
            k.getFloatTimeDomainData(E);
            let $ = 0;
            for (let w = 0; w < E.length; w++) $ += E[w] * E[w];
            if (Math.sqrt($ / E.length) > 0.015) {
              k.getFloatFrequencyData(g);
              const { F1: w, F2: A } = qo(g, C);
              w > 0 && A > 0 && A > w && y.push({ F1: w, F2: A });
            }
            p = requestAnimationFrame(z);
          };
          p = requestAnimationFrame(z);
        }).catch(() => f(i()));
      }) : Promise.resolve(i());
    },
    cancel() {
      o == null || o();
    }
  };
}
function Wo() {
  return ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/ogg"].find((t) => MediaRecorder.isTypeSupported(t)) || "";
}
function Jo() {
  var e;
  return typeof navigator < "u" && typeof ((e = navigator.mediaDevices) == null ? void 0 : e.getUserMedia) == "function" && typeof MediaRecorder < "u";
}
function Go() {
  let e = null, t = null, n = [];
  async function r() {
    if (e && e.state === "recording") return;
    t = await navigator.mediaDevices.getUserMedia({ audio: !0, video: !1 }), n = [];
    const c = {}, u = Wo();
    u && (c.mimeType = u), e = new MediaRecorder(t, c), e.ondataavailable = (l) => {
      var d;
      ((d = l.data) == null ? void 0 : d.size) > 0 && n.push(l.data);
    }, e.start(100);
  }
  function o() {
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
  return { start: r, stop: o, cancel: i, isActive: a };
}
const Yo = "alefbet-voices", ie = "recordings", Xo = 1;
let Ae = null;
function rt() {
  return Ae || (Ae = new Promise((e, t) => {
    const n = indexedDB.open(Yo, Xo);
    n.onupgradeneeded = () => {
      n.result.createObjectStore(ie);
    }, n.onsuccess = () => e(n.result), n.onerror = () => {
      Ae = null, t(n.error);
    };
  }), Ae);
}
function Ot(e, t) {
  return `${e}/${t}`;
}
async function Fn(e, t, n) {
  const r = await rt();
  return new Promise((o, i) => {
    const s = r.transaction(ie, "readwrite");
    s.objectStore(ie).put(n, Ot(e, t)), s.oncomplete = o, s.onerror = (a) => i(a.target.error);
  });
}
async function Pt(e, t) {
  const n = await rt();
  return new Promise((r, o) => {
    const s = n.transaction(ie, "readonly").objectStore(ie).get(Ot(e, t));
    s.onsuccess = () => r(s.result ?? null), s.onerror = (a) => o(a.target.error);
  });
}
async function Ko(e, t) {
  const n = await rt();
  return new Promise((r, o) => {
    const i = n.transaction(ie, "readwrite");
    i.objectStore(ie).delete(Ot(e, t)), i.oncomplete = r, i.onerror = (s) => o(s.target.error);
  });
}
async function Dn(e) {
  const t = await rt();
  return new Promise((n, r) => {
    const i = t.transaction(ie, "readonly").objectStore(ie).getAllKeys();
    i.onsuccess = () => {
      const s = `${e}/`;
      n(
        (i.result || []).filter((a) => a.startsWith(s)).map((a) => a.slice(s.length))
      );
    }, i.onerror = (s) => r(s.target.error);
  });
}
async function ge(e, t) {
  let n;
  try {
    n = await Pt(e, t);
  } catch {
    return !1;
  }
  return n ? await mo(n) ? !0 : new Promise((r) => {
    const o = URL.createObjectURL(n), i = new Audio(o), s = (a) => {
      URL.revokeObjectURL(o), r(a);
    };
    i.onended = () => s(!0), i.onerror = () => s(!1), i.play().catch(() => s(!1));
  }) : !1;
}
async function Sl(e, t) {
  return await Pt(e, t).catch(() => null) !== null;
}
const Bn = 210, Un = 550, Qo = {
  a: { F3: 2700, bandwidths: [90, 110, 170], gains: [1, 0.5, 0.15] },
  e: { F3: 2900, bandwidths: [80, 100, 160], gains: [1, 0.55, 0.2] },
  i: { F3: 3300, bandwidths: [60, 100, 160], gains: [1, 0.6, 0.25] },
  o: { F3: 2600, bandwidths: [80, 90, 150], gains: [1, 0.5, 0.1] },
  u: { F3: 2400, bandwidths: [60, 80, 140], gains: [1, 0.45, 0.1] }
};
function We(e) {
  const t = jn[e], n = Qo[e];
  return !t || !n ? null : {
    formants: [t.F1, t.F2, n.F3],
    bandwidths: [...n.bandwidths],
    gains: [...n.gains]
  };
}
const nn = {
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
function ei(e) {
  return nn[e] ?? nn[""];
}
function $l() {
  return nt() !== null;
}
let Me = null;
function ti(e) {
  if (Me && Me.sampleRate === e.sampleRate) return Me;
  const t = e.sampleRate, n = e.createBuffer(1, t, e.sampleRate), r = n.getChannelData(0);
  for (let o = 0; o < t; o++) r[o] = Math.random() * 2 - 1;
  return Me = n, n;
}
function Hn(e, t, n) {
  const r = e.createOscillator();
  r.type = "sawtooth", r.frequency.value = n;
  const o = e.createGain();
  o.gain.value = 0;
  const i = t.formants.map((s, a) => {
    const c = e.createBiquadFilter();
    c.type = "bandpass", c.frequency.value = s, c.Q.value = s / t.bandwidths[a];
    const u = e.createGain();
    return u.gain.value = t.gains[a], r.connect(c), c.connect(u), u.connect(o), c;
  });
  return o.connect(e.destination), { source: r, filters: i, master: o };
}
function vt(e, t, n, r) {
  const o = n.durationMs / 1e3, i = e.createBufferSource();
  i.buffer = ti(e), i.loop = !0;
  const s = e.createBiquadFilter();
  s.type = "bandpass", s.frequency.value = n.noiseHz ?? 2e3, s.Q.value = n.noiseQ ?? 1;
  const a = e.createGain();
  return a.gain.setValueAtTime(0, t), a.gain.linearRampToValueAtTime(r, t + Math.min(0.01, o / 3)), a.gain.linearRampToValueAtTime(1e-4, t + o), i.connect(s), s.connect(a), a.connect(e.destination), i.start(t), i.stop(t + o + 0.02), t + o;
}
function Vn(e, t, n, r, o, i) {
  const s = r / 1e3, { source: a, filters: c, master: u } = Hn(e, n, o);
  if (a.frequency.setValueAtTime(o * 1.04, t), a.frequency.linearRampToValueAtTime(o * 0.92, t + s), i) {
    const p = Math.min(0.09, s / 3);
    c.forEach((f, _) => {
      const b = i[_];
      b && (f.frequency.setValueAtTime(b, t), f.frequency.exponentialRampToValueAtTime(n.formants[_], t + p));
    });
  }
  const l = 0.04, d = 0.12;
  return u.gain.setValueAtTime(0, t), u.gain.linearRampToValueAtTime(0.5, t + l), u.gain.setValueAtTime(0.5, t + s - d), u.gain.linearRampToValueAtTime(1e-4, t + s), a.start(t), a.stop(t + s + 0.05), t + s;
}
function ni(e, t, n, r) {
  const o = n / 1e3, i = { formants: [250, 1100, 2200], bandwidths: [80, 200, 300], gains: [1, 0.12, 0.05] }, { source: s, master: a } = Hn(e, i, r);
  return a.gain.setValueAtTime(0, t), a.gain.linearRampToValueAtTime(0.35, t + 0.02), a.gain.setValueAtTime(0.35, t + o - 0.02), a.gain.linearRampToValueAtTime(1e-4, t + o), s.start(t), s.stop(t + o + 0.05), t + o;
}
function qn(e, t) {
  const n = Math.max(0, (t - e.currentTime) * 1e3) + 60;
  return new Promise((r) => setTimeout(r, n));
}
async function ri(e, t = {}) {
  const n = We(e);
  if (!n) return !1;
  const r = await Rt();
  if (!r) return !1;
  let o;
  try {
    const i = r.currentTime + 0.03;
    o = Vn(r, i, n, t.durationMs ?? Un, t.pitchHz ?? Bn, null);
  } catch {
    return !1;
  }
  return await qn(r, o), !0;
}
async function Wn(e, t, n = {}) {
  const r = We(t);
  if (!r) return !1;
  const o = await Rt();
  if (!o) return !1;
  const i = ei(e), s = n.pitchHz ?? Bn, a = n.durationMs ?? Un;
  let c;
  try {
    c = oi(o, i, e, r, a, s);
  } catch {
    return !1;
  }
  return await qn(o, c), !0;
}
function oi(e, t, n, r, o, i) {
  let s = e.currentTime + 0.03, a = null;
  switch (t.type) {
    case "plosive": {
      s = vt(e, s, t, t.voiced ? 0.25 : 0.35), s += 0.01;
      break;
    }
    case "fricative": {
      s = vt(e, s, t, 0.22) - 0.03;
      break;
    }
    case "affricate": {
      s += 0.03, s = vt(e, s, { ...t, durationMs: t.durationMs - 30 }, 0.3) - 0.02;
      break;
    }
    case "nasal": {
      s = ni(e, s, t.durationMs, i), a = [300, 1300, 2300];
      break;
    }
    case "liquid": {
      a = n === "r" ? [450, 1300, 1600] : [380, 1e3, 2600];
      break;
    }
    case "glide": {
      const c = We(n === "y" ? "i" : "u");
      a = c ? c.formants : null;
      break;
    }
  }
  return Vn(e, s, r, o, i, a);
}
const Je = "sound-bank";
function Jn(e) {
  return `letter:${e}`;
}
function Gn(e) {
  return `nikud:${e}`;
}
function Yn(e, t) {
  return `syllable:${e}:${t}`;
}
function ii(e) {
  return `word:${e}`;
}
function Xn() {
  const e = [];
  for (const t of we)
    e.push({ key: Jn(t.letter), label: t.nameNikud, group: "letters" });
  for (const t of X)
    e.push({ key: Gn(t.id), label: `${t.nameNikud} (${t.sound})`, group: "nikud" });
  for (const t of lo)
    for (const n of X)
      e.push({
        key: Yn(t, n.id),
        label: An(t, n.symbol),
        group: "syllables"
      });
  return e;
}
function Nl(e) {
  const t = Xn().find((r) => r.key === e);
  if (t) return t.label;
  const [, ...n] = e.split(":");
  return n.join(":");
}
function si() {
  return typeof navigator < "u" && navigator.onLine === !1;
}
async function ot(e) {
  try {
    return typeof indexedDB > "u" ? !1 : await ge(Je, e);
  } catch {
    return !1;
  }
}
async function it(e) {
  if (si() && !ai()) return !1;
  try {
    return await e(), oe.audioState !== "failed" && oe.audioState !== "unsupported";
  } catch {
    return !1;
  }
}
function ai() {
  return typeof speechSynthesis < "u";
}
async function Cl() {
  try {
    return typeof indexedDB > "u" ? [] : await Dn(Je);
  } catch {
    return [];
  }
}
async function xl(e) {
  if (await ot(Jn(e))) return "bank";
  const t = At(e), n = t ? t.nameNikud : e;
  return await it(() => oe.speak(n)) ? "tts" : t && await Wn(t.sound, "a", { durationMs: 400 }) ? "synth" : "none";
}
async function Tl(e) {
  if (await ot(Gn(e))) return "bank";
  if (await it(() => oe.speakVowel(e))) return "tts";
  const t = Zt[e];
  return t && await ri(t) ? "synth" : "none";
}
async function Al(e, t) {
  if (await ot(Yn(e, t))) return "bank";
  const n = X.find((i) => i.id === t);
  if (n && await it(() => oe.speakNikud(e, n.symbol))) return "tts";
  const r = At(e), o = Zt[t];
  return o && await Wn(r ? r.sound : "", o) ? "synth" : "none";
}
async function Rl(e) {
  return await ot(ii(e)) ? "bank" : await it(() => oe.speak(e)) ? "tts" : "none";
}
const rn = "alefbet.ttsProxyUrl";
function ci() {
  var i, s;
  if (typeof window > "u") return null;
  const e = new URLSearchParams(window.location.search).get("ttsProxy");
  if (e && window.localStorage)
    try {
      window.localStorage.setItem(rn, e);
    } catch {
    }
  const t = (
    /** @type {any} */
    window.ALEFBET_TTS_PROXY_URL
  ), n = (i = window.localStorage) == null ? void 0 : i.getItem(rn), r = (s = window.localStorage) == null ? void 0 : s.getItem("alefbet.nakdanProxyUrl"), o = e || t || n || r;
  return o ? String(o).replace(/\/+$/, "") : null;
}
function ui(e) {
  const [t, n, r] = e.split(":");
  if (t === "letter") {
    const o = At(n);
    return o ? o.nameNikud : null;
  }
  if (t === "nikud") {
    const o = X.find((i) => i.id === n);
    return o ? o.sound : null;
  }
  if (t === "syllable") {
    const o = X.find((i) => i.id === r);
    return o ? An(n, o.symbol) : null;
  }
  return t === "word" && e.slice(5) || null;
}
async function li(e, t) {
  const n = await fetch(`${e}/tts?text=${encodeURIComponent(t)}&lang=he`);
  if (!n.ok) throw new Error(`tts-proxy ${n.status}`);
  const r = await n.blob();
  if (!r || r.size === 0) throw new Error("empty-audio");
  return r;
}
async function Ll({ force: e = !1, extraTexts: t = [], onProgress: n } = {}) {
  const r = ci();
  if (!r)
    throw new Error("tts-proxy-not-configured: הגדירו כתובת דרך ?ttsProxy=... או window.ALEFBET_TTS_PROXY_URL");
  if (typeof indexedDB > "u")
    throw new Error("indexeddb-unavailable: אין אחסון מקומי לשמירת הצלילים");
  const o = [
    ...Xn().map((c) => c.key),
    ...t.filter((c) => c == null ? void 0 : c.trim()).map((c) => `word:${c}`)
  ], i = new Set(e ? [] : await Dn(Je).catch(() => [])), s = { total: o.length, compiled: 0, skipped: 0, failures: [] };
  let a = 0;
  for (const c of o) {
    if (a++, i.has(c)) {
      s.skipped++, n == null || n(a, o.length, c);
      continue;
    }
    const u = ui(c);
    if (!u) {
      s.failures.push({ key: c, reason: "unknown-key" }), n == null || n(a, o.length, c);
      continue;
    }
    try {
      const l = await li(r, u);
      await Fn(Je, c, l), s.compiled++;
    } catch (l) {
      s.failures.push({ key: c, reason: (l == null ? void 0 : l.message) || "fetch-failed" });
    }
    n == null || n(a, o.length, c);
  }
  return s;
}
const on = [
  "כָּל הַכָּבוֹד",
  "מְצֻיָּן",
  "יֹפִי",
  "נֶהְדָּר",
  "וָאוּ",
  "אֵיזֶה כֵּיף"
], sn = [
  "נַסּוּ שׁוּב, אַתֶּם יְכוֹלִים",
  "כִּמְעַט! הַקְשִׁיבוּ שׁוּב",
  "עוֹד נִסָּיוֹן קָטָן",
  "קְרוֹבִים מְאֹד"
];
function di() {
  return on[Math.floor(Math.random() * on.length)];
}
function Il() {
  return sn[Math.floor(Math.random() * sn.length)];
}
function Zl(e, t, n) {
  e.innerHTML = "";
  const r = document.createElement("div");
  r.className = "option-cards-grid";
  const o = t.map((i) => {
    const s = document.createElement("button");
    return s.className = "option-card", s.dataset.id = i.id, s.innerHTML = `
      <span class="option-card__emoji">${i.emoji || ""}</span>
      <span class="option-card__text">${i.text}</span>
    `, s.addEventListener("click", () => {
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
    /** נטרל את כל הכרטיסים */
    disable() {
      o.forEach(({ el: i }) => {
        i.disabled = !0;
      });
    },
    /** אפס את מצב הכרטיסים */
    reset() {
      o.forEach(({ el: i }) => {
        i.className = "option-card", i.disabled = !1;
      });
    },
    /** הסר את הרכיב */
    destroy() {
      e.innerHTML = "";
    }
  };
}
function Ol(e) {
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
      qe.correct(), r(o ?? `!${di()}`, "correct"), He(t, "bounce");
    },
    /** הצג עידוד — נסה שוב */
    wrong(o = "נַסֵּה שׁוּב") {
      qe.wrong(), r(o, "wrong"), He(t, "pulse");
    },
    /** הצג רמז */
    hint(o) {
      r(o, "hint"), He(t, "pulse");
    },
    /** הסר את הרכיב */
    destroy() {
      clearTimeout(n), t.remove();
    }
  };
}
function Pl(e, t) {
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
  X.forEach((u) => {
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
    localStorage.setItem("alefbet.nikudRate", String(u)), oe.setNikudEmphasis({ rate: u });
    const l = Array.from(n.querySelectorAll(".nikud-filter-cb")).filter((p) => (
      /** @type {HTMLInputElement} */
      p.checked
    )).map((p) => (
      /** @type {HTMLInputElement} */
      p.value
    )), d = new URL(window.location.href);
    l.length > 0 && l.length < X.length ? d.searchParams.set("allowedNikud", l.join(",")) : d.searchParams.delete("allowedNikud"), d.searchParams.delete("excludedNikud"), n.style.display = "none", window.history.replaceState({}, "", d), t && t(e);
  }, document.getElementById("close-settings-btn").onclick = () => {
    n.style.display = "none";
  };
}
function Ml(e) {
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
    highlight(r) {
      t.classList.remove("ab-zone--correct", "ab-zone--hover"), r && t.classList.add(`ab-zone--${r}`);
    },
    reset() {
      t.classList.remove("ab-zone--correct", "ab-zone--hover");
    },
    destroy() {
      t.removeEventListener("click", n);
    }
  };
}
function fi(e, t, n, r, o) {
  return e.map((i) => {
    const s = r > 0 ? (i.x - t) / r * 100 : 0, a = o > 0 ? (i.y - n) / o * 100 : 0;
    return `${s},${a}`;
  }).join(" ");
}
function jl(e, t) {
  const {
    image: n,
    zones: r = [],
    mode: o = "quiz",
    gameId: i,
    roundId: s,
    onCorrect: a,
    onWrong: c,
    onAllCorrect: u,
    onZoneTap: l,
    showZones: d = !1,
    autoPlayInstruction: p = !0,
    hintAfter: f = 3
  } = t, _ = o === "soundboard", b = document.createElement("div");
  b.className = "ab-zp-wrap";
  const N = document.createElement("img");
  N.className = "ab-zp-image", N.src = n, N.alt = "", N.draggable = !1, b.appendChild(N);
  const k = document.createElement("div");
  k.className = "ab-zp-layer", b.appendChild(k), e.appendChild(b);
  const C = /* @__PURE__ */ new Set();
  let g = 0, E = !1, y = !1;
  async function x($) {
    if (!(!i || E)) {
      E = !0;
      try {
        await ge(i, `zone-${$}`);
      } catch {
      }
      E = !1;
    }
  }
  function z() {
    if (y || f <= 0 || _ || g < f) return;
    y = !0;
    const $ = k.querySelectorAll(".ab-zp-zone");
    $.forEach((w, A) => {
      var O;
      (O = r[A]) != null && O.correct && !C.has(r[A].id) && w.classList.add("ab-zp-zone--hint");
    }), setTimeout(() => {
      $.forEach((w) => w.classList.remove("ab-zp-zone--hint")), y = !1, g = 0;
    }, 1500);
  }
  return r.forEach(($) => {
    const w = document.createElement("button");
    if (w.className = "ab-zp-zone", (d || _) && w.classList.add("ab-zp-zone--visible"), _ && w.classList.add("ab-zp-zone--soundboard"), w.style.left = `${$.x}%`, w.style.top = `${$.y}%`, w.style.width = `${$.width}%`, w.style.height = `${$.height}%`, w.setAttribute("aria-label", $.label || ($.correct ? "correct zone" : "zone")), $.shape === "polygon" && $.points && $.points.length >= 3) {
      const A = `zp-clip-${$.id}`;
      w.innerHTML = `<svg class="ab-zp-zone__poly-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs><clipPath id="${A}"><polygon points="${fi($.points, $.x, $.y, $.width, $.height)}"/></clipPath></defs>
        <rect x="0" y="0" width="100" height="100" clip-path="url(#${A})" fill="transparent"/>
      </svg>`, w.classList.add("ab-zp-zone--poly");
    }
    if (_ && $.label) {
      const A = document.createElement("span");
      A.className = "ab-zp-zone__label", A.textContent = $.label, w.appendChild(A);
    }
    w.addEventListener("click", () => {
      if (l && l($), x($.id), _) {
        w.classList.add("ab-zp-zone--tapped"), setTimeout(() => w.classList.remove("ab-zp-zone--tapped"), 400);
        return;
      }
      if (!C.has($.id))
        if ($.correct) {
          C.add($.id), w.classList.add("ab-zp-zone--correct"), a && a($);
          const A = r.filter((O) => O.correct).length;
          C.size >= A && u && u();
        } else
          w.classList.add("ab-zp-zone--wrong"), g++, c && c($), setTimeout(() => w.classList.remove("ab-zp-zone--wrong"), 600), z();
    }), k.appendChild(w);
  }), p && i && s && setTimeout(() => {
    ge(i, s).catch(() => {
    });
  }, 400), {
    async playInstruction() {
      return i && s ? ge(i, s) : !1;
    },
    async playZoneAudio($) {
      return i ? ge(i, `zone-${$}`) : !1;
    },
    revealCorrect() {
      k.querySelectorAll(".ab-zp-zone").forEach(($, w) => {
        var A;
        (A = r[w]) != null && A.correct && $.classList.add("ab-zp-zone--revealed");
      });
    },
    reset() {
      C.clear(), g = 0, y = !1, k.querySelectorAll(".ab-zp-zone").forEach(($) => {
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
      b.remove();
    }
  };
}
function Fl(e, t, n, r) {
  const o = e.querySelector(".game-header__spacer");
  if (!o) return null;
  const i = document.createElement("button");
  return i.className = "ab-header-btn", i.setAttribute("aria-label", n), i.textContent = t, i.onclick = r, o.innerHTML = "", o.appendChild(i), i;
}
const hi = "0 0 32 16", Kn = {
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
function pi(e) {
  const t = Kn[e];
  return t ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${hi}" aria-hidden="true" focusable="false">${t}</svg>` : null;
}
const Dl = Object.freeze(Object.keys(Kn));
function Bl(e, { size: t = "md" } = {}) {
  const n = document.createElement("div");
  n.className = `ab-nikud-box ab-nikud-box--${t} ab-nikud-box--${e.id}`;
  const r = document.createElement("div");
  r.className = "ab-nikud-box__box";
  const o = document.createElement("div");
  return o.className = "ab-nikud-box__mark", o.innerHTML = pi(e.id) ?? "", n.appendChild(r), n.appendChild(o), n;
}
function Qn(e, {
  gameId: t,
  voiceKey: n,
  label: r = "הקלטת קול",
  onSaved: o,
  onDeleted: i
}) {
  if (!Jo()) {
    const w = document.createElement("span");
    return w.className = "ab-voice-unsupported", w.textContent = "🎤 הקלטה לא נתמכת בדפדפן זה", e.appendChild(w), { refresh: async () => {
    }, destroy: () => w.remove() };
  }
  const s = Go(), a = document.createElement("div");
  a.className = "ab-voice-btn-wrap", a.setAttribute("aria-label", r), e.appendChild(a);
  let c = "idle", u = null, l = null, d = null, p = null, f = null, _ = null, b = 0;
  function N() {
    if (a.innerHTML = "", c === "idle")
      u = k("🎤", "ab-voice-btn ab-voice-btn--record", "התחל הקלטה", C), a.appendChild(u);
    else if (c === "recording") {
      f = document.createElement("span"), f.className = "ab-voice-indicator", a.appendChild(f);
      const w = document.createElement("span");
      w.className = "ab-voice-timer", w.textContent = "0:00", a.appendChild(w), b = 0, _ = setInterval(() => {
        b++;
        const A = Math.floor(b / 60), O = String(b % 60).padStart(2, "0");
        w.textContent = `${A}:${O}`, b >= 120 && g();
      }, 1e3), l = k("⏹", "ab-voice-btn ab-voice-btn--stop", "עצור הקלטה", g), a.appendChild(l);
    } else c === "has-voice" && (d = k("▶", "ab-voice-btn ab-voice-btn--play", "נגן הקלטה", E), a.appendChild(d), u = k("🎤", "ab-voice-btn ab-voice-btn--re-record", "הקלט מחדש", C), a.appendChild(u), p = k("🗑", "ab-voice-btn ab-voice-btn--delete", "מחק הקלטה", y), a.appendChild(p));
  }
  function k(w, A, O, H) {
    const V = document.createElement("button");
    return V.className = A, V.type = "button", V.title = O, V.setAttribute("aria-label", O), V.textContent = w, V.addEventListener("click", H), V;
  }
  async function C() {
    try {
      await s.start(), c = "recording", N();
    } catch (w) {
      console.warn("[voice-record-button] microphone access denied:", w), x("לא ניתן לגשת למיקרופון");
    }
  }
  async function g() {
    clearInterval(_);
    try {
      const w = await s.stop();
      await Fn(t, n, w), c = "has-voice", N(), o == null || o(w);
    } catch (w) {
      console.warn("[voice-record-button] stop error:", w), c = "idle", N();
    }
  }
  async function E() {
    d == null || d.setAttribute("disabled", "true"), await ge(t, n), d == null || d.removeAttribute("disabled");
  }
  async function y() {
    confirm("למחוק את ההקלטה?") && (await Ko(t, n), c = "idle", N(), i == null || i());
  }
  function x(w) {
    const A = document.createElement("span");
    A.className = "ab-voice-error", A.textContent = w, a.appendChild(A), setTimeout(() => A.remove(), 3e3);
  }
  async function z() {
    if (s.isActive()) return;
    c = await Pt(t, n).catch(() => null) ? "has-voice" : "idle", N();
  }
  function $() {
    clearInterval(_), s.isActive() && s.cancel(), a.remove();
  }
  return z(), { refresh: z, destroy: $ };
}
let be = null, re = null, er = 0, tr = 0, Ee = null, wt = 0, kt = 0;
const Ge = /* @__PURE__ */ new Map();
function nr(e, t) {
  var n;
  return ((n = document.elementFromPoint(e, t)) == null ? void 0 : n.closest('[data-drop-target="true"]')) || null;
}
function mi(e, t, n) {
  const r = e.getBoundingClientRect();
  er = r.width / 2, tr = r.height / 2, re = e.cloneNode(!0), Object.assign(re.style, {
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
    willChange: "transform"
    // מקדם שכבת compositor מראש - בלי זה הפריים הראשון של תזוזה עלול לגמגם
  }), rr(t, n), document.body.appendChild(re);
}
function rr(e, t) {
  re && (re.style.transform = `translate3d(${e - er}px, ${t - tr}px, 0) scale(1.12)`);
}
function bi(e, t) {
  wt = e, kt = t, Ee === null && (Ee = requestAnimationFrame(() => {
    Ee = null, rr(wt, kt), gi(nr(wt, kt));
  }));
}
function _i() {
  Ee !== null && (cancelAnimationFrame(Ee), Ee = null), re == null || re.remove(), re = null;
}
let ne = null;
function gi(e) {
  ne !== e && (ne == null || ne.classList.remove("drop-target--hover"), ne = e, e == null || e.classList.add("drop-target--hover"));
}
function yi() {
  ne == null || ne.classList.remove("drop-target--hover"), ne = null;
}
function vi(e, t) {
  e.classList.add("drag-source");
  let n = null, r = null, o = null;
  function i() {
    n && (e.removeEventListener("pointermove", n), e.removeEventListener("pointerup", r), e.removeEventListener("pointercancel", o), n = r = o = null), yi(), _i(), e.classList.remove("drag-source--dragging"), be = null;
  }
  function s(a) {
    a.button !== void 0 && a.button !== 0 || (a.preventDefault(), be && i(), be = { el: e, data: t }, e.classList.add("drag-source--dragging"), mi(e, a.clientX, a.clientY), e.setPointerCapture(a.pointerId), n = (c) => {
      bi(c.clientX, c.clientY);
    }, r = (c) => {
      const u = nr(c.clientX, c.clientY);
      i(), u && Ge.has(u) && Ge.get(u).onDrop({ data: t, sourceEl: e, targetEl: u });
    }, o = () => i(), e.addEventListener("pointermove", n), e.addEventListener("pointerup", r), e.addEventListener("pointercancel", o));
  }
  return e.addEventListener("pointerdown", s), {
    destroy() {
      e.removeEventListener("pointerdown", s), (be == null ? void 0 : be.el) === e && i(), e.classList.remove("drag-source");
    }
  };
}
function wi(e, t) {
  return e.setAttribute("data-drop-target", "true"), e.classList.add("drop-target--active"), Ge.set(e, { onDrop: t }), {
    destroy() {
      e.removeAttribute("data-drop-target"), e.classList.remove("drop-target--active", "drop-target--hover"), Ge.delete(e);
    }
  };
}
function ki(e, { onClick: t } = {}) {
  const n = document.createElement("div");
  n.className = "ab-editor-overlay", t && n.addEventListener("pointerdown", t);
  function r() {
    n.parentElement || (e.style.position = "relative", e.appendChild(n));
  }
  function o() {
    n.remove();
  }
  function i() {
    o();
  }
  return { show: r, hide: o, destroy: i };
}
function Ei(e, t, { onSelectRound: n, onAddRound: r, onDuplicateRound: o, onMoveRound: i }) {
  const s = document.createElement("div");
  s.className = "ab-editor-nav", s.setAttribute("aria-label", "ניווט סיבובים");
  const a = document.createElement("div");
  a.className = "ab-editor-nav__header", a.textContent = "סיבובים", s.appendChild(a);
  const c = document.createElement("div");
  c.className = "ab-editor-nav__list", s.appendChild(c);
  const u = document.createElement("button");
  u.className = "ab-editor-nav__add", u.textContent = "+ הוסף", u.addEventListener("click", () => r(null)), s.appendChild(u), e.appendChild(s);
  let l = null, d = [];
  function p() {
    d.forEach((k) => k.destroy()), d = [];
  }
  function f(k, C) {
    const g = document.createElement("div");
    g.className = "ab-editor-nav__thumb", k.id === l && g.classList.add("ab-editor-nav__thumb--active"), g.setAttribute("role", "button"), g.setAttribute("tabindex", "0"), g.setAttribute("aria-label", `סיבוב ${C + 1}`), g.dataset.roundId = k.id, k.image && (g.style.backgroundImage = `url(${k.image})`, g.classList.add("ab-editor-nav__thumb--has-img"));
    const E = document.createElement("div");
    E.className = "ab-editor-nav__grip", E.innerHTML = "⠿", E.setAttribute("aria-hidden", "true"), E.title = "גרור לשינוי סדר", g.appendChild(E);
    const y = document.createElement("div");
    if (y.className = "ab-editor-nav__num", y.textContent = String(C + 1), g.appendChild(y), k.correctEmoji && !k.image) {
      const z = document.createElement("div");
      z.className = "ab-editor-nav__emoji", z.textContent = k.correctEmoji, g.appendChild(z);
    }
    if (k.target) {
      const z = document.createElement("div");
      z.className = "ab-editor-nav__letter", z.textContent = k.target, g.appendChild(z);
    }
    const x = document.createElement("button");
    return x.className = "ab-editor-nav__dup", x.innerHTML = "⧉", x.title = "שכפל סיבוב", x.setAttribute("aria-label", "שכפל סיבוב"), x.addEventListener("click", (z) => {
      z.stopPropagation(), o(k.id);
    }), g.appendChild(x), g.addEventListener("click", () => n(k.id)), g.addEventListener("keydown", (z) => {
      (z.key === "Enter" || z.key === " ") && (z.preventDefault(), n(k.id));
    }), d.push(vi(E, { roundId: k.id })), d.push(wi(g, ({ data: z }) => {
      z.roundId !== k.id && i(z.roundId, t.getRoundIndex(k.id));
    })), g;
  }
  function _() {
    p(), c.innerHTML = "", t.rounds.forEach((k, C) => c.appendChild(f(k, C)));
  }
  function b(k) {
    l = k, c.querySelectorAll(".ab-editor-nav__thumb").forEach((C) => {
      C.classList.toggle("ab-editor-nav__thumb--active", C.dataset.roundId === k);
    });
  }
  function N() {
    p(), s.remove();
  }
  return _(), { refresh: _, setActiveRound: b, destroy: N };
}
function h(e, t, n) {
  function r(a, c) {
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
      const p = l[d];
      p in a || (a[p] = u[p].bind(a));
    }
  }
  const o = (n == null ? void 0 : n.Parent) ?? Object;
  class i extends o {
  }
  Object.defineProperty(i, "name", { value: e });
  function s(a) {
    var c;
    const u = n != null && n.Parent ? new i() : this;
    r(u, a), (c = u._zod).deferred ?? (c.deferred = []);
    for (const l of u._zod.deferred)
      l();
    return u;
  }
  return Object.defineProperty(s, "init", { value: r }), Object.defineProperty(s, Symbol.hasInstance, {
    value: (a) => {
      var c, u;
      return n != null && n.Parent && a instanceof n.Parent ? !0 : (u = (c = a == null ? void 0 : a._zod) == null ? void 0 : c.traits) == null ? void 0 : u.has(e);
    }
  }), Object.defineProperty(s, "name", { value: e }), s;
}
class ze extends Error {
  constructor() {
    super("Encountered Promise during synchronous parse. Use .parseAsync() instead.");
  }
}
class or extends Error {
  constructor(t) {
    super(`Encountered unidirectional transform during encode: ${t}`), this.name = "ZodEncodeError";
  }
}
const ir = {};
function ae(e) {
  return ir;
}
function sr(e) {
  const t = Object.values(e).filter((r) => typeof r == "number");
  return Object.entries(e).filter(([r, o]) => t.indexOf(+r) === -1).map(([r, o]) => o);
}
function Nt(e, t) {
  return typeof t == "bigint" ? t.toString() : t;
}
function Mt(e) {
  return {
    get value() {
      {
        const t = e();
        return Object.defineProperty(this, "value", { value: t }), t;
      }
    }
  };
}
function jt(e) {
  return e == null;
}
function Ft(e) {
  const t = e.startsWith("^") ? 1 : 0, n = e.endsWith("$") ? e.length - 1 : e.length;
  return e.slice(t, n);
}
function zi(e, t) {
  const n = (e.toString().split(".")[1] || "").length, r = t.toString();
  let o = (r.split(".")[1] || "").length;
  if (o === 0 && /\d?e-\d?/.test(r)) {
    const c = r.match(/\d?e-(\d?)/);
    c != null && c[1] && (o = Number.parseInt(c[1]));
  }
  const i = n > o ? n : o, s = Number.parseInt(e.toFixed(i).replace(".", "")), a = Number.parseInt(t.toFixed(i).replace(".", ""));
  return s % a / 10 ** i;
}
const an = Symbol("evaluating");
function L(e, t, n) {
  let r;
  Object.defineProperty(e, t, {
    get() {
      if (r !== an)
        return r === void 0 && (r = an, r = n()), r;
    },
    set(o) {
      Object.defineProperty(e, t, {
        value: o
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
function ue(...e) {
  const t = {};
  for (const n of e) {
    const r = Object.getOwnPropertyDescriptors(n);
    Object.assign(t, r);
  }
  return Object.defineProperties({}, t);
}
function cn(e) {
  return JSON.stringify(e);
}
function Si(e) {
  return e.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
const ar = "captureStackTrace" in Error ? Error.captureStackTrace : (...e) => {
};
function Ye(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
const $i = Mt(() => {
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
function $e(e) {
  if (Ye(e) === !1)
    return !1;
  const t = e.constructor;
  if (t === void 0 || typeof t != "function")
    return !0;
  const n = t.prototype;
  return !(Ye(n) === !1 || Object.prototype.hasOwnProperty.call(n, "isPrototypeOf") === !1);
}
function cr(e) {
  return $e(e) ? { ...e } : Array.isArray(e) ? [...e] : e;
}
const Ni = /* @__PURE__ */ new Set(["string", "number", "symbol"]);
function st(e) {
  return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function le(e, t, n) {
  const r = new e._zod.constr(t ?? e._zod.def);
  return (!t || n != null && n.parent) && (r._zod.parent = e), r;
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
function Ci(e) {
  return Object.keys(e).filter((t) => e[t]._zod.optin === "optional" && e[t]._zod.optout === "optional");
}
const xi = {
  safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
  int32: [-2147483648, 2147483647],
  uint32: [0, 4294967295],
  float32: [-34028234663852886e22, 34028234663852886e22],
  float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
};
function Ti(e, t) {
  const n = e._zod.def, r = n.checks;
  if (r && r.length > 0)
    throw new Error(".pick() cannot be used on object schemas containing refinements");
  const i = ue(e._zod.def, {
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
  return le(e, i);
}
function Ai(e, t) {
  const n = e._zod.def, r = n.checks;
  if (r && r.length > 0)
    throw new Error(".omit() cannot be used on object schemas containing refinements");
  const i = ue(e._zod.def, {
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
  return le(e, i);
}
function Ri(e, t) {
  if (!$e(t))
    throw new Error("Invalid input to extend: expected a plain object");
  const n = e._zod.def.checks;
  if (n && n.length > 0) {
    const i = e._zod.def.shape;
    for (const s in t)
      if (Object.getOwnPropertyDescriptor(i, s) !== void 0)
        throw new Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
  }
  const o = ue(e._zod.def, {
    get shape() {
      const i = { ...e._zod.def.shape, ...t };
      return pe(this, "shape", i), i;
    }
  });
  return le(e, o);
}
function Li(e, t) {
  if (!$e(t))
    throw new Error("Invalid input to safeExtend: expected a plain object");
  const n = ue(e._zod.def, {
    get shape() {
      const r = { ...e._zod.def.shape, ...t };
      return pe(this, "shape", r), r;
    }
  });
  return le(e, n);
}
function Ii(e, t) {
  const n = ue(e._zod.def, {
    get shape() {
      const r = { ...e._zod.def.shape, ...t._zod.def.shape };
      return pe(this, "shape", r), r;
    },
    get catchall() {
      return t._zod.def.catchall;
    },
    checks: []
    // delete existing checks
  });
  return le(e, n);
}
function Zi(e, t, n) {
  const o = t._zod.def.checks;
  if (o && o.length > 0)
    throw new Error(".partial() cannot be used on object schemas containing refinements");
  const s = ue(t._zod.def, {
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
  return le(t, s);
}
function Oi(e, t, n) {
  const r = ue(t._zod.def, {
    get shape() {
      const o = t._zod.def.shape, i = { ...o };
      if (n)
        for (const s in n) {
          if (!(s in i))
            throw new Error(`Unrecognized key: "${s}"`);
          n[s] && (i[s] = new e({
            type: "nonoptional",
            innerType: o[s]
          }));
        }
      else
        for (const s in o)
          i[s] = new e({
            type: "nonoptional",
            innerType: o[s]
          });
      return pe(this, "shape", i), i;
    }
  });
  return le(t, r);
}
function ye(e, t = 0) {
  var n;
  if (e.aborted === !0)
    return !0;
  for (let r = t; r < e.issues.length; r++)
    if (((n = e.issues[r]) == null ? void 0 : n.continue) !== !0)
      return !0;
  return !1;
}
function ve(e, t) {
  return t.map((n) => {
    var r;
    return (r = n).path ?? (r.path = []), n.path.unshift(e), n;
  });
}
function je(e) {
  return typeof e == "string" ? e : e == null ? void 0 : e.message;
}
function ce(e, t, n) {
  var o, i, s, a, c, u;
  const r = { ...e, path: e.path ?? [] };
  if (!e.message) {
    const l = je((s = (i = (o = e.inst) == null ? void 0 : o._zod.def) == null ? void 0 : i.error) == null ? void 0 : s.call(i, e)) ?? je((a = t == null ? void 0 : t.error) == null ? void 0 : a.call(t, e)) ?? je((c = n.customError) == null ? void 0 : c.call(n, e)) ?? je((u = n.localeError) == null ? void 0 : u.call(n, e)) ?? "Invalid input";
    r.message = l;
  }
  return delete r.inst, delete r.continue, t != null && t.reportInput || delete r.input, r;
}
function Dt(e) {
  return Array.isArray(e) ? "array" : typeof e == "string" ? "string" : "unknown";
}
function Ze(...e) {
  const [t, n, r] = e;
  return typeof t == "string" ? {
    message: t,
    code: "custom",
    input: n,
    inst: r
  } : { ...t };
}
const ur = (e, t) => {
  e.name = "$ZodError", Object.defineProperty(e, "_zod", {
    value: e._zod,
    enumerable: !1
  }), Object.defineProperty(e, "issues", {
    value: t,
    enumerable: !1
  }), e.message = JSON.stringify(t, Nt, 2), Object.defineProperty(e, "toString", {
    value: () => e.message,
    enumerable: !1
  });
}, lr = h("$ZodError", ur), dr = h("$ZodError", ur, { Parent: Error });
function Pi(e, t = (n) => n.message) {
  const n = {}, r = [];
  for (const o of e.issues)
    o.path.length > 0 ? (n[o.path[0]] = n[o.path[0]] || [], n[o.path[0]].push(t(o))) : r.push(t(o));
  return { formErrors: r, fieldErrors: n };
}
function Mi(e, t = (n) => n.message) {
  const n = { _errors: [] }, r = (o) => {
    for (const i of o.issues)
      if (i.code === "invalid_union" && i.errors.length)
        i.errors.map((s) => r({ issues: s }));
      else if (i.code === "invalid_key")
        r({ issues: i.issues });
      else if (i.code === "invalid_element")
        r({ issues: i.issues });
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
  return r(e), n;
}
const Bt = (e) => (t, n, r, o) => {
  const i = r ? Object.assign(r, { async: !1 }) : { async: !1 }, s = t._zod.run({ value: n, issues: [] }, i);
  if (s instanceof Promise)
    throw new ze();
  if (s.issues.length) {
    const a = new ((o == null ? void 0 : o.Err) ?? e)(s.issues.map((c) => ce(c, i, ae())));
    throw ar(a, o == null ? void 0 : o.callee), a;
  }
  return s.value;
}, Ut = (e) => async (t, n, r, o) => {
  const i = r ? Object.assign(r, { async: !0 }) : { async: !0 };
  let s = t._zod.run({ value: n, issues: [] }, i);
  if (s instanceof Promise && (s = await s), s.issues.length) {
    const a = new ((o == null ? void 0 : o.Err) ?? e)(s.issues.map((c) => ce(c, i, ae())));
    throw ar(a, o == null ? void 0 : o.callee), a;
  }
  return s.value;
}, at = (e) => (t, n, r) => {
  const o = r ? { ...r, async: !1 } : { async: !1 }, i = t._zod.run({ value: n, issues: [] }, o);
  if (i instanceof Promise)
    throw new ze();
  return i.issues.length ? {
    success: !1,
    error: new (e ?? lr)(i.issues.map((s) => ce(s, o, ae())))
  } : { success: !0, data: i.value };
}, ji = /* @__PURE__ */ at(dr), ct = (e) => async (t, n, r) => {
  const o = r ? Object.assign(r, { async: !0 }) : { async: !0 };
  let i = t._zod.run({ value: n, issues: [] }, o);
  return i instanceof Promise && (i = await i), i.issues.length ? {
    success: !1,
    error: new e(i.issues.map((s) => ce(s, o, ae())))
  } : { success: !0, data: i.value };
}, Fi = /* @__PURE__ */ ct(dr), Di = (e) => (t, n, r) => {
  const o = r ? Object.assign(r, { direction: "backward" }) : { direction: "backward" };
  return Bt(e)(t, n, o);
}, Bi = (e) => (t, n, r) => Bt(e)(t, n, r), Ui = (e) => async (t, n, r) => {
  const o = r ? Object.assign(r, { direction: "backward" }) : { direction: "backward" };
  return Ut(e)(t, n, o);
}, Hi = (e) => async (t, n, r) => Ut(e)(t, n, r), Vi = (e) => (t, n, r) => {
  const o = r ? Object.assign(r, { direction: "backward" }) : { direction: "backward" };
  return at(e)(t, n, o);
}, qi = (e) => (t, n, r) => at(e)(t, n, r), Wi = (e) => async (t, n, r) => {
  const o = r ? Object.assign(r, { direction: "backward" }) : { direction: "backward" };
  return ct(e)(t, n, o);
}, Ji = (e) => async (t, n, r) => ct(e)(t, n, r), Gi = /^[cC][^\s-]{8,}$/, Yi = /^[0-9a-z]+$/, Xi = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/, Ki = /^[0-9a-vA-V]{20}$/, Qi = /^[A-Za-z0-9]{27}$/, es = /^[a-zA-Z0-9_-]{21}$/, ts = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/, ns = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/, un = (e) => e ? new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${e}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`) : /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/, rs = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/, os = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
function is() {
  return new RegExp(os, "u");
}
const ss = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, as = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/, cs = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/, us = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, ls = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/, fr = /^[A-Za-z0-9_-]*$/, ds = /^\+[1-9]\d{6,14}$/, hr = "(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))", fs = /* @__PURE__ */ new RegExp(`^${hr}$`);
function pr(e) {
  const t = "(?:[01]\\d|2[0-3]):[0-5]\\d";
  return typeof e.precision == "number" ? e.precision === -1 ? `${t}` : e.precision === 0 ? `${t}:[0-5]\\d` : `${t}:[0-5]\\d\\.\\d{${e.precision}}` : `${t}(?::[0-5]\\d(?:\\.\\d+)?)?`;
}
function hs(e) {
  return new RegExp(`^${pr(e)}$`);
}
function ps(e) {
  const t = pr({ precision: e.precision }), n = ["Z"];
  e.local && n.push(""), e.offset && n.push("([+-](?:[01]\\d|2[0-3]):[0-5]\\d)");
  const r = `${t}(?:${n.join("|")})`;
  return new RegExp(`^${hr}T(?:${r})$`);
}
const ms = (e) => {
  const t = e ? `[\\s\\S]{${(e == null ? void 0 : e.minimum) ?? 0},${(e == null ? void 0 : e.maximum) ?? ""}}` : "[\\s\\S]*";
  return new RegExp(`^${t}$`);
}, bs = /^-?\d+$/, mr = /^-?\d+(?:\.\d+)?$/, _s = /^(?:true|false)$/i, gs = /^[^A-Z]*$/, ys = /^[^a-z]*$/, J = /* @__PURE__ */ h("$ZodCheck", (e, t) => {
  var n;
  e._zod ?? (e._zod = {}), e._zod.def = t, (n = e._zod).onattach ?? (n.onattach = []);
}), br = {
  number: "number",
  bigint: "bigint",
  object: "date"
}, _r = /* @__PURE__ */ h("$ZodCheckLessThan", (e, t) => {
  J.init(e, t);
  const n = br[typeof t.value];
  e._zod.onattach.push((r) => {
    const o = r._zod.bag, i = (t.inclusive ? o.maximum : o.exclusiveMaximum) ?? Number.POSITIVE_INFINITY;
    t.value < i && (t.inclusive ? o.maximum = t.value : o.exclusiveMaximum = t.value);
  }), e._zod.check = (r) => {
    (t.inclusive ? r.value <= t.value : r.value < t.value) || r.issues.push({
      origin: n,
      code: "too_big",
      maximum: typeof t.value == "object" ? t.value.getTime() : t.value,
      input: r.value,
      inclusive: t.inclusive,
      inst: e,
      continue: !t.abort
    });
  };
}), gr = /* @__PURE__ */ h("$ZodCheckGreaterThan", (e, t) => {
  J.init(e, t);
  const n = br[typeof t.value];
  e._zod.onattach.push((r) => {
    const o = r._zod.bag, i = (t.inclusive ? o.minimum : o.exclusiveMinimum) ?? Number.NEGATIVE_INFINITY;
    t.value > i && (t.inclusive ? o.minimum = t.value : o.exclusiveMinimum = t.value);
  }), e._zod.check = (r) => {
    (t.inclusive ? r.value >= t.value : r.value > t.value) || r.issues.push({
      origin: n,
      code: "too_small",
      minimum: typeof t.value == "object" ? t.value.getTime() : t.value,
      input: r.value,
      inclusive: t.inclusive,
      inst: e,
      continue: !t.abort
    });
  };
}), vs = /* @__PURE__ */ h("$ZodCheckMultipleOf", (e, t) => {
  J.init(e, t), e._zod.onattach.push((n) => {
    var r;
    (r = n._zod.bag).multipleOf ?? (r.multipleOf = t.value);
  }), e._zod.check = (n) => {
    if (typeof n.value != typeof t.value)
      throw new Error("Cannot mix number and bigint in multiple_of check.");
    (typeof n.value == "bigint" ? n.value % t.value === BigInt(0) : zi(n.value, t.value) === 0) || n.issues.push({
      origin: typeof n.value,
      code: "not_multiple_of",
      divisor: t.value,
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), ws = /* @__PURE__ */ h("$ZodCheckNumberFormat", (e, t) => {
  var s;
  J.init(e, t), t.format = t.format || "float64";
  const n = (s = t.format) == null ? void 0 : s.includes("int"), r = n ? "int" : "number", [o, i] = xi[t.format];
  e._zod.onattach.push((a) => {
    const c = a._zod.bag;
    c.format = t.format, c.minimum = o, c.maximum = i, n && (c.pattern = bs);
  }), e._zod.check = (a) => {
    const c = a.value;
    if (n) {
      if (!Number.isInteger(c)) {
        a.issues.push({
          expected: r,
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
          origin: r,
          inclusive: !0,
          continue: !t.abort
        }) : a.issues.push({
          input: c,
          code: "too_small",
          minimum: Number.MIN_SAFE_INTEGER,
          note: "Integers must be within the safe integer range.",
          inst: e,
          origin: r,
          inclusive: !0,
          continue: !t.abort
        });
        return;
      }
    }
    c < o && a.issues.push({
      origin: "number",
      input: c,
      code: "too_small",
      minimum: o,
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
}), ks = /* @__PURE__ */ h("$ZodCheckMaxLength", (e, t) => {
  var n;
  J.init(e, t), (n = e._zod.def).when ?? (n.when = (r) => {
    const o = r.value;
    return !jt(o) && o.length !== void 0;
  }), e._zod.onattach.push((r) => {
    const o = r._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
    t.maximum < o && (r._zod.bag.maximum = t.maximum);
  }), e._zod.check = (r) => {
    const o = r.value;
    if (o.length <= t.maximum)
      return;
    const s = Dt(o);
    r.issues.push({
      origin: s,
      code: "too_big",
      maximum: t.maximum,
      inclusive: !0,
      input: o,
      inst: e,
      continue: !t.abort
    });
  };
}), Es = /* @__PURE__ */ h("$ZodCheckMinLength", (e, t) => {
  var n;
  J.init(e, t), (n = e._zod.def).when ?? (n.when = (r) => {
    const o = r.value;
    return !jt(o) && o.length !== void 0;
  }), e._zod.onattach.push((r) => {
    const o = r._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
    t.minimum > o && (r._zod.bag.minimum = t.minimum);
  }), e._zod.check = (r) => {
    const o = r.value;
    if (o.length >= t.minimum)
      return;
    const s = Dt(o);
    r.issues.push({
      origin: s,
      code: "too_small",
      minimum: t.minimum,
      inclusive: !0,
      input: o,
      inst: e,
      continue: !t.abort
    });
  };
}), zs = /* @__PURE__ */ h("$ZodCheckLengthEquals", (e, t) => {
  var n;
  J.init(e, t), (n = e._zod.def).when ?? (n.when = (r) => {
    const o = r.value;
    return !jt(o) && o.length !== void 0;
  }), e._zod.onattach.push((r) => {
    const o = r._zod.bag;
    o.minimum = t.length, o.maximum = t.length, o.length = t.length;
  }), e._zod.check = (r) => {
    const o = r.value, i = o.length;
    if (i === t.length)
      return;
    const s = Dt(o), a = i > t.length;
    r.issues.push({
      origin: s,
      ...a ? { code: "too_big", maximum: t.length } : { code: "too_small", minimum: t.length },
      inclusive: !0,
      exact: !0,
      input: r.value,
      inst: e,
      continue: !t.abort
    });
  };
}), ut = /* @__PURE__ */ h("$ZodCheckStringFormat", (e, t) => {
  var n, r;
  J.init(e, t), e._zod.onattach.push((o) => {
    const i = o._zod.bag;
    i.format = t.format, t.pattern && (i.patterns ?? (i.patterns = /* @__PURE__ */ new Set()), i.patterns.add(t.pattern));
  }), t.pattern ? (n = e._zod).check ?? (n.check = (o) => {
    t.pattern.lastIndex = 0, !t.pattern.test(o.value) && o.issues.push({
      origin: "string",
      code: "invalid_format",
      format: t.format,
      input: o.value,
      ...t.pattern ? { pattern: t.pattern.toString() } : {},
      inst: e,
      continue: !t.abort
    });
  }) : (r = e._zod).check ?? (r.check = () => {
  });
}), Ss = /* @__PURE__ */ h("$ZodCheckRegex", (e, t) => {
  ut.init(e, t), e._zod.check = (n) => {
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
}), $s = /* @__PURE__ */ h("$ZodCheckLowerCase", (e, t) => {
  t.pattern ?? (t.pattern = gs), ut.init(e, t);
}), Ns = /* @__PURE__ */ h("$ZodCheckUpperCase", (e, t) => {
  t.pattern ?? (t.pattern = ys), ut.init(e, t);
}), Cs = /* @__PURE__ */ h("$ZodCheckIncludes", (e, t) => {
  J.init(e, t);
  const n = st(t.includes), r = new RegExp(typeof t.position == "number" ? `^.{${t.position}}${n}` : n);
  t.pattern = r, e._zod.onattach.push((o) => {
    const i = o._zod.bag;
    i.patterns ?? (i.patterns = /* @__PURE__ */ new Set()), i.patterns.add(r);
  }), e._zod.check = (o) => {
    o.value.includes(t.includes, t.position) || o.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "includes",
      includes: t.includes,
      input: o.value,
      inst: e,
      continue: !t.abort
    });
  };
}), xs = /* @__PURE__ */ h("$ZodCheckStartsWith", (e, t) => {
  J.init(e, t);
  const n = new RegExp(`^${st(t.prefix)}.*`);
  t.pattern ?? (t.pattern = n), e._zod.onattach.push((r) => {
    const o = r._zod.bag;
    o.patterns ?? (o.patterns = /* @__PURE__ */ new Set()), o.patterns.add(n);
  }), e._zod.check = (r) => {
    r.value.startsWith(t.prefix) || r.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "starts_with",
      prefix: t.prefix,
      input: r.value,
      inst: e,
      continue: !t.abort
    });
  };
}), Ts = /* @__PURE__ */ h("$ZodCheckEndsWith", (e, t) => {
  J.init(e, t);
  const n = new RegExp(`.*${st(t.suffix)}$`);
  t.pattern ?? (t.pattern = n), e._zod.onattach.push((r) => {
    const o = r._zod.bag;
    o.patterns ?? (o.patterns = /* @__PURE__ */ new Set()), o.patterns.add(n);
  }), e._zod.check = (r) => {
    r.value.endsWith(t.suffix) || r.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "ends_with",
      suffix: t.suffix,
      input: r.value,
      inst: e,
      continue: !t.abort
    });
  };
}), As = /* @__PURE__ */ h("$ZodCheckOverwrite", (e, t) => {
  J.init(e, t), e._zod.check = (n) => {
    n.value = t.tx(n.value);
  };
});
class Rs {
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
    const r = t.split(`
`).filter((s) => s), o = Math.min(...r.map((s) => s.length - s.trimStart().length)), i = r.map((s) => s.slice(o)).map((s) => " ".repeat(this.indent * 2) + s);
    for (const s of i)
      this.content.push(s);
  }
  compile() {
    const t = Function, n = this == null ? void 0 : this.args, o = [...((this == null ? void 0 : this.content) ?? [""]).map((i) => `  ${i}`)];
    return new t(...n, o.join(`
`));
  }
}
const Ls = {
  major: 4,
  minor: 3,
  patch: 6
}, M = /* @__PURE__ */ h("$ZodType", (e, t) => {
  var o;
  var n;
  e ?? (e = {}), e._zod.def = t, e._zod.bag = e._zod.bag || {}, e._zod.version = Ls;
  const r = [...e._zod.def.checks ?? []];
  e._zod.traits.has("$ZodCheck") && r.unshift(e);
  for (const i of r)
    for (const s of i._zod.onattach)
      s(e);
  if (r.length === 0)
    (n = e._zod).deferred ?? (n.deferred = []), (o = e._zod.deferred) == null || o.push(() => {
      e._zod.run = e._zod.parse;
    });
  else {
    const i = (a, c, u) => {
      let l = ye(a), d;
      for (const p of c) {
        if (p._zod.def.when) {
          if (!p._zod.def.when(a))
            continue;
        } else if (l)
          continue;
        const f = a.issues.length, _ = p._zod.check(a);
        if (_ instanceof Promise && (u == null ? void 0 : u.async) === !1)
          throw new ze();
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
      const l = i(c, r, u);
      if (l instanceof Promise) {
        if (u.async === !1)
          throw new ze();
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
          throw new ze();
        return u.then((l) => i(l, r, c));
      }
      return i(u, r, c);
    };
  }
  L(e, "~standard", () => ({
    validate: (i) => {
      var s;
      try {
        const a = ji(e, i);
        return a.success ? { value: a.data } : { issues: (s = a.error) == null ? void 0 : s.issues };
      } catch {
        return Fi(e, i).then((c) => {
          var u;
          return c.success ? { value: c.data } : { issues: (u = c.error) == null ? void 0 : u.issues };
        });
      }
    },
    vendor: "zod",
    version: 1
  }));
}), Ht = /* @__PURE__ */ h("$ZodString", (e, t) => {
  var n;
  M.init(e, t), e._zod.pattern = [...((n = e == null ? void 0 : e._zod.bag) == null ? void 0 : n.patterns) ?? []].pop() ?? ms(e._zod.bag), e._zod.parse = (r, o) => {
    if (t.coerce)
      try {
        r.value = String(r.value);
      } catch {
      }
    return typeof r.value == "string" || r.issues.push({
      expected: "string",
      code: "invalid_type",
      input: r.value,
      inst: e
    }), r;
  };
}), Z = /* @__PURE__ */ h("$ZodStringFormat", (e, t) => {
  ut.init(e, t), Ht.init(e, t);
}), Is = /* @__PURE__ */ h("$ZodGUID", (e, t) => {
  t.pattern ?? (t.pattern = ns), Z.init(e, t);
}), Zs = /* @__PURE__ */ h("$ZodUUID", (e, t) => {
  if (t.version) {
    const r = {
      v1: 1,
      v2: 2,
      v3: 3,
      v4: 4,
      v5: 5,
      v6: 6,
      v7: 7,
      v8: 8
    }[t.version];
    if (r === void 0)
      throw new Error(`Invalid UUID version: "${t.version}"`);
    t.pattern ?? (t.pattern = un(r));
  } else
    t.pattern ?? (t.pattern = un());
  Z.init(e, t);
}), Os = /* @__PURE__ */ h("$ZodEmail", (e, t) => {
  t.pattern ?? (t.pattern = rs), Z.init(e, t);
}), Ps = /* @__PURE__ */ h("$ZodURL", (e, t) => {
  Z.init(e, t), e._zod.check = (n) => {
    try {
      const r = n.value.trim(), o = new URL(r);
      t.hostname && (t.hostname.lastIndex = 0, t.hostname.test(o.hostname) || n.issues.push({
        code: "invalid_format",
        format: "url",
        note: "Invalid hostname",
        pattern: t.hostname.source,
        input: n.value,
        inst: e,
        continue: !t.abort
      })), t.protocol && (t.protocol.lastIndex = 0, t.protocol.test(o.protocol.endsWith(":") ? o.protocol.slice(0, -1) : o.protocol) || n.issues.push({
        code: "invalid_format",
        format: "url",
        note: "Invalid protocol",
        pattern: t.protocol.source,
        input: n.value,
        inst: e,
        continue: !t.abort
      })), t.normalize ? n.value = o.href : n.value = r;
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
}), Ms = /* @__PURE__ */ h("$ZodEmoji", (e, t) => {
  t.pattern ?? (t.pattern = is()), Z.init(e, t);
}), js = /* @__PURE__ */ h("$ZodNanoID", (e, t) => {
  t.pattern ?? (t.pattern = es), Z.init(e, t);
}), Fs = /* @__PURE__ */ h("$ZodCUID", (e, t) => {
  t.pattern ?? (t.pattern = Gi), Z.init(e, t);
}), Ds = /* @__PURE__ */ h("$ZodCUID2", (e, t) => {
  t.pattern ?? (t.pattern = Yi), Z.init(e, t);
}), Bs = /* @__PURE__ */ h("$ZodULID", (e, t) => {
  t.pattern ?? (t.pattern = Xi), Z.init(e, t);
}), Us = /* @__PURE__ */ h("$ZodXID", (e, t) => {
  t.pattern ?? (t.pattern = Ki), Z.init(e, t);
}), Hs = /* @__PURE__ */ h("$ZodKSUID", (e, t) => {
  t.pattern ?? (t.pattern = Qi), Z.init(e, t);
}), Vs = /* @__PURE__ */ h("$ZodISODateTime", (e, t) => {
  t.pattern ?? (t.pattern = ps(t)), Z.init(e, t);
}), qs = /* @__PURE__ */ h("$ZodISODate", (e, t) => {
  t.pattern ?? (t.pattern = fs), Z.init(e, t);
}), Ws = /* @__PURE__ */ h("$ZodISOTime", (e, t) => {
  t.pattern ?? (t.pattern = hs(t)), Z.init(e, t);
}), Js = /* @__PURE__ */ h("$ZodISODuration", (e, t) => {
  t.pattern ?? (t.pattern = ts), Z.init(e, t);
}), Gs = /* @__PURE__ */ h("$ZodIPv4", (e, t) => {
  t.pattern ?? (t.pattern = ss), Z.init(e, t), e._zod.bag.format = "ipv4";
}), Ys = /* @__PURE__ */ h("$ZodIPv6", (e, t) => {
  t.pattern ?? (t.pattern = as), Z.init(e, t), e._zod.bag.format = "ipv6", e._zod.check = (n) => {
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
}), Xs = /* @__PURE__ */ h("$ZodCIDRv4", (e, t) => {
  t.pattern ?? (t.pattern = cs), Z.init(e, t);
}), Ks = /* @__PURE__ */ h("$ZodCIDRv6", (e, t) => {
  t.pattern ?? (t.pattern = us), Z.init(e, t), e._zod.check = (n) => {
    const r = n.value.split("/");
    try {
      if (r.length !== 2)
        throw new Error();
      const [o, i] = r;
      if (!i)
        throw new Error();
      const s = Number(i);
      if (`${s}` !== i)
        throw new Error();
      if (s < 0 || s > 128)
        throw new Error();
      new URL(`http://[${o}]`);
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
function yr(e) {
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
const Qs = /* @__PURE__ */ h("$ZodBase64", (e, t) => {
  t.pattern ?? (t.pattern = ls), Z.init(e, t), e._zod.bag.contentEncoding = "base64", e._zod.check = (n) => {
    yr(n.value) || n.issues.push({
      code: "invalid_format",
      format: "base64",
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
});
function ea(e) {
  if (!fr.test(e))
    return !1;
  const t = e.replace(/[-_]/g, (r) => r === "-" ? "+" : "/"), n = t.padEnd(Math.ceil(t.length / 4) * 4, "=");
  return yr(n);
}
const ta = /* @__PURE__ */ h("$ZodBase64URL", (e, t) => {
  t.pattern ?? (t.pattern = fr), Z.init(e, t), e._zod.bag.contentEncoding = "base64url", e._zod.check = (n) => {
    ea(n.value) || n.issues.push({
      code: "invalid_format",
      format: "base64url",
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), na = /* @__PURE__ */ h("$ZodE164", (e, t) => {
  t.pattern ?? (t.pattern = ds), Z.init(e, t);
});
function ra(e, t = null) {
  try {
    const n = e.split(".");
    if (n.length !== 3)
      return !1;
    const [r] = n;
    if (!r)
      return !1;
    const o = JSON.parse(atob(r));
    return !("typ" in o && (o == null ? void 0 : o.typ) !== "JWT" || !o.alg || t && (!("alg" in o) || o.alg !== t));
  } catch {
    return !1;
  }
}
const oa = /* @__PURE__ */ h("$ZodJWT", (e, t) => {
  Z.init(e, t), e._zod.check = (n) => {
    ra(n.value, t.alg) || n.issues.push({
      code: "invalid_format",
      format: "jwt",
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), vr = /* @__PURE__ */ h("$ZodNumber", (e, t) => {
  M.init(e, t), e._zod.pattern = e._zod.bag.pattern ?? mr, e._zod.parse = (n, r) => {
    if (t.coerce)
      try {
        n.value = Number(n.value);
      } catch {
      }
    const o = n.value;
    if (typeof o == "number" && !Number.isNaN(o) && Number.isFinite(o))
      return n;
    const i = typeof o == "number" ? Number.isNaN(o) ? "NaN" : Number.isFinite(o) ? void 0 : "Infinity" : void 0;
    return n.issues.push({
      expected: "number",
      code: "invalid_type",
      input: o,
      inst: e,
      ...i ? { received: i } : {}
    }), n;
  };
}), ia = /* @__PURE__ */ h("$ZodNumberFormat", (e, t) => {
  ws.init(e, t), vr.init(e, t);
}), sa = /* @__PURE__ */ h("$ZodBoolean", (e, t) => {
  M.init(e, t), e._zod.pattern = _s, e._zod.parse = (n, r) => {
    if (t.coerce)
      try {
        n.value = !!n.value;
      } catch {
      }
    const o = n.value;
    return typeof o == "boolean" || n.issues.push({
      expected: "boolean",
      code: "invalid_type",
      input: o,
      inst: e
    }), n;
  };
}), aa = /* @__PURE__ */ h("$ZodUnknown", (e, t) => {
  M.init(e, t), e._zod.parse = (n) => n;
}), ca = /* @__PURE__ */ h("$ZodNever", (e, t) => {
  M.init(e, t), e._zod.parse = (n, r) => (n.issues.push({
    expected: "never",
    code: "invalid_type",
    input: n.value,
    inst: e
  }), n);
});
function ln(e, t, n) {
  e.issues.length && t.issues.push(...ve(n, e.issues)), t.value[n] = e.value;
}
const ua = /* @__PURE__ */ h("$ZodArray", (e, t) => {
  M.init(e, t), e._zod.parse = (n, r) => {
    const o = n.value;
    if (!Array.isArray(o))
      return n.issues.push({
        expected: "array",
        code: "invalid_type",
        input: o,
        inst: e
      }), n;
    n.value = Array(o.length);
    const i = [];
    for (let s = 0; s < o.length; s++) {
      const a = o[s], c = t.element._zod.run({
        value: a,
        issues: []
      }, r);
      c instanceof Promise ? i.push(c.then((u) => ln(u, n, s))) : ln(c, n, s);
    }
    return i.length ? Promise.all(i).then(() => n) : n;
  };
});
function Xe(e, t, n, r, o) {
  if (e.issues.length) {
    if (o && !(n in r))
      return;
    t.issues.push(...ve(n, e.issues));
  }
  e.value === void 0 ? n in r && (t.value[n] = void 0) : t.value[n] = e.value;
}
function wr(e) {
  var r, o, i, s;
  const t = Object.keys(e.shape);
  for (const a of t)
    if (!((s = (i = (o = (r = e.shape) == null ? void 0 : r[a]) == null ? void 0 : o._zod) == null ? void 0 : i.traits) != null && s.has("$ZodType")))
      throw new Error(`Invalid element at key "${a}": expected a Zod schema`);
  const n = Ci(e.shape);
  return {
    ...e,
    keys: t,
    keySet: new Set(t),
    numKeys: t.length,
    optionalKeys: new Set(n)
  };
}
function kr(e, t, n, r, o, i) {
  const s = [], a = o.keySet, c = o.catchall._zod, u = c.def.type, l = c.optout === "optional";
  for (const d in t) {
    if (a.has(d))
      continue;
    if (u === "never") {
      s.push(d);
      continue;
    }
    const p = c.run({ value: t[d], issues: [] }, r);
    p instanceof Promise ? e.push(p.then((f) => Xe(f, n, d, t, l))) : Xe(p, n, d, t, l);
  }
  return s.length && n.issues.push({
    code: "unrecognized_keys",
    keys: s,
    input: t,
    inst: i
  }), e.length ? Promise.all(e).then(() => n) : n;
}
const la = /* @__PURE__ */ h("$ZodObject", (e, t) => {
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
  const r = Mt(() => wr(t));
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
  const o = Ye, i = t.catchall;
  let s;
  e._zod.parse = (a, c) => {
    s ?? (s = r.value);
    const u = a.value;
    if (!o(u))
      return a.issues.push({
        expected: "object",
        code: "invalid_type",
        input: u,
        inst: e
      }), a;
    a.value = {};
    const l = [], d = s.shape;
    for (const p of s.keys) {
      const f = d[p], _ = f._zod.optout === "optional", b = f._zod.run({ value: u[p], issues: [] }, c);
      b instanceof Promise ? l.push(b.then((N) => Xe(N, a, p, u, _))) : Xe(b, a, p, u, _);
    }
    return i ? kr(l, u, a, c, r.value, e) : l.length ? Promise.all(l).then(() => a) : a;
  };
}), da = /* @__PURE__ */ h("$ZodObjectJIT", (e, t) => {
  la.init(e, t);
  const n = e._zod.parse, r = Mt(() => wr(t)), o = (p) => {
    var g;
    const f = new Rs(["shape", "payload", "ctx"]), _ = r.value, b = (E) => {
      const y = cn(E);
      return `shape[${y}]._zod.run({ value: input[${y}], issues: [] }, ctx)`;
    };
    f.write("const input = payload.value;");
    const N = /* @__PURE__ */ Object.create(null);
    let k = 0;
    for (const E of _.keys)
      N[E] = `key_${k++}`;
    f.write("const newResult = {};");
    for (const E of _.keys) {
      const y = N[E], x = cn(E), z = p[E], $ = ((g = z == null ? void 0 : z._zod) == null ? void 0 : g.optout) === "optional";
      f.write(`const ${y} = ${b(E)};`), $ ? f.write(`
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
        
      `) : f.write(`
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
    f.write("payload.value = newResult;"), f.write("return payload;");
    const C = f.compile();
    return (E, y) => C(p, E, y);
  };
  let i;
  const s = Ye, a = !ir.jitless, u = a && $i.value, l = t.catchall;
  let d;
  e._zod.parse = (p, f) => {
    d ?? (d = r.value);
    const _ = p.value;
    return s(_) ? a && u && (f == null ? void 0 : f.async) === !1 && f.jitless !== !0 ? (i || (i = o(t.shape)), p = i(p, f), l ? kr([], _, p, f, d, e) : p) : n(p, f) : (p.issues.push({
      expected: "object",
      code: "invalid_type",
      input: _,
      inst: e
    }), p);
  };
});
function dn(e, t, n, r) {
  for (const i of e)
    if (i.issues.length === 0)
      return t.value = i.value, t;
  const o = e.filter((i) => !ye(i));
  return o.length === 1 ? (t.value = o[0].value, o[0]) : (t.issues.push({
    code: "invalid_union",
    input: t.value,
    inst: n,
    errors: e.map((i) => i.issues.map((s) => ce(s, r, ae())))
  }), t);
}
const fa = /* @__PURE__ */ h("$ZodUnion", (e, t) => {
  M.init(e, t), L(e._zod, "optin", () => t.options.some((o) => o._zod.optin === "optional") ? "optional" : void 0), L(e._zod, "optout", () => t.options.some((o) => o._zod.optout === "optional") ? "optional" : void 0), L(e._zod, "values", () => {
    if (t.options.every((o) => o._zod.values))
      return new Set(t.options.flatMap((o) => Array.from(o._zod.values)));
  }), L(e._zod, "pattern", () => {
    if (t.options.every((o) => o._zod.pattern)) {
      const o = t.options.map((i) => i._zod.pattern);
      return new RegExp(`^(${o.map((i) => Ft(i.source)).join("|")})$`);
    }
  });
  const n = t.options.length === 1, r = t.options[0]._zod.run;
  e._zod.parse = (o, i) => {
    if (n)
      return r(o, i);
    let s = !1;
    const a = [];
    for (const c of t.options) {
      const u = c._zod.run({
        value: o.value,
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
    return s ? Promise.all(a).then((c) => dn(c, o, e, i)) : dn(a, o, e, i);
  };
}), ha = /* @__PURE__ */ h("$ZodIntersection", (e, t) => {
  M.init(e, t), e._zod.parse = (n, r) => {
    const o = n.value, i = t.left._zod.run({ value: o, issues: [] }, r), s = t.right._zod.run({ value: o, issues: [] }, r);
    return i instanceof Promise || s instanceof Promise ? Promise.all([i, s]).then(([c, u]) => fn(n, c, u)) : fn(n, i, s);
  };
});
function Ct(e, t) {
  if (e === t)
    return { valid: !0, data: e };
  if (e instanceof Date && t instanceof Date && +e == +t)
    return { valid: !0, data: e };
  if ($e(e) && $e(t)) {
    const n = Object.keys(t), r = Object.keys(e).filter((i) => n.indexOf(i) !== -1), o = { ...e, ...t };
    for (const i of r) {
      const s = Ct(e[i], t[i]);
      if (!s.valid)
        return {
          valid: !1,
          mergeErrorPath: [i, ...s.mergeErrorPath]
        };
      o[i] = s.data;
    }
    return { valid: !0, data: o };
  }
  if (Array.isArray(e) && Array.isArray(t)) {
    if (e.length !== t.length)
      return { valid: !1, mergeErrorPath: [] };
    const n = [];
    for (let r = 0; r < e.length; r++) {
      const o = e[r], i = t[r], s = Ct(o, i);
      if (!s.valid)
        return {
          valid: !1,
          mergeErrorPath: [r, ...s.mergeErrorPath]
        };
      n.push(s.data);
    }
    return { valid: !0, data: n };
  }
  return { valid: !1, mergeErrorPath: [] };
}
function fn(e, t, n) {
  const r = /* @__PURE__ */ new Map();
  let o;
  for (const a of t.issues)
    if (a.code === "unrecognized_keys") {
      o ?? (o = a);
      for (const c of a.keys)
        r.has(c) || r.set(c, {}), r.get(c).l = !0;
    } else
      e.issues.push(a);
  for (const a of n.issues)
    if (a.code === "unrecognized_keys")
      for (const c of a.keys)
        r.has(c) || r.set(c, {}), r.get(c).r = !0;
    else
      e.issues.push(a);
  const i = [...r].filter(([, a]) => a.l && a.r).map(([a]) => a);
  if (i.length && o && e.issues.push({ ...o, keys: i }), ye(e))
    return e;
  const s = Ct(t.value, n.value);
  if (!s.valid)
    throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(s.mergeErrorPath)}`);
  return e.value = s.data, e;
}
const pa = /* @__PURE__ */ h("$ZodRecord", (e, t) => {
  M.init(e, t), e._zod.parse = (n, r) => {
    const o = n.value;
    if (!$e(o))
      return n.issues.push({
        expected: "record",
        code: "invalid_type",
        input: o,
        inst: e
      }), n;
    const i = [], s = t.keyType._zod.values;
    if (s) {
      n.value = {};
      const a = /* @__PURE__ */ new Set();
      for (const u of s)
        if (typeof u == "string" || typeof u == "number" || typeof u == "symbol") {
          a.add(typeof u == "number" ? u.toString() : u);
          const l = t.valueType._zod.run({ value: o[u], issues: [] }, r);
          l instanceof Promise ? i.push(l.then((d) => {
            d.issues.length && n.issues.push(...ve(u, d.issues)), n.value[u] = d.value;
          })) : (l.issues.length && n.issues.push(...ve(u, l.issues)), n.value[u] = l.value);
        }
      let c;
      for (const u in o)
        a.has(u) || (c = c ?? [], c.push(u));
      c && c.length > 0 && n.issues.push({
        code: "unrecognized_keys",
        input: o,
        inst: e,
        keys: c
      });
    } else {
      n.value = {};
      for (const a of Reflect.ownKeys(o)) {
        if (a === "__proto__")
          continue;
        let c = t.keyType._zod.run({ value: a, issues: [] }, r);
        if (c instanceof Promise)
          throw new Error("Async schemas not supported in object keys currently");
        if (typeof a == "string" && mr.test(a) && c.issues.length) {
          const d = t.keyType._zod.run({ value: Number(a), issues: [] }, r);
          if (d instanceof Promise)
            throw new Error("Async schemas not supported in object keys currently");
          d.issues.length === 0 && (c = d);
        }
        if (c.issues.length) {
          t.mode === "loose" ? n.value[a] = o[a] : n.issues.push({
            code: "invalid_key",
            origin: "record",
            issues: c.issues.map((d) => ce(d, r, ae())),
            input: a,
            path: [a],
            inst: e
          });
          continue;
        }
        const l = t.valueType._zod.run({ value: o[a], issues: [] }, r);
        l instanceof Promise ? i.push(l.then((d) => {
          d.issues.length && n.issues.push(...ve(a, d.issues)), n.value[c.value] = d.value;
        })) : (l.issues.length && n.issues.push(...ve(a, l.issues)), n.value[c.value] = l.value);
      }
    }
    return i.length ? Promise.all(i).then(() => n) : n;
  };
}), ma = /* @__PURE__ */ h("$ZodEnum", (e, t) => {
  M.init(e, t);
  const n = sr(t.entries), r = new Set(n);
  e._zod.values = r, e._zod.pattern = new RegExp(`^(${n.filter((o) => Ni.has(typeof o)).map((o) => typeof o == "string" ? st(o) : o.toString()).join("|")})$`), e._zod.parse = (o, i) => {
    const s = o.value;
    return r.has(s) || o.issues.push({
      code: "invalid_value",
      values: n,
      input: s,
      inst: e
    }), o;
  };
}), ba = /* @__PURE__ */ h("$ZodTransform", (e, t) => {
  M.init(e, t), e._zod.parse = (n, r) => {
    if (r.direction === "backward")
      throw new or(e.constructor.name);
    const o = t.transform(n.value, n);
    if (r.async)
      return (o instanceof Promise ? o : Promise.resolve(o)).then((s) => (n.value = s, n));
    if (o instanceof Promise)
      throw new ze();
    return n.value = o, n;
  };
});
function hn(e, t) {
  return e.issues.length && t === void 0 ? { issues: [], value: void 0 } : e;
}
const Er = /* @__PURE__ */ h("$ZodOptional", (e, t) => {
  M.init(e, t), e._zod.optin = "optional", e._zod.optout = "optional", L(e._zod, "values", () => t.innerType._zod.values ? /* @__PURE__ */ new Set([...t.innerType._zod.values, void 0]) : void 0), L(e._zod, "pattern", () => {
    const n = t.innerType._zod.pattern;
    return n ? new RegExp(`^(${Ft(n.source)})?$`) : void 0;
  }), e._zod.parse = (n, r) => {
    if (t.innerType._zod.optin === "optional") {
      const o = t.innerType._zod.run(n, r);
      return o instanceof Promise ? o.then((i) => hn(i, n.value)) : hn(o, n.value);
    }
    return n.value === void 0 ? n : t.innerType._zod.run(n, r);
  };
}), _a = /* @__PURE__ */ h("$ZodExactOptional", (e, t) => {
  Er.init(e, t), L(e._zod, "values", () => t.innerType._zod.values), L(e._zod, "pattern", () => t.innerType._zod.pattern), e._zod.parse = (n, r) => t.innerType._zod.run(n, r);
}), ga = /* @__PURE__ */ h("$ZodNullable", (e, t) => {
  M.init(e, t), L(e._zod, "optin", () => t.innerType._zod.optin), L(e._zod, "optout", () => t.innerType._zod.optout), L(e._zod, "pattern", () => {
    const n = t.innerType._zod.pattern;
    return n ? new RegExp(`^(${Ft(n.source)}|null)$`) : void 0;
  }), L(e._zod, "values", () => t.innerType._zod.values ? /* @__PURE__ */ new Set([...t.innerType._zod.values, null]) : void 0), e._zod.parse = (n, r) => n.value === null ? n : t.innerType._zod.run(n, r);
}), ya = /* @__PURE__ */ h("$ZodDefault", (e, t) => {
  M.init(e, t), e._zod.optin = "optional", L(e._zod, "values", () => t.innerType._zod.values), e._zod.parse = (n, r) => {
    if (r.direction === "backward")
      return t.innerType._zod.run(n, r);
    if (n.value === void 0)
      return n.value = t.defaultValue, n;
    const o = t.innerType._zod.run(n, r);
    return o instanceof Promise ? o.then((i) => pn(i, t)) : pn(o, t);
  };
});
function pn(e, t) {
  return e.value === void 0 && (e.value = t.defaultValue), e;
}
const va = /* @__PURE__ */ h("$ZodPrefault", (e, t) => {
  M.init(e, t), e._zod.optin = "optional", L(e._zod, "values", () => t.innerType._zod.values), e._zod.parse = (n, r) => (r.direction === "backward" || n.value === void 0 && (n.value = t.defaultValue), t.innerType._zod.run(n, r));
}), wa = /* @__PURE__ */ h("$ZodNonOptional", (e, t) => {
  M.init(e, t), L(e._zod, "values", () => {
    const n = t.innerType._zod.values;
    return n ? new Set([...n].filter((r) => r !== void 0)) : void 0;
  }), e._zod.parse = (n, r) => {
    const o = t.innerType._zod.run(n, r);
    return o instanceof Promise ? o.then((i) => mn(i, e)) : mn(o, e);
  };
});
function mn(e, t) {
  return !e.issues.length && e.value === void 0 && e.issues.push({
    code: "invalid_type",
    expected: "nonoptional",
    input: e.value,
    inst: t
  }), e;
}
const ka = /* @__PURE__ */ h("$ZodCatch", (e, t) => {
  M.init(e, t), L(e._zod, "optin", () => t.innerType._zod.optin), L(e._zod, "optout", () => t.innerType._zod.optout), L(e._zod, "values", () => t.innerType._zod.values), e._zod.parse = (n, r) => {
    if (r.direction === "backward")
      return t.innerType._zod.run(n, r);
    const o = t.innerType._zod.run(n, r);
    return o instanceof Promise ? o.then((i) => (n.value = i.value, i.issues.length && (n.value = t.catchValue({
      ...n,
      error: {
        issues: i.issues.map((s) => ce(s, r, ae()))
      },
      input: n.value
    }), n.issues = []), n)) : (n.value = o.value, o.issues.length && (n.value = t.catchValue({
      ...n,
      error: {
        issues: o.issues.map((i) => ce(i, r, ae()))
      },
      input: n.value
    }), n.issues = []), n);
  };
}), Ea = /* @__PURE__ */ h("$ZodPipe", (e, t) => {
  M.init(e, t), L(e._zod, "values", () => t.in._zod.values), L(e._zod, "optin", () => t.in._zod.optin), L(e._zod, "optout", () => t.out._zod.optout), L(e._zod, "propValues", () => t.in._zod.propValues), e._zod.parse = (n, r) => {
    if (r.direction === "backward") {
      const i = t.out._zod.run(n, r);
      return i instanceof Promise ? i.then((s) => Fe(s, t.in, r)) : Fe(i, t.in, r);
    }
    const o = t.in._zod.run(n, r);
    return o instanceof Promise ? o.then((i) => Fe(i, t.out, r)) : Fe(o, t.out, r);
  };
});
function Fe(e, t, n) {
  return e.issues.length ? (e.aborted = !0, e) : t._zod.run({ value: e.value, issues: e.issues }, n);
}
const za = /* @__PURE__ */ h("$ZodReadonly", (e, t) => {
  M.init(e, t), L(e._zod, "propValues", () => t.innerType._zod.propValues), L(e._zod, "values", () => t.innerType._zod.values), L(e._zod, "optin", () => {
    var n, r;
    return (r = (n = t.innerType) == null ? void 0 : n._zod) == null ? void 0 : r.optin;
  }), L(e._zod, "optout", () => {
    var n, r;
    return (r = (n = t.innerType) == null ? void 0 : n._zod) == null ? void 0 : r.optout;
  }), e._zod.parse = (n, r) => {
    if (r.direction === "backward")
      return t.innerType._zod.run(n, r);
    const o = t.innerType._zod.run(n, r);
    return o instanceof Promise ? o.then(bn) : bn(o);
  };
});
function bn(e) {
  return e.value = Object.freeze(e.value), e;
}
const Sa = /* @__PURE__ */ h("$ZodCustom", (e, t) => {
  J.init(e, t), M.init(e, t), e._zod.parse = (n, r) => n, e._zod.check = (n) => {
    const r = n.value, o = t.fn(r);
    if (o instanceof Promise)
      return o.then((i) => _n(i, n, r, e));
    _n(o, n, r, e);
  };
});
function _n(e, t, n, r) {
  if (!e) {
    const o = {
      code: "custom",
      input: n,
      inst: r,
      // incorporates params.error into issue reporting
      path: [...r._zod.def.path ?? []],
      // incorporates params.error into issue reporting
      continue: !r._zod.def.abort
      // params: inst._zod.def.params,
    };
    r._zod.def.params && (o.params = r._zod.def.params), t.issues.push(Ze(o));
  }
}
var gn;
class $a {
  constructor() {
    this._map = /* @__PURE__ */ new WeakMap(), this._idmap = /* @__PURE__ */ new Map();
  }
  add(t, ...n) {
    const r = n[0];
    return this._map.set(t, r), r && typeof r == "object" && "id" in r && this._idmap.set(r.id, t), this;
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
      const r = { ...this.get(n) ?? {} };
      delete r.id;
      const o = { ...r, ...this._map.get(t) };
      return Object.keys(o).length ? o : void 0;
    }
    return this._map.get(t);
  }
  has(t) {
    return this._map.has(t);
  }
}
function Na() {
  return new $a();
}
(gn = globalThis).__zod_globalRegistry ?? (gn.__zod_globalRegistry = Na());
const Ie = globalThis.__zod_globalRegistry;
// @__NO_SIDE_EFFECTS__
function Ca(e, t) {
  return new e({
    type: "string",
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function xa(e, t) {
  return new e({
    type: "string",
    format: "email",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function yn(e, t) {
  return new e({
    type: "string",
    format: "guid",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Ta(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Aa(e, t) {
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
function Ra(e, t) {
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
function La(e, t) {
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
function Ia(e, t) {
  return new e({
    type: "string",
    format: "url",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Za(e, t) {
  return new e({
    type: "string",
    format: "emoji",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Oa(e, t) {
  return new e({
    type: "string",
    format: "nanoid",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Pa(e, t) {
  return new e({
    type: "string",
    format: "cuid",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Ma(e, t) {
  return new e({
    type: "string",
    format: "cuid2",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function ja(e, t) {
  return new e({
    type: "string",
    format: "ulid",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Fa(e, t) {
  return new e({
    type: "string",
    format: "xid",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Da(e, t) {
  return new e({
    type: "string",
    format: "ksuid",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Ba(e, t) {
  return new e({
    type: "string",
    format: "ipv4",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Ua(e, t) {
  return new e({
    type: "string",
    format: "ipv6",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Ha(e, t) {
  return new e({
    type: "string",
    format: "cidrv4",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Va(e, t) {
  return new e({
    type: "string",
    format: "cidrv6",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function qa(e, t) {
  return new e({
    type: "string",
    format: "base64",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Wa(e, t) {
  return new e({
    type: "string",
    format: "base64url",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Ja(e, t) {
  return new e({
    type: "string",
    format: "e164",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Ga(e, t) {
  return new e({
    type: "string",
    format: "jwt",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Ya(e, t) {
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
function Xa(e, t) {
  return new e({
    type: "string",
    format: "date",
    check: "string_format",
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Ka(e, t) {
  return new e({
    type: "string",
    format: "time",
    check: "string_format",
    precision: null,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Qa(e, t) {
  return new e({
    type: "string",
    format: "duration",
    check: "string_format",
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function ec(e, t) {
  return new e({
    type: "number",
    checks: [],
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function tc(e, t) {
  return new e({
    type: "number",
    check: "number_format",
    abort: !1,
    format: "safeint",
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function nc(e, t) {
  return new e({
    type: "boolean",
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function rc(e) {
  return new e({
    type: "unknown"
  });
}
// @__NO_SIDE_EFFECTS__
function oc(e, t) {
  return new e({
    type: "never",
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function vn(e, t) {
  return new _r({
    check: "less_than",
    ...S(t),
    value: e,
    inclusive: !1
  });
}
// @__NO_SIDE_EFFECTS__
function Et(e, t) {
  return new _r({
    check: "less_than",
    ...S(t),
    value: e,
    inclusive: !0
  });
}
// @__NO_SIDE_EFFECTS__
function wn(e, t) {
  return new gr({
    check: "greater_than",
    ...S(t),
    value: e,
    inclusive: !1
  });
}
// @__NO_SIDE_EFFECTS__
function zt(e, t) {
  return new gr({
    check: "greater_than",
    ...S(t),
    value: e,
    inclusive: !0
  });
}
// @__NO_SIDE_EFFECTS__
function kn(e, t) {
  return new vs({
    check: "multiple_of",
    ...S(t),
    value: e
  });
}
// @__NO_SIDE_EFFECTS__
function zr(e, t) {
  return new ks({
    check: "max_length",
    ...S(t),
    maximum: e
  });
}
// @__NO_SIDE_EFFECTS__
function Ke(e, t) {
  return new Es({
    check: "min_length",
    ...S(t),
    minimum: e
  });
}
// @__NO_SIDE_EFFECTS__
function Sr(e, t) {
  return new zs({
    check: "length_equals",
    ...S(t),
    length: e
  });
}
// @__NO_SIDE_EFFECTS__
function ic(e, t) {
  return new Ss({
    check: "string_format",
    format: "regex",
    ...S(t),
    pattern: e
  });
}
// @__NO_SIDE_EFFECTS__
function sc(e) {
  return new $s({
    check: "string_format",
    format: "lowercase",
    ...S(e)
  });
}
// @__NO_SIDE_EFFECTS__
function ac(e) {
  return new Ns({
    check: "string_format",
    format: "uppercase",
    ...S(e)
  });
}
// @__NO_SIDE_EFFECTS__
function cc(e, t) {
  return new Cs({
    check: "string_format",
    format: "includes",
    ...S(t),
    includes: e
  });
}
// @__NO_SIDE_EFFECTS__
function uc(e, t) {
  return new xs({
    check: "string_format",
    format: "starts_with",
    ...S(t),
    prefix: e
  });
}
// @__NO_SIDE_EFFECTS__
function lc(e, t) {
  return new Ts({
    check: "string_format",
    format: "ends_with",
    ...S(t),
    suffix: e
  });
}
// @__NO_SIDE_EFFECTS__
function Ne(e) {
  return new As({
    check: "overwrite",
    tx: e
  });
}
// @__NO_SIDE_EFFECTS__
function dc(e) {
  return /* @__PURE__ */ Ne((t) => t.normalize(e));
}
// @__NO_SIDE_EFFECTS__
function fc() {
  return /* @__PURE__ */ Ne((e) => e.trim());
}
// @__NO_SIDE_EFFECTS__
function hc() {
  return /* @__PURE__ */ Ne((e) => e.toLowerCase());
}
// @__NO_SIDE_EFFECTS__
function pc() {
  return /* @__PURE__ */ Ne((e) => e.toUpperCase());
}
// @__NO_SIDE_EFFECTS__
function mc() {
  return /* @__PURE__ */ Ne((e) => Si(e));
}
// @__NO_SIDE_EFFECTS__
function bc(e, t, n) {
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
function _c(e, t, n) {
  return new e({
    type: "custom",
    check: "custom",
    fn: t,
    ...S(n)
  });
}
// @__NO_SIDE_EFFECTS__
function gc(e) {
  const t = /* @__PURE__ */ yc((n) => (n.addIssue = (r) => {
    if (typeof r == "string")
      n.issues.push(Ze(r, n.value, t._zod.def));
    else {
      const o = r;
      o.fatal && (o.continue = !1), o.code ?? (o.code = "custom"), o.input ?? (o.input = n.value), o.inst ?? (o.inst = t), o.continue ?? (o.continue = !t._zod.def.abort), n.issues.push(Ze(o));
    }
  }, e(n.value, n)));
  return t;
}
// @__NO_SIDE_EFFECTS__
function yc(e, t) {
  const n = new J({
    check: "custom",
    ...S(t)
  });
  return n._zod.check = e, n;
}
function $r(e) {
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
function U(e, t, n = { path: [], schemaPath: [] }) {
  var l, d;
  var r;
  const o = e._zod.def, i = t.seen.get(e);
  if (i)
    return i.count++, n.schemaPath.includes(e) && (i.cycle = n.path), i.schema;
  const s = { schema: {}, count: 1, cycle: void 0, path: n.path };
  t.seen.set(e, s);
  const a = (d = (l = e._zod).toJSONSchema) == null ? void 0 : d.call(l);
  if (a)
    s.schema = a;
  else {
    const p = {
      ...n,
      schemaPath: [...n.schemaPath, e],
      path: n.path
    };
    if (e._zod.processJSONSchema)
      e._zod.processJSONSchema(t, s.schema, p);
    else {
      const _ = s.schema, b = t.processors[o.type];
      if (!b)
        throw new Error(`[toJSONSchema]: Non-representable type encountered: ${o.type}`);
      b(e, t, _, p);
    }
    const f = e._zod.parent;
    f && (s.ref || (s.ref = f), U(f, t, p), t.seen.get(f).isParent = !0);
  }
  const c = t.metadataRegistry.get(e);
  return c && Object.assign(s.schema, c), t.io === "input" && q(e) && (delete s.schema.examples, delete s.schema.default), t.io === "input" && s.schema._prefault && ((r = s.schema).default ?? (r.default = s.schema._prefault)), delete s.schema._prefault, t.seen.get(e).schema;
}
function Nr(e, t) {
  var s, a, c, u;
  const n = e.seen.get(t);
  if (!n)
    throw new Error("Unprocessed schema. This is a bug in Zod.");
  const r = /* @__PURE__ */ new Map();
  for (const l of e.seen.entries()) {
    const d = (s = e.metadataRegistry.get(l[0])) == null ? void 0 : s.id;
    if (d) {
      const p = r.get(d);
      if (p && p !== l[0])
        throw new Error(`Duplicate schema id "${d}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`);
      r.set(d, l[0]);
    }
  }
  const o = (l) => {
    var b;
    const d = e.target === "draft-2020-12" ? "$defs" : "definitions";
    if (e.external) {
      const N = (b = e.external.registry.get(l[0])) == null ? void 0 : b.id, k = e.external.uri ?? ((g) => g);
      if (N)
        return { ref: k(N) };
      const C = l[1].defId ?? l[1].schema.id ?? `schema${e.counter++}`;
      return l[1].defId = C, { defId: C, ref: `${k("__shared")}#/${d}/${C}` };
    }
    if (l[1] === n)
      return { ref: "#" };
    const f = `#/${d}/`, _ = l[1].schema.id ?? `__schema${e.counter++}`;
    return { defId: _, ref: f + _ };
  }, i = (l) => {
    if (l[1].schema.$ref)
      return;
    const d = l[1], { ref: p, defId: f } = o(l);
    d.def = { ...d.schema }, f && (d.defId = f);
    const _ = d.schema;
    for (const b in _)
      delete _[b];
    _.$ref = p;
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
function Cr(e, t) {
  var s, a, c;
  const n = e.seen.get(t);
  if (!n)
    throw new Error("Unprocessed schema. This is a bug in Zod.");
  const r = (u) => {
    const l = e.seen.get(u);
    if (l.ref === null)
      return;
    const d = l.def ?? l.schema, p = { ...d }, f = l.ref;
    if (l.ref = null, f) {
      r(f);
      const b = e.seen.get(f), N = b.schema;
      if (N.$ref && (e.target === "draft-07" || e.target === "draft-04" || e.target === "openapi-3.0") ? (d.allOf = d.allOf ?? [], d.allOf.push(N)) : Object.assign(d, N), Object.assign(d, p), u._zod.parent === f)
        for (const C in d)
          C === "$ref" || C === "allOf" || C in p || delete d[C];
      if (N.$ref && b.def)
        for (const C in d)
          C === "$ref" || C === "allOf" || C in b.def && JSON.stringify(d[C]) === JSON.stringify(b.def[C]) && delete d[C];
    }
    const _ = u._zod.parent;
    if (_ && _ !== f) {
      r(_);
      const b = e.seen.get(_);
      if (b != null && b.schema.$ref && (d.$ref = b.schema.$ref, b.def))
        for (const N in d)
          N === "$ref" || N === "allOf" || N in b.def && JSON.stringify(d[N]) === JSON.stringify(b.def[N]) && delete d[N];
    }
    e.override({
      zodSchema: u,
      jsonSchema: d,
      path: l.path ?? []
    });
  };
  for (const u of [...e.seen.entries()].reverse())
    r(u[0]);
  const o = {};
  if (e.target === "draft-2020-12" ? o.$schema = "https://json-schema.org/draft/2020-12/schema" : e.target === "draft-07" ? o.$schema = "http://json-schema.org/draft-07/schema#" : e.target === "draft-04" ? o.$schema = "http://json-schema.org/draft-04/schema#" : e.target, (s = e.external) != null && s.uri) {
    const u = (a = e.external.registry.get(t)) == null ? void 0 : a.id;
    if (!u)
      throw new Error("Schema is missing an `id` property");
    o.$id = e.external.uri(u);
  }
  Object.assign(o, n.def ?? n.schema);
  const i = ((c = e.external) == null ? void 0 : c.defs) ?? {};
  for (const u of e.seen.entries()) {
    const l = u[1];
    l.def && l.defId && (i[l.defId] = l.def);
  }
  e.external || Object.keys(i).length > 0 && (e.target === "draft-2020-12" ? o.$defs = i : o.definitions = i);
  try {
    const u = JSON.parse(JSON.stringify(o));
    return Object.defineProperty(u, "~standard", {
      value: {
        ...t["~standard"],
        jsonSchema: {
          input: Qe(t, "input", e.processors),
          output: Qe(t, "output", e.processors)
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
  const r = e._zod.def;
  if (r.type === "transform")
    return !0;
  if (r.type === "array")
    return q(r.element, n);
  if (r.type === "set")
    return q(r.valueType, n);
  if (r.type === "lazy")
    return q(r.getter(), n);
  if (r.type === "promise" || r.type === "optional" || r.type === "nonoptional" || r.type === "nullable" || r.type === "readonly" || r.type === "default" || r.type === "prefault")
    return q(r.innerType, n);
  if (r.type === "intersection")
    return q(r.left, n) || q(r.right, n);
  if (r.type === "record" || r.type === "map")
    return q(r.keyType, n) || q(r.valueType, n);
  if (r.type === "pipe")
    return q(r.in, n) || q(r.out, n);
  if (r.type === "object") {
    for (const o in r.shape)
      if (q(r.shape[o], n))
        return !0;
    return !1;
  }
  if (r.type === "union") {
    for (const o of r.options)
      if (q(o, n))
        return !0;
    return !1;
  }
  if (r.type === "tuple") {
    for (const o of r.items)
      if (q(o, n))
        return !0;
    return !!(r.rest && q(r.rest, n));
  }
  return !1;
}
const vc = (e, t = {}) => (n) => {
  const r = $r({ ...n, processors: t });
  return U(e, r), Nr(r, e), Cr(r, e);
}, Qe = (e, t, n = {}) => (r) => {
  const { libraryOptions: o, target: i } = r ?? {}, s = $r({ ...o ?? {}, target: i, io: t, processors: n });
  return U(e, s), Nr(s, e), Cr(s, e);
}, wc = {
  guid: "uuid",
  url: "uri",
  datetime: "date-time",
  json_string: "json-string",
  regex: ""
  // do not set
}, kc = (e, t, n, r) => {
  const o = n;
  o.type = "string";
  const { minimum: i, maximum: s, format: a, patterns: c, contentEncoding: u } = e._zod.bag;
  if (typeof i == "number" && (o.minLength = i), typeof s == "number" && (o.maxLength = s), a && (o.format = wc[a] ?? a, o.format === "" && delete o.format, a === "time" && delete o.format), u && (o.contentEncoding = u), c && c.size > 0) {
    const l = [...c];
    l.length === 1 ? o.pattern = l[0].source : l.length > 1 && (o.allOf = [
      ...l.map((d) => ({
        ...t.target === "draft-07" || t.target === "draft-04" || t.target === "openapi-3.0" ? { type: "string" } : {},
        pattern: d.source
      }))
    ]);
  }
}, Ec = (e, t, n, r) => {
  const o = n, { minimum: i, maximum: s, format: a, multipleOf: c, exclusiveMaximum: u, exclusiveMinimum: l } = e._zod.bag;
  typeof a == "string" && a.includes("int") ? o.type = "integer" : o.type = "number", typeof l == "number" && (t.target === "draft-04" || t.target === "openapi-3.0" ? (o.minimum = l, o.exclusiveMinimum = !0) : o.exclusiveMinimum = l), typeof i == "number" && (o.minimum = i, typeof l == "number" && t.target !== "draft-04" && (l >= i ? delete o.minimum : delete o.exclusiveMinimum)), typeof u == "number" && (t.target === "draft-04" || t.target === "openapi-3.0" ? (o.maximum = u, o.exclusiveMaximum = !0) : o.exclusiveMaximum = u), typeof s == "number" && (o.maximum = s, typeof u == "number" && t.target !== "draft-04" && (u <= s ? delete o.maximum : delete o.exclusiveMaximum)), typeof c == "number" && (o.multipleOf = c);
}, zc = (e, t, n, r) => {
  n.type = "boolean";
}, Sc = (e, t, n, r) => {
  n.not = {};
}, $c = (e, t, n, r) => {
}, Nc = (e, t, n, r) => {
  const o = e._zod.def, i = sr(o.entries);
  i.every((s) => typeof s == "number") && (n.type = "number"), i.every((s) => typeof s == "string") && (n.type = "string"), n.enum = i;
}, Cc = (e, t, n, r) => {
  if (t.unrepresentable === "throw")
    throw new Error("Custom types cannot be represented in JSON Schema");
}, xc = (e, t, n, r) => {
  if (t.unrepresentable === "throw")
    throw new Error("Transforms cannot be represented in JSON Schema");
}, Tc = (e, t, n, r) => {
  const o = n, i = e._zod.def, { minimum: s, maximum: a } = e._zod.bag;
  typeof s == "number" && (o.minItems = s), typeof a == "number" && (o.maxItems = a), o.type = "array", o.items = U(i.element, t, { ...r, path: [...r.path, "items"] });
}, Ac = (e, t, n, r) => {
  var u;
  const o = n, i = e._zod.def;
  o.type = "object", o.properties = {};
  const s = i.shape;
  for (const l in s)
    o.properties[l] = U(s[l], t, {
      ...r,
      path: [...r.path, "properties", l]
    });
  const a = new Set(Object.keys(s)), c = new Set([...a].filter((l) => {
    const d = i.shape[l]._zod;
    return t.io === "input" ? d.optin === void 0 : d.optout === void 0;
  }));
  c.size > 0 && (o.required = Array.from(c)), ((u = i.catchall) == null ? void 0 : u._zod.def.type) === "never" ? o.additionalProperties = !1 : i.catchall ? i.catchall && (o.additionalProperties = U(i.catchall, t, {
    ...r,
    path: [...r.path, "additionalProperties"]
  })) : t.io === "output" && (o.additionalProperties = !1);
}, Rc = (e, t, n, r) => {
  const o = e._zod.def, i = o.inclusive === !1, s = o.options.map((a, c) => U(a, t, {
    ...r,
    path: [...r.path, i ? "oneOf" : "anyOf", c]
  }));
  i ? n.oneOf = s : n.anyOf = s;
}, Lc = (e, t, n, r) => {
  const o = e._zod.def, i = U(o.left, t, {
    ...r,
    path: [...r.path, "allOf", 0]
  }), s = U(o.right, t, {
    ...r,
    path: [...r.path, "allOf", 1]
  }), a = (u) => "allOf" in u && Object.keys(u).length === 1, c = [
    ...a(i) ? i.allOf : [i],
    ...a(s) ? s.allOf : [s]
  ];
  n.allOf = c;
}, Ic = (e, t, n, r) => {
  const o = n, i = e._zod.def;
  o.type = "object";
  const s = i.keyType, a = s._zod.bag, c = a == null ? void 0 : a.patterns;
  if (i.mode === "loose" && c && c.size > 0) {
    const l = U(i.valueType, t, {
      ...r,
      path: [...r.path, "patternProperties", "*"]
    });
    o.patternProperties = {};
    for (const d of c)
      o.patternProperties[d.source] = l;
  } else
    (t.target === "draft-07" || t.target === "draft-2020-12") && (o.propertyNames = U(i.keyType, t, {
      ...r,
      path: [...r.path, "propertyNames"]
    })), o.additionalProperties = U(i.valueType, t, {
      ...r,
      path: [...r.path, "additionalProperties"]
    });
  const u = s._zod.values;
  if (u) {
    const l = [...u].filter((d) => typeof d == "string" || typeof d == "number");
    l.length > 0 && (o.required = l);
  }
}, Zc = (e, t, n, r) => {
  const o = e._zod.def, i = U(o.innerType, t, r), s = t.seen.get(e);
  t.target === "openapi-3.0" ? (s.ref = o.innerType, n.nullable = !0) : n.anyOf = [i, { type: "null" }];
}, Oc = (e, t, n, r) => {
  const o = e._zod.def;
  U(o.innerType, t, r);
  const i = t.seen.get(e);
  i.ref = o.innerType;
}, Pc = (e, t, n, r) => {
  const o = e._zod.def;
  U(o.innerType, t, r);
  const i = t.seen.get(e);
  i.ref = o.innerType, n.default = JSON.parse(JSON.stringify(o.defaultValue));
}, Mc = (e, t, n, r) => {
  const o = e._zod.def;
  U(o.innerType, t, r);
  const i = t.seen.get(e);
  i.ref = o.innerType, t.io === "input" && (n._prefault = JSON.parse(JSON.stringify(o.defaultValue)));
}, jc = (e, t, n, r) => {
  const o = e._zod.def;
  U(o.innerType, t, r);
  const i = t.seen.get(e);
  i.ref = o.innerType;
  let s;
  try {
    s = o.catchValue(void 0);
  } catch {
    throw new Error("Dynamic catch values are not supported in JSON Schema");
  }
  n.default = s;
}, Fc = (e, t, n, r) => {
  const o = e._zod.def, i = t.io === "input" ? o.in._zod.def.type === "transform" ? o.out : o.in : o.out;
  U(i, t, r);
  const s = t.seen.get(e);
  s.ref = i;
}, Dc = (e, t, n, r) => {
  const o = e._zod.def;
  U(o.innerType, t, r);
  const i = t.seen.get(e);
  i.ref = o.innerType, n.readOnly = !0;
}, xr = (e, t, n, r) => {
  const o = e._zod.def;
  U(o.innerType, t, r);
  const i = t.seen.get(e);
  i.ref = o.innerType;
}, Bc = /* @__PURE__ */ h("ZodISODateTime", (e, t) => {
  Vs.init(e, t), P.init(e, t);
});
function Uc(e) {
  return /* @__PURE__ */ Ya(Bc, e);
}
const Hc = /* @__PURE__ */ h("ZodISODate", (e, t) => {
  qs.init(e, t), P.init(e, t);
});
function Vc(e) {
  return /* @__PURE__ */ Xa(Hc, e);
}
const qc = /* @__PURE__ */ h("ZodISOTime", (e, t) => {
  Ws.init(e, t), P.init(e, t);
});
function Wc(e) {
  return /* @__PURE__ */ Ka(qc, e);
}
const Jc = /* @__PURE__ */ h("ZodISODuration", (e, t) => {
  Js.init(e, t), P.init(e, t);
});
function Gc(e) {
  return /* @__PURE__ */ Qa(Jc, e);
}
const Yc = (e, t) => {
  lr.init(e, t), e.name = "ZodError", Object.defineProperties(e, {
    format: {
      value: (n) => Mi(e, n)
      // enumerable: false,
    },
    flatten: {
      value: (n) => Pi(e, n)
      // enumerable: false,
    },
    addIssue: {
      value: (n) => {
        e.issues.push(n), e.message = JSON.stringify(e.issues, Nt, 2);
      }
      // enumerable: false,
    },
    addIssues: {
      value: (n) => {
        e.issues.push(...n), e.message = JSON.stringify(e.issues, Nt, 2);
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
}, G = h("ZodError", Yc, {
  Parent: Error
}), Xc = /* @__PURE__ */ Bt(G), Kc = /* @__PURE__ */ Ut(G), Qc = /* @__PURE__ */ at(G), eu = /* @__PURE__ */ ct(G), tu = /* @__PURE__ */ Di(G), nu = /* @__PURE__ */ Bi(G), ru = /* @__PURE__ */ Ui(G), ou = /* @__PURE__ */ Hi(G), iu = /* @__PURE__ */ Vi(G), su = /* @__PURE__ */ qi(G), au = /* @__PURE__ */ Wi(G), cu = /* @__PURE__ */ Ji(G), j = /* @__PURE__ */ h("ZodType", (e, t) => (M.init(e, t), Object.assign(e["~standard"], {
  jsonSchema: {
    input: Qe(e, "input"),
    output: Qe(e, "output")
  }
}), e.toJSONSchema = vc(e, {}), e.def = t, e.type = t.type, Object.defineProperty(e, "_def", { value: t }), e.check = (...n) => e.clone(ue(t, {
  checks: [
    ...t.checks ?? [],
    ...n.map((r) => typeof r == "function" ? { _zod: { check: r, def: { check: "custom" }, onattach: [] } } : r)
  ]
}), {
  parent: !0
}), e.with = e.check, e.clone = (n, r) => le(e, n, r), e.brand = () => e, e.register = (n, r) => (n.add(e, r), e), e.parse = (n, r) => Xc(e, n, r, { callee: e.parse }), e.safeParse = (n, r) => Qc(e, n, r), e.parseAsync = async (n, r) => Kc(e, n, r, { callee: e.parseAsync }), e.safeParseAsync = async (n, r) => eu(e, n, r), e.spa = e.safeParseAsync, e.encode = (n, r) => tu(e, n, r), e.decode = (n, r) => nu(e, n, r), e.encodeAsync = async (n, r) => ru(e, n, r), e.decodeAsync = async (n, r) => ou(e, n, r), e.safeEncode = (n, r) => iu(e, n, r), e.safeDecode = (n, r) => su(e, n, r), e.safeEncodeAsync = async (n, r) => au(e, n, r), e.safeDecodeAsync = async (n, r) => cu(e, n, r), e.refine = (n, r) => e.check(el(n, r)), e.superRefine = (n) => e.check(tl(n)), e.overwrite = (n) => e.check(/* @__PURE__ */ Ne(n)), e.optional = () => Sn(e), e.exactOptional = () => Bu(e), e.nullable = () => $n(e), e.nullish = () => Sn($n(e)), e.nonoptional = (n) => Wu(e, n), e.array = () => Oe(e), e.or = (n) => Iu([e, n]), e.and = (n) => Ou(e, n), e.transform = (n) => Nn(e, Fu(n)), e.default = (n) => Hu(e, n), e.prefault = (n) => qu(e, n), e.catch = (n) => Gu(e, n), e.pipe = (n) => Nn(e, n), e.readonly = () => Ku(e), e.describe = (n) => {
  const r = e.clone();
  return Ie.add(r, { description: n }), r;
}, Object.defineProperty(e, "description", {
  get() {
    var n;
    return (n = Ie.get(e)) == null ? void 0 : n.description;
  },
  configurable: !0
}), e.meta = (...n) => {
  if (n.length === 0)
    return Ie.get(e);
  const r = e.clone();
  return Ie.add(r, n[0]), r;
}, e.isOptional = () => e.safeParse(void 0).success, e.isNullable = () => e.safeParse(null).success, e.apply = (n) => n(e), e)), Tr = /* @__PURE__ */ h("_ZodString", (e, t) => {
  Ht.init(e, t), j.init(e, t), e._zod.processJSONSchema = (r, o, i) => kc(e, r, o);
  const n = e._zod.bag;
  e.format = n.format ?? null, e.minLength = n.minimum ?? null, e.maxLength = n.maximum ?? null, e.regex = (...r) => e.check(/* @__PURE__ */ ic(...r)), e.includes = (...r) => e.check(/* @__PURE__ */ cc(...r)), e.startsWith = (...r) => e.check(/* @__PURE__ */ uc(...r)), e.endsWith = (...r) => e.check(/* @__PURE__ */ lc(...r)), e.min = (...r) => e.check(/* @__PURE__ */ Ke(...r)), e.max = (...r) => e.check(/* @__PURE__ */ zr(...r)), e.length = (...r) => e.check(/* @__PURE__ */ Sr(...r)), e.nonempty = (...r) => e.check(/* @__PURE__ */ Ke(1, ...r)), e.lowercase = (r) => e.check(/* @__PURE__ */ sc(r)), e.uppercase = (r) => e.check(/* @__PURE__ */ ac(r)), e.trim = () => e.check(/* @__PURE__ */ fc()), e.normalize = (...r) => e.check(/* @__PURE__ */ dc(...r)), e.toLowerCase = () => e.check(/* @__PURE__ */ hc()), e.toUpperCase = () => e.check(/* @__PURE__ */ pc()), e.slugify = () => e.check(/* @__PURE__ */ mc());
}), Ar = /* @__PURE__ */ h("ZodString", (e, t) => {
  Ht.init(e, t), Tr.init(e, t), e.email = (n) => e.check(/* @__PURE__ */ xa(uu, n)), e.url = (n) => e.check(/* @__PURE__ */ Ia(lu, n)), e.jwt = (n) => e.check(/* @__PURE__ */ Ga(Su, n)), e.emoji = (n) => e.check(/* @__PURE__ */ Za(du, n)), e.guid = (n) => e.check(/* @__PURE__ */ yn(En, n)), e.uuid = (n) => e.check(/* @__PURE__ */ Ta(De, n)), e.uuidv4 = (n) => e.check(/* @__PURE__ */ Aa(De, n)), e.uuidv6 = (n) => e.check(/* @__PURE__ */ Ra(De, n)), e.uuidv7 = (n) => e.check(/* @__PURE__ */ La(De, n)), e.nanoid = (n) => e.check(/* @__PURE__ */ Oa(fu, n)), e.guid = (n) => e.check(/* @__PURE__ */ yn(En, n)), e.cuid = (n) => e.check(/* @__PURE__ */ Pa(hu, n)), e.cuid2 = (n) => e.check(/* @__PURE__ */ Ma(pu, n)), e.ulid = (n) => e.check(/* @__PURE__ */ ja(mu, n)), e.base64 = (n) => e.check(/* @__PURE__ */ qa(ku, n)), e.base64url = (n) => e.check(/* @__PURE__ */ Wa(Eu, n)), e.xid = (n) => e.check(/* @__PURE__ */ Fa(bu, n)), e.ksuid = (n) => e.check(/* @__PURE__ */ Da(_u, n)), e.ipv4 = (n) => e.check(/* @__PURE__ */ Ba(gu, n)), e.ipv6 = (n) => e.check(/* @__PURE__ */ Ua(yu, n)), e.cidrv4 = (n) => e.check(/* @__PURE__ */ Ha(vu, n)), e.cidrv6 = (n) => e.check(/* @__PURE__ */ Va(wu, n)), e.e164 = (n) => e.check(/* @__PURE__ */ Ja(zu, n)), e.datetime = (n) => e.check(Uc(n)), e.date = (n) => e.check(Vc(n)), e.time = (n) => e.check(Wc(n)), e.duration = (n) => e.check(Gc(n));
});
function W(e) {
  return /* @__PURE__ */ Ca(Ar, e);
}
const P = /* @__PURE__ */ h("ZodStringFormat", (e, t) => {
  Z.init(e, t), Tr.init(e, t);
}), uu = /* @__PURE__ */ h("ZodEmail", (e, t) => {
  Os.init(e, t), P.init(e, t);
}), En = /* @__PURE__ */ h("ZodGUID", (e, t) => {
  Is.init(e, t), P.init(e, t);
}), De = /* @__PURE__ */ h("ZodUUID", (e, t) => {
  Zs.init(e, t), P.init(e, t);
}), lu = /* @__PURE__ */ h("ZodURL", (e, t) => {
  Ps.init(e, t), P.init(e, t);
}), du = /* @__PURE__ */ h("ZodEmoji", (e, t) => {
  Ms.init(e, t), P.init(e, t);
}), fu = /* @__PURE__ */ h("ZodNanoID", (e, t) => {
  js.init(e, t), P.init(e, t);
}), hu = /* @__PURE__ */ h("ZodCUID", (e, t) => {
  Fs.init(e, t), P.init(e, t);
}), pu = /* @__PURE__ */ h("ZodCUID2", (e, t) => {
  Ds.init(e, t), P.init(e, t);
}), mu = /* @__PURE__ */ h("ZodULID", (e, t) => {
  Bs.init(e, t), P.init(e, t);
}), bu = /* @__PURE__ */ h("ZodXID", (e, t) => {
  Us.init(e, t), P.init(e, t);
}), _u = /* @__PURE__ */ h("ZodKSUID", (e, t) => {
  Hs.init(e, t), P.init(e, t);
}), gu = /* @__PURE__ */ h("ZodIPv4", (e, t) => {
  Gs.init(e, t), P.init(e, t);
}), yu = /* @__PURE__ */ h("ZodIPv6", (e, t) => {
  Ys.init(e, t), P.init(e, t);
}), vu = /* @__PURE__ */ h("ZodCIDRv4", (e, t) => {
  Xs.init(e, t), P.init(e, t);
}), wu = /* @__PURE__ */ h("ZodCIDRv6", (e, t) => {
  Ks.init(e, t), P.init(e, t);
}), ku = /* @__PURE__ */ h("ZodBase64", (e, t) => {
  Qs.init(e, t), P.init(e, t);
}), Eu = /* @__PURE__ */ h("ZodBase64URL", (e, t) => {
  ta.init(e, t), P.init(e, t);
}), zu = /* @__PURE__ */ h("ZodE164", (e, t) => {
  na.init(e, t), P.init(e, t);
}), Su = /* @__PURE__ */ h("ZodJWT", (e, t) => {
  oa.init(e, t), P.init(e, t);
}), Vt = /* @__PURE__ */ h("ZodNumber", (e, t) => {
  vr.init(e, t), j.init(e, t), e._zod.processJSONSchema = (r, o, i) => Ec(e, r, o), e.gt = (r, o) => e.check(/* @__PURE__ */ wn(r, o)), e.gte = (r, o) => e.check(/* @__PURE__ */ zt(r, o)), e.min = (r, o) => e.check(/* @__PURE__ */ zt(r, o)), e.lt = (r, o) => e.check(/* @__PURE__ */ vn(r, o)), e.lte = (r, o) => e.check(/* @__PURE__ */ Et(r, o)), e.max = (r, o) => e.check(/* @__PURE__ */ Et(r, o)), e.int = (r) => e.check(zn(r)), e.safe = (r) => e.check(zn(r)), e.positive = (r) => e.check(/* @__PURE__ */ wn(0, r)), e.nonnegative = (r) => e.check(/* @__PURE__ */ zt(0, r)), e.negative = (r) => e.check(/* @__PURE__ */ vn(0, r)), e.nonpositive = (r) => e.check(/* @__PURE__ */ Et(0, r)), e.multipleOf = (r, o) => e.check(/* @__PURE__ */ kn(r, o)), e.step = (r, o) => e.check(/* @__PURE__ */ kn(r, o)), e.finite = () => e;
  const n = e._zod.bag;
  e.minValue = Math.max(n.minimum ?? Number.NEGATIVE_INFINITY, n.exclusiveMinimum ?? Number.NEGATIVE_INFINITY) ?? null, e.maxValue = Math.min(n.maximum ?? Number.POSITIVE_INFINITY, n.exclusiveMaximum ?? Number.POSITIVE_INFINITY) ?? null, e.isInt = (n.format ?? "").includes("int") || Number.isSafeInteger(n.multipleOf ?? 0.5), e.isFinite = !0, e.format = n.format ?? null;
});
function he(e) {
  return /* @__PURE__ */ ec(Vt, e);
}
const $u = /* @__PURE__ */ h("ZodNumberFormat", (e, t) => {
  ia.init(e, t), Vt.init(e, t);
});
function zn(e) {
  return /* @__PURE__ */ tc($u, e);
}
const Rr = /* @__PURE__ */ h("ZodBoolean", (e, t) => {
  sa.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, r, o) => zc(e, n, r);
});
function Nu(e) {
  return /* @__PURE__ */ nc(Rr, e);
}
const Cu = /* @__PURE__ */ h("ZodUnknown", (e, t) => {
  aa.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, r, o) => $c();
});
function et() {
  return /* @__PURE__ */ rc(Cu);
}
const xu = /* @__PURE__ */ h("ZodNever", (e, t) => {
  ca.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, r, o) => Sc(e, n, r);
});
function Tu(e) {
  return /* @__PURE__ */ oc(xu, e);
}
const Au = /* @__PURE__ */ h("ZodArray", (e, t) => {
  ua.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, r, o) => Tc(e, n, r, o), e.element = t.element, e.min = (n, r) => e.check(/* @__PURE__ */ Ke(n, r)), e.nonempty = (n) => e.check(/* @__PURE__ */ Ke(1, n)), e.max = (n, r) => e.check(/* @__PURE__ */ zr(n, r)), e.length = (n, r) => e.check(/* @__PURE__ */ Sr(n, r)), e.unwrap = () => e.element;
});
function Oe(e, t) {
  return /* @__PURE__ */ bc(Au, e, t);
}
const Ru = /* @__PURE__ */ h("ZodObject", (e, t) => {
  da.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, r, o) => Ac(e, n, r, o), L(e, "shape", () => t.shape), e.keyof = () => Lr(Object.keys(e._zod.def.shape)), e.catchall = (n) => e.clone({ ...e._zod.def, catchall: n }), e.passthrough = () => e.clone({ ...e._zod.def, catchall: et() }), e.loose = () => e.clone({ ...e._zod.def, catchall: et() }), e.strict = () => e.clone({ ...e._zod.def, catchall: Tu() }), e.strip = () => e.clone({ ...e._zod.def, catchall: void 0 }), e.extend = (n) => Ri(e, n), e.safeExtend = (n) => Li(e, n), e.merge = (n) => Ii(e, n), e.pick = (n) => Ti(e, n), e.omit = (n) => Ai(e, n), e.partial = (...n) => Zi(qt, e, n[0]), e.required = (...n) => Oi(Zr, e, n[0]);
});
function Pe(e, t) {
  const n = {
    type: "object",
    shape: e ?? {},
    ...S(t)
  };
  return new Ru(n);
}
const Lu = /* @__PURE__ */ h("ZodUnion", (e, t) => {
  fa.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, r, o) => Rc(e, n, r, o), e.options = t.options;
});
function Iu(e, t) {
  return new Lu({
    type: "union",
    options: e,
    ...S(t)
  });
}
const Zu = /* @__PURE__ */ h("ZodIntersection", (e, t) => {
  ha.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, r, o) => Lc(e, n, r, o);
});
function Ou(e, t) {
  return new Zu({
    type: "intersection",
    left: e,
    right: t
  });
}
const Pu = /* @__PURE__ */ h("ZodRecord", (e, t) => {
  pa.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, r, o) => Ic(e, n, r, o), e.keyType = t.keyType, e.valueType = t.valueType;
});
function Mu(e, t, n) {
  return new Pu({
    type: "record",
    keyType: e,
    valueType: t,
    ...S(n)
  });
}
const tt = /* @__PURE__ */ h("ZodEnum", (e, t) => {
  ma.init(e, t), j.init(e, t), e._zod.processJSONSchema = (r, o, i) => Nc(e, r, o), e.enum = t.entries, e.options = Object.values(t.entries);
  const n = new Set(Object.keys(t.entries));
  e.extract = (r, o) => {
    const i = {};
    for (const s of r)
      if (n.has(s))
        i[s] = t.entries[s];
      else
        throw new Error(`Key ${s} not found in enum`);
    return new tt({
      ...t,
      checks: [],
      ...S(o),
      entries: i
    });
  }, e.exclude = (r, o) => {
    const i = { ...t.entries };
    for (const s of r)
      if (n.has(s))
        delete i[s];
      else
        throw new Error(`Key ${s} not found in enum`);
    return new tt({
      ...t,
      checks: [],
      ...S(o),
      entries: i
    });
  };
});
function Lr(e, t) {
  const n = Array.isArray(e) ? Object.fromEntries(e.map((r) => [r, r])) : e;
  return new tt({
    type: "enum",
    entries: n,
    ...S(t)
  });
}
const ju = /* @__PURE__ */ h("ZodTransform", (e, t) => {
  ba.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, r, o) => xc(e, n), e._zod.parse = (n, r) => {
    if (r.direction === "backward")
      throw new or(e.constructor.name);
    n.addIssue = (i) => {
      if (typeof i == "string")
        n.issues.push(Ze(i, n.value, t));
      else {
        const s = i;
        s.fatal && (s.continue = !1), s.code ?? (s.code = "custom"), s.input ?? (s.input = n.value), s.inst ?? (s.inst = e), n.issues.push(Ze(s));
      }
    };
    const o = t.transform(n.value, n);
    return o instanceof Promise ? o.then((i) => (n.value = i, n)) : (n.value = o, n);
  };
});
function Fu(e) {
  return new ju({
    type: "transform",
    transform: e
  });
}
const qt = /* @__PURE__ */ h("ZodOptional", (e, t) => {
  Er.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, r, o) => xr(e, n, r, o), e.unwrap = () => e._zod.def.innerType;
});
function Sn(e) {
  return new qt({
    type: "optional",
    innerType: e
  });
}
const Du = /* @__PURE__ */ h("ZodExactOptional", (e, t) => {
  _a.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, r, o) => xr(e, n, r, o), e.unwrap = () => e._zod.def.innerType;
});
function Bu(e) {
  return new Du({
    type: "optional",
    innerType: e
  });
}
const Uu = /* @__PURE__ */ h("ZodNullable", (e, t) => {
  ga.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, r, o) => Zc(e, n, r, o), e.unwrap = () => e._zod.def.innerType;
});
function $n(e) {
  return new Uu({
    type: "nullable",
    innerType: e
  });
}
const Ir = /* @__PURE__ */ h("ZodDefault", (e, t) => {
  ya.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, r, o) => Pc(e, n, r, o), e.unwrap = () => e._zod.def.innerType, e.removeDefault = e.unwrap;
});
function Hu(e, t) {
  return new Ir({
    type: "default",
    innerType: e,
    get defaultValue() {
      return typeof t == "function" ? t() : cr(t);
    }
  });
}
const Vu = /* @__PURE__ */ h("ZodPrefault", (e, t) => {
  va.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, r, o) => Mc(e, n, r, o), e.unwrap = () => e._zod.def.innerType;
});
function qu(e, t) {
  return new Vu({
    type: "prefault",
    innerType: e,
    get defaultValue() {
      return typeof t == "function" ? t() : cr(t);
    }
  });
}
const Zr = /* @__PURE__ */ h("ZodNonOptional", (e, t) => {
  wa.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, r, o) => Oc(e, n, r, o), e.unwrap = () => e._zod.def.innerType;
});
function Wu(e, t) {
  return new Zr({
    type: "nonoptional",
    innerType: e,
    ...S(t)
  });
}
const Ju = /* @__PURE__ */ h("ZodCatch", (e, t) => {
  ka.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, r, o) => jc(e, n, r, o), e.unwrap = () => e._zod.def.innerType, e.removeCatch = e.unwrap;
});
function Gu(e, t) {
  return new Ju({
    type: "catch",
    innerType: e,
    catchValue: typeof t == "function" ? t : () => t
  });
}
const Yu = /* @__PURE__ */ h("ZodPipe", (e, t) => {
  Ea.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, r, o) => Fc(e, n, r, o), e.in = t.in, e.out = t.out;
});
function Nn(e, t) {
  return new Yu({
    type: "pipe",
    in: e,
    out: t
    // ...util.normalizeParams(params),
  });
}
const Xu = /* @__PURE__ */ h("ZodReadonly", (e, t) => {
  za.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, r, o) => Dc(e, n, r, o), e.unwrap = () => e._zod.def.innerType;
});
function Ku(e) {
  return new Xu({
    type: "readonly",
    innerType: e
  });
}
const Qu = /* @__PURE__ */ h("ZodCustom", (e, t) => {
  Sa.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, r, o) => Cc(e, n);
});
function el(e, t = {}) {
  return /* @__PURE__ */ _c(Qu, e, t);
}
function tl(e) {
  return /* @__PURE__ */ gc(e);
}
const nl = /* @__PURE__ */ new Set(["id", "image"]);
function xt(e) {
  return e instanceof qt ? xt(e.unwrap()) : e instanceof Ir ? xt(e._def.innerType) : e;
}
function Or(e) {
  const t = [];
  for (const [n, r] of Object.entries(e.shape)) {
    if (nl.has(n)) continue;
    const o = r, i = xt(o), s = o.description ?? n;
    if (i instanceof Rr) {
      t.push({ key: n, label: s, type: "boolean" });
      continue;
    }
    if (i instanceof tt) {
      t.push({ key: n, label: s, type: "select", options: i.options });
      continue;
    }
    if (i instanceof Vt) {
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
    if (i instanceof Ar) {
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
const Pr = Pe({
  x: he().min(0).max(100),
  y: he().min(0).max(100)
}), Mr = Pe({
  id: W(),
  shape: Lr(["rect", "polygon"]).default("rect"),
  x: he().min(0).max(100),
  y: he().min(0).max(100),
  width: he().min(0).max(100),
  height: he().min(0).max(100),
  points: Oe(Pr).optional(),
  correct: Nu().default(!1),
  label: W().optional()
}), lt = Pe({
  id: W(),
  image: W().optional(),
  zones: Oe(Mr).optional()
}).passthrough(), jr = lt.extend({
  target: W().max(2).describe("אות יעד"),
  correct: W().describe("תשובה נכונה"),
  correctEmoji: W().describe("אמוג'י")
}), Fr = lt.extend({
  target: W().max(2).describe("אות יעד"),
  correct: W().describe("תשובה נכונה"),
  correctEmoji: W().describe("אמוג'י")
}), Dr = Pe({
  title: W().default(""),
  type: W().default("multiple-choice")
}).passthrough(), rl = Pe({
  id: W(),
  version: he().default(1),
  meta: Dr.default({ title: "", type: "multiple-choice" }),
  rounds: Oe(Mu(W(), et())).default([]),
  distractors: Oe(et()).default([])
}), Br = lt.extend({
  instruction: W().optional().describe("הוראה")
}), Tt = {
  "multiple-choice": jr,
  "drag-match": Fr,
  "zone-tap": Br
};
function ol(e, { onFieldChange: t, onDeleteRound: n, roundSchema: r }) {
  const o = document.createElement("div");
  o.className = "ab-editor-inspector";
  const i = document.createElement("div");
  i.className = "ab-editor-inspector__header", i.innerHTML = '<span class="ab-editor-inspector__title">✏️ ערוך סיבוב</span>', o.appendChild(i);
  const s = document.createElement("div");
  s.className = "ab-editor-inspector__body", o.appendChild(s);
  const a = document.createElement("button");
  a.className = "ab-editor-inspector__delete", a.textContent = "🗑 מחק סיבוב", o.appendChild(a), e.appendChild(o);
  let c = null;
  function u() {
    s.innerHTML = '<p class="ab-editor-inspector__empty">בחר סיבוב לעריכה</p>', a.hidden = !0, c = null;
  }
  function l(g, E = "multiple-choice") {
    c = g.id, s.innerHTML = "", a.hidden = !1;
    const y = r ?? Tt[E] ?? Tt["multiple-choice"];
    Or(y).forEach((z) => s.appendChild(d(z, g))), s.appendChild(k(g)), a.onclick = () => {
      confirm("למחוק את הסיבוב הזה?") && (n(c), u());
    };
  }
  function d(g, E) {
    const y = document.createElement("div");
    y.className = "ab-editor-field";
    const x = document.createElement("label");
    switch (x.className = "ab-editor-field__label", x.textContent = g.label, y.appendChild(x), g.type) {
      case "emoji":
        y.appendChild(f(g, E));
        break;
      case "boolean":
        y.appendChild(_(g, E));
        break;
      case "select":
        y.appendChild(b(g, E));
        break;
      case "number":
        y.appendChild(N(g, E));
        break;
      default:
        y.appendChild(p(g, E));
        break;
    }
    return y;
  }
  function p(g, E) {
    const y = document.createElement("input");
    return y.className = "ab-editor-field__input", y.type = "text", y.value = String(E[g.key] ?? ""), y.dir = "rtl", g.maxLength && (y.maxLength = g.maxLength), y.addEventListener("input", () => t(c, g.key, y.value)), y;
  }
  function f(g, E) {
    const y = document.createElement("div");
    y.className = "ab-editor-field__emoji-row";
    const x = document.createElement("div");
    x.className = "ab-editor-field__emoji-preview", x.textContent = String(E[g.key] ?? "❓"), y.appendChild(x);
    const z = document.createElement("input");
    return z.className = "ab-editor-field__input", z.type = "text", z.value = String(E[g.key] ?? ""), z.maxLength = 8, z.placeholder = "🐱", z.style.fontSize = "20px", z.addEventListener("input", () => {
      x.textContent = z.value || "❓", t(c, g.key, z.value);
    }), y.appendChild(z), y;
  }
  function _(g, E) {
    const y = document.createElement("input");
    return y.type = "checkbox", y.checked = !!E[g.key], y.addEventListener("change", () => t(c, g.key, y.checked)), y;
  }
  function b(g, E) {
    const y = document.createElement("select");
    return y.className = "ab-editor-field__input", (g.options ?? []).forEach((x) => {
      const z = document.createElement("option");
      z.value = x, z.textContent = x, E[g.key] === x && (z.selected = !0), y.appendChild(z);
    }), y.addEventListener("change", () => t(c, g.key, y.value)), y;
  }
  function N(g, E) {
    const y = document.createElement("input");
    return y.className = "ab-editor-field__input", y.type = "number", y.value = String(E[g.key] ?? ""), g.min !== void 0 && (y.min = String(g.min)), g.max !== void 0 && (y.max = String(g.max)), y.addEventListener("input", () => t(c, g.key, Number(y.value))), y;
  }
  function k(g) {
    const E = document.createElement("div");
    E.className = "ab-editor-field ab-editor-field--image";
    const y = document.createElement("label");
    y.className = "ab-editor-field__label", y.textContent = "🖼 תמונה", E.appendChild(y);
    const x = document.createElement("div");
    x.className = "ab-editor-field__img-row";
    const z = document.createElement("div");
    z.className = "ab-editor-field__img-preview", g.image && (z.style.backgroundImage = `url(${g.image})`), x.appendChild(z);
    const $ = document.createElement("div");
    $.className = "ab-editor-field__img-btns";
    const w = document.createElement("input");
    w.type = "file", w.accept = "image/*", w.style.display = "none", w.addEventListener("change", () => {
      var m;
      const H = (m = w.files) == null ? void 0 : m[0];
      if (!H) return;
      const V = new FileReader();
      V.onload = (v) => {
        const T = v.target.result;
        z.style.backgroundImage = `url(${T})`, A.textContent = "🔄 החלף", t(c, "image", T), O.isConnected || $.appendChild(O);
      }, V.readAsDataURL(H);
    }), $.appendChild(w);
    const A = document.createElement("button");
    A.className = "ab-editor-btn ab-editor-btn--img-upload", A.textContent = g.image ? "🔄 החלף" : "📤 העלה", A.addEventListener("click", () => w.click()), $.appendChild(A);
    const O = document.createElement("button");
    return O.className = "ab-editor-btn ab-editor-btn--img-clear", O.textContent = "✕ הסר", O.addEventListener("click", () => {
      z.style.backgroundImage = "", A.textContent = "📤 העלה", t(c, "image", null), O.remove();
    }), g.image && $.appendChild(O), x.appendChild($), E.appendChild(x), E;
  }
  function C() {
    o.remove();
  }
  return u(), { loadRound: l, clear: u, destroy: C };
}
const il = [
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
function sl(e) {
  return e.trim().replace(/\s+/g, "-").replace(/[^a-z0-9\u05D0-\u05EA_-]/gi, "").toLowerCase() || `custom-${Date.now()}`;
}
function al(e) {
  return Lt(`alefbet.audio-manager.${e}.custom`, []);
}
function Ur(e, t = null) {
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
  const r = n.querySelector("#ab-am-body"), o = n.querySelector(".ab-am-close"), i = n.querySelector(".ab-am-backdrop"), s = [], a = [...il];
  t && t.rounds.length > 0 && a.splice(1, 0, {
    // insert after Instructions
    id: "rounds",
    label: "🔤 שאלות / סיבובים",
    slots: t.rounds.map((l, d) => ({
      key: l.id,
      label: `סיבוב ${d + 1}${l.target ? " — " + l.target : ""}${l.correct ? " (" + l.correct + ")" : ""}`
    }))
  }), a.forEach((l) => {
    r.appendChild(cl(l, e, s));
  }), r.appendChild(ul(e, s));
  function c() {
    s.forEach((l) => l.destroy()), n.remove();
  }
  o.addEventListener("click", c), i.addEventListener("click", c), document.addEventListener("keydown", function l(d) {
    d.key === "Escape" && (c(), document.removeEventListener("keydown", l));
  });
}
function cl(e, t, n) {
  const r = document.createElement("section");
  r.className = "ab-am-section";
  const o = document.createElement("button");
  o.className = "ab-am-section__heading", o.setAttribute("aria-expanded", "true"), o.innerHTML = `<span>${e.label}</span><span class="ab-am-chevron">▾</span>`, r.appendChild(o);
  const i = document.createElement("div");
  return i.className = "ab-am-grid", r.appendChild(i), e.slots.forEach((s) => {
    i.appendChild(Hr(t, s.key, s.label, n));
  }), o.addEventListener("click", () => {
    const s = o.getAttribute("aria-expanded") === "true";
    o.setAttribute("aria-expanded", String(!s)), i.hidden = s, o.querySelector(".ab-am-chevron").textContent = s ? "▸" : "▾";
  }), r;
}
function ul(e, t) {
  const n = al(e), r = document.createElement("section");
  r.className = "ab-am-section";
  const o = document.createElement("button");
  o.className = "ab-am-section__heading", o.setAttribute("aria-expanded", "true"), o.innerHTML = '<span>➕ מותאם אישית</span><span class="ab-am-chevron">▾</span>', r.appendChild(o);
  const i = document.createElement("div");
  i.className = "ab-am-grid", r.appendChild(i);
  function s() {
    i.querySelectorAll(".ab-am-row").forEach((d) => {
      const p = d._voiceBtn;
      p && (t.splice(t.indexOf(p), 1), p.destroy());
    }), i.innerHTML = "", n.get().forEach((d) => {
      const p = Hr(e, d.key, d.label, t, () => {
        n.update((f) => f.filter((_) => _.key !== d.key)), s();
      });
      i.appendChild(p);
    });
  }
  s();
  const a = document.createElement("div");
  a.className = "ab-am-add-row", a.innerHTML = `
    <input class="ab-am-add-input" type="text" placeholder="שם ההקלטה... (למשל: שאלה ראשונה)" dir="rtl" />
    <button class="ab-am-add-btn">+ הוסף</button>
  `, r.appendChild(a);
  const c = a.querySelector(".ab-am-add-input"), u = a.querySelector(".ab-am-add-btn");
  function l() {
    const d = c.value.trim();
    if (!d) return;
    const p = sl(d);
    if (n.get().some((f) => f.key === p)) {
      c.select();
      return;
    }
    n.update((f) => [...f, { key: p, label: d }]), c.value = "", s();
  }
  return u.addEventListener("click", l), c.addEventListener("keydown", (d) => {
    d.key === "Enter" && l();
  }), o.addEventListener("click", () => {
    const d = o.getAttribute("aria-expanded") === "true";
    o.setAttribute("aria-expanded", String(!d)), i.hidden = d, a.hidden = d, o.querySelector(".ab-am-chevron").textContent = d ? "▸" : "▾";
  }), r;
}
function Hr(e, t, n, r, o = null) {
  const i = document.createElement("div");
  i.className = "ab-am-row";
  const s = document.createElement("div");
  s.className = "ab-am-row__label", s.textContent = n;
  const a = document.createElement("code");
  a.className = "ab-am-row__key", a.textContent = t;
  const c = document.createElement("div");
  c.className = "ab-am-row__label-col", c.appendChild(s), c.appendChild(a);
  const u = document.createElement("div");
  if (u.className = "ab-am-row__ctrl", o) {
    const d = document.createElement("button");
    d.className = "ab-am-row__del", d.title = "הסר", d.setAttribute("aria-label", "הסר הקלטה"), d.textContent = "✕", d.addEventListener("click", o), u.appendChild(d);
  }
  const l = Qn(u, { gameId: e, voiceKey: t, label: n });
  return r.push(l), i._voiceBtn = l, i.appendChild(c), i.appendChild(u), i;
}
let ll = 0;
function Cn() {
  return `zone-${Date.now()}-${ll++}`;
}
function dl(e) {
  const t = e.map((i) => i.x), n = e.map((i) => i.y), r = Math.min(...t), o = Math.min(...n);
  return { x: r, y: o, width: Math.max(...t) - r, height: Math.max(...n) - o };
}
function fl(e, t, n, r, o) {
  return e.map((i) => {
    const s = r > 0 ? (i.x - t) / r * 100 : 0, a = o > 0 ? (i.y - n) / o * 100 : 0;
    return `${s},${a}`;
  }).join(" ");
}
function Vr(e, t, { onChange: n, gameId: r }) {
  let o = structuredClone(t), i = null, s = "rect", a = [], c = null, u = [], l = null, d = null, p = null;
  const f = document.createElement("div");
  f.className = "ab-ze-overlay";
  const _ = document.createElement("div");
  _.className = "ab-ze-draw-rect", _.hidden = !0, f.appendChild(_);
  const b = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  b.classList.add("ab-ze-poly-svg"), b.setAttribute("viewBox", "0 0 100 100"), b.setAttribute("preserveAspectRatio", "none"), b.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:12;", f.appendChild(b);
  const N = document.createElement("div");
  N.className = "ab-ze-toolbar", f.appendChild(N);
  function k() {
    N.innerHTML = "";
    const m = document.createElement("button");
    m.className = `ab-ze-tool-btn${s === "rect" ? " ab-ze-tool-btn--active" : ""}`, m.textContent = "▭ מלבן", m.addEventListener("click", () => {
      y("rect");
    }), N.appendChild(m);
    const v = document.createElement("button");
    v.className = `ab-ze-tool-btn${s === "polygon" ? " ab-ze-tool-btn--active" : ""}`, v.textContent = "✎ חופשי", v.addEventListener("click", () => {
      y("polygon");
    }), N.appendChild(v);
    const T = document.createElement("span");
    T.className = "ab-ze-toolbar__hint", T.textContent = s === "rect" ? "גררו לציור מלבן" : "לחצו נקודות, לחצו פעמיים לסגירה", N.appendChild(T);
  }
  e.style.position = "relative", e.appendChild(f), k();
  function C(m, v) {
    const T = f.getBoundingClientRect();
    return {
      px: Math.max(0, Math.min(100, (m - T.left) / T.width * 100)),
      py: Math.max(0, Math.min(100, (v - T.top) / T.height * 100))
    };
  }
  function g() {
    a.forEach((m) => m.destroy()), a = [], f.querySelectorAll(".ab-ze-zone").forEach((m) => m.remove()), f.querySelectorAll(".ab-ze-panel").forEach((m) => m.remove()), o.forEach((m) => {
      const v = document.createElement("div");
      if (v.className = "ab-ze-zone", m.correct && v.classList.add("ab-ze-zone--correct"), m.id === i && v.classList.add("ab-ze-zone--selected"), v.dataset.zoneId = m.id, v.style.left = `${m.x}%`, v.style.top = `${m.y}%`, v.style.width = `${m.width}%`, v.style.height = `${m.height}%`, m.shape === "polygon" && m.points && m.points.length >= 3) {
        const R = `clip-${m.id}`;
        v.innerHTML = `<svg class="ab-ze-zone__poly-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs><clipPath id="${R}"><polygon points="${fl(m.points, m.x, m.y, m.width, m.height)}"/></clipPath></defs>
          <rect x="0" y="0" width="100" height="100" clip-path="url(#${R})" fill="currentColor"/>
        </svg>`, v.classList.add("ab-ze-zone--poly");
      }
      const T = document.createElement("div");
      T.className = "ab-ze-zone__badge", T.textContent = m.correct ? "✓" : "", m.label && (T.textContent = m.label), v.appendChild(T);
      const F = document.createElement("button");
      F.className = "ab-ze-zone__toggle", F.textContent = m.correct ? "✓ נכון" : "✗ לא נכון", F.title = "סמן כתשובה נכונה / לא נכונה", F.addEventListener("pointerdown", (R) => R.stopPropagation()), F.addEventListener("click", (R) => {
        R.stopPropagation(), m.correct = !m.correct, H(), g();
      }), v.appendChild(F);
      const I = document.createElement("button");
      if (I.className = "ab-ze-zone__delete", I.textContent = "✕", I.title = "מחק אזור", I.addEventListener("pointerdown", (R) => R.stopPropagation()), I.addEventListener("click", (R) => {
        R.stopPropagation(), o = o.filter((D) => D.id !== m.id), i === m.id && (i = null), H(), g();
      }), v.appendChild(I), m.shape !== "polygon" && m.id === i)
        for (const R of ["nw", "ne", "sw", "se"]) {
          const D = document.createElement("div");
          D.className = `ab-ze-zone__handle ab-ze-zone__handle--${R}`, D.dataset.handle = R, D.addEventListener("pointerdown", (B) => {
            B.stopPropagation(), B.preventDefault(), p = {
              zoneId: m.id,
              handle: R,
              origZone: { ...m },
              startX: B.clientX,
              startY: B.clientY
            };
          }), v.appendChild(D);
        }
      if (v.addEventListener("pointerdown", (R) => {
        if (R.stopPropagation(), p) return;
        i = m.id, g();
        const { px: D, py: B } = C(R.clientX, R.clientY);
        d = { zoneId: m.id, offsetX: D - m.x, offsetY: B - m.y };
      }), f.appendChild(v), m.id === i) {
        const R = document.createElement("div");
        R.className = "ab-ze-panel", R.style.left = `${m.x}%`, R.style.top = `${m.y + m.height + 1}%`;
        const D = document.createElement("div");
        D.className = "ab-ze-panel__row";
        const B = document.createElement("input");
        if (B.className = "ab-ze-panel__input", B.type = "text", B.dir = "rtl", B.placeholder = "תווית (למשל: חתול)", B.value = m.label || "", B.addEventListener("pointerdown", (Y) => Y.stopPropagation()), B.addEventListener("input", () => {
          m.label = B.value || void 0, H();
        }), D.appendChild(B), R.appendChild(D), r) {
          const Y = document.createElement("div");
          Y.className = "ab-ze-panel__row";
          const dt = document.createElement("span");
          dt.className = "ab-ze-panel__audio-label", dt.textContent = "🎤", Y.appendChild(dt);
          const Gr = Qn(Y, {
            gameId: r,
            voiceKey: `zone-${m.id}`,
            label: `הקלטה לאזור ${m.label || m.id}`
          });
          a.push(Gr), R.appendChild(Y);
        }
        R.addEventListener("pointerdown", (Y) => Y.stopPropagation()), f.appendChild(R);
      }
    });
  }
  function E() {
    if (b.innerHTML = "", u.length === 0) return;
    const m = [...u];
    l && m.push(l);
    const v = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    v.setAttribute("points", m.map((T) => `${T.x},${T.y}`).join(" ")), v.setAttribute("fill", "rgba(251,191,36,0.15)"), v.setAttribute("stroke", "#fbbf24"), v.setAttribute("stroke-width", "0.4"), v.setAttribute("stroke-dasharray", "1,0.5"), b.appendChild(v), u.forEach((T, F) => {
      const I = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      I.setAttribute("cx", String(T.x)), I.setAttribute("cy", String(T.y)), I.setAttribute("r", "0.8"), I.setAttribute("fill", F === 0 ? "#22c55e" : "#fbbf24"), I.setAttribute("stroke", "#fff"), I.setAttribute("stroke-width", "0.3"), b.appendChild(I);
    });
  }
  function y(m) {
    u.length > 0 && (u = [], l = null, E()), s = m, f.classList.toggle("ab-ze-overlay--poly-mode", m === "polygon"), k();
  }
  function x() {
    if (!c) return;
    const m = Math.min(c.startX, c.curX), v = Math.min(c.startY, c.curY), T = Math.abs(c.curX - c.startX), F = Math.abs(c.curY - c.startY);
    _.style.left = `${m}%`, _.style.top = `${v}%`, _.style.width = `${T}%`, _.style.height = `${F}%`;
  }
  function z() {
    if (u.length < 3) {
      u = [], l = null, E();
      return;
    }
    const m = [...u], v = dl(m);
    if (v.width > 1 && v.height > 1) {
      const T = {
        id: Cn(),
        shape: "polygon",
        ...v,
        points: m,
        correct: !1
      };
      o.push(T), i = T.id, H();
    }
    u = [], l = null, E(), g();
  }
  function $(m) {
    if (m.button !== 0 || m.target.closest(".ab-ze-zone") || m.target.closest(".ab-ze-toolbar") || m.target.closest(".ab-ze-panel")) return;
    if (i = null, s === "polygon") {
      const { px: F, py: I } = C(m.clientX, m.clientY);
      if (u.length >= 3) {
        const R = u[0];
        if (Math.abs(F - R.x) < 2 && Math.abs(I - R.y) < 2) {
          z();
          return;
        }
      }
      u.push({ x: F, y: I }), E(), g();
      return;
    }
    const { px: v, py: T } = C(m.clientX, m.clientY);
    c = { startX: v, startY: T, curX: v, curY: T }, _.hidden = !1, x(), g();
  }
  function w(m) {
    s === "polygon" && u.length >= 3 && (m.preventDefault(), z());
  }
  function A(m) {
    if (s === "polygon" && u.length > 0) {
      const { px: v, py: T } = C(m.clientX, m.clientY);
      l = { x: v, y: T }, E();
    }
    if (c) {
      const { px: v, py: T } = C(m.clientX, m.clientY);
      c.curX = v, c.curY = T, x();
      return;
    }
    if (p) {
      m.preventDefault();
      const v = o.find((B) => B.id === p.zoneId);
      if (!v) return;
      const T = p.origZone, F = f.getBoundingClientRect(), I = (m.clientX - p.startX) / F.width * 100, R = (m.clientY - p.startY) / F.height * 100, D = p.handle;
      D.includes("e") && (v.width = Math.max(3, T.width + I)), D.includes("w") && (v.x = T.x + I, v.width = Math.max(3, T.width - I)), D.includes("s") && (v.height = Math.max(3, T.height + R)), D.includes("n") && (v.y = T.y + R, v.height = Math.max(3, T.height - R)), g();
      return;
    }
    if (d) {
      m.preventDefault();
      const v = o.find((D) => D.id === d.zoneId);
      if (!v) return;
      const { px: T, py: F } = C(m.clientX, m.clientY), I = Math.max(0, Math.min(100 - v.width, T - d.offsetX)), R = Math.max(0, Math.min(100 - v.height, F - d.offsetY));
      if (v.shape === "polygon" && v.points) {
        const D = I - v.x, B = R - v.y;
        v.points = v.points.map((Y) => ({ x: Y.x + D, y: Y.y + B }));
      }
      v.x = I, v.y = R, g();
    }
  }
  function O() {
    if (c) {
      const m = Math.min(c.startX, c.curX), v = Math.min(c.startY, c.curY), T = Math.abs(c.curX - c.startX), F = Math.abs(c.curY - c.startY);
      if (T > 3 && F > 3) {
        const I = {
          id: Cn(),
          shape: "rect",
          x: m,
          y: v,
          width: T,
          height: F,
          correct: !1
        };
        o.push(I), i = I.id, H();
      }
      c = null, _.hidden = !0, g();
      return;
    }
    if (p) {
      p = null, H();
      return;
    }
    d && (d = null, H());
  }
  function H() {
    n(structuredClone(o));
  }
  function V(m) {
    if (m.key === "Escape" && u.length > 0) {
      u = [], l = null, E();
      return;
    }
    if (m.key === "Enter" && u.length >= 3) {
      z();
      return;
    }
    i && ((m.key === "Delete" || m.key === "Backspace") && (o = o.filter((v) => v.id !== i), i = null, H(), g()), m.key === "Escape" && (i = null, g()));
  }
  return f.addEventListener("pointerdown", $), f.addEventListener("dblclick", w), document.addEventListener("pointermove", A), document.addEventListener("pointerup", O), document.addEventListener("keydown", V), g(), {
    setZones(m) {
      o = structuredClone(m), i = null, g();
    },
    getZones() {
      return structuredClone(o);
    },
    setTool(m) {
      y(m);
    },
    destroy() {
      f.removeEventListener("pointerdown", $), f.removeEventListener("dblclick", w), document.removeEventListener("pointermove", A), document.removeEventListener("pointerup", O), document.removeEventListener("keydown", V), a.forEach((m) => m.destroy()), f.remove();
    }
  };
}
let hl = 0;
function pl() {
  return `tpl-zone-${Date.now()}-${hl++}`;
}
const qr = [
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
function Wr(e) {
  return e.zones.map((t) => ({ ...t, id: pl() }));
}
function Jr(e) {
  var c;
  (c = document.getElementById("ab-tpl-picker")) == null || c.remove();
  const t = document.createElement("div");
  t.id = "ab-tpl-picker", t.className = "ab-tpl-modal", t.setAttribute("role", "dialog"), t.setAttribute("aria-modal", "true"), t.setAttribute("aria-label", "בחירת תבנית");
  const n = document.createElement("div");
  n.className = "ab-tpl-backdrop", t.appendChild(n);
  const r = document.createElement("div");
  r.className = "ab-tpl-box";
  const o = document.createElement("div");
  o.className = "ab-tpl-header", o.innerHTML = '<span class="ab-tpl-title">📐 בחרו תבנית</span>';
  const i = document.createElement("button");
  i.className = "ab-ze-close", i.textContent = "✕", i.addEventListener("click", a), o.appendChild(i), r.appendChild(o);
  const s = document.createElement("div");
  s.className = "ab-tpl-grid", qr.forEach((u) => {
    const l = document.createElement("button");
    l.className = "ab-tpl-card", l.addEventListener("click", () => {
      e(Wr(u)), a();
    });
    const d = document.createElement("div");
    d.className = "ab-tpl-card__preview", u.zones.forEach((_) => {
      const b = document.createElement("div");
      b.className = "ab-tpl-card__zone", _.correct && b.classList.add("ab-tpl-card__zone--correct"), b.style.left = `${_.x}%`, b.style.top = `${_.y}%`, b.style.width = `${_.width}%`, b.style.height = `${_.height}%`, d.appendChild(b);
    }), l.appendChild(d);
    const p = document.createElement("div");
    p.className = "ab-tpl-card__label", p.innerHTML = `<span class="ab-tpl-card__icon">${u.icon}</span> ${u.nameHe}`, l.appendChild(p);
    const f = document.createElement("div");
    f.className = "ab-tpl-card__desc", f.textContent = u.description, l.appendChild(f), s.appendChild(l);
  }), r.appendChild(s), t.appendChild(r), document.body.appendChild(t);
  function a() {
    t.remove();
  }
  n.addEventListener("click", a), document.addEventListener("keydown", function u(l) {
    l.key === "Escape" && (a(), document.removeEventListener("keydown", u));
  });
}
class ml {
  constructor(t, n, r = {}) {
    this._mode = "play", this._overlay = null, this._navigator = null, this._inspector = null, this._toolbar = null, this._selectedId = null, this._undoBtn = null, this._redoBtn = null, this._shortcutHandler = null, this._zoneEditor = null, this._zoneModal = null, this._toolbarObserver = null, this._dirty = !1, this._saveStatus = null, this._unsubscribe = n.onChange(() => {
      this._dirty = !0, this._saveStatus && (this._saveStatus.textContent = "שינויים שלא נשמרו");
    }), this._container = t, this._gameData = n, this._restartGame = r.restartGame, this._roundSchema = r.roundSchema, this._toolbarFrame = requestAnimationFrame(() => this._injectToolbar());
  }
  /** הסרת מאזינים ורכיבי עריכה כשהמשחק מסתיים או מוחלף. */
  destroy() {
    var t, n, r, o, i;
    (t = this._toolbarObserver) == null || t.disconnect(), this._container.style.removeProperty("--ab-editor-toolbar-h"), this._unsubscribe(), cancelAnimationFrame(this._toolbarFrame), this._detachShortcuts(), this._closeZoneEditor(), (n = this._overlay) == null || n.destroy(), (r = this._navigator) == null || r.destroy(), (o = this._inspector) == null || o.destroy(), (i = this._toolbar) == null || i.remove(), this._container.classList.remove("ab-editor-active");
  }
  // ── Toolbar ───────────────────────────────────────────────────────────────
  _injectToolbar() {
    const t = this._container.querySelector(".game-header__spacer");
    t && (this._toolbar = document.createElement("div"), this._toolbar.className = "ab-editor-toolbar", this._toolbar.append(
      this._makeBtn("✏️ ערוך", "ab-editor-btn--edit", () => this.enterEditMode()),
      this._makeBtn("🎤 קול", "ab-editor-btn--audio", () => this._openAudioManager())
    ), t.innerHTML = "", t.appendChild(this._toolbar));
  }
  _makeBtn(t, n, r) {
    const o = document.createElement("button");
    return o.className = `ab-editor-btn ${n}`, o.innerHTML = t, o.addEventListener("click", r), o;
  }
  _setToolbarEditMode() {
    var t;
    this._toolbar && (this._toolbar.innerHTML = "", this._undoBtn = this._makeBtn("↩", "ab-editor-btn--undo", () => this._undo()), this._undoBtn.title = "בטל (Ctrl+Z)", this._redoBtn = this._makeBtn("↪", "ab-editor-btn--redo", () => this._redo()), this._redoBtn.title = "בצע שנית (Ctrl+Y)", this._toolbar.append(
      this._makeBtn("▶ שחק", "ab-editor-btn--play", () => this.enterPlayMode()),
      this._makeBtn("+ הוסף", "ab-editor-btn--add", () => this._addRound()),
      this._undoBtn,
      this._redoBtn,
      this._makeBtn("🔲 אזורים", "ab-editor-btn--zones", () => this._openZoneEditor()),
      this._makeBtn("💾 שמור", "ab-editor-btn--save", () => this._save()),
      this._makeBtn("🎤 קול", "ab-editor-btn--audio", () => this._openAudioManager()),
      this._makeBtn("⬇ ייצוא", "ab-editor-btn--export", () => Mn(this._gameData))
    ), this._saveStatus = document.createElement("span"), this._saveStatus.setAttribute("role", "status"), this._saveStatus.className = "ab-editor-save-status", this._saveStatus.textContent = this._dirty ? "שינויים שלא נשמרו" : "", this._toolbar.appendChild(this._saveStatus), (t = this._toolbarObserver) == null || t.disconnect(), this._toolbarObserver = new ResizeObserver(() => {
      this._toolbar && this._container.style.setProperty("--ab-editor-toolbar-h", `${this._toolbar.offsetHeight}px`);
    }), this._toolbarObserver.observe(this._toolbar), this._refreshUndoButtons());
  }
  _setToolbarPlayMode() {
    var t;
    (t = this._toolbarObserver) == null || t.disconnect(), this._container.style.removeProperty("--ab-editor-toolbar-h"), this._toolbar && (this._toolbar.innerHTML = "", this._undoBtn = null, this._redoBtn = null, this._toolbar.append(
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
    this._overlay = ki(t), this._overlay.show(), this._navigator = Ei(this._container, this._gameData, {
      onSelectRound: (r) => this._selectRound(r),
      onAddRound: (r) => this._addRound(r),
      onDuplicateRound: (r) => this._duplicateRound(r),
      onMoveRound: (r, o) => this._moveRound(r, o)
    }), this._inspector = ol(this._container, {
      onFieldChange: (r, o, i) => this._onFieldChange(r, o, i),
      onDeleteRound: (r) => this._deleteRound(r),
      roundSchema: this._roundSchema
    });
    const n = this._gameData.rounds;
    n.length > 0 && this._selectRound(n[0].id);
  }
  enterPlayMode() {
    var t, n, r, o;
    this._mode !== "play" && (this._dirty && !this._save() || (this._mode = "play", this._container.classList.remove("ab-editor-active"), this._setToolbarPlayMode(), this._detachShortcuts(), this._closeZoneEditor(), (t = this._overlay) == null || t.destroy(), (n = this._navigator) == null || n.destroy(), (r = this._inspector) == null || r.destroy(), this._overlay = this._navigator = this._inspector = null, this._selectedId = null, (o = this._restartGame) == null || o.call(this, this._container)));
  }
  // ── Round management ──────────────────────────────────────────────────────
  _selectRound(t) {
    var r, o;
    this._selectedId = t, (r = this._navigator) == null || r.setActiveRound(t);
    const n = this._gameData.getRound(t);
    n && ((o = this._inspector) == null || o.loadRound(n, this._gameData.meta.type));
  }
  _addRound(t = null) {
    var r;
    const n = this._gameData.addRound(t ?? this._selectedId);
    (r = this._navigator) == null || r.refresh(), this._selectRound(n), this._refreshUndoButtons();
  }
  _duplicateRound(t) {
    var r;
    const n = this._gameData.duplicateRound(t ?? this._selectedId);
    n && ((r = this._navigator) == null || r.refresh(), this._selectRound(n), this._refreshUndoButtons());
  }
  _deleteRound(t) {
    var r;
    this._gameData.removeRound(t), (r = this._navigator) == null || r.refresh();
    const n = this._gameData.rounds;
    n.length > 0 && this._selectRound(n[0].id), this._refreshUndoButtons();
  }
  _moveRound(t, n) {
    var r, o;
    this._gameData.moveRound(t, n), (r = this._navigator) == null || r.refresh(), (o = this._navigator) == null || o.setActiveRound(t), this._refreshUndoButtons();
  }
  _onFieldChange(t, n, r) {
    var o, i;
    this._gameData.updateRound(t, { [n]: r }), (o = this._navigator) == null || o.refresh(), (i = this._navigator) == null || i.setActiveRound(t), this._refreshUndoButtons();
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
    var r;
    const t = this._gameData.rounds, n = t.find((o) => o.id === this._selectedId);
    this._selectRound(n ? this._selectedId : (r = t[0]) == null ? void 0 : r.id);
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
    var p;
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
    const r = document.createElement("div");
    r.className = "ab-ze-backdrop", n.appendChild(r);
    const o = document.createElement("div");
    o.className = "ab-ze-box";
    const i = document.createElement("div");
    i.className = "ab-ze-header", i.innerHTML = `
      <span class="ab-ze-title">🔲 עריכת אזורים</span>
      <span class="ab-ze-subtitle">ציירו מלבנים על התמונה וסמנו תשובות נכונות</span>
    `;
    const s = document.createElement("button");
    s.className = "ab-ze-close", s.textContent = "✕", s.addEventListener("click", () => this._closeZoneEditor()), i.appendChild(s), o.appendChild(i);
    const a = document.createElement("div");
    a.className = "ab-ze-img-container";
    const c = document.createElement("img");
    c.className = "ab-ze-img", c.src = t.image, c.alt = "", c.draggable = !1, a.appendChild(c), o.appendChild(a);
    const u = document.createElement("div");
    u.className = "ab-ze-footer";
    const l = document.createElement("button");
    l.className = "ab-editor-btn ab-editor-btn--zones", l.textContent = "📐 תבנית", l.addEventListener("click", () => {
      Jr((f) => {
        var _;
        this._selectedId && (this._gameData.updateRound(this._selectedId, { zones: f }), this._refreshUndoButtons(), (_ = this._zoneEditor) == null || _.setZones(f));
      });
    }), u.appendChild(l);
    const d = document.createElement("button");
    d.className = "ab-editor-btn ab-editor-btn--play", d.textContent = "✓ סיום", d.addEventListener("click", () => this._closeZoneEditor()), u.appendChild(d), o.appendChild(u), n.appendChild(o), document.body.appendChild(n), this._zoneModal = n, c.onload = () => {
      const f = t.zones ?? [];
      this._zoneEditor = Vr(a, f, {
        gameId: this._gameData.id,
        onChange: (_) => {
          this._selectedId && (this._gameData.updateRound(this._selectedId, { zones: _ }), this._refreshUndoButtons());
        }
      });
    }, c.complete && c.naturalWidth > 0 && ((p = c.onload) == null || p.call(c, new Event("load"))), r.addEventListener("click", () => this._closeZoneEditor());
  }
  _closeZoneEditor() {
    var t, n;
    (t = this._zoneEditor) == null || t.destroy(), this._zoneEditor = null, (n = this._zoneModal) == null || n.remove(), this._zoneModal = null;
  }
  // ── Helpers ───────────────────────────────────────────────────────────────
  _openAudioManager() {
    Ur(this._gameData.id, this._gameData);
  }
  _save() {
    return this._gameData.validate() ? On(this._gameData) ? (this._dirty = !1, this._saveStatus && (this._saveStatus.textContent = "נשמר"), this._showToast("✅ נשמר!"), !0) : (this._dirty = !0, this._saveStatus && (this._saveStatus.textContent = "לא נשמר. נסו שוב או הורידו עותק בכפתור ייצוא."), !1) : (this._dirty = !0, this._saveStatus && (this._saveStatus.textContent = "לא נשמר. בדקו את התוכן בכל הסיבובים."), !1);
  }
  _showToast(t) {
    const n = document.createElement("div");
    n.className = "ab-editor-toast", n.textContent = t, document.body.appendChild(n), setTimeout(() => n.remove(), 2200);
  }
}
const bl = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ACTIVITY_TEMPLATES: qr,
  BUILTIN_ROUND_SCHEMAS: Tt,
  BaseRoundSchema: lt,
  DragMatchRoundSchema: Fr,
  GameData: Se,
  GameDataSchema: rl,
  GameEditor: ml,
  GameMetaSchema: Dr,
  MultipleChoiceRoundSchema: jr,
  PointSchema: Pr,
  ZoneSchema: Mr,
  ZoneTapRoundSchema: Br,
  clearGameData: Fo,
  createZoneEditor: Vr,
  exportGameDataAsJSON: Mn,
  generateZonesFromTemplate: Wr,
  loadGameData: Pn,
  saveGameData: On,
  schemaToFields: Or,
  showAudioManager: Ur,
  showTemplatePicker: Jr
}, Symbol.toStringTag, { value: "Module" }));
function Ul(e, t) {
  const {
    title: n = "",
    subtitle: r = "",
    tabs: o = [],
    homeUrl: i = null,
    onTabChange: s = null
  } = t;
  e.classList.add("ab-app");
  const a = i ? `<a href="${i}" class="ab-app-back-link" aria-label="דף הבית">🏠</a>` : "", c = r ? `<span class="ab-app-subtitle">${r}</span>` : '<span class="ab-app-subtitle"></span>', u = o.map(
    (b) => `<button class="ab-app-tab" data-tab="${b.id}" aria-selected="false" role="tab"><span class="ab-app-tab-icon">${b.icon}</span><span class="ab-app-tab-label">${b.label}</span></button>`
  ).join(""), l = o.map(
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
  ), p = (
    /** @type {HTMLElement} */
    e.querySelector(".ab-app-content")
  );
  function f(b) {
    _(b), typeof s == "function" && s(b);
  }
  e.querySelectorAll(".ab-app-tab, .ab-app-nav-item").forEach((b) => {
    b.addEventListener("click", () => f(
      /** @type {HTMLElement} */
      b.dataset.tab
    ));
  });
  function _(b) {
    e.querySelectorAll(".ab-app-tab, .ab-app-nav-item").forEach((N) => {
      const k = (
        /** @type {HTMLElement} */
        N
      ), C = k.dataset.tab === b;
      k.classList.toggle("ab-active", C), k.setAttribute("aria-selected", C ? "true" : "false");
    });
  }
  return o.length > 0 && _(o[0].id), {
    /** אלמנט תוכן הראשי — כאן מרנדרים את תוכן הטאב הנוכחי */
    contentEl: p,
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
      _(b);
    }
  };
}
export {
  qr as ACTIVITY_TEMPLATES,
  Tt as BUILTIN_ROUND_SCHEMAS,
  lt as BaseRoundSchema,
  Fr as DragMatchRoundSchema,
  Yr as EventBus,
  Se as GameData,
  rl as GameDataSchema,
  ml as GameEditor,
  Dr as GameMetaSchema,
  Kr as GameShell,
  Xr as GameState,
  jr as MultipleChoiceRoundSchema,
  Dl as NIKUD_GLYPH_IDS,
  Zt as NIKUD_VOWEL,
  on as PRAISE_PHRASES,
  Pr as PointSchema,
  sn as RETRY_HINTS,
  Je as SOUND_BANK_ID,
  jn as VOWEL_TEMPLATES,
  Mr as ZoneSchema,
  Br as ZoneTapRoundSchema,
  so as addNikud,
  He as animate,
  No as attachGameAudio,
  Bo as bootstrapGame,
  Ho as classifyFormants,
  Fo as clearGameData,
  Ll as compileSoundBank,
  ui as compileTextForKey,
  ei as consonantOnsetSpec,
  Ul as createAppShell,
  vi as createDragSource,
  wi as createDropTarget,
  Ol as createFeedback,
  kl as createHintTracker,
  Lt as createLocalState,
  Bl as createNikudBox,
  Zl as createOptionCards,
  Io as createProgressBar,
  Lo as createRoundManager,
  Qn as createVoiceRecordButton,
  Go as createVoiceRecorder,
  zl as createVowelDetector,
  Ml as createZone,
  Vr as createZoneEditor,
  jl as createZonePlayer,
  Ko as deleteVoice,
  xn as endGame,
  Rt as ensureAudioRunning,
  Mn as exportGameDataAsJSON,
  qo as extractFormantsFromSpectrum,
  Wr as generateZonesFromTemplate,
  wl as getAllProgress,
  nt as getAudioContext,
  vl as getGameProgress,
  At as getLetter,
  uo as getLettersByGroup,
  ao as getNikud,
  Sl as hasVoice,
  we as hebrewLetters,
  Mo as hideLoadingScreen,
  Fl as injectHeaderButton,
  Oo as installGlobalErrorScreen,
  si as isOffline,
  $l as isSynthSupported,
  Jo as isVoiceRecordingSupported,
  no as isVowelized,
  Nl as keyLabel,
  Jn as letterKey,
  An as letterWithNikud,
  Dn as listVoiceKeys,
  Pn as loadGameData,
  Pt as loadVoice,
  El as matchNikudVowel,
  $o as mountAudioStatusBanner,
  lo as nikudBaseLetters,
  pi as nikudGlyphSvg,
  Gn as nikudKey,
  X as nikudList,
  mo as playBlob,
  ge as playVoice,
  co as preloadNikud,
  _l as randomLetters,
  gl as randomNikud,
  di as randomPraise,
  Il as randomRetryHint,
  Ao as recordGameResult,
  Cl as recordedKeys,
  ci as resolveTtsProxyUrl,
  Uo as runGame,
  On as saveGameData,
  Fn as saveVoice,
  Or as schemaToFields,
  Ur as showAudioManager,
  Ro as showCompletionScreen,
  Po as showLoadingScreen,
  Pl as showNikudSettingsDialog,
  Jr as showTemplatePicker,
  yl as shuffle,
  qe as sounds,
  xl as speakLetter,
  Tl as speakNikudSound,
  Al as speakSyllable,
  Rl as speakWord,
  Xn as standardSoundKeys,
  Ln as starsFor,
  Yn as syllableKey,
  Wn as synthesizeSyllable,
  ri as synthesizeVowel,
  oe as tts,
  ho as unlockAudioOutput,
  We as vowelFormantSpec,
  ii as wordKey
};
