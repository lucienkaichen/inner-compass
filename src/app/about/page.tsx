
import { Header } from '@/components/Header'

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-stone-50 text-stone-800 font-serif">
            <Header />
            <main className="container mx-auto px-4 py-12 max-w-2xl">
                <div className="mb-12 text-center">
                    <h1 className="text-3xl font-bold tracking-tight mb-4 text-stone-900">關於我</h1>
                    <p className="text-stone-500 italic font-serif">這是一份不斷生長的自我探索報告。</p>
                </div>

                <div className="bg-white p-8 md:p-12 shadow-sm border border-stone-100 rounded-sm leading-relaxed text-lg space-y-6">
                    <p className="text-stone-400 text-center">
                        還沒有生成分析報告。<br />
                        當你累積足夠的日記後，點擊下方按鈕，AI 將為你繪製心靈地圖。
                    </p>
                    {/* Trigger Button Placeholder */}
                    <div className="text-center pt-8">
                        <button className="px-6 py-2 border border-stone-300 text-stone-600 hover:bg-stone-50 hover:border-stone-400 transition-colors text-sm tracking-widest uppercase">
                            生成報告
                        </button>
                    </div>
                </div>
            </main>
        </div>
    )
}
