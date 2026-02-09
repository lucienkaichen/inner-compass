
import { Header } from '@/components/Header'

export default function ToolboxPage() {
    return (
        <div className="min-h-screen bg-stone-50 text-stone-800 font-serif">
            <Header />
            <main className="container mx-auto px-4 py-12 max-w-4xl">
                <div className="mb-12 text-center">
                    <h1 className="text-3xl font-bold tracking-tight mb-4 text-stone-900">心理急救箱</h1>
                    <p className="text-stone-500 italic font-serif">收集那些讓你感到平靜、快樂的時刻。</p>
                </div>

                {/* Tools Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white p-6 border border-stone-200 shadow-sm rounded-sm hover:shadow-md transition-shadow group cursor-pointer relative">
                        <span className="absolute top-4 right-4 text-stone-300 text-xs uppercase tracking-widest font-sans">AI 建議</span>
                        <h3 className="text-xl font-bold mb-3 text-stone-800 group-hover:text-stone-600 transition-colors">自我慈悲書寫</h3>
                        <p className="text-stone-600 line-clamp-3 text-sm leading-relaxed">
                            給自己寫一封信，像是給最好的朋友那樣溫柔。不需要批判，只需要陪伴。
                        </p>
                    </div>

                    {/* Add Tool Card (Interactive Placeholder) */}
                    <div className="border-2 border-dashed border-stone-200 flex flex-col items-center justify-center p-6 text-stone-400 hover:text-stone-600 hover:border-stone-300 transition-colors cursor-pointer min-h-[160px]">
                        <span className="text-2xl mb-2">+</span>
                        <span className="text-sm tracking-widest uppercase">新增工具</span>
                    </div>
                </div>
            </main>
        </div>
    )
}
