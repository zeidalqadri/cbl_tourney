# CBL Live Match Coverage - n8n Workflow Setup Guide

## Overview

This n8n workflow automates the dynamic display of live match coverage (videos and photo galleries) on CBL's YouTube channel "Everything CBL" based on real-time content availability per venue during the group stage.

## Prerequisites

1. **n8n Instance** (v1.0+ recommended)
2. **API Credentials:**
   - YouTube Data API v3 key
   - Google Drive API access
   - Airtable API key and base ID
   - WordPress REST API credentials
   - Slack API token
   - Sentry DSN (optional for error tracking)

3. **External Services Setup:**
   - Airtable base with `venue_status` table
   - Slack workspace with webhook access
   - WordPress site with custom REST API endpoint
   - Google Drive folders per venue
   - YouTube channel ID

## Installation Steps

### 1. Import Workflow

1. Open your n8n instance
2. Go to **Workflows** → **Import**
3. Upload `cbl-live-coverage-main.json`
4. Save the workflow

### 2. Configure Environment Variables

Add these to your n8n environment:

```bash
# YouTube Configuration
YOUTUBE_API_KEY=your_youtube_api_key
YOUTUBE_CHANNEL_ID=UC_your_channel_id

# WordPress Configuration
WORDPRESS_API_URL=https://cbl.com
WORDPRESS_API_USER=api_user
WORDPRESS_API_PASSWORD=api_password

# Slack Configuration
SLACK_COVERAGE_CHANNEL=#cbl-coverage
SLACK_ERROR_CHANNEL=#cbl-errors

# Sentry Configuration (Optional)
SENTRY_DSN=https://your-sentry-dsn
SENTRY_PROJECT=cbl-tourney

# Environment
NODE_ENV=production
```

### 3. Set Up Credentials

In n8n, create these credentials:

#### a. YouTube API (googleApi)
- Name: `YouTube API`
- API Key: Your YouTube Data API v3 key

#### b. Google Drive API (googleApi)
- Name: `Google Drive API`
- OAuth2 authentication
- Scopes: `drive.readonly`

#### c. Airtable API (airtableApi)
- Name: `CBL Airtable`
- API Key: Your Airtable API key

#### d. WordPress API (httpBasicAuth)
- Name: `WordPress API`
- Username: API username
- Password: API password

#### e. Slack API (slackApi)
- Name: `CBL Slack`
- Access Token: Your Slack OAuth token

#### f. Sentry API (httpHeaderAuth)
- Name: `Sentry API`
- Header Name: `Authorization`
- Header Value: `Bearer your-sentry-auth-token`

### 4. Airtable Setup

Create a base with the `venue_status` table:

| Field | Type | Description |
|-------|------|-------------|
| id | Auto Number | Primary key |
| venue | Single Line Text | Venue name |
| status | Single Line Text | Current status |
| content_type | Single Select | video/photos |
| last_updated | Date Time | Last update timestamp |
| updated_by | Single Line Text | Who updated |
| status_changed | Checkbox | Flag for changes |
| processed | Checkbox | Processing flag |
| processed_at | Date Time | When processed |
| workflow_run_id | Single Line Text | n8n execution ID |

### 5. Google Drive Setup

Create folders for each venue:
```
CBL Coverage/
├── Yu Hwa/
├── Malim/
├── Kuala Nerang/
└── Gemencheh/
```

Share these folders with the Google account used for Drive API.

### 6. WordPress Endpoint

Create a custom REST API endpoint in WordPress:

```php
// In your theme's functions.php or custom plugin
add_action('rest_api_init', function() {
    register_rest_route('cbl/v1', '/match-coverage', [
        'methods' => 'POST',
        'callback' => 'update_match_coverage',
        'permission_callback' => 'is_authenticated'
    ]);
});

function update_match_coverage($request) {
    $params = $request->get_json_params();
    
    // Update match card with coverage data
    $venue = sanitize_text_field($params['venue']);
    $content_type = $params['content_type'];
    $content_data = $params['content_data'];
    
    // Your implementation here
    
    return new WP_REST_Response(['success' => true], 200);
}
```

### 7. Slack Webhook Setup

1. In Slack, go to **Apps** → **Incoming Webhooks**
2. Create a webhook for the coverage channel
3. Copy the webhook URL
4. In n8n workflow, update the webhook path

## Testing

### 1. Test Slack Check-in

Send a message in Slack:
```
Video streaming ready at Yu Hwa
```

Expected result:
- Airtable status updated
- YouTube API checked
- WordPress updated
- Success notification in Slack

### 2. Test Photo Upload

1. Upload photos to Google Drive venue folder
2. Send Slack message: `Photos uploaded for Malim`
3. Verify gallery creation and WordPress update

### 3. Test Scheduled Polling

1. Manually update Airtable status
2. Wait for next 5-minute interval
3. Verify automatic processing

## Monitoring

### Dashboard Metrics

Monitor these KPIs:
- Webhook response time (< 2 seconds)
- API call success rate (> 95%)
- Cache hit ratio (> 70%)
- Update latency (< 10 minutes)

### Error Alerts

Errors are sent to:
1. Slack error channel
2. Sentry (if configured)
3. n8n execution logs

## Optimization Tips

### 1. Rate Limit Management

The workflow includes built-in rate limiting:
- YouTube: 10,000 quota units/day
- Google Drive: 1,000 requests/100 seconds
- Airtable: 5 requests/second

### 2. Caching Strategy

- YouTube live streams: 5-minute cache
- Photo galleries: 3-minute cache
- Reduces API calls by ~80%

### 3. Performance Tuning

```javascript
// In Code nodes, use these patterns:

// Check cache first
const cached = cacheManager.get(key, staticData);
if (cached) return cached.data;

// Rate limit check
const limit = rateLimiter.checkLimit('youtube', staticData);
if (!limit.allowed) {
  await new Promise(r => setTimeout(r, limit.waitTime));
}
```

## Troubleshooting

### Common Issues

1. **"Rate limit exceeded"**
   - Check daily quota usage
   - Increase cache TTL
   - Reduce polling frequency

2. **"Venue not found"**
   - Verify venue names in Slack message
   - Check VENUES mapping in slack-handler.js

3. **"No photos found"**
   - Verify Google Drive folder permissions
   - Check folder naming matches venues

4. **WordPress update fails**
   - Verify API credentials
   - Check endpoint URL
   - Test with Postman

### Debug Mode

Enable debug logging:
1. Set workflow to save all executions
2. Add console.log in Code nodes
3. Check n8n execution history

## Scaling Considerations

### For Knockout Stages

1. Add new venues to:
   - Airtable venue_status table
   - Google Drive folders
   - slack-handler.js VENUES mapping

2. Adjust polling frequency:
   - Peak hours: 2-minute intervals
   - Off-peak: 10-minute intervals

### API Quota Management

If hitting limits:
1. Implement request queuing
2. Use batch operations
3. Increase cache duration
4. Consider upgrading API quotas

## Support

For issues:
1. Check n8n execution logs
2. Review Sentry error tracking
3. Verify all credentials are active
4. Test individual nodes in isolation

## Version History

- v1.0.0 - Initial release with core functionality
- v1.1.0 - Added intelligent caching and rate limiting
- v1.2.0 - Enhanced error handling and monitoring