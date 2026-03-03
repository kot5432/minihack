import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { theme, reflection, insights } = await request.json()

    // Check for OpenAI API key
    const apiKey = process.env.OPENAI_API_KEY
    const isMockMode = !apiKey || apiKey === 'your_openai_api_key_here'

    if (isMockMode) {
      // Return mock data for development if key is not configured
      return NextResponse.json({
        candidates: [
          {
            id: 'A',
            text: `[Mock Concise] 今日のMiniHackでは、「${theme}」をテーマに「${reflection}」に取り組み、「${insights}」という気づきを得ました。着実に前進しています。`
          },
          {
            id: 'B',
            text: `[Mock Reflective] 「${theme}」に向けた作業を通じて、${reflection}を達成しました。${insights}という発見は、今後の開発において重要なターニングポイントになりそうです。`
          }
        ]
      })
    }

    const templates = [
      {
        id: 'A',
        name: 'Concise',
        prompt: `以下のMiniHackセッションの情報を基に、簡潔で事実に基づいた要約を1〜2文で作成してください：
                 テーマ: ${theme}
                 やったこと: ${reflection}
                 気づいたこと: ${insights}
                 日本語で、箇条書きは使わず丁寧な言葉でまとめてください。`
      },
      {
        id: 'B',
        name: 'Reflective',
        prompt: `以下のMiniHackセッションの情報を基に、内省的で深みのある要約を2〜3文で作成してください。単なる事実の羅列ではなく、気づきや今後の展望を含めてください：
                 テーマ: ${theme}
                 やったこと: ${reflection}
                 気づいたこと: ${insights}
                 日本語で、前向きなトーンでまとめてください。`
      }
    ]

    const candidates = await Promise.all(
      templates.map(async (template) => {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: template.prompt }],
            max_tokens: 500,
            temperature: 0.7,
          }),
        })

        if (!response.ok) throw new Error(`OpenAI API request failed for template ${template.id}`)
        const data = await response.json()
        return {
          id: template.id,
          text: data.choices[0].message.content.trim()
        }
      })
    )

    return NextResponse.json({ candidates })
  } catch (error) {
    console.error('Error in summary API:', error)
    return NextResponse.json(
      { error: 'Failed to generate summaries' },
      { status: 500 }
    )
  }
}
