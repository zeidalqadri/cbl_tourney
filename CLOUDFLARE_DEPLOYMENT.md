# 🏗️ Cloudflare Pages Deployment Guide

## Project: MSS Melaka 2025 Basketball Tournament System
**Deployment Strategy**: Branch-based Preview Deployments
**Production URL**: https://mss-melaka-2025.pages.dev

## 🚀 Preview Deployment Complete!

Your UI improvements are now live at:
- **Preview URL**: https://preview-ui-improvements.mss-melaka-2025.pages.dev
- **Deployment ID**: https://28366746.mss-melaka-2025.pages.dev

### Changes Deployed:
1. ✅ Bottom navigation visible on desktop
2. ✅ Matches stay in chronological order
3. ✅ Brighter color scheme (blue/cyan gradients)
4. ✅ Preview button removed from match cards

## 📋 Deployment Architecture

```
┌─────────────────────────────────────────┐
│ Cloudflare Edge Network (Global CDN)    │
├─────────────────────────────────────────┤
│ Cloudflare Pages (Static Hosting)       │
│ ├── Production Branch (main)            │
│ ├── Preview Branches (preview/*)        │
│ └── Feature Branches (feature/*)        │
├─────────────────────────────────────────┤
│ Next.js Static Export                   │
│ ├── Pre-rendered pages                  │
│ ├── Client-side routing                 │
│ └── Optimized assets                    │
├─────────────────────────────────────────┤
│ External Services                       │
│ ├── Supabase (Database)                 │
│ └── GitHub (Source Control)             │
└─────────────────────────────────────────┘
```

## 🔄 Deployment Workflow

### 1. Development → Preview
```bash
# Create feature branch
git checkout -b preview/feature-name

# Make changes and commit
git add -A
git commit -m "feat: description"

# Push to create preview
git push -u origin preview/feature-name

# Build and deploy
npm run pages:build
npx wrangler pages deploy .vercel/output/static \
  --project-name=mss-melaka-2025 \
  --branch=preview-feature-name
```

### 2. Preview → Production
```bash
# After testing preview, merge to main
git checkout main
git merge preview/feature-name

# Deploy to production
npm run pages:build
npx wrangler pages deploy .vercel/output/static \
  --project-name=mss-melaka-2025 \
  --branch=main
```

## 🔒 Environment Configuration

### Preview Environment
- **Branch Pattern**: `preview/*`, `feature/*`
- **URL Format**: `https://[branch-name].mss-melaka-2025.pages.dev`
- **Environment**: Development/Staging
- **Supabase**: Using production database (be careful!)

### Production Environment
- **Branch**: `main`
- **URL**: `https://mss-melaka-2025.pages.dev`
- **Custom Domain**: Can be added in Cloudflare dashboard
- **Caching**: Full CDN caching enabled

## 📊 Performance Optimizations

### Current Setup
- **Static Export**: Pre-rendered pages for instant loading
- **CDN Distribution**: Global edge network
- **Asset Optimization**: Next.js automatic optimization
- **Image Optimization**: Next/Image with lazy loading

### Metrics to Monitor
1. **Core Web Vitals**
   - LCP: < 2.5s (target)
   - FID: < 100ms (target)
   - CLS: < 0.1 (target)

2. **Cloudflare Analytics**
   - Page views
   - Unique visitors
   - Performance metrics
   - Error rates

## 🛠️ Deployment Commands

```bash
# Build for production
npm run pages:build

# Deploy to preview branch
npm run deploy:preview

# Deploy to production
npm run deploy:production

# Check deployment status
npx wrangler pages deployment list --project-name=mss-melaka-2025

# View deployment logs
npx wrangler pages deployment tail --project-name=mss-melaka-2025
```

## 🔍 Testing Checklist

### Preview Testing
- [ ] All UI improvements visible
- [ ] Mobile responsiveness working
- [ ] Database connections functional
- [ ] Real-time updates working
- [ ] No console errors

### Pre-Production Checklist
- [ ] Performance metrics acceptable
- [ ] All features tested on preview
- [ ] No breaking changes
- [ ] Database migrations complete
- [ ] Environment variables set

## 🚨 Rollback Procedure

If issues are found in production:

```bash
# View recent deployments
npx wrangler pages deployment list --project-name=mss-melaka-2025

# Rollback to previous deployment
npx wrangler pages rollback --project-name=mss-melaka-2025 \
  --deployment-id=[previous-deployment-id]
```

## 💰 Cost Considerations

**Current Plan**: Cloudflare Pages Free
- ✅ 500 builds/month
- ✅ Unlimited requests
- ✅ Unlimited bandwidth
- ✅ Preview deployments

**Scaling Considerations**:
- Move to Pages Pro ($20/month) for:
  - 5,000 builds/month
  - Advanced analytics
  - Faster builds

## 📝 Next Steps

1. **Test Preview Deployment**
   - Visit: https://preview-ui-improvements.mss-melaka-2025.pages.dev
   - Test all UI improvements
   - Check mobile/desktop views

2. **Promote to Production** (when ready)
   ```bash
   git checkout main
   git merge preview/ui-improvements
   git push
   npm run deploy:production
   ```

3. **Monitor Performance**
   - Check Cloudflare Analytics
   - Monitor real-time updates
   - Track user engagement

## 🔗 Useful Links

- **Preview Deployment**: https://preview-ui-improvements.mss-melaka-2025.pages.dev
- **Production Site**: https://mss-melaka-2025.pages.dev
- **Cloudflare Dashboard**: https://dash.cloudflare.com
- **GitHub Repository**: https://github.com/zeidalqadri/cbl_tourney