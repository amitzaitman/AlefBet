let N = null;
function Z() {
  return typeof window > "u" ? null : window.AudioContext || /** @type {any} */
  window.webkitAudioContext || null;
}
function k() {
  const t = Z();
  if (!t) return null;
  if (!N)
    try {
      N = new t();
    } catch {
      return null;
    }
  return N;
}
async function gt() {
  const t = k();
  if (!t) return !1;
  try {
    t.state === "suspended" && await t.resume();
  } catch {
  }
  try {
    const e = t.createBuffer(1, 1, t.sampleRate || 44100), n = t.createBufferSource();
    n.buffer = e, n.connect(t.destination), n.start(0);
  } catch {
  }
  return t.state === "running";
}
async function K() {
  const t = k();
  if (!t) return null;
  if (t.state === "suspended")
    try {
      await t.resume();
    } catch {
    }
  return t.state === "running" ? t : null;
}
function tt(t) {
  return typeof t.arrayBuffer == "function" ? t.arrayBuffer() : new Promise((e, n) => {
    const r = new FileReader();
    r.onload = () => e(
      /** @type {ArrayBuffer} */
      r.result
    ), r.onerror = () => n(r.error), r.readAsArrayBuffer(t);
  });
}
async function et(t) {
  if (!t) return !1;
  const e = await K();
  if (!e || typeof e.decodeAudioData != "function") return !1;
  let n;
  try {
    const r = await tt(t);
    n = await new Promise((i, a) => {
      const s = e.decodeAudioData(r, i, a);
      s && typeof s.then == "function" && s.then(i, a);
    });
  } catch {
    return !1;
  }
  return new Promise((r) => {
    try {
      const i = e.createBufferSource();
      i.buffer = n, i.connect(e.destination), i.onended = () => r(!0), i.start(0), setTimeout(() => r(!0), (n.duration + 0.5) * 1e3);
    } catch {
      r(!1);
    }
  });
}
function nt(t, e) {
  const n = [];
  function r() {
    try {
      const o = localStorage.getItem(t);
      return o === null ? e : JSON.parse(o);
    } catch {
      return e;
    }
  }
  function i(o) {
    try {
      localStorage.setItem(t, JSON.stringify(o));
    } catch (c) {
      console.warn(`[createLocalState] שגיאה בשמירת "${t}":`, c);
    }
    n.forEach((c) => c(o));
  }
  function a(o) {
    i(o(r()));
  }
  function s(o) {
    return n.push(o), function() {
      const d = n.indexOf(o);
      d !== -1 && n.splice(d, 1);
    };
  }
  return { get: r, set: i, update: a, subscribe: s };
}
let rt = 0;
function $() {
  return `round-${Date.now()}-${rt++}`;
}
class C {
  // redo stack
  constructor(e) {
    this._id = e.id ?? "game", this._version = e.version ?? 1, this._meta = { title: "", type: "multiple-choice", ...e.meta ?? {} }, this._rounds = (e.rounds ?? []).map((n) => ({ ...n, id: n.id || $() })), this._distractors = e.distractors ?? [], this._handlers = [], this._past = [], this._future = [];
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
  getRound(e) {
    return this._rounds.find((n) => n.id === e) ?? null;
  }
  getRoundIndex(e) {
    return this._rounds.findIndex((n) => n.id === e);
  }
  // ── Rounds (write) ────────────────────────────────────────────────────────
  updateRound(e, n) {
    const r = this.getRoundIndex(e);
    r !== -1 && (this._saveHistory(), this._rounds[r] = { ...this._rounds[r], ...n }, this._emit());
  }
  addRound(e = null) {
    this._saveHistory();
    const n = { id: $(), target: "", correct: "", correctEmoji: "❓" };
    if (e === null)
      this._rounds.push(n);
    else {
      const r = this.getRoundIndex(e);
      this._rounds.splice(r + 1, 0, n);
    }
    return this._emit(), n.id;
  }
  duplicateRound(e) {
    const n = this.getRound(e);
    if (!n) return null;
    this._saveHistory();
    const r = { ...n, id: $() };
    return this._rounds.splice(this.getRoundIndex(e) + 1, 0, r), this._emit(), r.id;
  }
  removeRound(e) {
    const n = this.getRoundIndex(e);
    n === -1 || this._rounds.length <= 1 || (this._saveHistory(), this._rounds.splice(n, 1), this._emit());
  }
  moveRound(e, n) {
    const r = this.getRoundIndex(e);
    if (r === -1) return;
    this._saveHistory();
    const [i] = this._rounds.splice(r, 1);
    this._rounds.splice(Math.max(0, Math.min(n, this._rounds.length)), 0, i), this._emit();
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
    return this._rounds.map((e) => ({ ...e }));
  }
  // ── Change events ─────────────────────────────────────────────────────────
  onChange(e) {
    return this._handlers.push(e), () => this.offChange(e);
  }
  offChange(e) {
    const n = this._handlers.indexOf(e);
    n !== -1 && this._handlers.splice(n, 1);
  }
  _emit() {
    this._handlers.forEach((e) => e(this));
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
  static fromJSON(e) {
    return new C(e);
  }
  static fromRoundsArray(e, n, r = {}, i = []) {
    return new C({ id: e, meta: r, rounds: n, distractors: i });
  }
}
const J = "alefbet.editor.";
function T(t) {
  return nt(`${J}${t}`, null);
}
function _t(t) {
  T(t.id).set(t.toJSON());
}
function vt(t) {
  const e = T(t).get();
  if (!e) return null;
  try {
    return C.fromJSON(e);
  } catch {
    return null;
  }
}
function yt(t) {
  try {
    localStorage.removeItem(`${J}${t}`);
  } catch {
  }
}
function wt(t) {
  const e = JSON.stringify(t.toJSON(), null, 2), n = new Blob([e], { type: "application/json;charset=utf-8" }), r = URL.createObjectURL(n), i = document.createElement("a");
  i.href = r, i.download = `${t.id}-rounds.json`, i.click(), URL.revokeObjectURL(r);
}
function ot() {
  return ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/ogg"].find((e) => MediaRecorder.isTypeSupported(e)) || "";
}
function it() {
  var t;
  return typeof navigator < "u" && typeof ((t = navigator.mediaDevices) == null ? void 0 : t.getUserMedia) == "function" && typeof MediaRecorder < "u";
}
function st() {
  let t = null, e = null, n = [];
  async function r() {
    if (t && t.state === "recording") return;
    e = await navigator.mediaDevices.getUserMedia({ audio: !0, video: !1 }), n = [];
    const c = {}, d = ot();
    d && (c.mimeType = d), t = new MediaRecorder(e, c), t.ondataavailable = (f) => {
      var l;
      ((l = f.data) == null ? void 0 : l.size) > 0 && n.push(f.data);
    }, t.start(100);
  }
  function i() {
    return new Promise((c, d) => {
      if (!t || t.state === "inactive") {
        d(new Error("[voice-recorder] not recording"));
        return;
      }
      t.onstop = () => {
        const f = new Blob(n, { type: t.mimeType || "audio/webm" });
        s(), c(f);
      }, t.onerror = (f) => {
        s(), d(f.error);
      }, t.stop();
    });
  }
  function a() {
    t && t.state !== "inactive" && (t.ondataavailable = null, t.onstop = null, t.stop()), s();
  }
  function s() {
    e == null || e.getTracks().forEach((c) => c.stop()), e = null, t = null, n = [];
  }
  function o() {
    return (t == null ? void 0 : t.state) === "recording";
  }
  return { start: r, stop: i, cancel: a, isActive: o };
}
const at = "alefbet-voices", m = "recordings", ct = 1;
let R = null;
function A() {
  return R || (R = new Promise((t, e) => {
    const n = indexedDB.open(at, ct);
    n.onupgradeneeded = () => {
      n.result.createObjectStore(m);
    }, n.onsuccess = () => t(n.result), n.onerror = () => {
      R = null, e(n.error);
    };
  }), R);
}
function I(t, e) {
  return `${t}/${e}`;
}
async function ut(t, e, n) {
  const r = await A();
  return new Promise((i, a) => {
    const s = r.transaction(m, "readwrite");
    s.objectStore(m).put(n, I(t, e)), s.oncomplete = i, s.onerror = (o) => a(o.target.error);
  });
}
async function M(t, e) {
  const n = await A();
  return new Promise((r, i) => {
    const s = n.transaction(m, "readonly").objectStore(m).get(I(t, e));
    s.onsuccess = () => r(s.result ?? null), s.onerror = (o) => i(o.target.error);
  });
}
async function dt(t, e) {
  const n = await A();
  return new Promise((r, i) => {
    const a = n.transaction(m, "readwrite");
    a.objectStore(m).delete(I(t, e)), a.oncomplete = r, a.onerror = (s) => i(s.target.error);
  });
}
async function xt(t) {
  const e = await A();
  return new Promise((n, r) => {
    const a = e.transaction(m, "readonly").objectStore(m).getAllKeys();
    a.onsuccess = () => {
      const s = `${t}/`;
      n(
        (a.result || []).filter((o) => o.startsWith(s)).map((o) => o.slice(s.length))
      );
    }, a.onerror = (s) => r(s.target.error);
  });
}
async function lt(t, e) {
  let n;
  try {
    n = await M(t, e);
  } catch {
    return !1;
  }
  return n ? await et(n) ? !0 : new Promise((r) => {
    const i = URL.createObjectURL(n), a = new Audio(i), s = (o) => {
      URL.revokeObjectURL(i), r(o);
    };
    a.onended = () => s(!0), a.onerror = () => s(!1), a.play().catch(() => s(!1));
  }) : !1;
}
async function Rt(t, e) {
  return await M(t, e).catch(() => null) !== null;
}
function Et(t, {
  gameId: e,
  voiceKey: n,
  label: r = "הקלטת קול",
  onSaved: i,
  onDeleted: a
}) {
  if (!it()) {
    const u = document.createElement("span");
    return u.className = "ab-voice-unsupported", u.textContent = "🎤 הקלטה לא נתמכת בדפדפן זה", t.appendChild(u), { refresh: async () => {
    }, destroy: () => u.remove() };
  }
  const s = st(), o = document.createElement("div");
  o.className = "ab-voice-btn-wrap", o.setAttribute("aria-label", r), t.appendChild(o);
  let c = "idle", d = null, f = null, l = null, j = null, S = null, O = null, y = 0;
  function w() {
    if (o.innerHTML = "", c === "idle")
      d = x("🎤", "ab-voice-btn ab-voice-btn--record", "התחל הקלטה", D), o.appendChild(d);
    else if (c === "recording") {
      S = document.createElement("span"), S.className = "ab-voice-indicator", o.appendChild(S);
      const u = document.createElement("span");
      u.className = "ab-voice-timer", u.textContent = "0:00", o.appendChild(u), y = 0, O = setInterval(() => {
        y++;
        const b = Math.floor(y / 60), E = String(y % 60).padStart(2, "0");
        u.textContent = `${b}:${E}`, y >= 120 && H();
      }, 1e3), f = x("⏹", "ab-voice-btn ab-voice-btn--stop", "עצור הקלטה", H), o.appendChild(f);
    } else c === "has-voice" && (l = x("▶", "ab-voice-btn ab-voice-btn--play", "נגן הקלטה", Y), o.appendChild(l), d = x("🎤", "ab-voice-btn ab-voice-btn--re-record", "הקלט מחדש", D), o.appendChild(d), j = x("🗑", "ab-voice-btn ab-voice-btn--delete", "מחק הקלטה", G), o.appendChild(j));
  }
  function x(u, b, E, Q) {
    const g = document.createElement("button");
    return g.className = b, g.type = "button", g.title = E, g.setAttribute("aria-label", E), g.textContent = u, g.addEventListener("click", Q), g;
  }
  async function D() {
    try {
      await s.start(), c = "recording", w();
    } catch (u) {
      console.warn("[voice-record-button] microphone access denied:", u), z("לא ניתן לגשת למיקרופון");
    }
  }
  async function H() {
    clearInterval(O);
    try {
      const u = await s.stop();
      await ut(e, n, u), c = "has-voice", w(), i == null || i(u);
    } catch (u) {
      console.warn("[voice-record-button] stop error:", u), c = "idle", w();
    }
  }
  async function Y() {
    l == null || l.setAttribute("disabled", "true"), await lt(e, n), l == null || l.removeAttribute("disabled");
  }
  async function G() {
    confirm("למחוק את ההקלטה?") && (await dt(e, n), c = "idle", w(), a == null || a());
  }
  function z(u) {
    const b = document.createElement("span");
    b.className = "ab-voice-error", b.textContent = u, o.appendChild(b), setTimeout(() => b.remove(), 3e3);
  }
  async function U() {
    if (s.isActive()) return;
    c = await M(e, n).catch(() => null) ? "has-voice" : "idle", w();
  }
  function W() {
    clearInterval(O), s.isActive() && s.cancel(), o.remove();
  }
  return U(), { refresh: U, destroy: W };
}
let _ = null, p = null, V = 0, F = 0, v = null, B = 0, P = 0;
const L = /* @__PURE__ */ new Map();
function q(t, e) {
  var n;
  return ((n = document.elementFromPoint(t, e)) == null ? void 0 : n.closest('[data-drop-target="true"]')) || null;
}
function ft(t, e, n) {
  const r = t.getBoundingClientRect();
  V = r.width / 2, F = r.height / 2, p = t.cloneNode(!0), Object.assign(p.style, {
    position: "fixed",
    left: "0",
    top: "0",
    width: `${r.width}px`,
    height: `${r.height}px`,
    pointerEvents: "none",
    // keeps it out of elementFromPoint + hit-testing
    zIndex: "9999",
    opacity: "0.85",
    cursor: "grabbing",
    margin: "0",
    willChange: "transform"
    // מקדם שכבת compositor מראש - בלי זה הפריים הראשון של תזוזה עלול לגמגם
  }), X(e, n), document.body.appendChild(p);
}
function X(t, e) {
  p && (p.style.transform = `translate3d(${t - V}px, ${e - F}px, 0) scale(1.12)`);
}
function ht(t, e) {
  B = t, P = e, v === null && (v = requestAnimationFrame(() => {
    v = null, X(B, P), mt(q(B, P));
  }));
}
function pt() {
  v !== null && (cancelAnimationFrame(v), v = null), p == null || p.remove(), p = null;
}
let h = null;
function mt(t) {
  h !== t && (h == null || h.classList.remove("drop-target--hover"), h = t, t == null || t.classList.add("drop-target--hover"));
}
function bt() {
  h == null || h.classList.remove("drop-target--hover"), h = null;
}
function Ct(t, e) {
  t.classList.add("drag-source");
  let n = null, r = null, i = null;
  function a() {
    n && (t.removeEventListener("pointermove", n), t.removeEventListener("pointerup", r), t.removeEventListener("pointercancel", i), n = r = i = null), bt(), pt(), t.classList.remove("drag-source--dragging"), _ = null;
  }
  function s(o) {
    o.button !== void 0 && o.button !== 0 || (o.preventDefault(), _ && a(), _ = { el: t, data: e }, t.classList.add("drag-source--dragging"), ft(t, o.clientX, o.clientY), t.setPointerCapture(o.pointerId), n = (c) => {
      ht(c.clientX, c.clientY);
    }, r = (c) => {
      const d = q(c.clientX, c.clientY);
      a(), d && L.has(d) && L.get(d).onDrop({ data: e, sourceEl: t, targetEl: d });
    }, i = () => a(), t.addEventListener("pointermove", n), t.addEventListener("pointerup", r), t.addEventListener("pointercancel", i));
  }
  return t.addEventListener("pointerdown", s), {
    destroy() {
      t.removeEventListener("pointerdown", s), (_ == null ? void 0 : _.el) === t && a(), t.classList.remove("drag-source");
    }
  };
}
function Lt(t, e) {
  return t.setAttribute("data-drop-target", "true"), t.classList.add("drop-target--active"), L.set(t, { onDrop: e }), {
    destroy() {
      t.removeAttribute("data-drop-target"), t.classList.remove("drop-target--active", "drop-target--hover"), L.delete(t);
    }
  };
}
export {
  C as G,
  xt as a,
  Ct as b,
  nt as c,
  Lt as d,
  K as e,
  Et as f,
  k as g,
  st as h,
  dt as i,
  Rt as j,
  it as k,
  vt as l,
  M as m,
  et as n,
  wt as o,
  lt as p,
  _t as q,
  yt as r,
  ut as s,
  gt as u
};
