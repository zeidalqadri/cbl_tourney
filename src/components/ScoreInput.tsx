'use client'

import { useState, useEffect } from 'react'
import { Match } from '@/types/tournament'
import { getMatches, updateMatchScore } from '@/lib/tournament-api'
import { progressMatchWinner } from '@/lib/tournament-progression'
import { Camera, Upload, ChevronRight } from 'lucide-react'
import PhotoUpload from './PhotoUpload'
import MatchProgressionButton from './MatchProgressionButton'
import Link from 'next/link'

export default function ScoreInput() {
  const [matches, setMatches] = useState<Match[]>([])
  const [selectedMatch, setSelectedMatch] = useState<string>('')
  const [scoreA, setScoreA] = useState<string>('')
  const [scoreB, setScoreB] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showPhotoUpload, setShowPhotoUpload] = useState(false)
  const [lastCompletedMatch, setLastCompletedMatch] = useState<Match | null>(null)
  const [showProgression, setShowProgression] = useState(false)

  useEffect(() => {
    loadTodayMatches()
  }, [])

  async function loadTodayMatches() {
    try {
      const today = new Date().toISOString().split('T')[0]
      // Get ALL matches to find past unscored ones
      const allData = await getMatches()
      
      // Filter to show:
      // 1. Today's scheduled matches
      // 2. Today's in-progress matches that are still 0-0
      // 3. Past matches (before today) that are still 0-0 (indicating scores not keyed in)
      const eligibleMatches = allData.filter(match => {
        const isToday = match.date === today
        const isPast = match.date < today
        const isUnscored = (match.scoreA === 0 || match.scoreA === null) && (match.scoreB === 0 || match.scoreB === null)
        
        return (
          // Today's scheduled matches
          (isToday && match.status === 'scheduled') ||
          // Today's in-progress 0-0 matches
          (isToday && match.status === 'in_progress' && isUnscored) ||
          // Past matches that are still 0-0 (ANY status - scheduled, in_progress, or completed)
          (isPast && isUnscored)
        )
      })
      
      // Sort by date (oldest first) then by match number
      eligibleMatches.sort((a, b) => {
        if (a.date !== b.date) {
          return a.date.localeCompare(b.date)
        }
        return a.matchNumber - b.matchNumber
      })
      
      setMatches(eligibleMatches)
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
      
      // Find the updated match
      const updatedMatch = matches.find(m => m.id === selectedMatch)
      if (updatedMatch) {
        const completedMatch = {
          ...updatedMatch,
          scoreA: parseInt(scoreA),
          scoreB: parseInt(scoreB),
          status: 'completed' as const
        }
        setLastCompletedMatch(completedMatch)
        
        // Auto-progress winner for knockout matches
        if (updatedMatch.round !== 'Group Stage' && updatedMatch.round !== 'Round 1') {
          try {
            await progressMatchWinner(selectedMatch)
            console.log(`✅ Winner progressed from ${updatedMatch.round}`)
          } catch (progressError) {
            console.error('Error progressing winner:', progressError)
            // Still show the manual progression button if auto-progression fails
            setShowProgression(true)
          }
        }
      }
      
      // Reset form
      setSelectedMatch('')
      setScoreA('')
      setScoreB('')
      alert('Score submitted successfully! Result card will be generated.')
      
      // Reload matches
      loadTodayMatches()
    } catch (error) {
      console.error('Error submitting score:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      alert(`Error submitting score: ${errorMessage}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto pb-20">
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
                (() => {
                  const today = new Date().toISOString().split('T')[0]
                  const todayMatches = matches.filter(m => m.date === today)
                  const pastMatches = matches.filter(m => m.date < today)
                  
                  return (
                    <>
                      {todayMatches.length > 0 && (
                        <optgroup label="Today's Matches">
                          {todayMatches.map(match => (
                            <option key={match.id} value={match.id}>
                              Match #{match.matchNumber}: {match.teamA.name} vs {match.teamB.name}
                              {match.status === 'in_progress' ? ' (In Progress 0-0)' : ''}
                            </option>
                          ))}
                        </optgroup>
                      )}
                      {pastMatches.length > 0 && (
                        <optgroup label="Past Unscored Matches (0-0)">
                          {pastMatches.map(match => (
                            <option key={match.id} value={match.id}>
                              {new Date(match.date).toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })} - 
                              Match #{match.matchNumber}: {match.teamA.name} vs {match.teamB.name}
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </>
                  )
                })()
              ) : (
                <option disabled>No matches available for scoring</option>
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

        {/* Match Progression Section */}
        {showProgression && lastCompletedMatch && (
          <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-blue-900">
              <ChevronRight className="w-5 h-5" />
              Match Completed!
            </h3>
            <p className="text-sm text-blue-700 mb-4">
              {lastCompletedMatch.teamA.name} vs {lastCompletedMatch.teamB.name} - 
              Score: {lastCompletedMatch.scoreA} - {lastCompletedMatch.scoreB}
            </p>
            <MatchProgressionButton
              match={lastCompletedMatch}
              mode="match"
              onProgress={() => {
                setShowProgression(false)
                setLastCompletedMatch(null)
                loadTodayMatches()
              }}
            />
          </div>
        )}

        {/* Photo Upload Section */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Media Upload
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Upload photos or videos for matches
          </p>
          <button
            type="button"
            onClick={() => setShowPhotoUpload(true)}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-mss-turquoise to-teal-500 text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            <Upload className="w-5 h-5" />
            Upload Match Photos
          </button>
        </div>

      </div>

      {/* Photo Upload Modal */}
      {showPhotoUpload && (
        <PhotoUpload onClose={() => setShowPhotoUpload(false)} />
      )}
    </div>
  )
}