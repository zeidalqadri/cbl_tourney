# 🚀 Cloudflare Pages Deployment Guide

## MSS Melaka 2025 Basketball Tournament System

### 🌐 Live URLs

- **Production**: https://e7e781d9.mss-melaka-basketball.pages.dev
- **Project Dashboard**: https://dash.cloudflare.com/pages/project/mss-melaka-basketball

### 📊 Deployment Architecture

```
┌─────────────────────────────────────────┐
│ Cloudflare Global Edge Network         │
│ ├── 300+ PoPs worldwide                │
│ ├── Automatic SSL/TLS                  │
│ └── DDoS Protection                    │
├─────────────────────────────────────────┤
│ Cloudflare Pages                       │
│ ├── Static Site Hosting                │
│ ├── Preview Deployments                │
│ └── Branch Deployments                 │
├─────────────────────────────────────────┤
│ External Backend                       │
│ └── Supabase (PostgreSQL + Realtime)   │
└─────────────────────────────────────────┘
```

### 🛠️ Deployment Commands

#### Quick Deploy
```bash
# Production deployment
./deploy.sh production "Your commit message"

# Preview deployment
./deploy.sh staging "Testing new features"
```

#### Manual Deploy
```bash
# Build for Cloudflare Pages
npm run pages:build

# Deploy to production
npx wrangler pages deploy .vercel/output/static \
  --project-name=mss-melaka-basketball \
  --branch=main \
  --commit-message="Your deployment message"

# Deploy preview branch
npx wrangler pages deploy .vercel/output/static \
  --project-name=mss-melaka-basketball \
  --branch=preview-feature-name \
  --commit-message="Preview: Feature description"
```

### 🔧 Configuration Files

#### `pages.config.json`
```json
{
  "name": "mss-melaka-basketball",
  "compatibility_date": "2024-01-01",
  "production_branch": "main",
  "build_config": {
    "build_command": "npm run build",
    "build_output_directory": "out"
  }
}
```

#### Environment Variables
The app uses public environment variables from `.env.production`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 📈 Performance Optimizations

1. **Edge Caching**: All static assets cached at Cloudflare edge
2. **Compression**: Automatic Brotli/Gzip compression
3. **HTTP/3**: Latest protocol support for faster connections
4. **Smart Routing**: Anycast routing to nearest edge location

### 🔒 Security Features

- **SSL/TLS**: Automatic HTTPS with managed certificates
- **DDoS Protection**: Enterprise-grade protection included
- **Web Application Firewall**: Basic rules enabled
- **Bot Protection**: Challenge suspicious traffic

### 🚀 CI/CD Integration

#### GitHub Actions (Optional)
```yaml
name: Deploy to Cloudflare Pages
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run pages:build
        
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy .vercel/output/static --project-name=mss-melaka-basketball
```

### 📊 Monitoring & Analytics

Access analytics at: https://dash.cloudflare.com

Key metrics to monitor:
- Page views and unique visitors
- Performance metrics (Core Web Vitals)
- Error rates and 4xx/5xx responses
- Geographic distribution of users

### 🆘 Troubleshooting

#### Build Failures
```bash
# Clean build cache
rm -rf .next .vercel

# Rebuild
npm run pages:build
```

#### Deployment Issues
```bash
# Check Cloudflare authentication
npx wrangler whoami

# List recent deployments
npx wrangler pages deployment list --project-name=mss-melaka-basketball
```

#### Rollback Deployment
```bash
# List deployments to find previous version
npx wrangler pages deployment list --project-name=mss-melaka-basketball

# Rollback to specific deployment
npx wrangler pages deployment rollback <deployment-id> --project-name=mss-melaka-basketball
```

### 💰 Cost Analysis

**Cloudflare Pages Free Tier Includes**:
- ✅ Unlimited requests
- ✅ Unlimited bandwidth
- ✅ 500 builds per month
- ✅ Unlimited sites
- ✅ Unlimited preview deployments

**Current Usage**: Well within free tier limits

### 🎯 Best Practices

1. **Branch Strategy**:
   - `main`: Production deployments
   - `preview-*`: Feature previews
   - `staging`: Pre-production testing

2. **Deployment Checklist**:
   - [ ] Run tests locally
   - [ ] Build successfully
   - [ ] Test on preview deployment
   - [ ] Deploy to production
   - [ ] Verify live site

3. **Performance Tips**:
   - Keep bundle size under 1MB
   - Use Next.js Image optimization
   - Leverage Cloudflare caching headers
   - Monitor Core Web Vitals

### 📱 Custom Domain Setup (Future)

When ready to add custom domain:

1. Add domain in Cloudflare Pages dashboard
2. Update DNS records:
   ```
   Type: CNAME
   Name: @
   Target: mss-melaka-basketball.pages.dev
   ```
3. SSL certificate auto-provisioned

### 🔄 Recent Deployments

- **Latest**: Updated UI - Removed division filters, added visual indicators
- **Preview**: https://e7e781d9.mss-melaka-basketball.pages.dev
- **Status**: ✅ Live and operational

---

**Support**: For deployment issues, check [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/) or run `npx wrangler pages --help`