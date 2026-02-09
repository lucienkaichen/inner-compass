
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const maxDuration = 60; // Allow enough time for AI

export async function GET() {
    try {
        const entries = await prisma.entry.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                analysis: true, // Fetch analysis with entry
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

        // 2. Fetch context (Previous 5 entries) for deeper analysis
        const history = await prisma.entry.findMany({
            where: { id: { not: entry.id } },
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: { content: true, mood: true, createdAt: true }
        });

        const historyText = history.map(h =>
            `- [${h.mood || 'Unknown'}] ${h.content.substring(0, 50)}...`
        ).join('\n');

        // 3. Prepare AI Prompt with History Context
        const promptText = `
          You are a professional CBT Therapist.
          
          User's Recent History (Context):
          ${historyText}

          Current Entry (Target for Analysis):
          Content: "${entry.content}"
          Mood: ${mood}
          
          Task: Analyze the current entry in the context of their recent history. Look for patterns or recurring themes.
          
          Output strictly JSON:
          {
            "moodScore": 5,
            "summary": "Summary in Traditional Chinese, referencing past context if relevant",
            "patterns": ["Pattern 1 in TC", "Pattern 2"],
            "strategy": {
              "title": "Strategy Title in TC",
              "content": "Step by step in TC",
              "category": "CBT",
              "trigger": "Trigger condition"
            }
          }
        `;

        // 4. Call AI (Try multiple models: v1beta API)
        // Hardcoded key for debugging user's environment issue
        const apiKey = "AIzaSyBEmipKpuVJVf1RvTVCWGC7oPPr18I-FoM";

        // Use the exact model that worked in curl: gemini-flash-latest
        // Also add fallbacks just in case
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
                        console.error(`Model ${model} failed:`, await response.text());
                    }
                } catch (e) {
                    console.error(`Model ${model} error:`, e);
                }
            }
        }

        // 5. Fallback Analysis (Local Logic)
        let analysisData;
        if (aiResponseText) {
            try {
                const jsonString = aiResponseText.replace(/```json/g, '').replace(/```/g, '').trim();
                analysisData = JSON.parse(jsonString);
            } catch (e) {
                console.error("Failed to parse AI JSON");
            }
        }

        if (!analysisData) {
            console.log("Using Local Fallback Analysis for Entry");
            // Local fallback logic
            const m = mood || '平靜';
            let strategy = { title: "正念呼吸", content: "深呼吸五次，專注當下。", category: "Mindfulness", trigger: "日常" };
            if (m === '生氣') strategy = { title: "冷靜倒數", content: "從 100 倒數到 0，每次減 7。", category: "CBT", trigger: "憤怒時" };
            if (m === '悲傷') strategy = { title: "自我慈悲書寫", content: "寫下一句安慰自己的話。", category: "Journaling", trigger: "低落時" };
            if (m === '焦慮') strategy = { title: "著地練習", content: "找出 5 件看得到的東西。", category: "CBT", trigger: "恐慌時" };

            analysisData = {
                moodScore: m === '快樂' ? 8 : m === '悲傷' ? 3 : m === '焦慮' ? 4 : m === '生氣' ? 2 : 6,
                summary: `雖然我暫時無法連線到 AI 大腦，但我能感受到你現在${m}的情緒。這是一個正常的反應，請接納當下的自己。`,
                patterns: ["暫時性情緒", "需自我關懷"],
                strategy: strategy
            };
        }

        // 6. Save Analysis & Strategy (Automatically linked)
        // Use upsert to be safe, though create should work for new entry
        await prisma.analysis.upsert({
            where: { entryId: entry.id },
            update: {
                moodScore: analysisData.moodScore,
                summary: analysisData.summary,
                patterns: JSON.stringify(analysisData.patterns || []),
            },
            create: {
                entryId: entry.id,
                moodScore: analysisData.moodScore,
                summary: analysisData.summary,
                patterns: JSON.stringify(analysisData.patterns || []),
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

        // 7. Return entry with analysis included (for UI to update immediately)
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
