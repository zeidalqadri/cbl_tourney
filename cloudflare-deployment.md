# 🏗️ Cloudflare Pages Deployment Guide

## Project: CBL Basketball Tracker
**Deployment Strategy**: Edge-first with Global CDN
**Estimated Cost**: $5-10/month (Workers Paid plan with typical usage)

## Core Services Stack

```
┌─────────────────────────────────────────┐
│ Cloudflare Edge Network (Global CDN)    │
├─────────────────────────────────────────┤
│ Cloudflare Pages (Static Site Hosting)  │
│ ├── Next.js Static Export               │
│ ├── Automatic CI/CD                     │
│ └── Preview Deployments                 │
├─────────────────────────────────────────┤
│ External Services                       │
│ ├── Supabase (Database & Auth)          │
│ └── YouTube API (Video Integration)     │
└─────────────────────────────────────────┘
```

## 🚀 Deployment Steps

### 1. Prerequisites
- Cloudflare account with Pages enabled
- Wrangler CLI installed (`npm install -g wrangler`)
- Environment variables ready

### 2. Local Build Test
```bash
# Test the build locally
npm run build

# Verify the 'out' directory is created
ls -la out/
```

### 3. Manual Deployment (Quick Start)
```bash
# Login to Cloudflare
npx wrangler login

# Deploy to Cloudflare Pages
npx wrangler pages deploy out --project-name=cbl-basketball-tracker
```

### 4. Automated Deployment Script
```bash
# Use the provided script
./deploy-cloudflare.sh
```

### 5. GitHub Integration (Recommended)

1. Go to [Cloudflare Pages Dashboard](https://dash.cloudflare.com/pages)
2. Click "Create a project" → "Connect to Git"
3. Select your GitHub repository
4. Configure build settings:
   - Framework preset: `Next.js (Static HTML Export)`
   - Build command: `npm run build`
   - Build output directory: `out`
   - Node version: `20`

### 6. Environment Variables Setup

In Cloudflare Pages Dashboard → Settings → Environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key
NEXT_PUBLIC_YOUTUBE_CHANNEL_ID=your_channel_id
NODE_VERSION=20
```

## 🔒 Security Configuration

### Custom Domain Setup
1. Add custom domain in Pages settings
2. Cloudflare automatically handles SSL/TLS
3. Enable "Always Use HTTPS"

### Security Headers (Page Rules)
```
Cache-Control: public, max-age=3600
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
Referrer-Policy: strict-origin-when-cross-origin
```

## 📊 Performance Optimization

### Caching Strategy
- Static assets: 1 year cache (immutable)
- HTML files: 1 hour cache
- API responses: 5 minute cache

### Build Optimizations
```javascript
// next.config.js optimizations
{
  output: 'export',
  images: {
    unoptimized: true, // Required for static export
  },
  compress: true,
  poweredByHeader: false,
}
```

## 💰 Cost Breakdown

**Free Tier Includes**:
- 500 builds per month
- Unlimited sites
- Unlimited requests
- Unlimited bandwidth

**Potential Costs**:
- Additional builds: $0.05 per build after 500
- Workers (if adding API): $5/month minimum
- No bandwidth or request charges

## 🧪 Testing & Monitoring

### Preview Deployments
Every pull request automatically creates a preview URL:
`https://<hash>.cbl-basketball-tracker.pages.dev`

### Production URL
`https://cbl-basketball-tracker.pages.dev`
or your custom domain

### Monitoring
- Real User Monitoring (RUM) in Cloudflare Analytics
- Core Web Vitals tracking
- Error tracking via Cloudflare Logs

## 🚨 Rollback Procedure

```bash
# List all deployments
npx wrangler pages deployments list --project-name=cbl-basketball-tracker

# Rollback to specific deployment
npx wrangler pages deployments rollback <deployment-id> --project-name=cbl-basketball-tracker
```

## 📝 Deployment Checklist

- [x] ESLint configuration fixed
- [x] Build script configured for static export
- [x] Wrangler configuration created
- [x] Environment variables documented
- [x] Deployment script created
- [ ] Test local build
- [ ] Deploy to Cloudflare Pages
- [ ] Configure custom domain (optional)
- [ ] Set up GitHub integration (recommended)

## Support & Troubleshooting

### Common Issues

1. **Build Timeout**: Increase Node.js memory
   ```bash
   NODE_OPTIONS="--max-old-space-size=4096" npm run build
   ```

2. **Environment Variables Not Loading**: 
   - Ensure variables are set in Cloudflare Pages dashboard
   - Rebuild after adding variables

3. **404 Errors on Routes**:
   - Verify `output: 'export'` in next.config.js
   - Check _redirects file for custom routing

### Resources
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)