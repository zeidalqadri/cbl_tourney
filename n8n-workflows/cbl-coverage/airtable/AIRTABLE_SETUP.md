# 📊 Airtable Base Setup for CBL Coverage

## Quick Setup (5 minutes)

### Option 1: Manual Setup (Recommended)

1. **Create New Base**
   - Go to [Airtable](https://airtable.com)
   - Click "Add a base" → "Start from scratch"
   - Name it: **"CBL Coverage"**

2. **Create Table: venue_status**
   - Rename the default table to `venue_status`
   - Delete all default fields except the first one

3. **Add Fields** (in this exact order):

| Field Name | Field Type | Options/Configuration |
|------------|------------|----------------------|
| **venue** | Single line text | (Rename the default "Name" field) |
| **status** | Single line text | Default: "Ready" |
| **content_type** | Single select | Options: `video`, `photos` |
| **last_updated** | Date and time | Include time, Use GMT |
| **updated_by** | Single line text | Default: "system" |
| **status_changed** | Checkbox | Default: Unchecked |
| **processed** | Checkbox | Default: Checked |
| **processed_at** | Date and time | Include time, Use GMT |
| **workflow_run_id** | Single line text | (Leave empty) |

### Option 2: Import CSV

1. Create the base as above
2. In Airtable, click "..." menu → "Import data" → "CSV file"
3. Upload: `venue_status_template.csv`
4. Map fields correctly

## 🎨 Field Configuration Details

### content_type (Single Select)
Add these exact options:
- `video` (color: blue)
- `photos` (color: green)

### Checkbox Fields
- **status_changed**: Triggers workflow processing
- **processed**: Prevents duplicate processing

### Date Fields
- Set timezone to GMT/UTC
- Enable time display
- Format: ISO 8601

## 🏟️ Add Venue Records

After creating fields, add these 4 venues:

| venue | status | content_type | status_changed | processed |
|-------|--------|--------------|----------------|-----------|
| Yu Hwa | Ready | photos | ☐ | ☑ |
| Malim | Ready | video | ☐ | ☑ |
| Kuala Nerang | Ready | photos | ☐ | ☑ |
| Gemencheh | Ready | video | ☐ | ☑ |

## 🔑 Get Your API Credentials

1. Click your profile icon → "Account"
2. Find "API" section
3. Generate/copy your API key
4. Get Base ID:
   - Go to https://airtable.com/api
   - Select your "CBL Coverage" base
   - Base ID is in the URL: `app[XXXXXXXXX]`

## ✅ Verify Setup

Your Airtable is ready when:
- [ ] Base named "CBL Coverage" exists
- [ ] Table "venue_status" has all 9 fields
- [ ] 4 venue records are added
- [ ] You have API key and Base ID

## 🧪 Test Your Setup

In Airtable, try this:
1. Check ☑ the "status_changed" box for "Malim"
2. Uncheck ☐ the "processed" box
3. Change status to "Video Ready"

This simulates what happens when a photographer checks in!

## 📝 API Details for n8n

When configuring n8n:
- **API Key**: `key[...]` (from your account)
- **Base ID**: `app[...]` (from API docs)
- **Table Name**: `venue_status`

## 🚀 Advanced: Formula Fields (Optional)

Add these for better monitoring:

### time_since_update
```
DATETIME_DIFF(NOW(), last_updated, 'minutes') & ' minutes ago'
```

### needs_attention
```
IF(
  AND(
    status_changed = TRUE(),
    processed = FALSE(),
    DATETIME_DIFF(NOW(), last_updated, 'minutes') > 10
  ),
  '⚠️ Delayed',
  '✅ OK'
)
```

---

**Next Step**: Once Airtable is set up, return to n8n and add your Airtable credentials!