'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { 
  Upload, 
  Camera, 
  X, 
  Check, 
  Loader2,
  Trash2 
} from 'lucide-react'
import Image from 'next/image'

interface Photo {
  file: File
  preview: string
  caption: string
}

interface PhotoUploadProps {
  onClose?: () => void
  matchId?: string
  venue?: string
}

export default function PhotoUpload({ onClose, matchId, venue: initialVenue }: PhotoUploadProps) {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [venue, setVenue] = useState(initialVenue || 'SJKC YU HWA')
  const [matchNumber, setMatchNumber] = useState('')
  const [division, setDivision] = useState<'boys' | 'girls'>('boys')
  const [photographer, setPhotographer] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    const newPhotos = await Promise.all(
      files.map(async (file) => ({
        file,
        preview: URL.createObjectURL(file),
        caption: ''
      }))
    )
    
    setPhotos([...photos, ...newPhotos])
  }

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(photos[index].preview)
    setPhotos(photos.filter((_, i) => i !== index))
  }

  const updateCaption = (index: number, caption: string) => {
    const updated = [...photos]
    updated[index].caption = caption
    setPhotos(updated)
  }

  const handleUpload = async () => {
    if (!matchNumber || photos.length === 0) return
    setUploading(true)
    setError(null)
    
    const supabase = createClientComponentClient()
    
    try {
      // Find the match ID
      const { data: matches, error: matchError } = await supabase
        .from('matches')
        .select('id')
        .eq('venue', venue)
        .eq('match_number', parseInt(matchNumber))
        .eq('division', division)
        .single()
      
      if (matchError || !matches) {
        throw new Error('Match not found. Please check the match number and venue.')
      }

      // Create FormData for file upload
      const formData = new FormData()
      
      // Add files to FormData
      photos.forEach((photo) => {
        if (photo.file) {
          formData.append('files', photo.file)
        }
      })
      
      // Add metadata
      formData.append('matchId', matches.id)
      formData.append('venue', venue)
      formData.append('photographerName', photographer || 'Tournament Photographer')
      
      // Add captions as JSON
      const captions = photos.reduce((acc, photo, index) => {
        acc[index] = photo.caption
        return acc
      }, {} as Record<number, string>)
      formData.append('captions', JSON.stringify(captions))

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }
      
      if (result.success) {
        setUploadSuccess(true)
        setTimeout(() => {
          onClose?.()
        }, 2000)
      }
    } catch (error) {
      console.error('Upload failed:', error)
      setError(error instanceof Error ? error.message : 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-display text-gray-900 dark:text-white">
                Upload Match Photos
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Add photos for a specific match
              </p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {uploadSuccess ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Upload Successful!</h3>
              <p className="text-gray-500">Photos have been added to the match</p>
            </motion.div>
          ) : (
            <>
              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Match Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Venue</label>
                  <select
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-mss-turquoise focus:border-transparent"
                  >
                    <option value="SJKC YU HWA">SJKC YU HWA</option>
                    <option value="SJKC MALIM">SJKC MALIM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Match Number
                  </label>
                  <input
                    type="number"
                    value={matchNumber}
                    onChange={(e) => setMatchNumber(e.target.value)}
                    placeholder="e.g. 42"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-mss-turquoise focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Division</label>
                  <select
                    value={division}
                    onChange={(e) => setDivision(e.target.value as 'boys' | 'girls')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-mss-turquoise focus:border-transparent"
                  >
                    <option value="boys">Boys</option>
                    <option value="girls">Girls</option>
                  </select>
                </div>
              </div>

              {/* Photographer Info */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Photographer Name (Optional)
                </label>
                <input
                  type="text"
                  value={photographer}
                  onChange={(e) => setPhotographer(e.target.value)}
                  placeholder="Enter photographer name"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-mss-turquoise focus:border-transparent"
                />
              </div>

              {/* Photo Upload Area */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl hover:border-mss-turquoise transition-colors"
                >
                  <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Click to select photos or drag and drop
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    JPG, PNG or WebP (max 10MB each)
                  </p>
                </button>
              </div>

              {/* Selected Photos */}
              {photos.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-medium">Selected Photos ({photos.length})</h3>
                  <div className="space-y-3">
                    {photos.map((photo, index) => (
                      <div key={index} className="flex gap-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <div className="relative w-20 h-20 flex-shrink-0">
                          <Image
                            src={photo.preview}
                            alt={`Photo ${index + 1}`}
                            fill
                            className="object-cover rounded-lg"
                          />
                        </div>
                        <div className="flex-1">
                          <input
                            type="text"
                            value={photo.caption}
                            onChange={(e) => updateCaption(index, e.target.value)}
                            placeholder="Add caption (optional)"
                            className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded focus:ring-1 focus:ring-mss-turquoise"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            {photo.file.name} ({(photo.file.size / 1024 / 1024).toFixed(1)}MB)
                          </p>
                        </div>
                        <button
                          onClick={() => removePhoto(index)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!uploadSuccess && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={handleUpload}
              disabled={!matchNumber || photos.length === 0 || uploading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-mss-turquoise to-teal-500 text-white py-3 px-4 rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Camera className="w-5 h-5" />
                  Upload {photos.length} Photo{photos.length !== 1 ? 's' : ''}
                </>
              )}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}