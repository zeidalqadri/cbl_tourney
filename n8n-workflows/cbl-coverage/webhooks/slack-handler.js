/**
 * Slack Webhook Handler for CBL Coverage
 * Processes check-in messages from photographers/videographers
 */

const slackHandler = {
  /**
   * Venue mapping configuration
   */
  VENUES: {
    'yu hwa': 'Yu Hwa',
    'yuhwa': 'Yu Hwa',
    'malim': 'Malim',
    'kuala nerang': 'Kuala Nerang',
    'kualanerang': 'Kuala Nerang',
    'gemencheh': 'Gemencheh'
  },
  
  /**
   * Content type patterns
   */
  CONTENT_PATTERNS: {
    video: /\b(video|stream|streaming|live|broadcast|recording)\b/i,
    photos: /\b(photo|photos|picture|pictures|gallery|images?|shots?)\b/i,
    both: /\b(coverage|content|media)\b/i
  },
  
  /**
   * Parse incoming Slack webhook payload
   * @param {Object} payload - Slack webhook payload
   * @returns {Object} - Parsed check-in data
   */
  parseWebhook: function(payload) {
    // Handle different Slack payload formats
    const text = payload.text || 
                 payload.message?.text || 
                 payload.event?.text || 
                 '';
    
    const user = payload.user_name || 
                 payload.user?.name || 
                 payload.event?.user || 
                 'unknown';
    
    const channel = payload.channel_name || 
                    payload.channel?.name || 
                    payload.event?.channel || 
                    '';
    
    const timestamp = payload.timestamp || 
                      payload.ts || 
                      new Date().toISOString();
    
    return {
      text: text,
      user: user,
      channel: channel,
      timestamp: timestamp,
      rawPayload: payload
    };
  },
  
  /**
   * Extract venue from message
   * @param {string} text - Message text
   * @returns {string|null} - Venue name or null
   */
  extractVenue: function(text) {
    const lowerText = text.toLowerCase();
    
    for (const [pattern, venue] of Object.entries(this.VENUES)) {
      if (lowerText.includes(pattern)) {
        return venue;
      }
    }
    
    // Try to extract venue from structured format
    // e.g., "Venue: Malim | Status: Photos uploaded"
    const venueMatch = text.match(/venue:\s*([^|,\n]+)/i);
    if (venueMatch) {
      const venueName = venueMatch[1].trim().toLowerCase();
      return this.VENUES[venueName] || null;
    }
    
    return null;
  },
  
  /**
   * Extract content type from message
   * @param {string} text - Message text
   * @returns {string|null} - Content type (video/photos) or null
   */
  extractContentType: function(text) {
    if (this.CONTENT_PATTERNS.video.test(text)) {
      return 'video';
    }
    if (this.CONTENT_PATTERNS.photos.test(text)) {
      return 'photos';
    }
    if (this.CONTENT_PATTERNS.both.test(text)) {
      // Default to photos if generic coverage mentioned
      return 'photos';
    }
    
    return null;
  },
  
  /**
   * Extract additional metadata from message
   * @param {string} text - Message text
   * @returns {Object} - Additional metadata
   */
  extractMetadata: function(text) {
    const metadata = {};
    
    // Extract match info if mentioned
    const matchPattern = /match\s*#?(\d+)|group\s+([A-Z])|([A-Z]\d+)/gi;
    const matchInfo = text.match(matchPattern);
    if (matchInfo) {
      metadata.matchReference = matchInfo[0];
    }
    
    // Extract photographer/videographer name if mentioned
    const creditPattern = /by\s+@?(\w+)|photographer:\s*(\w+)|videographer:\s*(\w+)/i;
    const creditMatch = text.match(creditPattern);
    if (creditMatch) {
      metadata.creditedTo = creditMatch[1] || creditMatch[2] || creditMatch[3];
    }
    
    // Extract urgency/priority
    if (/urgent|asap|priority|important/i.test(text)) {
      metadata.priority = 'high';
    }
    
    // Extract completion status
    if (/complete|done|finished|uploaded|ready/i.test(text)) {
      metadata.status = 'complete';
    } else if (/starting|beginning|preparing/i.test(text)) {
      metadata.status = 'in_progress';
    }
    
    return metadata;
  },
  
  /**
   * Validate and process check-in message
   * @param {Object} webhookData - Parsed webhook data
   * @returns {Object} - Processed check-in data or error
   */
  processCheckIn: function(webhookData) {
    const { text, user, channel, timestamp } = webhookData;
    
    // Extract venue
    const venue = this.extractVenue(text);
    if (!venue) {
      return {
        success: false,
        error: 'VENUE_NOT_FOUND',
        message: 'Could not identify venue from message',
        helpText: `Please mention one of: ${Object.values(this.VENUES).join(', ')}`,
        originalText: text
      };
    }
    
    // Extract content type
    const contentType = this.extractContentType(text);
    if (!contentType) {
      return {
        success: false,
        error: 'CONTENT_TYPE_NOT_FOUND',
        message: 'Could not identify content type (video/photos)',
        helpText: 'Please specify if this is for video streaming or photo gallery',
        originalText: text
      };
    }
    
    // Extract additional metadata
    const metadata = this.extractMetadata(text);
    
    // Build processed check-in data
    return {
      success: true,
      data: {
        venue: venue,
        contentType: contentType,
        user: user,
        channel: channel,
        timestamp: timestamp,
        metadata: metadata,
        source: 'slack',
        originalMessage: text,
        processedAt: new Date().toISOString()
      }
    };
  },
  
  /**
   * Format response for Slack
   * @param {Object} result - Processing result
   * @returns {Object} - Slack-formatted response
   */
  formatResponse: function(result) {
    if (!result.success) {
      return {
        response_type: 'ephemeral',
        text: `❌ Check-in failed: ${result.message}`,
        attachments: [
          {
            color: 'danger',
            text: result.helpText,
            footer: 'CBL Coverage Bot',
            ts: Math.floor(Date.now() / 1000)
          }
        ]
      };
    }
    
    const { data } = result;
    const emoji = data.contentType === 'video' ? '📹' : '📸';
    
    return {
      response_type: 'in_channel',
      text: `✅ Check-in received for ${data.venue}`,
      attachments: [
        {
          color: 'good',
          fields: [
            {
              title: 'Venue',
              value: data.venue,
              short: true
            },
            {
              title: 'Content Type',
              value: `${emoji} ${data.contentType}`,
              short: true
            },
            {
              title: 'Checked in by',
              value: data.user,
              short: true
            },
            {
              title: 'Status',
              value: data.metadata.status || 'Ready',
              short: true
            }
          ],
          footer: 'CBL Coverage System',
          ts: Math.floor(Date.now() / 1000)
        }
      ]
    };
  },
  
  /**
   * Generate help message for Slack
   * @returns {Object} - Slack help message
   */
  getHelpMessage: function() {
    return {
      text: '📋 *CBL Coverage Check-in Guide*',
      attachments: [
        {
          color: '#0080ff',
          pretext: 'How to check in for match coverage:',
          text: 'Send a message mentioning the venue and content type.',
          fields: [
            {
              title: 'Supported Venues',
              value: Object.values(this.VENUES).join(', '),
              short: false
            },
            {
              title: 'Example Messages',
              value: '• "Video streaming ready at Yu Hwa"\n• "Photos uploaded for Malim match"\n• "Starting coverage at Kuala Nerang - photos"',
              short: false
            },
            {
              title: 'Keywords for Video',
              value: 'video, stream, streaming, live, broadcast',
              short: true
            },
            {
              title: 'Keywords for Photos',
              value: 'photo, photos, pictures, gallery, images',
              short: true
            }
          ],
          footer: 'CBL Coverage Bot',
          ts: Math.floor(Date.now() / 1000)
        }
      ]
    };
  }
};

// Export for use in n8n Code nodes
if (typeof module !== 'undefined' && module.exports) {
  module.exports = slackHandler;
}

// Example usage in n8n Code node:
/*
// In the Slack webhook node's code:
const slackHandler = require('./slack-handler.js');

// Parse the incoming webhook
const webhookData = slackHandler.parseWebhook($json);

// Process the check-in
const result = slackHandler.processCheckIn(webhookData);

if (!result.success) {
  // Return error response
  const errorResponse = slackHandler.formatResponse(result);
  throw new Error(JSON.stringify(errorResponse));
}

// Return processed data for next node
return result.data;

// For help command
if ($json.text && $json.text.toLowerCase().includes('help')) {
  return slackHandler.getHelpMessage();
}
*/