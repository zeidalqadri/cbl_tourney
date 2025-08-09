# N8N Integration Guide for CBL Tournament Live Coverage

This guide explains how to set up N8N workflows to automate media content aggregation for the CBL Tournament website.

## Overview

The integration supports three main types of content:
1. **YouTube Videos** - Automatically sync videos from "Everything CBL" channel
2. **Photos** - Upload photos from photographers on-site
3. **Match Status** - Update match status and live stream URLs

## Setup

### 1. Environment Variables

Add these to your `.env.local` file:

```env
NEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key
NEXT_PUBLIC_YOUTUBE_CHANNEL_ID=UC_YOUR_CHANNEL_ID
```

### 2. Webhook Endpoints

Since we use static export (Cloudflare Pages), webhooks are handled client-side:

- **Webhook Test Page**: `/webhooks` - Use this to test and generate webhook URLs
- **Direct Handler**: `/webhook-handler.html` - Use this for N8N GET requests

## N8N Workflow Examples

### 1. YouTube Video Sync Workflow

**Trigger**: Schedule (every 15 minutes) or Manual

**HTTP Request Node Configuration**:
```
Method: GET
URL: https://yourdomain.com/webhook-handler.html
Query Parameters:
  payload: {{ encodeURIComponent(JSON.stringify({
    "type": "youtube",
    "data": {
      "action": "sync"
    }
  })) }}
```

### 2. Photo Upload Workflow

**Trigger**: Webhook from photo storage service (e.g., Cloudinary)

**HTTP Request Node Configuration**:
```
Method: GET
URL: https://yourdomain.com/webhook-handler.html
Query Parameters:
  payload: {{ encodeURIComponent(JSON.stringify({
    "type": "photo",
    "data": {
      "photos": [
        {
          "url": "{{ $json.secure_url }}",
          "caption": "{{ $json.context.caption }}",
          "photographer": "{{ $json.context.photographer }}"
        }
      ],
      "venue": "{{ $json.context.venue }}",
      "matchNumber": {{ $json.context.match_number }},
      "division": "{{ $json.context.division }}"
    }
  })) }}
```

### 3. Match Status Update Workflow

**Trigger**: Manual or from streaming service webhook

**HTTP Request Node Configuration**:
```
Method: GET
URL: https://yourdomain.com/webhook-handler.html
Query Parameters:
  payload: {{ encodeURIComponent(JSON.stringify({
    "type": "match_status",
    "data": {
      "venue": "{{ $json.venue }}",
      "matchNumber": {{ $json.match_number }},
      "status": "{{ $json.status }}",
      "liveStreamUrl": "{{ $json.stream_url }}"
    }
  })) }}
```

## Venue-Based Content Schedule

The system automatically detects which type of content to expect based on venue and date:

- **SJKC YU HWA**: Video coverage (live streaming)
- **SJKC MALIM**: Photo coverage

## Testing Webhooks

1. Navigate to `/webhooks` on your site
2. Click "Generate Webhook URL" to get your webhook endpoint
3. Use the test buttons to verify each webhook type works correctly
4. Check the results in the test result panel

## Manual Operations

### YouTube Sync
1. Go to `/webhooks`
2. Click "Manual YouTube Sync"
3. This will fetch recent videos from the channel and match them to games

### Photo Upload (for photographers)
1. Go to `/admin` page
2. Use the photo upload interface
3. Select venue, match number, and division
4. Upload photos with captions

## Troubleshooting

### Videos not syncing
- Check YouTube API key is correct
- Verify channel ID matches "Everything CBL"
- Ensure video titles/descriptions contain match numbers or venue names

### Photos not uploading
- Verify match exists in the database
- Check venue name matches exactly (e.g., "SJKC MALIM" not "Malim")
- Ensure photo URLs are accessible

### Match not found
- Match numbers must be exact
- Venue names are case-insensitive but must match
- Division must be "boys" or "girls"

## Best Practices

1. **Video Titles**: Include "Match #X" or venue name in YouTube video titles
2. **Photo Metadata**: Always include venue, match number, and photographer info
3. **Sync Frequency**: Run YouTube sync every 15-30 minutes during tournament days
4. **Error Handling**: Check webhook test page for detailed error messages