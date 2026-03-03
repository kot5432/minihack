'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import CommonLogo from '@/components/CommonLogo'

interface Metrics {
    totalSessions: number
    editRate: number
    avgDurationMin: number
    templateDistribution: { A: number; B: number }
    recentLogs: any[]
}

export default function Dashboard() {
    const [metrics, setMetrics] = useState<Metrics | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const res = await fetch('/api/metrics')
                if (res.ok) {
                    const data = await res.json()
                    setMetrics(data)
                }
            } catch (err) {
                console.error('Failed to fetch metrics:', err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchMetrics()
    }, [])

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex justify-center items-center">
                <div className="text-white font-mono animate-pulse">Loading Metrics...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white font-mono p-8 md:p-16">
            <div className="max-w-6xl mx-auto space-y-16">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-4">
                        <CommonLogo variant="reflect" />
                        <span className="text-2xl font-bold tracking-tighter text-blue-500">DASHBOARD</span>
                    </div>
                    <button
                        onClick={() => router.push('/')}
                        className="px-6 py-2 border border-white/10 rounded hover:bg-white/5 transition-colors text-sm"
                    >
                        ← Back to Home
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-[#111111] border border-white/5 p-8 rounded-lg space-y-2">
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Total Sessions</p>
                        <p className="text-4xl font-light">{metrics?.totalSessions || 0}</p>
                    </div>
                    <div className="bg-[#111111] border border-white/5 p-8 rounded-lg space-y-2 group">
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Summary Edit Rate</p>
                        <div className="flex items-baseline gap-2">
                            <p className="text-4xl font-light text-blue-400">{metrics?.editRate || 0}%</p>
                            <span className="text-xs text-gray-600">vs AI Baseline</span>
                        </div>
                        {/* Simple Progress Bar */}
                        <div className="w-full h-1 bg-white/5 mt-4 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500 shadow-[0_0_10px_#3b82f6]"
                                style={{ width: `${metrics?.editRate || 0}%` }}
                            />
                        </div>
                    </div>
                    <div className="bg-[#111111] border border-white/5 p-8 rounded-lg space-y-2">
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Avg. Session Time</p>
                        <p className="text-4xl font-light">{metrics?.avgDurationMin || 0} <span className="text-xl opacity-50">min</span></p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Template Distribution */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold tracking-wider">AI Template Performance</h3>
                        <div className="bg-[#111111] border border-white/5 p-8 rounded-lg flex flex-col justify-center gap-8 min-h-[300px]">
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Template A (Concise)</span>
                                    <span>{metrics?.templateDistribution.A || 0} selected</span>
                                </div>
                                <div className="w-full h-8 bg-black/40 rounded border border-white/5 overflow-hidden flex">
                                    <div
                                        className="h-full bg-blue-600/40 border-r border-blue-500/50"
                                        style={{
                                            width: `${metrics && (metrics.templateDistribution.A + metrics.templateDistribution.B) > 0
                                                ? (metrics.templateDistribution.A / (metrics.templateDistribution.A + metrics.templateDistribution.B)) * 100
                                                : 0}%`
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Template B (Reflective)</span>
                                    <span>{metrics?.templateDistribution.B || 0} selected</span>
                                </div>
                                <div className="w-full h-8 bg-black/40 rounded border border-white/5 overflow-hidden">
                                    <div
                                        className="h-full bg-purple-600/40 border-r border-purple-500/50"
                                        style={{
                                            width: `${metrics && (metrics.templateDistribution.A + metrics.templateDistribution.B) > 0
                                                ? (metrics.templateDistribution.B / (metrics.templateDistribution.A + metrics.templateDistribution.B)) * 100
                                                : 0}%`
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Logs */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold tracking-wider">Recent Activity</h3>
                        <div className="bg-[#111111] border border-white/5 rounded-lg overflow-hidden">
                            <div className="divide-y divide-white/5">
                                {metrics?.recentLogs && metrics.recentLogs.length > 0 ? (
                                    metrics.recentLogs.map((log, i) => (
                                        <div key={i} className="p-4 hover:bg-white/[0.02] transition-colors">
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                    <p className="text-xs text-blue-400 font-bold uppercase tracking-tighter">
                                                        Session: {new Date(log.timestamp).toLocaleTimeString()}
                                                    </p>
                                                    <p className="text-sm text-gray-300 line-clamp-1">{log.editedText}</p>
                                                </div>
                                                <div className={`text-[10px] px-2 py-0.5 rounded border ${log.isEdited
                                                        ? 'border-blue-500/30 text-blue-400 bg-blue-500/10'
                                                        : 'border-white/10 text-gray-500'
                                                    }`}>
                                                    {log.isEdited ? 'USER EDITED' : 'AI ONLY'}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-12 text-center text-gray-600 text-sm">No session data logged yet</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
