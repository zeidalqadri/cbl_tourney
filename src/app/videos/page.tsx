import { YouTubeFeed } from '@/components/YouTubeFeed';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Match Videos - CBL Tournament',
  description: 'Watch live streams and recorded matches from the CBL Tournament',
};

export default function VideosPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">CBL Match Videos</h1>
          <p className="text-gray-600">
            Watch live matches and catch up on recorded games from all venues
          </p>
        </div>

        {/* YouTube Feed */}
        <YouTubeFeed />

        {/* Instructions */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-2">📹 Recording a Match?</h2>
          <p className="text-gray-700 mb-3">
            Help us capture every moment! When streaming to YouTube:
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-600">
            <li>Include match number in title (e.g., "Match #23")</li>
            <li>Add venue name (Yu Hwa, Malim, Kuala Nerang, or Gemencheh)</li>
            <li>Mention teams and division (Boys/Girls)</li>
            <li>Example: "Match #23 - Team A vs Team B - Boys @ Yu Hwa"</li>
          </ul>
        </div>
      </div>
    </div>
  );
}