'use client'

import { useState, useEffect } from 'react'
import { Match } from '@/types/tournament'
import { getMatches, updateMatchScore } from '@/lib/tournament-api'

export default function ScoreInput() {
  const [matches, setMatches] = useState<Match[]>([])
  const [selectedMatch, setSelectedMatch] = useState<string>('')
  const [scoreA, setScoreA] = useState<string>('')
  const [scoreB, setScoreB] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTodayMatches()
  }, [])

  async function loadTodayMatches() {
    try {
      const today = new Date().toISOString().split('T')[0]
      const data = await getMatches({
        date: today,
        status: 'scheduled'
      })
      setMatches(data)
    } catch (error) {
      console.error('Error loading matches:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMatch || !scoreA || !scoreB) {
      alert('Please fill in all fields')
      return
    }

    setIsSubmitting(true)
    
    try {
      await updateMatchScore(
        selectedMatch,
        parseInt(scoreA),
        parseInt(scoreB)
      )
      
      // Reset form
      setSelectedMatch('')
      setScoreA('')
      setScoreB('')
      alert('Score submitted successfully! Result card will be generated.')
      
      // Reload matches
      loadTodayMatches()
    } catch (error) {
      console.error('Error submitting score:', error)
      alert('Error submitting score')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto pb-8">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold mb-6">Update Match Score</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Match
            </label>
            <select
              value={selectedMatch}
              onChange={(e) => setSelectedMatch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cbl-orange focus:border-transparent"
              required
              disabled={loading}
            >
              <option value="">Choose a match...</option>
              {matches.length > 0 ? (
                <optgroup label="Today's Matches">
                  {matches.map(match => (
                    <option key={match.id} value={match.id}>
                      Match #{match.matchNumber}: {match.teamA.name} vs {match.teamB.name}
                    </option>
                  ))}
                </optgroup>
              ) : (
                <option disabled>No matches scheduled for today</option>
              )}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Team A Score
              </label>
              <input
                type="number"
                value={scoreA}
                onChange={(e) => setScoreA(e.target.value)}
                min="0"
                max="999"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cbl-orange focus:border-transparent"
                placeholder="0"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Team B Score
              </label>
              <input
                type="number"
                value={scoreB}
                onChange={(e) => setScoreB(e.target.value)}
                min="0"
                max="999"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cbl-orange focus:border-transparent"
                placeholder="0"
                required
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-cbl-orange text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Score'}
            </button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-700 mb-2">Quick Tips:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Double-check scores before submitting</li>
            <li>• Result cards will be generated automatically</li>
            <li>• Bracket will update in real-time</li>
          </ul>
        </div>
      </div>
    </div>
  )
}