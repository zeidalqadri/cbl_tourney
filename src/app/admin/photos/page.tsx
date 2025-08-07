import { Camera, Upload, Image as ImageIcon } from 'lucide-react'

export default function PhotoManagementPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Photo Management</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Tournament Photos
          </h2>
          
          <div className="space-y-4">
            <div className="p-8 border-2 border-dashed rounded-lg text-center">
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="font-medium mb-2">Upload Photos</h3>
              <p className="text-sm text-gray-600 mb-4">
                Photo upload will be available during the tournament
              </p>
              <button 
                className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed"
                disabled
              >
                Upload Photos
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <ImageIcon className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold text-blue-600">0</div>
                <div className="text-sm text-gray-600">Photos Uploaded</div>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg text-center">
                <Camera className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                <div className="text-2xl font-bold text-orange-600">129</div>
                <div className="text-sm text-gray-600">Matches to Cover</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold text-green-600">Ready</div>
                <div className="text-sm text-gray-600">System Status</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}