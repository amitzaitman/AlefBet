import { g as O, n as q, t as S, h as ne, a as ae, l as oe } from "./game-audio-CIXXhVEq.js";
import { b as xe, c as $e, r as He, d as De } from "./game-audio-CIXXhVEq.js";
import { createRoundScope as $ } from "./common.js";
import { EventBus as Qe, GameShell as Ie, GameState as Oe, PRAISE_PHRASES as Ue, RETRY_HINTS as Ke, animate as je, bootstrapGame as We, createChoiceRound as Ze, createFeedback as Xe, createHintTracker as Ye, createOptionCards as Je, createProgressBar as et, createRoundManager as tt, createZone as nt, endGame as at, getAllProgress as ot, getGameProgress as rt, hideLoadingScreen as it, injectHeaderButton as st, installGlobalErrorScreen as ct, lockPageZoom as lt, mountAudioStatusBanner as dt, randomPraise as ut, randomRetryHint as ft, recordGameResult as pt, runGame as mt, showCompletionScreen as ht, showLoadingScreen as yt, shuffle as gt, sounds as bt, starsFor as vt } from "./common.js";
import { g as re, e as U } from "./drag-NEBgUr1u.js";
import { c as kt, a as Ft, b as Mt, p as zt, u as St } from "./drag-NEBgUr1u.js";
import { l as ie, p as _ } from "./voice-record-button-CVRCvvTy.js";
import { c as Et, a as Lt, d as Nt, h as Vt, i as Rt, b as _t, s as qt } from "./voice-record-button-CVRCvvTy.js";
import { addNikud as Ct, getNikud as Bt, isVowelized as Pt, preloadNikud as xt } from "./nakdan-DFzp_6d3.js";
const K = {
  a: { F1: 850, F2: 1400 },
  e: { F1: 550, F2: 2100 },
  i: { F1: 350, F2: 2700 },
  o: { F1: 550, F2: 1e3 },
  u: { F1: 350, F2: 850 }
}, Q = {
  kamatz: "a",
  patah: "a",
  tzere: "e",
  segol: "e",
  hiriq: "i",
  holam: "o",
  kubbutz: "u"
};
function se(t, e) {
  if (!Number.isFinite(t) || !Number.isFinite(e) || t <= 0 || e <= 0 || e <= t)
    return { vowel: "", confidence: 0 };
  const a = Math.log2(t), n = Math.log2(e), s = [];
  for (const [l, i] of Object.entries(K)) {
    const d = a - Math.log2(i.F1), p = n - Math.log2(i.F2);
    s.push({ vowel: l, dist: Math.sqrt(d * d + p * p) });
  }
  s.sort((l, i) => l.dist - i.dist);
  const o = s[0], c = s[1], r = c.dist === 0 ? 1 : Math.max(0, Math.min(1, 1 - o.dist / c.dist));
  return { vowel: o.vowel, confidence: r };
}
function Se(t, e) {
  return !t || !e ? !1 : Q[e] === t;
}
function ce(t, e) {
  const a = t.length, n = Math.max(1, Math.min(e, a)), s = new Float32Array(n);
  for (let r = 0; r < n; r++) {
    let l = 0;
    const i = Math.PI * r / a;
    for (let d = 0; d < a; d++)
      l += t[d] * Math.cos(i * (d + 0.5));
    s[r] = l;
  }
  const o = new Float32Array(a), c = 2 / a;
  for (let r = 0; r < a; r++) {
    let l = s[0] * 0.5;
    for (let i = 1; i < n; i++)
      l += s[i] * Math.cos(Math.PI * i * (r + 0.5) / a);
    o[r] = c * l;
  }
  return o;
}
function le(t, e) {
  if (!t || t.length === 0 || !Number.isFinite(e) || e <= 0)
    return { F1: 0, F2: 0 };
  const a = ce(t, 80), n = Math.min(a.length - 3, Math.floor(3500 / e)), s = [];
  for (let i = 3; i <= n; i++) {
    const d = a[i];
    d > a[i - 1] && d > a[i - 2] && d > a[i + 1] && d > a[i + 2] && s.push({ freq: i * e, mag: d });
  }
  if (s.length === 0) return { F1: 0, F2: 0 };
  const o = s.filter((i) => i.freq >= 200 && i.freq <= 1100);
  if (o.length === 0) return { F1: 0, F2: 0 };
  o.sort((i, d) => d.mag - i.mag);
  const c = o[0].freq, r = Math.max(c + 250, 700), l = s.filter((i) => i.freq >= r && i.freq <= 3500);
  return l.length === 0 ? { F1: c, F2: 0 } : (l.sort((i, d) => d.mag - i.mag), { F1: c, F2: l[0].freq });
}
function Ae() {
  var c;
  const t = typeof window < "u", e = t && !!((c = navigator == null ? void 0 : navigator.mediaDevices) != null && c.getUserMedia), a = t ? window.AudioContext || window.webkitAudioContext : null, n = e && !!a;
  let s = null;
  const o = () => ({ vowel: "", confidence: 0, F1: 0, F2: 0 });
  return {
    available: n,
    listen(r = 3e3) {
      return s == null || s(), n ? new Promise((l) => {
        let i = !1, d = null, p = null, b = null;
        const M = (m) => {
          var g;
          if (!i) {
            i = !0, b !== null && cancelAnimationFrame(b), d == null || d.getTracks().forEach((y) => {
              try {
                y.stop();
              } catch {
              }
            });
            try {
              (g = p == null ? void 0 : p.close()) == null || g.catch(() => {
              });
            } catch {
            }
            s === k && (s = null), l(m);
          }
        }, k = () => M(o());
        s = k, Promise.resolve().then(() => navigator.mediaDevices.getUserMedia({ audio: !0 })).then((m) => {
          if (i) {
            m.getTracks().forEach((R) => {
              try {
                R.stop();
              } catch {
              }
            });
            return;
          }
          d = m, p = new a();
          const g = p.createMediaStreamSource(d), y = p.createAnalyser();
          y.fftSize = 4096, y.smoothingTimeConstant = 0.2, g.connect(y);
          const A = p.sampleRate / y.fftSize, z = new Float32Array(y.frequencyBinCount), w = new Float32Array(y.fftSize), F = [], V = performance.now(), E = () => {
            if (i) return;
            if (performance.now() - V > r) {
              if (F.length < 3) {
                M(o());
                return;
              }
              const v = F.map((N) => N.F1).sort((N, x) => N - x), u = F.map((N) => N.F2).sort((N, x) => N - x), f = Math.floor(F.length / 2), h = v[f], L = u[f];
              M({ ...se(h, L), F1: h, F2: L });
              return;
            }
            y.getFloatTimeDomainData(w);
            let R = 0;
            for (let v = 0; v < w.length; v++) R += w[v] * w[v];
            if (Math.sqrt(R / w.length) > 0.015) {
              y.getFloatFrequencyData(z);
              const { F1: v, F2: u } = le(z, A);
              v > 0 && u > 0 && u > v && F.push({ F1: v, F2: u });
            }
            b = requestAnimationFrame(E);
          };
          b = requestAnimationFrame(E);
        }).catch(() => M(o()));
      }) : Promise.resolve(o());
    },
    cancel() {
      s == null || s();
    }
  };
}
const j = 210, W = 550, de = {
  a: { F3: 2700, bandwidths: [90, 110, 170], gains: [1, 0.5, 0.15] },
  e: { F3: 2900, bandwidths: [80, 100, 160], gains: [1, 0.55, 0.2] },
  i: { F3: 3300, bandwidths: [60, 100, 160], gains: [1, 0.6, 0.25] },
  o: { F3: 2600, bandwidths: [80, 90, 150], gains: [1, 0.5, 0.1] },
  u: { F3: 2400, bandwidths: [60, 80, 140], gains: [1, 0.45, 0.1] }
};
function C(t) {
  const e = K[t], a = de[t];
  return !e || !a ? null : {
    formants: [e.F1, e.F2, a.F3],
    bandwidths: [...a.bandwidths],
    gains: [...a.gains]
  };
}
const I = {
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
function ue(t) {
  return I[t] ?? I[""];
}
function Ee() {
  return re() !== null;
}
let T = null;
function fe(t) {
  if (T && T.sampleRate === t.sampleRate) return T;
  const e = t.sampleRate, a = t.createBuffer(1, e, t.sampleRate), n = a.getChannelData(0);
  for (let s = 0; s < e; s++) n[s] = Math.random() * 2 - 1;
  return T = a, a;
}
function Z(t, e, a, n = t.destination) {
  const s = t.createOscillator();
  s.type = "sawtooth", s.frequency.value = a;
  const o = t.createGain();
  o.gain.value = 0;
  const c = e.formants.map((r, l) => {
    const i = t.createBiquadFilter();
    i.type = "bandpass", i.frequency.value = r, i.Q.value = r / e.bandwidths[l];
    const d = t.createGain();
    return d.gain.value = e.gains[l], s.connect(i), i.connect(d), d.connect(o), i;
  });
  return o.connect(n), { source: s, filters: c, master: o };
}
function H(t, e, a, n, s = t.destination) {
  const o = a.durationMs / 1e3, c = t.createBufferSource();
  c.buffer = fe(t), c.loop = !0;
  const r = t.createBiquadFilter();
  r.type = "bandpass", r.frequency.value = a.noiseHz ?? 2e3, r.Q.value = a.noiseQ ?? 1;
  const l = t.createGain();
  return l.gain.setValueAtTime(0, e), l.gain.linearRampToValueAtTime(n, e + Math.min(0.01, o / 3)), l.gain.linearRampToValueAtTime(1e-4, e + o), c.connect(r), r.connect(l), l.connect(s), c.start(e), c.stop(e + o + 0.02), e + o;
}
function X(t, e, a, n, s, o, c = t.destination) {
  const r = n / 1e3, { source: l, filters: i, master: d } = Z(t, a, s, c);
  if (l.frequency.setValueAtTime(s * 1.04, e), l.frequency.linearRampToValueAtTime(s * 0.92, e + r), o) {
    const M = Math.min(0.09, r / 3);
    i.forEach((k, m) => {
      const g = o[m];
      g && (k.frequency.setValueAtTime(g, e), k.frequency.exponentialRampToValueAtTime(a.formants[m], e + M));
    });
  }
  const p = 0.04, b = 0.12;
  return d.gain.setValueAtTime(0, e), d.gain.linearRampToValueAtTime(0.5, e + p), d.gain.setValueAtTime(0.5, e + r - b), d.gain.linearRampToValueAtTime(1e-4, e + r), l.start(e), l.stop(e + r + 0.05), e + r;
}
function pe(t, e, a, n, s = t.destination) {
  const o = a / 1e3, c = { formants: [250, 1100, 2200], bandwidths: [80, 200, 300], gains: [1, 0.12, 0.05] }, { source: r, master: l } = Z(t, c, n, s);
  return l.gain.setValueAtTime(0, e), l.gain.linearRampToValueAtTime(0.35, e + 0.02), l.gain.setValueAtTime(0.35, e + o - 0.02), l.gain.linearRampToValueAtTime(1e-4, e + o), r.start(e), r.stop(e + o + 0.05), e + o;
}
function Y(t, e, a, n) {
  const s = Math.max(0, (e - t.currentTime) * 1e3) + 60;
  return new Promise((o) => {
    const c = () => {
      clearTimeout(r), n == null || n.removeEventListener("abort", c), a.disconnect(), o(!(n != null && n.aborted));
    }, r = setTimeout(c, s);
    n == null || n.addEventListener("abort", c, { once: !0 }), n != null && n.aborted && c();
  });
}
async function me(t, e = {}) {
  var c, r;
  const a = C(t);
  if (!a || (c = e.signal) != null && c.aborted) return !1;
  const n = await U();
  if (!n || (r = e.signal) != null && r.aborted) return !1;
  let s, o;
  try {
    o = n.createGain(), o.connect(n.destination);
    const l = n.currentTime + 0.03;
    s = X(n, l, a, e.durationMs ?? W, e.pitchHz ?? j, null, o);
  } catch {
    return o == null || o.disconnect(), !1;
  }
  return Y(n, s, o, e.signal);
}
async function D(t, e, a = {}) {
  var d, p;
  const n = C(e);
  if (!n || (d = a.signal) != null && d.aborted) return !1;
  const s = await U();
  if (!s || (p = a.signal) != null && p.aborted) return !1;
  const o = ue(t), c = a.pitchHz ?? j, r = a.durationMs ?? W;
  let l, i;
  try {
    i = s.createGain(), i.connect(s.destination), l = he(s, o, t, n, r, c, i);
  } catch {
    return i == null || i.disconnect(), !1;
  }
  return Y(s, l, i, a.signal);
}
function he(t, e, a, n, s, o, c = t.destination) {
  let r = t.currentTime + 0.03, l = null;
  switch (e.type) {
    case "plosive": {
      r = H(t, r, e, e.voiced ? 0.25 : 0.35, c), r += 0.01;
      break;
    }
    case "fricative": {
      r = H(t, r, e, 0.22, c) - 0.03;
      break;
    }
    case "affricate": {
      r += 0.03, r = H(t, r, { ...e, durationMs: e.durationMs - 30 }, 0.3, c) - 0.02;
      break;
    }
    case "nasal": {
      r = pe(t, r, e.durationMs, o, c), l = [300, 1300, 2300];
      break;
    }
    case "liquid": {
      l = a === "r" ? [450, 1300, 1600] : [380, 1e3, 2600];
      break;
    }
    case "glide": {
      const i = C(a === "y" ? "i" : "u");
      l = i ? i.formants : null;
      break;
    }
  }
  return X(t, r, n, s, o, l, c);
}
const G = "sound-bank";
function J(t) {
  return `letter:${t}`;
}
function ee(t) {
  return `nikud:${t}`;
}
function te(t, e) {
  return `syllable:${t}:${e}`;
}
function ye(t) {
  return `word:${t}`;
}
function ge() {
  const t = [];
  for (const e of ne)
    t.push({ key: J(e.letter), label: e.nameNikud, group: "letters" });
  for (const e of q)
    t.push({ key: ee(e.id), label: `${e.nameNikud} (${e.sound})`, group: "nikud" });
  for (const e of ae)
    for (const a of q)
      t.push({
        key: te(e, a.id),
        label: oe(e, a.symbol),
        group: "syllables"
      });
  return t;
}
function Le(t) {
  const e = ge().find((n) => n.key === t);
  if (e) return e.label;
  const [, ...a] = t.split(":");
  return a.join(":");
}
function be() {
  return typeof navigator < "u" && navigator.onLine === !1;
}
async function B(t, e = void 0) {
  try {
    return typeof indexedDB > "u" ? !1 : await (e ? _(G, t, e) : _(G, t));
  } catch {
    return !1;
  }
}
async function P(t) {
  if (be() && !ve()) return !1;
  try {
    return await t(), S.audioState !== "failed" && S.audioState !== "unsupported";
  } catch {
    return !1;
  }
}
function ve() {
  return typeof speechSynthesis < "u";
}
async function Ne() {
  try {
    return typeof indexedDB > "u" ? [] : await ie(G);
  } catch {
    return [];
  }
}
async function Ve(t) {
  if (await B(J(t))) return "bank";
  const e = O(t), a = e ? e.nameNikud : t;
  return await P(() => S.speak(a)) ? "tts" : e && await D(e.sound, "a", { durationMs: 400 }) ? "synth" : "none";
}
async function Re(t) {
  if (await B(ee(t))) return "bank";
  if (await P(() => S.speakVowel(t))) return "tts";
  const e = Q[t];
  return e && await me(e) ? "synth" : "none";
}
async function _e(t, e, a = {}) {
  const { signal: n } = a;
  if (n != null && n.aborted) return "none";
  if (await B(te(t, e), n ? a : void 0)) return "bank";
  if (n != null && n.aborted) return "none";
  const s = q.find((l) => l.id === e), o = () => S.cancel();
  n == null || n.addEventListener("abort", o, { once: !0 });
  try {
    if (s && await P(() => S.speakNikud(t, s.symbol)))
      return n != null && n.aborted ? "none" : "tts";
  } finally {
    n == null || n.removeEventListener("abort", o);
  }
  if (n != null && n.aborted) return "none";
  const c = O(t), r = Q[e];
  return r && await (n ? D(c ? c.sound : "", r, a) : D(c ? c.sound : "", r)) ? "synth" : "none";
}
async function qe(t) {
  return await B(ye(t)) ? "bank" : await P(() => S.speak(t)) ? "tts" : "none";
}
function Te(t, e) {
  let a = document.getElementById("nikud-settings");
  a || (a = document.createElement("div"), a.id = "nikud-settings", Object.assign(a.style, {
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
  }), document.body.appendChild(a));
  const n = new URLSearchParams(window.location.search), s = n.get("allowedNikud") ? n.get("allowedNikud").split(",") : [];
  let o = `
    <div style="background:white; padding:1.5rem; border-radius:1rem; min-width:300px; text-align:center; color:#333; font-family:Heebo,Arial; direction:rtl;">
      <h2 style="margin-top:0">בחר ניקוד</h2>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; margin:1rem 0; text-align:right;">
  `;
  q.forEach((i) => {
    const d = s.length === 0 || s.includes(i.id) || s.includes(i.name);
    o += `
      <label style="display:flex; align-items:center; gap:0.5rem; cursor:pointer;">
        <input type="checkbox" value="${i.id}" class="nikud-filter-cb" ${d ? "checked" : ""} style="width:1.2rem;height:1.2rem;">
        <span>${i.nameNikud}</span>
      </label>
    `;
  });
  const c = parseFloat(localStorage.getItem("alefbet.nikudRate")) || 0.5;
  o += `
      </div>
      <div style="margin:1rem 0; text-align:right;">
        <label style="font-weight:700; font-size:0.95rem;">מהירות הגייה: <span id="nikud-rate-val">${c}</span></label>
        <input type="range" id="nikud-rate-slider" min="0.3" max="1.5" step="0.1" value="${c}" style="width:100%; margin-top:0.3rem; accent-color:#4f67ff;">
        <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:#888;">
          <span>אִטִּי</span>
          <span>מָהִיר</span>
        </div>
      </div>
      <button id="save-settings-btn" style="padding:0.5rem 1rem; border-radius:0.5rem; background:#4f67ff; color:white; border:none; font-size:1.1rem; cursor:pointer;">שמור והתחל מחדש</button>
      <button id="close-settings-btn" style="padding:0.5rem 1rem; border-radius:0.5rem; background:#ddd; color:#333; border:none; font-size:1.1rem; cursor:pointer; margin-right:0.5rem;">ביטול</button>
    </div>
  `, a.innerHTML = o, a.style.display = "flex";
  const r = (
    /** @type {HTMLInputElement} */
    document.getElementById("nikud-rate-slider")
  ), l = document.getElementById("nikud-rate-val");
  r.oninput = () => {
    l.textContent = r.value;
  }, document.getElementById("save-settings-btn").onclick = () => {
    const i = parseFloat(r.value);
    localStorage.setItem("alefbet.nikudRate", String(i)), S.setNikudEmphasis({ rate: i });
    const d = Array.from(a.querySelectorAll(".nikud-filter-cb")).filter((b) => (
      /** @type {HTMLInputElement} */
      b.checked
    )).map((b) => (
      /** @type {HTMLInputElement} */
      b.value
    )), p = new URL(window.location.href);
    d.length > 0 && d.length < q.length ? p.searchParams.set("allowedNikud", d.join(",")) : p.searchParams.delete("allowedNikud"), p.searchParams.delete("excludedNikud"), a.style.display = "none", window.history.replaceState({}, "", p), e && e(t);
  }, document.getElementById("close-settings-btn").onclick = () => {
    a.style.display = "none";
  };
}
function we(t, e, a, n, s) {
  return t.map((o) => {
    const c = n > 0 ? (o.x - e) / n * 100 : 0, r = s > 0 ? (o.y - a) / s * 100 : 0;
    return `${c},${r}`;
  }).join(" ");
}
function Ce(t, e) {
  const {
    image: a,
    zones: n = [],
    mode: s = "quiz",
    gameId: o,
    roundId: c,
    onCorrect: r,
    onWrong: l,
    onAllCorrect: i,
    onZoneTap: d,
    showZones: p = !1,
    autoPlayInstruction: b = !0,
    hintAfter: M = 3
  } = e, k = $();
  let m = $();
  k.use(() => m.dispose());
  const g = s === "soundboard", y = document.createElement("div");
  y.className = "ab-zp-wrap";
  const A = document.createElement("img");
  A.className = "ab-zp-image", A.src = a, A.alt = "", A.draggable = !1, y.appendChild(A);
  const z = document.createElement("div");
  z.className = "ab-zp-layer", y.appendChild(z), t.appendChild(y);
  const w = /* @__PURE__ */ new Set();
  let F = 0, V = !1, E = !1;
  async function R(u) {
    if (!o || V) return;
    V = !0;
    const f = m.signal;
    try {
      await _(o, `zone-${u}`, { signal: f });
    } catch {
    }
    f.aborted || (V = !1);
  }
  function v() {
    if (E || M <= 0 || g || F < M) return;
    E = !0;
    const u = z.querySelectorAll(".ab-zp-zone");
    u.forEach((f, h) => {
      var L;
      (L = n[h]) != null && L.correct && !w.has(n[h].id) && f.classList.add("ab-zp-zone--hint");
    }), m.schedule(() => {
      u.forEach((f) => f.classList.remove("ab-zp-zone--hint")), E = !1, F = 0;
    }, 1500);
  }
  return n.forEach((u) => {
    const f = document.createElement("button");
    if (f.className = "ab-zp-zone", (p || g) && f.classList.add("ab-zp-zone--visible"), g && f.classList.add("ab-zp-zone--soundboard"), f.style.left = `${u.x}%`, f.style.top = `${u.y}%`, f.style.width = `${u.width}%`, f.style.height = `${u.height}%`, f.setAttribute("aria-label", u.label || (u.correct ? "correct zone" : "zone")), u.shape === "polygon" && u.points && u.points.length >= 3) {
      const h = `zp-clip-${u.id}`;
      f.innerHTML = `<svg class="ab-zp-zone__poly-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs><clipPath id="${h}"><polygon points="${we(u.points, u.x, u.y, u.width, u.height)}"/></clipPath></defs>
        <rect x="0" y="0" width="100" height="100" clip-path="url(#${h})" fill="transparent"/>
      </svg>`, f.classList.add("ab-zp-zone--poly");
    }
    if (g && u.label) {
      const h = document.createElement("span");
      h.className = "ab-zp-zone__label", h.textContent = u.label, f.appendChild(h);
    }
    k.listen(f, "click", () => {
      if (d && d(u), R(u.id), g) {
        f.classList.add("ab-zp-zone--tapped"), m.schedule(() => f.classList.remove("ab-zp-zone--tapped"), 400);
        return;
      }
      if (!w.has(u.id))
        if (u.correct) {
          w.add(u.id), f.classList.add("ab-zp-zone--correct"), r && r(u);
          const h = n.filter((L) => L.correct).length;
          w.size >= h && i && i();
        } else
          f.classList.add("ab-zp-zone--wrong"), F++, l && l(u), m.schedule(() => f.classList.remove("ab-zp-zone--wrong"), 600), v();
    }), z.appendChild(f);
  }), b && o && c && m.schedule(() => {
    _(o, c, { signal: m.signal }).catch(() => {
    });
  }, 400), {
    async playInstruction() {
      return o && c ? _(o, c, { signal: m.signal }) : !1;
    },
    async playZoneAudio(u) {
      return o ? _(o, `zone-${u}`, { signal: m.signal }) : !1;
    },
    revealCorrect() {
      z.querySelectorAll(".ab-zp-zone").forEach((u, f) => {
        var h;
        (h = n[f]) != null && h.correct && u.classList.add("ab-zp-zone--revealed");
      });
    },
    reset() {
      k.signal.aborted || (m.dispose(), m = $(), V = !1, w.clear(), F = 0, E = !1, z.querySelectorAll(".ab-zp-zone").forEach((u) => {
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
  Qe as EventBus,
  Ie as GameShell,
  Oe as GameState,
  Q as NIKUD_VOWEL,
  Ue as PRAISE_PHRASES,
  Ke as RETRY_HINTS,
  G as SOUND_BANK_ID,
  K as VOWEL_TEMPLATES,
  Ct as addNikud,
  je as animate,
  xe as attachGameAudio,
  We as bootstrapGame,
  se as classifyFormants,
  ue as consonantOnsetSpec,
  Ze as createChoiceRound,
  kt as createDragSource,
  Ft as createDropTarget,
  Xe as createFeedback,
  Ye as createHintTracker,
  Mt as createLocalState,
  Je as createOptionCards,
  et as createProgressBar,
  tt as createRoundManager,
  $ as createRoundScope,
  Et as createVoiceRecordButton,
  Lt as createVoiceRecorder,
  Ae as createVowelDetector,
  nt as createZone,
  Ce as createZonePlayer,
  Nt as deleteVoice,
  at as endGame,
  U as ensureAudioRunning,
  le as extractFormantsFromSpectrum,
  ot as getAllProgress,
  re as getAudioContext,
  rt as getGameProgress,
  O as getLetter,
  $e as getLettersByGroup,
  Bt as getNikud,
  Vt as hasVoice,
  ne as hebrewLetters,
  it as hideLoadingScreen,
  st as injectHeaderButton,
  ct as installGlobalErrorScreen,
  be as isOffline,
  Ee as isSynthSupported,
  Rt as isVoiceRecordingSupported,
  Pt as isVowelized,
  Le as keyLabel,
  J as letterKey,
  oe as letterWithNikud,
  ie as listVoiceKeys,
  _t as loadVoice,
  lt as lockPageZoom,
  Se as matchNikudVowel,
  dt as mountAudioStatusBanner,
  ae as nikudBaseLetters,
  ee as nikudKey,
  q as nikudList,
  zt as playBlob,
  _ as playVoice,
  xt as preloadNikud,
  He as randomLetters,
  De as randomNikud,
  ut as randomPraise,
  ft as randomRetryHint,
  pt as recordGameResult,
  Ne as recordedKeys,
  mt as runGame,
  qt as saveVoice,
  ht as showCompletionScreen,
  yt as showLoadingScreen,
  Te as showNikudSettingsDialog,
  gt as shuffle,
  bt as sounds,
  Ve as speakLetter,
  Re as speakNikudSound,
  _e as speakSyllable,
  qe as speakWord,
  ge as standardSoundKeys,
  vt as starsFor,
  te as syllableKey,
  D as synthesizeSyllable,
  me as synthesizeVowel,
  S as tts,
  St as unlockAudioOutput,
  C as vowelFormantSpec,
  ye as wordKey
};
