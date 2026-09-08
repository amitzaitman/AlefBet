let I = null;
function tt() {
  return typeof window > "u" ? null : window.AudioContext || /** @type {any} */
  window.webkitAudioContext || null;
}
function V() {
  const t = tt();
  if (!t) return null;
  if (!I)
    try {
      I = new t();
    } catch {
      return null;
    }
  return I;
}
async function yt() {
  const t = V();
  if (!t) return !1;
  try {
    t.state === "suspended" && await t.resume();
  } catch {
  }
  try {
    const r = t.createBuffer(1, 1, t.sampleRate || 44100), e = t.createBufferSource();
    e.buffer = r, e.connect(t.destination), e.start(0);
  } catch {
  }
  return t.state === "running";
}
async function et() {
  const t = V();
  if (!t) return null;
  if (t.state === "suspended")
    try {
      await t.resume();
    } catch {
    }
  return t.state === "running" ? t : null;
}
function rt(t) {
  return typeof t.arrayBuffer == "function" ? t.arrayBuffer() : new Promise((r, e) => {
    const n = new FileReader();
    n.onload = () => r(
      /** @type {ArrayBuffer} */
      n.result
    ), n.onerror = () => e(n.error), n.readAsArrayBuffer(t);
  });
}
async function nt(t, { signal: r } = {}) {
  if (r != null && r.aborted || !t) return !1;
  const e = await et();
  if (r != null && r.aborted || !e || typeof e.decodeAudioData != "function") return !1;
  let n;
  try {
    const a = await rt(t);
    n = await new Promise((o, s) => {
      const i = e.decodeAudioData(a, o, s);
      i && typeof i.then == "function" && i.then(o, s);
    });
  } catch {
    return !1;
  }
  return r != null && r.aborted ? !1 : new Promise((a) => {
    let o, s, i = !1;
    const c = (l) => {
      if (!i) {
        if (i = !0, clearTimeout(s), r == null || r.removeEventListener("abort", u), o) {
          o.onended = null;
          try {
            o.stop(), o.disconnect();
          } catch {
          }
        }
        a(l);
      }
    }, u = () => c(!1);
    try {
      o = e.createBufferSource(), o.buffer = n, o.connect(e.destination), o.onended = () => c(!0), r == null || r.addEventListener("abort", u, { once: !0 }), s = setTimeout(() => c(!0), (n.duration + 0.5) * 1e3), o.start(0);
    } catch {
      c(!1);
    }
  });
}
function ot(t, r) {
  const e = [];
  function n() {
    try {
      const i = localStorage.getItem(t);
      return i === null ? r : JSON.parse(i);
    } catch {
      return r;
    }
  }
  function a(i) {
    try {
      localStorage.setItem(t, JSON.stringify(i));
    } catch (c) {
      return console.warn(`[createLocalState] שגיאה בשמירת "${t}":`, c), !1;
    }
    return e.forEach((c) => c(i)), !0;
  }
  function o(i) {
    return a(i(n()));
  }
  function s(i) {
    return e.push(i), function() {
      const u = e.indexOf(i);
      u !== -1 && e.splice(u, 1);
    };
  }
  return { get: n, set: a, update: o, subscribe: s };
}
function $(t) {
  return t !== null && typeof t == "object" && !Array.isArray(t);
}
function J(t) {
  if (!$(t) || typeof t.id != "string" || !t.id || !Array.isArray(t.rounds) || !t.rounds.every($) || t.meta !== void 0 && !$(t.meta) || t.distractors !== void 0 && !Array.isArray(t.distractors))
    throw new Error("Invalid game content");
  const r = t.version ?? 1;
  if (!Number.isInteger(r) || Number(r) < 1) throw new Error("Invalid content version");
  const e = /* @__PURE__ */ new Set();
  for (const n of t.rounds)
    if (n.id !== void 0) {
      if (typeof n.id != "string" || !n.id || e.has(n.id)) throw new Error("Invalid round id");
      e.add(n.id);
    }
  return { ...t, version: r };
}
let it = 0;
function B() {
  return `round-${Date.now()}-${it++}`;
}
class S {
  // redo stack
  constructor(r, e) {
    this._contract = e, this._id = r.id ?? "game", this._version = r.version ?? 1, this._meta = { title: "", type: "multiple-choice", ...r.meta ?? {} }, this._rounds = (r.rounds ?? []).map((n) => ({ ...n, id: n.id || B() })), this._distractors = r.distractors ?? [], this._handlers = [], this._past = [], this._future = [];
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
  getRound(r) {
    return this._rounds.find((e) => e.id === r) ?? null;
  }
  getRoundIndex(r) {
    return this._rounds.findIndex((e) => e.id === r);
  }
  // ── Rounds (write) ────────────────────────────────────────────────────────
  updateRound(r, e) {
    const n = this.getRoundIndex(r);
    n !== -1 && (this._saveHistory(), this._rounds[n] = { ...this._rounds[n], ...e }, this._emit());
  }
  addRound(r = null) {
    var n;
    this._saveHistory();
    const e = { ...(n = this._contract) == null ? void 0 : n.createRound(), id: B() };
    if (r === null)
      this._rounds.push(e);
    else {
      const a = this.getRoundIndex(r);
      this._rounds.splice(a + 1, 0, e);
    }
    return this._emit(), e.id;
  }
  duplicateRound(r) {
    const e = this.getRound(r);
    if (!e) return null;
    this._saveHistory();
    const n = { ...e, id: B() };
    return this._rounds.splice(this.getRoundIndex(r) + 1, 0, n), this._emit(), n.id;
  }
  removeRound(r) {
    const e = this.getRoundIndex(r);
    e === -1 || this._rounds.length <= 1 || (this._saveHistory(), this._rounds.splice(e, 1), this._emit());
  }
  moveRound(r, e) {
    const n = this.getRoundIndex(r);
    if (n === -1) return;
    this._saveHistory();
    const [a] = this._rounds.splice(n, 1);
    this._rounds.splice(Math.max(0, Math.min(e, this._rounds.length)), 0, a), this._emit();
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
    return this._rounds.map((r) => ({ ...r }));
  }
  // ── Change events ─────────────────────────────────────────────────────────
  onChange(r) {
    return this._handlers.push(r), () => this.offChange(r);
  }
  offChange(r) {
    const e = this._handlers.indexOf(r);
    e !== -1 && this._handlers.splice(e, 1);
  }
  _emit() {
    this._handlers.forEach((r) => r(this));
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
  validate() {
    return !this._contract || this._rounds.every((r) => this._contract.validateRound(r));
  }
  static fromJSON(r, e) {
    let n = J(r);
    const a = (e == null ? void 0 : e.version) ?? 1;
    if (n.version < a && (e != null && e.migrate)) {
      const s = n.id;
      if (n = J(e.migrate(n)), n.id !== s) throw new Error("Migration changed game identity");
    }
    if (n.version !== a) throw new Error("Unsupported content version");
    const o = new S(n, e);
    if (!o.validate()) throw new Error("Invalid round content");
    return o;
  }
  static fromRoundsArray(r, e, n = {}, a = [], o) {
    return new S({ id: r, meta: n, rounds: e, distractors: a, version: (o == null ? void 0 : o.version) ?? 1 }, o);
  }
}
const T = "alefbet.editor.";
function X(t) {
  return ot(`${T}${t}`, null);
}
function wt(t) {
  return X(t.id).set(t.toJSON());
}
function gt(t, r) {
  const e = X(t).get();
  if (!e) return null;
  try {
    const n = S.fromJSON(e, r);
    return n.id === t ? n : null;
  } catch {
    return null;
  }
}
function xt(t) {
  try {
    localStorage.removeItem(`${T}${t}`);
  } catch {
  }
}
function Rt(t) {
  const r = JSON.stringify(t.toJSON(), null, 2), e = new Blob([r], { type: "application/json;charset=utf-8" }), n = URL.createObjectURL(e), a = document.createElement("a");
  a.href = n, a.download = `${t.id}-rounds.json`, a.click(), URL.revokeObjectURL(n);
}
function st() {
  return ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/ogg"].find((r) => MediaRecorder.isTypeSupported(r)) || "";
}
function at() {
  var t;
  return typeof navigator < "u" && typeof ((t = navigator.mediaDevices) == null ? void 0 : t.getUserMedia) == "function" && typeof MediaRecorder < "u";
}
function ct() {
  let t = null, r = null, e = [];
  async function n() {
    if (t && t.state === "recording") return;
    r = await navigator.mediaDevices.getUserMedia({ audio: !0, video: !1 }), e = [];
    const c = {}, u = st();
    u && (c.mimeType = u), t = new MediaRecorder(r, c), t.ondataavailable = (l) => {
      var f;
      ((f = l.data) == null ? void 0 : f.size) > 0 && e.push(l.data);
    }, t.start(100);
  }
  function a() {
    return new Promise((c, u) => {
      if (!t || t.state === "inactive") {
        u(new Error("[voice-recorder] not recording"));
        return;
      }
      t.onstop = () => {
        const l = new Blob(e, { type: t.mimeType || "audio/webm" });
        s(), c(l);
      }, t.onerror = (l) => {
        s(), u(l.error);
      }, t.stop();
    });
  }
  function o() {
    t && t.state !== "inactive" && (t.ondataavailable = null, t.onstop = null, t.stop()), s();
  }
  function s() {
    r == null || r.getTracks().forEach((c) => c.stop()), r = null, t = null, e = [];
  }
  function i() {
    return (t == null ? void 0 : t.state) === "recording";
  }
  return { start: n, stop: a, cancel: o, isActive: i };
}
const ut = "alefbet-voices", b = "recordings", dt = 1;
let L = null;
function O() {
  return L || (L = new Promise((t, r) => {
    const e = indexedDB.open(ut, dt);
    e.onupgradeneeded = () => {
      e.result.createObjectStore(b);
    }, e.onsuccess = () => t(e.result), e.onerror = () => {
      L = null, r(e.error);
    };
  }), L);
}
function j(t, r) {
  return `${t}/${r}`;
}
async function lt(t, r, e) {
  const n = await O();
  return new Promise((a, o) => {
    const s = n.transaction(b, "readwrite");
    s.objectStore(b).put(e, j(t, r)), s.oncomplete = a, s.onerror = (i) => o(i.target.error);
  });
}
async function D(t, r) {
  const e = await O();
  return new Promise((n, a) => {
    const s = e.transaction(b, "readonly").objectStore(b).get(j(t, r));
    s.onsuccess = () => n(s.result ?? null), s.onerror = (i) => a(i.target.error);
  });
}
async function ft(t, r) {
  const e = await O();
  return new Promise((n, a) => {
    const o = e.transaction(b, "readwrite");
    o.objectStore(b).delete(j(t, r)), o.oncomplete = n, o.onerror = (s) => a(s.target.error);
  });
}
async function Et(t) {
  const r = await O();
  return new Promise((e, n) => {
    const o = r.transaction(b, "readonly").objectStore(b).getAllKeys();
    o.onsuccess = () => {
      const s = `${t}/`;
      e(
        (o.result || []).filter((i) => i.startsWith(s)).map((i) => i.slice(s.length))
      );
    }, o.onerror = (s) => n(s.target.error);
  });
}
async function ht(t, r, { signal: e } = {}) {
  if (e != null && e.aborted) return !1;
  let n;
  try {
    n = await D(t, r);
  } catch {
    return !1;
  }
  return !n || e != null && e.aborted ? !1 : await nt(n, { signal: e }) ? !0 : e != null && e.aborted ? !1 : new Promise((a) => {
    const o = URL.createObjectURL(n), s = new Audio(o);
    let i = !1;
    const c = (l) => {
      i || (i = !0, e == null || e.removeEventListener("abort", u), s.onended = null, s.onerror = null, s.pause(), URL.revokeObjectURL(o), a(l));
    }, u = () => c(!1);
    e == null || e.addEventListener("abort", u, { once: !0 }), s.onended = () => c(!0), s.onerror = () => c(!1), s.play().catch(() => c(!1));
  });
}
async function At(t, r) {
  return await D(t, r).catch(() => null) !== null;
}
function Lt(t, {
  gameId: r,
  voiceKey: e,
  label: n = "הקלטת קול",
  onSaved: a,
  onDeleted: o
}) {
  if (!at()) {
    const d = document.createElement("span");
    return d.className = "ab-voice-unsupported", d.textContent = "🎤 הקלטה לא נתמכת בדפדפן זה", t.appendChild(d), { refresh: async () => {
    }, destroy: () => d.remove() };
  }
  const s = ct(), i = document.createElement("div");
  i.className = "ab-voice-btn-wrap", i.setAttribute("aria-label", n), t.appendChild(i);
  let c = "idle", u = null, l = null, f = null, h = null, w = null, _ = null, R = 0;
  function E() {
    if (i.innerHTML = "", c === "idle")
      u = A("🎤", "ab-voice-btn ab-voice-btn--record", "התחל הקלטה", U), i.appendChild(u);
    else if (c === "recording") {
      w = document.createElement("span"), w.className = "ab-voice-indicator", i.appendChild(w);
      const d = document.createElement("span");
      d.className = "ab-voice-timer", d.textContent = "0:00", i.appendChild(d), R = 0, _ = setInterval(() => {
        R++;
        const v = Math.floor(R / 60), C = String(R % 60).padStart(2, "0");
        d.textContent = `${v}:${C}`, R >= 120 && H();
      }, 1e3), l = A("⏹", "ab-voice-btn ab-voice-btn--stop", "עצור הקלטה", H), i.appendChild(l);
    } else c === "has-voice" && (f = A("▶", "ab-voice-btn ab-voice-btn--play", "נגן הקלטה", z), i.appendChild(f), u = A("🎤", "ab-voice-btn ab-voice-btn--re-record", "הקלט מחדש", U), i.appendChild(u), h = A("🗑", "ab-voice-btn ab-voice-btn--delete", "מחק הקלטה", W), i.appendChild(h));
  }
  function A(d, v, C, K) {
    const y = document.createElement("button");
    return y.className = v, y.type = "button", y.title = C, y.setAttribute("aria-label", C), y.textContent = d, y.addEventListener("click", K), y;
  }
  async function U() {
    try {
      await s.start(), c = "recording", E();
    } catch (d) {
      console.warn("[voice-record-button] microphone access denied:", d), Q("לא ניתן לגשת למיקרופון");
    }
  }
  async function H() {
    clearInterval(_);
    try {
      const d = await s.stop();
      await lt(r, e, d), c = "has-voice", E(), a == null || a(d);
    } catch (d) {
      console.warn("[voice-record-button] stop error:", d), c = "idle", E();
    }
  }
  async function z() {
    f == null || f.setAttribute("disabled", "true"), await ht(r, e), f == null || f.removeAttribute("disabled");
  }
  async function W() {
    confirm("למחוק את ההקלטה?") && (await ft(r, e), c = "idle", E(), o == null || o());
  }
  function Q(d) {
    const v = document.createElement("span");
    v.className = "ab-voice-error", v.textContent = d, i.appendChild(v), setTimeout(() => v.remove(), 3e3);
  }
  async function k() {
    if (s.isActive()) return;
    c = await D(r, e).catch(() => null) ? "has-voice" : "idle", E();
  }
  function Z() {
    clearInterval(_), s.isActive() && s.cancel(), i.remove();
  }
  return k(), { refresh: k, destroy: Z };
}
let g = null, p = null, Y = 0, F = 0, x = null, M = 0, P = 0;
const N = /* @__PURE__ */ new Map();
function q(t, r) {
  var e;
  return ((e = document.elementFromPoint(t, r)) == null ? void 0 : e.closest('[data-drop-target="true"]')) || null;
}
function pt(t, r, e) {
  const n = t.getBoundingClientRect();
  Y = n.width / 2, F = n.height / 2, p = t.cloneNode(!0), p.setAttribute("aria-hidden", "true"), p.setAttribute("tabindex", "-1"), Object.assign(p.style, {
    position: "fixed",
    left: "0",
    top: "0",
    width: `${n.width}px`,
    height: `${n.height}px`,
    pointerEvents: "none",
    // keeps it out of elementFromPoint + hit-testing
    zIndex: "9999",
    opacity: "0.85",
    cursor: "grabbing",
    margin: "0",
    willChange: "transform"
    // מקדם שכבת compositor מראש - בלי זה הפריים הראשון של תזוזה עלול לגמגם
  }), G(r, e), document.body.appendChild(p);
}
function G(t, r) {
  p && (p.style.transform = `translate3d(${t - Y}px, ${r - F}px, 0) scale(1.12)`);
}
function mt(t, r) {
  M = t, P = r, x === null && (x = requestAnimationFrame(() => {
    x = null, G(M, P), _t(q(M, P));
  }));
}
function bt() {
  x !== null && (cancelAnimationFrame(x), x = null), p == null || p.remove(), p = null;
}
let m = null;
function _t(t) {
  m !== t && (m == null || m.classList.remove("drop-target--hover"), m = t, t == null || t.classList.add("drop-target--hover"));
}
function vt() {
  m == null || m.classList.remove("drop-target--hover"), m = null;
}
function Ct(t, r, { onTap: e } = {}) {
  t.classList.add("drag-source");
  let n = null, a = null, o = null;
  function s() {
    n && (t.removeEventListener("pointermove", n), t.removeEventListener("pointerup", a), t.removeEventListener("pointercancel", o), n = a = o = null), vt(), bt(), t.classList.remove("drag-source--dragging"), g = null;
  }
  function i(c) {
    if (t.matches(":disabled") || t.getAttribute("aria-disabled") === "true" || c.button !== void 0 && c.button !== 0) return;
    c.preventDefault(), g && s(), g = { el: t, data: r };
    let u = !1;
    const l = () => {
      u = !0, t.classList.add("drag-source--dragging"), pt(t, c.clientX, c.clientY);
    }, f = (h) => Math.hypot(h.clientX - c.clientX, h.clientY - c.clientY) >= 8;
    e || l(), t.setPointerCapture(c.pointerId), n = (h) => {
      !u && f(h) && l(), u && mt(h.clientX, h.clientY);
    }, a = (h) => {
      const w = !u && !f(h), _ = w && e ? null : q(h.clientX, h.clientY);
      if (s(), w && e) {
        e();
        return;
      }
      _ && N.has(_) && N.get(_).onDrop({ data: r, sourceEl: t, targetEl: _ });
    }, o = () => s(), t.addEventListener("pointermove", n), t.addEventListener("pointerup", a), t.addEventListener("pointercancel", o);
  }
  return t.addEventListener("pointerdown", i), {
    destroy() {
      t.removeEventListener("pointerdown", i), (g == null ? void 0 : g.el) === t && s(), t.classList.remove("drag-source");
    }
  };
}
function St(t, r) {
  return t.setAttribute("data-drop-target", "true"), t.classList.add("drop-target--active"), N.set(t, { onDrop: r }), {
    destroy() {
      t.removeAttribute("data-drop-target"), t.classList.remove("drop-target--active", "drop-target--hover"), N.delete(t);
    }
  };
}
export {
  S as G,
  Et as a,
  Ct as b,
  ot as c,
  St as d,
  et as e,
  Lt as f,
  V as g,
  ct as h,
  ft as i,
  At as j,
  at as k,
  gt as l,
  D as m,
  nt as n,
  Rt as o,
  ht as p,
  wt as q,
  xt as r,
  lt as s,
  yt as u
};
