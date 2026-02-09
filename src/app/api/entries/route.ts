
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

// GET: Fetch recent entries
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    try {
        const entries = await prisma.entry.findMany({
            orderBy: { createdAt: 'desc' },
            take: limit,
            select: {
                id: true,
                content: true,
                mood: true,
                createdAt: true,
                analysis: {
                    select: {
                        aiReply: true,
                        emotionTags: true
                    }
                }
            }
        })
        return NextResponse.json(entries)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 })
    }
}

// POST: Create new entry
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { content, date } = body

        if (!content) {
            return NextResponse.json({ error: '內容不能為空' }, { status: 400 })
        }

        // Parse date or default to now
        const entryDate = date ? new Date(date) : new Date()

        // 1. Fetch Context
        const recentHistory = await prisma.entry.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: { content: true, mood: true }
        })
        const contextStr = recentHistory.map(e => `[${e.mood}] ${e.content}`).join('\n');

        // 2. AI Analysis Prompt
        const prompt = `
        角色：你是一個極具同理心、溫暖的心理諮詢師 Inner Compass。
        任務：分析日記，提供情緒標籤、工具建議、與暖心回應。

        使用者的日記：
        "${content}"

        Context:
        ${contextStr}

        請輸出純 JSON：
        {
            "summary": "一句話摘要",
            "emotionTags": ["情緒1", "情緒2"], 
            "aiReply": "給使用者一段溫暖、接納的回應。大約 50-100 字。請針對內容給予具體的回饋，不要只是泛泛而談。",
            "connections": "關聯性 (可空)",
            "patterns": [], 
            "toolSuggestions": []
        }
        `

        interface Tool {
            title: string;
            content: string;
            category?: string;
        }

        interface AnalysisResponse {
            summary: string;
            emotionTags: string[];
            aiReply: string;
            connections: string;
            patterns: string[];
            toolSuggestions: Tool[];
        }

        let analysisData: AnalysisResponse = {
            summary: "紀錄已保存。",
            emotionTags: ["紀錄"],
            aiReply: "我聽見你了。雖然我現在有點累(AI連線問題)，但我已經把你的心情妥善保存下來了。",
            connections: "",
            patterns: [],
            toolSuggestions: []
        };

        try {
            const result = await model.generateContent(prompt);
            const responseText = result.response.text();
            // Try to find JSON block
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                analysisData = JSON.parse(jsonMatch[0]) as AnalysisResponse;
            }
        } catch (e) {
            console.error("AI Generation Failed:", e);
            // Fallback is already set
        }

        // 3. Save to DB (Transactional)
        const newEntry = await prisma.$transaction(async (tx) => {
            // A. Entry
            const entry = await tx.entry.create({
                data: {
                    content,
                    createdAt: entryDate, // Use the selected date
                    mood: analysisData.emotionTags?.[0] || '紀錄',
                    tags: JSON.stringify(analysisData.emotionTags || []),
                }
            });

            // B. Analysis
            await tx.analysis.create({
                data: {
                    entryId: entry.id,
                    summary: analysisData.summary || '',
                    aiReply: analysisData.aiReply || '（未產生回應）',
                    emotionTags: JSON.stringify(analysisData.emotionTags || []),
                    patterns: JSON.stringify(analysisData.patterns || []),
                    connections: analysisData.connections || '',
                }
            });

            // C. Tools
            if (analysisData.toolSuggestions && Array.isArray(analysisData.toolSuggestions) && analysisData.toolSuggestions.length > 0) {
                for (const tool of analysisData.toolSuggestions) {
                    // Simple validation
                    if (tool.title && tool.content) {
                        await tx.tool.create({
                            data: {
                                title: tool.title,
                                content: tool.content,
                                category: tool.category || 'General',
                                isAiGenerated: true,
                                sourceEntryId: entry.id,
                                tags: JSON.stringify(analysisData.emotionTags || [])
                            }
                        });
                    }
                }
            }

            return entry;
        });

        // 4. Return result
        const finalEntry = await prisma.entry.findUnique({
            where: { id: newEntry.id },
            include: { analysis: true }
        });

        return NextResponse.json(finalEntry);

    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: '伺服器發生錯誤，請稍後再試。' }, { status: 500 });
    }
}
