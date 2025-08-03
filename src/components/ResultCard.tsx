'use client'

import { Match } from '@/types/tournament'

interface ResultCardProps {
  match: Match
  format: 'square' | 'landscape'
}

export default function ResultCard({ match, format }: ResultCardProps) {
  const dimensions = format === 'square' ? 'w-96 h-96' : 'w-full h-64'
  
  return (
    <div className={`${dimensions} bg-gradient-to-br from-cbl-blue to-cbl-orange rounded-lg p-8 text-white relative overflow-hidden`}>
      <div className="absolute top-0 right-0 opacity-10">
        <svg width="200" height="200" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="white" />
        </svg>
      </div>
      
      <div className="relative z-10 h-full flex flex-col justify-between">
        <div>
          <div className="text-sm opacity-90">MSS MELAKA 2025</div>
          <div className="text-2xl font-bold">Basketball U12</div>
          <div className="text-lg mt-2">{match.division.toUpperCase()} DIVISION</div>
        </div>
        
        <div className="text-center">
          <div className="text-4xl font-bold mb-4">
            {match.scoreA} - {match.scoreB}
          </div>
          <div className="text-xl mb-2">{match.teamA.name}</div>
          <div className="text-sm opacity-90">VS</div>
          <div className="text-xl mt-2">{match.teamB.name}</div>
        </div>
        
        <div className="text-sm opacity-90">
          <div>{match.date} • {match.time}</div>
          <div>{match.venue}</div>
          <div className="mt-2">Match #{match.matchNumber}</div>
        </div>
      </div>
    </div>
  )
}