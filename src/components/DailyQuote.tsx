
'use client'

import { useState, useEffect } from 'react'

export function DailyQuote() {
    const [quote, setQuote] = useState({ content: "允許一切發生。", source: "未知" })

    useEffect(() => {
        fetch('/api/quotes')
            .then(res => res.json())
            .then(data => {
                if (data && data.length > 0) {
                    // Pick random
                    const random = data[Math.floor(Math.random() * data.length)]
                    setQuote(random)
                }
            })
            .catch(e => console.error(e))
    }, [])

    return (
        <div className="w-full text-center py-6 border-b border-stone-200 mb-8 max-w-lg mx-auto">
            <p className="text-xl md:text-2xl font-serif text-stone-700 leading-relaxed italic mb-3">
                「{quote.content}」
            </p>
        </div>
    )
}
