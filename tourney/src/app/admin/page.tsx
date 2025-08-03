'use client'

import { useState, useEffect } from 'react'
import { Match } from '@/types/tournament'
import { getMatches } from '@/lib/tournament-api'
import ResultCard from '@/components/ResultCard'

export default function AdminPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAllMatches()
  }, [])

  async function loadAllMatches() {
    try {
      const data = await getMatches({ status: 'completed' })
      setMatches(data)
    } catch (error) {
      console.error('Error loading matches:', error)
    } finally {
      setLoading(false)
    }
  }

  async function generateResultCard(matchId: string) {
    try {
      const response = await fetch('/api/generate-result-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId })
      })
      
      if (response.ok) {
        alert('Result card generated successfully!')
      } else {
        alert('Failed to generate result card')
      }
    } catch (error) {
      console.error('Error generating result card:', error)
      alert('Error generating result card')
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Tournament Admin</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Completed Matches</h2>
            <div className="bg-white rounded-lg shadow-sm">
              {matches.length === 0 ? (
                <p className="p-4 text-gray-500">No completed matches yet</p>
              ) : (
                <div className="divide-y">
                  {matches.map(match => (
                    <div
                      key={match.id}
                      className="p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                      onClick={() => setSelectedMatch(match)}
                    >
                      <div>
                        <div className="font-medium">
                          Match #{match.matchNumber}: {match.teamA.name} vs {match.teamB.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          Score: {match.scoreA} - {match.scoreB}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          generateResultCard(match.id)
                        }}
                        className="px-3 py-1 bg-cbl-orange text-white rounded hover:bg-orange-600"
                      >
                        Generate Card
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Result Card Preview</h2>
            {selectedMatch ? (
              <div className="space-y-4">
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <h3 className="font-medium mb-2">Square Format (1:1)</h3>
                  <ResultCard match={selectedMatch} format="square" />
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <h3 className="font-medium mb-2">Landscape Format (16:9)</h3>
                  <ResultCard match={selectedMatch} format="landscape" />
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
                Select a match to preview result cards
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}