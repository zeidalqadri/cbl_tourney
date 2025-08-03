'use client'

import { useEffect, useState } from 'react'
import { Match } from '@/types/tournament'
import { formatTime } from '@/lib/utils'
import { getMatches, subscribeToMatches } from '@/lib/tournament-api'

export default function MatchList() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState('2025-08-04')

  useEffect(() => {
    loadMatches()
  }, [selectedDate])

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
      const data = await getMatches({
        date: selectedDate
      })
      setMatches(data)
    } catch (error) {
      console.error('Error loading matches:', error)
    } finally {
      setLoading(false)
    }
  }

  const dates = ['2025-08-04', '2025-08-05', '2025-08-06', '2025-08-07']

  if (loading) {
    return <div className="text-center py-8">Loading matches...</div>
  }

  return (
    <div>
      <div className="mb-6 flex space-x-2 overflow-x-auto pb-2">
        {dates.map(date => (
          <button
            key={date}
            onClick={() => setSelectedDate(date)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${
              selectedDate === date
                ? 'bg-cbl-orange text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {new Date(date).toLocaleDateString('en-MY', { 
              weekday: 'short', 
              day: 'numeric', 
              month: 'short' 
            })}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {matches.filter(m => m.date === selectedDate).map(match => (
          <div key={match.id} className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Match #{match.matchNumber}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  match.division === 'boys' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-pink-100 text-pink-700'
                }`}>
                  {match.division === 'boys' ? 'Boys' : 'Girls'}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-700">{match.venue}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{match.teamA.name}</span>
                  <span className="text-2xl font-bold">
                    {match.scoreA !== undefined ? match.scoreA : '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">{match.teamB.name}</span>
                  <span className="text-2xl font-bold">
                    {match.scoreB !== undefined ? match.scoreB : '-'}
                  </span>
                </div>
              </div>
              
              <div className="ml-4 text-right">
                <div className="text-lg font-medium">{match.time}</div>
                <div className={`text-sm px-2 py-1 rounded ${
                  match.status === 'completed' ? 'bg-green-100 text-green-700' :
                  match.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {match.status.replace('_', ' ')}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}