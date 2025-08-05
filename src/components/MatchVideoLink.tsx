'use client';

import React, { useState, useEffect } from 'react';
import { Play, Radio, ExternalLink } from 'lucide-react';
import { Match } from '@/types/tournament';

interface MatchVideoLinkProps {
  match: Match;
  className?: string;
}

interface VideoData {
  videoId: string;
  title: string;
  thumbnail: string;
  isLive: boolean;
  embedUrl: string;
  watchUrl: string;
}

export function MatchVideoLink({ match, className = '' }: MatchVideoLinkProps) {
  const [video, setVideo] = useState<VideoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPlayer, setShowPlayer] = useState(false);

  const API_URL = 'https://cbl-coverage-api.zeidalqadri.workers.dev';

  useEffect(() => {
    findMatchVideo();
  }, [match.matchNumber, match.venue]);

  const findMatchVideo = async () => {
    try {
      // First check live streams
      const liveResponse = await fetch(`${API_URL}/api/youtube/live`);
      const liveData = await liveResponse.json();
      
      // Look for live video matching this match
      const liveVideo = liveData.live?.find((v: any) => 
        v.title.toLowerCase().includes(`match #${match.matchNumber}`) ||
        (v.venue?.toLowerCase() === match.venue?.toLowerCase() && v.isLive)
      );

      if (liveVideo) {
        setVideo(liveVideo);
        setLoading(false);
        return;
      }

      // If no live video, search for recorded match
      const searchQuery = `Match #${match.matchNumber} ${match.venue || ''}`;
      const searchResponse = await fetch(
        `${API_URL}/api/youtube/search?q=${encodeURIComponent(searchQuery)}`
      );
      const searchData = await searchResponse.json();

      if (searchData.videos?.length > 0) {
        setVideo(searchData.videos[0]);
      }
    } catch (error) {
      console.error('Error finding match video:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null; // Don't show anything while loading
  }

  if (!video) {
    return null; // No video found for this match
  }

  return (
    <>
      {/* Video link/thumbnail in match card */}
      <div className={`bg-gray-900 rounded-lg overflow-hidden ${className}`}>
        <div className="relative">
          {/* Thumbnail */}
          <div className="relative aspect-video">
            <img
              src={video.thumbnail}
              alt={`Match #${match.matchNumber} video`}
              className="w-full h-full object-cover"
            />
            
            {/* Play overlay */}
            <button
              onClick={() => setShowPlayer(true)}
              className="absolute inset-0 bg-black bg-opacity-30 hover:bg-opacity-50 transition-opacity flex items-center justify-center group"
            >
              <div className="bg-white rounded-full p-3 group-hover:scale-110 transition-transform">
                <Play className="w-6 h-6 text-gray-900 ml-1" />
              </div>
            </button>

            {/* Live badge */}
            {video.isLive && (
              <div className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                LIVE
              </div>
            )}
          </div>

          {/* Video info bar */}
          <div className="p-3 bg-gray-800 flex items-center justify-between">
            <span className="text-white text-sm font-medium">
              {video.isLive ? 'Watch Live' : 'Watch Match'}
            </span>
            <a
              href={video.watchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Video player modal */}
      {showPlayer && (
        <div 
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
          onClick={() => setShowPlayer(false)}
        >
          <div 
            className="relative w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowPlayer(false)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              ✕
            </button>
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <iframe
                src={`${video.embedUrl}?autoplay=1`}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Compact version for match cards
export function MatchVideoBadge({ match }: { match: Match }) {
  const [hasVideo, setHasVideo] = useState<boolean | null>(null);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    checkForVideo();
  }, [match.matchNumber]);

  const checkForVideo = async () => {
    try {
      const response = await fetch(
        `https://cbl-coverage-api.zeidalqadri.workers.dev/api/youtube/search?q=${encodeURIComponent(`Match #${match.matchNumber}`)}`
      );
      const data = await response.json();
      
      if (data.videos?.length > 0) {
        setHasVideo(true);
        // Check if any video is live
        const liveResponse = await fetch('https://cbl-coverage-api.zeidalqadri.workers.dev/api/youtube/live');
        const liveData = await liveResponse.json();
        const isMatchLive = liveData.live?.some((v: any) => 
          v.title.toLowerCase().includes(`match #${match.matchNumber}`)
        );
        setIsLive(isMatchLive);
      } else {
        setHasVideo(false);
      }
    } catch (error) {
      console.error('Error checking for video:', error);
      setHasVideo(false);
    }
  };

  if (hasVideo === null || !hasVideo) {
    return null;
  }

  return (
    <a
      href={`/videos?match=${match.matchNumber}`}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
        isLive 
          ? 'bg-red-100 text-red-700 hover:bg-red-200' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {isLive ? (
        <>
          <Radio className="w-3 h-3" />
          LIVE
        </>
      ) : (
        <>
          <Play className="w-3 h-3" />
          Video
        </>
      )}
    </a>
  );
}