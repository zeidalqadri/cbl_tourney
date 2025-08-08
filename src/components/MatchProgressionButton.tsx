'use client'

import { useState } from 'react'
import { Match, Division } from '@/types/tournament'
import { 
  progressMatchWinner, 
  progressToKnockoutStage, 
  autoFillKnockoutBracket,
  checkGroupStageComplete,
  updateFinalPositions,
  progressAllCompletedMatches
} from '@/lib/tournament-progression'
import { 
  Trophy, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  Users,
  Zap
} from 'lucide-react'

interface MatchProgressionButtonProps {
  match?: Match
  division?: Division
  mode: 'match' | 'division' | 'tournament'
  onProgress?: () => void
}

export default function MatchProgressionButton({ 
  match, 
  division, 
  mode, 
  onProgress 
}: MatchProgressionButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleMatchProgression = async () => {
    if (!match || match.status !== 'completed') return
    
    setLoading(true)
    setError(null)
    
    try {
      await progressMatchWinner(match.id)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      onProgress?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to progress winner')
    } finally {
      setLoading(false)
    }
  }

  const handleDivisionProgression = async () => {
    if (!division) return
    
    setLoading(true)
    setError(null)
    
    try {
      const isComplete = await checkGroupStageComplete(division)
      if (!isComplete) {
        setError(`Group stage not complete for ${division} division`)
        return
      }
      
      await progressToKnockoutStage(division)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      onProgress?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to progress division')
    } finally {
      setLoading(false)
    }
  }

  const handleTournamentProgression = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const results = await autoFillKnockoutBracket()
      const successCount = results.filter(r => r.success).length
      
      if (successCount === 0) {
        setError('No divisions ready for progression')
      } else if (successCount < results.length) {
        setError(`Partially complete: ${successCount}/${results.length} divisions progressed`)
      } else {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      }
      
      onProgress?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to progress tournament')
    } finally {
      setLoading(false)
    }
  }

  const handleClick = () => {
    switch (mode) {
      case 'match':
        handleMatchProgression()
        break
      case 'division':
        handleDivisionProgression()
        break
      case 'tournament':
        handleTournamentProgression()
        break
    }
  }

  // Determine button state and appearance
  const getButtonConfig = () => {
    if (mode === 'match' && match) {
      if (match.status !== 'completed') {
        return {
          disabled: true,
          icon: AlertCircle,
          text: 'Match Not Complete',
          className: 'bg-gray-300 cursor-not-allowed'
        }
      }
      
      if (match.round === 'Final') {
        return {
          disabled: false,
          icon: Trophy,
          text: 'Update Final Positions',
          className: 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600'
        }
      }
      
      return {
        disabled: false,
        icon: ChevronRight,
        text: 'Progress Winner',
        className: 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
      }
    }
    
    if (mode === 'division') {
      return {
        disabled: false,
        icon: Users,
        text: `Progress ${division || 'Division'} to Knockouts`,
        className: 'bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600'
      }
    }
    
    return {
      disabled: false,
      icon: Zap,
      text: 'Auto-Fill All Brackets',
      className: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
    }
  }

  const config = getButtonConfig()
  const Icon = config.icon

  return (
    <div className="space-y-2">
      <button
        onClick={handleClick}
        disabled={config.disabled || loading}
        className={`
          px-6 py-3 rounded-lg font-semibold text-white
          transition-all duration-200 transform hover:scale-105
          flex items-center gap-2 justify-center
          ${config.className}
          ${loading ? 'opacity-50 cursor-wait' : ''}
          ${config.disabled ? 'opacity-50' : ''}
        `}
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : success ? (
          <>
            <CheckCircle className="h-5 w-5" />
            Success!
          </>
        ) : (
          <>
            <Icon className="h-5 w-5" />
            {config.text}
          </>
        )}
      </button>
      
      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      
      {success && (
        <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm">
            {mode === 'match' && 'Winner progressed to next round!'}
            {mode === 'division' && 'Teams progressed to knockout stage!'}
            {mode === 'tournament' && 'All brackets updated successfully!'}
          </span>
        </div>
      )}
    </div>
  )
}

/**
 * Bulk progression button for all completed matches
 */
export function BulkProgressionButton({ onComplete }: { onComplete?: () => void }) {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleBulkProgression = async () => {
    setLoading(true)
    setError(null)
    setResults(null)
    
    try {
      const progressionResults = await progressAllCompletedMatches()
      setResults(progressionResults)
      
      if (progressionResults.processed > 0) {
        setTimeout(() => {
          onComplete?.()
          setResults(null)
        }, 3000)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to progress matches')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleBulkProgression}
        disabled={loading}
        className={`
          w-full px-6 py-3 rounded-lg font-semibold text-white
          transition-all duration-200 transform hover:scale-105
          flex items-center gap-2 justify-center
          bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600
          ${loading ? 'opacity-50 cursor-wait' : ''}
        `}
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Processing Matches...
          </>
        ) : (
          <>
            <Zap className="h-5 w-5" />
            Progress All Completed Matches
          </>
        )}
      </button>
      
      {results && (
        <div className={`p-4 rounded-lg ${results.errors > 0 ? 'bg-yellow-50' : 'bg-green-50'}`}>
          <div className="font-semibold mb-2">
            {results.processed > 0 
              ? `✅ Progressed ${results.processed} match${results.processed > 1 ? 'es' : ''}`
              : '⚠️ No matches to progress'}
          </div>
          {results.errors > 0 && (
            <div className="text-sm text-yellow-700">
              ⚠️ {results.errors} error{results.errors > 1 ? 's' : ''} occurred
            </div>
          )}
          {results.matches.length > 0 && (
            <div className="mt-2 text-sm space-y-1">
              {results.matches.map((m: any, i: number) => (
                <div key={i} className={m.status === 'error' ? 'text-red-600' : 'text-green-600'}>
                  Match #{m.matchNumber} ({m.round}): {m.status === 'error' ? `❌ ${m.error}` : `✅ ${m.winner} advanced`}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}
    </div>
  )
}

/**
 * Batch progression component for admin dashboard
 */
export function TournamentProgressionPanel() {
  const [activeTab, setActiveTab] = useState<'auto' | 'manual'>('auto')

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-500" />
          Tournament Progression
        </h2>
        
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('auto')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'auto'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Automatic
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'manual'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Manual
          </button>
        </div>
      </div>
      
      {activeTab === 'auto' ? (
        <div className="space-y-4">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-semibold text-purple-900 mb-2">Bulk Match Progression</h3>
            <p className="text-sm text-purple-700 mb-4">
              Progress all completed knockout matches to advance winners to the next round.
            </p>
            <BulkProgressionButton onComplete={() => window.location.reload()} />
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Auto-Fill Brackets</h3>
            <p className="text-sm text-blue-700 mb-4">
              Automatically fill knockout brackets with qualified teams from group stages.
            </p>
            <MatchProgressionButton
              mode="tournament"
              onProgress={() => window.location.reload()}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-3">Boys Division</h4>
              <MatchProgressionButton
                division="boys"
                mode="division"
                onProgress={() => window.location.reload()}
              />
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-3">Girls Division</h4>
              <MatchProgressionButton
                division="girls"
                mode="division"
                onProgress={() => window.location.reload()}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-900 mb-2">Manual Progression</h3>
            <p className="text-sm text-yellow-700">
              Progress individual match winners after each match completion.
              This is handled automatically when updating match scores.
            </p>
          </div>
          
          <div className="text-sm text-gray-600">
            <p>To manually progress a match winner:</p>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Go to the match details page</li>
              <li>Update the final score</li>
              <li>Click "Progress Winner" button</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  )
}