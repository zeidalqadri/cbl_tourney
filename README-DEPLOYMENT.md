# 🚀 Cloudflare Pages Deployment Guide

## MSS Melaka 2025 Basketball Tournament System

This guide covers deploying the tournament system to Cloudflare Pages with optimized performance and security settings.

## Prerequisites

1. **Cloudflare Account**: Sign up at [cloudflare.com](https://cloudflare.com)
2. **Wrangler CLI**: Install with `npm install -g wrangler`
3. **Authentication**: Run `wrangler login` to authenticate

## 🎯 Quick Deployment

```bash
# First deployment
./deploy.sh init

# Subsequent deployments
./deploy.sh
```

## 📋 Manual Deployment Steps

### 1. Build for Cloudflare Pages

```bash
npm run pages:build
```

This creates an optimized static build in `.vercel/output/static/`

### 2. Deploy to Cloudflare

```bash
# First time - create project
wrangler pages project create cbl-basketball-tracker --production-branch main

# Deploy
wrangler pages deploy .vercel/output/static --project-name=cbl-basketball-tracker
```

### 3. Configure Environment Variables

Go to [Cloudflare Dashboard](https://dash.cloudflare.com) > Pages > Your Project > Settings > Environment Variables

Add these production variables:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://tnglzpywvtafomngxsgc.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `NEXT_PUBLIC_TOURNAMENT_ID` | `66666666-6666-6666-6666-666666666666` |

### 4. Custom Domain (Optional)

1. Go to Settings > Custom domains
2. Add your domain (e.g., `tourney.cbl2025.com`)
3. Update DNS records as instructed

## 🔒 Security Features

The deployment includes:

- **Security Headers**: X-Frame-Options, CSP, etc.
- **DDoS Protection**: Automatic via Cloudflare
- **WAF Rules**: Basic protection enabled
- **Rate Limiting**: API endpoint protection

## ⚡ Performance Optimization

### Caching Strategy

- **Static Assets**: 1 year cache (immutable)
- **API Routes**: No cache (real-time data)
- **HTML Pages**: 5 minute cache with stale-while-revalidate

### Edge Features

- **Global CDN**: 200+ locations worldwide
- **Brotli Compression**: Automatic
- **HTTP/3**: Enabled by default
- **Early Hints**: Faster page loads

## 📊 Monitoring

### Analytics

View deployment analytics at:
- Pages Dashboard > Analytics
- Real User Monitoring (RUM)
- Web Analytics (if enabled)

### Logs

Access logs via:
```bash
wrangler pages deployment tail --project-name=cbl-basketball-tracker
```

## 🔧 Troubleshooting

### Build Failures

```bash
# Check build logs
wrangler pages deployment list --project-name=cbl-basketball-tracker

# View specific deployment
wrangler pages deployment tail [deployment-id]
```

### Environment Variables Not Working

1. Ensure variables are set in production environment
2. Trigger a new deployment after adding variables
3. Check variable names match exactly (case-sensitive)

### Performance Issues

1. Check Cloudflare Analytics for slow endpoints
2. Enable Web Analytics for detailed metrics
3. Review caching headers in `functions/_middleware.ts`

## 🚦 Deployment Workflow

### Development
```bash
npm run dev
# Local development at http://localhost:3000
```

### Staging
```bash
wrangler pages deploy .vercel/output/static --branch=staging
# Preview at: https://[hash].cbl-basketball-tracker.pages.dev
```

### Production
```bash
./deploy.sh
# Live at: https://cbl-basketball-tracker.pages.dev
```

## 💰 Cost Optimization

**Free Tier Includes:**
- Unlimited requests
- Unlimited bandwidth
- 500 builds per month
- SSL certificates

**No Additional Costs for:**
- Real-time updates (via Supabase)
- Global CDN distribution
- DDoS protection
- Web Analytics

## 🎯 Best Practices

1. **Use Preview Deployments**: Test changes before production
2. **Monitor Build Times**: Optimize if > 20 minutes
3. **Review Analytics**: Check Core Web Vitals weekly
4. **Update Dependencies**: Keep Next.js and packages current
5. **Test Mobile**: Ensure mobile performance for on-site usage

## 📞 Support

- **Cloudflare Pages Docs**: [developers.cloudflare.com/pages](https://developers.cloudflare.com/pages)
- **Next.js on Cloudflare**: [developers.cloudflare.com/pages/framework-guides/nextjs](https://developers.cloudflare.com/pages/framework-guides/nextjs)
- **Community Discord**: [discord.gg/cloudflaredev](https://discord.gg/cloudflaredev)

---

Built for MSS Melaka 2025 - Empowering real-time basketball tournament management 🏀