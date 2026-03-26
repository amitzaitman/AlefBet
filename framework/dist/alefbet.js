class vn {
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
class yn {
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
class ic {
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
    }, this.events = new vn(), this.state = new yn(this.config.totalRounds), this._buildShell();
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
let re = null;
function wn() {
  if (!re)
    try {
      re = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      return null;
    }
  return re.state === "suspended" && re.resume(), re;
}
function X(e, t, n = "sine", o = 0.3) {
  const r = wn();
  if (r)
    try {
      const i = r.createOscillator(), s = r.createGain();
      i.connect(s), s.connect(r.destination), i.type = n, i.frequency.setValueAtTime(e, r.currentTime), s.gain.setValueAtTime(o, r.currentTime), s.gain.exponentialRampToValueAtTime(1e-3, r.currentTime + t), i.start(r.currentTime), i.stop(r.currentTime + t + 0.05);
    } catch {
    }
}
const be = {
  /** צליל תשובה נכונה */
  correct() {
    X(523.25, 0.15), setTimeout(() => X(659.25, 0.2), 120), setTimeout(() => X(783.99, 0.3), 240);
  },
  /** צליל עידוד עדין — נסה שוב */
  wrong() {
    X(350, 0.15, "triangle", 0.12);
  },
  /** צליל עידוד - סיום מוצלח */
  cheer() {
    [523.25, 587.33, 659.25, 698.46, 783.99, 1046.5].forEach((t, n) => setTimeout(() => X(t, 0.2), n * 90));
  },
  /** קליק עדין */
  click() {
    X(900, 0.04, "sine", 0.12);
  }
}, st = "https://nakdan-u1-0.loadbalancer.dicta.org.il/api";
let at = !1;
const ae = /* @__PURE__ */ new Map();
function kn() {
  var r;
  if (typeof window > "u") return st;
  const e = new URLSearchParams(window.location.search).get("nakdanProxy"), t = window.ALEFBET_NAKDAN_PROXY_URL;
  if (e && window.localStorage)
    try {
      window.localStorage.setItem("alefbet.nakdanProxyUrl", e);
    } catch {
    }
  const n = (r = window.localStorage) == null ? void 0 : r.getItem("alefbet.nakdanProxyUrl"), o = e || t || n;
  return o || (window.location.hostname.endsWith("github.io") ? null : st);
}
function zn(e) {
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
async function En(e) {
  const t = kn();
  if (!t)
    throw at || (at = !0, console.warn("[nakdan] Dicta API blocked by CORS on GitHub Pages. Configure a proxy URL via ?nakdanProxy=..., window.ALEFBET_NAKDAN_PROXY_URL, or localStorage key alefbet.nakdanProxyUrl.")), new Error("Nakdan unavailable without proxy on this host");
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
  return zn(r);
}
async function $n(e) {
  if (!(e != null && e.trim())) return e ?? "";
  if (ae.has(e)) return ae.get(e);
  try {
    const t = await En(e);
    return ae.set(e, t), t;
  } catch {
    return ae.set(e, e), e;
  }
}
function Sn(e) {
  return ae.get(e) ?? e ?? "";
}
async function sc(e) {
  const t = [...new Set(e.filter((n) => n == null ? void 0 : n.trim()))];
  await Promise.all(t.map((n) => $n(n)));
}
let G = [], me = !1, Pt = !0, K = 0.9, ct = typeof localStorage < "u" && parseFloat(localStorage.getItem("alefbet.nikudRate")) || 0.5, Pe = !1, ie = null;
function ut(e, t, n, o = t) {
  console.warn(`[tts] ${e} TTS failed`, { text: t, sentText: o, reason: n }), typeof window < "u" && typeof window.dispatchEvent == "function" && window.dispatchEvent(new CustomEvent("alefbet:tts-error", {
    detail: { provider: e, text: t, sentText: o, reason: n }
  }));
}
function Nn(e) {
  return (e || "").replace(/[\u0591-\u05C7]/g, "");
}
function Cn(e) {
  const t = String(e || "").toLowerCase();
  return t.includes("didn't interact") || t.includes("notallowed");
}
function Zn() {
  var e;
  return typeof window > "u" || typeof document > "u" ? Promise.resolve() : Pe || (e = document.userActivation) != null && e.hasBeenActive ? (Pe = !0, Promise.resolve()) : ie || (ie = new Promise((t) => {
    const n = () => {
      Pe = !0, window.removeEventListener("pointerdown", n, !0), window.removeEventListener("keydown", n, !0), window.removeEventListener("touchstart", n, !0), t();
    };
    window.addEventListener("pointerdown", n, { once: !0, capture: !0 }), window.addEventListener("keydown", n, { once: !0, capture: !0 }), window.addEventListener("touchstart", n, { once: !0, capture: !0 });
  }).finally(() => {
    ie = null;
  }), ie);
}
function xn(e, t, n) {
  const r = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(e)}&tl=he&client=tw-ob`, i = new Audio(r);
  i.playbackRate = K, i.onended = t, i.onerror = () => n("audio.onerror"), i.play().catch((s) => {
    n((s == null ? void 0 : s.message) || "audio.play() rejected");
  });
}
function Tn(e) {
  return new Promise((t, n) => {
    const o = Nn(e).trim() || e;
    let r = !1, i = !1;
    const s = () => {
      r || (r = !0, t());
    }, a = (u) => {
      r || (r = !0, n(u));
    }, c = () => {
      try {
        xn(o, s, (u) => {
          if (!i && Cn(u)) {
            i = !0, Zn().then(() => {
              r || c();
            });
            return;
          }
          ut("google", e, u, o), a(u);
        });
      } catch (u) {
        ut("google", e, (u == null ? void 0 : u.message) || "Audio() construction failed", o), a(u == null ? void 0 : u.message);
      }
    };
    c();
  });
}
let De = null;
function Rn() {
  const e = speechSynthesis.getVoices();
  return e.find((t) => t.lang === "he-IL") || e.find((t) => t.lang === "iw-IL") || e.find((t) => t.lang.startsWith("he")) || null;
}
function lt() {
  De = Rn();
}
typeof speechSynthesis < "u" && (speechSynthesis.getVoices().length > 0 ? lt() : speechSynthesis.addEventListener("voiceschanged", lt, { once: !0 }));
function In(e) {
  return new Promise((t) => {
    if (typeof speechSynthesis > "u") {
      t();
      return;
    }
    const n = new SpeechSynthesisUtterance(e);
    n.lang = "he-IL", n.rate = K, De && (n.voice = De), n.onend = t, n.onerror = t, speechSynthesis.speak(n);
  });
}
async function On(e) {
  if (Pt)
    try {
      await Tn(e);
      return;
    } catch {
      console.info("[tts] Falling back to browser Speech API");
    }
  await In(e);
}
function Me() {
  if (me || G.length === 0) return;
  const e = G.shift();
  me = !0, On(e.text).then(() => {
    me = !1, e.resolve(), Me();
  });
}
const Pn = {
  /**
   * הקרא טקסט עברי
   * משתמש ב-Google Translate TTS לאיכות טובה יותר
   */
  speak(e) {
    const t = Sn(e);
    return new Promise((n) => {
      G.push({ text: t, resolve: n }), Me();
    });
  },
  /** עצור את הדיבור הנוכחי */
  cancel() {
    G.forEach((e) => e.resolve()), G = [], me = !1, typeof speechSynthesis < "u" && speechSynthesis.cancel();
  },
  get available() {
    return !0;
  },
  /** הגדר מהירות דיבור (0.5–2.0) */
  setRate(e) {
    K = Math.max(0.5, Math.min(2, e));
  },
  /** השתמש ב-Google Translate TTS (ברירת מחדל) או בדפדפן */
  useGoogle(e = !0) {
    Pt = e;
  },
  /**
   * הגדר מהירות דיבור להדגשת ניקוד
   * @param {{ rate?: number }} opts
   *   rate: מהירות דיבור להדגשה (ברירת מחדל 0.5)
   */
  setNikudEmphasis({ rate: e } = {}) {
    e != null && (ct = Math.max(0.3, Math.min(1.5, e)));
  },
  /**
   * הקרא אות עם ניקוד באיטיות להדגשת התנועה
   * @param {string} letter - האות (למשל 'ב')
   * @param {string} nikudSymbol - סמל הניקוד (למשל '\u05B7')
   */
  speakNikud(e, t) {
    const n = e + t, o = K;
    return K = ct, new Promise((r) => {
      G.push({ text: n, resolve: r }), Me();
    }).finally(() => {
      K = o;
    });
  }
}, dt = {
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
}, Ln = {
  shake: 420,
  bounce: 480,
  pulse: 600,
  fadeIn: 320,
  confetti: 700
};
function _e(e, t) {
  !e || !dt[t] || e.animate(dt[t], {
    duration: Ln[t] || 400,
    easing: "ease-in-out",
    fill: "none"
  });
}
function An(e, t, n, o) {
  be.cheer();
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
  }), e.innerHTML = "", e.appendChild(a), _e(a.querySelector(".completion-screen__content"), "fadeIn");
}
function ac(e, t, {
  totalRounds: n,
  progressBar: o = null,
  buildRoundUI: r,
  onCorrect: i,
  onWrong: s
} = {}) {
  let a = !1;
  async function c(p) {
    if (a) return;
    a = !0, be.correct(), p && await p(), i && await i(), e.state.addScore(1), o == null || o.update(e.state.currentRound), await new Promise((k) => setTimeout(k, 1200)), e.state.nextRound() ? (a = !1, r()) : An(t, e.state.score, n, () => {
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
function Lt(e, t) {
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
const jn = {
  kamatz: "ah",
  patah: "ah",
  tzere: "eh",
  segol: "eh",
  hiriq: "ee",
  holam: "oh",
  kubbutz: "oo"
}, Dn = {
  ah: [/[אה]/, /^א$/, /אא/, /הא/],
  eh: [/[אה]/, /^א$/, /אא/, /הא/, /אה/],
  ee: [/[אי]/, /^י$/, /אי/, /הי/],
  oh: [/[או]/, /^[או]$/, /או/, /הו/],
  oo: [/[או]/, /^[או]$/, /או/, /הו/, /אוּ/]
};
function cc() {
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
function uc(e, t) {
  if (!e || !t) return !1;
  const n = jn[t];
  if (!n) return !1;
  const o = Dn[n];
  if (!o) return !1;
  const r = e.replace(/[\s.,!?]/g, "");
  return r.length ? o.some((i) => i.test(r)) : !1;
}
function Mn() {
  return ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/ogg"].find((t) => MediaRecorder.isTypeSupported(t)) || "";
}
function Fn() {
  var e;
  return typeof navigator < "u" && typeof ((e = navigator.mediaDevices) == null ? void 0 : e.getUserMedia) == "function" && typeof MediaRecorder < "u";
}
function Un() {
  let e = null, t = null, n = [];
  async function o() {
    if (e && e.state === "recording") return;
    t = await navigator.mediaDevices.getUserMedia({ audio: !0, video: !1 }), n = [];
    const c = {}, u = Mn();
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
const Bn = "alefbet-voices", B = "recordings", Jn = 1;
let se = null;
function Ze() {
  return se || (se = new Promise((e, t) => {
    const n = indexedDB.open(Bn, Jn);
    n.onupgradeneeded = (o) => {
      o.target.result.createObjectStore(B);
    }, n.onsuccess = (o) => e(o.target.result), n.onerror = (o) => {
      se = null, t(o.target.error);
    };
  }), se);
}
function Ve(e, t) {
  return `${e}/${t}`;
}
async function Hn(e, t, n) {
  const o = await Ze();
  return new Promise((r, i) => {
    const s = o.transaction(B, "readwrite");
    s.objectStore(B).put(n, Ve(e, t)), s.oncomplete = r, s.onerror = (a) => i(a.target.error);
  });
}
async function We(e, t) {
  const n = await Ze();
  return new Promise((o, r) => {
    const s = n.transaction(B, "readonly").objectStore(B).get(Ve(e, t));
    s.onsuccess = () => o(s.result ?? null), s.onerror = (a) => r(a.target.error);
  });
}
async function Vn(e, t) {
  const n = await Ze();
  return new Promise((o, r) => {
    const i = n.transaction(B, "readwrite");
    i.objectStore(B).delete(Ve(e, t)), i.oncomplete = o, i.onerror = (s) => r(s.target.error);
  });
}
async function lc(e) {
  const t = await Ze();
  return new Promise((n, o) => {
    const i = t.transaction(B, "readonly").objectStore(B).getAllKeys();
    i.onsuccess = () => {
      const s = `${e}/`;
      n(
        (i.result || []).filter((a) => a.startsWith(s)).map((a) => a.slice(s.length))
      );
    }, i.onerror = (s) => o(s.target.error);
  });
}
async function Wn(e, t) {
  let n;
  try {
    n = await We(e, t);
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
async function dc(e, t) {
  return await We(e, t).catch(() => null) !== null;
}
const ge = [
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
function fc(e) {
  return ge.find((t) => t.letter === e) || null;
}
function qn(e = "regular") {
  return e === "regular" ? ge.filter((t) => !t.isFinal) : e === "final" ? ge.filter((t) => t.isFinal) : ge;
}
function hc(e, t = "regular") {
  const n = qn(t);
  return [...n].sort(() => Math.random() - 0.5).slice(0, Math.min(e, n.length));
}
const ve = [
  { id: "kamatz", name: "קָמָץ", nameNikud: "קָמָץ", symbol: "ָ", sound: "אָ", color: "#FF6B6B", textColor: "#fff" },
  { id: "patah", name: "פֶּתַח", nameNikud: "פָּתַח", symbol: "ַ", sound: "אָ", color: "#FF8C42", textColor: "#fff" },
  { id: "hiriq", name: "חִירִיק", nameNikud: "חִירִיק", symbol: "ִ", sound: "אִי", color: "#4ECDC4", textColor: "#fff" },
  { id: "tzere", name: "צָרָה", nameNikud: "צֵרֶה", symbol: "ֵ", sound: "אֶ", color: "#45B7D1", textColor: "#fff" },
  { id: "segol", name: "סָגֹול", nameNikud: "סְגוֹל", symbol: "ֶ", sound: "אֶ", color: "#9B59B6", textColor: "#fff" },
  { id: "holam", name: "חוֹלֵם", nameNikud: "חוֹלָם", symbol: "ֹ", sound: "אֹ", color: "#2ECC71", textColor: "#fff" },
  { id: "kubbutz", name: "קֻובּוּץ", nameNikud: "קֻבּוּץ", symbol: "ֻ", sound: "אֻ", color: "#F39C12", textColor: "#fff" }
], pc = ["א", "ב", "ג", "ד", "מ", "נ", "ל", "ר", "ש", "ת", "פ", "ק"];
function mc(e, t) {
  return e + t;
}
function _c(e) {
  let t = [...ve];
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
  t.length === 0 && (t = [...ve]);
  let n = [...t];
  for (; n.length < e; )
    n.push(...t);
  return n.sort(() => Math.random() - 0.5).slice(0, e);
}
function gc(e, t, n) {
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
function bc(e, t) {
  const n = document.createElement("div");
  n.className = "progress-bar", n.setAttribute("role", "progressbar"), n.setAttribute("aria-valuemin", "0"), n.setAttribute("aria-valuemax", String(t)), n.innerHTML = `
    <div class="progress-bar__track">
      <div class="progress-bar__fill" style="width: 0%"></div>
    </div>
    <span class="progress-bar__label">0 / ${t}</span>
  `, e.appendChild(n);
  const o = n.querySelector(".progress-bar__fill"), r = n.querySelector(".progress-bar__label");
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
function vc(e) {
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
      be.correct(), o(r, "correct"), _e(t, "bounce");
    },
    /** הצג עידוד — נסה שוב */
    wrong(r = "נַסֵּה שׁוּב") {
      be.wrong(), o(r, "wrong"), _e(t, "pulse");
    },
    /** הצג רמז */
    hint(r) {
      o(r, "hint"), _e(t, "pulse");
    },
    /** הסר את הרכיב */
    destroy() {
      clearTimeout(n), t.remove();
    }
  };
}
function yc(e, t) {
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
  ve.forEach((u) => {
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
  const a = document.getElementById("nikud-rate-slider"), c = document.getElementById("nikud-rate-val");
  a.oninput = () => {
    c.textContent = a.value;
  }, document.getElementById("save-settings-btn").onclick = () => {
    const u = parseFloat(a.value);
    localStorage.setItem("alefbet.nikudRate", u), Pn.setNikudEmphasis({ rate: u });
    const l = Array.from(n.querySelectorAll(".nikud-filter-cb")).filter((p) => p.checked).map((p) => p.value), d = new URL(window.location);
    l.length > 0 && l.length < ve.length ? d.searchParams.set("allowedNikud", l.join(",")) : d.searchParams.delete("allowedNikud"), d.searchParams.delete("excludedNikud"), n.style.display = "none", window.history.replaceState({}, "", d), t && t(e);
  }, document.getElementById("close-settings-btn").onclick = () => {
    n.style.display = "none";
  };
}
function wc(e) {
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
function kc(e, t) {
  const { image: n, zones: o = [], onCorrect: r, onWrong: i, onAllCorrect: s, showZones: a = !1 } = t, c = document.createElement("div");
  c.className = "ab-zp-wrap";
  const u = document.createElement("img");
  u.className = "ab-zp-image", u.src = n, u.alt = "", u.draggable = !1, c.appendChild(u);
  const l = document.createElement("div");
  l.className = "ab-zp-layer", c.appendChild(l), e.appendChild(c);
  const d = /* @__PURE__ */ new Set();
  return o.forEach((p) => {
    const g = document.createElement("button");
    g.className = "ab-zp-zone", a && g.classList.add("ab-zp-zone--visible"), g.style.left = `${p.x}%`, g.style.top = `${p.y}%`, g.style.width = `${p.width}%`, g.style.height = `${p.height}%`, g.setAttribute("aria-label", p.label || (p.correct ? "correct zone" : "zone")), g.addEventListener("click", () => {
      if (!d.has(p.id))
        if (p.correct) {
          d.add(p.id), g.classList.add("ab-zp-zone--correct"), r && r(p);
          const k = o.filter((b) => b.correct).length;
          d.size >= k && s && s();
        } else
          g.classList.add("ab-zp-zone--wrong"), i && i(p), setTimeout(() => g.classList.remove("ab-zp-zone--wrong"), 600);
    }), l.appendChild(g);
  }), {
    /** Highlight all correct zones (hint/reveal) */
    revealCorrect() {
      l.querySelectorAll(".ab-zp-zone").forEach((p, g) => {
        var k;
        (k = o[g]) != null && k.correct && p.classList.add("ab-zp-zone--revealed");
      });
    },
    /** Reset all found state */
    reset() {
      d.clear(), l.querySelectorAll(".ab-zp-zone").forEach((p) => {
        p.classList.remove("ab-zp-zone--correct", "ab-zp-zone--wrong", "ab-zp-zone--revealed");
      });
    },
    destroy() {
      c.remove();
    }
  };
}
function zc(e, t = "טוֹעֵן...") {
  e.innerHTML = `<div class="ab-loading">${t}</div>`;
}
function Ec(e) {
  e.innerHTML = "";
}
function $c(e, t, n, o) {
  const r = e.querySelector(".game-header__spacer");
  if (!r) return null;
  const i = document.createElement("button");
  return i.className = "ab-header-btn", i.setAttribute("aria-label", n), i.textContent = t, i.onclick = o, r.innerHTML = "", r.appendChild(i), i;
}
function Sc(e, { size: t = "md" } = {}) {
  const n = document.createElement("div");
  n.className = `ab-nikud-box ab-nikud-box--${t} ab-nikud-box--${e.id}`;
  const o = document.createElement("div");
  o.className = "ab-nikud-box__box";
  const r = document.createElement("div");
  return r.className = "ab-nikud-box__mark", r.textContent = e.symbol, n.appendChild(o), n.appendChild(r), n;
}
function Nc(e, t = {}) {
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
  const d = e.querySelector(".ab-app-subtitle"), p = e.querySelector(".ab-app-content");
  function g(b) {
    k(b), typeof s == "function" && s(b);
  }
  e.querySelectorAll(".ab-app-tab, .ab-app-nav-item").forEach((b) => {
    b.addEventListener("click", () => g(b.dataset.tab));
  });
  function k(b) {
    e.querySelectorAll(".ab-app-tab, .ab-app-nav-item").forEach(($) => {
      const z = $.dataset.tab === b;
      $.classList.toggle("ab-active", z), $.setAttribute("aria-selected", z ? "true" : "false");
    });
  }
  return r.length > 0 && k(r[0].id), {
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
      k(b);
    }
  };
}
function Xn(e, {
  gameId: t,
  voiceKey: n,
  label: o = "הקלטת קול",
  onSaved: r,
  onDeleted: i
} = {}) {
  if (!Fn()) {
    const E = document.createElement("span");
    return E.className = "ab-voice-unsupported", E.textContent = "🎤 הקלטה לא נתמכת בדפדפן זה", e.appendChild(E), { refresh: async () => {
    }, destroy: () => E.remove() };
  }
  const s = Un(), a = document.createElement("div");
  a.className = "ab-voice-btn-wrap", a.setAttribute("aria-label", o), e.appendChild(a);
  let c = "idle", u = null, l = null, d = null, p = null, g = null, k = null, b = 0;
  function $() {
    if (a.innerHTML = "", c === "idle")
      u = z("🎤", "ab-voice-btn ab-voice-btn--record", "התחל הקלטה", S), a.appendChild(u);
    else if (c === "recording") {
      g = document.createElement("span"), g.className = "ab-voice-indicator", a.appendChild(g);
      const E = document.createElement("span");
      E.className = "ab-voice-timer", E.textContent = "0:00", a.appendChild(E), b = 0, k = setInterval(() => {
        b++;
        const Z = Math.floor(b / 60), j = String(b % 60).padStart(2, "0");
        E.textContent = `${Z}:${j}`, b >= 120 && h();
      }, 1e3), l = z("⏹", "ab-voice-btn ab-voice-btn--stop", "עצור הקלטה", h), a.appendChild(l);
    } else c === "has-voice" && (d = z("▶", "ab-voice-btn ab-voice-btn--play", "נגן הקלטה", _), a.appendChild(d), u = z("🎤", "ab-voice-btn ab-voice-btn--re-record", "הקלט מחדש", S), a.appendChild(u), p = z("🗑", "ab-voice-btn ab-voice-btn--delete", "מחק הקלטה", m), a.appendChild(p));
  }
  function z(E, Z, j, de) {
    const M = document.createElement("button");
    return M.className = Z, M.type = "button", M.title = j, M.setAttribute("aria-label", j), M.textContent = E, M.addEventListener("click", de), M;
  }
  async function S() {
    try {
      await s.start(), c = "recording", $();
    } catch (E) {
      console.warn("[voice-record-button] microphone access denied:", E), y("לא ניתן לגשת למיקרופון");
    }
  }
  async function h() {
    clearInterval(k);
    try {
      const E = await s.stop();
      await Hn(t, n, E), c = "has-voice", $(), r == null || r(E);
    } catch (E) {
      console.warn("[voice-record-button] stop error:", E), c = "idle", $();
    }
  }
  async function _() {
    d == null || d.setAttribute("disabled", "true"), await Wn(t, n), d == null || d.removeAttribute("disabled");
  }
  async function m() {
    confirm("למחוק את ההקלטה?") && (await Vn(t, n), c = "idle", $(), i == null || i());
  }
  function y(E) {
    const Z = document.createElement("span");
    Z.className = "ab-voice-error", Z.textContent = E, a.appendChild(Z), setTimeout(() => Z.remove(), 3e3);
  }
  async function v() {
    if (s.isActive()) return;
    c = await We(t, n).catch(() => null) ? "has-voice" : "idle", $();
  }
  function N() {
    clearInterval(k), s.isActive() && s.cancel(), a.remove();
  }
  return v(), { refresh: v, destroy: N };
}
let Y = null, F = null, Fe = 0, Ue = 0;
const ye = /* @__PURE__ */ new Map();
function ft(e, t) {
  var n;
  return ((n = document.elementFromPoint(e, t)) == null ? void 0 : n.closest('[data-drop-target="true"]')) || null;
}
function Yn(e, t, n) {
  const o = e.getBoundingClientRect();
  Fe = o.width / 2, Ue = o.height / 2, F = e.cloneNode(!0), Object.assign(F.style, {
    position: "fixed",
    left: `${t - Fe}px`,
    top: `${n - Ue}px`,
    width: `${o.width}px`,
    height: `${o.height}px`,
    pointerEvents: "none",
    // keeps it out of elementFromPoint + hit-testing
    zIndex: "9999",
    opacity: "0.85",
    transform: "scale(1.12)",
    cursor: "grabbing",
    margin: "0"
  }), document.body.appendChild(F);
}
function Gn(e, t) {
  F && (F.style.left = `${e - Fe}px`, F.style.top = `${t - Ue}px`);
}
function Kn() {
  F == null || F.remove(), F = null;
}
let U = null;
function Qn(e) {
  U !== e && (U == null || U.classList.remove("drop-target--hover"), U = e, e == null || e.classList.add("drop-target--hover"));
}
function eo() {
  U == null || U.classList.remove("drop-target--hover"), U = null;
}
function to(e, t) {
  e.classList.add("drag-source");
  let n = null, o = null, r = null;
  function i() {
    n && (e.removeEventListener("pointermove", n), e.removeEventListener("pointerup", o), e.removeEventListener("pointercancel", r), n = o = r = null), eo(), Kn(), e.classList.remove("drag-source--dragging"), Y = null;
  }
  function s(a) {
    a.button !== void 0 && a.button !== 0 || (a.preventDefault(), Y && i(), Y = { el: e, data: t }, e.classList.add("drag-source--dragging"), Yn(e, a.clientX, a.clientY), e.setPointerCapture(a.pointerId), n = (c) => {
      Gn(c.clientX, c.clientY), Qn(ft(c.clientX, c.clientY));
    }, o = (c) => {
      const u = ft(c.clientX, c.clientY);
      i(), u && ye.has(u) && ye.get(u).onDrop({ data: t, sourceEl: e, targetEl: u });
    }, r = () => i(), e.addEventListener("pointermove", n), e.addEventListener("pointerup", o), e.addEventListener("pointercancel", r));
  }
  return e.addEventListener("pointerdown", s), {
    destroy() {
      e.removeEventListener("pointerdown", s), (Y == null ? void 0 : Y.el) === e && i(), e.classList.remove("drag-source");
    }
  };
}
function no(e, t) {
  return e.setAttribute("data-drop-target", "true"), e.classList.add("drop-target--active"), ye.set(e, { onDrop: t }), {
    destroy() {
      e.removeAttribute("data-drop-target"), e.classList.remove("drop-target--active", "drop-target--hover"), ye.delete(e);
    }
  };
}
function oo(e, { onClick: t } = {}) {
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
function ro(e, t, { onSelectRound: n, onAddRound: o, onDuplicateRound: r, onMoveRound: i }) {
  const s = document.createElement("div");
  s.className = "ab-editor-nav", s.setAttribute("aria-label", "ניווט סיבובים");
  const a = document.createElement("div");
  a.className = "ab-editor-nav__header", a.textContent = "סיבובים", s.appendChild(a);
  const c = document.createElement("div");
  c.className = "ab-editor-nav__list", s.appendChild(c);
  const u = document.createElement("button");
  u.className = "ab-editor-nav__add", u.textContent = "+ הוסף", u.addEventListener("click", () => o(null)), s.appendChild(u), e.appendChild(s);
  let l = null, d = [];
  function p() {
    d.forEach((z) => z.destroy()), d = [];
  }
  function g(z, S) {
    const h = document.createElement("div");
    h.className = "ab-editor-nav__thumb", z.id === l && h.classList.add("ab-editor-nav__thumb--active"), h.setAttribute("role", "button"), h.setAttribute("tabindex", "0"), h.setAttribute("aria-label", `סיבוב ${S + 1}`), h.dataset.roundId = z.id, z.image && (h.style.backgroundImage = `url(${z.image})`, h.classList.add("ab-editor-nav__thumb--has-img"));
    const _ = document.createElement("div");
    _.className = "ab-editor-nav__grip", _.innerHTML = "⠿", _.setAttribute("aria-hidden", "true"), _.title = "גרור לשינוי סדר", h.appendChild(_);
    const m = document.createElement("div");
    if (m.className = "ab-editor-nav__num", m.textContent = String(S + 1), h.appendChild(m), z.correctEmoji && !z.image) {
      const v = document.createElement("div");
      v.className = "ab-editor-nav__emoji", v.textContent = z.correctEmoji, h.appendChild(v);
    }
    if (z.target) {
      const v = document.createElement("div");
      v.className = "ab-editor-nav__letter", v.textContent = z.target, h.appendChild(v);
    }
    const y = document.createElement("button");
    return y.className = "ab-editor-nav__dup", y.innerHTML = "⧉", y.title = "שכפל סיבוב", y.setAttribute("aria-label", "שכפל סיבוב"), y.addEventListener("click", (v) => {
      v.stopPropagation(), r(z.id);
    }), h.appendChild(y), h.addEventListener("click", () => n(z.id)), h.addEventListener("keydown", (v) => {
      (v.key === "Enter" || v.key === " ") && (v.preventDefault(), n(z.id));
    }), d.push(to(_, { roundId: z.id })), d.push(no(h, ({ data: v }) => {
      v.roundId !== z.id && i(v.roundId, t.getRoundIndex(z.id));
    })), h;
  }
  function k() {
    p(), c.innerHTML = "", t.rounds.forEach((z, S) => c.appendChild(g(z, S)));
  }
  function b(z) {
    l = z, c.querySelectorAll(".ab-editor-nav__thumb").forEach((S) => {
      S.classList.toggle("ab-editor-nav__thumb--active", S.dataset.roundId === z);
    });
  }
  function $() {
    p(), s.remove();
  }
  return k(), { refresh: k, setActiveRound: b, destroy: $ };
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
      const p = l[d];
      p in a || (a[p] = u[p].bind(a));
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
class te extends Error {
  constructor() {
    super("Encountered Promise during synchronous parse. Use .parseAsync() instead.");
  }
}
class At extends Error {
  constructor(t) {
    super(`Encountered unidirectional transform during encode: ${t}`), this.name = "ZodEncodeError";
  }
}
const jt = {};
function J(e) {
  return jt;
}
function Dt(e) {
  const t = Object.values(e).filter((o) => typeof o == "number");
  return Object.entries(e).filter(([o, r]) => t.indexOf(+o) === -1).map(([o, r]) => r);
}
function Be(e, t) {
  return typeof t == "bigint" ? t.toString() : t;
}
function qe(e) {
  return {
    get value() {
      {
        const t = e();
        return Object.defineProperty(this, "value", { value: t }), t;
      }
    }
  };
}
function Xe(e) {
  return e == null;
}
function Ye(e) {
  const t = e.startsWith("^") ? 1 : 0, n = e.endsWith("$") ? e.length - 1 : e.length;
  return e.slice(t, n);
}
function io(e, t) {
  const n = (e.toString().split(".")[1] || "").length, o = t.toString();
  let r = (o.split(".")[1] || "").length;
  if (r === 0 && /\d?e-\d?/.test(o)) {
    const c = o.match(/\d?e-(\d?)/);
    c != null && c[1] && (r = Number.parseInt(c[1]));
  }
  const i = n > r ? n : r, s = Number.parseInt(e.toFixed(i).replace(".", "")), a = Number.parseInt(t.toFixed(i).replace(".", ""));
  return s % a / 10 ** i;
}
const ht = Symbol("evaluating");
function C(e, t, n) {
  let o;
  Object.defineProperty(e, t, {
    get() {
      if (o !== ht)
        return o === void 0 && (o = ht, o = n()), o;
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
function q(e, t, n) {
  Object.defineProperty(e, t, {
    value: n,
    writable: !0,
    enumerable: !0,
    configurable: !0
  });
}
function V(...e) {
  const t = {};
  for (const n of e) {
    const o = Object.getOwnPropertyDescriptors(n);
    Object.assign(t, o);
  }
  return Object.defineProperties({}, t);
}
function pt(e) {
  return JSON.stringify(e);
}
function so(e) {
  return e.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
const Mt = "captureStackTrace" in Error ? Error.captureStackTrace : (...e) => {
};
function we(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
const ao = qe(() => {
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
function ne(e) {
  if (we(e) === !1)
    return !1;
  const t = e.constructor;
  if (t === void 0 || typeof t != "function")
    return !0;
  const n = t.prototype;
  return !(we(n) === !1 || Object.prototype.hasOwnProperty.call(n, "isPrototypeOf") === !1);
}
function Ft(e) {
  return ne(e) ? { ...e } : Array.isArray(e) ? [...e] : e;
}
const co = /* @__PURE__ */ new Set(["string", "number", "symbol"]);
function xe(e) {
  return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function W(e, t, n) {
  const o = new e._zod.constr(t ?? e._zod.def);
  return (!t || n != null && n.parent) && (o._zod.parent = e), o;
}
function w(e) {
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
function uo(e) {
  return Object.keys(e).filter((t) => e[t]._zod.optin === "optional" && e[t]._zod.optout === "optional");
}
const lo = {
  safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
  int32: [-2147483648, 2147483647],
  uint32: [0, 4294967295],
  float32: [-34028234663852886e22, 34028234663852886e22],
  float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
};
function fo(e, t) {
  const n = e._zod.def, o = n.checks;
  if (o && o.length > 0)
    throw new Error(".pick() cannot be used on object schemas containing refinements");
  const i = V(e._zod.def, {
    get shape() {
      const s = {};
      for (const a in t) {
        if (!(a in n.shape))
          throw new Error(`Unrecognized key: "${a}"`);
        t[a] && (s[a] = n.shape[a]);
      }
      return q(this, "shape", s), s;
    },
    checks: []
  });
  return W(e, i);
}
function ho(e, t) {
  const n = e._zod.def, o = n.checks;
  if (o && o.length > 0)
    throw new Error(".omit() cannot be used on object schemas containing refinements");
  const i = V(e._zod.def, {
    get shape() {
      const s = { ...e._zod.def.shape };
      for (const a in t) {
        if (!(a in n.shape))
          throw new Error(`Unrecognized key: "${a}"`);
        t[a] && delete s[a];
      }
      return q(this, "shape", s), s;
    },
    checks: []
  });
  return W(e, i);
}
function po(e, t) {
  if (!ne(t))
    throw new Error("Invalid input to extend: expected a plain object");
  const n = e._zod.def.checks;
  if (n && n.length > 0) {
    const i = e._zod.def.shape;
    for (const s in t)
      if (Object.getOwnPropertyDescriptor(i, s) !== void 0)
        throw new Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
  }
  const r = V(e._zod.def, {
    get shape() {
      const i = { ...e._zod.def.shape, ...t };
      return q(this, "shape", i), i;
    }
  });
  return W(e, r);
}
function mo(e, t) {
  if (!ne(t))
    throw new Error("Invalid input to safeExtend: expected a plain object");
  const n = V(e._zod.def, {
    get shape() {
      const o = { ...e._zod.def.shape, ...t };
      return q(this, "shape", o), o;
    }
  });
  return W(e, n);
}
function _o(e, t) {
  const n = V(e._zod.def, {
    get shape() {
      const o = { ...e._zod.def.shape, ...t._zod.def.shape };
      return q(this, "shape", o), o;
    },
    get catchall() {
      return t._zod.def.catchall;
    },
    checks: []
    // delete existing checks
  });
  return W(e, n);
}
function go(e, t, n) {
  const r = t._zod.def.checks;
  if (r && r.length > 0)
    throw new Error(".partial() cannot be used on object schemas containing refinements");
  const s = V(t._zod.def, {
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
      return q(this, "shape", c), c;
    },
    checks: []
  });
  return W(t, s);
}
function bo(e, t, n) {
  const o = V(t._zod.def, {
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
      return q(this, "shape", i), i;
    }
  });
  return W(t, o);
}
function Q(e, t = 0) {
  var n;
  if (e.aborted === !0)
    return !0;
  for (let o = t; o < e.issues.length; o++)
    if (((n = e.issues[o]) == null ? void 0 : n.continue) !== !0)
      return !0;
  return !1;
}
function ee(e, t) {
  return t.map((n) => {
    var o;
    return (o = n).path ?? (o.path = []), n.path.unshift(e), n;
  });
}
function fe(e) {
  return typeof e == "string" ? e : e == null ? void 0 : e.message;
}
function H(e, t, n) {
  var r, i, s, a, c, u;
  const o = { ...e, path: e.path ?? [] };
  if (!e.message) {
    const l = fe((s = (i = (r = e.inst) == null ? void 0 : r._zod.def) == null ? void 0 : i.error) == null ? void 0 : s.call(i, e)) ?? fe((a = t == null ? void 0 : t.error) == null ? void 0 : a.call(t, e)) ?? fe((c = n.customError) == null ? void 0 : c.call(n, e)) ?? fe((u = n.localeError) == null ? void 0 : u.call(n, e)) ?? "Invalid input";
    o.message = l;
  }
  return delete o.inst, delete o.continue, t != null && t.reportInput || delete o.input, o;
}
function Ge(e) {
  return Array.isArray(e) ? "array" : typeof e == "string" ? "string" : "unknown";
}
function le(...e) {
  const [t, n, o] = e;
  return typeof t == "string" ? {
    message: t,
    code: "custom",
    input: n,
    inst: o
  } : { ...t };
}
const Ut = (e, t) => {
  e.name = "$ZodError", Object.defineProperty(e, "_zod", {
    value: e._zod,
    enumerable: !1
  }), Object.defineProperty(e, "issues", {
    value: t,
    enumerable: !1
  }), e.message = JSON.stringify(t, Be, 2), Object.defineProperty(e, "toString", {
    value: () => e.message,
    enumerable: !1
  });
}, Bt = f("$ZodError", Ut), Jt = f("$ZodError", Ut, { Parent: Error });
function vo(e, t = (n) => n.message) {
  const n = {}, o = [];
  for (const r of e.issues)
    r.path.length > 0 ? (n[r.path[0]] = n[r.path[0]] || [], n[r.path[0]].push(t(r))) : o.push(t(r));
  return { formErrors: o, fieldErrors: n };
}
function yo(e, t = (n) => n.message) {
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
const Ke = (e) => (t, n, o, r) => {
  const i = o ? Object.assign(o, { async: !1 }) : { async: !1 }, s = t._zod.run({ value: n, issues: [] }, i);
  if (s instanceof Promise)
    throw new te();
  if (s.issues.length) {
    const a = new ((r == null ? void 0 : r.Err) ?? e)(s.issues.map((c) => H(c, i, J())));
    throw Mt(a, r == null ? void 0 : r.callee), a;
  }
  return s.value;
}, Qe = (e) => async (t, n, o, r) => {
  const i = o ? Object.assign(o, { async: !0 }) : { async: !0 };
  let s = t._zod.run({ value: n, issues: [] }, i);
  if (s instanceof Promise && (s = await s), s.issues.length) {
    const a = new ((r == null ? void 0 : r.Err) ?? e)(s.issues.map((c) => H(c, i, J())));
    throw Mt(a, r == null ? void 0 : r.callee), a;
  }
  return s.value;
}, Te = (e) => (t, n, o) => {
  const r = o ? { ...o, async: !1 } : { async: !1 }, i = t._zod.run({ value: n, issues: [] }, r);
  if (i instanceof Promise)
    throw new te();
  return i.issues.length ? {
    success: !1,
    error: new (e ?? Bt)(i.issues.map((s) => H(s, r, J())))
  } : { success: !0, data: i.value };
}, wo = /* @__PURE__ */ Te(Jt), Re = (e) => async (t, n, o) => {
  const r = o ? Object.assign(o, { async: !0 }) : { async: !0 };
  let i = t._zod.run({ value: n, issues: [] }, r);
  return i instanceof Promise && (i = await i), i.issues.length ? {
    success: !1,
    error: new e(i.issues.map((s) => H(s, r, J())))
  } : { success: !0, data: i.value };
}, ko = /* @__PURE__ */ Re(Jt), zo = (e) => (t, n, o) => {
  const r = o ? Object.assign(o, { direction: "backward" }) : { direction: "backward" };
  return Ke(e)(t, n, r);
}, Eo = (e) => (t, n, o) => Ke(e)(t, n, o), $o = (e) => async (t, n, o) => {
  const r = o ? Object.assign(o, { direction: "backward" }) : { direction: "backward" };
  return Qe(e)(t, n, r);
}, So = (e) => async (t, n, o) => Qe(e)(t, n, o), No = (e) => (t, n, o) => {
  const r = o ? Object.assign(o, { direction: "backward" }) : { direction: "backward" };
  return Te(e)(t, n, r);
}, Co = (e) => (t, n, o) => Te(e)(t, n, o), Zo = (e) => async (t, n, o) => {
  const r = o ? Object.assign(o, { direction: "backward" }) : { direction: "backward" };
  return Re(e)(t, n, r);
}, xo = (e) => async (t, n, o) => Re(e)(t, n, o), To = /^[cC][^\s-]{8,}$/, Ro = /^[0-9a-z]+$/, Io = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/, Oo = /^[0-9a-vA-V]{20}$/, Po = /^[A-Za-z0-9]{27}$/, Lo = /^[a-zA-Z0-9_-]{21}$/, Ao = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/, jo = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/, mt = (e) => e ? new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${e}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`) : /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/, Do = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/, Mo = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
function Fo() {
  return new RegExp(Mo, "u");
}
const Uo = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, Bo = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/, Jo = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/, Ho = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, Vo = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/, Ht = /^[A-Za-z0-9_-]*$/, Wo = /^\+[1-9]\d{6,14}$/, Vt = "(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))", qo = /* @__PURE__ */ new RegExp(`^${Vt}$`);
function Wt(e) {
  const t = "(?:[01]\\d|2[0-3]):[0-5]\\d";
  return typeof e.precision == "number" ? e.precision === -1 ? `${t}` : e.precision === 0 ? `${t}:[0-5]\\d` : `${t}:[0-5]\\d\\.\\d{${e.precision}}` : `${t}(?::[0-5]\\d(?:\\.\\d+)?)?`;
}
function Xo(e) {
  return new RegExp(`^${Wt(e)}$`);
}
function Yo(e) {
  const t = Wt({ precision: e.precision }), n = ["Z"];
  e.local && n.push(""), e.offset && n.push("([+-](?:[01]\\d|2[0-3]):[0-5]\\d)");
  const o = `${t}(?:${n.join("|")})`;
  return new RegExp(`^${Vt}T(?:${o})$`);
}
const Go = (e) => {
  const t = e ? `[\\s\\S]{${(e == null ? void 0 : e.minimum) ?? 0},${(e == null ? void 0 : e.maximum) ?? ""}}` : "[\\s\\S]*";
  return new RegExp(`^${t}$`);
}, Ko = /^-?\d+$/, qt = /^-?\d+(?:\.\d+)?$/, Qo = /^(?:true|false)$/i, er = /^[^A-Z]*$/, tr = /^[^a-z]*$/, A = /* @__PURE__ */ f("$ZodCheck", (e, t) => {
  var n;
  e._zod ?? (e._zod = {}), e._zod.def = t, (n = e._zod).onattach ?? (n.onattach = []);
}), Xt = {
  number: "number",
  bigint: "bigint",
  object: "date"
}, Yt = /* @__PURE__ */ f("$ZodCheckLessThan", (e, t) => {
  A.init(e, t);
  const n = Xt[typeof t.value];
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
}), Gt = /* @__PURE__ */ f("$ZodCheckGreaterThan", (e, t) => {
  A.init(e, t);
  const n = Xt[typeof t.value];
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
}), nr = /* @__PURE__ */ f("$ZodCheckMultipleOf", (e, t) => {
  A.init(e, t), e._zod.onattach.push((n) => {
    var o;
    (o = n._zod.bag).multipleOf ?? (o.multipleOf = t.value);
  }), e._zod.check = (n) => {
    if (typeof n.value != typeof t.value)
      throw new Error("Cannot mix number and bigint in multiple_of check.");
    (typeof n.value == "bigint" ? n.value % t.value === BigInt(0) : io(n.value, t.value) === 0) || n.issues.push({
      origin: typeof n.value,
      code: "not_multiple_of",
      divisor: t.value,
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), or = /* @__PURE__ */ f("$ZodCheckNumberFormat", (e, t) => {
  var s;
  A.init(e, t), t.format = t.format || "float64";
  const n = (s = t.format) == null ? void 0 : s.includes("int"), o = n ? "int" : "number", [r, i] = lo[t.format];
  e._zod.onattach.push((a) => {
    const c = a._zod.bag;
    c.format = t.format, c.minimum = r, c.maximum = i, n && (c.pattern = Ko);
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
}), rr = /* @__PURE__ */ f("$ZodCheckMaxLength", (e, t) => {
  var n;
  A.init(e, t), (n = e._zod.def).when ?? (n.when = (o) => {
    const r = o.value;
    return !Xe(r) && r.length !== void 0;
  }), e._zod.onattach.push((o) => {
    const r = o._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
    t.maximum < r && (o._zod.bag.maximum = t.maximum);
  }), e._zod.check = (o) => {
    const r = o.value;
    if (r.length <= t.maximum)
      return;
    const s = Ge(r);
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
}), ir = /* @__PURE__ */ f("$ZodCheckMinLength", (e, t) => {
  var n;
  A.init(e, t), (n = e._zod.def).when ?? (n.when = (o) => {
    const r = o.value;
    return !Xe(r) && r.length !== void 0;
  }), e._zod.onattach.push((o) => {
    const r = o._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
    t.minimum > r && (o._zod.bag.minimum = t.minimum);
  }), e._zod.check = (o) => {
    const r = o.value;
    if (r.length >= t.minimum)
      return;
    const s = Ge(r);
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
}), sr = /* @__PURE__ */ f("$ZodCheckLengthEquals", (e, t) => {
  var n;
  A.init(e, t), (n = e._zod.def).when ?? (n.when = (o) => {
    const r = o.value;
    return !Xe(r) && r.length !== void 0;
  }), e._zod.onattach.push((o) => {
    const r = o._zod.bag;
    r.minimum = t.length, r.maximum = t.length, r.length = t.length;
  }), e._zod.check = (o) => {
    const r = o.value, i = r.length;
    if (i === t.length)
      return;
    const s = Ge(r), a = i > t.length;
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
}), Ie = /* @__PURE__ */ f("$ZodCheckStringFormat", (e, t) => {
  var n, o;
  A.init(e, t), e._zod.onattach.push((r) => {
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
}), ar = /* @__PURE__ */ f("$ZodCheckRegex", (e, t) => {
  Ie.init(e, t), e._zod.check = (n) => {
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
}), cr = /* @__PURE__ */ f("$ZodCheckLowerCase", (e, t) => {
  t.pattern ?? (t.pattern = er), Ie.init(e, t);
}), ur = /* @__PURE__ */ f("$ZodCheckUpperCase", (e, t) => {
  t.pattern ?? (t.pattern = tr), Ie.init(e, t);
}), lr = /* @__PURE__ */ f("$ZodCheckIncludes", (e, t) => {
  A.init(e, t);
  const n = xe(t.includes), o = new RegExp(typeof t.position == "number" ? `^.{${t.position}}${n}` : n);
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
}), dr = /* @__PURE__ */ f("$ZodCheckStartsWith", (e, t) => {
  A.init(e, t);
  const n = new RegExp(`^${xe(t.prefix)}.*`);
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
}), fr = /* @__PURE__ */ f("$ZodCheckEndsWith", (e, t) => {
  A.init(e, t);
  const n = new RegExp(`.*${xe(t.suffix)}$`);
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
}), hr = /* @__PURE__ */ f("$ZodCheckOverwrite", (e, t) => {
  A.init(e, t), e._zod.check = (n) => {
    n.value = t.tx(n.value);
  };
});
class pr {
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
const mr = {
  major: 4,
  minor: 3,
  patch: 6
}, R = /* @__PURE__ */ f("$ZodType", (e, t) => {
  var r;
  var n;
  e ?? (e = {}), e._zod.def = t, e._zod.bag = e._zod.bag || {}, e._zod.version = mr;
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
      let l = Q(a), d;
      for (const p of c) {
        if (p._zod.def.when) {
          if (!p._zod.def.when(a))
            continue;
        } else if (l)
          continue;
        const g = a.issues.length, k = p._zod.check(a);
        if (k instanceof Promise && (u == null ? void 0 : u.async) === !1)
          throw new te();
        if (d || k instanceof Promise)
          d = (d ?? Promise.resolve()).then(async () => {
            await k, a.issues.length !== g && (l || (l = Q(a, g)));
          });
        else {
          if (a.issues.length === g)
            continue;
          l || (l = Q(a, g));
        }
      }
      return d ? d.then(() => a) : a;
    }, s = (a, c, u) => {
      if (Q(a))
        return a.aborted = !0, a;
      const l = i(c, o, u);
      if (l instanceof Promise) {
        if (u.async === !1)
          throw new te();
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
          throw new te();
        return u.then((l) => i(l, o, c));
      }
      return i(u, o, c);
    };
  }
  C(e, "~standard", () => ({
    validate: (i) => {
      var s;
      try {
        const a = wo(e, i);
        return a.success ? { value: a.data } : { issues: (s = a.error) == null ? void 0 : s.issues };
      } catch {
        return ko(e, i).then((c) => {
          var u;
          return c.success ? { value: c.data } : { issues: (u = c.error) == null ? void 0 : u.issues };
        });
      }
    },
    vendor: "zod",
    version: 1
  }));
}), et = /* @__PURE__ */ f("$ZodString", (e, t) => {
  var n;
  R.init(e, t), e._zod.pattern = [...((n = e == null ? void 0 : e._zod.bag) == null ? void 0 : n.patterns) ?? []].pop() ?? Go(e._zod.bag), e._zod.parse = (o, r) => {
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
}), x = /* @__PURE__ */ f("$ZodStringFormat", (e, t) => {
  Ie.init(e, t), et.init(e, t);
}), _r = /* @__PURE__ */ f("$ZodGUID", (e, t) => {
  t.pattern ?? (t.pattern = jo), x.init(e, t);
}), gr = /* @__PURE__ */ f("$ZodUUID", (e, t) => {
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
    t.pattern ?? (t.pattern = mt(o));
  } else
    t.pattern ?? (t.pattern = mt());
  x.init(e, t);
}), br = /* @__PURE__ */ f("$ZodEmail", (e, t) => {
  t.pattern ?? (t.pattern = Do), x.init(e, t);
}), vr = /* @__PURE__ */ f("$ZodURL", (e, t) => {
  x.init(e, t), e._zod.check = (n) => {
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
}), yr = /* @__PURE__ */ f("$ZodEmoji", (e, t) => {
  t.pattern ?? (t.pattern = Fo()), x.init(e, t);
}), wr = /* @__PURE__ */ f("$ZodNanoID", (e, t) => {
  t.pattern ?? (t.pattern = Lo), x.init(e, t);
}), kr = /* @__PURE__ */ f("$ZodCUID", (e, t) => {
  t.pattern ?? (t.pattern = To), x.init(e, t);
}), zr = /* @__PURE__ */ f("$ZodCUID2", (e, t) => {
  t.pattern ?? (t.pattern = Ro), x.init(e, t);
}), Er = /* @__PURE__ */ f("$ZodULID", (e, t) => {
  t.pattern ?? (t.pattern = Io), x.init(e, t);
}), $r = /* @__PURE__ */ f("$ZodXID", (e, t) => {
  t.pattern ?? (t.pattern = Oo), x.init(e, t);
}), Sr = /* @__PURE__ */ f("$ZodKSUID", (e, t) => {
  t.pattern ?? (t.pattern = Po), x.init(e, t);
}), Nr = /* @__PURE__ */ f("$ZodISODateTime", (e, t) => {
  t.pattern ?? (t.pattern = Yo(t)), x.init(e, t);
}), Cr = /* @__PURE__ */ f("$ZodISODate", (e, t) => {
  t.pattern ?? (t.pattern = qo), x.init(e, t);
}), Zr = /* @__PURE__ */ f("$ZodISOTime", (e, t) => {
  t.pattern ?? (t.pattern = Xo(t)), x.init(e, t);
}), xr = /* @__PURE__ */ f("$ZodISODuration", (e, t) => {
  t.pattern ?? (t.pattern = Ao), x.init(e, t);
}), Tr = /* @__PURE__ */ f("$ZodIPv4", (e, t) => {
  t.pattern ?? (t.pattern = Uo), x.init(e, t), e._zod.bag.format = "ipv4";
}), Rr = /* @__PURE__ */ f("$ZodIPv6", (e, t) => {
  t.pattern ?? (t.pattern = Bo), x.init(e, t), e._zod.bag.format = "ipv6", e._zod.check = (n) => {
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
}), Ir = /* @__PURE__ */ f("$ZodCIDRv4", (e, t) => {
  t.pattern ?? (t.pattern = Jo), x.init(e, t);
}), Or = /* @__PURE__ */ f("$ZodCIDRv6", (e, t) => {
  t.pattern ?? (t.pattern = Ho), x.init(e, t), e._zod.check = (n) => {
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
function Kt(e) {
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
const Pr = /* @__PURE__ */ f("$ZodBase64", (e, t) => {
  t.pattern ?? (t.pattern = Vo), x.init(e, t), e._zod.bag.contentEncoding = "base64", e._zod.check = (n) => {
    Kt(n.value) || n.issues.push({
      code: "invalid_format",
      format: "base64",
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
});
function Lr(e) {
  if (!Ht.test(e))
    return !1;
  const t = e.replace(/[-_]/g, (o) => o === "-" ? "+" : "/"), n = t.padEnd(Math.ceil(t.length / 4) * 4, "=");
  return Kt(n);
}
const Ar = /* @__PURE__ */ f("$ZodBase64URL", (e, t) => {
  t.pattern ?? (t.pattern = Ht), x.init(e, t), e._zod.bag.contentEncoding = "base64url", e._zod.check = (n) => {
    Lr(n.value) || n.issues.push({
      code: "invalid_format",
      format: "base64url",
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), jr = /* @__PURE__ */ f("$ZodE164", (e, t) => {
  t.pattern ?? (t.pattern = Wo), x.init(e, t);
});
function Dr(e, t = null) {
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
const Mr = /* @__PURE__ */ f("$ZodJWT", (e, t) => {
  x.init(e, t), e._zod.check = (n) => {
    Dr(n.value, t.alg) || n.issues.push({
      code: "invalid_format",
      format: "jwt",
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), Qt = /* @__PURE__ */ f("$ZodNumber", (e, t) => {
  R.init(e, t), e._zod.pattern = e._zod.bag.pattern ?? qt, e._zod.parse = (n, o) => {
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
}), Fr = /* @__PURE__ */ f("$ZodNumberFormat", (e, t) => {
  or.init(e, t), Qt.init(e, t);
}), Ur = /* @__PURE__ */ f("$ZodBoolean", (e, t) => {
  R.init(e, t), e._zod.pattern = Qo, e._zod.parse = (n, o) => {
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
}), Br = /* @__PURE__ */ f("$ZodUnknown", (e, t) => {
  R.init(e, t), e._zod.parse = (n) => n;
}), Jr = /* @__PURE__ */ f("$ZodNever", (e, t) => {
  R.init(e, t), e._zod.parse = (n, o) => (n.issues.push({
    expected: "never",
    code: "invalid_type",
    input: n.value,
    inst: e
  }), n);
});
function _t(e, t, n) {
  e.issues.length && t.issues.push(...ee(n, e.issues)), t.value[n] = e.value;
}
const Hr = /* @__PURE__ */ f("$ZodArray", (e, t) => {
  R.init(e, t), e._zod.parse = (n, o) => {
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
      c instanceof Promise ? i.push(c.then((u) => _t(u, n, s))) : _t(c, n, s);
    }
    return i.length ? Promise.all(i).then(() => n) : n;
  };
});
function ke(e, t, n, o, r) {
  if (e.issues.length) {
    if (r && !(n in o))
      return;
    t.issues.push(...ee(n, e.issues));
  }
  e.value === void 0 ? n in o && (t.value[n] = void 0) : t.value[n] = e.value;
}
function en(e) {
  var o, r, i, s;
  const t = Object.keys(e.shape);
  for (const a of t)
    if (!((s = (i = (r = (o = e.shape) == null ? void 0 : o[a]) == null ? void 0 : r._zod) == null ? void 0 : i.traits) != null && s.has("$ZodType")))
      throw new Error(`Invalid element at key "${a}": expected a Zod schema`);
  const n = uo(e.shape);
  return {
    ...e,
    keys: t,
    keySet: new Set(t),
    numKeys: t.length,
    optionalKeys: new Set(n)
  };
}
function tn(e, t, n, o, r, i) {
  const s = [], a = r.keySet, c = r.catchall._zod, u = c.def.type, l = c.optout === "optional";
  for (const d in t) {
    if (a.has(d))
      continue;
    if (u === "never") {
      s.push(d);
      continue;
    }
    const p = c.run({ value: t[d], issues: [] }, o);
    p instanceof Promise ? e.push(p.then((g) => ke(g, n, d, t, l))) : ke(p, n, d, t, l);
  }
  return s.length && n.issues.push({
    code: "unrecognized_keys",
    keys: s,
    input: t,
    inst: i
  }), e.length ? Promise.all(e).then(() => n) : n;
}
const Vr = /* @__PURE__ */ f("$ZodObject", (e, t) => {
  R.init(e, t);
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
  const o = qe(() => en(t));
  C(e._zod, "propValues", () => {
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
  const r = we, i = t.catchall;
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
    for (const p of s.keys) {
      const g = d[p], k = g._zod.optout === "optional", b = g._zod.run({ value: u[p], issues: [] }, c);
      b instanceof Promise ? l.push(b.then(($) => ke($, a, p, u, k))) : ke(b, a, p, u, k);
    }
    return i ? tn(l, u, a, c, o.value, e) : l.length ? Promise.all(l).then(() => a) : a;
  };
}), Wr = /* @__PURE__ */ f("$ZodObjectJIT", (e, t) => {
  Vr.init(e, t);
  const n = e._zod.parse, o = qe(() => en(t)), r = (p) => {
    var h;
    const g = new pr(["shape", "payload", "ctx"]), k = o.value, b = (_) => {
      const m = pt(_);
      return `shape[${m}]._zod.run({ value: input[${m}], issues: [] }, ctx)`;
    };
    g.write("const input = payload.value;");
    const $ = /* @__PURE__ */ Object.create(null);
    let z = 0;
    for (const _ of k.keys)
      $[_] = `key_${z++}`;
    g.write("const newResult = {};");
    for (const _ of k.keys) {
      const m = $[_], y = pt(_), v = p[_], N = ((h = v == null ? void 0 : v._zod) == null ? void 0 : h.optout) === "optional";
      g.write(`const ${m} = ${b(_)};`), N ? g.write(`
        if (${m}.issues.length) {
          if (${y} in input) {
            payload.issues = payload.issues.concat(${m}.issues.map(iss => ({
              ...iss,
              path: iss.path ? [${y}, ...iss.path] : [${y}]
            })));
          }
        }
        
        if (${m}.value === undefined) {
          if (${y} in input) {
            newResult[${y}] = undefined;
          }
        } else {
          newResult[${y}] = ${m}.value;
        }
        
      `) : g.write(`
        if (${m}.issues.length) {
          payload.issues = payload.issues.concat(${m}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${y}, ...iss.path] : [${y}]
          })));
        }
        
        if (${m}.value === undefined) {
          if (${y} in input) {
            newResult[${y}] = undefined;
          }
        } else {
          newResult[${y}] = ${m}.value;
        }
        
      `);
    }
    g.write("payload.value = newResult;"), g.write("return payload;");
    const S = g.compile();
    return (_, m) => S(p, _, m);
  };
  let i;
  const s = we, a = !jt.jitless, u = a && ao.value, l = t.catchall;
  let d;
  e._zod.parse = (p, g) => {
    d ?? (d = o.value);
    const k = p.value;
    return s(k) ? a && u && (g == null ? void 0 : g.async) === !1 && g.jitless !== !0 ? (i || (i = r(t.shape)), p = i(p, g), l ? tn([], k, p, g, d, e) : p) : n(p, g) : (p.issues.push({
      expected: "object",
      code: "invalid_type",
      input: k,
      inst: e
    }), p);
  };
});
function gt(e, t, n, o) {
  for (const i of e)
    if (i.issues.length === 0)
      return t.value = i.value, t;
  const r = e.filter((i) => !Q(i));
  return r.length === 1 ? (t.value = r[0].value, r[0]) : (t.issues.push({
    code: "invalid_union",
    input: t.value,
    inst: n,
    errors: e.map((i) => i.issues.map((s) => H(s, o, J())))
  }), t);
}
const qr = /* @__PURE__ */ f("$ZodUnion", (e, t) => {
  R.init(e, t), C(e._zod, "optin", () => t.options.some((r) => r._zod.optin === "optional") ? "optional" : void 0), C(e._zod, "optout", () => t.options.some((r) => r._zod.optout === "optional") ? "optional" : void 0), C(e._zod, "values", () => {
    if (t.options.every((r) => r._zod.values))
      return new Set(t.options.flatMap((r) => Array.from(r._zod.values)));
  }), C(e._zod, "pattern", () => {
    if (t.options.every((r) => r._zod.pattern)) {
      const r = t.options.map((i) => i._zod.pattern);
      return new RegExp(`^(${r.map((i) => Ye(i.source)).join("|")})$`);
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
    return s ? Promise.all(a).then((c) => gt(c, r, e, i)) : gt(a, r, e, i);
  };
}), Xr = /* @__PURE__ */ f("$ZodIntersection", (e, t) => {
  R.init(e, t), e._zod.parse = (n, o) => {
    const r = n.value, i = t.left._zod.run({ value: r, issues: [] }, o), s = t.right._zod.run({ value: r, issues: [] }, o);
    return i instanceof Promise || s instanceof Promise ? Promise.all([i, s]).then(([c, u]) => bt(n, c, u)) : bt(n, i, s);
  };
});
function Je(e, t) {
  if (e === t)
    return { valid: !0, data: e };
  if (e instanceof Date && t instanceof Date && +e == +t)
    return { valid: !0, data: e };
  if (ne(e) && ne(t)) {
    const n = Object.keys(t), o = Object.keys(e).filter((i) => n.indexOf(i) !== -1), r = { ...e, ...t };
    for (const i of o) {
      const s = Je(e[i], t[i]);
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
      const r = e[o], i = t[o], s = Je(r, i);
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
function bt(e, t, n) {
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
  if (i.length && r && e.issues.push({ ...r, keys: i }), Q(e))
    return e;
  const s = Je(t.value, n.value);
  if (!s.valid)
    throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(s.mergeErrorPath)}`);
  return e.value = s.data, e;
}
const Yr = /* @__PURE__ */ f("$ZodRecord", (e, t) => {
  R.init(e, t), e._zod.parse = (n, o) => {
    const r = n.value;
    if (!ne(r))
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
            d.issues.length && n.issues.push(...ee(u, d.issues)), n.value[u] = d.value;
          })) : (l.issues.length && n.issues.push(...ee(u, l.issues)), n.value[u] = l.value);
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
        if (typeof a == "string" && qt.test(a) && c.issues.length) {
          const d = t.keyType._zod.run({ value: Number(a), issues: [] }, o);
          if (d instanceof Promise)
            throw new Error("Async schemas not supported in object keys currently");
          d.issues.length === 0 && (c = d);
        }
        if (c.issues.length) {
          t.mode === "loose" ? n.value[a] = r[a] : n.issues.push({
            code: "invalid_key",
            origin: "record",
            issues: c.issues.map((d) => H(d, o, J())),
            input: a,
            path: [a],
            inst: e
          });
          continue;
        }
        const l = t.valueType._zod.run({ value: r[a], issues: [] }, o);
        l instanceof Promise ? i.push(l.then((d) => {
          d.issues.length && n.issues.push(...ee(a, d.issues)), n.value[c.value] = d.value;
        })) : (l.issues.length && n.issues.push(...ee(a, l.issues)), n.value[c.value] = l.value);
      }
    }
    return i.length ? Promise.all(i).then(() => n) : n;
  };
}), Gr = /* @__PURE__ */ f("$ZodEnum", (e, t) => {
  R.init(e, t);
  const n = Dt(t.entries), o = new Set(n);
  e._zod.values = o, e._zod.pattern = new RegExp(`^(${n.filter((r) => co.has(typeof r)).map((r) => typeof r == "string" ? xe(r) : r.toString()).join("|")})$`), e._zod.parse = (r, i) => {
    const s = r.value;
    return o.has(s) || r.issues.push({
      code: "invalid_value",
      values: n,
      input: s,
      inst: e
    }), r;
  };
}), Kr = /* @__PURE__ */ f("$ZodTransform", (e, t) => {
  R.init(e, t), e._zod.parse = (n, o) => {
    if (o.direction === "backward")
      throw new At(e.constructor.name);
    const r = t.transform(n.value, n);
    if (o.async)
      return (r instanceof Promise ? r : Promise.resolve(r)).then((s) => (n.value = s, n));
    if (r instanceof Promise)
      throw new te();
    return n.value = r, n;
  };
});
function vt(e, t) {
  return e.issues.length && t === void 0 ? { issues: [], value: void 0 } : e;
}
const nn = /* @__PURE__ */ f("$ZodOptional", (e, t) => {
  R.init(e, t), e._zod.optin = "optional", e._zod.optout = "optional", C(e._zod, "values", () => t.innerType._zod.values ? /* @__PURE__ */ new Set([...t.innerType._zod.values, void 0]) : void 0), C(e._zod, "pattern", () => {
    const n = t.innerType._zod.pattern;
    return n ? new RegExp(`^(${Ye(n.source)})?$`) : void 0;
  }), e._zod.parse = (n, o) => {
    if (t.innerType._zod.optin === "optional") {
      const r = t.innerType._zod.run(n, o);
      return r instanceof Promise ? r.then((i) => vt(i, n.value)) : vt(r, n.value);
    }
    return n.value === void 0 ? n : t.innerType._zod.run(n, o);
  };
}), Qr = /* @__PURE__ */ f("$ZodExactOptional", (e, t) => {
  nn.init(e, t), C(e._zod, "values", () => t.innerType._zod.values), C(e._zod, "pattern", () => t.innerType._zod.pattern), e._zod.parse = (n, o) => t.innerType._zod.run(n, o);
}), ei = /* @__PURE__ */ f("$ZodNullable", (e, t) => {
  R.init(e, t), C(e._zod, "optin", () => t.innerType._zod.optin), C(e._zod, "optout", () => t.innerType._zod.optout), C(e._zod, "pattern", () => {
    const n = t.innerType._zod.pattern;
    return n ? new RegExp(`^(${Ye(n.source)}|null)$`) : void 0;
  }), C(e._zod, "values", () => t.innerType._zod.values ? /* @__PURE__ */ new Set([...t.innerType._zod.values, null]) : void 0), e._zod.parse = (n, o) => n.value === null ? n : t.innerType._zod.run(n, o);
}), ti = /* @__PURE__ */ f("$ZodDefault", (e, t) => {
  R.init(e, t), e._zod.optin = "optional", C(e._zod, "values", () => t.innerType._zod.values), e._zod.parse = (n, o) => {
    if (o.direction === "backward")
      return t.innerType._zod.run(n, o);
    if (n.value === void 0)
      return n.value = t.defaultValue, n;
    const r = t.innerType._zod.run(n, o);
    return r instanceof Promise ? r.then((i) => yt(i, t)) : yt(r, t);
  };
});
function yt(e, t) {
  return e.value === void 0 && (e.value = t.defaultValue), e;
}
const ni = /* @__PURE__ */ f("$ZodPrefault", (e, t) => {
  R.init(e, t), e._zod.optin = "optional", C(e._zod, "values", () => t.innerType._zod.values), e._zod.parse = (n, o) => (o.direction === "backward" || n.value === void 0 && (n.value = t.defaultValue), t.innerType._zod.run(n, o));
}), oi = /* @__PURE__ */ f("$ZodNonOptional", (e, t) => {
  R.init(e, t), C(e._zod, "values", () => {
    const n = t.innerType._zod.values;
    return n ? new Set([...n].filter((o) => o !== void 0)) : void 0;
  }), e._zod.parse = (n, o) => {
    const r = t.innerType._zod.run(n, o);
    return r instanceof Promise ? r.then((i) => wt(i, e)) : wt(r, e);
  };
});
function wt(e, t) {
  return !e.issues.length && e.value === void 0 && e.issues.push({
    code: "invalid_type",
    expected: "nonoptional",
    input: e.value,
    inst: t
  }), e;
}
const ri = /* @__PURE__ */ f("$ZodCatch", (e, t) => {
  R.init(e, t), C(e._zod, "optin", () => t.innerType._zod.optin), C(e._zod, "optout", () => t.innerType._zod.optout), C(e._zod, "values", () => t.innerType._zod.values), e._zod.parse = (n, o) => {
    if (o.direction === "backward")
      return t.innerType._zod.run(n, o);
    const r = t.innerType._zod.run(n, o);
    return r instanceof Promise ? r.then((i) => (n.value = i.value, i.issues.length && (n.value = t.catchValue({
      ...n,
      error: {
        issues: i.issues.map((s) => H(s, o, J()))
      },
      input: n.value
    }), n.issues = []), n)) : (n.value = r.value, r.issues.length && (n.value = t.catchValue({
      ...n,
      error: {
        issues: r.issues.map((i) => H(i, o, J()))
      },
      input: n.value
    }), n.issues = []), n);
  };
}), ii = /* @__PURE__ */ f("$ZodPipe", (e, t) => {
  R.init(e, t), C(e._zod, "values", () => t.in._zod.values), C(e._zod, "optin", () => t.in._zod.optin), C(e._zod, "optout", () => t.out._zod.optout), C(e._zod, "propValues", () => t.in._zod.propValues), e._zod.parse = (n, o) => {
    if (o.direction === "backward") {
      const i = t.out._zod.run(n, o);
      return i instanceof Promise ? i.then((s) => he(s, t.in, o)) : he(i, t.in, o);
    }
    const r = t.in._zod.run(n, o);
    return r instanceof Promise ? r.then((i) => he(i, t.out, o)) : he(r, t.out, o);
  };
});
function he(e, t, n) {
  return e.issues.length ? (e.aborted = !0, e) : t._zod.run({ value: e.value, issues: e.issues }, n);
}
const si = /* @__PURE__ */ f("$ZodReadonly", (e, t) => {
  R.init(e, t), C(e._zod, "propValues", () => t.innerType._zod.propValues), C(e._zod, "values", () => t.innerType._zod.values), C(e._zod, "optin", () => {
    var n, o;
    return (o = (n = t.innerType) == null ? void 0 : n._zod) == null ? void 0 : o.optin;
  }), C(e._zod, "optout", () => {
    var n, o;
    return (o = (n = t.innerType) == null ? void 0 : n._zod) == null ? void 0 : o.optout;
  }), e._zod.parse = (n, o) => {
    if (o.direction === "backward")
      return t.innerType._zod.run(n, o);
    const r = t.innerType._zod.run(n, o);
    return r instanceof Promise ? r.then(kt) : kt(r);
  };
});
function kt(e) {
  return e.value = Object.freeze(e.value), e;
}
const ai = /* @__PURE__ */ f("$ZodCustom", (e, t) => {
  A.init(e, t), R.init(e, t), e._zod.parse = (n, o) => n, e._zod.check = (n) => {
    const o = n.value, r = t.fn(o);
    if (r instanceof Promise)
      return r.then((i) => zt(i, n, o, e));
    zt(r, n, o, e);
  };
});
function zt(e, t, n, o) {
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
    o._zod.def.params && (r.params = o._zod.def.params), t.issues.push(le(r));
  }
}
var Et;
class ci {
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
function ui() {
  return new ci();
}
(Et = globalThis).__zod_globalRegistry ?? (Et.__zod_globalRegistry = ui());
const ce = globalThis.__zod_globalRegistry;
// @__NO_SIDE_EFFECTS__
function li(e, t) {
  return new e({
    type: "string",
    ...w(t)
  });
}
// @__NO_SIDE_EFFECTS__
function di(e, t) {
  return new e({
    type: "string",
    format: "email",
    check: "string_format",
    abort: !1,
    ...w(t)
  });
}
// @__NO_SIDE_EFFECTS__
function $t(e, t) {
  return new e({
    type: "string",
    format: "guid",
    check: "string_format",
    abort: !1,
    ...w(t)
  });
}
// @__NO_SIDE_EFFECTS__
function fi(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    ...w(t)
  });
}
// @__NO_SIDE_EFFECTS__
function hi(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v4",
    ...w(t)
  });
}
// @__NO_SIDE_EFFECTS__
function pi(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v6",
    ...w(t)
  });
}
// @__NO_SIDE_EFFECTS__
function mi(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v7",
    ...w(t)
  });
}
// @__NO_SIDE_EFFECTS__
function _i(e, t) {
  return new e({
    type: "string",
    format: "url",
    check: "string_format",
    abort: !1,
    ...w(t)
  });
}
// @__NO_SIDE_EFFECTS__
function gi(e, t) {
  return new e({
    type: "string",
    format: "emoji",
    check: "string_format",
    abort: !1,
    ...w(t)
  });
}
// @__NO_SIDE_EFFECTS__
function bi(e, t) {
  return new e({
    type: "string",
    format: "nanoid",
    check: "string_format",
    abort: !1,
    ...w(t)
  });
}
// @__NO_SIDE_EFFECTS__
function vi(e, t) {
  return new e({
    type: "string",
    format: "cuid",
    check: "string_format",
    abort: !1,
    ...w(t)
  });
}
// @__NO_SIDE_EFFECTS__
function yi(e, t) {
  return new e({
    type: "string",
    format: "cuid2",
    check: "string_format",
    abort: !1,
    ...w(t)
  });
}
// @__NO_SIDE_EFFECTS__
function wi(e, t) {
  return new e({
    type: "string",
    format: "ulid",
    check: "string_format",
    abort: !1,
    ...w(t)
  });
}
// @__NO_SIDE_EFFECTS__
function ki(e, t) {
  return new e({
    type: "string",
    format: "xid",
    check: "string_format",
    abort: !1,
    ...w(t)
  });
}
// @__NO_SIDE_EFFECTS__
function zi(e, t) {
  return new e({
    type: "string",
    format: "ksuid",
    check: "string_format",
    abort: !1,
    ...w(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Ei(e, t) {
  return new e({
    type: "string",
    format: "ipv4",
    check: "string_format",
    abort: !1,
    ...w(t)
  });
}
// @__NO_SIDE_EFFECTS__
function $i(e, t) {
  return new e({
    type: "string",
    format: "ipv6",
    check: "string_format",
    abort: !1,
    ...w(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Si(e, t) {
  return new e({
    type: "string",
    format: "cidrv4",
    check: "string_format",
    abort: !1,
    ...w(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Ni(e, t) {
  return new e({
    type: "string",
    format: "cidrv6",
    check: "string_format",
    abort: !1,
    ...w(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Ci(e, t) {
  return new e({
    type: "string",
    format: "base64",
    check: "string_format",
    abort: !1,
    ...w(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Zi(e, t) {
  return new e({
    type: "string",
    format: "base64url",
    check: "string_format",
    abort: !1,
    ...w(t)
  });
}
// @__NO_SIDE_EFFECTS__
function xi(e, t) {
  return new e({
    type: "string",
    format: "e164",
    check: "string_format",
    abort: !1,
    ...w(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Ti(e, t) {
  return new e({
    type: "string",
    format: "jwt",
    check: "string_format",
    abort: !1,
    ...w(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Ri(e, t) {
  return new e({
    type: "string",
    format: "datetime",
    check: "string_format",
    offset: !1,
    local: !1,
    precision: null,
    ...w(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Ii(e, t) {
  return new e({
    type: "string",
    format: "date",
    check: "string_format",
    ...w(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Oi(e, t) {
  return new e({
    type: "string",
    format: "time",
    check: "string_format",
    precision: null,
    ...w(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Pi(e, t) {
  return new e({
    type: "string",
    format: "duration",
    check: "string_format",
    ...w(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Li(e, t) {
  return new e({
    type: "number",
    checks: [],
    ...w(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Ai(e, t) {
  return new e({
    type: "number",
    check: "number_format",
    abort: !1,
    format: "safeint",
    ...w(t)
  });
}
// @__NO_SIDE_EFFECTS__
function ji(e, t) {
  return new e({
    type: "boolean",
    ...w(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Di(e) {
  return new e({
    type: "unknown"
  });
}
// @__NO_SIDE_EFFECTS__
function Mi(e, t) {
  return new e({
    type: "never",
    ...w(t)
  });
}
// @__NO_SIDE_EFFECTS__
function St(e, t) {
  return new Yt({
    check: "less_than",
    ...w(t),
    value: e,
    inclusive: !1
  });
}
// @__NO_SIDE_EFFECTS__
function Le(e, t) {
  return new Yt({
    check: "less_than",
    ...w(t),
    value: e,
    inclusive: !0
  });
}
// @__NO_SIDE_EFFECTS__
function Nt(e, t) {
  return new Gt({
    check: "greater_than",
    ...w(t),
    value: e,
    inclusive: !1
  });
}
// @__NO_SIDE_EFFECTS__
function Ae(e, t) {
  return new Gt({
    check: "greater_than",
    ...w(t),
    value: e,
    inclusive: !0
  });
}
// @__NO_SIDE_EFFECTS__
function Ct(e, t) {
  return new nr({
    check: "multiple_of",
    ...w(t),
    value: e
  });
}
// @__NO_SIDE_EFFECTS__
function on(e, t) {
  return new rr({
    check: "max_length",
    ...w(t),
    maximum: e
  });
}
// @__NO_SIDE_EFFECTS__
function ze(e, t) {
  return new ir({
    check: "min_length",
    ...w(t),
    minimum: e
  });
}
// @__NO_SIDE_EFFECTS__
function rn(e, t) {
  return new sr({
    check: "length_equals",
    ...w(t),
    length: e
  });
}
// @__NO_SIDE_EFFECTS__
function Fi(e, t) {
  return new ar({
    check: "string_format",
    format: "regex",
    ...w(t),
    pattern: e
  });
}
// @__NO_SIDE_EFFECTS__
function Ui(e) {
  return new cr({
    check: "string_format",
    format: "lowercase",
    ...w(e)
  });
}
// @__NO_SIDE_EFFECTS__
function Bi(e) {
  return new ur({
    check: "string_format",
    format: "uppercase",
    ...w(e)
  });
}
// @__NO_SIDE_EFFECTS__
function Ji(e, t) {
  return new lr({
    check: "string_format",
    format: "includes",
    ...w(t),
    includes: e
  });
}
// @__NO_SIDE_EFFECTS__
function Hi(e, t) {
  return new dr({
    check: "string_format",
    format: "starts_with",
    ...w(t),
    prefix: e
  });
}
// @__NO_SIDE_EFFECTS__
function Vi(e, t) {
  return new fr({
    check: "string_format",
    format: "ends_with",
    ...w(t),
    suffix: e
  });
}
// @__NO_SIDE_EFFECTS__
function oe(e) {
  return new hr({
    check: "overwrite",
    tx: e
  });
}
// @__NO_SIDE_EFFECTS__
function Wi(e) {
  return /* @__PURE__ */ oe((t) => t.normalize(e));
}
// @__NO_SIDE_EFFECTS__
function qi() {
  return /* @__PURE__ */ oe((e) => e.trim());
}
// @__NO_SIDE_EFFECTS__
function Xi() {
  return /* @__PURE__ */ oe((e) => e.toLowerCase());
}
// @__NO_SIDE_EFFECTS__
function Yi() {
  return /* @__PURE__ */ oe((e) => e.toUpperCase());
}
// @__NO_SIDE_EFFECTS__
function Gi() {
  return /* @__PURE__ */ oe((e) => so(e));
}
// @__NO_SIDE_EFFECTS__
function Ki(e, t, n) {
  return new e({
    type: "array",
    element: t,
    // get element() {
    //   return element;
    // },
    ...w(n)
  });
}
// @__NO_SIDE_EFFECTS__
function Qi(e, t, n) {
  return new e({
    type: "custom",
    check: "custom",
    fn: t,
    ...w(n)
  });
}
// @__NO_SIDE_EFFECTS__
function es(e) {
  const t = /* @__PURE__ */ ts((n) => (n.addIssue = (o) => {
    if (typeof o == "string")
      n.issues.push(le(o, n.value, t._zod.def));
    else {
      const r = o;
      r.fatal && (r.continue = !1), r.code ?? (r.code = "custom"), r.input ?? (r.input = n.value), r.inst ?? (r.inst = t), r.continue ?? (r.continue = !t._zod.def.abort), n.issues.push(le(r));
    }
  }, e(n.value, n)));
  return t;
}
// @__NO_SIDE_EFFECTS__
function ts(e, t) {
  const n = new A({
    check: "custom",
    ...w(t)
  });
  return n._zod.check = e, n;
}
function sn(e) {
  let t = (e == null ? void 0 : e.target) ?? "draft-2020-12";
  return t === "draft-4" && (t = "draft-04"), t === "draft-7" && (t = "draft-07"), {
    processors: e.processors ?? {},
    metadataRegistry: (e == null ? void 0 : e.metadata) ?? ce,
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
function O(e, t, n = { path: [], schemaPath: [] }) {
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
    const p = {
      ...n,
      schemaPath: [...n.schemaPath, e],
      path: n.path
    };
    if (e._zod.processJSONSchema)
      e._zod.processJSONSchema(t, s.schema, p);
    else {
      const k = s.schema, b = t.processors[r.type];
      if (!b)
        throw new Error(`[toJSONSchema]: Non-representable type encountered: ${r.type}`);
      b(e, t, k, p);
    }
    const g = e._zod.parent;
    g && (s.ref || (s.ref = g), O(g, t, p), t.seen.get(g).isParent = !0);
  }
  const c = t.metadataRegistry.get(e);
  return c && Object.assign(s.schema, c), t.io === "input" && P(e) && (delete s.schema.examples, delete s.schema.default), t.io === "input" && s.schema._prefault && ((o = s.schema).default ?? (o.default = s.schema._prefault)), delete s.schema._prefault, t.seen.get(e).schema;
}
function an(e, t) {
  var s, a, c, u;
  const n = e.seen.get(t);
  if (!n)
    throw new Error("Unprocessed schema. This is a bug in Zod.");
  const o = /* @__PURE__ */ new Map();
  for (const l of e.seen.entries()) {
    const d = (s = e.metadataRegistry.get(l[0])) == null ? void 0 : s.id;
    if (d) {
      const p = o.get(d);
      if (p && p !== l[0])
        throw new Error(`Duplicate schema id "${d}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`);
      o.set(d, l[0]);
    }
  }
  const r = (l) => {
    var b;
    const d = e.target === "draft-2020-12" ? "$defs" : "definitions";
    if (e.external) {
      const $ = (b = e.external.registry.get(l[0])) == null ? void 0 : b.id, z = e.external.uri ?? ((h) => h);
      if ($)
        return { ref: z($) };
      const S = l[1].defId ?? l[1].schema.id ?? `schema${e.counter++}`;
      return l[1].defId = S, { defId: S, ref: `${z("__shared")}#/${d}/${S}` };
    }
    if (l[1] === n)
      return { ref: "#" };
    const g = `#/${d}/`, k = l[1].schema.id ?? `__schema${e.counter++}`;
    return { defId: k, ref: g + k };
  }, i = (l) => {
    if (l[1].schema.$ref)
      return;
    const d = l[1], { ref: p, defId: g } = r(l);
    d.def = { ...d.schema }, g && (d.defId = g);
    const k = d.schema;
    for (const b in k)
      delete k[b];
    k.$ref = p;
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
      const g = (c = e.external.registry.get(l[0])) == null ? void 0 : c.id;
      if (t !== l[0] && g) {
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
function cn(e, t) {
  var s, a, c;
  const n = e.seen.get(t);
  if (!n)
    throw new Error("Unprocessed schema. This is a bug in Zod.");
  const o = (u) => {
    const l = e.seen.get(u);
    if (l.ref === null)
      return;
    const d = l.def ?? l.schema, p = { ...d }, g = l.ref;
    if (l.ref = null, g) {
      o(g);
      const b = e.seen.get(g), $ = b.schema;
      if ($.$ref && (e.target === "draft-07" || e.target === "draft-04" || e.target === "openapi-3.0") ? (d.allOf = d.allOf ?? [], d.allOf.push($)) : Object.assign(d, $), Object.assign(d, p), u._zod.parent === g)
        for (const S in d)
          S === "$ref" || S === "allOf" || S in p || delete d[S];
      if ($.$ref && b.def)
        for (const S in d)
          S === "$ref" || S === "allOf" || S in b.def && JSON.stringify(d[S]) === JSON.stringify(b.def[S]) && delete d[S];
    }
    const k = u._zod.parent;
    if (k && k !== g) {
      o(k);
      const b = e.seen.get(k);
      if (b != null && b.schema.$ref && (d.$ref = b.schema.$ref, b.def))
        for (const $ in d)
          $ === "$ref" || $ === "allOf" || $ in b.def && JSON.stringify(d[$]) === JSON.stringify(b.def[$]) && delete d[$];
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
          input: Ee(t, "input", e.processors),
          output: Ee(t, "output", e.processors)
        }
      },
      enumerable: !1,
      writable: !1
    }), u;
  } catch {
    throw new Error("Error converting schema to JSON.");
  }
}
function P(e, t) {
  const n = t ?? { seen: /* @__PURE__ */ new Set() };
  if (n.seen.has(e))
    return !1;
  n.seen.add(e);
  const o = e._zod.def;
  if (o.type === "transform")
    return !0;
  if (o.type === "array")
    return P(o.element, n);
  if (o.type === "set")
    return P(o.valueType, n);
  if (o.type === "lazy")
    return P(o.getter(), n);
  if (o.type === "promise" || o.type === "optional" || o.type === "nonoptional" || o.type === "nullable" || o.type === "readonly" || o.type === "default" || o.type === "prefault")
    return P(o.innerType, n);
  if (o.type === "intersection")
    return P(o.left, n) || P(o.right, n);
  if (o.type === "record" || o.type === "map")
    return P(o.keyType, n) || P(o.valueType, n);
  if (o.type === "pipe")
    return P(o.in, n) || P(o.out, n);
  if (o.type === "object") {
    for (const r in o.shape)
      if (P(o.shape[r], n))
        return !0;
    return !1;
  }
  if (o.type === "union") {
    for (const r of o.options)
      if (P(r, n))
        return !0;
    return !1;
  }
  if (o.type === "tuple") {
    for (const r of o.items)
      if (P(r, n))
        return !0;
    return !!(o.rest && P(o.rest, n));
  }
  return !1;
}
const ns = (e, t = {}) => (n) => {
  const o = sn({ ...n, processors: t });
  return O(e, o), an(o, e), cn(o, e);
}, Ee = (e, t, n = {}) => (o) => {
  const { libraryOptions: r, target: i } = o ?? {}, s = sn({ ...r ?? {}, target: i, io: t, processors: n });
  return O(e, s), an(s, e), cn(s, e);
}, os = {
  guid: "uuid",
  url: "uri",
  datetime: "date-time",
  json_string: "json-string",
  regex: ""
  // do not set
}, rs = (e, t, n, o) => {
  const r = n;
  r.type = "string";
  const { minimum: i, maximum: s, format: a, patterns: c, contentEncoding: u } = e._zod.bag;
  if (typeof i == "number" && (r.minLength = i), typeof s == "number" && (r.maxLength = s), a && (r.format = os[a] ?? a, r.format === "" && delete r.format, a === "time" && delete r.format), u && (r.contentEncoding = u), c && c.size > 0) {
    const l = [...c];
    l.length === 1 ? r.pattern = l[0].source : l.length > 1 && (r.allOf = [
      ...l.map((d) => ({
        ...t.target === "draft-07" || t.target === "draft-04" || t.target === "openapi-3.0" ? { type: "string" } : {},
        pattern: d.source
      }))
    ]);
  }
}, is = (e, t, n, o) => {
  const r = n, { minimum: i, maximum: s, format: a, multipleOf: c, exclusiveMaximum: u, exclusiveMinimum: l } = e._zod.bag;
  typeof a == "string" && a.includes("int") ? r.type = "integer" : r.type = "number", typeof l == "number" && (t.target === "draft-04" || t.target === "openapi-3.0" ? (r.minimum = l, r.exclusiveMinimum = !0) : r.exclusiveMinimum = l), typeof i == "number" && (r.minimum = i, typeof l == "number" && t.target !== "draft-04" && (l >= i ? delete r.minimum : delete r.exclusiveMinimum)), typeof u == "number" && (t.target === "draft-04" || t.target === "openapi-3.0" ? (r.maximum = u, r.exclusiveMaximum = !0) : r.exclusiveMaximum = u), typeof s == "number" && (r.maximum = s, typeof u == "number" && t.target !== "draft-04" && (u <= s ? delete r.maximum : delete r.exclusiveMaximum)), typeof c == "number" && (r.multipleOf = c);
}, ss = (e, t, n, o) => {
  n.type = "boolean";
}, as = (e, t, n, o) => {
  n.not = {};
}, cs = (e, t, n, o) => {
}, us = (e, t, n, o) => {
  const r = e._zod.def, i = Dt(r.entries);
  i.every((s) => typeof s == "number") && (n.type = "number"), i.every((s) => typeof s == "string") && (n.type = "string"), n.enum = i;
}, ls = (e, t, n, o) => {
  if (t.unrepresentable === "throw")
    throw new Error("Custom types cannot be represented in JSON Schema");
}, ds = (e, t, n, o) => {
  if (t.unrepresentable === "throw")
    throw new Error("Transforms cannot be represented in JSON Schema");
}, fs = (e, t, n, o) => {
  const r = n, i = e._zod.def, { minimum: s, maximum: a } = e._zod.bag;
  typeof s == "number" && (r.minItems = s), typeof a == "number" && (r.maxItems = a), r.type = "array", r.items = O(i.element, t, { ...o, path: [...o.path, "items"] });
}, hs = (e, t, n, o) => {
  var u;
  const r = n, i = e._zod.def;
  r.type = "object", r.properties = {};
  const s = i.shape;
  for (const l in s)
    r.properties[l] = O(s[l], t, {
      ...o,
      path: [...o.path, "properties", l]
    });
  const a = new Set(Object.keys(s)), c = new Set([...a].filter((l) => {
    const d = i.shape[l]._zod;
    return t.io === "input" ? d.optin === void 0 : d.optout === void 0;
  }));
  c.size > 0 && (r.required = Array.from(c)), ((u = i.catchall) == null ? void 0 : u._zod.def.type) === "never" ? r.additionalProperties = !1 : i.catchall ? i.catchall && (r.additionalProperties = O(i.catchall, t, {
    ...o,
    path: [...o.path, "additionalProperties"]
  })) : t.io === "output" && (r.additionalProperties = !1);
}, ps = (e, t, n, o) => {
  const r = e._zod.def, i = r.inclusive === !1, s = r.options.map((a, c) => O(a, t, {
    ...o,
    path: [...o.path, i ? "oneOf" : "anyOf", c]
  }));
  i ? n.oneOf = s : n.anyOf = s;
}, ms = (e, t, n, o) => {
  const r = e._zod.def, i = O(r.left, t, {
    ...o,
    path: [...o.path, "allOf", 0]
  }), s = O(r.right, t, {
    ...o,
    path: [...o.path, "allOf", 1]
  }), a = (u) => "allOf" in u && Object.keys(u).length === 1, c = [
    ...a(i) ? i.allOf : [i],
    ...a(s) ? s.allOf : [s]
  ];
  n.allOf = c;
}, _s = (e, t, n, o) => {
  const r = n, i = e._zod.def;
  r.type = "object";
  const s = i.keyType, a = s._zod.bag, c = a == null ? void 0 : a.patterns;
  if (i.mode === "loose" && c && c.size > 0) {
    const l = O(i.valueType, t, {
      ...o,
      path: [...o.path, "patternProperties", "*"]
    });
    r.patternProperties = {};
    for (const d of c)
      r.patternProperties[d.source] = l;
  } else
    (t.target === "draft-07" || t.target === "draft-2020-12") && (r.propertyNames = O(i.keyType, t, {
      ...o,
      path: [...o.path, "propertyNames"]
    })), r.additionalProperties = O(i.valueType, t, {
      ...o,
      path: [...o.path, "additionalProperties"]
    });
  const u = s._zod.values;
  if (u) {
    const l = [...u].filter((d) => typeof d == "string" || typeof d == "number");
    l.length > 0 && (r.required = l);
  }
}, gs = (e, t, n, o) => {
  const r = e._zod.def, i = O(r.innerType, t, o), s = t.seen.get(e);
  t.target === "openapi-3.0" ? (s.ref = r.innerType, n.nullable = !0) : n.anyOf = [i, { type: "null" }];
}, bs = (e, t, n, o) => {
  const r = e._zod.def;
  O(r.innerType, t, o);
  const i = t.seen.get(e);
  i.ref = r.innerType;
}, vs = (e, t, n, o) => {
  const r = e._zod.def;
  O(r.innerType, t, o);
  const i = t.seen.get(e);
  i.ref = r.innerType, n.default = JSON.parse(JSON.stringify(r.defaultValue));
}, ys = (e, t, n, o) => {
  const r = e._zod.def;
  O(r.innerType, t, o);
  const i = t.seen.get(e);
  i.ref = r.innerType, t.io === "input" && (n._prefault = JSON.parse(JSON.stringify(r.defaultValue)));
}, ws = (e, t, n, o) => {
  const r = e._zod.def;
  O(r.innerType, t, o);
  const i = t.seen.get(e);
  i.ref = r.innerType;
  let s;
  try {
    s = r.catchValue(void 0);
  } catch {
    throw new Error("Dynamic catch values are not supported in JSON Schema");
  }
  n.default = s;
}, ks = (e, t, n, o) => {
  const r = e._zod.def, i = t.io === "input" ? r.in._zod.def.type === "transform" ? r.out : r.in : r.out;
  O(i, t, o);
  const s = t.seen.get(e);
  s.ref = i;
}, zs = (e, t, n, o) => {
  const r = e._zod.def;
  O(r.innerType, t, o);
  const i = t.seen.get(e);
  i.ref = r.innerType, n.readOnly = !0;
}, un = (e, t, n, o) => {
  const r = e._zod.def;
  O(r.innerType, t, o);
  const i = t.seen.get(e);
  i.ref = r.innerType;
}, Es = /* @__PURE__ */ f("ZodISODateTime", (e, t) => {
  Nr.init(e, t), T.init(e, t);
});
function $s(e) {
  return /* @__PURE__ */ Ri(Es, e);
}
const Ss = /* @__PURE__ */ f("ZodISODate", (e, t) => {
  Cr.init(e, t), T.init(e, t);
});
function Ns(e) {
  return /* @__PURE__ */ Ii(Ss, e);
}
const Cs = /* @__PURE__ */ f("ZodISOTime", (e, t) => {
  Zr.init(e, t), T.init(e, t);
});
function Zs(e) {
  return /* @__PURE__ */ Oi(Cs, e);
}
const xs = /* @__PURE__ */ f("ZodISODuration", (e, t) => {
  xr.init(e, t), T.init(e, t);
});
function Ts(e) {
  return /* @__PURE__ */ Pi(xs, e);
}
const Rs = (e, t) => {
  Bt.init(e, t), e.name = "ZodError", Object.defineProperties(e, {
    format: {
      value: (n) => yo(e, n)
      // enumerable: false,
    },
    flatten: {
      value: (n) => vo(e, n)
      // enumerable: false,
    },
    addIssue: {
      value: (n) => {
        e.issues.push(n), e.message = JSON.stringify(e.issues, Be, 2);
      }
      // enumerable: false,
    },
    addIssues: {
      value: (n) => {
        e.issues.push(...n), e.message = JSON.stringify(e.issues, Be, 2);
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
}, D = f("ZodError", Rs, {
  Parent: Error
}), Is = /* @__PURE__ */ Ke(D), Os = /* @__PURE__ */ Qe(D), Ps = /* @__PURE__ */ Te(D), Ls = /* @__PURE__ */ Re(D), As = /* @__PURE__ */ zo(D), js = /* @__PURE__ */ Eo(D), Ds = /* @__PURE__ */ $o(D), Ms = /* @__PURE__ */ So(D), Fs = /* @__PURE__ */ No(D), Us = /* @__PURE__ */ Co(D), Bs = /* @__PURE__ */ Zo(D), Js = /* @__PURE__ */ xo(D), I = /* @__PURE__ */ f("ZodType", (e, t) => (R.init(e, t), Object.assign(e["~standard"], {
  jsonSchema: {
    input: Ee(e, "input"),
    output: Ee(e, "output")
  }
}), e.toJSONSchema = ns(e, {}), e.def = t, e.type = t.type, Object.defineProperty(e, "_def", { value: t }), e.check = (...n) => e.clone(V(t, {
  checks: [
    ...t.checks ?? [],
    ...n.map((o) => typeof o == "function" ? { _zod: { check: o, def: { check: "custom" }, onattach: [] } } : o)
  ]
}), {
  parent: !0
}), e.with = e.check, e.clone = (n, o) => W(e, n, o), e.brand = () => e, e.register = (n, o) => (n.add(e, o), e), e.parse = (n, o) => Is(e, n, o, { callee: e.parse }), e.safeParse = (n, o) => Ps(e, n, o), e.parseAsync = async (n, o) => Os(e, n, o, { callee: e.parseAsync }), e.safeParseAsync = async (n, o) => Ls(e, n, o), e.spa = e.safeParseAsync, e.encode = (n, o) => As(e, n, o), e.decode = (n, o) => js(e, n, o), e.encodeAsync = async (n, o) => Ds(e, n, o), e.decodeAsync = async (n, o) => Ms(e, n, o), e.safeEncode = (n, o) => Fs(e, n, o), e.safeDecode = (n, o) => Us(e, n, o), e.safeEncodeAsync = async (n, o) => Bs(e, n, o), e.safeDecodeAsync = async (n, o) => Js(e, n, o), e.refine = (n, o) => e.check(Aa(n, o)), e.superRefine = (n) => e.check(ja(n)), e.overwrite = (n) => e.check(/* @__PURE__ */ oe(n)), e.optional = () => Tt(e), e.exactOptional = () => $a(e), e.nullable = () => Rt(e), e.nullish = () => Tt(Rt(e)), e.nonoptional = (n) => xa(e, n), e.array = () => Se(e), e.or = (n) => _a([e, n]), e.and = (n) => ba(e, n), e.transform = (n) => It(e, za(n)), e.default = (n) => Na(e, n), e.prefault = (n) => Za(e, n), e.catch = (n) => Ra(e, n), e.pipe = (n) => It(e, n), e.readonly = () => Pa(e), e.describe = (n) => {
  const o = e.clone();
  return ce.add(o, { description: n }), o;
}, Object.defineProperty(e, "description", {
  get() {
    var n;
    return (n = ce.get(e)) == null ? void 0 : n.description;
  },
  configurable: !0
}), e.meta = (...n) => {
  if (n.length === 0)
    return ce.get(e);
  const o = e.clone();
  return ce.add(o, n[0]), o;
}, e.isOptional = () => e.safeParse(void 0).success, e.isNullable = () => e.safeParse(null).success, e.apply = (n) => n(e), e)), ln = /* @__PURE__ */ f("_ZodString", (e, t) => {
  et.init(e, t), I.init(e, t), e._zod.processJSONSchema = (o, r, i) => rs(e, o, r);
  const n = e._zod.bag;
  e.format = n.format ?? null, e.minLength = n.minimum ?? null, e.maxLength = n.maximum ?? null, e.regex = (...o) => e.check(/* @__PURE__ */ Fi(...o)), e.includes = (...o) => e.check(/* @__PURE__ */ Ji(...o)), e.startsWith = (...o) => e.check(/* @__PURE__ */ Hi(...o)), e.endsWith = (...o) => e.check(/* @__PURE__ */ Vi(...o)), e.min = (...o) => e.check(/* @__PURE__ */ ze(...o)), e.max = (...o) => e.check(/* @__PURE__ */ on(...o)), e.length = (...o) => e.check(/* @__PURE__ */ rn(...o)), e.nonempty = (...o) => e.check(/* @__PURE__ */ ze(1, ...o)), e.lowercase = (o) => e.check(/* @__PURE__ */ Ui(o)), e.uppercase = (o) => e.check(/* @__PURE__ */ Bi(o)), e.trim = () => e.check(/* @__PURE__ */ qi()), e.normalize = (...o) => e.check(/* @__PURE__ */ Wi(...o)), e.toLowerCase = () => e.check(/* @__PURE__ */ Xi()), e.toUpperCase = () => e.check(/* @__PURE__ */ Yi()), e.slugify = () => e.check(/* @__PURE__ */ Gi());
}), dn = /* @__PURE__ */ f("ZodString", (e, t) => {
  et.init(e, t), ln.init(e, t), e.email = (n) => e.check(/* @__PURE__ */ di(Hs, n)), e.url = (n) => e.check(/* @__PURE__ */ _i(Vs, n)), e.jwt = (n) => e.check(/* @__PURE__ */ Ti(aa, n)), e.emoji = (n) => e.check(/* @__PURE__ */ gi(Ws, n)), e.guid = (n) => e.check(/* @__PURE__ */ $t(Zt, n)), e.uuid = (n) => e.check(/* @__PURE__ */ fi(pe, n)), e.uuidv4 = (n) => e.check(/* @__PURE__ */ hi(pe, n)), e.uuidv6 = (n) => e.check(/* @__PURE__ */ pi(pe, n)), e.uuidv7 = (n) => e.check(/* @__PURE__ */ mi(pe, n)), e.nanoid = (n) => e.check(/* @__PURE__ */ bi(qs, n)), e.guid = (n) => e.check(/* @__PURE__ */ $t(Zt, n)), e.cuid = (n) => e.check(/* @__PURE__ */ vi(Xs, n)), e.cuid2 = (n) => e.check(/* @__PURE__ */ yi(Ys, n)), e.ulid = (n) => e.check(/* @__PURE__ */ wi(Gs, n)), e.base64 = (n) => e.check(/* @__PURE__ */ Ci(ra, n)), e.base64url = (n) => e.check(/* @__PURE__ */ Zi(ia, n)), e.xid = (n) => e.check(/* @__PURE__ */ ki(Ks, n)), e.ksuid = (n) => e.check(/* @__PURE__ */ zi(Qs, n)), e.ipv4 = (n) => e.check(/* @__PURE__ */ Ei(ea, n)), e.ipv6 = (n) => e.check(/* @__PURE__ */ $i(ta, n)), e.cidrv4 = (n) => e.check(/* @__PURE__ */ Si(na, n)), e.cidrv6 = (n) => e.check(/* @__PURE__ */ Ni(oa, n)), e.e164 = (n) => e.check(/* @__PURE__ */ xi(sa, n)), e.datetime = (n) => e.check($s(n)), e.date = (n) => e.check(Ns(n)), e.time = (n) => e.check(Zs(n)), e.duration = (n) => e.check(Ts(n));
});
function L(e) {
  return /* @__PURE__ */ li(dn, e);
}
const T = /* @__PURE__ */ f("ZodStringFormat", (e, t) => {
  x.init(e, t), ln.init(e, t);
}), Hs = /* @__PURE__ */ f("ZodEmail", (e, t) => {
  br.init(e, t), T.init(e, t);
}), Zt = /* @__PURE__ */ f("ZodGUID", (e, t) => {
  _r.init(e, t), T.init(e, t);
}), pe = /* @__PURE__ */ f("ZodUUID", (e, t) => {
  gr.init(e, t), T.init(e, t);
}), Vs = /* @__PURE__ */ f("ZodURL", (e, t) => {
  vr.init(e, t), T.init(e, t);
}), Ws = /* @__PURE__ */ f("ZodEmoji", (e, t) => {
  yr.init(e, t), T.init(e, t);
}), qs = /* @__PURE__ */ f("ZodNanoID", (e, t) => {
  wr.init(e, t), T.init(e, t);
}), Xs = /* @__PURE__ */ f("ZodCUID", (e, t) => {
  kr.init(e, t), T.init(e, t);
}), Ys = /* @__PURE__ */ f("ZodCUID2", (e, t) => {
  zr.init(e, t), T.init(e, t);
}), Gs = /* @__PURE__ */ f("ZodULID", (e, t) => {
  Er.init(e, t), T.init(e, t);
}), Ks = /* @__PURE__ */ f("ZodXID", (e, t) => {
  $r.init(e, t), T.init(e, t);
}), Qs = /* @__PURE__ */ f("ZodKSUID", (e, t) => {
  Sr.init(e, t), T.init(e, t);
}), ea = /* @__PURE__ */ f("ZodIPv4", (e, t) => {
  Tr.init(e, t), T.init(e, t);
}), ta = /* @__PURE__ */ f("ZodIPv6", (e, t) => {
  Rr.init(e, t), T.init(e, t);
}), na = /* @__PURE__ */ f("ZodCIDRv4", (e, t) => {
  Ir.init(e, t), T.init(e, t);
}), oa = /* @__PURE__ */ f("ZodCIDRv6", (e, t) => {
  Or.init(e, t), T.init(e, t);
}), ra = /* @__PURE__ */ f("ZodBase64", (e, t) => {
  Pr.init(e, t), T.init(e, t);
}), ia = /* @__PURE__ */ f("ZodBase64URL", (e, t) => {
  Ar.init(e, t), T.init(e, t);
}), sa = /* @__PURE__ */ f("ZodE164", (e, t) => {
  jr.init(e, t), T.init(e, t);
}), aa = /* @__PURE__ */ f("ZodJWT", (e, t) => {
  Mr.init(e, t), T.init(e, t);
}), tt = /* @__PURE__ */ f("ZodNumber", (e, t) => {
  Qt.init(e, t), I.init(e, t), e._zod.processJSONSchema = (o, r, i) => is(e, o, r), e.gt = (o, r) => e.check(/* @__PURE__ */ Nt(o, r)), e.gte = (o, r) => e.check(/* @__PURE__ */ Ae(o, r)), e.min = (o, r) => e.check(/* @__PURE__ */ Ae(o, r)), e.lt = (o, r) => e.check(/* @__PURE__ */ St(o, r)), e.lte = (o, r) => e.check(/* @__PURE__ */ Le(o, r)), e.max = (o, r) => e.check(/* @__PURE__ */ Le(o, r)), e.int = (o) => e.check(xt(o)), e.safe = (o) => e.check(xt(o)), e.positive = (o) => e.check(/* @__PURE__ */ Nt(0, o)), e.nonnegative = (o) => e.check(/* @__PURE__ */ Ae(0, o)), e.negative = (o) => e.check(/* @__PURE__ */ St(0, o)), e.nonpositive = (o) => e.check(/* @__PURE__ */ Le(0, o)), e.multipleOf = (o, r) => e.check(/* @__PURE__ */ Ct(o, r)), e.step = (o, r) => e.check(/* @__PURE__ */ Ct(o, r)), e.finite = () => e;
  const n = e._zod.bag;
  e.minValue = Math.max(n.minimum ?? Number.NEGATIVE_INFINITY, n.exclusiveMinimum ?? Number.NEGATIVE_INFINITY) ?? null, e.maxValue = Math.min(n.maximum ?? Number.POSITIVE_INFINITY, n.exclusiveMaximum ?? Number.POSITIVE_INFINITY) ?? null, e.isInt = (n.format ?? "").includes("int") || Number.isSafeInteger(n.multipleOf ?? 0.5), e.isFinite = !0, e.format = n.format ?? null;
});
function ue(e) {
  return /* @__PURE__ */ Li(tt, e);
}
const ca = /* @__PURE__ */ f("ZodNumberFormat", (e, t) => {
  Fr.init(e, t), tt.init(e, t);
});
function xt(e) {
  return /* @__PURE__ */ Ai(ca, e);
}
const fn = /* @__PURE__ */ f("ZodBoolean", (e, t) => {
  Ur.init(e, t), I.init(e, t), e._zod.processJSONSchema = (n, o, r) => ss(e, n, o);
});
function ua(e) {
  return /* @__PURE__ */ ji(fn, e);
}
const la = /* @__PURE__ */ f("ZodUnknown", (e, t) => {
  Br.init(e, t), I.init(e, t), e._zod.processJSONSchema = (n, o, r) => cs();
});
function $e() {
  return /* @__PURE__ */ Di(la);
}
const da = /* @__PURE__ */ f("ZodNever", (e, t) => {
  Jr.init(e, t), I.init(e, t), e._zod.processJSONSchema = (n, o, r) => as(e, n, o);
});
function fa(e) {
  return /* @__PURE__ */ Mi(da, e);
}
const ha = /* @__PURE__ */ f("ZodArray", (e, t) => {
  Hr.init(e, t), I.init(e, t), e._zod.processJSONSchema = (n, o, r) => fs(e, n, o, r), e.element = t.element, e.min = (n, o) => e.check(/* @__PURE__ */ ze(n, o)), e.nonempty = (n) => e.check(/* @__PURE__ */ ze(1, n)), e.max = (n, o) => e.check(/* @__PURE__ */ on(n, o)), e.length = (n, o) => e.check(/* @__PURE__ */ rn(n, o)), e.unwrap = () => e.element;
});
function Se(e, t) {
  return /* @__PURE__ */ Ki(ha, e, t);
}
const pa = /* @__PURE__ */ f("ZodObject", (e, t) => {
  Wr.init(e, t), I.init(e, t), e._zod.processJSONSchema = (n, o, r) => hs(e, n, o, r), C(e, "shape", () => t.shape), e.keyof = () => wa(Object.keys(e._zod.def.shape)), e.catchall = (n) => e.clone({ ...e._zod.def, catchall: n }), e.passthrough = () => e.clone({ ...e._zod.def, catchall: $e() }), e.loose = () => e.clone({ ...e._zod.def, catchall: $e() }), e.strict = () => e.clone({ ...e._zod.def, catchall: fa() }), e.strip = () => e.clone({ ...e._zod.def, catchall: void 0 }), e.extend = (n) => po(e, n), e.safeExtend = (n) => mo(e, n), e.merge = (n) => _o(e, n), e.pick = (n) => fo(e, n), e.omit = (n) => ho(e, n), e.partial = (...n) => go(nt, e, n[0]), e.required = (...n) => bo(pn, e, n[0]);
});
function Oe(e, t) {
  const n = {
    type: "object",
    shape: e ?? {},
    ...w(t)
  };
  return new pa(n);
}
const ma = /* @__PURE__ */ f("ZodUnion", (e, t) => {
  qr.init(e, t), I.init(e, t), e._zod.processJSONSchema = (n, o, r) => ps(e, n, o, r), e.options = t.options;
});
function _a(e, t) {
  return new ma({
    type: "union",
    options: e,
    ...w(t)
  });
}
const ga = /* @__PURE__ */ f("ZodIntersection", (e, t) => {
  Xr.init(e, t), I.init(e, t), e._zod.processJSONSchema = (n, o, r) => ms(e, n, o, r);
});
function ba(e, t) {
  return new ga({
    type: "intersection",
    left: e,
    right: t
  });
}
const va = /* @__PURE__ */ f("ZodRecord", (e, t) => {
  Yr.init(e, t), I.init(e, t), e._zod.processJSONSchema = (n, o, r) => _s(e, n, o, r), e.keyType = t.keyType, e.valueType = t.valueType;
});
function ya(e, t, n) {
  return new va({
    type: "record",
    keyType: e,
    valueType: t,
    ...w(n)
  });
}
const Ne = /* @__PURE__ */ f("ZodEnum", (e, t) => {
  Gr.init(e, t), I.init(e, t), e._zod.processJSONSchema = (o, r, i) => us(e, o, r), e.enum = t.entries, e.options = Object.values(t.entries);
  const n = new Set(Object.keys(t.entries));
  e.extract = (o, r) => {
    const i = {};
    for (const s of o)
      if (n.has(s))
        i[s] = t.entries[s];
      else
        throw new Error(`Key ${s} not found in enum`);
    return new Ne({
      ...t,
      checks: [],
      ...w(r),
      entries: i
    });
  }, e.exclude = (o, r) => {
    const i = { ...t.entries };
    for (const s of o)
      if (n.has(s))
        delete i[s];
      else
        throw new Error(`Key ${s} not found in enum`);
    return new Ne({
      ...t,
      checks: [],
      ...w(r),
      entries: i
    });
  };
});
function wa(e, t) {
  const n = Array.isArray(e) ? Object.fromEntries(e.map((o) => [o, o])) : e;
  return new Ne({
    type: "enum",
    entries: n,
    ...w(t)
  });
}
const ka = /* @__PURE__ */ f("ZodTransform", (e, t) => {
  Kr.init(e, t), I.init(e, t), e._zod.processJSONSchema = (n, o, r) => ds(e, n), e._zod.parse = (n, o) => {
    if (o.direction === "backward")
      throw new At(e.constructor.name);
    n.addIssue = (i) => {
      if (typeof i == "string")
        n.issues.push(le(i, n.value, t));
      else {
        const s = i;
        s.fatal && (s.continue = !1), s.code ?? (s.code = "custom"), s.input ?? (s.input = n.value), s.inst ?? (s.inst = e), n.issues.push(le(s));
      }
    };
    const r = t.transform(n.value, n);
    return r instanceof Promise ? r.then((i) => (n.value = i, n)) : (n.value = r, n);
  };
});
function za(e) {
  return new ka({
    type: "transform",
    transform: e
  });
}
const nt = /* @__PURE__ */ f("ZodOptional", (e, t) => {
  nn.init(e, t), I.init(e, t), e._zod.processJSONSchema = (n, o, r) => un(e, n, o, r), e.unwrap = () => e._zod.def.innerType;
});
function Tt(e) {
  return new nt({
    type: "optional",
    innerType: e
  });
}
const Ea = /* @__PURE__ */ f("ZodExactOptional", (e, t) => {
  Qr.init(e, t), I.init(e, t), e._zod.processJSONSchema = (n, o, r) => un(e, n, o, r), e.unwrap = () => e._zod.def.innerType;
});
function $a(e) {
  return new Ea({
    type: "optional",
    innerType: e
  });
}
const Sa = /* @__PURE__ */ f("ZodNullable", (e, t) => {
  ei.init(e, t), I.init(e, t), e._zod.processJSONSchema = (n, o, r) => gs(e, n, o, r), e.unwrap = () => e._zod.def.innerType;
});
function Rt(e) {
  return new Sa({
    type: "nullable",
    innerType: e
  });
}
const hn = /* @__PURE__ */ f("ZodDefault", (e, t) => {
  ti.init(e, t), I.init(e, t), e._zod.processJSONSchema = (n, o, r) => vs(e, n, o, r), e.unwrap = () => e._zod.def.innerType, e.removeDefault = e.unwrap;
});
function Na(e, t) {
  return new hn({
    type: "default",
    innerType: e,
    get defaultValue() {
      return typeof t == "function" ? t() : Ft(t);
    }
  });
}
const Ca = /* @__PURE__ */ f("ZodPrefault", (e, t) => {
  ni.init(e, t), I.init(e, t), e._zod.processJSONSchema = (n, o, r) => ys(e, n, o, r), e.unwrap = () => e._zod.def.innerType;
});
function Za(e, t) {
  return new Ca({
    type: "prefault",
    innerType: e,
    get defaultValue() {
      return typeof t == "function" ? t() : Ft(t);
    }
  });
}
const pn = /* @__PURE__ */ f("ZodNonOptional", (e, t) => {
  oi.init(e, t), I.init(e, t), e._zod.processJSONSchema = (n, o, r) => bs(e, n, o, r), e.unwrap = () => e._zod.def.innerType;
});
function xa(e, t) {
  return new pn({
    type: "nonoptional",
    innerType: e,
    ...w(t)
  });
}
const Ta = /* @__PURE__ */ f("ZodCatch", (e, t) => {
  ri.init(e, t), I.init(e, t), e._zod.processJSONSchema = (n, o, r) => ws(e, n, o, r), e.unwrap = () => e._zod.def.innerType, e.removeCatch = e.unwrap;
});
function Ra(e, t) {
  return new Ta({
    type: "catch",
    innerType: e,
    catchValue: typeof t == "function" ? t : () => t
  });
}
const Ia = /* @__PURE__ */ f("ZodPipe", (e, t) => {
  ii.init(e, t), I.init(e, t), e._zod.processJSONSchema = (n, o, r) => ks(e, n, o, r), e.in = t.in, e.out = t.out;
});
function It(e, t) {
  return new Ia({
    type: "pipe",
    in: e,
    out: t
    // ...util.normalizeParams(params),
  });
}
const Oa = /* @__PURE__ */ f("ZodReadonly", (e, t) => {
  si.init(e, t), I.init(e, t), e._zod.processJSONSchema = (n, o, r) => zs(e, n, o, r), e.unwrap = () => e._zod.def.innerType;
});
function Pa(e) {
  return new Oa({
    type: "readonly",
    innerType: e
  });
}
const La = /* @__PURE__ */ f("ZodCustom", (e, t) => {
  ai.init(e, t), I.init(e, t), e._zod.processJSONSchema = (n, o, r) => ls(e, n);
});
function Aa(e, t = {}) {
  return /* @__PURE__ */ Qi(La, e, t);
}
function ja(e) {
  return /* @__PURE__ */ es(e);
}
const Da = /* @__PURE__ */ new Set(["id", "image"]);
function He(e) {
  return e instanceof nt ? He(e.unwrap()) : e instanceof hn ? He(e._def.innerType) : e;
}
function Ma(e) {
  const t = [];
  for (const [n, o] of Object.entries(e.shape)) {
    if (Da.has(n)) continue;
    const r = o, i = He(r), s = r.description ?? n;
    if (i instanceof fn) {
      t.push({ key: n, label: s, type: "boolean" });
      continue;
    }
    if (i instanceof Ne) {
      t.push({ key: n, label: s, type: "select", options: i.options });
      continue;
    }
    if (i instanceof tt) {
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
    if (i instanceof dn) {
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
const Fa = Oe({
  id: L(),
  x: ue().min(0).max(100),
  y: ue().min(0).max(100),
  width: ue().min(0).max(100),
  height: ue().min(0).max(100),
  correct: ua().default(!1),
  label: L().optional()
}), ot = Oe({
  id: L(),
  image: L().optional(),
  zones: Se(Fa).optional()
}).passthrough(), Ua = ot.extend({
  target: L().max(2).describe("אות יעד"),
  correct: L().describe("תשובה נכונה"),
  correctEmoji: L().describe("אמוג'י")
}), Ba = ot.extend({
  target: L().max(2).describe("אות יעד"),
  correct: L().describe("תשובה נכונה"),
  correctEmoji: L().describe("אמוג'י")
}), Ja = Oe({
  title: L().default(""),
  type: L().default("multiple-choice")
}).passthrough(), Cc = Oe({
  id: L(),
  version: ue().default(1),
  meta: Ja.default({}),
  rounds: Se(ya(L(), $e())).default([]),
  distractors: Se($e()).default([])
}), Ha = ot.extend({
  instruction: L().optional().describe("הוראה")
}), Ot = {
  "multiple-choice": Ua,
  "drag-match": Ba,
  "zone-tap": Ha
};
function Va(e, { onFieldChange: t, onDeleteRound: n, roundSchema: o }) {
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
  function l(h, _ = "multiple-choice") {
    c = h.id, s.innerHTML = "", a.hidden = !1;
    const m = o ?? Ot[_] ?? Ot["multiple-choice"];
    Ma(m).forEach((v) => s.appendChild(d(v, h))), s.appendChild(z(h)), a.onclick = () => {
      confirm("למחוק את הסיבוב הזה?") && (n(c), u());
    };
  }
  function d(h, _) {
    const m = document.createElement("div");
    m.className = "ab-editor-field";
    const y = document.createElement("label");
    switch (y.className = "ab-editor-field__label", y.textContent = h.label, m.appendChild(y), h.type) {
      case "emoji":
        m.appendChild(g(h, _));
        break;
      case "boolean":
        m.appendChild(k(h, _));
        break;
      case "select":
        m.appendChild(b(h, _));
        break;
      case "number":
        m.appendChild($(h, _));
        break;
      default:
        m.appendChild(p(h, _));
        break;
    }
    return m;
  }
  function p(h, _) {
    const m = document.createElement("input");
    return m.className = "ab-editor-field__input", m.type = "text", m.value = String(_[h.key] ?? ""), m.dir = "rtl", h.maxLength && (m.maxLength = h.maxLength), m.addEventListener("input", () => t(c, h.key, m.value)), m;
  }
  function g(h, _) {
    const m = document.createElement("div");
    m.className = "ab-editor-field__emoji-row";
    const y = document.createElement("div");
    y.className = "ab-editor-field__emoji-preview", y.textContent = String(_[h.key] ?? "❓"), m.appendChild(y);
    const v = document.createElement("input");
    return v.className = "ab-editor-field__input", v.type = "text", v.value = String(_[h.key] ?? ""), v.maxLength = 8, v.placeholder = "🐱", v.style.fontSize = "20px", v.addEventListener("input", () => {
      y.textContent = v.value || "❓", t(c, h.key, v.value);
    }), m.appendChild(v), m;
  }
  function k(h, _) {
    const m = document.createElement("input");
    return m.type = "checkbox", m.checked = !!_[h.key], m.addEventListener("change", () => t(c, h.key, m.checked)), m;
  }
  function b(h, _) {
    const m = document.createElement("select");
    return m.className = "ab-editor-field__input", (h.options ?? []).forEach((y) => {
      const v = document.createElement("option");
      v.value = y, v.textContent = y, _[h.key] === y && (v.selected = !0), m.appendChild(v);
    }), m.addEventListener("change", () => t(c, h.key, m.value)), m;
  }
  function $(h, _) {
    const m = document.createElement("input");
    return m.className = "ab-editor-field__input", m.type = "number", m.value = String(_[h.key] ?? ""), h.min !== void 0 && (m.min = String(h.min)), h.max !== void 0 && (m.max = String(h.max)), m.addEventListener("input", () => t(c, h.key, Number(m.value))), m;
  }
  function z(h) {
    const _ = document.createElement("div");
    _.className = "ab-editor-field ab-editor-field--image";
    const m = document.createElement("label");
    m.className = "ab-editor-field__label", m.textContent = "🖼 תמונה", _.appendChild(m);
    const y = document.createElement("div");
    y.className = "ab-editor-field__img-row";
    const v = document.createElement("div");
    v.className = "ab-editor-field__img-preview", h.image && (v.style.backgroundImage = `url(${h.image})`), y.appendChild(v);
    const N = document.createElement("div");
    N.className = "ab-editor-field__img-btns";
    const E = document.createElement("input");
    E.type = "file", E.accept = "image/*", E.style.display = "none", E.addEventListener("change", () => {
      var rt;
      const de = (rt = E.files) == null ? void 0 : rt[0];
      if (!de) return;
      const M = new FileReader();
      M.onload = (bn) => {
        const it = bn.target.result;
        v.style.backgroundImage = `url(${it})`, Z.textContent = "🔄 החלף", t(c, "image", it), j.isConnected || N.appendChild(j);
      }, M.readAsDataURL(de);
    }), N.appendChild(E);
    const Z = document.createElement("button");
    Z.className = "ab-editor-btn ab-editor-btn--img-upload", Z.textContent = h.image ? "🔄 החלף" : "📤 העלה", Z.addEventListener("click", () => E.click()), N.appendChild(Z);
    const j = document.createElement("button");
    return j.className = "ab-editor-btn ab-editor-btn--img-clear", j.textContent = "✕ הסר", j.addEventListener("click", () => {
      v.style.backgroundImage = "", Z.textContent = "📤 העלה", t(c, "image", null), j.remove();
    }), h.image && N.appendChild(j), y.appendChild(N), _.appendChild(y), _;
  }
  function S() {
    r.remove();
  }
  return u(), { loadRound: l, clear: u, destroy: S };
}
let Wa = 0;
function je() {
  return `round-${Date.now()}-${Wa++}`;
}
class Ce {
  // redo stack
  constructor(t) {
    this._id = t.id ?? "game", this._version = t.version ?? 1, this._meta = { title: "", type: "multiple-choice", ...t.meta ?? {} }, this._rounds = (t.rounds ?? []).map((n) => ({ ...n, id: n.id || je() })), this._distractors = t.distractors ?? [], this._handlers = [], this._past = [], this._future = [];
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
    const n = { id: je(), target: "", correct: "", correctEmoji: "❓" };
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
    const o = { ...n, id: je() };
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
    return new Ce(t);
  }
  static fromRoundsArray(t, n, o = {}, r = []) {
    return new Ce({ id: t, meta: o, rounds: n, distractors: r });
  }
}
const mn = "alefbet.editor.";
function _n(e) {
  return Lt(`${mn}${e}`, null);
}
function qa(e) {
  _n(e.id).set(e.toJSON());
}
function Zc(e) {
  const t = _n(e).get();
  if (!t) return null;
  try {
    return Ce.fromJSON(t);
  } catch {
    return null;
  }
}
function xc(e) {
  try {
    localStorage.removeItem(`${mn}${e}`);
  } catch {
  }
}
function Xa(e) {
  const t = JSON.stringify(e.toJSON(), null, 2), n = new Blob([t], { type: "application/json;charset=utf-8" }), o = URL.createObjectURL(n), r = document.createElement("a");
  r.href = o, r.download = `${e.id}-rounds.json`, r.click(), URL.revokeObjectURL(o);
}
const Ya = [
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
function Ga(e) {
  return e.trim().replace(/\s+/g, "-").replace(/[^a-z0-9\u05D0-\u05EA_-]/gi, "").toLowerCase() || `custom-${Date.now()}`;
}
function Ka(e) {
  return Lt(`alefbet.audio-manager.${e}.custom`, []);
}
function Qa(e, t = null) {
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
  const o = n.querySelector("#ab-am-body"), r = n.querySelector(".ab-am-close"), i = n.querySelector(".ab-am-backdrop"), s = [], a = [...Ya];
  t && t.rounds.length > 0 && a.splice(1, 0, {
    // insert after Instructions
    id: "rounds",
    label: "🔤 שאלות / סיבובים",
    slots: t.rounds.map((l, d) => ({
      key: l.id,
      label: `סיבוב ${d + 1}${l.target ? " — " + l.target : ""}${l.correct ? " (" + l.correct + ")" : ""}`
    }))
  }), a.forEach((l) => {
    o.appendChild(ec(l, e, s));
  }), o.appendChild(tc(e, s));
  function c() {
    s.forEach((l) => l.destroy()), n.remove();
  }
  r.addEventListener("click", c), i.addEventListener("click", c), document.addEventListener("keydown", function l(d) {
    d.key === "Escape" && (c(), document.removeEventListener("keydown", l));
  });
}
function ec(e, t, n) {
  const o = document.createElement("section");
  o.className = "ab-am-section";
  const r = document.createElement("button");
  r.className = "ab-am-section__heading", r.setAttribute("aria-expanded", "true"), r.innerHTML = `<span>${e.label}</span><span class="ab-am-chevron">▾</span>`, o.appendChild(r);
  const i = document.createElement("div");
  return i.className = "ab-am-grid", o.appendChild(i), e.slots.forEach((s) => {
    i.appendChild(gn(t, s.key, s.label, n));
  }), r.addEventListener("click", () => {
    const s = r.getAttribute("aria-expanded") === "true";
    r.setAttribute("aria-expanded", String(!s)), i.hidden = s, r.querySelector(".ab-am-chevron").textContent = s ? "▸" : "▾";
  }), o;
}
function tc(e, t) {
  const n = Ka(e), o = document.createElement("section");
  o.className = "ab-am-section";
  const r = document.createElement("button");
  r.className = "ab-am-section__heading", r.setAttribute("aria-expanded", "true"), r.innerHTML = '<span>➕ מותאם אישית</span><span class="ab-am-chevron">▾</span>', o.appendChild(r);
  const i = document.createElement("div");
  i.className = "ab-am-grid", o.appendChild(i);
  function s() {
    i.querySelectorAll(".ab-am-row").forEach((d) => {
      const p = d._voiceBtn;
      p && (t.splice(t.indexOf(p), 1), p.destroy());
    }), i.innerHTML = "", n.get().forEach((d) => {
      const p = gn(e, d.key, d.label, t, () => {
        n.update((g) => g.filter((k) => k.key !== d.key)), s();
      });
      i.appendChild(p);
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
    const p = Ga(d);
    if (n.get().some((g) => g.key === p)) {
      c.select();
      return;
    }
    n.update((g) => [...g, { key: p, label: d }]), c.value = "", s();
  }
  return u.addEventListener("click", l), c.addEventListener("keydown", (d) => {
    d.key === "Enter" && l();
  }), r.addEventListener("click", () => {
    const d = r.getAttribute("aria-expanded") === "true";
    r.setAttribute("aria-expanded", String(!d)), i.hidden = d, a.hidden = d, r.querySelector(".ab-am-chevron").textContent = d ? "▸" : "▾";
  }), o;
}
function gn(e, t, n, o, r = null) {
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
  const l = Xn(u, { gameId: e, voiceKey: t, label: n });
  return o.push(l), i._voiceBtn = l, i.appendChild(c), i.appendChild(u), i;
}
let nc = 0;
function oc() {
  return `zone-${Date.now()}-${nc++}`;
}
function rc(e, t, { onChange: n }) {
  let o = structuredClone(t), r = null, i = null, s = null, a = null;
  const c = document.createElement("div");
  c.className = "ab-ze-overlay";
  const u = document.createElement("div");
  u.className = "ab-ze-draw-rect", u.hidden = !0, c.appendChild(u);
  const l = document.createElement("div");
  l.className = "ab-ze-toolbar", l.innerHTML = `
    <span class="ab-ze-toolbar__hint">לחצו וגררו לציור אזור</span>
  `, c.appendChild(l), e.style.position = "relative", e.appendChild(c);
  function d(h, _) {
    const m = c.getBoundingClientRect();
    return {
      px: Math.max(0, Math.min(100, (h - m.left) / m.width * 100)),
      py: Math.max(0, Math.min(100, (_ - m.top) / m.height * 100))
    };
  }
  function p() {
    c.querySelectorAll(".ab-ze-zone").forEach((h) => h.remove()), o.forEach((h) => {
      const _ = document.createElement("div");
      _.className = "ab-ze-zone", h.correct && _.classList.add("ab-ze-zone--correct"), h.id === r && _.classList.add("ab-ze-zone--selected"), _.dataset.zoneId = h.id, _.style.left = `${h.x}%`, _.style.top = `${h.y}%`, _.style.width = `${h.width}%`, _.style.height = `${h.height}%`;
      const m = document.createElement("div");
      m.className = "ab-ze-zone__badge", m.textContent = h.correct ? "✓" : "", h.label && (m.textContent = h.label), _.appendChild(m);
      const y = document.createElement("button");
      y.className = "ab-ze-zone__toggle", y.textContent = h.correct ? "✓ נכון" : "✗ לא נכון", y.title = "סמן כתשובה נכונה / לא נכונה", y.addEventListener("pointerdown", (N) => {
        N.stopPropagation();
      }), y.addEventListener("click", (N) => {
        N.stopPropagation(), h.correct = !h.correct, z(), p();
      }), _.appendChild(y);
      const v = document.createElement("button");
      if (v.className = "ab-ze-zone__delete", v.textContent = "✕", v.title = "מחק אזור", v.addEventListener("pointerdown", (N) => {
        N.stopPropagation();
      }), v.addEventListener("click", (N) => {
        N.stopPropagation(), o = o.filter((E) => E.id !== h.id), r === h.id && (r = null), z(), p();
      }), _.appendChild(v), h.id === r)
        for (const N of ["nw", "ne", "sw", "se"]) {
          const E = document.createElement("div");
          E.className = `ab-ze-zone__handle ab-ze-zone__handle--${N}`, E.dataset.handle = N, E.addEventListener("pointerdown", (Z) => {
            Z.stopPropagation(), Z.preventDefault(), a = {
              zoneId: h.id,
              handle: N,
              origZone: { ...h },
              startX: Z.clientX,
              startY: Z.clientY
            };
          }), _.appendChild(E);
        }
      _.addEventListener("pointerdown", (N) => {
        if (N.stopPropagation(), a) return;
        r = h.id, p();
        const { px: E, py: Z } = d(N.clientX, N.clientY);
        s = {
          zoneId: h.id,
          offsetX: E - h.x,
          offsetY: Z - h.y
        };
      }), c.appendChild(_);
    });
  }
  function g(h) {
    if (h.button !== 0 || h.target.closest(".ab-ze-zone") || h.target.closest(".ab-ze-toolbar")) return;
    r = null;
    const { px: _, py: m } = d(h.clientX, h.clientY);
    i = { startX: _, startY: m, curX: _, curY: m }, u.hidden = !1, k(), p();
  }
  function k() {
    if (!i) return;
    const h = Math.min(i.startX, i.curX), _ = Math.min(i.startY, i.curY), m = Math.abs(i.curX - i.startX), y = Math.abs(i.curY - i.startY);
    u.style.left = `${h}%`, u.style.top = `${_}%`, u.style.width = `${m}%`, u.style.height = `${y}%`;
  }
  function b(h) {
    if (i) {
      const { px: _, py: m } = d(h.clientX, h.clientY);
      i.curX = _, i.curY = m, k();
      return;
    }
    if (a) {
      h.preventDefault();
      const _ = o.find((Z) => Z.id === a.zoneId);
      if (!_) return;
      const m = a.origZone, y = c.getBoundingClientRect(), v = (h.clientX - a.startX) / y.width * 100, N = (h.clientY - a.startY) / y.height * 100, E = a.handle;
      E.includes("e") && (_.width = Math.max(3, m.width + v)), E.includes("w") && (_.x = m.x + v, _.width = Math.max(3, m.width - v)), E.includes("s") && (_.height = Math.max(3, m.height + N)), E.includes("n") && (_.y = m.y + N, _.height = Math.max(3, m.height - N)), p();
      return;
    }
    if (s) {
      h.preventDefault();
      const _ = o.find((v) => v.id === s.zoneId);
      if (!_) return;
      const { px: m, py: y } = d(h.clientX, h.clientY);
      _.x = Math.max(0, Math.min(100 - _.width, m - s.offsetX)), _.y = Math.max(0, Math.min(100 - _.height, y - s.offsetY)), p();
    }
  }
  function $(h) {
    if (i) {
      const _ = Math.min(i.startX, i.curX), m = Math.min(i.startY, i.curY), y = Math.abs(i.curX - i.startX), v = Math.abs(i.curY - i.startY);
      if (y > 3 && v > 3) {
        const N = {
          id: oc(),
          x: _,
          y: m,
          width: y,
          height: v,
          correct: !1
        };
        o.push(N), r = N.id, z();
      }
      i = null, u.hidden = !0, p();
      return;
    }
    if (a) {
      a = null, z();
      return;
    }
    s && (s = null, z());
  }
  function z() {
    n(structuredClone(o));
  }
  function S(h) {
    r && ((h.key === "Delete" || h.key === "Backspace") && (o = o.filter((_) => _.id !== r), r = null, z(), p()), h.key === "Escape" && (r = null, p()));
  }
  return c.addEventListener("pointerdown", g), document.addEventListener("pointermove", b), document.addEventListener("pointerup", $), document.addEventListener("keydown", S), p(), {
    setZones(h) {
      o = structuredClone(h), r = null, p();
    },
    getZones() {
      return structuredClone(o);
    },
    destroy() {
      c.removeEventListener("pointerdown", g), document.removeEventListener("pointermove", b), document.removeEventListener("pointerup", $), document.removeEventListener("keydown", S), c.remove();
    }
  };
}
class Tc {
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
      this._makeBtn("⬇ ייצוא", "ab-editor-btn--export", () => Xa(this._gameData))
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
    this._overlay = oo(t), this._overlay.show(), this._navigator = ro(this._container, this._gameData, {
      onSelectRound: (o) => this._selectRound(o),
      onAddRound: (o) => this._addRound(o),
      onDuplicateRound: (o) => this._duplicateRound(o),
      onMoveRound: (o, r) => this._moveRound(o, r)
    }), this._inspector = Va(this._container, {
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
    var d;
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
    l.className = "ab-editor-btn ab-editor-btn--play", l.textContent = "✓ סיום", l.addEventListener("click", () => this._closeZoneEditor()), u.appendChild(l), r.appendChild(u), n.appendChild(r), document.body.appendChild(n), this._zoneModal = n, c.onload = () => {
      const p = t.zones ?? [];
      this._zoneEditor = rc(a, p, {
        onChange: (g) => {
          this._selectedId && (this._gameData.updateRound(this._selectedId, { zones: g }), this._refreshUndoButtons());
        }
      });
    }, c.complete && c.naturalWidth > 0 && ((d = c.onload) == null || d.call(c, new Event("load"))), o.addEventListener("click", () => this._closeZoneEditor());
  }
  _closeZoneEditor() {
    var t, n;
    (t = this._zoneEditor) == null || t.destroy(), this._zoneEditor = null, (n = this._zoneModal) == null || n.remove(), this._zoneModal = null;
  }
  // ── Helpers ───────────────────────────────────────────────────────────────
  _openAudioManager() {
    Qa(this._gameData.id, this._gameData);
  }
  _save() {
    qa(this._gameData), this._showToast("✅ נשמר!");
  }
  _showToast(t) {
    const n = document.createElement("div");
    n.className = "ab-editor-toast", n.textContent = t, document.body.appendChild(n), setTimeout(() => n.remove(), 2200);
  }
}
export {
  Ot as BUILTIN_ROUND_SCHEMAS,
  ot as BaseRoundSchema,
  Ba as DragMatchRoundSchema,
  vn as EventBus,
  Ce as GameData,
  Cc as GameDataSchema,
  Tc as GameEditor,
  Ja as GameMetaSchema,
  ic as GameShell,
  yn as GameState,
  Ua as MultipleChoiceRoundSchema,
  Fa as ZoneSchema,
  Ha as ZoneTapRoundSchema,
  $n as addNikud,
  _e as animate,
  xc as clearGameData,
  Nc as createAppShell,
  to as createDragSource,
  no as createDropTarget,
  vc as createFeedback,
  Lt as createLocalState,
  Sc as createNikudBox,
  gc as createOptionCards,
  bc as createProgressBar,
  ac as createRoundManager,
  cc as createSpeechListener,
  Xn as createVoiceRecordButton,
  Un as createVoiceRecorder,
  wc as createZone,
  rc as createZoneEditor,
  kc as createZonePlayer,
  Vn as deleteVoice,
  Xa as exportGameDataAsJSON,
  fc as getLetter,
  qn as getLettersByGroup,
  Sn as getNikud,
  dc as hasVoice,
  ge as hebrewLetters,
  Ec as hideLoadingScreen,
  $c as injectHeaderButton,
  Fn as isVoiceRecordingSupported,
  mc as letterWithNikud,
  lc as listVoiceKeys,
  Zc as loadGameData,
  We as loadVoice,
  uc as matchNikudSound,
  pc as nikudBaseLetters,
  ve as nikudList,
  Wn as playVoice,
  sc as preloadNikud,
  hc as randomLetters,
  _c as randomNikud,
  qa as saveGameData,
  Hn as saveVoice,
  Ma as schemaToFields,
  Qa as showAudioManager,
  An as showCompletionScreen,
  zc as showLoadingScreen,
  yc as showNikudSettingsDialog,
  be as sounds,
  Pn as tts
};
