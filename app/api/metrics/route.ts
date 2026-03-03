import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function GET() {
    try {
        const logFile = path.join(process.cwd(), 'data', 'logs.json')

        let logs = []
        try {
            const content = await fs.readFile(logFile, 'utf8')
            logs = JSON.parse(content)
        } catch {
            // No logs yet
            return NextResponse.json({
                totalSessions: 0,
                editRate: 0,
                templateDistribution: { A: 0, B: 0 },
                recentLogs: []
            })
        }

        const totalSessions = logs.length
        if (totalSessions === 0) {
            return NextResponse.json({
                totalSessions: 0,
                editRate: 0,
                templateDistribution: { A: 0, B: 0 },
                recentLogs: []
            })
        }

        const totalEdits = logs.filter((log: any) => log.isEdited).length
        const editRate = Math.round((totalEdits / totalSessions) * 100)

        const templateA = logs.filter((log: any) => log.templateId === 'A').length
        const templateB = logs.filter((log: any) => log.templateId === 'B').length

        // Calculate avg session duration if start/end times exist
        let totalDurationMs = 0
        let durationCount = 0
        logs.forEach((log: any) => {
            if (log.sessionId) { // sessionId is startAt in our implementation
                const start = new Date(log.sessionId).getTime()
                const end = new Date(log.timestamp).getTime() // log timestamp is when they finished
                if (!isNaN(start) && !isNaN(end)) {
                    totalDurationMs += (end - start)
                    durationCount++
                }
            }
        })
        const avgDurationMin = durationCount > 0 ? Math.round((totalDurationMs / durationCount) / (1000 * 60)) : 0

        return NextResponse.json({
            totalSessions,
            editRate,
            avgDurationMin,
            templateDistribution: { A: templateA, B: templateB },
            recentLogs: logs.slice(-5).reverse() // Last 5 logs
        })
    } catch (error) {
        console.error('Error in metrics API:', error)
        return NextResponse.json(
            { error: 'Failed to fetch metrics' },
            { status: 500 }
        )
    }
}
