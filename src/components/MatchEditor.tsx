'use client'

import { useState, useEffect } from 'react'
import { Match } from '@/types/tournament'
import { supabase } from '@/lib/supabase'
import { 
  Clock, 
  MapPin, 
  Users, 
  AlertCircle,
  Save,
  X,
  Calendar,
  Timer,
  User,
  Camera
} from 'lucide-react'

interface MatchEditorProps {
  match: Match
  onClose?: () => void
  onSave?: (match: Match) => void
}

const TOURNAMENT_ID = '66666666-6666-6666-6666-666666666666'

export default function MatchEditor({ match, onClose, onSave }: MatchEditorProps) {
  const [editedMatch, setEditedMatch] = useState<any>({})
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  
  // Venue and court options
  const venues = ['SJKC YU HWA', 'SJKC MALIM']
  const courts = ['Court A', 'Court B', 'Court C']
  const statuses = ['pending', 'in_progress', 'completed', 'postponed']
  
  useEffect(() => {
    // Load full match details
    loadMatchDetails()
  }, [match.id])
  
  async function loadMatchDetails() {
    const { data, error } = await supabase
      .from('tournament_matches')
      .select('*')
      .eq('id', match.id)
      .single()
    
    if (data) {
      setEditedMatch(data)
    }
  }
  
  function handleFieldChange(field: string, value: any) {
    setEditedMatch(prev => ({
      ...prev,
      [field]: value
    }))
  }
  
  function calculateDelay() {
    if (!editedMatch.scheduled_time || !editedMatch.actual_start_time) return 0
    
    const scheduled = new Date(editedMatch.scheduled_time)
    const actual = new Date(editedMatch.actual_start_time)
    const delayMs = actual.getTime() - scheduled.getTime()
    return Math.round(delayMs / (1000 * 60)) // Convert to minutes
  }
  
  async function handleSave() {
    setSaving(true)
    setErrors([])
    
    try {
      // Calculate delay if actual start time is set
      let delay_minutes = editedMatch.delay_minutes || 0
      if (editedMatch.actual_start_time) {
        delay_minutes = calculateDelay()
      }
      
      // Prepare update data
      const updateData = {
        scheduled_time: editedMatch.scheduled_time,
        venue: editedMatch.venue,
        court: editedMatch.court,
        status: editedMatch.status,
        actual_start_time: editedMatch.actual_start_time || null,
        actual_end_time: editedMatch.actual_end_time || null,
        delay_minutes,
        is_walkover: editedMatch.is_walkover || false,
        postponement_reason: editedMatch.postponement_reason || null,
        referee_name: editedMatch.referee_name || null,
        scorer_name: editedMatch.scorer_name || null,
        photographer_assigned: editedMatch.photographer_assigned || null,
        last_updated_by: 'admin', // TODO: Get from auth context
        updated_at: new Date().toISOString()
      }
      
      const { error } = await supabase
        .from('tournament_matches')
        .update(updateData)
        .eq('id', match.id)
      
      if (error) throw error
      
      // Update metadata for additional info
      const metadataUpdate = {
        ...editedMatch.metadata,
        last_edit: new Date().toISOString(),
        edited_by: 'admin'
      }
      
      await supabase
        .from('tournament_matches')
        .update({ metadata: metadataUpdate })
        .eq('id', match.id)
      
      onSave?.(editedMatch)
      onClose?.()
    } catch (error) {
      console.error('Error saving match:', error)
      setErrors(['Failed to save match updates'])
    } finally {
      setSaving(false)
    }
  }
  
  function handleQuickDelay(minutes: number) {
    const scheduled = new Date(editedMatch.scheduled_time)
    const newTime = new Date(scheduled.getTime() + minutes * 60000)
    
    setEditedMatch(prev => ({
      ...prev,
      scheduled_time: newTime.toISOString(),
      delay_minutes: (prev.delay_minutes || 0) + minutes,
      postponement_reason: minutes > 0 ? 'Match delayed' : prev.postponement_reason
    }))
  }
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Edit Match #{match.matchNumber}</h2>
            <p className="text-sm text-gray-600">
              {match.teamA.name} vs {match.teamB.name}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Error messages */}
        {errors.length > 0 && (
          <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            {errors.map((error, idx) => (
              <p key={idx} className="text-red-700 text-sm">{error}</p>
            ))}
          </div>
        )}
        
        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Quick Actions */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Timer className="w-4 h-4" />
              Quick Actions
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleQuickDelay(15)}
                className="px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-lg text-sm hover:bg-yellow-200"
              >
                Delay +15 min
              </button>
              <button
                onClick={() => handleQuickDelay(30)}
                className="px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-lg text-sm hover:bg-yellow-200"
              >
                Delay +30 min
              </button>
              <button
                onClick={() => handleQuickDelay(60)}
                className="px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-lg text-sm hover:bg-yellow-200"
              >
                Delay +1 hour
              </button>
              <button
                onClick={() => handleFieldChange('status', 'in_progress')}
                className="px-3 py-1.5 bg-green-100 text-green-800 rounded-lg text-sm hover:bg-green-200"
              >
                Mark In Progress
              </button>
              <button
                onClick={() => handleFieldChange('is_walkover', !editedMatch.is_walkover)}
                className={`px-3 py-1.5 rounded-lg text-sm ${
                  editedMatch.is_walkover 
                    ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {editedMatch.is_walkover ? 'Walkover Set' : 'Mark Walkover'}
              </button>
            </div>
          </div>
          
          {/* Schedule & Time */}
          <div>
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Schedule & Time
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scheduled Time
                </label>
                <input
                  type="datetime-local"
                  value={editedMatch.scheduled_time?.slice(0, 16) || ''}
                  onChange={(e) => handleFieldChange('scheduled_time', e.target.value + ':00+00:00')}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cbl-orange"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Actual Start Time
                </label>
                <input
                  type="datetime-local"
                  value={editedMatch.actual_start_time?.slice(0, 16) || ''}
                  onChange={(e) => handleFieldChange('actual_start_time', e.target.value + ':00+00:00')}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cbl-orange"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={editedMatch.status || 'pending'}
                  onChange={(e) => handleFieldChange('status', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cbl-orange"
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delay (minutes)
                </label>
                <input
                  type="number"
                  value={editedMatch.delay_minutes || 0}
                  onChange={(e) => handleFieldChange('delay_minutes', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cbl-orange"
                />
              </div>
            </div>
            
            {editedMatch.delay_minutes > 0 && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Postponement Reason
                </label>
                <textarea
                  value={editedMatch.postponement_reason || ''}
                  onChange={(e) => handleFieldChange('postponement_reason', e.target.value)}
                  placeholder="Explain the reason for delay..."
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cbl-orange"
                  rows={2}
                />
              </div>
            )}
          </div>
          
          {/* Venue & Location */}
          <div>
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Venue & Location
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Venue
                </label>
                <select
                  value={editedMatch.venue || ''}
                  onChange={(e) => handleFieldChange('venue', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cbl-orange"
                >
                  {venues.map(venue => (
                    <option key={venue} value={venue}>{venue}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Court
                </label>
                <select
                  value={editedMatch.court || ''}
                  onChange={(e) => handleFieldChange('court', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cbl-orange"
                >
                  <option value="">Select Court</option>
                  {courts.map(court => (
                    <option key={court} value={court}>{court}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {/* Officials */}
          <div>
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Officials & Personnel
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Referee
                </label>
                <input
                  type="text"
                  value={editedMatch.referee_name || ''}
                  onChange={(e) => handleFieldChange('referee_name', e.target.value)}
                  placeholder="Referee name"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cbl-orange"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scorer
                </label>
                <input
                  type="text"
                  value={editedMatch.scorer_name || ''}
                  onChange={(e) => handleFieldChange('scorer_name', e.target.value)}
                  placeholder="Scorer name"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cbl-orange"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Photographer
                </label>
                <input
                  type="text"
                  value={editedMatch.photographer_assigned || ''}
                  onChange={(e) => handleFieldChange('photographer_assigned', e.target.value)}
                  placeholder="Photographer name"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-cbl-orange"
                />
              </div>
            </div>
          </div>
          
          {/* Change History */}
          {editedMatch.change_log && editedMatch.change_log.length > 0 && (
            <div>
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Recent Changes
              </h3>
              <div className="bg-gray-50 rounded-lg p-3 space-y-2 max-h-32 overflow-y-auto">
                {editedMatch.change_log.slice(-3).reverse().map((log, idx) => (
                  <div key={idx} className="text-sm">
                    <span className="text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                    {' - '}
                    <span className="text-gray-700">
                      {log.user || 'Unknown'} updated match
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t p-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-cbl-orange text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>Saving...</>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}