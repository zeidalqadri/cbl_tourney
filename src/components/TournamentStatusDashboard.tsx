'use client'

import { useState, useEffect } from 'react'
import { Division } from '@/types/tournament'
import { getMatches, getGroupStandings } from '@/lib/tournament-api'
import { checkGroupStageComplete } from '@/lib/tournament-progression'
import { Trophy, Users, CheckCircle, Clock, AlertCircle } from 'lucide-react'

interface StageStatus {
  stage: string
  status: 'pending' | 'in_progress' | 'completed'
  matchesCompleted: number
  totalMatches: number
}

interface DivisionStatus {
  division: Division
  groupStageComplete: boolean
  currentStage: string
  stages: StageStatus[]
}

export default function TournamentStatusDashboard() {
  const [boysStatus, setBoysStatus] = useState<DivisionStatus | null>(null)
  const [girlsStatus, setGirlsStatus] = useState<DivisionStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  useEffect(() => {
    loadStatus()
    const interval = setInterval(loadStatus, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  async function loadStatus() {
    try {
      const [boysComplete, girlsComplete, allMatches] = await Promise.all([
        checkGroupStageComplete('boys'),
        checkGroupStageComplete('girls'),
        getMatches()
      ])

      // Calculate status for each division
      const calculateDivisionStatus = (division: Division): DivisionStatus => {
        const divisionMatches = allMatches.filter(m => m.division === division)
        
        // Group stage status
        const groupMatches = divisionMatches.filter(m => m.round === 'Group Stage')
        const groupCompleted = groupMatches.filter(m => m.status === 'completed').length
        
        // Quarter finals status
        const quarterMatches = divisionMatches.filter(m => m.round === 'Quarter Final')
        const quarterCompleted = quarterMatches.filter(m => m.status === 'completed').length
        
        // Semi finals status
        const semiMatches = divisionMatches.filter(m => m.round === 'Semi Final')
        const semiCompleted = semiMatches.filter(m => m.status === 'completed').length
        
        // Finals status
        const finalMatches = divisionMatches.filter(m => m.round === 'Final')
        const finalCompleted = finalMatches.filter(m => m.status === 'completed').length
        
        // Determine current stage
        let currentStage = 'Group Stage'
        if (groupCompleted === groupMatches.length && groupMatches.length > 0) {
          if (quarterCompleted < quarterMatches.length) currentStage = 'Quarter Finals'
          else if (semiCompleted < semiMatches.length) currentStage = 'Semi Finals'
          else if (finalCompleted < finalMatches.length) currentStage = 'Finals'
          else currentStage = 'Tournament Complete'
        }
        
        return {
          division,
          groupStageComplete: division === 'boys' ? boysComplete : girlsComplete,
          currentStage,
          stages: [
            {
              stage: 'Group Stage',
              status: groupCompleted === groupMatches.length ? 'completed' : 
                      groupCompleted > 0 ? 'in_progress' : 'pending',
              matchesCompleted: groupCompleted,
              totalMatches: groupMatches.length
            },
            {
              stage: 'Quarter Finals',
              status: quarterCompleted === quarterMatches.length && quarterMatches.length > 0 ? 'completed' : 
                      quarterCompleted > 0 ? 'in_progress' : 'pending',
              matchesCompleted: quarterCompleted,
              totalMatches: quarterMatches.length || 4
            },
            {
              stage: 'Semi Finals',
              status: semiCompleted === semiMatches.length && semiMatches.length > 0 ? 'completed' : 
                      semiCompleted > 0 ? 'in_progress' : 'pending',
              matchesCompleted: semiCompleted,
              totalMatches: semiMatches.length || 2
            },
            {
              stage: 'Finals',
              status: finalCompleted === finalMatches.length && finalMatches.length > 0 ? 'completed' : 
                      finalCompleted > 0 ? 'in_progress' : 'pending',
              matchesCompleted: finalCompleted,
              totalMatches: finalMatches.length || 1
            }
          ]
        }
      }

      setBoysStatus(calculateDivisionStatus('boys'))
      setGirlsStatus(calculateDivisionStatus('girls'))
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Error loading tournament status:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStageIcon = (status: 'pending' | 'in_progress' | 'completed') => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'in_progress':
        return <Clock className="w-4 h-4 text-yellow-500 animate-pulse" />
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-gray-400" />
    }
  }

  const getStageColor = (status: 'pending' | 'in_progress' | 'completed') => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'pending':
        return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-20 bg-gray-100 rounded"></div>
          <div className="h-20 bg-gray-100 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Tournament Progress
        </h3>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span>Live Updates</span>
          <span className="text-gray-400">•</span>
          <span>{lastUpdate.toLocaleTimeString()}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Boys Division */}
        {boysStatus && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-blue-900">Boys Division</h4>
                <p className="text-xs text-blue-600">{boysStatus.currentStage}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              {boysStatus.stages.map((stage) => (
                <div 
                  key={stage.stage}
                  className={`flex items-center justify-between p-3 rounded-lg border ${getStageColor(stage.status)}`}
                >
                  <div className="flex items-center gap-2">
                    {getStageIcon(stage.status)}
                    <span className="text-sm font-medium">{stage.stage}</span>
                  </div>
                  <span className="text-xs font-mono">
                    {stage.matchesCompleted}/{stage.totalMatches}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Girls Division */}
        {girlsStatus && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <h4 className="font-medium text-pink-900">Girls Division</h4>
                <p className="text-xs text-pink-600">{girlsStatus.currentStage}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              {girlsStatus.stages.map((stage) => (
                <div 
                  key={stage.stage}
                  className={`flex items-center justify-between p-3 rounded-lg border ${getStageColor(stage.status)}`}
                >
                  <div className="flex items-center gap-2">
                    {getStageIcon(stage.status)}
                    <span className="text-sm font-medium">{stage.stage}</span>
                  </div>
                  <span className="text-xs font-mono">
                    {stage.matchesCompleted}/{stage.totalMatches}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Overall Progress Bar */}
      <div className="mt-6 pt-6 border-t">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Tournament Progress</span>
          <span className="text-sm text-gray-500">
            {boysStatus && girlsStatus ? 
              Math.round(
                ((boysStatus.stages.reduce((acc, s) => acc + s.matchesCompleted, 0) +
                  girlsStatus.stages.reduce((acc, s) => acc + s.matchesCompleted, 0)) /
                 (boysStatus.stages.reduce((acc, s) => acc + s.totalMatches, 0) +
                  girlsStatus.stages.reduce((acc, s) => acc + s.totalMatches, 0))) * 100
              ) : 0}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-pink-500 h-2 rounded-full transition-all duration-500"
            style={{
              width: `${boysStatus && girlsStatus ? 
                Math.round(
                  ((boysStatus.stages.reduce((acc, s) => acc + s.matchesCompleted, 0) +
                    girlsStatus.stages.reduce((acc, s) => acc + s.matchesCompleted, 0)) /
                   (boysStatus.stages.reduce((acc, s) => acc + s.totalMatches, 0) +
                    girlsStatus.stages.reduce((acc, s) => acc + s.totalMatches, 0))) * 100
                ) : 0}%`
            }}
          />
        </div>
      </div>
    </div>
  )
}