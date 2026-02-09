
'use client'

import { useState } from 'react'
import { Edit2, Save, Sparkles } from 'lucide-react'

export function EmotionStrategyCard({ emotion, initialStrategy }: { emotion: string, initialStrategy: string | null }) {
    const [isEditing, setIsEditing] = useState(false)
    const [strategy, setStrategy] = useState(initialStrategy || '')
    const [isGenerating, setIsGenerating] = useState(false)

    const handleSave = async () => {
        try {
            await fetch(`/api/emotions/${encodeURIComponent(emotion)}/guide`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ strategy })
            })
            setIsEditing(false)
        } catch (error) {
            console.error(error)
        }
    }

    const simpleAiGenerate = () => {
        setIsGenerating(true)
        // Simple mock generation (Replace with actual AI call if needed later)
        setTimeout(() => {
            const mockStrategies: Record<string, string> = {
                "焦慮": "### 焦慮應對策略\n1. **深呼吸**：4-7-8 呼吸法。\n2. **著地練習**：找出 5 個看得到的東西。\n3. **接納**：告訴自己「這只是暫時的」。",
                "生氣": "### 憤怒管理的 3 步驟\n1. **暫停**：離開現場 10 分鐘。\n2. **書寫**：把憤怒的原因寫下來。\n3. **轉念**：這件事 5 年後還重要嗎？",
                "悲傷": "### 擁抱悲傷\n1. **哭泣**：釋放壓力荷爾蒙。\n2. **連結**：找信任的朋友聊聊。\n3. **自我照顧**：洗個熱水澡，喝杯熱茶。",
                "快樂": "### 延續快樂\n1. **記錄**：寫下這份快樂的原因。\n2. **分享**：把這份喜悅傳遞給別人。\n3. **感恩**：感謝帶來這份快樂的人事物。",
                "平靜": "### 維持平靜\n1. **正念**：享受當下的寧靜。\n2. **閱讀**：看一本好書。\n3. **散步**：去公園走走。"
            }
            setStrategy(mockStrategies[emotion] || "### 通用情緒策略\n請嘗試深呼吸，並記錄當下的感受。")
            setIsGenerating(false)
            setIsEditing(true) // Open editor so user can modify
        }, 1500)
    }

    if (isEditing) {
        return (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-100">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-indigo-700">{emotion} 專屬應對手冊</h2>
                    <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hovering:bg-indigo-700 transition">
                        <Save size={16} /> 儲存變更
                    </button>
                </div>
                <textarea
                    value={strategy}
                    onChange={(e) => setStrategy(e.target.value)}
                    className="w-full h-64 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none resize-none leading-relaxed text-slate-700"
                    placeholder="在這裡寫下對你有用的應對方法..."
                />
            </div>
        )
    }

    return (
        <div className="bg-gradient-to-br from-indigo-50 to-white p-8 rounded-3xl shadow-sm border border-indigo-100 relative group">
            <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={simpleAiGenerate}
                    disabled={isGenerating}
                    className="p-2 bg-white text-indigo-600 rounded-full shadow-sm hover:bg-indigo-50 border border-indigo-100 tooltip"
                    title="AI 生成策略"
                >
                    <Sparkles size={18} className={isGenerating ? "animate-spin" : ""} />
                </button>
                <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 bg-white text-slate-600 rounded-full shadow-sm hover:bg-slate-50 border border-slate-200 tooltip"
                    title="編輯"
                >
                    <Edit2 size={18} />
                </button>
            </div>

            <h2 className="text-2xl font-bold text-indigo-900 mb-6 flex items-center gap-3">
                📚 關於「{emotion}」的應對智慧
            </h2>

            {strategy ? (
                <div className="prose prose-indigo prose-sm sm:prose-base max-w-none text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {strategy}
                </div>
            ) : (
                <div className="text-center py-10 text-slate-400 border-2 border-dashed border-indigo-100 rounded-xl bg-white/50">
                    <p className="mb-4">還沒有建立專屬策略。</p>
                    <button onClick={simpleAiGenerate} className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-100 text-indigo-700 rounded-full font-bold hover:bg-indigo-200 transition">
                        <Sparkles size={16} /> 讓 AI 幫你起個頭
                    </button>
                </div>
            )}
        </div>
    )
}
