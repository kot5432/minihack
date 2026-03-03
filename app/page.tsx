'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import CommonLogo from '@/components/CommonLogo'

export default function Home() {
  const [theme, setTheme] = useState('')
  const router = useRouter()

  useEffect(() => {
    const savedTheme = localStorage.getItem('minihack_theme')
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])

  const handleStart = () => {
    if (theme.trim()) {
      localStorage.setItem('minihack_theme', theme.trim())
      router.push('/focus')
    }
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center overflow-hidden">
      <CommonLogo variant="home" />

      <div className="flex flex-col items-center space-y-6 md:space-y-8 w-full max-w-sm md:max-w-md px-4">
        <h1 className="text-gray-400 text-sm md:text-base lg:text-lg font-mono text-center">
          今日の MiniHack のテーマ
        </h1>

        <input
          type="text"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          placeholder="テーマを入力..."
          className="w-full h-12 md:h-14 px-4 bg-gray-900 border border-gray-800 rounded text-white font-mono text-sm md:text-base lg:text-lg focus:outline-none focus:border-blue-500 placeholder-gray-600"
        />

        <button
          onClick={handleStart}
          disabled={!theme.trim()}
          className="w-full h-12 md:h-14 px-6 bg-blue-600 text-white font-mono text-sm md:text-base lg:text-lg rounded disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed"
        >
          Start MiniHack
        </button>
      </div>
    </div>
  )
}
