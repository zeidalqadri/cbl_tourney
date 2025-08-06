# Google Drive Photo Integration Setup

## Overview
The tournament system now includes Google Drive integration for automatic photo management with smart period detection.

## Features
- Automatic photo retrieval from Google Drive folders
- Smart period detection using covered lens photos or time gaps
- Photo categorization by match periods (pre-match, first half, half-time, second half, post-match)
- Bulk photo selection and management
- Real-time photo statistics per match

## Setup Instructions

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable the Google Drive API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Drive API"
   - Click Enable

### 2. Create Service Account

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in the service account details:
   - Name: `tournament-photos-reader`
   - Role: `Viewer` or `Editor` (if you need write access)
4. Click "Create and Continue"
5. Download the JSON key file

### 3. Set Up Environment Variables

Add these to your `.env.local` file:

```env
# Google Drive Service Account
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID=your_folder_id_here
```

### 4. Google Drive Folder Structure

Organize your photos in Google Drive with this structure:

```
Tournament Photos (main folder)
├── Match_001/
│   ├── DSC_0001.jpg (pre-match photos)
│   ├── DSC_0002.jpg
│   ├── covered_lens_01.jpg (interval marker)
│   ├── DSC_0003.jpg (first half photos)
│   ├── covered_lens_02.jpg (interval marker)
│   ├── DSC_0004.jpg (half-time photos)
│   ├── covered_lens_03.jpg (interval marker)
│   ├── DSC_0005.jpg (second half photos)
│   ├── covered_lens_04.jpg (interval marker)
│   └── DSC_0006.jpg (post-match photos)
├── Match_002/
├── Match_003/
└── ...
```

### 5. Share Folder with Service Account

1. Open your tournament photos folder in Google Drive
2. Click the "Share" button
3. Enter the service account email (from step 2)
4. Give "Viewer" permissions
5. Click "Send"

## Using the Photo Management System

### For Photographers

1. **Folder Naming**: Create folders named `Match_XXX` (e.g., `Match_001`, `Match_114`)
2. **Period Markers**: Insert "covered lens" photos between periods:
   - Take a photo with lens cap on or black image
   - Name it with "covered", "lens", "interval", or "break" in the filename
   - These act as automatic period dividers

### For Administrators

1. Go to Admin > Photo Management
2. Select a match to view available photos
3. Photos are automatically categorized by period
4. Select photos to use for match highlights
5. Filter by period for quick selection

## API Endpoints

### Get Match Photos
```
GET /api/photos?match=114
```

### Get Photo Statistics
```
GET /api/photos?match=114&stats=true
```

### Search Photos
```
GET /api/photos?q=team_name
```

## Troubleshooting

### Photos Not Showing
- Verify folder is shared with service account
- Check folder naming convention (Match_XXX)
- Ensure photos are in image format (jpg, png, etc.)

### Period Detection Issues
- Add covered lens photos between periods
- Ensure at least 5-minute gaps between periods
- Check photo timestamps are correct

### Authentication Errors
- Verify service account email is correct
- Check private key formatting (newlines must be preserved)
- Confirm folder is shared with service account

## Smart Period Detection

The system uses two methods to detect photo periods:

1. **Covered Lens Detection** (Primary)
   - Looks for photos with specific keywords in filename
   - Keywords: "covered", "lens", "interval", "break", "pause", "black"
   - Most accurate method

2. **Time Gap Detection** (Fallback)
   - Analyzes timestamps between photos
   - Detects gaps > 5 minutes as period boundaries
   - Automatically divides into 5 periods

## Security Notes

- Service account has read-only access by default
- Photos are accessed via secure Google APIs
- No photos are stored locally
- Access controlled through tournament admin interface