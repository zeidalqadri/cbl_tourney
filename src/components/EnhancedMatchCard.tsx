'use client'

import { useState, useEffect, memo } from 'react'
import { Match } from '@/types/tournament'
import { formatTime } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, MapPin, Users, TrendingUp, Zap, Share2, Camera, Play } from 'lucide-react'
import ShareModal from './ShareModal'
import MediaViewer from './MediaViewer'
import { MediaContent } from '@/types/media'
// import { useRealtimeMedia } from '@/hooks/useRealtimeMedia'
import { getMatchMedia } from '@/lib/media-api'
import { MatchCoverageBadge } from './MatchCoverage'
import { MatchVideoBadge, MatchVideoLink } from './MatchVideoLink'

interface EnhancedMatchCardProps {
  match: Match
}

const EnhancedMatchCard = memo(function EnhancedMatchCard({ match }: EnhancedMatchCardProps) {
  const [prevScoreA, setPrevScoreA] = useState(match.scoreA)
  const [prevScoreB, setPrevScoreB] = useState(match.scoreB)
  const [scoreAnimateA, setScoreAnimateA] = useState(false)
  const [scoreAnimateB, setScoreAnimateB] = useState(false)
  const [showShareCard, setShowShareCard] = useState(false)
  const [showMedia, setShowMedia] = useState(false)
  const [mediaContent, setMediaContent] = useState<MediaContent | null>(null)
  const [loadingMedia, setLoadingMedia] = useState(false)
  const lastUpdate = null

  useEffect(() => {
    if (match.scoreA !== prevScoreA) {
      setScoreAnimateA(true)
      setPrevScoreA(match.scoreA)
      setTimeout(() => setScoreAnimateA(false), 600)
    }
    if (match.scoreB !== prevScoreB) {
      setScoreAnimateB(true)
      setPrevScoreB(match.scoreB)
      setTimeout(() => setScoreAnimateB(false), 600)
    }
  }, [match.scoreA, match.scoreB, prevScoreA, prevScoreB])

  const isLive = match.status === 'in_progress'
  const isCompleted = match.status === 'completed'
  const hasStarted = match.scoreA !== undefined || match.scoreB !== undefined
  const isPlaceholderMatch = match.teamA.name.includes('Winner') || match.teamA.name.includes('Champion') || 
                             match.teamB.name.includes('Winner') || match.teamB.name.includes('Champion')

  const getStatusColor = () => {
    switch (match.status) {
      case 'completed': return 'bg-green-500'
      case 'in_progress': return 'bg-live-pulse animate-pulse'
      default: return 'bg-gray-400'
    }
  }

  const getWinner = () => {
    if (!isCompleted || match.scoreA === undefined || match.scoreB === undefined) return null
    if (match.scoreA > match.scoreB) return 'A'
    if (match.scoreB > match.scoreA) return 'B'
    return null
  }

  const winner = getWinner()

  const handleMediaClick = async () => {
    setShowMedia(!showMedia)
    if (!showMedia && !mediaContent) {
      setLoadingMedia(true)
      try {
        const result = await getMatchMedia(match.id)
        if (result.success) {
          setMediaContent(result.mediaContent)
        }
      } catch (error) {
        console.error('Failed to fetch media:', error)
      } finally {
        setLoadingMedia(false)
      }
    }
  }

  // Show indicator for new media
  const hasNewMedia = false

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      className={`relative bg-white dark:bg-card-dark rounded-xl shadow-lg overflow-hidden transition-all duration-300 ${
        isLive ? 'match-card-live' : ''
      }`}
    >
      {/* Live Indicator */}
      {isLive && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-live animate-pulse" />
      )}

      {/* Match Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
            <span className="text-white font-medium">Match #{match.matchNumber}</span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              match.division === 'boys' 
                ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30' 
                : 'bg-pink-500/20 text-pink-300 border border-pink-400/30'
            }`}>
              {match.division === 'boys' ? 'BOYS' : 'GIRLS'}
            </span>
            <MatchCoverageBadge venue={match.venue} />
            <MatchVideoBadge match={match} />
          </div>
          {isLive && (
            <div className="flex items-center gap-2 text-live-pulse">
              <Zap className="w-4 h-4 animate-pulse" />
              <span className="font-display text-lg">LIVE</span>
            </div>
          )}
        </div>
      </div>

      {/* Teams and Scores */}
      <div className="p-6 space-y-4">
        {/* Team A */}
        <div className={`flex items-center justify-between p-4 rounded-lg transition-all ${
          winner === 'A' ? 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30' : 'bg-blue-50 dark:bg-blue-900/20'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-mss-turquoise/20 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-mss-turquoise" />
            </div>
            <div>
              <h3 className={`font-semibold text-lg ${winner === 'A' ? 'text-green-700 dark:text-green-400' : ''} ${isPlaceholderMatch && (match.teamA.name.includes('Winner') || match.teamA.name.includes('Champion')) ? 'text-gray-500 italic' : ''}`}>
                {match.teamA.name}
              </h3>
              {winner === 'A' && <span className="text-xs text-green-600 dark:text-green-400 font-medium">WINNER</span>}
            </div>
          </div>
          <div className="text-right">
            <AnimatePresence mode="wait">
              {hasStarted ? (
                <motion.span
                  key={match.scoreA}
                  initial={scoreAnimateA ? { scale: 1.5, color: '#FF6B35' } : false}
                  animate={{ scale: 1, color: winner === 'A' ? '#16a34a' : '#000000' }}
                  className={`font-display text-4xl ${scoreAnimateA ? 'score-update' : ''}`}
                >
                  {match.scoreA ?? '0'}
                </motion.span>
              ) : (
                <span className="font-display text-4xl text-gray-300">-</span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* VS Divider */}
        <div className="flex items-center justify-center">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
          <span className="px-4 font-display text-xl text-gray-400">VS</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
        </div>

        {/* Team B */}
        <div className={`flex items-center justify-between p-4 rounded-lg transition-all ${
          winner === 'B' ? 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30' : 'bg-orange-50 dark:bg-orange-900/20'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-cbl-orange/20 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-cbl-orange" />
            </div>
            <div>
              <h3 className={`font-semibold text-lg ${winner === 'B' ? 'text-green-700 dark:text-green-400' : ''} ${isPlaceholderMatch && (match.teamB.name.includes('Winner') || match.teamB.name.includes('Champion')) ? 'text-gray-500 italic' : ''}`}>
                {match.teamB.name}
              </h3>
              {winner === 'B' && <span className="text-xs text-green-600 dark:text-green-400 font-medium">WINNER</span>}
            </div>
          </div>
          <div className="text-right">
            <AnimatePresence mode="wait">
              {hasStarted ? (
                <motion.span
                  key={match.scoreB}
                  initial={scoreAnimateB ? { scale: 1.5, color: '#FF6B35' } : false}
                  animate={{ scale: 1, color: winner === 'B' ? '#16a34a' : '#000000' }}
                  className={`font-display text-4xl ${scoreAnimateB ? 'score-update' : ''}`}
                >
                  {match.scoreB ?? '0'}
                </motion.span>
              ) : (
                <span className="font-display text-4xl text-gray-300">-</span>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Match Info Footer */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{match.time}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{match.venue}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleMediaClick}
              className={`relative flex items-center gap-1 px-3 py-1 rounded-lg transition-all ${
                showMedia 
                  ? 'bg-mss-turquoise text-white' 
                  : 'text-gray-500 hover:text-mss-turquoise hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span className="font-medium">Media</span>
              {hasNewMedia && !showMedia && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              )}
            </button>
            <button
              onClick={() => setShowShareCard(true)}
              className="flex items-center gap-1 text-gray-500 hover:text-mss-turquoise transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span className="font-medium">Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* Media Section */}
      <AnimatePresence>
        {showMedia && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              {loadingMedia ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mss-turquoise"></div>
                </div>
              ) : mediaContent ? (
                <MediaViewer 
                  mediaContent={mediaContent}
                  matchNumber={match.matchNumber}
                  teams={{
                    teamA: match.teamA.name,
                    teamB: match.teamB.name
                  }}
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Camera className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No media available</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Particle Effects for Scores */}
      {(scoreAnimateA || scoreAnimateB) && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: scoreAnimateA ? '25%' : '75%',
                y: '50%',
                scale: 0,
                opacity: 1
              }}
              animate={{ 
                x: `${scoreAnimateA ? 25 : 75}%`,
                y: `${50 + (Math.random() - 0.5) * 100}%`,
                scale: 1.5,
                opacity: 0
              }}
              transition={{ duration: 0.8, delay: i * 0.05 }}
              className="absolute w-2 h-2 bg-score-burst rounded-full"
            />
          ))}
        </div>
      )}

      {/* Share Modal */}
      {showShareCard && (
        <ShareModal 
          match={match} 
          onClose={() => setShowShareCard(false)} 
        />
      )}
    </motion.div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison to prevent unnecessary re-renders
  return (
    prevProps.match.id === nextProps.match.id &&
    prevProps.match.scoreA === nextProps.match.scoreA &&
    prevProps.match.scoreB === nextProps.match.scoreB &&
    prevProps.match.status === nextProps.match.status &&
    prevProps.match.updatedAt === nextProps.match.updatedAt
  )
})

export default EnhancedMatchCard