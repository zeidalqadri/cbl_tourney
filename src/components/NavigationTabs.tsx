'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Tv, Users, Trophy, MessageCircle, Edit3 } from 'lucide-react'
import AllMatchesTab from './tabs/AllMatchesTab'
import StreamingTab from './tabs/StreamingTab'
import GroupStageTab from './tabs/GroupStageTab'
import KnockoutTab from './tabs/KnockoutTab'
import SocialTab from './tabs/SocialTab'
import ScoreInputTab from './tabs/ScoreInputTab'

type TabId = 'matches' | 'streaming' | 'groups' | 'knockout' | 'social' | 'input'

interface Tab {
  id: TabId
  label: string
  icon: React.ComponentType<{ className?: string }>
  component: React.ComponentType
  color: string
}

const tabs: Tab[] = [
  { id: 'matches', label: 'All Matches', icon: Home, component: AllMatchesTab, color: 'text-blue-600' },
  { id: 'streaming', label: 'Streaming', icon: Tv, component: StreamingTab, color: 'text-red-600' },
  { id: 'groups', label: 'Group Stage', icon: Users, component: GroupStageTab, color: 'text-green-600' },
  { id: 'knockout', label: 'Knockout', icon: Trophy, component: KnockoutTab, color: 'text-yellow-600' },
  { id: 'social', label: 'Social', icon: MessageCircle, component: SocialTab, color: 'text-purple-600' },
  { id: 'input', label: 'Score Input', icon: Edit3, component: ScoreInputTab, color: 'text-orange-600' }
]

export default function NavigationTabs() {
  const [activeTab, setActiveTab] = useState<TabId>('matches')
  const [hasLiveStream, setHasLiveStream] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  useEffect(() => {
    // Check for live stream status
    const checkLiveStatus = () => {
      const now = new Date()
      const hours = now.getHours()
      const tournamentDates = ['2025-08-04', '2025-08-05', '2025-08-06', '2025-08-07']
      const today = now.toISOString().split('T')[0]
      
      setHasLiveStream(tournamentDates.includes(today) && hours >= 8 && hours < 18)
    }
    
    checkLiveStatus()
    const interval = setInterval(checkLiveStatus, 60000)
    
    return () => clearInterval(interval)
  }, [])

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || AllMatchesTab

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      {/* Desktop Navigation */}
      <div className="hidden md:block sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="relative px-6 py-4 transition-all hover:bg-gray-50"
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabDesktop"
                      className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-mss-turquoise to-cbl-orange"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Icon className={`w-5 h-5 ${isActive ? tab.color : 'text-gray-400'}`} />
                      {tab.id === 'streaming' && hasLiveStream && (
                        <span className="absolute -top-1 -right-1 flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                      )}
                    </div>
                    <span className={`font-medium ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>
                      {tab.label}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-50 safe-bottom">
        <div className="flex items-center justify-around py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative flex flex-col items-center justify-center p-2 min-w-[60px]"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabMobile"
                    className="absolute inset-0 bg-gradient-to-t from-mss-turquoise/20 to-transparent rounded-lg"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <div className="relative">
                  <Icon className={`w-6 h-6 transition-colors ${
                    isActive ? tab.color : 'text-gray-400'
                  }`} />
                  {tab.id === 'streaming' && hasLiveStream && (
                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                  )}
                </div>
                <span className={`text-xs mt-1 font-medium ${
                  isActive ? tab.color : 'text-gray-400'
                }`}>
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="container mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <ActiveComponent />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}