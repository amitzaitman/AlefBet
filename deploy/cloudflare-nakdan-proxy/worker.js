/**
 * AlefBet Nakdan Proxy (Cloudflare Worker)
 * Forwards browser requests to Dicta Nakdan API and adds CORS headers.
 */

const DICTA_URL = 'https://nakdan-u1-0.loadbalancer.dicta.org.il/api';

function corsHeaders(origin = '*') {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
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