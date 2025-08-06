/**
 * Cloudflare Worker for API endpoints
 * Pure Cloudflare deployment - no Vercel dependencies
 */

export interface Env {
  // KV namespaces, D1 databases, etc. can be added here
}

interface PhotoMetadata {
  id: string
  name: string
  mimeType: string
  webViewLink: string
  webContentLink: string
  thumbnailLink: string
  createdTime: string
  modifiedTime: string
  size: string
  matchNumber?: number
  period?: 'pre_match' | 'first_half' | 'half_time' | 'second_half' | 'full_time' | 'post_match'
}

function getMockPhotos(matchNumber: number): PhotoMetadata[] {
  const periods = ['pre_match', 'first_half', 'half_time', 'second_half', 'full_time', 'post_match'] as const
  const mockPhotos: PhotoMetadata[] = []
  const baseTime = new Date('2024-01-15T09:00:00')
  
  periods.forEach((period, periodIndex) => {
    const photoCount = Math.floor(Math.random() * 3) + 3
    for (let i = 0; i < photoCount; i++) {
      const photoTime = new Date(baseTime.getTime() + (periodIndex * 30 + i * 2) * 60000)
      mockPhotos.push({
        id: `photo_${matchNumber}_${periodIndex}_${i}`,
        name: `DSC_${String(periodIndex * 10 + i).padStart(4, '0')}.jpg`,
        mimeType: 'image/jpeg',
        webViewLink: `https://drive.google.com/file/d/sample_${matchNumber}_${i}/view`,
        webContentLink: `https://via.placeholder.com/800x600/FF6B35/FFFFFF?text=Match+${matchNumber}+${period}`,
        thumbnailLink: `https://via.placeholder.com/400x300/FF6B35/FFFFFF?text=Match+${matchNumber}+${period}`,
        createdTime: photoTime.toISOString(),
        modifiedTime: photoTime.toISOString(),
        size: String(Math.floor(Math.random() * 5000000) + 1000000),
        matchNumber,
        period
      })
    }
  })
  
  return mockPhotos
}

function getPhotoStats(photos: PhotoMetadata[]) {
  const stats = {
    total: photos.length,
    byPeriod: {
      pre_match: 0,
      first_half: 0,
      half_time: 0,
      second_half: 0,
      full_time: 0,
      post_match: 0,
    },
    sizeTotal: 0,
    earliestPhoto: null as Date | null,
    latestPhoto: null as Date | null,
  }

  photos.forEach(photo => {
    if (photo.period && photo.period in stats.byPeriod) {
      stats.byPeriod[photo.period]++
    }
    
    stats.sizeTotal += parseInt(photo.size) || 0
    
    const photoTime = new Date(photo.createdTime)
    if (!stats.earliestPhoto || photoTime < stats.earliestPhoto) {
      stats.earliestPhoto = photoTime
    }
    if (!stats.latestPhoto || photoTime > stats.latestPhoto) {
      stats.latestPhoto = photoTime
    }
  })

  return stats
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)
    
    // Enable CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    // Route: /api/photos
    if (url.pathname === '/api/photos' && request.method === 'GET') {
      const matchNumber = url.searchParams.get('match')
      const query = url.searchParams.get('q')
      const stats = url.searchParams.get('stats')

      try {
        if (matchNumber && stats === 'true') {
          const photos = getMockPhotos(parseInt(matchNumber))
          const photoStats = getPhotoStats(photos)
          return new Response(
            JSON.stringify({ success: true, stats: photoStats }),
            { 
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders 
              } 
            }
          )
        } else if (matchNumber) {
          const photos = getMockPhotos(parseInt(matchNumber))
          return new Response(
            JSON.stringify({ success: true, photos }),
            { 
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders 
              } 
            }
          )
        } else if (query) {
          const mockResults: PhotoMetadata[] = [
            {
              id: `search_result_1`,
              name: `${query}_result_1.jpg`,
              mimeType: 'image/jpeg',
              webViewLink: `https://drive.google.com/file/d/search_1/view`,
              webContentLink: `https://via.placeholder.com/800x600/FF6B35/FFFFFF?text=${query}`,
              thumbnailLink: `https://via.placeholder.com/400x300/FF6B35/FFFFFF?text=${query}`,
              createdTime: new Date().toISOString(),
              modifiedTime: new Date().toISOString(),
              size: '2500000',
            }
          ]
          return new Response(
            JSON.stringify({ success: true, photos: mockResults }),
            { 
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders 
              } 
            }
          )
        } else {
          return new Response(
            JSON.stringify({ success: false, error: 'Match number or search query required' }),
            { 
              status: 400,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders 
              } 
            }
          )
        }
      } catch (error) {
        console.error('Error in photos API:', error)
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to fetch photos' }),
          { 
            status: 500,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders 
            } 
          }
        )
      }
    }

    // Route: /api/media/upload
    if (url.pathname === '/api/media/upload' && request.method === 'POST') {
      // Mock upload response
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Upload endpoint (mock)', 
          fileId: `file_${Date.now()}` 
        }),
        { 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          } 
        }
      )
    }

    // 404 for unknown routes
    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { 
        status: 404,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    )
  },
}