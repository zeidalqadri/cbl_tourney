import ScoreInput from '@/components/ScoreInput'
import { TournamentProgressionPanel } from '@/components/MatchProgressionButton'
import Link from 'next/link'
import { Settings, Calendar, Camera } from 'lucide-react'

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Tournament Admin
        </h1>
        
        {/* Admin Navigation */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/matches"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-6 h-6 text-cbl-orange" />
              <h2 className="text-lg font-semibold">Match Management</h2>
            </div>
            <p className="text-sm text-gray-600">
              Manage schedules, venues, delays, and officials
            </p>
          </Link>
          
          <Link
            href="/admin/photos"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-2">
              <Camera className="w-6 h-6 text-cbl-orange" />
              <h2 className="text-lg font-semibold">Photo Management</h2>
            </div>
            <p className="text-sm text-gray-600">
              Google Drive integration with smart period detection
            </p>
          </Link>
          
          <div className="bg-white p-6 rounded-lg shadow-sm opacity-75">
            <div className="flex items-center gap-3 mb-2">
              <Settings className="w-6 h-6 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-600">Settings</h2>
            </div>
            <p className="text-sm text-gray-500">
              Tournament configuration
            </p>
          </div>
        </div>
        
        {/* Tournament Progression Panel */}
        <div className="mb-8">
          <TournamentProgressionPanel />
        </div>
        
        <ScoreInput />
      </div>
    </div>
  )
}