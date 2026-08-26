# Dynamic Sitemap Cloudflare Worker (SEO Engine)

This directory contains the Cloudflare Worker script responsible for generating a 100% dynamic, database-driven XML Sitemap for Etesal Hub.

## 🏗 Why this Architecture?
React SPAs (Single Page Applications) cannot generate dynamic `sitemap.xml` files because they run in the browser. By placing this Worker at the edge (Cloudflare), we intercept any request to `sitemap.xml` before it hits the static host, query the Supabase database, and instantly return an XML file.

## 🚀 Deployment Instructions

1. **Log in to Cloudflare Dashboard**.
2. Go to **Workers & Pages** -> **Overview** -> **Create Worker**.
3. Name it `etesal-sitemap-worker`.
4. Click **Deploy**, then click **Edit Code**.
5. Copy the entire contents of `sitemap.js` from this folder and paste it into the Cloudflare code editor.
6. Click **Save and Deploy**.

### ⚙️ Set Environment Variables
The worker needs access to your Supabase instance.
1. In your Cloudflare Worker settings, go to **Settings** -> **Variables**.
2. Add the following **Environment Variables**:
   * `SUPABASE_URL`: (e.g. `https://xyz.supabase.co`)
   * `SUPABASE_ANON_KEY`: (Your public anon key)

### 🔗 Route Traffic (Crucial Step)
You must tell Cloudflare to route requests for `/sitemap.xml` to this Worker.
1. Go to your domain (`etesal.aeherai.ir`) in Cloudflare.
2. Go to **Workers Routes**.
3. Click **Add route**.
4. Route: `etesal.aeherai.ir/sitemap.xml` (or `*etesal.aeherai.ir/sitemap.xml`).
5. Select the `etesal-sitemap-worker`.
6. Save.

---

## 🧪 Testing & Verification Roadmap (نقشه راه تست و پایش)

To ensure this SEO mechanism works perfectly in production, follow this verification matrix:

### Phase 1: Local Verification
Since this runs on Cloudflare, you can test it directly via the Worker's `*.workers.dev` URL.
- [ ] Add a test article via your Master Admin Dashboard.
- [ ] Open your browser and go to the Worker's preview URL (or your live site `https://etesal.aeherai.ir/sitemap.xml`).
- [ ] **Acceptance Criteria**: You must see a valid XML tree displaying `<urlset>` and your newly created article slug.

### Phase 2: Security Verification (NoIndex Check)
- [ ] Open `https://etesal.aeherai.ir/admin` (or `/dashboard`).
- [ ] Right-click -> **Inspect** -> **Elements** tab.
- [ ] Check inside the `<head>` tag.
- [ ] **Acceptance Criteria**: You must see `<meta name="robots" content="noindex, nofollow" />`.

### Phase 3: Google Search Console (GSC) Integration
- [ ] Go to [Google Search Console](https://search.google.com/search-console).
- [ ] Navigate to the **Sitemaps** section in the left sidebar.
- [ ] Enter `sitemap.xml` and click **Submit**.
- [ ] **Acceptance Criteria**: Google must show status **"Success"** and display the correct number of discovered URLs.

### Phase 4: Production Monitoring
- [ ] If you add a new article in the Admin panel, check the sitemap URL. The `<lastmod>` date should update automatically.
- [ ] Use Google Search Console's "URL Inspection Tool" on an article URL (`/article/slug`) and click "Test Live URL" to ensure Googlebot reads the meta titles correctly.
