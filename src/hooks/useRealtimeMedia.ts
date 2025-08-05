import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { MediaContent } from '@/types/media'
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

interface UseRealtimeMediaOptions {
  matchId?: string
  enabled?: boolean
}

export function useRealtimeMedia({ matchId, enabled = true }: UseRealtimeMediaOptions) {
  const [mediaContent, setMediaContent] = useState<MediaContent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  useEffect(() => {
    if (!matchId || !enabled) {
      setIsLoading(false)
      return
    }

    let subscription: any = null

    const setupRealtime = async () => {
      // Initial fetch
      const { data, error } = await supabase
        .from('matches')
        .select('media_content')
        .eq('id', matchId)
        .single()

      if (!error && data) {
        setMediaContent(data.media_content || { videos: [], photos: [] })
      }
      setIsLoading(false)

      // Subscribe to changes
      subscription = supabase
        .channel(`match-media-${matchId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'matches',
            filter: `id=eq.${matchId}`
          },
          (payload: RealtimePostgresChangesPayload<any>) => {
            const newData = payload.new as { media_content?: MediaContent }
            if (newData && newData.media_content) {
              setMediaContent(newData.media_content)
              setLastUpdate(new Date())
              
              // Show notification for new content
              if ('Notification' in window && Notification.permission === 'granted') {
                const oldData = payload.old as { media_content?: MediaContent }
                const oldContent = oldData?.media_content || { videos: [], photos: [] }
                const newContent = newData.media_content
                
                const newVideos = newContent.videos.length - (oldContent.videos?.length || 0)
                const newPhotos = newContent.photos.length - (oldContent.photos?.length || 0)
                
                if (newVideos > 0) {
                  new Notification('New Video Available', {
                    body: `${newVideos} new video${newVideos > 1 ? 's' : ''} added to this match`,
                    icon: '/icon-192x192.png'
                  })
                }
                
                if (newPhotos > 0) {
                  new Notification('New Photos Available', {
                    body: `${newPhotos} new photo${newPhotos > 1 ? 's' : ''} added to this match`,
                    icon: '/icon-192x192.png'
                  })
                }
              }
            }
          }
        )
        .subscribe()
    }

    setupRealtime()

    // Cleanup
    return () => {
      if (subscription) {
        supabase.removeChannel(subscription)
      }
    }
  }, [matchId, enabled])

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  return {
    mediaContent,
    isLoading,
    lastUpdate,
    refresh: async () => {
      if (!matchId) return
      
      setIsLoading(true)
      const { data, error } = await supabase
        .from('matches')
        .select('media_content')
        .eq('id', matchId)
        .single()

      if (!error && data) {
        setMediaContent(data.media_content || { videos: [], photos: [] })
      }
      setIsLoading(false)
    }
  }
}

// Hook for monitoring all matches with media updates
export function useRealtimeMediaUpdates() {
  const [recentUpdates, setRecentUpdates] = useState<Array<{
    matchId: string
    timestamp: Date
    type: 'video' | 'photo'
    count: number
  }>>([])

  useEffect(() => {
    const subscription = supabase
      .channel('all-media-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'matches'
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          const newData = payload.new as { media_content?: MediaContent, id: string }
          const oldData = payload.old as { media_content?: MediaContent }
          if (newData && oldData) {
            const oldContent = oldData.media_content || { videos: [], photos: [] }
            const newContent = newData.media_content || { videos: [], photos: [] }
            
            const newVideos = newContent.videos.length - (oldContent.videos?.length || 0)
            const newPhotos = newContent.photos.length - (oldContent.photos?.length || 0)
            
            if (newVideos > 0) {
              setRecentUpdates(prev => [{
                matchId: newData.id,
                timestamp: new Date(),
                type: 'video' as const,
                count: newVideos
              }, ...prev].slice(0, 10))
            }
            
            if (newPhotos > 0) {
              setRecentUpdates(prev => [{
                matchId: newData.id,
                timestamp: new Date(),
                type: 'photo' as const,
                count: newPhotos
              }, ...prev].slice(0, 10))
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [])

  return { recentUpdates }
}