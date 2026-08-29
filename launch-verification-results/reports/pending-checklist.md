# Master Pre-Launch Checklist (Pending Items Only)

*Note: Items marked as DONE (e.g., Supabase Unique Constraints, n8n Pipelines 1 & 2 logic, News Ingestion logic) have been removed from this list based on strict verification.*

## Phase 0: Setup & Evidence Collection
- [ ] Verify the project repository is accessible and the user can run local commands (`npm install`, `npm run build`, etc.).
- [ ] Confirm environment separation (production vs staging) exists.

## Phase 1: Frontend Code Quality & Build
- [ ] Run `npm run build` locally and verify successful compilation.
- [ ] Check bundle size and no excessive chunks (use `vite-bundle-visualizer` or `du -sh dist/`).
- [ ] Ensure `dist/_redirects` and `dist/_headers` exist and are correct.
- [ ] Verify no `console.log`, `debugger`, or temporary code remains.
- [ ] Confirm all environment variables used in frontend have `VITE_` prefix; no secret keys exposed.
- [ ] Run `npm audit` and ensure no high/critical vulnerabilities.
- [ ] Check TypeScript compilation (`npx tsc --noEmit`) passes without errors.
- [ ] Run existing test suite (`npm run test`) and confirm 12/12 pass (provide output).
- [ ] Verify code splitting/lazy loading for heavy modules (admin, dashboard).
- [ ] Review error boundaries and 404 page.
- [ ] Accessibility: alt attributes, ARIA labels, keyboard navigation.
- [ ] Review `AdminRouteGuard` logic: session validation against Supabase, redirect if not authenticated.

## Phase 2: Frontend Security & PWA
- [ ] Inspect `_headers` file: include CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy.
- [ ] Verify CSP doesn't allow unsafe-inline scripts/styles unless necessary; no `unsafe-eval`.
- [ ] Check PWA manifest: `name`, `short_name`, icons (192, 512, maskable), `start_url`, `scope`, `display: standalone`, theme/background colors.
- [ ] Service worker: registered, update flow (`skipWaiting`, `clientsClaim`), cache strategy.
- [ ] Offline fallback page exists and is cached.
- [ ] Validate PWA installability using Chrome DevTools or Lighthouse.
- [ ] Ensure no sensitive data in localStorage (tokens should be in httpOnly cookies if possible).
- [ ] Check for XSS risks: any use of `dangerouslySetInnerHTML`? If yes, ensure sanitization.
- [ ] Verify all API requests use HTTPS and the Supabase client is configured with correct URL and anon key.
- [ ] Check `getEnvVar` implementation in `supabaseClient.ts` and `edgePingService.ts`.

## Phase 3: Android App (TWA/Capacitor)
- [ ] If TWA: confirm `assetlinks.json` is deployed at `https://etesal.aetherai.ir/.well-known/assetlinks.json` with correct package name and SHA256 fingerprint.
- [ ] Check app signing: release keystore used, not debug.
- [ ] Confirm AAB file built and versionCode/versionName incremented.
- [ ] targetSdk >= 34, minSdk reasonable (e.g., 23 or 26).
- [ ] Permissions minimal and justified.
- [ ] Splash screen, icon, and app name follow Google Play guidelines.
- [ ] Test on physical device: installation, navigation, offline behavior (user must provide evidence).

## Phase 4: Supabase Database & Auth
- [ ] **RLS enabled on all tables.** Run SQL to check: `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname='public';`
- [ ] Verify policies: `SELECT` for `anon` role on `configs`, `proxies`, `news`; `INSERT/UPDATE` only for `service_role` (or authenticated admins). No overly permissive `USING (true)` without justification.
- [ ] Auth settings: email confirmation enabled, password recovery working, rate limiting via Supabase or Cloudflare.
- [ ] Storage buckets (if any): not public unless required; access policies defined; file type/size limits.
- [ ] Backups and Point-in-Time Recovery enabled in Supabase dashboard (user provides screenshot).
- [ ] **Critical:** Confirm `SUPABASE_SERVICE_ROLE_KEY` is **not** present in any frontend code or Cloudflare Worker variables; only in n8n.
- [ ] Test anonymous read access: use `curl` or Supabase client with anon key to fetch configs; should succeed without auth.
- [ ] Test unauthorized write: attempt insert with anon key; should fail due to RLS.

