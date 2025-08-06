// Cloudflare Worker to properly access Everything CBL YouTube channel
// This should replace or fix the existing cbl-coverage-api.zeidalqadri.workers.dev

// Everything CBL Channel ID (from the URL in your screenshot)
const EVERYTHING_CBL_CHANNEL_ID = 'UCSTjgKoXJT41KMsqKnOTxZQ'; // Update with correct ID
const YOUTUBE_API_KEY = 'YOUR_YOUTUBE_API_KEY'; // Needs to be set in Worker environment

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      if (path === '/api/youtube/search') {
        return await handleChannelVideoSearch(url, corsHeaders, env);
      } else if (path === '/api/youtube/live') {
        return await handleLiveStreams(corsHeaders, env);
      } else if (path === '/api/youtube/uploads') {
        return await handleChannelUploads(corsHeaders, env);
      }

      return new Response('Not found', { status: 404, headers: corsHeaders });
    } catch (error) {
      console.error('API Error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};

async function handleChannelUploads(corsHeaders, env) {
  const apiKey = env.YOUTUBE_API_KEY || YOUTUBE_API_KEY;
  
  // Get the uploads playlist ID (replace UC with UU)
  const uploadsPlaylistId = EVERYTHING_CBL_CHANNEL_ID.replace('UC', 'UU');
  
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=50&key=${apiKey}`
  );
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(`YouTube API error: ${data.error?.message || 'Unknown error'}`);
  }
  
  const videos = data.items?.map(item => ({
    videoId: item.snippet.resourceId.videoId,
    title: item.snippet.title,
    thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
    publishedAt: item.snippet.publishedAt,
    embedUrl: `https://www.youtube.com/embed/${item.snippet.resourceId.videoId}`,
    watchUrl: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
    isLive: false
  })) || [];
  
  return new Response(JSON.stringify({ videos }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleChannelVideoSearch(url, corsHeaders, env) {
  const query = url.searchParams.get('q') || '';
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 50);
  
  // First get all uploads from the channel
  const uploadsResponse = await handleChannelUploads(corsHeaders, env);
  const uploadsData = await uploadsResponse.json();
  
  if (!uploadsData.videos) {
    return new Response(JSON.stringify({ videos: [] }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  // Filter videos based on search query
  const filteredVideos = uploadsData.videos.filter(video => {
    const titleLower = video.title.toLowerCase();
    const queryLower = query.toLowerCase();
    
    // Simple search - contains query in title
    return titleLower.includes(queryLower);
  }).slice(0, limit);
  
  return new Response(JSON.stringify({ videos: filteredVideos }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleLiveStreams(corsHeaders, env) {
  const apiKey = env.YOUTUBE_API_KEY || YOUTUBE_API_KEY;
  
  // Search for live videos from the channel
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${EVERYTHING_CBL_CHANNEL_ID}&eventType=live&type=video&key=${apiKey}`
  );
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(`YouTube API error: ${data.error?.message || 'Unknown error'}`);
  }
  
  const live = data.items?.map(item => ({
    videoId: item.id.videoId,
    title: item.snippet.title,
    thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
    isLive: true,
    embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`,
    watchUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`
  })) || [];
  
  return new Response(JSON.stringify({ live }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}