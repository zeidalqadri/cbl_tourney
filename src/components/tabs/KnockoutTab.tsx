'use client'

import TournamentBracket from '@/components/TournamentBracket'
import { Trophy } from 'lucide-react'

export default function KnockoutTab() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
        <div className="flex items-center gap-3 mb-3">
          <Trophy className="w-8 h-8 text-yellow-500" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Knockout Stage</h2>
            <p className="text-sm text-gray-600">Single elimination bracket - Road to the championship</p>
          </div>
        </div>
      </div>
      
      <TournamentBracket />
    </div>
  )
}