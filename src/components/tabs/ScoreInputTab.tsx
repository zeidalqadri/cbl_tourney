'use client'

import { useState, useEffect } from 'react'
import ScoreInput from '@/components/ScoreInput'
import PasswordModal from '@/components/PasswordModal'
import { useAuth } from '@/hooks/useAuth'
import { Lock, Shield } from 'lucide-react'

export default function ScoreInputTab() {
  const { isAuthenticated, isLoading, login } = useAuth()
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setShowPasswordModal(true)
    }
  }, [isLoading, isAuthenticated])

  const handleAuthenticate = (password: string): boolean => {
    return login(password)
  }

  const handleAuthSuccess = () => {
    setShowPasswordModal(false)
  }

  const handleModalClose = () => {
    setShowPasswordModal(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cbl-orange mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <>
        <div className="max-w-md mx-auto py-20">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-gradient-to-br from-mss-turquoise/20 to-cbl-orange/20 rounded-full">
              <Lock className="w-10 h-10 text-cbl-orange" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Authentication Required</h2>
            <p className="text-gray-600 mb-6">
              This section is restricted to authorized tournament officials only.
            </p>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-cbl-orange to-orange-500 text-white rounded-lg font-medium hover:from-orange-600 hover:to-orange-600 transition-all"
            >
              Enter Password
            </button>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 text-blue-800">
                <Shield className="w-5 h-5" />
                <span className="text-sm font-medium">Security Notice</span>
              </div>
              <p className="text-xs text-blue-700 mt-1">
                Only tournament officials with valid credentials can access the score input system.
              </p>
            </div>
          </div>
        </div>
        
        <PasswordModal
          isOpen={showPasswordModal}
          onClose={handleModalClose}
          onSuccess={handleAuthSuccess}
          onAuthenticate={handleAuthenticate}
        />
      </>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">Authenticated as Official</span>
          </div>
          <span className="text-xs text-green-600">Session active</span>
        </div>
      </div>
      
      <ScoreInput />
    </div>
  )
}