
'use client'

import { format } from 'date-fns'
import { BrainCircuit, Lightbulb, Link, Tag, Sparkles } from 'lucide-react'

type Analysis = {
    summary: string | null
    patterns: string | null // JSON string (Cognitive Distortions)
    emotionTags: string | null // JSON string (AI Tags)
    connections: string | null // Text
    customInsights: string | null // JSON string (Key-Value)
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

            <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 items-start">
                {entries.map((entry) => {
                    const userTags = entry.tags ? JSON.parse(entry.tags as string) : []
                    const date = new Date(entry.createdAt)

                    // Parse Analysis Data
                    let distortions: string[] = []
                    let aiTags: string[] = []
                    let customInsights: Record<string, string> = {}

                    if (entry.analysis) {
                        try { distortions = JSON.parse(entry.analysis.patterns || '[]') } catch { }
                        try { aiTags = JSON.parse(entry.analysis.emotionTags || '[]') } catch { }
                        try { customInsights = JSON.parse(entry.analysis.customInsights || '{}') } catch { }
                    }

                    return (
                        <div key={entry.id} className="group relative flex flex-col bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    {format(date, 'MMM d, yyyy')}
                                </span>
                                {entry.mood && (
                                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full capitalize">
                                        {entry.mood}
                                    </span>
                                )}
                            </div>

                            {/* Content */}
                            <p className="text-slate-700 leading-relaxed mb-6 font-medium whitespace-pre-wrap">
                                {entry.content}
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

                                    {/* 1. Summary */}
                                    <div className="text-sm text-slate-600 leading-relaxed pt-2">
                                        <div className="flex items-center gap-2 mb-2 text-indigo-600 font-bold text-xs uppercase tracking-wide">
                                            <BrainCircuit size={14} /> AI 深度洞察
                                        </div>
                                        {entry.analysis.summary}
                                    </div>

                                    {/* 2. AI Tags & Distortions */}
                                    {(aiTags.length > 0 || distortions.length > 0) && (
                                        <div className="flex flex-wrap gap-2">
                                            {aiTags.map(t => (
                                                <span key={t} className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                                                    <Tag size={10} /> {t}
                                                </span>
                                            ))}
                                            {distortions.map(d => (
                                                <span key={d} className="inline-flex items-center gap-1 text-[10px] font-medium text-rose-600 bg-rose-50 px-2 py-1 rounded-full border border-rose-100">
                                                    <Lightbulb size={10} /> {d}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* 3. Custom Insights (Key-Value) */}
                                    {Object.keys(customInsights).length > 0 && (
                                        <div className="space-y-2">
                                            {Object.entries(customInsights).map(([key, value]) => (
                                                <div key={key} className="bg-white p-3 rounded-xl border border-slate-100 text-xs shadow-sm">
                                                    <span className="block font-bold text-slate-700 mb-1">{key}</span>
                                                    <span className="text-slate-500">{value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* 4. Connections (History) */}
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
                })}
            </div>
        </div>
    )
}
