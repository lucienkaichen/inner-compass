
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/Header'
import { ArrowRight, Tag } from 'lucide-react'

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic'

async function getEmotionStats() {
    // Correct Prisma Query: entries include analysis, then we parse locally
    const entries = await prisma.entry.findMany({
        select: {
            mood: true,
            analysis: { select: { emotionTags: true } }
        }
    })

    const stats: Record<string, number> = {}

    entries.forEach(entry => {
        // Count main mood
        if (entry.mood) {
            stats[entry.mood] = (stats[entry.mood] || 0) + 1
        }
        // Future: Mix in AI tags
    })

    // Sort by count descending
    return Object.entries(stats).sort((a, b) => b[1] - a[1])
}

export default async function EmotionsPage() {
    const emotionStats = await getEmotionStats()

    return (
        <div className="min-h-screen bg-stone-50 font-serif text-stone-800">
            <Header />
            <main className="container mx-auto px-4 py-12 max-w-4xl">
                <div className="mb-12 text-center md:text-left border-b border-stone-200 pb-8">
                    <h1 className="text-4xl font-bold tracking-tight mb-4 text-stone-900">情緒圖書館</h1>
                    <p className="text-stone-500 text-lg italic font-serif leading-relaxed">
                        每一種情緒都是一位信使，攜帶者關於你內在需求的重要訊息。<br />
                        在這裡，我們不評判，只閱讀。
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {emotionStats.length > 0 ? (
                        emotionStats.map(([mood, count]) => (
                            <Link href={`/emotions/${encodeURIComponent(mood)}`} key={mood} className="group block h-full">
                                <div className="bg-white p-6 rounded-sm shadow-sm border border-stone-200 hover:shadow-md hover:border-stone-400 transition-all cursor-pointer h-full flex flex-col justify-between relative overflow-hidden">
                                    {/* Decorative background element */}
                                    <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <Tag size={120} />
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-start mb-4 relative z-10">
                                            <h2 className="text-2xl font-bold text-stone-800 group-hover:text-stone-600 transition-colors">
                                                {mood}
                                            </h2>
                                            <span className="bg-stone-100 text-stone-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-stone-200">
                                                {count} 篇
                                            </span>
                                        </div>
                                        <p className="text-sm text-stone-500 mb-6 font-serif line-clamp-3 leading-relaxed relative z-10">
                                            點擊深入探索關於「{mood}」的歷史紀錄與專屬應對策略...
                                        </p>
                                    </div>
                                    <div className="flex items-center text-stone-400 text-xs font-bold uppercase tracking-widest mt-auto group-hover:translate-x-2 transition-transform relative z-10">
                                        閱讀檔案 <ArrowRight size={14} className="ml-2" />
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-full py-24 text-center border-2 border-dashed border-stone-200 rounded-sm">
                            <p className="text-stone-400 mb-4 text-lg">圖書館目前是空的。</p>
                            <Link href="/" className="inline-block px-6 py-3 bg-stone-800 text-stone-50 text-sm font-bold tracking-widest uppercase hover:bg-stone-700 transition-colors">
                                寫下第一篇日記
                            </Link>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
