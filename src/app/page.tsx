'use client'

import { useState } from 'react'
import MatchList from '@/components/MatchList'
import GroupStageView from '@/components/GroupStageView'
import ScoreInput from '@/components/ScoreInput'
import TournamentBracket from '@/components/TournamentBracket'
import MobileNav from '@/components/MobileNav'
import PullToRefresh from '@/components/PullToRefresh'
import { useSwipeable } from 'react-swipeable'
import Image from 'next/image'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'matches' | 'groups' | 'bracket' | 'input' | 'social'>('matches')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const tabs = ['matches', 'groups', 'bracket', 'input'] as const
  const currentIndex = tabs.indexOf(activeTab as any)

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (currentIndex < tabs.length - 1) {
        setActiveTab(tabs[currentIndex + 1])
      }
    },
    onSwipedRight: () => {
      if (currentIndex > 0) {
        setActiveTab(tabs[currentIndex - 1])
      }
    },
    trackMouse: true
  })

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate refresh - in real app, this would reload data
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsRefreshing(false)
    window.location.reload()
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 dark:from-gray-900 dark:to-gray-800">
      <header className="bg-gradient-to-r from-cbl-charcoal via-gray-800 to-cbl-charcoal text-white p-4 shadow-xl">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                {/* Logo placeholders - will be replaced with actual logos */}
                <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                  <span className="text-mss-turquoise font-bold">MSS</span>
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                  <span className="text-cbl-orange font-bold">CBL</span>
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-display tracking-wide gradient-text">MSS MELAKA BASKETBALL 2025</h1>
                <p className="text-sm text-gray-300 font-medium tracking-wider">U12 TOURNAMENT CHAMPIONSHIP</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm">
              <div className="text-center">
                <div className="font-display text-2xl text-mss-turquoise">107</div>
                <div className="text-gray-400">TEAMS</div>
              </div>
              <div className="text-center">
                <div className="font-display text-2xl text-cbl-orange">129</div>
                <div className="text-gray-400">MATCHES</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-lg sticky top-0 z-20 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1 overflow-x-auto custom-scrollbar">
            <button
              onClick={() => setActiveTab('matches')}
              className={`px-6 py-4 font-semibold transition-all whitespace-nowrap ${
                activeTab === 'matches'
                  ? 'text-mss-turquoise border-b-3 border-mss-turquoise bg-gradient-to-t from-mss-turquoise/10 to-transparent'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              Live Matches
            </button>
            <button
              onClick={() => setActiveTab('groups')}
              className={`px-6 py-4 font-semibold transition-all whitespace-nowrap ${
                activeTab === 'groups'
                  ? 'text-mss-turquoise border-b-3 border-mss-turquoise bg-gradient-to-t from-mss-turquoise/10 to-transparent'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              Group Stage
            </button>
            <button
              onClick={() => setActiveTab('bracket')}
              className={`px-6 py-4 font-semibold transition-all whitespace-nowrap ${
                activeTab === 'bracket'
                  ? 'text-mss-turquoise border-b-3 border-mss-turquoise bg-gradient-to-t from-mss-turquoise/10 to-transparent'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              Knockout Stage
            </button>
            <button
              onClick={() => setActiveTab('input')}
              className={`px-6 py-4 font-semibold transition-all whitespace-nowrap ${
                activeTab === 'input'
                  ? 'text-mss-turquoise border-b-3 border-mss-turquoise bg-gradient-to-t from-mss-turquoise/10 to-transparent'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              Score Input
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-6 pb-20 md:pb-6">
        <PullToRefresh onRefresh={handleRefresh}>
          <div className="max-w-7xl mx-auto" {...handlers}>
            {activeTab === 'matches' && <MatchList />}
            {activeTab === 'groups' && <GroupStageView />}
            {activeTab === 'bracket' && <TournamentBracket />}
            {activeTab === 'input' && <ScoreInput />}
            {activeTab === 'social' && (
              <div className="text-center py-16">
                <h2 className="font-display text-3xl text-gray-700 dark:text-gray-300 mb-4">SOCIAL HUB</h2>
                <p className="text-gray-500">Coming soon - Share moments and connect with fans!</p>
              </div>
            )}
          </div>
        </PullToRefresh>
      </div>

      {/* Mobile Navigation */}
      <MobileNav activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab as any)} />
    </main>
  )
}