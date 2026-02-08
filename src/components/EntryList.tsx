
'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { MoreHorizontal, Sparkles, BrainCircuit, Lightbulb } from 'lucide-react'
import { useRouter } from 'next/navigation'

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
    const router = useRouter()
    const [analyzingId, setAnalyzingId] = useState<number | null>(null)

    const handleAnalyze = async (entryId: number) => {
        setAnalyzingId(entryId)
        try {
            const res = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ entryId }),
            })

            if (res.ok) {
                router.refresh()
            }
        } catch (error) {
            console.error(error)
        } finally {
            setAnalyzingId(null)
        }
    }

    if (entries.length === 0) {
        return (
            <div className="text-center py-20 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
                <p className="text-slate-500 font-medium">還沒有日記。開始寫下你的第一個想法吧！</p>
            </div>
        )
    }

    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 items-start">
            {entries.map((entry) => {
                const tags = entry.tags ? JSON.parse(entry.tags as string) : []
                const date = new Date(entry.createdAt)
                const isAnalyzing = analyzingId === entry.id

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

                        {/* AI Analysis Section */}
                        {entry.analysis ? (
                            <div className="mt-4 pt-4 border-t border-slate-100 bg-slate-50/50 -mx-6 px-6 pb-6 rounded-b-2xl">
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

                                <button
                                    onClick={() => handleAnalyze(entry.id)}
                                    disabled={isAnalyzing}
                                    className="w-full mt-2 flex items-center justify-center gap-2 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-sm font-semibold shadow-lg shadow-violet-200 hover:shadow-violet-300 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isAnalyzing ? (
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <Sparkles size={16} />
                                    )}
                                    {isAnalyzing ? '分析中...' : 'AI 深度分析'}
                                </button>
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
