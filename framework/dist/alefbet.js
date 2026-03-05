class W {
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
class $ {
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
class Q {
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
    }, this.events = new W(), this.state = new $(this.config.totalRounds), this._buildShell();
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
const A = "https://nakdan-u1-0.loadbalancer.dicta.org.il/api", p = /* @__PURE__ */ new Map();
function B(t) {
  var n;
  let e = "";
  for (const a of t)
    if (a.sep)
      e += a.str ?? "";
    else {
      const s = (n = a.nakdan) == null ? void 0 : n.options;
      s != null && s.length ? e += (s[0].w ?? "").replace(/\|/g, "").replace(/\u05BD/g, "") : e += a.str ?? "";
    }
  return e;
}
async function M(t) {
  const e = await fetch(A, {
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
  if (!e.ok) throw new Error(`Nakdan ${e.status}`);
  const n = await e.json(), a = n == null ? void 0 : n.data;
  if (!Array.isArray(a)) throw new Error("Nakdan: invalid response");
  return B(a);
}
async function q(t) {
  if (!(t != null && t.trim())) return t ?? "";
  if (p.has(t)) return p.get(t);
  try {
    const e = await M(t);
    return p.set(t, e), e;
  } catch {
    return p.set(t, t), t;
  }
}
function P(t) {
  return p.get(t) ?? t ?? "";
}
async function Z(t) {
  const e = [...new Set(t.filter((n) => n == null ? void 0 : n.trim()))];
  await Promise.all(e.map((n) => q(n)));
}
let g = [], k = !1, T = !0, L = 0.9;
function D(t) {
  return new Promise((e) => {
    try {
      const a = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(t)}&tl=he&client=tw-ob`, s = new Audio(a);
      s.playbackRate = L, s.onended = e, s.onerror = () => {
        _(t).then(e);
      }, s.play().catch(() => {
        _(t).then(e);
      });
    } catch {
      _(t).then(e);
    }
  });
}
let v = null;
function H() {
  const t = speechSynthesis.getVoices();
  return t.find((e) => e.lang === "he-IL") || t.find((e) => e.lang === "iw-IL") || t.find((e) => e.lang.startsWith("he")) || null;
}
function F() {
  v = H();
}
typeof speechSynthesis < "u" && (speechSynthesis.getVoices().length > 0 ? F() : speechSynthesis.addEventListener("voiceschanged", F, { once: !0 }));
function _(t) {
  return new Promise((e) => {
    if (typeof speechSynthesis > "u") {
      e();
      return;
    }
    const n = new SpeechSynthesisUtterance(t);
    n.lang = "he-IL", n.rate = L, v && (n.voice = v), n.onend = e, n.onerror = e, speechSynthesis.speak(n);
  });
}
function j() {
  if (k || g.length === 0) return;
  const t = g.shift();
  k = !0, (T ? D : _)(t.text).then(() => {
    k = !1, t.resolve(), j();
  });
}
const ee = {
  /**
   * הקרא טקסט עברי
   * משתמש ב-Google Translate TTS לאיכות טובה יותר
   */
  speak(t) {
    const e = P(t);
    return new Promise((n) => {
      g.push({ text: e, resolve: n }), j();
    });
  },
  /** עצור את הדיבור הנוכחי */
  cancel() {
    g.forEach((t) => t.resolve()), g = [], k = !1, typeof speechSynthesis < "u" && speechSynthesis.cancel();
  },
  get available() {
    return !0;
  },
  /** הגדר מהירות דיבור (0.5–2.0) */
  setRate(t) {
    L = Math.max(0.5, Math.min(2, t));
  },
  /** השתמש ב-Google Translate TTS (ברירת מחדל) או בדפדפן */
  useGoogle(t = !0) {
    T = t;
  }
};
let h = null;
function U() {
  if (!h)
    try {
      h = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      return null;
    }
  return h.state === "suspended" && h.resume(), h;
}
function m(t, e, n = "sine", a = 0.3) {
  const s = U();
  if (s)
    try {
      const r = s.createOscillator(), o = s.createGain();
      r.connect(o), o.connect(s.destination), r.type = n, r.frequency.setValueAtTime(t, s.currentTime), o.gain.setValueAtTime(a, s.currentTime), o.gain.exponentialRampToValueAtTime(1e-3, s.currentTime + e), r.start(s.currentTime), r.stop(s.currentTime + e + 0.05);
    } catch {
    }
}
const N = {
  /** צליל תשובה נכונה */
  correct() {
    m(523.25, 0.15), setTimeout(() => m(659.25, 0.2), 120), setTimeout(() => m(783.99, 0.3), 240);
  },
  /** צליל עידוד עדין — נסה שוב */
  wrong() {
    m(350, 0.15, "triangle", 0.12);
  },
  /** צליל עידוד - סיום מוצלח */
  cheer() {
    [523.25, 587.33, 659.25, 698.46, 783.99, 1046.5].forEach((e, n) => setTimeout(() => m(e, 0.2), n * 90));
  },
  /** קליק עדין */
  click() {
    m(900, 0.04, "sine", 0.12);
  }
}, X = {
  kamatz: "ah",
  patah: "ah",
  tzere: "eh",
  segol: "eh",
  hiriq: "ee",
  holam: "oh",
  kubbutz: "oo",
  shva: "shva"
}, I = {
  ah: [/[אה]/, /^א$/, /אא/, /הא/],
  eh: [/[אה]/, /^א$/, /אא/, /הא/, /אה/],
  ee: [/[אי]/, /^י$/, /אי/, /הי/],
  oh: [/[או]/, /^[או]$/, /או/, /הו/],
  oo: [/[או]/, /^[או]$/, /או/, /הו/, /אוּ/],
  shva: [/[אה]/, /^א$/, /^$/, /אה/]
};
function te() {
  const t = typeof window < "u" ? window.SpeechRecognition || window.webkitSpeechRecognition : null, e = !!t;
  let n = null;
  return {
    available: e,
    listen(a = 4e3) {
      return e ? new Promise((s) => {
        n = new t(), n.lang = "he-IL", n.continuous = !1, n.interimResults = !1, n.maxAlternatives = 3;
        let r = !1;
        const o = (l, c) => {
          r || (r = !0, n = null, s({ text: l.trim(), confidence: c }));
        };
        n.onresult = (l) => {
          const c = l.results[0];
          c ? o(c[0].transcript, c[0].confidence) : o("", 0);
        }, n.onerror = () => o("", 0), n.onnomatch = () => o("", 0);
        const i = setTimeout(() => {
          try {
            n == null || n.stop();
          } catch {
          }
          o("", 0);
        }, a);
        n.onend = () => {
          clearTimeout(i), o("", 0);
        };
        try {
          n.start();
        } catch {
          o("", 0);
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
function ne(t, e) {
  if (!t || !e) return !1;
  const n = X[e];
  if (!n) return !1;
  const a = I[n];
  if (!a) return !1;
  const s = t.replace(/[\s.,!?]/g, "");
  return s.length ? a.some((r) => r.test(s)) : !1;
}
const b = [
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
function se(t) {
  return b.find((e) => e.letter === t) || null;
}
function z(t = "regular") {
  return t === "regular" ? b.filter((e) => !e.isFinal) : t === "final" ? b.filter((e) => e.isFinal) : b;
}
function ae(t, e = "regular") {
  const n = z(e);
  return [...n].sort(() => Math.random() - 0.5).slice(0, Math.min(t, n.length));
}
const R = [
  { id: "kamatz", name: "קָמָץ", nameNikud: "קָמָץ", symbol: "ָ", sound: "אָ", color: "#FF6B6B", textColor: "#fff" },
  { id: "patah", name: "פֶּתַח", nameNikud: "פָּתַח", symbol: "ַ", sound: "אָ", color: "#FF8C42", textColor: "#fff" },
  { id: "hiriq", name: "חִירִיק", nameNikud: "חִירִיק", symbol: "ִ", sound: "אִי", color: "#4ECDC4", textColor: "#fff" },
  { id: "tzere", name: "צָרָה", nameNikud: "צֵרֶה", symbol: "ֵ", sound: "אֶ", color: "#45B7D1", textColor: "#fff" },
  { id: "segol", name: "סָגֹול", nameNikud: "סְגוֹל", symbol: "ֶ", sound: "אֶ", color: "#9B59B6", textColor: "#fff" },
  { id: "holam", name: "חוֹלֵם", nameNikud: "חוֹלָם", symbol: "ֹ", sound: "אֹ", color: "#2ECC71", textColor: "#fff" },
  { id: "kubbutz", name: "קֻובּוּץ", nameNikud: "קֻבּוּץ", symbol: "ֻ", sound: "אֻ", color: "#F39C12", textColor: "#fff" },
  { id: "shva", name: "שָׁוְוא", nameNikud: "שְׁוָא", symbol: "ְ", sound: "אְ", color: "#95A5A6", textColor: "#fff" }
], re = ["א", "ב", "ג", "ד", "מ", "נ", "ל", "ר", "ש", "ת", "פ", "ק"];
function oe(t, e) {
  return t + e;
}
function ie(t) {
  let e = [...R];
  if (typeof window < "u" && window.location && window.location.search) {
    const a = new URLSearchParams(window.location.search), s = a.get("allowedNikud");
    if (s) {
      const o = s.split(",").map((i) => i.trim());
      e = e.filter(
        (i) => o.includes(i.id) || o.includes(i.name) || o.includes(i.nameNikud)
      );
    }
    const r = a.get("excludedNikud");
    if (r) {
      const o = r.split(",").map((i) => i.trim());
      e = e.filter(
        (i) => !o.includes(i.id) && !o.includes(i.name) && !o.includes(i.nameNikud)
      );
    }
  }
  e.length === 0 && (e = [...R]);
  let n = [...e];
  for (; n.length < t; )
    n.push(...e);
  return n.sort(() => Math.random() - 0.5).slice(0, t);
}
function le(t, e, n) {
  t.innerHTML = "";
  const a = document.createElement("div");
  a.className = "option-cards-grid";
  const s = e.map((r) => {
    const o = document.createElement("button");
    return o.className = "option-card", o.dataset.id = r.id, o.innerHTML = `
      <span class="option-card__emoji">${r.emoji || ""}</span>
      <span class="option-card__text">${r.text}</span>
    `, o.addEventListener("click", () => {
      o.disabled || n(r);
    }), a.appendChild(o), { el: o, option: r };
  });
  return t.appendChild(a), {
    /** הַדָּגֵשׁ כַּרְטִיס לְפִי סוּג: 'correct' | 'wrong' | 'hint' */
    highlight(r, o) {
      s.forEach(({ el: i, option: l }) => {
        l.id === r && i.classList.add(`option-card--${o}`);
      });
    },
    /** נטרל את כל הכרטיסים */
    disable() {
      s.forEach(({ el: r }) => {
        r.disabled = !0;
      });
    },
    /** אפס את מצב הכרטיסים */
    reset() {
      s.forEach(({ el: r }) => {
        r.className = "option-card", r.disabled = !1;
      });
    },
    /** הסר את הרכיב */
    destroy() {
      t.innerHTML = "";
    }
  };
}
function ce(t, e) {
  const n = document.createElement("div");
  n.className = "progress-bar", n.setAttribute("role", "progressbar"), n.setAttribute("aria-valuemin", "0"), n.setAttribute("aria-valuemax", String(e)), n.innerHTML = `
    <div class="progress-bar__track">
      <div class="progress-bar__fill" style="width: 0%"></div>
    </div>
    <span class="progress-bar__label">0 / ${e}</span>
  `, t.appendChild(n);
  const a = n.querySelector(".progress-bar__fill"), s = n.querySelector(".progress-bar__label");
  return {
    /** עדכן את ההתקדמות */
    update(r) {
      const o = Math.round(r / e * 100);
      a.style.width = `${o}%`, s.textContent = `${r} / ${e}`, n.setAttribute("aria-valuenow", String(r));
    },
    /** הסר את הרכיב */
    destroy() {
      n.remove();
    }
  };
}
const C = {
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
}, O = {
  shake: 420,
  bounce: 480,
  pulse: 600,
  fadeIn: 320,
  confetti: 700
};
function y(t, e) {
  !t || !C[e] || t.animate(C[e], {
    duration: O[e] || 400,
    easing: "ease-in-out",
    fill: "none"
  });
}
function de(t) {
  const e = document.createElement("div");
  e.className = "feedback-message", e.setAttribute("aria-live", "polite"), e.setAttribute("role", "status"), t.appendChild(e);
  let n = null;
  function a(s, r, o = 1800) {
    clearTimeout(n), e.textContent = s, e.className = `feedback-message feedback-message--${r}`, n = setTimeout(() => {
      e.textContent = "", e.className = "feedback-message";
    }, o);
  }
  return {
    /** הצג משוב חיובי */
    correct(s = "!כָּל הַכָּבוֹד") {
      N.correct(), a(s, "correct"), y(e, "bounce");
    },
    /** הצג עידוד — נסה שוב */
    wrong(s = "נַסֵּה שׁוּב") {
      N.wrong(), a(s, "wrong"), y(e, "pulse");
    },
    /** הצג רמז */
    hint(s) {
      a(s, "hint"), y(e, "pulse");
    },
    /** הסר את הרכיב */
    destroy() {
      clearTimeout(n), e.remove();
    }
  };
}
function ue(t, e, n, a) {
  N.cheer();
  const s = e / n, r = s >= 0.8 ? 3 : s >= 0.5 ? 2 : 1, o = "⭐".repeat(r) + "☆".repeat(3 - r), i = document.createElement("div");
  i.className = "completion-screen", i.innerHTML = `
    <div class="completion-screen__content">
      <div class="completion-screen__stars" aria-label="${r} כּוֹכָבִים">${o}</div>
      <h2 class="completion-screen__title">!כָּל הַכָּבוֹד</h2>
      <p class="completion-screen__score">נִיקּוּד: ${e} מִתּוֹךְ ${n}</p>
      <button class="completion-screen__replay btn btn--primary">שַׂחֵק שׁוּב</button>
    </div>
  `, i.querySelector(".completion-screen__replay").addEventListener("click", () => {
    i.remove(), a();
  }), t.innerHTML = "", t.appendChild(i), y(i.querySelector(".completion-screen__content"), "fadeIn");
}
let f = null, d = null, x = 0, S = 0;
const w = /* @__PURE__ */ new Map();
function E(t, e) {
  var n;
  return ((n = document.elementFromPoint(t, e)) == null ? void 0 : n.closest('[data-drop-target="true"]')) || null;
}
function V(t, e, n) {
  const a = t.getBoundingClientRect();
  x = a.width / 2, S = a.height / 2, d = t.cloneNode(!0), Object.assign(d.style, {
    position: "fixed",
    left: `${e - x}px`,
    top: `${n - S}px`,
    width: `${a.width}px`,
    height: `${a.height}px`,
    pointerEvents: "none",
    // keeps it out of elementFromPoint + hit-testing
    zIndex: "9999",
    opacity: "0.85",
    transform: "scale(1.12)",
    cursor: "grabbing",
    margin: "0"
  }), document.body.appendChild(d);
}
function G(t, e) {
  d && (d.style.left = `${t - x}px`, d.style.top = `${e - S}px`);
}
function Y() {
  d == null || d.remove(), d = null;
}
let u = null;
function K(t) {
  u !== t && (u == null || u.classList.remove("drop-target--hover"), u = t, t == null || t.classList.add("drop-target--hover"));
}
function J() {
  u == null || u.classList.remove("drop-target--hover"), u = null;
}
function me(t, e) {
  t.classList.add("drag-source");
  let n = null, a = null, s = null;
  function r() {
    n && (t.removeEventListener("pointermove", n), t.removeEventListener("pointerup", a), t.removeEventListener("pointercancel", s), n = a = s = null), J(), Y(), t.classList.remove("drag-source--dragging"), f = null;
  }
  function o(i) {
    i.button !== void 0 && i.button !== 0 || (i.preventDefault(), f && r(), f = { el: t, data: e }, t.classList.add("drag-source--dragging"), V(t, i.clientX, i.clientY), t.setPointerCapture(i.pointerId), n = (l) => {
      G(l.clientX, l.clientY), K(E(l.clientX, l.clientY));
    }, a = (l) => {
      const c = E(l.clientX, l.clientY);
      r(), c && w.has(c) && w.get(c).onDrop({ data: e, sourceEl: t, targetEl: c });
    }, s = () => r(), t.addEventListener("pointermove", n), t.addEventListener("pointerup", a), t.addEventListener("pointercancel", s));
  }
  return t.addEventListener("pointerdown", o), {
    destroy() {
      t.removeEventListener("pointerdown", o), (f == null ? void 0 : f.el) === t && r(), t.classList.remove("drag-source");
    }
  };
}
function fe(t, e) {
  return t.setAttribute("data-drop-target", "true"), t.classList.add("drop-target--active"), w.set(t, { onDrop: e }), {
    destroy() {
      t.removeAttribute("data-drop-target"), t.classList.remove("drop-target--active", "drop-target--hover"), w.delete(t);
    }
  };
}
export {
  W as EventBus,
  Q as GameShell,
  $ as GameState,
  q as addNikud,
  y as animate,
  me as createDragSource,
  fe as createDropTarget,
  de as createFeedback,
  le as createOptionCards,
  ce as createProgressBar,
  te as createSpeechListener,
  se as getLetter,
  z as getLettersByGroup,
  P as getNikud,
  b as hebrewLetters,
  oe as letterWithNikud,
  ne as matchNikudSound,
  re as nikudBaseLetters,
  R as nikudList,
  Z as preloadNikud,
  ae as randomLetters,
  ie as randomNikud,
  ue as showCompletionScreen,
  N as sounds,
  ee as tts
};
