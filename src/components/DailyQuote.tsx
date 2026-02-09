
'use client'

import { useState, useEffect } from 'react'

export function DailyQuote() {
    const [quote, setQuote] = useState("情緒不是問題，而是被問題所困的情緒。")
    const [author, setAuthor] = useState("心理學家")

    // Future: Fetch from API (/api/quotes/random)
    // useEffect(() => { ... }, [])

    return (
        <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-2xl md:text-3xl font-serif text-stone-800 tracking-tight leading-relaxed select-text">
                「{quote}」
            </h2>
            <p className="mt-4 text-xs font-sans tracking-widest uppercase text-stone-400">
                — {author}
            </p>
        </div>
    )
}
