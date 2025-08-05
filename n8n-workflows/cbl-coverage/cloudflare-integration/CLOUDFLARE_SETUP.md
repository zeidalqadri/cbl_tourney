# 🚀 Cloudflare Pages + Workers Setup for CBL Coverage

Since your site is on Cloudflare Pages, here's the perfect solution:

## Architecture

```
Airtable Form → Webhook → Cloudflare Worker → KV Storage → Your Pages Site
     ↑                                                           ↓
Telegram Team                                          Live Updates
```

## Step 1: Deploy the Worker (5 minutes)

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select your account → Workers & Pages
3. Create application → Create Worker
4. Name it: `cbl-coverage-api`
5. Copy the code from `coverage-worker.js`

## Step 2: Create KV Namespace

1. In Workers dashboard → KV
2. Create namespace: `COVERAGE_KV`
3. In your Worker settings → Variables → KV Namespace Bindings
4. Add binding: `COVERAGE_KV` → Select your namespace

## Step 3: Connect Airtable

1. In your Airtable automations
2. Add webhook action
3. URL: `https://cbl-coverage-api.YOUR-SUBDOMAIN.workers.dev/api/coverage/webhook`
4. Method: POST
5. Include record data

## Step 4: Update Your Frontend

In your Pages site, update components to fetch from Worker:

```javascript
// In your match component
const response = await fetch('https://cbl-coverage-api.YOUR-SUBDOMAIN.workers.dev/api/coverage');
const coverage = await response.json();

// Display based on venue
if (coverage['yu-hwa'].status === 'video-ready') {
  // Show video player
}
```

## Step 5: Simple Admin Page

Create `/admin` route in your Pages site:

```jsx
// app/admin/page.tsx
import { CoverageAdmin } from '@/components/CoverageAdmin';

export default function AdminPage() {
  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Coverage Admin</h1>
      <CoverageAdmin />
    </div>
  );
}
```

## 🎯 Complete Flow

1. **Photographer** fills Airtable form via Telegram link
2. **Airtable** webhook sends to your Worker
3. **Worker** stores in KV (instant)
4. **Your site** fetches from Worker API
5. **Updates appear** within seconds!

## 📱 Telegram Message Template

Share this in your Telegram group:

```
📢 CBL Coverage Team

Report updates here:
🔗 https://airtable.com/YOUR_FORM_LINK

Quick guide:
1️⃣ Click link
2️⃣ Select venue
3️⃣ Choose video/photos
4️⃣ Submit

Updates appear on site in 30 seconds! ⚡
```

## 🔧 Environment Variables

In your Worker, add these:

```
ALLOWED_ORIGIN = https://cbl-tourney.pages.dev
AIRTABLE_WEBHOOK_SECRET = your_secret_key
```

## ✅ Benefits

- **No WordPress needed** - Direct to Cloudflare
- **Instant updates** - KV is super fast
- **Global CDN** - Served from edge
- **Simple to manage** - All in Cloudflare
- **Free tier friendly** - KV + Workers free limits are generous

Want me to help you set up the Worker first?