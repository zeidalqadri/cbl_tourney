import { supabase } from './supabase'
import { MediaContent, MediaPhoto, MediaVideo } from '@/types/media'

export async function uploadMatchMedia(params: {
  matchId?: string
  venue?: string
  matchNumber?: number
  division?: string
  uploadType: 'photos' | 'video'
  content: any
  uploadedBy?: string
}) {
  try {
    // Find the match if not provided
    let targetMatchId = params.matchId
    if (!targetMatchId && params.venue && params.matchNumber) {
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .select('id')
        .eq('venue', params.venue.toUpperCase())
        .eq('match_number', params.matchNumber)
        .eq('division', params.division)
        .single()

      if (matchError || !match) {
        throw new Error('Match not found')
      }
      targetMatchId = match.id
    }

    if (!targetMatchId) {
      throw new Error('Match ID required')
    }

    // Get current media content
    const { data: currentMatch, error: fetchError } = await supabase
      .from('matches')
      .select('media_content')
      .eq('id', targetMatchId)
      .single()

    if (fetchError) {
      throw new Error('Failed to fetch match')
    }

    const currentContent = currentMatch.media_content || { videos: [], photos: [] }

    // Process upload based on type
    if (params.uploadType === 'photos') {
      const photos: MediaPhoto[] = params.content.photos.map((photo: any) => ({
        id: crypto.randomUUID(),
        url: photo.url,
        thumbnail: photo.thumbnail || photo.url,
        caption: photo.caption,
        photographer: photo.photographer || params.uploadedBy,
        width: photo.width,
        height: photo.height,
        addedAt: new Date().toISOString()
      }))

      currentContent.photos = [...(currentContent.photos || []), ...photos]
    } else if (params.uploadType === 'video') {
      const video: MediaVideo = {
        id: crypto.randomUUID(),
        videoId: params.content.videoId,
        platform: params.content.platform || 'youtube',
        title: params.content.title,
        description: params.content.description,
        thumbnail: params.content.thumbnail,
        embedUrl: params.content.embedUrl,
        watchUrl: params.content.watchUrl,
        duration: params.content.duration,
        publishedAt: params.content.publishedAt,
        addedAt: new Date().toISOString()
      }

      currentContent.videos = [...(currentContent.videos || []), video]
    }

    currentContent.lastUpdated = new Date().toISOString()

    // Update match with new media content
    const { error: updateError } = await supabase
      .from('matches')
      .update({ media_content: currentContent })
      .eq('id', targetMatchId)

    if (updateError) {
      throw new Error('Failed to update match media')
    }

    // Log the upload
    await supabase.from('media_uploads').insert({
      match_id: targetMatchId,
      upload_type: params.uploadType === 'photos' ? 'photo' : 'video',
      platform: params.uploadType === 'video' ? params.content.platform : 'direct_upload',
      uploaded_by: params.uploadedBy,
      upload_metadata: params.content
    })

    return {
      success: true,
      matchId: targetMatchId,
      mediaAdded: params.uploadType === 'photos' ? params.content.photos.length : 1,
      timestamp: new Date().toISOString()
    }

  } catch (error) {
    console.error('Media upload error:', error)
    throw error
  }
}

export async function getMatchMedia(matchId: string): Promise<{
  success: boolean
  mediaContent: MediaContent | null
  matchDetails?: any
}> {
  try {
    const { data: match, error } = await supabase
      .from('matches')
      .select(`
        id,
        match_number,
        venue,
        division,
        date,
        time,
        status,
        media_content,
        team_a:teams!matches_team_a_id_fkey(id, team_name),
        team_b:teams!matches_team_b_id_fkey(id, team_name)
      `)
      .eq('id', matchId)
      .single()

    if (error || !match) {
      return { success: false, mediaContent: null }
    }

    const mediaContent = match.media_content || { videos: [], photos: [] }
    
    // Check if venue should have live video based on schedule
    const hasLiveVideo = match.venue === 'SJKC YU HWA' && 
                        match.status === 'in_progress' &&
                        match.date === '2025-08-05'

    return {
      success: true,
      mediaContent: {
        ...mediaContent,
        hasLiveVideo,
        venueHasPhotographer: match.venue === 'SJKC MALIM' && match.date === '2025-08-05'
      },
      matchDetails: {
        matchNumber: match.match_number,
        teams: {
          teamA: match.team_a[0]?.team_name || 'Team A',
          teamB: match.team_b[0]?.team_name || 'Team B'
        },
        venue: match.venue,
        division: match.division
      }
    }

  } catch (error) {
    console.error('Get match media error:', error)
    return { success: false, mediaContent: null }
  }
}

