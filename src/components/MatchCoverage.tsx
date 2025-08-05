'use client';

import React, { useState, useEffect } from 'react';

interface CoverageData {
  status: 'waiting' | 'video-ready' | 'photos-ready';
  contentType: 'video' | 'photos' | null;
  lastUpdated: string | null;
  updatedBy: string | null;
  videoUrl?: string;
  embedUrl?: string;
  galleryUrl?: string;
  thumbnail?: string;
  photoCount?: number;
}

interface MatchCoverageProps {
  venue: string;
  className?: string;
}

export function MatchCoverage({ venue, className = '' }: MatchCoverageProps) {
  const [coverage, setCoverage] = useState<CoverageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showVideo, setShowVideo] = useState(false);

  const API_URL = 'https://cbl-coverage-api.zeidalqadri.workers.dev';

  useEffect(() => {
    const fetchCoverage = async () => {
      try {
        const response = await fetch(`${API_URL}/api/coverage`);
        const data = await response.json();
        
        // Convert venue name to key format
        const venueKey = venue.toLowerCase().replace(/\s+/g, '-');
        setCoverage(data[venueKey] || null);
      } catch (error) {
        console.error('Failed to fetch coverage:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoverage();
    const interval = setInterval(fetchCoverage, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [venue]);

  if (loading) {
    return (
      <div className={`animate-pulse bg-gray-100 p-4 rounded-lg ${className}`}>
        <div className="h-4 bg-gray-200 rounded w-32"></div>
      </div>
    );
  }

  if (!coverage || coverage.status === 'waiting') {
    return (
      <div className={`bg-gray-100 p-4 rounded-lg text-center ${className}`}>
        <p className="text-gray-500 text-sm">📡 Coverage coming soon...</p>
      </div>
    );
  }

  if (coverage.contentType === 'video' && coverage.status === 'video-ready') {
    return (
      <div className={`bg-red-50 border-2 border-red-200 rounded-lg overflow-hidden ${className}`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <span className="font-semibold text-red-700">LIVE VIDEO</span>
            </div>
            <button
              onClick={() => setShowVideo(!showVideo)}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              {showVideo ? 'Hide' : 'Watch'} →
            </button>
          </div>
          
          {showVideo && coverage.embedUrl && (
            <div className="mt-3">
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <iframe
                  src={coverage.embedUrl}
                  className="w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
              {coverage.videoUrl && (
                <a
                  href={coverage.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-sm text-red-600 hover:underline"
                >
                  Open in YouTube
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (coverage.contentType === 'photos' && coverage.status === 'photos-ready') {
    return (
      <div className={`bg-green-50 border-2 border-green-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📸</span>
            <div>
              <p className="font-semibold text-green-700">Photo Gallery</p>
              {coverage.photoCount && (
                <p className="text-sm text-green-600">{coverage.photoCount} photos</p>
              )}
            </div>
          </div>
          {coverage.galleryUrl ? (
            <a
              href={coverage.galleryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              View Gallery →
            </a>
          ) : (
            <span className="text-green-600 text-sm">Processing...</span>
          )}
        </div>
        {coverage.thumbnail && (
          <img
            src={coverage.thumbnail}
            alt={`${venue} match photos`}
            className="mt-3 w-full h-32 object-cover rounded-lg"
          />
        )}
      </div>
    );
  }

  return null;
}

// Mini version for match cards
export function MatchCoverageBadge({ venue }: { venue: string }) {
  const [coverage, setCoverage] = useState<CoverageData | null>(null);

  useEffect(() => {
    const fetchCoverage = async () => {
      try {
        const response = await fetch('https://cbl-coverage-api.zeidalqadri.workers.dev/api/coverage');
        const data = await response.json();
        const venueKey = venue.toLowerCase().replace(/\s+/g, '-');
        setCoverage(data[venueKey] || null);
      } catch (error) {
        console.error('Failed to fetch coverage:', error);
      }
    };

    fetchCoverage();
    const interval = setInterval(fetchCoverage, 120000); // Every 2 minutes
    return () => clearInterval(interval);
  }, [venue]);

  if (!coverage || coverage.status === 'waiting') {
    return null;
  }

  if (coverage.status === 'video-ready') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </span>
        LIVE
      </span>
    );
  }

  if (coverage.status === 'photos-ready') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
        📸 Photos
      </span>
    );
  }

  return null;
}