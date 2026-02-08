
'use client'

import { format } from 'date-fns'
import { MoreHorizontal } from 'lucide-react'

type Entry = {
    id: number
    content: string
    mood: string | null
    tags: string | null
    createdAt: string | Date
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
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {entries.map((entry) => {
                const tags = entry.tags ? JSON.parse(entry.tags as string) : []
                const date = new Date(entry.createdAt)

                return (
                    <div key={entry.id} className="group relative bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
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

                        <p className="text-slate-700 line-clamp-4 leading-relaxed mb-6 font-medium">
                            {entry.content}
                        </p>

                        <div className="flex flex-wrap gap-2 mt-auto">
                            {tags.map((tag: string) => (
                                <span key={tag} className="text-xs px-2 py-1 bg-slate-100/80 text-slate-500 rounded-md">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
