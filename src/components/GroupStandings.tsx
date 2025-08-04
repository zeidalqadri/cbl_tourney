'use client'

import { useEffect, useState } from 'react'
import { GroupStanding } from '@/types/tournament'
import { getEnhancedGroupStandings, subscribeToMatches, subscribeToQualificationUpdates } from '@/lib/tournament-api'
import { Trophy, CheckCircle, AlertCircle, XCircle } from 'lucide-react'

interface GroupStandingsProps {
  groupName: string
  division: 'boys' | 'girls'
}

function QualificationIndicator({ status, position }: { status?: string; position?: number }) {
  if (position === 1) {
    if (status === 'through') {
      return (
        <div className="flex items-center text-green-600">
          <CheckCircle className="h-4 w-4 mr-1" />
          <span className="text-xs font-medium">Qualified</span>
        </div>
      )
    }
    return (
      <div className="flex items-center text-yellow-600">
        <AlertCircle className="h-4 w-4 mr-1" />
        <span className="text-xs font-medium">Leading</span>
      </div>
    )
  }
  
  if (status === 'eliminated') {
    return (
      <div className="flex items-center text-red-600">
        <XCircle className="h-4 w-4 mr-1" />
        <span className="text-xs font-medium">Eliminated</span>
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
    
    // Subscribe to qualification updates
    const unsubscribeQualifications = subscribeToQualificationUpdates(async () => {
      await loadStandings()
    })
    
    return () => {
      unsubscribeMatches()
      unsubscribeQualifications()
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
          <thead>
            <tr className="text-left text-xs text-gray-500 border-b">
              <th className="pb-2">Pos</th>
              <th className="pb-2">Team</th>
              <th className="pb-2 text-center">P</th>
              <th className="pb-2 text-center">W</th>
              <th className="pb-2 text-center">L</th>
              <th className="pb-2 text-center">PF</th>
              <th className="pb-2 text-center">PA</th>
              <th className="pb-2 text-center">+/-</th>
              <th className="pb-2 text-center">Pts</th>
              <th className="pb-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((standing, index) => (
              <tr 
                key={standing.team_id} 
                className={`border-b ${
                  standing.position === 1 ? 'bg-green-50' : ''
                } ${
                  standing.qualification_status === 'eliminated' ? 'opacity-60' : ''
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
                    position={standing.position}
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