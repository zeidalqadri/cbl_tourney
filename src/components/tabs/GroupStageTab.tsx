'use client'

import { useState } from 'react'
import GroupStandings from '@/components/GroupStandings'
import { Users, Trophy } from 'lucide-react'

export default function GroupStageTab() {
  const [selectedDivision, setSelectedDivision] = useState<'boys' | 'girls'>('boys')
  
  // Boys have groups LB-LN (11 groups), Girls have groups PA-PH (8 groups)
  const boysGroups = ['LB', 'LC', 'LD', 'LE', 'LG', 'LH', 'LI', 'LK', 'LL', 'LM', 'LN']
  const girlsGroups = ['PA', 'PB', 'PC', 'PD', 'PE', 'PF', 'PG', 'PH']
  
  const groups = selectedDivision === 'boys' ? boysGroups : girlsGroups

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-7 h-7 text-mss-turquoise" />
            Group Stage Standings
          </h2>
          
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedDivision('boys')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedDivision === 'boys'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Boys Division
            </button>
            <button
              onClick={() => setSelectedDivision('girls')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedDivision === 'girls'
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Girls Division
            </button>
          </div>
        </div>

        <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <h3 className="font-semibold text-gray-900">Qualification Rules</h3>
          </div>
          <p className="text-sm text-gray-700">
            {selectedDivision === 'boys' 
              ? "Top team from each group advances to the Second Round (knockout stage)"
              : "Top team from each group advances to the Quarter Finals (knockout stage)"}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Teams are ranked by: 1) Points, 2) Head-to-head, 3) Point differential
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {groups.map((group) => (
            <div key={group} className="bg-gray-50 rounded-lg p-1">
              <GroupStandings groupName={group} division={selectedDivision} />
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Tournament Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total Teams:</span>
              <p className="text-2xl font-bold text-gray-900">
                {selectedDivision === 'boys' ? '44' : '32'}
              </p>
            </div>
            <div>
              <span className="text-gray-600">Groups:</span>
              <p className="text-2xl font-bold text-gray-900">
                {groups.length}
              </p>
            </div>
            <div>
              <span className="text-gray-600">Group Matches:</span>
              <p className="text-2xl font-bold text-gray-900">
                {selectedDivision === 'boys' ? '66' : '48'}
              </p>
            </div>
            <div>
              <span className="text-gray-600">Qualifiers:</span>
              <p className="text-2xl font-bold text-green-600">
                {groups.length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}