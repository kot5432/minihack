'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import CommonLogo from '@/components/CommonLogo'

const DURATION = 25 * 60 // 25 minutes in seconds

export default function Focus() {
  const [timeLeft, setTimeLeft] = useState(DURATION)
  const [keystrokes, setKeystrokes] = useState(0)
  const [startTime, setStartTime] = useState<string>('')
  const router = useRouter()

  useEffect(() => {
    // Initialize or restore session
    let savedStartTime = localStorage.getItem('minihack_start')
    let savedKeystrokes = parseInt(localStorage.getItem('minihack_keystrokes') || '0')
    
    if (!savedStartTime) {
      // New session
      savedStartTime = new Date().toISOString()
      localStorage.setItem('minihack_start', savedStartTime)
      localStorage.setItem('minihack_keystrokes', '0')
      savedKeystrokes = 0
    }
    
    setStartTime(savedStartTime)
    setKeystrokes(savedKeystrokes)

    // Calculate time left based on absolute time
    const calculateTimeLeft = () => {
      const start = new Date(savedStartTime).getTime()
      const now = Date.now()
      const elapsed = Math.floor((now - start) / 1000)
      const remaining = Math.max(0, DURATION - elapsed)

      if (remaining === 0) {
        handleAutoFinish()
      }
      return remaining
    }

    // Initial calculation
    setTimeLeft(calculateTimeLeft())

    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000)

    // Visibility API for tab switching correction
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setTimeLeft(calculateTimeLeft())
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  useEffect(() => {
    // Keystroke tracking with immediate persistence
    const handleKeyDown = () => {
      setKeystrokes(prev => {
        const next = prev + 1
        localStorage.setItem('minihack_keystrokes', next.toString())
        return next
      })
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleAutoFinish = () => {
    const endTime = new Date().toISOString()
    localStorage.setItem('minihack_end', endTime)
    router.push('/reflect')
  }

  const handleFinish = () => {
    const endTime = new Date().toISOString()
    localStorage.setItem('minihack_end', endTime)
    router.push('/reflect')
  }

  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center overflow-hidden">
      <div className="flex flex-col items-center space-y-12 md:space-y-16">
        <div className="text-[clamp(3rem,20vw,12rem)] font-mono text-white tabular-nums leading-none font-light">
          {formatTime(timeLeft)}
        </div>

        <button
          onClick={handleFinish}
          className="w-32 h-12 md:h-14 bg-blue-600 text-white font-mono text-sm md:text-base lg:text-lg rounded disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed"
        >
          Finish
        </button>
      </div>
    </div>
  )
}
