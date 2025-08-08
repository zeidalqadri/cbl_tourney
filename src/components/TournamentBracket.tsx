'use client'

import { useEffect, useState } from 'react'
import { Match, TournamentBracket as BracketType } from '@/types/tournament'
import { getTournamentBracket, subscribeToMatches } from '@/lib/tournament-api'
import { Trophy, Users, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react'
import MatchProgressionButton from './MatchProgressionButton'

interface BracketMatchProps {
  match: Match
  roundName: string
  showAdminControls?: boolean
  onProgressComplete?: () => void
}

function BracketMatch({ match, roundName, showAdminControls = false, onProgressComplete }: BracketMatchProps) {
  const isCompleted = match.status === 'completed'
  const hasTeams = match.teamA.id && match.teamB.id
  const canProgress = isCompleted && match.round !== 'Final' && hasTeams
  const needsTeams = !match.teamA.id || !match.teamB.id
  
  // Determine winner
  const getWinner = () => {
    if (!isCompleted || match.scoreA === undefined || match.scoreB === undefined) return null
    if (match.scoreA > match.scoreB) return 'A'
    if (match.scoreB > match.scoreA) return 'B'
    return null
  }
  
  const winner = getWinner()
  
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="text-xs text-gray-500 mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>{roundName}</span>
          <span className={`px-2 py-0.5 rounded-full font-medium ${
            match.division === 'boys' 
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-pink-100 text-pink-700'
          }`}>
            {match.division === 'boys' ? 'Boys' : 'Girls'}
          </span>
        </div>
        <span>Match #{match.matchNumber}</span>
      </div>
      
      <div className="space-y-2">
        {/* Team A */}
        <div className={`flex items-center justify-between p-2 rounded transition-all ${
          winner === 'A' 
            ? 'bg-gradient-to-r from-green-100 to-emerald-100 border border-green-300' 
            : 'bg-gray-50'
        }`}>
          <div className="flex items-center space-x-2">
            <Users className={`h-4 w-4 ${winner === 'A' ? 'text-green-600' : 'text-gray-400'}`} />
            <div className="flex flex-col">
              <span className={`${!hasTeams && match.teamA.name.includes('Winner') ? 'text-gray-400 italic' : ''} ${winner === 'A' ? 'font-semibold text-green-700' : ''}`}>
                {match.teamA.name}
              </span>
              {winner === 'A' && (
                <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  WINNER
                </span>
              )}
            </div>
          </div>
          <span className={`text-lg font-mono ${winner === 'A' ? 'text-green-700 font-bold' : ''}`}>
            {match.scoreA ?? '-'}
          </span>
        </div>
        
        {/* Team B */}
        <div className={`flex items-center justify-between p-2 rounded transition-all ${
          winner === 'B' 
            ? 'bg-gradient-to-r from-green-100 to-emerald-100 border border-green-300' 
            : 'bg-gray-50'
        }`}>
          <div className="flex items-center space-x-2">
            <Users className={`h-4 w-4 ${winner === 'B' ? 'text-green-600' : 'text-gray-400'}`} />
            <div className="flex flex-col">
              <span className={`${!hasTeams && match.teamB.name.includes('Winner') ? 'text-gray-400 italic' : ''} ${winner === 'B' ? 'font-semibold text-green-700' : ''}`}>
                {match.teamB.name}
              </span>
              {winner === 'B' && (
                <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  WINNER
                </span>
              )}
            </div>
          </div>
          <span className={`text-lg font-mono ${winner === 'B' ? 'text-green-700 font-bold' : ''}`}>
            {match.scoreB ?? '-'}
          </span>
        </div>
      </div>
      
      <div className="mt-3 text-xs text-gray-500 space-y-1">
        <div className="flex justify-between">
          <span>{match.date}</span>
          <span>{match.time}</span>
        </div>
        <div>{match.venue}</div>
      </div>
      
      {/* Progression Status Indicators */}
      {needsTeams && (
        <div className="mt-3 flex items-center gap-2 text-amber-600 bg-amber-50 p-2 rounded">
          <AlertCircle className="w-4 h-4" />
          <span className="text-xs">Waiting for teams from previous matches</span>
        </div>
      )}
      
      {canProgress && (
        <div className="mt-3 border-t pt-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
            <span className="text-xs text-yellow-700 font-medium">Ready for progression</span>
          </div>
          
          {showAdminControls && (
            <MatchProgressionButton
              match={match}
              mode="match"
              onProgress={onProgressComplete}
            />
          )}
        </div>
      )}
    </div>
  )
}

