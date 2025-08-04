'use client'

import { useEffect, useState } from 'react'
import { Match } from '@/types/tournament'
import { formatTime } from '@/lib/utils'
import { getMatches, subscribeToMatches } from '@/lib/tournament-api'
import EnhancedMatchCard from './EnhancedMatchCard'
import { Calendar, Trophy, Users } from 'lucide-react'

export default function MatchList() {
  const [allMatches, setAllMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState('2025-08-04')

  useEffect(() => {
    loadMatches()
  }, [])

  useEffect(() => {
    // Subscribe to real-time updates
    const unsubscribe = subscribeToMatches(
      () => loadMatches()
    )
    
    return () => unsubscribe()
  }, [])

  async function loadMatches() {
    setLoading(true)
    try {
      // Load ALL matches without date filter
      const data = await getMatches()
      setAllMatches(data)
    } catch (error) {
      console.error('Error loading matches:', error)
    } finally {
      setLoading(false)
    }
  }

  const dates = [
    { date: '2025-08-04', label: 'Day 1 - Group Stage', matchCount: null },
    { date: '2025-08-05', label: 'Day 2 - Group Stage', matchCount: null },
    { date: '2025-08-06', label: 'Day 3 - Knockout', matchCount: 'TBD' },
    { date: '2025-08-07', label: 'Day 4 - Finals', matchCount: 'TBD' }
  ]

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 bg-gradient-to-r from-mss-turquoise to-cbl-orange rounded-full animate-spin" />
          <div className="absolute inset-2 bg-white dark:bg-gray-900 rounded-full" />
        </div>
        <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Loading matches...</p>
      </div>
    )
  }

  const currentDayMatches = allMatches.filter(m => m.date === selectedDate)

  return (
    <div className="space-y-6">
      {/* Date Selection */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-mss-turquoise" />
          <h2 className="font-display text-xl">TOURNAMENT SCHEDULE</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {dates.map(({ date, label, matchCount }) => {
            const isActive = selectedDate === date
            const dayMatches = allMatches.filter(m => m.date === date)
            const hasLive = dayMatches.some(m => m.status === 'in_progress')
            const displayMatchCount = matchCount || dayMatches.length
            
            return (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`relative p-4 rounded-lg transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-mss-turquoise to-teal-500 text-white shadow-lg scale-105'
                    : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {hasLive && (
                  <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
                <div className="text-sm font-medium opacity-80">
                  {new Date(date).toLocaleDateString('en-MY', { weekday: 'short' })}
                </div>
                <div className="text-lg font-bold">
                  {new Date(date).toLocaleDateString('en-MY', { day: 'numeric', month: 'short' })}
                </div>
                <div className="text-xs mt-1 opacity-70">
                  {label.split(' - ')[1]}
                </div>
                <div className="text-xs mt-2 font-display">
                  {displayMatchCount} {typeof displayMatchCount === 'string' ? '' : 'MATCHES'}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* All Matches in Chronological Order */}
      {currentDayMatches.length > 0 ? (
        <div className="space-y-4">
          <h3 className="font-display text-2xl text-gray-700 dark:text-gray-300">
            DAY'S MATCHES
            <span className="text-sm ml-2 text-gray-500">({currentDayMatches.length} total)</span>
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {currentDayMatches.map(match => (
              <EnhancedMatchCard 
                key={match.id} 
                match={match}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <Trophy className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-700 mb-4" />
          {selectedDate === '2025-08-06' || selectedDate === '2025-08-07' ? (
            <div className="space-y-2">
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                {selectedDate === '2025-08-06' ? 'Knockout Stage' : 'Finals'}
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                Matches will be determined after group stage completion
              </p>
              <p className="text-sm text-gray-400">
                Top teams from each group will advance
              </p>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No matches scheduled for this day</p>
          )}
        </div>
      )}
    </div>
  )
}