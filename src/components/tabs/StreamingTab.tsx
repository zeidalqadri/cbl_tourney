'use client'

import { useState, useEffect } from 'react'
import { Tv, Calendar, Clock, Users, AlertCircle } from 'lucide-react'
import StreamView from '@/components/StreamView'

export default function StreamingTab() {
  const [isLive, setIsLive] = useState(false)
  const [nextStreamTime, setNextStreamTime] = useState<string | null>(null)

  useEffect(() => {
    // Check if we're within tournament hours (8 AM - 6 PM)
    const checkStreamStatus = () => {
      const now = new Date()
      const hours = now.getHours()
      const tournamentDates = ['2025-08-04', '2025-08-05', '2025-08-06', '2025-08-07']
      const today = now.toISOString().split('T')[0]
      
      if (tournamentDates.includes(today) && hours >= 8 && hours < 18) {
        setIsLive(true)
      } else {
        setIsLive(false)
        
        // Calculate next stream time
        const tomorrow = new Date(now)
        tomorrow.setDate(tomorrow.getDate() + 1)
        tomorrow.setHours(8, 0, 0, 0)
        
        const tomorrowStr = tomorrow.toISOString().split('T')[0]
        if (tournamentDates.includes(tomorrowStr)) {
          setNextStreamTime(tomorrow.toLocaleString('en-MY', { 
            weekday: 'long', 
            hour: 'numeric', 
            minute: '2-digit' 
          }))
        } else {
          setNextStreamTime('Tournament has ended')
        }
      }
    }

    checkStreamStatus()
    const interval = setInterval(checkStreamStatus, 60000) // Check every minute
    
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Tv className="w-7 h-7 text-cbl-orange" />
            Live Streaming
          </h2>
          {isLive && (
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <span className="text-sm font-medium text-red-600">LIVE NOW</span>
            </div>
          )}
        </div>

        {isLive ? (
          <StreamView />
        ) : (
          <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
            <div className="text-center p-8">
              <div className="inline-flex items-center justify-center w-20 h-20 mb-4 bg-white rounded-full shadow-lg">
                <Tv className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Stream Currently Offline</h3>
              <p className="text-gray-600 mb-4">
                {nextStreamTime ? `Next stream: ${nextStreamTime}` : 'Check back during tournament hours'}
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">Streaming Hours: 8:00 AM - 6:00 PM</span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-blue-600" />
              <div>
                <h4 className="font-semibold text-gray-900">Tournament Dates</h4>
                <p className="text-sm text-gray-700">August 4-7, 2025</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-orange-600" />
              <div>
                <h4 className="font-semibold text-gray-900">Live Coverage</h4>
                <p className="text-sm text-gray-700">Selected matches streamed</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-purple-600" />
              <div>
                <h4 className="font-semibold text-gray-900">Finals Day</h4>
                <p className="text-sm text-gray-700">August 7 - Full coverage</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold mb-3">Streaming Schedule</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="font-medium">Day 1-2 (Aug 4-5)</span>
              <span className="text-gray-600">Group Stage - Court 1 matches</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="font-medium">Day 3 (Aug 6)</span>
              <span className="text-gray-600">Knockout Rounds - All courts</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="font-medium">Day 4 (Aug 7)</span>
              <span className="text-gray-600">Finals - Full coverage</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}