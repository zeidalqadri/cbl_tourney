# Cloudflare Pages Deployment Guide

## Quick Deploy Steps

### 1. Prepare for Deployment

First, ensure all dependencies are installed:
```bash
npm install
```

### 2. Build the Project

```bash
npm run build
```

### 3. Create Cloudflare Pages Build

```bash
npx @cloudflare/next-on-pages@1
```

### 4. Deploy to Cloudflare Pages

#### First Time Setup:

```bash
npx wrangler pages project create tourney
```

#### Deploy:

```bash
npx wrangler pages deploy .vercel/output/static --project-name=tourney
```

### 5. Configure Environment Variables

After deployment, go to Cloudflare Dashboard:

1. Navigate to Pages > Your Project > Settings > Environment Variables
2. Add these variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 6. Custom Domain (Optional)

In Cloudflare Pages settings:
1. Go to Custom domains
2. Add your domain
3. Configure DNS settings as instructed

## Automated Deployment with GitHub

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-github-repo-url
git push -u origin main
```

### 2. Connect in Cloudflare

1. Go to Cloudflare Pages
2. Create new project
3. Connect to Git
4. Select your repository
5. Configure build settings:
   - Framework preset: Next.js
   - Build command: `npm run build && npx @cloudflare/next-on-pages@1`
   - Build output directory: `.vercel/output/static`

## Troubleshooting

### Common Issues:

1. **Build Failures**: 
   - Ensure Node.js version is 18+
   - Check for TypeScript errors: `npm run lint`

2. **Runtime Errors**:
   - Verify environment variables are set correctly
   - Check Supabase connection

3. **Static Export Issues**:
   - Some Next.js features may need adjustment for edge runtime
   - Check Cloudflare Pages compatibility

## Performance Optimization

1. Enable Cloudflare caching for static assets
2. Use Cloudflare Images for team emblems
3. Enable Auto Minify in Cloudflare settings

## Monitoring

- Use Cloudflare Analytics to monitor traffic
- Set up Real User Monitoring (RUM)
- Configure alerts for deployment failures