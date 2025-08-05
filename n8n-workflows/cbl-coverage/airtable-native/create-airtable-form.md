# 📝 Create Airtable Form for Telegram Team

## Step 1: Create the Form (2 minutes)

1. Go to your Airtable base: https://airtable.com/appWQnpqml0xHknlL
2. Click **"venue_status"** table
3. Click **"Form"** in the views sidebar
4. Click **"Create a new form view"**

## Step 2: Configure Form Fields

**Show these fields only:**

### Venue (Required)
- Type: Single select
- Options:
  - Yu Hwa
  - Malim
  - Kuala Nerang
  - Gemencheh

### Content Type (Required)
- Type: Single select
- Options:
  - video (label as "🎥 Video/Stream")
  - photos (label as "📸 Photos/Gallery")

### Updated By (Required)
- Type: Single line text
- Placeholder: "Your name"

### Additional Notes (Optional)
- Type: Long text
- Placeholder: "Any special notes? (e.g., 'Stream starting in 10 mins')"

## Step 3: Form Settings

1. **Form Title**: "CBL Match Coverage Check-in"
2. **Description**: "Report when video or photos are ready at your venue"
3. **Submit button**: "✅ Submit Coverage Update"
4. **After submit**: Show success message:
   ```
   Thanks! Coverage update received.
   The website will update within 5 minutes.
   ```

## Step 4: Create Automation

**Automation: "Process Form Submissions"**

Trigger: When form submitted

Actions:
1. Update the submitted record:
   - status = IF(content_type="video", "Video Ready", "Photos Uploaded")
   - status_changed = ✓
   - last_updated = NOW()
   - processed = ✗

2. Find matching venue record and update it

## Step 5: Share with Telegram

Get your form link and share in Telegram:

```
📢 CBL Coverage Team

Report coverage updates here:
🔗 [Your Form Link]

Quick guide:
1. Click the link
2. Select your venue
3. Choose video or photos
4. Submit!

Website updates automatically in 5 mins ⚡
```

## 📊 Create a Dashboard View

In Airtable, create a new Grid view called "📊 Live Dashboard":

**Visible fields:**
- Venue
- Coverage Status (formula field)
- Last Updated
- Updated By

**Color coding:**
- Green: Updated in last hour
- Yellow: Updated 1-3 hours ago  
- Red: Over 3 hours old

**Formula for Coverage Status:**
```
IF(
  status = "Video Ready",
  "🔴 LIVE VIDEO",
  IF(
    status = "Photos Uploaded", 
    "📸 GALLERY READY",
    "⏳ Waiting for content"
  )
)
```

This is the fastest way to get your team updating coverage status!