/**
 * Updated frontend component to fetch coverage from Cloudflare Workers
 * Add this to your Next.js/React components
 */

import { useState, useEffect } from 'react';

// Coverage data type
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

interface VenueCoverage {
  'yu-hwa': CoverageData;
  'malim': CoverageData;
  'kuala-nerang': CoverageData;
  'gemencheh': CoverageData;
}

// Hook to fetch coverage data
export function useCoverageData() {
  const [coverage, setCoverage] = useState<VenueCoverage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCoverage = async () => {
    try {
      // Use your Worker URL
      const response = await fetch('https://coverage-api.YOUR-SUBDOMAIN.workers.dev/api/coverage');
      if (!response.ok) throw new Error('Failed to fetch coverage');
      
      const data = await response.json();
      setCoverage(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoverage();
    // Refresh every 2 minutes
    const interval = setInterval(fetchCoverage, 120000);
    return () => clearInterval(interval);
  }, []);

  return { coverage, loading, error, refetch: fetchCoverage };
}

// Coverage display component
export function VenueCoverageCard({ venue, matchData }) {
  const { coverage, loading } = useCoverageData();
  
  if (loading || !coverage) {
    return <div className="animate-pulse">Loading coverage...</div>;
  }

  const venueKey = venue.toLowerCase().replace(/\s+/g, '-');
  const coverageData = coverage[venueKey];

  if (!coverageData || coverageData.status === 'waiting') {
    return (
      <div className="bg-gray-100 p-4 rounded-lg">
        <h3 className="font-bold">{venue}</h3>
        <p className="text-gray-600">Coverage coming soon...</p>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-green-500 p-4 rounded-lg">
      <h3 className="font-bold">{venue}</h3>
      
      {coverageData.contentType === 'video' && coverageData.embedUrl && (
        <div className="mt-2">
          <div className="aspect-video">
            <iframe
              src={coverageData.embedUrl}
              className="w-full h-full rounded"
              allowFullScreen
            />
          </div>
          <a 
            href={coverageData.videoUrl} 
            target="_blank" 
            className="text-blue-500 hover:underline mt-2 inline-block"
          >
            Watch on YouTube →
          </a>
        </div>
      )}

      {coverageData.contentType === 'photos' && coverageData.galleryUrl && (
        <div className="mt-2">
          {coverageData.thumbnail && (
            <img 
              src={coverageData.thumbnail} 
              alt={`${venue} photos`}
              className="w-full rounded mb-2"
            />
          )}
          <a 
            href={coverageData.galleryUrl}
            target="_blank"
            className="bg-blue-500 text-white px-4 py-2 rounded inline-block"
          >
            View {coverageData.photoCount || ''} Photos →
          </a>
        </div>
      )}

      <p className="text-sm text-gray-500 mt-2">
        Updated {new Date(coverageData.lastUpdated).toLocaleTimeString()}
      </p>
    </div>
  );
}

// Admin component to manually update coverage
export function CoverageAdmin() {
  const [venue, setVenue] = useState('');
  const [contentType, setContentType] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('https://coverage-api.YOUR-SUBDOMAIN.workers.dev/api/coverage/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          venue,
          contentType,
          updatedBy: 'admin'
        })
      });

      if (response.ok) {
        alert('Coverage updated!');
        setVenue('');
        setContentType('');
      }
    } catch (error) {
      alert('Update failed: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-gray-100 rounded">
      <h3 className="font-bold mb-4">Update Coverage</h3>
      
      <select 
        value={venue} 
        onChange={(e) => setVenue(e.target.value)}
        className="w-full p-2 mb-2 border rounded"
        required
      >
        <option value="">Select Venue</option>
        <option value="Yu Hwa">Yu Hwa</option>
        <option value="Malim">Malim</option>
        <option value="Kuala Nerang">Kuala Nerang</option>
        <option value="Gemencheh">Gemencheh</option>
      </select>

      <select
        value={contentType}
        onChange={(e) => setContentType(e.target.value)}
        className="w-full p-2 mb-2 border rounded"
        required
      >
        <option value="">Select Type</option>
        <option value="video">Video</option>
        <option value="photos">Photos</option>
      </select>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-blue-500 text-white p-2 rounded disabled:opacity-50"
      >
        {submitting ? 'Updating...' : 'Update Coverage'}
      </button>
    </form>
  );
}