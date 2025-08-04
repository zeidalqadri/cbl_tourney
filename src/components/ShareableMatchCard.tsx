'use client'

import { useState, useRef } from 'react'
import { Match } from '@/types/tournament'
import { motion, AnimatePresence } from 'framer-motion'
import { Share2, Download, Copy, Check, X } from 'lucide-react'
import html2canvas from 'html2canvas'

interface ShareableMatchCardProps {
  match: Match
  onClose?: () => void
}

export default function ShareableMatchCard({ match, onClose }: ShareableMatchCardProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const getWinner = () => {
    if (match.status !== 'completed' || !match.scoreA || !match.scoreB) return null
    if (match.scoreA > match.scoreB) return 'A'
    if (match.scoreB > match.scoreA) return 'B'
    return null
  }

  const winner = getWinner()

  const generateImage = async () => {
    if (!cardRef.current) return
    
    setIsGenerating(true)
    try {
      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,
        allowTaint: true,
      })
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `match-${match.matchNumber}-result.png`
          a.click()
          URL.revokeObjectURL(url)
        }
      })
    } catch (error) {
      console.error('Error generating image:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = () => {
    const text = `🏀 MSS Melaka Basketball 2025

Match #${match.matchNumber} - ${match.division === 'boys' ? 'Boys' : 'Girls'} Division

${match.teamA.name}: ${match.scoreA || 0}
${match.teamB.name}: ${match.scoreB || 0}

${winner ? `🏆 Winner: ${winner === 'A' ? match.teamA.name : match.teamB.name}` : ''}

📍 ${match.venue} | ${match.date} ${match.time}

#MSSMelaka2025 #Basketball #Tournament`

    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        style={{ 
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          willChange: 'opacity'
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative max-w-md w-full"
          style={{ willChange: 'transform, opacity' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          )}

          {/* Shareable Card */}
          <div
            ref={cardRef}
            className="relative bg-cbl-charcoal rounded-2xl overflow-hidden shadow-2xl"
            style={{ 
              background: 'linear-gradient(135deg, #4A4A4A 0%, #2A2A2A 50%, #4A4A4A 100%)',
              willChange: 'auto'
            }}
          >
            {/* Tournament Header */}
            <div 
              className="p-1"
              style={{ background: 'linear-gradient(90deg, #40E0D0 0%, #D2691E 100%)' }}
            >
              <div className="bg-cbl-charcoal p-4 text-white text-center">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <span className="text-mss-turquoise font-bold text-xs">MSS</span>
                  </div>
                  <h1 className="font-display text-2xl">MSS MELAKA BASKETBALL 2025</h1>
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <span className="text-cbl-orange font-bold text-xs">CBL</span>
                  </div>
                </div>
                <p className="text-sm opacity-80">U12 CHAMPIONSHIP</p>
              </div>
            </div>

            {/* Match Info */}
            <div className="p-6 space-y-6">
              <div className="text-center text-white">
                <span className={`inline-block px-4 py-1 rounded-full text-sm font-medium mb-2 ${
                  match.division === 'boys' 
                    ? 'bg-blue-500/30 text-blue-300 border border-blue-400/50' 
                    : 'bg-pink-500/30 text-pink-300 border border-pink-400/50'
                }`}>
                  {match.division === 'boys' ? 'BOYS DIVISION' : 'GIRLS DIVISION'}
                </span>
                <h2 className="font-display text-3xl">MATCH #{match.matchNumber}</h2>
              </div>

              {/* Teams and Scores */}
              <div className="space-y-4">
                <div 
                  className={`rounded-xl p-4 ${
                    winner === 'A' ? 'ring-2 ring-winner-gold' : ''
                  }`}
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    boxShadow: winner === 'A' ? '0 0 20px rgba(255, 215, 0, 0.2)' : 'none'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-semibold text-lg">{match.teamA.name}</h3>
                      {winner === 'A' && (
                        <span className="text-winner-gold text-sm font-medium">🏆 WINNER</span>
                      )}
                    </div>
                    <span className={`font-display text-5xl ${
                      winner === 'A' ? 'text-winner-gold' : 'text-white'
                    }`}>
                      {match.scoreA ?? '-'}
                    </span>
                  </div>
                </div>

                <div className="text-center">
                  <span className="text-gray-400 font-display text-xl">VS</span>
                </div>

                <div 
                  className={`rounded-xl p-4 ${
                    winner === 'B' ? 'ring-2 ring-winner-gold' : ''
                  }`}
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    boxShadow: winner === 'B' ? '0 0 20px rgba(255, 215, 0, 0.2)' : 'none'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-semibold text-lg">{match.teamB.name}</h3>
                      {winner === 'B' && (
                        <span className="text-winner-gold text-sm font-medium">🏆 WINNER</span>
                      )}
                    </div>
                    <span className={`font-display text-5xl ${
                      winner === 'B' ? 'text-winner-gold' : 'text-white'
                    }`}>
                      {match.scoreB ?? '-'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Match Details */}
              <div className="flex items-center justify-center gap-6 text-sm text-gray-300">
                <span>📍 {match.venue}</span>
                <span>📅 {match.date}</span>
                <span>⏰ {match.time}</span>
              </div>

              {/* Status */}
              <div className="text-center">
                <span className={`inline-block px-6 py-2 rounded-full font-medium ${
                  match.status === 'completed' 
                    ? 'bg-green-500/20 text-green-400 border border-green-400/50' 
                    : match.status === 'in_progress'
                    ? 'bg-live-pulse/20 text-live-pulse border border-live-pulse/50 animate-pulse'
                    : 'bg-gray-500/20 text-gray-400 border border-gray-400/50'
                }`}>
                  {match.status === 'completed' ? 'FINAL SCORE' : 
                   match.status === 'in_progress' ? 'LIVE NOW' : 'UPCOMING'}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div 
              className="p-1"
              style={{ background: 'linear-gradient(90deg, #40E0D0 0%, #D2691E 100%)' }}
            >
              <div className="bg-cbl-charcoal p-3 text-center">
                <p className="text-white/60 text-xs">#MSSMelaka2025 #BasketballChampionship</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={generateImage}
              disabled={isGenerating}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-mss-turquoise to-teal-500 text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Download className="w-5 h-5" />
              {isGenerating ? 'Generating...' : 'Download Image'}
            </button>
            <button
              onClick={copyToClipboard}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-cbl-orange to-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  Copy Text
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}