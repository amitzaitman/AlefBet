# Cloudflare Nakdan Proxy

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