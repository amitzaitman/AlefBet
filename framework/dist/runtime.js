import { p as j, g as C, e as z } from "./common-BqHHFCxq.js";
import { a as ke, b as ge, c as Me, d as Se, f as Ve, h as Ae, i as Ee, j as Le, k as Ne, l as Re, m as _e, r as ze, n as Fe, o as Be, s as He, q as Te, t as Pe } from "./common-BqHHFCxq.js";
import { g as F, n as b, t as m, h as U, a as G, l as I } from "./tts-Bt8lOa9K.js";
import { b as Oe, r as xe, c as De } from "./tts-Bt8lOa9K.js";
const K = "alefbet-voices", f = "recordings", W = 1;
let p = null;
function w() {
  return p || (p = new Promise((t, e) => {
    const n = indexedDB.open(K, W);
    n.onupgradeneeded = () => {
      n.result.createObjectStore(f);
    }, n.onsuccess = () => t(n.result), n.onerror = () => {
      p = null, e(n.error);
    };
  }), p);
}
function S(t, e) {
  return `${t}/${e}`;
}
async function ue(t, e, n) {
  const r = await w();
  return new Promise((s, i) => {
    const o = r.transaction(f, "readwrite");
    o.objectStore(f).put(n, S(t, e)), o.oncomplete = s, o.onerror = (a) => i(a.target.error);
  });
}
async function Z(t, e) {
  const n = await w();
  return new Promise((r, s) => {
    const o = n.transaction(f, "readonly").objectStore(f).get(S(t, e));
    o.onsuccess = () => r(o.result ?? null), o.onerror = (a) => s(a.target.error);
  });
}
async function de(t, e) {
  const n = await w();
  return new Promise((r, s) => {
    const i = n.transaction(f, "readwrite");
    i.objectStore(f).delete(S(t, e)), i.oncomplete = r, i.onerror = (o) => s(o.target.error);
  });
}
async function X(t) {
  const e = await w();
  return new Promise((n, r) => {
    const i = e.transaction(f, "readonly").objectStore(f).getAllKeys();
    i.onsuccess = () => {
      const o = `${t}/`;
      n(
        (i.result || []).filter((a) => a.startsWith(o)).map((a) => a.slice(o.length))
      );
    }, i.onerror = (o) => r(o.target.error);
  });
}
async function R(t, e, { signal: n } = {}) {
  if (n != null && n.aborted) return !1;
  let r;
  try {
    r = await Z(t, e);
  } catch {
    return !1;
  }
  return !r || n != null && n.aborted ? !1 : await j(r, { signal: n }) ? !0 : n != null && n.aborted ? !1 : new Promise((s) => {
    const i = URL.createObjectURL(r), o = new Audio(i);
    let a = !1;
    const c = (d) => {
      a || (a = !0, n == null || n.removeEventListener("abort", u), o.onended = null, o.onerror = null, o.pause(), URL.revokeObjectURL(i), s(d));
    }, u = () => c(!1);
    n == null || n.addEventListener("abort", u, { once: !0 }), o.onended = () => c(!0), o.onerror = () => c(!1), o.play().catch(() => c(!1));
  });
}
const J = {
  a: { F1: 850, F2: 1400 },
  e: { F1: 550, F2: 2100 },
  i: { F1: 350, F2: 2700 },
  o: { F1: 550, F2: 1e3 },
  u: { F1: 350, F2: 850 }
}, B = {
  kamatz: "a",
  patah: "a",
  tzere: "e",
  segol: "e",
  hiriq: "i",
  holam: "o",
  kubbutz: "u"
}, H = 210, T = 550, Y = {
  a: { F3: 2700, bandwidths: [90, 110, 170], gains: [1, 0.5, 0.15] },
  e: { F3: 2900, bandwidths: [80, 100, 160], gains: [1, 0.55, 0.2] },
  i: { F3: 3300, bandwidths: [60, 100, 160], gains: [1, 0.6, 0.25] },
  o: { F3: 2600, bandwidths: [80, 90, 150], gains: [1, 0.5, 0.1] },
  u: { F3: 2400, bandwidths: [60, 80, 140], gains: [1, 0.45, 0.1] }
};
function v(t) {
  const e = J[t], n = Y[t];
  return !e || !n ? null : {
    formants: [e.F1, e.F2, n.F3],
    bandwidths: [...n.bandwidths],
    gains: [...n.gains]
  };
}
const _ = {
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
function ee(t) {
  return _[t] ?? _[""];
}
function le() {
  return C() !== null;
}
let h = null;
function te(t) {
  if (h && h.sampleRate === t.sampleRate) return h;
  const e = t.sampleRate, n = t.createBuffer(1, e, t.sampleRate), r = n.getChannelData(0);
  for (let s = 0; s < e; s++) r[s] = Math.random() * 2 - 1;
  return h = n, n;
}
function P(t, e, n, r = t.destination) {
  const s = t.createOscillator();
  s.type = "sawtooth", s.frequency.value = n;
  const i = t.createGain();
  i.gain.value = 0;
  const o = e.formants.map((a, c) => {
    const u = t.createBiquadFilter();
    u.type = "bandpass", u.frequency.value = a, u.Q.value = a / e.bandwidths[c];
    const d = t.createGain();
    return d.gain.value = e.gains[c], s.connect(u), u.connect(d), d.connect(i), u;
  });
  return i.connect(r), { source: s, filters: o, master: i };
}
function k(t, e, n, r, s = t.destination) {
  const i = n.durationMs / 1e3, o = t.createBufferSource();
  o.buffer = te(t), o.loop = !0;
  const a = t.createBiquadFilter();
  a.type = "bandpass", a.frequency.value = n.noiseHz ?? 2e3, a.Q.value = n.noiseQ ?? 1;
  const c = t.createGain();
  return c.gain.setValueAtTime(0, e), c.gain.linearRampToValueAtTime(r, e + Math.min(0.01, i / 3)), c.gain.linearRampToValueAtTime(1e-4, e + i), o.connect(a), a.connect(c), c.connect(s), o.start(e), o.stop(e + i + 0.02), e + i;
}
function q(t, e, n, r, s, i, o = t.destination) {
  const a = r / 1e3, { source: c, filters: u, master: d } = P(t, n, s, o);
  if (c.frequency.setValueAtTime(s * 1.04, e), c.frequency.linearRampToValueAtTime(s * 0.92, e + a), i) {
    const $ = Math.min(0.09, a / 3);
    u.forEach((E, L) => {
      const N = i[L];
      N && (E.frequency.setValueAtTime(N, e), E.frequency.exponentialRampToValueAtTime(n.formants[L], e + $));
    });
  }
  const l = 0.04, y = 0.12;
  return d.gain.setValueAtTime(0, e), d.gain.linearRampToValueAtTime(0.5, e + l), d.gain.setValueAtTime(0.5, e + a - y), d.gain.linearRampToValueAtTime(1e-4, e + a), c.start(e), c.stop(e + a + 0.05), e + a;
}
function ne(t, e, n, r, s = t.destination) {
  const i = n / 1e3, o = { formants: [250, 1100, 2200], bandwidths: [80, 200, 300], gains: [1, 0.12, 0.05] }, { source: a, master: c } = P(t, o, r, s);
  return c.gain.setValueAtTime(0, e), c.gain.linearRampToValueAtTime(0.35, e + 0.02), c.gain.setValueAtTime(0.35, e + i - 0.02), c.gain.linearRampToValueAtTime(1e-4, e + i), a.start(e), a.stop(e + i + 0.05), e + i;
}
function O(t, e, n, r) {
  const s = Math.max(0, (e - t.currentTime) * 1e3) + 60;
  return new Promise((i) => {
    const o = () => {
      clearTimeout(a), r == null || r.removeEventListener("abort", o), n.disconnect(), i(!(r != null && r.aborted));
    }, a = setTimeout(o, s);
    r == null || r.addEventListener("abort", o, { once: !0 }), r != null && r.aborted && o();
  });
}
async function re(t, e = {}) {
  var o, a;
  const n = v(t);
  if (!n || (o = e.signal) != null && o.aborted) return !1;
  const r = await z();
  if (!r || (a = e.signal) != null && a.aborted) return !1;
  let s, i;
  try {
    i = r.createGain(), i.connect(r.destination);
    const c = r.currentTime + 0.03;
    s = q(r, c, n, e.durationMs ?? T, e.pitchHz ?? H, null, i);
  } catch {
    return i == null || i.disconnect(), !1;
  }
  return O(r, s, i, e.signal);
}
async function g(t, e, n = {}) {
  var d, l;
  const r = v(e);
  if (!r || (d = n.signal) != null && d.aborted) return !1;
  const s = await z();
  if (!s || (l = n.signal) != null && l.aborted) return !1;
  const i = ee(t), o = n.pitchHz ?? H, a = n.durationMs ?? T;
  let c, u;
  try {
    u = s.createGain(), u.connect(s.destination), c = oe(s, i, t, r, a, o, u);
  } catch {
    return u == null || u.disconnect(), !1;
  }
  return O(s, c, u, n.signal);
}
function oe(t, e, n, r, s, i, o = t.destination) {
  let a = t.currentTime + 0.03, c = null;
  switch (e.type) {
    case "plosive": {
      a = k(t, a, e, e.voiced ? 0.25 : 0.35, o), a += 0.01;
      break;
    }
    case "fricative": {
      a = k(t, a, e, 0.22, o) - 0.03;
      break;
    }
    case "affricate": {
      a += 0.03, a = k(t, a, { ...e, durationMs: e.durationMs - 30 }, 0.3, o) - 0.02;
      break;
    }
    case "nasal": {
      a = ne(t, a, e.durationMs, i, o), c = [300, 1300, 2300];
      break;
    }
    case "liquid": {
      c = n === "r" ? [450, 1300, 1600] : [380, 1e3, 2600];
      break;
    }
    case "glide": {
      const u = v(n === "y" ? "i" : "u");
      c = u ? u.formants : null;
      break;
    }
  }
  return q(t, a, r, s, i, c, o);
}
const M = "sound-bank";
function x(t) {
  return `letter:${t}`;
}
function D(t) {
  return `nikud:${t}`;
}
function Q(t, e) {
  return `syllable:${t}:${e}`;
}
function fe() {
  const t = [];
  for (const e of U)
    t.push({ key: x(e.letter), label: e.nameNikud, group: "letters" });
  for (const e of b)
    t.push({ key: D(e.id), label: `${e.nameNikud} (${e.sound})`, group: "nikud" });
  for (const e of G)
    for (const n of b)
      t.push({
        key: Q(e, n.id),
        label: I(e, n.symbol),
        group: "syllables"
      });
  return t;
}
function ae() {
  return typeof navigator < "u" && navigator.onLine === !1;
}
async function V(t, e = void 0) {
  try {
    return typeof indexedDB > "u" ? !1 : await (e ? R(M, t, e) : R(M, t));
  } catch {
    return !1;
  }
}
async function A(t) {
  if (ae() && !ie()) return !1;
  try {
    return await t(), m.audioState !== "failed" && m.audioState !== "unsupported";
  } catch {
    return !1;
  }
}
function ie() {
  return typeof speechSynthesis < "u";
}
async function me() {
  try {
    return typeof indexedDB > "u" ? [] : await X(M);
  } catch {
    return [];
  }
}
async function ye(t) {
  if (await V(x(t))) return "bank";
  const e = F(t), n = e ? e.nameNikud : t;
  return await A(() => m.speak(n)) ? "tts" : e && await g(e.sound, "a", { durationMs: 400 }) ? "synth" : "none";
}
async function pe(t) {
  if (await V(D(t))) return "bank";
  if (await A(() => m.speakVowel(t))) return "tts";
  const e = B[t];
  return e && await re(e) ? "synth" : "none";
}
async function be(t, e, n = {}) {
  const { signal: r } = n;
  if (r != null && r.aborted) return "none";
  if (await V(Q(t, e), r ? n : void 0)) return "bank";
  if (r != null && r.aborted) return "none";
  const s = b.find((c) => c.id === e), i = () => m.cancel();
  r == null || r.addEventListener("abort", i, { once: !0 });
  try {
    if (s && await A(() => m.speakNikud(t, s.symbol)))
      return r != null && r.aborted ? "none" : "tts";
  } finally {
    r == null || r.removeEventListener("abort", i);
  }
  if (r != null && r.aborted) return "none";
  const o = F(t), a = B[e];
  return a && await (r ? g(o ? o.sound : "", a, n) : g(o ? o.sound : "", a)) ? "synth" : "none";
}
function he(t, e) {
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
  const r = new URLSearchParams(window.location.search), s = r.get("allowedNikud") ? r.get("allowedNikud").split(",") : [];
  let i = `
    <div style="background:white; padding:1.5rem; border-radius:1rem; min-width:300px; text-align:center; color:#333; font-family:Heebo,Arial; direction:rtl;">
      <h2 style="margin-top:0">בחר ניקוד</h2>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; margin:1rem 0; text-align:right;">
  `;
  b.forEach((u) => {
    const d = s.length === 0 || s.includes(u.id) || s.includes(u.name);
    i += `
      <label style="display:flex; align-items:center; gap:0.5rem; cursor:pointer;">
        <input type="checkbox" value="${u.id}" class="nikud-filter-cb" ${d ? "checked" : ""} style="width:1.2rem;height:1.2rem;">
        <span>${u.nameNikud}</span>
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
  const a = (
    /** @type {HTMLInputElement} */
    document.getElementById("nikud-rate-slider")
  ), c = document.getElementById("nikud-rate-val");
  a.oninput = () => {
    c.textContent = a.value;
  }, document.getElementById("save-settings-btn").onclick = () => {
    const u = parseFloat(a.value);
    localStorage.setItem("alefbet.nikudRate", String(u)), m.setNikudEmphasis({ rate: u });
    const d = Array.from(n.querySelectorAll(".nikud-filter-cb")).filter((y) => (
      /** @type {HTMLInputElement} */
      y.checked
    )).map((y) => (
      /** @type {HTMLInputElement} */
      y.value
    )), l = new URL(window.location.href);
    d.length > 0 && d.length < b.length ? l.searchParams.set("allowedNikud", d.join(",")) : l.searchParams.delete("allowedNikud"), l.searchParams.delete("excludedNikud"), n.style.display = "none", window.history.replaceState({}, "", l), e && e(t);
  }, document.getElementById("close-settings-btn").onclick = () => {
    n.style.display = "none";
  };
}
export {
  B as NIKUD_VOWEL,
  M as SOUND_BANK_ID,
  J as VOWEL_TEMPLATES,
  ke as animate,
  ge as bootstrapGame,
  Me as createChoiceRound,
  Se as createDragSource,
  Ve as createDropTarget,
  Ae as createFeedback,
  Ee as createHintTracker,
  Le as createProgressBar,
  Ne as createRoundScope,
  de as deleteVoice,
  C as getAudioContext,
  F as getLetter,
  Oe as getLettersByGroup,
  Re as injectHeaderButton,
  le as isSynthSupported,
  I as letterWithNikud,
  Z as loadVoice,
  _e as lockPageZoom,
  G as nikudBaseLetters,
  b as nikudList,
  R as playVoice,
  xe as randomLetters,
  De as randomNikud,
  ze as randomPraise,
  Fe as randomRetryHint,
  me as recordedKeys,
  Be as runGame,
  ue as saveVoice,
  He as showCompletionScreen,
  he as showNikudSettingsDialog,
  Te as shuffle,
  Pe as sounds,
  ye as speakLetter,
  pe as speakNikudSound,
  be as speakSyllable,
  fe as standardSoundKeys,
  m as tts
};
