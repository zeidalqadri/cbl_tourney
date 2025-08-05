'use client';

import React, { useState, useEffect } from 'react';

interface CoverageStatus {
  venue: string;
  status: string;
  contentType: string | null;
  lastUpdated: string | null;
  updatedBy: string | null;
}

export function CoverageForm() {
  const [venue, setVenue] = useState('');
  const [contentType, setContentType] = useState('');
  const [updatedBy, setUpdatedBy] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [currentStatus, setCurrentStatus] = useState<Record<string, CoverageStatus>>({});

  const API_URL = 'https://cbl-coverage-api.zeidalqadri.workers.dev';

  // Fetch current status
  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/api/coverage`);
      const data = await response.json();
      setCurrentStatus(data);
    } catch (error) {
      console.error('Failed to fetch status:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      const response = await fetch(`${API_URL}/api/coverage/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          venue,
          contentType,
          updatedBy,
          status: contentType === 'video' ? 'Video Ready' : 'Photos Uploaded'
        })
      });

      if (response.ok) {
        setMessage('✅ Coverage updated successfully!');
        setVenue('');
        setContentType('');
        fetchStatus(); // Refresh status immediately
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      setMessage('❌ Error updating coverage. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'video-ready': return '🔴';
      case 'photos-ready': return '📸';
      default: return '⏳';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'video-ready': return 'Video Live';
      case 'photos-ready': return 'Photos Ready';
      default: return 'Waiting';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold mb-2">CBL Coverage Update</h1>
          <p className="text-gray-600 mb-6">Report when video or photos are ready</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Venue
              </label>
              <select
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select venue...</option>
                <option value="Yu Hwa">Yu Hwa</option>
                <option value="Malim">Malim</option>
                <option value="Kuala Nerang">Kuala Nerang</option>
                <option value="Gemencheh">Gemencheh</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Content Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setContentType('video')}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    contentType === 'video'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-300'
                  }`}
                >
                  🎥 Video/Stream
                </button>
                <button
                  type="button"
                  onClick={() => setContentType('photos')}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    contentType === 'photos'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300'
                  }`}
                >
                  📸 Photos
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={updatedBy}
                onChange={(e) => setUpdatedBy(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="John Doe"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !venue || !contentType}
              className="w-full bg-blue-500 text-white p-3 rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Updating...' : 'Submit Update'}
            </button>
          </form>

          {message && (
            <div className={`mt-4 p-3 rounded-lg ${
              message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {message}
            </div>
          )}
        </div>

        {/* Current Status */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Current Status</h2>
          <div className="space-y-3">
            {['yu-hwa', 'malim', 'kuala-nerang', 'gemencheh'].map((venueKey) => {
              const status = currentStatus[venueKey];
              const displayName = venueKey.split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ');
              
              return (
                <div key={venueKey} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium">{displayName}</span>
                    {status?.lastUpdated && (
                      <p className="text-sm text-gray-500">
                        by {status.updatedBy} at {new Date(status.lastUpdated).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getStatusEmoji(status?.status || 'waiting')}</span>
                    <span className="text-sm font-medium">
                      {getStatusText(status?.status || 'waiting')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}