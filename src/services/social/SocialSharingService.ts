import { 
  ShareOptions, 
  PlatformShareResult, 
  SocialPlatform,
  MatchShareData,
  TournamentShareData,
  TeamStandingShareData
} from '@/types/social'
import { AnalyticsService } from './AnalyticsService'

export class SocialSharingService {
  private static instance: SocialSharingService
  private analytics: AnalyticsService
  
  private constructor() {
    this.analytics = AnalyticsService.getInstance()
  }
  
  static getInstance(): SocialSharingService {
    if (!SocialSharingService.instance) {
      SocialSharingService.instance = new SocialSharingService()
    }
    return SocialSharingService.instance
  }

  async shareToWhatsApp(options: ShareOptions): Promise<PlatformShareResult> {
    try {
      const text = this.formatWhatsAppText(options)
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      
      const whatsappUrl = isMobile
        ? `whatsapp://send?text=${encodeURIComponent(text)}`
        : `https://web.whatsapp.com/send?text=${encodeURIComponent(text)}`
      
      window.open(whatsappUrl, '_blank')
      
      this.analytics.trackShare('whatsapp', options.contentType || 'match', options.contentId, true)
      
      return {
        success: true,
        platform: 'whatsapp',
        shareUrl: whatsappUrl
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to share'
      this.analytics.trackShare('whatsapp', options.contentType || 'match', options.contentId, false, errorMessage)
      
      return {
        success: false,
        platform: 'whatsapp',
        error: errorMessage
      }
    }
  }

  async shareToX(options: ShareOptions): Promise<PlatformShareResult> {
    try {
      const text = this.formatXText(options)
      const hashtags = options.hashtags?.join(',') || 'MSSMelaka2025,Basketball'
      
      const params = new URLSearchParams({
        text,
        hashtags,
        url: options.url
      })
      
      const xUrl = `https://twitter.com/intent/tweet?${params.toString()}`
      window.open(xUrl, '_blank', 'width=550,height=420')
      
      this.analytics.trackShare('x', options.contentType || 'match', options.contentId, true)
      
      return {
        success: true,
        platform: 'x',
        shareUrl: xUrl
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to share'
      this.analytics.trackShare('x', options.contentType || 'match', options.contentId, false, errorMessage)
      
      return {
        success: false,
        platform: 'x',
        error: errorMessage
      }
    }
  }

  async shareToFacebook(options: ShareOptions): Promise<PlatformShareResult> {
    try {
      const params = new URLSearchParams({
        u: options.url,
        quote: options.description
      })
      
      const fbUrl = `https://www.facebook.com/sharer/sharer.php?${params.toString()}`
      window.open(fbUrl, '_blank', 'width=550,height=450')
      
      this.analytics.trackShare('facebook', options.contentType || 'match', options.contentId, true)
      
      return {
        success: true,
        platform: 'facebook',
        shareUrl: fbUrl
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to share'
      this.analytics.trackShare('facebook', options.contentType || 'match', options.contentId, false, errorMessage)
      
      return {
        success: false,
        platform: 'facebook',
        error: errorMessage
      }
    }
  }

  async shareToInstagram(options: ShareOptions): Promise<PlatformShareResult> {
    try {
      if (options.imageData) {
        const file = new File([options.imageData], 'tournament-share.png', { type: 'image/png' })
        
        if ('share' in navigator && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            text: options.description
          })
          
          this.analytics.trackShare('instagram', options.contentType || 'match', options.contentId, true)
          
          return {
            success: true,
            platform: 'instagram'
          }
        }
      }
      
      const instagramUrl = 'https://www.instagram.com/'
      window.open(instagramUrl, '_blank')
      
      this.analytics.trackShare('instagram', options.contentType || 'match', options.contentId, true)
      
      return {
        success: true,
        platform: 'instagram',
        shareUrl: instagramUrl
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to share'
      this.analytics.trackShare('instagram', options.contentType || 'match', options.contentId, false, errorMessage)
      
      return {
        success: false,
        platform: 'instagram',
        error: errorMessage
      }
    }
  }

  async shareToTikTok(options: ShareOptions): Promise<PlatformShareResult> {
    try {
      const tiktokUrl = 'https://www.tiktok.com/upload'
      window.open(tiktokUrl, '_blank')
      
      this.analytics.trackShare('tiktok', options.contentType || 'match', options.contentId, true)
      
      return {
        success: true,
        platform: 'tiktok',
        shareUrl: tiktokUrl
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to share'
      this.analytics.trackShare('tiktok', options.contentType || 'match', options.contentId, false, errorMessage)
      
      return {
        success: false,
        platform: 'tiktok',
        error: errorMessage
      }
    }
  }

  async shareGeneric(options: ShareOptions): Promise<boolean> {
    if ('share' in navigator) {
      try {
        await navigator.share({
          title: options.title,
          text: options.description,
          url: options.url
        })
        return true
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Share failed:', error)
        }
        return false
      }
    }
    return false
  }

  formatMatchShareText(match: MatchShareData, platform: SocialPlatform): string {
    const winner = match.winner 
      ? match.winner === 'A' ? match.teamA.name : match.teamB.name
      : null

    switch (platform) {
      case 'whatsapp':
        return this.formatWhatsAppMatch(match, winner)
      case 'x':
        return this.formatXMatch(match, winner)
      case 'facebook':
        return this.formatFacebookMatch(match, winner)
      default:
        return this.formatGenericMatch(match, winner)
    }
  }

  private formatWhatsAppText(options: ShareOptions): string {
    const hashtags = options.hashtags?.map(tag => `#${tag}`).join(' ') || ''
    return `🏀 *${options.title}*\n\n${options.description}\n\n${hashtags}\n\n${options.url}`
  }

  private formatXText(options: ShareOptions): string {
    const maxLength = 280 - 23 - (options.hashtags?.join(' ').length || 0)
    let text = `🏀 ${options.title}\n\n${options.description}`
    
    if (text.length > maxLength) {
      text = text.substring(0, maxLength - 3) + '...'
    }
    
    return text
  }

  private formatWhatsAppMatch(match: MatchShareData, winner: string | null): string {
    return `🏀 *MSS Melaka Basketball 2025*
    
*Match #${match.matchNumber}* - ${match.division === 'boys' ? 'Boys' : 'Girls'} Division

${match.teamA.name}: ${match.teamA.score || 0}
${match.teamB.name}: ${match.teamB.score || 0}

${winner ? `🏆 Winner: ${winner}` : ''}

📍 ${match.venue}
📅 ${match.date} | ⏰ ${match.time}

#MSSMelaka2025 #Basketball #Tournament`
  }

  private formatXMatch(match: MatchShareData, winner: string | null): string {
    return `🏀 Match #${match.matchNumber}

${match.teamA.name} ${match.teamA.score || 0} - ${match.teamB.score || 0} ${match.teamB.name}

${winner ? `🏆 ${winner}` : ''}

📍 ${match.venue} | ${match.date}`
  }

  private formatFacebookMatch(match: MatchShareData, winner: string | null): string {
    return `🏀 MSS Melaka Basketball 2025 - Match #${match.matchNumber}

${match.division === 'boys' ? 'Boys' : 'Girls'} Division

${match.teamA.name}: ${match.teamA.score || 0}
${match.teamB.name}: ${match.teamB.score || 0}

${winner ? `🏆 Congratulations to ${winner}!` : ''}

📍 ${match.venue} | 📅 ${match.date} ${match.time}`
  }

  private formatGenericMatch(match: MatchShareData, winner: string | null): string {
    return `Match #${match.matchNumber}: ${match.teamA.name} ${match.teamA.score || 0} - ${match.teamB.score || 0} ${match.teamB.name}${winner ? ` | Winner: ${winner}` : ''}`
  }

  formatStandingsShareText(standings: TeamStandingShareData, platform: SocialPlatform): string {
    const header = `📊 ${standings.groupName} Standings\n\n`
    const teams = standings.teams
      .map(team => `${team.position}. ${team.name} - ${team.points} pts (${team.wins}W-${team.losses}L)`)
      .join('\n')
    
    return `${header}${teams}\n\n#MSSMelaka2025 #Basketball`
  }

  formatTournamentShareText(tournament: TournamentShareData, platform: SocialPlatform): string {
    return `🏀 ${tournament.tournamentName}

📅 ${tournament.date}
📍 ${tournament.location}

👥 ${tournament.totalTeams} Teams
🏀 ${tournament.totalMatches} Matches

Current Phase: ${tournament.currentPhase.toUpperCase()}

#MSSMelaka2025 #Basketball #Tournament`
  }

  getAnalytics() {
    return this.analytics.getShareStats()
  }

  getPlatformEngagement(platform: SocialPlatform) {
    return this.analytics.getPlatformEngagement(platform)
  }

  getMostSharedContent(limit?: number) {
    return this.analytics.getMostSharedContent(limit)
  }
}