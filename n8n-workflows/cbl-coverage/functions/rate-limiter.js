/**
 * Rate Limiter for CBL Coverage Workflow
 * Manages API rate limits for YouTube, Google Drive, and Airtable
 */

// Rate limit configurations
const RATE_LIMITS = {
  youtube: {
    quotaLimit: 10000,          // Daily quota units
    costPerSearch: 100,         // Search API cost
    costPerVideo: 1,            // Video details cost
    maxRequestsPerMinute: 60,
    resetTime: '00:00'          // UTC reset time
  },
  googleDrive: {
    maxRequestsPerSecond: 10,
    maxRequestsPer100Seconds: 1000,
    burstSize: 100
  },
  airtable: {
    maxRequestsPerSecond: 5,
    maxRequestsPerBase: 1000    // Per base per hour
  },
  wordpress: {
    maxRequestsPerMinute: 60,
    maxRequestsPerHour: 1000
  }
};

// Rate limiter implementation for n8n Code node
const rateLimiter = {
  /**
   * Check if API call is allowed based on rate limits
   * @param {string} service - Service name (youtube, googleDrive, airtable, wordpress)
   * @param {Object} staticData - n8n static data object
   * @returns {Object} - { allowed: boolean, waitTime: number, reason: string }
   */
  checkLimit: function(service, staticData) {
    const now = Date.now();
    const limits = RATE_LIMITS[service];
    
    if (!limits) {
      return { allowed: true, waitTime: 0 };
    }
    
    // Get or initialize rate limit data
    const rateLimitData = staticData.rateLimits || {};
    if (!rateLimitData[service]) {
      rateLimitData[service] = {
        requests: [],
        quotaUsed: 0,
        lastReset: now
      };
    }
    
    const serviceData = rateLimitData[service];
    
    // Clean old requests
    this.cleanOldRequests(serviceData, now);
    
    // Check specific service limits
    switch (service) {
      case 'youtube':
        return this.checkYouTubeLimit(serviceData, limits, now);
      case 'googleDrive':
        return this.checkGoogleDriveLimit(serviceData, limits, now);
      case 'airtable':
        return this.checkAirtableLimit(serviceData, limits, now);
      case 'wordpress':
        return this.checkWordPressLimit(serviceData, limits, now);
      default:
        return { allowed: true, waitTime: 0 };
    }
  },
  
  /**
   * Record an API call
   * @param {string} service - Service name
   * @param {Object} staticData - n8n static data object
   * @param {number} cost - API cost (for quota-based limits)
   */
  recordCall: function(service, staticData, cost = 1) {
    const now = Date.now();
    const rateLimitData = staticData.rateLimits || {};
    
    if (!rateLimitData[service]) {
      rateLimitData[service] = {
        requests: [],
        quotaUsed: 0,
        lastReset: now
      };
    }
    
    rateLimitData[service].requests.push({
      timestamp: now,
      cost: cost
    });
    
    if (service === 'youtube') {
      rateLimitData[service].quotaUsed += cost;
    }
    
    staticData.rateLimits = rateLimitData;
  },
  
  /**
   * Clean old requests from tracking
   */
  cleanOldRequests: function(serviceData, now) {
    const oneHourAgo = now - 3600000;
    serviceData.requests = serviceData.requests.filter(
      req => req.timestamp > oneHourAgo
    );
  },
  
  /**
   * Check YouTube specific limits
   */
  checkYouTubeLimit: function(serviceData, limits, now) {
    // Check daily quota reset
    const today = new Date().toISOString().split('T')[0];
    const lastResetDate = new Date(serviceData.lastReset).toISOString().split('T')[0];
    
    if (today !== lastResetDate) {
      serviceData.quotaUsed = 0;
      serviceData.lastReset = now;
    }
    
    // Check quota limit
    if (serviceData.quotaUsed + limits.costPerSearch > limits.quotaLimit) {
      const resetTime = new Date();
      resetTime.setUTCHours(0, 0, 0, 0);
      resetTime.setDate(resetTime.getDate() + 1);
      
      return {
        allowed: false,
        waitTime: resetTime.getTime() - now,
        reason: 'Daily quota exceeded'
      };
    }
    
    // Check rate limit
    const recentRequests = serviceData.requests.filter(
      req => req.timestamp > now - 60000
    );
    
    if (recentRequests.length >= limits.maxRequestsPerMinute) {
      return {
        allowed: false,
        waitTime: 60000 - (now - recentRequests[0].timestamp),
        reason: 'Minute rate limit reached'
      };
    }
    
    return { allowed: true, waitTime: 0 };
  },
  
  /**
   * Check Google Drive specific limits
   */
  checkGoogleDriveLimit: function(serviceData, limits, now) {
    // Check per-second limit
    const oneSecondAgo = now - 1000;
    const requestsLastSecond = serviceData.requests.filter(
      req => req.timestamp > oneSecondAgo
    ).length;
    
    if (requestsLastSecond >= limits.maxRequestsPerSecond) {
      return {
        allowed: false,
        waitTime: 1000,
        reason: 'Per-second rate limit reached'
      };
    }
    
    // Check per-100-seconds limit
    const hundredSecondsAgo = now - 100000;
    const requestsLast100Seconds = serviceData.requests.filter(
      req => req.timestamp > hundredSecondsAgo
    ).length;
    
    if (requestsLast100Seconds >= limits.maxRequestsPer100Seconds) {
      return {
        allowed: false,
        waitTime: 100000 - (now - serviceData.requests[0].timestamp),
        reason: 'Per-100-seconds rate limit reached'
      };
    }
    
    return { allowed: true, waitTime: 0 };
  },
  
  /**
   * Check Airtable specific limits
   */
  checkAirtableLimit: function(serviceData, limits, now) {
    // Check per-second limit
    const oneSecondAgo = now - 1000;
    const requestsLastSecond = serviceData.requests.filter(
      req => req.timestamp > oneSecondAgo
    ).length;
    
    if (requestsLastSecond >= limits.maxRequestsPerSecond) {
      return {
        allowed: false,
        waitTime: 1000,
        reason: 'Per-second rate limit reached'
      };
    }
    
    // Check hourly limit
    const oneHourAgo = now - 3600000;
    const requestsLastHour = serviceData.requests.filter(
      req => req.timestamp > oneHourAgo
    ).length;
    
    if (requestsLastHour >= limits.maxRequestsPerBase) {
      return {
        allowed: false,
        waitTime: 3600000 - (now - serviceData.requests[0].timestamp),
        reason: 'Hourly rate limit reached'
      };
    }
    
    return { allowed: true, waitTime: 0 };
  },
  
  /**
   * Check WordPress specific limits
   */
  checkWordPressLimit: function(serviceData, limits, now) {
    // Check per-minute limit
    const oneMinuteAgo = now - 60000;
    const requestsLastMinute = serviceData.requests.filter(
      req => req.timestamp > oneMinuteAgo
    ).length;
    
    if (requestsLastMinute >= limits.maxRequestsPerMinute) {
      return {
        allowed: false,
        waitTime: 60000 - (now - serviceData.requests[0].timestamp),
        reason: 'Per-minute rate limit reached'
      };
    }
    
    // Check hourly limit
    const oneHourAgo = now - 3600000;
    const requestsLastHour = serviceData.requests.filter(
      req => req.timestamp > oneHourAgo
    ).length;
    
    if (requestsLastHour >= limits.maxRequestsPerHour) {
      return {
        allowed: false,
        waitTime: 3600000 - (now - serviceData.requests[0].timestamp),
        reason: 'Hourly rate limit reached'
      };
    }
    
    return { allowed: true, waitTime: 0 };
  },
  
  /**
   * Get current usage statistics
   */
  getUsageStats: function(staticData) {
    const rateLimitData = staticData.rateLimits || {};
    const stats = {};
    
    for (const [service, data] of Object.entries(rateLimitData)) {
      const now = Date.now();
      const oneMinuteAgo = now - 60000;
      const oneHourAgo = now - 3600000;
      
      stats[service] = {
        requestsLastMinute: data.requests.filter(r => r.timestamp > oneMinuteAgo).length,
        requestsLastHour: data.requests.filter(r => r.timestamp > oneHourAgo).length,
        quotaUsed: data.quotaUsed || 0,
        limits: RATE_LIMITS[service]
      };
    }
    
    return stats;
  }
};

// Export for use in n8n Code nodes
if (typeof module !== 'undefined' && module.exports) {
  module.exports = rateLimiter;
}

// Example usage in n8n Code node:
/*
// Check rate limit before API call
const staticData = $getWorkflowStaticData();
const limitCheck = rateLimiter.checkLimit('youtube', staticData);

if (!limitCheck.allowed) {
  throw new Error(`Rate limit exceeded: ${limitCheck.reason}. Wait ${Math.ceil(limitCheck.waitTime / 1000)} seconds.`);
}

// Make API call...

// Record the call
rateLimiter.recordCall('youtube', staticData, 100); // 100 = search cost
$setWorkflowStaticData(staticData);

// Get usage stats
const stats = rateLimiter.getUsageStats(staticData);
console.log('API Usage:', stats);
*/