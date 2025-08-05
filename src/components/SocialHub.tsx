'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Share2, 
  Trophy, 
  Users, 
  Calendar,
  TrendingUp,
  MessageCircle,
  Instagram,
  Facebook,
  AtSign,
  Video,
  ExternalLink,
  ChevronRight,
  BarChart3
} from 'lucide-react'
import { Match } from '@/types/tournament'
import ShareModal from './ShareModal'
import AnalyticsDashboard from './AnalyticsDashboard'
import { SocialSharingService } from '@/services/social/SocialSharingService'

interface SocialHubProps {
  matches?: Match[]
}

export default function SocialHub({ matches = [] }: SocialHubProps) {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [recentMatches, setRecentMatches] = useState<Match[]>([])
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([])
  const [showAnalytics, setShowAnalytics] = useState(false)
  
  const sharingService = SocialSharingService.getInstance()

  useEffect(() => {
    const completed = matches
      .filter(m => m.status === 'completed')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
    
    const upcoming = matches
      .filter(m => m.status === 'scheduled')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5)
    
    setRecentMatches(completed)
    setUpcomingMatches(upcoming)
  }, [matches])

  const quickShareOptions = [
    {
      title: 'Tournament Schedule',
      description: 'Share the full tournament schedule',
      icon: Calendar,
      color: 'bg-blue-500',
      action: () => {
        const shareData = {
          title: 'MSS Melaka Basketball 2025 Schedule',
          description: `🏀 MSS Melaka Basketball Championship 2025\n\n📅 August 4-7, 2025\n📍 Melaka\n\n👥 107 Teams | 🏀 129 Matches\n\nFollow the action!`,
          url: window.location.href,
          hashtags: ['MSSMelaka2025', 'Basketball', 'Tournament'],
          contentType: 'schedule' as const,
          contentId: 'tournament-schedule'
        }
        sharingService.shareGeneric(shareData)
      }
    },
    {
      title: 'Live Scores',
      description: 'Share link to live match updates',
      icon: TrendingUp,
      color: 'bg-green-500',
      action: () => {
        const shareData = {
          title: 'Live Scores - MSS Melaka Basketball 2025',
          description: '🔴 LIVE NOW! Follow real-time scores and updates from MSS Melaka Basketball Championship 2025',
          url: window.location.href,
          hashtags: ['MSSMelaka2025', 'LiveScores', 'Basketball'],
          contentType: 'tournament' as const,
          contentId: 'live-scores'
        }
        sharingService.shareGeneric(shareData)
      }
    },
    {
      title: 'Tournament Highlights',
      description: 'Share tournament highlights reel',
      icon: Trophy,
      color: 'bg-yellow-500',
      action: () => {
        const shareData = {
          title: 'Tournament Highlights - MSS Melaka 2025',
          description: '🏆 Check out the best moments from MSS Melaka Basketball Championship 2025!',
          url: window.location.href,
          hashtags: ['MSSMelaka2025', 'Highlights', 'Basketball'],
          contentType: 'tournament' as const,
          contentId: 'tournament-highlights'
        }
        sharingService.shareGeneric(shareData)
      }
    }
  ]

  const socialLinks = [
    {
      platform: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-green-500',
      url: 'https://wa.me/?text=Follow MSS Melaka Basketball 2025'
    },
    {
      platform: 'Instagram',
      icon: Instagram,
      color: 'bg-gradient-to-br from-pink-500 to-purple-600',
      url: 'https://instagram.com'
    },
    {
      platform: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600',
      url: 'https://facebook.com'
    },
    {
      platform: 'X',
      icon: AtSign,
      color: 'bg-black dark:bg-gray-800',
      url: 'https://x.com'
    },
    {
      platform: 'TikTok',
      icon: Video,
      color: 'bg-black',
      url: 'https://tiktok.com'
    }
  ]

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-4 mb-4">
          <h2 className="font-display text-4xl text-gray-900 dark:text-white">
            SOCIAL HUB
          </h2>
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              showAnalytics 
                ? 'bg-mss-turquoise text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="font-medium">Analytics</span>
          </button>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Share the excitement with fans around the world
        </p>
      </div>

      {/* Analytics Dashboard */}
      {showAnalytics && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <AnalyticsDashboard />
        </motion.div>
      )}

      {/* Quick Share Options */}
      <div>
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Quick Share
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickShareOptions.map((option, index) => (
            <motion.button
              key={option.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={option.action}
              className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all group"
            >
              <div className={`w-12 h-12 ${option.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <option.icon className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                {option.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {option.description}
              </p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Recent Match Results */}
      {recentMatches.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Share Recent Results
          </h3>
          <div className="space-y-3">
            {recentMatches.map((match) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        match.division === 'boys' 
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400'
                      }`}>
                        {match.division === 'boys' ? 'Boys' : 'Girls'}
                      </span>
                      <span className="text-xs text-gray-500">
                        Match #{match.matchNumber}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="font-medium">{match.teamA.name}</div>
                        <div className="text-2xl font-display">{match.scoreA}</div>
                      </div>
                      <div className="text-gray-400">-</div>
                      <div className="flex-1 text-right">
                        <div className="font-medium">{match.teamB.name}</div>
                        <div className="text-2xl font-display">{match.scoreB}</div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedMatch(match)}
                    className="ml-4 p-3 bg-gradient-to-r from-mss-turquoise to-teal-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Follow Us */}
      <div>
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Follow Us
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {socialLinks.map((link) => (
            <a
              key={link.platform}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${link.color} text-white p-4 rounded-xl flex flex-col items-center gap-2 hover:opacity-90 transition-opacity`}
            >
              <link.icon className="w-6 h-6" />
              <span className="text-sm font-medium">{link.platform}</span>
              <ExternalLink className="w-4 h-4 opacity-70" />
            </a>
          ))}
        </div>
      </div>

      {/* Tournament Stats */}
      <div className="bg-gradient-to-r from-mss-turquoise to-cbl-orange p-8 rounded-2xl text-white">
        <h3 className="text-2xl font-display mb-6">Tournament Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-4xl font-display mb-2">107</div>
            <div className="text-sm opacity-90">Teams</div>
          </div>
          <div>
            <div className="text-4xl font-display mb-2">129</div>
            <div className="text-sm opacity-90">Matches</div>
          </div>
          <div>
            <div className="text-4xl font-display mb-2">4</div>
            <div className="text-sm opacity-90">Days</div>
          </div>
          <div>
            <div className="text-4xl font-display mb-2">8</div>
            <div className="text-sm opacity-90">Venues</div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {selectedMatch && (
        <ShareModal
          match={selectedMatch}
          onClose={() => setSelectedMatch(null)}
        />
      )}
    </div>
  )
}