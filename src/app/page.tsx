'use client'

import { useState } from 'react'
import MatchList from '@/components/MatchList'
import GroupStageView from '@/components/GroupStageView'
import ScoreInput from '@/components/ScoreInput'
import TournamentBracket from '@/components/TournamentBracket'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'matches' | 'groups' | 'bracket' | 'input'>('matches')

  return (
    <main className="min-h-screen bg-cbl-light">
      <header className="bg-cbl-blue text-white p-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">MSS Melaka Basketball 2025</h1>
          <p className="text-sm opacity-90">U12 Tournament Reporting System</p>
        </div>
      </header>

      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('matches')}
              className={`px-4 py-3 font-medium transition-colors ${
                activeTab === 'matches'
                  ? 'text-cbl-orange border-b-2 border-cbl-orange'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Live Matches
            </button>
            <button
              onClick={() => setActiveTab('groups')}
              className={`px-4 py-3 font-medium transition-colors ${
                activeTab === 'groups'
                  ? 'text-cbl-orange border-b-2 border-cbl-orange'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Group Stage
            </button>
            <button
              onClick={() => setActiveTab('bracket')}
              className={`px-4 py-3 font-medium transition-colors ${
                activeTab === 'bracket'
                  ? 'text-cbl-orange border-b-2 border-cbl-orange'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Knockout Stage
            </button>
            <button
              onClick={() => setActiveTab('input')}
              className={`px-4 py-3 font-medium transition-colors ${
                activeTab === 'input'
                  ? 'text-cbl-orange border-b-2 border-cbl-orange'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Score Input
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'matches' && <MatchList />}
          {activeTab === 'groups' && <GroupStageView />}
          {activeTab === 'bracket' && <TournamentBracket />}
          {activeTab === 'input' && <ScoreInput />}
        </div>
      </div>
    </main>
  )
}