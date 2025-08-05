'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Play, 
  Camera, 
  ChevronLeft, 
  ChevronRight,
  Maximize2,
  Download,
  Share2
} from 'lucide-react'
import { MediaContent, MediaPhoto, MediaVideo } from '@/types/media'

interface MediaViewerProps {
  mediaContent: MediaContent
  matchNumber: number
  teams: {
    teamA: string
    teamB: string
  }
}

export default function MediaViewer({ mediaContent, matchNumber, teams }: MediaViewerProps) {
  const [activeTab, setActiveTab] = useState<'videos' | 'photos'>('videos')
  const [selectedPhoto, setSelectedPhoto] = useState<MediaPhoto | null>(null)
  const [photoIndex, setPhotoIndex] = useState(0)
  const [selectedVideo, setSelectedVideo] = useState<MediaVideo | null>(
    mediaContent.videos?.[0] || null
  )

  const hasVideos = mediaContent.videos && mediaContent.videos.length > 0
  const hasPhotos = mediaContent.photos && mediaContent.photos.length > 0
  const hasMedia = hasVideos || hasPhotos

  if (!hasMedia) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Camera className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No media available for this match yet</p>
      </div>
    )
  }

  const handlePhotoNavigation = (direction: 'prev' | 'next') => {
    if (!mediaContent.photos) return
    
    const newIndex = direction === 'prev' 
      ? Math.max(0, photoIndex - 1)
      : Math.min(mediaContent.photos.length - 1, photoIndex + 1)
    
    setPhotoIndex(newIndex)
    setSelectedPhoto(mediaContent.photos[newIndex])
  }

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex gap-2">
        {hasVideos && (
          <button
            onClick={() => setActiveTab('videos')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'videos'
                ? 'bg-mss-turquoise text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <Play className="w-4 h-4" />
            Videos ({mediaContent.videos?.length || 0})
          </button>
        )}
        {hasPhotos && (
          <button
            onClick={() => setActiveTab('photos')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'photos'
                ? 'bg-mss-turquoise text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <Camera className="w-4 h-4" />
            Photos ({mediaContent.photos?.length || 0})
          </button>
        )}
      </div>

      {/* Videos Tab */}
      {activeTab === 'videos' && hasVideos && (
        <div className="space-y-4">
          {/* Video Player */}
          {selectedVideo && (
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <iframe
                src={selectedVideo.embedUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {/* Video List */}
          {mediaContent.videos!.length > 1 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {mediaContent.videos!.map((video) => (
                <button
                  key={video.id}
                  onClick={() => setSelectedVideo(video)}
                  className={`relative group rounded-lg overflow-hidden ${
                    selectedVideo?.id === video.id
                      ? 'ring-2 ring-mss-turquoise'
                      : ''
                  }`}
                >
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full aspect-video object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-white text-xs truncate">{video.title}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Photos Tab */}
      {activeTab === 'photos' && hasPhotos && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
            {mediaContent.photos!.map((photo, index) => (
              <button
                key={photo.id}
                onClick={() => {
                  setSelectedPhoto(photo)
                  setPhotoIndex(index)
                }}
                className="relative group aspect-square rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
              >
                <img
                  src={photo.thumbnail}
                  alt={photo.caption || `Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <Maximize2 className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Photo Lightbox */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-5xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
              >
                <X className="w-8 h-8" />
              </button>

              {/* Navigation */}
              <button
                onClick={() => handlePhotoNavigation('prev')}
                disabled={photoIndex === 0}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-10 h-10" />
              </button>

              <button
                onClick={() => handlePhotoNavigation('next')}
                disabled={photoIndex === mediaContent.photos!.length - 1}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-10 h-10" />
              </button>

              {/* Photo */}
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.caption || 'Match photo'}
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
              />

              {/* Caption */}
              {selectedPhoto.caption && (
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent rounded-b-lg">
                  <p className="text-white text-center">{selectedPhoto.caption}</p>
                  {selectedPhoto.photographer && (
                    <p className="text-white/70 text-sm text-center mt-1">
                      Photo by {selectedPhoto.photographer}
                    </p>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="absolute top-4 right-4 flex gap-2">
                <a
                  href={selectedPhoto.url}
                  download={`match-${matchNumber}-photo-${photoIndex + 1}.jpg`}
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-colors"
                >
                  <Download className="w-5 h-5" />
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}