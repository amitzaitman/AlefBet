const l = "https://nakdan-u1-0.loadbalancer.dicta.org.il/api";
let c = !1;
const u = 4e3, f = "alefbet.nikudCache.v1", d = 300, t = /* @__PURE__ */ new Map();
(function() {
  if (!(typeof localStorage > "u"))
    try {
      const n = localStorage.getItem(f);
      if (!n) return;
      const r = JSON.parse(n);
      if (Array.isArray(r))
        for (const [a, o] of r)
          typeof a == "string" && typeof o == "string" && t.set(a, o);
    } catch {
    }
})();
function w() {
  if (!(typeof localStorage > "u"))
    try {
      const e = [...t.entries()].filter(([n, r]) => r !== n).slice(-d);
      localStorage.setItem(f, JSON.stringify(e));
    } catch {
    }
}
function y(e) {
  if (!e) return !1;
  const n = e.split(/\s+/).filter((a) => /[א-ת]/.test(a));
  return n.length === 0 ? !0 : n.filter((a) => /[\u05B0-\u05BC\u05C1\u05C2\u05C7]/.test(a)).length / n.length >= 0.8;
}
function g() {
  var o;
  if (typeof window > "u") return l;
  const e = new URLSearchParams(window.location.search).get("nakdanProxy"), n = window.ALEFBET_NAKDAN_PROXY_URL;
  if (e && window.localStorage)
    try {
      window.localStorage.setItem("alefbet.nakdanProxyUrl", e);
    } catch {
    }
  const r = (o = window.localStorage) == null ? void 0 : o.getItem("alefbet.nakdanProxyUrl"), a = e || n || r;
  return a || (window.location.hostname.endsWith("github.io") ? null : l);
}
function h(e) {
  var r;
  let n = "";
  for (const a of e)
    if (a.sep)
      n += a.str ?? "";
    else {
      const o = (r = a.nakdan) == null ? void 0 : r.options;
      o != null && o.length ? n += (o[0].w ?? "").replace(/\|/g, "").replace(/\u05BD/g, "") : n += a.str ?? "";
    }
  return n;
}
async function p(e) {
  const n = g();
  if (!n)
    throw c || (c = !0, console.warn("[nakdan] Dicta API blocked by CORS on GitHub Pages. Configure a proxy URL via ?nakdanProxy=..., window.ALEFBET_NAKDAN_PROXY_URL, or localStorage key alefbet.nakdanProxyUrl.")), new Error("Nakdan unavailable without proxy on this host");
  const r = typeof AbortController < "u" ? new AbortController() : null, a = r ? setTimeout(() => r.abort(), u) : null;
  let o;
  try {
    o = await fetch(n, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: r == null ? void 0 : r.signal,
      body: JSON.stringify({
        addmorph: !0,
        keepmetagim: !1,
        keepqq: !1,
        nodageshdefmem: !1,
        patachma: !1,
        task: "nakdan",
        data: e,
        useTokenization: !0,
        genre: "modern"
      })
    });
  } finally {
    a && clearTimeout(a);
  }
  if (!o.ok) throw new Error(`Nakdan ${o.status}`);
  const i = await o.json(), s = i == null ? void 0 : i.data;
  if (!Array.isArray(s)) throw new Error("Nakdan: invalid response");
  return h(s);
}
async function k(e) {
  if (!(e != null && e.trim())) return e ?? "";
  if (t.has(e)) return t.get(e);
  if (y(e))
    return t.set(e, e), e;
  if (typeof navigator < "u" && navigator.onLine === !1)
    return e;
  try {
    const n = await p(e);
    return t.set(e, n), w(), n;
  } catch {
    return t.set(e, e), e;
  }
}
function S(e) {
  return t.get(e) ?? e ?? "";
}
async function m(e) {
  const n = [...new Set(e.filter((r) => r == null ? void 0 : r.trim()))];
  await Promise.all(n.map((r) => k(r)));
}
export {
  k as addNikud,
  S as getNikud,
  y as isVowelized,
  m as preloadNikud
};
