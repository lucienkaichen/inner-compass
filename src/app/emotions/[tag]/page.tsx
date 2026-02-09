
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/Header'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, BookOpen, Quote as QuoteIcon } from 'lucide-react'
import { format } from 'date-fns'

async function getEmotionData(tag: string) {
    const decodedTag = decodeURIComponent(tag)

    // Find guide
    const guide = await prisma.emotionGuide.findUnique({
        where: { emotion: decodedTag }
    })

    // Find entries with this primary mood
    // Future: Also search in emotionTags JSON
    const entries = await prisma.entry.findMany({
        where: { mood: decodedTag },
        orderBy: { createdAt: 'desc' },
        include: { analysis: true }
    })

    return { entries, guide, tagName: decodedTag }
}

export default async function EmotionDetailPage(
    props: { params: Promise<{ tag: string }> }
) {
    const params = await props.params;
    const { entries, guide, tagName } = await getEmotionData(params.tag)

    return (
        <div className="min-h-screen bg-stone-50 font-serif text-stone-800">
            <Header />
            <main className="container mx-auto px-4 py-12 max-w-4xl">
                {/* Back Button */}
                <Link href="/emotions" className="inline-flex items-center text-stone-400 hover:text-stone-800 transition-colors mb-8 text-sm uppercase tracking-widest font-bold">
                    <ArrowLeft size={16} className="mr-2" /> 返回圖書館
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left Column: Emotion Profile & Strategy */}
                    <div className="lg:col-span-1 space-y-8">
                        <div>
                            <h1 className="text-5xl font-bold tracking-tight mb-2 text-stone-900 border-b-4 border-stone-800 pb-2 inline-block">
                                {tagName}
                            </h1>
                            <p className="text-stone-500 text-sm mt-4 font-serif italic">
                                共收錄 {entries.length} 篇日記
                            </p>
                        </div>

                        {/* Strategy Card Placeholder - Will implement interactive component later */}
                        <div className="bg-white p-6 border border-stone-200 shadow-sm rounded-sm relative group">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <BookOpen size={64} />
                            </div>
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-stone-800">
                                <span className="w-1 h-6 bg-stone-800 block"></span>
                                應對手冊
                            </h3>
                            <div className="prose prose-stone prose-sm font-serif leading-relaxed text-stone-600">
                                {guide?.strategy ? (
                                    <p className="whitespace-pre-wrap">{guide.strategy}</p>
                                ) : (
                                    <p className="italic text-stone-400">尚未建立此情緒的應對策略。</p>
                                )}
                            </div>
                            <button className="mt-6 w-full py-2 border border-stone-300 text-stone-500 hover:bg-stone-50 hover:text-stone-800 transition-colors text-xs uppercase tracking-widest font-bold">
                                編輯手冊
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Entry Timeline */}
                    <div className="lg:col-span-2 space-y-8">
                        <h2 className="text-xl font-bold mb-6 flex items-center text-stone-800 border-b border-stone-200 pb-4">
                            歷史軌跡
                        </h2>

                        {entries.length > 0 ? (
                            <div className="space-y-8 relative before:absolute before:left-4 before:top-0 before:bottom-0 before:w-px before:bg-stone-200">
                                {entries.map((entry) => (
                                    <div key={entry.id} className="relative pl-12 group">
                                        {/* Timeline Dot */}
                                        <div className="absolute left-[13px] top-6 w-2 h-2 bg-stone-300 rounded-full border-2 border-stone-50 group-hover:bg-stone-800 group-hover:scale-125 transition-all z-10"></div>

                                        <div className="bg-white p-6 border border-stone-100 shadow-sm rounded-sm hover:border-stone-300 transition-colors relative">
                                            <div className="absolute -left-[5px] top-6 w-3 h-3 bg-white rotate-45 border-l border-b border-stone-100 group-hover:border-stone-300 transition-colors"></div>

                                            <div className="flex justify-between items-baseline mb-3">
                                                <time className="text-xs font-bold text-stone-400 uppercase tracking-widest">
                                                    {format(new Date(entry.createdAt), 'yyyy.MM.dd')}
                                                </time>
                                            </div>

                                            <p className="text-stone-700 leading-relaxed font-serif text-lg mb-4">
                                                {entry.content}
                                            </p>

                                            {entry.analysis?.summary && (
                                                <div className="bg-stone-50 p-4 border-l-2 border-stone-300 italic text-stone-600 text-sm">
                                                    <QuoteIcon size={14} className="inline mr-2 text-stone-400 mb-1" />
                                                    {entry.analysis.summary}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-stone-400 italic">
                                暫無紀錄。
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
