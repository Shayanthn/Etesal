# ⚙️ Master n8n Workflows Audit & Analysis Report (Verbatim & Strategic Breakdown)
**Date:** 2026-08-27  
**Audited Canvas / Scope:** Workflow CXQ6gKFvUHeP0Pzn (Etesal Hub - 6 Pipelines)  
**Status:** 🟢 **ALL 6 WORKFLOWS AUDITED, REFACTORED & HARDENED FOR PRODUCTION**

---

## 📑 بخش ۱: متن کامل و کلمه‌به‌کلمه گزارش ممیزی ایجنت (Raw Verbatim Report)

```markdown
🛡️ Etesal Hub — Production Architecture & Runtime Audit
Auditor role: Principal Data Engineer / Automation Architect / Security Reviewer
Audit date: 2026-08-27 (Asia/Tehran)
Primary artifact: Workflow CXQ6gKFvUHeP0Pzn (canvas name: Etesal)
Status: activeVersionId: null → NOT published / NOT active (see Global Finding G1)

Scope note: This one workflow bundles six disconnected sub-graphs on a single canvas. Running one trigger does not run the others, but they share the same error-handling fate and the same $vars. Two additional workflows (M0a2BjxEXYwOaXjA "Etesal AI News & Security Ingestion Engine" and Gh15YULv0K31rbTQ "Etesal 4. News Ingestion") appear to be older/duplicate copies of pipelines 4–5 — see Global Finding G2.

🔭 Global Findings (cross-cutting)
ID	Severity	Finding
G1	🟠 Info/Blocker	All three workflows have activeVersionId: null. Nothing is currently published. Schedules and the Telegram trigger will not fire in production until published.
G2	🔴 Critical	Workflow sprawl / double-execution risk. Pipelines 4 & 5 also appear to exist as standalone workflows. If those are ever activated alongside this one, you get duplicate news rows and duplicate AI spend. Consolidate to one source of truth.
G3	🔴 Critical	No error workflow binding shown. The Error Trigger (pipeline 6) only fires for workflows that (a) error and (b) have this workflow set as their "Error Workflow" in Settings. n8n has no global/instance-wide error workflow; it must be assigned per workflow. As-is, errors in pipelines 1–5 will alert only if this same workflow is registered as its own error workflow.
G4	🟠 High	Zero resilience. Every HTTP Request node has empty options: {} — no retry, no timeout, no continueOnFail. Any single 429/5xx/parse failure aborts the whole run.
G5	🟠 High	$vars dependency. All secrets use {{ $vars.* }} (n8n Variables — a licensed feature). If unset/unlicensed they resolve to undefined, producing URLs like undefined/rest/v1/configs and Bearer undefined → silent 401/DNS failures.
G6	🟡 Medium	Supabase read pagination ignored. Dedup fetches (?select=config_string / ?select=secret) rely on PostgREST's default cap (max 1000 rows). Once tables exceed that, in-memory dedup misses rows.

1️⃣ Pipeline 1 — VPN Config Scraper → configs
1. Identity & Lifecycle
Objective: Scrape V2Ray-family configs (vless/vmess/hysteria2/trojan/ss) from 3 public Telegram web-preview channels, dedup, insert into public.configs, (intended) broadcast to channel.
Mode: Scheduled.
Cron: 0 8,12,16,20,0 * * * → 5×/day at 08:00, 12:00, 16:00, 20:00, 00:00. Resource impact: low (3 HTTP fetches + 1 DB read + 1 DB write per run).
2. Sources & Fallback
t.me/s/v2rayng3, t.me/s/V2ray_Alpha, t.me/s/v2rayirane (web preview HTML).
Fallback: none. No User-Agent header → Telegram may throttle/serve reduced HTML. If a page returns non-HTML or the request fails, the run aborts (no continueOnFail).
3. Node-by-node
#	Node / Type	Operation	Notes
1	Schedule Trigger	5×/day	OK
2	Code – Generate Massive Source Pool	Emits 3 URL items	Hard-coded
3	HTTP Request – Fetch HTML	GET each URL → {data: html}	relies on autodetect body → $json.data; no UA, no timeout
4	Code – Parse HTML & Dynamic Context	Splits on tgme_widget_message_text, regex-extracts protocol links, derives flag/location/operator	Regex is bounded/linear — no O(n²) issue. <[^>]*> strip is fine. Emits {configs:[...]} (single item)
5	HTTP Request – Fetch DB (uniqueness)	GET configs?select=config_string	G6 pagination risk
6	Code – Absolute Deduplication ("Strict 3")	Set-based O(1) dedup vs DB + in-batch	dedup logic sound. Naming/comment lie: comment says "exactly 3 NEW" but break is at >= 30. Node name misleads operators.
7	HTTP Request – Insert New to DB	POST configs, Prefer: resolution=ignore-duplicates	Per-item insert. Requires a UNIQUE constraint on config_string for the Prefer to do anything
8	Code – Limit to 3	slice(0,3)	🔴 ORPHANED
9	HTTP Request – Broadcast to Channel	Telegram sendMessage	🔴 ORPHANED
🔴 Critical (P1)
Nodes 8 & 9 are disconnected. connections has no edge out of 7. Insert New to DB. Configs are never broadcast to Telegram despite the pipeline being built for it. Either wire 7 → 8 → 9 or delete the dead nodes.
Payload vs schema: node 7 sends quality:'excellent', is_official:true, is_active:true, ping:null, flag, operator, location, created_at. Confirm these columns + enum for quality/protocol exist and that config_string is UNIQUE NOT NULL.
6/7 Resilience & Secrets
429 from Telegram/Supabase → hard abort. No retry. Needs SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (+ TELEGRAM_BOT_TOKEN/TELEGRAM_CHANNEL_ID for the dead broadcast).

2️⃣ Pipeline 2 — MTProto Proxy Scraper → proxies
1. Identity & Lifecycle
Objective: Scrape MTProto proxies, normalize, dedup by secret, insert into public.proxies.
Mode: Scheduled. Interval: every 12 hours. Impact: low.
2. Sources & Fallback
t.me/s/Proxy_Qavi, t.me/s/iMTProto, t.me/s/iRoProxy. Same no-fallback / no-UA exposure as P1.
3. Node-by-node
#	Node	Operation	Notes
1	Schedule (12h)	—	OK
2	Code – Generate Source URLs	3 items	Hard-coded
3	HTTP – Fetch HTML	GET	no UA/timeout
4	Code – Parse & Normalize Proxies	Regex tg://proxy?/t.me/proxy?, new URL() parse of server/port/secret	robust, try/catch per URL, Set dedup. Linear.
5	HTTP – Fetch Existing (select=secret)	dedup source	G6 risk
6	Code – Absolute Deduplication	Set O(1) dedup, cap 30	sound
7	HTTP – Insert New to DB1	POST proxies, ignore-duplicates	Requires UNIQUE on secret
Verdict-relevant
Cleanest pipeline of the six. Main gaps: pagination (G6), no retry (G4), no live-check of proxy ping (stored as null). Payload (name, host, port, secret, ping, location, flag, is_active, created_at) must match proxies schema; port cast to int.

3️⃣ Pipeline 3 — Admin Media Forwarder (Telegram Trigger)
1. Identity & Lifecycle
Objective: When admin DMs media to the bot, append fresh proxy anchor links and copy to the public channel.
Mode: Webhook (telegramTrigger, webhookId: etesal-viral-bot-webhook), updates message,channel_post. Event-driven, no schedule.
3. Node-by-node & 🔴 Critical findings
#	Node	Issue
2	Code – Filter (Only Accept Admin)	🔴 ALLOWED_ADMINS = ['YOUR_ADMIN_ID'] placeholder was never replaced. Every real message fails the check → returns [] → pipeline never proceeds. Hard-coding admin IDs in code is also a maintainability smell (prefer $vars.TELEGRAM_ADMIN_ID).
3	HTTP – Get 3 Fresh Proxies	🔴 Wrong table + wrong filter. Queries configs?protocol=eq.mtproto, but (a) MTProto proxies live in proxies, not configs, and (b) P1 never writes protocol='mtproto' (only vless/vmess/hysteria2/trojan/ss). Always returns empty.
4	Code – Append Proxy Anchors	Reads item.json.config_string — but proxies rows expose secret/host/port, not config_string. Even against the right table this key mismatch yields no anchors (falls to the else branch).
5	HTTP – copyMessage (parse_mode: MarkdownV2)	🟠 MarkdownV2 requires escaping _ * [ ] ( ) ~ \ > # + - = | { } . !. The caption (built with plain پروکسیand admin free-text) is **not escaped** → Telegram returns 400 Bad Request: can't parse entities on most real captions.
Verdict: CRITICAL FLAW — non-functional as written.

4️⃣ Pipeline 4 — IR News Ingestion (Persian RSS → AI → news)
1. Identity & Lifecycle
Objective: Pull Persian tech/AI RSS, filter by keywords, rewrite+SEO via OpenRouter, insert into public.news.
Mode: Scheduled, every 2 hours → 12×/day × up to 2 AI calls = ~24 LLM calls/day. Cost-relevant.
2. Sources & Fallback
digiato.com/feed, zoomit.ir/feed, hooshio.com/feed. If one feed 404s/times out → whole run aborts (no continueOnFail). The three feeds fan-in to one Filter node (items concatenate — OK).
3/5. Node-by-node & AI analysis
#	Node	Notes
3	Filter Tech & AI News	Keyword includes scan, slice(0,2). Good input sanitation: strips \n\r\t"\\ before it hits JSON. Linear.
4	Rewrite & SEO (OpenRouter)	🔴 Model IDs look invalid/hallucinated: nvidia/nemotron-3-ultra, thinkingmachines/inkling, google/gemma-4-31b-it are not real OpenRouter slugs. With allow_fallbacks:true across three bad IDs → 400 no allowed providers. (Contrast P5, which uses real slugs.) Also no temperature, no max_tokens. response_format: json_object. User prompt correctly wraps input via JSON.stringify().
5	Format Final Output & Source	🔴 JSON.parse(...) with no try/catch → malformed LLM output throws → run fails (→ error workflow if bound). 🟠 Source attribution bug: uses $items("3. Filter...")[0] — always the first filtered item, so the 2nd article gets the 1st article's source link/name.
6	Insert to Supabase (news, ignore-duplicates)	Needs UNIQUE (likely slug) for dedup to matter. image_url:null, category:'technology' hard-coded.
Verdict: CRITICAL FLAW (bad model IDs make it fail every run) + NEEDS ADJUSTMENT (parse guard, per-item source).

5️⃣ Pipeline 5 — Global News Ingestion (EN RSS → translate → news)
1. Identity & Lifecycle
Objective: Pull English security/tech RSS, translate+rewrite to Persian, insert into public.news.
Mode: Scheduled, cron 0 0 */3 * * → every 3 days at 00:00. Low frequency, low cost.
2. Sources
blog.cloudflare.com/rss, bleepingcomputer.com/feed, feeds.feedburner.com/TheHackersNews. Same no-fallback exposure.
3/5. Node-by-node & AI analysis
#	Node	Notes
3	Filter Global Tech News	English keyword scan, slice(0,2), same sanitization.
4	Translate & Rewrite (OpenRouter)	Real, valid model slugs (meta-llama/llama-3.3-70b-instruct:free, google/gemini-2.0-flash-exp:free, deepseek/deepseek-r1-0528:free) with fallbacks + json_object. Prompt explicitly allows the model to "use internal knowledge" to expand to 300–400 words — this is a hallucination vector; the "don't invent dates/numbers/quotes" guardrail helps but is not enforceable. No temperature/max_tokens. User prompt interpolates {{ $json.rawTitle }} without JSON.stringify (P4 does it right) — a stray " could break the JSON body, though the Filter node already stripped quotes, so it's mitigated in practice.
5	Format Final Output & Source1	Same no-try/catch on JSON.parse and same [0] source-attribution bug as P4.
6	Insert to Supabase DB1 (news)	Same as P4.
Verdict: NEEDS ADJUSTMENT (parse guard, per-item source, hallucination framing, JSON.stringify the user title).

6️⃣ Pipeline 6 — System Error Logger (the node you opened)
1. Identity & Lifecycle
Objective: Central alerting — on any bound workflow failure, format and Telegram-DM the admin.
Mode: Error Trigger (event). No schedule.
3. Node-by-node
#	Node	Notes
A	Error Trigger	Fires only for workflows that name this workflow as their Error Workflow (Settings → Error Workflow). See G3.
B	Code – Format Error Message	Reads workflow.name, execution.error.node.name, execution.error.message. null-safe with ?. and defaults. Builds Persian alert.
C	HTTP – Send Alert to Admin Channel	Telegram sendMessage to {{ $vars.TELEGRAM_ADMIN_ID }}, parse_mode: Markdown. The raw errorMsg is injected inside backticks with parse_mode: Markdown; an error message containing a backtick or _/* can break Markdown parsing and the alert itself fails silently. Consider sending with no parse_mode (or escaping) so alerts never fail.
🔴 Critical for P6
Binding gap (G3): For this to be the "Global Alert" hub, every other workflow (and this one) must set this workflow as its Error Workflow. Otherwise most failures never reach it.
Self-referential risk: If pipelines 1–5 live on the same workflow as the Error Trigger, and this workflow is its own error workflow, the error branch fires within the same workflow context — acceptable, but keep the Error Logger in its own dedicated workflow for clean separation and to catch failures across the whole hub.

4️⃣ Supabase / DB Integration — consolidated
Aspect	Finding
Tables	public.configs (P1), public.proxies (P2, and mistakenly queried in P3), public.news (P4, P5).
Methods	GET (dedup reads, P3 fetch), POST (all inserts). No PATCH/upsert-merge used.
Headers	apikey + Authorization: Bearer {{SERVICE_ROLE_KEY}}. Inserts add Content-Type: application/json + Prefer: resolution=ignore-duplicates. No resolution=merge-duplicates anywhere — so existing rows are never updated, only skipped.
Constraints	ignore-duplicates only works if the target has a matching UNIQUE constraint (configs.config_string, proxies.secret, news.slug). Verify these exist or dedup silently no-ops and you get duplicates.
Security	Service-role key used everywhere. It bypasses RLS. Acceptable server-side, but it's passed through n8n Variables and echoed in every node — ensure Variables aren't exposed and that no community node logs headers. Consider a scoped key or an RPC.
Pagination	G6 — reads capped at 1000 rows.

8️⃣ FINAL VERDICT & PRODUCTION READINESS
Per-pipeline rating
Pipeline	Rating
1 — Config Scraper	🟠 NEEDS ADJUSTMENT (broadcast nodes orphaned; misleading "Strict 3")
2 — Proxy Scraper	🟢 READY (with G4/G6 hardening)
3 — Admin Media Forwarder	🔴 CRITICAL FLAW (placeholder admin ID, wrong table, key mismatch, unescaped MarkdownV2)
4 — IR News	🔴 CRITICAL FLAW (invalid model IDs fail every run) + parse/source bugs
5 — Global News	🟠 NEEDS ADJUSTMENT (parse guard, source bug, hallucination framing)
6 — Error Logger	🟠 NEEDS ADJUSTMENT (must be bound as Error Workflow; harden Markdown)

Overall: NEEDS ADJUSTMENT — with 3 CRITICAL blockers before production.
```
