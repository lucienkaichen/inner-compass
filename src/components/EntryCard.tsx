
'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { BrainCircuit, Lightbulb, Link, Tag, Edit2, Save, X, RefreshCw } from 'lucide-react'
import clsx from 'clsx'

// Type definitions (Reuse from before but simplified for props)
type Analysis = {
    summary: string | null
    patterns: string | null
    emotionTags: string | null
    connections: string | null
    customInsights: string | null
}

type Entry = {
    id: number
    content: string
    mood: string | null
    tags: string | null
    createdAt: string | Date // ISO string from server
    analysis?: Analysis | null
}

export function EntryCard({ entry }: { entry: Entry }) {
    const [isEditing, setIsEditing] = useState(false)
    const [content, setContent] = useState(entry.content)
    const [mood, setMood] = useState(entry.mood)

    // AI Fields (Editable)
    const [summary, setSummary] = useState(entry.analysis?.summary || '')
    const [isSaving, setIsSaving] = useState(false)

    // Derived states for display
    const userTags = entry.tags ? JSON.parse(entry.tags as string) : []
    const date = new Date(entry.createdAt)
    let distortions: string[] = []
    let aiTags: string[] = []
    let customInsights: Record<string, string> = {}

    if (entry.analysis) {
        try { distortions = JSON.parse(entry.analysis.patterns || '[]') } catch { }
        try { aiTags = JSON.parse(entry.analysis.emotionTags || '[]') } catch { }
        try { customInsights = JSON.parse(entry.analysis.customInsights || '{}') } catch { }
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            // Optimistic update logic could go here, but let's just wait for API
            const res = await fetch(`/api/entries/${entry.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content,
                    mood,
                    analysis: {
                        summary, // Only allow editing summary for now to keep UI simple
                        // We could add more fields later
                    }
                })
            })

            if (res.ok) {
                // In a real app we'd mutate the list, here we just exit edit mode
                // Ideally trigger a refresh
                window.location.reload() // Simple refresh to fetch updated data
            }
        } catch (e) {
            console.error(e)
        } finally {
            setIsSaving(false)
        }
    }

    if (isEditing) {
        return (
            <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-indigo-100 ring-4 ring-indigo-50 transition-all">
                <div className="flex justify-between mb-4">
                    <span className="text-xs font-bold text-indigo-400 uppercase">編輯模式</span>
                    <div className="flex gap-2">
                        <button onClick={() => setIsEditing(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100">
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Edit Content */}
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full h-32 p-3 mb-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-200 outline-none text-slate-700 text-sm"
                    placeholder="日記內容..."
                />

                {/* Edit Mood */}
                <select
                    value={mood || ''}
                    onChange={(e) => setMood(e.target.value)}
                    className="w-full p-2 mb-4 border border-slate-200 rounded-lg text-sm bg-white"
                >
                    <option value="">選擇心情...</option>
                    {['快樂', '悲傷', '焦慮', '生氣', '平靜'].map(m => (
                        <option key={m} value={m}>{m}</option>
                    ))}
                </select>

                {/* Edit AI Summary */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <label className="text-xs font-bold text-indigo-600 mb-1 block">AI 洞察 (修正)</label>
                    <textarea
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        className="w-full h-20 bg-transparent border-none outline-none text-xs text-slate-600 resize-none"
                    />
                </div>

                <div className="mt-4 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-indigo-700 disabled:opacity-50 transition"
                    >
                        {isSaving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                        儲存修改
                    </button>
                </div>
            </div>
        )
    }

    // View Mode
    return (
        <div className="group relative flex flex-col bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300">
            {/* Edit Trigger (Hidden by default, shown on hover) */}
            <button
                onClick={() => setIsEditing(true)}
                className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm text-slate-400 hover:text-indigo-600 rounded-full opacity-0 group-hover:opacity-100 transition-all border border-transparent hover:border-indigo-100 hover:shadow-sm z-10"
                title="編輯此篇"
            >
                <Edit2 size={14} />
            </button>

            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {format(date, 'MMM d, yyyy')}
                </span>
                {mood && (
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full capitalize">
                        {mood}
                    </span>
                )}
            </div>

            {/* Content */}
            <p className="text-slate-700 leading-relaxed mb-6 font-medium whitespace-pre-wrap pr-6">
                {content}
            </p>

            {/* User Tags */}
            {userTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {userTags.map((tag: string) => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md">
                            #{tag}
                        </span>
                    ))}
                </div>
            )}

            {/* AI Analysis Section */}
            {entry.analysis ? (
                <div className="mt-auto pt-4 border-t border-slate-100 bg-slate-50/30 -mx-6 px-6 pb-2 rounded-b-2xl space-y-4">

                    {/* Summary */}
                    <div className="text-sm text-slate-600 leading-relaxed pt-2">
                        <div className="flex items-center gap-2 mb-2 text-indigo-600 font-bold text-xs uppercase tracking-wide">
                            <BrainCircuit size={14} /> AI 深度洞察
                        </div>
                        {summary}
                    </div>

                    {/* AI Tags & Distortions */}
                    {(aiTags.length > 0 || distortions.length > 0) && (
                        <div className="flex flex-wrap gap-2">
                            {aiTags.map((t: string) => (
                                <span key={t} className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                                    <Tag size={10} /> {t}
                                </span>
                            ))}
                            {distortions.map((d: string) => (
                                <span key={d} className="inline-flex items-center gap-1 text-[10px] font-medium text-rose-600 bg-rose-50 px-2 py-1 rounded-full border border-rose-100">
                                    <Lightbulb size={10} /> {d}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Custom Insights */}
                    {Object.keys(customInsights).length > 0 && (
                        <div className="space-y-2">
                            {Object.entries(customInsights).map(([key, value]) => (
                                <div key={key} className="bg-white p-3 rounded-xl border border-slate-100 text-xs shadow-sm">
                                    <span className="block font-bold text-slate-700 mb-1">{key}</span>
                                    <span className="text-slate-500">{value as string}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Connections */}
                    {entry.analysis.connections && (
                        <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-50 text-xs text-blue-700 flex gap-2 items-start">
                            <Link size={14} className="mt-0.5 shrink-0" />
                            <span>{entry.analysis.connections}</span>
                        </div>
                    )}

                </div>
            ) : (
                <div className="mt-auto pt-4 text-center">
                    <p className="text-xs text-slate-400 italic">正在建構情緒脈絡...</p>
                </div>
            )}
        </div>
    )
}
