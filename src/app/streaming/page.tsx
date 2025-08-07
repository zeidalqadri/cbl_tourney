export default function StreamingPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Live Streaming</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-600 mb-2">Stream Offline</p>
              <p className="text-sm text-gray-500">Check back during tournament hours</p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded">
              <h3 className="font-semibold mb-2">Tournament Schedule</h3>
              <p className="text-sm text-gray-700">August 4-7, 2025</p>
            </div>
            <div className="p-4 bg-orange-50 rounded">
              <h3 className="font-semibold mb-2">Live Coverage</h3>
              <p className="text-sm text-gray-700">Selected matches streamed live</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}