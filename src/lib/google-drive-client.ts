// Client-side Google Drive integration (calls API routes)
// This file is safe for browser/edge runtime

export interface PhotoMetadata {
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
  tags?: string[]
}

export interface PhotoPeriod {
  startTime: Date
  endTime: Date
  type: 'pre_match' | 'first_half' | 'half_time' | 'second_half' | 'post_match'
  photos: PhotoMetadata[]
}

// Get photos from a specific match folder (via API)
import { API_BASE_URL } from './api-config'

export async function getMatchPhotos(matchNumber: number): Promise<PhotoMetadata[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/photos?match=${matchNumber}`)
    const data = await response.json()
    
    if (data.success) {
      return data.photos || []
    }
    
    // Fallback to mock data if API fails
    return getMockPhotos(matchNumber)
  } catch (error) {
    console.error('Error fetching match photos:', error)
    return getMockPhotos(matchNumber)
  }
}

// Get photo statistics for a match (via API)
export async function getMatchPhotoStats(matchNumber: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/photos?match=${matchNumber}&stats=true`)
    const data = await response.json()
    
    if (data.success && data.stats) {
      return data.stats
    }
    
    // Return mock stats if API fails
    return {
      total: 0,
      byPeriod: {
        pre_match: 0,
        first_half: 0,
        half_time: 0,
        second_half: 0,
        post_match: 0,
      },
      sizeTotal: 0,
      earliestPhoto: null,
      latestPhoto: null,
    }
  } catch (error) {
    console.error('Error fetching photo stats:', error)
    return {
      total: 0,
      byPeriod: {
        pre_match: 0,
        first_half: 0,
        half_time: 0,
        second_half: 0,
        post_match: 0,
      },
      sizeTotal: 0,
      earliestPhoto: null,
      latestPhoto: null,
    }
  }
}

// Search photos (via API)
export async function searchPhotos(query: string): Promise<PhotoMetadata[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/photos?q=${encodeURIComponent(query)}`)
    const data = await response.json()
    
    if (data.success) {
      return data.photos || []
    }
    
    return []
  } catch (error) {
    console.error('Error searching photos:', error)
    return []
  }
}

// Mock data for development/fallback
function getMockPhotos(matchNumber: number): PhotoMetadata[] {
  const mockPhotos: PhotoMetadata[] = []
  const periods: PhotoPeriod['type'][] = ['pre_match', 'first_half', 'half_time', 'second_half', 'post_match']
  const baseTime = new Date('2024-01-15T09:00:00')
  
  periods.forEach((period, periodIndex) => {
    // Add 3-5 photos per period
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