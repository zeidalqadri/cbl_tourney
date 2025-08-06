# YouTube API Worker Deployment

This directory contains the configuration and scripts to deploy a simplified YouTube API worker that replaces the existing `cbl-coverage-api.zeidalqadri.workers.dev`.

## Overview

- **Worker Name**: `cbl-coverage-api`
- **Domain**: `cbl-coverage-api.zeidalqadri.workers.dev`
- **Purpose**: Provide hardcoded YouTube video data for the CBL tournament frontend
- **CORS**: Configured for `https://cbl-tourney.pages.dev`

## Files

- `simple-youtube-api.js` - Main worker code with API endpoints
- `wrangler.toml` - Cloudflare Worker configuration
- `deploy-youtube-api.sh` - Deployment script
- `test-api.sh` - API testing script
- `coverage-worker.js` - Previous worker code (backup)

## API Endpoints

### GET /api/youtube/search
- **Purpose**: Search videos by query
- **Parameters**: `q` (query string)
- **Response**: `{ videos: [...] }`
- **Example**: `/api/youtube/search?q=melaka`

### GET /api/youtube/live
- **Purpose**: Get live streams
- **Response**: `{ live: [] }` (hardcoded empty array)

## Deployment Instructions

### Prerequisites

1. **Node.js and npm installed**

2. **Login to Cloudflare**:
   ```bash
   npx wrangler login
   ```

### Deploy the Worker

1. **Navigate to the directory**:
   ```bash
   cd n8n-workflows/cbl-coverage/cloudflare-integration
   ```

2. **Run the deployment script**:
   ```bash
   ./deploy-youtube-api.sh
   ```

   Or manually:
   ```bash
   wrangler deploy
   ```

### Test the Deployment

Run the test script to verify everything works:
```bash
./test-api.sh
```

Or test manually:
```bash
# Test live endpoint
curl https://cbl-coverage-api.zeidalqadri.workers.dev/api/youtube/live

# Test search endpoint
curl "https://cbl-coverage-api.zeidalqadri.workers.dev/api/youtube/search?q=melaka"
```

## Configuration Details

### wrangler.toml
```toml
name = "cbl-coverage-api"
main = "simple-youtube-api.js"
compatibility_date = "2025-01-15"

[vars]
ALLOWED_ORIGIN = "https://cbl-tourney.pages.dev"
YOUTUBE_CHANNEL_ID = "UCSTjgKoXJT41KMsqKnOTxZQ"
```

### CORS Headers
The worker is configured with the following CORS headers:
- `Access-Control-Allow-Origin: https://cbl-tourney.pages.dev`
- `Access-Control-Allow-Methods: GET, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type`

## Hardcoded Video Data

The worker returns hardcoded video data for CBL tournament matches:
- MSSN Melaka U12 Grouping matches
- Includes video IDs, titles, thumbnails, embed URLs
- All videos currently use placeholder video ID: `dQw4w9WgXcQ`

## Frontend Integration

The frontend is already configured to use `cbl-coverage-api.zeidalqadri.workers.dev`, so no frontend changes are needed after deployment.

## Troubleshooting

### Common Issues

1. **Authentication Error**:
   ```bash
   wrangler login
   ```

2. **Worker Not Found**:
   - Verify the worker name in `wrangler.toml` matches existing worker
   - Check Cloudflare dashboard for existing workers

3. **CORS Issues**:
   - Verify the origin domain matches exactly
   - Check browser developer tools for CORS errors

4. **API Not Responding**:
   - Wait a few minutes after deployment
   - Check worker logs in Cloudflare dashboard

### Logs and Monitoring

View worker logs:
```bash
wrangler tail
```

Check worker status:
```bash
wrangler status
```

## Rollback

If you need to rollback to the previous worker:
1. Replace `simple-youtube-api.js` with `coverage-worker.js`
2. Update `wrangler.toml` to use `coverage-worker.js` as main
3. Deploy again

## Support

- Check Cloudflare Workers documentation
- Review worker logs for errors
- Test endpoints with the provided test script