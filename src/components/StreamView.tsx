'use client'

import React, { useEffect, useState } from 'react'
import { Tv, Radio, Loader2 } from 'lucide-react'

interface StreamViewProps {
  onLiveStatusChange?: (isLive: boolean) => void
}

export default function StreamView({ onLiveStatusChange }: StreamViewProps) {
  const [loading, setLoading] = useState(true)
  const [liveVideoId, setLiveVideoId] = useState<string | null>(null)
  // YouTube channel: https://www.youtube.com/@OrganizerCBL
  const [channelId] = useState('UCSTjgKoXJT41KMsqKnOTxZQ') // OrganizerCBL channel ID
  
  useEffect(() => {
    checkLiveStream()
    // Check for live streams every minute
    const interval = setInterval(checkLiveStream, 60000)
    return () => clearInterval(interval)
  }, [])

  const checkLiveStream = async () => {
    try {
      const response = await fetch('https://cbl-coverage-api.zeidalqadri.workers.dev/api/youtube/live')
      const data = await response.json()
      
      if (data.live && data.live.length > 0) {
        setLiveVideoId(data.live[0].videoId)
        onLiveStatusChange?.(true)
      } else {
        setLiveVideoId(null)
        onLiveStatusChange?.(false)
      }
    } catch (error) {
      console.error('Error checking live stream:', error)
      onLiveStatusChange?.(false)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <Loader2 className="w-8 h-8 animate-spin text-mss-turquoise" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg">
            <Tv className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Everything CBL Stream
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Live tournament coverage and highlights
            </p>
          </div>
          {liveVideoId && (
            <div className="ml-auto flex items-center gap-2">
              <Radio className="w-5 h-5 text-red-500 animate-pulse" />
              <span className="text-red-500 font-semibold animate-pulse">LIVE NOW</span>
            </div>
          )}
        </div>
      </div>

      {/* Stream Embed */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm overflow-hidden">
        <div className="relative aspect-video bg-black">
          {liveVideoId ? (
            <iframe
              src={`https://www.youtube.com/embed/${liveVideoId}?autoplay=1&mute=1`}
              title="Everything CBL Live Stream"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          ) : (
            <iframe
              src={`https://www.youtube.com/embed/videoseries?list=UU${channelId.substring(2)}&rel=0&showinfo=1`}
              title="Everything CBL Channel Videos"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3">About Everything CBL</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Everything CBL provides comprehensive coverage of the tournament with live streaming, 
          match highlights, player interviews, and behind-the-scenes content.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-1">Live Matches</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Watch tournament matches as they happen
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-1">Highlights</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Best plays and memorable moments
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-1">Interviews</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Player and coach interviews
            </p>
          </div>
        </div>
      </div>

      {/* Schedule Notice */}
      {!liveVideoId && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <Tv className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">No Live Stream</h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                There's no live stream at the moment. Check back during tournament hours for live coverage.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}