interface BracketData {
  boys: BracketType | null
  girls: BracketType | null
}

export default function TournamentBracket() {
  const [brackets, setBrackets] = useState<BracketData>({ boys: null, girls: null })
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    loadBrackets()
    
    // Check if user is admin (simplified check - in production use proper auth)
    const pathname = window.location.pathname
    setIsAdmin(pathname.includes('/admin'))
    
    // Subscribe to match updates
    const unsubscribe = subscribeToMatches(async () => {
      await loadBrackets()
    })
    
    return () => {
      unsubscribe()
    }
  }, [])

  async function loadBrackets() {
    try {
      const [boysBracket, girlsBracket] = await Promise.all([
        getTournamentBracket('boys'),
        getTournamentBracket('girls')
      ])
      setBrackets({ boys: boysBracket, girls: girlsBracket })
    } catch (error) {
      console.error('Error loading brackets:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading brackets...</div>
  }

  if (!brackets.boys && !brackets.girls) {
    return <div className="text-center py-8 text-gray-500">No bracket data available</div>
  }

  // Combine all knockout matches for display
  const allKnockoutMatches: { match: Match; roundName: string; division: 'boys' | 'girls' }[] = []
  
  // Add boys second round matches
  if (brackets.boys?.secondRound) {
    brackets.boys.secondRound.forEach(match => {
      allKnockoutMatches.push({ match, roundName: 'Boys Second Round', division: 'boys' })
    })
  }
  
  // Add girls quarter finals
  if (brackets.girls?.quarterFinals) {
    brackets.girls.quarterFinals.forEach(match => {
      allKnockoutMatches.push({ match, roundName: 'Girls Quarter Final', division: 'girls' })
    })
  }
  
  // Add semi finals
  if (brackets.boys?.semiFinals) {
    brackets.boys.semiFinals.forEach(match => {
      allKnockoutMatches.push({ match, roundName: 'Semi Final', division: 'boys' })
    })
  }
  if (brackets.girls?.semiFinals) {
    brackets.girls.semiFinals.forEach(match => {
      allKnockoutMatches.push({ match, roundName: 'Semi Final', division: 'girls' })
    })
  }
  
  // Add finals
  if (brackets.boys?.final) {
    brackets.boys.final.forEach(match => {
      allKnockoutMatches.push({ match, roundName: 'Final', division: 'boys' })
    })
  }
  if (brackets.girls?.final) {
    brackets.girls.final.forEach(match => {
      allKnockoutMatches.push({ match, roundName: 'Final', division: 'girls' })
    })
  }
  
  // Sort by match number
  allKnockoutMatches.sort((a, b) => a.match.matchNumber - b.match.matchNumber)
  
  const hasKnockoutMatches = allKnockoutMatches.length > 0

  return (
    <div className="pb-20">
      <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center mb-6">
        <Trophy className="h-6 w-6 mr-2 text-yellow-500" />
        <h2 className="text-xl font-bold">Tournament Bracket</h2>
      </div>
      
      {!hasKnockoutMatches ? (
        <div className="text-center py-12 text-gray-500">
          <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Knockout rounds will begin after group stage completion</p>
          <p className="text-sm mt-2">Group winners will automatically advance to the next round</p>
        </div>
      ) : (
        <div>
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> The knockout stage features mixed boys and girls matches on August 6, 2025.
            </p>
          </div>
          
          <div className="space-y-6">
            {/* Group by date for better visualization */}
            <div>
              <h3 className="font-semibold mb-4">August 6, 2025 - Knockout Day</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allKnockoutMatches
                  .filter(({ match }) => match.date === '2025-08-06')
                  .map(({ match, roundName }) => (
                    <BracketMatch 
                      key={match.id} 
                      match={match} 
                      roundName={roundName}
                      showAdminControls={isAdmin}
                      onProgressComplete={loadBrackets}
                    />
                  ))}
              </div>
            </div>
            
            {/* Finals Day */}
            {allKnockoutMatches.some(({ match }) => match.date === '2025-08-07') && (
              <div>
                <h3 className="font-semibold mb-4 flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                  August 7, 2025 - Finals Day
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allKnockoutMatches
                    .filter(({ match }) => match.date === '2025-08-07')
                    .map(({ match, roundName }) => (
                      <BracketMatch 
                      key={match.id} 
                      match={match} 
                      roundName={roundName}
                      showAdminControls={isAdmin}
                      onProgressComplete={loadBrackets}
                    />
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  )
}