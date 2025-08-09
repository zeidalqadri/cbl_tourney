/**
 * Cloudflare Worker for CBL Coverage Updates with YouTube Integration
 * Deploy this as a Worker and bind it to KV namespace
 */

import { YouTubeHandlers } from './youtube-worker.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // CORS headers for your Pages site
    const corsHeaders = {
      'Access-Control-Allow-Origin': 'https://cbl-tourney.pages.dev',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Handle YouTube routes
      if (url.pathname.startsWith('/api/youtube/')) {
        return handleYouTubeRoute(request, env, url, corsHeaders);
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
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};

// Handle YouTube API routes
async function handleYouTubeRoute(request, env, url, corsHeaders) {
  const path = url.pathname;

  // Live streams
  if (path === '/api/youtube/live') {
    const streams = await YouTubeHandlers.getLiveStreams(env);
    return new Response(JSON.stringify({ live: streams }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Recent videos
  if (path === '/api/youtube/recent') {
    const pageToken = url.searchParams.get('pageToken');
    const data = await YouTubeHandlers.getRecentVideos(env, pageToken);
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Venue videos
  const venueMatch = path.match(/^\/api\/youtube\/venue\/(.+)$/);
  if (venueMatch) {
    const venue = decodeURIComponent(venueMatch[1]);
    const videos = await YouTubeHandlers.getVenueVideos(env, venue);
    return new Response(JSON.stringify({ videos }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Search videos
  if (path === '/api/youtube/search') {
    const query = url.searchParams.get('q');
    if (!query) {
      return new Response(JSON.stringify({ error: 'Query parameter required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    const videos = await YouTubeHandlers.searchMatchVideos(env, query);
    return new Response(JSON.stringify({ videos }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  return new Response('Not found', { status: 404, headers: corsHeaders });
}

// Get all venue coverage status
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
  
  return new Response(JSON.stringify(coverage), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Update coverage for a specific venue
async function handleUpdateCoverage(request, env, corsHeaders) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }
  
  const data = await request.json();
  const { venue, contentType, status, updatedBy } = data;
  
  if (!venue || !contentType) {
    return new Response('Missing required fields', { status: 400, headers: corsHeaders });
  }
  
  // Normalize venue name
  const venueKey = venue.toLowerCase().replace(/\s+/g, '-');
  
  // Prepare coverage data
  const coverageData = {
    venue: venue,
    status: status || (contentType === 'video' ? 'video-ready' : 'photos-ready'),
    contentType: contentType,
    lastUpdated: new Date().toISOString(),
    updatedBy: updatedBy || 'api',
    
    // Add media URLs if provided
    videoUrl: data.videoUrl || null,
    embedUrl: data.embedUrl || null,
    galleryUrl: data.galleryUrl || null,
    thumbnail: data.thumbnail || null,
    photoCount: data.photoCount || 0
  };
  
  // Store in KV
  await env.COVERAGE_KV.put(venueKey, JSON.stringify(coverageData), {
    expirationTtl: 86400 // 24 hours
  });
  
  // Also store in a log for history
  const logKey = `log:${venueKey}:${Date.now()}`;
  await env.COVERAGE_KV.put(logKey, JSON.stringify(coverageData), {
    expirationTtl: 604800 // 7 days
  });
  
  return new Response(JSON.stringify({ success: true, data: coverageData }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Handle webhook from Airtable
async function handleAirtableWebhook(request, env, corsHeaders) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }
  
  const webhook = await request.json();
  
  // Airtable webhook format
  const record = webhook.record || webhook;
  const fields = record.fields || record;
  
  // Map Airtable fields to our format
  const updateData = {
    venue: fields.venue,
    contentType: fields.content_type,
    status: fields.status,
    updatedBy: fields.updated_by || 'airtable'
  };
  
  // Forward to update handler
  const updateRequest = new Request(request.url.replace('/webhook', '/update'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateData)
  });
  
  return handleUpdateCoverage(updateRequest, env, corsHeaders);
}

// YouTube helper functions (from youtube-worker.js)
const YOUTUBE_CONFIG = {
  CACHE_TTL: 300, // 5 minutes cache
  MAX_RESULTS: 50
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