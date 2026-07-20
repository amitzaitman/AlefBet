/**
 * AlefBet Proxy (Cloudflare Worker)
 *
 * Two routes, both CORS-enabled:
 *   POST /      — forwards to the Dicta Nakdan API (auto-vowelization).
 *   GET  /tts   — fetches Google Translate TTS audio for ?text=...&lang=he
 *                 and returns it as a downloadable blob. Used ONLY by the
 *                 one-time sound-bank compiler (sound-bank-compiler.js):
 *                 the audio is stored in IndexedDB on the device, so games
 *                 never contact this route (or any network) at runtime.
 */

const DICTA_URL = 'https://nakdan-u1-0.loadbalancer.dicta.org.il/api';
const GOOGLE_TTS_URL = 'https://translate.google.com/translate_tts';

function corsHeaders(origin = '*') {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
}

async function handleTts(request, origin) {
  const url = new URL(request.url);
  const text = (url.searchParams.get('text') || '').trim();
  const lang = url.searchParams.get('lang') || 'he';

  if (!text || text.length > 200) {
    return new Response(JSON.stringify({ error: 'text parameter required (max 200 chars)' }), {
      status: 400,
      headers: { ...corsHeaders(origin), 'Content-Type': 'application/json; charset=utf-8' },
    });
  }

  const upstream = await fetch(
    `${GOOGLE_TTS_URL}?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${encodeURIComponent(lang)}&client=tw-ob`,
    { headers: { 'User-Agent': 'Mozilla/5.0' } },
  );

  if (!upstream.ok) {
    return new Response(JSON.stringify({ error: `upstream TTS ${upstream.status}` }), {
      status: 502,
      headers: { ...corsHeaders(origin), 'Content-Type': 'application/json; charset=utf-8' },
    });
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      ...corsHeaders(origin),
      'Content-Type': upstream.headers.get('content-type') || 'audio/mpeg',
      // The audio for a given text never changes; let browsers/CDN cache hard.
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}

export default {
  async fetch(request) {
    const origin = request.headers.get('Origin') || '*';

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin),
      });
    }

    const url = new URL(request.url);
    if (request.method === 'GET' && url.pathname.endsWith('/tts')) {
      return handleTts(request, origin);
    }

    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', {
        status: 405,
        headers: {
          ...corsHeaders(origin),
          'Content-Type': 'text/plain; charset=utf-8',
        },
      });
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: {
          ...corsHeaders(origin),
          'Content-Type': 'application/json; charset=utf-8',
        },
      });
    }

    const upstream = await fetch(DICTA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const body = await upstream.text();
    return new Response(body, {
      status: upstream.status,
      headers: {
        ...corsHeaders(origin),
        'Content-Type': upstream.headers.get('content-type') || 'application/json; charset=utf-8',
      },
    });
  },
};