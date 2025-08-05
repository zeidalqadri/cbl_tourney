'use client';

import React, { useState, useEffect } from 'react';
import { Play, Radio, Calendar, MapPin, Users, Search, X } from 'lucide-react';

interface YouTubeVideo {
  videoId: string;
  title: string;
  description?: string;
  thumbnail: string;
  publishedAt: string;
  venue?: string;
  matchInfo?: {
    matchNumber: number | null;
    teams: { teamA: string; teamB: string } | null;
    division: string | null;
  };
  isLive?: boolean;
  embedUrl: string;
  watchUrl: string;
}

interface YouTubeFeedProps {
  venue?: string; // Filter by specific venue
  limit?: number; // Limit number of videos
  showLiveOnly?: boolean; // Show only live streams
}

export function YouTubeFeed({ venue, limit, showLiveOnly = false }: YouTubeFeedProps) {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [liveStreams, setLiveStreams] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredVideos, setFilteredVideos] = useState<YouTubeVideo[]>([]);

  const API_URL = 'https://cbl-coverage-api.zeidalqadri.workers.dev';

  useEffect(() => {
    fetchVideos();
    const interval = setInterval(fetchVideos, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [venue]);

  useEffect(() => {
    // Filter videos based on search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const filtered = videos.filter(video => 
        video.title.toLowerCase().includes(query) ||
        video.venue?.toLowerCase().includes(query) ||
        video.matchInfo?.teams?.teamA.toLowerCase().includes(query) ||
        video.matchInfo?.teams?.teamB.toLowerCase().includes(query)
      );
      setFilteredVideos(filtered);
    } else {
      setFilteredVideos(videos);
    }
  }, [searchQuery, videos]);

  const fetchVideos = async () => {
    try {
      // Fetch live streams
      const liveResponse = await fetch(`${API_URL}/api/youtube/live`);
      const liveData = await liveResponse.json();
      setLiveStreams(liveData.live || []);

      // Fetch recent videos
      if (!showLiveOnly) {
        let endpoint = `${API_URL}/api/youtube/recent`;
        if (venue) {
          endpoint = `${API_URL}/api/youtube/venue/${encodeURIComponent(venue)}`;
        }
        
        const response = await fetch(endpoint);
        const data = await response.json();
        setVideos(data.videos || []);
      }
    } catch (error) {
      console.error('Failed to fetch YouTube videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const displayVideos = showLiveOnly ? liveStreams : [...liveStreams, ...filteredVideos];
  const limitedVideos = limit ? displayVideos.slice(0, limit) : displayVideos;

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 h-48 rounded-lg mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      {!venue && !showLiveOnly && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search matches, teams, or venues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      )}

      {/* Live Streams Section */}
      {liveStreams.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            Live Now
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {liveStreams.map(video => (
              <VideoCard
                key={video.videoId}
                video={video}
                isLive={true}
                onSelect={setSelectedVideo}
              />
            ))}
          </div>
        </div>
      )}

      {/* Recent Videos */}
      {!showLiveOnly && filteredVideos.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">
            {venue ? `${venue} Matches` : 'Recent Matches'}
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {limitedVideos
              .filter(v => !v.isLive)
              .map(video => (
                <VideoCard
                  key={video.videoId}
                  video={video}
                  onSelect={setSelectedVideo}
                />
              ))}
          </div>
        </div>
      )}

      {/* No videos message */}
      {displayVideos.length === 0 && (
        <div className="text-center py-12">
          <Play className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            {showLiveOnly ? 'No live streams at the moment' : 'No videos found'}
          </p>
        </div>
      )}

      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoPlayerModal
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </div>
  );
}

// Video Card Component
function VideoCard({ 
  video, 
  isLive = false, 
  onSelect 
}: { 
  video: YouTubeVideo; 
  isLive?: boolean;
  onSelect: (video: YouTubeVideo) => void;
}) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 24) {
      return `${Math.floor(diffHours)} hours ago`;
    } else if (diffHours < 168) {
      return `${Math.floor(diffHours / 24)} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
         onClick={() => onSelect(video)}>
      {/* Thumbnail */}
      <div className="relative aspect-video">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-opacity flex items-center justify-center">
          <Play className="w-12 h-12 text-white opacity-0 hover:opacity-100 transition-opacity" />
        </div>
        {isLive && (
          <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
            <Radio className="w-3 h-3" />
            LIVE
          </div>
        )}
        {video.matchInfo?.matchNumber && (
          <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
            Match #{video.matchInfo.matchNumber}
          </div>
        )}
      </div>

      {/* Video Info */}
      <div className="p-4">
        <h3 className="font-semibold text-sm mb-2 line-clamp-2">{video.title}</h3>
        
        <div className="flex items-center gap-4 text-xs text-gray-500">
          {video.venue && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {video.venue}
            </div>
          )}
          {video.matchInfo?.division && (
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              video.matchInfo.division === 'boys' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-pink-100 text-pink-700'
            }`}>
              {video.matchInfo.division.toUpperCase()}
            </span>
          )}
          {!isLive && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(video.publishedAt)}
            </div>
          )}
        </div>

        {video.matchInfo?.teams && (
          <div className="mt-2 text-sm">
            <span className="font-medium">{video.matchInfo.teams.teamA}</span>
            <span className="text-gray-400 mx-1">vs</span>
            <span className="font-medium">{video.matchInfo.teams.teamB}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Video Player Modal
function VideoPlayerModal({ 
  video, 
  onClose 
}: { 
  video: YouTubeVideo; 
  onClose: () => void;
}) {
  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
         onClick={onClose}>
      <div className="relative w-full max-w-5xl" onClick={e => e.stopPropagation()}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
        >
          <X className="w-8 h-8" />
        </button>

        {/* Video player */}
        <div className="aspect-video bg-black rounded-lg overflow-hidden">
          <iframe
            src={`${video.embedUrl}?autoplay=1`}
            className="w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>

        {/* Video info */}
        <div className="mt-4 text-white">
          <h2 className="text-xl font-semibold mb-2">{video.title}</h2>
          <div className="flex items-center gap-4 text-sm text-gray-300">
            {video.venue && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {video.venue}
              </div>
            )}
            <a
              href={video.watchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Watch on YouTube →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mini feed for embedding in other pages
export function YouTubeFeedMini({ venue }: { venue: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <Play className="w-5 h-5 text-red-600" />
        Match Videos
      </h3>
      <YouTubeFeed venue={venue} limit={3} />
    </div>
  );
}