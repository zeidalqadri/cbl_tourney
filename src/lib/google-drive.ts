// Google Drive API integration for tournament photos
// Note: This is a simplified version using direct API calls
// For production, use proper OAuth or service account authentication

const GOOGLE_DRIVE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY || ''
const GOOGLE_DRIVE_FOLDER_ID = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID || ''

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

// Mock implementation - replace with actual Google Drive API integration
// This is a placeholder that returns sample data for development
// In production, implement proper Google Drive API authentication and calls

// Get photos from a specific match folder
export async function getMatchPhotos(matchNumber: number): Promise<PhotoMetadata[]> {
  try {
    // Mock data for development - replace with actual Google Drive API calls
    // This returns sample photo data for testing the UI
    
    console.log(`Fetching photos for match ${matchNumber}`)
    
    // Generate mock photos for testing
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
      
      // Add covered lens photo between periods (except after last period)
      if (periodIndex < periods.length - 1) {
        const intervalTime = new Date(baseTime.getTime() + (periodIndex * 30 + 25) * 60000)
        mockPhotos.push({
          id: `covered_${matchNumber}_${periodIndex}`,
          name: `covered_lens_${periodIndex + 1}.jpg`,
          mimeType: 'image/jpeg',
          webViewLink: `https://drive.google.com/file/d/covered_${matchNumber}_${periodIndex}/view`,
          webContentLink: `https://via.placeholder.com/800x600/000000/FFFFFF?text=Interval`,
          thumbnailLink: `https://via.placeholder.com/400x300/000000/FFFFFF?text=Interval`,
          createdTime: intervalTime.toISOString(),
          modifiedTime: intervalTime.toISOString(),
          size: '100000',
          matchNumber
        })
      }
    })
    
    // Detect periods (will use the already assigned periods in mock data)
    const photosWithPeriods = detectPhotoPeriods(mockPhotos)
    
    return photosWithPeriods
  } catch (error) {
    console.error('Error fetching match photos:', error)
    return []
  }
}

// Detect photo periods based on covered lens indicators
export function detectPhotoPeriods(photos: PhotoMetadata[]): PhotoMetadata[] {
  // Look for photos with specific naming patterns that indicate covered lens
  const coveredLensPattern = /covered|lens|interval|break|pause|black/i
  
  const periods: { start: number; end: number; type: PhotoPeriod['type'] }[] = []
  let currentPeriodStart = 0
  let periodIndex = 0
  
  const periodTypes: PhotoPeriod['type'][] = [
    'pre_match',
    'first_half',
    'half_time',
    'second_half',
    'post_match'
  ]

  photos.forEach((photo, index) => {
    // Check if this is a covered lens photo (interval marker)
    if (coveredLensPattern.test(photo.name)) {
      if (periodIndex < periodTypes.length) {
        periods.push({
          start: currentPeriodStart,
          end: index,
          type: periodTypes[periodIndex]
        })
        currentPeriodStart = index + 1
        periodIndex++
      }
    }
  })

  // Add the last period
  if (currentPeriodStart < photos.length && periodIndex < periodTypes.length) {
    periods.push({
      start: currentPeriodStart,
      end: photos.length,
      type: periodTypes[periodIndex]
    })
  }

  // If no covered lens photos found, use time-based detection
  if (periods.length === 0) {
    return detectPeriodsByTime(photos)
  }

  // Assign periods to photos
  return photos.map((photo, index) => {
    const period = periods.find(p => index >= p.start && index < p.end)
    return {
      ...photo,
      period: period?.type || 'pre_match'
    }
  })
}

// Fallback: Detect periods based on time gaps
function detectPeriodsByTime(photos: PhotoMetadata[]): PhotoMetadata[] {
  if (photos.length === 0) return []

  const timeGaps: { index: number; gap: number }[] = []
  
  // Find significant time gaps (more than 5 minutes)
  for (let i = 1; i < photos.length; i++) {
    const prevTime = new Date(photos[i - 1].createdTime).getTime()
    const currTime = new Date(photos[i].createdTime).getTime()
    const gap = currTime - prevTime
    
    if (gap > 5 * 60 * 1000) { // 5 minutes
      timeGaps.push({ index: i, gap })
    }
  }

  // Sort gaps by size and use the largest ones as period boundaries
  timeGaps.sort((a, b) => b.gap - a.gap)
  const significantGaps = timeGaps.slice(0, 4).sort((a, b) => a.index - b.index)

  const periodTypes: PhotoPeriod['type'][] = [
    'pre_match',
    'first_half',
    'half_time',
    'second_half',
    'post_match'
  ]

  let periodIndex = 0
  let lastBoundary = 0

  return photos.map((photo, index) => {
    // Check if we've crossed a boundary
    const boundary = significantGaps.find(g => g.index === index)
    if (boundary && periodIndex < periodTypes.length - 1) {
      periodIndex++
      lastBoundary = index
    }

    return {
      ...photo,
      period: periodTypes[Math.min(periodIndex, periodTypes.length - 1)]
    }
  })
}

// Get photos for multiple matches
export async function getBulkMatchPhotos(matchNumbers: number[]): Promise<Map<number, PhotoMetadata[]>> {
  const photoMap = new Map<number, PhotoMetadata[]>()
  
  // Fetch photos in parallel for all matches
  const promises = matchNumbers.map(matchNumber => 
    getMatchPhotos(matchNumber).then(photos => {
      photoMap.set(matchNumber, photos)
    })
  )
  
  await Promise.all(promises)
  return photoMap
}

// Search for photos across all tournament folders
export async function searchPhotos(query: string): Promise<PhotoMetadata[]> {
  try {
    // Mock search implementation
    console.log(`Searching photos with query: ${query}`)
    
    // Return some sample search results
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
    
    return mockResults
  } catch (error) {
    console.error('Error searching photos:', error)
    return []
  }
}

// Get photo statistics for a match
export async function getMatchPhotoStats(matchNumber: number) {
  const photos = await getMatchPhotos(matchNumber)
  
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