#!/bin/bash

# Deploy YouTube API Worker to replace existing cbl-coverage-api.zeidalqadri.workers.dev
# This script deploys the new simple YouTube API to replace the existing worker

set -e

echo "🚀 Deploying YouTube API Worker to replace cbl-coverage-api.zeidalqadri.workers.dev"
echo "=================================================="

# Change to the cloudflare-integration directory
cd "$(dirname "$0")"

# Verify required files exist
if [ ! -f "simple-youtube-api.js" ]; then
    echo "❌ Error: simple-youtube-api.js not found!"
    exit 1
fi

if [ ! -f "wrangler.toml" ]; then
    echo "❌ Error: wrangler.toml not found!"
    exit 1
fi

echo "✅ Worker files found"

# Note: Using npx wrangler to avoid global installation
echo "✅ Using npx wrangler (no global install needed)"

# Check if user is logged in
echo "🔐 Checking Cloudflare authentication..."
if ! npx wrangler whoami &> /dev/null; then
    echo "❌ Error: Not logged in to Cloudflare!"
    echo "Please run: npx wrangler login"
    exit 1
fi

echo "✅ Cloudflare authentication verified"

# Show current worker info
echo "📋 Current worker configuration:"
echo "   Name: cbl-coverage-api"
echo "   File: simple-youtube-api.js"
echo "   Domain: cbl-coverage-api.zeidalqadri.workers.dev"

# Deploy the worker
echo "🚀 Deploying worker..."
npx wrangler deploy

echo ""
echo "✅ Deployment completed!"
echo ""
echo "🌐 Your worker is now available at:"
echo "   https://cbl-coverage-api.zeidalqadri.workers.dev"
echo ""
echo "📝 API Endpoints:"
echo "   GET /api/youtube/search?q={query} - Search videos"
echo "   GET /api/youtube/live - Get live streams (returns empty array)"
echo ""
echo "🔧 Testing the deployment:"
echo "   curl https://cbl-coverage-api.zeidalqadri.workers.dev/api/youtube/live"
echo "   curl \"https://cbl-coverage-api.zeidalqadri.workers.dev/api/youtube/search?q=melaka\""
echo ""
echo "✅ Frontend is already configured to use this domain!"