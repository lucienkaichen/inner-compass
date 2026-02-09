
'use client'

import { useState } from 'react'
import { BookOpen, Edit2, Save, X } from 'lucide-react'

export function EmotionGuideEditor({ tag, initialStrategy }: { tag: string, initialStrategy: string | null }) {
    const [isEditing, setIsEditing] = useState(false)
    const [strategy, setStrategy] = useState(initialStrategy || '')
    const [isSaving, setIsSaving] = useState(false)

    const handleSave = async () => {
        setIsSaving(true)
        try {
            await fetch(`/api/emotions/${encodeURIComponent(tag)}/guide`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ strategy })
            })
            setIsEditing(false)
        } catch (e) {
            console.error(e)
            alert('儲存失敗')
        } finally {
            setIsSaving(false)
        }
    }

    if (isEditing) {
        return (
            <div className="bg-white p-6 border-2 border-stone-800 shadow-lg rounded-sm relative group animate-in fade-in zoom-in-95 duration-200">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-stone-800">
                    <Edit2 size={18} />
                    編輯手冊
                </h3>
                <textarea
                    value={strategy}
                    onChange={(e) => setStrategy(e.target.value)}
                    className="w-full h-48 p-3 border border-stone-200 rounded-sm outline-none focus:border-stone-400 font-serif text-stone-700 leading-relaxed resize-none mb-4"
                    placeholder="寫下當你感到這個情緒時，你可以做些什麼..."
                />
                <div className="flex gap-2 justify-end">
                    <button
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-stone-400 hover:text-stone-600"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-6 py-2 bg-stone-800 text-stone-50 text-xs font-bold uppercase tracking-widest hover:bg-stone-700 flex items-center gap-2"
                    >
                        {isSaving ? '儲存中...' : '儲存'}
                        <Save size={14} />
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white p-6 border border-stone-200 shadow-sm rounded-sm relative group hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <BookOpen size={64} />
            </div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-stone-800">
                <span className="w-1 h-6 bg-stone-800 block"></span>
                應對手冊
            </h3>
            <div className="prose prose-stone prose-sm font-serif leading-relaxed text-stone-600 min-h-[100px]">
                {strategy ? (
                    <p className="whitespace-pre-wrap">{strategy}</p>
                ) : (
                    <p className="italic text-stone-400">尚未建立此情緒的應對策略。</p>
                )}
            </div>
            <button
                onClick={() => setIsEditing(true)}
                className="mt-6 w-full py-2 border border-stone-300 text-stone-500 hover:bg-stone-50 hover:text-stone-800 transition-colors text-xs uppercase tracking-widest font-bold"
            >
                編輯手冊
            </button>
        </div>
    )
}
