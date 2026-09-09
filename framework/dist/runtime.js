import { g as O, n as _, t as F, h as se, a as ce, l as K } from "./game-audio-CIXXhVEq.js";
import { b as We, c as Ze, r as Ye, d as Xe } from "./game-audio-CIXXhVEq.js";
import { createRoundScope as P } from "./common.js";
import { EventBus as et, GameShell as tt, GameState as nt, PRAISE_PHRASES as at, RETRY_HINTS as rt, animate as ot, bootstrapGame as it, createChoiceRound as st, createFeedback as ct, createHintTracker as lt, createOptionCards as dt, createProgressBar as ut, createRoundManager as ft, createZone as pt, endGame as mt, getAllProgress as ht, getGameProgress as yt, hideLoadingScreen as bt, injectHeaderButton as gt, installGlobalErrorScreen as wt, mountAudioStatusBanner as vt, randomPraise as kt, randomRetryHint as St, recordGameResult as xt, runGame as zt, showCompletionScreen as Ft, showLoadingScreen as Mt, shuffle as At, sounds as Et, starsFor as Lt } from "./common.js";
import { g as le, e as j } from "./drag-NEBgUr1u.js";
import { c as Nt, a as Rt, b as Tt, p as Vt, u as Bt } from "./drag-NEBgUr1u.js";
import { l as W, p as T, s as de } from "./voice-record-button-CVRCvvTy.js";
import { c as qt, a as Ct, d as Ht, h as Pt, i as Dt, b as It } from "./voice-record-button-CVRCvvTy.js";
import { addNikud as Gt, getNikud as Ut, isVowelized as Qt, preloadNikud as Kt } from "./nakdan-DFzp_6d3.js";
const Z = {
  a: { F1: 850, F2: 1400 },
  e: { F1: 550, F2: 2100 },
  i: { F1: 350, F2: 2700 },
  o: { F1: 550, F2: 1e3 },
  u: { F1: 350, F2: 850 }
}, G = {
  kamatz: "a",
  patah: "a",
  tzere: "e",
  segol: "e",
  hiriq: "i",
  holam: "o",
  kubbutz: "u"
};
function ue(t, e) {
  if (!Number.isFinite(t) || !Number.isFinite(e) || t <= 0 || e <= 0 || e <= t)
    return { vowel: "", confidence: 0 };
  const n = Math.log2(t), a = Math.log2(e), r = [];
  for (const [c, s] of Object.entries(Z)) {
    const d = n - Math.log2(s.F1), p = a - Math.log2(s.F2);
    r.push({ vowel: c, dist: Math.sqrt(d * d + p * p) });
  }
  r.sort((c, s) => c.dist - s.dist);
  const o = r[0], l = r[1], i = l.dist === 0 ? 1 : Math.max(0, Math.min(1, 1 - o.dist / l.dist));
  return { vowel: o.vowel, confidence: i };
}
function Te(t, e) {
  return !t || !e ? !1 : G[e] === t;
}
function fe(t, e) {
  const n = t.length, a = Math.max(1, Math.min(e, n)), r = new Float32Array(a);
  for (let i = 0; i < a; i++) {
    let c = 0;
    const s = Math.PI * i / n;
    for (let d = 0; d < n; d++)
      c += t[d] * Math.cos(s * (d + 0.5));
    r[i] = c;
  }
  const o = new Float32Array(n), l = 2 / n;
  for (let i = 0; i < n; i++) {
    let c = r[0] * 0.5;
    for (let s = 1; s < a; s++)
      c += r[s] * Math.cos(Math.PI * s * (i + 0.5) / n);
    o[i] = l * c;
  }
  return o;
}
function pe(t, e) {
  if (!t || t.length === 0 || !Number.isFinite(e) || e <= 0)
    return { F1: 0, F2: 0 };
  const n = fe(t, 80), a = Math.min(n.length - 3, Math.floor(3500 / e)), r = [];
  for (let s = 3; s <= a; s++) {
    const d = n[s];
    d > n[s - 1] && d > n[s - 2] && d > n[s + 1] && d > n[s + 2] && r.push({ freq: s * e, mag: d });
  }
  if (r.length === 0) return { F1: 0, F2: 0 };
  const o = r.filter((s) => s.freq >= 200 && s.freq <= 1100);
  if (o.length === 0) return { F1: 0, F2: 0 };
  o.sort((s, d) => d.mag - s.mag);
  const l = o[0].freq, i = Math.max(l + 250, 700), c = r.filter((s) => s.freq >= i && s.freq <= 3500);
  return c.length === 0 ? { F1: l, F2: 0 } : (c.sort((s, d) => d.mag - s.mag), { F1: l, F2: c[0].freq });
}
function Ve() {
  var l;
  const t = typeof window < "u", e = t && !!((l = navigator == null ? void 0 : navigator.mediaDevices) != null && l.getUserMedia), n = t ? window.AudioContext || window.webkitAudioContext : null, a = e && !!n;
  let r = null;
  const o = () => ({ vowel: "", confidence: 0, F1: 0, F2: 0 });
  return {
    available: a,
    listen(i = 3e3) {
      return r == null || r(), a ? new Promise((c) => {
        let s = !1, d = null, p = null, g = null;
        const x = (m) => {
          var b;
          if (!s) {
            s = !0, g !== null && cancelAnimationFrame(g), d == null || d.getTracks().forEach((y) => {
              try {
                y.stop();
              } catch {
              }
            });
            try {
              (b = p == null ? void 0 : p.close()) == null || b.catch(() => {
              });
            } catch {
            }
            r === k && (r = null), c(m);
          }
        }, k = () => x(o());
        r = k, Promise.resolve().then(() => navigator.mediaDevices.getUserMedia({ audio: !0 })).then((m) => {
          if (s) {
            m.getTracks().forEach((R) => {
              try {
                R.stop();
              } catch {
              }
            });
            return;
          }
          d = m, p = new n();
          const b = p.createMediaStreamSource(d), y = p.createAnalyser();
          y.fftSize = 4096, y.smoothingTimeConstant = 0.2, b.connect(y);
          const M = p.sampleRate / y.fftSize, z = new Float32Array(y.frequencyBinCount), v = new Float32Array(y.fftSize), S = [], N = performance.now(), A = () => {
            if (s) return;
            if (performance.now() - N > i) {
              if (S.length < 3) {
                x(o());
                return;
              }
              const w = S.map((L) => L.F1).sort((L, H) => L - H), u = S.map((L) => L.F2).sort((L, H) => L - H), f = Math.floor(S.length / 2), h = w[f], E = u[f];
              x({ ...ue(h, E), F1: h, F2: E });
              return;
            }
            y.getFloatTimeDomainData(v);
            let R = 0;
            for (let w = 0; w < v.length; w++) R += v[w] * v[w];
            if (Math.sqrt(R / v.length) > 0.015) {
              y.getFloatFrequencyData(z);
              const { F1: w, F2: u } = pe(z, M);
              w > 0 && u > 0 && u > w && S.push({ F1: w, F2: u });
            }
            g = requestAnimationFrame(A);
          };
          g = requestAnimationFrame(A);
        }).catch(() => x(o()));
      }) : Promise.resolve(o());
    },
    cancel() {
      r == null || r();
    }
  };
}
const Y = 210, X = 550, me = {
  a: { F3: 2700, bandwidths: [90, 110, 170], gains: [1, 0.5, 0.15] },
  e: { F3: 2900, bandwidths: [80, 100, 160], gains: [1, 0.55, 0.2] },
  i: { F3: 3300, bandwidths: [60, 100, 160], gains: [1, 0.6, 0.25] },
  o: { F3: 2600, bandwidths: [80, 90, 150], gains: [1, 0.5, 0.1] },
  u: { F3: 2400, bandwidths: [60, 80, 140], gains: [1, 0.45, 0.1] }
};
function $(t) {
  const e = Z[t], n = me[t];
  return !e || !n ? null : {
    formants: [e.F1, e.F2, n.F3],
    bandwidths: [...n.bandwidths],
    gains: [...n.gains]
  };
}
const U = {
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
function he(t) {
  return U[t] ?? U[""];
}
function Be() {
  return le() !== null;
}
let B = null;
function ye(t) {
  if (B && B.sampleRate === t.sampleRate) return B;
  const e = t.sampleRate, n = t.createBuffer(1, e, t.sampleRate), a = n.getChannelData(0);
  for (let r = 0; r < e; r++) a[r] = Math.random() * 2 - 1;
  return B = n, n;
}
function J(t, e, n, a = t.destination) {
  const r = t.createOscillator();
  r.type = "sawtooth", r.frequency.value = n;
  const o = t.createGain();
  o.gain.value = 0;
  const l = e.formants.map((i, c) => {
    const s = t.createBiquadFilter();
    s.type = "bandpass", s.frequency.value = i, s.Q.value = i / e.bandwidths[c];
    const d = t.createGain();
    return d.gain.value = e.gains[c], r.connect(s), s.connect(d), d.connect(o), s;
  });
  return o.connect(a), { source: r, filters: l, master: o };
}
function D(t, e, n, a, r = t.destination) {
  const o = n.durationMs / 1e3, l = t.createBufferSource();
  l.buffer = ye(t), l.loop = !0;
  const i = t.createBiquadFilter();
  i.type = "bandpass", i.frequency.value = n.noiseHz ?? 2e3, i.Q.value = n.noiseQ ?? 1;
  const c = t.createGain();
  return c.gain.setValueAtTime(0, e), c.gain.linearRampToValueAtTime(a, e + Math.min(0.01, o / 3)), c.gain.linearRampToValueAtTime(1e-4, e + o), l.connect(i), i.connect(c), c.connect(r), l.start(e), l.stop(e + o + 0.02), e + o;
}
function ee(t, e, n, a, r, o, l = t.destination) {
  const i = a / 1e3, { source: c, filters: s, master: d } = J(t, n, r, l);
  if (c.frequency.setValueAtTime(r * 1.04, e), c.frequency.linearRampToValueAtTime(r * 0.92, e + i), o) {
    const x = Math.min(0.09, i / 3);
    s.forEach((k, m) => {
      const b = o[m];
      b && (k.frequency.setValueAtTime(b, e), k.frequency.exponentialRampToValueAtTime(n.formants[m], e + x));
    });
  }
  const p = 0.04, g = 0.12;
  return d.gain.setValueAtTime(0, e), d.gain.linearRampToValueAtTime(0.5, e + p), d.gain.setValueAtTime(0.5, e + i - g), d.gain.linearRampToValueAtTime(1e-4, e + i), c.start(e), c.stop(e + i + 0.05), e + i;
}
function be(t, e, n, a, r = t.destination) {
  const o = n / 1e3, l = { formants: [250, 1100, 2200], bandwidths: [80, 200, 300], gains: [1, 0.12, 0.05] }, { source: i, master: c } = J(t, l, a, r);
  return c.gain.setValueAtTime(0, e), c.gain.linearRampToValueAtTime(0.35, e + 0.02), c.gain.setValueAtTime(0.35, e + o - 0.02), c.gain.linearRampToValueAtTime(1e-4, e + o), i.start(e), i.stop(e + o + 0.05), e + o;
}
function te(t, e, n, a) {
  const r = Math.max(0, (e - t.currentTime) * 1e3) + 60;
  return new Promise((o) => {
    const l = () => {
      clearTimeout(i), a == null || a.removeEventListener("abort", l), n.disconnect(), o(!(a != null && a.aborted));
    }, i = setTimeout(l, r);
    a == null || a.addEventListener("abort", l, { once: !0 }), a != null && a.aborted && l();
  });
}
async function ge(t, e = {}) {
  var l, i;
  const n = $(t);
  if (!n || (l = e.signal) != null && l.aborted) return !1;
  const a = await j();
  if (!a || (i = e.signal) != null && i.aborted) return !1;
  let r, o;
  try {
    o = a.createGain(), o.connect(a.destination);
    const c = a.currentTime + 0.03;
    r = ee(a, c, n, e.durationMs ?? X, e.pitchHz ?? Y, null, o);
  } catch {
    return o == null || o.disconnect(), !1;
  }
  return te(a, r, o, e.signal);
}
async function I(t, e, n = {}) {
  var d, p;
  const a = $(e);
  if (!a || (d = n.signal) != null && d.aborted) return !1;
  const r = await j();
  if (!r || (p = n.signal) != null && p.aborted) return !1;
  const o = he(t), l = n.pitchHz ?? Y, i = n.durationMs ?? X;
  let c, s;
  try {
    s = r.createGain(), s.connect(r.destination), c = we(r, o, t, a, i, l, s);
  } catch {
    return s == null || s.disconnect(), !1;
  }
  return te(r, c, s, n.signal);
}
function we(t, e, n, a, r, o, l = t.destination) {
  let i = t.currentTime + 0.03, c = null;
  switch (e.type) {
    case "plosive": {
      i = D(t, i, e, e.voiced ? 0.25 : 0.35, l), i += 0.01;
      break;
    }
    case "fricative": {
      i = D(t, i, e, 0.22, l) - 0.03;
      break;
    }
    case "affricate": {
      i += 0.03, i = D(t, i, { ...e, durationMs: e.durationMs - 30 }, 0.3, l) - 0.02;
      break;
    }
    case "nasal": {
      i = be(t, i, e.durationMs, o, l), c = [300, 1300, 2300];
      break;
    }
    case "liquid": {
      c = n === "r" ? [450, 1300, 1600] : [380, 1e3, 2600];
      break;
    }
    case "glide": {
      const s = $(n === "y" ? "i" : "u");
      c = s ? s.formants : null;
      break;
    }
  }
  return ee(t, i, a, r, o, c, l);
}
const V = "sound-bank";
function ne(t) {
  return `letter:${t}`;
}
function ae(t) {
  return `nikud:${t}`;
}
function re(t, e) {
  return `syllable:${t}:${e}`;
}
function ve(t) {
  return `word:${t}`;
}
function oe() {
  const t = [];
  for (const e of se)
    t.push({ key: ne(e.letter), label: e.nameNikud, group: "letters" });
  for (const e of _)
    t.push({ key: ae(e.id), label: `${e.nameNikud} (${e.sound})`, group: "nikud" });
  for (const e of ce)
    for (const n of _)
      t.push({
        key: re(e, n.id),
        label: K(e, n.symbol),
        group: "syllables"
      });
  return t;
}
function $e(t) {
  const e = oe().find((a) => a.key === t);
  if (e) return e.label;
  const [, ...n] = t.split(":");
  return n.join(":");
}
function ke() {
  return typeof navigator < "u" && navigator.onLine === !1;
}
async function q(t, e = void 0) {
  try {
    return typeof indexedDB > "u" ? !1 : await (e ? T(V, t, e) : T(V, t));
  } catch {
    return !1;
  }
}
async function C(t) {
  if (ke() && !Se()) return !1;
  try {
    return await t(), F.audioState !== "failed" && F.audioState !== "unsupported";
  } catch {
    return !1;
  }
}
function Se() {
  return typeof speechSynthesis < "u";
}
async function qe() {
  try {
    return typeof indexedDB > "u" ? [] : await W(V);
  } catch {
    return [];
  }
}
async function Ce(t) {
  if (await q(ne(t))) return "bank";
  const e = O(t), n = e ? e.nameNikud : t;
  return await C(() => F.speak(n)) ? "tts" : e && await I(e.sound, "a", { durationMs: 400 }) ? "synth" : "none";
}
async function He(t) {
  if (await q(ae(t))) return "bank";
  if (await C(() => F.speakVowel(t))) return "tts";
  const e = G[t];
  return e && await ge(e) ? "synth" : "none";
}
async function Pe(t, e, n = {}) {
  const { signal: a } = n;
  if (a != null && a.aborted) return "none";
  if (await q(re(t, e), a ? n : void 0)) return "bank";
  if (a != null && a.aborted) return "none";
  const r = _.find((c) => c.id === e), o = () => F.cancel();
  a == null || a.addEventListener("abort", o, { once: !0 });
  try {
    if (r && await C(() => F.speakNikud(t, r.symbol)))
      return a != null && a.aborted ? "none" : "tts";
  } finally {
    a == null || a.removeEventListener("abort", o);
  }
  if (a != null && a.aborted) return "none";
  const l = O(t), i = G[e];
  return i && await (a ? I(l ? l.sound : "", i, n) : I(l ? l.sound : "", i)) ? "synth" : "none";
}
async function De(t) {
  return await q(ve(t)) ? "bank" : await C(() => F.speak(t)) ? "tts" : "none";
}
const Q = "alefbet.ttsProxyUrl";
function xe() {
  var o, l;
  if (typeof window > "u") return null;
  const t = new URLSearchParams(window.location.search).get("ttsProxy");
  if (t && window.localStorage)
    try {
      window.localStorage.setItem(Q, t);
    } catch {
    }
  const e = (
    /** @type {any} */
    window.ALEFBET_TTS_PROXY_URL
  ), n = (o = window.localStorage) == null ? void 0 : o.getItem(Q), a = (l = window.localStorage) == null ? void 0 : l.getItem("alefbet.nakdanProxyUrl"), r = t || e || n || a;
  return r ? String(r).replace(/\/+$/, "") : null;
}
function ze(t) {
  const [e, n, a] = t.split(":");
  if (e === "letter") {
    const r = O(n);
    return r ? r.nameNikud : null;
  }
  if (e === "nikud") {
    const r = _.find((o) => o.id === n);
    return r ? r.sound : null;
  }
  if (e === "syllable") {
    const r = _.find((o) => o.id === a);
    return r ? K(n, r.symbol) : null;
  }
  return e === "word" && t.slice(5) || null;
}
async function Fe(t, e) {
  const n = await fetch(`${t}/tts?text=${encodeURIComponent(e)}&lang=he`);
  if (!n.ok) throw new Error(`tts-proxy ${n.status}`);
  const a = await n.blob();
  if (!a || a.size === 0) throw new Error("empty-audio");
  return a;
}
async function Ie({ force: t = !1, extraTexts: e = [], onProgress: n } = {}) {
  const a = xe();
  if (!a)
    throw new Error("tts-proxy-not-configured: הגדירו כתובת דרך ?ttsProxy=... או window.ALEFBET_TTS_PROXY_URL");
  if (typeof indexedDB > "u")
    throw new Error("indexeddb-unavailable: אין אחסון מקומי לשמירת הצלילים");
  const r = [
    ...oe().map((c) => c.key),
    ...e.filter((c) => c == null ? void 0 : c.trim()).map((c) => `word:${c}`)
  ], o = new Set(t ? [] : await W(V).catch(() => [])), l = { total: r.length, compiled: 0, skipped: 0, failures: [] };
  let i = 0;
  for (const c of r) {
    if (i++, o.has(c)) {
      l.skipped++, n == null || n(i, r.length, c);
      continue;
    }
    const s = ze(c);
    if (!s) {
      l.failures.push({ key: c, reason: "unknown-key" }), n == null || n(i, r.length, c);
      continue;
    }
    try {
      const d = await Fe(a, s);
      await de(V, c, d), l.compiled++;
    } catch (d) {
      l.failures.push({ key: c, reason: (d == null ? void 0 : d.message) || "fetch-failed" });
    }
    n == null || n(i, r.length, c);
  }
  return l;
}
function Oe(t, e) {
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
  _.forEach((s) => {
    const d = r.length === 0 || r.includes(s.id) || r.includes(s.name);
    o += `
      <label style="display:flex; align-items:center; gap:0.5rem; cursor:pointer;">
        <input type="checkbox" value="${s.id}" class="nikud-filter-cb" ${d ? "checked" : ""} style="width:1.2rem;height:1.2rem;">
        <span>${s.nameNikud}</span>
      </label>
    `;
  });
  const l = parseFloat(localStorage.getItem("alefbet.nikudRate")) || 0.5;
  o += `
      </div>
      <div style="margin:1rem 0; text-align:right;">
        <label style="font-weight:700; font-size:0.95rem;">מהירות הגייה: <span id="nikud-rate-val">${l}</span></label>
        <input type="range" id="nikud-rate-slider" min="0.3" max="1.5" step="0.1" value="${l}" style="width:100%; margin-top:0.3rem; accent-color:#4f67ff;">
        <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:#888;">
          <span>אִטִּי</span>
          <span>מָהִיר</span>
        </div>
      </div>
      <button id="save-settings-btn" style="padding:0.5rem 1rem; border-radius:0.5rem; background:#4f67ff; color:white; border:none; font-size:1.1rem; cursor:pointer;">שמור והתחל מחדש</button>
      <button id="close-settings-btn" style="padding:0.5rem 1rem; border-radius:0.5rem; background:#ddd; color:#333; border:none; font-size:1.1rem; cursor:pointer; margin-right:0.5rem;">ביטול</button>
    </div>
  `, n.innerHTML = o, n.style.display = "flex";
  const i = (
    /** @type {HTMLInputElement} */
    document.getElementById("nikud-rate-slider")
  ), c = document.getElementById("nikud-rate-val");
  i.oninput = () => {
    c.textContent = i.value;
  }, document.getElementById("save-settings-btn").onclick = () => {
    const s = parseFloat(i.value);
    localStorage.setItem("alefbet.nikudRate", String(s)), F.setNikudEmphasis({ rate: s });
    const d = Array.from(n.querySelectorAll(".nikud-filter-cb")).filter((g) => (
      /** @type {HTMLInputElement} */
      g.checked
    )).map((g) => (
      /** @type {HTMLInputElement} */
      g.value
    )), p = new URL(window.location.href);
    d.length > 0 && d.length < _.length ? p.searchParams.set("allowedNikud", d.join(",")) : p.searchParams.delete("allowedNikud"), p.searchParams.delete("excludedNikud"), n.style.display = "none", window.history.replaceState({}, "", p), e && e(t);
  }, document.getElementById("close-settings-btn").onclick = () => {
    n.style.display = "none";
  };
}
function Me(t, e, n, a, r) {
  return t.map((o) => {
    const l = a > 0 ? (o.x - e) / a * 100 : 0, i = r > 0 ? (o.y - n) / r * 100 : 0;
    return `${l},${i}`;
  }).join(" ");
}
function Ge(t, e) {
  const {
    image: n,
    zones: a = [],
    mode: r = "quiz",
    gameId: o,
    roundId: l,
    onCorrect: i,
    onWrong: c,
    onAllCorrect: s,
    onZoneTap: d,
    showZones: p = !1,
    autoPlayInstruction: g = !0,
    hintAfter: x = 3
  } = e, k = P();
  let m = P();
  k.use(() => m.dispose());
  const b = r === "soundboard", y = document.createElement("div");
  y.className = "ab-zp-wrap";
  const M = document.createElement("img");
  M.className = "ab-zp-image", M.src = n, M.alt = "", M.draggable = !1, y.appendChild(M);
  const z = document.createElement("div");
  z.className = "ab-zp-layer", y.appendChild(z), t.appendChild(y);
  const v = /* @__PURE__ */ new Set();
  let S = 0, N = !1, A = !1;
  async function R(u) {
    if (!o || N) return;
    N = !0;
    const f = m.signal;
    try {
      await T(o, `zone-${u}`, { signal: f });
    } catch {
    }
    f.aborted || (N = !1);
  }
  function w() {
    if (A || x <= 0 || b || S < x) return;
    A = !0;
    const u = z.querySelectorAll(".ab-zp-zone");
    u.forEach((f, h) => {
      var E;
      (E = a[h]) != null && E.correct && !v.has(a[h].id) && f.classList.add("ab-zp-zone--hint");
    }), m.schedule(() => {
      u.forEach((f) => f.classList.remove("ab-zp-zone--hint")), A = !1, S = 0;
    }, 1500);
  }
  return a.forEach((u) => {
    const f = document.createElement("button");
    if (f.className = "ab-zp-zone", (p || b) && f.classList.add("ab-zp-zone--visible"), b && f.classList.add("ab-zp-zone--soundboard"), f.style.left = `${u.x}%`, f.style.top = `${u.y}%`, f.style.width = `${u.width}%`, f.style.height = `${u.height}%`, f.setAttribute("aria-label", u.label || (u.correct ? "correct zone" : "zone")), u.shape === "polygon" && u.points && u.points.length >= 3) {
      const h = `zp-clip-${u.id}`;
      f.innerHTML = `<svg class="ab-zp-zone__poly-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs><clipPath id="${h}"><polygon points="${Me(u.points, u.x, u.y, u.width, u.height)}"/></clipPath></defs>
        <rect x="0" y="0" width="100" height="100" clip-path="url(#${h})" fill="transparent"/>
      </svg>`, f.classList.add("ab-zp-zone--poly");
    }
    if (b && u.label) {
      const h = document.createElement("span");
      h.className = "ab-zp-zone__label", h.textContent = u.label, f.appendChild(h);
    }
    k.listen(f, "click", () => {
      if (d && d(u), R(u.id), b) {
        f.classList.add("ab-zp-zone--tapped"), m.schedule(() => f.classList.remove("ab-zp-zone--tapped"), 400);
        return;
      }
      if (!v.has(u.id))
        if (u.correct) {
          v.add(u.id), f.classList.add("ab-zp-zone--correct"), i && i(u);
          const h = a.filter((E) => E.correct).length;
          v.size >= h && s && s();
        } else
          f.classList.add("ab-zp-zone--wrong"), S++, c && c(u), m.schedule(() => f.classList.remove("ab-zp-zone--wrong"), 600), w();
    }), z.appendChild(f);
  }), g && o && l && m.schedule(() => {
    T(o, l, { signal: m.signal }).catch(() => {
    });
  }, 400), {
    async playInstruction() {
      return o && l ? T(o, l, { signal: m.signal }) : !1;
    },
    async playZoneAudio(u) {
      return o ? T(o, `zone-${u}`, { signal: m.signal }) : !1;
    },
    revealCorrect() {
      z.querySelectorAll(".ab-zp-zone").forEach((u, f) => {
        var h;
        (h = a[f]) != null && h.correct && u.classList.add("ab-zp-zone--revealed");
      });
    },
    reset() {
      k.signal.aborted || (m.dispose(), m = P(), N = !1, v.clear(), S = 0, A = !1, z.querySelectorAll(".ab-zp-zone").forEach((u) => {
        u.classList.remove(
          "ab-zp-zone--correct",
          "ab-zp-zone--wrong",
          "ab-zp-zone--revealed",
          "ab-zp-zone--tapped",
          "ab-zp-zone--hint"
        );
      }));
    },
    destroy() {
      k.dispose(), y.remove();
    }
  };
}
const Ae = "0 0 32 16", ie = {
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
function Ee(t) {
  const e = ie[t];
  return e ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${Ae}" aria-hidden="true" focusable="false">${e}</svg>` : null;
}
const Ue = Object.freeze(Object.keys(ie));
function Qe(t, { size: e = "md" } = {}) {
  const n = document.createElement("div");
  n.className = `ab-nikud-box ab-nikud-box--${e} ab-nikud-box--${t.id}`;
  const a = document.createElement("div");
  a.className = "ab-nikud-box__box";
  const r = document.createElement("div");
  return r.className = "ab-nikud-box__mark", r.innerHTML = Ee(t.id) ?? "", n.appendChild(a), n.appendChild(r), n;
}
export {
  et as EventBus,
  tt as GameShell,
  nt as GameState,
  Ue as NIKUD_GLYPH_IDS,
  G as NIKUD_VOWEL,
  at as PRAISE_PHRASES,
  rt as RETRY_HINTS,
  V as SOUND_BANK_ID,
  Z as VOWEL_TEMPLATES,
  Gt as addNikud,
  ot as animate,
  We as attachGameAudio,
  it as bootstrapGame,
  ue as classifyFormants,
  Ie as compileSoundBank,
  ze as compileTextForKey,
  he as consonantOnsetSpec,
  st as createChoiceRound,
  Nt as createDragSource,
  Rt as createDropTarget,
  ct as createFeedback,
  lt as createHintTracker,
  Tt as createLocalState,
  Qe as createNikudBox,
  dt as createOptionCards,
  ut as createProgressBar,
  ft as createRoundManager,
  P as createRoundScope,
  qt as createVoiceRecordButton,
  Ct as createVoiceRecorder,
  Ve as createVowelDetector,
  pt as createZone,
  Ge as createZonePlayer,
  Ht as deleteVoice,
  mt as endGame,
  j as ensureAudioRunning,
  pe as extractFormantsFromSpectrum,
  ht as getAllProgress,
  le as getAudioContext,
  yt as getGameProgress,
  O as getLetter,
  Ze as getLettersByGroup,
  Ut as getNikud,
  Pt as hasVoice,
  se as hebrewLetters,
  bt as hideLoadingScreen,
  gt as injectHeaderButton,
  wt as installGlobalErrorScreen,
  ke as isOffline,
  Be as isSynthSupported,
  Dt as isVoiceRecordingSupported,
  Qt as isVowelized,
  $e as keyLabel,
  ne as letterKey,
  K as letterWithNikud,
  W as listVoiceKeys,
  It as loadVoice,
  Te as matchNikudVowel,
  vt as mountAudioStatusBanner,
  ce as nikudBaseLetters,
  Ee as nikudGlyphSvg,
  ae as nikudKey,
  _ as nikudList,
  Vt as playBlob,
  T as playVoice,
  Kt as preloadNikud,
  Ye as randomLetters,
  Xe as randomNikud,
  kt as randomPraise,
  St as randomRetryHint,
  xt as recordGameResult,
  qe as recordedKeys,
  xe as resolveTtsProxyUrl,
  zt as runGame,
  de as saveVoice,
  Ft as showCompletionScreen,
  Mt as showLoadingScreen,
  Oe as showNikudSettingsDialog,
  At as shuffle,
  Et as sounds,
  Ce as speakLetter,
  He as speakNikudSound,
  Pe as speakSyllable,
  De as speakWord,
  oe as standardSoundKeys,
  Lt as starsFor,
  re as syllableKey,
  I as synthesizeSyllable,
  ge as synthesizeVowel,
  F as tts,
  Bt as unlockAudioOutput,
  $ as vowelFormantSpec,
  ve as wordKey
};
