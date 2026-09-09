let M = null;
function rt() {
  return typeof window > "u" ? null : window.AudioContext || /** @type {any} */
  window.webkitAudioContext || null;
}
function X() {
  const t = rt();
  if (!t) return null;
  if (!M)
    try {
      M = new t();
    } catch {
      return null;
    }
  return M;
}
async function gt() {
  const t = X();
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
async function nt() {
  const t = X();
  if (!t) return null;
  if (t.state === "suspended")
    try {
      await t.resume();
    } catch {
    }
  return t.state === "running" ? t : null;
}
function ot(t) {
  return typeof t.arrayBuffer == "function" ? t.arrayBuffer() : new Promise((r, e) => {
    const n = new FileReader();
    n.onload = () => r(
      /** @type {ArrayBuffer} */
      n.result
    ), n.onerror = () => e(n.error), n.readAsArrayBuffer(t);
  });
}
async function it(t, { signal: r } = {}) {
  if (r != null && r.aborted || !t) return !1;
  const e = await nt();
  if (r != null && r.aborted || !e || typeof e.decodeAudioData != "function") return !1;
  let n;
  try {
    const a = await ot(t);
    n = await new Promise((o, s) => {
      const i = e.decodeAudioData(a, o, s);
      i && typeof i.then == "function" && i.then(o, s);
    });
  } catch {
    return !1;
  }
  return r != null && r.aborted ? !1 : new Promise((a) => {
    let o, s, i = !1;
    const u = (f) => {
      if (!i) {
        if (i = !0, clearTimeout(s), r == null || r.removeEventListener("abort", c), o) {
          o.onended = null;
          try {
            o.stop(), o.disconnect();
          } catch {
          }
        }
        a(f);
      }
    }, c = () => u(!1);
    try {
      o = e.createBufferSource(), o.buffer = n, o.connect(e.destination), o.onended = () => u(!0), r == null || r.addEventListener("abort", c, { once: !0 }), s = setTimeout(() => u(!0), (n.duration + 0.5) * 1e3), o.start(0);
    } catch {
      u(!1);
    }
  });
}
function st(t, r) {
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
    } catch (u) {
      return console.warn(`[createLocalState] שגיאה בשמירת "${t}":`, u), !1;
    }
    return e.forEach((u) => u(i)), !0;
  }
  function o(i) {
    return a(i(n()));
  }
  function s(i) {
    return e.push(i), function() {
      const c = e.indexOf(i);
      c !== -1 && e.splice(c, 1);
    };
  }
  return { get: n, set: a, update: o, subscribe: s };
}
function $(t) {
  return t !== null && typeof t == "object" && !Array.isArray(t);
}
function V(t) {
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
let at = 0;
function B() {
  return `round-${Date.now()}-${at++}`;
}
class N {
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
    let n = V(r);
    const a = (e == null ? void 0 : e.version) ?? 1;
    if (n.version < a && (e != null && e.migrate)) {
      const s = n.id;
      if (n = V(e.migrate(n)), n.id !== s) throw new Error("Migration changed game identity");
    }
    if (n.version !== a) throw new Error("Unsupported content version");
    const o = new N(n, e);
    if (!o.validate()) throw new Error("Invalid round content");
    return o;
  }
  static fromRoundsArray(r, e, n = {}, a = [], o) {
    return new N({ id: r, meta: n, rounds: e, distractors: a, version: (o == null ? void 0 : o.version) ?? 1 }, o);
  }
}
const Y = "alefbet.editor.";
function q(t) {
  return st(`${Y}${t}`, null);
}
function Et(t) {
  return q(t.id).set(t.toJSON());
}
function xt(t, r) {
  const e = q(t).get();
  if (!e) return null;
  try {
    const n = N.fromJSON(e, r);
    return n.id === t ? n : null;
  } catch {
    return null;
  }
}
function Rt(t) {
  try {
    localStorage.removeItem(`${Y}${t}`);
  } catch {
  }
}
function At(t) {
  const r = JSON.stringify(t.toJSON(), null, 2), e = new Blob([r], { type: "application/json;charset=utf-8" }), n = URL.createObjectURL(e), a = document.createElement("a");
  a.href = n, a.download = `${t.id}-rounds.json`, a.click(), URL.revokeObjectURL(n);
}
function ct() {
  return ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/ogg"].find((r) => MediaRecorder.isTypeSupported(r)) || "";
}
function ut() {
  var t;
  return typeof navigator < "u" && typeof ((t = navigator.mediaDevices) == null ? void 0 : t.getUserMedia) == "function" && typeof MediaRecorder < "u";
}
function dt() {
  let t = null, r = null, e = [], n = 0, a = null;
  function o() {
    if ((t == null ? void 0 : t.state) === "recording") return Promise.resolve();
    if (a) return a;
    const f = ++n, h = (async () => {
      const p = await navigator.mediaDevices.getUserMedia({ audio: !0, video: !1 });
      if (f !== n)
        throw p.getTracks().forEach((d) => d.stop()), new DOMException("Recording cancelled", "AbortError");
      r = p, e = [];
      try {
        const d = ct();
        t = new MediaRecorder(p, d ? { mimeType: d } : {}), t.ondataavailable = (y) => {
          var m;
          ((m = y.data) == null ? void 0 : m.size) > 0 && e.push(y.data);
        }, t.start(100);
      } catch (d) {
        throw u(), d;
      }
    })();
    return a = h, h.finally(() => {
      a === h && (a = null);
    });
  }
  function s() {
    return new Promise((f, h) => {
      if (!t || t.state === "inactive") {
        h(new Error("[voice-recorder] not recording"));
        return;
      }
      t.onstop = () => {
        const p = new Blob(e, { type: t.mimeType || "audio/webm" });
        u(), f(p);
      }, t.onerror = (p) => {
        u(), h(p.error);
      }, t.stop();
    });
  }
  function i() {
    n++, a = null, t && t.state !== "inactive" && (t.ondataavailable = null, t.onstop = null, t.stop()), u();
  }
  function u() {
    r == null || r.getTracks().forEach((f) => f.stop()), r = null, t = null, e = [];
  }
  function c() {
    return (t == null ? void 0 : t.state) === "recording";
  }
  return { start: o, stop: s, cancel: i, isActive: c };
}
const lt = "alefbet-voices", v = "recordings", ft = 1;
let C = null;
function O() {
  return C || (C = new Promise((t, r) => {
    const e = indexedDB.open(lt, ft);
    e.onupgradeneeded = () => {
      e.result.createObjectStore(v);
    }, e.onsuccess = () => t(e.result), e.onerror = () => {
      C = null, r(e.error);
    };
  }), C);
}
function U(t, r) {
  return `${t}/${r}`;
}
async function ht(t, r, e) {
  const n = await O();
  return new Promise((a, o) => {
    const s = n.transaction(v, "readwrite");
    s.objectStore(v).put(e, U(t, r)), s.oncomplete = a, s.onerror = (i) => o(i.target.error);
  });
}
async function k(t, r) {
  const e = await O();
  return new Promise((n, a) => {
    const s = e.transaction(v, "readonly").objectStore(v).get(U(t, r));
    s.onsuccess = () => n(s.result ?? null), s.onerror = (i) => a(i.target.error);
  });
}
async function pt(t, r) {
  const e = await O();
  return new Promise((n, a) => {
    const o = e.transaction(v, "readwrite");
    o.objectStore(v).delete(U(t, r)), o.oncomplete = n, o.onerror = (s) => a(s.target.error);
  });
}
async function Lt(t) {
  const r = await O();
  return new Promise((e, n) => {
    const o = r.transaction(v, "readonly").objectStore(v).getAllKeys();
    o.onsuccess = () => {
      const s = `${t}/`;
      e(
        (o.result || []).filter((i) => i.startsWith(s)).map((i) => i.slice(s.length))
      );
    }, o.onerror = (s) => n(s.target.error);
  });
}
async function mt(t, r, { signal: e } = {}) {
  if (e != null && e.aborted) return !1;
  let n;
  try {
    n = await k(t, r);
  } catch {
    return !1;
  }
  return !n || e != null && e.aborted ? !1 : await it(n, { signal: e }) ? !0 : e != null && e.aborted ? !1 : new Promise((a) => {
    const o = URL.createObjectURL(n), s = new Audio(o);
    let i = !1;
    const u = (f) => {
      i || (i = !0, e == null || e.removeEventListener("abort", c), s.onended = null, s.onerror = null, s.pause(), URL.revokeObjectURL(o), a(f));
    }, c = () => u(!1);
    e == null || e.addEventListener("abort", c, { once: !0 }), s.onended = () => u(!0), s.onerror = () => u(!1), s.play().catch(() => u(!1));
  });
}
async function Ct(t, r) {
  return await k(t, r).catch(() => null) !== null;
}
function St(t, {
  gameId: r,
  voiceKey: e,
  label: n = "הקלטת קול",
  onSaved: a,
  onDeleted: o
}) {
  if (!ut()) {
    const l = document.createElement("span");
    return l.className = "ab-voice-unsupported", l.textContent = "🎤 הקלטה לא נתמכת בדפדפן זה", t.appendChild(l), { refresh: async () => {
    }, destroy: () => l.remove() };
  }
  const s = dt(), i = document.createElement("div");
  i.className = "ab-voice-btn-wrap", i.setAttribute("aria-label", n), t.appendChild(i);
  let u = "idle", c = !1, f = !1, h = null, p = null, d = null, y = null, m = null, P = null, R = 0;
  function A() {
    if (!c)
      if (i.innerHTML = "", u === "idle")
        h = L("🎤", "ab-voice-btn ab-voice-btn--record", "התחל הקלטה", H), i.appendChild(h);
      else if (u === "recording") {
        m = document.createElement("span"), m.className = "ab-voice-indicator", i.appendChild(m);
        const l = document.createElement("span");
        l.className = "ab-voice-timer", l.textContent = "0:00", i.appendChild(l), R = 0, P = setInterval(() => {
          R++;
          const w = Math.floor(R / 60), I = String(R % 60).padStart(2, "0");
          l.textContent = `${w}:${I}`, R >= 120 && J();
        }, 1e3), p = L("⏹", "ab-voice-btn ab-voice-btn--stop", "עצור הקלטה", J), i.appendChild(p);
      } else u === "has-voice" && (d = L("▶", "ab-voice-btn ab-voice-btn--play", "נגן הקלטה", Q), i.appendChild(d), h = L("🎤", "ab-voice-btn ab-voice-btn--re-record", "הקלט מחדש", H), i.appendChild(h), y = L("🗑", "ab-voice-btn ab-voice-btn--delete", "מחק הקלטה", Z), i.appendChild(y));
  }
  function L(l, w, I, et) {
    const g = document.createElement("button");
    return g.className = w, g.type = "button", g.title = I, g.setAttribute("aria-label", I), g.textContent = l, g.addEventListener("click", et), g;
  }
  async function H() {
    if (!(c || f)) {
      f = !0;
      try {
        if (await s.start(), c) return;
        u = "recording", A();
      } catch (l) {
        if (c || (l == null ? void 0 : l.name) === "AbortError") return;
        console.warn("[voice-record-button] microphone access denied:", l), K("לא ניתן לגשת למיקרופון");
      } finally {
        f = !1;
      }
    }
  }
  async function J() {
    clearInterval(P);
    try {
      const l = await s.stop();
      if (c || (await ht(r, e, l), c)) return;
      u = "has-voice", A(), a == null || a(l);
    } catch (l) {
      console.warn("[voice-record-button] stop error:", l), u = "idle", A();
    }
  }
  async function Q() {
    d == null || d.setAttribute("disabled", "true"), await mt(r, e), d == null || d.removeAttribute("disabled");
  }
  async function Z() {
    confirm("למחוק את ההקלטה?") && (await pt(r, e), u = "idle", A(), o == null || o());
  }
  function K(l) {
    const w = document.createElement("span");
    w.className = "ab-voice-error", w.textContent = l, i.appendChild(w), setTimeout(() => w.remove(), 3e3);
  }
  async function T() {
    if (c || f || s.isActive()) return;
    const l = await k(r, e).catch(() => null);
    c || f || s.isActive() || (u = l ? "has-voice" : "idle", A());
  }
  function tt() {
    c = !0, clearInterval(P), s.cancel(), i.remove();
  }
  return T(), { refresh: T, destroy: tt };
}
let E = null, b = null, F = 0, G = 0, x = null, j = 0, D = 0;
const S = /* @__PURE__ */ new Map();
function z(t, r) {
  var n;
  const e = (n = document.elementFromPoint(t, r)) == null ? void 0 : n.closest('[data-drop-target="true"]');
  return e && S.has(e) && !e.matches(":disabled") && e.getAttribute("aria-disabled") !== "true" ? e : null;
}
function bt(t, r, e) {
  const n = t.getBoundingClientRect();
  F = n.width / 2, G = n.height / 2, b = t.cloneNode(!0), b.setAttribute("aria-hidden", "true"), b.setAttribute("tabindex", "-1"), Object.assign(b.style, {
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
    // אנימציות המקור גוברות על transform; מעברים גורמים לפיגור אחרי המצביע.
    animation: "none",
    transition: "none",
    willChange: "transform"
    // מקדם שכבת compositor מראש - בלי זה הפריים הראשון של תזוזה עלול לגמגם
  }), W(r, e), document.body.appendChild(b);
}
function W(t, r) {
  b && (b.style.transform = `translate3d(${t - F}px, ${r - G}px, 0) scale(1.12)`);
}
function _t(t, r) {
  j = t, D = r, x === null && (x = requestAnimationFrame(() => {
    x = null, W(j, D), yt(z(j, D));
  }));
}
function vt() {
  x !== null && (cancelAnimationFrame(x), x = null), b == null || b.remove(), b = null;
}
let _ = null;
function yt(t) {
  _ !== t && (_ == null || _.classList.remove("drop-target--hover"), _ = t, t == null || t.classList.add("drop-target--hover"));
}
function wt() {
  _ == null || _.classList.remove("drop-target--hover"), _ = null;
}
function It(t, r, { onTap: e } = {}) {
  t.classList.add("drag-source");
  let n = null, a = null, o = null, s = null;
  function i() {
    var f;
    n && (t.removeEventListener("pointermove", n), t.removeEventListener("pointerup", a), t.removeEventListener("pointercancel", o), t.removeEventListener("lostpointercapture", o), n = a = o = null), wt(), vt(), t.classList.remove("drag-source--dragging"), E = null;
    const c = s;
    s = null, c !== null && ((f = t.hasPointerCapture) != null && f.call(t, c)) && t.releasePointerCapture(c);
  }
  function u(c) {
    if (t.matches(":disabled") || t.getAttribute("aria-disabled") === "true" || c.button !== void 0 && c.button !== 0 || s !== null) return;
    c.preventDefault(), E && E.cancel(), E = { el: t, data: r, cancel: i }, s = c.pointerId;
    let f = !1;
    const h = () => {
      f = !0, t.classList.add("drag-source--dragging"), bt(t, c.clientX, c.clientY);
    }, p = (d) => Math.hypot(d.clientX - c.clientX, d.clientY - c.clientY) >= 8;
    e || h(), t.setPointerCapture(c.pointerId), n = (d) => {
      d.pointerId === s && (!f && p(d) && h(), f && _t(d.clientX, d.clientY));
    }, a = (d) => {
      if (d.pointerId !== s) return;
      const y = !f && !p(d), m = y && e ? null : z(d.clientX, d.clientY);
      if (i(), y && e) {
        e();
        return;
      }
      m && S.has(m) && S.get(m).onDrop({ data: r, sourceEl: t, targetEl: m });
    }, o = (d) => {
      d.pointerId === s && i();
    }, t.addEventListener("pointermove", n), t.addEventListener("pointerup", a), t.addEventListener("pointercancel", o), t.addEventListener("lostpointercapture", o);
  }
  return t.addEventListener("pointerdown", u), {
    destroy() {
      t.removeEventListener("pointerdown", u), (E == null ? void 0 : E.el) === t && i(), t.classList.remove("drag-source");
    }
  };
}
function Nt(t, r) {
  return t.setAttribute("data-drop-target", "true"), t.classList.add("drop-target--active"), S.set(t, { onDrop: r }), {
    destroy() {
      t.removeAttribute("data-drop-target"), t.classList.remove("drop-target--active", "drop-target--hover"), S.delete(t);
    }
  };
}
export {
  N as G,
  Lt as a,
  It as b,
  st as c,
  Nt as d,
  nt as e,
  St as f,
  X as g,
  dt as h,
  pt as i,
  Ct as j,
  ut as k,
  xt as l,
  k as m,
  it as n,
  At as o,
  mt as p,
  Et as q,
  Rt as r,
  ht as s,
  gt as u
};
