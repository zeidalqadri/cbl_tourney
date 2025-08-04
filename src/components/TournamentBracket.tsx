'use client'

import { useEffect, useState } from 'react'
import { Match, TournamentBracket as BracketType } from '@/types/tournament'
import { getTournamentBracket, subscribeToMatches } from '@/lib/tournament-api'
import { Trophy, Users, ChevronRight } from 'lucide-react'

interface BracketMatchProps {
  match: Match
  roundName: string
}

function BracketMatch({ match, roundName }: BracketMatchProps) {
  const isCompleted = match.status === 'completed'
  const hasTeams = match.teamA.id && match.teamB.id
  
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
        <div className={`flex items-center justify-between p-2 rounded ${
          isCompleted && match.scoreA! > match.scoreB! ? 'bg-green-50 font-semibold' : ''
        }`}>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-gray-400" />
            <span className={!hasTeams && match.teamA.name.includes('Winner') ? 'text-gray-400 italic' : ''}>
              {match.teamA.name}
            </span>
          </div>
          <span className="text-lg font-mono">{match.scoreA ?? '-'}</span>
        </div>
        
        <div className={`flex items-center justify-between p-2 rounded ${
          isCompleted && match.scoreB! > match.scoreA! ? 'bg-green-50 font-semibold' : ''
        }`}>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-gray-400" />
            <span className={!hasTeams && match.teamB.name.includes('Winner') ? 'text-gray-400 italic' : ''}>
              {match.teamB.name}
            </span>
          </div>
          <span className="text-lg font-mono">{match.scoreB ?? '-'}</span>
        </div>
      </div>
      
      <div className="mt-3 text-xs text-gray-500 space-y-1">
        <div className="flex justify-between">
          <span>{match.date}</span>
          <span>{match.time}</span>
        </div>
        <div>{match.venue}</div>
      </div>
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

  useEffect(() => {
    loadBrackets()
    
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
    <div className="bg-white rounded-lg shadow-sm p-6 pb-8">
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
                    <BracketMatch key={match.id} match={match} roundName={roundName} />
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allKnockoutMatches
                    .filter(({ match }) => match.date === '2025-08-07')
                    .map(({ match, roundName }) => (
                      <BracketMatch key={match.id} match={match} roundName={roundName} />
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Tournament Structure Info */}
      <div className="mt-8 mb-4 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
        <h4 className="font-semibold mb-2">Tournament Structure:</h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h5 className="font-medium text-blue-700 mb-1">Boys Division:</h5>
            <p>• Group Stage (14 groups) → Second Round (4 groups) → Semi Finals → Final</p>
            <p>• Group winners advance to Second Round groups (LXA, LXB, LYA, LYB)</p>
            <p>• Second Round group winners advance to Semi Finals</p>
          </div>
          <div>
            <h5 className="font-medium text-pink-700 mb-1">Girls Division:</h5>
            <p>• Group Stage (8 groups) → Quarter Finals → Semi Finals → Final</p>
            <p>• Group winners advance directly to Quarter Finals</p>
          </div>
        </div>
      </div>
    </div>
  )
}