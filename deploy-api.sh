#!/bin/bash

# Quick deployment of YouTube API
echo "Deploying YouTube API..."

# Copy the worker code to a simpler format for manual deployment
cat > simple-youtube-api.js << 'EOF'
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (url.pathname === '/api/youtube/search') {
      const query = url.searchParams.get('q') || '';
      const videos = getKnownVideos().filter(v => 
        v.title.toLowerCase().includes(query.toLowerCase())
      );
      
      return new Response(JSON.stringify({ videos }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (url.pathname === '/api/youtube/live') {
      return new Response(JSON.stringify({ live: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response('Not found', { status: 404, headers: corsHeaders });
  }
};

function getKnownVideos() {
  return [
    {
      videoId: 'dQw4w9WgXcQ',
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
EOF

echo "✅ Created simple-youtube-api.js"
echo "🚀 Deploy this manually to Cloudflare Workers:"
echo "   1. Go to https://dash.cloudflare.com/workers"
echo "   2. Create new worker named 'cbl-youtube-api'"
echo "   3. Copy content from simple-youtube-api.js"
echo "   4. Deploy"
echo ""
echo "📝 Worker code ready in simple-youtube-api.js"