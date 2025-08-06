// Google Drive API integration for tournament photos
import { google } from 'googleapis'

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

// Initialize Google Drive API client
export async function initializeDriveClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_SERVICE_ACCOUNT_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  })

  const drive = google.drive({ version: 'v3', auth })
  return drive
}

// Get photos from a specific match folder
export async function getMatchPhotos(matchNumber: number): Promise<PhotoMetadata[]> {
  try {
    const drive = await initializeDriveClient()
    
    // Search for match folder
    const folderName = `Match_${matchNumber.toString().padStart(3, '0')}`
    const folderResponse = await drive.files.list({
      q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and '${GOOGLE_DRIVE_FOLDER_ID}' in parents`,
      fields: 'files(id, name)',
    })

    if (!folderResponse.data.files || folderResponse.data.files.length === 0) {
      console.log(`No folder found for match ${matchNumber}`)
      return []
    }

    const folderId = folderResponse.data.files[0].id

    // Get all photos from the match folder
    const photosResponse = await drive.files.list({
      q: `'${folderId}' in parents and (mimeType contains 'image/')`,
      fields: 'files(id, name, mimeType, webViewLink, webContentLink, thumbnailLink, createdTime, modifiedTime, size)',
      orderBy: 'createdTime',
      pageSize: 1000,
    })

    const photos: PhotoMetadata[] = (photosResponse.data.files || []).map(file => ({
      id: file.id!,
      name: file.name!,
      mimeType: file.mimeType!,
      webViewLink: file.webViewLink!,
      webContentLink: file.webContentLink!,
      thumbnailLink: file.thumbnailLink || `https://drive.google.com/thumbnail?id=${file.id}&sz=w400`,
      createdTime: file.createdTime!,
      modifiedTime: file.modifiedTime!,
      size: file.size || '0',
      matchNumber,
    }))

    // Detect periods based on covered lens photos
    const photosWithPeriods = detectPhotoPeriods(photos)
    
    return photosWithPeriods
  } catch (error) {
    console.error('Error fetching match photos:', error)
    // Fallback to mock data if API fails
    return getMockPhotos(matchNumber)
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
    const drive = await initializeDriveClient()
    
    const response = await drive.files.list({
      q: `'${GOOGLE_DRIVE_FOLDER_ID}' in parents and (mimeType contains 'image/') and fullText contains '${query}'`,
      fields: 'files(id, name, mimeType, webViewLink, webContentLink, thumbnailLink, createdTime, modifiedTime, size)',
      orderBy: 'createdTime desc',
      pageSize: 100,
    })

    return (response.data.files || []).map(file => ({
      id: file.id!,
      name: file.name!,
      mimeType: file.mimeType!,
      webViewLink: file.webViewLink!,
      webContentLink: file.webContentLink!,
      thumbnailLink: file.thumbnailLink || `https://drive.google.com/thumbnail?id=${file.id}&sz=w400`,
      createdTime: file.createdTime!,
      modifiedTime: file.modifiedTime!,
      size: file.size || '0',
    }))
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

// Mock data fallback for development
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