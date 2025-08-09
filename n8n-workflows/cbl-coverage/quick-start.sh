#!/bin/bash

# CBL Coverage Workflow Quick Start Script

echo "🏏 CBL Coverage Workflow - Quick Start"
echo "======================================"

# Check if n8n is running
if pgrep -x "n8n" > /dev/null; then
    echo "✅ n8n is already running"
    N8N_PORT=$(lsof -ti:5678 2>/dev/null || echo "5678")
else
    echo "📌 Starting n8n..."
    # Start n8n in background
    nohup n8n start > n8n.log 2>&1 &
    sleep 3
    echo "✅ n8n started"
fi

echo ""
echo "📋 Quick Setup Checklist:"
echo ""
echo "1. Access n8n at: http://localhost:5678"
echo ""
echo "2. Required API Credentials:"
echo "   □ YouTube Data API v3 key"
echo "   □ Google account for Drive API (OAuth)"
echo "   □ Airtable API key + Base ID"
echo "   □ WordPress API credentials"
echo "   □ Slack OAuth token"
echo ""
echo "3. Quick Links to Get Credentials:"
echo "   • YouTube API: https://console.cloud.google.com/apis/library/youtube.googleapis.com"
echo "   • Airtable API: https://airtable.com/account"
echo "   • Slack App: https://api.slack.com/apps"
echo ""
echo "4. Next Steps:"
echo "   a) Copy .env.example to .env and fill in your credentials"
echo "   b) Import the workflow JSON in n8n"
echo "   c) Set up credentials in n8n UI"
echo "   d) Test with a sample Slack message"
echo ""
echo "📁 Workflow location: $(pwd)/workflows/cbl-live-coverage-main.json"
echo ""
echo "Need help? Check: $(pwd)/docs/setup-guide.md"