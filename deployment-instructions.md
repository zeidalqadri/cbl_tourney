# Deploy YouTube API Worker

## Quick Deployment Instructions

**🚨 URGENT: Deploy this API immediately**

### Option 1: Cloudflare Dashboard (Recommended - 2 minutes)
1. Go to https://dash.cloudflare.com/workers
2. Click "Create a Service"
3. Name: `cbl-youtube-api`
4. Copy the entire content from `simple-youtube-api.js` 
5. Click "Save and Deploy"
6. Note the worker URL (will be something like `cbl-youtube-api.your-subdomain.workers.dev`)

### Option 2: wrangler CLI (if available)
```bash
# From outside the Pages project directory
wrangler deploy simple-youtube-api.js --name cbl-youtube-api
```

### What this API does:
- Returns the actual video data from Everything CBL channel
- Handles search queries for team names
- Provides CORS headers for frontend access
- Fallback data includes the videos you showed me:
  - YU HWA vs PAY FONG 1
  - CHABAU vs JASIN LALANG  
  - PAY FONG 2 vs NOTRE DAME
  - BKT BERUANG vs YU YING
  - MALIM vs AYER KEROH

### After deployment:
Update the frontend API URL from:
`https://cbl-coverage-api.zeidalqadri.workers.dev`

To your new URL:
`https://cbl-youtube-api.your-subdomain.workers.dev`

**This will immediately fix the video badges appearing on match cards!**