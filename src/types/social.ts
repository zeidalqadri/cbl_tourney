export interface ShareOptions {
  title: string
  description: string
  url: string
  hashtags?: string[]
  image?: string
  imageData?: Blob
  contentType?: 'match' | 'tournament' | 'standings' | 'schedule'
  contentId?: string
}

export interface PlatformShareResult {
  success: boolean
  platform: SocialPlatform
  shareUrl?: string
  error?: string
}

export type SocialPlatform = 'whatsapp' | 'x' | 'instagram' | 'facebook' | 'tiktok'

export type ImageFormat = 'story' | 'post' | 'square' | 'landscape'

export interface ImageDimensions {
  width: number
  height: number
}

export const IMAGE_FORMATS: Record<ImageFormat, ImageDimensions> = {
  story: { width: 1080, height: 1920 },
  post: { width: 1080, height: 1080 },
  square: { width: 1080, height: 1080 },
  landscape: { width: 1200, height: 630 }
}

export interface MatchShareData {
  matchId: string
  matchNumber: number
  division: 'boys' | 'girls'
  teamA: {
    name: string
    score?: number
  }
  teamB: {
    name: string
    score?: number
  }
  status: 'upcoming' | 'in_progress' | 'completed'
  venue: string
  date: string
  time: string
  winner?: 'A' | 'B'
}

export interface TournamentShareData {
  tournamentName: string
  date: string
  location: string
  totalTeams: number
  totalMatches: number
  currentPhase: 'group' | 'knockout' | 'final'
}

export interface TeamStandingShareData {
  groupName: string
  teams: Array<{
    name: string
    position: number
    points: number
    wins: number
    losses: number
  }>
}