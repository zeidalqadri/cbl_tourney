# 🚨 Fix Node.js Compatibility Error

## Immediate Actions Required:

### 1. **Add Compatibility Flag in Cloudflare Dashboard**

1. Go to: https://dash.cloudflare.com
2. Navigate to: **Pages → cbl-basketball-tracker → Settings → Functions**
3. Find **"Compatibility flags"** section
4. Click **"Add compatibility flag"**
5. Type: `nodejs_compat`
6. Click **"Save"**

### 2. **Add Environment Variables** (if not already done)

In the same Settings page, under **Environment variables**:
- `NEXT_PUBLIC_SUPABASE_URL`: `https://tnglzpywvtafomngxsgc.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your key
- `NEXT_PUBLIC_TOURNAMENT_ID`: `66666666-6666-6666-6666-666666666666`

### 3. **Redeploy**

```bash
npx wrangler pages deploy .vercel/output/static --project-name=cbl-basketball-tracker
```

## Why This Error Occurred:

Next.js uses Node.js built-in modules like `node:buffer` and `node:async_hooks`. Cloudflare Workers/Pages don't include these by default - you must explicitly enable the `nodejs_compat` flag.

## Alternative: Use Vercel CLI

If the above doesn't work, you can also try:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy with proper config
vercel deploy --prod
```

Then in Vercel dashboard, add the same environment variables.

## Prevention:

For future deployments, always ensure:
1. `nodejs_compat` flag is enabled
2. Environment variables are set
3. Build output is compatible with edge runtime

Your app will work perfectly once the `nodejs_compat` flag is enabled!