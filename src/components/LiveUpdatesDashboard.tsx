'use client'

import { useRealtimeMediaUpdates } from '@/hooks/useRealtimeMedia'
import { Camera, Video, Bell } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function LiveUpdatesDashboard() {
  const { recentUpdates } = useRealtimeMediaUpdates()
  
  const getTimeAgo = (timestamp: Date) => {
    const seconds = Math.floor((new Date().getTime() - timestamp.getTime()) / 1000)
    
    if (seconds < 60) return 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  if (recentUpdates.length === 0) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            <h3 className="font-semibold">Live Media Updates</h3>
          </div>
        </div>
        
        <div className="max-h-80 overflow-y-auto">
          <AnimatePresence>
            {recentUpdates.map((update, index) => (
              <motion.div
                key={`${update.matchId}-${update.timestamp.getTime()}`}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${
                    update.type === 'video' 
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' 
                      : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                  }`}>
                    {update.type === 'video' ? (
                      <Video className="w-4 h-4" />
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {update.count} new {update.type}{update.count > 1 ? 's' : ''} added
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Match {update.matchId.slice(0, 8)}...
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {getTimeAgo(update.timestamp)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}