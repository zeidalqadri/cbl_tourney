# N8N Workflows for CBL Tournament

This folder contains N8N workflow JSON files for the CBL Tournament Live Coverage system.

## Workflows

### 1. CBL YouTube Auto-Sync (`cbl-youtube-auto-sync-simple.json`)
- **Purpose**: Automatically sync YouTube videos from "Everything CBL" channel every 15 minutes
- **Trigger**: Schedule (every 15 minutes)
- **Actions**: Fetches recent videos and matches them to tournament games
- **Note**: Uses pre-encoded URL to avoid expression syntax issues

### 2. CBL Live Stream Update (`cbl-live-stream-update-simple.json`)
- **Purpose**: Manually update live stream URLs for matches in progress
- **Trigger**: Manual
- **Configuration**: Update venue, match number, and YouTube live stream URL in the "Set Match Details" node
- **Note**: Uses Function Item nodes for better compatibility

### 3. CBL Auto Match Status - Schedule Based (`cbl-auto-match-status-schedule.json`)
- **Purpose**: Automatically update match status based on a predefined schedule
- **Trigger**: Schedule (runs at 8am, 10am, 12pm, 2pm, 4pm, 6pm)
- **Configuration**: Edit the schedule in the "Get Current Matches" node
- **Note**: Updates matches to "in_progress" when their scheduled time arrives

### 4. CBL Match Details - External Trigger (`cbl-match-details-external-trigger.json`)
- **Purpose**: Update match details via webhook from external systems
- **Trigger**: Webhook (POST request)
- **Endpoint**: `https://your-n8n-instance.com/webhook/cbl-match-update`
- **Payload**: `{ "venue": "SJKC YU HWA", "matchNumber": 1, "streamUrl": "...", "status": "in_progress" }`

### 5. CBL Match Details - Google Sheets (`cbl-match-details-google-sheets.json`)
- **Purpose**: Read match schedule from Google Sheets and auto-update when matches start
- **Trigger**: Schedule (every 5 minutes)
- **Configuration**: 
  - Set up Google Sheets credentials in N8N
  - Replace `YOUR_GOOGLE_SHEET_ID` with your sheet ID
  - Sheet columns: Date, Time, Venue, MatchNumber, StreamURL, Status

### 6. CBL Match Details - Database Driven (`cbl-match-details-database.json`)
- **Purpose**: Query database for scheduled matches and auto-update status
- **Trigger**: Schedule (every 2 minutes)
- **Configuration**: Set up database credentials (PostgreSQL) in N8N
- **Note**: Expects a `match_schedule` table with appropriate columns

## How to Import

1. Open your N8N instance
2. Go to Workflows
3. Click the menu (⋮) → Import from File
4. Select the JSON file or paste its contents
5. Save the workflow

## Configuration

### Schedule-Based Automation
1. Import `cbl-auto-match-status-schedule.json`
2. Edit the schedule object in "Get Current Matches" node:
   ```javascript
   const schedule = {
     'Monday': [
       { time: 8, venue: 'SJKC YU HWA', matches: [1, 2, 3] },
       // Add more time slots
     ],
     // Add more days
   };
   ```
3. Activate the workflow

### External Webhook Trigger
1. Import `cbl-match-details-external-trigger.json`
2. Save and activate the workflow
3. Use the webhook URL to trigger updates:
   ```bash
   curl -X POST https://your-n8n.com/webhook/cbl-match-update \
     -H "Content-Type: application/json" \
     -d '{"venue": "SJKC YU HWA", "matchNumber": 1, "streamUrl": "..."}'
   ```

### Google Sheets Integration
1. Import `cbl-match-details-google-sheets.json`
2. Set up Google Sheets credentials in N8N
3. Create a sheet with columns: Date, Time, Venue, MatchNumber, StreamURL, Status
4. Replace `YOUR_GOOGLE_SHEET_ID` in the workflow
5. Activate the workflow

### Database Integration
1. Import `cbl-match-details-database.json`
2. Set up PostgreSQL credentials in N8N
3. Create a `match_schedule` table:
   ```sql
   CREATE TABLE match_schedule (
     match_number INT,
     venue VARCHAR(255),
     scheduled_time TIMESTAMP,
     status VARCHAR(50),
     live_stream_url TEXT
   );
   ```
4. Activate the workflow

## Testing

- Test each workflow manually before activating
- Check execution logs for any errors
- Verify updates appear on the website
- For scheduled workflows, test with adjusted times first