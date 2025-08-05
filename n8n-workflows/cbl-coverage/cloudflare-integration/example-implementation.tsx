// Example: Update your existing match component
// Replace the API URL with your Worker URL

import { useEffect, useState } from 'react';

export function MatchCoverageStatus({ venue }) {
  const [coverage, setCoverage] = useState(null);
  
  useEffect(() => {
    const fetchCoverage = async () => {
      try {
        const response = await fetch('https://cbl-coverage-api.zeidalqadri.workers.dev/api/coverage');
        const data = await response.json();
        
        // Convert venue name to key format
        const venueKey = venue.toLowerCase().replace(/\s+/g, '-');
        setCoverage(data[venueKey]);
      } catch (error) {
        console.error('Failed to fetch coverage:', error);
      }
    };
    
    fetchCoverage();
    // Refresh every minute
    const interval = setInterval(fetchCoverage, 60000);
    return () => clearInterval(interval);
  }, [venue]);
  
  if (!coverage || coverage.status === 'waiting') {
    return (
      <div className="text-gray-500">
        📡 Coverage coming soon...
      </div>
    );
  }
  
  if (coverage.contentType === 'video') {
    return (
      <div className="bg-red-50 p-2 rounded">
        🔴 LIVE VIDEO
        {coverage.videoUrl && (
          <a href={coverage.videoUrl} target="_blank" className="ml-2 text-blue-500">
            Watch →
          </a>
        )}
      </div>
    );
  }
  
  if (coverage.contentType === 'photos') {
    return (
      <div className="bg-green-50 p-2 rounded">
        📸 Photo Gallery Ready
        {coverage.galleryUrl && (
          <a href={coverage.galleryUrl} target="_blank" className="ml-2 text-blue-500">
            View →
          </a>
        )}
      </div>
    );
  }
}