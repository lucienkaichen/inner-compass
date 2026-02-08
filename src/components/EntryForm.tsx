
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, Laugh, Frown, Meh, AlertCircle, Zap } from 'lucide-react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

const MOODS = [
    { label: 'Happy', icon: Laugh, color: 'text-emerald-500', bg: 'bg-emerald-50 hover:bg-emerald-100 ring-emerald-200' },
    { label: 'Sad', icon: Frown, color: 'text-blue-500', bg: 'bg-blue-50 hover:bg-blue-100 ring-blue-200' },
    { label: 'Anxious', icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50 hover:bg-amber-100 ring-amber-200' },
    { label: 'Angry', icon: Zap, color: 'text-rose-500', bg: 'bg-rose-50 hover:bg-rose-100 ring-rose-200' },
    { label: 'Neutral', icon: Meh, color: 'text-slate-500', bg: 'bg-slate-50 hover:bg-slate-100 ring-slate-200' },
]

export function EntryForm() {
    const router = useRouter()
    const [content, setContent] = useState('')
    const [mood, setMood] = useState<string | null>(null)
    const [tags, setTags] = useState<string[]>([])
    const [tagInput, setTagInput] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleAddTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault()
            if (!tags.includes(tagInput.trim())) {
                setTags([...tags, tagInput.trim()])
            }
            setTagInput('')
        }
    }

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!content.trim()) return

        setIsSubmitting(true)
        try {
            const res = await fetch('/api/entries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, mood, tags }),
            })

            if (res.ok) {
                setContent('')
                setMood(null)
                setTags([])
                router.refresh()
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="w-full max-w-2xl mx-auto bg-white/70 backdrop-blur-md rounded-2xl shadow-xl shadow-indigo-100/50 border border-white/50 p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">How are you feeling right now?</label>
                    <div className="flex flex-wrap gap-3">
                        {MOODS.map((m) => {
                            const Icon = m.icon
                            const isSelected = mood === m.label
                            return (
                                <button
                                    key={m.label}
                                    type="button"
                                    onClick={() => setMood(isSelected ? null : m.label)}
                                    className={clsx(
                                        "flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 border",
                                        isSelected
                                            ? `ring-2 ring-offset-1 ${m.bg} border-transparent shadow-sm`
                                            : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm text-slate-600"
                                    )}
                                >
                                    <Icon size={18} className={clsx(isSelected ? m.color : "text-slate-400")} />
                                    <span className={clsx("text-sm font-medium", isSelected ? "text-slate-900" : "text-slate-600")}>{m.label}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">What's on your mind?</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full h-40 p-4 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all resize-none placeholder:text-slate-400 text-slate-700 leading-relaxed shadow-inner"
                        placeholder="Pour your thoughts out here... (e.g., 'I felt overwhelmed during the meeting because...')"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Tags (Press Enter)</label>
                    <div className="flex flex-wrap gap-2 p-2 min-h-[42px] rounded-xl border border-slate-200 bg-white/50 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-400 transition-all">
                        {tags.map(tag => (
                            <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium animate-in fade-in zoom-in duration-200">
                                #{tag}
                                <button type="button" onClick={() => removeTag(tag)} className="hover:text-indigo-900 transition-colors">
                                    <X size={12} />
                                </button>
                            </span>
                        ))}
                        <input
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleAddTag}
                            placeholder={tags.length === 0 ? "Add tags like 'Work', 'Family'..." : ""}
                            className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-slate-400 min-w-[120px]"
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <button
                        type="submit"
                        disabled={!content.trim() || isSubmitting}
                        className="group relative inline-flex items-center justify-center px-8 py-3 font-semibold text-white transition-all duration-200 bg-indigo-600 rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5"
                    >
                        {isSubmitting ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        ) : (
                            <Plus size={18} className="mr-2 group-hover:rotate-90 transition-transform duration-300" />
                        )}
                        <span>Save Entry</span>
                    </button>
                </div>
            </form>
        </div>
    )
}
