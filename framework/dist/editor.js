import { b as Vt, d as Ht, f as lt, c as Yt, o as Gt, q as Xt } from "./drag-BVpjy2vl.js";
import { G as aa, r as ca, l as ua } from "./drag-BVpjy2vl.js";
function Kt(e, { onClick: t } = {}) {
  const n = document.createElement("div");
  n.className = "ab-editor-overlay", t && n.addEventListener("pointerdown", t);
  function o() {
    n.parentElement || (e.style.position = "relative", e.appendChild(n));
  }
  function r() {
    n.remove();
  }
  function i() {
    r();
  }
  return { show: o, hide: r, destroy: i };
}
function qt(e, t, { onSelectRound: n, onAddRound: o, onDuplicateRound: r, onMoveRound: i }) {
  const s = document.createElement("div");
  s.className = "ab-editor-nav", s.setAttribute("aria-label", "ניווט סיבובים");
  const a = document.createElement("div");
  a.className = "ab-editor-nav__header", a.textContent = "סיבובים", s.appendChild(a);
  const c = document.createElement("div");
  c.className = "ab-editor-nav__list", s.appendChild(c);
  const u = document.createElement("button");
  u.className = "ab-editor-nav__add", u.textContent = "+ הוסף", u.addEventListener("click", () => o(null)), s.appendChild(u), e.appendChild(s);
  let l = null, d = [];
  function _() {
    d.forEach((C) => C.destroy()), d = [];
  }
  function f(C, S) {
    const m = document.createElement("div");
    m.className = "ab-editor-nav__thumb", C.id === l && m.classList.add("ab-editor-nav__thumb--active"), m.setAttribute("role", "button"), m.setAttribute("tabindex", "0"), m.setAttribute("aria-label", `סיבוב ${S + 1}`), m.dataset.roundId = C.id, C.image && (m.style.backgroundImage = `url(${C.image})`, m.classList.add("ab-editor-nav__thumb--has-img"));
    const k = document.createElement("div");
    k.className = "ab-editor-nav__grip", k.innerHTML = "⠿", k.setAttribute("aria-hidden", "true"), k.title = "גרור לשינוי סדר", m.appendChild(k);
    const b = document.createElement("div");
    if (b.className = "ab-editor-nav__num", b.textContent = String(S + 1), m.appendChild(b), C.correctEmoji && !C.image) {
      const z = document.createElement("div");
      z.className = "ab-editor-nav__emoji", z.textContent = C.correctEmoji, m.appendChild(z);
    }
    if (C.target) {
      const z = document.createElement("div");
      z.className = "ab-editor-nav__letter", z.textContent = C.target, m.appendChild(z);
    }
    const $ = document.createElement("button");
    return $.className = "ab-editor-nav__dup", $.innerHTML = "⧉", $.title = "שכפל סיבוב", $.setAttribute("aria-label", "שכפל סיבוב"), $.addEventListener("click", (z) => {
      z.stopPropagation(), r(C.id);
    }), m.appendChild($), m.addEventListener("click", () => n(C.id)), m.addEventListener("keydown", (z) => {
      (z.key === "Enter" || z.key === " ") && (z.preventDefault(), n(C.id));
    }), d.push(Vt(k, { roundId: C.id })), d.push(Ht(m, ({ data: z }) => {
      z.roundId !== C.id && i(z.roundId, t.getRoundIndex(C.id));
    })), m;
  }
  function v() {
    _(), c.innerHTML = "", t.rounds.forEach((C, S) => c.appendChild(f(C, S)));
  }
  function w(C) {
    l = C, c.querySelectorAll(".ab-editor-nav__thumb").forEach((S) => {
      S.classList.toggle("ab-editor-nav__thumb--active", S.dataset.roundId === C);
    });
  }
  function N() {
    _(), s.remove();
  }
  return v(), { refresh: v, setActiveRound: w, destroy: N };
}
function h(e, t, n) {
  function o(a, c) {
    if (a._zod || Object.defineProperty(a, "_zod", {
      value: {
        def: c,
        constr: s,
        traits: /* @__PURE__ */ new Set()
      },
      enumerable: !1
    }), a._zod.traits.has(e))
      return;
    a._zod.traits.add(e), t(a, c);
    const u = s.prototype, l = Object.keys(u);
    for (let d = 0; d < l.length; d++) {
      const _ = l[d];
      _ in a || (a[_] = u[_].bind(a));
    }
  }
  const r = (n == null ? void 0 : n.Parent) ?? Object;
  class i extends r {
  }
  Object.defineProperty(i, "name", { value: e });
  function s(a) {
    var c;
    const u = n != null && n.Parent ? new i() : this;
    o(u, a), (c = u._zod).deferred ?? (c.deferred = []);
    for (const l of u._zod.deferred)
      l();
    return u;
  }
  return Object.defineProperty(s, "init", { value: o }), Object.defineProperty(s, Symbol.hasInstance, {
    value: (a) => {
      var c, u;
      return n != null && n.Parent && a instanceof n.Parent ? !0 : (u = (c = a == null ? void 0 : a._zod) == null ? void 0 : c.traits) == null ? void 0 : u.has(e);
    }
  }), Object.defineProperty(s, "name", { value: e }), s;
}
class re extends Error {
  constructor() {
    super("Encountered Promise during synchronous parse. Use .parseAsync() instead.");
  }
}
class dt extends Error {
  constructor(t) {
    super(`Encountered unidirectional transform during encode: ${t}`), this.name = "ZodEncodeError";
  }
}
const ht = {};
function K(e) {
  return ht;
}
function pt(e) {
  const t = Object.values(e).filter((o) => typeof o == "number");
  return Object.entries(e).filter(([o, r]) => t.indexOf(+o) === -1).map(([o, r]) => r);
}
function Ce(e, t) {
  return typeof t == "bigint" ? t.toString() : t;
}
function Oe(e) {
  return {
    get value() {
      {
        const t = e();
        return Object.defineProperty(this, "value", { value: t }), t;
      }
    }
  };
}
function Ie(e) {
  return e == null;
}
function xe(e) {
  const t = e.startsWith("^") ? 1 : 0, n = e.endsWith("$") ? e.length - 1 : e.length;
  return e.slice(t, n);
}
function Wt(e, t) {
  const n = (e.toString().split(".")[1] || "").length, o = t.toString();
  let r = (o.split(".")[1] || "").length;
  if (r === 0 && /\d?e-\d?/.test(o)) {
    const c = o.match(/\d?e-(\d?)/);
    c != null && c[1] && (r = Number.parseInt(c[1]));
  }
  const i = n > r ? n : r, s = Number.parseInt(e.toFixed(i).replace(".", "")), a = Number.parseInt(t.toFixed(i).replace(".", ""));
  return s % a / 10 ** i;
}
const Ue = Symbol("evaluating");
function T(e, t, n) {
  let o;
  Object.defineProperty(e, t, {
    get() {
      if (o !== Ue)
        return o === void 0 && (o = Ue, o = n()), o;
    },
    set(r) {
      Object.defineProperty(e, t, {
        value: r
        // configurable: true,
      });
    },
    configurable: !0
  });
}
function te(e, t, n) {
  Object.defineProperty(e, t, {
    value: n,
    writable: !0,
    enumerable: !0,
    configurable: !0
  });
}
function W(...e) {
  const t = {};
  for (const n of e) {
    const o = Object.getOwnPropertyDescriptors(n);
    Object.assign(t, o);
  }
  return Object.defineProperties({}, t);
}
function Be(e) {
  return JSON.stringify(e);
}
function Qt(e) {
  return e.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
const ft = "captureStackTrace" in Error ? Error.captureStackTrace : (...e) => {
};
function me(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
const en = Oe(() => {
  var e;
  if (typeof navigator < "u" && ((e = navigator == null ? void 0 : navigator.userAgent) != null && e.includes("Cloudflare")))
    return !1;
  try {
    const t = Function;
    return new t(""), !0;
  } catch {
    return !1;
  }
});
function ie(e) {
  if (me(e) === !1)
    return !1;
  const t = e.constructor;
  if (t === void 0 || typeof t != "function")
    return !0;
  const n = t.prototype;
  return !(me(n) === !1 || Object.prototype.hasOwnProperty.call(n, "isPrototypeOf") === !1);
}
function mt(e) {
  return ie(e) ? { ...e } : Array.isArray(e) ? [...e] : e;
}
const tn = /* @__PURE__ */ new Set(["string", "number", "symbol"]);
function we(e) {
  return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function Q(e, t, n) {
  const o = new e._zod.constr(t ?? e._zod.def);
  return (!t || n != null && n.parent) && (o._zod.parent = e), o;
}
function y(e) {
  const t = e;
  if (!t)
    return {};
  if (typeof t == "string")
    return { error: () => t };
  if ((t == null ? void 0 : t.message) !== void 0) {
    if ((t == null ? void 0 : t.error) !== void 0)
      throw new Error("Cannot specify both `message` and `error` params");
    t.error = t.message;
  }
  return delete t.message, typeof t.error == "string" ? { ...t, error: () => t.error } : t;
}
function nn(e) {
  return Object.keys(e).filter((t) => e[t]._zod.optin === "optional" && e[t]._zod.optout === "optional");
}
const on = {
  safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
  int32: [-2147483648, 2147483647],
  uint32: [0, 4294967295],
  float32: [-34028234663852886e22, 34028234663852886e22],
  float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
};
function rn(e, t) {
  const n = e._zod.def, o = n.checks;
  if (o && o.length > 0)
    throw new Error(".pick() cannot be used on object schemas containing refinements");
  const i = W(e._zod.def, {
    get shape() {
      const s = {};
      for (const a in t) {
        if (!(a in n.shape))
          throw new Error(`Unrecognized key: "${a}"`);
        t[a] && (s[a] = n.shape[a]);
      }
      return te(this, "shape", s), s;
    },
    checks: []
  });
  return Q(e, i);
}
function sn(e, t) {
  const n = e._zod.def, o = n.checks;
  if (o && o.length > 0)
    throw new Error(".omit() cannot be used on object schemas containing refinements");
  const i = W(e._zod.def, {
    get shape() {
      const s = { ...e._zod.def.shape };
      for (const a in t) {
        if (!(a in n.shape))
          throw new Error(`Unrecognized key: "${a}"`);
        t[a] && delete s[a];
      }
      return te(this, "shape", s), s;
    },
    checks: []
  });
  return Q(e, i);
}
function an(e, t) {
  if (!ie(t))
    throw new Error("Invalid input to extend: expected a plain object");
  const n = e._zod.def.checks;
  if (n && n.length > 0) {
    const i = e._zod.def.shape;
    for (const s in t)
      if (Object.getOwnPropertyDescriptor(i, s) !== void 0)
        throw new Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
  }
  const r = W(e._zod.def, {
    get shape() {
      const i = { ...e._zod.def.shape, ...t };
      return te(this, "shape", i), i;
    }
  });
  return Q(e, r);
}
function cn(e, t) {
  if (!ie(t))
    throw new Error("Invalid input to safeExtend: expected a plain object");
  const n = W(e._zod.def, {
    get shape() {
      const o = { ...e._zod.def.shape, ...t };
      return te(this, "shape", o), o;
    }
  });
  return Q(e, n);
}
function un(e, t) {
  const n = W(e._zod.def, {
    get shape() {
      const o = { ...e._zod.def.shape, ...t._zod.def.shape };
      return te(this, "shape", o), o;
    },
    get catchall() {
      return t._zod.def.catchall;
    },
    checks: []
    // delete existing checks
  });
  return Q(e, n);
}
function ln(e, t, n) {
  const r = t._zod.def.checks;
  if (r && r.length > 0)
    throw new Error(".partial() cannot be used on object schemas containing refinements");
  const s = W(t._zod.def, {
    get shape() {
      const a = t._zod.def.shape, c = { ...a };
      if (n)
        for (const u in n) {
          if (!(u in a))
            throw new Error(`Unrecognized key: "${u}"`);
          n[u] && (c[u] = e ? new e({
            type: "optional",
            innerType: a[u]
          }) : a[u]);
        }
      else
        for (const u in a)
          c[u] = e ? new e({
            type: "optional",
            innerType: a[u]
          }) : a[u];
      return te(this, "shape", c), c;
    },
    checks: []
  });
  return Q(t, s);
}
function dn(e, t, n) {
  const o = W(t._zod.def, {
    get shape() {
      const r = t._zod.def.shape, i = { ...r };
      if (n)
        for (const s in n) {
          if (!(s in i))
            throw new Error(`Unrecognized key: "${s}"`);
          n[s] && (i[s] = new e({
            type: "nonoptional",
            innerType: r[s]
          }));
        }
      else
        for (const s in r)
          i[s] = new e({
            type: "nonoptional",
            innerType: r[s]
          });
      return te(this, "shape", i), i;
    }
  });
  return Q(t, o);
}
function ne(e, t = 0) {
  var n;
  if (e.aborted === !0)
    return !0;
  for (let o = t; o < e.issues.length; o++)
    if (((n = e.issues[o]) == null ? void 0 : n.continue) !== !0)
      return !0;
  return !1;
}
function oe(e, t) {
  return t.map((n) => {
    var o;
    return (o = n).path ?? (o.path = []), n.path.unshift(e), n;
  });
}
function he(e) {
  return typeof e == "string" ? e : e == null ? void 0 : e.message;
}
function q(e, t, n) {
  var r, i, s, a, c, u;
  const o = { ...e, path: e.path ?? [] };
  if (!e.message) {
    const l = he((s = (i = (r = e.inst) == null ? void 0 : r._zod.def) == null ? void 0 : i.error) == null ? void 0 : s.call(i, e)) ?? he((a = t == null ? void 0 : t.error) == null ? void 0 : a.call(t, e)) ?? he((c = n.customError) == null ? void 0 : c.call(n, e)) ?? he((u = n.localeError) == null ? void 0 : u.call(n, e)) ?? "Invalid input";
    o.message = l;
  }
  return delete o.inst, delete o.continue, t != null && t.reportInput || delete o.input, o;
}
function Pe(e) {
  return Array.isArray(e) ? "array" : typeof e == "string" ? "string" : "unknown";
}
function ue(...e) {
  const [t, n, o] = e;
  return typeof t == "string" ? {
    message: t,
    code: "custom",
    input: n,
    inst: o
  } : { ...t };
}
const _t = (e, t) => {
  e.name = "$ZodError", Object.defineProperty(e, "_zod", {
    value: e._zod,
    enumerable: !1
  }), Object.defineProperty(e, "issues", {
    value: t,
    enumerable: !1
  }), e.message = JSON.stringify(t, Ce, 2), Object.defineProperty(e, "toString", {
    value: () => e.message,
    enumerable: !1
  });
}, bt = h("$ZodError", _t), gt = h("$ZodError", _t, { Parent: Error });
function hn(e, t = (n) => n.message) {
  const n = {}, o = [];
  for (const r of e.issues)
    r.path.length > 0 ? (n[r.path[0]] = n[r.path[0]] || [], n[r.path[0]].push(t(r))) : o.push(t(r));
  return { formErrors: o, fieldErrors: n };
}
function pn(e, t = (n) => n.message) {
  const n = { _errors: [] }, o = (r) => {
    for (const i of r.issues)
      if (i.code === "invalid_union" && i.errors.length)
        i.errors.map((s) => o({ issues: s }));
      else if (i.code === "invalid_key")
        o({ issues: i.issues });
      else if (i.code === "invalid_element")
        o({ issues: i.issues });
      else if (i.path.length === 0)
        n._errors.push(t(i));
      else {
        let s = n, a = 0;
        for (; a < i.path.length; ) {
          const c = i.path[a];
          a === i.path.length - 1 ? (s[c] = s[c] || { _errors: [] }, s[c]._errors.push(t(i))) : s[c] = s[c] || { _errors: [] }, s = s[c], a++;
        }
      }
  };
  return o(e), n;
}
const Ae = (e) => (t, n, o, r) => {
  const i = o ? Object.assign(o, { async: !1 }) : { async: !1 }, s = t._zod.run({ value: n, issues: [] }, i);
  if (s instanceof Promise)
    throw new re();
  if (s.issues.length) {
    const a = new ((r == null ? void 0 : r.Err) ?? e)(s.issues.map((c) => q(c, i, K())));
    throw ft(a, r == null ? void 0 : r.callee), a;
  }
  return s.value;
}, Re = (e) => async (t, n, o, r) => {
  const i = o ? Object.assign(o, { async: !0 }) : { async: !0 };
  let s = t._zod.run({ value: n, issues: [] }, i);
  if (s instanceof Promise && (s = await s), s.issues.length) {
    const a = new ((r == null ? void 0 : r.Err) ?? e)(s.issues.map((c) => q(c, i, K())));
    throw ft(a, r == null ? void 0 : r.callee), a;
  }
  return s.value;
}, ke = (e) => (t, n, o) => {
  const r = o ? { ...o, async: !1 } : { async: !1 }, i = t._zod.run({ value: n, issues: [] }, r);
  if (i instanceof Promise)
    throw new re();
  return i.issues.length ? {
    success: !1,
    error: new (e ?? bt)(i.issues.map((s) => q(s, r, K())))
  } : { success: !0, data: i.value };
}, fn = /* @__PURE__ */ ke(gt), ze = (e) => async (t, n, o) => {
  const r = o ? Object.assign(o, { async: !0 }) : { async: !0 };
  let i = t._zod.run({ value: n, issues: [] }, r);
  return i instanceof Promise && (i = await i), i.issues.length ? {
    success: !1,
    error: new e(i.issues.map((s) => q(s, r, K())))
  } : { success: !0, data: i.value };
}, mn = /* @__PURE__ */ ze(gt), _n = (e) => (t, n, o) => {
  const r = o ? Object.assign(o, { direction: "backward" }) : { direction: "backward" };
  return Ae(e)(t, n, r);
}, bn = (e) => (t, n, o) => Ae(e)(t, n, o), gn = (e) => async (t, n, o) => {
  const r = o ? Object.assign(o, { direction: "backward" }) : { direction: "backward" };
  return Re(e)(t, n, r);
}, vn = (e) => async (t, n, o) => Re(e)(t, n, o), yn = (e) => (t, n, o) => {
  const r = o ? Object.assign(o, { direction: "backward" }) : { direction: "backward" };
  return ke(e)(t, n, r);
}, wn = (e) => (t, n, o) => ke(e)(t, n, o), kn = (e) => async (t, n, o) => {
  const r = o ? Object.assign(o, { direction: "backward" }) : { direction: "backward" };
  return ze(e)(t, n, r);
}, zn = (e) => async (t, n, o) => ze(e)(t, n, o), En = /^[cC][^\s-]{8,}$/, $n = /^[0-9a-z]+$/, Zn = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/, Sn = /^[0-9a-vA-V]{20}$/, Cn = /^[A-Za-z0-9]{27}$/, Nn = /^[a-zA-Z0-9_-]{21}$/, Tn = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/, On = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/, Fe = (e) => e ? new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${e}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`) : /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/, In = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/, xn = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
function Pn() {
  return new RegExp(xn, "u");
}
const An = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, Rn = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/, Ln = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/, jn = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, Dn = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/, vt = /^[A-Za-z0-9_-]*$/, Mn = /^\+[1-9]\d{6,14}$/, yt = "(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))", Un = /* @__PURE__ */ new RegExp(`^${yt}$`);
function wt(e) {
  const t = "(?:[01]\\d|2[0-3]):[0-5]\\d";
  return typeof e.precision == "number" ? e.precision === -1 ? `${t}` : e.precision === 0 ? `${t}:[0-5]\\d` : `${t}:[0-5]\\d\\.\\d{${e.precision}}` : `${t}(?::[0-5]\\d(?:\\.\\d+)?)?`;
}
function Bn(e) {
  return new RegExp(`^${wt(e)}$`);
}
function Fn(e) {
  const t = wt({ precision: e.precision }), n = ["Z"];
  e.local && n.push(""), e.offset && n.push("([+-](?:[01]\\d|2[0-3]):[0-5]\\d)");
  const o = `${t}(?:${n.join("|")})`;
  return new RegExp(`^${yt}T(?:${o})$`);
}
const Jn = (e) => {
  const t = e ? `[\\s\\S]{${(e == null ? void 0 : e.minimum) ?? 0},${(e == null ? void 0 : e.maximum) ?? ""}}` : "[\\s\\S]*";
  return new RegExp(`^${t}$`);
}, Vn = /^-?\d+$/, kt = /^-?\d+(?:\.\d+)?$/, Hn = /^(?:true|false)$/i, Yn = /^[^A-Z]*$/, Gn = /^[^a-z]*$/, B = /* @__PURE__ */ h("$ZodCheck", (e, t) => {
  var n;
  e._zod ?? (e._zod = {}), e._zod.def = t, (n = e._zod).onattach ?? (n.onattach = []);
}), zt = {
  number: "number",
  bigint: "bigint",
  object: "date"
}, Et = /* @__PURE__ */ h("$ZodCheckLessThan", (e, t) => {
  B.init(e, t);
  const n = zt[typeof t.value];
  e._zod.onattach.push((o) => {
    const r = o._zod.bag, i = (t.inclusive ? r.maximum : r.exclusiveMaximum) ?? Number.POSITIVE_INFINITY;
    t.value < i && (t.inclusive ? r.maximum = t.value : r.exclusiveMaximum = t.value);
  }), e._zod.check = (o) => {
    (t.inclusive ? o.value <= t.value : o.value < t.value) || o.issues.push({
      origin: n,
      code: "too_big",
      maximum: typeof t.value == "object" ? t.value.getTime() : t.value,
      input: o.value,
      inclusive: t.inclusive,
      inst: e,
      continue: !t.abort
    });
  };
}), $t = /* @__PURE__ */ h("$ZodCheckGreaterThan", (e, t) => {
  B.init(e, t);
  const n = zt[typeof t.value];
  e._zod.onattach.push((o) => {
    const r = o._zod.bag, i = (t.inclusive ? r.minimum : r.exclusiveMinimum) ?? Number.NEGATIVE_INFINITY;
    t.value > i && (t.inclusive ? r.minimum = t.value : r.exclusiveMinimum = t.value);
  }), e._zod.check = (o) => {
    (t.inclusive ? o.value >= t.value : o.value > t.value) || o.issues.push({
      origin: n,
      code: "too_small",
      minimum: typeof t.value == "object" ? t.value.getTime() : t.value,
      input: o.value,
      inclusive: t.inclusive,
      inst: e,
      continue: !t.abort
    });
  };
}), Xn = /* @__PURE__ */ h("$ZodCheckMultipleOf", (e, t) => {
  B.init(e, t), e._zod.onattach.push((n) => {
    var o;
    (o = n._zod.bag).multipleOf ?? (o.multipleOf = t.value);
  }), e._zod.check = (n) => {
    if (typeof n.value != typeof t.value)
      throw new Error("Cannot mix number and bigint in multiple_of check.");
    (typeof n.value == "bigint" ? n.value % t.value === BigInt(0) : Wt(n.value, t.value) === 0) || n.issues.push({
      origin: typeof n.value,
      code: "not_multiple_of",
      divisor: t.value,
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), Kn = /* @__PURE__ */ h("$ZodCheckNumberFormat", (e, t) => {
  var s;
  B.init(e, t), t.format = t.format || "float64";
  const n = (s = t.format) == null ? void 0 : s.includes("int"), o = n ? "int" : "number", [r, i] = on[t.format];
  e._zod.onattach.push((a) => {
    const c = a._zod.bag;
    c.format = t.format, c.minimum = r, c.maximum = i, n && (c.pattern = Vn);
  }), e._zod.check = (a) => {
    const c = a.value;
    if (n) {
      if (!Number.isInteger(c)) {
        a.issues.push({
          expected: o,
          format: t.format,
          code: "invalid_type",
          continue: !1,
          input: c,
          inst: e
        });
        return;
      }
      if (!Number.isSafeInteger(c)) {
        c > 0 ? a.issues.push({
          input: c,
          code: "too_big",
          maximum: Number.MAX_SAFE_INTEGER,
          note: "Integers must be within the safe integer range.",
          inst: e,
          origin: o,
          inclusive: !0,
          continue: !t.abort
        }) : a.issues.push({
          input: c,
          code: "too_small",
          minimum: Number.MIN_SAFE_INTEGER,
          note: "Integers must be within the safe integer range.",
          inst: e,
          origin: o,
          inclusive: !0,
          continue: !t.abort
        });
        return;
      }
    }
    c < r && a.issues.push({
      origin: "number",
      input: c,
      code: "too_small",
      minimum: r,
      inclusive: !0,
      inst: e,
      continue: !t.abort
    }), c > i && a.issues.push({
      origin: "number",
      input: c,
      code: "too_big",
      maximum: i,
      inclusive: !0,
      inst: e,
      continue: !t.abort
    });
  };
}), qn = /* @__PURE__ */ h("$ZodCheckMaxLength", (e, t) => {
  var n;
  B.init(e, t), (n = e._zod.def).when ?? (n.when = (o) => {
    const r = o.value;
    return !Ie(r) && r.length !== void 0;
  }), e._zod.onattach.push((o) => {
    const r = o._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
    t.maximum < r && (o._zod.bag.maximum = t.maximum);
  }), e._zod.check = (o) => {
    const r = o.value;
    if (r.length <= t.maximum)
      return;
    const s = Pe(r);
    o.issues.push({
      origin: s,
      code: "too_big",
      maximum: t.maximum,
      inclusive: !0,
      input: r,
      inst: e,
      continue: !t.abort
    });
  };
}), Wn = /* @__PURE__ */ h("$ZodCheckMinLength", (e, t) => {
  var n;
  B.init(e, t), (n = e._zod.def).when ?? (n.when = (o) => {
    const r = o.value;
    return !Ie(r) && r.length !== void 0;
  }), e._zod.onattach.push((o) => {
    const r = o._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
    t.minimum > r && (o._zod.bag.minimum = t.minimum);
  }), e._zod.check = (o) => {
    const r = o.value;
    if (r.length >= t.minimum)
      return;
    const s = Pe(r);
    o.issues.push({
      origin: s,
      code: "too_small",
      minimum: t.minimum,
      inclusive: !0,
      input: r,
      inst: e,
      continue: !t.abort
    });
  };
}), Qn = /* @__PURE__ */ h("$ZodCheckLengthEquals", (e, t) => {
  var n;
  B.init(e, t), (n = e._zod.def).when ?? (n.when = (o) => {
    const r = o.value;
    return !Ie(r) && r.length !== void 0;
  }), e._zod.onattach.push((o) => {
    const r = o._zod.bag;
    r.minimum = t.length, r.maximum = t.length, r.length = t.length;
  }), e._zod.check = (o) => {
    const r = o.value, i = r.length;
    if (i === t.length)
      return;
    const s = Pe(r), a = i > t.length;
    o.issues.push({
      origin: s,
      ...a ? { code: "too_big", maximum: t.length } : { code: "too_small", minimum: t.length },
      inclusive: !0,
      exact: !0,
      input: o.value,
      inst: e,
      continue: !t.abort
    });
  };
}), Ee = /* @__PURE__ */ h("$ZodCheckStringFormat", (e, t) => {
  var n, o;
  B.init(e, t), e._zod.onattach.push((r) => {
    const i = r._zod.bag;
    i.format = t.format, t.pattern && (i.patterns ?? (i.patterns = /* @__PURE__ */ new Set()), i.patterns.add(t.pattern));
  }), t.pattern ? (n = e._zod).check ?? (n.check = (r) => {
    t.pattern.lastIndex = 0, !t.pattern.test(r.value) && r.issues.push({
      origin: "string",
      code: "invalid_format",
      format: t.format,
      input: r.value,
      ...t.pattern ? { pattern: t.pattern.toString() } : {},
      inst: e,
      continue: !t.abort
    });
  }) : (o = e._zod).check ?? (o.check = () => {
  });
}), eo = /* @__PURE__ */ h("$ZodCheckRegex", (e, t) => {
  Ee.init(e, t), e._zod.check = (n) => {
    t.pattern.lastIndex = 0, !t.pattern.test(n.value) && n.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "regex",
      input: n.value,
      pattern: t.pattern.toString(),
      inst: e,
      continue: !t.abort
    });
  };
}), to = /* @__PURE__ */ h("$ZodCheckLowerCase", (e, t) => {
  t.pattern ?? (t.pattern = Yn), Ee.init(e, t);
}), no = /* @__PURE__ */ h("$ZodCheckUpperCase", (e, t) => {
  t.pattern ?? (t.pattern = Gn), Ee.init(e, t);
}), oo = /* @__PURE__ */ h("$ZodCheckIncludes", (e, t) => {
  B.init(e, t);
  const n = we(t.includes), o = new RegExp(typeof t.position == "number" ? `^.{${t.position}}${n}` : n);
  t.pattern = o, e._zod.onattach.push((r) => {
    const i = r._zod.bag;
    i.patterns ?? (i.patterns = /* @__PURE__ */ new Set()), i.patterns.add(o);
  }), e._zod.check = (r) => {
    r.value.includes(t.includes, t.position) || r.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "includes",
      includes: t.includes,
      input: r.value,
      inst: e,
      continue: !t.abort
    });
  };
}), ro = /* @__PURE__ */ h("$ZodCheckStartsWith", (e, t) => {
  B.init(e, t);
  const n = new RegExp(`^${we(t.prefix)}.*`);
  t.pattern ?? (t.pattern = n), e._zod.onattach.push((o) => {
    const r = o._zod.bag;
    r.patterns ?? (r.patterns = /* @__PURE__ */ new Set()), r.patterns.add(n);
  }), e._zod.check = (o) => {
    o.value.startsWith(t.prefix) || o.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "starts_with",
      prefix: t.prefix,
      input: o.value,
      inst: e,
      continue: !t.abort
    });
  };
}), io = /* @__PURE__ */ h("$ZodCheckEndsWith", (e, t) => {
  B.init(e, t);
  const n = new RegExp(`.*${we(t.suffix)}$`);
  t.pattern ?? (t.pattern = n), e._zod.onattach.push((o) => {
    const r = o._zod.bag;
    r.patterns ?? (r.patterns = /* @__PURE__ */ new Set()), r.patterns.add(n);
  }), e._zod.check = (o) => {
    o.value.endsWith(t.suffix) || o.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "ends_with",
      suffix: t.suffix,
      input: o.value,
      inst: e,
      continue: !t.abort
    });
  };
}), so = /* @__PURE__ */ h("$ZodCheckOverwrite", (e, t) => {
  B.init(e, t), e._zod.check = (n) => {
    n.value = t.tx(n.value);
  };
});
class ao {
  constructor(t = []) {
    this.content = [], this.indent = 0, this && (this.args = t);
  }
  indented(t) {
    this.indent += 1, t(this), this.indent -= 1;
  }
  write(t) {
    if (typeof t == "function") {
      t(this, { execution: "sync" }), t(this, { execution: "async" });
      return;
    }
    const o = t.split(`
`).filter((s) => s), r = Math.min(...o.map((s) => s.length - s.trimStart().length)), i = o.map((s) => s.slice(r)).map((s) => " ".repeat(this.indent * 2) + s);
    for (const s of i)
      this.content.push(s);
  }
  compile() {
    const t = Function, n = this == null ? void 0 : this.args, r = [...((this == null ? void 0 : this.content) ?? [""]).map((i) => `  ${i}`)];
    return new t(...n, r.join(`
`));
  }
}
const co = {
  major: 4,
  minor: 3,
  patch: 6
}, P = /* @__PURE__ */ h("$ZodType", (e, t) => {
  var r;
  var n;
  e ?? (e = {}), e._zod.def = t, e._zod.bag = e._zod.bag || {}, e._zod.version = co;
  const o = [...e._zod.def.checks ?? []];
  e._zod.traits.has("$ZodCheck") && o.unshift(e);
  for (const i of o)
    for (const s of i._zod.onattach)
      s(e);
  if (o.length === 0)
    (n = e._zod).deferred ?? (n.deferred = []), (r = e._zod.deferred) == null || r.push(() => {
      e._zod.run = e._zod.parse;
    });
  else {
    const i = (a, c, u) => {
      let l = ne(a), d;
      for (const _ of c) {
        if (_._zod.def.when) {
          if (!_._zod.def.when(a))
            continue;
        } else if (l)
          continue;
        const f = a.issues.length, v = _._zod.check(a);
        if (v instanceof Promise && (u == null ? void 0 : u.async) === !1)
          throw new re();
        if (d || v instanceof Promise)
          d = (d ?? Promise.resolve()).then(async () => {
            await v, a.issues.length !== f && (l || (l = ne(a, f)));
          });
        else {
          if (a.issues.length === f)
            continue;
          l || (l = ne(a, f));
        }
      }
      return d ? d.then(() => a) : a;
    }, s = (a, c, u) => {
      if (ne(a))
        return a.aborted = !0, a;
      const l = i(c, o, u);
      if (l instanceof Promise) {
        if (u.async === !1)
          throw new re();
        return l.then((d) => e._zod.parse(d, u));
      }
      return e._zod.parse(l, u);
    };
    e._zod.run = (a, c) => {
      if (c.skipChecks)
        return e._zod.parse(a, c);
      if (c.direction === "backward") {
        const l = e._zod.parse({ value: a.value, issues: [] }, { ...c, skipChecks: !0 });
        return l instanceof Promise ? l.then((d) => s(d, a, c)) : s(l, a, c);
      }
      const u = e._zod.parse(a, c);
      if (u instanceof Promise) {
        if (c.async === !1)
          throw new re();
        return u.then((l) => i(l, o, c));
      }
      return i(u, o, c);
    };
  }
  T(e, "~standard", () => ({
    validate: (i) => {
      var s;
      try {
        const a = fn(e, i);
        return a.success ? { value: a.data } : { issues: (s = a.error) == null ? void 0 : s.issues };
      } catch {
        return mn(e, i).then((c) => {
          var u;
          return c.success ? { value: c.data } : { issues: (u = c.error) == null ? void 0 : u.issues };
        });
      }
    },
    vendor: "zod",
    version: 1
  }));
}), Le = /* @__PURE__ */ h("$ZodString", (e, t) => {
  var n;
  P.init(e, t), e._zod.pattern = [...((n = e == null ? void 0 : e._zod.bag) == null ? void 0 : n.patterns) ?? []].pop() ?? Jn(e._zod.bag), e._zod.parse = (o, r) => {
    if (t.coerce)
      try {
        o.value = String(o.value);
      } catch {
      }
    return typeof o.value == "string" || o.issues.push({
      expected: "string",
      code: "invalid_type",
      input: o.value,
      inst: e
    }), o;
  };
}), I = /* @__PURE__ */ h("$ZodStringFormat", (e, t) => {
  Ee.init(e, t), Le.init(e, t);
}), uo = /* @__PURE__ */ h("$ZodGUID", (e, t) => {
  t.pattern ?? (t.pattern = On), I.init(e, t);
}), lo = /* @__PURE__ */ h("$ZodUUID", (e, t) => {
  if (t.version) {
    const o = {
      v1: 1,
      v2: 2,
      v3: 3,
      v4: 4,
      v5: 5,
      v6: 6,
      v7: 7,
      v8: 8
    }[t.version];
    if (o === void 0)
      throw new Error(`Invalid UUID version: "${t.version}"`);
    t.pattern ?? (t.pattern = Fe(o));
  } else
    t.pattern ?? (t.pattern = Fe());
  I.init(e, t);
}), ho = /* @__PURE__ */ h("$ZodEmail", (e, t) => {
  t.pattern ?? (t.pattern = In), I.init(e, t);
}), po = /* @__PURE__ */ h("$ZodURL", (e, t) => {
  I.init(e, t), e._zod.check = (n) => {
    try {
      const o = n.value.trim(), r = new URL(o);
      t.hostname && (t.hostname.lastIndex = 0, t.hostname.test(r.hostname) || n.issues.push({
        code: "invalid_format",
        format: "url",
        note: "Invalid hostname",
        pattern: t.hostname.source,
        input: n.value,
        inst: e,
        continue: !t.abort
      })), t.protocol && (t.protocol.lastIndex = 0, t.protocol.test(r.protocol.endsWith(":") ? r.protocol.slice(0, -1) : r.protocol) || n.issues.push({
        code: "invalid_format",
        format: "url",
        note: "Invalid protocol",
        pattern: t.protocol.source,
        input: n.value,
        inst: e,
        continue: !t.abort
      })), t.normalize ? n.value = r.href : n.value = o;
      return;
    } catch {
      n.issues.push({
        code: "invalid_format",
        format: "url",
        input: n.value,
        inst: e,
        continue: !t.abort
      });
    }
  };
}), fo = /* @__PURE__ */ h("$ZodEmoji", (e, t) => {
  t.pattern ?? (t.pattern = Pn()), I.init(e, t);
}), mo = /* @__PURE__ */ h("$ZodNanoID", (e, t) => {
  t.pattern ?? (t.pattern = Nn), I.init(e, t);
}), _o = /* @__PURE__ */ h("$ZodCUID", (e, t) => {
  t.pattern ?? (t.pattern = En), I.init(e, t);
}), bo = /* @__PURE__ */ h("$ZodCUID2", (e, t) => {
  t.pattern ?? (t.pattern = $n), I.init(e, t);
}), go = /* @__PURE__ */ h("$ZodULID", (e, t) => {
  t.pattern ?? (t.pattern = Zn), I.init(e, t);
}), vo = /* @__PURE__ */ h("$ZodXID", (e, t) => {
  t.pattern ?? (t.pattern = Sn), I.init(e, t);
}), yo = /* @__PURE__ */ h("$ZodKSUID", (e, t) => {
  t.pattern ?? (t.pattern = Cn), I.init(e, t);
}), wo = /* @__PURE__ */ h("$ZodISODateTime", (e, t) => {
  t.pattern ?? (t.pattern = Fn(t)), I.init(e, t);
}), ko = /* @__PURE__ */ h("$ZodISODate", (e, t) => {
  t.pattern ?? (t.pattern = Un), I.init(e, t);
}), zo = /* @__PURE__ */ h("$ZodISOTime", (e, t) => {
  t.pattern ?? (t.pattern = Bn(t)), I.init(e, t);
}), Eo = /* @__PURE__ */ h("$ZodISODuration", (e, t) => {
  t.pattern ?? (t.pattern = Tn), I.init(e, t);
}), $o = /* @__PURE__ */ h("$ZodIPv4", (e, t) => {
  t.pattern ?? (t.pattern = An), I.init(e, t), e._zod.bag.format = "ipv4";
}), Zo = /* @__PURE__ */ h("$ZodIPv6", (e, t) => {
  t.pattern ?? (t.pattern = Rn), I.init(e, t), e._zod.bag.format = "ipv6", e._zod.check = (n) => {
    try {
      new URL(`http://[${n.value}]`);
    } catch {
      n.issues.push({
        code: "invalid_format",
        format: "ipv6",
        input: n.value,
        inst: e,
        continue: !t.abort
      });
    }
  };
}), So = /* @__PURE__ */ h("$ZodCIDRv4", (e, t) => {
  t.pattern ?? (t.pattern = Ln), I.init(e, t);
}), Co = /* @__PURE__ */ h("$ZodCIDRv6", (e, t) => {
  t.pattern ?? (t.pattern = jn), I.init(e, t), e._zod.check = (n) => {
    const o = n.value.split("/");
    try {
      if (o.length !== 2)
        throw new Error();
      const [r, i] = o;
      if (!i)
        throw new Error();
      const s = Number(i);
      if (`${s}` !== i)
        throw new Error();
      if (s < 0 || s > 128)
        throw new Error();
      new URL(`http://[${r}]`);
    } catch {
      n.issues.push({
        code: "invalid_format",
        format: "cidrv6",
        input: n.value,
        inst: e,
        continue: !t.abort
      });
    }
  };
});
function Zt(e) {
  if (e === "")
    return !0;
  if (e.length % 4 !== 0)
    return !1;
  try {
    return atob(e), !0;
  } catch {
    return !1;
  }
}
const No = /* @__PURE__ */ h("$ZodBase64", (e, t) => {
  t.pattern ?? (t.pattern = Dn), I.init(e, t), e._zod.bag.contentEncoding = "base64", e._zod.check = (n) => {
    Zt(n.value) || n.issues.push({
      code: "invalid_format",
      format: "base64",
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
});
function To(e) {
  if (!vt.test(e))
    return !1;
  const t = e.replace(/[-_]/g, (o) => o === "-" ? "+" : "/"), n = t.padEnd(Math.ceil(t.length / 4) * 4, "=");
  return Zt(n);
}
const Oo = /* @__PURE__ */ h("$ZodBase64URL", (e, t) => {
  t.pattern ?? (t.pattern = vt), I.init(e, t), e._zod.bag.contentEncoding = "base64url", e._zod.check = (n) => {
    To(n.value) || n.issues.push({
      code: "invalid_format",
      format: "base64url",
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), Io = /* @__PURE__ */ h("$ZodE164", (e, t) => {
  t.pattern ?? (t.pattern = Mn), I.init(e, t);
});
function xo(e, t = null) {
  try {
    const n = e.split(".");
    if (n.length !== 3)
      return !1;
    const [o] = n;
    if (!o)
      return !1;
    const r = JSON.parse(atob(o));
    return !("typ" in r && (r == null ? void 0 : r.typ) !== "JWT" || !r.alg || t && (!("alg" in r) || r.alg !== t));
  } catch {
    return !1;
  }
}
const Po = /* @__PURE__ */ h("$ZodJWT", (e, t) => {
  I.init(e, t), e._zod.check = (n) => {
    xo(n.value, t.alg) || n.issues.push({
      code: "invalid_format",
      format: "jwt",
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), St = /* @__PURE__ */ h("$ZodNumber", (e, t) => {
  P.init(e, t), e._zod.pattern = e._zod.bag.pattern ?? kt, e._zod.parse = (n, o) => {
    if (t.coerce)
      try {
        n.value = Number(n.value);
      } catch {
      }
    const r = n.value;
    if (typeof r == "number" && !Number.isNaN(r) && Number.isFinite(r))
      return n;
    const i = typeof r == "number" ? Number.isNaN(r) ? "NaN" : Number.isFinite(r) ? void 0 : "Infinity" : void 0;
    return n.issues.push({
      expected: "number",
      code: "invalid_type",
      input: r,
      inst: e,
      ...i ? { received: i } : {}
    }), n;
  };
}), Ao = /* @__PURE__ */ h("$ZodNumberFormat", (e, t) => {
  Kn.init(e, t), St.init(e, t);
}), Ro = /* @__PURE__ */ h("$ZodBoolean", (e, t) => {
  P.init(e, t), e._zod.pattern = Hn, e._zod.parse = (n, o) => {
    if (t.coerce)
      try {
        n.value = !!n.value;
      } catch {
      }
    const r = n.value;
    return typeof r == "boolean" || n.issues.push({
      expected: "boolean",
      code: "invalid_type",
      input: r,
      inst: e
    }), n;
  };
}), Lo = /* @__PURE__ */ h("$ZodUnknown", (e, t) => {
  P.init(e, t), e._zod.parse = (n) => n;
}), jo = /* @__PURE__ */ h("$ZodNever", (e, t) => {
  P.init(e, t), e._zod.parse = (n, o) => (n.issues.push({
    expected: "never",
    code: "invalid_type",
    input: n.value,
    inst: e
  }), n);
});
function Je(e, t, n) {
  e.issues.length && t.issues.push(...oe(n, e.issues)), t.value[n] = e.value;
}
const Do = /* @__PURE__ */ h("$ZodArray", (e, t) => {
  P.init(e, t), e._zod.parse = (n, o) => {
    const r = n.value;
    if (!Array.isArray(r))
      return n.issues.push({
        expected: "array",
        code: "invalid_type",
        input: r,
        inst: e
      }), n;
    n.value = Array(r.length);
    const i = [];
    for (let s = 0; s < r.length; s++) {
      const a = r[s], c = t.element._zod.run({
        value: a,
        issues: []
      }, o);
      c instanceof Promise ? i.push(c.then((u) => Je(u, n, s))) : Je(c, n, s);
    }
    return i.length ? Promise.all(i).then(() => n) : n;
  };
});
function _e(e, t, n, o, r) {
  if (e.issues.length) {
    if (r && !(n in o))
      return;
    t.issues.push(...oe(n, e.issues));
  }
  e.value === void 0 ? n in o && (t.value[n] = void 0) : t.value[n] = e.value;
}
function Ct(e) {
  var o, r, i, s;
  const t = Object.keys(e.shape);
  for (const a of t)
    if (!((s = (i = (r = (o = e.shape) == null ? void 0 : o[a]) == null ? void 0 : r._zod) == null ? void 0 : i.traits) != null && s.has("$ZodType")))
      throw new Error(`Invalid element at key "${a}": expected a Zod schema`);
  const n = nn(e.shape);
  return {
    ...e,
    keys: t,
    keySet: new Set(t),
    numKeys: t.length,
    optionalKeys: new Set(n)
  };
}
function Nt(e, t, n, o, r, i) {
  const s = [], a = r.keySet, c = r.catchall._zod, u = c.def.type, l = c.optout === "optional";
  for (const d in t) {
    if (a.has(d))
      continue;
    if (u === "never") {
      s.push(d);
      continue;
    }
    const _ = c.run({ value: t[d], issues: [] }, o);
    _ instanceof Promise ? e.push(_.then((f) => _e(f, n, d, t, l))) : _e(_, n, d, t, l);
  }
  return s.length && n.issues.push({
    code: "unrecognized_keys",
    keys: s,
    input: t,
    inst: i
  }), e.length ? Promise.all(e).then(() => n) : n;
}
const Mo = /* @__PURE__ */ h("$ZodObject", (e, t) => {
  P.init(e, t);
  const n = Object.getOwnPropertyDescriptor(t, "shape");
  if (!(n != null && n.get)) {
    const a = t.shape;
    Object.defineProperty(t, "shape", {
      get: () => {
        const c = { ...a };
        return Object.defineProperty(t, "shape", {
          value: c
        }), c;
      }
    });
  }
  const o = Oe(() => Ct(t));
  T(e._zod, "propValues", () => {
    const a = t.shape, c = {};
    for (const u in a) {
      const l = a[u]._zod;
      if (l.values) {
        c[u] ?? (c[u] = /* @__PURE__ */ new Set());
        for (const d of l.values)
          c[u].add(d);
      }
    }
    return c;
  });
  const r = me, i = t.catchall;
  let s;
  e._zod.parse = (a, c) => {
    s ?? (s = o.value);
    const u = a.value;
    if (!r(u))
      return a.issues.push({
        expected: "object",
        code: "invalid_type",
        input: u,
        inst: e
      }), a;
    a.value = {};
    const l = [], d = s.shape;
    for (const _ of s.keys) {
      const f = d[_], v = f._zod.optout === "optional", w = f._zod.run({ value: u[_], issues: [] }, c);
      w instanceof Promise ? l.push(w.then((N) => _e(N, a, _, u, v))) : _e(w, a, _, u, v);
    }
    return i ? Nt(l, u, a, c, o.value, e) : l.length ? Promise.all(l).then(() => a) : a;
  };
}), Uo = /* @__PURE__ */ h("$ZodObjectJIT", (e, t) => {
  Mo.init(e, t);
  const n = e._zod.parse, o = Oe(() => Ct(t)), r = (_) => {
    var m;
    const f = new ao(["shape", "payload", "ctx"]), v = o.value, w = (k) => {
      const b = Be(k);
      return `shape[${b}]._zod.run({ value: input[${b}], issues: [] }, ctx)`;
    };
    f.write("const input = payload.value;");
    const N = /* @__PURE__ */ Object.create(null);
    let C = 0;
    for (const k of v.keys)
      N[k] = `key_${C++}`;
    f.write("const newResult = {};");
    for (const k of v.keys) {
      const b = N[k], $ = Be(k), z = _[k], J = ((m = z == null ? void 0 : z._zod) == null ? void 0 : m.optout) === "optional";
      f.write(`const ${b} = ${w(k)};`), J ? f.write(`
        if (${b}.issues.length) {
          if (${$} in input) {
            payload.issues = payload.issues.concat(${b}.issues.map(iss => ({
              ...iss,
              path: iss.path ? [${$}, ...iss.path] : [${$}]
            })));
          }
        }
        
        if (${b}.value === undefined) {
          if (${$} in input) {
            newResult[${$}] = undefined;
          }
        } else {
          newResult[${$}] = ${b}.value;
        }
        
      `) : f.write(`
        if (${b}.issues.length) {
          payload.issues = payload.issues.concat(${b}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${$}, ...iss.path] : [${$}]
          })));
        }
        
        if (${b}.value === undefined) {
          if (${$} in input) {
            newResult[${$}] = undefined;
          }
        } else {
          newResult[${$}] = ${b}.value;
        }
        
      `);
    }
    f.write("payload.value = newResult;"), f.write("return payload;");
    const S = f.compile();
    return (k, b) => S(_, k, b);
  };
  let i;
  const s = me, a = !ht.jitless, u = a && en.value, l = t.catchall;
  let d;
  e._zod.parse = (_, f) => {
    d ?? (d = o.value);
    const v = _.value;
    return s(v) ? a && u && (f == null ? void 0 : f.async) === !1 && f.jitless !== !0 ? (i || (i = r(t.shape)), _ = i(_, f), l ? Nt([], v, _, f, d, e) : _) : n(_, f) : (_.issues.push({
      expected: "object",
      code: "invalid_type",
      input: v,
      inst: e
    }), _);
  };
});
function Ve(e, t, n, o) {
  for (const i of e)
    if (i.issues.length === 0)
      return t.value = i.value, t;
  const r = e.filter((i) => !ne(i));
  return r.length === 1 ? (t.value = r[0].value, r[0]) : (t.issues.push({
    code: "invalid_union",
    input: t.value,
    inst: n,
    errors: e.map((i) => i.issues.map((s) => q(s, o, K())))
  }), t);
}
const Bo = /* @__PURE__ */ h("$ZodUnion", (e, t) => {
  P.init(e, t), T(e._zod, "optin", () => t.options.some((r) => r._zod.optin === "optional") ? "optional" : void 0), T(e._zod, "optout", () => t.options.some((r) => r._zod.optout === "optional") ? "optional" : void 0), T(e._zod, "values", () => {
    if (t.options.every((r) => r._zod.values))
      return new Set(t.options.flatMap((r) => Array.from(r._zod.values)));
  }), T(e._zod, "pattern", () => {
    if (t.options.every((r) => r._zod.pattern)) {
      const r = t.options.map((i) => i._zod.pattern);
      return new RegExp(`^(${r.map((i) => xe(i.source)).join("|")})$`);
    }
  });
  const n = t.options.length === 1, o = t.options[0]._zod.run;
  e._zod.parse = (r, i) => {
    if (n)
      return o(r, i);
    let s = !1;
    const a = [];
    for (const c of t.options) {
      const u = c._zod.run({
        value: r.value,
        issues: []
      }, i);
      if (u instanceof Promise)
        a.push(u), s = !0;
      else {
        if (u.issues.length === 0)
          return u;
        a.push(u);
      }
    }
    return s ? Promise.all(a).then((c) => Ve(c, r, e, i)) : Ve(a, r, e, i);
  };
}), Fo = /* @__PURE__ */ h("$ZodIntersection", (e, t) => {
  P.init(e, t), e._zod.parse = (n, o) => {
    const r = n.value, i = t.left._zod.run({ value: r, issues: [] }, o), s = t.right._zod.run({ value: r, issues: [] }, o);
    return i instanceof Promise || s instanceof Promise ? Promise.all([i, s]).then(([c, u]) => He(n, c, u)) : He(n, i, s);
  };
});
function Ne(e, t) {
  if (e === t)
    return { valid: !0, data: e };
  if (e instanceof Date && t instanceof Date && +e == +t)
    return { valid: !0, data: e };
  if (ie(e) && ie(t)) {
    const n = Object.keys(t), o = Object.keys(e).filter((i) => n.indexOf(i) !== -1), r = { ...e, ...t };
    for (const i of o) {
      const s = Ne(e[i], t[i]);
      if (!s.valid)
        return {
          valid: !1,
          mergeErrorPath: [i, ...s.mergeErrorPath]
        };
      r[i] = s.data;
    }
    return { valid: !0, data: r };
  }
  if (Array.isArray(e) && Array.isArray(t)) {
    if (e.length !== t.length)
      return { valid: !1, mergeErrorPath: [] };
    const n = [];
    for (let o = 0; o < e.length; o++) {
      const r = e[o], i = t[o], s = Ne(r, i);
      if (!s.valid)
        return {
          valid: !1,
          mergeErrorPath: [o, ...s.mergeErrorPath]
        };
      n.push(s.data);
    }
    return { valid: !0, data: n };
  }
  return { valid: !1, mergeErrorPath: [] };
}
function He(e, t, n) {
  const o = /* @__PURE__ */ new Map();
  let r;
  for (const a of t.issues)
    if (a.code === "unrecognized_keys") {
      r ?? (r = a);
      for (const c of a.keys)
        o.has(c) || o.set(c, {}), o.get(c).l = !0;
    } else
      e.issues.push(a);
  for (const a of n.issues)
    if (a.code === "unrecognized_keys")
      for (const c of a.keys)
        o.has(c) || o.set(c, {}), o.get(c).r = !0;
    else
      e.issues.push(a);
  const i = [...o].filter(([, a]) => a.l && a.r).map(([a]) => a);
  if (i.length && r && e.issues.push({ ...r, keys: i }), ne(e))
    return e;
  const s = Ne(t.value, n.value);
  if (!s.valid)
    throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(s.mergeErrorPath)}`);
  return e.value = s.data, e;
}
const Jo = /* @__PURE__ */ h("$ZodRecord", (e, t) => {
  P.init(e, t), e._zod.parse = (n, o) => {
    const r = n.value;
    if (!ie(r))
      return n.issues.push({
        expected: "record",
        code: "invalid_type",
        input: r,
        inst: e
      }), n;
    const i = [], s = t.keyType._zod.values;
    if (s) {
      n.value = {};
      const a = /* @__PURE__ */ new Set();
      for (const u of s)
        if (typeof u == "string" || typeof u == "number" || typeof u == "symbol") {
          a.add(typeof u == "number" ? u.toString() : u);
          const l = t.valueType._zod.run({ value: r[u], issues: [] }, o);
          l instanceof Promise ? i.push(l.then((d) => {
            d.issues.length && n.issues.push(...oe(u, d.issues)), n.value[u] = d.value;
          })) : (l.issues.length && n.issues.push(...oe(u, l.issues)), n.value[u] = l.value);
        }
      let c;
      for (const u in r)
        a.has(u) || (c = c ?? [], c.push(u));
      c && c.length > 0 && n.issues.push({
        code: "unrecognized_keys",
        input: r,
        inst: e,
        keys: c
      });
    } else {
      n.value = {};
      for (const a of Reflect.ownKeys(r)) {
        if (a === "__proto__")
          continue;
        let c = t.keyType._zod.run({ value: a, issues: [] }, o);
        if (c instanceof Promise)
          throw new Error("Async schemas not supported in object keys currently");
        if (typeof a == "string" && kt.test(a) && c.issues.length) {
          const d = t.keyType._zod.run({ value: Number(a), issues: [] }, o);
          if (d instanceof Promise)
            throw new Error("Async schemas not supported in object keys currently");
          d.issues.length === 0 && (c = d);
        }
        if (c.issues.length) {
          t.mode === "loose" ? n.value[a] = r[a] : n.issues.push({
            code: "invalid_key",
            origin: "record",
            issues: c.issues.map((d) => q(d, o, K())),
            input: a,
            path: [a],
            inst: e
          });
          continue;
        }
        const l = t.valueType._zod.run({ value: r[a], issues: [] }, o);
        l instanceof Promise ? i.push(l.then((d) => {
          d.issues.length && n.issues.push(...oe(a, d.issues)), n.value[c.value] = d.value;
        })) : (l.issues.length && n.issues.push(...oe(a, l.issues)), n.value[c.value] = l.value);
      }
    }
    return i.length ? Promise.all(i).then(() => n) : n;
  };
}), Vo = /* @__PURE__ */ h("$ZodEnum", (e, t) => {
  P.init(e, t);
  const n = pt(t.entries), o = new Set(n);
  e._zod.values = o, e._zod.pattern = new RegExp(`^(${n.filter((r) => tn.has(typeof r)).map((r) => typeof r == "string" ? we(r) : r.toString()).join("|")})$`), e._zod.parse = (r, i) => {
    const s = r.value;
    return o.has(s) || r.issues.push({
      code: "invalid_value",
      values: n,
      input: s,
      inst: e
    }), r;
  };
}), Ho = /* @__PURE__ */ h("$ZodTransform", (e, t) => {
  P.init(e, t), e._zod.parse = (n, o) => {
    if (o.direction === "backward")
      throw new dt(e.constructor.name);
    const r = t.transform(n.value, n);
    if (o.async)
      return (r instanceof Promise ? r : Promise.resolve(r)).then((s) => (n.value = s, n));
    if (r instanceof Promise)
      throw new re();
    return n.value = r, n;
  };
});
function Ye(e, t) {
  return e.issues.length && t === void 0 ? { issues: [], value: void 0 } : e;
}
const Tt = /* @__PURE__ */ h("$ZodOptional", (e, t) => {
  P.init(e, t), e._zod.optin = "optional", e._zod.optout = "optional", T(e._zod, "values", () => t.innerType._zod.values ? /* @__PURE__ */ new Set([...t.innerType._zod.values, void 0]) : void 0), T(e._zod, "pattern", () => {
    const n = t.innerType._zod.pattern;
    return n ? new RegExp(`^(${xe(n.source)})?$`) : void 0;
  }), e._zod.parse = (n, o) => {
    if (t.innerType._zod.optin === "optional") {
      const r = t.innerType._zod.run(n, o);
      return r instanceof Promise ? r.then((i) => Ye(i, n.value)) : Ye(r, n.value);
    }
    return n.value === void 0 ? n : t.innerType._zod.run(n, o);
  };
}), Yo = /* @__PURE__ */ h("$ZodExactOptional", (e, t) => {
  Tt.init(e, t), T(e._zod, "values", () => t.innerType._zod.values), T(e._zod, "pattern", () => t.innerType._zod.pattern), e._zod.parse = (n, o) => t.innerType._zod.run(n, o);
}), Go = /* @__PURE__ */ h("$ZodNullable", (e, t) => {
  P.init(e, t), T(e._zod, "optin", () => t.innerType._zod.optin), T(e._zod, "optout", () => t.innerType._zod.optout), T(e._zod, "pattern", () => {
    const n = t.innerType._zod.pattern;
    return n ? new RegExp(`^(${xe(n.source)}|null)$`) : void 0;
  }), T(e._zod, "values", () => t.innerType._zod.values ? /* @__PURE__ */ new Set([...t.innerType._zod.values, null]) : void 0), e._zod.parse = (n, o) => n.value === null ? n : t.innerType._zod.run(n, o);
}), Xo = /* @__PURE__ */ h("$ZodDefault", (e, t) => {
  P.init(e, t), e._zod.optin = "optional", T(e._zod, "values", () => t.innerType._zod.values), e._zod.parse = (n, o) => {
    if (o.direction === "backward")
      return t.innerType._zod.run(n, o);
    if (n.value === void 0)
      return n.value = t.defaultValue, n;
    const r = t.innerType._zod.run(n, o);
    return r instanceof Promise ? r.then((i) => Ge(i, t)) : Ge(r, t);
  };
});
function Ge(e, t) {
  return e.value === void 0 && (e.value = t.defaultValue), e;
}
const Ko = /* @__PURE__ */ h("$ZodPrefault", (e, t) => {
  P.init(e, t), e._zod.optin = "optional", T(e._zod, "values", () => t.innerType._zod.values), e._zod.parse = (n, o) => (o.direction === "backward" || n.value === void 0 && (n.value = t.defaultValue), t.innerType._zod.run(n, o));
}), qo = /* @__PURE__ */ h("$ZodNonOptional", (e, t) => {
  P.init(e, t), T(e._zod, "values", () => {
    const n = t.innerType._zod.values;
    return n ? new Set([...n].filter((o) => o !== void 0)) : void 0;
  }), e._zod.parse = (n, o) => {
    const r = t.innerType._zod.run(n, o);
    return r instanceof Promise ? r.then((i) => Xe(i, e)) : Xe(r, e);
  };
});
function Xe(e, t) {
  return !e.issues.length && e.value === void 0 && e.issues.push({
    code: "invalid_type",
    expected: "nonoptional",
    input: e.value,
    inst: t
  }), e;
}
const Wo = /* @__PURE__ */ h("$ZodCatch", (e, t) => {
  P.init(e, t), T(e._zod, "optin", () => t.innerType._zod.optin), T(e._zod, "optout", () => t.innerType._zod.optout), T(e._zod, "values", () => t.innerType._zod.values), e._zod.parse = (n, o) => {
    if (o.direction === "backward")
      return t.innerType._zod.run(n, o);
    const r = t.innerType._zod.run(n, o);
    return r instanceof Promise ? r.then((i) => (n.value = i.value, i.issues.length && (n.value = t.catchValue({
      ...n,
      error: {
        issues: i.issues.map((s) => q(s, o, K()))
      },
      input: n.value
    }), n.issues = []), n)) : (n.value = r.value, r.issues.length && (n.value = t.catchValue({
      ...n,
      error: {
        issues: r.issues.map((i) => q(i, o, K()))
      },
      input: n.value
    }), n.issues = []), n);
  };
}), Qo = /* @__PURE__ */ h("$ZodPipe", (e, t) => {
  P.init(e, t), T(e._zod, "values", () => t.in._zod.values), T(e._zod, "optin", () => t.in._zod.optin), T(e._zod, "optout", () => t.out._zod.optout), T(e._zod, "propValues", () => t.in._zod.propValues), e._zod.parse = (n, o) => {
    if (o.direction === "backward") {
      const i = t.out._zod.run(n, o);
      return i instanceof Promise ? i.then((s) => pe(s, t.in, o)) : pe(i, t.in, o);
    }
    const r = t.in._zod.run(n, o);
    return r instanceof Promise ? r.then((i) => pe(i, t.out, o)) : pe(r, t.out, o);
  };
});
function pe(e, t, n) {
  return e.issues.length ? (e.aborted = !0, e) : t._zod.run({ value: e.value, issues: e.issues }, n);
}
const er = /* @__PURE__ */ h("$ZodReadonly", (e, t) => {
  P.init(e, t), T(e._zod, "propValues", () => t.innerType._zod.propValues), T(e._zod, "values", () => t.innerType._zod.values), T(e._zod, "optin", () => {
    var n, o;
    return (o = (n = t.innerType) == null ? void 0 : n._zod) == null ? void 0 : o.optin;
  }), T(e._zod, "optout", () => {
    var n, o;
    return (o = (n = t.innerType) == null ? void 0 : n._zod) == null ? void 0 : o.optout;
  }), e._zod.parse = (n, o) => {
    if (o.direction === "backward")
      return t.innerType._zod.run(n, o);
    const r = t.innerType._zod.run(n, o);
    return r instanceof Promise ? r.then(Ke) : Ke(r);
  };
});
function Ke(e) {
  return e.value = Object.freeze(e.value), e;
}
const tr = /* @__PURE__ */ h("$ZodCustom", (e, t) => {
  B.init(e, t), P.init(e, t), e._zod.parse = (n, o) => n, e._zod.check = (n) => {
    const o = n.value, r = t.fn(o);
    if (r instanceof Promise)
      return r.then((i) => qe(i, n, o, e));
    qe(r, n, o, e);
  };
});
function qe(e, t, n, o) {
  if (!e) {
    const r = {
      code: "custom",
      input: n,
      inst: o,
      // incorporates params.error into issue reporting
      path: [...o._zod.def.path ?? []],
      // incorporates params.error into issue reporting
      continue: !o._zod.def.abort
      // params: inst._zod.def.params,
    };
    o._zod.def.params && (r.params = o._zod.def.params), t.issues.push(ue(r));
  }
}
var We;
class nr {
  constructor() {
    this._map = /* @__PURE__ */ new WeakMap(), this._idmap = /* @__PURE__ */ new Map();
  }
  add(t, ...n) {
    const o = n[0];
    return this._map.set(t, o), o && typeof o == "object" && "id" in o && this._idmap.set(o.id, t), this;
  }
  clear() {
    return this._map = /* @__PURE__ */ new WeakMap(), this._idmap = /* @__PURE__ */ new Map(), this;
  }
  remove(t) {
    const n = this._map.get(t);
    return n && typeof n == "object" && "id" in n && this._idmap.delete(n.id), this._map.delete(t), this;
  }
  get(t) {
    const n = t._zod.parent;
    if (n) {
      const o = { ...this.get(n) ?? {} };
      delete o.id;
      const r = { ...o, ...this._map.get(t) };
      return Object.keys(r).length ? r : void 0;
    }
    return this._map.get(t);
  }
  has(t) {
    return this._map.has(t);
  }
}
function or() {
  return new nr();
}
(We = globalThis).__zod_globalRegistry ?? (We.__zod_globalRegistry = or());
const ce = globalThis.__zod_globalRegistry;
// @__NO_SIDE_EFFECTS__
function rr(e, t) {
  return new e({
    type: "string",
    ...y(t)
  });
}
// @__NO_SIDE_EFFECTS__
function ir(e, t) {
  return new e({
    type: "string",
    format: "email",
    check: "string_format",
    abort: !1,
    ...y(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Qe(e, t) {
  return new e({
    type: "string",
    format: "guid",
    check: "string_format",
    abort: !1,
    ...y(t)
  });
}
// @__NO_SIDE_EFFECTS__
function sr(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    ...y(t)
  });
}
// @__NO_SIDE_EFFECTS__
function ar(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v4",
    ...y(t)
  });
}
// @__NO_SIDE_EFFECTS__
function cr(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v6",
    ...y(t)
  });
}
// @__NO_SIDE_EFFECTS__
function ur(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v7",
    ...y(t)
  });
}
// @__NO_SIDE_EFFECTS__
function lr(e, t) {
  return new e({
    type: "string",
    format: "url",
    check: "string_format",
    abort: !1,
    ...y(t)
  });
}
// @__NO_SIDE_EFFECTS__
function dr(e, t) {
  return new e({
    type: "string",
    format: "emoji",
    check: "string_format",
    abort: !1,
    ...y(t)
  });
}
// @__NO_SIDE_EFFECTS__
function hr(e, t) {
  return new e({
    type: "string",
    format: "nanoid",
    check: "string_format",
    abort: !1,
    ...y(t)
  });
}
// @__NO_SIDE_EFFECTS__
function pr(e, t) {
  return new e({
    type: "string",
    format: "cuid",
    check: "string_format",
    abort: !1,
    ...y(t)
  });
}
// @__NO_SIDE_EFFECTS__
function fr(e, t) {
  return new e({
    type: "string",
    format: "cuid2",
    check: "string_format",
    abort: !1,
    ...y(t)
  });
}
// @__NO_SIDE_EFFECTS__
function mr(e, t) {
  return new e({
    type: "string",
    format: "ulid",
    check: "string_format",
    abort: !1,
    ...y(t)
  });
}
// @__NO_SIDE_EFFECTS__
function _r(e, t) {
  return new e({
    type: "string",
    format: "xid",
    check: "string_format",
    abort: !1,
    ...y(t)
  });
}
// @__NO_SIDE_EFFECTS__
function br(e, t) {
  return new e({
    type: "string",
    format: "ksuid",
    check: "string_format",
    abort: !1,
    ...y(t)
  });
}
// @__NO_SIDE_EFFECTS__
function gr(e, t) {
  return new e({
    type: "string",
    format: "ipv4",
    check: "string_format",
    abort: !1,
    ...y(t)
  });
}
// @__NO_SIDE_EFFECTS__
function vr(e, t) {
  return new e({
    type: "string",
    format: "ipv6",
    check: "string_format",
    abort: !1,
    ...y(t)
  });
}
// @__NO_SIDE_EFFECTS__
function yr(e, t) {
  return new e({
    type: "string",
    format: "cidrv4",
    check: "string_format",
    abort: !1,
    ...y(t)
  });
}
// @__NO_SIDE_EFFECTS__
function wr(e, t) {
  return new e({
    type: "string",
    format: "cidrv6",
    check: "string_format",
    abort: !1,
    ...y(t)
  });
}
// @__NO_SIDE_EFFECTS__
function kr(e, t) {
  return new e({
    type: "string",
    format: "base64",
    check: "string_format",
    abort: !1,
    ...y(t)
  });
}
// @__NO_SIDE_EFFECTS__
function zr(e, t) {
  return new e({
    type: "string",
    format: "base64url",
    check: "string_format",
    abort: !1,
    ...y(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Er(e, t) {
  return new e({
    type: "string",
    format: "e164",
    check: "string_format",
    abort: !1,
    ...y(t)
  });
}
// @__NO_SIDE_EFFECTS__
function $r(e, t) {
  return new e({
    type: "string",
    format: "jwt",
    check: "string_format",
    abort: !1,
    ...y(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Zr(e, t) {
  return new e({
    type: "string",
    format: "datetime",
    check: "string_format",
    offset: !1,
    local: !1,
    precision: null,
    ...y(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Sr(e, t) {
  return new e({
    type: "string",
    format: "date",
    check: "string_format",
    ...y(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Cr(e, t) {
  return new e({
    type: "string",
    format: "time",
    check: "string_format",
    precision: null,
    ...y(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Nr(e, t) {
  return new e({
    type: "string",
    format: "duration",
    check: "string_format",
    ...y(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Tr(e, t) {
  return new e({
    type: "number",
    checks: [],
    ...y(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Or(e, t) {
  return new e({
    type: "number",
    check: "number_format",
    abort: !1,
    format: "safeint",
    ...y(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Ir(e, t) {
  return new e({
    type: "boolean",
    ...y(t)
  });
}
// @__NO_SIDE_EFFECTS__
function xr(e) {
  return new e({
    type: "unknown"
  });
}
// @__NO_SIDE_EFFECTS__
function Pr(e, t) {
  return new e({
    type: "never",
    ...y(t)
  });
}
// @__NO_SIDE_EFFECTS__
function et(e, t) {
  return new Et({
    check: "less_than",
    ...y(t),
    value: e,
    inclusive: !1
  });
}
// @__NO_SIDE_EFFECTS__
function Ze(e, t) {
  return new Et({
    check: "less_than",
    ...y(t),
    value: e,
    inclusive: !0
  });
}
// @__NO_SIDE_EFFECTS__
function tt(e, t) {
  return new $t({
    check: "greater_than",
    ...y(t),
    value: e,
    inclusive: !1
  });
}
// @__NO_SIDE_EFFECTS__
function Se(e, t) {
  return new $t({
    check: "greater_than",
    ...y(t),
    value: e,
    inclusive: !0
  });
}
// @__NO_SIDE_EFFECTS__
function nt(e, t) {
  return new Xn({
    check: "multiple_of",
    ...y(t),
    value: e
  });
}
// @__NO_SIDE_EFFECTS__
function Ot(e, t) {
  return new qn({
    check: "max_length",
    ...y(t),
    maximum: e
  });
}
// @__NO_SIDE_EFFECTS__
function be(e, t) {
  return new Wn({
    check: "min_length",
    ...y(t),
    minimum: e
  });
}
// @__NO_SIDE_EFFECTS__
function It(e, t) {
  return new Qn({
    check: "length_equals",
    ...y(t),
    length: e
  });
}
// @__NO_SIDE_EFFECTS__
function Ar(e, t) {
  return new eo({
    check: "string_format",
    format: "regex",
    ...y(t),
    pattern: e
  });
}
// @__NO_SIDE_EFFECTS__
function Rr(e) {
  return new to({
    check: "string_format",
    format: "lowercase",
    ...y(e)
  });
}
// @__NO_SIDE_EFFECTS__
function Lr(e) {
  return new no({
    check: "string_format",
    format: "uppercase",
    ...y(e)
  });
}
// @__NO_SIDE_EFFECTS__
function jr(e, t) {
  return new oo({
    check: "string_format",
    format: "includes",
    ...y(t),
    includes: e
  });
}
// @__NO_SIDE_EFFECTS__
function Dr(e, t) {
  return new ro({
    check: "string_format",
    format: "starts_with",
    ...y(t),
    prefix: e
  });
}
// @__NO_SIDE_EFFECTS__
function Mr(e, t) {
  return new io({
    check: "string_format",
    format: "ends_with",
    ...y(t),
    suffix: e
  });
}
// @__NO_SIDE_EFFECTS__
function se(e) {
  return new so({
    check: "overwrite",
    tx: e
  });
}
// @__NO_SIDE_EFFECTS__
function Ur(e) {
  return /* @__PURE__ */ se((t) => t.normalize(e));
}
// @__NO_SIDE_EFFECTS__
function Br() {
  return /* @__PURE__ */ se((e) => e.trim());
}
// @__NO_SIDE_EFFECTS__
function Fr() {
  return /* @__PURE__ */ se((e) => e.toLowerCase());
}
// @__NO_SIDE_EFFECTS__
function Jr() {
  return /* @__PURE__ */ se((e) => e.toUpperCase());
}
// @__NO_SIDE_EFFECTS__
function Vr() {
  return /* @__PURE__ */ se((e) => Qt(e));
}
// @__NO_SIDE_EFFECTS__
function Hr(e, t, n) {
  return new e({
    type: "array",
    element: t,
    // get element() {
    //   return element;
    // },
    ...y(n)
  });
}
// @__NO_SIDE_EFFECTS__
function Yr(e, t, n) {
  return new e({
    type: "custom",
    check: "custom",
    fn: t,
    ...y(n)
  });
}
// @__NO_SIDE_EFFECTS__
function Gr(e) {
  const t = /* @__PURE__ */ Xr((n) => (n.addIssue = (o) => {
    if (typeof o == "string")
      n.issues.push(ue(o, n.value, t._zod.def));
    else {
      const r = o;
      r.fatal && (r.continue = !1), r.code ?? (r.code = "custom"), r.input ?? (r.input = n.value), r.inst ?? (r.inst = t), r.continue ?? (r.continue = !t._zod.def.abort), n.issues.push(ue(r));
    }
  }, e(n.value, n)));
  return t;
}
// @__NO_SIDE_EFFECTS__
function Xr(e, t) {
  const n = new B({
    check: "custom",
    ...y(t)
  });
  return n._zod.check = e, n;
}
function xt(e) {
  let t = (e == null ? void 0 : e.target) ?? "draft-2020-12";
  return t === "draft-4" && (t = "draft-04"), t === "draft-7" && (t = "draft-07"), {
    processors: e.processors ?? {},
    metadataRegistry: (e == null ? void 0 : e.metadata) ?? ce,
    target: t,
    unrepresentable: (e == null ? void 0 : e.unrepresentable) ?? "throw",
    override: (e == null ? void 0 : e.override) ?? (() => {
    }),
    io: (e == null ? void 0 : e.io) ?? "output",
    counter: 0,
    seen: /* @__PURE__ */ new Map(),
    cycles: (e == null ? void 0 : e.cycles) ?? "ref",
    reused: (e == null ? void 0 : e.reused) ?? "inline",
    external: (e == null ? void 0 : e.external) ?? void 0
  };
}
function D(e, t, n = { path: [], schemaPath: [] }) {
  var l, d;
  var o;
  const r = e._zod.def, i = t.seen.get(e);
  if (i)
    return i.count++, n.schemaPath.includes(e) && (i.cycle = n.path), i.schema;
  const s = { schema: {}, count: 1, cycle: void 0, path: n.path };
  t.seen.set(e, s);
  const a = (d = (l = e._zod).toJSONSchema) == null ? void 0 : d.call(l);
  if (a)
    s.schema = a;
  else {
    const _ = {
      ...n,
      schemaPath: [...n.schemaPath, e],
      path: n.path
    };
    if (e._zod.processJSONSchema)
      e._zod.processJSONSchema(t, s.schema, _);
    else {
      const v = s.schema, w = t.processors[r.type];
      if (!w)
        throw new Error(`[toJSONSchema]: Non-representable type encountered: ${r.type}`);
      w(e, t, v, _);
    }
    const f = e._zod.parent;
    f && (s.ref || (s.ref = f), D(f, t, _), t.seen.get(f).isParent = !0);
  }
  const c = t.metadataRegistry.get(e);
  return c && Object.assign(s.schema, c), t.io === "input" && M(e) && (delete s.schema.examples, delete s.schema.default), t.io === "input" && s.schema._prefault && ((o = s.schema).default ?? (o.default = s.schema._prefault)), delete s.schema._prefault, t.seen.get(e).schema;
}
function Pt(e, t) {
  var s, a, c, u;
  const n = e.seen.get(t);
  if (!n)
    throw new Error("Unprocessed schema. This is a bug in Zod.");
  const o = /* @__PURE__ */ new Map();
  for (const l of e.seen.entries()) {
    const d = (s = e.metadataRegistry.get(l[0])) == null ? void 0 : s.id;
    if (d) {
      const _ = o.get(d);
      if (_ && _ !== l[0])
        throw new Error(`Duplicate schema id "${d}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`);
      o.set(d, l[0]);
    }
  }
  const r = (l) => {
    var w;
    const d = e.target === "draft-2020-12" ? "$defs" : "definitions";
    if (e.external) {
      const N = (w = e.external.registry.get(l[0])) == null ? void 0 : w.id, C = e.external.uri ?? ((m) => m);
      if (N)
        return { ref: C(N) };
      const S = l[1].defId ?? l[1].schema.id ?? `schema${e.counter++}`;
      return l[1].defId = S, { defId: S, ref: `${C("__shared")}#/${d}/${S}` };
    }
    if (l[1] === n)
      return { ref: "#" };
    const f = `#/${d}/`, v = l[1].schema.id ?? `__schema${e.counter++}`;
    return { defId: v, ref: f + v };
  }, i = (l) => {
    if (l[1].schema.$ref)
      return;
    const d = l[1], { ref: _, defId: f } = r(l);
    d.def = { ...d.schema }, f && (d.defId = f);
    const v = d.schema;
    for (const w in v)
      delete v[w];
    v.$ref = _;
  };
  if (e.cycles === "throw")
    for (const l of e.seen.entries()) {
      const d = l[1];
      if (d.cycle)
        throw new Error(`Cycle detected: #/${(a = d.cycle) == null ? void 0 : a.join("/")}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`);
    }
  for (const l of e.seen.entries()) {
    const d = l[1];
    if (t === l[0]) {
      i(l);
      continue;
    }
    if (e.external) {
      const f = (c = e.external.registry.get(l[0])) == null ? void 0 : c.id;
      if (t !== l[0] && f) {
        i(l);
        continue;
      }
    }
    if ((u = e.metadataRegistry.get(l[0])) == null ? void 0 : u.id) {
      i(l);
      continue;
    }
    if (d.cycle) {
      i(l);
      continue;
    }
    if (d.count > 1 && e.reused === "ref") {
      i(l);
      continue;
    }
  }
}
function At(e, t) {
  var s, a, c;
  const n = e.seen.get(t);
  if (!n)
    throw new Error("Unprocessed schema. This is a bug in Zod.");
  const o = (u) => {
    const l = e.seen.get(u);
    if (l.ref === null)
      return;
    const d = l.def ?? l.schema, _ = { ...d }, f = l.ref;
    if (l.ref = null, f) {
      o(f);
      const w = e.seen.get(f), N = w.schema;
      if (N.$ref && (e.target === "draft-07" || e.target === "draft-04" || e.target === "openapi-3.0") ? (d.allOf = d.allOf ?? [], d.allOf.push(N)) : Object.assign(d, N), Object.assign(d, _), u._zod.parent === f)
        for (const S in d)
          S === "$ref" || S === "allOf" || S in _ || delete d[S];
      if (N.$ref && w.def)
        for (const S in d)
          S === "$ref" || S === "allOf" || S in w.def && JSON.stringify(d[S]) === JSON.stringify(w.def[S]) && delete d[S];
    }
    const v = u._zod.parent;
    if (v && v !== f) {
      o(v);
      const w = e.seen.get(v);
      if (w != null && w.schema.$ref && (d.$ref = w.schema.$ref, w.def))
        for (const N in d)
          N === "$ref" || N === "allOf" || N in w.def && JSON.stringify(d[N]) === JSON.stringify(w.def[N]) && delete d[N];
    }
    e.override({
      zodSchema: u,
      jsonSchema: d,
      path: l.path ?? []
    });
  };
  for (const u of [...e.seen.entries()].reverse())
    o(u[0]);
  const r = {};
  if (e.target === "draft-2020-12" ? r.$schema = "https://json-schema.org/draft/2020-12/schema" : e.target === "draft-07" ? r.$schema = "http://json-schema.org/draft-07/schema#" : e.target === "draft-04" ? r.$schema = "http://json-schema.org/draft-04/schema#" : e.target, (s = e.external) != null && s.uri) {
    const u = (a = e.external.registry.get(t)) == null ? void 0 : a.id;
    if (!u)
      throw new Error("Schema is missing an `id` property");
    r.$id = e.external.uri(u);
  }
  Object.assign(r, n.def ?? n.schema);
  const i = ((c = e.external) == null ? void 0 : c.defs) ?? {};
  for (const u of e.seen.entries()) {
    const l = u[1];
    l.def && l.defId && (i[l.defId] = l.def);
  }
  e.external || Object.keys(i).length > 0 && (e.target === "draft-2020-12" ? r.$defs = i : r.definitions = i);
  try {
    const u = JSON.parse(JSON.stringify(r));
    return Object.defineProperty(u, "~standard", {
      value: {
        ...t["~standard"],
        jsonSchema: {
          input: ge(t, "input", e.processors),
          output: ge(t, "output", e.processors)
        }
      },
      enumerable: !1,
      writable: !1
    }), u;
  } catch {
    throw new Error("Error converting schema to JSON.");
  }
}
function M(e, t) {
  const n = t ?? { seen: /* @__PURE__ */ new Set() };
  if (n.seen.has(e))
    return !1;
  n.seen.add(e);
  const o = e._zod.def;
  if (o.type === "transform")
    return !0;
  if (o.type === "array")
    return M(o.element, n);
  if (o.type === "set")
    return M(o.valueType, n);
  if (o.type === "lazy")
    return M(o.getter(), n);
  if (o.type === "promise" || o.type === "optional" || o.type === "nonoptional" || o.type === "nullable" || o.type === "readonly" || o.type === "default" || o.type === "prefault")
    return M(o.innerType, n);
  if (o.type === "intersection")
    return M(o.left, n) || M(o.right, n);
  if (o.type === "record" || o.type === "map")
    return M(o.keyType, n) || M(o.valueType, n);
  if (o.type === "pipe")
    return M(o.in, n) || M(o.out, n);
  if (o.type === "object") {
    for (const r in o.shape)
      if (M(o.shape[r], n))
        return !0;
    return !1;
  }
  if (o.type === "union") {
    for (const r of o.options)
      if (M(r, n))
        return !0;
    return !1;
  }
  if (o.type === "tuple") {
    for (const r of o.items)
      if (M(r, n))
        return !0;
    return !!(o.rest && M(o.rest, n));
  }
  return !1;
}
const Kr = (e, t = {}) => (n) => {
  const o = xt({ ...n, processors: t });
  return D(e, o), Pt(o, e), At(o, e);
}, ge = (e, t, n = {}) => (o) => {
  const { libraryOptions: r, target: i } = o ?? {}, s = xt({ ...r ?? {}, target: i, io: t, processors: n });
  return D(e, s), Pt(s, e), At(s, e);
}, qr = {
  guid: "uuid",
  url: "uri",
  datetime: "date-time",
  json_string: "json-string",
  regex: ""
  // do not set
}, Wr = (e, t, n, o) => {
  const r = n;
  r.type = "string";
  const { minimum: i, maximum: s, format: a, patterns: c, contentEncoding: u } = e._zod.bag;
  if (typeof i == "number" && (r.minLength = i), typeof s == "number" && (r.maxLength = s), a && (r.format = qr[a] ?? a, r.format === "" && delete r.format, a === "time" && delete r.format), u && (r.contentEncoding = u), c && c.size > 0) {
    const l = [...c];
    l.length === 1 ? r.pattern = l[0].source : l.length > 1 && (r.allOf = [
      ...l.map((d) => ({
        ...t.target === "draft-07" || t.target === "draft-04" || t.target === "openapi-3.0" ? { type: "string" } : {},
        pattern: d.source
      }))
    ]);
  }
}, Qr = (e, t, n, o) => {
  const r = n, { minimum: i, maximum: s, format: a, multipleOf: c, exclusiveMaximum: u, exclusiveMinimum: l } = e._zod.bag;
  typeof a == "string" && a.includes("int") ? r.type = "integer" : r.type = "number", typeof l == "number" && (t.target === "draft-04" || t.target === "openapi-3.0" ? (r.minimum = l, r.exclusiveMinimum = !0) : r.exclusiveMinimum = l), typeof i == "number" && (r.minimum = i, typeof l == "number" && t.target !== "draft-04" && (l >= i ? delete r.minimum : delete r.exclusiveMinimum)), typeof u == "number" && (t.target === "draft-04" || t.target === "openapi-3.0" ? (r.maximum = u, r.exclusiveMaximum = !0) : r.exclusiveMaximum = u), typeof s == "number" && (r.maximum = s, typeof u == "number" && t.target !== "draft-04" && (u <= s ? delete r.maximum : delete r.exclusiveMaximum)), typeof c == "number" && (r.multipleOf = c);
}, ei = (e, t, n, o) => {
  n.type = "boolean";
}, ti = (e, t, n, o) => {
  n.not = {};
}, ni = (e, t, n, o) => {
}, oi = (e, t, n, o) => {
  const r = e._zod.def, i = pt(r.entries);
  i.every((s) => typeof s == "number") && (n.type = "number"), i.every((s) => typeof s == "string") && (n.type = "string"), n.enum = i;
}, ri = (e, t, n, o) => {
  if (t.unrepresentable === "throw")
    throw new Error("Custom types cannot be represented in JSON Schema");
}, ii = (e, t, n, o) => {
  if (t.unrepresentable === "throw")
    throw new Error("Transforms cannot be represented in JSON Schema");
}, si = (e, t, n, o) => {
  const r = n, i = e._zod.def, { minimum: s, maximum: a } = e._zod.bag;
  typeof s == "number" && (r.minItems = s), typeof a == "number" && (r.maxItems = a), r.type = "array", r.items = D(i.element, t, { ...o, path: [...o.path, "items"] });
}, ai = (e, t, n, o) => {
  var u;
  const r = n, i = e._zod.def;
  r.type = "object", r.properties = {};
  const s = i.shape;
  for (const l in s)
    r.properties[l] = D(s[l], t, {
      ...o,
      path: [...o.path, "properties", l]
    });
  const a = new Set(Object.keys(s)), c = new Set([...a].filter((l) => {
    const d = i.shape[l]._zod;
    return t.io === "input" ? d.optin === void 0 : d.optout === void 0;
  }));
  c.size > 0 && (r.required = Array.from(c)), ((u = i.catchall) == null ? void 0 : u._zod.def.type) === "never" ? r.additionalProperties = !1 : i.catchall ? i.catchall && (r.additionalProperties = D(i.catchall, t, {
    ...o,
    path: [...o.path, "additionalProperties"]
  })) : t.io === "output" && (r.additionalProperties = !1);
}, ci = (e, t, n, o) => {
  const r = e._zod.def, i = r.inclusive === !1, s = r.options.map((a, c) => D(a, t, {
    ...o,
    path: [...o.path, i ? "oneOf" : "anyOf", c]
  }));
  i ? n.oneOf = s : n.anyOf = s;
}, ui = (e, t, n, o) => {
  const r = e._zod.def, i = D(r.left, t, {
    ...o,
    path: [...o.path, "allOf", 0]
  }), s = D(r.right, t, {
    ...o,
    path: [...o.path, "allOf", 1]
  }), a = (u) => "allOf" in u && Object.keys(u).length === 1, c = [
    ...a(i) ? i.allOf : [i],
    ...a(s) ? s.allOf : [s]
  ];
  n.allOf = c;
}, li = (e, t, n, o) => {
  const r = n, i = e._zod.def;
  r.type = "object";
  const s = i.keyType, a = s._zod.bag, c = a == null ? void 0 : a.patterns;
  if (i.mode === "loose" && c && c.size > 0) {
    const l = D(i.valueType, t, {
      ...o,
      path: [...o.path, "patternProperties", "*"]
    });
    r.patternProperties = {};
    for (const d of c)
      r.patternProperties[d.source] = l;
  } else
    (t.target === "draft-07" || t.target === "draft-2020-12") && (r.propertyNames = D(i.keyType, t, {
      ...o,
      path: [...o.path, "propertyNames"]
    })), r.additionalProperties = D(i.valueType, t, {
      ...o,
      path: [...o.path, "additionalProperties"]
    });
  const u = s._zod.values;
  if (u) {
    const l = [...u].filter((d) => typeof d == "string" || typeof d == "number");
    l.length > 0 && (r.required = l);
  }
}, di = (e, t, n, o) => {
  const r = e._zod.def, i = D(r.innerType, t, o), s = t.seen.get(e);
  t.target === "openapi-3.0" ? (s.ref = r.innerType, n.nullable = !0) : n.anyOf = [i, { type: "null" }];
}, hi = (e, t, n, o) => {
  const r = e._zod.def;
  D(r.innerType, t, o);
  const i = t.seen.get(e);
  i.ref = r.innerType;
}, pi = (e, t, n, o) => {
  const r = e._zod.def;
  D(r.innerType, t, o);
  const i = t.seen.get(e);
  i.ref = r.innerType, n.default = JSON.parse(JSON.stringify(r.defaultValue));
}, fi = (e, t, n, o) => {
  const r = e._zod.def;
  D(r.innerType, t, o);
  const i = t.seen.get(e);
  i.ref = r.innerType, t.io === "input" && (n._prefault = JSON.parse(JSON.stringify(r.defaultValue)));
}, mi = (e, t, n, o) => {
  const r = e._zod.def;
  D(r.innerType, t, o);
  const i = t.seen.get(e);
  i.ref = r.innerType;
  let s;
  try {
    s = r.catchValue(void 0);
  } catch {
    throw new Error("Dynamic catch values are not supported in JSON Schema");
  }
  n.default = s;
}, _i = (e, t, n, o) => {
  const r = e._zod.def, i = t.io === "input" ? r.in._zod.def.type === "transform" ? r.out : r.in : r.out;
  D(i, t, o);
  const s = t.seen.get(e);
  s.ref = i;
}, bi = (e, t, n, o) => {
  const r = e._zod.def;
  D(r.innerType, t, o);
  const i = t.seen.get(e);
  i.ref = r.innerType, n.readOnly = !0;
}, Rt = (e, t, n, o) => {
  const r = e._zod.def;
  D(r.innerType, t, o);
  const i = t.seen.get(e);
  i.ref = r.innerType;
}, gi = /* @__PURE__ */ h("ZodISODateTime", (e, t) => {
  wo.init(e, t), x.init(e, t);
});
function vi(e) {
  return /* @__PURE__ */ Zr(gi, e);
}
const yi = /* @__PURE__ */ h("ZodISODate", (e, t) => {
  ko.init(e, t), x.init(e, t);
});
function wi(e) {
  return /* @__PURE__ */ Sr(yi, e);
}
const ki = /* @__PURE__ */ h("ZodISOTime", (e, t) => {
  zo.init(e, t), x.init(e, t);
});
function zi(e) {
  return /* @__PURE__ */ Cr(ki, e);
}
const Ei = /* @__PURE__ */ h("ZodISODuration", (e, t) => {
  Eo.init(e, t), x.init(e, t);
});
function $i(e) {
  return /* @__PURE__ */ Nr(Ei, e);
}
const Zi = (e, t) => {
  bt.init(e, t), e.name = "ZodError", Object.defineProperties(e, {
    format: {
      value: (n) => pn(e, n)
      // enumerable: false,
    },
    flatten: {
      value: (n) => hn(e, n)
      // enumerable: false,
    },
    addIssue: {
      value: (n) => {
        e.issues.push(n), e.message = JSON.stringify(e.issues, Ce, 2);
      }
      // enumerable: false,
    },
    addIssues: {
      value: (n) => {
        e.issues.push(...n), e.message = JSON.stringify(e.issues, Ce, 2);
      }
      // enumerable: false,
    },
    isEmpty: {
      get() {
        return e.issues.length === 0;
      }
      // enumerable: false,
    }
  });
}, F = h("ZodError", Zi, {
  Parent: Error
}), Si = /* @__PURE__ */ Ae(F), Ci = /* @__PURE__ */ Re(F), Ni = /* @__PURE__ */ ke(F), Ti = /* @__PURE__ */ ze(F), Oi = /* @__PURE__ */ _n(F), Ii = /* @__PURE__ */ bn(F), xi = /* @__PURE__ */ gn(F), Pi = /* @__PURE__ */ vn(F), Ai = /* @__PURE__ */ yn(F), Ri = /* @__PURE__ */ wn(F), Li = /* @__PURE__ */ kn(F), ji = /* @__PURE__ */ zn(F), A = /* @__PURE__ */ h("ZodType", (e, t) => (P.init(e, t), Object.assign(e["~standard"], {
  jsonSchema: {
    input: ge(e, "input"),
    output: ge(e, "output")
  }
}), e.toJSONSchema = Kr(e, {}), e.def = t, e.type = t.type, Object.defineProperty(e, "_def", { value: t }), e.check = (...n) => e.clone(W(t, {
  checks: [
    ...t.checks ?? [],
    ...n.map((o) => typeof o == "function" ? { _zod: { check: o, def: { check: "custom" }, onattach: [] } } : o)
  ]
}), {
  parent: !0
}), e.with = e.check, e.clone = (n, o) => Q(e, n, o), e.brand = () => e, e.register = (n, o) => (n.add(e, o), e), e.parse = (n, o) => Si(e, n, o, { callee: e.parse }), e.safeParse = (n, o) => Ni(e, n, o), e.parseAsync = async (n, o) => Ci(e, n, o, { callee: e.parseAsync }), e.safeParseAsync = async (n, o) => Ti(e, n, o), e.spa = e.safeParseAsync, e.encode = (n, o) => Oi(e, n, o), e.decode = (n, o) => Ii(e, n, o), e.encodeAsync = async (n, o) => xi(e, n, o), e.decodeAsync = async (n, o) => Pi(e, n, o), e.safeEncode = (n, o) => Ai(e, n, o), e.safeDecode = (n, o) => Ri(e, n, o), e.safeEncodeAsync = async (n, o) => Li(e, n, o), e.safeDecodeAsync = async (n, o) => ji(e, n, o), e.refine = (n, o) => e.check(Ts(n, o)), e.superRefine = (n) => e.check(Os(n)), e.overwrite = (n) => e.check(/* @__PURE__ */ se(n)), e.optional = () => it(e), e.exactOptional = () => gs(e), e.nullable = () => st(e), e.nullish = () => it(st(e)), e.nonoptional = (n) => zs(e, n), e.array = () => le(e), e.or = (n) => ls([e, n]), e.and = (n) => hs(e, n), e.transform = (n) => at(e, _s(n)), e.default = (n) => ys(e, n), e.prefault = (n) => ks(e, n), e.catch = (n) => $s(e, n), e.pipe = (n) => at(e, n), e.readonly = () => Cs(e), e.describe = (n) => {
  const o = e.clone();
  return ce.add(o, { description: n }), o;
}, Object.defineProperty(e, "description", {
  get() {
    var n;
    return (n = ce.get(e)) == null ? void 0 : n.description;
  },
  configurable: !0
}), e.meta = (...n) => {
  if (n.length === 0)
    return ce.get(e);
  const o = e.clone();
  return ce.add(o, n[0]), o;
}, e.isOptional = () => e.safeParse(void 0).success, e.isNullable = () => e.safeParse(null).success, e.apply = (n) => n(e), e)), Lt = /* @__PURE__ */ h("_ZodString", (e, t) => {
  Le.init(e, t), A.init(e, t), e._zod.processJSONSchema = (o, r, i) => Wr(e, o, r);
  const n = e._zod.bag;
  e.format = n.format ?? null, e.minLength = n.minimum ?? null, e.maxLength = n.maximum ?? null, e.regex = (...o) => e.check(/* @__PURE__ */ Ar(...o)), e.includes = (...o) => e.check(/* @__PURE__ */ jr(...o)), e.startsWith = (...o) => e.check(/* @__PURE__ */ Dr(...o)), e.endsWith = (...o) => e.check(/* @__PURE__ */ Mr(...o)), e.min = (...o) => e.check(/* @__PURE__ */ be(...o)), e.max = (...o) => e.check(/* @__PURE__ */ Ot(...o)), e.length = (...o) => e.check(/* @__PURE__ */ It(...o)), e.nonempty = (...o) => e.check(/* @__PURE__ */ be(1, ...o)), e.lowercase = (o) => e.check(/* @__PURE__ */ Rr(o)), e.uppercase = (o) => e.check(/* @__PURE__ */ Lr(o)), e.trim = () => e.check(/* @__PURE__ */ Br()), e.normalize = (...o) => e.check(/* @__PURE__ */ Ur(...o)), e.toLowerCase = () => e.check(/* @__PURE__ */ Fr()), e.toUpperCase = () => e.check(/* @__PURE__ */ Jr()), e.slugify = () => e.check(/* @__PURE__ */ Vr());
}), jt = /* @__PURE__ */ h("ZodString", (e, t) => {
  Le.init(e, t), Lt.init(e, t), e.email = (n) => e.check(/* @__PURE__ */ ir(Di, n)), e.url = (n) => e.check(/* @__PURE__ */ lr(Mi, n)), e.jwt = (n) => e.check(/* @__PURE__ */ $r(ts, n)), e.emoji = (n) => e.check(/* @__PURE__ */ dr(Ui, n)), e.guid = (n) => e.check(/* @__PURE__ */ Qe(ot, n)), e.uuid = (n) => e.check(/* @__PURE__ */ sr(fe, n)), e.uuidv4 = (n) => e.check(/* @__PURE__ */ ar(fe, n)), e.uuidv6 = (n) => e.check(/* @__PURE__ */ cr(fe, n)), e.uuidv7 = (n) => e.check(/* @__PURE__ */ ur(fe, n)), e.nanoid = (n) => e.check(/* @__PURE__ */ hr(Bi, n)), e.guid = (n) => e.check(/* @__PURE__ */ Qe(ot, n)), e.cuid = (n) => e.check(/* @__PURE__ */ pr(Fi, n)), e.cuid2 = (n) => e.check(/* @__PURE__ */ fr(Ji, n)), e.ulid = (n) => e.check(/* @__PURE__ */ mr(Vi, n)), e.base64 = (n) => e.check(/* @__PURE__ */ kr(Wi, n)), e.base64url = (n) => e.check(/* @__PURE__ */ zr(Qi, n)), e.xid = (n) => e.check(/* @__PURE__ */ _r(Hi, n)), e.ksuid = (n) => e.check(/* @__PURE__ */ br(Yi, n)), e.ipv4 = (n) => e.check(/* @__PURE__ */ gr(Gi, n)), e.ipv6 = (n) => e.check(/* @__PURE__ */ vr(Xi, n)), e.cidrv4 = (n) => e.check(/* @__PURE__ */ yr(Ki, n)), e.cidrv6 = (n) => e.check(/* @__PURE__ */ wr(qi, n)), e.e164 = (n) => e.check(/* @__PURE__ */ Er(es, n)), e.datetime = (n) => e.check(vi(n)), e.date = (n) => e.check(wi(n)), e.time = (n) => e.check(zi(n)), e.duration = (n) => e.check($i(n));
});
function U(e) {
  return /* @__PURE__ */ rr(jt, e);
}
const x = /* @__PURE__ */ h("ZodStringFormat", (e, t) => {
  I.init(e, t), Lt.init(e, t);
}), Di = /* @__PURE__ */ h("ZodEmail", (e, t) => {
  ho.init(e, t), x.init(e, t);
}), ot = /* @__PURE__ */ h("ZodGUID", (e, t) => {
  uo.init(e, t), x.init(e, t);
}), fe = /* @__PURE__ */ h("ZodUUID", (e, t) => {
  lo.init(e, t), x.init(e, t);
}), Mi = /* @__PURE__ */ h("ZodURL", (e, t) => {
  po.init(e, t), x.init(e, t);
}), Ui = /* @__PURE__ */ h("ZodEmoji", (e, t) => {
  fo.init(e, t), x.init(e, t);
}), Bi = /* @__PURE__ */ h("ZodNanoID", (e, t) => {
  mo.init(e, t), x.init(e, t);
}), Fi = /* @__PURE__ */ h("ZodCUID", (e, t) => {
  _o.init(e, t), x.init(e, t);
}), Ji = /* @__PURE__ */ h("ZodCUID2", (e, t) => {
  bo.init(e, t), x.init(e, t);
}), Vi = /* @__PURE__ */ h("ZodULID", (e, t) => {
  go.init(e, t), x.init(e, t);
}), Hi = /* @__PURE__ */ h("ZodXID", (e, t) => {
  vo.init(e, t), x.init(e, t);
}), Yi = /* @__PURE__ */ h("ZodKSUID", (e, t) => {
  yo.init(e, t), x.init(e, t);
}), Gi = /* @__PURE__ */ h("ZodIPv4", (e, t) => {
  $o.init(e, t), x.init(e, t);
}), Xi = /* @__PURE__ */ h("ZodIPv6", (e, t) => {
  Zo.init(e, t), x.init(e, t);
}), Ki = /* @__PURE__ */ h("ZodCIDRv4", (e, t) => {
  So.init(e, t), x.init(e, t);
}), qi = /* @__PURE__ */ h("ZodCIDRv6", (e, t) => {
  Co.init(e, t), x.init(e, t);
}), Wi = /* @__PURE__ */ h("ZodBase64", (e, t) => {
  No.init(e, t), x.init(e, t);
}), Qi = /* @__PURE__ */ h("ZodBase64URL", (e, t) => {
  Oo.init(e, t), x.init(e, t);
}), es = /* @__PURE__ */ h("ZodE164", (e, t) => {
  Io.init(e, t), x.init(e, t);
}), ts = /* @__PURE__ */ h("ZodJWT", (e, t) => {
  Po.init(e, t), x.init(e, t);
}), je = /* @__PURE__ */ h("ZodNumber", (e, t) => {
  St.init(e, t), A.init(e, t), e._zod.processJSONSchema = (o, r, i) => Qr(e, o, r), e.gt = (o, r) => e.check(/* @__PURE__ */ tt(o, r)), e.gte = (o, r) => e.check(/* @__PURE__ */ Se(o, r)), e.min = (o, r) => e.check(/* @__PURE__ */ Se(o, r)), e.lt = (o, r) => e.check(/* @__PURE__ */ et(o, r)), e.lte = (o, r) => e.check(/* @__PURE__ */ Ze(o, r)), e.max = (o, r) => e.check(/* @__PURE__ */ Ze(o, r)), e.int = (o) => e.check(rt(o)), e.safe = (o) => e.check(rt(o)), e.positive = (o) => e.check(/* @__PURE__ */ tt(0, o)), e.nonnegative = (o) => e.check(/* @__PURE__ */ Se(0, o)), e.negative = (o) => e.check(/* @__PURE__ */ et(0, o)), e.nonpositive = (o) => e.check(/* @__PURE__ */ Ze(0, o)), e.multipleOf = (o, r) => e.check(/* @__PURE__ */ nt(o, r)), e.step = (o, r) => e.check(/* @__PURE__ */ nt(o, r)), e.finite = () => e;
  const n = e._zod.bag;
  e.minValue = Math.max(n.minimum ?? Number.NEGATIVE_INFINITY, n.exclusiveMinimum ?? Number.NEGATIVE_INFINITY) ?? null, e.maxValue = Math.min(n.maximum ?? Number.POSITIVE_INFINITY, n.exclusiveMaximum ?? Number.POSITIVE_INFINITY) ?? null, e.isInt = (n.format ?? "").includes("int") || Number.isSafeInteger(n.multipleOf ?? 0.5), e.isFinite = !0, e.format = n.format ?? null;
});
function ee(e) {
  return /* @__PURE__ */ Tr(je, e);
}
const ns = /* @__PURE__ */ h("ZodNumberFormat", (e, t) => {
  Ao.init(e, t), je.init(e, t);
});
function rt(e) {
  return /* @__PURE__ */ Or(ns, e);
}
const Dt = /* @__PURE__ */ h("ZodBoolean", (e, t) => {
  Ro.init(e, t), A.init(e, t), e._zod.processJSONSchema = (n, o, r) => ei(e, n, o);
});
function os(e) {
  return /* @__PURE__ */ Ir(Dt, e);
}
const rs = /* @__PURE__ */ h("ZodUnknown", (e, t) => {
  Lo.init(e, t), A.init(e, t), e._zod.processJSONSchema = (n, o, r) => ni();
});
function ve() {
  return /* @__PURE__ */ xr(rs);
}
const is = /* @__PURE__ */ h("ZodNever", (e, t) => {
  jo.init(e, t), A.init(e, t), e._zod.processJSONSchema = (n, o, r) => ti(e, n, o);
});
function ss(e) {
  return /* @__PURE__ */ Pr(is, e);
}
const as = /* @__PURE__ */ h("ZodArray", (e, t) => {
  Do.init(e, t), A.init(e, t), e._zod.processJSONSchema = (n, o, r) => si(e, n, o, r), e.element = t.element, e.min = (n, o) => e.check(/* @__PURE__ */ be(n, o)), e.nonempty = (n) => e.check(/* @__PURE__ */ be(1, n)), e.max = (n, o) => e.check(/* @__PURE__ */ Ot(n, o)), e.length = (n, o) => e.check(/* @__PURE__ */ It(n, o)), e.unwrap = () => e.element;
});
function le(e, t) {
  return /* @__PURE__ */ Hr(as, e, t);
}
const cs = /* @__PURE__ */ h("ZodObject", (e, t) => {
  Uo.init(e, t), A.init(e, t), e._zod.processJSONSchema = (n, o, r) => ai(e, n, o, r), T(e, "shape", () => t.shape), e.keyof = () => Mt(Object.keys(e._zod.def.shape)), e.catchall = (n) => e.clone({ ...e._zod.def, catchall: n }), e.passthrough = () => e.clone({ ...e._zod.def, catchall: ve() }), e.loose = () => e.clone({ ...e._zod.def, catchall: ve() }), e.strict = () => e.clone({ ...e._zod.def, catchall: ss() }), e.strip = () => e.clone({ ...e._zod.def, catchall: void 0 }), e.extend = (n) => an(e, n), e.safeExtend = (n) => cn(e, n), e.merge = (n) => un(e, n), e.pick = (n) => rn(e, n), e.omit = (n) => sn(e, n), e.partial = (...n) => ln(De, e, n[0]), e.required = (...n) => dn(Bt, e, n[0]);
});
function de(e, t) {
  const n = {
    type: "object",
    shape: e ?? {},
    ...y(t)
  };
  return new cs(n);
}
const us = /* @__PURE__ */ h("ZodUnion", (e, t) => {
  Bo.init(e, t), A.init(e, t), e._zod.processJSONSchema = (n, o, r) => ci(e, n, o, r), e.options = t.options;
});
function ls(e, t) {
  return new us({
    type: "union",
    options: e,
    ...y(t)
  });
}
const ds = /* @__PURE__ */ h("ZodIntersection", (e, t) => {
  Fo.init(e, t), A.init(e, t), e._zod.processJSONSchema = (n, o, r) => ui(e, n, o, r);
});
function hs(e, t) {
  return new ds({
    type: "intersection",
    left: e,
    right: t
  });
}
const ps = /* @__PURE__ */ h("ZodRecord", (e, t) => {
  Jo.init(e, t), A.init(e, t), e._zod.processJSONSchema = (n, o, r) => li(e, n, o, r), e.keyType = t.keyType, e.valueType = t.valueType;
});
function fs(e, t, n) {
  return new ps({
    type: "record",
    keyType: e,
    valueType: t,
    ...y(n)
  });
}
const ye = /* @__PURE__ */ h("ZodEnum", (e, t) => {
  Vo.init(e, t), A.init(e, t), e._zod.processJSONSchema = (o, r, i) => oi(e, o, r), e.enum = t.entries, e.options = Object.values(t.entries);
  const n = new Set(Object.keys(t.entries));
  e.extract = (o, r) => {
    const i = {};
    for (const s of o)
      if (n.has(s))
        i[s] = t.entries[s];
      else
        throw new Error(`Key ${s} not found in enum`);
    return new ye({
      ...t,
      checks: [],
      ...y(r),
      entries: i
    });
  }, e.exclude = (o, r) => {
    const i = { ...t.entries };
    for (const s of o)
      if (n.has(s))
        delete i[s];
      else
        throw new Error(`Key ${s} not found in enum`);
    return new ye({
      ...t,
      checks: [],
      ...y(r),
      entries: i
    });
  };
});
function Mt(e, t) {
  const n = Array.isArray(e) ? Object.fromEntries(e.map((o) => [o, o])) : e;
  return new ye({
    type: "enum",
    entries: n,
    ...y(t)
  });
}
const ms = /* @__PURE__ */ h("ZodTransform", (e, t) => {
  Ho.init(e, t), A.init(e, t), e._zod.processJSONSchema = (n, o, r) => ii(e, n), e._zod.parse = (n, o) => {
    if (o.direction === "backward")
      throw new dt(e.constructor.name);
    n.addIssue = (i) => {
      if (typeof i == "string")
        n.issues.push(ue(i, n.value, t));
      else {
        const s = i;
        s.fatal && (s.continue = !1), s.code ?? (s.code = "custom"), s.input ?? (s.input = n.value), s.inst ?? (s.inst = e), n.issues.push(ue(s));
      }
    };
    const r = t.transform(n.value, n);
    return r instanceof Promise ? r.then((i) => (n.value = i, n)) : (n.value = r, n);
  };
});
function _s(e) {
  return new ms({
    type: "transform",
    transform: e
  });
}
const De = /* @__PURE__ */ h("ZodOptional", (e, t) => {
  Tt.init(e, t), A.init(e, t), e._zod.processJSONSchema = (n, o, r) => Rt(e, n, o, r), e.unwrap = () => e._zod.def.innerType;
});
function it(e) {
  return new De({
    type: "optional",
    innerType: e
  });
}
const bs = /* @__PURE__ */ h("ZodExactOptional", (e, t) => {
  Yo.init(e, t), A.init(e, t), e._zod.processJSONSchema = (n, o, r) => Rt(e, n, o, r), e.unwrap = () => e._zod.def.innerType;
});
function gs(e) {
  return new bs({
    type: "optional",
    innerType: e
  });
}
const vs = /* @__PURE__ */ h("ZodNullable", (e, t) => {
  Go.init(e, t), A.init(e, t), e._zod.processJSONSchema = (n, o, r) => di(e, n, o, r), e.unwrap = () => e._zod.def.innerType;
});
function st(e) {
  return new vs({
    type: "nullable",
    innerType: e
  });
}
const Ut = /* @__PURE__ */ h("ZodDefault", (e, t) => {
  Xo.init(e, t), A.init(e, t), e._zod.processJSONSchema = (n, o, r) => pi(e, n, o, r), e.unwrap = () => e._zod.def.innerType, e.removeDefault = e.unwrap;
});
function ys(e, t) {
  return new Ut({
    type: "default",
    innerType: e,
    get defaultValue() {
      return typeof t == "function" ? t() : mt(t);
    }
  });
}
const ws = /* @__PURE__ */ h("ZodPrefault", (e, t) => {
  Ko.init(e, t), A.init(e, t), e._zod.processJSONSchema = (n, o, r) => fi(e, n, o, r), e.unwrap = () => e._zod.def.innerType;
});
function ks(e, t) {
  return new ws({
    type: "prefault",
    innerType: e,
    get defaultValue() {
      return typeof t == "function" ? t() : mt(t);
    }
  });
}
const Bt = /* @__PURE__ */ h("ZodNonOptional", (e, t) => {
  qo.init(e, t), A.init(e, t), e._zod.processJSONSchema = (n, o, r) => hi(e, n, o, r), e.unwrap = () => e._zod.def.innerType;
});
function zs(e, t) {
  return new Bt({
    type: "nonoptional",
    innerType: e,
    ...y(t)
  });
}
const Es = /* @__PURE__ */ h("ZodCatch", (e, t) => {
  Wo.init(e, t), A.init(e, t), e._zod.processJSONSchema = (n, o, r) => mi(e, n, o, r), e.unwrap = () => e._zod.def.innerType, e.removeCatch = e.unwrap;
});
function $s(e, t) {
  return new Es({
    type: "catch",
    innerType: e,
    catchValue: typeof t == "function" ? t : () => t
  });
}
const Zs = /* @__PURE__ */ h("ZodPipe", (e, t) => {
  Qo.init(e, t), A.init(e, t), e._zod.processJSONSchema = (n, o, r) => _i(e, n, o, r), e.in = t.in, e.out = t.out;
});
function at(e, t) {
  return new Zs({
    type: "pipe",
    in: e,
    out: t
    // ...util.normalizeParams(params),
  });
}
const Ss = /* @__PURE__ */ h("ZodReadonly", (e, t) => {
  er.init(e, t), A.init(e, t), e._zod.processJSONSchema = (n, o, r) => bi(e, n, o, r), e.unwrap = () => e._zod.def.innerType;
});
function Cs(e) {
  return new Ss({
    type: "readonly",
    innerType: e
  });
}
const Ns = /* @__PURE__ */ h("ZodCustom", (e, t) => {
  tr.init(e, t), A.init(e, t), e._zod.processJSONSchema = (n, o, r) => ri(e, n);
});
function Ts(e, t = {}) {
  return /* @__PURE__ */ Yr(Ns, e, t);
}
function Os(e) {
  return /* @__PURE__ */ Gr(e);
}
const Is = /* @__PURE__ */ new Set(["id", "image"]);
function Te(e) {
  return e instanceof De ? Te(e.unwrap()) : e instanceof Ut ? Te(e._def.innerType) : e;
}
function xs(e) {
  const t = [];
  for (const [n, o] of Object.entries(e.shape)) {
    if (Is.has(n)) continue;
    const r = o, i = Te(r), s = r.description ?? n;
    if (i instanceof Dt) {
      t.push({ key: n, label: s, type: "boolean" });
      continue;
    }
    if (i instanceof ye) {
      t.push({ key: n, label: s, type: "select", options: i.options });
      continue;
    }
    if (i instanceof je) {
      const a = i;
      t.push({
        key: n,
        label: s,
        type: "number",
        min: a.minValue ?? void 0,
        max: a.maxValue ?? void 0
      });
      continue;
    }
    if (i instanceof jt) {
      const a = i, c = n.toLowerCase().includes("emoji") || s.includes("אמוג");
      t.push({
        key: n,
        label: s,
        type: c ? "emoji" : "text",
        maxLength: a.maxLength ?? void 0
      });
      continue;
    }
    t.push({ key: n, label: s, type: "text" });
  }
  return t;
}
const Ps = de({
  x: ee().min(0).max(100),
  y: ee().min(0).max(100)
}), As = de({
  id: U(),
  shape: Mt(["rect", "polygon"]).default("rect"),
  x: ee().min(0).max(100),
  y: ee().min(0).max(100),
  width: ee().min(0).max(100),
  height: ee().min(0).max(100),
  points: le(Ps).optional(),
  correct: os().default(!1),
  label: U().optional()
}), Me = de({
  id: U(),
  image: U().optional(),
  zones: le(As).optional()
}).passthrough(), Rs = Me.extend({
  target: U().max(2).describe("אות יעד"),
  correct: U().describe("תשובה נכונה"),
  correctEmoji: U().describe("אמוג'י")
}), Ls = Me.extend({
  target: U().max(2).describe("אות יעד"),
  correct: U().describe("תשובה נכונה"),
  correctEmoji: U().describe("אמוג'י")
}), js = de({
  title: U().default(""),
  type: U().default("multiple-choice")
}).passthrough(), oa = de({
  id: U(),
  version: ee().default(1),
  meta: js.default({ title: "", type: "multiple-choice" }),
  rounds: le(fs(U(), ve())).default([]),
  distractors: le(ve()).default([])
}), Ds = Me.extend({
  instruction: U().optional().describe("הוראה")
}), ct = {
  "multiple-choice": Rs,
  "drag-match": Ls,
  "zone-tap": Ds
};
function Ms(e, { onFieldChange: t, onDeleteRound: n, roundSchema: o }) {
  const r = document.createElement("div");
  r.className = "ab-editor-inspector";
  const i = document.createElement("div");
  i.className = "ab-editor-inspector__header", i.innerHTML = '<span class="ab-editor-inspector__title">✏️ ערוך סיבוב</span>', r.appendChild(i);
  const s = document.createElement("div");
  s.className = "ab-editor-inspector__body", r.appendChild(s);
  const a = document.createElement("button");
  a.className = "ab-editor-inspector__delete", a.textContent = "🗑 מחק סיבוב", r.appendChild(a), e.appendChild(r);
  let c = null;
  function u() {
    s.innerHTML = '<p class="ab-editor-inspector__empty">בחר סיבוב לעריכה</p>', a.hidden = !0, c = null;
  }
  function l(m, k = "multiple-choice") {
    c = m.id, s.innerHTML = "", a.hidden = !1;
    const b = o ?? ct[k] ?? ct["multiple-choice"];
    xs(b).forEach((z) => s.appendChild(d(z, m))), s.appendChild(C(m)), a.onclick = () => {
      confirm("למחוק את הסיבוב הזה?") && (n(c), u());
    };
  }
  function d(m, k) {
    const b = document.createElement("div");
    b.className = "ab-editor-field";
    const $ = document.createElement("label");
    switch ($.className = "ab-editor-field__label", $.textContent = m.label, b.appendChild($), m.type) {
      case "emoji":
        b.appendChild(f(m, k));
        break;
      case "boolean":
        b.appendChild(v(m, k));
        break;
      case "select":
        b.appendChild(w(m, k));
        break;
      case "number":
        b.appendChild(N(m, k));
        break;
      default:
        b.appendChild(_(m, k));
        break;
    }
    return b;
  }
  function _(m, k) {
    const b = document.createElement("input");
    return b.className = "ab-editor-field__input", b.type = "text", b.value = String(k[m.key] ?? ""), b.dir = "rtl", m.maxLength && (b.maxLength = m.maxLength), b.addEventListener("input", () => t(c, m.key, b.value)), b;
  }
  function f(m, k) {
    const b = document.createElement("div");
    b.className = "ab-editor-field__emoji-row";
    const $ = document.createElement("div");
    $.className = "ab-editor-field__emoji-preview", $.textContent = String(k[m.key] ?? "❓"), b.appendChild($);
    const z = document.createElement("input");
    return z.className = "ab-editor-field__input", z.type = "text", z.value = String(k[m.key] ?? ""), z.maxLength = 8, z.placeholder = "🐱", z.style.fontSize = "20px", z.addEventListener("input", () => {
      $.textContent = z.value || "❓", t(c, m.key, z.value);
    }), b.appendChild(z), b;
  }
  function v(m, k) {
    const b = document.createElement("input");
    return b.type = "checkbox", b.checked = !!k[m.key], b.addEventListener("change", () => t(c, m.key, b.checked)), b;
  }
  function w(m, k) {
    const b = document.createElement("select");
    return b.className = "ab-editor-field__input", (m.options ?? []).forEach(($) => {
      const z = document.createElement("option");
      z.value = $, z.textContent = $, k[m.key] === $ && (z.selected = !0), b.appendChild(z);
    }), b.addEventListener("change", () => t(c, m.key, b.value)), b;
  }
  function N(m, k) {
    const b = document.createElement("input");
    return b.className = "ab-editor-field__input", b.type = "number", b.value = String(k[m.key] ?? ""), m.min !== void 0 && (b.min = String(m.min)), m.max !== void 0 && (b.max = String(m.max)), b.addEventListener("input", () => t(c, m.key, Number(b.value))), b;
  }
  function C(m) {
    const k = document.createElement("div");
    k.className = "ab-editor-field ab-editor-field--image";
    const b = document.createElement("label");
    b.className = "ab-editor-field__label", b.textContent = "🖼 תמונה", k.appendChild(b);
    const $ = document.createElement("div");
    $.className = "ab-editor-field__img-row";
    const z = document.createElement("div");
    z.className = "ab-editor-field__img-preview", m.image && (z.style.backgroundImage = `url(${m.image})`), $.appendChild(z);
    const J = document.createElement("div");
    J.className = "ab-editor-field__img-btns";
    const Y = document.createElement("input");
    Y.type = "file", Y.accept = "image/*", Y.style.display = "none", Y.addEventListener("change", () => {
      var p;
      const V = (p = Y.files) == null ? void 0 : p[0];
      if (!V) return;
      const ae = new FileReader();
      ae.onload = (g) => {
        const E = g.target.result;
        z.style.backgroundImage = `url(${E})`, X.textContent = "🔄 החלף", t(c, "image", E), G.isConnected || J.appendChild(G);
      }, ae.readAsDataURL(V);
    }), J.appendChild(Y);
    const X = document.createElement("button");
    X.className = "ab-editor-btn ab-editor-btn--img-upload", X.textContent = m.image ? "🔄 החלף" : "📤 העלה", X.addEventListener("click", () => Y.click()), J.appendChild(X);
    const G = document.createElement("button");
    return G.className = "ab-editor-btn ab-editor-btn--img-clear", G.textContent = "✕ הסר", G.addEventListener("click", () => {
      z.style.backgroundImage = "", X.textContent = "📤 העלה", t(c, "image", null), G.remove();
    }), m.image && J.appendChild(G), $.appendChild(J), k.appendChild($), k;
  }
  function S() {
    r.remove();
  }
  return u(), { loadRound: l, clear: u, destroy: S };
}
const Us = [
  {
    id: "instructions",
    label: "📝 הוראות",
    slots: [
      { key: "instruction-welcome", label: "ברוכים הבאים" },
      { key: "instruction-how-to", label: "איך משחקים" },
      { key: "instruction-complete", label: "סיום המשחק" }
    ]
  },
  {
    id: "feedback",
    label: "✅ משוב",
    slots: [
      { key: "feedback-correct", label: "תשובה נכונה — כל הכבוד!" },
      { key: "feedback-wrong", label: "תשובה שגויה" },
      { key: "feedback-try-again", label: "נסה שוב" },
      { key: "feedback-encourage", label: "עידוד כללי" }
    ]
  },
  {
    id: "nikud",
    label: "◌ ניקוד",
    slots: [
      { key: "nikud-patah", label: "פַּתַח" },
      { key: "nikud-kamatz", label: "קָמַץ" },
      { key: "nikud-hiriq", label: "חִירִיק" },
      { key: "nikud-tsere", label: "צֵרֵי" },
      { key: "nikud-segol", label: "סֶגּוֹל" },
      { key: "nikud-holam", label: "חוֹלָם" },
      { key: "nikud-shuruq", label: "שׁוּרוּק" }
    ]
  }
];
function Bs(e) {
  return e.trim().replace(/\s+/g, "-").replace(/[^a-z0-9\u05D0-\u05EA_-]/gi, "").toLowerCase() || `custom-${Date.now()}`;
}
function Fs(e) {
  return Yt(`alefbet.audio-manager.${e}.custom`, []);
}
function Js(e, t = null) {
  var u;
  (u = document.getElementById("ab-audio-manager")) == null || u.remove();
  const n = document.createElement("div");
  n.id = "ab-audio-manager", n.className = "ab-am-modal", n.setAttribute("role", "dialog"), n.setAttribute("aria-modal", "true"), n.setAttribute("aria-label", "מנהל הקלטות"), n.innerHTML = `
    <div class="ab-am-backdrop"></div>
    <div class="ab-am-box">
      <div class="ab-am-header">
        <span class="ab-am-title">🎤 מנהל הקלטות</span>
        <span class="ab-am-subtitle">כל ההקלטות נשמרות בדפדפן וניתן להשתמש בהן דרך <code>playVoice('${e}', voiceKey)</code></span>
        <button class="ab-am-close" aria-label="סגור">✕</button>
      </div>
      <div class="ab-am-body" id="ab-am-body"></div>
    </div>
  `, document.body.appendChild(n);
  const o = n.querySelector("#ab-am-body"), r = n.querySelector(".ab-am-close"), i = n.querySelector(".ab-am-backdrop"), s = [], a = [...Us];
  t && t.rounds.length > 0 && a.splice(1, 0, {
    // insert after Instructions
    id: "rounds",
    label: "🔤 שאלות / סיבובים",
    slots: t.rounds.map((l, d) => ({
      key: l.id,
      label: `סיבוב ${d + 1}${l.target ? " — " + l.target : ""}${l.correct ? " (" + l.correct + ")" : ""}`
    }))
  }), a.forEach((l) => {
    o.appendChild(Vs(l, e, s));
  }), o.appendChild(Hs(e, s));
  function c() {
    s.forEach((l) => l.destroy()), n.remove();
  }
  r.addEventListener("click", c), i.addEventListener("click", c), document.addEventListener("keydown", function l(d) {
    d.key === "Escape" && (c(), document.removeEventListener("keydown", l));
  });
}
function Vs(e, t, n) {
  const o = document.createElement("section");
  o.className = "ab-am-section";
  const r = document.createElement("button");
  r.className = "ab-am-section__heading", r.setAttribute("aria-expanded", "true"), r.innerHTML = `<span>${e.label}</span><span class="ab-am-chevron">▾</span>`, o.appendChild(r);
  const i = document.createElement("div");
  return i.className = "ab-am-grid", o.appendChild(i), e.slots.forEach((s) => {
    i.appendChild(Ft(t, s.key, s.label, n));
  }), r.addEventListener("click", () => {
    const s = r.getAttribute("aria-expanded") === "true";
    r.setAttribute("aria-expanded", String(!s)), i.hidden = s, r.querySelector(".ab-am-chevron").textContent = s ? "▸" : "▾";
  }), o;
}
function Hs(e, t) {
  const n = Fs(e), o = document.createElement("section");
  o.className = "ab-am-section";
  const r = document.createElement("button");
  r.className = "ab-am-section__heading", r.setAttribute("aria-expanded", "true"), r.innerHTML = '<span>➕ מותאם אישית</span><span class="ab-am-chevron">▾</span>', o.appendChild(r);
  const i = document.createElement("div");
  i.className = "ab-am-grid", o.appendChild(i);
  function s() {
    i.querySelectorAll(".ab-am-row").forEach((d) => {
      const _ = d._voiceBtn;
      _ && (t.splice(t.indexOf(_), 1), _.destroy());
    }), i.innerHTML = "", n.get().forEach((d) => {
      const _ = Ft(e, d.key, d.label, t, () => {
        n.update((f) => f.filter((v) => v.key !== d.key)), s();
      });
      i.appendChild(_);
    });
  }
  s();
  const a = document.createElement("div");
  a.className = "ab-am-add-row", a.innerHTML = `
    <input class="ab-am-add-input" type="text" placeholder="שם ההקלטה... (למשל: שאלה ראשונה)" dir="rtl" />
    <button class="ab-am-add-btn">+ הוסף</button>
  `, o.appendChild(a);
  const c = a.querySelector(".ab-am-add-input"), u = a.querySelector(".ab-am-add-btn");
  function l() {
    const d = c.value.trim();
    if (!d) return;
    const _ = Bs(d);
    if (n.get().some((f) => f.key === _)) {
      c.select();
      return;
    }
    n.update((f) => [...f, { key: _, label: d }]), c.value = "", s();
  }
  return u.addEventListener("click", l), c.addEventListener("keydown", (d) => {
    d.key === "Enter" && l();
  }), r.addEventListener("click", () => {
    const d = r.getAttribute("aria-expanded") === "true";
    r.setAttribute("aria-expanded", String(!d)), i.hidden = d, a.hidden = d, r.querySelector(".ab-am-chevron").textContent = d ? "▸" : "▾";
  }), o;
}
function Ft(e, t, n, o, r = null) {
  const i = document.createElement("div");
  i.className = "ab-am-row";
  const s = document.createElement("div");
  s.className = "ab-am-row__label", s.textContent = n;
  const a = document.createElement("code");
  a.className = "ab-am-row__key", a.textContent = t;
  const c = document.createElement("div");
  c.className = "ab-am-row__label-col", c.appendChild(s), c.appendChild(a);
  const u = document.createElement("div");
  if (u.className = "ab-am-row__ctrl", r) {
    const d = document.createElement("button");
    d.className = "ab-am-row__del", d.title = "הסר", d.setAttribute("aria-label", "הסר הקלטה"), d.textContent = "✕", d.addEventListener("click", r), u.appendChild(d);
  }
  const l = lt(u, { gameId: e, voiceKey: t, label: n });
  return o.push(l), i._voiceBtn = l, i.appendChild(c), i.appendChild(u), i;
}
let Ys = 0;
function ut() {
  return `zone-${Date.now()}-${Ys++}`;
}
function Gs(e) {
  const t = e.map((i) => i.x), n = e.map((i) => i.y), o = Math.min(...t), r = Math.min(...n);
  return { x: o, y: r, width: Math.max(...t) - o, height: Math.max(...n) - r };
}
function Xs(e, t, n, o, r) {
  return e.map((i) => {
    const s = o > 0 ? (i.x - t) / o * 100 : 0, a = r > 0 ? (i.y - n) / r * 100 : 0;
    return `${s},${a}`;
  }).join(" ");
}
function Ks(e, t, { onChange: n, gameId: o }) {
  let r = structuredClone(t), i = null, s = "rect", a = [], c = null, u = [], l = null, d = null, _ = null;
  const f = document.createElement("div");
  f.className = "ab-ze-overlay";
  const v = document.createElement("div");
  v.className = "ab-ze-draw-rect", v.hidden = !0, f.appendChild(v);
  const w = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  w.classList.add("ab-ze-poly-svg"), w.setAttribute("viewBox", "0 0 100 100"), w.setAttribute("preserveAspectRatio", "none"), w.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:12;", f.appendChild(w);
  const N = document.createElement("div");
  N.className = "ab-ze-toolbar", f.appendChild(N);
  function C() {
    N.innerHTML = "";
    const p = document.createElement("button");
    p.className = `ab-ze-tool-btn${s === "rect" ? " ab-ze-tool-btn--active" : ""}`, p.textContent = "▭ מלבן", p.addEventListener("click", () => {
      b("rect");
    }), N.appendChild(p);
    const g = document.createElement("button");
    g.className = `ab-ze-tool-btn${s === "polygon" ? " ab-ze-tool-btn--active" : ""}`, g.textContent = "✎ חופשי", g.addEventListener("click", () => {
      b("polygon");
    }), N.appendChild(g);
    const E = document.createElement("span");
    E.className = "ab-ze-toolbar__hint", E.textContent = s === "rect" ? "גררו לציור מלבן" : "לחצו נקודות, לחצו פעמיים לסגירה", N.appendChild(E);
  }
  e.style.position = "relative", e.appendChild(f), C();
  function S(p, g) {
    const E = f.getBoundingClientRect();
    return {
      px: Math.max(0, Math.min(100, (p - E.left) / E.width * 100)),
      py: Math.max(0, Math.min(100, (g - E.top) / E.height * 100))
    };
  }
  function m() {
    a.forEach((p) => p.destroy()), a = [], f.querySelectorAll(".ab-ze-zone").forEach((p) => p.remove()), f.querySelectorAll(".ab-ze-panel").forEach((p) => p.remove()), r.forEach((p) => {
      const g = document.createElement("div");
      if (g.className = "ab-ze-zone", p.correct && g.classList.add("ab-ze-zone--correct"), p.id === i && g.classList.add("ab-ze-zone--selected"), g.dataset.zoneId = p.id, g.style.left = `${p.x}%`, g.style.top = `${p.y}%`, g.style.width = `${p.width}%`, g.style.height = `${p.height}%`, p.shape === "polygon" && p.points && p.points.length >= 3) {
        const Z = `clip-${p.id}`;
        g.innerHTML = `<svg class="ab-ze-zone__poly-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs><clipPath id="${Z}"><polygon points="${Xs(p.points, p.x, p.y, p.width, p.height)}"/></clipPath></defs>
          <rect x="0" y="0" width="100" height="100" clip-path="url(#${Z})" fill="currentColor"/>
        </svg>`, g.classList.add("ab-ze-zone--poly");
      }
      const E = document.createElement("div");
      E.className = "ab-ze-zone__badge", E.textContent = p.correct ? "✓" : "", p.label && (E.textContent = p.label), g.appendChild(E);
      const R = document.createElement("button");
      R.className = "ab-ze-zone__toggle", R.textContent = p.correct ? "✓ נכון" : "✗ לא נכון", R.title = "סמן כתשובה נכונה / לא נכונה", R.addEventListener("pointerdown", (Z) => Z.stopPropagation()), R.addEventListener("click", (Z) => {
        Z.stopPropagation(), p.correct = !p.correct, V(), m();
      }), g.appendChild(R);
      const O = document.createElement("button");
      if (O.className = "ab-ze-zone__delete", O.textContent = "✕", O.title = "מחק אזור", O.addEventListener("pointerdown", (Z) => Z.stopPropagation()), O.addEventListener("click", (Z) => {
        Z.stopPropagation(), r = r.filter((L) => L.id !== p.id), i === p.id && (i = null), V(), m();
      }), g.appendChild(O), p.shape !== "polygon" && p.id === i)
        for (const Z of ["nw", "ne", "sw", "se"]) {
          const L = document.createElement("div");
          L.className = `ab-ze-zone__handle ab-ze-zone__handle--${Z}`, L.dataset.handle = Z, L.addEventListener("pointerdown", (j) => {
            j.stopPropagation(), j.preventDefault(), _ = {
              zoneId: p.id,
              handle: Z,
              origZone: { ...p },
              startX: j.clientX,
              startY: j.clientY
            };
          }), g.appendChild(L);
        }
      if (g.addEventListener("pointerdown", (Z) => {
        if (Z.stopPropagation(), _) return;
        i = p.id, m();
        const { px: L, py: j } = S(Z.clientX, Z.clientY);
        d = { zoneId: p.id, offsetX: L - p.x, offsetY: j - p.y };
      }), f.appendChild(g), p.id === i) {
        const Z = document.createElement("div");
        Z.className = "ab-ze-panel", Z.style.left = `${p.x}%`, Z.style.top = `${p.y + p.height + 1}%`;
        const L = document.createElement("div");
        L.className = "ab-ze-panel__row";
        const j = document.createElement("input");
        if (j.className = "ab-ze-panel__input", j.type = "text", j.dir = "rtl", j.placeholder = "תווית (למשל: חתול)", j.value = p.label || "", j.addEventListener("pointerdown", (H) => H.stopPropagation()), j.addEventListener("input", () => {
          p.label = j.value || void 0, V();
        }), L.appendChild(j), Z.appendChild(L), o) {
          const H = document.createElement("div");
          H.className = "ab-ze-panel__row";
          const $e = document.createElement("span");
          $e.className = "ab-ze-panel__audio-label", $e.textContent = "🎤", H.appendChild($e);
          const Jt = lt(H, {
            gameId: o,
            voiceKey: `zone-${p.id}`,
            label: `הקלטה לאזור ${p.label || p.id}`
          });
          a.push(Jt), Z.appendChild(H);
        }
        Z.addEventListener("pointerdown", (H) => H.stopPropagation()), f.appendChild(Z);
      }
    });
  }
  function k() {
    if (w.innerHTML = "", u.length === 0) return;
    const p = [...u];
    l && p.push(l);
    const g = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    g.setAttribute("points", p.map((E) => `${E.x},${E.y}`).join(" ")), g.setAttribute("fill", "rgba(251,191,36,0.15)"), g.setAttribute("stroke", "#fbbf24"), g.setAttribute("stroke-width", "0.4"), g.setAttribute("stroke-dasharray", "1,0.5"), w.appendChild(g), u.forEach((E, R) => {
      const O = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      O.setAttribute("cx", String(E.x)), O.setAttribute("cy", String(E.y)), O.setAttribute("r", "0.8"), O.setAttribute("fill", R === 0 ? "#22c55e" : "#fbbf24"), O.setAttribute("stroke", "#fff"), O.setAttribute("stroke-width", "0.3"), w.appendChild(O);
    });
  }
  function b(p) {
    u.length > 0 && (u = [], l = null, k()), s = p, f.classList.toggle("ab-ze-overlay--poly-mode", p === "polygon"), C();
  }
  function $() {
    if (!c) return;
    const p = Math.min(c.startX, c.curX), g = Math.min(c.startY, c.curY), E = Math.abs(c.curX - c.startX), R = Math.abs(c.curY - c.startY);
    v.style.left = `${p}%`, v.style.top = `${g}%`, v.style.width = `${E}%`, v.style.height = `${R}%`;
  }
  function z() {
    if (u.length < 3) {
      u = [], l = null, k();
      return;
    }
    const p = [...u], g = Gs(p);
    if (g.width > 1 && g.height > 1) {
      const E = {
        id: ut(),
        shape: "polygon",
        ...g,
        points: p,
        correct: !1
      };
      r.push(E), i = E.id, V();
    }
    u = [], l = null, k(), m();
  }
  function J(p) {
    if (p.button !== 0 || p.target.closest(".ab-ze-zone") || p.target.closest(".ab-ze-toolbar") || p.target.closest(".ab-ze-panel")) return;
    if (i = null, s === "polygon") {
      const { px: R, py: O } = S(p.clientX, p.clientY);
      if (u.length >= 3) {
        const Z = u[0];
        if (Math.abs(R - Z.x) < 2 && Math.abs(O - Z.y) < 2) {
          z();
          return;
        }
      }
      u.push({ x: R, y: O }), k(), m();
      return;
    }
    const { px: g, py: E } = S(p.clientX, p.clientY);
    c = { startX: g, startY: E, curX: g, curY: E }, v.hidden = !1, $(), m();
  }
  function Y(p) {
    s === "polygon" && u.length >= 3 && (p.preventDefault(), z());
  }
  function X(p) {
    if (s === "polygon" && u.length > 0) {
      const { px: g, py: E } = S(p.clientX, p.clientY);
      l = { x: g, y: E }, k();
    }
    if (c) {
      const { px: g, py: E } = S(p.clientX, p.clientY);
      c.curX = g, c.curY = E, $();
      return;
    }
    if (_) {
      p.preventDefault();
      const g = r.find((j) => j.id === _.zoneId);
      if (!g) return;
      const E = _.origZone, R = f.getBoundingClientRect(), O = (p.clientX - _.startX) / R.width * 100, Z = (p.clientY - _.startY) / R.height * 100, L = _.handle;
      L.includes("e") && (g.width = Math.max(3, E.width + O)), L.includes("w") && (g.x = E.x + O, g.width = Math.max(3, E.width - O)), L.includes("s") && (g.height = Math.max(3, E.height + Z)), L.includes("n") && (g.y = E.y + Z, g.height = Math.max(3, E.height - Z)), m();
      return;
    }
    if (d) {
      p.preventDefault();
      const g = r.find((L) => L.id === d.zoneId);
      if (!g) return;
      const { px: E, py: R } = S(p.clientX, p.clientY), O = Math.max(0, Math.min(100 - g.width, E - d.offsetX)), Z = Math.max(0, Math.min(100 - g.height, R - d.offsetY));
      if (g.shape === "polygon" && g.points) {
        const L = O - g.x, j = Z - g.y;
        g.points = g.points.map((H) => ({ x: H.x + L, y: H.y + j }));
      }
      g.x = O, g.y = Z, m();
    }
  }
  function G() {
    if (c) {
      const p = Math.min(c.startX, c.curX), g = Math.min(c.startY, c.curY), E = Math.abs(c.curX - c.startX), R = Math.abs(c.curY - c.startY);
      if (E > 3 && R > 3) {
        const O = {
          id: ut(),
          shape: "rect",
          x: p,
          y: g,
          width: E,
          height: R,
          correct: !1
        };
        r.push(O), i = O.id, V();
      }
      c = null, v.hidden = !0, m();
      return;
    }
    if (_) {
      _ = null, V();
      return;
    }
    d && (d = null, V());
  }
  function V() {
    n(structuredClone(r));
  }
  function ae(p) {
    if (p.key === "Escape" && u.length > 0) {
      u = [], l = null, k();
      return;
    }
    if (p.key === "Enter" && u.length >= 3) {
      z();
      return;
    }
    i && ((p.key === "Delete" || p.key === "Backspace") && (r = r.filter((g) => g.id !== i), i = null, V(), m()), p.key === "Escape" && (i = null, m()));
  }
  return f.addEventListener("pointerdown", J), f.addEventListener("dblclick", Y), document.addEventListener("pointermove", X), document.addEventListener("pointerup", G), document.addEventListener("keydown", ae), m(), {
    setZones(p) {
      r = structuredClone(p), i = null, m();
    },
    getZones() {
      return structuredClone(r);
    },
    setTool(p) {
      b(p);
    },
    destroy() {
      f.removeEventListener("pointerdown", J), f.removeEventListener("dblclick", Y), document.removeEventListener("pointermove", X), document.removeEventListener("pointerup", G), document.removeEventListener("keydown", ae), a.forEach((p) => p.destroy()), f.remove();
    }
  };
}
let qs = 0;
function Ws() {
  return `tpl-zone-${Date.now()}-${qs++}`;
}
const Qs = [
  {
    id: "grid-2x2",
    name: "2×2 Grid",
    nameHe: "רשת 2×2",
    icon: "⊞",
    description: "ארבעה אזורים בפריסה שווה",
    zones: [
      { shape: "rect", x: 3, y: 3, width: 44, height: 44, correct: !1 },
      { shape: "rect", x: 53, y: 3, width: 44, height: 44, correct: !1 },
      { shape: "rect", x: 3, y: 53, width: 44, height: 44, correct: !1 },
      { shape: "rect", x: 53, y: 53, width: 44, height: 44, correct: !1 }
    ]
  },
  {
    id: "grid-3x3",
    name: "3×3 Grid",
    nameHe: "רשת 3×3",
    icon: "⊞",
    description: "תשעה אזורים בפריסה שווה",
    zones: (() => {
      const e = [];
      for (let t = 0; t < 3; t++)
        for (let n = 0; n < 3; n++)
          e.push({ shape: "rect", x: 2 + n * 33, y: 2 + t * 33, width: 30, height: 30, correct: !1 });
      return e;
    })()
  },
  {
    id: "two-columns",
    name: "Two Columns",
    nameHe: "שני עמודים",
    icon: "▮▮",
    description: "שני אזורים גדולים — ימין ושמאל",
    zones: [
      { shape: "rect", x: 3, y: 5, width: 44, height: 90, correct: !1 },
      { shape: "rect", x: 53, y: 5, width: 44, height: 90, correct: !1 }
    ]
  },
  {
    id: "top-bottom",
    name: "Top & Bottom",
    nameHe: "למעלה ולמטה",
    icon: "▬▬",
    description: "שני אזורים — עליון ותחתון",
    zones: [
      { shape: "rect", x: 5, y: 3, width: 90, height: 44, correct: !1 },
      { shape: "rect", x: 5, y: 53, width: 90, height: 44, correct: !1 }
    ]
  },
  {
    id: "one-of-four",
    name: "One Correct of Four",
    nameHe: "אחד נכון מתוך ארבעה",
    icon: "✓✗",
    description: "ארבע אפשרויות — אחת נכונה",
    zones: [
      { shape: "rect", x: 3, y: 3, width: 44, height: 44, correct: !0 },
      { shape: "rect", x: 53, y: 3, width: 44, height: 44, correct: !1 },
      { shape: "rect", x: 3, y: 53, width: 44, height: 44, correct: !1 },
      { shape: "rect", x: 53, y: 53, width: 44, height: 44, correct: !1 }
    ]
  },
  {
    id: "row-of-3",
    name: "Row of Three",
    nameHe: "שורה של שלוש",
    icon: "▭▭▭",
    description: "שלושה אזורים בשורה אחת",
    zones: [
      { shape: "rect", x: 2, y: 20, width: 30, height: 60, correct: !1 },
      { shape: "rect", x: 35, y: 20, width: 30, height: 60, correct: !1 },
      { shape: "rect", x: 68, y: 20, width: 30, height: 60, correct: !1 }
    ]
  },
  {
    id: "center-spotlight",
    name: "Center Spotlight",
    nameHe: "זרקור במרכז",
    icon: "◎",
    description: "אזור אחד גדול במרכז",
    zones: [
      { shape: "rect", x: 20, y: 15, width: 60, height: 70, correct: !0 }
    ]
  },
  {
    id: "empty",
    name: "Empty (Draw Your Own)",
    nameHe: "ריק — ציירו בעצמכם",
    icon: "✎",
    description: "התחלה ריקה, ציירו אזורים חופשיים",
    zones: []
  }
];
function ea(e) {
  return e.zones.map((t) => ({ ...t, id: Ws() }));
}
function ta(e) {
  var c;
  (c = document.getElementById("ab-tpl-picker")) == null || c.remove();
  const t = document.createElement("div");
  t.id = "ab-tpl-picker", t.className = "ab-tpl-modal", t.setAttribute("role", "dialog"), t.setAttribute("aria-modal", "true"), t.setAttribute("aria-label", "בחירת תבנית");
  const n = document.createElement("div");
  n.className = "ab-tpl-backdrop", t.appendChild(n);
  const o = document.createElement("div");
  o.className = "ab-tpl-box";
  const r = document.createElement("div");
  r.className = "ab-tpl-header", r.innerHTML = '<span class="ab-tpl-title">📐 בחרו תבנית</span>';
  const i = document.createElement("button");
  i.className = "ab-ze-close", i.textContent = "✕", i.addEventListener("click", a), r.appendChild(i), o.appendChild(r);
  const s = document.createElement("div");
  s.className = "ab-tpl-grid", Qs.forEach((u) => {
    const l = document.createElement("button");
    l.className = "ab-tpl-card", l.addEventListener("click", () => {
      e(ea(u)), a();
    });
    const d = document.createElement("div");
    d.className = "ab-tpl-card__preview", u.zones.forEach((v) => {
      const w = document.createElement("div");
      w.className = "ab-tpl-card__zone", v.correct && w.classList.add("ab-tpl-card__zone--correct"), w.style.left = `${v.x}%`, w.style.top = `${v.y}%`, w.style.width = `${v.width}%`, w.style.height = `${v.height}%`, d.appendChild(w);
    }), l.appendChild(d);
    const _ = document.createElement("div");
    _.className = "ab-tpl-card__label", _.innerHTML = `<span class="ab-tpl-card__icon">${u.icon}</span> ${u.nameHe}`, l.appendChild(_);
    const f = document.createElement("div");
    f.className = "ab-tpl-card__desc", f.textContent = u.description, l.appendChild(f), s.appendChild(l);
  }), o.appendChild(s), t.appendChild(o), document.body.appendChild(t);
  function a() {
    t.remove();
  }
  n.addEventListener("click", a), document.addEventListener("keydown", function u(l) {
    l.key === "Escape" && (a(), document.removeEventListener("keydown", u));
  });
}
class ra {
  constructor(t, n, o = {}) {
    this._mode = "play", this._overlay = null, this._navigator = null, this._inspector = null, this._toolbar = null, this._selectedId = null, this._undoBtn = null, this._redoBtn = null, this._shortcutHandler = null, this._zoneEditor = null, this._zoneModal = null, this._toolbarObserver = null, this._dirty = !1, this._saveStatus = null, this._unsubscribe = n.onChange(() => {
      this._dirty = !0, this._saveStatus && (this._saveStatus.textContent = "שינויים שלא נשמרו");
    }), this._container = t, this._gameData = n, this._restartGame = o.restartGame, this._roundSchema = o.roundSchema, this._toolbarFrame = requestAnimationFrame(() => this._injectToolbar());
  }
  /** הסרת מאזינים ורכיבי עריכה כשהמשחק מסתיים או מוחלף. */
  destroy() {
    var t, n, o, r, i;
    (t = this._toolbarObserver) == null || t.disconnect(), this._container.style.removeProperty("--ab-editor-toolbar-h"), this._unsubscribe(), cancelAnimationFrame(this._toolbarFrame), this._detachShortcuts(), this._closeZoneEditor(), (n = this._overlay) == null || n.destroy(), (o = this._navigator) == null || o.destroy(), (r = this._inspector) == null || r.destroy(), (i = this._toolbar) == null || i.remove(), this._container.classList.remove("ab-editor-active");
  }
  // ── Toolbar ───────────────────────────────────────────────────────────────
  _injectToolbar() {
    const t = this._container.querySelector(".game-header__spacer");
    t && (this._toolbar = document.createElement("div"), this._toolbar.className = "ab-editor-toolbar", this._toolbar.append(
      this._makeBtn("✏️ ערוך", "ab-editor-btn--edit", () => this.enterEditMode()),
      this._makeBtn("🎤 קול", "ab-editor-btn--audio", () => this._openAudioManager())
    ), t.innerHTML = "", t.appendChild(this._toolbar));
  }
  _makeBtn(t, n, o) {
    const r = document.createElement("button");
    return r.className = `ab-editor-btn ${n}`, r.innerHTML = t, r.addEventListener("click", o), r;
  }
  _setToolbarEditMode() {
    var t;
    this._toolbar && (this._toolbar.innerHTML = "", this._undoBtn = this._makeBtn("↩", "ab-editor-btn--undo", () => this._undo()), this._undoBtn.title = "בטל (Ctrl+Z)", this._redoBtn = this._makeBtn("↪", "ab-editor-btn--redo", () => this._redo()), this._redoBtn.title = "בצע שנית (Ctrl+Y)", this._toolbar.append(
      this._makeBtn("▶ שחק", "ab-editor-btn--play", () => this.enterPlayMode()),
      this._makeBtn("+ הוסף", "ab-editor-btn--add", () => this._addRound()),
      this._undoBtn,
      this._redoBtn,
      this._makeBtn("🔲 אזורים", "ab-editor-btn--zones", () => this._openZoneEditor()),
      this._makeBtn("💾 שמור", "ab-editor-btn--save", () => this._save()),
      this._makeBtn("🎤 קול", "ab-editor-btn--audio", () => this._openAudioManager()),
      this._makeBtn("⬇ ייצוא", "ab-editor-btn--export", () => Gt(this._gameData))
    ), this._saveStatus = document.createElement("span"), this._saveStatus.setAttribute("role", "status"), this._saveStatus.className = "ab-editor-save-status", this._saveStatus.textContent = this._dirty ? "שינויים שלא נשמרו" : "", this._toolbar.appendChild(this._saveStatus), (t = this._toolbarObserver) == null || t.disconnect(), this._toolbarObserver = new ResizeObserver(() => {
      this._toolbar && this._container.style.setProperty("--ab-editor-toolbar-h", `${this._toolbar.offsetHeight}px`);
    }), this._toolbarObserver.observe(this._toolbar), this._refreshUndoButtons());
  }
  _setToolbarPlayMode() {
    var t;
    (t = this._toolbarObserver) == null || t.disconnect(), this._container.style.removeProperty("--ab-editor-toolbar-h"), this._toolbar && (this._toolbar.innerHTML = "", this._undoBtn = null, this._redoBtn = null, this._toolbar.append(
      this._makeBtn("✏️ ערוך", "ab-editor-btn--edit", () => this.enterEditMode()),
      this._makeBtn("🎤 קול", "ab-editor-btn--audio", () => this._openAudioManager())
    ));
  }
  // ── Mode switching ────────────────────────────────────────────────────────
  enterEditMode() {
    if (this._mode === "edit") return;
    this._mode = "edit", this._container.classList.add("ab-editor-active"), this._setToolbarEditMode(), this._attachShortcuts();
    const t = this._container.querySelector(".game-body");
    if (!t) return;
    this._overlay = Kt(t), this._overlay.show(), this._navigator = qt(this._container, this._gameData, {
      onSelectRound: (o) => this._selectRound(o),
      onAddRound: (o) => this._addRound(o),
      onDuplicateRound: (o) => this._duplicateRound(o),
      onMoveRound: (o, r) => this._moveRound(o, r)
    }), this._inspector = Ms(this._container, {
      onFieldChange: (o, r, i) => this._onFieldChange(o, r, i),
      onDeleteRound: (o) => this._deleteRound(o),
      roundSchema: this._roundSchema
    });
    const n = this._gameData.rounds;
    n.length > 0 && this._selectRound(n[0].id);
  }
  enterPlayMode() {
    var t, n, o, r;
    this._mode !== "play" && (this._dirty && !this._save() || (this._mode = "play", this._container.classList.remove("ab-editor-active"), this._setToolbarPlayMode(), this._detachShortcuts(), this._closeZoneEditor(), (t = this._overlay) == null || t.destroy(), (n = this._navigator) == null || n.destroy(), (o = this._inspector) == null || o.destroy(), this._overlay = this._navigator = this._inspector = null, this._selectedId = null, (r = this._restartGame) == null || r.call(this, this._container)));
  }
  // ── Round management ──────────────────────────────────────────────────────
  _selectRound(t) {
    var o, r;
    this._selectedId = t, (o = this._navigator) == null || o.setActiveRound(t);
    const n = this._gameData.getRound(t);
    n && ((r = this._inspector) == null || r.loadRound(n, this._gameData.meta.type));
  }
  _addRound(t = null) {
    var o;
    const n = this._gameData.addRound(t ?? this._selectedId);
    (o = this._navigator) == null || o.refresh(), this._selectRound(n), this._refreshUndoButtons();
  }
  _duplicateRound(t) {
    var o;
    const n = this._gameData.duplicateRound(t ?? this._selectedId);
    n && ((o = this._navigator) == null || o.refresh(), this._selectRound(n), this._refreshUndoButtons());
  }
  _deleteRound(t) {
    var o;
    this._gameData.removeRound(t), (o = this._navigator) == null || o.refresh();
    const n = this._gameData.rounds;
    n.length > 0 && this._selectRound(n[0].id), this._refreshUndoButtons();
  }
  _moveRound(t, n) {
    var o, r;
    this._gameData.moveRound(t, n), (o = this._navigator) == null || o.refresh(), (r = this._navigator) == null || r.setActiveRound(t), this._refreshUndoButtons();
  }
  _onFieldChange(t, n, o) {
    var r, i;
    this._gameData.updateRound(t, { [n]: o }), (r = this._navigator) == null || r.refresh(), (i = this._navigator) == null || i.setActiveRound(t), this._refreshUndoButtons();
  }
  // ── Undo / Redo ───────────────────────────────────────────────────────────
  _undo() {
    var t;
    this._gameData.canUndo && (this._gameData.undo(), (t = this._navigator) == null || t.refresh(), this._resyncSelection(), this._refreshUndoButtons(), this._showToast("↩ בוטל"));
  }
  _redo() {
    var t;
    this._gameData.canRedo && (this._gameData.redo(), (t = this._navigator) == null || t.refresh(), this._resyncSelection(), this._refreshUndoButtons(), this._showToast("↪ בוצע שנית"));
  }
  _resyncSelection() {
    var o;
    const t = this._gameData.rounds, n = t.find((r) => r.id === this._selectedId);
    this._selectRound(n ? this._selectedId : (o = t[0]) == null ? void 0 : o.id);
  }
  _refreshUndoButtons() {
    this._undoBtn && (this._undoBtn.disabled = !this._gameData.canUndo), this._redoBtn && (this._redoBtn.disabled = !this._gameData.canRedo);
  }
  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  _attachShortcuts() {
    this._shortcutHandler = (t) => {
      if (this._mode !== "edit") return;
      const n = t.ctrlKey || t.metaKey;
      if (t.key === "Escape") {
        this.enterPlayMode();
        return;
      }
      if (n && !t.shiftKey && t.key.toLowerCase() === "s") {
        t.preventDefault(), this._save();
        return;
      }
      if (n && !t.shiftKey && t.key.toLowerCase() === "z") {
        t.preventDefault(), this._undo();
        return;
      }
      if (n && (t.key.toLowerCase() === "y" || t.shiftKey && t.key.toLowerCase() === "z")) {
        t.preventDefault(), this._redo();
        return;
      }
    }, document.addEventListener("keydown", this._shortcutHandler);
  }
  _detachShortcuts() {
    this._shortcutHandler && (document.removeEventListener("keydown", this._shortcutHandler), this._shortcutHandler = null);
  }
  // ── Zone editor ──────────────────────────────────────────────────────────
  _openZoneEditor() {
    var _;
    if (!this._selectedId) {
      this._showToast("בחרו סיבוב קודם");
      return;
    }
    const t = this._gameData.getRound(this._selectedId);
    if (!t) return;
    if (!t.image) {
      this._showToast("יש להוסיף תמונה לפני ציור אזורים");
      return;
    }
    const n = document.createElement("div");
    n.className = "ab-ze-modal";
    const o = document.createElement("div");
    o.className = "ab-ze-backdrop", n.appendChild(o);
    const r = document.createElement("div");
    r.className = "ab-ze-box";
    const i = document.createElement("div");
    i.className = "ab-ze-header", i.innerHTML = `
      <span class="ab-ze-title">🔲 עריכת אזורים</span>
      <span class="ab-ze-subtitle">ציירו מלבנים על התמונה וסמנו תשובות נכונות</span>
    `;
    const s = document.createElement("button");
    s.className = "ab-ze-close", s.textContent = "✕", s.addEventListener("click", () => this._closeZoneEditor()), i.appendChild(s), r.appendChild(i);
    const a = document.createElement("div");
    a.className = "ab-ze-img-container";
    const c = document.createElement("img");
    c.className = "ab-ze-img", c.src = t.image, c.alt = "", c.draggable = !1, a.appendChild(c), r.appendChild(a);
    const u = document.createElement("div");
    u.className = "ab-ze-footer";
    const l = document.createElement("button");
    l.className = "ab-editor-btn ab-editor-btn--zones", l.textContent = "📐 תבנית", l.addEventListener("click", () => {
      ta((f) => {
        var v;
        this._selectedId && (this._gameData.updateRound(this._selectedId, { zones: f }), this._refreshUndoButtons(), (v = this._zoneEditor) == null || v.setZones(f));
      });
    }), u.appendChild(l);
    const d = document.createElement("button");
    d.className = "ab-editor-btn ab-editor-btn--play", d.textContent = "✓ סיום", d.addEventListener("click", () => this._closeZoneEditor()), u.appendChild(d), r.appendChild(u), n.appendChild(r), document.body.appendChild(n), this._zoneModal = n, c.onload = () => {
      const f = t.zones ?? [];
      this._zoneEditor = Ks(a, f, {
        gameId: this._gameData.id,
        onChange: (v) => {
          this._selectedId && (this._gameData.updateRound(this._selectedId, { zones: v }), this._refreshUndoButtons());
        }
      });
    }, c.complete && c.naturalWidth > 0 && ((_ = c.onload) == null || _.call(c, new Event("load"))), o.addEventListener("click", () => this._closeZoneEditor());
  }
  _closeZoneEditor() {
    var t, n;
    (t = this._zoneEditor) == null || t.destroy(), this._zoneEditor = null, (n = this._zoneModal) == null || n.remove(), this._zoneModal = null;
  }
  // ── Helpers ───────────────────────────────────────────────────────────────
  _openAudioManager() {
    Js(this._gameData.id, this._gameData);
  }
  _save() {
    return this._gameData.validate() ? Xt(this._gameData) ? (this._dirty = !1, this._saveStatus && (this._saveStatus.textContent = "נשמר"), this._showToast("✅ נשמר!"), !0) : (this._dirty = !0, this._saveStatus && (this._saveStatus.textContent = "לא נשמר. נסו שוב או הורידו עותק בכפתור ייצוא."), !1) : (this._dirty = !0, this._saveStatus && (this._saveStatus.textContent = "לא נשמר. בדקו את התוכן בכל הסיבובים."), !1);
  }
  _showToast(t) {
    const n = document.createElement("div");
    n.className = "ab-editor-toast", n.textContent = t, document.body.appendChild(n), setTimeout(() => n.remove(), 2200);
  }
}
export {
  Qs as ACTIVITY_TEMPLATES,
  ct as BUILTIN_ROUND_SCHEMAS,
  Me as BaseRoundSchema,
  Ls as DragMatchRoundSchema,
  aa as GameData,
  oa as GameDataSchema,
  ra as GameEditor,
  js as GameMetaSchema,
  Rs as MultipleChoiceRoundSchema,
  Ps as PointSchema,
  As as ZoneSchema,
  Ds as ZoneTapRoundSchema,
  ca as clearGameData,
  Ks as createZoneEditor,
  Gt as exportGameDataAsJSON,
  ea as generateZonesFromTemplate,
  ua as loadGameData,
  Xt as saveGameData,
  xs as schemaToFields,
  Js as showAudioManager,
  ta as showTemplatePicker
};
