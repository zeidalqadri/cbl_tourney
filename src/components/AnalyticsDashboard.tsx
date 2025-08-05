'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  Share2, 
  Users,
  Calendar,
  ChevronRight,
  MessageCircle,
  Instagram,
  Facebook,
  AtSign,
  Video
} from 'lucide-react'
import { SocialSharingService } from '@/services/social/SocialSharingService'
import { ShareStats } from '@/services/social/AnalyticsService'
import { SocialPlatform } from '@/types/social'

const platformConfig: Record<SocialPlatform, { name: string; icon: any; color: string }> = {
  whatsapp: { name: 'WhatsApp', icon: MessageCircle, color: 'bg-green-500' },
  x: { name: 'X', icon: AtSign, color: 'bg-gray-900' },
  instagram: { name: 'Instagram', icon: Instagram, color: 'bg-gradient-to-r from-pink-500 to-purple-600' },
  facebook: { name: 'Facebook', icon: Facebook, color: 'bg-blue-600' },
  tiktok: { name: 'TikTok', icon: Video, color: 'bg-black' }
}

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState<ShareStats | null>(null)
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform | null>(null)
  const [platformStats, setPlatformStats] = useState<any>(null)
  const [mostShared, setMostShared] = useState<Array<{ contentId: string; shares: number }>>([])
  
  const sharingService = SocialSharingService.getInstance()

  useEffect(() => {
    loadAnalytics()
    const interval = setInterval(loadAnalytics, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (selectedPlatform) {
      const engagement = sharingService.getPlatformEngagement(selectedPlatform)
      setPlatformStats(engagement)
    }
  }, [selectedPlatform])

  function loadAnalytics() {
    const analyticsData = sharingService.getAnalytics()
    setStats(analyticsData)
    
    const topContent = sharingService.getMostSharedContent(5)
    setMostShared(topContent)
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mss-turquoise"></div>
      </div>
    )
  }

  const maxShares = Math.max(...Object.values(stats.sharesByPlatform))

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <Share2 className="w-8 h-8 text-mss-turquoise" />
            <span className="text-sm text-gray-500">Total</span>
          </div>
          <div className="text-3xl font-display font-bold">{stats.totalShares}</div>
          <div className="text-sm text-gray-500 mt-1">Total Shares</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 text-green-500" />
            <span className="text-sm text-gray-500">Rate</span>
          </div>
          <div className="text-3xl font-display font-bold">{stats.successRate.toFixed(1)}%</div>
          <div className="text-sm text-gray-500 mt-1">Success Rate</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <BarChart3 className="w-8 h-8 text-cbl-orange" />
            <span className="text-sm text-gray-500">Popular</span>
          </div>
          <div className="text-3xl font-display font-bold capitalize">
            {stats.mostPopularPlatform || 'N/A'}
          </div>
          <div className="text-sm text-gray-500 mt-1">Top Platform</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 text-purple-500" />
            <span className="text-sm text-gray-500">Content</span>
          </div>
          <div className="text-3xl font-display font-bold">{mostShared.length}</div>
          <div className="text-sm text-gray-500 mt-1">Shared Items</div>
        </motion.div>
      </div>

      {/* Platform Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-semibold mb-6">Platform Breakdown</h3>
        <div className="space-y-4">
          {Object.entries(stats.sharesByPlatform).map(([platform, shares]) => {
            const config = platformConfig[platform as SocialPlatform]
            const percentage = maxShares > 0 ? (shares / maxShares) * 100 : 0
            
            return (
              <motion.div
                key={platform}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedPlatform(platform as SocialPlatform)}
                className="cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${config.color} rounded-lg flex items-center justify-center text-white`}>
                      <config.icon className="w-5 h-5" />
                    </div>
                    <span className="font-medium">{config.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-xl">{shares}</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className={`h-2 rounded-full ${config.color}`}
                  />
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Platform Details */}
      {selectedPlatform && platformStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold flex items-center gap-3">
              <div className={`w-10 h-10 ${platformConfig[selectedPlatform].color} rounded-lg flex items-center justify-center text-white`}>
                {(() => {
                  const Icon = platformConfig[selectedPlatform].icon
                  return <Icon className="w-5 h-5" />
                })()}
              </div>
              {platformConfig[selectedPlatform].name} Details
            </h3>
            <button
              onClick={() => setSelectedPlatform(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="text-2xl font-display font-bold">{platformStats.totalShares}</div>
              <div className="text-sm text-gray-500">Total Shares</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="text-2xl font-display font-bold">{platformStats.successRate.toFixed(1)}%</div>
              <div className="text-sm text-gray-500">Success Rate</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="text-2xl font-display font-bold">
                {platformStats.lastShare 
                  ? new Date(platformStats.lastShare).toLocaleDateString()
                  : 'N/A'
                }
              </div>
              <div className="text-sm text-gray-500">Last Share</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="text-2xl font-display font-bold">{platformStats.popularContent.length}</div>
              <div className="text-sm text-gray-500">Popular Items</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Recent Shares */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-semibold mb-6">Recent Shares</h3>
        <div className="space-y-3">
          {stats.recentShares.slice(0, 5).map((share, index) => {
            const config = platformConfig[share.platform]
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 ${config.color} rounded-lg flex items-center justify-center text-white`}>
                    <config.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-medium capitalize">{share.contentType}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(share.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className={`text-sm font-medium ${share.success ? 'text-green-500' : 'text-red-500'}`}>
                  {share.success ? 'Success' : 'Failed'}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}