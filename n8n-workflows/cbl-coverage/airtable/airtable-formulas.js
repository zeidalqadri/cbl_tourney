/**
 * Airtable Formula Fields for CBL Coverage
 * Copy these formulas when creating computed fields
 */

const airtableFormulas = {
  // Shows how long since last update in human-readable format
  time_since_update: `
    IF(
      last_updated,
      IF(
        DATETIME_DIFF(NOW(), last_updated, 'hours') >= 24,
        DATETIME_DIFF(NOW(), last_updated, 'days') & ' days ago',
        IF(
          DATETIME_DIFF(NOW(), last_updated, 'hours') >= 1,
          DATETIME_DIFF(NOW(), last_updated, 'hours') & ' hours ago',
          DATETIME_DIFF(NOW(), last_updated, 'minutes') & ' minutes ago'
        )
      ),
      'Never'
    )
  `,

  // Alert if processing is delayed
  needs_attention: `
    IF(
      AND(
        status_changed = TRUE(),
        processed = FALSE(),
        DATETIME_DIFF(NOW(), last_updated, 'minutes') > 10
      ),
      '⚠️ Delayed',
      IF(
        AND(status_changed = TRUE(), processed = FALSE()),
        '⏳ Processing',
        '✅ OK'
      )
    )
  `,

  // Current coverage status with emoji
  coverage_status: `
    IF(
      OR(status = 'Video Ready', status = 'Photos Uploaded'),
      IF(
        content_type = 'video',
        '🔴 LIVE',
        '📸 Gallery Available'
      ),
      IF(
        status = 'Stream Unavailable',
        '📡 Offline',
        '⏰ Waiting'
      )
    )
  `,

  // Processing queue position
  queue_position: `
    IF(
      AND(status_changed = TRUE(), processed = FALSE()),
      'In Queue (#' & 
      COUNTALL(
        FILTER(venue_status, 
          AND(
            {status_changed} = TRUE(), 
            {processed} = FALSE(),
            CREATED_TIME() <= CREATED_TIME(THIS())
          )
        )
      ) & ')',
      '-'
    )
  `,

  // Match day indicator (for weekend matches)
  is_match_day: `
    IF(
      OR(
        WEEKDAY(TODAY()) = 5,  // Friday
        WEEKDAY(TODAY()) = 6,  // Saturday
        WEEKDAY(TODAY()) = 0   // Sunday
      ),
      '🏏 Match Day',
      'Practice Day'
    )
  `,

  // Content freshness indicator
  content_freshness: `
    IF(
      NOT(last_updated),
      'No content',
      IF(
        DATETIME_DIFF(NOW(), last_updated, 'minutes') <= 30,
        '🟢 Fresh',
        IF(
          DATETIME_DIFF(NOW(), last_updated, 'hours') <= 2,
          '🟡 Recent',
          '🔴 Stale'
        )
      )
    )
  `,

  // API sync status
  sync_status: `
    CONCATENATE(
      IF(status_changed, '📤 ', ''),
      IF(processed, '✓ Synced', '⏳ Pending'),
      IF(
        workflow_run_id,
        ' (' & RIGHT(workflow_run_id, 4) & ')',
        ''
      )
    )
  `,

  // Priority calculation for processing order
  processing_priority: `
    (
      IF(content_type = 'video', 10, 5) +
      IF(
        DATETIME_DIFF(NOW(), last_updated, 'minutes') > 5,
        DATETIME_DIFF(NOW(), last_updated, 'minutes'),
        0
      ) +
      IF(
        OR(
          WEEKDAY(TODAY()) = 5,
          WEEKDAY(TODAY()) = 6,
          WEEKDAY(TODAY()) = 0
        ),
        20,
        0
      )
    )
  `
};

// View filters for Airtable
const airtableViews = {
  // Pending updates that need processing
  "🔄 Pending Updates": {
    filter: "AND({status_changed} = TRUE(), {processed} = FALSE())",
    sort: [
      { field: "processing_priority", direction: "desc" },
      { field: "last_updated", direction: "asc" }
    ]
  },

  // Live content currently active
  "🔴 Live Now": {
    filter: "OR({status} = 'Video Ready', {status} = 'Photos Uploaded')",
    sort: [
      { field: "content_type", direction: "asc" },
      { field: "venue", direction: "asc" }
    ]
  },

  // Recent activity log
  "📊 Recent Activity": {
    filter: "DATETIME_DIFF(NOW(), {last_updated}, 'hours') <= 24",
    sort: [
      { field: "last_updated", direction: "desc" }
    ]
  },

  // Errors and issues
  "⚠️ Needs Attention": {
    filter: "OR({needs_attention} = '⚠️ Delayed', {status} = 'Stream Unavailable')",
    sort: [
      { field: "last_updated", direction: "asc" }
    ]
  },

  // By venue grouping
  "🏟️ By Venue": {
    groupBy: "venue",
    sort: [
      { field: "venue", direction: "asc" },
      { field: "last_updated", direction: "desc" }
    ]
  }
};

// Automation suggestions for Airtable
const airtableAutomations = {
  // Alert on delayed processing
  delayedProcessingAlert: {
    trigger: "When record matches conditions",
    conditions: [
      "status_changed = TRUE",
      "processed = FALSE", 
      "DATETIME_DIFF(NOW(), last_updated, 'minutes') > 15"
    ],
    action: "Send Slack message",
    message: "⚠️ Coverage update for {venue} has been pending for over 15 minutes"
  },

  // Reset daily flags
  dailyReset: {
    trigger: "At scheduled time",
    time: "12:00 AM",
    action: "Update records",
    updates: {
      "status_changed": false,
      "status": "Ready"
    },
    condition: "processed = TRUE AND DATETIME_DIFF(NOW(), last_updated, 'hours') > 24"
  },

  // Archive old records
  archiveOldRecords: {
    trigger: "At scheduled time",
    time: "2:00 AM Sunday",
    action: "Update records",
    updates: {
      "archived": true
    },
    condition: "DATETIME_DIFF(NOW(), last_updated, 'days') > 7"
  }
};

// Export for reference
module.exports = {
  airtableFormulas,
  airtableViews,
  airtableAutomations
};