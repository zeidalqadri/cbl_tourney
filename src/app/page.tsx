'use client'

import { useState, useEffect } from 'react'
import MatchList from '@/components/MatchList'
import GroupStageView from '@/components/GroupStageView'
import ScoreInput from '@/components/ScoreInput'
import TournamentBracket from '@/components/TournamentBracket'
import MobileNav from '@/components/MobileNav'
import PullToRefresh from '@/components/PullToRefresh'
import SocialHub from '@/components/SocialHub'
import StreamView from '@/components/StreamView'
import { useSwipeable } from 'react-swipeable'
import Image from 'next/image'
import { Match } from '@/types/tournament'
import { getMatches } from '@/lib/tournament-api'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'matches' | 'stream' | 'groups' | 'bracket' | 'input' | 'social'>('matches')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [matches, setMatches] = useState<Match[]>([])
  const [hasLiveStream, setHasLiveStream] = useState(false)
  const [selectedMatchNumber, setSelectedMatchNumber] = useState<number | null>(null)
  const [selectedMatchDetails, setSelectedMatchDetails] = useState<{
    teamA?: string
    teamB?: string
    venue?: string
  }>({})

  const tabs = ['matches', 'stream', 'groups', 'bracket', 'social', 'input'] as const
  const currentIndex = tabs.indexOf(activeTab as any)

  useEffect(() => {
    loadMatches()
    
    // Check URL parameters on load
    const urlParams = new URLSearchParams(window.location.search)
    const tabParam = urlParams.get('tab')
    const matchParam = urlParams.get('match')
    const teamA = urlParams.get('teamA')
    const teamB = urlParams.get('teamB')
    const venue = urlParams.get('venue')
    
    if (tabParam === 'stream') {
      setActiveTab('stream')
      if (matchParam) {
        setSelectedMatchNumber(parseInt(matchParam))
        setSelectedMatchDetails({
          teamA: teamA || undefined,
          teamB: teamB || undefined,
          venue: venue || undefined
        })
      }
    }
  }, [])

  async function loadMatches() {
    try {
      const data = await getMatches()
      setMatches(data)
    } catch (error) {
      console.error('Error loading matches:', error)
    }
  }

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
                {/* Organization logos */}
                <div className="w-12 h-12 bg-white rounded-lg p-1 flex items-center justify-center">
                  <Image 
                    src="/mss-logo.png" 
                    alt="Majlis Sukan Sekolah Melaka" 
                    width={44} 
                    height={44} 
                    className="object-contain"
                  />
                </div>
                <div className="w-12 h-12 bg-white rounded-lg p-1 flex items-center justify-center">
                  <Image 
                    src="/cbl-logo.png" 
                    alt="CBL Fastbreak" 
                    width={44} 
                    height={44} 
                    className="object-contain"
                  />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-display tracking-wide gradient-text">Majlis Sukan Sekolah Melaka Basketball 2025</h1>
                <p className="text-sm text-gray-300 font-medium tracking-wider">U-12 • August 4-7, 2025 • Melaka</p>
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
              All Matches
            </button>
            <button
              onClick={() => setActiveTab('stream')}
              className={`px-6 py-4 font-semibold transition-all whitespace-nowrap relative ${
                activeTab === 'stream'
                  ? 'text-mss-turquoise border-b-3 border-mss-turquoise bg-gradient-to-t from-mss-turquoise/10 to-transparent'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2">
                Stream
                {hasLiveStream && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                )}
              </span>
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
              onClick={() => setActiveTab('social')}
              className={`px-6 py-4 font-semibold transition-all whitespace-nowrap ${
                activeTab === 'social'
                  ? 'text-mss-turquoise border-b-3 border-mss-turquoise bg-gradient-to-t from-mss-turquoise/10 to-transparent'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              Social Hub
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
            {activeTab === 'stream' && <StreamView onLiveStatusChange={setHasLiveStream} selectedMatchNumber={selectedMatchNumber} selectedMatchDetails={selectedMatchDetails} />}
            {activeTab === 'groups' && <GroupStageView />}
            {activeTab === 'bracket' && <TournamentBracket />}
            {activeTab === 'input' && <ScoreInput />}
            {activeTab === 'social' && <SocialHub matches={matches} />}
          </div>
        </PullToRefresh>
      </div>

      {/* Mobile Navigation */}
      <MobileNav activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab as any)} hasLiveStream={hasLiveStream} />
    </main>
  )
}