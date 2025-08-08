'use client'

import { useEffect, useState } from 'react'
import { GroupStanding } from '@/types/tournament'
import { getEnhancedGroupStandings, subscribeToMatches } from '@/lib/tournament-api'
import { Trophy, CheckCircle, AlertCircle, XCircle, Target, TrendingUp } from 'lucide-react'

interface GroupStandingsProps {
  groupName: string
  division: 'boys' | 'girls'
}

function QualificationIndicator({ status, position, allComplete }: { status?: string; position?: number; allComplete?: boolean }) {
  if (position === 1) {
    if (status === 'through') {
      return (
        <div className="flex items-center text-green-600">
          <Trophy className="h-4 w-4 mr-1 text-yellow-500" />
          <span className="text-xs font-medium">Qualified</span>
        </div>
      )
    }
    if (allComplete) {
      return (
        <div className="flex items-center text-green-600">
          <CheckCircle className="h-4 w-4 mr-1" />
          <span className="text-xs font-medium">Winner</span>
        </div>
      )
    }
    return (
      <div className="flex items-center text-yellow-600">
        <TrendingUp className="h-4 w-4 mr-1" />
        <span className="text-xs font-medium">Leading</span>
      </div>
    )
  }
  
  if (status === 'eliminated' || (allComplete && position !== 1)) {
    return (
      <div className="flex items-center text-gray-400">
        <XCircle className="h-4 w-4 mr-1" />
        <span className="text-xs font-medium">Eliminated</span>
      </div>
    )
  }
  
  if (status === 'active' && !allComplete) {
    return (
      <div className="flex items-center text-blue-500">
        <Target className="h-4 w-4 mr-1" />
        <span className="text-xs font-medium">Active</span>
      </div>
    )
  }
  
  return null
}

export default function GroupStandings({ groupName, division }: GroupStandingsProps) {
  const [standings, setStandings] = useState<GroupStanding[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStandings()
    
    // Subscribe to match updates
    const unsubscribeMatches = subscribeToMatches(async () => {
      await loadStandings()
    })
    
    return () => {
      unsubscribeMatches()
    }
  }, [groupName, division])

  async function loadStandings() {
    try {
      const data = await getEnhancedGroupStandings(groupName, division)
      setStandings(data)
    } catch (error) {
      console.error('Error loading standings:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-4">Loading standings...</div>
  }

  const allMatchesComplete = standings.every(s => {
    const totalGames = standings.length - 1
    return s.played === totalGames
  })

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center">
          Group {groupName} Standings
          {allMatchesComplete && standings[0]?.qualification_status === 'through' && (
            <Trophy className="h-4 w-4 ml-2 text-yellow-500" />
          )}
        </h3>
        <span className="text-sm text-gray-500">
          {division === 'boys' ? 'Boys' : 'Girls'} Division
        </span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-left text-xs uppercase text-gray-600 border-b">
              <th className="p-2">Pos</th>
              <th className="p-2">Team</th>
              <th className="p-2 text-center">P</th>
              <th className="p-2 text-center">W</th>
              <th className="p-2 text-center">L</th>
              <th className="p-2 text-center">PF</th>
              <th className="p-2 text-center">PA</th>
              <th className="p-2 text-center">+/-</th>
              <th className="p-2 text-center font-semibold">Pts</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((standing, index) => (
              <tr 
                key={standing.team_id} 
                className={`border-b transition-all ${
                  standing.qualification_status === 'through' ? 'bg-gradient-to-r from-green-50 to-emerald-50 font-medium' :
                  (standing.position || index + 1) === 1 ? 'bg-yellow-50' : ''
                } ${
                  standing.qualification_status === 'eliminated' || (allMatchesComplete && (standing.position || index + 1) !== 1) ? 'opacity-60' : ''
                }`}
              >
                <td className="py-3 text-sm">
                  {standing.position || index + 1}
                </td>
                <td className="py-3">
                  <div>
                    <div className="font-medium">{standing.team_name}</div>
                    {standing.position === 1 && allMatchesComplete && (
                      <div className="text-xs text-green-600 mt-1">
                        {division === 'boys' ? 'Advances to Second Round' : 'Advances to Quarter Finals'}
                      </div>
                    )}
                  </div>
                </td>
                <td className="py-3 text-center text-sm">{standing.played}</td>
                <td className="py-3 text-center text-sm font-medium text-green-600">
                  {standing.won}
                </td>
                <td className="py-3 text-center text-sm font-medium text-red-600">
                  {standing.lost}
                </td>
                <td className="py-3 text-center text-sm">{standing.points_for}</td>
                <td className="py-3 text-center text-sm">{standing.points_against}</td>
                <td className="py-3 text-center text-sm font-medium">
                  {standing.points_diff > 0 ? '+' : ''}{standing.points_diff}
                </td>
                <td className="py-3 text-center text-sm font-semibold">{standing.points}</td>
                <td className="py-3">
                  <QualificationIndicator 
                    status={standing.qualification_status} 
                    position={standing.position || index + 1}
                    allComplete={allMatchesComplete}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}