'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Download, 
  Share2,
  MessageCircle,
  Instagram,
  Facebook,
  AtSign,
  Video,
  ImageIcon,
  Loader2,
  Check
} from 'lucide-react'
import { Match } from '@/types/tournament'
import { SocialPlatform, ImageFormat } from '@/types/social'
import { SocialSharingService } from '@/services/social/SocialSharingService'
import { ImageGeneratorService } from '@/services/social/ImageGeneratorService'

interface ShareModalProps {
  match: Match
  onClose: () => void
}

const platforms: Array<{
  id: SocialPlatform
  name: string
  icon: any
  color: string
  gradient: string
}> = [
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: MessageCircle,
    color: '#25D366',
    gradient: 'from-green-500 to-green-600'
  },
  {
    id: 'x',
    name: 'X',
    icon: AtSign,
    color: '#000000',
    gradient: 'from-gray-700 to-gray-900'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    color: '#E4405F',
    gradient: 'from-pink-500 to-purple-600'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: Facebook,
    color: '#1877F2',
    gradient: 'from-blue-500 to-blue-600'
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: Video,
    color: '#000000',
    gradient: 'from-gray-800 to-black'
  }
]

const imageFormats: Array<{
  id: ImageFormat
  name: string
  description: string
  icon: any
}> = [
  {
    id: 'story',
    name: 'Story',
    description: '9:16 for Stories',
    icon: ImageIcon
  },
  {
    id: 'post',
    name: 'Post',
    description: '1:1 Square',
    icon: ImageIcon
  }
]

export default function ShareModal({ match, onClose }: ShareModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<ImageFormat>('post')
  const [isGenerating, setIsGenerating] = useState(false)
  const [shareStatus, setShareStatus] = useState<Record<SocialPlatform, 'idle' | 'sharing' | 'success' | 'error'>>({
    whatsapp: 'idle',
    x: 'idle',
    instagram: 'idle',
    facebook: 'idle',
    tiktok: 'idle'
  })
  
  const sharingService = SocialSharingService.getInstance()
  const imageService = ImageGeneratorService.getInstance()
  const previewRef = useRef<HTMLDivElement>(null)

  const getMatchShareData = () => ({
    matchId: match.id,
    matchNumber: match.matchNumber,
    division: match.division,
    teamA: {
      name: match.teamA.name,
      score: match.scoreA
    },
    teamB: {
      name: match.teamB.name,
      score: match.scoreB
    },
    status: match.status === 'scheduled' ? 'upcoming' : match.status as 'upcoming' | 'in_progress' | 'completed',
    venue: match.venue,
    date: match.date,
    time: match.time,
    winner: match.status === 'completed' && match.scoreA !== undefined && match.scoreB !== undefined
      ? match.scoreA > match.scoreB ? 'A' as const : match.scoreB > match.scoreA ? 'B' as const : undefined
      : undefined
  })

  const handleShare = async (platform: SocialPlatform) => {
    setShareStatus(prev => ({ ...prev, [platform]: 'sharing' }))
    
    try {
      const matchData = getMatchShareData()
      const shareText = sharingService.formatMatchShareText(matchData, platform)
      
      let imageBlob: Blob | null = null
      if (platform === 'instagram' || platform === 'tiktok') {
        setIsGenerating(true)
        imageBlob = await imageService.generateFromTemplate(matchData, selectedFormat)
        setIsGenerating(false)
      }
      
      const shareOptions = {
        title: `Match #${match.matchNumber} - MSS Melaka Basketball 2025`,
        description: shareText,
        url: window.location.href,
        hashtags: ['MSSMelaka2025', 'Basketball', 'Tournament', match.division === 'boys' ? 'BoysBasketball' : 'GirlsBasketball'],
        imageData: imageBlob || undefined,
        contentType: 'match' as const,
        contentId: match.id
      }
      
      let result
      switch (platform) {
        case 'whatsapp':
          result = await sharingService.shareToWhatsApp(shareOptions)
          break
        case 'x':
          result = await sharingService.shareToX(shareOptions)
          break
        case 'instagram':
          result = await sharingService.shareToInstagram(shareOptions)
          break
        case 'facebook':
          result = await sharingService.shareToFacebook(shareOptions)
          break
        case 'tiktok':
          result = await sharingService.shareToTikTok(shareOptions)
          break
      }
      
      setShareStatus(prev => ({ 
        ...prev, 
        [platform]: result?.success ? 'success' : 'error' 
      }))
      
      setTimeout(() => {
        setShareStatus(prev => ({ ...prev, [platform]: 'idle' }))
      }, 2000)
    } catch (error) {
      console.error(`Error sharing to ${platform}:`, error)
      setShareStatus(prev => ({ ...prev, [platform]: 'error' }))
      setTimeout(() => {
        setShareStatus(prev => ({ ...prev, [platform]: 'idle' }))
      }, 2000)
    }
  }

  const handleDownloadImage = async () => {
    setIsGenerating(true)
    try {
      const matchData = getMatchShareData()
      const blob = await imageService.generateFromTemplate(matchData, selectedFormat)
      
      if (blob) {
        await imageService.downloadImage(blob, `match-${match.matchNumber}-${selectedFormat}.png`)
      }
    } catch (error) {
      console.error('Error downloading image:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-display text-gray-900 dark:text-white">
                  Share Match Result
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Match #{match.matchNumber} • {match.division === 'boys' ? 'Boys' : 'Girls'} Division
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Format Selection */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Choose Image Format
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {imageFormats.map((format) => (
                  <button
                    key={format.id}
                    onClick={() => setSelectedFormat(format.id)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedFormat === format.id
                        ? 'border-mss-turquoise bg-mss-turquoise/10'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <format.icon className="w-6 h-6 mx-auto mb-2" />
                    <div className="font-medium">{format.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {format.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Match Preview */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-4">
                  <div className="text-right">
                    <div className="font-semibold">{match.teamA.name}</div>
                    <div className="text-2xl font-display">{match.scoreA ?? '-'}</div>
                  </div>
                  <div className="text-gray-400">VS</div>
                  <div className="text-left">
                    <div className="font-semibold">{match.teamB.name}</div>
                    <div className="text-2xl font-display">{match.scoreB ?? '-'}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {match.venue} • {match.date} {match.time}
                </div>
              </div>
            </div>

            {/* Share Platforms */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Share to Social Media
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {platforms.map((platform) => {
                  const status = shareStatus[platform.id]
                  const Icon = platform.icon
                  
                  return (
                    <button
                      key={platform.id}
                      onClick={() => handleShare(platform.id)}
                      disabled={status === 'sharing'}
                      className={`
                        relative p-4 rounded-xl font-medium transition-all
                        bg-gradient-to-r ${platform.gradient} text-white
                        hover:opacity-90 hover:scale-105
                        disabled:opacity-50 disabled:scale-100
                      `}
                    >
                      <div className="flex flex-col items-center gap-2">
                        {status === 'sharing' ? (
                          <Loader2 className="w-6 h-6 animate-spin" />
                        ) : status === 'success' ? (
                          <Check className="w-6 h-6" />
                        ) : (
                          <Icon className="w-6 h-6" />
                        )}
                        <span className="text-sm">
                          {status === 'success' ? 'Shared!' : platform.name}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Download Button */}
            <button
              onClick={handleDownloadImage}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cbl-orange to-orange-500 text-white py-3 px-4 rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating Image...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Download Image
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}