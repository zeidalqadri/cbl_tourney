'use client'

import { useState } from 'react'
import { handleN8NWebhook } from '@/lib/webhooks'
import { syncYouTubeVideos } from '@/lib/media-api'

export default function WebhooksPage() {
  const [webhookUrl, setWebhookUrl] = useState('')
  const [testResult, setTestResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // Generate webhook URL for N8N
  const generateWebhookUrl = () => {
    const baseUrl = window.location.origin
    const url = `${baseUrl}/webhooks`
    setWebhookUrl(url)
    navigator.clipboard.writeText(url)
  }

  // Test YouTube sync
  const testYouTubeSync = async () => {
    setLoading(true)
    try {
      const result = await handleN8NWebhook({
        type: 'youtube',
        data: { action: 'sync' }
      })
      setTestResult(result)
    } catch (error) {
      setTestResult({ success: false, error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  // Test photo upload
  const testPhotoUpload = async () => {
    setLoading(true)
    try {
      const result = await handleN8NWebhook({
        type: 'photo',
        data: {
          photos: [
            {
              url: 'https://example.com/test-photo.jpg',
              caption: 'Test photo from webhook',
              photographer: 'Test Photographer'
            }
          ],
          venue: 'SJKC MALIM',
          matchNumber: 1,
          division: 'boys'
        }
      })
      setTestResult(result)
    } catch (error) {
      setTestResult({ success: false, error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  // Test match status update
  const testMatchStatus = async () => {
    setLoading(true)
    try {
      const result = await handleN8NWebhook({
        type: 'match_status',
        data: {
          venue: 'SJKC YU HWA',
          matchNumber: 1,
          status: 'in_progress',
          liveStreamUrl: 'https://youtube.com/live/test123'
        }
      })
      setTestResult(result)
    } catch (error) {
      setTestResult({ success: false, error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  // Manual YouTube sync
  const manualYouTubeSync = async () => {
    setLoading(true)
    try {
      const result = await syncYouTubeVideos()
      setTestResult({ success: true, message: 'YouTube sync completed', data: result })
    } catch (error) {
      setTestResult({ success: false, error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Webhook Management</h1>

      {/* Webhook URL Section */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">N8N Webhook Configuration</h2>
        
        <div className="mb-4">
          <button
            onClick={generateWebhookUrl}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Generate Webhook URL
          </button>
        </div>

        {webhookUrl && (
          <div className="bg-gray-100 p-4 rounded">
            <p className="text-sm text-gray-600 mb-2">Use this URL in your N8N workflows (copied to clipboard):</p>
            <code className="text-sm break-all">{webhookUrl}</code>
            
            <div className="mt-4 text-sm text-gray-600">
              <p className="font-semibold mb-2">Webhook Payload Format:</p>
              <pre className="bg-white p-3 rounded border">{`{
  "type": "youtube" | "photo" | "match_status",
  "data": {
    // Type-specific data
  }
}`}</pre>
            </div>
          </div>
        )}
      </div>

      {/* Test Functions */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Test Webhook Functions</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={testYouTubeSync}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            Test YouTube Sync
          </button>
          
          <button
            onClick={testPhotoUpload}
            disabled={loading}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
          >
            Test Photo Upload
          </button>
          
          <button
            onClick={testMatchStatus}
            disabled={loading}
            className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 disabled:opacity-50"
          >
            Test Match Status
          </button>
          
          <button
            onClick={manualYouTubeSync}
            disabled={loading}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
          >
            Manual YouTube Sync
          </button>
        </div>
      </div>

      {/* Test Results */}
      {testResult && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Test Result</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}

      {/* N8N Workflow Examples */}
      <div className="bg-white p-6 rounded-lg shadow mt-6">
        <h2 className="text-xl font-semibold mb-4">N8N Workflow Examples</h2>
        
        <div className="space-y-4 text-sm">
          <div>
            <h3 className="font-semibold mb-2">YouTube Video Sync:</h3>
            <pre className="bg-gray-100 p-3 rounded">{`{
  "type": "youtube",
  "data": {
    "action": "sync"
  }
}`}</pre>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Photo Upload:</h3>
            <pre className="bg-gray-100 p-3 rounded">{`{
  "type": "photo",
  "data": {
    "photos": [
      {
        "url": "https://cloudinary.com/photo.jpg",
        "caption": "Match action shot",
        "photographer": "John Doe"
      }
    ],
    "venue": "SJKC MALIM",
    "matchNumber": 5,
    "division": "girls"
  }
}`}</pre>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Match Status Update:</h3>
            <pre className="bg-gray-100 p-3 rounded">{`{
  "type": "match_status",
  "data": {
    "venue": "SJKC YU HWA",
    "matchNumber": 3,
    "status": "in_progress",
    "liveStreamUrl": "https://youtube.com/live/abc123"
  }
}`}</pre>
          </div>
        </div>
      </div>
    </div>
  )
}