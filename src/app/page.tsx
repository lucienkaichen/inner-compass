
'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/Header'
import { DailyQuote } from '@/components/DailyQuote'
import { UniversalInput } from '@/components/UniversalInput'
import { format } from 'date-fns'

interface Entry {
    id: number
    content: string
    createdAt: string
    mood: string | null
}

export default function HomePage() {
    const [recentEntries, setRecentEntries] = useState<Entry[]>([])

    const fetchRecent = async () => {
        try {
            const res = await fetch('/api/entries?limit=3')
            if (res.ok) {
                const data = await res.json()
                setRecentEntries(data)
            }
        } catch (e) {
            console.error(e)
        }
    }

    useEffect(() => {
        fetchRecent()
    }, [])

    return (
        <div className="min-h-screen bg-stone-50 font-serif text-stone-800">
            <Header />
            <main className="container mx-auto px-4 py-16 max-w-2xl flex flex-col items-center">

                {/* 1. Daily Quote */}
                <DailyQuote />

                {/* 2. Universal Input (Auto-analyzes emotion & tools) */}
                <div className="w-full mt-12 mb-20">
                    <UniversalInput onEntryCreated={fetchRecent} />
                </div>

                {/* 3. Recent History (Mini Feed) */}
                {recentEntries.length > 0 && (
                    <div className="w-full border-t border-stone-200 pt-12 opacity-80">
                        <h3 className="text-xs uppercase tracking-widest text-stone-400 mb-8 text-center font-sans">
                            最近的回憶
                        </h3>
                        <div className="space-y-8">
                            {recentEntries.map(entry => (
                                <div key={entry.id} className="group relative pl-4 border-l-2 border-stone-200 hover:border-stone-400 transition-colors">
                                    <p className="text-stone-600 line-clamp-2 text-sm leading-relaxed mb-1">
                                        {entry.content}
                                    </p>
                                    <div className="flex gap-2 text-[10px] text-stone-400 uppercase tracking-wider font-sans">
                                        <span>{format(new Date(entry.createdAt), 'MM.dd')}</span>
                                        {entry.mood && <span>• {entry.mood}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
