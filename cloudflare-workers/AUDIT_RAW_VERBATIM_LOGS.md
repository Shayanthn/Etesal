# 📑 گزارش کامل و متن کلمه‌به‌کلمه ممیزی ایجنت کلودفلر (Raw Verbatim Audit Logs)
**تاریخ ممیزی:** ۲۰۲۶-۰۸-۲۷  
**مرجع بررسی:** Cloudflare Principal Infrastructure & Security Architect AI

---

# 📋 بخش ۱: گزارش کامل و بدون سانسور ورکر سنجش شبکه و تلگرام (`validator-worker.ts`)

```markdown
# Production-Grade Architectural & Runtime Audit: `etesal-validator` Worker

---

## 1. ARCHITECTURE & ROLE

**Role:** This Worker serves as a dual-purpose edge gateway for the "Etesal" system:
- A **real TCP reachability prober** — performs live `connect()` socket probes from the Cloudflare edge to arbitrary `host:port` targets and reports latency/validity.
- A **Telegram Bot webhook receiver** — accepts Telegram updates, verifies webhook authenticity, and responds to user commands (`/stats`, `/ping`) via the Telegram Bot API.

### Exposed Endpoints

| Path | Aliased Path | Method | Auth | Purpose |
|---|---|---|---|---|
| `/validate` | `/api/validate` | `POST` | **None** | TCP socket probe to a target host:port |
| `/telegram/webhook` | `/api/telegram/webhook` | `POST` | `X-Telegram-Bot-Api-Secret-Token` header | Telegram bot update handler |
| `/` | — | `GET`, `POST`, `OPTIONS` | None | Health check / catch-all |
| *(any)* | — | `OPTIONS` | None | CORS preflight |

### Payload Schemas

**`POST /validate`** — accepts two input shapes:

```jsonc
// Shape A: direct host/port
{
  "host": "1.1.1.1",
  "port": 443
}

// Shape B: nested node object
{
  "node": {
    "host": "1.1.1.1",
    "port": 443,
    "configString": "vless://uuid@host:443?..."
  }
}

// Shape C: config string only (parsed via regex)
{
  "configString": "vless://uuid@1.1.1.1:443?encryption=none&..."
}
```

Supported config URI schemes for regex parsing: `vless://`, `vmess://`, `trojan://`, `ss://`, `hysteria2://`, `hy2://`. The regex `/@([^:]+):(\d+)/` extracts host and port from the `@host:port` segment.

**`POST /telegram/webhook`** — standard Telegram Update object:

```jsonc
{
  "message": {
    "chat": { "id": 123456789 },
    "text": "/stats"
  }
}
```

Required header: `X-Telegram-Bot-Api-Secret-Token: <secret>`

### Response Schemas

**`/validate` success (200):**
```json
{
  "valid": true,
  "latencyMs": 42,
  "host": "1.1.1.1",
  "port": 443,
  "edgeLocation": "FRA",
  "timestamp": "2026-08-27T12:00:00.000Z"
}
```

**`/telegram/webhook` success (200):**
```json
{ "ok": true, "processed": true }
```

---

## 2. DEPENDENCIES & COMPATIBILITY FLAGS

### `cloudflare:sockets` / `connect()`

