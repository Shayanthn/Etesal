# 🗄️ Database Audit & Diagnostic Full Report (Raw Export)
**Date:** 2026-08-27  
**Database Engine:** PostgreSQL 17.6 on x86_64-pc-linux-gnu (Supabase Cloud Infrastructure)  
**Schema Scope:** public, auth, storage, realtime, cron, vault, extensions  

---

```json
{
    "01_DATABASE": {
        "current_role": "postgres",
        "current_user": "postgres",
        "database_name": "postgres",
        "server_version": "PostgreSQL 17.6 on x86_64-pc-linux-gnu, compiled by gcc (GCC) 15.2.0, 64-bit"
    },
    "02_SCHEMAS": [
        { "owner": "supabase_admin", "schema_name": "auth" },
        { "owner": "supabase_admin", "schema_name": "cron" },
        { "owner": "postgres", "schema_name": "extensions" },
        { "owner": "supabase_admin", "schema_name": "graphql" },
        { "owner": "supabase_admin", "schema_name": "graphql_public" },
        { "owner": "pg_database_owner", "schema_name": "public" },
        { "owner": "supabase_admin", "schema_name": "realtime" },
        { "owner": "supabase_admin", "schema_name": "storage" },
        { "owner": "supabase_admin", "schema_name": "vault" }
    ],
    "08_RLS_STATUS_SUMMARY": {
        "public.articles": { "rls_enabled": true, "rls_forced": false },
        "public.configs": { "rls_enabled": true, "rls_forced": false },
        "public.news": { "rls_enabled": true, "rls_forced": false },
        "public.profiles": { "rls_enabled": true, "rls_forced": false },
        "public.proxies": { "rls_enabled": true, "rls_forced": false },
        "public.support_tickets": { "rls_enabled": true, "rls_forced": false },
        "public.telegram_media_queue": { "rls_enabled": true, "rls_forced": false },
        "public.user_subscriptions": { "rls_enabled": true, "rls_forced": false },
        "public.wallet_transactions": { "rls_enabled": true, "rls_forced": false }
    }
}
```

*(Full JSON stored in `database/audit_raw_dump.json`)*
