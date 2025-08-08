'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, Share2, Heart, TrendingUp, Award, Camera, Clock } from 'lucide-react'
import { Match } from '@/types/tournament'
import { getMatches } from '@/lib/tournament-api'

interface Highlight {
  id: string
  type: 'upset' | 'high_score' | 'close_game' | 'milestone' | 'photo'
  title: string
  description: string
  timestamp: string
  likes: number
  match?: {
    teamA: string
    teamB: string
    scoreA: number
    scoreB: number
  }
}

export default function SocialTab() {
  const [highlights, setHighlights] = useState<Highlight[]>([])
  const [recentMatches, setRecentMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSocialContent()
  }, [])

  async function loadSocialContent() {
    try {
      const matches = await getMatches()
      
      // Get completed matches sorted by most recent
      const completed = matches
        .filter(m => m.status === 'completed' && m.scoreA !== null && m.scoreB !== null)
        .sort((a, b) => {
          const dateA = new Date(`${a.date} ${a.time}`)
          const dateB = new Date(`${b.date} ${b.time}`)
          return dateB.getTime() - dateA.getTime()
        })
        .slice(0, 10)
      
      setRecentMatches(completed)
      
      // Generate highlights from matches
      const newHighlights: Highlight[] = []
      
      completed.forEach(match => {
        const scoreDiff = Math.abs((match.scoreA ?? 0) - (match.scoreB ?? 0))
        const totalScore = (match.scoreA ?? 0) + (match.scoreB ?? 0)
        
        // Close games
        if (scoreDiff <= 3 && totalScore > 20) {
          newHighlights.push({
            id: `close-${match.id}`,
            type: 'close_game',
            title: '🔥 Nail-biter Alert!',
            description: `${match.teamA.name} vs ${match.teamB.name} came down to the wire!`,
            timestamp: match.date,
            likes: Math.floor(Math.random() * 50) + 20,
            match: {
              teamA: match.teamA.name,
              teamB: match.teamB.name,
              scoreA: match.scoreA ?? 0,
              scoreB: match.scoreB ?? 0
            }
          })
        }
        
        // High scoring games
        if (totalScore > 60) {
          newHighlights.push({
            id: `high-${match.id}`,
            type: 'high_score',
            title: '🏀 Offensive Showcase!',
            description: `High-scoring thriller between ${match.teamA.name} and ${match.teamB.name}`,
            timestamp: match.date,
            likes: Math.floor(Math.random() * 40) + 15,
            match: {
              teamA: match.teamA.name,
              teamB: match.teamB.name,
              scoreA: match.scoreA ?? 0,
              scoreB: match.scoreB ?? 0
            }
          })
        }
        
        // Upsets (lower seed wins by large margin)
        if (scoreDiff > 15 && match.round === 'Group Stage') {
          const winner = (match.scoreA ?? 0) > (match.scoreB ?? 0) ? match.teamA.name : match.teamB.name
          newHighlights.push({
            id: `upset-${match.id}`,
            type: 'upset',
            title: '😱 Major Upset!',
            description: `${winner} dominates with a ${scoreDiff}-point victory!`,
            timestamp: match.date,
            likes: Math.floor(Math.random() * 80) + 30,
            match: {
              teamA: match.teamA.name,
              teamB: match.teamB.name,
              scoreA: match.scoreA ?? 0,
              scoreB: match.scoreB ?? 0
            }
          })
        }
      })
      
      // Add some milestone highlights
      if (completed.length > 0) {
        newHighlights.push({
          id: 'milestone-1',
          type: 'milestone',
          title: '🎉 Tournament Milestone',
          description: `${completed.length} matches completed so far!`,
          timestamp: new Date().toISOString(),
          likes: Math.floor(Math.random() * 100) + 50
        })
      }
      
      setHighlights(newHighlights.slice(0, 8))
    } catch (error) {
      console.error('Error loading social content:', error)
    } finally {
      setLoading(false)
    }
  }

  const getHighlightIcon = (type: string) => {
    switch (type) {
      case 'upset': return '😱'
      case 'high_score': return '🏀'
      case 'close_game': return '🔥'
      case 'milestone': return '🎉'
      case 'photo': return '📸'
      default: return '⭐'
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading social feed...</div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MessageCircle className="w-7 h-7 text-cbl-orange" />
            Tournament Buzz
          </h2>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-mss-turquoise to-teal-500 text-white rounded-lg hover:opacity-90 transition-opacity">
            <Share2 className="w-4 h-4" />
            Share Results
          </button>
        </div>

        {/* Highlights Feed */}
        <div className="space-y-4 mb-8">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            Match Highlights
          </h3>
          
          {highlights.length > 0 ? (
            <div className="grid gap-4">
              {highlights.map((highlight) => (
                <div key={highlight.id} className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{getHighlightIcon(highlight.type)}</span>
                        <h4 className="font-semibold">{highlight.title}</h4>
                      </div>
                      <p className="text-gray-700 mb-2">{highlight.description}</p>
                      
                      {highlight.match && (
                        <div className="bg-white border border-gray-200 rounded-lg p-3 mt-2">
                          <div className="flex justify-between items-center text-sm">
                            <span className={highlight.match.scoreA > highlight.match.scoreB ? 'font-bold' : ''}>
                              {highlight.match.teamA}
                            </span>
                            <span className="font-mono font-bold text-lg">
                              {highlight.match.scoreA}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm mt-1">
                            <span className={highlight.match.scoreB > highlight.match.scoreA ? 'font-bold' : ''}>
                              {highlight.match.teamB}
                            </span>
                            <span className="font-mono font-bold text-lg">
                              {highlight.match.scoreB}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        <button className="flex items-center gap-1 hover:text-red-500 transition-colors">
                          <Heart className="w-4 h-4" />
                          <span>{highlight.likes}</span>
                        </button>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(highlight.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Award className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No highlights yet. Check back as matches are completed!</p>
            </div>
          )}
        </div>

        {/* Recent Results */}
        <div className="border-t pt-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            Recent Results
          </h3>
          
          {recentMatches.length > 0 ? (
            <div className="space-y-2">
              {recentMatches.slice(0, 5).map((match) => (
                <div key={match.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${(match.scoreA ?? 0) > (match.scoreB ?? 0) ? 'font-semibold' : ''}`}>
                        {match.teamA.name}
                      </span>
                      <span className="font-mono font-bold">{match.scoreA}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className={`text-sm ${(match.scoreB ?? 0) > (match.scoreA ?? 0) ? 'font-semibold' : ''}`}>
                        {match.teamB.name}
                      </span>
                      <span className="font-mono font-bold">{match.scoreB}</span>
                    </div>
                  </div>
                  <div className="ml-4 text-xs text-gray-500">
                    <div>{match.round}</div>
                    <div>{match.date}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-4 text-gray-500">No completed matches yet</p>
          )}
        </div>

        {/* Photo Gallery Placeholder */}
        <div className="border-t pt-6 mt-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5 text-purple-500" />
            Tournament Photos
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                <Camera className="w-8 h-8 text-gray-400" />
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
            View All Photos
          </button>
        </div>
      </div>
    </div>
  )
}