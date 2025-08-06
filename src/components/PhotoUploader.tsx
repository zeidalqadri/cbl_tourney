'use client'

import { useState, useEffect } from 'react'
import { Match } from '@/types/tournament'
import { getMatchPhotos, PhotoMetadata, PhotoPeriod } from '@/lib/google-drive'
import { 
  Camera, 
  Upload, 
  Image as ImageIcon, 
  Clock,
  Filter,
  Download,
  Eye,
  Check,
  X,
  FolderOpen,
  Loader2
} from 'lucide-react'

interface PhotoUploaderProps {
  match: Match
  onClose?: () => void
  onSelectPhotos?: (photos: PhotoMetadata[]) => void
}

export default function PhotoUploader({ match, onClose, onSelectPhotos }: PhotoUploaderProps) {
  const [photos, setPhotos] = useState<PhotoMetadata[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set())
  const [filterPeriod, setFilterPeriod] = useState<PhotoPeriod['type'] | 'all'>('all')
  const [previewPhoto, setPreviewPhoto] = useState<PhotoMetadata | null>(null)
  const [photoStats, setPhotoStats] = useState<any>(null)

  useEffect(() => {
    loadPhotos()
  }, [match.matchNumber])

  async function loadPhotos() {
    setLoading(true)
    try {
      const matchPhotos = await getMatchPhotos(match.matchNumber)
      setPhotos(matchPhotos)
      
      // Calculate stats
      const stats = {
        total: matchPhotos.length,
        byPeriod: {
          pre_match: matchPhotos.filter(p => p.period === 'pre_match').length,
          first_half: matchPhotos.filter(p => p.period === 'first_half').length,
          half_time: matchPhotos.filter(p => p.period === 'half_time').length,
          second_half: matchPhotos.filter(p => p.period === 'second_half').length,
          post_match: matchPhotos.filter(p => p.period === 'post_match').length,
        }
      }
      setPhotoStats(stats)
    } catch (error) {
      console.error('Error loading photos:', error)
    } finally {
      setLoading(false)
    }
  }

  function togglePhotoSelection(photoId: string) {
    const newSelection = new Set(selectedPhotos)
    if (newSelection.has(photoId)) {
      newSelection.delete(photoId)
    } else {
      newSelection.add(photoId)
    }
    setSelectedPhotos(newSelection)
  }

  function selectAllInPeriod(period: PhotoPeriod['type']) {
    const periodPhotos = photos.filter(p => p.period === period)
    const newSelection = new Set(selectedPhotos)
    periodPhotos.forEach(photo => newSelection.add(photo.id))
    setSelectedPhotos(newSelection)
  }

  function clearSelection() {
    setSelectedPhotos(new Set())
  }

  function handleUploadSelected() {
    const selected = photos.filter(p => selectedPhotos.has(p.id))
    onSelectPhotos?.(selected)
    onClose?.()
  }

  const filteredPhotos = filterPeriod === 'all' 
    ? photos 
    : photos.filter(p => p.period === filterPeriod)

  const periodLabels = {
    pre_match: 'Pre-Match',
    first_half: 'First Half',
    half_time: 'Half Time',
    second_half: 'Second Half',
    post_match: 'Post-Match'
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Match #{match.matchNumber} Photos
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {match.teamA.name} vs {match.teamB.name}
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stats */}
          {photoStats && (
            <div className="mt-4 flex items-center gap-4 text-sm">
              <span className="font-medium">{photoStats.total} photos</span>
              <span className="text-gray-500">|</span>
              {Object.entries(photoStats.byPeriod).map(([period, count]) => (
                count > 0 && (
                  <span key={period} className="text-gray-600">
                    {periodLabels[period as keyof typeof periodLabels]}: {count}
                  </span>
                )
              ))}
            </div>
          )}
        </div>

        {/* Filters and Actions */}
        <div className="bg-gray-50 border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value as any)}
                className="px-3 py-1.5 border rounded-lg text-sm"
              >
                <option value="all">All Periods</option>
                <option value="pre_match">Pre-Match</option>
                <option value="first_half">First Half</option>
                <option value="half_time">Half Time</option>
                <option value="second_half">Second Half</option>
                <option value="post_match">Post-Match</option>
              </select>

              {filterPeriod !== 'all' && (
                <button
                  onClick={() => selectAllInPeriod(filterPeriod as PhotoPeriod['type'])}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
                >
                  Select All in Period
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {selectedPhotos.size > 0 && (
                <>
                  <span className="text-sm text-gray-600">
                    {selectedPhotos.size} selected
                  </span>
                  <button
                    onClick={clearSelection}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleUploadSelected}
                    className="px-4 py-1.5 bg-cbl-orange text-white rounded-lg text-sm hover:bg-orange-600 flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Use Selected Photos
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Photo Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : filteredPhotos.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <FolderOpen className="w-12 h-12 mb-2" />
              <p>No photos found for this match</p>
              <p className="text-sm mt-1">Photos should be in folder: Match_{match.matchNumber.toString().padStart(3, '0')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {filteredPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                    selectedPhotos.has(photo.id) 
                      ? 'border-cbl-orange shadow-lg' 
                      : 'border-transparent hover:border-gray-300'
                  }`}
                  onClick={() => togglePhotoSelection(photo.id)}
                >
                  <img
                    src={photo.thumbnailLink}
                    alt={photo.name}
                    className="w-full h-32 object-cover"
                    loading="lazy"
                  />
                  
                  {/* Selection indicator */}
                  {selectedPhotos.has(photo.id) && (
                    <div className="absolute top-2 right-2 bg-cbl-orange text-white rounded-full p-1">
                      <Check className="w-4 h-4" />
                    </div>
                  )}

                  {/* Period badge */}
                  {photo.period && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 text-center">
                      {periodLabels[photo.period]}
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setPreviewPhoto(photo)
                      }}
                      className="p-1.5 bg-white rounded-lg hover:bg-gray-100"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preview Modal */}
        {previewPhoto && (
          <div 
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4"
            onClick={() => setPreviewPhoto(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh]">
              <img
                src={previewPhoto.webContentLink}
                alt={previewPhoto.name}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              <button
                onClick={() => setPreviewPhoto(null)}
                className="absolute top-4 right-4 p-2 bg-white rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur p-3 rounded-lg">
                <p className="font-medium">{previewPhoto.name}</p>
                <p className="text-sm text-gray-600">
                  {previewPhoto.period && periodLabels[previewPhoto.period]} • 
                  {new Date(previewPhoto.createdTime).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}