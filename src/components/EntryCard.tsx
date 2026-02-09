
'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Edit2, Trash2, Save, X, Sparkles, AlertCircle } from 'lucide-react'

type Entry = {
    id: number
    content: string
    mood: string | null
    createdAt: string | Date
    analysis?: {
        summary: string | null
        aiReply: string | null
        emotionTags: string | null
    } | null
}

export function EntryCard({ entry, onDelete }: { entry: Entry, onDelete?: () => void }) {
    const [isEditing, setIsEditing] = useState(false)
    const [content, setContent] = useState(entry.content)
    const [summary, setSummary] = useState(entry.analysis?.summary || '')
    const [isSaving, setIsSaving] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    // Derived
    const date = new Date(entry.createdAt)
    const tags = entry.analysis?.emotionTags ? JSON.parse(entry.analysis.emotionTags) : []

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const res = await fetch(`/api/entries/${entry.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content,
                    analysis: { summary }
                })
            })
            if (res.ok) {
                setIsEditing(false)
                window.location.reload() // Refresh to show updates
            }
        } catch (e) {
            console.error("Save failed", e)
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm("確定要永久刪除這篇日記嗎？")) return
        setIsDeleting(true)
        try {
            const res = await fetch(`/api/entries/${entry.id}`, {
                method: 'DELETE'
            })
            if (res.ok) {
                if (onDelete) onDelete() // Callback to refresh list
                else window.location.reload()
            }
        } catch (e) {
            console.error("Delete failed", e)
        } finally {
            setIsDeleting(false)
        }
    }

    if (isEditing) {
        return (
            <div className="bg-white p-6 rounded-sm shadow-md border border-stone-300 relative font-serif animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-stone-100">
                    <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">編輯模式</span>
                    <button onClick={() => setIsEditing(false)} className="text-stone-400 hover:text-stone-600 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full h-32 p-3 mb-4 border border-stone-200 rounded-sm focus:border-stone-400 focus:ring-1 focus:ring-stone-200 outline-none text-stone-700 text-base leading-relaxed resize-none"
                    placeholder="日記內容..."
                />

                <div className="bg-stone-50 p-3 rounded-sm border border-stone-200 mb-4">
                    <label className="text-xs font-bold text-stone-500 mb-2 block uppercase tracking-wide flex items-center gap-2">
                        <Sparkles size={12} /> AI 摘要 (可修正)
                    </label>
                    <textarea
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        className="w-full h-16 bg-transparent border-none outline-none text-sm text-stone-600 resize-none italic"
                        placeholder="AI 尚未生成摘要..."
                    />
                </div>

                <div className="flex justify-between items-center pt-2">
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="flex items-center gap-2 px-3 py-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-sm text-xs font-bold uppercase tracking-widest transition-colors"
                    >
                        <Trash2 size={14} /> 刪除
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-2 bg-stone-800 text-stone-50 hover:bg-stone-700 rounded-sm text-xs font-bold uppercase tracking-widest shadow-sm transition-all"
                    >
                        {isSaving ? '儲存中...' : '儲存變更'}
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="group relative bg-white p-6 border-b border-stone-200 hover:bg-stone-50/50 transition-colors">
            {/* Hover Actions */}
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-full transition-colors"
                    title="編輯"
                >
                    <Edit2 size={14} />
                </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 mb-3">
                <time className="text-xs font-bold text-stone-400 uppercase tracking-widest font-sans">
                    {format(date, 'yyyy.MM.dd')}
                </time>
                {entry.mood && (
                    <span className="text-xs font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full uppercase tracking-wide">
                        {entry.mood}
                    </span>
                )}
            </div>

            <p className="text-stone-800 leading-relaxed text-lg mb-4 whitespace-pre-wrap font-serif">
                {entry.content}
            </p>

            {/* AI Tags */}
            {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {tags.map((tag: string) => (
                        <span key={tag} className="text-[10px] px-2 py-1 border border-stone-200 text-stone-500 rounded-sm font-sans tracking-wide">
                            #{tag}
                        </span>
                    ))}
                </div>
            )}

            {/* AI Reply / Summary */}
            {entry.analysis?.aiReply && (
                <div className="bg-stone-50 p-4 border-l-2 border-stone-300 italic text-stone-600 text-sm font-serif leading-loose relative mt-4">
                    <span className="absolute -top-3 left-2 bg-stone-50 px-1 text-[10px] text-stone-400 uppercase tracking-widest">AI Reply</span>
                    {entry.analysis.aiReply}
                </div>
            )}
            {!entry.analysis?.aiReply && entry.analysis?.summary && (
                <div className="text-sm text-stone-400 italic border-t border-stone-100 pt-3 mt-2">
                    摘要：{entry.analysis.summary}
                </div>
            )}
        </div>
    )
}
