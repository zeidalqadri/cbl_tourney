'use client'

import { motion } from 'framer-motion'
import { Home, Users, Trophy, MessageCircle, Plus, Tv } from 'lucide-react'

interface MobileNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
  hasLiveStream?: boolean
}

const navItems = [
  { id: 'matches', icon: Home, label: 'Matches' },
  { id: 'stream', icon: Tv, label: 'Stream' },
  { id: 'groups', icon: Users, label: 'Groups' },
  { id: 'bracket', icon: Trophy, label: 'Bracket' },
  { id: 'social', icon: MessageCircle, label: 'Social' },
  { id: 'input', icon: Plus, label: 'Score' },
]

export default function MobileNav({ activeTab, onTabChange, hasLiveStream }: MobileNavProps) {
  return (
    <div className="fixed bottom-0 inset-x-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id
          const Icon = item.icon
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className="relative flex flex-col items-center justify-center p-2 min-w-[50px]"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-t from-mss-turquoise/20 to-transparent rounded-lg"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <div className="relative">
                <Icon 
                  className={`w-6 h-6 transition-colors ${
                    isActive ? 'text-mss-turquoise' : 'text-gray-400'
                  }`}
                />
                {item.id === 'stream' && hasLiveStream && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                )}
              </div>
              <span className={`text-xs mt-1 font-medium ${
                isActive ? 'text-mss-turquoise' : 'text-gray-400'
              }`}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}