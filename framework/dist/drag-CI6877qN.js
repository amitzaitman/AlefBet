let O = null;
function tt() {
  return typeof window > "u" ? null : window.AudioContext || /** @type {any} */
  window.webkitAudioContext || null;
}
function T() {
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
async function vt() {
  const t = T();
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
async function et() {
  const t = T();
  if (!t) return null;
  if (t.state === "suspended")
    try {
      await t.resume();
    } catch {
    }
  return t.state === "running" ? t : null;
}
function nt(t) {
  return typeof t.arrayBuffer == "function" ? t.arrayBuffer() : new Promise((e, n) => {
    const r = new FileReader();
    r.onload = () => e(
      /** @type {ArrayBuffer} */
      r.result
    ), r.onerror = () => n(r.error), r.readAsArrayBuffer(t);
  });
}
async function rt(t) {
  if (!t) return !1;
  const e = await et();
  if (!e || typeof e.decodeAudioData != "function") return !1;
  let n;
  try {
    const r = await nt(t);
    n = await new Promise((o, a) => {
      const s = e.decodeAudioData(r, o, a);
      s && typeof s.then == "function" && s.then(o, a);
    });
  } catch {
    return !1;
  }
  return new Promise((r) => {
    try {
      const o = e.createBufferSource();
      o.buffer = n, o.connect(e.destination), o.onended = () => r(!0), o.start(0), setTimeout(() => r(!0), (n.duration + 0.5) * 1e3);
    } catch {
      r(!1);
    }
  });
}
function ot(t, e) {
  const n = [];
  function r() {
    try {
      const i = localStorage.getItem(t);
      return i === null ? e : JSON.parse(i);
    } catch {
      return e;
    }
  }
  function o(i) {
    try {
      localStorage.setItem(t, JSON.stringify(i));
    } catch (c) {
      return console.warn(`[createLocalState] שגיאה בשמירת "${t}":`, c), !1;
    }
    return n.forEach((c) => c(i)), !0;
  }
  function a(i) {
    return o(i(r()));
  }
  function s(i) {
    return n.push(i), function() {
      const d = n.indexOf(i);
      d !== -1 && n.splice(d, 1);
    };
  }
  return { get: r, set: o, update: a, subscribe: s };
}
function I(t) {
  return t !== null && typeof t == "object" && !Array.isArray(t);
}
function J(t) {
  if (!I(t) || typeof t.id != "string" || !t.id || !Array.isArray(t.rounds) || !t.rounds.every(I) || t.meta !== void 0 && !I(t.meta) || t.distractors !== void 0 && !Array.isArray(t.distractors))
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
let it = 0;
function $() {
  return `round-${Date.now()}-${it++}`;
}
class A {
  // redo stack
  constructor(e, n) {
    this._contract = n, this._id = e.id ?? "game", this._version = e.version ?? 1, this._meta = { title: "", type: "multiple-choice", ...e.meta ?? {} }, this._rounds = (e.rounds ?? []).map((r) => ({ ...r, id: r.id || $() })), this._distractors = e.distractors ?? [], this._handlers = [], this._past = [], this._future = [];
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
    const n = { ...(r = this._contract) == null ? void 0 : r.createRound(), id: $() };
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
    let r = J(e);
    const o = (n == null ? void 0 : n.version) ?? 1;
    if (r.version < o && (n != null && n.migrate)) {
      const s = r.id;
      if (r = J(n.migrate(r)), r.id !== s) throw new Error("Migration changed game identity");
    }
    if (r.version !== o) throw new Error("Unsupported content version");
    const a = new A(r, n);
    if (!a.validate()) throw new Error("Invalid round content");
    return a;
  }
  static fromRoundsArray(e, n, r = {}, o = [], a) {
    return new A({ id: e, meta: r, rounds: n, distractors: o, version: (a == null ? void 0 : a.version) ?? 1 }, a);
  }
}
const V = "alefbet.editor.";
function F(t) {
  return ot(`${V}${t}`, null);
}
function yt(t) {
  return F(t.id).set(t.toJSON());
}
function wt(t, e) {
  const n = F(t).get();
  if (!n) return null;
  try {
    const r = A.fromJSON(n, e);
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
  const e = JSON.stringify(t.toJSON(), null, 2), n = new Blob([e], { type: "application/json;charset=utf-8" }), r = URL.createObjectURL(n), o = document.createElement("a");
  o.href = r, o.download = `${t.id}-rounds.json`, o.click(), URL.revokeObjectURL(r);
}
function st() {
  return ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/ogg"].find((e) => MediaRecorder.isTypeSupported(e)) || "";
}
function at() {
  var t;
  return typeof navigator < "u" && typeof ((t = navigator.mediaDevices) == null ? void 0 : t.getUserMedia) == "function" && typeof MediaRecorder < "u";
}
function ct() {
  let t = null, e = null, n = [];
  async function r() {
    if (t && t.state === "recording") return;
    e = await navigator.mediaDevices.getUserMedia({ audio: !0, video: !1 }), n = [];
    const c = {}, d = st();
    d && (c.mimeType = d), t = new MediaRecorder(e, c), t.ondataavailable = (f) => {
      var l;
      ((l = f.data) == null ? void 0 : l.size) > 0 && n.push(f.data);
    }, t.start(100);
  }
  function o() {
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
  function i() {
    return (t == null ? void 0 : t.state) === "recording";
  }
  return { start: r, stop: o, cancel: a, isActive: i };
}
const ut = "alefbet-voices", m = "recordings", dt = 1;
let R = null;
function L() {
  return R || (R = new Promise((t, e) => {
    const n = indexedDB.open(ut, dt);
    n.onupgradeneeded = () => {
      n.result.createObjectStore(m);
    }, n.onsuccess = () => t(n.result), n.onerror = () => {
      R = null, e(n.error);
    };
  }), R);
}
function M(t, e) {
  return `${t}/${e}`;
}
async function lt(t, e, n) {
  const r = await L();
  return new Promise((o, a) => {
    const s = r.transaction(m, "readwrite");
    s.objectStore(m).put(n, M(t, e)), s.oncomplete = o, s.onerror = (i) => a(i.target.error);
  });
}
async function j(t, e) {
  const n = await L();
  return new Promise((r, o) => {
    const s = n.transaction(m, "readonly").objectStore(m).get(M(t, e));
    s.onsuccess = () => r(s.result ?? null), s.onerror = (i) => o(i.target.error);
  });
}
async function ft(t, e) {
  const n = await L();
  return new Promise((r, o) => {
    const a = n.transaction(m, "readwrite");
    a.objectStore(m).delete(M(t, e)), a.oncomplete = r, a.onerror = (s) => o(s.target.error);
  });
}
async function Et(t) {
  const e = await L();
  return new Promise((n, r) => {
    const a = e.transaction(m, "readonly").objectStore(m).getAllKeys();
    a.onsuccess = () => {
      const s = `${t}/`;
      n(
        (a.result || []).filter((i) => i.startsWith(s)).map((i) => i.slice(s.length))
      );
    }, a.onerror = (s) => r(s.target.error);
  });
}
async function ht(t, e) {
  let n;
  try {
    n = await j(t, e);
  } catch {
    return !1;
  }
  return n ? await rt(n) ? !0 : new Promise((r) => {
    const o = URL.createObjectURL(n), a = new Audio(o), s = (i) => {
      URL.revokeObjectURL(o), r(i);
    };
    a.onended = () => s(!0), a.onerror = () => s(!1), a.play().catch(() => s(!1));
  }) : !1;
}
async function At(t, e) {
  return await j(t, e).catch(() => null) !== null;
}
function Ct(t, {
  gameId: e,
  voiceKey: n,
  label: r = "הקלטת קול",
  onSaved: o,
  onDeleted: a
}) {
  if (!at()) {
    const u = document.createElement("span");
    return u.className = "ab-voice-unsupported", u.textContent = "🎤 הקלטה לא נתמכת בדפדפן זה", t.appendChild(u), { refresh: async () => {
    }, destroy: () => u.remove() };
  }
  const s = ct(), i = document.createElement("div");
  i.className = "ab-voice-btn-wrap", i.setAttribute("aria-label", r), t.appendChild(i);
  let c = "idle", d = null, f = null, l = null, U = null, S = null, N = null, y = 0;
  function w() {
    if (i.innerHTML = "", c === "idle")
      d = x("🎤", "ab-voice-btn ab-voice-btn--record", "התחל הקלטה", D), i.appendChild(d);
    else if (c === "recording") {
      S = document.createElement("span"), S.className = "ab-voice-indicator", i.appendChild(S);
      const u = document.createElement("span");
      u.className = "ab-voice-timer", u.textContent = "0:00", i.appendChild(u), y = 0, N = setInterval(() => {
        y++;
        const g = Math.floor(y / 60), E = String(y % 60).padStart(2, "0");
        u.textContent = `${g}:${E}`, y >= 120 && H();
      }, 1e3), f = x("⏹", "ab-voice-btn ab-voice-btn--stop", "עצור הקלטה", H), i.appendChild(f);
    } else c === "has-voice" && (l = x("▶", "ab-voice-btn ab-voice-btn--play", "נגן הקלטה", z), i.appendChild(l), d = x("🎤", "ab-voice-btn ab-voice-btn--re-record", "הקלט מחדש", D), i.appendChild(d), U = x("🗑", "ab-voice-btn ab-voice-btn--delete", "מחק הקלטה", W), i.appendChild(U));
  }
  function x(u, g, E, K) {
    const b = document.createElement("button");
    return b.className = g, b.type = "button", b.title = E, b.setAttribute("aria-label", E), b.textContent = u, b.addEventListener("click", K), b;
  }
  async function D() {
    try {
      await s.start(), c = "recording", w();
    } catch (u) {
      console.warn("[voice-record-button] microphone access denied:", u), Q("לא ניתן לגשת למיקרופון");
    }
  }
  async function H() {
    clearInterval(N);
    try {
      const u = await s.stop();
      await lt(e, n, u), c = "has-voice", w(), o == null || o(u);
    } catch (u) {
      console.warn("[voice-record-button] stop error:", u), c = "idle", w();
    }
  }
  async function z() {
    l == null || l.setAttribute("disabled", "true"), await ht(e, n), l == null || l.removeAttribute("disabled");
  }
  async function W() {
    confirm("למחוק את ההקלטה?") && (await ft(e, n), c = "idle", w(), a == null || a());
  }
  function Q(u) {
    const g = document.createElement("span");
    g.className = "ab-voice-error", g.textContent = u, i.appendChild(g), setTimeout(() => g.remove(), 3e3);
  }
  async function k() {
    if (s.isActive()) return;
    c = await j(e, n).catch(() => null) ? "has-voice" : "idle", w();
  }
  function Z() {
    clearInterval(N), s.isActive() && s.cancel(), i.remove();
  }
  return k(), { refresh: k, destroy: Z };
}
let _ = null, p = null, q = 0, X = 0, v = null, B = 0, P = 0;
const C = /* @__PURE__ */ new Map();
function Y(t, e) {
  var n;
  return ((n = document.elementFromPoint(t, e)) == null ? void 0 : n.closest('[data-drop-target="true"]')) || null;
}
function pt(t, e, n) {
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
  }), G(e, n), document.body.appendChild(p);
}
function G(t, e) {
  p && (p.style.transform = `translate3d(${t - q}px, ${e - X}px, 0) scale(1.12)`);
}
function mt(t, e) {
  B = t, P = e, v === null && (v = requestAnimationFrame(() => {
    v = null, G(B, P), bt(Y(B, P));
  }));
}
function gt() {
  v !== null && (cancelAnimationFrame(v), v = null), p == null || p.remove(), p = null;
}
let h = null;
function bt(t) {
  h !== t && (h == null || h.classList.remove("drop-target--hover"), h = t, t == null || t.classList.add("drop-target--hover"));
}
function _t() {
  h == null || h.classList.remove("drop-target--hover"), h = null;
}
function Lt(t, e) {
  t.classList.add("drag-source");
  let n = null, r = null, o = null;
  function a() {
    n && (t.removeEventListener("pointermove", n), t.removeEventListener("pointerup", r), t.removeEventListener("pointercancel", o), n = r = o = null), _t(), gt(), t.classList.remove("drag-source--dragging"), _ = null;
  }
  function s(i) {
    i.button !== void 0 && i.button !== 0 || (i.preventDefault(), _ && a(), _ = { el: t, data: e }, t.classList.add("drag-source--dragging"), pt(t, i.clientX, i.clientY), t.setPointerCapture(i.pointerId), n = (c) => {
      mt(c.clientX, c.clientY);
    }, r = (c) => {
      const d = Y(c.clientX, c.clientY);
      a(), d && C.has(d) && C.get(d).onDrop({ data: e, sourceEl: t, targetEl: d });
    }, o = () => a(), t.addEventListener("pointermove", n), t.addEventListener("pointerup", r), t.addEventListener("pointercancel", o));
  }
  return t.addEventListener("pointerdown", s), {
    destroy() {
      t.removeEventListener("pointerdown", s), (_ == null ? void 0 : _.el) === t && a(), t.classList.remove("drag-source");
    }
  };
}
function St(t, e) {
  return t.setAttribute("data-drop-target", "true"), t.classList.add("drop-target--active"), C.set(t, { onDrop: e }), {
    destroy() {
      t.removeAttribute("data-drop-target"), t.classList.remove("drop-target--active", "drop-target--hover"), C.delete(t);
    }
  };
}
export {
  A as G,
  Et as a,
  Lt as b,
  ot as c,
  St as d,
  et as e,
  Ct as f,
  T as g,
  ct as h,
  ft as i,
  At as j,
  at as k,
  wt as l,
  j as m,
  rt as n,
  Rt as o,
  ht as p,
  yt as q,
  xt as r,
  lt as s,
  vt as u
};
