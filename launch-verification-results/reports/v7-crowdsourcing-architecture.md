# Etesal Hub - V7.0 Enterprise Architecture
## Crowdsourced Testing & Smart Broadcaster (Distributed Probes)

### The Challenge
Servers located outside of Iran (like Cloudflare or n8n instances) cannot reliably simulate or test the Great Firewall of Iran (GFW). A TCP Ping from Europe only proves the destination server is alive, not that it is accessible from Iranian ISPs.

### The Solution: Crowdsourcing (Distributed Probes)
Turn the web and app users into a distributed network of free testers. 

#### Phase 1: Database Upgrade (Supabase)
Add the following columns to `configs` and `proxies` tables:
- `iran_success_count` (int, default 0): Number of successful connections reported from inside Iran.
- `iran_fail_count` (int, default 0): Number of failure reports.
- `is_broadcasted` (bool, default false): Indicates if this config has been published to the Telegram channel.
- `trust_score` (float): A calculated score based on likes, dislikes, and freshness.

#### Phase 2: Frontend & Edge Telemetry
- **Micro-Interactions:** Users see quick feedback buttons (👍 / 👎) next to configs when copied.
- **Geo-Fencing (Cloudflare):** The feedback request goes through Cloudflare. The Worker checks the `CF-IPCountry` header. Only feedback from `IR` (Iran) is counted to prevent bot manipulation and spam.
- **Anti-Spam:** Rate limiting and session-based deduplication ensure 1 user = 1 vote.

#### Phase 3: Decouple Ingestion (n8n)
- Remove Telegram broadcast nodes from Pipelines 1 and 2.
- Ingestion pipelines now act blindly: scrape, decode, and store in Supabase with `is_broadcasted = false`.

#### Phase 4: Smart Broadcaster Pipeline (n8n)
Create a new pipeline `3-smart-telegram-broadcaster`:
1. **Cron:** Runs every 30-60 minutes.
2. **Smart Query:** Fetches top 3 configs where `is_broadcasted = false`, created in the last 2 hours, `iran_success_count > 5`, and likes > dislikes.
3. **Broadcast:** Sends these strictly verified configs to the Telegram channel.
4. **Acknowledge:** Updates the DB to set `is_broadcasted = true`.

### Result
The Telegram channel will only broadcast configs that have been strictly verified by real human traffic inside Iran, guaranteeing 100% bypass capability at the moment of publishing.
