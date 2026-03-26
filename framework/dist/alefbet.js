class gn {
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
class bn {
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
class Ya {
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
    }, this.events = new gn(), this.state = new bn(this.config.totalRounds), this._buildShell();
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
function vn() {
  if (!re)
    try {
      re = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      return null;
    }
  return re.state === "suspended" && re.resume(), re;
}
function G(e, t, n = "sine", o = 0.3) {
  const r = vn();
  if (r)
    try {
      const i = r.createOscillator(), s = r.createGain();
      i.connect(s), s.connect(r.destination), i.type = n, i.frequency.setValueAtTime(e, r.currentTime), s.gain.setValueAtTime(o, r.currentTime), s.gain.exponentialRampToValueAtTime(1e-3, r.currentTime + t), i.start(r.currentTime), i.stop(r.currentTime + t + 0.05);
    } catch {
    }
}
const ge = {
  /** צליל תשובה נכונה */
  correct() {
    G(523.25, 0.15), setTimeout(() => G(659.25, 0.2), 120), setTimeout(() => G(783.99, 0.3), 240);
  },
  /** צליל עידוד עדין — נסה שוב */
  wrong() {
    G(350, 0.15, "triangle", 0.12);
  },
  /** צליל עידוד - סיום מוצלח */
  cheer() {
    [523.25, 587.33, 659.25, 698.46, 783.99, 1046.5].forEach((t, n) => setTimeout(() => G(t, 0.2), n * 90));
  },
  /** קליק עדין */
  click() {
    G(900, 0.04, "sine", 0.12);
  }
}, rt = "https://nakdan-u1-0.loadbalancer.dicta.org.il/api";
let it = !1;
const ae = /* @__PURE__ */ new Map();
function yn() {
  var r;
  if (typeof window > "u") return rt;
  const e = new URLSearchParams(window.location.search).get("nakdanProxy"), t = window.ALEFBET_NAKDAN_PROXY_URL;
  if (e && window.localStorage)
    try {
      window.localStorage.setItem("alefbet.nakdanProxyUrl", e);
    } catch {
    }
  const n = (r = window.localStorage) == null ? void 0 : r.getItem("alefbet.nakdanProxyUrl"), o = e || t || n;
  return o || (window.location.hostname.endsWith("github.io") ? null : rt);
}
function kn(e) {
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
async function wn(e) {
  const t = yn();
  if (!t)
    throw it || (it = !0, console.warn("[nakdan] Dicta API blocked by CORS on GitHub Pages. Configure a proxy URL via ?nakdanProxy=..., window.ALEFBET_NAKDAN_PROXY_URL, or localStorage key alefbet.nakdanProxyUrl.")), new Error("Nakdan unavailable without proxy on this host");
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
  return kn(r);
}
async function zn(e) {
  if (!(e != null && e.trim())) return e ?? "";
  if (ae.has(e)) return ae.get(e);
  try {
    const t = await wn(e);
    return ae.set(e, t), t;
  } catch {
    return ae.set(e, e), e;
  }
}
function En(e) {
  return ae.get(e) ?? e ?? "";
}
async function Qa(e) {
  const t = [...new Set(e.filter((n) => n == null ? void 0 : n.trim()))];
  await Promise.all(t.map((n) => zn(n)));
}
let X = [], pe = !1, It = !0, Y = 0.9, st = typeof localStorage < "u" && parseFloat(localStorage.getItem("alefbet.nikudRate")) || 0.5, Oe = !1, ie = null;
function at(e, t, n, o = t) {
  console.warn(`[tts] ${e} TTS failed`, { text: t, sentText: o, reason: n }), typeof window < "u" && typeof window.dispatchEvent == "function" && window.dispatchEvent(new CustomEvent("alefbet:tts-error", {
    detail: { provider: e, text: t, sentText: o, reason: n }
  }));
}
function $n(e) {
  return (e || "").replace(/[\u0591-\u05C7]/g, "");
}
function Sn(e) {
  const t = String(e || "").toLowerCase();
  return t.includes("didn't interact") || t.includes("notallowed");
}
function Nn() {
  var e;
  return typeof window > "u" || typeof document > "u" ? Promise.resolve() : Oe || (e = document.userActivation) != null && e.hasBeenActive ? (Oe = !0, Promise.resolve()) : ie || (ie = new Promise((t) => {
    const n = () => {
      Oe = !0, window.removeEventListener("pointerdown", n, !0), window.removeEventListener("keydown", n, !0), window.removeEventListener("touchstart", n, !0), t();
    };
    window.addEventListener("pointerdown", n, { once: !0, capture: !0 }), window.addEventListener("keydown", n, { once: !0, capture: !0 }), window.addEventListener("touchstart", n, { once: !0, capture: !0 });
  }).finally(() => {
    ie = null;
  }), ie);
}
function Zn(e, t, n) {
  const r = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(e)}&tl=he&client=tw-ob`, i = new Audio(r);
  i.playbackRate = Y, i.onended = t, i.onerror = () => n("audio.onerror"), i.play().catch((s) => {
    n((s == null ? void 0 : s.message) || "audio.play() rejected");
  });
}
function Tn(e) {
  return new Promise((t, n) => {
    const o = $n(e).trim() || e;
    let r = !1, i = !1;
    const s = () => {
      r || (r = !0, t());
    }, a = (u) => {
      r || (r = !0, n(u));
    }, c = () => {
      try {
        Zn(o, s, (u) => {
          if (!i && Sn(u)) {
            i = !0, Nn().then(() => {
              r || c();
            });
            return;
          }
          at("google", e, u, o), a(u);
        });
      } catch (u) {
        at("google", e, (u == null ? void 0 : u.message) || "Audio() construction failed", o), a(u == null ? void 0 : u.message);
      }
    };
    c();
  });
}
let Ae = null;
function Cn() {
  const e = speechSynthesis.getVoices();
  return e.find((t) => t.lang === "he-IL") || e.find((t) => t.lang === "iw-IL") || e.find((t) => t.lang.startsWith("he")) || null;
}
function ct() {
  Ae = Cn();
}
typeof speechSynthesis < "u" && (speechSynthesis.getVoices().length > 0 ? ct() : speechSynthesis.addEventListener("voiceschanged", ct, { once: !0 }));
function Rn(e) {
  return new Promise((t) => {
    if (typeof speechSynthesis > "u") {
      t();
      return;
    }
    const n = new SpeechSynthesisUtterance(e);
    n.lang = "he-IL", n.rate = Y, Ae && (n.voice = Ae), n.onend = t, n.onerror = t, speechSynthesis.speak(n);
  });
}
async function On(e) {
  if (It)
    try {
      await Tn(e);
      return;
    } catch {
      console.info("[tts] Falling back to browser Speech API");
    }
  await Rn(e);
}
function je() {
  if (pe || X.length === 0) return;
  const e = X.shift();
  pe = !0, On(e.text).then(() => {
    pe = !1, e.resolve(), je();
  });
}
const In = {
  /**
   * הקרא טקסט עברי
   * משתמש ב-Google Translate TTS לאיכות טובה יותר
   */
  speak(e) {
    const t = En(e);
    return new Promise((n) => {
      X.push({ text: t, resolve: n }), je();
    });
  },
  /** עצור את הדיבור הנוכחי */
  cancel() {
    X.forEach((e) => e.resolve()), X = [], pe = !1, typeof speechSynthesis < "u" && speechSynthesis.cancel();
  },
  get available() {
    return !0;
  },
  /** הגדר מהירות דיבור (0.5–2.0) */
  setRate(e) {
    Y = Math.max(0.5, Math.min(2, e));
  },
  /** השתמש ב-Google Translate TTS (ברירת מחדל) או בדפדפן */
  useGoogle(e = !0) {
    It = e;
  },
  /**
   * הגדר מהירות דיבור להדגשת ניקוד
   * @param {{ rate?: number }} opts
   *   rate: מהירות דיבור להדגשה (ברירת מחדל 0.5)
   */
  setNikudEmphasis({ rate: e } = {}) {
    e != null && (st = Math.max(0.3, Math.min(1.5, e)));
  },
  /**
   * הקרא אות עם ניקוד באיטיות להדגשת התנועה
   * @param {string} letter - האות (למשל 'ב')
   * @param {string} nikudSymbol - סמל הניקוד (למשל '\u05B7')
   */
  speakNikud(e, t) {
    const n = e + t, o = Y;
    return Y = st, new Promise((r) => {
      X.push({ text: n, resolve: r }), je();
    }).finally(() => {
      Y = o;
    });
  }
}, ut = {
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
}, xn = {
  shake: 420,
  bounce: 480,
  pulse: 600,
  fadeIn: 320,
  confetti: 700
};
function me(e, t) {
  !e || !ut[t] || e.animate(ut[t], {
    duration: xn[t] || 400,
    easing: "ease-in-out",
    fill: "none"
  });
}
function Pn(e, t, n, o) {
  ge.cheer();
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
  }), e.innerHTML = "", e.appendChild(a), me(a.querySelector(".completion-screen__content"), "fadeIn");
}
function ec(e, t, {
  totalRounds: n,
  progressBar: o = null,
  buildRoundUI: r,
  onCorrect: i,
  onWrong: s
} = {}) {
  let a = !1;
  async function c(p) {
    if (a) return;
    a = !0, ge.correct(), p && await p(), i && await i(), e.state.addScore(1), o == null || o.update(e.state.currentRound), await new Promise((y) => setTimeout(y, 1200)), e.state.nextRound() ? (a = !1, r()) : Pn(t, e.state.score, n, () => {
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
function xt(e, t) {
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
const An = {
  kamatz: "ah",
  patah: "ah",
  tzere: "eh",
  segol: "eh",
  hiriq: "ee",
  holam: "oh",
  kubbutz: "oo"
}, jn = {
  ah: [/[אה]/, /^א$/, /אא/, /הא/],
  eh: [/[אה]/, /^א$/, /אא/, /הא/, /אה/],
  ee: [/[אי]/, /^י$/, /אי/, /הי/],
  oh: [/[או]/, /^[או]$/, /או/, /הו/],
  oo: [/[או]/, /^[או]$/, /או/, /הו/, /אוּ/]
};
function tc() {
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
function nc(e, t) {
  if (!e || !t) return !1;
  const n = An[t];
  if (!n) return !1;
  const o = jn[n];
  if (!o) return !1;
  const r = e.replace(/[\s.,!?]/g, "");
  return r.length ? o.some((i) => i.test(r)) : !1;
}
function Ln() {
  return ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/ogg"].find((t) => MediaRecorder.isTypeSupported(t)) || "";
}
function Dn() {
  var e;
  return typeof navigator < "u" && typeof ((e = navigator.mediaDevices) == null ? void 0 : e.getUserMedia) == "function" && typeof MediaRecorder < "u";
}
function Mn() {
  let e = null, t = null, n = [];
  async function o() {
    if (e && e.state === "recording") return;
    t = await navigator.mediaDevices.getUserMedia({ audio: !0, video: !1 }), n = [];
    const c = {}, u = Ln();
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
const Fn = "alefbet-voices", B = "recordings", Un = 1;
let se = null;
function Ne() {
  return se || (se = new Promise((e, t) => {
    const n = indexedDB.open(Fn, Un);
    n.onupgradeneeded = (o) => {
      o.target.result.createObjectStore(B);
    }, n.onsuccess = (o) => e(o.target.result), n.onerror = (o) => {
      se = null, t(o.target.error);
    };
  }), se);
}
function Je(e, t) {
  return `${e}/${t}`;
}
async function Bn(e, t, n) {
  const o = await Ne();
  return new Promise((r, i) => {
    const s = o.transaction(B, "readwrite");
    s.objectStore(B).put(n, Je(e, t)), s.oncomplete = r, s.onerror = (a) => i(a.target.error);
  });
}
async function Ve(e, t) {
  const n = await Ne();
  return new Promise((o, r) => {
    const s = n.transaction(B, "readonly").objectStore(B).get(Je(e, t));
    s.onsuccess = () => o(s.result ?? null), s.onerror = (a) => r(a.target.error);
  });
}
async function Jn(e, t) {
  const n = await Ne();
  return new Promise((o, r) => {
    const i = n.transaction(B, "readwrite");
    i.objectStore(B).delete(Je(e, t)), i.oncomplete = o, i.onerror = (s) => r(s.target.error);
  });
}
async function oc(e) {
  const t = await Ne();
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
async function Vn(e, t) {
  let n;
  try {
    n = await Ve(e, t);
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
async function rc(e, t) {
  return await Ve(e, t).catch(() => null) !== null;
}
const _e = [
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
function ic(e) {
  return _e.find((t) => t.letter === e) || null;
}
function Hn(e = "regular") {
  return e === "regular" ? _e.filter((t) => !t.isFinal) : e === "final" ? _e.filter((t) => t.isFinal) : _e;
}
function sc(e, t = "regular") {
  const n = Hn(t);
  return [...n].sort(() => Math.random() - 0.5).slice(0, Math.min(e, n.length));
}
const be = [
  { id: "kamatz", name: "קָמָץ", nameNikud: "קָמָץ", symbol: "ָ", sound: "אָ", color: "#FF6B6B", textColor: "#fff" },
  { id: "patah", name: "פֶּתַח", nameNikud: "פָּתַח", symbol: "ַ", sound: "אָ", color: "#FF8C42", textColor: "#fff" },
  { id: "hiriq", name: "חִירִיק", nameNikud: "חִירִיק", symbol: "ִ", sound: "אִי", color: "#4ECDC4", textColor: "#fff" },
  { id: "tzere", name: "צָרָה", nameNikud: "צֵרֶה", symbol: "ֵ", sound: "אֶ", color: "#45B7D1", textColor: "#fff" },
  { id: "segol", name: "סָגֹול", nameNikud: "סְגוֹל", symbol: "ֶ", sound: "אֶ", color: "#9B59B6", textColor: "#fff" },
  { id: "holam", name: "חוֹלֵם", nameNikud: "חוֹלָם", symbol: "ֹ", sound: "אֹ", color: "#2ECC71", textColor: "#fff" },
  { id: "kubbutz", name: "קֻובּוּץ", nameNikud: "קֻבּוּץ", symbol: "ֻ", sound: "אֻ", color: "#F39C12", textColor: "#fff" }
], ac = ["א", "ב", "ג", "ד", "מ", "נ", "ל", "ר", "ש", "ת", "פ", "ק"];
function cc(e, t) {
  return e + t;
}
function uc(e) {
  let t = [...be];
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
  t.length === 0 && (t = [...be]);
  let n = [...t];
  for (; n.length < e; )
    n.push(...t);
  return n.sort(() => Math.random() - 0.5).slice(0, e);
}
function lc(e, t, n) {
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
function dc(e, t) {
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
function fc(e) {
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
      ge.correct(), o(r, "correct"), me(t, "bounce");
    },
    /** הצג עידוד — נסה שוב */
    wrong(r = "נַסֵּה שׁוּב") {
      ge.wrong(), o(r, "wrong"), me(t, "pulse");
    },
    /** הצג רמז */
    hint(r) {
      o(r, "hint"), me(t, "pulse");
    },
    /** הסר את הרכיב */
    destroy() {
      clearTimeout(n), t.remove();
    }
  };
}
function hc(e, t) {
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
  be.forEach((u) => {
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
    localStorage.setItem("alefbet.nikudRate", u), In.setNikudEmphasis({ rate: u });
    const l = Array.from(n.querySelectorAll(".nikud-filter-cb")).filter((p) => p.checked).map((p) => p.value), d = new URL(window.location);
    l.length > 0 && l.length < be.length ? d.searchParams.set("allowedNikud", l.join(",")) : d.searchParams.delete("allowedNikud"), d.searchParams.delete("excludedNikud"), n.style.display = "none", window.history.replaceState({}, "", d), t && t(e);
  }, document.getElementById("close-settings-btn").onclick = () => {
    n.style.display = "none";
  };
}
function pc(e) {
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
function mc(e, t = "טוֹעֵן...") {
  e.innerHTML = `<div class="ab-loading">${t}</div>`;
}
function _c(e) {
  e.innerHTML = "";
}
function gc(e, t, n, o) {
  const r = e.querySelector(".game-header__spacer");
  if (!r) return null;
  const i = document.createElement("button");
  return i.className = "ab-header-btn", i.setAttribute("aria-label", n), i.textContent = t, i.onclick = o, r.innerHTML = "", r.appendChild(i), i;
}
function bc(e, { size: t = "md" } = {}) {
  const n = document.createElement("div");
  n.className = `ab-nikud-box ab-nikud-box--${t} ab-nikud-box--${e.id}`;
  const o = document.createElement("div");
  o.className = "ab-nikud-box__box";
  const r = document.createElement("div");
  return r.className = "ab-nikud-box__mark", r.textContent = e.symbol, n.appendChild(o), n.appendChild(r), n;
}
function vc(e, t = {}) {
  const {
    title: n = "",
    subtitle: o = "",
    tabs: r = [],
    homeUrl: i = null,
    onTabChange: s = null
  } = t;
  e.classList.add("ab-app");
  const a = i ? `<a href="${i}" class="ab-app-back-link" aria-label="דף הבית">🏠</a>` : "", c = o ? `<span class="ab-app-subtitle">${o}</span>` : '<span class="ab-app-subtitle"></span>', u = r.map(
    (g) => `<button class="ab-app-tab" data-tab="${g.id}" aria-selected="false" role="tab"><span class="ab-app-tab-icon">${g.icon}</span><span class="ab-app-tab-label">${g.label}</span></button>`
  ).join(""), l = r.map(
    (g) => `<button class="ab-app-nav-item" data-tab="${g.id}" aria-selected="false" role="tab"><span class="ab-app-nav-icon">${g.icon}</span><span class="ab-app-nav-label">${g.label}</span></button>`
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
  function _(g) {
    y(g), typeof s == "function" && s(g);
  }
  e.querySelectorAll(".ab-app-tab, .ab-app-nav-item").forEach((g) => {
    g.addEventListener("click", () => _(g.dataset.tab));
  });
  function y(g) {
    e.querySelectorAll(".ab-app-tab, .ab-app-nav-item").forEach((E) => {
      const w = E.dataset.tab === g;
      E.classList.toggle("ab-active", w), E.setAttribute("aria-selected", w ? "true" : "false");
    });
  }
  return r.length > 0 && y(r[0].id), {
    /** אלמנט תוכן הראשי — כאן מרנדרים את תוכן הטאב הנוכחי */
    contentEl: p,
    /**
     * עדכן את כותרת המשנה
     * @param {string} text - הטקסט החדש לכותרת המשנה
     */
    setSubtitle(g) {
      d.textContent = g;
    },
    /**
     * הגדר את הטאב הפעיל באופן תכנותי
     * @param {string} tabId - מזהה הטאב להפעלה
     */
    setActiveTab(g) {
      y(g);
    }
  };
}
function Wn(e, {
  gameId: t,
  voiceKey: n,
  label: o = "הקלטת קול",
  onSaved: r,
  onDeleted: i
} = {}) {
  if (!Dn()) {
    const S = document.createElement("span");
    return S.className = "ab-voice-unsupported", S.textContent = "🎤 הקלטה לא נתמכת בדפדפן זה", e.appendChild(S), { refresh: async () => {
    }, destroy: () => S.remove() };
  }
  const s = Mn(), a = document.createElement("div");
  a.className = "ab-voice-btn-wrap", a.setAttribute("aria-label", o), e.appendChild(a);
  let c = "idle", u = null, l = null, d = null, p = null, _ = null, y = null, g = 0;
  function E() {
    if (a.innerHTML = "", c === "idle")
      u = w("🎤", "ab-voice-btn ab-voice-btn--record", "התחל הקלטה", $), a.appendChild(u);
    else if (c === "recording") {
      _ = document.createElement("span"), _.className = "ab-voice-indicator", a.appendChild(_);
      const S = document.createElement("span");
      S.className = "ab-voice-timer", S.textContent = "0:00", a.appendChild(S), g = 0, y = setInterval(() => {
        g++;
        const I = Math.floor(g / 60), A = String(g % 60).padStart(2, "0");
        S.textContent = `${I}:${A}`, g >= 120 && m();
      }, 1e3), l = w("⏹", "ab-voice-btn ab-voice-btn--stop", "עצור הקלטה", m), a.appendChild(l);
    } else c === "has-voice" && (d = w("▶", "ab-voice-btn ab-voice-btn--play", "נגן הקלטה", k), a.appendChild(d), u = w("🎤", "ab-voice-btn ab-voice-btn--re-record", "הקלט מחדש", $), a.appendChild(u), p = w("🗑", "ab-voice-btn ab-voice-btn--delete", "מחק הקלטה", h), a.appendChild(p));
  }
  function w(S, I, A, le) {
    const M = document.createElement("button");
    return M.className = I, M.type = "button", M.title = A, M.setAttribute("aria-label", A), M.textContent = S, M.addEventListener("click", le), M;
  }
  async function $() {
    try {
      await s.start(), c = "recording", E();
    } catch (S) {
      console.warn("[voice-record-button] microphone access denied:", S), z("לא ניתן לגשת למיקרופון");
    }
  }
  async function m() {
    clearInterval(y);
    try {
      const S = await s.stop();
      await Bn(t, n, S), c = "has-voice", E(), r == null || r(S);
    } catch (S) {
      console.warn("[voice-record-button] stop error:", S), c = "idle", E();
    }
  }
  async function k() {
    d == null || d.setAttribute("disabled", "true"), await Vn(t, n), d == null || d.removeAttribute("disabled");
  }
  async function h() {
    confirm("למחוק את ההקלטה?") && (await Jn(t, n), c = "idle", E(), i == null || i());
  }
  function z(S) {
    const I = document.createElement("span");
    I.className = "ab-voice-error", I.textContent = S, a.appendChild(I), setTimeout(() => I.remove(), 3e3);
  }
  async function v() {
    if (s.isActive()) return;
    c = await Ve(t, n).catch(() => null) ? "has-voice" : "idle", E();
  }
  function D() {
    clearInterval(y), s.isActive() && s.cancel(), a.remove();
  }
  return v(), { refresh: v, destroy: D };
}
let K = null, F = null, Le = 0, De = 0;
const ve = /* @__PURE__ */ new Map();
function lt(e, t) {
  var n;
  return ((n = document.elementFromPoint(e, t)) == null ? void 0 : n.closest('[data-drop-target="true"]')) || null;
}
function qn(e, t, n) {
  const o = e.getBoundingClientRect();
  Le = o.width / 2, De = o.height / 2, F = e.cloneNode(!0), Object.assign(F.style, {
    position: "fixed",
    left: `${t - Le}px`,
    top: `${n - De}px`,
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
  F && (F.style.left = `${e - Le}px`, F.style.top = `${t - De}px`);
}
function Kn() {
  F == null || F.remove(), F = null;
}
let U = null;
function Xn(e) {
  U !== e && (U == null || U.classList.remove("drop-target--hover"), U = e, e == null || e.classList.add("drop-target--hover"));
}
function Yn() {
  U == null || U.classList.remove("drop-target--hover"), U = null;
}
function Qn(e, t) {
  e.classList.add("drag-source");
  let n = null, o = null, r = null;
  function i() {
    n && (e.removeEventListener("pointermove", n), e.removeEventListener("pointerup", o), e.removeEventListener("pointercancel", r), n = o = r = null), Yn(), Kn(), e.classList.remove("drag-source--dragging"), K = null;
  }
  function s(a) {
    a.button !== void 0 && a.button !== 0 || (a.preventDefault(), K && i(), K = { el: e, data: t }, e.classList.add("drag-source--dragging"), qn(e, a.clientX, a.clientY), e.setPointerCapture(a.pointerId), n = (c) => {
      Gn(c.clientX, c.clientY), Xn(lt(c.clientX, c.clientY));
    }, o = (c) => {
      const u = lt(c.clientX, c.clientY);
      i(), u && ve.has(u) && ve.get(u).onDrop({ data: t, sourceEl: e, targetEl: u });
    }, r = () => i(), e.addEventListener("pointermove", n), e.addEventListener("pointerup", o), e.addEventListener("pointercancel", r));
  }
  return e.addEventListener("pointerdown", s), {
    destroy() {
      e.removeEventListener("pointerdown", s), (K == null ? void 0 : K.el) === e && i(), e.classList.remove("drag-source");
    }
  };
}
function eo(e, t) {
  return e.setAttribute("data-drop-target", "true"), e.classList.add("drop-target--active"), ve.set(e, { onDrop: t }), {
    destroy() {
      e.removeAttribute("data-drop-target"), e.classList.remove("drop-target--active", "drop-target--hover"), ve.delete(e);
    }
  };
}
function to(e, { onClick: t } = {}) {
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
function no(e, t, { onSelectRound: n, onAddRound: o, onDuplicateRound: r, onMoveRound: i }) {
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
    d.forEach((w) => w.destroy()), d = [];
  }
  function _(w, $) {
    const m = document.createElement("div");
    m.className = "ab-editor-nav__thumb", w.id === l && m.classList.add("ab-editor-nav__thumb--active"), m.setAttribute("role", "button"), m.setAttribute("tabindex", "0"), m.setAttribute("aria-label", `סיבוב ${$ + 1}`), m.dataset.roundId = w.id, w.image && (m.style.backgroundImage = `url(${w.image})`, m.classList.add("ab-editor-nav__thumb--has-img"));
    const k = document.createElement("div");
    k.className = "ab-editor-nav__grip", k.innerHTML = "⠿", k.setAttribute("aria-hidden", "true"), k.title = "גרור לשינוי סדר", m.appendChild(k);
    const h = document.createElement("div");
    if (h.className = "ab-editor-nav__num", h.textContent = String($ + 1), m.appendChild(h), w.correctEmoji && !w.image) {
      const v = document.createElement("div");
      v.className = "ab-editor-nav__emoji", v.textContent = w.correctEmoji, m.appendChild(v);
    }
    if (w.target) {
      const v = document.createElement("div");
      v.className = "ab-editor-nav__letter", v.textContent = w.target, m.appendChild(v);
    }
    const z = document.createElement("button");
    return z.className = "ab-editor-nav__dup", z.innerHTML = "⧉", z.title = "שכפל סיבוב", z.setAttribute("aria-label", "שכפל סיבוב"), z.addEventListener("click", (v) => {
      v.stopPropagation(), r(w.id);
    }), m.appendChild(z), m.addEventListener("click", () => n(w.id)), m.addEventListener("keydown", (v) => {
      (v.key === "Enter" || v.key === " ") && (v.preventDefault(), n(w.id));
    }), d.push(Qn(k, { roundId: w.id })), d.push(eo(m, ({ data: v }) => {
      v.roundId !== w.id && i(v.roundId, t.getRoundIndex(w.id));
    })), m;
  }
  function y() {
    p(), c.innerHTML = "", t.rounds.forEach((w, $) => c.appendChild(_(w, $)));
  }
  function g(w) {
    l = w, c.querySelectorAll(".ab-editor-nav__thumb").forEach(($) => {
      $.classList.toggle("ab-editor-nav__thumb--active", $.dataset.roundId === w);
    });
  }
  function E() {
    p(), s.remove();
  }
  return y(), { refresh: y, setActiveRound: g, destroy: E };
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
class Pt extends Error {
  constructor(t) {
    super(`Encountered unidirectional transform during encode: ${t}`), this.name = "ZodEncodeError";
  }
}
const At = {};
function J(e) {
  return At;
}
function jt(e) {
  const t = Object.values(e).filter((o) => typeof o == "number");
  return Object.entries(e).filter(([o, r]) => t.indexOf(+o) === -1).map(([o, r]) => r);
}
function Me(e, t) {
  return typeof t == "bigint" ? t.toString() : t;
}
function He(e) {
  return {
    get value() {
      {
        const t = e();
        return Object.defineProperty(this, "value", { value: t }), t;
      }
    }
  };
}
function We(e) {
  return e == null;
}
function qe(e) {
  const t = e.startsWith("^") ? 1 : 0, n = e.endsWith("$") ? e.length - 1 : e.length;
  return e.slice(t, n);
}
function oo(e, t) {
  const n = (e.toString().split(".")[1] || "").length, o = t.toString();
  let r = (o.split(".")[1] || "").length;
  if (r === 0 && /\d?e-\d?/.test(o)) {
    const c = o.match(/\d?e-(\d?)/);
    c != null && c[1] && (r = Number.parseInt(c[1]));
  }
  const i = n > r ? n : r, s = Number.parseInt(e.toFixed(i).replace(".", "")), a = Number.parseInt(t.toFixed(i).replace(".", ""));
  return s % a / 10 ** i;
}
const dt = Symbol("evaluating");
function N(e, t, n) {
  let o;
  Object.defineProperty(e, t, {
    get() {
      if (o !== dt)
        return o === void 0 && (o = dt, o = n()), o;
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
function H(...e) {
  const t = {};
  for (const n of e) {
    const o = Object.getOwnPropertyDescriptors(n);
    Object.assign(t, o);
  }
  return Object.defineProperties({}, t);
}
function ft(e) {
  return JSON.stringify(e);
}
function ro(e) {
  return e.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
const Lt = "captureStackTrace" in Error ? Error.captureStackTrace : (...e) => {
};
function ye(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
const io = He(() => {
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
  if (ye(e) === !1)
    return !1;
  const t = e.constructor;
  if (t === void 0 || typeof t != "function")
    return !0;
  const n = t.prototype;
  return !(ye(n) === !1 || Object.prototype.hasOwnProperty.call(n, "isPrototypeOf") === !1);
}
function Dt(e) {
  return ne(e) ? { ...e } : Array.isArray(e) ? [...e] : e;
}
const so = /* @__PURE__ */ new Set(["string", "number", "symbol"]);
function Ze(e) {
  return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function W(e, t, n) {
  const o = new e._zod.constr(t ?? e._zod.def);
  return (!t || n != null && n.parent) && (o._zod.parent = e), o;
}
function b(e) {
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
function ao(e) {
  return Object.keys(e).filter((t) => e[t]._zod.optin === "optional" && e[t]._zod.optout === "optional");
}
const co = {
  safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
  int32: [-2147483648, 2147483647],
  uint32: [0, 4294967295],
  float32: [-34028234663852886e22, 34028234663852886e22],
  float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
};
function uo(e, t) {
  const n = e._zod.def, o = n.checks;
  if (o && o.length > 0)
    throw new Error(".pick() cannot be used on object schemas containing refinements");
  const i = H(e._zod.def, {
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
function lo(e, t) {
  const n = e._zod.def, o = n.checks;
  if (o && o.length > 0)
    throw new Error(".omit() cannot be used on object schemas containing refinements");
  const i = H(e._zod.def, {
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
function fo(e, t) {
  if (!ne(t))
    throw new Error("Invalid input to extend: expected a plain object");
  const n = e._zod.def.checks;
  if (n && n.length > 0) {
    const i = e._zod.def.shape;
    for (const s in t)
      if (Object.getOwnPropertyDescriptor(i, s) !== void 0)
        throw new Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
  }
  const r = H(e._zod.def, {
    get shape() {
      const i = { ...e._zod.def.shape, ...t };
      return q(this, "shape", i), i;
    }
  });
  return W(e, r);
}
function ho(e, t) {
  if (!ne(t))
    throw new Error("Invalid input to safeExtend: expected a plain object");
  const n = H(e._zod.def, {
    get shape() {
      const o = { ...e._zod.def.shape, ...t };
      return q(this, "shape", o), o;
    }
  });
  return W(e, n);
}
function po(e, t) {
  const n = H(e._zod.def, {
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
function mo(e, t, n) {
  const r = t._zod.def.checks;
  if (r && r.length > 0)
    throw new Error(".partial() cannot be used on object schemas containing refinements");
  const s = H(t._zod.def, {
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
function _o(e, t, n) {
  const o = H(t._zod.def, {
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
function de(e) {
  return typeof e == "string" ? e : e == null ? void 0 : e.message;
}
function V(e, t, n) {
  var r, i, s, a, c, u;
  const o = { ...e, path: e.path ?? [] };
  if (!e.message) {
    const l = de((s = (i = (r = e.inst) == null ? void 0 : r._zod.def) == null ? void 0 : i.error) == null ? void 0 : s.call(i, e)) ?? de((a = t == null ? void 0 : t.error) == null ? void 0 : a.call(t, e)) ?? de((c = n.customError) == null ? void 0 : c.call(n, e)) ?? de((u = n.localeError) == null ? void 0 : u.call(n, e)) ?? "Invalid input";
    o.message = l;
  }
  return delete o.inst, delete o.continue, t != null && t.reportInput || delete o.input, o;
}
function Ge(e) {
  return Array.isArray(e) ? "array" : typeof e == "string" ? "string" : "unknown";
}
function ue(...e) {
  const [t, n, o] = e;
  return typeof t == "string" ? {
    message: t,
    code: "custom",
    input: n,
    inst: o
  } : { ...t };
}
const Mt = (e, t) => {
  e.name = "$ZodError", Object.defineProperty(e, "_zod", {
    value: e._zod,
    enumerable: !1
  }), Object.defineProperty(e, "issues", {
    value: t,
    enumerable: !1
  }), e.message = JSON.stringify(t, Me, 2), Object.defineProperty(e, "toString", {
    value: () => e.message,
    enumerable: !1
  });
}, Ft = f("$ZodError", Mt), Ut = f("$ZodError", Mt, { Parent: Error });
function go(e, t = (n) => n.message) {
  const n = {}, o = [];
  for (const r of e.issues)
    r.path.length > 0 ? (n[r.path[0]] = n[r.path[0]] || [], n[r.path[0]].push(t(r))) : o.push(t(r));
  return { formErrors: o, fieldErrors: n };
}
function bo(e, t = (n) => n.message) {
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
    const a = new ((r == null ? void 0 : r.Err) ?? e)(s.issues.map((c) => V(c, i, J())));
    throw Lt(a, r == null ? void 0 : r.callee), a;
  }
  return s.value;
}, Xe = (e) => async (t, n, o, r) => {
  const i = o ? Object.assign(o, { async: !0 }) : { async: !0 };
  let s = t._zod.run({ value: n, issues: [] }, i);
  if (s instanceof Promise && (s = await s), s.issues.length) {
    const a = new ((r == null ? void 0 : r.Err) ?? e)(s.issues.map((c) => V(c, i, J())));
    throw Lt(a, r == null ? void 0 : r.callee), a;
  }
  return s.value;
}, Te = (e) => (t, n, o) => {
  const r = o ? { ...o, async: !1 } : { async: !1 }, i = t._zod.run({ value: n, issues: [] }, r);
  if (i instanceof Promise)
    throw new te();
  return i.issues.length ? {
    success: !1,
    error: new (e ?? Ft)(i.issues.map((s) => V(s, r, J())))
  } : { success: !0, data: i.value };
}, vo = /* @__PURE__ */ Te(Ut), Ce = (e) => async (t, n, o) => {
  const r = o ? Object.assign(o, { async: !0 }) : { async: !0 };
  let i = t._zod.run({ value: n, issues: [] }, r);
  return i instanceof Promise && (i = await i), i.issues.length ? {
    success: !1,
    error: new e(i.issues.map((s) => V(s, r, J())))
  } : { success: !0, data: i.value };
}, yo = /* @__PURE__ */ Ce(Ut), ko = (e) => (t, n, o) => {
  const r = o ? Object.assign(o, { direction: "backward" }) : { direction: "backward" };
  return Ke(e)(t, n, r);
}, wo = (e) => (t, n, o) => Ke(e)(t, n, o), zo = (e) => async (t, n, o) => {
  const r = o ? Object.assign(o, { direction: "backward" }) : { direction: "backward" };
  return Xe(e)(t, n, r);
}, Eo = (e) => async (t, n, o) => Xe(e)(t, n, o), $o = (e) => (t, n, o) => {
  const r = o ? Object.assign(o, { direction: "backward" }) : { direction: "backward" };
  return Te(e)(t, n, r);
}, So = (e) => (t, n, o) => Te(e)(t, n, o), No = (e) => async (t, n, o) => {
  const r = o ? Object.assign(o, { direction: "backward" }) : { direction: "backward" };
  return Ce(e)(t, n, r);
}, Zo = (e) => async (t, n, o) => Ce(e)(t, n, o), To = /^[cC][^\s-]{8,}$/, Co = /^[0-9a-z]+$/, Ro = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/, Oo = /^[0-9a-vA-V]{20}$/, Io = /^[A-Za-z0-9]{27}$/, xo = /^[a-zA-Z0-9_-]{21}$/, Po = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/, Ao = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/, ht = (e) => e ? new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${e}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`) : /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/, jo = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/, Lo = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
function Do() {
  return new RegExp(Lo, "u");
}
const Mo = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, Fo = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/, Uo = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/, Bo = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, Jo = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/, Bt = /^[A-Za-z0-9_-]*$/, Vo = /^\+[1-9]\d{6,14}$/, Jt = "(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))", Ho = /* @__PURE__ */ new RegExp(`^${Jt}$`);
function Vt(e) {
  const t = "(?:[01]\\d|2[0-3]):[0-5]\\d";
  return typeof e.precision == "number" ? e.precision === -1 ? `${t}` : e.precision === 0 ? `${t}:[0-5]\\d` : `${t}:[0-5]\\d\\.\\d{${e.precision}}` : `${t}(?::[0-5]\\d(?:\\.\\d+)?)?`;
}
function Wo(e) {
  return new RegExp(`^${Vt(e)}$`);
}
function qo(e) {
  const t = Vt({ precision: e.precision }), n = ["Z"];
  e.local && n.push(""), e.offset && n.push("([+-](?:[01]\\d|2[0-3]):[0-5]\\d)");
  const o = `${t}(?:${n.join("|")})`;
  return new RegExp(`^${Jt}T(?:${o})$`);
}
const Go = (e) => {
  const t = e ? `[\\s\\S]{${(e == null ? void 0 : e.minimum) ?? 0},${(e == null ? void 0 : e.maximum) ?? ""}}` : "[\\s\\S]*";
  return new RegExp(`^${t}$`);
}, Ko = /^-?\d+$/, Ht = /^-?\d+(?:\.\d+)?$/, Xo = /^(?:true|false)$/i, Yo = /^[^A-Z]*$/, Qo = /^[^a-z]*$/, P = /* @__PURE__ */ f("$ZodCheck", (e, t) => {
  var n;
  e._zod ?? (e._zod = {}), e._zod.def = t, (n = e._zod).onattach ?? (n.onattach = []);
}), Wt = {
  number: "number",
  bigint: "bigint",
  object: "date"
}, qt = /* @__PURE__ */ f("$ZodCheckLessThan", (e, t) => {
  P.init(e, t);
  const n = Wt[typeof t.value];
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
  P.init(e, t);
  const n = Wt[typeof t.value];
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
}), er = /* @__PURE__ */ f("$ZodCheckMultipleOf", (e, t) => {
  P.init(e, t), e._zod.onattach.push((n) => {
    var o;
    (o = n._zod.bag).multipleOf ?? (o.multipleOf = t.value);
  }), e._zod.check = (n) => {
    if (typeof n.value != typeof t.value)
      throw new Error("Cannot mix number and bigint in multiple_of check.");
    (typeof n.value == "bigint" ? n.value % t.value === BigInt(0) : oo(n.value, t.value) === 0) || n.issues.push({
      origin: typeof n.value,
      code: "not_multiple_of",
      divisor: t.value,
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), tr = /* @__PURE__ */ f("$ZodCheckNumberFormat", (e, t) => {
  var s;
  P.init(e, t), t.format = t.format || "float64";
  const n = (s = t.format) == null ? void 0 : s.includes("int"), o = n ? "int" : "number", [r, i] = co[t.format];
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
}), nr = /* @__PURE__ */ f("$ZodCheckMaxLength", (e, t) => {
  var n;
  P.init(e, t), (n = e._zod.def).when ?? (n.when = (o) => {
    const r = o.value;
    return !We(r) && r.length !== void 0;
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
}), or = /* @__PURE__ */ f("$ZodCheckMinLength", (e, t) => {
  var n;
  P.init(e, t), (n = e._zod.def).when ?? (n.when = (o) => {
    const r = o.value;
    return !We(r) && r.length !== void 0;
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
}), rr = /* @__PURE__ */ f("$ZodCheckLengthEquals", (e, t) => {
  var n;
  P.init(e, t), (n = e._zod.def).when ?? (n.when = (o) => {
    const r = o.value;
    return !We(r) && r.length !== void 0;
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
}), Re = /* @__PURE__ */ f("$ZodCheckStringFormat", (e, t) => {
  var n, o;
  P.init(e, t), e._zod.onattach.push((r) => {
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
}), ir = /* @__PURE__ */ f("$ZodCheckRegex", (e, t) => {
  Re.init(e, t), e._zod.check = (n) => {
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
}), sr = /* @__PURE__ */ f("$ZodCheckLowerCase", (e, t) => {
  t.pattern ?? (t.pattern = Yo), Re.init(e, t);
}), ar = /* @__PURE__ */ f("$ZodCheckUpperCase", (e, t) => {
  t.pattern ?? (t.pattern = Qo), Re.init(e, t);
}), cr = /* @__PURE__ */ f("$ZodCheckIncludes", (e, t) => {
  P.init(e, t);
  const n = Ze(t.includes), o = new RegExp(typeof t.position == "number" ? `^.{${t.position}}${n}` : n);
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
}), ur = /* @__PURE__ */ f("$ZodCheckStartsWith", (e, t) => {
  P.init(e, t);
  const n = new RegExp(`^${Ze(t.prefix)}.*`);
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
}), lr = /* @__PURE__ */ f("$ZodCheckEndsWith", (e, t) => {
  P.init(e, t);
  const n = new RegExp(`.*${Ze(t.suffix)}$`);
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
}), dr = /* @__PURE__ */ f("$ZodCheckOverwrite", (e, t) => {
  P.init(e, t), e._zod.check = (n) => {
    n.value = t.tx(n.value);
  };
});
class fr {
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
const hr = {
  major: 4,
  minor: 3,
  patch: 6
}, C = /* @__PURE__ */ f("$ZodType", (e, t) => {
  var r;
  var n;
  e ?? (e = {}), e._zod.def = t, e._zod.bag = e._zod.bag || {}, e._zod.version = hr;
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
        const _ = a.issues.length, y = p._zod.check(a);
        if (y instanceof Promise && (u == null ? void 0 : u.async) === !1)
          throw new te();
        if (d || y instanceof Promise)
          d = (d ?? Promise.resolve()).then(async () => {
            await y, a.issues.length !== _ && (l || (l = Q(a, _)));
          });
        else {
          if (a.issues.length === _)
            continue;
          l || (l = Q(a, _));
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
  N(e, "~standard", () => ({
    validate: (i) => {
      var s;
      try {
        const a = vo(e, i);
        return a.success ? { value: a.data } : { issues: (s = a.error) == null ? void 0 : s.issues };
      } catch {
        return yo(e, i).then((c) => {
          var u;
          return c.success ? { value: c.data } : { issues: (u = c.error) == null ? void 0 : u.issues };
        });
      }
    },
    vendor: "zod",
    version: 1
  }));
}), Ye = /* @__PURE__ */ f("$ZodString", (e, t) => {
  var n;
  C.init(e, t), e._zod.pattern = [...((n = e == null ? void 0 : e._zod.bag) == null ? void 0 : n.patterns) ?? []].pop() ?? Go(e._zod.bag), e._zod.parse = (o, r) => {
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
}), Z = /* @__PURE__ */ f("$ZodStringFormat", (e, t) => {
  Re.init(e, t), Ye.init(e, t);
}), pr = /* @__PURE__ */ f("$ZodGUID", (e, t) => {
  t.pattern ?? (t.pattern = Ao), Z.init(e, t);
}), mr = /* @__PURE__ */ f("$ZodUUID", (e, t) => {
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
    t.pattern ?? (t.pattern = ht(o));
  } else
    t.pattern ?? (t.pattern = ht());
  Z.init(e, t);
}), _r = /* @__PURE__ */ f("$ZodEmail", (e, t) => {
  t.pattern ?? (t.pattern = jo), Z.init(e, t);
}), gr = /* @__PURE__ */ f("$ZodURL", (e, t) => {
  Z.init(e, t), e._zod.check = (n) => {
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
}), br = /* @__PURE__ */ f("$ZodEmoji", (e, t) => {
  t.pattern ?? (t.pattern = Do()), Z.init(e, t);
}), vr = /* @__PURE__ */ f("$ZodNanoID", (e, t) => {
  t.pattern ?? (t.pattern = xo), Z.init(e, t);
}), yr = /* @__PURE__ */ f("$ZodCUID", (e, t) => {
  t.pattern ?? (t.pattern = To), Z.init(e, t);
}), kr = /* @__PURE__ */ f("$ZodCUID2", (e, t) => {
  t.pattern ?? (t.pattern = Co), Z.init(e, t);
}), wr = /* @__PURE__ */ f("$ZodULID", (e, t) => {
  t.pattern ?? (t.pattern = Ro), Z.init(e, t);
}), zr = /* @__PURE__ */ f("$ZodXID", (e, t) => {
  t.pattern ?? (t.pattern = Oo), Z.init(e, t);
}), Er = /* @__PURE__ */ f("$ZodKSUID", (e, t) => {
  t.pattern ?? (t.pattern = Io), Z.init(e, t);
}), $r = /* @__PURE__ */ f("$ZodISODateTime", (e, t) => {
  t.pattern ?? (t.pattern = qo(t)), Z.init(e, t);
}), Sr = /* @__PURE__ */ f("$ZodISODate", (e, t) => {
  t.pattern ?? (t.pattern = Ho), Z.init(e, t);
}), Nr = /* @__PURE__ */ f("$ZodISOTime", (e, t) => {
  t.pattern ?? (t.pattern = Wo(t)), Z.init(e, t);
}), Zr = /* @__PURE__ */ f("$ZodISODuration", (e, t) => {
  t.pattern ?? (t.pattern = Po), Z.init(e, t);
}), Tr = /* @__PURE__ */ f("$ZodIPv4", (e, t) => {
  t.pattern ?? (t.pattern = Mo), Z.init(e, t), e._zod.bag.format = "ipv4";
}), Cr = /* @__PURE__ */ f("$ZodIPv6", (e, t) => {
  t.pattern ?? (t.pattern = Fo), Z.init(e, t), e._zod.bag.format = "ipv6", e._zod.check = (n) => {
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
}), Rr = /* @__PURE__ */ f("$ZodCIDRv4", (e, t) => {
  t.pattern ?? (t.pattern = Uo), Z.init(e, t);
}), Or = /* @__PURE__ */ f("$ZodCIDRv6", (e, t) => {
  t.pattern ?? (t.pattern = Bo), Z.init(e, t), e._zod.check = (n) => {
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
const Ir = /* @__PURE__ */ f("$ZodBase64", (e, t) => {
  t.pattern ?? (t.pattern = Jo), Z.init(e, t), e._zod.bag.contentEncoding = "base64", e._zod.check = (n) => {
    Kt(n.value) || n.issues.push({
      code: "invalid_format",
      format: "base64",
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
});
function xr(e) {
  if (!Bt.test(e))
    return !1;
  const t = e.replace(/[-_]/g, (o) => o === "-" ? "+" : "/"), n = t.padEnd(Math.ceil(t.length / 4) * 4, "=");
  return Kt(n);
}
const Pr = /* @__PURE__ */ f("$ZodBase64URL", (e, t) => {
  t.pattern ?? (t.pattern = Bt), Z.init(e, t), e._zod.bag.contentEncoding = "base64url", e._zod.check = (n) => {
    xr(n.value) || n.issues.push({
      code: "invalid_format",
      format: "base64url",
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), Ar = /* @__PURE__ */ f("$ZodE164", (e, t) => {
  t.pattern ?? (t.pattern = Vo), Z.init(e, t);
});
function jr(e, t = null) {
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
const Lr = /* @__PURE__ */ f("$ZodJWT", (e, t) => {
  Z.init(e, t), e._zod.check = (n) => {
    jr(n.value, t.alg) || n.issues.push({
      code: "invalid_format",
      format: "jwt",
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), Xt = /* @__PURE__ */ f("$ZodNumber", (e, t) => {
  C.init(e, t), e._zod.pattern = e._zod.bag.pattern ?? Ht, e._zod.parse = (n, o) => {
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
}), Dr = /* @__PURE__ */ f("$ZodNumberFormat", (e, t) => {
  tr.init(e, t), Xt.init(e, t);
}), Mr = /* @__PURE__ */ f("$ZodBoolean", (e, t) => {
  C.init(e, t), e._zod.pattern = Xo, e._zod.parse = (n, o) => {
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
}), Fr = /* @__PURE__ */ f("$ZodUnknown", (e, t) => {
  C.init(e, t), e._zod.parse = (n) => n;
}), Ur = /* @__PURE__ */ f("$ZodNever", (e, t) => {
  C.init(e, t), e._zod.parse = (n, o) => (n.issues.push({
    expected: "never",
    code: "invalid_type",
    input: n.value,
    inst: e
  }), n);
});
function pt(e, t, n) {
  e.issues.length && t.issues.push(...ee(n, e.issues)), t.value[n] = e.value;
}
const Br = /* @__PURE__ */ f("$ZodArray", (e, t) => {
  C.init(e, t), e._zod.parse = (n, o) => {
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
      c instanceof Promise ? i.push(c.then((u) => pt(u, n, s))) : pt(c, n, s);
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
function Yt(e) {
  var o, r, i, s;
  const t = Object.keys(e.shape);
  for (const a of t)
    if (!((s = (i = (r = (o = e.shape) == null ? void 0 : o[a]) == null ? void 0 : r._zod) == null ? void 0 : i.traits) != null && s.has("$ZodType")))
      throw new Error(`Invalid element at key "${a}": expected a Zod schema`);
  const n = ao(e.shape);
  return {
    ...e,
    keys: t,
    keySet: new Set(t),
    numKeys: t.length,
    optionalKeys: new Set(n)
  };
}
function Qt(e, t, n, o, r, i) {
  const s = [], a = r.keySet, c = r.catchall._zod, u = c.def.type, l = c.optout === "optional";
  for (const d in t) {
    if (a.has(d))
      continue;
    if (u === "never") {
      s.push(d);
      continue;
    }
    const p = c.run({ value: t[d], issues: [] }, o);
    p instanceof Promise ? e.push(p.then((_) => ke(_, n, d, t, l))) : ke(p, n, d, t, l);
  }
  return s.length && n.issues.push({
    code: "unrecognized_keys",
    keys: s,
    input: t,
    inst: i
  }), e.length ? Promise.all(e).then(() => n) : n;
}
const Jr = /* @__PURE__ */ f("$ZodObject", (e, t) => {
  C.init(e, t);
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
  const o = He(() => Yt(t));
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
  const r = ye, i = t.catchall;
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
      const _ = d[p], y = _._zod.optout === "optional", g = _._zod.run({ value: u[p], issues: [] }, c);
      g instanceof Promise ? l.push(g.then((E) => ke(E, a, p, u, y))) : ke(g, a, p, u, y);
    }
    return i ? Qt(l, u, a, c, o.value, e) : l.length ? Promise.all(l).then(() => a) : a;
  };
}), Vr = /* @__PURE__ */ f("$ZodObjectJIT", (e, t) => {
  Jr.init(e, t);
  const n = e._zod.parse, o = He(() => Yt(t)), r = (p) => {
    var m;
    const _ = new fr(["shape", "payload", "ctx"]), y = o.value, g = (k) => {
      const h = ft(k);
      return `shape[${h}]._zod.run({ value: input[${h}], issues: [] }, ctx)`;
    };
    _.write("const input = payload.value;");
    const E = /* @__PURE__ */ Object.create(null);
    let w = 0;
    for (const k of y.keys)
      E[k] = `key_${w++}`;
    _.write("const newResult = {};");
    for (const k of y.keys) {
      const h = E[k], z = ft(k), v = p[k], D = ((m = v == null ? void 0 : v._zod) == null ? void 0 : m.optout) === "optional";
      _.write(`const ${h} = ${g(k)};`), D ? _.write(`
        if (${h}.issues.length) {
          if (${z} in input) {
            payload.issues = payload.issues.concat(${h}.issues.map(iss => ({
              ...iss,
              path: iss.path ? [${z}, ...iss.path] : [${z}]
            })));
          }
        }
        
        if (${h}.value === undefined) {
          if (${z} in input) {
            newResult[${z}] = undefined;
          }
        } else {
          newResult[${z}] = ${h}.value;
        }
        
      `) : _.write(`
        if (${h}.issues.length) {
          payload.issues = payload.issues.concat(${h}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${z}, ...iss.path] : [${z}]
          })));
        }
        
        if (${h}.value === undefined) {
          if (${z} in input) {
            newResult[${z}] = undefined;
          }
        } else {
          newResult[${z}] = ${h}.value;
        }
        
      `);
    }
    _.write("payload.value = newResult;"), _.write("return payload;");
    const $ = _.compile();
    return (k, h) => $(p, k, h);
  };
  let i;
  const s = ye, a = !At.jitless, u = a && io.value, l = t.catchall;
  let d;
  e._zod.parse = (p, _) => {
    d ?? (d = o.value);
    const y = p.value;
    return s(y) ? a && u && (_ == null ? void 0 : _.async) === !1 && _.jitless !== !0 ? (i || (i = r(t.shape)), p = i(p, _), l ? Qt([], y, p, _, d, e) : p) : n(p, _) : (p.issues.push({
      expected: "object",
      code: "invalid_type",
      input: y,
      inst: e
    }), p);
  };
});
function mt(e, t, n, o) {
  for (const i of e)
    if (i.issues.length === 0)
      return t.value = i.value, t;
  const r = e.filter((i) => !Q(i));
  return r.length === 1 ? (t.value = r[0].value, r[0]) : (t.issues.push({
    code: "invalid_union",
    input: t.value,
    inst: n,
    errors: e.map((i) => i.issues.map((s) => V(s, o, J())))
  }), t);
}
const Hr = /* @__PURE__ */ f("$ZodUnion", (e, t) => {
  C.init(e, t), N(e._zod, "optin", () => t.options.some((r) => r._zod.optin === "optional") ? "optional" : void 0), N(e._zod, "optout", () => t.options.some((r) => r._zod.optout === "optional") ? "optional" : void 0), N(e._zod, "values", () => {
    if (t.options.every((r) => r._zod.values))
      return new Set(t.options.flatMap((r) => Array.from(r._zod.values)));
  }), N(e._zod, "pattern", () => {
    if (t.options.every((r) => r._zod.pattern)) {
      const r = t.options.map((i) => i._zod.pattern);
      return new RegExp(`^(${r.map((i) => qe(i.source)).join("|")})$`);
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
    return s ? Promise.all(a).then((c) => mt(c, r, e, i)) : mt(a, r, e, i);
  };
}), Wr = /* @__PURE__ */ f("$ZodIntersection", (e, t) => {
  C.init(e, t), e._zod.parse = (n, o) => {
    const r = n.value, i = t.left._zod.run({ value: r, issues: [] }, o), s = t.right._zod.run({ value: r, issues: [] }, o);
    return i instanceof Promise || s instanceof Promise ? Promise.all([i, s]).then(([c, u]) => _t(n, c, u)) : _t(n, i, s);
  };
});
function Fe(e, t) {
  if (e === t)
    return { valid: !0, data: e };
  if (e instanceof Date && t instanceof Date && +e == +t)
    return { valid: !0, data: e };
  if (ne(e) && ne(t)) {
    const n = Object.keys(t), o = Object.keys(e).filter((i) => n.indexOf(i) !== -1), r = { ...e, ...t };
    for (const i of o) {
      const s = Fe(e[i], t[i]);
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
      const r = e[o], i = t[o], s = Fe(r, i);
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
function _t(e, t, n) {
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
  const s = Fe(t.value, n.value);
  if (!s.valid)
    throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(s.mergeErrorPath)}`);
  return e.value = s.data, e;
}
const qr = /* @__PURE__ */ f("$ZodRecord", (e, t) => {
  C.init(e, t), e._zod.parse = (n, o) => {
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
        if (typeof a == "string" && Ht.test(a) && c.issues.length) {
          const d = t.keyType._zod.run({ value: Number(a), issues: [] }, o);
          if (d instanceof Promise)
            throw new Error("Async schemas not supported in object keys currently");
          d.issues.length === 0 && (c = d);
        }
        if (c.issues.length) {
          t.mode === "loose" ? n.value[a] = r[a] : n.issues.push({
            code: "invalid_key",
            origin: "record",
            issues: c.issues.map((d) => V(d, o, J())),
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
  C.init(e, t);
  const n = jt(t.entries), o = new Set(n);
  e._zod.values = o, e._zod.pattern = new RegExp(`^(${n.filter((r) => so.has(typeof r)).map((r) => typeof r == "string" ? Ze(r) : r.toString()).join("|")})$`), e._zod.parse = (r, i) => {
    const s = r.value;
    return o.has(s) || r.issues.push({
      code: "invalid_value",
      values: n,
      input: s,
      inst: e
    }), r;
  };
}), Kr = /* @__PURE__ */ f("$ZodTransform", (e, t) => {
  C.init(e, t), e._zod.parse = (n, o) => {
    if (o.direction === "backward")
      throw new Pt(e.constructor.name);
    const r = t.transform(n.value, n);
    if (o.async)
      return (r instanceof Promise ? r : Promise.resolve(r)).then((s) => (n.value = s, n));
    if (r instanceof Promise)
      throw new te();
    return n.value = r, n;
  };
});
function gt(e, t) {
  return e.issues.length && t === void 0 ? { issues: [], value: void 0 } : e;
}
const en = /* @__PURE__ */ f("$ZodOptional", (e, t) => {
  C.init(e, t), e._zod.optin = "optional", e._zod.optout = "optional", N(e._zod, "values", () => t.innerType._zod.values ? /* @__PURE__ */ new Set([...t.innerType._zod.values, void 0]) : void 0), N(e._zod, "pattern", () => {
    const n = t.innerType._zod.pattern;
    return n ? new RegExp(`^(${qe(n.source)})?$`) : void 0;
  }), e._zod.parse = (n, o) => {
    if (t.innerType._zod.optin === "optional") {
      const r = t.innerType._zod.run(n, o);
      return r instanceof Promise ? r.then((i) => gt(i, n.value)) : gt(r, n.value);
    }
    return n.value === void 0 ? n : t.innerType._zod.run(n, o);
  };
}), Xr = /* @__PURE__ */ f("$ZodExactOptional", (e, t) => {
  en.init(e, t), N(e._zod, "values", () => t.innerType._zod.values), N(e._zod, "pattern", () => t.innerType._zod.pattern), e._zod.parse = (n, o) => t.innerType._zod.run(n, o);
}), Yr = /* @__PURE__ */ f("$ZodNullable", (e, t) => {
  C.init(e, t), N(e._zod, "optin", () => t.innerType._zod.optin), N(e._zod, "optout", () => t.innerType._zod.optout), N(e._zod, "pattern", () => {
    const n = t.innerType._zod.pattern;
    return n ? new RegExp(`^(${qe(n.source)}|null)$`) : void 0;
  }), N(e._zod, "values", () => t.innerType._zod.values ? /* @__PURE__ */ new Set([...t.innerType._zod.values, null]) : void 0), e._zod.parse = (n, o) => n.value === null ? n : t.innerType._zod.run(n, o);
}), Qr = /* @__PURE__ */ f("$ZodDefault", (e, t) => {
  C.init(e, t), e._zod.optin = "optional", N(e._zod, "values", () => t.innerType._zod.values), e._zod.parse = (n, o) => {
    if (o.direction === "backward")
      return t.innerType._zod.run(n, o);
    if (n.value === void 0)
      return n.value = t.defaultValue, n;
    const r = t.innerType._zod.run(n, o);
    return r instanceof Promise ? r.then((i) => bt(i, t)) : bt(r, t);
  };
});
function bt(e, t) {
  return e.value === void 0 && (e.value = t.defaultValue), e;
}
const ei = /* @__PURE__ */ f("$ZodPrefault", (e, t) => {
  C.init(e, t), e._zod.optin = "optional", N(e._zod, "values", () => t.innerType._zod.values), e._zod.parse = (n, o) => (o.direction === "backward" || n.value === void 0 && (n.value = t.defaultValue), t.innerType._zod.run(n, o));
}), ti = /* @__PURE__ */ f("$ZodNonOptional", (e, t) => {
  C.init(e, t), N(e._zod, "values", () => {
    const n = t.innerType._zod.values;
    return n ? new Set([...n].filter((o) => o !== void 0)) : void 0;
  }), e._zod.parse = (n, o) => {
    const r = t.innerType._zod.run(n, o);
    return r instanceof Promise ? r.then((i) => vt(i, e)) : vt(r, e);
  };
});
function vt(e, t) {
  return !e.issues.length && e.value === void 0 && e.issues.push({
    code: "invalid_type",
    expected: "nonoptional",
    input: e.value,
    inst: t
  }), e;
}
const ni = /* @__PURE__ */ f("$ZodCatch", (e, t) => {
  C.init(e, t), N(e._zod, "optin", () => t.innerType._zod.optin), N(e._zod, "optout", () => t.innerType._zod.optout), N(e._zod, "values", () => t.innerType._zod.values), e._zod.parse = (n, o) => {
    if (o.direction === "backward")
      return t.innerType._zod.run(n, o);
    const r = t.innerType._zod.run(n, o);
    return r instanceof Promise ? r.then((i) => (n.value = i.value, i.issues.length && (n.value = t.catchValue({
      ...n,
      error: {
        issues: i.issues.map((s) => V(s, o, J()))
      },
      input: n.value
    }), n.issues = []), n)) : (n.value = r.value, r.issues.length && (n.value = t.catchValue({
      ...n,
      error: {
        issues: r.issues.map((i) => V(i, o, J()))
      },
      input: n.value
    }), n.issues = []), n);
  };
}), oi = /* @__PURE__ */ f("$ZodPipe", (e, t) => {
  C.init(e, t), N(e._zod, "values", () => t.in._zod.values), N(e._zod, "optin", () => t.in._zod.optin), N(e._zod, "optout", () => t.out._zod.optout), N(e._zod, "propValues", () => t.in._zod.propValues), e._zod.parse = (n, o) => {
    if (o.direction === "backward") {
      const i = t.out._zod.run(n, o);
      return i instanceof Promise ? i.then((s) => fe(s, t.in, o)) : fe(i, t.in, o);
    }
    const r = t.in._zod.run(n, o);
    return r instanceof Promise ? r.then((i) => fe(i, t.out, o)) : fe(r, t.out, o);
  };
});
function fe(e, t, n) {
  return e.issues.length ? (e.aborted = !0, e) : t._zod.run({ value: e.value, issues: e.issues }, n);
}
const ri = /* @__PURE__ */ f("$ZodReadonly", (e, t) => {
  C.init(e, t), N(e._zod, "propValues", () => t.innerType._zod.propValues), N(e._zod, "values", () => t.innerType._zod.values), N(e._zod, "optin", () => {
    var n, o;
    return (o = (n = t.innerType) == null ? void 0 : n._zod) == null ? void 0 : o.optin;
  }), N(e._zod, "optout", () => {
    var n, o;
    return (o = (n = t.innerType) == null ? void 0 : n._zod) == null ? void 0 : o.optout;
  }), e._zod.parse = (n, o) => {
    if (o.direction === "backward")
      return t.innerType._zod.run(n, o);
    const r = t.innerType._zod.run(n, o);
    return r instanceof Promise ? r.then(yt) : yt(r);
  };
});
function yt(e) {
  return e.value = Object.freeze(e.value), e;
}
const ii = /* @__PURE__ */ f("$ZodCustom", (e, t) => {
  P.init(e, t), C.init(e, t), e._zod.parse = (n, o) => n, e._zod.check = (n) => {
    const o = n.value, r = t.fn(o);
    if (r instanceof Promise)
      return r.then((i) => kt(i, n, o, e));
    kt(r, n, o, e);
  };
});
function kt(e, t, n, o) {
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
    o._zod.def.params && (r.params = o._zod.def.params), t.issues.push(ue(r));
  }
}
var wt;
class si {
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
function ai() {
  return new si();
}
(wt = globalThis).__zod_globalRegistry ?? (wt.__zod_globalRegistry = ai());
const ce = globalThis.__zod_globalRegistry;
// @__NO_SIDE_EFFECTS__
function ci(e, t) {
  return new e({
    type: "string",
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function ui(e, t) {
  return new e({
    type: "string",
    format: "email",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function zt(e, t) {
  return new e({
    type: "string",
    format: "guid",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function li(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function di(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v4",
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function fi(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v6",
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function hi(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v7",
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function pi(e, t) {
  return new e({
    type: "string",
    format: "url",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function mi(e, t) {
  return new e({
    type: "string",
    format: "emoji",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function _i(e, t) {
  return new e({
    type: "string",
    format: "nanoid",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function gi(e, t) {
  return new e({
    type: "string",
    format: "cuid",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function bi(e, t) {
  return new e({
    type: "string",
    format: "cuid2",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function vi(e, t) {
  return new e({
    type: "string",
    format: "ulid",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function yi(e, t) {
  return new e({
    type: "string",
    format: "xid",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function ki(e, t) {
  return new e({
    type: "string",
    format: "ksuid",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function wi(e, t) {
  return new e({
    type: "string",
    format: "ipv4",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function zi(e, t) {
  return new e({
    type: "string",
    format: "ipv6",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Ei(e, t) {
  return new e({
    type: "string",
    format: "cidrv4",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function $i(e, t) {
  return new e({
    type: "string",
    format: "cidrv6",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Si(e, t) {
  return new e({
    type: "string",
    format: "base64",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Ni(e, t) {
  return new e({
    type: "string",
    format: "base64url",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Zi(e, t) {
  return new e({
    type: "string",
    format: "e164",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Ti(e, t) {
  return new e({
    type: "string",
    format: "jwt",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Ci(e, t) {
  return new e({
    type: "string",
    format: "datetime",
    check: "string_format",
    offset: !1,
    local: !1,
    precision: null,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Ri(e, t) {
  return new e({
    type: "string",
    format: "date",
    check: "string_format",
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Oi(e, t) {
  return new e({
    type: "string",
    format: "time",
    check: "string_format",
    precision: null,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Ii(e, t) {
  return new e({
    type: "string",
    format: "duration",
    check: "string_format",
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function xi(e, t) {
  return new e({
    type: "number",
    checks: [],
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Pi(e, t) {
  return new e({
    type: "number",
    check: "number_format",
    abort: !1,
    format: "safeint",
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Ai(e) {
  return new e({
    type: "unknown"
  });
}
// @__NO_SIDE_EFFECTS__
function ji(e, t) {
  return new e({
    type: "never",
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Et(e, t) {
  return new qt({
    check: "less_than",
    ...b(t),
    value: e,
    inclusive: !1
  });
}
// @__NO_SIDE_EFFECTS__
function Ie(e, t) {
  return new qt({
    check: "less_than",
    ...b(t),
    value: e,
    inclusive: !0
  });
}
// @__NO_SIDE_EFFECTS__
function $t(e, t) {
  return new Gt({
    check: "greater_than",
    ...b(t),
    value: e,
    inclusive: !1
  });
}
// @__NO_SIDE_EFFECTS__
function xe(e, t) {
  return new Gt({
    check: "greater_than",
    ...b(t),
    value: e,
    inclusive: !0
  });
}
// @__NO_SIDE_EFFECTS__
function St(e, t) {
  return new er({
    check: "multiple_of",
    ...b(t),
    value: e
  });
}
// @__NO_SIDE_EFFECTS__
function tn(e, t) {
  return new nr({
    check: "max_length",
    ...b(t),
    maximum: e
  });
}
// @__NO_SIDE_EFFECTS__
function we(e, t) {
  return new or({
    check: "min_length",
    ...b(t),
    minimum: e
  });
}
// @__NO_SIDE_EFFECTS__
function nn(e, t) {
  return new rr({
    check: "length_equals",
    ...b(t),
    length: e
  });
}
// @__NO_SIDE_EFFECTS__
function Li(e, t) {
  return new ir({
    check: "string_format",
    format: "regex",
    ...b(t),
    pattern: e
  });
}
// @__NO_SIDE_EFFECTS__
function Di(e) {
  return new sr({
    check: "string_format",
    format: "lowercase",
    ...b(e)
  });
}
// @__NO_SIDE_EFFECTS__
function Mi(e) {
  return new ar({
    check: "string_format",
    format: "uppercase",
    ...b(e)
  });
}
// @__NO_SIDE_EFFECTS__
function Fi(e, t) {
  return new cr({
    check: "string_format",
    format: "includes",
    ...b(t),
    includes: e
  });
}
// @__NO_SIDE_EFFECTS__
function Ui(e, t) {
  return new ur({
    check: "string_format",
    format: "starts_with",
    ...b(t),
    prefix: e
  });
}
// @__NO_SIDE_EFFECTS__
function Bi(e, t) {
  return new lr({
    check: "string_format",
    format: "ends_with",
    ...b(t),
    suffix: e
  });
}
// @__NO_SIDE_EFFECTS__
function oe(e) {
  return new dr({
    check: "overwrite",
    tx: e
  });
}
// @__NO_SIDE_EFFECTS__
function Ji(e) {
  return /* @__PURE__ */ oe((t) => t.normalize(e));
}
// @__NO_SIDE_EFFECTS__
function Vi() {
  return /* @__PURE__ */ oe((e) => e.trim());
}
// @__NO_SIDE_EFFECTS__
function Hi() {
  return /* @__PURE__ */ oe((e) => e.toLowerCase());
}
// @__NO_SIDE_EFFECTS__
function Wi() {
  return /* @__PURE__ */ oe((e) => e.toUpperCase());
}
// @__NO_SIDE_EFFECTS__
function qi() {
  return /* @__PURE__ */ oe((e) => ro(e));
}
// @__NO_SIDE_EFFECTS__
function Gi(e, t, n) {
  return new e({
    type: "array",
    element: t,
    // get element() {
    //   return element;
    // },
    ...b(n)
  });
}
// @__NO_SIDE_EFFECTS__
function Ki(e, t, n) {
  return new e({
    type: "custom",
    check: "custom",
    fn: t,
    ...b(n)
  });
}
// @__NO_SIDE_EFFECTS__
function Xi(e) {
  const t = /* @__PURE__ */ Yi((n) => (n.addIssue = (o) => {
    if (typeof o == "string")
      n.issues.push(ue(o, n.value, t._zod.def));
    else {
      const r = o;
      r.fatal && (r.continue = !1), r.code ?? (r.code = "custom"), r.input ?? (r.input = n.value), r.inst ?? (r.inst = t), r.continue ?? (r.continue = !t._zod.def.abort), n.issues.push(ue(r));
    }
  }, e(n.value, n)));
  return t;
}
// @__NO_SIDE_EFFECTS__
function Yi(e, t) {
  const n = new P({
    check: "custom",
    ...b(t)
  });
  return n._zod.check = e, n;
}
function on(e) {
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
      const y = s.schema, g = t.processors[r.type];
      if (!g)
        throw new Error(`[toJSONSchema]: Non-representable type encountered: ${r.type}`);
      g(e, t, y, p);
    }
    const _ = e._zod.parent;
    _ && (s.ref || (s.ref = _), O(_, t, p), t.seen.get(_).isParent = !0);
  }
  const c = t.metadataRegistry.get(e);
  return c && Object.assign(s.schema, c), t.io === "input" && x(e) && (delete s.schema.examples, delete s.schema.default), t.io === "input" && s.schema._prefault && ((o = s.schema).default ?? (o.default = s.schema._prefault)), delete s.schema._prefault, t.seen.get(e).schema;
}
function rn(e, t) {
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
    var g;
    const d = e.target === "draft-2020-12" ? "$defs" : "definitions";
    if (e.external) {
      const E = (g = e.external.registry.get(l[0])) == null ? void 0 : g.id, w = e.external.uri ?? ((m) => m);
      if (E)
        return { ref: w(E) };
      const $ = l[1].defId ?? l[1].schema.id ?? `schema${e.counter++}`;
      return l[1].defId = $, { defId: $, ref: `${w("__shared")}#/${d}/${$}` };
    }
    if (l[1] === n)
      return { ref: "#" };
    const _ = `#/${d}/`, y = l[1].schema.id ?? `__schema${e.counter++}`;
    return { defId: y, ref: _ + y };
  }, i = (l) => {
    if (l[1].schema.$ref)
      return;
    const d = l[1], { ref: p, defId: _ } = r(l);
    d.def = { ...d.schema }, _ && (d.defId = _);
    const y = d.schema;
    for (const g in y)
      delete y[g];
    y.$ref = p;
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
      const _ = (c = e.external.registry.get(l[0])) == null ? void 0 : c.id;
      if (t !== l[0] && _) {
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
function sn(e, t) {
  var s, a, c;
  const n = e.seen.get(t);
  if (!n)
    throw new Error("Unprocessed schema. This is a bug in Zod.");
  const o = (u) => {
    const l = e.seen.get(u);
    if (l.ref === null)
      return;
    const d = l.def ?? l.schema, p = { ...d }, _ = l.ref;
    if (l.ref = null, _) {
      o(_);
      const g = e.seen.get(_), E = g.schema;
      if (E.$ref && (e.target === "draft-07" || e.target === "draft-04" || e.target === "openapi-3.0") ? (d.allOf = d.allOf ?? [], d.allOf.push(E)) : Object.assign(d, E), Object.assign(d, p), u._zod.parent === _)
        for (const $ in d)
          $ === "$ref" || $ === "allOf" || $ in p || delete d[$];
      if (E.$ref && g.def)
        for (const $ in d)
          $ === "$ref" || $ === "allOf" || $ in g.def && JSON.stringify(d[$]) === JSON.stringify(g.def[$]) && delete d[$];
    }
    const y = u._zod.parent;
    if (y && y !== _) {
      o(y);
      const g = e.seen.get(y);
      if (g != null && g.schema.$ref && (d.$ref = g.schema.$ref, g.def))
        for (const E in d)
          E === "$ref" || E === "allOf" || E in g.def && JSON.stringify(d[E]) === JSON.stringify(g.def[E]) && delete d[E];
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
          input: ze(t, "input", e.processors),
          output: ze(t, "output", e.processors)
        }
      },
      enumerable: !1,
      writable: !1
    }), u;
  } catch {
    throw new Error("Error converting schema to JSON.");
  }
}
function x(e, t) {
  const n = t ?? { seen: /* @__PURE__ */ new Set() };
  if (n.seen.has(e))
    return !1;
  n.seen.add(e);
  const o = e._zod.def;
  if (o.type === "transform")
    return !0;
  if (o.type === "array")
    return x(o.element, n);
  if (o.type === "set")
    return x(o.valueType, n);
  if (o.type === "lazy")
    return x(o.getter(), n);
  if (o.type === "promise" || o.type === "optional" || o.type === "nonoptional" || o.type === "nullable" || o.type === "readonly" || o.type === "default" || o.type === "prefault")
    return x(o.innerType, n);
  if (o.type === "intersection")
    return x(o.left, n) || x(o.right, n);
  if (o.type === "record" || o.type === "map")
    return x(o.keyType, n) || x(o.valueType, n);
  if (o.type === "pipe")
    return x(o.in, n) || x(o.out, n);
  if (o.type === "object") {
    for (const r in o.shape)
      if (x(o.shape[r], n))
        return !0;
    return !1;
  }
  if (o.type === "union") {
    for (const r of o.options)
      if (x(r, n))
        return !0;
    return !1;
  }
  if (o.type === "tuple") {
    for (const r of o.items)
      if (x(r, n))
        return !0;
    return !!(o.rest && x(o.rest, n));
  }
  return !1;
}
const Qi = (e, t = {}) => (n) => {
  const o = on({ ...n, processors: t });
  return O(e, o), rn(o, e), sn(o, e);
}, ze = (e, t, n = {}) => (o) => {
  const { libraryOptions: r, target: i } = o ?? {}, s = on({ ...r ?? {}, target: i, io: t, processors: n });
  return O(e, s), rn(s, e), sn(s, e);
}, es = {
  guid: "uuid",
  url: "uri",
  datetime: "date-time",
  json_string: "json-string",
  regex: ""
  // do not set
}, ts = (e, t, n, o) => {
  const r = n;
  r.type = "string";
  const { minimum: i, maximum: s, format: a, patterns: c, contentEncoding: u } = e._zod.bag;
  if (typeof i == "number" && (r.minLength = i), typeof s == "number" && (r.maxLength = s), a && (r.format = es[a] ?? a, r.format === "" && delete r.format, a === "time" && delete r.format), u && (r.contentEncoding = u), c && c.size > 0) {
    const l = [...c];
    l.length === 1 ? r.pattern = l[0].source : l.length > 1 && (r.allOf = [
      ...l.map((d) => ({
        ...t.target === "draft-07" || t.target === "draft-04" || t.target === "openapi-3.0" ? { type: "string" } : {},
        pattern: d.source
      }))
    ]);
  }
}, ns = (e, t, n, o) => {
  const r = n, { minimum: i, maximum: s, format: a, multipleOf: c, exclusiveMaximum: u, exclusiveMinimum: l } = e._zod.bag;
  typeof a == "string" && a.includes("int") ? r.type = "integer" : r.type = "number", typeof l == "number" && (t.target === "draft-04" || t.target === "openapi-3.0" ? (r.minimum = l, r.exclusiveMinimum = !0) : r.exclusiveMinimum = l), typeof i == "number" && (r.minimum = i, typeof l == "number" && t.target !== "draft-04" && (l >= i ? delete r.minimum : delete r.exclusiveMinimum)), typeof u == "number" && (t.target === "draft-04" || t.target === "openapi-3.0" ? (r.maximum = u, r.exclusiveMaximum = !0) : r.exclusiveMaximum = u), typeof s == "number" && (r.maximum = s, typeof u == "number" && t.target !== "draft-04" && (u <= s ? delete r.maximum : delete r.exclusiveMaximum)), typeof c == "number" && (r.multipleOf = c);
}, os = (e, t, n, o) => {
  n.type = "boolean";
}, rs = (e, t, n, o) => {
  n.not = {};
}, is = (e, t, n, o) => {
}, ss = (e, t, n, o) => {
  const r = e._zod.def, i = jt(r.entries);
  i.every((s) => typeof s == "number") && (n.type = "number"), i.every((s) => typeof s == "string") && (n.type = "string"), n.enum = i;
}, as = (e, t, n, o) => {
  if (t.unrepresentable === "throw")
    throw new Error("Custom types cannot be represented in JSON Schema");
}, cs = (e, t, n, o) => {
  if (t.unrepresentable === "throw")
    throw new Error("Transforms cannot be represented in JSON Schema");
}, us = (e, t, n, o) => {
  const r = n, i = e._zod.def, { minimum: s, maximum: a } = e._zod.bag;
  typeof s == "number" && (r.minItems = s), typeof a == "number" && (r.maxItems = a), r.type = "array", r.items = O(i.element, t, { ...o, path: [...o.path, "items"] });
}, ls = (e, t, n, o) => {
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
}, ds = (e, t, n, o) => {
  const r = e._zod.def, i = r.inclusive === !1, s = r.options.map((a, c) => O(a, t, {
    ...o,
    path: [...o.path, i ? "oneOf" : "anyOf", c]
  }));
  i ? n.oneOf = s : n.anyOf = s;
}, fs = (e, t, n, o) => {
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
}, hs = (e, t, n, o) => {
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
}, ps = (e, t, n, o) => {
  const r = e._zod.def, i = O(r.innerType, t, o), s = t.seen.get(e);
  t.target === "openapi-3.0" ? (s.ref = r.innerType, n.nullable = !0) : n.anyOf = [i, { type: "null" }];
}, ms = (e, t, n, o) => {
  const r = e._zod.def;
  O(r.innerType, t, o);
  const i = t.seen.get(e);
  i.ref = r.innerType;
}, _s = (e, t, n, o) => {
  const r = e._zod.def;
  O(r.innerType, t, o);
  const i = t.seen.get(e);
  i.ref = r.innerType, n.default = JSON.parse(JSON.stringify(r.defaultValue));
}, gs = (e, t, n, o) => {
  const r = e._zod.def;
  O(r.innerType, t, o);
  const i = t.seen.get(e);
  i.ref = r.innerType, t.io === "input" && (n._prefault = JSON.parse(JSON.stringify(r.defaultValue)));
}, bs = (e, t, n, o) => {
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
}, vs = (e, t, n, o) => {
  const r = e._zod.def, i = t.io === "input" ? r.in._zod.def.type === "transform" ? r.out : r.in : r.out;
  O(i, t, o);
  const s = t.seen.get(e);
  s.ref = i;
}, ys = (e, t, n, o) => {
  const r = e._zod.def;
  O(r.innerType, t, o);
  const i = t.seen.get(e);
  i.ref = r.innerType, n.readOnly = !0;
}, an = (e, t, n, o) => {
  const r = e._zod.def;
  O(r.innerType, t, o);
  const i = t.seen.get(e);
  i.ref = r.innerType;
}, ks = /* @__PURE__ */ f("ZodISODateTime", (e, t) => {
  $r.init(e, t), T.init(e, t);
});
function ws(e) {
  return /* @__PURE__ */ Ci(ks, e);
}
const zs = /* @__PURE__ */ f("ZodISODate", (e, t) => {
  Sr.init(e, t), T.init(e, t);
});
function Es(e) {
  return /* @__PURE__ */ Ri(zs, e);
}
const $s = /* @__PURE__ */ f("ZodISOTime", (e, t) => {
  Nr.init(e, t), T.init(e, t);
});
function Ss(e) {
  return /* @__PURE__ */ Oi($s, e);
}
const Ns = /* @__PURE__ */ f("ZodISODuration", (e, t) => {
  Zr.init(e, t), T.init(e, t);
});
function Zs(e) {
  return /* @__PURE__ */ Ii(Ns, e);
}
const Ts = (e, t) => {
  Ft.init(e, t), e.name = "ZodError", Object.defineProperties(e, {
    format: {
      value: (n) => bo(e, n)
      // enumerable: false,
    },
    flatten: {
      value: (n) => go(e, n)
      // enumerable: false,
    },
    addIssue: {
      value: (n) => {
        e.issues.push(n), e.message = JSON.stringify(e.issues, Me, 2);
      }
      // enumerable: false,
    },
    addIssues: {
      value: (n) => {
        e.issues.push(...n), e.message = JSON.stringify(e.issues, Me, 2);
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
}, L = f("ZodError", Ts, {
  Parent: Error
}), Cs = /* @__PURE__ */ Ke(L), Rs = /* @__PURE__ */ Xe(L), Os = /* @__PURE__ */ Te(L), Is = /* @__PURE__ */ Ce(L), xs = /* @__PURE__ */ ko(L), Ps = /* @__PURE__ */ wo(L), As = /* @__PURE__ */ zo(L), js = /* @__PURE__ */ Eo(L), Ls = /* @__PURE__ */ $o(L), Ds = /* @__PURE__ */ So(L), Ms = /* @__PURE__ */ No(L), Fs = /* @__PURE__ */ Zo(L), R = /* @__PURE__ */ f("ZodType", (e, t) => (C.init(e, t), Object.assign(e["~standard"], {
  jsonSchema: {
    input: ze(e, "input"),
    output: ze(e, "output")
  }
}), e.toJSONSchema = Qi(e, {}), e.def = t, e.type = t.type, Object.defineProperty(e, "_def", { value: t }), e.check = (...n) => e.clone(H(t, {
  checks: [
    ...t.checks ?? [],
    ...n.map((o) => typeof o == "function" ? { _zod: { check: o, def: { check: "custom" }, onattach: [] } } : o)
  ]
}), {
  parent: !0
}), e.with = e.check, e.clone = (n, o) => W(e, n, o), e.brand = () => e, e.register = (n, o) => (n.add(e, o), e), e.parse = (n, o) => Cs(e, n, o, { callee: e.parse }), e.safeParse = (n, o) => Os(e, n, o), e.parseAsync = async (n, o) => Rs(e, n, o, { callee: e.parseAsync }), e.safeParseAsync = async (n, o) => Is(e, n, o), e.spa = e.safeParseAsync, e.encode = (n, o) => xs(e, n, o), e.decode = (n, o) => Ps(e, n, o), e.encodeAsync = async (n, o) => As(e, n, o), e.decodeAsync = async (n, o) => js(e, n, o), e.safeEncode = (n, o) => Ls(e, n, o), e.safeDecode = (n, o) => Ds(e, n, o), e.safeEncodeAsync = async (n, o) => Ms(e, n, o), e.safeDecodeAsync = async (n, o) => Fs(e, n, o), e.refine = (n, o) => e.check(Pa(n, o)), e.superRefine = (n) => e.check(Aa(n)), e.overwrite = (n) => e.check(/* @__PURE__ */ oe(n)), e.optional = () => Tt(e), e.exactOptional = () => za(e), e.nullable = () => Ct(e), e.nullish = () => Tt(Ct(e)), e.nonoptional = (n) => Za(e, n), e.array = () => Ue(e), e.or = (n) => pa([e, n]), e.and = (n) => _a(e, n), e.transform = (n) => Rt(e, ka(n)), e.default = (n) => $a(e, n), e.prefault = (n) => Na(e, n), e.catch = (n) => Ca(e, n), e.pipe = (n) => Rt(e, n), e.readonly = () => Ia(e), e.describe = (n) => {
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
}, e.isOptional = () => e.safeParse(void 0).success, e.isNullable = () => e.safeParse(null).success, e.apply = (n) => n(e), e)), cn = /* @__PURE__ */ f("_ZodString", (e, t) => {
  Ye.init(e, t), R.init(e, t), e._zod.processJSONSchema = (o, r, i) => ts(e, o, r);
  const n = e._zod.bag;
  e.format = n.format ?? null, e.minLength = n.minimum ?? null, e.maxLength = n.maximum ?? null, e.regex = (...o) => e.check(/* @__PURE__ */ Li(...o)), e.includes = (...o) => e.check(/* @__PURE__ */ Fi(...o)), e.startsWith = (...o) => e.check(/* @__PURE__ */ Ui(...o)), e.endsWith = (...o) => e.check(/* @__PURE__ */ Bi(...o)), e.min = (...o) => e.check(/* @__PURE__ */ we(...o)), e.max = (...o) => e.check(/* @__PURE__ */ tn(...o)), e.length = (...o) => e.check(/* @__PURE__ */ nn(...o)), e.nonempty = (...o) => e.check(/* @__PURE__ */ we(1, ...o)), e.lowercase = (o) => e.check(/* @__PURE__ */ Di(o)), e.uppercase = (o) => e.check(/* @__PURE__ */ Mi(o)), e.trim = () => e.check(/* @__PURE__ */ Vi()), e.normalize = (...o) => e.check(/* @__PURE__ */ Ji(...o)), e.toLowerCase = () => e.check(/* @__PURE__ */ Hi()), e.toUpperCase = () => e.check(/* @__PURE__ */ Wi()), e.slugify = () => e.check(/* @__PURE__ */ qi());
}), un = /* @__PURE__ */ f("ZodString", (e, t) => {
  Ye.init(e, t), cn.init(e, t), e.email = (n) => e.check(/* @__PURE__ */ ui(Us, n)), e.url = (n) => e.check(/* @__PURE__ */ pi(Bs, n)), e.jwt = (n) => e.check(/* @__PURE__ */ Ti(ra, n)), e.emoji = (n) => e.check(/* @__PURE__ */ mi(Js, n)), e.guid = (n) => e.check(/* @__PURE__ */ zt(Nt, n)), e.uuid = (n) => e.check(/* @__PURE__ */ li(he, n)), e.uuidv4 = (n) => e.check(/* @__PURE__ */ di(he, n)), e.uuidv6 = (n) => e.check(/* @__PURE__ */ fi(he, n)), e.uuidv7 = (n) => e.check(/* @__PURE__ */ hi(he, n)), e.nanoid = (n) => e.check(/* @__PURE__ */ _i(Vs, n)), e.guid = (n) => e.check(/* @__PURE__ */ zt(Nt, n)), e.cuid = (n) => e.check(/* @__PURE__ */ gi(Hs, n)), e.cuid2 = (n) => e.check(/* @__PURE__ */ bi(Ws, n)), e.ulid = (n) => e.check(/* @__PURE__ */ vi(qs, n)), e.base64 = (n) => e.check(/* @__PURE__ */ Si(ta, n)), e.base64url = (n) => e.check(/* @__PURE__ */ Ni(na, n)), e.xid = (n) => e.check(/* @__PURE__ */ yi(Gs, n)), e.ksuid = (n) => e.check(/* @__PURE__ */ ki(Ks, n)), e.ipv4 = (n) => e.check(/* @__PURE__ */ wi(Xs, n)), e.ipv6 = (n) => e.check(/* @__PURE__ */ zi(Ys, n)), e.cidrv4 = (n) => e.check(/* @__PURE__ */ Ei(Qs, n)), e.cidrv6 = (n) => e.check(/* @__PURE__ */ $i(ea, n)), e.e164 = (n) => e.check(/* @__PURE__ */ Zi(oa, n)), e.datetime = (n) => e.check(ws(n)), e.date = (n) => e.check(Es(n)), e.time = (n) => e.check(Ss(n)), e.duration = (n) => e.check(Zs(n));
});
function j(e) {
  return /* @__PURE__ */ ci(un, e);
}
const T = /* @__PURE__ */ f("ZodStringFormat", (e, t) => {
  Z.init(e, t), cn.init(e, t);
}), Us = /* @__PURE__ */ f("ZodEmail", (e, t) => {
  _r.init(e, t), T.init(e, t);
}), Nt = /* @__PURE__ */ f("ZodGUID", (e, t) => {
  pr.init(e, t), T.init(e, t);
}), he = /* @__PURE__ */ f("ZodUUID", (e, t) => {
  mr.init(e, t), T.init(e, t);
}), Bs = /* @__PURE__ */ f("ZodURL", (e, t) => {
  gr.init(e, t), T.init(e, t);
}), Js = /* @__PURE__ */ f("ZodEmoji", (e, t) => {
  br.init(e, t), T.init(e, t);
}), Vs = /* @__PURE__ */ f("ZodNanoID", (e, t) => {
  vr.init(e, t), T.init(e, t);
}), Hs = /* @__PURE__ */ f("ZodCUID", (e, t) => {
  yr.init(e, t), T.init(e, t);
}), Ws = /* @__PURE__ */ f("ZodCUID2", (e, t) => {
  kr.init(e, t), T.init(e, t);
}), qs = /* @__PURE__ */ f("ZodULID", (e, t) => {
  wr.init(e, t), T.init(e, t);
}), Gs = /* @__PURE__ */ f("ZodXID", (e, t) => {
  zr.init(e, t), T.init(e, t);
}), Ks = /* @__PURE__ */ f("ZodKSUID", (e, t) => {
  Er.init(e, t), T.init(e, t);
}), Xs = /* @__PURE__ */ f("ZodIPv4", (e, t) => {
  Tr.init(e, t), T.init(e, t);
}), Ys = /* @__PURE__ */ f("ZodIPv6", (e, t) => {
  Cr.init(e, t), T.init(e, t);
}), Qs = /* @__PURE__ */ f("ZodCIDRv4", (e, t) => {
  Rr.init(e, t), T.init(e, t);
}), ea = /* @__PURE__ */ f("ZodCIDRv6", (e, t) => {
  Or.init(e, t), T.init(e, t);
}), ta = /* @__PURE__ */ f("ZodBase64", (e, t) => {
  Ir.init(e, t), T.init(e, t);
}), na = /* @__PURE__ */ f("ZodBase64URL", (e, t) => {
  Pr.init(e, t), T.init(e, t);
}), oa = /* @__PURE__ */ f("ZodE164", (e, t) => {
  Ar.init(e, t), T.init(e, t);
}), ra = /* @__PURE__ */ f("ZodJWT", (e, t) => {
  Lr.init(e, t), T.init(e, t);
}), Qe = /* @__PURE__ */ f("ZodNumber", (e, t) => {
  Xt.init(e, t), R.init(e, t), e._zod.processJSONSchema = (o, r, i) => ns(e, o, r), e.gt = (o, r) => e.check(/* @__PURE__ */ $t(o, r)), e.gte = (o, r) => e.check(/* @__PURE__ */ xe(o, r)), e.min = (o, r) => e.check(/* @__PURE__ */ xe(o, r)), e.lt = (o, r) => e.check(/* @__PURE__ */ Et(o, r)), e.lte = (o, r) => e.check(/* @__PURE__ */ Ie(o, r)), e.max = (o, r) => e.check(/* @__PURE__ */ Ie(o, r)), e.int = (o) => e.check(Zt(o)), e.safe = (o) => e.check(Zt(o)), e.positive = (o) => e.check(/* @__PURE__ */ $t(0, o)), e.nonnegative = (o) => e.check(/* @__PURE__ */ xe(0, o)), e.negative = (o) => e.check(/* @__PURE__ */ Et(0, o)), e.nonpositive = (o) => e.check(/* @__PURE__ */ Ie(0, o)), e.multipleOf = (o, r) => e.check(/* @__PURE__ */ St(o, r)), e.step = (o, r) => e.check(/* @__PURE__ */ St(o, r)), e.finite = () => e;
  const n = e._zod.bag;
  e.minValue = Math.max(n.minimum ?? Number.NEGATIVE_INFINITY, n.exclusiveMinimum ?? Number.NEGATIVE_INFINITY) ?? null, e.maxValue = Math.min(n.maximum ?? Number.POSITIVE_INFINITY, n.exclusiveMaximum ?? Number.POSITIVE_INFINITY) ?? null, e.isInt = (n.format ?? "").includes("int") || Number.isSafeInteger(n.multipleOf ?? 0.5), e.isFinite = !0, e.format = n.format ?? null;
});
function ia(e) {
  return /* @__PURE__ */ xi(Qe, e);
}
const sa = /* @__PURE__ */ f("ZodNumberFormat", (e, t) => {
  Dr.init(e, t), Qe.init(e, t);
});
function Zt(e) {
  return /* @__PURE__ */ Pi(sa, e);
}
const aa = /* @__PURE__ */ f("ZodBoolean", (e, t) => {
  Mr.init(e, t), R.init(e, t), e._zod.processJSONSchema = (n, o, r) => os(e, n, o);
}), ca = /* @__PURE__ */ f("ZodUnknown", (e, t) => {
  Fr.init(e, t), R.init(e, t), e._zod.processJSONSchema = (n, o, r) => is();
});
function Ee() {
  return /* @__PURE__ */ Ai(ca);
}
const ua = /* @__PURE__ */ f("ZodNever", (e, t) => {
  Ur.init(e, t), R.init(e, t), e._zod.processJSONSchema = (n, o, r) => rs(e, n, o);
});
function la(e) {
  return /* @__PURE__ */ ji(ua, e);
}
const da = /* @__PURE__ */ f("ZodArray", (e, t) => {
  Br.init(e, t), R.init(e, t), e._zod.processJSONSchema = (n, o, r) => us(e, n, o, r), e.element = t.element, e.min = (n, o) => e.check(/* @__PURE__ */ we(n, o)), e.nonempty = (n) => e.check(/* @__PURE__ */ we(1, n)), e.max = (n, o) => e.check(/* @__PURE__ */ tn(n, o)), e.length = (n, o) => e.check(/* @__PURE__ */ nn(n, o)), e.unwrap = () => e.element;
});
function Ue(e, t) {
  return /* @__PURE__ */ Gi(da, e, t);
}
const fa = /* @__PURE__ */ f("ZodObject", (e, t) => {
  Vr.init(e, t), R.init(e, t), e._zod.processJSONSchema = (n, o, r) => ls(e, n, o, r), N(e, "shape", () => t.shape), e.keyof = () => va(Object.keys(e._zod.def.shape)), e.catchall = (n) => e.clone({ ...e._zod.def, catchall: n }), e.passthrough = () => e.clone({ ...e._zod.def, catchall: Ee() }), e.loose = () => e.clone({ ...e._zod.def, catchall: Ee() }), e.strict = () => e.clone({ ...e._zod.def, catchall: la() }), e.strip = () => e.clone({ ...e._zod.def, catchall: void 0 }), e.extend = (n) => fo(e, n), e.safeExtend = (n) => ho(e, n), e.merge = (n) => po(e, n), e.pick = (n) => uo(e, n), e.omit = (n) => lo(e, n), e.partial = (...n) => mo(tt, e, n[0]), e.required = (...n) => _o(dn, e, n[0]);
});
function et(e, t) {
  const n = {
    type: "object",
    shape: e ?? {},
    ...b(t)
  };
  return new fa(n);
}
const ha = /* @__PURE__ */ f("ZodUnion", (e, t) => {
  Hr.init(e, t), R.init(e, t), e._zod.processJSONSchema = (n, o, r) => ds(e, n, o, r), e.options = t.options;
});
function pa(e, t) {
  return new ha({
    type: "union",
    options: e,
    ...b(t)
  });
}
const ma = /* @__PURE__ */ f("ZodIntersection", (e, t) => {
  Wr.init(e, t), R.init(e, t), e._zod.processJSONSchema = (n, o, r) => fs(e, n, o, r);
});
function _a(e, t) {
  return new ma({
    type: "intersection",
    left: e,
    right: t
  });
}
const ga = /* @__PURE__ */ f("ZodRecord", (e, t) => {
  qr.init(e, t), R.init(e, t), e._zod.processJSONSchema = (n, o, r) => hs(e, n, o, r), e.keyType = t.keyType, e.valueType = t.valueType;
});
function ba(e, t, n) {
  return new ga({
    type: "record",
    keyType: e,
    valueType: t,
    ...b(n)
  });
}
const $e = /* @__PURE__ */ f("ZodEnum", (e, t) => {
  Gr.init(e, t), R.init(e, t), e._zod.processJSONSchema = (o, r, i) => ss(e, o, r), e.enum = t.entries, e.options = Object.values(t.entries);
  const n = new Set(Object.keys(t.entries));
  e.extract = (o, r) => {
    const i = {};
    for (const s of o)
      if (n.has(s))
        i[s] = t.entries[s];
      else
        throw new Error(`Key ${s} not found in enum`);
    return new $e({
      ...t,
      checks: [],
      ...b(r),
      entries: i
    });
  }, e.exclude = (o, r) => {
    const i = { ...t.entries };
    for (const s of o)
      if (n.has(s))
        delete i[s];
      else
        throw new Error(`Key ${s} not found in enum`);
    return new $e({
      ...t,
      checks: [],
      ...b(r),
      entries: i
    });
  };
});
function va(e, t) {
  const n = Array.isArray(e) ? Object.fromEntries(e.map((o) => [o, o])) : e;
  return new $e({
    type: "enum",
    entries: n,
    ...b(t)
  });
}
const ya = /* @__PURE__ */ f("ZodTransform", (e, t) => {
  Kr.init(e, t), R.init(e, t), e._zod.processJSONSchema = (n, o, r) => cs(e, n), e._zod.parse = (n, o) => {
    if (o.direction === "backward")
      throw new Pt(e.constructor.name);
    n.addIssue = (i) => {
      if (typeof i == "string")
        n.issues.push(ue(i, n.value, t));
      else {
        const s = i;
        s.fatal && (s.continue = !1), s.code ?? (s.code = "custom"), s.input ?? (s.input = n.value), s.inst ?? (s.inst = e), n.issues.push(ue(s));
      }
    };
    const r = t.transform(n.value, n);
    return r instanceof Promise ? r.then((i) => (n.value = i, n)) : (n.value = r, n);
  };
});
function ka(e) {
  return new ya({
    type: "transform",
    transform: e
  });
}
const tt = /* @__PURE__ */ f("ZodOptional", (e, t) => {
  en.init(e, t), R.init(e, t), e._zod.processJSONSchema = (n, o, r) => an(e, n, o, r), e.unwrap = () => e._zod.def.innerType;
});
function Tt(e) {
  return new tt({
    type: "optional",
    innerType: e
  });
}
const wa = /* @__PURE__ */ f("ZodExactOptional", (e, t) => {
  Xr.init(e, t), R.init(e, t), e._zod.processJSONSchema = (n, o, r) => an(e, n, o, r), e.unwrap = () => e._zod.def.innerType;
});
function za(e) {
  return new wa({
    type: "optional",
    innerType: e
  });
}
const Ea = /* @__PURE__ */ f("ZodNullable", (e, t) => {
  Yr.init(e, t), R.init(e, t), e._zod.processJSONSchema = (n, o, r) => ps(e, n, o, r), e.unwrap = () => e._zod.def.innerType;
});
function Ct(e) {
  return new Ea({
    type: "nullable",
    innerType: e
  });
}
const ln = /* @__PURE__ */ f("ZodDefault", (e, t) => {
  Qr.init(e, t), R.init(e, t), e._zod.processJSONSchema = (n, o, r) => _s(e, n, o, r), e.unwrap = () => e._zod.def.innerType, e.removeDefault = e.unwrap;
});
function $a(e, t) {
  return new ln({
    type: "default",
    innerType: e,
    get defaultValue() {
      return typeof t == "function" ? t() : Dt(t);
    }
  });
}
const Sa = /* @__PURE__ */ f("ZodPrefault", (e, t) => {
  ei.init(e, t), R.init(e, t), e._zod.processJSONSchema = (n, o, r) => gs(e, n, o, r), e.unwrap = () => e._zod.def.innerType;
});
function Na(e, t) {
  return new Sa({
    type: "prefault",
    innerType: e,
    get defaultValue() {
      return typeof t == "function" ? t() : Dt(t);
    }
  });
}
const dn = /* @__PURE__ */ f("ZodNonOptional", (e, t) => {
  ti.init(e, t), R.init(e, t), e._zod.processJSONSchema = (n, o, r) => ms(e, n, o, r), e.unwrap = () => e._zod.def.innerType;
});
function Za(e, t) {
  return new dn({
    type: "nonoptional",
    innerType: e,
    ...b(t)
  });
}
const Ta = /* @__PURE__ */ f("ZodCatch", (e, t) => {
  ni.init(e, t), R.init(e, t), e._zod.processJSONSchema = (n, o, r) => bs(e, n, o, r), e.unwrap = () => e._zod.def.innerType, e.removeCatch = e.unwrap;
});
function Ca(e, t) {
  return new Ta({
    type: "catch",
    innerType: e,
    catchValue: typeof t == "function" ? t : () => t
  });
}
const Ra = /* @__PURE__ */ f("ZodPipe", (e, t) => {
  oi.init(e, t), R.init(e, t), e._zod.processJSONSchema = (n, o, r) => vs(e, n, o, r), e.in = t.in, e.out = t.out;
});
function Rt(e, t) {
  return new Ra({
    type: "pipe",
    in: e,
    out: t
    // ...util.normalizeParams(params),
  });
}
const Oa = /* @__PURE__ */ f("ZodReadonly", (e, t) => {
  ri.init(e, t), R.init(e, t), e._zod.processJSONSchema = (n, o, r) => ys(e, n, o, r), e.unwrap = () => e._zod.def.innerType;
});
function Ia(e) {
  return new Oa({
    type: "readonly",
    innerType: e
  });
}
const xa = /* @__PURE__ */ f("ZodCustom", (e, t) => {
  ii.init(e, t), R.init(e, t), e._zod.processJSONSchema = (n, o, r) => as(e, n);
});
function Pa(e, t = {}) {
  return /* @__PURE__ */ Ki(xa, e, t);
}
function Aa(e) {
  return /* @__PURE__ */ Xi(e);
}
const ja = /* @__PURE__ */ new Set(["id", "image"]);
function Be(e) {
  return e instanceof tt ? Be(e.unwrap()) : e instanceof ln ? Be(e._def.innerType) : e;
}
function La(e) {
  const t = [];
  for (const [n, o] of Object.entries(e.shape)) {
    if (ja.has(n)) continue;
    const r = o, i = Be(r), s = r.description ?? n;
    if (i instanceof aa) {
      t.push({ key: n, label: s, type: "boolean" });
      continue;
    }
    if (i instanceof $e) {
      t.push({ key: n, label: s, type: "select", options: i.options });
      continue;
    }
    if (i instanceof Qe) {
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
    if (i instanceof un) {
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
const fn = et({
  id: j(),
  image: j().optional()
}).passthrough(), Da = fn.extend({
  target: j().max(2).describe("אות יעד"),
  correct: j().describe("תשובה נכונה"),
  correctEmoji: j().describe("אמוג'י")
}), Ma = fn.extend({
  target: j().max(2).describe("אות יעד"),
  correct: j().describe("תשובה נכונה"),
  correctEmoji: j().describe("אמוג'י")
}), Fa = et({
  title: j().default(""),
  type: j().default("multiple-choice")
}).passthrough(), yc = et({
  id: j(),
  version: ia().default(1),
  meta: Fa.default({}),
  rounds: Ue(ba(j(), Ee())).default([]),
  distractors: Ue(Ee()).default([])
}), Ot = {
  "multiple-choice": Da,
  "drag-match": Ma
};
function Ua(e, { onFieldChange: t, onDeleteRound: n, roundSchema: o }) {
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
  function l(m, k = "multiple-choice") {
    c = m.id, s.innerHTML = "", a.hidden = !1;
    const h = o ?? Ot[k] ?? Ot["multiple-choice"];
    La(h).forEach((v) => s.appendChild(d(v, m))), s.appendChild(w(m)), a.onclick = () => {
      confirm("למחוק את הסיבוב הזה?") && (n(c), u());
    };
  }
  function d(m, k) {
    const h = document.createElement("div");
    h.className = "ab-editor-field";
    const z = document.createElement("label");
    switch (z.className = "ab-editor-field__label", z.textContent = m.label, h.appendChild(z), m.type) {
      case "emoji":
        h.appendChild(_(m, k));
        break;
      case "boolean":
        h.appendChild(y(m, k));
        break;
      case "select":
        h.appendChild(g(m, k));
        break;
      case "number":
        h.appendChild(E(m, k));
        break;
      default:
        h.appendChild(p(m, k));
        break;
    }
    return h;
  }
  function p(m, k) {
    const h = document.createElement("input");
    return h.className = "ab-editor-field__input", h.type = "text", h.value = String(k[m.key] ?? ""), h.dir = "rtl", m.maxLength && (h.maxLength = m.maxLength), h.addEventListener("input", () => t(c, m.key, h.value)), h;
  }
  function _(m, k) {
    const h = document.createElement("div");
    h.className = "ab-editor-field__emoji-row";
    const z = document.createElement("div");
    z.className = "ab-editor-field__emoji-preview", z.textContent = String(k[m.key] ?? "❓"), h.appendChild(z);
    const v = document.createElement("input");
    return v.className = "ab-editor-field__input", v.type = "text", v.value = String(k[m.key] ?? ""), v.maxLength = 8, v.placeholder = "🐱", v.style.fontSize = "20px", v.addEventListener("input", () => {
      z.textContent = v.value || "❓", t(c, m.key, v.value);
    }), h.appendChild(v), h;
  }
  function y(m, k) {
    const h = document.createElement("input");
    return h.type = "checkbox", h.checked = !!k[m.key], h.addEventListener("change", () => t(c, m.key, h.checked)), h;
  }
  function g(m, k) {
    const h = document.createElement("select");
    return h.className = "ab-editor-field__input", (m.options ?? []).forEach((z) => {
      const v = document.createElement("option");
      v.value = z, v.textContent = z, k[m.key] === z && (v.selected = !0), h.appendChild(v);
    }), h.addEventListener("change", () => t(c, m.key, h.value)), h;
  }
  function E(m, k) {
    const h = document.createElement("input");
    return h.className = "ab-editor-field__input", h.type = "number", h.value = String(k[m.key] ?? ""), m.min !== void 0 && (h.min = String(m.min)), m.max !== void 0 && (h.max = String(m.max)), h.addEventListener("input", () => t(c, m.key, Number(h.value))), h;
  }
  function w(m) {
    const k = document.createElement("div");
    k.className = "ab-editor-field ab-editor-field--image";
    const h = document.createElement("label");
    h.className = "ab-editor-field__label", h.textContent = "🖼 תמונה", k.appendChild(h);
    const z = document.createElement("div");
    z.className = "ab-editor-field__img-row";
    const v = document.createElement("div");
    v.className = "ab-editor-field__img-preview", m.image && (v.style.backgroundImage = `url(${m.image})`), z.appendChild(v);
    const D = document.createElement("div");
    D.className = "ab-editor-field__img-btns";
    const S = document.createElement("input");
    S.type = "file", S.accept = "image/*", S.style.display = "none", S.addEventListener("change", () => {
      var nt;
      const le = (nt = S.files) == null ? void 0 : nt[0];
      if (!le) return;
      const M = new FileReader();
      M.onload = (_n) => {
        const ot = _n.target.result;
        v.style.backgroundImage = `url(${ot})`, I.textContent = "🔄 החלף", t(c, "image", ot), A.isConnected || D.appendChild(A);
      }, M.readAsDataURL(le);
    }), D.appendChild(S);
    const I = document.createElement("button");
    I.className = "ab-editor-btn ab-editor-btn--img-upload", I.textContent = m.image ? "🔄 החלף" : "📤 העלה", I.addEventListener("click", () => S.click()), D.appendChild(I);
    const A = document.createElement("button");
    return A.className = "ab-editor-btn ab-editor-btn--img-clear", A.textContent = "✕ הסר", A.addEventListener("click", () => {
      v.style.backgroundImage = "", I.textContent = "📤 העלה", t(c, "image", null), A.remove();
    }), m.image && D.appendChild(A), z.appendChild(D), k.appendChild(z), k;
  }
  function $() {
    r.remove();
  }
  return u(), { loadRound: l, clear: u, destroy: $ };
}
let Ba = 0;
function Pe() {
  return `round-${Date.now()}-${Ba++}`;
}
class Se {
  // redo stack
  constructor(t) {
    this._id = t.id ?? "game", this._version = t.version ?? 1, this._meta = { title: "", type: "multiple-choice", ...t.meta ?? {} }, this._rounds = (t.rounds ?? []).map((n) => ({ ...n, id: n.id || Pe() })), this._distractors = t.distractors ?? [], this._handlers = [], this._past = [], this._future = [];
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
    const n = { id: Pe(), target: "", correct: "", correctEmoji: "❓" };
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
    const o = { ...n, id: Pe() };
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
    return new Se(t);
  }
  static fromRoundsArray(t, n, o = {}, r = []) {
    return new Se({ id: t, meta: o, rounds: n, distractors: r });
  }
}
const hn = "alefbet.editor.";
function pn(e) {
  return xt(`${hn}${e}`, null);
}
function Ja(e) {
  pn(e.id).set(e.toJSON());
}
function kc(e) {
  const t = pn(e).get();
  if (!t) return null;
  try {
    return Se.fromJSON(t);
  } catch {
    return null;
  }
}
function wc(e) {
  try {
    localStorage.removeItem(`${hn}${e}`);
  } catch {
  }
}
function Va(e) {
  const t = JSON.stringify(e.toJSON(), null, 2), n = new Blob([t], { type: "application/json;charset=utf-8" }), o = URL.createObjectURL(n), r = document.createElement("a");
  r.href = o, r.download = `${e.id}-rounds.json`, r.click(), URL.revokeObjectURL(o);
}
const Ha = [
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
function Wa(e) {
  return e.trim().replace(/\s+/g, "-").replace(/[^a-z0-9\u05D0-\u05EA_-]/gi, "").toLowerCase() || `custom-${Date.now()}`;
}
function qa(e) {
  return xt(`alefbet.audio-manager.${e}.custom`, []);
}
function Ga(e, t = null) {
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
  const o = n.querySelector("#ab-am-body"), r = n.querySelector(".ab-am-close"), i = n.querySelector(".ab-am-backdrop"), s = [], a = [...Ha];
  t && t.rounds.length > 0 && a.splice(1, 0, {
    // insert after Instructions
    id: "rounds",
    label: "🔤 שאלות / סיבובים",
    slots: t.rounds.map((l, d) => ({
      key: l.id,
      label: `סיבוב ${d + 1}${l.target ? " — " + l.target : ""}${l.correct ? " (" + l.correct + ")" : ""}`
    }))
  }), a.forEach((l) => {
    o.appendChild(Ka(l, e, s));
  }), o.appendChild(Xa(e, s));
  function c() {
    s.forEach((l) => l.destroy()), n.remove();
  }
  r.addEventListener("click", c), i.addEventListener("click", c), document.addEventListener("keydown", function l(d) {
    d.key === "Escape" && (c(), document.removeEventListener("keydown", l));
  });
}
function Ka(e, t, n) {
  const o = document.createElement("section");
  o.className = "ab-am-section";
  const r = document.createElement("button");
  r.className = "ab-am-section__heading", r.setAttribute("aria-expanded", "true"), r.innerHTML = `<span>${e.label}</span><span class="ab-am-chevron">▾</span>`, o.appendChild(r);
  const i = document.createElement("div");
  return i.className = "ab-am-grid", o.appendChild(i), e.slots.forEach((s) => {
    i.appendChild(mn(t, s.key, s.label, n));
  }), r.addEventListener("click", () => {
    const s = r.getAttribute("aria-expanded") === "true";
    r.setAttribute("aria-expanded", String(!s)), i.hidden = s, r.querySelector(".ab-am-chevron").textContent = s ? "▸" : "▾";
  }), o;
}
function Xa(e, t) {
  const n = qa(e), o = document.createElement("section");
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
      const p = mn(e, d.key, d.label, t, () => {
        n.update((_) => _.filter((y) => y.key !== d.key)), s();
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
    const p = Wa(d);
    if (n.get().some((_) => _.key === p)) {
      c.select();
      return;
    }
    n.update((_) => [..._, { key: p, label: d }]), c.value = "", s();
  }
  return u.addEventListener("click", l), c.addEventListener("keydown", (d) => {
    d.key === "Enter" && l();
  }), r.addEventListener("click", () => {
    const d = r.getAttribute("aria-expanded") === "true";
    r.setAttribute("aria-expanded", String(!d)), i.hidden = d, a.hidden = d, r.querySelector(".ab-am-chevron").textContent = d ? "▸" : "▾";
  }), o;
}
function mn(e, t, n, o, r = null) {
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
  const l = Wn(u, { gameId: e, voiceKey: t, label: n });
  return o.push(l), i._voiceBtn = l, i.appendChild(c), i.appendChild(u), i;
}
class zc {
  constructor(t, n, o = {}) {
    this._mode = "play", this._overlay = null, this._navigator = null, this._inspector = null, this._toolbar = null, this._selectedId = null, this._undoBtn = null, this._redoBtn = null, this._shortcutHandler = null, this._container = t, this._gameData = n, this._restartGame = o.restartGame, this._roundSchema = o.roundSchema, requestAnimationFrame(() => this._injectToolbar());
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
      this._makeBtn("💾 שמור", "ab-editor-btn--save", () => this._save()),
      this._makeBtn("🎤 קול", "ab-editor-btn--audio", () => this._openAudioManager()),
      this._makeBtn("⬇ ייצוא", "ab-editor-btn--export", () => Va(this._gameData))
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
    this._overlay = to(t), this._overlay.show(), this._navigator = no(this._container, this._gameData, {
      onSelectRound: (o) => this._selectRound(o),
      onAddRound: (o) => this._addRound(o),
      onDuplicateRound: (o) => this._duplicateRound(o),
      onMoveRound: (o, r) => this._moveRound(o, r)
    }), this._inspector = Ua(this._container, {
      onFieldChange: (o, r, i) => this._onFieldChange(o, r, i),
      onDeleteRound: (o) => this._deleteRound(o),
      roundSchema: this._roundSchema
    });
    const n = this._gameData.rounds;
    n.length > 0 && this._selectRound(n[0].id);
  }
  enterPlayMode() {
    var t, n, o, r;
    this._mode !== "play" && (this._mode = "play", this._container.classList.remove("ab-editor-active"), this._setToolbarPlayMode(), this._detachShortcuts(), (t = this._overlay) == null || t.destroy(), (n = this._navigator) == null || n.destroy(), (o = this._inspector) == null || o.destroy(), this._overlay = this._navigator = this._inspector = null, this._selectedId = null, (r = this._restartGame) == null || r.call(this, this._container));
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
  // ── Helpers ───────────────────────────────────────────────────────────────
  _openAudioManager() {
    Ga(this._gameData.id, this._gameData);
  }
  _save() {
    Ja(this._gameData), this._showToast("✅ נשמר!");
  }
  _showToast(t) {
    const n = document.createElement("div");
    n.className = "ab-editor-toast", n.textContent = t, document.body.appendChild(n), setTimeout(() => n.remove(), 2200);
  }
}
export {
  Ot as BUILTIN_ROUND_SCHEMAS,
  fn as BaseRoundSchema,
  Ma as DragMatchRoundSchema,
  gn as EventBus,
  Se as GameData,
  yc as GameDataSchema,
  zc as GameEditor,
  Fa as GameMetaSchema,
  Ya as GameShell,
  bn as GameState,
  Da as MultipleChoiceRoundSchema,
  zn as addNikud,
  me as animate,
  wc as clearGameData,
  vc as createAppShell,
  Qn as createDragSource,
  eo as createDropTarget,
  fc as createFeedback,
  xt as createLocalState,
  bc as createNikudBox,
  lc as createOptionCards,
  dc as createProgressBar,
  ec as createRoundManager,
  tc as createSpeechListener,
  Wn as createVoiceRecordButton,
  Mn as createVoiceRecorder,
  pc as createZone,
  Jn as deleteVoice,
  Va as exportGameDataAsJSON,
  ic as getLetter,
  Hn as getLettersByGroup,
  En as getNikud,
  rc as hasVoice,
  _e as hebrewLetters,
  _c as hideLoadingScreen,
  gc as injectHeaderButton,
  Dn as isVoiceRecordingSupported,
  cc as letterWithNikud,
  oc as listVoiceKeys,
  kc as loadGameData,
  Ve as loadVoice,
  nc as matchNikudSound,
  ac as nikudBaseLetters,
  be as nikudList,
  Vn as playVoice,
  Qa as preloadNikud,
  sc as randomLetters,
  uc as randomNikud,
  Ja as saveGameData,
  Bn as saveVoice,
  La as schemaToFields,
  Ga as showAudioManager,
  Pn as showCompletionScreen,
  mc as showLoadingScreen,
  hc as showNikudSettingsDialog,
  ge as sounds,
  In as tts
};
