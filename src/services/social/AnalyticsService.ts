import { SocialPlatform } from '@/types/social'

export interface ShareEvent {
  platform: SocialPlatform
  contentType: 'match' | 'tournament' | 'standings' | 'schedule'
  contentId?: string
  timestamp: Date
  success: boolean
  errorMessage?: string
}

export interface ShareStats {
  totalShares: number
  sharesByPlatform: Record<SocialPlatform, number>
  sharesByContent: Record<string, number>
  successRate: number
  mostPopularPlatform: SocialPlatform | null
  recentShares: ShareEvent[]
}

export class AnalyticsService {
  private static instance: AnalyticsService
  private shareEvents: ShareEvent[] = []
  private readonly STORAGE_KEY = 'mss_share_analytics'
  private readonly MAX_EVENTS = 1000
  
  private constructor() {
    this.loadFromStorage()
  }
  
  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService()
    }
    return AnalyticsService.instance
  }

  trackShare(
    platform: SocialPlatform,
    contentType: ShareEvent['contentType'],
    contentId?: string,
    success: boolean = true,
    errorMessage?: string
  ): void {
    const event: ShareEvent = {
      platform,
      contentType,
      contentId,
      timestamp: new Date(),
      success,
      errorMessage
    }
    
    this.shareEvents.push(event)
    
    // Keep only the most recent events
    if (this.shareEvents.length > this.MAX_EVENTS) {
      this.shareEvents = this.shareEvents.slice(-this.MAX_EVENTS)
    }
    
    this.saveToStorage()
    this.sendToAnalyticsProvider(event)
  }

  getShareStats(timeframe?: { start: Date; end: Date }): ShareStats {
    let events = this.shareEvents
    
    if (timeframe) {
      events = events.filter(e => 
        e.timestamp >= timeframe.start && e.timestamp <= timeframe.end
      )
    }
    
    const sharesByPlatform: Record<SocialPlatform, number> = {
      whatsapp: 0,
      x: 0,
      instagram: 0,
      facebook: 0,
      tiktok: 0
    }
    
    const sharesByContent: Record<string, number> = {}
    let successfulShares = 0
    
    events.forEach(event => {
      sharesByPlatform[event.platform]++
      
      if (event.contentId) {
        sharesByContent[event.contentId] = (sharesByContent[event.contentId] || 0) + 1
      }
      
      if (event.success) {
        successfulShares++
      }
    })
    
    const mostPopularPlatform = Object.entries(sharesByPlatform)
      .sort(([, a], [, b]) => b - a)[0]?.[0] as SocialPlatform | null
    
    return {
      totalShares: events.length,
      sharesByPlatform,
      sharesByContent,
      successRate: events.length > 0 ? (successfulShares / events.length) * 100 : 0,
      mostPopularPlatform,
      recentShares: events.slice(-10).reverse()
    }
  }

  getMostSharedContent(limit: number = 5): Array<{ contentId: string; shares: number }> {
    const contentCounts: Record<string, number> = {}
    
    this.shareEvents.forEach(event => {
      if (event.contentId) {
        contentCounts[event.contentId] = (contentCounts[event.contentId] || 0) + 1
      }
    })
    
    return Object.entries(contentCounts)
      .map(([contentId, shares]) => ({ contentId, shares }))
      .sort((a, b) => b.shares - a.shares)
      .slice(0, limit)
  }

  getPlatformEngagement(platform: SocialPlatform): {
    totalShares: number
    successRate: number
    lastShare?: Date
    popularContent: string[]
  } {
    const platformEvents = this.shareEvents.filter(e => e.platform === platform)
    const successfulShares = platformEvents.filter(e => e.success).length
    
    const contentCounts: Record<string, number> = {}
    platformEvents.forEach(event => {
      if (event.contentId) {
        contentCounts[event.contentId] = (contentCounts[event.contentId] || 0) + 1
      }
    })
    
    const popularContent = Object.entries(contentCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([contentId]) => contentId)
    
    return {
      totalShares: platformEvents.length,
      successRate: platformEvents.length > 0 ? (successfulShares / platformEvents.length) * 100 : 0,
      lastShare: platformEvents[platformEvents.length - 1]?.timestamp,
      popularContent
    }
  }

  clearAnalytics(): void {
    this.shareEvents = []
    this.saveToStorage()
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        this.shareEvents = data.map((e: any) => ({
          ...e,
          timestamp: new Date(e.timestamp)
        }))
      }
    } catch (error) {
      console.error('Failed to load analytics from storage:', error)
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.shareEvents))
    } catch (error) {
      console.error('Failed to save analytics to storage:', error)
    }
  }

  private sendToAnalyticsProvider(event: ShareEvent): void {
    // Send to Google Analytics, Mixpanel, or other analytics provider
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'social_share', {
        platform: event.platform,
        content_type: event.contentType,
        content_id: event.contentId,
        success: event.success
      })
    }
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Share Event:', event)
    }
  }
}