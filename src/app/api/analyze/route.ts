
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const maxDuration = 60;

export async function POST(request: Request) {
    try {
        const { entryId } = await request.json()
        const apiKey = process.env.GEMINI_API_KEY

        // 1. Fetch entry
        const entry = await prisma.entry.findUnique({
            where: { id: parseInt(entryId) },
        })

        if (!entry) return NextResponse.json({ error: 'Entry not found' }, { status: 404 })

        // 2. Prepare Prompt
        const promptText = `
      You are a CBT Therapist. Analyze this entry:
      Content: "${entry.content}"
      Mood: ${entry.mood}
      
      Output strictly JSON:
      {
        "moodScore": 5,
        "summary": "Summary in Traditional Chinese",
        "patterns": ["Pattern 1 in TC", "Pattern 2"],
        "strategy": {
          "title": "Strategy Title in TC",
          "content": "Step by step in TC",
          "category": "CBT",
          "trigger": "Trigger condition"
        }
      }
    `;

        // 3. Try multiple AI models (v1 stable API)
        const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
        let aiResponseText = null;

        if (apiKey) {
            for (const model of models) {
                try {
                    console.log(`Trying model: ${model}...`);
                    const response = await fetch(
                        `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`,
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
                        }
                    );

                    if (response.ok) {
                        const data = await response.json();
                        aiResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
                        if (aiResponseText) break; // Success!
                    } else {
                        const errText = await response.text();
                        console.error(`Model ${model} failed:`, errText);
                    }
                } catch (e) {
                    console.error(`Model ${model} network error:`, e);
                }
            }
        } else {
            console.warn("No API Key found, skipping AI models.");
        }

        // 4. Fallback to Local Rule-Based Analysis if AI fully failed
        // (This guarantees a response even if Google is down or Key is invalid)
        let analysisData;

        if (aiResponseText) {
            try {
                const jsonString = aiResponseText.replace(/```json/g, '').replace(/```/g, '').trim();
                analysisData = JSON.parse(jsonString);
            } catch (e) {
                console.error("Failed to parse AI JSON, falling back to local.");
            }
        }

        if (!analysisData) {
            console.log("⚠️ Using Local Fallback Analysis");
            // Local Mock Logic
            const mood = entry.mood || '平靜';

            // Dynamic Strategy depending on mood
            let strategy = { title: "正念呼吸", content: "深呼吸五次，專注當下。", category: "Mindfulness", trigger: "日常" };
            if (mood === '生氣') strategy = { title: "冷靜倒數", content: "從 100 倒數到 0，每次減 7。", category: "CBT", trigger: "憤怒時" };
            if (mood === '悲傷') strategy = { title: "自我慈悲書寫", content: "寫下一句安慰自己的話，像是對待好朋友一樣。", category: "Journaling", trigger: "低落時" };
            if (mood === '焦慮') strategy = { title: "著地練習 (Grounding)", content: "找出 5 件看得到的、4 件摸得到的、3 件聽得到的東西。", category: "CBT", trigger: "恐慌時" };

            analysisData = {
                moodScore: mood === '快樂' ? 8 : mood === '悲傷' ? 3 : mood === '焦慮' ? 4 : mood === '生氣' ? 2 : 6,
                summary: `雖然我無法連線到 AI 大腦，但我能感受到你現在${mood}的情緒。請記住，所有情緒都是暫時的，接納它是變好的第一步。`,
                patterns: ["暫時性情緒", "需要自我關懷"],
                strategy: strategy
            };
        }

        // 5. Save/Update Analysis to DB (Use upsert to avoid unique constraint error)
        const analysis = await prisma.analysis.upsert({
            where: { entryId: entry.id },
            update: {
                summary: analysisData.summary,
                patterns: JSON.stringify(analysisData.patterns || []),
            },
            create: {
                entryId: entry.id,
                summary: analysisData.summary,
                patterns: JSON.stringify(analysisData.patterns || []),
            },
        });

        const strategy = await prisma.strategy.create({
            data: {
                title: analysisData.strategy.title,
                content: analysisData.strategy.content,
                category: analysisData.strategy.category,
                trigger: analysisData.strategy.trigger,
                isAiGenerated: !!aiResponseText, // Mark as false if local fallback
            },
        })

        return NextResponse.json({ success: true, analysis, strategy })

    } catch (error: any) {
        console.error("Critical Error:", error)
        return NextResponse.json({ error: error.message || 'Server Error' }, { status: 500 })
    }
}