export async function syncYouTubeVideos() {
  const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY
  const YOUTUBE_CHANNEL_ID = process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID || 'UC_YOUR_CHANNEL_ID'

  if (!YOUTUBE_API_KEY) {
    throw new Error('YouTube API key not configured')
  }

  try {
    // Get recent videos from YouTube
    const youtubeUrl = new URL('https://www.googleapis.com/youtube/v3/search')
    youtubeUrl.searchParams.append('part', 'snippet')
    youtubeUrl.searchParams.append('channelId', YOUTUBE_CHANNEL_ID)
    youtubeUrl.searchParams.append('order', 'date')
    youtubeUrl.searchParams.append('maxResults', '20')
    youtubeUrl.searchParams.append('type', 'video')
    youtubeUrl.searchParams.append('key', YOUTUBE_API_KEY)

    const response = await fetch(youtubeUrl.toString())
    const data = await response.json()

    if (!response.ok) {
      throw new Error('YouTube API error')
    }

    const videos = data.items || []
    const processedVideos = []

    for (const video of videos) {
      const title = video.snippet.title.toLowerCase()
      const description = video.snippet.description.toLowerCase()
      
      // Extract match information
      const matchNumberRegex = /match\s*#?(\d+)/i
      const venueRegex = /(yu\s*hwa|malim)/i
      const divisionRegex = /(boys|girls)\s*division/i
      
      const matchNumberMatch = title.match(matchNumberRegex) || description.match(matchNumberRegex)
      const venueMatch = title.match(venueRegex) || description.match(venueRegex)
      const divisionMatch = title.match(divisionRegex) || description.match(divisionRegex)
      
      if (matchNumberMatch || venueMatch) {
        const matchNumber = matchNumberMatch ? parseInt(matchNumberMatch[1]) : null
        const venue = venueMatch ? venueMatch[1].replace(/\s+/g, ' ').toUpperCase() : null
        const division = divisionMatch ? divisionMatch[1].toLowerCase() : null

        // Try to find matching match
        let matchQuery = supabase.from('matches').select('id, media_content')
        
        if (matchNumber) {
          matchQuery = matchQuery.eq('match_number', matchNumber)
        }
        if (venue) {
          matchQuery = matchQuery.ilike('venue', `%${venue}%`)
        }
        if (division) {
          matchQuery = matchQuery.eq('division', division)
        }

        const { data: matches } = await matchQuery.limit(1)
        
        if (matches && matches.length > 0) {
          const match = matches[0]
          const currentContent = match.media_content || { videos: [], photos: [] }
          
          // Check if video already exists
          const videoExists = currentContent.videos?.some(
            (v: any) => v.videoId === video.id.videoId
          )

          if (!videoExists) {
            await uploadMatchMedia({
              matchId: match.id,
              uploadType: 'video',
              content: {
                videoId: video.id.videoId,
                platform: 'youtube',
                title: video.snippet.title,
                description: video.snippet.description,
                thumbnail: video.snippet.thumbnails.high.url,
                embedUrl: `https://www.youtube.com/embed/${video.id.videoId}`,
                watchUrl: `https://www.youtube.com/watch?v=${video.id.videoId}`,
                publishedAt: video.snippet.publishedAt
              },
              uploadedBy: 'YouTube Sync'
            })

            processedVideos.push({
              videoId: video.id.videoId,
              matchId: match.id,
              title: video.snippet.title
            })
          }
        }
      }
    }

    return {
      success: true,
      videosProcessed: processedVideos.length,
      videos: processedVideos
    }

  } catch (error) {
    console.error('YouTube sync error:', error)
    throw error
  }
}