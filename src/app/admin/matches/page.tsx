'use client'

import { useState, useEffect } from 'react'
import { Match } from '@/types/tournament'
import { getMatches } from '@/lib/tournament-api'
import MatchEditor from '@/components/MatchEditor'
import { 
  Clock, 
  MapPin, 
  AlertCircle, 
  Edit2, 
  Filter,
  Search,
  Calendar,
  ChevronRight,
  Timer,
  Users
} from 'lucide-react'

export default function MatchManagementPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  
  // Filters
  const [dateFilter, setDateFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [venueFilter, setVenueFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  
  useEffect(() => {
    loadMatches()
  }, [])
  
  useEffect(() => {
    applyFilters()
  }, [matches, dateFilter, statusFilter, venueFilter, searchQuery])
  
  async function loadMatches() {
    try {
      setLoading(true)
      const data = await getMatches()
      setMatches(data)
      setFilteredMatches(data)
    } catch (error) {
      console.error('Error loading matches:', error)
    } finally {
      setLoading(false)
    }
  }
  
  function applyFilters() {
    let filtered = [...matches]
    
    // Date filter
    if (dateFilter) {
      filtered = filtered.filter(m => m.date === dateFilter)
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(m => m.status === statusFilter)
    }
    
    // Venue filter
    if (venueFilter !== 'all') {
      filtered = filtered.filter(m => m.venue === venueFilter)
    }
    
    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(m => 
        m.teamA.name.toLowerCase().includes(query) ||
        m.teamB.name.toLowerCase().includes(query) ||
        m.matchNumber.toString().includes(query)
      )
    }
    
    setFilteredMatches(filtered)
  }
  
  function getStatusColor(status: string) {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'postponed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }
  
  function getDelayIndicator(match: Match) {
    // Check if match has delay metadata
    const metadata = match.metadata as any
    if (metadata?.delay_minutes && metadata.delay_minutes > 0) {
      return (
        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
          +{metadata.delay_minutes}min delay
        </span>
      )
    }
    return null
  }
  
  function handleMatchUpdate(updatedMatch: Match) {
    setMatches(prev => prev.map(m => 
      m.id === updatedMatch.id ? updatedMatch : m
    ))
    setSelectedMatch(null)
  }
  
  // Get unique dates, venues for filters
  const uniqueDates = Array.from(new Set(matches.map(m => m.date))).sort()
  const uniqueVenues = Array.from(new Set(matches.map(m => m.venue)))
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Match Management</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage tournament match schedules, venues, and officials
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{filteredMatches.length}</span> matches
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by team or match number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-cbl-orange"
                />
              </div>
            </div>
            
            {/* Date filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cbl-orange"
            >
              <option value="">All Dates</option>
              {uniqueDates.map(date => (
                <option key={date} value={date}>
                  {new Date(date + 'T00:00:00').toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </option>
              ))}
            </select>
            
            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cbl-orange"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="postponed">Postponed</option>
            </select>
            
            {/* Venue filter */}
            <select
              value={venueFilter}
              onChange={(e) => setVenueFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cbl-orange"
            >
              <option value="all">All Venues</option>
              {uniqueVenues.map(venue => (
                <option key={venue} value={venue}>{venue}</option>
              ))}
            </select>
          </div>
          
          {/* Quick Stats */}
          <div className="flex gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full" />
              <span className="text-gray-600">
                Scheduled: {matches.filter(m => m.status === 'scheduled').length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full" />
              <span className="text-gray-600">
                In Progress: {matches.filter(m => m.status === 'in_progress').length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-gray-600">
                Completed: {matches.filter(m => m.status === 'completed').length}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Match List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading matches...</p>
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500">No matches found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="divide-y">
              {filteredMatches.map(match => (
                <div
                  key={match.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        {/* Match Number */}
                        <div className="text-center">
                          <div className="text-xs text-gray-500">Match</div>
                          <div className="text-lg font-bold">#{match.matchNumber}</div>
                        </div>
                        
                        {/* Teams */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{match.teamA.name}</span>
                            <span className="text-gray-400">vs</span>
                            <span className="font-medium">{match.teamB.name}</span>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(match.date + 'T00:00:00').toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {match.time}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {match.venue}
                            </span>
                          </div>
                        </div>
                        
                        {/* Status & Actions */}
                        <div className="flex items-center gap-3">
                          {getDelayIndicator(match)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(match.status)}`}>
                            {match.status.replace('_', ' ')}
                          </span>
                          <button
                            onClick={() => setSelectedMatch(match)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Additional Info */}
                      {match.metadata && (
                        <div className="mt-2 flex gap-4 text-xs text-gray-500">
                          {match.metadata.type && (
                            <span>Type: {match.metadata.type.replace('_', ' ')}</span>
                          )}
                          {match.metadata.division && (
                            <span>Division: {match.metadata.division}</span>
                          )}
                          {match.metadata.group && (
                            <span>Group: {match.metadata.group}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Match Editor Modal */}
      {selectedMatch && (
        <MatchEditor
          match={selectedMatch}
          onClose={() => setSelectedMatch(null)}
          onSave={handleMatchUpdate}
        />
      )}
    </div>
  )
}