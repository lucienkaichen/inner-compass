'use client'

import { EntryCard } from './EntryCard'

// Type definitions (match EntryCard)
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
                {entries.map((entry) => (
                    <EntryCard key={entry.id} entry={entry} />
                ))}
            </div>
        </div>
    )
}
