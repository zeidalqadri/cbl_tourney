/**
 * YouTube Integration for CBL Coverage Worker
 * Add this to your existing coverage-worker.js or deploy as separate worker
 */

// YouTube API configuration
const YOUTUBE_CONFIG = {
  API_KEY: '', // Will be set from environment
  CHANNEL_ID: '', // Your YouTube channel ID
  CACHE_TTL: 300, // 5 minutes cache
  MAX_RESULTS: 50
};

// Main YouTube handler functions
export const YouTubeHandlers = {
  // Get live streams
  async getLiveStreams(env) {
    const cacheKey = 'youtube:live:streams';
    
    // Check cache first
    const cached = await env.COVERAGE_KV.get(cacheKey, 'json');
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }

    try {
      // Search for live videos
      const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
      searchUrl.searchParams.append('key', env.YOUTUBE_API_KEY || YOUTUBE_CONFIG.API_KEY);
      searchUrl.searchParams.append('channelId', env.YOUTUBE_CHANNEL_ID || YOUTUBE_CONFIG.CHANNEL_ID);
      searchUrl.searchParams.append('part', 'snippet');
      searchUrl.searchParams.append('type', 'video');
      searchUrl.searchParams.append('eventType', 'live');
      searchUrl.searchParams.append('maxResults', '10');
      searchUrl.searchParams.append('order', 'date');

      const response = await fetch(searchUrl);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'YouTube API error');
      }

      const liveStreams = data.items.map(item => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.high.url,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        isLive: true,
        venue: extractVenueFromTitle(item.snippet.title),
        matchInfo: extractMatchInfo(item.snippet.title),
        embedUrl: `https://www.youtube.com/embed/${item.id.videoId}?autoplay=1`,
        watchUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`
      }));

      // Cache the results
      await env.COVERAGE_KV.put(cacheKey, JSON.stringify({
        data: liveStreams,
        expires: Date.now() + (YOUTUBE_CONFIG.CACHE_TTL * 1000)
      }));

      return liveStreams;
    } catch (error) {
      console.error('Error fetching live streams:', error);
      return [];
    }
  },

  // Get recent videos (past matches)
  async getRecentVideos(env, pageToken = null) {
    const cacheKey = `youtube:recent:${pageToken || 'first'}`;
    
    // Check cache
    const cached = await env.COVERAGE_KV.get(cacheKey, 'json');
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }

    try {
      const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
      searchUrl.searchParams.append('key', env.YOUTUBE_API_KEY || YOUTUBE_CONFIG.API_KEY);
      searchUrl.searchParams.append('channelId', env.YOUTUBE_CHANNEL_ID || YOUTUBE_CONFIG.CHANNEL_ID);
      searchUrl.searchParams.append('part', 'snippet');
      searchUrl.searchParams.append('type', 'video');
      searchUrl.searchParams.append('maxResults', YOUTUBE_CONFIG.MAX_RESULTS.toString());
      searchUrl.searchParams.append('order', 'date');
      
      if (pageToken) {
        searchUrl.searchParams.append('pageToken', pageToken);
      }

      const response = await fetch(searchUrl);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'YouTube API error');
      }

      const videos = data.items.map(item => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.high.url,
        publishedAt: item.snippet.publishedAt,
        venue: extractVenueFromTitle(item.snippet.title),
        matchInfo: extractMatchInfo(item.snippet.title),
        duration: null, // Would need another API call to get duration
        embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`,
        watchUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`
      }));

      const result = {
        videos: videos,
        nextPageToken: data.nextPageToken || null,
        totalResults: data.pageInfo.totalResults
      };

      // Cache results
      await env.COVERAGE_KV.put(cacheKey, JSON.stringify({
        data: result,
        expires: Date.now() + (YOUTUBE_CONFIG.CACHE_TTL * 1000)
      }));

      return result;
    } catch (error) {
      console.error('Error fetching recent videos:', error);
      return { videos: [], nextPageToken: null, totalResults: 0 };
    }
  },

  // Get videos for specific venue
  async getVenueVideos(env, venue) {
    const cacheKey = `youtube:venue:${venue.toLowerCase().replace(/\s+/g, '-')}`;
    
    const cached = await env.COVERAGE_KV.get(cacheKey, 'json');
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }

    try {
      const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
      searchUrl.searchParams.append('key', env.YOUTUBE_API_KEY || YOUTUBE_CONFIG.API_KEY);
      searchUrl.searchParams.append('channelId', env.YOUTUBE_CHANNEL_ID || YOUTUBE_CONFIG.CHANNEL_ID);
      searchUrl.searchParams.append('part', 'snippet');
      searchUrl.searchParams.append('type', 'video');
      searchUrl.searchParams.append('q', venue); // Search for venue in title
      searchUrl.searchParams.append('maxResults', '20');
      searchUrl.searchParams.append('order', 'date');

      const response = await fetch(searchUrl);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'YouTube API error');
      }

      const videos = data.items
        .filter(item => item.snippet.title.toLowerCase().includes(venue.toLowerCase()))
        .map(item => ({
          videoId: item.id.videoId,
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails.medium.url,
          publishedAt: item.snippet.publishedAt,
          matchInfo: extractMatchInfo(item.snippet.title),
          embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`,
          watchUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`
        }));

      // Cache results
      await env.COVERAGE_KV.put(cacheKey, JSON.stringify({
        data: videos,
        expires: Date.now() + (YOUTUBE_CONFIG.CACHE_TTL * 1000)
      }));

      return videos;
    } catch (error) {
      console.error('Error fetching venue videos:', error);
      return [];
    }
  },

  // Search videos by match details
  async searchMatchVideos(env, query) {
    const cacheKey = `youtube:search:${query.toLowerCase().replace(/\s+/g, '-')}`;
    
    const cached = await env.COVERAGE_KV.get(cacheKey, 'json');
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }

    try {
      const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
      searchUrl.searchParams.append('key', env.YOUTUBE_API_KEY || YOUTUBE_CONFIG.API_KEY);
      searchUrl.searchParams.append('channelId', env.YOUTUBE_CHANNEL_ID || YOUTUBE_CONFIG.CHANNEL_ID);
      searchUrl.searchParams.append('part', 'snippet');
      searchUrl.searchParams.append('type', 'video');
      searchUrl.searchParams.append('q', query);
      searchUrl.searchParams.append('maxResults', '10');

      const response = await fetch(searchUrl);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'YouTube API error');
      }

      const videos = data.items.map(item => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium.url,
        publishedAt: item.snippet.publishedAt,
        relevance: calculateRelevance(query, item.snippet.title),
        embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`,
        watchUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`
      }));

      // Sort by relevance
      videos.sort((a, b) => b.relevance - a.relevance);

      // Cache results
      await env.COVERAGE_KV.put(cacheKey, JSON.stringify({
        data: videos,
        expires: Date.now() + (YOUTUBE_CONFIG.CACHE_TTL * 1000)
      }));

      return videos;
    } catch (error) {
      console.error('Error searching videos:', error);
      return [];
    }
  }
};

// Helper functions
function extractVenueFromTitle(title) {
  const venues = ['Yu Hwa', 'Malim', 'Kuala Nerang', 'Gemencheh'];
  for (const venue of venues) {
    if (title.toLowerCase().includes(venue.toLowerCase())) {
      return venue;
    }
  }
  return null;
}

function extractMatchInfo(title) {
  // Extract match number, teams, division etc from title
  // Example: "Match #23 - Team A vs Team B - Boys Division @ Yu Hwa"
  const matchNumberMatch = title.match(/match\s*#?(\d+)/i);
  const teamsMatch = title.match(/(.+?)\s*vs\s*(.+?)(?:\s*-|\s*@|\s*\|)/i);
  const divisionMatch = title.match(/(boys|girls)/i);

  return {
    matchNumber: matchNumberMatch ? parseInt(matchNumberMatch[1]) : null,
    teams: teamsMatch ? {
      teamA: teamsMatch[1].trim(),
      teamB: teamsMatch[2].trim()
    } : null,
    division: divisionMatch ? divisionMatch[1].toLowerCase() : null
  };
}

function calculateRelevance(query, title) {
  const queryWords = query.toLowerCase().split(/\s+/);
  const titleWords = title.toLowerCase().split(/\s+/);
  
  let score = 0;
  for (const queryWord of queryWords) {
    if (titleWords.includes(queryWord)) {
      score += 2;
    } else if (titleWords.some(word => word.includes(queryWord))) {
      score += 1;
    }
  }
  
  return score;
}

// Add these routes to your worker
export function addYouTubeRoutes(router) {
  // Get live streams
  router.get('/api/youtube/live', async (request, env) => {
    const streams = await YouTubeHandlers.getLiveStreams(env);
    return new Response(JSON.stringify({ live: streams }), {
      headers: { 'Content-Type': 'application/json' }
    });
  });

  // Get recent videos
  router.get('/api/youtube/recent', async (request, env) => {
    const url = new URL(request.url);
    const pageToken = url.searchParams.get('pageToken');
    const data = await YouTubeHandlers.getRecentVideos(env, pageToken);
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' }
    });
  });

  // Get venue videos
  router.get('/api/youtube/venue/:venue', async (request, env, params) => {
    const videos = await YouTubeHandlers.getVenueVideos(env, params.venue);
    return new Response(JSON.stringify({ videos }), {
      headers: { 'Content-Type': 'application/json' }
    });
  });

  // Search videos
  router.get('/api/youtube/search', async (request, env) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('q');
    if (!query) {
      return new Response(JSON.stringify({ error: 'Query parameter required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    const videos = await YouTubeHandlers.searchMatchVideos(env, query);
    return new Response(JSON.stringify({ videos }), {
      headers: { 'Content-Type': 'application/json' }
    });
  });
}