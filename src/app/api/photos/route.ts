import { NextRequest, NextResponse } from 'next/server'

// Mock implementation for Cloudflare deployment
// In production with proper Node.js runtime, this would use Google APIs

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
  period?: 'pre_match' | 'first_half' | 'half_time' | 'second_half' | 'post_match'
}

function getMockPhotos(matchNumber: number): PhotoMetadata[] {
  const periods = ['pre_match', 'first_half', 'half_time', 'second_half', 'post_match'] as const
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
      post_match: 0,
    },
    sizeTotal: 0,
    earliestPhoto: null as Date | null,
    latestPhoto: null as Date | null,
  }

  photos.forEach(photo => {
    if (photo.period) {
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

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const matchNumber = searchParams.get('match')
  const query = searchParams.get('q')
  const stats = searchParams.get('stats')

  try {
    if (matchNumber && stats === 'true') {
      // Get photo statistics for a match
      const photos = getMockPhotos(parseInt(matchNumber))
      const photoStats = getPhotoStats(photos)
      return NextResponse.json({ success: true, stats: photoStats })
    } else if (matchNumber) {
      // Get photos for a specific match
      const photos = getMockPhotos(parseInt(matchNumber))
      return NextResponse.json({ success: true, photos })
    } else if (query) {
      // Search photos (mock implementation)
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
      return NextResponse.json({ success: true, photos: mockResults })
    } else {
      return NextResponse.json(
        { success: false, error: 'Match number or search query required' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error in photos API:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch photos' },
      { status: 500 }
    )
  }
}