let v = null;
function B() {
  return typeof window > "u" ? null : window.AudioContext || /** @type {any} */
  window.webkitAudioContext || null;
}
function C() {
  const t = B();
  if (!t) return null;
  if (!v)
    try {
      v = new t();
    } catch {
      return null;
    }
  return v;
}
async function G() {
  const t = C();
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
async function P() {
  const t = C();
  if (!t) return null;
  if (t.state === "suspended")
    try {
      await t.resume();
    } catch {
    }
  return t.state === "running" ? t : null;
}
function J(t) {
  return typeof t.arrayBuffer == "function" ? t.arrayBuffer() : new Promise((e, n) => {
    const r = new FileReader();
    r.onload = () => e(
      /** @type {ArrayBuffer} */
      r.result
    ), r.onerror = () => n(r.error), r.readAsArrayBuffer(t);
  });
}
async function q(t, { signal: e } = {}) {
  if (e != null && e.aborted || !t) return !1;
  const n = await P();
  if (e != null && e.aborted || !n || typeof n.decodeAudioData != "function") return !1;
  let r;
  try {
    const o = await J(t);
    r = await new Promise((i, d) => {
      const s = n.decodeAudioData(o, i, d);
      s && typeof s.then == "function" && s.then(i, d);
    });
  } catch {
    return !1;
  }
  return e != null && e.aborted ? !1 : new Promise((o) => {
    let i, d, s = !1;
    const c = (h) => {
      if (!s) {
        if (s = !0, clearTimeout(d), e == null || e.removeEventListener("abort", u), i) {
          i.onended = null;
          try {
            i.stop(), i.disconnect();
          } catch {
          }
        }
        o(h);
      }
    }, u = () => c(!1);
    try {
      i = n.createBufferSource(), i.buffer = r, i.connect(n.destination), i.onended = () => c(!0), e == null || e.addEventListener("abort", u, { once: !0 }), d = setTimeout(() => c(!0), (r.duration + 0.5) * 1e3), i.start(0);
    } catch {
      c(!1);
    }
  });
}
function j(t, e) {
  const n = [];
  function r() {
    try {
      const s = localStorage.getItem(t);
      return s === null ? e : JSON.parse(s);
    } catch {
      return e;
    }
  }
  function o(s) {
    try {
      localStorage.setItem(t, JSON.stringify(s));
    } catch (c) {
      return console.warn(`[createLocalState] שגיאה בשמירת "${t}":`, c), !1;
    }
    return n.forEach((c) => c(s)), !0;
  }
  function i(s) {
    return o(s(r()));
  }
  function d(s) {
    return n.push(s), function() {
      const u = n.indexOf(s);
      u !== -1 && n.splice(u, 1);
    };
  }
  return { get: r, set: o, update: i, subscribe: d };
}
function w(t) {
  return t !== null && typeof t == "object" && !Array.isArray(t);
}
function I(t) {
  if (!w(t) || typeof t.id != "string" || !t.id || !Array.isArray(t.rounds) || !t.rounds.every(w) || t.meta !== void 0 && !w(t.meta) || t.distractors !== void 0 && !Array.isArray(t.distractors))
    throw new Error("Invalid game content");
  const e = t.version ?? 1;
  if (!Number.isInteger(e) || Number(e) < 1) throw new Error("Invalid content version");
  const n = /* @__PURE__ */ new Set();
  for (const r of t.rounds)
    if (r.id !== void 0) {
      if (typeof r.id != "string" || !r.id || n.has(r.id)) throw new Error("Invalid round id");
      n.add(r.id);
    }
  return { ...t, version: e };
}
let U = 0;
function b() {
  return `round-${Date.now()}-${U++}`;
}
class y {
  // redo stack
  constructor(e, n) {
    this._contract = n, this._id = e.id ?? "game", this._version = e.version ?? 1, this._meta = { title: "", type: "multiple-choice", ...e.meta ?? {} }, this._rounds = (e.rounds ?? []).map((r) => ({ ...r, id: r.id || b() })), this._distractors = e.distractors ?? [], this._handlers = [], this._past = [], this._future = [];
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
    var r;
    this._saveHistory();
    const n = { ...(r = this._contract) == null ? void 0 : r.createRound(), id: b() };
    if (e === null)
      this._rounds.push(n);
    else {
      const o = this.getRoundIndex(e);
      this._rounds.splice(o + 1, 0, n);
    }
    return this._emit(), n.id;
  }
  duplicateRound(e) {
    const n = this.getRound(e);
    if (!n) return null;
    this._saveHistory();
    const r = { ...n, id: b() };
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
    const [o] = this._rounds.splice(r, 1);
    this._rounds.splice(Math.max(0, Math.min(n, this._rounds.length)), 0, o), this._emit();
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
  validate() {
    return !this._contract || this._rounds.every((e) => this._contract.validateRound(e));
  }
  static fromJSON(e, n) {
    let r = I(e);
    const o = (n == null ? void 0 : n.version) ?? 1;
    if (r.version < o && (n != null && n.migrate)) {
      const d = r.id;
      if (r = I(n.migrate(r)), r.id !== d) throw new Error("Migration changed game identity");
    }
    if (r.version !== o) throw new Error("Unsupported content version");
    const i = new y(r, n);
    if (!i.validate()) throw new Error("Invalid round content");
    return i;
  }
  static fromRoundsArray(e, n, r = {}, o = [], i) {
    return new y({ id: e, meta: r, rounds: n, distractors: o, version: (i == null ? void 0 : i.version) ?? 1 }, i);
  }
}
const S = "alefbet.editor.";
function O(t) {
  return j(`${S}${t}`, null);
}
function z(t) {
  return O(t.id).set(t.toJSON());
}
function W(t, e) {
  const n = O(t).get();
  if (!n) return null;
  try {
    const r = y.fromJSON(n, e);
    return r.id === t ? r : null;
  } catch {
    return null;
  }
}
function Q(t) {
  try {
    localStorage.removeItem(`${S}${t}`);
  } catch {
  }
}
function Z(t) {
  const e = JSON.stringify(t.toJSON(), null, 2), n = new Blob([e], { type: "application/json;charset=utf-8" }), r = URL.createObjectURL(n), o = document.createElement("a");
  o.href = r, o.download = `${t.id}-rounds.json`, o.click(), URL.revokeObjectURL(r);
}
let p = null, f = null, N = 0, $ = 0, _ = null, x = 0, R = 0;
const m = /* @__PURE__ */ new Map();
function D(t, e) {
  var r;
  const n = (r = document.elementFromPoint(t, e)) == null ? void 0 : r.closest('[data-drop-target="true"]');
  return n && m.has(n) && !n.matches(":disabled") && n.getAttribute("aria-disabled") !== "true" ? n : null;
}
function X(t, e, n) {
  const r = t.getBoundingClientRect();
  N = r.width / 2, $ = r.height / 2, f = t.cloneNode(!0), f.setAttribute("aria-hidden", "true"), f.setAttribute("tabindex", "-1"), Object.assign(f.style, {
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
    // אנימציות המקור גוברות על transform; מעברים גורמים לפיגור אחרי המצביע.
    animation: "none",
    transition: "none",
    willChange: "transform"
    // מקדם שכבת compositor מראש - בלי זה הפריים הראשון של תזוזה עלול לגמגם
  }), H(e, n), document.body.appendChild(f);
}
function H(t, e) {
  f && (f.style.transform = `translate3d(${t - N}px, ${e - $}px, 0) scale(1.12)`);
}
function Y(t, e) {
  x = t, R = e, _ === null && (_ = requestAnimationFrame(() => {
    _ = null, H(x, R), M(D(x, R));
  }));
}
function F() {
  _ !== null && (cancelAnimationFrame(_), _ = null), f == null || f.remove(), f = null;
}
let l = null;
function M(t) {
  l !== t && (l == null || l.classList.remove("drop-target--hover"), l = t, t == null || t.classList.add("drop-target--hover"));
}
function k() {
  l == null || l.classList.remove("drop-target--hover"), l = null;
}
function K(t, e, { onTap: n } = {}) {
  t.classList.add("drag-source");
  let r = null, o = null, i = null, d = null;
  function s() {
    var h;
    r && (t.removeEventListener("pointermove", r), t.removeEventListener("pointerup", o), t.removeEventListener("pointercancel", i), t.removeEventListener("lostpointercapture", i), r = o = i = null), k(), F(), t.classList.remove("drag-source--dragging"), p = null;
    const u = d;
    d = null, u !== null && ((h = t.hasPointerCapture) != null && h.call(t, u)) && t.releasePointerCapture(u);
  }
  function c(u) {
    if (t.matches(":disabled") || t.getAttribute("aria-disabled") === "true" || u.button !== void 0 && u.button !== 0 || d !== null) return;
    u.preventDefault(), p && p.cancel(), p = { el: t, data: e, cancel: s }, d = u.pointerId;
    let h = !1;
    const L = () => {
      h = !0, t.classList.add("drag-source--dragging"), X(t, u.clientX, u.clientY);
    }, A = (a) => Math.hypot(a.clientX - u.clientX, a.clientY - u.clientY) >= 8;
    n || L(), t.setPointerCapture(u.pointerId), r = (a) => {
      a.pointerId === d && (!h && A(a) && L(), h && Y(a.clientX, a.clientY));
    }, o = (a) => {
      if (a.pointerId !== d) return;
      const E = !h && !A(a), g = E && n ? null : D(a.clientX, a.clientY);
      if (s(), E && n) {
        n();
        return;
      }
      g && m.has(g) && m.get(g).onDrop({ data: e, sourceEl: t, targetEl: g });
    }, i = (a) => {
      a.pointerId === d && s();
    }, t.addEventListener("pointermove", r), t.addEventListener("pointerup", o), t.addEventListener("pointercancel", i), t.addEventListener("lostpointercapture", i);
  }
  return t.addEventListener("pointerdown", c), {
    destroy() {
      t.removeEventListener("pointerdown", c), (p == null ? void 0 : p.el) === t && s(), t.classList.remove("drag-source");
    }
  };
}
function T(t, e) {
  return t.setAttribute("data-drop-target", "true"), t.classList.add("drop-target--active"), m.set(t, { onDrop: e }), {
    destroy() {
      t.removeAttribute("data-drop-target"), t.classList.remove("drop-target--active", "drop-target--hover"), m.delete(t);
    }
  };
}
export {
  y as G,
  T as a,
  j as b,
  K as c,
  Z as d,
  P as e,
  Q as f,
  C as g,
  W as l,
  q as p,
  z as s,
  G as u
};
