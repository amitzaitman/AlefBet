/**
 * זיהוי קול לניקוד עברי
 * עוטף את Web Speech API עבור משחקי הגיית ניקוד
 * [נוסף על ידי: nikud-speak game]
 */

const SOUND_GROUPS = {
  kamatz: 'ah', patah: 'ah',
  tzere: 'eh', segol: 'eh',
  hiriq: 'ee',
  holam: 'oh',
  kubbutz: 'oo',
};

const PATTERNS = {
  ah: [/[אה]/, /^א$/, /אא/, /הא/],
  eh: [/[אה]/, /^א$/, /אא/, /הא/, /אה/],
  ee: [/[אי]/, /^י$/, /אי/, /הי/],
  oh: [/[או]/, /^[או]$/, /או/, /הו/],
  oo: [/[או]/, /^[או]$/, /או/, /הו/, /אוּ/],
};

export function createSpeechListener() {
  const SR = typeof window !== 'undefined'
    ? (window.SpeechRecognition || window.webkitSpeechRecognition)
    : null;
  const available = !!SR;
  let _rec = null;
  return {
    available,
    listen(timeoutMs = 4000) {
      if (!available) return Promise.resolve({ text: '', confidence: 0 });
      return new Promise((resolve) => {
        _rec = new SR();
        _rec.lang = 'he-IL';
        _rec.continuous = false;
        _rec.interimResults = false;
        _rec.maxAlternatives = 3;
        let done = false;
        const finish = (t, c) => { if (done) return; done = true; _rec = null; resolve({ text: t.trim(), confidence: c }); };
        _rec.onresult = (e) => { const r = e.results[0]; r ? finish(r[0].transcript, r[0].confidence) : finish("", 0); };
        _rec.onerror = () => finish("", 0);
        _rec.onnomatch = () => finish("", 0);
        const timer = setTimeout(() => { try { _rec?.stop(); } catch {} finish("", 0); }, timeoutMs);
        _rec.onend = () => { clearTimeout(timer); finish("", 0); };
        try { _rec.start(); } catch { finish("", 0); }
      });
    },
    cancel() { try { _rec?.abort(); } catch {} _rec = null; },
  };
}

export function matchNikudSound(text, nikudId) {
  if (!text || !nikudId) return false;
  const group = SOUND_GROUPS[nikudId];
  if (!group) return false;
  const pats = PATTERNS[group];
  if (!pats) return false;
  const clean = text.replace(/[\s.,!?]/g, "");
  if (!clean.length) return false;
  return pats.some(p => p.test(clean));
}