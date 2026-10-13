import { g as B, n as b, t as m, h as j, a as C, l as I } from "./game-audio-Cwpuytb0.js";
import { b as Ae, c as Ee, r as Re, d as Le } from "./game-audio-Cwpuytb0.js";
import { playBlob as U, getAudioContext as K, ensureAudioRunning as F } from "./common.js";
import { EventBus as Ne, GameShell as _e, GameState as Be, PRAISE_PHRASES as Fe, RETRY_HINTS as ze, animate as He, bootstrapGame as Te, createChoiceRound as Pe, createDragSource as Oe, createDropTarget as qe, createFeedback as De, createHintTracker as Ge, createLocalState as Qe, createOptionCards as xe, createProgressBar as $e, createRoundManager as je, createRoundScope as Ce, endGame as Ie, getAllProgress as Ue, getGameProgress as Ke, hideLoadingScreen as We, injectHeaderButton as Ze, installGlobalErrorScreen as Xe, lockPageZoom as Ye, mountAudioStatusBanner as Je, randomPraise as et, randomRetryHint as tt, recordGameResult as nt, runGame as rt, showCompletionScreen as ot, showLoadingScreen as at, shuffle as it, sounds as st, starsFor as ct, unlockAudioOutput as ut } from "./common.js";
const W = {
  a: { F1: 850, F2: 1400 },
  e: { F1: 550, F2: 2100 },
  i: { F1: 350, F2: 2700 },
  o: { F1: 550, F2: 1e3 },
  u: { F1: 350, F2: 850 }
}, z = {
  kamatz: "a",
  patah: "a",
  tzere: "e",
  segol: "e",
  hiriq: "i",
  holam: "o",
  kubbutz: "u"
}, Z = "alefbet-voices", f = "recordings", X = 1;
let p = null;
function w() {
  return p || (p = new Promise((t, e) => {
    const n = indexedDB.open(Z, X);
    n.onupgradeneeded = () => {
      n.result.createObjectStore(f);
    }, n.onsuccess = () => t(n.result), n.onerror = () => {
      p = null, e(n.error);
    };
  }), p);
}
function E(t, e) {
  return `${t}/${e}`;
}
async function le(t, e, n) {
  const r = await w();
  return new Promise((s, i) => {
    const o = r.transaction(f, "readwrite");
    o.objectStore(f).put(n, E(t, e)), o.oncomplete = s, o.onerror = (a) => i(a.target.error);
  });
}
async function H(t, e) {
  const n = await w();
  return new Promise((r, s) => {
    const o = n.transaction(f, "readonly").objectStore(f).get(E(t, e));
    o.onsuccess = () => r(o.result ?? null), o.onerror = (a) => s(a.target.error);
  });
}
async function fe(t, e) {
  const n = await w();
  return new Promise((r, s) => {
    const i = n.transaction(f, "readwrite");
    i.objectStore(f).delete(E(t, e)), i.oncomplete = r, i.onerror = (o) => s(o.target.error);
  });
}
async function Y(t) {
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
async function N(t, e, { signal: n } = {}) {
  if (n != null && n.aborted) return !1;
  let r;
  try {
    r = await H(t, e);
  } catch {
    return !1;
  }
  return !r || n != null && n.aborted ? !1 : await U(r, { signal: n }) ? !0 : n != null && n.aborted ? !1 : new Promise((s) => {
    const i = URL.createObjectURL(r), o = new Audio(i);
    let a = !1;
    const c = (d) => {
      a || (a = !0, n == null || n.removeEventListener("abort", u), o.onended = null, o.onerror = null, o.pause(), URL.revokeObjectURL(i), s(d));
    }, u = () => c(!1);
    n == null || n.addEventListener("abort", u, { once: !0 }), o.onended = () => c(!0), o.onerror = () => c(!1), o.play().catch(() => c(!1));
  });
}
async function me(t, e) {
  return await H(t, e).catch(() => null) !== null;
}
const T = 210, P = 550, J = {
  a: { F3: 2700, bandwidths: [90, 110, 170], gains: [1, 0.5, 0.15] },
  e: { F3: 2900, bandwidths: [80, 100, 160], gains: [1, 0.55, 0.2] },
  i: { F3: 3300, bandwidths: [60, 100, 160], gains: [1, 0.6, 0.25] },
  o: { F3: 2600, bandwidths: [80, 90, 150], gains: [1, 0.5, 0.1] },
  u: { F3: 2400, bandwidths: [60, 80, 140], gains: [1, 0.45, 0.1] }
};
function v(t) {
  const e = W[t], n = J[t];
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
function ye() {
  return K() !== null;
}
let h = null;
function te(t) {
  if (h && h.sampleRate === t.sampleRate) return h;
  const e = t.sampleRate, n = t.createBuffer(1, e, t.sampleRate), r = n.getChannelData(0);
  for (let s = 0; s < e; s++) r[s] = Math.random() * 2 - 1;
  return h = n, n;
}
function O(t, e, n, r = t.destination) {
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
function S(t, e, n, r, s = t.destination) {
  const i = n.durationMs / 1e3, o = t.createBufferSource();
  o.buffer = te(t), o.loop = !0;
  const a = t.createBiquadFilter();
  a.type = "bandpass", a.frequency.value = n.noiseHz ?? 2e3, a.Q.value = n.noiseQ ?? 1;
  const c = t.createGain();
  return c.gain.setValueAtTime(0, e), c.gain.linearRampToValueAtTime(r, e + Math.min(0.01, i / 3)), c.gain.linearRampToValueAtTime(1e-4, e + i), o.connect(a), a.connect(c), c.connect(s), o.start(e), o.stop(e + i + 0.02), e + i;
}
function q(t, e, n, r, s, i, o = t.destination) {
  const a = r / 1e3, { source: c, filters: u, master: d } = O(t, n, s, o);
  if (c.frequency.setValueAtTime(s * 1.04, e), c.frequency.linearRampToValueAtTime(s * 0.92, e + a), i) {
    const $ = Math.min(0.09, a / 3);
    u.forEach((R, L) => {
      const V = i[L];
      V && (R.frequency.setValueAtTime(V, e), R.frequency.exponentialRampToValueAtTime(n.formants[L], e + $));
    });
  }
  const l = 0.04, y = 0.12;
  return d.gain.setValueAtTime(0, e), d.gain.linearRampToValueAtTime(0.5, e + l), d.gain.setValueAtTime(0.5, e + a - y), d.gain.linearRampToValueAtTime(1e-4, e + a), c.start(e), c.stop(e + a + 0.05), e + a;
}
function ne(t, e, n, r, s = t.destination) {
  const i = n / 1e3, o = { formants: [250, 1100, 2200], bandwidths: [80, 200, 300], gains: [1, 0.12, 0.05] }, { source: a, master: c } = O(t, o, r, s);
  return c.gain.setValueAtTime(0, e), c.gain.linearRampToValueAtTime(0.35, e + 0.02), c.gain.setValueAtTime(0.35, e + i - 0.02), c.gain.linearRampToValueAtTime(1e-4, e + i), a.start(e), a.stop(e + i + 0.05), e + i;
}
function D(t, e, n, r) {
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
  const r = await F();
  if (!r || (a = e.signal) != null && a.aborted) return !1;
  let s, i;
  try {
    i = r.createGain(), i.connect(r.destination);
    const c = r.currentTime + 0.03;
    s = q(r, c, n, e.durationMs ?? P, e.pitchHz ?? T, null, i);
  } catch {
    return i == null || i.disconnect(), !1;
  }
  return D(r, s, i, e.signal);
}
async function M(t, e, n = {}) {
  var d, l;
  const r = v(e);
  if (!r || (d = n.signal) != null && d.aborted) return !1;
  const s = await F();
  if (!s || (l = n.signal) != null && l.aborted) return !1;
  const i = ee(t), o = n.pitchHz ?? T, a = n.durationMs ?? P;
  let c, u;
  try {
    u = s.createGain(), u.connect(s.destination), c = oe(s, i, t, r, a, o, u);
  } catch {
    return u == null || u.disconnect(), !1;
  }
  return D(s, c, u, n.signal);
}
function oe(t, e, n, r, s, i, o = t.destination) {
  let a = t.currentTime + 0.03, c = null;
  switch (e.type) {
    case "plosive": {
      a = S(t, a, e, e.voiced ? 0.25 : 0.35, o), a += 0.01;
      break;
    }
    case "fricative": {
      a = S(t, a, e, 0.22, o) - 0.03;
      break;
    }
    case "affricate": {
      a += 0.03, a = S(t, a, { ...e, durationMs: e.durationMs - 30 }, 0.3, o) - 0.02;
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
const A = "sound-bank";
function G(t) {
  return `letter:${t}`;
}
function Q(t) {
  return `nikud:${t}`;
}
function x(t, e) {
  return `syllable:${t}:${e}`;
}
function ae(t) {
  return `word:${t}`;
}
function ie() {
  const t = [];
  for (const e of j)
    t.push({ key: G(e.letter), label: e.nameNikud, group: "letters" });
  for (const e of b)
    t.push({ key: Q(e.id), label: `${e.nameNikud} (${e.sound})`, group: "nikud" });
  for (const e of C)
    for (const n of b)
      t.push({
        key: x(e, n.id),
        label: I(e, n.symbol),
        group: "syllables"
      });
  return t;
}
function pe(t) {
  const e = ie().find((r) => r.key === t);
  if (e) return e.label;
  const [, ...n] = t.split(":");
  return n.join(":");
}
function se() {
  return typeof navigator < "u" && navigator.onLine === !1;
}
async function k(t, e = void 0) {
  try {
    return typeof indexedDB > "u" ? !1 : await (e ? N(A, t, e) : N(A, t));
  } catch {
    return !1;
  }
}
async function g(t) {
  if (se() && !ce()) return !1;
  try {
    return await t(), m.audioState !== "failed" && m.audioState !== "unsupported";
  } catch {
    return !1;
  }
}
function ce() {
  return typeof speechSynthesis < "u";
}
async function be() {
  try {
    return typeof indexedDB > "u" ? [] : await Y(A);
  } catch {
    return [];
  }
}
async function he(t) {
  if (await k(G(t))) return "bank";
  const e = B(t), n = e ? e.nameNikud : t;
  return await g(() => m.speak(n)) ? "tts" : e && await M(e.sound, "a", { durationMs: 400 }) ? "synth" : "none";
}
async function ve(t) {
  if (await k(Q(t))) return "bank";
  if (await g(() => m.speakVowel(t))) return "tts";
  const e = z[t];
  return e && await re(e) ? "synth" : "none";
}
async function we(t, e, n = {}) {
  const { signal: r } = n;
  if (r != null && r.aborted) return "none";
  if (await k(x(t, e), r ? n : void 0)) return "bank";
  if (r != null && r.aborted) return "none";
  const s = b.find((c) => c.id === e), i = () => m.cancel();
  r == null || r.addEventListener("abort", i, { once: !0 });
  try {
    if (s && await g(() => m.speakNikud(t, s.symbol)))
      return r != null && r.aborted ? "none" : "tts";
  } finally {
    r == null || r.removeEventListener("abort", i);
  }
  if (r != null && r.aborted) return "none";
  const o = B(t), a = z[e];
  return a && await (r ? M(o ? o.sound : "", a, n) : M(o ? o.sound : "", a)) ? "synth" : "none";
}
async function ke(t) {
  return await k(ae(t)) ? "bank" : await g(() => m.speak(t)) ? "tts" : "none";
}
function ge(t, e) {
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
  Ne as EventBus,
  _e as GameShell,
  Be as GameState,
  z as NIKUD_VOWEL,
  Fe as PRAISE_PHRASES,
  ze as RETRY_HINTS,
  A as SOUND_BANK_ID,
  W as VOWEL_TEMPLATES,
  He as animate,
  Ae as attachGameAudio,
  Te as bootstrapGame,
  ee as consonantOnsetSpec,
  Pe as createChoiceRound,
  Oe as createDragSource,
  qe as createDropTarget,
  De as createFeedback,
  Ge as createHintTracker,
  Qe as createLocalState,
  xe as createOptionCards,
  $e as createProgressBar,
  je as createRoundManager,
  Ce as createRoundScope,
  fe as deleteVoice,
  Ie as endGame,
  F as ensureAudioRunning,
  Ue as getAllProgress,
  K as getAudioContext,
  Ke as getGameProgress,
  B as getLetter,
  Ee as getLettersByGroup,
  me as hasVoice,
  j as hebrewLetters,
  We as hideLoadingScreen,
  Ze as injectHeaderButton,
  Xe as installGlobalErrorScreen,
  se as isOffline,
  ye as isSynthSupported,
  pe as keyLabel,
  G as letterKey,
  I as letterWithNikud,
  Y as listVoiceKeys,
  H as loadVoice,
  Ye as lockPageZoom,
  Je as mountAudioStatusBanner,
  C as nikudBaseLetters,
  Q as nikudKey,
  b as nikudList,
  U as playBlob,
  N as playVoice,
  Re as randomLetters,
  Le as randomNikud,
  et as randomPraise,
  tt as randomRetryHint,
  nt as recordGameResult,
  be as recordedKeys,
  rt as runGame,
  le as saveVoice,
  ot as showCompletionScreen,
  at as showLoadingScreen,
  ge as showNikudSettingsDialog,
  it as shuffle,
  st as sounds,
  he as speakLetter,
  ve as speakNikudSound,
  we as speakSyllable,
  ke as speakWord,
  ie as standardSoundKeys,
  ct as starsFor,
  x as syllableKey,
  M as synthesizeSyllable,
  re as synthesizeVowel,
  m as tts,
  ut as unlockAudioOutput,
  v as vowelFormantSpec,
  ae as wordKey
};
