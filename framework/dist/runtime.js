import { g as O, n as R, t as M, h as ie, a as se, l as K } from "./game-audio-CIXXhVEq.js";
import { b as Ge, c as Ue, r as Qe, d as Ke } from "./game-audio-CIXXhVEq.js";
import { createRoundScope as H } from "./common.js";
import { EventBus as We, GameShell as Ze, GameState as Ye, PRAISE_PHRASES as Xe, RETRY_HINTS as Je, animate as et, bootstrapGame as tt, createChoiceRound as nt, createFeedback as at, createHintTracker as ot, createOptionCards as rt, createProgressBar as it, createRoundManager as st, createZone as ct, endGame as lt, getAllProgress as dt, getGameProgress as ut, hideLoadingScreen as ft, injectHeaderButton as pt, installGlobalErrorScreen as mt, lockPageZoom as ht, mountAudioStatusBanner as yt, randomPraise as bt, randomRetryHint as gt, recordGameResult as wt, runGame as vt, showCompletionScreen as kt, showLoadingScreen as St, shuffle as Ft, sounds as zt, starsFor as Mt } from "./common.js";
import { g as ce, e as j } from "./drag-NEBgUr1u.js";
import { c as Et, a as Lt, b as xt, p as Rt, u as _t } from "./drag-NEBgUr1u.js";
import { l as W, p as V, s as le } from "./voice-record-button-CVRCvvTy.js";
import { c as Vt, a as Tt, d as qt, h as Bt, i as $t, b as Ct } from "./voice-record-button-CVRCvvTy.js";
import { addNikud as Ht, getNikud as Dt, isVowelized as It, preloadNikud as Ot } from "./nakdan-DFzp_6d3.js";
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
function de(t, e) {
  if (!Number.isFinite(t) || !Number.isFinite(e) || t <= 0 || e <= 0 || e <= t)
    return { vowel: "", confidence: 0 };
  const n = Math.log2(t), a = Math.log2(e), o = [];
  for (const [c, s] of Object.entries(Z)) {
    const d = n - Math.log2(s.F1), p = a - Math.log2(s.F2);
    o.push({ vowel: c, dist: Math.sqrt(d * d + p * p) });
  }
  o.sort((c, s) => c.dist - s.dist);
  const r = o[0], l = o[1], i = l.dist === 0 ? 1 : Math.max(0, Math.min(1, 1 - r.dist / l.dist));
  return { vowel: r.vowel, confidence: i };
}
function Re(t, e) {
  return !t || !e ? !1 : G[e] === t;
}
function ue(t, e) {
  const n = t.length, a = Math.max(1, Math.min(e, n)), o = new Float32Array(a);
  for (let i = 0; i < a; i++) {
    let c = 0;
    const s = Math.PI * i / n;
    for (let d = 0; d < n; d++)
      c += t[d] * Math.cos(s * (d + 0.5));
    o[i] = c;
  }
  const r = new Float32Array(n), l = 2 / n;
  for (let i = 0; i < n; i++) {
    let c = o[0] * 0.5;
    for (let s = 1; s < a; s++)
      c += o[s] * Math.cos(Math.PI * s * (i + 0.5) / n);
    r[i] = l * c;
  }
  return r;
}
function fe(t, e) {
  if (!t || t.length === 0 || !Number.isFinite(e) || e <= 0)
    return { F1: 0, F2: 0 };
  const n = ue(t, 80), a = Math.min(n.length - 3, Math.floor(3500 / e)), o = [];
  for (let s = 3; s <= a; s++) {
    const d = n[s];
    d > n[s - 1] && d > n[s - 2] && d > n[s + 1] && d > n[s + 2] && o.push({ freq: s * e, mag: d });
  }
  if (o.length === 0) return { F1: 0, F2: 0 };
  const r = o.filter((s) => s.freq >= 200 && s.freq <= 1100);
  if (r.length === 0) return { F1: 0, F2: 0 };
  r.sort((s, d) => d.mag - s.mag);
  const l = r[0].freq, i = Math.max(l + 250, 700), c = o.filter((s) => s.freq >= i && s.freq <= 3500);
  return c.length === 0 ? { F1: l, F2: 0 } : (c.sort((s, d) => d.mag - s.mag), { F1: l, F2: c[0].freq });
}
function _e() {
  var l;
  const t = typeof window < "u", e = t && !!((l = navigator == null ? void 0 : navigator.mediaDevices) != null && l.getUserMedia), n = t ? window.AudioContext || window.webkitAudioContext : null, a = e && !!n;
  let o = null;
  const r = () => ({ vowel: "", confidence: 0, F1: 0, F2: 0 });
  return {
    available: a,
    listen(i = 3e3) {
      return o == null || o(), a ? new Promise((c) => {
        let s = !1, d = null, p = null, g = null;
        const F = (m) => {
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
            o === k && (o = null), c(m);
          }
        }, k = () => F(r());
        o = k, Promise.resolve().then(() => navigator.mediaDevices.getUserMedia({ audio: !0 })).then((m) => {
          if (s) {
            m.getTracks().forEach((N) => {
              try {
                N.stop();
              } catch {
              }
            });
            return;
          }
          d = m, p = new n();
          const b = p.createMediaStreamSource(d), y = p.createAnalyser();
          y.fftSize = 4096, y.smoothingTimeConstant = 0.2, b.connect(y);
          const A = p.sampleRate / y.fftSize, z = new Float32Array(y.frequencyBinCount), v = new Float32Array(y.fftSize), S = [], _ = performance.now(), E = () => {
            if (s) return;
            if (performance.now() - _ > i) {
              if (S.length < 3) {
                F(r());
                return;
              }
              const w = S.map((x) => x.F1).sort((x, P) => x - P), u = S.map((x) => x.F2).sort((x, P) => x - P), f = Math.floor(S.length / 2), h = w[f], L = u[f];
              F({ ...de(h, L), F1: h, F2: L });
              return;
            }
            y.getFloatTimeDomainData(v);
            let N = 0;
            for (let w = 0; w < v.length; w++) N += v[w] * v[w];
            if (Math.sqrt(N / v.length) > 0.015) {
              y.getFloatFrequencyData(z);
              const { F1: w, F2: u } = fe(z, A);
              w > 0 && u > 0 && u > w && S.push({ F1: w, F2: u });
            }
            g = requestAnimationFrame(E);
          };
          g = requestAnimationFrame(E);
        }).catch(() => F(r()));
      }) : Promise.resolve(r());
    },
    cancel() {
      o == null || o();
    }
  };
}
const Y = 210, X = 550, pe = {
  a: { F3: 2700, bandwidths: [90, 110, 170], gains: [1, 0.5, 0.15] },
  e: { F3: 2900, bandwidths: [80, 100, 160], gains: [1, 0.55, 0.2] },
  i: { F3: 3300, bandwidths: [60, 100, 160], gains: [1, 0.6, 0.25] },
  o: { F3: 2600, bandwidths: [80, 90, 150], gains: [1, 0.5, 0.1] },
  u: { F3: 2400, bandwidths: [60, 80, 140], gains: [1, 0.45, 0.1] }
};
function B(t) {
  const e = Z[t], n = pe[t];
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
function me(t) {
  return U[t] ?? U[""];
}
function Ne() {
  return ce() !== null;
}
let q = null;
function he(t) {
  if (q && q.sampleRate === t.sampleRate) return q;
  const e = t.sampleRate, n = t.createBuffer(1, e, t.sampleRate), a = n.getChannelData(0);
  for (let o = 0; o < e; o++) a[o] = Math.random() * 2 - 1;
  return q = n, n;
}
function J(t, e, n, a = t.destination) {
  const o = t.createOscillator();
  o.type = "sawtooth", o.frequency.value = n;
  const r = t.createGain();
  r.gain.value = 0;
  const l = e.formants.map((i, c) => {
    const s = t.createBiquadFilter();
    s.type = "bandpass", s.frequency.value = i, s.Q.value = i / e.bandwidths[c];
    const d = t.createGain();
    return d.gain.value = e.gains[c], o.connect(s), s.connect(d), d.connect(r), s;
  });
  return r.connect(a), { source: o, filters: l, master: r };
}
function D(t, e, n, a, o = t.destination) {
  const r = n.durationMs / 1e3, l = t.createBufferSource();
  l.buffer = he(t), l.loop = !0;
  const i = t.createBiquadFilter();
  i.type = "bandpass", i.frequency.value = n.noiseHz ?? 2e3, i.Q.value = n.noiseQ ?? 1;
  const c = t.createGain();
  return c.gain.setValueAtTime(0, e), c.gain.linearRampToValueAtTime(a, e + Math.min(0.01, r / 3)), c.gain.linearRampToValueAtTime(1e-4, e + r), l.connect(i), i.connect(c), c.connect(o), l.start(e), l.stop(e + r + 0.02), e + r;
}
function ee(t, e, n, a, o, r, l = t.destination) {
  const i = a / 1e3, { source: c, filters: s, master: d } = J(t, n, o, l);
  if (c.frequency.setValueAtTime(o * 1.04, e), c.frequency.linearRampToValueAtTime(o * 0.92, e + i), r) {
    const F = Math.min(0.09, i / 3);
    s.forEach((k, m) => {
      const b = r[m];
      b && (k.frequency.setValueAtTime(b, e), k.frequency.exponentialRampToValueAtTime(n.formants[m], e + F));
    });
  }
  const p = 0.04, g = 0.12;
  return d.gain.setValueAtTime(0, e), d.gain.linearRampToValueAtTime(0.5, e + p), d.gain.setValueAtTime(0.5, e + i - g), d.gain.linearRampToValueAtTime(1e-4, e + i), c.start(e), c.stop(e + i + 0.05), e + i;
}
function ye(t, e, n, a, o = t.destination) {
  const r = n / 1e3, l = { formants: [250, 1100, 2200], bandwidths: [80, 200, 300], gains: [1, 0.12, 0.05] }, { source: i, master: c } = J(t, l, a, o);
  return c.gain.setValueAtTime(0, e), c.gain.linearRampToValueAtTime(0.35, e + 0.02), c.gain.setValueAtTime(0.35, e + r - 0.02), c.gain.linearRampToValueAtTime(1e-4, e + r), i.start(e), i.stop(e + r + 0.05), e + r;
}
function te(t, e, n, a) {
  const o = Math.max(0, (e - t.currentTime) * 1e3) + 60;
  return new Promise((r) => {
    const l = () => {
      clearTimeout(i), a == null || a.removeEventListener("abort", l), n.disconnect(), r(!(a != null && a.aborted));
    }, i = setTimeout(l, o);
    a == null || a.addEventListener("abort", l, { once: !0 }), a != null && a.aborted && l();
  });
}
async function be(t, e = {}) {
  var l, i;
  const n = B(t);
  if (!n || (l = e.signal) != null && l.aborted) return !1;
  const a = await j();
  if (!a || (i = e.signal) != null && i.aborted) return !1;
  let o, r;
  try {
    r = a.createGain(), r.connect(a.destination);
    const c = a.currentTime + 0.03;
    o = ee(a, c, n, e.durationMs ?? X, e.pitchHz ?? Y, null, r);
  } catch {
    return r == null || r.disconnect(), !1;
  }
  return te(a, o, r, e.signal);
}
async function I(t, e, n = {}) {
  var d, p;
  const a = B(e);
  if (!a || (d = n.signal) != null && d.aborted) return !1;
  const o = await j();
  if (!o || (p = n.signal) != null && p.aborted) return !1;
  const r = me(t), l = n.pitchHz ?? Y, i = n.durationMs ?? X;
  let c, s;
  try {
    s = o.createGain(), s.connect(o.destination), c = ge(o, r, t, a, i, l, s);
  } catch {
    return s == null || s.disconnect(), !1;
  }
  return te(o, c, s, n.signal);
}
function ge(t, e, n, a, o, r, l = t.destination) {
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
      i = ye(t, i, e.durationMs, r, l), c = [300, 1300, 2300];
      break;
    }
    case "liquid": {
      c = n === "r" ? [450, 1300, 1600] : [380, 1e3, 2600];
      break;
    }
    case "glide": {
      const s = B(n === "y" ? "i" : "u");
      c = s ? s.formants : null;
      break;
    }
  }
  return ee(t, i, a, o, r, c, l);
}
const T = "sound-bank";
function ne(t) {
  return `letter:${t}`;
}
function ae(t) {
  return `nikud:${t}`;
}
function oe(t, e) {
  return `syllable:${t}:${e}`;
}
function we(t) {
  return `word:${t}`;
}
function re() {
  const t = [];
  for (const e of ie)
    t.push({ key: ne(e.letter), label: e.nameNikud, group: "letters" });
  for (const e of R)
    t.push({ key: ae(e.id), label: `${e.nameNikud} (${e.sound})`, group: "nikud" });
  for (const e of se)
    for (const n of R)
      t.push({
        key: oe(e, n.id),
        label: K(e, n.symbol),
        group: "syllables"
      });
  return t;
}
function Ve(t) {
  const e = re().find((a) => a.key === t);
  if (e) return e.label;
  const [, ...n] = t.split(":");
  return n.join(":");
}
function ve() {
  return typeof navigator < "u" && navigator.onLine === !1;
}
async function $(t, e = void 0) {
  try {
    return typeof indexedDB > "u" ? !1 : await (e ? V(T, t, e) : V(T, t));
  } catch {
    return !1;
  }
}
async function C(t) {
  if (ve() && !ke()) return !1;
  try {
    return await t(), M.audioState !== "failed" && M.audioState !== "unsupported";
  } catch {
    return !1;
  }
}
function ke() {
  return typeof speechSynthesis < "u";
}
async function Te() {
  try {
    return typeof indexedDB > "u" ? [] : await W(T);
  } catch {
    return [];
  }
}
async function qe(t) {
  if (await $(ne(t))) return "bank";
  const e = O(t), n = e ? e.nameNikud : t;
  return await C(() => M.speak(n)) ? "tts" : e && await I(e.sound, "a", { durationMs: 400 }) ? "synth" : "none";
}
async function Be(t) {
  if (await $(ae(t))) return "bank";
  if (await C(() => M.speakVowel(t))) return "tts";
  const e = G[t];
  return e && await be(e) ? "synth" : "none";
}
async function $e(t, e, n = {}) {
  const { signal: a } = n;
  if (a != null && a.aborted) return "none";
  if (await $(oe(t, e), a ? n : void 0)) return "bank";
  if (a != null && a.aborted) return "none";
  const o = R.find((c) => c.id === e), r = () => M.cancel();
  a == null || a.addEventListener("abort", r, { once: !0 });
  try {
    if (o && await C(() => M.speakNikud(t, o.symbol)))
      return a != null && a.aborted ? "none" : "tts";
  } finally {
    a == null || a.removeEventListener("abort", r);
  }
  if (a != null && a.aborted) return "none";
  const l = O(t), i = G[e];
  return i && await (a ? I(l ? l.sound : "", i, n) : I(l ? l.sound : "", i)) ? "synth" : "none";
}
async function Ce(t) {
  return await $(we(t)) ? "bank" : await C(() => M.speak(t)) ? "tts" : "none";
}
const Q = "alefbet.ttsProxyUrl";
function Se() {
  var r, l;
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
  ), n = (r = window.localStorage) == null ? void 0 : r.getItem(Q), a = (l = window.localStorage) == null ? void 0 : l.getItem("alefbet.nakdanProxyUrl"), o = t || e || n || a;
  return o ? String(o).replace(/\/+$/, "") : null;
}
function Fe(t) {
  const [e, n, a] = t.split(":");
  if (e === "letter") {
    const o = O(n);
    return o ? o.nameNikud : null;
  }
  if (e === "nikud") {
    const o = R.find((r) => r.id === n);
    return o ? o.sound : null;
  }
  if (e === "syllable") {
    const o = R.find((r) => r.id === a);
    return o ? K(n, o.symbol) : null;
  }
  return e === "word" && t.slice(5) || null;
}
async function ze(t, e) {
  const n = await fetch(`${t}/tts?text=${encodeURIComponent(e)}&lang=he`);
  if (!n.ok) throw new Error(`tts-proxy ${n.status}`);
  const a = await n.blob();
  if (!a || a.size === 0) throw new Error("empty-audio");
  return a;
}
async function Pe({ force: t = !1, extraTexts: e = [], onProgress: n } = {}) {
  const a = Se();
  if (!a)
    throw new Error("tts-proxy-not-configured: הגדירו כתובת דרך ?ttsProxy=... או window.ALEFBET_TTS_PROXY_URL");
  if (typeof indexedDB > "u")
    throw new Error("indexeddb-unavailable: אין אחסון מקומי לשמירת הצלילים");
  const o = [
    ...re().map((c) => c.key),
    ...e.filter((c) => c == null ? void 0 : c.trim()).map((c) => `word:${c}`)
  ], r = new Set(t ? [] : await W(T).catch(() => [])), l = { total: o.length, compiled: 0, skipped: 0, failures: [] };
  let i = 0;
  for (const c of o) {
    if (i++, r.has(c)) {
      l.skipped++, n == null || n(i, o.length, c);
      continue;
    }
    const s = Fe(c);
    if (!s) {
      l.failures.push({ key: c, reason: "unknown-key" }), n == null || n(i, o.length, c);
      continue;
    }
    try {
      const d = await ze(a, s);
      await le(T, c, d), l.compiled++;
    } catch (d) {
      l.failures.push({ key: c, reason: (d == null ? void 0 : d.message) || "fetch-failed" });
    }
    n == null || n(i, o.length, c);
  }
  return l;
}
function He(t, e) {
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
  const a = new URLSearchParams(window.location.search), o = a.get("allowedNikud") ? a.get("allowedNikud").split(",") : [];
  let r = `
    <div style="background:white; padding:1.5rem; border-radius:1rem; min-width:300px; text-align:center; color:#333; font-family:Heebo,Arial; direction:rtl;">
      <h2 style="margin-top:0">בחר ניקוד</h2>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; margin:1rem 0; text-align:right;">
  `;
  R.forEach((s) => {
    const d = o.length === 0 || o.includes(s.id) || o.includes(s.name);
    r += `
      <label style="display:flex; align-items:center; gap:0.5rem; cursor:pointer;">
        <input type="checkbox" value="${s.id}" class="nikud-filter-cb" ${d ? "checked" : ""} style="width:1.2rem;height:1.2rem;">
        <span>${s.nameNikud}</span>
      </label>
    `;
  });
  const l = parseFloat(localStorage.getItem("alefbet.nikudRate")) || 0.5;
  r += `
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
  `, n.innerHTML = r, n.style.display = "flex";
  const i = (
    /** @type {HTMLInputElement} */
    document.getElementById("nikud-rate-slider")
  ), c = document.getElementById("nikud-rate-val");
  i.oninput = () => {
    c.textContent = i.value;
  }, document.getElementById("save-settings-btn").onclick = () => {
    const s = parseFloat(i.value);
    localStorage.setItem("alefbet.nikudRate", String(s)), M.setNikudEmphasis({ rate: s });
    const d = Array.from(n.querySelectorAll(".nikud-filter-cb")).filter((g) => (
      /** @type {HTMLInputElement} */
      g.checked
    )).map((g) => (
      /** @type {HTMLInputElement} */
      g.value
    )), p = new URL(window.location.href);
    d.length > 0 && d.length < R.length ? p.searchParams.set("allowedNikud", d.join(",")) : p.searchParams.delete("allowedNikud"), p.searchParams.delete("excludedNikud"), n.style.display = "none", window.history.replaceState({}, "", p), e && e(t);
  }, document.getElementById("close-settings-btn").onclick = () => {
    n.style.display = "none";
  };
}
function Me(t, e, n, a, o) {
  return t.map((r) => {
    const l = a > 0 ? (r.x - e) / a * 100 : 0, i = o > 0 ? (r.y - n) / o * 100 : 0;
    return `${l},${i}`;
  }).join(" ");
}
function De(t, e) {
  const {
    image: n,
    zones: a = [],
    mode: o = "quiz",
    gameId: r,
    roundId: l,
    onCorrect: i,
    onWrong: c,
    onAllCorrect: s,
    onZoneTap: d,
    showZones: p = !1,
    autoPlayInstruction: g = !0,
    hintAfter: F = 3
  } = e, k = H();
  let m = H();
  k.use(() => m.dispose());
  const b = o === "soundboard", y = document.createElement("div");
  y.className = "ab-zp-wrap";
  const A = document.createElement("img");
  A.className = "ab-zp-image", A.src = n, A.alt = "", A.draggable = !1, y.appendChild(A);
  const z = document.createElement("div");
  z.className = "ab-zp-layer", y.appendChild(z), t.appendChild(y);
  const v = /* @__PURE__ */ new Set();
  let S = 0, _ = !1, E = !1;
  async function N(u) {
    if (!r || _) return;
    _ = !0;
    const f = m.signal;
    try {
      await V(r, `zone-${u}`, { signal: f });
    } catch {
    }
    f.aborted || (_ = !1);
  }
  function w() {
    if (E || F <= 0 || b || S < F) return;
    E = !0;
    const u = z.querySelectorAll(".ab-zp-zone");
    u.forEach((f, h) => {
      var L;
      (L = a[h]) != null && L.correct && !v.has(a[h].id) && f.classList.add("ab-zp-zone--hint");
    }), m.schedule(() => {
      u.forEach((f) => f.classList.remove("ab-zp-zone--hint")), E = !1, S = 0;
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
      if (d && d(u), N(u.id), b) {
        f.classList.add("ab-zp-zone--tapped"), m.schedule(() => f.classList.remove("ab-zp-zone--tapped"), 400);
        return;
      }
      if (!v.has(u.id))
        if (u.correct) {
          v.add(u.id), f.classList.add("ab-zp-zone--correct"), i && i(u);
          const h = a.filter((L) => L.correct).length;
          v.size >= h && s && s();
        } else
          f.classList.add("ab-zp-zone--wrong"), S++, c && c(u), m.schedule(() => f.classList.remove("ab-zp-zone--wrong"), 600), w();
    }), z.appendChild(f);
  }), g && r && l && m.schedule(() => {
    V(r, l, { signal: m.signal }).catch(() => {
    });
  }, 400), {
    async playInstruction() {
      return r && l ? V(r, l, { signal: m.signal }) : !1;
    },
    async playZoneAudio(u) {
      return r ? V(r, `zone-${u}`, { signal: m.signal }) : !1;
    },
    revealCorrect() {
      z.querySelectorAll(".ab-zp-zone").forEach((u, f) => {
        var h;
        (h = a[f]) != null && h.correct && u.classList.add("ab-zp-zone--revealed");
      });
    },
    reset() {
      k.signal.aborted || (m.dispose(), m = H(), _ = !1, v.clear(), S = 0, E = !1, z.querySelectorAll(".ab-zp-zone").forEach((u) => {
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
export {
  We as EventBus,
  Ze as GameShell,
  Ye as GameState,
  G as NIKUD_VOWEL,
  Xe as PRAISE_PHRASES,
  Je as RETRY_HINTS,
  T as SOUND_BANK_ID,
  Z as VOWEL_TEMPLATES,
  Ht as addNikud,
  et as animate,
  Ge as attachGameAudio,
  tt as bootstrapGame,
  de as classifyFormants,
  Pe as compileSoundBank,
  Fe as compileTextForKey,
  me as consonantOnsetSpec,
  nt as createChoiceRound,
  Et as createDragSource,
  Lt as createDropTarget,
  at as createFeedback,
  ot as createHintTracker,
  xt as createLocalState,
  rt as createOptionCards,
  it as createProgressBar,
  st as createRoundManager,
  H as createRoundScope,
  Vt as createVoiceRecordButton,
  Tt as createVoiceRecorder,
  _e as createVowelDetector,
  ct as createZone,
  De as createZonePlayer,
  qt as deleteVoice,
  lt as endGame,
  j as ensureAudioRunning,
  fe as extractFormantsFromSpectrum,
  dt as getAllProgress,
  ce as getAudioContext,
  ut as getGameProgress,
  O as getLetter,
  Ue as getLettersByGroup,
  Dt as getNikud,
  Bt as hasVoice,
  ie as hebrewLetters,
  ft as hideLoadingScreen,
  pt as injectHeaderButton,
  mt as installGlobalErrorScreen,
  ve as isOffline,
  Ne as isSynthSupported,
  $t as isVoiceRecordingSupported,
  It as isVowelized,
  Ve as keyLabel,
  ne as letterKey,
  K as letterWithNikud,
  W as listVoiceKeys,
  Ct as loadVoice,
  ht as lockPageZoom,
  Re as matchNikudVowel,
  yt as mountAudioStatusBanner,
  se as nikudBaseLetters,
  ae as nikudKey,
  R as nikudList,
  Rt as playBlob,
  V as playVoice,
  Ot as preloadNikud,
  Qe as randomLetters,
  Ke as randomNikud,
  bt as randomPraise,
  gt as randomRetryHint,
  wt as recordGameResult,
  Te as recordedKeys,
  Se as resolveTtsProxyUrl,
  vt as runGame,
  le as saveVoice,
  kt as showCompletionScreen,
  St as showLoadingScreen,
  He as showNikudSettingsDialog,
  Ft as shuffle,
  zt as sounds,
  qe as speakLetter,
  Be as speakNikudSound,
  $e as speakSyllable,
  Ce as speakWord,
  re as standardSoundKeys,
  Mt as starsFor,
  oe as syllableKey,
  I as synthesizeSyllable,
  be as synthesizeVowel,
  M as tts,
  _t as unlockAudioOutput,
  B as vowelFormantSpec,
  we as wordKey
};
