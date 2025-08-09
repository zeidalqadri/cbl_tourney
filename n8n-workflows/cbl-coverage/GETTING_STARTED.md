# 🚀 CBL Coverage Workflow - Getting Started

## Quick Start (10 minutes)

### 1️⃣ Start n8n
```bash
# If n8n is not running, start it:
n8n start

# n8n will be available at: http://localhost:5678
```

### 2️⃣ Prepare Your Credentials

You'll need these API keys ready:

| Service | What You Need | Where to Get It |
|---------|---------------|-----------------|
| **YouTube** | API Key | [Google Cloud Console](https://console.cloud.google.com/apis/library/youtube.googleapis.com) |
| **Google Drive** | OAuth2 | Will set up in n8n |
| **Airtable** | API Key + Base ID | [Airtable Account](https://airtable.com/account) |
| **WordPress** | Username + Password | Your WordPress admin |
| **Slack** | OAuth Token | [Slack Apps](https://api.slack.com/apps) |

### 3️⃣ Quick Airtable Setup

1. Go to [Airtable](https://airtable.com)
2. Create new base called "CBL Coverage"
3. Create table "venue_status" with these fields:

```
- venue (Single line text)
- status (Single line text) 
- content_type (Single select: video, photos)
- last_updated (Date time)
- updated_by (Single line text)
- status_changed (Checkbox)
- processed (Checkbox)
```

4. Add 4 records for venues: Yu Hwa, Malim, Kuala Nerang, Gemencheh

### 4️⃣ Google Drive Setup

Create this folder structure in your Google Drive:
```
CBL Coverage/
├── Yu Hwa/
├── Malim/
├── Kuala Nerang/
└── Gemencheh/
```

### 5️⃣ Import Workflow to n8n

1. Open n8n at http://localhost:5678
2. Click **Workflows** → **Add Workflow** → **Import from File**
3. Select: `n8n-workflows/cbl-coverage/workflows/cbl-live-coverage-main.json`
4. Click **Save**

### 6️⃣ Configure Credentials in n8n

In n8n, go to **Credentials** and add:

#### a) Airtable (easiest to start)
- Click **New** → Search "Airtable"
- Name: `CBL Airtable`
- API Key: (from Airtable account page)

#### b) Slack
- Click **New** → Search "Slack"  
- Name: `CBL Slack`
- Access Token: (from Slack app OAuth)

#### c) Google APIs (Drive + YouTube)
- Click **New** → Search "Google"
- Set up OAuth2 for Drive
- Add API key for YouTube

### 7️⃣ First Test

1. In n8n, open the imported workflow
2. Click **Execute Workflow** button
3. Check for any credential errors
4. Fix any red nodes by adding credentials

### 8️⃣ Test Slack Integration

Send this in your Slack channel:
```
Photos uploaded for Malim
```

Expected result:
- Airtable updates
- Workflow processes
- Success notification

---

## 🎯 Next Steps

Once basic test works:

1. **Set up WordPress endpoint** (see setup-guide.md)
2. **Configure environment variables**
3. **Enable scheduled polling**
4. **Test with real photos/videos**

## 🆘 Troubleshooting

**"Credential not found"**
- Click the red node
- Select credential type
- Create new credential

**"Rate limit exceeded"**
- Normal for YouTube API
- Wait 1 minute and retry
- Check api-optimization.md

**"Venue not found"**
- Check exact spelling in Slack message
- Must match: Yu Hwa, Malim, Kuala Nerang, or Gemencheh

---

## 📺 Video Walkthrough

Need visual help? The main steps are:

1. Import JSON → n8n
2. Add credentials one by one
3. Test with Execute Workflow
4. Send test Slack message
5. Check Airtable for updates

Ready? Let's go! 🏏