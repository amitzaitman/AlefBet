import { u as C } from "./common-BqHHFCxq.js";
const g = [
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
function H(e) {
  return g.find((n) => n.letter === e) || null;
}
function P(e = "regular") {
  return e === "regular" ? g.filter((n) => !n.isFinal) : e === "final" ? g.filter((n) => n.isFinal) : g;
}
function q(e, n = "regular") {
  const t = P(n);
  return [...t].sort(() => Math.random() - 0.5).slice(0, Math.min(e, t.length));
}
const N = [
  { id: "kamatz", name: "קָמָץ", nameNikud: "קָמָץ", symbol: "ָ", sound: "אָה", color: "#C9442C", textColor: "#fff" },
  { id: "patah", name: "פָּתַח", nameNikud: "פָּתַח", symbol: "ַ", sound: "אָה", color: "#C58119", textColor: "#fff" },
  { id: "hiriq", name: "חִירִיק", nameNikud: "חִירִיק", symbol: "ִ", sound: "אִי", color: "#2A7B71", textColor: "#fff" },
  { id: "tzere", name: "צֵרֶה", nameNikud: "צֵרֶה", symbol: "ֵ", sound: "אֶה", color: "#4A6B8C", textColor: "#fff" },
  { id: "segol", name: "סְגוֹל", nameNikud: "סְגוֹל", symbol: "ֶ", sound: "אֶה", color: "#783952", textColor: "#fff" },
  { id: "holam", name: "חוֹלָם", nameNikud: "חוֹלָם", symbol: "ֹ", sound: "אוֹ", color: "#5F7A42", textColor: "#fff" },
  { id: "kubbutz", name: "קֻבּוּץ", nameNikud: "קֻבּוּץ", symbol: "ֻ", sound: "אוּ", color: "#6B4A8A", textColor: "#fff" }
], D = g.filter((e) => !e.isFinal).map((e) => e.letter);
function G(e, n) {
  return e + n;
}
function Q(e) {
  let n = [...N];
  if (typeof window < "u" && window.location && window.location.search) {
    const i = new URLSearchParams(window.location.search), o = i.get("allowedNikud");
    if (o) {
      const a = o.split(",").map((r) => r.trim());
      n = n.filter(
        (r) => a.includes(r.id) || a.includes(r.name) || a.includes(r.nameNikud)
      );
    }
    const s = i.get("excludedNikud");
    if (s) {
      const a = s.split(",").map((r) => r.trim());
      n = n.filter(
        (r) => !a.includes(r.id) && !a.includes(r.name) && !a.includes(r.nameNikud)
      );
    }
  }
  n.length === 0 && (n = [...N]);
  let t = [...n];
  for (; t.length < e; )
    t.push(...n);
  return t.sort(() => Math.random() - 0.5).slice(0, e);
}
const B = 2e3;
let d = [], k = !1, p = 0.9, E = typeof localStorage < "u" && parseFloat(localStorage.getItem("alefbet.nikudRate")) || 0.5, S = !1, w = null, m = null, f = null, j = null, v = !1, l = "idle";
function b() {
  return typeof speechSynthesis < "u";
}
function u(e, n, t = !1) {
  if (l === e && !t) return;
  const i = l;
  if (l = e, typeof window < "u" && typeof window.dispatchEvent == "function") {
    const o = { state: e, previousState: i };
    n && (o.reason = n), window.dispatchEvent(new CustomEvent("alefbet:tts-state", { detail: o }));
  }
}
function R() {
  b() ? l = "idle" : u("unsupported", "no-speech-synthesis");
}
R();
function _(e, n) {
  j = String(n || "unknown"), console.warn("[tts] browser TTS failed", { text: e, reason: n }), typeof window < "u" && typeof window.dispatchEvent == "function" && window.dispatchEvent(new CustomEvent("alefbet:tts-error", {
    detail: { provider: "browser", text: e, sentText: e, reason: n }
  }));
}
function T(e) {
  const n = String(e).toLowerCase();
  return n.includes("not-allowed") || n.includes("notallowed") || n.includes("didn't interact") || n.includes("user gesture");
}
function A() {
  var e;
  return typeof window > "u" || typeof document > "u" ? Promise.resolve() : S || (e = document.userActivation) != null && e.hasBeenActive ? (S = !0, Promise.resolve()) : w || (w = new Promise((n) => {
    const t = () => {
      S = !0, window.removeEventListener("pointerdown", t, !0), window.removeEventListener("keydown", t, !0), window.removeEventListener("touchstart", t, !0), n();
    };
    window.addEventListener("pointerdown", t, { once: !0, capture: !0 }), window.addEventListener("keydown", t, { once: !0, capture: !0 }), window.addEventListener("touchstart", t, { once: !0, capture: !0 });
  }).finally(() => {
    w = null;
  }), w);
}
let c = null, y = null, F = !1, W = !1;
const I = ["carmit", "hila", "female"];
function M(e) {
  const n = (e.name || "").toLowerCase();
  return I.some((t) => n.includes(t));
}
function x() {
  if (typeof speechSynthesis > "u") return null;
  const n = speechSynthesis.getVoices().filter(
    (s) => s.lang === "he-IL" || s.lang === "iw-IL" || (s.lang || "").startsWith("he")
  );
  if (n.length === 0) return null;
  const i = typeof navigator < "u" && navigator.onLine === !1 && n.filter((s) => s.localService !== !1) || n, o = i.length > 0 ? i : n;
  return o.find(M) || o[0];
}
function U() {
  return typeof speechSynthesis > "u" ? Promise.resolve() : (c = x(), c ? (F = !0, Promise.resolve()) : F ? Promise.resolve() : y || (y = new Promise((e) => {
    let n = !1;
    const t = () => {
      n || (n = !0, F = !0, c = x(), typeof speechSynthesis < "u" && typeof speechSynthesis.removeEventListener == "function" && speechSynthesis.removeEventListener("voiceschanged", i), clearTimeout(o), e());
    }, i = () => {
      c = x(), c && t();
    };
    typeof speechSynthesis.addEventListener == "function" && speechSynthesis.addEventListener("voiceschanged", i);
    const o = setTimeout(() => {
      W || (W = !0, _("", "voice-load-timeout")), t();
    }, B);
  }).finally(() => {
    y = null;
  }), y));
}
function V(e) {
  return 5e3 + ((e == null ? void 0 : e.length) ?? 0) * 200;
}
function L(e) {
  return new Promise((n, t) => {
    if (typeof SpeechSynthesisUtterance > "u") {
      t(new Error("SpeechSynthesisUtterance unavailable"));
      return;
    }
    try {
      const i = new SpeechSynthesisUtterance(e);
      i.lang = "he-IL", i.rate = p, c && (i.voice = c), f = i;
      let o = !1;
      const s = setTimeout(() => {
        if (!o) {
          o = !0, f === i && (f = null);
          try {
            speechSynthesis.cancel();
          } catch {
          }
          t(new Error("utterance-timeout"));
        }
      }, V(e));
      i.onend = () => {
        o || (o = !0, clearTimeout(s), f === i && (f = null), n());
      }, i.onerror = (a) => {
        o || (o = !0, clearTimeout(s), f === i && (f = null), t(new Error(String(a && a.error || "speech-error"))));
      }, speechSynthesis.speak(i);
    } catch (i) {
      t(i instanceof Error ? i : new Error(String(i)));
    }
  });
}
async function O(e) {
  if (typeof speechSynthesis > "u")
    return { ok: !1, reason: "speechSynthesis unavailable" };
  await U();
  try {
    return await L(e), v = !1, { ok: !0 };
  } catch (n) {
    const t = (n == null ? void 0 : n.message) || "speech-error";
    if (T(t)) {
      v || (v = !0, u("awaiting-interaction", "autoplay-blocked")), await A(), v = !1;
      try {
        return await L(e), { ok: !0 };
      } catch (i) {
        const o = (i == null ? void 0 : i.message) || "speech-error";
        return _(e, o), { ok: !1, reason: o };
      }
    }
    return _(e, t), { ok: !1, reason: t };
  }
}
function h() {
  if (k || d.length === 0) return;
  const e = d.shift();
  k = !0, m = e;
  const n = p, t = typeof e.rate == "number";
  t && (p = e.rate), O(e.text).then((i) => {
    t && (p = n), k = !1;
    const o = m === e;
    if (m = null, !o) {
      h();
      return;
    }
    i.ok ? l !== "unsupported" && u("ready") : b() ? u("failed", i.reason, !0) : u("unsupported", i.reason || "no-provider", !0), e.resolve(), h();
  }).catch((i) => {
    t && (p = n), k = !1, m = null, u("failed", (i == null ? void 0 : i.message) || "unknown"), e.resolve(), h();
  });
}
const J = {
  /**
   * הקרא טקסט עברי. ה-promise תמיד נפתר (גם בכשל) כדי שמשחקים לא יתקעו.
   * @param {string} text
   * @returns {Promise<void>}
   */
  speak(e) {
    return new Promise((n) => {
      d.push({ text: e, resolve: n }), h();
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
    if (m) {
      try {
        m.resolve();
      } catch {
      }
      m = null;
    }
    if (d.forEach((e) => {
      try {
        e.resolve();
      } catch {
      }
    }), d = [], k = !1, f && (f = null), typeof speechSynthesis < "u" && typeof speechSynthesis.cancel == "function")
      try {
        speechSynthesis.cancel();
      } catch {
      }
    u("idle", "cancelled");
  },
  /**
   * האם יש יכולת קול מקומית במכשיר.
   */
  get available() {
    return l !== "unsupported" && b();
  },
  /** המצב הנוכחי של מנוע ה-TTS. */
  get audioState() {
    return l;
  },
  /** Alias for audioState — some callers use `state`. */
  get state() {
    return l;
  },
  /** השגיאה האחרונה שדווחה או null אם לא הייתה. */
  get lastError() {
    return j;
  },
  /**
   * משחרר ידנית את מנוע הקול אחרי gesture ידוע (כפתור התחל וכו').
   * משחקים יקראו לזה במקום להמתין ל-autoplay block.
   * @returns {Promise<void>}
   */
  unlock() {
    if (S = !0, v = !1, C().catch(() => {
    }), typeof speechSynthesis < "u" && typeof SpeechSynthesisUtterance < "u")
      try {
        const e = new SpeechSynthesisUtterance("");
        e.volume = 0, speechSynthesis.speak(e), speechSynthesis.cancel();
      } catch {
      }
    return l === "awaiting-interaction" && u("ready", "unlocked"), Promise.resolve();
  },
  /**
   * רושם handler לאירועי `alefbet:tts-state`. מחזיר פונקציית unsubscribe.
   * @param {(detail: { state: string, previousState: string, reason?: string }) => void} handler
   * @returns {() => void}
   */
  onStateChange(e) {
    if (typeof window > "u") return () => {
    };
    const n = (t) => e(
      /** @type {CustomEvent} */
      t.detail
    );
    return window.addEventListener("alefbet:tts-state", n), () => window.removeEventListener("alefbet:tts-state", n);
  },
  /**
   * רושם handler לאירועי `alefbet:tts-error`. מחזיר פונקציית unsubscribe.
   * @param {(detail: { provider: string, text: string, sentText: string, reason: string }) => void} handler
   * @returns {() => void}
   */
  onError(e) {
    if (typeof window > "u") return () => {
    };
    const n = (t) => e(
      /** @type {CustomEvent} */
      t.detail
    );
    return window.addEventListener("alefbet:tts-error", n), () => window.removeEventListener("alefbet:tts-error", n);
  },
  /**
   * סריקת יכולת מחודשת. מחזירה את הערך של `tts.available`. שימושית לבדיקות.
   */
  probe() {
    return b() ? l === "unsupported" && u("idle", "recovered") : u("unsupported", "no-speech-synthesis"), this.available;
  },
  /**
   * הגדר מהירות דיבור (0.5-2.0).
   * @param {number} rate
   */
  setRate(e) {
    p = Math.max(0.5, Math.min(2, e));
  },
  /**
   * הגדר מהירות דיבור להדגשת ניקוד.
   * @param {{ rate?: number }} opts - rate: מהירות הדגשה (ברירת מחדל 0.5).
   */
  setNikudEmphasis({ rate: e } = {}) {
    e != null && (E = Math.max(0.3, Math.min(1.5, e)));
  },
  /**
   * הקרא אות עם ניקוד בשני שלבים: קודם את ההברה בקצב טבעי כדי שהעיצור יהיה קצר,
   * ואז את צליל התנועה לבד בקצב האיטי שמיועד לניקוד - כך הילד שומע
   * "מ-אההההה" במקום "ממממ-אה" שמתקבל מהאטה אחידה של ההברה כולה.
   * @param {string} letter - האות (למשל 'ב').
   * @param {string} nikudSymbol - סמל הניקוד (למשל U+05B7).
   */
  speakNikud(e, n) {
    const t = e + n, i = N.find((o) => o.symbol === n);
    return new Promise((o) => {
      i && i.sound ? (d.push({ text: t, resolve: () => {
      } }), d.push({
        text: i.sound,
        rate: E,
        resolve: () => o(void 0)
      })) : d.push({ text: t, resolve: () => o(void 0) }), h();
    });
  },
  /**
   * הקרא את צליל התנועה של הניקוד ("אָה", "אוֹ" וכו'),
   * כדי להדגים לילד מה להגות.
   * @param {string} nikudId - מזהה ניקוד מתוך nikudList (למשל 'kamatz').
   */
  speakVowel(e) {
    const n = N.find((t) => t.id === e);
    return !n || !n.sound ? Promise.resolve() : new Promise((t) => {
      d.push({
        text: n.sound,
        rate: E,
        resolve: () => t(void 0)
      }), h();
    });
  }
};
export {
  D as a,
  P as b,
  Q as c,
  H as g,
  g as h,
  G as l,
  N as n,
  q as r,
  J as t
};
