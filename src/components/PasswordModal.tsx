'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, X, CheckCircle, AlertCircle } from 'lucide-react'

interface PasswordModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  onAuthenticate: (password: string) => boolean
}

export default function PasswordModal({ isOpen, onClose, onSuccess, onAuthenticate }: PasswordModalProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!password.trim()) {
      setError('Please enter a password')
      return
    }

    const isValid = onAuthenticate(password)
    
    if (isValid) {
      setIsSuccess(true)
      setTimeout(() => {
        onSuccess()
        setPassword('')
        setError('')
        setIsSuccess(false)
      }, 500)
    } else {
      setError('Incorrect password. Please try again.')
      setPassword('')
    }
  }

  const handleClose = () => {
    if (!isSuccess) {
      setPassword('')
      setError('')
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-br from-mss-turquoise/20 to-cbl-orange/20 rounded-full">
                <Lock className="w-8 h-8 text-cbl-orange" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Score Input Access</h2>
              <p className="mt-2 text-sm text-gray-600">
                This section is restricted to authorized tournament officials only
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cbl-orange focus:border-transparent transition-all"
                  placeholder="Enter official password"
                  autoFocus
                  disabled={isSuccess}
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              {isSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm"
                >
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Authentication successful!</span>
                </motion.div>
              )}

              <button
                type="submit"
                disabled={isSuccess}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                  isSuccess
                    ? 'bg-green-500 text-white'
                    : 'bg-gradient-to-r from-cbl-orange to-orange-500 text-white hover:from-orange-600 hover:to-orange-600'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isSuccess ? 'Success!' : 'Authenticate'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                Contact tournament administration if you need access
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}