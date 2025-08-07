import { useState, useEffect } from 'react'

export function useLiveStream() {
  const [liveStreams, setLiveStreams] = useState<any[]>([])
  const [lastUpdate, setLastUpdate] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    let intervalId: NodeJS.Timeout
    
    const checkLiveStream = async () => {
      // Only fetch if data is older than 30 seconds
      if (Date.now() - lastUpdate < 30000) return
      
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 8000)
        
        const response = await fetch('https://cbl-coverage-api.zeidalqladri.workers.dev/api/youtube/live', {
          signal: controller.signal,
          headers: {
            'Cache-Control': 'no-cache'
          }
        })
        
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        
        const data = await response.json()
        setLiveStreams(data.live || [])
        setLastUpdate(Date.now())
        setIsLoading(false)
      } catch (error) {
        console.error('Live stream check failed:', error)
        setIsLoading(false)
      }
    }
    
    checkLiveStream()
    intervalId = setInterval(checkLiveStream, 60000)
    
    return () => clearInterval(intervalId)
  }, [lastUpdate])
  
  return { liveStreams, isLoading }
}