
'use client'

import { useState, useEffect } from 'react'
import { Save, Check } from 'lucide-react'
import { Header } from '@/components/Header'

export default function SettingsPage() {
    const [persona, setPersona] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    useEffect(() => {
        // Load initial settings
        fetch('/api/settings').then(res => res.json()).then(data => {
            if (data.aiPersona) setPersona(data.aiPersona)
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

    return (
        <div className="min-h-screen bg-stone-50 text-stone-800 font-serif">
            <Header />
            <main className="container mx-auto px-4 py-12 max-w-2xl">
                <div className="mb-12">
                    <h1 className="text-3xl font-bold tracking-tight mb-4 text-stone-900 border-b border-stone-200 pb-4">設定</h1>
                </div>

                {/* AI Persona (Functional) */}
                <section className="mb-12">
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
                        placeholder="請輸入你的指令..."
                    ></textarea>
                </section>

                {/* Quotes Management (New Feature) */}
                <section className="mb-12">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-stone-800 rounded-full inline-block"></span>
                        首頁語錄管理
                    </h2>
                    <p className="text-stone-500 mb-4 text-sm font-serif italic">
                        新增你喜歡的句子，將會輪播顯示在首頁。
                    </p>
                    <div className="bg-white border border-stone-200 divide-y divide-stone-100 rounded-sm shadow-sm">
                        <div className="p-4 text-stone-400 text-center text-sm py-8">
                            暫無語錄。點擊新增。
                        </div>
                        <div className="bg-stone-50 p-3 text-center cursor-pointer hover:bg-stone-100 transition-colors text-stone-600 uppercase text-xs tracking-widest font-bold">
                            + 新增語錄
                        </div>
                    </div>
                </section>

                {/* System Settings */}
                <section className="opacity-50 pointer-events-none">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-stone-300 rounded-full inline-block"></span>
                        系統 (開發中)
                    </h2>
                    <div className="space-y-4 text-stone-400">
                        <label className="flex items-center gap-3">
                            <input type="checkbox" disabled /> 深色模式 (自動)
                        </label>
                        <button className="text-xs uppercase tracking-widest border border-stone-200 px-3 py-1">匯出所有資料 (JSON)</button>
                    </div>
                </section>

            </main>
        </div>
    )
}
