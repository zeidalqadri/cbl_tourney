/**
 * CBL Coverage - Airtable Native Automation Scripts
 * Use these in Airtable's Automation Script Actions
 */

// ==========================================
// AUTOMATION 1: Process Slack Check-ins
// Trigger: When webhook received
// ==========================================

const processSlackCheckin = async () => {
    // Get webhook payload
    const webhookPayload = input.config();
    const message = webhookPayload.text || '';
    const user = webhookPayload.user_name || 'unknown';
    
    // Venue mapping
    const venues = {
        'yu hwa': 'Yu Hwa',
        'malim': 'Malim',
        'kuala nerang': 'Kuala Nerang',
        'gemencheh': 'Gemencheh'
    };
    
    // Find venue in message
    let detectedVenue = null;
    const lowerMessage = message.toLowerCase();
    
    for (const [key, value] of Object.entries(venues)) {
        if (lowerMessage.includes(key)) {
            detectedVenue = value;
            break;
        }
    }
    
    if (!detectedVenue) {
        console.log('No venue detected in message:', message);
        return;
    }
    
    // Detect content type
    const isVideo = /video|stream|live|broadcast/i.test(message);
    const isPhotos = /photo|gallery|pictures?|images?/i.test(message);
    const contentType = isVideo ? 'video' : (isPhotos ? 'photos' : null);
    
    if (!contentType) {
        console.log('No content type detected');
        return;
    }
    
    // Find and update venue record
    const table = base.getTable('venue_status');
    const queryResult = await table.selectRecordsAsync({
        fields: ['venue', 'status', 'content_type']
    });
    
    const venueRecord = queryResult.records.find(
        record => record.getCellValue('venue') === detectedVenue
    );
    
    if (venueRecord) {
        await table.updateRecordAsync(venueRecord.id, {
            'status': contentType === 'video' ? 'Video Ready' : 'Photos Uploaded',
            'content_type': contentType,
            'status_changed': true,
            'processed': false,
            'last_updated': new Date().toISOString(),
            'updated_by': `slack-${user}`
        });
        
        console.log(`Updated ${detectedVenue} with ${contentType}`);
        
        // Send Slack notification
        await sendSlackNotification(
            `:white_check_mark: Coverage update received!\nVenue: ${detectedVenue}\nType: ${contentType}\nUpdated by: ${user}`
        );
    }
};

// ==========================================
// AUTOMATION 2: Check YouTube & Update UI
// Trigger: When record matches (status_changed = true, processed = false)
// ==========================================

const checkYouTubeAndUpdate = async () => {
    const record = input.record;
    const venue = record.getCellValue('venue');
    const contentType = record.getCellValue('content_type');
    
    if (contentType === 'video') {
        // Check YouTube for live stream
        const youtubeData = await checkYouTubeLive(venue);
        
        if (youtubeData.isLive) {
            // Update WordPress
            await updateWordPress({
                venue: venue,
                type: 'video',
                embedUrl: youtubeData.embedUrl,
                title: youtubeData.title,
                thumbnail: youtubeData.thumbnail
            });
            
            await sendSlackNotification(
                `:tv: Live stream active for ${venue}!\n${youtubeData.watchUrl}`
            );
        }
    } else if (contentType === 'photos') {
        // Check Google Drive
        const photos = await checkGoogleDrive(venue);
        
        if (photos.length > 0) {
            // Create gallery
            const galleryUrl = await createPhotoGallery(venue, photos);
            
            // Update WordPress
            await updateWordPress({
                venue: venue,
                type: 'gallery',
                galleryUrl: galleryUrl,
                photoCount: photos.length,
                thumbnail: photos[0].thumbnail
            });
            
            await sendSlackNotification(
                `:camera: Photo gallery ready for ${venue}!\n${galleryUrl}`
            );
        }
    }
    
    // Mark as processed
    const table = base.getTable('venue_status');
    await table.updateRecordAsync(record.id, {
        'processed': true,
        'processed_at': new Date().toISOString()
    });
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

async function checkYouTubeLive(venue) {
    const YOUTUBE_API_KEY = 'YOUR_API_KEY'; // Store in Airtable's environment
    const CHANNEL_ID = 'YOUR_CHANNEL_ID';
    
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&q=${encodeURIComponent(venue + ' match CBL')}&type=video&eventType=live&key=${YOUTUBE_API_KEY}`;
    
    const response = await fetch(searchUrl);
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
        const video = data.items[0];
        return {
            isLive: true,
            videoId: video.id.videoId,
            title: video.snippet.title,
            embedUrl: `https://www.youtube.com/embed/${video.id.videoId}`,
            watchUrl: `https://www.youtube.com/watch?v=${video.id.videoId}`,
            thumbnail: video.snippet.thumbnails.high.url
        };
    }
    
    return { isLive: false };
}

async function checkGoogleDrive(venue) {
    // For Google Drive, you might need to use a service like Zapier or Make
    // Or implement using Google Apps Script
    // This is a simplified version
    
    const DRIVE_WEBHOOK = 'YOUR_GOOGLE_APPS_SCRIPT_URL';
    
    const response = await fetch(DRIVE_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ venue: venue })
    });
    
    return await response.json();
}

async function updateWordPress(data) {
    const WP_API_URL = 'https://cbl.com/wp-json/cbl/v1/match-coverage';
    const WP_AUTH = 'Basic ' + btoa('username:password');
    
    const response = await fetch(WP_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': WP_AUTH
        },
        body: JSON.stringify({
            venue: data.venue,
            content_type: data.type,
            content_data: data,
            updated_at: new Date().toISOString()
        })
    });
    
    return response.ok;
}

async function sendSlackNotification(message) {
    const SLACK_WEBHOOK = 'YOUR_SLACK_WEBHOOK_URL';
    
    await fetch(SLACK_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message })
    });
}

async function createPhotoGallery(venue, photos) {
    // Simple approach: create a shareable link
    // You could integrate with a service like Cloudinary or your own server
    
    const galleryId = `${venue.toLowerCase().replace(/\s/g, '-')}-${Date.now()}`;
    const galleryUrl = `https://cbl.com/gallery/${galleryId}`;
    
    // Store gallery data somewhere accessible
    // This would depend on your setup
    
    return galleryUrl;
}

// ==========================================
// AUTOMATION 3: Scheduled Cleanup
// Trigger: Daily at midnight
// ==========================================

const dailyCleanup = async () => {
    const table = base.getTable('venue_status');
    const queryResult = await table.selectRecordsAsync({
        fields: ['venue', 'processed', 'last_updated']
    });
    
    const updates = [];
    const now = new Date();
    
    for (const record of queryResult.records) {
        const lastUpdated = new Date(record.getCellValue('last_updated'));
        const hoursSinceUpdate = (now - lastUpdated) / (1000 * 60 * 60);
        
        // Reset if older than 24 hours
        if (hoursSinceUpdate > 24) {
            updates.push({
                id: record.id,
                fields: {
                    'status': 'Ready',
                    'status_changed': false,
                    'processed': true
                }
            });
        }
    }
    
    // Batch update
    while (updates.length > 0) {
        const batch = updates.splice(0, 50);
        await table.updateRecordsAsync(batch);
    }
    
    console.log(`Reset ${updates.length} venue records`);
};

// Export the main functions for use in Airtable Automations
output.set('processSlackCheckin', processSlackCheckin);
output.set('checkYouTubeAndUpdate', checkYouTubeAndUpdate);
output.set('dailyCleanup', dailyCleanup);