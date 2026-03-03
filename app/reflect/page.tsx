'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import CommonLogo from '@/components/CommonLogo'

interface SessionData {
  theme: string
  keystrokes: number
  start: string
  end: string
}

export default function Reflect() {
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [whatIDid, setWhatIDid] = useState('')
  const [whatINoticed, setWhatINoticed] = useState('')
  const [summary, setSummary] = useState('')
  const [candidates, setCandidates] = useState<{ id: string; text: string }[]>([])
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const router = useRouter()

  useEffect(() => {
    // Load session data from localStorage
    const theme = localStorage.getItem('minihack_theme') || ''
    const keystrokes = parseInt(localStorage.getItem('minihack_keystrokes') || '0')
    const start = localStorage.getItem('minihack_start') || ''
    const end = localStorage.getItem('minihack_end') || ''

    setSessionData({ theme, keystrokes, start, end })

    // Restore input fields if they exist
    const savedWhatIDid = localStorage.getItem('minihack_whatIDid') || ''
    const savedWhatINoticed = localStorage.getItem('minihack_whatINoticed') || ''
    const savedSummary = localStorage.getItem('minihack_summary') || ''
    const savedWhatIDidDraft = localStorage.getItem('minihack_draft_did') || ''
    const savedWhatINoticedDraft = localStorage.getItem('minihack_draft_noticed') || ''

    setWhatIDid(savedWhatIDid || savedWhatIDidDraft)
    setWhatINoticed(savedWhatINoticed || savedWhatINoticedDraft)
    setSummary(savedSummary)

    // Clear any browser autocomplete/saved form data
    setTimeout(() => {
      const forms = document.querySelectorAll('form')
      forms.forEach(form => form.reset())
    }, 100)
  }, [])

  // Auto-save input fields
  useEffect(() => {
    if (whatIDid) {
      localStorage.setItem('minihack_whatIDid', whatIDid)
    }
  }, [whatIDid])

  useEffect(() => {
    if (whatINoticed) {
      localStorage.setItem('minihack_whatINoticed', whatINoticed)
    }
  }, [whatINoticed])

  useEffect(() => {
    if (summary) {
      localStorage.setItem('minihack_summary', summary)
    }
  }, [summary])

  // Persist drafts on change
  useEffect(() => {
    if (whatIDid) localStorage.setItem('minihack_draft_did', whatIDid)
  }, [whatIDid])

  useEffect(() => {
    if (whatINoticed) localStorage.setItem('minihack_draft_noticed', whatINoticed)
  }, [whatINoticed])

  const calculateFocusScore = () => {
    if (!sessionData) return 0
    return Math.round(sessionData.keystrokes * 0.1)
  }

  const handleSummarize = async () => {
    if (!sessionData || !whatIDid.trim() || !whatINoticed.trim()) {
      setError('入力内容を確認してください')
      return
    }

    setIsLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: sessionData.theme,
          reflection: whatIDid,
          insights: whatINoticed,
        }),
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      const data = await response.json()
      setCandidates(data.candidates)
      // Auto-select first one for initial state
      if (data.candidates.length > 0) {
        handleSelectCandidate(data.candidates[0].id, data.candidates[0].text)
      }
      setRetryCount(0)
    } catch (err) {
      console.error('Failed to summarize:', err)
      if (retryCount < 2) {
        setRetryCount(prev => prev + 1)
        setError('要約に失敗しました。再試行します...')
        setTimeout(() => handleSummarize(), 2000)
      } else {
        setError('要約の生成に失敗しました。後でもう一度お試しください。')
        setRetryCount(0)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectCandidate = (id: string, text: string) => {
    setSelectedCandidateId(id)
    setSummary(text)
  }

  const handleLogAndExit = async () => {
    if (selectedCandidateId && summary) {
      const originalText = candidates.find(c => c.id === selectedCandidateId)?.text
      try {
        await fetch('/api/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: sessionData?.start,
            templateId: selectedCandidateId,
            generatedText: originalText,
            editedText: summary,
            isEdited: originalText !== summary
          }),
        })
      } catch (err) {
        console.error('Failed to log summary:', err)
      }
    }

    // Clear all session and draft data
    const keys = [
      'minihack_theme',
      'minihack_keystrokes',
      'minihack_start',
      'minihack_end',
      'minihack_draft_did',
      'minihack_draft_noticed'
    ]
    keys.forEach(k => localStorage.removeItem(k))
    router.push('/')
  }

  if (!sessionData) {
    return (
      <div className="min-h-screen bg-black flex justify-center items-center">
        <div className="text-white font-mono">Loading...</div>
      </div>
    )
  }

  return (
    <div className="w-full h-screen flex flex-col items-center justify-start bg-black overflow-y-auto relative font-mono pt-20 pb-12">
      {/* Logo in top-left */}
      <div className="fixed top-0 left-0 z-50">
        <CommonLogo variant="reflect" />
      </div>

      <div className="flex flex-col items-center space-y-12 w-full max-w-3xl px-4">
        {/* Main Card */}
        <div className="w-full bg-[#111111] border border-white/5 rounded-lg p-12 md:p-16 flex flex-col space-y-12 shrink-0">
          {/* Theme Display */}
          <div className="text-center space-y-6">
            <h2 className="text-white text-sm md:text-base font-bold tracking-wider">
              今日のMiniHackのテーマ
            </h2>
            <p className="text-gray-400 text-xs md:text-sm">
              {sessionData.theme || 'ホーム画面で入力欄に書いていたテーマを出力'}
            </p>
          </div>

          {/* Input Fields */}
          <div className="space-y-12">
            <div className="space-y-4">
              <label className="block text-center text-white text-xs md:text-sm font-bold opacity-90">
                やったこと
              </label>
              <textarea
                name="whatIDid"
                value={whatIDid}
                onChange={(e) => setWhatIDid(e.target.value)}
                autoComplete="off"
                className="w-full h-32 px-4 py-8 bg-black/20 border border-white/5 rounded text-gray-400 text-xs md:text-sm focus:outline-none focus:border-blue-500/30 placeholder-gray-600 resize-none text-center transition-colors"
                placeholder="今日の作業内容を記録"
              />
            </div>

            <div className="space-y-4">
              <label className="block text-center text-white text-xs md:text-sm font-bold opacity-90">
                気づいたこと
              </label>
              <textarea
                name="whatINoticed"
                value={whatINoticed}
                onChange={(e) => setWhatINoticed(e.target.value)}
                autoComplete="off"
                className="w-full h-32 px-4 py-8 bg-black/20 border border-white/5 rounded text-gray-400 text-xs md:text-sm focus:outline-none focus:border-blue-500/30 placeholder-gray-600 resize-none text-center transition-colors"
                placeholder="気づきや改善点を記録"
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="w-full max-w-md">
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          </div>
        )}

        {/* Action: Summarize */}
        {!candidates.length && (
          <button
            onClick={handleSummarize}
            disabled={isLoading || !whatIDid.trim() || !whatINoticed.trim()}
            className="w-64 h-12 bg-white/5 hover:bg-white/10 text-white font-bold text-sm rounded border border-white/10 transition-all disabled:opacity-50"
          >
            {isLoading ? '要約案を生成中...' : 'AIに2つの要約案を作ってもらう'}
          </button>
        )}

        {/* AI Candidates A/B */}
        {candidates.length > 0 && (
          <div className="w-full flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {candidates.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleSelectCandidate(c.id, c.text)}
                  className={`p-6 rounded-lg border transition-all text-left space-y-3 ${selectedCandidateId === c.id
                      ? 'bg-blue-600/20 border-blue-500/50'
                      : 'bg-white/5 border-white/5 hover:border-white/20'
                    }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-400">要約案 {c.id}</span>
                    {selectedCandidateId === c.id && <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa]" />}
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed line-clamp-4">{c.text}</p>
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <label className="block text-center text-white text-xs font-bold opacity-70">
                選んだ要約を微調整（任意）
              </label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full h-40 px-6 py-6 bg-[#111111] border border-blue-500/30 rounded text-white text-sm focus:outline-none focus:border-blue-500 placeholder-gray-600 resize-none leading-relaxed"
                placeholder="AIの要約を微調整してください"
              />
            </div>
          </div>
        )}

        {/* Finish Button */}
        <div className="w-44 pb-12">
          <button
            type="button"
            onClick={handleLogAndExit}
            className="w-full h-12 bg-[#3b82f6] hover:bg-blue-500 text-white font-bold text-sm rounded transition-all shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:shadow-[0_0_40px_rgba(59,130,246,0.6)]"
          >
            Finish
          </button>
        </div>
      </div>
    </div>
  )
}
