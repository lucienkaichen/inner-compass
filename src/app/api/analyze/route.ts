
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Google AI with fallback to avoid build errors
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
const model = genAI.getGenerativeModel({ model: "gemini-pro" })

export async function POST(request: Request) {
    try {
        const { entryId } = await request.json()

        if (!entryId) {
            return NextResponse.json({ error: 'Entry ID is required' }, { status: 400 })
        }

        // 1. Fetch the entry
        const entry = await prisma.entry.findUnique({
            where: { id: entryId },
        })

        if (!entry) {
            return NextResponse.json({ error: 'Journal entry not found' }, { status: 404 })
        }

        // 2. Prepare prompt for AI
        const prompt = `
      You are an expert Cognitive Behavioral Therapist (CBT) and emotional analyst.
      Analyze the following journal entry written by a user in Traditional Chinese.
      
      Content: "${entry.content}"
      Mood: ${entry.mood || 'Unknown'}
      Tags: ${entry.tags || 'None'}

      Your task is to identify emotional patterns and suggest C-B-T strategies.
      
      Output strictly in JSON format without markdown code blocks.
      Ensure all text fields (summary, title, content) are in Traditional Chinese (繁體中文).

      JSON schema:
      {
        "moodScore": number (1-10, 10 is most intense),
        "summary": "string (Empathetic summary in Traditional Chinese)",
        "patterns": ["string (List of cognitive distortions e.g. '災難化思考', '全有全無', in Traditional Chinese)"],
        "strategy": {
          "title": "string (Strategy Name e.g. '漸進式放鬆', in Traditional Chinese)",
          "content": "string (Actionable step-by-step guide in Traditional Chinese)",
          "category": "string (e.g. 'CBT', 'Mindfulness', 'Action')",
          "trigger": "string (When to use this strategy)"
        }
      }
    `

        // 3. Generate analysis
        const result = await model.generateContent(prompt)
        const response = await result.response
        let text = response.text()

        // Clean up JSON string (remove markdown code blocks if present)
        text = text.replace(/```json/g, '').replace(/```/g, '').trim()

        let analysisData
        try {
            analysisData = JSON.parse(text)
        } catch (e) {
            console.error("Failed to parse AI response:", text)
            return NextResponse.json({ error: 'AI response was not valid JSON' }, { status: 500 })
        }

        // 4. Save Analysis to DB
        const analysis = await prisma.analysis.create({
            data: {
                entryId: entry.id,
                moodScore: analysisData.moodScore,
                summary: analysisData.summary,
                patterns: JSON.stringify(analysisData.patterns || []),
            },
        })

        // 5. Save Strategy to DB
        const strategy = await prisma.strategy.create({
            data: {
                title: analysisData.strategy.title,
                content: analysisData.strategy.content,
                category: analysisData.strategy.category,
                trigger: analysisData.strategy.trigger,
                isAiGenerated: true,
            },
        })

        return NextResponse.json({ success: true, analysis, strategy })

    } catch (error: any) {
        console.error("AI Analysis Error:", error)
        return NextResponse.json({ error: error.message || 'Failed to analyze entry' }, { status: 500 })
    }
}
