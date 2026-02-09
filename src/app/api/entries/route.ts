
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSy...') // Fallback for dev
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

// GET: Fetch recent entries (for Home Page feed)
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
                createdAt: true
            }
        })
        return NextResponse.json(entries)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 })
    }
}

// POST: Create new entry with Dual-Process AI Analysis
export async function POST(request: Request) {
    try {
        const { content } = await request.json()

        if (!content) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 })
        }

        // 1. Fetch User Settings (Persona) - Placeholder for now
        // const userSettings = await prisma.settings.findFirst() ...
        const personaInstruction = "請扮演一位溫暖、有智慧的朋友。回應風格：溫柔堅定，時時提醒「允許」的概念，接納所有情緒。";

        // 2. Fetch Context (Last 5 entries for continuity)
        const recentHistory = await prisma.entry.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: { content: true, mood: true }
        })
        const contextStr = recentHistory.map(e => `[${e.mood}] ${e.content}`).join('\n');

        // 3. Construct Prompt
        const prompt = `
        角色設定：${personaInstruction}
        你的名字是 Inner Compass。

        任務：閱讀以下使用者的日記，進行「雙重路徑分析」：
        1. 情緒路徑：識別情緒標籤、認知模式。
        2. 工具路徑：識別使用者是否提出了具體的解決方案、轉念或行動。
        3. 回應路徑：給予一段暖心的回應。

        使用者的日記：
        "${content}"

        前次脈絡：
        ${contextStr}

        請輸出純 JSON 格式 (不要 Markdown)：
        {
            "summary": "一句話的深度摘要",
            "emotionTags": ["情緒1", "情緒2"], 
            "aiReply": "給使用者的直接回應。請根據角色設定，給予同理、接納或讚賞。若使用者有情緒，請接納他；若有轉念，請肯定他。",
            "connections": "與過去脈絡的關聯 (若無則空字串)",
            "patterns": ["認知扭曲1", "認知扭曲2"], 
            "toolSuggestions": [ 
                // 若日記中包含了使用者自己想到的好方法、轉念、或具體行動，請提取出來。若無則空陣列 []
                {
                    "title": "方法的標題 (如：去跑步、深呼吸)",
                    "content": "方法的具體內容或轉念的邏輯",
                    "category": "Mindset | Action | Relaxation"
                }
            ]
        }
        `

        // 4. Call AI
        let analysisData;
        try {
            const result = await model.generateContent(prompt);
            const responseText = result.response.text();
            const jsonStr = responseText.replace(/```json|```/g, '').trim();
            analysisData = JSON.parse(jsonStr);
        } catch (e) {
            console.error("AI Generation Failed:", e);
            // Fallback
            analysisData = {
                summary: "紀錄已保存。",
                emotionTags: ["紀錄"],
                aiReply: "謝謝你寫下這些。系統暫時忙碌，但我已經幫你把心情妥善保存好了。",
                toolSuggestions: []
            };
        }

        // 5. Transactional Save
        const newEntry = await prisma.$transaction(async (tx) => {
            // A. Create Entry
            const entry = await tx.entry.create({
                data: {
                    content,
                    mood: analysisData.emotionTags?.[0] || '紀錄',
                    tags: JSON.stringify(analysisData.emotionTags || []),
                }
            });

            // B. Create Analysis
            await tx.analysis.create({
                data: {
                    entryId: entry.id,
                    summary: analysisData.summary,
                    aiReply: analysisData.aiReply,
                    emotionTags: JSON.stringify(analysisData.emotionTags || []),
                    patterns: JSON.stringify(analysisData.patterns || []),
                    connections: analysisData.connections || '',
                }
            });

            // C. Create Tools (if suggested)
            if (analysisData.toolSuggestions?.length > 0) {
                for (const tool of analysisData.toolSuggestions) {
                    await tx.tool.create({
                        data: {
                            title: tool.title,
                            content: tool.content,
                            category: tool.category,
                            isAiGenerated: true,
                            sourceEntryId: entry.id,
                            tags: JSON.stringify(analysisData.emotionTags || [])
                        }
                    });
                }
            }

            return entry;
        });

        // 6. Return full entry with analysis for UI
        const finalEntry = await prisma.entry.findUnique({
            where: { id: newEntry.id },
            include: { analysis: true }
        });

        return NextResponse.json(finalEntry);

    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
