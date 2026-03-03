import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
    try {
        const data = await request.json()
        const logEntry = {
            ...data,
            timestamp: new Date().toISOString()
        }

        // Path to logs file
        const logDir = path.join(process.cwd(), 'data')
        const logFile = path.join(logDir, 'logs.json')

        // Ensure directory exists
        try {
            await fs.access(logDir)
        } catch {
            await fs.mkdir(logDir, { recursive: true })
        }

        // Read existing logs or start new array
        let logs = []
        try {
            const content = await fs.readFile(logFile, 'utf8')
            logs = JSON.parse(content)
        } catch {
            // File doesn't exist yet or is empty
        }

        // Add new entry and save
        logs.push(logEntry)
        await fs.writeFile(logFile, JSON.stringify(logs, null, 2))

        console.log('--- Summary Edit Log Saved ---')
        console.log('Session ID:', data.sessionId)
        console.log('Template ID:', data.templateId)
        console.log('------------------------------')

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error in log API:', error)
        return NextResponse.json(
            { error: 'Failed to save log' },
            { status: 500 }
        )
    }
}
