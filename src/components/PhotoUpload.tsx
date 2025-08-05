'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Upload, 
  Camera, 
  X, 
  Check, 
  Loader2,
  Image as ImageIcon,
  MapPin,
  Hash
} from 'lucide-react'

interface PhotoUploadProps {
  onClose?: () => void
}

interface UploadPhoto {
  id: string
  file: File
  preview: string
  caption: string
}

export default function PhotoUpload({ onClose }: PhotoUploadProps) {
  const [photos, setPhotos] = useState<UploadPhoto[]>([])
  const [venue, setVenue] = useState<'SJKC YU HWA' | 'SJKC MALIM'>('SJKC MALIM')
  const [matchNumber, setMatchNumber] = useState('')
  const [division, setDivision] = useState<'boys' | 'girls'>('boys')
  const [photographer, setPhotographer] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    const newPhotos = files.map(file => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
      caption: ''
    }))
    
    setPhotos(prev => [...prev, ...newPhotos])
  }

  const removePhoto = (id: string) => {
    setPhotos(prev => {
      const photo = prev.find(p => p.id === id)
      if (photo) {
        URL.revokeObjectURL(photo.preview)
      }
      return prev.filter(p => p.id !== id)
    })
  }

  const updateCaption = (id: string, caption: string) => {
    setPhotos(prev => prev.map(p => 
      p.id === id ? { ...p, caption } : p
    ))
  }

  const handleUpload = async () => {
    if (!matchNumber || photos.length === 0) return

    setUploading(true)
    try {
      // In a real implementation, you would upload photos to storage first
      // For now, we'll simulate with URLs
      const photoData = photos.map(photo => ({
        url: photo.preview, // In production, upload to storage and get URL
        thumbnail: photo.preview,
        caption: photo.caption,
        photographer: photographer || 'Tournament Photographer'
      }))

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          venue,
          matchNumber: parseInt(matchNumber),
          division,
          uploadType: 'photos',
          content: { photos: photoData },
          uploadedBy: photographer || 'Tournament Photographer'
        })
      })

      const result = await response.json()
      
      if (result.success) {
        setUploadSuccess(true)
        setTimeout(() => {
          onClose?.()
        }, 2000)
      }
    } catch (error) {
      console.error('Upload failed:', error)
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
              {/* Match Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Venue</label>
                  <select
                    value={venue}
                    onChange={(e) => setVenue(e.target.value as any)}
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
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={matchNumber}
                      onChange={(e) => setMatchNumber(e.target.value)}
                      placeholder="45"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-mss-turquoise focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Division</label>
                  <select
                    value={division}
                    onChange={(e) => setDivision(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-mss-turquoise focus:border-transparent"
                  >
                    <option value="boys">Boys</option>
                    <option value="girls">Girls</option>
                  </select>
                </div>
              </div>

              {/* Photographer */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Photographer Name (Optional)
                </label>
                <input
                  type="text"
                  value={photographer}
                  onChange={(e) => setPhotographer(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-mss-turquoise focus:border-transparent"
                />
              </div>

              {/* Photo Upload Area */}
              <div>
                <label className="block text-sm font-medium mb-2">Photos</label>
                <div className="space-y-4">
                  {/* Upload Button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg hover:border-mss-turquoise transition-colors group"
                  >
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400 group-hover:text-mss-turquoise" />
                    <p className="text-gray-500 group-hover:text-mss-turquoise">
                      Click to upload photos
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      JPG, PNG up to 10MB each
                    </p>
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {/* Photo Previews */}
                  {photos.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {photos.map(photo => (
                        <div key={photo.id} className="relative group">
                          <img
                            src={photo.preview}
                            alt="Upload preview"
                            className="w-full aspect-square object-cover rounded-lg"
                          />
                          <button
                            onClick={() => removePhoto(photo.id)}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <input
                            type="text"
                            placeholder="Add caption..."
                            value={photo.caption}
                            onChange={(e) => updateCaption(photo.id, e.target.value)}
                            className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-black/70 text-white text-xs placeholder-white/70 border-0 focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
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