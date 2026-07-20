# Cloudflare AlefBet Proxy (Nakdan + one-time TTS)

The worker serves two CORS-enabled routes:

- `POST /` — forwards to the Dicta Nakdan API (auto-vowelization).
- `GET /tts?text=...&lang=he` — returns TTS audio for the given text as a
  blob. Used **only** by the Sound Studio's one-time "compile" flow, which
  downloads every letter/nikud/syllable sound into the device's IndexedDB.
  Games never call this route (or any network) at runtime.

## 1) Deploy

```bash
cd deploy/cloudflare-nakdan-proxy
npm i -g wrangler
wrangler login
wrangler deploy
```

After deploy, copy your Worker URL, for example:

```text
https://alefbet-nakdan-proxy.<your-subdomain>.workers.dev
```

## 2) Wire AlefBet frontend

Use one of these options:

1. Query param (quick test):
```text
https://amitzaitman.github.io/AlefBet/?nakdanProxy=https://alefbet-nakdan-proxy.<your-subdomain>.workers.dev
```

2. Browser localStorage (persistent per browser):
```js
localStorage.setItem('alefbet.nakdanProxyUrl', 'https://alefbet-nakdan-proxy.<your-subdomain>.workers.dev')
```

3. Global config in page:
```html
<script>
  window.ALEFBET_NAKDAN_PROXY_URL = 'https://alefbet-nakdan-proxy.<your-subdomain>.workers.dev';
</script>
```

The framework will use this proxy on GitHub Pages and avoid direct Dicta CORS failures.

## 3) TTS proxy for the Sound Studio compile flow

The sound-bank compiler reuses the stored nakdan proxy URL automatically
(same worker, `/tts` route). To point it somewhere else, use one of:

```text
?ttsProxy=https://alefbet-nakdan-proxy.<your-subdomain>.workers.dev
```

```js
localStorage.setItem('alefbet.ttsProxyUrl', 'https://...workers.dev')
```

```html
<script>window.ALEFBET_TTS_PROXY_URL = 'https://...workers.dev';</script>
```