# 📱 CBL Coverage - Telegram + Airtable Setup

## 🚀 Simplest Solution: Airtable Form + Telegram Bot

### Option 1: Airtable Form (Easiest - 5 minutes)

1. **Create an Airtable Form**
   - In your base, go to **venue_status** table
   - Click **Form** view → **Create form**
   - Name it: "Coverage Check-in"

2. **Form Fields:**
   - **Venue** (dropdown): Yu Hwa, Malim, Kuala Nerang, Gemencheh
   - **Content Type** (dropdown): video, photos
   - **Updated By** (text): Photographer name
   - Hide other fields

3. **Share with Telegram:**
   ```
   📸 Coverage Update Form
   https://airtable.com/shrXXXXXXXXXX
   
   Use this to report when content is ready!
   ```

4. **Create Automation in Airtable:**
   - Trigger: When form submitted
   - Action: Update record with:
     - status = "Video Ready" or "Photos Uploaded"
     - status_changed = ✓
     - last_updated = NOW()

### Option 2: Telegram Bot + Airtable Webhook

1. **Create a Telegram Bot:**
   - Message @BotFather on Telegram
   - `/newbot` → Name it "CBL Coverage Bot"
   - Save the bot token

2. **Set up Webhook in Airtable:**
   - Go to Automations → Create
   - Trigger: "When webhook received"
   - Copy webhook URL

3. **Simple Bot Script** (using Telegram Bot API):
   ```javascript
   // Webhook automation in Airtable
   const telegramData = input.config();
   const message = telegramData.message.text;
   const user = telegramData.message.from.first_name;
   
   // Parse: "Photos ready at Malim"
   const venues = ['Yu Hwa', 'Malim', 'Kuala Nerang', 'Gemencheh'];
   let venue = venues.find(v => message.includes(v));
   let type = message.includes('video') ? 'video' : 'photos';
   
   // Update Airtable...
   ```

### Option 3: Manual Updates + Telegram Group

**Simplest approach:**

1. **Create Telegram Group**: "CBL Coverage Updates"

2. **Standard Format**:
   ```
   📸 Malim - Photos ready
   🎥 Yu Hwa - Video streaming
   ```

3. **In Airtable, create a view**: "Manual Update Queue"
   - Shows all venues
   - Quick edit status/content type
   - Check status_changed when updating

4. **Every 30 mins**: Check Telegram, update Airtable

## 🎯 Recommended: Quick Start with Forms

1. **Create the form** (2 minutes)
2. **Pin message in Telegram** with form link
3. **Photographers click link** → Fill form → Done!

Want me to show you exactly how to create the form?