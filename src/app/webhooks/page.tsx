export default function WebhooksPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Webhook Handler</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Webhook integration status page</p>
          <div className="mt-4 p-4 bg-green-50 rounded">
            <p className="text-green-800">System ready for webhook events</p>
          </div>
        </div>
      </div>
    </div>
  )
}