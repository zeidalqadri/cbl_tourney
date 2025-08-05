export interface MediaVideo {
  id: string
  videoId: string
  platform: 'youtube' | 'vimeo' | 'other'
  title: string
  description?: string
  thumbnail: string
  embedUrl: string
  watchUrl: string
  duration?: number
  publishedAt: string
  addedAt: string
}

export interface MediaPhoto {
  id: string
  url: string
  thumbnail: string
  caption?: string
  photographer?: string
  width?: number
  height?: number
  addedAt: string
}

export interface MediaGallery {
  id: string
  title: string
  coverPhoto: string
  photos: MediaPhoto[]
  galleryUrl?: string
  photographer?: string
  createdAt: string
}

export interface MediaContent {
  videos: MediaVideo[]
  photos: MediaPhoto[]
  galleries?: MediaGallery[]
  liveStreamUrl?: string
  hasLiveVideo?: boolean
  lastUpdated?: string
}

export interface MediaUpload {
  id: string
  matchId: string
  uploadType: 'video' | 'photo' | 'gallery'
  platform: string
  uploadedBy?: string
  uploadMetadata: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface VenueMediaSchedule {
  date: string
  venues: {
    [venueName: string]: 'video' | 'photos' | 'both'
  }
}