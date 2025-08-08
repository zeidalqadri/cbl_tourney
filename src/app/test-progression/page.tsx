'use client'

import { useState } from 'react'
import { CheckCircle, RefreshCw, Trophy, AlertCircle, Play } from 'lucide-react'

// Import functions directly to avoid module resolution issues
async function simulateGroupWinners() {
  const { supabase } = await import('@/lib/supabase')
  const TOURNAMENT_ID = '66666666-6666-6666-6666-666666666666'
  
  const groups = {
    boys: ['LB', 'LC', 'LD', 'LE', 'LG', 'LH', 'LI', 'LK', 'LL', 'LM', 'LN'],
    girls: ['PA', 'PB', 'PC', 'PD', 'PE', 'PF', 'PG', 'PH']
  }

  const results = []

  for (const [division, poolList] of Object.entries(groups)) {
    for (const pool of poolList) {
      const { data: teams, error } = await supabase
        .from('tournament_teams')
        .select('*')
        .eq('tournament_id', TOURNAMENT_ID)
        .eq('pool', pool)
        .eq('division', division)
        .limit(1)

      if (error) {
        console.error(`Error getting teams for ${pool}:`, error)
        continue
      }

      if (teams && teams.length > 0) {
        const winner = teams[0]
        
        const { error: updateError } = await supabase
          .from('tournament_teams')
          .update({
            qualification_status: 'through',
            group_position: 1,
            current_stage: division === 'boys' ? 'second_round' : 'quarter_final',
            updated_at: new Date().toISOString()
          })
          .eq('id', winner.id)

        if (updateError) {
          console.error(`Error updating team ${winner.team_name}:`, updateError)
        } else {
          results.push({
            team: winner.team_name,
            pool,
            division,
            status: 'qualified'
          })
          console.log(`✅ Marked ${winner.team_name} as qualified from Group ${pool}`)
        }
      }
    }
  }

  return results
}

async function resetQualifications() {
  const { supabase } = await import('@/lib/supabase')
  const TOURNAMENT_ID = '66666666-6666-6666-6666-666666666666'
  
  const { error } = await supabase
    .from('tournament_teams')
    .update({
      qualification_status: 'active',
      group_position: null,
      current_stage: 'group_stage',
      updated_at: new Date().toISOString()
    })
    .eq('tournament_id', TOURNAMENT_ID)

  if (error) {
    console.error('Error resetting qualifications:', error)
    return false
  }

  console.log('✅ Reset all team qualifications')
  return true
}

async function getQualificationStatus() {
  const { supabase } = await import('@/lib/supabase')
  const TOURNAMENT_ID = '66666666-6666-6666-6666-666666666666'
  
  const { data, error } = await supabase
    .from('tournament_teams')
    .select('team_name, pool, division, qualification_status, group_position, current_stage')
    .eq('tournament_id', TOURNAMENT_ID)
    .eq('qualification_status', 'through')

  if (error) {
    console.error('Error getting qualification status:', error)
    return []
  }

  return data || []
}

export default function TestProgressionPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [qualifiedTeams, setQualifiedTeams] = useState<any[]>([])
  const [message, setMessage] = useState('')

  async function handleSimulate() {
    setLoading(true)
    setMessage('Simulating group winners...')
    try {
      const simulationResults = await simulateGroupWinners()
      setResults(simulationResults)
      
      // Get updated qualification status
      const qualified = await getQualificationStatus()
      setQualifiedTeams(qualified)
      
      setMessage(`✅ Successfully marked ${simulationResults.length} teams as qualified!`)
    } catch (error) {
      console.error('Error simulating winners:', error)
      setMessage('❌ Error simulating winners. Check console for details.')
    } finally {
      setLoading(false)
    }
  }

  async function handleReset() {
    setLoading(true)
    setMessage('Resetting all qualifications...')
    try {
      const success = await resetQualifications()
      if (success) {
        setResults([])
        setQualifiedTeams([])
        setMessage('✅ All qualifications have been reset.')
      } else {
        setMessage('❌ Error resetting qualifications.')
      }
    } catch (error) {
      console.error('Error resetting:', error)
      setMessage('❌ Error resetting qualifications. Check console for details.')
    } finally {
      setLoading(false)
    }
  }

  async function checkStatus() {
    setLoading(true)
    setMessage('Checking qualification status...')
    try {
      const qualified = await getQualificationStatus()
      setQualifiedTeams(qualified)
      setMessage(`Found ${qualified.length} qualified teams.`)
    } catch (error) {
      console.error('Error checking status:', error)
      setMessage('❌ Error checking status. Check console for details.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4 flex items-center">
            <Trophy className="h-6 w-6 mr-2 text-yellow-500" />
            Tournament Progression Test Page
          </h1>
          
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 mb-2">
              <strong>Testing Instructions:</strong>
            </p>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>Click "Simulate Group Winners" to mark the first team from each group as qualified</li>
              <li>Navigate to the Group Stage tab to see qualification indicators</li>
              <li>Check the Knockout tab to see "Awaiting Qualification" placeholders</li>
              <li>Use "Reset All" to restore teams to active status</li>
            </ol>
          </div>

          <div className="flex gap-4 mb-6">
            <button
              onClick={handleSimulate}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="h-4 w-4" />
              Simulate Group Winners
            </button>
            
            <button
              onClick={handleReset}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className="h-4 w-4" />
              Reset All
            </button>
            
            <button
              onClick={checkStatus}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <AlertCircle className="h-4 w-4" />
              Check Status
            </button>
          </div>

          {message && (
            <div className={`p-4 rounded-lg mb-6 ${
              message.includes('✅') ? 'bg-green-50 text-green-800' :
              message.includes('❌') ? 'bg-red-50 text-red-800' :
              'bg-gray-50 text-gray-800'
            }`}>
              {message}
            </div>
          )}

          {results.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3">Simulation Results</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {results.map((result, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">
                      <strong>{result.team}</strong> - Group {result.pool} ({result.division})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {qualifiedTeams.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Currently Qualified Teams</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="text-left p-2 text-sm">Team</th>
                      <th className="text-left p-2 text-sm">Group</th>
                      <th className="text-left p-2 text-sm">Division</th>
                      <th className="text-left p-2 text-sm">Current Stage</th>
                      <th className="text-left p-2 text-sm">Position</th>
                    </tr>
                  </thead>
                  <tbody>
                    {qualifiedTeams.map((team: any) => (
                      <tr key={team.team_name} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{team.team_name}</td>
                        <td className="p-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                            {team.pool}
                          </span>
                        </td>
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            team.division === 'boys' 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'bg-pink-100 text-pink-700'
                          }`}>
                            {team.division}
                          </span>
                        </td>
                        <td className="p-2">
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                            {team.current_stage}
                          </span>
                        </td>
                        <td className="p-2">
                          {team.group_position && (
                            <span className="flex items-center gap-1">
                              <Trophy className="h-3 w-3 text-yellow-500" />
                              #{team.group_position}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-semibold mb-1">Development Mode Only</p>
              <p>This page is for testing tournament progression. After testing:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Navigate to the main app to see UI changes</li>
                <li>Check Group Stage tab for qualification badges</li>
                <li>View Knockout tab for bracket updates</li>
                <li>Remember to reset before production use</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}