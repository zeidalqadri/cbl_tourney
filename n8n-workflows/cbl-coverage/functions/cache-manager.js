/**
 * Cache Manager for CBL Coverage Workflow
 * Implements intelligent caching to minimize API calls
 */

const cacheManager = {
  /**
   * Default TTL values for different content types (in milliseconds)
   */
  TTL: {
    youtube_live: 300000,        // 5 minutes for live streams
    youtube_video: 3600000,      // 1 hour for regular videos
    google_photos: 180000,       // 3 minutes for photo galleries
    airtable_status: 60000,      // 1 minute for status checks
    wordpress_response: 600000,  // 10 minutes for WP responses
    error_response: 30000        // 30 seconds for error states
  },
  
  /**
   * Generate cache key
   * @param {string} type - Cache type (youtube, photos, etc.)
   * @param {string} venue - Venue name
   * @param {Object} params - Additional parameters for key generation
   * @returns {string} - Cache key
   */
  generateKey: function(type, venue, params = {}) {
    const baseKey = `${type}_${venue.toLowerCase().replace(/\s+/g, '_')}`;
    const date = new Date().toISOString().split('T')[0];
    
    // Add additional parameters to key
    const paramString = Object.entries(params)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => `${key}:${value}`)
      .join('_');
    
    return paramString ? `${baseKey}_${date}_${paramString}` : `${baseKey}_${date}`;
  },
  
  /**
   * Get cached data
   * @param {string} key - Cache key
   * @param {Object} staticData - n8n static data object
   * @returns {Object|null} - Cached data or null if expired/not found
   */
  get: function(key, staticData) {
    const cache = staticData.cache || {};
    const cached = cache[key];
    
    if (!cached) {
      return null;
    }
    
    // Check if cache has expired
    if (cached.expires && cached.expires < Date.now()) {
      // Clean up expired cache
      delete cache[key];
      staticData.cache = cache;
      return null;
    }
    
    // Update hit count for analytics
    cached.hits = (cached.hits || 0) + 1;
    cached.lastAccessed = Date.now();
    
    return {
      data: cached.data,
      metadata: {
        cached: true,
        cachedAt: cached.timestamp,
        hits: cached.hits,
        ttlRemaining: cached.expires - Date.now()
      }
    };
  },
  
  /**
   * Set cache data
   * @param {string} key - Cache key
   * @param {*} data - Data to cache
   * @param {Object} staticData - n8n static data object
   * @param {number} ttl - Time to live in milliseconds (optional)
   */
  set: function(key, data, staticData, ttl = null) {
    const cache = staticData.cache || {};
    
    // Determine TTL based on key pattern if not provided
    if (!ttl) {
      if (key.includes('youtube_live')) ttl = this.TTL.youtube_live;
      else if (key.includes('youtube')) ttl = this.TTL.youtube_video;
      else if (key.includes('photos')) ttl = this.TTL.google_photos;
      else if (key.includes('airtable')) ttl = this.TTL.airtable_status;
      else if (key.includes('error')) ttl = this.TTL.error_response;
      else ttl = 300000; // Default 5 minutes
    }
    
    cache[key] = {
      data: data,
      timestamp: Date.now(),
      expires: Date.now() + ttl,
      hits: 0,
      ttl: ttl
    };
    
    // Implement cache size limit (keep last 100 entries)
    const keys = Object.keys(cache);
    if (keys.length > 100) {
      // Sort by last accessed time and remove oldest
      const sortedKeys = keys.sort((a, b) => {
        const aTime = cache[a].lastAccessed || cache[a].timestamp;
        const bTime = cache[b].lastAccessed || cache[b].timestamp;
        return aTime - bTime;
      });
      
      // Remove oldest 20% of cache
      const toRemove = Math.floor(keys.length * 0.2);
      for (let i = 0; i < toRemove; i++) {
        delete cache[sortedKeys[i]];
      }
    }
    
    staticData.cache = cache;
  },
  
  /**
   * Invalidate cache entries
   * @param {string|RegExp} pattern - Key pattern to match
   * @param {Object} staticData - n8n static data object
   * @returns {number} - Number of entries invalidated
   */
  invalidate: function(pattern, staticData) {
    const cache = staticData.cache || {};
    let invalidated = 0;
    
    for (const key of Object.keys(cache)) {
      if (pattern instanceof RegExp) {
        if (pattern.test(key)) {
          delete cache[key];
          invalidated++;
        }
      } else if (typeof pattern === 'string') {
        if (key.includes(pattern)) {
          delete cache[key];
          invalidated++;
        }
      }
    }
    
    staticData.cache = cache;
    return invalidated;
  },
  
  /**
   * Clear all cache
   * @param {Object} staticData - n8n static data object
   */
  clear: function(staticData) {
    staticData.cache = {};
  },
  
  /**
   * Get cache statistics
   * @param {Object} staticData - n8n static data object
   * @returns {Object} - Cache statistics
   */
  getStats: function(staticData) {
    const cache = staticData.cache || {};
    const now = Date.now();
    
    const stats = {
      totalEntries: Object.keys(cache).length,
      totalSize: JSON.stringify(cache).length,
      byType: {},
      oldestEntry: null,
      newestEntry: null,
      mostAccessed: null,
      expiringNext: null
    };
    
    let oldestTime = Infinity;
    let newestTime = 0;
    let maxHits = 0;
    let nextExpiry = Infinity;
    
    for (const [key, entry] of Object.entries(cache)) {
      // Categorize by type
      const type = key.split('_')[0];
      if (!stats.byType[type]) {
        stats.byType[type] = { count: 0, hits: 0, size: 0 };
      }
      stats.byType[type].count++;
      stats.byType[type].hits += entry.hits || 0;
      stats.byType[type].size += JSON.stringify(entry).length;
      
      // Find oldest/newest
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        stats.oldestEntry = { key, age: now - entry.timestamp };
      }
      if (entry.timestamp > newestTime) {
        newestTime = entry.timestamp;
        stats.newestEntry = { key, age: now - entry.timestamp };
      }
      
      // Find most accessed
      if (entry.hits > maxHits) {
        maxHits = entry.hits;
        stats.mostAccessed = { key, hits: entry.hits };
      }
      
      // Find next to expire
      if (entry.expires && entry.expires < nextExpiry) {
        nextExpiry = entry.expires;
        stats.expiringNext = { key, expiresIn: entry.expires - now };
      }
    }
    
    return stats;
  },
  
  /**
   * Smart cache warming - pre-fetch likely needed data
   * @param {Array} venues - List of venues to warm cache for
   * @param {Object} staticData - n8n static data object
   */
  warmCache: function(venues, staticData) {
    const warmed = [];
    
    for (const venue of venues) {
      // Generate keys for different content types
      const keys = [
        this.generateKey('youtube', venue),
        this.generateKey('photos', venue),
        this.generateKey('airtable_status', venue)
      ];
      
      // Check if any of these are missing or about to expire
      for (const key of keys) {
        const cached = this.get(key, staticData);
        if (!cached || (cached.metadata.ttlRemaining < 60000)) {
          warmed.push({ venue, type: key.split('_')[0], needsRefresh: true });
        }
      }
    }
    
    return warmed;
  }
};

// Export for use in n8n Code nodes
if (typeof module !== 'undefined' && module.exports) {
  module.exports = cacheManager;
}

// Example usage in n8n Code node:
/*
// Get from cache
const staticData = $getWorkflowStaticData();
const cacheKey = cacheManager.generateKey('youtube', venue, { live: true });
const cached = cacheManager.get(cacheKey, staticData);

if (cached) {
  return {
    ...cached.data,
    _metadata: cached.metadata
  };
}

// Make API call...
const apiResult = await fetchYouTubeData();

// Store in cache
cacheManager.set(cacheKey, apiResult, staticData);
$setWorkflowStaticData(staticData);

// Get cache stats
const stats = cacheManager.getStats(staticData);
console.log('Cache Stats:', stats);

// Invalidate venue cache when content changes
const invalidated = cacheManager.invalidate(venue, staticData);
console.log(`Invalidated ${invalidated} cache entries for ${venue}`);
*/