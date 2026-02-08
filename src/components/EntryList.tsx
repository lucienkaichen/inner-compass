
'use client'

import { format } from 'date-fns'
import { BrainCircuit, Lightbulb, RefreshCw } from 'lucide-react'

type Analysis = {
    summary: string | null
    moodScore: number | null
    patterns: string | null // JSON string
}

type Entry = {
    id: number
    content: string
    mood: string | null
    tags: string | null
    createdAt: string | Date
    analysis?: Analysis | null
}

export function EntryList({ entries }: { entries: Entry[] }) {
    if (entries.length === 0) {
        return (
            <div className="text-center py-20 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
                <p className="text-slate-500 font-medium">還沒有日記。開始寫下你的第一個想法吧！</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6">

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 items-start">
                {entries.map((entry) => {
                    const tags = entry.tags ? JSON.parse(entry.tags as string) : []
                    const date = new Date(entry.createdAt)

                    // Parse Analysis Data
                    let patterns: string[] = []
                    if (entry.analysis?.patterns) {
                        try {
                            patterns = JSON.parse(entry.analysis.patterns)
                        } catch (e) { }
                    }

                    return (
                        <div key={entry.id} className="group relative flex flex-col bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    {format(date, 'MMM d, yyyy')}
                                </span>
                                {entry.mood && (
                                    <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg capitalize">
                                        {entry.mood}
                                    </span>
                                )}
                            </div>

                            <p className="text-slate-700 leading-relaxed mb-6 font-medium whitespace-pre-wrap">
                                {entry.content}
                            </p>

                            {/* AI Analysis Section (Always shown if present) */}
                            {entry.analysis ? (
                                <div className="mt-4 pt-4 border-t border-slate-100 bg-slate-50/50 -mx-6 px-6 pb-6 rounded-b-2xl animate-in fade-in slide-in-from-top-2 duration-500">
                                    <div className="flex items-center gap-2 mb-3 text-indigo-600 font-bold text-sm">
                                        <BrainCircuit size={16} />
                                        <span>AI 洞察</span>
                                        <span className="ml-auto text-xs bg-indigo-100 px-2 py-0.5 rounded-full text-indigo-700">
                                            情緒指數: {entry.analysis.moodScore}/10
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600 mb-3 leading-relaxed">
                                        {entry.analysis.summary}
                                    </p>
                                    {patterns.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {patterns.map((p, i) => (
                                                <span key={i} className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded-md border border-rose-100">
                                                    <Lightbulb size={10} /> {p}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="mt-auto pt-4 flex flex-col gap-3">
                                    <div className="flex flex-wrap gap-2">
                                        {tags.map((tag: string) => (
                                            <span key={tag} className="text-xs px-2 py-1 bg-slate-100/80 text-slate-500 rounded-md">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                    {/* Analysis pending or failed silently */}
                                    <p className="text-xs text-slate-400 italic text-center mt-2">分析處理中...</p>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
