import { uploadMatchMedia, syncYouTubeVideos } from './media-api'
import { supabase } from './supabase'

export interface WebhookResponse {
  success: boolean
  message: string
  data?: any
  error?: string
}

// Webhook handler for YouTube video sync
export async function handleYouTubeWebhook(payload: {
  videoId?: string
  channelId?: string
  action?: 'sync' | 'new_video'
}): Promise<WebhookResponse> {
  try {
    if (payload.action === 'sync' || !payload.videoId) {
      // Full sync of recent videos
      const result = await syncYouTubeVideos()
      return {
        success: true,
        message: `Synced ${result.videosProcessed} videos from YouTube`,
        data: result
      }
    }

    // Handle specific video
    if (payload.videoId) {
      // Fetch video details from YouTube
      const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${payload.videoId}&key=${YOUTUBE_API_KEY}`
      )
      const data = await response.json()
      
      if (data.items && data.items.length > 0) {
        const video = data.items[0]
        const title = video.snippet.title.toLowerCase()
        const description = video.snippet.description.toLowerCase()
        
        // Extract match info
        const matchNumberMatch = title.match(/match\s*#?(\d+)/i) || description.match(/match\s*#?(\d+)/i)
        const venueMatch = title.match(/(yu\s*hwa|malim)/i) || description.match(/(yu\s*hwa|malim)/i)
        
        if (matchNumberMatch || venueMatch) {
          const matchNumber = matchNumberMatch ? parseInt(matchNumberMatch[1]) : null
          const venue = venueMatch ? venueMatch[1].replace(/\s+/g, ' ').toUpperCase() : null
          
          // Find the match
          let matchQuery = supabase.from('matches').select('id')
          if (matchNumber) matchQuery = matchQuery.eq('match_number', matchNumber)
          if (venue) matchQuery = matchQuery.ilike('venue', `%${venue}%`)
          
          const { data: matches } = await matchQuery.limit(1)
          
          if (matches && matches.length > 0) {
            await uploadMatchMedia({
              matchId: matches[0].id,
              uploadType: 'video',
              content: {
                videoId: video.id,
                platform: 'youtube',
                title: video.snippet.title,
                description: video.snippet.description,
                thumbnail: video.snippet.thumbnails.high.url,
                embedUrl: `https://www.youtube.com/embed/${video.id}`,
                watchUrl: `https://www.youtube.com/watch?v=${video.id}`,
                publishedAt: video.snippet.publishedAt
              },
              uploadedBy: 'YouTube Webhook'
            })
            
            return {
              success: true,
              message: `Added video to match ${matches[0].id}`,
              data: { videoId: video.id, matchId: matches[0].id }
            }
          }
        }
      }
    }

    return {
      success: false,
      message: 'No matching video or match found'
    }
  } catch (error) {
    console.error('YouTube webhook error:', error)
    return {
      success: false,
      message: 'Failed to process YouTube webhook',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Webhook handler for photo uploads
export async function handlePhotoWebhook(payload: {
  photos: Array<{
    url: string
    caption?: string
    photographer?: string
    width?: number
    height?: number
  }>
  matchId?: string
  venue?: string
  matchNumber?: number
  division?: string
  uploadedBy?: string
}): Promise<WebhookResponse> {
  try {
    if (!payload.photos || payload.photos.length === 0) {
      return {
        success: false,
        message: 'No photos provided'
      }
    }

    const result = await uploadMatchMedia({
      matchId: payload.matchId,
      venue: payload.venue,
      matchNumber: payload.matchNumber,
      division: payload.division,
      uploadType: 'photos',
      content: {
        photos: payload.photos
      },
      uploadedBy: payload.uploadedBy || 'Photo Webhook'
    })

    return {
      success: true,
      message: `Uploaded ${payload.photos.length} photos to match ${result.matchId}`,
      data: result
    }
  } catch (error) {
    console.error('Photo webhook error:', error)
    return {
      success: false,
      message: 'Failed to upload photos',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Webhook handler for match status updates
export async function handleMatchStatusWebhook(payload: {
  matchId?: string
  venue?: string
  matchNumber?: number
  status?: 'scheduled' | 'in_progress' | 'completed' | 'postponed'
  liveStreamUrl?: string
}): Promise<WebhookResponse> {
  try {
    let targetMatchId = payload.matchId
    
    // Find match if not provided
    if (!targetMatchId && payload.venue && payload.matchNumber) {
      const { data: match } = await supabase
        .from('matches')
        .select('id')
        .eq('venue', payload.venue.toUpperCase())
        .eq('match_number', payload.matchNumber)
        .single()
      
      if (match) {
        targetMatchId = match.id
      }
    }

    if (!targetMatchId) {
      return {
        success: false,
        message: 'Match not found'
      }
    }

    // Update match status and/or live stream URL
    const updates: any = {}
    if (payload.status) {
      updates.status = payload.status
    }
    
    if (payload.liveStreamUrl !== undefined) {
      const { data: currentMatch } = await supabase
        .from('matches')
        .select('media_content')
        .eq('id', targetMatchId)
        .single()
      
      const mediaContent = currentMatch?.media_content || { videos: [], photos: [] }
      mediaContent.liveStreamUrl = payload.liveStreamUrl
      mediaContent.lastUpdated = new Date().toISOString()
      
      updates.media_content = mediaContent
    }

    const { error } = await supabase
      .from('matches')
      .update(updates)
      .eq('id', targetMatchId)

    if (error) {
      throw error
    }

    return {
      success: true,
      message: `Updated match ${targetMatchId}`,
      data: { matchId: targetMatchId, updates }
    }
  } catch (error) {
    console.error('Match status webhook error:', error)
    return {
      success: false,
      message: 'Failed to update match status',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Master webhook handler for N8N
export async function handleN8NWebhook(payload: {
  type: 'youtube' | 'photo' | 'match_status'
  data: any
}): Promise<WebhookResponse> {
  try {
    switch (payload.type) {
      case 'youtube':
        return await handleYouTubeWebhook(payload.data)
      
      case 'photo':
        return await handlePhotoWebhook(payload.data)
      
      case 'match_status':
        return await handleMatchStatusWebhook(payload.data)
      
      default:
        return {
          success: false,
          message: `Unknown webhook type: ${payload.type}`
        }
    }
  } catch (error) {
    console.error('N8N webhook error:', error)
    return {
      success: false,
      message: 'Failed to process webhook',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}