import { p as O } from "./drag-NEBgUr1u.js";
function U() {
  return ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/ogg"].find((n) => MediaRecorder.isTypeSupported(n)) || "";
}
function $() {
  var e;
  return typeof navigator < "u" && typeof ((e = navigator.mediaDevices) == null ? void 0 : e.getUserMedia) == "function" && typeof MediaRecorder < "u";
}
function q() {
  let e = null, n = null, t = [], s = 0, a = null;
  function i() {
    if ((e == null ? void 0 : e.state) === "recording") return Promise.resolve();
    if (a) return a;
    const f = ++s, b = (async () => {
      const p = await navigator.mediaDevices.getUserMedia({ audio: !0, video: !1 });
      if (f !== s)
        throw p.getTracks().forEach((u) => u.stop()), new DOMException("Recording cancelled", "AbortError");
      n = p, t = [];
      try {
        const u = U();
        e = new MediaRecorder(p, u ? { mimeType: u } : {}), e.ondataavailable = (y) => {
          var h;
          ((h = y.data) == null ? void 0 : h.size) > 0 && t.push(y.data);
        }, e.start(100);
      } catch (u) {
        throw l(), u;
      }
    })();
    return a = b, b.finally(() => {
      a === b && (a = null);
    });
  }
  function r() {
    return new Promise((f, b) => {
      if (!e || e.state === "inactive") {
        b(new Error("[voice-recorder] not recording"));
        return;
      }
      e.onstop = () => {
        const p = new Blob(t, { type: e.mimeType || "audio/webm" });
        l(), f(p);
      }, e.onerror = (p) => {
        l(), b(p.error);
      }, e.stop();
    });
  }
  function o() {
    s++, a = null, e && e.state !== "inactive" && (e.ondataavailable = null, e.onstop = null, e.stop()), l();
  }
  function l() {
    n == null || n.getTracks().forEach((f) => f.stop()), n = null, e = null, t = [];
  }
  function d() {
    return (e == null ? void 0 : e.state) === "recording";
  }
  return { start: i, stop: r, cancel: o, isActive: d };
}
const D = "alefbet-voices", m = "recordings", z = 1;
let R = null;
function A() {
  return R || (R = new Promise((e, n) => {
    const t = indexedDB.open(D, z);
    t.onupgradeneeded = () => {
      t.result.createObjectStore(m);
    }, t.onsuccess = () => e(t.result), t.onerror = () => {
      R = null, n(t.error);
    };
  }), R);
}
function V(e, n) {
  return `${e}/${n}`;
}
async function H(e, n, t) {
  const s = await A();
  return new Promise((a, i) => {
    const r = s.transaction(m, "readwrite");
    r.objectStore(m).put(t, V(e, n)), r.oncomplete = a, r.onerror = (o) => i(o.target.error);
  });
}
async function N(e, n) {
  const t = await A();
  return new Promise((s, a) => {
    const r = t.transaction(m, "readonly").objectStore(m).get(V(e, n));
    r.onsuccess = () => s(r.result ?? null), r.onerror = (o) => a(o.target.error);
  });
}
async function I(e, n) {
  const t = await A();
  return new Promise((s, a) => {
    const i = t.transaction(m, "readwrite");
    i.objectStore(m).delete(V(e, n)), i.oncomplete = s, i.onerror = (r) => a(r.target.error);
  });
}
async function G(e) {
  const n = await A();
  return new Promise((t, s) => {
    const i = n.transaction(m, "readonly").objectStore(m).getAllKeys();
    i.onsuccess = () => {
      const r = `${e}/`;
      t(
        (i.result || []).filter((o) => o.startsWith(r)).map((o) => o.slice(r.length))
      );
    }, i.onerror = (r) => s(r.target.error);
  });
}
async function W(e, n, { signal: t } = {}) {
  if (t != null && t.aborted) return !1;
  let s;
  try {
    s = await N(e, n);
  } catch {
    return !1;
  }
  return !s || t != null && t.aborted ? !1 : await O(s, { signal: t }) ? !0 : t != null && t.aborted ? !1 : new Promise((a) => {
    const i = URL.createObjectURL(s), r = new Audio(i);
    let o = !1;
    const l = (f) => {
      o || (o = !0, t == null || t.removeEventListener("abort", d), r.onended = null, r.onerror = null, r.pause(), URL.revokeObjectURL(i), a(f));
    }, d = () => l(!1);
    t == null || t.addEventListener("abort", d, { once: !0 }), r.onended = () => l(!0), r.onerror = () => l(!1), r.play().catch(() => l(!1));
  });
}
async function J(e, n) {
  return await N(e, n).catch(() => null) !== null;
}
function Q(e, {
  gameId: n,
  voiceKey: t,
  label: s = "הקלטת קול",
  onSaved: a,
  onDeleted: i
}) {
  if (!$()) {
    const c = document.createElement("span");
    return c.className = "ab-voice-unsupported", c.textContent = "🎤 הקלטה לא נתמכת בדפדפן זה", e.appendChild(c), { refresh: async () => {
    }, destroy: () => c.remove() };
  }
  const r = q(), o = document.createElement("div");
  o.className = "ab-voice-btn-wrap", o.setAttribute("aria-label", s), e.appendChild(o);
  let l = "idle", d = !1, f = !1, b = null, p = null, u = null, y = null, h = null, M = null, E = 0;
  function x() {
    if (!d)
      if (o.innerHTML = "", l === "idle")
        b = C("🎤", "ab-voice-btn ab-voice-btn--record", "התחל הקלטה", P), o.appendChild(b);
      else if (l === "recording") {
        h = document.createElement("span"), h.className = "ab-voice-indicator", o.appendChild(h);
        const c = document.createElement("span");
        c.className = "ab-voice-timer", c.textContent = "0:00", o.appendChild(c), E = 0, M = setInterval(() => {
          E++;
          const v = Math.floor(E / 60), _ = String(E % 60).padStart(2, "0");
          c.textContent = `${v}:${_}`, E >= 120 && T();
        }, 1e3), p = C("⏹", "ab-voice-btn ab-voice-btn--stop", "עצור הקלטה", T), o.appendChild(p);
      } else l === "has-voice" && (u = C("▶", "ab-voice-btn ab-voice-btn--play", "נגן הקלטה", S), o.appendChild(u), b = C("🎤", "ab-voice-btn ab-voice-btn--re-record", "הקלט מחדש", P), o.appendChild(b), y = C("🗑", "ab-voice-btn ab-voice-btn--delete", "מחק הקלטה", B), o.appendChild(y));
  }
  function C(c, v, _, k) {
    const w = document.createElement("button");
    return w.className = v, w.type = "button", w.title = _, w.setAttribute("aria-label", _), w.textContent = c, w.addEventListener("click", k), w;
  }
  async function P() {
    if (!(d || f)) {
      f = !0;
      try {
        if (await r.start(), d) return;
        l = "recording", x();
      } catch (c) {
        if (d || (c == null ? void 0 : c.name) === "AbortError") return;
        console.warn("[voice-record-button] microphone access denied:", c), g("לא ניתן לגשת למיקרופון");
      } finally {
        f = !1;
      }
    }
  }
  async function T() {
    clearInterval(M);
    try {
      const c = await r.stop();
      if (d || (await H(n, t, c), d)) return;
      l = "has-voice", x(), a == null || a(c);
    } catch (c) {
      console.warn("[voice-record-button] stop error:", c), l = "idle", x();
    }
  }
  async function S() {
    u == null || u.setAttribute("disabled", "true"), await W(n, t), u == null || u.removeAttribute("disabled");
  }
  async function B() {
    confirm("למחוק את ההקלטה?") && (await I(n, t), l = "idle", x(), i == null || i());
  }
  function g(c) {
    const v = document.createElement("span");
    v.className = "ab-voice-error", v.textContent = c, o.appendChild(v), setTimeout(() => v.remove(), 3e3);
  }
  async function L() {
    if (d || f || r.isActive()) return;
    const c = await N(n, t).catch(() => null);
    d || f || r.isActive() || (l = c ? "has-voice" : "idle", x());
  }
  function j() {
    d = !0, clearInterval(M), r.cancel(), o.remove();
  }
  return L(), { refresh: L, destroy: j };
}
export {
  q as a,
  N as b,
  Q as c,
  I as d,
  J as h,
  $ as i,
  G as l,
  W as p,
  H as s
};
