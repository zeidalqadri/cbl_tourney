'use client'

import { useState, useEffect } from 'react'
import { Match } from '@/types/tournament'
import { supabase } from '@/lib/supabase'
import PhotoUploader from '@/components/PhotoUploader'
import { 
  Camera, 
  Search,
  FolderOpen,
  Image as ImageIcon,
  Download,
  Eye,
  Filter,
  Calendar,
  Users,
  ChevronRight
} from 'lucide-react'

const TOURNAMENT_ID = '66666666-6666-6666-6666-666666666666'

export default function PhotoManagementPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [filterDivision, setFilterDivision] = useState<'all' | 'boys' | 'girls'>('all')
  const [loading, setLoading] = useState(true)
  const [showUploader, setShowUploader] = useState(false)
  const [photoStats, setPhotoStats] = useState<Map<number, any>>(new Map())

  useEffect(() => {
    loadMatches()
  }, [])

  async function loadMatches() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('tournament_matches')
        .select('*')
        .eq('tournament_id', TOURNAMENT_ID)
        .order('match_number', { ascending: true })

      if (data) {
        const formattedMatches: Match[] = data.map((match: any) => {
          const scheduledDate = new Date(match.scheduled_time)
          return {
            id: match.id,
            matchNumber: match.match_number,
            teamA: {
              id: match.team_a_id,
              name: match.team_a_name || 'Team A',
              score: match.team_a_score || 0,
              logoUrl: match.team_a_logo
            },
            teamB: {
              id: match.team_b_id,
              name: match.team_b_name || 'Team B',
              score: match.team_b_score || 0,
              logoUrl: match.team_b_logo
            },
            status: match.status,
            scheduledTime: match.scheduled_time,
            venue: match.venue,
            court: match.court,
            division: match.division,
            metadata: match.metadata,
            // Add required properties from Match interface
            date: scheduledDate.toISOString().split('T')[0],
            time: scheduledDate.toTimeString().split(' ')[0].substring(0, 5),
            round: match.round || 1
          }
        })
        
        setMatches(formattedMatches)
        
        // Load photo stats for each match
        loadPhotoStats(formattedMatches)
      }
    } catch (error) {
      console.error('Error loading matches:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadPhotoStats(matches: Match[]) {
    const stats = new Map<number, any>()
    
    // Load stats for first 10 matches (to avoid too many API calls)
    const matchesToCheck = matches.slice(0, 10)
    
    for (const match of matchesToCheck) {
      try {
        const response = await fetch(`/api/photos?match=${match.matchNumber}&stats=true`)
        const data = await response.json()
        if (data.success && data.stats) {
          stats.set(match.matchNumber, data.stats)
        }
      } catch (error) {
        console.error(`Error loading stats for match ${match.matchNumber}:`, error)
      }
    }
    
    setPhotoStats(stats)
  }

  function filterMatches() {
    let filtered = matches

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(match => 
        match.teamA.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        match.teamB.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        match.matchNumber.toString().includes(searchQuery)
      )
    }

    // Date filter
    if (filterDate) {
      filtered = filtered.filter(match => {
        const matchDate = new Date(match.scheduledTime).toISOString().split('T')[0]
        return matchDate === filterDate
      })
    }

    // Division filter
    if (filterDivision !== 'all') {
      filtered = filtered.filter(match => match.division === filterDivision)
    }

    return filtered
  }

  const filteredMatches = filterMatches()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Camera className="w-6 h-6 text-cbl-orange" />
                Photo Management
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage tournament photos from Google Drive
              </p>
            </div>
            
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
            >
              Refresh
            </button>
          </div>

          {/* Filters */}
          <div className="mt-4 flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search matches, teams..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-cbl-orange"
                />
              </div>
            </div>

            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cbl-orange"
            />

            <select
              value={filterDivision}
              onChange={(e) => setFilterDivision(e.target.value as any)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cbl-orange"
            >
              <option value="all">All Divisions</option>
              <option value="boys">Boys</option>
              <option value="girls">Girls</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cbl-orange"></div>
            <p className="mt-2 text-gray-600">Loading matches...</p>
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No matches found</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredMatches.map((match) => {
              const stats = photoStats.get(match.matchNumber)
              
              return (
                <div
                  key={match.id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-500">
                          Match #{match.matchNumber}
                        </span>
                        {match.division && (
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            match.division === 'girls' 
                              ? 'bg-pink-100 text-pink-700' 
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {match.division}
                          </span>
                        )}
                        {match.status === 'completed' && (
                          <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
                            Completed
                          </span>
                        )}
                      </div>
                      
                      <div className="mt-2 flex items-center gap-4">
                        <div className="font-medium">
                          {match.teamA.name} vs {match.teamB.name}
                        </div>
                        {match.status === 'completed' && (
                          <div className="text-lg font-bold text-gray-700">
                            {match.teamA.score} - {match.teamB.score}
                          </div>
                        )}
                      </div>

                      <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(match.scheduledTime).toLocaleDateString()}
                        </span>
                        <span>
                          {match.venue} • {match.court}
                        </span>
                      </div>

                      {stats && (
                        <div className="mt-3 flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1 text-gray-600">
                            <ImageIcon className="w-4 h-4" />
                            {stats.total} photos
                          </span>
                          {stats.total > 0 && (
                            <>
                              {stats.byPeriod.pre_match > 0 && (
                                <span className="text-xs text-gray-500">
                                  Pre: {stats.byPeriod.pre_match}
                                </span>
                              )}
                              {stats.byPeriod.first_half > 0 && (
                                <span className="text-xs text-gray-500">
                                  1st: {stats.byPeriod.first_half}
                                </span>
                              )}
                              {stats.byPeriod.second_half > 0 && (
                                <span className="text-xs text-gray-500">
                                  2nd: {stats.byPeriod.second_half}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedMatch(match)
                          setShowUploader(true)
                        }}
                        className="px-4 py-2 bg-cbl-orange text-white rounded-lg hover:bg-orange-600 flex items-center gap-2"
                      >
                        <FolderOpen className="w-4 h-4" />
                        Manage Photos
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Photo Uploader Modal */}
      {showUploader && selectedMatch && (
        <PhotoUploader
          match={selectedMatch}
          onClose={() => {
            setShowUploader(false)
            setSelectedMatch(null)
            // Reload stats after closing
            loadPhotoStats(matches)
          }}
          onSelectPhotos={(photos) => {
            console.log('Selected photos:', photos)
            // Handle selected photos (e.g., save to database, display in match card, etc.)
          }}
        />
      )}
    </div>
  )
}