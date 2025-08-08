'use client'

import MatchList from '@/components/MatchList'
import TournamentStatusDashboard from '@/components/TournamentStatusDashboard'

export default function AllMatchesTab() {
  return (
    <div className="space-y-6">
      <TournamentStatusDashboard />
      <MatchList />
    </div>
  )
}