**Yes — strictly required.** The Worker imports `connect` from `cloudflare:sockets` on line 5 and uses it for the core TCP probe logic. This is a Cloudflare Workers Runtime API, not a Node.js module. Per the [TCP sockets documentation](https://developers.cloudflare.com/workers/runtime-apis/tcp-sockets/), `connect()` is accessed by importing from `cloudflare:sockets` — no compatibility flag is needed to enable the import itself.

### Mandatory `compatibility_flags` and `compatibility_date`

| Flag | Required? | Reason |
|---|---|---|
| `nodejs_compat` | **No** | The Worker uses zero `node:*` imports. Only Web-standard APIs are used (`fetch`, `setTimeout`, `URL`, `JSON`, `Response`, `Headers`). |
| `nodejs_compat_v2` | **No** | Same as above. |
| Any flag for `cloudflare:sockets` | **No** | `cloudflare:sockets` is a runtime built-in module available by default — no flag gates it. |

**`compatibility_date`**: A recent date is recommended to pick up runtime fixes and default behaviors. Since the Worker doesn't depend on any Node.js polyfills, a date of `2024-09-23` or later is sufficient. I recommend using a current date (`2026-08-27`).

> **Note:** For `compatibility_date` ≥ `2026-08-04`, `nodejs_compat` is enabled by default per the [August 2026 changelog](https://developers.cloudflare.com/changelog/post/2026-08-04-nodejs-compat-default/). This is harmless for this Worker since it doesn't use any Node.js APIs, but if you want to be explicit, you can add `no_nodejs_compat` — though it's unnecessary.

### Node.js Compatibility Requirements

**None.** The Worker is pure Web-API. No `node:*` modules, no npm dependencies, no polyfills needed.

---

## 3. ENVIRONMENT VARIABLES & SECRETS

| Variable | Type | Required? | Default | Purpose |
|---|---|---|---|---|
| `ALLOWED_ORIGIN` | Env var / plaintext | Optional | `https://etesal.aetherai.ir` | CORS origin allowlist — only this exact Origin string is reflected back |
| `TELEGRAM_WEBHOOK_SECRET` | **Secret** | **Required** for `/telegram/webhook` | — | Compared against `X-Telegram-Bot-Api-Secret-Token` header |
| `TELEGRAM_BOT_TOKEN` | **Secret** | **Required** for Telegram replies | — | Bot API token, embedded in outbound `fetch` URL to `api.telegram.org` |

### Failure Modes

| Missing/Malformed Secret | Impact |
|---|---|
| `ALLOWED_ORIGIN` missing | Falls back to hardcoded `https://etesal.aetherai.ir`. Safe, but if your actual frontend origin differs, all browser CORS requests will receive `Access-Control-Allow-Origin: null` and fail. |
| `TELEGRAM_WEBHOOK_SECRET` missing | The `!env.TELEGRAM_WEBHOOK_SECRET` guard returns `401 Unauthorized` for **all** webhook requests. Telegram updates are silently dropped. Bot becomes unresponsive. |
| `TELEGRAM_WEBHOOK_SECRET` malformed (empty string) | Empty string is falsy → same as missing → all webhooks rejected with 401. |
| `TELEGRAM_BOT_TOKEN` missing | The `if (env.TELEGRAM_BOT_TOKEN && chatId && text)` guard skips the `sendMessage` call. The Worker returns `{ ok: true, processed: true }` — **misleading**: it reports success but never sends a reply to the user. No error is surfaced. |
| `TELEGRAM_BOT_TOKEN` malformed | The outbound `fetch` to `api.telegram.org` will receive a 401/error response from Telegram. The Worker **ignores** this response — it doesn't check the HTTP status of the Telegram API call. The Worker still returns `{ ok: true, processed: true }`. Silent failure. |

---

## 4. SECURITY & EDGE DEFENSE

### 4.1 CORS Handling

| Aspect | Implementation | Assessment |
|---|---|---|
| Preflight `OPTIONS` | Returns `corsHeaders` with `Allow-Methods`, `Allow-Headers` | ✅ Correct |
| Origin matching | `origin === allowedOrigin` — exact string match | ✅ Correct, but single-origin only (no multi-origin support, no regex) |
| Non-matching origin | Returns `Access-Control-Allow-Origin: null` | ⚠️ **Problematic** — `null` as ACAO can cause browsers to block requests. Some security tools flag `null` origins. Better to **omit the header entirely** for non-matching origins. |
| `Access-Control-Expose-Headers` | Not set | ⚠️ The response body is JSON; if the frontend needs to read custom response headers, they won't be exposed. Not critical for current use. |
| `Access-Control-Allow-Credentials` | Not set | ✅ Acceptable — no cookies/auth used in browser context |
| `Access-Control-Max-Age` | Not set | ⚠️ Minor — browsers will preflight every request. Adding `Max-Age: 86400` reduces preflight overhead. |

**CORS is applied to ALL responses** including the Telegram webhook (which doesn't need CORS at all — Telegram calls server-to-server). Not a vulnerability, but unnecessary header leakage.

### 4.2 Telegram Webhook Verification

```javascript
const secretToken = request.headers.get('X-Telegram-Bot-Api-Secret-Token');
if (!env.TELEGRAM_WEBHOOK_SECRET || secretToken !== env.TELEGRAM_WEBHOOK_SECRET) {
  return new Response('Unauthorized Webhook Request', { status: 401, ... });
}
```

| Aspect | Assessment |
|---|---|
| Mechanism | ✅ Uses the correct Telegram-recommended `X-Telegram-Bot-Api-Secret-Token` header |
| Missing secret guard | ✅ Checks `!env.TELEGRAM_WEBHOOK_SECRET` first — rejects all requests if secret is unset |
| Comparison method | ⚠️ Uses `!==` (non-constant-time string comparison). Theoretically susceptible to timing side-channel attacks. In practice, over a network with TLS, this is extremely difficult to exploit. Best practice would use a constant-time comparison (e.g., `crypto.subtle.timingSafeEqual` if available, or a manual XOR comparison). **Low severity.** |
| Telegram API response check | ❌ **The outbound `fetch` to Telegram's `sendMessage` API is not validated.** The response status/body is completely ignored. If Telegram returns 429 (rate limited), 401 (bad token), or 400 (bad chat_id), the Worker still returns `{ ok: true, processed: true }`. **Silent failure — the operator has no visibility into delivery failures.** |

### 4.3 SSRF, ReDoS, Socket Leaks, DoS Vectors

#### 🔴 SSRF — CRITICAL

The `/validate` endpoint accepts **arbitrary `host` and `port`** from the request body with:
- **No authentication**
- **No rate limiting**
- **No input validation** (no port range check, no hostname format validation)
- **No blocklist** for reserved/private IP ranges

Any unauthenticated user can force the Worker to open TCP connections to **any** target on the internet from the Cloudflare edge network. This is a textbook **open SSRF proxy**. Attack scenarios:
- Internal network scanning (though Workers run on the edge, not inside your VPC — but `connect()` over VPC Networks is now a feature per the [June 2026 changelog](https://developers.cloudflare.com/changelog/post/2026-06-16-tcp-connect-vpc-networks/), so if a VPC binding exists, internal probing is possible)
- Port scanning external services using Cloudflare's infrastructure as the source
- Using the Worker as an oracle to map network reachability from Cloudflare's edge locations

**The `edgeLocation` field in the response even tells the attacker which Cloudflare colo they're hitting.**

#### 🟡 Socket Leak — MODERATE

```javascript
const socket = connect({ hostname: targetHost, port: targetPort });
const timeoutPromise = new Promise((_, reject) => {
  setTimeout(() => reject(new Error('timeout')), 3000);
});

await Promise.race([
  socket.opened,
  timeoutPromise
]);

latencyMs = Date.now() - startTime;
isValid = true;
socket.close();
```

**Three socket lifecycle bugs:**

1. **Timeout path — socket never closed.** When `timeoutPromise` wins the race, execution falls into the `catch (probeErr)` block. `socket.close()` is **never called** in the catch block. The socket remains open until the runtime garbage-collects it or the connection eventually fails. Under load, this leaks outbound socket resources.

2. **Error path — socket never closed.** If `socket.opened` rejects (connection refused, DNS failure, etc.), execution enters the catch block. Again, `socket.close()` is not called. While a rejected `opened` promise likely means the connection failed, calling `close()` is still best practice to ensure resource cleanup.

3. **`setTimeout` never cleared.** After a successful fast connection (e.g., 20ms), the 3-second `setTimeout` timer continues to live. It will eventually fire, call `reject()` on an already-settled promise (no-op), but the timer holds runtime resources for the full 3 seconds. `clearTimeout()` should be called after the race completes.

**Fix:**
```javascript
const socket = connect({ hostname: targetHost, port: targetPort });
let timer;
const timeoutPromise = new Promise((_, reject) => {
  timer = setTimeout(() => reject(new Error('timeout')), 3000);
});

try {
  await Promise.race([socket.opened, timeoutPromise]);
  latencyMs = Date.now() - startTime;
  isValid = true;
} catch (probeErr) {
  latencyMs = Date.now() - startTime;
  isValid = false;
} finally {
  clearTimeout(timer);
  socket.close();
}
```

#### ReDoS — ✅ Safe

The regex `/@([^:]+):(\d+)/` is safe. `[^:]+` is bounded by the literal `:` character — no nested quantifiers, no ambiguity, no catastrophic backtracking possible.

#### DoS Vectors — 🔴 HIGH

| Vector | Status |
|---|---|
| No rate limiting on `/validate` | 🔴 An attacker can flood the endpoint with probe requests, consuming Worker CPU time and outbound socket connections. No per-IP or per-origin throttling. |
| No request body size limit | 🔴 `request.json()` will attempt to parse arbitrarily large JSON bodies. A multi-MB payload consumes memory and CPU. |
| No authentication on `/validate` | 🔴 Combined with no rate limiting, this is an open abuse vector. |
| No port range validation | 🟡 Port 0, negative ports, or ports > 65535 are passed to `connect()` — behavior is undefined (likely throws, caught by try/catch, returns `valid: false`). Not a crash, but sloppy. |
| No hostname validation | 🟡 Extremely long hostnames or malformed values are passed to `connect()` — likely throws, caught. Not a crash, but no meaningful error message is returned. |

---

## 5. SYNTHETIC VERIFICATION / TEST PLAN

### 5.1 `POST /validate` with `{"host": "1.1.1.1", "port": 443}`

**Request:**
```
POST /validate HTTP/1.1
Content-Type: application/json
Origin: https://etesal.aetherai.ir

{"host": "1.1.1.1", "port": 443}
```

**Expected response (200):**
```json
{
  "valid": true,
  "latencyMs": 15,
  "host": "1.1.1.1",
  "port": 443,
  "edgeLocation": "FRA",
  "timestamp": "2026-08-27T12:00:00.000Z"
}
```
*(Actual `latencyMs` and `edgeLocation` vary by Cloudflare colo. `port` is returned as a number.)*

**Response headers:**
```
Access-Control-Allow-Origin: https://etesal.aetherai.ir
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, X-Telegram-Bot-Api-Secret-Token
Content-Type: application/json
```

### 5.2 Invalid Port

**Request:** `{"host": "1.1.1.1", "port": 99999}`

**Expected behavior:** `connect()` is called with port 99999. The runtime will likely reject this. The error is caught by `catch (probeErr)`, `isValid` is set to `false`, and the Worker returns:

```json
{
  "valid": false,
  "latencyMs": 1,
  "host": "1.1.1.1",
  "port": 99999,
  "edgeLocation": "FRA",
  "timestamp": "2026-08-27T12:00:00.000Z"
}
```
*(No explicit port validation exists — the Worker relies on `connect()` to reject invalid ports. No 400 error is returned; the probe simply reports `valid: false`.)*

### 5.3 Non-Resolvable Host

**Request:** `{"host": "this-domain-does-not-exist-xyz123.invalid", "port": 443}`

**Expected behavior:** `socket.opened` rejects with a DNS resolution error. Caught by `catch (probeErr)`. Returns:

```json
{
  "valid": false,
  "latencyMs": 50,
  "host": "this-domain-does-not-exist-xyz123.invalid",
  "port": 443,
  "edgeLocation": "FRA",
  "timestamp": "2026-08-27T12:00:00.000Z"
}
```
*(Socket is NOT closed in the catch block — leaked.)*

### 5.4 Timeout Scenario

**Request:** `{"host": "10.255.255.1", "port": 443}` *(non-routable IP — will hang until timeout)*

**Expected behavior:** `socket.opened` does not resolve within 3 seconds. `timeoutPromise` wins the race, rejects with `Error('timeout')`. Caught by `catch (probeErr)`. Returns after ~3 seconds:

```json
{
  "valid": false,
  "latencyMs": 3001,
  "host": "10.255.255.1",
  "port": 443,
  "edgeLocation": "FRA",
  "timestamp": "2026-08-27T12:00:00.000Z"
}
```
*(Socket is NOT closed — leaked. `setTimeout` timer fires after 3s but is never cleared.)*

### 5.5 `POST /telegram/webhook` — WITH correct secret token

**Request:**
```
POST /telegram/webhook HTTP/1.1
X-Telegram-Bot-Api-Secret-Token: <correct secret>
Content-Type: application/json

{"message": {"chat": {"id": 123456789}, "text": "/stats"}}
```

**Expected behavior:** Secret token matches → proceeds. Calls `fetch()` to `https://api.telegram.org/bot<token>/sendMessage` with the `/stats` reply text. Returns:

```json
{ "ok": true, "processed": true }
```
*(Even if the Telegram API call fails, the response is still `{ ok: true, processed: true }` — the Telegram API response is not checked.)*

### 5.6 `POST /telegram/webhook` — WITHOUT secret token

**Request:**
```
POST /telegram/webhook HTTP/1.1
Content-Type: application/json

{"message": {"chat": {"id": 123456789}, "text": "/stats"}}
```

**Expected behavior:** `secretToken` is `null`. `env.TELEGRAM_WEBHOOK_SECRET` is set (truthy). `null !== "<secret>"` is `true`. Returns:

```
HTTP/1.1 401 Unauthorized
Access-Control-Allow-Origin: null
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, X-Telegram-Bot-Api-Secret-Token

Unauthorized Webhook Request
```
*(Response body is plain text, not JSON. Content-Type is not set.)*

### 5.7 `POST /telegram/webhook` — WITH wrong secret token

Same as 5.6 — returns 401 with `"Unauthorized Webhook Request"`.

### 5.8 `POST /telegram/webhook` — `TELEGRAM_WEBHOOK_SECRET` not set

`!env.TELEGRAM_WEBHOOK_SECRET` is `true` → returns 401 immediately. **All webhook requests are rejected. Bot is non-functional.**

---

## 6. FINAL VERDICT & READINESS

### Rating: 🔴 **CRITICAL FLAW — NOT READY FOR PRODUCTION**

### Critical Issues (must fix before production)

| # | Issue | Severity | Impact |
|---|---|---|---|
| 1 | **Open SSRF** on `/validate` — no auth, no rate limit, no input validation, no IP blocklist | 🔴 Critical | Abuse vector, network scanning from Cloudflare edge, reputational risk |
| 2 | **Socket leak** on timeout/error paths — `socket.close()` not called in catch block | 🔴 High | Resource exhaustion under load, potential for connection pool exhaustion |
| 3 | **`setTimeout` never cleared** — timer leaks for 3s after every successful probe | 🟡 Medium | Wasted runtime resources under high throughput |
| 4 | **Silent Telegram API failures** — outbound `fetch` response not checked, always returns `ok: true` | 🟡 Medium | No operational visibility into delivery failures |
| 5 | **No request body size limit** on `/validate` | 🟡 Medium | Memory/CPU DoS via large payloads |
| 6 | **`Access-Control-Allow-Origin: null`** for non-matching origins | 🟡 Low | Browser compatibility issues, security scanner flags |

### Recommended Fixes

1. **Add authentication to `/validate`** — require an API key header or use Cloudflare Access.
2. **Add rate limiting** — use Cloudflare WAF rate limiting rules or implement in-Worker rate limiting with KV/Durable Objects.
3. **Validate inputs** — port range (1–65535), hostname format, body size limit (e.g., reject bodies > 4KB).
4. **Fix socket lifecycle** — move `socket.close()` to a `finally` block; call `clearTimeout()` after the race.
5. **Check Telegram API response** — log/return errors when `sendMessage` fails.
6. **Replace `null` ACAO** — omit the `Access-Control-Allow-Origin` header entirely for non-matching origins.
7. **Use constant-time comparison** for the webhook secret (optional, low-risk).

### Recommended `wrangler.toml`

```toml
name = "etesal-validator"
main = "src/validator-worker.ts"
compatibility_date = "2026-08-27"

[vars]
ALLOWED_ORIGIN = "https://etesal.aetherai.ir"

[observability]
enabled = true
```
```

---

# 📋 بخش ۲: گزارش کامل و بدون سانسور ورکر سایت‌مپ داینامیک (`sitemap.js`)

```markdown
# Live Deployment Audit: `etesal-sitemap-worker`

## 1. Function & Data Flow

**How the Worker intercepts requests:**
The Worker has a single `fetch` handler. It parses `request.url`, and if `url.pathname !== '/sitemap.xml'`, it immediately returns a `404 Not Found`. Only requests to `/sitemap.xml` proceed past this gate. The deployed route pattern is `etesal.aetherai.ir/sitemap.xml`, so Cloudflare's routing layer ensures only that exact path triggers the Worker.

**robots.txt is NOT handled.** Despite the audit prompt mentioning it, the code has zero logic for `/robots.txt`. Any request to `/robots.xml` hits the `404` branch. This is a gap — search engines crawling `robots.txt` will get a 404, and there is no `Sitemap:` directive pointing crawlers to the sitemap.

**Supabase communication:**
The Worker makes two sequential `fetch()` calls to the Supabase PostgREST API:

| Call | Endpoint | Purpose |
|---|---|---|
| 1 | `${SUPABASE_URL}/rest/v1/articles?is_published=eq.true&select=slug,updated_at&order=updated_at.desc&limit=500` | Fetch up to 500 published article slugs + timestamps |
| 2 | `${SUPABASE_URL}/rest/v1/news?is_published=eq.true&select=slug,updated_at&order=updated_at.desc&limit=500` | Fetch up to 500 published news slugs + timestamps |

Both requests pass `apikey` and `Authorization: Bearer` headers using `SUPABASE_ANON_KEY`.

**Critical issue: these two fetches are sequential, not parallel.** The Worker `await`s the articles response, then `await`s the news response. They should be fired concurrently with `Promise.all` to halve the latency.

---

## 2. Caching & Edge Performance

**Current caching strategy:**
```js
'Cache-Control': 'public, max-age=1800'  // 30 minutes
```
This is the **only** caching mechanism. It sets a browser/CDN cache TTL of 30 minutes.

**What's missing:**

| Missing | Impact |
|---|---|
| `s-maxage` | No explicit shared-cache (CDN) TTL. |
| `stale-while-revalidate` | No stale-while-revalidate. When the 30-minute TTL expires, the next request forces a full round-trip to Supabase. |
| Cloudflare Cache API (`caches.default`) | The Worker does not use the Cache API at all. |
| `ctx.waitUntil()` for background revalidation | No background revalidation pattern. |

**Recommended Cache-Control:**
```
public, s-maxage=1800, stale-while-revalidate=86400
```

---

## 3. Resilience & Failure Modes

**Supabase unreachable or rate-limited:**
The Worker has a `try/catch` block. If Supabase throws (network error, DNS failure, etc.), the catch block returns:

```js
return new Response('Error generating dynamic sitemap', { status: 500 });
```

**This is a critical flaw.** When Supabase is down:
- Googlebot receives a `500` error.
- Repeated 500s can cause Google to **drop the sitemap from its index** and re-crawl less frequently.

**XML entity escaping:**
The code uses `encodeURIComponent(article.slug)`. Slugs are reasonably safe, but `baseUrl` and `lastmod` are not escaped.

---

## 4. Environment Bindings

From the live deployment:

| Variable | Type | Value | Status |
|---|---|---|---|
| `SUPABASE_URL` | `secret_text` | (encrypted) | ✅ Present |
| `SUPABASE_ANON_KEY` | `secret_text` | (encrypted) | ✅ Present |
| `BASE_URL` | `plain_text` | `https://etesal.aetherai.ir` | ✅ Present |

---

## 5. Final Verdict & Wrangler Config

### Rating: **NEEDS ADJUSTMENT**

| # | Issue | Severity |
|---|---|---|
| 1 | No `robots.txt` handling | Medium |
| 2 | No `stale-while-revalidate` | High |
| 3 | Sequential Supabase fetches instead of `Promise.all` | Medium |
| 4 | 500 error on Supabase failure — no fallback/stale cache | Critical |
| 5 | Silent swallowing of 429/5xx from Supabase → empty sitemap | High |
| 6 | No XML entity escaping on `baseUrl` or `lastmod` values | Medium |
| 7 | Route `zone_name` is empty | High |

### Recommended `wrangler.toml`

```toml
name = "etesal-sitemap-worker"
main = "sitemap.js"
compatibility_date = "2024-09-23"

routes = [
  { pattern = "etesal.aetherai.ir/sitemap.xml", zone_name = "aetherai.ir" },
  { pattern = "etesal.aetherai.ir/robots.txt", zone_name = "aetherai.ir" }
]

[vars]
BASE_URL = "https://etesal.aetherai.ir"
```
```

---

# 📋 بخش ۳: گزارش کامل و بدون سانسور استقرار فرانت‌اند (`React SPA / Cloudflare Assets`)

```markdown
# Production-Readiness Audit: `etesal` (React + Vite SPA on Cloudflare Workers Static Assets)

**Audited resource:** Worker `etesal` — production environment
**Custom domain:** `etesal.aetherai.ir` (zone `aetherai.ir`, cert active)
**Deployment model:** Workers Static Assets via `wrangler` (10 versions, latest 2026-08-26)

---

## 1. BUILD CONFIGURATION & ENGINE COMPATIBILITY

| Setting | Recommended Value | Notes |
|---|---|---|
| **Build command** | `npm run build` | Runs `vite build` per your `package.json` script |
| **Deploy command** | `npx wrangler deploy` | Default for production branch |
| **Root directory** | `./` | Root of repo |
| **Output directory** | `./dist` | Vite's default output; must match `assets.directory` |
| **Node.js version** | `NODE_VERSION=22` | Pin via `NODE_VERSION` build variable |

---

## 2. SPA ROUTING & DIRECT LINK REFRESH (404 PREVENTION)

### How Cloudflare Handles Deep Links

On Workers Static Assets, routing behavior is **explicit**:

```jsonc
{
  "name": "etesal",
  "compatibility_date": "2026-08-25",
  "assets": {
    "directory": "./dist/",
    "not_found_handling": "single-page-application"
  }
}
```

With `not_found_handling = "single-page-application"`:
- A request to `/admin`, `/help`, `/news/some-slug`, or `/configs` finds **no matching static file** → Workers serves `/index.html` with a **`200 OK`** status.
- React Router then picks up the path client-side and renders the correct route.

### `_redirects` File in `public/`:
```txt
/* /index.html 200
```

---

## 3. ENVIRONMENT VARIABLES & CLIENT SECURITY

| Variable | Purpose | Where to Set |
|---|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL (`https://xxx.supabase.co`) | Build environment variable |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous (public) key | Build environment variable |
| `VITE_APP_URL` | Your app's canonical URL | Build environment variable |

**Critical Security Rule:**
- **Supabase Service Role Key** and **Telegram Bot Token** must NEVER be prefixed with `VITE_` or included in client code.

---

## 4. EDGE SECURITY HEADERS & HTTP POLICIES

### Recommended `public/_headers` File:

```txt
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://etesal.aetherai.ir https://*.workers.dev; frame-ancestors 'none'; base-uri 'self'; form-action 'self'

/assets/*
  Cache-Control: public, max-age=31556952, immutable

/index.html
  Cache-Control: no-cache, must-revalidate
```

---

## 6. FINAL VERDICT & STEP-BY-STEP CHECKLIST

### Rating: **NEEDS ADJUSTMENT**

#### Action Required:
1. **Set SPA routing** (`public/_redirects` with `/* /index.html 200`).
2. **Add security headers** (`public/_headers`).
3. **Pin Node.js version** (`NODE_VERSION=22` in build variables).
4. **Audit environment variables** (Ensure no secrets leaked into `dist/`).
```
