# 🚀 CBL Coverage - Airtable Native Automation Setup

Yes! You can do this entirely in Airtable. Here's how:

## Overview

Instead of n8n, we'll use:
- **Airtable Automations** (built-in)
- **Airtable Scripts** (for API calls)
- **Webhooks** (for Slack integration)

## 🎯 Quick Setup (15 minutes)

### Step 1: Enable Automations

1. In your Airtable base (appWQnpqml0xHknlL)
2. Click **Automations** in the top bar
3. Click **Create automation**

### Step 2: Create Automation #1 - Slack Check-ins

**Name:** "Process Slack Check-ins"

**Trigger:** When webhook received
1. Click "Choose a trigger" → "When webhook received"
2. Copy the webhook URL (you'll add this to Slack)

**Action:** Run a script
```javascript
// Get webhook data
const {text, user_name} = input.config();

// Parse venue and content type
const venues = {
    'yu hwa': 'Yu Hwa',
    'malim': 'Malim', 
    'kuala nerang': 'Kuala Nerang',
    'gemencheh': 'Gemencheh'
};

let venue = null;
let contentType = null;

// Find venue
for (const [key, value] of Object.entries(venues)) {
    if (text.toLowerCase().includes(key)) {
        venue = value;
        break;
    }
}

// Detect content type
if (text.match(/video|stream|live/i)) {
    contentType = 'video';
} else if (text.match(/photo|gallery/i)) {
    contentType = 'photos';
}

if (venue && contentType) {
    // Find and update the venue record
    const table = base.getTable('venue_status');
    const query = await table.selectRecordsAsync();
    const record = query.records.find(r => 
        r.getCellValue('venue') === venue
    );
    
    if (record) {
        await table.updateRecordAsync(record.id, {
            'status': contentType === 'video' ? 'Video Ready' : 'Photos Uploaded',
            'content_type': contentType,
            'status_changed': true,
            'processed': false,
            'last_updated': new Date().toISOString(),
            'updated_by': `slack-${user_name}`
        });
        
        console.log(`Updated ${venue} with ${contentType}`);
    }
}
```

### Step 3: Create Automation #2 - Process Updates

**Name:** "Check Content & Update WordPress"

**Trigger:** When record matches conditions
- Table: venue_status
- Conditions:
  - status_changed = ✓ (checked)
  - processed = ✗ (unchecked)

**Action 1:** Run a script (check YouTube/Drive)
```javascript
const record = input.record;
const venue = record.getCellValue('venue');
const contentType = record.getCellValue('content_type');

// For YouTube (you'll need to add your API key)
if (contentType === 'video') {
    const YOUTUBE_API_KEY = 'YOUR_KEY';
    const CHANNEL_ID = 'YOUR_CHANNEL';
    
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&q=${venue} match&type=video&eventType=live&key=${YOUTUBE_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.items?.length > 0) {
        output.set('videoFound', true);
        output.set('videoId', data.items[0].id.videoId);
        output.set('videoTitle', data.items[0].snippet.title);
    }
}

// For photos - you'd need a different approach
// Consider using Airtable attachments or external service
```

**Action 2:** Update record
- Update "processed" to ✓
- Update "processed_at" to NOW()

**Action 3:** Send Slack notification
- Use Slack integration
- Message: "✅ {{venue}} coverage updated with {{content_type}}"

### Step 4: Create Automation #3 - Daily Reset

**Name:** "Daily Venue Reset"

**Trigger:** At scheduled time
- Every day at 12:00 AM

**Action:** Update records
- Find records where last_updated is > 24 hours old
- Update:
  - status = "Ready"
  - status_changed = ✗
  - processed = ✓

## 🔧 Simpler Alternative: Airtable + Zapier/Make

If the scripting seems complex, use:

1. **Airtable** for data
2. **Zapier** or **Make** for:
   - Slack webhook → Airtable update
   - Airtable change → Check APIs → Update WordPress
   - Scheduled cleanup

## 📱 Even Simpler: Manual Updates + Views

Create these Airtable views:

1. **"📹 Live Now"** - Shows active coverage
2. **"⏳ Pending Updates"** - Needs processing  
3. **"📊 Coverage Dashboard"** - Overview

Then:
- Photographers update via Airtable form
- You manually check and update WordPress
- Still automated tracking, just manual publishing

## 🎯 Recommended Approach

For quickest setup:
1. Use Airtable for tracking (✅ done)
2. Create a simple form for check-ins
3. Use filtered views for status
4. Manually update WordPress (for now)
5. Add automation gradually

Want me to show you how to set up the form-based approach? It's the fastest to get running!