
'use client'

import { useState, useEffect } from 'react'
import { Save, Check, Plus, Trash2, BookOpen } from 'lucide-react'
import { Header } from '@/components/Header'

export default function SettingsPage() {
    const [persona, setPersona] = useState('')
    const [apiKey, setApiKey] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [isSavingKey, setIsSavingKey] = useState(false)
    const [savedKey, setSavedKey] = useState(false)

    useEffect(() => {
        // Load initial settings
        fetch('/api/settings').then(res => res.json()).then(data => {
            if (data.aiPersona) setPersona(data.aiPersona)
            if (data.geminiApiKey) setApiKey(data.geminiApiKey)
        })
    }, [])

    const handleSavePersona = async () => {
        setIsSaving(true)
        setSaved(false)
        try {
            await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ aiPersona: persona })
            })
            setSaved(true)
            setTimeout(() => setSaved(false), 2000)
        } catch (e) {
            console.error(e)
        } finally {
            setIsSaving(false)
        }
    }

    const handleSaveApiKey = async () => {
        setIsSavingKey(true)
        setSavedKey(false)
        try {
            await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ geminiApiKey: apiKey })
            })
            setSavedKey(true)
            setTimeout(() => setSavedKey(false), 2000)
        } catch (e) {
            console.error(e)
        } finally {
            setIsSavingKey(false)
        }
    }

    return (
        <div className="min-h-screen bg-stone-50 text-stone-800 font-serif">
            <Header />
            <main className="container mx-auto px-4 py-12 max-w-2xl">
                <div className="mb-12">
                    <h1 className="text-3xl font-bold tracking-tight mb-4 text-stone-900 border-b border-stone-200 pb-4">設定</h1>
                </div>

                {/* AI Persona */}
                <section className="mb-12 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <span className="w-2 h-2 bg-stone-800 rounded-full inline-block"></span>
                            AI 回應風格 (樹洞的人格)
                        </h2>
                        <button
                            onClick={handleSavePersona}
                            disabled={isSaving}
                            className={`flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-bold uppercase tracking-widest transition-all ${saved ? 'bg-green-100 text-green-700' : 'bg-stone-800 text-stone-50 hover:bg-stone-700'}`}
                        >
                            {saved ? <Check size={16} /> : <Save size={16} />}
                            {saved ? '已儲存' : isSaving ? '儲存中...' : '儲存設定'}
                        </button>
                    </div>

                    <p className="text-stone-500 mb-4 text-sm font-serif italic">
                        你可以告訴樹洞該如何陪伴你。例如：「請時時提醒我『允許』自己悲傷」、「請用溫柔堅定的語氣」、「不要說教」。
                    </p>
                    <textarea
                        value={persona}
                        onChange={(e) => setPersona(e.target.value)}
                        className="w-full bg-white border border-stone-200 p-4 rounded-sm shadow-sm font-serif text-stone-700 outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-200 resize-none h-40 leading-relaxed"
                    ></textarea>
                </section>

                {/* API Key (Urgent BYOK) */}
                <section className="mb-12 animate-in fade-in slide-in-from-bottom-3 delay-75">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <span className="w-2 h-2 bg-red-500 rounded-full inline-block"></span>
                            API 金鑰設定 (修復連線問題)
                        </h2>
                    </div>

                    <p className="text-stone-500 mb-4 text-sm font-serif italic">
                        如果 Vercel 的額度用完或 Key 失效，請在此輸入你自己申请的 Google Gemini API Key。
                        <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-blue-600 underline ml-1">前往取得 Key</a>
                    </p>
                    <div className="flex gap-2">
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            className="w-full bg-white border border-stone-200 p-4 rounded-sm shadow-sm font-sans text-stone-700 outline-none focus:border-stone-400"
                            placeholder="貼上你的 API Key (AIzaSy...)"
                        />
                        <button
                            onClick={handleSaveApiKey}
                            disabled={isSavingKey}
                            className={`flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-bold uppercase tracking-widest transition-all whitespace-nowrap ${savedKey ? 'bg-green-100 text-green-700' : 'bg-stone-800 text-stone-50 hover:bg-stone-700'}`}
                        >
                            {savedKey ? <Check size={16} /> : <Save size={16} />}
                            {savedKey ? '已儲存' : isSavingKey ? '...' : '更新 Key'}
                        </button>
                    </div>
                </section>

                {/* Quote Manager */}
                <section className="mb-12 animate-in fade-in slide-in-from-bottom-4 delay-100">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <span className="w-2 h-2 bg-stone-800 rounded-full inline-block"></span>
                            每日語錄庫
                        </h2>
                    </div>

                    <p className="text-stone-500 mb-6 text-sm font-serif italic">
                        這些語錄不需什麼大道理，只要是你看了會心一笑，或是能平靜下來的句子就好。
                    </p>

                    <QuoteManager />
                </section>
            </main>
        </div>
    )
}

function QuoteManager() {
    const [quotes, setQuotes] = useState<any[]>([])
    const [content, setContent] = useState('')
    const [author, setAuthor] = useState('')
    const [isAdding, setIsAdding] = useState(false)

    useEffect(() => {
        fetch('/api/quotes').then(res => res.json()).then(setQuotes)
    }, [])

    const handleAdd = async () => {
        if (!content) return
        setIsAdding(true)
        const res = await fetch('/api/quotes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content, author })
        })
        if (res.ok) {
            const newQuote = await res.json()
            setQuotes([newQuote, ...quotes])
            setContent('')
            setAuthor('')
        }
        setIsAdding(false)
    }

    const handleDelete = async (id: number) => {
        if (!confirm('確定刪除這句語錄嗎？')) return
        await fetch(`/api/quotes?id=${id}`, { method: 'DELETE' })
        setQuotes(quotes.filter(q => q.id !== id))
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-2">
                <input
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="輸入一句話... (例如：允許一切發生)"
                    className="flex-1 p-3 border border-stone-200 rounded-sm text-sm outline-none focus:border-stone-400 bg-white"
                />
                <button
                    onClick={handleAdd}
                    disabled={isAdding || !content}
                    className="px-4 py-3 bg-stone-800 text-stone-50 text-sm font-bold uppercase tracking-widest hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
                >
                    <Plus size={16} />
                    {isAdding ? '...' : '新增'}
                </button>
            </div>

            <div className="space-y-3">
                {quotes.map(q => (
                    <div key={q.id} className="flex justify-between items-start p-4 bg-white border border-stone-100 shadow-sm group hover:border-stone-300 transition-colors">
                        <div>
                            <p className="text-stone-800 font-serif text-base mb-1 leading-relaxed">
                                <BookOpen size={12} className="inline mr-2 text-stone-300" />
                                {q.content}
                            </p>
                        </div>
                        <button
                            onClick={() => handleDelete(q.id)}
                            className="text-stone-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}

                {quotes.length === 0 && (
                    <div className="text-center py-10 border-2 border-dashed border-stone-100 rounded-sm">
                        <p className="text-stone-300 text-sm font-serif italic">還沒有語錄，新增第一句吧。</p>
                    </div>
                )}
            </div>
        </div>
    )
}
