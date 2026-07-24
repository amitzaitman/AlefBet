class $r {
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
class Nr {
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
class Cr {
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
    }, this.events = new $r(), this.state = new Nr(this.config.totalRounds), this.gameId = typeof n.gameId == "string" ? n.gameId : "", this._buildShell();
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
let ut = null;
function xr() {
  return typeof window > "u" ? null : window.AudioContext || /** @type {any} */
  window.webkitAudioContext || null;
}
function et() {
  const e = xr();
  if (!e) return null;
  if (!ut)
    try {
      ut = new e();
    } catch {
      return null;
    }
  return ut;
}
async function Tr() {
  const e = et();
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
async function St() {
  const e = et();
  if (!e) return null;
  if (e.state === "suspended")
    try {
      await e.resume();
    } catch {
    }
  return e.state === "running" ? e : null;
}
function Ar(e) {
  return typeof e.arrayBuffer == "function" ? e.arrayBuffer() : new Promise((t, n) => {
    const r = new FileReader();
    r.onload = () => t(
      /** @type {ArrayBuffer} */
      r.result
    ), r.onerror = () => n(r.error), r.readAsArrayBuffer(e);
  });
}
async function Rr(e) {
  if (!e) return !1;
  const t = await St();
  if (!t || typeof t.decodeAudioData != "function") return !1;
  let n;
  try {
    const r = await Ar(e);
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
function Lr() {
  const e = et();
  return e ? (e.state === "suspended" && e.resume(), e) : null;
}
function me(e, t, n = "sine", r = 0.3) {
  const o = Lr();
  if (o)
    try {
      const i = o.createOscillator(), s = o.createGain();
      i.connect(s), s.connect(o.destination), i.type = n, i.frequency.setValueAtTime(e, o.currentTime), s.gain.setValueAtTime(r, o.currentTime), s.gain.exponentialRampToValueAtTime(1e-3, o.currentTime + t), i.start(o.currentTime), i.stop(o.currentTime + t + 0.05);
    } catch {
    }
}
const Ue = {
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
}, Bt = "https://nakdan-u1-0.loadbalancer.dicta.org.il/api";
let Ut = !1;
const Ir = 4e3, Sn = "alefbet.nikudCache.v1", Zr = 300, ie = /* @__PURE__ */ new Map();
(function() {
  if (!(typeof localStorage > "u"))
    try {
      const t = localStorage.getItem(Sn);
      if (!t) return;
      const n = JSON.parse(t);
      if (Array.isArray(n))
        for (const [r, o] of n)
          typeof r == "string" && typeof o == "string" && ie.set(r, o);
    } catch {
    }
})();
function Or() {
  if (!(typeof localStorage > "u"))
    try {
      const e = [...ie.entries()].filter(([t, n]) => n !== t).slice(-Zr);
      localStorage.setItem(Sn, JSON.stringify(e));
    } catch {
    }
}
function Pr(e) {
  if (!e) return !1;
  const t = e.split(/\s+/).filter((r) => /[א-ת]/.test(r));
  return t.length === 0 ? !0 : t.filter((r) => /[\u05B0-\u05BC\u05C1\u05C2\u05C7]/.test(r)).length / t.length >= 0.8;
}
function Mr() {
  var o;
  if (typeof window > "u") return Bt;
  const e = new URLSearchParams(window.location.search).get("nakdanProxy"), t = window.ALEFBET_NAKDAN_PROXY_URL;
  if (e && window.localStorage)
    try {
      window.localStorage.setItem("alefbet.nakdanProxyUrl", e);
    } catch {
    }
  const n = (o = window.localStorage) == null ? void 0 : o.getItem("alefbet.nakdanProxyUrl"), r = e || t || n;
  return r || (window.location.hostname.endsWith("github.io") ? null : Bt);
}
function jr(e) {
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
async function Dr(e) {
  const t = Mr();
  if (!t)
    throw Ut || (Ut = !0, console.warn("[nakdan] Dicta API blocked by CORS on GitHub Pages. Configure a proxy URL via ?nakdanProxy=..., window.ALEFBET_NAKDAN_PROXY_URL, or localStorage key alefbet.nakdanProxyUrl.")), new Error("Nakdan unavailable without proxy on this host");
  const n = typeof AbortController < "u" ? new AbortController() : null, r = n ? setTimeout(() => n.abort(), Ir) : null;
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
  return jr(s);
}
async function Fr(e) {
  if (!(e != null && e.trim())) return e ?? "";
  if (ie.has(e)) return ie.get(e);
  if (Pr(e))
    return ie.set(e, e), e;
  if (typeof navigator < "u" && navigator.onLine === !1)
    return e;
  try {
    const t = await Dr(e);
    return ie.set(e, t), Or(), t;
  } catch {
    return ie.set(e, e), e;
  }
}
function Br(e) {
  return ie.get(e) ?? e ?? "";
}
async function Ur(e) {
  const t = [...new Set(e.filter((n) => n == null ? void 0 : n.trim()))];
  await Promise.all(t.map((n) => Fr(n)));
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
function $t(e) {
  return we.find((t) => t.letter === e) || null;
}
function Hr(e = "regular") {
  return e === "regular" ? we.filter((t) => !t.isFinal) : e === "final" ? we.filter((t) => t.isFinal) : we;
}
function Ku(e, t = "regular") {
  const n = Hr(t);
  return [...n].sort(() => Math.random() - 0.5).slice(0, Math.min(e, n.length));
}
const G = [
  { id: "kamatz", name: "קָמָץ", nameNikud: "קָמָץ", symbol: "ָ", sound: "אָה", color: "#C9442C", textColor: "#fff" },
  { id: "patah", name: "פָּתַח", nameNikud: "פָּתַח", symbol: "ַ", sound: "אָה", color: "#C58119", textColor: "#fff" },
  { id: "hiriq", name: "חִירִיק", nameNikud: "חִירִיק", symbol: "ִ", sound: "אִי", color: "#2A7B71", textColor: "#fff" },
  { id: "tzere", name: "צֵרֶה", nameNikud: "צֵרֶה", symbol: "ֵ", sound: "אֶה", color: "#4A6B8C", textColor: "#fff" },
  { id: "segol", name: "סְגוֹל", nameNikud: "סְגוֹל", symbol: "ֶ", sound: "אֶה", color: "#783952", textColor: "#fff" },
  { id: "holam", name: "חוֹלָם", nameNikud: "חוֹלָם", symbol: "ֹ", sound: "אוֹ", color: "#5F7A42", textColor: "#fff" },
  { id: "kubbutz", name: "קֻבּוּץ", nameNikud: "קֻבּוּץ", symbol: "ֻ", sound: "אוּ", color: "#6B4A8A", textColor: "#fff" }
], Vr = we.filter((e) => !e.isFinal).map((e) => e.letter);
function $n(e, t) {
  return e + t;
}
function Qu(e) {
  let t = [...G];
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
  t.length === 0 && (t = [...G]);
  let n = [...t];
  for (; n.length < e; )
    n.push(...t);
  return n.sort(() => Math.random() - 0.5).slice(0, e);
}
const qr = 2e3;
let te = [], Te = !1, ge = 0.9, lt = typeof localStorage < "u" && parseFloat(localStorage.getItem("alefbet.nikudRate")) || 0.5, Fe = !1, $e = null, de = null, ne = null, Nn = null, Ae = !1, K = "idle";
function He() {
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
function Jr() {
  He() ? K = "idle" : Q("unsupported", "no-speech-synthesis");
}
Jr();
function _t(e, t) {
  Nn = String(t || "unknown"), console.warn("[tts] browser TTS failed", { text: e, reason: t }), typeof window < "u" && typeof window.dispatchEvent == "function" && window.dispatchEvent(new CustomEvent("alefbet:tts-error", {
    detail: { provider: "browser", text: e, sentText: e, reason: t }
  }));
}
function Wr(e) {
  const t = String(e).toLowerCase();
  return t.includes("not-allowed") || t.includes("notallowed") || t.includes("didn't interact") || t.includes("user gesture");
}
function Yr() {
  var e;
  return typeof window > "u" || typeof document > "u" ? Promise.resolve() : Fe || (e = document.userActivation) != null && e.hasBeenActive ? (Fe = !0, Promise.resolve()) : $e || ($e = new Promise((t) => {
    const n = () => {
      Fe = !0, window.removeEventListener("pointerdown", n, !0), window.removeEventListener("keydown", n, !0), window.removeEventListener("touchstart", n, !0), t();
    };
    window.addEventListener("pointerdown", n, { once: !0, capture: !0 }), window.addEventListener("keydown", n, { once: !0, capture: !0 }), window.addEventListener("touchstart", n, { once: !0, capture: !0 });
  }).finally(() => {
    $e = null;
  }), $e);
}
let le = null, Ne = null, dt = !1, Ht = !1;
const Xr = ["carmit", "hila", "female"];
function Gr(e) {
  const t = (e.name || "").toLowerCase();
  return Xr.some((n) => t.includes(n));
}
function ft() {
  if (typeof speechSynthesis > "u") return null;
  const t = speechSynthesis.getVoices().filter(
    (i) => i.lang === "he-IL" || i.lang === "iw-IL" || (i.lang || "").startsWith("he")
  );
  if (t.length === 0) return null;
  const r = typeof navigator < "u" && navigator.onLine === !1 && t.filter((i) => i.localService !== !1) || t, o = r.length > 0 ? r : t;
  return o.find(Gr) || o[0];
}
function Kr() {
  return typeof speechSynthesis > "u" ? Promise.resolve() : (le = ft(), le ? (dt = !0, Promise.resolve()) : dt ? Promise.resolve() : Ne || (Ne = new Promise((e) => {
    let t = !1;
    const n = () => {
      t || (t = !0, dt = !0, le = ft(), typeof speechSynthesis < "u" && typeof speechSynthesis.removeEventListener == "function" && speechSynthesis.removeEventListener("voiceschanged", r), clearTimeout(o), e());
    }, r = () => {
      le = ft(), le && n();
    };
    typeof speechSynthesis.addEventListener == "function" && speechSynthesis.addEventListener("voiceschanged", r);
    const o = setTimeout(() => {
      Ht || (Ht = !0, _t("", "voice-load-timeout")), n();
    }, qr);
  }).finally(() => {
    Ne = null;
  }), Ne));
}
function Qr(e) {
  return 5e3 + ((e == null ? void 0 : e.length) ?? 0) * 200;
}
function Vt(e) {
  return new Promise((t, n) => {
    if (typeof SpeechSynthesisUtterance > "u") {
      n(new Error("SpeechSynthesisUtterance unavailable"));
      return;
    }
    try {
      const r = new SpeechSynthesisUtterance(e);
      r.lang = "he-IL", r.rate = ge, le && (r.voice = le), ne = r;
      let o = !1;
      const i = setTimeout(() => {
        if (!o) {
          o = !0, ne === r && (ne = null);
          try {
            speechSynthesis.cancel();
          } catch {
          }
          n(new Error("utterance-timeout"));
        }
      }, Qr(e));
      r.onend = () => {
        o || (o = !0, clearTimeout(i), ne === r && (ne = null), t());
      }, r.onerror = (s) => {
        o || (o = !0, clearTimeout(i), ne === r && (ne = null), n(new Error(String(s && s.error || "speech-error"))));
      }, speechSynthesis.speak(r);
    } catch (r) {
      n(r instanceof Error ? r : new Error(String(r)));
    }
  });
}
async function eo(e) {
  if (typeof speechSynthesis > "u")
    return { ok: !1, reason: "speechSynthesis unavailable" };
  await Kr();
  try {
    return await Vt(e), Ae = !1, { ok: !0 };
  } catch (t) {
    const n = (t == null ? void 0 : t.message) || "speech-error";
    if (Wr(n)) {
      Ae || (Ae = !0, Q("awaiting-interaction", "autoplay-blocked")), await Yr(), Ae = !1;
      try {
        return await Vt(e), { ok: !0 };
      } catch (r) {
        const o = (r == null ? void 0 : r.message) || "speech-error";
        return _t(e, o), { ok: !1, reason: o };
      }
    }
    return _t(e, n), { ok: !1, reason: n };
  }
}
function ke() {
  if (Te || te.length === 0) return;
  const e = te.shift();
  Te = !0, de = e;
  const t = ge, n = typeof e.rate == "number";
  n && (ge = e.rate), eo(e.text).then((r) => {
    n && (ge = t), Te = !1;
    const o = de === e;
    if (de = null, !o) {
      ke();
      return;
    }
    r.ok ? K !== "unsupported" && Q("ready") : He() ? Q("failed", r.reason, !0) : Q("unsupported", r.reason || "no-provider", !0), e.resolve(), ke();
  }).catch((r) => {
    n && (ge = t), Te = !1, de = null, Q("failed", (r == null ? void 0 : r.message) || "unknown"), e.resolve(), ke();
  });
}
const he = {
  /**
   * הקרא טקסט עברי. ה-promise תמיד נפתר (גם בכשל) כדי שמשחקים לא יתקעו.
   * @param {string} text
   * @returns {Promise<void>}
   */
  speak(e) {
    const t = Br(e);
    return new Promise((n) => {
      te.push({ text: t, resolve: n }), ke();
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
    }), te = [], Te = !1, ne && (ne = null), typeof speechSynthesis < "u" && typeof speechSynthesis.cancel == "function")
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
    return K !== "unsupported" && He();
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
    return Nn;
  },
  /**
   * משחרר ידנית את מנוע הקול אחרי gesture ידוע (כפתור התחל וכו').
   * משחקים יקראו לזה במקום להמתין ל-autoplay block.
   * @returns {Promise<void>}
   */
  unlock() {
    if (Fe = !0, Ae = !1, Tr().catch(() => {
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
    return He() ? K === "unsupported" && Q("idle", "recovered") : Q("unsupported", "no-speech-synthesis"), this.available;
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
    e != null && (lt = Math.max(0.3, Math.min(1.5, e)));
  },
  /**
   * הקרא אות עם ניקוד בשני שלבים: קודם את ההברה בקצב טבעי כדי שהעיצור יהיה קצר,
   * ואז את צליל התנועה לבד בקצב האיטי שמיועד לניקוד - כך הילד שומע
   * "מ-אההההה" במקום "ממממ-אה" שמתקבל מהאטה אחידה של ההברה כולה.
   * @param {string} letter - האות (למשל 'ב').
   * @param {string} nikudSymbol - סמל הניקוד (למשל U+05B7).
   */
  speakNikud(e, t) {
    const n = e + t, r = G.find((o) => o.symbol === t);
    return new Promise((o) => {
      r && r.sound ? (te.push({ text: n, resolve: () => {
      } }), te.push({
        text: r.sound,
        rate: lt,
        resolve: () => o(void 0)
      })) : te.push({ text: n, resolve: () => o(void 0) }), ke();
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
        rate: lt,
        resolve: () => n(void 0)
      }), ke();
    });
  }
}, qt = {
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
}, to = {
  shake: 420,
  bounce: 480,
  pulse: 600,
  fadeIn: 320,
  confetti: 700
};
function Be(e, t) {
  !e || !qt[t] || e.animate(qt[t], {
    duration: to[t] || 400,
    easing: "ease-in-out",
    fill: "none"
  });
}
function Nt(e, t) {
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
      console.warn(`[createLocalState] שגיאה בשמירת "${e}":`, c);
    }
    n.forEach((c) => c(a));
  }
  function i(a) {
    o(a(r()));
  }
  function s(a) {
    return n.push(a), function() {
      const u = n.indexOf(a);
      u !== -1 && n.splice(u, 1);
    };
  }
  return { get: r, set: o, update: i, subscribe: s };
}
const no = "alefbet.progress.v1", Ct = Nt(no, {});
function Cn(e, t) {
  if (!Number.isFinite(e) || !Number.isFinite(t) || t <= 0) return 1;
  const n = e / t;
  return n >= 0.8 ? 3 : n >= 0.5 ? 2 : 1;
}
function ro(e, { score: t, total: n }) {
  if (!e || !Number.isFinite(t) || !Number.isFinite(n) || n <= 0) return null;
  const r = Cn(t, n);
  let o = null;
  return Ct.update((i) => {
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
function el(e) {
  return Ct.get()[e] ?? null;
}
function tl() {
  return Ct.get();
}
function oo(e, t, n, r, o = {}) {
  Ue.cheer(), o.gameId && ro(o.gameId, { score: t, total: n });
  const i = Cn(t, n), s = "⭐".repeat(i) + "☆".repeat(3 - i), a = document.createElement("div");
  a.className = "completion-screen", a.innerHTML = `
    <div class="completion-screen__content">
      <div class="completion-screen__stars" aria-label="${i} כּוֹכָבִים">${s}</div>
      <h2 class="completion-screen__title">!כָּל הַכָּבוֹד</h2>
      <p class="completion-screen__score">נִיקּוּד: ${t} מִתּוֹךְ ${n}</p>
      <button class="completion-screen__replay btn btn--primary">שַׂחֵק שׁוּב</button>
    </div>
  `, a.querySelector(".completion-screen__replay").addEventListener("click", () => {
    a.remove(), r();
  }), e.innerHTML = "", e.appendChild(a), Be(a.querySelector(".completion-screen__content"), "fadeIn");
}
function nl(e, t, {
  totalRounds: n,
  progressBar: r = null,
  buildRoundUI: o,
  onCorrect: i,
  onWrong: s
}) {
  let a = !1;
  async function c(m) {
    if (a) return;
    a = !0, Ue.correct(), m && await m(), i && await i(), e.state.addScore(1), r == null || r.update(e.state.currentRound), await new Promise((g) => setTimeout(g, 1200)), e.state.nextRound() ? (a = !1, o()) : oo(t, e.state.score, n, () => {
      location.reload();
    }, { gameId: e.gameId });
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
let ht = !1, yt = !1, Ce = null;
const io = [
  "ResizeObserver loop",
  // אזהרת דפדפן שפירה
  "Script error."
  // שגיאת cross-origin אטומה, לרוב תוסף דפדפן
];
function Jt(e) {
  const t = String(e || "");
  return io.some((n) => t.includes(n));
}
function Wt() {
  var t;
  if (yt || typeof document > "u" || !document.body) return;
  yt = !0;
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
function so() {
  if (typeof window > "u") return { destroy() {
  } };
  if (ht) return { destroy() {
  } };
  ht = !0;
  const e = (n) => {
    Jt(n == null ? void 0 : n.message) || (console.error("[alefbet] uncaught error:", (n == null ? void 0 : n.error) ?? (n == null ? void 0 : n.message)), Wt());
  }, t = (n) => {
    const r = (
      /** @type {any} */
      n == null ? void 0 : n.reason
    );
    Jt((r == null ? void 0 : r.message) ?? r) || (console.error("[alefbet] unhandled rejection:", r), Wt());
  };
  return window.addEventListener("error", e), window.addEventListener("unhandledrejection", t), Ce = () => {
    window.removeEventListener("error", e), window.removeEventListener("unhandledrejection", t), ht = !1, yt = !1;
  }, { destroy: () => {
    Ce == null || Ce(), Ce = null;
  } };
}
function ao(e, t = "טוֹעֵן...") {
  e.innerHTML = `<div class="ab-loading">${t}</div>`;
}
function co(e) {
  e.innerHTML = "";
}
let uo = 0;
function pt() {
  return `round-${Date.now()}-${uo++}`;
}
class Le {
  // redo stack
  constructor(t) {
    this._id = t.id ?? "game", this._version = t.version ?? 1, this._meta = { title: "", type: "multiple-choice", ...t.meta ?? {} }, this._rounds = (t.rounds ?? []).map((n) => ({ ...n, id: n.id || pt() })), this._distractors = t.distractors ?? [], this._handlers = [], this._past = [], this._future = [];
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
    this._saveHistory();
    const n = { id: pt(), target: "", correct: "", correctEmoji: "❓" };
    if (t === null)
      this._rounds.push(n);
    else {
      const r = this.getRoundIndex(t);
      this._rounds.splice(r + 1, 0, n);
    }
    return this._emit(), n.id;
  }
  duplicateRound(t) {
    const n = this.getRound(t);
    if (!n) return null;
    this._saveHistory();
    const r = { ...n, id: pt() };
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
  static fromJSON(t) {
    return new Le(t);
  }
  static fromRoundsArray(t, n, r = {}, o = []) {
    return new Le({ id: t, meta: r, rounds: n, distractors: o });
  }
}
const xn = "alefbet.editor.";
function Tn(e) {
  return Nt(`${xn}${e}`, null);
}
function lo(e) {
  Tn(e.id).set(e.toJSON());
}
function fo(e) {
  const t = Tn(e).get();
  if (!t) return null;
  try {
    return Le.fromJSON(t);
  } catch {
    return null;
  }
}
function rl(e) {
  try {
    localStorage.removeItem(`${xn}${e}`);
  } catch {
  }
}
function ho(e) {
  const t = JSON.stringify(e.toJSON(), null, 2), n = new Blob([t], { type: "application/json;charset=utf-8" }), r = URL.createObjectURL(n), o = document.createElement("a");
  o.href = r, o.download = `${e.id}-rounds.json`, o.click(), URL.revokeObjectURL(r);
}
function po(e, { onClick: t } = {}) {
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
let be = null, ee = null, vt = 0, wt = 0;
const Ve = /* @__PURE__ */ new Map();
function Yt(e, t) {
  var n;
  return ((n = document.elementFromPoint(e, t)) == null ? void 0 : n.closest('[data-drop-target="true"]')) || null;
}
function mo(e, t, n) {
  const r = e.getBoundingClientRect();
  vt = r.width / 2, wt = r.height / 2, ee = e.cloneNode(!0), Object.assign(ee.style, {
    position: "fixed",
    left: `${t - vt}px`,
    top: `${n - wt}px`,
    width: `${r.width}px`,
    height: `${r.height}px`,
    pointerEvents: "none",
    // keeps it out of elementFromPoint + hit-testing
    zIndex: "9999",
    opacity: "0.85",
    transform: "scale(1.12)",
    cursor: "grabbing",
    margin: "0"
  }), document.body.appendChild(ee);
}
function bo(e, t) {
  ee && (ee.style.left = `${e - vt}px`, ee.style.top = `${t - wt}px`);
}
function go() {
  ee == null || ee.remove(), ee = null;
}
let re = null;
function _o(e) {
  re !== e && (re == null || re.classList.remove("drop-target--hover"), re = e, e == null || e.classList.add("drop-target--hover"));
}
function yo() {
  re == null || re.classList.remove("drop-target--hover"), re = null;
}
function vo(e, t) {
  e.classList.add("drag-source");
  let n = null, r = null, o = null;
  function i() {
    n && (e.removeEventListener("pointermove", n), e.removeEventListener("pointerup", r), e.removeEventListener("pointercancel", o), n = r = o = null), yo(), go(), e.classList.remove("drag-source--dragging"), be = null;
  }
  function s(a) {
    a.button !== void 0 && a.button !== 0 || (a.preventDefault(), be && i(), be = { el: e, data: t }, e.classList.add("drag-source--dragging"), mo(e, a.clientX, a.clientY), e.setPointerCapture(a.pointerId), n = (c) => {
      bo(c.clientX, c.clientY), _o(Yt(c.clientX, c.clientY));
    }, r = (c) => {
      const u = Yt(c.clientX, c.clientY);
      i(), u && Ve.has(u) && Ve.get(u).onDrop({ data: t, sourceEl: e, targetEl: u });
    }, o = () => i(), e.addEventListener("pointermove", n), e.addEventListener("pointerup", r), e.addEventListener("pointercancel", o));
  }
  return e.addEventListener("pointerdown", s), {
    destroy() {
      e.removeEventListener("pointerdown", s), (be == null ? void 0 : be.el) === e && i(), e.classList.remove("drag-source");
    }
  };
}
function wo(e, t) {
  return e.setAttribute("data-drop-target", "true"), e.classList.add("drop-target--active"), Ve.set(e, { onDrop: t }), {
    destroy() {
      e.removeAttribute("data-drop-target"), e.classList.remove("drop-target--active", "drop-target--hover"), Ve.delete(e);
    }
  };
}
function ko(e, t, { onSelectRound: n, onAddRound: r, onDuplicateRound: o, onMoveRound: i }) {
  const s = document.createElement("div");
  s.className = "ab-editor-nav", s.setAttribute("aria-label", "ניווט סיבובים");
  const a = document.createElement("div");
  a.className = "ab-editor-nav__header", a.textContent = "סיבובים", s.appendChild(a);
  const c = document.createElement("div");
  c.className = "ab-editor-nav__list", s.appendChild(c);
  const u = document.createElement("button");
  u.className = "ab-editor-nav__add", u.textContent = "+ הוסף", u.addEventListener("click", () => r(null)), s.appendChild(u), e.appendChild(s);
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
      z.stopPropagation(), o(k.id);
    }), b.appendChild(x), b.addEventListener("click", () => n(k.id)), b.addEventListener("keydown", (z) => {
      (z.key === "Enter" || z.key === " ") && (z.preventDefault(), n(k.id));
    }), d.push(vo(E, { roundId: k.id })), d.push(wo(b, ({ data: z }) => {
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
      const m = l[d];
      m in a || (a[m] = u[m].bind(a));
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
class Ee extends Error {
  constructor() {
    super("Encountered Promise during synchronous parse. Use .parseAsync() instead.");
  }
}
class An extends Error {
  constructor(t) {
    super(`Encountered unidirectional transform during encode: ${t}`), this.name = "ZodEncodeError";
  }
}
const Rn = {};
function se(e) {
  return Rn;
}
function Ln(e) {
  const t = Object.values(e).filter((r) => typeof r == "number");
  return Object.entries(e).filter(([r, o]) => t.indexOf(+r) === -1).map(([r, o]) => o);
}
function kt(e, t) {
  return typeof t == "bigint" ? t.toString() : t;
}
function xt(e) {
  return {
    get value() {
      {
        const t = e();
        return Object.defineProperty(this, "value", { value: t }), t;
      }
    }
  };
}
function Tt(e) {
  return e == null;
}
function At(e) {
  const t = e.startsWith("^") ? 1 : 0, n = e.endsWith("$") ? e.length - 1 : e.length;
  return e.slice(t, n);
}
function Eo(e, t) {
  const n = (e.toString().split(".")[1] || "").length, r = t.toString();
  let o = (r.split(".")[1] || "").length;
  if (o === 0 && /\d?e-\d?/.test(r)) {
    const c = r.match(/\d?e-(\d?)/);
    c != null && c[1] && (o = Number.parseInt(c[1]));
  }
  const i = n > o ? n : o, s = Number.parseInt(e.toFixed(i).replace(".", "")), a = Number.parseInt(t.toFixed(i).replace(".", ""));
  return s % a / 10 ** i;
}
const Xt = Symbol("evaluating");
function L(e, t, n) {
  let r;
  Object.defineProperty(e, t, {
    get() {
      if (r !== Xt)
        return r === void 0 && (r = Xt, r = n()), r;
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
function ce(...e) {
  const t = {};
  for (const n of e) {
    const r = Object.getOwnPropertyDescriptors(n);
    Object.assign(t, r);
  }
  return Object.defineProperties({}, t);
}
function Gt(e) {
  return JSON.stringify(e);
}
function zo(e) {
  return e.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
const In = "captureStackTrace" in Error ? Error.captureStackTrace : (...e) => {
};
function qe(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
const So = xt(() => {
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
function ze(e) {
  if (qe(e) === !1)
    return !1;
  const t = e.constructor;
  if (t === void 0 || typeof t != "function")
    return !0;
  const n = t.prototype;
  return !(qe(n) === !1 || Object.prototype.hasOwnProperty.call(n, "isPrototypeOf") === !1);
}
function Zn(e) {
  return ze(e) ? { ...e } : Array.isArray(e) ? [...e] : e;
}
const $o = /* @__PURE__ */ new Set(["string", "number", "symbol"]);
function tt(e) {
  return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function ue(e, t, n) {
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
function No(e) {
  return Object.keys(e).filter((t) => e[t]._zod.optin === "optional" && e[t]._zod.optout === "optional");
}
const Co = {
  safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
  int32: [-2147483648, 2147483647],
  uint32: [0, 4294967295],
  float32: [-34028234663852886e22, 34028234663852886e22],
  float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
};
function xo(e, t) {
  const n = e._zod.def, r = n.checks;
  if (r && r.length > 0)
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
function To(e, t) {
  const n = e._zod.def, r = n.checks;
  if (r && r.length > 0)
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
function Ao(e, t) {
  if (!ze(t))
    throw new Error("Invalid input to extend: expected a plain object");
  const n = e._zod.def.checks;
  if (n && n.length > 0) {
    const i = e._zod.def.shape;
    for (const s in t)
      if (Object.getOwnPropertyDescriptor(i, s) !== void 0)
        throw new Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
  }
  const o = ce(e._zod.def, {
    get shape() {
      const i = { ...e._zod.def.shape, ...t };
      return pe(this, "shape", i), i;
    }
  });
  return ue(e, o);
}
function Ro(e, t) {
  if (!ze(t))
    throw new Error("Invalid input to safeExtend: expected a plain object");
  const n = ce(e._zod.def, {
    get shape() {
      const r = { ...e._zod.def.shape, ...t };
      return pe(this, "shape", r), r;
    }
  });
  return ue(e, n);
}
function Lo(e, t) {
  const n = ce(e._zod.def, {
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
  return ue(e, n);
}
function Io(e, t, n) {
  const o = t._zod.def.checks;
  if (o && o.length > 0)
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
function Zo(e, t, n) {
  const r = ce(t._zod.def, {
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
  return ue(t, r);
}
function _e(e, t = 0) {
  var n;
  if (e.aborted === !0)
    return !0;
  for (let r = t; r < e.issues.length; r++)
    if (((n = e.issues[r]) == null ? void 0 : n.continue) !== !0)
      return !0;
  return !1;
}
function ye(e, t) {
  return t.map((n) => {
    var r;
    return (r = n).path ?? (r.path = []), n.path.unshift(e), n;
  });
}
function Pe(e) {
  return typeof e == "string" ? e : e == null ? void 0 : e.message;
}
function ae(e, t, n) {
  var o, i, s, a, c, u;
  const r = { ...e, path: e.path ?? [] };
  if (!e.message) {
    const l = Pe((s = (i = (o = e.inst) == null ? void 0 : o._zod.def) == null ? void 0 : i.error) == null ? void 0 : s.call(i, e)) ?? Pe((a = t == null ? void 0 : t.error) == null ? void 0 : a.call(t, e)) ?? Pe((c = n.customError) == null ? void 0 : c.call(n, e)) ?? Pe((u = n.localeError) == null ? void 0 : u.call(n, e)) ?? "Invalid input";
    r.message = l;
  }
  return delete r.inst, delete r.continue, t != null && t.reportInput || delete r.input, r;
}
function Rt(e) {
  return Array.isArray(e) ? "array" : typeof e == "string" ? "string" : "unknown";
}
function Ie(...e) {
  const [t, n, r] = e;
  return typeof t == "string" ? {
    message: t,
    code: "custom",
    input: n,
    inst: r
  } : { ...t };
}
const On = (e, t) => {
  e.name = "$ZodError", Object.defineProperty(e, "_zod", {
    value: e._zod,
    enumerable: !1
  }), Object.defineProperty(e, "issues", {
    value: t,
    enumerable: !1
  }), e.message = JSON.stringify(t, kt, 2), Object.defineProperty(e, "toString", {
    value: () => e.message,
    enumerable: !1
  });
}, Pn = f("$ZodError", On), Mn = f("$ZodError", On, { Parent: Error });
function Oo(e, t = (n) => n.message) {
  const n = {}, r = [];
  for (const o of e.issues)
    o.path.length > 0 ? (n[o.path[0]] = n[o.path[0]] || [], n[o.path[0]].push(t(o))) : r.push(t(o));
  return { formErrors: r, fieldErrors: n };
}
function Po(e, t = (n) => n.message) {
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
const Lt = (e) => (t, n, r, o) => {
  const i = r ? Object.assign(r, { async: !1 }) : { async: !1 }, s = t._zod.run({ value: n, issues: [] }, i);
  if (s instanceof Promise)
    throw new Ee();
  if (s.issues.length) {
    const a = new ((o == null ? void 0 : o.Err) ?? e)(s.issues.map((c) => ae(c, i, se())));
    throw In(a, o == null ? void 0 : o.callee), a;
  }
  return s.value;
}, It = (e) => async (t, n, r, o) => {
  const i = r ? Object.assign(r, { async: !0 }) : { async: !0 };
  let s = t._zod.run({ value: n, issues: [] }, i);
  if (s instanceof Promise && (s = await s), s.issues.length) {
    const a = new ((o == null ? void 0 : o.Err) ?? e)(s.issues.map((c) => ae(c, i, se())));
    throw In(a, o == null ? void 0 : o.callee), a;
  }
  return s.value;
}, nt = (e) => (t, n, r) => {
  const o = r ? { ...r, async: !1 } : { async: !1 }, i = t._zod.run({ value: n, issues: [] }, o);
  if (i instanceof Promise)
    throw new Ee();
  return i.issues.length ? {
    success: !1,
    error: new (e ?? Pn)(i.issues.map((s) => ae(s, o, se())))
  } : { success: !0, data: i.value };
}, Mo = /* @__PURE__ */ nt(Mn), rt = (e) => async (t, n, r) => {
  const o = r ? Object.assign(r, { async: !0 }) : { async: !0 };
  let i = t._zod.run({ value: n, issues: [] }, o);
  return i instanceof Promise && (i = await i), i.issues.length ? {
    success: !1,
    error: new e(i.issues.map((s) => ae(s, o, se())))
  } : { success: !0, data: i.value };
}, jo = /* @__PURE__ */ rt(Mn), Do = (e) => (t, n, r) => {
  const o = r ? Object.assign(r, { direction: "backward" }) : { direction: "backward" };
  return Lt(e)(t, n, o);
}, Fo = (e) => (t, n, r) => Lt(e)(t, n, r), Bo = (e) => async (t, n, r) => {
  const o = r ? Object.assign(r, { direction: "backward" }) : { direction: "backward" };
  return It(e)(t, n, o);
}, Uo = (e) => async (t, n, r) => It(e)(t, n, r), Ho = (e) => (t, n, r) => {
  const o = r ? Object.assign(r, { direction: "backward" }) : { direction: "backward" };
  return nt(e)(t, n, o);
}, Vo = (e) => (t, n, r) => nt(e)(t, n, r), qo = (e) => async (t, n, r) => {
  const o = r ? Object.assign(r, { direction: "backward" }) : { direction: "backward" };
  return rt(e)(t, n, o);
}, Jo = (e) => async (t, n, r) => rt(e)(t, n, r), Wo = /^[cC][^\s-]{8,}$/, Yo = /^[0-9a-z]+$/, Xo = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/, Go = /^[0-9a-vA-V]{20}$/, Ko = /^[A-Za-z0-9]{27}$/, Qo = /^[a-zA-Z0-9_-]{21}$/, ei = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/, ti = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/, Kt = (e) => e ? new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${e}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`) : /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/, ni = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/, ri = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
function oi() {
  return new RegExp(ri, "u");
}
const ii = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, si = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/, ai = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/, ci = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, ui = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/, jn = /^[A-Za-z0-9_-]*$/, li = /^\+[1-9]\d{6,14}$/, Dn = "(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))", di = /* @__PURE__ */ new RegExp(`^${Dn}$`);
function Fn(e) {
  const t = "(?:[01]\\d|2[0-3]):[0-5]\\d";
  return typeof e.precision == "number" ? e.precision === -1 ? `${t}` : e.precision === 0 ? `${t}:[0-5]\\d` : `${t}:[0-5]\\d\\.\\d{${e.precision}}` : `${t}(?::[0-5]\\d(?:\\.\\d+)?)?`;
}
function fi(e) {
  return new RegExp(`^${Fn(e)}$`);
}
function hi(e) {
  const t = Fn({ precision: e.precision }), n = ["Z"];
  e.local && n.push(""), e.offset && n.push("([+-](?:[01]\\d|2[0-3]):[0-5]\\d)");
  const r = `${t}(?:${n.join("|")})`;
  return new RegExp(`^${Dn}T(?:${r})$`);
}
const pi = (e) => {
  const t = e ? `[\\s\\S]{${(e == null ? void 0 : e.minimum) ?? 0},${(e == null ? void 0 : e.maximum) ?? ""}}` : "[\\s\\S]*";
  return new RegExp(`^${t}$`);
}, mi = /^-?\d+$/, Bn = /^-?\d+(?:\.\d+)?$/, bi = /^(?:true|false)$/i, gi = /^[^A-Z]*$/, _i = /^[^a-z]*$/, W = /* @__PURE__ */ f("$ZodCheck", (e, t) => {
  var n;
  e._zod ?? (e._zod = {}), e._zod.def = t, (n = e._zod).onattach ?? (n.onattach = []);
}), Un = {
  number: "number",
  bigint: "bigint",
  object: "date"
}, Hn = /* @__PURE__ */ f("$ZodCheckLessThan", (e, t) => {
  W.init(e, t);
  const n = Un[typeof t.value];
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
}), Vn = /* @__PURE__ */ f("$ZodCheckGreaterThan", (e, t) => {
  W.init(e, t);
  const n = Un[typeof t.value];
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
}), yi = /* @__PURE__ */ f("$ZodCheckMultipleOf", (e, t) => {
  W.init(e, t), e._zod.onattach.push((n) => {
    var r;
    (r = n._zod.bag).multipleOf ?? (r.multipleOf = t.value);
  }), e._zod.check = (n) => {
    if (typeof n.value != typeof t.value)
      throw new Error("Cannot mix number and bigint in multiple_of check.");
    (typeof n.value == "bigint" ? n.value % t.value === BigInt(0) : Eo(n.value, t.value) === 0) || n.issues.push({
      origin: typeof n.value,
      code: "not_multiple_of",
      divisor: t.value,
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), vi = /* @__PURE__ */ f("$ZodCheckNumberFormat", (e, t) => {
  var s;
  W.init(e, t), t.format = t.format || "float64";
  const n = (s = t.format) == null ? void 0 : s.includes("int"), r = n ? "int" : "number", [o, i] = Co[t.format];
  e._zod.onattach.push((a) => {
    const c = a._zod.bag;
    c.format = t.format, c.minimum = o, c.maximum = i, n && (c.pattern = mi);
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
}), wi = /* @__PURE__ */ f("$ZodCheckMaxLength", (e, t) => {
  var n;
  W.init(e, t), (n = e._zod.def).when ?? (n.when = (r) => {
    const o = r.value;
    return !Tt(o) && o.length !== void 0;
  }), e._zod.onattach.push((r) => {
    const o = r._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
    t.maximum < o && (r._zod.bag.maximum = t.maximum);
  }), e._zod.check = (r) => {
    const o = r.value;
    if (o.length <= t.maximum)
      return;
    const s = Rt(o);
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
}), ki = /* @__PURE__ */ f("$ZodCheckMinLength", (e, t) => {
  var n;
  W.init(e, t), (n = e._zod.def).when ?? (n.when = (r) => {
    const o = r.value;
    return !Tt(o) && o.length !== void 0;
  }), e._zod.onattach.push((r) => {
    const o = r._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
    t.minimum > o && (r._zod.bag.minimum = t.minimum);
  }), e._zod.check = (r) => {
    const o = r.value;
    if (o.length >= t.minimum)
      return;
    const s = Rt(o);
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
}), Ei = /* @__PURE__ */ f("$ZodCheckLengthEquals", (e, t) => {
  var n;
  W.init(e, t), (n = e._zod.def).when ?? (n.when = (r) => {
    const o = r.value;
    return !Tt(o) && o.length !== void 0;
  }), e._zod.onattach.push((r) => {
    const o = r._zod.bag;
    o.minimum = t.length, o.maximum = t.length, o.length = t.length;
  }), e._zod.check = (r) => {
    const o = r.value, i = o.length;
    if (i === t.length)
      return;
    const s = Rt(o), a = i > t.length;
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
}), ot = /* @__PURE__ */ f("$ZodCheckStringFormat", (e, t) => {
  var n, r;
  W.init(e, t), e._zod.onattach.push((o) => {
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
}), zi = /* @__PURE__ */ f("$ZodCheckRegex", (e, t) => {
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
}), Si = /* @__PURE__ */ f("$ZodCheckLowerCase", (e, t) => {
  t.pattern ?? (t.pattern = gi), ot.init(e, t);
}), $i = /* @__PURE__ */ f("$ZodCheckUpperCase", (e, t) => {
  t.pattern ?? (t.pattern = _i), ot.init(e, t);
}), Ni = /* @__PURE__ */ f("$ZodCheckIncludes", (e, t) => {
  W.init(e, t);
  const n = tt(t.includes), r = new RegExp(typeof t.position == "number" ? `^.{${t.position}}${n}` : n);
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
}), Ci = /* @__PURE__ */ f("$ZodCheckStartsWith", (e, t) => {
  W.init(e, t);
  const n = new RegExp(`^${tt(t.prefix)}.*`);
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
}), xi = /* @__PURE__ */ f("$ZodCheckEndsWith", (e, t) => {
  W.init(e, t);
  const n = new RegExp(`.*${tt(t.suffix)}$`);
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
}), Ti = /* @__PURE__ */ f("$ZodCheckOverwrite", (e, t) => {
  W.init(e, t), e._zod.check = (n) => {
    n.value = t.tx(n.value);
  };
});
class Ai {
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
const Ri = {
  major: 4,
  minor: 3,
  patch: 6
}, M = /* @__PURE__ */ f("$ZodType", (e, t) => {
  var o;
  var n;
  e ?? (e = {}), e._zod.def = t, e._zod.bag = e._zod.bag || {}, e._zod.version = Ri;
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
      let l = _e(a), d;
      for (const m of c) {
        if (m._zod.def.when) {
          if (!m._zod.def.when(a))
            continue;
        } else if (l)
          continue;
        const p = a.issues.length, g = m._zod.check(a);
        if (g instanceof Promise && (u == null ? void 0 : u.async) === !1)
          throw new Ee();
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
      const l = i(c, r, u);
      if (l instanceof Promise) {
        if (u.async === !1)
          throw new Ee();
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
          throw new Ee();
        return u.then((l) => i(l, r, c));
      }
      return i(u, r, c);
    };
  }
  L(e, "~standard", () => ({
    validate: (i) => {
      var s;
      try {
        const a = Mo(e, i);
        return a.success ? { value: a.data } : { issues: (s = a.error) == null ? void 0 : s.issues };
      } catch {
        return jo(e, i).then((c) => {
          var u;
          return c.success ? { value: c.data } : { issues: (u = c.error) == null ? void 0 : u.issues };
        });
      }
    },
    vendor: "zod",
    version: 1
  }));
}), Zt = /* @__PURE__ */ f("$ZodString", (e, t) => {
  var n;
  M.init(e, t), e._zod.pattern = [...((n = e == null ? void 0 : e._zod.bag) == null ? void 0 : n.patterns) ?? []].pop() ?? pi(e._zod.bag), e._zod.parse = (r, o) => {
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
}), O = /* @__PURE__ */ f("$ZodStringFormat", (e, t) => {
  ot.init(e, t), Zt.init(e, t);
}), Li = /* @__PURE__ */ f("$ZodGUID", (e, t) => {
  t.pattern ?? (t.pattern = ti), O.init(e, t);
}), Ii = /* @__PURE__ */ f("$ZodUUID", (e, t) => {
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
    t.pattern ?? (t.pattern = Kt(r));
  } else
    t.pattern ?? (t.pattern = Kt());
  O.init(e, t);
}), Zi = /* @__PURE__ */ f("$ZodEmail", (e, t) => {
  t.pattern ?? (t.pattern = ni), O.init(e, t);
}), Oi = /* @__PURE__ */ f("$ZodURL", (e, t) => {
  O.init(e, t), e._zod.check = (n) => {
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
}), Pi = /* @__PURE__ */ f("$ZodEmoji", (e, t) => {
  t.pattern ?? (t.pattern = oi()), O.init(e, t);
}), Mi = /* @__PURE__ */ f("$ZodNanoID", (e, t) => {
  t.pattern ?? (t.pattern = Qo), O.init(e, t);
}), ji = /* @__PURE__ */ f("$ZodCUID", (e, t) => {
  t.pattern ?? (t.pattern = Wo), O.init(e, t);
}), Di = /* @__PURE__ */ f("$ZodCUID2", (e, t) => {
  t.pattern ?? (t.pattern = Yo), O.init(e, t);
}), Fi = /* @__PURE__ */ f("$ZodULID", (e, t) => {
  t.pattern ?? (t.pattern = Xo), O.init(e, t);
}), Bi = /* @__PURE__ */ f("$ZodXID", (e, t) => {
  t.pattern ?? (t.pattern = Go), O.init(e, t);
}), Ui = /* @__PURE__ */ f("$ZodKSUID", (e, t) => {
  t.pattern ?? (t.pattern = Ko), O.init(e, t);
}), Hi = /* @__PURE__ */ f("$ZodISODateTime", (e, t) => {
  t.pattern ?? (t.pattern = hi(t)), O.init(e, t);
}), Vi = /* @__PURE__ */ f("$ZodISODate", (e, t) => {
  t.pattern ?? (t.pattern = di), O.init(e, t);
}), qi = /* @__PURE__ */ f("$ZodISOTime", (e, t) => {
  t.pattern ?? (t.pattern = fi(t)), O.init(e, t);
}), Ji = /* @__PURE__ */ f("$ZodISODuration", (e, t) => {
  t.pattern ?? (t.pattern = ei), O.init(e, t);
}), Wi = /* @__PURE__ */ f("$ZodIPv4", (e, t) => {
  t.pattern ?? (t.pattern = ii), O.init(e, t), e._zod.bag.format = "ipv4";
}), Yi = /* @__PURE__ */ f("$ZodIPv6", (e, t) => {
  t.pattern ?? (t.pattern = si), O.init(e, t), e._zod.bag.format = "ipv6", e._zod.check = (n) => {
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
}), Xi = /* @__PURE__ */ f("$ZodCIDRv4", (e, t) => {
  t.pattern ?? (t.pattern = ai), O.init(e, t);
}), Gi = /* @__PURE__ */ f("$ZodCIDRv6", (e, t) => {
  t.pattern ?? (t.pattern = ci), O.init(e, t), e._zod.check = (n) => {
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
function qn(e) {
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
const Ki = /* @__PURE__ */ f("$ZodBase64", (e, t) => {
  t.pattern ?? (t.pattern = ui), O.init(e, t), e._zod.bag.contentEncoding = "base64", e._zod.check = (n) => {
    qn(n.value) || n.issues.push({
      code: "invalid_format",
      format: "base64",
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
});
function Qi(e) {
  if (!jn.test(e))
    return !1;
  const t = e.replace(/[-_]/g, (r) => r === "-" ? "+" : "/"), n = t.padEnd(Math.ceil(t.length / 4) * 4, "=");
  return qn(n);
}
const es = /* @__PURE__ */ f("$ZodBase64URL", (e, t) => {
  t.pattern ?? (t.pattern = jn), O.init(e, t), e._zod.bag.contentEncoding = "base64url", e._zod.check = (n) => {
    Qi(n.value) || n.issues.push({
      code: "invalid_format",
      format: "base64url",
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), ts = /* @__PURE__ */ f("$ZodE164", (e, t) => {
  t.pattern ?? (t.pattern = li), O.init(e, t);
});
function ns(e, t = null) {
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
const rs = /* @__PURE__ */ f("$ZodJWT", (e, t) => {
  O.init(e, t), e._zod.check = (n) => {
    ns(n.value, t.alg) || n.issues.push({
      code: "invalid_format",
      format: "jwt",
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), Jn = /* @__PURE__ */ f("$ZodNumber", (e, t) => {
  M.init(e, t), e._zod.pattern = e._zod.bag.pattern ?? Bn, e._zod.parse = (n, r) => {
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
}), os = /* @__PURE__ */ f("$ZodNumberFormat", (e, t) => {
  vi.init(e, t), Jn.init(e, t);
}), is = /* @__PURE__ */ f("$ZodBoolean", (e, t) => {
  M.init(e, t), e._zod.pattern = bi, e._zod.parse = (n, r) => {
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
}), ss = /* @__PURE__ */ f("$ZodUnknown", (e, t) => {
  M.init(e, t), e._zod.parse = (n) => n;
}), as = /* @__PURE__ */ f("$ZodNever", (e, t) => {
  M.init(e, t), e._zod.parse = (n, r) => (n.issues.push({
    expected: "never",
    code: "invalid_type",
    input: n.value,
    inst: e
  }), n);
});
function Qt(e, t, n) {
  e.issues.length && t.issues.push(...ye(n, e.issues)), t.value[n] = e.value;
}
const cs = /* @__PURE__ */ f("$ZodArray", (e, t) => {
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
      c instanceof Promise ? i.push(c.then((u) => Qt(u, n, s))) : Qt(c, n, s);
    }
    return i.length ? Promise.all(i).then(() => n) : n;
  };
});
function Je(e, t, n, r, o) {
  if (e.issues.length) {
    if (o && !(n in r))
      return;
    t.issues.push(...ye(n, e.issues));
  }
  e.value === void 0 ? n in r && (t.value[n] = void 0) : t.value[n] = e.value;
}
function Wn(e) {
  var r, o, i, s;
  const t = Object.keys(e.shape);
  for (const a of t)
    if (!((s = (i = (o = (r = e.shape) == null ? void 0 : r[a]) == null ? void 0 : o._zod) == null ? void 0 : i.traits) != null && s.has("$ZodType")))
      throw new Error(`Invalid element at key "${a}": expected a Zod schema`);
  const n = No(e.shape);
  return {
    ...e,
    keys: t,
    keySet: new Set(t),
    numKeys: t.length,
    optionalKeys: new Set(n)
  };
}
function Yn(e, t, n, r, o, i) {
  const s = [], a = o.keySet, c = o.catchall._zod, u = c.def.type, l = c.optout === "optional";
  for (const d in t) {
    if (a.has(d))
      continue;
    if (u === "never") {
      s.push(d);
      continue;
    }
    const m = c.run({ value: t[d], issues: [] }, r);
    m instanceof Promise ? e.push(m.then((p) => Je(p, n, d, t, l))) : Je(m, n, d, t, l);
  }
  return s.length && n.issues.push({
    code: "unrecognized_keys",
    keys: s,
    input: t,
    inst: i
  }), e.length ? Promise.all(e).then(() => n) : n;
}
const us = /* @__PURE__ */ f("$ZodObject", (e, t) => {
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
  const r = xt(() => Wn(t));
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
  const o = qe, i = t.catchall;
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
    for (const m of s.keys) {
      const p = d[m], g = p._zod.optout === "optional", _ = p._zod.run({ value: u[m], issues: [] }, c);
      _ instanceof Promise ? l.push(_.then((C) => Je(C, a, m, u, g))) : Je(_, a, m, u, g);
    }
    return i ? Yn(l, u, a, c, r.value, e) : l.length ? Promise.all(l).then(() => a) : a;
  };
}), ls = /* @__PURE__ */ f("$ZodObjectJIT", (e, t) => {
  us.init(e, t);
  const n = e._zod.parse, r = xt(() => Wn(t)), o = (m) => {
    var b;
    const p = new Ai(["shape", "payload", "ctx"]), g = r.value, _ = (E) => {
      const y = Gt(E);
      return `shape[${y}]._zod.run({ value: input[${y}], issues: [] }, ctx)`;
    };
    p.write("const input = payload.value;");
    const C = /* @__PURE__ */ Object.create(null);
    let k = 0;
    for (const E of g.keys)
      C[E] = `key_${k++}`;
    p.write("const newResult = {};");
    for (const E of g.keys) {
      const y = C[E], x = Gt(E), z = m[E], $ = ((b = z == null ? void 0 : z._zod) == null ? void 0 : b.optout) === "optional";
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
  const s = qe, a = !Rn.jitless, u = a && So.value, l = t.catchall;
  let d;
  e._zod.parse = (m, p) => {
    d ?? (d = r.value);
    const g = m.value;
    return s(g) ? a && u && (p == null ? void 0 : p.async) === !1 && p.jitless !== !0 ? (i || (i = o(t.shape)), m = i(m, p), l ? Yn([], g, m, p, d, e) : m) : n(m, p) : (m.issues.push({
      expected: "object",
      code: "invalid_type",
      input: g,
      inst: e
    }), m);
  };
});
function en(e, t, n, r) {
  for (const i of e)
    if (i.issues.length === 0)
      return t.value = i.value, t;
  const o = e.filter((i) => !_e(i));
  return o.length === 1 ? (t.value = o[0].value, o[0]) : (t.issues.push({
    code: "invalid_union",
    input: t.value,
    inst: n,
    errors: e.map((i) => i.issues.map((s) => ae(s, r, se())))
  }), t);
}
const ds = /* @__PURE__ */ f("$ZodUnion", (e, t) => {
  M.init(e, t), L(e._zod, "optin", () => t.options.some((o) => o._zod.optin === "optional") ? "optional" : void 0), L(e._zod, "optout", () => t.options.some((o) => o._zod.optout === "optional") ? "optional" : void 0), L(e._zod, "values", () => {
    if (t.options.every((o) => o._zod.values))
      return new Set(t.options.flatMap((o) => Array.from(o._zod.values)));
  }), L(e._zod, "pattern", () => {
    if (t.options.every((o) => o._zod.pattern)) {
      const o = t.options.map((i) => i._zod.pattern);
      return new RegExp(`^(${o.map((i) => At(i.source)).join("|")})$`);
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
    return s ? Promise.all(a).then((c) => en(c, o, e, i)) : en(a, o, e, i);
  };
}), fs = /* @__PURE__ */ f("$ZodIntersection", (e, t) => {
  M.init(e, t), e._zod.parse = (n, r) => {
    const o = n.value, i = t.left._zod.run({ value: o, issues: [] }, r), s = t.right._zod.run({ value: o, issues: [] }, r);
    return i instanceof Promise || s instanceof Promise ? Promise.all([i, s]).then(([c, u]) => tn(n, c, u)) : tn(n, i, s);
  };
});
function Et(e, t) {
  if (e === t)
    return { valid: !0, data: e };
  if (e instanceof Date && t instanceof Date && +e == +t)
    return { valid: !0, data: e };
  if (ze(e) && ze(t)) {
    const n = Object.keys(t), r = Object.keys(e).filter((i) => n.indexOf(i) !== -1), o = { ...e, ...t };
    for (const i of r) {
      const s = Et(e[i], t[i]);
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
      const o = e[r], i = t[r], s = Et(o, i);
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
function tn(e, t, n) {
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
  if (i.length && o && e.issues.push({ ...o, keys: i }), _e(e))
    return e;
  const s = Et(t.value, n.value);
  if (!s.valid)
    throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(s.mergeErrorPath)}`);
  return e.value = s.data, e;
}
const hs = /* @__PURE__ */ f("$ZodRecord", (e, t) => {
  M.init(e, t), e._zod.parse = (n, r) => {
    const o = n.value;
    if (!ze(o))
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
            d.issues.length && n.issues.push(...ye(u, d.issues)), n.value[u] = d.value;
          })) : (l.issues.length && n.issues.push(...ye(u, l.issues)), n.value[u] = l.value);
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
        if (typeof a == "string" && Bn.test(a) && c.issues.length) {
          const d = t.keyType._zod.run({ value: Number(a), issues: [] }, r);
          if (d instanceof Promise)
            throw new Error("Async schemas not supported in object keys currently");
          d.issues.length === 0 && (c = d);
        }
        if (c.issues.length) {
          t.mode === "loose" ? n.value[a] = o[a] : n.issues.push({
            code: "invalid_key",
            origin: "record",
            issues: c.issues.map((d) => ae(d, r, se())),
            input: a,
            path: [a],
            inst: e
          });
          continue;
        }
        const l = t.valueType._zod.run({ value: o[a], issues: [] }, r);
        l instanceof Promise ? i.push(l.then((d) => {
          d.issues.length && n.issues.push(...ye(a, d.issues)), n.value[c.value] = d.value;
        })) : (l.issues.length && n.issues.push(...ye(a, l.issues)), n.value[c.value] = l.value);
      }
    }
    return i.length ? Promise.all(i).then(() => n) : n;
  };
}), ps = /* @__PURE__ */ f("$ZodEnum", (e, t) => {
  M.init(e, t);
  const n = Ln(t.entries), r = new Set(n);
  e._zod.values = r, e._zod.pattern = new RegExp(`^(${n.filter((o) => $o.has(typeof o)).map((o) => typeof o == "string" ? tt(o) : o.toString()).join("|")})$`), e._zod.parse = (o, i) => {
    const s = o.value;
    return r.has(s) || o.issues.push({
      code: "invalid_value",
      values: n,
      input: s,
      inst: e
    }), o;
  };
}), ms = /* @__PURE__ */ f("$ZodTransform", (e, t) => {
  M.init(e, t), e._zod.parse = (n, r) => {
    if (r.direction === "backward")
      throw new An(e.constructor.name);
    const o = t.transform(n.value, n);
    if (r.async)
      return (o instanceof Promise ? o : Promise.resolve(o)).then((s) => (n.value = s, n));
    if (o instanceof Promise)
      throw new Ee();
    return n.value = o, n;
  };
});
function nn(e, t) {
  return e.issues.length && t === void 0 ? { issues: [], value: void 0 } : e;
}
const Xn = /* @__PURE__ */ f("$ZodOptional", (e, t) => {
  M.init(e, t), e._zod.optin = "optional", e._zod.optout = "optional", L(e._zod, "values", () => t.innerType._zod.values ? /* @__PURE__ */ new Set([...t.innerType._zod.values, void 0]) : void 0), L(e._zod, "pattern", () => {
    const n = t.innerType._zod.pattern;
    return n ? new RegExp(`^(${At(n.source)})?$`) : void 0;
  }), e._zod.parse = (n, r) => {
    if (t.innerType._zod.optin === "optional") {
      const o = t.innerType._zod.run(n, r);
      return o instanceof Promise ? o.then((i) => nn(i, n.value)) : nn(o, n.value);
    }
    return n.value === void 0 ? n : t.innerType._zod.run(n, r);
  };
}), bs = /* @__PURE__ */ f("$ZodExactOptional", (e, t) => {
  Xn.init(e, t), L(e._zod, "values", () => t.innerType._zod.values), L(e._zod, "pattern", () => t.innerType._zod.pattern), e._zod.parse = (n, r) => t.innerType._zod.run(n, r);
}), gs = /* @__PURE__ */ f("$ZodNullable", (e, t) => {
  M.init(e, t), L(e._zod, "optin", () => t.innerType._zod.optin), L(e._zod, "optout", () => t.innerType._zod.optout), L(e._zod, "pattern", () => {
    const n = t.innerType._zod.pattern;
    return n ? new RegExp(`^(${At(n.source)}|null)$`) : void 0;
  }), L(e._zod, "values", () => t.innerType._zod.values ? /* @__PURE__ */ new Set([...t.innerType._zod.values, null]) : void 0), e._zod.parse = (n, r) => n.value === null ? n : t.innerType._zod.run(n, r);
}), _s = /* @__PURE__ */ f("$ZodDefault", (e, t) => {
  M.init(e, t), e._zod.optin = "optional", L(e._zod, "values", () => t.innerType._zod.values), e._zod.parse = (n, r) => {
    if (r.direction === "backward")
      return t.innerType._zod.run(n, r);
    if (n.value === void 0)
      return n.value = t.defaultValue, n;
    const o = t.innerType._zod.run(n, r);
    return o instanceof Promise ? o.then((i) => rn(i, t)) : rn(o, t);
  };
});
function rn(e, t) {
  return e.value === void 0 && (e.value = t.defaultValue), e;
}
const ys = /* @__PURE__ */ f("$ZodPrefault", (e, t) => {
  M.init(e, t), e._zod.optin = "optional", L(e._zod, "values", () => t.innerType._zod.values), e._zod.parse = (n, r) => (r.direction === "backward" || n.value === void 0 && (n.value = t.defaultValue), t.innerType._zod.run(n, r));
}), vs = /* @__PURE__ */ f("$ZodNonOptional", (e, t) => {
  M.init(e, t), L(e._zod, "values", () => {
    const n = t.innerType._zod.values;
    return n ? new Set([...n].filter((r) => r !== void 0)) : void 0;
  }), e._zod.parse = (n, r) => {
    const o = t.innerType._zod.run(n, r);
    return o instanceof Promise ? o.then((i) => on(i, e)) : on(o, e);
  };
});
function on(e, t) {
  return !e.issues.length && e.value === void 0 && e.issues.push({
    code: "invalid_type",
    expected: "nonoptional",
    input: e.value,
    inst: t
  }), e;
}
const ws = /* @__PURE__ */ f("$ZodCatch", (e, t) => {
  M.init(e, t), L(e._zod, "optin", () => t.innerType._zod.optin), L(e._zod, "optout", () => t.innerType._zod.optout), L(e._zod, "values", () => t.innerType._zod.values), e._zod.parse = (n, r) => {
    if (r.direction === "backward")
      return t.innerType._zod.run(n, r);
    const o = t.innerType._zod.run(n, r);
    return o instanceof Promise ? o.then((i) => (n.value = i.value, i.issues.length && (n.value = t.catchValue({
      ...n,
      error: {
        issues: i.issues.map((s) => ae(s, r, se()))
      },
      input: n.value
    }), n.issues = []), n)) : (n.value = o.value, o.issues.length && (n.value = t.catchValue({
      ...n,
      error: {
        issues: o.issues.map((i) => ae(i, r, se()))
      },
      input: n.value
    }), n.issues = []), n);
  };
}), ks = /* @__PURE__ */ f("$ZodPipe", (e, t) => {
  M.init(e, t), L(e._zod, "values", () => t.in._zod.values), L(e._zod, "optin", () => t.in._zod.optin), L(e._zod, "optout", () => t.out._zod.optout), L(e._zod, "propValues", () => t.in._zod.propValues), e._zod.parse = (n, r) => {
    if (r.direction === "backward") {
      const i = t.out._zod.run(n, r);
      return i instanceof Promise ? i.then((s) => Me(s, t.in, r)) : Me(i, t.in, r);
    }
    const o = t.in._zod.run(n, r);
    return o instanceof Promise ? o.then((i) => Me(i, t.out, r)) : Me(o, t.out, r);
  };
});
function Me(e, t, n) {
  return e.issues.length ? (e.aborted = !0, e) : t._zod.run({ value: e.value, issues: e.issues }, n);
}
const Es = /* @__PURE__ */ f("$ZodReadonly", (e, t) => {
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
    return o instanceof Promise ? o.then(sn) : sn(o);
  };
});
function sn(e) {
  return e.value = Object.freeze(e.value), e;
}
const zs = /* @__PURE__ */ f("$ZodCustom", (e, t) => {
  W.init(e, t), M.init(e, t), e._zod.parse = (n, r) => n, e._zod.check = (n) => {
    const r = n.value, o = t.fn(r);
    if (o instanceof Promise)
      return o.then((i) => an(i, n, r, e));
    an(o, n, r, e);
  };
});
function an(e, t, n, r) {
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
    r._zod.def.params && (o.params = r._zod.def.params), t.issues.push(Ie(o));
  }
}
var cn;
class Ss {
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
function $s() {
  return new Ss();
}
(cn = globalThis).__zod_globalRegistry ?? (cn.__zod_globalRegistry = $s());
const Re = globalThis.__zod_globalRegistry;
// @__NO_SIDE_EFFECTS__
function Ns(e, t) {
  return new e({
    type: "string",
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Cs(e, t) {
  return new e({
    type: "string",
    format: "email",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function un(e, t) {
  return new e({
    type: "string",
    format: "guid",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function xs(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Ts(e, t) {
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
function As(e, t) {
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
function Rs(e, t) {
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
function Ls(e, t) {
  return new e({
    type: "string",
    format: "url",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Is(e, t) {
  return new e({
    type: "string",
    format: "emoji",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Zs(e, t) {
  return new e({
    type: "string",
    format: "nanoid",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Os(e, t) {
  return new e({
    type: "string",
    format: "cuid",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Ps(e, t) {
  return new e({
    type: "string",
    format: "cuid2",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Ms(e, t) {
  return new e({
    type: "string",
    format: "ulid",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function js(e, t) {
  return new e({
    type: "string",
    format: "xid",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Ds(e, t) {
  return new e({
    type: "string",
    format: "ksuid",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Fs(e, t) {
  return new e({
    type: "string",
    format: "ipv4",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Bs(e, t) {
  return new e({
    type: "string",
    format: "ipv6",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Us(e, t) {
  return new e({
    type: "string",
    format: "cidrv4",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Hs(e, t) {
  return new e({
    type: "string",
    format: "cidrv6",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Vs(e, t) {
  return new e({
    type: "string",
    format: "base64",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function qs(e, t) {
  return new e({
    type: "string",
    format: "base64url",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Js(e, t) {
  return new e({
    type: "string",
    format: "e164",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Ws(e, t) {
  return new e({
    type: "string",
    format: "jwt",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Ys(e, t) {
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
function Xs(e, t) {
  return new e({
    type: "string",
    format: "date",
    check: "string_format",
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Gs(e, t) {
  return new e({
    type: "string",
    format: "time",
    check: "string_format",
    precision: null,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Ks(e, t) {
  return new e({
    type: "string",
    format: "duration",
    check: "string_format",
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Qs(e, t) {
  return new e({
    type: "number",
    checks: [],
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function ea(e, t) {
  return new e({
    type: "number",
    check: "number_format",
    abort: !1,
    format: "safeint",
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function ta(e, t) {
  return new e({
    type: "boolean",
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function na(e) {
  return new e({
    type: "unknown"
  });
}
// @__NO_SIDE_EFFECTS__
function ra(e, t) {
  return new e({
    type: "never",
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function ln(e, t) {
  return new Hn({
    check: "less_than",
    ...S(t),
    value: e,
    inclusive: !1
  });
}
// @__NO_SIDE_EFFECTS__
function mt(e, t) {
  return new Hn({
    check: "less_than",
    ...S(t),
    value: e,
    inclusive: !0
  });
}
// @__NO_SIDE_EFFECTS__
function dn(e, t) {
  return new Vn({
    check: "greater_than",
    ...S(t),
    value: e,
    inclusive: !1
  });
}
// @__NO_SIDE_EFFECTS__
function bt(e, t) {
  return new Vn({
    check: "greater_than",
    ...S(t),
    value: e,
    inclusive: !0
  });
}
// @__NO_SIDE_EFFECTS__
function fn(e, t) {
  return new yi({
    check: "multiple_of",
    ...S(t),
    value: e
  });
}
// @__NO_SIDE_EFFECTS__
function Gn(e, t) {
  return new wi({
    check: "max_length",
    ...S(t),
    maximum: e
  });
}
// @__NO_SIDE_EFFECTS__
function We(e, t) {
  return new ki({
    check: "min_length",
    ...S(t),
    minimum: e
  });
}
// @__NO_SIDE_EFFECTS__
function Kn(e, t) {
  return new Ei({
    check: "length_equals",
    ...S(t),
    length: e
  });
}
// @__NO_SIDE_EFFECTS__
function oa(e, t) {
  return new zi({
    check: "string_format",
    format: "regex",
    ...S(t),
    pattern: e
  });
}
// @__NO_SIDE_EFFECTS__
function ia(e) {
  return new Si({
    check: "string_format",
    format: "lowercase",
    ...S(e)
  });
}
// @__NO_SIDE_EFFECTS__
function sa(e) {
  return new $i({
    check: "string_format",
    format: "uppercase",
    ...S(e)
  });
}
// @__NO_SIDE_EFFECTS__
function aa(e, t) {
  return new Ni({
    check: "string_format",
    format: "includes",
    ...S(t),
    includes: e
  });
}
// @__NO_SIDE_EFFECTS__
function ca(e, t) {
  return new Ci({
    check: "string_format",
    format: "starts_with",
    ...S(t),
    prefix: e
  });
}
// @__NO_SIDE_EFFECTS__
function ua(e, t) {
  return new xi({
    check: "string_format",
    format: "ends_with",
    ...S(t),
    suffix: e
  });
}
// @__NO_SIDE_EFFECTS__
function Se(e) {
  return new Ti({
    check: "overwrite",
    tx: e
  });
}
// @__NO_SIDE_EFFECTS__
function la(e) {
  return /* @__PURE__ */ Se((t) => t.normalize(e));
}
// @__NO_SIDE_EFFECTS__
function da() {
  return /* @__PURE__ */ Se((e) => e.trim());
}
// @__NO_SIDE_EFFECTS__
function fa() {
  return /* @__PURE__ */ Se((e) => e.toLowerCase());
}
// @__NO_SIDE_EFFECTS__
function ha() {
  return /* @__PURE__ */ Se((e) => e.toUpperCase());
}
// @__NO_SIDE_EFFECTS__
function pa() {
  return /* @__PURE__ */ Se((e) => zo(e));
}
// @__NO_SIDE_EFFECTS__
function ma(e, t, n) {
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
function ba(e, t, n) {
  return new e({
    type: "custom",
    check: "custom",
    fn: t,
    ...S(n)
  });
}
// @__NO_SIDE_EFFECTS__
function ga(e) {
  const t = /* @__PURE__ */ _a((n) => (n.addIssue = (r) => {
    if (typeof r == "string")
      n.issues.push(Ie(r, n.value, t._zod.def));
    else {
      const o = r;
      o.fatal && (o.continue = !1), o.code ?? (o.code = "custom"), o.input ?? (o.input = n.value), o.inst ?? (o.inst = t), o.continue ?? (o.continue = !t._zod.def.abort), n.issues.push(Ie(o));
    }
  }, e(n.value, n)));
  return t;
}
// @__NO_SIDE_EFFECTS__
function _a(e, t) {
  const n = new W({
    check: "custom",
    ...S(t)
  });
  return n._zod.check = e, n;
}
function Qn(e) {
  let t = (e == null ? void 0 : e.target) ?? "draft-2020-12";
  return t === "draft-4" && (t = "draft-04"), t === "draft-7" && (t = "draft-07"), {
    processors: e.processors ?? {},
    metadataRegistry: (e == null ? void 0 : e.metadata) ?? Re,
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
    const m = {
      ...n,
      schemaPath: [...n.schemaPath, e],
      path: n.path
    };
    if (e._zod.processJSONSchema)
      e._zod.processJSONSchema(t, s.schema, m);
    else {
      const g = s.schema, _ = t.processors[o.type];
      if (!_)
        throw new Error(`[toJSONSchema]: Non-representable type encountered: ${o.type}`);
      _(e, t, g, m);
    }
    const p = e._zod.parent;
    p && (s.ref || (s.ref = p), U(p, t, m), t.seen.get(p).isParent = !0);
  }
  const c = t.metadataRegistry.get(e);
  return c && Object.assign(s.schema, c), t.io === "input" && q(e) && (delete s.schema.examples, delete s.schema.default), t.io === "input" && s.schema._prefault && ((r = s.schema).default ?? (r.default = s.schema._prefault)), delete s.schema._prefault, t.seen.get(e).schema;
}
function er(e, t) {
  var s, a, c, u;
  const n = e.seen.get(t);
  if (!n)
    throw new Error("Unprocessed schema. This is a bug in Zod.");
  const r = /* @__PURE__ */ new Map();
  for (const l of e.seen.entries()) {
    const d = (s = e.metadataRegistry.get(l[0])) == null ? void 0 : s.id;
    if (d) {
      const m = r.get(d);
      if (m && m !== l[0])
        throw new Error(`Duplicate schema id "${d}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`);
      r.set(d, l[0]);
    }
  }
  const o = (l) => {
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
    const d = l[1], { ref: m, defId: p } = o(l);
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
function tr(e, t) {
  var s, a, c;
  const n = e.seen.get(t);
  if (!n)
    throw new Error("Unprocessed schema. This is a bug in Zod.");
  const r = (u) => {
    const l = e.seen.get(u);
    if (l.ref === null)
      return;
    const d = l.def ?? l.schema, m = { ...d }, p = l.ref;
    if (l.ref = null, p) {
      r(p);
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
      r(g);
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
          input: Ye(t, "input", e.processors),
          output: Ye(t, "output", e.processors)
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
const ya = (e, t = {}) => (n) => {
  const r = Qn({ ...n, processors: t });
  return U(e, r), er(r, e), tr(r, e);
}, Ye = (e, t, n = {}) => (r) => {
  const { libraryOptions: o, target: i } = r ?? {}, s = Qn({ ...o ?? {}, target: i, io: t, processors: n });
  return U(e, s), er(s, e), tr(s, e);
}, va = {
  guid: "uuid",
  url: "uri",
  datetime: "date-time",
  json_string: "json-string",
  regex: ""
  // do not set
}, wa = (e, t, n, r) => {
  const o = n;
  o.type = "string";
  const { minimum: i, maximum: s, format: a, patterns: c, contentEncoding: u } = e._zod.bag;
  if (typeof i == "number" && (o.minLength = i), typeof s == "number" && (o.maxLength = s), a && (o.format = va[a] ?? a, o.format === "" && delete o.format, a === "time" && delete o.format), u && (o.contentEncoding = u), c && c.size > 0) {
    const l = [...c];
    l.length === 1 ? o.pattern = l[0].source : l.length > 1 && (o.allOf = [
      ...l.map((d) => ({
        ...t.target === "draft-07" || t.target === "draft-04" || t.target === "openapi-3.0" ? { type: "string" } : {},
        pattern: d.source
      }))
    ]);
  }
}, ka = (e, t, n, r) => {
  const o = n, { minimum: i, maximum: s, format: a, multipleOf: c, exclusiveMaximum: u, exclusiveMinimum: l } = e._zod.bag;
  typeof a == "string" && a.includes("int") ? o.type = "integer" : o.type = "number", typeof l == "number" && (t.target === "draft-04" || t.target === "openapi-3.0" ? (o.minimum = l, o.exclusiveMinimum = !0) : o.exclusiveMinimum = l), typeof i == "number" && (o.minimum = i, typeof l == "number" && t.target !== "draft-04" && (l >= i ? delete o.minimum : delete o.exclusiveMinimum)), typeof u == "number" && (t.target === "draft-04" || t.target === "openapi-3.0" ? (o.maximum = u, o.exclusiveMaximum = !0) : o.exclusiveMaximum = u), typeof s == "number" && (o.maximum = s, typeof u == "number" && t.target !== "draft-04" && (u <= s ? delete o.maximum : delete o.exclusiveMaximum)), typeof c == "number" && (o.multipleOf = c);
}, Ea = (e, t, n, r) => {
  n.type = "boolean";
}, za = (e, t, n, r) => {
  n.not = {};
}, Sa = (e, t, n, r) => {
}, $a = (e, t, n, r) => {
  const o = e._zod.def, i = Ln(o.entries);
  i.every((s) => typeof s == "number") && (n.type = "number"), i.every((s) => typeof s == "string") && (n.type = "string"), n.enum = i;
}, Na = (e, t, n, r) => {
  if (t.unrepresentable === "throw")
    throw new Error("Custom types cannot be represented in JSON Schema");
}, Ca = (e, t, n, r) => {
  if (t.unrepresentable === "throw")
    throw new Error("Transforms cannot be represented in JSON Schema");
}, xa = (e, t, n, r) => {
  const o = n, i = e._zod.def, { minimum: s, maximum: a } = e._zod.bag;
  typeof s == "number" && (o.minItems = s), typeof a == "number" && (o.maxItems = a), o.type = "array", o.items = U(i.element, t, { ...r, path: [...r.path, "items"] });
}, Ta = (e, t, n, r) => {
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
}, Aa = (e, t, n, r) => {
  const o = e._zod.def, i = o.inclusive === !1, s = o.options.map((a, c) => U(a, t, {
    ...r,
    path: [...r.path, i ? "oneOf" : "anyOf", c]
  }));
  i ? n.oneOf = s : n.anyOf = s;
}, Ra = (e, t, n, r) => {
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
}, La = (e, t, n, r) => {
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
}, Ia = (e, t, n, r) => {
  const o = e._zod.def, i = U(o.innerType, t, r), s = t.seen.get(e);
  t.target === "openapi-3.0" ? (s.ref = o.innerType, n.nullable = !0) : n.anyOf = [i, { type: "null" }];
}, Za = (e, t, n, r) => {
  const o = e._zod.def;
  U(o.innerType, t, r);
  const i = t.seen.get(e);
  i.ref = o.innerType;
}, Oa = (e, t, n, r) => {
  const o = e._zod.def;
  U(o.innerType, t, r);
  const i = t.seen.get(e);
  i.ref = o.innerType, n.default = JSON.parse(JSON.stringify(o.defaultValue));
}, Pa = (e, t, n, r) => {
  const o = e._zod.def;
  U(o.innerType, t, r);
  const i = t.seen.get(e);
  i.ref = o.innerType, t.io === "input" && (n._prefault = JSON.parse(JSON.stringify(o.defaultValue)));
}, Ma = (e, t, n, r) => {
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
}, ja = (e, t, n, r) => {
  const o = e._zod.def, i = t.io === "input" ? o.in._zod.def.type === "transform" ? o.out : o.in : o.out;
  U(i, t, r);
  const s = t.seen.get(e);
  s.ref = i;
}, Da = (e, t, n, r) => {
  const o = e._zod.def;
  U(o.innerType, t, r);
  const i = t.seen.get(e);
  i.ref = o.innerType, n.readOnly = !0;
}, nr = (e, t, n, r) => {
  const o = e._zod.def;
  U(o.innerType, t, r);
  const i = t.seen.get(e);
  i.ref = o.innerType;
}, Fa = /* @__PURE__ */ f("ZodISODateTime", (e, t) => {
  Hi.init(e, t), P.init(e, t);
});
function Ba(e) {
  return /* @__PURE__ */ Ys(Fa, e);
}
const Ua = /* @__PURE__ */ f("ZodISODate", (e, t) => {
  Vi.init(e, t), P.init(e, t);
});
function Ha(e) {
  return /* @__PURE__ */ Xs(Ua, e);
}
const Va = /* @__PURE__ */ f("ZodISOTime", (e, t) => {
  qi.init(e, t), P.init(e, t);
});
function qa(e) {
  return /* @__PURE__ */ Gs(Va, e);
}
const Ja = /* @__PURE__ */ f("ZodISODuration", (e, t) => {
  Ji.init(e, t), P.init(e, t);
});
function Wa(e) {
  return /* @__PURE__ */ Ks(Ja, e);
}
const Ya = (e, t) => {
  Pn.init(e, t), e.name = "ZodError", Object.defineProperties(e, {
    format: {
      value: (n) => Po(e, n)
      // enumerable: false,
    },
    flatten: {
      value: (n) => Oo(e, n)
      // enumerable: false,
    },
    addIssue: {
      value: (n) => {
        e.issues.push(n), e.message = JSON.stringify(e.issues, kt, 2);
      }
      // enumerable: false,
    },
    addIssues: {
      value: (n) => {
        e.issues.push(...n), e.message = JSON.stringify(e.issues, kt, 2);
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
}, Y = f("ZodError", Ya, {
  Parent: Error
}), Xa = /* @__PURE__ */ Lt(Y), Ga = /* @__PURE__ */ It(Y), Ka = /* @__PURE__ */ nt(Y), Qa = /* @__PURE__ */ rt(Y), ec = /* @__PURE__ */ Do(Y), tc = /* @__PURE__ */ Fo(Y), nc = /* @__PURE__ */ Bo(Y), rc = /* @__PURE__ */ Uo(Y), oc = /* @__PURE__ */ Ho(Y), ic = /* @__PURE__ */ Vo(Y), sc = /* @__PURE__ */ qo(Y), ac = /* @__PURE__ */ Jo(Y), j = /* @__PURE__ */ f("ZodType", (e, t) => (M.init(e, t), Object.assign(e["~standard"], {
  jsonSchema: {
    input: Ye(e, "input"),
    output: Ye(e, "output")
  }
}), e.toJSONSchema = ya(e, {}), e.def = t, e.type = t.type, Object.defineProperty(e, "_def", { value: t }), e.check = (...n) => e.clone(ce(t, {
  checks: [
    ...t.checks ?? [],
    ...n.map((r) => typeof r == "function" ? { _zod: { check: r, def: { check: "custom" }, onattach: [] } } : r)
  ]
}), {
  parent: !0
}), e.with = e.check, e.clone = (n, r) => ue(e, n, r), e.brand = () => e, e.register = (n, r) => (n.add(e, r), e), e.parse = (n, r) => Xa(e, n, r, { callee: e.parse }), e.safeParse = (n, r) => Ka(e, n, r), e.parseAsync = async (n, r) => Ga(e, n, r, { callee: e.parseAsync }), e.safeParseAsync = async (n, r) => Qa(e, n, r), e.spa = e.safeParseAsync, e.encode = (n, r) => ec(e, n, r), e.decode = (n, r) => tc(e, n, r), e.encodeAsync = async (n, r) => nc(e, n, r), e.decodeAsync = async (n, r) => rc(e, n, r), e.safeEncode = (n, r) => oc(e, n, r), e.safeDecode = (n, r) => ic(e, n, r), e.safeEncodeAsync = async (n, r) => sc(e, n, r), e.safeDecodeAsync = async (n, r) => ac(e, n, r), e.refine = (n, r) => e.check(Qc(n, r)), e.superRefine = (n) => e.check(eu(n)), e.overwrite = (n) => e.check(/* @__PURE__ */ Se(n)), e.optional = () => mn(e), e.exactOptional = () => Fc(e), e.nullable = () => bn(e), e.nullish = () => mn(bn(e)), e.nonoptional = (n) => qc(e, n), e.array = () => Ze(e), e.or = (n) => Lc([e, n]), e.and = (n) => Zc(e, n), e.transform = (n) => gn(e, jc(n)), e.default = (n) => Uc(e, n), e.prefault = (n) => Vc(e, n), e.catch = (n) => Wc(e, n), e.pipe = (n) => gn(e, n), e.readonly = () => Gc(e), e.describe = (n) => {
  const r = e.clone();
  return Re.add(r, { description: n }), r;
}, Object.defineProperty(e, "description", {
  get() {
    var n;
    return (n = Re.get(e)) == null ? void 0 : n.description;
  },
  configurable: !0
}), e.meta = (...n) => {
  if (n.length === 0)
    return Re.get(e);
  const r = e.clone();
  return Re.add(r, n[0]), r;
}, e.isOptional = () => e.safeParse(void 0).success, e.isNullable = () => e.safeParse(null).success, e.apply = (n) => n(e), e)), rr = /* @__PURE__ */ f("_ZodString", (e, t) => {
  Zt.init(e, t), j.init(e, t), e._zod.processJSONSchema = (r, o, i) => wa(e, r, o);
  const n = e._zod.bag;
  e.format = n.format ?? null, e.minLength = n.minimum ?? null, e.maxLength = n.maximum ?? null, e.regex = (...r) => e.check(/* @__PURE__ */ oa(...r)), e.includes = (...r) => e.check(/* @__PURE__ */ aa(...r)), e.startsWith = (...r) => e.check(/* @__PURE__ */ ca(...r)), e.endsWith = (...r) => e.check(/* @__PURE__ */ ua(...r)), e.min = (...r) => e.check(/* @__PURE__ */ We(...r)), e.max = (...r) => e.check(/* @__PURE__ */ Gn(...r)), e.length = (...r) => e.check(/* @__PURE__ */ Kn(...r)), e.nonempty = (...r) => e.check(/* @__PURE__ */ We(1, ...r)), e.lowercase = (r) => e.check(/* @__PURE__ */ ia(r)), e.uppercase = (r) => e.check(/* @__PURE__ */ sa(r)), e.trim = () => e.check(/* @__PURE__ */ da()), e.normalize = (...r) => e.check(/* @__PURE__ */ la(...r)), e.toLowerCase = () => e.check(/* @__PURE__ */ fa()), e.toUpperCase = () => e.check(/* @__PURE__ */ ha()), e.slugify = () => e.check(/* @__PURE__ */ pa());
}), or = /* @__PURE__ */ f("ZodString", (e, t) => {
  Zt.init(e, t), rr.init(e, t), e.email = (n) => e.check(/* @__PURE__ */ Cs(cc, n)), e.url = (n) => e.check(/* @__PURE__ */ Ls(uc, n)), e.jwt = (n) => e.check(/* @__PURE__ */ Ws(zc, n)), e.emoji = (n) => e.check(/* @__PURE__ */ Is(lc, n)), e.guid = (n) => e.check(/* @__PURE__ */ un(hn, n)), e.uuid = (n) => e.check(/* @__PURE__ */ xs(je, n)), e.uuidv4 = (n) => e.check(/* @__PURE__ */ Ts(je, n)), e.uuidv6 = (n) => e.check(/* @__PURE__ */ As(je, n)), e.uuidv7 = (n) => e.check(/* @__PURE__ */ Rs(je, n)), e.nanoid = (n) => e.check(/* @__PURE__ */ Zs(dc, n)), e.guid = (n) => e.check(/* @__PURE__ */ un(hn, n)), e.cuid = (n) => e.check(/* @__PURE__ */ Os(fc, n)), e.cuid2 = (n) => e.check(/* @__PURE__ */ Ps(hc, n)), e.ulid = (n) => e.check(/* @__PURE__ */ Ms(pc, n)), e.base64 = (n) => e.check(/* @__PURE__ */ Vs(wc, n)), e.base64url = (n) => e.check(/* @__PURE__ */ qs(kc, n)), e.xid = (n) => e.check(/* @__PURE__ */ js(mc, n)), e.ksuid = (n) => e.check(/* @__PURE__ */ Ds(bc, n)), e.ipv4 = (n) => e.check(/* @__PURE__ */ Fs(gc, n)), e.ipv6 = (n) => e.check(/* @__PURE__ */ Bs(_c, n)), e.cidrv4 = (n) => e.check(/* @__PURE__ */ Us(yc, n)), e.cidrv6 = (n) => e.check(/* @__PURE__ */ Hs(vc, n)), e.e164 = (n) => e.check(/* @__PURE__ */ Js(Ec, n)), e.datetime = (n) => e.check(Ba(n)), e.date = (n) => e.check(Ha(n)), e.time = (n) => e.check(qa(n)), e.duration = (n) => e.check(Wa(n));
});
function J(e) {
  return /* @__PURE__ */ Ns(or, e);
}
const P = /* @__PURE__ */ f("ZodStringFormat", (e, t) => {
  O.init(e, t), rr.init(e, t);
}), cc = /* @__PURE__ */ f("ZodEmail", (e, t) => {
  Zi.init(e, t), P.init(e, t);
}), hn = /* @__PURE__ */ f("ZodGUID", (e, t) => {
  Li.init(e, t), P.init(e, t);
}), je = /* @__PURE__ */ f("ZodUUID", (e, t) => {
  Ii.init(e, t), P.init(e, t);
}), uc = /* @__PURE__ */ f("ZodURL", (e, t) => {
  Oi.init(e, t), P.init(e, t);
}), lc = /* @__PURE__ */ f("ZodEmoji", (e, t) => {
  Pi.init(e, t), P.init(e, t);
}), dc = /* @__PURE__ */ f("ZodNanoID", (e, t) => {
  Mi.init(e, t), P.init(e, t);
}), fc = /* @__PURE__ */ f("ZodCUID", (e, t) => {
  ji.init(e, t), P.init(e, t);
}), hc = /* @__PURE__ */ f("ZodCUID2", (e, t) => {
  Di.init(e, t), P.init(e, t);
}), pc = /* @__PURE__ */ f("ZodULID", (e, t) => {
  Fi.init(e, t), P.init(e, t);
}), mc = /* @__PURE__ */ f("ZodXID", (e, t) => {
  Bi.init(e, t), P.init(e, t);
}), bc = /* @__PURE__ */ f("ZodKSUID", (e, t) => {
  Ui.init(e, t), P.init(e, t);
}), gc = /* @__PURE__ */ f("ZodIPv4", (e, t) => {
  Wi.init(e, t), P.init(e, t);
}), _c = /* @__PURE__ */ f("ZodIPv6", (e, t) => {
  Yi.init(e, t), P.init(e, t);
}), yc = /* @__PURE__ */ f("ZodCIDRv4", (e, t) => {
  Xi.init(e, t), P.init(e, t);
}), vc = /* @__PURE__ */ f("ZodCIDRv6", (e, t) => {
  Gi.init(e, t), P.init(e, t);
}), wc = /* @__PURE__ */ f("ZodBase64", (e, t) => {
  Ki.init(e, t), P.init(e, t);
}), kc = /* @__PURE__ */ f("ZodBase64URL", (e, t) => {
  es.init(e, t), P.init(e, t);
}), Ec = /* @__PURE__ */ f("ZodE164", (e, t) => {
  ts.init(e, t), P.init(e, t);
}), zc = /* @__PURE__ */ f("ZodJWT", (e, t) => {
  rs.init(e, t), P.init(e, t);
}), Ot = /* @__PURE__ */ f("ZodNumber", (e, t) => {
  Jn.init(e, t), j.init(e, t), e._zod.processJSONSchema = (r, o, i) => ka(e, r, o), e.gt = (r, o) => e.check(/* @__PURE__ */ dn(r, o)), e.gte = (r, o) => e.check(/* @__PURE__ */ bt(r, o)), e.min = (r, o) => e.check(/* @__PURE__ */ bt(r, o)), e.lt = (r, o) => e.check(/* @__PURE__ */ ln(r, o)), e.lte = (r, o) => e.check(/* @__PURE__ */ mt(r, o)), e.max = (r, o) => e.check(/* @__PURE__ */ mt(r, o)), e.int = (r) => e.check(pn(r)), e.safe = (r) => e.check(pn(r)), e.positive = (r) => e.check(/* @__PURE__ */ dn(0, r)), e.nonnegative = (r) => e.check(/* @__PURE__ */ bt(0, r)), e.negative = (r) => e.check(/* @__PURE__ */ ln(0, r)), e.nonpositive = (r) => e.check(/* @__PURE__ */ mt(0, r)), e.multipleOf = (r, o) => e.check(/* @__PURE__ */ fn(r, o)), e.step = (r, o) => e.check(/* @__PURE__ */ fn(r, o)), e.finite = () => e;
  const n = e._zod.bag;
  e.minValue = Math.max(n.minimum ?? Number.NEGATIVE_INFINITY, n.exclusiveMinimum ?? Number.NEGATIVE_INFINITY) ?? null, e.maxValue = Math.min(n.maximum ?? Number.POSITIVE_INFINITY, n.exclusiveMaximum ?? Number.POSITIVE_INFINITY) ?? null, e.isInt = (n.format ?? "").includes("int") || Number.isSafeInteger(n.multipleOf ?? 0.5), e.isFinite = !0, e.format = n.format ?? null;
});
function fe(e) {
  return /* @__PURE__ */ Qs(Ot, e);
}
const Sc = /* @__PURE__ */ f("ZodNumberFormat", (e, t) => {
  os.init(e, t), Ot.init(e, t);
});
function pn(e) {
  return /* @__PURE__ */ ea(Sc, e);
}
const ir = /* @__PURE__ */ f("ZodBoolean", (e, t) => {
  is.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, r, o) => Ea(e, n, r);
});
function $c(e) {
  return /* @__PURE__ */ ta(ir, e);
}
const Nc = /* @__PURE__ */ f("ZodUnknown", (e, t) => {
  ss.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, r, o) => Sa();
});
function Xe() {
  return /* @__PURE__ */ na(Nc);
}
const Cc = /* @__PURE__ */ f("ZodNever", (e, t) => {
  as.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, r, o) => za(e, n, r);
});
function xc(e) {
  return /* @__PURE__ */ ra(Cc, e);
}
const Tc = /* @__PURE__ */ f("ZodArray", (e, t) => {
  cs.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, r, o) => xa(e, n, r, o), e.element = t.element, e.min = (n, r) => e.check(/* @__PURE__ */ We(n, r)), e.nonempty = (n) => e.check(/* @__PURE__ */ We(1, n)), e.max = (n, r) => e.check(/* @__PURE__ */ Gn(n, r)), e.length = (n, r) => e.check(/* @__PURE__ */ Kn(n, r)), e.unwrap = () => e.element;
});
function Ze(e, t) {
  return /* @__PURE__ */ ma(Tc, e, t);
}
const Ac = /* @__PURE__ */ f("ZodObject", (e, t) => {
  ls.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, r, o) => Ta(e, n, r, o), L(e, "shape", () => t.shape), e.keyof = () => sr(Object.keys(e._zod.def.shape)), e.catchall = (n) => e.clone({ ...e._zod.def, catchall: n }), e.passthrough = () => e.clone({ ...e._zod.def, catchall: Xe() }), e.loose = () => e.clone({ ...e._zod.def, catchall: Xe() }), e.strict = () => e.clone({ ...e._zod.def, catchall: xc() }), e.strip = () => e.clone({ ...e._zod.def, catchall: void 0 }), e.extend = (n) => Ao(e, n), e.safeExtend = (n) => Ro(e, n), e.merge = (n) => Lo(e, n), e.pick = (n) => xo(e, n), e.omit = (n) => To(e, n), e.partial = (...n) => Io(Pt, e, n[0]), e.required = (...n) => Zo(cr, e, n[0]);
});
function Oe(e, t) {
  const n = {
    type: "object",
    shape: e ?? {},
    ...S(t)
  };
  return new Ac(n);
}
const Rc = /* @__PURE__ */ f("ZodUnion", (e, t) => {
  ds.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, r, o) => Aa(e, n, r, o), e.options = t.options;
});
function Lc(e, t) {
  return new Rc({
    type: "union",
    options: e,
    ...S(t)
  });
}
const Ic = /* @__PURE__ */ f("ZodIntersection", (e, t) => {
  fs.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, r, o) => Ra(e, n, r, o);
});
function Zc(e, t) {
  return new Ic({
    type: "intersection",
    left: e,
    right: t
  });
}
const Oc = /* @__PURE__ */ f("ZodRecord", (e, t) => {
  hs.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, r, o) => La(e, n, r, o), e.keyType = t.keyType, e.valueType = t.valueType;
});
function Pc(e, t, n) {
  return new Oc({
    type: "record",
    keyType: e,
    valueType: t,
    ...S(n)
  });
}
const Ge = /* @__PURE__ */ f("ZodEnum", (e, t) => {
  ps.init(e, t), j.init(e, t), e._zod.processJSONSchema = (r, o, i) => $a(e, r, o), e.enum = t.entries, e.options = Object.values(t.entries);
  const n = new Set(Object.keys(t.entries));
  e.extract = (r, o) => {
    const i = {};
    for (const s of r)
      if (n.has(s))
        i[s] = t.entries[s];
      else
        throw new Error(`Key ${s} not found in enum`);
    return new Ge({
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
    return new Ge({
      ...t,
      checks: [],
      ...S(o),
      entries: i
    });
  };
});
function sr(e, t) {
  const n = Array.isArray(e) ? Object.fromEntries(e.map((r) => [r, r])) : e;
  return new Ge({
    type: "enum",
    entries: n,
    ...S(t)
  });
}
const Mc = /* @__PURE__ */ f("ZodTransform", (e, t) => {
  ms.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, r, o) => Ca(e, n), e._zod.parse = (n, r) => {
    if (r.direction === "backward")
      throw new An(e.constructor.name);
    n.addIssue = (i) => {
      if (typeof i == "string")
        n.issues.push(Ie(i, n.value, t));
      else {
        const s = i;
        s.fatal && (s.continue = !1), s.code ?? (s.code = "custom"), s.input ?? (s.input = n.value), s.inst ?? (s.inst = e), n.issues.push(Ie(s));
      }
    };
    const o = t.transform(n.value, n);
    return o instanceof Promise ? o.then((i) => (n.value = i, n)) : (n.value = o, n);
  };
});
function jc(e) {
  return new Mc({
    type: "transform",
    transform: e
  });
}
const Pt = /* @__PURE__ */ f("ZodOptional", (e, t) => {
  Xn.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, r, o) => nr(e, n, r, o), e.unwrap = () => e._zod.def.innerType;
});
function mn(e) {
  return new Pt({
    type: "optional",
    innerType: e
  });
}
const Dc = /* @__PURE__ */ f("ZodExactOptional", (e, t) => {
  bs.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, r, o) => nr(e, n, r, o), e.unwrap = () => e._zod.def.innerType;
});
function Fc(e) {
  return new Dc({
    type: "optional",
    innerType: e
  });
}
const Bc = /* @__PURE__ */ f("ZodNullable", (e, t) => {
  gs.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, r, o) => Ia(e, n, r, o), e.unwrap = () => e._zod.def.innerType;
});
function bn(e) {
  return new Bc({
    type: "nullable",
    innerType: e
  });
}
const ar = /* @__PURE__ */ f("ZodDefault", (e, t) => {
  _s.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, r, o) => Oa(e, n, r, o), e.unwrap = () => e._zod.def.innerType, e.removeDefault = e.unwrap;
});
function Uc(e, t) {
  return new ar({
    type: "default",
    innerType: e,
    get defaultValue() {
      return typeof t == "function" ? t() : Zn(t);
    }
  });
}
const Hc = /* @__PURE__ */ f("ZodPrefault", (e, t) => {
  ys.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, r, o) => Pa(e, n, r, o), e.unwrap = () => e._zod.def.innerType;
});
function Vc(e, t) {
  return new Hc({
    type: "prefault",
    innerType: e,
    get defaultValue() {
      return typeof t == "function" ? t() : Zn(t);
    }
  });
}
const cr = /* @__PURE__ */ f("ZodNonOptional", (e, t) => {
  vs.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, r, o) => Za(e, n, r, o), e.unwrap = () => e._zod.def.innerType;
});
function qc(e, t) {
  return new cr({
    type: "nonoptional",
    innerType: e,
    ...S(t)
  });
}
const Jc = /* @__PURE__ */ f("ZodCatch", (e, t) => {
  ws.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, r, o) => Ma(e, n, r, o), e.unwrap = () => e._zod.def.innerType, e.removeCatch = e.unwrap;
});
function Wc(e, t) {
  return new Jc({
    type: "catch",
    innerType: e,
    catchValue: typeof t == "function" ? t : () => t
  });
}
const Yc = /* @__PURE__ */ f("ZodPipe", (e, t) => {
  ks.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, r, o) => ja(e, n, r, o), e.in = t.in, e.out = t.out;
});
function gn(e, t) {
  return new Yc({
    type: "pipe",
    in: e,
    out: t
    // ...util.normalizeParams(params),
  });
}
const Xc = /* @__PURE__ */ f("ZodReadonly", (e, t) => {
  Es.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, r, o) => Da(e, n, r, o), e.unwrap = () => e._zod.def.innerType;
});
function Gc(e) {
  return new Xc({
    type: "readonly",
    innerType: e
  });
}
const Kc = /* @__PURE__ */ f("ZodCustom", (e, t) => {
  zs.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, r, o) => Na(e, n);
});
function Qc(e, t = {}) {
  return /* @__PURE__ */ ba(Kc, e, t);
}
function eu(e) {
  return /* @__PURE__ */ ga(e);
}
const tu = /* @__PURE__ */ new Set(["id", "image"]);
function zt(e) {
  return e instanceof Pt ? zt(e.unwrap()) : e instanceof ar ? zt(e._def.innerType) : e;
}
function nu(e) {
  const t = [];
  for (const [n, r] of Object.entries(e.shape)) {
    if (tu.has(n)) continue;
    const o = r, i = zt(o), s = o.description ?? n;
    if (i instanceof ir) {
      t.push({ key: n, label: s, type: "boolean" });
      continue;
    }
    if (i instanceof Ge) {
      t.push({ key: n, label: s, type: "select", options: i.options });
      continue;
    }
    if (i instanceof Ot) {
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
    if (i instanceof or) {
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
const ru = Oe({
  x: fe().min(0).max(100),
  y: fe().min(0).max(100)
}), ou = Oe({
  id: J(),
  shape: sr(["rect", "polygon"]).default("rect"),
  x: fe().min(0).max(100),
  y: fe().min(0).max(100),
  width: fe().min(0).max(100),
  height: fe().min(0).max(100),
  points: Ze(ru).optional(),
  correct: $c().default(!1),
  label: J().optional()
}), Mt = Oe({
  id: J(),
  image: J().optional(),
  zones: Ze(ou).optional()
}).passthrough(), iu = Mt.extend({
  target: J().max(2).describe("אות יעד"),
  correct: J().describe("תשובה נכונה"),
  correctEmoji: J().describe("אמוג'י")
}), su = Mt.extend({
  target: J().max(2).describe("אות יעד"),
  correct: J().describe("תשובה נכונה"),
  correctEmoji: J().describe("אמוג'י")
}), au = Oe({
  title: J().default(""),
  type: J().default("multiple-choice")
}).passthrough(), ol = Oe({
  id: J(),
  version: fe().default(1),
  meta: au.default({ title: "", type: "multiple-choice" }),
  rounds: Ze(Pc(J(), Xe())).default([]),
  distractors: Ze(Xe()).default([])
}), cu = Mt.extend({
  instruction: J().optional().describe("הוראה")
}), _n = {
  "multiple-choice": iu,
  "drag-match": su,
  "zone-tap": cu
};
function uu(e, { onFieldChange: t, onDeleteRound: n, roundSchema: r }) {
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
  function l(b, E = "multiple-choice") {
    c = b.id, s.innerHTML = "", a.hidden = !1;
    const y = r ?? _n[E] ?? _n["multiple-choice"];
    nu(y).forEach((z) => s.appendChild(d(z, b))), s.appendChild(k(b)), a.onclick = () => {
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
        z.style.backgroundImage = `url(${T})`, A.textContent = "🔄 החלף", t(c, "image", T), I.isConnected || $.appendChild(I);
      }, V.readAsDataURL(H);
    }), $.appendChild(w);
    const A = document.createElement("button");
    A.className = "ab-editor-btn ab-editor-btn--img-upload", A.textContent = b.image ? "🔄 החלף" : "📤 העלה", A.addEventListener("click", () => w.click()), $.appendChild(A);
    const I = document.createElement("button");
    return I.className = "ab-editor-btn ab-editor-btn--img-clear", I.textContent = "✕ הסר", I.addEventListener("click", () => {
      z.style.backgroundImage = "", A.textContent = "📤 העלה", t(c, "image", null), I.remove();
    }), b.image && $.appendChild(I), x.appendChild($), E.appendChild(x), E;
  }
  function N() {
    o.remove();
  }
  return u(), { loadRound: l, clear: u, destroy: N };
}
function lu() {
  return ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/ogg"].find((t) => MediaRecorder.isTypeSupported(t)) || "";
}
function du() {
  var e;
  return typeof navigator < "u" && typeof ((e = navigator.mediaDevices) == null ? void 0 : e.getUserMedia) == "function" && typeof MediaRecorder < "u";
}
function fu() {
  let e = null, t = null, n = [];
  async function r() {
    if (e && e.state === "recording") return;
    t = await navigator.mediaDevices.getUserMedia({ audio: !0, video: !1 }), n = [];
    const c = {}, u = lu();
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
const hu = "alefbet-voices", oe = "recordings", pu = 1;
let xe = null;
function it() {
  return xe || (xe = new Promise((e, t) => {
    const n = indexedDB.open(hu, pu);
    n.onupgradeneeded = () => {
      n.result.createObjectStore(oe);
    }, n.onsuccess = () => e(n.result), n.onerror = () => {
      xe = null, t(n.error);
    };
  }), xe);
}
function jt(e, t) {
  return `${e}/${t}`;
}
async function ur(e, t, n) {
  const r = await it();
  return new Promise((o, i) => {
    const s = r.transaction(oe, "readwrite");
    s.objectStore(oe).put(n, jt(e, t)), s.oncomplete = o, s.onerror = (a) => i(a.target.error);
  });
}
async function Dt(e, t) {
  const n = await it();
  return new Promise((r, o) => {
    const s = n.transaction(oe, "readonly").objectStore(oe).get(jt(e, t));
    s.onsuccess = () => r(s.result ?? null), s.onerror = (a) => o(a.target.error);
  });
}
async function mu(e, t) {
  const n = await it();
  return new Promise((r, o) => {
    const i = n.transaction(oe, "readwrite");
    i.objectStore(oe).delete(jt(e, t)), i.oncomplete = r, i.onerror = (s) => o(s.target.error);
  });
}
async function lr(e) {
  const t = await it();
  return new Promise((n, r) => {
    const i = t.transaction(oe, "readonly").objectStore(oe).getAllKeys();
    i.onsuccess = () => {
      const s = `${e}/`;
      n(
        (i.result || []).filter((a) => a.startsWith(s)).map((a) => a.slice(s.length))
      );
    }, i.onerror = (s) => r(s.target.error);
  });
}
async function ve(e, t) {
  let n;
  try {
    n = await Dt(e, t);
  } catch {
    return !1;
  }
  return n ? await Rr(n) ? !0 : new Promise((r) => {
    const o = URL.createObjectURL(n), i = new Audio(o), s = (a) => {
      URL.revokeObjectURL(o), r(a);
    };
    i.onended = () => s(!0), i.onerror = () => s(!1), i.play().catch(() => s(!1));
  }) : !1;
}
async function il(e, t) {
  return await Dt(e, t).catch(() => null) !== null;
}
function dr(e, {
  gameId: t,
  voiceKey: n,
  label: r = "הקלטת קול",
  onSaved: o,
  onDeleted: i
}) {
  if (!du()) {
    const w = document.createElement("span");
    return w.className = "ab-voice-unsupported", w.textContent = "🎤 הקלטה לא נתמכת בדפדפן זה", e.appendChild(w), { refresh: async () => {
    }, destroy: () => w.remove() };
  }
  const s = fu(), a = document.createElement("div");
  a.className = "ab-voice-btn-wrap", a.setAttribute("aria-label", r), e.appendChild(a);
  let c = "idle", u = null, l = null, d = null, m = null, p = null, g = null, _ = 0;
  function C() {
    if (a.innerHTML = "", c === "idle")
      u = k("🎤", "ab-voice-btn ab-voice-btn--record", "התחל הקלטה", N), a.appendChild(u);
    else if (c === "recording") {
      p = document.createElement("span"), p.className = "ab-voice-indicator", a.appendChild(p);
      const w = document.createElement("span");
      w.className = "ab-voice-timer", w.textContent = "0:00", a.appendChild(w), _ = 0, g = setInterval(() => {
        _++;
        const A = Math.floor(_ / 60), I = String(_ % 60).padStart(2, "0");
        w.textContent = `${A}:${I}`, _ >= 120 && b();
      }, 1e3), l = k("⏹", "ab-voice-btn ab-voice-btn--stop", "עצור הקלטה", b), a.appendChild(l);
    } else c === "has-voice" && (d = k("▶", "ab-voice-btn ab-voice-btn--play", "נגן הקלטה", E), a.appendChild(d), u = k("🎤", "ab-voice-btn ab-voice-btn--re-record", "הקלט מחדש", N), a.appendChild(u), m = k("🗑", "ab-voice-btn ab-voice-btn--delete", "מחק הקלטה", y), a.appendChild(m));
  }
  function k(w, A, I, H) {
    const V = document.createElement("button");
    return V.className = A, V.type = "button", V.title = I, V.setAttribute("aria-label", I), V.textContent = w, V.addEventListener("click", H), V;
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
      await ur(t, n, w), c = "has-voice", C(), o == null || o(w);
    } catch (w) {
      console.warn("[voice-record-button] stop error:", w), c = "idle", C();
    }
  }
  async function E() {
    d == null || d.setAttribute("disabled", "true"), await ve(t, n), d == null || d.removeAttribute("disabled");
  }
  async function y() {
    confirm("למחוק את ההקלטה?") && (await mu(t, n), c = "idle", C(), i == null || i());
  }
  function x(w) {
    const A = document.createElement("span");
    A.className = "ab-voice-error", A.textContent = w, a.appendChild(A), setTimeout(() => A.remove(), 3e3);
  }
  async function z() {
    if (s.isActive()) return;
    c = await Dt(t, n).catch(() => null) ? "has-voice" : "idle", C();
  }
  function $() {
    clearInterval(g), s.isActive() && s.cancel(), a.remove();
  }
  return z(), { refresh: z, destroy: $ };
}
const bu = [
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
function gu(e) {
  return e.trim().replace(/\s+/g, "-").replace(/[^a-z0-9\u05D0-\u05EA_-]/gi, "").toLowerCase() || `custom-${Date.now()}`;
}
function _u(e) {
  return Nt(`alefbet.audio-manager.${e}.custom`, []);
}
function yu(e, t = null) {
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
  const r = n.querySelector("#ab-am-body"), o = n.querySelector(".ab-am-close"), i = n.querySelector(".ab-am-backdrop"), s = [], a = [...bu];
  t && t.rounds.length > 0 && a.splice(1, 0, {
    // insert after Instructions
    id: "rounds",
    label: "🔤 שאלות / סיבובים",
    slots: t.rounds.map((l, d) => ({
      key: l.id,
      label: `סיבוב ${d + 1}${l.target ? " — " + l.target : ""}${l.correct ? " (" + l.correct + ")" : ""}`
    }))
  }), a.forEach((l) => {
    r.appendChild(vu(l, e, s));
  }), r.appendChild(wu(e, s));
  function c() {
    s.forEach((l) => l.destroy()), n.remove();
  }
  o.addEventListener("click", c), i.addEventListener("click", c), document.addEventListener("keydown", function l(d) {
    d.key === "Escape" && (c(), document.removeEventListener("keydown", l));
  });
}
function vu(e, t, n) {
  const r = document.createElement("section");
  r.className = "ab-am-section";
  const o = document.createElement("button");
  o.className = "ab-am-section__heading", o.setAttribute("aria-expanded", "true"), o.innerHTML = `<span>${e.label}</span><span class="ab-am-chevron">▾</span>`, r.appendChild(o);
  const i = document.createElement("div");
  return i.className = "ab-am-grid", r.appendChild(i), e.slots.forEach((s) => {
    i.appendChild(fr(t, s.key, s.label, n));
  }), o.addEventListener("click", () => {
    const s = o.getAttribute("aria-expanded") === "true";
    o.setAttribute("aria-expanded", String(!s)), i.hidden = s, o.querySelector(".ab-am-chevron").textContent = s ? "▸" : "▾";
  }), r;
}
function wu(e, t) {
  const n = _u(e), r = document.createElement("section");
  r.className = "ab-am-section";
  const o = document.createElement("button");
  o.className = "ab-am-section__heading", o.setAttribute("aria-expanded", "true"), o.innerHTML = '<span>➕ מותאם אישית</span><span class="ab-am-chevron">▾</span>', r.appendChild(o);
  const i = document.createElement("div");
  i.className = "ab-am-grid", r.appendChild(i);
  function s() {
    i.querySelectorAll(".ab-am-row").forEach((d) => {
      const m = d._voiceBtn;
      m && (t.splice(t.indexOf(m), 1), m.destroy());
    }), i.innerHTML = "", n.get().forEach((d) => {
      const m = fr(e, d.key, d.label, t, () => {
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
  `, r.appendChild(a);
  const c = a.querySelector(".ab-am-add-input"), u = a.querySelector(".ab-am-add-btn");
  function l() {
    const d = c.value.trim();
    if (!d) return;
    const m = gu(d);
    if (n.get().some((p) => p.key === m)) {
      c.select();
      return;
    }
    n.update((p) => [...p, { key: m, label: d }]), c.value = "", s();
  }
  return u.addEventListener("click", l), c.addEventListener("keydown", (d) => {
    d.key === "Enter" && l();
  }), o.addEventListener("click", () => {
    const d = o.getAttribute("aria-expanded") === "true";
    o.setAttribute("aria-expanded", String(!d)), i.hidden = d, a.hidden = d, o.querySelector(".ab-am-chevron").textContent = d ? "▸" : "▾";
  }), r;
}
function fr(e, t, n, r, o = null) {
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
  const l = dr(u, { gameId: e, voiceKey: t, label: n });
  return r.push(l), i._voiceBtn = l, i.appendChild(c), i.appendChild(u), i;
}
let ku = 0;
function yn() {
  return `zone-${Date.now()}-${ku++}`;
}
function Eu(e) {
  const t = e.map((i) => i.x), n = e.map((i) => i.y), r = Math.min(...t), o = Math.min(...n);
  return { x: r, y: o, width: Math.max(...t) - r, height: Math.max(...n) - o };
}
function zu(e, t, n, r, o) {
  return e.map((i) => {
    const s = r > 0 ? (i.x - t) / r * 100 : 0, a = o > 0 ? (i.y - n) / o * 100 : 0;
    return `${s},${a}`;
  }).join(" ");
}
function Su(e, t, { onChange: n, gameId: r }) {
  let o = structuredClone(t), i = null, s = "rect", a = [], c = null, u = [], l = null, d = null, m = null;
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
    a.forEach((h) => h.destroy()), a = [], p.querySelectorAll(".ab-ze-zone").forEach((h) => h.remove()), p.querySelectorAll(".ab-ze-panel").forEach((h) => h.remove()), o.forEach((h) => {
      const v = document.createElement("div");
      if (v.className = "ab-ze-zone", h.correct && v.classList.add("ab-ze-zone--correct"), h.id === i && v.classList.add("ab-ze-zone--selected"), v.dataset.zoneId = h.id, v.style.left = `${h.x}%`, v.style.top = `${h.y}%`, v.style.width = `${h.width}%`, v.style.height = `${h.height}%`, h.shape === "polygon" && h.points && h.points.length >= 3) {
        const R = `clip-${h.id}`;
        v.innerHTML = `<svg class="ab-ze-zone__poly-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs><clipPath id="${R}"><polygon points="${zu(h.points, h.x, h.y, h.width, h.height)}"/></clipPath></defs>
          <rect x="0" y="0" width="100" height="100" clip-path="url(#${R})" fill="currentColor"/>
        </svg>`, v.classList.add("ab-ze-zone--poly");
      }
      const T = document.createElement("div");
      T.className = "ab-ze-zone__badge", T.textContent = h.correct ? "✓" : "", h.label && (T.textContent = h.label), v.appendChild(T);
      const D = document.createElement("button");
      D.className = "ab-ze-zone__toggle", D.textContent = h.correct ? "✓ נכון" : "✗ לא נכון", D.title = "סמן כתשובה נכונה / לא נכונה", D.addEventListener("pointerdown", (R) => R.stopPropagation()), D.addEventListener("click", (R) => {
        R.stopPropagation(), h.correct = !h.correct, H(), b();
      }), v.appendChild(D);
      const Z = document.createElement("button");
      if (Z.className = "ab-ze-zone__delete", Z.textContent = "✕", Z.title = "מחק אזור", Z.addEventListener("pointerdown", (R) => R.stopPropagation()), Z.addEventListener("click", (R) => {
        R.stopPropagation(), o = o.filter((F) => F.id !== h.id), i === h.id && (i = null), H(), b();
      }), v.appendChild(Z), h.shape !== "polygon" && h.id === i)
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
        if (B.className = "ab-ze-panel__input", B.type = "text", B.dir = "rtl", B.placeholder = "תווית (למשל: חתול)", B.value = h.label || "", B.addEventListener("pointerdown", (X) => X.stopPropagation()), B.addEventListener("input", () => {
          h.label = B.value || void 0, H();
        }), F.appendChild(B), R.appendChild(F), r) {
          const X = document.createElement("div");
          X.className = "ab-ze-panel__row";
          const ct = document.createElement("span");
          ct.className = "ab-ze-panel__audio-label", ct.textContent = "🎤", X.appendChild(ct);
          const Sr = dr(X, {
            gameId: r,
            voiceKey: `zone-${h.id}`,
            label: `הקלטה לאזור ${h.label || h.id}`
          });
          a.push(Sr), R.appendChild(X);
        }
        R.addEventListener("pointerdown", (X) => X.stopPropagation()), p.appendChild(R);
      }
    });
  }
  function E() {
    if (_.innerHTML = "", u.length === 0) return;
    const h = [...u];
    l && h.push(l);
    const v = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    v.setAttribute("points", h.map((T) => `${T.x},${T.y}`).join(" ")), v.setAttribute("fill", "rgba(251,191,36,0.15)"), v.setAttribute("stroke", "#fbbf24"), v.setAttribute("stroke-width", "0.4"), v.setAttribute("stroke-dasharray", "1,0.5"), _.appendChild(v), u.forEach((T, D) => {
      const Z = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      Z.setAttribute("cx", String(T.x)), Z.setAttribute("cy", String(T.y)), Z.setAttribute("r", "0.8"), Z.setAttribute("fill", D === 0 ? "#22c55e" : "#fbbf24"), Z.setAttribute("stroke", "#fff"), Z.setAttribute("stroke-width", "0.3"), _.appendChild(Z);
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
    const h = [...u], v = Eu(h);
    if (v.width > 1 && v.height > 1) {
      const T = {
        id: yn(),
        shape: "polygon",
        ...v,
        points: h,
        correct: !1
      };
      o.push(T), i = T.id, H();
    }
    u = [], l = null, E(), b();
  }
  function $(h) {
    if (h.button !== 0 || h.target.closest(".ab-ze-zone") || h.target.closest(".ab-ze-toolbar") || h.target.closest(".ab-ze-panel")) return;
    if (i = null, s === "polygon") {
      const { px: D, py: Z } = N(h.clientX, h.clientY);
      if (u.length >= 3) {
        const R = u[0];
        if (Math.abs(D - R.x) < 2 && Math.abs(Z - R.y) < 2) {
          z();
          return;
        }
      }
      u.push({ x: D, y: Z }), E(), b();
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
      const v = o.find((B) => B.id === m.zoneId);
      if (!v) return;
      const T = m.origZone, D = p.getBoundingClientRect(), Z = (h.clientX - m.startX) / D.width * 100, R = (h.clientY - m.startY) / D.height * 100, F = m.handle;
      F.includes("e") && (v.width = Math.max(3, T.width + Z)), F.includes("w") && (v.x = T.x + Z, v.width = Math.max(3, T.width - Z)), F.includes("s") && (v.height = Math.max(3, T.height + R)), F.includes("n") && (v.y = T.y + R, v.height = Math.max(3, T.height - R)), b();
      return;
    }
    if (d) {
      h.preventDefault();
      const v = o.find((F) => F.id === d.zoneId);
      if (!v) return;
      const { px: T, py: D } = N(h.clientX, h.clientY), Z = Math.max(0, Math.min(100 - v.width, T - d.offsetX)), R = Math.max(0, Math.min(100 - v.height, D - d.offsetY));
      if (v.shape === "polygon" && v.points) {
        const F = Z - v.x, B = R - v.y;
        v.points = v.points.map((X) => ({ x: X.x + F, y: X.y + B }));
      }
      v.x = Z, v.y = R, b();
    }
  }
  function I() {
    if (c) {
      const h = Math.min(c.startX, c.curX), v = Math.min(c.startY, c.curY), T = Math.abs(c.curX - c.startX), D = Math.abs(c.curY - c.startY);
      if (T > 3 && D > 3) {
        const Z = {
          id: yn(),
          shape: "rect",
          x: h,
          y: v,
          width: T,
          height: D,
          correct: !1
        };
        o.push(Z), i = Z.id, H();
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
    n(structuredClone(o));
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
    i && ((h.key === "Delete" || h.key === "Backspace") && (o = o.filter((v) => v.id !== i), i = null, H(), b()), h.key === "Escape" && (i = null, b()));
  }
  return p.addEventListener("pointerdown", $), p.addEventListener("dblclick", w), document.addEventListener("pointermove", A), document.addEventListener("pointerup", I), document.addEventListener("keydown", V), b(), {
    setZones(h) {
      o = structuredClone(h), i = null, b();
    },
    getZones() {
      return structuredClone(o);
    },
    setTool(h) {
      y(h);
    },
    destroy() {
      p.removeEventListener("pointerdown", $), p.removeEventListener("dblclick", w), document.removeEventListener("pointermove", A), document.removeEventListener("pointerup", I), document.removeEventListener("keydown", V), a.forEach((h) => h.destroy()), p.remove();
    }
  };
}
let $u = 0;
function Nu() {
  return `tpl-zone-${Date.now()}-${$u++}`;
}
const Cu = [
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
function xu(e) {
  return e.zones.map((t) => ({ ...t, id: Nu() }));
}
function Tu(e) {
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
  s.className = "ab-tpl-grid", Cu.forEach((u) => {
    const l = document.createElement("button");
    l.className = "ab-tpl-card", l.addEventListener("click", () => {
      e(xu(u)), a();
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
  }), r.appendChild(s), t.appendChild(r), document.body.appendChild(t);
  function a() {
    t.remove();
  }
  n.addEventListener("click", a), document.addEventListener("keydown", function u(l) {
    l.key === "Escape" && (a(), document.removeEventListener("keydown", u));
  });
}
class Au {
  constructor(t, n, r = {}) {
    this._mode = "play", this._overlay = null, this._navigator = null, this._inspector = null, this._toolbar = null, this._selectedId = null, this._undoBtn = null, this._redoBtn = null, this._shortcutHandler = null, this._zoneEditor = null, this._zoneModal = null, this._container = t, this._gameData = n, this._restartGame = r.restartGame, this._roundSchema = r.roundSchema, requestAnimationFrame(() => this._injectToolbar());
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
    this._toolbar && (this._toolbar.innerHTML = "", this._undoBtn = this._makeBtn("↩", "ab-editor-btn--undo", () => this._undo()), this._undoBtn.title = "בטל (Ctrl+Z)", this._redoBtn = this._makeBtn("↪", "ab-editor-btn--redo", () => this._redo()), this._redoBtn.title = "בצע שנית (Ctrl+Y)", this._toolbar.append(
      this._makeBtn("▶ שחק", "ab-editor-btn--play", () => this.enterPlayMode()),
      this._makeBtn("+ הוסף", "ab-editor-btn--add", () => this._addRound()),
      this._undoBtn,
      this._redoBtn,
      this._makeBtn("🔲 אזורים", "ab-editor-btn--zones", () => this._openZoneEditor()),
      this._makeBtn("💾 שמור", "ab-editor-btn--save", () => this._save()),
      this._makeBtn("🎤 קול", "ab-editor-btn--audio", () => this._openAudioManager()),
      this._makeBtn("⬇ ייצוא", "ab-editor-btn--export", () => ho(this._gameData))
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
    this._overlay = po(t), this._overlay.show(), this._navigator = ko(this._container, this._gameData, {
      onSelectRound: (r) => this._selectRound(r),
      onAddRound: (r) => this._addRound(r),
      onDuplicateRound: (r) => this._duplicateRound(r),
      onMoveRound: (r, o) => this._moveRound(r, o)
    }), this._inspector = uu(this._container, {
      onFieldChange: (r, o, i) => this._onFieldChange(r, o, i),
      onDeleteRound: (r) => this._deleteRound(r),
      roundSchema: this._roundSchema
    });
    const n = this._gameData.rounds;
    n.length > 0 && this._selectRound(n[0].id);
  }
  enterPlayMode() {
    var t, n, r, o;
    this._mode !== "play" && (this._mode = "play", this._container.classList.remove("ab-editor-active"), this._setToolbarPlayMode(), this._detachShortcuts(), this._closeZoneEditor(), (t = this._overlay) == null || t.destroy(), (n = this._navigator) == null || n.destroy(), (r = this._inspector) == null || r.destroy(), this._overlay = this._navigator = this._inspector = null, this._selectedId = null, (o = this._restartGame) == null || o.call(this, this._container));
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
      Tu((p) => {
        var g;
        this._selectedId && (this._gameData.updateRound(this._selectedId, { zones: p }), this._refreshUndoButtons(), (g = this._zoneEditor) == null || g.setZones(p));
      });
    }), u.appendChild(l);
    const d = document.createElement("button");
    d.className = "ab-editor-btn ab-editor-btn--play", d.textContent = "✓ סיום", d.addEventListener("click", () => this._closeZoneEditor()), u.appendChild(d), o.appendChild(u), n.appendChild(o), document.body.appendChild(n), this._zoneModal = n, c.onload = () => {
      const p = t.zones ?? [];
      this._zoneEditor = Su(a, p, {
        gameId: this._gameData.id,
        onChange: (g) => {
          this._selectedId && (this._gameData.updateRound(this._selectedId, { zones: g }), this._refreshUndoButtons());
        }
      });
    }, c.complete && c.naturalWidth > 0 && ((m = c.onload) == null || m.call(c, new Event("load"))), r.addEventListener("click", () => this._closeZoneEditor());
  }
  _closeZoneEditor() {
    var t, n;
    (t = this._zoneEditor) == null || t.destroy(), this._zoneEditor = null, (n = this._zoneModal) == null || n.remove(), this._zoneModal = null;
  }
  // ── Helpers ───────────────────────────────────────────────────────────────
  _openAudioManager() {
    yu(this._gameData.id, this._gameData);
  }
  _save() {
    lo(this._gameData), this._showToast("✅ נשמר!");
  }
  _showToast(t) {
    const n = document.createElement("div");
    n.className = "ab-editor-toast", n.textContent = t, document.body.appendChild(n), setTimeout(() => n.remove(), 2200);
  }
}
async function sl(e, t) {
  if (so(), ao(e, t.loadingMessage ?? "טוֹעֵן..."), await Ur(t.preloadTexts ?? []), t.onBeforeHide && await t.onBeforeHide() === !1)
    return { shell: null, activeRounds: [], gameData: null, aborted: !0 };
  co(e);
  const n = fo(t.gameId), r = n ? n.rounds : t.defaultRounds ?? [], o = new Cr(e, {
    totalRounds: t.totalRounds ?? r.length,
    title: t.title,
    gameId: t.gameId
  });
  let i = null;
  if (t.editor) {
    const s = {
      title: t.editor.title ?? t.title,
      type: t.editor.type ?? "multiple-choice"
    };
    i = Le.fromRoundsArray(t.gameId, r, s, t.editor.distractors ?? []), new Au(e, i, { restartGame: t.editor.restartGame });
  }
  return { shell: o, activeRounds: r, gameData: i, aborted: !1 };
}
function al({ hintAfter: e = 2, escalateAfter: t = 4, onHint: n, onEscalate: r } = {}) {
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
const hr = {
  a: { F1: 850, F2: 1400 },
  e: { F1: 550, F2: 2100 },
  i: { F1: 350, F2: 2700 },
  o: { F1: 550, F2: 1e3 },
  u: { F1: 350, F2: 850 }
}, Ft = {
  kamatz: "a",
  patah: "a",
  tzere: "e",
  segol: "e",
  hiriq: "i",
  holam: "o",
  kubbutz: "u"
};
function Ru(e, t) {
  if (!Number.isFinite(e) || !Number.isFinite(t) || e <= 0 || t <= 0 || t <= e)
    return { vowel: "", confidence: 0 };
  const n = Math.log2(e), r = Math.log2(t), o = [];
  for (const [c, u] of Object.entries(hr)) {
    const l = n - Math.log2(u.F1), d = r - Math.log2(u.F2);
    o.push({ vowel: c, dist: Math.sqrt(l * l + d * d) });
  }
  o.sort((c, u) => c.dist - u.dist);
  const i = o[0], s = o[1], a = s.dist === 0 ? 1 : Math.max(0, Math.min(1, 1 - i.dist / s.dist));
  return { vowel: i.vowel, confidence: a };
}
function cl(e, t) {
  return !e || !t ? !1 : Ft[t] === e;
}
function Lu(e, t) {
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
function Iu(e, t) {
  if (!e || e.length === 0 || !Number.isFinite(t) || t <= 0)
    return { F1: 0, F2: 0 };
  const n = Lu(e, 80), r = Math.min(n.length - 3, Math.floor(3500 / t)), o = [];
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
function ul() {
  var u;
  const e = typeof window < "u", t = e && !!((u = navigator == null ? void 0 : navigator.mediaDevices) != null && u.getUserMedia), n = e ? window.AudioContext || window.webkitAudioContext : null, r = t && !!n;
  let o = null, i = null, s = !1;
  const a = () => ({ vowel: "", confidence: 0, F1: 0, F2: 0 }), c = () => {
    if (o)
      for (const l of o.getTracks())
        try {
          l.stop();
        } catch {
        }
    if (i)
      try {
        i.close();
      } catch {
      }
    o = null, i = null;
  };
  return {
    available: r,
    async listen(l = 3e3) {
      if (!r) return a();
      s = !1;
      let d;
      try {
        d = await navigator.mediaDevices.getUserMedia({ audio: !0 });
      } catch {
        return a();
      }
      o = d;
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
          const $ = b.map((h) => h.F1).sort((h, v) => h - v), w = b.map((h) => h.F2).sort((h, v) => h - v), A = Math.floor(b.length / 2), I = $[A], H = w[A], V = Ru(I, H);
          y({ ...V, F1: I, F2: H });
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
            const { F1: A, F2: I } = Iu(C, _);
            A > 0 && I > 0 && I > A && b.push({ F1: A, F2: I });
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
const pr = 210, mr = 550, Zu = {
  a: { F3: 2700, bandwidths: [90, 110, 170], gains: [1, 0.5, 0.15] },
  e: { F3: 2900, bandwidths: [80, 100, 160], gains: [1, 0.55, 0.2] },
  i: { F3: 3300, bandwidths: [60, 100, 160], gains: [1, 0.6, 0.25] },
  o: { F3: 2600, bandwidths: [80, 90, 150], gains: [1, 0.5, 0.1] },
  u: { F3: 2400, bandwidths: [60, 80, 140], gains: [1, 0.45, 0.1] }
};
function Ke(e) {
  const t = hr[e], n = Zu[e];
  return !t || !n ? null : {
    formants: [t.F1, t.F2, n.F3],
    bandwidths: [...n.bandwidths],
    gains: [...n.gains]
  };
}
const vn = {
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
function Ou(e) {
  return vn[e] ?? vn[""];
}
function ll() {
  return et() !== null;
}
let De = null;
function Pu(e) {
  if (De && De.sampleRate === e.sampleRate) return De;
  const t = e.sampleRate, n = e.createBuffer(1, t, e.sampleRate), r = n.getChannelData(0);
  for (let o = 0; o < t; o++) r[o] = Math.random() * 2 - 1;
  return De = n, n;
}
function br(e, t, n) {
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
function gt(e, t, n, r) {
  const o = n.durationMs / 1e3, i = e.createBufferSource();
  i.buffer = Pu(e), i.loop = !0;
  const s = e.createBiquadFilter();
  s.type = "bandpass", s.frequency.value = n.noiseHz ?? 2e3, s.Q.value = n.noiseQ ?? 1;
  const a = e.createGain();
  return a.gain.setValueAtTime(0, t), a.gain.linearRampToValueAtTime(r, t + Math.min(0.01, o / 3)), a.gain.linearRampToValueAtTime(1e-4, t + o), i.connect(s), s.connect(a), a.connect(e.destination), i.start(t), i.stop(t + o + 0.02), t + o;
}
function gr(e, t, n, r, o, i) {
  const s = r / 1e3, { source: a, filters: c, master: u } = br(e, n, o);
  if (a.frequency.setValueAtTime(o * 1.04, t), a.frequency.linearRampToValueAtTime(o * 0.92, t + s), i) {
    const m = Math.min(0.09, s / 3);
    c.forEach((p, g) => {
      const _ = i[g];
      _ && (p.frequency.setValueAtTime(_, t), p.frequency.exponentialRampToValueAtTime(n.formants[g], t + m));
    });
  }
  const l = 0.04, d = 0.12;
  return u.gain.setValueAtTime(0, t), u.gain.linearRampToValueAtTime(0.5, t + l), u.gain.setValueAtTime(0.5, t + s - d), u.gain.linearRampToValueAtTime(1e-4, t + s), a.start(t), a.stop(t + s + 0.05), t + s;
}
function Mu(e, t, n, r) {
  const o = n / 1e3, i = { formants: [250, 1100, 2200], bandwidths: [80, 200, 300], gains: [1, 0.12, 0.05] }, { source: s, master: a } = br(e, i, r);
  return a.gain.setValueAtTime(0, t), a.gain.linearRampToValueAtTime(0.35, t + 0.02), a.gain.setValueAtTime(0.35, t + o - 0.02), a.gain.linearRampToValueAtTime(1e-4, t + o), s.start(t), s.stop(t + o + 0.05), t + o;
}
function _r(e, t) {
  const n = Math.max(0, (t - e.currentTime) * 1e3) + 60;
  return new Promise((r) => setTimeout(r, n));
}
async function ju(e, t = {}) {
  const n = Ke(e);
  if (!n) return !1;
  const r = await St();
  if (!r) return !1;
  let o;
  try {
    const i = r.currentTime + 0.03;
    o = gr(r, i, n, t.durationMs ?? mr, t.pitchHz ?? pr, null);
  } catch {
    return !1;
  }
  return await _r(r, o), !0;
}
async function yr(e, t, n = {}) {
  const r = Ke(t);
  if (!r) return !1;
  const o = await St();
  if (!o) return !1;
  const i = Ou(e), s = n.pitchHz ?? pr, a = n.durationMs ?? mr;
  let c;
  try {
    c = Du(o, i, e, r, a, s);
  } catch {
    return !1;
  }
  return await _r(o, c), !0;
}
function Du(e, t, n, r, o, i) {
  let s = e.currentTime + 0.03, a = null;
  switch (t.type) {
    case "plosive": {
      s = gt(e, s, t, t.voiced ? 0.25 : 0.35), s += 0.01;
      break;
    }
    case "fricative": {
      s = gt(e, s, t, 0.22) - 0.03;
      break;
    }
    case "affricate": {
      s += 0.03, s = gt(e, s, { ...t, durationMs: t.durationMs - 30 }, 0.3) - 0.02;
      break;
    }
    case "nasal": {
      s = Mu(e, s, t.durationMs, i), a = [300, 1300, 2300];
      break;
    }
    case "liquid": {
      a = n === "r" ? [450, 1300, 1600] : [380, 1e3, 2600];
      break;
    }
    case "glide": {
      const c = Ke(n === "y" ? "i" : "u");
      a = c ? c.formants : null;
      break;
    }
  }
  return gr(e, s, r, o, i, a);
}
const Qe = "sound-bank";
function vr(e) {
  return `letter:${e}`;
}
function wr(e) {
  return `nikud:${e}`;
}
function kr(e, t) {
  return `syllable:${e}:${t}`;
}
function Fu(e) {
  return `word:${e}`;
}
function Er() {
  const e = [];
  for (const t of we)
    e.push({ key: vr(t.letter), label: t.nameNikud, group: "letters" });
  for (const t of G)
    e.push({ key: wr(t.id), label: `${t.nameNikud} (${t.sound})`, group: "nikud" });
  for (const t of Vr)
    for (const n of G)
      e.push({
        key: kr(t, n.id),
        label: $n(t, n.symbol),
        group: "syllables"
      });
  return e;
}
function dl(e) {
  const t = Er().find((r) => r.key === e);
  if (t) return t.label;
  const [, ...n] = e.split(":");
  return n.join(":");
}
function Bu() {
  return typeof navigator < "u" && navigator.onLine === !1;
}
async function st(e) {
  try {
    return typeof indexedDB > "u" ? !1 : await ve(Qe, e);
  } catch {
    return !1;
  }
}
async function at(e) {
  if (Bu() && !Uu()) return !1;
  try {
    return await e(), he.audioState !== "failed" && he.audioState !== "unsupported";
  } catch {
    return !1;
  }
}
function Uu() {
  return typeof speechSynthesis < "u";
}
async function fl() {
  try {
    return typeof indexedDB > "u" ? [] : await lr(Qe);
  } catch {
    return [];
  }
}
async function hl(e) {
  if (await st(vr(e))) return "bank";
  const t = $t(e), n = t ? t.nameNikud : e;
  return await at(() => he.speak(n)) ? "tts" : t && await yr(t.sound, "a", { durationMs: 400 }) ? "synth" : "none";
}
async function pl(e) {
  if (await st(wr(e))) return "bank";
  if (await at(() => he.speakVowel(e))) return "tts";
  const t = Ft[e];
  return t && await ju(t) ? "synth" : "none";
}
async function ml(e, t) {
  if (await st(kr(e, t))) return "bank";
  const n = G.find((i) => i.id === t);
  if (n && await at(() => he.speakNikud(e, n.symbol))) return "tts";
  const r = $t(e), o = Ft[t];
  return o && await yr(r ? r.sound : "", o) ? "synth" : "none";
}
async function bl(e) {
  return await st(Fu(e)) ? "bank" : await at(() => he.speak(e)) ? "tts" : "none";
}
const wn = "alefbet.ttsProxyUrl";
function Hu() {
  var i, s;
  if (typeof window > "u") return null;
  const e = new URLSearchParams(window.location.search).get("ttsProxy");
  if (e && window.localStorage)
    try {
      window.localStorage.setItem(wn, e);
    } catch {
    }
  const t = (
    /** @type {any} */
    window.ALEFBET_TTS_PROXY_URL
  ), n = (i = window.localStorage) == null ? void 0 : i.getItem(wn), r = (s = window.localStorage) == null ? void 0 : s.getItem("alefbet.nakdanProxyUrl"), o = e || t || n || r;
  return o ? String(o).replace(/\/+$/, "") : null;
}
function Vu(e) {
  const [t, n, r] = e.split(":");
  if (t === "letter") {
    const o = $t(n);
    return o ? o.nameNikud : null;
  }
  if (t === "nikud") {
    const o = G.find((i) => i.id === n);
    return o ? o.sound : null;
  }
  if (t === "syllable") {
    const o = G.find((i) => i.id === r);
    return o ? $n(n, o.symbol) : null;
  }
  return t === "word" && e.slice(5) || null;
}
async function qu(e, t) {
  const n = await fetch(`${e}/tts?text=${encodeURIComponent(t)}&lang=he`);
  if (!n.ok) throw new Error(`tts-proxy ${n.status}`);
  const r = await n.blob();
  if (!r || r.size === 0) throw new Error("empty-audio");
  return r;
}
async function gl({ force: e = !1, extraTexts: t = [], onProgress: n } = {}) {
  const r = Hu();
  if (!r)
    throw new Error("tts-proxy-not-configured: הגדירו כתובת דרך ?ttsProxy=... או window.ALEFBET_TTS_PROXY_URL");
  if (typeof indexedDB > "u")
    throw new Error("indexeddb-unavailable: אין אחסון מקומי לשמירת הצלילים");
  const o = [
    ...Er().map((c) => c.key),
    ...t.filter((c) => c == null ? void 0 : c.trim()).map((c) => `word:${c}`)
  ], i = new Set(e ? [] : await lr(Qe).catch(() => [])), s = { total: o.length, compiled: 0, skipped: 0, failures: [] };
  let a = 0;
  for (const c of o) {
    if (a++, i.has(c)) {
      s.skipped++, n == null || n(a, o.length, c);
      continue;
    }
    const u = Vu(c);
    if (!u) {
      s.failures.push({ key: c, reason: "unknown-key" }), n == null || n(a, o.length, c);
      continue;
    }
    try {
      const l = await qu(r, u);
      await ur(Qe, c, l), s.compiled++;
    } catch (l) {
      s.failures.push({ key: c, reason: (l == null ? void 0 : l.message) || "fetch-failed" });
    }
    n == null || n(a, o.length, c);
  }
  return s;
}
const kn = [
  "כָּל הַכָּבוֹד",
  "מְצֻיָּן",
  "יֹפִי",
  "נֶהְדָּר",
  "וָאוּ",
  "אֵיזֶה כֵּיף"
], En = [
  "נַסּוּ שׁוּב, אַתֶּם יְכוֹלִים",
  "כִּמְעַט! הַקְשִׁיבוּ שׁוּב",
  "עוֹד נִסָּיוֹן קָטָן",
  "קְרוֹבִים מְאֹד"
];
function Ju() {
  return kn[Math.floor(Math.random() * kn.length)];
}
function _l() {
  return En[Math.floor(Math.random() * En.length)];
}
function yl(e, t, n) {
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
function vl(e, t) {
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
function wl(e) {
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
      Ue.correct(), r(o ?? `!${Ju()}`, "correct"), Be(t, "bounce");
    },
    /** הצג עידוד — נסה שוב */
    wrong(o = "נַסֵּה שׁוּב") {
      Ue.wrong(), r(o, "wrong"), Be(t, "pulse");
    },
    /** הצג רמז */
    hint(o) {
      r(o, "hint"), Be(t, "pulse");
    },
    /** הסר את הרכיב */
    destroy() {
      clearTimeout(n), t.remove();
    }
  };
}
function kl(e, t) {
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
  G.forEach((u) => {
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
function El(e) {
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
function Wu(e, t, n, r, o) {
  return e.map((i) => {
    const s = r > 0 ? (i.x - t) / r * 100 : 0, a = o > 0 ? (i.y - n) / o * 100 : 0;
    return `${s},${a}`;
  }).join(" ");
}
function zl(e, t) {
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
    autoPlayInstruction: m = !0,
    hintAfter: p = 3
  } = t, g = o === "soundboard", _ = document.createElement("div");
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
      var I;
      (I = r[A]) != null && I.correct && !N.has(r[A].id) && w.classList.add("ab-zp-zone--hint");
    }), setTimeout(() => {
      $.forEach((w) => w.classList.remove("ab-zp-zone--hint")), y = !1, b = 0;
    }, 1500);
  }
  return r.forEach(($) => {
    const w = document.createElement("button");
    if (w.className = "ab-zp-zone", (d || g) && w.classList.add("ab-zp-zone--visible"), g && w.classList.add("ab-zp-zone--soundboard"), w.style.left = `${$.x}%`, w.style.top = `${$.y}%`, w.style.width = `${$.width}%`, w.style.height = `${$.height}%`, w.setAttribute("aria-label", $.label || ($.correct ? "correct zone" : "zone")), $.shape === "polygon" && $.points && $.points.length >= 3) {
      const A = `zp-clip-${$.id}`;
      w.innerHTML = `<svg class="ab-zp-zone__poly-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs><clipPath id="${A}"><polygon points="${Wu($.points, $.x, $.y, $.width, $.height)}"/></clipPath></defs>
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
          const A = r.filter((I) => I.correct).length;
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
        (A = r[w]) != null && A.correct && $.classList.add("ab-zp-zone--revealed");
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
function Sl(e, t, n, r) {
  const o = e.querySelector(".game-header__spacer");
  if (!o) return null;
  const i = document.createElement("button");
  return i.className = "ab-header-btn", i.setAttribute("aria-label", n), i.textContent = t, i.onclick = r, o.innerHTML = "", o.appendChild(i), i;
}
const Yu = "0 0 32 16", zr = {
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
function Xu(e) {
  const t = zr[e];
  return t ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${Yu}" aria-hidden="true" focusable="false">${t}</svg>` : null;
}
const $l = Object.freeze(Object.keys(zr));
function Nl(e, { size: t = "md" } = {}) {
  const n = document.createElement("div");
  n.className = `ab-nikud-box ab-nikud-box--${t} ab-nikud-box--${e.id}`;
  const r = document.createElement("div");
  r.className = "ab-nikud-box__box";
  const o = document.createElement("div");
  return o.className = "ab-nikud-box__mark", o.innerHTML = Xu(e.id) ?? "", n.appendChild(r), n.appendChild(o), n;
}
function Cl(e, t) {
  const {
    title: n = "",
    subtitle: r = "",
    tabs: o = [],
    homeUrl: i = null,
    onTabChange: s = null
  } = t;
  e.classList.add("ab-app");
  const a = i ? `<a href="${i}" class="ab-app-back-link" aria-label="דף הבית">🏠</a>` : "", c = r ? `<span class="ab-app-subtitle">${r}</span>` : '<span class="ab-app-subtitle"></span>', u = o.map(
    (_) => `<button class="ab-app-tab" data-tab="${_.id}" aria-selected="false" role="tab"><span class="ab-app-tab-icon">${_.icon}</span><span class="ab-app-tab-label">${_.label}</span></button>`
  ).join(""), l = o.map(
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
  return o.length > 0 && g(o[0].id), {
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
const zn = "alefbet-audio-status-banner";
function Gu(e) {
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
function xl(e = typeof document < "u" ? document.body : null, t = {}) {
  const n = t.window || (typeof window < "u" ? window : null);
  if (!e || !n)
    return { destroy() {
    } };
  const r = e.querySelector("#" + zn);
  r && r.parentNode && r.parentNode.removeChild(r);
  const o = e.ownerDocument.createElement("div");
  o.id = zn, o.className = "alefbet-audio-banner", o.setAttribute("role", "status"), o.setAttribute("aria-live", "polite"), o.dir = "rtl", o.hidden = !0;
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
  function l(m) {
    const p = Gu(m);
    if (!p) {
      u();
      return;
    }
    c(), i.textContent = p.message, o.hidden = !1, o.classList.add("is-visible"), o.classList.toggle("is-await", p.kind === "await"), o.classList.toggle("is-unsupported", p.kind === "unsupported"), o.classList.toggle("is-failed", p.kind === "failed"), p.kind, p.kind === "await" ? (o.onclick = () => {
      try {
        e.ownerDocument.body.dispatchEvent(new MouseEvent("pointerdown", { bubbles: !0 }));
      } catch {
      }
      u();
    }, s.hidden = !0) : p.kind === "unsupported" ? (o.onclick = null, s.hidden = !1, s.onclick = (g) => {
      g.stopPropagation(), u();
    }) : p.kind === "failed" && (o.onclick = null, s.hidden = !0, a = setTimeout(() => u(), 6e3));
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
      n.removeEventListener("alefbet:tts-state", d), c(), o.parentNode && o.parentNode.removeChild(o);
    }
  };
}
export {
  Cu as ACTIVITY_TEMPLATES,
  _n as BUILTIN_ROUND_SCHEMAS,
  Mt as BaseRoundSchema,
  su as DragMatchRoundSchema,
  $r as EventBus,
  Le as GameData,
  ol as GameDataSchema,
  Au as GameEditor,
  au as GameMetaSchema,
  Cr as GameShell,
  Nr as GameState,
  iu as MultipleChoiceRoundSchema,
  $l as NIKUD_GLYPH_IDS,
  Ft as NIKUD_VOWEL,
  kn as PRAISE_PHRASES,
  ru as PointSchema,
  En as RETRY_HINTS,
  Qe as SOUND_BANK_ID,
  hr as VOWEL_TEMPLATES,
  ou as ZoneSchema,
  cu as ZoneTapRoundSchema,
  Fr as addNikud,
  Be as animate,
  sl as bootstrapGame,
  Ru as classifyFormants,
  rl as clearGameData,
  gl as compileSoundBank,
  Vu as compileTextForKey,
  Ou as consonantOnsetSpec,
  Cl as createAppShell,
  vo as createDragSource,
  wo as createDropTarget,
  wl as createFeedback,
  al as createHintTracker,
  Nt as createLocalState,
  Nl as createNikudBox,
  yl as createOptionCards,
  vl as createProgressBar,
  nl as createRoundManager,
  dr as createVoiceRecordButton,
  fu as createVoiceRecorder,
  ul as createVowelDetector,
  El as createZone,
  Su as createZoneEditor,
  zl as createZonePlayer,
  mu as deleteVoice,
  St as ensureAudioRunning,
  ho as exportGameDataAsJSON,
  Iu as extractFormantsFromSpectrum,
  xu as generateZonesFromTemplate,
  tl as getAllProgress,
  et as getAudioContext,
  el as getGameProgress,
  $t as getLetter,
  Hr as getLettersByGroup,
  Br as getNikud,
  il as hasVoice,
  we as hebrewLetters,
  co as hideLoadingScreen,
  Sl as injectHeaderButton,
  so as installGlobalErrorScreen,
  Bu as isOffline,
  ll as isSynthSupported,
  du as isVoiceRecordingSupported,
  Pr as isVowelized,
  dl as keyLabel,
  vr as letterKey,
  $n as letterWithNikud,
  lr as listVoiceKeys,
  fo as loadGameData,
  Dt as loadVoice,
  cl as matchNikudVowel,
  xl as mountAudioStatusBanner,
  Vr as nikudBaseLetters,
  Xu as nikudGlyphSvg,
  wr as nikudKey,
  G as nikudList,
  Rr as playBlob,
  ve as playVoice,
  Ur as preloadNikud,
  Ku as randomLetters,
  Qu as randomNikud,
  Ju as randomPraise,
  _l as randomRetryHint,
  ro as recordGameResult,
  fl as recordedKeys,
  Hu as resolveTtsProxyUrl,
  lo as saveGameData,
  ur as saveVoice,
  nu as schemaToFields,
  yu as showAudioManager,
  oo as showCompletionScreen,
  ao as showLoadingScreen,
  kl as showNikudSettingsDialog,
  Tu as showTemplatePicker,
  Ue as sounds,
  hl as speakLetter,
  pl as speakNikudSound,
  ml as speakSyllable,
  bl as speakWord,
  Er as standardSoundKeys,
  Cn as starsFor,
  kr as syllableKey,
  yr as synthesizeSyllable,
  ju as synthesizeVowel,
  he as tts,
  Tr as unlockAudioOutput,
  Ke as vowelFormantSpec,
  Fu as wordKey
};
