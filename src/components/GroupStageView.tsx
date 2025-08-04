'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import GroupStandings from './GroupStandings'

interface GroupInfo {
  name: string
  division: 'boys' | 'girls'
}

export default function GroupStageView() {
  const [groups, setGroups] = useState<GroupInfo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadGroups()
  }, [])

  async function loadGroups() {
    try {
      // Boys groups: LA through LN (14 groups)
      const boysGroups: GroupInfo[] = []
      const boysStartChar = 'A'.charCodeAt(0)
      for (let i = 0; i < 14; i++) {
        boysGroups.push({
          name: `L${String.fromCharCode(boysStartChar + i)}`,
          division: 'boys'
        })
      }

      // Girls groups: PA through PH (8 groups)
      const girlsGroups: GroupInfo[] = []
      const girlsStartChar = 'A'.charCodeAt(0)
      for (let i = 0; i < 8; i++) {
        girlsGroups.push({
          name: `P${String.fromCharCode(girlsStartChar + i)}`,
          division: 'girls'
        })
      }

      // Combine all groups
      setGroups([...boysGroups, ...girlsGroups])
    } catch (error) {
      console.error('Error loading groups:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cbl-orange mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading group standings...</p>
        </div>
      </div>
    )
  }

  const boysGroups = groups.filter(g => g.division === 'boys')
  const girlsGroups = groups.filter(g => g.division === 'girls')

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-cbl-blue mb-4">Group Stage Standings</h2>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
          <p className="text-gray-700 dark:text-gray-300 font-medium mb-3">
            Top team from each group advances to the knockout stage. Boys groups advance to Second Round, Girls groups advance to Quarter Finals.
          </p>
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <p><strong>Legend:</strong> P = Played, W = Won, L = Lost, PF = Points For, PA = Points Against, +/- = Point Differential, Pts = Points</p>
            <p><strong>Scoring:</strong> Win = 2 pts, Loss = 1 pt</p>
          </div>
        </div>
      </div>

      {/* Boys Division */}
      <div>
        <div className="flex items-center mb-4">
          <h3 className="text-xl font-semibold text-cbl-blue">Boys Division</h3>
          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
            {boysGroups.length} Groups
          </span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {boysGroups.map(group => (
            <GroupStandings
              key={group.name}
              groupName={group.name}
              division={group.division}
            />
          ))}
        </div>
      </div>

      {/* Girls Division */}
      <div>
        <div className="flex items-center mb-4">
          <h3 className="text-xl font-semibold text-cbl-blue">Girls Division</h3>
          <span className="ml-2 px-2 py-1 bg-pink-100 text-pink-800 text-xs font-medium rounded">
            {girlsGroups.length} Groups
          </span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {girlsGroups.map(group => (
            <GroupStandings
              key={group.name}
              groupName={group.name}
              division={group.division}
            />
          ))}
        </div>
      </div>
    </div>
  )
}