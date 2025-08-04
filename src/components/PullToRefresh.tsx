'use client'

import { useState, useRef, ReactNode } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { RefreshCw } from 'lucide-react'

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: ReactNode
}

export default function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isPulling, setIsPulling] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const y = useMotionValue(0)
  const pullDistance = 80
  
  const basketballRotation = useTransform(y, [0, pullDistance], [0, 360])
  const pullProgress = useTransform(y, [0, pullDistance], [0, 1])
  const pullOpacity = useTransform(y, [0, pullDistance / 2], [0, 1])

  const handleTouchStart = () => {
    if (containerRef.current?.scrollTop === 0) {
      setIsPulling(true)
    }
  }

  const handleTouchEnd = async () => {
    if (y.get() >= pullDistance && !isRefreshing) {
      setIsRefreshing(true)
      await onRefresh()
      setIsRefreshing(false)
    }
    setIsPulling(false)
    y.set(0)
  }

  return (
    <div className="relative overflow-hidden">
      {/* Pull Indicator */}
      <motion.div
        className="absolute top-0 left-0 right-0 flex items-center justify-center py-4 pointer-events-none"
        style={{ 
          opacity: pullOpacity,
          y: useTransform(y, [0, pullDistance], [-40, 0])
        }}
      >
        <motion.div
          className="relative w-10 h-10"
          style={{ rotate: basketballRotation }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cbl-orange to-score-burst rounded-full" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-[1px] bg-black/20" />
            <div className="absolute w-[1px] h-8 bg-black/20" />
            <div className="absolute w-6 h-6 rounded-full border border-black/20" style={{ transform: 'rotate(45deg)' }}>
              <div className="absolute top-0 left-1/2 w-[1px] h-3 bg-black/20 -translate-x-1/2" />
              <div className="absolute bottom-0 left-1/2 w-[1px] h-3 bg-black/20 -translate-x-1/2" />
            </div>
          </div>
        </motion.div>
        <motion.span 
          className="ml-2 text-sm font-medium text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: isRefreshing ? 1 : pullProgress.get() }}
        >
          {isRefreshing ? 'Refreshing...' : 'Pull to refresh'}
        </motion.span>
      </motion.div>

      {/* Content */}
      <motion.div
        ref={containerRef}
        className="relative"
        style={{ y: isPulling ? y : 0 }}
        drag={isPulling ? "y" : false}
        dragConstraints={{ top: 0, bottom: pullDistance }}
        dragElastic={0.5}
        onDragStart={handleTouchStart}
        onDragEnd={handleTouchEnd}
        animate={{ y: isRefreshing ? pullDistance / 2 : 0 }}
      >
        {children}
      </motion.div>
    </div>
  )
}