let O = null;
function tt() {
  return typeof window > "u" ? null : window.AudioContext || /** @type {any} */
  window.webkitAudioContext || null;
}
function J() {
  const t = tt();
  if (!t) return null;
  if (!O)
    try {
      O = new t();
    } catch {
      return null;
    }
  return O;
}
async function yt() {
  const t = J();
  if (!t) return !1;
  try {
    t.state === "suspended" && await t.resume();
  } catch {
  }
  try {
    const n = t.createBuffer(1, 1, t.sampleRate || 44100), e = t.createBufferSource();
    e.buffer = n, e.connect(t.destination), e.start(0);
  } catch {
  }
  return t.state === "running";
}
async function et() {
  const t = J();
  if (!t) return null;
  if (t.state === "suspended")
    try {
      await t.resume();
    } catch {
    }
  return t.state === "running" ? t : null;
}
function nt(t) {
  return typeof t.arrayBuffer == "function" ? t.arrayBuffer() : new Promise((n, e) => {
    const r = new FileReader();
    r.onload = () => n(
      /** @type {ArrayBuffer} */
      r.result
    ), r.onerror = () => e(r.error), r.readAsArrayBuffer(t);
  });
}
async function rt(t, { signal: n } = {}) {
  if (n != null && n.aborted || !t) return !1;
  const e = await et();
  if (n != null && n.aborted || !e || typeof e.decodeAudioData != "function") return !1;
  let r;
  try {
    const a = await nt(t);
    r = await new Promise((i, s) => {
      const o = e.decodeAudioData(a, i, s);
      o && typeof o.then == "function" && o.then(i, s);
    });
  } catch {
    return !1;
  }
  return n != null && n.aborted ? !1 : new Promise((a) => {
    let i, s, o = !1;
    const c = (l) => {
      if (!o) {
        if (o = !0, clearTimeout(s), n == null || n.removeEventListener("abort", u), i) {
          i.onended = null;
          try {
            i.stop(), i.disconnect();
          } catch {
          }
        }
        a(l);
      }
    }, u = () => c(!1);
    try {
      i = e.createBufferSource(), i.buffer = r, i.connect(e.destination), i.onended = () => c(!0), n == null || n.addEventListener("abort", u, { once: !0 }), s = setTimeout(() => c(!0), (r.duration + 0.5) * 1e3), i.start(0);
    } catch {
      c(!1);
    }
  });
}
function ot(t, n) {
  const e = [];
  function r() {
    try {
      const o = localStorage.getItem(t);
      return o === null ? n : JSON.parse(o);
    } catch {
      return n;
    }
  }
  function a(o) {
    try {
      localStorage.setItem(t, JSON.stringify(o));
    } catch (c) {
      return console.warn(`[createLocalState] שגיאה בשמירת "${t}":`, c), !1;
    }
    return e.forEach((c) => c(o)), !0;
  }
  function i(o) {
    return a(o(r()));
  }
  function s(o) {
    return e.push(o), function() {
      const u = e.indexOf(o);
      u !== -1 && e.splice(u, 1);
    };
  }
  return { get: r, set: a, update: i, subscribe: s };
}
function I(t) {
  return t !== null && typeof t == "object" && !Array.isArray(t);
}
function T(t) {
  if (!I(t) || typeof t.id != "string" || !t.id || !Array.isArray(t.rounds) || !t.rounds.every(I) || t.meta !== void 0 && !I(t.meta) || t.distractors !== void 0 && !Array.isArray(t.distractors))
    throw new Error("Invalid game content");
  const n = t.version ?? 1;
  if (!Number.isInteger(n) || Number(n) < 1) throw new Error("Invalid content version");
  const e = /* @__PURE__ */ new Set();
  for (const r of t.rounds)
    if (r.id !== void 0) {
      if (typeof r.id != "string" || !r.id || e.has(r.id)) throw new Error("Invalid round id");
      e.add(r.id);
    }
  return { ...t, version: n };
}
let it = 0;
function $() {
  return `round-${Date.now()}-${it++}`;
}
class A {
  // redo stack
  constructor(n, e) {
    this._contract = e, this._id = n.id ?? "game", this._version = n.version ?? 1, this._meta = { title: "", type: "multiple-choice", ...n.meta ?? {} }, this._rounds = (n.rounds ?? []).map((r) => ({ ...r, id: r.id || $() })), this._distractors = n.distractors ?? [], this._handlers = [], this._past = [], this._future = [];
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
  getRound(n) {
    return this._rounds.find((e) => e.id === n) ?? null;
  }
  getRoundIndex(n) {
    return this._rounds.findIndex((e) => e.id === n);
  }
  // ── Rounds (write) ────────────────────────────────────────────────────────
  updateRound(n, e) {
    const r = this.getRoundIndex(n);
    r !== -1 && (this._saveHistory(), this._rounds[r] = { ...this._rounds[r], ...e }, this._emit());
  }
  addRound(n = null) {
    var r;
    this._saveHistory();
    const e = { ...(r = this._contract) == null ? void 0 : r.createRound(), id: $() };
    if (n === null)
      this._rounds.push(e);
    else {
      const a = this.getRoundIndex(n);
      this._rounds.splice(a + 1, 0, e);
    }
    return this._emit(), e.id;
  }
  duplicateRound(n) {
    const e = this.getRound(n);
    if (!e) return null;
    this._saveHistory();
    const r = { ...e, id: $() };
    return this._rounds.splice(this.getRoundIndex(n) + 1, 0, r), this._emit(), r.id;
  }
  removeRound(n) {
    const e = this.getRoundIndex(n);
    e === -1 || this._rounds.length <= 1 || (this._saveHistory(), this._rounds.splice(e, 1), this._emit());
  }
  moveRound(n, e) {
    const r = this.getRoundIndex(n);
    if (r === -1) return;
    this._saveHistory();
    const [a] = this._rounds.splice(r, 1);
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
    return this._rounds.map((n) => ({ ...n }));
  }
  // ── Change events ─────────────────────────────────────────────────────────
  onChange(n) {
    return this._handlers.push(n), () => this.offChange(n);
  }
  offChange(n) {
    const e = this._handlers.indexOf(n);
    e !== -1 && this._handlers.splice(e, 1);
  }
  _emit() {
    this._handlers.forEach((n) => n(this));
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
    return !this._contract || this._rounds.every((n) => this._contract.validateRound(n));
  }
  static fromJSON(n, e) {
    let r = T(n);
    const a = (e == null ? void 0 : e.version) ?? 1;
    if (r.version < a && (e != null && e.migrate)) {
      const s = r.id;
      if (r = T(e.migrate(r)), r.id !== s) throw new Error("Migration changed game identity");
    }
    if (r.version !== a) throw new Error("Unsupported content version");
    const i = new A(r, e);
    if (!i.validate()) throw new Error("Invalid round content");
    return i;
  }
  static fromRoundsArray(n, e, r = {}, a = [], i) {
    return new A({ id: n, meta: r, rounds: e, distractors: a, version: (i == null ? void 0 : i.version) ?? 1 }, i);
  }
}
const V = "alefbet.editor.";
function F(t) {
  return ot(`${V}${t}`, null);
}
function wt(t) {
  return F(t.id).set(t.toJSON());
}
function gt(t, n) {
  const e = F(t).get();
  if (!e) return null;
  try {
    const r = A.fromJSON(e, n);
    return r.id === t ? r : null;
  } catch {
    return null;
  }
}
function xt(t) {
  try {
    localStorage.removeItem(`${V}${t}`);
  } catch {
  }
}
function Rt(t) {
  const n = JSON.stringify(t.toJSON(), null, 2), e = new Blob([n], { type: "application/json;charset=utf-8" }), r = URL.createObjectURL(e), a = document.createElement("a");
  a.href = r, a.download = `${t.id}-rounds.json`, a.click(), URL.revokeObjectURL(r);
}
function st() {
  return ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/ogg"].find((n) => MediaRecorder.isTypeSupported(n)) || "";
}
function at() {
  var t;
  return typeof navigator < "u" && typeof ((t = navigator.mediaDevices) == null ? void 0 : t.getUserMedia) == "function" && typeof MediaRecorder < "u";
}
function ct() {
  let t = null, n = null, e = [];
  async function r() {
    if (t && t.state === "recording") return;
    n = await navigator.mediaDevices.getUserMedia({ audio: !0, video: !1 }), e = [];
    const c = {}, u = st();
    u && (c.mimeType = u), t = new MediaRecorder(n, c), t.ondataavailable = (l) => {
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
  function i() {
    t && t.state !== "inactive" && (t.ondataavailable = null, t.onstop = null, t.stop()), s();
  }
  function s() {
    n == null || n.getTracks().forEach((c) => c.stop()), n = null, t = null, e = [];
  }
  function o() {
    return (t == null ? void 0 : t.state) === "recording";
  }
  return { start: r, stop: a, cancel: i, isActive: o };
}
const ut = "alefbet-voices", m = "recordings", dt = 1;
let R = null;
function C() {
  return R || (R = new Promise((t, n) => {
    const e = indexedDB.open(ut, dt);
    e.onupgradeneeded = () => {
      e.result.createObjectStore(m);
    }, e.onsuccess = () => t(e.result), e.onerror = () => {
      R = null, n(e.error);
    };
  }), R);
}
function M(t, n) {
  return `${t}/${n}`;
}
async function lt(t, n, e) {
  const r = await C();
  return new Promise((a, i) => {
    const s = r.transaction(m, "readwrite");
    s.objectStore(m).put(e, M(t, n)), s.oncomplete = a, s.onerror = (o) => i(o.target.error);
  });
}
async function j(t, n) {
  const e = await C();
  return new Promise((r, a) => {
    const s = e.transaction(m, "readonly").objectStore(m).get(M(t, n));
    s.onsuccess = () => r(s.result ?? null), s.onerror = (o) => a(o.target.error);
  });
}
async function ft(t, n) {
  const e = await C();
  return new Promise((r, a) => {
    const i = e.transaction(m, "readwrite");
    i.objectStore(m).delete(M(t, n)), i.oncomplete = r, i.onerror = (s) => a(s.target.error);
  });
}
async function Et(t) {
  const n = await C();
  return new Promise((e, r) => {
    const i = n.transaction(m, "readonly").objectStore(m).getAllKeys();
    i.onsuccess = () => {
      const s = `${t}/`;
      e(
        (i.result || []).filter((o) => o.startsWith(s)).map((o) => o.slice(s.length))
      );
    }, i.onerror = (s) => r(s.target.error);
  });
}
async function ht(t, n, { signal: e } = {}) {
  if (e != null && e.aborted) return !1;
  let r;
  try {
    r = await j(t, n);
  } catch {
    return !1;
  }
  return !r || e != null && e.aborted ? !1 : await rt(r, { signal: e }) ? !0 : e != null && e.aborted ? !1 : new Promise((a) => {
    const i = URL.createObjectURL(r), s = new Audio(i);
    let o = !1;
    const c = (l) => {
      o || (o = !0, e == null || e.removeEventListener("abort", u), s.onended = null, s.onerror = null, s.pause(), URL.revokeObjectURL(i), a(l));
    }, u = () => c(!1);
    e == null || e.addEventListener("abort", u, { once: !0 }), s.onended = () => c(!0), s.onerror = () => c(!1), s.play().catch(() => c(!1));
  });
}
async function At(t, n) {
  return await j(t, n).catch(() => null) !== null;
}
function Lt(t, {
  gameId: n,
  voiceKey: e,
  label: r = "הקלטת קול",
  onSaved: a,
  onDeleted: i
}) {
  if (!at()) {
    const d = document.createElement("span");
    return d.className = "ab-voice-unsupported", d.textContent = "🎤 הקלטה לא נתמכת בדפדפן זה", t.appendChild(d), { refresh: async () => {
    }, destroy: () => d.remove() };
  }
  const s = ct(), o = document.createElement("div");
  o.className = "ab-voice-btn-wrap", o.setAttribute("aria-label", r), t.appendChild(o);
  let c = "idle", u = null, l = null, f = null, U = null, S = null, N = null, w = 0;
  function g() {
    if (o.innerHTML = "", c === "idle")
      u = x("🎤", "ab-voice-btn ab-voice-btn--record", "התחל הקלטה", D), o.appendChild(u);
    else if (c === "recording") {
      S = document.createElement("span"), S.className = "ab-voice-indicator", o.appendChild(S);
      const d = document.createElement("span");
      d.className = "ab-voice-timer", d.textContent = "0:00", o.appendChild(d), w = 0, N = setInterval(() => {
        w++;
        const b = Math.floor(w / 60), E = String(w % 60).padStart(2, "0");
        d.textContent = `${b}:${E}`, w >= 120 && H();
      }, 1e3), l = x("⏹", "ab-voice-btn ab-voice-btn--stop", "עצור הקלטה", H), o.appendChild(l);
    } else c === "has-voice" && (f = x("▶", "ab-voice-btn ab-voice-btn--play", "נגן הקלטה", z), o.appendChild(f), u = x("🎤", "ab-voice-btn ab-voice-btn--re-record", "הקלט מחדש", D), o.appendChild(u), U = x("🗑", "ab-voice-btn ab-voice-btn--delete", "מחק הקלטה", W), o.appendChild(U));
  }
  function x(d, b, E, K) {
    const _ = document.createElement("button");
    return _.className = b, _.type = "button", _.title = E, _.setAttribute("aria-label", E), _.textContent = d, _.addEventListener("click", K), _;
  }
  async function D() {
    try {
      await s.start(), c = "recording", g();
    } catch (d) {
      console.warn("[voice-record-button] microphone access denied:", d), Q("לא ניתן לגשת למיקרופון");
    }
  }
  async function H() {
    clearInterval(N);
    try {
      const d = await s.stop();
      await lt(n, e, d), c = "has-voice", g(), a == null || a(d);
    } catch (d) {
      console.warn("[voice-record-button] stop error:", d), c = "idle", g();
    }
  }
  async function z() {
    f == null || f.setAttribute("disabled", "true"), await ht(n, e), f == null || f.removeAttribute("disabled");
  }
  async function W() {
    confirm("למחוק את ההקלטה?") && (await ft(n, e), c = "idle", g(), i == null || i());
  }
  function Q(d) {
    const b = document.createElement("span");
    b.className = "ab-voice-error", b.textContent = d, o.appendChild(b), setTimeout(() => b.remove(), 3e3);
  }
  async function k() {
    if (s.isActive()) return;
    c = await j(n, e).catch(() => null) ? "has-voice" : "idle", g();
  }
  function Z() {
    clearInterval(N), s.isActive() && s.cancel(), o.remove();
  }
  return k(), { refresh: k, destroy: Z };
}
let v = null, p = null, q = 0, X = 0, y = null, B = 0, P = 0;
const L = /* @__PURE__ */ new Map();
function Y(t, n) {
  var e;
  return ((e = document.elementFromPoint(t, n)) == null ? void 0 : e.closest('[data-drop-target="true"]')) || null;
}
function pt(t, n, e) {
  const r = t.getBoundingClientRect();
  q = r.width / 2, X = r.height / 2, p = t.cloneNode(!0), Object.assign(p.style, {
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
  }), G(n, e), document.body.appendChild(p);
}
function G(t, n) {
  p && (p.style.transform = `translate3d(${t - q}px, ${n - X}px, 0) scale(1.12)`);
}
function mt(t, n) {
  B = t, P = n, y === null && (y = requestAnimationFrame(() => {
    y = null, G(B, P), _t(Y(B, P));
  }));
}
function bt() {
  y !== null && (cancelAnimationFrame(y), y = null), p == null || p.remove(), p = null;
}
let h = null;
function _t(t) {
  h !== t && (h == null || h.classList.remove("drop-target--hover"), h = t, t == null || t.classList.add("drop-target--hover"));
}
function vt() {
  h == null || h.classList.remove("drop-target--hover"), h = null;
}
function Ct(t, n) {
  t.classList.add("drag-source");
  let e = null, r = null, a = null;
  function i() {
    e && (t.removeEventListener("pointermove", e), t.removeEventListener("pointerup", r), t.removeEventListener("pointercancel", a), e = r = a = null), vt(), bt(), t.classList.remove("drag-source--dragging"), v = null;
  }
  function s(o) {
    o.button !== void 0 && o.button !== 0 || (o.preventDefault(), v && i(), v = { el: t, data: n }, t.classList.add("drag-source--dragging"), pt(t, o.clientX, o.clientY), t.setPointerCapture(o.pointerId), e = (c) => {
      mt(c.clientX, c.clientY);
    }, r = (c) => {
      const u = Y(c.clientX, c.clientY);
      i(), u && L.has(u) && L.get(u).onDrop({ data: n, sourceEl: t, targetEl: u });
    }, a = () => i(), t.addEventListener("pointermove", e), t.addEventListener("pointerup", r), t.addEventListener("pointercancel", a));
  }
  return t.addEventListener("pointerdown", s), {
    destroy() {
      t.removeEventListener("pointerdown", s), (v == null ? void 0 : v.el) === t && i(), t.classList.remove("drag-source");
    }
  };
}
function St(t, n) {
  return t.setAttribute("data-drop-target", "true"), t.classList.add("drop-target--active"), L.set(t, { onDrop: n }), {
    destroy() {
      t.removeAttribute("data-drop-target"), t.classList.remove("drop-target--active", "drop-target--hover"), L.delete(t);
    }
  };
}
export {
  A as G,
  Et as a,
  Ct as b,
  ot as c,
  St as d,
  et as e,
  Lt as f,
  J as g,
  ct as h,
  ft as i,
  At as j,
  at as k,
  gt as l,
  j as m,
  rt as n,
  Rt as o,
  ht as p,
  wt as q,
  xt as r,
  lt as s,
  yt as u
};
