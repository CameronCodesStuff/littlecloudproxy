<div align="center">
  <img src="favicon.png" width="120" alt="Little Cloud Proxy">

  # Little Cloud Proxy

  **A clean, lightweight web proxy built with vanilla JS and a Cloudflare Worker.**

  Browse the web through a friendly browser-like interface — no installs, no extensions, just a URL.

  ![HTML](https://img.shields.io/badge/HTML-E34F26?style=flat-square&logo=html5&logoColor=white)
  ![CSS](https://img.shields.io/badge/CSS-1572B6?style=flat-square&logo=css3&logoColor=white)
  ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
  ![Cloudflare Workers](https://img.shields.io/badge/Cloudflare_Workers-F38020?style=flat-square&logo=cloudflare&logoColor=white)

</div>

---

## What it is

Little Cloud Proxy is a single-page browser interface that routes web traffic through a Cloudflare Worker. It strips the security headers that normally prevent sites from being embedded in an iframe, rewrites links so navigation stays inside the proxy, and presents everything in a clean browser-like UI.

---

## How it works

```
User types a URL
       │
       ▼
  proxy.js builds:
  https://your-worker.workers.dev/?url=https://target-site.com
       │
       ▼
  Cloudflare Worker fetches the real page
       │
       ├── Strips X-Frame-Options
       ├── Strips Content-Security-Policy
       ├── Strips COOP / COEP / CORP headers
       ├── Sets Access-Control-Allow-Origin: *
       └── Rewrites href/src/action URLs in HTML
              so sub-resources (images, scripts, CSS)
              also load through the proxy
       │
       ▼
  Rewritten HTML returned to iframe
       │
       ▼
  Page renders inside Little Cloud Proxy
```

---

## File structure

```
littlecloudproxy/
├── index.html      # Markup — toolbar, splash screen, iframe
├── style.css       # All styles — sky theme, clouds, animations
├── proxy.js        # Client-side JS — navigation, history, URL bar
├── favicon.png     # Cloud logo (also used in splash + navbar)
└── README.md       # This file
```

> `worker.js` is **not** in this repo. It lives in your Cloudflare dashboard and is deployed separately.

---

## The Cloudflare Worker

The worker is the engine. It runs at the edge and does the heavy lifting:

### What it does

| Task | Detail |
|---|---|
| Fetch the target page | Passes through the original request method and body |
| Strip framing headers | Removes `X-Frame-Options`, `Content-Security-Policy`, `COOP`, `COEP`, `CORP` |
| Add CORS headers | Sets `Access-Control-Allow-Origin: *` so the browser allows the response |
| Rewrite HTML | Scans `href`, `src`, `action`, `srcset` attributes and rewrites them through the proxy |
| Skip script tags | Rewriting stops at `<script>` blocks so JS code is never mangled |
| Handle preflight | Responds to `OPTIONS` requests for CORS preflight |

### URL format

The worker accepts target URLs as a query parameter to avoid browser path normalisation mangling the double-slash in `https://`:

```
https://your-worker.workers.dev/?url=https://example.com
```

### Deploying the worker

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. **Workers & Pages** → **Create application** → **Create Worker**
3. Paste the worker code and click **Deploy**
4. Copy your worker URL and update the `PROXY` constant in `proxy.js`

---

## The frontend

### `index.html`

Pure markup — no inline styles or scripts. Contains:
- The top navigation bar (logo, back/forward/refresh, URL input, status pill, open-in-new-tab)
- The splash screen with drifting cloud animations and quick-link buttons
- The blocked notice shown when a site refuses to be embedded
- The sandboxed `<iframe>` where proxied pages load

### `style.css`

Sky-blue theme with:
- Frosted glass navigation bar (`backdrop-filter: blur`)
- 10 independently drifting CSS cloud shapes at varying sizes, speeds and opacities
- Animated progress bar on page load
- Floating hero image on the splash screen
- Responsive status pill that changes colour for loading / ready / blocked states

### `proxy.js`

Handles all client-side behaviour:
- Builds the proxied URL (`PROXY + ?url=` + encoded target)
- Manages a browser-style history stack for back/forward navigation
- Updates the URL bar to show the real (un-proxied) address
- Listens for `postMessage` events from worker-injected scripts for navigation callbacks
- Home button resets the iframe and returns to the splash screen

---

## Limitations

Some sites will not work fully or at all:

| Issue | Cause |
|---|---|
| Blank/broken page | Site blocked by `X-Frame-Options` before the worker can strip it (rare with updated worker) |
| Missing images / styles | Sub-resource URLs that are constructed dynamically in JavaScript — the HTML rewriter can't catch these |
| Login / accounts broken | `sessionStorage`, `localStorage`, `cookies`, and `serviceWorker` are all blocked by the iframe sandbox |
| SPAs partially broken | Frameworks like Next.js that rely on `History.replaceState` fail in a sandboxed iframe without `allow-same-origin` |

The sandbox intentionally omits `allow-same-origin` — adding it alongside `allow-scripts` would allow the embedded page to access and modify the parent document, which is a security hole.

---

## Hosted on GitHub Pages

```
https://cameroncodesstuff.github.io/littlecloudproxy/
```

Because GitHub Pages serves static files, only `index.html`, `style.css`, `proxy.js`, and `favicon.png` are needed in the repo. The Cloudflare Worker runs separately and is not committed.
