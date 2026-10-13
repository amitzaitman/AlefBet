import { tts as p } from "./runtime.js";
const w = "alefbet-audio-status-banner";
function v(t) {
  switch (t) {
    case "awaiting-interaction":
      return { message: "הַקֵּשׁ כְּדֵי לְהַפְעִיל קוֹל", kind: "await" };
    case "unsupported":
      return { message: "הַקּוֹל אֵינוֹ זָמִין כָּרֶגַע", kind: "unsupported" };
    case "failed":
      return { message: "בְּעָיָה בַּקּוֹל. נַמְשִׁיךְ לְלֹא קוֹל", kind: "failed" };
    default:
      return null;
  }
}
function k(t = typeof document < "u" ? document.body : null, u = {}) {
  const s = u.window || (typeof window < "u" ? window : null);
  if (!t || !s)
    return { destroy() {
    } };
  const n = t.querySelector("#" + w);
  n && n.parentNode && n.parentNode.removeChild(n);
  const e = t.ownerDocument.createElement("div");
  e.id = w, e.className = "alefbet-audio-banner", e.setAttribute("role", "status"), e.setAttribute("aria-live", "polite"), e.dir = "rtl", e.hidden = !0;
  const c = t.ownerDocument.createElement("span");
  c.className = "alefbet-audio-banner__msg", e.appendChild(c);
  const i = t.ownerDocument.createElement("button");
  i.type = "button", i.className = "alefbet-audio-banner__dismiss", i.setAttribute("aria-label", "סְגוֹר הוֹדָעָה"), i.textContent = "×", i.hidden = !0, e.appendChild(i), t.appendChild(e);
  let d = null;
  function l() {
    d && (clearTimeout(d), d = null);
  }
  function r() {
    l(), e.hidden = !0, e.classList.remove("is-visible", "is-await", "is-unsupported", "is-failed"), e.onclick = null, i.hidden = !0;
  }
  function b(m) {
    const o = v(m);
    if (!o) {
      r();
      return;
    }
    l(), c.textContent = o.message, e.hidden = !1, e.classList.add("is-visible"), e.classList.toggle("is-await", o.kind === "await"), e.classList.toggle("is-unsupported", o.kind === "unsupported"), e.classList.toggle("is-failed", o.kind === "failed"), o.kind === "await" ? (e.onclick = () => {
      try {
        t.ownerDocument.body.dispatchEvent(new MouseEvent("pointerdown", { bubbles: !0 }));
      } catch {
      }
      r();
    }, i.hidden = !0) : o.kind === "unsupported" ? (e.onclick = null, i.hidden = !1, i.onclick = (a) => {
      a.stopPropagation(), r();
    }) : o.kind === "failed" && (e.onclick = null, i.hidden = !0, d = setTimeout(() => r(), 6e3));
  }
  function f(m) {
    const a = /** @type {CustomEvent} */ (m.detail || {}).state;
    if (a === "ready" || a === "idle") {
      r();
      return;
    }
    b(a);
  }
  return s.addEventListener("alefbet:tts-state", f), {
    destroy() {
      s.removeEventListener("alefbet:tts-state", f), l(), e.parentNode && e.parentNode.removeChild(e);
    }
  };
}
function E(t, { banner: u = !0 } = {}) {
  const s = u ? k(t.container) : null, n = () => {
    t.container.removeEventListener("pointerdown", n, !0), t.container.removeEventListener("keydown", n, !0), p.unlock();
  };
  t.container.addEventListener("pointerdown", n, { once: !0, capture: !0 }), t.container.addEventListener("keydown", n, { once: !0, capture: !0 }), t.on("end", () => {
    t.container.removeEventListener("pointerdown", n, !0), t.container.removeEventListener("keydown", n, !0), s == null || s.destroy(), p.cancel();
  });
}
export {
  E as attachGameAudio
};
