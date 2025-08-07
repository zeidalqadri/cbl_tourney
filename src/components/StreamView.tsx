'use client'

import React, { useEffect, useState } from 'react'
import { Tv, Radio, Loader2 } from 'lucide-react'

interface StreamViewProps {
  onLiveStatusChange?: (isLive: boolean) => void
  selectedMatchNumber?: number | null
  selectedMatchDetails?: {
    teamA?: string
    teamB?: string
    venue?: string
  }
}

interface VideoData {
  videoId: string
  title: string
  thumbnail: string
  isLive: boolean
}

export default function StreamView({ onLiveStatusChange, selectedMatchNumber, selectedMatchDetails }: StreamViewProps) {
  const [loading, setLoading] = useState(true)
  const [liveVideoId, setLiveVideoId] = useState<string | null>(null)
  const [matchVideo, setMatchVideo] = useState<VideoData | null>(null)
  // YouTube channel: https://www.youtube.com/@OrganizerCBL
  const [channelId] = useState('UCSTjgKoXJT41KMsqKnOTxZQ') // OrganizerCBL channel ID
  
  useEffect(() => {
    checkLiveStream()
    // Check for live streams every minute
    const interval = setInterval(checkLiveStream, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (selectedMatchNumber) {
      findMatchVideo(selectedMatchNumber)
    }
  }, [selectedMatchNumber])

  const checkLiveStream = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // Reduced timeout
      
      const response = await fetch('https://cbl-coverage-api.zeidalqadri.workers.dev/api/youtube/live', {
        signal: controller.signal
      })
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json()
      // Add response validation
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format')
      }
      
      if (data.live && data.live.length > 0) {
        setLiveVideoId(data.live[0].videoId)
        onLiveStatusChange?.(true)
      } else {
        setLiveVideoId(null)
        onLiveStatusChange?.(false)
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn('Stream check timed out - continuing with cached data');
      } else {
        console.error('Stream check failed:', error)
      }
      // Set fallback state instead of just failing
      setLiveVideoId(null)
      onLiveStatusChange?.(false)
    } finally {
      setLoading(false)
    }
  }

  const findMatchVideo = async (matchNumber: number) => {
    try {
      setLoading(true)
      
      // First check if it's in live videos
      const liveResponse = await fetch('https://cbl-coverage-api.zeidalqadri.workers.dev/api/youtube/live')
      const liveData = await liveResponse.json()
      
      // Smart matching for live videos
      const liveMatch = liveData.live?.find((v: VideoData) => {
        const titleLower = v.title.toLowerCase()
        const teamALower = selectedMatchDetails?.teamA?.toLowerCase() || ''
        const teamBLower = selectedMatchDetails?.teamB?.toLowerCase() || ''
        const venueLower = selectedMatchDetails?.venue?.toLowerCase() || ''
        
        // Match by match number first
        if (titleLower.includes(`match #${matchNumber}`)) return true
        
        // Match by both team names (in any order)
        if (teamALower && teamBLower) {
          const hasTeamA = titleLower.includes(teamALower)
          const hasTeamB = titleLower.includes(teamBLower)
          if (hasTeamA && hasTeamB) return true
        }
        
        // Match by venue if provided
        if (venueLower && titleLower.includes(venueLower)) {
          return true
        }
        
        return false
      })
      
      if (liveMatch) {
        setMatchVideo(liveMatch)
        return
      }
      
      // Search channel's video list with actual team names (up to 50 videos)
      const teamALower = selectedMatchDetails?.teamA?.toLowerCase() || ''
      const teamBLower = selectedMatchDetails?.teamB?.toLowerCase() || ''
      
      const searchQueries = [
        `Match #${matchNumber}`, // Primary: match number
        `${selectedMatchDetails?.teamA} vs ${selectedMatchDetails?.teamB}`, // Team A vs Team B
        `${selectedMatchDetails?.teamB} vs ${selectedMatchDetails?.teamA}`, // Team B vs Team A
        `${selectedMatchDetails?.teamA} ${selectedMatchDetails?.teamB}`, // Both team names
        selectedMatchDetails?.teamA, // Just Team A
        selectedMatchDetails?.teamB  // Just Team B
      ].filter((q): q is string => typeof q === 'string' && q.length > 0)
      
      for (const query of searchQueries) {
        const searchResponse = await fetch(
          `https://cbl-coverage-api.zeidalqadri.workers.dev/api/youtube/search?q=${encodeURIComponent(query)}&limit=50`
        )
        const searchData = await searchResponse.json()
        
        if (searchData.videos?.length > 0) {
          // Look through channel videos for the best match
          const relevantVideo = searchData.videos.find((v: VideoData) => {
            const titleLower = v.title.toLowerCase()
            
            // Strong match: Contains match number
            if (titleLower.includes(`match #${matchNumber}`) || 
                titleLower.includes(`match${matchNumber}`) ||
                titleLower.includes(`#${matchNumber}`)) {
              return true
            }
            
            // Good match: Contains both team names
            if (teamALower && teamBLower) {
              const hasTeamA = titleLower.includes(teamALower)
              const hasTeamB = titleLower.includes(teamBLower)
              
              if (hasTeamA && hasTeamB) {
                return true
              }
            }
            
            // Weak match: Contains one team name and looks like a match video
            if ((teamALower && titleLower.includes(teamALower)) || 
                (teamBLower && titleLower.includes(teamBLower))) {
              // Check if it looks like a match video
              if (titleLower.includes('vs') || 
                  titleLower.includes('match') || 
                  titleLower.includes('court') ||
                  titleLower.includes('game')) {
                return true
              }
            }
            
            return false
          })
          
          if (relevantVideo) {
            setMatchVideo(relevantVideo)
            break
          }
        }
      }
    } catch (error) {
      console.error('Error finding match video:', error)
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

      {/* Selected Match Video */}
      {matchVideo && selectedMatchNumber && (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  Match #{selectedMatchNumber}
                  {matchVideo.isLive && (
                    <span className="text-red-500 text-sm font-medium animate-pulse">LIVE</span>
                  )}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{matchVideo.title}</p>
              </div>
              <button
                onClick={() => {
                  const url = new URL(window.location.href);
                  url.searchParams.delete('match');
                  window.location.href = url.toString();
                }}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                ← Back to all videos
              </button>
            </div>
          </div>
          <div className="relative aspect-video bg-black">
            <iframe
              src={`https://www.youtube.com/embed/${matchVideo.videoId}?autoplay=1`}
              title={matchVideo.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
        </div>
      )}

      {/* Stream Embed - Only show when no specific match is selected */}
      {!matchVideo && (
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
      )}

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
                There&apos;s no live stream at the moment. Check back during tournament hours for live coverage.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}