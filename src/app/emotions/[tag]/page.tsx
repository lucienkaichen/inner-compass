
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/Header'
import { EmotionStrategyCard } from '@/components/EmotionStrategyCard'
import { EntryList } from '@/components/EntryList'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getEmotionData(tag: string) {
    const decodedTag = decodeURIComponent(tag)

    // 1. Fetch entries with this specific mood
    // Note: AI emotionTags are JSON strings, so prisma filtering is hard.
    // For now, let's filter by primary "Mood" column as requested.
    const entries = await prisma.entry.findMany({
        where: { mood: decodedTag },
        orderBy: { createdAt: 'desc' },
        include: { analysis: true }
    })

    // 2. Fetch Personalized Strategy Guide
    const guide = await prisma.emotionGuide.findUnique({
        where: { emotion: decodedTag }
    })

    return { entries, guide, tagName: decodedTag }
}

export default async function EmotionDetailPage(
    props: { params: Promise<{ tag: string }> }
) {
    const params = await props.params;
    const { entries, guide, tagName } = await getEmotionData(params.tag)

    return (
        <div className="min-h-screen bg-slate-50">
            <Header />

            <main className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Back Link */}
                <Link href="/emotions" className="inline-flex items-center text-slate-400 hover:text-slate-600 mb-6 transition-colors font-medium text-sm">
                    <ArrowLeft size={16} className="mr-1" /> 回到情緒圖書館
                </Link>

                <div className="mb-8">
                    <h1 className="text-4xl font-extrabold text-slate-800 mb-2">
                        {tagName}
                    </h1>
                    <p className="text-slate-500 font-medium">
                        你在這裡留下了 {entries.length} 篇日記。
                    </p>
                </div>

                {/* 1. Personalized Strategy Guide (Editable) */}
                <div className="mb-12">
                    <EmotionStrategyCard
                        emotion={tagName}
                        initialStrategy={guide?.strategy || null}
                    />
                </div>

                {/* 2. Divider */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="h-px bg-slate-200 flex-1"></div>
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                        相關日記回顧
                    </span>
                    <div className="h-px bg-slate-200 flex-1"></div>
                </div>

                {/* 3. Filtered Entries */}
                <EntryList entries={entries.map(e => ({
                    ...e,
                    createdAt: e.createdAt.toISOString()
                }))} />
            </main>
        </div>
    )
}
