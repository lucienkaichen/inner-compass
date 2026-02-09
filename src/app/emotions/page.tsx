
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/Header'
import { ArrowRight, PieChart } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getEmotionStats() {
    const entries = await prisma.entry.findMany({
        select: { mood: true, analysis: { select: { emotionTags: true } } }
    })

    const stats: Record<string, number> = {}

    entries.forEach(entry => {
        // Count main mood
        if (entry.mood) {
            stats[entry.mood] = (stats[entry.mood] || 0) + 1
        }

        // Count AI tags (optional, if we want mixed view)
        // For now, let's focus on primary Mood categories like the user asked
    })

    return Object.entries(stats).sort((a, b) => b[1] - a[1]) // Sort by count
}

export default async function EmotionsPage() {
    const emotionStats = await getEmotionStats()

    return (
        <div className="min-h-screen bg-slate-50">
            <Header />
            <main className="container mx-auto px-4 py-12 max-w-4xl">
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">情緒圖書館</h1>
                    <p className="text-slate-500">探索你的情緒光譜，建立專屬的應對策略。</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {emotionStats.length > 0 ? (
                        emotionStats.map(([mood, count]) => (
                            <Link href={`/emotions/${encodeURIComponent(mood)}`} key={mood}>
                                <div className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-indigo-100 transition-all cursor-pointer h-full flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <h2 className="text-xl font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                                                {mood}
                                            </h2>
                                            <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded-full">
                                                {count} 篇
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-500 mb-4">
                                            點擊查看關於「{mood}」的所有日記與專屬策略。
                                        </p>
                                    </div>
                                    <div className="flex items-center text-indigo-500 text-sm font-semibold mt-auto group-hover:translate-x-1 transition-transform">
                                        查看詳情 <ArrowRight size={16} className="ml-1" />
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center text-slate-400">
                            還沒有建立情緒檔案。去寫篇日記吧！
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
