#!/bin/bash

# Cloudflare Pages Deployment Script
# Ensures clean build and deployment to Cloudflare Pages

echo "🚀 Starting Cloudflare Pages deployment..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .next out node_modules/.cache

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run linting
echo "🔍 Running ESLint..."
npm run lint

# Build the application
echo "🏗️ Building Next.js application..."
npm run build

# Check if build was successful
if [ ! -d "out" ]; then
    echo "❌ Build failed: 'out' directory not found"
    echo "Make sure next.config.js has output: 'export' configured"
    exit 1
fi

# Deploy to Cloudflare Pages
echo "☁️ Deploying to Cloudflare Pages..."
npx wrangler pages deploy out \
    --project-name=cbl-basketball-tracker \
    --branch=main \
    --commit-dirty=true

echo "✅ Deployment complete!"
echo "📝 Remember to set environment variables in Cloudflare Pages dashboard:"
echo "   - NEXT_PUBLIC_SUPABASE_URL"
echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "   - NEXT_PUBLIC_YOUTUBE_API_KEY"
echo "   - NEXT_PUBLIC_YOUTUBE_CHANNEL_ID"