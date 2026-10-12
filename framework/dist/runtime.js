import { g as K, n as C, t as R, h as ie, a as se, l as ce } from "./game-audio-DWDnzTwh.js";
import { b as We, c as Ke, r as Ze, d as Xe } from "./game-audio-DWDnzTwh.js";
import { playBlob as ue, getAudioContext as le, ensureAudioRunning as Z } from "./common.js";
import { EventBus as Je, GameShell as et, GameState as tt, PRAISE_PHRASES as nt, RETRY_HINTS as rt, animate as ot, bootstrapGame as at, createChoiceRound as it, createDragSource as st, createDropTarget as ct, createFeedback as ut, createHintTracker as lt, createLocalState as dt, createOptionCards as ft, createProgressBar as mt, createRoundManager as pt, createRoundScope as bt, endGame as ht, getAllProgress as yt, getGameProgress as vt, hideLoadingScreen as wt, injectHeaderButton as gt, installGlobalErrorScreen as kt, lockPageZoom as Mt, mountAudioStatusBanner as Ft, randomPraise as At, randomRetryHint as St, recordGameResult as Et, runGame as Rt, showCompletionScreen as Nt, showLoadingScreen as Vt, shuffle as _t, sounds as Lt, starsFor as Tt, unlockAudioOutput as Ct } from "./common.js";
import { addNikud as Bt, getNikud as xt, isVowelized as Pt, preloadNikud as zt } from "./nakdan-DFzp_6d3.js";
const X = {
  a: { F1: 850, F2: 1400 },
  e: { F1: 550, F2: 2100 },
  i: { F1: 350, F2: 2700 },
  o: { F1: 550, F2: 1e3 },
  u: { F1: 350, F2: 850 }
}, U = {
  kamatz: "a",
  patah: "a",
  tzere: "e",
  segol: "e",
  hiriq: "i",
  holam: "o",
  kubbutz: "u"
};
function de(e, t) {
  if (!Number.isFinite(e) || !Number.isFinite(t) || e <= 0 || t <= 0 || t <= e)
    return { vowel: "", confidence: 0 };
  const n = Math.log2(e), r = Math.log2(t), a = [];
  for (const [u, i] of Object.entries(X)) {
    const l = n - Math.log2(i.F1), d = r - Math.log2(i.F2);
    a.push({ vowel: u, dist: Math.sqrt(l * l + d * d) });
  }
  a.sort((u, i) => u.dist - i.dist);
  const c = a[0], s = a[1], o = s.dist === 0 ? 1 : Math.max(0, Math.min(1, 1 - c.dist / s.dist));
  return { vowel: c.vowel, confidence: o };
}
function qe(e, t) {
  return !e || !t ? !1 : U[t] === e;
}
function fe(e, t) {
  const n = e.length, r = Math.max(1, Math.min(t, n)), a = new Float32Array(r);
  for (let o = 0; o < r; o++) {
    let u = 0;
    const i = Math.PI * o / n;
    for (let l = 0; l < n; l++)
      u += e[l] * Math.cos(i * (l + 0.5));
    a[o] = u;
  }
  const c = new Float32Array(n), s = 2 / n;
  for (let o = 0; o < n; o++) {
    let u = a[0] * 0.5;
    for (let i = 1; i < r; i++)
      u += a[i] * Math.cos(Math.PI * i * (o + 0.5) / n);
    c[o] = s * u;
  }
  return c;
}
function me(e, t) {
  if (!e || e.length === 0 || !Number.isFinite(t) || t <= 0)
    return { F1: 0, F2: 0 };
  const n = fe(e, 80), r = Math.min(n.length - 3, Math.floor(3500 / t)), a = [];
  for (let i = 3; i <= r; i++) {
    const l = n[i];
    l > n[i - 1] && l > n[i - 2] && l > n[i + 1] && l > n[i + 2] && a.push({ freq: i * t, mag: l });
  }
  if (a.length === 0) return { F1: 0, F2: 0 };
  const c = a.filter((i) => i.freq >= 200 && i.freq <= 1100);
  if (c.length === 0) return { F1: 0, F2: 0 };
  c.sort((i, l) => l.mag - i.mag);
  const s = c[0].freq, o = Math.max(s + 250, 700), u = a.filter((i) => i.freq >= o && i.freq <= 3500);
  return u.length === 0 ? { F1: s, F2: 0 } : (u.sort((i, l) => l.mag - i.mag), { F1: s, F2: u[0].freq });
}
function Be() {
  var s;
  const e = typeof window < "u", t = e && !!((s = navigator == null ? void 0 : navigator.mediaDevices) != null && s.getUserMedia), n = e ? window.AudioContext || window.webkitAudioContext : null, r = t && !!n;
  let a = null;
  const c = () => ({ vowel: "", confidence: 0, F1: 0, F2: 0 });
  return {
    available: r,
    listen(o = 3e3) {
      return a == null || a(), r ? new Promise((u) => {
        let i = !1, l = null, d = null, p = null;
        const m = (h) => {
          var w;
          if (!i) {
            i = !0, p !== null && cancelAnimationFrame(p), l == null || l.getTracks().forEach((b) => {
              try {
                b.stop();
              } catch {
              }
            });
            try {
              (w = d == null ? void 0 : d.close()) == null || w.catch(() => {
              });
            } catch {
            }
            a === v && (a = null), u(h);
          }
        }, v = () => m(c());
        a = v, Promise.resolve().then(() => navigator.mediaDevices.getUserMedia({ audio: !0 })).then((h) => {
          if (i) {
            h.getTracks().forEach((L) => {
              try {
                L.stop();
              } catch {
              }
            });
            return;
          }
          l = h, d = new n();
          const w = d.createMediaStreamSource(l), b = d.createAnalyser();
          b.fftSize = 4096, b.smoothingTimeConstant = 0.2, w.connect(b);
          const N = d.sampleRate / b.fftSize, A = new Float32Array(b.frequencyBinCount), S = new Float32Array(b.fftSize), E = [], H = performance.now(), q = () => {
            if (i) return;
            if (performance.now() - H > o) {
              if (E.length < 3) {
                m(c());
                return;
              }
              const y = E.map((M) => M.F1).sort((M, k) => M - k), V = E.map((M) => M.F2).sort((M, k) => M - k), f = Math.floor(E.length / 2), g = y[f], _ = V[f];
              m({ ...de(g, _), F1: g, F2: _ });
              return;
            }
            b.getFloatTimeDomainData(S);
            let L = 0;
            for (let y = 0; y < S.length; y++) L += S[y] * S[y];
            if (Math.sqrt(L / S.length) > 0.015) {
              b.getFloatFrequencyData(A);
              const { F1: y, F2: V } = me(A, N);
              y > 0 && V > 0 && V > y && E.push({ F1: y, F2: V });
            }
            p = requestAnimationFrame(q);
          };
          p = requestAnimationFrame(q);
        }).catch(() => m(c()));
      }) : Promise.resolve(c());
    },
    cancel() {
      a == null || a();
    }
  };
}
function pe() {
  return ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/ogg"].find((t) => MediaRecorder.isTypeSupported(t)) || "";
}
function be() {
  var e;
  return typeof navigator < "u" && typeof ((e = navigator.mediaDevices) == null ? void 0 : e.getUserMedia) == "function" && typeof MediaRecorder < "u";
}
function he() {
  let e = null, t = null, n = [], r = 0, a = null;
  function c() {
    if ((e == null ? void 0 : e.state) === "recording") return Promise.resolve();
    if (a) return a;
    const l = ++r, d = (async () => {
      const p = await navigator.mediaDevices.getUserMedia({ audio: !0, video: !1 });
      if (l !== r)
        throw p.getTracks().forEach((m) => m.stop()), new DOMException("Recording cancelled", "AbortError");
      t = p, n = [];
      try {
        const m = pe();
        e = new MediaRecorder(p, m ? { mimeType: m } : {}), e.ondataavailable = (v) => {
          var h;
          ((h = v.data) == null ? void 0 : h.size) > 0 && n.push(v.data);
        }, e.start(100);
      } catch (m) {
        throw u(), m;
      }
    })();
    return a = d, d.finally(() => {
      a === d && (a = null);
    });
  }
  function s() {
    return new Promise((l, d) => {
      if (!e || e.state === "inactive") {
        d(new Error("[voice-recorder] not recording"));
        return;
      }
      e.onstop = () => {
        const p = new Blob(n, { type: e.mimeType || "audio/webm" });
        u(), l(p);
      }, e.onerror = (p) => {
        u(), d(p.error);
      }, e.stop();
    });
  }
  function o() {
    r++, a = null, e && e.state !== "inactive" && (e.ondataavailable = null, e.onstop = null, e.stop()), u();
  }
  function u() {
    t == null || t.getTracks().forEach((l) => l.stop()), t = null, e = null, n = [];
  }
  function i() {
    return (e == null ? void 0 : e.state) === "recording";
  }
  return { start: c, stop: s, cancel: o, isActive: i };
}
const ye = "alefbet-voices", F = "recordings", ve = 1;
let T = null;
function P() {
  return T || (T = new Promise((e, t) => {
    const n = indexedDB.open(ye, ve);
    n.onupgradeneeded = () => {
      n.result.createObjectStore(F);
    }, n.onsuccess = () => e(n.result), n.onerror = () => {
      T = null, t(n.error);
    };
  }), T);
}
function j(e, t) {
  return `${e}/${t}`;
}
async function we(e, t, n) {
  const r = await P();
  return new Promise((a, c) => {
    const s = r.transaction(F, "readwrite");
    s.objectStore(F).put(n, j(e, t)), s.oncomplete = a, s.onerror = (o) => c(o.target.error);
  });
}
async function I(e, t) {
  const n = await P();
  return new Promise((r, a) => {
    const s = n.transaction(F, "readonly").objectStore(F).get(j(e, t));
    s.onsuccess = () => r(s.result ?? null), s.onerror = (o) => a(o.target.error);
  });
}
async function ge(e, t) {
  const n = await P();
  return new Promise((r, a) => {
    const c = n.transaction(F, "readwrite");
    c.objectStore(F).delete(j(e, t)), c.oncomplete = r, c.onerror = (s) => a(s.target.error);
  });
}
async function ke(e) {
  const t = await P();
  return new Promise((n, r) => {
    const c = t.transaction(F, "readonly").objectStore(F).getAllKeys();
    c.onsuccess = () => {
      const s = `${e}/`;
      n(
        (c.result || []).filter((o) => o.startsWith(s)).map((o) => o.slice(s.length))
      );
    }, c.onerror = (s) => r(s.target.error);
  });
}
async function G(e, t, { signal: n } = {}) {
  if (n != null && n.aborted) return !1;
  let r;
  try {
    r = await I(e, t);
  } catch {
    return !1;
  }
  return !r || n != null && n.aborted ? !1 : await ue(r, { signal: n }) ? !0 : n != null && n.aborted ? !1 : new Promise((a) => {
    const c = URL.createObjectURL(r), s = new Audio(c);
    let o = !1;
    const u = (l) => {
      o || (o = !0, n == null || n.removeEventListener("abort", i), s.onended = null, s.onerror = null, s.pause(), URL.revokeObjectURL(c), a(l));
    }, i = () => u(!1);
    n == null || n.addEventListener("abort", i, { once: !0 }), s.onended = () => u(!0), s.onerror = () => u(!1), s.play().catch(() => u(!1));
  });
}
async function xe(e, t) {
  return await I(e, t).catch(() => null) !== null;
}
const Y = 210, J = 550, Me = {
  a: { F3: 2700, bandwidths: [90, 110, 170], gains: [1, 0.5, 0.15] },
  e: { F3: 2900, bandwidths: [80, 100, 160], gains: [1, 0.55, 0.2] },
  i: { F3: 3300, bandwidths: [60, 100, 160], gains: [1, 0.6, 0.25] },
  o: { F3: 2600, bandwidths: [80, 90, 150], gains: [1, 0.5, 0.1] },
  u: { F3: 2400, bandwidths: [60, 80, 140], gains: [1, 0.45, 0.1] }
};
function x(e) {
  const t = X[e], n = Me[e];
  return !t || !n ? null : {
    formants: [t.F1, t.F2, n.F3],
    bandwidths: [...n.bandwidths],
    gains: [...n.gains]
  };
}
const W = {
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
function Fe(e) {
  return W[e] ?? W[""];
}
function Pe() {
  return le() !== null;
}
let B = null;
function Ae(e) {
  if (B && B.sampleRate === e.sampleRate) return B;
  const t = e.sampleRate, n = e.createBuffer(1, t, e.sampleRate), r = n.getChannelData(0);
  for (let a = 0; a < t; a++) r[a] = Math.random() * 2 - 1;
  return B = n, n;
}
function ee(e, t, n, r = e.destination) {
  const a = e.createOscillator();
  a.type = "sawtooth", a.frequency.value = n;
  const c = e.createGain();
  c.gain.value = 0;
  const s = t.formants.map((o, u) => {
    const i = e.createBiquadFilter();
    i.type = "bandpass", i.frequency.value = o, i.Q.value = o / t.bandwidths[u];
    const l = e.createGain();
    return l.gain.value = t.gains[u], a.connect(i), i.connect(l), l.connect(c), i;
  });
  return c.connect(r), { source: a, filters: s, master: c };
}
function O(e, t, n, r, a = e.destination) {
  const c = n.durationMs / 1e3, s = e.createBufferSource();
  s.buffer = Ae(e), s.loop = !0;
  const o = e.createBiquadFilter();
  o.type = "bandpass", o.frequency.value = n.noiseHz ?? 2e3, o.Q.value = n.noiseQ ?? 1;
  const u = e.createGain();
  return u.gain.setValueAtTime(0, t), u.gain.linearRampToValueAtTime(r, t + Math.min(0.01, c / 3)), u.gain.linearRampToValueAtTime(1e-4, t + c), s.connect(o), o.connect(u), u.connect(a), s.start(t), s.stop(t + c + 0.02), t + c;
}
function te(e, t, n, r, a, c, s = e.destination) {
  const o = r / 1e3, { source: u, filters: i, master: l } = ee(e, n, a, s);
  if (u.frequency.setValueAtTime(a * 1.04, t), u.frequency.linearRampToValueAtTime(a * 0.92, t + o), c) {
    const m = Math.min(0.09, o / 3);
    i.forEach((v, h) => {
      const w = c[h];
      w && (v.frequency.setValueAtTime(w, t), v.frequency.exponentialRampToValueAtTime(n.formants[h], t + m));
    });
  }
  const d = 0.04, p = 0.12;
  return l.gain.setValueAtTime(0, t), l.gain.linearRampToValueAtTime(0.5, t + d), l.gain.setValueAtTime(0.5, t + o - p), l.gain.linearRampToValueAtTime(1e-4, t + o), u.start(t), u.stop(t + o + 0.05), t + o;
}
function Se(e, t, n, r, a = e.destination) {
  const c = n / 1e3, s = { formants: [250, 1100, 2200], bandwidths: [80, 200, 300], gains: [1, 0.12, 0.05] }, { source: o, master: u } = ee(e, s, r, a);
  return u.gain.setValueAtTime(0, t), u.gain.linearRampToValueAtTime(0.35, t + 0.02), u.gain.setValueAtTime(0.35, t + c - 0.02), u.gain.linearRampToValueAtTime(1e-4, t + c), o.start(t), o.stop(t + c + 0.05), t + c;
}
function ne(e, t, n, r) {
  const a = Math.max(0, (t - e.currentTime) * 1e3) + 60;
  return new Promise((c) => {
    const s = () => {
      clearTimeout(o), r == null || r.removeEventListener("abort", s), n.disconnect(), c(!(r != null && r.aborted));
    }, o = setTimeout(s, a);
    r == null || r.addEventListener("abort", s, { once: !0 }), r != null && r.aborted && s();
  });
}
async function Ee(e, t = {}) {
  var s, o;
  const n = x(e);
  if (!n || (s = t.signal) != null && s.aborted) return !1;
  const r = await Z();
  if (!r || (o = t.signal) != null && o.aborted) return !1;
  let a, c;
  try {
    c = r.createGain(), c.connect(r.destination);
    const u = r.currentTime + 0.03;
    a = te(r, u, n, t.durationMs ?? J, t.pitchHz ?? Y, null, c);
  } catch {
    return c == null || c.disconnect(), !1;
  }
  return ne(r, a, c, t.signal);
}
async function $(e, t, n = {}) {
  var l, d;
  const r = x(t);
  if (!r || (l = n.signal) != null && l.aborted) return !1;
  const a = await Z();
  if (!a || (d = n.signal) != null && d.aborted) return !1;
  const c = Fe(e), s = n.pitchHz ?? Y, o = n.durationMs ?? J;
  let u, i;
  try {
    i = a.createGain(), i.connect(a.destination), u = Re(a, c, e, r, o, s, i);
  } catch {
    return i == null || i.disconnect(), !1;
  }
  return ne(a, u, i, n.signal);
}
function Re(e, t, n, r, a, c, s = e.destination) {
  let o = e.currentTime + 0.03, u = null;
  switch (t.type) {
    case "plosive": {
      o = O(e, o, t, t.voiced ? 0.25 : 0.35, s), o += 0.01;
      break;
    }
    case "fricative": {
      o = O(e, o, t, 0.22, s) - 0.03;
      break;
    }
    case "affricate": {
      o += 0.03, o = O(e, o, { ...t, durationMs: t.durationMs - 30 }, 0.3, s) - 0.02;
      break;
    }
    case "nasal": {
      o = Se(e, o, t.durationMs, c, s), u = [300, 1300, 2300];
      break;
    }
    case "liquid": {
      u = n === "r" ? [450, 1300, 1600] : [380, 1e3, 2600];
      break;
    }
    case "glide": {
      const i = x(n === "y" ? "i" : "u");
      u = i ? i.formants : null;
      break;
    }
  }
  return te(e, o, r, a, c, u, s);
}
const Q = "sound-bank";
function re(e) {
  return `letter:${e}`;
}
function oe(e) {
  return `nikud:${e}`;
}
function ae(e, t) {
  return `syllable:${e}:${t}`;
}
function Ne(e) {
  return `word:${e}`;
}
function Ve() {
  const e = [];
  for (const t of ie)
    e.push({ key: re(t.letter), label: t.nameNikud, group: "letters" });
  for (const t of C)
    e.push({ key: oe(t.id), label: `${t.nameNikud} (${t.sound})`, group: "nikud" });
  for (const t of se)
    for (const n of C)
      e.push({
        key: ae(t, n.id),
        label: ce(t, n.symbol),
        group: "syllables"
      });
  return e;
}
function ze(e) {
  const t = Ve().find((r) => r.key === e);
  if (t) return t.label;
  const [, ...n] = e.split(":");
  return n.join(":");
}
function _e() {
  return typeof navigator < "u" && navigator.onLine === !1;
}
async function z(e, t = void 0) {
  try {
    return typeof indexedDB > "u" ? !1 : await (t ? G(Q, e, t) : G(Q, e));
  } catch {
    return !1;
  }
}
async function D(e) {
  if (_e() && !Le()) return !1;
  try {
    return await e(), R.audioState !== "failed" && R.audioState !== "unsupported";
  } catch {
    return !1;
  }
}
function Le() {
  return typeof speechSynthesis < "u";
}
async function De() {
  try {
    return typeof indexedDB > "u" ? [] : await ke(Q);
  } catch {
    return [];
  }
}
async function He(e) {
  if (await z(re(e))) return "bank";
  const t = K(e), n = t ? t.nameNikud : e;
  return await D(() => R.speak(n)) ? "tts" : t && await $(t.sound, "a", { durationMs: 400 }) ? "synth" : "none";
}
async function Oe(e) {
  if (await z(oe(e))) return "bank";
  if (await D(() => R.speakVowel(e))) return "tts";
  const t = U[e];
  return t && await Ee(t) ? "synth" : "none";
}
async function Ge(e, t, n = {}) {
  const { signal: r } = n;
  if (r != null && r.aborted) return "none";
  if (await z(ae(e, t), r ? n : void 0)) return "bank";
  if (r != null && r.aborted) return "none";
  const a = C.find((u) => u.id === t), c = () => R.cancel();
  r == null || r.addEventListener("abort", c, { once: !0 });
  try {
    if (a && await D(() => R.speakNikud(e, a.symbol)))
      return r != null && r.aborted ? "none" : "tts";
  } finally {
    r == null || r.removeEventListener("abort", c);
  }
  if (r != null && r.aborted) return "none";
  const s = K(e), o = U[t];
  return o && await (r ? $(s ? s.sound : "", o, n) : $(s ? s.sound : "", o)) ? "synth" : "none";
}
async function $e(e) {
  return await z(Ne(e)) ? "bank" : await D(() => R.speak(e)) ? "tts" : "none";
}
function Qe(e, t) {
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
  const r = new URLSearchParams(window.location.search), a = r.get("allowedNikud") ? r.get("allowedNikud").split(",") : [];
  let c = `
    <div style="background:white; padding:1.5rem; border-radius:1rem; min-width:300px; text-align:center; color:#333; font-family:Heebo,Arial; direction:rtl;">
      <h2 style="margin-top:0">בחר ניקוד</h2>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; margin:1rem 0; text-align:right;">
  `;
  C.forEach((i) => {
    const l = a.length === 0 || a.includes(i.id) || a.includes(i.name);
    c += `
      <label style="display:flex; align-items:center; gap:0.5rem; cursor:pointer;">
        <input type="checkbox" value="${i.id}" class="nikud-filter-cb" ${l ? "checked" : ""} style="width:1.2rem;height:1.2rem;">
        <span>${i.nameNikud}</span>
      </label>
    `;
  });
  const s = parseFloat(localStorage.getItem("alefbet.nikudRate")) || 0.5;
  c += `
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
  `, n.innerHTML = c, n.style.display = "flex";
  const o = (
    /** @type {HTMLInputElement} */
    document.getElementById("nikud-rate-slider")
  ), u = document.getElementById("nikud-rate-val");
  o.oninput = () => {
    u.textContent = o.value;
  }, document.getElementById("save-settings-btn").onclick = () => {
    const i = parseFloat(o.value);
    localStorage.setItem("alefbet.nikudRate", String(i)), R.setNikudEmphasis({ rate: i });
    const l = Array.from(n.querySelectorAll(".nikud-filter-cb")).filter((p) => (
      /** @type {HTMLInputElement} */
      p.checked
    )).map((p) => (
      /** @type {HTMLInputElement} */
      p.value
    )), d = new URL(window.location.href);
    l.length > 0 && l.length < C.length ? d.searchParams.set("allowedNikud", l.join(",")) : d.searchParams.delete("allowedNikud"), d.searchParams.delete("excludedNikud"), n.style.display = "none", window.history.replaceState({}, "", d), t && t(e);
  }, document.getElementById("close-settings-btn").onclick = () => {
    n.style.display = "none";
  };
}
function Ue(e, {
  gameId: t,
  voiceKey: n,
  label: r = "הקלטת קול",
  onSaved: a,
  onDeleted: c
}) {
  if (!be()) {
    const f = document.createElement("span");
    return f.className = "ab-voice-unsupported", f.textContent = "🎤 הקלטה לא נתמכת בדפדפן זה", e.appendChild(f), { refresh: async () => {
    }, destroy: () => f.remove() };
  }
  const s = he(), o = document.createElement("div");
  o.className = "ab-voice-btn-wrap", o.setAttribute("aria-label", r), e.appendChild(o);
  let u = "idle", i = !1, l = !1, d = null, p = null, m = null, v = null, h = null, w = null, b = 0;
  function N() {
    if (!i)
      if (o.innerHTML = "", u === "idle")
        d = A("🎤", "ab-voice-btn ab-voice-btn--record", "התחל הקלטה", S), o.appendChild(d);
      else if (u === "recording") {
        h = document.createElement("span"), h.className = "ab-voice-indicator", o.appendChild(h);
        const f = document.createElement("span");
        f.className = "ab-voice-timer", f.textContent = "0:00", o.appendChild(f), b = 0, w = setInterval(() => {
          b++;
          const g = Math.floor(b / 60), _ = String(b % 60).padStart(2, "0");
          f.textContent = `${g}:${_}`, b >= 120 && E();
        }, 1e3), p = A("⏹", "ab-voice-btn ab-voice-btn--stop", "עצור הקלטה", E), o.appendChild(p);
      } else u === "has-voice" && (m = A("▶", "ab-voice-btn ab-voice-btn--play", "נגן הקלטה", H), o.appendChild(m), d = A("🎤", "ab-voice-btn ab-voice-btn--re-record", "הקלט מחדש", S), o.appendChild(d), v = A("🗑", "ab-voice-btn ab-voice-btn--delete", "מחק הקלטה", q), o.appendChild(v));
  }
  function A(f, g, _, M) {
    const k = document.createElement("button");
    return k.className = g, k.type = "button", k.title = _, k.setAttribute("aria-label", _), k.textContent = f, k.addEventListener("click", M), k;
  }
  async function S() {
    if (!(i || l)) {
      l = !0;
      try {
        if (await s.start(), i) return;
        u = "recording", N();
      } catch (f) {
        if (i || (f == null ? void 0 : f.name) === "AbortError") return;
        console.warn("[voice-record-button] microphone access denied:", f), L("לא ניתן לגשת למיקרופון");
      } finally {
        l = !1;
      }
    }
  }
  async function E() {
    clearInterval(w);
    try {
      const f = await s.stop();
      if (i || (await we(t, n, f), i)) return;
      u = "has-voice", N(), a == null || a(f);
    } catch (f) {
      console.warn("[voice-record-button] stop error:", f), u = "idle", N();
    }
  }
  async function H() {
    m == null || m.setAttribute("disabled", "true"), await G(t, n), m == null || m.removeAttribute("disabled");
  }
  async function q() {
    confirm("למחוק את ההקלטה?") && (await ge(t, n), u = "idle", N(), c == null || c());
  }
  function L(f) {
    const g = document.createElement("span");
    g.className = "ab-voice-error", g.textContent = f, o.appendChild(g), setTimeout(() => g.remove(), 3e3);
  }
  async function y() {
    if (i || l || s.isActive()) return;
    const f = await I(t, n).catch(() => null);
    i || l || s.isActive() || (u = f ? "has-voice" : "idle", N());
  }
  function V() {
    i = !0, clearInterval(w), s.cancel(), o.remove();
  }
  return y(), { refresh: y, destroy: V };
}
export {
  Je as EventBus,
  et as GameShell,
  tt as GameState,
  U as NIKUD_VOWEL,
  nt as PRAISE_PHRASES,
  rt as RETRY_HINTS,
  Q as SOUND_BANK_ID,
  X as VOWEL_TEMPLATES,
  Bt as addNikud,
  ot as animate,
  We as attachGameAudio,
  at as bootstrapGame,
  de as classifyFormants,
  Fe as consonantOnsetSpec,
  it as createChoiceRound,
  st as createDragSource,
  ct as createDropTarget,
  ut as createFeedback,
  lt as createHintTracker,
  dt as createLocalState,
  ft as createOptionCards,
  mt as createProgressBar,
  pt as createRoundManager,
  bt as createRoundScope,
  Ue as createVoiceRecordButton,
  he as createVoiceRecorder,
  Be as createVowelDetector,
  ge as deleteVoice,
  ht as endGame,
  Z as ensureAudioRunning,
  me as extractFormantsFromSpectrum,
  yt as getAllProgress,
  le as getAudioContext,
  vt as getGameProgress,
  K as getLetter,
  Ke as getLettersByGroup,
  xt as getNikud,
  xe as hasVoice,
  ie as hebrewLetters,
  wt as hideLoadingScreen,
  gt as injectHeaderButton,
  kt as installGlobalErrorScreen,
  _e as isOffline,
  Pe as isSynthSupported,
  be as isVoiceRecordingSupported,
  Pt as isVowelized,
  ze as keyLabel,
  re as letterKey,
  ce as letterWithNikud,
  ke as listVoiceKeys,
  I as loadVoice,
  Mt as lockPageZoom,
  qe as matchNikudVowel,
  Ft as mountAudioStatusBanner,
  se as nikudBaseLetters,
  oe as nikudKey,
  C as nikudList,
  ue as playBlob,
  G as playVoice,
  zt as preloadNikud,
  Ze as randomLetters,
  Xe as randomNikud,
  At as randomPraise,
  St as randomRetryHint,
  Et as recordGameResult,
  De as recordedKeys,
  Rt as runGame,
  we as saveVoice,
  Nt as showCompletionScreen,
  Vt as showLoadingScreen,
  Qe as showNikudSettingsDialog,
  _t as shuffle,
  Lt as sounds,
  He as speakLetter,
  Oe as speakNikudSound,
  Ge as speakSyllable,
  $e as speakWord,
  Ve as standardSoundKeys,
  Tt as starsFor,
  ae as syllableKey,
  $ as synthesizeSyllable,
  Ee as synthesizeVowel,
  R as tts,
  Ct as unlockAudioOutput,
  x as vowelFormantSpec,
  Ne as wordKey
};
