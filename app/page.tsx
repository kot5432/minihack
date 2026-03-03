'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import CommonLogo from '@/components/CommonLogo'
import { TEMPLATES } from '@/lib/templates'

export default function Home() {
  const [task, setTask] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Initialize templates in localStorage
    if (!localStorage.getItem('minihack.templates')) {
      localStorage.setItem('minihack.templates', JSON.stringify(TEMPLATES))
    }

    // Restore next step from previous session
    const nextStep = localStorage.getItem('minihack.nextStep')
    if (nextStep) {
      setTask(nextStep)
    }
  }, [])

  const handleStart = () => {
    if (!task.trim()) return

    // Save session data
    const sessionId = `session_${Date.now()}`
    const sessionData = {
      sessionId,
      theme: task,
      declaredStep: task,
      declaredFromTemplate: null,
      startAt: new Date().toISOString(),
      keystrokes: 0
    }
    
    localStorage.setItem('minihack.currentSession', JSON.stringify(sessionData))
    
    router.push('/focus')
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center overflow-hidden">
      <CommonLogo variant="home" />

      <div className="flex flex-col items-center space-y-6 md:space-y-8 w-full max-w-sm md:max-w-md px-4">
        {/* Task Input */}
        <div className="w-full">
          <input
            type="text"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            className="w-full h-12 md:h-14 px-4 bg-gray-900 border border-gray-800 rounded text-white font-mono text-sm md:text-base lg:text-lg focus:outline-none focus:border-blue-500 placeholder-gray-600"
          />
        </div>

        <button
          onClick={handleStart}
          disabled={!task.trim()}
          className="w-full h-12 md:h-14 px-6 bg-blue-600 text-white font-mono text-sm md:text-base lg:text-lg rounded disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed"
        >
          Start MiniHack
        </button>
      </div>
    </div>
  )
}
