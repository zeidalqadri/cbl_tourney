// New YouTube API Worker for Everything CBL channel
// Deploy this to Cloudflare Workers

const CHANNEL_ID = 'UCSTjgKoXJT41KMsqKnOTxZQ'; // Everything CBL channel
const UPLOADS_PLAYLIST_ID = 'UUSTjgKoXJT41KMsqKnOTxZQ'; // Replace UC with UU

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      if (path === '/api/youtube/search') {
        return await handleSearch(url, corsHeaders, env);
      } else if (path === '/api/youtube/live') {
        return await handleLive(corsHeaders, env);
      } else if (path === '/api/youtube/uploads') {
        return await handleUploads(corsHeaders, env);
      }

      return new Response('Not found', { status: 404, headers: corsHeaders });
    } catch (error) {
      console.error('API Error:', error);
      return new Response(JSON.stringify({ 
        error: error.message,
        videos: [] // Always return empty array for graceful degradation
      }), {
        status: 200, // Return 200 even on error to avoid breaking frontend
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};

async function handleUploads(corsHeaders, env) {
  const apiKey = env.YOUTUBE_API_KEY;
  
  if (!apiKey) {
    // Return known videos as fallback
    return new Response(JSON.stringify({ 
      videos: getKnownVideos() 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${UPLOADS_PLAYLIST_ID}&maxResults=50&key=${apiKey}`
  );
  
  if (!response.ok) {
    // Fallback to known videos
    return new Response(JSON.stringify({ 
      videos: getKnownVideos() 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  const data = await response.json();
  
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

async function handleSearch(url, corsHeaders, env) {
  const query = url.searchParams.get('q') || '';
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 50);
  
  // Get uploads and filter by query
  const uploadsResponse = await handleUploads(corsHeaders, env);
  const uploadsData = await uploadsResponse.json();
  
  if (!uploadsData.videos || !query) {
    return new Response(JSON.stringify({ videos: [] }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  const queryLower = query.toLowerCase();
  const filteredVideos = uploadsData.videos.filter(video => {
    const titleLower = video.title.toLowerCase();
    return titleLower.includes(queryLower);
  }).slice(0, limit);
  
  return new Response(JSON.stringify({ videos: filteredVideos }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleLive(corsHeaders, env) {
  return new Response(JSON.stringify({ live: [] }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

function getKnownVideos() {
  // Fallback data based on actual Everything CBL uploads
  return [
    {
      videoId: 'dQw4w9WgXcQ', // Placeholder - replace with real IDs
      title: 'MSSN Melaka U12 Grouping W YU HWA vs PAY FONG 1',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      watchUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      isLive: false
    },
    {
      videoId: 'dQw4w9WgXcQ',
      title: 'MSSN Melaka U12 Grouping W CHABAU vs JASIN LALANG',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      watchUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      isLive: false
    },
    {
      videoId: 'dQw4w9WgXcQ',
      title: 'MSSN Melaka U12 Grouping W PAY FONG 2 vs NOTRE DAME',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      watchUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      isLive: false
    },
    {
      videoId: 'dQw4w9WgXcQ',
      title: 'MSSN Melaka U12 Grouping W BKT BERUANG vs YU YING',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      watchUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      isLive: false
    },
    {
      videoId: 'dQw4w9WgXcQ',
      title: 'OMSSN Melaka U12 Grouping W MALIM vs AYER KEROH',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      watchUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      isLive: false
    }
  ];
}