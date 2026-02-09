
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" })

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
                        emotionTags: true,
                        summary: true
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

        const entryDate = date ? new Date(date) : new Date()

        // 1. Fetch User Settings (CRITICAL FIX: Actually read the persona)
        // We assume there's only one user settings record for now (ID=1)
        // If not found, use default warm persona.
        const userSettings = await prisma.userSettings.findFirst()
        const personaInstruction = userSettings?.aiPersona || "你是一個極具同理心、溫暖的心理諮詢師樹洞。回應風格：溫柔堅定，時時提醒「允許」的概念，接納所有情緒。"

        // 2. Fetch Context (Simplified to avoid distraction)
        // Only fetch the very last entry to maintain continuity, but instruct AI to prioritize CURRENT input.
        const lastEntry = await prisma.entry.findFirst({
            orderBy: { createdAt: 'desc' },
            select: { content: true, mood: true }
        })
        const contextStr = lastEntry ? `上一篇日記：[${lastEntry.mood}] ${lastEntry.content}` : "無前次日記";

        // 3. AI Analysis Prompt (Strict Focus)
        const prompt = `
        你的角色設定：
        ${personaInstruction}
        
        【當前任務】
        請全神貫注地閱讀使用者的「最新日記」，並給予回應。
        
        使用者最新日記內容：
        """
        ${content}
        """

        (參考情境 - 上一篇日記：${contextStr}) -> 僅供參考，請勿混淆，重點是「最新日記」。

        【嚴格規則】
        1. 回應 (aiReply) 必須針對「最新日記」的內容。如果使用者說 A，你就回應 A，絕對不要去回應上一篇日記的事情。
        2. emotionTags 只能包含情緒形容詞 (如：焦慮、平靜、憤怒)。嚴禁出現「紀錄、日記」等名詞。
        3. 請用「你」來稱呼使用者。
        4. 不要解釋你的分析過程，直接給予像朋友一樣的溫暖對話。

        請輸出純 JSON：
        {
            "summary": "一句話摘要",
            "emotionTags": ["情緒1", "情緒2"], 
            "aiReply": "你的回應...",
            "connections": "",
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
            emotionTags: ["平靜"], // Default fallback tag
            aiReply: "AI 連線中...",
            connections: "",
            patterns: [],
            toolSuggestions: []
        };

        try {
            const result = await model.generateContent(prompt);
            const responseText = result.response.text();
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                analysisData = JSON.parse(jsonMatch[0]) as AnalysisResponse;
            }
        } catch (e: any) {
            console.error("AI Generation Failed:", e);
            analysisData.aiReply = `AI 連線失敗: ${e.message}`;
        }

        // 4. Save to DB
        const newEntry = await prisma.$transaction(async (tx) => {
            const entry = await tx.entry.create({
                data: {
                    content,
                    createdAt: entryDate,
                    mood: analysisData.emotionTags?.[0] || '平靜',
                    tags: JSON.stringify(analysisData.emotionTags || []),
                }
            });

            await tx.analysis.create({
                data: {
                    entryId: entry.id,
                    summary: analysisData.summary || '',
                    aiReply: analysisData.aiReply || '...',
                    emotionTags: JSON.stringify(analysisData.emotionTags || []),
                    patterns: JSON.stringify(analysisData.patterns || []),
                    connections: analysisData.connections || '',
                }
            });
            // (Tools logic omitted for brevity as user focused on tags/ai)
            return entry;
        });

        const finalEntry = await prisma.entry.findUnique({
            where: { id: newEntry.id },
            include: { analysis: true }
        });

        return NextResponse.json(finalEntry);

    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: '伺服器發生錯誤' }, { status: 500 });
    }
}
