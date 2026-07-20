class po {
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
class ho {
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
class mo {
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
    }, this.events = new po(), this.state = new ho(this.config.totalRounds), this._buildShell();
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
let Se = null;
function bo() {
  if (!Se)
    try {
      Se = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      return null;
    }
  return Se.state === "suspended" && Se.resume(), Se;
}
function be(e, t, n = "sine", o = 0.3) {
  const r = bo();
  if (r)
    try {
      const i = r.createOscillator(), s = r.createGain();
      i.connect(s), s.connect(r.destination), i.type = n, i.frequency.setValueAtTime(e, r.currentTime), s.gain.setValueAtTime(o, r.currentTime), s.gain.exponentialRampToValueAtTime(1e-3, r.currentTime + t), i.start(r.currentTime), i.stop(r.currentTime + t + 0.05);
    } catch {
    }
}
const qe = {
  /** צליל תשובה נכונה */
  correct() {
    be(523.25, 0.15), setTimeout(() => be(659.25, 0.2), 120), setTimeout(() => be(783.99, 0.3), 240);
  },
  /** צליל עידוד עדין — נסה שוב */
  wrong() {
    be(350, 0.15, "triangle", 0.12);
  },
  /** צליל עידוד - סיום מוצלח */
  cheer() {
    [523.25, 587.33, 659.25, 698.46, 783.99, 1046.5].forEach((t, n) => setTimeout(() => be(t, 0.2), n * 90));
  },
  /** קליק עדין */
  click() {
    be(900, 0.04, "sine", 0.12);
  }
}, Ot = "https://nakdan-u1-0.loadbalancer.dicta.org.il/api";
let Pt = !1;
const Te = /* @__PURE__ */ new Map();
function go() {
  var r;
  if (typeof window > "u") return Ot;
  const e = new URLSearchParams(window.location.search).get("nakdanProxy"), t = window.ALEFBET_NAKDAN_PROXY_URL;
  if (e && window.localStorage)
    try {
      window.localStorage.setItem("alefbet.nakdanProxyUrl", e);
    } catch {
    }
  const n = (r = window.localStorage) == null ? void 0 : r.getItem("alefbet.nakdanProxyUrl"), o = e || t || n;
  return o || (window.location.hostname.endsWith("github.io") ? null : Ot);
}
function _o(e) {
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
async function vo(e) {
  const t = go();
  if (!t)
    throw Pt || (Pt = !0, console.warn("[nakdan] Dicta API blocked by CORS on GitHub Pages. Configure a proxy URL via ?nakdanProxy=..., window.ALEFBET_NAKDAN_PROXY_URL, or localStorage key alefbet.nakdanProxyUrl.")), new Error("Nakdan unavailable without proxy on this host");
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
  return _o(r);
}
async function yo(e) {
  if (!(e != null && e.trim())) return e ?? "";
  if (Te.has(e)) return Te.get(e);
  try {
    const t = await vo(e);
    return Te.set(e, t), t;
  } catch {
    return Te.set(e, e), e;
  }
}
function wo(e) {
  return Te.get(e) ?? e ?? "";
}
async function ko(e) {
  const t = [...new Set(e.filter((n) => n == null ? void 0 : n.trim()))];
  await Promise.all(t.map((n) => yo(n)));
}
const oe = [
  { id: "kamatz", name: "קָמָץ", nameNikud: "קָמָץ", symbol: "ָ", sound: "אָה", color: "#C9442C", textColor: "#fff" },
  { id: "patah", name: "פֶּתַח", nameNikud: "פָּתַח", symbol: "ַ", sound: "אָה", color: "#C58119", textColor: "#fff" },
  { id: "hiriq", name: "חִירִיק", nameNikud: "חִירִיק", symbol: "ִ", sound: "אִי", color: "#2A7B71", textColor: "#fff" },
  { id: "tzere", name: "צָרָה", nameNikud: "צֵרֶה", symbol: "ֵ", sound: "אֶה", color: "#4A6B8C", textColor: "#fff" },
  { id: "segol", name: "סָגֹול", nameNikud: "סְגוֹל", symbol: "ֶ", sound: "אֶה", color: "#783952", textColor: "#fff" },
  { id: "holam", name: "חוֹלֵם", nameNikud: "חוֹלָם", symbol: "ֹ", sound: "אוֹ", color: "#5F7A42", textColor: "#fff" },
  { id: "kubbutz", name: "קֻובּוּץ", nameNikud: "קֻבּוּץ", symbol: "ֻ", sound: "אוּ", color: "#6B4A8A", textColor: "#fff" }
], Eo = ["א", "ב", "ג", "ד", "מ", "נ", "ל", "ר", "ש", "ת", "פ", "ק"];
function zo(e, t) {
  return e + t;
}
function Tu(e) {
  let t = [...oe];
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
  t.length === 0 && (t = [...oe]);
  let n = [...t];
  for (; n.length < e; )
    n.push(...t);
  return n.sort(() => Math.random() - 0.5).slice(0, e);
}
const So = 2e3;
let te = [], Ae = !1, kt = !0, de = 0.9, ut = typeof localStorage < "u" && parseFloat(localStorage.getItem("alefbet.nikudRate")) || 0.5, Ue = !1, $e = null, fe = null, Y = null, ue = null, pn = null, He = !1, K = "idle";
function bt() {
  return typeof speechSynthesis < "u" || typeof Audio < "u";
}
function $o() {
  return typeof speechSynthesis < "u" || kt && typeof Audio < "u";
}
function Q(e, t) {
  if (K === e) return;
  const n = K;
  if (K = e, typeof window < "u" && typeof window.dispatchEvent == "function") {
    const o = { state: e, previousState: n };
    t && (o.reason = t), window.dispatchEvent(new CustomEvent("alefbet:tts-state", { detail: o }));
  }
}
function No() {
  bt() ? K = "idle" : Q("unsupported", "no-audio-capability");
}
No();
function Re(e, t, n, o = t) {
  pn = String(n || "unknown"), console.warn(`[tts] ${e} TTS failed`, { text: t, sentText: o, reason: n }), typeof window < "u" && typeof window.dispatchEvent == "function" && window.dispatchEvent(new CustomEvent("alefbet:tts-error", {
    detail: { provider: e, text: t, sentText: o, reason: n }
  }));
}
function Co(e) {
  return (e || "").replace(/[֑-ׇ]/g, "");
}
function xo(e) {
  const t = String(e || "").toLowerCase();
  return t.includes("didn't interact") || t.includes("notallowed") || t.includes("user gesture");
}
function To() {
  var e;
  return typeof window > "u" || typeof document > "u" ? Promise.resolve() : Ue || (e = document.userActivation) != null && e.hasBeenActive ? (Ue = !0, Promise.resolve()) : $e || ($e = new Promise((t) => {
    const n = () => {
      Ue = !0, window.removeEventListener("pointerdown", n, !0), window.removeEventListener("keydown", n, !0), window.removeEventListener("touchstart", n, !0), t();
    };
    window.addEventListener("pointerdown", n, { once: !0, capture: !0 }), window.addEventListener("keydown", n, { once: !0, capture: !0 }), window.addEventListener("touchstart", n, { once: !0, capture: !0 });
  }).finally(() => {
    $e = null;
  }), $e);
}
function Ao(e, t, n) {
  const r = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(e)}&tl=he&client=tw-ob`, i = new Audio(r);
  Y = i, i.playbackRate = de, i.onended = () => {
    Y === i && (Y = null), t();
  }, i.onerror = () => {
    Y === i && (Y = null), n("audio.onerror");
  };
  const s = i.play();
  s && typeof s.catch == "function" && s.catch((a) => {
    n((a == null ? void 0 : a.message) || (a == null ? void 0 : a.name) || "audio.play() rejected");
  });
}
function Zo(e, t = {}) {
  return new Promise((n, o) => {
    if (typeof Audio > "u") {
      o(new Error("Audio constructor unavailable"));
      return;
    }
    const r = t.keepNikud ? e : Co(e).trim() || e;
    let i = !1, s = !1;
    const a = () => {
      i || (i = !0, n());
    }, c = (l) => {
      i || (i = !0, o(l instanceof Error ? l : new Error(String(l))));
    }, u = () => {
      try {
        Ao(r, a, (l) => {
          if (!s && xo(l)) {
            s = !0, He || (He = !0, Q("awaiting-interaction", "autoplay-blocked")), To().then(() => {
              He = !1, i || u();
            });
            return;
          }
          Re("google", e, l, r), c(l);
        });
      } catch (l) {
        const d = (l == null ? void 0 : l.message) || "Audio() construction failed";
        Re("google", e, d, r), c(d);
      }
    };
    u();
  });
}
let le = null, Ne = null, lt = !1, Mt = !1;
const Lo = ["carmit", "hila", "female"];
function Ro(e) {
  const t = (e.name || "").toLowerCase();
  return Lo.some((n) => t.includes(n));
}
function dt() {
  if (typeof speechSynthesis > "u") return null;
  const t = speechSynthesis.getVoices().filter(
    (n) => n.lang === "he-IL" || n.lang === "iw-IL" || (n.lang || "").startsWith("he")
  );
  return t.length === 0 ? null : t.find(Ro) || t[0];
}
function Io() {
  return typeof speechSynthesis > "u" ? Promise.resolve() : (le = dt(), le ? (lt = !0, Promise.resolve()) : lt ? Promise.resolve() : Ne || (Ne = new Promise((e) => {
    let t = !1;
    const n = () => {
      t || (t = !0, lt = !0, le = dt(), typeof speechSynthesis < "u" && typeof speechSynthesis.removeEventListener == "function" && speechSynthesis.removeEventListener("voiceschanged", o), clearTimeout(r), e());
    }, o = () => {
      le = dt(), le && n();
    };
    typeof speechSynthesis.addEventListener == "function" && speechSynthesis.addEventListener("voiceschanged", o);
    const r = setTimeout(() => {
      Mt || (Mt = !0, Re("browser", "", "voice-load-timeout")), n();
    }, So);
  }).finally(() => {
    Ne = null;
  }), Ne));
}
async function Oo(e) {
  if (typeof speechSynthesis > "u")
    throw new Error("speechSynthesis unavailable");
  return await Io(), new Promise((t, n) => {
    try {
      if (typeof SpeechSynthesisUtterance > "u") {
        n(new Error("SpeechSynthesisUtterance unavailable"));
        return;
      }
      const o = new SpeechSynthesisUtterance(e);
      o.lang = "he-IL", o.rate = de, le && (o.voice = le), ue = o, o.onend = () => {
        ue === o && (ue = null), t();
      }, o.onerror = (r) => {
        ue === o && (ue = null);
        const i = r && r.error || "speech-error";
        Re("browser", e, String(i)), n(new Error(String(i)));
      }, speechSynthesis.speak(o);
    } catch (o) {
      const r = (o == null ? void 0 : o.message) || "browser-speak-threw";
      Re("browser", e, r), n(o instanceof Error ? o : new Error(r));
    }
  });
}
async function Po(e, t = {}) {
  let n = "";
  const o = typeof navigator < "u" && navigator.onLine === !1;
  if (kt && !o && typeof Audio < "u")
    try {
      return await Zo(e, t), { ok: !0 };
    } catch (r) {
      n = (r == null ? void 0 : r.message) || "google-failed", console.info("[tts] Falling back to browser Speech API");
    }
  if (typeof speechSynthesis < "u")
    try {
      return await Oo(e), { ok: !0 };
    } catch (r) {
      n = (r == null ? void 0 : r.message) || "browser-failed";
    }
  else n || (n = "no-provider");
  return { ok: !1, reason: n };
}
function we() {
  if (Ae || te.length === 0) return;
  const e = te.shift();
  Ae = !0, fe = e;
  const t = de, n = typeof e.rate == "number";
  n && (de = e.rate), Po(e.text, { keepNikud: e.keepNikud === !0 }).then((o) => {
    n && (de = t), Ae = !1;
    const r = fe === e;
    if (fe = null, !r) {
      we();
      return;
    }
    o.ok ? K !== "unsupported" && Q("ready") : $o() ? Q("failed", o.reason) : Q("unsupported", o.reason || "no-provider"), e.resolve(), we();
  }).catch((o) => {
    n && (de = t), Ae = !1, fe = null, Q("failed", (o == null ? void 0 : o.message) || "unknown"), e.resolve(), we();
  });
}
const he = {
  /**
   * הקרא טקסט עברי. ה-promise תמיד נפתר (גם בכשל) כדי שמשחקים לא יתקעו.
   * @param {string} text
   * @returns {Promise<void>}
   */
  speak(e) {
    const t = wo(e);
    return new Promise((n) => {
      te.push({ text: t, resolve: n }), we();
    });
  },
  /**
   * עצור את כל הדיבור הנוכחי וניקה את התור.
   * - כל ה-promises שבתור נפתרים (לא נדחים).
   * - אם יש פריט "in-flight" - גם הוא נפתר.
   * - אם הדפדפן תומך - speechSynthesis.cancel() יקרא פעם אחת.
   * - אם יש Audio של גוגל מנגן - הוא יושתק (pause + src='').
   * - המצב חוזר ל-idle.
   */
  cancel() {
    var e;
    if (fe) {
      try {
        fe.resolve();
      } catch {
      }
      fe = null;
    }
    if (te.forEach((t) => {
      try {
        t.resolve();
      } catch {
      }
    }), te = [], Ae = !1, Y) {
      try {
        (e = Y.pause) == null || e.call(Y);
      } catch {
      }
      try {
        Y.src = "";
      } catch {
      }
      Y = null;
    }
    if (ue && (ue = null), typeof speechSynthesis < "u" && typeof speechSynthesis.cancel == "function")
      try {
        speechSynthesis.cancel();
      } catch {
      }
    Q("idle", "cancelled");
  },
  /**
   * האם יש בכלל יכולת קול במכשיר. true אם יש speechSynthesis או Audio.
   */
  get available() {
    return K !== "unsupported" && bt();
  },
  /** המצב הנוכחי של מנוע ה-TTS. */
  get audioState() {
    return K;
  },
  /** Alias for audioState — some callers use `state`. */
  get state() {
    return K;
  },
  /** השגיאה האחרונה שדווחה (provider/reason) או null אם לא הייתה. */
  get lastError() {
    return pn;
  },
  /**
   * משחרר ידנית את ה-audio context אחרי gesture ידוע (כפתור התחל וכו').
   * משחקים יקראו לזה במקום להמתין ל-autoplay block.
   * @returns {Promise<void>}
   */
  unlock() {
    var e;
    if (Ue = !0, He = !1, typeof speechSynthesis < "u" && typeof SpeechSynthesisUtterance < "u")
      try {
        const t = new SpeechSynthesisUtterance("");
        t.volume = 0, speechSynthesis.speak(t), speechSynthesis.cancel();
      } catch {
      }
    if (typeof Audio < "u")
      try {
        const t = new Audio();
        t.muted = !0;
        const n = (e = t.play) == null ? void 0 : e.call(t);
        n && typeof n.catch == "function" && n.catch(() => {
        });
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
    return bt() ? K === "unsupported" && Q("idle", "recovered") : Q("unsupported", "no-audio-capability"), this.available;
  },
  /**
   * הגדר מהירות דיבור (0.5-2.0).
   * @param {number} rate
   */
  setRate(e) {
    de = Math.max(0.5, Math.min(2, e));
  },
  /**
   * השתמש ב-Google Translate TTS (ברירת מחדל) או רק בדפדפן.
   * @param {boolean} [enabled]
   */
  useGoogle(e = !0) {
    kt = e;
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
    const n = e + t, o = oe.find((r) => r.symbol === t);
    return new Promise((r) => {
      o && o.sound ? (te.push({ text: n, keepNikud: !0, resolve: () => {
      } }), te.push({
        text: o.sound,
        rate: ut,
        keepNikud: !0,
        resolve: () => r(void 0)
      })) : te.push({ text: n, keepNikud: !0, resolve: () => r(void 0) }), we();
    });
  },
  /**
   * הקרא את צליל התנועה של הניקוד ("אָה", "אוֹ" וכו'),
   * כדי להדגים לילד מה להגות.
   * @param {string} nikudId - מזהה ניקוד מתוך nikudList (למשל 'kamatz').
   */
  speakVowel(e) {
    const t = oe.find((n) => n.id === e);
    return !t || !t.sound ? Promise.resolve() : new Promise((n) => {
      te.push({
        text: t.sound,
        rate: ut,
        keepNikud: !0,
        resolve: () => n(void 0)
      }), we();
    });
  }
}, jt = {
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
}, Mo = {
  shake: 420,
  bounce: 480,
  pulse: 600,
  fadeIn: 320,
  confetti: 700
};
function Ve(e, t) {
  !e || !jt[t] || e.animate(jt[t], {
    duration: Mo[t] || 400,
    easing: "ease-in-out",
    fill: "none"
  });
}
function jo(e, t, n, o) {
  qe.cheer();
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
  }), e.innerHTML = "", e.appendChild(a), Ve(a.querySelector(".completion-screen__content"), "fadeIn");
}
function Au(e, t, {
  totalRounds: n,
  progressBar: o = null,
  buildRoundUI: r,
  onCorrect: i,
  onWrong: s
}) {
  let a = !1;
  async function c(m) {
    if (a) return;
    a = !0, qe.correct(), m && await m(), i && await i(), e.state.addScore(1), o == null || o.update(e.state.currentRound), await new Promise((g) => setTimeout(g, 1200)), e.state.nextRound() ? (a = !1, r()) : jo(t, e.state.score, n, () => {
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
function hn(e, t) {
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
function Do(e, t = "טוֹעֵן...") {
  e.innerHTML = `<div class="ab-loading">${t}</div>`;
}
function Fo(e) {
  e.innerHTML = "";
}
let Bo = 0;
function ft() {
  return `round-${Date.now()}-${Bo++}`;
}
class Ie {
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
    return new Ie(t);
  }
  static fromRoundsArray(t, n, o = {}, r = []) {
    return new Ie({ id: t, meta: o, rounds: n, distractors: r });
  }
}
const mn = "alefbet.editor.";
function bn(e) {
  return hn(`${mn}${e}`, null);
}
function Uo(e) {
  bn(e.id).set(e.toJSON());
}
function Ho(e) {
  const t = bn(e).get();
  if (!t) return null;
  try {
    return Ie.fromJSON(t);
  } catch {
    return null;
  }
}
function Zu(e) {
  try {
    localStorage.removeItem(`${mn}${e}`);
  } catch {
  }
}
function Vo(e) {
  const t = JSON.stringify(e.toJSON(), null, 2), n = new Blob([t], { type: "application/json;charset=utf-8" }), o = URL.createObjectURL(n), r = document.createElement("a");
  r.href = o, r.download = `${e.id}-rounds.json`, r.click(), URL.revokeObjectURL(o);
}
function qo(e, { onClick: t } = {}) {
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
let ge = null, ee = null, gt = 0, _t = 0;
const Je = /* @__PURE__ */ new Map();
function Dt(e, t) {
  var n;
  return ((n = document.elementFromPoint(e, t)) == null ? void 0 : n.closest('[data-drop-target="true"]')) || null;
}
function Jo(e, t, n) {
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
function Wo(e, t) {
  ee && (ee.style.left = `${e - gt}px`, ee.style.top = `${t - _t}px`);
}
function Go() {
  ee == null || ee.remove(), ee = null;
}
let ne = null;
function Xo(e) {
  ne !== e && (ne == null || ne.classList.remove("drop-target--hover"), ne = e, e == null || e.classList.add("drop-target--hover"));
}
function Yo() {
  ne == null || ne.classList.remove("drop-target--hover"), ne = null;
}
function Ko(e, t) {
  e.classList.add("drag-source");
  let n = null, o = null, r = null;
  function i() {
    n && (e.removeEventListener("pointermove", n), e.removeEventListener("pointerup", o), e.removeEventListener("pointercancel", r), n = o = r = null), Yo(), Go(), e.classList.remove("drag-source--dragging"), ge = null;
  }
  function s(a) {
    a.button !== void 0 && a.button !== 0 || (a.preventDefault(), ge && i(), ge = { el: e, data: t }, e.classList.add("drag-source--dragging"), Jo(e, a.clientX, a.clientY), e.setPointerCapture(a.pointerId), n = (c) => {
      Wo(c.clientX, c.clientY), Xo(Dt(c.clientX, c.clientY));
    }, o = (c) => {
      const u = Dt(c.clientX, c.clientY);
      i(), u && Je.has(u) && Je.get(u).onDrop({ data: t, sourceEl: e, targetEl: u });
    }, r = () => i(), e.addEventListener("pointermove", n), e.addEventListener("pointerup", o), e.addEventListener("pointercancel", r));
  }
  return e.addEventListener("pointerdown", s), {
    destroy() {
      e.removeEventListener("pointerdown", s), (ge == null ? void 0 : ge.el) === e && i(), e.classList.remove("drag-source");
    }
  };
}
function Qo(e, t) {
  return e.setAttribute("data-drop-target", "true"), e.classList.add("drop-target--active"), Je.set(e, { onDrop: t }), {
    destroy() {
      e.removeAttribute("data-drop-target"), e.classList.remove("drop-target--active", "drop-target--hover"), Je.delete(e);
    }
  };
}
function er(e, t, { onSelectRound: n, onAddRound: o, onDuplicateRound: r, onMoveRound: i }) {
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
  function h(k, N) {
    const b = document.createElement("div");
    b.className = "ab-editor-nav__thumb", k.id === l && b.classList.add("ab-editor-nav__thumb--active"), b.setAttribute("role", "button"), b.setAttribute("tabindex", "0"), b.setAttribute("aria-label", `סיבוב ${N + 1}`), b.dataset.roundId = k.id, k.image && (b.style.backgroundImage = `url(${k.image})`, b.classList.add("ab-editor-nav__thumb--has-img"));
    const E = document.createElement("div");
    E.className = "ab-editor-nav__grip", E.innerHTML = "⠿", E.setAttribute("aria-hidden", "true"), E.title = "גרור לשינוי סדר", b.appendChild(E);
    const v = document.createElement("div");
    if (v.className = "ab-editor-nav__num", v.textContent = String(N + 1), b.appendChild(v), k.correctEmoji && !k.image) {
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
    }), d.push(Ko(E, { roundId: k.id })), d.push(Qo(b, ({ data: z }) => {
      z.roundId !== k.id && i(z.roundId, t.getRoundIndex(k.id));
    })), b;
  }
  function g() {
    m(), c.innerHTML = "", t.rounds.forEach((k, N) => c.appendChild(h(k, N)));
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
class gn extends Error {
  constructor(t) {
    super(`Encountered unidirectional transform during encode: ${t}`), this.name = "ZodEncodeError";
  }
}
const _n = {};
function ie(e) {
  return _n;
}
function vn(e) {
  const t = Object.values(e).filter((o) => typeof o == "number");
  return Object.entries(e).filter(([o, r]) => t.indexOf(+o) === -1).map(([o, r]) => r);
}
function vt(e, t) {
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
function tr(e, t) {
  const n = (e.toString().split(".")[1] || "").length, o = t.toString();
  let r = (o.split(".")[1] || "").length;
  if (r === 0 && /\d?e-\d?/.test(o)) {
    const c = o.match(/\d?e-(\d?)/);
    c != null && c[1] && (r = Number.parseInt(c[1]));
  }
  const i = n > r ? n : r, s = Number.parseInt(e.toFixed(i).replace(".", "")), a = Number.parseInt(t.toFixed(i).replace(".", ""));
  return s % a / 10 ** i;
}
const Ft = Symbol("evaluating");
function L(e, t, n) {
  let o;
  Object.defineProperty(e, t, {
    get() {
      if (o !== Ft)
        return o === void 0 && (o = Ft, o = n()), o;
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
function me(e, t, n) {
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
function Bt(e) {
  return JSON.stringify(e);
}
function nr(e) {
  return e.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
const yn = "captureStackTrace" in Error ? Error.captureStackTrace : (...e) => {
};
function We(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
const or = Et(() => {
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
  if (We(e) === !1)
    return !1;
  const t = e.constructor;
  if (t === void 0 || typeof t != "function")
    return !0;
  const n = t.prototype;
  return !(We(n) === !1 || Object.prototype.hasOwnProperty.call(n, "isPrototypeOf") === !1);
}
function wn(e) {
  return Ee(e) ? { ...e } : Array.isArray(e) ? [...e] : e;
}
const rr = /* @__PURE__ */ new Set(["string", "number", "symbol"]);
function tt(e) {
  return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function ce(e, t, n) {
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
function ir(e) {
  return Object.keys(e).filter((t) => e[t]._zod.optin === "optional" && e[t]._zod.optout === "optional");
}
const sr = {
  safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
  int32: [-2147483648, 2147483647],
  uint32: [0, 4294967295],
  float32: [-34028234663852886e22, 34028234663852886e22],
  float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
};
function ar(e, t) {
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
      return me(this, "shape", s), s;
    },
    checks: []
  });
  return ce(e, i);
}
function cr(e, t) {
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
      return me(this, "shape", s), s;
    },
    checks: []
  });
  return ce(e, i);
}
function ur(e, t) {
  if (!Ee(t))
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
      return me(this, "shape", i), i;
    }
  });
  return ce(e, r);
}
function lr(e, t) {
  if (!Ee(t))
    throw new Error("Invalid input to safeExtend: expected a plain object");
  const n = ae(e._zod.def, {
    get shape() {
      const o = { ...e._zod.def.shape, ...t };
      return me(this, "shape", o), o;
    }
  });
  return ce(e, n);
}
function dr(e, t) {
  const n = ae(e._zod.def, {
    get shape() {
      const o = { ...e._zod.def.shape, ...t._zod.def.shape };
      return me(this, "shape", o), o;
    },
    get catchall() {
      return t._zod.def.catchall;
    },
    checks: []
    // delete existing checks
  });
  return ce(e, n);
}
function fr(e, t, n) {
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
      return me(this, "shape", c), c;
    },
    checks: []
  });
  return ce(t, s);
}
function pr(e, t, n) {
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
      return me(this, "shape", i), i;
    }
  });
  return ce(t, o);
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
function ve(e, t) {
  return t.map((n) => {
    var o;
    return (o = n).path ?? (o.path = []), n.path.unshift(e), n;
  });
}
function je(e) {
  return typeof e == "string" ? e : e == null ? void 0 : e.message;
}
function se(e, t, n) {
  var r, i, s, a, c, u;
  const o = { ...e, path: e.path ?? [] };
  if (!e.message) {
    const l = je((s = (i = (r = e.inst) == null ? void 0 : r._zod.def) == null ? void 0 : i.error) == null ? void 0 : s.call(i, e)) ?? je((a = t == null ? void 0 : t.error) == null ? void 0 : a.call(t, e)) ?? je((c = n.customError) == null ? void 0 : c.call(n, e)) ?? je((u = n.localeError) == null ? void 0 : u.call(n, e)) ?? "Invalid input";
    o.message = l;
  }
  return delete o.inst, delete o.continue, t != null && t.reportInput || delete o.input, o;
}
function $t(e) {
  return Array.isArray(e) ? "array" : typeof e == "string" ? "string" : "unknown";
}
function Oe(...e) {
  const [t, n, o] = e;
  return typeof t == "string" ? {
    message: t,
    code: "custom",
    input: n,
    inst: o
  } : { ...t };
}
const kn = (e, t) => {
  e.name = "$ZodError", Object.defineProperty(e, "_zod", {
    value: e._zod,
    enumerable: !1
  }), Object.defineProperty(e, "issues", {
    value: t,
    enumerable: !1
  }), e.message = JSON.stringify(t, vt, 2), Object.defineProperty(e, "toString", {
    value: () => e.message,
    enumerable: !1
  });
}, En = f("$ZodError", kn), zn = f("$ZodError", kn, { Parent: Error });
function hr(e, t = (n) => n.message) {
  const n = {}, o = [];
  for (const r of e.issues)
    r.path.length > 0 ? (n[r.path[0]] = n[r.path[0]] || [], n[r.path[0]].push(t(r))) : o.push(t(r));
  return { formErrors: o, fieldErrors: n };
}
function mr(e, t = (n) => n.message) {
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
    const a = new ((r == null ? void 0 : r.Err) ?? e)(s.issues.map((c) => se(c, i, ie())));
    throw yn(a, r == null ? void 0 : r.callee), a;
  }
  return s.value;
}, Ct = (e) => async (t, n, o, r) => {
  const i = o ? Object.assign(o, { async: !0 }) : { async: !0 };
  let s = t._zod.run({ value: n, issues: [] }, i);
  if (s instanceof Promise && (s = await s), s.issues.length) {
    const a = new ((r == null ? void 0 : r.Err) ?? e)(s.issues.map((c) => se(c, i, ie())));
    throw yn(a, r == null ? void 0 : r.callee), a;
  }
  return s.value;
}, nt = (e) => (t, n, o) => {
  const r = o ? { ...o, async: !1 } : { async: !1 }, i = t._zod.run({ value: n, issues: [] }, r);
  if (i instanceof Promise)
    throw new ke();
  return i.issues.length ? {
    success: !1,
    error: new (e ?? En)(i.issues.map((s) => se(s, r, ie())))
  } : { success: !0, data: i.value };
}, br = /* @__PURE__ */ nt(zn), ot = (e) => async (t, n, o) => {
  const r = o ? Object.assign(o, { async: !0 }) : { async: !0 };
  let i = t._zod.run({ value: n, issues: [] }, r);
  return i instanceof Promise && (i = await i), i.issues.length ? {
    success: !1,
    error: new e(i.issues.map((s) => se(s, r, ie())))
  } : { success: !0, data: i.value };
}, gr = /* @__PURE__ */ ot(zn), _r = (e) => (t, n, o) => {
  const r = o ? Object.assign(o, { direction: "backward" }) : { direction: "backward" };
  return Nt(e)(t, n, r);
}, vr = (e) => (t, n, o) => Nt(e)(t, n, o), yr = (e) => async (t, n, o) => {
  const r = o ? Object.assign(o, { direction: "backward" }) : { direction: "backward" };
  return Ct(e)(t, n, r);
}, wr = (e) => async (t, n, o) => Ct(e)(t, n, o), kr = (e) => (t, n, o) => {
  const r = o ? Object.assign(o, { direction: "backward" }) : { direction: "backward" };
  return nt(e)(t, n, r);
}, Er = (e) => (t, n, o) => nt(e)(t, n, o), zr = (e) => async (t, n, o) => {
  const r = o ? Object.assign(o, { direction: "backward" }) : { direction: "backward" };
  return ot(e)(t, n, r);
}, Sr = (e) => async (t, n, o) => ot(e)(t, n, o), $r = /^[cC][^\s-]{8,}$/, Nr = /^[0-9a-z]+$/, Cr = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/, xr = /^[0-9a-vA-V]{20}$/, Tr = /^[A-Za-z0-9]{27}$/, Ar = /^[a-zA-Z0-9_-]{21}$/, Zr = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/, Lr = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/, Ut = (e) => e ? new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${e}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`) : /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/, Rr = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/, Ir = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
function Or() {
  return new RegExp(Ir, "u");
}
const Pr = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, Mr = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/, jr = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/, Dr = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, Fr = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/, Sn = /^[A-Za-z0-9_-]*$/, Br = /^\+[1-9]\d{6,14}$/, $n = "(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))", Ur = /* @__PURE__ */ new RegExp(`^${$n}$`);
function Nn(e) {
  const t = "(?:[01]\\d|2[0-3]):[0-5]\\d";
  return typeof e.precision == "number" ? e.precision === -1 ? `${t}` : e.precision === 0 ? `${t}:[0-5]\\d` : `${t}:[0-5]\\d\\.\\d{${e.precision}}` : `${t}(?::[0-5]\\d(?:\\.\\d+)?)?`;
}
function Hr(e) {
  return new RegExp(`^${Nn(e)}$`);
}
function Vr(e) {
  const t = Nn({ precision: e.precision }), n = ["Z"];
  e.local && n.push(""), e.offset && n.push("([+-](?:[01]\\d|2[0-3]):[0-5]\\d)");
  const o = `${t}(?:${n.join("|")})`;
  return new RegExp(`^${$n}T(?:${o})$`);
}
const qr = (e) => {
  const t = e ? `[\\s\\S]{${(e == null ? void 0 : e.minimum) ?? 0},${(e == null ? void 0 : e.maximum) ?? ""}}` : "[\\s\\S]*";
  return new RegExp(`^${t}$`);
}, Jr = /^-?\d+$/, Cn = /^-?\d+(?:\.\d+)?$/, Wr = /^(?:true|false)$/i, Gr = /^[^A-Z]*$/, Xr = /^[^a-z]*$/, W = /* @__PURE__ */ f("$ZodCheck", (e, t) => {
  var n;
  e._zod ?? (e._zod = {}), e._zod.def = t, (n = e._zod).onattach ?? (n.onattach = []);
}), xn = {
  number: "number",
  bigint: "bigint",
  object: "date"
}, Tn = /* @__PURE__ */ f("$ZodCheckLessThan", (e, t) => {
  W.init(e, t);
  const n = xn[typeof t.value];
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
}), An = /* @__PURE__ */ f("$ZodCheckGreaterThan", (e, t) => {
  W.init(e, t);
  const n = xn[typeof t.value];
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
}), Yr = /* @__PURE__ */ f("$ZodCheckMultipleOf", (e, t) => {
  W.init(e, t), e._zod.onattach.push((n) => {
    var o;
    (o = n._zod.bag).multipleOf ?? (o.multipleOf = t.value);
  }), e._zod.check = (n) => {
    if (typeof n.value != typeof t.value)
      throw new Error("Cannot mix number and bigint in multiple_of check.");
    (typeof n.value == "bigint" ? n.value % t.value === BigInt(0) : tr(n.value, t.value) === 0) || n.issues.push({
      origin: typeof n.value,
      code: "not_multiple_of",
      divisor: t.value,
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), Kr = /* @__PURE__ */ f("$ZodCheckNumberFormat", (e, t) => {
  var s;
  W.init(e, t), t.format = t.format || "float64";
  const n = (s = t.format) == null ? void 0 : s.includes("int"), o = n ? "int" : "number", [r, i] = sr[t.format];
  e._zod.onattach.push((a) => {
    const c = a._zod.bag;
    c.format = t.format, c.minimum = r, c.maximum = i, n && (c.pattern = Jr);
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
}), Qr = /* @__PURE__ */ f("$ZodCheckMaxLength", (e, t) => {
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
}), ei = /* @__PURE__ */ f("$ZodCheckMinLength", (e, t) => {
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
}), ti = /* @__PURE__ */ f("$ZodCheckLengthEquals", (e, t) => {
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
}), rt = /* @__PURE__ */ f("$ZodCheckStringFormat", (e, t) => {
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
}), ni = /* @__PURE__ */ f("$ZodCheckRegex", (e, t) => {
  rt.init(e, t), e._zod.check = (n) => {
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
}), oi = /* @__PURE__ */ f("$ZodCheckLowerCase", (e, t) => {
  t.pattern ?? (t.pattern = Gr), rt.init(e, t);
}), ri = /* @__PURE__ */ f("$ZodCheckUpperCase", (e, t) => {
  t.pattern ?? (t.pattern = Xr), rt.init(e, t);
}), ii = /* @__PURE__ */ f("$ZodCheckIncludes", (e, t) => {
  W.init(e, t);
  const n = tt(t.includes), o = new RegExp(typeof t.position == "number" ? `^.{${t.position}}${n}` : n);
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
}), si = /* @__PURE__ */ f("$ZodCheckStartsWith", (e, t) => {
  W.init(e, t);
  const n = new RegExp(`^${tt(t.prefix)}.*`);
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
}), ai = /* @__PURE__ */ f("$ZodCheckEndsWith", (e, t) => {
  W.init(e, t);
  const n = new RegExp(`.*${tt(t.suffix)}$`);
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
}), ci = /* @__PURE__ */ f("$ZodCheckOverwrite", (e, t) => {
  W.init(e, t), e._zod.check = (n) => {
    n.value = t.tx(n.value);
  };
});
class ui {
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
const li = {
  major: 4,
  minor: 3,
  patch: 6
}, M = /* @__PURE__ */ f("$ZodType", (e, t) => {
  var r;
  var n;
  e ?? (e = {}), e._zod.def = t, e._zod.bag = e._zod.bag || {}, e._zod.version = li;
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
        const h = a.issues.length, g = m._zod.check(a);
        if (g instanceof Promise && (u == null ? void 0 : u.async) === !1)
          throw new ke();
        if (d || g instanceof Promise)
          d = (d ?? Promise.resolve()).then(async () => {
            await g, a.issues.length !== h && (l || (l = _e(a, h)));
          });
        else {
          if (a.issues.length === h)
            continue;
          l || (l = _e(a, h));
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
        const a = br(e, i);
        return a.success ? { value: a.data } : { issues: (s = a.error) == null ? void 0 : s.issues };
      } catch {
        return gr(e, i).then((c) => {
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
  M.init(e, t), e._zod.pattern = [...((n = e == null ? void 0 : e._zod.bag) == null ? void 0 : n.patterns) ?? []].pop() ?? qr(e._zod.bag), e._zod.parse = (o, r) => {
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
  rt.init(e, t), xt.init(e, t);
}), di = /* @__PURE__ */ f("$ZodGUID", (e, t) => {
  t.pattern ?? (t.pattern = Lr), O.init(e, t);
}), fi = /* @__PURE__ */ f("$ZodUUID", (e, t) => {
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
    t.pattern ?? (t.pattern = Ut(o));
  } else
    t.pattern ?? (t.pattern = Ut());
  O.init(e, t);
}), pi = /* @__PURE__ */ f("$ZodEmail", (e, t) => {
  t.pattern ?? (t.pattern = Rr), O.init(e, t);
}), hi = /* @__PURE__ */ f("$ZodURL", (e, t) => {
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
}), mi = /* @__PURE__ */ f("$ZodEmoji", (e, t) => {
  t.pattern ?? (t.pattern = Or()), O.init(e, t);
}), bi = /* @__PURE__ */ f("$ZodNanoID", (e, t) => {
  t.pattern ?? (t.pattern = Ar), O.init(e, t);
}), gi = /* @__PURE__ */ f("$ZodCUID", (e, t) => {
  t.pattern ?? (t.pattern = $r), O.init(e, t);
}), _i = /* @__PURE__ */ f("$ZodCUID2", (e, t) => {
  t.pattern ?? (t.pattern = Nr), O.init(e, t);
}), vi = /* @__PURE__ */ f("$ZodULID", (e, t) => {
  t.pattern ?? (t.pattern = Cr), O.init(e, t);
}), yi = /* @__PURE__ */ f("$ZodXID", (e, t) => {
  t.pattern ?? (t.pattern = xr), O.init(e, t);
}), wi = /* @__PURE__ */ f("$ZodKSUID", (e, t) => {
  t.pattern ?? (t.pattern = Tr), O.init(e, t);
}), ki = /* @__PURE__ */ f("$ZodISODateTime", (e, t) => {
  t.pattern ?? (t.pattern = Vr(t)), O.init(e, t);
}), Ei = /* @__PURE__ */ f("$ZodISODate", (e, t) => {
  t.pattern ?? (t.pattern = Ur), O.init(e, t);
}), zi = /* @__PURE__ */ f("$ZodISOTime", (e, t) => {
  t.pattern ?? (t.pattern = Hr(t)), O.init(e, t);
}), Si = /* @__PURE__ */ f("$ZodISODuration", (e, t) => {
  t.pattern ?? (t.pattern = Zr), O.init(e, t);
}), $i = /* @__PURE__ */ f("$ZodIPv4", (e, t) => {
  t.pattern ?? (t.pattern = Pr), O.init(e, t), e._zod.bag.format = "ipv4";
}), Ni = /* @__PURE__ */ f("$ZodIPv6", (e, t) => {
  t.pattern ?? (t.pattern = Mr), O.init(e, t), e._zod.bag.format = "ipv6", e._zod.check = (n) => {
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
}), Ci = /* @__PURE__ */ f("$ZodCIDRv4", (e, t) => {
  t.pattern ?? (t.pattern = jr), O.init(e, t);
}), xi = /* @__PURE__ */ f("$ZodCIDRv6", (e, t) => {
  t.pattern ?? (t.pattern = Dr), O.init(e, t), e._zod.check = (n) => {
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
function Zn(e) {
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
const Ti = /* @__PURE__ */ f("$ZodBase64", (e, t) => {
  t.pattern ?? (t.pattern = Fr), O.init(e, t), e._zod.bag.contentEncoding = "base64", e._zod.check = (n) => {
    Zn(n.value) || n.issues.push({
      code: "invalid_format",
      format: "base64",
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
});
function Ai(e) {
  if (!Sn.test(e))
    return !1;
  const t = e.replace(/[-_]/g, (o) => o === "-" ? "+" : "/"), n = t.padEnd(Math.ceil(t.length / 4) * 4, "=");
  return Zn(n);
}
const Zi = /* @__PURE__ */ f("$ZodBase64URL", (e, t) => {
  t.pattern ?? (t.pattern = Sn), O.init(e, t), e._zod.bag.contentEncoding = "base64url", e._zod.check = (n) => {
    Ai(n.value) || n.issues.push({
      code: "invalid_format",
      format: "base64url",
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), Li = /* @__PURE__ */ f("$ZodE164", (e, t) => {
  t.pattern ?? (t.pattern = Br), O.init(e, t);
});
function Ri(e, t = null) {
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
const Ii = /* @__PURE__ */ f("$ZodJWT", (e, t) => {
  O.init(e, t), e._zod.check = (n) => {
    Ri(n.value, t.alg) || n.issues.push({
      code: "invalid_format",
      format: "jwt",
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), Ln = /* @__PURE__ */ f("$ZodNumber", (e, t) => {
  M.init(e, t), e._zod.pattern = e._zod.bag.pattern ?? Cn, e._zod.parse = (n, o) => {
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
}), Oi = /* @__PURE__ */ f("$ZodNumberFormat", (e, t) => {
  Kr.init(e, t), Ln.init(e, t);
}), Pi = /* @__PURE__ */ f("$ZodBoolean", (e, t) => {
  M.init(e, t), e._zod.pattern = Wr, e._zod.parse = (n, o) => {
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
}), Mi = /* @__PURE__ */ f("$ZodUnknown", (e, t) => {
  M.init(e, t), e._zod.parse = (n) => n;
}), ji = /* @__PURE__ */ f("$ZodNever", (e, t) => {
  M.init(e, t), e._zod.parse = (n, o) => (n.issues.push({
    expected: "never",
    code: "invalid_type",
    input: n.value,
    inst: e
  }), n);
});
function Ht(e, t, n) {
  e.issues.length && t.issues.push(...ve(n, e.issues)), t.value[n] = e.value;
}
const Di = /* @__PURE__ */ f("$ZodArray", (e, t) => {
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
      c instanceof Promise ? i.push(c.then((u) => Ht(u, n, s))) : Ht(c, n, s);
    }
    return i.length ? Promise.all(i).then(() => n) : n;
  };
});
function Ge(e, t, n, o, r) {
  if (e.issues.length) {
    if (r && !(n in o))
      return;
    t.issues.push(...ve(n, e.issues));
  }
  e.value === void 0 ? n in o && (t.value[n] = void 0) : t.value[n] = e.value;
}
function Rn(e) {
  var o, r, i, s;
  const t = Object.keys(e.shape);
  for (const a of t)
    if (!((s = (i = (r = (o = e.shape) == null ? void 0 : o[a]) == null ? void 0 : r._zod) == null ? void 0 : i.traits) != null && s.has("$ZodType")))
      throw new Error(`Invalid element at key "${a}": expected a Zod schema`);
  const n = ir(e.shape);
  return {
    ...e,
    keys: t,
    keySet: new Set(t),
    numKeys: t.length,
    optionalKeys: new Set(n)
  };
}
function In(e, t, n, o, r, i) {
  const s = [], a = r.keySet, c = r.catchall._zod, u = c.def.type, l = c.optout === "optional";
  for (const d in t) {
    if (a.has(d))
      continue;
    if (u === "never") {
      s.push(d);
      continue;
    }
    const m = c.run({ value: t[d], issues: [] }, o);
    m instanceof Promise ? e.push(m.then((h) => Ge(h, n, d, t, l))) : Ge(m, n, d, t, l);
  }
  return s.length && n.issues.push({
    code: "unrecognized_keys",
    keys: s,
    input: t,
    inst: i
  }), e.length ? Promise.all(e).then(() => n) : n;
}
const Fi = /* @__PURE__ */ f("$ZodObject", (e, t) => {
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
  const o = Et(() => Rn(t));
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
  const r = We, i = t.catchall;
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
      const h = d[m], g = h._zod.optout === "optional", _ = h._zod.run({ value: u[m], issues: [] }, c);
      _ instanceof Promise ? l.push(_.then((C) => Ge(C, a, m, u, g))) : Ge(_, a, m, u, g);
    }
    return i ? In(l, u, a, c, o.value, e) : l.length ? Promise.all(l).then(() => a) : a;
  };
}), Bi = /* @__PURE__ */ f("$ZodObjectJIT", (e, t) => {
  Fi.init(e, t);
  const n = e._zod.parse, o = Et(() => Rn(t)), r = (m) => {
    var b;
    const h = new ui(["shape", "payload", "ctx"]), g = o.value, _ = (E) => {
      const v = Bt(E);
      return `shape[${v}]._zod.run({ value: input[${v}], issues: [] }, ctx)`;
    };
    h.write("const input = payload.value;");
    const C = /* @__PURE__ */ Object.create(null);
    let k = 0;
    for (const E of g.keys)
      C[E] = `key_${k++}`;
    h.write("const newResult = {};");
    for (const E of g.keys) {
      const v = C[E], x = Bt(E), z = m[E], $ = ((b = z == null ? void 0 : z._zod) == null ? void 0 : b.optout) === "optional";
      h.write(`const ${v} = ${_(E)};`), $ ? h.write(`
        if (${v}.issues.length) {
          if (${x} in input) {
            payload.issues = payload.issues.concat(${v}.issues.map(iss => ({
              ...iss,
              path: iss.path ? [${x}, ...iss.path] : [${x}]
            })));
          }
        }
        
        if (${v}.value === undefined) {
          if (${x} in input) {
            newResult[${x}] = undefined;
          }
        } else {
          newResult[${x}] = ${v}.value;
        }
        
      `) : h.write(`
        if (${v}.issues.length) {
          payload.issues = payload.issues.concat(${v}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${x}, ...iss.path] : [${x}]
          })));
        }
        
        if (${v}.value === undefined) {
          if (${x} in input) {
            newResult[${x}] = undefined;
          }
        } else {
          newResult[${x}] = ${v}.value;
        }
        
      `);
    }
    h.write("payload.value = newResult;"), h.write("return payload;");
    const N = h.compile();
    return (E, v) => N(m, E, v);
  };
  let i;
  const s = We, a = !_n.jitless, u = a && or.value, l = t.catchall;
  let d;
  e._zod.parse = (m, h) => {
    d ?? (d = o.value);
    const g = m.value;
    return s(g) ? a && u && (h == null ? void 0 : h.async) === !1 && h.jitless !== !0 ? (i || (i = r(t.shape)), m = i(m, h), l ? In([], g, m, h, d, e) : m) : n(m, h) : (m.issues.push({
      expected: "object",
      code: "invalid_type",
      input: g,
      inst: e
    }), m);
  };
});
function Vt(e, t, n, o) {
  for (const i of e)
    if (i.issues.length === 0)
      return t.value = i.value, t;
  const r = e.filter((i) => !_e(i));
  return r.length === 1 ? (t.value = r[0].value, r[0]) : (t.issues.push({
    code: "invalid_union",
    input: t.value,
    inst: n,
    errors: e.map((i) => i.issues.map((s) => se(s, o, ie())))
  }), t);
}
const Ui = /* @__PURE__ */ f("$ZodUnion", (e, t) => {
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
    return s ? Promise.all(a).then((c) => Vt(c, r, e, i)) : Vt(a, r, e, i);
  };
}), Hi = /* @__PURE__ */ f("$ZodIntersection", (e, t) => {
  M.init(e, t), e._zod.parse = (n, o) => {
    const r = n.value, i = t.left._zod.run({ value: r, issues: [] }, o), s = t.right._zod.run({ value: r, issues: [] }, o);
    return i instanceof Promise || s instanceof Promise ? Promise.all([i, s]).then(([c, u]) => qt(n, c, u)) : qt(n, i, s);
  };
});
function yt(e, t) {
  if (e === t)
    return { valid: !0, data: e };
  if (e instanceof Date && t instanceof Date && +e == +t)
    return { valid: !0, data: e };
  if (Ee(e) && Ee(t)) {
    const n = Object.keys(t), o = Object.keys(e).filter((i) => n.indexOf(i) !== -1), r = { ...e, ...t };
    for (const i of o) {
      const s = yt(e[i], t[i]);
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
      const r = e[o], i = t[o], s = yt(r, i);
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
function qt(e, t, n) {
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
  const s = yt(t.value, n.value);
  if (!s.valid)
    throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(s.mergeErrorPath)}`);
  return e.value = s.data, e;
}
const Vi = /* @__PURE__ */ f("$ZodRecord", (e, t) => {
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
            d.issues.length && n.issues.push(...ve(u, d.issues)), n.value[u] = d.value;
          })) : (l.issues.length && n.issues.push(...ve(u, l.issues)), n.value[u] = l.value);
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
        if (typeof a == "string" && Cn.test(a) && c.issues.length) {
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
          d.issues.length && n.issues.push(...ve(a, d.issues)), n.value[c.value] = d.value;
        })) : (l.issues.length && n.issues.push(...ve(a, l.issues)), n.value[c.value] = l.value);
      }
    }
    return i.length ? Promise.all(i).then(() => n) : n;
  };
}), qi = /* @__PURE__ */ f("$ZodEnum", (e, t) => {
  M.init(e, t);
  const n = vn(t.entries), o = new Set(n);
  e._zod.values = o, e._zod.pattern = new RegExp(`^(${n.filter((r) => rr.has(typeof r)).map((r) => typeof r == "string" ? tt(r) : r.toString()).join("|")})$`), e._zod.parse = (r, i) => {
    const s = r.value;
    return o.has(s) || r.issues.push({
      code: "invalid_value",
      values: n,
      input: s,
      inst: e
    }), r;
  };
}), Ji = /* @__PURE__ */ f("$ZodTransform", (e, t) => {
  M.init(e, t), e._zod.parse = (n, o) => {
    if (o.direction === "backward")
      throw new gn(e.constructor.name);
    const r = t.transform(n.value, n);
    if (o.async)
      return (r instanceof Promise ? r : Promise.resolve(r)).then((s) => (n.value = s, n));
    if (r instanceof Promise)
      throw new ke();
    return n.value = r, n;
  };
});
function Jt(e, t) {
  return e.issues.length && t === void 0 ? { issues: [], value: void 0 } : e;
}
const On = /* @__PURE__ */ f("$ZodOptional", (e, t) => {
  M.init(e, t), e._zod.optin = "optional", e._zod.optout = "optional", L(e._zod, "values", () => t.innerType._zod.values ? /* @__PURE__ */ new Set([...t.innerType._zod.values, void 0]) : void 0), L(e._zod, "pattern", () => {
    const n = t.innerType._zod.pattern;
    return n ? new RegExp(`^(${St(n.source)})?$`) : void 0;
  }), e._zod.parse = (n, o) => {
    if (t.innerType._zod.optin === "optional") {
      const r = t.innerType._zod.run(n, o);
      return r instanceof Promise ? r.then((i) => Jt(i, n.value)) : Jt(r, n.value);
    }
    return n.value === void 0 ? n : t.innerType._zod.run(n, o);
  };
}), Wi = /* @__PURE__ */ f("$ZodExactOptional", (e, t) => {
  On.init(e, t), L(e._zod, "values", () => t.innerType._zod.values), L(e._zod, "pattern", () => t.innerType._zod.pattern), e._zod.parse = (n, o) => t.innerType._zod.run(n, o);
}), Gi = /* @__PURE__ */ f("$ZodNullable", (e, t) => {
  M.init(e, t), L(e._zod, "optin", () => t.innerType._zod.optin), L(e._zod, "optout", () => t.innerType._zod.optout), L(e._zod, "pattern", () => {
    const n = t.innerType._zod.pattern;
    return n ? new RegExp(`^(${St(n.source)}|null)$`) : void 0;
  }), L(e._zod, "values", () => t.innerType._zod.values ? /* @__PURE__ */ new Set([...t.innerType._zod.values, null]) : void 0), e._zod.parse = (n, o) => n.value === null ? n : t.innerType._zod.run(n, o);
}), Xi = /* @__PURE__ */ f("$ZodDefault", (e, t) => {
  M.init(e, t), e._zod.optin = "optional", L(e._zod, "values", () => t.innerType._zod.values), e._zod.parse = (n, o) => {
    if (o.direction === "backward")
      return t.innerType._zod.run(n, o);
    if (n.value === void 0)
      return n.value = t.defaultValue, n;
    const r = t.innerType._zod.run(n, o);
    return r instanceof Promise ? r.then((i) => Wt(i, t)) : Wt(r, t);
  };
});
function Wt(e, t) {
  return e.value === void 0 && (e.value = t.defaultValue), e;
}
const Yi = /* @__PURE__ */ f("$ZodPrefault", (e, t) => {
  M.init(e, t), e._zod.optin = "optional", L(e._zod, "values", () => t.innerType._zod.values), e._zod.parse = (n, o) => (o.direction === "backward" || n.value === void 0 && (n.value = t.defaultValue), t.innerType._zod.run(n, o));
}), Ki = /* @__PURE__ */ f("$ZodNonOptional", (e, t) => {
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
const Qi = /* @__PURE__ */ f("$ZodCatch", (e, t) => {
  M.init(e, t), L(e._zod, "optin", () => t.innerType._zod.optin), L(e._zod, "optout", () => t.innerType._zod.optout), L(e._zod, "values", () => t.innerType._zod.values), e._zod.parse = (n, o) => {
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
}), es = /* @__PURE__ */ f("$ZodPipe", (e, t) => {
  M.init(e, t), L(e._zod, "values", () => t.in._zod.values), L(e._zod, "optin", () => t.in._zod.optin), L(e._zod, "optout", () => t.out._zod.optout), L(e._zod, "propValues", () => t.in._zod.propValues), e._zod.parse = (n, o) => {
    if (o.direction === "backward") {
      const i = t.out._zod.run(n, o);
      return i instanceof Promise ? i.then((s) => De(s, t.in, o)) : De(i, t.in, o);
    }
    const r = t.in._zod.run(n, o);
    return r instanceof Promise ? r.then((i) => De(i, t.out, o)) : De(r, t.out, o);
  };
});
function De(e, t, n) {
  return e.issues.length ? (e.aborted = !0, e) : t._zod.run({ value: e.value, issues: e.issues }, n);
}
const ts = /* @__PURE__ */ f("$ZodReadonly", (e, t) => {
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
    return r instanceof Promise ? r.then(Xt) : Xt(r);
  };
});
function Xt(e) {
  return e.value = Object.freeze(e.value), e;
}
const ns = /* @__PURE__ */ f("$ZodCustom", (e, t) => {
  W.init(e, t), M.init(e, t), e._zod.parse = (n, o) => n, e._zod.check = (n) => {
    const o = n.value, r = t.fn(o);
    if (r instanceof Promise)
      return r.then((i) => Yt(i, n, o, e));
    Yt(r, n, o, e);
  };
});
function Yt(e, t, n, o) {
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
    o._zod.def.params && (r.params = o._zod.def.params), t.issues.push(Oe(r));
  }
}
var Kt;
class os {
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
function rs() {
  return new os();
}
(Kt = globalThis).__zod_globalRegistry ?? (Kt.__zod_globalRegistry = rs());
const Ze = globalThis.__zod_globalRegistry;
// @__NO_SIDE_EFFECTS__
function is(e, t) {
  return new e({
    type: "string",
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function ss(e, t) {
  return new e({
    type: "string",
    format: "email",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Qt(e, t) {
  return new e({
    type: "string",
    format: "guid",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function as(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function cs(e, t) {
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
function us(e, t) {
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
function ls(e, t) {
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
function ds(e, t) {
  return new e({
    type: "string",
    format: "url",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function fs(e, t) {
  return new e({
    type: "string",
    format: "emoji",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function ps(e, t) {
  return new e({
    type: "string",
    format: "nanoid",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function hs(e, t) {
  return new e({
    type: "string",
    format: "cuid",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function ms(e, t) {
  return new e({
    type: "string",
    format: "cuid2",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function bs(e, t) {
  return new e({
    type: "string",
    format: "ulid",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function gs(e, t) {
  return new e({
    type: "string",
    format: "xid",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function _s(e, t) {
  return new e({
    type: "string",
    format: "ksuid",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function vs(e, t) {
  return new e({
    type: "string",
    format: "ipv4",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function ys(e, t) {
  return new e({
    type: "string",
    format: "ipv6",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function ws(e, t) {
  return new e({
    type: "string",
    format: "cidrv4",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function ks(e, t) {
  return new e({
    type: "string",
    format: "cidrv6",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Es(e, t) {
  return new e({
    type: "string",
    format: "base64",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function zs(e, t) {
  return new e({
    type: "string",
    format: "base64url",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Ss(e, t) {
  return new e({
    type: "string",
    format: "e164",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function $s(e, t) {
  return new e({
    type: "string",
    format: "jwt",
    check: "string_format",
    abort: !1,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Ns(e, t) {
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
function Cs(e, t) {
  return new e({
    type: "string",
    format: "date",
    check: "string_format",
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function xs(e, t) {
  return new e({
    type: "string",
    format: "time",
    check: "string_format",
    precision: null,
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Ts(e, t) {
  return new e({
    type: "string",
    format: "duration",
    check: "string_format",
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function As(e, t) {
  return new e({
    type: "number",
    checks: [],
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Zs(e, t) {
  return new e({
    type: "number",
    check: "number_format",
    abort: !1,
    format: "safeint",
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Ls(e, t) {
  return new e({
    type: "boolean",
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Rs(e) {
  return new e({
    type: "unknown"
  });
}
// @__NO_SIDE_EFFECTS__
function Is(e, t) {
  return new e({
    type: "never",
    ...S(t)
  });
}
// @__NO_SIDE_EFFECTS__
function en(e, t) {
  return new Tn({
    check: "less_than",
    ...S(t),
    value: e,
    inclusive: !1
  });
}
// @__NO_SIDE_EFFECTS__
function pt(e, t) {
  return new Tn({
    check: "less_than",
    ...S(t),
    value: e,
    inclusive: !0
  });
}
// @__NO_SIDE_EFFECTS__
function tn(e, t) {
  return new An({
    check: "greater_than",
    ...S(t),
    value: e,
    inclusive: !1
  });
}
// @__NO_SIDE_EFFECTS__
function ht(e, t) {
  return new An({
    check: "greater_than",
    ...S(t),
    value: e,
    inclusive: !0
  });
}
// @__NO_SIDE_EFFECTS__
function nn(e, t) {
  return new Yr({
    check: "multiple_of",
    ...S(t),
    value: e
  });
}
// @__NO_SIDE_EFFECTS__
function Pn(e, t) {
  return new Qr({
    check: "max_length",
    ...S(t),
    maximum: e
  });
}
// @__NO_SIDE_EFFECTS__
function Xe(e, t) {
  return new ei({
    check: "min_length",
    ...S(t),
    minimum: e
  });
}
// @__NO_SIDE_EFFECTS__
function Mn(e, t) {
  return new ti({
    check: "length_equals",
    ...S(t),
    length: e
  });
}
// @__NO_SIDE_EFFECTS__
function Os(e, t) {
  return new ni({
    check: "string_format",
    format: "regex",
    ...S(t),
    pattern: e
  });
}
// @__NO_SIDE_EFFECTS__
function Ps(e) {
  return new oi({
    check: "string_format",
    format: "lowercase",
    ...S(e)
  });
}
// @__NO_SIDE_EFFECTS__
function Ms(e) {
  return new ri({
    check: "string_format",
    format: "uppercase",
    ...S(e)
  });
}
// @__NO_SIDE_EFFECTS__
function js(e, t) {
  return new ii({
    check: "string_format",
    format: "includes",
    ...S(t),
    includes: e
  });
}
// @__NO_SIDE_EFFECTS__
function Ds(e, t) {
  return new si({
    check: "string_format",
    format: "starts_with",
    ...S(t),
    prefix: e
  });
}
// @__NO_SIDE_EFFECTS__
function Fs(e, t) {
  return new ai({
    check: "string_format",
    format: "ends_with",
    ...S(t),
    suffix: e
  });
}
// @__NO_SIDE_EFFECTS__
function ze(e) {
  return new ci({
    check: "overwrite",
    tx: e
  });
}
// @__NO_SIDE_EFFECTS__
function Bs(e) {
  return /* @__PURE__ */ ze((t) => t.normalize(e));
}
// @__NO_SIDE_EFFECTS__
function Us() {
  return /* @__PURE__ */ ze((e) => e.trim());
}
// @__NO_SIDE_EFFECTS__
function Hs() {
  return /* @__PURE__ */ ze((e) => e.toLowerCase());
}
// @__NO_SIDE_EFFECTS__
function Vs() {
  return /* @__PURE__ */ ze((e) => e.toUpperCase());
}
// @__NO_SIDE_EFFECTS__
function qs() {
  return /* @__PURE__ */ ze((e) => nr(e));
}
// @__NO_SIDE_EFFECTS__
function Js(e, t, n) {
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
function Ws(e, t, n) {
  return new e({
    type: "custom",
    check: "custom",
    fn: t,
    ...S(n)
  });
}
// @__NO_SIDE_EFFECTS__
function Gs(e) {
  const t = /* @__PURE__ */ Xs((n) => (n.addIssue = (o) => {
    if (typeof o == "string")
      n.issues.push(Oe(o, n.value, t._zod.def));
    else {
      const r = o;
      r.fatal && (r.continue = !1), r.code ?? (r.code = "custom"), r.input ?? (r.input = n.value), r.inst ?? (r.inst = t), r.continue ?? (r.continue = !t._zod.def.abort), n.issues.push(Oe(r));
    }
  }, e(n.value, n)));
  return t;
}
// @__NO_SIDE_EFFECTS__
function Xs(e, t) {
  const n = new W({
    check: "custom",
    ...S(t)
  });
  return n._zod.check = e, n;
}
function jn(e) {
  let t = (e == null ? void 0 : e.target) ?? "draft-2020-12";
  return t === "draft-4" && (t = "draft-04"), t === "draft-7" && (t = "draft-07"), {
    processors: e.processors ?? {},
    metadataRegistry: (e == null ? void 0 : e.metadata) ?? Ze,
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
    const h = e._zod.parent;
    h && (s.ref || (s.ref = h), U(h, t, m), t.seen.get(h).isParent = !0);
  }
  const c = t.metadataRegistry.get(e);
  return c && Object.assign(s.schema, c), t.io === "input" && q(e) && (delete s.schema.examples, delete s.schema.default), t.io === "input" && s.schema._prefault && ((o = s.schema).default ?? (o.default = s.schema._prefault)), delete s.schema._prefault, t.seen.get(e).schema;
}
function Dn(e, t) {
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
    const h = `#/${d}/`, g = l[1].schema.id ?? `__schema${e.counter++}`;
    return { defId: g, ref: h + g };
  }, i = (l) => {
    if (l[1].schema.$ref)
      return;
    const d = l[1], { ref: m, defId: h } = r(l);
    d.def = { ...d.schema }, h && (d.defId = h);
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
      const h = (c = e.external.registry.get(l[0])) == null ? void 0 : c.id;
      if (t !== l[0] && h) {
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
function Fn(e, t) {
  var s, a, c;
  const n = e.seen.get(t);
  if (!n)
    throw new Error("Unprocessed schema. This is a bug in Zod.");
  const o = (u) => {
    const l = e.seen.get(u);
    if (l.ref === null)
      return;
    const d = l.def ?? l.schema, m = { ...d }, h = l.ref;
    if (l.ref = null, h) {
      o(h);
      const _ = e.seen.get(h), C = _.schema;
      if (C.$ref && (e.target === "draft-07" || e.target === "draft-04" || e.target === "openapi-3.0") ? (d.allOf = d.allOf ?? [], d.allOf.push(C)) : Object.assign(d, C), Object.assign(d, m), u._zod.parent === h)
        for (const N in d)
          N === "$ref" || N === "allOf" || N in m || delete d[N];
      if (C.$ref && _.def)
        for (const N in d)
          N === "$ref" || N === "allOf" || N in _.def && JSON.stringify(d[N]) === JSON.stringify(_.def[N]) && delete d[N];
    }
    const g = u._zod.parent;
    if (g && g !== h) {
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
const Ys = (e, t = {}) => (n) => {
  const o = jn({ ...n, processors: t });
  return U(e, o), Dn(o, e), Fn(o, e);
}, Ye = (e, t, n = {}) => (o) => {
  const { libraryOptions: r, target: i } = o ?? {}, s = jn({ ...r ?? {}, target: i, io: t, processors: n });
  return U(e, s), Dn(s, e), Fn(s, e);
}, Ks = {
  guid: "uuid",
  url: "uri",
  datetime: "date-time",
  json_string: "json-string",
  regex: ""
  // do not set
}, Qs = (e, t, n, o) => {
  const r = n;
  r.type = "string";
  const { minimum: i, maximum: s, format: a, patterns: c, contentEncoding: u } = e._zod.bag;
  if (typeof i == "number" && (r.minLength = i), typeof s == "number" && (r.maxLength = s), a && (r.format = Ks[a] ?? a, r.format === "" && delete r.format, a === "time" && delete r.format), u && (r.contentEncoding = u), c && c.size > 0) {
    const l = [...c];
    l.length === 1 ? r.pattern = l[0].source : l.length > 1 && (r.allOf = [
      ...l.map((d) => ({
        ...t.target === "draft-07" || t.target === "draft-04" || t.target === "openapi-3.0" ? { type: "string" } : {},
        pattern: d.source
      }))
    ]);
  }
}, ea = (e, t, n, o) => {
  const r = n, { minimum: i, maximum: s, format: a, multipleOf: c, exclusiveMaximum: u, exclusiveMinimum: l } = e._zod.bag;
  typeof a == "string" && a.includes("int") ? r.type = "integer" : r.type = "number", typeof l == "number" && (t.target === "draft-04" || t.target === "openapi-3.0" ? (r.minimum = l, r.exclusiveMinimum = !0) : r.exclusiveMinimum = l), typeof i == "number" && (r.minimum = i, typeof l == "number" && t.target !== "draft-04" && (l >= i ? delete r.minimum : delete r.exclusiveMinimum)), typeof u == "number" && (t.target === "draft-04" || t.target === "openapi-3.0" ? (r.maximum = u, r.exclusiveMaximum = !0) : r.exclusiveMaximum = u), typeof s == "number" && (r.maximum = s, typeof u == "number" && t.target !== "draft-04" && (u <= s ? delete r.maximum : delete r.exclusiveMaximum)), typeof c == "number" && (r.multipleOf = c);
}, ta = (e, t, n, o) => {
  n.type = "boolean";
}, na = (e, t, n, o) => {
  n.not = {};
}, oa = (e, t, n, o) => {
}, ra = (e, t, n, o) => {
  const r = e._zod.def, i = vn(r.entries);
  i.every((s) => typeof s == "number") && (n.type = "number"), i.every((s) => typeof s == "string") && (n.type = "string"), n.enum = i;
}, ia = (e, t, n, o) => {
  if (t.unrepresentable === "throw")
    throw new Error("Custom types cannot be represented in JSON Schema");
}, sa = (e, t, n, o) => {
  if (t.unrepresentable === "throw")
    throw new Error("Transforms cannot be represented in JSON Schema");
}, aa = (e, t, n, o) => {
  const r = n, i = e._zod.def, { minimum: s, maximum: a } = e._zod.bag;
  typeof s == "number" && (r.minItems = s), typeof a == "number" && (r.maxItems = a), r.type = "array", r.items = U(i.element, t, { ...o, path: [...o.path, "items"] });
}, ca = (e, t, n, o) => {
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
}, ua = (e, t, n, o) => {
  const r = e._zod.def, i = r.inclusive === !1, s = r.options.map((a, c) => U(a, t, {
    ...o,
    path: [...o.path, i ? "oneOf" : "anyOf", c]
  }));
  i ? n.oneOf = s : n.anyOf = s;
}, la = (e, t, n, o) => {
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
}, da = (e, t, n, o) => {
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
}, fa = (e, t, n, o) => {
  const r = e._zod.def, i = U(r.innerType, t, o), s = t.seen.get(e);
  t.target === "openapi-3.0" ? (s.ref = r.innerType, n.nullable = !0) : n.anyOf = [i, { type: "null" }];
}, pa = (e, t, n, o) => {
  const r = e._zod.def;
  U(r.innerType, t, o);
  const i = t.seen.get(e);
  i.ref = r.innerType;
}, ha = (e, t, n, o) => {
  const r = e._zod.def;
  U(r.innerType, t, o);
  const i = t.seen.get(e);
  i.ref = r.innerType, n.default = JSON.parse(JSON.stringify(r.defaultValue));
}, ma = (e, t, n, o) => {
  const r = e._zod.def;
  U(r.innerType, t, o);
  const i = t.seen.get(e);
  i.ref = r.innerType, t.io === "input" && (n._prefault = JSON.parse(JSON.stringify(r.defaultValue)));
}, ba = (e, t, n, o) => {
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
}, ga = (e, t, n, o) => {
  const r = e._zod.def, i = t.io === "input" ? r.in._zod.def.type === "transform" ? r.out : r.in : r.out;
  U(i, t, o);
  const s = t.seen.get(e);
  s.ref = i;
}, _a = (e, t, n, o) => {
  const r = e._zod.def;
  U(r.innerType, t, o);
  const i = t.seen.get(e);
  i.ref = r.innerType, n.readOnly = !0;
}, Bn = (e, t, n, o) => {
  const r = e._zod.def;
  U(r.innerType, t, o);
  const i = t.seen.get(e);
  i.ref = r.innerType;
}, va = /* @__PURE__ */ f("ZodISODateTime", (e, t) => {
  ki.init(e, t), P.init(e, t);
});
function ya(e) {
  return /* @__PURE__ */ Ns(va, e);
}
const wa = /* @__PURE__ */ f("ZodISODate", (e, t) => {
  Ei.init(e, t), P.init(e, t);
});
function ka(e) {
  return /* @__PURE__ */ Cs(wa, e);
}
const Ea = /* @__PURE__ */ f("ZodISOTime", (e, t) => {
  zi.init(e, t), P.init(e, t);
});
function za(e) {
  return /* @__PURE__ */ xs(Ea, e);
}
const Sa = /* @__PURE__ */ f("ZodISODuration", (e, t) => {
  Si.init(e, t), P.init(e, t);
});
function $a(e) {
  return /* @__PURE__ */ Ts(Sa, e);
}
const Na = (e, t) => {
  En.init(e, t), e.name = "ZodError", Object.defineProperties(e, {
    format: {
      value: (n) => mr(e, n)
      // enumerable: false,
    },
    flatten: {
      value: (n) => hr(e, n)
      // enumerable: false,
    },
    addIssue: {
      value: (n) => {
        e.issues.push(n), e.message = JSON.stringify(e.issues, vt, 2);
      }
      // enumerable: false,
    },
    addIssues: {
      value: (n) => {
        e.issues.push(...n), e.message = JSON.stringify(e.issues, vt, 2);
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
}, G = f("ZodError", Na, {
  Parent: Error
}), Ca = /* @__PURE__ */ Nt(G), xa = /* @__PURE__ */ Ct(G), Ta = /* @__PURE__ */ nt(G), Aa = /* @__PURE__ */ ot(G), Za = /* @__PURE__ */ _r(G), La = /* @__PURE__ */ vr(G), Ra = /* @__PURE__ */ yr(G), Ia = /* @__PURE__ */ wr(G), Oa = /* @__PURE__ */ kr(G), Pa = /* @__PURE__ */ Er(G), Ma = /* @__PURE__ */ zr(G), ja = /* @__PURE__ */ Sr(G), j = /* @__PURE__ */ f("ZodType", (e, t) => (M.init(e, t), Object.assign(e["~standard"], {
  jsonSchema: {
    input: Ye(e, "input"),
    output: Ye(e, "output")
  }
}), e.toJSONSchema = Ys(e, {}), e.def = t, e.type = t.type, Object.defineProperty(e, "_def", { value: t }), e.check = (...n) => e.clone(ae(t, {
  checks: [
    ...t.checks ?? [],
    ...n.map((o) => typeof o == "function" ? { _zod: { check: o, def: { check: "custom" }, onattach: [] } } : o)
  ]
}), {
  parent: !0
}), e.with = e.check, e.clone = (n, o) => ce(e, n, o), e.brand = () => e, e.register = (n, o) => (n.add(e, o), e), e.parse = (n, o) => Ca(e, n, o, { callee: e.parse }), e.safeParse = (n, o) => Ta(e, n, o), e.parseAsync = async (n, o) => xa(e, n, o, { callee: e.parseAsync }), e.safeParseAsync = async (n, o) => Aa(e, n, o), e.spa = e.safeParseAsync, e.encode = (n, o) => Za(e, n, o), e.decode = (n, o) => La(e, n, o), e.encodeAsync = async (n, o) => Ra(e, n, o), e.decodeAsync = async (n, o) => Ia(e, n, o), e.safeEncode = (n, o) => Oa(e, n, o), e.safeDecode = (n, o) => Pa(e, n, o), e.safeEncodeAsync = async (n, o) => Ma(e, n, o), e.safeDecodeAsync = async (n, o) => ja(e, n, o), e.refine = (n, o) => e.check(Ac(n, o)), e.superRefine = (n) => e.check(Zc(n)), e.overwrite = (n) => e.check(/* @__PURE__ */ ze(n)), e.optional = () => sn(e), e.exactOptional = () => vc(e), e.nullable = () => an(e), e.nullish = () => sn(an(e)), e.nonoptional = (n) => zc(e, n), e.array = () => Pe(e), e.or = (n) => dc([e, n]), e.and = (n) => pc(e, n), e.transform = (n) => cn(e, gc(n)), e.default = (n) => wc(e, n), e.prefault = (n) => Ec(e, n), e.catch = (n) => $c(e, n), e.pipe = (n) => cn(e, n), e.readonly = () => xc(e), e.describe = (n) => {
  const o = e.clone();
  return Ze.add(o, { description: n }), o;
}, Object.defineProperty(e, "description", {
  get() {
    var n;
    return (n = Ze.get(e)) == null ? void 0 : n.description;
  },
  configurable: !0
}), e.meta = (...n) => {
  if (n.length === 0)
    return Ze.get(e);
  const o = e.clone();
  return Ze.add(o, n[0]), o;
}, e.isOptional = () => e.safeParse(void 0).success, e.isNullable = () => e.safeParse(null).success, e.apply = (n) => n(e), e)), Un = /* @__PURE__ */ f("_ZodString", (e, t) => {
  xt.init(e, t), j.init(e, t), e._zod.processJSONSchema = (o, r, i) => Qs(e, o, r);
  const n = e._zod.bag;
  e.format = n.format ?? null, e.minLength = n.minimum ?? null, e.maxLength = n.maximum ?? null, e.regex = (...o) => e.check(/* @__PURE__ */ Os(...o)), e.includes = (...o) => e.check(/* @__PURE__ */ js(...o)), e.startsWith = (...o) => e.check(/* @__PURE__ */ Ds(...o)), e.endsWith = (...o) => e.check(/* @__PURE__ */ Fs(...o)), e.min = (...o) => e.check(/* @__PURE__ */ Xe(...o)), e.max = (...o) => e.check(/* @__PURE__ */ Pn(...o)), e.length = (...o) => e.check(/* @__PURE__ */ Mn(...o)), e.nonempty = (...o) => e.check(/* @__PURE__ */ Xe(1, ...o)), e.lowercase = (o) => e.check(/* @__PURE__ */ Ps(o)), e.uppercase = (o) => e.check(/* @__PURE__ */ Ms(o)), e.trim = () => e.check(/* @__PURE__ */ Us()), e.normalize = (...o) => e.check(/* @__PURE__ */ Bs(...o)), e.toLowerCase = () => e.check(/* @__PURE__ */ Hs()), e.toUpperCase = () => e.check(/* @__PURE__ */ Vs()), e.slugify = () => e.check(/* @__PURE__ */ qs());
}), Hn = /* @__PURE__ */ f("ZodString", (e, t) => {
  xt.init(e, t), Un.init(e, t), e.email = (n) => e.check(/* @__PURE__ */ ss(Da, n)), e.url = (n) => e.check(/* @__PURE__ */ ds(Fa, n)), e.jwt = (n) => e.check(/* @__PURE__ */ $s(nc, n)), e.emoji = (n) => e.check(/* @__PURE__ */ fs(Ba, n)), e.guid = (n) => e.check(/* @__PURE__ */ Qt(on, n)), e.uuid = (n) => e.check(/* @__PURE__ */ as(Fe, n)), e.uuidv4 = (n) => e.check(/* @__PURE__ */ cs(Fe, n)), e.uuidv6 = (n) => e.check(/* @__PURE__ */ us(Fe, n)), e.uuidv7 = (n) => e.check(/* @__PURE__ */ ls(Fe, n)), e.nanoid = (n) => e.check(/* @__PURE__ */ ps(Ua, n)), e.guid = (n) => e.check(/* @__PURE__ */ Qt(on, n)), e.cuid = (n) => e.check(/* @__PURE__ */ hs(Ha, n)), e.cuid2 = (n) => e.check(/* @__PURE__ */ ms(Va, n)), e.ulid = (n) => e.check(/* @__PURE__ */ bs(qa, n)), e.base64 = (n) => e.check(/* @__PURE__ */ Es(Qa, n)), e.base64url = (n) => e.check(/* @__PURE__ */ zs(ec, n)), e.xid = (n) => e.check(/* @__PURE__ */ gs(Ja, n)), e.ksuid = (n) => e.check(/* @__PURE__ */ _s(Wa, n)), e.ipv4 = (n) => e.check(/* @__PURE__ */ vs(Ga, n)), e.ipv6 = (n) => e.check(/* @__PURE__ */ ys(Xa, n)), e.cidrv4 = (n) => e.check(/* @__PURE__ */ ws(Ya, n)), e.cidrv6 = (n) => e.check(/* @__PURE__ */ ks(Ka, n)), e.e164 = (n) => e.check(/* @__PURE__ */ Ss(tc, n)), e.datetime = (n) => e.check(ya(n)), e.date = (n) => e.check(ka(n)), e.time = (n) => e.check(za(n)), e.duration = (n) => e.check($a(n));
});
function J(e) {
  return /* @__PURE__ */ is(Hn, e);
}
const P = /* @__PURE__ */ f("ZodStringFormat", (e, t) => {
  O.init(e, t), Un.init(e, t);
}), Da = /* @__PURE__ */ f("ZodEmail", (e, t) => {
  pi.init(e, t), P.init(e, t);
}), on = /* @__PURE__ */ f("ZodGUID", (e, t) => {
  di.init(e, t), P.init(e, t);
}), Fe = /* @__PURE__ */ f("ZodUUID", (e, t) => {
  fi.init(e, t), P.init(e, t);
}), Fa = /* @__PURE__ */ f("ZodURL", (e, t) => {
  hi.init(e, t), P.init(e, t);
}), Ba = /* @__PURE__ */ f("ZodEmoji", (e, t) => {
  mi.init(e, t), P.init(e, t);
}), Ua = /* @__PURE__ */ f("ZodNanoID", (e, t) => {
  bi.init(e, t), P.init(e, t);
}), Ha = /* @__PURE__ */ f("ZodCUID", (e, t) => {
  gi.init(e, t), P.init(e, t);
}), Va = /* @__PURE__ */ f("ZodCUID2", (e, t) => {
  _i.init(e, t), P.init(e, t);
}), qa = /* @__PURE__ */ f("ZodULID", (e, t) => {
  vi.init(e, t), P.init(e, t);
}), Ja = /* @__PURE__ */ f("ZodXID", (e, t) => {
  yi.init(e, t), P.init(e, t);
}), Wa = /* @__PURE__ */ f("ZodKSUID", (e, t) => {
  wi.init(e, t), P.init(e, t);
}), Ga = /* @__PURE__ */ f("ZodIPv4", (e, t) => {
  $i.init(e, t), P.init(e, t);
}), Xa = /* @__PURE__ */ f("ZodIPv6", (e, t) => {
  Ni.init(e, t), P.init(e, t);
}), Ya = /* @__PURE__ */ f("ZodCIDRv4", (e, t) => {
  Ci.init(e, t), P.init(e, t);
}), Ka = /* @__PURE__ */ f("ZodCIDRv6", (e, t) => {
  xi.init(e, t), P.init(e, t);
}), Qa = /* @__PURE__ */ f("ZodBase64", (e, t) => {
  Ti.init(e, t), P.init(e, t);
}), ec = /* @__PURE__ */ f("ZodBase64URL", (e, t) => {
  Zi.init(e, t), P.init(e, t);
}), tc = /* @__PURE__ */ f("ZodE164", (e, t) => {
  Li.init(e, t), P.init(e, t);
}), nc = /* @__PURE__ */ f("ZodJWT", (e, t) => {
  Ii.init(e, t), P.init(e, t);
}), Tt = /* @__PURE__ */ f("ZodNumber", (e, t) => {
  Ln.init(e, t), j.init(e, t), e._zod.processJSONSchema = (o, r, i) => ea(e, o, r), e.gt = (o, r) => e.check(/* @__PURE__ */ tn(o, r)), e.gte = (o, r) => e.check(/* @__PURE__ */ ht(o, r)), e.min = (o, r) => e.check(/* @__PURE__ */ ht(o, r)), e.lt = (o, r) => e.check(/* @__PURE__ */ en(o, r)), e.lte = (o, r) => e.check(/* @__PURE__ */ pt(o, r)), e.max = (o, r) => e.check(/* @__PURE__ */ pt(o, r)), e.int = (o) => e.check(rn(o)), e.safe = (o) => e.check(rn(o)), e.positive = (o) => e.check(/* @__PURE__ */ tn(0, o)), e.nonnegative = (o) => e.check(/* @__PURE__ */ ht(0, o)), e.negative = (o) => e.check(/* @__PURE__ */ en(0, o)), e.nonpositive = (o) => e.check(/* @__PURE__ */ pt(0, o)), e.multipleOf = (o, r) => e.check(/* @__PURE__ */ nn(o, r)), e.step = (o, r) => e.check(/* @__PURE__ */ nn(o, r)), e.finite = () => e;
  const n = e._zod.bag;
  e.minValue = Math.max(n.minimum ?? Number.NEGATIVE_INFINITY, n.exclusiveMinimum ?? Number.NEGATIVE_INFINITY) ?? null, e.maxValue = Math.min(n.maximum ?? Number.POSITIVE_INFINITY, n.exclusiveMaximum ?? Number.POSITIVE_INFINITY) ?? null, e.isInt = (n.format ?? "").includes("int") || Number.isSafeInteger(n.multipleOf ?? 0.5), e.isFinite = !0, e.format = n.format ?? null;
});
function pe(e) {
  return /* @__PURE__ */ As(Tt, e);
}
const oc = /* @__PURE__ */ f("ZodNumberFormat", (e, t) => {
  Oi.init(e, t), Tt.init(e, t);
});
function rn(e) {
  return /* @__PURE__ */ Zs(oc, e);
}
const Vn = /* @__PURE__ */ f("ZodBoolean", (e, t) => {
  Pi.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, o, r) => ta(e, n, o);
});
function rc(e) {
  return /* @__PURE__ */ Ls(Vn, e);
}
const ic = /* @__PURE__ */ f("ZodUnknown", (e, t) => {
  Mi.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, o, r) => oa();
});
function Ke() {
  return /* @__PURE__ */ Rs(ic);
}
const sc = /* @__PURE__ */ f("ZodNever", (e, t) => {
  ji.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, o, r) => na(e, n, o);
});
function ac(e) {
  return /* @__PURE__ */ Is(sc, e);
}
const cc = /* @__PURE__ */ f("ZodArray", (e, t) => {
  Di.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, o, r) => aa(e, n, o, r), e.element = t.element, e.min = (n, o) => e.check(/* @__PURE__ */ Xe(n, o)), e.nonempty = (n) => e.check(/* @__PURE__ */ Xe(1, n)), e.max = (n, o) => e.check(/* @__PURE__ */ Pn(n, o)), e.length = (n, o) => e.check(/* @__PURE__ */ Mn(n, o)), e.unwrap = () => e.element;
});
function Pe(e, t) {
  return /* @__PURE__ */ Js(cc, e, t);
}
const uc = /* @__PURE__ */ f("ZodObject", (e, t) => {
  Bi.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, o, r) => ca(e, n, o, r), L(e, "shape", () => t.shape), e.keyof = () => qn(Object.keys(e._zod.def.shape)), e.catchall = (n) => e.clone({ ...e._zod.def, catchall: n }), e.passthrough = () => e.clone({ ...e._zod.def, catchall: Ke() }), e.loose = () => e.clone({ ...e._zod.def, catchall: Ke() }), e.strict = () => e.clone({ ...e._zod.def, catchall: ac() }), e.strip = () => e.clone({ ...e._zod.def, catchall: void 0 }), e.extend = (n) => ur(e, n), e.safeExtend = (n) => lr(e, n), e.merge = (n) => dr(e, n), e.pick = (n) => ar(e, n), e.omit = (n) => cr(e, n), e.partial = (...n) => fr(At, e, n[0]), e.required = (...n) => pr(Wn, e, n[0]);
});
function Me(e, t) {
  const n = {
    type: "object",
    shape: e ?? {},
    ...S(t)
  };
  return new uc(n);
}
const lc = /* @__PURE__ */ f("ZodUnion", (e, t) => {
  Ui.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, o, r) => ua(e, n, o, r), e.options = t.options;
});
function dc(e, t) {
  return new lc({
    type: "union",
    options: e,
    ...S(t)
  });
}
const fc = /* @__PURE__ */ f("ZodIntersection", (e, t) => {
  Hi.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, o, r) => la(e, n, o, r);
});
function pc(e, t) {
  return new fc({
    type: "intersection",
    left: e,
    right: t
  });
}
const hc = /* @__PURE__ */ f("ZodRecord", (e, t) => {
  Vi.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, o, r) => da(e, n, o, r), e.keyType = t.keyType, e.valueType = t.valueType;
});
function mc(e, t, n) {
  return new hc({
    type: "record",
    keyType: e,
    valueType: t,
    ...S(n)
  });
}
const Qe = /* @__PURE__ */ f("ZodEnum", (e, t) => {
  qi.init(e, t), j.init(e, t), e._zod.processJSONSchema = (o, r, i) => ra(e, o, r), e.enum = t.entries, e.options = Object.values(t.entries);
  const n = new Set(Object.keys(t.entries));
  e.extract = (o, r) => {
    const i = {};
    for (const s of o)
      if (n.has(s))
        i[s] = t.entries[s];
      else
        throw new Error(`Key ${s} not found in enum`);
    return new Qe({
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
    return new Qe({
      ...t,
      checks: [],
      ...S(r),
      entries: i
    });
  };
});
function qn(e, t) {
  const n = Array.isArray(e) ? Object.fromEntries(e.map((o) => [o, o])) : e;
  return new Qe({
    type: "enum",
    entries: n,
    ...S(t)
  });
}
const bc = /* @__PURE__ */ f("ZodTransform", (e, t) => {
  Ji.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, o, r) => sa(e, n), e._zod.parse = (n, o) => {
    if (o.direction === "backward")
      throw new gn(e.constructor.name);
    n.addIssue = (i) => {
      if (typeof i == "string")
        n.issues.push(Oe(i, n.value, t));
      else {
        const s = i;
        s.fatal && (s.continue = !1), s.code ?? (s.code = "custom"), s.input ?? (s.input = n.value), s.inst ?? (s.inst = e), n.issues.push(Oe(s));
      }
    };
    const r = t.transform(n.value, n);
    return r instanceof Promise ? r.then((i) => (n.value = i, n)) : (n.value = r, n);
  };
});
function gc(e) {
  return new bc({
    type: "transform",
    transform: e
  });
}
const At = /* @__PURE__ */ f("ZodOptional", (e, t) => {
  On.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, o, r) => Bn(e, n, o, r), e.unwrap = () => e._zod.def.innerType;
});
function sn(e) {
  return new At({
    type: "optional",
    innerType: e
  });
}
const _c = /* @__PURE__ */ f("ZodExactOptional", (e, t) => {
  Wi.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, o, r) => Bn(e, n, o, r), e.unwrap = () => e._zod.def.innerType;
});
function vc(e) {
  return new _c({
    type: "optional",
    innerType: e
  });
}
const yc = /* @__PURE__ */ f("ZodNullable", (e, t) => {
  Gi.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, o, r) => fa(e, n, o, r), e.unwrap = () => e._zod.def.innerType;
});
function an(e) {
  return new yc({
    type: "nullable",
    innerType: e
  });
}
const Jn = /* @__PURE__ */ f("ZodDefault", (e, t) => {
  Xi.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, o, r) => ha(e, n, o, r), e.unwrap = () => e._zod.def.innerType, e.removeDefault = e.unwrap;
});
function wc(e, t) {
  return new Jn({
    type: "default",
    innerType: e,
    get defaultValue() {
      return typeof t == "function" ? t() : wn(t);
    }
  });
}
const kc = /* @__PURE__ */ f("ZodPrefault", (e, t) => {
  Yi.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, o, r) => ma(e, n, o, r), e.unwrap = () => e._zod.def.innerType;
});
function Ec(e, t) {
  return new kc({
    type: "prefault",
    innerType: e,
    get defaultValue() {
      return typeof t == "function" ? t() : wn(t);
    }
  });
}
const Wn = /* @__PURE__ */ f("ZodNonOptional", (e, t) => {
  Ki.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, o, r) => pa(e, n, o, r), e.unwrap = () => e._zod.def.innerType;
});
function zc(e, t) {
  return new Wn({
    type: "nonoptional",
    innerType: e,
    ...S(t)
  });
}
const Sc = /* @__PURE__ */ f("ZodCatch", (e, t) => {
  Qi.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, o, r) => ba(e, n, o, r), e.unwrap = () => e._zod.def.innerType, e.removeCatch = e.unwrap;
});
function $c(e, t) {
  return new Sc({
    type: "catch",
    innerType: e,
    catchValue: typeof t == "function" ? t : () => t
  });
}
const Nc = /* @__PURE__ */ f("ZodPipe", (e, t) => {
  es.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, o, r) => ga(e, n, o, r), e.in = t.in, e.out = t.out;
});
function cn(e, t) {
  return new Nc({
    type: "pipe",
    in: e,
    out: t
    // ...util.normalizeParams(params),
  });
}
const Cc = /* @__PURE__ */ f("ZodReadonly", (e, t) => {
  ts.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, o, r) => _a(e, n, o, r), e.unwrap = () => e._zod.def.innerType;
});
function xc(e) {
  return new Cc({
    type: "readonly",
    innerType: e
  });
}
const Tc = /* @__PURE__ */ f("ZodCustom", (e, t) => {
  ns.init(e, t), j.init(e, t), e._zod.processJSONSchema = (n, o, r) => ia(e, n);
});
function Ac(e, t = {}) {
  return /* @__PURE__ */ Ws(Tc, e, t);
}
function Zc(e) {
  return /* @__PURE__ */ Gs(e);
}
const Lc = /* @__PURE__ */ new Set(["id", "image"]);
function wt(e) {
  return e instanceof At ? wt(e.unwrap()) : e instanceof Jn ? wt(e._def.innerType) : e;
}
function Rc(e) {
  const t = [];
  for (const [n, o] of Object.entries(e.shape)) {
    if (Lc.has(n)) continue;
    const r = o, i = wt(r), s = r.description ?? n;
    if (i instanceof Vn) {
      t.push({ key: n, label: s, type: "boolean" });
      continue;
    }
    if (i instanceof Qe) {
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
    if (i instanceof Hn) {
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
const Ic = Me({
  x: pe().min(0).max(100),
  y: pe().min(0).max(100)
}), Oc = Me({
  id: J(),
  shape: qn(["rect", "polygon"]).default("rect"),
  x: pe().min(0).max(100),
  y: pe().min(0).max(100),
  width: pe().min(0).max(100),
  height: pe().min(0).max(100),
  points: Pe(Ic).optional(),
  correct: rc().default(!1),
  label: J().optional()
}), Zt = Me({
  id: J(),
  image: J().optional(),
  zones: Pe(Oc).optional()
}).passthrough(), Pc = Zt.extend({
  target: J().max(2).describe("אות יעד"),
  correct: J().describe("תשובה נכונה"),
  correctEmoji: J().describe("אמוג'י")
}), Mc = Zt.extend({
  target: J().max(2).describe("אות יעד"),
  correct: J().describe("תשובה נכונה"),
  correctEmoji: J().describe("אמוג'י")
}), jc = Me({
  title: J().default(""),
  type: J().default("multiple-choice")
}).passthrough(), Lu = Me({
  id: J(),
  version: pe().default(1),
  meta: jc.default({ title: "", type: "multiple-choice" }),
  rounds: Pe(mc(J(), Ke())).default([]),
  distractors: Pe(Ke()).default([])
}), Dc = Zt.extend({
  instruction: J().optional().describe("הוראה")
}), un = {
  "multiple-choice": Pc,
  "drag-match": Mc,
  "zone-tap": Dc
};
function Fc(e, { onFieldChange: t, onDeleteRound: n, roundSchema: o }) {
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
    const v = o ?? un[E] ?? un["multiple-choice"];
    Rc(v).forEach((z) => s.appendChild(d(z, b))), s.appendChild(k(b)), a.onclick = () => {
      confirm("למחוק את הסיבוב הזה?") && (n(c), u());
    };
  }
  function d(b, E) {
    const v = document.createElement("div");
    v.className = "ab-editor-field";
    const x = document.createElement("label");
    switch (x.className = "ab-editor-field__label", x.textContent = b.label, v.appendChild(x), b.type) {
      case "emoji":
        v.appendChild(h(b, E));
        break;
      case "boolean":
        v.appendChild(g(b, E));
        break;
      case "select":
        v.appendChild(_(b, E));
        break;
      case "number":
        v.appendChild(C(b, E));
        break;
      default:
        v.appendChild(m(b, E));
        break;
    }
    return v;
  }
  function m(b, E) {
    const v = document.createElement("input");
    return v.className = "ab-editor-field__input", v.type = "text", v.value = String(E[b.key] ?? ""), v.dir = "rtl", b.maxLength && (v.maxLength = b.maxLength), v.addEventListener("input", () => t(c, b.key, v.value)), v;
  }
  function h(b, E) {
    const v = document.createElement("div");
    v.className = "ab-editor-field__emoji-row";
    const x = document.createElement("div");
    x.className = "ab-editor-field__emoji-preview", x.textContent = String(E[b.key] ?? "❓"), v.appendChild(x);
    const z = document.createElement("input");
    return z.className = "ab-editor-field__input", z.type = "text", z.value = String(E[b.key] ?? ""), z.maxLength = 8, z.placeholder = "🐱", z.style.fontSize = "20px", z.addEventListener("input", () => {
      x.textContent = z.value || "❓", t(c, b.key, z.value);
    }), v.appendChild(z), v;
  }
  function g(b, E) {
    const v = document.createElement("input");
    return v.type = "checkbox", v.checked = !!E[b.key], v.addEventListener("change", () => t(c, b.key, v.checked)), v;
  }
  function _(b, E) {
    const v = document.createElement("select");
    return v.className = "ab-editor-field__input", (b.options ?? []).forEach((x) => {
      const z = document.createElement("option");
      z.value = x, z.textContent = x, E[b.key] === x && (z.selected = !0), v.appendChild(z);
    }), v.addEventListener("change", () => t(c, b.key, v.value)), v;
  }
  function C(b, E) {
    const v = document.createElement("input");
    return v.className = "ab-editor-field__input", v.type = "number", v.value = String(E[b.key] ?? ""), b.min !== void 0 && (v.min = String(b.min)), b.max !== void 0 && (v.max = String(b.max)), v.addEventListener("input", () => t(c, b.key, Number(v.value))), v;
  }
  function k(b) {
    const E = document.createElement("div");
    E.className = "ab-editor-field ab-editor-field--image";
    const v = document.createElement("label");
    v.className = "ab-editor-field__label", v.textContent = "🖼 תמונה", E.appendChild(v);
    const x = document.createElement("div");
    x.className = "ab-editor-field__img-row";
    const z = document.createElement("div");
    z.className = "ab-editor-field__img-preview", b.image && (z.style.backgroundImage = `url(${b.image})`), x.appendChild(z);
    const $ = document.createElement("div");
    $.className = "ab-editor-field__img-btns";
    const w = document.createElement("input");
    w.type = "file", w.accept = "image/*", w.style.display = "none", w.addEventListener("change", () => {
      var p;
      const H = (p = w.files) == null ? void 0 : p[0];
      if (!H) return;
      const V = new FileReader();
      V.onload = (y) => {
        const T = y.target.result;
        z.style.backgroundImage = `url(${T})`, A.textContent = "🔄 החלף", t(c, "image", T), R.isConnected || $.appendChild(R);
      }, V.readAsDataURL(H);
    }), $.appendChild(w);
    const A = document.createElement("button");
    A.className = "ab-editor-btn ab-editor-btn--img-upload", A.textContent = b.image ? "🔄 החלף" : "📤 העלה", A.addEventListener("click", () => w.click()), $.appendChild(A);
    const R = document.createElement("button");
    return R.className = "ab-editor-btn ab-editor-btn--img-clear", R.textContent = "✕ הסר", R.addEventListener("click", () => {
      z.style.backgroundImage = "", A.textContent = "📤 העלה", t(c, "image", null), R.remove();
    }), b.image && $.appendChild(R), x.appendChild($), E.appendChild(x), E;
  }
  function N() {
    r.remove();
  }
  return u(), { loadRound: l, clear: u, destroy: N };
}
function Bc() {
  return ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/ogg"].find((t) => MediaRecorder.isTypeSupported(t)) || "";
}
function Uc() {
  var e;
  return typeof navigator < "u" && typeof ((e = navigator.mediaDevices) == null ? void 0 : e.getUserMedia) == "function" && typeof MediaRecorder < "u";
}
function Hc() {
  let e = null, t = null, n = [];
  async function o() {
    if (e && e.state === "recording") return;
    t = await navigator.mediaDevices.getUserMedia({ audio: !0, video: !1 }), n = [];
    const c = {}, u = Bc();
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
const Vc = "alefbet-voices", re = "recordings", qc = 1;
let Ce = null;
function it() {
  return Ce || (Ce = new Promise((e, t) => {
    const n = indexedDB.open(Vc, qc);
    n.onupgradeneeded = () => {
      n.result.createObjectStore(re);
    }, n.onsuccess = () => e(n.result), n.onerror = () => {
      Ce = null, t(n.error);
    };
  }), Ce);
}
function Lt(e, t) {
  return `${e}/${t}`;
}
async function Jc(e, t, n) {
  const o = await it();
  return new Promise((r, i) => {
    const s = o.transaction(re, "readwrite");
    s.objectStore(re).put(n, Lt(e, t)), s.oncomplete = r, s.onerror = (a) => i(a.target.error);
  });
}
async function Rt(e, t) {
  const n = await it();
  return new Promise((o, r) => {
    const s = n.transaction(re, "readonly").objectStore(re).get(Lt(e, t));
    s.onsuccess = () => o(s.result ?? null), s.onerror = (a) => r(a.target.error);
  });
}
async function Wc(e, t) {
  const n = await it();
  return new Promise((o, r) => {
    const i = n.transaction(re, "readwrite");
    i.objectStore(re).delete(Lt(e, t)), i.oncomplete = o, i.onerror = (s) => r(s.target.error);
  });
}
async function Gc(e) {
  const t = await it();
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
async function ye(e, t) {
  let n;
  try {
    n = await Rt(e, t);
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
async function Ru(e, t) {
  return await Rt(e, t).catch(() => null) !== null;
}
function Gn(e, {
  gameId: t,
  voiceKey: n,
  label: o = "הקלטת קול",
  onSaved: r,
  onDeleted: i
}) {
  if (!Uc()) {
    const w = document.createElement("span");
    return w.className = "ab-voice-unsupported", w.textContent = "🎤 הקלטה לא נתמכת בדפדפן זה", e.appendChild(w), { refresh: async () => {
    }, destroy: () => w.remove() };
  }
  const s = Hc(), a = document.createElement("div");
  a.className = "ab-voice-btn-wrap", a.setAttribute("aria-label", o), e.appendChild(a);
  let c = "idle", u = null, l = null, d = null, m = null, h = null, g = null, _ = 0;
  function C() {
    if (a.innerHTML = "", c === "idle")
      u = k("🎤", "ab-voice-btn ab-voice-btn--record", "התחל הקלטה", N), a.appendChild(u);
    else if (c === "recording") {
      h = document.createElement("span"), h.className = "ab-voice-indicator", a.appendChild(h);
      const w = document.createElement("span");
      w.className = "ab-voice-timer", w.textContent = "0:00", a.appendChild(w), _ = 0, g = setInterval(() => {
        _++;
        const A = Math.floor(_ / 60), R = String(_ % 60).padStart(2, "0");
        w.textContent = `${A}:${R}`, _ >= 120 && b();
      }, 1e3), l = k("⏹", "ab-voice-btn ab-voice-btn--stop", "עצור הקלטה", b), a.appendChild(l);
    } else c === "has-voice" && (d = k("▶", "ab-voice-btn ab-voice-btn--play", "נגן הקלטה", E), a.appendChild(d), u = k("🎤", "ab-voice-btn ab-voice-btn--re-record", "הקלט מחדש", N), a.appendChild(u), m = k("🗑", "ab-voice-btn ab-voice-btn--delete", "מחק הקלטה", v), a.appendChild(m));
  }
  function k(w, A, R, H) {
    const V = document.createElement("button");
    return V.className = A, V.type = "button", V.title = R, V.setAttribute("aria-label", R), V.textContent = w, V.addEventListener("click", H), V;
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
      await Jc(t, n, w), c = "has-voice", C(), r == null || r(w);
    } catch (w) {
      console.warn("[voice-record-button] stop error:", w), c = "idle", C();
    }
  }
  async function E() {
    d == null || d.setAttribute("disabled", "true"), await ye(t, n), d == null || d.removeAttribute("disabled");
  }
  async function v() {
    confirm("למחוק את ההקלטה?") && (await Wc(t, n), c = "idle", C(), i == null || i());
  }
  function x(w) {
    const A = document.createElement("span");
    A.className = "ab-voice-error", A.textContent = w, a.appendChild(A), setTimeout(() => A.remove(), 3e3);
  }
  async function z() {
    if (s.isActive()) return;
    c = await Rt(t, n).catch(() => null) ? "has-voice" : "idle", C();
  }
  function $() {
    clearInterval(g), s.isActive() && s.cancel(), a.remove();
  }
  return z(), { refresh: z, destroy: $ };
}
const Xc = [
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
function Yc(e) {
  return e.trim().replace(/\s+/g, "-").replace(/[^a-z0-9\u05D0-\u05EA_-]/gi, "").toLowerCase() || `custom-${Date.now()}`;
}
function Kc(e) {
  return hn(`alefbet.audio-manager.${e}.custom`, []);
}
function Qc(e, t = null) {
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
  const o = n.querySelector("#ab-am-body"), r = n.querySelector(".ab-am-close"), i = n.querySelector(".ab-am-backdrop"), s = [], a = [...Xc];
  t && t.rounds.length > 0 && a.splice(1, 0, {
    // insert after Instructions
    id: "rounds",
    label: "🔤 שאלות / סיבובים",
    slots: t.rounds.map((l, d) => ({
      key: l.id,
      label: `סיבוב ${d + 1}${l.target ? " — " + l.target : ""}${l.correct ? " (" + l.correct + ")" : ""}`
    }))
  }), a.forEach((l) => {
    o.appendChild(eu(l, e, s));
  }), o.appendChild(tu(e, s));
  function c() {
    s.forEach((l) => l.destroy()), n.remove();
  }
  r.addEventListener("click", c), i.addEventListener("click", c), document.addEventListener("keydown", function l(d) {
    d.key === "Escape" && (c(), document.removeEventListener("keydown", l));
  });
}
function eu(e, t, n) {
  const o = document.createElement("section");
  o.className = "ab-am-section";
  const r = document.createElement("button");
  r.className = "ab-am-section__heading", r.setAttribute("aria-expanded", "true"), r.innerHTML = `<span>${e.label}</span><span class="ab-am-chevron">▾</span>`, o.appendChild(r);
  const i = document.createElement("div");
  return i.className = "ab-am-grid", o.appendChild(i), e.slots.forEach((s) => {
    i.appendChild(Xn(t, s.key, s.label, n));
  }), r.addEventListener("click", () => {
    const s = r.getAttribute("aria-expanded") === "true";
    r.setAttribute("aria-expanded", String(!s)), i.hidden = s, r.querySelector(".ab-am-chevron").textContent = s ? "▸" : "▾";
  }), o;
}
function tu(e, t) {
  const n = Kc(e), o = document.createElement("section");
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
      const m = Xn(e, d.key, d.label, t, () => {
        n.update((h) => h.filter((g) => g.key !== d.key)), s();
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
    const m = Yc(d);
    if (n.get().some((h) => h.key === m)) {
      c.select();
      return;
    }
    n.update((h) => [...h, { key: m, label: d }]), c.value = "", s();
  }
  return u.addEventListener("click", l), c.addEventListener("keydown", (d) => {
    d.key === "Enter" && l();
  }), r.addEventListener("click", () => {
    const d = r.getAttribute("aria-expanded") === "true";
    r.setAttribute("aria-expanded", String(!d)), i.hidden = d, a.hidden = d, r.querySelector(".ab-am-chevron").textContent = d ? "▸" : "▾";
  }), o;
}
function Xn(e, t, n, o, r = null) {
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
  const l = Gn(u, { gameId: e, voiceKey: t, label: n });
  return o.push(l), i._voiceBtn = l, i.appendChild(c), i.appendChild(u), i;
}
let nu = 0;
function ln() {
  return `zone-${Date.now()}-${nu++}`;
}
function ou(e) {
  const t = e.map((i) => i.x), n = e.map((i) => i.y), o = Math.min(...t), r = Math.min(...n);
  return { x: o, y: r, width: Math.max(...t) - o, height: Math.max(...n) - r };
}
function ru(e, t, n, o, r) {
  return e.map((i) => {
    const s = o > 0 ? (i.x - t) / o * 100 : 0, a = r > 0 ? (i.y - n) / r * 100 : 0;
    return `${s},${a}`;
  }).join(" ");
}
function iu(e, t, { onChange: n, gameId: o }) {
  let r = structuredClone(t), i = null, s = "rect", a = [], c = null, u = [], l = null, d = null, m = null;
  const h = document.createElement("div");
  h.className = "ab-ze-overlay";
  const g = document.createElement("div");
  g.className = "ab-ze-draw-rect", g.hidden = !0, h.appendChild(g);
  const _ = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  _.classList.add("ab-ze-poly-svg"), _.setAttribute("viewBox", "0 0 100 100"), _.setAttribute("preserveAspectRatio", "none"), _.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:12;", h.appendChild(_);
  const C = document.createElement("div");
  C.className = "ab-ze-toolbar", h.appendChild(C);
  function k() {
    C.innerHTML = "";
    const p = document.createElement("button");
    p.className = `ab-ze-tool-btn${s === "rect" ? " ab-ze-tool-btn--active" : ""}`, p.textContent = "▭ מלבן", p.addEventListener("click", () => {
      v("rect");
    }), C.appendChild(p);
    const y = document.createElement("button");
    y.className = `ab-ze-tool-btn${s === "polygon" ? " ab-ze-tool-btn--active" : ""}`, y.textContent = "✎ חופשי", y.addEventListener("click", () => {
      v("polygon");
    }), C.appendChild(y);
    const T = document.createElement("span");
    T.className = "ab-ze-toolbar__hint", T.textContent = s === "rect" ? "גררו לציור מלבן" : "לחצו נקודות, לחצו פעמיים לסגירה", C.appendChild(T);
  }
  e.style.position = "relative", e.appendChild(h), k();
  function N(p, y) {
    const T = h.getBoundingClientRect();
    return {
      px: Math.max(0, Math.min(100, (p - T.left) / T.width * 100)),
      py: Math.max(0, Math.min(100, (y - T.top) / T.height * 100))
    };
  }
  function b() {
    a.forEach((p) => p.destroy()), a = [], h.querySelectorAll(".ab-ze-zone").forEach((p) => p.remove()), h.querySelectorAll(".ab-ze-panel").forEach((p) => p.remove()), r.forEach((p) => {
      const y = document.createElement("div");
      if (y.className = "ab-ze-zone", p.correct && y.classList.add("ab-ze-zone--correct"), p.id === i && y.classList.add("ab-ze-zone--selected"), y.dataset.zoneId = p.id, y.style.left = `${p.x}%`, y.style.top = `${p.y}%`, y.style.width = `${p.width}%`, y.style.height = `${p.height}%`, p.shape === "polygon" && p.points && p.points.length >= 3) {
        const Z = `clip-${p.id}`;
        y.innerHTML = `<svg class="ab-ze-zone__poly-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs><clipPath id="${Z}"><polygon points="${ru(p.points, p.x, p.y, p.width, p.height)}"/></clipPath></defs>
          <rect x="0" y="0" width="100" height="100" clip-path="url(#${Z})" fill="currentColor"/>
        </svg>`, y.classList.add("ab-ze-zone--poly");
      }
      const T = document.createElement("div");
      T.className = "ab-ze-zone__badge", T.textContent = p.correct ? "✓" : "", p.label && (T.textContent = p.label), y.appendChild(T);
      const D = document.createElement("button");
      D.className = "ab-ze-zone__toggle", D.textContent = p.correct ? "✓ נכון" : "✗ לא נכון", D.title = "סמן כתשובה נכונה / לא נכונה", D.addEventListener("pointerdown", (Z) => Z.stopPropagation()), D.addEventListener("click", (Z) => {
        Z.stopPropagation(), p.correct = !p.correct, H(), b();
      }), y.appendChild(D);
      const I = document.createElement("button");
      if (I.className = "ab-ze-zone__delete", I.textContent = "✕", I.title = "מחק אזור", I.addEventListener("pointerdown", (Z) => Z.stopPropagation()), I.addEventListener("click", (Z) => {
        Z.stopPropagation(), r = r.filter((F) => F.id !== p.id), i === p.id && (i = null), H(), b();
      }), y.appendChild(I), p.shape !== "polygon" && p.id === i)
        for (const Z of ["nw", "ne", "sw", "se"]) {
          const F = document.createElement("div");
          F.className = `ab-ze-zone__handle ab-ze-zone__handle--${Z}`, F.dataset.handle = Z, F.addEventListener("pointerdown", (B) => {
            B.stopPropagation(), B.preventDefault(), m = {
              zoneId: p.id,
              handle: Z,
              origZone: { ...p },
              startX: B.clientX,
              startY: B.clientY
            };
          }), y.appendChild(F);
        }
      if (y.addEventListener("pointerdown", (Z) => {
        if (Z.stopPropagation(), m) return;
        i = p.id, b();
        const { px: F, py: B } = N(Z.clientX, Z.clientY);
        d = { zoneId: p.id, offsetX: F - p.x, offsetY: B - p.y };
      }), h.appendChild(y), p.id === i) {
        const Z = document.createElement("div");
        Z.className = "ab-ze-panel", Z.style.left = `${p.x}%`, Z.style.top = `${p.y + p.height + 1}%`;
        const F = document.createElement("div");
        F.className = "ab-ze-panel__row";
        const B = document.createElement("input");
        if (B.className = "ab-ze-panel__input", B.type = "text", B.dir = "rtl", B.placeholder = "תווית (למשל: חתול)", B.value = p.label || "", B.addEventListener("pointerdown", (X) => X.stopPropagation()), B.addEventListener("input", () => {
          p.label = B.value || void 0, H();
        }), F.appendChild(B), Z.appendChild(F), o) {
          const X = document.createElement("div");
          X.className = "ab-ze-panel__row";
          const ct = document.createElement("span");
          ct.className = "ab-ze-panel__audio-label", ct.textContent = "🎤", X.appendChild(ct);
          const fo = Gn(X, {
            gameId: o,
            voiceKey: `zone-${p.id}`,
            label: `הקלטה לאזור ${p.label || p.id}`
          });
          a.push(fo), Z.appendChild(X);
        }
        Z.addEventListener("pointerdown", (X) => X.stopPropagation()), h.appendChild(Z);
      }
    });
  }
  function E() {
    if (_.innerHTML = "", u.length === 0) return;
    const p = [...u];
    l && p.push(l);
    const y = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    y.setAttribute("points", p.map((T) => `${T.x},${T.y}`).join(" ")), y.setAttribute("fill", "rgba(251,191,36,0.15)"), y.setAttribute("stroke", "#fbbf24"), y.setAttribute("stroke-width", "0.4"), y.setAttribute("stroke-dasharray", "1,0.5"), _.appendChild(y), u.forEach((T, D) => {
      const I = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      I.setAttribute("cx", String(T.x)), I.setAttribute("cy", String(T.y)), I.setAttribute("r", "0.8"), I.setAttribute("fill", D === 0 ? "#22c55e" : "#fbbf24"), I.setAttribute("stroke", "#fff"), I.setAttribute("stroke-width", "0.3"), _.appendChild(I);
    });
  }
  function v(p) {
    u.length > 0 && (u = [], l = null, E()), s = p, h.classList.toggle("ab-ze-overlay--poly-mode", p === "polygon"), k();
  }
  function x() {
    if (!c) return;
    const p = Math.min(c.startX, c.curX), y = Math.min(c.startY, c.curY), T = Math.abs(c.curX - c.startX), D = Math.abs(c.curY - c.startY);
    g.style.left = `${p}%`, g.style.top = `${y}%`, g.style.width = `${T}%`, g.style.height = `${D}%`;
  }
  function z() {
    if (u.length < 3) {
      u = [], l = null, E();
      return;
    }
    const p = [...u], y = ou(p);
    if (y.width > 1 && y.height > 1) {
      const T = {
        id: ln(),
        shape: "polygon",
        ...y,
        points: p,
        correct: !1
      };
      r.push(T), i = T.id, H();
    }
    u = [], l = null, E(), b();
  }
  function $(p) {
    if (p.button !== 0 || p.target.closest(".ab-ze-zone") || p.target.closest(".ab-ze-toolbar") || p.target.closest(".ab-ze-panel")) return;
    if (i = null, s === "polygon") {
      const { px: D, py: I } = N(p.clientX, p.clientY);
      if (u.length >= 3) {
        const Z = u[0];
        if (Math.abs(D - Z.x) < 2 && Math.abs(I - Z.y) < 2) {
          z();
          return;
        }
      }
      u.push({ x: D, y: I }), E(), b();
      return;
    }
    const { px: y, py: T } = N(p.clientX, p.clientY);
    c = { startX: y, startY: T, curX: y, curY: T }, g.hidden = !1, x(), b();
  }
  function w(p) {
    s === "polygon" && u.length >= 3 && (p.preventDefault(), z());
  }
  function A(p) {
    if (s === "polygon" && u.length > 0) {
      const { px: y, py: T } = N(p.clientX, p.clientY);
      l = { x: y, y: T }, E();
    }
    if (c) {
      const { px: y, py: T } = N(p.clientX, p.clientY);
      c.curX = y, c.curY = T, x();
      return;
    }
    if (m) {
      p.preventDefault();
      const y = r.find((B) => B.id === m.zoneId);
      if (!y) return;
      const T = m.origZone, D = h.getBoundingClientRect(), I = (p.clientX - m.startX) / D.width * 100, Z = (p.clientY - m.startY) / D.height * 100, F = m.handle;
      F.includes("e") && (y.width = Math.max(3, T.width + I)), F.includes("w") && (y.x = T.x + I, y.width = Math.max(3, T.width - I)), F.includes("s") && (y.height = Math.max(3, T.height + Z)), F.includes("n") && (y.y = T.y + Z, y.height = Math.max(3, T.height - Z)), b();
      return;
    }
    if (d) {
      p.preventDefault();
      const y = r.find((F) => F.id === d.zoneId);
      if (!y) return;
      const { px: T, py: D } = N(p.clientX, p.clientY), I = Math.max(0, Math.min(100 - y.width, T - d.offsetX)), Z = Math.max(0, Math.min(100 - y.height, D - d.offsetY));
      if (y.shape === "polygon" && y.points) {
        const F = I - y.x, B = Z - y.y;
        y.points = y.points.map((X) => ({ x: X.x + F, y: X.y + B }));
      }
      y.x = I, y.y = Z, b();
    }
  }
  function R() {
    if (c) {
      const p = Math.min(c.startX, c.curX), y = Math.min(c.startY, c.curY), T = Math.abs(c.curX - c.startX), D = Math.abs(c.curY - c.startY);
      if (T > 3 && D > 3) {
        const I = {
          id: ln(),
          shape: "rect",
          x: p,
          y,
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
  function V(p) {
    if (p.key === "Escape" && u.length > 0) {
      u = [], l = null, E();
      return;
    }
    if (p.key === "Enter" && u.length >= 3) {
      z();
      return;
    }
    i && ((p.key === "Delete" || p.key === "Backspace") && (r = r.filter((y) => y.id !== i), i = null, H(), b()), p.key === "Escape" && (i = null, b()));
  }
  return h.addEventListener("pointerdown", $), h.addEventListener("dblclick", w), document.addEventListener("pointermove", A), document.addEventListener("pointerup", R), document.addEventListener("keydown", V), b(), {
    setZones(p) {
      r = structuredClone(p), i = null, b();
    },
    getZones() {
      return structuredClone(r);
    },
    setTool(p) {
      v(p);
    },
    destroy() {
      h.removeEventListener("pointerdown", $), h.removeEventListener("dblclick", w), document.removeEventListener("pointermove", A), document.removeEventListener("pointerup", R), document.removeEventListener("keydown", V), a.forEach((p) => p.destroy()), h.remove();
    }
  };
}
let su = 0;
function au() {
  return `tpl-zone-${Date.now()}-${su++}`;
}
const cu = [
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
function uu(e) {
  return e.zones.map((t) => ({ ...t, id: au() }));
}
function lu(e) {
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
  s.className = "ab-tpl-grid", cu.forEach((u) => {
    const l = document.createElement("button");
    l.className = "ab-tpl-card", l.addEventListener("click", () => {
      e(uu(u)), a();
    });
    const d = document.createElement("div");
    d.className = "ab-tpl-card__preview", u.zones.forEach((g) => {
      const _ = document.createElement("div");
      _.className = "ab-tpl-card__zone", g.correct && _.classList.add("ab-tpl-card__zone--correct"), _.style.left = `${g.x}%`, _.style.top = `${g.y}%`, _.style.width = `${g.width}%`, _.style.height = `${g.height}%`, d.appendChild(_);
    }), l.appendChild(d);
    const m = document.createElement("div");
    m.className = "ab-tpl-card__label", m.innerHTML = `<span class="ab-tpl-card__icon">${u.icon}</span> ${u.nameHe}`, l.appendChild(m);
    const h = document.createElement("div");
    h.className = "ab-tpl-card__desc", h.textContent = u.description, l.appendChild(h), s.appendChild(l);
  }), o.appendChild(s), t.appendChild(o), document.body.appendChild(t);
  function a() {
    t.remove();
  }
  n.addEventListener("click", a), document.addEventListener("keydown", function u(l) {
    l.key === "Escape" && (a(), document.removeEventListener("keydown", u));
  });
}
class du {
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
      this._makeBtn("⬇ ייצוא", "ab-editor-btn--export", () => Vo(this._gameData))
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
    this._overlay = qo(t), this._overlay.show(), this._navigator = er(this._container, this._gameData, {
      onSelectRound: (o) => this._selectRound(o),
      onAddRound: (o) => this._addRound(o),
      onDuplicateRound: (o) => this._duplicateRound(o),
      onMoveRound: (o, r) => this._moveRound(o, r)
    }), this._inspector = Fc(this._container, {
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
      lu((h) => {
        var g;
        this._selectedId && (this._gameData.updateRound(this._selectedId, { zones: h }), this._refreshUndoButtons(), (g = this._zoneEditor) == null || g.setZones(h));
      });
    }), u.appendChild(l);
    const d = document.createElement("button");
    d.className = "ab-editor-btn ab-editor-btn--play", d.textContent = "✓ סיום", d.addEventListener("click", () => this._closeZoneEditor()), u.appendChild(d), r.appendChild(u), n.appendChild(r), document.body.appendChild(n), this._zoneModal = n, c.onload = () => {
      const h = t.zones ?? [];
      this._zoneEditor = iu(a, h, {
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
    Qc(this._gameData.id, this._gameData);
  }
  _save() {
    Uo(this._gameData), this._showToast("✅ נשמר!");
  }
  _showToast(t) {
    const n = document.createElement("div");
    n.className = "ab-editor-toast", n.textContent = t, document.body.appendChild(n), setTimeout(() => n.remove(), 2200);
  }
}
async function Iu(e, t) {
  if (Do(e, t.loadingMessage ?? "טוֹעֵן..."), await ko(t.preloadTexts ?? []), t.onBeforeHide && await t.onBeforeHide() === !1)
    return { shell: null, activeRounds: [], gameData: null, aborted: !0 };
  Fo(e);
  const n = Ho(t.gameId), o = n ? n.rounds : t.defaultRounds ?? [], r = new mo(e, {
    totalRounds: t.totalRounds ?? o.length,
    title: t.title
  });
  let i = null;
  if (t.editor) {
    const s = {
      title: t.editor.title ?? t.title,
      type: t.editor.type ?? "multiple-choice"
    };
    i = Ie.fromRoundsArray(t.gameId, o, s, t.editor.distractors ?? []), new du(e, i, { restartGame: t.editor.restartGame });
  }
  return { shell: r, activeRounds: o, gameData: i, aborted: !1 };
}
function Ou({ hintAfter: e = 2, escalateAfter: t = 4, onHint: n, onEscalate: o } = {}) {
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
const Yn = {
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
function fu(e, t) {
  if (!Number.isFinite(e) || !Number.isFinite(t) || e <= 0 || t <= 0 || t <= e)
    return { vowel: "", confidence: 0 };
  const n = Math.log2(e), o = Math.log2(t), r = [];
  for (const [c, u] of Object.entries(Yn)) {
    const l = n - Math.log2(u.F1), d = o - Math.log2(u.F2);
    r.push({ vowel: c, dist: Math.sqrt(l * l + d * d) });
  }
  r.sort((c, u) => c.dist - u.dist);
  const i = r[0], s = r[1], a = s.dist === 0 ? 1 : Math.max(0, Math.min(1, 1 - i.dist / s.dist));
  return { vowel: i.vowel, confidence: a };
}
function Pu(e, t) {
  return !e || !t ? !1 : It[t] === e;
}
function pu(e, t) {
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
function hu(e, t) {
  if (!e || e.length === 0 || !Number.isFinite(t) || t <= 0)
    return { F1: 0, F2: 0 };
  const n = pu(e, 80), o = Math.min(n.length - 3, Math.floor(3500 / t)), r = [];
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
function Mu() {
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
      const h = m.createMediaStreamSource(d), g = m.createAnalyser();
      g.fftSize = 4096, g.smoothingTimeConstant = 0.2, h.connect(g);
      const _ = m.sampleRate / g.fftSize, C = new Float32Array(g.frequencyBinCount), k = new Float32Array(g.fftSize), N = 0.015, b = [], E = performance.now();
      return new Promise((v) => {
        const x = () => {
          if (c(), b.length < 3) {
            v(a());
            return;
          }
          const $ = b.map((p) => p.F1).sort((p, y) => p - y), w = b.map((p) => p.F2).sort((p, y) => p - y), A = Math.floor(b.length / 2), R = $[A], H = w[A], V = fu(R, H);
          v({ ...V, F1: R, F2: H });
        }, z = () => {
          if (s) {
            c(), v(a());
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
            const { F1: A, F2: R } = hu(C, _);
            A > 0 && R > 0 && R > A && b.push({ F1: A, F2: R });
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
const Kn = 210, Qn = 550, mu = {
  a: { F3: 2700, bandwidths: [90, 110, 170], gains: [1, 0.5, 0.15] },
  e: { F3: 2900, bandwidths: [80, 100, 160], gains: [1, 0.55, 0.2] },
  i: { F3: 3300, bandwidths: [60, 100, 160], gains: [1, 0.6, 0.25] },
  o: { F3: 2600, bandwidths: [80, 90, 150], gains: [1, 0.5, 0.1] },
  u: { F3: 2400, bandwidths: [60, 80, 140], gains: [1, 0.45, 0.1] }
};
function et(e) {
  const t = Yn[e], n = mu[e];
  return !t || !n ? null : {
    formants: [t.F1, t.F2, n.F3],
    bandwidths: [...n.bandwidths],
    gains: [...n.gains]
  };
}
const dn = {
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
function bu(e) {
  return dn[e] ?? dn[""];
}
let xe = null;
function eo() {
  if (typeof window > "u") return null;
  const e = window.AudioContext || /** @type {any} */
  window.webkitAudioContext;
  if (!e) return null;
  if (!xe)
    try {
      xe = new e();
    } catch {
      return null;
    }
  if (xe.state === "suspended")
    try {
      xe.resume();
    } catch {
    }
  return xe;
}
function ju() {
  return typeof window < "u" && !!(window.AudioContext || /** @type {any} */
  window.webkitAudioContext);
}
let Be = null;
function gu(e) {
  if (Be && Be.sampleRate === e.sampleRate) return Be;
  const t = e.sampleRate, n = e.createBuffer(1, t, e.sampleRate), o = n.getChannelData(0);
  for (let r = 0; r < t; r++) o[r] = Math.random() * 2 - 1;
  return Be = n, n;
}
function to(e, t, n) {
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
  i.buffer = gu(e), i.loop = !0;
  const s = e.createBiquadFilter();
  s.type = "bandpass", s.frequency.value = n.noiseHz ?? 2e3, s.Q.value = n.noiseQ ?? 1;
  const a = e.createGain();
  return a.gain.setValueAtTime(0, t), a.gain.linearRampToValueAtTime(o, t + Math.min(0.01, r / 3)), a.gain.linearRampToValueAtTime(1e-4, t + r), i.connect(s), s.connect(a), a.connect(e.destination), i.start(t), i.stop(t + r + 0.02), t + r;
}
function no(e, t, n, o, r, i) {
  const s = o / 1e3, { source: a, filters: c, master: u } = to(e, n, r);
  if (a.frequency.setValueAtTime(r * 1.04, t), a.frequency.linearRampToValueAtTime(r * 0.92, t + s), i) {
    const m = Math.min(0.09, s / 3);
    c.forEach((h, g) => {
      const _ = i[g];
      _ && (h.frequency.setValueAtTime(_, t), h.frequency.exponentialRampToValueAtTime(n.formants[g], t + m));
    });
  }
  const l = 0.04, d = 0.12;
  return u.gain.setValueAtTime(0, t), u.gain.linearRampToValueAtTime(0.5, t + l), u.gain.setValueAtTime(0.5, t + s - d), u.gain.linearRampToValueAtTime(1e-4, t + s), a.start(t), a.stop(t + s + 0.05), t + s;
}
function _u(e, t, n, o) {
  const r = n / 1e3, i = { formants: [250, 1100, 2200], bandwidths: [80, 200, 300], gains: [1, 0.12, 0.05] }, { source: s, master: a } = to(e, i, o);
  return a.gain.setValueAtTime(0, t), a.gain.linearRampToValueAtTime(0.35, t + 0.02), a.gain.setValueAtTime(0.35, t + r - 0.02), a.gain.linearRampToValueAtTime(1e-4, t + r), s.start(t), s.stop(t + r + 0.05), t + r;
}
function oo(e, t) {
  const n = Math.max(0, (t - e.currentTime) * 1e3) + 60;
  return new Promise((o) => setTimeout(o, n));
}
async function vu(e, t = {}) {
  const n = et(e), o = eo();
  if (!n || !o) return !1;
  let r;
  try {
    const i = o.currentTime + 0.03;
    r = no(o, i, n, t.durationMs ?? Qn, t.pitchHz ?? Kn, null);
  } catch {
    return !1;
  }
  return await oo(o, r), !0;
}
async function ro(e, t, n = {}) {
  const o = et(t), r = eo();
  if (!o || !r) return !1;
  const i = bu(e), s = n.pitchHz ?? Kn, a = n.durationMs ?? Qn;
  let c;
  try {
    c = yu(r, i, e, o, a, s);
  } catch {
    return !1;
  }
  return await oo(r, c), !0;
}
function yu(e, t, n, o, r, i) {
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
      s = _u(e, s, t.durationMs, i), a = [300, 1300, 2300];
      break;
    }
    case "liquid": {
      a = n === "r" ? [450, 1300, 1600] : [380, 1e3, 2600];
      break;
    }
    case "glide": {
      const c = et(n === "y" ? "i" : "u");
      a = c ? c.formants : null;
      break;
    }
  }
  return no(e, s, o, r, i, a);
}
const Le = [
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
function io(e) {
  return Le.find((t) => t.letter === e) || null;
}
function wu(e = "regular") {
  return e === "regular" ? Le.filter((t) => !t.isFinal) : e === "final" ? Le.filter((t) => t.isFinal) : Le;
}
function Du(e, t = "regular") {
  const n = wu(t);
  return [...n].sort(() => Math.random() - 0.5).slice(0, Math.min(e, n.length));
}
const so = "sound-bank";
function ao(e) {
  return `letter:${e}`;
}
function co(e) {
  return `nikud:${e}`;
}
function uo(e, t) {
  return `syllable:${e}:${t}`;
}
function ku(e) {
  return `word:${e}`;
}
function Eu() {
  const e = [];
  for (const t of Le)
    e.push({ key: ao(t.letter), label: t.nameNikud, group: "letters" });
  for (const t of oe)
    e.push({ key: co(t.id), label: `${t.nameNikud} (${t.sound})`, group: "nikud" });
  for (const t of Eo)
    for (const n of oe)
      e.push({
        key: uo(t, n.id),
        label: zo(t, n.symbol),
        group: "syllables"
      });
  return e;
}
function Fu(e) {
  const t = Eu().find((o) => o.key === e);
  if (t) return t.label;
  const [, ...n] = e.split(":");
  return n.join(":");
}
function zu() {
  return typeof navigator < "u" && navigator.onLine === !1;
}
async function st(e) {
  try {
    return typeof indexedDB > "u" ? !1 : await ye(so, e);
  } catch {
    return !1;
  }
}
async function at(e) {
  if (zu() && !Su()) return !1;
  try {
    return await e(), he.audioState !== "failed" && he.audioState !== "unsupported";
  } catch {
    return !1;
  }
}
function Su() {
  return typeof speechSynthesis < "u";
}
async function Bu() {
  try {
    return typeof indexedDB > "u" ? [] : await Gc(so);
  } catch {
    return [];
  }
}
async function Uu(e) {
  if (await st(ao(e))) return "bank";
  const t = io(e), n = t ? t.nameNikud : e;
  return await at(() => he.speak(n)) ? "tts" : t && await ro(t.sound, "a", { durationMs: 400 }) ? "synth" : "none";
}
async function Hu(e) {
  if (await st(co(e))) return "bank";
  if (await at(() => he.speakVowel(e))) return "tts";
  const t = It[e];
  return t && await vu(t) ? "synth" : "none";
}
async function Vu(e, t) {
  if (await st(uo(e, t))) return "bank";
  const n = oe.find((i) => i.id === t);
  if (n && await at(() => he.speakNikud(e, n.symbol))) return "tts";
  const o = io(e), r = It[t];
  return r && await ro(o ? o.sound : "", r) ? "synth" : "none";
}
async function qu(e) {
  return await st(ku(e)) ? "bank" : await at(() => he.speak(e)) ? "tts" : "none";
}
function Ju(e, t, n) {
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
function Wu(e, t) {
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
function Gu(e) {
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
      qe.correct(), o(r, "correct"), Ve(t, "bounce");
    },
    /** הצג עידוד — נסה שוב */
    wrong(r = "נַסֵּה שׁוּב") {
      qe.wrong(), o(r, "wrong"), Ve(t, "pulse");
    },
    /** הצג רמז */
    hint(r) {
      o(r, "hint"), Ve(t, "pulse");
    },
    /** הסר את הרכיב */
    destroy() {
      clearTimeout(n), t.remove();
    }
  };
}
function Xu(e, t) {
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
  oe.forEach((u) => {
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
    l.length > 0 && l.length < oe.length ? d.searchParams.set("allowedNikud", l.join(",")) : d.searchParams.delete("allowedNikud"), d.searchParams.delete("excludedNikud"), n.style.display = "none", window.history.replaceState({}, "", d), t && t(e);
  }, document.getElementById("close-settings-btn").onclick = () => {
    n.style.display = "none";
  };
}
function Yu(e) {
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
function $u(e, t, n, o, r) {
  return e.map((i) => {
    const s = o > 0 ? (i.x - t) / o * 100 : 0, a = r > 0 ? (i.y - n) / r * 100 : 0;
    return `${s},${a}`;
  }).join(" ");
}
function Ku(e, t) {
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
    hintAfter: h = 3
  } = t, g = r === "soundboard", _ = document.createElement("div");
  _.className = "ab-zp-wrap";
  const C = document.createElement("img");
  C.className = "ab-zp-image", C.src = n, C.alt = "", C.draggable = !1, _.appendChild(C);
  const k = document.createElement("div");
  k.className = "ab-zp-layer", _.appendChild(k), e.appendChild(_);
  const N = /* @__PURE__ */ new Set();
  let b = 0, E = !1, v = !1;
  async function x($) {
    if (!(!i || E)) {
      E = !0;
      try {
        await ye(i, `zone-${$}`);
      } catch {
      }
      E = !1;
    }
  }
  function z() {
    if (v || h <= 0 || g || b < h) return;
    v = !0;
    const $ = k.querySelectorAll(".ab-zp-zone");
    $.forEach((w, A) => {
      var R;
      (R = o[A]) != null && R.correct && !N.has(o[A].id) && w.classList.add("ab-zp-zone--hint");
    }), setTimeout(() => {
      $.forEach((w) => w.classList.remove("ab-zp-zone--hint")), v = !1, b = 0;
    }, 1500);
  }
  return o.forEach(($) => {
    const w = document.createElement("button");
    if (w.className = "ab-zp-zone", (d || g) && w.classList.add("ab-zp-zone--visible"), g && w.classList.add("ab-zp-zone--soundboard"), w.style.left = `${$.x}%`, w.style.top = `${$.y}%`, w.style.width = `${$.width}%`, w.style.height = `${$.height}%`, w.setAttribute("aria-label", $.label || ($.correct ? "correct zone" : "zone")), $.shape === "polygon" && $.points && $.points.length >= 3) {
      const A = `zp-clip-${$.id}`;
      w.innerHTML = `<svg class="ab-zp-zone__poly-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs><clipPath id="${A}"><polygon points="${$u($.points, $.x, $.y, $.width, $.height)}"/></clipPath></defs>
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
          const A = o.filter((R) => R.correct).length;
          N.size >= A && u && u();
        } else
          w.classList.add("ab-zp-zone--wrong"), b++, c && c($), setTimeout(() => w.classList.remove("ab-zp-zone--wrong"), 600), z();
    }), k.appendChild(w);
  }), m && i && s && setTimeout(() => {
    ye(i, s).catch(() => {
    });
  }, 400), {
    async playInstruction() {
      return i && s ? ye(i, s) : !1;
    },
    async playZoneAudio($) {
      return i ? ye(i, `zone-${$}`) : !1;
    },
    revealCorrect() {
      k.querySelectorAll(".ab-zp-zone").forEach(($, w) => {
        var A;
        (A = o[w]) != null && A.correct && $.classList.add("ab-zp-zone--revealed");
      });
    },
    reset() {
      N.clear(), b = 0, v = !1, k.querySelectorAll(".ab-zp-zone").forEach(($) => {
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
function Qu(e, t, n, o) {
  const r = e.querySelector(".game-header__spacer");
  if (!r) return null;
  const i = document.createElement("button");
  return i.className = "ab-header-btn", i.setAttribute("aria-label", n), i.textContent = t, i.onclick = o, r.innerHTML = "", r.appendChild(i), i;
}
const Nu = "0 0 32 16", lo = {
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
function Cu(e) {
  const t = lo[e];
  return t ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${Nu}" aria-hidden="true" focusable="false">${t}</svg>` : null;
}
const el = Object.freeze(Object.keys(lo));
function tl(e, { size: t = "md" } = {}) {
  const n = document.createElement("div");
  n.className = `ab-nikud-box ab-nikud-box--${t} ab-nikud-box--${e.id}`;
  const o = document.createElement("div");
  o.className = "ab-nikud-box__box";
  const r = document.createElement("div");
  return r.className = "ab-nikud-box__mark", r.innerHTML = Cu(e.id) ?? "", n.appendChild(o), n.appendChild(r), n;
}
function nl(e, t) {
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
  function h(_) {
    g(_), typeof s == "function" && s(_);
  }
  e.querySelectorAll(".ab-app-tab, .ab-app-nav-item").forEach((_) => {
    _.addEventListener("click", () => h(
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
const fn = "alefbet-audio-status-banner";
function xu(e) {
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
function ol(e = typeof document < "u" ? document.body : null, t = {}) {
  const n = t.window || (typeof window < "u" ? window : null);
  if (!e || !n)
    return { destroy() {
    } };
  const o = e.querySelector("#" + fn);
  o && o.parentNode && o.parentNode.removeChild(o);
  const r = e.ownerDocument.createElement("div");
  r.id = fn, r.className = "alefbet-audio-banner", r.setAttribute("role", "status"), r.setAttribute("aria-live", "polite"), r.dir = "rtl", r.hidden = !0;
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
    const h = xu(m);
    if (!h) {
      u();
      return;
    }
    c(), i.textContent = h.message, r.hidden = !1, r.classList.add("is-visible"), r.classList.toggle("is-await", h.kind === "await"), r.classList.toggle("is-unsupported", h.kind === "unsupported"), r.classList.toggle("is-failed", h.kind === "failed"), h.kind, h.kind === "await" ? (r.onclick = () => {
      try {
        e.ownerDocument.body.dispatchEvent(new MouseEvent("pointerdown", { bubbles: !0 }));
      } catch {
      }
      u();
    }, s.hidden = !0) : h.kind === "unsupported" ? (r.onclick = null, s.hidden = !1, s.onclick = (g) => {
      g.stopPropagation(), u();
    }) : h.kind === "failed" && (r.onclick = null, s.hidden = !0, a = setTimeout(() => u(), 6e3));
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
  cu as ACTIVITY_TEMPLATES,
  un as BUILTIN_ROUND_SCHEMAS,
  Zt as BaseRoundSchema,
  Mc as DragMatchRoundSchema,
  po as EventBus,
  Ie as GameData,
  Lu as GameDataSchema,
  du as GameEditor,
  jc as GameMetaSchema,
  mo as GameShell,
  ho as GameState,
  Pc as MultipleChoiceRoundSchema,
  el as NIKUD_GLYPH_IDS,
  It as NIKUD_VOWEL,
  Ic as PointSchema,
  so as SOUND_BANK_ID,
  Yn as VOWEL_TEMPLATES,
  Oc as ZoneSchema,
  Dc as ZoneTapRoundSchema,
  yo as addNikud,
  Ve as animate,
  Iu as bootstrapGame,
  fu as classifyFormants,
  Zu as clearGameData,
  bu as consonantOnsetSpec,
  nl as createAppShell,
  Ko as createDragSource,
  Qo as createDropTarget,
  Gu as createFeedback,
  Ou as createHintTracker,
  hn as createLocalState,
  tl as createNikudBox,
  Ju as createOptionCards,
  Wu as createProgressBar,
  Au as createRoundManager,
  Gn as createVoiceRecordButton,
  Hc as createVoiceRecorder,
  Mu as createVowelDetector,
  Yu as createZone,
  iu as createZoneEditor,
  Ku as createZonePlayer,
  Wc as deleteVoice,
  Vo as exportGameDataAsJSON,
  hu as extractFormantsFromSpectrum,
  uu as generateZonesFromTemplate,
  io as getLetter,
  wu as getLettersByGroup,
  wo as getNikud,
  Ru as hasVoice,
  Le as hebrewLetters,
  Fo as hideLoadingScreen,
  Qu as injectHeaderButton,
  zu as isOffline,
  ju as isSynthSupported,
  Uc as isVoiceRecordingSupported,
  Fu as keyLabel,
  ao as letterKey,
  zo as letterWithNikud,
  Gc as listVoiceKeys,
  Ho as loadGameData,
  Rt as loadVoice,
  Pu as matchNikudVowel,
  ol as mountAudioStatusBanner,
  Eo as nikudBaseLetters,
  Cu as nikudGlyphSvg,
  co as nikudKey,
  oe as nikudList,
  ye as playVoice,
  ko as preloadNikud,
  Du as randomLetters,
  Tu as randomNikud,
  Bu as recordedKeys,
  Uo as saveGameData,
  Jc as saveVoice,
  Rc as schemaToFields,
  Qc as showAudioManager,
  jo as showCompletionScreen,
  Do as showLoadingScreen,
  Xu as showNikudSettingsDialog,
  lu as showTemplatePicker,
  qe as sounds,
  Uu as speakLetter,
  Hu as speakNikudSound,
  Vu as speakSyllable,
  qu as speakWord,
  Eu as standardSoundKeys,
  uo as syllableKey,
  ro as synthesizeSyllable,
  vu as synthesizeVowel,
  he as tts,
  et as vowelFormantSpec,
  ku as wordKey
};
