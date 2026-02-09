
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const maxDuration = 60; // Extended timeout for deep analysis

export async function GET() {
    try {
        const entries = await prisma.entry.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                analysis: true,
            },
        })
        return NextResponse.json(entries)
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching entries' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { content, mood, tags } = body

        if (!content) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 })
        }

        // 1. Create the new entry FIRST
        const entry = await prisma.entry.create({
            data: {
                content,
                mood,
                tags: JSON.stringify(tags || []),
            },
        })

        // 2. Fetch extended context (Last 20 entries)
        const history = await prisma.entry.findMany({
            where: { id: { not: entry.id } },
            orderBy: { createdAt: 'desc' },
            take: 20,
            select: { content: true, mood: true, createdAt: true, tags: true }
        });

        const historyText = history.map(h =>
            `[${h.createdAt.toISOString().split('T')[0]}] Mood:${h.mood} Content:${h.content.substring(0, 100)}...`
        ).join('\n');

        // 3. Prepare Advanced AI Prompt
        const promptText = `
          You are an advanced Emotional Intelligence System.
          
          User's Recent History (20 Entries):
          ${historyText}

          Current Entry:
          Content: "${entry.content}"
          Mood: ${mood}
          
          Task:
          1. Analyze the current entry DEEPLY.
          2. Connect it to the user's history. Is this a recurring theme? A breakthrough? A regression?
          3. Identify specific "Emotion Tags" (e.g., #Anxiety, #Grief, #Hope).
          4. Provide custom qualitative insights based on the content (e.g., "Sleep Quality", "Work-Life Balance", "Communication Style").
          
          Output strictly JSON in Traditional Chinese (繁體中文):
          {
            "summary": "A warm, empathetic summary connecting current feelings to past context.",
            "emotionTags": ["Tag1", "Tag2"], 
            "connections": "Explicitly mention links to past entries (e.g., 'This reminds me of your entry on Jan 12 about...'). If no connection, leave empty.",
            "distortions": ["Distortion 1", "Distortion 2"], 
            "customInsights": {
               "Insight Topic 1": "Analysis content...",
               "Insight Topic 2": "Analysis content..."
            },
            "strategy": {
              "title": "Actionable Strategy Title",
              "content": "Step-by-step guide tailored to this specific situation.",
              "category": "CBT/Mindfulness/Journaling",
              "trigger": "When to use this"
            }
          }
        `;

        // 4. Call AI (Hardcoded Key + Verified Model)
        const apiKey = "AIzaSyBEmipKpuVJVf1RvTVCWGC7oPPr18I-FoM";
        const models = ['gemini-flash-latest', 'gemini-1.5-flash', 'gemini-pro'];
        let aiResponseText = null;

        if (apiKey) {
            for (const model of models) {
                try {
                    console.log(`Trying model: ${model}...`);
                    const response = await fetch(
                        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
                        }
                    );

                    if (response.ok) {
                        const data = await response.json();
                        aiResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
                        if (aiResponseText) break;
                    } else {
                        const err = await response.text();
                        console.error(`Model ${model} failed:`, err);
                    }
                } catch (e) {
                    console.error(`Model ${model} error:`, e);
                }
            }
        }

        // 5. Parse AI Response
        let analysisData;
        if (aiResponseText) {
            try {
                const jsonString = aiResponseText.replace(/```json/g, '').replace(/```/g, '').trim();
                analysisData = JSON.parse(jsonString);
            } catch (e) {
                console.error("Failed to parse AI JSON");
            }
        }

        // Mock Fallback (Updated for new schema)
        if (!analysisData) {
            console.log("⚠️ Using Local Fallback Analysis");
            const m = mood || '平靜';
            analysisData = {
                summary: `雖然暫時無法連線到 AI 大腦，但我能感受到你現在${m}的情緒。這是一個正常的反應，請接納當下的自己。`,
                emotionTags: ["暫時性情緒", "自我覺察"],
                connections: "暫無歷史連結 (離線模式)",
                distortions: [],
                customInsights: {
                    "暫時分析": "由於網路連線問題，目前僅提供基礎情緒標記。"
                },
                strategy: {
                    title: "深呼吸練習",
                    content: "閉上眼，深呼吸 5 次，專注於當下的感受。",
                    category: "Mindfulness",
                    trigger: "感到需要平靜時"
                }
            };
        }

        // 6. Save Rich Analysis
        await prisma.analysis.upsert({
            where: { entryId: entry.id },
            update: {
                summary: analysisData.summary,
                patterns: JSON.stringify(analysisData.distortions || []), // Map 'distortions' to 'patterns' column
                emotionTags: JSON.stringify(analysisData.emotionTags || []),
                connections: analysisData.connections || null,
                customInsights: JSON.stringify(analysisData.customInsights || {}),
            },
            create: {
                entryId: entry.id,
                summary: analysisData.summary,
                patterns: JSON.stringify(analysisData.distortions || []),
                emotionTags: JSON.stringify(analysisData.emotionTags || []),
                connections: analysisData.connections || null,
                customInsights: JSON.stringify(analysisData.customInsights || {}),
            }
        });

        await prisma.strategy.create({
            data: {
                title: analysisData.strategy.title,
                content: analysisData.strategy.content,
                category: analysisData.strategy.category,
                trigger: analysisData.strategy.trigger,
                isAiGenerated: !!aiResponseText,
            },
        });

        // 7. Return Full Entry
        const fullEntry = await prisma.entry.findUnique({
            where: { id: entry.id },
            include: { analysis: true }
        });

        return NextResponse.json(fullEntry);

    } catch (error) {
        console.error("Entry creation failed:", error);
        return NextResponse.json({ error: 'Error creating entry' }, { status: 500 })
    }
}
