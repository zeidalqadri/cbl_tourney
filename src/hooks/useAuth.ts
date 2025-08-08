'use client'

import { useState, useEffect, useCallback } from 'react'

const AUTH_KEY = 'cbl_score_input_auth'
const SESSION_DURATION = 8 * 60 * 60 * 1000 // 8 hours in milliseconds

interface AuthState {
  isAuthenticated: boolean
  lastAuthTime: number | null
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = () => {
    try {
      const stored = sessionStorage.getItem(AUTH_KEY)
      if (stored) {
        const authState: AuthState = JSON.parse(stored)
        const now = Date.now()
        
        if (authState.isAuthenticated && authState.lastAuthTime) {
          const timeSinceAuth = now - authState.lastAuthTime
          
          if (timeSinceAuth < SESSION_DURATION) {
            setIsAuthenticated(true)
          } else {
            sessionStorage.removeItem(AUTH_KEY)
            setIsAuthenticated(false)
          }
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error)
      sessionStorage.removeItem(AUTH_KEY)
    } finally {
      setIsLoading(false)
    }
  }

  const login = useCallback((password: string): boolean => {
    // TODO: Implement server-side authentication for better security
    // Current implementation uses client-side validation which can be bypassed
    // Temporary restoration of fallback for production use
    const correctPassword = process.env.NEXT_PUBLIC_SCORE_INPUT_PASSWORD || 'cbl2025'
    
    if (password === correctPassword) {
      const authState: AuthState = {
        isAuthenticated: true,
        lastAuthTime: Date.now()
      }
      sessionStorage.setItem(AUTH_KEY, JSON.stringify(authState))
      setIsAuthenticated(true)
      return true
    }
    
    return false
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem(AUTH_KEY)
    setIsAuthenticated(false)
  }, [])

  return {
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuthStatus
  }
}