'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import CommonLogo from '@/components/CommonLogo'
import { TEMPLATES } from '@/lib/templates'

export default function Home() {
  const [theme, setTheme] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [declaration, setDeclaration] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Initialize templates in localStorage
    if (!localStorage.getItem('minihack.templates')) {
      localStorage.setItem('minihack.templates', JSON.stringify(TEMPLATES))
    }

    // Restore next step from previous session
    const nextStep = localStorage.getItem('minihack.nextStep')
    if (nextStep) {
      setTheme(nextStep)
      setSelectedTemplate(nextStep)
    }
  }, [])

  const handleRandomTemplate = () => {
    const randomIndex = Math.floor(Math.random() * TEMPLATES.length)
    const randomTemplate = TEMPLATES[randomIndex]
    setSelectedTemplate(randomTemplate)
    setTheme(randomTemplate)
  }

  const handleStart = () => {
    if (!theme.trim()) return
    setShowModal(true)
  }

  const handleConfirmDeclaration = () => {
    if (!declaration.trim()) return

    // Save session data
    const sessionId = `session_${Date.now()}`
    const sessionData = {
      sessionId,
      theme,
      declaredStep: declaration,
      declaredFromTemplate: selectedTemplate || null,
      startAt: new Date().toISOString(),
      keystrokes: 0
    }
    
    localStorage.setItem('minihack.currentSession', JSON.stringify(sessionData))
    localStorage.setItem('minihack_theme', theme)
    
    setShowModal(false)
    router.push('/focus')
  }

  const handleCancel = () => {
    setShowModal(false)
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center overflow-hidden">
      <CommonLogo variant="home" />

      <div className="flex flex-col items-center space-y-6 md:space-y-8 w-full max-w-sm md:max-w-md px-4">
        <h1 className="text-gray-400 text-sm md:text-base lg:text-lg font-mono text-center">
          今日の一歩（テンプレートを選択）
        </h1>

        {/* Template Selection */}
        <div className="w-full space-y-3">
          <select
            value={selectedTemplate}
            onChange={(e) => {
              setSelectedTemplate(e.target.value)
              setTheme(e.target.value)
            }}
            className="w-full h-12 md:h-14 px-4 bg-gray-900 border border-gray-800 rounded text-white font-mono text-sm md:text-base lg:text-lg focus:outline-none focus:border-blue-500"
          >
            <option value="">テンプレートを選択...</option>
            {TEMPLATES.map((template, index) => (
              <option key={index} value={template}>
                {template.length > 30 ? template.substring(0, 30) + '...' : template}
              </option>
            ))}
          </select>

          <button
            onClick={handleRandomTemplate}
            className="w-full h-10 md:h-12 bg-gray-800 text-white font-mono text-sm md:text-base rounded hover:bg-gray-700 transition-colors"
          >
            ランダムで選ぶ
          </button>
        </div>

        {/* Theme Input */}
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

      {/* Declaration Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 md:p-8 w-full max-w-md">
            <h2 className="text-white text-lg md:text-xl font-mono mb-4 text-center">
              今日の一歩を宣言してください
            </h2>
            
            <p className="text-gray-400 text-sm md:text-base font-mono mb-6 text-center leading-relaxed">
              大きな目標ではなく、25分で確実に終えられる「最初の一歩」を1行で宣言してください。
            </p>

            <textarea
              value={declaration}
              onChange={(e) => setDeclaration(e.target.value)}
              placeholder="例：トップページのCTA文を3案書く"
              maxLength={100}
              className="w-full h-24 px-4 py-3 bg-gray-800 border border-gray-700 rounded text-white font-mono text-sm md:text-base focus:outline-none focus:border-blue-500 placeholder-gray-600 resize-none"
            />

            <div className="text-gray-500 text-xs font-mono text-right mb-6">
              {declaration.length}/100
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleCancel}
                className="flex-1 h-12 bg-gray-800 text-white font-mono text-sm md:text-base rounded hover:bg-gray-700 transition-colors"
              >
                キャンセル
              </button>
              
              <button
                onClick={handleConfirmDeclaration}
                disabled={!declaration.trim()}
                className="flex-1 h-12 bg-blue-600 text-white font-mono text-sm md:text-base rounded disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed"
              >
                宣言して開始
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
