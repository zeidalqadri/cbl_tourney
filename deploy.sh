#!/bin/bash

# Cloudflare Pages Deployment Script
# Usage: ./deploy.sh [staging|production]

set -e

echo "🏀 MSS Melaka Basketball Tournament - Cloudflare Deployment"
echo "=========================================================="

# Default to staging
ENVIRONMENT=${1:-staging}
BRANCH="main"
COMMIT_MSG="Deployment: $(date +'%Y-%m-%d %H:%M:%S')"

# Check if custom commit message provided
if [ -n "$2" ]; then
    COMMIT_MSG="$2"
fi

echo "📦 Building for Cloudflare Pages..."
npm run pages:build

echo "🚀 Deploying to $ENVIRONMENT..."

if [ "$ENVIRONMENT" = "production" ]; then
    echo "⚡ Deploying to production branch..."
    npx wrangler pages deploy .vercel/output/static \
        --project-name=mss-melaka-basketball \
        --branch=main \
        --commit-message="$COMMIT_MSG"
    
    echo "✅ Production deployment complete!"
    echo "🌐 Live at: https://mss-melaka-basketball.pages.dev"
else
    echo "🧪 Deploying to preview environment..."
    npx wrangler pages deploy .vercel/output/static \
        --project-name=mss-melaka-basketball \
        --branch=preview-$(date +%s) \
        --commit-message="Preview: $COMMIT_MSG"
    
    echo "✅ Preview deployment complete!"
fi

echo ""
echo "📊 Deployment Summary:"
echo "- Environment: $ENVIRONMENT"
echo "- Commit: $COMMIT_MSG"
echo "- Timestamp: $(date)"
echo ""