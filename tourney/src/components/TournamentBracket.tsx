'use client'

import { useState, useEffect } from 'react'
import { Division } from '@/types/tournament'

interface TournamentBracketProps {
  division: Division
}

interface BracketMatch {
  id: string
  round: string
  teamA?: string
  teamB?: string
  scoreA?: number
  scoreB?: number
  winner?: string
}

export default function TournamentBracket({ division }: TournamentBracketProps) {
  const [brackets, setBrackets] = useState<BracketMatch[]>([])

  useEffect(() => {
    // Simulate loading bracket data
    if (division === 'boys') {
      setBrackets([
        // Second round matches
        { id: 'LXA', round: 'Second Round', teamA: 'Winner LA', teamB: 'Winner LB' },
        { id: 'LXB', round: 'Second Round', teamA: 'Winner LD', teamB: 'Winner LE' },
        { id: 'LYA', round: 'Second Round', teamA: 'Winner LH', teamB: 'Winner LI' },
        { id: 'LYB', round: 'Second Round', teamA: 'Winner LL', teamB: 'Winner LM' },
        // Semi finals
        { id: 'LSF1', round: 'Semi Final', teamA: 'Winner LXA', teamB: 'Winner LXB' },
        { id: 'LSF2', round: 'Semi Final', teamA: 'Winner LYA', teamB: 'Winner LYB' },
        // Final
        { id: 'LFinal', round: 'Final', teamA: 'Winner LSF1', teamB: 'Winner LSF2' },
      ])
    } else {
      setBrackets([
        // Quarter finals
        { id: 'PQF1', round: 'Quarter Final', teamA: 'Winner PA', teamB: 'Winner PB' },
        { id: 'PQF2', round: 'Quarter Final', teamA: 'Winner PC', teamB: 'Winner PD' },
        { id: 'PQF3', round: 'Quarter Final', teamA: 'Winner PE', teamB: 'Winner PF' },
        { id: 'PQF4', round: 'Quarter Final', teamA: 'Winner PG', teamB: 'Winner PH' },
        // Semi finals
        { id: 'PSF1', round: 'Semi Final', teamA: 'Winner PQF1', teamB: 'Winner PQF2' },
        { id: 'PSF2', round: 'Semi Final', teamA: 'Winner PQF3', teamB: 'Winner PQF4' },
        // Final
        { id: 'PFinal', round: 'Final', teamA: 'Winner PSF1', teamB: 'Winner PSF2' },
      ])
    }
  }, [division])

  const getRoundMatches = (round: string) => brackets.filter(b => b.round === round)

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px] p-4">
        <div className="flex justify-between items-start">
          {/* Group Stage Results */}
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-4">Group Winners</h3>
            <div className="space-y-2">
              {division === 'boys' ? (
                <>
                  {['LA', 'LB', 'LC', 'LD', 'LE', 'LF', 'LG', 'LH', 'LI', 'LJ', 'LK', 'LL', 'LM', 'LN'].map(group => (
                    <div key={group} className="bg-white p-3 rounded shadow-sm">
                      <span className="text-sm text-gray-500">Group {group}</span>
                      <div className="font-medium">TBD</div>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  {['PA', 'PB', 'PC', 'PD', 'PE', 'PF', 'PG', 'PH'].map(group => (
                    <div key={group} className="bg-white p-3 rounded shadow-sm">
                      <span className="text-sm text-gray-500">Group {group}</span>
                      <div className="font-medium">TBD</div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Bracket Rounds */}
          {division === 'boys' && (
            <div className="flex-1 mx-4">
              <h3 className="font-bold text-lg mb-4">Second Round</h3>
              <div className="space-y-4">
                {getRoundMatches('Second Round').map(match => (
                  <BracketMatch key={match.id} match={match} />
                ))}
              </div>
            </div>
          )}

          {division === 'girls' && (
            <div className="flex-1 mx-4">
              <h3 className="font-bold text-lg mb-4">Quarter Finals</h3>
              <div className="space-y-4">
                {getRoundMatches('Quarter Final').map(match => (
                  <BracketMatch key={match.id} match={match} />
                ))}
              </div>
            </div>
          )}

          <div className="flex-1 mx-4">
            <h3 className="font-bold text-lg mb-4">Semi Finals</h3>
            <div className="space-y-4">
              {getRoundMatches('Semi Final').map(match => (
                <BracketMatch key={match.id} match={match} />
              ))}
            </div>
          </div>

          <div className="flex-1">
            <h3 className="font-bold text-lg mb-4">Final</h3>
            <div className="space-y-4">
              {getRoundMatches('Final').map(match => (
                <BracketMatch key={match.id} match={match} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function BracketMatch({ match }: { match: BracketMatch }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="text-xs text-gray-500 mb-2">{match.id}</div>
      <div className="space-y-2">
        <div className={`flex justify-between items-center p-2 rounded ${
          match.winner === match.teamA ? 'bg-green-50 font-bold' : ''
        }`}>
          <span>{match.teamA || 'TBD'}</span>
          <span className="text-lg">{match.scoreA ?? '-'}</span>
        </div>
        <div className={`flex justify-between items-center p-2 rounded ${
          match.winner === match.teamB ? 'bg-green-50 font-bold' : ''
        }`}>
          <span>{match.teamB || 'TBD'}</span>
          <span className="text-lg">{match.scoreB ?? '-'}</span>
        </div>
      </div>
    </div>
  )
}