## Phase 5: Cloudflare Workers & Edge
- [ ] Verify Worker `etesal-validator` deployed and route `/api/validate` maps correctly.
- [ ] Confirm environment variables in Worker dashboard: `ALLOWED_ORIGIN`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`.
- [ ] Check anti-SSRF code in `validator-worker.ts`: rejects private IPs, loopback, Cloudflare ranges. Run the SSRF attack test (`curl` with `127.0.0.1`) and expect 400.
- [ ] Run happy path ping test (`curl POST /api/validate` with public IP) and expect 200 with `valid: true` and `latencyMs`.
- [ ] Verify socket closed in `finally` block (code review).
- [ ] Verify Worker `etesal-sitemap-worker` deployed, route `/sitemap.xml` and `/robots.txt`.
- [ ] Confirm environment variables: `BASE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`.
- [ ] Test sitemap and robots endpoints: `curl -I` expecting 200, correct `Content-Type`, and caching headers.
- [ ] Ensure Workers do not contain `SUPABASE_SERVICE_ROLE_KEY`.
- [ ] Check Cloudflare Pages setup: domain connected, SSL/TLS mode **Full (strict)**, "Always Use HTTPS" enabled, HSTS.
- [ ] Cache rules: static assets long cache (immutable), `index.html` no-cache, SPA fallback (`_redirects`).
- [ ] Rate limiting / WAF rules for sensitive paths (`/api/validate`, `/admin`) if possible.
- [ ] Security headers present via `_headers` or Cloudflare Transform Rules.

## Phase 6: n8n Automation Workflows (Remaining Tests)
- [ ] Verify environment variables set in n8n: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHANNEL_ID`, `TELEGRAM_ADMIN_ID`, `OPENROUTER_API_KEY`.
- [ ] Each workflow has Error Workflow set to Pipeline 6.
- [ ] Test Pipeline 3 (viral bot): send a test photo from admin to bot; verify it fetches at least 3 active proxies, appends links to caption, and posts to channel. Provide screenshot.
- [ ] Ensure `SUPABASE_SERVICE_ROLE_KEY` is stored as n8n secret and not exposed in workflow code or frontend.
- [ ] **SEO FIX PENDING:** Prompt in News Ingestion pipeline must be updated to output English slugs for Persian titles, categorize news, and remove scraping artifacts (e.g., "The post...").

## Phase 7: End-to-End Integration & Live Tests
- [ ] Deploy frontend to Cloudflare Pages and ensure live URL works.
- [ ] Open `https://etesal.aetherai.ir` and verify page loads without console errors.
- [ ] Verify configs/proxies list displayed from Supabase (not just local fallback).
- [ ] Click "test connection" on a config: should call `/api/validate` and show latency.
- [ ] Refresh `/admin` route directly (Ctrl+F5) and confirm no 404 (SPA fallback).
- [ ] Open `/sitemap.xml` and `/robots.txt` in browser, check content and headers.
- [ ] Run Lighthouse audit on the live site: Performance, Accessibility, Best Practices, SEO scores >= 90.
- [ ] Test offline behavior: disable network in DevTools, reload page; should show cached version and fallback data.
- [ ] Test PWA install prompt on Android Chrome.
- [ ] Test admin login and dashboard functionality if admin features are live.
- [ ] Test any user-facing forms (feedback, tickets, auth) end-to-end.

## Phase 8: SEO, Monitoring, Backup, Legal
- [ ] Verify dynamic meta tags and titles are set for routes.
- [ ] Open Graph and Twitter cards present for main pages.
- [ ] `robots.txt` and `sitemap.xml` submitted to Google Search Console (user provides evidence).
- [ ] Error tracking (Sentry or similar) integrated, or plan in place.
- [ ] Analytics (GA4, Plausible) configured with privacy compliance.
- [ ] Uptime monitoring (UptimeRobot) active on domain.
- [ ] Supabase backups and PITR verified (screenshot).
- [ ] Rollback plan documented and tested.
- [ ] Privacy Policy and Terms of Service published and accessible from site footer.
- [ ] GDPR compliance if serving EU users.
- [ ] Data Processing Agreement with Supabase if needed.

## Phase 9: Final Report & Go/No-Go
- [ ] Compile all category reports into final `final-report.md`.
- [ ] List all items with statuses; any `FAIL` or `AWAITING EVIDENCE` on critical items means **NO-GO**.
- [ ] Provide a clear recommendation: **GO** or **NO-GO** with justification.
