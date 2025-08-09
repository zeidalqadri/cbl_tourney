#!/bin/bash

echo "📺 Deploying YouTube Integration to Cloudflare Worker"
echo "===================================================="

# First, let's merge the YouTube functionality into the main worker
cat > coverage-worker-complete.js << 'EOF'
/**
 * Cloudflare Worker for CBL Coverage with YouTube Integration
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': 'https://cbl-tourney.pages.dev',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // YouTube routes
      if (url.pathname === '/api/youtube/live') {
        const streams = await getLiveStreams(env);
        return jsonResponse({ live: streams }, corsHeaders);
      }
      
      if (url.pathname === '/api/youtube/recent') {
        const pageToken = url.searchParams.get('pageToken');
        const data = await getRecentVideos(env, pageToken);
        return jsonResponse(data, corsHeaders);
      }
      
      if (url.pathname.startsWith('/api/youtube/venue/')) {
        const venue = decodeURIComponent(url.pathname.split('/').pop());
        const videos = await getVenueVideos(env, venue);
        return jsonResponse({ videos }, corsHeaders);
      }
      
      if (url.pathname === '/api/youtube/search') {
        const query = url.searchParams.get('q');
        if (!query) {
          return jsonResponse({ error: 'Query required' }, corsHeaders, 400);
        }
        const videos = await searchMatchVideos(env, query);
        return jsonResponse({ videos }, corsHeaders);
      }

      // Existing coverage routes
      switch (url.pathname) {
        case '/api/coverage':
          return handleGetCoverage(env, corsHeaders);
        case '/api/coverage/update':
          return handleUpdateCoverage(request, env, corsHeaders);
        case '/api/coverage/webhook':
          return handleAirtableWebhook(request, env, corsHeaders);
        default:
          return new Response('Not found', { status: 404, headers: corsHeaders });
      }
    } catch (error) {
      return jsonResponse({ error: error.message }, corsHeaders, 500);
    }
  }
};

// Helper function for JSON responses
function jsonResponse(data, headers, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' }
  });
}

// YouTube API functions
async function getLiveStreams(env) {
  const cacheKey = 'youtube:live:streams';
  const cached = await env.COVERAGE_KV.get(cacheKey, 'json');
  
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }

  try {
    const url = new URL('https://www.googleapis.com/youtube/v3/search');
    url.searchParams.set('key', env.YOUTUBE_API_KEY);
    url.searchParams.set('channelId', env.YOUTUBE_CHANNEL_ID);
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('type', 'video');
    url.searchParams.set('eventType', 'live');
    url.searchParams.set('maxResults', '10');
    url.searchParams.set('order', 'date');

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) throw new Error(data.error?.message || 'YouTube API error');

    const liveStreams = data.items.map(item => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.high.url,
      publishedAt: item.snippet.publishedAt,
      isLive: true,
      venue: extractVenueFromTitle(item.snippet.title),
      matchInfo: extractMatchInfo(item.snippet.title),
      embedUrl: `https://www.youtube.com/embed/${item.id.videoId}?autoplay=1`,
      watchUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`
    }));

    await env.COVERAGE_KV.put(cacheKey, JSON.stringify({
      data: liveStreams,
      expires: Date.now() + 300000 // 5 min cache
    }));

    return liveStreams;
  } catch (error) {
    console.error('Error fetching live streams:', error);
    return [];
  }
}

async function getRecentVideos(env, pageToken = null) {
  const cacheKey = `youtube:recent:${pageToken || 'first'}`;
  const cached = await env.COVERAGE_KV.get(cacheKey, 'json');
  
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }

  try {
    const url = new URL('https://www.googleapis.com/youtube/v3/search');
    url.searchParams.set('key', env.YOUTUBE_API_KEY);
    url.searchParams.set('channelId', env.YOUTUBE_CHANNEL_ID);
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('type', 'video');
    url.searchParams.set('maxResults', '50');
    url.searchParams.set('order', 'date');
    
    if (pageToken) url.searchParams.set('pageToken', pageToken);

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) throw new Error(data.error?.message || 'YouTube API error');

    const videos = data.items.map(item => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.high.url,
      publishedAt: item.snippet.publishedAt,
      venue: extractVenueFromTitle(item.snippet.title),
      matchInfo: extractMatchInfo(item.snippet.title),
      embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`,
      watchUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`
    }));

    const result = {
      videos: videos,
      nextPageToken: data.nextPageToken || null,
      totalResults: data.pageInfo.totalResults
    };

    await env.COVERAGE_KV.put(cacheKey, JSON.stringify({
      data: result,
      expires: Date.now() + 300000
    }));

    return result;
  } catch (error) {
    console.error('Error fetching videos:', error);
    return { videos: [], nextPageToken: null, totalResults: 0 };
  }
}

async function getVenueVideos(env, venue) {
  const cacheKey = `youtube:venue:${venue.toLowerCase().replace(/\s+/g, '-')}`;
  const cached = await env.COVERAGE_KV.get(cacheKey, 'json');
  
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }

  try {
    const url = new URL('https://www.googleapis.com/youtube/v3/search');
    url.searchParams.set('key', env.YOUTUBE_API_KEY);
    url.searchParams.set('channelId', env.YOUTUBE_CHANNEL_ID);
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('type', 'video');
    url.searchParams.set('q', venue);
    url.searchParams.set('maxResults', '20');
    url.searchParams.set('order', 'date');

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) throw new Error(data.error?.message || 'YouTube API error');

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

    await env.COVERAGE_KV.put(cacheKey, JSON.stringify({
      data: videos,
      expires: Date.now() + 300000
    }));

    return videos;
  } catch (error) {
    console.error('Error fetching venue videos:', error);
    return [];
  }
}

async function searchMatchVideos(env, query) {
  const cacheKey = `youtube:search:${query.toLowerCase().replace(/\s+/g, '-')}`;
  const cached = await env.COVERAGE_KV.get(cacheKey, 'json');
  
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }

  try {
    const url = new URL('https://www.googleapis.com/youtube/v3/search');
    url.searchParams.set('key', env.YOUTUBE_API_KEY);
    url.searchParams.set('channelId', env.YOUTUBE_CHANNEL_ID);
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('type', 'video');
    url.searchParams.set('q', query);
    url.searchParams.set('maxResults', '10');

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) throw new Error(data.error?.message || 'YouTube API error');

    const videos = data.items.map(item => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.medium.url,
      publishedAt: item.snippet.publishedAt,
      embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`,
      watchUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`
    }));

    await env.COVERAGE_KV.put(cacheKey, JSON.stringify({
      data: videos,
      expires: Date.now() + 300000
    }));

    return videos;
  } catch (error) {
    console.error('Error searching videos:', error);
    return [];
  }
}

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

// Existing coverage functions
async function handleGetCoverage(env, corsHeaders) {
  const venues = ['yu-hwa', 'malim', 'kuala-nerang', 'gemencheh'];
  const coverage = {};
  
  for (const venue of venues) {
    const data = await env.COVERAGE_KV.get(venue, 'json');
    coverage[venue] = data || {
      status: 'waiting',
      contentType: null,
      lastUpdated: null,
      updatedBy: null
    };
  }
  
  return jsonResponse(coverage, corsHeaders);
}

async function handleUpdateCoverage(request, env, corsHeaders) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }
  
  const data = await request.json();
  const { venue, contentType, status, updatedBy } = data;
  
  if (!venue || !contentType) {
    return jsonResponse({ error: 'Missing required fields' }, corsHeaders, 400);
  }
  
  const venueKey = venue.toLowerCase().replace(/\s+/g, '-');
  
  const coverageData = {
    venue: venue,
    status: status || (contentType === 'video' ? 'video-ready' : 'photos-ready'),
    contentType: contentType,
    lastUpdated: new Date().toISOString(),
    updatedBy: updatedBy || 'api',
    videoUrl: data.videoUrl || null,
    embedUrl: data.embedUrl || null,
    galleryUrl: data.galleryUrl || null,
    thumbnail: data.thumbnail || null,
    photoCount: data.photoCount || 0
  };
  
  await env.COVERAGE_KV.put(venueKey, JSON.stringify(coverageData), {
    expirationTtl: 86400
  });
  
  const logKey = `log:${venueKey}:${Date.now()}`;
  await env.COVERAGE_KV.put(logKey, JSON.stringify(coverageData), {
    expirationTtl: 604800
  });
  
  return jsonResponse({ success: true, data: coverageData }, corsHeaders);
}

async function handleAirtableWebhook(request, env, corsHeaders) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }
  
  const webhook = await request.json();
  const record = webhook.record || webhook;
  const fields = record.fields || record;
  
  const updateData = {
    venue: fields.venue,
    contentType: fields.content_type,
    status: fields.status,
    updatedBy: fields.updated_by || 'airtable'
  };
  
  const updateRequest = new Request(request.url.replace('/webhook', '/update'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateData)
  });
  
  return handleUpdateCoverage(updateRequest, env, corsHeaders);
}
EOF

echo "✅ Worker code updated with YouTube integration"
echo ""
echo "📝 Next steps:"
echo "1. Set your YouTube channel ID in wrangler.toml"
echo "2. Add your YouTube API key as a secret:"
echo "   npx wrangler secret put YOUTUBE_API_KEY"
echo "3. Deploy the updated worker:"
echo "   npx wrangler deploy"
echo ""
echo "Make sure to update wrangler.toml with your channel ID!"