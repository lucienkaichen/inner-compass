
'use client'

import { useState } from 'react'
import { Send, Sparkles, Wand2 } from 'lucide-react'

export function UniversalInput({ onEntryCreated }: { onEntryCreated: () => void }) {
    const [content, setContent] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [aiReply, setAiReply] = useState<string | null>(null)

    const handleSubmit = async () => {
        if (!content.trim()) return
        setIsSubmitting(true)
        setAiReply(null)

        try {
            const res = await fetch('/api/entries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content })
            })

            if (res.ok) {
                const data = await res.json()
                setContent('')
                // If AI provides a reply, show it
                if (data.analysis?.aiReply) {
                    setAiReply(data.analysis.aiReply)
                }
                onEntryCreated()
            }
        } catch (error) {
            console.error('Failed to submit entry:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto w-full">
            {/* Input Area */}
            <div className="relative bg-white shadow-sm border border-stone-200 rounded-sm p-2 transition-shadow focus-within:ring-1 focus-within:ring-stone-300 focus-within:border-stone-400">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="寫下你的想法、情緒，或是剛剛發生的事..."
                    className="w-full h-40 p-4 text-lg font-serif text-stone-800 bg-transparent outline-none resize-none placeholder:text-stone-300 leading-relaxed"
                    disabled={isSubmitting}
                />
                <div className="flex justify-between items-center px-4 pb-2">
                    <span className="text-xs text-stone-300 font-sans tracking-widest uppercase">
                        {isSubmitting ? 'AI 正在聆聽...' : 'Inner Compass'}
                    </span>
                    <button
                        onClick={handleSubmit}
                        disabled={!content.trim() || isSubmitting}
                        className="p-2 rounded-full bg-stone-800 text-stone-50 hover:bg-stone-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        {isSubmitting ? (
                            <Sparkles size={18} className="animate-pulse" />
                        ) : (
                            <Send size={18} />
                        )}
                    </button>
                </div>
            </div>

            {/* AI Reply Section (Shows up after submission) */}
            {aiReply && (
                <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="bg-stone-50 border-l-2 border-stone-400 p-6 pl-8 relative">
                        <Wand2 size={16} className="absolute left-3 top-7 text-stone-400" />
                        <p className="font-serif text-lg leading-loose text-stone-700 whitespace-pre-wrap">
                            {aiReply}
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
